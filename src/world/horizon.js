import * as THREE from "three";
import { getSeaLevelY } from "./seaLevelState.js";

const DEFAULT_HORIZON_RADIUS = 1800;
const DEFAULT_FADE_WIDTH = 320;
const SKYBOX_SEA_TINT = new THREE.Color(0x2a3f5c);
const SKYBOX_SKY_BLEND = new THREE.Color(0x6b7f9c);

function resolveFogColor(scene) {
  const fallback = SKYBOX_SKY_BLEND.clone();
  if (scene?.fog?.color) {
    return scene.fog.color.clone();
  }
  const fogOptions = scene?.userData?.getFogOptions?.();
  if (fogOptions?.color) {
    return fogOptions.color.clone();
  }
  return fallback;
}

function createHorizonRing({
  innerRadius,
  outerRadius,
  seaLevel,
  horizonColor,
  fogColor,
}) {
  const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 128, 1);
  geometry.rotateX(-Math.PI / 2);

  const uniforms = {
    innerRadius: { value: innerRadius },
    outerRadius: { value: outerRadius },
    seaLevel: { value: seaLevel },
    horizonColor: { value: horizonColor.clone() },
    fogColor: { value: fogColor.clone() },
  };

  const material = new THREE.ShaderMaterial({
    name: "SkyboxHorizonRing",
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms,
    vertexShader: /* glsl */ `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vWorldPosition;
      uniform float innerRadius;
      uniform float outerRadius;
      uniform float seaLevel;
      uniform vec3 horizonColor;
      uniform vec3 fogColor;

      #define PI 3.14159265

      void main() {
        vec2 xz = vWorldPosition.xz;
        float dist = length(xz);

        // Directional Fade Logic
        // We want opacity in the West (-X) but fade it out in the East (+X).
        // East is angle 0. West is angle PI.
        float angle = atan(xz.y, xz.x); // Range -PI to PI

        // Normalize angle so East=0, West=1.
        // We want opacity high at West (cos(angle) near -1)
        // and low at East (cos(angle) near 1).
        // Let's use smooth transition.
        float eastness = cos(angle); // 1 at East, -1 at West.

        // Asymmetric Opacity Factor
        // If eastness > 0 (East), reduce opacity.
        // If eastness < 0 (West), keep opacity high.
        // smoothstep(edge0, edge1, x): results are undefined if edge0 >= edge1.
        // We want 1.0 at -0.5 and 0.0 at 0.5.
        // x is eastness.
        // standard smoothstep(-0.5, 0.5, eastness) gives 0 at -0.5 (Westish) and 1 at 0.5 (Eastish).
        // So we invert it.
        float asymmetricAlpha = 1.0 - smoothstep(-0.5, 0.5, eastness);
        // This gives 1.0 at West (cos=-1) down to 0.0 at East (cos=1).

        // Add a base minimum so it's not totally invisible in East?
        // No, task says "open and expansive toward the east".
        // Let's keep a tiny bit (0.1) for continuity, but mostly fade.
        asymmetricAlpha = 0.0 + asymmetricAlpha * 1.0;

        float radialFade = clamp((dist - innerRadius) / max(outerRadius - innerRadius, 0.0001), 0.0, 1.0);
        float alpha = 1.0 - smoothstep(0.0, 1.0, radialFade);

        // Gently fade out if the band is ever viewed from above sea level.
        float heightFade = smoothstep(seaLevel, seaLevel + 12.0, vWorldPosition.y);
        alpha *= (1.0 - heightFade);

        // Apply directional asymmetry
        alpha *= asymmetricAlpha;

        if (alpha <= 0.01) discard;

        vec3 color = mix(horizonColor, fogColor, radialFade * 0.7);
        gl_FragColor = vec4(color, alpha * 0.65);
      }
    `,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "HorizonFadeRing";
  mesh.renderOrder = -2;
  return mesh;
}

export function createHorizon(scene, options = {}) {
  const seaLevel = Number.isFinite(options.seaLevel)
    ? options.seaLevel
    : getSeaLevelY();
  const radius = Math.max(options.radius ?? DEFAULT_HORIZON_RADIUS, 400);
  const fadeWidth = Math.max(options.fadeWidth ?? DEFAULT_FADE_WIDTH, 80);
  const innerRadius = Math.max(radius - fadeWidth, 10);
  const outerRadius = radius + fadeWidth;

  const fogColor = resolveFogColor(scene);
  const horizonColor = options.horizonColor
    ? new THREE.Color(options.horizonColor)
    : SKYBOX_SEA_TINT;

  const group = new THREE.Group();
  group.name = "HorizonSystem";

  const ring = createHorizonRing({
    innerRadius,
    outerRadius,
    seaLevel,
    horizonColor,
    fogColor,
  });
  ring.position.y = seaLevel;
  group.add(ring);

  // Soften distance falloff to better match the painted sea line of the skybox.
  const setFogOptions = scene?.userData?.setFogOptions;
  if (typeof setFogOptions === "function") {
    setFogOptions({
      color: fogColor.lerp(horizonColor, 0.25),
      near: Math.max(scene?.fog?.near ?? 0, 180),
      far: Math.max(scene?.fog?.far ?? 0, outerRadius * 0.9),
    });
  }

  if (scene) {
    scene.add(group);
  }

  group.userData.horizonRadius = radius;
  group.userData.fadeWidth = fadeWidth;
  return group;
}
