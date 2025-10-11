import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { createKTX2Loader } from "./ktx2.js";
import { createDracoLoader } from "./draco.js";
import { applyTextureBudgetToObject } from "./textureBudget.js";
import { joinPath, resolveBaseUrl } from "./baseUrl.js";

function sanitizeRelativePath(value) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    // Strip leading slashes FIRST so repo-folder stripping can match
    .replace(/^\/+/, "")
    .replace(/^public\//i, "")
    .replace(/^docs\//i, "")
    .replace(/^\.\//, "");
}

export function createGLTFLoader(renderer) {
  const loader = new GLTFLoader();

  if (renderer) {
    try {
      const ktx2 = createKTX2Loader(renderer);
      if (ktx2) {
        loader.setKTX2Loader(ktx2);
      }
    } catch (error) {
      console.warn("[GLB Loader] Unable to configure KTX2 loader", error);
    }
  }

  try {
    const draco = createDracoLoader();
    if (draco) {
      loader.setDRACOLoader(draco);
    }
  } catch (error) {
    console.warn("[GLB Loader] Unable to configure DRACO loader", error);
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
    throw new Error("loadGLBWithFallbacks requires a GLTFLoader instance");
  }
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new Error("loadGLBWithFallbacks requires at least one URL");
  }

  const { targetHeight = null, renderer = null, onLoaded = null } = options;

  const baseUrl = resolveBaseUrl();
  const seen = new Set();

  let lastErr = null;
  const tried = [];
  for (const candidate of urls) {
    const raw = typeof candidate === "string" ? candidate.trim() : "";
    if (!raw) {
      continue;
    }

    const isAbsolute = /^(?:[a-zA-Z][a-zA-Z\d+.-]*:)?\/\//.test(raw) ||
      /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(raw);
    const startsAtRoot = !isAbsolute && raw.startsWith("/");
    const normalized = sanitizeRelativePath(raw);
    if (!isAbsolute && !normalized) {
      continue;
    }

    const relative = (isAbsolute || startsAtRoot) ? raw : normalized;
    const url = (isAbsolute || startsAtRoot) ? raw : joinPath(baseUrl, relative);

    if (seen.has(url)) {
      continue;
    }
    seen.add(url);

    if (!(await headOk(url))) {
      tried.push([url, 404]);
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
        } catch (hookError) {
          console.warn("[GLB Fallback] onLoaded hook failed", hookError);
        }
      }

      return { url, gltf, root };
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      tried.push([url, "load-fail"]);
    }
  }

  if (tried.length) {
    const attemptedUrls = tried.map(([url]) => url);
    const suffix = lastErr ? ` (${lastErr.message || lastErr})` : "";
    if (suffix.trim()) {
      console.warn("[GLB] No reachable candidate:", attemptedUrls, suffix);
    } else {
      console.warn("[GLB] No reachable candidate:", attemptedUrls);
    }
  }

  return null;
}
