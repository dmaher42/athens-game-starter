
export const LOOK_PROFILES = {
  "Bright Noon": {
    renderer: {
      toneMappingExposure: 1.2, // Neutral exposure so noon is bright without clipping
    },
    starsVisible: 0.0,
    moonElevation: -10,
    moonLightIntensity: 0.0,
    soundscapeMode: "day",
    sun: {
      color: "#ffffff", // Neutral white light for clean midday look
      intensity: 1.3,
      azimuth: 180,
      elevation: 75,   // High sun angle for midday
    },
    ambient: {
      color: "#dbe9ff", // Light blue ambient to match clear sky
      groundColor: "#cfdcec",
      intensity: 0.8,
    },
    fog: {
      enabled: true,
      color: "#e2ecf7",
      near: 3200,
      far: 12000,
      density: 0.00005,
    },
    skybox: {
      exposureMultiplier: 1.0,
      saturationMultiplier: 0.98,
      skyKey: "high_noon"
    },
    grade: {
      contrast: 0.08,
      saturation: 0.05,
      shadowTint: "#e8edf5",
      midTint: "#f2f6fb",
      highlightTint: "#ffffff",
    },
    env: {
      envMapIntensity: 1.0 // Bright reflections to match clear midday sky
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
      color: "#ffb36b",
      intensity: 0.8,
      azimuth: 260,   // Warm light from the west for evening feel
      elevation: 15,   // Low angle for long shadows
    },
    ambient: {
      color: "#f0c193",
      groundColor: "#c07a43",
      intensity: 0.6, // Softer fill to ease shadow contrast
    },
    fog: {
      enabled: true,
      color: "#f2caa2",
      near: 200,
      far: 3500,
    },
    skybox: {
      exposureMultiplier: 0.95,
      skyKey: "golden_hour"
    },
    grade: {
      contrast: 0.12,
      saturation: 0.04,
      shadowTint: "#3a2b1f",
      midTint: "#ffe2c4",
      highlightTint: "#ffe9d6",
    },
    env: {
      envMapIntensity: 0.7 // HDRI/sky reflections softened for evening
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
      color: "#6f7fa5",
      intensity: 0.2,
      azimuth: 195,
      elevation: -2,
    },
    ambient: {
      color: "#3f5473",
      groundColor: "#273448",
      intensity: 0.5,
    },
    fog: {
      enabled: true,
      color: "#2f3f5d",
      near: 250,
      far: 2600,
    },
    skybox: {
      exposureMultiplier: 0.8,
      skyKey: "blue_hour"
    },
    grade: {
      contrast: 0.1,
      saturation: -0.06,
      shadowTint: "#223344",
      midTint: "#3b5278",
      highlightTint: "#9bb5e1",
    },
    env: {
      envMapIntensity: 0.45 // Gentle reflections to match twilight sky
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
    moonElevation: 20,
    moonLightIntensity: 0.18,
    soundscapeMode: "night",
    sun: {
      color: "#6f86a5",
      intensity: 0.05,
      azimuth: 120,
      elevation: -45,
    },
    ambient: {
      color: "#0b1d38",
      groundColor: "#0b1d2d",
      intensity: 0.25,
    },
    fog: {
      enabled: true,
      color: "#08162c",
      near: 400,
      far: 3200,
    },
    skybox: {
      exposureMultiplier: 0.6,
      skyKey: "night_sky"
    },
    grade: {
      contrast: 0.1,
      saturation: -0.08,
      shadowTint: "#223344",
      midTint: "#10233d",
      highlightTint: "#c6d7ff",
    },
    env: {
      envMapIntensity: 0.2
    },
    moon: {
      visible: true,
      intensity: 0.2,
      elevation: 40,
    }
  }
};
