// Configuration describing how terrain textures should be layered on top of the
// existing vertex-colored ground. The JPG files referenced here should live in
// the public/textures/ground directory.
import { joinPath, resolveBaseUrl } from "../utils/baseUrl.js";

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
  const baseUrl = resolveBaseUrl();
  return joinPath(baseUrl, `textures/ground/${file}`);
}

function sandTextureUrl() {
  const baseUrl = resolveBaseUrl();
  return joinPath(
    baseUrl,
    "textures/gravelly_sand/gravelly_sand_diff_1k.jpg",
  );
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
    
    // Use procedural grass for inland areas
    grass: {
      procedural: "fresh-grass-lowlands",
      size: 512,
      seed: 1243,
      baseColor: [95, 115, 82],
      shadowColor: [62, 78, 52],
      highlightColor: [128, 145, 108],
      bladeFrequency: 0.72,
      bladeTaper: 0.68,
      highlightStrength: 0.28,
      shadowStrength: 0.35,
      noiseScale: 0.42,
      patchiness: 0.38,
      saturation: 0.68,
      contrast: 1.08,
      repeat: [28, 24],
    },

    // Use sand as "dirt" texture so beach effect shows sand
    dirt: {
      url: sandTextureUrl(),
      colorSpace: "srgb",
      repeat: [28, 24],
    },

    // Noise controls for grass/dirt blend (disable for clean beach effect)
    noiseScale: 0.1,      // Very low for minimal procedural variation
    noiseContrast: 0.01,  // Near zero to rely on beach height
    maskStrength: 0.0,    // No mask, rely on beach height

    // Stone for steep slopes (optional, can disable if not needed)
    stone: {
      url: textureUrl('dirt-albedo.jpg'),
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
    height: 4.0,  // Sand visible from sea level (0) to ~4 units (covers harbor at Y=2)
    fade: 3.0,     // Gradual 3-unit transition to inland grass
  },

  /**
   * Detail layers (e.g. gravel, rock, variations)
   */
  details: [
    // No secondary detail layers; keep the ground uniformly sandy.
  ]
};
