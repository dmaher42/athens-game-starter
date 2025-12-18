import * as THREE from 'three';
import { AGORA_CENTER_3D } from './locations.js';

function ensureVector3(value, fallback = new THREE.Vector3()) {
  if (value instanceof THREE.Vector3) {
    return value.clone();
  }
  if (value && typeof value === 'object') {
    return new THREE.Vector3(value.x ?? 0, value.y ?? 0, value.z ?? 0);
  }
  return fallback.clone();
}

function toColor(value, fallback = 0xffffff) {
  if (value instanceof THREE.Color) {
    return value.clone();
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return new THREE.Color(value);
  }
  return new THREE.Color(fallback);
}

function createZoneRing(innerRadius, outerRadius, color, options = {}) {
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, options.segments ?? 64);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({
    color: toColor(color),
    transparent: true,
    opacity: options.opacity ?? 0.35,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = options.name ?? 'PlanZone';
  mesh.userData.noCollision = true;
  return mesh;
}

function createZoneDisc(radius, color, options = {}) {
  const geometry = new THREE.CircleGeometry(radius, options.segments ?? 48);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({
    color: toColor(color),
    transparent: true,
    opacity: options.opacity ?? 0.3,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = options.name ?? 'PlanCore';
  mesh.userData.noCollision = true;
  return mesh;
}

function createCorridor(length, width, color, options = {}) {
  const height = options.height ?? 0.8;
  const geometry = new THREE.BoxGeometry(width, height, length);
  const material = new THREE.MeshStandardMaterial({
    color: toColor(color),
    transparent: true,
    opacity: options.opacity ?? 0.6,
    roughness: 0.85,
    metalness: 0.05,
    emissive: new THREE.Color(options.emissive ?? 0x000000),
    emissiveIntensity: options.emissiveIntensity ?? 0,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  mesh.userData.noCollision = true;
  mesh.name = options.name ?? 'PlanCorridor';
  return mesh;
}

function createGatewayMarker(color) {
  const material = new THREE.MeshStandardMaterial({
    color: toColor(color ?? 0x90caf9),
    emissive: new THREE.Color(0x13293d),
    emissiveIntensity: 0.45,
    transparent: true,
    opacity: 0.85,
    roughness: 0.4,
    metalness: 0.25,
  });
  const column = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 10, 24), material);
  column.name = 'GatewayColumn';
  column.castShadow = true;
  column.receiveShadow = true;
  column.userData.noCollision = true;

  const haloMaterial = new THREE.MeshBasicMaterial({
    color: material.color.clone(),
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
  });
  const halo = new THREE.Mesh(new THREE.CircleGeometry(6, 48), haloMaterial);
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = -5;
  halo.name = 'GatewayHalo';
  halo.userData.noCollision = true;

  const group = new THREE.Group();
  group.name = 'GatewayMarker';
  group.add(column, halo);
  return group;
}

export function createCityPlanImplementation(scene, options = {}) {
  const group = new THREE.Group();
  group.name = 'CityPlanImplementation';
  scene.add(group);

  const center = ensureVector3(options.center, ensureVector3(AGORA_CENTER_3D));
  const sampler =
    options.heightSampler ?? options.terrainSampler ?? options.terrain?.userData?.getHeightAt ?? null;
  const surfaceOffset = options.surfaceOffset ?? 0.4;

  const sample = (offsetX, offsetZ, fallback = 0) => {
    if (!sampler) {
      return center.y + surfaceOffset + fallback;
    }
    const sampled = sampler(center.x + offsetX, center.z + offsetZ);
    if (Number.isFinite(sampled)) {
      return sampled + surfaceOffset + fallback;
    }
    return center.y + surfaceOffset + fallback;
  };

  const civicCore = createZoneDisc(options.civicCoreRadius ?? 32, 0xffc046, {
    opacity: 0.28,
    name: 'CivicCoreOverlay',
  });
  civicCore.position.set(center.x, sample(0, 0), center.z);
  group.add(civicCore);

  const transitSpine = createCorridor(options.transitLength ?? 140, options.transitWidth ?? 8, 0xff7043, {
    name: 'TransitBackbone',
    opacity: 0.55,
    emissive: 0x784118,
    emissiveIntensity: 0.4,
  });
  transitSpine.position.set(center.x, sample(0, 0, 0), center.z);
  group.add(transitSpine);

  const innovation = createCorridor(options.innovationLength ?? 110, options.innovationWidth ?? 18, 0x42a5f5, {
    name: 'InnovationCorridor',
    opacity: 0.42,
  });
  innovation.position.set(center.x + (options.innovationOffsetX ?? 50), sample(0, 0, 0), center.z);
  innovation.rotation.y = options.innovationRotation ?? THREE.MathUtils.degToRad(12);
  group.add(innovation);

  const ringConfigs = [
    {
      name: 'NeighborhoodRingInner',
      inner: options.civicCoreRadius ?? 32,
      outer: options.neighborhoodInnerRadius ?? 58,
      color: 0x81c784,
      opacity: 0.22,
    },
    {
      name: 'NeighborhoodRingOuter',
      inner: options.neighborhoodInnerRadius ?? 58,
      outer: options.neighborhoodOuterRadius ?? 82,
      color: 0x4caf50,
      opacity: 0.18,
    },
    {
      name: 'GreenBlueBelt',
      inner: options.greenBeltInnerRadius ?? 86,
      outer: options.greenBeltOuterRadius ?? 120,
      color: 0x26c6da,
      opacity: 0.18,
    },
  ];

  for (const cfg of ringConfigs) {
    const ring = createZoneRing(cfg.inner, cfg.outer, cfg.color, {
      opacity: cfg.opacity,
      name: cfg.name,
    });
    ring.position.set(center.x, sample(0, 0), center.z);
    group.add(ring);
  }

  const gatewayRadius = options.gatewayRadius ?? 116;
  const gatewayColor = options.gatewayColor ?? 0x90caf9;
  const gatewayPoints = options.gatewayAngles ?? [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  for (const angle of gatewayPoints) {
    const marker = createGatewayMarker(gatewayColor);
    const x = center.x + Math.cos(angle) * gatewayRadius;
    const z = center.z + Math.sin(angle) * gatewayRadius;
    marker.position.set(x, sample(x - center.x, z - center.z, 0), z);
    marker.rotation.y = -angle + Math.PI / 2;
    group.add(marker);
  }

  group.userData = {
    ...group.userData,
    plan: {
      center,
      civicCoreRadius: options.civicCoreRadius ?? 32,
      neighborhoodInnerRadius: options.neighborhoodInnerRadius ?? 58,
      neighborhoodOuterRadius: options.neighborhoodOuterRadius ?? 82,
      greenBeltInnerRadius: options.greenBeltInnerRadius ?? 86,
      greenBeltOuterRadius: options.greenBeltOuterRadius ?? 120,
      gatewayRadius,
    },
  };

  return group;
}

export default createCityPlanImplementation;
