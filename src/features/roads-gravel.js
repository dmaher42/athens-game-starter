// ---- src/features/roads-gravel.js ----
import { makeTiledPBR } from "../materials/pbr-utils.js";
import { resolveBaseUrl, joinPath } from "../utils/baseUrl.js";

/**
 * Applies gravel material to road meshes only.
 * - Safe if textures missing (no-op).
 * - Idempotent: re-running won’t double-apply.
 */
export async function applyGravelToRoads({ scene, baseUrl, repeat = [6, 6] } = {}) {
  if (!scene) return;

  const resolvedBase = typeof baseUrl === "string" && baseUrl.length > 0 ? baseUrl : resolveBaseUrl();
  const basePath = joinPath(resolvedBase, "textures/gravel");
  const mat = await makeTiledPBR(basePath, repeat);
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
  const matched = [];
  scene.traverse((o) => {
    if (!o?.isMesh) return;
    if (!pickRoad(o)) return;
    // Skip if it already has our gravel (avoid reassigning every frame)
    if (o.material && o.material.userData?.__isGravel) return;
    o.material = mat;
    o.material.userData = { ...(o.material.userData || {}), __isGravel: true };
    o.receiveShadow = true;
    matched.push(o.name || "(unnamed)");
    count++;
  });
  if (count === 0) {
    // No matches found: harmless. You can tag road meshes later via userData.type = "road".
    // console.info("Gravel: no road meshes found to retarget");
  }

  // Helpful debugging: return the number of meshes updated and names for verification.
  try {
    console.info(`[gravel] applied to ${count} mesh(es)`, matched.slice(0, 20));
  } catch (e) {
    /* ignore logging errors */
  }

  return { count, matched };
}
