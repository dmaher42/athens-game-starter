// src/world/sky.js

import { Vector3, TextureLoader, EquirectangularReflectionMapping, SRGBColorSpace } from "three";

export function createSky(scene) {
  // The user requested a skybox implementation.
  // The repository contains equirectangular images in public/assets/sky/ (e.g. high_noon.jpg).
  // It does NOT contain 6-sided cube map textures (px.jpg, etc).
  // Therefore, we use TextureLoader with EquirectangularReflectionMapping.

  const loader = new TextureLoader();
  // Using high_noon.jpg as it corresponds to the 'noon' lighting preset usage.
  const skyTexture = loader.load("assets/sky/high_noon.jpg");
  skyTexture.mapping = EquirectangularReflectionMapping;
  skyTexture.colorSpace = SRGBColorSpace;

  // Set the scene's background and environment to the loaded texture
  scene.background = skyTexture;
  scene.environment = skyTexture;

  // Return a compatibility object.
  // Previous implementation returned { sky: SkyMesh }.
  // We return the texture so it can be debugged or disposed if needed.
  return { skyTexture };
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
  // We still calculate sun direction for lighting purposes
  const phase = state?.timeOfDayPhase ?? 0;
  const sunDir = getSunDirectionFromPhase(phase, scratchSunDirection);

  // Note: We are no longer updating sky shader uniforms since we use a static texture.
  // The skyObj passed here is what we returned from createSky.

  return sunDir;
}
