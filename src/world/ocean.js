import * as THREE from "three";
import { Water } from "three/addons/objects/Water.js";
import {
  HARBOR_WATER_CENTER,
  HARBOR_WATER_BACK,
  HARBOR_WATER_EAST_LIMIT,
  HARBOR_WATER_SIZE,
  SEA_LEVEL_Y,
} from "./locations.js";
import { mountWaterBoundsDebug } from "./debug_waterBounds.js";

function generateNormalComponent(x, y, octave) {
  const frequency = Math.pow(2, octave);
  const angle = (x * frequency + y * frequency * 1.3) * 0.12;
  return Math.sin(angle * 1.7 + octave * 1.1) * 0.6;
}

function createProceduralWaterNormals(size = 256) {
  const data = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let nx = 0;
      let ny = 0;

      for (let octave = 0; octave < 4; octave++) {
        const weight = 1 / Math.pow(2, octave);
        nx += generateNormalComponent(x, y, octave) * weight;
        ny += generateNormalComponent(y, x, octave) * weight;
      }

      const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));

      const index = (y * size + x) * 4;
      data[index] = Math.floor((nx * 0.5 + 0.5) * 255);
      data[index + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      data[index + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
      data[index + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  // Maintain conservative anisotropy to avoid potential mobile performance regressions.
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

const _dayWaterColor = new THREE.Color(0x1a4e80);
const _nightWaterColor = new THREE.Color(0x091c2a);
const _moodWaterColor = new THREE.Color();

let cachedNormals = null;

function resolveDevicePixelRatio(options) {
  if (options && Number.isFinite(options.devicePixelRatio)) {
    return options.devicePixelRatio;
  }
  if (typeof window !== "undefined" && window.devicePixelRatio) {
    return window.devicePixelRatio;
  }
  return 1;
}

function computeRenderTargetSize(options) {
  const baseSize = options?.baseTextureSize ?? 512;
  const dpr = THREE.MathUtils.clamp(resolveDevicePixelRatio(options), 0.75, 3);
  const size = Math.round(baseSize * dpr);
  return THREE.MathUtils.clamp(size, 256, 2048);
}

export async function createOcean(scene, options = {}) {
  if (!cachedNormals) {
    cachedNormals = createProceduralWaterNormals();
  }

  const renderTargetSize = computeRenderTargetSize(options);

  // remove prior water meshes if any
  scene.traverse((o) => {
    if (o && (o.name === "AegeanOcean" || o.userData?.isWater)) {
      o.parent?.remove(o);
    }
  });

  const targetCenter = new THREE.Vector3(
    Number.isFinite(options.position?.x) ? options.position.x : HARBOR_WATER_CENTER.x,
    SEA_LEVEL_Y,
    Number.isFinite(options.position?.z) ? options.position.z : HARBOR_WATER_CENTER.z
  );

  const baseSize = new THREE.Vector2(
    Number.isFinite(options.size?.x) ? options.size.x : HARBOR_WATER_SIZE.x,
    Number.isFinite(options.size?.y) ? options.size.y : HARBOR_WATER_SIZE.y
  );

  const geometry = new THREE.PlaneGeometry(baseSize.x, baseSize.y, 1, 1);
  const water = new Water(geometry, {
    textureWidth: renderTargetSize,
    textureHeight: renderTargetSize,
    waterNormals: cachedNormals,
    sunDirection: new THREE.Vector3(0.707, 0.5, 0.5).normalize(),
    sunColor: 0xf2f8ff,
    waterColor: _dayWaterColor.clone(),
    distortionScale: 3.2,
    fog: Boolean(scene.fog),
  });

  water.rotation.x = -Math.PI / 2;
  water.position.copy(targetCenter);

  // Rectangular clipping: no inland water
  const halfX = baseSize.x * 0.5;
  const halfZFront = baseSize.y * 0.5; // seaward half
  const halfZBack = THREE.MathUtils.clamp(HARBOR_WATER_BACK, 0, halfZFront);

  const bounds = options.bounds ?? {};
  let westLimit = targetCenter.x - halfX;
  let eastLimit = targetCenter.x + halfX;
  let frontLimit = targetCenter.z - halfZFront; // seaward extent (smaller Z)
  let backLimit = targetCenter.z + halfZBack; // inland extent (larger Z)

  if (Number.isFinite(bounds.west)) {
    westLimit = bounds.west;
  }
  if (Number.isFinite(bounds.east)) {
    eastLimit = bounds.east;
  }
  if (Number.isFinite(bounds.south)) {
    frontLimit = bounds.south;
  }
  if (Number.isFinite(bounds.north)) {
    backLimit = bounds.north;
  }

  // If HARBOR_WATER_EAST_LIMIT is finite, use the smaller of that or the resolved east edge; otherwise, use the resolved value.
  if (Number.isFinite(HARBOR_WATER_EAST_LIMIT)) {
    eastLimit = Math.min(eastLimit, HARBOR_WATER_EAST_LIMIT);
  }

  if (westLimit > eastLimit) {
    [westLimit, eastLimit] = [eastLimit, westLimit];
  }

  if (frontLimit > backLimit) {
    [frontLimit, backLimit] = [backLimit, frontLimit];
  }

  console.log("[water clip]", {
    center: { x: targetCenter.x, z: targetCenter.z },
    westLimit,
    eastLimit,
    frontLimit,
    backLimit,
  });

  // Planes: keep inside the box [x ∈ (westLimit … eastLimit), z ∈ (frontLimit … backLimit)]

  const planes = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), -westLimit), // left:  x >= westLimit
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), eastLimit), // right: x <= eastLimit
    // back (inland limit)
    new THREE.Plane(new THREE.Vector3(0, 0, -1), backLimit),
    // front (sea)
    new THREE.Plane(new THREE.Vector3(0, 0, 1), -frontLimit),
  ];

  if (water.material) {
    water.material.clippingPlanes = planes;
    water.material.clipIntersection = true;
    water.material.depthWrite = true;
    water.material.transparent = true;
    water.material.needsUpdate = true;

    if (typeof window !== "undefined" && window.location?.search?.includes("waterdbg=1")) {
      const existing = scene.getObjectByName("WaterClipDebug");
      if (existing) {
        scene.remove(existing);
      }
      mountWaterClipDebug(scene, westLimit, eastLimit, frontLimit, backLimit);
    }
  }

  water.receiveShadow = true;
  water.name = "AegeanOcean";
  water.userData.noCollision = true;
  water.userData.isWater = true;

  // Draw behind world but still write depth
  water.renderOrder = -1;

  scene.add(water);
  if (import.meta.env?.DEV) {
    const debugCenter = new THREE.Vector3(
      (westLimit + eastLimit) * 0.5,
      targetCenter.y,
      (frontLimit + backLimit) * 0.5
    );
    const debugSize = new THREE.Vector2(
      Math.max(0.001, eastLimit - westLimit),
      Math.max(0.001, backLimit - frontLimit)
    );
    mountWaterBoundsDebug(scene, debugCenter, debugSize);
  }

  return {
    mesh: water,
    uniforms: water.material.uniforms,
  };
}

export function mountWaterClipDebug(scene, westLimit, eastLimit, frontLimit, backLimit) {
  const g = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(westLimit, 0, frontLimit),
    new THREE.Vector3(eastLimit, 0, frontLimit),
    new THREE.Vector3(eastLimit, 0, backLimit),
    new THREE.Vector3(westLimit, 0, backLimit),
    new THREE.Vector3(westLimit, 0, frontLimit),
  ]);
  const line = new THREE.Line(g, new THREE.LineBasicMaterial({ transparent: true, opacity: 0.8 }));
  line.position.y = SEA_LEVEL_Y + 0.02;
  line.name = "WaterClipDebug";
  scene.add(line);
  return line;
}

export function updateOcean(ocean, deltaSeconds = 0, sunDir, mood = 0) {
  if (!ocean) return;
  const uniforms = ocean.uniforms ?? ocean.mesh?.material?.uniforms;
  if (!uniforms) return;

  if (Number.isFinite(deltaSeconds)) {
    uniforms.time.value += deltaSeconds;
  }
  if (sunDir && uniforms.sunDirection) {
    uniforms.sunDirection.value.copy(sunDir);
  }

  const calmFactor = THREE.MathUtils.clamp(typeof mood === "number" ? mood : 0, 0, 1);
  if (uniforms.distortionScale) {
    uniforms.distortionScale.value = THREE.MathUtils.lerp(3.2, 1.2, calmFactor);
  }
  if (uniforms.waterColor) {
    uniforms.waterColor.value.copy(
      _moodWaterColor.copy(_dayWaterColor).lerp(_nightWaterColor, calmFactor)
    );
  }
}
