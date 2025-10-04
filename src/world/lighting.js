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
  const sunHeight = norm.y;
  // dayFactor describes how close we are to midday (1) vs midnight (0).
  const dayFactor = MathUtils.clamp(MathUtils.smoothstep(sunHeight, -0.15, 0.1), 0, 1);
  const nightFactor = 1 - dayFactor;

  // Position sun light far away
  sunLight.position.copy(norm).multiplyScalar(100);
  sunLight.target.position.set(0, 0, 0);
  sunLight.target.updateMatrixWorld();

  // Smoothly fade the sun intensity below the horizon so the moon can take over.
  const dayIntensity = MathUtils.lerp(0.05, 1.35, dayFactor);
  sunLight.intensity = MathUtils.lerp(sunLight.intensity, dayIntensity, 0.1);

  // Sun color blending
  const c0 = lerpColor(scratchColor, SUN_COLOR_DAWN, SUN_COLOR_NOON, dayFactor);
  const sunColor = c0.lerp(SUN_COLOR_DUSK, nightFactor * 0.6);
  sunLight.color.copy(sunColor);

  // Hemisphere ambient blending (cooler and dimmer at night).
  const hemiIntensity = MathUtils.lerp(0.12, 0.9, dayFactor);
  hemiLight.intensity = MathUtils.lerp(hemiLight.intensity, hemiIntensity, 0.1);
  lerpColor(hemiLight.color, SKY_COLOR_NIGHT, SKY_COLOR_DAY, dayFactor);
  lerpColor(hemiLight.groundColor, GROUND_COLOR_NIGHT, GROUND_COLOR_DAY, dayFactor);
}

// Moon functions

export function createMoon(scene) {
  // Directional light for moon
  const moonLight = new DirectionalLight(0xbfdfff, 0.2);
  moonLight.castShadow = false;

  // Moon mesh (semi-transparent sphere)
  const moonGeo = new SphereGeometry(5, 16, 16);
  const moonMat = new MeshBasicMaterial({
    color: 0xeef7ff,
    transparent: true,
    opacity: 0.3,
  });
  const moonMesh = new Mesh(moonGeo, moonMat);

  const moonGroup = new Group();
  moonGroup.add(moonLight);
  moonGroup.add(moonMesh);

  scene.add(moonGroup);
  scene.add(moonLight.target);

  return { light: moonLight, mesh: moonMesh, group: moonGroup };
}

export function updateMoon(moon, sunDir) {
  if (!moon) return;

  const { light, mesh, group } = moon;
  const moonDirection = sunDir.clone().multiplyScalar(-1).normalize();

  const radius = 400;
  const pos = moonDirection.multiplyScalar(radius);
  group.position.copy(pos);

  // Light origin aim
  light.position.set(0, 0, 0);
  light.target.position.set(0, 0, 0);
  light.target.updateMatrixWorld();

  if (mesh) {
    mesh.position.set(0, 0, 0);
  }

  const sunHeight = sunDir.y;
  // nightFactor mirrors the sun fade so the moon brightens gently overnight.
  const nightFactor = MathUtils.clamp(
    MathUtils.smoothstep(-sunHeight, 0, 0.4),
    0,
    1
  );

  const targetIntensity = MathUtils.lerp(0.05, 0.3, nightFactor);
  light.intensity = MathUtils.lerp(light.intensity, targetIntensity, 0.1);

  if (mesh && mesh.material) {
    const targetOpacity = MathUtils.lerp(0.3, 1.0, nightFactor);
    mesh.material.opacity = MathUtils.lerp(mesh.material.opacity, targetOpacity, 0.1);
    mesh.material.transparent = true;
  }
}
