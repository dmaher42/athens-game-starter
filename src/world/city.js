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
import { makeTiledPBR } from "../materials/pbr-utils.js";
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
  const BUILDING_MIN_GAP = 2.0; // Tight alleys
  const SCATTER_ATTEMPTS = 3000; // High count to fill gaps
  const MIN_DIST_FROM_ROAD = 3.5; // Don't block street
  const MAX_DIST_FROM_ROAD = 12.0; // Don't build in middle of nowhere
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
  
  // Create 5 main arteries radiating from center
  const numArteries = 5;
  for (let i = 0; i < numArteries; i++) {
    const angle = (i / numArteries) * Math.PI * 2 + (random() * 0.5);
    const start = origin.clone();
    
    // End point near the edge of the city radius
    const end = new THREE.Vector3(
        origin.x + Math.cos(angle) * CITY_AREA_RADIUS,
        origin.y,
        origin.z + Math.sin(angle) * CITY_AREA_RADIUS
    );

    // Add a control point to curve the road
    const mid = start.clone().lerp(end, 0.5);
    mid.x += (random() - 0.5) * 40; 
    mid.z += (random() - 0.5) * 40;

    // Sample terrain height for curve points
    [start, mid, end].forEach(p => {
        p.y = sampleHeight(terrain, p.x, p.z, origin.y) + 0.1;
    });

    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    roadCurves.push(curve);

    // Mesh the road
    const points = curve.getSpacedPoints(30);
    const perturbedPoints = [];
    const widths = [];

    for (let k = 0; k < points.length; k++) {
        const t = k / (points.length - 1);
        const tangent = curve.getTangentAt(t);
        const perp = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        // Add lateral offset (0.4-1.2 units)
        const offsetVal = roadNoise(t * 5 + i * 10, CITY_SEED) * 0.8;
        const p = points[k].clone().addScaledVector(perp, offsetVal);

        // Resample height at new position
        p.y = sampleHeight(terrain, p.x, p.z, origin.y) + 0.1;

        perturbedPoints.push(p);

        // Add width variance (+/- 10%)
        const widthVar = 1.0 + roadNoise(t * 8 + i * 10 + 50, CITY_SEED) * 0.1;
        widths.push(ROAD_WIDTH * widthVar);
    }

    for (let j = 0; j < perturbedPoints.length - 1; j++) {
       createVisibleRoadSegment(perturbedPoints[j], perturbedPoints[j+1], widths[j], widths[j+1], roadGeometries);
    }
  }

  // Create Road Mesh
  if (roadGeometries.length > 0) {
    const merged = mergeGeometries(roadGeometries);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x8f8676, // Earthy
      roughness: 1.0, 
      metalness: 0.0,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(merged, material);
    mesh.receiveShadow = true;
    mesh.userData.noCollision = true; // Terrain handles collision
    city.add(mesh);
  }

  // 2. Scatter Buildings
  const buildingPlacements = [];
  const placedPoints = []; // Simple collision list {x, z, r}

  for (let i = 0; i < SCATTER_ATTEMPTS; i++) {
    // A. Pick random spot in city radius
    const r = Math.sqrt(random()) * CITY_AREA_RADIUS; // Uniform area distribution
    const theta = random() * Math.PI * 2;
    const x = origin.x + r * Math.cos(theta);
    const z = origin.z + r * Math.sin(theta);

    // B. Check Road Proximity (Must be near, but not ON road)
    let bestDist = Infinity;
    let bestTangent = null;
    let bestRoadPt = null;
    
    for (const road of roadCurves) {
        // Approximate closest point on curve
        const samples = road.getSpacedPoints(10);
        for (let k=0; k<samples.length; k++) {
            const pt = samples[k];
            const d = Math.hypot(x - pt.x, z - pt.z);
            if (d < bestDist) {
                bestDist = d;
                bestRoadPt = pt;
                const tVal = k / (samples.length - 1);
                bestTangent = road.getTangentAt(tVal);
            }
        }
    }

    if (bestDist < MIN_DIST_FROM_ROAD) continue; // Too close to road (blocked)
    if (bestDist > MAX_DIST_FROM_ROAD) continue; // Too far (isolated)

    // C. Define Lot & Subdivision
    const baseWidth = 3.5 + random() * 2.5;
    const baseDepth = 3.5 + random() * 2.5;

    // Plot Subdivision (25-45% chance)
    const doSubdivide = random() < 0.35;

    // Prepare candidates
    const candidates = [];

    // Road info
    const roadDir = new THREE.Vector2(bestTangent.x, bestTangent.z).normalize();
    const toLotDir = new THREE.Vector2(x - bestRoadPt.x, z - bestRoadPt.z).normalize();
    const angleFromTangent = Math.atan2(roadDir.y, roadDir.x);

    if (doSubdivide) {
        // Split along the road tangent axis
        const splitOffset = baseWidth * 0.28;

        candidates.push({
            relX: -roadDir.x * splitOffset,
            relZ: -roadDir.y * splitOffset,
            w: baseWidth * 0.4,
            d: baseDepth * 0.8,
            isSub: true
        });
        candidates.push({
            relX: roadDir.x * splitOffset,
            relZ: roadDir.y * splitOffset,
            w: baseWidth * 0.4,
            d: baseDepth * 0.8,
            isSub: true
        });
    } else {
        candidates.push({
            relX: 0, relZ: 0,
            w: baseWidth, d: baseDepth,
            isSub: false
        });
    }

    // Process candidates to final placements
    const finalBuildings = [];
    let collisionDetected = false;

    for (const cand of candidates) {
        // 1. Setback Variance (0.5 - 2.0m)
        const setback = 0.5 + random() * 1.5;
        // Move away from road
        const setbackVec = toLotDir.clone().multiplyScalar(setback);

        let cx = x + cand.relX + setbackVec.x;
        let cz = z + cand.relZ + setbackVec.y;

        // 2. Position Jitter (10-18% of lot size)
        const jitterMag = Math.min(cand.w, cand.d) * (0.10 + random() * 0.08);
        cx += (random() - 0.5) * 2 * jitterMag;
        cz += (random() - 0.5) * 2 * jitterMag;

        // 3. Scale Jitter (0.85 - 1.15)
        const sJitter = 0.85 + random() * 0.3;
        const finalW = cand.w * sJitter;
        const finalD = cand.d * sJitter;

        // Resolve district early for rotation rules
        const distRule = resolveDistrictAt(terrain, districtRules, cx, cz, 'residential');

        // 4. Rotation Jitter
        // Base rotation: Align to road tangent (grid)
        let baseRot = angleFromTangent;

        // Bias: 80% chance to align strictly with road grid (0 or 90 offset)
        if (random() < 0.8) {
             baseRot += (random() > 0.5 ? Math.PI/2 : 0);
        }
        // Else: keep tangent alignment (no 90 deg snap), effectively same base but allows drift via jitter logic below

        // Apply Jitter based on district
        const isCivic = distRule.id === 'sacred' || distRule.id === 'commercial' || distRule.id === 'civic';
        const jitterMin = isCivic ? 2 : 8;
        const jitterMax = isCivic ? 5 : 18;

        const rJitterDeg = jitterMin + random() * (jitterMax - jitterMin);
        const rJitterRad = rJitterDeg * (Math.PI / 180);
        const rSign = random() > 0.5 ? 1 : -1;
        const finalRot = baseRot + (rJitterRad * rSign);

        const radius = Math.max(finalW, finalD) * 0.6;

        // D. Collision Check (Neighbors)
        let overlap = false;
        for (const p of placedPoints) {
            const d = Math.hypot(cx - p.x, cz - p.z);
            if (d < (radius + p.radius + BUILDING_MIN_GAP)) {
                overlap = true;
                break;
            }
        }
        // Self-collision (for subdivided)
        for (const fb of finalBuildings) {
             const d = Math.hypot(cx - fb.x, cz - fb.z);
             // Use width-based check for siblings to allow dense packing
             if (d < (finalW * 0.5 + fb.width * 0.5 + 0.1)) {
                 overlap = true;
                 break;
             }
        }

        if (overlap) {
            collisionDetected = true;
            break;
        }

        // E. Terrain/Water Check
        const fallbackHeight = (Number.isFinite(seaLevel) ? seaLevel : SEA_LEVEL_Y) + MIN_ABOVE_SEA;
        const ty = sampleHeight(terrain, cx, cz, fallbackHeight);
        const seaBaseline = Number.isFinite(SEA_LEVEL_Y) ? SEA_LEVEL_Y : seaLevel;
        const underwaterThreshold = (Number.isFinite(seaBaseline) ? seaBaseline : 0) + 0.05;

        if (!Number.isFinite(ty) || ty <= underwaterThreshold) {
            collisionDetected = true;
            break;
        }

        const inHarborBuffer = isWithinHarborWater(cx, cz, SHORELINE_BUFFER_METERS);
        const isWaterfrontTagged = options?.lotTag === "harbor" || options?.lotTag === "pier";
        if (inHarborBuffer && !isWaterfrontTagged) {
             collisionDetected = true;
             break;
        }

        // Roof color
        const roofPalette = (Array.isArray(distRule.roofColors) && distRule.roofColors.length > 0)
            ? distRule.roofColors
            : ROOF_COLOR_PRESETS;

        // Heights
        const [minH, maxH] = Array.isArray(distRule.heightRange) ? distRule.heightRange : [3, 4.5];
        const wH = minH + random() * (maxH - minH);

        finalBuildings.push({
            x: cx, y: ty + 0.05, z: cz,
            rotation: finalRot,
            width: finalW, depth: finalD,
            wallHeight: wH,
            roofHeight: 1.2 * (cand.isSub ? 0.8 : 1.0),
            color: new THREE.Color(pickRandom(WALL_COLOR_PRESETS, random)),
            roofColor: new THREE.Color(pickRandom(roofPalette, random)),
            radius: radius
        });
    }

    if (collisionDetected) continue;

    // F. Commit placements
    for (const b of finalBuildings) {
        buildingPlacements.push(b);
        placedPoints.push({ x: b.x, z: b.z, radius: b.radius });
    }
  }

  // 3. Instantiate Buildings
  if (buildingPlacements.length > 0) {
    // Use PBR texture if available, else fallback
    const wallMat = (await makeTiledPBR("textures/marble", { repeat: { x: 0.25, y: 0.25 }})) 
                    || new THREE.MeshStandardMaterial({ color: 0xe0d0b0 });
    wallMat.vertexColors = true; // Enable tinting
    wallMat.roughness = 0.9;

    const roofMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, vertexColors: true, roughness: 0.9 
    });

    const wallGeo = new THREE.BoxGeometry(1, 1, 1);
    wallGeo.translate(0, 0.5, 0); // Pivot at bottom
    
    const roofGeo = new THREE.CylinderGeometry(0, 0.5, 1, 4, 1, false);
    roofGeo.rotateY(Math.PI/4); // Align square pyramid
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
    
    // Store for potential interaction/updates
    city.userData.walls = walls;
    city.userData.roofs = roofs;
  }

  // 4. Add Organic Trees (Scatter in gaps)
  const treeCount = Math.floor(buildingPlacements.length * 0.8);
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
          
          // Check collision with buildings
          let clear = true;
          for (const p of placedPoints) {
              if (Math.hypot(tx-p.x, tz-p.z) < p.radius + 1.5) { clear = false; break; }
          }
          if (!clear) continue;
          
          // Check road distance (keep trees off the road)
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
