import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();

function loadTexture(url) {
  console.log(`[Ground] Loading texture: ${url}`);
  const texture = textureLoader.load(
    url,
    (tex) => console.log(`[Ground] ✅ Loaded: ${url}`),
    undefined,
    (err) => console.error(`[Ground] ❌ Failed: ${url}`, err)
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 10);
  return texture;
}

// Simple MeshBasicMaterial - just load JPG and display it
export const CityGroundMaterial = new THREE.MeshBasicMaterial({
  name: "CityGroundMaterial",
  map: loadTexture("textures/ground/dirt-albedo.jpg"),
});

export const InlandGroundMaterial = new THREE.MeshBasicMaterial({
  name: "InlandGroundMaterial",
  map: loadTexture("textures/grass/albedo.jpg"),
});

export const CoastalGroundMaterial = new THREE.MeshBasicMaterial({
  name: "CoastalGroundMaterial",
  map: loadTexture("textures/sand/albedo.jpg"),
});

// Stub functions for compatibility
export function setTerrainMeshForUpdates() {}
export function diagnoseMaterialState() {}
export function validateCityGroundMaterials() {}
