import * as THREE from "three";
import {
  GROUND_TEXTURE_CONFIG,
  NEUTRAL_GROUND_FALLBACK_TINT,
} from "./groundTextureConfig.js";
import {
  createDryGrassDetailTexture,
  createFreshGrassLowlandsTexture,
  createGrassDetailTexture,
  createGrassTexture,
} from "./grassTextureGenerator.js";

const textureLoader = new THREE.TextureLoader();

const PROCEDURAL_GENERATORS = {
  "lush-grass": (config) =>
    createGrassTexture({
      size: config.size,
      seed: config.seed,
      baseColor: config.baseColor,
      shadowColor: config.shadowColor,
      highlightColor: config.highlightColor,
      bladeFrequency: config.bladeFrequency,
      bladeTaper: config.bladeTaper,
      highlightStrength: config.highlightStrength,
      shadowStrength: config.shadowStrength,
      noiseScale: config.noiseScale,
      patchiness: config.patchiness,
      saturation: config.saturation,
      contrast: config.contrast,
    }),
  "lush-grass-detail": (config) =>
    createGrassDetailTexture({
      size: config.size,
      seed: config.seed,
      baseColor: config.baseColor,
      shadowColor: config.shadowColor,
      highlightColor: config.highlightColor,
      bladeFrequency: config.bladeFrequency,
      bladeTaper: config.bladeTaper,
      highlightStrength: config.highlightStrength,
      shadowStrength: config.shadowStrength,
      noiseScale: config.noiseScale,
      patchiness: config.patchiness,
      saturation: config.saturation,
      contrast: config.contrast,
    }),
  "fresh-grass-lowlands": (config) =>
    createFreshGrassLowlandsTexture({
      size: config.size,
      seed: config.seed,
      baseColor: config.baseColor,
      shadowColor: config.shadowColor,
      highlightColor: config.highlightColor,
      bladeFrequency: config.bladeFrequency,
      bladeTaper: config.bladeTaper,
      highlightStrength: config.highlightStrength,
      shadowStrength: config.shadowStrength,
      noiseScale: config.noiseScale,
      patchiness: config.patchiness,
      saturation: config.saturation,
      contrast: config.contrast,
    }),
  "dry-grass-detail": (config) =>
    createDryGrassDetailTexture({
      size: config.size,
      seed: config.seed,
      baseColor: config.baseColor,
      shadowColor: config.shadowColor,
      highlightColor: config.highlightColor,
      bladeFrequency: config.bladeFrequency,
      bladeTaper: config.bladeTaper,
      highlightStrength: config.highlightStrength,
      shadowStrength: config.shadowStrength,
      noiseScale: config.noiseScale,
      patchiness: config.patchiness,
      saturation: config.saturation,
      contrast: config.contrast,
    }),
};

function cloneWithNeutralFallbackTint(config) {
  if (!config) return config;
  if (config.preserveFallbackTint) {
    return { ...config };
  }
  return {
    ...config,
    baseColor: [...NEUTRAL_GROUND_FALLBACK_TINT.baseColor],
    shadowColor: [...NEUTRAL_GROUND_FALLBACK_TINT.shadowColor],
    highlightColor: [...NEUTRAL_GROUND_FALLBACK_TINT.highlightColor],
    shadowStrength: NEUTRAL_GROUND_FALLBACK_TINT.shadowStrength,
    highlightStrength: NEUTRAL_GROUND_FALLBACK_TINT.highlightStrength,
    contrast: NEUTRAL_GROUND_FALLBACK_TINT.contrast,
  };
}

function loadAdditionalTexture(url, baseConfig, overrides = {}) {
  if (!url) return null;
  const options = {
    ...baseConfig,
    ...overrides,
  };
  return loadTexture(url, options);
}

function createProceduralTexture(config) {
  const generatorName = config?.generator ?? config?.procedural;
  if (!generatorName) return null;
  const builder = PROCEDURAL_GENERATORS[generatorName];
  if (!builder) {
    console.warn(`Unknown ground texture generator: ${generatorName}`);
    return null;
  }
  try {
    return builder(config);
  } catch (error) {
    console.warn(`Failed to build procedural texture: ${generatorName}`, error);
    return null;
  }
}

function configureTexture(texture, options = {}) {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  const [repeatX, repeatY] = Array.isArray(options.repeat)
    ? [options.repeat[0] ?? 1, options.repeat[1] ?? options.repeat[0] ?? 1]
    : [options.repeat ?? 1, options.repeat ?? 1];
  texture.repeat.set(repeatX, repeatY);

  if (options.offset) {
    const [offsetX, offsetY] = Array.isArray(options.offset)
      ? [options.offset[0] ?? 0, options.offset[1] ?? 0]
      : [options.offset ?? 0, options.offset ?? 0];
    texture.offset.set(offsetX, offsetY);
  }

  if (typeof options.rotation === "number" && options.rotation !== 0) {
    texture.center.set(0.5, 0.5);
    texture.rotation = options.rotation;
  }

  if (options.colorSpace === "srgb") {
    if ("colorSpace" in texture && THREE.SRGBColorSpace !== undefined) {
      texture.colorSpace = THREE.SRGBColorSpace;
    }
  } else if (options.colorSpace === "linear") {
    if ("colorSpace" in texture && THREE.LinearSRGBColorSpace !== undefined) {
      texture.colorSpace = THREE.LinearSRGBColorSpace;
    }
  }

  if (typeof options.anisotropy === "number") {
    texture.anisotropy = options.anisotropy;
  }

  texture.needsUpdate = true;
}

function loadTexture(url, options, onError) {
  try {
    const texture = textureLoader.load(
      url,
      () => {
        configureTexture(texture, options);
      },
      undefined,
      (event) => {
        console.warn(`Failed to load ground texture: ${url}`, event);
        if (onError) onError(event);
      },
    );
    configureTexture(texture, options);
    return texture;
  } catch (error) {
    console.warn(`Failed to load ground texture: ${url}`, error);
    if (onError) onError(error);
    return null;
  }
}

function createDetailLayer(config) {
  const texture = config?.url
    ? loadTexture(config.url, config)
    : createProceduralTexture(config);
  if (!texture) return null;

  configureTexture(texture, config);

  const strength = THREE.MathUtils.clamp(config.strength ?? 0.35, 0, 1);
  const hasRealTexture = Boolean(config?.url);
  const attenuationOverride = Number.isFinite(config?.tintAttenuation)
    ? config.tintAttenuation
    : undefined;
  const tintAttenuation = hasRealTexture
    ? THREE.MathUtils.clamp(attenuationOverride ?? 0.45, 0, 1)
    : THREE.MathUtils.clamp(attenuationOverride ?? 1, 0, 1);
  const effectiveStrength = strength * tintAttenuation;
  const minHeight = Number.isFinite(config.minHeight)
    ? config.minHeight
    : -1000;
  const maxHeight = Number.isFinite(config.maxHeight)
    ? config.maxHeight
    : 1000;
  const fade = Math.max(config.fade ?? 8, 0);

  const applyTintMultiplier = config.tintMultiplier !== false;
  const tint = new THREE.Color(1, 1, 1);
  if (applyTintMultiplier) {
    if (Array.isArray(config.tint)) {
      tint.setRGB(
        config.tint[0] ?? 1,
        config.tint[1] ?? config.tint[0] ?? 1,
        config.tint[2] ?? config.tint[1] ?? config.tint[0] ?? 1,
      );
    } else if (typeof config.tint === "string") {
      tint.set(config.tint);
    }
  }

  const mode = config.mode === "mix" ? 1 : 0;

  return {
    texture,
    params: new THREE.Vector4(minHeight, maxHeight, fade, effectiveStrength),
    tint,
    mode,
    tintMultiplier: applyTintMultiplier ? 1 : 0,
  };
}

export function createGroundTextureState(
  material,
  config = GROUND_TEXTURE_CONFIG,
) {
  if (!material) return { detailLayers: [] };
  const state = {
    detailLayers: [],
  };

  const baseConfig = config?.base;
  if (typeof baseConfig?.roughness === "number") {
    material.roughness = THREE.MathUtils.clamp(baseConfig.roughness, 0, 1);
  }
  if (typeof baseConfig?.metalness === "number") {
    material.metalness = THREE.MathUtils.clamp(baseConfig.metalness, 0, 1);
  }

  if (baseConfig?.url || baseConfig?.generator || baseConfig?.procedural) {
    const hasProceduralFallback = baseConfig?.generator || baseConfig?.procedural;
    const fallbackConfig =
      baseConfig?.url && hasProceduralFallback
        ? cloneWithNeutralFallbackTint(baseConfig)
        : null;

    let baseTexture = null;
    let usingFallbackTint = false;

    if (baseConfig?.url) {
      baseTexture = loadTexture(
        baseConfig.url,
        baseConfig,
        () => {
          if (!material || !fallbackConfig) return;
          const fallbackTexture = createProceduralTexture(fallbackConfig);
          if (fallbackTexture) {
            configureTexture(fallbackTexture, fallbackConfig);
            material.map = fallbackTexture;
            material.needsUpdate = true;
          }
        },
      );

      if (!baseTexture && fallbackConfig) {
        baseTexture = createProceduralTexture(fallbackConfig);
        usingFallbackTint = Boolean(baseTexture);
      }
    } else if (hasProceduralFallback) {
      baseTexture = createProceduralTexture(baseConfig);
    }

    if (baseTexture) {
      const textureOptions = usingFallbackTint && fallbackConfig
        ? fallbackConfig
        : baseConfig;
      configureTexture(baseTexture, textureOptions);
      material.map = baseTexture;
      material.needsUpdate = true;
    }

    const normalTexture = loadAdditionalTexture(baseConfig.normalUrl, baseConfig, {
      colorSpace: "linear",
    });
    if (normalTexture) {
      material.normalMap = normalTexture;
      const scale = baseConfig.normalScale;
      if (Array.isArray(scale)) {
        const x = Number.isFinite(scale[0]) ? scale[0] : 1;
        const y = Number.isFinite(scale[1]) ? scale[1] : x;
        material.normalScale = new THREE.Vector2(x, y);
      } else if (Number.isFinite(scale)) {
        material.normalScale = new THREE.Vector2(scale, scale);
      }
      material.needsUpdate = true;
    }

    const bumpTexture = loadAdditionalTexture(baseConfig.bumpUrl, baseConfig, {
      colorSpace: "linear",
    });
    if (bumpTexture) {
      material.bumpMap = bumpTexture;
      if (Number.isFinite(baseConfig.bumpScale)) {
        material.bumpScale = baseConfig.bumpScale;
      }
      material.needsUpdate = true;
    }

    const roughnessTexture = loadAdditionalTexture(
      baseConfig.roughnessUrl,
      baseConfig,
      { colorSpace: "linear" },
    );
    if (roughnessTexture) {
      material.roughnessMap = roughnessTexture;
      material.needsUpdate = true;
    }

    const metalnessTexture = loadAdditionalTexture(
      baseConfig.metalnessUrl,
      baseConfig,
      { colorSpace: "linear" },
    );
    if (metalnessTexture) {
      material.metalnessMap = metalnessTexture;
      material.needsUpdate = true;
    }

    const aoTexture = loadAdditionalTexture(baseConfig.aoUrl, baseConfig, {
      colorSpace: "linear",
    });
    if (aoTexture) {
      material.aoMap = aoTexture;
      if (Number.isFinite(baseConfig.aoIntensity)) {
        material.aoMapIntensity = baseConfig.aoIntensity;
      }
      material.needsUpdate = true;
    }
  }

  const detailConfigs = Array.isArray(config?.details) ? config.details : [];
  for (const layerConfig of detailConfigs) {
    const layer = createDetailLayer(layerConfig);
    if (layer) state.detailLayers.push(layer);
  }

  return state;
}

export function injectGroundTextureShader(shader, state) {
  if (!state?.detailLayers?.length) {
    return;
  }

  if (!shader.defines) {
    shader.defines = {};
  }
  if (shader.defines.USE_UV === undefined) {
    shader.defines.USE_UV = "";
  }

  if (!shader.vertexShader.includes("#include <uv_pars_vertex>")) {
    shader.vertexShader = shader.vertexShader.replace(
      "void main() {",
      `#include <uv_pars_vertex>\nvoid main() {`,
    );
  }

  if (!shader.vertexShader.includes("#include <uv_vertex>")) {
    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      `#include <uv_vertex>\n#include <project_vertex>`,
    );
  }

  const header = [];
  const mixCode = [];

  state.detailLayers.forEach((layer, index) => {
    const mapName = `uGroundDetailMap${index}`;
    const paramName = `uGroundDetailParams${index}`;
    const tintName = `uGroundDetailTint${index}`;
    const modeName = `uGroundDetailMode${index}`;
    const tintMultiplierName = `uGroundDetailTintMultiplier${index}`;

    shader.uniforms[mapName] = { value: layer.texture };
    shader.uniforms[paramName] = { value: layer.params };
    shader.uniforms[tintName] = { value: layer.tint };
    shader.uniforms[modeName] = { value: layer.mode };
    shader.uniforms[tintMultiplierName] = {
      value: layer.tintMultiplier ?? 1,
    };

    header.push(
      [
        `uniform sampler2D ${mapName};`,
        `uniform vec4 ${paramName};`,
        `uniform vec3 ${tintName};`,
        `uniform float ${modeName};`,
        `uniform float ${tintMultiplierName};`,
      ].join("\n"),
    );

    mixCode.push(`
      {
        vec4 detailSample = texture2D(${mapName}, vUv);
        float minH = ${paramName}.x;
        float maxH = ${paramName}.y;
        float fade = max(${paramName}.z, 0.0001);
        float strength = clamp(${paramName}.w, 0.0, 1.0);
        float mask = 1.0;
        if (maxH > minH) {
          mask = smoothstep(minH, minH + fade, groundHeight);
          mask *= 1.0 - smoothstep(maxH - fade, maxH, groundHeight);
        }
        float layerStrength = strength * mask;
        if (layerStrength > 0.0) {
          vec3 layerColor = detailSample.rgb;
          layerColor *= mix(vec3(1.0), ${tintName}, ${tintMultiplierName});
          if (abs(${modeName} - 1.0) < 0.5) {
            diffuseColor.rgb = mix(diffuseColor.rgb, layerColor, layerStrength);
          } else {
            diffuseColor.rgb *= mix(vec3(1.0), layerColor, layerStrength);
          }
        }
      }
    `);
  });

  const hasUvParsFragment = shader.fragmentShader.includes(
    "#include <uv_pars_fragment>",
  );

  const commonInjection = [
    "#include <common>",
    ...(hasUvParsFragment ? [] : ["#include <uv_pars_fragment>"]),
    ...header,
  ].join("\n");

  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <common>",
    commonInjection,
  );

  shader.fragmentShader = shader.fragmentShader.replace(
    "vec4 diffuseColor = vec4( diffuse, opacity );",
    `vec4 diffuseColor = vec4( diffuse, opacity );\nfloat groundHeight = vGroundHeight;\n${mixCode.join(
      "\n",
    )}`,
  );
}
