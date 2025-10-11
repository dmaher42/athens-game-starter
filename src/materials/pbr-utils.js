// src/materials/pbr-utils.js
// Minimal, dependency-free helpers for PBR textures (safe if assets are missing).

import {
  TextureLoader,
  SRGBColorSpace,
  MeshStandardMaterial,
  RepeatWrapping,
} from "three";
import { resolveBaseUrl, joinPath } from "../utils/baseUrl.js";

function sanitizeRelativePath(value) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/^public\//i, "")
    .replace(/^docs\//i, "")
    .replace(/^\.\//, "")
    .replace(/^\/+/, "");
}

const headCache = new Map();

/** HEAD-check a URL (returns true/false; never throws) */
export async function urlExists(url) {
  if (typeof url !== "string" || url.length === 0) return false;
  if (headCache.has(url)) {
    return headCache.get(url);
  }
  try {
    const res = await fetch(url, { method: "HEAD" });
    const ok = res.ok && !(res.headers.get("content-type") || "").includes("text/html");
    headCache.set(url, ok);
    return ok;
  } catch {
    headCache.set(url, false);
    return false;
  }
}

/** Load a texture if present; returns null if 404/missing */
async function loadAny(loader, stem, { isSRGB = false } = {}) {
  if (typeof stem !== "string" || stem.length === 0) return null;
  const trimmedStem = stem.trim();
  if (!trimmedStem) return null;
  const variants = Array.from(
    new Set(
      [
        trimmedStem,
        trimmedStem
          .replace("basecolor", "albedo")
          .replace("gravel/", "gravel_path-"),
      ].filter(Boolean)
    )
  );
  const exts = ["webp", "jpg", "png"];
  const baseUrl = resolveBaseUrl();
  for (const variant of variants) {
    const variantStem = typeof variant === "string" ? variant.trim() : "";
    if (!variantStem) continue;
    const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(variantStem) || variantStem.startsWith("data:");
    for (const ext of exts) {
      const candidateStem = `${variantStem}.${ext}`;
      if (!isAbsolute) {
        const relativeCandidate = sanitizeRelativePath(candidateStem);
        if (!relativeCandidate) {
          continue;
        }
        const url = joinPath(baseUrl, relativeCandidate);
        if (!(await urlExists(url))) continue;
        const tex = await loader.loadAsync(url);
        if (tex && isSRGB) {
          tex.colorSpace = SRGBColorSpace;
        }
        if (tex) {
          return tex;
        }
        continue;
      }
      const url = candidateStem;
      if (!(await urlExists(url))) continue;
      const tex = await loader.loadAsync(url);
      if (tex && isSRGB) {
        tex.colorSpace = SRGBColorSpace;
      }
      if (tex) {
        return tex;
      }
    }
  }
  return null;
}

/** Build a MeshStandardMaterial from available maps (base color required) */
export async function makeMarblePBR(basePath) {
  const tl = new TextureLoader();

  const baseColor = await loadAny(tl, joinPath(basePath, "basecolor"), { isSRGB: true });
  if (!baseColor) return null; // nothing to do

  const normal = await loadAny(tl, joinPath(basePath, "normal"));
  const roughness = await loadAny(tl, joinPath(basePath, "roughness"));
  const ao = await loadAny(tl, joinPath(basePath, "ao"));

  return new MeshStandardMaterial({
    map: baseColor,
    normalMap: normal || undefined,
    roughnessMap: roughness || undefined,
    aoMap: ao || undefined,
    metalness: 0.0,
    roughness: 1.0,
  });
}

/** Tiled PBR builder with repeat + polygonOffset-friendly params */
export async function makeTiledPBR(basePath, repeat = [6, 6]) {
  const tl = new TextureLoader();

  const base = await loadAny(tl, joinPath(basePath, "basecolor"), { isSRGB: true });
  if (!base) return null;

  const normal = await loadAny(tl, joinPath(basePath, "normal"));
  const roughness = await loadAny(tl, joinPath(basePath, "roughness"));
  const ao = await loadAny(tl, joinPath(basePath, "ao"));

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
    roughness: 1.0,
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
