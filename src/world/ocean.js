import * as THREE from "three";
import { Water } from "three/examples/jsm/objects/Water.js";
import { resolveBaseUrl, joinPath } from "../utils/baseUrl.js";
import {
  HARBOR_WATER_CENTER,
  HARBOR_WATER_SIZE,
  HARBOR_WATER_EAST_LIMIT,
  HARBOR_WATER_BOUNDS,
  HARBOR_WATER_NORMAL_CANDIDATES,
  getSeaLevelY,
  SEA_LEVEL_Y,
} from "./locations.js";
import { mountWaterBoundsDebug } from "./debug_waterBounds.js";

function generateNormalComponent(x, y, octave) {
  const frequency = Math.pow(2, octave);
  const angle = (x * frequency + y * frequency * 1.3) * 0.12;
  return Math.sin(angle * 1.7 + octave * 1.1) * 0.6;
}

const textureLoader = new THREE.TextureLoader();

function sanitizeRelativePath(value) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/^public\//i, "")
    .replace(/^docs\//i, "")
    .replace(/^\.\//, "")
    .replace(/^\/+/, "");
}

export function getDefaultWaterNormalCandidates(base = resolveBaseUrl()) {
  return HARBOR_WATER_NORMAL_CANDIDATES.map((relative) => {
    const sanitized = sanitizeRelativePath(relative);
    if (!sanitized) {
      return null;
    }
    return joinPath(base, sanitized);
  }).filter(Boolean);
}

function configureWaterNormalsTexture(texture) {
  if (!texture) return;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  if ("colorSpace" in texture && THREE.LinearSRGBColorSpace !== undefined) {
    texture.colorSpace = THREE.LinearSRGBColorSpace;
  }
  texture.needsUpdate = true;
}

function loadWaterNormalsTexture(url) {
  return new Promise((resolve, reject) => {
    let disposed = false;
    try {
      const texture = textureLoader.load(
        url,
        () => {
          if (disposed) return;
          configureWaterNormalsTexture(texture);
          resolve(texture);
        },
        undefined,
        (error) => {
          if (!disposed) {
            disposed = true;
            texture.dispose();
          }
          reject(error);
        },
      );
      configureWaterNormalsTexture(texture);
    } catch (error) {
      reject(error);
    }
  });
}

function createProceduralWaterNormals(size = 256) {
  const data = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let nx = 0;
      let ny = 0;

      for (let octave = 0; octave < 4; octave++) {
        const weight = 1 / Math.pow(2, octave);
        nx += generateNormalComponent(x, y, octave) * weight;
        ny += generateNormalComponent(y, x, octave) * weight;
      }

      const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));

      const index = (y * size + x) * 4;
      data[index] = Math.floor((nx * 0.5 + 0.5) * 255);
      data[index + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      data[index + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
      data[index + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  configureWaterNormalsTexture(texture);
  return texture;
}

const _dayWaterColor = new THREE.Color(0x1a4e80);
const _nightWaterColor = new THREE.Color(0x091c2a);
const _moodWaterColor = new THREE.Color();

const DEFAULT_SEAWARD_PADDING = 4;
const DEFAULT_INLAND_PADDING = 2;
const DEFAULT_SEAWARD_CLIP = Number.isFinite(HARBOR_WATER_BOUNDS?.north)
  ? HARBOR_WATER_BOUNDS.north - DEFAULT_SEAWARD_PADDING
  : -120;
const DEFAULT_INLAND_CLIP = Number.isFinite(HARBOR_WATER_BOUNDS?.south)
  ? HARBOR_WATER_BOUNDS.south + DEFAULT_INLAND_PADDING
  : 160;
const TERRAIN_CLEARANCE_EPSILON = 0.02;
const SHORE_PROBE_X_FRACTIONS = [0.2, 0.5, 0.8];
const SHORE_PROBE_Z_FRACTIONS = [0.0, 0.5, 0.9];

let cachedWaterNormalsTexture = null;
let cachedWaterNormalsKey = null;

async function resolveWaterNormalsTexture(options) {
  const candidates = [];

  if (typeof options === "string") {
    candidates.push(options);
  } else if (Array.isArray(options)) {
    candidates.push(...options);
  } else if (options && typeof options === "object") {
    if (typeof options.url === "string") {
      candidates.push(options.url);
    }
    if (Array.isArray(options.candidates)) {
      candidates.push(...options.candidates);
    }
    if (Array.isArray(options.urls)) {
      candidates.push(...options.urls);
    }
  }

  const base = resolveBaseUrl();
  const defaultCandidates = getDefaultWaterNormalCandidates(base);
  candidates.push(...defaultCandidates.map((candidate) => {
    if (typeof candidate === "string") {
      return candidate;
    }
    return null;
  }).filter(Boolean));

  const tried = new Set();
  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const normalized = candidate.trim();
    if (!normalized) continue;

    const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(normalized) || normalized.startsWith("data:");
    const resolved = isAbsolute
      ? normalized
      : joinPath(base, sanitizeRelativePath(normalized));

    if (!resolved || tried.has(resolved)) continue;
    tried.add(resolved);

    if (cachedWaterNormalsTexture && cachedWaterNormalsKey === resolved) {
      return cachedWaterNormalsTexture;
    }

    try {
      const texture = await loadWaterNormalsTexture(resolved);
      cachedWaterNormalsTexture = texture;
      cachedWaterNormalsKey = resolved;
      return texture;
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.info("[water] Failed to load normal map candidate", resolved, error);
      }
    }
  }

  if (!cachedWaterNormalsTexture || cachedWaterNormalsKey !== "procedural") {
    console.warn("[ocean] Water normal not found; using flat normal.");
    cachedWaterNormalsTexture = createProceduralWaterNormals();
    cachedWaterNormalsKey = "procedural";
  }

  return cachedWaterNormalsTexture;
}

function resolveDevicePixelRatio(options) {
  if (options && Number.isFinite(options.devicePixelRatio)) {
    return options.devicePixelRatio;
  }
  if (typeof window !== "undefined" && window.devicePixelRatio) {
    return window.devicePixelRatio;
  }
  return 1;
}

function computeRenderTargetSize(options) {
  const baseSize = options?.baseTextureSize ?? 512;
  const dpr = THREE.MathUtils.clamp(resolveDevicePixelRatio(options), 0.75, 3);
  const size = Math.round(baseSize * dpr);
  return THREE.MathUtils.clamp(size, 256, 2048);
}

function resolveHeightSampler(scene, options) {
  if (options) {
    if (typeof options.heightSampler === "function") {
      return options.heightSampler;
    }
    const terrainSampler = options.terrain?.userData?.getHeightAt;
    if (typeof terrainSampler === "function") {
      return terrainSampler;
    }
  }

  const sceneSampler =
    typeof scene?.userData?.terrainHeightSampler === "function"
      ? scene.userData.terrainHeightSampler
      : scene?.userData?.getHeightAt;
  if (typeof sceneSampler === "function") {
    return sceneSampler;
  }
  return null;
}

function parseClipPadding(padding) {
  const resolved = { front: null, back: null };
  if (Number.isFinite(padding)) {
    resolved.front = padding;
    resolved.back = padding;
    return resolved;
  }
  if (!padding || typeof padding !== "object") {
    return resolved;
  }

  if (Number.isFinite(padding.front)) {
    resolved.front = padding.front;
  } else if (Number.isFinite(padding.north)) {
    resolved.front = padding.north;
  }

  if (Number.isFinite(padding.back)) {
    resolved.back = padding.back;
  } else if (Number.isFinite(padding.south)) {
    resolved.back = padding.south;
  }

  return resolved;
}

function sampleTerrainCeiling(bounds, sampler) {
  if (!bounds || typeof sampler !== "function") {
    return null;
  }

  const { west, east, north, south } = bounds;
  const samples = [];

  for (const fraction of SHORE_PROBE_X_FRACTIONS) {
    const x = THREE.MathUtils.lerp(west, east, fraction);
    samples.push(sampler(x, north));
    samples.push(sampler(x, south));
  }

  for (const fraction of SHORE_PROBE_Z_FRACTIONS) {
    const z = THREE.MathUtils.lerp(north, south, fraction);
    samples.push(sampler(west, z));
    samples.push(sampler(east, z));
  }

  const finiteSamples = samples.filter(Number.isFinite);
  if (finiteSamples.length === 0) {
    return null;
  }

  const minHeight = Math.min(...finiteSamples);
  return minHeight - TERRAIN_CLEARANCE_EPSILON;
}

export async function createOcean(scene, options = {}) {
  // Remove prior water meshes
  scene.traverse((o) => {
    if (o && (o.name === "AegeanOcean" || o.userData?.isWater)) {
      o.parent?.remove(o);
    }
  });

  const waterNormals = await resolveWaterNormalsTexture(
    options.waterNormalsCandidates || HARBOR_WATER_NORMAL_CANDIDATES
  );

  // 1. RESOLVE SEA LEVEL
  const seaLevel = Number.isFinite(options.seaLevel)
    ? options.seaLevel
    : Number.isFinite(getSeaLevelY())
      ? getSeaLevelY()
      : SEA_LEVEL_Y;

  // 2. CREATE MASSIVE GEOMETRY (The Fix)
  // Instead of using HARBOR_WATER_BOUNDS, we use a fixed massive size
  // to ensure it touches the horizon mountains.
  const SIZE = 4000; 
  const geometry = new THREE.PlaneGeometry(SIZE, SIZE);

  // 3. CONFIGURE WATER SHADER
  const water = new Water(geometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: waterNormals,
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined,
  });

  // 4. POSITIONING
  water.rotation.x = -Math.PI / 2;
  // Center at (0, seaLevel, 0) so it extends equally in all directions
  water.position.set(0, seaLevel, 0); 
  
  water.name = "AegeanOcean";
  water.userData.isWater = true;
  water.userData.seaLevel = seaLevel;

  // Custom wave scaling
  if (waterNormals) {
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
    // Repeat texture 20 times across the massive plane so waves look detailed, not stretched
    waterNormals.repeat.set(20, 20); 
  }

  scene.add(water);

  // Debug info
  if (import.meta.env?.DEV) {
    console.info(`[ocean] Created Global Ocean at Y=${seaLevel}`);
  }

  return water;
}

  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(west, 0, north),
    new THREE.Vector3(east, 0, north),
    new THREE.Vector3(east, 0, south),
    new THREE.Vector3(west, 0, south),
  ]);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    depthTest: false,
  });
  const loop = new THREE.LineLoop(geometry, material);
  loop.position.y = yOffset;
  return loop;
}

export function mountWaterClipDebug(
  scene,
  rawBounds,
  clipBounds,
  seaLevel = getSeaLevelY(),
) {
  const group = new THREE.Group();
  group.name = "WaterClipDebug";

  const baseY = seaLevel + 0.01;
  const rawLoop = createBoundsLoop(rawBounds, 0xffb347, baseY);
  if (rawLoop) {
    rawLoop.name = "WaterClipDebug:raw";
    group.add(rawLoop);
  }

  const clipLoop = createBoundsLoop(clipBounds, 0x4ec3ff, baseY + 0.01);
  if (clipLoop) {
    clipLoop.name = "WaterClipDebug:clip";
    group.add(clipLoop);
  }

  if (group.children.length === 0) {
    return null;
  }

  scene.add(group);
  return group;
}

export function updateOcean(ocean, deltaSeconds = 0, sunDir, mood = 0) {
  if (!ocean) return;
  const uniforms = ocean.uniforms ?? ocean.mesh?.material?.uniforms;
  if (!uniforms) return;

  if (Number.isFinite(deltaSeconds)) {
    uniforms.time.value += deltaSeconds;
  }
  if (sunDir && uniforms.sunDirection) {
    uniforms.sunDirection.value.copy(sunDir);
  }

  const calmFactor = THREE.MathUtils.clamp(typeof mood === "number" ? mood : 0, 0, 1);
  if (uniforms.distortionScale) {
    uniforms.distortionScale.value = THREE.MathUtils.lerp(3.2, 1.2, calmFactor);
  }
  if (uniforms.waterColor) {
    uniforms.waterColor.value.copy(
      _moodWaterColor.copy(_dayWaterColor).lerp(_nightWaterColor, calmFactor)
    );
  }
}
