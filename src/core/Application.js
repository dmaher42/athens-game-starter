// Application.js

import * as THREE from "three";
import { Soundscape } from "../audio/soundscape.js";
import { mountAudioMixer } from "../ui/audioMixer.ts";
import { createSky, updateSky, getSunDirection, setTimeOfDayPhase } from "../world/sky.js";
import { createLighting, updateLighting } from "../world/lighting.js";
import {
  createInteractor,
  queueSceneInteractable,
} from "../world/interactions.js";
import { attachCrosshair } from "../world/ui/crosshair.js";
import { createTerrain, updateTerrain } from "../world/terrain.js";
import { createOcean, updateOcean } from "../world/ocean.js";
import { createHarbor, updateHarborLighting } from "../world/harbor.js";
import { createHarborDecorations } from "../world/decoration.js";
import {
  createMainHillRoad,
  updateMainHillRoadLighting,
} from "../world/roads_hillcity.js";
import { mountHillCityDebug } from "../world/debug_hillcity.js";
import { createPlazas } from "../world/plazas.js";
import {
  updateCityLighting,
  createHillCity,
  createCity,
} from "../world/city.js";
import {
  mount as mountGrass,
  update as updateGrass,
  setNightFactor as setGrassNightFactor,
} from "../world/grass.js";
import {
  AGORA_CENTER_3D,
  AGORA_RADIUS,
  HARBOR_CENTER_3D,
  CITY_AREA_RADIUS,
  ACROPOLIS_PEAK_3D,
  HARBOR_WATER_BOUNDS,
  HARBOR_WATER_NORMAL_CANDIDATES,
  getSeaLevelY,
  setSeaLevelY,
} from "../world/locations.js";
import {
  initializeAssetTranscoders,
  loadLandmark,
  disposeLandmarks,
} from "../world/landmarks.js";
import { createCivicDistrict } from "../world/cityPlan.js";
import { createCityPlanImplementation } from "../world/cityPlanImplementation.js";
import { InputMap } from "../input/InputMap.ts";
import { EnvironmentCollider } from "../env/EnvironmentCollider.js";
import { BuildingManager } from "../buildings/BuildingManager.js";
import { PlayerController } from "../controls/PlayerController.js";
import { ThirdPersonCamera } from "../controls/ThirdPersonCamera.js";
import { Character } from "../characters/Character.js";
import { spawnCitizenCrowd, spawnGLBNPCs } from "../world/npcs.js";
import { mountExposureSlider } from "../ui/exposureSlider.ts";
import { mountHotkeyOverlay } from "../ui/hotkeyOverlay.ts";
import { mountDevHUD } from "../ui/devHud.ts";
import { mountMiniMap } from "../ui/miniMap.ts";
import { mount as mountHUDCameraSettings } from "../ui/HUDCameraSettings.ts";
import {
  showLoadingScreen,
  updateLoadingStatus,
  showLoadingError,
  hideLoadingScreen,
} from "../ui/loadingScreen.js";
import { createPin } from "../world/pins.js";
import { attachHeightSampler, probeAt } from "../world/terrainHeight.js";
import { addDepthOccluderRibbon } from "../world/occluders.js";
import { snapAboveGround } from "../world/ground.js";
import { findSafePlayerSpawn } from "../world/spawn.js";
import {
  createGLTFLoader,
  loadGLBWithFallbacks,
} from "../utils/glbSafeLoader.js";
import { resolveBaseUrl, joinPath } from "../utils/baseUrl.js";
import { applyTextureBudgetToObject } from "../utils/textureBudget.js";
import { LandmarkManager } from "../world/LandmarkManager.js";
import { athensLayoutConfig } from "../config/athensLayoutConfig.js";
import { getAssetCandidates } from "../config/AssetConfig.js";
import {
  engineConfig,
  resolveFeatureToggle,
  parseBooleanQuery,
} from "../config/EngineConfig.js";
import { lightingConfig } from "../config/LightingConfig.js";
// === CODex: Aristotle PBR hook (non-breaking) ===
import { attachAristotleMarblePBR } from "../features/aristotle-texture.js";
import { applyGravelToRoads } from "../features/roads-gravel.js";
import {
  AssetLoader,
  createProceduralMarbleTextures,
} from "./AssetLoader.js";
import {
  createRenderer,
  createSceneContext,
  WORLD_ROOT_NAME,
} from "./Scene.js";
import { GameLoop } from "./GameLoop.js";

console.info("[build]", engineConfig.build || {});

const DEFAULT_BASE_URL = engineConfig.baseUrl ?? resolveBaseUrl();
const DEFAULT_DISTRICT_RULE_URL_CANDIDATES =
  engineConfig.districtRuleCandidates || [];

const WORLD_ROOT_NAME_LEGACY = WORLD_ROOT_NAME;

const LIGHTING_PRESETS = lightingConfig.presets || {};

const DEFAULT_FORCE_GLB =
  typeof engineConfig.featureFlags?.forceGlb === "boolean"
    ? engineConfig.featureFlags.forceGlb
    : false;
const DEFAULT_FORCE_PROC =
  typeof engineConfig.featureFlags?.forceProcedural === "boolean"
    ? engineConfig.featureFlags.forceProcedural
    : !DEFAULT_FORCE_GLB;
const USE_THIRD_PERSON =
  engineConfig.featureFlags?.useThirdPersonCamera !== false;

window.addEventListener("unhandledrejection", (ev) => {
  console.error("Unhandled promise rejection:", ev.reason);
});

function shouldShowOverlay(options = {}) {
  return resolveFeatureToggle(options);
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
      const wrapped =
        ((elapsedSeconds % secondsPerDay) + secondsPerDay) % secondsPerDay;
      return wrapped / secondsPerDay;
    },
  };
}

export class Application {
  constructor({
    baseUrl = DEFAULT_BASE_URL,
    districtRuleCandidates = DEFAULT_DISTRICT_RULE_URL_CANDIDATES,
    queryParams = engineConfig.queryParams,
    forceGlb = DEFAULT_FORCE_GLB,
    forceProc,
  } = {}) {
    this.baseUrl = baseUrl ?? DEFAULT_BASE_URL;
    this.districtRuleCandidates =
      districtRuleCandidates ?? DEFAULT_DISTRICT_RULE_URL_CANDIDATES;
    this.queryParams = queryParams ?? engineConfig.queryParams;
    this.forceGlb =
      typeof forceGlb === "boolean" ? forceGlb : DEFAULT_FORCE_GLB;
    this.forceProc =
      typeof forceProc === "boolean" ? forceProc : !this.forceGlb;
    this.assetLoader = new AssetLoader({
      baseUrl: this.baseUrl,
      forceProcedural: this.forceProc,
      districtRuleCandidates: this.districtRuleCandidates,
    });
    this.gameLoop = new GameLoop();
    this.sceneContext = null;
    this.renderer = null;
    this.devHud = null;
    this.ocean = null;
    this.pendingOceanStatus = null;
  }

  async run() {
    const BASE_URL = this.baseUrl;
    const DISTRICT_RULE_URL_CANDIDATES = this.districtRuleCandidates;
    const FORCE_PROC = this.forceProc;
    const FORCE_GLB = this.forceGlb;
    const assetLoader = this.assetLoader;
    const ARISTOTLE_CANDIDATES = getAssetCandidates("aristotle");
    const POSEIDON_CANDIDATES = getAssetCandidates("poseidon");
    const AKROPOL_CANDIDATES = getAssetCandidates("akropol");

    console.log("🔧 Athens mainApp start");
    console.info(
      FORCE_PROC
        ? "[proc] GLB loading disabled (procedural default)"
        : "[glb] GLB mode enabled",
    );

    showLoadingScreen({
      initialStatus: "Preparing the experience...",
    });
    updateLoadingStatus("Preparing renderer and interface...");
    assetLoader.runAssetQuickChecks().catch((err) => {
      console.warn("Asset QuickChecks failed", err);
    });
    assetLoader
      .probeInitialAssets({
        glbCandidates: [
          "models/landmarks/poseidon_temple.glb",
          "models/landmarks/akropol.glb",
          "models/landmarks/aristotle_tomb.glb",
        ],
        includeGlbCandidates: !FORCE_PROC,
      })
      .catch((err) => console.warn("[probe] initial asset scan failed", err));

    this.renderer = createRenderer();
    const renderer = this.renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    const exposureOverlayConfig =
      engineConfig.debug?.overlays?.exposureSlider || {};
    const shouldMountExposureSlider = resolveFeatureToggle(
      exposureOverlayConfig,
    );

    if (shouldMountExposureSlider) {
      const exposureSettings = lightingConfig.exposure || {};
      // Mount the exposure control (F9 toggles visibility)
      mountExposureSlider(renderer, {
        min: Number.isFinite(exposureSettings.min) ? exposureSettings.min : 0.2,
        max: Number.isFinite(exposureSettings.max) ? exposureSettings.max : 2.0,
        step: Number.isFinite(exposureSettings.step) ? exposureSettings.step : 0.01,
        key: exposureOverlayConfig.hotkey || "F9",
      });
    }
    initializeAssetTranscoders(renderer);
    attachCrosshair();
    const hotkeyOverlayConfig =
      engineConfig.debug?.overlays?.hotkeyReference || { defaultValue: true };
    if (resolveFeatureToggle(hotkeyOverlayConfig)) {
      mountHotkeyOverlay({ toggleKey: hotkeyOverlayConfig.toggleKey || "KeyH" });
    }
    updateLoadingStatus("Listening for the bustle of ancient Athens...");

    let devHud = (this.devHud = null);
    let ocean = (this.ocean = null);
    let pendingOceanStatus = (this.pendingOceanStatus = null);
    const FORCE_PROCEDURAL_LANDMARKS = FORCE_PROC;
    let proceduralLandmarkCount = 0;
    let proceduralStatusMessage = FORCE_PROC
      ? "Procedural: ON"
      : "Procedural: OFF";
    const updateOceanHudStatus = () => {
      if (!pendingOceanStatus || !devHud) {
        return;
      }
      if (typeof devHud.setOceanStatus === "function") {
        devHud.setOceanStatus(pendingOceanStatus);
        return;
      }
      if (typeof devHud.setStatusLine === "function") {
        const { seaLevel, bounds } = pendingOceanStatus;
        const levelIsFinite = Number.isFinite(seaLevel);
        const boundsAreValid =
          bounds &&
          ["west", "east", "north", "south"].every((key) =>
            Number.isFinite(bounds?.[key]),
          );
        if (!levelIsFinite || !boundsAreValid) {
          return;
        }
        const formatBound = (value) => Number(value).toFixed(1);
        const message = [
          `Sea level: ${Number(seaLevel).toFixed(2)}`,
          `Ocean bounds: W ${formatBound(bounds.west)} / E ${formatBound(
            bounds.east,
          )} / N ${formatBound(bounds.north)} / S ${formatBound(bounds.south)}`,
        ].join("\n");
        devHud.setStatusLine("sea", message);
      }
    };

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

    let fogEnabled = true;
    const onFogChange = (enabled) => {
      fogEnabled = enabled;
      const oceanMaterial = this.ocean?.mesh?.material;
      const fogUniform =
        this.ocean?.uniforms?.fog ?? oceanMaterial?.uniforms?.fog;
      if (
        fogUniform &&
        Object.prototype.hasOwnProperty.call(fogUniform, "value")
      ) {
        fogUniform.value = enabled;
      }
      if (oceanMaterial) {
        oceanMaterial.fog = enabled;
        oceanMaterial.needsUpdate = true;
      }
      const statusText = enabled ? "Fog: ON" : "Fog: OFF";
      this.devHud?.setStatusLine?.("fog", statusText);
      this.devHud?.updateFogState?.(enabled);
    };

    const sceneContext = createSceneContext({
      renderer,
      baseUrl: BASE_URL,
      worldRootName: WORLD_ROOT_NAME_LEGACY,
      onFogChange,
    });
    this.sceneContext = sceneContext;
    const {
      scene,
      camera,
      composer,
      bloomPass,
      renderFrame,
      refreshWorldRoot,
      setFogEnabled,
      toggleFog,
    } = sceneContext;
    setFogEnabled(true);

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

    // Sky & lighting
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
      },
    );
    let audioManifestMissing = false;
    await soundscape.loadManifest("audio/manifest.json").catch(() => {
      audioManifestMissing = true;
      console.info("[audio] No audio manifest found; running silently.");
    });
    await soundscape.initFromManifest("audio/manifest.json");
    await soundscape.ensureUserGestureResume();
    updateLoadingStatus("Sculpting the Attic landscape...");

    // Volume mixer overlay (F10 toggles visibility)
    const SHOW_AUDIO_MIXER = shouldShowOverlay({
      queryKey: "audio",
      windowFlagKey: "SHOW_AUDIO_MIXER",
    });
    if (SHOW_AUDIO_MIXER) {
      mountAudioMixer(soundscape);
    }

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
          return (
            v === null || v === "" || v === "1" || v === "true" || v === "on"
          );
        }
      } catch {}
      return !!(import.meta.env && import.meta.env.DEV);
    })();
    if (shouldAddOccluder) {
      const P1 = new THREE.Vector2(-0.4, -0.3);
      const P2 = new THREE.Vector2(-95.7, -3.1);
      addDepthOccluderRibbon(
        scene,
        terrain,
        P1,
        P2,
        6 /* width */,
        140 /* segments */,
      );
    }

    const currentSeaLevel = getSeaLevelY();
    const harborSampler = terrain?.userData?.getHeightAt;
    let sampledSeaLevel = currentSeaLevel;
    let harborSampleCount = 0;

    if (typeof harborSampler === "function") {
      const { west, east, north, south } = HARBOR_WATER_BOUNDS;
      const centerX = (west + east) * 0.5;
      const centerZ = (north + south) * 0.5;
      const width = Math.max(1, Math.abs(east - west));
      const depth = Math.max(1, Math.abs(south - north));
      const insetX = Math.min(width * 0.1, 4);
      const insetZ = Math.min(depth * 0.15, 6);
      const sampleWestX = west + insetX;
      const sampleEastX = east - insetX;
      const shorelineOffsets = [0, depth * 0.25, -depth * 0.25];

      const samplePoints = [
        { x: sampleWestX, z: centerZ },
        { x: sampleEastX, z: centerZ },
        { x: centerX, z: north + insetZ },
        { x: centerX, z: south - insetZ },
        { x: centerX, z: centerZ },
      ];

      for (const offset of shorelineOffsets) {
        samplePoints.push({ x: sampleEastX, z: centerZ + offset });
      }

      const samples = [];
      for (const point of samplePoints) {
        const height = harborSampler(point.x, point.z);
        if (Number.isFinite(height)) {
          samples.push(height);
        }
      }

      harborSampleCount = samples.length;
      if (samples.length >= 3) {
        samples.sort((a, b) => a - b);
        const trimmed =
          samples.length > 4 ? samples.slice(1, samples.length - 1) : samples;
        const total = trimmed.reduce((sum, value) => sum + value, 0);
        const average = total / trimmed.length;
        if (Number.isFinite(average)) {
          sampledSeaLevel = average;
        }
      }
    }

    if (
      Number.isFinite(sampledSeaLevel) &&
      Math.abs(sampledSeaLevel - currentSeaLevel) > 1e-3
    ) {
      const changed = setSeaLevelY(sampledSeaLevel, {
        reason: "harbor-sampling",
        samples: harborSampleCount,
      });
      if (changed && import.meta.env?.DEV) {
        console.assert(
          Math.abs(getSeaLevelY() - sampledSeaLevel) < 1e-6,
          "[seaLevel] mismatch after harbor sampling",
        );
      }
    } else if (import.meta.env?.DEV && harborSampleCount < 3) {
      console.info(
        `[seaLevel] Harbor sampling unavailable (samples=${harborSampleCount}); using fallback ${currentSeaLevel.toFixed(3)}`,
      );
    }

    const resolvedSeaLevel = getSeaLevelY();

    const grassEnabled =
      engineConfig.performance?.enableGrass ?? parseBooleanQuery("grass", false);

    ocean = await createOcean(scene, {
      bounds: HARBOR_WATER_BOUNDS,
      waterNormalsCandidates: HARBOR_WATER_NORMAL_CANDIDATES,
      seaLevel: resolvedSeaLevel,
      shoreBlendWidth: 4,
    });
    this.ocean = ocean;
    onFogChange(fogEnabled);
    pendingOceanStatus = {
      seaLevel: resolvedSeaLevel,
      bounds: HARBOR_WATER_BOUNDS,
    };
    this.pendingOceanStatus = pendingOceanStatus;
    updateOceanHudStatus();
    const harbor = createHarbor(scene, {
      center: HARBOR_CENTER_3D,
      seaLevel: resolvedSeaLevel,
    });
    const envCollider = new EnvironmentCollider();
    scene.add(envCollider.mesh);

    const worldRoot = refreshWorldRoot();

    let grassRoot = null;

    const roadsVisible =
      engineConfig.performance?.roadsVisible ?? parseBooleanQuery("roads", true);

    // Roads first (needs terrain sampler)
    const { group: roadGroup, curve: mainRoad } = createMainHillRoad(
      worldRoot,
      terrain,
    );
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

    if (!FORCE_PROC) {
      // --- Aristotle's Tomb (local GLB) ---------------------------------------
      // We prefer a local asset the repo expects at:
      //   public/models/landmarks/aristotle_tomb.glb
      // At runtime we try both the site base (for GitHub Pages) and root (for dev).
      // If found, we stream it via loadLandmark(); the loader will auto-raise it
      // ~5cm above ground and handle KTX2 texture support transparently.
      try {
        const aristotleUrl =
          await assetLoader.resolveFirstAvailableAsset(ARISTOTLE_CANDIDATES);
        if (aristotleUrl) {
          const aristotle = await loadLandmark(worldRoot, aristotleUrl, {
            position: ACROPOLIS_PEAK_3D,
            scale: 3.0,
            materialPreset: "marble",
          });
          try {
            await attachAristotleMarblePBR({
              obj: aristotle ?? null,
              scene,
              renderer,
              BASE_URL,
            });
          } catch (e) {
            console.warn("Aristotle PBR hook skipped:", e);
          }
        } else {
          console.warn(
            "Aristotle's Tomb not found. Expected at:",
            ARISTOTLE_CANDIDATES,
          );
        }
      } catch (err) {
        console.error("Failed to load Aristotle's Tomb:", err);
      }
      // ------------------------------------------------------------------------

      // Poseidon Temple (Sounion)
      try {
        const url =
          await assetLoader.resolveFirstAvailableAsset(POSEIDON_CANDIDATES);
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
        const url =
          await assetLoader.resolveFirstAvailableAsset(AKROPOL_CANDIDATES);
        if (url)
          await loadLandmark(worldRoot, url, {
            position: new THREE.Vector3(130, 0, 40),
            scale: 2.2,
            materialPreset: "marble",
          });
      } catch (e) {
        console.warn("Akropol not loaded:", e);
      }
      // ------------------------------------------------------------------------
    } else {
      console.info("[proc] GLB loading disabled (procedural default)");
    }

    // Plazas (agora + acropolis terraces) — disabled per request to remove large discs
    // createPlazas(worldRoot);

    const harborCity = await createCity(worldRoot, terrain, {
      roadsVisible,
      useProceduralBlocks: FORCE_PROCEDURAL_LANDMARKS,
      forceProcedural: FORCE_PROC,
      seaLevel: resolvedSeaLevel,
    });

    // Hill-city buildings (uses terrain sampler + road curve)
    const hillCity = createHillCity(worldRoot, terrain, mainRoad, {
      seed: 42,
      buildingCount: 140,
      foundationPadMaterial:
        harborCity?.userData?.foundationPadMaterial ?? null,
    });
    updateLoadingStatus("Raising temples, homes, and harbors...");

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
    const civicDistrict = await createCivicDistrict(worldRoot, {
      plazaLength: 90,
      promenadeWidth: 16,
      greensWidth: 9,
      center: AGORA_CENTER_3D,
      terrain,
    });

    createHarborDecorations(worldRoot, {
      harborCity,
      terrain,
      seaLevel: resolvedSeaLevel,
    });

    // Overlay the modern planning strategy as a holographic layer so players can
    // understand how each district connects to the wider mobility, housing, and
    // resilience goals described in the documentation.
    createCityPlanImplementation(worldRoot, {
      center: AGORA_CENTER_3D,
      terrain,
      transitLength: 160,
      innovationOffsetX: 60,
    });

    // Rebuild the collider again now that the civic district geometry exists so the
    // player can stand on the new plazas instead of falling through them.
    envCollider.refresh();

    const input = new InputMap(renderer.domElement);
    const player = new PlayerController(input, envCollider, {
      camera,
      terrainHeightSampler: terrain?.userData?.getHeightAt ?? null,
    });
    worldRoot.add(player.object);

    const spawnPosition = findSafePlayerSpawn({
      envCollider,
      terrain,
      searchCenter: AGORA_CENTER_3D,
      fallback: AGORA_CENTER_3D,
      playerHeight: player.height,
      playerRadius: player.radius,
      verticalClearance: 0.2,
      seaLevel: resolvedSeaLevel,
    });
    player.object.position.copy(spawnPosition);
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

    const thirdPersonTargetOffset = new THREE.Vector3(
      0,
      player.height * 0.6,
      0,
    );

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
      thirdPersonPointerState.pendingUse =
        event.button === 0 || event.pointerType === "touch";

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

      if (
        Math.abs(deltaX) > DRAG_THRESHOLD ||
        Math.abs(deltaY) > DRAG_THRESHOLD
      ) {
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
      viewCanvas.addEventListener(
        "lostpointercapture",
        onThirdPersonPointerCancel,
      );
      window.addEventListener("blur", onThirdPersonPointerCancel);
    };

    const detachThirdPersonPointer = () => {
      if (!thirdPersonHandlersAttached) return;
      thirdPersonHandlersAttached = false;
      viewCanvas.removeEventListener("pointerdown", onThirdPersonPointerDown);
      viewCanvas.removeEventListener("pointermove", onThirdPersonPointerMove);
      viewCanvas.removeEventListener("pointerup", onThirdPersonPointerUp);
      viewCanvas.removeEventListener(
        "pointercancel",
        onThirdPersonPointerCancel,
      );
      viewCanvas.removeEventListener(
        "lostpointercapture",
        onThirdPersonPointerCancel,
      );
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
        thirdPersonCamera.setAngles(
          player.cameraYaw ?? 0,
          player.cameraPitch ?? 0,
          {
            snap: true,
          },
        );
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
        thirdPersonCamera.setAngles(
          player.cameraYaw ?? 0,
          player.cameraPitch ?? 0,
          {
            snap: true,
          },
        );
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
    queueSceneInteractable(scene, doorPivot);

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
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 16, 16),
      bulbMaterial,
    );
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
    queueSceneInteractable(scene, lamp);

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
        bodyMaterial,
      );
      body.castShadow = true;
      body.receiveShadow = true;
      body.position.y = 0.6;
      group.add(body);

      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xf4f7ff, roughness: 0.4 }),
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
        (child) => child.name === "FallbackAvatar",
      );
      if (fallbackAvatar) {
        disposeObject(fallbackAvatar);
        player.object.remove(fallbackAvatar);
      }
    };

    const character = new Character();
    const heroRootPath = "models/character/hero.glb";
    const bundledHeroName = encodeURIComponent("astronaut.glb");
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
        [heroRootPath, bundledHeroPath, bundledHeroRootPath].filter(Boolean),
      ),
    );

    try {
      const heroLoader = createGLTFLoader(renderer);
      const loadedHero = await loadGLBWithFallbacks(
        heroLoader,
        heroCandidates,
        {
          renderer,
          targetHeight: 1.8,
        },
      );

      if (!loadedHero || !loadedHero.root) {
        throw new Error("No hero GLB candidates reachable");
      }

      const { url, gltf, root } = loadedHero;

      removeExistingAvatar();
      character.initializeFromGLTF(root, gltf.animations);
      player.attachCharacter(character);

      if (url !== heroRootPath) {
        console.info(
          `Hero GLB not found at ${joinPath(BASE_URL, "models/character/hero.glb")}; using bundled astronaut sample from ${url}.`,
        );
      }
      console.log("[Hero] Loaded:", url);
      console.log(
        "[Hero] Expected primary path:",
        joinPath(BASE_URL, "models/character/hero.glb"),
      );
    } catch (error) {
      console.error(
        `[Hero] All candidates failed, using fallback avatar:`,
        error?.message || error,
      );
      console.info(
        `Add your own hero model at ${joinPath(
          BASE_URL,
          "models/character/hero.glb",
        )}; the bundled astronaut sample will load otherwise.`,
      );
      attachFallbackAvatar();
    }
    updateLoadingStatus("Welcoming Athenians to the city...");

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
        roughnessMap:
          textureOverrides.roughnessMap ?? generatedTextures.roughnessMap,
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
        typeof baseMaterial.roughness === "number"
          ? baseMaterial.roughness
          : 0.45;
      const baseMetalness =
        typeof baseMaterial.metalness === "number"
          ? baseMaterial.metalness
          : 0.05;

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
            roughness:
              options.accentRoughness ?? Math.max(0, baseRoughness - 0.05),
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
          48,
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
        48,
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
        1,
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
        48,
      );
      geometries.push(capitalGeometry);
      const capital = new THREE.Mesh(capitalGeometry, accentMaterial);
      applySharedProps(capital);
      const capitalHeight =
        capitalGeometry.parameters?.height ?? capHeight * 0.55;
      capital.position.y = heightCursor + capitalHeight / 2;
      heightCursor += capitalHeight;
      monument.add(capital);

      const capTopHeight = capHeight * 0.75;
      const capTopGeometry = new THREE.ConeGeometry(
        baseRadius * 1.05,
        capTopHeight,
        48,
        1,
        false,
      );
      geometries.push(capTopGeometry);
      const capTop = new THREE.Mesh(capTopGeometry, baseMaterial);
      applySharedProps(capTop);
      capTop.position.y = heightCursor + capTopHeight / 2;
      heightCursor += capTopHeight;
      monument.add(capTop);

      const finialGeometry = new THREE.SphereGeometry(
        baseRadius * 0.22,
        24,
        16,
      );
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
        }),
      );
      occlusionRing.rotation.x = -Math.PI / 2;
      occlusionRing.position.y = 0.015;
      occlusionRing.renderOrder = 1;
      occlusionRing.castShadow = false;
      occlusionRing.receiveShadow = false;
      occlusionRing.userData.noCollision = true;
      monument.add(occlusionRing);

      const keyLight = new THREE.SpotLight(
        0xfff0d8,
        1.15,
        42,
        Math.PI / 5,
        0.35,
        1.2,
      );
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
        seaLevel: resolvedSeaLevel,
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
        scale: 1,
        collision: true,
        name: "SamplePoseidonTemple",
      },
      {
        url: joinPath(BASE_URL, "models/landmarks/akropol.glb"),
        position: createTerrainAlignedPosition(6, -42),
        rotateY: Math.PI * 0.08,
        scale: 1,
        collision: false,
        name: "SampleAkropol",
      },
    ];

    if (!FORCE_PROC) {
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
            }),
        ),
      );

      sampleBuildingResults.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            `Sample building failed to load: ${sampleBuildingSpecs[index].url}`,
            result.reason,
          );
        }
      });
    } else {
      console.info(
        "[proc] Skipping GLB sample buildings; using procedural city fill.",
      );
    }

    const landmarkManager = new LandmarkManager({
      scene: worldRoot,
      parent: buildingsRoot,
      terrain,
      heightSampler: terrainHeightSampler,
      envCollider,
      renderer,
      forceProcedural: FORCE_PROC,
      activeScenes: ["harbor"],
      spawnPlaceholder: (options = {}) =>
        spawnPlaceholderMonument({
          ...options,
          parent: options.parent ?? buildingsRoot,
        }),
      quietMissing: true,
    });

    let configToLoad = athensLayoutConfig;
    if (FORCE_PROCEDURAL_LANDMARKS) {
      console.log("[proc] Forcing procedural landmarks.");
      configToLoad = {
        metadata: { description: "Procedural development layout" },
        groups: [
          {
            id: "procedural-dev",
            label: "Procedural Dev",
            landmarks: [
              {
                id: "proc-temple-alpha",
                name: "Procedural Temple Alpha",
                type: "procedural",
                proc: "temple",
                params: {
                  width: 22,
                  depth: 42,
                  colX: 6,
                  colZ: 13,
                  materialPreset: "marble",
                },
                placement: {
                  position: createTerrainAlignedPosition(-34, -12),
                  rotateY: -Math.PI * 0.12,
                },
                collision: true,
              },
              {
                id: "proc-temple-beta",
                name: "Procedural Temple Beta",
                type: "procedural",
                proc: "temple",
                scale: 0.92,
                params: {
                  width: 18,
                  depth: 32,
                  colX: 5,
                  colZ: 11,
                  materialPreset: "marble",
                },
                placement: {
                  position: createTerrainAlignedPosition(6, -42),
                  rotateY: Math.PI * 0.08,
                },
                collision: true,
              },
            ],
          },
        ],
      };
    }

    let landmarkResults = [];
    try {
      landmarkResults = await landmarkManager.loadConfig(configToLoad);
    } catch (error) {
      console.error("[LandmarkManager] Failed to load Athens layout", error);
    }

    proceduralLandmarkCount = landmarkResults.filter(
      (entry) => entry?.object?.userData?.proceduralType,
    ).length;

    if (FORCE_PROCEDURAL_LANDMARKS) {
      console.log(
        `[proc] Placed ${proceduralLandmarkCount} procedural landmarks.`,
      );
    }

    interactor = createInteractor(renderer, camera, scene);

    if (thirdPersonCamera) {
      setThirdPersonEnabled(USE_THIRD_PERSON);
    }

    // Texture budget safe mode.
    applyTextureBudgetToObject(scene, { safeMode: true });

    const loop = this.gameLoop;
    // Slow the sun/moon orbit so each in-game day lasts 20 real minutes by default.
    const dayCycle = startTimeOfDayCycle(lightingConfig.cycle || {});
    const timeOfDayState = { timeOfDayPhase: 0 };
    setTimeOfDayPhase(timeOfDayState, 0);

    const applyLightingPreset = (presetName) => {
      const preset = LIGHTING_PRESETS[presetName];
      if (!preset) return;

      const phase = setTimeOfDayPhase(timeOfDayState, preset.phase);
      renderer.toneMappingExposure = preset.exposure;
      console.log(`[HUD] preset: ${presetName}`);

      const sunDir = getSunDirection(timeOfDayState);
      updateLighting(lights, sunDir);

      // Explicitly update sky preset on manual change
      updateSky(scene, presetName);

      updateHarborLighting(harbor, lights.nightFactor);
      updateCityLighting(harborCity, lights.nightFactor, {
        timeOfDayPhase: phase,
      });
      updateCityLighting(hillCity, lights.nightFactor, {
        timeOfDayPhase: phase,
      });
      updateMainHillRoadLighting(roadGroup, lights.nightFactor);
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

      renderFrame();
    };

    const onFrame = (deltaTime, elapsed) => {
      // Keep track of time for smooth animation and frame-independent movement.
      if (dayCycle.secondsPerDay > 0) {
        const deltaPhase = deltaTime / dayCycle.secondsPerDay;
        const nextPhase = (timeOfDayState.timeOfDayPhase ?? 0) + deltaPhase;
        const wrappedPhase = nextPhase - Math.floor(nextPhase);
        setTimeOfDayPhase(timeOfDayState, wrappedPhase);
      }

      const phase = timeOfDayState.timeOfDayPhase ?? 0;
      timeOfDayState.elapsedSeconds = elapsed;
      const sunDir = getSunDirection(timeOfDayState);

      // Update sky dome and atmospheric lighting each frame.
      updateLighting(lights, sunDir);
      updateHarborLighting(harbor, lights.nightFactor);
      updateCityLighting(harborCity, lights.nightFactor, {
        timeOfDayPhase: phase,
      });
      updateCityLighting(hillCity, lights.nightFactor, {
        timeOfDayPhase: phase,
      });
      updateMainHillRoadLighting(roadGroup, lights.nightFactor);
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

      renderFrame();
    };

    loop.onUpdate(onFrame);
    loop.start();
    updateLoadingStatus("Opening the gates to ancient Athens...");
    hideLoadingScreen();

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
    devHud = mountDevHUD({
      getPosition,
      getDirection,
      onPin,
      onSetLightingPreset: applyLightingPreset,
      lightingPresets: LIGHTING_PRESETS,
      getFogEnabled: () => fogEnabled,
      onToggleFog: toggleFog,
    });
    this.devHud = devHud;
    mountMiniMap({ getPosition, getDirection });
    proceduralStatusMessage = FORCE_PROC ? "Procedural: ON" : "Procedural: OFF";
    devHud?.setStatusLine?.(
      "proc",
      FORCE_PROC ? "Procedural: ON" : "Procedural: OFF",
    );
    onFogChange(fogEnabled);
    mountHUDCameraSettings(devHud?.rootElement ?? null);
    updateOceanHudStatus();
    if (audioManifestMissing) {
      devHud?.setStatusLine?.("audio", "Audio: Off (no manifest)");
    }
    if (devHud?.setStatusLine) {
      devHud.setStatusLine(
        "proc",
        FORCE_PROC ? "Procedural: ON" : "Procedural: OFF",
      );
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
      } else if (event.code === "KeyG" && !event.repeat) {
        toggleFog();
      } else if (event.code === "F8" && !event.repeat) {
        const position = player?.object?.position;
        const x = position?.x;
        const z = position?.z;
        if (Number.isFinite(x) && Number.isFinite(z)) {
          const result = probeAt(x, z);
          console.table({ x, z, ...result });
        } else {
          console.warn("[probe] Player position unavailable", position);
        }
      }
    });

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      bloomPass.setSize(window.innerWidth, window.innerHeight);
    });
  }
}
