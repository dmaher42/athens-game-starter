import * as THREE from "three";
import { getSeaLevelY } from "./seaLevelState.js";
import { HARBOR_CENTER_3D } from "./locations.js";
import { RENDER_LAYERS } from "./renderLayers.js";

const DEFAULT_COASTAL_INNER_RADIUS = 215;
const DEFAULT_COASTAL_WIDTH = 35;
const DEFAULT_SILHOUETTE_COUNT = 32;
const SKY_HORIZON_COLOR = new THREE.Color(0x2a3f5c);
const SKY_BLEND_COLOR = new THREE.Color(0x6b7f9c);

// Harbor direction calculation
// We map world (x, z) to ring (x, y) where ring.y = -world.z
// HARBOR_CENTER_3D is (-120, y, 80).
// Ring coords: x = -120, y = -80.
const HARBOR_RING_X = -120;
const HARBOR_RING_Y = -80;
const HARBOR_ANGLE = Math.atan2(HARBOR_RING_Y, HARBOR_RING_X); // ~ -2.55 rad
const HARBOR_ARC_LENGTH = Math.PI * 1.35; // ~240 degrees, wide enough to cover the view

function resolveFogColor(scene, provided) {
  if (provided) return provided.clone();
  if (scene?.fog?.color) return scene.fog.color.clone();
  if (scene?.userData?.getFogOptions) {
    const fogOptions = scene.userData.getFogOptions();
    if (fogOptions?.color) {
      return fogOptions.color.clone();
    }
  }
  return SKY_BLEND_COLOR.clone();
}

function radialNoise(angle, frequency = 1, amplitude = 1) {
  const base = Math.sin(angle * frequency) * 0.5 + Math.cos(angle * (frequency * 0.7)) * 0.5;
  return base * amplitude;
}

function getAngleDistance(a, b) {
  let diff = a - b;
  while (diff < -Math.PI) diff += Math.PI * 2;
  while (diff > Math.PI) diff -= Math.PI * 2;
  return Math.abs(diff);
}

function perturbCoastalGeometry(geometry, innerRadius, outerRadius, centerAngle, arcLength) {
  const positions = geometry.attributes.position;
  const count = positions.count;
  const colors = new Float32Array(count * 3);
  const colorAttr = new THREE.BufferAttribute(colors, 3);
  geometry.setAttribute("color", colorAttr);

  const bandWidth = Math.max(outerRadius - innerRadius, 1);
  const baseColor = new THREE.Color(0x1d242b);
  const outerTint = new THREE.Color(0x1b1f23);

  const taperAngle = Math.PI * 0.15; // Angle over which to taper the ends

  for (let i = 0; i < count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const radius = Math.hypot(x, y);
    const t = THREE.MathUtils.clamp((radius - innerRadius) / bandWidth, 0, 1);
    const angle = Math.atan2(y, x);

    // Tapering logic
    const distToCenter = getAngleDistance(angle, centerAngle);
    const distToEdge = (arcLength * 0.5) - distToCenter;
    const taperFactor = THREE.MathUtils.clamp(distToEdge / taperAngle, 0, 1);

    // Ease the taper
    const alpha = THREE.MathUtils.smoothstep(taperFactor, 0, 1);

    const rimJitter = radialNoise(angle, 3.3, 4.2) + radialNoise(angle, 7.1, 2.1);
    const bulge = radialNoise(angle, 1.35, 8.5) * (1 - t * 0.4);

    // Apply taper to the outer radius extension
    const effectiveT = t + (1.0 - alpha) * 2.0; // Push t higher (fades out) at edges?
    // Actually, let's just scale the radius down to innerRadius at edges
    // If alpha is 0 (at edge), we want radius to be close to innerRadius?
    // Or we want the geometry to dive under water?

    // Better strategy: Modify Z (height) to sink it at edges.

    const targetRadius = radius + rimJitter * (1 - t * 0.8) + bulge * (1 - t);

    const nx = Math.cos(angle) * targetRadius;
    const ny = Math.sin(angle) * targetRadius;
    positions.setXY(i, nx, ny);

    const silhouetteHeight = THREE.MathUtils.lerp(0.4, 2.4, 1 - t);
    const jagged = radialNoise(angle, 5.8, 0.35) + radialNoise(angle * 0.5, 2.1, 0.5);

    // Sink the geometry at the edges of the arc
    const edgeDrop = (1.0 - alpha) * -5.0;

    positions.setZ(i, (silhouetteHeight + jagged) * (1 - t * 0.6) + edgeDrop);

    const tint = baseColor.clone().lerp(outerTint, t * 0.45);
    // Darken at edges to hide
    tint.multiplyScalar(alpha);

    colorAttr.setXYZ(i, tint.r, tint.g, tint.b);
  }

  positions.needsUpdate = true;
  colorAttr.needsUpdate = true;
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();
}

function createCoastalBand({ innerRadius, outerRadius, seaLevel }) {
  const thetaStart = HARBOR_ANGLE - HARBOR_ARC_LENGTH * 0.5;
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 96, 1, thetaStart, HARBOR_ARC_LENGTH);

  perturbCoastalGeometry(geometry, innerRadius, outerRadius, HARBOR_ANGLE, HARBOR_ARC_LENGTH);

  const material = new THREE.MeshStandardMaterial({
    name: "ShoreTerminationBand",
    vertexColors: true,
    roughness: 0.96,
    metalness: 0.02,
    flatShading: true,
    transparent: true,
    opacity: 0.98,
    fog: true,
    side: THREE.DoubleSide // Ensure visibility from all angles since we are twisting it
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "ShoreTerminationBand";
  // Lower Y position below terrain to avoid occluding sand texture
  // Silhouette should appear at horizon, not ground level
  mesh.position.y = seaLevel - 8.0;
  mesh.receiveShadow = false;
  mesh.castShadow = false;
  mesh.userData.nonInteractive = true;
  return mesh;
}

function createSilhouetteScatter({
  innerRadius,
  outerRadius,
  seaLevel,
  count = DEFAULT_SILHOUETTE_COUNT,
}) {
  const geometry = new THREE.DodecahedronGeometry(1.4, 0);
  const material = new THREE.MeshStandardMaterial({
    color: 0x1a2026,
    roughness: 0.94,
    metalness: 0.05,
    flatShading: true,
  });

  const rocks = new THREE.InstancedMesh(geometry, material, count);
  rocks.name = "ShoreTerminationRocks";
  rocks.castShadow = false;
  rocks.receiveShadow = false;
  rocks.userData.nonInteractive = true;

  const bandWidth = Math.max(outerRadius - innerRadius, 1);
  const temp = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    // Distribute rocks within the arc
    // Random angle within [center - arc/2, center + arc/2]
    const angleOffset = (Math.random() - 0.5) * HARBOR_ARC_LENGTH;
    const angle = HARBOR_ANGLE + angleOffset;

    const radiusOffset = THREE.MathUtils.randFloatSpread(bandWidth * 0.35);
    const radius = innerRadius + bandWidth * 0.45 + radiusOffset;
    const height = seaLevel + 0.35 + Math.sin(i * 1.7) * 0.25;

    temp.position.set(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius,
    );
    const scale = 0.8 + Math.random() * 1.6;
    temp.scale.setScalar(scale);
    temp.rotation.y = angle + Math.sin(i * 2.3) * 0.4;
    temp.updateMatrix();
    rocks.setMatrixAt(i, temp.matrix);
  }

  rocks.instanceMatrix.needsUpdate = true;
  return rocks;
}

function createWaterFadeRing({
  innerRadius,
  outerRadius,
  seaLevel,
  fogColor,
  horizonColor,
}) {
  // We use the full ring geometry for the water fade but mask it in the shader,
  // OR we use the arc geometry. Arc geometry is more efficient.
  const thetaStart = HARBOR_ANGLE - HARBOR_ARC_LENGTH * 0.5;
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 96, 1, thetaStart, HARBOR_ARC_LENGTH);
  geometry.rotateX(-Math.PI / 2);

  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      innerRadius: { value: innerRadius },
      outerRadius: { value: outerRadius },
      seaLevel: { value: seaLevel },
      horizonColor: { value: horizonColor.clone() },
      centerAngle: { value: HARBOR_ANGLE },
      arcLength: { value: HARBOR_ARC_LENGTH },
    },
  ]);

  const material = new THREE.ShaderMaterial({
    name: "WaterHorizonFade",
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms,
    fog: true,
    vertexShader: /* glsl */ `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      #include <fog_pars_fragment>
      varying vec3 vWorldPosition;
      uniform float innerRadius;
      uniform float outerRadius;
      uniform float seaLevel;
      uniform vec3 horizonColor;
      uniform float centerAngle;
      uniform float arcLength;

      #define PI 3.14159265359

      float getAngleDistance(float a, float b) {
        float diff = a - b;
        if (diff < -PI) diff += PI * 2.0;
        if (diff > PI) diff -= PI * 2.0;
        return abs(diff);
      }

      void main() {
        #ifdef USE_FOG
          float dist = length(vWorldPosition.xz);
          float t = clamp((dist - innerRadius) / max(outerRadius - innerRadius, 0.0001), 0.0, 1.0);
          float fade = smoothstep(0.08, 0.96, t);
          float heightFade = smoothstep(seaLevel + 0.4, seaLevel + 8.0, vWorldPosition.y);

          // Angular fade
          // We need angle in the ring's coordinate system (which is rotated -90X)
          // Actually, vWorldPosition is world space.
          // Ring geometry was created in XY then rotated to XZ.
          // x_ring = x_world
          // y_ring = -z_world
          float angle = atan(-vWorldPosition.z, vWorldPosition.x);

          float angleDist = getAngleDistance(angle, centerAngle);
          float arcEdge = arcLength * 0.5;
          // Fade out over the last 15% of the arc or fixed angle
          float taper = clamp((arcEdge - angleDist) / 0.5, 0.0, 1.0);

          float alpha = fade * (1.0 - heightFade) * 0.68 * taper;

          if (alpha <= 0.003) {
            gl_FragColor = vec4(0.0);
            discard;
          }

          vec3 color = mix(horizonColor, fogColor, fade * 0.85);
          gl_FragColor = vec4(color, alpha);
        #else
          gl_FragColor = vec4(0.0);
          discard;
        #endif
      }
    `,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "WaterHorizonFade";
  mesh.position.y = seaLevel + 0.06;
  mesh.renderOrder = RENDER_LAYERS.WATER;
  mesh.userData.nonInteractive = true;
  return mesh;
}

export function createShorelineTermination(scene, options = {}) {
  const seaLevel = Number.isFinite(options.seaLevel)
    ? options.seaLevel
    : getSeaLevelY();
  const innerRadius = Math.max(options.innerRadius ?? DEFAULT_COASTAL_INNER_RADIUS, 100);
  const bandWidth = Math.max(options.bandWidth ?? DEFAULT_COASTAL_WIDTH, 10);
  const outerRadius = innerRadius + bandWidth;
  const oceanRadius = Math.max(options.oceanRadius ?? outerRadius + 360, outerRadius + 120);
  const fadeWidth = Math.max(Math.min(options.fadeWidth ?? 320, oceanRadius - outerRadius - 20), 120);

  const fogColor = resolveFogColor(scene, options.fogColor);
  const horizonColor = options.horizonColor
    ? new THREE.Color(options.horizonColor)
    : SKY_HORIZON_COLOR.clone();

  const group = new THREE.Group();
  group.name = "ShoreTermination";
  group.userData.nonInteractive = true;

  const coastalBand = createCoastalBand({ innerRadius, outerRadius, seaLevel });
  const rocks = createSilhouetteScatter({ innerRadius, outerRadius, seaLevel });
  const waterFade = createWaterFadeRing({
    innerRadius: outerRadius - 6,
    outerRadius: Math.min(oceanRadius - 40, outerRadius + fadeWidth),
    seaLevel,
    fogColor,
    horizonColor,
  });

  group.add(coastalBand, rocks, waterFade);

  if (scene) {
    scene.add(group);
  }

  group.userData.bounds = { innerRadius, outerRadius, oceanRadius };
  group.userData.seaLevel = seaLevel;
  return group;
}
