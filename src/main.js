// main.js

import * as THREE from "three";
import { createSky, updateSky, createStars, updateStars } from "./world/sky.js";
import { createLighting, updateLighting, createMoon, updateMoon } from "./world/lighting.js";
import { MainCharacter } from "./world/mainCharacter.js";
import { createInteractor } from "./world/interactions.js";
import { attachCrosshair } from "./world/ui/crosshair.js";
import { createTerrain, updateTerrain } from "./world/terrain.js";

function init() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  attachCrosshair();

  const interactPrompt = document.createElement("div");
  interactPrompt.textContent = "Press E to interact";
  Object.assign(interactPrompt.style, {
    position: "fixed",
    left: "50%",
    bottom: "20%",
    transform: "translateX(-50%)",
    padding: "8px 12px",
    borderRadius: "6px",
    background: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    fontFamily: "sans-serif",
    fontSize: "14px",
    letterSpacing: "0.05em",
    opacity: "0",
    transition: "opacity 0.2s ease",
    pointerEvents: "none",
  });
  document.body.appendChild(interactPrompt);

  const scene = new THREE.Scene();
  // Light atmospheric fog increases depth perception so the far mountains blend
  // into the horizon. Adjust near/far distances to taste.
  scene.fog = new THREE.Fog(0xa0a0a0, 50, 400);
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
  // Generate a dynamic terrain mesh so the world has rolling hills instead of
  // a perfectly flat plane. We'll pass the mesh to the character so it can
  // query ground height during its update loop.
  const terrain = createTerrain(scene);

  // Add a few simple boxes so you can test bumping into obstacles.
  const obstacleGeo = new THREE.BoxGeometry(2, 2, 2);
  for (let i = 0; i < 3; i++) {
    const obstacleMat = new THREE.MeshStandardMaterial({ color: 0x884422 });
    const obstacle = new THREE.Mesh(obstacleGeo, obstacleMat);
    obstacle.position.set(i * 4 - 4, 1, -5);
    obstacle.castShadow = true;
    obstacle.receiveShadow = true;
    scene.add(obstacle);
    colliders.push(obstacle);
  }

  // Example interactable props. userData acts like a metadata bag so you can
  // describe behaviour without subclassing three.js meshes.
  const interactableGeo = new THREE.ConeGeometry(1, 2, 12);
  for (let i = 0; i < 2; i++) {
    const material = new THREE.MeshStandardMaterial({ color: 0x3366aa });
    const interactable = new THREE.Mesh(interactableGeo, material);
    interactable.position.set(-2 + i * 4, 1, -12);
    interactable.name = `Beacon_${i + 1}`;
    interactable.castShadow = true;
    interactable.receiveShadow = true;
    interactable.userData.interactable = true;
    interactable.userData.onUse = (object) => {
      console.log("Used", object.name);
    };
    scene.add(interactable);
  }

  // Create a simple controllable character that we update each frame.
  const character = new MainCharacter(scene, camera);
  const interactor = createInteractor(renderer, camera, scene);

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

    // Dynamic terrain subtly sways, hinting at wind. Remove this call if you
    // prefer a static landscape without vertex animation.
    updateTerrain(terrain, elapsed);

    // Update our character so they respond to input and move around the scene.
    character.update(deltaTime, colliders, terrain);

    // Cast a ray through the center of the screen to detect hovered objects.
    const hovered = interactor.updateHover();
    interactPrompt.style.opacity = hovered ? "1" : "0";

    renderer.render(scene, camera);
  }

  animate();

  renderer.domElement.addEventListener("pointerdown", () => {
    interactor.useObject();
  });

  window.addEventListener("keydown", (event) => {
    if (event.code === "KeyE") {
      interactor.useObject();
    }
  });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

init();
