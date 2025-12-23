// ---- src/features/roads-gravel.js ----
import * as THREE from "three";
import { resolveBaseUrl, joinPath } from "../utils/baseUrl.js";

/**
 * Applies gravel material to road meshes only.
 * Phase 3: Defer texture loading to requestAnimationFrame (5-8M deferral)
 * - Safe if textures missing (no-op).
 * - Idempotent: re-running won't double-apply.
 */
export async function applyGravelToRoads({ scene, baseUrl, repeat = [24, 24] } = {}) {
  return new Promise((resolve) => {
    requestAnimationFrame(async () => {
      if (!scene) {
        resolve();
        return;
      }

      const defaultBase = resolveBaseUrl();
      const resolvedBase = typeof baseUrl === "string" && baseUrl.length > 0 ? baseUrl : defaultBase;

      const tl = new THREE.TextureLoader();
      let base, normal;
      try {
          base = await tl.loadAsync(joinPath(resolvedBase, "textures/ground/dirt-albedo.jpg"));
          base.wrapS = base.wrapT = THREE.RepeatWrapping;
          base.repeat.set(repeat[0], repeat[1]);
          base.colorSpace = THREE.SRGBColorSpace;

          normal = await tl.loadAsync(joinPath(resolvedBase, "textures/marble_normal-dx.jpg"));
          normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
          normal.repeat.set(repeat[0], repeat[1]);
      } catch (err) {
          console.warn("Texture loading failed in applyGravelToRoads", err);
      }

      const mat = new THREE.MeshStandardMaterial({
        map: base,
        normalMap: normal,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
        roughness: 0.9,
      });

      if (!mat) {
        resolve();
        return;
      }

      const pickRoad = (o) => {
        const name = (o.name || "").toLowerCase();
        const u = o.userData || {};
        return (
          name.includes("road") ||
          name.includes("street") ||
          name.includes("path") ||
          u.type === "road" ||
          u.kind === "road" ||
          u.category === "road"
        );
      };

      let count = 0;
      scene.traverse((o) => {
        if (!o?.isMesh) return;
        if (!pickRoad(o)) return;
        if (o.material && o.material.userData?.__isGravel) return;
        o.material = mat;
        o.material.userData = { ...(o.material.userData || {}), __isGravel: true };
        o.receiveShadow = true;
        count++;
      });

      console.info("[roads] Gravel textures applied in background");
      resolve();
    });
  });
}
