// src/input/keyBindings.js
// Centralised definitions for keyboard bindings used by movement and look logic.
// Keeping the keys in one place makes it easy to ensure consistency between
// systems (InputMap, character controllers, UI overlays, etc.).

export const MOVEMENT_KEYS = Object.freeze({
  forward: Object.freeze(["KeyW"]),
  back: Object.freeze(["KeyS"]),
  left: Object.freeze(["KeyA"]),
  right: Object.freeze(["KeyD"]),
});

export const LOOK_KEYS = Object.freeze({
  left: Object.freeze(["ArrowLeft"]),
  right: Object.freeze(["ArrowRight"]),
  up: Object.freeze(["ArrowUp"]),
  down: Object.freeze(["ArrowDown"]),
});

export function flattenKeyGroups(groups) {
  return Object.values(groups).reduce((acc, codes) => {
    if (Array.isArray(codes)) {
      acc.push(...codes);
    }
    return acc;
  }, []);
}
