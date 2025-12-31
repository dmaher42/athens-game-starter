import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();
const BASE_URL =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  typeof import.meta.env.BASE_URL === "string"
    ? import.meta.env.BASE_URL
    : "/";
const RESOLVED_BASE_URL = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;

const CITY_GROUND_URL = `${RESOLVED_BASE_URL}textures/ground/dirt-albedo.jpg`;
const INLAND_GROUND_URL = `${RESOLVED_BASE_URL}textures/grass/albedo.jpg`;
const COASTAL_GROUND_URL = `${RESOLVED_BASE_URL}textures/sand/albedo.jpg`;

let warnedTextureFailure = false;

function bindGroundTexture(material, label, url, repeat) {
  const texture = textureLoader.load(
    url,
    () => {
      console.log(`[Ground] ${label} texture bound to ${material.name}`);
    },
    undefined,
    () => {
      if (!warnedTextureFailure) {
        warnedTextureFailure = true;
        console.warn("[Ground] Failed to load ground texture; using flat color.");
      }
      material.map = null;
      material.needsUpdate = true;
    },
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  return texture;
}

export function createCityGroundMaterial() {
  const material = new THREE.MeshStandardMaterial({
    name: "CityGroundMaterial",
    color: 0xc9b79c,
    roughness: 0.6,
    metalness: 0,
  });

  // Force-clear shader hooks to prevent legacy roadside injection
  material.onBeforeCompile = null;
  delete material.userData;

  // City ground texture
  material.map = bindGroundTexture(
    material,
    "City",
    CITY_GROUND_URL,
    32,
  );

  material.needsUpdate = true;
  Object.freeze(material);
  return material;
}

export const InlandGroundMaterial = new THREE.MeshStandardMaterial({
  name: "InlandGroundMaterial",
  color: 0x8a6f4e,
  roughness: 0.85,
  metalness: 0,
});
// Inland ground texture
InlandGroundMaterial.map = bindGroundTexture(
  InlandGroundMaterial,
  "Inland",
  INLAND_GROUND_URL,
  32,
);

export const CoastalGroundMaterial = new THREE.MeshStandardMaterial({
  name: "CoastalGroundMaterial",
  color: 0xe6d3a3,
  roughness: 0.75,
  metalness: 0,
});
// Coastal ground texture
CoastalGroundMaterial.map = bindGroundTexture(
  CoastalGroundMaterial,
  "Coastal",
  COASTAL_GROUND_URL,
  16,
);
