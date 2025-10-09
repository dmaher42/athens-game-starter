import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  CITY_CHUNK_CENTER,
  CITY_CHUNK_SIZE,
  CITY_SEED,
  SEA_LEVEL_Y,
  MIN_ABOVE_SEA,
  MAX_SLOPE_DELTA,
  CITY_AREA_RADIUS,
  HARBOR_EXCLUDE_RADIUS,
  HARBOR_CENTER_3D,
  HARBOR_WATER_BOUNDS,
  HARBOR_WATER_EAST_LIMIT,
  AGORA_CENTER_3D,
} from "./locations.js";
import { createRoad } from "./roads.js";
import { addFoundationPad } from "./foundations.js";

// Create a short "ribbon" road between two points. The ribbon is draped to terrain
// by sampling height along the segment, including both left/right edges so it
// tilts with local slope. Uses only built-in materials (no textures).
// If options.collectGeometries is an array, we push geometry there (for a later merge)
// and DO NOT add a standalone mesh. Otherwise, we add the mesh directly to `scene`.
function createVisibleRoad(start, end, scene, terrain, options = {}) {
  const width = options.width ?? 2.8;
  const yOffset = options.yOffset ?? 0.05; // sit slightly above terrain
  const color = options.color ?? 0x2f2f2f; // dark gray
  const collect = Array.isArray(options.collectGeometries) ? options.collectGeometries : null;

  const length = start.distanceTo(end);
  const segments = options.segments ?? Math.max(8, Math.ceil(length * 1.5));

  const material =
    createVisibleRoad._material ||
    (createVisibleRoad._material = new THREE.MeshStandardMaterial({
      color,
      roughness: 1.0,
      metalness: 0.0,
      side: THREE.DoubleSide,
    }));
  material.color.setHex(color);

  const getHeightAt = terrain?.userData?.getHeightAt?.bind(terrain?.userData) ?? null;
  if (!Number.isFinite(length) || length < 0.02) return null;

  const dir = end.clone().sub(start);
  dir.y = 0;
  const dirLenXZ = Math.hypot(dir.x, dir.z);
  const side =
    dirLenXZ > 1e-6
      ? new THREE.Vector3(-dir.z / dirLenXZ, 0, dir.x / dirLenXZ)
      : new THREE.Vector3(1, 0, 0);
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

    positions[p++] = left.x;
    positions[p++] = left.y;
    positions[p++] = left.z;
    positions[p++] = right.x;
    positions[p++] = right.y;
    positions[p++] = right.z;
  }

  let k = 0;
  for (let i = 0; i < segments; i++) {
    const base = i * 2;
    indices[k++] = base;
    indices[k++] = base + 1;
    indices[k++] = base + 2;
    indices[k++] = base + 1;
    indices[k++] = base + 3;
    indices[k++] = base + 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();

  // If we’re collecting, return geometry for a later merge (no per-segment mesh).
  if (collect) {
    collect.push(geometry);
    return null;
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "CityRoadSegment";
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  mesh.userData.noCollision = true; // visual only; terrain handles collision
  mesh.renderOrder = 1;
  scene.add(mesh);
  return mesh;
}

const SURFACE_OFFSET = 0.05;

const _matrix = new THREE.Matrix4();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _roofScale = new THREE.Vector3();
const _position = new THREE.Vector3();
const _rotationAxis = new THREE.Vector3(0, 1, 0);
const _color = new THREE.Color();

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
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

  const cornerOffsets = [
    { x: -halfWidth, z: -halfDepth },
    { x: halfWidth, z: -halfDepth },
    { x: -halfWidth, z: halfDepth },
    { x: halfWidth, z: halfDepth },
  ];

  const heights = [];
  let minHeight = Infinity;
  let maxHeight = -Infinity;

  for (const offset of cornerOffsets) {
    const rotatedX = offset.x * cos - offset.z * sin;
    const rotatedZ = offset.x * sin + offset.z * cos;
    const sampleX = centerX + rotatedX;
    const sampleZ = centerZ + rotatedZ;
    const h = sampleHeight(terrain, sampleX, sampleZ, null);
    if (!Number.isFinite(h)) {
      return null;
    }
    heights.push(h);
    if (h < minHeight) minHeight = h;
    if (h > maxHeight) maxHeight = h;
  }

  if (maxHeight - minHeight > maxSlope) {
    return null;
  }

  const averageHeight = heights.reduce((sum, value) => sum + value, 0) / heights.length;
  return {
    height: averageHeight,
    minHeight,
    maxHeight,
  };
}

export function createCity(scene, terrain, options = {}) {
  const origin = options.origin ? options.origin.clone() : CITY_CHUNK_CENTER.clone();
  const rng = mulberry32(options.seed ?? CITY_SEED);
  const gridSize = options.gridSize ?? CITY_CHUNK_SIZE.clone();
  // Pier no-build mask
  const pierRect = {
    west: HARBOR_WATER_BOUNDS.west,
    east: HARBOR_WATER_EAST_LIMIT + 3,
    north: HARBOR_WATER_BOUNDS.north,
    south: HARBOR_WATER_BOUNDS.south,
  };
  function inRect(x, z, r) {
    return x >= r.west && x <= r.east && z >= r.north && z <= r.south;
  }
  // Waterfront frontage band
  const quayBand = {
    minX: HARBOR_WATER_EAST_LIMIT + 3,
    maxX: HARBOR_WATER_EAST_LIMIT + 24,
  };
  // Pier Plaza
  const pierPlazaTarget = new THREE.Vector3(HARBOR_CENTER_3D.x + 8, 0, HARBOR_CENTER_3D.z);
  // --- Updated defaults for a more "city-like" layout -----------------------
  // Goal: straighter blocks, clearer grid, fewer awkward placements. Callers
  // can still override any of these via `options`.
  const spacingX = options.spacingX ?? 14; // was 11 → slightly wider blocks
  const spacingZ = options.spacingZ ?? 14; // was 10
  const jitter = options.jitter ?? 1.2; // was 2.2 → less lateral scatter
  const maxSlope = options.maxSlope ?? 0.2; // was 1.4 → avoid steep lots
  const roadsVisible = options.roadsVisible == null ? true : Boolean(options.roadsVisible);

  const countX = Math.max(3, Math.floor(gridSize.x / spacingX));
  const countZ = Math.max(3, Math.floor(gridSize.y / spacingZ));
  const halfX = (countX - 1) * spacingX * 0.5;
  const halfZ = (countZ - 1) * spacingZ * 0.5;

  const placements = [];
  const pocketPlazas = [];
  let intersectionCounter = 0;

  for (let ix = 0; ix < countX; ix++) {
    for (let iz = 0; iz < countZ; iz++) {
      intersectionCounter++;

      const centerX = origin.x + (ix * spacingX - halfX) + THREE.MathUtils.lerp(-jitter, jitter, rng());
      const centerZ = origin.z + (iz * spacingZ - halfZ) + THREE.MathUtils.lerp(-jitter, jitter, rng());

      if (inRect(centerX, centerZ, pierRect)) {
        continue;
      }

      const centerHeight = sampleHeight(terrain, centerX, centerZ, null);
      if (!Number.isFinite(centerHeight) || centerHeight < SEA_LEVEL_Y) {
        continue;
      }

      const isPierPlazaCell =
        Math.hypot(centerX - pierPlazaTarget.x, centerZ - pierPlazaTarget.z) <=
        Math.min(spacingX, spacingZ) * 0.6;
      if (isPierPlazaCell) {
        const plazaHeight = Math.max(centerHeight + SURFACE_OFFSET, SEA_LEVEL_Y + SURFACE_OFFSET);
        pocketPlazas.push({ x: centerX, y: plazaHeight, z: centerZ });
        continue;
      }

      const inQuayBand = centerX > quayBand.minX && centerX < quayBand.maxX;

      const width = inQuayBand
        ? THREE.MathUtils.lerp(6.8, 8.2, rng())
        : THREE.MathUtils.lerp(4.4, 7.2, rng());
      const depth = inQuayBand
        ? THREE.MathUtils.lerp(5.2, 6.8, rng())
        : THREE.MathUtils.lerp(4.2, 7.8, rng());
      const wallHeight = THREE.MathUtils.lerp(2.6, 3.8, rng());
      const roofHeight = wallHeight * THREE.MathUtils.lerp(0.38, 0.55, rng());
      const rotationSteps = Math.max(1, options.rotationSteps ?? 2); // was 4 → align facades
      let rotation = Math.floor(rng() * rotationSteps) * ((Math.PI * 2) / rotationSteps);
      if (inQuayBand) {
        rotation = 0;
      }

      const lot = evaluateLot({
        terrain,
        centerX,
        centerZ,
        width,
        depth,
        rotation,
        maxSlope,
      });

      if (!lot) {
        continue;
      }

      const distanceFromOrigin = Math.hypot(centerX - origin.x, centerZ - origin.z);
      let skipProbability;
      if (inQuayBand) {
        skipProbability = 0.02;
      } else {
        skipProbability =
          distanceFromOrigin <= 45
            ? 0.08
            : THREE.MathUtils.lerp(0.18, 0.22, rng());
      }

      const isPocketPlaza = intersectionCounter % 5 === 0;
      if (isPocketPlaza) {
        const plazaHeight = Math.max(
          lot.height + SURFACE_OFFSET,
          SEA_LEVEL_Y + SURFACE_OFFSET
        );
        pocketPlazas.push({ x: centerX, y: plazaHeight, z: centerZ });
        continue;
      }

      if (rng() < skipProbability) {
        continue;
      }

      const groundHeight = Math.max(
        lot.height + SURFACE_OFFSET,
        SEA_LEVEL_Y + SURFACE_OFFSET
      );
      placements.push({
        x: centerX,
        y: groundHeight,
        z: centerZ,
        width,
        depth,
        wallHeight,
        roofHeight,
        rotation,
        wallColor: new THREE.Color().setHSL(THREE.MathUtils.lerp(0.08, 0.13, rng()), 0.45, THREE.MathUtils.lerp(0.62, 0.74, rng())),
        roofColor: new THREE.Color().setHSL(THREE.MathUtils.lerp(0.02, 0.04, rng()), 0.55, THREE.MathUtils.lerp(0.23, 0.32, rng())),
      });
    }
  }

  const city = new THREE.Group();
  city.name = "HarborCity";

  const roadGrid = [];
  const roadStartX = origin.x - halfX - spacingX * 0.5;
  const roadStartZ = origin.z - halfZ - spacingZ * 0.5;

  for (let iz = 0; iz <= countZ; iz++) {
    const row = [];
    const z = roadStartZ + iz * spacingZ;
    for (let ix = 0; ix <= countX; ix++) {
      const x = roadStartX + ix * spacingX;
      const height = sampleHeight(terrain, x, z, null);
      if (!Number.isFinite(height) || height < SEA_LEVEL_Y + SURFACE_OFFSET) {
        row.push(null);
        continue;
      }
      row.push(new THREE.Vector3(x, height, z));
    }
    roadGrid.push(row);
  }

  // --- Collect all road segment geometries for one merged mesh (perf + fewer draw calls)
  const roadGeometries = [];
  const mainAvenueSegments = [];
  const mainAvenueLightPositions = [];

  // Define avenueRowIndex for the main avenue aligned with the central row
  const avenueRowIndex = Math.floor(roadGrid.length / 2);

  for (let iz = 0; iz < roadGrid.length; iz++) {
    const row = roadGrid[iz];
    if (!row) continue;

    if (iz === avenueRowIndex) {
      let currentSegment = [];
      for (let ix = 0; ix < row.length; ix++) {
        const point = row[ix];
        if (point) {
          currentSegment.push(point.clone());
        } else if (currentSegment.length > 0) {
          if (currentSegment.length >= 2) {
            mainAvenueSegments.push(currentSegment);
          }
          currentSegment = [];
        }
      }
      if (currentSegment.length >= 2) {
        mainAvenueSegments.push(currentSegment);
      }
      continue;
    }

    for (let ix = 0; ix < row.length - 1; ix++) {
      const start = row[ix];
      const end = row[ix + 1];
      if (!start || !end) {
        continue;
      }
      createVisibleRoad(start, end, city, terrain, { collectGeometries: roadGeometries });
    }
  }

  const columnCount = roadGrid[0]?.length ?? 0;
  for (let ix = 0; ix < columnCount; ix++) {
    for (let iz = 0; iz < roadGrid.length - 1; iz++) {
      const start = roadGrid[iz][ix];
      const end = roadGrid[iz + 1][ix];
      if (!start || !end) {
        continue;
      }
      createVisibleRoad(start, end, city, terrain, { collectGeometries: roadGeometries });
    }
  }

  // Quay Promenade
  const quayX = HARBOR_WATER_EAST_LIMIT + 1.5;
  const quayStartZ = roadStartZ;
  const quayEndZ = roadStartZ + spacingZ * countZ;
  const quayStartHeight = sampleHeight(terrain, quayX, quayStartZ, SEA_LEVEL_Y);
  const quayEndHeight = sampleHeight(terrain, quayX, quayEndZ, SEA_LEVEL_Y);
  const quayStart = new THREE.Vector3(
    quayX,
    Math.max(quayStartHeight, SEA_LEVEL_Y) + SURFACE_OFFSET,
    quayStartZ
  );
  const quayEnd = new THREE.Vector3(
    quayX,
    Math.max(quayEndHeight, SEA_LEVEL_Y) + SURFACE_OFFSET,
    quayEndZ
  );
  const prePromenadeCount = roadGeometries.length;
  createVisibleRoad(quayStart, quayEnd, city, terrain, {
    collectGeometries: roadGeometries,
    width: 3.6,
    color: 0x3a3a3a,
  });
  const promenadeGeometry = roadGeometries[roadGeometries.length - 1];
  if (roadGeometries.length > prePromenadeCount && promenadeGeometry) {
    promenadeGeometry.name = "QuayPromenade";
  }

  // --- Add a wide east-west main avenue through the city center --------------
  // Replace the center row with a single wide avenue spanning the full width
  const mainAvenueWidth = 3.8;
  const mainAvenueColor = 0x2f2f2f;
  const lightSpacing = 9;
  const lightOffset = lightSpacing * 0.5;

  for (const segment of mainAvenueSegments) {
    if (segment.length < 2) {
      continue;
    }

    const boulevardPoints = segment.map((point) => {
      const height = sampleHeight(terrain, point.x, point.z, SEA_LEVEL_Y);
      const y = Number.isFinite(height) ? height : SEA_LEVEL_Y;
      return new THREE.Vector3(point.x, Math.max(y, SEA_LEVEL_Y) + SURFACE_OFFSET, point.z);
    });

    let distanceAccum = 0;
    let nextDistance = lightOffset;

    for (let i = 0; i < boulevardPoints.length - 1; i++) {
      const start = boulevardPoints[i];
      const end = boulevardPoints[i + 1];

      createVisibleRoad(start, end, city, terrain, {
        collectGeometries: roadGeometries,
        width: mainAvenueWidth,
        color: mainAvenueColor,
      });

      const segmentLength = start.distanceTo(end);
      if (segmentLength <= 0) {
        continue;
      }

      while (distanceAccum + segmentLength >= nextDistance) {
        const remaining = nextDistance - distanceAccum;
        const t = THREE.MathUtils.clamp(remaining / segmentLength, 0, 1);
        const position = start.clone().lerp(end, t);
        const height = sampleHeight(terrain, position.x, position.z, SEA_LEVEL_Y);
        if (Number.isFinite(height)) {
          mainAvenueLightPositions.push({
            x: position.x,
            y: Math.max(height, SEA_LEVEL_Y) + SURFACE_OFFSET,
            z: position.z,
          });
        }
        nextDistance += lightSpacing;
      }

      distanceAccum += segmentLength;
    }
  }

  // Merge all ribbon pieces into a single, draped road mesh
  if (roadGeometries.length > 0) {
    const merged = mergeGeometries(roadGeometries, false) || new THREE.BufferGeometry();
    // dispose the temp pieces
    for (const g of roadGeometries) g.dispose();
    const roadMaterial =
      createVisibleRoad._material ||
      new THREE.MeshStandardMaterial({ color: 0x2f2f2f, roughness: 1.0, metalness: 0.0, side: THREE.DoubleSide });
    const roadsMesh = new THREE.Mesh(merged, roadMaterial);
    roadsMesh.name = "CityRoads";
    roadsMesh.renderOrder = 1;        // win depth vs semi-transparent water
    roadsMesh.userData.noCollision = true; // visual only
    roadsMesh.castShadow = false;
    roadsMesh.receiveShadow = true;
    roadsMesh.visible = roadsVisible;
    city.add(roadsMesh);
  }

  // Pocket Plazas
  if (pocketPlazas.length > 0) {
    for (const plaza of pocketPlazas) {
      addFoundationPad(city, plaza.x, plaza.y, plaza.z, 2.2);
    }
  }

  // Main-Avenue Streetlights
  if (mainAvenueLightPositions.length > 0) {
    const poleGeometry = new THREE.CylinderGeometry(0.06, 0.08, 1, 8);
    poleGeometry.translate(0, 0.5, 0);
    const lampGeometry = new THREE.SphereGeometry(0.18, 12, 12);

    const poleMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d3d3d,
      roughness: 0.85,
      metalness: 0.25,
    });
    const lampMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff2d0,
      emissive: new THREE.Color(0xfff2c0),
      emissiveIntensity: 0.0,
      roughness: 0.45,
      metalness: 0.05,
    });

    const poleHeight = 3.4;
    const lightCount = mainAvenueLightPositions.length;
    const poles = new THREE.InstancedMesh(poleGeometry, poleMaterial, lightCount);
    const lamps = new THREE.InstancedMesh(lampGeometry, lampMaterial, lightCount);

    poles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    lamps.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    poles.castShadow = false;
    poles.receiveShadow = true;
    lamps.castShadow = false;
    lamps.receiveShadow = false;
    poles.userData.noCollision = true;
    lamps.userData.noCollision = true;

    for (let i = 0; i < lightCount; i++) {
      const pos = mainAvenueLightPositions[i];
      _position.set(pos.x, pos.y, pos.z);
      _quaternion.identity();
      _scale.set(1, poleHeight, 1);
      _matrix.compose(_position, _quaternion, _scale);
      poles.setMatrixAt(i, _matrix);

      _position.set(pos.x, pos.y + poleHeight + 0.18, pos.z);
      _scale.set(1, 1, 1);
      _matrix.compose(_position, _quaternion, _scale);
      lamps.setMatrixAt(i, _matrix);
    }

    poles.instanceMatrix.needsUpdate = true;
    lamps.instanceMatrix.needsUpdate = true;
    poles.visible = roadsVisible;
    lamps.visible = roadsVisible;

    city.add(poles);
    city.add(lamps);

    city.userData.streetlights = {
      material: lampMaterial,
      dayIntensity: 0.0,
      nightIntensity: 1.6,
    };
  }

  const walkwayPoints = [];
  const walkwaySpan = Math.max(gridSize.x, gridSize.y) * 0.6;
  for (let i = 0; i < 5; i++) {
    const alpha = i / 4;
    const x = origin.x - walkwaySpan * 0.5 + walkwaySpan * alpha;
    const z = origin.z + Math.sin(alpha * Math.PI * 1.2 - Math.PI * 0.3) * (gridSize.y * 0.45);
    const y = sampleHeight(terrain, x, z, SEA_LEVEL_Y) + SURFACE_OFFSET;
    walkwayPoints.push(new THREE.Vector3(x, y, z));
  }
  if (walkwayPoints.length >= 2) {
    const walkway = createRoad(city, walkwayPoints, {
      width: 3.2,
      segments: 64,
      name: "CityWalkway",
      noCollision: true,
      color: 0x4b3f35,
    });
    if (walkway) {
      walkway.visible = roadsVisible;
    }
  }

  const instanceCount = placements.length;
  if (instanceCount === 0) {
    scene.add(city);
    return city;
  }

  const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
  wallGeometry.translate(0, 0.5, 0);
  const roofGeometry = new THREE.CylinderGeometry(0, 0.5, 1, 4, 1, false);
  roofGeometry.rotateY(Math.PI / 4);
  roofGeometry.translate(0, 0.5, 0);

  const wallsMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.6,
    metalness: 0.08,
    emissive: new THREE.Color(0xffdfa1),
    emissiveIntensity: 0.08,
    clearcoat: 0.15,
    clearcoatRoughness: 0.6,
    sheen: 0.1,
    envMapIntensity: 0.7,
  });

  const roofsMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.85,
    metalness: 0.05,
    clearcoat: 0.05,
    clearcoatRoughness: 0.8,
    envMapIntensity: 0.5,
  });

  const walls = new THREE.InstancedMesh(wallGeometry, wallsMaterial, instanceCount);
  const roofs = new THREE.InstancedMesh(roofGeometry, roofsMaterial, instanceCount);
  walls.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  roofs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  walls.castShadow = true;
  walls.receiveShadow = true;
  roofs.castShadow = true;
  roofs.receiveShadow = false;

  for (let i = 0; i < placements.length; i++) {
    const placement = placements[i];
    _position.set(placement.x, placement.y, placement.z);
    _quaternion.setFromAxisAngle(_rotationAxis, placement.rotation);
    _scale.set(placement.width, placement.wallHeight, placement.depth);
    _matrix.compose(_position, _quaternion, _scale);
    walls.setMatrixAt(i, _matrix);
    walls.setColorAt(i, _color.copy(placement.wallColor));

    _position.y = placement.y + placement.wallHeight;
    _roofScale.set(placement.width * 1.04, placement.roofHeight, placement.depth * 1.04);
    _matrix.compose(_position, _quaternion, _roofScale);
    roofs.setMatrixAt(i, _matrix);
    roofs.setColorAt(i, _color.copy(placement.roofColor));
  }

  if (walls.instanceMatrix) {
    walls.instanceMatrix.needsUpdate = true;
  }
  if (roofs.instanceMatrix) {
    roofs.instanceMatrix.needsUpdate = true;
  }
  if (walls.instanceColor) walls.instanceColor.needsUpdate = true;
  if (roofs.instanceColor) roofs.instanceColor.needsUpdate = true;

  city.add(walls);
  city.add(roofs);

  city.userData.walls = walls;
  city.userData.roofs = roofs;
  city.userData.lighting = {
    material: wallsMaterial,
    dayIntensity: 0.08,
    nightIntensity: 1.35,
  };

  scene.add(city);
  return city;
}

export function updateCityLighting(city, nightFactor = 0) {
  if (!city) return;
  const factor = THREE.MathUtils.clamp(nightFactor, 0, 1);

  const lighting = city.userData?.lighting;
  if (lighting?.material) {
    const target = THREE.MathUtils.lerp(lighting.dayIntensity, lighting.nightIntensity, factor);
    lighting.material.emissiveIntensity = target;
  }

  const streetlights = city.userData?.streetlights;
  if (streetlights?.material) {
    const lampTarget = THREE.MathUtils.lerp(
      streetlights.dayIntensity ?? 0,
      streetlights.nightIntensity ?? 1,
      factor
    );
    streetlights.material.emissiveIntensity = lampTarget;
  }
}

export function createHillCity(scene, terrain, curve, opts = {}) {
  const {
    seed = 20251007,
    buildingCount = 140,
    spacing = 5.5,
    harborBand = [SEA_LEVEL_Y + 3.0, SEA_LEVEL_Y + 5.5],
    agoraBand = [SEA_LEVEL_Y + 3.0, SEA_LEVEL_Y + 8.0],
    acroBand = [SEA_LEVEL_Y + 7.0, SEA_LEVEL_Y + 14.0],
    avoidHarborRadius = HARBOR_EXCLUDE_RADIUS + 18,
  } = opts;

  const rng = makeRng(seed);
  const lots = [];
  const getH = terrain?.userData?.getHeightAt?.bind(terrain?.userData);
  const cell = (spacing || 6) * 0.8; // slightly tighter than visual spacing
  const hash = new Map();
  const keyFrom = (x, z) => `${Math.round(x / cell)}_${Math.round(z / cell)}`;
  const center2 = new THREE.Vector2(AGORA_CENTER_3D.x, AGORA_CENTER_3D.z);

  const targets = [
    { band: harborBand, tries: Math.floor(buildingCount * 0.35) },
    { band: agoraBand, tries: Math.floor(buildingCount * 0.45) },
    { band: acroBand, tries: Math.floor(buildingCount * 0.2) },
  ];

  const tmp2 = new THREE.Vector2();
  let placed = 0;

  for (const { band, tries } of targets) {
    let attempts = 0;
    while (attempts++ < tries && placed < buildingCount) {
      const r = Math.sqrt(rng()) * CITY_AREA_RADIUS;
      const t = rng() * Math.PI * 2;
      const x = center2.x + Math.cos(t) * r;
      const z = center2.y + Math.sin(t) * r;

      // keep shoreline clear (radius-aware)
      const distHarbor = tmp2
        .set(x, z)
        .distanceTo(new THREE.Vector2(HARBOR_CENTER_3D.x, HARBOR_CENTER_3D.z));
      if (distHarbor < avoidHarborRadius) continue;

      const h = getH ? getH(x, z) : undefined;
      if (!Number.isFinite(h)) continue;
      if (h < band[0] || h > band[1]) continue;
      if (h < SEA_LEVEL_Y + MIN_ABOVE_SEA) continue;

      const k = keyFrom(x, z);
      if (hash.has(k)) continue; // avoid duplicates early

      // slope check (1m samples)
      const hX = getH ? getH(x + 1.2, z) : h;
      const hZ = getH ? getH(x, z + 1.2) : h;
      if (!Number.isFinite(hX) || !Number.isFinite(hZ)) continue;
      const slope = Math.max(Math.abs(hX - h), Math.abs(hZ - h));
      if (slope > MAX_SLOPE_DELTA) continue;

      hash.set(k, true);
      lots.push(new THREE.Vector3(x, h, z));
      placed++;
    }
  }

  // Instantiate using your existing instanced meshes (reuse materials/geometry)
  const { group, walls, roofs, dummy } = ensureInstancedSets(scene);

  const tangent = new THREE.Vector3();
  const down = new THREE.Vector3().subVectors(HARBOR_CENTER_3D, AGORA_CENTER_3D).normalize();
  let i = 0;

  for (const p of lots) {
    // orientation by road tangent if nearby, else face downhill
    let yaw = 0;
    if (curve) {
      const t = nearestTOnCurve(curve, p, 180);
      const pt = curve.getPoint(t);
      const nxt = curve.getPoint(Math.min(1, t + 1e-2));
      tangent.subVectors(nxt, pt).normalize();
      yaw = Math.atan2(tangent.x, tangent.z);
    } else {
      yaw = Math.atan2(down.x, down.z);
    }

    // foundation: clamp EVERY placement to terrain sample AFTER any nudges
    const ySample = getH ? getH(p.x, p.z) : p.y;
    const liftedSample = Number.isFinite(ySample)
      ? ySample + SURFACE_OFFSET
      : p.y + SURFACE_OFFSET;
    const baseY = Math.max(liftedSample, SEA_LEVEL_Y + MIN_ABOVE_SEA + SURFACE_OFFSET);

    const buildingScale = 0.9 + rng() * 0.3;
    const padRadius = Math.max(2.0, 1.8 * buildingScale);
    addFoundationPad(scene, p.x, baseY, p.z, padRadius);

    // walls
    dummy.position.set(p.x, baseY + 1.0, p.z);
    dummy.rotation.set(0, yaw, 0);
    dummy.scale.setScalar(buildingScale);
    dummy.updateMatrix();
    walls.setMatrixAt(i, dummy.matrix);

    // roof
    dummy.position.set(p.x, baseY + 2.0, p.z);
    dummy.rotation.set(0, yaw, 0);
    dummy.updateMatrix();
    roofs.setMatrixAt(i, dummy.matrix);

    i++;
  }

  walls.count = roofs.count = i;
  walls.instanceMatrix.needsUpdate = true;
  roofs.instanceMatrix.needsUpdate = true;

  return group;
}

function makeRng(seed = 1337) {
  let s = (seed >>> 0) || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff);
}

function ensureInstancedSets(scene, capacity = 120) {
  const cache = __ensureInstancedSets(scene, capacity);
  if (cache && !cache.dummy) {
    cache.dummy = cache._dummy ?? new THREE.Object3D();
    cache._dummy = cache.dummy;
  }
  if (cache?.walls?.material) {
    cache.walls.material.depthWrite = true;
    cache.walls.material.transparent = false;
  }
  if (cache?.roofs?.material) {
    cache.roofs.material.depthWrite = true;
    cache.roofs.material.transparent = false;
  }
  if (cache?.walls) {
    cache.walls.renderOrder = 2;
  }
  if (cache?.roofs) {
    cache.roofs.renderOrder = 2;
  }
  return cache;
}

function nearestTOnCurve(curve, p, samples) {
  let bestT = 0;
  let bestD = Infinity;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const c = curve.getPoint(t);
    const d = (c.x - p.x) * (c.x - p.x) + (c.z - p.z) * (c.z - p.z);
    if (d < bestD) {
      bestD = d;
      bestT = t;
    }
  }
  return bestT;
}

const DEFAULT_CAPACITY = 240;
let _instancedCache = null;

function __ensureInstancedSets(scene, capacity = DEFAULT_CAPACITY) {
  if (!scene) {
    throw new Error("Scene is required for hill city instancing");
  }

  const effectiveCapacity = Math.max(1, Math.min(1024, capacity | 0 || DEFAULT_CAPACITY));
  if (_instancedCache && _instancedCache.capacity >= effectiveCapacity) {
    if (_instancedCache.group.parent !== scene) {
      scene.add(_instancedCache.group);
    }
    if (!_instancedCache.dummy) {
      _instancedCache.dummy = _instancedCache._dummy ?? new THREE.Object3D();
      _instancedCache._dummy = _instancedCache.dummy;
    }
    resetInstancedMeshes(_instancedCache);
    return _instancedCache;
  }

  if (_instancedCache) {
    if (_instancedCache.group.parent) {
      _instancedCache.group.parent.remove(_instancedCache.group);
    }
  }

  const wallGeometry = getSharedWallGeometry();
  const roofGeometry = getSharedRoofGeometry();

  const wallsMaterial = createWallsMaterial();
  const roofsMaterial = createRoofsMaterial();

  const walls = new THREE.InstancedMesh(wallGeometry, wallsMaterial, effectiveCapacity);
  const roofs = new THREE.InstancedMesh(roofGeometry, roofsMaterial, effectiveCapacity);
  walls.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  roofs.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  walls.castShadow = true;
  walls.receiveShadow = true;
  roofs.castShadow = true;
  roofs.receiveShadow = false;

  const group = new THREE.Group();
  group.name = "HillCity";
  group.add(walls);
  group.add(roofs);

  const dummy = new THREE.Object3D();
  const cache = {
    group,
    walls,
    roofs,
    dummy,
    _dummy: dummy,
    capacity: effectiveCapacity,
  };

  walls.userData.capacity = effectiveCapacity;
  roofs.userData.capacity = effectiveCapacity;

  _instancedCache = cache;
  resetInstancedMeshes(cache);
  scene.add(group);
  return cache;
}

function resetInstancedMeshes(cache) {
  cache.walls.count = 0;
  cache.roofs.count = 0;
  cache.group.visible = false;
  cache.walls.instanceMatrix.needsUpdate = true;
  cache.roofs.instanceMatrix.needsUpdate = true;
  if (cache.walls.instanceColor) cache.walls.instanceColor.needsUpdate = true;
  if (cache.roofs.instanceColor) cache.roofs.instanceColor.needsUpdate = true;
}

let _sharedWallGeometry = null;
let _sharedRoofGeometry = null;

function getSharedWallGeometry() {
  if (!_sharedWallGeometry) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    geometry.translate(0, 0.5, 0);
    _sharedWallGeometry = geometry;
  }
  return _sharedWallGeometry;
}

function getSharedRoofGeometry() {
  if (!_sharedRoofGeometry) {
    const geometry = new THREE.CylinderGeometry(0, 0.5, 1, 4, 1, false);
    geometry.rotateY(Math.PI / 4);
    geometry.translate(0, 0.5, 0);
    _sharedRoofGeometry = geometry;
  }
  return _sharedRoofGeometry;
}

function createWallsMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.6,
    metalness: 0.08,
    emissive: new THREE.Color(0xffdfa1),
    emissiveIntensity: 0.08,
    clearcoat: 0.15,
    clearcoatRoughness: 0.6,
    sheen: 0.1,
    envMapIntensity: 0.7,
  });
}

function createRoofsMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.85,
    metalness: 0.05,
    clearcoat: 0.05,
    clearcoatRoughness: 0.8,
    envMapIntensity: 0.5,
  });
}
