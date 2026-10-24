import * as THREE from "three";
import { createProceduralMarbleTextures } from "../core/AssetLoader.js";
import { resolveBaseUrl, joinPath } from "../utils/baseUrl.js";

const textureLoader = new THREE.TextureLoader();
const baseUrl = resolveBaseUrl();

/**
 * Helper to load and configure a texture with tiling
 */
function loadTexture(path, tilingX = 1, tilingY = 1) {
  const url = joinPath(baseUrl, path);
  const texture = textureLoader.load(url);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(tilingX, tilingY);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function makeMarbleMaterial() {
  const { map, normalMap, roughnessMap, aoMap } =
    createProceduralMarbleTextures();

  return new THREE.MeshPhysicalMaterial({
    map,
    normalMap,
    roughnessMap,
    aoMap,
    metalness: 0.1, // Slightly higher for subtle highlights
    roughness: 0.45, // Smoother for polished look
    clearcoat: 0.25,
    clearcoatRoughness: 0.3,
    sheen: 0.15,
    sheenRoughness: 0.8,
    envMapIntensity: 1.25, // Stronger environmental highlights
  });
}

export function makeBronzeMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0x8d6e63,
    metalness: 0.85,
    roughness: 0.35,
    envMapIntensity: 1.0,
    clearcoat: 0.05,
    clearcoatRoughness: 0.6,
  });
}

export function makeMediterraneanPlasterMaterial() {
  const texture = loadTexture("textures/plaster_rough.jpg", 4, 4);
  return new THREE.MeshPhysicalMaterial({
    map: texture,
    roughnessMap: texture,
    roughness: 0.82,
    metalness: 0.02,
    envMapIntensity: 1.1,
    bumpMap: texture,
    bumpScale: 0.08,
    sheen: 0.4, // Stronger sheen for sun-bleaching
    sheenRoughness: 0.9,
    sheenColor: new THREE.Color(0xffffff),
  });
}

export function makeMonumentalStoneMaterial() {
  const texture = loadTexture("textures/stone_rough.jpg", 2, 2);
  return new THREE.MeshPhysicalMaterial({
    map: texture,
    roughnessMap: texture,
    roughness: 0.85,
    metalness: 0.0,
    envMapIntensity: 0.7,
    bumpMap: texture,
    bumpScale: 0.1,
  });
}

export function makeAncientWoodMaterial() {
  const texture = loadTexture("textures/wood_weathered.jpg", 3, 3);
  return new THREE.MeshPhysicalMaterial({
    map: texture,
    roughnessMap: texture,
    roughness: 0.9,
    metalness: 0.0,
    envMapIntensity: 0.6,
    bumpMap: texture,
    bumpScale: 0.12,
  });
}

export function makeTerracottaRoofMaterial() {
  const texture = loadTexture("textures/roof_tiles_terracotta.jpg", 5, 5);
  return new THREE.MeshPhysicalMaterial({
    map: texture,
    roughnessMap: texture,
    roughness: 0.75,
    metalness: 0.02,
    envMapIntensity: 1.2,
    bumpMap: texture,
    bumpScale: 0.18,
    sheen: 0.2,
    sheenRoughness: 0.85,
  });
}

export function makeTreeMaterials() {
  const leafMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x4f7f3b,
    roughness: 0.65,
    metalness: 0.05,
    sheen: 0.5, // Significant sheen for sunlight scattering through canopy
    sheenRoughness: 0.8,
    envMapIntensity: 1.1,
  });
  leafMaterial.name = "TreeLeaves";

  const barkMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x7b5e42,
    roughness: 0.88,
    metalness: 0.0,
    bumpScale: 0.15,
    envMapIntensity: 0.8,
  });
  barkMaterial.name = "TreeBark";

  return {
    leaf: leafMaterial,
    bark: barkMaterial,
  };
}
