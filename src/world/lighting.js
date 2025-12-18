// src/world/lighting.js

import { DirectionalLight, HemisphereLight, Color, Vector3, MathUtils, FogExp2 } from "three";
import { updateSky } from "./sky.js";

// Predefined colors
const SUN_COLOR_DAWN = new Color("#ffb37f");
const SUN_COLOR_NOON = new Color("#ffb37f");
const SUN_COLOR_DUSK = new Color("#ff9f76");

const SKY_COLOR_NIGHT = new Color("#0b1d51");
const SKY_COLOR_DAY = new Color("#B1E1FF");
const GROUND_COLOR_NIGHT = new Color("#1f1f2e");
const GROUND_COLOR_DAY = new Color("#B97A20");

const FOG_COLOR_NIGHT = new Color("#050510");
const FOG_COLOR_DAWN = new Color("#ffaa80");
const FOG_COLOR_NOON = new Color("#ffffff");
const FOG_COLOR_DUSK = new Color("#ff8855");

const scratchColor = new Color();
const scratchDir = new Vector3();

function lerpColor(target, c0, c1, t) {
  target.copy(c0).lerp(c1, t);
  return target;
}

export function createLighting(scene) {
  // Create the primary sunlight directional light.
  const sunLight = new DirectionalLight(0xffb37f, 1.2);
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

  scene.fog = new FogExp2(0xffffff, 0.002);

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

  // Position sun light far away
  sunLight.position.copy(norm).multiplyScalar(100);
  sunLight.target.position.set(0, 0, 0);
  sunLight.target.updateMatrixWorld();

  // Smoothly fade the sun intensity below the horizon so the moon can take over.
  const targetSunIntensity = MathUtils.lerp(0.05, 1.2, dayFactor);
  sunLight.intensity = MathUtils.lerp(sunLight.intensity, targetSunIntensity, 0.1);

  // Sun color blending: Dawn → Noon, with a nudge toward Dusk as night approaches.
  const c0 = lerpColor(scratchColor, SUN_COLOR_DAWN, SUN_COLOR_NOON, dayFactor);
  const sunColor = c0.lerp(SUN_COLOR_DUSK, nightFactor * 0.55);
  sunLight.color.copy(sunColor);

  // Hemisphere ambient blending (cooler and dimmer at night).
  const hemiTarget = MathUtils.lerp(0.2, 0.6, dayFactor);
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
    // We can infer rising/setting from x component of sunDir.
    // Assuming standard cycle: East (+x?) -> West (-x?)
    // Actually, createSky uses (cos(theta), sin(theta), 0).
    // theta goes 0..2PI.
    // 0 = Noon (sin=0, cos=1)? Wait.
    // getSunDirectionFromPhase:
    // theta = (phase - 0.25) * 2PI.
    // phase 0.25 -> theta 0 -> (1, 0, 0)
    // phase 0.5 -> theta PI/2 -> (0, 1, 0) -> NOON
    // phase 0.75 -> theta PI -> (-1, 0, 0)
    // phase 0.0 -> theta -PI/2 -> (0, -1, 0) -> NIGHT
    // So Y is up/down.
    // Rising: phase 0.25 .. 0.5 (Y goes 0 to 1). X goes 1 to 0.
    // Setting: phase 0.5 .. 0.75 (Y goes 1 to 0). X goes 0 to -1.

    // We can check X component.
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
     // Smoothly lerp fog color? Or just set it?
     // FogExp2 color is not easily lerped without state.
     // But we can just set it for now or try to lerp.
     // Since this runs every frame, we can lerp towards targetFog.
     scene.fog.color.lerp(targetFog, 0.05);
  }
}
