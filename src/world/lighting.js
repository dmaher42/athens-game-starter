// src/world/lighting.js

import { DirectionalLight, AmbientLight, Color, Vector3, MathUtils } from "three";

// --- COLORS CONFIGURATION ---

const SUN_COLOR_DAWN = new Color("#ffd1a3");
const SUN_COLOR_NOON = new Color("#ffffff");
const SUN_COLOR_DUSK = new Color("#ffb182");

const AMBIENT_COLOR_NIGHT = new Color("#1c2438");
const AMBIENT_COLOR_DAY = new Color("#d7e0ea");
const AMBIENT_COLOR_SUNSET = new Color("#f2b886");
// ------------------------------------------------------------------

const scratchColor = new Color();
const scratchDir = new Vector3();

function lerpColor(target, c0, c1, t) {
  target.copy(c0).lerp(c1, t);
  return target;
}

export function createLighting(scene, sunLightOverride = null, ambientOverride = null) {
  const sunLight = sunLightOverride || new DirectionalLight(0xffffff, 3.6);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.radius = 2;
  sunLight.shadow.bias = -0.0002;

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
  if (scene && !sunLight.parent) scene.add(sunLight);
  if (scene && !sunLight.target.parent) scene.add(sunLight.target);

  const ambientLight = ambientOverride || new AmbientLight(0xffffff, 0.18);
  if (scene && !ambientLight.parent) scene.add(ambientLight);

  return { sunLight, ambientLight, nightFactor: 0 };
}

export function updateLighting(lights, sunDir, options = {}) {
  if (!lights || !lights.sunLight || !lights.ambientLight) return;
  const { sunLight, ambientLight } = lights;

  const {
    applyPosition = true,
    sunDistance = 100,
    sunTarget = { x: 0, y: 0, z: 0 },
    sunHeightOverride,
    // Overrides for Look Profile system
    overrideSunColor = null,
    overrideSunIntensity = null,
    overrideAmbientColor = null,
    overrideGroundColor = null,
    overrideAmbientIntensity = null,
  } = options;

  const norm = scratchDir.copy(sunDir).normalize();
  const sunHeight = Number.isFinite(sunHeightOverride)
    ? sunHeightOverride
    : norm.y;

  const directLightFactor = MathUtils.clamp(
    MathUtils.smoothstep(sunHeight, -0.2, 0.35),
    0,
    1
  );
  const ambientFactor = MathUtils.clamp(
    MathUtils.smoothstep(sunHeight, -0.45, 0.15),
    0,
    1
  );

  const dayFactor = directLightFactor;
  const nightFactor = 1 - dayFactor;

  if (applyPosition) {
    sunLight.position.copy(norm).multiplyScalar(sunDistance);
    const target = sunTarget || { x: 0, y: 0, z: 0 };
    sunLight.target.position.set(target.x ?? 0, target.y ?? 0, target.z ?? 0);
    sunLight.target.updateMatrixWorld();
  }

  if (overrideSunIntensity != null) {
    sunLight.intensity = overrideSunIntensity;
  } else {
    const targetSunIntensity = MathUtils.lerp(0.06, 4.2, directLightFactor);
    sunLight.intensity = MathUtils.lerp(sunLight.intensity, targetSunIntensity, 0.1);
  }

  if (overrideSunColor) {
    sunLight.color.copy(overrideSunColor);
  } else {
    const c0 = lerpColor(scratchColor, SUN_COLOR_DAWN, SUN_COLOR_NOON, dayFactor);
    const sunColor = c0.lerp(SUN_COLOR_DUSK, nightFactor * 0.55);
    sunLight.color.copy(sunColor);
  }

  if (overrideAmbientIntensity != null) {
    ambientLight.intensity = overrideAmbientIntensity;
  } else {
    const ambientTarget = MathUtils.lerp(0.08, 0.28, ambientFactor);
    ambientLight.intensity = MathUtils.lerp(ambientLight.intensity, ambientTarget, 0.16);
  }

  if (overrideAmbientColor) {
    ambientLight.color.copy(overrideAmbientColor);
  } else if (overrideGroundColor) {
    ambientLight.color.copy(overrideGroundColor);
  } else {
    const warmBlend = lerpColor(scratchColor, AMBIENT_COLOR_DAY, AMBIENT_COLOR_SUNSET, 1 - Math.abs(0.5 - dayFactor) * 2);
    const ambientColor = warmBlend.lerp(AMBIENT_COLOR_NIGHT, nightFactor);
    ambientLight.color.copy(ambientColor);
  }

  lights.nightFactor = nightFactor;
}
