import * as THREE from 'three';
import { ACROPOLIS_PEAK_3D, AGORA_CENTER_3D, HARBOR_CENTER_3D, HARBOR_SETBACKS, HARBOR_WATER_BOUNDS, CITY_CENTER_ORIGIN, getCityGroundY } from './locations.js';
import { resolveBaseUrl, joinPath } from '../utils/baseUrl.js';
import { applyNormalMapConvention } from "../materials/normalMapUtils.js";
import { IS_DEV } from '../utils/env.js';
import { Prefabs, spawnBuilding } from './buildingSpawner.js';
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
const BLOCK_SIZE = 36; // Tighter block size keeps the city readable and walkable.
const AGORA_PLAZA_RADIUS = 2;
const AGORA_CIVIC_RADIUS = BLOCK_SIZE * 2.1;
const AGORA_MARKET_RADIUS = BLOCK_SIZE * 3.2;
const ACROPOLIS_SACRED_RADIUS = BLOCK_SIZE * 1.2;

// District Spacing Rules
export const SPACING_RULES = {
  CIVIC_CLUSTER_MAX_DISTANCE: 30 * BLOCK_SIZE, // 30 tiles from starting point (1440m)
};

// Walkability Grid Constants
export const WALKABILITY_CONFIG = {
  PATH_SPACING: 4, // Tiles between paths
  MAX_PATH_SLOPE: SLOPE_THRESHOLDS.MODERATE, // 0.75 max slope for paths
  MAX_REACHABILITY_DISTANCE: 60, // Max tiles to key buildings
  KEY_LOCATIONS: {
    ACROPOLIS: { x: 0, z: -5 }, // Grid coords
    AGORA: { x: 0, z: 0 },
    HARBOR: { x: 2, z: 0 }, // City-side harbor gate, not the open waterfront
  },
};

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
      if (neighbor && !neighbor.blocked && neighbor.slope <= maxSlope) {
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
    if (!cell.blocked && cell.type === 'road') {
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
      if (cell && !cell.blocked && cell.type !== 'road' && cell.slope <= maxSlope) {
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

function createPavedStrip(width, length, color = 0xb09370) {
  const geometry = new THREE.BoxGeometry(width, 0.04, length);
  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.92,
    metalness: 0.02
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  return mesh;
}

function enableShadowProps(group) {
  group.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
  });
}

function createBannerStand(color = 0xc99b43) {
  const group = new THREE.Group();

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 3.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x7a6449, roughness: 0.78, metalness: 0.04 }),
  );
  pole.position.y = 1.8;
  group.add(pole);

  const cloth = new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, 1.6),
    new THREE.MeshStandardMaterial({
      color,
      side: THREE.DoubleSide,
      roughness: 0.7,
      metalness: 0.02,
    }),
  );
  cloth.position.set(0.6, 2.3, 0);
  group.add(cloth);

  enableShadowProps(group);
  return group;
}

function createAgoraPlazaAccent() {
  const group = new THREE.Group();
  group.name = "AgoraPlazaAccent";

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(5.6, 6.1, 0.45, 18),
    new THREE.MeshStandardMaterial({ color: 0xb7a07b, roughness: 0.88, metalness: 0.03 }),
  );
  plinth.position.y = 0.22;
  group.add(plinth);

  const basin = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.7, 0.7, 16),
    new THREE.MeshStandardMaterial({ color: 0xcbbca1, roughness: 0.82, metalness: 0.03 }),
  );
  basin.position.y = 0.62;
  group.add(basin);

  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.34, 2.7, 12),
    new THREE.MeshStandardMaterial({ color: 0xc7b79b, roughness: 0.78, metalness: 0.03 }),
  );
  pillar.position.y = 2;
  group.add(pillar);

  for (const [x, z, rot] of [
    [-7, -7, 0.08],
    [7, -7, -0.05],
    [-7, 7, 0.03],
    [7, 7, -0.08],
  ]) {
    const banner = createBannerStand(0xd0a046);
    banner.position.set(x, 0, z);
    banner.rotation.y = rot;
    group.add(banner);
  }

  enableShadowProps(group);
  return group;
}

function createAgoraPerimeterAccent(gridX, gridZ) {
  const group = new THREE.Group();
  group.name = "AgoraPerimeterAccent";

  const absX = Math.abs(gridX);
  const absZ = Math.abs(gridZ);
  const isCorner = absX === AGORA_PLAZA_RADIUS && absZ === AGORA_PLAZA_RADIUS;

  if (isCorner) {
    const podium = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 0.45, 2.2),
      new THREE.MeshStandardMaterial({ color: 0xbda989, roughness: 0.84, metalness: 0.02 }),
    );
    podium.position.set(0, 0.22, 0);
    group.add(podium);

    const jar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.24, 1.1, 10),
      new THREE.MeshStandardMaterial({ color: 0xbe8a63, roughness: 0.68, metalness: 0.04 }),
    );
    jar.position.set(-0.8, 0.92, 0.1);
    group.add(jar);

    const banner = createBannerStand(0xb8843a);
    banner.position.set(1.15, 0, 0);
    group.add(banner);
  } else {
    const stylobate = new THREE.Mesh(
      new THREE.BoxGeometry(10.5, 0.36, 2.8),
      new THREE.MeshStandardMaterial({ color: 0xbca98b, roughness: 0.86, metalness: 0.02 }),
    );
    stylobate.position.set(0, 0.18, 0.35);
    group.add(stylobate);

    for (const x of [-3.1, 0, 3.1]) {
      const column = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.24, 3.2, 12),
        new THREE.MeshStandardMaterial({ color: 0xcab99d, roughness: 0.76, metalness: 0.02 }),
      );
      column.position.set(x, 1.78, 0.55);
      group.add(column);
    }

    const lintel = new THREE.Mesh(
      new THREE.BoxGeometry(8.8, 0.32, 0.7),
      new THREE.MeshStandardMaterial({ color: 0xc1ae90, roughness: 0.8, metalness: 0.02 }),
    );
    lintel.position.set(0, 3.42, 0.55);
    group.add(lintel);

    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 0.42, 1.05),
      new THREE.MeshStandardMaterial({ color: 0xad9878, roughness: 0.86, metalness: 0.02 }),
    );
    bench.position.set(0, 0.64, -1.1);
    group.add(bench);
  }

  enableShadowProps(group);
  return group;
}

function createCommercialAccent(rng) {
  const group = new THREE.Group();
  group.name = "CommercialAccent";

  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 0.18, 1.8),
    new THREE.MeshStandardMaterial({ color: rng() < 0.5 ? 0xc06b3c : 0xd4b064, roughness: 0.74, metalness: 0.02 }),
  );
  awning.position.set(0, 2.2, 1.6);
  group.add(awning);

  for (const side of [-1.35, 1.35]) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.08, 2.1, 8),
      new THREE.MeshStandardMaterial({ color: 0x7c6447, roughness: 0.82, metalness: 0.03 }),
    );
    post.position.set(side, 1.05, 1.45);
    group.add(post);
  }

  const crate = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.6, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x8b6a46, roughness: 0.84, metalness: 0.02 }),
  );
  crate.position.set(-0.8, 0.3, 2.2);
  group.add(crate);

  const jar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.16, 0.72, 10),
    new THREE.MeshStandardMaterial({ color: 0xc08a66, roughness: 0.64, metalness: 0.05 }),
  );
  jar.position.set(0.9, 0.36, 2.1);
  group.add(jar);

  enableShadowProps(group);
  return group;
}

function createHarborFrontAccent(rng) {
  const group = new THREE.Group();
  group.name = "HarborFrontAccent";

  const cargo = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.78, 1.3),
    new THREE.MeshStandardMaterial({ color: 0x8a6b4a, roughness: 0.86, metalness: 0.02 }),
  );
  cargo.position.set(-0.6, 0.39, 1.6);
  group.add(cargo);

  const jar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.18, 0.84, 10),
    new THREE.MeshStandardMaterial({ color: 0xbd8763, roughness: 0.62, metalness: 0.04 }),
  );
  jar.position.set(0.8, 0.42, 1.9);
  group.add(jar);

  const netFrame = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.08, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x6a5740, roughness: 0.88, metalness: 0.03 }),
  );
  netFrame.position.set(0, 0.08, -1.6);
  group.add(netFrame);

  const canopy = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.16, 1.5),
    new THREE.MeshStandardMaterial({ color: rng() < 0.5 ? 0x2e7c9a : 0x4b93aa, roughness: 0.72, metalness: 0.02 }),
  );
  canopy.position.set(0, 2.1, 1.45);
  group.add(canopy);

  for (const side of [-1.05, 1.05]) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.08, 2.0, 8),
      new THREE.MeshStandardMaterial({ color: 0x725b44, roughness: 0.82, metalness: 0.03 }),
    );
    post.position.set(side, 1.0, 1.3);
    group.add(post);
  }

  enableShadowProps(group);
  return group;
}

function createSacredAccent() {
  const group = new THREE.Group();
  group.name = "SacredAccent";

  for (const side of [-1.1, 1.1]) {
    const column = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 3.8, 12),
      new THREE.MeshStandardMaterial({ color: 0xdfd3bc, roughness: 0.54, metalness: 0.03 }),
    );
    column.position.set(side, 1.9, 1.2);
    group.add(column);
  }

  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.28, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xd0c1a7, roughness: 0.62, metalness: 0.03 }),
  );
  lintel.position.set(0, 3.7, 1.2);
  group.add(lintel);

  const altar = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.9, 1.1),
    new THREE.MeshStandardMaterial({ color: 0xc4b59a, roughness: 0.76, metalness: 0.03 }),
  );
  altar.position.set(0, 0.45, -1.2);
  group.add(altar);

  const flame = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.22, 0),
    new THREE.MeshStandardMaterial({
      color: 0xffd28b,
      emissive: 0xffc36f,
      emissiveIntensity: 0.72,
      roughness: 0.2,
      metalness: 0,
    }),
  );
  flame.position.set(0, 1.15, -1.2);
  group.add(flame);

  enableShadowProps(group);
  return group;
}

function isWithinSetbackRect(x, z, rect) {
  if (!rect) return false;
  const west = Math.min(rect.west, rect.east);
  const east = Math.max(rect.west, rect.east);
  const south = Math.min(rect.south, rect.north);
  const north = Math.max(rect.south, rect.north);
  return x >= west && x <= east && z >= south && z <= north;
}

function isInAuthoredHarborFront(worldX, worldZ) {
  const harborNorth = Math.max(HARBOR_WATER_BOUNDS.north, HARBOR_WATER_BOUNDS.south);
  const harborSouth = Math.min(HARBOR_WATER_BOUNDS.north, HARBOR_WATER_BOUNDS.south);
  const harborWestCutoff = HARBOR_CENTER_3D.x - BLOCK_SIZE * 2.1;
  const harborZPadding = BLOCK_SIZE * 1.9;

  return (
    worldX >= harborWestCutoff &&
    worldZ >= harborSouth - harborZPadding &&
    worldZ <= harborNorth + harborZPadding
  );
}

function isBlockedForCityLayout(worldX, worldZ) {
  const isInSetback = HARBOR_SETBACKS?.some?.((rect) =>
    isWithinSetbackRect(worldX, worldZ, rect),
  );
  return isInSetback || isInAuthoredHarborFront(worldX, worldZ);
}

function resolveDistrictForCell(worldX, worldZ) {
  const harborDistance = Math.hypot(worldX - HARBOR_CENTER_3D.x, worldZ - HARBOR_CENTER_3D.z);
  const agoraDistance = Math.hypot(worldX - AGORA_CENTER_3D.x, worldZ - AGORA_CENTER_3D.z);
  const acropolisDistance = Math.hypot(worldX - ACROPOLIS_PEAK_3D.x, worldZ - ACROPOLIS_PEAK_3D.z);

  if (harborDistance <= BLOCK_SIZE * 3.1 || worldX >= HARBOR_CENTER_3D.x - BLOCK_SIZE * 1.25) {
    return "harbor";
  }

  if (acropolisDistance <= ACROPOLIS_SACRED_RADIUS) {
    return "sacred";
  }

  if (agoraDistance <= AGORA_CIVIC_RADIUS && isWithinCivicClusterRange(worldX, worldZ)) {
    return "civic";
  }

  if (agoraDistance <= AGORA_MARKET_RADIUS && isWithinCivicClusterRange(worldX, worldZ)) {
    return "commercial";
  }

  return "residential";
}

function resolveDistrictRuleForCell(district, rulesManifest, cell = null) {
  const match = rulesManifest?.districts?.find?.((rule) => rule?.id === district);
  if (!match) return null;

  const civicDistance = cell
    ? Math.hypot(cell.position.x - AGORA_CENTER_3D.x, cell.position.z - AGORA_CENTER_3D.z)
    : Infinity;

  if (district === 'civic') {
    if (cell && isAgoraFramingCell(cell.gridX, cell.gridZ)) {
      return {
        ...match,
        allowedTypes: ['stoa', 'monument'],
        heightRange: [3.2, 4.2],
        courtyardChance: 0,
      };
    }

    return {
      ...match,
      // Keep the Agora ring focused on lower stoas and monuments instead of large temple massing.
      allowedTypes: Array.isArray(match.allowedTypes)
        ? match.allowedTypes.filter((type) => type !== 'temple')
        : ['stoa', 'monument', 'plaza'],
      heightRange: [3.4, 4.8],
      courtyardChance: 0,
    };
  }

  if (district === 'commercial' && civicDistance <= AGORA_MARKET_RADIUS) {
    if (cell && isAgoraFramingCell(cell.gridX, cell.gridZ)) {
      return {
        ...match,
        allowedTypes: ['stoa', 'monument'],
        heightRange: [3.0, 4.0],
        courtyardChance: 0,
      };
    }

    return {
      ...match,
      heightRange: [3.2, 4.6],
    };
  }

  return match;
}

function isAgoraPlazaCell(gridX, gridZ) {
  return Math.abs(gridX) <= AGORA_PLAZA_RADIUS && Math.abs(gridZ) <= AGORA_PLAZA_RADIUS;
}

function isAgoraPlazaPerimeterCell(gridX, gridZ) {
  return isAgoraPlazaCell(gridX, gridZ) && Math.max(Math.abs(gridX), Math.abs(gridZ)) === AGORA_PLAZA_RADIUS;
}

function isAgoraFramingCell(gridX, gridZ) {
  const framingRing = AGORA_PLAZA_RADIUS + 1;
  return Math.abs(gridZ) === framingRing && Math.abs(gridX) <= 1;
}

function getAgoraPlazaAccentRotation(gridX, gridZ) {
  if (gridZ === -AGORA_PLAZA_RADIUS && gridX === 0) return 0;
  if (gridX === AGORA_PLAZA_RADIUS && gridZ === 0) return -Math.PI / 2;
  if (gridZ === AGORA_PLAZA_RADIUS && gridX === 0) return Math.PI;
  if (gridX === -AGORA_PLAZA_RADIUS && gridZ === 0) return Math.PI / 2;
  return Math.atan2(-gridX, -gridZ);
}

function applyAgoraScalePass(buildingGroup, cell) {
  if (!buildingGroup || !cell) return;

  if (isAgoraFramingCell(cell.gridX, cell.gridZ)) {
    buildingGroup.scale.multiplyScalar(0.84);
    return;
  }

  const agoraDistance = Math.hypot(cell.position.x - AGORA_CENTER_3D.x, cell.position.z - AGORA_CENTER_3D.z);
  if (cell.district === 'civic' && agoraDistance <= AGORA_CIVIC_RADIUS + BLOCK_SIZE * 0.5) {
    buildingGroup.scale.multiplyScalar(0.82);
  } else if (cell.district === 'commercial' && agoraDistance <= AGORA_MARKET_RADIUS) {
    buildingGroup.scale.multiplyScalar(0.9);
  }
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
        blocked: false,
      };

      cell.district = resolveDistrictForCell(worldX, worldZ);

      if (isBlockedForCityLayout(worldX, worldZ)) {
        cell.type = 'blocked';
        cell.buildable = false;
        cell.blocked = true;
        cells.push(cell);
        continue;
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

      // Keep the Agora core open as a readable civic plaza.
      if (isAgoraPlazaCell(gridX, gridZ)) {
        cell.type = 'plaza';
        cell.district = 'commercial';
        cell.buildable = true;
      } else if (Math.abs(gridZ) <= 1) {
        cell.type = 'road'; // Main E-W avenue
        cell.buildable = true;
      } else if (Math.abs(gridX) <= 1 && cell.district !== 'sacred') {
        cell.type = 'road'; // Central N-S boulevard
        cell.buildable = true;
      } else if (cell.district === 'sacred') {
        cell.type = 'building';
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
  const resolvedBase = baseUrl || resolveBaseUrl();
  let plazaMat;
  try {
      const baseMap = await tl.loadAsync(joinPath(resolvedBase, "textures/marble_base.jpg"));
      baseMap.wrapS = baseMap.wrapT = THREE.RepeatWrapping;
      baseMap.repeat.set(4, 4);
      baseMap.colorSpace = THREE.SRGBColorSpace;

      const normalUrl = joinPath(resolvedBase, "textures/marble_normal-dx.jpg");
      const normalMap = await tl.loadAsync(normalUrl);
      applyNormalMapConvention(normalMap, normalUrl);
      normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
      normalMap.repeat.set(4, 4);

      plazaMat = new THREE.MeshStandardMaterial({
          color: 0xbca98a,
          map: baseMap,
          normalMap: normalMap,
          normalScale: new THREE.Vector2(0.35, 0.35),
          roughness: 1,
          metalness: 0,
          envMapIntensity: 0.08,
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

    const localX = cell.position.x - center.x;
    const localZ = cell.position.z - center.z;
    const localY = sampleLocalHeight(localX, localZ, 0);

    // Compute world-space position to respect harbor exclusions
    const worldX = cell.position.x;
    const worldZ = cell.position.z;
    if (isBlockedForCityLayout(worldX, worldZ)) {
      continue; // Skip placing any city element inside harbor/walkway setbacks
    }

    if (cell.type === 'road') {
      // Avenue is now East-West (gridZ approx 0)
      const isMainAvenue = Math.abs(cell.gridZ) <= 1;
      const roadMesh = createPavedStrip(BLOCK_SIZE, BLOCK_SIZE, isMainAvenue ? 0xb0895f : 0xa48463);
      roadMesh.position.set(localX, localY - 0.01, localZ);
      group.add(roadMesh);
    } else if (cell.type === 'plaza') {
      const plazaMesh = createPavedStrip(BLOCK_SIZE - 2, BLOCK_SIZE - 2, 0xb29e7e);
      plazaMesh.position.set(localX, localY, localZ);
      if (plazaMat) plazaMesh.material = plazaMat;
      group.add(plazaMesh);
      if (cell.gridX === 0 && cell.gridZ === 0) {
        const plazaAccent = createAgoraPlazaAccent();
        plazaAccent.position.set(localX, localY, localZ);
        group.add(plazaAccent);
      } else if (isAgoraPlazaPerimeterCell(cell.gridX, cell.gridZ)) {
        const perimeterAccent = createAgoraPerimeterAccent(cell.gridX, cell.gridZ);
        perimeterAccent.position.set(localX, localY, localZ);
        perimeterAccent.rotation.y = getAgoraPlazaAccentRotation(cell.gridX, cell.gridZ);
        group.add(perimeterAccent);
      }
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
         districtRules: resolveDistrictRuleForCell(cell.district, districtRules, cell),
       });

      if (buildingGroup) {
           if (cell.district === 'harbor') {
             // Keep the generic city kit out of the waterfront so the authored
             // harbor owns that destination space more clearly.
             if (rng() < 0.6) {
               const lowAccent = createHarborFrontAccent(rng);
               lowAccent.position.set(localX, localY, localZ);
               lowAccent.rotation.y = Math.floor(rng() * 4) * (Math.PI / 2);
               group.add(lowAccent);
             }
             continue;
           }

           applyAgoraScalePass(buildingGroup, cell);
           buildingGroup.position.set(localX, localY, localZ);
           // Random 90 degree rotation
           const rot = Math.floor(rng() * 4) * (Math.PI / 2);
           buildingGroup.rotation.y = rot;
           group.add(buildingGroup);

           let districtAccent = null;
           if (isAgoraFramingCell(cell.gridX, cell.gridZ)) {
             districtAccent = null;
           } else if (cell.district === 'commercial' && rng() < 0.38) {
             districtAccent = createCommercialAccent(rng);
           } else if (cell.district === 'harbor' && rng() < 0.44) {
             districtAccent = createHarborFrontAccent(rng);
           } else if (cell.district === 'sacred' && rng() < 0.34) {
             districtAccent = createSacredAccent();
           }

           if (districtAccent) {
             districtAccent.position.set(localX, localY, localZ);
             districtAccent.rotation.y = rot;
             group.add(districtAccent);
           }
       }
    }
  }

  // Render footpaths (non-road paths for pedestrian connectivity)
  if (IS_DEV) console.log(`[CityPlan] Rendering ${pathTiles.length} path tiles...`);
  for (const pathTile of pathTiles) {
    if (pathTile.type === 'footpath' || pathTile.type === 'connector') {
      const localX = pathTile.position.x - center.x;
      const localZ = pathTile.position.z - center.z;
      const localY = sampleLocalHeight(localX, localZ, 0);

      // Check harbor exclusion
      const worldX = pathTile.position.x;
      const worldZ = pathTile.position.z;
      if (isBlockedForCityLayout(worldX, worldZ)) continue;

      // Create narrow footpath (lighter color than roads)
      const pathWidth = pathTile.type === 'connector' ? 8 : 6;
      const pathColor = pathTile.type === 'connector' ? 0xc0a07b : 0xcfb18e;
      const pathMesh = createPavedStrip(pathWidth, pathWidth, pathColor);
      pathMesh.position.set(localX, localY + 0.004, localZ); // Keep the path visible without exposing dark side faces
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
