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
    /** Brighten the procedural grass so the terrain reads lighter overall. */
    baseColor: [121, 182, 112], // Grass weight/tint bump
    shadowColor: [67, 117, 70], // Grass weight/tint bump
    highlightColor: [198, 246, 154], // Grass weight/tint bump
    shadowStrength: 0.45,
    highlightStrength: 0.65,
    contrast: 1.02,
    /** Repeat count for the base texture across the terrain. */
    // de-tiling: lower repeats + anisotropy + slight rotation
    repeat: [18, 18],
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
      repeat: [36, 36],
      rotation: 0.23,
      anisotropy: 8,
      strength: 0.75, // Grass weight/tint bump
      tint: [1.1, 1.12, 1.02],
      minHeight: -15,
      maxHeight: 32,
      fade: 10, // Grass weight/tint bump
      slopeMax: 0.42, // Grass weight/tint bump
      mode: "mix",
      seed: 404,
    },
    // extra detail layers for lowlands/midslopes
    {
      generator: "fresh-grass-lowlands",
      repeat: [48, 48],
      rotation: 0.47,
      anisotropy: 8,
      strength: 0.5, // Grass weight/tint bump
      tint: [1.18, 1.2, 1.08], // Grass weight/tint bump
      minHeight: -20,
      maxHeight: 18, // Grass weight/tint bump
      fade: 8, // Grass weight/tint bump
      slopeMax: 0.38, // Grass weight/tint bump
      mode: "mix",
      seed: 405,
    },
    {
      generator: "dry-grass-detail",
      repeat: [32, 32],
      rotation: 0.11,
      anisotropy: 8,
      strength: 0.28, // Grass weight/tint bump
      tint: [1.04, 1, 0.92], // Grass weight/tint bump
      minHeight: 16, // Grass weight/tint bump
      maxHeight: 46, // Grass weight/tint bump
      fade: 6, // Grass weight/tint bump
      slopeMin: 0.32, // Grass weight/tint bump
      mode: "multiply",
      seed: 406,
    },
  ],
};
