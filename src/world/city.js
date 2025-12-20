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
import { generateStoaGeometry, generateTholosGeometry } from "./monuments.js";
import {
  createParthenon,
  createTempleOfZeus,
  createTheater,
  generateTempleGeometry,
} from "./landmarks.js";

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

function findHighestPoint(terrain, center, radius, step = 6) {
  let best = null;
  for (let x = center.x - radius; x <= center.x + radius; x += step) {
    for (let z = center.z - radius; z <= center.z + radius; z += step) {
      const y = sampleHeight(terrain, x, z, center.y);
      if (!Number.isFinite(y)) continue;
      if (!best || y > best.y) {
        best = { x, y, z };
      }
    }
  }
  return best;
}

function findSteepestSlope(terrain, center, radius, step = 10) {
  let best = null;
  for (let x = center.x - radius; x <= center.x + radius; x += step) {
    for (let z = center.z - radius; z <= center.z + radius; z += step) {
      const h = sampleHeight(terrain, x, z, center.y);
      const hx = sampleHeight(terrain, x + step, z, h);
      const hz = sampleHeight(terrain, x, z + step, h);
      if (!Number.isFinite(h) || !Number.isFinite(hx) || !Number.isFinite(hz)) continue;
      const slopeVec = new THREE.Vector3(hx - h, 0, hz - h);
      const magnitude = slopeVec.length();
      if (!best || magnitude > best.slope) {
        best = { x, z, y: h, slope: magnitude, downhill: slopeVec.clone().normalize() };
      }
    }
  }
  return best;
}

function populateCityDetails(cityGroup, terrain, buildingPlacements, roadCurves) {
  if (!cityGroup) return;

  const detailGroup = new THREE.Group();
  detailGroup.name = "CityDetails";

  const up = new THREE.Vector3(0, 1, 0);
  const tempMatrix = new THREE.Matrix4();

  // Domestic Clutter (Pots & Crates)
  const amphoraGeometry = new THREE.SphereGeometry(1, 14, 10);
  amphoraGeometry.scale(0.3, 0.6, 0.3);
  const crateGeometry = new THREE.BoxGeometry(0.4, 0.35, 0.4);

  const amphoraMaterial = new THREE.MeshStandardMaterial({ color: "#c05621", roughness: 0.75 });
  const crateMaterial = new THREE.MeshStandardMaterial({ color: "#8f6b45", roughness: 0.9 });

  const amphoraMatrices = [];
  const crateMatrices = [];

  buildingPlacements.forEach((placement) => {
    const { x, z, rotation = 0, width = 1, depth = 1 } = placement;
    const base = new THREE.Vector3(x, 0, z);
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(up, rotation);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(up, rotation);

    const walls = [
      { normal: forward, span: width, offset: depth * 0.5 },
      { normal: forward.clone().multiplyScalar(-1), span: width, offset: depth * 0.5 },
      { normal: right, span: depth, offset: width * 0.5 },
      { normal: right.clone().multiplyScalar(-1), span: depth, offset: width * 0.5 },
    ];

    const propCount = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < propCount; i++) {
      const wall = walls[Math.floor(Math.random() * walls.length)];
      const tangent = new THREE.Vector3().crossVectors(up, wall.normal).normalize();
      const alongWall = (Math.random() - 0.5) * wall.span * 0.8;
      const offset = base
        .clone()
        .add(wall.normal.clone().setLength(wall.offset + 0.6 + Math.random() * 0.2))
        .add(tangent.multiplyScalar(alongWall));

      const y = sampleHeight(terrain, offset.x, offset.z, base.y);
      offset.y = y;

      const scale = 0.9 + Math.random() * 0.25;
      const rotationY = Math.random() * Math.PI * 2;
      tempMatrix.compose(
        offset,
        new THREE.Quaternion().setFromAxisAngle(up, rotationY),
        new THREE.Vector3(scale, scale, scale)
      );

      if (Math.random() > 0.4) {
        amphoraMatrices.push(tempMatrix.clone());
      } else {
        crateMatrices.push(tempMatrix.clone());
      }
    }
  });

  if (amphoraMatrices.length > 0) {
    const amphoraMesh = new THREE.InstancedMesh(amphoraGeometry, amphoraMaterial, amphoraMatrices.length);
    amphoraMesh.castShadow = true;
    amphoraMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    amphoraMatrices.forEach((matrix, idx) => {
      amphoraMesh.setMatrixAt(idx, matrix);
    });
    detailGroup.add(amphoraMesh);
  }

  if (crateMatrices.length > 0) {
    const crateMesh = new THREE.InstancedMesh(crateGeometry, crateMaterial, crateMatrices.length);
    crateMesh.castShadow = true;
    crateMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    crateMatrices.forEach((matrix, idx) => {
      crateMesh.setMatrixAt(idx, matrix);
    });
    detailGroup.add(crateMesh);
  }

  // Wild Vegetation (Bushes)
  const bushGeometry = new THREE.DodecahedronGeometry(0.6, 0);
  const bushMaterial = new THREE.MeshStandardMaterial({ color: "#5d6e52", roughness: 1.0 });
  const bushMatrices = [];
  const roadSamples = roadCurves.map((curve) => curve.getSpacedPoints(80));

  const targetBushes = 1500;
  let attempts = 0;
  while (bushMatrices.length < targetBushes && attempts < targetBushes * 8) {
    attempts++;
    const r = Math.sqrt(Math.random()) * CITY_AREA_RADIUS;
    const theta = Math.random() * Math.PI * 2;
    const x = CITY_CHUNK_CENTER.x + r * Math.cos(theta);
    const z = CITY_CHUNK_CENTER.z + r * Math.sin(theta);

    let tooCloseToRoad = false;
    for (let i = 0; i < roadCurves.length && !tooCloseToRoad; i++) {
      const points = roadSamples[i];
      for (let p = 0; p < points.length; p++) {
        const pt = points[p];
        if (Math.hypot(x - pt.x, z - pt.z) < 2.5) {
          tooCloseToRoad = true;
          break;
        }
      }
    }
    if (tooCloseToRoad) continue;

    let insideBuilding = false;
    for (const placement of buildingPlacements) {
      const buildingRadius = Math.max(placement.width, placement.depth) * 0.5;
      if (Math.hypot(x - placement.x, z - placement.z) < buildingRadius) {
        insideBuilding = true;
        break;
      }
    }
    if (insideBuilding) continue;

    const y = sampleHeight(terrain, x, z, CITY_CHUNK_CENTER.y);
    const position = new THREE.Vector3(x, y, z);
    const bushScale = 0.8 + Math.random() * 0.6;
    const rotationY = Math.random() * Math.PI * 2;
    const colorMix = Math.random();
    const bushColor = new THREE.Color("#5d6e52").lerp(new THREE.Color("#556b2f"), colorMix);

    tempMatrix.compose(
      position,
      new THREE.Quaternion().setFromAxisAngle(up, rotationY),
      new THREE.Vector3(bushScale, bushScale * 1.1, bushScale)
    );

    bushMatrices.push({ matrix: tempMatrix.clone(), color: bushColor });
  }

  if (bushMatrices.length > 0) {
    const bushMesh = new THREE.InstancedMesh(bushGeometry, bushMaterial, bushMatrices.length);
    bushMesh.castShadow = true;
    bushMesh.receiveShadow = true;
    bushMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    bushMatrices.forEach((entry, idx) => {
      bushMesh.setMatrixAt(idx, entry.matrix);
      bushMesh.setColorAt(idx, entry.color);
    });
    bushMesh.instanceColor.needsUpdate = true;
    detailGroup.add(bushMesh);
  }

  cityGroup.add(detailGroup);
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

  const monuments = new THREE.Group();
  monuments.name = "Monuments";
  city.add(monuments);

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
  const placedPoints = [];
  const buildingPlacements = [];
  const scatterAttempts = 2500;

  // Central monuments
  const tholosRadius = 5;
  const tholosHeight = 7;
  const tholosX = origin.x + 6;
  const tholosZ = origin.z;
  const tholosY = sampleHeight(terrain, tholosX, tholosZ, origin.y);
  const tholosGeo = generateTholosGeometry(tholosRadius, tholosHeight);
  tholosGeo.applyMatrix4(new THREE.Matrix4().makeTranslation(tholosX, tholosY, tholosZ));
  cityGeometries.push(tholosGeo);
  placedPoints.push({ x: tholosX, z: tholosZ, radius: tholosRadius * 1.2 });
  buildingPlacements.push({ x: tholosX, z: tholosZ, rotation: 0, width: tholosRadius * 2, depth: tholosRadius * 2 });

  const stoaLength = 22;
  const stoaWidth = 8;
  const stoaHeight = 6;
  const stoaX = origin.x - 10;
  const stoaZ = origin.z - 6;
  const stoaY = sampleHeight(terrain, stoaX, stoaZ, origin.y);
  const stoaGeo = generateStoaGeometry(stoaLength, stoaWidth, stoaHeight);
  stoaGeo.applyMatrix4(new THREE.Matrix4().makeTranslation(stoaX, stoaY, stoaZ));
  cityGeometries.push(stoaGeo);
  placedPoints.push({ x: stoaX, z: stoaZ, radius: Math.hypot(stoaLength, stoaWidth) * 0.5 });
  buildingPlacements.push({ x: stoaX, z: stoaZ, rotation: 0, width: stoaLength, depth: stoaWidth });

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
    for (const p of placedPoints) {
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
    placedPoints.push({ x, z, radius: neighborRadius });
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

  const acropolisPeak = findHighestPoint(terrain, origin, 80, 6);
  if (acropolisPeak) {
    const parthenon = createParthenon();
    parthenon.position.set(acropolisPeak.x, acropolisPeak.y, acropolisPeak.z);
    monuments.add(parthenon);

    const gatewayGeo = generateTempleGeometry(16, 28, 8, 6, 12);
    const gatewayMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: 0.02 });
    const gateway = new THREE.Mesh(gatewayGeo, gatewayMaterial);
    gateway.castShadow = true;
    gateway.receiveShadow = true;
    const gatewayPos = new THREE.Vector3(acropolisPeak.x + 10, acropolisPeak.y, acropolisPeak.z - 24);
    gatewayPos.y = sampleHeight(terrain, gatewayPos.x, gatewayPos.z, gatewayPos.y);
    gateway.position.copy(gatewayPos);
    monuments.add(gateway);
  }

  const slopeSpot = findSteepestSlope(terrain, origin, CITY_AREA_RADIUS, 12);
  const theaterPos = slopeSpot
    ? new THREE.Vector3(slopeSpot.x, slopeSpot.y, slopeSpot.z)
    : new THREE.Vector3(origin.x + 100, sampleHeight(terrain, origin.x + 100, origin.z + 100, origin.y), origin.z + 100);
  const theater = createTheater();
  theater.position.copy(theaterPos);
  if (slopeSpot?.downhill) {
    theater.rotation.y = Math.atan2(-slopeSpot.downhill.x, -slopeSpot.downhill.z);
  }
  monuments.add(theater);

  const zeusPos = new THREE.Vector3(origin.x - 80, origin.y, origin.z + 40);
  zeusPos.y = sampleHeight(terrain, zeusPos.x, zeusPos.z, origin.y);
  const templeOfZeus = createTempleOfZeus();
  templeOfZeus.position.copy(zeusPos);
  monuments.add(templeOfZeus);

  populateCityDetails(city, terrain, buildingPlacements, roadCurves);

  applyTextureBudgetToObject(city, scene?.userData?.renderer);
  city.userData = city.userData || {};
  city.userData.roadCurves = roadCurves;
  return { city, roadCurves };
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
