// src/world/sky.js

import { Sky } from "three/examples/jsm/objects/Sky.js";
import * as THREE from "three";

// Constants describing the star field radius to wrap the camera.
const STAR_FIELD_RADIUS = 1000;

export function createSky(scene) {
  // Build and configure the sky dome shader.
  const sky = new Sky();
  sky.scale.setScalar(450000);  // make it very big

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
  // Guard against missing uniforms or objects so runtime stays safe.
  const { sky } = skyObj;
  if (
    !sky ||
    !sky.material ||
    !sky.material.uniforms ||
    !sky.material.uniforms.sunPosition
  ) {
    return;
  }
  // copy normalized sun direction into the shader uniform
  sky.material.uniforms.sunPosition.value.copy(sunDir).normalize();
}

export function createStars(scene, count) {
  // Generate a star field using random points on a sphere surface.
  const starCount = Math.max(0, count ?? 1000);
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    // Generate a random unit direction so stars wrap the whole sky dome.
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

    // Give each star a slightly different brightness for variation.
    const brightness = 0.5 + Math.random() * 0.5;
    colors[idx] = brightness;
    colors[idx + 1] = brightness;
    colors[idx + 2] = brightness;
  }

  // Write the generated star data into the geometry buffers.
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  // Create a point material so stars render as glowing dots.
  const material = new THREE.PointsMaterial({
    size: 1.2,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0, // Start invisible; we fade the stars in at night.
    depthWrite: false,
  });

  const stars = new THREE.Points(geometry, material);
  stars.matrixAutoUpdate = false; // Stars do not move so freeze their matrix.
  stars.updateMatrix();
  scene.add(stars);

  return stars;
}

export function updateStars(stars, phase) {
  // Bail out when stars are not ready yet.
  if (!stars) return;

  const material = stars.material;
  if (!material) return;

  // Compute the sun's height from the day/night phase (0-1 range).
  const angle = phase * Math.PI * 2;
  const sunHeight = Math.sin(angle);

  // Smoothly fade stars in when the sun is below the horizon.
  const nightStrength = THREE.MathUtils.clamp(-sunHeight, 0, 1);
  const targetOpacity = THREE.MathUtils.smoothstep(nightStrength, 0.2, 0.8);

  // Lerp towards the target so the transition feels soft.
  material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.05);
}
