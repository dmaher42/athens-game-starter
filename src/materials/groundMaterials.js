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
const ROADSIDE_SNIPPET_SENTINEL = "ROADSIDE_FRAGMENT_SNIPPET";

const fallbackRoadsideMask = (() => {
  const data = new Uint8Array([0]);
  const texture = new THREE.DataTexture(
    data,
    1,
    1,
    THREE.RedFormat,
    THREE.UnsignedByteType,
  );
  texture.needsUpdate = true;
  texture.colorSpace = THREE.LinearSRGBColorSpace;
  return texture;
})();

const fallbackDiffuseTexture = (() => {
  const data = new Uint8Array([255, 255, 255, 255]);
  const texture = new THREE.DataTexture(
    data,
    1,
    1,
    THREE.RGBAFormat,
    THREE.UnsignedByteType,
  );
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
})();

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

  const baseOnBeforeCompile = material.onBeforeCompile;
  material.onBeforeCompile = (shader) => {
    if (typeof baseOnBeforeCompile === "function") {
      baseOnBeforeCompile.call(material, shader);
    }

    if (!shader?.fragmentShader || !shader.uniforms) {
      return;
    }

    if (!material.map) {
      material.map = fallbackDiffuseTexture;
      material.needsUpdate = true;
    }

    material.userData = material.userData || {};
    material.userData.roadsideMask =
      material.userData.roadsideMask || fallbackRoadsideMask;
    material.userData.roadsideTint =
      material.userData.roadsideTint || new THREE.Color(0x9e8b70);
    material.userData.roadsideRoughness =
      typeof material.userData.roadsideRoughness === "number"
        ? material.userData.roadsideRoughness
        : 0.85;

    shader.uniforms.uRoadsideMask = shader.uniforms.uRoadsideMask || {
      value: material.userData.roadsideMask,
    };
    shader.uniforms.uRoadsideTint = shader.uniforms.uRoadsideTint || {
      value: material.userData.roadsideTint,
    };
    shader.uniforms.uRoadsideRoughness = shader.uniforms.uRoadsideRoughness || {
      value: material.userData.roadsideRoughness,
    };

    const hasUvParsFragment = shader.fragmentShader.includes(
      "#include <uv_pars_fragment>",
    );
    const roadsideUniforms =
      "uniform sampler2D uRoadsideMask;\n" +
      "uniform vec3 uRoadsideTint;\n" +
      "uniform float uRoadsideRoughness;\n";

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      [
        "#include <common>",
        ...(hasUvParsFragment ? [] : ["#include <uv_pars_fragment>"]),
        roadsideUniforms,
      ].join("\n"),
    );

    if (!shader.fragmentShader.includes(ROADSIDE_SNIPPET_SENTINEL)) {
      const roadsideSnippet = [
        `#define ${ROADSIDE_SNIPPET_SENTINEL}`,
        "float roadsideWeight = texture2D(uRoadsideMask, vUv).r;",
        "roadsideWeight = clamp(roadsideWeight, 0.0, 1.0);",
        "diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * uRoadsideTint, roadsideWeight);",
        "roughnessFactor = mix(roughnessFactor, uRoadsideRoughness, roadsideWeight);",
      ].join("\n");

      shader.fragmentShader = shader.fragmentShader.replace(
        "float metalnessFactor = metalness;",
        `float metalnessFactor = metalness;\n${roadsideSnippet}`,
      );
    }

    shader.uniforms.uRoadsideMask.value = material.userData.roadsideMask;
    shader.uniforms.uRoadsideTint.value = material.userData.roadsideTint;
    shader.uniforms.uRoadsideRoughness.value = material.userData.roadsideRoughness;
  };

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
