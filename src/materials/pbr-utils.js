// src/materials/pbr-utils.js
// Minimal, dependency-free helpers for PBR textures (safe if assets are missing).

import {
  TextureLoader,
  SRGBColorSpace,
  MeshStandardMaterial,
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

/** Build a MeshStandardMaterial from available maps (base color required) */
export async function makeMarblePBR(basePath) {
  const tl = new TextureLoader();

  const baseColor = await tryTex(tl, `${basePath}/basecolor.jpg`, true) ||
                    await tryTex(tl, `${basePath}/basecolor.png`, true);
  if (!baseColor) return null; // nothing to do

  const normal    = await tryTex(tl, `${basePath}/normal.jpg`)    || await tryTex(tl, `${basePath}/normal.png`);
  const roughness = await tryTex(tl, `${basePath}/roughness.jpg`) || await tryTex(tl, `${basePath}/roughness.png`);
  const ao        = await tryTex(tl, `${basePath}/ao.jpg`)        || await tryTex(tl, `${basePath}/ao.png`);

  return new MeshStandardMaterial({
    map: baseColor,
    normalMap: normal || undefined,
    roughnessMap: roughness || undefined,
    aoMap: ao || undefined,
    metalness: 0.0,
    roughness: roughness ? 1.0 : 0.3, // if no map, pick a reasonable default
  });
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
