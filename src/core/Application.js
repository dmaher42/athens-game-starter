import * as THREE from "three";
import { Soundscape } from "../audio/soundscape.js";
import { mountAudioMixer } from "../ui/audioMixer.ts";
import { createSky, updateSky, getSunDirection, setTimeOfDayPhase } from "../world/sky.js";
import { createLighting, updateLighting } from "../world/lighting.js";
import { azElToDirection, applySunAlignment } from "../world/lighting/sunAlignment.js";
import {
  createInteractor,
  queueSceneInteractable,
} from "../world/interactions.js";
import { attachCrosshair } from "../world/ui/crosshair.js";
import {
  createTerrain,
  updateTerrain,
  updateTerrainCoverageMask,
} from "../world/terrain.js";
import { createHorizon } from "../world/horizon.js";
import { createShorelineTermination } from "../world/shoreTermination.js";
import { createOcean, updateOcean } from "../world/ocean.js";
import { createWorldFloorCap, applyKillPlane } from "../world/worldBounds.js";
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
  HARBOR_WATER_CENTER,
  HARBOR_WATER_EAST_LIMIT,
  HARBOR_WATER_NORMAL_CANDIDATES,
  MAIN_ROAD_WIDTH,
  getSeaLevelY,
  setSeaLevelY,
} from "../world/locations.js";
import {
  initializeAssetTranscoders,
  loadLandmark,
  disposeLandmarks,
} from "../world/landmarks.js";
import { createCivicDistrict } from "../world/cityPlan.js";
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
import { QuestHud } from "../ui/questHud.ts";
import { InteractionHud } from "../ui/interactionHud.ts";
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
import { skyboxLightingConfig } from "../config/skyboxLightingConfig.js";
import { CollectiblesManager } from "../world/collectibles.js";
import { QuestManager, QuestStatus } from "../state/QuestManager.js";
import { InteractionSystem } from "../interactions/InteractionSystem.js";
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
import { VillagerSystem } from "../world/traffic.js";
import { createAtmosphericParticles } from "../world/particles.js";
import { scatterGroundProps } from "../world/groundProps.js";
import {
  disposeSkybox,
  loadEquirectangularSkybox,
} from "../world/skybox/SkyboxManager.js";
import { createSkyDome } from "../world/skybox/SkyDome.js";

console.info("[build]", engineConfig.build || {});

const DEFAULT_BASE_URL = engineConfig.baseUrl ?? resolveBaseUrl();
const DEFAULT_DISTRICT_RULE_URL_CANDIDATES =
  engineConfig.districtRuleCandidates || [];

const WORLD_ROOT_NAME_LEGACY = WORLD_ROOT_NAME;

const LIGHTING_PRESETS = lightingConfig.presets || {};
const SUN_AZIMUTH_STORAGE_KEY = "skybox.sunAzimuthDeg";
const SUN_ELEVATION_STORAGE_KEY = "skybox.sunElevationDeg";

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

const HARBOUR_CENTER = new THREE.Vector3(-120, 0, 80);
const HARBOUR_RADIUS = 60;
const SEA_LEVEL = 0.0;

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

function syncFogToSky(scene, radius) {
  if (!scene) return;
  const getFogOptions = scene.userData?.getFogOptions;
  const setFogOptions = scene.userData?.setFogOptions;
  if (typeof setFogOptions !== "function") return;

  const fogState = typeof getFogOptions === "function" ? getFogOptions() : null;
  const skySettings = scene.userData?.sky?.settings;
  const horizonColor = skySettings?.horizon
    ? new THREE.Color(skySettings.horizon)
    : fogState?.color ?? new THREE.Color(0xbfd5ff);

  const fogNear = Math.max(140, Math.min(fogState?.near ?? 200, 260));
  const fogFar = Math.max(
    fogNear + 420,
    Math.min(radius * 0.92, fogState?.far ?? radius * 0.92),
  );

  setFogOptions({
    color: horizonColor,
    near: fogNear,
    far: fogFar,
  });
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
    this.shoreTermination = null;
    this.skyboxTexture = null;
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

    const readStoredNumber = (key, fallback) => {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          const value = Number(window.localStorage.getItem(key));
          if (Number.isFinite(value)) return value;
        }
      } catch (error) {
        console.warn(`[storage] Unable to read ${key}`, error);
      }
      return fallback;
    };

    const writeStoredNumber = (key, value) => {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, String(value));
        }
      } catch (error) {
        console.warn(`[storage] Unable to persist ${key}`, error);
      }
    };

    const clampElevation = (deg) => Math.max(0, Math.min(90, Number(deg) || 0));
    const wrapAzimuth = (deg) => {
      const value = Number(deg) || 0;
      const wrapped = value % 360;
      return wrapped < 0 ? wrapped + 360 : wrapped;
    };

    const sunTargetVector = new THREE.Vector3(
      skyboxLightingConfig.sunTarget?.x ?? 0,
      skyboxLightingConfig.sunTarget?.y ?? 0,
      skyboxLightingConfig.sunTarget?.z ?? 0,
    );
    const sunDistance = Number.isFinite(skyboxLightingConfig.sunDistance)
      ? skyboxLightingConfig.sunDistance
      : 1000;
    const sunAlignmentState = {
      azimuthDeg: wrapAzimuth(
        readStoredNumber(
          SUN_AZIMUTH_STORAGE_KEY,
          skyboxLightingConfig.sunAzimuthDeg,
        ),
      ),
      elevationDeg: clampElevation(
        readStoredNumber(
          SUN_ELEVATION_STORAGE_KEY,
          skyboxLightingConfig.sunElevationDeg,
        ),
      ),
    };

    this.renderer = createRenderer();
    const renderer = this.renderer;

    // Cap pixel ratio to 1.5 to save massive amounts of VRAM on Retina screens
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
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
      colorGradePass,
      renderFrame,
      refreshWorldRoot,
      setFogEnabled,
      toggleFog,
    } = sceneContext;
    this.scene = scene;
    setFogEnabled(true);

    const colorGradeUniforms = colorGradePass?.material?.uniforms || null;
    const defaultColorGradeSettings = colorGradeUniforms
      ? {
          contrastStrength: colorGradeUniforms.contrastStrength.value,
          saturationBoost: colorGradeUniforms.saturationBoost.value,
          shadowTint: colorGradeUniforms.shadowTint.value.clone(),
          midTint: colorGradeUniforms.midTint.value.clone(),
          highlightTint: colorGradeUniforms.highlightTint.value.clone(),
        }
      : null;

    const DEFAULT_ENV_INTENSITY = 1;

    const normalizeColorInput = (value) => {
      if (value instanceof THREE.Color) return value;
      if (value instanceof THREE.Vector3)
        return new THREE.Color(value.x, value.y, value.z);
      return new THREE.Color(value);
    };

    const applyColorGradeSettings = (overrides = {}) => {
      if (!colorGradeUniforms || !defaultColorGradeSettings) return;

      const merged = { ...defaultColorGradeSettings, ...overrides };
      const setTint = (key, value) => {
        if (!value || !colorGradeUniforms[key]?.value) return;
        const color = normalizeColorInput(value);
        colorGradeUniforms[key].value.set(color.r, color.g, color.b);
      };

      if (Number.isFinite(merged.contrastStrength)) {
        colorGradeUniforms.contrastStrength.value = merged.contrastStrength;
      }
      if (Number.isFinite(merged.saturationBoost)) {
        colorGradeUniforms.saturationBoost.value = merged.saturationBoost;
      }

      setTint("shadowTint", merged.shadowTint);
      setTint("midTint", merged.midTint);
      setTint("highlightTint", merged.highlightTint);
    };

    const applyEnvironmentIntensity = (intensity) => {
      const target = Number.isFinite(intensity)
        ? Math.max(0, intensity)
        : DEFAULT_ENV_INTENSITY;

      const applyToMaterial = (material) => {
        if (!material || typeof material !== "object") return;
        if (Array.isArray(material)) {
          material.forEach(applyToMaterial);
          return;
        }

        if ("envMapIntensity" in material) {
          material.envMapIntensity = target;
          material.needsUpdate = true;
        }
      };

      scene?.traverse((child) => {
        if (!child?.isMesh) return;
        applyToMaterial(child.material);
      });

      scene.userData.environmentIntensity = target;
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

    // Sky & lighting
    const skyObj = createSky(scene);
    const lights = createLighting(scene);

    const normalizedSkyboxPath = (skyboxLightingConfig.skyboxUrl || "")
      .toString()
      .replace(/^\/+/, "");
    const resolvedSkyboxUrl = joinPath(BASE_URL, normalizedSkyboxPath);
    const USE_SKY_DOME = true;

    try {
      const texture = await loadEquirectangularSkybox(
        renderer,
        scene,
        resolvedSkyboxUrl,
      );
      this.skyboxTexture = texture;
      if (skyObj?.mesh) {
        skyObj.mesh.visible = false;
      }
      if (USE_SKY_DOME && texture) {
        scene.background = null;
        const skyDome = createSkyDome(texture, 2500);
        scene.add(skyDome);
        scene.userData.skyDome = skyDome;
      }
      scene.environment = texture;
    } catch (error) {
      console.warn(
        `[skybox] Failed to load equirectangular skybox. Ensure the asset exists at ${resolvedSkyboxUrl}`,
        error,
      );
    }

    const alignSunLight = () =>
      applySunAlignment(
        lights.sunLight,
        sunTargetVector,
        sunAlignmentState.azimuthDeg,
        sunAlignmentState.elevationDeg,
        sunDistance,
      );

    alignSunLight();
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
    this.terrain = terrain;
    const terrainSize = terrain?.geometry?.userData?.size;

    const seaLevel = getSeaLevelY();
    const oceanRadius = 1800;
    const horizonColor = 0x2a3f5c;
    const shorelineInnerRadius = Math.max(
      Number.isFinite(terrainSize) ? terrainSize * 0.5 + 25 : 0,
      220,
    );

    // --- Horizon & Ocean ---
    if (!this.horizon) {
      this.horizon = createHorizon(this.scene, {
        seaLevel,
        radius: oceanRadius,
        fadeWidth: 320,
        horizonColor,
      });
    }
    if (!this.ocean) {
      this.ocean = await createOcean(this.scene, {
        seaLevel,
        radius: oceanRadius,
        horizonOffset: 0,
        waterColor: 0x006b7c,
      });
      if (this.ocean) this.ocean.scale.set(1, 1, 1);
    }
    if (!this.shoreTermination) {
      this.shoreTermination = createShorelineTermination(this.scene, {
        seaLevel,
        innerRadius: shorelineInnerRadius,
        bandWidth: 150,
        oceanRadius,
        horizonColor,
      });
    }
    if (!this.worldFloorCap) {
      this.worldFloorCap = createWorldFloorCap(this.scene, {
        seaLevel,
        radius: oceanRadius,
        depth: 160,
      });
    }
    syncFogToSky(scene, oceanRadius);
    if (!this.killPlane) {
      this.killPlane = applyKillPlane(this.renderer, seaLevel - 75);
    }
    ocean = this.ocean;
    // -----------------------
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

    const currentSeaLevel = seaLevel;
    const harborSampler = null;
    let sampledSeaLevel = currentSeaLevel;
    let harborSampleCount = 0;
    let harbor = null;

    harbor = createHarbor(scene);

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

    if (!ocean) {
      ocean = await createOcean(scene, {
        bounds: HARBOR_WATER_BOUNDS,
        waterNormalsCandidates: HARBOR_WATER_NORMAL_CANDIDATES,
        seaLevel: resolvedSeaLevel,
        shoreBlendWidth: 4,
      });
    }
    this.ocean = ocean;
    onFogChange(fogEnabled);
    pendingOceanStatus = {
      seaLevel: resolvedSeaLevel,
      bounds: HARBOR_WATER_BOUNDS,
    };
    this.pendingOceanStatus = pendingOceanStatus;
    updateOceanHudStatus();
    const envCollider = new EnvironmentCollider();
    scene.add(envCollider.mesh);

    const worldRoot = refreshWorldRoot();
    worldRoot.add(terrain);

    let grassRoot = null;
    let villagerSystem = null;
    let atmosphericParticles = null;

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

    const { city: harborCity, roadCurves } = await createCity(
      worldRoot,
      this.terrain,
      {
        roadsVisible,
        useProceduralBlocks: FORCE_PROCEDURAL_LANDMARKS,
        forceProcedural: FORCE_PROC,
        seaLevel: resolvedSeaLevel,
      },
    );

    if (roadCurves && roadCurves.length > 0) {
      villagerSystem = new VillagerSystem(scene, terrain);
      scene.userData = scene.userData || {};
      scene.userData.villagerSystem = villagerSystem;
    }

    // Hill-city buildings (uses terrain sampler + road curve)
    const hillCity = await createHillCity(worldRoot, terrain, mainRoad, {
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

    updateTerrainCoverageMask(terrain, {
      buildingPlacements: harborCity?.userData?.buildingPlacements ?? [],
      roadCurves: roadCurves ?? [],
      mainRoadCurve: mainRoad ?? null,
      mainRoadWidth: MAIN_ROAD_WIDTH,
      roadWidth: 3.2,
    });

    scatterGroundProps(worldRoot, terrain, {
      buildingPlacements: harborCity?.userData?.buildingPlacements ?? [],
      roadCurves: roadCurves ?? [],
      mainRoadCurve: mainRoad ?? null,
      roadPadding: MAIN_ROAD_WIDTH * 0.7,
      seaLevel: resolvedSeaLevel,
    });

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

    // Rebuild the collider again now that the civic district geometry exists so the
    // player can stand on the new plazas instead of falling through them.
    envCollider.refresh();

    // 1. Setup UI for Score
    const scoreContainer = document.createElement("div");
    Object.assign(scoreContainer.style, {
      position: "fixed",
      top: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(0, 0, 0, 0.6)",
      color: "#ffd700", // Gold text
      padding: "10px 20px",
      borderRadius: "20px",
      fontFamily: "serif",
      fontSize: "24px",
      fontWeight: "bold",
      border: "2px solid #ffd700",
      pointerEvents: "none",
      textShadow: "0px 2px 4px black",
      display: "none" // Hiding scroll score to de-clutter for quest system
    });
    scoreContainer.innerText = "Scrolls Found: 0 / 0";
    document.body.appendChild(scoreContainer);

    // 2. Initialize Collectibles
    const collectibles = new CollectiblesManager(worldRoot);

    // Update UI callback
    collectibles.onScoreChange = (score, total) => {
      scoreContainer.innerText = `Scrolls Found: ${score} / ${total}`;
      if (score === total) {
        scoreContainer.innerText = "ALL WISDOM COLLECTED!";
        scoreContainer.style.color = "#aaffaa"; // Green
        scoreContainer.style.borderColor = "#aaffaa";
      }
    };

    // 3. Spawn Scrolls at Landmarks (Guaranteed finds)
    collectibles.spawnAt(AGORA_CENTER_3D.x, AGORA_CENTER_3D.y, AGORA_CENTER_3D.z);
    collectibles.spawnAt(ACROPOLIS_PEAK_3D.x, ACROPOLIS_PEAK_3D.y, ACROPOLIS_PEAK_3D.z);
    collectibles.spawnAt(HARBOR_CENTER_3D.x, HARBOR_CENTER_3D.y, HARBOR_CENTER_3D.z);

    // 4. Spawn Random Scrolls around the city
    // Use the city radius we defined in locations.js
    collectibles.spawnRandomly(terrain, 12, AGORA_CENTER_3D, CITY_AREA_RADIUS * 0.8);

    // Trigger initial UI update
    collectibles.onScoreChange(0, collectibles.total);

    const input = new InputMap(renderer.domElement);
    const player = new PlayerController(input, envCollider, {
      camera,
      terrainHeightSampler: terrain?.userData?.getHeightAt ?? null,
    });
    worldRoot.add(player.object);

    let playerMovementEnabled = true;
    const setPlayerMovementEnabled = (enabled) => {
      playerMovementEnabled = !!enabled;
      if (!playerMovementEnabled) {
        player.velocity.set(0, 0, 0);
        player.desired.set(0, 0, 0);
      }
    };

    const spawnPosition = findSafePlayerSpawn({
      envCollider,
      terrain,
      searchCenter: AGORA_CENTER_3D,
      fallback: AGORA_CENTER_3D,
      playerHeight: player.height,
      playerRadius: player.radius,
      verticalClearance: 3.0,
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

    // === QUEST SYSTEM INIT ===
    const questManager = new QuestManager();
    const questHud = new QuestHud(questManager);
    const interactionHud = new InteractionHud();
    const interactionSystem = new InteractionSystem(input, camera, scene, interactionHud);

    const dialogueOverlay = document.createElement("div");
    Object.assign(dialogueOverlay.style, {
      position: "fixed",
      bottom: "40px",
      left: "50%",
      transform: "translateX(-50%)",
      padding: "16px 20px",
      maxWidth: "560px",
      background: "rgba(0, 0, 0, 0.8)",
      color: "#f4f4f4",
      borderRadius: "12px",
      fontFamily: "Georgia, serif",
      fontSize: "16px",
      lineHeight: "1.4",
      border: "1px solid rgba(255, 215, 160, 0.6)",
      display: "none",
      zIndex: 2000,
      cursor: "pointer",
      textAlign: "center",
      boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
    });
    document.body.appendChild(dialogueOverlay);

    let dialogueActive = false;
    const waitForAdvance = () =>
      new Promise((resolve) => {
        const cleanup = () => {
          window.removeEventListener("keydown", onKey);
          dialogueOverlay.removeEventListener("click", onClick);
          resolve();
        };

        const onKey = (event) => {
          if (event.code === "Space" || event.code === "Enter") {
            cleanup();
          }
        };

        const onClick = () => cleanup();

        window.addEventListener("keydown", onKey);
        dialogueOverlay.addEventListener("click", onClick);
      });

    const runDialogueSequence = async (title, lines = []) => {
      if (dialogueActive || !Array.isArray(lines) || lines.length === 0) return;

      dialogueActive = true;
      setPlayerMovementEnabled(false);
      interactionHud.hide();

      for (const line of lines) {
        dialogueOverlay.innerHTML = `<strong>${title}</strong><br/>${line}<br/><small>(Press Space/Enter or click to continue)</small>`;
        dialogueOverlay.style.display = "block";
        await waitForAdvance();
      }

      dialogueOverlay.style.display = "none";
      setPlayerMovementEnabled(true);
      dialogueActive = false;
    };

    // === QUEST ACTORS ===
    const templeNpcGroup = new THREE.Group();
    templeNpcGroup.name = "TempleNPC_QuestGiver";

    const npcBodyMat = new THREE.MeshStandardMaterial({
      color: 0x4e8ef7,
      roughness: 0.7,
    });
    const npcBody = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.35, 1.1, 4, 16),
      npcBodyMat,
    );
    npcBody.position.y = 1.1 / 2 + 0.35;
    npcBody.castShadow = true;
    templeNpcGroup.add(npcBody);

    const npcHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xeacdad }),
    );
    npcHead.position.y = 1.5;
    npcHead.castShadow = true;
    templeNpcGroup.add(npcHead);

    const templePos = ACROPOLIS_PEAK_3D.clone().add(new THREE.Vector3(5, 0, 5));
    const templeY =
      terrain?.userData?.getHeightAt?.(templePos.x, templePos.z) ?? templePos.y;
    templeNpcGroup.position.set(templePos.x, templeY + 0.05, templePos.z);

    worldRoot.add(templeNpcGroup);

    const dockhand = new THREE.Group();
    dockhand.name = "HarbourDockhand_NPC";
    const dockhandBody = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.3, 1.0, 4, 12),
      new THREE.MeshStandardMaterial({ color: 0x9c7955, roughness: 0.8 }),
    );
    dockhandBody.position.y = 0.95;
    dockhandBody.castShadow = true;
    dockhand.add(dockhandBody);

    const dockhandHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xd9c4a1 }),
    );
    dockhandHead.position.y = 1.5;
    dockhandHead.castShadow = true;
    dockhand.add(dockhandHead);

    const dockhandPosition = new THREE.Vector3(
      HARBOR_WATER_EAST_LIMIT + 6.0,
      seaLevel,
      HARBOR_WATER_CENTER.z - 2.0,
    );
    const dockhandY =
      terrain?.userData?.getHeightAt?.(dockhandPosition.x, dockhandPosition.z) ??
      getSeaLevelY();
    dockhand.position.set(
      dockhandPosition.x,
      dockhandY + 0.05,
      dockhandPosition.z,
    );
    worldRoot.add(dockhand);

    const crateGroup = new THREE.Group();
    crateGroup.name = "HarbourQuestCrate";
    const crateGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const crateMat = new THREE.MeshStandardMaterial({
      color: 0x8d6b45,
      roughness: 0.9,
    });
    const crateMesh = new THREE.Mesh(crateGeo, crateMat);
    crateMesh.castShadow = true;
    crateMesh.receiveShadow = true;
    crateMesh.position.y = 0.45;
    crateGroup.add(crateMesh);

    // Place on the harbor shoreline alongside the pier rows.
    const cratePosition = new THREE.Vector3(
      HARBOR_WATER_EAST_LIMIT + 10.0,
      seaLevel,
      HARBOR_WATER_CENTER.z - 2.0,
    );
    const harborY =
      terrain?.userData?.getHeightAt?.(cratePosition.x, cratePosition.z) ?? getSeaLevelY();
    crateGroup.position.set(
      cratePosition.x,
      harborY + 0.05,
      cratePosition.z,
    );

    worldRoot.add(crateGroup);

    let dockhandBriefed = false;
    let crateInspected = false;

    const handleTempleInteract = () => {
      const status = questManager.currentQuest.status;
      if (status === QuestStatus.NOT_STARTED) {
        questManager.startQuest(
          "Harbour Errand",
          "Meet the dockhand by the harbour.",
        );
        templeNpcGroup.userData.interactable.label = "Ask about the dockhand";
      } else if (status === QuestStatus.COMPLETED) {
        runDialogueSequence("Temple Keeper", [
          "You found the crate? The harbour folk will rest easier tonight.",
        ]);
      } else {
        runDialogueSequence("Temple Keeper", [
          "The dockhand is waiting on the harbour quay.",
        ]);
      }
    };

    templeNpcGroup.userData.onInteract = handleTempleInteract;
    interactionSystem.register(templeNpcGroup, {
      label: "Talk to Temple Keeper",
      distance: 4.0,
      onInteract: handleTempleInteract,
    });

    const handleDockhandInteract = async () => {
      if (questManager.currentQuest.status !== QuestStatus.IN_PROGRESS) {
        await runDialogueSequence("Dockhand", [
          "I've work to do. Orders come from the temple today.",
        ]);
        return;
      }

      if (dockhandBriefed) {
        await runDialogueSequence("Dockhand", [
          "The crate is still marked. Inspect it and let me know it's secure.",
        ]);
        return;
      }

      await runDialogueSequence("Dockhand", [
        "So you're the one from the temple? We've had eyes on a suspicious crate.",
        "It's waiting on the dock. Give it a look and make sure nothing's amiss.",
      ]);

      dockhandBriefed = true;
      questManager.updateObjective("Inspect the marked crate");
      dockhand.userData.interactable.label = "Dockhand (waiting)";
    };

    dockhand.userData.onInteract = handleDockhandInteract;
    interactionSystem.register(dockhand, {
      label: "Talk to Dockhand",
      distance: 4.0,
      onInteract: handleDockhandInteract,
    });

    const handleCrateInteract = async () => {
      if (questManager.currentQuest.status !== QuestStatus.IN_PROGRESS) {
        await runDialogueSequence("Crate", [
          "An ordinary harbour crate. Nothing to report.",
        ]);
        return;
      }

      if (!dockhandBriefed) {
        await runDialogueSequence("Crate", [
          "This must be the crate the dockhand mentioned. Speak with him first.",
        ]);
        return;
      }

      if (crateInspected) {
        await runDialogueSequence("Crate", [
          "You've already checked this crate. Time to share the news.",
        ]);
        return;
      }

      await runDialogueSequence("Crate", [
        "The seal is intact and the contents undisturbed. Crisis averted.",
      ]);

      crateInspected = true;
      questManager.completeQuest();
      crateGroup.userData.interactable.label = "Crate secured";
      interactionSystem.unregister(crateGroup);
    };

    crateGroup.userData.onInteract = handleCrateInteract;
    interactionSystem.register(crateGroup, {
      label: "Inspect Harbour Crate",
      distance: 3.5,
      onInteract: handleCrateInteract,
    });

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

      const resolvedHeroRootPath = joinPath(BASE_URL, heroRootPath);
      if (url !== resolvedHeroRootPath && url !== heroRootPath) {
        console.info(
          `Hero GLB not found at ${resolvedHeroRootPath}; using bundled astronaut sample from ${url}.`,
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

    const persistSunAlignment = () => {
      writeStoredNumber(SUN_AZIMUTH_STORAGE_KEY, sunAlignmentState.azimuthDeg);
      writeStoredNumber(
        SUN_ELEVATION_STORAGE_KEY,
        sunAlignmentState.elevationDeg,
      );
    };

    const getAlignedSunDirection = () =>
      azElToDirection(sunAlignmentState.azimuthDeg, sunAlignmentState.elevationDeg);

    const syncSunLighting = (sunHeightOverride) => {
      const direction = alignSunLight() || getAlignedSunDirection();
      const height = Number.isFinite(sunHeightOverride)
        ? sunHeightOverride
        : direction.y;
      updateLighting(lights, direction, {
        applyPosition: false,
        sunHeightOverride: height,
        sunDistance,
        sunTarget: sunTargetVector,
      });
      return direction;
    };

    const setSunAlignment = (updates = {}) => {
      let changed = false;
      if (updates.azimuthDeg != null && Number.isFinite(Number(updates.azimuthDeg))) {
        sunAlignmentState.azimuthDeg = wrapAzimuth(updates.azimuthDeg);
        changed = true;
      }
      if (
        updates.elevationDeg != null &&
        Number.isFinite(Number(updates.elevationDeg))
      ) {
        sunAlignmentState.elevationDeg = clampElevation(updates.elevationDeg);
        changed = true;
      }

      if (changed) {
        persistSunAlignment();
        const cycleDir = getSunDirection(timeOfDayState);
        syncSunLighting(cycleDir?.y);
        renderFrame();
      }
    };

    const applyLightingPreset = (presetName) => {
      const preset = LIGHTING_PRESETS[presetName];
      if (!preset) return;

      if (preset.sunAzimuthDeg != null || preset.sunElevationDeg != null) {
        if (preset.sunAzimuthDeg != null) {
          sunAlignmentState.azimuthDeg = wrapAzimuth(preset.sunAzimuthDeg);
        }
        if (preset.sunElevationDeg != null) {
          sunAlignmentState.elevationDeg = clampElevation(preset.sunElevationDeg);
        }
        persistSunAlignment();
      }

      const phase = setTimeOfDayPhase(timeOfDayState, preset.phase);
      renderer.toneMappingExposure = preset.exposure;
      applyEnvironmentIntensity(preset.environmentIntensity);
      applyColorGradeSettings(preset.colorGrade);
      console.log(`[HUD] preset: ${presetName}`);

      const sunDirForCycle = getSunDirection(timeOfDayState);
      const alignedSunDir = syncSunLighting(sunDirForCycle?.y);
      updateSky(scene, presetName);

      const skyDome = scene.userData.skyDome;
      if (skyDome && skyDome.material) {
        const skyExp = Number.isFinite(preset.skyboxExposure)
          ? preset.skyboxExposure
          : 1.0;
        skyDome.material.color.setScalar(skyExp);
      }

      updateHarborLighting(harbor, lights.nightFactor);
      updateCityLighting(harborCity, lights.nightFactor, {
        timeOfDayPhase: phase,
      });
      updateCityLighting(hillCity, lights.nightFactor, {
        timeOfDayPhase: phase,
      });
      updateMainHillRoadLighting(roadGroup, lights.nightFactor);
      updateOcean(ocean, 0, alignedSunDir, lights.nightFactor, lights.sunLight.color);
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
      const sunDirForCycle = getSunDirection(timeOfDayState);
      const alignedSunDir = syncSunLighting(sunDirForCycle?.y);

      const skyDome = scene.userData.skyDome;
      if (skyDome) skyDome.position.copy(camera.position);

      // Update sky dome and atmospheric lighting each frame.

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
      updateOcean(ocean, deltaTime, alignedSunDir, lights.nightFactor, lights.sunLight.color);

      // Update soundscape once per frame (player position optional)
      soundscape.update(player?.position);

      if (collectibles && player?.object) {
        collectibles.update(deltaTime, player.object.position);
      }

      // Update Interaction System
      if (!dialogueActive) {
        interactionSystem.update(deltaTime);
      } else {
        interactionHud.hide();
      }

      if (thirdPersonCamera && thirdPersonEnabled) {
        player.cameraYaw = thirdPersonCamera.getYaw();
        player.cameraPitch = thirdPersonCamera.getPitch();
      }

      // Update player movement and drive the attached character animation.
      if (playerMovementEnabled) {
        player.update(deltaTime);
      } else {
        player.velocity.set(0, 0, 0);
      }
      const playerRoot = player?.object;
      const terrainSize = terrain?.geometry?.userData?.size;
      if (playerRoot && Number.isFinite(terrainSize)) {
        const halfSize = terrainSize * 0.5;
        const margin = 2.0;
        const minBound = -halfSize + margin;
        const maxBound = halfSize - margin;
        const pos = playerRoot.position;

        const clampedX = THREE.MathUtils.clamp(pos.x, minBound, maxBound);
        const clampedZ = THREE.MathUtils.clamp(pos.z, minBound, maxBound);
        const clamped = clampedX !== pos.x || clampedZ !== pos.z;
        if (clamped) {
          pos.x = clampedX;
          pos.z = clampedZ;

          const sampler =
            typeof scene?.userData?.getHeightAt === "function"
              ? scene.userData.getHeightAt
              : typeof terrain?.userData?.getHeightAt === "function"
              ? terrain.userData.getHeightAt
              : null;
          if (sampler) {
            const groundHeight = sampler(pos.x, pos.z);
            if (Number.isFinite(groundHeight)) {
              pos.y = Math.max(pos.y, groundHeight + 0.1);
            }
          }
        }
      }
      if (thirdPersonCamera && thirdPersonEnabled) {
        player.cameraYaw = thirdPersonCamera.getYaw();
        player.cameraPitch = thirdPersonCamera.getPitch();
      }
      if (thirdPersonCamera) {
        thirdPersonCamera.update(deltaTime);
      }
      for (const updateNpc of npcUpdaters) updateNpc(deltaTime);

      if (villagerSystem) {
        villagerSystem.update(deltaTime);
      }

      if (atmosphericParticles) {
        atmosphericParticles.update(deltaTime, elapsed);
      }

      // Cast a ray through the center of the screen to detect hovered objects and
      // highlight anything marked as interactable via userData.
      const hovered = interactor.updateHover(deltaTime);
      // Legacy interactPrompt removed to avoid ReferenceError

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
      sunAlignment: {
        getAzimuthDeg: () => sunAlignmentState.azimuthDeg,
        getElevationDeg: () => sunAlignmentState.elevationDeg,
        onChange: setSunAlignment,
      },
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

  waitForAdvance(target = document.body) {
    return new Promise((resolve) => {
      let settled = false;

      const cleanup = () => {
        target?.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("keydown", onKeyDown);
      };

      const settle = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };

      const onPointerDown = () => settle();

      const onKeyDown = (event) => {
        if (event.code !== "Space") return;
        event.preventDefault();
        settle();
      };

      target?.addEventListener("pointerdown", onPointerDown, { once: true });
      window.addEventListener("keydown", onKeyDown);
    });
  }

  /**
   * Helper to clean up all Three.js resources when destroying or restarting the game.
   */
  cleanUp() {
    if (this.sceneContext) {
      disposeSkybox(this.sceneContext.scene);
      // Traverse the scene and free GPU resources
      this.sceneContext.scene.traverse((object) => {
        if (!object.isMesh) return;

        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          // Handle arrays of materials
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((mat) => {
            // Dispose textures inside the material
            for (const key of Object.keys(mat)) {
              if (mat[key] && mat[key].isTexture) {
                mat[key].dispose();
              }
            }
            mat.dispose();
          });
        }
      });
    }

    if (this.renderer) {
      this.renderer.dispose();
    }
    
    // Stop loop
    if (this.gameLoop) {
        this.gameLoop.stop();
    }
  }
}
