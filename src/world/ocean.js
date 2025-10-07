import * as THREE from "three";
import { Water } from "three/addons/objects/Water.js";
import {
  HARBOR_SEA_LEVEL,
  HARBOR_WATER_CENTER,
  HARBOR_WATER_SIZE,
} from "./locations.js";

function generateNormalComponent(x, y, octave) {
  const frequency = Math.pow(2, octave);
  const angle = (x * frequency + y * frequency * 1.3) * 0.12;
  return Math.sin(angle * 1.7 + octave * 1.1) * 0.6;
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
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  // Maintain conservative anisotropy to avoid potential mobile performance regressions.
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

const _dayWaterColor = new THREE.Color(0x1a4e80);
const _nightWaterColor = new THREE.Color(0x091c2a);
const _moodWaterColor = new THREE.Color();

let cachedNormals = null;

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

function resolveVector3(option, fallback = new THREE.Vector3()) {
  if (option instanceof THREE.Vector3) {
    return option.clone();
  }
  if (option && typeof option === "object") {
    const { x, y, z } = option;
    return new THREE.Vector3(
      Number.isFinite(x) ? x : fallback.x,
      Number.isFinite(y) ? y : fallback.y,
      Number.isFinite(z) ? z : fallback.z
    );
  }
  return fallback.clone();
}

function resolveSize(option, fallback = 800) {
  if (typeof option === "number" && Number.isFinite(option) && option > 0) {
    return { width: option, depth: option };
  }
  if (Array.isArray(option) && option.length > 0) {
    const width = option[0];
    const depth = option.length > 1 ? option[1] : option[0];
    return {
      width: Number.isFinite(width) && width > 0 ? width : fallback,
      depth: Number.isFinite(depth) && depth > 0 ? depth : fallback,
    };
  }
  if (option && typeof option === "object") {
    const width = option.width ?? option.x ?? option.w;
    const depth = option.depth ?? option.height ?? option.z ?? option.y ?? option.h;
    return {
      width: Number.isFinite(width) && width > 0 ? width : fallback,
      depth: Number.isFinite(depth) && depth > 0 ? depth : fallback,
    };
  }
  return { width: fallback, depth: fallback };
}

function resolveBounds(bounds, defaults) {
  if (!bounds || typeof bounds !== "object") {
    return null;
  }

  const hasWest = Number.isFinite(bounds.west);
  const hasEast = Number.isFinite(bounds.east);
  const hasSouth = Number.isFinite(bounds.south);
  const hasNorth = Number.isFinite(bounds.north);

  if (!hasWest && !hasEast && !hasSouth && !hasNorth) {
    return null;
  }

  const resolved = {
    west: hasWest
      ? bounds.west
      : hasEast
      ? bounds.east - defaults.width
      : defaults.centerX - defaults.width * 0.5,
    east: 0,
    south: hasSouth
      ? bounds.south
      : hasNorth
      ? bounds.north - defaults.depth
      : defaults.centerZ - defaults.depth * 0.5,
    north: 0,
  };

  resolved.east = hasEast ? bounds.east : resolved.west + defaults.width;
  resolved.north = hasNorth ? bounds.north : resolved.south + defaults.depth;

  return resolved;
}

export async function createOcean(scene, options = {}) {
  const size = resolveSize(options.size, 800);
  const position = resolveVector3(options.position, new THREE.Vector3());
  const defaults = {
    width: size.width,
    depth: size.depth,
    centerX: position.x,
    centerZ: position.z,
  };
  const bounds = resolveBounds(options.bounds, defaults);
  const resolvedWidth = bounds
    ? Math.max(1, Math.abs(bounds.east - bounds.west))
    : size.width;
  const resolvedDepth = bounds
    ? Math.max(1, Math.abs(bounds.north - bounds.south))
    : size.depth;

  if (bounds) {
    position.x = (bounds.west + bounds.east) * 0.5;
    position.z = (bounds.south + bounds.north) * 0.5;
  }

  if (!cachedNormals) {
    cachedNormals = createProceduralWaterNormals();
  }

  const renderTargetSize = computeRenderTargetSize(options);

  let width = HARBOR_WATER_SIZE.x;
  let depth = HARBOR_WATER_SIZE.y;
  const terrainBounds = options?.terrain?.userData?.bounds;
  if (terrainBounds) {
    const minX = terrainBounds.minX;
    const maxX = terrainBounds.maxX;
    const minZ = terrainBounds.minZ;
    const maxZ = terrainBounds.maxZ;

    const halfWidth = width * 0.5;
    let maxHalfWidth = halfWidth;
    if (Number.isFinite(maxX)) {
      maxHalfWidth = Math.min(maxHalfWidth, Math.max(0, maxX - HARBOR_WATER_CENTER.x));
    }
    if (Number.isFinite(minX)) {
      maxHalfWidth = Math.min(maxHalfWidth, Math.max(0, HARBOR_WATER_CENTER.x - minX));
    }
    width = Math.max(1, maxHalfWidth * 2);

    const halfDepth = depth * 0.5;
    let maxHalfDepth = halfDepth;
    if (Number.isFinite(maxZ)) {
      maxHalfDepth = Math.min(maxHalfDepth, Math.max(0, maxZ - HARBOR_WATER_CENTER.z));
    }
    if (Number.isFinite(minZ)) {
      maxHalfDepth = Math.min(maxHalfDepth, Math.max(0, HARBOR_WATER_CENTER.z - minZ));
    }
    depth = Math.max(1, maxHalfDepth * 2);
  }

  const geometry = new THREE.PlaneGeometry(
    width,
    depth,
    1,
    1
  );
  const water = new Water(geometry, {
    textureWidth: renderTargetSize,
    textureHeight: renderTargetSize,
    waterNormals: cachedNormals,
    sunDirection: new THREE.Vector3(0.707, 0.5, 0.5).normalize(),
    sunColor: 0xf2f8ff,
    waterColor: _dayWaterColor.clone(),
    distortionScale: 3.2,
    fog: Boolean(scene.fog),
  });

  water.rotation.x = -Math.PI / 2;
  water.position.set(
    HARBOR_WATER_CENTER.x,
    HARBOR_SEA_LEVEL,
    HARBOR_WATER_CENTER.z
  );

  water.receiveShadow = true;
  water.renderOrder = -1;
  if (water.material) water.material.depthWrite = true;
  water.name = "AegeanOcean";
  water.userData.noCollision = true;

  scene.add(water);

  return {
    mesh: water,
    uniforms: water.material.uniforms,
  };
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
