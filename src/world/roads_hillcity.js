import * as THREE from 'three';
import { MAIN_ROAD_WIDTH, HARBOR_CENTER_3D, AGORA_CENTER_3D, ACROPOLIS_PEAK_3D } from './locations.js';

export function createMainHillRoad(scene) {
  // Gentle S-curve from harbor → agora → acropolis
  const pts = [
    HARBOR_CENTER_3D.clone().add(new THREE.Vector3(8, 0, -10)),
    HARBOR_CENTER_3D.clone().lerp(AGORA_CENTER_3D, 0.4).add(new THREE.Vector3(-10, 2, 6)),
    AGORA_CENTER_3D.clone(),
    AGORA_CENTER_3D.clone().lerp(ACROPOLIS_PEAK_3D, 0.6).add(new THREE.Vector3(6, 2, -4)),
    ACROPOLIS_PEAK_3D.clone()
  ];
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1);

  // Build a ribbon mesh that follows the curve (simple road surface)
  const segments = 180;
  const width = MAIN_ROAD_WIDTH;
  const geo = new THREE.PlaneGeometry(width, 1, 1, segments);
  const pos = geo.attributes.position;
  const tangent = new THREE.Vector3();
  const dir = new THREE.Vector3();

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = curve.getPoint(t);
    const next = curve.getPoint(Math.min(1, t + 1 / segments));
    tangent.subVectors(next, p).normalize();
    const angle = Math.atan2(tangent.x, tangent.z);
    for (let j = 0; j < 2; j++) {
      const idx = (i * 2 + j) * 3;
      const side = j === 0 ? -0.5 : 0.5;
      dir.set(Math.sin(angle) * side * width, 0, Math.cos(angle) * side * width);
      pos.setXYZ(idx / 3, p.x + dir.x, p.y, p.z + dir.z);
    }
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({ color: 0x6a6a6a, roughness: 1, metalness: 0, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  mesh.name = 'MainHillRoad';

  const group = new THREE.Group();
  group.name = 'Roads';
  group.add(mesh);
  scene.add(group);

  return { group, curve, mesh };
}
