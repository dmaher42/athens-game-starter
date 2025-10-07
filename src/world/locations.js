import * as THREE from "three";

const EXISTING_SEA_LEVEL_Y =
  typeof globalThis !== "undefined" &&
  typeof globalThis.SEA_LEVEL_Y !== "undefined"
    ? globalThis.SEA_LEVEL_Y
    : undefined;

export const SEA_LEVEL_Y =
  typeof EXISTING_SEA_LEVEL_Y !== "undefined" ? EXISTING_SEA_LEVEL_Y : 0; // can tweak later
// export const SEA_LEVEL_Y = -0.3; // uncomment to lower globally

// Key anchors (coastal → uphill)
export const HARBOR_CENTER_3D = new THREE.Vector3(-120, SEA_LEVEL_Y, 80);
export const AGORA_CENTER_3D = new THREE.Vector3(-80, 8, 40); // slightly higher than sea
export const ACROPOLIS_PEAK_3D = new THREE.Vector3(-40, 14, 10); // hill crown

// Zones
export const HARBOR_EXCLUDE_RADIUS = 110; // keep shoreline clear
export const AGORA_RADIUS = 22;
export const ACROPOLIS_RADIUS = 18;
export const CITY_AREA_RADIUS = 180;

// Placement safety
export const MIN_ABOVE_SEA = 2.0; // minimum building base above water
export const MAX_SLOPE_DELTA = 0.35; // 1m sample slope threshold

// Road
export const MAIN_ROAD_WIDTH = 3.2;

export const HARBOR_CENTER = new THREE.Vector2(-120, 80);
export const HARBOR_SEA_LEVEL = SEA_LEVEL_Y;

export const CITY_CHUNK_CENTER = new THREE.Vector3(-70, 0, 25);
export const CITY_CHUNK_SIZE = new THREE.Vector2(72, 54);
export const CITY_SEED = 0x4d534349;
