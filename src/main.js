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
  SEA_LEVEL_Y,
} from "./world/locations.js";
import {
  initializeAssetTranscoders,
  loadLandmark,
  disposeLandmarks,
} from "./world/landmarks.js";
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
import { snapAboveGround } from "./world/ground.js";

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

function getImportMeta() {
  try {
    return import.meta;
  } catch (error) {
    console.debug("import.meta is not available in this environment", error);
    return undefined;
  }
}

function ensureTrailingSlash(value) {
  if (typeof value !== "string" || value.length === 0) return value;
  return value.endsWith("/") ? value : `${value}/`;
}

function deriveBundledBaseUrl() {
  const importMeta = getImportMeta();
  if (!importMeta || typeof importMeta.url !== "string") {
    return null;
  }

  try {
    const bundleUrl = new URL(importMeta.url);
    const { pathname } = bundleUrl;
    const assetsIndex = pathname.lastIndexOf("/assets/");
    if (assetsIndex >= 0) {
      const basePath = pathname.slice(0, assetsIndex + 1);
      return ensureTrailingSlash(basePath);
    }
  } catch (error) {
    console.debug("Failed to derive bundled base URL from import.meta.url", error);
  }

  return null;
}

function resolveBaseUrl() {
  const importMeta = getImportMeta();
  const envBase = importMeta && importMeta.env ? importMeta.env.BASE_URL : undefined;
  if (typeof envBase === "string" && envBase.length > 0 && envBase !== "/") {
    return ensureTrailingSlash(envBase);
  }

  const bundledBase = deriveBundledBaseUrl();
  if (bundledBase) {
    return bundledBase;
  }

  if (typeof envBase === "string" && envBase.length > 0) {
    return ensureTrailingSlash(envBase);
  }

  if (typeof window !== "undefined" && typeof window.location?.pathname === "string") {
    const { pathname } = window.location;
    if (pathname && pathname !== "") {
      const lastSlash = pathname.lastIndexOf("/");
      if (lastSlash >= 0) {
        return ensureTrailingSlash(pathname.slice(0, lastSlash + 1));
      }
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

function hashNoise(x, y, seed = 0) {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

function smoothNoise(x, y, seed = 0) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const xf = x - x0;
  const yf = y - y0;

  const n00 = hashNoise(x0, y0, seed);
  const n10 = hashNoise(x0 + 1, y0, seed);
  const n01 = hashNoise(x0, y0 + 1, seed);
  const n11 = hashNoise(x0 + 1, y0 + 1, seed);

  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);

  const nx0 = THREE.MathUtils.lerp(n00, n10, u);
  const nx1 = THREE.MathUtils.lerp(n01, n11, u);
  return THREE.MathUtils.lerp(nx0, nx1, v);
}

function fbm(x, y, { seed = 0, octaves = 5, persistence = 0.5, lacunarity = 2 } = {}) {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;

  for (let i = 0; i < octaves; i += 1) {
    value += amplitude * smoothNoise(x * frequency, y * frequency, seed + i * 19.19);
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return value;
}

let cachedMonumentTextures = null;

function createSolidDataTexture(color, { colorSpace = THREE.SRGBColorSpace } = {}) {
  const data = new Uint8Array(4);
  data[0] = (color >> 16) & 0xff;
  data[1] = (color >> 8) & 0xff;
  data[2] = color & 0xff;
  data[3] = 0xff;
  const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  texture.colorSpace = colorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.needsUpdate = true;
  return texture;
}

function createProceduralMarbleTextures() {
  if (cachedMonumentTextures) {
    return cachedMonumentTextures;
  }

  if (typeof document === "undefined" || !document.createElement) {
    cachedMonumentTextures = {
      map: createSolidDataTexture(0xefecea, { colorSpace: THREE.SRGBColorSpace }),
      normalMap: createSolidDataTexture(0x8080ff, { colorSpace: THREE.LinearSRGBColorSpace }),
      roughnessMap: createSolidDataTexture(0xb3b3b3, {
        colorSpace: THREE.LinearSRGBColorSpace,
      }),
      aoMap: createSolidDataTexture(0xe0e0e0, { colorSpace: THREE.LinearSRGBColorSpace }),
    };
    return cachedMonumentTextures;
  }

  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const colorData = ctx.createImageData(size, size);
  const roughnessData = ctx.createImageData(size, size);
  const aoData = ctx.createImageData(size, size);
  const normalData = ctx.createImageData(size, size);
  const heights = new Float32Array(size * size);

  const baseScale = 6;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const idx = (y * size + x) * 4;
      const nx = (x / size) * baseScale;
      const ny = (y / size) * baseScale;

      const structure = fbm(nx * 0.85, ny * 0.9, { seed: 11, octaves: 4 });
      const turbulence = fbm(nx * 2.3, ny * 2.4, {
        seed: 37,
        octaves: 5,
        persistence: 0.55,
        lacunarity: 2.15,
      });
      const swirl = nx * 1.12 + ny * 1.27 + turbulence * 4.2;
      const wave = Math.sin(swirl + structure * 2.6);
      const fineDetail = fbm(nx * 5.2, ny * 5.4, {
        seed: 73,
        octaves: 3,
        persistence: 0.6,
        lacunarity: 2.8,
      });
      const height = 0.5 + 0.5 * wave * 0.8 + fineDetail * 0.2;
      const veins = Math.pow(Math.abs(Math.sin(swirl * 0.6 + fineDetail * 3.4)), 1.4);

      heights[y * size + x] = height;

      const warmTint = 0.04 + structure * 0.03;
      const baseTone = THREE.MathUtils.clamp(0.78 + height * 0.18 + structure * 0.05, 0, 1);
      let r = baseTone + warmTint;
      let g = baseTone + warmTint * 0.6;
      let b = baseTone + warmTint * 0.2;
      r = THREE.MathUtils.clamp(r - veins * 0.09, 0, 1);
      g = THREE.MathUtils.clamp(g - veins * 0.07, 0, 1);
      b = THREE.MathUtils.clamp(b - veins * 0.05, 0, 1);

      colorData.data[idx + 0] = Math.round(r * 255);
      colorData.data[idx + 1] = Math.round(g * 255);
      colorData.data[idx + 2] = Math.round(b * 255);
      colorData.data[idx + 3] = 255;

      const rough = THREE.MathUtils.clamp(0.42 + veins * 0.32 + fineDetail * 0.12, 0.18, 0.88);
      const roughByte = Math.round(rough * 255);
      roughnessData.data[idx + 0] = roughByte;
      roughnessData.data[idx + 1] = roughByte;
      roughnessData.data[idx + 2] = roughByte;
      roughnessData.data[idx + 3] = 255;

      const ao = THREE.MathUtils.clamp(0.93 - veins * 0.35 - fineDetail * 0.18, 0.45, 1);
      const aoByte = Math.round(ao * 255);
      aoData.data[idx + 0] = aoByte;
      aoData.data[idx + 1] = aoByte;
      aoData.data[idx + 2] = aoByte;
      aoData.data[idx + 3] = 255;
    }
  }

  const sampleHeight = (x, y) => {
    const sx = (x + size) % size;
    const sy = (y + size) % size;
    return heights[sy * size + sx];
  };

  const normalStrength = 2.1;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const idx = (y * size + x) * 4;
      const heightL = sampleHeight(x - 1, y);
      const heightR = sampleHeight(x + 1, y);
      const heightD = sampleHeight(x, y - 1);
      const heightU = sampleHeight(x, y + 1);

      const dx = (heightR - heightL) * normalStrength;
      const dy = (heightU - heightD) * normalStrength;
      const dz = 1;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      const nx = dx / len;
      const ny = dy / len;
      const nz = dz / len;

      normalData.data[idx + 0] = Math.round((nx * 0.5 + 0.5) * 255);
      normalData.data[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      normalData.data[idx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      normalData.data[idx + 3] = 255;
    }
  }

  const createTextureFromImageData = (imageData, { colorSpace }) => {
    const texCanvas = document.createElement("canvas");
    texCanvas.width = size;
    texCanvas.height = size;
    const texCtx = texCanvas.getContext("2d");
    texCtx.putImageData(imageData, 0, 0);
    const texture = new THREE.CanvasTexture(texCanvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    texture.anisotropy = 4;
    texture.colorSpace = colorSpace;
    texture.needsUpdate = true;
    return texture;
  };

  cachedMonumentTextures = {
    map: createTextureFromImageData(colorData, { colorSpace: THREE.SRGBColorSpace }),
    normalMap: createTextureFromImageData(normalData, {
      colorSpace: THREE.LinearSRGBColorSpace,
    }),
    roughnessMap: createTextureFromImageData(roughnessData, {
      colorSpace: THREE.LinearSRGBColorSpace,
    }),
    aoMap: createTextureFromImageData(aoData, { colorSpace: THREE.LinearSRGBColorSpace }),
  };

  return cachedMonumentTextures;
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

  const disposeMaterial = (material) => {
    if (!material) return;
    const materials = Array.isArray(material) ? material : [material];
    for (const mat of materials) {
      if (!mat) continue;
      for (const value of Object.values(mat)) {
        if (value && value.isTexture && typeof value.dispose === "function") {
          value.dispose();
        }
      }
      if (typeof mat.dispose === "function") {
        mat.dispose();
      }
    }
  };

  const disposeObject = (object) => {
    if (!object) return;
    object.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry && typeof child.geometry.dispose === "function") {
          child.geometry.dispose();
        }
        disposeMaterial(child.material);
      }
    });
  };

  const removeExistingAvatar = () => {
    if (player.character) {
      disposeObject(player.character);
      player.object.remove(player.character);
      player.character = undefined;
    }

    const fallbackAvatar = player.object.children.find(
      (child) => child.name === "FallbackAvatar"
    );
    if (fallbackAvatar) {
      disposeObject(fallbackAvatar);
      player.object.remove(fallbackAvatar);
    }
  };

  const character = new Character();
  const heroPath = `${BASE_URL}models/character/hero.glb`;
  const bundledHeroPath = `${BASE_URL}models/character/${encodeURIComponent(
    "Hooded Adventurer.glb"
  )}`;
  const attachFallbackAvatar = () => {
    removeExistingAvatar();
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
      removeExistingAvatar();
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
  const terrainHeightSampler = terrain?.userData?.getHeightAt;

  scene.userData = scene.userData || {};
  if (!scene.userData.terrain) {
    scene.userData.terrain = terrain;
  }
  if (typeof terrainHeightSampler === "function") {
    scene.userData.terrainHeightSampler = terrainHeightSampler;
    if (typeof scene.userData.getHeightAt !== "function") {
      scene.userData.getHeightAt = terrainHeightSampler;
    }
  }

  buildingMgr.clearBuildings();

  disposeLandmarks();

  const buildingsRoot = new THREE.Group();
  buildingsRoot.name = "BuildingsRoot";
  scene.add(buildingsRoot);
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
    const {
      baseRadius = 2.6,
      columnHeight = 4.8,
      capHeight = 0.9,
      textures: textureOverrides = {},
    } = options;

    const monument = new THREE.Group();
    monument.name = "PlaceholderMonument";

    const shouldCollide = Boolean(options.collision);
    monument.userData.noCollision = !shouldCollide;

    const applySharedProps = (mesh, { collidable = shouldCollide } = {}) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.noCollision = !collidable;
    };

    const generatedTextures = createProceduralMarbleTextures();
    const textures = {
      map: textureOverrides.map ?? generatedTextures.map,
      normalMap: textureOverrides.normalMap ?? generatedTextures.normalMap,
      roughnessMap: textureOverrides.roughnessMap ?? generatedTextures.roughnessMap,
      aoMap: textureOverrides.aoMap ?? generatedTextures.aoMap,
    };

    const baseMaterial =
      options.baseMaterial ??
      new THREE.MeshStandardMaterial({
        map: textures.map,
        normalMap: textures.normalMap,
        roughnessMap: textures.roughnessMap,
        aoMap: textures.aoMap,
        aoMapIntensity: 1.0,
        metalness: 0.0,
        roughness: 0.68,
        color: new THREE.Color(0.95, 0.95, 0.95),
      });

    const baseRoughness =
      typeof baseMaterial.roughness === "number" ? baseMaterial.roughness : 0.45;
    const baseMetalness =
      typeof baseMaterial.metalness === "number" ? baseMaterial.metalness : 0.05;

    const accentMaterial =
      options.accentMaterial ??
      (() => {
        if (typeof baseMaterial.clone === "function") {
          const mat = baseMaterial.clone();
          mat.color = new THREE.Color(options.accentColor ?? 0xcbb79e);
          mat.roughness =
            options.accentRoughness ?? Math.max(0, baseRoughness - 0.05);
          return mat;
        }
        return new THREE.MeshStandardMaterial({
          color: options.accentColor ?? 0xcbb79e,
          roughness: options.accentRoughness ?? Math.max(0, baseRoughness - 0.05),
          metalness: baseMetalness,
          map: textures.map,
          normalMap: textures.normalMap,
          aoMap: textures.aoMap,
          roughnessMap: textures.roughnessMap,
        });
      })();

    const geometries = [];

    const stepHeights = [0.28, 0.24, 0.2];
    const stepScales = [1.35, 1.22, 1.1];
    let heightCursor = 0;
    stepHeights.forEach((height, i) => {
      const scale = stepScales[i] ?? 1;
      const geometry = new THREE.CylinderGeometry(
        baseRadius * scale,
        baseRadius * (scale + 0.08),
        height,
        48
      );
      geometries.push(geometry);
      const step = new THREE.Mesh(geometry, baseMaterial);
      applySharedProps(step);
      const h = geometry.parameters?.height ?? height;
      heightCursor += h / 2;
      step.position.y = heightCursor;
      heightCursor += h / 2;
      monument.add(step);
    });

    const plinthHeight = 0.5;
    const plinthGeometry = new THREE.CylinderGeometry(
      baseRadius * 1.02,
      baseRadius * 1.08,
      plinthHeight,
      48
    );
    geometries.push(plinthGeometry);
    const plinth = new THREE.Mesh(plinthGeometry, accentMaterial);
    applySharedProps(plinth);
    const plinthHalf = plinthGeometry.parameters?.height ?? plinthHeight;
    heightCursor += plinthHalf / 2;
    plinth.position.y = heightCursor;
    heightCursor += plinthHalf / 2;
    monument.add(plinth);

    const columnGeometry = new THREE.CylinderGeometry(
      baseRadius * 0.85,
      baseRadius * 0.9,
      columnHeight,
      64,
      1
    );
    geometries.push(columnGeometry);
    const column = new THREE.Mesh(columnGeometry, baseMaterial);
    applySharedProps(column);
    column.position.y = heightCursor + columnHeight / 2;
    heightCursor += columnHeight;
    monument.add(column);

    const capitalGeometry = new THREE.CylinderGeometry(
      baseRadius * 1.0,
      baseRadius * 1.2,
      capHeight * 0.55,
      48
    );
    geometries.push(capitalGeometry);
    const capital = new THREE.Mesh(capitalGeometry, accentMaterial);
    applySharedProps(capital);
    const capitalHeight = capitalGeometry.parameters?.height ?? capHeight * 0.55;
    capital.position.y = heightCursor + capitalHeight / 2;
    heightCursor += capitalHeight;
    monument.add(capital);

    const capTopHeight = capHeight * 0.75;
    const capTopGeometry = new THREE.ConeGeometry(baseRadius * 1.05, capTopHeight, 48, 1, false);
    geometries.push(capTopGeometry);
    const capTop = new THREE.Mesh(capTopGeometry, baseMaterial);
    applySharedProps(capTop);
    capTop.position.y = heightCursor + capTopHeight / 2;
    heightCursor += capTopHeight;
    monument.add(capTop);

    const finialGeometry = new THREE.SphereGeometry(baseRadius * 0.22, 24, 16);
    geometries.push(finialGeometry);
    const finial = new THREE.Mesh(finialGeometry, accentMaterial);
    applySharedProps(finial, { collidable: false });
    finial.position.y = heightCursor + baseRadius * 0.22;
    heightCursor += baseRadius * 0.22 * 2;
    monument.add(finial);

    geometries.forEach((geometry) => {
      const uv = geometry.attributes?.uv;
      if (uv) {
        geometry.setAttribute("uv2", uv.clone());
      }
    });

    const occlusionRing = new THREE.Mesh(
      new THREE.RingGeometry(baseRadius * 1.1, baseRadius * 1.75, 64),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    occlusionRing.rotation.x = -Math.PI / 2;
    occlusionRing.position.y = 0.015;
    occlusionRing.renderOrder = 1;
    occlusionRing.castShadow = false;
    occlusionRing.receiveShadow = false;
    occlusionRing.userData.noCollision = true;
    monument.add(occlusionRing);

    const keyLight = new THREE.SpotLight(0xfff0d8, 1.15, 42, Math.PI / 5, 0.35, 1.2);
    keyLight.position.set(6, heightCursor * 0.5 + 5, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0005;
    keyLight.userData.noCollision = true;
    monument.add(keyLight);
    const keyTarget = new THREE.Object3D();
    keyTarget.position.set(0, heightCursor * 0.5, 0);
    keyTarget.userData.noCollision = true;
    monument.add(keyTarget);
    keyLight.target = keyTarget;

    const fillLight = new THREE.PointLight(0xc8d6ff, 0.36, 20, 1.6);
    fillLight.position.set(-4, heightCursor * 0.4 + 3.5, -3);
    fillLight.castShadow = false;
    fillLight.userData.noCollision = true;
    monument.add(fillLight);

    const accentLight = new THREE.PointLight(0xfff7dc, 0.58, 18, 1.4);
    accentLight.position.set(0, heightCursor * 0.6 + 2.4, 0);
    accentLight.castShadow = true;
    accentLight.shadow.mapSize.set(512, 512);
    accentLight.shadow.bias = -0.0006;
    accentLight.userData.noCollision = true;
    monument.add(accentLight);

    if (options.position instanceof THREE.Vector3) {
      monument.position.copy(options.position);
    } else if (options.position && typeof options.position === "object") {
      const { x = 0, y = 0, z = 0 } = options.position;
      monument.position.set(x, y, z);
    }

    if (typeof options.rotateY === "number") {
      monument.rotation.y = options.rotateY;
    }

    if (options.scale instanceof THREE.Vector3) {
      monument.scale.copy(options.scale);
    } else if (typeof options.scale === "number") {
      monument.scale.setScalar(options.scale);
    }

    const worldX = monument.position.x;
    const worldZ = monument.position.z;
    snapAboveGround(monument, terrain, worldX, worldZ, 0.05, {
      clampToSea: true,
      seaLevel: SEA_LEVEL_Y,
      minAboveSea: 0.02,
    });

    scene.add(monument);

    if (shouldCollide) {
      envCollider.refresh();
    }

    return monument;
  };
  const buildingBase = `${BASE_URL}models/buildings/`;

  const cloneVector3Like = (value) => {
    if (!value) return null;
    if (value.isVector3) return value.clone();
    if (Array.isArray(value)) {
      return new THREE.Vector3(value[0] ?? 0, value[1] ?? 0, value[2] ?? 0);
    }
    if (typeof value === "object") {
      const { x = 0, y = 0, z = 0 } = value;
      return new THREE.Vector3(x, y, z);
    }
    return new THREE.Vector3(0, 0, 0);
  };

  const preparePlacementOptions = (options = {}, spec = {}) => {
    const prepared = { ...options };
    if (options.position) {
      const position = cloneVector3Like(options.position);
      if (position) {
        const sampler = terrain?.userData?.getHeightAt;
        const offset = spec.surfaceOffset ?? 0.05;
        const shouldAlign = spec.alignToTerrain !== false;
        if (shouldAlign && typeof sampler === "function") {
          const sampled = sampler(position.x, position.z);
          if (Number.isFinite(sampled)) {
            position.y = sampled + offset;
          } else if (!Number.isFinite(position.y)) {
            position.y = offset;
          }
        } else if (!Number.isFinite(position.y)) {
          position.y = offset;
        }
      }
      prepared.position = position;
    }
    if (!prepared.parent && buildingsRoot) {
      prepared.parent = buildingsRoot;
    }
    if (!prepared.heightSampler) {
      prepared.heightSampler =
        options.heightSampler ??
        options.terrainSampler ??
        terrainHeightSampler ??
        terrain?.userData?.getHeightAt;
    }
    return prepared;
  };

  const createTerrainAlignedPosition = (x, z, offset = 0.05) => {
    let y = offset;
    if (typeof terrainHeightSampler === "function") {
      const sampled = terrainHeightSampler(x, z);
      if (Number.isFinite(sampled)) {
        y = sampled + offset;
      }
    }
    return new THREE.Vector3(x, y, z);
  };

  const sampleBuildingSpecs = [
    {
      url: `${buildingBase}aristotle-tomb.glb`,
      position: createTerrainAlignedPosition(18, -26),
      rotateY: Math.PI * 0.18,
      scale: 0.72,
      collision: true,
      name: "SampleAristotleTomb",
    },
    {
      url: `${buildingBase}poseidon_temple_at_sounion_greece.glb`,
      position: createTerrainAlignedPosition(-34, -12),
      rotateY: -Math.PI * 0.12,
      scale: 0.32,
      collision: true,
      name: "SamplePoseidonTemple",
    },
    {
      url: `${buildingBase}Akropol.glb`,
      position: createTerrainAlignedPosition(6, -42),
      rotateY: Math.PI * 0.08,
      scale: 0.24,
      collision: false,
      name: "SampleAkropol",
    },
  ];

  const sampleBuildingResults = await Promise.allSettled(
    sampleBuildingSpecs.map((spec) =>
      buildingMgr
        .loadBuilding(spec.url, {
          position: spec.position,
          rotateY: spec.rotateY,
          scale: spec.scale,
          collision: spec.collision,
          parent: buildingsRoot,
          heightSampler: terrainHeightSampler,
        })
        .then((object) => {
          if (object && spec.name) {
            object.name = spec.name;
          }
          return object;
        })
    )
  );

  sampleBuildingResults.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `Sample building failed to load: ${sampleBuildingSpecs[index].url}`,
        result.reason
      );
    }
  });

  const resolveCandidateUrls = (files = []) =>
    files
      .map((file) => {
        if (!file) return null;
        if (/^https?:/i.test(file) || file.startsWith(BASE_URL)) {
          return file;
        }
        if (file.startsWith("/")) {
          return file;
        }
        return `${buildingBase}${file}`;
      })
      .filter(Boolean);

  const loadBuildingPlacement = async (spec) => {
    const displayName = spec.displayName ?? spec.name ?? "Building";
    const placementOptions = preparePlacementOptions(spec.options ?? {}, spec);
    const placeholderOptions = preparePlacementOptions(
      { ...(spec.options ?? {}), ...(spec.placeholderOptions ?? {}) },
      spec
    );

    const candidateUrls = resolveCandidateUrls(spec.files ?? []);
    const fallbackUrls = resolveCandidateUrls(spec.fallbackFiles ?? []);

    const snapAndRefresh = (object) => {
      if (!object || spec.snapToGround === false) return;
      if (!placementOptions?.position) return;
      const { x, z } = placementOptions.position;
      const snapOffset = spec.surfaceOffset ?? 0.05;
      const snapSettings = {
        clampToSea: true,
        seaLevel: SEA_LEVEL_Y,
        minAboveSea: spec.minAboveSea ?? 0.02,
        ...(spec.snapOptions ?? {}),
      };
      snapAboveGround(object, terrain, x, z, snapOffset, snapSettings);
    };

    const resolveTransformOptions = () => {
      const transform = {};

      if (placementOptions.position) {
        transform.position = placementOptions.position;
      }

      if (placementOptions.scale !== undefined) {
        transform.scale = placementOptions.scale;
      }

      if (placementOptions.rotation) {
        const { x, y, z } = placementOptions.rotation;
        if ([x, y, z].some((value) => Number.isFinite(value))) {
          transform.rotation = { x, y, z };
        }
      } else {
        const euler = {};
        let hasRotation = false;
        const axisMap = [
          ["rotateX", "x"],
          ["rotateY", "y"],
          ["rotateZ", "z"],
        ];

        for (const [key, axis] of axisMap) {
          const value = placementOptions[key];
          if (Number.isFinite(value)) {
            euler[axis] = value;
            hasRotation = true;
          }
        }

        if (hasRotation) {
          transform.rotation = euler;
        }
      }

      return transform;
    };

    const applyCollisionSettings = (object) => {
      if (!object) return;
      const shouldCollide = Boolean(placementOptions?.collision);
      object.traverse?.((child) => {
        if (!child?.isMesh) return;
        child.userData = child.userData || {};
        child.userData.noCollision = !shouldCollide;
      });
      if (shouldCollide && typeof envCollider?.refresh === "function") {
        envCollider.refresh();
      }
    };

    const attemptLoad = async (urls, label) => {
      if (!urls.length) return null;
      const url = await resolveFirstAvailableAsset(urls);
      if (!url) return null;
      try {
        const transformOptions = resolveTransformOptions();
        const object = await loadLandmark(scene, url, transformOptions);
        if (!object) {
          return null;
        }
        if (spec.name && (!object.name || object.name === "")) {
          object.name = spec.name;
        }
        snapAndRefresh(object);
        applyCollisionSettings(object);
        if (typeof spec.onLoaded === "function") {
          try {
            spec.onLoaded(object, { url, label });
          } catch (hookError) {
            console.warn(`loadBuildingPlacement onLoaded hook failed for ${displayName}`, hookError);
          }
        }
        return object;
      } catch (error) {
        const prefix = label === "fallback" ? "Fallback" : "";
        console.error(
          `${prefix ? `${prefix} ` : ""}${displayName} failed to load from ${url}`,
          error
        );
        return null;
      }
    };

    let object = await attemptLoad(candidateUrls, "primary");

    if (!object && fallbackUrls.length) {
      if (spec.missingPrimaryMessage) {
        console.info(spec.missingPrimaryMessage);
      }
      object = await attemptLoad(fallbackUrls, "fallback");
      if (object) {
        if (spec.fallbackMessage) {
          console.info(spec.fallbackMessage);
        }
      } else if (spec.fallbackFailureMessage) {
        console.error(spec.fallbackFailureMessage);
      }
    }

    if (!object) {
      if (!fallbackUrls.length && spec.missingPrimaryMessage) {
        console.info(spec.missingPrimaryMessage);
      }
      if (spec.allMissingMessage) {
        console.info(spec.allMissingMessage);
      }
      if (spec.spawnPlaceholder !== false) {
        spawnPlaceholderMonument({
          ...placeholderOptions,
          collision:
            spec.placeholderCollision ??
            placeholderOptions.collision ??
            placementOptions.collision,
        });
      }
    }

    return object;
  };

  const tombPrimaryUrl = `${buildingBase}aristotle-tomb.glb`;
  const akropolUrl = `${buildingBase}Akropol.glb`;
  const poseidonUrl = `${buildingBase}poseidon_temple_at_sounion_greece.glb`;

  const buildingPlacements = [
    {
      name: "aristotle-tomb",
      displayName: "Aristotle's Tomb",
      files: ["aristotle-tomb.glb", "aristotle-tomb.gltf"],
      fallbackFiles: ["Akropol.glb"],
      options: {
        scale: 1.2,
        position: new THREE.Vector3(6, 0, -28),
        rotateY: Math.PI * 0.15,
        collision: true,
      },
      surfaceOffset: 0.05,
      snapOptions: { minAboveSea: 0.02 },
      missingPrimaryMessage: `Aristotle's Tomb missing at ${tombPrimaryUrl}; run npm run download:aristotle to install the premium asset.`,
      fallbackMessage: "Using Akropol.glb as a fallback for Aristotle's Tomb.",
      fallbackFailureMessage: "Akropol fallback model also failed to load.",
      allMissingMessage: `Aristotle's Tomb missing at ${tombPrimaryUrl}; install it with npm run download:aristotle.`,
    },
    {
      name: "acropolis",
      displayName: "Acropolis",
      files: ["Akropol.glb"],
      options: {
        position: ACROPOLIS_PEAK_3D.clone(),
        rotateY: Math.PI * 0.22,
        scale: 0.45,
        collision: true,
      },
      surfaceOffset: 0.18,
      snapOptions: { minAboveSea: 0.5 },
      missingPrimaryMessage: `Akropol asset missing at ${akropolUrl}; add it under public/models/buildings/ to replace the placeholder.`,
    },
    {
      name: "poseidon-temple",
      displayName: "Temple of Poseidon",
      files: ["poseidon_temple_at_sounion_greece.glb"],
      options: {
        position: new THREE.Vector3(-150, 0, 42),
        rotateY: -Math.PI * 0.35,
        scale: 0.38,
        collision: true,
      },
      surfaceOffset: 0.08,
      snapOptions: { minAboveSea: 0.05 },
      missingPrimaryMessage: `Poseidon temple model missing at ${poseidonUrl}; add it under public/models/buildings/ to replace the placeholder.`,
    },
  ];

  for (const spec of buildingPlacements) {
    await loadBuildingPlacement(spec);
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
