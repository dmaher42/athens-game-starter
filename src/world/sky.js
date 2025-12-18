// src/world/sky.js

import { Vector3, TextureLoader, EquirectangularReflectionMapping, SRGBColorSpace } from "three";

// Map presets to texture filenames
const SKY_PRESETS = {
  dawn: "dawn.jpg",
  noon: "high_noon.jpg",
  dusk: "dusk.jpg",
  night: "night.jpg",
};

const loadedTextures = {};
const textureLoader = new TextureLoader();
const TEXTURE_PATH = "assets/sky/";

// Preload textures
for (const [preset, filename] of Object.entries(SKY_PRESETS)) {
  const url = TEXTURE_PATH + filename;
  const texture = textureLoader.load(url);
  texture.mapping = EquirectangularReflectionMapping;
  texture.colorSpace = SRGBColorSpace;
  loadedTextures[preset] = texture;
}

export function createSky(scene) {
  // Initialize with 'noon' (default)
  updateSky(scene, "noon");
  return { }; // Return empty object for compatibility
}

export function updateSky(scene, presetName) {
  const texture = loadedTextures[presetName];
  if (texture && scene) {
    scene.background = texture;
    scene.environment = texture;
  }
}

// Scratch vector for sun direction calculation
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

/**
 * Calculates sun direction from state.
 * Replaces the old updateSky(skyObj, state) for sun calculation.
 */
export function getSunDirection(state) {
  const phase = state?.timeOfDayPhase ?? 0;
  return getSunDirectionFromPhase(phase, scratchSunDirection);
}

// Backwards compatibility alias if needed, but we will update consumers.
// export const updateSkyLegacy = getSunDirection;
