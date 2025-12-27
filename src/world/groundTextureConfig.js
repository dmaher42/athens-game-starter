// Configuration describing how terrain textures should be layered on top of the
// existing vertex-colored ground. The JPG files referenced here live under
// public/textures/ so they resolve to `${BASE_URL}textures/...` at runtime.
import { MATERIALS } from "../materials/materialRegistry.js";
import {
  GRASS_MIN_ELEV,
  SAND_MAX_ELEV,
} from "../config/terrainMaterials.js";

function resolveBaseUrl() {
  const base =
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    typeof import.meta.env.BASE_URL === "string"
      ? import.meta.env.BASE_URL
      : "/";
  return base.endsWith("/") ? base : `${base}/`;
}

const BASE_URL = resolveBaseUrl();

const resolveTexturePath = (relativePath) => {
  const safePath = relativePath.replace(/^\/+/, "");
  return `${BASE_URL}${safePath}`;
};

// Alias for backward compatibility or external snippets
export function textureUrl(relativePath) {
  return resolveTexturePath(relativePath);
}

const SAND_ALBEDO_URL =
  typeof MATERIALS.sand.albedo === "string"
    ? MATERIALS.sand.albedo
    : resolveTexturePath("textures/sand/albedo.jpg");
const GRASS_ALBEDO_URL =
  typeof MATERIALS.grass.albedo === "string"
    ? MATERIALS.grass.albedo
    : resolveTexturePath("textures/grass/albedo.jpg");
const DIRT_ALBEDO_URL =
  typeof MATERIALS.dirt.albedo === "string"
    ? MATERIALS.dirt.albedo
    : resolveTexturePath("textures/ground/dirt-albedo.jpg");

// PRESERVED EXPORT: Required by src/world/groundTextures.js
export const NEUTRAL_GROUND_FALLBACK_TINT = {
  baseColor: [150, 152, 160],
  shadowColor: [112, 118, 128],
  highlightColor: [192, 198, 210],
  shadowStrength: 0.25,
  highlightStrength: 0.24,
  contrast: 0.95,
};

/**
 * Ground Texture Configuration (Gold Standard)
 *
 * Intent:
 * - Make the terrain read as larger, smoother regions (like the reference image),
 *   rather than tiny high-frequency swirls.
 * - Keep config purely declarative: loader/material code consumes this shape.
 *
 * IMPORTANT:
 * - Do not change the public API (export style / required keys) expected by the
 *   ground material/loader. If your loader expects different key names, rename
 *   the keys here to match the loader.
 */

/**
 * If your ground loader expects:
 *   - base: a single texture layer
 *   - blend: two layers (grass + dirt) plus noise mask controls
 *
 * This config provides:
 *   base.repeat tuned down (bigger pattern)
 *   blend.noiseScale tuned down (bigger patches)
 *   blend.noiseContrast tuned down (softer transitions)
 */
export const GROUND_TEXTURE_CONFIG = {
  /**
   * Base layer (what you see everywhere, then blended with dirt/grass regions)
   */
  base: {
    // Swap the entire ground to our sand atlas.
    url: SAND_ALBEDO_URL,
    colorSpace: "srgb",
    repeat: [28, 24],
    rotation: 0.03,
    roughness: 0.8,
    metalness: 0.0,
  },

  /**
   * Blended layers + procedural mask controls
   * Enable blend to use beach configuration for sand near shoreline
   * Use sand as dirt texture so beach areas show pure sand
   */
  blend: {
    enabled: true,
    
    // Use grass texture for inland areas
    grass: {
      url: GRASS_ALBEDO_URL,
      colorSpace: "srgb",
      repeat: [28, 24],
    },

    // Use sand as "dirt" texture so beach effect shows sand
    dirt: {
      url: SAND_ALBEDO_URL,
      colorSpace: "srgb",
      repeat: [28, 24],
    },

    // Noise controls for grass/dirt blend (disable for clean beach effect)
    noiseScale: 0.1,      // Very low for minimal procedural variation
    noiseContrast: 0.01,  // Near zero to rely on beach height
    maskStrength: 0.0,    // No mask, rely on beach height

    // Stone for steep slopes (optional, can disable if not needed)
    stone: {
      url: DIRT_ALBEDO_URL,
      tint: [0.6, 0.6, 0.6],
      repeat: [14, 12],
    },
    slopeThreshold: 0.4,
    slopeBlend: 0.2,
  },

  /**
   * Macro variation
   * Adds large scale color noise to avoid "repeating carpet" look
   */
  macro: {
    scale: 0.05,
    strength: 0.15,
  },

  /**
   * Beach configuration
   * Applied by shader to force dirt/sand texture at low altitudes
   * height: Distance above sea level where beach effect starts to fade out
   * fade: Transition range for smooth blending from sand to grass
   */
  beach: {
    height: SAND_MAX_ELEV,
    fade: Math.max(0.1, GRASS_MIN_ELEV - SAND_MAX_ELEV),
  },

  /**
   * Detail layers (e.g. gravel, rock, variations)
   */
  details: [
    // No secondary detail layers; keep the ground uniformly sandy.
  ]
};
