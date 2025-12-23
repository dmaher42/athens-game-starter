
export const LOOK_PROFILES = {
  "Bright Noon": {
    renderer: {
      toneMappingExposure: 0.95, // Reduced from 1.05 to prevent washout
    },
    sun: {
      color: "#fff7e0",
      intensity: 3.8,
      azimuth: -45,
      elevation: 75,   // Higher noon (70->75)
    },
    ambient: {
      color: "#c5b7a3",
      groundColor: "#e8d8c3",
      intensity: 0.6,
    },
    fog: {
      enabled: true,
      color: "#cfe7f7",
      near: 2000,      // Increased near/far for clarity
      far: 8000,       // Slight reduction (10k -> 8k) to help distant houses fade vs landmarks
      density: 0.00018,
    },
    skybox: {
      exposureMultiplier: 1.3,
      saturationMultiplier: 1.05,
      skyKey: "high_noon"
    },
    grade: {
      contrast: 0.12,
      saturation: 0.06,
      shadowTint: "#eef5ff",
      midTint: "#fff4e6",
      highlightTint: "#f8fbff",
    },
    env: {
      envMapIntensity: 0.65
    }
  },
  "Golden Hour": {
    renderer: {
      toneMappingExposure: 0.9,
    },
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
      contrast: 0.24,
      saturation: 0.12,
      shadowTint: "#2f241b",
      midTint: "#ffe2c4",
      highlightTint: "#fff3e4",
    },
    env: {
      envMapIntensity: 0.9
    }
  },
  "Blue Hour": {
    renderer: {
      toneMappingExposure: 0.82,
    },
    sun: {
      color: "#8899bb",
      intensity: 0.5,
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
      far: 2000,
    },
    skybox: {
      exposureMultiplier: 0.7,
      skyKey: "blue_hour"
    },
    grade: {
      contrast: 0.1,
      saturation: -0.2,
      shadowTint: "#0b1026",
      midTint: "#3b5278",
      highlightTint: "#8da6d1",
    },
    env: {
      envMapIntensity: 0.4
    }
  },
  "Night": {
    renderer: {
      toneMappingExposure: 0.58,
    },
    sun: {
      color: "#7fa2ff",
      intensity: 0.18,
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
      far: 1500,
    },
    skybox: {
      exposureMultiplier: 0.55,
      skyKey: "night_sky"
    },
    grade: {
      contrast: 0.08,
      saturation: -0.12,
      shadowTint: "#050915",
      midTint: "#10233d",
      highlightTint: "#c6d7ff",
    },
    env: {
      envMapIntensity: 0.25
    }
  }
};
