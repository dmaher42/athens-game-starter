import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();
const BASE_PATH = import.meta.env.BASE_URL || "/athens-game-starter/";

const CITY_GROUND_URL = `${RESOLVED_BASE_URL}textures/ground/dirt-albedo.jpg`;
const INLAND_GROUND_URL = `${RESOLVED_BASE_URL}textures/grass/albedo.jpg`;
const COASTAL_GROUND_URL = `${RESOLVED_BASE_URL}textures/sand/albedo.jpg`;

let warnedTextureFailure = false;

function bindGroundTexture(material, label, url, repeat) {
  const texture = textureLoader.load(
    fullUrl,
    (tex) => console.log(`[Ground] ✅ Loaded: ${fullUrl}`),
    undefined,
    (err) => console.error(`[Ground] ❌ Failed: ${fullUrl}`, err)
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 10);
  return texture;
}

export function createCityGroundMaterial() {
  const material = new THREE.MeshStandardMaterial({
    name: "CityGroundMaterial",
    color: 0xc9b79c,
    roughness: 0.6,
    metalness: 0,
  });

  // City ground texture
  material.map = bindGroundTexture(
    material,
    "City",
    CITY_GROUND_URL,
    32,
  );

  material.needsUpdate = true;
  return material;
}

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
