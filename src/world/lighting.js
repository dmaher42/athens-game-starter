// src/world/lighting.js

import { DirectionalLight, HemisphereLight, Color, Vector3, MathUtils, FogExp2 } from "three";
import { updateSky } from "./sky.js";

// Predefined colors
const SUN_COLOR_DAWN = new Color("#ffb37f");
const SUN_COLOR_NOON = new Color("#fffaf0");
const SUN_COLOR_DUSK = new Color("#ff9f76");

// Boosted Night Colors for visibility
const SKY_COLOR_NIGHT = new Color("#555555");
const SKY_COLOR_DAY = new Color("#ffffff");
const GROUND_COLOR_NIGHT = new Color("#333333");
const GROUND_COLOR_DAY = new Color("#b97a20");

const FOG_COLOR_NIGHT = new Color("#333333");
const FOG_COLOR_DAWN = new Color("#ffaa80");
const FOG_COLOR_NOON = new Color("#fdf6e3");
const FOG_COLOR_DUSK = new Color("#ff8855");

const scratchColor = new Color();
const scratchDir = new Vector3();

function lerpColor(target, c0, c1, t) {
  target.copy(c0).lerp(c1, t);
  return target;
}

export function createLighting(scene) {
  // Create the primary sunlight directional light.
  const sunLight = new DirectionalLight(0xfffaf0, 1.2);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(4096, 4096);
  sunLight.shadow.radius = 4;
  sunLight.shadow.bias = -0.0001;
  sunLight.position.set(50, 100, 50);
  sunLight.target.position.set(0, 0, 0);
  sunLight.target.updateMatrixWorld();
  const cam = sunLight.shadow.camera;
  cam.near = 1;
  cam.far = 300;
  cam.left = -120; cam.right = 120;
  cam.top  = 120;  cam.bottom = -120;
  sunLight.shadow.normalBias = 0.05;
  sunLight.shadow.camera.updateProjectionMatrix();
  scene.add(sunLight);
  scene.add(sunLight.target);

  // Add a hemisphere light to simulate ambient sky/ground bounce.
  const hemiLight = new HemisphereLight(SKY_COLOR_DAY, GROUND_COLOR_DAY, 0.6);
  scene.add(hemiLight);

  scene.fog = new FogExp2(0xfdf6e3, 0.00025);

  return { sunLight, hemiLight, nightFactor: 0, currentPreset: null };
}

export function updateLighting(lights, sunDir) {
  // Validate the light container before attempting to update state.
  if (!lights || !lights.sunLight || !lights.hemiLight) return;
  const { sunLight, hemiLight } = lights;

  // Normalize the provided sun direction so derived math stays correct.
  const norm = scratchDir.copy(sunDir).normalize();
  const sunHeight = norm.y;

  // dayFactor describes how close we are to midday (1) vs midnight (0).
  const dayFactor = MathUtils.clamp(MathUtils.smoothstep(sunHeight, -0.15, 0.1), 0, 1);
  const nightFactor = 1 - dayFactor;

  if (sunHeight < -0.05) {
    // Moon Mode (Night)
    sunLight.position.copy(norm).negate().multiplyScalar(100);
    // Increased moon intensity and neutral color
    sunLight.intensity = MathUtils.lerp(sunLight.intensity, 0.6, 0.1);
    sunLight.color.setHex(0xdddddd);
  } else {
    // Sun Mode (Day)
    sunLight.position.copy(norm).multiplyScalar(100);

    // Smoothly fade the sun intensity below the horizon so the moon can take over.
    const targetSunIntensity = MathUtils.lerp(0.0, 1.2, dayFactor);
    sunLight.intensity = MathUtils.lerp(sunLight.intensity, targetSunIntensity, 0.1);

    // Sun color blending: Dawn → Noon, with a nudge toward Dusk as night approaches.
    const c0 = lerpColor(scratchColor, SUN_COLOR_DAWN, SUN_COLOR_NOON, dayFactor);
    const sunColor = c0.lerp(SUN_COLOR_DUSK, nightFactor * 0.55);
    sunLight.color.copy(sunColor);
  }

  sunLight.target.position.set(0, 0, 0);
  sunLight.target.updateMatrixWorld();

  // Hemisphere ambient blending (cooler and dimmer at night).
  // Kept night ambient intensity similar to day to ensure visibility
  const hemiTarget = MathUtils.lerp(0.6, 0.6, dayFactor);
  hemiLight.intensity = MathUtils.lerp(hemiLight.intensity, hemiTarget, 0.1);
  lerpColor(hemiLight.color, SKY_COLOR_NIGHT, SKY_COLOR_DAY, dayFactor);
  lerpColor(hemiLight.groundColor, GROUND_COLOR_NIGHT, GROUND_COLOR_DAY, dayFactor);

  // Expose the night factor for consumers like the moon/stars.
  lights.nightFactor = nightFactor;

  // Determine preset for Sky Manager
  let nextPreset = 'noon';
  let targetFog = FOG_COLOR_NOON;

  if (sunHeight < -0.1) {
    nextPreset = 'night';
    targetFog = FOG_COLOR_NIGHT;
  } else if (sunHeight < 0.2) {
    // Transition zone: rising or setting?
    if (sunDir.x > 0) {
      nextPreset = 'dawn';
      targetFog = FOG_COLOR_DAWN;
    } else {
      nextPreset = 'dusk';
      targetFog = FOG_COLOR_DUSK;
    }
  }

  // Update sky if preset changes
  if (lights.currentPreset !== nextPreset) {
    lights.currentPreset = nextPreset;
    const scene = sunLight.parent;
    if (scene) {
      updateSky(scene, nextPreset);
    }
  }

  // Update fog color
  const scene = sunLight.parent;
  if (scene && scene.fog) {
     scene.fog.color.lerp(targetFog, 0.05);
  }
}
