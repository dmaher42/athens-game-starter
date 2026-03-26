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
import { createHarbor } from "../world/harbor.js";
import { createHarborDecorations } from "../world/decoration.js";
import { BackdropMountains } from "../world/backdrop/BackdropMountains.js";
import { createShorelineDressing } from "../world/backdrop/ShorelineDressing.js";
import {
  createMainHillRoad,
} from "../world/roads_hillcity.js";
import { createPlazas } from "../world/plazas.js";
import {
  createHillCity,
  createCity,
} from "../world/city.js";
import { validateCityGroundMaterials } from "../materials/groundMaterials.js";
import {
  mount as mountGrass,
  update as updateGrass,
} from "../world/grass.js";
import {
  AGORA_CENTER_3D,
  CITY_AREA_RADIUS,
  ACROPOLIS_PEAK_3D,
  HARBOR_CENTER_3D,
  HARBOR_WATER_BOUNDS,
  HARBOR_WATER_NORMAL_CANDIDATES,
  MAIN_ROAD_WIDTH,
  getSeaLevelY,
  setSeaLevelY,
} from "../world/locations.js";
import { createCivicDistrict } from "../world/cityPlan.js";
import { EnvironmentCollider } from "../env/EnvironmentCollider.js";
import { BuildingManager } from "../buildings/BuildingManager.js";
import { UIManager } from "./UIManager.js";
import { spawnCitizenCrowd, spawnGLBNPCs } from "../world/npcs.js";
import { QuestHud } from "../ui/questHud.js";
import { InteractionHud } from "../ui/interactionHud.js";
import { showDemoIntro } from "../ui/demoIntro.js";
import {
  showLoadingScreen,
  updateLoadingStatus,
  updateLoadingProgress,
  showLoadingError,
  hideLoadingScreen,
} from "../ui/loadingScreen.js";
import { createPin } from "../world/pins.js";
import { createDemoTour } from "../world/demoTour.js";
import { attachHeightSampler, probeAt } from "../world/terrainHeight.js";
import { addDepthOccluderRibbon } from "../world/occluders.js";
import { snapAboveGround } from "../world/ground.js";
import { findSafePlayerSpawn } from "../world/spawn.js";
import { resolveBaseUrl, joinPath } from "../utils/baseUrl.js";
import { LIGHTING_PRESETS } from "../config/LookProfiles.js";
import {
  engineConfig,
  resolveFeatureToggle,
  parseBooleanQuery,
} from "../config/EngineConfig.js";
import { CollectiblesManager } from "../world/collectibles.js";
import { QuestManager, QuestStatus } from "../state/QuestManager.js";
// === CODex: Aristotle PBR hook (non-breaking) ===
import { attachAristotleMarblePBR } from "../features/aristotle-texture.js";
import { applyGravelToRoads } from "../features/roads-gravel.js";
import { buildTemple } from "../features/temples.js";
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
import { createAtmosphericParticles } from "../world/particles.js";
import { initPropCulling, updateDistanceCulling } from "../utils/propCulling.js";
import { cullDistantBuildings } from "../utils/buildingCulling.js";
import { scatterGroundProps } from "../world/groundProps.js";
import { initCityDebugMode } from "../debug/cityDebug.js";
import { disposeSkybox } from "../world/skybox/SkyboxManager.js";
import { LightingSystem } from "../systems/LightingSystem.js";
import { PlayerSystem } from "../systems/PlayerSystem.js";

// Expose THREE globally for debugging in devtools.
(window as any).THREE = THREE;
console.log("✅ THREE exposed globally for debugging");

const DEFAULT_BASE_URL = engineConfig.baseUrl ?? resolveBaseUrl();
const DEFAULT_DISTRICT_RULE_URL_CANDIDATES =
  engineConfig.districtRuleCandidates || [];

const WORLD_ROOT_NAME_LEGACY = WORLD_ROOT_NAME;

const ENABLE_GLB_MODE = true;

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

export interface ApplicationBootOptions {
  baseUrl?: string;
  districtRuleCandidates?: string[];
  queryParams?: URLSearchParams;
  forceGlb?: boolean;
  forceProc?: boolean;
}

export class Application {
  baseUrl: string;
  districtRuleCandidates: string[];
  queryParams: URLSearchParams | undefined;
  forceGlb: boolean;
  forceProc: boolean;
  assetLoader: any;
  gameLoop: any;
  sceneContext: any;
  renderer: any;
  devHud: any;
  ocean: any;
  pendingOceanStatus: any;
  coastalSkirt: any;
  shoreTermination: any;
  skyboxTexture: any;
  npcUpdaters: any[];
  scene: any;
  terrain: any;
  horizon: any;
  worldFloorCap: any;
  killPlane: any;
  lightingSystem: any;
  playerSystem: any;

  constructor({
    baseUrl = DEFAULT_BASE_URL,
    districtRuleCandidates = DEFAULT_DISTRICT_RULE_URL_CANDIDATES,
    queryParams = engineConfig.queryParams,
    forceGlb = DEFAULT_FORCE_GLB,
    forceProc,
  }: ApplicationBootOptions = {}) {
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
      districtRuleCandidates: this.districtRuleCandidates as any,
      enableGlbMode: ENABLE_GLB_MODE,
    });
    this.gameLoop = new GameLoop();
    this.sceneContext = null;
    this.renderer = null;
    this.devHud = null;
    this.ocean = null;
    this.pendingOceanStatus = null;
    this.coastalSkirt = null;
    this.shoreTermination = null;
    this.skyboxTexture = null;
    this.npcUpdaters = [];
    this.scene = null;
    this.terrain = null;
    this.horizon = null;
    this.worldFloorCap = null;
    this.killPlane = null;
    this.lightingSystem = null;
    this.playerSystem = null;
  }

  async run() {
    const BASE_URL = this.baseUrl;
    const DISTRICT_RULE_URL_CANDIDATES = this.districtRuleCandidates;
    const FORCE_PROC = this.forceProc;
    const FORCE_GLB = this.forceGlb;
    const assetLoader = this.assetLoader;
    const debugGlobalScope: any =
      typeof globalThis !== "undefined"
        ? globalThis
        : typeof window !== "undefined"
          ? window
          : null;

    if (debugGlobalScope) {
      debugGlobalScope.THREE = debugGlobalScope.THREE || THREE;
      if (typeof window !== "undefined") {
        (window as any).THREE = THREE;
      }
      const threeLogTarget =
        typeof window !== "undefined" ? (window as any) : debugGlobalScope;
      console.log("✅ THREE exposed:", threeLogTarget?.THREE);
    }
    showLoadingScreen({
      initialStatus: "Preparing the experience...",
    });
    const totalLoadingStages = 4;
    let loadingStage = 0;
    const advanceLoadingStage = (message: string) => {
      loadingStage = Math.min(loadingStage + 1, totalLoadingStages);
      updateLoadingStatus(message);
      updateLoadingProgress(loadingStage, totalLoadingStages);
    };

    updateLoadingProgress(0, totalLoadingStages);
    updateLoadingStatus("Preparing renderer and interface...");
    const quickCheckResult = await assetLoader.runAssetQuickChecks().catch((err: any) => {
      console.warn("Asset QuickChecks failed", err);
      return null;
    });
    if (quickCheckResult?.hasMissingCritical || quickCheckResult?.hasRepeatedFailures) {
      const missingCriticalLabels = quickCheckResult.missingCriticalChecks.map(
        (entry: any) => entry.label,
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
    this.renderer = createRenderer();
    const renderer = this.renderer;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    attachCrosshair();
    advanceLoadingStage("Listening for the bustle of ancient Athens...");

    let devHud: any = (this.devHud = null);
    let ocean: any = (this.ocean = null);
    let pendingOceanStatus: any = (this.pendingOceanStatus = null);
    const proceduralStatus = FORCE_PROC ? "Procedural: ON" : "Procedural: OFF";
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
        const formatBound = (value: number) => Number(value).toFixed(1);
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
    const onFogChange = (enabled: boolean) => {
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
    } as any);
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
    this.scene = scene;
    setFogEnabled(false);

    // Expose scene and camera to window for debugging
    if (typeof window !== 'undefined') {
      (window as any).scene = scene;
      (window as any).camera = camera;
      console.log('✅ Scene and camera exposed to window for debugging');
    }

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
      { getNightFactor: () => lightingSystem.lights?.nightFactor ?? 0 },
      {
        harbor: new THREE.Vector3(120, 0, 80),
        agora: AGORA_CENTER_3D,
        acropolis: ACROPOLIS_PEAK_3D,
      },
    );
    let audioManifestMissing = false;
    (soundscape as any)
      .loadManifest("audio/manifest.json")
      .then((manifest: any) => {
        if (!manifest) {
          audioManifestMissing = true;
        }
      })
      .catch(() => {
        audioManifestMissing = true;
      })
      .finally(() => {
        soundscape.ensureUserGestureResume();
      });
    updateLoadingStatus("Sculpting the Attic landscape...");

    const terrain = createTerrain(scene);
    this.terrain = terrain;
    const terrainDebugScope = debugGlobalScope ?? (typeof window !== "undefined" ? window : null);
    if (terrainDebugScope && terrain) {
      terrainDebugScope.terrainMesh = terrain;
      if (typeof window !== "undefined") {
        (window as any).terrainMesh = terrain;
      }
      const terrainLogTarget =
        typeof window !== "undefined" ? (window as any) : terrainDebugScope;
      console.log("✅ TerrainMesh exposed:", terrainLogTarget?.terrainMesh);
    }
    const terrainSize = terrain?.geometry?.userData?.['size'];

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
      this.ocean = await (createOcean as any)(this.scene, terrain, {
        bounds: HARBOR_WATER_BOUNDS,
        waterNormalsCandidates: HARBOR_WATER_NORMAL_CANDIDATES,
        seaLevel,
        shoreBlendWidth: 4,
        waterColor: 0x0a5566,
      });
      if (this.ocean) this.ocean.scale.set(1, 1, 1);
    }
    // Far-ocean plane removed - was causing blue reflective shimmer on inland areas
    // The ocean.js Water shader positioned far east is sufficient for the Aegean Sea
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
    scene.userData['terrain'] = terrain;
    scene.userData['getHeightAt'] = terrain?.userData?.['getHeightAt'];
    if (typeof terrain?.userData?.['getHeightAt'] === "function") {
      scene.userData['terrainHeightSampler'] = terrain.userData['getHeightAt'];
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
    const harborSampler: any = null;
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

      ocean = this.ocean;
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

      const playerSystem = new PlayerSystem({
        scene,
        camera,
        renderer,
        envCollider,
        terrain,
        worldRoot,
        baseUrl: BASE_URL,
      });
      await playerSystem.initialize();
      this.playerSystem = playerSystem;

      let grassRoot: any = null;
      let atmosphericParticles: any = null;

      const roadsVisible =
        engineConfig.performance?.roadsVisible ?? parseBooleanQuery("roads", true);

      const landmarksEnabled = parseBooleanQuery("landmarks", true);

      const placeLandmark = async (
        sceneRef: THREE.Object3D,
        terrainRef: any,
        position: THREE.Vector3,
        opts: any = {},
      ) => {
        const { rotationRad = 0, ...rest } = opts;
        const temple = await buildTemple({ materialPreset: "marble", ...rest });
        const height = terrainRef?.userData?.getHeightAt?.(position.x, position.z);
        const authoredY = Number.isFinite(position?.y) ? position.y : 0;
        const y = Number.isFinite(height) ? Math.max(height, authoredY) : authoredY;
        temple.position.set(position.x, y + 0.05, position.z);
        if (rotationRad) temple.rotation.y = rotationRad;
        sceneRef.add(temple);
        return temple;
      };

      const { group: roadGroup, curve: mainRoad } = createMainHillRoad(
        worldRoot,
        terrain,
      );
      if (roadGroup) {
        roadGroup.visible = false;  // Hide main hill road tubes
      }

      if (grassEnabled) {
        grassRoot = mountGrass(scene);
      }

      const { city: harborCity, roadCurves } = await createCity(
        worldRoot,
        this.terrain,
        {
          roadsVisible,
          useProceduralBlocks: FORCE_PROC,
          forceProcedural: FORCE_PROC,
          seaLevel: resolvedSeaLevel,
        },
      );

      const hillCity = await createHillCity(worldRoot, terrain, mainRoad, {
        seed: 42,
        buildingCount: 140,
        foundationPadMaterial:
          harborCity?.userData?.['foundationPadMaterial'] ?? null,
      });
      updateLoadingStatus("Raising temples, homes, and harbors...");

      if (landmarksEnabled) {
        await placeLandmark(worldRoot, terrain, HARBOR_CENTER_3D.clone().add(new THREE.Vector3(-40, 0, -80)), {
          width: 22,
          depth: 40,
          rotationRad: THREE.MathUtils.degToRad(25),
        });

        await placeLandmark(worldRoot, terrain, HARBOR_CENTER_3D.clone().add(new THREE.Vector3(40, 0, -80)), {
          width: 30,
          depth: 54,
          columnCountX: 8,
          columnCountZ: 17,
          rotationRad: THREE.MathUtils.degToRad(-10),
        });

        await placeLandmark(
          worldRoot,
          terrain,
          HARBOR_CENTER_3D.clone().add(new THREE.Vector3(0, 0, -140)),
          {
            width: 12,
            depth: 34,
            columnCountX: 6,
            columnCountZ: 2,
            materialPreset: "plaster",
            rotationRad: THREE.MathUtils.degToRad(0),
          },
        );

        await placeLandmark(
          worldRoot,
          terrain,
          AGORA_CENTER_3D.clone().add(new THREE.Vector3(-24, 0, -8)),
          {
            width: 28,
            depth: 52,
            colX: 8,
            colZ: 2,
            materialPreset: "plaster",
            rotationRad: THREE.MathUtils.degToRad(88),
          },
        );

        await placeLandmark(
          worldRoot,
          terrain,
          ACROPOLIS_PEAK_3D.clone().add(new THREE.Vector3(6, 0, -6)),
          {
            width: 24,
            depth: 46,
            colX: 6,
            colZ: 13,
            rotationRad: THREE.MathUtils.degToRad(-16),
          },
        );
      }

      // Validate ground material setup after scene initialization
      // validateCityGroundMaterials(scene); // Disabled - simplified materials

      applyGravelToRoads({ scene, baseUrl: BASE_URL, repeat: [6, 6] }).catch(() => {});

      updateTerrainCoverageMask(terrain, {
        buildingPlacements: harborCity?.userData?.['buildingPlacements'] ?? [],
        roadCurves: roadCurves ?? [],
        mainRoadCurve: mainRoad ?? null,
        mainRoadWidth: MAIN_ROAD_WIDTH,
        roadWidth: 3.2,
        roadBuffer: 2,
      });
      if (!scene.userData?.['roadsideBufferLogged']) {
        scene.userData = scene.userData || {};
        scene.userData['roadsideBufferLogged'] = true;
        console.info("[Roads] Roadside buffer zone active");
        console.info("[Roads] City ground applied under roads");
      }

      scatterGroundProps(worldRoot, terrain, {
        buildingPlacements: harborCity?.userData?.['buildingPlacements'] ?? [],
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

      collectibles.onScoreChange = (score: number, total: number) => {
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

      const questManager = new QuestManager();
      const questHud = new QuestHud(questManager);
      const demoTour = createDemoTour(worldRoot, {
        terrain,
        questManager,
      });
      const interactionHud = new InteractionHud();

      let interactor: any = createInteractor(renderer, camera, scene);

      // Safe mode texture budgeting is intentionally disabled for normal gameplay.

      const loop = this.gameLoop;

      if (civicDistrict.walkingLoop) {
        const crowd = spawnCitizenCrowd(worldRoot, civicDistrict.walkingLoop, {
          count: 8,
          minSpeed: 0.7,
          maxSpeed: 1.4,
          terrain,
        });
        this.npcUpdaters.push(...crowd.updaters);
      }
      if (ENABLE_GLB_MODE) {
        spawnGLBNPCs(worldRoot, mainRoad, { terrain })
          .then((glbNpcs: any) => {
            if (!glbNpcs) return;
            if (Array.isArray(glbNpcs.updaters)) {
              this.npcUpdaters.push(...glbNpcs.updaters);
            }
          })
          .catch(() => {});
      }

      const onFrame = (deltaTime: number, elapsed: number) => {
        if (!scene.background || scene.background === null) {
          scene.background = new THREE.Color("#dbe9ff");
        }

        lightingSystem.update(deltaTime, elapsed, { harbor, harborCity, hillCity, roadGroup, ocean, grassRoot });
        playerSystem.update(deltaTime);

        (updateTerrain as any)(terrain, elapsed);

        if (grassRoot) {
            updateGrass(deltaTime, playerSystem.player?.position ?? null);
        }

        (soundscape as any).update(playerSystem.player?.position);

        if (collectibles && playerSystem.player?.object) {
          collectibles.update(deltaTime, playerSystem.player.object.position);
        }

        demoTour?.update(playerSystem.player?.object?.position, elapsed);

        if (playerSystem.player?.input?.consumeInteract?.()) {
          interactor.useObject();
        }

        for (const updateNpc of this.npcUpdaters) updateNpc(deltaTime);

        if (atmosphericParticles) {
          atmosphericParticles.update(deltaTime, elapsed);
        }

        interactor.updateHover(deltaTime);

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
          cullDistantBuildings(scene, camera, 400);
        }

        renderFrame();
      };

      loop.onUpdate(onFrame);
      loop.start();
      advanceLoadingStage("Opening the gates to ancient Athens...");
      hideLoadingScreen();
      showDemoIntro();

      try {
        initPropCulling(scene, camera, { dryRun: false });
      } catch {}


      // Debug mode is intentionally manual-only; call initCityDebugMode(scene, terrain) when needed.

      const getPosition = () => {
        try {
          if (playerSystem.player && playerSystem.player.position && Number.isFinite(playerSystem.player.position.x)) {
            return playerSystem.player.position;
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

      const onPin = (p: any) => {
        const pin = createPin(worldRoot, p);
        const y = terrain?.userData?.['getHeightAt']?.(p.x, p.z);
        if (Number.isFinite(y)) pin.position.y = y;
      };

      const devHudToggle = engineConfig.debug?.overlays?.devHud || { defaultValue: false, devDefault: false };
      const cameraHudToggle = engineConfig.debug?.overlays?.cameraSettings || { defaultValue: false, devDefault: false };

      // Set window flags to enable HUD overlays based on feature toggles
      if (typeof window !== "undefined") {
        (window as any).SHOW_HUD = resolveFeatureToggle(devHudToggle);
        (window as any).SHOW_CAMERA_HUD = resolveFeatureToggle(cameraHudToggle);
        (window as any).SHOW_AUDIO_MIXER = resolveFeatureToggle((engineConfig.debug?.overlays as any)?.audioMixer);
        (window as any).SHOW_EXPOSURE = resolveFeatureToggle((engineConfig.debug?.overlays as any)?.exposureSlider);
        (window as any).SHOW_HOTKEYS = resolveFeatureToggle((engineConfig.debug?.overlays as any)?.hotkeyReference);
      }

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
            onSetLightingPreset: (name: string) => lightingSystem.applyLookProfile(name, { source: "user" }),
            lightingPresets: (lightingSystem as any).LIGHTING_PRESETS,
            getActivePresetName: () => lightingSystem.lastAppliedLightingPreset,
            setActivePreset: (name: string) => lightingSystem.applyLookProfile(name, { source: "user" }),
          },
          fogCallbacks: {
            getFogEnabled: () => fogEnabled,
            onToggleFog: toggleFog,
          },
          sunAlignment: {
            getAzimuthDeg: () => lightingSystem.sunAlignmentState.azimuthDeg,
            getElevationDeg: () => lightingSystem.sunAlignmentState.elevationDeg,
            onChange: (updates: any) => lightingSystem.setSunAlignment(updates),
          },
          onPin,
        });

        devHud = UIManager.getDevHud();
        this.devHud = devHud;
        devHud?.setActivePreset?.(lightingSystem.lastAppliedLightingPreset);

        devHud?.setStatusLine?.("proc", proceduralStatus);
        onFogChange(fogEnabled);
      }
      updateOceanHudStatus();
      if (audioManifestMissing) {
        devHud?.setStatusLine?.("audio", "Audio: Off (no manifest)");
      }
      if (devHud?.setStatusLine) {
        devHud.setStatusLine("proc", proceduralStatus);
      }

      // Add debug water visibility controls
      if (typeof window !== 'undefined') {
        (window as any).toggleWater = () => {
          let count = 0;
          scene.traverse((obj: any) => {
            const isWater = 
              obj.name === 'AegeanOcean' ||
              obj.name === 'HarborLowPolyWater' ||
              obj.name?.toLowerCase().includes('water') ||
              obj.name?.toLowerCase().includes('ocean') ||
              obj.userData?.isWater ||
              (obj.renderOrder === -1 && obj.material?.transparent);
            if (isWater) {
              obj.visible = !obj.visible;
              count++;
            }
          });
          console.log(`🌊 Toggled ${count} water objects`);
        };
        
        (window as any).hideWater = () => {
          let count = 0;
          scene.traverse((obj: any) => {
            const isWater = 
              obj.name === 'AegeanOcean' ||
              obj.name === 'HarborLowPolyWater' ||
              obj.name?.toLowerCase().includes('water') ||
              obj.name?.toLowerCase().includes('ocean') ||
              obj.userData?.isWater ||
              (obj.renderOrder === -1 && obj.material?.transparent);
            if (isWater && obj.visible) {
              obj.visible = false;
              count++;
            }
          });
          console.log(`👻 Hidden ${count} water objects`);
        };
        
        (window as any).showWater = () => {
          let count = 0;
          scene.traverse((obj: any) => {
            const isWater = 
              obj.name === 'AegeanOcean' ||
              obj.name === 'HarborLowPolyWater' ||
              obj.name?.toLowerCase().includes('water') ||
              obj.name?.toLowerCase().includes('ocean') ||
              obj.userData?.isWater;
            if (isWater && !obj.visible) {
              obj.visible = true;
              count++;
            }
          });
          console.log(`👁️ Shown ${count} water objects`);
        };
        
        (window as any).hideRoads = () => {
          let count = 0;
          scene.traverse((obj: any) => {
            const isRoad = 
              obj.name?.toLowerCase().includes('road') ||
              obj.name?.toLowerCase().includes('street') ||
              obj.name?.toLowerCase().includes('path') ||
              obj.userData?.type === 'road' ||
              obj.userData?.isFootpath;
            if (isRoad && obj.visible) {
              obj.visible = false;
              count++;
            }
          });
          console.log(`🚫 Hidden ${count} road objects (including footpaths)`);
        };
        
        (window as any).showRoads = () => {
          let count = 0;
          scene.traverse((obj: any) => {
            const isRoad = 
              obj.name?.toLowerCase().includes('road') ||
              obj.name?.toLowerCase().includes('street') ||
              obj.name?.toLowerCase().includes('path') ||
              obj.userData?.type === 'road' ||
              obj.userData?.isFootpath;
            if (isRoad && !obj.visible) {
              obj.visible = true;
              count++;
            }
          });
          console.log(`✅ Shown ${count} road objects (including footpaths)`);
        };
        
        (window as any).debugOcean = () => {
          const oceanObj = scene.getObjectByName('AegeanOcean');
          if (!oceanObj) {
            console.log('❌ Ocean not found');
            return;
          }
          console.log('🌊 Ocean Debug Info:');
          console.log('  Position:', oceanObj.position);
          console.log('  Scale:', oceanObj.scale);
          console.log('  Name:', oceanObj.name);
          console.log('  Visible:', oceanObj.visible);
          console.log('  Expected bounds: X=[1500, 2300], Z=[-400, 400]');
          const playerPos = playerSystem?.player?.object?.position;
          console.log('  Player position:', playerPos ? `X=${playerPos.x.toFixed(1)}, Y=${playerPos.y.toFixed(1)}, Z=${playerPos.z.toFixed(1)}` : 'unknown');
        };
        
        (window as any).debugCivicDistrict = () => {
          console.log('🏛️ Civic District Debug:');
          let roadCount = 0;
          let footpathCount = 0;
          let plazaCount = 0;
          scene.traverse((obj: any) => {
            if (obj.userData?.isFootpath) {
              footpathCount++;
              console.log(`  Footpath at (${obj.position.x.toFixed(1)}, ${obj.position.z.toFixed(1)}), visible: ${obj.visible}, color: ${obj.material?.color?.getHexString()}`);
            }
            if (obj.geometry?.type === 'BoxGeometry' && obj.position.y < 0.5 && obj.material?.color) {
              const hex = obj.material.color.getHexString();
              if (hex === '887766' || hex === '666666' || hex === '998877' || hex === 'aa9988') {
                roadCount++;
                console.log(`  Road/path at (${obj.position.x.toFixed(1)}, ${obj.position.z.toFixed(1)}), visible: ${obj.visible}, color: #${hex}`);
              }
              if (hex === 'aaaaaa') {
                plazaCount++;
                console.log(`  Plaza at (${obj.position.x.toFixed(1)}, ${obj.position.z.toFixed(1)}), visible: ${obj.visible}`);
              }
            }
          });
          console.log(`  Total: ${roadCount} roads, ${footpathCount} footpaths, ${plazaCount} plazas`);
        };
        
        (window as any).findBrightObjects = () => {
          console.log('💡 Finding bright/white objects in scene:');
          const brightObjects: any[] = [];
          scene.traverse((obj: any) => {
            if (obj.material?.color) {
              const hex = obj.material.color.getHexString();
              const r = obj.material.color.r;
              const g = obj.material.color.g;
              const b = obj.material.color.b;
              // Consider "bright" if average RGB > 0.8 (in 0-1 range)
              const brightness = (r + g + b) / 3;
              if (brightness > 0.8) {
                brightObjects.push({
                  name: obj.name || 'unnamed',
                  type: obj.geometry?.type || 'unknown',
                  position: `(${obj.position.x.toFixed(1)}, ${obj.position.y.toFixed(1)}, ${obj.position.z.toFixed(1)})`,
                  color: `#${hex}`,
                  visible: obj.visible,
                  brightness: brightness.toFixed(2)
                });
              }
            }
          });
          console.table(brightObjects);
          console.log(`Found ${brightObjects.length} bright objects (brightness > 0.8)`);
          return brightObjects;
        };
        
        console.log('✅ Water controls available: hideWater(), showWater(), toggleWater()');
        console.log('✅ Road controls available: hideRoads(), showRoads()');
        console.log('✅ Debug: debugOcean() to check ocean position');
        console.log('✅ Debug: debugCivicDistrict() to inspect civic district elements');
        console.log('✅ Debug: findBrightObjects() to locate white/bright meshes');

        renderer.domElement.addEventListener("pointerdown", (event: PointerEvent) => {
          if (event.button === 0) {
            interactor.useObject();
          }
        });

        window.addEventListener("keydown", (event) => {
          if (event.code === "KeyE") {
            interactor.useObject();
          } else if (event.code === "KeyG" && !event.repeat) {
            toggleFog();
          } else if (event.code === "KeyT" && !event.repeat) {
              (lightingSystem as any).cycleLightingPreset();
          } else if (event.code === "F8" && !event.repeat) {
            const position = playerSystem.player?.object?.position;
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
    }

  waitForAdvance(target = document.body) {
    return new Promise<void>((resolve) => {
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

      const onKeyDown = (event: KeyboardEvent) => {
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
      this.sceneContext.scene.traverse((object: any) => {
        if (!object.isMesh) return;

        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((mat: any) => {
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
