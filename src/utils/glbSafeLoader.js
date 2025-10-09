import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { createKTX2Loader } from "./ktx2.js";
import { createDracoLoader } from "./draco.js";

function isProbablyHtml(buffer) {
  if (!buffer || buffer.byteLength < 16) return true;
  const bytes = new Uint8Array(buffer.slice(0, 16));
  return bytes[0] === 60;
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

export async function loadGLBWithFallbacks({
  renderer,
  urls,
  targetHeight = null,
  onLoaded = null,
}) {
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new Error("loadGLBWithFallbacks requires at least one URL");
  }

  const loader = createGLTFLoader(renderer);

  let lastErr = null;
  for (const url of urls) {
    if (typeof url !== "string" || url.trim().length === 0) {
      continue;
    }
    const candidate = url.trim();
    try {
      const res = await fetch(candidate, { cache: "no-cache" });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText} at ${candidate}`);
      const buffer = await res.arrayBuffer();
      if (isProbablyHtml(buffer)) {
        throw new Error(`Downloaded HTML instead of GLB: ${candidate}`);
      }

      const basePath =
        loader.path && loader.path.length > 0
          ? loader.path
          : THREE.LoaderUtils.extractUrlBase(candidate);
      const gltf = await loader.parseAsync(buffer, basePath);
      const root = gltf.scene || (Array.isArray(gltf.scenes) ? gltf.scenes[0] : null);
      if (!root) throw new Error(`No scene in GLB: ${candidate}`);

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

      if (typeof onLoaded === "function") {
        try {
          onLoaded({ url: candidate, gltf, root });
        } catch (hookError) {
          console.warn("[GLB Fallback] onLoaded hook failed", hookError);
        }
      }

      return { url: candidate, gltf, root };
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      console.warn(`[GLB Fallback] Failed ${candidate}:`, lastErr.message || lastErr);
    }
  }

  throw lastErr || new Error("All GLB fallbacks failed.");
}
