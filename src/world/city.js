import * as THREE from "three";
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
  AGORA_CENTER_3D,
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

/**
 * Distribute buildings in three tiers: Harbor Quarter (low), Agora District (mid), Acropolis Crown (high).
 * - Enforces min height above sea
 * - Skips steep slope
 * - Orients facades to face along the main road (or toward harbor if far)
 */
export function createHillCity(scene, terrain, curve, opts = {}) {
  const {
    seed = 20251007,
    buildingCount = 120,
    spacing = 5.5,
    harborBand = [SEA_LEVEL_Y + MIN_ABOVE_SEA, SEA_LEVEL_Y + 3.5],
    agoraBand = [SEA_LEVEL_Y + 3.0, SEA_LEVEL_Y + 8.0],
    acroBand = [SEA_LEVEL_Y + 7.0, SEA_LEVEL_Y + 14.0],
    avoidHarborRadius = HARBOR_EXCLUDE_RADIUS + 8,
  } = opts;

  const { group, walls, roofs, _dummy, capacity } = ensureInstancedSets(scene, buildingCount);

  const rng = makeRng(seed);
  const lots = [];
  const center2 = new THREE.Vector2(AGORA_CENTER_3D.x, AGORA_CENTER_3D.z);
  const agoraToHarborDir = new THREE.Vector2(
    HARBOR_CENTER_3D.x - AGORA_CENTER_3D.x,
    HARBOR_CENTER_3D.z - AGORA_CENTER_3D.z,
  );
  if (agoraToHarborDir.lengthSq() > 0) {
    agoraToHarborDir.normalize();
  } else {
    agoraToHarborDir.set(0, 1);
  }
  const viewCorridorCos = Math.cos(THREE.MathUtils.degToRad(10));
  const viewVector = new THREE.Vector2();

  const targets = [
    { band: harborBand, tries: Math.floor(buildingCount * 0.35) },
    { band: agoraBand, tries: Math.floor(buildingCount * 0.45) },
    { band: acroBand, tries: Math.floor(buildingCount * 0.2) },
  ];

  const tmp2 = new THREE.Vector2();
  const harbor2 = new THREE.Vector2(HARBOR_CENTER_3D.x, HARBOR_CENTER_3D.z);
  let placed = 0;

  for (const { band, tries } of targets) {
    let attempts = 0;
    while (attempts++ < tries && placed < buildingCount) {
      const r = Math.sqrt(rng()) * CITY_AREA_RADIUS;
      const t = rng() * Math.PI * 2;
      const x = center2.x + Math.cos(t) * r;
      const z = center2.y + Math.sin(t) * r;

      if (tmp2.set(x, z).distanceTo(harbor2) < avoidHarborRadius) continue;

      const h = terrain?.userData?.getHeightAt?.(x, z);
      if (h == null) continue;
      if (h < band[0] || h > band[1]) continue;
      if (h < SEA_LEVEL_Y + MIN_ABOVE_SEA) continue;

      const hX = terrain.userData.getHeightAt(x + 1.2, z);
      const hZ = terrain.userData.getHeightAt(x, z + 1.2);
      if (hX == null || hZ == null) continue;
      const slope = Math.max(Math.abs(hX - h), Math.abs(hZ - h));
      if (slope > MAX_SLOPE_DELTA) continue;

      const width = THREE.MathUtils.lerp(3.6, 6.6, rng());
      const depth = THREE.MathUtils.lerp(3.4, 6.4, rng());
      const wallHeight = THREE.MathUtils.lerp(2.7, 4.4, rng());
      const roofHeight = wallHeight * THREE.MathUtils.lerp(0.32, 0.55, rng());
      const lot = {
        position: new THREE.Vector3(x, h, z),
        width,
        depth,
        wallHeight,
        roofHeight,
        wallHue: THREE.MathUtils.lerp(0.08, 0.13, rng()),
        wallLightness: THREE.MathUtils.lerp(0.6, 0.76, rng()),
        roofHue: THREE.MathUtils.lerp(0.02, 0.045, rng()),
        roofLightness: THREE.MathUtils.lerp(0.24, 0.34, rng()),
        radius: Math.max(width, depth) * 0.5,
      };

      lots.push(lot);
      placed++;
    }
  }

  lots.sort(() => rng() - 0.5);

  const tangent = new THREE.Vector3();
  const roadPoint = new THREE.Vector3();
  const roadNext = new THREE.Vector3();
  const roadSide = new THREE.Vector2();
  const roadDelta = new THREE.Vector2();
  const down = new THREE.Vector3().subVectors(HARBOR_CENTER_3D, AGORA_CENTER_3D).normalize();
  const dummy = _dummy;
  const placements = [];

  const separation = Math.max(0, spacing);
  for (const lot of lots) {
    if (placements.length >= capacity) break;
    const p = lot.position;

    viewVector.set(center2.x - p.x, center2.y - p.z);
    const agoraDistance = viewVector.length();
    if (agoraDistance < 25) {
      if (agoraDistance < 1e-3) {
        continue;
      }
      viewVector.multiplyScalar(1 / agoraDistance);
      const angleCos = viewVector.dot(agoraToHarborDir);
      if (angleCos > viewCorridorCos) {
        continue;
      }
    }

    if (curve) {
      const t = nearestTOnCurve(curve, p, 180);
      roadPoint.copy(curve.getPoint(t));
      roadDelta.set(p.x - roadPoint.x, p.z - roadPoint.z);
      const distSq = roadDelta.lengthSq();
      if (distSq < 16) {
        roadNext.copy(curve.getPoint(Math.min(1, t + 1e-3)));
        tangent.subVectors(roadNext, roadPoint);
        tangent.y = 0;
        if (tangent.lengthSq() > 1e-6) {
          tangent.normalize();
          roadSide.set(-tangent.z, tangent.x).normalize();
          if (roadSide.lengthSq() > 0) {
            if (distSq > 1e-6 && roadSide.dot(roadDelta) < 0) {
              roadSide.negate();
            }
            p.x += roadSide.x * 1.2;
            p.z += roadSide.y * 1.2;

            const adjustedHeight = terrain?.userData?.getHeightAt?.(p.x, p.z);
            if (Number.isFinite(adjustedHeight)) {
              if (adjustedHeight < SEA_LEVEL_Y + MIN_ABOVE_SEA) {
                continue;
              }
              lot.position.y = adjustedHeight;
            }
          }
        }
      }
    }

    let blocked = false;
    for (const other of placements) {
      const desired = lot.radius + other.radius + separation;
      if (lot.position.distanceToSquared(other.position) < desired * desired) {
        blocked = true;
        break;
      }
    }
    if (!blocked) {
      placements.push(lot);
    }
  }

  let i = 0;
  const wallColor = new THREE.Color();
  const roofColor = new THREE.Color();
  for (const lot of placements) {
    const p = lot.position;

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

    dummy.position.set(p.x, p.y, p.z);
    dummy.rotation.set(0, yaw, 0);
    dummy.scale.set(lot.width, lot.wallHeight, lot.depth);
    dummy.updateMatrix();
    walls.setMatrixAt(i, dummy.matrix);
    if (walls.instanceColor) {
      wallColor.setHSL(lot.wallHue, 0.45, lot.wallLightness);
      walls.setColorAt(i, wallColor);
    }

    dummy.position.set(p.x, p.y + lot.wallHeight, p.z);
    dummy.rotation.set(0, yaw, 0);
    dummy.scale.set(lot.width * 1.04, lot.roofHeight, lot.depth * 1.04);
    dummy.updateMatrix();
    roofs.setMatrixAt(i, dummy.matrix);
    if (roofs.instanceColor) {
      roofColor.setHSL(lot.roofHue, 0.55, lot.roofLightness);
      roofs.setColorAt(i, roofColor);
    }

    i++;
    if (i >= capacity) break;
  }

  walls.count = roofs.count = i;
  walls.instanceMatrix.needsUpdate = true;
  roofs.instanceMatrix.needsUpdate = true;
  if (walls.instanceColor) walls.instanceColor.needsUpdate = true;
  if (roofs.instanceColor) roofs.instanceColor.needsUpdate = true;

  group.visible = i > 0;
  return group;
}

function makeRng(seed = 1337) {
  let s = (seed >>> 0) || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff);
}

function ensureInstancedSets(scene, capacity = 120) {
  return __ensureInstancedSets(scene, capacity);
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

  const cache = {
    group,
    walls,
    roofs,
    _dummy: new THREE.Object3D(),
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
  return new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.6,
    metalness: 0.08,
    emissive: new THREE.Color(0xffdfa1),
    emissiveIntensity: 0.08,
  });
}

function createRoofsMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.85,
    metalness: 0.05,
  });
}
