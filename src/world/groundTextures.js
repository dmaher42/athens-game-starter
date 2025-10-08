import * as THREE from "three";
import { GROUND_TEXTURE_CONFIG } from "./groundTextureConfig.js";

const textureLoader = new THREE.TextureLoader();

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
  if (!config?.url) return null;
  const texture = loadTexture(config.url, config);
  if (!texture) return null;

  const strength = THREE.MathUtils.clamp(config.strength ?? 0.35, 0, 1);
  const minHeight = Number.isFinite(config.minHeight)
    ? config.minHeight
    : -1000;
  const maxHeight = Number.isFinite(config.maxHeight)
    ? config.maxHeight
    : 1000;
  const fade = Math.max(config.fade ?? 8, 0);

  const tint = new THREE.Color(1, 1, 1);
  if (Array.isArray(config.tint)) {
    tint.setRGB(
      config.tint[0] ?? 1,
      config.tint[1] ?? config.tint[0] ?? 1,
      config.tint[2] ?? config.tint[1] ?? config.tint[0] ?? 1,
    );
  } else if (typeof config.tint === "string") {
    tint.set(config.tint);
  }

  const mode = config.mode === "mix" ? 1 : 0;

  return {
    texture,
    params: new THREE.Vector4(minHeight, maxHeight, fade, strength),
    tint,
    mode,
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
  if (baseConfig?.url) {
    const baseTexture = loadTexture(baseConfig.url, baseConfig);
    if (baseTexture) {
      material.map = baseTexture;
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

  const header = [];
  const mixCode = [];

  state.detailLayers.forEach((layer, index) => {
    const mapName = `uGroundDetailMap${index}`;
    const paramName = `uGroundDetailParams${index}`;
    const tintName = `uGroundDetailTint${index}`;
    const modeName = `uGroundDetailMode${index}`;

    shader.uniforms[mapName] = { value: layer.texture };
    shader.uniforms[paramName] = { value: layer.params };
    shader.uniforms[tintName] = { value: layer.tint };
    shader.uniforms[modeName] = { value: layer.mode };

    header.push(
      `uniform sampler2D ${mapName};\n` +
        `uniform vec4 ${paramName};\n` +
        `uniform vec3 ${tintName};\n` +
        `uniform float ${modeName};`,
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
          vec3 layerColor = detailSample.rgb * ${tintName};
          if (abs(${modeName} - 1.0) < 0.5) {
            diffuseColor.rgb = mix(diffuseColor.rgb, layerColor, layerStrength);
          } else {
            diffuseColor.rgb *= mix(vec3(1.0), layerColor, layerStrength);
          }
        }
      }
    `);
  });

  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <common>",
    `#include <common>\n${header.join("\n")}`,
  );

  shader.fragmentShader = shader.fragmentShader.replace(
    "vec4 diffuseColor = vec4( diffuse, opacity );",
    `vec4 diffuseColor = vec4( diffuse, opacity );\nfloat groundHeight = vGroundHeight;\n${mixCode.join(
      "\n",
    )}`,
  );
}
