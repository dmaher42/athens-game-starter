// src/world/sky.js

import { Sky } from "three/examples/jsm/objects/Sky.js";
import * as THREE from "three";

// Constants describing the star field radius to wrap the camera.
const STAR_FIELD_RADIUS = 1000;

export function createSky(scene) {
  // Build and configure the sky dome shader.
  const sky = new Sky();
  sky.scale.setScalar(450000); // make it very big
  // Mark the sky dome as non-collidable so it is ignored when building
  // the environment collider. Otherwise the huge sphere would be merged
  // into the collision geometry and the player capsule would constantly
  // intersect it, preventing movement.
  sky.userData.noCollision = true;

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

const scratchSunDirection = new THREE.Vector3(0, 1, 0);

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function setTimeOfDayPhase(state, phase01) {
  if (!state || typeof state !== "object") return 0;
  const clamped = clamp01(phase01);
  state.timeOfDayPhase = clamped;
  return clamped;
}

export function getSunDirectionFromPhase(phase01, target = scratchSunDirection) {
  const phase = clamp01(phase01);
  const theta = phase * Math.PI * 2;
  target.set(Math.cos(theta), Math.sin(theta), 0);
  return target;
}

export function updateSky(skyObj, state) {
  // Guard against missing uniforms or objects so runtime stays safe.
  const { sky } = skyObj || {};
  if (
    !sky ||
    !sky.material ||
    !sky.material.uniforms ||
    !sky.material.uniforms.sunPosition
  ) {
    return;
  }
  // Copy normalized sun direction into the shader uniform
  const phase = state?.timeOfDayPhase ?? 0;
  const sunDir = getSunDirectionFromPhase(phase, scratchSunDirection);
  sky.material.uniforms.sunPosition.value.copy(sunDir).normalize();
  return sunDir;
}

export function createStars(scene, count) {
  // Generate a star field using random points on a sphere surface.
  const starCount = Math.max(0, count ?? 1000);
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    // Pick a random direction, normalise it, then place it on a shell so
    // stars surround the camera at a consistent distance.
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

  // Write the generated star data into the geometry buffers.
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
  stars.matrixAutoUpdate = false; // Stars don't move; freeze their matrix.
  stars.updateMatrix();

  scene.add(stars);
  return stars;
}

export function updateStars(stars, phase) {
  // Bail out when stars are not ready yet.
  if (!stars) return;

  const material = stars.material;
  if (!material) return;

  // Convert the current phase of the day (0 = midnight, 0.5 = midday) into
  // the sun's height in the sky using a sine wave: -1 (midnight) to +1 (midday).
  const sunElevation = Math.sin(phase * Math.PI * 2);

  // Fade the stars out shortly before the sun reaches the horizon and keep them
  // invisible while it is high in the sky for a gentle transition.
  const fadeStart = -0.2; // sun just below the horizon
  const fadeEnd = 0.1;    // sun a little way into the sky
  const nightStrength = 1 - THREE.MathUtils.smoothstep(sunElevation, fadeStart, fadeEnd);

  // Slowly interpolate towards the desired opacity so the change is smooth.
  material.opacity = THREE.MathUtils.lerp(material.opacity, nightStrength, 0.05);
}
