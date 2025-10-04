// src/world/lighting.js

import {
  DirectionalLight,
  HemisphereLight,
  Color,
  Vector3,
  MathUtils
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

  // Position sun light far away
  sunLight.position.copy(norm).multiplyScalar(100);
  sunLight.target.position.set(0, 0, 0);
  sunLight.target.updateMatrixWorld();

  // Elevation: how high above horizon
  const elevation = Math.max(norm.y, 0);

  // Optionally blend intensity more smoothly:
  // const dayFactor = MathUtils.smoothstep(elevation, -0.1, 0.3);
  // sunLight.intensity = MathUtils.lerp(0.05, 1.5, dayFactor);
  // But simpler fallback:
  sunLight.intensity = 0.2 + elevation * 1.3;

  // Sun color blending
  const warmth = 1 - elevation;
  const c0 = lerpColor(scratchColor, SUN_COLOR_DAWN, SUN_COLOR_NOON, elevation);
  const sunColor = c0.lerp(SUN_COLOR_DUSK, warmth * 0.5);
  sunLight.color.copy(sunColor);

  // Hemisphere ambient blending
  const mix = elevation;
  hemiLight.intensity = 0.3 + mix * 0.7;
  lerpColor(hemiLight.color, SKY_COLOR_NIGHT, SKY_COLOR_DAY, mix);
  lerpColor(hemiLight.groundColor, GROUND_COLOR_NIGHT, GROUND_COLOR_DAY, mix);
}

// Moon functions

export function createMoon(scene) {
  // Directional light for moon
  const moonLight = new DirectionalLight(0xbfdfff, 0.2);
  moonLight.castShadow = false;

  // Moon mesh (semi-transparent sphere)
  const moonGeo = new THREE.SphereGeometry(5, 16, 16);
  const moonMat = new THREE.MeshBasicMaterial({
    color: 0xeef7ff,
    transparent: true,
    opacity: 0.3
  });
  const moonMesh = new THREE.Mesh(moonGeo, moonMat);

  const moonGroup = new THREE.Group();
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
  const nightFactor = MathUtils.clamp(-sunHeight, 0, 1);

  const targetIntensity = MathUtils.lerp(0.05, 0.25, nightFactor);
  light.intensity = MathUtils.lerp(light.intensity, targetIntensity, 0.1);

  if (mesh && mesh.material) {
    const targetOpacity = MathUtils.lerp(0.3, 1.0, nightFactor);
    mesh.material.opacity = MathUtils.lerp(mesh.material.opacity, targetOpacity, 0.1);
    mesh.material.transparent = true;
  }
}
