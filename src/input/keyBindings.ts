// Enhanced key bindings for typical 3D game feel
export const MOVEMENT_KEYS = Object.freeze({
  forward: Object.freeze(["KeyW", "ArrowUp"]),
  back: Object.freeze(["KeyS", "ArrowDown"]),
  left: Object.freeze(["KeyA", "ArrowLeft"]),
  right: Object.freeze(["KeyD", "ArrowRight"]),
});
 
export const LOOK_KEYS = Object.freeze({
  left: Object.freeze(["KeyQ", "Comma"]),
  right: Object.freeze(["KeyE", "Period"]),
  up: Object.freeze(["KeyR"]),
  down: Object.freeze(["KeyF"]),
});
 
export const ALT_LOOK_KEYS = Object.freeze({
  left: Object.freeze(["KeyJ"]),
  right: Object.freeze(["KeyL"]),
  up: Object.freeze(["KeyI"]),
  down: Object.freeze(["KeyK"]),
});
 
export const ALL_LOOK_KEYS = Object.freeze({
  left: Object.freeze([...LOOK_KEYS.left, ...ALT_LOOK_KEYS.left]),
  right: Object.freeze([...LOOK_KEYS.right, ...ALT_LOOK_KEYS.right]),
  up: Object.freeze([...LOOK_KEYS.up, ...ALT_LOOK_KEYS.up]),
  down: Object.freeze([...LOOK_KEYS.down, ...ALT_LOOK_KEYS.down]),
});
 
export const ACTION_KEYS = Object.freeze({
  jump: Object.freeze(["Space"]),
  sprint: Object.freeze(["ShiftLeft", "ShiftRight"]),
  flyToggle: Object.freeze(["KeyG"]),
  crouch: Object.freeze(["ControlLeft", "ControlRight", "KeyC"]),
});
 
export function flattenKeyGroups(groups) {
  return Object.values(groups).reduce((acc, codes) => {
    if (Array.isArray(codes)) {
      acc.push(...codes);
    }
    return acc;
  }, []);
}
 
const LOOK_KEY_SET = new Set(flattenKeyGroups(ALL_LOOK_KEYS));
 
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
