import * as THREE from "three";
import { Water } from "three/examples/jsm/objects/Water.js";
import { SEA_LEVEL } from "./locations.js";

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
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

let cachedNormals = null;
const BASE_WATER_COLOR = new THREE.Color(0x1a4e80);
const NIGHT_WATER_COLOR = new THREE.Color(0x0b243d);
const _color = new THREE.Color();
const _tint = new THREE.Color();

export async function createOcean(scene, options = {}) {
  const size = options.size ?? 800;
  const position = options.position ? options.position.clone() : new THREE.Vector3();
  if (!Number.isFinite(position.y)) {
    position.y = SEA_LEVEL;
  }

  if (!cachedNormals) {
    cachedNormals = createProceduralWaterNormals();
  }

  const baseTextureSize = options.baseTextureSize ?? 1024;
  const dpr = options.devicePixelRatio ?? (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
  const dprScale = THREE.MathUtils.clamp(dpr, 1, 2.5);
  const textureSize = Math.round(baseTextureSize * dprScale);

  const geometry = new THREE.PlaneGeometry(size, size, 1, 1);
  const water = new Water(geometry, {
    textureWidth: textureSize,
    textureHeight: textureSize,
    waterNormals: cachedNormals,
    sunDirection: new THREE.Vector3(0.707, 0.5, 0.5).normalize(),
    sunColor: 0xf2f8ff,
    waterColor: BASE_WATER_COLOR.clone(),
    distortionScale: 3.2,
    fog: Boolean(scene.fog),
  });

  water.rotation.x = -Math.PI / 2;
  water.position.copy(position);
  water.receiveShadow = true;
  water.name = "AegeanOcean";
  water.userData.noCollision = true;

  scene.add(water);

  return {
    mesh: water,
    uniforms: water.material.uniforms,
  };
}

export function updateOcean(ocean, deltaSeconds = 0, sunDir, mood = {}) {
  if (!ocean) return;
  const uniforms = ocean.uniforms ?? ocean.mesh?.material?.uniforms;
  if (!uniforms) return;

  if (Number.isFinite(deltaSeconds)) {
    uniforms.time.value += deltaSeconds;
  }
  if (sunDir && uniforms.sunDirection) {
    uniforms.sunDirection.value.copy(sunDir);
  }

  const nightFactor = THREE.MathUtils.clamp(mood.nightFactor ?? 0, 0, 1);
  const calmFactor = THREE.MathUtils.clamp(mood.calm ?? nightFactor, 0, 1);
  const tintColor = mood.tintColor ? _tint.copy(mood.tintColor) : NIGHT_WATER_COLOR;

  _color.copy(BASE_WATER_COLOR).lerp(tintColor, nightFactor);
  if (uniforms.waterColor) {
    uniforms.waterColor.value.copy(_color);
  }
  if (uniforms.distortionScale) {
    const calmScale = THREE.MathUtils.lerp(3.2, 1.2, calmFactor);
    uniforms.distortionScale.value = calmScale;
  }
}
