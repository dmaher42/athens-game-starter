import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  CITY_CHUNK_CENTER,
  CITY_CHUNK_SIZE,
  CITY_SEED,
  SEA_LEVEL_Y,
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
import { addFoundationPad } from "./foundations.js";
import { applyTextureBudgetToObject } from "../utils/textureBudget.js";
import { loadDistrictRules, resolveDistrictAt, spacingForDensity } from "./districtRules.js";
import { DEBUG_FLAGS } from "../debug/flags.js";
import { roadNoise } from "../utils/noise.js";

const WALL_COLOR_PRESETS = ["#f4d6a0", "#fbe3b1", "#fdd3c6", "#fff9ed", "#e6cbb2"];
const ROOF_COLOR_PRESETS = ["#b4472c", "#c05621", "#d66f2c"];

function pickRandom(array, rng) {
  if (!Array.isArray(array) || array.length === 0) return null;
  const index = Math.floor(rng() * array.length) % array.length;
  return array[index];
}

function sampleHeight(terrain, x, z, fallback) {
  const getter = terrain?.userData?.getHeightAt;
  if (typeof getter === "function") {
    const height = getter(x, z);
    if (Number.isFinite(height)) return height;
  }
  return fallback;
}

function isWithinHarborWater(x, z, buffer = 0) {
  const { west, east, north, south } = HARBOR_WATER_BOUNDS || {};
  if (![west, east, north, south].every(Number.isFinite)) return false;

  const bufferedWest = west - buffer;
  const bufferedEast = east + buffer;
  const bufferedNorth = north - buffer;
  const bufferedSouth = south + buffer;

  return (
    x >= bufferedWest &&
    x <= bufferedEast &&
    z >= bufferedNorth &&
    z <= bufferedSouth
  );
}

// Draw a visible road mesh along a curve segment
function createVisibleRoadSegment(p1, p2, w1, w2, collect) {
  const half1 = w1 * 0.5;
  const half2 = w2 * 0.5;
  const dir = p2.clone().sub(p1).normalize();
  // Perpendicular vector (-z, 0, x)
  const side = new THREE.Vector3(-dir.z, 0, dir.x);
  
  const v1 = p1.clone().addScaledVector(side, half1);
  const v2 = p1.clone().addScaledVector(side, -half1);
  const v3 = p2.clone().addScaledVector(side, half2);
  const v4 = p2.clone().addScaledVector(side, -half2);

  const positions = new Float32Array([
    v1.x, v1.y, v1.z,  v2.x, v2.y, v2.z,  v3.x, v3.y, v3.z,
    v2.x, v2.y, v2.z,  v4.x, v4.y, v4.z,  v3.x, v3.y, v3.z
  ]);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  collect.push(geometry);
}

// --- ARCHETYPE GEOMETRIES ---

function createGableRoofGeometry() {
  // Triangular prism lying on Z axis (length along Z), triangle in XY
  // But our standard building fits in a Box(1,1,1) centered at 0?
  // Our instancing logic scales a 1x1x1 box.
  // We want a roof that fits on top of a 1x1 box.
  // The 'roof' scale in instancing is (width, roofHeight, depth).

  // A standard gable roof along Z axis (depth):
  // Vertices:
  // Top Ridge: (0, 0.5, 0.5) to (0, 0.5, -0.5) relative to roof center?
  // Base: (-0.5, -0.5, 0.5), (0.5, -0.5, 0.5), (0.5, -0.5, -0.5), (-0.5, -0.5, -0.5)
  // Let's assume the roof geometry is normalized to fit in a unit cube 1x1x1,
  // where Y goes from 0 to 1.

  const positions = [
    // Front Face (Triangle)
    -0.5, 0, 0.5,  0.5, 0, 0.5,  0, 1, 0.5,
    // Back Face (Triangle)
    0.5, 0, -0.5, -0.5, 0, -0.5, 0, 1, -0.5,
    // Left Face (Quad -> 2 Tris)
    -0.5, 0, -0.5, -0.5, 0, 0.5, 0, 1, 0.5,
    -0.5, 0, -0.5, 0, 1, 0.5,    0, 1, -0.5,
    // Right Face
    0.5, 0, 0.5,   0.5, 0, -0.5, 0, 1, -0.5,
    0.5, 0, 0.5,   0, 1, -0.5,   0, 1, 0.5,
    // Bottom (Quad)
    -0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 0, 0.5,
    -0.5, 0, -0.5, 0.5, 0, 0.5,  -0.5, 0, 0.5
  ];

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function createParapetGeometry() {
  // A rim around the top of a 1x1 box.
  // Height 1. Thickness approx 0.1?
  // Let's make it a hollow box.
  // Outer box 1x1x1. Inner hole 0.8x1x0.8.
  // We'll just build 4 walls.
  // Normalized to 1x1x1.

  const thickness = 0.15;
  const outer = 0.5;
  const inner = 0.5 - thickness;

  // Create shape for extrusion? No, manual buffer geom is faster/cleaner than dragging in ShapeUtils.
  // Just 4 boxes merged.
  const wall1 = new THREE.BoxGeometry(1, 1, thickness); // Front
  wall1.translate(0, 0.5, 0.5 - thickness/2);

  const wall2 = new THREE.BoxGeometry(1, 1, thickness); // Back
  wall2.translate(0, 0.5, -(0.5 - thickness/2));

  const wall3 = new THREE.BoxGeometry(thickness, 1, 1 - 2*thickness); // Left
  wall3.translate(-(0.5 - thickness/2), 0.5, 0);

  const wall4 = new THREE.BoxGeometry(thickness, 1, 1 - 2*thickness); // Right
  wall4.translate(0.5 - thickness/2, 0.5, 0);

  return mergeGeometries([wall1, wall2, wall3, wall4]);
}

function createCourtyardGeometry() {
  // Similar to Parapet but for the main body.
  // A hollow box 1x1x1.
  // Using the same logic as parapet, maybe just reuse?
  // Yes, a courtyard block is just walls around a center.
  // We can reuse the Parapet geometry, maybe rename it `createHollowBoxGeometry`.
  return createParapetGeometry();
}

// --- MAIN ORGANIC GENERATOR ---

export async function createCity(scene, terrain, options = {}) {
  const origin = options.origin ? options.origin.clone() : CITY_CHUNK_CENTER.clone();
  const seaLevel = Number.isFinite(options.seaLevel) ? options.seaLevel : getSeaLevelY();
  const rng = (seed) => {
    let s = seed;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff);
  };
  const random = rng(options.seed ?? CITY_SEED);

  const city = new THREE.Group();
  city.name = "HarborCity";
  scene.add(city);

  // Configuration
  const ROAD_WIDTH = 3.5;
  const BUILDING_MIN_GAP = 2.0;
  const SCATTER_ATTEMPTS = 3000;
  const MIN_DIST_FROM_ROAD = 3.5;
  const MAX_DIST_FROM_ROAD = 12.0;
  const SHORELINE_BUFFER_METERS = 6;

  const isDevEnvironment =
    (typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV)) ||
    (typeof process !== "undefined" && process.env?.NODE_ENV !== "production");

  let underwaterSkipLogCount = 0;
  const UNDERWATER_LOG_LIMIT = 5;

  const districtRules = await loadDistrictRules();

  // 1. Generate Organic Roads (The "Spine")
  const roadCurves = [];
  const roadGeometries = [];
  
  const numArteries = 5;
  for (let i = 0; i < numArteries; i++) {
    const angle = (i / numArteries) * Math.PI * 2 + (random() * 0.5);
    const start = origin.clone();
    
    const end = new THREE.Vector3(
        origin.x + Math.cos(angle) * CITY_AREA_RADIUS,
        origin.y,
        origin.z + Math.sin(angle) * CITY_AREA_RADIUS
    );

    const mid = start.clone().lerp(end, 0.5);
    mid.x += (random() - 0.5) * 40; 
    mid.z += (random() - 0.5) * 40;

    [start, mid, end].forEach(p => {
        p.y = sampleHeight(terrain, p.x, p.z, origin.y) + 0.1;
    });

    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    roadCurves.push(curve);

    const points = curve.getSpacedPoints(30);
    const perturbedPoints = [];
    const widths = [];

    for (let k = 0; k < points.length; k++) {
        const t = k / (points.length - 1);
        const tangent = curve.getTangentAt(t);
        const perp = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        const offsetVal = roadNoise(t * 5 + i * 10, CITY_SEED) * 0.8;
        const p = points[k].clone().addScaledVector(perp, offsetVal);

        p.y = sampleHeight(terrain, p.x, p.z, origin.y) + 0.1;

        perturbedPoints.push(p);

        const widthVar = 1.0 + roadNoise(t * 8 + i * 10 + 50, CITY_SEED) * 0.1;
        widths.push(ROAD_WIDTH * widthVar);
    }

    for (let j = 0; j < perturbedPoints.length - 1; j++) {
       createVisibleRoadSegment(perturbedPoints[j], perturbedPoints[j+1], widths[j], widths[j+1], roadGeometries);
    }
  }

  if (roadGeometries.length > 0) {
    const merged = mergeGeometries(roadGeometries);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x8f8676,
      roughness: 1.0, 
      metalness: 0.0,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(merged, material);
    mesh.receiveShadow = true;
    mesh.userData.noCollision = true;
    city.add(mesh);
  }

  // 2. Scatter Buildings
  const buildingPlacements = {
    gable: [],
    flat: [],
    courtyard: []
  };

  const placedPoints = [];

  for (let i = 0; i < SCATTER_ATTEMPTS; i++) {
    const r = Math.sqrt(random()) * CITY_AREA_RADIUS;
    const theta = random() * Math.PI * 2;
    const x = origin.x + r * Math.cos(theta);
    const z = origin.z + r * Math.sin(theta);

    let bestDist = Infinity;
    let bestTangent = null;
    
    for (const road of roadCurves) {
        const samples = road.getSpacedPoints(10);
        for (let k=0; k<samples.length; k++) {
            const pt = samples[k];
            const d = Math.hypot(x - pt.x, z - pt.z);
            if (d < bestDist) {
                bestDist = d;
                const tVal = k / (samples.length - 1);
                bestTangent = road.getTangentAt(tVal);
            }
        }
    }

    if (bestDist < MIN_DIST_FROM_ROAD) continue;
    if (bestDist > MAX_DIST_FROM_ROAD) continue;

    // Determine archetype based on random seed (and maybe district logic)
    // 60% Gable, 25% Flat, 15% Courtyard
    const typeRoll = random();
    let type = 'gable';
    if (typeRoll > 0.6) type = 'flat';
    if (typeRoll > 0.85) type = 'courtyard';

    // Size rules
    let width = 3.5 + random() * 2.5;
    let depth = 3.5 + random() * 2.5;
    if (type === 'courtyard') {
        width += 2; // Courtyards are bigger
        depth += 2;
    }
    const radius = Math.max(width, depth) * 0.6;

    let overlap = false;
    for (const p of placedPoints) {
        const d = Math.hypot(x - p.x, z - p.z);
        if (d < (radius + p.radius + BUILDING_MIN_GAP)) {
            overlap = true;
            break;
        }
    }
    if (overlap) continue;

    const fallbackHeight =
      (Number.isFinite(seaLevel) ? seaLevel : SEA_LEVEL_Y) + MIN_ABOVE_SEA;
    const y = sampleHeight(terrain, x, z, fallbackHeight);
    const seaBaseline = Number.isFinite(SEA_LEVEL_Y) ? SEA_LEVEL_Y : seaLevel;
    const underwaterThreshold = (Number.isFinite(seaBaseline) ? seaBaseline : 0) + 0.05;

    if (!Number.isFinite(y) || y <= underwaterThreshold) {
      if (isDevEnvironment && underwaterSkipLogCount < UNDERWATER_LOG_LIMIT) {
        console.info("[city] skipped lot: underwater", { x, z, y });
        underwaterSkipLogCount++;
      }
      continue;
    }

    const inHarborBuffer = isWithinHarborWater(x, z, SHORELINE_BUFFER_METERS);
    const isWaterfrontTagged = options?.lotTag === "harbor" || options?.lotTag === "pier";
    if (inHarborBuffer && !isWaterfrontTagged) continue;

    const roadAngle = Math.atan2(bestTangent.x, bestTangent.z);
    const rotation = roadAngle + (random() > 0.5 ? Math.PI/2 : 0) + (random()-0.5)*0.2;

    const distRule = resolveDistrictAt(terrain, districtRules, x, z, 'residential');

    const roofPalette = (Array.isArray(distRule.roofColors) && distRule.roofColors.length > 0)
        ? distRule.roofColors
        : ROOF_COLOR_PRESETS;

    const [minH, maxH] = Array.isArray(distRule.heightRange) ? distRule.heightRange : [3, 4.5];
    const wH = minH + random() * (maxH - minH);

    buildingPlacements[type].push({
        x, y: y + 0.05, z,
        rotation,
        width, depth,
        wallHeight: wH,
        roofHeight: 1.2 + random() * 0.4,
        color: new THREE.Color(pickRandom(WALL_COLOR_PRESETS, random)),
        roofColor: new THREE.Color(pickRandom(roofPalette, random))
    });

    placedPoints.push({ x, z, radius });
  }

  // 3. Instantiate Buildings

  // Materials
  // Plaster for walls (light cream/white)
  const plasterMat = new THREE.MeshStandardMaterial({
      color: 0xfffcf5, // Very light warm cream
      roughness: 0.9,
      vertexColors: true
  });

  // Terracotta for roofs (red/orange)
  const terracottaMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Tinted by vertex color
      roughness: 0.8,
      vertexColors: true
  });

  // Geometries
  // Type A: Gable
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  boxGeo.translate(0, 0.5, 0); // Pivot at bottom

  const gableRoofGeo = createGableRoofGeometry();
  // Pivot is already at bottom (0) of geometry if constructed 0..1 Y

  // Type B: Flat (Parapet)
  // Wall is Box. Roof is Flat (invisible or just top of box).
  // Parapet is a rim.
  const parapetGeo = createParapetGeometry();
  // parapetGeo ranges Y=0..1.

  // Type C: Courtyard
  // Wall is Hollow Box (Parapet Geometry scaled up for body).
  const hollowBoxGeo = createCourtyardGeometry();
  hollowBoxGeo.translate(0, 0.5, 0); // Need to shift if not already shifted?
  // Wait, my helper created it centered at Y=0.5 but range 0..1?
  // Helper: translate(0, 0.5, ...) -> range 0..1. Center is 0.5.
  // Wait, createParapetGeometry:
  //   wall1.translate(0, 0.5, ...) -> BoxGeometry(1,1,1) is centered at 0. So -0.5 to 0.5.
  //   Translated +0.5 -> 0 to 1.
  // So Parapet Geo is 0 to 1 Y.

  // Instancing Function
  const createInstancedMesh = (geo, mat, count) => {
      const mesh = new THREE.InstancedMesh(geo, mat, count);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
  }

  const dummy = new THREE.Object3D();

  // --- TYPE A: GABLE ---
  const listA = buildingPlacements.gable;
  if (listA.length > 0) {
      const walls = createInstancedMesh(boxGeo, plasterMat, listA.length);
      const roofs = createInstancedMesh(gableRoofGeo, terracottaMat, listA.length);

      listA.forEach((b, i) => {
          // Walls
          dummy.position.set(b.x, b.y, b.z);
          dummy.rotation.set(0, b.rotation, 0);
          dummy.scale.set(b.width, b.wallHeight, b.depth);
          dummy.updateMatrix();
          walls.setMatrixAt(i, dummy.matrix);
          walls.setColorAt(i, b.color);

          // Roofs
          // Position at top of wall
          dummy.position.y += b.wallHeight;
          // Scale roof to match width/depth + overhang
          dummy.scale.set(b.width + 0.6, b.roofHeight, b.depth + 0.6);
          dummy.updateMatrix();
          roofs.setMatrixAt(i, dummy.matrix);
          roofs.setColorAt(i, b.roofColor);
      });

      city.add(walls);
      city.add(roofs);
  }

  // --- TYPE B: FLAT (PARAPET) ---
  const listB = buildingPlacements.flat;
  if (listB.length > 0) {
      const walls = createInstancedMesh(boxGeo, plasterMat, listB.length);
      // Optional: Add a rim?
      // Let's use the Parapet geometry as a "cap" or just scale the wall differently?
      // "House B (flat roof + parapet): Base box + slightly taller thin top rim."
      const rims = createInstancedMesh(parapetGeo, plasterMat, listB.length);

      listB.forEach((b, i) => {
          // Walls
          dummy.position.set(b.x, b.y, b.z);
          dummy.rotation.set(0, b.rotation, 0);
          dummy.scale.set(b.width, b.wallHeight, b.depth);
          dummy.updateMatrix();
          walls.setMatrixAt(i, dummy.matrix);
          walls.setColorAt(i, b.color);

          // Rim
          // Sit on top of wall? Or be the top part of the wall?
          // Let's make it sit on top.
          dummy.position.y += b.wallHeight;
          dummy.scale.set(b.width, 0.6, b.depth); // 0.6m high parapet
          dummy.updateMatrix();
          rims.setMatrixAt(i, dummy.matrix);
          rims.setColorAt(i, b.color); // Same color as wall
      });

      city.add(walls);
      city.add(rims);
  }

  // --- TYPE C: COURTYARD ---
  const listC = buildingPlacements.courtyard;
  if (listC.length > 0) {
      // Use hollow box for walls
      // createCourtyardGeometry returns geometry 0..1 Y
      const walls = createInstancedMesh(hollowBoxGeo, plasterMat, listC.length);

      // Roof for courtyard? "4 thin wall boxes forming a ring".
      // Roof could be flat (just a rim) or pitched.
      // Instructions: "House C... inner empty courtyard".
      // Usually courtyard houses have pitched roofs on the wings.
      // Let's add a "Gable Ring" roof? Too complex for procedural geometry right now?
      // Let's use the Flat Roof + Parapet style for courtyard for now, or use 4 Gable Roofs?
      // Simpler: Just make it a flat roof courtyard (Parapet style).
      // Or: 4 separate gable roofs?
      // To keep geometry count low, let's use a "Hollow Gable" geometry?
      // Too much math for now. Let's do Flat Roof Courtyard with Parapet.
      // So just walls + rim.
      const rims = createInstancedMesh(parapetGeo, plasterMat, listC.length);

      listC.forEach((b, i) => {
          dummy.position.set(b.x, b.y, b.z);
          dummy.rotation.set(0, b.rotation, 0);
          dummy.scale.set(b.width, b.wallHeight, b.depth);
          dummy.updateMatrix();
          walls.setMatrixAt(i, dummy.matrix);
          walls.setColorAt(i, b.color);

          dummy.position.y += b.wallHeight;
          dummy.scale.set(b.width, 0.5, b.depth);
          dummy.updateMatrix();
          rims.setMatrixAt(i, dummy.matrix);
          rims.setColorAt(i, b.color);
      });

      city.add(walls);
      city.add(rims);
  }

  // 4. Add Organic Trees (Scatter in gaps)
  const treeCount = Math.floor((listA.length + listB.length + listC.length) * 0.8);
  if (treeCount > 0) {
      const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, 1.5, 5);
      trunkGeo.translate(0, 0.75, 0);
      const leafGeo = new THREE.DodecahedronGeometry(1.0);
      leafGeo.translate(0, 2.0, 0);
      
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });
      
      const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
      const leaves = new THREE.InstancedMesh(leafGeo, leafMat, treeCount);
      trunks.castShadow = true; leaves.castShadow = true;
      
      let tIdx = 0;
      const dummyT = new THREE.Object3D();
      
      for(let i=0; i < SCATTER_ATTEMPTS && tIdx < treeCount; i++) {
          const r = Math.sqrt(random()) * CITY_AREA_RADIUS;
          const th = random() * Math.PI * 2;
          const tx = origin.x + r * Math.cos(th);
          const tz = origin.z + r * Math.sin(th);
          
          let clear = true;
          for (const p of placedPoints) {
              if (Math.hypot(tx-p.x, tz-p.z) < p.radius + 1.5) { clear = false; break; }
          }
          if (!clear) continue;
          
          if (Math.hypot(tx-origin.x, tz-origin.z) < 5.0) continue; 

          const y = sampleHeight(terrain, tx, tz, -999);
          if (y > seaLevel + 1.5) {
              dummyT.position.set(tx, y, tz);
              dummyT.rotation.y = random() * Math.PI;
              const s = 0.7 + random() * 0.6;
              dummyT.scale.set(s,s,s);
              dummyT.updateMatrix();
              
              trunks.setMatrixAt(tIdx, dummyT.matrix);
              leaves.setMatrixAt(tIdx, dummyT.matrix);
              tIdx++;
          }
      }
      
      trunks.count = tIdx;
      leaves.count = tIdx;
      trunks.instanceMatrix.needsUpdate = true;
      leaves.instanceMatrix.needsUpdate = true;
      city.add(trunks);
      city.add(leaves);
  }

  applyTextureBudgetToObject(city, scene?.userData?.renderer);
  return city;
}

export function updateCityLighting(city, nightFactor = 0, opts = {}) {
  if (!city) return;
}

export function createHillCity(scene, terrain, curve, opts = {}) {
  const group = new THREE.Group();
  group.name = "HillCity";
  scene.add(group);
  return group;
}
