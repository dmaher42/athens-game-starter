import * as THREE from "three";

/**
 * Create a simple helper that lets us cast rays from the camera into the scene.
 * Raycasters are how we "pick" objects in three.js – we shoot an invisible ray
 * and see what it hits first. Beginners can imagine it like a laser pointer.
 *
 * @param {THREE.WebGLRenderer} renderer - The renderer so we can read the canvas size.
 * @param {THREE.Camera} camera - The active camera that defines the view.
 * @param {THREE.Scene} scene - The scene graph containing objects to test against.
 * @returns {{
 *   raycaster: THREE.Raycaster,
 *   mouse: THREE.Vector2,
 *   pickObject: (screenX: number, screenY: number) => THREE.Intersection | null,
 *   pickCenter: () => THREE.Intersection | null,
 *   updateHover: () => THREE.Object3D | null,
 *   clearHover: () => void,
 *   getCurrentHover: () => THREE.Object3D | null,
 *   useObject: () => void,
 * }}
 */
export function createInteractor(renderer, camera, scene) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const HOVER_COLOR = 0x222244;
  const storedMaterialState = new Map();
  let currentHover = null;

  /**
   * Because `userData` is just a plain JavaScript object, we can attach custom
   * metadata to any mesh. Here we look for a boolean flag that marks an object
   * as interactable and optional callbacks to run when it is used.
   *
   * @param {THREE.Object3D | null} object
   * @returns {THREE.Object3D | null}
   */
  function findInteractable(object) {
    let node = object;
    while (node) {
      if (node.userData && node.userData.interactable) {
        return node;
      }
      node = node.parent;
    }
    return null;
  }

  /**
   * Helper that gathers all materials on the object (meshes may have an array).
   * @param {THREE.Object3D} object
   * @returns {THREE.Material[]}
   */
  function getMaterials(object) {
    if (!object || !object.material) return [];
    return Array.isArray(object.material) ? object.material : [object.material];
  }

  function getHighlightTarget(object) {
    if (!object) return object;
    const target = object.userData?.highlightTarget;
    return target || object;
  }

  /**
   * Restore material colors/emissive values for the previously hovered object.
   */
  function clearHover() {
    if (!currentHover) return;
    const target = getHighlightTarget(currentHover);
    for (const material of getMaterials(target)) {
      if (!material || !storedMaterialState.has(material)) continue;
      const stored = storedMaterialState.get(material);
      if (material.emissive && stored.emissive) {
        material.emissive.copy(stored.emissive);
      }
      if (material.color && stored.color) {
        material.color.copy(stored.color);
      }
      storedMaterialState.delete(material);
    }
    currentHover = null;
  }

  /**
   * Apply a subtle highlight to the hovered object. We try to tint the
   * emissive channel for PBR materials, otherwise fall back to the base color.
   * The highlight feedback tells the player what they can interact with.
   *
   * @param {THREE.Object3D} object
   */
  function applyHighlight(object) {
    const target = getHighlightTarget(object);
    for (const material of getMaterials(target)) {
      if (!material) continue;

      if (!storedMaterialState.has(material)) {
        storedMaterialState.set(material, {
          emissive: material.emissive ? material.emissive.clone() : null,
          color: material.color ? material.color.clone() : null,
        });
      }

      if (material.emissive) {
        material.emissive.setHex(HOVER_COLOR);
      } else if (material.color) {
        material.color.offsetHSL(0, 0, 0.2);
      }
    }

    currentHover = object;
  }

  /**
   * Convert a screen-space coordinate to normalized device coordinates (NDC)
   * and cast a ray to find the closest intersected object. Raycasters only hit
   * meshes that are in the scene graph and visible to the camera, so hidden or
   * culled objects are naturally ignored.
   *
   * @param {number} screenX - Pixel X coordinate relative to the canvas.
   * @param {number} screenY - Pixel Y coordinate relative to the canvas.
   * @returns {THREE.Intersection | null}
   */
  function pickObject(screenX, screenY) {
    const width = renderer.domElement.clientWidth;
    const height = renderer.domElement.clientHeight;
    if (width === 0 || height === 0) return null;

    const xNdc = (screenX / width) * 2 - 1;
    const yNdc = -(screenY / height) * 2 + 1;

    mouse.set(xNdc, yNdc);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    return intersects.length > 0 ? intersects[0] : null;
  }

  /**
   * Convenience for casting a ray straight through the center of the screen.
   * This is perfect for a first-person "crosshair" style interaction.
   *
   * @returns {THREE.Intersection | null}
   */
  function pickCenter() {
    mouse.set(0, 0);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    return intersects.length > 0 ? intersects[0] : null;
  }

  function updateHover() {
    const hit = pickCenter();
    const target = hit ? findInteractable(hit.object) : null;

    if (!target) {
      clearHover();
      return null;
    }

    if (target === currentHover) {
      return currentHover;
    }

    clearHover();
    applyHighlight(target);
    return currentHover;
  }

  function getCurrentHover() {
    return currentHover;
  }

  function useObject() {
    if (!currentHover) return;

    const onUse = currentHover.userData && currentHover.userData.onUse;
    if (typeof onUse === "function") {
      onUse(currentHover);
      return;
    }

    const name = currentHover.name || currentHover.type || "object";
    console.log(`Interacted with ${name}`);
  }

  return {
    raycaster,
    mouse,
    pickObject,
    pickCenter,
    updateHover,
    clearHover,
    getCurrentHover,
    useObject,
  };
}
