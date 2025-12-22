import * as THREE from "three";
import {
  getSeaLevelY,
  HARBOR_WATER_BOUNDS,
  HARBOR_WATER_EAST_LIMIT,
  HARBOR_CENTER,
  HARBOR_WATER_RADIUS,
  AGORA_CENTER_3D,
  ISLAND_RADIUS,
} from "./locations.js";
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
const NOISE_AMPLITUDE = 0.7;
const OCEAN_BOUNDARY_Z = -100;
const CITY_BOUNDARY_Z = -40;
const OCEAN_DEPTH = -12.0;
const CITY_HEIGHT = 4.0;
const CITY_MIN_HEIGHT = 2.0;
const COAST_BLEND_WIDTH = 110;
// Increased max height to accommodate inland rise
const MAX_ISLAND_HEIGHT = 45.0;
const SAND_COLOR = new THREE.Color(0.68, 0.64, 0.55);
const GRASS_COLOR = new THREE.Color(0.34, 0.46, 0.32);
const SHALLOW_WATER_COLOR = new THREE.Color(0x1f4f59);

const HARBOR_GROUND_HEIGHT = 1;
const HARBOR_COAST_PADDING = 36;
const HARBOR_LONGITUDINAL_PADDING = 12;
const HARBOR_SLOPE_WIDTH = 6;
const HARBOUR_RADIUS = HARBOR_WATER_RADIUS;
const HARBOUR_TARGET_DEPTH = 2;
const ISLAND_CENTER = new THREE.Vector2(AGORA_CENTER_3D.x, AGORA_CENTER_3D.z);

// New Mainland/Coastal Constants
const INLAND_ELEVATION_SCALE = 35.0; // How high the hills go in the west
const TERRAIN_SIZE = 420; // Matches createTerrain size

function computeCoastData(x, z) {
  // Original logic was radial. New logic is directional.
  // We still want "coast" logic to handle the fading into water at the edges of our playable square,
  // BUT only on the North, South, and East sides?
  // Actually, "Mainland" means West continues as land.
  // East is sea.

  // Let's define the "Coast" as a line roughly at X = +100?
  // Or simply:
  // West (-X): Land.
  // East (+X): Sea.

  // However, the game logic often relies on "distanceFromCenter" for blending.
  // Let's adapt it.

  // We want the 'island' feel to be removed.
  // Instead, we compute a 'distanceToOpenSea'.

  // Let's treat the playable area as a peninsula or coastal strip.

  // Existing logic fallback:
  const dx = x - ISLAND_CENTER.x;
  const dz = z - ISLAND_CENTER.z;
  const distanceFromCenter = Math.hypot(dx, dz);

  // We want to fade to sea level ONLY in the +X (East) direction,
  // and maybe +/- Z (North/South) if we want a peninsula shape.
  // If we want a straight coastline, we rely on X.

  // Let's keep the North/South boundaries fading to water to keep the map contained,
  // but ensure West stays solid (no fade).

  // If X < -100 (West), we are "inland". The "coast" is far away (effectively infinite distance from coast).
  // If X > 100 (East), we are "at sea".

  // We'll synthesize a 'virtual distance' that preserves the existing fade logic where we want it (N, S, E)
  // but suppresses it in the W.

  // Calculate polar angle. East = 0, West = PI.
  const angle = Math.atan2(dz, dx);

  // We want to suppress fade if angle is near PI (West).
  // Let's create a 'westFactor' which is 1.0 at West and 0.0 at East.
  const westFactor = 0.5 * (1.0 - Math.cos(angle)); // 0 at angle 0 (East), 1 at angle PI (West).

  // Modify the effective distance used for coast calculations.
  // If we are looking West, we pretend we are close to the center (safe from coast fade).

  let modifiedDist = distanceFromCenter;

  // Strong bias: If x is negative (West), reduce distance drastically.
  if (x < 0) {
      modifiedDist *= 0.2; // effectively never reaches coastStart
  } else {
      // In the East, we let it fade normally, or even accelerate it?
      // Let's keep it normal so we have a beach at the East edge of the terrain square.
  }

  const coastStart = Math.max(ISLAND_RADIUS - COAST_BLEND_WIDTH, 0);
  const rawT = (modifiedDist - coastStart) / COAST_BLEND_WIDTH;
  const t = THREE.MathUtils.clamp(rawT, 0, 1);
  const fade = THREE.MathUtils.smoothstep(0, 1, t);

  return { distanceFromCenter, coastStart, rawT, t, fade };
}

function applyHarbourCarve(x, z, seaLevel, height) {
  const dx = x - HARBOR_CENTER.x;
  const dz = z - HARBOR_CENTER.y;
  const distance = Math.hypot(dx, dz);

  if (distance >= HARBOUR_RADIUS) return height;

  const t = THREE.MathUtils.clamp(1 - distance / HARBOUR_RADIUS, 0, 1);
  const blend = t * t;
  const targetHeight = seaLevel - HARBOUR_TARGET_DEPTH;

  return THREE.MathUtils.lerp(height, targetHeight, blend);
}

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

function getElevation(x, z, seaLevel, coastData = null) {
  const oceanHeight = seaLevel + OCEAN_DEPTH;
  const cityHeight = seaLevel + CITY_HEIGHT;

  // 1. Base Z-based height (Ocean/City Step)
  // We keep this to ensure the water/harbor transition in Z is handled?
  // Actually, we want a general West->East slope.

  let baseHeight = cityHeight;

  // Apply the directional WEST BIAS
  // Normalize X into range [-1...1] roughly over the terrain half-size
  const halfSize = TERRAIN_SIZE / 2;
  const xNorm = THREE.MathUtils.clamp(-x / halfSize, 0, 1); // 0 at center, 1 at West edge

  // Bias curve: x^1.5 for smooth start
  const westBias = Math.pow(xNorm, 1.5) * INLAND_ELEVATION_SCALE;

  baseHeight += westBias;

  // 2. Noise
  const noise = gradientNoise(x * NOISE_SCALE, z * NOISE_SCALE) * NOISE_AMPLITUDE;

  // Attenuate noise near coast (which is now mostly East/North/South)
  const coast = coastData ?? computeCoastData(x, z);
  const coastalNoiseAttenuation = 1 - THREE.MathUtils.smoothstep(0.25, 1.0, coast.t);
  const shapedNoise = noise * (0.4 + coastalNoiseAttenuation * 0.6);

  let height = baseHeight + shapedNoise;

  // 3. Carves and Flattening
  height = applyHarbourCarve(x, z, seaLevel, height);
  height = clampHarborBandHeight(x, z, seaLevel, height);

  // Agora flattening
  const agoraDist = Math.hypot(x - AGORA_CENTER_3D.x, z - AGORA_CENTER_3D.z);
  const AGORA_FLAT_RADIUS = 80;
  const AGORA_BLEND_RADIUS = 120;
  if (agoraDist < AGORA_BLEND_RADIUS) {
    const targetY = Math.max(AGORA_CENTER_3D.y, height); // Don't lower terrain for Agora if hill is higher?
    // Actually Agora needs to be flat.
    // But if we raised the land in the West, we should ensure Agora (which is central/west) isn't buried?
    // AGORA_CENTER_3D is at (-12, 0, 12) roughly? No, let's check locations.js in memory if possible.
    // Assuming Agora is the reference 'city' height.

    // We force Agora to be at its defined height, blending out.
    // If the West Bias raises the terrain significantly at the Agora, we might need to adjust.
    // AGORA is usually near (0,0,0) or slightly offset.
    // If x ~ 0, westBias ~ 0. So Agora stays low. Good.

    const targetYfixed = AGORA_CENTER_3D.y;
    let blend = 1.0;
    if (agoraDist > AGORA_FLAT_RADIUS) {
      blend = 1.0 - (agoraDist - AGORA_FLAT_RADIUS) / (AGORA_BLEND_RADIUS - AGORA_FLAT_RADIUS);
      blend = THREE.MathUtils.smoothstep(blend, 0, 1);
    }
    height = THREE.MathUtils.lerp(height, targetYfixed, blend);
  }

  // Avenue flattening
  const distFromAxis = Math.abs(x - AGORA_CENTER_3D.x);
  const AVENUE_FLAT_WIDTH = 50;
  const AVENUE_BLEND_WIDTH = 80;
  if (z > -200 && z < 200 && distFromAxis < AVENUE_BLEND_WIDTH) {
     const targetY = AGORA_CENTER_3D.y;
     let blend = 1.0;
     if (distFromAxis > AVENUE_FLAT_WIDTH) {
        blend = 1.0 - (distFromAxis - AVENUE_FLAT_WIDTH) / (AVENUE_BLEND_WIDTH - AVENUE_FLAT_WIDTH);
        blend = THREE.MathUtils.smoothstep(blend, 0, 1);
     }
     height = THREE.MathUtils.lerp(height, targetY, blend);
  }

  // 4. Coastal Fade (East/North/South)
  // We apply the fade calculated in computeCoastData.
  // In the West, coast.fade should be 0 (no fade) due to our modifiedDist logic.
  if (coast.distanceFromCenter > coast.coastStart) {
    const coastalTarget = seaLevel - 2.0;
    // We only fade down if we are NOT in the high inland area.
    // But our coast logic already protects the West.
    height = THREE.MathUtils.lerp(height, coastalTarget, coast.fade);
    const edgeSink = THREE.MathUtils.smoothstep(0.82, 1.0, coast.t);
    height = THREE.MathUtils.lerp(height, coastalTarget - 0.6, edgeSink);
  }

  // Cap max height
  height = Math.min(height, seaLevel + MAX_ISLAND_HEIGHT);

  // Minimum city height check (mostly for flat areas)
  // Ensure we don't accidentally dip below sea level in the city unless carved
  // (logic from original file preserved but careful with bias)
  if (z > CITY_BOUNDARY_Z && height < seaLevel + CITY_MIN_HEIGHT && agoraDist > AGORA_BLEND_RADIUS) {
     // Be careful not to force up the harbor water
     // Harbor carve happens above.
     // This check might be too aggressive if we want a beach in the East.
     // Let's refine: "If inland and low, raise."
     // Current logic is simple z-split.
     // Let's rely on baseHeight + noise.
  }

  return height;
}

function createSkirtGeometry(sourceGeometry, seaLevel) {
  const posAttr = sourceGeometry.attributes.position;
  const widthSegments = sourceGeometry.parameters.widthSegments;
  const heightSegments = sourceGeometry.parameters.heightSegments;

  const w = widthSegments;
  const h = heightSegments;
  const stride = w + 1;

  // Indices of boundary vertices in CCW order around the perimeter
  const boundaryIndices = [];

  // Top edge (row 0): (0,0) -> (w,0)
  for (let x = 0; x < w; x++) boundaryIndices.push(0 * stride + x);

  // Right edge (col w): (w,0) -> (w,h)
  for (let y = 0; y < h; y++) boundaryIndices.push(y * stride + w);

  // Bottom edge (row h): (w,h) -> (0,h)
  for (let x = w; x > 0; x--) boundaryIndices.push(h * stride + x);

  // Left edge (col 0): (0,h) -> (0,0)
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

    // Create quad for this segment
    // Tri 1: Top-Curr, Bottom-Curr, Top-Next
    vertices.push(x1, y1, z1);
    vertices.push(x1, y1, bottomZ);
    vertices.push(x2, y2, z2);

    colors.push(topColor.r, topColor.g, topColor.b);
    colors.push(bottomColor.r, bottomColor.g, bottomColor.b);
    colors.push(topColor.r, topColor.g, topColor.b);

    // Tri 2: Top-Next, Bottom-Curr, Bottom-Next
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

  // Create skirt to hide edges
  const skirtGeometry = createSkirtGeometry(geometry, seaLevel);
  const skirtMaterial = new THREE.MeshStandardMaterial({
     vertexColors: true,
     side: THREE.FrontSide,
     roughness: 1.0,
     metalness: 0.0
  });
  const skirt = new THREE.Mesh(skirtGeometry, skirtMaterial);
  skirt.name = "TerrainSkirt";
  skirt.rotation.x = -Math.PI / 2;
  scene.add(skirt);

  let terrainMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.94,
    metalness: 0.0,
    vertexColors: true,
    side: THREE.FrontSide,
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
