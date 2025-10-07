// main.js

import * as THREE from "three";
import { createSky, updateSky, createStars, updateStars } from "./world/sky.js";
import { createLighting, updateLighting, createMoon, updateMoon } from "./world/lighting.js";
import { createInteractor } from "./world/interactions.js";
import { attachCrosshair } from "./world/ui/crosshair.js";
import { createTerrain, updateTerrain } from "./world/terrain.js";
import { createOcean, updateOcean } from "./world/ocean.js";
import { createHarbor, updateHarborLighting } from "./world/harbor.js";
import { createCity, updateCityLighting } from "./world/city.js";
import { CITY_CHUNK_CENTER, HARBOR_CENTER_3D } from "./world/locations.js";
import { initializeAssetTranscoders } from "./world/landmarks.js";
import { createCivicDistrict } from "./world/cityPlan.js";
import { InputMap } from "./input/InputMap.js";
import { EnvironmentCollider } from "./env/EnvironmentCollider.js";
import { BuildingManager } from "./buildings/BuildingManager.js";
import { PlayerController } from "./controls/PlayerController.js";
import { Character } from "./characters/Character.js";
import { spawnCitizenCrowd } from "./world/npcs.js";
import { mountExposureSlider } from "./ui/exposureSlider.js";

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

async function resolveFirstAvailableAsset(urls) {
  for (const url of urls) {
    if (await probeAsset(url)) {
      return url;
    }
  }
  return null;
}

window.addEventListener("unhandledrejection", (ev) => {
  console.error("Unhandled promise rejection:", ev.reason);
});

function resolveBaseUrl() {
  if (typeof import.meta !== "undefined" && import.meta && import.meta.env) {
    const value = import.meta.env.BASE_URL;
    if (typeof value === "string" && value.length > 0) {
      return value.endsWith("/") ? value : `${value}/`;
    }
  }
  return "/";
}

const BASE_URL = resolveBaseUrl();

function configureRendererShadows(renderer) {
  if (!renderer) return;

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  if (renderer.shadowMap) {
    renderer.shadowMap.autoUpdate = true;
    renderer.shadowMap.needsUpdate = true;
  }
}

// Creates a helper that converts elapsed seconds into the current time-of-day phase.
// The default 20 minute day slows the cycle so lighting transitions linger longer.
function startTimeOfDayCycle(options = {}) {
  const minutesPerDayRaw = options.minutesPerDay ?? 20;
  const minutesPerDay = Number.isFinite(minutesPerDayRaw)
    ? Math.max(0, minutesPerDayRaw)
    : 0;
  const secondsPerDay = minutesPerDay * 60;

  return {
    secondsPerDay,
    phaseAt(elapsedSeconds = 0) {
      if (!Number.isFinite(elapsedSeconds) || secondsPerDay <= 0) {
        return 0;
      }
      const wrapped = ((elapsedSeconds % secondsPerDay) + secondsPerDay) % secondsPerDay;
      return wrapped / secondsPerDay;
    },
  };
}

async function mainApp() {
  console.log("🔧 Athens mainApp start");
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  configureRendererShadows(renderer);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  // Mount the exposure control (F9 toggles visibility)
  mountExposureSlider(renderer, { min: 0.2, max: 2.0, step: 0.01, key: "F9" });
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

  // Generate a dynamic terrain mesh so the world has rolling hills instead of
  // a perfectly flat plane. We'll pass the mesh to the character so it can
  // query ground height during its update loop.
  const terrain = createTerrain(scene);
  const ocean = await createOcean(scene, {
    size: 800,
    position: HARBOR_CENTER_3D.clone(),
  });
  const harbor = createHarbor(scene, { center: HARBOR_CENTER_3D });
  const city = createCity(scene, terrain, {
    origin: CITY_CHUNK_CENTER,
  });

  // Lay out a formal civic district with a central promenade, symmetrical
  // civic buildings, and decorative lighting to give the city a planned
  // character rather than scattered props.
  const civicDistrict = createCivicDistrict(scene, {
    plazaLength: 90,
    promenadeWidth: 16,
    greensWidth: 9,
  });

  const input = new InputMap(renderer.domElement);
  const envCollider = new EnvironmentCollider();
  scene.add(envCollider.mesh);
  const player = new PlayerController(input, envCollider, { camera });
  scene.add(player.object);
  player.object.position.set(0, 0, 10); // or your desired coordinates

  // Refresh the environment collider after major static additions like the
  // civic district so promenade geometry participates in collision checks.
  envCollider.refresh();

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

  envCollider.refresh();

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
  const heroPath = `${BASE_URL}models/character/hero.glb`;
  const bundledHeroPath = `${BASE_URL}models/character/${encodeURIComponent(
    "Hooded Adventurer.glb"
  )}`;
  const attachFallbackAvatar = () => {
    const fallbackAvatar = createFallbackAvatar();
    player.object.add(fallbackAvatar);
    fallbackAvatar.position.set(0, 0, 0);
  };

  const heroAssetUrl = await resolveFirstAvailableAsset([
    heroPath,
    bundledHeroPath,
  ]);

  if (heroAssetUrl) {
    if (heroAssetUrl !== heroPath) {
      console.info(
        `Hero GLB not found at ${heroPath}; using bundled sample avatar.`
      );
    }
    try {
      await character.load(heroAssetUrl, renderer);
      player.attachCharacter(character);
    } catch (error) {
      console.error(
        `⚠️ Unable to fetch hero GLB from "${heroAssetUrl}". mainApp will continue with a placeholder avatar.`,
        error
      );
      attachFallbackAvatar();
    }
  } else {
    console.info(`Hero GLB not found at ${heroPath}; using placeholder avatar.`);
    console.info(`Add your own hero model at ${heroPath}.`);
    attachFallbackAvatar();
  }

  const buildingMgr = new BuildingManager(envCollider);
  const npcUpdaters = [];
  if (civicDistrict.walkingLoop) {
    const crowd = spawnCitizenCrowd(scene, civicDistrict.walkingLoop, {
      count: 8,
      minSpeed: 0.7,
      maxSpeed: 1.4,
    });
    npcUpdaters.push(...crowd.updaters);
  }
  const spawnPlaceholderMonument = (options = {}) => {
    const placeholder = new THREE.Group();
    placeholder.name = "PlaceholderMonument";

    const shouldCollide = Boolean(options.collision);
    const applySharedProps = (mesh) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.noCollision = !shouldCollide;
    };

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(4.2, 4.6, 1, 36),
      new THREE.MeshStandardMaterial({ color: 0xe0d6c5, roughness: 0.7 })
    );
    base.position.y = 0.5;
    applySharedProps(base);
    placeholder.add(base);

    const columnGeometry = new THREE.CylinderGeometry(0.45, 0.5, 4.5, 20);
    const columnMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4c2a3,
      roughness: 0.55,
      metalness: 0.05,
    });
    for (let i = 0; i < 6; i++) {
      const column = new THREE.Mesh(columnGeometry, columnMaterial);
      const angle = (i / 6) * Math.PI * 2;
      column.position.set(Math.cos(angle) * 2.9, 2.75, Math.sin(angle) * 2.9);
      applySharedProps(column);
      placeholder.add(column);
    }

    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(3.8, 4, 0.6, 36),
      new THREE.MeshStandardMaterial({ color: 0xe8dcc7, roughness: 0.6 })
    );
    cap.position.y = 5.05;
    applySharedProps(cap);
    placeholder.add(cap);

    const statue = new THREE.Mesh(
      new THREE.ConeGeometry(1.1, 2.4, 24),
      new THREE.MeshStandardMaterial({ color: 0xc9b48a, roughness: 0.4 })
    );
    statue.position.y = 6.5;
    statue.castShadow = true;
    statue.receiveShadow = true;
    statue.userData.noCollision = true;
    placeholder.add(statue);

    if (options.position) {
      placeholder.position.copy(options.position);
    }
    if (typeof options.rotateY === "number") {
      placeholder.rotation.y = options.rotateY;
    }
    if (options.scale) {
      placeholder.scale.setScalar(options.scale);
    }

    scene.add(placeholder);

    if (shouldCollide) {
      envCollider.refresh();
    }

    return placeholder;
  };
  const tombOptions = {
    scale: 1.2,
    position: new THREE.Vector3(6, 0, -28),
    rotateY: Math.PI * 0.15,
    collision: true,
  };
  const buildingBase = `${BASE_URL}models/buildings/`;

  const tombPrimaryPath = `${buildingBase}aristotle-tomb.glb`;
  const tombBundledPath = `${buildingBase}aristotle-tomb.gltf`;
  const tombUrlCandidates = [tombPrimaryPath, tombBundledPath];
  const tombUrl = await resolveFirstAvailableAsset(tombUrlCandidates);
  const fallbackUrl = `${buildingBase}Akropol.glb`;
  const fallbackAvailable = await probeAsset(fallbackUrl);
  const loadFallbackMonument = async () => {
    if (fallbackAvailable) {
      try {
        await buildingMgr.loadBuilding(fallbackUrl, tombOptions);
        return;
      } catch (fallbackError) {
        console.error('Akropol fallback model also failed to load.', fallbackError);
      }
    } else {
      console.info(
        `Akropol fallback not bundled; add ${fallbackUrl} or run npm run download:aristotle.`
      );
    }

    spawnPlaceholderMonument(tombOptions);
  };

  if (tombUrl) {
    if (tombUrl !== tombUrlCandidates[0]) {
      console.info(
        `Aristotle's Tomb missing at ${tombPrimaryPath}; using bundled placeholder.`
      );
      console.info("Run npm run download:aristotle to install the premium asset.");
    }
    try {
      await buildingMgr.loadBuilding(tombUrl, tombOptions);
    } catch (error) {
      console.warn(
        "Aristotle's Tomb failed to load. Download it with npm run download:aristotle.",
        error
      );
      await loadFallbackMonument();
    }
  } else {
    console.info(
      `Aristotle's Tomb missing at ${tombPrimaryPath}; install it with npm run download:aristotle.`
    );
    await loadFallbackMonument();
  }

  const interactor = createInteractor(renderer, camera, scene);

  const clock = new THREE.Clock();
  // Slow the sun/moon orbit so each in-game day lasts 20 real minutes by default.
  const dayCycle = startTimeOfDayCycle();

  function animate() {
    requestAnimationFrame(animate);

    // Keep track of time for smooth animation and frame-independent movement.
    const deltaTime = clock.getDelta();
    const elapsed = clock.elapsedTime;
    const phase = dayCycle.phaseAt(elapsed);

    const theta = phase * Math.PI * 2;
    const sunDir = new THREE.Vector3(
      Math.cos(theta),
      Math.sin(theta),
      0
    );

    // Update sky dome, atmospheric lighting, and celestial bodies each frame.
    updateSky(skyObj, sunDir);
    updateLighting(lights, sunDir);
    updateHarborLighting(harbor, lights.nightFactor);
    updateCityLighting(city, lights.nightFactor);
    // Fade the stars in and out depending on the time of day.
    updateStars(stars, phase);
    updateMoon(moon, sunDir);

    // Dynamic terrain subtly sways, hinting at wind. Remove this call if you
    // prefer a static landscape without vertex animation.
    updateTerrain(terrain, elapsed);
    updateOcean(ocean, deltaTime, sunDir, lights.nightFactor);

    // Update player movement and drive the attached character animation.
    player.update(deltaTime);
    for (const updateNpc of npcUpdaters) updateNpc(deltaTime);

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
    if (event.button === 0) {
      interactor.useObject();
    }
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
