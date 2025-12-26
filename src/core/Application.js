import * as THREE from "three";
import { Soundscape } from "../audio/soundscape.js";
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
import { BackdropMountains } from "../world/backdrop/BackdropMountains.js";
import { createShorelineDressing } from "../world/backdrop/ShorelineDressing.js";
import {
  createMainHillRoad,
  updateMainHillRoadLighting,
} from "../world/roads_hillcity.js";
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
import { UIManager } from "./UIManager.js";
import { spawnCitizenCrowd, spawnGLBNPCs } from "../world/npcs.js";
import { QuestHud } from "../ui/questHud.ts";
import { InteractionHud } from "../ui/interactionHud.ts";
import { updateLayout as updateHudLayout } from "../ui/HudManager.ts";
import {
  showLoadingScreen,
  updateLoadingStatus,
  updateLoadingProgress,
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
import { initPropCulling, updateDistanceCulling } from "../utils/propCulling.js";
import { initBuildingCulling, updateBuildingCulling, protectLandmarks } from "../utils/buildingCulling.js";
import { scatterGroundProps } from "../world/groundProps.js";
import { initCityDebugMode } from "../debug/cityDebug.js";
import { disposeSkybox } from "../world/skybox/SkyboxManager.js";
import { LightingSystem } from "../systems/LightingSystem.js";

const DEFAULT_BASE_URL = engineConfig.baseUrl ?? resolveBaseUrl();
const DEFAULT_DISTRICT_RULE_URL_CANDIDATES =
  engineConfig.districtRuleCandidates || [];

const WORLD_ROOT_NAME_LEGACY = WORLD_ROOT_NAME;

const ENABLE_GLB_MODE = false;
const ENABLE_HERO_GLB = true;
if (!ENABLE_GLB_MODE) {
  console.log("[glb] GLB mode disabled");
}

const DEFAULT_FORCE_GLB =
  ENABLE_GLB_MODE && typeof engineConfig.featureFlags?.forceGlb === "boolean"
    ? engineConfig.featureFlags.forceGlb
    : false;
const DEFAULT_FORCE_PROC =
  typeof engineConfig.featureFlags?.forceProcedural === "boolean"
    ? engineConfig.featureFlags.forceProcedural
    : !DEFAULT_FORCE_GLB || !ENABLE_GLB_MODE;
const USE_THIRD_PERSON =
  engineConfig.featureFlags?.useThirdPersonCamera !== false;

function createFarOceanPlane(scene, seaLevel, terrainSize) {
  const radius = Math.max(terrainSize * 2.4, 3200);
  const geometry = new THREE.CircleGeometry(radius, 64);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(terrainSize * 0.45, 0, 0);

  const material = new THREE.MeshStandardMaterial({
    color: 0x0a3a4a,
    roughness: 0.9,
    metalness: 0.0,
    transparent: true,
    opacity: 0.65,
  });

  const plane = new THREE.Mesh(geometry, material);
  plane.name = "FarOceanPlane";
  plane.position.y = seaLevel + 0.05;
  plane.receiveShadow = false;
  plane.renderOrder = -4;
  scene.add(plane);
  return plane;
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
    const resolvedForceGlb =
      typeof forceGlb === "boolean" ? forceGlb : DEFAULT_FORCE_GLB;
    this.forceGlb = ENABLE_GLB_MODE && resolvedForceGlb;
    this.forceProc = ENABLE_GLB_MODE
      ? typeof forceProc === "boolean"
        ? forceProc
        : !this.forceGlb
      : true;
    this.assetLoader = new AssetLoader({
      baseUrl: this.baseUrl,
      forceProcedural: this.forceProc,
      districtRuleCandidates: this.districtRuleCandidates,
      enableGlbMode: ENABLE_GLB_MODE,
    });
    this.gameLoop = new GameLoop();
    this.sceneContext = null;
    this.renderer = null;
    this.devHud = null;
    this.ocean = null;
    this.pendingOceanStatus = null;
    this.coastalSkirt = null;
    this.farOceanPlane = null;
    this.shoreTermination = null;
    this.skyboxTexture = null;
  }

  async run() {
    const BASE_URL = this.baseUrl;
    const DISTRICT_RULE_URL_CANDIDATES = this.districtRuleCandidates;
    const FORCE_PROC = this.forceProc;
    const FORCE_GLB = this.forceGlb;
    const assetLoader = this.assetLoader;
    const ARISTOTLE_CANDIDATES = ENABLE_GLB_MODE
      ? getAssetCandidates("aristotle")
      : [];
    const POSEIDON_CANDIDATES = ENABLE_GLB_MODE
      ? getAssetCandidates("poseidon")
      : [];
    const AKROPOL_CANDIDATES = ENABLE_GLB_MODE
      ? getAssetCandidates("akropol")
      : [];

    showLoadingScreen({
      initialStatus: "Preparing the experience...",
    });
    const totalLoadingStages = 4;
    let loadingStage = 0;
    const advanceLoadingStage = (message) => {
      loadingStage = Math.min(loadingStage + 1, totalLoadingStages);
      updateLoadingStatus(message);
      updateLoadingProgress(loadingStage, totalLoadingStages);
    };

    updateLoadingProgress(0, totalLoadingStages);
    updateLoadingStatus("Preparing renderer and interface...");
    const quickCheckResult = await assetLoader.runAssetQuickChecks().catch((err) => {
      console.warn("Asset QuickChecks failed", err);
      return null;
    });
    if (quickCheckResult?.hasMissingCritical || quickCheckResult?.hasRepeatedFailures) {
      const missingCriticalLabels = quickCheckResult.missingCriticalChecks.map(
        (entry) => entry.label,
      );
      const uniqueMissing = Array.from(new Set(missingCriticalLabels));
      const criticalSummary =
        uniqueMissing.length > 0
          ? `Missing critical asset${uniqueMissing.length > 1 ? "s" : ""}: ${uniqueMissing.join(", ")}.`
          : "Multiple critical assets failed to load.";
      const repeatedSummary =
        quickCheckResult.hasRepeatedFailures && !quickCheckResult.hasMissingCritical
          ? "Multiple asset checks failed to load."
          : "";
      showLoadingError(
        [criticalSummary, repeatedSummary, "Please verify the asset bundle and refresh."]
          .filter(Boolean)
          .join(" "),
      );
      return;
    }
    if (ENABLE_GLB_MODE) {
      assetLoader
        .probeInitialAssets({
          glbCandidates: [
            "models/landmarks/poseidon_temple.glb",
            "models/landmarks/akropol.glb",
          ],
          includeGlbCandidates: !FORCE_PROC,
        })
        .catch(() => {});
    }

    this.renderer = createRenderer();
    const renderer = this.renderer;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    if (ENABLE_GLB_MODE) {
      initializeAssetTranscoders(renderer);
    }
    attachCrosshair();
    advanceLoadingStage("Listening for the bustle of ancient Athens...");

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
    setFogEnabled(false);

    const lightingSystem = new LightingSystem({
        scene,
        renderer,
        sceneContext,
        baseUrl: BASE_URL,
        onFogChange,
        devHud,
    });
    this.lightingSystem = lightingSystem;

    await lightingSystem.initialize();

    const soundscape = new Soundscape(
      scene,
      camera,
      { getNightFactor: () => lightingSystem.lights.nightFactor },
      {
        harbor: new THREE.Vector3(120, 0, 80),
        agora: AGORA_CENTER_3D,
        acropolis: ACROPOLIS_PEAK_3D,
      },
    );
    let audioManifestMissing = false;
    soundscape
      .loadManifest("audio/manifest.json")
      .catch(() => {
        audioManifestMissing = true;
      })
      .then(() => soundscape.initFromManifest("audio/manifest.json"))
      .then(() => soundscape.ensureUserGestureResume())
      .catch(() => {});
    updateLoadingStatus("Sculpting the Attic landscape...");

    const terrain = createTerrain(scene);
    this.terrain = terrain;
    const terrainSize = terrain?.geometry?.userData?.size;

    const seaLevel = getSeaLevelY();
    const oceanRadius = Math.max(
      Number.isFinite(terrainSize) ? terrainSize * 2.2 : 0,
      2600,
    );
    const horizonColor = 0x96b9d8;
    const shorelineInnerRadius = Math.max(
      Number.isFinite(terrainSize) ? terrainSize * 0.5 + 4 : 0,
      215,
    );

    if (!this.horizon) {
      this.horizon = createHorizon(this.scene, {
        seaLevel,
        radius: oceanRadius,
        fadeWidth: 320,
        horizonColor,
        westHeight: 7,
        eastHeight: 1.1,
        westRadiusScale: 1.95,
      });
    }
    if (!this.ocean) {
      this.ocean = await createOcean(this.scene, {
        seaLevel,
        radius: oceanRadius,
        horizonOffset: 0,
        waterColor: 0x0a5566,
      });
      if (this.ocean) this.ocean.scale.set(1, 1, 1);
    }
    if (!this.farOceanPlane && Number.isFinite(terrainSize)) {
      this.farOceanPlane = createFarOceanPlane(this.scene, seaLevel, terrainSize);
    }
    if (!this.shoreTermination) {
      this.shoreTermination = createShorelineTermination(this.scene, {
        seaLevel,
        innerRadius: shorelineInnerRadius,
        bandWidth: 35,
        fadeWidth: 320,
        oceanRadius,
        horizonColor,
      });
    }
    if (this.coastalSkirt) {
      this.scene.remove(this.coastalSkirt);
      this.coastalSkirt = null;
    }
    if (!this.worldFloorCap) {
      this.worldFloorCap = createWorldFloorCap(this.scene, {
        seaLevel,
        radius: oceanRadius,
        depth: 160,
      });
    }
    if (!this.killPlane) {
      this.killPlane = applyKillPlane(this.renderer, seaLevel - 75);
    }
    ocean = this.ocean;
    attachHeightSampler(terrain);
    scene.userData.terrain = terrain;
    scene.userData.getHeightAt = terrain?.userData?.getHeightAt;
    if (typeof terrain?.userData?.getHeightAt === "function") {
      scene.userData.terrainHeightSampler = terrain.userData.getHeightAt;
    }
    advanceLoadingStage("Terrain ready. Mapping the hills...");
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
      return false;
    })();
    if (shouldAddOccluder) {
      const P1 = new THREE.Vector2(-0.4, -0.3);
      const P2 = new THREE.Vector2(-95.7, -3.1);
      addDepthOccluderRibbon(
        scene,
        terrain,
        P1,
        P2,
        6,
        140,
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
        setSeaLevelY(sampledSeaLevel, {
          reason: "harbor-sampling",
          samples: harborSampleCount,
        });
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
      advanceLoadingStage("Ocean ready. Setting the harbor tides...");
      const envCollider = new EnvironmentCollider();
      scene.add(envCollider.mesh);

      const worldRoot = refreshWorldRoot();
      worldRoot.add(terrain);

      let grassRoot = null;
      let villagerSystem = null;
      let atmosphericParticles = null;

      const roadsVisible =
        engineConfig.performance?.roadsVisible ?? parseBooleanQuery("roads", true);

      const { group: roadGroup, curve: mainRoad } = createMainHillRoad(
        worldRoot,
        terrain,
      );
      if (roadGroup) {
        roadGroup.visible = roadsVisible;
      }

      if (grassEnabled) {
        grassRoot = mountGrass(scene);
        if (grassRoot) {
            setGrassNightFactor(lightingSystem.lights.nightFactor);
        }
      }

      let landmarkLoadPromise = Promise.resolve();
      if (ENABLE_GLB_MODE && !FORCE_PROC) {
        const landmarkTasks = [
          (async () => {
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
                } catch {}
              }
            } catch {}
          })(),
          (async () => {
            try {
              const url =
                await assetLoader.resolveFirstAvailableAsset(POSEIDON_CANDIDATES);
              if (url)
                await loadLandmark(worldRoot, url, {
                  position: new THREE.Vector3(90, 0, -60),
                  scale: 2.6,
                  materialPreset: "marble",
                });
            } catch {}
          })(),
          (async () => {
            try {
              const url =
                await assetLoader.resolveFirstAvailableAsset(AKROPOL_CANDIDATES);
              if (url)
                await loadLandmark(worldRoot, url, {
                  position: new THREE.Vector3(130, 0, 40),
                  scale: 2.2,
                  materialPreset: "marble",
                });
            } catch {}
          })(),
        ];

        landmarkLoadPromise = Promise.all(landmarkTasks).catch(() => {});
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

      const hillCity = await createHillCity(worldRoot, terrain, mainRoad, {
        seed: 42,
        buildingCount: 140,
        foundationPadMaterial:
          harborCity?.userData?.foundationPadMaterial ?? null,
      });
      updateLoadingStatus("Raising temples, homes, and harbors...");

      applyGravelToRoads({ scene, baseUrl: BASE_URL, repeat: [6, 6] }).catch(() => {});

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

      envCollider.fromStaticScene(scene);

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

      const backdrop = new BackdropMountains(worldRoot, {
        seaLevel: resolvedSeaLevel,
      });
      backdrop.create();

      createShorelineDressing(worldRoot, terrain, resolvedSeaLevel);

      envCollider.refresh();

      const scoreContainer = document.createElement("div");
      Object.assign(scoreContainer.style, {
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0, 0, 0, 0.6)",
        color: "#ffd700",
        padding: "10px 20px",
        borderRadius: "20px",
        fontFamily: "serif",
        fontSize: "24px",
        fontWeight: "bold",
        border: "2px solid #ffd700",
        pointerEvents: "none",
        textShadow: "0px 2px 4px black",
        display: "none"
      });
      scoreContainer.innerText = "Scrolls Found: 0 / 0";
      document.body.appendChild(scoreContainer);

      const collectibles = new CollectiblesManager(worldRoot);

      collectibles.onScoreChange = (score, total) => {
        scoreContainer.innerText = `Scrolls Found: ${score} / ${total}`;
        if (score === total) {
          scoreContainer.innerText = "ALL WISDOM COLLECTED!";
          scoreContainer.style.color = "#aaffaa";
          scoreContainer.style.borderColor = "#aaffaa";
        }
      };

      collectibles.spawnAt(AGORA_CENTER_3D.x, AGORA_CENTER_3D.y, AGORA_CENTER_3D.z);
      collectibles.spawnAt(ACROPOLIS_PEAK_3D.x, ACROPOLIS_PEAK_3D.y, ACROPOLIS_PEAK_3D.z);
      collectibles.spawnAt(HARBOR_CENTER_3D.x, HARBOR_CENTER_3D.y, HARBOR_CENTER_3D.z);

      collectibles.spawnRandomly(terrain, 12, AGORA_CENTER_3D, CITY_AREA_RADIUS * 0.8);

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
          },
        });
      }

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

      const templeNpcGroup = new THREE.Group();
      templeNpcGroup.name = "TempleNPC_QuestGiver";

      const npcBodyMat = new THREE.MeshStandardMaterial({
        color: 0x4e8ef7,
        roughness: 0.7,
        fog: false,
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
        new THREE.MeshStandardMaterial({ color: 0xeacdad, fog: false }),
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
        new THREE.MeshStandardMaterial({ color: 0x9c7955, roughness: 0.8, fog: false }),
      );
      dockhandBody.position.y = 0.95;
      dockhandBody.castShadow = true;
      dockhand.add(dockhandBody);

      const dockhandHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xd9c4a1, fog: false }),
      );
      dockhandHead.position.y = 1.5;
      dockhandHead.castShadow = true;
      dockhand.add(dockhandHead);

      const dockhandPosition = new THREE.Vector3(
        126.0,
        seaLevel,
        HARBOR_WATER_CENTER.z + 2.0,
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
        fog: false,
      });
      const crateMesh = new THREE.Mesh(crateGeo, crateMat);
      crateMesh.castShadow = true;
      crateMesh.receiveShadow = true;
      crateMesh.position.y = 0.45;
      crateGroup.add(crateMesh);

      const cratePosition = new THREE.Vector3(
        130.0,
        seaLevel,
        HARBOR_WATER_CENTER.z + 2.0,
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
          fog: false,
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
          new THREE.MeshStandardMaterial({ color: 0xf4f7ff, roughness: 0.4, fog: false }),
        );
        head.castShadow = true;
        head.position.y = 1.32;
        group.add(head);

        return group;
      };

      const removeExistingAvatar = () => {
        if (player.character) {
          player.object.remove(player.character);
          player.character = undefined;
        }

        const fallbackAvatar = player.object.children.find(
          (child) => child.name === "FallbackAvatar",
        );
        if (fallbackAvatar) {
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

      if (ENABLE_HERO_GLB) {
        try {
          const heroLoader = await createGLTFLoader(renderer);
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
        } catch (error) {
          attachFallbackAvatar();
        }
      } else {
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
      if (ENABLE_GLB_MODE) {
        spawnGLBNPCs(worldRoot, mainRoad, { terrain })
          .then((glbNpcs) => {
            if (!glbNpcs) return;
            if (Array.isArray(glbNpcs.updaters)) {
              npcUpdaters.push(...glbNpcs.updaters);
            }
          })
          .catch(() => {});
      }

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

      if (ENABLE_GLB_MODE && !FORCE_PROC) {
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

        sampleBuildingResults.forEach(() => {});
      } else {
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
        quietMissing: true,
      });

      let configToLoad = athensLayoutConfig;
      if (FORCE_PROCEDURAL_LANDMARKS) {
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
      } catch {}

      proceduralLandmarkCount = landmarkResults.filter(
        (entry) => entry?.object?.userData?.proceduralType,
      ).length;

      interactor = createInteractor(renderer, camera, scene);

      if (thirdPersonCamera) {
        setThirdPersonEnabled(USE_THIRD_PERSON);
      }

      applyTextureBudgetToObject(scene, { safeMode: true });

      const loop = this.gameLoop;

      const onFrame = (deltaTime, elapsed) => {
        if (!scene.background || scene.background === null) {
          scene.background = new THREE.Color("#dbe9ff");
        }

        lightingSystem.update(deltaTime, elapsed, { harbor, harborCity, hillCity, roadGroup, ocean, grassRoot });

        updateTerrain(terrain, elapsed);

        soundscape.update(player?.position);

        if (collectibles && player?.object) {
          collectibles.update(deltaTime, player.object.position);
        }

        if (!dialogueActive) {
          interactionSystem.update(deltaTime);
        } else {
          interactionHud.hide();
        }

        if (thirdPersonCamera && thirdPersonEnabled) {
          player.cameraYaw = thirdPersonCamera.getYaw();
          player.cameraPitch = thirdPersonCamera.getPitch();
        }

        if (playerMovementEnabled) {
          player.update(deltaTime);
        } else {
          player.velocity.set(0, 0, 0);
        }
        const playerRoot = player?.object;

        if (playerRoot && playerRoot.position.y < seaLevel - 15.0) {
          const respawnPos = findSafePlayerSpawn({
            envCollider,
            terrain,
            searchCenter: AGORA_CENTER_3D,
            fallback: AGORA_CENTER_3D,
            playerHeight: player.height,
            playerRadius: player.radius,
            verticalClearance: 0.5,
            seaLevel: seaLevel,
          });
          player.velocity.set(0, 0, 0);
          playerRoot.position.copy(respawnPos);
          player.syncCapsuleToObject();
        }

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

        const hovered = interactor.updateHover(deltaTime);

        const formattedTime = formatPhaseAsTime(lightingSystem.timeOfDayState.timeOfDayPhase);
        if (formattedTime !== lastDisplayedTime) {
          timeOfDayDisplay.textContent = `Time: ${formattedTime}`;
          lastDisplayedTime = formattedTime;
        }

        if (Math.floor(elapsed * 60) % 10 === 0) {
          updateDistanceCulling(scene, camera, {
            nearDistance: 100,
            farDistance: 200
          });
        }

        if (Math.floor(elapsed * 60) % 20 === 0) {
          updateBuildingCulling(scene, camera, {
            cullDistance: 400,
            enableHorizon: true
          });
        }

        renderFrame();
      };

      loop.onUpdate(onFrame);
      loop.start();
      await landmarkLoadPromise;
      advanceLoadingStage("Opening the gates to ancient Athens...");
      hideLoadingScreen();

      try {
        initPropCulling(scene, camera, { dryRun: false });
      } catch {}

      try {
        protectLandmarks(scene);
        initBuildingCulling(scene, camera, {
          cullDistance: 400,
          enableHorizon: true,
          enableLOD: false
        });
      } catch {}

      try {
        initCityDebugMode(scene, terrain);
      } catch {}

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
          v.y = 0;
          v.normalize();
          return v;
        } catch {
          return { x: 0, y: 0, z: 1 };
        }
      };

      const onPin = (p) => {
        const pin = createPin(worldRoot, p);
        const y = terrain?.userData?.getHeightAt?.(p.x, p.z);
        if (Number.isFinite(y)) pin.position.y = y;
      };

      const devHudToggle = engineConfig.debug?.overlays?.devHud || { defaultValue: true, devDefault: true };
      const cameraHudToggle = engineConfig.debug?.overlays?.cameraSettings || { defaultValue: true, devDefault: true };
      
      if (resolveFeatureToggle(devHudToggle) || resolveFeatureToggle(cameraHudToggle)) {
        UIManager.init({
          renderer,
          soundscape,
          questManager,
          questHud,
          interactionHud,
          getPosition,
          getDirection,
          lightingCallbacks: {
            onSetLightingPreset: (name) => lightingSystem.applyLookProfile(name, { source: "user" }),
            lightingPresets: LIGHTING_PRESETS,
            getActivePresetName: () => lightingSystem.lastAppliedLightingPreset,
            setActivePreset: (name) => lightingSystem.applyLookProfile(name, { source: "user" }),
          },
          fogCallbacks: {
            getFogEnabled: () => fogEnabled,
            onToggleFog: toggleFog,
          },
          sunAlignment: {
            getAzimuthDeg: () => lightingSystem.sunAlignmentState.azimuthDeg,
            getElevationDeg: () => lightingSystem.sunAlignmentState.elevationDeg,
            onChange: (updates) => lightingSystem.setSunAlignment(updates),
          },
          onPin,
        });

        devHud = UIManager.getDevHud();
        this.devHud = devHud;
        devHud?.setActivePreset?.(lightingSystem.lastAppliedLightingPreset);

        proceduralStatusMessage = FORCE_PROC ? "Procedural: ON" : "Procedural: OFF";
        devHud?.setStatusLine?.(
          "proc",
          FORCE_PROC ? "Procedural: ON" : "Procedural: OFF",
        );
        onFogChange(fogEnabled);
      }
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
        } else if (event.code === "KeyT" && !event.repeat) {
            lightingSystem.cycleLightingPreset();
        } else if (event.code === "F8" && !event.repeat) {
          const position = player?.object?.position;
          const x = position?.x;
          const z = position?.z;
          if (Number.isFinite(x) && Number.isFinite(z)) {
            probeAt(x, z);
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

  cleanUp() {
    if (this.sceneContext) {
      disposeSkybox(this.sceneContext.scene);
      this.sceneContext.scene.traverse((object) => {
        if (!object.isMesh) return;

        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((mat) => {
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
    
    if (this.gameLoop) {
        this.gameLoop.stop();
    }
  }
}
