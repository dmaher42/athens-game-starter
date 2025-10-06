import * as THREE from "three";

export const SEA_LEVEL_Y = -0.8;

export const HARBOR_CENTER = new THREE.Vector2(-120, 80);
export const HARBOR_CENTER_3D = new THREE.Vector3(
  HARBOR_CENTER.x,
  SEA_LEVEL_Y,
  HARBOR_CENTER.y
);
export const HARBOR_SEA_LEVEL = SEA_LEVEL_Y;
export const HARBOR_MAIN_LENGTH = 70;
export const HARBOR_MAIN_WIDTH = 9;
export const HARBOR_APPROACH_LENGTH = 32;
export const HARBOR_SPUR_LENGTH = 24;
export const HARBOR_POST_SPACING = 6;
export const HARBOR_DECK_HEIGHT = 1.4;

export const HARBOR_GEOMETRY = Object.freeze({
  deckThickness: 0.6,
  approachDeckThickness: 0.5,
  spurDeckThickness: 0.45,
  approachWidthReduction: 2,
  spurWidthReduction: 4,
  spurOffsetX: 1.2,
  spurOffsetZ: 2,
  railingThickness: 0.2,
  railingHeight: 1.1,
  railingYOffset: 0.8,
  railingOffsetX: 0.6,
  postInset: 0.6,
  postHeightBelowDeck: 3,
  walkwayLampOffset: 4,
});

export const HARBOR_POST_RADII = Object.freeze({
  pier: Object.freeze({ top: 0.45, bottom: 0.55 }),
  walkway: Object.freeze({ top: 0.4, bottom: 0.5 }),
});

export const HARBOR_LAMP_CONFIG = Object.freeze({
  pole: Object.freeze({ radiusTop: 0.12, radiusBottom: 0.16, height: 4 }),
  arm: Object.freeze({
    size: Object.freeze({ x: 0.2, y: 0.2, z: 1.6 }),
    height: 3.4,
    forwardOffset: 0.6,
  }),
  bulb: Object.freeze({
    radius: 0.28,
    height: 3.2,
    forwardOffset: 1.2,
    emissiveColor: 0xfff2c8,
  }),
  light: Object.freeze({ color: 0xfff2c8, range: 18, decay: 2 }),
  baseIntensity: 1.4,
});

export const CITY_CHUNK_CENTER = new THREE.Vector3(-70, 0, 25);
export const CITY_CHUNK_SIZE = new THREE.Vector2(72, 54);
export const CITY_SEED = 0x4d534349;
export const CITY_SPACING_X = 11;
export const CITY_SPACING_Z = 10;
export const CITY_JITTER = 2.2;
export const CITY_MAX_SLOPE = 1.4;

export const CITY_LAYOUT = Object.freeze({
  emptyLotChance: 0.18,
  rotationSteps: 4,
  walkway: Object.freeze({
    sampleCount: 5,
    spanFactor: 0.6,
    amplitudeFactor: 0.45,
    waveFrequency: 1.2,
    phaseOffset: -Math.PI * 0.3,
    heightOffset: 0.02,
    width: 3.2,
    segments: 64,
    color: 0x4b3f35,
    name: "CityWalkway",
    noCollision: true,
  }),
  building: Object.freeze({
    widthRange: Object.freeze([4.4, 7.2]),
    depthRange: Object.freeze([4.2, 7.8]),
    wallHeightRange: Object.freeze([2.6, 3.8]),
    roofHeightRatioRange: Object.freeze([0.38, 0.55]),
    roofScale: 1.04,
  }),
  lighting: Object.freeze({ dayIntensity: 0.08, nightIntensity: 1.35 }),
});

export const CITY_COLOR_RANGES = Object.freeze({
  wallHue: Object.freeze([0.08, 0.13]),
  wallSaturation: 0.45,
  wallLightness: Object.freeze([0.62, 0.74]),
  roofHue: Object.freeze([0.02, 0.04]),
  roofSaturation: 0.55,
  roofLightness: Object.freeze([0.23, 0.32]),
});
