import * as THREE from "three";
import {
  HARBOR_CENTER,
  HARBOR_SEA_LEVEL,
  AGORA_CENTER_3D,
  CITY_AREA_RADIUS,
} from "./locations.js";

// Utility: basic pseudo-random gradient noise using deterministic hashing so we can
// produce repeatable rolling hills without pulling in an additional dependency.
// This gives us smooth height transitions similar to Perlin noise by interpolating
// the dot product of gradients at the corners of a grid cell.
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

// Helper for fractal Brownian motion: summing several octaves of the base noise
// lets us control amplitude (height) and frequency (feature size). Increase
// frequency for craggier mountains, increase amplitude for taller peaks.
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
const HARBOR_INNER_RADIUS = 18;
const HARBOR_OUTER_RADIUS = 70;

export function createTerrain(scene) {
  // A large subdivided plane gives us enough vertices to push around and create
  // rolling hills. More segments = smoother displacement at the cost of perf.
  const size = 500;
  const segments = 256;
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);

  const positionAttribute = geometry.attributes.position;
  const vertexCount = positionAttribute.count;

  // Store the unanimated base heights so our update loop can add gentle motion
  // on top without permanently altering the terrain.
  const baseHeights = new Float32Array(vertexCount);

  // Optional vertex colors: we will paint grass/dirt/rock based on height to
  // make the surface readable even without texture maps.
  const colors = new Float32Array(vertexCount * 3);
  const colorAttribute = new THREE.BufferAttribute(colors, 3);
  geometry.setAttribute("color", colorAttribute);

  const color = new THREE.Color();
  const heightScale = 25; // Raise this for taller peaks, lower for gentle plains.
  const baseFrequency = 0.01; // Higher frequency = more, smaller details.

  // --- City plateau targets (flatter core around the Agora with smooth edges)
  // We use the Agora's Y as the "target" plateau elevation and create a smooth
  // falloff so the terrain blends into surrounding hills. Inner radius is
  // mostly flat, outer radius blends back to normal terrain.
  const CITY_CENTER_XZ = new THREE.Vector2(AGORA_CENTER_3D.x, AGORA_CENTER_3D.z);
  const CITY_INNER = Math.max(40, CITY_AREA_RADIUS * 0.55); // largely flat
  const CITY_OUTER = CITY_AREA_RADIUS; // blend back to hills
  const CITY_TARGET_Y = AGORA_CENTER_3D.y; // gentle, believable city elevation

  for (let i = 0; i < vertexCount; i++) {
    // PlaneGeometry is built on the XY plane. We'll treat x as east-west and
    // y as north-south; z will become height once we rotate the mesh.
    const x = positionAttribute.getX(i);
    const z = positionAttribute.getY(i);

    // Fractal noise builds interesting shapes while remaining deterministic.
    let height = fbm(x * baseFrequency, z * baseFrequency, 5, 0.5, 2.1) * heightScale;

    const dx = x - HARBOR_CENTER.x;
    const dz = z - HARBOR_CENTER.y;
    const distance = Math.hypot(dx, dz);
    if (distance < HARBOR_OUTER_RADIUS) {
      const flatten = 1 - THREE.MathUtils.smoothstep(
        distance,
        HARBOR_INNER_RADIUS,
        HARBOR_OUTER_RADIUS
      );
      if (flatten > 0) {
        height = THREE.MathUtils.lerp(height, HARBOR_SEA_LEVEL, flatten);
      }
    }

    // --- City plateau flattening (softly level the urban core)
    {
      const dxCity = x - CITY_CENTER_XZ.x;
      const dzCity = z - CITY_CENTER_XZ.y;
      const dCity = Math.hypot(dxCity, dzCity);
      if (dCity < CITY_OUTER) {
        // 0 in inner ring (full flatten), 1 outside the outer ring (no change).
        const t = THREE.MathUtils.smoothstep(dCity, CITY_INNER, CITY_OUTER);
        // Blend original 'height' toward city target elevation.
        // Inside inner radius, t≈0 → almost perfectly flat at CITY_TARGET_Y.
        // Between inner and outer, gradually blend back to natural terrain.
        const heightBeforeCity = height;
        const cityHeight = THREE.MathUtils.lerp(CITY_TARGET_Y, heightBeforeCity, t);
        if (distance < HARBOR_OUTER_RADIUS) {
          // Preserve the harbor's sea level flattening by never raising terrain
          // above the value established by the harbor pass.
          height = Math.min(heightBeforeCity, cityHeight);
        } else {
          height = cityHeight;
        }
      }
    }
    positionAttribute.setZ(i, height);
    baseHeights[i] = height;

    // Blend colors based on altitude. Low areas get lush greens, mid elevations
    // expose soil, and high peaks fade into cold rock tones.
    const normalized = THREE.MathUtils.clamp((height + heightScale) / (heightScale * 2), 0, 1);
    if (normalized < 0.35) {
      color.setRGB(0.18, 0.28, 0.12); // deep grass
    } else if (normalized < 0.65) {
      color.setRGB(0.36, 0.25, 0.14); // earthy dirt
    } else {
      color.setRGB(0.6, 0.6, 0.6); // rocky summit
    }
    colorAttribute.setXYZ(i, color.r, color.g, color.b);
  }

  positionAttribute.needsUpdate = true;
  colorAttribute.needsUpdate = true;
  geometry.computeVertexNormals();

  // Pack info we need later for animation and sampling.
  geometry.userData.baseHeights = baseHeights;
  geometry.userData.segmentCount = segments;
  geometry.userData.size = size;

  const material = new THREE.MeshStandardMaterial({
    color: 0x556b2f,
    vertexColors: true,
  });

  const terrain = new THREE.Mesh(geometry, material);
  terrain.rotation.x = -Math.PI / 2; // Rotate so the plane lies flat on the XZ axis.
  terrain.receiveShadow = true;
  terrain.name = "Terrain";
  scene.add(terrain);

  // Static terrain would only run the block above. Because we also animate,
  // attach helpers for dynamic behaviour and runtime height queries.
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

    const h00 = positionAttribute.getZ(index00);
    const h10 = positionAttribute.getZ(index10);
    const h01 = positionAttribute.getZ(index01);
    const h11 = positionAttribute.getZ(index11);

    const h0 = h00 + (h10 - h00) * sx;
    const h1 = h01 + (h11 - h01) * sx;
    return h0 + (h1 - h0) * sz;
  };

  return terrain;
}

export function updateTerrain(terrain, time) {
  if (!terrain) return;

  const geometry = terrain.geometry;
  const positionAttribute = geometry.attributes.position;
  const baseHeights = geometry.userData.baseHeights;
  if (!baseHeights) return;

  const vertexCount = positionAttribute.count;
  const windStrength = 0.75; // general landscape motion
  const windFrequency = 0.15; // Higher frequency = faster ripples.
  // Reduce/disable sway within the city plateau so streets/buildings feel stable.
  // Mirror the constants from createTerrain so behavior matches.
  const CITY_CENTER_XZ = new THREE.Vector2(AGORA_CENTER_3D.x, AGORA_CENTER_3D.z);
  const CITY_INNER = Math.max(40, CITY_AREA_RADIUS * 0.55);
  const CITY_OUTER = CITY_AREA_RADIUS;

  for (let i = 0; i < vertexCount; i++) {
    const baseHeight = baseHeights[i];
    const x = positionAttribute.getX(i);
    const z = positionAttribute.getY(i);
    // Distance to city center in XZ (remember geometry is on XY before rotation).
    const dxCity = x - CITY_CENTER_XZ.x;
    const dzCity = z - CITY_CENTER_XZ.y;
    const dCity = Math.hypot(dxCity, dzCity);
    // Inside inner radius, no sway. Between inner→outer, linearly fade in sway.
    let citySwayFactor = 1.0;
    if (dCity <= CITY_INNER) citySwayFactor = 0.0;
    else if (dCity < CITY_OUTER) {
      const t = (dCity - CITY_INNER) / (CITY_OUTER - CITY_INNER);
      citySwayFactor = THREE.MathUtils.clamp(t, 0, 1);
    }

    const sway = Math.sin((x + z) * windFrequency + time * 0.5) * 0.3;
    positionAttribute.setZ(i, baseHeight + sway * windStrength * citySwayFactor);
  }

  positionAttribute.needsUpdate = true;
  geometry.computeVertexNormals();
}
