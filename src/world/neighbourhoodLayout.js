// Authored places and street control points for the existing city-plan renderer.
// Keep these on dry city ground; the harbour's layout and water own the coast.
import { CatmullRomCurve3, Vector3 } from 'three';
export const NEIGHBOURHOODS = [
  { id: 'potters', label: "Potters' Court", x: -108, z: 42, kind: 'pottery', width: 26, depth: 22, color: 0xc79668 },
  { id: 'olive', label: 'Olive Court', x: -80, z: 126, kind: 'residential', width: 28, depth: 24, color: 0xc5ba94 },
  { id: 'weavers', label: "Weavers' Yard", x: -102, z: -78, kind: 'weaving', width: 28, depth: 22, color: 0xc2a383 },
  { id: 'garden', label: 'North Garden', x: -85, z: 250, kind: 'garden', width: 30, depth: 26, color: 0xb8b49a },
  { id: 'traders', label: 'Trading Court', x: 60, z: 146, kind: 'trade', width: 28, depth: 24, color: 0xc8b18c },
];

export function neighbourhoodFrontages(place) {
  const north = place.depth / 2 + 5;
  const west = -place.width / 2 - 6;
  return [
    { x: -8, z: north, w: 11, d: 6, rotation: Math.PI },
    { x: 8, z: north, w: 11, d: 6, rotation: Math.PI },
    { x: -8, z: -north, w: 11, d: 6, rotation: 0 },
    { x: west, z: -8, w: 10, d: 6, rotation: Math.PI / 2 },
    { x: west, z: 8, w: 10, d: 6, rotation: Math.PI / 2 },
    { x: -west, z: 8, w: 10, d: 6, rotation: -Math.PI / 2 },
  ].map((f) => ({ ...f, x: f.x + place.x, z: f.z + place.z }))
    .filter((f) => !streetSamples.some((p) => Math.hypot(p.x - f.x, p.z - f.z) < Math.hypot(f.w, f.d) / 2 + 3.5));
}

export const NEIGHBOURHOOD_STREETS = [
  { id: 'potters-olive', points: [[-108, 42], [-110, 82], [-80, 126]] },
  { id: 'olive-garden', points: [[-80, 126], [-112, 180], [-85, 250]] },
  { id: 'garden-traders', points: [[-85, 250], [-12, 252], [50, 210], [60, 146]] },
  { id: 'traders-city', points: [[60, 146], [40, 126], [20, 105]] },
  { id: 'olive-traders', points: [[-80, 126], [-36, 100], [-8, 116], [20, 130], [60, 146]] },
  { id: 'weavers-city', points: [[-45, -60], [-64, -80], [-102, -78]] },
  { id: 'weavers-potters', points: [[-102, -78], [-136, -30], [-124, 15], [-108, 42]] },
];

// Reserve complete building footprints at curved entrances, not just a narrow
// gap at each street's centre. Include the existing Agora approach.
const streetSamples = [...NEIGHBOURHOOD_STREETS.map((s) => s.points), [[-30, 20], [-55, 20], [-70, 28], [-82, 38], [-108, 42]]]
  .flatMap((points) => new CatmullRomCurve3(points.map(([x, z]) => new Vector3(x, 0, z)), false, 'catmullrom', 0.2).getSpacedPoints(400));

// Homes follow the same curves as the roads. Staggered frontages join the
// courts into neighbourhoods, with room at bends and intersections.
export const NEIGHBOURHOOD_STREET_FRONTAGES = NEIGHBOURHOOD_STREETS.flatMap((street) => {
  const curve = new CatmullRomCurve3(street.points.map(([x, z]) => new Vector3(x, 0, z)), false, 'catmullrom', 0.2);
  const length = curve.getLength(); const frontages = [];
  for (let distance = 28, i = 0; distance < length - 28; distance += 18, i++) {
    const point = curve.getPointAt(distance / length), tangent = curve.getTangentAt(distance / length);
    const side = i % 2 ? 1 : -1;
    const nx = -tangent.z * side, nz = tangent.x * side;
    const x = point.x + nx * 10.5, z = point.z + nz * 10.5;
    if (Math.hypot(x + 30, z - 20) < 80 || isCourtReservation(x, z)) continue;
    if (streetSamples.some((p) => Math.hypot(p.x - x, p.z - z) < 9)) continue;
    frontages.push({ x, z, rotation: Math.atan2(-nx, -nz), w: 8, d: 7, workshop: street.id === 'weavers-potters' && i % 3 === 0 });
  }
  return frontages;
});

export function neighbourhoodAt(x, z) {
  return NEIGHBOURHOODS.find((p) => Math.abs(x - p.x) <= p.width / 2 && Math.abs(z - p.z) <= p.depth / 2);
}

function isCourtReservation(x, z) {
  return NEIGHBOURHOODS.some((p) =>
    Math.abs(x - p.x) <= p.width / 2 + 17 && Math.abs(z - p.z) <= p.depth / 2 + 16);
}

export function isNeighbourhoodLotReserved(x, z) {
  return isCourtReservation(x, z) || NEIGHBOURHOOD_STREET_FRONTAGES.some((f) => Math.hypot(x - f.x, z - f.z) < 11);
}
