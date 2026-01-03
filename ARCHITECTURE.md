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

## Recent Critical Fixes (Jan 2026)

### 1. Ocean Reflection Bug
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

Last Updated: January 3, 2026
