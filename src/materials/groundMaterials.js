import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();
const BASE_URL =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  typeof import.meta.env.BASE_URL === "string"
    ? import.meta.env.BASE_URL
    : "/";
const RESOLVED_BASE_URL = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
const GROUND_SHADER_URL = `${RESOLVED_BASE_URL}textures/ground/shader.png`;

function loadGroundTexture(url, repeat) {
  const texture = textureLoader.load(url);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  return texture;
}

// City ground texture
const cityGroundTexture = loadGroundTexture(GROUND_SHADER_URL, 20);
// Inland ground texture
const inlandGroundTexture = loadGroundTexture(GROUND_SHADER_URL, 32);
// Coastal ground texture
const coastalGroundTexture = loadGroundTexture(GROUND_SHADER_URL, 16);

export const CityGroundMaterial = new THREE.MeshStandardMaterial({
  color: 0xc9b79c,
  map: cityGroundTexture,
  roughness: 0.6,
  metalness: 0,
});

export const InlandGroundMaterial = new THREE.MeshStandardMaterial({
  color: 0x8a6f4e,
  map: inlandGroundTexture,
  roughness: 0.85,
  metalness: 0,
});

export const CoastalGroundMaterial = new THREE.MeshStandardMaterial({
  color: 0xe6d3a3,
  map: coastalGroundTexture,
  roughness: 0.75,
  metalness: 0,
});
