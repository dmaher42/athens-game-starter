import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Native geometry for the existing citizen models. Shapes follow the chiton,
// peplos, exomis and himation described by the Met and Acropolis dress guides.
// This is stylized dress, rather than a reconstruction of one specific person.
export const ATHENIAN_DRESS = Object.freeze({
  citizen: { garment: 'peplos', hem: 0.16, wrap: true, bun: true, color: 0xcbb78d, wrapColor: 0x8b635b },
  merchant: { garment: 'chiton', hem: 0.62, wrap: true, beard: true, color: 0xe0cba8, wrapColor: 0x98563e },
  scholar: { garment: 'chiton', hem: 0.60, wrap: true, beard: true, color: 0xe6d9bd, wrapColor: 0x55657d },
  artisan: { garment: 'exomis', hem: 0.62, beard: true, color: 0xb3946d },
  dockworker: { garment: 'exomis', hem: 0.64, beard: true, color: 0x9e6f52 },
  priest: { garment: 'chiton', hem: 0.18, wrap: true, beard: true, color: 0xe9dec5, wrapColor: 0xb39a6a },
  guard: { garment: 'chiton', hem: 0.62, cloak: true, color: 0xab755b, wrapColor: 0x874d41 },
});

const geometryCache = new Map();
function clothGeometry(key, shape, columns = 48, rows = 9, start = 0, span = Math.PI * 2) {
  if (geometryCache.has(key)) return geometryCache.get(key);
  const positions = [], colors = [], indices = [];
  for (let row = 0; row <= rows; row++) for (let col = 0; col <= columns; col++) {
    const t = row / rows, angle = start + col / columns * span;
    const p = shape(angle, t);
    const fold = Math.cos(angle * 12) * 0.013 * (0.35 + t);
    positions.push(Math.sin(angle) * (p.radius + fold), p.y, Math.cos(angle) * (p.radius + fold) * 0.82);
    const shade = 0.91 + Math.cos(angle * 12) * 0.075;
    colors.push(shade, shade, shade);
    if (row < rows && col < columns) {
      const a = row * (columns + 1) + col, b = a + columns + 1;
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  geometryCache.set(key, geometry);
  return geometry;
}

export function getAthenianGarment(dress, simplified = false) {
  return clothGeometry(`garment:${dress.garment}:${dress.hem}:${simplified}`, (a, t) => {
    const top = dress.garment === 'exomis' ? 1.36 - Math.sin(a) * 0.18 : 1.51 - Math.cos(a) ** 2 * 0.11;
    const y = THREE.MathUtils.lerp(top, dress.hem, t);
    const waist = Math.exp(-(((y - 1.0) / 0.16) ** 2));
    return { y, radius: 0.34 + t * 0.075 - waist * 0.045 };
  }, simplified ? 12 : 48, simplified ? 3 : 9);
}

export function getAthenianWrap(simplified = false) {
  return clothGeometry(`himation:${simplified}`, (a, t) => {
    const top = 1.30 - Math.sin(a) * 0.27;
    // Clear the peplos overfold as well as the undergarment: overlapping
    // cloth shells otherwise cut a jagged line into the diagonal shoulder edge.
    return { y: top - t * 0.48, radius: 0.405 + t * 0.045 };
  }, simplified ? 12 : 48, simplified ? 3 : 7);
}

export function getPeplosOverfold() {
  return clothGeometry('peplos-overfold', (a, t) => ({
    y: THREE.MathUtils.lerp(1.51 - Math.cos(a) ** 2 * 0.11, 1.12, t), radius: 0.36 + t * 0.015,
  }), 48, 4);
}

export function getChlamys() {
  return clothGeometry('chlamys', (a, t) => ({ y: 1.52 - t * 0.8, radius: 0.36 + t * 0.1 }), 24, 6, Math.PI / 2, Math.PI);
}

export const SANDAL_SOLE = new THREE.BoxGeometry(0.16, 0.035, 0.28);
export const SANDAL_FOOT = new THREE.BoxGeometry(0.13, 0.06, 0.22).translate(0, 0.045, 0.015);
export const SANDAL_STRAPS = mergeGeometries([
  new THREE.BoxGeometry(0.15, 0.015, 0.03).translate(0, 0.08, 0.045),
  new THREE.BoxGeometry(0.15, 0.015, 0.03).translate(0, 0.08, -0.035),
  new THREE.BoxGeometry(0.025, 0.015, 0.17).translate(0, 0.081, 0),
]);

export function getCitizenCurls(cap) {
  if (geometryCache.has('curls')) return geometryCache.get('curls');
  const pieces = [cap];
  for (let i = 0; i < 12; i++) {
    const angle = i / 12 * Math.PI * 2;
    pieces.push(new THREE.SphereGeometry(0.047, 6, 4).translate(Math.sin(angle) * 0.205, 0.075, Math.cos(angle) * 0.205));
  }
  const geometry = mergeGeometries(pieces);
  geometryCache.set('curls', geometry);
  return geometry;
}
