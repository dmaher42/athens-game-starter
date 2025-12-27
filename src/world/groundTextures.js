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
const DEFAULT_MASK_RESOLUTION = 128;

const fallbackMask = (() => {
  const data = new Uint8Array([0]);
  const tex = new THREE.DataTexture(
    data,
    1,
    1,
    THREE.RedFormat,
    THREE.UnsignedByteType,
  );
  tex.needsUpdate = true;
  tex.colorSpace = THREE.LinearSRGBColorSpace;
  return tex;
})();

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
  } else {
    // Use a higher default anisotropy for crisper ground textures on modern GPUs
    try {
      texture.anisotropy = Math.max(texture.anisotropy || 1, 8);
    } catch (e) {
      /* ignore */
    }
  }

  // Only set needsUpdate if the texture has data (DataTexture) or an image loaded
  // This prevents "Texture marked for update but no image data found" errors
  if (texture.isDataTexture || (texture.image && (texture.image.width > 0 || texture.image.data))) {
    texture.needsUpdate = true;
  }
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
  const noiseScale = Number.isFinite(config.noiseScale) ? config.noiseScale : 0;
  const noiseStrength = THREE.MathUtils.clamp(config.noiseStrength ?? 0, 0, 1);

  return {
    texture,
    params: new THREE.Vector4(minHeight, maxHeight, fade, effectiveStrength),
    tint,
    mode,
    tintMultiplier: applyTintMultiplier ? 1 : 0,
    noise: new THREE.Vector2(noiseScale, noiseStrength),
  };
}

export function createGroundTextureState(
  material,
  config = GROUND_TEXTURE_CONFIG,
) {
  if (!material) return { detailLayers: [] };
  const state = {
    detailLayers: [],
    baseBlend: null,
    stoneBlend: null,
    beach: null,
    macro: null,
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
  }

  const detailConfigs = Array.isArray(config?.details) ? config.details : [];
  for (const layerConfig of detailConfigs) {
    const layer = createDetailLayer(layerConfig);
    if (layer) state.detailLayers.push(layer);
  }

  const blendConfig = config?.blend;
  const blendEnabled = blendConfig?.enabled !== false;
  if (blendEnabled && (blendConfig?.dirt?.url || blendConfig?.dirt?.generator)) {
    const grassTex = blendConfig.grass?.url
      ? loadTexture(blendConfig.grass.url, blendConfig.grass)
      : null;
    const dirtTex = blendConfig.dirt?.url
      ? loadTexture(blendConfig.dirt.url, blendConfig.dirt)
      : null;

    // Stone texture loading
    const stoneTex = blendConfig.stone?.url
      ? loadTexture(blendConfig.stone.url, blendConfig.stone)
      : null;

    if (grassTex) configureTexture(grassTex, blendConfig.grass);
    if (dirtTex) configureTexture(dirtTex, blendConfig.dirt);
    if (stoneTex) configureTexture(stoneTex, blendConfig.stone);

    const maskSize = Math.max(
      8,
      Math.min(blendConfig.maskResolution ?? DEFAULT_MASK_RESOLUTION, 1024),
    );
    const maskData = new Uint8Array(maskSize * maskSize);
    const maskTexture = new THREE.DataTexture(
      maskData,
      maskSize,
      maskSize,
      THREE.RedFormat,
      THREE.UnsignedByteType,
    );
    maskTexture.needsUpdate = true;
    maskTexture.colorSpace = THREE.LinearSRGBColorSpace;
    maskTexture.magFilter = THREE.LinearFilter;
    maskTexture.minFilter = THREE.LinearMipMapLinearFilter;

    // Helper for tint
    const stoneTint = new THREE.Color(1, 1, 1);
    if (blendConfig.stone?.tint) {
      if (Array.isArray(blendConfig.stone.tint)) {
        stoneTint.fromArray(blendConfig.stone.tint);
      } else {
        stoneTint.set(blendConfig.stone.tint);
      }
    }

    state.baseBlend = {
      grassTexture: grassTex,
      dirtTexture: dirtTex,
      stoneTexture: stoneTex,
      stoneTint: stoneTint,

      noiseScale: blendConfig.noiseScale ?? 16,
      noiseContrast: Math.max(0.0001, blendConfig.noiseContrast ?? 1.2),

      slopeThreshold: blendConfig.slopeThreshold ?? 0.7,
      slopeBlend: blendConfig.slopeBlend ?? 0.2,

      maskTexture,
      maskData,
      maskSize,
      maskStrength: THREE.MathUtils.clamp(blendConfig.maskStrength ?? 1, 0, 2),
      uniforms: {},
    };
  }

  // Parse Beach Config
  if (config?.beach) {
    state.beach = {
      height: config.beach.height ?? 2.0,
      fade: config.beach.fade ?? 2.0,
      uniforms: {},
    };
  }

  // Parse Macro Config
  if (config?.macro) {
    state.macro = {
      scale: config.macro.scale ?? 0.05,
      strength: config.macro.strength ?? 0.15,
      uniforms: {},
    }
  }

  return state;
}

export function injectGroundTextureShader(shader, state) {
  const hasDetails = state?.detailLayers?.length > 0;
  const hasBlend = !!state?.baseBlend?.dirtTexture;
  const hasStone = !!state?.baseBlend?.stoneTexture;
  const hasBeach = !!state?.beach;
  const hasMacro = !!state?.macro;

  if (!hasDetails && !hasBlend && !hasBeach && !hasMacro) {
    return;
  }

  if (!shader.defines) {
    shader.defines = {};
  }
  if (shader.defines.USE_UV === undefined) {
    shader.defines.USE_UV = "";
  }

  // Need derivative functions for normal calc
  if (!shader.extensions) shader.extensions = {};
  shader.extensions.derivatives = true;

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

  const varyings = [];

  // ALWAYS inject vGroundHeight if we have details OR beach OR blend (for slope)
  if (hasDetails || hasBeach || hasBlend || hasMacro) {
    const groundHeightVarying = "varying float vGroundHeight;";
    if (!shader.vertexShader.includes(groundHeightVarying)) {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <uv_pars_vertex>",
        `#include <uv_pars_vertex>\n${groundHeightVarying}`,
      );
    }

    if (!shader.vertexShader.includes("vGroundHeight = position.z;")) {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n  vGroundHeight = position.z;",
      );
    }
    varyings.push(groundHeightVarying);
  }

  // Inject vWorldNormal to calculate slope
  if (hasBlend) {
    const worldNormalVarying = "varying vec3 vWorldNormal;";
    if (!shader.vertexShader.includes(worldNormalVarying)) {
       shader.vertexShader = shader.vertexShader.replace(
        "#include <uv_pars_vertex>",
        `#include <uv_pars_vertex>\n${worldNormalVarying}`,
      );
    }
    // We need object normal transformed to world space
    // Three.js 'begin_normal' computes 'objectNormal'
    // 'default_normal' transforms it to 'transformedNormal' (view space)
    // We want world space.
    // 'worldNormal' is often available in some chunks but best to compute our own to be safe.
    // modelMatrix * vec4(objectNormal, 0.0)

    // We can inject it after default_normal to ensure objectNormal is populated
    if (!shader.vertexShader.includes("vWorldNormal = normalize(")) {
       shader.vertexShader = shader.vertexShader.replace(
        "#include <defaultnormal_vertex>",
        `#include <defaultnormal_vertex>\n vWorldNormal = normalize( mat3( modelMatrix ) * objectNormal );`
       );
    }
    varyings.push(worldNormalVarying);
  }

  if (hasBlend || hasMacro) {
    const worldXZVarying = "varying vec2 vWorldXZ;";
    if (!shader.vertexShader.includes(worldXZVarying)) {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <uv_pars_vertex>",
        `#include <uv_pars_vertex>\n${worldXZVarying}`,
      );
    }
    if (!shader.vertexShader.includes("vWorldXZ = (modelMatrix * vec4(transformed, 1.0)).xz;")) {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n  vWorldXZ = (modelMatrix * vec4(transformed, 1.0)).xz;",
      );
    }
    varyings.push(worldXZVarying);
  }

  const header = shader.fragmentShader.includes("varying float vGroundHeight;")
    ? []
    : varyings;
  const mixCode = [];

  // Debug Uniform
  shader.uniforms.uDebugTerrain = { value: 0.0 };
  header.push("uniform float uDebugTerrain;");

  // Beach Uniforms
  let beachHeader = "";
  if (hasBeach) {
    shader.uniforms.uSeaLevel = { value: 0.0 }; // Will be updated by state consumer
    shader.uniforms.uBeachHeight = { value: state.beach.height };
    shader.uniforms.uBeachFade = { value: state.beach.fade };

    // Store reference to update uniform later
    state.beach.uniforms = {
      uSeaLevel: shader.uniforms.uSeaLevel
    };

    beachHeader = `uniform float uSeaLevel;\nuniform float uBeachHeight;\nuniform float uBeachFade;`;
  }

  // Macro Uniforms
  let macroHeader = "";
  if (hasMacro) {
    shader.uniforms.uGroundMacroParams = { value: new THREE.Vector2(state.macro.scale, state.macro.strength) };
    macroHeader = `uniform vec2 uGroundMacroParams;`;
  }

  if (hasBlend) {
    shader.uniforms.uGroundDirtMap = { value: state.baseBlend.dirtTexture };
    shader.uniforms.uGroundStoneMap = { value: state.baseBlend.stoneTexture || fallbackMask };
    shader.uniforms.uGroundStoneTint = { value: state.baseBlend.stoneTint };

    shader.uniforms.uGroundBlendNoise = {
      value: new THREE.Vector2(
        state.baseBlend.noiseScale ?? 16,
        state.baseBlend.noiseContrast ?? 1.2,
      ),
    };

    shader.uniforms.uGroundSlopeParams = {
        value: new THREE.Vector2(state.baseBlend.slopeThreshold, state.baseBlend.slopeBlend)
    };

    shader.uniforms.uGroundBlendMask = {
      value: state.baseBlend.maskTexture || fallbackMask,
    };
    shader.uniforms.uGroundBlendMaskStrength = {
      value: state.baseBlend.maskStrength ?? 1,
    };
    shader.uniforms.uGroundGrassMap = {
      value:
        state.baseBlend.grassTexture || shader.uniforms.map?.value || fallbackMask,
    };

    state.baseBlend.uniforms = {
      mask: shader.uniforms.uGroundBlendMask,
      maskStrength: shader.uniforms.uGroundBlendMaskStrength,
    };
  }

  if (hasDetails) {
    state.detailLayers.forEach((layer, index) => {
      const mapName = `uGroundDetailMap${index}`;
      const paramName = `uGroundDetailParams${index}`;
      const tintName = `uGroundDetailTint${index}`;
      const modeName = `uGroundDetailMode${index}`;
      const tintMultiplierName = `uGroundDetailTintMultiplier${index}`;
      const noiseName = `uGroundDetailNoise${index}`;

      shader.uniforms[mapName] = { value: layer.texture };
      shader.uniforms[paramName] = { value: layer.params };
      shader.uniforms[tintName] = { value: layer.tint };
      shader.uniforms[modeName] = { value: layer.mode };
      shader.uniforms[tintMultiplierName] = {
        value: layer.tintMultiplier ?? 1,
      };
      shader.uniforms[noiseName] = {
        value: layer.noise ?? new THREE.Vector2(0, 0),
      };

      header.push(
        [
          `uniform sampler2D ${mapName};`,
          `uniform vec4 ${paramName};`,
          `uniform vec3 ${tintName};`,
          `uniform float ${modeName};`,
          `uniform float ${tintMultiplierName};`,
          `uniform vec2 ${noiseName};`,
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
          mask = smoothstep(minH, minH + fade, vGroundHeight);
          mask *= 1.0 - smoothstep(maxH - fade, maxH, vGroundHeight);
        }
        float layerStrength = strength * mask;
        float noiseScale = ${noiseName}.x;
        float noiseStrength = ${noiseName}.y;
        if (noiseScale > 0.0 && noiseStrength > 0.0) {
          float n = groundNoise(vUv * noiseScale);
          float noiseMask = smoothstep(0.5 - 0.5 * noiseStrength, 0.5 + 0.5 * noiseStrength, n);
          layerStrength *= noiseMask;
        }
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
  }

  const hasUvParsFragment = shader.fragmentShader.includes(
    "#include <uv_pars_fragment>",
  );

  const groundNoiseFn = `
float groundHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float groundNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = groundHash(i);
  float b = groundHash(i + vec2(1.0, 0.0));
  float c = groundHash(i + vec2(0.0, 1.0));
  float d = groundHash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
`;

  const blendHeader = hasBlend
    ? `uniform sampler2D uGroundDirtMap;
       uniform sampler2D uGroundStoneMap;
       uniform vec3 uGroundStoneTint;
       uniform sampler2D uGroundBlendMask;
       uniform vec2 uGroundBlendNoise;
       uniform vec2 uGroundSlopeParams;
       uniform float uGroundBlendMaskStrength;
       uniform sampler2D uGroundGrassMap;`
    : "";

  const commonInjection = [
    "#include <common>",
    ...(hasUvParsFragment ? [] : ["#include <uv_pars_fragment>"]),
    ...header,
    groundNoiseFn,
    blendHeader,
    beachHeader,
    macroHeader
  ]
    .filter(Boolean)
    .join("\n");

  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <common>",
    commonInjection,
  );

  if (hasBlend) {
    // TRI-BLEND LOGIC: Grass vs Dirt vs Stone
    let blendLogic = `
      vec3 grassTexel = vec3(1.0);
      vec3 baseDiffuse = diffuseColor.rgb;
      #ifdef USE_MAP
        grassTexel = texture2D(uGroundGrassMap, vUv).rgb;
      #endif

      vec3 dirtTexel = texture2D(uGroundDirtMap, vUv).rgb;
      vec3 stoneTexel = texture2D(uGroundStoneMap, vUv).rgb * uGroundStoneTint;

      // 1. Compute Base Dirt Noise Blend
      float noiseWeight = clamp(groundNoise(vWorldXZ * uGroundBlendNoise.x), 0.0, 1.0);
      noiseWeight = pow(noiseWeight, max(uGroundBlendNoise.y, 0.0001));
      float maskWeight = texture2D(uGroundBlendMask, vUv).r * uGroundBlendMaskStrength;
      float dirtWeight = clamp(max(noiseWeight, maskWeight), 0.0, 1.0);

      // 2. Beach Override (Low Height -> Sand/Dirt)
      float beachLimit = uSeaLevel + uBeachHeight;
      float beachFactor = 1.0 - smoothstep(beachLimit, beachLimit + uBeachFade, vGroundHeight);
      dirtWeight = clamp(max(dirtWeight, beachFactor), 0.0, 1.0);

      // 3. Slope Override (High Slope -> Stone)
      // vWorldNormal.y is 1.0 for flat ground, 0.0 for vertical.
      // Slope = 1.0 - vWorldNormal.y.
      float slope = 1.0 - clamp(vWorldNormal.y, 0.0, 1.0);
      float slopeThresh = uGroundSlopeParams.x;
      float slopeBlendWidth = uGroundSlopeParams.y;
      float stoneWeight = smoothstep(slopeThresh, slopeThresh + slopeBlendWidth, slope);

      // 4. Combine
      // Stone is top layer, then Dirt, then Grass
      vec3 mixed = mix(grassTexel, dirtTexel, dirtWeight);
      mixed = mix(mixed, stoneTexel, stoneWeight);

      // Apply Macro Variation
      #ifdef USE_UV
         vec2 macroUv = vWorldXZ * uGroundMacroParams.x;
         float macroNoise = groundNoise(macroUv);
         // Remap 0..1 to (1-strength)..(1+strength)
         float macroFactor = 1.0 + (macroNoise - 0.5) * 2.0 * uGroundMacroParams.y;
         mixed *= macroFactor;
      #endif

      // Debug Visualization
      if (uDebugTerrain > 0.5) {
         if (uDebugTerrain < 1.5) {
            // Mode 1: Weights (R=Grass, G=Dirt, B=Stone)
            // Note: This is an approximation since they overlap
            float grassW = (1.0 - stoneWeight) * (1.0 - dirtWeight);
            float dirtW = (1.0 - stoneWeight) * dirtWeight;
            mixed = vec3(grassW, dirtW, stoneWeight);
         } else {
            // Mode 2: Height/Slope
            // R = Height (normalized), G = Slope, B = 0
            float h = (vGroundHeight - uSeaLevel) / 20.0;
            mixed = vec3(h, slope, 0.0);
         }
      }

      diffuseColor = vec4(mixed * baseDiffuse, diffuseColor.a);
    `;

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      blendLogic
    );
  }

  if (hasDetails) {
    const injection = `vec4 diffuseColor = vec4( diffuse, opacity );\n${mixCode.join("\n")}`;

    shader.fragmentShader = shader.fragmentShader.replace(
      "vec4 diffuseColor = vec4( diffuse, opacity );",
      injection
    );
  }
}
