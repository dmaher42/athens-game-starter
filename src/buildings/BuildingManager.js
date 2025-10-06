import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class BuildingManager {
  /**
   * @param {import('../env/EnvironmentCollider.js').EnvironmentCollider} envCollider
   */
  constructor(envCollider) {
    this.envCollider = envCollider;
    this.loader = new GLTFLoader();
  }

  /**
   * @param {string} url
   * @param {{ position?: THREE.Vector3, scale?: number, rotateY?: number, collision?: boolean }} [options]
   */
  async loadBuilding(url, options) {
    const gltf = await this.loader.loadAsync(url);
    const obj = gltf.scene;
    if (options?.scale) obj.scale.setScalar(options.scale);
    if (options?.rotateY) obj.rotation.y = options.rotateY;
    if (options?.position) obj.position.copy(options.position);

    const parent = this.envCollider.mesh.parent;
    if (parent) {
      parent.add(obj);
    } else {
      console.warn(
        "EnvironmentCollider mesh has no parent; building was loaded without being attached to the scene graph."
      );
    }

    if (options?.collision) {
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
}

export default BuildingManager;
