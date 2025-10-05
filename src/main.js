// main.js

import * as THREE from "three";
import { createSky, updateSky, createStars, updateStars } from "./world/sky.js";
import { createLighting, updateLighting, createMoon, updateMoon } from "./world/lighting.js";
import { MainCharacter } from "./world/mainCharacter.js";
import { createInteractor } from "./world/interactions.js";
import { attachCrosshair } from "./world/ui/crosshair.js";

function init() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  attachCrosshair();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.set(0, 5, 10);

  // Sky, stars & lighting
  const skyObj = createSky(scene);
  const lights = createLighting(scene);
  // Create a star field with 1000 tiny points so nights feel alive.
  const stars = createStars(scene, 1000);
  const moon = createMoon(scene);

  const colliders = [];

  // Optional ground so you see a floor, and also collide against it.
  {
    const groundGeo = new THREE.PlaneGeometry(1000, 1000);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x556655 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);
    colliders.push(ground);
  }

  // Add a few simple boxes so you can test bumping into obstacles.
  const obstacleGeo = new THREE.BoxGeometry(2, 2, 2);
  const obstacleMat = new THREE.MeshStandardMaterial({ color: 0x884422 });
  for (let i = 0; i < 3; i++) {
    const obstacle = new THREE.Mesh(obstacleGeo, obstacleMat);
    obstacle.position.set(i * 4 - 4, 1, -5);
    obstacle.castShadow = true;
    obstacle.receiveShadow = true;
    scene.add(obstacle);
    colliders.push(obstacle);
  }

  // Create a simple controllable character that we update each frame.
  const character = new MainCharacter(scene, camera);
  const interactor = createInteractor(renderer, camera, scene);

  function onInteract(hit) {
    const { object } = hit;
    if (!object) return;

    console.log(`Interacted with ${object.name || object.type}`);

    if (object.userData && typeof object.userData.onUse === "function") {
      object.userData.onUse(hit);
      return;
    }

    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];
    const originals = new Map();

    for (const material of materials) {
      if (!material) continue;
      if (material.emissive) {
        originals.set(material, material.emissive.clone());
        material.emissive.offsetHSL(0, 0, 0.3);
      } else if (material.color) {
        originals.set(material, material.color.clone());
        material.color.offsetHSL(0, 0, 0.3);
      }
    }

    setTimeout(() => {
      for (const [material, color] of originals.entries()) {
        if (material.emissive && color.isColor) {
          material.emissive.copy(color);
        } else if (material.color && color.isColor) {
          material.color.copy(color);
        }
      }
    }, 200);
  }

  const clock = new THREE.Clock();
  const dayDuration = 60; // seconds for full cycle

  function animate() {
    requestAnimationFrame(animate);

    // Keep track of time for smooth animation and frame-independent movement.
    const deltaTime = clock.getDelta();
    const elapsed = clock.elapsedTime;
    const phase = (elapsed % dayDuration) / dayDuration;

    const theta = phase * Math.PI * 2;
    const sunDir = new THREE.Vector3(
      Math.cos(theta),
      Math.sin(theta),
      0
    );

    // Update sky dome, atmospheric lighting, and celestial bodies each frame.
    updateSky(skyObj, sunDir);
    updateLighting(lights, sunDir);
    // Fade the stars in and out depending on the time of day.
    updateStars(stars, phase);
    updateMoon(moon, sunDir);

    // Update our character so they respond to input and move around the scene.
    character.update(deltaTime, colliders);

    // Cast a ray through the center of the screen to detect hovered objects.
    const hoverHit = interactor.pickCenter();
    if (interactor.updateHover) {
      interactor.updateHover(hoverHit ? hoverHit.object : null);
    }

    renderer.render(scene, camera);
  }

  animate();

  renderer.domElement.addEventListener("pointerdown", () => {
    const hit = interactor.pickCenter();
    if (hit) {
      onInteract(hit);
    }
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

init();
