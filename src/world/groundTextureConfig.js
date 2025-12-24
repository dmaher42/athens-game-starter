// Configuration describing how terrain textures should be layered on top of the
// existing vertex-colored ground. The JPG files referenced here should live in
// the public/textures/ground directory.

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

function textureUrl(file) {
  // Keep this helper identical to what the project expects.
  // Reuse existing logic to include base URL and path to ground textures.
  const baseUrl = import.meta?.env?.BASE_URL ?? "/";
  return `${baseUrl}textures/ground/${file}`;
}

function sandTextureUrl() {
  const baseUrl = import.meta?.env?.BASE_URL ?? "/";
  return `${baseUrl}textures/gravelly_sand/gravelly_sand_diff_1k.jpg`;
}

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
    // Swap the entire ground to our gravelly sand atlas.
    url: sandTextureUrl(),
    colorSpace: "srgb",
    repeat: [28, 24],
    rotation: 0.03,
  },

  /**
   * Blended layers + procedural mask controls
   */
  blend: {
    // Disable grass/dirt/stone tri-blend so everything stays sand.
    enabled: false,
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
   */
  beach: {
    height: 2.5,
    fade: 2.0,
  },

  /**
   * Detail layers (e.g. gravel, rock, variations)
   */
  details: [
    // No secondary detail layers; keep the ground uniformly sandy.
  ]
};
