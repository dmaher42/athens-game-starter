import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();
const BASE_PATH = import.meta.env.BASE_URL || "/athens-game-starter/";
const textureCache = new Map();

function loadTexture(url, { repeat = [1, 1], color = false } = {}) {
  if (!url) return null;

  const fullUrl = `${BASE_PATH}${url}`;
  const cacheKey = `${fullUrl}|${repeat[0]}|${repeat[1]}|${color ? "srgb" : "linear"}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey);
  }

  const texture = textureLoader.load(fullUrl);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  if (color) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  texture.anisotropy = 8;
  textureCache.set(cacheKey, texture);
  return texture;
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
  color: new THREE.Color(0xd3c3a2),
  repeat: [44, 44],
  map: "textures/sand/albedo.jpg",
  normalMap: "textures/sand/normal_gl.jpg",
  roughnessMap: "textures/sand/arm.jpg",
  metalnessMap: "textures/sand/arm.jpg",
  aoMap: "textures/sand/arm.jpg",
  roughness: 0.97,
  metalness: 0.04,
  normalScale: 0.4,
  aoIntensity: 0.6,
});

export const CityGroundMaterial = createGroundMaterial({
  name: "CityGroundMaterial",
  color: new THREE.Color(0xc8b08b),
  repeat: [54, 54],
  map: "textures/ground/dirt-albedo.jpg",
  roughness: 0.98,
  metalness: 0.02,
});

export const InlandGroundMaterial = createGroundMaterial({
  name: "InlandGroundMaterial",
  color: new THREE.Color(0x8ea071),
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
