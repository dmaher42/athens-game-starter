import * as THREE from 'three';
import { AGORA_CENTER_3D, HARBOR_CENTER_3D, HARBOR_SETBACKS, CITY_CENTER_ORIGIN, getCityGroundY } from './locations.js';
import { resolveBaseUrl, joinPath } from '../utils/baseUrl.js';
import { IS_DEV } from '../utils/env.js';
import { Prefabs, spawnBuilding } from './buildingSpawner.js';
import { buildTemple } from '../features/temples.js';
import { loadDistrictRules } from './districtRules.js';
import { 
  getSlope, 
  getAverageSlope, 
  getElevation, 
  isSlopeValidForBuilding, 
  analyzeTile,
  SLOPE_THRESHOLDS 
} from './terrainUtils.js';

/* PATCH: Harbor zone params */
export const HARBOR_ZONE = { bandWidth: 35, spacingScale: 0.7, densityBoost: 0.25 };

// Grid Constants
const MIN_X = -10, MAX_X = 10;
const MIN_Z = -10, MAX_Z = 20;
const BLOCK_SIZE = 48; // Increased from 40 for better district spacing (~20% increase)

// District Spacing Rules
export const SPACING_RULES = {
  LANDMARK_MIN_SPACING: 12 * BLOCK_SIZE, // 12-tile radius between landmarks (576m)
  CIVIC_CLUSTER_MAX_DISTANCE: 30 * BLOCK_SIZE, // 30 tiles from starting point (1440m)
  LANDMARK_TYPES: ['parthenon', 'temple', 'monument', 'tholos', 'stoa'],
};

// Walkability Grid Constants
export const WALKABILITY_CONFIG = {
  PATH_SPACING: 4, // Tiles between paths
  MAX_PATH_SLOPE: SLOPE_THRESHOLDS.MODERATE, // 0.75 max slope for paths
  MAX_REACHABILITY_DISTANCE: 60, // Max tiles to key buildings
  KEY_LOCATIONS: {
    ACROPOLIS: { x: 0, z: -5 }, // Grid coords
    AGORA: { x: 0, z: 0 },
    HARBOR: { x: 10, z: 0 },
  },
};

// Track placed landmarks for spacing validation
const placedLandmarks = [];

export function inHarborBand(
  pos,
  shorelineCenter = { x: HARBOR_CENTER_3D.x, z: HARBOR_CENTER_3D.z }
) {
  if (!pos) return false;
  // Directional Logic: Harbor is East (+X)
  // Treat tiles east of the harbor center (minus a small setback) as harbor frontage.
  const harborStartX = shorelineCenter.x - HARBOR_ZONE.bandWidth;
  return pos.x >= harborStartX;
}

/**
 * Check if a landmark can be placed at given position
 * Enforces 8-tile radius spacing between landmarks
 */
export function canPlaceLandmark(x, z, type = 'landmark') {
  const isLandmark = SPACING_RULES.LANDMARK_TYPES.includes(type);
  
  if (!isLandmark) {
    return true; // Not a landmark, no spacing restriction
  }

  // Check distance to all existing landmarks
  for (const existing of placedLandmarks) {
    const distance = Math.sqrt(
      Math.pow(x - existing.x, 2) + Math.pow(z - existing.z, 2)
    );
    
    if (distance < SPACING_RULES.LANDMARK_MIN_SPACING) {
      return false;
    }
  }

  return true;
}

/**
 * Register a landmark after placement
 */
export function registerLandmark(x, z, type) {
  placedLandmarks.push({ x, z, type });
}

/**
 * Check if position is within civic cluster constraints
 * Civic clusters (Agora, Civic Core) must be within 30 tiles of starting point
 */
export function isWithinCivicClusterRange(x, z) {
  const startX = CITY_CENTER_ORIGIN.x;
  const startZ = CITY_CENTER_ORIGIN.z;
  
  const distance = Math.sqrt(
    Math.pow(x - startX, 2) + Math.pow(z - startZ, 2)
  );
  
  return distance <= SPACING_RULES.CIVIC_CLUSTER_MAX_DISTANCE;
}

/**
 * Clear landmark registry (useful for regeneration)
 */
export function clearLandmarkRegistry() {
  placedLandmarks.length = 0;
}

/**
 * A* pathfinding algorithm to find shortest path between two grid cells
 * Avoids steep slopes and connects districts
 */
function findPath(grid, startX, startZ, endX, endZ, maxSlope = WALKABILITY_CONFIG.MAX_PATH_SLOPE) {
  const getCell = (x, z) => grid.find(c => c.gridX === x && c.gridZ === z);
  
  const start = getCell(startX, startZ);
  const end = getCell(endX, endZ);
  
  if (!start || !end) return null;

  const openSet = [start];
  const closedSet = new Set();
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();

  gScore.set(start, 0);
  fScore.set(start, heuristic(start, end));

  function heuristic(a, b) {
    return Math.abs(a.gridX - b.gridX) + Math.abs(a.gridZ - b.gridZ);
  }

  function getNeighbors(cell) {
    const neighbors = [];
    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    
    for (const [dx, dz] of dirs) {
      const neighbor = getCell(cell.gridX + dx, cell.gridZ + dz);
      if (neighbor && neighbor.slope <= maxSlope) {
        neighbors.push(neighbor);
      }
    }
    return neighbors;
  }

  while (openSet.length > 0) {
    // Find cell with lowest fScore
    openSet.sort((a, b) => (fScore.get(a) || Infinity) - (fScore.get(b) || Infinity));
    const current = openSet.shift();

    if (current === end) {
      // Reconstruct path
      const path = [current];
      let temp = current;
      while (cameFrom.has(temp)) {
        temp = cameFrom.get(temp);
        path.unshift(temp);
      }
      return path;
    }

    closedSet.add(current);

    for (const neighbor of getNeighbors(current)) {
      if (closedSet.has(neighbor)) continue;

      const tentativeGScore = (gScore.get(current) || Infinity) + 1;

      if (!openSet.includes(neighbor)) {
        openSet.push(neighbor);
      } else if (tentativeGScore >= (gScore.get(neighbor) || Infinity)) {
        continue;
      }

      cameFrom.set(neighbor, current);
      gScore.set(neighbor, tentativeGScore);
      fScore.set(neighbor, tentativeGScore + heuristic(neighbor, end));
    }
  }

  return null; // No path found
}

/**
 * Generate pedestrian paths connecting all districts
 * Returns path tiles with 4-tile spacing, avoiding steep slopes
 */
export function generatePaths(grid, options = {}) {
  const {
    spacing = WALKABILITY_CONFIG.PATH_SPACING,
    avoidSteepSlopes = true,
    connectAllDistricts = true,
  } = options;

  const pathTiles = [];
  const maxSlope = avoidSteepSlopes ? WALKABILITY_CONFIG.MAX_PATH_SLOPE : Infinity;

  if (IS_DEV) console.log('[CityPlan] Generating pedestrian walkability grid...');

  // Mark existing roads as paths
  for (const cell of grid) {
    if (cell.type === 'road') {
      pathTiles.push({
        gridX: cell.gridX,
        gridZ: cell.gridZ,
        position: cell.position.clone(),
        type: 'road',
        isPath: true,
      });
    }
  }

  // Generate additional paths with spacing
  for (let x = MIN_X; x <= MAX_X; x += spacing) {
    for (let z = MIN_Z; z <= MAX_Z; z += spacing) {
      const cell = grid.find(c => c.gridX === x && c.gridZ === z);
      if (cell && cell.type !== 'road' && cell.slope <= maxSlope) {
        pathTiles.push({
          gridX: cell.gridX,
          gridZ: cell.gridZ,
          position: cell.position.clone(),
          type: 'footpath',
          slope: cell.slope,
          isPath: true,
        });
      }
    }
  }

  // Ensure connectivity to key locations
  if (connectAllDistricts) {
    const keyLocations = [
      { name: 'Acropolis', ...WALKABILITY_CONFIG.KEY_LOCATIONS.ACROPOLIS },
      { name: 'Agora', ...WALKABILITY_CONFIG.KEY_LOCATIONS.AGORA },
      { name: 'Harbor', ...WALKABILITY_CONFIG.KEY_LOCATIONS.HARBOR },
    ];

    const centerX = 0, centerZ = 0; // Starting point

    for (const location of keyLocations) {
      const path = findPath(grid, centerX, centerZ, location.x, location.z, maxSlope);
      
      if (path) {
        if (IS_DEV) console.log(`[CityPlan] Path to ${location.name}: ${path.length} tiles`);
        
        // Add path tiles
        for (const cell of path) {
          if (!pathTiles.some(p => p.gridX === cell.gridX && p.gridZ === cell.gridZ)) {
            pathTiles.push({
              gridX: cell.gridX,
              gridZ: cell.gridZ,
              position: cell.position.clone(),
              type: 'connector',
              slope: cell.slope,
              isPath: true,
            });
          }
        }
      } else {
        if (IS_DEV) console.warn(`[CityPlan] No path found to ${location.name} - terrain too steep or disconnected`);
      }
    }
  }

  if (IS_DEV) console.log(`[CityPlan] Generated ${pathTiles.length} path tiles`);
  return pathTiles;
}

/**
 * Verify reachability of key buildings within max distance
 */
export function verifyReachability(grid, pathTiles, options = {}) {
  const maxDistance = options.maxDistance || WALKABILITY_CONFIG.MAX_REACHABILITY_DISTANCE;
  const results = {
    reachable: [],
    unreachable: [],
    distances: {},
  };

  const keyLocations = [
    { name: 'Acropolis', ...WALKABILITY_CONFIG.KEY_LOCATIONS.ACROPOLIS },
    { name: 'Agora', ...WALKABILITY_CONFIG.KEY_LOCATIONS.AGORA },
    { name: 'Harbor', ...WALKABILITY_CONFIG.KEY_LOCATIONS.HARBOR },
  ];

  const centerX = 0, centerZ = 0;

  if (IS_DEV) console.log('[CityPlan] Verifying reachability to key buildings...');

  for (const location of keyLocations) {
    const path = findPath(grid, centerX, centerZ, location.x, location.z);
    
    if (path) {
      const distance = path.length;
      results.distances[location.name] = distance;

      if (distance <= maxDistance) {
        results.reachable.push(location.name);
        if (IS_DEV) console.log(`[CityPlan] ✅ ${location.name}: reachable in ${distance} tiles`);
      } else {
        results.unreachable.push(location.name);
        if (IS_DEV) console.warn(`[CityPlan] ⚠️  ${location.name}: ${distance} tiles (exceeds max ${maxDistance})`);
      }
    } else {
      results.unreachable.push(location.name);
      results.distances[location.name] = Infinity;
      if (IS_DEV) console.error(`[CityPlan] ❌ ${location.name}: unreachable`);
    }
  }

  const allReachable = results.unreachable.length === 0;
  if (IS_DEV) console.log(`[CityPlan] Reachability: ${results.reachable.length}/${keyLocations.length} locations within ${maxDistance} tiles`);

  return {
    ...results,
    allReachable,
    totalLocations: keyLocations.length,
  };
}

function createPavedStrip(width, length, color = 0x888888) {
  const geometry = new THREE.BoxGeometry(width, 0.1, length);
  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.8,
    metalness: 0.1
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  return mesh;
}

function generateCityGrid(terrainSampler) {
  const cells = [];
  
  if (IS_DEV) console.log('[CityPlan] Generating terrain-aware city grid...');
  let slopeRejects = 0;
  let elevationRejects = 0;
  
  for (let gridX = MIN_X; gridX <= MAX_X; gridX++) {
    for (let gridZ = MIN_Z; gridZ <= MAX_Z; gridZ++) {
      const worldX = CITY_CENTER_ORIGIN.x + (gridX * BLOCK_SIZE);
      const worldZ = CITY_CENTER_ORIGIN.z + (gridZ * BLOCK_SIZE);
      
      const cell = {
        gridX,
        gridZ,
        position: new THREE.Vector3(worldX, getCityGroundY(), worldZ),
        type: 'building',
        district: 'residential',
        slope: 0,
        elevation: 0,
        buildable: true,
      };

      const distance = Math.sqrt((gridX * BLOCK_SIZE) ** 2 + (gridZ * BLOCK_SIZE) ** 2);

      // District Logic (Directional + Radial) - BEFORE slope analysis
      if (worldX >= HARBOR_CENTER_3D.x - BLOCK_SIZE * 1.5) {
        cell.district = 'harbor';
      } else if (distance < 60) {
        cell.district = 'sacred';
      } else if (distance >= 60 && distance < 140) {
        cell.district = 'commercial';
        
        // Commercial areas near Agora should be within civic cluster range
        if (!isWithinCivicClusterRange(worldX, worldZ)) {
          cell.district = 'residential'; // Downgrade to residential if too far
        }
      } else {
        cell.district = 'residential';
      }
      
      // Civic district must be within 30 tiles of starting point and on flat land
      if (cell.district === 'civic') {
        if (!isWithinCivicClusterRange(worldX, worldZ)) {
          cell.buildable = false;
          console.log(`[CityPlan] Civic building rejected at (${gridX}, ${gridZ}) - outside civic cluster range`);
        }
      }

      // Analyze terrain if sampler available
      if (terrainSampler) {
        const slope = getAverageSlope(terrainSampler, worldX, worldZ, BLOCK_SIZE / 2, 9);
        const elevation = getElevation(terrainSampler, worldX, worldZ);
        
        cell.slope = slope;
        cell.elevation = elevation;

        // Determine building type for slope validation
        let buildingType = 'residential';
        if (cell.district === 'sacred') buildingType = 'temple';
        else if (cell.district === 'civic') buildingType = 'civic';
        else if (cell.district === 'commercial') buildingType = 'shop';
        else if (cell.district === 'harbor') buildingType = 'warehouse';

        // Validate slope for building type
        const slopeValid = isSlopeValidForBuilding(slope, buildingType);
        
        if (!slopeValid) {
          cell.buildable = false;
          slopeRejects++;
        }

        // Extra strict validation for civic/sacred buildings (need flat land)
        if ((cell.district === 'sacred' || cell.district === 'civic') && slope > SLOPE_THRESHOLDS.FLAT) {
          cell.buildable = false;
          elevationRejects++;
        }
      }

      // Road placement (always buildable, regardless of slope)
      if (Math.abs(gridZ) <= 1) {
        cell.type = 'road'; // Main E-W avenue
        cell.buildable = true;
      } else if (gridX === 0 && cell.district !== 'sacred') {
        cell.type = 'road'; // Central N-S boulevard
        cell.buildable = true;
      } else if (cell.district === 'sacred') {
        if (gridX === 0 && gridZ === 0) {
          cell.type = 'parthenon';
          // Parthenon requires very flat land
          if (terrainSampler && cell.slope > SLOPE_THRESHOLDS.FLAT * 0.5) {
            cell.buildable = false;
          }
          // Validate landmark spacing
          if (!canPlaceLandmark(worldX, worldZ, 'parthenon')) {
            cell.buildable = false;
            console.log(`[CityPlan] Parthenon rejected at (${gridX}, ${gridZ}) - too close to other landmarks`);
          } else {
            registerLandmark(worldX, worldZ, 'parthenon');
          }
        } else {
          cell.type = 'building';
        }
      } else if (cell.district === 'commercial') {
        if (gridX % 3 === 0 || gridZ % 3 === 0) {
          cell.type = 'road';
          cell.buildable = true;
        }
      } else {
        if (gridX % 3 === 0 || gridZ % 3 === 0) {
          cell.type = 'road';
          cell.buildable = true;
        }
      }

      cells.push(cell);
    }
  }
  
  if (terrainSampler) {
    console.log(`[CityPlan] Terrain analysis: ${slopeRejects} slope rejects, ${elevationRejects} elevation rejects`);
    const totalCells = cells.length;
    const buildableCells = cells.filter(c => c.buildable && c.type !== 'road').length;
    console.log(`[CityPlan] Buildable cells: ${buildableCells}/${totalCells} (${(buildableCells/totalCells*100).toFixed(1)}%)`);
  }
  
  return cells;
}

export async function createCivicDistrict(scene, options = {}) {
  const group = new THREE.Group();
  group.name = 'CivicDistrict';
  scene.add(group);

  // Load district rules
  const districtRules = await loadDistrictRules();

  const centerOption = options.center ?? AGORA_CENTER_3D;
  const terrainSampler =
    options.heightSampler ??
    options.terrainSampler ??
    options.terrain?.userData?.getHeightAt;
  const surfaceOffset = options.surfaceOffset ?? 0.05;

  const center = centerOption instanceof THREE.Vector3
    ? centerOption.clone()
    : new THREE.Vector3(centerOption?.x ?? 0, centerOption?.y ?? 0, centerOption?.z ?? 0);

  let baseHeight = Number.isFinite(center.y) ? center.y : 0;
  if (typeof terrainSampler === 'function') {
    const sampled = terrainSampler(center.x, center.z);
    if (Number.isFinite(sampled)) {
      baseHeight = sampled;
    }
  }

  group.position.set(center.x, baseHeight, center.z);

  const sampleLocalHeight = (offsetX = 0, offsetZ = 0, fallback = 0) => {
    if (typeof terrainSampler === 'function') {
      const worldX = center.x + offsetX;
      const worldZ = center.z + offsetZ;
      const sampled = terrainSampler(worldX, worldZ);
      if (Number.isFinite(sampled)) {
        return sampled - baseHeight + surfaceOffset;
      }
    }
    return fallback + surfaceOffset;
  };

  // Generate grid with terrain analysis
  const grid = generateCityGrid(terrainSampler);

  // Generate pedestrian paths
  const pathTiles = generatePaths(grid, {
    spacing: 4,
    avoidSteepSlopes: true,
    connectAllDistricts: true,
  });

  // Verify reachability to key buildings
  const reachability = verifyReachability(grid, pathTiles, {
    maxDistance: 60, // Max 60 tiles to key buildings
  });

  group.userData.plan = {
    grid,
    pathTiles,
    reachability,
    minX: MIN_X,
    maxX: MAX_X,
    minZ: MIN_Z,
    maxZ: MAX_Z,
    blockSize: BLOCK_SIZE,
    center: center.clone()
  };

  // Pre-load textures for roads/plazas
  const tl = new THREE.TextureLoader();
  const baseUrl = typeof scene?.userData?.baseUrl === "string" ? scene.userData.baseUrl : "";
  let plazaMat;
  try {
      const baseMap = await tl.loadAsync(joinPath(baseUrl || "/", "textures/marble_base.jpg"));
      baseMap.wrapS = baseMap.wrapT = THREE.RepeatWrapping;
      baseMap.repeat.set(4, 4);
      baseMap.colorSpace = THREE.SRGBColorSpace;

      const normalMap = await tl.loadAsync(joinPath(baseUrl || "/", "textures/marble_normal-dx.jpg"));
      normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
      normalMap.repeat.set(4, 4);

      plazaMat = new THREE.MeshStandardMaterial({
          map: baseMap,
          normalMap: normalMap,
          roughness: 1,
          metalness: 0,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -1
      });
  } catch (e) {
      console.warn("Failed to load plaza textures (marble fallback)", e);
  }

  for (const cell of grid) {
    // Skip unbuildable cells (too steep or unsuitable terrain)
    if (!cell.buildable && cell.type !== 'road') {
      continue;
    }

    const localX = cell.position.x;
    const localZ = cell.position.z;
    const localY = sampleLocalHeight(localX, localZ, 0);

    // Compute world-space position to respect harbor exclusions
    const worldX = center.x + localX;
    const worldZ = center.z + localZ;
    const isInSetback = HARBOR_SETBACKS?.some?.((r) => {
      return (
        worldX >= r.west && worldX <= r.east &&
        worldZ >= r.north && worldZ <= r.south
      );
    });
    if (isInSetback) {
      continue; // Skip placing any city element inside harbor/walkway setbacks
    }

    if (cell.type === 'road') {
      // Avenue is now East-West (gridZ approx 0)
      const isMainAvenue = Math.abs(cell.gridZ) <= 1;
      const roadMesh = createPavedStrip(BLOCK_SIZE, BLOCK_SIZE, isMainAvenue ? 0x887766 : 0x666666);
      roadMesh.position.set(localX, localY, localZ);
      group.add(roadMesh);
    } else if (cell.type === 'parthenon') {
      const temple = await buildTemple({
          width: 30,
          depth: 60,
          scale: 1.5,
          order: 'doric',
          materialPreset: 'marble'
      });
      temple.position.set(localX, localY, localZ);
      // Rotate if needed? Default is probably aligned to Z.
      group.add(temple);
    } else if (cell.type === 'plaza') {
      const plazaMesh = createPavedStrip(BLOCK_SIZE - 2, BLOCK_SIZE - 2, 0xaaaaaa);
      plazaMesh.position.set(localX, localY, localZ);
      if (plazaMat) plazaMesh.material = plazaMat;
      group.add(plazaMesh);
    } else if (cell.type === 'building') {
       // Deterministic RNG
       const seed = Math.abs(cell.gridX * 73856093 ^ cell.gridZ * 19349663);
       const rng = () => {
          let t = seed + Math.sin(seed * 12.9898) * 43758.5453;
          return t - Math.floor(t);
       };

       const buildingGroup = spawnBuilding({
         district: cell.district,
         rng: rng,
         districtRules
       });

       if (buildingGroup) {
           buildingGroup.position.set(localX, localY, localZ);
           // Random 90 degree rotation
           const rot = Math.floor(rng() * 4) * (Math.PI / 2);
           buildingGroup.rotation.y = rot;
           group.add(buildingGroup);
       }
    }
  }

  // Render footpaths (non-road paths for pedestrian connectivity)
  if (IS_DEV) console.log(`[CityPlan] Rendering ${pathTiles.length} path tiles...`);
  for (const pathTile of pathTiles) {
    if (pathTile.type === 'footpath' || pathTile.type === 'connector') {
      const localX = pathTile.position.x;
      const localZ = pathTile.position.z;
      const localY = sampleLocalHeight(localX, localZ, 0);

      // Check harbor exclusion
      const worldX = center.x + localX;
      const worldZ = center.z + localZ;
      const isInSetback = HARBOR_SETBACKS?.some?.((r) => {
        return (
          worldX >= r.west && worldX <= r.east &&
          worldZ >= r.north && worldZ <= r.south
        );
      });
      if (isInSetback) continue;

      // Create narrow footpath (lighter color than roads)
      const pathWidth = pathTile.type === 'connector' ? 8 : 6;
      const pathColor = pathTile.type === 'connector' ? 0x998877 : 0xaa9988;
      const pathMesh = createPavedStrip(pathWidth, pathWidth, pathColor);
      pathMesh.position.set(localX, localY + 0.01, localZ); // Slight offset above ground
      pathMesh.userData.isFootpath = true;
      group.add(pathMesh);
    }
  }

  const walkingLoop = new THREE.CatmullRomCurve3([
      new THREE.Vector3(center.x + 10, baseHeight, center.z + 10),
      new THREE.Vector3(center.x - 10, baseHeight, center.z + 10),
      new THREE.Vector3(center.x - 10, baseHeight, center.z - 10),
      new THREE.Vector3(center.x + 10, baseHeight, center.z - 10)
  ], true);

  return {
    group,
    walkingLoop,
    plazaLength: 80, // Legacy support
    promenadeWidth: 14 // Legacy support
  };
}

export default createCivicDistrict;
