import { deepFreeze, getRuntimeEnvironment, mergeDeep, assert } from "./utils.js";

export const DEFAULT_LIGHTING_CONFIG = {
  cycle: {
    minutesPerDay: 20,
  },
  bloom: {
    threshold: 0.8,
    strength: 0.6,
    radius: 0.85,
  },
  exposure: {
    min: 0.2,
    max: 2.0,
    step: 0.01,
  },
  presets: {
    blue_hour: {
      phase: 0.18,
      exposure: 0.82,
      label: "Blue Hour",
      skyboxExposure: 0.5,
    },
    golden_hour: {
      phase: 0.62,
      exposure: 0.96,
      label: "Golden Hour",
      skyboxExposure: 1.0,
    },
    high_noon: {
      phase: 0.5,
      exposure: 1.12,
      label: "Bright Noon",
      environmentIntensity: 0.6,
      skyboxExposure: 1.5,
      colorGrade: {
        shadowTint: "#f3f6ff",
        midTint: "#ffffff",
        highlightTint: "#f7fbff",
        saturationBoost: 0.0,
        contrastStrength: 0.16,
      },
    },
    night_sky: {
      phase: 0.92,
      exposure: 0.55,
      label: "Deep Night",
      skyboxExposure: 0.2,
    },
  },
};

const ENVIRONMENT_OVERRIDES = {
  development: {
    bloom: {
      strength: 0.5,
    },
  },
};

function validatePreset(name, preset) {
  assert(preset && typeof preset === "object", `lighting preset ${name} must be an object`);
  assert(Number.isFinite(preset.phase), `lighting preset ${name} requires numeric phase`);
  assert(Number.isFinite(preset.exposure), `lighting preset ${name} requires numeric exposure`);
  assert(typeof preset.label === "string" && preset.label.trim() !== "", `lighting preset ${name} requires label`);
  if (preset.hotkey != null) {
    assert(typeof preset.hotkey === "string", `lighting preset ${name} hotkey must be string`);
  }
  if (preset.skyboxExposure != null) {
    assert(Number.isFinite(preset.skyboxExposure), `lighting preset ${name} skyboxExposure must be numeric`);
  }
}

function validateLightingConfig(config) {
  assert(config && typeof config === "object", "lighting config must be an object");
  const presets = config.presets || {};
  for (const [name, preset] of Object.entries(presets)) {
    validatePreset(name, preset);
  }
  return config;
}

export function createLightingConfig(environment = getRuntimeEnvironment(), overrides = {}) {
  const merged = mergeDeep({}, DEFAULT_LIGHTING_CONFIG, ENVIRONMENT_OVERRIDES[environment] || {}, overrides);
  return deepFreeze(validateLightingConfig(merged));
}

export let lightingConfig = createLightingConfig();

export function getLightingPreset(name) {
  return lightingConfig.presets?.[name] || null;
}

export function listLightingPresets() {
  return Object.entries(lightingConfig.presets || {}).map(([key, value]) => ({ key, ...value }));
}

if (import.meta.hot) {
  import.meta.hot.accept((mod) => {
    lightingConfig = mod?.createLightingConfig
      ? mod.createLightingConfig(getRuntimeEnvironment())
      : createLightingConfig(getRuntimeEnvironment());
  });
}
