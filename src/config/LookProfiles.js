
export const LOOK_PROFILES = {
  "Bright Noon": {
    renderer: {
      toneMappingExposure: 1.15,
      // Using 'Standard' or 'ACESFilmic' is handled in renderer setup,
      // but usually exposure is the main variable here.
      // We assume ACESFilmic is the default.
    },
    sun: {
      color: "#ffffff", // Pure white
      intensity: 4.5,
      azimuth: -45,    // 315 deg, slightly from the left/front
      elevation: 70,   // High noon
    },
    ambient: {
      color: "#b0c4de", // Light steel blue
      groundColor: "#e6dccf", // Warm beige bounce
      intensity: 0.5,
    },
    fog: {
      enabled: true,
      color: "#bfe5f9", // Subtle bluish
      near: 900,
      far: 3500,
      density: 0.00025, // Unused if linear fog, but good for exp
    },
    skybox: {
      exposureMultiplier: 1.5,
      saturationMultiplier: 1.0,
      // If we need to change texture, we might need a key here.
      // The current system uses 'high_noon' key for sky texture.
      // We might need to map 'Bright Noon' -> 'high_noon' in sky module or here.
      skyKey: "high_noon"
    },
    grade: {
      contrast: 0.16,
      saturation: 0.0,
      shadowTint: "#f3f6ff",
      midTint: "#ffffff",
      highlightTint: "#f7fbff",
    },
    env: {
      envMapIntensity: 0.8
    }
  },
  "Golden Hour": {
    renderer: {
      toneMappingExposure: 0.96,
    },
    sun: {
      color: "#ffaa66", // Warm orange
      intensity: 3.5,
      azimuth: -60,
      elevation: 15,   // Low sun
    },
    ambient: {
      color: "#7d6b56", // Warm brownish grey
      groundColor: "#4a4036",
      intensity: 0.4,
    },
    fog: {
      enabled: true,
      color: "#ffcc99", // Warm haze
      near: 400,
      far: 2500,
    },
    skybox: {
      exposureMultiplier: 1.0,
      skyKey: "golden_hour"
    },
    grade: {
      contrast: 0.2,
      saturation: 0.1,
      shadowTint: "#3d3024",
      midTint: "#ffecd6",
      highlightTint: "#fff0e0",
    },
    env: {
      envMapIntensity: 1.0
    }
  },
  "Blue Hour": {
    renderer: {
      toneMappingExposure: 0.82,
    },
    sun: {
      color: "#8899bb", // Cool blue-white, very weak
      intensity: 0.5,
      azimuth: 180,
      elevation: -5, // Just below horizon or very low
    },
    ambient: {
      color: "#3b5278", // Deep blue
      groundColor: "#1f2a3d",
      intensity: 0.3,
    },
    fog: {
      enabled: true,
      color: "#3b5278", // Matching ambient
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
  }
};
