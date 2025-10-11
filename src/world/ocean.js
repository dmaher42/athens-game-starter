import * as THREE from "three";
import { Water } from "three/addons/objects/Water.js";
import {
  HARBOR_WATER_CENTER,
  HARBOR_WATER_SIZE,
  HARBOR_WATER_EAST_LIMIT,
  SEA_LEVEL_Y,
} from "./locations.js";
import { mountWaterBoundsDebug } from "./debug_waterBounds.js";

function generateNormalComponent(x, y, octave) {
  const frequency = Math.pow(2, octave);
  const angle = (x * frequency + y * frequency * 1.3) * 0.12;
  return Math.sin(angle * 1.7 + octave * 1.1) * 0.6;
}

const textureLoader = new THREE.TextureLoader();

export const DEFAULT_WATER_NORMAL_CANDIDATES = [
  "/assets/ground/water_normals.png",
  "/assets/ground/waternormals.jpg",
  "/assets/ground/shader.png",
  "/assets/ground/step_sea.gif",
];

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

const FRONT_Z_HARD = -117;

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

  candidates.push(...DEFAULT_WATER_NORMAL_CANDIDATES);

  const tried = new Set();
  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const normalized = candidate.trim();
    if (!normalized || tried.has(normalized)) continue;
    tried.add(normalized);

    if (cachedWaterNormalsTexture && cachedWaterNormalsKey === normalized) {
      return cachedWaterNormalsTexture;
    }

    try {
      const texture = await loadWaterNormalsTexture(normalized);
      cachedWaterNormalsTexture = texture;
      cachedWaterNormalsKey = normalized;
      return texture;
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.info("[water] Failed to load normal map candidate", normalized, error);
      }
    }
  }

  if (!cachedWaterNormalsTexture || cachedWaterNormalsKey !== "procedural") {
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

    // Hard seaward cut: never render water with z < -117
    const zFrontDesired = cz - halfZFront;
    const zFront = Math.max(zFrontDesired, FRONT_Z_HARD);
    // For clarity, also keep the inland boundary as-is:
    const zBack = cz + halfZBack;

    west = cx - halfX;
    east = Math.min(cx + halfX, HARBOR_WATER_EAST_LIMIT);
    north = zFront;
    south = Math.max(zBack, north);

    if (import.meta.env?.DEV) {
      console.log("[water clip]", { cx, cz, zFront, zBack, FRONT_Z_HARD });
    }
  }

  if (west > east) {
    [west, east] = [east, west];
  }
  if (north > south) {
    [north, south] = [south, north];
  }

  const width = Math.max(0.1, east - west);
  const depth = Math.max(0.1, south - north);

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
  water.position.set(cx, HARBOR_WATER_CENTER.y, cz);

  const halfX = (east - west) * 0.5;
  const clipZFront = Math.max(north, FRONT_Z_HARD);
  const clipZBack = Math.max(south, clipZFront);

  const planes = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), -(cx - halfX)),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), cx + halfX),
    new THREE.Plane(new THREE.Vector3(0, 0, -1), clipZBack),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), -clipZFront),
  ];

  if (water.material) {
    water.material.clippingPlanes = planes;
    water.material.clipIntersection = true;
    water.material.depthWrite = true;
    water.material.transparent = true;
    water.material.needsUpdate = true;

    if (typeof window !== "undefined" && window.location?.search?.includes("waterdbg=1")) {
      const existing = scene.getObjectByName("WaterClipDebug");
      if (existing) {
        scene.remove(existing);
      }
      mountWaterClipDebug(scene, west, east, clipZFront, clipZBack);
    }
  }

  water.receiveShadow = true;
  water.name = "AegeanOcean";
  water.userData.noCollision = true;
  water.userData.isWater = true;

  // Draw behind world but still write depth
  water.renderOrder = -1;

  scene.add(water);
  if (import.meta.env?.DEV) {
    console.log("[ocean bounds]", {
      west,
      east,
      north: clipZFront,
      south: clipZBack,
    });
    const debugCenter = new THREE.Vector3(cx, HARBOR_WATER_CENTER.y, cz);
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

export function mountWaterClipDebug(scene, west, east, north, south) {
  const g = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(west, 0, north),
    new THREE.Vector3(east, 0, north),
    new THREE.Vector3(east, 0, south),
    new THREE.Vector3(west, 0, south),
    new THREE.Vector3(west, 0, north),
  ]);
  const line = new THREE.Line(g, new THREE.LineBasicMaterial({ transparent: true, opacity: 0.8 }));
  line.position.y = SEA_LEVEL_Y + 0.02;
  line.name = "WaterClipDebug";
  scene.add(line);
  return line;
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
