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
  console.log(`[Ground] Loading ${label} texture from: ${url}`);
  
  const texture = textureLoader.load(
    url,
    (loadedTex) => {
      console.log(`[Ground] ✓ ${label} texture loaded successfully`, {
        url,
        size: `${loadedTex.source.data.width}x${loadedTex.source.data.height}`,
        material: material.name
      });
      // Force material update when texture loads
      material.map = loadedTex;
      material.needsUpdate = true;
    },
    undefined,
    (error) => {
      console.error(`[Ground] ✗ Failed to load ${label} texture from ${url}`, error);
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

  const roadsideMaskTexture = new THREE.DataTexture(
    new Uint8Array([255]),
    1,
    1,
    THREE.RedFormat,
    THREE.UnsignedByteType,
  );
  roadsideMaskTexture.needsUpdate = true;
  roadsideMaskTexture.colorSpace = THREE.LinearSRGBColorSpace;

  material.userData = material.userData || {};
  material.userData.roadsideMask = roadsideMaskTexture;
  material.userData.roadsideTint = new THREE.Color(0.8, 0.7, 0.6);
  material.userData.roadsideRoughness = 0.9;

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

    const uniformDeclarations = `
      uniform sampler2D uRoadsideMask;
      uniform vec3 uRoadsideTint;
      uniform float uRoadsideRoughness;
    `;
    const varyingDeclarations = "varying vec2 vUv;";

    // Patch vertex shader to declare and set vUv
    if (!shader.vertexShader.includes(varyingDeclarations)) {
      shader.vertexShader = varyingDeclarations + "\n" + shader.vertexShader;
    }
    shader.vertexShader = shader.vertexShader.replace(
      "#include <uv_vertex>",
      "#include <uv_vertex>\n  vUv = uv;",
    );

    // Patch fragment shader to declare uniforms and vUv
    if (!shader.fragmentShader.includes(uniformDeclarations.trim())) {
      shader.fragmentShader =
        uniformDeclarations + "\n" + shader.fragmentShader;
    }
    if (!shader.fragmentShader.includes(varyingDeclarations)) {
      shader.fragmentShader =
        varyingDeclarations + "\n" + shader.fragmentShader;
    }

    // Inject the roadside effect logic into the fragment shader
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <roughnessmap_fragment>",
      `#include <roughnessmap_fragment>
      float roadsideWeight = texture2D(uRoadsideMask, vUv).r;
      roadsideWeight = clamp(roadsideWeight, 0.0, 1.0);
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * uRoadsideTint, roadsideWeight);
      roughnessFactor = mix(roughnessFactor, uRoadsideRoughness, roadsideWeight);`
    );

  };

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
InlandGroundMaterial.needsUpdate = true;

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
CoastalGroundMaterial.needsUpdate = true;

// Diagnostic function to inspect material state
export function diagnoseMaterialState() {
  const diagnostics = {
    city: {
      material: 'CityGroundMaterial',
      hasMap: !!createCityGroundMaterial().map,
      colorSpace: createCityGroundMaterial().map?.colorSpace
    },
    inland: {
      material: 'InlandGroundMaterial',
      hasMap: !!InlandGroundMaterial.map,
      mapURL: InlandGroundMaterial.map?.source?.data?.currentSrc || 'unknown'
    },
    coastal: {
      material: 'CoastalGroundMaterial',
      hasMap: !!CoastalGroundMaterial.map,
      mapURL: CoastalGroundMaterial.map?.source?.data?.currentSrc || 'unknown'
    }
  };
  
  console.log('[Ground] Material diagnostics:', diagnostics);
  return diagnostics;
}

// Step 6: Confirm all ground textures are restored for City, Inland, and Coastal zones
console.log('[Ground] Ground texture materials initialized:', {
  city: 'CityGroundMaterial (dirt-albedo.jpg)',
  inland: 'InlandGroundMaterial (grass/albedo.jpg)',
  coastal: 'CoastalGroundMaterial (sand/albedo.jpg)'
});
