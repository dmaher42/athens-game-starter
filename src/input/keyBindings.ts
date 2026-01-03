// Enhanced key bindings for typical 3D game feel

export type KeyCode = string;
export type KeyList = readonly KeyCode[];
export type MovementKey = "forward" | "back" | "left" | "right";
export type LookKey = "left" | "right" | "up" | "down";
export type ActionKey = "jump" | "sprint" | "flyToggle" | "crouch" | "interact";

type KeyGroups<T extends string> = Readonly<Record<T, KeyList>>;

function freezeKeyList<T extends readonly KeyCode[]>(keys: T): KeyList {
  return Object.freeze([...keys]) as KeyList;
}

function createKeyGroups<T extends string>(
  groups: Record<T, readonly KeyCode[]>,
): KeyGroups<T> {
  const entries = Object.entries(groups) as [T, readonly KeyCode[]][];
  const frozen: Partial<Record<T, KeyList>> = {};

  for (const [name, keys] of entries) {
    frozen[name] = freezeKeyList(keys);
  }

  return Object.freeze(frozen) as KeyGroups<T>;
}

export const MOVEMENT_KEYS = createKeyGroups<MovementKey>({
  forward: ["KeyW"],
  back: ["KeyS"],
  left: ["KeyA"],
  right: ["KeyD"],
});

export const LOOK_KEYS = createKeyGroups<LookKey>({
  left: ["ArrowLeft", "Comma"],
  right: ["ArrowRight", "Period"],
  up: ["ArrowUp"],
  down: ["ArrowDown"],
});

export const ALT_LOOK_KEYS = createKeyGroups<LookKey>({
  left: ["KeyJ"],
  right: ["KeyL"],
  up: ["KeyI"],
  down: ["KeyK"],
});

export const ALL_LOOK_KEYS = createKeyGroups<LookKey>({
  left: [...LOOK_KEYS.left, ...ALT_LOOK_KEYS.left],
  right: [...LOOK_KEYS.right, ...ALT_LOOK_KEYS.right],
  up: [...LOOK_KEYS.up, ...ALT_LOOK_KEYS.up],
  down: [...LOOK_KEYS.down, ...ALT_LOOK_KEYS.down],
});

export const ACTION_KEYS = createKeyGroups<ActionKey>({
  jump: ["Space"],
  sprint: ["ShiftLeft", "ShiftRight"],
  flyToggle: ["KeyF"],
  crouch: ["ControlLeft", "ControlRight", "KeyC"],
  interact: ["KeyE"],
});

export function flattenKeyGroups<T extends string>(
  groups: KeyGroups<T>,
): KeyCode[] {
  const values = Object.values(groups) as KeyList[];
  return values.reduce<KeyCode[]>((acc, codes) => {
    acc.push(...codes);
    return acc;
  }, []);
}

const LOOK_KEY_SET = new Set<KeyCode>(flattenKeyGroups(ALL_LOOK_KEYS));

function filterMovementCodes(codes: KeyList | undefined): KeyList {
  if (!codes) {
    return freezeKeyList([]);
  }

  const filtered = codes.filter(
    (code): code is KeyCode =>
      typeof code === "string" && code.length > 0 && !LOOK_KEY_SET.has(code),
  );

  return freezeKeyList(filtered);
}

export const MOVEMENT_ONLY_KEYS = createKeyGroups<MovementKey>({
  forward: filterMovementCodes(MOVEMENT_KEYS.forward),
  back: filterMovementCodes(MOVEMENT_KEYS.back),
  left: filterMovementCodes(MOVEMENT_KEYS.left),
  right: filterMovementCodes(MOVEMENT_KEYS.right),
});
