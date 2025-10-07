// main.js

import * as THREE from "three";
import { Soundscape } from "./audio/soundscape.js";
import { mountAudioMixer } from "./ui/audioMixer.js";
import { createSky, updateSky, createStars, updateStars } from "./world/sky.js";
import { createLighting, updateLighting, createMoon, updateMoon } from "./world/lighting.js";
import { createInteractor } from "./world/interactions.js";
import { attachCrosshair } from "./world/ui/crosshair.js";
import { createTerrain, updateTerrain } from "./world/terrain.js";
import { createOcean, updateOcean } from "./world/ocean.js";
import { createHarbor, updateHarborLighting } from "./world/harbor.js";
import { createMainHillRoad, updateMainHillRoadLighting } from "./world/roads_hillcity.js";
import { mountHillCityDebug } from "./world/debug_hillcity.js";
import { createPlazas } from "./world/plazas.js";
import { updateCityLighting, createHillCity } from "./world/city.js";
import {
  AGORA_CENTER_3D,
  HARBOR_CENTER_3D,
  CITY_AREA_RADIUS,
  ACROPOLIS_PEAK_3D,
  HARBOR_WATER_BOUNDS,
} from "./world/locations.js";
import { initializeAssetTranscoders } from "./world/landmarks.js";
import { createCivicDistrict } from "./world/cityPlan.js";
import { InputMap } from "./input/InputMap.js";
import { EnvironmentCollider } from "./env/EnvironmentCollider.js";
import { BuildingManager } from "./buildings/BuildingManager.js";
import { PlayerController } from "./controls/PlayerController.js";
import { Character } from "./characters/Character.js";
import { spawnCitizenCrowd } from "./world/npcs.js";
import { mountExposureSlider } from "./ui/exposureSlider.js";
import { mountHotkeyOverlay } from "./ui/hotkeyOverlay.js";
import { mountDevHUD } from "./ui/devHud.js";
import { createPin } from "./world/pins.js";
import { attachHeightSampler } from "./world/terrainHeight.js";
import { addDepthOccluderRibbon } from "./world/occluders.js";

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

const TRUE_VALUES = new Set(["", "1", "true", "on", "yes", "y"]);
const FALSE_VALUES = new Set(["0", "false", "off", "no", "n"]);

function parseToggleValue(value, defaultValue = true) {
  if (value == null) return defaultValue;
  const normalized = String(value).trim().toLowerCase();
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  return defaultValue;
}

function shouldShowOverlay({
  queryKey,
  windowFlagKey,
  defaultValue = true,
  devDefault = true,
} = {}) {
  if (typeof window === "undefined") return defaultValue;

  if (queryKey) {
    const params = new URLSearchParams(window.location.search);
    if (params.has(queryKey)) {
      return parseToggleValue(params.get(queryKey), defaultValue);
    }
  }

  if (windowFlagKey && typeof window[windowFlagKey] !== "undefined") {
    const flagValue = window[windowFlagKey];
    if (typeof flagValue === "boolean") return flagValue;
    return parseToggleValue(flagValue, defaultValue);
  }

  if (devDefault && import.meta.env?.DEV) {
    return true;
  }

  return defaultValue;
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
  // Enable local clipping so ocean clip planes work
  renderer.localClippingEnabled = true;

  configureRendererShadows(renderer);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  const shouldMountExposureSlider = (() => {
    if (typeof import.meta !== "undefined" && import.meta?.env) {
      if (typeof import.meta.env.DEV === "boolean") {
        return import.meta.env.DEV;
      }
    }
    return true;
  })();

  if (shouldMountExposureSlider) {
    // Mount the exposure control (F9 toggles visibility)
    mountExposureSlider(renderer, { min: 0.2, max: 2.0, step: 0.01, key: "F9" });
  }
  initializeAssetTranscoders(renderer);
  attachCrosshair();
  mountHotkeyOverlay({ toggleKey: "KeyH" });

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

  const timeOfDayDisplay = document.createElement("div");
  Object.assign(timeOfDayDisplay.style, {
    position: "fixed",
    right: "16px",
    bottom: "16px",
    padding: "6px 10px",
    borderRadius: "6px",
    background: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    fontFamily: "sans-serif",
    fontSize: "14px",
    letterSpacing: "0.05em",
    pointerEvents: "none",
    textTransform: "uppercase",
  });
  document.body.appendChild(timeOfDayDisplay);

  function formatPhaseAsTime(phaseValue = 0) {
    const totalMinutes = Math.max(0, Math.min(1, phaseValue)) * 24 * 60;
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  let lastDisplayedTime = "";

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
  // ---- Living City Soundscape ----
  const soundscape = new Soundscape(
    scene,
    camera,
    { getNightFactor: () => lights.nightFactor },
    {
      harbor: HARBOR_CENTER_3D,
      agora: AGORA_CENTER_3D,
      acropolis: ACROPOLIS_PEAK_3D,
    }
  );
  await soundscape.initFromManifest("audio/manifest.json");
  await soundscape.ensureUserGestureResume();

  // Volume mixer overlay (F10 toggles visibility)
  const SHOW_AUDIO_MIXER = shouldShowOverlay({
    queryKey: "audio",
    windowFlagKey: "SHOW_AUDIO_MIXER",
  });
  if (SHOW_AUDIO_MIXER) {
    mountAudioMixer(soundscape);
  }

  // Create a star field with 1000 tiny points so nights feel alive.
  const stars = createStars(scene, 1000);
  const moon = createMoon(scene);

  // Generate a dynamic terrain mesh so the world has rolling hills instead of
  // a perfectly flat plane. We'll pass the mesh to the character so it can
  // query ground height during its update loop.
  const terrain = createTerrain(scene);
  attachHeightSampler(terrain);
  // Add an occluder ribbon along the troublesome band the user reported.
  // The user provided two endpoints in X,Z. We interpret them as:
  //   P1 = (-0.4, -0.3)
  //   P2 = (-95.7, -3.1)
  // If those were meant as slightly different values, we can adjust later.
  const P1 = new THREE.Vector2(-0.4, -0.3);
  const P2 = new THREE.Vector2(-95.7, -3.1);

  // Width 6m; increase if needed (e.g., 8–10) to fully cover the area.
  addDepthOccluderRibbon(scene, terrain, P1, P2, 6 /* width */, 140 /* segments */);
  const ocean = await createOcean(scene, { bounds: HARBOR_WATER_BOUNDS });
  const harbor = createHarbor(scene, { center: HARBOR_CENTER_3D });
  const envCollider = new EnvironmentCollider();
  scene.add(envCollider.mesh);

  // Roads first (needs terrain sampler)
  const { group: roadGroup, curve: mainRoad } = createMainHillRoad(scene, terrain);
  if (import.meta.env?.DEV) {
    mountHillCityDebug(scene, mainRoad);
  }

  // Plazas (agora + acropolis terraces)
  createPlazas(scene);

  // Hill-city buildings (uses terrain sampler + road curve)
  const hillCity = createHillCity(scene, terrain, mainRoad, {
    seed: 42,
    buildingCount: 140,
  });

  // Rebuild the static environment collider once after placing roads, plazas,
  // and the hill city so the player can't walk through them.
  envCollider.fromStaticScene(scene);

  // Lay out a formal civic district with a central promenade, symmetrical
  // civic buildings, and decorative lighting to give the city a planned
  // character rather than scattered props.
  const civicDistrict = createCivicDistrict(scene, {
    plazaLength: 90,
    promenadeWidth: 16,
    greensWidth: 9,
    center: AGORA_CENTER_3D,
    terrain,
  });

  const input = new InputMap(renderer.domElement);
  const player = new PlayerController(input, envCollider, { camera });
  scene.add(player.object);
  player.object.position.set(0, 0, 10); // or your desired coordinates

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
      terrain,
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

    const adjustColor = (hex, amount = 0) => {
      const color = new THREE.Color(hex);
      if (amount > 0) {
        color.lerp(new THREE.Color(0xffffff), Math.min(1, amount));
      } else if (amount < 0) {
        color.lerp(new THREE.Color(0x000000), Math.min(1, Math.abs(amount)));
      }
      return `#${color.getHexString()}`;
    };

    const colorToRgba = (hex, alpha = 1) => {
      const color = new THREE.Color(hex);
      const r = Math.round(color.r * 255);
      const g = Math.round(color.g * 255);
      const b = Math.round(color.b * 255);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const createMarbleTextures = ({
      tint,
      veinColor,
      speckColor,
      size = 256,
      veinCount = 18,
      repeat = new THREE.Vector2(2.5, 2.5),
    }) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d");
      const baseGradient = ctx.createLinearGradient(0, 0, size, size);
      baseGradient.addColorStop(0, adjustColor(tint, 0.18));
      baseGradient.addColorStop(0.5, adjustColor(tint, -0.05));
      baseGradient.addColorStop(1, adjustColor(tint, 0.1));
      ctx.fillStyle = baseGradient;
      ctx.fillRect(0, 0, size, size);

      ctx.lineWidth = 1.6;
      ctx.strokeStyle = colorToRgba(veinColor, 0.32);
      ctx.globalAlpha = 0.85;
      for (let i = 0; i < veinCount; i++) {
        const startX = Math.random() * size;
        const cp1x = startX + (Math.random() - 0.5) * size * 0.25;
        const cp2x = startX + (Math.random() - 0.5) * size * 0.35;
        ctx.beginPath();
        ctx.moveTo(startX, 0);
        ctx.bezierCurveTo(cp1x, size * 0.3, cp2x, size * 0.7, startX + (Math.random() - 0.5) * size * 0.2, size);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      ctx.fillStyle = colorToRgba(speckColor, 0.06);
      for (let i = 0; i < size * 2; i++) {
        const radius = Math.random() * 1.4 + 0.2;
        ctx.beginPath();
        ctx.arc(Math.random() * size, Math.random() * size, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      const colorTexture = new THREE.CanvasTexture(canvas);
      colorTexture.wrapS = THREE.RepeatWrapping;
      colorTexture.wrapT = THREE.RepeatWrapping;
      colorTexture.repeat.copy(repeat);
      colorTexture.colorSpace = THREE.SRGBColorSpace;

      const roughCanvas = document.createElement("canvas");
      roughCanvas.width = roughCanvas.height = size;
      const roughCtx = roughCanvas.getContext("2d");
      const roughData = roughCtx.createImageData(size, size);
      for (let i = 0; i < size * size; i++) {
        const random = 170 + Math.random() * 60;
        const idx = i * 4;
        roughData.data[idx] = random;
        roughData.data[idx + 1] = random;
        roughData.data[idx + 2] = random;
        roughData.data[idx + 3] = 255;
      }
      roughCtx.putImageData(roughData, 0, 0);
      const roughnessTexture = new THREE.CanvasTexture(roughCanvas);
      roughnessTexture.wrapS = THREE.RepeatWrapping;
      roughnessTexture.wrapT = THREE.RepeatWrapping;
      roughnessTexture.repeat.copy(repeat);
      roughnessTexture.colorSpace = THREE.NoColorSpace;

      const anisotropy = renderer?.capabilities?.getMaxAnisotropy?.() ?? 1;
      colorTexture.anisotropy = anisotropy;
      roughnessTexture.anisotropy = anisotropy;

      return { map: colorTexture, roughnessMap: roughnessTexture };
    };

    const createMonumentMaterials = () => {
      const stoneTint = 0xded6c6;
      const baseTextures = createMarbleTextures({
        tint: stoneTint,
        veinColor: 0xb9b0a0,
        speckColor: 0x7d7464,
        repeat: new THREE.Vector2(2.8, 2.8),
      });

      const baseMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xffffff),
        map: baseTextures.map,
        roughness: 0.42,
        metalness: 0.08,
        roughnessMap: baseTextures.roughnessMap,
        envMapIntensity: 0.9,
      });

      const trimMaterial = baseMaterial.clone();
      trimMaterial.color = new THREE.Color(0xd4c9b7);
      trimMaterial.roughness = 0.38;
      trimMaterial.envMapIntensity = 0.85;

      const insetMaterial = baseMaterial.clone();
      insetMaterial.color = new THREE.Color(0xc3b59e);
      insetMaterial.roughness = 0.35;

      const statueMaterial = new THREE.MeshStandardMaterial({
        color: 0xc9b48a,
        roughness: 0.32,
        metalness: 0.18,
        envMapIntensity: 1.1,
      });

      return { baseMaterial, trimMaterial, insetMaterial, statueMaterial };
    };

    const { baseMaterial, trimMaterial, insetMaterial, statueMaterial } =
      createMonumentMaterials();

    let currentHeight = 0;
    const stepDefinitions = [
      { radiusTop: 5.4, radiusBottom: 5.8, height: 0.34 },
      { radiusTop: 5.0, radiusBottom: 5.3, height: 0.28 },
      { radiusTop: 4.6, radiusBottom: 5.0, height: 0.26 },
    ];

    for (const step of stepDefinitions) {
      const geometry = new THREE.CylinderGeometry(
        step.radiusTop,
        step.radiusBottom,
        step.height,
        64
      );
      const mesh = new THREE.Mesh(geometry, baseMaterial);
      currentHeight += step.height / 2;
      mesh.position.y = currentHeight;
      currentHeight += step.height / 2;
      applySharedProps(mesh);
      placeholder.add(mesh);
    }

    const daisHeight = 1.2;
    const dais = new THREE.Mesh(
      new THREE.CylinderGeometry(3.9, 4.2, daisHeight, 64),
      baseMaterial
    );
    dais.position.y = currentHeight + daisHeight / 2;
    currentHeight += daisHeight;
    applySharedProps(dais);
    placeholder.add(dais);

    const daisTrim = new THREE.Mesh(
      new THREE.TorusGeometry(3.9, 0.1, 24, 96),
      trimMaterial
    );
    daisTrim.rotation.x = Math.PI / 2;
    daisTrim.position.y = dais.position.y + daisHeight / 2 - 0.08;
    applySharedProps(daisTrim);
    placeholder.add(daisTrim);

    const plinthHeight = 0.6;
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(3.6, 3.7, plinthHeight, 48),
      insetMaterial
    );
    plinth.position.y = currentHeight + plinthHeight / 2;
    currentHeight += plinthHeight;
    applySharedProps(plinth);
    placeholder.add(plinth);

    const friezeMaterial = trimMaterial.clone();
    friezeMaterial.side = THREE.DoubleSide;
    const frieze = new THREE.Mesh(
      new THREE.CylinderGeometry(3.45, 3.55, 0.4, 64, 1, true),
      friezeMaterial
    );
    frieze.position.y = plinth.position.y + plinthHeight / 2 - 0.2;
    applySharedProps(frieze);
    placeholder.add(frieze);

    const reliefBand = new THREE.Mesh(
      new THREE.CylinderGeometry(3.3, 3.35, 0.18, 64),
      insetMaterial
    );
    reliefBand.position.y = plinth.position.y + plinthHeight / 2 + 0.1;
    applySharedProps(reliefBand);
    placeholder.add(reliefBand);

    const columnBaseHeight = 0.4;
    const columnBase = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.3, columnBaseHeight, 48),
      baseMaterial
    );
    columnBase.position.y = currentHeight + columnBaseHeight / 2;
    currentHeight += columnBaseHeight;
    applySharedProps(columnBase);
    placeholder.add(columnBase);

    const columnGeometry = new THREE.CylinderGeometry(0.52, 0.58, 4.6, 36, 1, false);
    columnGeometry.computeVertexNormals();
    const columnMaterial = baseMaterial.clone();
    columnMaterial.roughness = 0.36;
    columnMaterial.envMapIntensity = 1.05;

    const columnCapGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.25, 32);
    const columnBaseGeometry = new THREE.CylinderGeometry(0.68, 0.68, 0.2, 32);
    const columnCount = 8;
    const columnRadius = 2.65;
    for (let i = 0; i < columnCount; i++) {
      const angle = (i / columnCount) * Math.PI * 2;
      const columnGroup = new THREE.Group();

      const column = new THREE.Mesh(columnGeometry, columnMaterial);
      column.position.y = currentHeight + 2.3;
      applySharedProps(column);
      columnGroup.add(column);

      const baseCap = new THREE.Mesh(columnBaseGeometry, trimMaterial);
      baseCap.position.y = currentHeight + 0.1;
      applySharedProps(baseCap);
      columnGroup.add(baseCap);

      const topCap = new THREE.Mesh(columnCapGeometry, trimMaterial);
      topCap.position.y = currentHeight + 4.5;
      applySharedProps(topCap);
      columnGroup.add(topCap);

      columnGroup.position.set(
        Math.cos(angle) * columnRadius,
        0,
        Math.sin(angle) * columnRadius
      );

      applySharedProps(columnGroup);
      placeholder.add(columnGroup);
    }

    currentHeight += 4.6;

    const entablatureHeight = 0.7;
    const entablature = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.25, entablatureHeight, 48),
      trimMaterial
    );
    entablature.position.y = currentHeight + entablatureHeight / 2;
    applySharedProps(entablature);
    placeholder.add(entablature);
    currentHeight += entablatureHeight;

    const cornice = new THREE.Mesh(
      new THREE.CylinderGeometry(3.05, 3.2, 0.5, 64),
      baseMaterial
    );
    cornice.position.y = currentHeight + 0.25;
    applySharedProps(cornice);
    placeholder.add(cornice);
    currentHeight += 0.5;

    const capLower = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.1, 0.45, 64),
      trimMaterial
    );
    capLower.position.y = currentHeight + 0.225;
    applySharedProps(capLower);
    placeholder.add(capLower);
    currentHeight += 0.45;

    const capUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(2.7, 3.4, 0.4, 64),
      baseMaterial
    );
    capUpper.position.y = currentHeight + 0.2;
    applySharedProps(capUpper);
    placeholder.add(capUpper);
    currentHeight += 0.4;

    const capMedallion = new THREE.Mesh(
      new THREE.CircleGeometry(2.1, 48),
      insetMaterial
    );
    capMedallion.rotation.x = -Math.PI / 2;
    capMedallion.position.y = currentHeight + 0.01;
    applySharedProps(capMedallion);
    placeholder.add(capMedallion);

    const capTorus = new THREE.Mesh(
      new THREE.TorusGeometry(2.6, 0.08, 24, 96),
      trimMaterial
    );
    capTorus.rotation.x = Math.PI / 2;
    capTorus.position.y = currentHeight;
    applySharedProps(capTorus);
    placeholder.add(capTorus);

    const statuePedestalHeight = 0.9;
    const statuePedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(1.25, 1.6, statuePedestalHeight, 48),
      baseMaterial
    );
    statuePedestal.position.y = currentHeight + statuePedestalHeight / 2 + 0.1;
    applySharedProps(statuePedestal);
    placeholder.add(statuePedestal);

    currentHeight += statuePedestalHeight + 0.2;

    const statue = new THREE.Mesh(
      new THREE.ConeGeometry(1.05, 2.5, 6, 1, false),
      statueMaterial
    );
    statue.position.y = currentHeight + 1.25;
    statue.castShadow = true;
    statue.receiveShadow = true;
    statue.userData.noCollision = true;
    placeholder.add(statue);

    const statueCrown = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 24, 18),
      trimMaterial
    );
    statueCrown.position.y = statue.position.y + 1.5;
    applySharedProps(statueCrown);
    statueCrown.userData.noCollision = true;
    placeholder.add(statueCrown);

    const occlusionRing = new THREE.Mesh(
      new THREE.RingGeometry(3.2, 5.6, 64),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.14,
        side: THREE.DoubleSide,
      })
    );
    occlusionRing.rotation.x = -Math.PI / 2;
    occlusionRing.position.y = 0.02;
    occlusionRing.castShadow = false;
    occlusionRing.receiveShadow = false;
    occlusionRing.material.depthWrite = false;
    occlusionRing.renderOrder = 1;
    occlusionRing.userData.noCollision = true;
    placeholder.add(occlusionRing);

    const monumentKeyLight = new THREE.SpotLight(0xffedd2, 1.25, 40, Math.PI / 5, 0.4, 1.2);
    monumentKeyLight.position.set(6, 10, 6);
    monumentKeyLight.castShadow = true;
    monumentKeyLight.shadow.mapSize.set(1024, 1024);
    monumentKeyLight.shadow.bias = -0.0006;
    monumentKeyLight.userData.noCollision = true;
    placeholder.add(monumentKeyLight);
    const keyTarget = new THREE.Object3D();
    keyTarget.position.set(0, 4, 0);
    keyTarget.userData.noCollision = true;
    placeholder.add(keyTarget);
    monumentKeyLight.target = keyTarget;

    const monumentFillLight = new THREE.PointLight(0xc5d6ff, 0.38, 18, 1.6);
    monumentFillLight.position.set(-4, 6.8, -3);
    monumentFillLight.castShadow = false;
    monumentFillLight.userData.noCollision = true;
    placeholder.add(monumentFillLight);

    const monumentAccentLight = new THREE.PointLight(0xfff6db, 0.62, 16, 1.4);
    monumentAccentLight.position.set(0, 7.6, 0);
    monumentAccentLight.castShadow = true;
    monumentAccentLight.shadow.mapSize.set(512, 512);
    monumentAccentLight.shadow.bias = -0.0007;
    monumentAccentLight.userData.noCollision = true;
    placeholder.add(monumentAccentLight);

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
    updateCityLighting(hillCity, lights.nightFactor);
    updateMainHillRoadLighting(roadGroup, lights.nightFactor);
    // Fade the stars in and out depending on the time of day.
    updateStars(stars, phase);
    updateMoon(moon, sunDir);

    // Dynamic terrain subtly sways, hinting at wind. Remove this call if you
    // prefer a static landscape without vertex animation.
    updateTerrain(terrain, elapsed);
    updateOcean(ocean, deltaTime, sunDir, lights.nightFactor);

    // Update soundscape once per frame (player position optional)
    soundscape.update(player?.position);

    // Update player movement and drive the attached character animation.
    player.update(deltaTime);
    for (const updateNpc of npcUpdaters) updateNpc(deltaTime);

    // Cast a ray through the center of the screen to detect hovered objects and
    // highlight anything marked as interactable via userData.
    const hovered = interactor.updateHover();
    interactPrompt.style.opacity = hovered ? "1" : "0";

    const formattedTime = formatPhaseAsTime(phase);
    if (formattedTime !== lastDisplayedTime) {
      timeOfDayDisplay.textContent = `Time: ${formattedTime}`;
      lastDisplayedTime = formattedTime;
    }

    renderer.render(scene, camera);
  }

  animate();

  // Utility getters for HUD
  const getPosition = () => {
    try {
      if (player && player.position && Number.isFinite(player.position.x)) {
        return player.position;
      }
    } catch {}
    return camera?.position ?? { x: 0, y: 0, z: 0 };
  };
  const getDirection = () => {
    try {
      const v = new THREE.Vector3(0, 0, -1);
      v.applyQuaternion(camera.quaternion);
      v.y = 0; // flatten to ground plane for compass
      v.normalize();
      return v;
    } catch {
      return { x: 0, y: 0, z: 1 };
    }
  };

  // Optional: drop a 3D pin with "P"
  const onPin = (p) => {
    const pin = createPin(scene, p);
    // auto-lift pin to ground if sampler exists
    const y = terrain?.userData?.getHeightAt?.(p.x, p.z);
    if (Number.isFinite(y)) pin.position.y = y;
  };

  // Mount HUD in dev OR if a global flag is set (useful in prod previews)
  const SHOW_HUD = shouldShowOverlay({
    queryKey: "hud",
    windowFlagKey: "SHOW_HUD",
  });
  if (SHOW_HUD) {
    console.log("[HUD] mounting…");
    mountDevHUD({ getPosition, getDirection, onPin });
  }

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
