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

export async function createOcean(scene, options = {}) {
  const renderTargetSize = computeRenderTargetSize(options);

  const waterNormalsOptions =
    options?.waterNormals !== undefined
      ? options.waterNormals
      : {
          url: options?.waterNormalsUrl,
          candidates: options?.waterNormalsCandidates,
        };

  const waterNormals = await resolveWaterNormalsTexture(waterNormalsOptions);

  const resolvedSeaLevel = Number.isFinite(options?.seaLevel)
    ? options.seaLevel
    : getSeaLevelY();
  const heightSampler = resolveHeightSampler(scene, options);

  // remove prior water meshes if any
  scene.traverse((o) => {
    if (o && (o.name === "AegeanOcean" || o.userData?.isWater)) {
      o.parent?.remove(o);
    }
  });

  const resolvedCenterX = Number.isFinite(options.position?.x)
    ? options.position.x
    : HARBOR_WATER_CENTER.x;
  const resolvedCenterZ = Number.isFinite(options.position?.z)
    ? options.position.z
    : HARBOR_WATER_CENTER.z;

  const resolvedSizeX = Number.isFinite(options.size?.x)
    ? options.size.x
    : HARBOR_WATER_SIZE.x;
  const resolvedSizeZ = Number.isFinite(options.size?.y)
    ? options.size.y
    : HARBOR_WATER_SIZE.y;

  const hasBounds =
    options?.bounds &&
    ["west", "east", "north", "south"].every((key) =>
      Number.isFinite(options.bounds[key])
    );

  let west;
  let east;
  let north;
  let south;

  if (hasBounds) {
    ({ west, east, north, south } = options.bounds);
  } else {
    const halfX = resolvedSizeX * 0.5;
    const halfZFront = resolvedSizeZ * 0.5;
    const halfZBack = 0;
    const cx = resolvedCenterX;
    const cz = resolvedCenterZ;

    const zFrontDesired = cz - halfZFront;
    const zBack = cz + halfZBack;

    west = cx - halfX;
    east = Math.min(cx + halfX, HARBOR_WATER_EAST_LIMIT);
    north = Math.max(zFrontDesired, DEFAULT_SEAWARD_CLIP);
    south = Math.max(zBack, north);
  }

  if (west > east) {
    [west, east] = [east, west];
  }
  if (north > south) {
    [north, south] = [south, north];
  }

  const baseBounds = { west, east, north, south };

  let width = Math.max(0.1, east - west);
  let depth = Math.max(0.1, south - north);

  const expansionFactor = 1.5; // extend ocean so horizon is always water.
  if (expansionFactor !== 1) {
    const centerX = (west + east) * 0.5;
    const centerZ = (north + south) * 0.5;
    width = Math.max(0.1, width * expansionFactor);
    depth = Math.max(0.1, depth * expansionFactor);
    west = centerX - width * 0.5;
    east = centerX + width * 0.5;
    north = centerZ - depth * 0.5;
    south = centerZ + depth * 0.5;
  }

  const expandedBounds = { west, east, north, south };

  const clipPadding = parseClipPadding(options?.clipPadding);
  const shoreBlendWidth =
    Number.isFinite(options?.shoreBlendWidth) && options.shoreBlendWidth !== 0
      ? Math.abs(options.shoreBlendWidth)
      : null;

  let clipZFront = baseBounds.north;
  let clipZBack = baseBounds.south;

  if (Number.isFinite(DEFAULT_SEAWARD_CLIP)) {
    clipZFront = Math.min(clipZFront, DEFAULT_SEAWARD_CLIP);
  }
  if (Number.isFinite(DEFAULT_INLAND_CLIP)) {
    clipZBack = Math.max(clipZBack, DEFAULT_INLAND_CLIP);
  }

  if (shoreBlendWidth !== null) {
    clipZFront = Math.min(clipZFront, baseBounds.north - shoreBlendWidth);
    clipZBack = Math.max(clipZBack, baseBounds.south + shoreBlendWidth);
  }

  if (clipPadding.front !== null) {
    clipZFront = baseBounds.north + clipPadding.front;
  }
  if (clipPadding.back !== null) {
    clipZBack = baseBounds.south + clipPadding.back;
  }

  clipZFront = Math.max(clipZFront, expandedBounds.north);
  clipZFront = Math.min(clipZFront, expandedBounds.south);
  clipZBack = Math.max(clipZBack, clipZFront + 0.01);
  clipZBack = Math.min(clipZBack, expandedBounds.south);

  const seawardExtension = baseBounds.north - clipZFront;
  if (heightSampler && seawardExtension > 0.05) {
    const sampleXs = SHORE_PROBE_X_FRACTIONS.map((fraction) =>
      THREE.MathUtils.lerp(baseBounds.west, baseBounds.east, fraction)
    );
    const sampleZs = SHORE_PROBE_Z_FRACTIONS.map((fraction) =>
      clipZFront + seawardExtension * fraction
    );

    let clampSeaward = false;
    for (const sampleX of sampleXs) {
      for (const sampleZ of sampleZs) {
        const ground = heightSampler(sampleX, sampleZ);
        if (
          Number.isFinite(ground) &&
          ground >= resolvedSeaLevel - TERRAIN_CLEARANCE_EPSILON
        ) {
          clampSeaward = true;
          break;
        }
      }
      if (clampSeaward) break;
    }

    if (clampSeaward) {
      clipZFront = baseBounds.north;
      if (import.meta.env?.DEV) {
        console.info("[ocean] Clamped seaward water extent due to terrain clearance.");
      }
    }
  }

  clipZFront = Math.max(clipZFront, expandedBounds.north);
  clipZFront = Math.min(clipZFront, expandedBounds.south);
  clipZBack = Math.max(clipZBack, clipZFront + 0.01);
  clipZBack = Math.min(clipZBack, expandedBounds.south);

  const geometry = new THREE.PlaneGeometry(width, depth, 1, 1);
  const water = new Water(geometry, {
    textureWidth: renderTargetSize,
    textureHeight: renderTargetSize,
    waterNormals,
    sunDirection: new THREE.Vector3(0.707, 0.5, 0.5).normalize(),
    sunColor: 0xf2f8ff,
    waterColor: _dayWaterColor.clone(),
    distortionScale: 3.2,
    fog: Boolean(scene.fog),
  });

  const cx = (west + east) * 0.5;
  const cz = (north + south) * 0.5;

  water.rotation.x = -Math.PI / 2;
  water.position.set(cx, resolvedSeaLevel, cz);

  const halfX = (east - west) * 0.5;
  const clipBounds = {
    west: cx - halfX,
    east: cx + halfX,
    north: clipZFront,
    south: clipZBack,
  };

  const planes = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), -clipBounds.west),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), clipBounds.east),
    new THREE.Plane(new THREE.Vector3(0, 0, -1), clipBounds.south),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), -clipBounds.north),
  ];

  water.renderOrder = 1;
  if (water.material) {
    water.material.clippingPlanes = planes;
    water.material.clipIntersection = true;
    // ensure water draws cleanly against shoreline.
    water.material.depthWrite = false;
    water.material.transparent = true;
    water.material.needsUpdate = true;
    if (water.material.uniforms) {
      // mild waves and readable highlights.
      const { distortionScale, size } = water.material.uniforms;
      if (distortionScale?.value !== undefined) {
        distortionScale.value = 3.5;
      }
      if (size?.value !== undefined) {
        size.value = 2.0;
      }
    }

    if (typeof window !== "undefined" && window.location?.search?.includes("waterdbg=1")) {
      const existing = scene.getObjectByName("WaterClipDebug");
      if (existing) {
        scene.remove(existing);
      }
      mountWaterClipDebug(
        scene,
        baseBounds,
        clipBounds,
        resolvedSeaLevel,
      );
    }
  }

  water.receiveShadow = true;
  water.name = "AegeanOcean";
  water.userData.noCollision = true;
  water.userData.isWater = true;

  // ensure water draws cleanly against shoreline.
  water.renderOrder = 1;

  scene.add(water);
  if (import.meta.env?.DEV) {
    console.log(
      `[ocean] y=${resolvedSeaLevel}, base=${JSON.stringify(baseBounds)}, clip=${JSON.stringify(clipBounds)}`,
    );
    const debugCenter = new THREE.Vector3(cx, resolvedSeaLevel, cz);
    const debugSize = new THREE.Vector2(width, depth);
    const existingBoundsHelper = scene.getObjectByName?.("WaterBoundsDebug");
    if (existingBoundsHelper) {
      scene.remove(existingBoundsHelper);
    }
    mountWaterBoundsDebug(scene, debugCenter, debugSize);
  }

  return {
    mesh: water,
    uniforms: water.material.uniforms,
  };
}

function createBoundsLoop(bounds, color, yOffset) {
  if (!bounds) return null;
  const { west, east, north, south } = bounds;
  if (
    !Number.isFinite(west) ||
    !Number.isFinite(east) ||
    !Number.isFinite(north) ||
    !Number.isFinite(south)
  ) {
    return null;
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
