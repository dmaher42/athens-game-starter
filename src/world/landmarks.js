import * as THREE from "three";
import { LOD } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import {
  resolveKTX2TranscoderPath,
  DEFAULT_BASIS_TRANSCODER_PATH,
} from "../utils/ktx2.js";
import { loadGLBWithFallbacks } from "../utils/glbSafeLoader.js";
import { resolveBaseUrl, joinPath, normalizeAssetPath, headOk } from "../utils/baseUrl.js";
import { makeMarbleMaterial, makeBronzeMaterial } from "./materials.js";

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

const BASE_URL = resolveBaseUrl();
const missingLandmarkWarnings = new Set();

function warnMissingLandmark(key, message) {
  if (!key) return;
  if (missingLandmarkWarnings.has(key)) {
    return;
  }
  missingLandmarkWarnings.add(key);
  console.warn(message);
}

// Reuse a single loader instance so we don't repeatedly allocate it whenever we
// load a new landmark. GLTFLoader understands the .glb format which packages a
// model and all of its textures into one binary file.
// Shared GLTF loader instance for every landmark. We hook a KTX2Loader into it
// so GPU-compressed textures decode automatically without changing the rest of
// our asset pipeline.
const loader = new GLTFLoader();
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
export function initializeAssetTranscoders(renderer) {
  if (!renderer || typeof renderer.getContext !== "function") {
    return;
  }

  const transcoderPath = resolveKTX2TranscoderPath();

  if (!ktx2Loader) {
    ktx2Loader = new KTX2Loader();
  }

  if (transcoderPath && transcoderPath !== currentTranscoderPath) {
    ktx2Loader.setTranscoderPath(transcoderPath);
    currentTranscoderPath = transcoderPath;

    if (
      !hasLoggedCdnFallback &&
      transcoderPath === DEFAULT_BASIS_TRANSCODER_PATH
    ) {
      console.info(
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
        console.warn(
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

/**
 * Load a landmark model and keep track of it so we can dispose everything later.
 * We immediately add a placeholder mesh to the scene so players get instant
 * feedback while the real asset streams in. Once the GLB arrives we swap the
 * placeholder for the actual model.
 */
const MATERIAL_PRESETS = {
  marble: makeMarbleMaterial,
  bronze: makeBronzeMaterial,
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
  const timerLabel = `loadLandmark:${url}`;
  if (typeof console?.time === "function") {
    // A quick console benchmark so you can compare compressed vs. uncompressed
    // assets. Check your devtools timeline to see how much faster `.ktx2`
    // textures stream once you've transcoded them.
    console.time(timerLabel);
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
  scene.add(placeholder);

  const entry = { scene, url, placeholder, object: null };
  trackedLandmarks.add(entry);

  try {
    const sanitizedUrl = typeof url === "string" ? url.trim() : "";
    if (!sanitizedUrl) {
      throw new Error("loadLandmark requires a non-empty URL");
    }

    const isProtocolAbsolute = /^(?:[a-zA-Z][a-zA-Z\d+.-]*:)?\/\//.test(sanitizedUrl) ||
      /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(sanitizedUrl);
    const normalized = normalizeAssetPath(sanitizedUrl);

    const urlSet = new Set();
    if (isProtocolAbsolute) {
      urlSet.add(sanitizedUrl);
    } else {
      if (normalized) {
        urlSet.add(joinPath(BASE_URL, normalized));
        urlSet.add(normalized);
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
      warnMissingLandmark(cacheKey || sanitizedUrl, `[landmarks] Missing GLB: ${sanitizedUrl}`);
      removePlaceholder(entry);
      trackedLandmarks.delete(entry);
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
    });

    if (!loaded || !loaded.root) {
      removePlaceholder(entry);
      trackedLandmarks.delete(entry);
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

    applyTransform(finalObject, options);
    removePlaceholder(entry);

    if (entry.disposed) {
      disposeObject(finalObject);
      trackedLandmarks.delete(entry);
      return null;
    }

    const initialY = Number.isFinite(finalObject?.position?.y)
      ? finalObject.position.y
      : 0;
    const liftedY = liftObjectAboveGround(scene, finalObject, 0.05);
    if (Number.isFinite(liftedY)) {
      finalObject.position.y = Math.max(initialY, liftedY);
    }
    scene.add(finalObject);
    entry.object = finalObject;

    // userData is a plain JavaScript object attached to every 3D node. We use
    // it like a sticky note to tag meshes that should respond to interactions.
    // Anything that has `userData.interactable = true` will be picked up by the
    // interaction helper so beginners can wire up behaviours without subclassing.
    finalObject.userData = finalObject.userData || {};
    finalObject.userData.interactable = true;
    finalObject.userData.onUse = () => {
      const label = finalObject.name || "a landmark";
      console.log(`You interacted with ${label}`);
    };

    // Optionally bubble interactivity down to specific meshes. Artists can name
    // sub-meshes "Door" or prefix them with "INT_" to opt-in. Here we just spin
    // the mesh by 90 degrees to mimic a simple door toggle.
    finalObject.traverse?.((mesh) => {
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

    if (materialPreset) {
      const factory = MATERIAL_PRESETS[materialPreset];
      const presetMaterial = typeof factory === "function" ? factory(THREE) : null;

      if (presetMaterial) {
        finalObject.traverse?.((mesh) => {
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

    return finalObject;
  } catch (error) {
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
