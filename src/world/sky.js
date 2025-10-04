// src/world/sky.js

import { Sky } from "three/examples/jsm/objects/Sky.js";
import * as THREE from "three";

// Default configuration for the procedural star field.
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

export function createStars(scene, starCount) {
  // Generate a list of points that will become our star positions.
  // Each point is placed at a random direction on a large imaginary sphere
  // so that the stars surround the player from every angle.
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    // Pick a random direction, normalise it (make it length 1), then scale it
    // by the radius of the shell. This keeps every star the same distance away
    // so they look like they belong to the night sky, not the scene itself.
    const direction = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    ).normalize();
    const distance = STAR_FIELD_RADIUS * (0.8 + Math.random() * 0.2);
    const index = i * 3;
    positions[index] = direction.x * distance;
    positions[index + 1] = direction.y * distance;
    positions[index + 2] = direction.z * distance;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  // PointsMaterial renders every vertex as a small sprite. We give it a tiny
  // size, a white colour and enable transparency so we can fade the stars.
  const material = new THREE.PointsMaterial({
    size: 1.2,
    color: 0xffffff,
    transparent: true,
    opacity: 0, // Start hidden; updateStars will fade them in at night.
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  // Combine the geometry and material into a THREE.Points object and add it to
  // the scene so it renders around the player.
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);

  return stars;
}

export function updateStars(stars, phase) {
  if (!stars) return;

  const material = stars.material;
  if (!material) return;

  // Convert the current phase of the day (0 = midnight, 0.5 = midday) into
  // the sun's height in the sky. The sine wave gives us -1 (midnight) to +1
  // (midday) which we use to drive the fade.
  const sunElevation = Math.sin(phase * Math.PI * 2);

  // Fade the stars out shortly before the sun reaches the horizon and keep them
  // invisible while it is high in the sky. The fade range is intentionally
  // narrow so the transition feels gradual.
  const fadeStart = -0.2; // sun just below the horizon
  const fadeEnd = 0.1; // sun a little way into the sky
  const nightStrength = 1 - THREE.MathUtils.smoothstep(sunElevation, fadeStart, fadeEnd);

  // Slowly interpolate towards the desired opacity so the change is smooth.
  material.opacity = THREE.MathUtils.lerp(material.opacity, nightStrength, 0.05);
}
