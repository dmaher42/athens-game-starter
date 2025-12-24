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

// Copilot: Use this to position the sun in the sky dome. Accepts a THREE.Vector3 direction and rotates the sun mesh or procedural sun accordingly.
export function setSunPosition(sunDirectionVec3) {
  // TODO: Update directional light or procedural sky sun position
}

// Copilot: Update moon visibility and rotation using the moonState object. Ensure moon mesh exists and is added to the scene.
export function updateMoonObjects(moonState) {
  // TODO: Adjust moon mesh visibility, position, rotation
}

// Copilot: Change the sky gradient colors based on time of day. Use shader uniforms or dome material for transitions.
export function updateSkyGradient(skyParams) {
  // TODO: Set shader uniforms or sky dome colors based on profile
}

// Copilot: Set the intensity of environment map lighting. Affects reflections on GLTF models using .envMapIntensity.
export function setEnvironmentMapIntensity(intensity = 1.0) {
  const target = Number.isFinite(intensity) ? Math.max(0, intensity) : 1.0;

  const applyToMaterial = (material) => {
    if (!material || typeof material !== 'object') return;
    if (Array.isArray(material)) {
      material.forEach(applyToMaterial);
      return;
    }
    if ('envMapIntensity' in material) {
      material.envMapIntensity = target;
      material.needsUpdate = true;
    }
  };

  try {
    scene?.traverse((child) => {
      if (!child?.isMesh) return;
      applyToMaterial(child.material);
    });
    if (scene && scene.userData) {
      scene.userData.environmentIntensity = target;
    }
  } catch (e) {
    console.warn('[EnvStubs] setEnvironmentMapIntensity failed', e);
  }
}

// Copilot: Sync time-of-day value (0.0 to 1.0) to all lighting elements. Move sun/moon, adjust exposure, and sky color.
export function setTimeOfDay(t) {
  // TODO: Apply sun/moon positions, adjust ambient factors
}

// Copilot: Show or hide the star dome based on visibility flag. Useful for night transitions.
export function toggleStars(visible) {
  // TODO: Enable/disable star dome mesh
}

// Copilot: Update the ocean shader to match the active lighting preset. Adjust reflection, foam, and color intensity.
export function updateOceanLighting(profile) {
  // TODO: Adjust ocean shader uniforms, reflection
}

// Copilot: Adjust lighting for harbor area. You can use area lights, emissive textures, or point lights depending on scene setup.
export function updateHarborLighting(profile) {
  // TODO: Adjust dock lighting or area light intensities
}

// Copilot: Set a uniform that darkens grass at night. Use in instanced grass shaders or material tweaks.
export function setGrassNightFactor(factor) {
  // TODO: Pass factor into grass material or instancing uniform
}

// Copilot: Apply post-processing color grading preset (e.g., 'noon', 'dusk', 'night'). Requires access to the postproc pipeline.
export function applyColorGrading(presetName) {
  // TODO: Hook into post-processing chain for LUTs or color curves
}
