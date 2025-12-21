export function applyForegroundFogPolicy(object) {
  if (!object || typeof object.traverse !== 'function') return;
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

// Alias for backward compatibility
export const disableFog = applyForegroundFogPolicy;
