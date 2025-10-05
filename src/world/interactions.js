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
 *   updateHover: (object: THREE.Object3D | null) => void,
 *   clearHover: () => void,
 *   getCurrentHover: () => THREE.Object3D | null
 * }}
 */
export function createInteractor(renderer, camera, scene) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const HOVER_COLOR = 0x222244;
  const storedEmissive = new Map();
  let currentHover = null;

  /**
   * Helper that gathers all materials on the object (meshes may have an array).
   * @param {THREE.Object3D} object
   * @returns {THREE.Material[]}
   */
  function getMaterials(object) {
    if (!object || !object.material) return [];
    return Array.isArray(object.material) ? object.material : [object.material];
  }

  /**
   * Restore emissive colors for the previously hovered object.
   */
  function clearHover() {
    if (!currentHover) return;
    for (const material of getMaterials(currentHover)) {
      if (material && material.emissive && storedEmissive.has(material)) {
        material.emissive.copy(storedEmissive.get(material));
        storedEmissive.delete(material);
      }
    }
    currentHover = null;
  }

  /**
   * Apply a subtle emissive highlight to the hovered object.
   * @param {THREE.Object3D | null} object
   */
  function updateHover(object) {
    if (object === currentHover) return;
    clearHover();
    if (!object) return;

    for (const material of getMaterials(object)) {
      if (!material || !material.emissive) continue;
      if (!storedEmissive.has(material)) {
        storedEmissive.set(material, material.emissive.clone());
      }
      material.emissive.setHex(HOVER_COLOR);
    }
    currentHover = object;
  }

  /**
   * Convert a screen-space coordinate to normalized device coordinates (NDC)
   * and cast a ray to find the closest intersected object.
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

  function getCurrentHover() {
    return currentHover;
  }

  return {
    raycaster,
    mouse,
    pickObject,
    pickCenter,
    updateHover,
    clearHover,
    getCurrentHover,
  };
}
