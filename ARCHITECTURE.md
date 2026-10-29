Current water-interior fix: see SHIP_MODELS.md. One Ocean clips only inside measured static hull waterlines; no new ground/geometry/collision.46 tests/typecheck/build/seven browser checks pass, including GPU outside-sea identity and actual production registration. Current preview buildindex-B2ZaDDiJ.js. Earlier dated build identities below are historical.

Current deck-material update: see SHIP_MODELS.md for the completed warm-plank deck/jetty distinction, unchanged physics and explicit +2draw objects per ship. Current served hash and42-test validation are recorded there. No browser hold or source change remains pending.

# Current ship presentation checkpoint - 28 October 2026

Ship upgrade complete. See [SHIP_MODELS.md](./SHIP_MODELS.md) for visual/collision ownership, sources, budgets and final verification. Current build index-ByWuHb7N.js matches normal preview4177;42 tests,typecheck/build and six browser integration checks pass. Normal-shader harbour/boarding/near-far views and browser client were inspected. No native steady-FPS claim; preserve the existing performance fixes and user resources. The earlier dated status paragraphs below are historical evidence, not pending browser holds or the current build identity.

# Current runtime ownership — 27 October 2026
Current city-structure checkpoint: Daniel's personal hobby world has no mandatory classroom/student/device target. The bounded pass is implemented through the existing city renderer and prefabs. neighbourhoodLayout.js owns all19 authored street control-point sets, descriptive quarter bounds, smooth workshop/home recipe influences, five Agora frontage placements and the existing Agora furnishings. cityPlan.js renders/places them once. The old civic/commercial/residential tags remain engine recipe/shadow categories, not competing city maps. See WORLD_BUILDING_PLAN.md.

Local build index-DH8Ofxte.js (SHA256171C13FB777E646154D8EF302516582158A42676E483A0D0052FB7706C716AC2) matches the preserved port4177/PID13152 preview.38 non-browser tests,typecheck and build pass. Flat-terrain fixture:185 building lots,26 street frontages,19 ribbons,343 meshes and0 lights remain; triangles65700->64696. Original road centre lines and clear-lot reservations are hash-identical; tapered ribbons add no road triangles. Actual generated-city capsule checks traverse five routes for5633frames after relocating existing fountain/banner props off the western exit. This fixture does not replace real-terrain/native visual,FPS or full browser acceptance. Browser permission was resumed; current completed ship/district checks above supersede this historical checkpoint. No external assets adopted,no new light/NPC/save/terrain/render systems,no settings changes or publication.
Previous harbour/scroll verification: `index-C55XAAkp.js`, SHA256 `5A327B22BB9820337AB6698120E22CC036E9A70A1083B395B50A1454330CBA30`, served identically on the preserved port4177 preview. Typecheck,35 Node tests, production smoke, actual-WebGL pickup regression,22,260 water samples,12,935 city/neighbourhood walking frames, activity keyboard/quest/replay checks and2,593 boarding/return frames pass. No publication.

The yellow-scroll freeze was caused by hiding a pickup group containing a PointLight: the native approach added23 shader programs and69 compile/link calls, extending beyond39 seconds while the score callback took0ms. Collection now hides meshes and sets existing lights to0 intensity, retaining the renderer light layout. Repeated collection is idempotent. The WebGL regression retains2 programs across repeated pickups, and the full-game repeat retains49 programs; both issue zero new compile/link calls. Preserve this light-layout invariant.

Normal-shader harbour overview, close merchant/trireme views and activity dialog were captured and inspected. Performance is not signed off: the final timed pier attempt had substantial rendering stalls under378-389MB available system RAM and paging. Closing only owned test resources recovered1932-2217MB. A fresh fixed-distance sampler was prepared but never started because native browser readiness was stopped. Earlier city pairs predate the scroll fix and use background presentation; they do not establish current smoothness or Chromebook performance. Do not stop user apps or change settings for testing without permission.

This section supersedes the older coordinate, terrain, water and deployment notes below. The older sections are historical records, not authority to recreate removed systems. Current user instructions permit local development/testing only: no push, merge or publication, no new settings UI, no stopping user apps/tabs/servers. Only positively identified test-created browsers/servers may be closed. Preserve the normal preview on 127.0.0.1:4177.

## Source map

| Responsibility | Active owner | Boundary to preserve |
| --- | --- | --- |
| Entry/render loop | main.ts → main.runtime.js → core/Application.ts; core/GameLoop.js; core/Scene.js | One application, scene, renderer and world loop. UI callbacks are not another world renderer. |
| Terrain and shore | world/terrain.js; world/terrainHeight.js; world/harborCoast.js | One rendered terrain mesh (256 segments), disjoint material groups, exact triangle height sampler. No new ground plane. |
| Roads and courts | world/cityPlan.js and its existing grounded surface builders | Deliberate paved overlays with authored routes; keep feathered joins and collision conventions. |
| Quay and piers | world/harbor.js; world/harborPlacement.js | Existing curved quay generator, timber loading piers and short boarding ramps are physical structures over terrain, not alternative terrain generators. No terrain/water reshaping in this pass. |
| Ships | world/harborShips.js called by the existing harbor.js factories | Static procedural templates, shared existing materials, curved hulls, instanced cargo/oars. harbor.js and locations.js own placement and sea-relative origin. No second loader or rope/boat physics loop. |
| Ocean | world/ocean.js; world/shipWaterExclusion.js; locations.js / seaLevelState.js | One guarded AegeanOcean Water instance serves inlet and open sea. Shore clipping samples the actual terrain; ordinary depth testing places water below quay/deck surfaces. Normal-only SSAO passes must not launch reflections. |
| Collision/camera | env/EnvironmentCollider.js; systems/PlayerSystem.js; controls/PlayerController.js and ThirdPersonCamera.js | Geometry owns the collision BVH for capsule and nearest-hit camera queries. No duplicate raw-terrain camera scan. Preserve current water-walking policy. |
| Static render batching | utils/staticRenderBatches.js | Original authored nodes retain geometry/metadata and collision ownership but use layer mask 0. Render-only copies share exact materials/shadow policy and are noCollision. Rebuild after source transforms change. Props/buildings managed by existing cullers, interactive ancestors and custom render/shadow callbacks are excluded. |
| Visibility | utils/propCulling.js; utils/buildingCulling.js; Three render-time frustum culling | Existing cullers remain sole owners of individual prop/building visibility. Batch spheres include transformed geometry; avoid main-camera visibility flags that break mirrored views. |
| Sky/daylight | systems/LightingSystem.js; world/sky/DynamicSky.js; HDR background/fallback | Dynamic sky and HDR fallback are intentional layers. createLighting reuses the sky's sun, not a second sun. Keep 4096 shadows and existing SSAO quality unless a measured comparison justifies change. |
| Input/use | input/InputMap.ts; world/interactions.js | One E/click use path and registered-target list. Empty means no pickable target, never whole-scene fallback. Ranged third-person signs use the same registry/onUse callback with player distance checks. |
| Objectives/activity | state/QuestManager.js; state/HarborActivity.js; world/harborActivity.js | QuestManager alone owns the displayed objective/completion. activityId protects it; the tour pauses progression and delayed follow-ups queue until release. The activity model owns evidence/choices only. Existing quests are suspended/restored, not deleted. UI updates on state changes; no new RAF/save engine/runtime AI. |
| NPCs | world/npcs.js and characters/athenianDress.js / existing GLB fallback | Preserve shared garments, LOD, accessory instancing, animation throttling and the current player model. |

## Audit distinctions

- The terrain coverage-mask function currently exits without baseBlend state. Legacy road/layout metadata therefore does not prove a second active painted ground system.
- The empty-road dust call returns null. Definition-only underlay/skirt helpers and the disabled legacy keyboard block are not active duplicated rendering.
- Actual measured waste fixed here: collision BVH was not attached where standard raycasts looked; the camera also queried raw terrain; empty interaction registries scanned the world; Water reflected the city during the SSAO normal override; harbour lighting repeatedly traversed/reallocated shared colours.
- Actual ownership issue addressed for the new activity: the tour used to update any active objective. Activity ownership now prevents that overwrite and pauses tour progression while preserving its prior quest.
- Remaining focused follow-up: EnvironmentManager captures lights/dynamicSky before LightingSystem initializes; optional HUD look/fog callbacks use that stale facade while production hotkeys use LightingSystem/Scene. Do not rebuild the sky because of this. Consolidate callback ownership only with targeted tests.
- Legacy collectible quests and their type/timing assumptions require their own audit; the evidence activity does not depend on collecting those items or discard them.

## Harbour learning design and evidence

The map remains a stylized coastal interpretation, not a scale model of Athens. The activity identifies **Piraeus — port of Athens**, explains that the game compresses the distance, and contrasts commercial and naval ship functions. No exact year or surveyed harbour reconstruction is asserted.

- [National Hellenic Research Foundation: Piraeus](https://archaeologia.eie.gr/archaeologia/gr/02_deltia/piraeus.html): the port was distinct from inland Athens; Kantharos hosted commerce, while Zea/Mounichia held naval facilities. Schematic masonry quays are an interpretation, not measured excavation geometry.
- [Danish Institute: Zea Harbour Project](https://diathens.gr/en/projects/piraeus): shipsheds, slipways, moles and towers document naval infrastructure. Do not infer a vast excavated timber promenade.
- [Acropolis Museum: Lenormant Relief](https://www.theacropolismuseum.gr/en/relief-depicting-trireme-lenormant-relief): late-fifth-century-BC evidence for a trireme with three oar rows. The game uses a narrow hull, ram and three distinguishable banks schematically.
- [Institute of Nautical Archaeology: Kyrenia](https://nauticalarch.org/projects/kyrenia-shipwreck-excavation/): merchant hull/cargo comparison from a later wreck (the source dates the wreck 295 BC). It is not an exact fifth-century Athenian ship template.
- [Penn Museum: Traders and Trading](https://www.penn.museum/sites/expedition/traders-and-trading/): grain imports helped feed Classical Athens; beamy merchant ships carried cargo. Amphoras alone are not evidence that their contents were grain. The displayed sacks/cargo are explicitly an invented teaching example, not an ancient manifest.

One complete loop: inspect merchant hold/cargo, inspect trireme oars/ram, choose the cargo vessel, explain the food-supply connection. Both inspections and a correct explanation are required. Wrong choices give specific hints and unlimited retry. Completion, reset/replay, Escape/keyboard focus, nearby E use and return-to-exploration restore the old quest. No claim that all rowers were enslaved or that harbour society comprised only citizen men.

## Validation and performance budget

Pre-content performance checkpoint: typecheck + 21 tests + build + browser/network checks + real-Water regression (22,260 samples) + 12,931 walking frames passed. Verified Intel Arc 1366×768 paired route: batching on 40.02/40.62 FPS, off 34.76/34.87 FPS; p95 ≈33.4ms. Earlier 1280×720 captures and invalid half-float byte readbacks must not be cited as full-size or pixel-identical evidence.

The new harbour/activity sources require their own final verification. Acceptance: unchanged terrain/water ownership, solid quay/boarding/decks, correctly floated ships, no introduced visibility pops, keyboard evidence→choice→reason→completion/reset, restoration of the previous objective, no console/network errors, and matched representative frame times after warm-up. Aim to stay within 10% of the current route average, p95≤50ms and p99≤67ms on the measured laptop; report spikes honestly. Functional headless tests are not native FPS evidence. No Chromebook speed promise is established by an Intel Arc laptop measurement.

---

## Historical architecture notes (older values below are superseded)
# ARCHITECTURE.md

## Overview
This document describes the technical architecture of the Athens Game Starter codebase, including key systems, file locations, and recent architectural decisions. This is intended to help AI assistants understand the codebase accurately.

---

## Core Application Flow

### Entry Point: `src/core/Application.ts`
- Main application class that bootstraps the entire game
- Creates THREE.js renderer, scene, camera, and composer (post-processing)
- Initializes all major systems in `async run()` method
- Manages game loop via `GameLoop` class
- Handles window resize and user input events
- **All window-related code MUST be inside `if (typeof window !== 'undefined')` block**

**Debug Console Functions** (available in browser console):
- `hideWater()` / `showWater()` / `toggleWater()` - Control water visibility
- `hideRoads()` / `showRoads()` - Control road visibility
- `debugOcean()` - Show ocean position and bounds info
- `window.scene`, `window.camera` - Access THREE.js objects directly

---

## World Systems

### 1. Terrain System (`src/world/terrain.js`)

**Current Configuration:**
- **Size:** 2400x2400 units, PlaneGeometry with 512 segments
- **Position:** Centered at origin, rotated flat (x=-π/2)
- **Multi-Material System:** Uses THREE material groups for different zones

**Material Zones (as of Jan 2026):**
```javascript
const terrainMaterials = [
  CoastalGroundMaterial,      // Index 0: Sand texture for coastal areas
  InlandGroundMaterial,       // Index 1: Grass texture (replaces city dirt)
  InlandGroundMaterial,       // Index 2: Grass texture for inland
];
```

**Important:** The city dirt material (brown strip) was REMOVED and replaced with grass. All inland areas now use grass texture.

**Material Assignment Logic:**
- Geometry groups are created by iterating through triangles
- Each triangle is assigned a material index based on world position
- Coastal areas get sand, everything else gets grass

**Files:**
- `src/world/terrain.js` - Main terrain creation
- `src/materials/groundMaterials.js` - Material definitions

---

### 2. Water System

#### Harbor Water (`src/world/harbor.js`)
- **Position:** x=-50, z=-100, y=2.0 (seaLevel + HARBOR_GROUND_HEIGHT)
- **Purpose:** Low-poly water for the harbor basin
- Terrain is carved out for the harbor (see `clampHarborBandHeight()`)

#### Ocean Water (`src/world/ocean.js`)

**CRITICAL INFORMATION - Ocean Positioning (Jan 2026):**

**Current Configuration:**
- **Mesh Size:** 1000x1000 units (PlaneGeometry)
- **Position:** Centered at x=2500 (starts at x=2000, ends at x=3000)
- **Shader Clipping:** Discards all pixels west of x=1800
- **Purpose:** Positioned FAR EAST to be completely separate from inland areas

**Why This Matters:**
The ocean was moved progressively east to eliminate reflections of mountains appearing on inland ground. Previous positions caused the Water shader's reflection texture to capture and display inland terrain.

**Timeline of Ocean Changes:**
1. Originally: 8000x8000 at x=0 (covered everything)
2. Then: 3000x3000, 2000x2000, 1400x1400 (progressively shrinking)
3. Then: 800x800 at x=1500 (moved east)
4. **Current:** 1000x1000 at x=2000 (far east, completely isolated)

**FarOceanPlane:** COMPLETELY REMOVED
- Was a 5760-unit radius circular plane covering the entire map
- **Caused blue reflective shimmer on inland ground**
- Removed entirely in commit 76e7502

**Ocean Shader Details:**
- Uses THREE.js `Water` class from `three/examples/jsm/objects/Water.js`
- Custom shader injection samples terrain heightmap to prevent shimmer
- Clipping logic: `if (vWorldPosition.x < 1800.0) { discard; }`
- Shoreline foam and shallow water color effects based on water depth
- Fade system reduces detail at distance

**Debug:**
```javascript
debugOcean()  // Shows position: x≈2500, bounds: x=[2000, 3000]
```

---

### 3. Location System (`src/world/locations.js`)

Key coordinates (world space, Y=0 at sea level):
- **AGORA_CENTER_3D:** Player spawn point at x=-80, z=40 (inland, west side)
- **HARBOR_CENTER:** x=-50, z=-100 (northwest)
- **Ocean Center:** x=2500, z=0 (far east)

The world layout is:
```
West (inland) ←→ East (ocean)
   x=-80      x=0      x=1800    x=2000      x=2500      x=3000
   [Player]  [Origin] [Clip]    [Ocean Start] [Ocean Center] [Ocean End]
```

---

## Build System

### Build Command: `npm run build`

**Build Chain:**
```bash
vite build &&
node scripts/ensure-three-bundled.mjs &&
node scripts/build-bundleless-sources.mjs &&
node scripts/copy-bundleless-sources.mjs &&
node scripts/sanitize-bare-import-text.mjs
```

**Output:** All files go to `docs/` folder (GitHub Pages deployment)

**Vite Configuration (`vite.config.ts`):**
- Base URL: `/athens-game-starter/`
- Entry: `index.html`
- Output: `docs/`
- Uses esbuild for TypeScript compilation

---

## Recent Critical Fixes & System Additions (Jan 2026 - Apr 2026)

### 1. Procedural NPC Fallback System
**Problem:** The city felt empty if GLB models failed to load or were disabled.

**Solution:**
- Added a procedural NPC fallback system (`src/world/npcs.js`) using basic geometry (boxes for body, head, limbs)
- Procedural NPCs use `InstancedMesh` for rendering efficiency, particularly for accessories.
- Roles ("merchant", "scholar", "guard", "citizen") dictate accessories, materials, and movement speed.
- Includes distance-based animation update throttling and LOD switching to maintain performance.

### 2. Culling Optimization Systems
**Problem:** Rendering thousands of buildings and props caused severe performance drops.

**Solution:**
- Introduced distance-based prop culling (`src/utils/propCulling.js`) to hide small decorative items when they are far from the camera.
- Introduced building culling (`src/utils/buildingCulling.js`) using `frustumCulled = true`, distance limits (e.g. 400m), and horizon-based culling for distant, low buildings.
- This results in 30-50% fewer draw calls and significantly better frame rates in dense areas.

### 3. Lighting Look Profiles
**Problem:** Managing specific lighting presets and configurations was disjointed.

**Solution:**
- Abstracted visual configurations into Look Profiles (`src/config/LookProfiles.js`).
- Lighting presets ("Bright Noon", "Golden Hour", "Blue Hour", "Night") now control tone mapping, sun position/color, fog colors, skybox exposure, and color grading.
- `src/config/LightingConfig.js` is still present for the default overrides, but `LookProfiles.js` holds the precise time-of-day configuration payload.

### 4. Ocean Reflection Bug
**Problem:** Blue reflective shimmer on inland ground, mountains reflecting on terrain

**Root Cause:** 
- FarOceanPlane (massive 5760-unit plane) covering entire map
- Ocean mesh too large/western
- Water shader reflection texture capturing inland terrain

**Solution:**
- Removed FarOceanPlane completely
- Moved ocean to x=2500 (far east, 1800+ units from inland areas)
- Added aggressive shader clipping at x<1800
- Ocean now isolated from all inland regions

**Commits:**
- 76e7502: Remove FarOceanPlane
- 3642390: Remove debug visualization code
- 223eeff: Move ocean to x=2000
- Multiple syntax fixes for build errors

### 2. Terrain Material System
**Problem:** Brown dirt strip running through middle of terrain

**Root Cause:** Multi-material system had CityGroundMaterial (brown dirt) assigned to city zone

**Solution:** Replaced CityGroundMaterial with InlandGroundMaterial (grass)
```javascript
// OLD:
const terrainMaterials = [CoastalGroundMaterial, CityGroundMaterial, InlandGroundMaterial];

// NEW:
const terrainMaterials = [CoastalGroundMaterial, InlandGroundMaterial, InlandGroundMaterial];
```

**Commit:** 3b6aeb6

---

## Key Files Reference

### Core Application
- `src/core/Application.ts` - Main app class, scene setup, render loop
- `src/main.ts` - Entry point, creates Application instance

### World Generation
- `src/world/terrain.js` - Terrain geometry and material zones
- `src/world/ocean.js` - Ocean water mesh (far east at x=2500)
- `src/world/harbor.js` - Harbor water and structures
- `src/world/locations.js` - World coordinate constants
- `src/world/city.js` - City building placement
- `src/world/renderLayers.js` - Render order constants

### Materials
- `src/materials/groundMaterials.js` - Terrain material definitions (grass, sand)

### Systems
- `src/systems/LightingSystem.js` - Sun position, lighting presets, time of day
- `src/systems/PlayerSystem.ts` - Player character, movement, physics
- `src/systems/GameLoop.ts` - Main game loop and delta time management

### Utilities
- `src/utils/glbSafeLoader.js` - GLB model loading with fallbacks
- `src/utils/baseUrl.js` - URL resolution for assets

---

## Common Pitfalls for AI Assistants

### 1. Background Environment Generation
**Context:** Distant mountains are procedurally generated in `src/world/backdrop/BackdropMountains.js`.
**Rule:** When adjusting the skyline, modify the splines and ridge materials here rather than relying on the skybox to provide the illusion of terrain. The skybox serves to provide atmosphere; the terrain and backdrop models provide the real boundaries.

### 1. **Window Check Block**
All browser-specific code in Application.ts MUST be inside:
```typescript
if (typeof window !== 'undefined') {
  // All window, renderer, DOM code here
}
```
Missing closing braces cause build failures.

### 2. **Ocean Position**
The ocean is at **x=2500**, NOT at origin. Do not suggest moving it closer to x=0 or making it larger - this causes reflection issues.

### 3. **Export Statements**
When editing ocean.js or other files, ensure export statements are preserved:
```javascript
export function updateOcean(...) { }  // ✓ Correct
function updateOcean(...) { }         // ✗ Build fails: "updateOcean is not exported"
```

### 4. **Material Indices**
Terrain uses material groups (0=coastal, 1=city, 2=inland). Changing material array order breaks terrain appearance.

### 5. **Build vs Runtime**
- Changes to `.js`/`.ts` files require `npm run build` AND git push
- GitHub Actions auto-deploys to gh-pages branch
- User must hard refresh (Ctrl+Shift+R) to see changes

---

## Debug Workflow

### Testing Changes Locally:
```bash
npm run build  # Builds to docs/
# Open docs/index.html in browser to test
```

### Checking Ocean Position:
```javascript
// In browser console:
debugOcean()
// Should show: Position x≈2500, bounds x=[2000, 3000]
```

### Checking Scene Objects:
```javascript
window.scene.children  // List all objects
window.scene.getObjectByName('AegeanOcean')  // Find ocean mesh
window.scene.getObjectByName('Terrain')      // Find terrain
```

---

## Architecture Principles

1. **Single Source of Truth:** All deployed code builds to `docs/`
2. **No Server Required:** User works from Chromebook, can't run dev servers
3. **Progressive Enhancement:** Systems fail gracefully if assets missing
4. **Spatial Isolation:** Water systems isolated far east to prevent rendering conflicts
5. **Console Accessibility:** Critical debug functions exposed to browser console
6. **Multi-Material Terrain:** Terrain uses material groups for zone variation

---

## When Making Changes

**Before suggesting changes, verify:**
1. Will this affect ocean position or size? (Keep it at x=2500)
2. Will this modify terrain materials? (Keep grass for inland, sand for coast)
3. Will this require window/DOM access? (Wrap in window check)
4. Will this change exports? (Verify export statements preserved)
5. Does this need build + deploy? (Yes for .js/.ts changes)

**After making changes:**
1. Run `npm run build` to verify compilation
2. Check for TypeScript/ESBuild errors
3. Git commit and push to main
4. GitHub Actions auto-deploys to gh-pages
5. User hard refreshes to see changes

---

## City Layout System

### Current Implementation: Grid-Based Layout

**Problem:** The city currently uses an organized grid system which feels too modern and rigid for an ancient Greek city.

### Files Involved:

**Primary:**
- `src/world/cityPlan.js` - District zones and building placement logic
- `src/world/city.js` - Building geometry generation, house creation
- `src/buildings/BuildingManager.js` - GLB model loading and placement
- `public/config/districts.json` - District configuration (if exists)

**Supporting:**
- `src/world/locations.js` - City center and zone boundaries
- `DISTRICT_SPACING_RULES.md` - Current spacing rules documentation

### Current Layout Constraints:

**Landmark Spacing Rules:**
```javascript
SPACING_RULES = {
  LANDMARK_MIN_SPACING: 8 * BLOCK_SIZE,           // 384m between landmarks
  CIVIC_CLUSTER_MAX_DISTANCE: 30 * BLOCK_SIZE,   // 1440m radius from center
  LANDMARK_TYPES: ['parthenon', 'temple', 'monument', 'tholos', 'stoa']
}
```

**District Types:**
- Sacred (Parthenon placement)
- Civic/Agora (near city center on flat terrain)
- Residential
- Commercial
- Coastal

### How to Change to Organic Layout:

#### 1. Replace Grid with Organic Growth Algorithm

**Current:** Regular grid with `BLOCK_SIZE` intervals
**Target:** Radial growth from multiple seed points with irregular spacing

**Approach:**
```javascript
// Instead of regular grid:
for (x = 0; x < width; x += BLOCK_SIZE)
  for (z = 0; z < depth; z += BLOCK_SIZE)
    placeBuilding(x, z)

// Use organic placement:
- Start from Agora center (AGORA_CENTER_3D)
- Create multiple district seeds (market, temples, residential quarters)
- Grow outward along terrain contours
- Follow natural paths (avoid steep slopes)
- Vary building density by district
- Add irregular spacing (Voronoi/Poisson disc sampling)
```

#### 2. Terrain-Following Roads

**Current:** Straight grid roads
**Target:** Roads follow terrain elevation, connect landmarks organically

**Files to modify:**
- Create `src/world/roads.js` (if doesn't exist)
- Add pathfinding that respects terrain slope
- Connect landmarks via natural paths
- Use spline curves for organic feel

**Algorithm suggestions:**
- A* pathfinding with slope penalties
- Bezier curves for smooth paths
- Road width varies by district importance
- Intersections at natural gathering points

#### 3. Building Orientation and Clustering

**Current:** Buildings aligned to grid axes
**Target:** Buildings face roads, plazas, or downhill; cluster organically

**Changes needed in `city.js`:**
```javascript
// Instead of fixed rotation:
rotation = 0 or Math.PI/2

// Calculate rotation based on:
- Face toward nearest road/plaza
- Align with terrain contours
- Point downhill for drainage
- Cluster around shared courtyards
- Vary rotation by ±15° for irregularity
```

#### 4. District Character

**Add to `cityPlan.js`:**
```javascript
const DISTRICT_CHARACTERISTICS = {
  agora: {
    buildingDensity: 'high',
    spacing: 'tight',
    pattern: 'radial',
    plazaSize: 'large',
    roadWidth: 'wide'
  },
  residential: {
    buildingDensity: 'medium',
    spacing: 'varied',
    pattern: 'organic-cluster',
    courtyards: true,
    roadWidth: 'narrow'
  },
  sacred: {
    buildingDensity: 'low',
    spacing: 'wide',
    pattern: 'formal-axial',
    openSpace: 'maximum',
    roadWidth: 'ceremonial'
  }
}
```

#### 5. Reference Implementation Steps:

**Phase 1: Analysis**
1. Study `cityPlan.js` to understand current district logic
2. Map current landmark placement rules
3. Identify building placement loops

**Phase 2: Organic Algorithm**
1. Implement Poisson disc sampling for building positions
2. Add terrain-aware spacing (closer on flat, wider on slopes)
3. Create district seed points (Agora, Sacred, Harbor)
4. Grow from seeds with density falloff

**Phase 3: Path Network**
1. Generate primary roads connecting landmarks
2. Add secondary streets following terrain
3. Create irregular intersections and plazas
4. Vary road width by hierarchy

**Phase 4: Building Placement**
1. Place buildings along roads
2. Calculate orientation from road direction
3. Add courtyards and shared spaces
4. Vary setbacks and rotations

**Phase 5: Polish**
1. Add alleyways between building clusters
2. Create stairs/ramps for elevation changes
3. Place props (amphorae, crates) more naturally
4. Add vegetation in irregular patches

### Example: Converting One Block

```javascript
// OLD (Grid):
const x = blockX * BLOCK_SIZE;
const z = blockZ * BLOCK_SIZE;
placeBuilding(x, z, 0);

// NEW (Organic):
const seedPoint = { x: AGORA_CENTER_3D.x, z: AGORA_CENTER_3D.z };
const clusters = generateClusters(seedPoint, radius, minDensity, maxDensity);

clusters.forEach(cluster => {
  const buildings = poissonDiscSample(cluster, minSpacing, terrain);
  buildings.forEach(pos => {
    const rotation = calculateOrientationFromTerrain(pos, terrain);
    const offset = randomOffset(-2, 2); // irregularity
    placeBuilding(pos.x + offset.x, pos.z + offset.z, rotation);
  });
});
```

### Key Algorithms to Research:

1. **Poisson Disc Sampling** - Even but irregular spacing
2. **Voronoi Diagrams** - Natural territory division
3. **Perlin Noise** - Organic density variation
4. **A* Pathfinding** - Terrain-aware roads
5. **Delaunay Triangulation** - Natural connection networks

### Testing Organic Layout:

```javascript
// Add debug visualization in Application.ts:
if (typeof window !== 'undefined') {
  window.debugCityLayout = () => {
    // Show district boundaries
    // Visualize road network
    // Display building density heatmap
  };
}
```

### Important Considerations:

⚠️ **Performance:** Organic layouts may create more draw calls - consider instanced meshes for buildings

⚠️ **Collision:** More complex layout needs better collision system for navigation

⚠️ **Regeneration:** Seed-based generation ensures reproducibility - use `CITY_SEED` from locations.js

⚠️ **Landmarks:** Keep spacing rules but make placement terrain-aware

---

Last Updated: January 3, 2026



Activity verification ownership: verification/harbor-approach.fixture.js is test-only. It derives its routes from the existing authored pier sections and uses the production collider and PlayerController to prove/walk them; it adds no runtime navigation owner. Reset only to a verified clear inshore standing anchor, then walk the full supported route. Do not restore a fixed west-of-marker teleport into randomized dock cargo or relax the original support/interaction assertions. Game-side positions and activity state remain owned by harbor.js/harborActivity.js.

Agora life ownership: neighbourhoodLayout.AGORA_LIFE_POCKETS references existing frontage indices; cityPlan places/decorates once; agoraLife supplies shared static goods and benches. Application reassigns the four existing fallback actors through world/npcs.js. Dialogue uses createInteractor.showDialogue, not another UI/quest system. Keep the square and source street network open; preserve authored goods from generic small-prop pruning.

### Workshop craft details
The existing NEIGHBOURHOODS/neighbourhoodFrontages in neighbourhoodLayout.js still own court/building/street placement. cityPlan.js replaces two existing court accent slots with createWorkshopLife in world/workshopLife.js. That module owns only static craft props plus WORKSHOP_LIFE dialogue text; large bench/kiln parts collide, small goods do not. Application passes these two dialogue records to existing neighbourhood residents, without adding another NPC or interaction loop. Agora and harbour ownership stay unchanged.

### Agora–Potters connector ownership
WORKSHOP_CONNECTOR and workshopConnectorLot/workshopConnectorFrontage in world/neighbourhoodLayout.js own this bounded adjustment of existing slots. cityPlan.js samples terrain at final positions and records actual moved lot transforms in plan.workshopConnector; grid coordinates remain stable lot identities. Front-depth comes from the existing geometry, keeping the authored road clear. All existing street curves and reward anchors remain unchanged. The relocated artisan consumes neighbourhood craftStation metadata through the existing spawnCitizenCrowd path in Application. Do not add a second street/frontage/ground/NPC system.

### Agora commission and activity progress
QuestManager.getActivityRecord/saveActivityRecord/claimActivityReward own the optional browser-local activity save (athens.activities.v1). Existing beginActivity/endActivity retain one objective owner and suspended/queued legacy quests. CollectiblesManager.awardActivityOnce uses that receipt and the existing gold score; only commission award receipts rehydrate, not an invented full-game inventory save. state/AgoraCommission.js owns the two-plan commission domain. world/agoraCommission.js binds existing NPC onUse callbacks and registered E inspection cues, modal input/focus and dynamic gathering visibility; agoraLife.js supplies native shared-resource display geometry. Application mounts/updates/disposes once through its existing lifecycle. No parallel quest/save/input/currency/terrain or NPC engine.
The city poolMaterialsAndMerge guard must exclude interactable ancestors as well as hidden ancestors: gathering outcome meshes are mutable after a saved reload. Otherwise their previous visible choice gets permanently baked and cannot be replaced. The focused commission test covers this while keeping normal city merging intact.


### Great Theatre ownership (2026-10-28)
world/greatTheatreLayout.js owns the bounded site/reservation/approach; cityPlan respects that reservation while preserving all19 canonical street curves. world/greatTheatre.js owns structural meshes and stage dressing, samples the existing terrain once, and retains collider authoring on original structural geometry with render-only shared-material batches. Application creates the shell before its existing collider refresh. No second terrain/physics/road owner.
state/TheatreRehearsal.js owns An Opening for the City progress and finite original pieces through existing QuestManager activity save/objective ownership. world/theatreRehearsal.js binds registered E cues, modal focus/captions, saved props and three actors using existing NPC updater/LOD; the optional NPC canMove callback gates only the two performers during a piece. Application mounts, updates and disposes once. The roadside approach cue routes to the same entry UI; do not add another quest/input/save/currency engine. Props remain outside immutable structure batching and preserve noCull for small authored masks. No theatre score reward, automatic replay, recorded speech or external assets. Agora commission records/reward receipts and harbour objective ownership are preserved.


### City purpose and landmark hierarchy (2026-10-28)
neighbourhoodLayout.js remains the source of truth for named courts,19 street curves and26 neighbourhood street frontages. CITY_LANDMARKS now replaces the four hardcoded Application temple calls with explicit Hill sanctuary/Council porch/Harbour shrine/Porters’ storehouse roles. cityLandmarks.js renders once before the existing EnvironmentCollider construction, using existing Prefabs, temple kit and harbour land placement; it queues static E notices through the existing interactor. Do not resurrect disabled LandmarkManager as a second owner. Application only calls createCityLandmarks when its existing landmark flag is enabled.
COURT_LIFE contains optional dialogue for the existing three non-craft court residents; Application passes it to the same NPC spawn/updater. No extra citizens, save namespace, quest currency or per-frame scene scan. Existing craft/Agora/theatre interaction owners remain authoritative.
CITY_GROUND_ENVELOPE/isCityDryGround classify dry urban triangles within terrain.js's existing three material groups. Broad ocean-sheet bounds overlap dry land and must not force those samples into grass. Coastal and submerged handling retain precedence; this is not a height/shoreline/second-ground system. Workshop and storehouse changes live in existing Prefabs; decorative fronts/roofs are noCollision, original solid building cores remain authoritative. All court/reward anchors and canonical street definitions preserved.

Theatre approach ribbon: shared arc-length edge samples in greatTheatre.js own both rendered and collider authoring triangles. Do not recreate per-segment side offsets or add an overlaid fix plane; adjacent segment edges must remain identical.


### Enterable Olive Court home (2026-10-28)
neighbourhoodLayout.isCourtyardHomeFrontage selects one existing Olive Court frontage; homeCourtFrontage tightens three existing neighbours. cityPlan creates courtyardHome.js once in that slot before collider refresh and returns its geometry references; it adds no terrain or global road owner. Original shell footprint remains 11 × 6 metres, with local supported floor and apron. Static architecture is batched normally. Dynamic roof (dynamicVisibility) and registered outcome subtree retain their own visibility; do not bake them into permanent batches.
Application mounts/updates/disposes courtyardHousehold.js once. The existing Olive Court NPC slot consumes its host position, floor sampler and interaction; one porter uses the same NPC system. HouseholdWater in state/ owns only the optional favour and uses QuestManager’s existing activity record and objective suspension. No separate inventory/save/currency/input manager. Water outcomes replace each other; replay awards no gold. Activity carrying is journal state. Do not move the fountain or court reward anchors to shortcut the task.


### Weathered pier and offshore vessel (2026-10-28)
harbor.js owns shared WeatheredPierTimber, local harbour-warmth factors and the single offshore placement at (210, sea level, 60). Dock, boardwalk and boarding ramps retain original geometry/collision transforms; warm ship decks retain their separate material. harborPlacement.js owns neutral quay coping. createOffshoreGalley in harborShips.js reuses the existing trireme family, with full sail and static display scale; its shipType is offshore-galley, boardable false, noCollision true. Do not include it in the two boardable merchant/trireme water-mask registry or activity selection. Existing static harbour batching and material caches remain the rendering owners. No parallel boat engine or update loop.


### Market work routines (2026-10-29)
marketLife.js derives two routes from existing Agora food and Trading Court packing anchors; npcWaypointRoutine.js is the pure bounded waypoint/dwell helper. Application assigns these to the two existing procedural workers in world/npcs.js, which retains the only NPC update/pose/LOD owner (13 callbacks total). No extra actor, geometry, light, timer, save or economy owner is introduced. Nearby players, the existing Agora panel and brief E conversations pause the routes. The food seller still opens AgoraCommission; the porter uses existing interactor dialogue with phase-specific directions. Food, jars and packing props remain static displays.
The selected workers prefer a valid aimed E target over nearby inspection-marker fallback; all other interaction targets retain existing proximity behavior. Do not replace this with another input handler. Pure coverage is verification/market-routine.test.mjs; isolated real-E route/save coverage is in the task market-life-smoke.json. Active NPC manifest is currently empty, so these routines apply to current procedural fallback actors, not future GLB crowd assets.

Agora arrival material hierarchy (2026-10-29): cityPlan creates one shared AgoraFrontageLimestone for the existing five AGORA_FRONTAGES and passes it through Prefabs.stoa.masonryMaterial. This changes walls and columns only. Their transforms, geometry, shadow flags, counters, collision surfaces, activity stations and layout owner stay unchanged; Parthenon, paving and other prefab materials are unaffected. Do not add replacement shells or globally alter marble to change market appearance.

2026-10-29 wall/counter finish: acropolisPrecinct.masonryUV changes only UVs on existing merged retaining wall and NorthSanctuaryTerrace; the same 512x256 canvas masonry now repeats at 6.4m by 2.4m (four courses), avoiding giant stretched courses. No position/index/normal or collider change. materials.getMarketCounterMaterial caches one muted 128x64 code-native timber texture/material; cityPlan passes it to the existing five Agora stoa prefabs via optional counterMaterial. Other wood, ships, jetty, furnishings and building defaults remain unchanged. No extra overlay geometry, terrain, manager, frame updater or saved state.


## Enlarged Acropolis layout (29 October 2026)
The same acropolisLayout.js now owns a 160 by 90 game-metre main precinct, expanded inland to preserve the existing coastline, harbour and Agora. The temple remains 45 by 20 and is repositioned at (-45, -65). The western gateway is at origin (-171.4, -25); its imported visual, proxy and procedural fallback share that placement. Northern sanctuary sites and retained support shift 90 metres west through sanctuaryOffsetX; hellenisticSanctuary converts local sampling and named-site coordinates exactly once. The theatre and weaving court move to (-24, -150) and (-180, -78), with their existing NPCs, cues, activity IDs and map destinations derived from those owners.

This is a compressed Hellenistic-inspired interpretation, not a measured reconstruction or a literal geographical centre. A broader sacred precinct and routes around its feet make it an urban focus; real Piraeus remains geographically separate, unlike the compact game. Ancient monumental and rocky-setting references: https://www.ysma.gr/en/monuments/parthenon/ ; https://www.ysma.gr/en/monuments/circuit-walls/acropolis-rock/ ; https://whc.unesco.org/en/list/404/ . Approximate dimensions used for proportional comparison are secondary encyclopedia figures, not a site survey: https://en.wikipedia.org/wiki/Parthenon and https://en.wikipedia.org/wiki/Acropolis_of_Athens .

Terrain remains one mesh and sampler. The western ramp caches a curved height profile and grades a wider shoulder to keep actual terrain triangles walkable; the controller's slope and support tolerances were not changed. greatTheatreLayout reserves the entire curved approach, with lot-footprint clearance, rather than only its control points. No additional ground plane, crowd system, currency or save schema was introduced. The long theatre approach reuses its existing earth material. Activity progress is browser-local and stays compatible through stable activity/reward IDs; localhost and public-site storage remain separate origins.


## Precinct life and Socrates (29 October 2026)
precinctLifeLayout.js owns three optional gathering pockets and their worn detours. acropolisPrecinct calls createPrecinctLife exactly once: an original bronze Athena variation, olive resting place with two benches, outdoor altar and modest votive stands. Positions stay inside the existing enlarged sanctuary. These are interpretive details, not an excavated precinct plan or a recovered Promachos portrait. References: https://www.ysma.gr/en/monuments/erechtheion/ and https://www.theacropolismuseum.gr/en/statuette-athena-promachos . The existing single terrain atlas uses its previously unused blue channel for restrained limestone wear; no new ground mesh, sampler, height or support owner. Retaining-wall vertex colour adds gentle variation without geometry changes. Anonymous procedural stoa lot -2:0 is explicitly retired through cityInfillDecision: its noisy reflective default surface and lack of authored role made it the out-of-place white block. Authored Agora frontages remain.

socratesEncounter.js mounts one named character at (-47,27), beside the Agora gathering area, via createSocratesModel in the existing npcs.js native geometry pipeline. The derivative has a bald crown, grey side hair and beard, broad nose, simple muted clothing and conversational pose. No external assets, new loader, AI service or crowd manager. The original Whose purse? dialogue offers trust, evidence and need approaches, each with a follow-up question, reflection and reconsideration. It is an imagined dilemma rather than an inventory quest or graded philosophy quiz. The existing interactor owns E; existing activity storage owns only the independent socrates-lost-purse record. No objective, currency, collectible or other activity record is hijacked. Closing restores canvas keyboard focus; Tab stays inside the dialog and Esc returns to walking. Reconsideration can be left and resumed, while completed reflection is remembered at the same browser origin.

Portrait inspiration: https://www.mfa.org/article/2021/portrait-head-of-socrates describes a later Roman portrait with receding hairline and thick beard, not an eyewitness likeness. The British Museum portrait collection page was found but its direct fetch returned 403. All model geometry and dialogue are original. Socrates (died in 399 BCE) predates the Hellenistic setting: the encounter explicitly labels this a creative time blend. It does not attribute invented wording to Plato or Socrates as a quotation. This is a first bounded conversation, not a complete investigation or philosophy simulation.

Raw authoring budget before existing batching: precinct 33 meshes / 1,786 triangles; Socrates 49 meshes / 4,888 triangles plus one existing-style label sprite. No new lights, animation updater, crowd AI, dynamic shadows, runtime shader rebuild or ground textures. These are authoring counts, not measured draw calls/FPS. Native normal views and focused actual-controller/E/UI/save checks support acceptance; no routine benchmark or unrelated full-suite claim. User attachment materialisation was blocked by the unavailable Python runtime for the supported Library helper; its pixels were not inspected by this executor. White-block diagnosis and all visual decisions were reproduced independently in the current game.
