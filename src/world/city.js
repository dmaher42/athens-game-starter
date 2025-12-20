import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  CITY_CHUNK_CENTER,
  CITY_CHUNK_SIZE,
  CITY_SEED,
  getSeaLevelY,
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
import { makeTiledPBR } from "../materials/pbr-utils.js";
import { DEBUG_FLAGS } from "../debug/flags.js";

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

function createVisibleRoadSegment(p1, p2, width, collect) {
  const half = width * 0.5;
  const dir = p2.clone().sub(p1).normalize();
  const side = new THREE.Vector3(-dir.z, 0, dir.x);
  
  const v1 = p1.clone().addScaledVector(side, half);
  const v2 = p1.clone().addScaledVector(side, -half);
  const v3 = p2.clone().addScaledVector(side, half);
  const v4 = p2.clone().addScaledVector(side, -half);

  const positions = new Float32Array([
    v1.x, v1.y, v1.z,  v2.x, v2.y, v2.z,  v3.x, v3.y, v3.z,
    v2.x, v2.y, v2.z,  v4.x, v4.y, v4.z,  v3.x, v3.y, v3.z
  ]);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  collect.push(geometry);
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

  const ROAD_WIDTH_MAIN = 3.8;
  const ROAD_WIDTH_ALLEY = 2.4;
  const SCATTER_ATTEMPTS = 4000; // Increased for density
  const MIN_DIST_FROM_ROAD = 3.0; 
  const MAX_DIST_FROM_ROAD = 14.0;

  // 1. Generate Organic Road Network
  // Hierarchy: Arteries (Main) -> Branches (Alleys)
  const roadCurves = [];
  const roadGeometries = [];
  
  // A. Main Arteries (Radiating)
  const numArteries = 5;
  for (let i = 0; i < numArteries; i++) {
    const angle = (i / numArteries) * Math.PI * 2 + (random() * 0.4);
    const start = origin.clone();
    const end = new THREE.Vector3(
        origin.x + Math.cos(angle) * CITY_AREA_RADIUS,
        origin.y,
        origin.z + Math.sin(angle) * CITY_AREA_RADIUS
    );
    const mid = start.clone().lerp(end, 0.5);
    mid.x += (random() - 0.5) * 40; 
    mid.z += (random() - 0.5) * 40;

    [start, mid, end].forEach(p => p.y = sampleHeight(terrain, p.x, p.z, origin.y) + 0.1);

    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    curve.userData = { type: 'main' };
    roadCurves.push(curve);
  }

  // B. Branch Roads (The "Organic" Fix)
  // Spawn small winding alleys off the main roads
  const numBranches = 8;
  for (let i = 0; i < numBranches; i++) {
      const parentParams = {
          curveIndex: Math.floor(random() * numArteries),
          t: 0.3 + random() * 0.5 // Start mid-way along parent
      };
      
      const parent = roadCurves[parentParams.curveIndex];
      const start = parent.getPointAt(parentParams.t);
      const tangent = parent.getTangentAt(parentParams.t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x);
      
      // Flip side randomly
      if (random() > 0.5) normal.negate();
      
      const length = 25 + random() * 20;
      const end = start.clone().addScaledVector(normal, length);
      // Wiggle the end
      end.x += (random() - 0.5) * 15;
      end.z += (random() - 0.5) * 15;
      
      const mid = start.clone().lerp(end, 0.5);
      mid.x += (random() - 0.5) * 8;
      
      [start, mid, end].forEach(p => p.y = sampleHeight(terrain, p.x, p.z, origin.y) + 0.1);
      
      const branch = new THREE.CatmullRomCurve3([start, mid, end]);
      branch.userData = { type: 'alley' };
      roadCurves.push(branch);
  }

  // Mesh all roads
  for (const road of roadCurves) {
      const width = road.userData.type === 'main' ? ROAD_WIDTH_MAIN : ROAD_WIDTH_ALLEY;
      const points = road.getSpacedPoints(30);
      for (let j = 0; j < points.length - 1; j++) {
         createVisibleRoadSegment(points[j], points[j+1], width, roadGeometries);
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

  // 2. Scatter Buildings (Compounds)
  const buildingPlacements = [];
  const placedPoints = []; 

  for (let i = 0; i < SCATTER_ATTEMPTS; i++) {
    // Pick spot
    const r = Math.sqrt(random()) * CITY_AREA_RADIUS; 
    const theta = random() * Math.PI * 2;
    const x = origin.x + r * Math.cos(theta);
    const z = origin.z + r * Math.sin(theta);

    // Check Roads
    let bestDist = Infinity;
    let bestTangent = null;
    let nearestRoadType = 'main';
    
    for (const road of roadCurves) {
        const samples = road.getSpacedPoints(10);
        for (let k=0; k<samples.length; k++) {
            const pt = samples[k];
            const d = Math.hypot(x - pt.x, z - pt.z);
            if (d < bestDist) {
                bestDist = d;
                const tVal = k / (samples.length - 1);
                bestTangent = road.getTangentAt(tVal);
                nearestRoadType = road.userData.type;
            }
        }
    }

    if (bestDist < MIN_DIST_FROM_ROAD) continue; 
    if (bestDist > MAX_DIST_FROM_ROAD) continue;

    // Size Variation
    const width = 3.5 + random() * 2.5;
    const depth = 3.5 + random() * 2.5;
    const radius = Math.max(width, depth) * 0.6; 

    // Overlap Check
    let overlap = false;
    for (const p of placedPoints) {
        const d = Math.hypot(x - p.x, z - p.z);
        if (d < (radius + p.radius + 1.2)) { // Tighter gap (1.2m) for clutter
            overlap = true;
            break;
        }
    }
    if (overlap) continue;

    const y = sampleHeight(terrain, x, z, -999);
    if (y < seaLevel + 1.2) continue; 

    // Orientation with Jitter
    const roadAngle = Math.atan2(bestTangent.x, bestTangent.z);
    // Face road (0) or side (90)
    const baseRot = roadAngle + (random() > 0.5 ? Math.PI/2 : 0);
    // Add chaos (+/- 20 degrees)
    const rotation = baseRot + (random() - 0.5) * 0.7;

    const color = new THREE.Color(pickRandom(WALL_COLOR_PRESETS, random));
    const roofColor = new THREE.Color(pickRandom(ROOF_COLOR_PRESETS, random));

    // MAIN STRUCTURE
    buildingPlacements.push({
        x, y: y + 0.05, z,
        rotation,
        width, depth,
        wallHeight: 3 + random() * 1.5,
        roofHeight: 1.2,
        type: 'main',
        color,
        roofColor
    });

    // ANNEX (The "Compound" Fix)
    // 50% chance to add a lean-to or shed
    if (random() > 0.5) {
        const annexW = width * 0.5;
        const annexD = depth * 0.5;
        // Place relative to main
        const offsetDist = (width + annexW) * 0.45; 
        const annexX = x + Math.cos(rotation) * offsetDist;
        const annexZ = z + Math.sin(rotation) * offsetDist;
        
        buildingPlacements.push({
            x: annexX, y: y + 0.05, z: annexZ,
            rotation: rotation + (random()-0.5)*0.2, // Slight misalignment
            width: annexW, 
            depth: annexD,
            wallHeight: 2.2, // Lower
            roofHeight: 0.8,
            type: 'annex',
            color: color.clone().multiplyScalar(0.9), // Slightly different shade
            roofColor
        });
    }

    placedPoints.push({ x, z, radius });
  }

  // 3. Instantiate
  if (buildingPlacements.length > 0) {
    const wallMat = (await makeTiledPBR("textures/marble", { repeat: { x: 0.25, y: 0.25 }})) 
                    || new THREE.MeshStandardMaterial({ color: 0xe0d0b0 });
    wallMat.vertexColors = true; 
    wallMat.roughness = 0.95;

    const roofMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, vertexColors: true, roughness: 0.95 
    });

    const wallGeo = new THREE.BoxGeometry(1, 1, 1);
    wallGeo.translate(0, 0.5, 0); 
    
    const roofGeo = new THREE.CylinderGeometry(0, 0.5, 1, 4, 1, false);
    roofGeo.rotateY(Math.PI/4); 
    roofGeo.translate(0, 0.5, 0);

    const walls = new THREE.InstancedMesh(wallGeo, wallMat, buildingPlacements.length);
    const roofs = new THREE.InstancedMesh(roofGeo, roofMat, buildingPlacements.length);
    
    walls.castShadow = true; walls.receiveShadow = true;
    roofs.castShadow = true; roofs.receiveShadow = true;

    const dummy = new THREE.Object3D();

    buildingPlacements.forEach((b, i) => {
        // Wall
        dummy.position.set(b.x, b.y, b.z);
        dummy.rotation.set(0, b.rotation, 0);
        dummy.scale.set(b.width, b.wallHeight, b.depth);
        dummy.updateMatrix();
        walls.setMatrixAt(i, dummy.matrix);
        walls.setColorAt(i, b.color);

        // Roof
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

  // 4. Add Trees (Scattered)
  const treeCount = Math.floor(buildingPlacements.length * 0.6);
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
              if (Math.hypot(tx-p.x, tz-p.z) < p.radius + 1.2) { clear = false; break; }
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
