import { configureShipWaterExclusions } from './shipWaterExclusion.js';
import * as THREE from "three";
import { resolveBaseUrl, joinPath } from "../utils/baseUrl.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import {
  HARBOR_WATER_BOUNDS,
  HARBOR_WATER_NORMAL_CANDIDATES,
  getSeaLevelY,
  SEA_LEVEL_Y,
  AGORA_CENTER_3D,
} from "./locations.js";
import { RENDER_LAYERS } from "./renderLayers.js";

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
    .replace(/^athens-game-starter\//i, "")
    .replace(/^\.\//,"")
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
  const hasPixelData = Boolean(
    texture.isDataTexture ||
      texture.isCanvasTexture ||
      texture.isCompressedTexture ||
      texture.image,
  );
  if (hasPixelData) {
    texture.needsUpdate = true;
  }
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

const _dayWaterColor = new THREE.Color(0x2f8cc8);
const _nightWaterColor = new THREE.Color(0x00131b);
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
const SHORELINE_CLEARANCE = 0.05;
const SHORE_PROBE_X_FRACTIONS = [0.2, 0.5, 0.8];
const SHORE_PROBE_Z_FRACTIONS = [0.0, 0.5, 0.9];
const DEFAULT_OCEAN_RADIUS = 4000;
const OCEAN_SEGMENTS = 64;

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

export async function createOcean(scene, terrain, options = {}) {
  // Water is statically imported at module top to avoid dynamic chunking
  
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

  // 2. CREATE GEOMETRY
  // Position water at harbor bounds if provided, otherwise create distant ocean
  const bounds = options.bounds || {};
  const hasHarborBounds = bounds.west != null && bounds.east != null && bounds.north != null && bounds.south != null;
  
  let oceanWidth, oceanDepth, oceanCenterX, oceanCenterZ;
  
  if (hasHarborBounds) {
    // Harbor water - use provided bounds
    oceanWidth = Math.abs(bounds.east - bounds.west);
    oceanDepth = Math.abs(bounds.north - bounds.south);
    oceanCenterX = (bounds.east + bounds.west) / 2;
    oceanCenterZ = (bounds.north + bounds.south) / 2;
  } else {
    // Distant ocean - far to the east
    oceanWidth = 1000;
    oceanDepth = 1000;
    oceanCenterX = 2500;
    oceanCenterZ = 0;
  }
  
  const geometry = new THREE.PlaneGeometry(oceanWidth, oceanDepth, OCEAN_SEGMENTS, OCEAN_SEGMENTS);
  const waterRenderTargetSize = computeRenderTargetSize({
    ...options,
    baseTextureSize: options.baseTextureSize ?? 128,
  });

  // 3. CONFIGURE WATER SHADER
  // Use the same reflective, terrain-clipped water in previews and gameplay.
  const water = new Water(geometry, {
        textureWidth: waterRenderTargetSize,
        textureHeight: waterRenderTargetSize,
        waterNormals: waterNormals,
        // Water normalizes the reflected sun vector; a zero vector produces
        // undefined lighting before the first lighting-system update.
        sunDirection: new THREE.Vector3(0.707, 0.707, 0).normalize(),
        sunColor: 0xffffff,
        waterColor: options.waterColor ?? 0x2b86b8,
        distortionScale: 3.2, // More dynamic waves
        fog: !!scene.fog,
      });

  // SSAO renders this mesh again with an override normal material. Its normal
  // pass cannot use the reflection texture, so avoid rendering the mirrored
  // city a second time. The visible water pass keeps its normal reflection.
  const renderOceanReflection = water.onBeforeRender;
  water.onBeforeRender = function (renderer, renderScene) {
    if (renderScene.overrideMaterial) return;
    return renderOceanReflection.apply(this, arguments);
  };

  // Shader injection for shoreline interaction and distance fade
  {
    terrain.updateWorldMatrix(true, false);
    const positionAttribute = terrain.geometry.attributes.position;
    const heightData = new Float32Array(positionAttribute.count);
    const vertex = new THREE.Vector3();
    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i).applyMatrix4(terrain.matrixWorld);
      heightData[i] = vertex.y;
    }
    const columns = terrain.geometry.parameters.widthSegments + 1;
    const rows = terrain.geometry.parameters.heightSegments + 1;
    const heightMap = new THREE.DataTexture(heightData, columns, rows, THREE.RedFormat, THREE.FloatType);
    heightMap.minFilter = heightMap.magFilter = THREE.NearestFilter;
    heightMap.needsUpdate = true;
    water.material.addEventListener("dispose", () => heightMap.dispose());
    Object.assign(water.material.uniforms, {
      uSeaLevel: { value: seaLevel },
      uTerrainSize: { value: new THREE.Vector2(terrain.geometry.parameters.width, terrain.geometry.parameters.height) },
      uTerrainGrid: { value: new THREE.Vector2(columns - 1, rows - 1) },
      uTerrainInverse: { value: terrain.matrixWorld.clone().invert() },
      uHeightMap: { value: heightMap },
      uFadeStart: { value: 900.0 },
      uFadeEnd: { value: 5200.0 },
    });
    water.material.onBeforeCompile = (shader) => {
      // FRAGMENT SHADER INJECTION
      const fragmentHeader = /* glsl */ `
        uniform sampler2D uHeightMap;
        uniform float uSeaLevel;
        uniform vec2 uTerrainSize;
        uniform vec2 uTerrainGrid;
        uniform mat4 uTerrainInverse;
        uniform float uFadeStart;
        uniform float uFadeEnd;

        float terrainVertexHeight(vec2 cell) {
          return texture2D(uHeightMap, (cell + 0.5) / (uTerrainGrid + 1.0)).r;
        }

        // Renamed to avoid collisions
        float oceanHash(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        float oceanNoise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(oceanHash(i + vec2(0.0, 0.0)), oceanHash(i + vec2(1.0, 0.0)), f.x),
                       mix(oceanHash(i + vec2(0.0, 1.0)), oceanHash(i + vec2(1.0, 1.0)), f.x), f.y);
        }
      `;

      // Inject header at top (works because Three.js prepends defines/version)
      shader.fragmentShader = fragmentHeader + "\n" + shader.fragmentShader;

      // Patch the actual Three.js Water output, and fail visibly if an upgrade
      // changes it instead of silently losing the shoreline mask again.
      const waterOutput = "gl_FragColor = vec4( outgoingLight, alpha );";
      if (!shader.fragmentShader.includes(waterOutput)) {
        throw new Error("Water shader output changed; shoreline clipping could not be applied.");
      }
      shader.fragmentShader = shader.fragmentShader.replace(
        waterOutput,
        /* glsl */ `
        vec3 vWorldPosition = worldPosition.xyz;
        vec3 terrainLocal = (uTerrainInverse * vec4(vWorldPosition, 1.0)).xyz;
        // DataTexture row zero is PlaneGeometry's positive local-Y edge.
        // Transform back to local space rather than mirroring the world Z axis.
        vec2 terrainUV = vec2(
          terrainLocal.x / uTerrainSize.x + 0.5,
          0.5 - terrainLocal.y / uTerrainSize.y
        );
        vec2 grid = clamp(terrainUV, vec2(0.0), vec2(1.0)) * uTerrainGrid;
        vec2 cell = min(floor(grid), uTerrainGrid - 1.0);
        vec2 f = grid - cell;
        float h00 = terrainVertexHeight(cell);
        float h10 = terrainVertexHeight(cell + vec2(1.0, 0.0));
        float h01 = terrainVertexHeight(cell + vec2(0.0, 1.0));
        float h11 = terrainVertexHeight(cell + vec2(1.0, 1.0));
        // Match the two rendered terrain triangles, not a smoothed height field
        // that can put water on the wrong side of a steep shoreline face.
        float terrainHeight = f.x + f.y <= 1.0
          ? h00 + (h10 - h00) * f.x + (h01 - h00) * f.y
          : h11 + (h01 - h11) * (1.0 - f.x) + (h10 - h11) * (1.0 - f.y);
        float waterDepth = vWorldPosition.y - terrainHeight;
        if (waterDepth <= ${SHORELINE_CLEARANCE.toFixed(2)}) {
          discard;
        }

        vec3 finalColor = outgoingLight;

        // Shoreline foam
        float foamFactor = smoothstep(0.0, 3.0, waterDepth) - smoothstep(3.0, 6.0, waterDepth);
        foamFactor = clamp(foamFactor, 0.0, 1.0);

        // Shallow water color
        float shallowFactor = smoothstep(0.0, 18.0, waterDepth);
        finalColor = mix(vec3(0.58, 0.84, 0.92), finalColor, shallowFactor);

        // Add a deeper offshore tint so the far sea reads more open and less like
        // a uniformly lit inland lake.
        float offshore = smoothstep(180.0, 760.0, vWorldPosition.x);
        finalColor = mix(finalColor, vec3(0.08, 0.28, 0.44), offshore * 0.38);


        float n = oceanNoise(vWorldPosition.xz * 0.5);
        if (foamFactor > 0.0 && n > 0.7) {
          finalColor = mix(finalColor, vec3(1.0), foamFactor * 0.6);
        }


        gl_FragColor = vec4( finalColor, 1.0 );
        `
      );

      // Apply Fade Logic
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <fog_fragment>",
        /* glsl */ `
        float dist = length(worldPosition.xyz - cameraPosition);
        float fadeFactor = smoothstep(uFadeStart, uFadeEnd, dist);

        #ifdef USE_FOG
          vec3 targetColor = fogColor;
          // Mix existing color (reflection/refraction) with target color to reduce contrast and detail
          gl_FragColor.rgb = mix(gl_FragColor.rgb, targetColor, fadeFactor * 0.9);
        #endif

        #include <fog_fragment>
        `
      );
    };
  }

  // 4. POSITIONING
  water.rotation.x = -Math.PI / 2;
  const horizonOffset = Number.isFinite(options.horizonOffset) ? options.horizonOffset : 0;
  const horizonY = seaLevel + horizonOffset;
  
  water.position.set(oceanCenterX, horizonY, oceanCenterZ);

  water.name = "AegeanOcean";
  water.userData.isWater = true;
  water.userData.isAutomationFallback = false;
  water.userData.seaLevel = seaLevel;
  water.userData.oceanSize = { width: oceanWidth, depth: oceanDepth };
  water.userData.horizonY = horizonY;
  // Water should render after the terrain so the ocean surface covers the
  // seabed instead of letting ground textures punch through it.
  water.renderOrder = RENDER_LAYERS.DETAIL;
  if (water.material) {
    water.material.depthWrite = true;
    water.material.depthTest = true;
  }

  // Custom wave scaling keeps detail even on the rectangular expanse
  if (waterNormals) {
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;
    const repeatX = Math.max(oceanWidth / 220, 10);
    const repeatZ = Math.max(oceanDepth / 220, 10);
    waterNormals.repeat.set(repeatX, repeatZ);
  }

  scene.add(water);
  // createOcean awaits normals; the existing harbour is placed synchronously
  // before this continuation. Read its actual static hull geometry, not a map copy.
  const boardableShips = [];
  scene.traverse(object => { if (['merchant','trireme'].includes(object.userData?.shipType)) boardableShips.push(object); });
  configureShipWaterExclusions(water, boardableShips);

  // Debug info
  if (import.meta.env?.DEV) {
    console.info(`[ocean] Created water at Y=${seaLevel}, centered at (${oceanCenterX}, ${oceanCenterZ}), size ${oceanWidth}x${oceanDepth}`);
  }

  return water;
}

export function updateOcean(ocean, deltaSeconds = 0, sunDir, mood = 0, sunColor, haze = {}) {
  if (!ocean) return;
  const uniforms = ocean.uniforms ?? ocean.material?.uniforms ?? ocean.mesh?.material?.uniforms;
  if (!uniforms) return;

  if (haze) {
    if (Number.isFinite(haze.start) && uniforms.uFadeStart) {
      uniforms.uFadeStart.value = haze.start;
    }
    if (Number.isFinite(haze.end) && uniforms.uFadeEnd) {
      uniforms.uFadeEnd.value = haze.end;
    }
  }

  if (Number.isFinite(deltaSeconds)) {
    uniforms.time.value += deltaSeconds;
  }
  const sunLengthSq = sunDir?.lengthSq?.();
  if (uniforms.sunDirection && Number.isFinite(sunLengthSq) && sunLengthSq > 1e-8) {
    uniforms.sunDirection.value.copy(sunDir).normalize();
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
    const scale = THREE.MathUtils.lerp(3.2, 1.6, calmFactor);
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

