// src/world/lighting.js
import * as THREE from "three";

export function createLighting(scene) {
  // Directional “sun” light
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
  scene.add(sunLight);

  // Hemisphere light: sky / ground ambient
  const hemiLight = new THREE.HemisphereLight(0x8888ff, 0x443322, 0.5);
  scene.add(hemiLight);

  return { sunLight, hemiLight };
}

export function updateLighting(lights, sun) {
  const { sunLight, hemiLight } = lights;

  // Move sunLight to follow the “sun” vector
  sunLight.position.copy(sun);

  // You can modulate intensity & color based on sun elevation
  const elevation = sun.y;  // approximate measure, -1 to +1

  // Blend the sun light intensity smoothly based on the sun elevation.
  const dayFactor = THREE.MathUtils.smoothstep(elevation, -0.1, 0.3);
  sunLight.intensity = THREE.MathUtils.lerp(0.05, 1.5, dayFactor);

  // Color shift: warm dawn/dusk, cooler midday
  const middayColor = new THREE.Color(0xffffff);
  const dawnColor = new THREE.Color(0xffcc99);
  const nightColor = new THREE.Color(0x223355);

  sunLight.color.copy(nightColor)
    .lerp(dawnColor, THREE.MathUtils.smoothstep(elevation, -0.05, 0.1))
    .lerp(middayColor, dayFactor);

  // Hemisphere light: sky vs ground. Keep a little ambient at night.
  hemiLight.intensity = THREE.MathUtils.lerp(0.15, 1.0, dayFactor);
  hemiLight.color = new THREE.Color(0x111133).lerp(new THREE.Color(0x88bbff), dayFactor);
}

export function createMoon(scene) {
  // A dim directional light paired with a small mesh to represent the moon.
  const moonLight = new THREE.DirectionalLight(0xbfdfff, 0.2);
  moonLight.castShadow = false;

  // Small emissive sphere so we can see where the moon is in the sky.
  const moonGeometry = new THREE.SphereGeometry(5, 16, 16);
  const moonMaterial = new THREE.MeshBasicMaterial({ color: 0xeef7ff, transparent: true, opacity: 0.3 });
  const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);

  const moonGroup = new THREE.Group();
  moonGroup.add(moonLight);
  moonGroup.add(moonMesh);

  scene.add(moonGroup);
  scene.add(moonLight.target);

  return { light: moonLight, mesh: moonMesh, group: moonGroup };
}

export function updateMoon(moon, sun) {
  if (!moon) return;

  const { light, mesh, group } = moon;
  const moonDirection = sun.clone().multiplyScalar(-1).normalize();

  // Position the moon opposite the sun on a large radius so it stays in the sky dome.
  const radius = 400;
  const position = moonDirection.clone().multiplyScalar(radius);
  group.position.copy(position);

  // Aim the light from the moon toward the origin (our world centre).
  light.position.set(0, 0, 0);
  light.target.position.set(0, 0, 0);
  light.target.updateMatrixWorld();

  if (mesh) {
    // Keep the moon mesh centred on the group so it rides along with the light.
    mesh.position.set(0, 0, 0);
  }

  // Brighter moon when the sun is well below the horizon.
  const sunHeight = sun.y;
  const nightFactor = THREE.MathUtils.clamp(-sunHeight, 0, 1);
  const targetIntensity = THREE.MathUtils.lerp(0.05, 0.25, nightFactor);
  light.intensity = THREE.MathUtils.lerp(light.intensity, targetIntensity, 0.1);
  if (mesh && mesh.material) {
    const targetOpacity = THREE.MathUtils.lerp(0.3, 1.0, nightFactor);
    mesh.material.opacity = THREE.MathUtils.lerp(mesh.material.opacity, targetOpacity, 0.1);
    mesh.material.transparent = true;
  }
}
