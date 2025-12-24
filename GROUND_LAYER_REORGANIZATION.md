# Ground Layer Reorganization - Sand Texture Visibility Fix

## Problem
Sand texture was being occluded by the nearly-opaque ShoreTerminationBand layer (opacity 0.98) that was positioned at `Y = seaLevel + 0.12` (approximately Y=0.12). This layer was sitting on top of the main terrain mesh and visually blocking the sand texture from view.

## Root Cause Analysis
The rendering stack had the following issue:
- **Terrain (main sand ground)**: Y=0, renderOrder=0 (default), opaque with sand diffuse/normal/AO textures
- **AegeanOcean (water)**: Y=0, renderOrder=0 (default), transparent (opacity 0.85)
- **ShoreTerminationBand (coastal silhouette)**: Y≈0.12, renderOrder=-1, **nearly opaque (opacity 0.98)** ← PROBLEM
- **HarborPad (sand platform)**: Y≈2.12, renderOrder=2, opaque
- **HarborLowPolyWater**: Y=0, renderOrder=0 (default), transparent (opacity 0.6)

The ShoreTerminationBand, being nearly opaque with 98% opacity, was visually occluding everything below it due to its position right above the terrain and its lack of explicit renderOrder to ensure proper compositing.

## Solution Implemented

### 1. **ShoreTermination Layer Repositioning**
**File**: `src/world/shoreTermination.js` (line 132)

**Change**: Lowered the ShoreTerminationBand Y position from terrain level to underwater:
```javascript
// BEFORE:
mesh.position.y = seaLevel + 0.12;

// AFTER:
mesh.position.y = seaLevel - 8.0;
```

**Rationale**: The coastal silhouette should appear at the visual horizon (far away), not at the immediate ground level. By placing it 8 meters below sea level, it renders below the terrain and doesn't occlude the sand texture while still being visible at the horizon due to its large radius (215-250 m) and fog blending.

### 2. **Terrain RenderOrder Optimization**
**File**: `src/world/terrain.js` (line 373)

**Change**: Added explicit renderOrder to ensure terrain renders above transparent water:
```javascript
// ADDED:
terrain.renderOrder = 1;
```

**Rationale**: Three.js uses renderOrder to control draw order for transparent materials. By setting terrain to renderOrder=1, it ensures the opaque sand texture renders on top of lower renderOrder transparent meshes.

### 3. **Ocean (AegeanOcean) RenderOrder Adjustment**
**File**: `src/world/ocean.js` (line 559)

**Change**: Set global ocean water renderOrder lower than terrain:
```javascript
// ADDED:
water.renderOrder = -1;
```

**Rationale**: The global ocean should render before (beneath) the opaque terrain in the depth composition, ensuring proper water depth-sorting with the sand ground.

### 4. **Harbor Water RenderOrder Setup**
**File**: `src/world/harbor.js` (line 73)

**Change**: Ensured harbor water has consistent renderOrder:
```javascript
// ADDED:
water.renderOrder = 0;
```

**Rationale**: Harbor water (transparent, opacity 0.6) should render between the ocean and the raised sand pad, allowing reflections without occluding the raised platform.

### 5. **Enhanced Debug Auditing**
**File**: `src/debug/groundAudit.js`

**Changes**: 
- Extended `isGroundy()` filter to catch more water/dock meshes
- Added `getMaterialInfo()` function to log material properties (transparent, opacity, depthWrite, side, etc.)
- Enhanced `logDetailedAudit()` to show:
  - Y position (sorted descending)
  - renderOrder for each mesh
  - Material transparency & opacity
  - Occlusion analysis (opaque vs transparent)
  - Expected rendering stack diagram
- Provided visual rendering order guide in console

**Rationale**: Complete visibility into ground layer stack helps diagnose z-fighting, transparency sorting, and occlusion issues.

## Final Rendering Stack (Bottom to Top)

| Layer | Y Position | renderOrder | Type | Material | Purpose |
|-------|-----------|-------------|------|----------|---------|
| WorldFloorCap | Y ≈ -140 | -10 | Opaque | MeshBasicMaterial (dark blue) | Kills geometry below terrain |
| ShoreTerminationBand | Y ≈ -8.0 | -1 | Transparent (98%) | MeshStandardMaterial | Distant coastal silhouette at horizon |
| Terrain | Y = 0 | **1** | Opaque | MeshStandardMaterial (sand diffuse/normal/AO) | **Main ground with sand texture** |
| AegeanOcean | Y = 0 | **-1** | Transparent (85%) | Custom water shader | Global ocean water |
| ShoreTerminationRocks | Y ≈ 0.35 | 0 | Opaque | MeshStandardMaterial (dark) | Coastal rock scatter at horizon |
| WaterHorizonFade | Y ≈ 0.06 | -1 | Transparent | Custom depth-cued shader | Water horizon blending (underground) |
| HarborLowPolyWater | Y = 0 | **0** | Transparent (60%) | MeshPhysicalMaterial (reflective) | Harbor water with reflections |
| Docks | Y ≈ 0.975 | 0 | Opaque | MeshStandardMaterial (wood) | Wooden dock structures |
| HarborPad | Y ≈ 2.12 | 2 | Opaque | Sand material | Raised sand platform above harbor water |

## Validation

After reorganization, the sand texture should now be **fully visible** as the primary ground layer:
1. ✓ ShoreTermination no longer occludes terrain (moved below water)
2. ✓ Terrain renderOrder=1 ensures it renders above transparent water
3. ✓ Ocean renderOrder=-1 renders before terrain for proper compositing
4. ✓ Harbor water renderOrder=0 allows reflections without occluding pad
5. ✓ Debug audit provides real-time visibility into layer stack

## Testing Recommendations

1. **Visual Inspection**: Verify sand texture is visible across the entire terrain (especially near harbor edges)
2. **Debug Mode**: Run in dev mode and check console output from `mountGroundAudit(scene)` to verify renderOrder/Y positions match expected stack
3. **Water Reflections**: Confirm harbor water still reflects sky and shows transmission effects
4. **Horizon**: Verify coastal silhouette still appears distant at horizon edge
5. **Depth Cues**: Check that fog/depth cues blend properly at world edges

## Related Changes
- Harbor relocation: Y position moved to `seaLevel + 2.0` (previous work)
- Terrain sand textures: Applied gravelly_sand diffuse/normal/AO maps (previous work)
- Lighting: Bright Noon exposure clamped to 0.45, fog density 0.000033 (previous work)

## Files Modified
1. `src/world/terrain.js` - Added renderOrder=1
2. `src/world/ocean.js` - Added renderOrder=-1
3. `src/world/harbor.js` - Added renderOrder=0 to water
4. `src/world/shoreTermination.js` - Lowered Y from +0.12 to -8.0
5. `src/debug/groundAudit.js` - Enhanced logging and diagnostics

---
**Commit**: Ground layer audit and render order reorganization: expose sand texture
