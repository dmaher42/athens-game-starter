// ---- src/features/roads-gravel.js ----
import * as THREE from "three";
import { resolveBaseUrl, joinPath } from "../utils/baseUrl.js";

/**
 * Applies gravel material to road meshes only.
 * - Safe if textures missing (no-op).
 * - Idempotent: re-running won’t double-apply.
 */
export async function applyGravelToRoads({ scene, baseUrl, repeat = [6, 6] } = {}) {
  if (!scene) return;

  const defaultBase = resolveBaseUrl();
  const resolvedBase = typeof baseUrl === "string" && baseUrl.length > 0 ? baseUrl : defaultBase;

  // Manual fallback because gravel textures are missing and pbr-utils is strict
  const tl = new THREE.TextureLoader();
  let base, normal;
  try {
      base = await tl.loadAsync(joinPath(resolvedBase, "textures/gravel/basecolor.jpg"));
      base.wrapS = base.wrapT = THREE.RepeatWrapping;
      base.repeat.set(repeat[0], repeat[1]);
      base.colorSpace = THREE.SRGBColorSpace;

      normal = await tl.loadAsync(joinPath(resolvedBase, "textures/gravel/normal.jpg"));
      normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
      normal.repeat.set(repeat[0], repeat[1]);
  } catch (err) {
      console.warn("Gravel textures missing, falling back to marble.");
      base = await tl.loadAsync(joinPath(resolvedBase, "textures/marble_base.jpg"));
      base.wrapS = base.wrapT = THREE.RepeatWrapping;
      base.repeat.set(repeat[0], repeat[1]);
      base.colorSpace = THREE.SRGBColorSpace;

      normal = await tl.loadAsync(joinPath(resolvedBase, "textures/marble_normal-dx.jpg"));
      normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
      normal.repeat.set(repeat[0], repeat[1]);
  }

  const mat = new THREE.MeshStandardMaterial({
    map: base,
    normalMap: normal,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    roughness: 0.8,
  });

  if (!mat) return; // textures not uploaded yet

  const pickRoad = (o) => {
    const name = (o.name || "").toLowerCase();
    const u = o.userData || {};
    // Common selectors: name hints or explicit tagging
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
    // Skip if it already has our gravel (avoid reassigning every frame)
    if (o.material && o.material.userData?.__isGravel) return;
    o.material = mat;
    o.material.userData = { ...(o.material.userData || {}), __isGravel: true };
    o.receiveShadow = true;
    count++;
  });

  if (count === 0) {
    // No matches found: harmless. You can tag road meshes later via userData.type = "road".
    // console.info("Gravel: no road meshes found to retarget");
  }
}
