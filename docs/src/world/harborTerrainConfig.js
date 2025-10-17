import { HARBOR_WATER_BOUNDS, HARBOR_CENTER_3D, getHarborSeaLevel } from "./locations.js";

export const HARBOR_FLOOR_DEPTH = 2.5;

export const HARBOR_SHORELINE_TUNING = {
  /** Depth of the mid-shelf relative to sea level. */
  shoreShelfDepth: 0.9,
  /**
   * Width of the shoreline blend band measured radially from the padded harbor
   * water footprint. Increase for a longer beach ramp, decrease for a steeper
   * climb back to city grade.
   */
  shoreBlendWidth: 32,
  /**
   * Controls the curvature of the second falloff stage as the shoreline rises
   * from the mid-shelf to dry ground. Values > 1 ease in slowly, values < 1
   * create a sharper rise.
   */
  taperFalloff: 1.35,
};

const DEFAULT_SHELF_FRACTION = 0.45;
const MIN_COASTAL_PADDING = 8;

export function getHarborShoreBlendProfile(overrides = {}) {
  const tuning = {
    ...HARBOR_SHORELINE_TUNING,
    ...overrides,
  };

  const halfWidth = Math.abs(HARBOR_WATER_BOUNDS.east - HARBOR_WATER_BOUNDS.west) * 0.5;
  const halfDepth = Math.abs(HARBOR_WATER_BOUNDS.south - HARBOR_WATER_BOUNDS.north) * 0.5;
  const waterRadius = Math.hypot(halfWidth, halfDepth);
  const blendPadding = Math.max(MIN_COASTAL_PADDING, tuning.shoreBlendWidth * 0.35);
  const innerRadius = waterRadius + blendPadding;
  const outerRadius = innerRadius + Math.max(0, tuning.shoreBlendWidth);
  const shelfRadius = innerRadius + (outerRadius - innerRadius) * DEFAULT_SHELF_FRACTION;

  return {
    radii: {
      water: waterRadius,
      inner: innerRadius,
      shelf: shelfRadius,
      outer: outerRadius,
    },
    shoreShelfDepth: Math.max(0, tuning.shoreShelfDepth),
    shoreBlendWidth: Math.max(0, tuning.shoreBlendWidth),
    taperFalloff: Math.max(0.25, tuning.taperFalloff),
    getSeaLevel: getHarborSeaLevel,
    center: HARBOR_CENTER_3D,
  };
}

