import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Reuse a single loader instance so we don't repeatedly allocate it whenever we
// load a new landmark. GLTFLoader understands the .glb format which packages a
// model and all of its textures into one binary file.
const loader = new GLTFLoader();

// Keep track of everything we add to the world so we can tear it all down later
// when the player leaves the area or reloads the scene.
const trackedLandmarks = new Set();

function applyTransform(object, options) {
  const { position, rotation, scale } = options;

  if (position) {
    object.position.set(position.x ?? position[0] ?? 0, position.y ?? position[1] ?? 0, position.z ?? position[2] ?? 0);
  }

  if (rotation) {
    object.rotation.set(
      rotation.x ?? rotation[0] ?? 0,
      rotation.y ?? rotation[1] ?? 0,
      rotation.z ?? rotation[2] ?? 0
    );
  }

  if (scale !== undefined) {
    if (typeof scale === "number") {
      object.scale.set(scale, scale, scale);
    } else {
      const sx = scale.x ?? scale[0] ?? 1;
      const sy = scale.y ?? scale[1] ?? sx;
      const sz = scale.z ?? scale[2] ?? sx;
      object.scale.set(sx, sy, sz);
    }
  }
}

function disposeObject(object, scene) {
  if (!object) return;
  if (scene) {
    scene.remove(object);
  }

  object.traverse?.((child) => {
    if (child.isMesh) {
      child.geometry?.dispose?.();
      if (Array.isArray(child.material)) {
        for (const material of child.material) {
          material?.dispose?.();
        }
      } else {
        child.material?.dispose?.();
      }
    }
  });
}

function removePlaceholder(entry) {
  const { placeholder, scene } = entry;
  if (!placeholder) return;

  if (scene) {
    scene.remove(placeholder);
  }
  placeholder.geometry?.dispose?.();
  placeholder.material?.dispose?.();
  entry.placeholder = null;
}

/**
 * Load a landmark model and keep track of it so we can dispose everything later.
 * We immediately add a placeholder mesh to the scene so players get instant
 * feedback while the real asset streams in. Once the GLB arrives we swap the
 * placeholder for the actual model.
 */
export async function loadLandmark(scene, url, options = {}) {
  const placeholderGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const placeholderMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    emissive: new THREE.Color(0x6666ff),
    transparent: true,
    opacity: 0.6,
  });
  const placeholder = new THREE.Mesh(placeholderGeometry, placeholderMaterial);
  placeholder.name = "LandmarkPlaceholder";

  applyTransform(placeholder, { position: options.position });

  // Beginners tip: showing a simple glowing box makes it obvious to the player
  // that something will appear here soon. It also gives feedback while large
  // downloads are still happening in the background.
  scene.add(placeholder);

  const entry = { scene, url, placeholder, object: null };
  trackedLandmarks.add(entry);

  try {
    const gltf = await loader.loadAsync(url);
    const root = gltf.scene || gltf.scenes?.[0];
    if (!root) {
      throw new Error(`GLB at ${url} did not contain a scene`);
    }

    applyTransform(root, options);
    removePlaceholder(entry);

    if (entry.disposed) {
      disposeObject(root);
      trackedLandmarks.delete(entry);
      return null;
    }

    root.userData = root.userData || {};
    root.userData.interactable = root.userData.interactable ?? true;
    if (typeof root.userData.onUse !== "function") {
      root.userData.onUse = () => {
        const label = root.name || url;
        console.log("Used", label);
      };
    }

    scene.add(root);
    entry.object = root;

    return root;
  } catch (error) {
    removePlaceholder(entry);
    trackedLandmarks.delete(entry);
    throw error;
  }
}

/**
 * Remove every landmark and placeholder we created. This is handy when
 * switching levels or resetting the world during development.
 */
export function disposeLandmarks() {
  for (const entry of trackedLandmarks) {
    entry.disposed = true;
    disposeObject(entry.object, entry.scene);
    removePlaceholder(entry);
  }
  trackedLandmarks.clear();
}
