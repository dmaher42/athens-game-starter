// src/core/EnvironmentManager.js
// Handles sky, lighting, fog, and day/night profiles
//
// STATUS: Basic implementation - NOT YET INTEGRATED into Application.js
//
// TO FULLY REPLACE applyLookProfileImmediate(), this manager needs to handle:
// - ✅ Hemisphere lighting (sky + ground colors)
// - ✅ Renderer tone mapping exposure
// - ✅ Scene fog (color, near, far)
// - ❌ Sun/moon positioning (azimuth, elevation)
// - ❌ Dynamic sky system integration
// - ❌ Ocean lighting updates
// - ❌ Harbor lighting updates
// - ❌ Grass night factor
// - ❌ Color grading / post-processing
// - ❌ Stars visibility
// - ❌ Environment map intensity
//
// CURRENT USE: Can be used for simple lighting changes, but Application.js
// still handles the full lighting system via applyLookProfileImmediate()

import * as THREE from 'three';
import { LOOK_PROFILES } from '../config/LookProfiles.js';

let scene, renderer, hemisphereLight, currentProfile = null;

export const EnvironmentManager = {
  init(envScene, envRenderer) {
    scene = envScene;
    renderer = envRenderer;

    // Add fallback hemisphere light
    hemisphereLight = new THREE.HemisphereLight(
      new THREE.Color('#dbe9ff'),
      new THREE.Color('#9ba8b5'),
      0.28
    );
    hemisphereLight.name = 'EnvFallbackLight';
    scene.add(hemisphereLight);
  },

  applyLookProfile(name) {
    const profile = LOOK_PROFILES[name];
    if (!profile) {
      console.warn(`[EnvironmentManager] Unknown profile: ${name}`);
      return;
    }

    currentProfile = name;

    // Apply hemisphere lighting
    if (hemisphereLight && profile.ambient) {
      hemisphereLight.intensity = profile.ambient.intensity || 0.28;
      hemisphereLight.color.set(profile.ambient.color || '#dbe9ff');
      hemisphereLight.groundColor.set(profile.ambient.groundColor || '#9ba8b5');
    }

    // Set renderer tone mapping
    if (renderer && profile.renderer) {
      renderer.toneMappingExposure = profile.renderer.toneMappingExposure || 1.0;
    }

    // Apply scene fog and background
    if (scene && profile.fog) {
      const fogColor = new THREE.Color(profile.fog.color || '#e2ecf7');
      
      if (!scene.fog) {
        scene.fog = new THREE.Fog(fogColor, profile.fog.near || 3200, profile.fog.far || 12000);
      } else {
        scene.fog.color.copy(fogColor);
        scene.fog.near = profile.fog.near || 3200;
        scene.fog.far = profile.fog.far || 12000;
      }

      // Set background to fog color for consistency
      if (profile.ambient?.color) {
        scene.background = new THREE.Color(profile.ambient.color);
      }
    }
  },

  update(deltaTime) {
    // Optional: animate sky/sun/moon over time
    // For now this is a stub for future day/night cycle
  },

  getCurrentProfile() {
    return currentProfile;
  },

  getHemisphereLight() {
    return hemisphereLight;
  }
};
