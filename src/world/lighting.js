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
  scene.add(sunLight);
  scene.add(sunLight.target);

  // Add a hemisphere light to simulate ambient sky/ground bounce.
  const hemiLight = new HemisphereLight(SKY_COLOR_DAY, GROUND_COLOR_DAY, 0.6);
  scene.add(hemiLight);

  return { sunLight, hemiLight };
}

export function updateLighting(lights, sunDir) {
  // Validate the light container before attempting to update state.
  if (!lights || !lights.sunLight || !lights.hemiLight) {
    return;
  }
  const { sunLight, hemiLight } = lights;

  // Normalize the provided sun direction so derived math stays correct.
  const norm = scratchDir.copy(sunDir).normalize();

  // Position sun light far away
  sunLight.position.copy(norm).multiplyScalar(100);
  sunLight.target.position.set(0, 0, 0);
  sunLight.target.updateMatrixWorld();

  // Compute the elevation factor for sun/moon blending.
  const elevation = norm.y;
  const dayFactor = MathUtils.smoothstep(elevation, -0.1, 0.25);
  const nightFactor = 1 - dayFactor;

  // Dim the sun as it approaches the horizon and slightly lift at night.
  const targetSunIntensity = MathUtils.lerp(0.05, 1.5, dayFactor);
  sunLight.intensity = MathUtils.lerp(sunLight.intensity, targetSunIntensity, 0.1);

  // Blend the sun color between dawn/noon/dusk palettes.
  const sunColor = lerpColor(scratchColor, SUN_COLOR_DAWN, SUN_COLOR_NOON, dayFactor);
  sunColor.lerp(SUN_COLOR_DUSK, nightFactor * 0.5);
  sunLight.color.copy(sunColor);

  // Hemisphere ambient blending
  hemiLight.intensity = MathUtils.lerp(0.2, 1.0, dayFactor);
  lerpColor(hemiLight.color, SKY_COLOR_NIGHT, SKY_COLOR_DAY, dayFactor);
  lerpColor(hemiLight.groundColor, GROUND_COLOR_NIGHT, GROUND_COLOR_DAY, dayFactor);

  // Store the moon blend factor for any downstream consumers.
  lights.nightFactor = nightFactor;
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
    opacity: 0.3
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
  // Skip updates if moon data has not been created yet.
  if (!moon) return;

  const { light, mesh, group } = moon;

  // Position the moon opposite the sun direction.
  const moonDirection = scratchDir.copy(sunDir).multiplyScalar(-1).normalize();

  const radius = 400; // Distance from origin to keep moon on a sphere around scene.
  const pos = moonDirection.multiplyScalar(radius);
  group.position.copy(pos);

  // Light origin aim
  light.position.set(0, 0, 0);
  light.target.position.set(0, 0, 0);
  light.target.updateMatrixWorld();

  if (mesh) {
    mesh.position.set(0, 0, 0);
  }

  // Derive how far into the night we are based on sun height.
  const sunHeight = sunDir.y;
  const nightFactor = MathUtils.smoothstep(-sunHeight, 0, 1);

  const targetIntensity = MathUtils.lerp(0.05, 0.25, nightFactor);
  light.intensity = MathUtils.lerp(light.intensity, targetIntensity, 0.1);

  if (mesh && mesh.material) {
    const targetOpacity = MathUtils.lerp(0.3, 1.0, nightFactor);
    mesh.material.opacity = MathUtils.lerp(mesh.material.opacity, targetOpacity, 0.1);
    mesh.material.transparent = true;
  }
}
