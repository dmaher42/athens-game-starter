import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();
const BASE_URL =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  typeof import.meta.env.BASE_URL === "string"
    ? import.meta.env.BASE_URL
    : "/";
const RESOLVED_BASE_URL = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
const CITY_GROUND_PNG_URL = `${RESOLVED_BASE_URL}textures/ground/shader.png`;
const INLAND_GROUND_PNG_URL = `${RESOLVED_BASE_URL}textures/ground/shader.png`;
const COASTAL_GROUND_PNG_URL = `${RESOLVED_BASE_URL}textures/ground/shader.png`;
const ROADSIDE_MASK_FALLBACK = new THREE.DataTexture(
  new Uint8Array([0]),
  1,
  1,
  THREE.RedFormat,
  THREE.UnsignedByteType,
);
ROADSIDE_MASK_FALLBACK.needsUpdate = true;
ROADSIDE_MASK_FALLBACK.colorSpace = THREE.LinearSRGBColorSpace;

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

export const CityGroundMaterial = new THREE.MeshStandardMaterial({
  name: "CityGroundMaterial",
  color: 0xc9b79c,
  map: cityGroundTexture,
  roughness: 0.6,
  metalness: 0,
});
CityGroundMaterial.userData.roadside = {
  maskTexture: ROADSIDE_MASK_FALLBACK,
  tint: new THREE.Color(1.08, 1.06, 1.04),
  roughness: 0.75,
};
CityGroundMaterial.onBeforeCompile = (shader) => {
  shader.uniforms.uRoadsideMask = {
    value: CityGroundMaterial.userData?.roadside?.maskTexture ?? ROADSIDE_MASK_FALLBACK,
  };
  shader.uniforms.uRoadsideTint = {
    value: CityGroundMaterial.userData?.roadside?.tint ?? new THREE.Color(1, 1, 1),
  };
  shader.uniforms.uRoadsideRoughness = {
    value: CityGroundMaterial.userData?.roadside?.roughness ?? CityGroundMaterial.roughness,
  };

  CityGroundMaterial.userData.roadsideUniforms = shader.uniforms;

  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <roughnessmap_fragment>",
    `#include <roughnessmap_fragment>
     float roadsideWeight = texture2D(uRoadsideMask, vUv).r;
     roadsideWeight = clamp(roadsideWeight, 0.0, 1.0);
     diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * uRoadsideTint, roadsideWeight);
     roughnessFactor = mix(roughnessFactor, uRoadsideRoughness, roadsideWeight);`,
  );
};
// City ground texture
CityGroundMaterial.map = bindGroundTexture(
  CityGroundMaterial,
  "City",
  CITY_GROUND_PNG_URL,
  20,
);

export const InlandGroundMaterial = new THREE.MeshStandardMaterial({
  name: "InlandGroundMaterial",
  color: 0x8a6f4e,
  map: inlandGroundTexture,
  roughness: 0.85,
  metalness: 0,
});
// Inland ground texture
InlandGroundMaterial.map = bindGroundTexture(
  InlandGroundMaterial,
  "Inland",
  INLAND_GROUND_PNG_URL,
  32,
);

export const CoastalGroundMaterial = new THREE.MeshStandardMaterial({
  name: "CoastalGroundMaterial",
  color: 0xe6d3a3,
  map: coastalGroundTexture,
  roughness: 0.75,
  metalness: 0,
});
// Coastal ground texture
CoastalGroundMaterial.map = bindGroundTexture(
  CoastalGroundMaterial,
  "Coastal",
  COASTAL_GROUND_PNG_URL,
  16,
);
