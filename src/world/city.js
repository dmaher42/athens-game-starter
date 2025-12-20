import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  CITY_CHUNK_CENTER,
  CITY_SEED,
  getSeaLevelY,
  CITY_AREA_RADIUS,
} from "./locations.js";
import { applyTextureBudgetToObject } from "../utils/textureBudget.js";
import { makeTiledPBR } from "../materials/pbr-utils.js";

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

function applyVertexColor(geometry, color) {
  const c = color instanceof THREE.Color ? color : new THREE.Color(color);
  const geom = geometry.toNonIndexed();
  const count = geom.getAttribute("position").count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geom;
}

export function generateGreekHouseGeometry(width, depth, wallHeight, roofHeight, wallColor, roofColor) {
  const geometries = [];
  const porchInset = 1.0;
  const foundationHeight = 0.2;

  // Foundation
  const foundationGeo = new THREE.BoxGeometry(width + 0.4, foundationHeight, depth + 0.4);
  foundationGeo.translate(0, foundationHeight * 0.5, 0);
  geometries.push(applyVertexColor(foundationGeo, 0x999999));

  // Walls with front inset to leave a porch
  const roomDepth = Math.max(0.5, depth - porchInset);
  const wallGeo = new THREE.BoxGeometry(width, wallHeight, roomDepth);
  wallGeo.translate(0, foundationHeight + wallHeight * 0.5, -porchInset * 0.5);
  geometries.push(applyVertexColor(wallGeo, wallColor));

  // Porch columns
  const columnCount = Math.max(1, Math.floor(width / 1.5));
  const spacing = width / (columnCount + 1);
  const columnHeight = wallHeight;
  const columnGeo = new THREE.CylinderGeometry(0.15, 0.15, columnHeight, 8);
  columnGeo.translate(0, foundationHeight + columnHeight * 0.5, 0);
  const porchZ = depth * 0.5 - porchInset * 0.5;
  for (let i = 0; i < columnCount; i++) {
    const col = columnGeo.clone();
    const x = -width * 0.5 + spacing * (i + 1);
    col.translate(x, 0, porchZ - 0.1);
    geometries.push(applyVertexColor(col, 0xdddddd));
  }

  // Roof as a triangular prism cylinder
  const roofRadius = Math.max(depth * 0.55, 0.5);
  const roofGeo = new THREE.CylinderGeometry(roofRadius, roofRadius, width, 3, 1, true);
  roofGeo.rotateZ(Math.PI / 2);
  roofGeo.scale(1, roofHeight / (roofRadius * 2), 1);
  roofGeo.translate(0, foundationHeight + wallHeight + roofHeight * 0.5, -porchInset * 0.2);
  geometries.push(applyVertexColor(roofGeo, roofColor));

  return mergeGeometries(geometries, false);
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

  // Roads radiating from center
  const roadCurves = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + random() * 0.4;
    const start = origin.clone();
    const end = new THREE.Vector3(
      origin.x + Math.cos(angle) * CITY_AREA_RADIUS,
      origin.y,
      origin.z + Math.sin(angle) * CITY_AREA_RADIUS
    );
    const mid = start.clone().lerp(end, 0.5);
    mid.x += (random() - 0.5) * 30;
    mid.z += (random() - 0.5) * 30;
    [start, mid, end].forEach((p) => (p.y = sampleHeight(terrain, p.x, p.z, origin.y) + 0.05));
    const curve = new THREE.CatmullRomCurve3([start, mid, end]);
    roadCurves.push(curve);
  }

  const roadGeometries = roadCurves.map((curve) => {
    const tube = new THREE.TubeGeometry(curve, 80, 1.5, 8, false);
    return applyVertexColor(tube, 0x8f8676);
  });

  if (roadGeometries.length > 0) {
    const mergedRoads = mergeGeometries(roadGeometries, true);
    const roadMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 1.0,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });
    const roadMesh = new THREE.Mesh(mergedRoads, roadMaterial);
    roadMesh.receiveShadow = true;
    roadMesh.userData.noCollision = true;
    city.add(roadMesh);
  }

  const roadSamples = roadCurves.map((curve) => curve.getSpacedPoints(60));

  const cityGeometries = [];
  const placedHouses = [];
  const scatterAttempts = 2500;

  for (let i = 0; i < scatterAttempts; i++) {
    const r = Math.sqrt(random()) * CITY_AREA_RADIUS;
    const theta = random() * Math.PI * 2;
    const x = origin.x + r * Math.cos(theta);
    const z = origin.z + r * Math.sin(theta);

    let bestDist = Infinity;
    let bestCurve = null;
    let bestT = 0;

    roadCurves.forEach((curve, idx) => {
      const samples = roadSamples[idx];
      for (let s = 0; s < samples.length; s++) {
        const pt = samples[s];
        const d = Math.hypot(x - pt.x, z - pt.z);
        if (d < bestDist) {
          bestDist = d;
          bestCurve = curve;
          bestT = s / (samples.length - 1);
        }
      }
    });

    if (bestDist > 15 || bestDist < 4) continue;

    const width = 3 + random() * 3;
    const depth = 3 + random() * 3;
    const wallHeight = 2.5 + random() * 1.5;
    const roofHeight = 0.8 + random() * 0.8;
    const neighborRadius = Math.max(width, depth) * 0.6;

    let tooClose = false;
    for (const p of placedHouses) {
      const dist = Math.hypot(x - p.x, z - p.z);
      if (dist < neighborRadius + p.radius) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;

    const y = sampleHeight(terrain, x, z, -999);
    if (y < seaLevel + 1.0) continue;

    const wallColor = new THREE.Color(pickRandom(WALL_COLOR_PRESETS, random));
    const roofColor = new THREE.Color(pickRandom(ROOF_COLOR_PRESETS, random));

    const houseGeo = generateGreekHouseGeometry(width, depth, wallHeight, roofHeight, wallColor, roofColor);

    if (bestCurve) {
      const tangent = bestCurve.getTangent(bestT);
      const angle = Math.atan2(tangent.x, tangent.z);
      houseGeo.applyMatrix4(new THREE.Matrix4().makeRotationY(angle));
    }

    houseGeo.applyMatrix4(new THREE.Matrix4().makeTranslation(x, y, z));
    cityGeometries.push(houseGeo);
    placedHouses.push({ x, z, radius: neighborRadius });
  }

  if (cityGeometries.length > 0) {
    const mergedCity = mergeGeometries(cityGeometries, true);
    const cityMaterial =
      (await makeTiledPBR("textures/marble", { repeat: { x: 0.25, y: 0.25 } })) ||
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
    cityMaterial.vertexColors = true;
    const cityMesh = new THREE.Mesh(mergedCity, cityMaterial);
    cityMesh.castShadow = true;
    cityMesh.receiveShadow = true;
    city.add(cityMesh);
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
