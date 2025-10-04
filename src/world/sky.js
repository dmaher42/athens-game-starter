// src/world/sky.js

import { Sky } from "three/examples/jsm/objects/Sky.js";
import * as THREE from "three";

// Default configuration for the procedural star field.
const DEFAULT_STAR_COUNT = 1200;
const STAR_FIELD_RADIUS = 1000;

export function createSky(scene) {
  const sky = new Sky();
  sky.scale.setScalar(450000); // make it very big

  const uniforms = sky.material.uniforms;
  uniforms.turbidity.value = 10;
  uniforms.rayleigh.value = 2;
  uniforms.mieCoefficient.value = 0.005;
  uniforms.mieDirectionalG.value = 0.8;

  // initialize sunPosition so shader is defined
  uniforms.sunPosition.value.set(0, 1, 0);

  scene.add(sky);

  return { sky };
}

export function updateSky(skyObj, sunDir) {
  const { sky } = skyObj;
  if (
    !sky ||
    !sky.material ||
    !sky.material.uniforms ||
    !sky.material.uniforms.sunPosition
  ) {
    return;
  }
  // Copy normalized sun direction into the shader uniform
  sky.material.uniforms.sunPosition.value.copy(sunDir).normalize();
}

export function createStars(scene, count = DEFAULT_STAR_COUNT) {
  // Create a star field that wraps the entire sky dome using THREE.Points.
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Generate a random direction so stars appear all around the viewer.
    const direction = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    ).normalize();

    const distance = STAR_FIELD_RADIUS * (0.8 + Math.random() * 0.2);
    const idx = i * 3;
    positions[idx] = direction.x * distance;
    positions[idx + 1] = direction.y * distance;
    positions[idx + 2] = direction.z * distance;

    // Give every star a subtle colour variation (brightness only).
    const brightness = 0.5 + Math.random() * 0.5;
    colors[idx] = brightness;
    colors[idx + 1] = brightness;
    colors[idx + 2] = brightness;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1.2,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0, // Start invisible; we fade the stars in at night.
    depthWrite: false,
  });

  const stars = new THREE.Points(geometry, material);
  stars.matrixAutoUpdate = false;
  stars.updateMatrix();
  scene.add(stars);

  return stars;
}

export function updateStars(stars, phase) {
  if (!stars) return;

  const material = stars.material;
  if (!material) return;

  // Mirror the phase (0-1) so we can treat midnight (0 or 1) as the peak.
  const mirroredPhase = phase > 0.5 ? 1 - phase : phase;
  // Smoothly fade the stars when we move towards daytime (phase ~0.25 or ~0.75).
  const eased = 1 - THREE.MathUtils.smoothstep(mirroredPhase, 0.05, 0.2);
  const targetOpacity = THREE.MathUtils.clamp(eased, 0, 1);

  // Lerp towards the target so the transition feels soft.
  material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.05);
}
