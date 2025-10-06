import * as THREE from "three";
import {
  CITY_CHUNK_CENTER,
  CITY_CHUNK_SIZE,
  CITY_JITTER,
  CITY_LAYOUT,
  CITY_MAX_SLOPE,
  CITY_COLOR_RANGES,
  CITY_SEED,
  CITY_SPACING_X,
  CITY_SPACING_Z,
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
  const spacingX = options.spacingX ?? CITY_SPACING_X;
  const spacingZ = options.spacingZ ?? CITY_SPACING_Z;
  const jitter = options.jitter ?? CITY_JITTER;
  const maxSlope = options.maxSlope ?? CITY_MAX_SLOPE;
  const layoutConfig = CITY_LAYOUT;
  const buildingConfig = layoutConfig.building;
  const walkwayConfig = layoutConfig.walkway;
  const lightingConfig = layoutConfig.lighting;
  const colorRanges = CITY_COLOR_RANGES;

  const countX = Math.max(3, Math.floor(gridSize.x / spacingX));
  const countZ = Math.max(3, Math.floor(gridSize.y / spacingZ));
  const halfX = (countX - 1) * spacingX * 0.5;
  const halfZ = (countZ - 1) * spacingZ * 0.5;

  const placements = [];

  for (let ix = 0; ix < countX; ix++) {
    for (let iz = 0; iz < countZ; iz++) {
      if (rng() < layoutConfig.emptyLotChance) {
        continue;
      }

      const centerX = origin.x + (ix * spacingX - halfX) + THREE.MathUtils.lerp(-jitter, jitter, rng());
      const centerZ = origin.z + (iz * spacingZ - halfZ) + THREE.MathUtils.lerp(-jitter, jitter, rng());

      const width = THREE.MathUtils.lerp(
        buildingConfig.widthRange[0],
        buildingConfig.widthRange[1],
        rng()
      );
      const depth = THREE.MathUtils.lerp(
        buildingConfig.depthRange[0],
        buildingConfig.depthRange[1],
        rng()
      );
      const wallHeight = THREE.MathUtils.lerp(
        buildingConfig.wallHeightRange[0],
        buildingConfig.wallHeightRange[1],
        rng()
      );
      const roofHeight =
        wallHeight *
        THREE.MathUtils.lerp(
          buildingConfig.roofHeightRatioRange[0],
          buildingConfig.roofHeightRatioRange[1],
          rng()
        );
      const rotationSteps = Math.max(
        1,
        options.rotationSteps ?? layoutConfig.rotationSteps
      );
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
        wallColor: new THREE.Color().setHSL(
          THREE.MathUtils.lerp(colorRanges.wallHue[0], colorRanges.wallHue[1], rng()),
          colorRanges.wallSaturation,
          THREE.MathUtils.lerp(
            colorRanges.wallLightness[0],
            colorRanges.wallLightness[1],
            rng()
          )
        ),
        roofColor: new THREE.Color().setHSL(
          THREE.MathUtils.lerp(colorRanges.roofHue[0], colorRanges.roofHue[1], rng()),
          colorRanges.roofSaturation,
          THREE.MathUtils.lerp(
            colorRanges.roofLightness[0],
            colorRanges.roofLightness[1],
            rng()
          )
        ),
      });
    }
  }

  const city = new THREE.Group();
  city.name = "HarborCity";

  const walkwayPoints = [];
  const sampleCount = Math.max(2, walkwayConfig.sampleCount);
  const walkwaySpan = Math.max(gridSize.x, gridSize.y) * walkwayConfig.spanFactor;
  for (let i = 0; i < sampleCount; i++) {
    const alpha = sampleCount > 1 ? i / (sampleCount - 1) : 0;
    const x = origin.x - walkwaySpan * 0.5 + walkwaySpan * alpha;
    const wave = Math.sin(
      alpha * Math.PI * walkwayConfig.waveFrequency + walkwayConfig.phaseOffset
    );
    const z = origin.z + wave * (gridSize.y * walkwayConfig.amplitudeFactor);
    const y = sampleHeight(terrain, x, z, SEA_LEVEL_Y) + walkwayConfig.heightOffset;
    walkwayPoints.push(new THREE.Vector3(x, y, z));
  }
  if (walkwayPoints.length >= 2) {
    createRoad(city, walkwayPoints, {
      width: walkwayConfig.width,
      segments: walkwayConfig.segments,
      name: walkwayConfig.name,
      noCollision: walkwayConfig.noCollision,
      color: walkwayConfig.color,
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
    _roofScale.set(
      placement.width * buildingConfig.roofScale,
      placement.roofHeight,
      placement.depth * buildingConfig.roofScale
    );
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
    dayIntensity: lightingConfig.dayIntensity,
    nightIntensity: lightingConfig.nightIntensity,
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
