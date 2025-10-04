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

  // Example: simple fade in/out
  const intensity = THREE.MathUtils.clamp(elevation, 0, 1);
  sunLight.intensity = intensity * 1.5;

  // Color shift: warm dawn/dusk, cooler midday
  const middayColor = new THREE.Color(0xffffff);
  const dawnColor = new THREE.Color(0xffcc99);
  const nightColor = new THREE.Color(0x223355);

  // map elevation to 0–1
  const t = THREE.MathUtils.smoothstep(elevation, 0, 1);
  sunLight.color.copy(dawnColor).lerp(middayColor, t);

  // Hemisphere light: sky vs ground
  hemiLight.intensity = 0.5 + intensity * 0.5;
  hemiLight.color = new THREE.Color(0x88bbff).lerp(new THREE.Color(0x111133), 1 - t);
}
