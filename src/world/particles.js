import * as THREE from "three";

const DEFAULT_COUNT = 1000;
const DEFAULT_BOUNDS = 48;
const DEFAULT_SIZE = 0.2;
const DRIFT_SPEED = 0.15;

function createParticleTexture(size = 64) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const radius = size / 2;
  const gradient = ctx.createRadialGradient(radius, radius, radius * 0.15, radius, radius, radius);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
  gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.35)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createAtmosphericParticles(scene, options = {}) {
  if (!scene) return null;

  const count = Number.isFinite(options.count) ? options.count : DEFAULT_COUNT;
  const bounds = Number.isFinite(options.bounds) ? options.bounds : DEFAULT_BOUNDS;
  const size = Number.isFinite(options.size) ? options.size : DEFAULT_SIZE;
  const getCenter = typeof options.getCenter === "function" ? options.getCenter : null;

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const drift = new Float32Array(count * 3);
  const offsets = new Float32Array(count);
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.attributes.position.usage = THREE.DynamicDrawUsage;

  const material = new THREE.PointsMaterial({
    size,
    map: createParticleTexture(),
    transparent: true,
    depthWrite: false,
    opacity: 0.65,
    color: 0xffffff,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const center = new THREE.Vector3();
  const initialCenter = new THREE.Vector3();
  if (getCenter) {
    const value = getCenter();
    if (value) initialCenter.copy(value);
  }

  for (let i = 0; i < count; i++) {
    seedParticle(i, initialCenter);
  }

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  let time = 0;

  function seedParticle(index, targetCenter) {
    const i3 = index * 3;
    positions[i3] = targetCenter.x + THREE.MathUtils.randFloatSpread(bounds * 2);
    positions[i3 + 1] = targetCenter.y + THREE.MathUtils.randFloatSpread(bounds * 0.6);
    positions[i3 + 2] = targetCenter.z + THREE.MathUtils.randFloatSpread(bounds * 2);
    drift[i3] = THREE.MathUtils.randFloatSpread(0.12);
    drift[i3 + 1] = THREE.MathUtils.randFloatSpread(0.06);
    drift[i3 + 2] = THREE.MathUtils.randFloatSpread(0.12);
    offsets[index] = Math.random() * Math.PI * 2;
  }

  function wrapAxis(value, min, max) {
    if (value > max) return value - (max - min);
    if (value < min) return value + (max - min);
    return value;
  }

  function update(deltaTime = 0, elapsedTime = null) {
    if (Number.isFinite(elapsedTime)) {
      time = elapsedTime;
    } else {
      time += deltaTime;
    }
    if (getCenter) {
      const c = getCenter();
      if (c) center.copy(c);
    }

    const minX = center.x - bounds;
    const maxX = center.x + bounds;
    const minY = center.y - bounds * 0.5;
    const maxY = center.y + bounds * 0.5;
    const minZ = center.z - bounds;
    const maxZ = center.z + bounds;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const wave = Math.sin(time * DRIFT_SPEED + offsets[i]) * 0.05;
      positions[i3] += drift[i3] * deltaTime + wave * deltaTime;
      positions[i3 + 1] += drift[i3 + 1] * deltaTime + wave * 0.4 * deltaTime;
      positions[i3 + 2] += drift[i3 + 2] * deltaTime + wave * deltaTime;

      positions[i3] = wrapAxis(positions[i3], minX, maxX);
      positions[i3 + 1] = wrapAxis(positions[i3 + 1], minY, maxY);
      positions[i3 + 2] = wrapAxis(positions[i3 + 2], minZ, maxZ);
    }

    geometry.attributes.position.needsUpdate = true;
  }

  return {
    object: points,
    update,
  };
}

export function createSmokeEmitter(scene, options = {}) {
  if (!scene) return null;

  const count = options.count || 40;
  const size = options.size || 0.8;
  const color = options.color || 0x444444;
  const drift = options.drift || new THREE.Vector3(0.05, 0.4, 0.05);

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const lifetimes = new Float32Array(count); // 0..1 life span
  
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.attributes.position.usage = THREE.DynamicDrawUsage;

  const material = new THREE.PointsMaterial({
    size,
    map: createParticleTexture(),
    transparent: true,
    depthWrite: false,
    opacity: 0.4,
    color,
    blending: THREE.NormalBlending, // Normal blending for smoke looks better
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const origin = options.position ? options.position.clone() : new THREE.Vector3();
  const spawnRadius = 0.2;

  function resetParticle(i) {
    const i3 = i * 3;
    positions[i3] = origin.x + THREE.MathUtils.randFloatSpread(spawnRadius);
    positions[i3 + 1] = origin.y + THREE.MathUtils.randFloatSpread(spawnRadius);
    positions[i3 + 2] = origin.z + THREE.MathUtils.randFloatSpread(spawnRadius);
    lifetimes[i] = Math.random();
  }

  for (let i = 0; i < count; i++) {
    resetParticle(i);
  }

  function update(deltaTime) {
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      lifetimes[i] += deltaTime * (0.3 + Math.random() * 0.2);
      
      if (lifetimes[i] > 1) {
        resetParticle(i);
        lifetimes[i] = 0;
      }

      // Rise and slight horizontal drift
      positions[i3] += drift.x * deltaTime;
      positions[i3 + 1] += drift.y * deltaTime;
      positions[i3 + 2] += drift.z * deltaTime;
    }
    geometry.attributes.position.needsUpdate = true;
    material.opacity = 0.4; // constant for now, could animate with lifetime
  }

  return {
    object: points,
    update,
    setOrigin: (pos) => origin.copy(pos),
  };
}

export function createRoadDustSystem(scene, roadPoints, options = {}) {
  if (!scene || !roadPoints || roadPoints.length === 0) return null;

  const count = options.count || 200;
  const size = options.size || 0.4;
  const color = 0xd2b48c; // Sand/Dust color

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size,
    map: createParticleTexture(),
    transparent: true,
    opacity: 0.25,
    color,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  for (let i = 0; i < count; i++) {
    const anchor = roadPoints[Math.floor(Math.random() * roadPoints.length)];
    positions[i * 3] = anchor.x + THREE.MathUtils.randFloatSpread(4);
    positions[i * 3 + 1] = anchor.y + 0.1 + Math.random() * 0.5;
    positions[i * 3 + 2] = anchor.z + THREE.MathUtils.randFloatSpread(4);
  }

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  function update(deltaTime, time) {
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3 + 1] += Math.sin(time * 0.5 + i) * 0.001; // subtle hover
    }
    geometry.attributes.position.needsUpdate = true;
  }

  return { object: points, update };
}
