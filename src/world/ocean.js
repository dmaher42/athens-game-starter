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
  AGORA_CENTER_3D,
  HARBOR_CENTER,
  HARBOR_WATER_RADIUS,
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

const _dayWaterColor = new THREE.Color(0x006b7c);
const _nightWaterColor = new THREE.Color(0x001a21);
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
const DEFAULT_OCEAN_RADIUS = 1800;
const OCEAN_SEGMENTS = 96;

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

  // 2. CREATE CIRCULAR GEOMETRY ANCHORED TO THE SKYBOX HORIZON
  const radius = Math.max(options.radius ?? DEFAULT_OCEAN_RADIUS, 400);
  const geometry = new THREE.CircleGeometry(radius, OCEAN_SEGMENTS);

  // 3. CONFIGURE WATER SHADER
  const water = new Water(geometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: waterNormals,
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: options.waterColor ?? 0x006b7c,
    distortionScale: 1.5,
    fog: scene.fog !== undefined,
  });

  // Shader injection for shoreline interaction and distance fade
  water.material.onBeforeCompile = (shader) => {
    // Shoreline Constants (matching terrain.js/locations.js)
    shader.uniforms.uIslandCenter = {
      value: new THREE.Vector2(AGORA_CENTER_3D.x, AGORA_CENTER_3D.z),
    };
    shader.uniforms.uIslandRadius = { value: 220.0 };
    shader.uniforms.uHarborCenter = { value: HARBOR_CENTER };
    shader.uniforms.uHarborRadius = { value: HARBOR_WATER_RADIUS };

    // Fade Constants
    shader.uniforms.uFadeStart = { value: 300.0 };
    shader.uniforms.uFadeEnd = { value: 1800.0 };

    shader.vertexShader = shader.vertexShader.replace(
      "void main() {",
      /* glsl */ `
      varying vec3 vWorldPosition;
      void main() {
        vWorldPosition = (modelMatrix * vec4( position, 1.0 )).xyz;
      `
    );

    shader.fragmentShader =
      /* glsl */ `
      uniform vec2 uIslandCenter;
      uniform float uIslandRadius;
      uniform vec2 uHarborCenter;
      uniform float uHarborRadius;
      uniform float uFadeStart;
      uniform float uFadeEnd;
      varying vec3 vWorldPosition;
    ` + shader.fragmentShader;

    // Apply Shoreline Logic
    shader.fragmentShader = shader.fragmentShader.replace(
      "gl_FragColor = vec4( color, 1.0 );",
      /* glsl */ `
      // Shoreline Interaction Logic
      float distToIsland = length(vWorldPosition.xz - uIslandCenter);
      float distToHarbor = length(vWorldPosition.xz - uHarborCenter);

      // Determine proximity to shore
      // Outer Coast: distance from Island Center > Island Radius
      float distFromOuterCoast = max(0.0, distToIsland - uIslandRadius);

      // Harbor Coast: distance from Harbor Center < Harbor Radius (inside the cutout)
      // Note: Harbor water is *inside* the island radius, so we prioritize harbor check if inside.
      float shoreDist = distFromOuterCoast;

      if (distToIsland < uIslandRadius) {
        // Inside island bounds
        if (distToHarbor < uHarborRadius) {
           // Inside Harbor basin
           // Distance to harbor wall (shore) is radius - distance
           shoreDist = uHarborRadius - distToHarbor;
        } else {
           // Under terrain or near edge
           shoreDist = 0.0;
        }
      }

      // Visual Effects
      float effectZone = 25.0; // Extend 25m from shore
      float shoreFactor = 1.0 - smoothstep(0.0, effectZone, shoreDist);

      // 1. Darken water / Reduce reflection
      // Mix with a dark, earthy tone to ground it
      vec3 shoreColor = vec3(0.02, 0.05, 0.08); // Deep dark teal/black
      vec3 mudTint = vec3(0.15, 0.12, 0.10); // Slight muddy variation

      // Varies along shore for organic feel (using world pos)
      float variation = sin(vWorldPosition.x * 0.1) * sin(vWorldPosition.z * 0.1) * 0.5 + 0.5;
      vec3 targetShoreColor = mix(shoreColor, mudTint, variation * 0.4);

      // Apply mix: Stronger near shore
      // Reduces reflection because we are mixing on top of the 'color' which contains reflection
      vec3 finalColor = mix(color, targetShoreColor, shoreFactor * 0.75);

      gl_FragColor = vec4( finalColor, 1.0 );
      `
    );

    // Apply Fade Logic
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <fog_fragment>",
      /* glsl */ `
      float dist = length(vWorldPosition - cameraPosition);
      float fadeFactor = smoothstep(uFadeStart, uFadeEnd, dist);

      vec3 targetColor = waterColor;
      #ifdef USE_FOG
         targetColor = fogColor;
      #endif

      // Mix existing color (reflection/refraction) with target color to reduce contrast and detail
      gl_FragColor.rgb = mix(gl_FragColor.rgb, targetColor, fadeFactor * 0.9);

      #include <fog_fragment>
      `
    );
  };

  // 4. POSITIONING
  water.rotation.x = -Math.PI / 2;
  const horizonOffset = Number.isFinite(options.horizonOffset)
    ? options.horizonOffset
    : 0;
  const horizonY = seaLevel + horizonOffset;
  water.position.set(0, horizonY, 0);

  water.name = "AegeanOcean";
  water.userData.isWater = true;
  water.userData.seaLevel = seaLevel;
  water.userData.oceanRadius = radius;
  water.userData.horizonY = horizonY;

  // Custom wave scaling keeps detail even on the circular expanse
  if (waterNormals) {
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
    const repeat = Math.max(radius / 90, 8);
    waterNormals.repeat.set(repeat, repeat);
  }

  scene.add(water);

  // Debug info
  if (import.meta.env?.DEV) {
    console.info(`[ocean] Created Global Ocean at Y=${seaLevel} with radius ${radius}`);
  }

  return water;
}

function createBoundsLoop(bounds, color = 0xffffff, yOffset = 0) {
  if (!bounds) return null;
  const { west, east, north, south } = bounds;
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

export function updateOcean(ocean, deltaSeconds = 0, sunDir, mood = 0, sunColor) {
  if (!ocean) return;
  const uniforms = ocean.uniforms ?? ocean.mesh?.material?.uniforms;
  if (!uniforms) return;

  if (Number.isFinite(deltaSeconds)) {
    uniforms.time.value += deltaSeconds;
  }
  if (sunDir && uniforms.sunDirection) {
    uniforms.sunDirection.value.copy(sunDir);
  }

  if (sunColor && uniforms.sunColor) {
    uniforms.sunColor.value.copy(sunColor);
    // Safety clamp to realistic range
    uniforms.sunColor.value.r = Math.min(Math.max(uniforms.sunColor.value.r, 0), 1);
    uniforms.sunColor.value.g = Math.min(Math.max(uniforms.sunColor.value.g, 0), 1);
    uniforms.sunColor.value.b = Math.min(Math.max(uniforms.sunColor.value.b, 0), 1);
  }

  // Safety clamps for optional standard material properties
  if (uniforms.roughness) {
    uniforms.roughness.value = THREE.MathUtils.clamp(uniforms.roughness.value, 0, 1);
  }
  if (uniforms.metalness) {
    uniforms.metalness.value = THREE.MathUtils.clamp(uniforms.metalness.value, 0, 1);
  }
  if (uniforms.reflectivity) {
    uniforms.reflectivity.value = THREE.MathUtils.clamp(uniforms.reflectivity.value, 0, 1);
  }

  const calmFactor = THREE.MathUtils.clamp(typeof mood === "number" ? mood : 0, 0, 1);
  if (uniforms.distortionScale) {
    // Ensure water does not become too flat (1.1 min) even in calm/night conditions
    const scale = THREE.MathUtils.lerp(2.0, 1.1, calmFactor);
    uniforms.distortionScale.value = THREE.MathUtils.clamp(scale, 0.1, 10.0);
  }
  if (uniforms.waterColor) {
    uniforms.waterColor.value.copy(
      _moodWaterColor.copy(_dayWaterColor).lerp(_nightWaterColor, calmFactor)
    );
    // Clamp water color components
    uniforms.waterColor.value.r = Math.min(Math.max(uniforms.waterColor.value.r, 0), 1);
    uniforms.waterColor.value.g = Math.min(Math.max(uniforms.waterColor.value.g, 0), 1);
    uniforms.waterColor.value.b = Math.min(Math.max(uniforms.waterColor.value.b, 0), 1);
  }
}
