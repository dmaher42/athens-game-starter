// src/world/sky.js

import { Sky } from "three/examples/jsm/objects/Sky.js";
import { MathUtils, Vector3 } from "three";

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
  uniforms.turbidity.value = 2.2;
  uniforms.rayleigh.value = 3.2;
  uniforms.mieCoefficient.value = 0.0025;
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
  const uniforms = sky.material.uniforms;
  uniforms.sunPosition.value.copy(sunDir).normalize();

  const sunHeight = MathUtils.clamp(sunDir.y, -0.2, 1);
  const dayFactor = MathUtils.clamp(
    MathUtils.smoothstep(sunHeight, -0.05, 0.35),
    0,
    1
  );

  uniforms.turbidity.value = MathUtils.lerp(6, 2, dayFactor);
  uniforms.rayleigh.value = MathUtils.lerp(1.5, 3.4, dayFactor);
  uniforms.mieCoefficient.value = MathUtils.lerp(0.006, 0.0022, dayFactor);
  uniforms.mieDirectionalG.value = MathUtils.lerp(0.85, 0.7, dayFactor);

  return sunDir;
}
