import * as THREE from "three";
import { Water } from "three/addons/objects/Water.js";
import {
  HARBOR_WATER_CENTER,
  HARBOR_WATER_SIZE,
  HARBOR_WATER_BACK,
} from "./locations.js";

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

  const geometry = new THREE.PlaneGeometry(HARBOR_WATER_SIZE.x, HARBOR_WATER_SIZE.y, 1, 1);
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
  water.position.copy(HARBOR_WATER_CENTER);
  water.receiveShadow = true;
  water.name = "AegeanOcean";
  water.userData.noCollision = true;
  water.userData.isWater = true;

  // Draw behind world but still write depth
  water.renderOrder = -1;
  if (water.material) {
    water.material.depthWrite = true;
    water.material.transparent = true;
  }

  // Build 4 clipping planes around the rectangle
  const halfX = HARBOR_WATER_SIZE.x * 0.5;
  const halfZFront = HARBOR_WATER_SIZE.y * 0.5;
  const halfZBack = Math.min(HARBOR_WATER_BACK, halfZFront);

  const cx = HARBOR_WATER_CENTER.x;
  const cz = HARBOR_WATER_CENTER.z;

  const planes = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), -(cx - halfX)),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), cx + halfX),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), -(cz + halfZBack)),
    new THREE.Plane(new THREE.Vector3(0, 0, -1), cz - halfZFront),
  ];

  if (water.material) {
    water.material.clipping = true;
    water.material.clippingPlanes = planes;
  }

  scene.add(water);

  return {
    mesh: water,
    uniforms: water.material.uniforms,
  };
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
