// src/world/lighting.js

import {
  DirectionalLight,
  HemisphereLight,
  Color,
  Vector3,
  MathUtils,
  Group,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry
} from "three";

// Predefined colors
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
  // Create the primary sunlight directional light.
  const sunLight = new DirectionalLight(0xffffff, 1.0);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(1024, 1024);
  sunLight.shadow.bias = -0.0005;
  const cam = sunLight.shadow.camera;
  cam.near = 1;
  cam.far = 300;
  cam.left = -120; cam.right = 120;
  cam.top  = 120;  cam.bottom = -120;
  sunLight.shadow.normalBias = 0.02;
  sunLight.shadow.camera.updateProjectionMatrix();
  scene.add(sunLight);
  scene.add(sunLight.target);

  // Add a hemisphere light to simulate ambient sky/ground bounce.
  const hemiLight = new HemisphereLight(SKY_COLOR_DAY, GROUND_COLOR_DAY, 0.6);
  scene.add(hemiLight);

  return { sunLight, hemiLight, nightFactor: 0 };
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
  const targetSunIntensity = MathUtils.lerp(0.05, 1.4, dayFactor);
  sunLight.intensity = MathUtils.lerp(sunLight.intensity, targetSunIntensity, 0.1);

  // Sun color blending: Dawn → Noon, with a nudge toward Dusk as night approaches.
  const c0 = lerpColor(scratchColor, SUN_COLOR_DAWN, SUN_COLOR_NOON, dayFactor);
  const sunColor = c0.lerp(SUN_COLOR_DUSK, nightFactor * 0.55);
  sunLight.color.copy(sunColor);

  // Hemisphere ambient blending (cooler and dimmer at night).
  const hemiTarget = MathUtils.lerp(0.12, 0.95, dayFactor);
  hemiLight.intensity = MathUtils.lerp(hemiLight.intensity, hemiTarget, 0.1);
  lerpColor(hemiLight.color, SKY_COLOR_NIGHT, SKY_COLOR_DAY, dayFactor);
  lerpColor(hemiLight.groundColor, GROUND_COLOR_NIGHT, GROUND_COLOR_DAY, dayFactor);

  // Expose the night factor for consumers like the moon/stars.
  lights.nightFactor = nightFactor;
}

// Moon functions

export function createMoon(scene) {
  // Simple directional light to simulate moonlight; no shadows for cheaper render.
  const light = new DirectionalLight(0xbfdfff, 0.2);
  light.castShadow = false;

  // Tiny glowing sphere so players can spot the moon itself.
  const geometry = new SphereGeometry(5, 16, 16);
  const material = new MeshBasicMaterial({ color: 0xeef7ff, transparent: true, opacity: 0.3 });
  const mesh = new Mesh(geometry, material);

  // Group keeps the light and mesh moving together around the world.
  const group = new Group();
  // Flag the moon group as non-collidable so the environment collider ignores
  // the temporary origin position before the animation loop relocates it.
  // Otherwise the initial collider bake would merge the sphere geometry and
  // the player capsule would immediately intersect it, preventing movement.
  group.userData.noCollision = true;
  group.add(light);
  group.add(mesh);

  scene.add(group);
  scene.add(light.target);

  return { light, mesh, group };
}

export function updateMoon(moon, sunDir) {
  if (!moon || !sunDir) return;
  const { light, mesh, group } = moon;

  // The moon always sits opposite the sun on the sky dome.
  const moonDir = scratchDir.copy(sunDir).multiplyScalar(-1).normalize();
  group.position.copy(moonDir.multiplyScalar(400));

  // Aim the moonlight at the world origin so it washes over the scene.
  light.position.set(0, 0, 0);
  light.target.position.set(0, 0, 0);
  light.target.updateMatrixWorld();

  if (mesh) mesh.position.set(0, 0, 0);

  // nightFactor grows as the sun dips below the horizon; we fade the moon in.
  const nightFactor = MathUtils.clamp(-sunDir.y, 0, 1);
  light.intensity = MathUtils.lerp(0.05, 0.25, nightFactor);

  if (mesh && mesh.material) {
    mesh.material.opacity = MathUtils.lerp(0.3, 1.0, nightFactor);
    mesh.material.transparent = true;
  }
}
