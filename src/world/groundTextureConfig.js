// Configuration describing how terrain textures should be layered on top of the
// existing vertex-colored ground. The JPG files referenced here should live in
// the public/assets/ground directory. Values are safe defaults that won't try
// to load textures until you provide URLs.
export const GROUND_TEXTURE_CONFIG = {
  /**
   * Optional base map that replaces the flat color tint of the material. This
   * is useful for broad strokes like grass or dirt. Leave the URL as null to
   * keep the existing vertex colors.
  */
  base: {
    generator: "lush-grass",
    /** Repeat count for the base texture across the terrain. */
    repeat: [52, 52],
    /** Rotate the texture in radians if you need to align features. */
    rotation: 0,
    /**
     * Set to "srgb" if the texture was exported in SRGB color space (typical
     * for photos/JPGs). Use "linear" for data maps such as roughness.
     */
    colorSpace: "srgb",
    /** Optional seed to tweak the procedural noise. */
    seed: 2024,
  },
  /**
   * Additional detail layers can be stacked on top of the base color. Each
   * layer may target a specific height range to keep cliffs rocky and valleys
   * lush. Add or remove entries in this array to match the JPGs you provide.
   */
  details: [
    {
      generator: "lush-grass-detail",
      repeat: [96, 96],
      strength: 0.5,
      tint: [1.02, 1.04, 0.95],
      minHeight: -15,
      maxHeight: 32,
      fade: 8,
      mode: "mix",
      seed: 404,
    },
  ],
};
