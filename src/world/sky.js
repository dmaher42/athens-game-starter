// src/world/sky.js

import { Sky } from "three/examples/jsm/objects/Sky.js";
import { Vector3 } from "three";

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
  uniforms.turbidity.value = 4;
  uniforms.rayleigh.value = 2.8;
  uniforms.mieCoefficient.value = 0.0045;
  uniforms.mieDirectionalG.value = 0.7;

  // initialize sunPosition so shader is defined
  uniforms.sunPosition.value.set(0, 1, 0);

  scene.add(sky);

  return { sky };
}

const scratchSunDirection = new Vector3(0, 1, 0);

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
  const theta = (phase - 0.25) * Math.PI * 2;
  target.set(Math.cos(theta), Math.sin(theta), 0);
  return target.normalize();
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
