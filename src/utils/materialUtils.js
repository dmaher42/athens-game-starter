export function disableFog(object) {
  if (!object || typeof object.traverse !== 'function') return;
  object.traverse((child) => {
    if (child.isMesh && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((m) => {
        if ('fog' in m) {
          m.fog = false;
        }
      });
    }
  });
  return object;
}
