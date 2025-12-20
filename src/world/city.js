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

function populateCityDetails(scene, terrain, buildingPlacements, roadCurves) {
  if (!scene) return;

  const detailGroup = new THREE.Group();
  detailGroup.name = "CityDetails";

  const areaCenter = buildingPlacements.length
    ? buildingPlacements.reduce(
        (acc, p) => {
          acc.x += p.x;
          acc.z += p.z;
          return acc;
        },
        new THREE.Vector3(0, 0, 0)
      ).divideScalar(buildingPlacements.length)
    : CITY_CHUNK_CENTER.clone();

  const urnGeometry = new THREE.SphereGeometry(0.25, 12, 12);
  urnGeometry.scale(0.8, 1.4, 0.8);
  const crateGeometry = new THREE.BoxGeometry(0.4, 0.35, 0.4);

  const potColor = new THREE.Color("#c17347");
  const crateColor = new THREE.Color("#8b6746");

  const potMatrices = [];
  const potColors = [];
  const crateMatrices = [];
  const crateColors = [];

  const tempMatrix = new THREE.Matrix4();
  const up = new THREE.Vector3(0, 1, 0);

  buildingPlacements.forEach((placement) => {
    const { x, z, rotation = 0, width = 1, depth = 1 } = placement;
    const base = new THREE.Vector3(x, 0, z);
    const front = new THREE.Vector3(0, 0, 1).applyAxisAngle(up, rotation);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(up, rotation);

    const propCount = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < propCount; i++) {
      const useFront = Math.random() > 0.35;
      const alongFront = (Math.random() - 0.5) * width * 0.4;
      const alongSide = (Math.random() - 0.5) * depth * 0.4;

      const offset = base.clone();
      if (useFront) {
        offset.add(front.clone().multiplyScalar(depth * 0.5 + 0.6));
        offset.add(right.clone().multiplyScalar(alongFront));
      } else {
        const sideDir = Math.random() > 0.5 ? right : right.clone().multiplyScalar(-1);
        offset.add(sideDir.clone().multiplyScalar(width * 0.5 + 0.6));
        offset.add(front.clone().multiplyScalar(alongSide));
      }

      const y = sampleHeight(terrain, offset.x, offset.z, base.y);
      offset.y = y;

      const isPot = Math.random() > 0.4;
      const scale = 0.8 + Math.random() * 0.4;
      const rot = Math.random() * Math.PI * 2;
      tempMatrix.compose(
        offset,
        new THREE.Quaternion().setFromAxisAngle(up, rot),
        new THREE.Vector3(scale, scale, scale)
      );

      if (isPot) {
        potMatrices.push(tempMatrix.clone());
        potColors.push(potColor.clone());
      } else {
        crateMatrices.push(tempMatrix.clone());
        crateColors.push(crateColor.clone());
      }
    }
  });

  if (potMatrices.length > 0) {
    const mesh = new THREE.InstancedMesh(
      urnGeometry,
      new THREE.MeshStandardMaterial({ color: potColor, roughness: 0.7 }),
      potMatrices.length
    );
    mesh.castShadow = true;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    potMatrices.forEach((m, i) => {
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, potColors[i]);
    });
    mesh.instanceColor.needsUpdate = true;
    detailGroup.add(mesh);
  }

  if (crateMatrices.length > 0) {
    const mesh = new THREE.InstancedMesh(
      crateGeometry,
      new THREE.MeshStandardMaterial({ color: crateColor, roughness: 0.9 }),
      crateMatrices.length
    );
    mesh.castShadow = true;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    crateMatrices.forEach((m, i) => {
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, crateColors[i]);
    });
    mesh.instanceColor.needsUpdate = true;
    detailGroup.add(mesh);
  }

  const grassColorA = new THREE.Color("#5d6e52");
  const grassColorB = new THREE.Color("#c2b280");
  const vegetationGeometry = new THREE.DodecahedronGeometry(0.35, 0);
  const vegetationMaterial = new THREE.MeshStandardMaterial({ color: grassColorA, roughness: 1.0 });

  const vegetationMatrices = [];
  const vegetationColors = [];
  const roadSamples = roadCurves.map((curve) => curve.getSpacedPoints(60));

  let vegetationCount = 0;
  let attempts = 0;
  while (vegetationCount < 2000 && attempts < 8000) {
    attempts++;
    const r = Math.sqrt(Math.random()) * CITY_AREA_RADIUS;
    const theta = Math.random() * Math.PI * 2;
    const x = r * Math.cos(theta) + areaCenter.x;
    const z = r * Math.sin(theta) + areaCenter.z;

    let nearRoad = false;
    for (let i = 0; i < roadCurves.length && !nearRoad; i++) {
      const points = roadSamples[i];
      for (let p = 0; p < points.length; p++) {
        const pt = points[p];
        const dist = Math.hypot(x - pt.x, z - pt.z);
        if (dist < 2) {
          nearRoad = true;
          break;
        }
      }
    }
    if (nearRoad) continue;

    let insideBuilding = false;
    for (const placement of buildingPlacements) {
      const radius = Math.max(placement.width, placement.depth) * 0.5 + 0.2;
      const dist = Math.hypot(x - placement.x, z - placement.z);
      if (dist < radius) {
        insideBuilding = true;
        break;
      }
    }
    if (insideBuilding) continue;

    const y = sampleHeight(terrain, x, z, areaCenter.y);
    const pos = new THREE.Vector3(x, y, z);
    const scale = 0.5 + Math.random() * 0.7;
    const rot = Math.random() * Math.PI * 2;
    tempMatrix.compose(
      pos,
      new THREE.Quaternion().setFromAxisAngle(up, rot),
      new THREE.Vector3(scale, scale * 1.2, scale)
    );
    vegetationMatrices.push(tempMatrix.clone());

    const mix = 0.4 + Math.random() * 0.6;
    const color = grassColorA.clone().lerp(grassColorB, mix + (Math.random() - 0.5) * 0.1);
    vegetationColors.push(color);
    vegetationCount++;
  }

  if (vegetationMatrices.length > 0) {
    const mesh = new THREE.InstancedMesh(vegetationGeometry, vegetationMaterial, vegetationMatrices.length);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    vegetationMatrices.forEach((m, i) => {
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, vegetationColors[i]);
    });
    mesh.instanceColor.needsUpdate = true;
    detailGroup.add(mesh);
  }

  scene.add(detailGroup);
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
  const buildingPlacements = [];
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

    let angle = 0;
    if (bestCurve) {
      const tangent = bestCurve.getTangent(bestT);
      angle = Math.atan2(tangent.x, tangent.z);
      houseGeo.applyMatrix4(new THREE.Matrix4().makeRotationY(angle));
    }

    houseGeo.applyMatrix4(new THREE.Matrix4().makeTranslation(x, y, z));
    cityGeometries.push(houseGeo);
    placedHouses.push({ x, z, radius: neighborRadius });
    buildingPlacements.push({ x, z, rotation: angle, width, depth });
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

  populateCityDetails(city, terrain, buildingPlacements, roadCurves);

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
