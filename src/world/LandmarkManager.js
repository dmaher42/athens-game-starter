// src/world/LandmarkManager.js
// -----------------------------------------------------------------------------
// A lightweight coordinator that reads the declarative Athens layout config and
// turns each entry into an in-game landmark.  The manager keeps all of the
// tricky book-keeping in one place:
//   • resolving asset URLs relative to the project base path
//   • snapping positions to the sampled terrain
//   • retrying fallbacks when the preferred model is absent
//   • marking meshes as collidable and refreshing the shared environment collider
//   • optionally spawning a handcrafted placeholder monument when nothing loads
// By funnelling the configuration through this helper we keep `main.js`
// approachable for beginners while still supporting historically rich layouts.
// -----------------------------------------------------------------------------

import * as THREE from "three";
import { loadLandmark } from "./landmarks.js";
import { SEA_LEVEL_Y } from "./locations.js";
import { snapAboveGround } from "./ground.js";
import { resolveBaseUrl, joinPath } from "../utils/baseUrl.js";
import { buildTemple } from "../features/temples.js";

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function mergeSettings(...sources) {
  const output = {};
  for (const source of sources) {
    if (!isPlainObject(source)) continue;
    for (const [key, value] of Object.entries(source)) {
      if (isPlainObject(value)) {
        output[key] = mergeSettings(output[key], value);
      } else if (Array.isArray(value)) {
        output[key] = [...value];
      } else {
        output[key] = value;
      }
    }
  }
  return output;
}

function cloneVector3Like(value) {
  if (!value) return null;
  if (value.isVector3) return value.clone();
  if (Array.isArray(value)) {
    return new THREE.Vector3(value[0] ?? 0, value[1] ?? 0, value[2] ?? 0);
  }
  if (typeof value === "object") {
    const { x = 0, y = 0, z = 0 } = value;
    return new THREE.Vector3(x, y, z);
  }
  if (typeof value === "number") {
    return new THREE.Vector3(value, value, value);
  }
  return null;
}

function cloneEulerLike(value, fallbackY = 0) {
  if (!value) return new THREE.Euler(0, fallbackY, 0);
  if (value.isEuler) return value.clone();
  if (Array.isArray(value)) {
    return new THREE.Euler(value[0] ?? 0, value[1] ?? fallbackY, value[2] ?? 0);
  }
  if (typeof value === "object") {
    return new THREE.Euler(
      value.x ?? value.pitch ?? 0,
      value.y ?? value.yaw ?? fallbackY,
      value.z ?? value.roll ?? 0
    );
  }
  if (typeof value === "number") {
    return new THREE.Euler(0, value, 0);
  }
  return new THREE.Euler(0, fallbackY, 0);
}

function cloneTransformOptions(options = {}) {
  const cloned = { ...options };
  if (options.position) {
    cloned.position = cloneVector3Like(options.position);
  }
  if (options.rotation) {
    cloned.rotation = cloneEulerLike(options.rotation);
  }
  if (options.scale?.isVector3) {
    cloned.scale = options.scale.clone();
  } else if (Array.isArray(options.scale)) {
    cloned.scale = [...options.scale];
  } else if (isPlainObject(options.scale)) {
    cloned.scale = { ...options.scale };
  }
  return cloned;
}

const PROCEDURAL_BUILDERS = {
  temple: buildTemple,
};

export class LandmarkManager {
  constructor({
    scene = null,
    parent = null,
    terrain = null,
    heightSampler = null,
    envCollider = null,
    renderer = null,
    spawnPlaceholder = null,
    logger = console,
    quietMissing = false,
    forceProcedural = false,
  } = {}) {
    this.scene = scene;
    this.parent = parent || scene;
    this.terrain = terrain;
    this.heightSampler =
      typeof heightSampler === "function"
        ? heightSampler
        : scene?.userData?.getHeightAt || null;
    this.envCollider = envCollider;
    this.renderer = renderer;
    this.spawnPlaceholder = typeof spawnPlaceholder === "function" ? spawnPlaceholder : null;
    this.logger = logger || console;
    this.quietMissing = !!quietMissing;
    this.baseUrl = resolveBaseUrl();
    this.globalDefaults = {};
    this.results = [];
    this.options = {
      forceProcedural: Boolean(forceProcedural),
    };
  }

  setTerrain(terrain) {
    this.terrain = terrain;
  }

  setHeightSampler(sampler) {
    if (typeof sampler === "function") {
      this.heightSampler = sampler;
    }
  }

  setParent(parent) {
    this.parent = parent || this.scene;
  }

  setSpawnPlaceholder(spawnPlaceholder) {
    this.spawnPlaceholder = typeof spawnPlaceholder === "function" ? spawnPlaceholder : null;
  }

  resolveSurfaceOffset(spec = {}) {
    const placementOffset = spec.placement?.surfaceOffset;
    if (typeof placementOffset === "number") return placementOffset;
    if (typeof spec.surfaceOffset === "number") return spec.surfaceOffset;
    if (typeof this.globalDefaults.surfaceOffset === "number") {
      return this.globalDefaults.surfaceOffset;
    }
    return 0.05;
  }

  resolveSnapOptions(spec = {}) {
    const merged = mergeSettings(
      { clampToSea: true, seaLevel: SEA_LEVEL_Y },
      this.globalDefaults.snapOptions,
      spec.snapOptions,
      spec.placement?.snapOptions
    );
    if (typeof merged.minAboveSea !== "number") {
      merged.minAboveSea = 0.02;
    }
    if (typeof merged.seaLevel !== "number") {
      merged.seaLevel = SEA_LEVEL_Y;
    }
    return merged;
  }

  resolvePosition(spec = {}) {
    const placement = spec.placement || {};
    const alignPreference =
      placement.alignToTerrain ?? spec.alignToTerrain ?? this.globalDefaults.alignToTerrain;
    const shouldAlign = alignPreference !== false;
    const position = cloneVector3Like(placement.position);
    if (!position) return null;

    const offset = this.resolveSurfaceOffset(spec);
    if (shouldAlign && typeof this.heightSampler === "function") {
      const sampled = this.heightSampler(position.x, position.z);
      if (Number.isFinite(sampled)) {
        position.y = sampled + offset;
      } else if (!Number.isFinite(position.y)) {
        position.y = offset;
      }
    } else if (!Number.isFinite(position.y)) {
      position.y = offset;
    }

    return position;
  }

  prepareTransform(spec = {}) {
    const placement = spec.placement || {};
    const options = mergeSettings(this.globalDefaults.loadOptions, spec.loadOptions);
    if (this.renderer && typeof options.renderer === "undefined") {
      options.renderer = this.renderer;
    }

    const position = this.resolvePosition(spec);
    if (position) {
      options.position = position;
    }

    const rotation = placement.rotation || placement.euler;
    const rotateY =
      typeof placement.rotateY === "number"
        ? placement.rotateY
        : typeof spec.rotateY === "number"
        ? spec.rotateY
        : undefined;
    if (rotation || typeof rotateY === "number") {
      options.rotation = cloneEulerLike(rotation, rotateY ?? 0);
    }

    if (placement.scale !== undefined) {
      options.scale = placement.scale;
    } else if (spec.scale !== undefined) {
      options.scale = spec.scale;
    }

    if (spec.materialPreset && !options.materialPreset) {
      options.materialPreset = spec.materialPreset;
    }

    return {
      options,
      position: options.position ? cloneVector3Like(options.position) : null,
      rotation: options.rotation ? options.rotation.clone?.() ?? cloneEulerLike(options.rotation) : null,
      scale: placement.scale ?? spec.scale,
      surfaceOffset: this.resolveSurfaceOffset(spec),
      snapOptions: this.resolveSnapOptions(spec),
    };
  }

  resolveUrls(files = []) {
    const urls = [];
    const seen = new Set();
    const push = (value) => {
      if (typeof value !== "string") return;
      const trimmed = value.trim();
      if (!trimmed) return;
      if (seen.has(trimmed)) return;
      seen.add(trimmed);
      urls.push(trimmed);
    };

    for (const file of files) {
      if (typeof file !== "string") continue;
      const trimmed = file.trim();
      if (!trimmed) continue;

      if (/^https?:/i.test(trimmed) || trimmed.startsWith("data:")) {
        push(trimmed);
        continue;
      }

      const normalised = sanitizeRelativePath(trimmed);
      if (!normalised) continue;
      push(joinPath(this.baseUrl, normalised));
      push(normalised);
    }

    return urls;
  }

  applyCollisionSettings(object, shouldCollide) {
    if (!object) return;
    const collidable = Boolean(shouldCollide);
    object.traverse?.((child) => {
      if (!child?.isMesh) return;
      child.userData = child.userData || {};
      child.userData.noCollision = !collidable;
    });
    if (collidable && typeof this.envCollider?.refresh === "function") {
      this.envCollider.refresh();
    }
  }

  resolveProceduralBuilder(name) {
    if (!name) return null;
    const normalized = String(name).trim().toLowerCase();
    return PROCEDURAL_BUILDERS[normalized] || null;
  }

  applyTransformToObject(object, transformInfo) {
    if (!object || !transformInfo) return;
    const { position, rotation, scale } = transformInfo;

    if (position && object.position) {
      if (typeof object.position.copy === "function") {
        object.position.copy(position);
      } else {
        object.position.set(position.x ?? position[0] ?? 0, position.y ?? position[1] ?? 0, position.z ?? position[2] ?? 0);
      }
    }

    if (rotation && object.rotation) {
      if (typeof object.rotation.copy === "function") {
        object.rotation.copy(rotation);
      } else {
        object.rotation.set(
          rotation.x ?? rotation[0] ?? 0,
          rotation.y ?? rotation[1] ?? 0,
          rotation.z ?? rotation[2] ?? 0
        );
      }
    }

    if (scale !== undefined && object.scale) {
      if (typeof scale === "number") {
        object.scale.setScalar(scale);
      } else if (scale?.isVector3) {
        object.scale.copy(scale);
      } else if (Array.isArray(scale)) {
        object.scale.set(scale[0] ?? object.scale.x, scale[1] ?? object.scale.y, scale[2] ?? object.scale.z);
      } else if (isPlainObject(scale)) {
        object.scale.set(
          scale.x ?? scale.width ?? object.scale.x,
          scale.y ?? scale.height ?? object.scale.y,
          scale.z ?? scale.depth ?? object.scale.z
        );
      }
    }
  }

  async spawnProcedural(spec = {}, transformInfo = {}, overrides = {}) {
    const procNameRaw = overrides.proc || spec.proc || spec.kind;
    if (!procNameRaw) {
      return null;
    }

    const builder = this.resolveProceduralBuilder(procNameRaw);
    if (typeof builder !== "function") {
      if (!this.quietMissing) {
        const label = spec.name || spec.id || "landmark";
        this.logMessage(
          "warn",
          `[LandmarkManager] Unknown procedural builder '${procNameRaw}' for ${label}.`
        );
      }
      return null;
    }

    const params = { ...(spec.params || {}) };
    if (isPlainObject(overrides.params)) {
      Object.assign(params, overrides.params);
    }
    if (spec.materialPreset && params.materialPreset == null) {
      params.materialPreset = spec.materialPreset;
    }
    if (typeof overrides.materialPreset === "string" && !params.materialPreset) {
      params.materialPreset = overrides.materialPreset;
    }
    if (overrides.scale != null && params.scale == null) {
      params.scale = overrides.scale;
    }

    let builtObject = null;
    try {
      builtObject = await builder(params);
    } catch (error) {
      this.logMessage(
        "warn",
        `[LandmarkManager] Procedural builder '${procNameRaw}' failed: ${error?.message || error}`
      );
      return null;
    }

    if (!builtObject) {
      return null;
    }

    this.reparent(builtObject);
    this.applyTransformToObject(builtObject, transformInfo);
    this.snapObject(builtObject, transformInfo);
    const shouldCollide = overrides.collision ?? spec.collision ?? true;
    this.applyCollisionSettings(builtObject, shouldCollide);
    builtObject.updateMatrixWorld?.(true);
    if (shouldCollide && typeof this.envCollider?.refresh === "function") {
      this.envCollider.refresh();
    }
    return builtObject;
  }

  async spawnProceduralFallback(spec = {}, transformInfo = {}, context = {}) {
    if (spec.type === "procedural" && !context.force) {
      return null;
    }

    const fallbackProc = context.proc || context.kind || spec.proc || "temple";
    const mergedParams = { ...(spec.params || {}) };
    if (isPlainObject(context.params)) {
      Object.assign(mergedParams, context.params);
    }
    const materialPreset = context.materialPreset || spec.materialPreset;
    if (materialPreset && mergedParams.materialPreset == null) {
      mergedParams.materialPreset = materialPreset;
    }
    if (context.scale != null) {
      mergedParams.scale = context.scale;
    }

    if (!this.quietMissing) {
      const label = spec.name || spec.id || "landmark";
      this.logMessage("info", `[LandmarkManager] Using procedural fallback '${fallbackProc}' for ${label}.`);
    }

    return this.spawnProcedural(
      {
        ...spec,
        type: "procedural",
        proc: fallbackProc,
        params: mergedParams,
        collision: context.collision ?? spec.collision ?? true,
      },
      transformInfo,
      {
        proc: fallbackProc,
        params: mergedParams,
        collision: context.collision ?? spec.collision ?? true,
        materialPreset,
        scale: mergedParams.scale,
        force: true,
      }
    );
  }

  snapObject(object, transformInfo) {
    if (!object || !transformInfo?.position) return;
    const { position, surfaceOffset, snapOptions } = transformInfo;
    const x = position.x ?? object.position?.x;
    const z = position.z ?? object.position?.z;
    if (!Number.isFinite(x) || !Number.isFinite(z)) return;

    if (this.terrain) {
      snapAboveGround(object, this.terrain, x, z, surfaceOffset, snapOptions);
    }
  }

  reparent(object) {
    if (!object || !this.parent || object.parent === this.parent) {
      return;
    }
    object.parent?.remove?.(object);
    this.parent.add(object);
  }

  logMessage(level, message) {
    if (!message) return;
    const logger = this.logger || console;
    if (typeof logger?.[level] === "function") {
      logger[level](message);
    } else if (typeof logger?.log === "function") {
      logger.log(message);
    }
  }

  spawnFallbackPlaceholder(spec, transformInfo) {
    const placeholderConfig = spec.placeholder || {};
    if (placeholderConfig.enabled === false) {
      return null;
    }
    if (typeof this.spawnPlaceholder !== "function") {
      return null;
    }

    const settings = { ...placeholderConfig };
    delete settings.enabled;

    if (!settings.position) {
      settings.position = transformInfo?.position
        ? transformInfo.position.clone?.() ?? cloneVector3Like(transformInfo.position)
        : null;
    }
    if (typeof settings.rotateY !== "number" && transformInfo?.rotation) {
      settings.rotateY = transformInfo.rotation.y;
    }
    if (settings.scale === undefined && transformInfo?.scale !== undefined) {
      settings.scale = transformInfo.scale;
    }
    if (settings.collision === undefined) {
      settings.collision = Boolean(spec.collision);
    }
    if (!settings.parent) {
      settings.parent = this.parent || this.scene;
    }

    try {
      return this.spawnPlaceholder(settings);
    } catch (error) {
      this.logMessage(
        "warn",
        `[LandmarkManager] Failed to spawn placeholder for ${spec.name || spec.id || "landmark"}`
      );
      this.logMessage("warn", error);
      return null;
    }
  }

  async attemptLoad(urls, spec, transformInfo, label) {
    if (!urls.length) return null;
    if (spec?.type === "procedural") {
      return this.placeProcedural(spec);
    }

    const name = spec.name || spec.id || "Landmark";
    for (const url of urls) {
      const loadOptions = cloneTransformOptions(transformInfo.options);
      loadOptions.proceduralFallback = (context = {}) =>
        this.spawnProceduralFallback(spec, transformInfo, context);
      loadOptions.forceProcedural = this.options?.forceProcedural === true;
      try {
        const object = await loadLandmark(this.scene, url, loadOptions);
        if (!object) continue;
        this.reparent(object);
        this.snapObject(object, transformInfo);
        this.applyCollisionSettings(object, spec.collision);
        if (typeof spec.onLoaded === "function") {
          try {
            spec.onLoaded(object, { url, label });
          } catch (hookError) {
            this.logMessage(
              "warn",
              `[LandmarkManager] onLoaded hook failed for ${name}: ${hookError?.message || hookError}`
            );
          }
        }
        return { object, url };
      } catch (error) {
        this.logMessage(
          "warn",
          `[LandmarkManager] ${name} failed to load from ${url}${label === "fallback" ? " (fallback)" : ""}`
        );
        this.logMessage("warn", error);
      }
    }
    return null;
  }

  async placeLandmark(spec = {}) {
    const name = spec.name || spec.id || "Landmark";
    const transformInfo = this.prepareTransform(spec);
    const type = typeof spec.type === "string" ? spec.type.trim().toLowerCase() : "";
    const forceProcedural = this.options?.forceProcedural === true;
    const wantsProcedural = type === "procedural" || Boolean(spec.proc);
    const shouldProcedural = forceProcedural || wantsProcedural;

    if (shouldProcedural) {
      const forcedProcName = spec.proc || spec.kind || "temple";
      const procSpec = {
        ...spec,
        type: "procedural",
        proc: forcedProcName,
      };
      const object = await this.spawnProcedural(procSpec, transformInfo, {
        proc: forcedProcName,
        collision: spec.collision,
      });
      if (!object) {
        if (!this.quietMissing) {
          this.logMessage(
            "warn",
            `[LandmarkManager] Failed to spawn procedural landmark ${name}.`
          );
        }
        this.spawnFallbackPlaceholder(spec, transformInfo);
      }
      return object ?? null;
    }

    if (forceProcedural) {
      return null;
    }

    const primaryUrls = this.resolveUrls(spec.assetFiles || []);
    const fallbackUrls = this.resolveUrls(spec.fallbackFiles || []);
    const messages = spec.messages || {};

    if (!primaryUrls.length && messages.missingPrimary && !this.quietMissing) {
      this.logMessage("info", messages.missingPrimary);
    }

    let result = await this.attemptLoad(primaryUrls, spec, transformInfo, "primary");

    if (!result && fallbackUrls.length) {
      if (messages.missingPrimary && !this.quietMissing) {
        this.logMessage("info", messages.missingPrimary);
      }
      const fallbackResult = await this.attemptLoad(fallbackUrls, spec, transformInfo, "fallback");
      if (fallbackResult) {
        if (messages.fallbackUsed && !this.quietMissing) {
          this.logMessage("info", messages.fallbackUsed);
        }
        result = fallbackResult;
      } else if (messages.fallbackMissing && !this.quietMissing) {
        this.logMessage("warn", messages.fallbackMissing);
      }
    }

    if (!result) {
      if (!fallbackUrls.length && messages.allMissing && !this.quietMissing) {
        this.logMessage("info", messages.allMissing);
      }
      this.spawnFallbackPlaceholder(spec, transformInfo);
    }

    return result?.object ?? null;
  }

  async loadConfig(config) {
    if (!config) return [];
    this.globalDefaults = mergeSettings(config.defaults);
    this.results = [];

    const groups = Array.isArray(config.groups) ? config.groups : [];
    for (const group of groups) {
      if (group?.enabled === false) {
        continue;
      }
      const groupDefaults = mergeSettings(this.globalDefaults, group?.defaults);
      const landmarks = Array.isArray(group?.landmarks) ? group.landmarks : [];
      for (const entry of landmarks) {
        if (entry?.enabled === false) {
          continue;
        }
        const spec = mergeSettings(groupDefaults, entry);
        spec.groupId = group?.id;
        spec.groupLabel = group?.label;
        const object = await this.placeLandmark(spec);
        this.results.push({ spec, object });
      }
    }

    if (config.metadata?.description) {
      this.logMessage(
        "info",
        `[LandmarkManager] Loaded ${this.results.length} landmarks: ${config.metadata.description}`
      );
    } else {
      this.logMessage("info", `[LandmarkManager] Loaded ${this.results.length} landmarks.`);
    }

    return this.results;
  }
}

export default LandmarkManager;
function sanitizeRelativePath(value) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/^public\//i, "")
    .replace(/^docs\//i, "")
    .replace(/^\.\//, "")
    .replace(/^\/+/, "");
}
function applyTransformToObject(object, options = {}) {
  if (!object) return;
  const { position, rotation, scale } = options;
  if (position) {
    object.position.set(
      position.x ?? position[0] ?? 0,
      position.y ?? position[1] ?? 0,
      position.z ?? position[2] ?? 0
    );
  }
  if (rotation) {
    object.rotation.set(
      rotation.x ?? rotation[0] ?? 0,
      rotation.y ?? rotation[1] ?? 0,
      rotation.z ?? rotation[2] ?? 0
    );
  }
  if (scale !== undefined) {
    if (typeof scale === "number") {
      object.scale.setScalar(scale);
    } else if (scale?.isVector3) {
      object.scale.copy(scale);
    } else if (Array.isArray(scale)) {
      const sx = scale[0] ?? 1;
      const sy = scale[1] ?? sx;
      const sz = scale[2] ?? sx;
      object.scale.set(sx, sy, sz);
    } else if (typeof scale === "object") {
      const sx = scale.x ?? 1;
      const sy = scale.y ?? sx;
      const sz = scale.z ?? sx;
      object.scale.set(sx, sy, sz);
    }
  }
}

