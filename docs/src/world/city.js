import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  CITY_CHUNK_CENTER,
  CITY_CHUNK_SIZE,
  CITY_SEED,
  getSeaLevelY,
  MIN_ABOVE_SEA,
  MAX_SLOPE_DELTA,
  CITY_AREA_RADIUS,
  HARBOR_EXCLUDE_RADIUS,
  HARBOR_CENTER_3D,
  HARBOR_WATER_BOUNDS,
  HARBOR_WATER_EAST_LIMIT,
  HARBOR_SETBACKS,
  AGORA_CENTER_3D,
  ACROPOLIS_PEAK_3D,
} from "./locations.js";
import { HARBOR_FLOOR_DEPTH, getHarborShoreBlendProfile } from "./harborTerrainConfig.js";
import { createRoad } from "./roads.js";
import { addFoundationPad } from "./foundations.js";
import { applyTextureBudgetToObject } from "../utils/textureBudget.js";
import { loadDistrictRules, resolveDistrictAt, spacingForDensity } from "./districtRules.js";
import { spawnBuildingsFromPads } from "./buildingSpawner.js";
import { placeHarborLandmarks } from "./landmarks.js";
import { makeTiledPBR } from "../materials/pbr-utils.js";
import { DEBUG_FLAGS } from "../debug/flags.js";
import { queueSceneInteractable } from "./interactions.js";
import { buildHouseBlock } from "../features/blocks.js";
import { HARBOR_ZONE, inHarborBand } from "./cityPlan.js";
import { buildPromenadePath } from "./harbor.js";

const WALL_COLOR_PRESETS = ["#f4d6a0", "#fbe3b1", "#fdd3c6", "#fff9ed", "#e6cbb2"];
const ROOF_COLOR_PRESETS = ["#b4472c", "#c05621", "#d66f2c"];
const ACCENT_COLOR_PRESETS = ["#1e6fa3", "#2b8a4d", "#3a5fb0", "#784421"];

const _tmpHsl = { h: 0, s: 0, l: 0 };

function pickRandom(array, rng) {
  if (!Array.isArray(array) || array.length === 0) return null;
  const index = Math.floor(rng() * array.length) % array.length;
  return array[index];
}

// Distance from point P to segment AB
function getDistanceToSegment(px, pz, ax, az, bx, bz) {
  const l2 = (bx - ax) * (bx - ax) + (bz - az) * (bz - az);
  if (l2 === 0) return Math.hypot(px - ax, pz - az);
  let t = ((px - ax) * (bx - ax) + (pz - az) * (bz - az)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = ax + t * (bx - ax);
  const projZ = az + t * (bz - az);
  return {
    distSq: (px - projX) * (px - projX) + (pz - projZ) * (pz - projZ),
    projX,
    projZ,
    t
  };
}

function sampleHeight(terrain, x, z, fallback) {
  const getter = terrain?.userData?.getHeightAt;
  if (typeof getter === "function") {
    const height = getter(x, z);
    if (Number.isFinite(height)) {
      return height;
    }
  }
  return fallback;
}

function evaluateLot({ terrain, centerX, centerZ, width, depth, rotation, maxSlope }) {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const halfWidth = width / 2;
  const halfDepth = depth / 2;

  const sampleOffsets = [
    { x: -halfWidth, z: -halfDepth },
    { x: halfWidth, z: -halfDepth },
    { x: -halfWidth, z: halfDepth },
    { x: halfWidth, z: halfDepth },
    { x: 0, z: 0 },
  ];

  let minHeight = Infinity;
  let maxHeight = -Infinity;
  let sum = 0;

  for (const offset of sampleOffsets) {
    const rotatedX = offset.x * cos - offset.z * sin;
    const rotatedZ = offset.x * sin + offset.z * cos;
    const h = sampleHeight(terrain, centerX + rotatedX, centerZ + rotatedZ, null);
    if (!Number.isFinite(h)) return null;
    if (h < minHeight) minHeight = h;
    if (h > maxHeight) maxHeight = h;
    sum += h;
  }

  if (maxHeight - minHeight > maxSlope) return null;

  return {
    height: sum / sampleOffsets.length,
    minHeight,
    maxHeight,
  };
}

// Helper to draw roads
function createVisibleRoad(start, end, scene, terrain, options = {}) {
  const width = options.width ?? 2.8;
  const yOffset = options.yOffset ?? 0.05;
  const color = options.color ?? 0x2f2f2f;
  const collect = Array.isArray(options.collectGeometries) ? options.collectGeometries : null;

  const length = start.distanceTo(end);
  const segments = options.segments ?? Math.max(2, Math.ceil(length / 2));

  const getHeightAt = terrain?.userData?.getHeightAt?.bind(terrain?.userData) ?? null;
  if (!Number.isFinite(length) || length < 0.02) return null;

  const dir = end.clone().sub(start);
  dir.y = 0;
  const dirLenXZ = Math.hypot(dir.x, dir.z);
  const side = dirLenXZ > 1e-6 ? new THREE.Vector3(-dir.z / dirLenXZ, 0, dir.x / dirLenXZ) : new THREE.Vector3(1, 0, 0);
  const half = width * 0.5;

  const vertCount = (segments + 1) * 2;
  const positions = new Float32Array(vertCount * 3);
  const IndexArray = vertCount > 65535 ? Uint32Array : Uint16Array;
  const indices = new IndexArray(segments * 6);

  let p = 0;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = THREE.MathUtils.lerp(start.x, end.x, t);
    const z = THREE.MathUtils.lerp(start.z, end.z, t);
    let y = THREE.MathUtils.lerp(start.y, end.y, t);
    if (getHeightAt) {
      const s = getHeightAt(x, z);
      if (Number.isFinite(s)) y = s;
    }
    const center = new THREE.Vector3(x, y + yOffset, z);
    const left = center.clone().addScaledVector(side, half);
    const right = center.clone().addScaledVector(side, -half);

    // Read terrain under edges for perfect draping
    if (getHeightAt) {
      const ly = getHeightAt(left.x, left.z);
      const ry = getHeightAt(right.x, right.z);
      if (Number.isFinite(ly)) left.y = ly + yOffset;
      if (Number.isFinite(ry)) right.y = ry + yOffset;
    }

    positions[p++] = left.x; positions[p++] = left.y; positions[p++] = left.z;
    positions[p++] = right.x; positions[p++] = right.y; positions[p++] = right.z;
  }

  let k = 0;
  for (let i = 0; i < segments; i++) {
    const base = i * 2;
    indices[k++] = base; indices[k++] = base + 1; indices[k++] = base + 2;
    indices[k++] = base + 1; indices[k++] = base + 3; indices[k++] = base + 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();

  if (collect) {
    collect.push(geometry);
    return null;
  }
}

// --- MAIN CITY GENERATOR ---

export async function createCity(scene, terrain, options = {}) {
  const origin = options.origin ? options.origin.clone() : CITY_CHUNK_CENTER.clone();
  const seaLevel = Number.isFinite(options.seaLevel) ? options.seaLevel : getSeaLevelY();
  const rng = (seed) => {
    let s = seed;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff);
  };
  const random = rng(options.seed ?? CITY_SEED);

  // Layout Config
  const gridSize = options.gridSize ?? CITY_CHUNK_SIZE.clone();
  const spacingX = options.spacingX ?? 11;
  const spacingZ = options.spacingZ ?? 11;
  const countX = Math.floor(gridSize.x / spacingX);
  const countZ = Math.floor(gridSize.y / spacingZ);
  const halfX = (countX * spacingX) * 0.5;
  const halfZ = (countZ * spacingZ) * 0.5;
  const startX = origin.x - halfX;
  const startZ = origin.z - halfZ;

  // Visuals
  const roadGeometries = [];
  const roadSegments = []; // { ax, az, bx, bz, type }

  const city = new THREE.Group();
  city.name = "HarborCity";
  scene.add(city);

  // Create LotPads group
  const lotPads = new THREE.Group();
  lotPads.name = "LotPads";
  city.add(lotPads);

  // --- STEP 1: Generate Road Network (Grid + Warp) ---
  const roadNodes = []; // 2D array of {x, y, z}

  // Warp Logic
  const warpFreq = 0.08;
  const warpAmp = 6.0;
  const getWarp = (x, z) => {
    const wx = Math.sin(x * warpFreq) * Math.cos(z * warpFreq * 0.7) * warpAmp;
    const wz = Math.cos(x * warpFreq * 0.8) * Math.sin(z * warpFreq) * warpAmp;
    return { x: wx, z: wz };
  };

  // Build Grid Nodes
  for (let iz = 0; iz <= countZ; iz++) {
    const row = [];
    for (let ix = 0; ix <= countX; ix++) {
      const baseX = startX + ix * spacingX;
      const baseZ = startZ + iz * spacingZ;
      const warp = getWarp(ix, iz);

      const x = baseX + warp.x;
      const z = baseZ + warp.z;

      // Sample terrain
      const y = sampleHeight(terrain, x, z, -999);
      if (y < seaLevel + 1.0) {
        row.push(null); // Underwater
      } else {
        row.push(new THREE.Vector3(x, y, z));
      }
    }
    roadNodes.push(row);
  }

  // Draw Roads & Record Segments
  const recordSegment = (p1, p2, type = 'local') => {
    roadSegments.push({ ax: p1.x, az: p1.z, bx: p2.x, bz: p2.z, type });
    createVisibleRoad(p1, p2, city, terrain, {
      collectGeometries: roadGeometries,
      width: type === 'avenue' ? 4.5 : 2.8,
      color: type === 'avenue' ? 0x2f2f2f : 0x3a3a3a
    });
  };

  // Horizontal Roads
  for (let iz = 0; iz <= countZ; iz++) {
    const isAvenue = (iz === Math.floor(countZ / 2));
    for (let ix = 0; ix < countX; ix++) {
      const p1 = roadNodes[iz][ix];
      const p2 = roadNodes[iz][ix + 1];
      if (p1 && p2) recordSegment(p1, p2, isAvenue ? 'avenue' : 'local');
    }
  }

  // Vertical Roads
  for (let ix = 0; ix <= countX; ix++) {
    const isAvenue = (ix === Math.floor(countX / 2));
    for (let iz = 0; iz < countZ; iz++) {
      const p1 = roadNodes[iz][ix];
      const p2 = roadNodes[iz + 1][ix];
      if (p1 && p2) recordSegment(p1, p2, isAvenue ? 'avenue' : 'local');
    }
  }

  // Create merged road mesh
  if (roadGeometries.length > 0) {
    const merged = mergeGeometries(roadGeometries);
    const material = new THREE.MeshStandardMaterial({
      color: 0x8f8676, // Earthy/Dusty road color
      roughness: 1.0,
      metalness: 0.0
    });
    const mesh = new THREE.Mesh(merged, material);
    mesh.receiveShadow = true;
    mesh.renderOrder = 1;
    city.add(mesh);
  }

  // --- STEP 2: Place Buildings (Aligned to Roads) ---

  const buildingPlacements = [];
  const minRoadDist = 2.5; // From center of road
  const maxRoadDist = 8.0; // Don't place if too far from any road

  // Iterate over the "cells" (spaces between nodes)
  for (let iz = 0; iz < countZ; iz++) {
    for (let ix = 0; ix < countX; ix++) {

      // Attempt to place 1-2 buildings per cell, aligned to nearest road
      const cellAttempts = 2;

      for (let k = 0; k < cellAttempts; k++) {
        // Pick a random spot in the cell
        const node = roadNodes[iz][ix];
        if (!node) continue;

        // Jitter within the cell
        const jx = (random() * 0.8 + 0.1) * spacingX;
        const jz = (random() * 0.8 + 0.1) * spacingZ;
        const cx = node.x + jx;
        const cz = node.z + jz;

        // Find nearest road segment
        let nearest = null;
        let minDistSq = Infinity;

        for (const seg of roadSegments) {
          // Optimization: check bounds first
          if (Math.abs(cx - seg.ax) > 20 && Math.abs(cx - seg.bx) > 20) continue;

          const info = getDistanceToSegment(cx, cz, seg.ax, seg.az, seg.bx, seg.bz);
          if (info.distSq < minDistSq) {
            minDistSq = info.distSq;
            nearest = { ...info, seg };
          }
        }

        const dist = Math.sqrt(minDistSq);
        if (!nearest || dist < minRoadDist || dist > maxRoadDist) continue;

        // Calculate Alignment Rotation
        const dx = nearest.seg.bx - nearest.seg.ax;
        const dz = nearest.seg.bz - nearest.seg.az;
        const roadAngle = Math.atan2(dx, dz); // Road direction

        // Face the road (perpendicular to road direction)
        // We determine which side of the road we are on
        // Cross product 2D roughly:
        const toPointX = cx - nearest.seg.ax;
        const toPointZ = cz - nearest.seg.az;
        const cross = dx * toPointZ - dz * toPointX;
        const side = cross > 0 ? 1 : -1;

        const rotation = roadAngle + (side > 0 ? -Math.PI/2 : Math.PI/2);

        // Snap position closer to road to create "Street Wall"
        const setback = 3.5 + random() * 1.5; // Consistent setback

        // Vector from road projection towards point
        const projX = nearest.projX;
        const projZ = nearest.projZ;
        const normalX = cx - projX;
        const normalZ = cz - projZ;
        const len = Math.hypot(normalX, normalZ);

        const finalX = projX + (normalX / len) * setback;
        const finalZ = projZ + (normalZ / len) * setback;

        // Determine District
        let district = 'residential';
        const dX = finalX - AGORA_CENTER_3D.x;
        const dZ = finalZ - AGORA_CENTER_3D.z;
        const distFromAgora = Math.sqrt(dX*dX + dZ*dZ);

        if (distFromAgora < 40) district = 'sacred'; // Replaced Acropolis logic for now
        else if (distFromAgora < 90) district = 'commercial';
        else if (finalZ > 100) district = 'harbor'; // Rough Harbor zone check

        // Check Terrain
        const lotInfo = evaluateLot({
          terrain,
          centerX: finalX,
          centerZ: finalZ,
          width: 4, depth: 4,
          rotation,
          maxSlope: 0.3
        });

        if (lotInfo) {
          // Create Foundation Pad
          const pad = addFoundationPad(lotPads, finalX, lotInfo.height, finalZ, 2.5);
          pad.rotation.y = rotation;
          pad.userData.district = district;
          pad.userData.baseRotation = rotation;

          buildingPlacements.push({
            x: finalX,
            y: lotInfo.height,
            z: finalZ,
            rotation: rotation,
            district: district
          });
        }
      }
    }
  }

  // --- STEP 3: Spawn Detailed Buildings ---
  // Using the original spawner logic which reads from LotPads
  await spawnBuildingsFromPads(city, {
    seed: options.seed ?? CITY_SEED,
    seaLevel: seaLevel
  });

  // Clean up Pads if not debugging
  if (!DEBUG_FLAGS.showPads) {
     lotPads.visible = false;
  }

  // --- STEP 4: Restore Landmarks & Harbor ---
  placeHarborLandmarks({
    THREE,
    scene: city,
    lots: buildingPlacements.map(b => ({ pos: { x: b.x, y: b.y, z: b.z }, blocked: false })),
    getHeightAt: (x, z) => sampleHeight(terrain, x, z, 0)
  });

  return city;
}

// Restored Export: Wrapper to support existing API
export function createHillCity(scene, terrain, roadCurve, options = {}) {
  // For now, we delegate to the main createCity since the logic is unified
  return createCity(scene, terrain, options);
}

// Restored Export: Lighting Update
export function updateCityLighting(cityGroup, nightFactor, options = {}) {
  if (!cityGroup) return;
  const timePhase = options.timeOfDayPhase ?? 0;

  // Window Glow Logic (restored from spawner)
  const buildings = cityGroup.getObjectByName("Buildings");
  if (buildings && buildings.userData?.windowGlow) {
     const glow = buildings.userData.windowGlow;
     // Turn on windows at night
     const shouldBeActive = nightFactor > 0.4;

     if (shouldBeActive !== glow.active) {
        glow.active = shouldBeActive;
        for (const candidate of glow.candidates) {
            if (candidate.shouldGlow) {
               for (const pane of candidate.panes) {
                   if (shouldBeActive) {
                       pane.material.emissive.setHex(glow.color);
                       pane.material.emissiveIntensity = glow.intensity;
                   } else {
                       pane.material.emissive.copy(pane.baseColor);
                       pane.material.emissiveIntensity = pane.baseIntensity;
                   }
               }
            }
        }
     }
  }
}
