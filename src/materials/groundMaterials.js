import * as THREE from "three";
import { loadSafeTexture } from "../utils/TextureUtils.js";

const BASE_PATH = import.meta.env.BASE_URL || "/athens-game-starter/";

function loadTexture(url, { repeat = [1, 1], color = false } = {}) {
  if (!url) return null;
  
  return loadSafeTexture(url, {
    repeat,
    isColor: color,
    fallback: color ? 0xd4bf9a : 0x888888 // Default to dirt color for albedo
  });
}

function createGroundMaterial({
  name,
  color,
  repeat,
  map,
  normalMap,
  roughnessMap,
  metalnessMap,
  aoMap,
  bumpMap,
  roughness = 1,
  metalness = 0,
  normalScale = 1,
  bumpScale = 0,
  aoIntensity = 1,
}) {
  return new THREE.MeshStandardMaterial({
    name,
    color,
    map: loadTexture(map, { repeat, color: true }),
    normalMap: loadTexture(normalMap, { repeat }),
    roughnessMap: loadTexture(roughnessMap, { repeat }),
    metalnessMap: loadTexture(metalnessMap, { repeat }),
    aoMap: loadTexture(aoMap, { repeat }),
    bumpMap: loadTexture(bumpMap, { repeat }),
    roughness,
    metalness,
    normalScale: new THREE.Vector2(normalScale, normalScale),
    bumpScale,
    aoMapIntensity: aoIntensity,
  });
}

export const CoastalGroundMaterial = createGroundMaterial({
  name: "CoastalGroundMaterial",
  color: new THREE.Color(0xc7bea8),
  repeat: [36, 36],
  map: "textures/sand/albedo.jpg",
  normalMap: "textures/sand/normal_gl.jpg",
  roughnessMap: "textures/sand/arm.jpg",
  metalnessMap: "textures/sand/arm.jpg",
  aoMap: "textures/sand/arm.jpg",
  roughness: 0.97,
  metalness: 0.04,
  normalScale: 0.32,
  aoIntensity: 0.6,
});

export const CityGroundMaterial = createGroundMaterial({
  name: "CityGroundMaterial",
  color: new THREE.Color(0xd4bf9a),
  repeat: [42, 42],
  map: "textures/ground/dirt-albedo.jpg",
  normalMap: "textures/sand/normal_gl.jpg",
  roughnessMap: "textures/sand/arm.jpg",
  metalnessMap: "textures/sand/arm.jpg",
  aoMap: "textures/sand/arm.jpg",
  roughness: 1,
  metalness: 0,
  normalScale: 0.14,
  aoIntensity: 0.25,
});

export const InlandGroundMaterial = createGroundMaterial({
  name: "InlandGroundMaterial",
  color: new THREE.Color(0xa8b88a),
  repeat: [72, 72],
  map: "textures/grass/albedo.jpg",
  normalMap: "textures/grass/normal_dx.jpg",
  roughnessMap: "textures/grass/roughness.jpg",
  metalnessMap: "textures/grass/metallic.jpg",
  aoMap: "textures/grass/ao.jpg",
  bumpMap: "textures/grass/height.jpg",
  roughness: 1,
  metalness: 0.01,
  normalScale: 0.25,
  bumpScale: 0.015,
  aoIntensity: 0.4,
});

let terrainMeshForUpdates = null;

export function setTerrainMeshForUpdates(mesh) {
  terrainMeshForUpdates = mesh;
}

export function diagnoseMaterialState() {
  return {
    hasTerrainMesh: Boolean(terrainMeshForUpdates),
    materialNames: Array.isArray(terrainMeshForUpdates?.material)
      ? terrainMeshForUpdates.material.map((material) => material?.name ?? "unknown")
      : terrainMeshForUpdates?.material?.name ?? null,
  };
}

export function validateCityGroundMaterials() {
  return Boolean(CityGroundMaterial.map && InlandGroundMaterial.map && CoastalGroundMaterial.map);
}
