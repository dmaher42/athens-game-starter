import { createProceduralMarbleTextures } from "../main.js";

export function makeMarbleMaterial(three) {
  const { map, normalMap, roughnessMap, aoMap } = createProceduralMarbleTextures();

  return new three.MeshPhysicalMaterial({
    map,
    normalMap,
    roughnessMap,
    aoMap,
    metalness: 0.05,
    roughness: 0.6,
    clearcoat: 0.3,
    clearcoatRoughness: 0.5,
    sheen: 0.0,
    envMapIntensity: 0.9,
  });
}

export function makeBronzeMaterial(three) {
  return new three.MeshPhysicalMaterial({
    color: 0x8d6e63,
    metalness: 0.85,
    roughness: 0.35,
    envMapIntensity: 1.0,
    clearcoat: 0.05,
    clearcoatRoughness: 0.6,
  });
}

