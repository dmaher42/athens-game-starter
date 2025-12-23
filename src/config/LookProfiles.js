
export const LOOK_PROFILES = {
  "Bright Noon": {
    renderer: {
      toneMappingExposure: 0.86, // Lower exposure for gentler midday light
    },
    starsVisible: 0.0,
    moonElevation: -10,
    moonLightIntensity: 0.0,
    soundscapeMode: "day",
    sun: {
      color: "#dceeff", // Cooler sun tone to push the sky toward blue
      intensity: 3.4,
      azimuth: -45,
      elevation: 65,   // Midday height (60-70 deg) to avoid harsh zenith glare
    },
    ambient: {
      color: "#bcdaf5", // Bluer fill to tint indirect light
      groundColor: "#d6e9ff",
      intensity: 0.56,
    },
    fog: {
      enabled: true,
      color: "#c4e4ff",
      near: 2000,      // Increased near/far for clarity
      far: 8000,       // Slight reduction (10k -> 8k) to help distant houses fade vs landmarks
      density: 0.00018,
    },
    skybox: {
      exposureMultiplier: 1.05,
      saturationMultiplier: 1.12,
      skyKey: "high_noon"
    },
    grade: {
      contrast: 0.1,
      saturation: 0.08,
      shadowTint: "#d6e8ff",   // Cooler shadow tint to reinforce blue sky cues
      midTint: "#e9f4ff",      // Slightly bluer mids to keep surfaces natural
      highlightTint: "#f2f8ff", // Crisp highlights without harsh glare
    },
    env: {
      envMapIntensity: 0.6 // Keep reflections lively without overwhelming brightness
    },
    moon: {
      visible: false,
      intensity: 0,
      elevation: -25,
    }
  },
  "Golden Hour": {
    renderer: {
      toneMappingExposure: 0.9,
    },
    starsVisible: 0.08,
    moonElevation: 10,
    moonLightIntensity: 0.15,
    soundscapeMode: "day",
    sun: {
      color: "#ffb36b",
      intensity: 3.9,
      azimuth: 175,   // West (approx 180) to backlight mountains (-105 was NW)
      elevation: 5,   // Low angle (8 -> 5)
    },
    ambient: {
      color: "#6c5945",
      groundColor: "#3c2f27",
      intensity: 0.20, // Lower fill (0.28 -> 0.20) for contrast/silhouettes
    },
    fog: {
      enabled: true,
      color: "#ffddaa",
      near: 200,
      far: 4000,      // Tuned to allow distant mountains (at 4000m) to silhouette but fade
    },
    skybox: {
      exposureMultiplier: 1.0,
      skyKey: "golden_hour"
    },
    grade: {
      contrast: 0.16, // Align contrast with other presets while keeping silhouette definition
      saturation: 0.08, // Warmth without oversaturating terrain
      shadowTint: "#2f241b",
      midTint: "#ffe2c4",
      highlightTint: "#fff3e4",
    },
    env: {
      envMapIntensity: 0.82 // Balanced reflections so metals don't overpower warm light
    },
    moon: {
      visible: false,
      intensity: 0,
      elevation: -20,
    }
  },
  "Blue Hour": {
    renderer: {
      toneMappingExposure: 0.9,
    },
    starsVisible: 0.55,
    moonElevation: 8,
    moonLightIntensity: 0.32,
    soundscapeMode: "night",
    sun: {
      color: "#8899bb",
      intensity: 0.65,
      azimuth: 180,
      elevation: -5,
    },
    ambient: {
      color: "#3b5278",
      groundColor: "#1f2a3d",
      intensity: 0.3,
    },
    fog: {
      enabled: true,
      color: "#3b5278",
      near: 300,
      far: 3000,
    },
    skybox: {
      exposureMultiplier: 0.7,
      skyKey: "blue_hour"
    },
    grade: {
      contrast: 0.12, // Closer to other looks for consistent perceived depth
      saturation: -0.1, // Keep cool palette without dulling materials
      shadowTint: "#223344",
      midTint: "#3b5278",
      highlightTint: "#9bb5e1",
    },
    env: {
      envMapIntensity: 0.6 // Slightly brighter reflections to offset lower sun
    },
    moon: {
      visible: true,
      intensity: 0.42,
      elevation: 18,
    }
  },
  "Night": {
    renderer: {
      toneMappingExposure: 0.7,
    },
    starsVisible: 1.0,
    moonElevation: 25,
    moonLightIntensity: 0.7,
    soundscapeMode: "night",
    sun: {
      color: "#7fa2ff",
      intensity: 0.24,
      azimuth: 135,
      elevation: -25,
    },
    ambient: {
      color: "#0b1d38",
      groundColor: "#0b1d38",
      intensity: 0.22,
    },
    fog: {
      enabled: true,
      color: "#0b1d51",
      near: 200,
      far: 2500,
    },
    skybox: {
      exposureMultiplier: 0.55,
      skyKey: "night_sky"
    },
    grade: {
      contrast: 0.08,
      saturation: -0.12,
      shadowTint: "#223344",
      midTint: "#10233d",
      highlightTint: "#c6d7ff",
    },
    env: {
      envMapIntensity: 0.38
    },
    moon: {
      visible: true,
      intensity: 0.8,
      elevation: 38,
    }
  }
};
