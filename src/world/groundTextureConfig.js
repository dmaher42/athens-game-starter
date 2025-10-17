// Configuration describing how terrain textures should be layered on top of the
// existing vertex-colored ground. The JPG files referenced here should live in
// the public/textures/ground directory. Values are safe defaults that won't try
// to load textures until you provide URLs.
const textureUrl = (filename) => {
  const baseUrl = import.meta?.env?.BASE_URL ?? "/";
  return `${baseUrl}textures/ground/${filename}`;
};

export const GROUND_TEXTURE_CONFIG = {
  /**
   * Optional base map that replaces the flat color tint of the material. This
   * is useful for broad strokes like grass or dirt. Leave the URL as null to
   * keep the existing vertex colors.
  */
  base: {
    /**
     * Keep the procedural generator available as a fallback if the JPGs are
     * ever missing in development builds.
     */
    generator: "lush-grass",
    /** Color/albedo texture authored in sRGB space. */
    url: textureUrl("grass-albedo.jpg"),
    colorSpace: "srgb",
    /** Tangent-space normal map captured from the scanned grass material. */
    normalUrl: textureUrl("grass-normal-dx.jpg"),
    normalScale: [0.85, 0.85],
    /** Height map repurposed as a subtle bump map for extra micro detail. */
    bumpUrl: textureUrl("grass-height.jpg"),
    bumpScale: 0.15,
    /** Linear-space masks that drive the PBR shading. */
    roughnessUrl: textureUrl("grass-roughness.jpg"),
    roughness: 0.95,
    metalnessUrl: textureUrl("grass-metallic.jpg"),
    metalness: 0.02,
    aoUrl: textureUrl("grass-ao.jpg"),
    aoIntensity: 1.2,
    /** Neutral colors to avoid tinting custom textures */
    baseColor: [255, 255, 255], // White - no tinting
    shadowColor: [255, 255, 255], // White - no tinting
    highlightColor: [255, 255, 255], // White - no tinting
    shadowStrength: 0.0, // Disable shadow tinting
    highlightStrength: 0.0, // Disable highlight tinting
    contrast: 1.0, // Neutral contrast
    /** Repeat count for the base texture across the terrain. */
    // de-tiling: lower repeats + anisotropy + slight rotation
    repeat: [18, 18],
    anisotropy: 8,
    /** Rotate the texture in radians if you need to align features. */
    rotation: 0,
    /** Optional seed to tweak the procedural noise. */
    seed: 2024
  },
  /**
   * Additional detail layers can be stacked on top of the base color. Each
   * layer may target a specific height range to keep cliffs rocky and valleys
   * lush. Add or remove entries in this array to match the JPGs you provide.
   */
  details: [
    // Set tintMultiplier: false on any entry to bypass tinting when relying on
    // baked-in color work.
    {
      generator: "lush-grass-detail",
      repeat: [36, 36],
      rotation: 0.23,
      anisotropy: 8,
      strength: 0.0, // Disable detail layer tinting
      tint: [1.0, 1.0, 1.0], // Neutral tint
      minHeight: -15,
      maxHeight: 32,
      fade: 16, // Encourage softer transitions for photo textures
      slopeMax: 0.33, // Favor broad, low-slope coverage
      mode: "mix",
      seed: 404,
      tintAttenuation: 0.42,
    },
    // extra detail layers for lowlands/midslopes
    {
      generator: "fresh-grass-lowlands",
      repeat: [48, 48],
      rotation: 0.47,
      anisotropy: 8,
      strength: 0.0, // Disable detail layer tinting
      tint: [1.0, 1.0, 1.0], // Neutral tint
      minHeight: -20,
      maxHeight: 18, // Grass weight/tint bump
      fade: 14, // Encourage softer transitions for photo textures
      slopeMax: 0.3, // Favor broad, low-slope coverage
      mode: "mix",
      seed: 405,
      tintAttenuation: 0.4,
    },
    {
      generator: "dry-grass-detail",
      repeat: [32, 32],
      rotation: 0.11,
      anisotropy: 8,
      strength: 0.0, // Disable detail layer tinting
      tint: [1.0, 1.0, 1.0], // Neutral tint
      minHeight: 16, // Grass weight/tint bump
      maxHeight: 46, // Grass weight/tint bump
      fade: 10, // Encourage softer transitions for photo textures
      slopeMin: 0.26, // Favor broad, low-slope coverage
      mode: "multiply",
      seed: 406,
      tintAttenuation: 0.38,
    },
  ],
};
