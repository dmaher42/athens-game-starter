import * as THREE from "three";
import {
  CITY_CHUNK_CENTER,
  CITY_CHUNK_SIZE,
  CITY_SEED,
  SEA_LEVEL_Y,
} from "./locations.js";
import { createRoad } from "./roads.js";

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
  const spacingX = options.spacingX ?? 11;
  const spacingZ = options.spacingZ ?? 10;
  const jitter = options.jitter ?? 2.2;
  const maxSlope = options.maxSlope ?? 1.4;

  const countX = Math.max(3, Math.floor(gridSize.x / spacingX));
  const countZ = Math.max(3, Math.floor(gridSize.y / spacingZ));
  const halfX = (countX - 1) * spacingX * 0.5;
  const halfZ = (countZ - 1) * spacingZ * 0.5;

  const placements = [];

  for (let ix = 0; ix < countX; ix++) {
    for (let iz = 0; iz < countZ; iz++) {
      if (rng() < 0.18) {
        continue;
      }

      const centerX = origin.x + (ix * spacingX - halfX) + THREE.MathUtils.lerp(-jitter, jitter, rng());
      const centerZ = origin.z + (iz * spacingZ - halfZ) + THREE.MathUtils.lerp(-jitter, jitter, rng());

      const width = THREE.MathUtils.lerp(4.4, 7.2, rng());
      const depth = THREE.MathUtils.lerp(4.2, 7.8, rng());
      const wallHeight = THREE.MathUtils.lerp(2.6, 3.8, rng());
      const roofHeight = wallHeight * THREE.MathUtils.lerp(0.38, 0.55, rng());
      const rotationSteps = Math.max(1, options.rotationSteps ?? 4);
      const rotation =
        Math.floor(rng() * rotationSteps) * ((Math.PI * 2) / rotationSteps);

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

      const groundHeight = Math.max(lot.height, SEA_LEVEL_Y + 0.05);
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

  const walkwayPoints = [];
  const walkwaySpan = Math.max(gridSize.x, gridSize.y) * 0.6;
  for (let i = 0; i < 5; i++) {
    const alpha = i / 4;
    const x = origin.x - walkwaySpan * 0.5 + walkwaySpan * alpha;
    const z = origin.z + Math.sin(alpha * Math.PI * 1.2 - Math.PI * 0.3) * (gridSize.y * 0.45);
    const y = sampleHeight(terrain, x, z, SEA_LEVEL_Y) + 0.02;
    walkwayPoints.push(new THREE.Vector3(x, y, z));
  }
  if (walkwayPoints.length >= 2) {
    createRoad(city, walkwayPoints, {
      width: 3.2,
      segments: 64,
      name: "CityWalkway",
      noCollision: true,
      color: 0x4b3f35,
    });
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

  const wallsMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.6,
    metalness: 0.08,
    emissive: new THREE.Color(0xffdfa1),
    emissiveIntensity: 0.08,
  });

  const roofsMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.85,
    metalness: 0.05,
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
  const lighting = city.userData?.lighting;
  if (!lighting) return;

  const factor = THREE.MathUtils.clamp(nightFactor, 0, 1);
  const target = THREE.MathUtils.lerp(lighting.dayIntensity, lighting.nightIntensity, factor);
  lighting.material.emissiveIntensity = target;
}
