// main.js

import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { createSky, updateSky } from "./world/sky.js";
import { createLighting, updateLighting } from "./world/lighting.js";

function init() {
  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Scene & camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(0, 5, 10);

  // Sky & lighting
  const skyObj = createSky(scene);
  const lights = createLighting(scene);

  // Optional: add a ground plane
  {
    const groundGeo = new THREE.PlaneGeometry(1000, 1000);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x556655 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();
    const dayDuration = 60; // seconds for full day cycle
    const phase = (elapsed % dayDuration) / dayDuration;

    // Compute sun vector (in sky dome space)
    const theta = phase * Math.PI * 2; // full cycle
    const sun = new THREE.Vector3(
      Math.cos(theta),
      Math.sin(theta),
      0
    );

    // Update sky and lighting
    updateSky(skyObj, sun);
    updateLighting(lights, sun);

    // Render
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

init();
