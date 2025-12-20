// Configuration describing how terrain textures should be layered on top of the
// existing vertex-colored ground. The JPG files referenced here should live in
// the public/textures/ground directory.

// PRESERVED EXPORT: Required by src/world/groundTextures.js
export const NEUTRAL_GROUND_FALLBACK_TINT = {
  baseColor: [160, 160, 160],
  shadowColor: [120, 120, 120],
  highlightColor: [200, 200, 200],
  shadowStrength: 0.22,
  highlightStrength: 0.28,
  contrast: 1,
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

    // Lower repeat => larger texture features (less “tiny tiles”).
    repeat: [36, 36],

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
      repeat: [36, 36],
      rotation: 0.00,
    },

    dirt: {
      url: textureUrl("dirt-albedo.jpg"),
      colorSpace: "srgb",
      // Dirt should be slightly less tiled so patches feel broad and natural.
      repeat: [28, 28],
      rotation: 0.13,
    },

    /**
     * Procedural mask controls
     * - noiseScale: lower => larger regions/blobs
     * - noiseContrast: lower => softer blend edges
     *
     * If your shader uses different names (e.g. `maskScale`, `maskContrast`),
     * rename these to exactly what the shader/material reads.
     */
    noiseScale: 6,
    noiseContrast: 1.1,

    /**
     * Optional: if your loader supports these, they help break repetition further.
     * If your loader does NOT read them, they are harmless unless it validates keys strictly.
     * If it validates strictly, remove these optional keys.
     */
    noiseOffset: [0.0, 0.0],
    noiseRotation: 0.0,
  },
};
