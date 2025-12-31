import * as THREE from "three";
import {
  getSeaLevelY,
  AGORA_CENTER_3D,
  HARBOR_CENTER_3D,
  HARBOR_GROUND_HEIGHT,
} from "./locations.js";
import { getDistanceToCoast, isInHarborZone } from './coastalZones.js';
import {
  GRASS_MIN_ELEV,
  SAND_MAX_ELEV,
} from "../config/terrainMaterials.js";
import { RENDER_LAYERS } from "./renderLayers.js";
import {
  CityGroundMaterial,
  CoastalGroundMaterial,
  InlandGroundMaterial,
} from "../materials/groundMaterials.js";
import {
  SEA_SIDE,
  COAST_WIDTH,
  INLAND_RISE,
  RIDGE_START,
  RIDGE_HEIGHT,
} from "../config/terrainShape";
import { validateTerrain } from "./terrainValidation.js";

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
const MAINLAND_EDGE_BUFFER = 0.8;
const SAND_COLOR = new THREE.Color(0.68, 0.64, 0.55);
const GRASS_COLOR = new THREE.Color(0.34, 0.46, 0.32);
const SHALLOW_WATER_COLOR = new THREE.Color(0x1f4f59);

// Harbor configuration (East Facing)
// HARBOR_GROUND_HEIGHT imported from locations.js at line 6
const HARBOUR_RADIUS = 70;
const HARBOUR_TARGET_DEPTH = 2;
const EAST_HARBOR_CENTER = new THREE.Vector2(HARBOR_CENTER_3D.x, HARBOR_CENTER_3D.z);

// New Mainland/Coastal Constants
const TERRAIN_SIZE = 2400; // Large terrain for mainland
const HALF_TERRAIN_SIZE = TERRAIN_SIZE * 0.5;
const TERRAIN_VALIDATION_ATTEMPTS = 5;
const TERRAIN_NOISE_SEED = Math.floor(Math.random() * 1000000);
const ZERO_NOISE_OFFSET = { x: 0, z: 0 };

function seededRandom(seed) {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

function getNoiseOffset(seed, attempt, size) {
  if (attempt <= 0) return ZERO_NOISE_OFFSET;
  const range = size * 0.35;
  const base = seed + attempt * 1319;
  const randA = seededRandom(base * 1.31);
  const randB = seededRandom(base * 2.17 + 19.7);
  return {
    x: (randA * 2 - 1) * range,
    z: (randB * 2 - 1) * range,
  };
}

function getDistanceToSeaNormalized(x, z) {
  switch (SEA_SIDE) {
    case "west":
      return THREE.MathUtils.clamp((x + HALF_TERRAIN_SIZE) / TERRAIN_SIZE, 0, 1);
    case "north":
      return THREE.MathUtils.clamp((z + HALF_TERRAIN_SIZE) / TERRAIN_SIZE, 0, 1);
    case "south":
      return THREE.MathUtils.clamp((HALF_TERRAIN_SIZE - z) / TERRAIN_SIZE, 0, 1);
    case "east":
    default:
      return THREE.MathUtils.clamp((HALF_TERRAIN_SIZE - x) / TERRAIN_SIZE, 0, 1);
  }
}

function computeCoastData(x, z) {
  const dSea = getDistanceToSeaNormalized(x, z);
  const coastBand = THREE.MathUtils.clamp(COAST_WIDTH / TERRAIN_SIZE, 0, 1);
  const coastMask = THREE.MathUtils.smoothstep(0, coastBand, dSea);

  return { dSea, coastMask };
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
  // Water only on EAST side (in front), not west (behind)
  const west = EAST_HARBOR_CENTER.x; // Start at harbor center, not west of it
  const east = EAST_HARBOR_CENTER.x + 800; // Extend eastward
  // Extended north-south depth to match water plane (200 half-depth = 400 total)
  const halfDepth = 200;
  const north = EAST_HARBOR_CENTER.y - halfDepth;
  const south = EAST_HARBOR_CENTER.y + halfDepth;

  const harborGroundY = seaLevel + HARBOR_GROUND_HEIGHT;

  const withinWater = x >= west && x <= east && z >= north && z <= south;
  if (withinWater) {
    // Ensure terrain sits BELOW the water plane inside the harbor water bounds
    // Water plane is at seaLevel (0). Drop terrain to avoid occlusion.
    return seaLevel - 1.4;
  }

  // Create a flat shelf BEHIND the harbor (west of water) for city connection
  const shelfWidth = 60; // Width of flat area for harbor buildings and props
  const shelfStart = west - shelfWidth;
  const shelfDepth = 80; // Extend shelf north-south
  
  if (x >= shelfStart && x < west && z >= north - shelfDepth && z <= south + shelfDepth) {
    // Flat shelf at harborGroundY for harbor props and city connection
    return harborGroundY;
  }

  // Slope up to land on the West side of the harbor shelf
  const slopeWidth = 25; // Transition from shelf to city terrain
  const landStart = shelfStart - slopeWidth;

  if (x >= landStart && x < shelfStart && z >= north - shelfDepth - 10 && z <= south + shelfDepth + 10) {
      const t = (x - landStart) / slopeWidth;
      return THREE.MathUtils.lerp(baseHeight, harborGroundY, t);
  }

  return baseHeight;
}

function getElevation(
  x,
  z,
  seaLevel,
  coastData = null,
  noiseOffset = ZERO_NOISE_OFFSET,
) {
  // Base Height calculation
  let h = seaLevel + CITY_HEIGHT;

  const coast = coastData ?? computeCoastData(x, z);
  const dSea = coast.dSea;

  // Macro-shape note: noise + lack of non-sea border min elevation can dip edges below sea level, causing island silhouettes.

  // Directional inland elevation that gently increases away from the sea edge
  h += INLAND_RISE * (dSea + dSea * dSea);

  const ridgeNoise =
    gradientNoise(
      (x + noiseOffset.x) * NOISE_SCALE * 0.2,
      (z + noiseOffset.z) * NOISE_SCALE * 0.2,
    ) *
      0.5 +
    0.5;
  const ridgeMask = THREE.MathUtils.smoothstep(RIDGE_START, 1.0, dSea);
  h += ridgeMask * ridgeNoise * RIDGE_HEIGHT;

  // Apply Noise
  const rawNoise = gradientNoise(
    (x + noiseOffset.x) * NOISE_SCALE,
    (z + noiseOffset.z) * NOISE_SCALE,
  );
  // Keep noise below the inland bias so geography reads clearly and stay calmer to the east
  const noise = rawNoise * NOISE_AMPLITUDE * (0.35 + dSea * 0.65);

  // Attenuate noise near coast
  const coastalNoiseAttenuation = 1 - coast.coastMask;
  const shapedNoise = noise * (0.4 + coastalNoiseAttenuation * 0.6);

  h += shapedNoise;

  const borderBand = THREE.MathUtils.clamp(COAST_WIDTH / TERRAIN_SIZE, 0, 1);
  const borderDistances = {
    east: THREE.MathUtils.clamp((HALF_TERRAIN_SIZE - x) / TERRAIN_SIZE, 0, 1),
    west: THREE.MathUtils.clamp((x + HALF_TERRAIN_SIZE) / TERRAIN_SIZE, 0, 1),
    north: THREE.MathUtils.clamp((z + HALF_TERRAIN_SIZE) / TERRAIN_SIZE, 0, 1),
    south: THREE.MathUtils.clamp((HALF_TERRAIN_SIZE - z) / TERRAIN_SIZE, 0, 1),
  };
  const nonSeaBorders = Object.entries(borderDistances)
    .filter(([side]) => side !== SEA_SIDE)
    .map(([, distance]) => 1 - THREE.MathUtils.smoothstep(0, borderBand, distance));
  const nonSeaBorderMask =
    nonSeaBorders.length > 0 ? Math.max(...nonSeaBorders) : 0;
  if (nonSeaBorderMask > 0) {
    // Islands can happen when a slope threshold is used as a height buffer on borders.
    // IMPORTANT: This must be a HEIGHT buffer (in elevation units), not a slope threshold.
    // Using a slope constant here can accidentally allow water at non-sea borders -> island ring.
    h = Math.max(h, seaLevel + MAINLAND_EDGE_BUFFER * nonSeaBorderMask);
  }

  // Carves
  h = applyHarbourCarve(x, z, seaLevel, h);
  h = clampHarborBandHeight(x, z, seaLevel, h);

  // Agora Flattening
  const agoraDist = Math.hypot(x - AGORA_CENTER_3D.x, z - AGORA_CENTER_3D.z);
  if (agoraDist < 60) {
      // Gentle flattening
      h = h * 0.7 + (seaLevel + CITY_HEIGHT) * 0.3;
  }

  // --- Coastal Feature Generation ---
  const featureNoise = gradientNoise(x * 0.004, z * 0.004) * 0.5 + 0.5; // range 0-1
  const cliffFactor = THREE.MathUtils.smoothstep(0.5, 0.6, featureNoise);

  // Add extra height for cliffs before the coastal fade is applied
  if (cliffFactor > 0) {
      const cliffDetailNoise = gradientNoise(x * 0.1, z * 0.1);
      const coastalZoneFactor = 1.0 - THREE.MathUtils.smoothstep(0.0, (COAST_WIDTH / TERRAIN_SIZE) * 2.0, coast.dSea);
      h += cliffDetailNoise * 2.0 * cliffFactor * coastalZoneFactor; // Add some ruggedness
      h += 10.0 * cliffFactor * coastalZoneFactor; // Add general height to the cliffs
  }


  // Coast Fade
  if (coast.coastMask < 1) {
      // For cliffs, we want a steeper drop-off. We can achieve this by raising the coastMask to a power.
      const beachMask = coast.coastMask;
      const cliffMask = Math.pow(coast.coastMask, 8.0); // Creates a much sharper curve

      const finalMask = THREE.MathUtils.lerp(beachMask, cliffMask, cliffFactor);

      // In beach areas, clamp the max height to prevent large hills right next to the water
      if (cliffFactor < 0.1) {
          h = Math.min(h, seaLevel + CITY_HEIGHT);
      }

      h = THREE.MathUtils.lerp(seaLevel, h, finalMask);
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
  const dSeaValues = new Float32Array(vertexCount);
  const dSeaAttribute = new THREE.BufferAttribute(dSeaValues, 1);
  geometry.setAttribute("dSea", dSeaAttribute);

  const seaLevel = getSeaLevelY();
  const color = new THREE.Color();
  const white = new THREE.Color(1, 1, 1);

  const fillTerrain = (noiseOffset) => {
    for (let i = 0; i < vertexCount; i++) {
      const x = positionAttribute.getX(i);
      const z = positionAttribute.getY(i);

      const coastData = computeCoastData(x, z);
      const height = getElevation(x, z, seaLevel, coastData, noiseOffset);
      positionAttribute.setZ(i, height);
      baseHeights[i] = height;
      dSeaValues[i] = coastData.dSea;

      // Shoreline/Beach Band Logic
      const beachHeight = SAND_MAX_ELEV;
      const beachFade = Math.max(0.1, GRASS_MIN_ELEV - SAND_MAX_ELEV);
      const beachLimit = seaLevel + beachHeight;

      let beachFactor = 0.0;
      if (height < beachLimit) {
          beachFactor = 1.0;
      } else if (height < beachLimit + beachFade) {
          const t = (height - beachLimit) / beachFade;
          beachFactor = 1.0 - t;
      }

      color.copy(GRASS_COLOR).lerp(white, beachFactor);

      // Underwater terrain: Apply seabed color for terrain below water level
      if (height < seaLevel) {
         // Use sand color for shallow underwater terrain (< 0.1m below)
         if (height > seaLevel - 0.1) {
           color.lerp(SAND_COLOR, 0.7);
         } else {
           // Deeper water gets darker seabed color
           color.lerp(SHALLOW_WATER_COLOR, 0.6);
         }
      }

      colorAttribute.setXYZ(i, color.r, color.g, color.b);
    }
  };

  let validationResult = null;
  for (let attempt = 0; attempt < TERRAIN_VALIDATION_ATTEMPTS; attempt++) {
    const noiseOffset = getNoiseOffset(TERRAIN_NOISE_SEED, attempt, size);
    fillTerrain(noiseOffset);
    validationResult = validateTerrain({
      baseHeights,
      segments,
      size,
      seaLevel,
      seaSide: SEA_SIDE,
    });
    if (validationResult.valid) break;
  }

  if (validationResult && !validationResult.valid) {
    console.warn("Terrain validation failed after retries.", validationResult);
  }

  positionAttribute.needsUpdate = true;
  colorAttribute.needsUpdate = true;
  dSeaAttribute.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

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

  const coastalIndices = [];
  const cityIndices = [];
  const inlandIndices = [];
  const indexArray = geometry.index.array;

  for (let i = 0; i < indexArray.length; i += 3) {
    const a = indexArray[i];
    const b = indexArray[i + 1];
    const c = indexArray[i + 2];
    const dSea = (dSeaValues[a] + dSeaValues[b] + dSeaValues[c]) / 3;
    const height = (positionAttribute.getZ(a) + positionAttribute.getZ(b) + positionAttribute.getZ(c)) / 3;

    if (height > seaLevel && dSea < 0.15) {
      coastalIndices.push(a, b, c);
    } else if (dSea <= 0.55) {
      cityIndices.push(a, b, c);
    } else {
      inlandIndices.push(a, b, c);
    }
  }

  const totalIndices = coastalIndices.length + cityIndices.length + inlandIndices.length;
  const reorderedIndices = new Uint32Array(totalIndices);
  geometry.clearGroups();

  let offset = 0;
  const addGroup = (indices, materialIndex) => {
    if (!indices.length) return;
    reorderedIndices.set(indices, offset);
    geometry.addGroup(offset, indices.length, materialIndex);
    offset += indices.length;
  };

  addGroup(coastalIndices, 0);
  addGroup(cityIndices, 1);
  addGroup(inlandIndices, 2);

  const coastalTriangles = coastalIndices.length / 3;
  const cityTriangles = cityIndices.length / 3;
  const inlandTriangles = inlandIndices.length / 3;

  console.log(
    `[Ground][Temp] Coastal ground material applied to ${coastalTriangles} triangles`,
  );
  console.log(
    `[Ground][Temp] City ground material applied to ${cityTriangles} triangles`,
  );
  console.log(
    `[Ground][Temp] Inland ground material applied to ${inlandTriangles} triangles`,
  );

  geometry.setIndex(new THREE.BufferAttribute(reorderedIndices, 1));

  const terrainMaterials = [
    CoastalGroundMaterial,
    CityGroundMaterial,
    InlandGroundMaterial,
  ];

  const terrain = new THREE.Mesh(geometry, terrainMaterials);
  terrain.rotation.x = -Math.PI / 2;
  terrain.receiveShadow = true;
  terrain.name = "Terrain";
  // Ensure terrain renders on top of transparent water layers via explicit renderOrder
  terrain.renderOrder = RENDER_LAYERS.TERRAIN;
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

  return terrain;
}

export function updateTerrain() {}

/**
 * Lower terrain slightly where shallow water should be exposed and optionally blend shoreline sand color.
 * Criteria: where the vertex height >= seaLevel and the location is effectively water (distanceToCoast === 0)
 * @param {THREE.Mesh} terrain
 * @param {Object} [options]
 * @param {number} [options.lowerBy]
 * @param {boolean} [options.blendShore]
 */
export function adjustShallowWater(terrain, options = {}) {
  if (!terrain || !terrain.geometry) return;
  const { lowerBy = 0.5, blendShore = true } = options;
  const geometry = terrain.geometry;
  const posAttr = geometry.attributes.position;
  const colorAttr = geometry.attributes.color;
  const baseHeights = geometry.userData.baseHeights;
  const seaLevel = getSeaLevelY();

  // Require sampler to compute coast distance
  const sampler = terrain.userData?.getHeightAt;
  const canSample = typeof sampler === 'function';

  const tmp = new THREE.Vector3();
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getY(i);
    const h = posAttr.getZ(i);

    // Only consider vertices at or above sea level
    if (h >= seaLevel) {
      let isWaterNearby = false;

      if (canSample) {
        try {
          const dist = getDistanceToCoast(sampler, x, z, 8);
          if (dist === 0) isWaterNearby = true;
        } catch (err) {
          // fallback to harbor check
          try {
            if (isInHarborZone(sampler, x, z)) isWaterNearby = true;
          } catch (e) {
            // ignore
          }
        }
      }

      if (isWaterNearby) {
        // Lower vertex to expose water
        const newH = h - lowerBy;
        posAttr.setZ(i, newH);

        // Keep the baseHeights sampler consistent with the visual mesh
        if (baseHeights && baseHeights.length > i) {
          baseHeights[i] = newH;
        }

        // Also update basePos attribute (if present) so other systems reading base positions stay in sync
        const basePos = geometry.getAttribute("basePos");
        if (basePos) {
          // basePos stores triples; setZ works with the vertex index
          try { basePos.setZ(i, newH); } catch (e) { /* ignore if not supported */ }
        }

        // Blend color toward sand for shoreline effect
        if (blendShore && colorAttr) {
          const r = colorAttr.getX(i);
          const g = colorAttr.getY(i);
          const b = colorAttr.getZ(i);
          const cur = new THREE.Color(r, g, b);
          cur.lerp(SAND_COLOR, 0.65);
          colorAttr.setXYZ(i, cur.r, cur.g, cur.b);
        }
      }
    }
  }

  posAttr.needsUpdate = true;
  if (colorAttr) colorAttr.needsUpdate = true;
  geometry.computeVertexNormals();
}

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

  const roadMaskResolution = resolution;
  let roadMaskState = terrain.userData.roadsideMaskState;
  if (!roadMaskState || roadMaskState.maskSize !== roadMaskResolution) {
    const maskData = new Uint8Array(roadMaskResolution * roadMaskResolution);
    const maskTexture = new THREE.DataTexture(
      maskData,
      roadMaskResolution,
      roadMaskResolution,
      THREE.RedFormat,
      THREE.UnsignedByteType,
    );
    maskTexture.needsUpdate = true;
    maskTexture.colorSpace = THREE.LinearSRGBColorSpace;
    maskTexture.magFilter = THREE.LinearFilter;
    maskTexture.minFilter = THREE.LinearMipMapLinearFilter;
    roadMaskState = {
      maskData,
      maskTexture,
      maskSize: roadMaskResolution,
    };
    terrain.userData.roadsideMaskState = roadMaskState;
  }
  roadMaskState.maskData.fill(0);

  const paintCircle = (targetData, targetResolution, worldX, worldZ, radius) => {
    const u = (worldX + halfSize) / terrainSize;
    const v = (worldZ + halfSize) / terrainSize;
    if (u < 0 || u > 1 || v < 0 || v > 1) return;

    const px = Math.round(u * (targetResolution - 1));
    const py = Math.round(v * (targetResolution - 1));
    const pr = Math.ceil((radius / terrainSize) * targetResolution);
    const r2 = pr * pr;

    const minX = Math.max(0, px - pr);
    const maxX = Math.min(targetResolution - 1, px + pr);
    const minY = Math.max(0, py - pr);
    const maxY = Math.min(targetResolution - 1, py + pr);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - px;
        const dy = y - py;
        if (dx * dx + dy * dy <= r2) {
          const index = y * targetResolution + x;
          targetData[index] = 255;
        }
      }
    }
  };

  const roadBuffer = Number.isFinite(options?.roadBuffer) ? options.roadBuffer : 2;

  const paintCurve = (curve, width = 3) => {
    if (!curve?.getPoint) return;
    const samples = 160;
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const point = curve.getPoint(t);
      const radius = Math.max(0.5, width * 0.65 + roadBuffer);
      paintCircle(data, resolution, point.x, point.z, radius);
      paintCircle(
        roadMaskState.maskData,
        roadMaskState.maskSize,
        point.x,
        point.z,
        radius,
      );
    }
  };

  const buildingPlacements = Array.isArray(options?.buildingPlacements)
    ? options.buildingPlacements
    : [];
  buildingPlacements.forEach((placement) => {
    const { x, z, width, depth } = placement;
    if (!Number.isFinite(x) || !Number.isFinite(z)) return;
    const radius = Math.max(1.2, Math.hypot(width ?? 1, depth ?? 1) * 0.6);
    paintCircle(data, resolution, x, z, radius);
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

  roadMaskState.maskTexture.needsUpdate = true;
}
