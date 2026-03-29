
export const LIGHTING_PRESETS = {
  "Bright Noon": {
    renderer: {
      toneMappingExposure: 0.62,
    },
    starsVisible: 0.0,
    moonElevation: -10,
    moonLightIntensity: 0.0,
    soundscapeMode: "day",
    sun: {
      color: "#ffe7cf",
      intensity: 2.0,
      azimuth: 205,
      elevation: 44,
    },
    ambient: {
      color: "#edf3f8",
      groundColor: "#d7c5ac",
      intensity: 0.18,
    },
    fog: {
      enabled: true,
      color: "#ead2ad",
      near: 1400,
      far: 6200,
      density: 0.000026,
    },
    skybox: {
      exposureMultiplier: 0.72,
      saturationMultiplier: 0.94,
      skyKey: "high_noon"
    },
    grade: {
      contrast: 0.06,
      saturation: 0.02,
      shadowTint: "#e3e7ed",
      midTint: "#f4f1eb",
      highlightTint: "#fff8ef",
    },
    env: {
      envMapIntensity: 0.22
    },
    moon: {
      visible: false,
      intensity: 0,
      elevation: -25,
    }
  },
  "Golden Hour": {
    renderer: {
      toneMappingExposure: 0.78,
    },
    starsVisible: 0.02,
    moonElevation: -5,
    moonLightIntensity: 0.05,
    soundscapeMode: "day",
    sun: {
      color: "#ffe2c4",
      intensity: 1.45,
      azimuth: 238,
      elevation: 38,
    },
    ambient: {
      color: "#efe4d3",
      groundColor: "#cfb089",
      intensity: 0.26,
    },
    fog: {
      enabled: true,
      color: "#edd3ad",
      near: 950,
      far: 4300,
    },
    skybox: {
      exposureMultiplier: 0.82,
      saturationMultiplier: 0.96,
      skyKey: "golden_hour"
    },
    grade: {
      contrast: 0.08,
      saturation: 0.03,
      shadowTint: "#d8d3ca",
      midTint: "#f5e7d6",
      highlightTint: "#fff1df",
    },
    env: {
      envMapIntensity: 0.38
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
