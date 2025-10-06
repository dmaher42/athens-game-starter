import * as THREE from "three";
import { SEA_LEVEL } from "./locations.js";

const _tempObject = new THREE.Object3D();
const _tempColor = new THREE.Color();

function createSeededRng(seed = 1) {
  let h = 0;
  if (typeof seed === "string") {
    for (let i = 0; i < seed.length; i++) {
      h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    }
  } else {
    h = seed >>> 0;
  }
  if (h === 0) {
    h = 0x9e3779b9;
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 0xffffffff;
  };
}

function sampleLot(terrain, center, halfWidth, halfDepth) {
  if (!terrain || !terrain.userData || typeof terrain.userData.getHeightAt !== "function") {
    return null;
  }
  const getHeightAt = terrain.userData.getHeightAt;
  const corners = [
    new THREE.Vector2(center.x - halfWidth, center.z - halfDepth),
    new THREE.Vector2(center.x + halfWidth, center.z - halfDepth),
    new THREE.Vector2(center.x - halfWidth, center.z + halfDepth),
    new THREE.Vector2(center.x + halfWidth, center.z + halfDepth),
    new THREE.Vector2(center.x, center.z),
  ];

  const heights = [];
  for (const corner of corners) {
    const height = getHeightAt(corner.x, corner.z);
    if (height == null) {
      return null;
    }
    heights.push(height);
  }

  let min = heights[0];
  let max = heights[0];
  let sum = 0;
  for (const value of heights) {
    min = Math.min(min, value);
    max = Math.max(max, value);
    sum += value;
  }

  return {
    height: sum / heights.length,
    slope: max - min,
  };
}

function applyInstanceTransform(instanced, index, position, rotationY, scale) {
  _tempObject.position.copy(position);
  _tempObject.rotation.set(0, rotationY, 0);
  _tempObject.scale.copy(scale);
  _tempObject.updateMatrix();
  instanced.setMatrixAt(index, _tempObject.matrix);
}

function colorFromPalette(rng, palette) {
  const color = palette[Math.floor(rng() * palette.length)] ?? palette[0];
  return _tempColor.set(color);
}

export function createCity(scene, terrain, options = {}) {
  const group = new THREE.Group();
  group.name = "HarborCity";
  scene.add(group);

  const center = options.center ? options.center.clone() : new THREE.Vector3(-70, SEA_LEVEL, 25);
  const seed = options.seed ?? 2024;
  const rng = createSeededRng(seed);

  const columns = options.columns ?? 6;
  const rows = options.rows ?? 5;
  const spacing = options.spacing ?? 12;
  const footprintRange = options.footprintRange ?? [6, 9];
  const depthRange = options.depthRange ?? [6, 10];
  const heightRange = options.heightRange ?? [4, 9];
  const roofHeightRange = options.roofHeightRange ?? [0.8, 2.2];
  const maxSlope = options.maxSlope ?? 1.8;

  const maxInstances = columns * rows;
  const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xcbb49a),
    roughness: 0.78,
    metalness: 0.08,
  });
  const wallMesh = new THREE.InstancedMesh(wallGeometry, wallMaterial, maxInstances);
  wallMesh.castShadow = true;
  wallMesh.receiveShadow = true;
  wallMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  wallMesh.userData.noCollision = false;

  const roofGeometry = new THREE.ConeGeometry(1, 1, 4);
  roofGeometry.rotateY(Math.PI / 4);
  const roofMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x7a422a),
    roughness: 0.6,
    metalness: 0.05,
    emissive: new THREE.Color(0x120600),
    emissiveIntensity: 0.0,
  });
  const roofMesh = new THREE.InstancedMesh(roofGeometry, roofMaterial, maxInstances);
  roofMesh.castShadow = true;
  roofMesh.receiveShadow = true;
  roofMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  roofMesh.userData.noCollision = true;

  const wallPalette = [0xdcc7ae, 0xc5b89f, 0xbda98c, 0xd0c3b1];
  const roofPalette = [0x884b30, 0x6e3825, 0x9b5733, 0x70422b];

  let instanceIndex = 0;
  const offsetX = (columns - 1) * spacing * 0.5;
  const offsetZ = (rows - 1) * spacing * 0.5;

  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  let accumulatedHeight = 0;
  let sampledLots = 0;

  for (let ix = 0; ix < columns; ix++) {
    for (let iz = 0; iz < rows; iz++) {
      const lotCenterX = center.x + ix * spacing - offsetX;
      const lotCenterZ = center.z + iz * spacing - offsetZ;

      const footprint = THREE.MathUtils.lerp(footprintRange[0], footprintRange[1], rng());
      const depth = THREE.MathUtils.lerp(depthRange[0], depthRange[1], rng());
      const rotationY = Math.round(rng()) * (Math.PI / 2);

      position.set(lotCenterX, 0, lotCenterZ);
      const sample = sampleLot(terrain, position, footprint * 0.5, depth * 0.5);
      if (!sample || sample.slope > maxSlope) {
        continue;
      }

      const baseHeight = sample.height;
      const height = THREE.MathUtils.lerp(heightRange[0], heightRange[1], rng());
      const roofHeight = THREE.MathUtils.lerp(roofHeightRange[0], roofHeightRange[1], rng());

      accumulatedHeight += baseHeight;
      sampledLots++;

      position.y = baseHeight + height * 0.5;
      scale.set(footprint, height, depth);
      applyInstanceTransform(wallMesh, instanceIndex, position, rotationY, scale);
      wallMesh.setColorAt(instanceIndex, colorFromPalette(rng, wallPalette));

      position.y = baseHeight + height + roofHeight * 0.5 - 0.1;
      scale.set(footprint * 0.92, roofHeight, depth * 0.92);
      applyInstanceTransform(roofMesh, instanceIndex, position, rotationY, scale);
      roofMesh.setColorAt(instanceIndex, colorFromPalette(rng, roofPalette));

      instanceIndex++;
    }
  }

  wallMesh.count = instanceIndex;
  roofMesh.count = instanceIndex;
  wallMesh.instanceMatrix.needsUpdate = true;
  roofMesh.instanceMatrix.needsUpdate = true;
  if (wallMesh.instanceColor) wallMesh.instanceColor.needsUpdate = true;
  if (roofMesh.instanceColor) roofMesh.instanceColor.needsUpdate = true;

  group.add(wallMesh);
  group.add(roofMesh);

  const plazaWidth = columns * spacing + 6;
  const plazaDepth = rows * spacing + 6;
  const plazaGeometry = new THREE.PlaneGeometry(plazaWidth, plazaDepth, 1, 1);
  plazaGeometry.rotateX(-Math.PI / 2);
  const plazaMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a7f6a,
    roughness: 0.95,
    metalness: 0.02,
  });
  const plaza = new THREE.Mesh(plazaGeometry, plazaMaterial);
  const plazaHeight = sampledLots > 0 ? accumulatedHeight / sampledLots : SEA_LEVEL;
  plaza.position.set(center.x, plazaHeight + 0.02, center.z);
  plaza.receiveShadow = true;
  plaza.userData.noCollision = true;
  group.add(plaza);

  group.userData.city = {
    walls: wallMesh,
    roofs: roofMesh,
    wallMaterial,
    roofMaterial,
    plaza,
    colors: {
      wallDay: new THREE.Color(0xcbb49a),
      wallNight: new THREE.Color(0x726c61),
      roofDay: new THREE.Color(0x7a422a),
      roofNight: new THREE.Color(0x231410),
      windowGlow: new THREE.Color(0xffdca8),
    },
  };

  return group;
}

const _lightingColor = new THREE.Color();

export function updateCityLighting(city, nightFactor = 0) {
  if (!city || !city.userData || !city.userData.city) return;
  const data = city.userData.city;
  const t = THREE.MathUtils.clamp(nightFactor, 0, 1);

  _lightingColor.copy(data.colors.wallDay).lerp(data.colors.wallNight, t);
  data.wallMaterial.color.copy(_lightingColor);

  _lightingColor.copy(data.colors.roofDay).lerp(data.colors.roofNight, t);
  data.roofMaterial.color.copy(_lightingColor);

  const emissive = THREE.MathUtils.lerp(0.05, 0.35, t);
  data.wallMaterial.emissive.copy(data.colors.windowGlow).multiplyScalar(emissive * 0.4);
  data.wallMaterial.emissiveIntensity = emissive;
  data.roofMaterial.emissiveIntensity = Math.max(0.1 * t, 0.02);
}
