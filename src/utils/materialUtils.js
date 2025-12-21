
/**
 * Applies the foreground fog exclusion policy to a 3D object and its descendants.
 * This ensures that foreground elements (buildings, characters, props) are not
 * affected by the distant haze intended for the horizon/sky/ocean.
 *
 * @param {THREE.Object3D} object - The root object to traverse.
 */
export function applyForegroundFogPolicy(object) {
  if (!object) return;

  object.traverse((child) => {
    if (child.isMesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => {
          if (m) m.fog = false;
        });
      } else {
        child.material.fog = false;
      }
    }
  });
}
