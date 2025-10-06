import * as THREE from "three";

export const SEA_LEVEL = -0.8;

export const HARBOR_CENTER = new THREE.Vector2(-120, 80);
export const HARBOR_CENTER_3D = new THREE.Vector3(
  HARBOR_CENTER.x,
  SEA_LEVEL,
  HARBOR_CENTER.y
);
export const HARBOR_EXCLUSION_RADIUS = 32;
export const HARBOR_SEA_LEVEL = SEA_LEVEL;
