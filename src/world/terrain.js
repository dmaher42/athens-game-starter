import * as THREE from "three";
import {
  HARBOR_CENTER,
  AGORA_CENTER_3D,
  CITY_AREA_RADIUS,
  getSeaLevelY,
  getHarborSeaLevel,
} from "./locations.js";
import {
  createGroundTextureState,
  injectGroundTextureShader,
} from "./groundTextures.js";
import { GROUND_TEXTURE_CONFIG } from "./groundTextureConfig.js";
import { applyTextureBudgetToMaterial } from "../utils/textureBudget.js";
import {
  HARBOR_FLOOR_DEPTH,
  getHarborShoreBlendProfile,
} from "./harborTerrainConfig.js";

// Utility: basic pseudo-random gradient noise using deterministic hashing
function gradientNoise(x, z) {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const xf = x - x0;
  const zf = z - z0;

  const gradients = new Array(4);
  for (let i = 0; i < 4; i++) {
    const ix = x0 + (i & 1);
    const iz = z0 + (i >> 1);
    const seed = Math.sin(ix * 374761393 + iz * 668265263) * 43758.5453;
    const angle = seed - Math.floor(seed);
    gradients[i] = {
      x: Math.cos(angle * Math.PI * 2),
      z: Math.sin(angle * Math.PI * 2),
    };
  }

  const dot00 = gradients[0].x * (xf) + gradients[0].z * (zf);
  const dot10 = gradients[1].x * (xf - 1) + gradients[1].z * (zf);
  const dot01 = gradients[2].x * (xf) + gradients[2].z * (zf - 1);
  const dot11 = gradients[3].x * (xf - 1) + gradients[3].z * (zf - 1);

  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const u = fade(xf);
  const v = fade(zf);

  const lerp = (a, b, t) => a + (b - a) * t;
  const nx0 = lerp(dot00, dot10, u);
  const nx1 = lerp(dot01, dot11, u);
  return lerp(nx0, nx1, v);
}

function fbm(x, z, octaves, persistence, lacunarity) {
  let amplitude = 1;
  let frequency = 1;
  let sum = 0;
  let max = 0;

  for (let i = 0; i < octaves; i++) {
    sum += gradientNoise(x * frequency, z * frequency) * amplitude;
    max += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return sum / max;
}

// Cache vector instances so updateTerrain can reuse them without churn.
const _scratchVec = new THREE.Vector3();
const HARBOR_SHORE_PROFILE = getHarborShoreBlendProfile();
const {
  radii: {
    inner: HARBOR_BLEND_INNER_RADIUS,
    shelf: HARBOR_BLEND_SHELF_RADIUS,
    outer: HARBOR_BLEND_OUTER_RADIUS,
  },
  shoreShelfDepth: HARBOR_SHORE_SHELF_DEPTH,
  taperFalloff: HARBOR_SHORE_TAPER_FALLOFF,
} = HARBOR_SHORE_PROFILE;

export function createTerrain(scene) {
  const size = 500;
  const segments = 256;
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);

  if (geometry.attributes.uv && !geometry.attributes.uv2) {
    geometry.setAttribute(
      "uv2",
      new THREE.BufferAttribute(
        new Float32Array(geometry.attributes.uv.array),
        2,
      ),
    );
  }

  const positionAttribute = geometry.attributes.position;
  const vertexCount = positionAttribute.count;
  const baseHeights = new Float32Array(vertexCount);
  const colors = new Float32Array(vertexCount * 3);
  const colorAttribute = new THREE.BufferAttribute(colors, 3);
  geometry.setAttribute("color", colorAttribute);

  const color = new THREE.Color();
  const heightScale = 25;
  const baseFrequency = 0.01;

  const ACROPOLIS_CENTER = new THREE.Vector2(0, 0); // Acropolis at (0,0)
  const PLATEAU_RADIUS = 80;
  const RAMP_END_RADIUS = 120;
  const PLATEAU_HEIGHT = 30;

  for (let i = 0; i < vertexCount; i++) {
    const x = positionAttribute.getX(i);
    const z = positionAttribute.getY(i);

    // Default terrain noise
    let height = fbm(x * baseFrequency, z * baseFrequency, 5, 0.5, 2.1) * heightScale;

    // ACROPOLIS PLATEAU LOGIC
    const dx = x - ACROPOLIS_CENTER.x;
    const dz = z - ACROPOLIS_CENTER.y;
    const dist = Math.hypot(dx, dz);

    if (dist < PLATEAU_RADIUS) {
      height = PLATEAU_HEIGHT; // Flat plateau
    } else if (dist < RAMP_END_RADIUS) {
      // Smooth ramp down
      const t = (dist - PLATEAU_RADIUS) / (RAMP_END_RADIUS - PLATEAU_RADIUS);
      // Use smoothstep for nicer transition
      const smoothT = t * t * (3 - 2 * t);
      // Interpolate between plateau height and natural terrain height
      // Wait, "natural terrain height" might be higher than 0?
      // User says "down to the lower city level". Let's assume lower level is the generated noise or near 0.
      // Let's blend from PLATEAU_HEIGHT to 'height' (noise).
      height = THREE.MathUtils.lerp(PLATEAU_HEIGHT, height, smoothT);
    }
    // else height remains as noise

    // Harbor blending (preserve existing harbor logic if needed, or adjust?)
    // User instructions focused on Acropolis. I will keep harbor logic but ensure Acropolis takes precedence if overlapping (unlikely given distances).
    const dxHarbor = x - HARBOR_CENTER.x;
    const dzHarbor = z - HARBOR_CENTER.y;
    const distHarbor = Math.hypot(dxHarbor, dzHarbor);

    // Only apply harbor logic if far enough from Acropolis to avoid conflict
    if (dist > RAMP_END_RADIUS && distHarbor < HARBOR_BLEND_OUTER_RADIUS) {
         const flatten = 1 - THREE.MathUtils.smoothstep(
        distHarbor,
        HARBOR_BLEND_INNER_RADIUS,
        HARBOR_BLEND_OUTER_RADIUS,
      );
      if (flatten > 0) {
        const runtimeSeaLevel = getHarborSeaLevel();
        const harborShorelineSurface = runtimeSeaLevel - 0.02;
        const harborFloorHeight = runtimeSeaLevel - HARBOR_FLOOR_DEPTH;
        const harborShelfHeight = runtimeSeaLevel - HARBOR_SHORE_SHELF_DEPTH;
        const firstStageSpan = Math.max(1e-3, HARBOR_BLEND_SHELF_RADIUS - HARBOR_BLEND_INNER_RADIUS);
        const secondStageSpan = Math.max(1e-3, HARBOR_BLEND_OUTER_RADIUS - HARBOR_BLEND_SHELF_RADIUS);
        const distanceIntoBlend = distHarbor - HARBOR_BLEND_INNER_RADIUS;
        const shelfStageT = THREE.MathUtils.clamp(distanceIntoBlend / firstStageSpan, 0, 1);
        const shorelineStageT = THREE.MathUtils.clamp((distHarbor - HARBOR_BLEND_SHELF_RADIUS) / secondStageSpan, 0, 1);
        let harborTargetHeight = harborFloorHeight;
        if (distHarbor <= HARBOR_BLEND_SHELF_RADIUS) {
          const easedShelf = shelfStageT * shelfStageT;
          harborTargetHeight = THREE.MathUtils.lerp(harborFloorHeight, harborShelfHeight, easedShelf);
        } else {
          const easedFalloff = 1 - Math.pow(1 - shorelineStageT, HARBOR_SHORE_TAPER_FALLOFF);
          harborTargetHeight = THREE.MathUtils.lerp(harborShelfHeight, harborShorelineSurface, easedFalloff);
        }
        height = THREE.MathUtils.lerp(height, harborTargetHeight, flatten);
      }
    }

    positionAttribute.setZ(i, height);
    baseHeights[i] = height;

    const normalized = THREE.MathUtils.clamp((height + heightScale) / (heightScale * 2), 0, 1);
    if (normalized < 0.42) {
      color.setRGB(0.30, 0.55, 0.22);
    } else if (normalized < 0.72) {
      color.setRGB(0.43, 0.31, 0.18);
    } else {
      color.setRGB(0.62, 0.62, 0.62);
    }
    colorAttribute.setXYZ(i, color.r, color.g, color.b);
  }

  positionAttribute.needsUpdate = true;
  colorAttribute.needsUpdate = true;
  geometry.computeVertexNormals();

  geometry.userData.baseHeights = baseHeights;
  geometry.userData.segmentCount = segments;
  geometry.userData.size = size;

  if (!geometry.getAttribute("basePos")) {
    const basePos = new THREE.BufferAttribute(
      new Float32Array(positionAttribute.array),
      3,
    );
    geometry.setAttribute("basePos", basePos);
  }

  let terrainMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.90,
    metalness: 0.0,
    vertexColors: true,
  });

  terrainMaterial.userData.textureBudget = "skip";

  const groundTextureState = createGroundTextureState(
    terrainMaterial,
    GROUND_TEXTURE_CONFIG,
  );
  const shouldTrackGroundHeight = groundTextureState.detailLayers.length > 0;
  const basePosAttr = geometry.getAttribute("basePos");

  const swayUniforms = {
    uTime: { value: 0 },
    uWindStrength: { value: 0.18 },
    uWindFreq: { value: 0.15 },
    uCityCenter: { value: new THREE.Vector2(0, 0) }, // Updated to Acropolis center
    uCityInner: { value: PLATEAU_RADIUS },
    uCityOuter: { value: RAMP_END_RADIUS },
  };

  terrainMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = swayUniforms.uTime;
    shader.uniforms.uWindStrength = swayUniforms.uWindStrength;
    shader.uniforms.uWindFreq = swayUniforms.uWindFreq;
    shader.uniforms.uCityCenter = swayUniforms.uCityCenter;
    shader.uniforms.uCityInner = swayUniforms.uCityInner;
    shader.uniforms.uCityOuter = swayUniforms.uCityOuter;

    shader.vertexShader = `
      uniform float uTime;
      uniform float uWindStrength;
      uniform float uWindFreq;
      uniform vec2 uCityCenter;
      uniform float uCityInner;
      uniform float uCityOuter;
      ${shouldTrackGroundHeight && !shader.vertexShader.includes("varying float vGroundHeight;") ? "varying float vGroundHeight;" : ""}
      attribute vec3 basePos;
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `
        vec3 transformed = basePos;
        ${shouldTrackGroundHeight ? "\n        vGroundHeight = basePos.z;" : ""}

        float dx = basePos.x - uCityCenter.x;
        float dz = basePos.y - uCityCenter.y;
        float dCity = sqrt(dx * dx + dz * dz);

        float cityFactor = 1.0;
        if (dCity <= uCityInner) {
          cityFactor = 0.0;
        } else if (dCity < uCityOuter) {
          float t = (dCity - uCityInner) / max(0.0001, (uCityOuter - uCityInner));
          cityFactor = clamp(t, 0.0, 1.0);
        }

        float swayPhase = (basePos.x + basePos.y) * uWindFreq + uTime * 0.5;
        float sway = sin(swayPhase) * 0.3;
        transformed.z += sway * uWindStrength * cityFactor;
      `,
    );

    if (shouldTrackGroundHeight) {
      if (!shader.fragmentShader.includes("varying float vGroundHeight")) {
        shader.fragmentShader = `varying float vGroundHeight;\n${shader.fragmentShader}`;
      }
      injectGroundTextureShader(shader, groundTextureState);
    }
  };

  terrainMaterial = applyTextureBudgetToMaterial(terrainMaterial, {
    renderer: scene?.userData?.renderer ?? null,
  });

  const terrain = new THREE.Mesh(geometry, terrainMaterial);
  terrain.rotation.x = -Math.PI / 2;
  terrain.receiveShadow = true;
  terrain.name = "Terrain";
  scene.add(terrain);

  const stride = segments + 1;
  terrain.userData.getHeightAt = (worldX, worldZ) => {
    _scratchVec.set(worldX, 0, worldZ);
    terrain.worldToLocal(_scratchVec);

    const halfSize = size / 2;
    const localX = _scratchVec.x + halfSize;
    const localZ = _scratchVec.z + halfSize;

    if (localX < 0 || localX > size || localZ < 0 || localZ > size) {
      return null;
    }

    const percentX = localX / size;
    const percentZ = localZ / size;
    const gridX = percentX * segments;
    const gridZ = percentZ * segments;

    const x0 = Math.floor(gridX);
    const x1 = Math.min(x0 + 1, segments);
    const z0 = Math.floor(gridZ);
    const z1 = Math.min(z0 + 1, segments);

    const sx = gridX - x0;
    const sz = gridZ - z0;

    const index00 = z0 * stride + x0;
    const index10 = z0 * stride + x1;
    const index01 = z1 * stride + x0;
    const index11 = z1 * stride + x1;

    // We can skip sway sampling on CPU for height queries to save perf, or keep it for accuracy.
    // Keeping it for consistency.
    const uniforms = terrain.userData.swayUniforms;
    const sampleSway = (vertexIndex) => {
      if (!uniforms) return 0;
      const windStrength = uniforms.uWindStrength?.value ?? 0;
      if (windStrength === 0) return 0;

      const planarX = basePosAttr.getX(vertexIndex);
      const planarY = basePosAttr.getY(vertexIndex);
      const cityCenter = uniforms.uCityCenter?.value;
      const cityInner = uniforms.uCityInner?.value ?? 0;
      const cityOuter = uniforms.uCityOuter?.value ?? cityInner;

      let cityFactor = 1;
      if (cityCenter) {
        const dx = planarX - cityCenter.x;
        const dz = planarY - cityCenter.y;
        const distance = Math.hypot(dx, dz);
        if (distance <= cityInner) {
          cityFactor = 0;
        } else if (distance < cityOuter) {
          const t = (distance - cityInner) / Math.max(0.0001, cityOuter - cityInner);
          cityFactor = THREE.MathUtils.clamp(t, 0, 1);
        }
      }
      if (cityFactor === 0) return 0;

      const windFreq = uniforms.uWindFreq?.value ?? 0;
      const time = uniforms.uTime?.value ?? 0;
      const swayPhase = (planarX + planarY) * windFreq + time * 0.5;
      return Math.sin(swayPhase) * 0.3 * windStrength * cityFactor;
    };

    const h00 = baseHeights[index00] + sampleSway(index00);
    const h10 = baseHeights[index10] + sampleSway(index10);
    const h01 = baseHeights[index01] + sampleSway(index01);
    const h11 = baseHeights[index11] + sampleSway(index11);

    const h0 = h00 + (h10 - h00) * sx;
    const h1 = h01 + (h11 - h01) * sx;
    return h0 + (h1 - h0) * sz;
  };

  terrain.userData.swayUniforms = swayUniforms;
  terrain.userData.groundTextureState = groundTextureState;

  return terrain;
}

export function updateTerrain(terrain, time) {
  if (!terrain) return;
  const uniforms = terrain.userData.swayUniforms;
  if (uniforms) {
    uniforms.uTime.value = time;
  }
}
