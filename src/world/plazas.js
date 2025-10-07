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

  const perimeter = Math.PI * 2 * AGORA_RADIUS;
  const spacing = 7; // ~6-8 meters apart
  const instanceCount = Math.max(8, Math.floor(perimeter / spacing));
  const statueCount = Math.ceil(instanceCount / 2);
  const treeCount = instanceCount - statueCount;

  const statues = createAgoraStatues(statueCount);
  const trees = createAgoraTrees(treeCount);

  if (statues) group.add(statues);
  if (trees) group.add(trees);

  distributeAgoraDetails({
    instanceCount,
    statueMesh: statues,
    treeMesh: trees,
  });

  scene.add(group);
  return group;
}

function createAgoraStatues(count) {
  if (count <= 0) return null;
  const geometry = new THREE.CylinderGeometry(0.35, 0.45, 1.5, 16);
  geometry.translate(0, 0.75, 0);
  const material = new THREE.MeshStandardMaterial({
    color: 0xcfc8b8,
    roughness: 0.5,
    metalness: 0.15,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  mesh.name = 'AgoraStatues';
  return mesh;
}

function createAgoraTrees(count) {
  if (count <= 0) return null;
  const geometry = new THREE.ConeGeometry(1.2, 3, 12);
  geometry.translate(0, 1.5, 0);
  const material = new THREE.MeshStandardMaterial({
    color: 0x6f8a41,
    roughness: 0.85,
    metalness: 0.05,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  mesh.name = 'AgoraOliveTrees';
  return mesh;
}

function distributeAgoraDetails({ instanceCount, statueMesh, treeMesh }) {
  if (!statueMesh && !treeMesh) return;
  const dummy = new THREE.Object3D();
  const center = AGORA_CENTER_3D.clone();
  const radius = Math.max(0, AGORA_RADIUS - 1.2);
  let statueIndex = 0;
  let treeIndex = 0;

  for (let i = 0; i < instanceCount; i++) {
    const angle = (i / instanceCount) * Math.PI * 2;
    const x = center.x + Math.cos(angle) * radius;
    const z = center.z + Math.sin(angle) * radius;
    dummy.position.set(x, center.y, z);
    dummy.lookAt(center.x, center.y, center.z);
    dummy.rotation.x = 0;
    dummy.rotation.z = 0;

    if (i % 2 === 0 && statueMesh && statueIndex < statueMesh.count) {
      dummy.updateMatrix();
      statueMesh.setMatrixAt(statueIndex, dummy.matrix);
      statueIndex++;
    } else if (treeMesh && treeIndex < treeMesh.count) {
      dummy.rotation.y += (Math.PI / 4) * ((treeIndex % 3) - 1);
      dummy.updateMatrix();
      treeMesh.setMatrixAt(treeIndex, dummy.matrix);
      treeIndex++;
    }
  }

  if (statueMesh) statueMesh.instanceMatrix.needsUpdate = true;
  if (treeMesh) treeMesh.instanceMatrix.needsUpdate = true;
}
