import * as THREE from "three";
import { getSeaLevelY, HARBOR_WATER_BOUNDS, HARBOR_WATER_EAST_LIMIT } from "./locations.js";
import {
  createGroundTextureState,
  injectGroundTextureShader,
} from "./groundTextures.js";
import { GROUND_TEXTURE_CONFIG } from "./groundTextureConfig.js";
import { applyTextureBudgetToMaterial } from "../utils/textureBudget.js";

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
const NOISE_AMPLITUDE = 1.0;
const OCEAN_BOUNDARY_Z = -100;
const CITY_BOUNDARY_Z = -40;
const OCEAN_DEPTH = -12.0;
const CITY_HEIGHT = 4.0;
const CITY_MIN_HEIGHT = 2.0;

const HARBOR_GROUND_HEIGHT = 1;
const HARBOR_COAST_PADDING = 36;
const HARBOR_LONGITUDINAL_PADDING = 12;
const HARBOR_SLOPE_WIDTH = 6;

function clampHarborBandHeight(x, z, seaLevel, baseHeight) {
  const { west, east, north, south } = HARBOR_WATER_BOUNDS;
  const harborGroundY = seaLevel + HARBOR_GROUND_HEIGHT;

  const withinWater = x >= west && x <= east && z >= north && z <= south;
  if (withinWater) {
    return seaLevel - 0.4; // Carve a shallow basin so docks never intersect terrain
  }

  const coastalWest = east;
  const coastalEast = HARBOR_WATER_EAST_LIMIT + HARBOR_COAST_PADDING;
  const coastalNorth = north - HARBOR_LONGITUDINAL_PADDING;
  const coastalSouth = south + HARBOR_LONGITUDINAL_PADDING;
  const withinCoast =
    x >= coastalWest &&
    x <= coastalEast &&
    z >= coastalNorth &&
    z <= coastalSouth;

  if (!withinCoast) return baseHeight;

  const distanceFromEdge = Math.max(0, x - coastalWest);
  const slopeFactor = THREE.MathUtils.clamp(distanceFromEdge / HARBOR_SLOPE_WIDTH, 0, 1);
  // Blend from water height up to dry ground over a short ramp
  return THREE.MathUtils.lerp(seaLevel, harborGroundY, slopeFactor);
}

function getElevation(x, z, seaLevel) {
  const oceanHeight = seaLevel + OCEAN_DEPTH;
  const cityHeight = seaLevel + CITY_HEIGHT;

  let baseHeight = cityHeight;
  if (z < OCEAN_BOUNDARY_Z) {
    baseHeight = oceanHeight;
  } else if (z > CITY_BOUNDARY_Z) {
    baseHeight = cityHeight;
  } else {
    const t = (z - OCEAN_BOUNDARY_Z) / (CITY_BOUNDARY_Z - OCEAN_BOUNDARY_Z);
    baseHeight = THREE.MathUtils.lerp(oceanHeight, cityHeight, t);
  }

  const noise = gradientNoise(x * NOISE_SCALE, z * NOISE_SCALE) * NOISE_AMPLITUDE;
  let height = baseHeight + noise;

  // Harbor band flattening & sand pad for warehouses/docks
  height = clampHarborBandHeight(x, z, seaLevel, height);

  if (z > CITY_BOUNDARY_Z && height < seaLevel + CITY_MIN_HEIGHT) {
    height = seaLevel + CITY_MIN_HEIGHT;
  }

  return height;
}

export function createTerrain(scene) {
  const size = 500;
  const segments = 256;
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

  for (let i = 0; i < vertexCount; i++) {
    const x = positionAttribute.getX(i);
    const z = positionAttribute.getY(i);

    const height = getElevation(x, z, seaLevel);
    positionAttribute.setZ(i, height);
    baseHeights[i] = height;

    if (height < seaLevel + 1.0) {
      color.setRGB(0.76, 0.70, 0.54); // Sand
    } else {
      color.setRGB(0.36, 0.50, 0.32); // Grass / dry earth
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

  let terrainMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0.0,
    vertexColors: true,
  });

  terrainMaterial.userData.textureBudget = "skip";

  const groundTextureState = createGroundTextureState(
    terrainMaterial,
    GROUND_TEXTURE_CONFIG,
  );

  terrainMaterial.onBeforeCompile = (shader) => {
    injectGroundTextureShader(shader, groundTextureState);
  };

  terrainMaterial = applyTextureBudgetToMaterial(terrainMaterial, {
    renderer: scene?.userData?.renderer ?? null,
  });

  const terrain = new THREE.Mesh(geometry, terrainMaterial);
  terrain.rotation.x = -Math.PI / 2;
  terrain.receiveShadow = true;
  terrain.name = "Terrain";
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
