
export const LOOK_PROFILES = {
  "Bright Noon": {
    renderer: {
      toneMappingExposure: 1.0, // Midday exposure aligned to neutral noon brightness
    },
    starsVisible: 0.0,
    moonElevation: -10,
    moonLightIntensity: 0.0,
    soundscapeMode: "day",
    sun: {
      color: "#ffffff", // Neutral white sun for true midday balance
      intensity: 1.0,
      azimuth: 0,      // Centered azimuth for high noon feel
      elevation: 75,   // Slightly higher midday sun
    },
    ambient: {
      color: "#dceaff", // Light blue tint to keep midday fill crisp
      groundColor: "#ecf4ff",
      intensity: 0.5,
    },
    fog: {
      enabled: true,
      color: "#e8f2ff",
      near: 4000,      // Clear-air distance for minimal haze
      far: 12000,      // Longer range to keep horizons sharp
      density: 0.00006,
    },
    skybox: {
      exposureMultiplier: 1.12,
      saturationMultiplier: 1.08,
      skyKey: "high_noon"
    },
    grade: {
      contrast: 0.12,
      saturation: 0.1,
      shadowTint: "#e8edf5",   // Neutral shadow tint to keep depth without blue haze
      midTint: "#f2f5fb",      // Clean mids that preserve material color
      highlightTint: "#fff7eb", // Warm highlights for sunlit sparkle
    },
    env: {
      envMapIntensity: 1.0 // Reflections tuned to noon brightness
    },
    moon: {
      visible: false,
      intensity: 0,
      elevation: -25,
    }
  },
  "Golden Hour": {
    renderer: {
      toneMappingExposure: 0.95,
    },
    starsVisible: 0.08,
    moonElevation: 10,
    moonLightIntensity: 0.15,
    soundscapeMode: "day",
    sun: {
      color: "#ffae70",
      intensity: 0.8,
      azimuth: 175,   // West (approx 180) to backlight mountains (-105 was NW)
      elevation: 15,  // Warm low sun
    },
    ambient: {
      color: "#b47b57",
      groundColor: "#6b3f2e",
      intensity: 0.6, // Stronger warm fill for softer shadows
    },
    fog: {
      enabled: true,
      color: "#ffd8b0",
      near: 200,
      far: 4500,      // Gentle warm haze while keeping silhouettes readable
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
      envMapIntensity: 0.9 // Evening reflections matching warm sun brightness
    },
    moon: {
      visible: false,
      intensity: 0,
      elevation: -20,
    }
  },
  "Blue Hour": {
    renderer: {
      toneMappingExposure: 1.05,
    },
    starsVisible: 0.55,
    moonElevation: 8,
    moonLightIntensity: 0.32,
    soundscapeMode: "night",
    sun: {
      color: "#728bb8",
      intensity: 0.2,
      azimuth: 180,
      elevation: -2,
    },
    ambient: {
      color: "#465672",
      groundColor: "#283448",
      intensity: 0.5,
    },
    fog: {
      enabled: true,
      color: "#3f506c",
      near: 250,
      far: 2600,
    },
    skybox: {
      exposureMultiplier: 0.85,
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
      envMapIntensity: 0.65 // Twilight reflections balanced with dim sun
    },
    moon: {
      visible: true,
      intensity: 0.42,
      elevation: 18,
    }
  },
  "Night": {
    renderer: {
      toneMappingExposure: 1.0,
    },
    starsVisible: 1.0,
    moonElevation: 25,
    moonLightIntensity: 0.2,
    soundscapeMode: "night",
    sun: {
      color: "#a8c2ff",
      intensity: 0.12,
      azimuth: 135,
      elevation: -45,
    },
    ambient: {
      color: "#0c1a2f",
      groundColor: "#0c1a2f",
      intensity: 0.25,
    },
    fog: {
      enabled: true,
      color: "#0a162b",
      near: 250,
      far: 3200,
    },
    skybox: {
      exposureMultiplier: 0.35,
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
      envMapIntensity: 0.2
    },
    moon: {
      visible: true,
      intensity: 0.5,
      elevation: 38,
    }
  }
};
