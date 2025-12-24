import * as THREE from "three";
import {
  getSeaLevelY,
  AGORA_CENTER_3D,
  HARBOR_CENTER_3D,
} from "./locations.js";
import {
  createGroundTextureState,
  injectGroundTextureShader,
} from "./groundTextures.js";
import { GROUND_TEXTURE_CONFIG } from "./groundTextureConfig.js";
import { applyTextureBudgetToMaterial } from "../utils/textureBudget.js";

const textureLoader = new THREE.TextureLoader();

// Lightweight gradient noise to break up perfectly flat surfaces.
function gradientNoise(x, z) {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const xf = x - x0;
  const zf = z - z0;

  const gradients = new Array(4);
  for (let i = 0; i < 4; i++) {
    const ix = x0 + (i & 1);
    const iz = z0 + (i >> 1);
    const seed = Math.sin(ix * 374761393 + iz * 668265263) * 43758.5453;
    const angle = seed - Math.floor(seed);
    gradients[i] = {
      x: Math.cos(angle * Math.PI * 2),
      z: Math.sin(angle * Math.PI * 2),
    };
  }

  const dot00 = gradients[0].x * xf + gradients[0].z * zf;
  const dot10 = gradients[1].x * (xf - 1) + gradients[1].z * zf;
  const dot01 = gradients[2].x * xf + gradients[2].z * (zf - 1);
  const dot11 = gradients[3].x * (xf - 1) + gradients[3].z * (zf - 1);

  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const u = fade(xf);
  const v = fade(zf);
  const lerp = (a, b, t) => a + (b - a) * t;

  const nx0 = lerp(dot00, dot10, u);
  const nx1 = lerp(dot01, dot11, u);
  return lerp(nx0, nx1, v);
}

const NOISE_SCALE = 0.05;
const NOISE_AMPLITUDE = 0.45;
const OCEAN_DEPTH = -12.0;
const CITY_HEIGHT = 2.5; // Base city height (above sea level)
const SAND_COLOR = new THREE.Color(0.68, 0.64, 0.55);
const GRASS_COLOR = new THREE.Color(0.34, 0.46, 0.32);
const SHALLOW_WATER_COLOR = new THREE.Color(0x1f4f59);

// Harbor configuration (East Facing)
// Match harbor.js constant for consistent ground height
const HARBOR_GROUND_HEIGHT = 2.0;
const HARBOUR_RADIUS = 70;
const HARBOUR_TARGET_DEPTH = 2;
// Use RELOCATED harbor position (-50, -100) instead of original HARBOR_CENTER_3D (120, 80)
// This matches the harbor.position.set(-50, harborGroundY, -100) in harbor.js
const EAST_HARBOR_CENTER = new THREE.Vector2(-50, -100);

// New Mainland/Coastal Constants
const INLAND_ELEVATION_SCALE = 220.0; // West rise dominates over noise
const TERRAIN_SIZE = 2400; // Large terrain for mainland
const HALF_TERRAIN_SIZE = TERRAIN_SIZE * 0.5;
const COAST_X_START = 80; // Fade to ocean starts here (East)
const INLAND_X_START = -50; // Rise to hills starts here (West)

function computeCoastData(x, z) {
  // Mainland Logic:
  // East (+X) -> Sea
  // West (-X) -> Inland (Land)
  // No North/South fade (Mainland extends indefinitely N/S visually, or covered by horizon)

  // 1. East Fade
  let coastFactor = 0.0;

  if (x > COAST_X_START) {
    const dist = x - COAST_X_START;
    const fade = dist / 120.0; // Gentle slope to sea
    coastFactor = Math.max(coastFactor, fade);
  }

  // Clamp
  const t = THREE.MathUtils.clamp(coastFactor, 0, 1);
  const fade = THREE.MathUtils.smoothstep(0, 1, t);

  return { t, fade };
}

function computeWestBias(x) {
  // Normalized X in [-1, 1]; east is +1, west is -1
  const normalizedX = THREE.MathUtils.clamp(x / HALF_TERRAIN_SIZE, -1, 1);
  const westBias = THREE.MathUtils.clamp(-normalizedX, 0, 1);
  // Ease-in curve so the inland rise feels gradual near the city and stronger far west
  return Math.pow(westBias, 1.55);
}

function applyHarbourCarve(x, z, seaLevel, height) {
  // Carve around the East Harbor
  const dx = x - EAST_HARBOR_CENTER.x;
  const dz = z - EAST_HARBOR_CENTER.y; // Vector2 y is z world
  const distance = Math.hypot(dx, dz);

  if (distance >= HARBOUR_RADIUS) return height;

  const t = THREE.MathUtils.clamp(1 - distance / HARBOUR_RADIUS, 0, 1);
  const blend = t * t;
  const targetHeight = seaLevel - HARBOUR_TARGET_DEPTH;

  return THREE.MathUtils.lerp(height, targetHeight, blend);
}

function clampHarborBandHeight(x, z, seaLevel, baseHeight) {
  // Define a bounding box for the East Harbor water area
  // Extend massively eastward to cover everything forward
  const halfWidth = 400;
  // Extended north-south depth to match water plane (200 half-depth = 400 total)
  const halfDepth = 200;

  const west = EAST_HARBOR_CENTER.x - halfWidth;
  const east = EAST_HARBOR_CENTER.x + halfWidth + 600; // Massive eastward extension
  const north = EAST_HARBOR_CENTER.y - halfDepth;
  const south = EAST_HARBOR_CENTER.y + halfDepth;

  const harborGroundY = seaLevel + HARBOR_GROUND_HEIGHT;

  const withinWater = x >= west && x <= east && z >= north && z <= south;
  if (withinWater) {
    // Ensure terrain sits BELOW the water plane inside the harbor water bounds
    // Water plane is at seaLevel (0). Drop terrain to avoid occlusion.
    return seaLevel - 1.4;
  }

  // Slope up to land on the West side of the harbor
  const slopeWidth = 25; // Longer than original 20 to reduce cliffs without overextending
  const landStart = west - slopeWidth;

  if (x >= landStart && x < west && z >= north - 10 && z <= south + 10) {
      const t = (x - landStart) / slopeWidth;
      return THREE.MathUtils.lerp(harborGroundY, seaLevel, t);
  }

  return baseHeight;
}

function getElevation(x, z, seaLevel, coastData = null) {
  // Base Height calculation
  let h = seaLevel + CITY_HEIGHT;

  // Directional inland elevation that gently increases toward the west (-X)
  const westBias = computeWestBias(x);
  h += westBias * INLAND_ELEVATION_SCALE;

  // Apply Noise
  const rawNoise = gradientNoise(x * NOISE_SCALE, z * NOISE_SCALE);
  // Keep noise below the inland bias so geography reads clearly and stay calmer to the east
  const noise = rawNoise * NOISE_AMPLITUDE * (0.35 + westBias * 0.65);

  // Attenuate noise near coast (East)
  const coast = coastData ?? computeCoastData(x, z);
  const coastalNoiseAttenuation = 1 - THREE.MathUtils.smoothstep(0.2, 0.8, coast.t);
  const shapedNoise = noise * (0.4 + coastalNoiseAttenuation * 0.6);

  h += shapedNoise;

  // Carves
  h = applyHarbourCarve(x, z, seaLevel, h);
  h = clampHarborBandHeight(x, z, seaLevel, h);

  // Agora Flattening
  const agoraDist = Math.hypot(x - AGORA_CENTER_3D.x, z - AGORA_CENTER_3D.z);
  if (agoraDist < 60) {
      // Gentle flattening
      h = h * 0.7 + (seaLevel + CITY_HEIGHT) * 0.3;
  }

  // Coast Fade (East only)
  if (coast.t > 0) {
      const deepOcean = seaLevel + OCEAN_DEPTH;
      h = THREE.MathUtils.lerp(h, deepOcean, coast.fade);
  }

  return h;
}

function createSkirtGeometry(sourceGeometry, seaLevel) {
  const posAttr = sourceGeometry.attributes.position;
  const widthSegments = sourceGeometry.parameters.widthSegments;
  const heightSegments = sourceGeometry.parameters.heightSegments;

  const w = widthSegments;
  const h = heightSegments;
  const stride = w + 1;

  const boundaryIndices = [];
  for (let x = 0; x < w; x++) boundaryIndices.push(0 * stride + x);
  for (let y = 0; y < h; y++) boundaryIndices.push(y * stride + w);
  for (let x = w; x > 0; x--) boundaryIndices.push(h * stride + x);
  for (let y = h; y > 0; y--) boundaryIndices.push(y * stride + 0);

  const vertices = [];
  const colors = [];

  const skirtDepth = -150.0;
  const bottomZ = seaLevel + skirtDepth;

  const topColor = SAND_COLOR;
  const bottomColor = new THREE.Color().copy(SAND_COLOR).multiplyScalar(0.4);

  for (let i = 0; i < boundaryIndices.length; i++) {
    const idx = boundaryIndices[i];
    const nextIdx = boundaryIndices[(i + 1) % boundaryIndices.length];

    const x1 = posAttr.getX(idx);
    const y1 = posAttr.getY(idx);
    const z1 = posAttr.getZ(idx);

    const x2 = posAttr.getX(nextIdx);
    const y2 = posAttr.getY(nextIdx);
    const z2 = posAttr.getZ(nextIdx);

    vertices.push(x1, y1, z1);
    vertices.push(x1, y1, bottomZ);
    vertices.push(x2, y2, z2);

    colors.push(topColor.r, topColor.g, topColor.b);
    colors.push(bottomColor.r, bottomColor.g, bottomColor.b);
    colors.push(topColor.r, topColor.g, topColor.b);

    vertices.push(x2, y2, z2);
    vertices.push(x1, y1, bottomZ);
    vertices.push(x2, y2, bottomZ);

    colors.push(topColor.r, topColor.g, topColor.b);
    colors.push(bottomColor.r, bottomColor.g, bottomColor.b);
    colors.push(bottomColor.r, bottomColor.g, bottomColor.b);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

export function createTerrain(scene) {
  const size = TERRAIN_SIZE;
  // Reduced segments to optimize performance (260k verts instead of 1M)
  // 2400 / 512 ~= 4.7 meters per vertex, reasonable resolution.
  const segments = 512;
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);

  if (geometry.attributes.uv && !geometry.attributes.uv2) {
    geometry.setAttribute(
      "uv2",
      new THREE.BufferAttribute(
        new Float32Array(geometry.attributes.uv.array),
        2,
      ),
    );
  }

  const positionAttribute = geometry.attributes.position;
  const vertexCount = positionAttribute.count;
  const baseHeights = new Float32Array(vertexCount);

  const colors = new Float32Array(vertexCount * 3);
  const colorAttribute = new THREE.BufferAttribute(colors, 3);
  geometry.setAttribute("color", colorAttribute);

  const seaLevel = getSeaLevelY();
  const color = new THREE.Color();
  const white = new THREE.Color(1, 1, 1);

  for (let i = 0; i < vertexCount; i++) {
    const x = positionAttribute.getX(i);
    const z = positionAttribute.getY(i);

    const coastData = computeCoastData(x, z);
    const height = getElevation(x, z, seaLevel, coastData);
    positionAttribute.setZ(i, height);
    baseHeights[i] = height;

    // Shoreline/Beach Band Logic
    const beachHeight = 2.5;
    const beachFade = 2.0;
    const beachLimit = seaLevel + beachHeight;

    let beachFactor = 0.0;
    if (height < beachLimit) {
        beachFactor = 1.0;
    } else if (height < beachLimit + beachFade) {
        const t = (height - beachLimit) / beachFade;
        beachFactor = 1.0 - t;
    }

    color.copy(GRASS_COLOR).lerp(white, beachFactor);

    if (height < seaLevel) {
       color.lerp(SHALLOW_WATER_COLOR, 0.5);
    }

    colorAttribute.setXYZ(i, color.r, color.g, color.b);
  }

  positionAttribute.needsUpdate = true;
  colorAttribute.needsUpdate = true;
  geometry.computeVertexNormals();

  geometry.userData.baseHeights = baseHeights;
  geometry.userData.segmentCount = segments;
  geometry.userData.size = size;

  if (!geometry.getAttribute("basePos")) {
    const basePos = new THREE.BufferAttribute(
      new Float32Array(positionAttribute.array),
      3,
    );
    geometry.setAttribute("basePos", basePos);
  }

    // Skirt disabled: avoid overlapping secondary ground layer near harbor/ocean.

  // Load sand texture maps
  const baseUrl = import.meta?.env?.BASE_URL ?? "/";
  const sandNormal = textureLoader.load(`${baseUrl}textures/gravelly_sand/gravelly_sand_nor_gl_1k.jpg`);
  sandNormal.wrapS = sandNormal.wrapT = THREE.RepeatWrapping;
  sandNormal.repeat.set(28, 24);
  sandNormal.colorSpace = THREE.NoColorSpace;

  const sandARM = textureLoader.load(`${baseUrl}textures/gravelly_sand/gravelly_sand_arm_1k.jpg`);
  sandARM.wrapS = sandARM.wrapT = THREE.RepeatWrapping;
  sandARM.repeat.set(28, 24);
  sandARM.colorSpace = THREE.NoColorSpace;

  let terrainMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.8,
    metalness: 0.0,
    vertexColors: true,
    side: THREE.FrontSide,
    normalMap: sandNormal,
    normalScale: new THREE.Vector2(0.5, 0.5),
    aoMap: sandARM,
    roughnessMap: sandARM,
    aoMapIntensity: 0.6,
  });

  terrainMaterial.userData.textureBudget = "skip";

  const groundTextureState = createGroundTextureState(
    terrainMaterial,
    GROUND_TEXTURE_CONFIG,
  );

  terrainMaterial.onBeforeCompile = (shader) => {
    injectGroundTextureShader(shader, groundTextureState);
    if (shader.uniforms.uSeaLevel) {
      shader.uniforms.uSeaLevel.value = getSeaLevelY();
    }
  };

  terrainMaterial = applyTextureBudgetToMaterial(terrainMaterial, {
    renderer: scene?.userData?.renderer ?? null,
  });

  const terrain = new THREE.Mesh(geometry, terrainMaterial);
  terrain.rotation.x = -Math.PI / 2;
  terrain.receiveShadow = true;
  terrain.name = "Terrain";
  // Ensure terrain renders on top of transparent water layers via explicit renderOrder
  terrain.renderOrder = 1;
  scene.add(terrain);

  const stride = segments + 1;
  terrain.userData.getHeightAt = (worldX, worldZ) => {
    const local = new THREE.Vector3(worldX, 0, worldZ);
    terrain.worldToLocal(local);

    const halfSize = size / 2;
    const localX = local.x + halfSize;
    const localZ = local.z + halfSize;

    if (localX < 0 || localX > size || localZ < 0 || localZ > size) {
      return null;
    }

    const percentX = localX / size;
    const percentZ = localZ / size;
    const gridX = percentX * segments;
    const gridZ = percentZ * segments;

    const x0 = Math.floor(gridX);
    const x1 = Math.min(x0 + 1, segments);
    const z0 = Math.floor(gridZ);
    const z1 = Math.min(z0 + 1, segments);

    const sx = gridX - x0;
    const sz = gridZ - z0;

    const index00 = z0 * stride + x0;
    const index10 = z0 * stride + x1;
    const index01 = z1 * stride + x0;
    const index11 = z1 * stride + x1;

    const h00 = baseHeights[index00];
    const h10 = baseHeights[index10];
    const h01 = baseHeights[index01];
    const h11 = baseHeights[index11];

    const h0 = h00 + (h10 - h00) * sx;
    const h1 = h01 + (h11 - h01) * sx;
    return h0 + (h1 - h0) * sz;
  };

  terrain.userData.groundTextureState = groundTextureState;

  return terrain;
}

export function updateTerrain() {}

export function updateTerrainCoverageMask(terrain, options = {}) {
  const state = terrain?.userData?.groundTextureState?.baseBlend;
  if (!terrain || !state?.maskTexture || !state.maskData) return;

  const geometry = terrain.geometry;
  const terrainSize = geometry?.userData?.size;
  if (!Number.isFinite(terrainSize)) return;

  const halfSize = terrainSize * 0.5;
  const resolution = state.maskSize;
  const data = state.maskData;
  data.fill(0);

  const paintCircle = (worldX, worldZ, radius) => {
    const u = (worldX + halfSize) / terrainSize;
    const v = (worldZ + halfSize) / terrainSize;
    if (u < 0 || u > 1 || v < 0 || v > 1) return;

    const px = Math.round(u * (resolution - 1));
    const py = Math.round(v * (resolution - 1));
    const pr = Math.ceil((radius / terrainSize) * resolution);
    const r2 = pr * pr;

    const minX = Math.max(0, px - pr);
    const maxX = Math.min(resolution - 1, px + pr);
    const minY = Math.max(0, py - pr);
    const maxY = Math.min(resolution - 1, py + pr);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - px;
        const dy = y - py;
        if (dx * dx + dy * dy <= r2) {
          const index = y * resolution + x;
          data[index] = 255;
        }
      }
    }
  };

  const paintCurve = (curve, width = 3) => {
    if (!curve?.getPoint) return;
    const samples = 160;
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const point = curve.getPoint(t);
      const radius = Math.max(0.5, width * 0.65);
      paintCircle(point.x, point.z, radius);
    }
  };

  const buildingPlacements = Array.isArray(options?.buildingPlacements)
    ? options.buildingPlacements
    : [];
  buildingPlacements.forEach((placement) => {
    const { x, z, width, depth } = placement;
    if (!Number.isFinite(x) || !Number.isFinite(z)) return;
    const radius = Math.max(1.2, Math.hypot(width ?? 1, depth ?? 1) * 0.6);
    paintCircle(x, z, radius);
  });

  const mainRoad = options?.mainRoadCurve ?? null;
  if (mainRoad) {
    paintCurve(mainRoad, options.mainRoadWidth ?? 3.2);
  }

  const secondaryRoads = Array.isArray(options?.roadCurves)
    ? options.roadCurves
    : [];
  secondaryRoads.forEach((curve) => paintCurve(curve, options.roadWidth ?? 3));

  state.maskTexture.needsUpdate = true;
  if (state.uniforms?.mask) {
    state.uniforms.mask.value = state.maskTexture;
  }
  if (state.uniforms?.maskStrength) {
    state.uniforms.maskStrength.value = state.maskStrength ?? 1;
  }
}
