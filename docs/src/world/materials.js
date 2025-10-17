import { createProceduralMarbleTextures } from "../core/AssetLoader.js";

export function makeMarbleMaterial(three) {
  const { map, normalMap, roughnessMap, aoMap } =
    createProceduralMarbleTextures();

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

export function makeMediterraneanPlasterMaterial(three) {
  return new three.MeshPhysicalMaterial({
    color: 0xe8dccb,
    roughness: 0.68,
    metalness: 0.06,
    sheen: 0.2,
    sheenColor: new three.Color(0xf4e8d4),
    clearcoat: 0.08,
    clearcoatRoughness: 0.7,
    envMapIntensity: 0.85,
  });
}

export function makeTreeMaterials(three) {
  const leafMaterial = new three.MeshStandardMaterial({
    color: 0x4a7a39,
    roughness: 0.75,
    metalness: 0.08,
  });
  leafMaterial.name = "TreeLeaves";

  const barkMaterial = new three.MeshStandardMaterial({
    color: 0x7b5e42,
    roughness: 0.9,
    metalness: 0.12,
  });
  barkMaterial.name = "TreeBark";

  return {
    leaf: leafMaterial,
    bark: barkMaterial,
  };
}
