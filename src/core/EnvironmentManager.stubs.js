/**
 * EnvironmentManager (Extended Stub)
 * Supplements legacy lighting logic in Application.js
 * NOT a full replacement for applyLookProfileImmediate()
 *
 * Current coverage:
 * - ✅ Hemisphere light
 * - ✅ Fog
 * - ✅ Tone mapping exposure
 *
 * Future functions: Declare stubs now, fill in as migrated
 */

import * as THREE from 'three';

// External refs (to be injected or accessed from globals)
let scene, renderer, hemisphereLight;

export function init(envOptions) {
  scene = envOptions.scene;
  renderer = envOptions.renderer;
  hemisphereLight = envOptions.hemisphereLight;
}

export function applyBasicLightingProfile(profile) {
  if (!profile) return;
  // ✅ Implemented: hemisphere + fog + exposure
  hemisphereLight.intensity = profile.hemisphere || 0.25;
  renderer.toneMappingExposure = profile.exposure || 1.0;
  scene.fog = new THREE.Fog(profile.fogColor || '#a0a0a0', profile.fogNear || 10, profile.fogFar || 100);
}

// 🔜 STUBS TO BE IMPLEMENTED IN PHASES
export function setSunPosition(sunDirectionVec3) {
  // TODO: Update directional light or procedural sky sun position
}

export function updateMoonObjects(moonState) {
  // TODO: Adjust moon mesh visibility, position, rotation
}

export function updateSkyGradient(skyParams) {
  // TODO: Set shader uniforms or sky dome colors based on profile
}

export function setEnvironmentMapIntensity(intensity = 1.0) {
  // TODO: Update material.envMapIntensity globally
}

export function setTimeOfDay(t) {
  // TODO: Apply sun/moon positions, adjust ambient factors
}

export function toggleStars(visible) {
  // TODO: Enable/disable star dome mesh
}

export function updateOceanLighting(profile) {
  // TODO: Adjust ocean shader uniforms, reflection
}

export function updateHarborLighting(profile) {
  // TODO: Adjust dock lighting or area light intensities
}

export function setGrassNightFactor(factor) {
  // TODO: Pass factor into grass material or instancing uniform
}

export function applyColorGrading(presetName) {
  // TODO: Hook into post-processing chain for LUTs or color curves
}
