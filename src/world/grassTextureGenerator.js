import * as THREE from "three";

const { clamp, lerp } = THREE.MathUtils;

function hashNoise(x, y, seed) {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

function smoothNoise(x, y, seed) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const xf = x - x0;
  const yf = y - y0;

  const n00 = hashNoise(x0, y0, seed);
  const n10 = hashNoise(x0 + 1, y0, seed);
  const n01 = hashNoise(x0, y0 + 1, seed);
  const n11 = hashNoise(x0 + 1, y0 + 1, seed);

  const nx0 = lerp(n00, n10, xf);
  const nx1 = lerp(n01, n11, xf);
  return lerp(nx0, nx1, yf);
}

function fbmNoise(x, y, options = {}) {
  const {
    octaves = 4,
    persistence = 0.55,
    lacunarity = 2.1,
    seed = 1,
  } = options;

  let amplitude = 1;
  let frequency = 1;
  let sum = 0;
  let max = 0;

  for (let i = 0; i < octaves; i++) {
    sum += smoothNoise(x * frequency, y * frequency, seed + i * 17.23) * amplitude;
    max += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  if (max <= 0) return 0;
  return sum / max;
}

function applySaturation(rgb, amount) {
  const [r, g, b] = rgb;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return [
    clamp(lum + (r - lum) * amount, 0, 255),
    clamp(lum + (g - lum) * amount, 0, 255),
    clamp(lum + (b - lum) * amount, 0, 255),
  ];
}

function applyContrast(rgb, amount) {
  const [r, g, b] = rgb;
  const adjust = (value) => clamp((value - 128) * amount + 128, 0, 255);
  return [adjust(r), adjust(g), adjust(b)];
}

function composeColor(base, shadow, highlight, params) {
  const { shadowMix, highlightMix, variation } = params;

  const mixChannel = (channelBase, channelShadow, channelHighlight) => {
    const shadowed = lerp(channelBase, channelShadow, shadowMix);
    const highlighted = lerp(shadowed, channelHighlight, highlightMix);
    return clamp(highlighted * (1 + variation), 0, 255);
  };

  return [
    mixChannel(base[0], shadow[0], highlight[0]),
    mixChannel(base[1], shadow[1], highlight[1]),
    mixChannel(base[2], shadow[2], highlight[2]),
  ];
}

export function createGrassTexture(options = {}) {
  const {
    size = 256,
    seed = 1337,
    baseColor = [92, 148, 70],
    shadowColor = [36, 74, 34],
    highlightColor = [164, 214, 116],
    bladeFrequency = 5.5,
    bladeTaper = 1.45,
    highlightStrength = 0.55,
    shadowStrength = 0.65,
    noiseScale = 3.5,
    patchiness = 0.2,
    saturation = 1.08,
    contrast = 1.06,
  } = options;

  const width = size;
  const height = size;
  const data = new Uint8Array(width * height * 3);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const ny = y / height;

      const patchNoise = fbmNoise(
        nx * noiseScale + seed * 0.13,
        ny * noiseScale + seed * 0.19,
        { octaves: 4, persistence: 0.55, seed },
      );

      const bladeNoise = fbmNoise(
        nx * (noiseScale * 1.7) + seed * 0.31,
        ny * (noiseScale * 1.1) + seed * 0.47,
        { octaves: 5, persistence: 0.5, seed: seed * 1.7 },
      );

      const bladePhase =
        Math.sin((nx + ny * 0.25) * Math.PI * bladeFrequency + bladeNoise * Math.PI * 2) *
          0.5 +
        0.5;
      const bladeProfile = Math.pow(bladePhase, bladeTaper);

      const shadowMix = clamp(bladeProfile * shadowStrength, 0, 1);
      const highlightMix = clamp(
        Math.pow(1 - bladeProfile, 2.0) * highlightStrength,
        0,
        1,
      );
      const variation = clamp((patchNoise - 0.5) * (patchiness * 2.4), -0.35, 0.4);

      let color = composeColor(baseColor, shadowColor, highlightColor, {
        shadowMix,
        highlightMix,
        variation,
      });

      color = applySaturation(color, saturation);
      color = applyContrast(color, contrast);

      const index = (y * width + x) * 3;
      data[index] = color[0];
      data[index + 1] = color[1];
      data[index + 2] = color[2];
    }
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RGBFormat);
  texture.needsUpdate = true;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.flipY = false;
  if ("colorSpace" in texture && THREE.SRGBColorSpace) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  return texture;
}

export function createGrassDetailTexture(options = {}) {
  const detailTexture = createGrassTexture({
    size: options.size ?? 256,
    seed: (options.seed ?? 1337) * 3.1,
    baseColor: options.baseColor ?? [86, 146, 68],
    shadowColor: options.shadowColor ?? [30, 64, 32],
    highlightColor: options.highlightColor ?? [182, 226, 128],
    bladeFrequency: options.bladeFrequency ?? 9.5,
    bladeTaper: options.bladeTaper ?? 1.1,
    highlightStrength: options.highlightStrength ?? 0.85,
    shadowStrength: options.shadowStrength ?? 0.75,
    noiseScale: options.noiseScale ?? 5.5,
    patchiness: options.patchiness ?? 0.35,
    saturation: options.saturation ?? 1.12,
    contrast: options.contrast ?? 1.15,
  });

  return detailTexture;
}
