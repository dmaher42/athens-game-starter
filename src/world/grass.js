import * as THREE from "three";
import {
  AGORA_CENTER_3D,
  AGORA_RADIUS,
  ACROPOLIS_PEAK_3D,
  ACROPOLIS_RADIUS,
  CITY_AREA_RADIUS,
  HARBOR_CENTER_3D,
  HARBOR_WATER_BOUNDS,
  HARBOR_WATER_EAST_LIMIT,
  MAIN_ROAD_WIDTH,
  SEA_LEVEL_Y,
} from "./locations.js";

const DEFAULT_INSTANCE_COUNT = 32000;
const SEA_LEVEL_EPSILON = 0.35;
const ROAD_SAFETY_MARGIN = MAIN_ROAD_WIDTH * 0.85;
const AGORA_BUFFER = AGORA_RADIUS + 10;
const ACROPOLIS_BUFFER = ACROPOLIS_RADIUS + 6;
const HARBOR_BUFFER = 75;
const CITY_CORE_BUFFER = 42;
const MAX_SLOPE_DELTA = 0.55;
const SLOPE_SAMPLE_OFFSET = 0.7;

const _curveSample = new THREE.Vector3();

let grassState = null;

function mulberry32(seed = 1) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function normalizeWindDir(dir) {
  const v = dir.clone();
  if (v.lengthSq() === 0) {
    v.set(1, 0);
  }
  return v.normalize();
}

function buildRoadCurve() {
  const pts = [
    HARBOR_CENTER_3D.clone().add(new THREE.Vector3(8, 0, -10)),
    HARBOR_CENTER_3D.clone().lerp(AGORA_CENTER_3D, 0.4).add(new THREE.Vector3(-10, 2, 6)),
    AGORA_CENTER_3D.clone(),
    AGORA_CENTER_3D.clone().lerp(ACROPOLIS_PEAK_3D, 0.6).add(new THREE.Vector3(6, 2, -4)),
    ACROPOLIS_PEAK_3D.clone(),
  ];
  return new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.1);
}

const ROAD_CURVE = buildRoadCurve();

// Terrain sampling & masks
function distanceToRoad(x, z) {
  let min = Infinity;
  const segments = 256;
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    ROAD_CURVE.getPoint(t, _curveSample);
    const dx = _curveSample.x - x;
    const dz = _curveSample.z - z;
    const dist = Math.hypot(dx, dz);
    if (dist < min) {
      min = dist;
    }
  }
  return min;
}

function isInsidePierRect(x, z) {
  return (
    x >= HARBOR_WATER_BOUNDS.west &&
    x <= HARBOR_WATER_EAST_LIMIT + 3 &&
    z >= HARBOR_WATER_BOUNDS.north &&
    z <= HARBOR_WATER_BOUNDS.south
  );
}

function distance2D(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function isInsideHarborBuffer(x, z) {
  const dx = x - HARBOR_CENTER_3D.x;
  const dz = z - HARBOR_CENTER_3D.z;
  return Math.hypot(dx, dz) < HARBOR_BUFFER;
}

function isInsideCityCore(x, z) {
  const dAgora = distance2D({ x, z }, AGORA_CENTER_3D);
  if (dAgora < CITY_CORE_BUFFER) return true;
  const dHill = distance2D({ x, z }, ACROPOLIS_PEAK_3D);
  if (dHill < ACROPOLIS_BUFFER) return true;
  return false;
}

function isInsidePlazaMask(x, z) {
  const dAgora = distance2D({ x, z }, AGORA_CENTER_3D);
  if (dAgora < AGORA_BUFFER) return true;
  const dAcropolis = distance2D({ x, z }, ACROPOLIS_PEAK_3D);
  if (dAcropolis < ACROPOLIS_BUFFER) return true;
  return false;
}

function isOutsideCityRing(x, z) {
  const dAgora = distance2D({ x, z }, AGORA_CENTER_3D);
  return dAgora > CITY_AREA_RADIUS * 0.92;
}

function sampleSlope(getHeightAt, x, z, centerHeight) {
  const north = getHeightAt(x, z + SLOPE_SAMPLE_OFFSET);
  const south = getHeightAt(x, z - SLOPE_SAMPLE_OFFSET);
  const east = getHeightAt(x + SLOPE_SAMPLE_OFFSET, z);
  const west = getHeightAt(x - SLOPE_SAMPLE_OFFSET, z);
  if (!Number.isFinite(north) || !Number.isFinite(south) || !Number.isFinite(east) || !Number.isFinite(west)) {
    return Infinity;
  }
  const maxDelta = Math.max(
    Math.abs(north - centerHeight),
    Math.abs(south - centerHeight),
    Math.abs(east - centerHeight),
    Math.abs(west - centerHeight),
  );
  return maxDelta;
}

function computeBounding(size) {
  const half = size / 2;
  const min = new THREE.Vector3(-half, SEA_LEVEL_Y - 2, -half);
  const max = new THREE.Vector3(half, SEA_LEVEL_Y + 60, half);
  return new THREE.Box3(min, max);
}

// Grass instancing
function buildBladeGeometry() {
  const bladeHeight = 1;
  const bladeWidth = 0.12;
  const plane = new THREE.PlaneGeometry(bladeWidth, bladeHeight, 1, 4);
  plane.translate(0, bladeHeight / 2, 0);
  const geometry = new THREE.InstancedBufferGeometry();
  if (plane.index) {
    geometry.setIndex(plane.index);
  }
  geometry.setAttribute("position", plane.attributes.position);
  geometry.setAttribute("uv", plane.attributes.uv);
  geometry.setAttribute("normal", plane.attributes.normal);
  const drawCount = plane.index ? plane.index.count : plane.attributes.position.count;
  geometry.setDrawRange(0, drawCount);
  return geometry;
}

function createGrassMaterial({ baseColor = new THREE.Color(0x4c8f3a), windDir = new THREE.Vector2(0.8, 0.4) } = {}) {
  const uniforms = {
    ...THREE.UniformsLib.lights,
    uTime: { value: 0 },
    uWindDir: { value: normalizeWindDir(windDir) },
    uWindAmp: { value: 0.45 },
    uWindFreq1: { value: 0.9 },
    uWindFreq2: { value: 1.7 },
    uBaseColor: { value: baseColor.clone() },
    uNightFactor: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    name: "GrassInstancedMaterial",
    uniforms,
    vertexShader: `
      #include <common>
      #include <lights_pars_begin>
      attribute vec3 aOffset;
      attribute float aScale;
      attribute float aOrientation;
      attribute vec3 aColorJitter;
      attribute float aLean;
      varying vec3 vColor;
      varying vec3 vNormal;
      varying float vHeightRatio;
      uniform float uTime;
      uniform vec2 uWindDir;
      uniform float uWindAmp;
      uniform float uWindFreq1;
      uniform float uWindFreq2;
      uniform vec3 uBaseColor;
      // Grass vertex wind
      void main() {
        float heightRatio = clamp(uv.y, 0.0, 1.0);
        float bladeHeight = aScale;
        vec3 windVec = normalize(vec3(uWindDir.x, 0.0, uWindDir.y));
        vec3 forward = vec3(sin(aOrientation), 0.0, cos(aOrientation));
        vec3 right = vec3(cos(aOrientation), 0.0, -sin(aOrientation));
        float phaseBase = dot(windVec.xz, aOffset.xz) * 0.18 + aLean * 1.7;
        float sway1 = sin((uTime + phaseBase) * uWindFreq1 + heightRatio * 2.4);
        float sway2 = sin((uTime * 1.3 + phaseBase * 1.7) * uWindFreq2 + heightRatio * 4.2);
        float windStrength = (sway1 * 0.6 + sway2 * 0.4) * uWindAmp;
        float curvature = 0.18 * heightRatio * heightRatio + aLean * 0.05;
        float totalBend = (windStrength + curvature) * heightRatio;
        float staticLean = aLean * 0.25 * heightRatio;
        vec3 bendDir = normalize(mix(forward, windVec, 0.35));
        vec3 displaced = aOffset;
        displaced.y += bladeHeight * heightRatio;
        displaced += right * position.x;
        displaced += bendDir * (totalBend + staticLean) * bladeHeight;
        vec3 bendTangent = normalize(bendDir * (totalBend * 1.4) + vec3(0.0, 1.0, 0.0));
        vec3 normalApprox = normalize(cross(right, bendTangent));
        vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        vNormal = normalize(normalMatrix * normalApprox);
        vec3 jitter = clamp(aColorJitter, vec3(-0.45), vec3(0.45));
        vColor = max(vec3(0.0), uBaseColor * (1.0 + jitter));
        vHeightRatio = heightRatio;
      }
    `,
    fragmentShader: `
      #include <common>
      #include <lights_pars_begin>
      varying vec3 vColor;
      varying vec3 vNormal;
      varying float vHeightRatio;
      uniform float uNightFactor;
      void main() {
        vec3 normal = normalize(vNormal);
        vec3 diffuseLight = vec3(0.0);
        #if NUM_DIR_LIGHTS > 0
          for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
            vec3 lightDir = directionalLights[i].direction;
            vec3 lightColor = directionalLights[i].color;
            float lambert = max(dot(normal, -lightDir), 0.0);
            diffuseLight += lightColor * lambert;
          }
        #endif
        #if NUM_HEMI_LIGHTS > 0
          for (int i = 0; i < NUM_HEMI_LIGHTS; i++) {
            float hemiWeight = normal.y * 0.5 + 0.5;
            vec3 hemi = mix(hemisphereLights[i].groundColor, hemisphereLights[i].skyColor, hemiWeight);
            diffuseLight += hemi * 0.5;
          }
        #endif
        vec3 ambientDay = vec3(0.24, 0.32, 0.22);
        vec3 ambientNight = vec3(0.05, 0.08, 0.1);
        vec3 ambient = mix(ambientDay, ambientNight, clamp(uNightFactor, 0.0, 1.0));
        float occlusion = mix(0.55, 1.0, pow(vHeightRatio, 1.8));
        vec3 finalColor = vColor * (ambient + diffuseLight) * occlusion;
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    lights: true,
    side: THREE.DoubleSide,
    transparent: false,
    depthWrite: true,
  });

  return { material, uniforms };
}

function populateInstances(terrain, count, rng) {
  const positions = [];
  const scales = [];
  const orientations = [];
  const colors = [];
  const leans = [];

  const size = terrain?.geometry?.userData?.size ?? 500;
  const half = size / 2;
  const getHeightAt = terrain?.userData?.getHeightAt;
  if (typeof getHeightAt !== "function") {
    return { positions, scales, orientations, colors, leans };
  }

  const maxAttempts = count * 6;
  let attempts = 0;
  while (positions.length / 3 < count && attempts < maxAttempts) {
    attempts += 1;
    const x = THREE.MathUtils.lerp(-half * 0.92, half * 0.92, rng());
    const z = THREE.MathUtils.lerp(-half * 0.92, half * 0.92, rng());

    if (isOutsideCityRing(x, z)) {
      continue;
    }
    if (isInsideCityCore(x, z)) {
      continue;
    }
    if (isInsideHarborBuffer(x, z)) {
      continue;
    }
    if (isInsidePierRect(x, z)) {
      continue;
    }
    if (isInsidePlazaMask(x, z)) {
      continue;
    }
    if (distanceToRoad(x, z) < ROAD_SAFETY_MARGIN * 1.8) {
      continue;
    }

    const height = getHeightAt(x, z);
    if (!Number.isFinite(height)) {
      continue;
    }
    if (height < SEA_LEVEL_Y + SEA_LEVEL_EPSILON) {
      continue;
    }

    const slope = sampleSlope(getHeightAt, x, z, height);
    if (!Number.isFinite(slope) || slope > MAX_SLOPE_DELTA) {
      continue;
    }

    positions.push(x, height, z);
    const minScale = 0.7;
    const maxScale = 1.15;
    scales.push(THREE.MathUtils.lerp(minScale, maxScale, rng()));
    orientations.push(rng() * Math.PI * 2);
    const jitterStrength = 0.25;
    const jitter = new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).multiplyScalar(jitterStrength);
    colors.push(jitter.x, jitter.y * 0.6, jitter.z * 0.4);
    leans.push((rng() - 0.5) * 1.2);
  }

  return { positions, scales, orientations, colors, leans };
}

function buildInstancedAttributes(instanceData) {
  const offsets = new Float32Array(instanceData.positions);
  const scales = new Float32Array(instanceData.scales);
  const orientations = new Float32Array(instanceData.orientations);
  const colors = new Float32Array(instanceData.colors);
  const leans = new Float32Array(instanceData.leans);
  return { offsets, scales, orientations, colors, leans };
}

function attachAttributes(geometry, attributes, count) {
  geometry.setAttribute("aOffset", new THREE.InstancedBufferAttribute(attributes.offsets, 3));
  geometry.setAttribute("aScale", new THREE.InstancedBufferAttribute(attributes.scales, 1));
  geometry.setAttribute("aOrientation", new THREE.InstancedBufferAttribute(attributes.orientations, 1));
  geometry.setAttribute("aColorJitter", new THREE.InstancedBufferAttribute(attributes.colors, 3));
  geometry.setAttribute("aLean", new THREE.InstancedBufferAttribute(attributes.leans, 1));
  geometry.instanceCount = count;
}

export function createGrassLayer(scene, terrain, options = {}) {
  const parent = scene ?? terrain?.parent;
  if (!parent || !terrain) {
    console.warn("createGrassLayer requires both a parent scene/group and terrain reference");
    return null;
  }

  if (grassState?.mesh) {
    grassState.mesh.parent?.remove(grassState.mesh);
  }

  const rng = mulberry32(options.seed ?? 1);
  const targetCount = THREE.MathUtils.clamp(options.count ?? DEFAULT_INSTANCE_COUNT, 1000, 60000);
  const instanceData = populateInstances(terrain, targetCount, rng);
  const instanceCount = Math.min(targetCount, instanceData.positions.length / 3);
  if (instanceCount === 0) {
    console.warn("Grass layer skipped: no valid placement positions found.");
    grassState = null;
    return null;
  }

  const geometry = buildBladeGeometry();
  const attributes = buildInstancedAttributes(instanceData);
  attachAttributes(geometry, attributes, instanceCount);
  geometry.boundingBox = computeBounding(terrain.geometry?.userData?.size ?? 500);
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, SEA_LEVEL_Y + 8, 0), CITY_AREA_RADIUS * 1.2);

  const { material, uniforms } = createGrassMaterial(options.materialOptions);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "GrassLayer";
  mesh.frustumCulled = true;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.userData.isGrassLayer = true;
  mesh.renderOrder = 0;

  parent.add(mesh);

  grassState = {
    mesh,
    uniforms,
    nightFactorTarget: 0,
  };

  updateGrass.nightFactor = 0;
  updateGrass.setNightFactor = (value) => {
    if (!grassState) return;
    grassState.nightFactorTarget = value;
  };

  return mesh;
}

export function updateGrass(dt = 0) {
  if (!grassState?.uniforms) return;
  const uniforms = grassState.uniforms;
  uniforms.uTime.value += dt;
  const current = uniforms.uNightFactor.value;
  const target = THREE.MathUtils.clamp(grassState.nightFactorTarget ?? 0, 0, 1);
  const lerpAlpha = 1 - Math.exp(-dt * 2.5);
  uniforms.uNightFactor.value = THREE.MathUtils.lerp(current, target, Number.isFinite(lerpAlpha) ? lerpAlpha : 1);
}
