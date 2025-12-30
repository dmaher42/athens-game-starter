import * as THREE from "three";

export const CityGroundMaterial = new THREE.MeshStandardMaterial({
  color: 0xc9b79c,
  roughness: 0.6,
  metalness: 0,
});

export const InlandGroundMaterial = new THREE.MeshStandardMaterial({
  color: 0x8a6f4e,
  roughness: 0.85,
  metalness: 0,
});

export const CoastalGroundMaterial = new THREE.MeshStandardMaterial({
  color: 0xe6d3a3,
  roughness: 0.75,
  metalness: 0,
});
