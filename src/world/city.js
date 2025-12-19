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
import { makeTiledPBR } from "../materials/pbr-utils.js"; // Import texture helper
import { DEBUG_FLAGS } from "../debug/flags.js";
import { queueSceneInteractable } from "./interactions.js";
import { buildHouseBlock } from "../features/blocks.js";
import { HARBOR_ZONE, inHarborBand } from "./cityPlan.js";
import { buildPromenadePath } from "./harbor.js";

const WALL_COLOR_PRESETS = ["#f4d6a0", "#fbe3b1", "#fdd3c6", "#fff9ed", "#e6cbb2"];
const ROOF_COLOR_PRESETS = ["#b4472c", "#c05621", "#d66f2c"];

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

export async function createCity(scene, terrain, options = {}) {
  const origin = options.origin ? options.origin.clone() : CITY_CHUNK_CENTER.clone();
  const seaLevel = Number.isFinite(options.seaLevel) ? options.seaLevel : getSeaLevelY();
  const rng = (seed) => {
    let s = seed;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff);
  };
  const random = rng(options.seed ?? CITY_SEED);
  
  const gridSize = options.gridSize ?? CITY_CHUNK_SIZE.clone();
  const spacingX = options.spacingX ?? 11;
  const spacingZ = options.spacingZ ?? 11;
  const countX = Math.floor(gridSize.x / spacingX);
  const countZ = Math.floor(gridSize.y / spacingZ);
  const halfX = (countX * spacingX) * 0.5;
  const halfZ = (countZ * spacingZ) * 0.5;
  const startX = origin.x - halfX;
  const startZ = origin.z - halfZ;

  const roadGeometries = [];
  const roadSegments = [];

  const city = new THREE.Group();
  city.name = "HarborCity";
  scene.add(city);

  const roadNodes = [];

  const warpFreq = 0.08;
  const warpAmp = 6.0;
  const getWarp = (x, z) => {
    const wx = Math.sin(x * warpFreq) * Math.cos(z * warpFreq * 0.7) * warpAmp;
    const wz = Math.cos(x * warpFreq * 0.8) * Math.sin(z * warpFreq) * warpAmp;
    return { x: wx, z: wz };
  };

  for (let iz = 0; iz <= countZ; iz++) {
    const row = [];
    for (let ix = 0; ix <= countX; ix++) {
      const baseX = startX + ix * spacingX;
      const baseZ = startZ + iz * spacingZ;
      const warp = getWarp(ix, iz);

      const x = baseX + warp.x;
      const z = baseZ + warp.z;

      const y = sampleHeight(terrain, x, z, -999);
      if (y < seaLevel + 1.0) {
        row.push(null);
      } else {
        row.push(new THREE.Vector3(x, y, z));
      }
    }
    roadNodes.push(row);
  }

  const recordSegment = (p1, p2, type = 'local') => {
    roadSegments.push({ ax: p1.x, az: p1.z, bx: p2.x, bz: p2.z, type });
    createVisibleRoad(p1, p2, city, terrain, {
      collectGeometries: roadGeometries,
      width: type === 'avenue' ? 4.5 : 2.8,
      color: type === 'avenue' ? 0x2f2f2f : 0x3a3a3a
    });
  };

  for (let iz = 0; iz <= countZ; iz++) {
    const isAvenue = (iz === Math.floor(countZ / 2));
    for (let ix = 0; ix < countX; ix++) {
      const p1 = roadNodes[iz][ix];
      const p2 = roadNodes[iz][ix + 1];
      if (p1 && p2) recordSegment(p1, p2, isAvenue ? 'avenue' : 'local');
    }
  }

  for (let ix = 0; ix <= countX; ix++) {
    const isAvenue = (ix === Math.floor(countX / 2));
    for (let iz = 0; iz < countZ; iz++) {
      const p1 = roadNodes[iz][ix];
      const p2 = roadNodes[iz + 1][ix];
      if (p1 && p2) recordSegment(p1, p2, isAvenue ? 'avenue' : 'local');
    }
  }

  if (roadGeometries.length > 0) {
    const merged = mergeGeometries(roadGeometries);
    const material = new THREE.MeshStandardMaterial({
      color: 0x8f8676,
      roughness: 1.0,
      metalness: 0.0
    });
    const mesh = new THREE.Mesh(merged, material);
    mesh.receiveShadow = true;
    mesh.renderOrder = 1;
    city.add(mesh);
  }

  // --- STEP 2: Place Buildings with Materials and Variation ---

  const buildingPlacements = [];
  const minRoadDist = 2.5;
  const maxRoadDist = 8.0;

  // Load PBR Texture for walls (Phase 1 Fix)
  const wallMaterial = await makeTiledPBR("textures/marble", {
    repeat: { x: 0.25, y: 0.25 } // Scale texture nicely
  }) || new THREE.MeshStandardMaterial({ color: 0xe0d0b0 });

  wallMaterial.roughness = 0.9; // Looks like rough plaster/stone
  wallMaterial.vertexColors = true; // Blend with our color tints

  for (let iz = 0; iz < countZ; iz++) {
    for (let ix = 0; ix < countX; ix++) {

      const cellAttempts = 2;

      for (let k = 0; k < cellAttempts; k++) {
        const node = roadNodes[iz][ix];
        if (!node) continue;

        const jx = (random() * 0.8 + 0.1) * spacingX;
        const jz = (random() * 0.8 + 0.1) * spacingZ;
        const cx = node.x + jx;
        const cz = node.z + jz;

        let nearest = null;
        let minDistSq = Infinity;

        for (const seg of roadSegments) {
          if (Math.abs(cx - seg.ax) > 20 && Math.abs(cx - seg.bx) > 20) continue;

          const info = getDistanceToSegment(cx, cz, seg.ax, seg.az, seg.bx, seg.bz);
          if (info.distSq < minDistSq) {
            minDistSq = info.distSq;
            nearest = { ...info, seg };
          }
        }

        const dist = Math.sqrt(minDistSq);
        if (!nearest || dist < minRoadDist || dist > maxRoadDist) continue;

        const dx = nearest.seg.bx - nearest.seg.ax;
        const dz = nearest.seg.bz - nearest.seg.az;
        const roadAngle = Math.atan2(dx, dz);

        const toPointX = cx - nearest.seg.ax;
        const toPointZ = cz - nearest.seg.az;
        const cross = dx * toPointZ - dz * toPointX;
        const side = cross > 0 ? 1 : -1;

        const rotation = roadAngle + (side > 0 ? -Math.PI/2 : Math.PI/2);
        const setback = 3.5 + random() * 1.5;

        const projX = nearest.projX;
        const projZ = nearest.projZ;
        const normalX = cx - projX;
        const normalZ = cz - projZ;
        const len = Math.hypot(normalX, normalZ);

        const finalX = projX + (normalX / len) * setback;
        const finalZ = projZ + (normalZ / len) * setback;

        const lotInfo = evaluateLot({
          terrain,
          centerX: finalX,
          centerZ: finalZ,
          width: 4, depth: 4,
          rotation,
          maxSlope: 0.3
        });

        if (lotInfo) {
          const w = 4 + random() * 2;
          const d = 5 + random() * 2;
          const h = 3 + random() * 1.5;
          const color = new THREE.Color(pickRandom(WALL_COLOR_PRESETS, random));
          const roofColor = new THREE.Color(pickRandom(ROOF_COLOR_PRESETS, random));

          // Main Building
          buildingPlacements.push({
            x: finalX,
            y: lotInfo.height + 0.05,
            z: finalZ,
            rotation: rotation,
            width: w,
            depth: d,
            wallHeight: h,
            roofHeight: 1.5,
            type: 'main',
            color,
            roofColor
          });

          // Phase 2: Add "Annex" (Side building) for irregularity
          if (random() > 0.4) {
             const annexW = w * (0.4 + random() * 0.3);
             const annexD = d * (0.4 + random() * 0.3);
             const annexH = h * 0.7;

             // Place on left or right side
             const sideOffset = (w/2 + annexW/2 - 0.2) * (random() > 0.5 ? 1 : -1);
             const forwardOffset = (random() - 0.5) * (d - annexD); // Slide along side

             // Local to world transform roughly
             const cosR = Math.cos(rotation);
             const sinR = Math.sin(rotation);
             const worldOffsetX = sideOffset * cosR - forwardOffset * sinR;
             const worldOffsetZ = sideOffset * sinR + forwardOffset * cosR;

             buildingPlacements.push({
                x: finalX + worldOffsetX,
                y: lotInfo.height + 0.05,
                z: finalZ + worldOffsetZ,
                rotation: rotation,
                width: annexW,
                depth: annexD,
                wallHeight: annexH,
                roofHeight: 1.0,
                type: 'annex',
                color: color.clone().offsetHSL(0, 0, -0.05), // Slightly darker
                roofColor
             });
          }
        }
      }
    }
  }

  if (buildingPlacements.length > 0) {
    const wallGeo = new THREE.BoxGeometry(1,1,1);
    wallGeo.translate(0, 0.5, 0);

    // Proper UV mapping for walls
    // We modify UVs in the shader or assume box mapping for now,
    // but basic BoxGeometry UVs work okay if texture repeats.

    const roofGeo = new THREE.CylinderGeometry(0, 0.5, 1, 4, 1, false);
    roofGeo.rotateY(Math.PI/4);
    roofGeo.translate(0, 0.5, 0);

    const roofMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.9 });

    const walls = new THREE.InstancedMesh(wallGeo, wallMaterial, buildingPlacements.length);
    const roofs = new THREE.InstancedMesh(roofGeo, roofMat, buildingPlacements.length);
    walls.castShadow = true; walls.receiveShadow = true;
    roofs.castShadow = true; roofs.receiveShadow = true;

    const dummy = new THREE.Object3D();

    buildingPlacements.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z);
      dummy.rotation.set(0, b.rotation, 0);
      dummy.scale.set(b.width, b.wallHeight, b.depth);
      dummy.updateMatrix();
      walls.setMatrixAt(i, dummy.matrix);
      walls.setColorAt(i, b.color);

      dummy.position.y += b.wallHeight;
      dummy.scale.set(b.width * 1.1, b.roofHeight, b.depth * 1.1);
      dummy.updateMatrix();
      roofs.setMatrixAt(i, dummy.matrix);
      roofs.setColorAt(i, b.roofColor);
    });

    walls.instanceMatrix.needsUpdate = true;
    walls.instanceColor.needsUpdate = true;
    roofs.instanceMatrix.needsUpdate = true;
    roofs.instanceColor.needsUpdate = true;

    city.add(walls);
    city.add(roofs);
  }

  // --- Phase 3: Add Trees ---
  // Simple "Lollipop" trees for now to prove the concept
  const treeCount = Math.floor(buildingPlacements.length * 1.5);
  if (treeCount > 0) {
      const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 6);
      trunkGeo.translate(0, 0.75, 0);
      const leafGeo = new THREE.DodecahedronGeometry(1.2);
      leafGeo.translate(0, 2.2, 0);

      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });

      const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
      const leaves = new THREE.InstancedMesh(leafGeo, leafMat, treeCount);
      trunks.castShadow = true;
      leaves.castShadow = true;

      let treeIdx = 0;
      const dummyT = new THREE.Object3D();

      // Attempt to place trees near buildings but not inside
      for(let i=0; i<treeCount; i++) {
          const b = buildingPlacements[i % buildingPlacements.length];
          const angle = random() * Math.PI * 2;
          const dist = (b.width + b.depth)/2 + 1.5 + random() * 2.0;

          const tx = b.x + Math.cos(angle) * dist;
          const tz = b.z + Math.sin(angle) * dist;

          // Check terrain
          const y = sampleHeight(terrain, tx, tz, -999);
          if (y > getSeaLevelY() + 1.0) {
              dummyT.position.set(tx, y, tz);
              dummyT.rotation.y = random() * Math.PI;
              const s = 0.8 + random() * 0.5;
              dummyT.scale.set(s,s,s);
              dummyT.updateMatrix();

              trunks.setMatrixAt(treeIdx, dummyT.matrix);
              leaves.setMatrixAt(treeIdx, dummyT.matrix);
              treeIdx++;
          }
      }

      trunks.count = treeIdx;
      leaves.count = treeIdx;
      trunks.instanceMatrix.needsUpdate = true;
      leaves.instanceMatrix.needsUpdate = true;

      city.add(trunks);
      city.add(leaves);
  }

  return city;
}

// Restored Export: Wrapper to support existing API
export function createHillCity(scene, terrain, roadCurve, options = {}) {
  // For now, we delegate to the main createCity since the logic is unified
  return createCity(scene, terrain, options);
}

// Restored Export: Lighting Update
export function updateCityLighting(cityGroup, nightFactor, options = {}) {
  // Original logic required accessing 'Buildings' child which might be gone
  // We should adapt it or leave it as no-op if lighting isn't critical for this phase

  // No-op for now as the structure changed (using InstancedMesh 'walls' and 'roofs')
  // We can re-implement window glow later by checking for 'walls' mesh and updating materials
}
