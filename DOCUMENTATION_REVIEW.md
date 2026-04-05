# Documentation Review

Here is an honest and constructive assessment based on the provided `README.md`, `GAME_OVERVIEW.md`, and `ARCHITECTURE.md` documentation.

### 1. General Understanding

*   **Make code changes without breaking the build?** Yes. The architecture guide clearly states the build command (`npm run build`), the necessity to wrap window/DOM interactions in `if (typeof window !== 'undefined')`, and notes on managing imports and avoiding dev-only flags.
*   **Understand where different systems are located?** Yes. `ARCHITECTURE.md` contains a very clear file layout reference, linking distinct mechanics (lighting, terrain, ocean) directly to their respective source files.
*   **Know what NOT to do?** Yes. The "Common Pitfalls" section is excellent. The instructions to not move the ocean from `x=2500` or mess with material array indices are very clear. The `README.md` rule against creating "islands" or "bowls" is clearly understood.
*   **Suggest improvements aligned with the game's vision?** Yes. Knowing the creator's intent ("mainland coastal city", "walking feels good", "no empty horizons") makes proposing matching features straightforward.

### 2. Missing Information

The current documentation is very good, but a few areas could be fleshed out:

*   **Initialization Order/Async Dependencies:** While `src/core/Application.ts` is named as the entry point, the sequence in which things must boot is missing. For example, when must terrain be built compared to when the ocean is created? When does the culling system start? Knowing the strict order would prevent race conditions.
*   **Vite configuration details:** The docs mention outputting to `docs/`, but it might be useful to document any other Vite specific gotchas (like bare module imports, aliases) if they are frequently an issue.
*   **Event Hooks / State Management:** If there is a global state manager (like for quest tracking or time of day events), it is not mentioned in the architectural overview.

### 3. Specific Areas

*   **Terrain System:**
    *   **Confidence:** High. The multi-material index array is clearly laid out, and the rationale behind moving from a single dirt texture to grass for inland is well-documented.
    *   **What would improve it:** An overview of how height is calculated (e.g., procedural noise vs heightmaps) would be beneficial.
*   **Water System:**
    *   **Confidence:** High. The documentation about moving the ocean to `x=2500` to fix the mountain reflection bug is one of the most useful notes in the repo.
    *   **What would improve it:** Details on harbor vs. ocean interaction. How does the inland water (harbor) blend with the far-east ocean visually or technically?
*   **City Layout/Building System:**
    *   **Confidence:** Medium. The proposed organic layout concepts are detailed in `ARCHITECTURE.md`.
    *   **What would improve it:** A brief explanation of the *current* district config (where are `public/config/districts.json` loaded, and how are `Prefabs` utilized?) would be helpful to bridge the gap between the grid system and the procedural generation files (`buildingSpawner.js`).
*   **Player/Character System:**
    *   **Confidence:** Medium. I know it exists in `src/systems/PlayerSystem.ts`.
    *   **What would improve it:** Knowing the input mapping (e.g. WASD vs Arrow keys as documented) is great, but knowing the actual character class structure and collision detection mechanism for the player would be a plus.
*   **Lighting/Rendering System:**
    *   **Confidence:** High. The documentation clearly lists `LookProfiles.js` and `LightingConfig.js` as the source of truth, and `Scene.js` as the post-processing hub.
    *   **What would improve it:** Details on when `LookProfiles` are swapped (is it automatic based on time of day, or triggered manually?).
*   **Asset Loading:**
    *   **Confidence:** Medium. `GAME_OVERVIEW.md` mentions that assets live in `/docs` and load with fallbacks.
    *   **What would improve it:** An explicit list of accepted fallback behaviors (e.g., what does a missing GLB turn into? Just a box?)

### 4. Common Tasks

**Task 1: Add a new building to the city**
*   ✅ **Which files:** `src/world/buildingSpawner.js`, `public/config/districts.json`
*   ✅ **What to change:** Add to prefabs/spawner logic, define in district rules.
*   ✅ **What to avoid:** Don't ignore the `frustumCulled = true` setting or break the grid alignment unless tagged.
*   ✅ **How to test:** `npm run build` and visual inspection via GitHub Pages preview.

**Task 2: Modify terrain height in a specific area**
*   ✅ **Which files:** `src/world/terrain.js` (and potentially `src/world/terrainHeight.js`)
*   ✅ **What to change:** The logic assigning Z values to vertices.
*   ✅ **What to avoid:** Don't create steep walls or "bowls". Don't mess with the `materialGroups` logic while editing heights.
*   ✅ **How to test:** `npm run build` and walk the area to ensure the player doesn't clip or float.

**Task 3: Change water color or behavior**
*   ✅ **Which files:** `src/world/ocean.js` and `src/world/harbor.js`
*   ✅ **What to change:** Shader uniforms or THREE.Water configuration parameters.
*   ✅ **What to avoid:** Do NOT change the ocean's position (`x=2500`) or size.
*   ✅ **How to test:** `npm run build` and check both day/night cycles to ensure reflections don't break.

**Task 4: Add a new NPC character**
*   ⚠️ **Which files:** `src/world/npcs.js` (and likely `src/core/Application.ts` to spawn them).
*   ⚠️ **What to change:** Add a new role profile or GLB load path.
*   ✅ **What to avoid:** Ensure they are added to the distance-based animation throttle loop.
*   ⚠️ **How to test:** `npm run build` and observe them walking on paths.

**Task 5: Modify the city layout to be more organic (less grid-like)**
*   ✅ **Which files:** `src/world/cityPlan.js`, `src/world/city.js`
*   ✅ **What to change:** Replace grid loop with Voronoi/Poisson disc sampling as outlined in `ARCHITECTURE.md`.
*   ✅ **What to avoid:** Don't break the district spacing rules (e.g. `minSeparation` for the Acropolis).
*   ✅ **How to test:** `npm run build` and use the newly added `?citydebug=1` mode to check for overlaps.

**Task 6: Add a new landmark (temple, monument)**
*   ✅ **Which files:** `src/core/Application.ts` (using `placeLandmark` / `buildTemple`), `src/world/LandmarkManager.js`
*   ✅ **What to change:** Instantiate the landmark at specific coordinates.
*   ✅ **What to avoid:** Keep them protected from being culled by the `buildingCulling.js` system.
*   ✅ **How to test:** `npm run build` and verify visual presence and collision.

**Task 7: Change lighting or time of day**
*   ✅ **Which files:** `src/config/LookProfiles.js`, `src/config/LightingConfig.js`, `src/world/lighting.js`
*   ✅ **What to change:** Modify the preset parameters (exposure, colors, fog near/far).
*   ✅ **What to avoid:** Don't increase sun intensity too much (it was reduced to 2.3 to prevent bloom issues).
*   ✅ **How to test:** `npm run build` and manually swap presets using the Dev HUD (F10).

### 5. Documentation Structure

*   **Glossary of Terms:** Would be very helpful. (What exactly is the difference between "Ocean" and "Harbor Water" in the context of this specific engine? What is a "Look Profile" vs "Lighting Preset"?).
*   **Troubleshooting Section:** Add a quick "If the screen is black, check X" or "If models aren't loading, check Y".

### 6. Red Flags

*   The documentation is remarkably clear and non-contradictory. The only slight confusion is the overlapping terminology of `harborCity`, `city.js` and `cityPlan.js` as the city generation seems to have undergone a few refactors.

### 7. Quick Reference

A great cheat sheet would include:
1.  **Coordinate anchors:** (e.g., `AGORA_CENTER_3D: (-80, Y, 40)`, `OCEAN: x=2500`)
2.  **Key Commands:** (e.g., `npm run build`, `npm run verify`)
3.  **UI Toggles:** (`?citydebug=1`, `F10` for Dev HUD)
4.  **Golden Rules:** (No window logic outside `if (typeof window)`, No moving the ocean, Don't break the mainland aesthetic).

### 8. Your Suggestions

*   **Asset pipeline:** If you add new models, do they *need* to be compressed with KTX2/Draco manually, or does the pipeline handle it? Documenting the `scripts/compress-assets.mjs` usage would be helpful.
*   **Testing Flow:** Since you rely on browser automation (Playwright), explicitly documenting what the `npm run verify` command actually does behind the scenes (e.g. what URLs it hits, what it checks for) would make diagnosing CI failures much easier for an AI.
