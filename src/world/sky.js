// src/world/sky.js

import { Sky } from "three/examples/jsm/objects/Sky.js";
import * as THREE from "three";

// Constants describing the star field radius to wrap the camera.
const STAR_FIELD_RADIUS = 1000;

const SUN_DISTANCE = 400000;

function createSunTexture() {
  if (typeof document === "undefined") {
    return null;
  }
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.1,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "#fff6cc");
  gradient.addColorStop(0.4, "#ffe7a3");
  gradient.addColorStop(1, "rgba(255, 231, 163, 0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createCloudMaterial() {
  const uniforms = {
    time: { value: 0 },
    dayFactor: { value: 1 },
    cloudColor: { value: new THREE.Color(0xffffff) },
    skyTint: { value: new THREE.Color(0x6bb5ff) },
    coverage: { value: 0.45 },
    softness: { value: 0.25 },
  };

  const vertexShader = `
    varying vec3 vWorldPosition;

    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `;

  const fragmentShader = `
    precision highp float;

    varying vec3 vWorldPosition;
    uniform float time;
    uniform float dayFactor;
    uniform vec3 cloudColor;
    uniform vec3 skyTint;
    uniform float coverage;
    uniform float softness;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);

      vec2 u = f * f * (3.0 - 2.0 * f);

      float a = hash(i + vec2(0.0, 0.0));
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;

      for (int i = 0; i < 5; i++) {
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }

      return value;
    }

    void main() {
      vec2 uv = vWorldPosition.xz * 0.00045;
      float t = time * 0.015;
      uv += vec2(t, t * 0.37);

      float density = fbm(uv);
      float shape = smoothstep(coverage, coverage - softness, density);
      shape = pow(shape, 1.1);

      float alpha = shape * mix(0.08, 0.45, dayFactor);
      if (alpha <= 0.001) discard;

      vec3 color = mix(skyTint, cloudColor, shape);
      gl_FragColor = vec4(color, alpha);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
  });
}

export function createSky(scene) {
  // Build and configure the sky dome shader.
  const sky = new Sky();
  sky.scale.setScalar(450000); // make it very big
  // Mark the sky dome as non-collidable so it is ignored when building
  // the environment collider. Otherwise the huge sphere would be merged
  // into the collision geometry and the player capsule would constantly
  // intersect it, preventing movement.
  sky.userData.noCollision = true;

  const uniforms = sky.material.uniforms;
  uniforms.turbidity.value = 4;
  uniforms.rayleigh.value = 2.8;
  uniforms.mieCoefficient.value = 0.0045;
  uniforms.mieDirectionalG.value = 0.7;

  // initialize sunPosition so shader is defined
  uniforms.sunPosition.value.set(0, 1, 0);

  scene.add(sky);

  const cloudMaterial = createCloudMaterial();
  const cloudGeometry = new THREE.SphereGeometry(440000, 60, 32);
  const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
  clouds.scale.set(1, 0.6, 1);
  clouds.userData.noCollision = true;
  clouds.renderOrder = sky.renderOrder + 1;
  scene.add(clouds);

  const sunTexture = createSunTexture();
  const sunMaterial = new THREE.SpriteMaterial({
    map: sunTexture ?? undefined,
    color: 0xffffff,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const sunSprite = new THREE.Sprite(sunMaterial);
  sunSprite.scale.setScalar(70000);
  sunSprite.userData.noCollision = true;
  scene.add(sunSprite);

  return { sky, clouds, cloudMaterial, sunSprite };
}

const scratchSunDirection = new THREE.Vector3(0, 1, 0);

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function setTimeOfDayPhase(state, phase01) {
  if (!state || typeof state !== "object") return 0;
  const clamped = clamp01(phase01);
  state.timeOfDayPhase = clamped;
  return clamped;
}

export function getSunDirectionFromPhase(phase01, target = scratchSunDirection) {
  const phase = clamp01(phase01);
  const theta = (phase - 0.25) * Math.PI * 2;
  target.set(Math.cos(theta), Math.sin(theta), 0);
  return target.normalize();
}

export function updateSky(skyObj, state) {
  // Guard against missing uniforms or objects so runtime stays safe.
  const { sky, clouds, cloudMaterial, sunSprite } = skyObj || {};
  if (
    !sky ||
    !sky.material ||
    !sky.material.uniforms ||
    !sky.material.uniforms.sunPosition
  ) {
    return;
  }
  // Copy normalized sun direction into the shader uniform
  const phase = state?.timeOfDayPhase ?? 0;
  const sunDir = getSunDirectionFromPhase(phase, scratchSunDirection);
  sky.material.uniforms.sunPosition.value.copy(sunDir).normalize();

  const elapsed = state?.elapsedSeconds ?? 0;

  if (clouds) {
    clouds.rotation.y = elapsed * 0.01;
  }

  if (cloudMaterial) {
    const uniforms = cloudMaterial.uniforms;
    if (uniforms.time) uniforms.time.value = elapsed;
    if (uniforms.dayFactor) {
      const dayFactor = THREE.MathUtils.clamp(
        THREE.MathUtils.smoothstep(sunDir.y, -0.1, 0.2),
        0,
        1
      );
      uniforms.dayFactor.value = dayFactor;

      if (uniforms.coverage) {
        const targetCoverage = THREE.MathUtils.lerp(0.52, 0.37, dayFactor);
        uniforms.coverage.value = THREE.MathUtils.lerp(
          uniforms.coverage.value,
          targetCoverage,
          0.05
        );
      }

      if (uniforms.softness) {
        const targetSoftness = THREE.MathUtils.lerp(0.18, 0.28, dayFactor);
        uniforms.softness.value = THREE.MathUtils.lerp(
          uniforms.softness.value,
          targetSoftness,
          0.05
        );
      }
    }
  }

  if (sunSprite) {
    const sunHeight = sunDir.y;
    const dayFactor = THREE.MathUtils.clamp(
      THREE.MathUtils.smoothstep(sunHeight, -0.2, 0.05),
      0,
      1
    );
    sunSprite.position.copy(sunDir).normalize().multiplyScalar(SUN_DISTANCE);
    sunSprite.material.opacity = 0.2 + dayFactor * 0.8;
    sunSprite.visible = dayFactor > 0.01;
  }

  return sunDir;
}

export function createStars(scene, count) {
  // Generate a star field using random points on a sphere surface.
  const starCount = Math.max(0, count ?? 1000);
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    // Pick a random direction, normalise it, then place it on a shell so
    // stars surround the camera at a consistent distance.
    const direction = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    ).normalize();
    const distance = STAR_FIELD_RADIUS * (0.8 + Math.random() * 0.2);
    const index = i * 3;
    positions[index] = direction.x * distance;
    positions[index + 1] = direction.y * distance;
    positions[index + 2] = direction.z * distance;
  }

  // Write the generated star data into the geometry buffers.
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  // PointsMaterial renders every vertex as a small sprite. We give it a tiny
  // size, a white colour and enable transparency so we can fade the stars.
  const material = new THREE.PointsMaterial({
    size: 1.2,
    color: 0xffffff,
    transparent: true,
    opacity: 0, // Start hidden; updateStars will fade them in at night.
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  // Combine the geometry and material into a THREE.Points object and add it to
  // the scene so it renders around the player.
  const stars = new THREE.Points(geometry, material);
  stars.matrixAutoUpdate = false; // Stars don't move; freeze their matrix.
  stars.updateMatrix();

  scene.add(stars);
  return stars;
}

export function updateStars(stars, phase) {
  // Bail out when stars are not ready yet.
  if (!stars) return;

  const material = stars.material;
  if (!material) return;

  // Convert the current phase of the day (0 = midnight, 0.5 = midday) into
  // the sun's height in the sky using a sine wave: -1 (midnight) to +1 (midday).
  const sunElevation = Math.sin(phase * Math.PI * 2);

  // Fade the stars out shortly before the sun reaches the horizon and keep them
  // invisible while it is high in the sky for a gentle transition.
  const fadeStart = -0.2; // sun just below the horizon
  const fadeEnd = 0.1;    // sun a little way into the sky
  const nightStrength = 1 - THREE.MathUtils.smoothstep(sunElevation, fadeStart, fadeEnd);

  // Slowly interpolate towards the desired opacity so the change is smooth.
  material.opacity = THREE.MathUtils.lerp(material.opacity, nightStrength, 0.05);
}
