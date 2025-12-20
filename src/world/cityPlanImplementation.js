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

  const gatewayRadius = options.gatewayRadius ?? 116;

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
