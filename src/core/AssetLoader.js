import * as THREE from "three";

import { joinPath, resolveBaseUrl } from "../utils/baseUrl.js";

const HTML_CONTENT_TYPE = /text\/html/i;

const TRUE_JSON_PROBE = /audio\/manifest\.json|config\/districts\.json/i;
const GLB_EXTENSION = /\.glb(?:$|[?#])/i;

const DEFAULT_PROBES = ["audio/manifest.json", "models/npcs/manifest.json"];

export const ARISTOTLE_CANDIDATES = [
  "models/buildings/aristotle_tomb.glb",
  "models/buildings/aristotle_tomb_in_macedonia_greece.glb",
  "models/landmarks/aristotle_tomb.glb",
  "models/landmarks/aristotle_tomb_in_macedonia_greece.glb",
  "aristotle_tomb_in_macedonia_greece.glb",
];

export const POSEIDON_CANDIDATES = [
  "models/buildings/poseidon_temple.glb",
  "models/buildings/poseidon_temple_at_sounion_greece.glb",
  "models/landmarks/poseidon_temple.glb",
  "models/landmarks/poseidon_temple_at_sounion_greece.glb",
  "poseidon_temple_at_sounion_greece.glb",
];

export const AKROPOL_CANDIDATES = [
  "models/buildings/akropol.glb",
  "models/buildings/Akropol.glb",
  "models/landmarks/akropol.glb",
  "models/landmarks/Akropol.glb",
  "Akropol.glb",
];

function isHtmlResponse(res) {
  return HTML_CONTENT_TYPE.test(res.headers.get("content-type") || "");
}

function sanitizeRelativePath(value) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/^\/+/, "")
    .replace(/^public\//i, "")
    .replace(/^docs\//i, "")
    .replace(/^athens-game-starter\//i, "")
    .replace(/^\.\//, "");
}

export class AssetLoader {
  constructor({
    baseUrl = resolveBaseUrl(),
    forceProcedural = false,
    districtRuleCandidates = [],
  } = {}) {
    this.baseUrl = baseUrl;
    this.forceProcedural = Boolean(forceProcedural);
    this.districtRuleCandidates = districtRuleCandidates;
  }

  async probeInitialAssets({
    additionalProbes = [],
    glbCandidates = [],
    includeGlbCandidates = !this.forceProcedural,
  } = {}) {
    const base = this.baseUrl ?? resolveBaseUrl();
    console.log("[base:resolved]", base);

    const probes = [
      ...DEFAULT_PROBES,
      ...this.districtRuleCandidates,
      ...additionalProbes,
    ];
    if (includeGlbCandidates) {
      probes.push(...glbCandidates);
    }

    for (const relativePath of probes) {
      const url = joinPath(base, relativePath);
      try {
        const method = relativePath.endsWith(".json") ? "GET" : "HEAD";
        const response = await fetch(url, { method, cache: "no-cache" });
        console.log("[probe]", relativePath, response.status, response.ok, url);
      } catch (error) {
        console.warn("[probe-failed]", relativePath, url, error);
      }
    }

    console.log("[base]", base);
  }

  async headOk(url) {
    const target = typeof url === "string" ? url : String(url ?? "");
    const isJsonProbe = TRUE_JSON_PROBE.test(target);
    const isGlbProbe = GLB_EXTENSION.test(target);

    if (this.forceProcedural && isGlbProbe) {
      return false;
    }

    const options = isJsonProbe
      ? { method: "GET", cache: "no-cache" }
      : { method: "HEAD" };

    try {
      const res = await fetch(url, options);
      return res.ok && !isHtmlResponse(res);
    } catch (error) {
      return false;
    }
  }

  async resolveFirstAvailableAsset(candidates = []) {
    if (this.forceProcedural) {
      return null;
    }

    const seen = new Set();
    for (const url of candidates) {
      if (typeof url !== "string") continue;
      const trimmed = url.trim();
      if (!trimmed) continue;

      if (/^(?:[a-z]+:)?\/\//i.test(trimmed)) {
        if (!seen.has(trimmed) && (await this.headOk(trimmed))) {
          return trimmed;
        }
        seen.add(trimmed);
        continue;
      }

      const startsAtRoot = trimmed.startsWith("/");
      const relative = sanitizeRelativePath(trimmed);
      if (!relative && !startsAtRoot) {
        continue;
      }

      const candidatesToTry = Array.from(
        new Set(
          startsAtRoot
            ? [trimmed]
            : [joinPath(this.baseUrl, relative), relative],
        ),
      );

      for (const candidate of candidatesToTry) {
        if (seen.has(candidate)) continue;
        seen.add(candidate);
        if (await this.headOk(candidate)) {
          return candidate;
        }
      }
    }

    throw new Error("No candidate asset reachable: " + candidates.join(", "));
  }

  async runAssetQuickChecks() {
    const baseUrl = this.baseUrl ?? resolveBaseUrl();
    const districtCandidates = this.districtRuleCandidates.map((rel) =>
      joinPath(baseUrl, rel),
    );
    let resolvedDistrictPath = null;
    for (const candidate of districtCandidates) {
      if (await this.headOk(candidate)) {
        resolvedDistrictPath = candidate;
        break;
      }
    }

    const checks = [
      {
        label: "Audio Manifest",
        path: joinPath(baseUrl, "audio/manifest.json"),
      },
      {
        label: "Aristotle Tomb",
        path: joinPath(baseUrl, "models/landmarks/aristotle_tomb.glb"),
      },
      {
        label: "District Rules",
        path: resolvedDistrictPath ?? districtCandidates[0],
      },
      {
        label: "Water Normals",
        path: joinPath(baseUrl, "textures/ground/water_normals.png"),
      },
    ];

    const results = [];
    for (const { label, path } of checks) {
      if (this.forceProcedural && GLB_EXTENSION.test(path)) {
        results.push({ label, path, status: "skipped" });
        continue;
      }
      const exists = await this.headOk(path);
      results.push({ label, path, status: exists ? "ok" : "missing" });
    }

    if (typeof console?.table === "function") {
      console.table(results, ["label", "path", "status"]);
    } else {
      console.log("Asset QuickChecks", results);
    }
  }
}

function hashNoise(x, y, seed = 0) {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

function smoothNoise(x, y, seed = 0) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const xf = x - x0;
  const yf = y - y0;

  const n00 = hashNoise(x0, y0, seed);
  const n10 = hashNoise(x0 + 1, y0, seed);
  const n01 = hashNoise(x0, y0 + 1, seed);
  const n11 = hashNoise(x0 + 1, y0 + 1, seed);

  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);

  const nx0 = THREE.MathUtils.lerp(n00, n10, u);
  const nx1 = THREE.MathUtils.lerp(n01, n11, u);
  return THREE.MathUtils.lerp(nx0, nx1, v);
}

function fbm(
  x,
  y,
  { seed = 0, octaves = 5, persistence = 0.5, lacunarity = 2 } = {},
) {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;

  for (let i = 0; i < octaves; i += 1) {
    value +=
      amplitude * smoothNoise(x * frequency, y * frequency, seed + i * 19.19);
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return value;
}

function createSolidDataTexture(
  color,
  { colorSpace = THREE.SRGBColorSpace } = {},
) {
  const data = new Uint8Array(4);
  data[0] = (color >> 16) & 0xff;
  data[1] = (color >> 8) & 0xff;
  data[2] = color & 0xff;
  data[3] = 0xff;
  const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  texture.colorSpace = colorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.needsUpdate = true;
  return texture;
}

let cachedMonumentTextures = null;

export function createProceduralMarbleTextures() {
  if (cachedMonumentTextures) {
    return cachedMonumentTextures;
  }

  if (typeof document === "undefined" || !document.createElement) {
    cachedMonumentTextures = {
      map: createSolidDataTexture(0xefecea, {
        colorSpace: THREE.SRGBColorSpace,
      }),
      normalMap: createSolidDataTexture(0x8080ff, {
        colorSpace: THREE.LinearSRGBColorSpace,
      }),
      roughnessMap: createSolidDataTexture(0xb3b3b3, {
        colorSpace: THREE.LinearSRGBColorSpace,
      }),
      aoMap: createSolidDataTexture(0xe0e0e0, {
        colorSpace: THREE.LinearSRGBColorSpace,
      }),
    };
    return cachedMonumentTextures;
  }

  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const colorData = ctx.createImageData(size, size);
  const roughnessData = ctx.createImageData(size, size);
  const aoData = ctx.createImageData(size, size);
  const normalData = ctx.createImageData(size, size);
  const heights = new Float32Array(size * size);

  const baseScale = 6;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const idx = (y * size + x) * 4;
      const nx = (x / size) * baseScale;
      const ny = (y / size) * baseScale;

      const structure = fbm(nx * 0.85, ny * 0.9, { seed: 11, octaves: 4 });
      const turbulence = fbm(nx * 2.3, ny * 2.4, {
        seed: 37,
        octaves: 5,
        persistence: 0.55,
        lacunarity: 2.15,
      });
      const swirl = nx * 1.12 + ny * 1.27 + turbulence * 4.2;
      const wave = Math.sin(swirl + structure * 2.6);
      const fineDetail = fbm(nx * 5.2, ny * 5.4, {
        seed: 73,
        octaves: 3,
        persistence: 0.6,
        lacunarity: 2.8,
      });
      const height = 0.5 + 0.5 * wave * 0.8 + fineDetail * 0.2;
      const veins = Math.pow(
        Math.abs(Math.sin(swirl * 0.6 + fineDetail * 3.4)),
        1.4,
      );

      heights[y * size + x] = height;

      const warmTint = 0.04 + structure * 0.03;
      const baseTone = THREE.MathUtils.clamp(
        0.78 + height * 0.18 + structure * 0.05,
        0,
        1,
      );
      let r = baseTone + warmTint;
      let g = baseTone + warmTint * 0.6;
      let b = baseTone + warmTint * 0.2;
      r = THREE.MathUtils.clamp(r - veins * 0.09, 0, 1);
      g = THREE.MathUtils.clamp(g - veins * 0.07, 0, 1);
      b = THREE.MathUtils.clamp(b - veins * 0.05, 0, 1);

      colorData.data[idx + 0] = Math.round(r * 255);
      colorData.data[idx + 1] = Math.round(g * 255);
      colorData.data[idx + 2] = Math.round(b * 255);
      colorData.data[idx + 3] = 255;

      const rough = THREE.MathUtils.clamp(
        0.42 + veins * 0.32 + fineDetail * 0.12,
        0.18,
        0.88,
      );
      const roughByte = Math.round(rough * 255);
      roughnessData.data[idx + 0] = roughByte;
      roughnessData.data[idx + 1] = roughByte;
      roughnessData.data[idx + 2] = roughByte;
      roughnessData.data[idx + 3] = 255;

      const ao = THREE.MathUtils.clamp(
        0.93 - veins * 0.35 - fineDetail * 0.18,
        0.45,
        1,
      );
      const aoByte = Math.round(ao * 255);
      aoData.data[idx + 0] = aoByte;
      aoData.data[idx + 1] = aoByte;
      aoData.data[idx + 2] = aoByte;
      aoData.data[idx + 3] = 255;
    }
  }

  const sampleHeight = (x, y) => {
    const sx = (x + size) % size;
    const sy = (y + size) % size;
    return heights[sy * size + sx];
  };

  const normalStrength = 2.1;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const idx = (y * size + x) * 4;
      const heightL = sampleHeight(x - 1, y);
      const heightR = sampleHeight(x + 1, y);
      const heightD = sampleHeight(x, y - 1);
      const heightU = sampleHeight(x, y + 1);

      const dx = (heightR - heightL) * normalStrength;
      const dy = (heightU - heightD) * normalStrength;
      const dz = 1;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      const nx = dx / len;
      const ny = dy / len;
      const nz = dz / len;

      normalData.data[idx + 0] = Math.round((nx * 0.5 + 0.5) * 255);
      normalData.data[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      normalData.data[idx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      normalData.data[idx + 3] = 255;
    }
  }

  const textureFromImageData = (imageData, colorSpace) => {
    const texture = new THREE.DataTexture(
      imageData.data,
      imageData.width,
      imageData.height,
      THREE.RGBAFormat,
    );
    texture.needsUpdate = true;
    texture.colorSpace = colorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    return texture;
  };

  cachedMonumentTextures = {
    map: textureFromImageData(colorData, THREE.SRGBColorSpace),
    normalMap: textureFromImageData(normalData, THREE.LinearSRGBColorSpace),
    roughnessMap: textureFromImageData(
      roughnessData,
      THREE.LinearSRGBColorSpace,
    ),
    aoMap: textureFromImageData(aoData, THREE.LinearSRGBColorSpace),
  };

  return cachedMonumentTextures;
}
