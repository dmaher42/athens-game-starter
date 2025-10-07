export const GROUND_EPSILON = 0.05;

export function groundY(
  terrain,
  x,
  z,
  fallback = 0,
  { clampToSea = false, seaLevel = 0, minAboveSea = 0 } = {}
) {
  const h = terrain?.userData?.getHeightAt?.(x, z);
  let y = Number.isFinite(h) ? h : fallback;
  if (clampToSea) y = Math.max(y, seaLevel + minAboveSea);
  return y;
}

export function snapAboveGround(
  mesh,
  terrain,
  x,
  z,
  epsilon = GROUND_EPSILON,
  opts = {}
) {
  const base = groundY(terrain, x, z, mesh.position?.y ?? 0, opts);
  mesh.position.y = base + epsilon;
  return mesh.position.y;
}
