import * as THREE from "three";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { createKTX2Loader } from "./ktx2.js";
import { createDracoLoader } from "./draco.js";
import { applyTextureBudgetToObject } from "./textureBudget.js";
import { joinPath, resolveBaseUrl } from "./baseUrl.js";

const ENABLE_GLB_MODE = false;

function sanitizeRelativePath(value) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    // strip leading slashes FIRST so repo-folder stripping matches
    .replace(/^\/+/, "")
    .replace(/^public\//i, "")
    .replace(/^docs\//i, "")
    .replace(/^athens-game-starter\//i, "")
    .replace(/^\.\//, "");
}

export async function createGLTFLoader(renderer) {
  // Lazy-load GLTFLoader only when actually needed
  const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
  const loader = new GLTFLoader();

  if (renderer) {
    try {
      const ktx2 = await createKTX2Loader(renderer);
      if (ktx2) {
        loader.setKTX2Loader(ktx2);
      }
    } catch {
      // Silent fallback: KTX2 loader remains unset.
    }
  }

  try {
    const draco = createDracoLoader();
    if (draco) {
      loader.setDRACOLoader(draco);
    }
  } catch {
    // Silent fallback: DRACO loader remains unset.
  }

  loader.setMeshoptDecoder(MeshoptDecoder);
  return loader;
}

async function headOk(url) {
  if (!url) return false;
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) return false;
    const contentType = res.headers?.get?.("content-type") || "";
    return !contentType.toLowerCase().includes("text/html");
  } catch {
    return false;
  }
}

export async function loadGLBWithFallbacks(loader, urls, options = {}) {
  if (!loader || typeof loader.loadAsync !== "function") {
    return null;
  }
  if (!Array.isArray(urls) || urls.length === 0) {
    return null;
  }

  const {
    targetHeight = null,
    renderer = null,
    onLoaded = null,
    forceProcedural = false,
  } = options;

  if (forceProcedural) {
    return null;
  }

  if (!ENABLE_GLB_MODE && !options.allowSingleModel) {
    return null;
  }

  const baseUrl = resolveBaseUrl();
  const seen = new Set();

  for (const candidate of urls) {
    const raw = typeof candidate === "string" ? candidate.trim() : "";
    if (!raw) {
      continue;
    }

    const isAbsolute = /^(?:[a-zA-Z][a-zA-Z\d+.-]*:)?\/\//.test(raw) ||
      /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(raw);

    const relative = sanitizeRelativePath(raw);
    if (!relative && !isAbsolute) {
      continue;
    }

    const candidatesToTry = Array.from(
      new Set(
        isAbsolute
          ? [raw]
          : [joinPath(baseUrl, relative), relative]
      )
    );

      for (const url of candidatesToTry) {
        if (!url) continue;
        if (seen.has(url)) {
          continue;
        }
        seen.add(url);

        if (!(await headOk(url))) {
          continue;
        }
        try {
          const gltf = await loader.loadAsync(url);
          const { scene, scenes } = gltf || {};
          const bufferScene = scene || (Array.isArray(scenes) ? scenes[0] : null);
          const root = bufferScene || null;
          if (!root) throw new Error(`No scene in GLB: ${url}`);

          if (targetHeight && targetHeight > 0) {
            root.updateMatrixWorld(true);
            const box = new THREE.Box3().setFromObject(root);
            const size = new THREE.Vector3();
            box.getSize(size);
            const currentH = size.y || 1;
            const scaleFactor = currentH !== 0 ? targetHeight / currentH : 1;
            if (Number.isFinite(scaleFactor) && scaleFactor > 0) {
              root.scale.multiplyScalar(scaleFactor);
            }
          }

          applyTextureBudgetToObject(root, { renderer });

          if (typeof onLoaded === "function") {
            try {
              onLoaded({ url, gltf, root });
            } catch {
              // Silent fallback: ignore onLoaded hook errors.
            }
          }

          return { url, gltf, root };
        } catch {
        }
      }
    }

  return null;
}
