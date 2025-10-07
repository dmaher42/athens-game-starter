import * as THREE from 'three';
import { AGORA_CENTER_3D, AGORA_RADIUS, ACROPOLIS_PEAK_3D, ACROPOLIS_RADIUS } from './locations.js';

function makeDisc(center, radius, color) {
  const geo = new THREE.CircleGeometry(radius, 48);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.copy(center);
  mesh.receiveShadow = true;
  mesh.name = 'Plaza';
  return mesh;
}

export function createPlazas(scene) {
  const group = new THREE.Group();
  group.name = 'Plazas';
  group.add(makeDisc(AGORA_CENTER_3D, AGORA_RADIUS, 0xe6e2d6));      // warm stone
  group.add(makeDisc(ACROPOLIS_PEAK_3D, ACROPOLIS_RADIUS, 0xede8dc)); // lighter marble
  scene.add(group);
  return group;
}
