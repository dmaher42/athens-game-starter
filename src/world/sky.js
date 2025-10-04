// src/world/sky.js

import { Sky } from "three/examples/jsm/objects/Sky.js";
import * as THREE from "three";

export function createSky(scene) {
  const sky = new Sky();
  sky.scale.setScalar(450000);  // make it huge so it surrounds everything

  const uniforms = sky.material.uniforms;
  uniforms.turbidity.value = 10;
  uniforms.rayleigh.value = 2;
  uniforms.mieCoefficient.value = 0.005;
  uniforms.mieDirectionalG.value = 0.8;

  // initialize sunPosition to something (so you don’t see black sky immediately)
  uniforms.sunPosition.value.set(0, 1, 0);

  scene.add(sky);

  return { sky };
}

export function updateSky(skyObj, sun) {
  const { sky } = skyObj;
  if (!sky || !sky.material || !sky.material.uniforms.sunPosition) {
    return;
  }
  // Copy sun vector (normalized) into uniform
  sky.material.uniforms.sunPosition.value.copy(sun).normalize();
}
