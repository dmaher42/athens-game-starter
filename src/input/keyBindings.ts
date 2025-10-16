// src/input/keyBindings.ts
// Centralised definitions for keyboard bindings used by movement and look logic.
// Keeping the keys in one place makes it easy to ensure consistency between
// systems (InputMap, character controllers, UI overlays, etc.).

export type KeyGroup = Record<string, readonly string[]>;
export type ReadonlyKeyGroup<T extends KeyGroup = KeyGroup> = {
  readonly [K in keyof T]: readonly string[];
};

export const MOVEMENT_KEYS = Object.freeze({
  forward: ["KeyW"],
  back: ["KeyS"],
  left: ["KeyA"],
  right: ["KeyD"],
} as const satisfies ReadonlyKeyGroup);

export const LOOK_KEYS = Object.freeze({
  left: ["ArrowLeft"],
  right: ["ArrowRight"],
  up: ["ArrowUp"],
  down: ["ArrowDown"],
} as const satisfies ReadonlyKeyGroup);

export function flattenKeyGroups(groups: KeyGroup): readonly string[] {
  const flattened: string[] = [];
  for (const codes of Object.values(groups)) {
    if (Array.isArray(codes)) {
      flattened.push(...codes);
    }
  }
  return Object.freeze(flattened) as readonly string[];
}

const LOOK_KEY_SET = new Set(flattenKeyGroups(LOOK_KEYS));
const EMPTY_CODES = Object.freeze([] as const);

function filterMovementCodes(codes: readonly string[] = EMPTY_CODES): readonly string[] {
  if (!Array.isArray(codes)) {
    return EMPTY_CODES;
  }
  const filtered = codes.filter(
    (code): code is string => typeof code === "string" && code.length > 0 && !LOOK_KEY_SET.has(code)
  );
  return Object.freeze(filtered) as readonly string[];
}

export const MOVEMENT_ONLY_KEYS = Object.freeze({
  forward: filterMovementCodes(MOVEMENT_KEYS.forward),
  back: filterMovementCodes(MOVEMENT_KEYS.back),
  left: filterMovementCodes(MOVEMENT_KEYS.left),
  right: filterMovementCodes(MOVEMENT_KEYS.right),
} as const satisfies ReadonlyKeyGroup);
