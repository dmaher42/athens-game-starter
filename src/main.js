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
  // describe behaviour without subclassing three.js meshes. Below we hook up a
  // swinging door and a street lamp that toggles its light.

  const doorPivot = new THREE.Group();
  doorPivot.name = "DemoDoor";
  doorPivot.position.set(-2, 0, -12);

  const doorGeometry = new THREE.BoxGeometry(1.2, 2.4, 0.12);
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x5a3310 });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0.6, 1.2, 0);
  door.castShadow = true;
  door.receiveShadow = true;
  doorPivot.add(door);

  doorPivot.userData.interactable = true;
  doorPivot.userData.highlightTarget = door;
  doorPivot.userData.open = false;
  doorPivot.userData.onUse = (object) => {
    const willOpen = !object.userData.open;
    object.userData.open = willOpen;
    door.rotation.y = willOpen ? -Math.PI / 2 : 0;
    console.log(`Door ${willOpen ? "opened" : "closed"}`);
  };

  scene.add(doorPivot);

  const lamp = new THREE.Group();
  lamp.name = "DemoLamp";
  lamp.position.set(2, 0, -12);

  const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 12);
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x303030 });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.y = 1.5;
  pole.castShadow = false;
  lamp.add(pole);

  const bulbMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    emissive: new THREE.Color(0xfff5b5),
    emissiveIntensity: 1.5,
  });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), bulbMaterial);
  bulb.position.y = 3;
  bulb.castShadow = false;
  lamp.add(bulb);

  const pointLight = new THREE.PointLight(0xfff5b5, 1.5, 12, 2);
  pointLight.position.y = 3;
  pointLight.castShadow = true;
  lamp.add(pointLight);

  lamp.userData.interactable = true;
  lamp.userData.highlightTarget = bulb;
  lamp.userData.light = pointLight;
  lamp.userData.onUse = (object) => {
    const light = object.userData.light;
    if (!light) return;
    const isOn = light.intensity > 0.1;
    light.intensity = isOn ? 0 : 1.5;
    bulbMaterial.emissiveIntensity = isOn ? 0 : 1.5;
    console.log(`Lamp ${isOn ? "turned off" : "turned on"}`);
  };

  scene.add(lamp);

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
