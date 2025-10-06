import * as THREE from "three";

export const SEA_LEVEL_Y = -0.8;

export const HARBOR_CENTER = new THREE.Vector2(-120, 80);
export const HARBOR_CENTER_3D = new THREE.Vector3(
  HARBOR_CENTER.x,
  SEA_LEVEL_Y,
  HARBOR_CENTER.y
);
export const HARBOR_SEA_LEVEL = SEA_LEVEL_Y;

export const CITY_CHUNK_CENTER = new THREE.Vector3(-70, 0, 25);
export const CITY_CHUNK_SIZE = new THREE.Vector2(72, 54);
export const CITY_SEED = 0x4d534349;
