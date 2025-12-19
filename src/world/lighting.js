// src/world/lighting.js

import { DirectionalLight, HemisphereLight, Color, Vector3, MathUtils } from "three";

// --- COLORS CONFIGURATION ---

const SUN_COLOR_DAWN = new Color("#ffb37f");
// FIXED: Changed from orange (#ffb37f) to PURE WHITE for clear daylight
const SUN_COLOR_NOON = new Color("#ffffff");
const SUN_COLOR_DUSK = new Color("#ff9f76");

const SKY_COLOR_NIGHT = new Color("#0b1d51");
// FIXED: Changed from Blue (#cde6ff) to White (#ffffff) so shadows are not blue
const SKY_COLOR_DAY = new Color("#ffffff");

const GROUND_COLOR_NIGHT = new Color("#1f1f2e");
// FIXED: Desaturated the ground bounce to neutral gray (was orange/beige)
const GROUND_COLOR_DAY = new Color("#e0e0e0");

const scratchColor = new Color();
const scratchDir = new Vector3();

function lerpColor(target, c0, c1, t) {
  target.copy(c0).lerp(c1, t);
  return target;
}

export function createLighting(scene) {
  // Create the primary sunlight directional light.
  // Increased intensity from 1.4 to 2.2 for "Bright Noon" feel
  const sunLight = new DirectionalLight(0xffffff, 2.2);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.radius = 2; // Sharpen shadows slightly for noon look
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

  // Hemisphere light (Ambient).
  // Increased intensity to 0.6 so shadows aren't too dark/contrasty.
  const hemiLight = new HemisphereLight(SKY_COLOR_DAY, GROUND_COLOR_DAY, 0.6);
  scene.add(hemiLight);

  return { sunLight, hemiLight, nightFactor: 0 };
}

export function updateLighting(lights, sunDir) {
  if (!lights || !lights.sunLight || !lights.hemiLight) return;
  const { sunLight, hemiLight } = lights;

  const norm = scratchDir.copy(sunDir).normalize();
  const sunHeight = norm.y;

  // Calculate time of day (1.0 = Noon, 0.0 = Midnight)
  const dayFactor = MathUtils.clamp(MathUtils.smoothstep(sunHeight, -0.15, 0.1), 0, 1);
  const nightFactor = 1 - dayFactor;

  // Move Sun
  sunLight.position.copy(norm).multiplyScalar(100);
  sunLight.target.position.set(0, 0, 0);
  sunLight.target.updateMatrixWorld();

  // Brightness curve: Dim at night, very bright at noon
  const targetSunIntensity = MathUtils.lerp(0.0, 2.2, dayFactor);
  sunLight.intensity = MathUtils.lerp(sunLight.intensity, targetSunIntensity, 0.1);

  // Color blending
  const c0 = lerpColor(scratchColor, SUN_COLOR_DAWN, SUN_COLOR_NOON, dayFactor);
  const sunColor = c0.lerp(SUN_COLOR_DUSK, nightFactor * 0.55);
  sunLight.color.copy(sunColor);

  // Ambient Light blending
  const hemiTarget = MathUtils.lerp(0.08, 0.6, dayFactor);
  hemiLight.intensity = MathUtils.lerp(hemiLight.intensity, hemiTarget, 0.1);
  lerpColor(hemiLight.color, SKY_COLOR_NIGHT, SKY_COLOR_DAY, dayFactor);
  lerpColor(hemiLight.groundColor, GROUND_COLOR_NIGHT, GROUND_COLOR_DAY, dayFactor);

  lights.nightFactor = nightFactor;
}
