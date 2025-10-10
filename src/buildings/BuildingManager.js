import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const BUILDINGS_ROOT_NAME = 'BuildingsRoot';

/**
 * Check if a URL returns a valid response (not HTML).
 * Prevents loading HTML fallback pages as GLB files.
 */
async function headOk(url) {
  if (!url) return false;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (!res.ok) return false;
    const contentType = res.headers.get('content-type') || '';
    return !contentType.toLowerCase().includes('text/html');
  } catch {
    return false;
  }
}

function disposeMaterial(material) {
  if (!material) return;
  if (Array.isArray(material)) {
    for (const mat of material) disposeMaterial(mat);
    return;
  }
  if (typeof material.dispose === 'function') {
    material.dispose();
  }
}

function disposeObject(object) {
  if (!object) return;
  object.traverse?.((child) => {
    if (child.isMesh) {
      child.geometry?.dispose?.();
      disposeMaterial(child.material);
    }
  });
}

export class BuildingManager {
  /**
   * @param {import('../env/EnvironmentCollider.js').EnvironmentCollider} envCollider
   */
  constructor(envCollider) {
    this.envCollider = envCollider;
    this.loader = new GLTFLoader();
    this.rootGroup = null;
  }

  /**
   * @param {string} url
   * @param {{
   *   position?: THREE.Vector3,
   *   scale?: number,
   *   rotateY?: number,
   *   collision?: boolean,
   *   parent?: THREE.Object3D,
   *   heightSampler?: (x: number, z: number) => number,
   *   terrainSampler?: (x: number, z: number) => number,
   *   terrain?: THREE.Object3D,
   * }} [options]
   */
  async loadBuilding(url, options) {
    // Check if the file exists before attempting to load it
    // This prevents trying to parse HTML 404 pages as GLB files
    if (!(await headOk(url))) {
      throw new Error(`Building file not found or not accessible: ${url}`);
    }
    
    const gltf = await this.loader.loadAsync(url);
    const obj = gltf.scene;
    const opts = options ?? {};
    if (opts.scale !== undefined) obj.scale.setScalar(opts.scale);
    if (opts.rotateY !== undefined) obj.rotation.y = opts.rotateY;
    if (opts.position) obj.position.copy(opts.position);

    const sampler = this.#resolveHeightSampler(opts);
    if (opts.position) {
      const { x, z } = obj.position;
      let desiredY = obj.position.y;
      if (typeof sampler === 'function') {
        const sampled = sampler(x, z);
        if (Number.isFinite(sampled)) {
          desiredY = Number.isFinite(opts.position.y)
            ? Math.max(opts.position.y, sampled + 0.05)
            : sampled + 0.05;
        } else if (Number.isFinite(opts.position.y)) {
          desiredY = opts.position.y;
        } else if (!Number.isFinite(desiredY)) {
          desiredY = 0.05;
        }
      } else if (Number.isFinite(opts.position.y)) {
        desiredY = opts.position.y;
      } else if (!Number.isFinite(desiredY)) {
        desiredY = 0.05;
      }
      obj.position.set(x, desiredY ?? 0.05, z);
    }

    const parent = this.#resolveParent(opts);
    if (parent) {
      parent.add(obj);
    } else {
      const fallbackParent = this.envCollider?.mesh?.parent;
      if (fallbackParent) {
        fallbackParent.add(obj);
      } else {
        console.warn(
          "EnvironmentCollider mesh has no parent; building was loaded without being attached to the scene graph."
        );
      }
    }

    if (opts?.collision) {
      obj.traverse((child) => {
        if (child.isMesh) {
          child.userData.noCollision = false;
        }
      });
      this.envCollider.refresh();
    } else {
      obj.traverse((child) => {
        if (child.isMesh) {
          child.userData.noCollision = true;
        }
      });
    }

    return obj;
  }

  clearBuildings() {
    const scene = this.#getScene();
    const target = this.rootGroup ?? scene?.getObjectByName(BUILDINGS_ROOT_NAME);
    if (!target) return;

    disposeObject(target);
    target.parent?.remove(target);
    this.rootGroup = null;

    if (typeof this.envCollider?.refresh === 'function') {
      this.envCollider.refresh();
    }
  }

  #getScene() {
    return this.envCollider?.mesh?.parent ?? null;
  }

  #resolveParent(options) {
    if (options?.parent) {
      this.rootGroup = options.parent;
      if (!this.rootGroup.name) {
        this.rootGroup.name = BUILDINGS_ROOT_NAME;
      }
      return options.parent;
    }

    if (this.rootGroup && this.rootGroup.parent) {
      return this.rootGroup;
    }

    const scene = this.#getScene();
    if (!scene) return null;

    let root = scene.getObjectByName(BUILDINGS_ROOT_NAME);
    if (!root) {
      root = new THREE.Group();
      root.name = BUILDINGS_ROOT_NAME;
      scene.add(root);
    }
    this.rootGroup = root;
    return root;
  }

  #resolveHeightSampler(options) {
    const candidates = [
      options?.heightSampler,
      options?.terrainSampler,
      options?.terrain?.userData?.getHeightAt,
    ];

    const scene = this.#getScene();
    if (scene?.userData) {
      const { userData } = scene;
      candidates.push(
        userData.heightSampler,
        userData.terrainSampler,
        userData.terrainHeightSampler,
        userData.getHeightAt
      );

      const terrain = userData.terrain;
      if (terrain?.userData?.getHeightAt) {
        candidates.push(terrain.userData.getHeightAt);
      }
    }

    for (const candidate of candidates) {
      if (typeof candidate === 'function') {
        return candidate;
      }
    }

    return null;
  }
}

export default BuildingManager;
