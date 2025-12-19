import * as THREE from "three";
import { getSeaLevelY, setSeaLevelY, subscribeSeaLevelChange } from "./seaLevelState.js";

export { getSeaLevelY, setSeaLevelY } from "./seaLevelState.js";

const resolveSeaLevelY = () => getSeaLevelY();

// Key anchors (coastal → uphill)
// FIXED: All heights are now relative to sea level to prevent desync
export const HARBOR_CENTER_3D = new THREE.Vector3(
  -120,
  resolveSeaLevelY(),
  80,
);

// Agora was hardcoded to 8; now relative (Sea + 8)
export const AGORA_CENTER_3D = new THREE.Vector3(
  -80, 
  resolveSeaLevelY() + 8, 
  40
); 

// Acropolis was hardcoded to 14; now relative (Sea + 14)
export const ACROPOLIS_PEAK_3D = new THREE.Vector3(
  -40, 
  resolveSeaLevelY() + 14, 
  10
);

// Zones
export const HARBOR_EXCLUDE_RADIUS = 110; // keep shoreline clear
export const AGORA_RADIUS = 22;
export const ACROPOLIS_RADIUS = 18;
// Expanded city footprint
export const CITY_AREA_RADIUS = 260; // expand urban plateau & HillCity sampling

// Placement safety
export const MIN_ABOVE_SEA = 2.0; // minimum building base above water
export const MAX_SLOPE_DELTA = 0.35; // 1m sample slope threshold

// Road
export const MAIN_ROAD_WIDTH = 3.2;

export const HARBOR_CENTER = new THREE.Vector2(-120, 80);
export function getHarborSeaLevel() {
  return getSeaLevelY();
}

// FIXED: City chunk now respects sea level base (Sea + 1.5m) to stay dry
export const CITY_CHUNK_CENTER = new THREE.Vector3(-70, resolveSeaLevelY() + 1.5, 25);
export const CITY_CHUNK_SIZE = new THREE.Vector2(140, 110); // city grid footprint
export const CITY_SEED = 0x4d534349;

// Harbor water extents (limit the ocean to the bay only)
export const HARBOR_WATER_RADIUS = 70; // if using circular water

// Harbor water extents (rectangle) and seaward offset
export const HARBOR_WATER_SIZE = new THREE.Vector2(140, 120); // confine water footprint to the harbor basin
export const HARBOR_WATER_OFFSET = new THREE.Vector2(0, 0); // center the water plane on the harbor location
// Keep the harbor water strictly on the seaward (western) side of the pier
export const PIER_EDGE_OFFSET = 4.5; // distance from harbor center to pier edge
export const HARBOR_WATER_EAST_LIMIT =
  HARBOR_CENTER_3D.x - PIER_EDGE_OFFSET + 3; // align with western (seaward) edge of pier
// extend water slightly under pier for visual continuity
export const HARBOR_WATER_BACK = 0; // max inland distance allowed (in Z half-extent)

const HARBOR_WATER_HALF_WIDTH = 70; // meters west of the pier (keeps water inside the harbor)
const HARBOR_WATER_HALF_DEPTH = 60; // meters north/south from harbor center

export const HARBOR_WATER_BOUNDS = {
  west: HARBOR_CENTER_3D.x - HARBOR_WATER_HALF_WIDTH,
  east: HARBOR_WATER_EAST_LIMIT,
  north: HARBOR_CENTER_3D.z - HARBOR_WATER_HALF_DEPTH,
  south: HARBOR_CENTER_3D.z + HARBOR_WATER_HALF_DEPTH,
};

// Harbor water normal maps live in public/textures/ground/. Keep the list in
// priority order (highest quality first) so the ocean helper can try each one
// until it finds an asset that loads successfully at runtime.
export const HARBOR_WATER_NORMAL_CANDIDATES = [
  "textures/ground/water_normals.png",
  "textures/ground/water_normals.jpg",
  "textures/ground/waternormals.jpg",
  "textures/ground/shader.png",
  "textures/ground/step_sea.gif",
];

// Keep procedural buildings off the pier deck and pedestrian walkway.
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

// Convenience centers
export const HARBOR_WATER_CENTER = new THREE.Vector3(
  HARBOR_CENTER_3D.x + HARBOR_WATER_OFFSET.x,
  resolveSeaLevelY(),
  HARBOR_CENTER_3D.z + HARBOR_WATER_OFFSET.y
);

// Subscribe to changes so the whole city lifts/drops with the tide configuration
subscribeSeaLevelChange((seaLevelY) => {
  HARBOR_CENTER_3D.y = seaLevelY;
  HARBOR_WATER_CENTER.y = seaLevelY;
  
  // Update city districts relative to new sea level
  AGORA_CENTER_3D.y = seaLevelY + 8;
  ACROPOLIS_PEAK_3D.y = seaLevelY + 14;
  CITY_CHUNK_CENTER.y = seaLevelY + 1.5;
});
