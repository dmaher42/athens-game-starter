
export const LOOK_PROFILES = {
  "Bright Noon": {
    renderer: {
      toneMappingExposure: 1.05,
      // Using 'Standard' or 'ACESFilmic' is handled in renderer setup,
      // but usually exposure is the main variable here.
      // We assume ACESFilmic is the default.
    },
    sun: {
      color: "#fff7e0", // Warm white to avoid harsh glare
      intensity: 3.8,
      azimuth: -45,    // 315 deg, slightly from the left/front
      elevation: 70,   // High noon for short shadows
    },
    ambient: {
      color: "#c5b7a3", // Gentle warm fill for readable foregrounds
      groundColor: "#e8d8c3", // Warm bounce without bleaching ground
      intensity: 0.6,
    },
    fog: {
      enabled: true,
      color: "#cfe7f7", // Cooler distance separation without haze wall
      near: 900,
      far: 3200,
      density: 0.00018, // Unused if linear fog, but good for exp
    },
    skybox: {
      exposureMultiplier: 1.3,
      saturationMultiplier: 1.05,
      // If we need to change texture, we might need a key here.
      // The current system uses 'high_noon' key for sky texture.
      // We might need to map 'Bright Noon' -> 'high_noon' in sky module or here.
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
      color: "#ffb36b", // Warm amber
      intensity: 3.9,
      azimuth: -105,
      elevation: 8,   // Near-horizon sun
    },
    ambient: {
      color: "#6c5945", // Muted warm to keep silhouettes readable
      groundColor: "#3c2f27",
      intensity: 0.28,
    },
    fog: {
      enabled: true,
      color: "#ffddaa", // Warm haze with brighter sky glow
      near: 420,
      far: 2100,
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
