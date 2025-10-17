// Enhanced key bindings for typical 3D game feel
function freezeKeyList(keys) {
    return Object.freeze([...keys]);
}
function createKeyGroups(groups) {
    const entries = Object.entries(groups);
    const frozen = {};
    for (const [name, keys] of entries) {
        frozen[name] = freezeKeyList(keys);
    }
    return Object.freeze(frozen);
}
export const MOVEMENT_KEYS = createKeyGroups({
    forward: ["KeyW", "ArrowUp"],
    back: ["KeyS", "ArrowDown"],
    left: ["KeyA", "ArrowLeft"],
    right: ["KeyD", "ArrowRight"],
});
export const LOOK_KEYS = createKeyGroups({
    left: ["KeyQ", "Comma"],
    right: ["KeyE", "Period"],
    up: ["KeyR"],
    down: ["KeyF"],
});
export const ALT_LOOK_KEYS = createKeyGroups({
    left: ["KeyJ"],
    right: ["KeyL"],
    up: ["KeyI"],
    down: ["KeyK"],
});
export const ALL_LOOK_KEYS = createKeyGroups({
    left: [...LOOK_KEYS.left, ...ALT_LOOK_KEYS.left],
    right: [...LOOK_KEYS.right, ...ALT_LOOK_KEYS.right],
    up: [...LOOK_KEYS.up, ...ALT_LOOK_KEYS.up],
    down: [...LOOK_KEYS.down, ...ALT_LOOK_KEYS.down],
});
export const ACTION_KEYS = createKeyGroups({
    jump: ["Space"],
    sprint: ["ShiftLeft", "ShiftRight"],
    flyToggle: ["KeyG"],
    crouch: ["ControlLeft", "ControlRight", "KeyC"],
});
export function flattenKeyGroups(groups) {
    const values = Object.values(groups);
    return values.reduce((acc, codes) => {
        acc.push(...codes);
        return acc;
    }, []);
}
const LOOK_KEY_SET = new Set(flattenKeyGroups(ALL_LOOK_KEYS));
function filterMovementCodes(codes) {
    if (!codes) {
        return freezeKeyList([]);
    }
    const filtered = codes.filter((code) => typeof code === "string" && code.length > 0 && !LOOK_KEY_SET.has(code));
    return freezeKeyList(filtered);
}
export const MOVEMENT_ONLY_KEYS = createKeyGroups({
    forward: filterMovementCodes(MOVEMENT_KEYS.forward),
    back: filterMovementCodes(MOVEMENT_KEYS.back),
    left: filterMovementCodes(MOVEMENT_KEYS.left),
    right: filterMovementCodes(MOVEMENT_KEYS.right),
});
