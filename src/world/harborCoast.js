// Shared world-space shoreline for the sheltered inlet, its quays and dry lots.
// The mouth widens smoothly into the existing open sea at x=130.
export function harborShoreX(z) {
  return 130 - 110 * Math.exp(-(((z - 10) / 64) ** 2));
}
const smooth = (x, a, b) => { const t = Math.max(0, Math.min(1, (x-a)/(b-a))); return t*t*(3-2*t); };
export function harborCoastBlend(x, z) {
  if (x <= 0 || x >= 130 || Math.abs(z - 10) >= 150) return 0;
  return smooth(x, 0, 8) * (1 - smooth(Math.abs(z - 10), 110, 150));
}
export function harborCoastHeight(x, z, sea) {
  const inland = harborShoreX(z) - x;
  if (inland >= 10) return sea + 2.2;
  if (inland >= 0) return sea - 0.3 + 2.5 * smooth(inland, 0, 10);
  return sea - 0.3 - 8.2 * smooth(-inland, 0, 42);
}
export function harborFootprintIsWet(x, z, radius = 0) {
  return [z-radius, z, z+radius].some(sampleZ => x + radius >= harborShoreX(sampleZ) - 10);
}
