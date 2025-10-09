// src/materials/pbr-utils.js
// Minimal, dependency-free helpers for PBR textures (safe if assets are missing).

import {
  TextureLoader,
  SRGBColorSpace,
  MeshStandardMaterial,
  RepeatWrapping,
} from "three";

/** HEAD-check a URL (returns true/false; never throws) */
export async function urlExists(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch { return false; }
}

/** Load a texture if present; returns null if 404/missing */
async function tryTex(loader, url, isSRGB = false) {
  if (!(await urlExists(url))) return null;
  const tex = await loader.loadAsync(url);
  if (isSRGB) tex.colorSpace = SRGBColorSpace;
  return tex;
}

/** Load first available variant for a base name (webp/jpg/png) */
async function loadAny(tl, base, isSRGB = false) {
  return (
    (await tryTex(tl, `${base}.webp`, isSRGB)) ||
    (await tryTex(tl, `${base}.jpg`, isSRGB)) ||
    (await tryTex(tl, `${base}.png`, isSRGB))
  );
}

/** Build a MeshStandardMaterial from available maps (base color required) */
export async function makeMarblePBR(basePath) {
  const tl = new TextureLoader();

  // Use the WEBP-aware helper to try .webp → .jpg → .png
  const baseColor = await loadAny(tl, `${basePath}/basecolor`, /*sRGB*/ true);
  if (!baseColor) return null; // nothing to do

  const normal    = await loadAny(tl, `${basePath}/normal`);
  const roughness = await loadAny(tl, `${basePath}/roughness`);
  const ao        = await loadAny(tl, `${basePath}/ao`);

  return new MeshStandardMaterial({
    map: baseColor,
    normalMap: normal || undefined,
    roughnessMap: roughness || undefined,
    aoMap: ao || undefined,
    metalness: 0.0,
    // Align fallback roughness with tiled PBR (more realistic than 0.3)
    roughness: roughness ? 1.0 : 0.7,
  });
}

/** Tiled PBR builder with repeat + polygonOffset-friendly params */
export async function makeTiledPBR(basePath, repeat = [6, 6]) {
  const tl = new TextureLoader();

  const base = await loadAny(tl, `${basePath}/basecolor`, /*sRGB*/ true);
  if (!base) return null;

  const normal = await loadAny(tl, `${basePath}/normal`);
  const roughness = await loadAny(tl, `${basePath}/roughness`);
  const ao = await loadAny(tl, `${basePath}/ao`);

  // Set tiling on any map we loaded
  const maps = [base, normal, roughness, ao].filter(Boolean);
  for (const m of maps) {
    m.wrapS = m.wrapT = RepeatWrapping;
    m.repeat.set(repeat[0], repeat[1]);
  }

  // Slight polygon offset helps avoid path/road z-fighting on terrain
  const mat = new MeshStandardMaterial({
    map: base,
    normalMap: normal || undefined,
    roughnessMap: roughness || undefined,
    aoMap: ao || undefined,
    metalness: 0.0,
    roughness: roughness ? 1.0 : 0.7,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  return mat;
}

/** Apply a material to all meshes in a subtree */
export function applyMaterialToTree(root, material) {
  if (!root || !material) return;
  root.traverse((child) => {
    if (child && child.isMesh) {
      child.material = material;
      // Enable vertex colors if geometry provides them; harmless otherwise
      if (child.geometry?.attributes?.color) {
        child.material.vertexColors = true;
      }
    }
  });
}
