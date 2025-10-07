import * as THREE from "three";

const EXISTING_SEA_LEVEL_Y =
  typeof globalThis !== "undefined" &&
  typeof globalThis.SEA_LEVEL_Y !== "undefined"
    ? globalThis.SEA_LEVEL_Y
    : undefined;

// HILL-CITY (Archetype 1) constants
export const SEA_LEVEL_Y =
  typeof EXISTING_SEA_LEVEL_Y !== "undefined" ? EXISTING_SEA_LEVEL_Y : 0; // keep existing if defined

// Key anchors
export const HARBOR_CENTER_3D = new THREE.Vector3(-120, SEA_LEVEL_Y, 80);
export const ACROPOLIS_PEAK_3D = new THREE.Vector3(-40, 12, 10); // elevated inland focal point
export const AGORA_CENTER_3D = new THREE.Vector3(-80, 6, 40); // mid-terrace civic plaza

// Zones (radius in world units)
export const HARBOR_EXCLUDE_RADIUS = 70; // keep water clear
export const AGORA_RADIUS = 22; // flat(ish) plaza
export const ACROPOLIS_RADIUS = 18; // temple/council terrace

// Terrain/placement rules
export const MIN_ABOVE_SEA = 1.0; // buildings must be above water by this margin
export const MAX_SLOPE_DELTA = 0.35; // max allowed height change over ~1m sample
export const CITY_AREA_RADIUS = 180; // overall distribution radius

// Road
export const MAIN_ROAD_WIDTH = 3.2;

export const HARBOR_CENTER = new THREE.Vector2(-120, 80);
export const HARBOR_SEA_LEVEL = SEA_LEVEL_Y;

export const CITY_CHUNK_CENTER = new THREE.Vector3(-70, 0, 25);
export const CITY_CHUNK_SIZE = new THREE.Vector2(72, 54);
export const CITY_SEED = 0x4d534349;
