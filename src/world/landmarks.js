import * as THREE from "three";
import { LOD } from "three";
import { IS_DEV } from "../utils/env.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  resolveKTX2TranscoderPath,
  DEFAULT_BASIS_TRANSCODER_PATH,
} from "../utils/ktx2.js";
import { loadGLBWithFallbacks, createGLTFLoader } from "../utils/glbSafeLoader.js";
import { resolveBaseUrl, joinPath } from "../utils/baseUrl.js";
import {
  makeMarbleMaterial,
  makeBronzeMaterial,
  makeMediterraneanPlasterMaterial,
} from "./materials.js";
import { queueSceneInteractable } from "./interactions.js";
import { buildTemple } from "../features/temples.js";
import { applyForegroundFogPolicy } from "../utils/materialUtils.js";

const ENABLE_GLB_MODE = false;

/**
 * Example usage:
 *
 * ```js
 * await loadLandmark(scene, "models/landmarks/aristotle_tomb.glb", {
 *   position: ACROPOLIS_PEAK_3D,
 *   targetHeight: 18,
 * });
 * ```
 */

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

function deriveGithubRawCandidates(relativePath) {
  if (typeof window === "undefined") return [];

  const { hostname, pathname } = window.location || {};
  if (!hostname || !pathname) return [];

  const hostMatch = hostname.match(/^([^.:]+)\.github\.io$/i);
  if (!hostMatch) return [];

  const owner = hostMatch[1];
  const segments = pathname.split("/").filter(Boolean);
  if (!segments.length) return [];

  const repo = segments[0];
  let sanitizedRelative = String(relativePath || "").replace(/^\/+/, "");
  // Strip repo segment to avoid double-prefixing (e.g., athens-game-starter/athens-game-starter/...)
  const repoPrefix = `${repo}/`;
  if (sanitizedRelative.toLowerCase().startsWith(repoPrefix.toLowerCase())) {
    sanitizedRelative = sanitizedRelative.slice(repoPrefix.length);
  }
  if (!sanitizedRelative) return [];

  const pathCandidates = new Set([sanitizedRelative]);
  if (!sanitizedRelative.toLowerCase().startsWith("public/")) {
    pathCandidates.add(`public/${sanitizedRelative}`);
  }
  if (!sanitizedRelative.toLowerCase().startsWith("docs/")) {
    pathCandidates.add(`docs/${sanitizedRelative}`);
  }

  const branches = ["main", "master", "gh-pages"];
  const urls = [];

  for (const branch of branches) {
    for (const candidate of pathCandidates) {
      urls.push(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${candidate}`);
    }
  }

  return urls;
}

async function headOk(url) {
  if (!url) return false;
  try {
    const response = await fetch(url, { method: "HEAD", cache: "no-cache" });
    if (!response.ok) return false;
    const contentType = response.headers?.get?.("content-type") || "";
    return !contentType.toLowerCase().includes("text/html");
  } catch {
    return false;
  }
}
const missingLandmarkWarnings = new Set();

function warnMissingLandmark(key, message) {
  if (!key) return;
  if (missingLandmarkWarnings.has(key)) {
    return;
  }
  missingLandmarkWarnings.add(key);
  if (IS_DEV) console.warn(message);
}

// Reuse a single loader instance so we don't repeatedly allocate it whenever we
// load a new landmark. GLTFLoader understands the .glb format which packages a
// model and all of its textures into one binary file.
// Shared GLTF loader instance for every landmark. We hook a KTX2Loader into it
// so GPU-compressed textures decode automatically without changing the rest of
// our asset pipeline.
let loader = null;
let ktx2Loader = null;
let supportsKTX2 = false;
let hasWarnedUnsupportedKTX2 = false;
let currentTranscoderPath = null;
let hasLoggedCdnFallback = false;

/**
 * Initialise everything related to landmark loading.
 *
 * Texture compression squishes big image files into formats that GPUs can read
 * directly, so we avoid re-expanding textures on the CPU at runtime. KTX2 / Basis
 * is a GPU-native family that keeps downloads tiny, uploads textures faster, and
 * dramatically lowers VRAM usage once the model is on screen.
 *
 * You can generate `.ktx2` textures with CLI tools such as:
 *   - `basisu texture.png -ktx2 -uastc` for individual images
 *   - `gltfpack -i model.glb -o model.ktx2.glb -tc` to transcode every texture
 *     inside a GLB. These ship alongside transcoder files placed in `/public/basis/`.
 * When compressed textures are missing the GLTFLoader quietly falls back to
 * whatever JPEG or PNG data is already bundled with the model, so older assets
 * continue to render without any changes.
 */
export async function initializeAssetTranscoders(renderer) {
  if (!ENABLE_GLB_MODE) return null;
  if (!renderer || typeof renderer.getContext !== "function") {
    return;
  }

  // Lazy-load GLTFLoader if not already created
  if (!loader) {
    loader = await createGLTFLoader(renderer);
  }

  const transcoderPath = resolveKTX2TranscoderPath();

  if (!ktx2Loader) {
    const { KTX2Loader } = await import("three/examples/jsm/loaders/KTX2Loader.js");
    ktx2Loader = new KTX2Loader();
  }

  if (transcoderPath && transcoderPath !== currentTranscoderPath) {
    ktx2Loader.setTranscoderPath(transcoderPath);
    currentTranscoderPath = transcoderPath;

    if (
      !hasLoggedCdnFallback &&
      transcoderPath === DEFAULT_BASIS_TRANSCODER_PATH
    ) {
      if (IS_DEV) console.info(
        "KTX2 transcoder path not configured; falling back to the three.js CDN. Add public/basis/ or set VITE_BASIS_TRANSCODER_PATH to avoid extra requests."
      );
      hasLoggedCdnFallback = true;
    }
  }

  try {
    ktx2Loader.detectSupport(renderer);
    const supportFlags = ktx2Loader.workerConfig || {};
    supportsKTX2 = Object.values(supportFlags).some(Boolean);

    if (!supportsKTX2) {
      if (!hasWarnedUnsupportedKTX2) {
        if (IS_DEV) console.warn(
          "KTX2 is not supported on this GPU/driver combo. Falling back to standard textures."
        );
        hasWarnedUnsupportedKTX2 = true;
      }
      loader.setKTX2Loader(null);
    } else {
      loader.setKTX2Loader(ktx2Loader);
      hasWarnedUnsupportedKTX2 = false;
    }

    loader.setMeshoptDecoder(MeshoptDecoder);
  } catch (error) {
    supportsKTX2 = false;
    hasWarnedUnsupportedKTX2 = true;
    console.warn(
      "KTX2 not supported in this browser. Falling back to standard textures.",
      error
    );
    loader.setKTX2Loader(null);
  }
}

/* PATCH: Harbor landmark group (lighthouse, clocktower, sculpture) + simple placer */
export const HARBOR_LANDMARKS = [
  { name: "HarborLighthouse", type: "lighthouse", pos: [24, 0, -60], yawDeg: 135, radius: 8 },
  { name: "ClockTower",      type: "clocktower",  pos: [-10, 6, -24], yawDeg: 0,   radius: 6 },
  { name: "HarborSculpture", type: "sculpture",   pos: [  6, 0, -10], yawDeg: 40,  radius: 4 }
];

// Minimal fallbacks if GLB assets are missing
export function createHarborLandmarkFallback(type, THREE) {
  if (type === "lighthouse") {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.0, 9.5, 16), new THREE.MeshStandardMaterial({ color:"#e7e0d6", roughness:0.7, fog: false })));
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.9, 1.4, 16), new THREE.MeshStandardMaterial({ color:"#b4472c", roughness:0.6, fog: false }));
    cap.position.y = 5.5; g.add(cap);
    const lamp = new THREE.PointLight("#ffd26a", 2.1, 40, 2.0); lamp.position.y = 6.2; g.add(lamp);
    applyForegroundFogPolicy(g);
    return g;
  }
  if (type === "clocktower") {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(3.2, 10.5, 3.2), new THREE.MeshStandardMaterial({ color:"#f5efe3", roughness:0.75, fog: false })));
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.8, 24), new THREE.MeshStandardMaterial({ color:"#ffffff", emissive:"#ffe6bf", emissiveIntensity:0.15, fog: false }));
    face.position.set(0, 2.5, 1.65); g.add(face);
    applyForegroundFogPolicy(g);
    return g;
  }
  // sculpture
  const g = new THREE.Group();
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 2.2), new THREE.MeshStandardMaterial({ color:"#d9d3c7", roughness:0.8, fog: false }));
  plinth.position.y = 0.4; g.add(plinth);
  const form = new THREE.Mesh(new THREE.TorusKnotGeometry(0.9, 0.25, 80, 10), new THREE.MeshStandardMaterial({ color:"#b5a689", roughness:0.55, metalness:0.15, fog: false }));
  form.position.y = 1.6; g.add(form);
  applyForegroundFogPolicy(g);
  return g;
}

/** Place harbor landmarks and reserve nearby pads so buildings won’t overlap */
export function placeHarborLandmarks({ THREE, scene, lots, getHeightAt, seaLevel=0, loadModel }) {
  const reserve = (center, r) => {
    const r2 = r*r;
    for (const lot of lots) {
      const dx = lot.pos.x - center.x, dz = lot.pos.z - center.z;
      if (dx*dx + dz*dz <= r2) lot.blocked = true;
    }
  };
  for (const lm of HARBOR_LANDMARKS) {
    const yaw = THREE.MathUtils.degToRad(lm.yawDeg || 0);
    const y = typeof getHeightAt === "function" ? getHeightAt(lm.pos[0], lm.pos[2]) : (lm.pos[1] ?? seaLevel);
    const at = new THREE.Vector3(lm.pos[0], y, lm.pos[2]);
    let obj = null;
    if (typeof loadModel === "function") obj = loadModel(lm.type) || null;
    if (!obj) obj = createHarborLandmarkFallback(lm.type, THREE);
    obj.position.copy(at); obj.rotation.y = yaw; scene.add(obj);
    reserve(at, lm.radius ?? 6);
  }
}

// Backwards compatible helper that aligns with older tutorials calling
// `initLandmarks(scene, renderer)`. We simply set up the compression pipeline
// and return the scene reference untouched so existing code keeps working.
export function initLandmarks(scene, renderer) {
  initializeAssetTranscoders(renderer);
  return scene;
}

// Keep track of everything we add to the world so we can tear it all down later
// when the player leaves the area or reloads the scene.
const trackedLandmarks = new Set();

function resolveRenderer(scene, explicitRenderer = null) {
  if (explicitRenderer) {
    return explicitRenderer;
  }

  let current = scene || null;
  while (current) {
    const candidate = current?.userData?.renderer;
    if (candidate) {
      return candidate;
    }
    current = current.parent || null;
  }

  return null;
}

function applyTransform(object, options) {
  const { position, rotation, scale } = options;

  if (position) {
    object.position.set(position.x ?? position[0] ?? 0, position.y ?? position[1] ?? 0, position.z ?? position[2] ?? 0);
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
      object.scale.set(scale, scale, scale);
    } else {
      const sx = scale.x ?? scale[0] ?? 1;
      const sy = scale.y ?? scale[1] ?? sx;
      const sz = scale.z ?? scale[2] ?? sx;
      object.scale.set(sx, sy, sz);
    }
  }
}

function liftObjectAboveGround(scene, object, offset = 0.05) {
  if (!scene || !object) return null;

  const candidates = [];
  const sceneUserData = scene.userData || {};

  candidates.push(
    sceneUserData.getHeightAt,
    sceneUserData.terrainHeightSampler,
    sceneUserData.heightSampler,
    sceneUserData.terrainSampler
  );

  const terrain = sceneUserData.terrain;
  if (terrain?.userData?.getHeightAt) {
    candidates.push(terrain.userData.getHeightAt);
  }

  let sampler = null;
  for (const candidate of candidates) {
    if (typeof candidate === "function") {
      sampler = candidate;
      break;
    }
  }

  if (!sampler || !object.position) {
    return null;
  }

  const { x, z } = object.position;
  if (!Number.isFinite(x) || !Number.isFinite(z)) {
    return null;
  }

  const ground = sampler(x, z);
  if (!Number.isFinite(ground)) {
    return null;
  }

  const currentY = Number.isFinite(object.position.y) ? object.position.y : 0;
  const desiredY = Math.max(currentY, ground + offset);
  if (Number.isFinite(desiredY)) {
    object.position.y = desiredY;
    return desiredY;
  }
  return null;
}

function disposeObject(object, scene) {
  if (!object) return;
  if (scene) {
    scene.remove(object);
  }

  object.traverse?.((child) => {
    if (child.isMesh) {
      child.geometry?.dispose?.();
      if (Array.isArray(child.material)) {
        for (const material of child.material) {
          material?.dispose?.();
        }
      } else {
        child.material?.dispose?.();
      }
    }
  });
}

function removePlaceholder(entry) {
  const { placeholder, scene } = entry;
  if (!placeholder) return;

  if (scene) {
    scene.remove(placeholder);
  }
  placeholder.geometry?.dispose?.();
  placeholder.material?.dispose?.();
  entry.placeholder = null;
}

function finalizeLandmarkObject(entry, object, scene, options, materialPreset) {
  if (!object || !scene || !entry) {
    return null;
  }

  applyTransform(object, options || {});
  removePlaceholder(entry);

  if (entry.disposed) {
    disposeObject(object);
    trackedLandmarks.delete(entry);
    return null;
  }

  const initialY = Number.isFinite(object?.position?.y) ? object.position.y : 0;
  const liftedY = liftObjectAboveGround(scene, object, 0.05);
  if (Number.isFinite(liftedY)) {
    object.position.y = Math.max(initialY, liftedY);
  }

  scene.add(object);
  entry.object = object;

  object.userData = object.userData || {};
  object.userData.interactable = true;
  object.userData.onUse = () => {
    const label = object.name || "a landmark";
    console.log(`You interacted with ${label}`);
  };

  object.traverse?.((mesh) => {
    if (!mesh?.isMesh || typeof mesh.name !== "string") return;
    const isInteractiveDoor = mesh.name === "Door" || mesh.name.startsWith("INT_");
    if (!isInteractiveDoor) return;

    mesh.userData = mesh.userData || {};
    mesh.userData.interactable = true;
    mesh.userData.onUse = () => {
      mesh.userData.isOpen = !mesh.userData.isOpen;
      const isDoor = mesh.name === "Door";
      mesh.rotation.y = mesh.userData.isOpen ? Math.PI / 2 : 0;
      if (isDoor) {
        console.log(mesh.userData.isOpen ? "Door opened!" : "Door closed!");
      } else {
        console.log(`You interacted with ${mesh.name}`);
      }
    };
  });

  queueSceneInteractable(scene, object);

  if (materialPreset) {
    const factory = MATERIAL_PRESETS[materialPreset];
    const presetMaterial = typeof factory === "function" ? factory(THREE) : null;

    if (presetMaterial) {
      object.traverse?.((mesh) => {
        if (!mesh?.isMesh) return;

        if (Array.isArray(mesh.material)) {
          const nextMaterials = mesh.material.map((material) => {
            const clonedMaterial = presetMaterial.clone();
            copyMaterialFlags(material, clonedMaterial);
            material?.dispose?.();
            return clonedMaterial;
          });
          mesh.material = nextMaterials;
        } else if (mesh.material) {
          const currentMaterial = mesh.material;
          const clonedMaterial = presetMaterial.clone();
          copyMaterialFlags(currentMaterial, clonedMaterial);
          currentMaterial.dispose?.();
          mesh.material = clonedMaterial;
        } else {
          mesh.material = presetMaterial.clone();
        }
      });
      presetMaterial.dispose?.();
    }
  }

  return object;
}

export async function spawnProceduralFallback({
  kind = "temple",
  params = {},
  transform = {},
} = {}) {
  const finalParams = { ...(params || {}) };
  const transformOptions = { ...(transform || {}) };

  if (finalParams.scale == null && transformOptions.scale != null) {
    finalParams.scale = transformOptions.scale;
    delete transformOptions.scale;
  }

  let object = null;
  switch (kind) {
    case "temple":
      object = await buildTemple(finalParams);
      break;
    default:
      console.warn(`[landmarks] Unknown procedural fallback kind: ${kind}`);
      return null;
  }

  if (!object || typeof object !== "object") {
    return null;
  }

  return { object, transform: transformOptions };
}

/**
 * Load a landmark model and keep track of it so we can dispose everything later.
 * We immediately add a placeholder mesh to the scene so players get instant
 * feedback while the real asset streams in. Once the GLB arrives we swap the
 * placeholder for the actual model.
 */
const MATERIAL_PRESETS = {
  marble: makeMarbleMaterial,
  bronze: makeBronzeMaterial,
  "mediterranean-plaster": makeMediterraneanPlasterMaterial,
};

const MATERIAL_FLAG_PROPERTIES = [
  "skinning",
  "morphTargets",
  "morphNormals",
  "transparent",
];

function copyMaterialFlags(source, target) {
  if (!source || !target) return target;

  MATERIAL_FLAG_PROPERTIES.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  });

  return target;
}

export async function loadLandmark(scene, url, options = {}) {
  if (!ENABLE_GLB_MODE) return null;
  const timerLabel = `loadLandmark:${url}`;
  if (typeof console?.time === "function") {
    // A quick console benchmark so you can compare compressed vs. uncompressed
    // assets. Check your devtools timeline to see how much faster `.ktx2`
    // textures stream once you've transcoded them.
    console.time(timerLabel);
  }

  // Ensure loader is initialized
  if (!loader) {
    const resolvedRenderer = resolveRenderer(scene, options?.renderer);
    if (resolvedRenderer) {
      await initializeAssetTranscoders(resolvedRenderer);
    } else {
      loader = await createGLTFLoader(null);
    }
  }

  const placeholderGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const placeholderMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    emissive: new THREE.Color(0x6666ff),
    transparent: true,
    opacity: 0.6,
  });
  const placeholder = new THREE.Mesh(placeholderGeometry, placeholderMaterial);
  placeholder.name = "LandmarkPlaceholder";

  applyTransform(placeholder, { position: options.position });
  liftObjectAboveGround(scene, placeholder, 0.05);

  // Beginners tip: showing a simple glowing box makes it obvious to the player
  // that something will appear here soon. It also gives feedback while large
  // downloads are still happening in the background.
  // scene.add(placeholder);

  const entry = { scene, url, placeholder, object: null };
  trackedLandmarks.add(entry);

  const cleanupEntry = () => {
    removePlaceholder(entry);
    trackedLandmarks.delete(entry);
  };

  const tryProceduralFallback = async (reason, extra = {}) => {
    if (typeof options?.proceduralFallback !== "function") {
      return null;
    }
    try {
      const result = await options.proceduralFallback({
        reason,
        url,
        ...extra,
      });
      if (result) {
        cleanupEntry();
        return result;
      }
    } catch (fallbackError) {
      console.warn("[landmarks] Procedural fallback failed", fallbackError);
    }
    return null;
  };

  try {
    const sanitizedUrl = typeof url === "string" ? url.trim() : "";
    if (!sanitizedUrl) {
      throw new Error("loadLandmark requires a non-empty URL");
    }

    if (sanitizedUrl.endsWith(".glb")) {
      console.warn(`[GLB Disabled] Skipping model load: ${sanitizedUrl}`);
      const fallbackObject = await tryProceduralFallback("glb-disabled");
      if (fallbackObject) {
        return fallbackObject;
      }
      cleanupEntry();
      return null;
    }

    const skipGlb = options.forceProcedural === true;
    if (skipGlb) {
      const fallbackObject = await tryProceduralFallback("force-procedural");
      if (fallbackObject) {
        return fallbackObject;
      }
      cleanupEntry();
      return null;
    }

    const isProtocolAbsolute = /^(?:[a-zA-Z][a-zA-Z\d+.-]*:)?\/\//.test(sanitizedUrl) ||
      /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(sanitizedUrl);
    const normalized = sanitizeRelativePath(sanitizedUrl);

    const urlSet = new Set();
    if (isProtocolAbsolute) {
      urlSet.add(sanitizedUrl);
    } else {
      if (normalized) {
        const baseUrl = resolveBaseUrl();
        urlSet.add(joinPath(baseUrl, normalized));
        urlSet.add(normalized);
      }
    }

    if (!isProtocolAbsolute && normalized) {
      const githubRawCandidates = deriveGithubRawCandidates(normalized);
      for (const candidate of githubRawCandidates) {
        urlSet.add(candidate);
      }
    }

    const urls = Array.from(urlSet).filter(Boolean);
    const cacheKey = isProtocolAbsolute ? sanitizedUrl : normalized;

    let availableUrl = null;
    for (const candidate of urls) {
      const ok = await headOk(candidate);
      if (ok) {
        availableUrl = candidate;
        break;
      }
    }

    if (!availableUrl) {
      const fallbackObject = await tryProceduralFallback("missing-url", { requestedUrl: sanitizedUrl });
      if (fallbackObject) {
        return fallbackObject;
      }
      warnMissingLandmark(cacheKey || sanitizedUrl, `[landmarks] Missing GLB: ${sanitizedUrl}`);
      cleanupEntry();
      return null;
    }

    const prioritizedUrls = [
      availableUrl,
      ...urls.filter((candidate) => candidate !== availableUrl),
    ];

    const { materialPreset } = options;
    const resolvedRenderer = resolveRenderer(scene, options?.renderer);

    const loaded = await loadGLBWithFallbacks(loader, prioritizedUrls, {
      renderer: resolvedRenderer,
      targetHeight: options?.targetHeight || null,
      forceProcedural: options.forceProcedural === true,
    });

    if (!loaded || !loaded.root) {
      const fallbackObject = await tryProceduralFallback("load-failed", { requestedUrl: availableUrl });
      if (fallbackObject) {
        return fallbackObject;
      }
      cleanupEntry();
      return null;
    }

    const { root } = loaded;

    let finalObject = root;

    root.traverse?.((mesh) => {
      if (!mesh?.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
    });

    if (root.children?.length) {
      const lodLevels = root.children
        .filter((child) => child?.name?.startsWith("LOD"))
        .map((child) => ({
          object3D: child,
          level: parseInt(child.name.slice(3)) || 0,
        }));

      if (lodLevels.length) {
        // THREE.LOD swaps between meshes based on camera distance, rendering the
        // most detailed models up close and progressively cheaper meshes as you
        // move away. Lower-numbered LODs render first, higher numbers take over
        // farther away, keeping frame-rates higher across busy scenes.
        const lod = new LOD();
        const baseName = root.name || "Landmark";
        lod.name = `${baseName}_LOD`;
        lod.position.copy(root.position);
        lod.rotation.copy(root.rotation);
        lod.scale.copy(root.scale);

        lodLevels
          .sort((a, b) => a.level - b.level)
          .forEach(({ object3D, level }) => {
            lod.addLevel(object3D, level * 50);
          });

        lod.userData = { ...(root.userData || {}) };
        finalObject = lod;
      }
    }

    const finalized = finalizeLandmarkObject(entry, finalObject, scene, options, materialPreset);
    if (finalized) {
      // LANDMARK VISIBILITY: Explicitly disable fog on landmarks so they remain
      // legible at distance while the surrounding city fades (Prompt 3 Hierarchy).
      finalized.traverse((child) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => { if(m) m.fog = false; });
          } else {
            child.material.fog = false;
          }
        }
      });
      applyForegroundFogPolicy(finalized);
      return finalized;
    }
    return null;
  } catch (error) {
    const fallbackObject = attemptProceduralFallback("glb-exception");
    if (fallbackObject) {
      return fallbackObject;
    }
    removePlaceholder(entry);
    trackedLandmarks.delete(entry);
    throw error;
  } finally {
    if (typeof console?.timeEnd === "function") {
      console.timeEnd(timerLabel);
    }
  }
}

/**
 * Remove every landmark and placeholder we created. This is handy when
 * switching levels or resetting the world during development.
 */
export function disposeLandmarks() {
  for (const entry of trackedLandmarks) {
    entry.disposed = true;
    disposeObject(entry.object, entry.scene);
    removePlaceholder(entry);
  }
  trackedLandmarks.clear();
}

function applyVertexColor(geometry, color) {
  const geom = geometry.toNonIndexed();
  const c = new THREE.Color(color);
  const count = geom.getAttribute("position").count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geom;
}

export function generateTempleGeometry(width, length, height, columnCountFront, columnCountSide) {
  const geometries = [];
  const marbleColor = 0xf0f0f0;
  const roofColor = 0xa74a30;
  const accentColor = 0x355c90;

  const baseStepHeight = Math.max(0.4, height * 0.08);
  const basePadding = 1.5;

  for (let tier = 0; tier < 3; tier++) {
    const tierGeo = new THREE.BoxGeometry(
      width + basePadding * 2 - tier * 0.6,
      baseStepHeight,
      length + basePadding * 2 - tier * 0.6
    );
    tierGeo.translate(0, baseStepHeight * 0.5 + tier * baseStepHeight, 0);
    geometries.push(applyVertexColor(tierGeo, marbleColor));
  }

  const columnHeight = height;
  const columnGeo = new THREE.CylinderGeometry(0.8, 1.0, columnHeight, 8);
  columnGeo.translate(0, baseStepHeight * 3 + columnHeight * 0.5, 0);

  const frontSpacing = width / (columnCountFront - 1);
  const sideSpacing = length / (columnCountSide - 1);
  const halfWidth = width * 0.5;
  const halfLength = length * 0.5;

  for (let i = 0; i < columnCountFront; i++) {
    const x = -halfWidth + frontSpacing * i;
    const frontCol = columnGeo.clone();
    frontCol.translate(x, 0, -halfLength);
    geometries.push(applyVertexColor(frontCol, marbleColor));

    if (i === 0 || i === columnCountFront - 1) continue;
    const backCol = columnGeo.clone();
    backCol.translate(x, 0, halfLength);
    geometries.push(applyVertexColor(backCol, marbleColor));
  }

  for (let i = 0; i < columnCountSide; i++) {
    const z = -halfLength + sideSpacing * i;
    const leftCol = columnGeo.clone();
    leftCol.translate(-halfWidth, 0, z);
    geometries.push(applyVertexColor(leftCol, marbleColor));

    if (i === 0 || i === columnCountSide - 1) continue;
    const rightCol = columnGeo.clone();
    rightCol.translate(halfWidth, 0, z);
    geometries.push(applyVertexColor(rightCol, marbleColor));
  }

  const lintelHeight = Math.max(1.5, height * 0.25);
  const lintelGeo = new THREE.BoxGeometry(width + 0.6, lintelHeight, length + 0.6);
  lintelGeo.translate(0, baseStepHeight * 3 + columnHeight + lintelHeight * 0.5, 0);
  geometries.push(applyVertexColor(lintelGeo, marbleColor));

  const pedimentHeight = Math.max(2, height * 0.35);
  const roofGeo = new THREE.CylinderGeometry(width * 0.55, width * 0.55, length + 1.2, 3, 1, true);
  roofGeo.rotateX(Math.PI / 2);
  roofGeo.translate(0, baseStepHeight * 3 + columnHeight + lintelHeight + pedimentHeight * 0.5, 0);
  geometries.push(applyVertexColor(roofGeo, roofColor));

  const pedimentGeo = new THREE.ConeGeometry(width * 0.5, pedimentHeight, 3, 1, true);
  pedimentGeo.rotateY(Math.PI / 6);
  pedimentGeo.translate(0, baseStepHeight * 3 + columnHeight + lintelHeight + pedimentHeight * 0.5, -halfLength - 0.3);
  geometries.push(applyVertexColor(pedimentGeo, accentColor));

  const pedimentBack = pedimentGeo.clone();
  pedimentBack.translate(0, 0, length + 0.6);
  geometries.push(applyVertexColor(pedimentBack, accentColor));

  return mergeGeometries(geometries, true);
}

export function generateTheaterGeometry(radius, tierCount) {
  const geometries = [];
  const marbleColor = 0xf0f0f0;
  const stepHeight = Math.max(0.35, radius * 0.01);
  const stepDepth = Math.max(0.8, radius / (tierCount * 1.5));
  const thetaLength = Math.PI;

  for (let tier = 0; tier < tierCount; tier++) {
    const tierRadius = radius + tier * stepDepth;
    const tierGeo = new THREE.CylinderGeometry(
      tierRadius + stepDepth,
      tierRadius,
      stepHeight,
      32,
      1,
      false,
      -thetaLength * 0.5,
      thetaLength
    );
    tierGeo.translate(0, stepHeight * 0.5 + tier * stepHeight, 0);
    geometries.push(applyVertexColor(tierGeo, marbleColor));
  }

  const orchestraGeo = new THREE.CylinderGeometry(radius * 0.4, radius * 0.4, stepHeight * 0.6, 32, 1, false);
  orchestraGeo.translate(0, stepHeight * 0.3, 0);
  geometries.push(applyVertexColor(orchestraGeo, marbleColor));

  const merged = mergeGeometries(geometries, true);
  merged.rotateY(Math.PI);
  return merged;
}

export function createParthenon() {
  const geometry = generateTempleGeometry(30, 70, 12, 8, 17);
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, metalness: 0.0, fog: false });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = "Parthenon";
  return mesh;
}

export function createTempleOfZeus() {
  const geometry = generateTempleGeometry(40, 96, 20, 8, 20);
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0.05, fog: false });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = "TempleOfZeus";
  return mesh;
}

export function createTheater() {
  const geometry = generateTheaterGeometry(50, 30);
  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0.02, side: THREE.DoubleSide, fog: false });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.rotation.x = Math.PI;
  mesh.name = "TheaterOfEpidaurus";
  return mesh;
}
