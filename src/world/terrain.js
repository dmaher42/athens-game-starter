import {shapeAcropolisGround} from './acropolisLayout.js';
import {isCityDryGround} from './neighbourhoodLayout.js';
import * as THREE from "three";
import { harborCoastBlend, harborCoastHeight } from "./harborCoast.js";
import {
  getSeaLevelY,
  AEGEAN_OCEAN_BOUNDS,
  AEGEAN_OPEN_SEA_WEST,
  HARBOR_GROUND_HEIGHT,
  HARBOR_WATER_BOUNDS,
  AGORA_COURT_BOUNDS,
  INLAND_LANDMARK_TERRACES,
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
  setTerrainMeshForUpdates,
} from "../materials/groundMaterials.js";
import {
  SEA_SIDE,
  COAST_WIDTH,
  INLAND_RISE,
  RIDGE_START,
  RIDGE_HEIGHT,
} from "../config/terrainShape";
import { validateTerrain } from "./terrainValidation.ts";
import { createTerrainGridSampler } from "./terrainHeight.js";

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

const SHORELINE_CITY_LIMIT = 0.65;
const SHORELINE_SAND_BAND = 0.3;
const SHALLOW_WATER_BAND = 1.2;
const HARBOR_BASIN_EDGE_BAND = 12;
const HARBOR_COASTAL_BAND = 16;
const HARBOR_SHELF_PADDING = 18;
const HARBOR_SHELF_SLOPE_WIDTH = 20;
const HARBOR_SHORE_COVE_INSET = 16;
const SAND_COLOR = new THREE.Color(0.68, 0.64, 0.55);
const GRASS_COLOR = new THREE.Color(0.34, 0.46, 0.32);
const SHALLOW_WATER_COLOR = new THREE.Color(0x1f4f59);
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
  const coastMask = THREE.MathUtils.smoothstep(dSea, 0, coastBand);

  return { dSea, coastMask };
}

function clampHarborBandHeight(x, z, seaLevel, baseHeight) {
  // Define a bounding box for the harbor water area using HARBOR_WATER_BOUNDS
  const west = HARBOR_WATER_BOUNDS.west;
  const east = HARBOR_WATER_BOUNDS.east;
  const north = Math.max(HARBOR_WATER_BOUNDS.north, HARBOR_WATER_BOUNDS.south);
  const south = Math.min(HARBOR_WATER_BOUNDS.north, HARBOR_WATER_BOUNDS.south);
  const oceanEast = Math.max(AEGEAN_OCEAN_BOUNDS.west, AEGEAN_OCEAN_BOUNDS.east);
  const oceanNorth = Math.max(AEGEAN_OCEAN_BOUNDS.north, AEGEAN_OCEAN_BOUNDS.south);
  const oceanSouth = Math.min(AEGEAN_OCEAN_BOUNDS.north, AEGEAN_OCEAN_BOUNDS.south);

  const harborGroundY = seaLevel + HARBOR_GROUND_HEIGHT;
  const shelfNorth = north + HARBOR_SHELF_PADDING;
  const shelfSouth = south - HARBOR_SHELF_PADDING;
  const shelfCenterZ = (shelfNorth + shelfSouth) * 0.5;
  const shelfHalfDepth = Math.max(1, (shelfNorth - shelfSouth) * 0.5);
  const shorelineWest = getHarborShorelineWest(z, west, north, south);

  const withinWater = x >= shorelineWest && x <= east && z >= south && z <= north;
  if (withinWater) {
    // Shape a softer basin: shallower near the shoreline, deeper toward the
    // middle, so the terrain owns the harbor edge instead of a hard cut.
    const edgeDistance = Math.min(x - shorelineWest, east - x, z - south, north - z);
    const basinBlend = THREE.MathUtils.smoothstep(
      0,
      HARBOR_BASIN_EDGE_BAND,
      edgeDistance,
    );
    const shallowEdgeY = seaLevel - 0.95;
    const basinFloorY = seaLevel - 2.3;
    return THREE.MathUtils.lerp(shallowEdgeY, basinFloorY, basinBlend);
  }

  // Preserve main's deep-ocean floor while widening only the visible water.
  // City exclusions use the same boundary, keeping surrounding land intact.
  const withinOpenSea =
    x >= AEGEAN_OPEN_SEA_WEST && x <= oceanEast && z >= oceanSouth && z <= oceanNorth;
  if (withinOpenSea) {
    if (x < west - 40) return seaLevel - 15.0; // Deeper ocean further out
    return seaLevel - 8.5;
  }

  // Create a flatter shelf behind the harbor, but keep it constrained so it
  // supports the connector and waterfront buildings without becoming a large
  // rectangular patch across the whole district.
  const shelfWidth = 60;
  const shelfStart = shorelineWest - shelfWidth;
  const zDistanceFromShelfCenter = Math.abs(z - shelfCenterZ);
  const shelfDepthFactor = THREE.MathUtils.clamp(
    1 - zDistanceFromShelfCenter / shelfHalfDepth,
    0,
    1,
  );

  if (x >= shelfStart && x < west && z >= shelfSouth && z <= shelfNorth) {
    const shelfBlend = shelfDepthFactor * shelfDepthFactor;
    return THREE.MathUtils.lerp(baseHeight, harborGroundY, shelfBlend);
  }

  // Slope up to land on the West side of the harbor shelf
  const slopeWidth = HARBOR_SHELF_SLOPE_WIDTH;
  const landStart = shelfStart - slopeWidth;
  const slopeNorth = shelfNorth + 10;
  const slopeSouth = shelfSouth - 10;

  if (x >= landStart && x < shelfStart && z >= slopeSouth && z <= slopeNorth) {
      const t = (x - landStart) / slopeWidth;
      const zFade = THREE.MathUtils.clamp(
        1 - Math.abs(z - shelfCenterZ) / Math.max(1, (slopeNorth - slopeSouth) * 0.5),
        0,
        1,
      );
      return THREE.MathUtils.lerp(baseHeight, harborGroundY, t * zFade);
  }

  return baseHeight;
}

function getDistanceToHarborWaterBounds(x, z) {
  const west = Math.min(HARBOR_WATER_BOUNDS.west, HARBOR_WATER_BOUNDS.east);
  const east = Math.max(HARBOR_WATER_BOUNDS.west, HARBOR_WATER_BOUNDS.east);
  const north = Math.max(HARBOR_WATER_BOUNDS.north, HARBOR_WATER_BOUNDS.south);
  const south = Math.min(HARBOR_WATER_BOUNDS.north, HARBOR_WATER_BOUNDS.south);
  const shorelineWest = getHarborShorelineWest(z, west, north, south);

  const dx = x < shorelineWest ? shorelineWest - x : x > east ? x - east : 0;
  const dz = z < south ? south - z : z > north ? z - north : 0;
  return Math.hypot(dx, dz);
}

function getHarborShorelineWest(z, west, north, south) {
  const centerZ = (north + south) * 0.5;
  const halfDepth = Math.max(1, (north - south) * 0.5);
  const normalizedZ = THREE.MathUtils.clamp(Math.abs(z - centerZ) / halfDepth, 0, 1);
  const coveFactor = 1 - THREE.MathUtils.smoothstep(0.1, 0.95, normalizedZ);
  const shoulderFactor = 1 - normalizedZ * 0.22;
  return west + HARBOR_SHORE_COVE_INSET * coveFactor * shoulderFactor;
}

function isWithinOceanBounds(x, z) {
  const west = Math.min(AEGEAN_OCEAN_BOUNDS.west, AEGEAN_OCEAN_BOUNDS.east);
  const east = Math.max(AEGEAN_OCEAN_BOUNDS.west, AEGEAN_OCEAN_BOUNDS.east);
  const north = Math.max(AEGEAN_OCEAN_BOUNDS.north, AEGEAN_OCEAN_BOUNDS.south);
  const south = Math.min(AEGEAN_OCEAN_BOUNDS.north, AEGEAN_OCEAN_BOUNDS.south);
  return x >= west && x <= east && z >= south && z <= north;
}

function getElevation(
  x,
  z,
  seaLevel,
  coastData = null,
  noiseOffset = ZERO_NOISE_OFFSET,
) {
  // PlaneGeometry local Y becomes negative world Z. Shape land consistently
  // in world coordinates; keep the established coastal profile as a hard lock.
  const worldZ = -z;
  const coast = coastData ?? computeCoastData(x, z);
  const preservedCoast = clampHarborBandHeight(x, worldZ, seaLevel, seaLevel);
  const outsideHarborBand = Math.max(-80 - worldZ, worldZ - 105, 0);
  const harborLock = THREE.MathUtils.smoothstep(x, -12, 0) *
    (1 - THREE.MathUtils.smoothstep(outsideHarborBand, 0, 50));
  const seaEdgeLock = THREE.MathUtils.smoothstep(x, 85, 112);
  const coastLock = Math.max(harborLock, seaEdgeLock);
  const bayBlend = harborCoastBlend(x, worldZ);
  const finishCoast = height => THREE.MathUtils.lerp(height, harborCoastHeight(x, worldZ, seaLevel), bayBlend);
  if (preservedCoast < seaLevel || coastLock >= 1) return finishCoast(preservedCoast);

  const distanceInland = Math.max(0, AEGEAN_OPEN_SEA_WEST - x);
  let h = seaLevel + 2 + INLAND_RISE * THREE.MathUtils.smoothstep(distanceInland, 0, 460);
  const ridgeNoise = gradientNoise((x + noiseOffset.x) * 0.01, (worldZ + noiseOffset.z) * 0.01) * 0.5 + 0.5;
  h += RIDGE_HEIGHT * ridgeNoise * THREE.MathUtils.smoothstep(coast.dSea, RIDGE_START, 1);
  h += gradientNoise((x + noiseOffset.x) * 0.015, (worldZ + noiseOffset.z) * 0.015) * 0.12;
  h = THREE.MathUtils.lerp(seaLevel, h, coast.coastMask);
  h = clampHarborBandHeight(x, worldZ, seaLevel, h);

  for (const terrace of INLAND_LANDMARK_TERRACES) {
    // A grid-cell apron keeps the complete temple footprint supported.
    const dx = Math.max(0, Math.abs(x - terrace.x) - terrace.halfWidth - 8);
    const dz = Math.max(0, Math.abs(worldZ - terrace.z) - terrace.halfDepth - 8);
    const influence = 1 - THREE.MathUtils.smoothstep(Math.hypot(dx, dz), 0, 40);
    h = THREE.MathUtils.lerp(h, seaLevel + terrace.heightAboveSea, influence);
  }
  const court = AGORA_COURT_BOUNDS;
  const courtDistance = Math.hypot(Math.max(court.west - x, x - court.east, 0), Math.max(court.south - worldZ, worldZ - court.north, 0));
  h = THREE.MathUtils.lerp(h, seaLevel + 2.5, 1 - THREE.MathUtils.smoothstep(courtDistance, 0, 18));
  h = shapeAcropolisGround(x,worldZ,h,seaLevel);
  return finishCoast(THREE.MathUtils.lerp(h, preservedCoast, coastLock));
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
  // Keep the terrain dense enough for the city silhouette while trimming a
  // large chunk of render + collision geometry from the default build.
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
    // A missing inland height profile cannot be repaired by changing noise.
    // Keep the diagnostic without repeating expensive, identical attempts.
    if (validationResult.valid || validationResult.failures.includes('inland-at-waterline')) break;
  }

  if (validationResult && !validationResult.valid) {
    console.warn("Terrain shape check reported unresolved issues.", validationResult);
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
    const centerX =
      (positionAttribute.getX(a) +
        positionAttribute.getX(b) +
        positionAttribute.getX(c)) /
      3;
    const centerZ =
      (positionAttribute.getY(a) +
        positionAttribute.getY(b) +
        positionAttribute.getY(c)) /
      3;
    const heightA = positionAttribute.getZ(a);
    const heightB = positionAttribute.getZ(b);
    const heightC = positionAttribute.getZ(c);
    const avgHeight = (heightA + heightB + heightC) / 3;
    const minHeight = Math.min(heightA, heightB, heightC);
    // Triangles whose average centre sits below sea level are fully underwater.
    // Assigning them a coastal/city material (tan sand or brown dirt) causes
    // those textures to bleed through the transparent water surface as brown
    // patches.  Route them straight to InlandGroundMaterial instead.
    const isFullyUnderwater = avgHeight < seaLevel;
    const isShallowUnderwater = avgHeight >= seaLevel - 1.2;
    const isShallowWater = avgHeight <= seaLevel + SHALLOW_WATER_BAND;
    const isUnderwaterTriangle = avgHeight <= seaLevel + 0.05;
    const touchesWaterline = minHeight <= seaLevel + 0.12;
    const isOpenSeaTriangle = isWithinOceanBounds(centerX, centerZ);
    const harborDistance = getDistanceToHarborWaterBounds(centerX, centerZ);
    const isWaterBodyTriangle =
      isOpenSeaTriangle || harborDistance <= HARBOR_COASTAL_BAND;
    const isHarborShoreline =
      harborDistance <= HARBOR_COASTAL_BAND &&
      (isShallowWater || touchesWaterline);
    const dryBayShore = harborCoastBlend(centerX, -centerZ) > 0 && minHeight > seaLevel + 0.05 && avgHeight < seaLevel + 3.5;
    const shouldUseCoastalMaterial = dryBayShore ||
      (isShallowUnderwater || !isFullyUnderwater) && (
        dSea < 0.15 ||
        (dSea < SHORELINE_SAND_BAND && (isShallowWater || touchesWaterline)) ||
        (isWaterBodyTriangle &&
          (isShallowWater || touchesWaterline || isUnderwaterTriangle)) ||
        isHarborShoreline
      );

    if (shouldUseCoastalMaterial) {
      coastalIndices.push(a, b, c);
    } else if (!isFullyUnderwater && (
      (dSea <= SHORELINE_CITY_LIMIT && !isWaterBodyTriangle) ||
      // The wide ocean sheet overlaps dry land. Its bounds alone must not
      // turn occupied inland districts into disconnected grass rectangles.
      isCityDryGround(centerX,-centerZ)
    )) {
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
  terrain.userData.validation = validationResult;
  // Terrain should render before the ocean surface so underwater ground stays
  // hidden below the water instead of visually conflicting with it.
  terrain.renderOrder = RENDER_LAYERS.TERRAIN;
  
  // ✅ STEP 1: Validate and ensure UVs exist (required for city ground texture)
  if (!terrain.geometry.attributes.uv) {
    console.warn('[Terrain] ⚠️ City mesh is missing UVs. Adding fallback.');
    const uvCount = terrain.geometry.attributes.position.count;
    const uvAttr = new Float32Array(uvCount * 2);
    
    // Generate simple planar UVs based on position
    const positions = terrain.geometry.attributes.position;
    const terrainSize = TERRAIN_SIZE;
    for (let i = 0; i < uvCount; i++) {
      const x = positions.getX(i);
      const z = positions.getY(i); // Y is used because geometry is rotated
      uvAttr[i * 2] = (x + terrainSize / 2) / terrainSize;
      uvAttr[i * 2 + 1] = (z + terrainSize / 2) / terrainSize;
    }
    
    terrain.geometry.setAttribute('uv', new THREE.BufferAttribute(uvAttr, 2));
    console.log('[Terrain] ✅ Fallback UVs generated for', uvCount, 'vertices');
  } else {
    console.log('[Terrain] ✅ UV attributes confirmed:', {
      uvCount: terrain.geometry.attributes.uv.count,
      itemSize: terrain.geometry.attributes.uv.itemSize
    });
  }
  
  // Register terrain mesh so ground material loader can trigger updates
  setTerrainMeshForUpdates(terrain);
  
  scene.add(terrain);

  terrain.userData.getHeightAt = createTerrainGridSampler(terrain);

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
  const terrainMaterials = Array.isArray(terrain.material)
    ? terrain.material
    : [terrain.material];
  const cityMaterial = terrainMaterials.find(
    (material) => material?.name === "CityGroundMaterial",
  );
  if (cityMaterial) {
    cityMaterial.userData = cityMaterial.userData || {};
    cityMaterial.userData.roadsideMask = roadMaskState.maskTexture;
    cityMaterial.needsUpdate = true;
  }
  if (state.uniforms?.mask) {
    state.uniforms.mask.value = state.maskTexture;
  }
  if (state.uniforms?.maskStrength) {
    state.uniforms.maskStrength.value = state.maskStrength ?? 1;
  }

  roadMaskState.maskTexture.needsUpdate = true;
}
