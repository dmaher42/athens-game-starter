import * as THREE from 'three';

export function mountHillCityDebug(scene, curve, opts = {}) {
  if (!import.meta.env?.DEV) return null;

  const g = new THREE.Group();
  g.name = 'HillCityDebug';

  // Curve line
  if (curve) {
    const pts = curve.getPoints(200);
    const geo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, p.y + 0.05, p.z)));
    const mat = new THREE.LineBasicMaterial({ color: 0x00aaff });
    const line = new THREE.Line(geo, mat);
    g.add(line);
  }

  // Simple axis marker at agora/acropolis provided by caller if desired...
  scene.add(g);
  return g;
}
