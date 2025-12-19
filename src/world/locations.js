import * as THREE from "three";
import { getSeaLevelY, setSeaLevelY, subscribeSeaLevelChange } from "./seaLevelState.js";

export { getSeaLevelY, setSeaLevelY } from "./seaLevelState.js";

const resolveSeaLevelY = () => getSeaLevelY();

export const HARBOR_CENTER_3D = new THREE.Vector3(
  -120,
  resolveSeaLevelY(),
  80,
);
export const AGORA_CENTER_3D = new THREE.Vector3(-80, resolveSeaLevelY() + 8, 40);
export const ACROPOLIS_PEAK_3D = new THREE.Vector3(-40, resolveSeaLevelY() + 14, 10);

export const HARBOR_EXCLUDE_RADIUS = 110; 
export const AGORA_RADIUS = 22;
export const ACROPOLIS_RADIUS = 18;

// --- SIZE FIX: Shrink the city boundaries drastically ---
// Reduced from 160 to 90 to contain the procedural spread
export const CITY_AREA_RADIUS = 90;
// --------------------------------------------------------

export const MIN_ABOVE_SEA = 2.0; 
export const MAX_SLOPE_DELTA = 0.35; 

export const MAIN_ROAD_WIDTH = 3.2;

export const HARBOR_CENTER = new THREE.Vector2(-120, 80);
export function getHarborSeaLevel() {
  return getSeaLevelY();
}

// --- SIZE FIX: Shrink the main grid block ---
export const CITY_CHUNK_CENTER = new THREE.Vector3(-70, resolveSeaLevelY() + 1.5, 25);
// Reduced from 90x80 to 50x50 for a compact village feel
export const CITY_CHUNK_SIZE = new THREE.Vector2(50, 50);
// --------------------------------------------

export const CITY_SEED = 0x4d534349;

export const HARBOR_WATER_RADIUS = 70; 
export const HARBOR_WATER_SIZE = new THREE.Vector2(140, 120); 
export const HARBOR_WATER_OFFSET = new THREE.Vector2(0, 0); 
export const PIER_EDGE_OFFSET = 4.5; 
export const HARBOR_WATER_EAST_LIMIT = HARBOR_CENTER_3D.x - PIER_EDGE_OFFSET + 3; 
export const HARBOR_WATER_BACK = 0; 

const HARBOR_WATER_HALF_WIDTH = 70; 
const HARBOR_WATER_HALF_DEPTH = 60; 

export const HARBOR_WATER_BOUNDS = {
  west: HARBOR_CENTER_3D.x - HARBOR_WATER_HALF_WIDTH,
  east: HARBOR_WATER_EAST_LIMIT,
  north: HARBOR_CENTER_3D.z - HARBOR_WATER_HALF_DEPTH,
  south: HARBOR_CENTER_3D.z + HARBOR_WATER_HALF_DEPTH,
};

export const HARBOR_WATER_NORMAL_CANDIDATES = [
  "textures/ground/water_normals.png",
  "textures/ground/water_normals.jpg",
  "textures/ground/waternormals.jpg",
  "textures/ground/shader.png",
  "textures/ground/step_sea.gif",
];

const HARBOR_WALKWAY_EAST = HARBOR_CENTER_3D.x + 42;
const HARBOR_WALKWAY_HALF_WIDTH = 9;

export const HARBOR_SETBACKS = [
  {
    west: HARBOR_WATER_BOUNDS.west,
    east: HARBOR_WATER_EAST_LIMIT + 3,
    north: HARBOR_WATER_BOUNDS.north,
    south: HARBOR_WATER_BOUNDS.south,
  },
  {
    west: HARBOR_WATER_EAST_LIMIT + 3,
    east: HARBOR_WALKWAY_EAST,
    north: HARBOR_CENTER_3D.z - HARBOR_WALKWAY_HALF_WIDTH,
    south: HARBOR_CENTER_3D.z + HARBOR_WALKWAY_HALF_WIDTH,
  },
];

export const HARBOR_WATER_CENTER = new THREE.Vector3(
  HARBOR_CENTER_3D.x + HARBOR_WATER_OFFSET.x,
  resolveSeaLevelY(),
  HARBOR_CENTER_3D.z + HARBOR_WATER_OFFSET.y
);

subscribeSeaLevelChange((seaLevelY) => {
  HARBOR_CENTER_3D.y = seaLevelY;
  HARBOR_WATER_CENTER.y = seaLevelY;
  AGORA_CENTER_3D.y = seaLevelY + 8;
  ACROPOLIS_PEAK_3D.y = seaLevelY + 14;
  CITY_CHUNK_CENTER.y = seaLevelY + 1.5;
});
