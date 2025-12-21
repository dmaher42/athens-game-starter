// src/world/lighting.js

import { DirectionalLight, HemisphereLight, Color, Vector3, MathUtils } from "three";

// --- COLORS CONFIGURATION ---

const SUN_COLOR_DAWN = new Color("#ffb37f");
// Golden-leaning noon sun to add warmth to highlights
const SUN_COLOR_NOON = new Color("#f8cfa1");
const SUN_COLOR_DUSK = new Color("#ff9b6a");

const SKY_COLOR_NIGHT = new Color("#0b1d51");
// Cooler skylight to keep shadows blue-toned
const SKY_COLOR_DAY = new Color("#8eaad8");

const GROUND_COLOR_NIGHT = new Color("#1f1f2e");
// Cooler ground bounce to reduce flatness
const GROUND_COLOR_DAY = new Color("#b8c0ca");
// ------------------------------------------------------------------

const scratchColor = new Color();
const scratchDir = new Vector3();

function lerpColor(target, c0, c1, t) {
  target.copy(c0).lerp(c1, t);
  return target;
}

export function createLighting(scene) {
  // Increased sun intensity for better contrast (2.2 -> 3.6)
  const sunLight = new DirectionalLight(0xffffff, 3.6);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.radius = 2;
  sunLight.shadow.bias = -0.0005;

  // Setup initial sun position
  const sunElevation = MathUtils.degToRad(35);
  const sunAzimuth = Math.PI / 4;
  const sunDirection = new Vector3(
    Math.cos(sunElevation) * Math.cos(sunAzimuth),
    Math.sin(sunElevation),
    Math.cos(sunElevation) * Math.sin(sunAzimuth)
  ).normalize();
  sunLight.position.copy(sunDirection).multiplyScalar(150);
  sunLight.target.position.set(0, 0, 0);
  sunLight.target.updateMatrixWorld();

  const cam = sunLight.shadow.camera;
  cam.near = 1;
  cam.far = 300;
  cam.left = -120; cam.right = 120;
  cam.top  = 120;  cam.bottom = -120;
  sunLight.shadow.normalBias = 0.02;
  sunLight.shadow.camera.updateProjectionMatrix();
  scene.add(sunLight);
  scene.add(sunLight.target);

  // Reduced ambient intensity and cooler colors to keep contrast in shadows
  const hemiLight = new HemisphereLight(SKY_COLOR_DAY, GROUND_COLOR_DAY, 0.22);
  scene.add(hemiLight);

  return { sunLight, hemiLight, nightFactor: 0 };
}

export function updateLighting(lights, sunDir, options = {}) {
  if (!lights || !lights.sunLight || !lights.hemiLight) return;
  const { sunLight, hemiLight } = lights;

  const {
    applyPosition = true,
    sunDistance = 100,
    sunTarget = { x: 0, y: 0, z: 0 },
    sunHeightOverride,
  } = options;

  const norm = scratchDir.copy(sunDir).normalize();
  const sunHeight = Number.isFinite(sunHeightOverride)
    ? sunHeightOverride
    : norm.y;

  const dayFactor = MathUtils.clamp(MathUtils.smoothstep(sunHeight, -0.15, 0.1), 0, 1);
  const nightFactor = 1 - dayFactor;

  if (applyPosition) {
    sunLight.position.copy(norm).multiplyScalar(sunDistance);
    const target = sunTarget || { x: 0, y: 0, z: 0 };
    sunLight.target.position.set(target.x ?? 0, target.y ?? 0, target.z ?? 0);
    sunLight.target.updateMatrixWorld();
  }

  // Lerp sun intensity to new max (3.6)
  const targetSunIntensity = MathUtils.lerp(0.0, 3.6, dayFactor);
  sunLight.intensity = MathUtils.lerp(sunLight.intensity, targetSunIntensity, 0.1);

  const c0 = lerpColor(scratchColor, SUN_COLOR_DAWN, SUN_COLOR_NOON, dayFactor);
  const sunColor = c0.lerp(SUN_COLOR_DUSK, nightFactor * 0.55);
  sunLight.color.copy(sunColor);

  // Lerp hemi intensity to keep directional light dominant
  const hemiTarget = MathUtils.lerp(0.05, 0.22, dayFactor);
  hemiLight.intensity = MathUtils.lerp(hemiLight.intensity, hemiTarget, 0.1);
  lerpColor(hemiLight.color, SKY_COLOR_NIGHT, SKY_COLOR_DAY, dayFactor);
  lerpColor(hemiLight.groundColor, GROUND_COLOR_NIGHT, GROUND_COLOR_DAY, dayFactor);

  lights.nightFactor = nightFactor;
}
