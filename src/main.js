// main.js

import * as THREE from "three";
import { createSky, updateSky, createStars, updateStars } from "./world/sky.js";
import { createLighting, updateLighting, createMoon, updateMoon } from "./world/lighting.js";
import { createInteractor } from "./world/interactions.js";
import { attachCrosshair } from "./world/ui/crosshair.js";
import { createTerrain, updateTerrain } from "./world/terrain.js";
import { initializeAssetTranscoders } from "./world/landmarks.js";
import { InputMap } from "./input/InputMap";
import { EnvironmentCollider } from "./env/EnvironmentCollider";
import { BuildingManager } from "./buildings/BuildingManager";
import { PlayerController } from "./controls/PlayerController";
import { Character } from "./characters/Character";

function isHtmlResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("text/html");
}

async function probeAsset(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    if (response.ok && !isHtmlResponse(response)) {
      return true;
    }

    if (response.status === 405 || response.status === 501) {
      const getResponse = await fetch(url, { method: "GET" });
      return getResponse.ok && !isHtmlResponse(getResponse);
    }

    return false;
  } catch (error) {
    console.debug(`Asset probe failed for "${url}"`, error);
    return false;
  }
}

window.addEventListener("unhandledrejection", (ev) => {
  console.error("Unhandled promise rejection:", ev.reason);
});

async function mainApp() {
  console.log("🔧 Athens mainApp start");
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  initializeAssetTranscoders(renderer);
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

  const input = new InputMap(renderer.domElement);
  const envCollider = new EnvironmentCollider();
  scene.add(envCollider.mesh);
  envCollider.fromStaticScene(scene);
  const player = new PlayerController(input, envCollider, { camera });
  scene.add(player.object);

  const createFallbackAvatar = () => {
    const group = new THREE.Group();
    group.name = "FallbackAvatar";

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x4e8ef7,
      metalness: 0.2,
      roughness: 0.6,
    });

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 1.2, 16),
      bodyMaterial
    );
    body.castShadow = true;
    body.receiveShadow = true;
    body.position.y = 0.6;
    group.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf4f7ff, roughness: 0.4 })
    );
    head.castShadow = true;
    head.position.y = 1.32;
    group.add(head);

    return group;
  };

  const character = new Character();
  const heroPath = `${import.meta.env.BASE_URL}models/character/hero.glb`;
  const attachFallbackAvatar = () => {
    const fallbackAvatar = createFallbackAvatar();
    player.object.add(fallbackAvatar);
    fallbackAvatar.position.set(0, 0, 0);
  };

  if (await probeAsset(heroPath)) {
    try {
      await character.load(heroPath, renderer);
      player.attachCharacter(character);
    } catch (error) {
      console.error(
        `⚠️ Unable to fetch hero GLB from "${heroPath}". mainApp will continue with a placeholder avatar.`,
        error
      );
      attachFallbackAvatar();
    }
  } else {
    console.info(
      `Hero avatar not detected at "${heroPath}". Drop a model in public/models/character/hero.glb to enable the full character. mainApp will continue with a placeholder avatar.`
    );
    attachFallbackAvatar();
  }

  const buildingMgr = new BuildingManager(envCollider);
  const tombOptions = {
    scale: 1.2,
    position: new THREE.Vector3(6, 0, -28),
    rotateY: Math.PI * 0.15,
    collision: true,
  };
  const buildingBase = `${import.meta.env.BASE_URL}models/buildings/`;

  const tombUrl = `${buildingBase}aristotle-tomb.glb`;
  const fallbackUrl = `${buildingBase}Akropol.glb`;
  if (await probeAsset(tombUrl)) {
    try {
      await buildingMgr.loadBuilding(tombUrl, tombOptions);
    } catch (error) {
      console.warn(
        "Aristotle's Tomb failed to load. Download it with npm run download:aristotle.",
        error
      );
      try {
        await buildingMgr.loadBuilding(fallbackUrl, tombOptions);
      } catch (fallbackError) {
        console.error('Akropol fallback model also failed to load.', fallbackError);
      }
    }
  } else {
    console.info(
      "Aristotle's Tomb premium asset not detected. Install it with npm run download:aristotle."
    );
    try {
      await buildingMgr.loadBuilding(fallbackUrl, tombOptions);
    } catch (fallbackError) {
      console.error('Akropol fallback model also failed to load.', fallbackError);
    }
  }

  console.log("Scene children:", scene.children);
  scene.traverse((obj) => {
    console.log(
      "Object:",
      obj.name || obj.type,
      "pos",
      obj.position?.toArray ? obj.position.toArray() : obj.position
    );
  });

  const interactor = createInteractor(renderer, camera, scene);

  const clock = new THREE.Clock();
  const dayDuration = 60; // seconds for full cycle

  let frameCount = 0;
  function animate() {
    frameCount += 1;
    if (frameCount === 1) {
      console.log("🌀 Entered render loop");
    }
    if (frameCount % 60 === 0) {
      console.log("⏱ frame", frameCount);
    }
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

    // Update player movement and drive the attached character animation.
    player.update(deltaTime);

    // Cast a ray through the center of the screen to detect hovered objects and
    // highlight anything marked as interactable via userData.
    const hovered = interactor.updateHover();
    interactPrompt.style.opacity = hovered ? "1" : "0";

    renderer.render(scene, camera);
  }

  animate();

  // Simple controls: clicking the canvas or pressing E will run the onUse
  // callback attached to whatever we are currently looking at.
  renderer.domElement.addEventListener("pointerdown", (event) => {
    if (event.button === 0 && !input.pointerLocked) {
      input.requestPointerLock();
    }
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

(async () => {
  try {
    await mainApp();
    console.log("✅ mainApp loaded successfully");
  } catch (err) {
    console.error("❌ Error in mainApp:", err);
  }
})();
