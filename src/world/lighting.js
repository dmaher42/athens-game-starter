// src/world/lighting.js

import {
  DirectionalLight,
  HemisphereLight,
  Color,
  Vector3
} from "three";

// Pre-create color constants so we do not reallocate each frame
const SUN_COLOR_DAWN = new Color("#ffb37f");
const SUN_COLOR_NOON = new Color("#ffffff");
const SUN_COLOR_DUSK = new Color("#ff9f76");

const SKY_COLOR_NIGHT = new Color("#0b1d51");
const SKY_COLOR_DAY = new Color("#bde0fe");
const GROUND_COLOR_NIGHT = new Color("#1f1f2e");
const GROUND_COLOR_DAY = new Color("#9d8189");

const scratchColor = new Color();
const scratchDir = new Vector3();

function lerpColor(target, c0, c1, t) {
  target.copy(c0).lerp(c1, t);
  return target;
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

export function updateLighting(lights, sunDir) {
  if (!lights || !lights.sunLight || !lights.hemiLight) {
    return;
  }
  const { sunLight, hemiLight } = lights;

  const norm = scratchDir.copy(sunDir).normalize();

  // Position “sun” far away in that direction
  sunLight.position.copy(norm).multiplyScalar(100);
  sunLight.target.position.set(0, 0, 0);
  sunLight.target.updateMatrixWorld();

  // Elevation = y component (0 = horizon, >0 = above horizon)
  const elevation = Math.max(norm.y, 0);

  // Interpolate sun color
  const warmth = 1 - elevation;
  const c0 = lerpColor(scratchColor, SUN_COLOR_DAWN, SUN_COLOR_NOON, elevation);
  const sunColor = c0.lerp(SUN_COLOR_DUSK, warmth * 0.5);
  sunLight.color.copy(sunColor);

  // Adjust intensity: dim at horizon, strong near midday
  sunLight.intensity = 0.2 + elevation * 1.3;

  // Hemisphere (ambient) blending between night/day
  const mix = elevation;
  hemiLight.intensity = 0.3 + mix * 0.7;
  lerpColor(hemiLight.color, SKY_COLOR_NIGHT, SKY_COLOR_DAY, mix);
  lerpColor(hemiLight.groundColor, GROUND_COLOR_NIGHT, GROUND_COLOR_DAY, mix);
}
