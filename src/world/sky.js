// src/world/sky.js
import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";

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
