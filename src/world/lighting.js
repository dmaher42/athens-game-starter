// src/world/lighting.js

import {
  Color,
  DirectionalLight,
  HemisphereLight,
  Vector3
} from "three";

// Precreate colors to reuse and avoid allocations every frame
const SUN_COLOR_DAWN = new Color("#ffb37f");
const SUN_COLOR_NOON = new Color("#ffffff");
const SUN_COLOR_DUSK = new Color("#ff9f76");

const SKY_COLOR_NIGHT = new Color("#0b1d51");
const SKY_COLOR_DAY = new Color("#bde0fe");
const GROUND_COLOR_NIGHT = new Color("#1f1f2e");
const GROUND_COLOR_DAY = new Color("#9d8189");

const scratchColor = new Color();
const scratchDirection = new Vector3();

function lerpColor(target, colorA, colorB, t) {
  return target.copy(colorA).lerp(colorB, t);
}

export function createLighting(scene) {
  const sunLight = new DirectionalLight(0xffffff, 1.0);
  sunLight.castShadow = true;
  scene.add(sunLight);
  scene.add(sunLight.target);

  const hemiLight = new HemisphereLight(SKY_COLOR_DAY, GROUND_COLOR_DAY, 0.6);
  scene.add(hemiLight);

  return { sunLight, hemiLight };
}

export function updateLighting(lights, sunDirection) {
  if (!lights || !lights.sunLight || !lights.hemiLight) {
    return;
  }

  const { sunLight, hemiLight } = lights;

  const normalized = scratchDirection.copy(sunDirection).normalize();

  sunLight.position
    .copy(normalized)
    .multiplyScalar(100);
  sunLight.target.position.set(0, 0, 0);
  sunLight.target.updateMatrixWorld();

  const elevation = Math.max(normalized.y, 0);

  const sunWarmth = 1 - elevation;
  const sunColor = lerpColor(scratchColor, SUN_COLOR_DAWN, SUN_COLOR_NOON, elevation)
    .lerp(SUN_COLOR_DUSK, sunWarmth * 0.5);
  sunLight.color.copy(sunColor);
  sunLight.intensity = 0.2 + elevation * 1.3;

  const skyMix = elevation;
  lerpColor(hemiLight.color, SKY_COLOR_NIGHT, SKY_COLOR_DAY, skyMix);
  lerpColor(hemiLight.groundColor, GROUND_COLOR_NIGHT, GROUND_COLOR_DAY, skyMix);
  hemiLight.intensity = 0.3 + skyMix * 0.7;
}
