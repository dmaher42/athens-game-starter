// src/world/sky.js
import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";

// Constants used for the procedural star field.
const STAR_COUNT = 1200;
const STAR_FIELD_RADIUS = 1000;

export function createSky(scene) {
  const sky = new Sky();
  sky.scale.setScalar(450000);  // make it very large

  // Uniforms you can tweak for atmosphere effect
  const uniforms = sky.material.uniforms;
  uniforms[ "turbidity" ].value = 10;
  uniforms[ "rayleigh" ].value = 2;
  uniforms[ "mieCoefficient" ].value = 0.005;
  uniforms[ "mieDirectionalG" ].value = 0.8;

  // initial sun position
  const sun = new THREE.Vector3();
  // We'll update sun later in updateSky

  scene.add(sky);

  return { sky, sun };
}

export function updateSky(skyObj, sun) {
  // skyObj: { sky, sun } or whatever shape you used
  const { sky } = skyObj;
  // set the uniform for sun position
  sky.material.uniforms[ "sunPosition" ].value.copy(sun);
}

export function createStars(scene) {
  // Create a simple star field using THREE.Points and randomised vertices.
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(STAR_COUNT * 3);
  const colors = new Float32Array(STAR_COUNT * 3);

  for (let i = 0; i < STAR_COUNT; i++) {
    // Generate a random unit direction so stars wrap the whole sky dome.
    const direction = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    ).normalize();

    const distance = STAR_FIELD_RADIUS * (0.8 + Math.random() * 0.2);
    const idx = i * 3;
    positions[idx] = direction.x * distance;
    positions[idx + 1] = direction.y * distance;
    positions[idx + 2] = direction.z * distance;

    // Give each star a slightly different brightness for variation.
    const brightness = 0.5 + Math.random() * 0.5;
    colors[idx] = brightness;
    colors[idx + 1] = brightness;
    colors[idx + 2] = brightness;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1.2,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0, // Start invisible; we fade the stars in at night.
    depthWrite: false,
  });

  const stars = new THREE.Points(geometry, material);
  stars.matrixAutoUpdate = false;
  stars.updateMatrix();
  scene.add(stars);

  return stars;
}

export function updateStars(stars, sunHeight) {
  if (!stars) return;

  const material = stars.material;
  if (!material) return;

  // Use the sun height to determine how visible the stars should be.
  const targetOpacity = THREE.MathUtils.clamp(
    1 - THREE.MathUtils.smoothstep(sunHeight, -0.1, 0.2),
    0,
    1
  );

  // Lerp towards the target so the transition feels soft.
  material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.05);
}
