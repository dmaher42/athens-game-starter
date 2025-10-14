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

const LOOK_KEY_SET = new Set(flattenKeyGroups(LOOK_KEYS));

function filterMovementCodes(codes = []) {
  if (!Array.isArray(codes)) {
    return Object.freeze([]);
  }
  const filtered = codes.filter(
    (code) => typeof code === "string" && code.length > 0 && !LOOK_KEY_SET.has(code)
  );
  return Object.freeze(filtered);
}

export const MOVEMENT_ONLY_KEYS = Object.freeze({
  forward: filterMovementCodes(MOVEMENT_KEYS.forward),
  back: filterMovementCodes(MOVEMENT_KEYS.back),
  left: filterMovementCodes(MOVEMENT_KEYS.left),
  right: filterMovementCodes(MOVEMENT_KEYS.right),
});
