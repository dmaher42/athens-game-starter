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
    // If your loader expects `url` at base, keep it.
    // If it expects `albedoUrl` or similar, rename accordingly.
    url: textureUrl("grass-albedo.jpg"),
    colorSpace: "srgb",

    // Higher repeat => Higher density (texture looks correct at walking height)
    repeat: [64, 64],

    // Small rotation prevents obvious grid tiling.
    rotation: 0.08,
  },

  /**
   * Blended layers + procedural mask controls
   */
  blend: {
    grass: {
      url: textureUrl("grass-albedo.jpg"),
      colorSpace: "srgb",
      repeat: [64, 64],
      rotation: 0.00,
    },

    dirt: {
      url: textureUrl("dirt-albedo.jpg"),
      colorSpace: "srgb",
      // Dirt should be slightly less tiled so patches feel broad and natural.
      repeat: [48, 48],
      rotation: 0.13,
    },

    // New Stone Layer (reuses dirt texture but will be tinted in shader)
    stone: {
      url: textureUrl("dirt-albedo.jpg"),
      colorSpace: "srgb",
      repeat: [32, 32],
      rotation: 0.7,
      tint: [0.65, 0.65, 0.7], // Rock-like tint
    },

    /**
     * Procedural mask controls
     * - noiseScale: lower => larger regions/blobs
     * - noiseContrast: lower => softer blend edges
     *
     * If your shader uses different names (e.g. `maskScale`, `maskContrast`),
     * rename these to exactly what the shader/material reads.
     */
    noiseScale: 4.0, // Increased slightly for more variation
    noiseContrast: 0.8,

    // Tri-blend settings
    slopeThreshold: 0.5, // Slope > 0.5 starts becoming rock
    slopeBlend: 0.2, // Blend width

    /**
     * Optional: if your loader supports these, they help break repetition further.
     * If your loader does NOT read them, they are harmless unless it validates keys strictly.
     * If it validates strictly, remove these optional keys.
     */
    noiseOffset: [0.0, 0.0],
    noiseRotation: 0.0,
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
    {
      // Gravel/Path detail - subtle darkening/coloring in the city/mid-band
      url: textureUrl("dirt-albedo.jpg"),
      mode: 'multiply',
      minHeight: 4.0,
      maxHeight: 40.0,
      fade: 5.0,
      strength: 0.4,
      tint: [0.7, 0.7, 0.7], // Grayish
      noiseScale: 15.0, // Finer noise
      noiseStrength: 0.5,
    }
  ]
};
