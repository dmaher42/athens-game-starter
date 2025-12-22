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

        // Directional Fade Logic (Mainland)
        // East (+X) is open sea -> Horizon Ring VISIBLE.
        // West (-X) is inland hills -> Horizon Ring INVISIBLE (hidden by terrain or masked).

        float angle = atan(xz.y, xz.x); // Range -PI to PI. East is 0. West is PI.
        float eastness = cos(angle); // 1.0 at East, -1.0 at West.

        // We want opacity:
        // East (1.0) -> High opacity (Sea)
        // West (-1.0) -> Low opacity (Land)

        // smoothstep:
        // edge0 = -0.2 (Start fading near West-ish)
        // edge1 = 0.5 (Full opacity in East)
        float directionalAlpha = smoothstep(-0.5, 0.5, eastness);

        // Make West completely gone to avoid cutting through mountains
        if (directionalAlpha < 0.05) discard;

        float radialFade = clamp((dist - innerRadius) / max(outerRadius - innerRadius, 0.0001), 0.0, 1.0);

        // Base alpha from radial fade
        float alpha = 1.0 - smoothstep(0.0, 1.0, radialFade);

        // Gently fade out if the band is ever viewed from above sea level.
        float heightFade = smoothstep(seaLevel, seaLevel + 12.0, vWorldPosition.y);
        alpha *= (1.0 - heightFade);

        // Apply directional asymmetry
        alpha *= directionalAlpha;

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
