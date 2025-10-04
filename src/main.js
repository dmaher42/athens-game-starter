import * as THREE from "three";
import { createSky, updateSky } from "./world/sky.js";
import { createLighting, updateLighting } from "./world/lighting.js";

function init() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75,
    window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 5, 10);

  const skyObj = createSky(scene);
  const lights = createLighting(scene);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();
    const dayDuration = 60;  // seconds for full day cycle
    const phase = (elapsed % dayDuration) / dayDuration;

    // Convert phase to sun vector
    // simple circular path in sky
    const theta = phase * Math.PI * 2;  // full circle
    const radius = 1;
    // Let sun go from horizon (-y) up to peak, etc.
    const sun = new THREE.Vector3(
      Math.cos(theta),
      Math.sin(theta),
      0
    );

    updateSky(skyObj, sun);
    updateLighting(lights, sun);

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
