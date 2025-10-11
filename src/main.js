// main.js

import * as THREE from "three";
import { Soundscape } from "./audio/soundscape.js";
import { mountAudioMixer } from "./ui/audioMixer.js";
import {
  createSky,
  updateSky,
  createStars,
  updateStars,
  setTimeOfDayPhase,
} from "./world/sky.js";
import { createLighting, updateLighting, createMoon, updateMoon } from "./world/lighting.js";
import { createInteractor } from "./world/interactions.js";
import { attachCrosshair } from "./world/ui/crosshair.js";
import { createTerrain, updateTerrain } from "./world/terrain.js";
import { createOcean, updateOcean } from "./world/ocean.js";
import { createHarbor, updateHarborLighting } from "./world/harbor.js";
import { createMainHillRoad, updateMainHillRoadLighting } from "./world/roads_hillcity.js";
import { mountHillCityDebug } from "./world/debug_hillcity.js";
import { createPlazas } from "./world/plazas.js";
import { updateCityLighting, createHillCity, createCity } from "./world/city.js";
import {
  mount as mountGrass,
  update as updateGrass,
  setNightFactor as setGrassNightFactor,
} from "./world/grass.js";
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
import { ThirdPersonCamera } from "./controls/ThirdPersonCamera.js";
import { Character } from "./characters/Character.js";
import { spawnCitizenCrowd, spawnGLBNPCs } from "./world/npcs.js";
import { mountExposureSlider } from "./ui/exposureSlider.js";
import { mountHotkeyOverlay } from "./ui/hotkeyOverlay.js";
import { mountDevHUD } from "./ui/devHud.js";
import { mount as mountHUDCameraSettings } from "./ui/HUDCameraSettings.js";
import { createPin } from "./world/pins.js";
import { attachHeightSampler } from "./world/terrainHeight.js";
import { addDepthOccluderRibbon } from "./world/occluders.js";
import { snapAboveGround } from "./world/ground.js";
import { createGLTFLoader, loadGLBWithFallbacks } from "./utils/glbSafeLoader.js";
import { resolveBaseUrl, joinPath } from "./utils/baseUrl.js";
import { applyTextureBudgetToObject } from "./utils/textureBudget.js";
import { LandmarkManager } from "./world/LandmarkManager.js";
import { athensLayoutConfig } from "./config/athensLayoutConfig.js";
// === CODex: Aristotle PBR hook (non-breaking) ===
import { attachAristotleMarblePBR } from "./features/aristotle-texture.js";
import { applyGravelToRoads } from "./features/roads-gravel.js";

// @ts-ignore
console.info("[build]", { time: __BUILD_TIME__, sha: __BUILD_SHA__ });

(async () => {
  const BASE = resolveBaseUrl();
  const probes = [
    "audio/manifest.json",
    "models/npcs/manifest.json",
    "config/districts.json",
    // keep GLBs optional; uncomment as you add binaries:
    // "models/landmarks/akropol.glb",
    // "models/landmarks/poseidon_temple.glb",
  ];
  for (const p of probes) {
    const u = joinPath(BASE, p);
    try {
      const r = await fetch(u, { method: p.endsWith(".json") ? "GET" : "HEAD", cache: "no-cache" });
      console.log("[probe]", p, r.status, r.ok, u);
    } catch (e) {
      console.warn("[probe-failed]", p, u, e);
    }
  }
  console.log("[base]", BASE);
})();

const WORLD_ROOT_NAME = "WorldRoot";
const USE_THIRD_PERSON = true;

const LIGHTING_PRESETS = {
  dawn: {
    phase: 0.25,
    exposure: 0.9,
    label: "Dawn",
    hotkey: "1",
  },
  noon: {
    phase: 0.5,
    exposure: 1.5,
    label: "High Noon",
    hotkey: "2",
  },
  dusk: {
    phase: 0.75,
    exposure: 0.95,
    label: "Dusk",
    hotkey: "3",
  },
  night: {
    phase: 0.0,
    exposure: 0.6,
    label: "Night",
    hotkey: "4",
  },
};

window.addEventListener("unhandledrejection", (ev) => {
  console.error("Unhandled promise rejection:", ev.reason);
});

const BASE_URL = resolveBaseUrl();

function sanitizeRelativePath(value) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/^public\//i, "")
    .replace(/^docs\//i, "")
    .replace(/^athens-game-starter\//i, "")
    .replace(/^\.\//, "")
    .replace(/^\/+/, "");
}
const ARISTOTLE_CANDIDATES = [
  "models/buildings/aristotle_tomb.glb",
  "models/buildings/aristotle_tomb_in_macedonia_greece.glb",
  "models/landmarks/aristotle_tomb.glb",
  "models/landmarks/aristotle_tomb_in_macedonia_greece.glb",
  "aristotle_tomb_in_macedonia_greece.glb",
];
const POSEIDON_CANDIDATES = [
  "models/buildings/poseidon_temple.glb",
  "models/buildings/poseidon_temple_at_sounion_greece.glb",
  "models/landmarks/poseidon_temple.glb",
  "models/landmarks/poseidon_temple_at_sounion_greece.glb",
  "poseidon_temple_at_sounion_greece.glb",
];
const AKROPOL_CANDIDATES = [
  "models/buildings/akropol.glb",
  "models/buildings/Akropol.glb",
  "models/landmarks/akropol.glb",
  "models/landmarks/Akropol.glb",
  "Akropol.glb",
];

// resolveFirstAvailableAsset
const isHtml = (res) => (res.headers.get("content-type") || "").includes("text/html");

/** Lightweight existence check (avoids double-downloading GLBs) */
async function headOk(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok && !isHtml(res);
  } catch {
    return false;
  }
}

// --- util: resolveFirstAvailableAsset (fetch HEAD, skip HTML) ---
async function resolveFirstAvailableAsset(candidates = []) {
  const seen = new Set();
  for (const url of candidates) {
    if (typeof url !== "string") continue;
    const trimmed = url.trim();
    if (!trimmed) continue;

    if (/^(?:[a-z]+:)?\/\//i.test(trimmed)) {
      if (!seen.has(trimmed) && (await headOk(trimmed))) {
        return trimmed;
      }
      seen.add(trimmed);
      continue;
    }

    const relative = sanitizeRelativePath(trimmed);
    if (!relative) {
      continue;
    }

    const candidatesToTry = Array.from(
      new Set([joinPath(BASE_URL, relative), relative].filter(Boolean))
    );

    for (const candidate of candidatesToTry) {
      if (seen.has(candidate)) continue;
      seen.add(candidate);
      if (await headOk(candidate)) {
        return candidate;
      }
    }
  }
  throw new Error("No candidate asset reachable: " + candidates.join(", "));
}

async function runAssetQuickChecks() {
  const baseUrl = resolveBaseUrl();
  const checks = [
    { label: "Audio Manifest", path: joinPath(baseUrl, "audio/manifest.json") },
    { label: "Aristotle Tomb", path: joinPath(baseUrl, "models/landmarks/aristotle_tomb.glb") },
    { label: "District Rules", path: joinPath(baseUrl, "config/districts.json") },
    { label: "Water Normals", path: joinPath(baseUrl, "textures/ground/water_normals.png") },
  ];

  const results = [];
  for (const { label, path } of checks) {
    const exists = await headOk(path);
    results.push({ label, path, status: exists ? "ok" : "missing" });
  }

  if (typeof console?.table === "function") {
    console.table(results, ["label", "path", "status"]);
  } else {
    console.log("Asset QuickChecks", results);
  }
}

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

export function createProceduralMarbleTextures() {
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
  runAssetQuickChecks().catch((err) => {
    console.warn("Asset QuickChecks failed", err);
  });
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  // Lock modern physically-based lighting behaviour explicitly so appearance
  // stays stable across Three.js releases (r155+ defaults, but we set it here
  // for clarity and forward-compat).
  renderer.useLegacyLights = false;
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
  scene.userData = scene.userData || {};
  scene.userData.renderer = renderer;
  scene.userData.baseUrl = BASE_URL;

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

  const disposeGroupChildren = (group) => {
    if (!group) return;
    const children = [...group.children];
    for (const child of children) {
      disposeObject(child);
      group.remove(child);
    }
  };

  const refreshWorldRoot = () => {
    const existing = scene.userData?.worldRoot ?? scene.getObjectByName(WORLD_ROOT_NAME);
    if (existing) {
      disposeGroupChildren(existing);
      existing.parent?.remove(existing);
    }

    const root = new THREE.Group();
    root.name = WORLD_ROOT_NAME;
    root.userData = root.userData || {};
    root.userData.renderer = scene.userData?.renderer || null;
    if (typeof scene.userData?.baseUrl === "string") {
      root.userData.baseUrl = scene.userData.baseUrl;
    } else {
      delete root.userData.baseUrl;
    }
    scene.add(root);
    scene.userData.worldRoot = root;
    return root;
  };

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
  let audioManifestMissing = false;
  await soundscape.loadManifest("audio/manifest.json").catch(() => {
    audioManifestMissing = true;
    console.info("[audio] No audio manifest found; running silently.");
  });
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
  scene.userData.terrain = terrain;
  scene.userData.getHeightAt = terrain?.userData?.getHeightAt;
  if (typeof terrain?.userData?.getHeightAt === "function") {
    scene.userData.terrainHeightSampler = terrain.userData.getHeightAt;
  }
  // Dev/test-only occluder ribbon (enable with ?occluder=1 or in DEV)
  const shouldAddOccluder = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has("occluder")) {
        const v = params.get("occluder");
        return v === null || v === "" || v === "1" || v === "true" || v === "on";
      }
    } catch {}
    return !!(import.meta.env && import.meta.env.DEV);
  })();
  if (shouldAddOccluder) {
    const P1 = new THREE.Vector2(-0.4, -0.3);
    const P2 = new THREE.Vector2(-95.7, -3.1);
    addDepthOccluderRibbon(scene, terrain, P1, P2, 6 /* width */, 140 /* segments */);
  }

  const grassEnabled = (() => {
    if (typeof window === "undefined") {
      return false;
    }
    try {
      const params = new URLSearchParams(window.location.search);
      if (!params.has("grass")) {
        return false;
      }
      return parseToggleValue(params.get("grass"), false);
    } catch (error) {
      console.warn("Failed to parse grass flag from query string:", error);
      return false;
    }
  })();

  const ocean = await createOcean(scene, { bounds: HARBOR_WATER_BOUNDS });
  const harbor = createHarbor(scene, { center: HARBOR_CENTER_3D });
  const envCollider = new EnvironmentCollider();
  scene.add(envCollider.mesh);

  const worldRoot = refreshWorldRoot();

  let grassRoot = null;

  const roadsVisible = (() => {
    if (typeof window === "undefined") {
      return true;
    }
    try {
      const params = new URLSearchParams(window.location.search);
      if (!params.has("roads")) {
        return true;
      }
      return parseToggleValue(params.get("roads"), true);
    } catch (error) {
      console.warn("Failed to parse roads visibility from query string:", error);
      return true;
    }
  })();

  // Roads first (needs terrain sampler)
  const { group: roadGroup, curve: mainRoad } = createMainHillRoad(worldRoot, terrain);
  if (roadGroup) {
    roadGroup.visible = roadsVisible;
  }
  if (import.meta.env?.DEV) {
    mountHillCityDebug(scene, mainRoad);
  }

  if (grassEnabled) {
    grassRoot = mountGrass(scene);
    if (grassRoot) {
      setGrassNightFactor(lights.nightFactor);
    }
  }

  // --- Aristotle's Tomb (local GLB) -----------------------------------------
  // We prefer a local asset the repo expects at:
  //   public/models/landmarks/aristotle_tomb.glb
  // At runtime we try both the site base (for GitHub Pages) and root (for dev).
  // If found, we stream it via loadLandmark(); the loader will auto-raise it
  // ~5cm above ground and handle KTX2 texture support transparently.
  try {
    const aristotleUrl = await resolveFirstAvailableAsset(ARISTOTLE_CANDIDATES);
    if (aristotleUrl) {
      const aristotle = await loadLandmark(worldRoot, aristotleUrl, {
        // Use a named location that already exists in the scene constants.
        // The landmark loader will call the scene/terrain height sampler and
        // lift the model slightly so it rests on the ground.
        position: ACROPOLIS_PEAK_3D,
        scale: 3.0,
        materialPreset: "marble",
      });
      // Safe no-op if textures not uploaded yet
      try {
        await attachAristotleMarblePBR({
          obj: aristotle ?? null,
          scene,
          renderer,
          BASE_URL,
        });
      } catch (e) {
        // never fail the scene due to the texture hook
        console.warn("Aristotle PBR hook skipped:", e);
      }
    } else {
      console.warn(
        "Aristotle's Tomb not found. Expected at:",
        ARISTOTLE_CANDIDATES
      );
    }
  } catch (err) {
    console.error("Failed to load Aristotle's Tomb:", err);
  }
  // --------------------------------------------------------------------------

  // Poseidon Temple (Sounion)
  try {
    const url = await resolveFirstAvailableAsset(POSEIDON_CANDIDATES);
    if (url)
      await loadLandmark(worldRoot, url, {
        position: new THREE.Vector3(90, 0, -60),
        scale: 2.6,
        materialPreset: "marble",
      });
  } catch (e) {
    console.warn("Poseidon Temple not loaded:", e);
  }

  // Akropol (Acropolis complex placeholder)
  try {
    const url = await resolveFirstAvailableAsset(AKROPOL_CANDIDATES);
    if (url)
      await loadLandmark(worldRoot, url, {
        position: new THREE.Vector3(130, 0, 40),
        scale: 2.2,
        materialPreset: "marble",
      });
  } catch (e) {
    console.warn("Akropol not loaded:", e);
  }
  // --------------------------------------------------------------------------

  // Plazas (agora + acropolis terraces) — disabled per request to remove large discs
  // createPlazas(worldRoot);

  const harborCity = await createCity(worldRoot, terrain, {
    roadsVisible,
  });

  // Hill-city buildings (uses terrain sampler + road curve)
  const hillCity = createHillCity(worldRoot, terrain, mainRoad, {
    seed: 42,
    buildingCount: 140,
  });

  try {
    await applyGravelToRoads({ scene, baseUrl: BASE_URL, repeat: [6, 6] });
  } catch (e) {
    console.warn("Gravel roads hook skipped:", e);
  }

  // Rebuild the static environment collider once after placing roads, plazas,
  // and the hill city so the player can't walk through them.
  envCollider.fromStaticScene(scene);

  // Lay out a formal civic district with a central promenade, symmetrical
  // civic buildings, and decorative lighting to give the city a planned
  // character rather than scattered props.
  const civicDistrict = createCivicDistrict(worldRoot, {
    plazaLength: 90,
    promenadeWidth: 16,
    greensWidth: 9,
    center: AGORA_CENTER_3D,
    terrain,
  });

  // Rebuild the collider again now that the civic district geometry exists so the
  // player can stand on the new plazas instead of falling through them.
  envCollider.refresh();

  const input = new InputMap(renderer.domElement);
  const player = new PlayerController(input, envCollider, { camera });
  worldRoot.add(player.object);

  const spawnPosition = new THREE.Vector3(0, 0, 10);
  player.object.position.copy(spawnPosition);
  const spawnClearance = 0.1;
  const spawnOffset = player.height * 0.5 + spawnClearance;
  snapAboveGround(player.object, terrain, spawnPosition.x, spawnPosition.z, spawnOffset, {
    clampToSea: true,
    seaLevel: SEA_LEVEL_Y,
    minAboveSea: 0.25,
  });
  player.syncCapsuleToObject();

  let interactor = null;

  const thirdPersonSolids = [];
  if (envCollider?.mesh) {
    thirdPersonSolids.push(envCollider.mesh);
  }
  if (terrain) {
    thirdPersonSolids.push(terrain);
  }
  // If we centralize environment collision meshes later, wire them into this array.

  const thirdPersonTargetOffset = new THREE.Vector3(0, player.height * 0.6, 0);

  let thirdPersonCamera = null;
  let thirdPersonEnabled = false;
  const thirdPersonPointerState = {
    active: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    pendingUse: false,
    pointerType: null,
  };
  let thirdPersonHandlersAttached = false;

  const viewCanvas = renderer.domElement;
  const DRAG_THRESHOLD = 1.5;

  const clearThirdPersonPointer = () => {
    if (thirdPersonPointerState.pointerId !== null) {
      try {
        viewCanvas.releasePointerCapture(thirdPersonPointerState.pointerId);
      } catch {}
    }
    thirdPersonPointerState.active = false;
    thirdPersonPointerState.pointerId = null;
    thirdPersonPointerState.pendingUse = false;
    thirdPersonPointerState.pointerType = null;
  };

  const onThirdPersonPointerDown = (event) => {
    if (!thirdPersonEnabled || !thirdPersonCamera) return;
    if (!event.isPrimary) return;
    if (event.pointerType !== "touch" && event.button !== 0) return;

    thirdPersonPointerState.active = true;
    thirdPersonPointerState.pointerId = event.pointerId;
    thirdPersonPointerState.lastX = event.clientX;
    thirdPersonPointerState.lastY = event.clientY;
    thirdPersonPointerState.pointerType = event.pointerType;
    thirdPersonPointerState.pendingUse = event.button === 0 || event.pointerType === "touch";

    try {
      viewCanvas.setPointerCapture(event.pointerId);
    } catch {}

    event.preventDefault();
  };

  const onThirdPersonPointerMove = (event) => {
    if (!thirdPersonPointerState.active) return;
    if (thirdPersonPointerState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - thirdPersonPointerState.lastX;
    const deltaY = event.clientY - thirdPersonPointerState.lastY;

    thirdPersonPointerState.lastX = event.clientX;
    thirdPersonPointerState.lastY = event.clientY;

    if (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD) {
      thirdPersonPointerState.pendingUse = false;
    }

    if (thirdPersonCamera) {
      thirdPersonCamera.handlePointer(deltaX, deltaY);
    }

    event.preventDefault();
  };

  const onThirdPersonPointerUp = (event) => {
    if (thirdPersonPointerState.pointerId !== event.pointerId) return;

    const shouldUse =
      thirdPersonPointerState.pendingUse &&
      (event.button === 0 || thirdPersonPointerState.pointerType === "touch");

    clearThirdPersonPointer();

    if (shouldUse && interactor) {
      interactor.useObject();
    }

    event.preventDefault();
  };

  const onThirdPersonPointerCancel = () => {
    if (!thirdPersonPointerState.active) return;
    clearThirdPersonPointer();
  };

  const attachThirdPersonPointer = () => {
    if (thirdPersonHandlersAttached) return;
    thirdPersonHandlersAttached = true;
    viewCanvas.addEventListener("pointerdown", onThirdPersonPointerDown);
    viewCanvas.addEventListener("pointermove", onThirdPersonPointerMove);
    viewCanvas.addEventListener("pointerup", onThirdPersonPointerUp);
    viewCanvas.addEventListener("pointercancel", onThirdPersonPointerCancel);
    viewCanvas.addEventListener("lostpointercapture", onThirdPersonPointerCancel);
    window.addEventListener("blur", onThirdPersonPointerCancel);
  };

  const detachThirdPersonPointer = () => {
    if (!thirdPersonHandlersAttached) return;
    thirdPersonHandlersAttached = false;
    viewCanvas.removeEventListener("pointerdown", onThirdPersonPointerDown);
    viewCanvas.removeEventListener("pointermove", onThirdPersonPointerMove);
    viewCanvas.removeEventListener("pointerup", onThirdPersonPointerUp);
    viewCanvas.removeEventListener("pointercancel", onThirdPersonPointerCancel);
    viewCanvas.removeEventListener("lostpointercapture", onThirdPersonPointerCancel);
    window.removeEventListener("blur", onThirdPersonPointerCancel);
    clearThirdPersonPointer();
  };

  const setThirdPersonEnabled = (enabled) => {
    if (!thirdPersonCamera) return;

    const next = !!enabled;
    if (thirdPersonEnabled === next) return;

    thirdPersonEnabled = next;
    thirdPersonCamera.setEnabled(next);

    if (next) {
      thirdPersonCamera.setAngles(player.cameraYaw ?? 0, player.cameraPitch ?? 0, {
        snap: true,
      });
      thirdPersonCamera.update(0);
      attachThirdPersonPointer();
      if (
        typeof document !== "undefined" &&
        document.pointerLockElement === viewCanvas &&
        typeof document.exitPointerLock === "function"
      ) {
        try {
          document.exitPointerLock();
        } catch {}
      }
    } else {
      thirdPersonCamera.setAngles(player.cameraYaw ?? 0, player.cameraPitch ?? 0, {
        snap: true,
      });
      detachThirdPersonPointer();
    }
  };

  if (USE_THIRD_PERSON) {
    thirdPersonCamera = new ThirdPersonCamera(camera, player.object, {
      targetOffset: thirdPersonTargetOffset,
      followLerp: 0.12,
      rotationLerp: 0.15,
      solids: thirdPersonSolids,
      enabled: false,
      keyOrbit: {
        enabled: true,
        yawSpeed: 0.9,
        pitchSpeed: 0.9,
        minPitch: -0.6,
        maxPitch: 0.6,
        minDist: 2.5,
        maxDist: 7.5,
        zoomSpeed: 4,
      }, // ArrowKeyOrbit: configure keyboard orbit controls
    });
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

  worldRoot.add(doorPivot);

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
  pointLight.castShadow = false;
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

  worldRoot.add(lamp);

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
  const heroPath = joinPath(BASE_URL, "models/character/hero.glb");
  const heroRootPath = "models/character/hero.glb";
  const bundledHeroName = encodeURIComponent("Hooded Adventurer.glb");
  const characterDir = joinPath(BASE_URL, "models/character");
  const bundledHeroPath = joinPath(characterDir, bundledHeroName);
  const bundledHeroRootPath = `models/character/${bundledHeroName}`;
  const attachFallbackAvatar = () => {
    removeExistingAvatar();
    const fallbackAvatar = createFallbackAvatar();
    player.object.add(fallbackAvatar);
    fallbackAvatar.position.set(0, 0, 0);
  };

  const heroCandidates = Array.from(
    new Set(
      [heroPath, heroRootPath, bundledHeroPath, bundledHeroRootPath].filter(Boolean)
    )
  );

  try {
    const heroLoader = createGLTFLoader(renderer);
    const loadedHero = await loadGLBWithFallbacks(heroLoader, heroCandidates, {
      renderer,
      targetHeight: 1.8,
    });

    if (!loadedHero || !loadedHero.root) {
      throw new Error("No hero GLB candidates reachable");
    }

    const { url, gltf, root } = loadedHero;

    removeExistingAvatar();
    character.initializeFromGLTF(root, gltf.animations);
    player.attachCharacter(character);

    if (url !== heroPath && url !== heroRootPath) {
      console.info(
        `Hero GLB not found at ${heroPath}; using fallback avatar from ${url}.`
      );
    }
    console.log("[Hero] Loaded:", url);
  } catch (error) {
    console.error(
      `[Hero] All candidates failed, using fallback avatar:`,
      error?.message || error
    );
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
  worldRoot.add(buildingsRoot);
  const npcUpdaters = [];
  if (civicDistrict.walkingLoop) {
    const crowd = spawnCitizenCrowd(worldRoot, civicDistrict.walkingLoop, {
      count: 8,
      minSpeed: 0.7,
      maxSpeed: 1.4,
      terrain,
    });
    npcUpdaters.push(...crowd.updaters);
  }
  spawnGLBNPCs(worldRoot, mainRoad, { terrain })
    .then((glbNpcs) => {
      if (!glbNpcs) return;
      if (Array.isArray(glbNpcs.updaters)) {
        npcUpdaters.push(...glbNpcs.updaters);
      }
    })
    .catch((error) => {
      console.warn("[NPC Loader] Failed to spawn GLB NPCs", error);
    });
  // Limit the number of placeholder light shadow maps so we stay under the
  // WebGL texture unit cap when many placeholders are visible at once.
  const PLACEHOLDER_LIGHT_SHADOW_BUDGET = 12;
  let placeholderShadowSlotsRemaining = PLACEHOLDER_LIGHT_SHADOW_BUDGET;

  const tryConsumePlaceholderShadowSlot = () => {
    if (placeholderShadowSlotsRemaining <= 0) {
      return false;
    }
    placeholderShadowSlotsRemaining -= 1;
    return true;
  };

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
    keyLight.castShadow = false;
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
    accentLight.castShadow = false;
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

    const parentGroup = options.parent ?? worldRoot;
    parentGroup.add(monument);

    if (shouldCollide) {
      envCollider.refresh();
    }

    return monument;
  };
  const buildingBase = joinPath(BASE_URL, "models/buildings");

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
      url: joinPath(BASE_URL, "models/landmarks/poseidon_temple.glb"),
      position: createTerrainAlignedPosition(-34, -12),
      rotateY: -Math.PI * 0.12,
      // Preserve the authored dimensions (≈13.8m span, 4.5m tall) so the
      // landmark reads close to its real-world size.
      scale: 1,
      collision: true,
      name: "SamplePoseidonTemple",
    },
    {
      url: joinPath(BASE_URL, "models/landmarks/akropol.glb"),
      position: createTerrainAlignedPosition(6, -42),
      rotateY: Math.PI * 0.08,
      // Match the mesh's original scale to avoid shrinking the Acropolis model
      // below a believable footprint.
      scale: 1,
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

  const landmarkManager = new LandmarkManager({
    scene: worldRoot,
    parent: buildingsRoot,
    terrain,
    heightSampler: terrainHeightSampler,
    envCollider,
    renderer,
    spawnPlaceholder: (options = {}) =>
      spawnPlaceholderMonument({
        ...options,
        parent: options.parent ?? buildingsRoot,
      }),
    quietMissing: true,
  });

  try {
    await landmarkManager.loadConfig(athensLayoutConfig);
  } catch (error) {
    console.error("[LandmarkManager] Failed to load Athens layout", error);
  }

  interactor = createInteractor(renderer, camera, scene);

  if (thirdPersonCamera) {
    setThirdPersonEnabled(USE_THIRD_PERSON);
  }

  // Texture budget safe mode.
  applyTextureBudgetToObject(scene, { safeMode: true });

  const clock = new THREE.Clock();
  // Slow the sun/moon orbit so each in-game day lasts 20 real minutes by default.
  const dayCycle = startTimeOfDayCycle();
  const timeOfDayState = { timeOfDayPhase: 0 };
  setTimeOfDayPhase(timeOfDayState, 0);

  const applyLightingPreset = (presetName) => {
    const preset = LIGHTING_PRESETS[presetName];
    if (!preset) return;

    const phase = setTimeOfDayPhase(timeOfDayState, preset.phase);
    renderer.toneMappingExposure = preset.exposure;
    console.log(`[HUD] preset: ${presetName}`);

    const sunDir = updateSky(skyObj, timeOfDayState);
    updateLighting(lights, sunDir);
    updateHarborLighting(harbor, lights.nightFactor);
    updateCityLighting(harborCity, lights.nightFactor);
    updateCityLighting(hillCity, lights.nightFactor);
    updateMainHillRoadLighting(roadGroup, lights.nightFactor);
    updateStars(stars, phase);
    updateMoon(moon, sunDir);
    updateOcean(ocean, 0, sunDir, lights.nightFactor);
    if (grassRoot) {
      setGrassNightFactor(lights.nightFactor);
      updateGrass(0, player?.position ?? null);
    }

    const formattedTime = formatPhaseAsTime(phase);
    if (formattedTime !== lastDisplayedTime) {
      timeOfDayDisplay.textContent = `Time: ${formattedTime}`;
      lastDisplayedTime = formattedTime;
    }

    renderer.render(scene, camera);
  };

  function animate() {
    requestAnimationFrame(animate);

    // Keep track of time for smooth animation and frame-independent movement.
    const deltaTime = clock.getDelta();
    const elapsed = clock.elapsedTime;

    if (dayCycle.secondsPerDay > 0) {
      const deltaPhase = deltaTime / dayCycle.secondsPerDay;
      const nextPhase = (timeOfDayState.timeOfDayPhase ?? 0) + deltaPhase;
      const wrappedPhase = nextPhase - Math.floor(nextPhase);
      setTimeOfDayPhase(timeOfDayState, wrappedPhase);
    }

    const phase = timeOfDayState.timeOfDayPhase ?? 0;
    const sunDir = updateSky(skyObj, timeOfDayState);

    // Update sky dome, atmospheric lighting, and celestial bodies each frame.
    updateLighting(lights, sunDir);
    updateHarborLighting(harbor, lights.nightFactor);
    updateCityLighting(harborCity, lights.nightFactor);
    updateCityLighting(hillCity, lights.nightFactor);
    updateMainHillRoadLighting(roadGroup, lights.nightFactor);
    // Fade the stars in and out depending on the time of day.
    updateStars(stars, phase);
    updateMoon(moon, sunDir);
    if (grassRoot) {
      setGrassNightFactor(lights.nightFactor);
      updateGrass(deltaTime, player?.position ?? null);
    }

    // Advance the GPU-driven terrain sway (no CPU vertex updates required).
    updateTerrain(terrain, elapsed);
    updateOcean(ocean, deltaTime, sunDir, lights.nightFactor);

    // Update soundscape once per frame (player position optional)
    soundscape.update(player?.position);

    if (thirdPersonCamera && thirdPersonEnabled) {
      player.cameraYaw = thirdPersonCamera.getYaw();
      player.cameraPitch = thirdPersonCamera.getPitch();
    }

    // Update player movement and drive the attached character animation.
    player.update(deltaTime);
    if (thirdPersonCamera && thirdPersonEnabled) {
      player.cameraYaw = thirdPersonCamera.getYaw();
      player.cameraPitch = thirdPersonCamera.getPitch();
    }
    if (thirdPersonCamera) {
      thirdPersonCamera.update(deltaTime);
    }
    for (const updateNpc of npcUpdaters) updateNpc(deltaTime);

    // Cast a ray through the center of the screen to detect hovered objects and
    // highlight anything marked as interactable via userData.
    const hovered = interactor.updateHover(deltaTime);
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
    const pin = createPin(worldRoot, p);
    // auto-lift pin to ground if sampler exists
    const y = terrain?.userData?.getHeightAt?.(p.x, p.z);
    if (Number.isFinite(y)) pin.position.y = y;
  };

  // Mount HUD in dev OR if a global flag is set (useful in prod previews)
  // Force HUD to always show in live builds so camera controls + compass remain visible
  if (typeof window !== "undefined") {
    window.SHOW_HUD = true;
  }
  console.log("[HUD] mounting…");
  const devHud = mountDevHUD({
    getPosition,
    getDirection,
    onPin,
    onSetLightingPreset: applyLightingPreset,
    lightingPresets: LIGHTING_PRESETS,
  });
  mountHUDCameraSettings(devHud?.rootElement ?? null);
  if (audioManifestMissing) {
    devHud?.setStatusLine?.("audio", "Audio: Off (no manifest)");
  }

  // Simple controls: clicking the canvas or pressing E will run the onUse
  // callback attached to whatever we are currently looking at.
  renderer.domElement.addEventListener("pointerdown", (event) => {
    if (event.button === 0) {
      if (thirdPersonEnabled && thirdPersonCamera) {
        return;
      }
      interactor.useObject();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.code === "KeyV" && !event.repeat && thirdPersonCamera) {
      setThirdPersonEnabled(!thirdPersonEnabled);
    } else if (event.code === "KeyE") {
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
