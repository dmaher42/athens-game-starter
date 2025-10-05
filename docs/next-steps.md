# Suggested Next Steps

## 1. Flesh out core movement input
The `PlayerController` already expects a fully featured `InputMap` – it checks directional flags, sprinting, jumping, and pointer-look data every frame – but the current implementation is still a stub that always returns `false` and never captures keyboard or mouse input. Implementing real WASD/arrow controls, pointer lock, and mouse-look smoothing inside `InputMap` will immediately make the character controller come alive. 【F:src/controls/PlayerController.ts†L85-L163】【F:src/input/InputMap.ts†L1-L17】

## 2. Build the environment collision system
`EnvironmentCollider` is also a placeholder. Until it can merge static meshes and expose a `capsuleIntersect` helper, the player falls back to a flat plane collision and buildings loaded through `BuildingManager` cannot contribute real geometry. Wiring it up with the [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) utilities (already hinted at in the stub) will let you walk on hills, run into props, and toggle the Parthenon collision flag meaningfully. 【F:src/env/EnvironmentCollider.ts†L1-L19】【F:src/controls/PlayerController.ts†L204-L304】【F:src/buildings/BuildingManager.ts†L5-L45】

## 3. Add richer world interactions
The interaction system is ready for more content: it already highlights meshes flagged as interactable and fires custom `onUse` callbacks, which currently power the demo door and lamp. Consider adding collectible artifacts, dialogue plaques, or simple puzzles that use the same metadata pattern (`userData.interactable`, `userData.onUse`) to guide the player through the environment. Pair them with UI prompts or a lightweight journal so the day–night cycle and the world props feel purposeful. 【F:src/main.js†L28-L151】【F:src/world/interactions.js†L1-L140】
