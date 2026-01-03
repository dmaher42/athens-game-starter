# Brown Strip Investigation - Deep Dive

**Date:** January 3, 2026  
**Issue:** Persistent brown strip visible on terrain despite multiple fixes  
**Resolution:** Multiple overlapping brown surface systems identified and hidden

---

## Summary

The "brown strip" was caused by **five separate systems** creating brown/tan colored surfaces:

1. ✅ **Terrain Materials** (src/world/terrain.js) - FIXED
2. ✅ **Building Paving** (src/world/buildingSpawner.js) - FIXED  
3. ✅ **Main Roads** (src/world/roads.js) - FIXED (hidden)
4. ✅ **Civic District Roads** (src/world/cityPlan.js) - FIXED (hidden)
5. ✅ **Civic District Footpaths** (src/world/cityPlan.js) - FIXED (hidden)

---

## Detailed Findings

### 1. Terrain Materials (src/world/terrain.js)
**Status:** ✅ FIXED - Changed all zones to grass

**Original Issue:**
```javascript
// Lines 75-77 - Multiple material zones
const terrainMaterials = [
  CoastalGroundMaterial,  // 0xd4c4a0 (tan/beige) - PROBLEM
  CityGroundMaterial,      // 0x998877 (brown) - PROBLEM  
  InlandGroundMaterial    // 0x4a7c3f (grass green)
];
```

**Fix Applied:**
```javascript
// All zones now use grass material
const terrainMaterials = [
  InlandGroundMaterial,
  InlandGroundMaterial,
  InlandGroundMaterial
];
```

**Commit:** Previous session

---

### 2. Building Paving (src/world/buildingSpawner.js)
**Status:** ✅ FIXED - Changed to grass green

**Original Issue:**
```javascript
// Lines 32-38 - Paving material definitions
const MATERIAL_BASE = {
  paving: {
    color: 0xa7a08c,  // Brown/tan - PROBLEM
    roughness: 0.8,
    metalness: 0.1
  }
};
```

**Fix Applied:**
```javascript
const MATERIAL_BASE = {
  paving: {
    color: 0x4a7c3f,  // Grass green
    roughness: 0.8,
    metalness: 0.1
  }
};
```

**Surfaces Affected:**
- Forecourt planes (around building entrances)
- Courtyard planes (interior building spaces)

**Commit:** `f6cac42` - "Change paving material from brown/tan to grass green"

---

### 3. Main Roads (src/world/roads.js)
**Status:** ✅ FIXED - Changed to grass green and hidden

**Original Issue:**
```javascript
// Line 193 - Road material
const material = new THREE.MeshStandardMaterial({
  map: roadDiffuseTexture,
  normalMap: roadNormalTexture,
  roughnessMap: roadRoughnessMap,
  aoMap: roadRoughnessMap,
  color: 0xb8a890,  // Brown/tan - PROBLEM
  roughness: 0.85,
  metalness: 0
});
```

**Fix Applied:**
```javascript
// Step 1: Changed color
color: 0x4a7c3f,  // Grass green

// Step 2: Hidden completely
mesh.visible = false;  // Hide roads by default
```

**Commits:** 
- Color change: Previous commit
- Hidden: `f6cac42` - "Hide roads by default - set visible=false"

---

### 4. Civic District Roads (src/world/cityPlan.js)
**Status:** ✅ FIXED - Hidden by default

**Original Issue:**
```javascript
// Line 532 - Road mesh creation
const roadMesh = createPavedStrip(
  BLOCK_SIZE, 
  BLOCK_SIZE, 
  isMainAvenue ? 0x887766 : 0x666666  // Brown or dark gray - PROBLEM
);
roadMesh.position.set(localX, localY - 0.02, localZ);
group.add(roadMesh);
```

**Fix Applied:**
```javascript
const roadMesh = createPavedStrip(
  BLOCK_SIZE, 
  BLOCK_SIZE, 
  isMainAvenue ? 0x887766 : 0x666666
);
roadMesh.position.set(localX, localY - 0.02, localZ);
roadMesh.visible = false;  // Hide civic district roads
group.add(roadMesh);
```

**Surface Details:**
- Main avenues: 0x887766 (brown)
- Regular roads: 0x666666 (dark gray)
- Size: BLOCK_SIZE x BLOCK_SIZE (grid-based)
- Location: Civic district grid around Agora

**Commit:** `e04eeab` - "Hide civic district roads and footpaths, add debugCivicDistrict() function"

---

### 5. Civic District Footpaths (src/world/cityPlan.js)
**Status:** ✅ FIXED - Hidden by default

**Original Issue:**
```javascript
// Lines 585-588 - Footpath creation
const pathColor = pathTile.type === 'connector' ? 0x998877 : 0xaa9988;  // Tan colors - PROBLEM
const pathMesh = createPavedStrip(pathWidth, pathWidth, pathColor);
pathMesh.position.set(localX, localY + 0.01, localZ);
pathMesh.userData.isFootpath = true;
group.add(pathMesh);
```

**Fix Applied:**
```javascript
const pathColor = pathTile.type === 'connector' ? 0x998877 : 0xaa9988;
const pathMesh = createPavedStrip(pathWidth, pathWidth, pathColor);
pathMesh.position.set(localX, localY + 0.01, localZ);
pathMesh.visible = false;  // Hide footpaths
pathMesh.userData.isFootpath = true;
group.add(pathMesh);
```

**Surface Details:**
- Connector paths: 0x998877 (tan)
- Regular footpaths: 0xaa9988 (lighter tan)
- Width: 6-8 units
- Location: Pedestrian connectivity between civic district zones

**Commit:** `e04eeab` - "Hide civic district roads and footpaths, add debugCivicDistrict() function"

---

## Debug Console Functions

Added comprehensive debugging tools to inspect and control these elements:

### hideRoads()
Hides all road-like surfaces including:
- Main roads (roads.js)
- Civic district roads (cityPlan.js)
- Footpaths (cityPlan.js with userData.isFootpath)

### showRoads()
Shows all road-like surfaces

### debugCivicDistrict()
Detailed inspection of civic district elements:
- Counts and lists all roads, footpaths, and plazas
- Shows position, visibility, and color for each element
- Useful for verifying which surfaces are present and visible

### Other Available Functions:
- `hideWater()` / `showWater()` - Control water visibility
- `toggleWater()` - Toggle water on/off
- `debugOcean()` - Check ocean position and bounds

---

## How to Verify Fix

1. **Restart browser** (clear WebGL context)
2. **Open fresh:** https://dmaher42.github.io/athens-game-starter/
3. **Hard refresh:** Ctrl+Shift+R
4. **Check terrain:** Should be all grass green
5. **Run in console:**
   ```javascript
   debugCivicDistrict()  // Should show all roads/paths as visible=false
   ```

---

## Additional Brown Materials Found (Not Currently Used)

These systems exist but are not actively rendering:

### city.js - Road Tubes (Line 345)
```javascript
return applyVertexColor(tube, 0x8f8676);  // Brown-tan
```
**Status:** Not rendered - `createHillCity()` function is empty

### cityPlan.js - Plaza Material (Line 536)
```javascript
const plazaMesh = createPavedStrip(BLOCK_SIZE - 2, BLOCK_SIZE - 2, 0xaaaaaa);  // Gray
```
**Status:** Gray (not brown), currently visible

---

## Root Cause Analysis

**Why did this happen?**

1. **Multiple Ground Systems:** The game has several overlapping ground surface systems:
   - Base terrain (2400x2400 mesh with multi-material zones)
   - Building decorative paving (forecourts, courtyards)
   - Road system (textured meshes)
   - Civic district grid (procedural paved strips)
   - Footpath network (narrow connection paths)

2. **Layered Rendering:** These surfaces stack at similar Y coordinates:
   - Terrain: y=0 (base)
   - Roads: y=-0.02 (slightly below)
   - Footpaths: y=+0.01 (slightly above)
   - Paving: y=0 (same level)

3. **Color Coordination:** No single color palette defined, so different systems used different brown/tan tones independently

4. **Visibility:** All systems rendered by default, creating overlapping brown surfaces

---

## Recommended Future Improvements

1. **Unified Color Palette:**
   - Create `src/config/colors.js` with named color constants
   - Use consistent grass green across all ground systems

2. **Ground Layer Manager:**
   - Single system to coordinate which ground surfaces show where
   - Prevent overlapping visible surfaces

3. **Material System:**
   - Shared material instances for common surfaces
   - Reduces memory and ensures consistency

4. **Visibility Management:**
   - Consider making roads/paths opt-in rather than hidden by default
   - Add scene configuration for which ground elements to render

---

## Files Modified (This Session)

1. **src/world/cityPlan.js** - Hide roads and footpaths
2. **src/core/Application.ts** - Enhanced debug functions

## Previous Fixes (Earlier Sessions)

3. **src/world/terrain.js** - Unified terrain materials to grass
4. **src/world/buildingSpawner.js** - Changed paving to grass green
5. **src/world/roads.js** - Changed roads to grass green, then hidden

---

**Final Status:** All brown/tan surfaces either changed to grass green or hidden. Terrain should now appear completely grass-covered with no brown strips.
