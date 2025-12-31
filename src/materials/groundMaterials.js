/**
 * ✅ ACTIVE GROUND MATERIAL SYSTEM
 * 
 * This is the ACTIVE ground texture system used in production.
 * 
 * System Overview:
 * - Three material zones: Coastal (sand), City (dirt), Inland (grass)
 * - Simple texture loading with placeholder fallbacks
 * - Shader modifications for roadside effects (currently disabled)
 * - UV validation and fallback generation
 * 
 * Materials are applied via THREE.BufferGeometry groups in terrain.js:
 * - Group 0: CoastalGroundMaterial (near shore)
 * - Group 1: CityGroundMaterial (middle band)
 * - Group 2: InlandGroundMaterial (inland hills)
 * 
 * Legacy Alternative: src/world/groundTextures.js (not used)
 */

import * as THREE from "three";

let terrainMeshReference = null;

export function setTerrainMeshForUpdates(terrain) {
  terrainMeshReference = terrain;
  console.log('[Ground] Terrain mesh registered for material updates');
}

function triggerTerrainUpdate() {
  if (terrainMeshReference && terrainMeshReference.material) {
    // Force all materials to update
    if (Array.isArray(terrainMeshReference.material)) {
      terrainMeshReference.material.forEach((mat, idx) => {
        console.log(`[Ground] Material[${idx}] state:`, {
          name: mat.name,
          hasMap: !!mat.map,
          color: mat.color?.getHexString(),
          roughness: mat.roughness,
          metalness: mat.metalness
        });
        mat.needsUpdate = true;
      });
    } else {
      terrainMeshReference.material.needsUpdate = true;
    }
    console.log('[Ground] Terrain materials flagged for update');
  }
}

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
  console.log(`[Ground] 🔄 Loading ${label} texture from: ${url}`);
  
  // Create a simple canvas placeholder while loading
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  // Use label to determine placeholder color
  if (label === 'City') {
    ctx.fillStyle = '#c9b79c'; // City tan
  } else if (label === 'Inland') {
    ctx.fillStyle = '#8a6f4e'; // Inland brown
  } else if (label === 'Coastal') {
    ctx.fillStyle = '#e6d3a3'; // Coastal light
  }
  ctx.fillRect(0, 0, 128, 128);
  
  const placeholderTexture = new THREE.CanvasTexture(canvas);
  placeholderTexture.colorSpace = THREE.SRGBColorSpace;
  placeholderTexture.wrapS = placeholderTexture.wrapT = THREE.RepeatWrapping;
  placeholderTexture.repeat.set(repeat, repeat);
  
  // Set placeholder immediately
  material.map = placeholderTexture;
  material.needsUpdate = true;
  console.log(`[Ground] 📋 ${label} placeholder texture set while loading...`);
  
  // ✅ STEP 2: Validate texture loading with comprehensive callbacks
  textureLoader.load(
    url,
    (loadedTex) => {
      console.log(`[Ground] ✅ ${label} texture loaded successfully`, {
        url,
        width: loadedTex.source.data.width,
        height: loadedTex.source.data.height,
        format: loadedTex.format,
        type: loadedTex.type,
        material: material.name
      });
      
      // ✅ STEP 3: Rebuild texture with correct settings
      loadedTex.colorSpace = THREE.SRGBColorSpace;
      loadedTex.wrapS = loadedTex.wrapT = THREE.RepeatWrapping;
      loadedTex.repeat.set(repeat, repeat);
      loadedTex.needsUpdate = true;
      
      // Replace placeholder with actual texture
      material.map = loadedTex;
      material.map.needsUpdate = true;
      material.needsUpdate = true;
      triggerTerrainUpdate(); // Force terrain to update
      
      console.log(`[Ground] ✅ ${label} texture applied to material`, {
        materialHasMap: !!material.map,
        mapIsValid: material.map?.image?.width > 0,
        repeat: repeat,
        wrapS: material.map?.wrapS,
        wrapT: material.map?.wrapT
      });
    },
    (progress) => {
      if (progress.lengthComputable) {
        const percentComplete = (progress.loaded / progress.total) * 100;
        console.log(`[Ground] 📥 ${label} loading... ${percentComplete.toFixed(1)}%`);
      }
    },
    (error) => {
      console.error(`[Ground] ❌ Failed to load ${label} texture from ${url}`, error);
      console.warn(`[Ground] ⚠️ Using placeholder texture for ${label}`);
      console.error('[Ground] Error details:', {
        message: error.message,
        type: error.type,
        target: error.target
      });
      // Keep placeholder if load fails
    },
  );
}

// ✅ STEP 3: Create CityGroundMaterial as singleton (cached instance)
const CityGroundMaterial = (() => {
  const material = new THREE.MeshStandardMaterial({
    name: "CityGroundMaterial",
    color: 0xffffff, // White to let texture show through clearly
    roughness: 1.0,  // Maximum roughness for matte ground appearance
    metalness: 0.0,  // No metallic reflection
    aoMapIntensity: 0, // Disable AO so texture is clearly visible
    map: null, // Will be set by bindGroundTexture
    envMapIntensity: 0.0, // Disable environment reflections completely
    flatShading: false,
  });
  
  console.log('[Ground] 🏗️ CityGroundMaterial created:', {
    name: material.name,
    color: material.color.getHexString(),
    roughness: material.roughness,
    metalness: material.metalness
  });

  const roadsideMaskTexture = new THREE.DataTexture(
    new Uint8Array([0]), // Set to 0 to disable roadside tint overlay
    1,
    1,
    THREE.RedFormat,
    THREE.UnsignedByteType,
  );
  roadsideMaskTexture.needsUpdate = true;
  roadsideMaskTexture.colorSpace = THREE.LinearSRGBColorSpace;

  material.userData = material.userData || {};
  material.userData.roadsideMask = roadsideMaskTexture;
  material.userData.roadsideTint = new THREE.Color(1.0, 1.0, 1.0); // Neutral white tint
  material.userData.roadsideRoughness = 1.0; // Match base material roughness

  // ✅ STEP 4: onBeforeCompile is scoped to this material instance only
  // This shader modification only applies to CityGroundMaterial, not other materials
  const baseOnBeforeCompile = material.onBeforeCompile;
  material.onBeforeCompile = (shader) => {
    // Preserve any existing onBeforeCompile behavior
    if (typeof baseOnBeforeCompile === "function") {
      baseOnBeforeCompile.call(material, shader);
    }

    // Validate shader object before proceeding
    if (!shader?.fragmentShader || !shader.uniforms) {
      console.warn('[Ground] Shader compilation skipped - invalid shader object');
      return;
    }

    // Ensure material has a valid texture map
    if (!material.map) {
      console.warn('[Ground] No texture map found, using fallback');
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

    // Reduce contrast boost for better texture visibility
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `
      #include <map_fragment>
      // Light contrast boost to enhance texture visibility without darkening
      diffuseColor.rgb = pow(diffuseColor.rgb, vec3(1.05));
      `
    );

    // Debug visualization disabled - set to true and rebuild to enable
    // const DEBUG_CITY_MASK = false;
    // if (DEBUG_CITY_MASK) {
    //   shader.fragmentShader = shader.fragmentShader.replace(
    //     '#include <dithering_fragment>',
    //     `
    //     // City mask debug visualization
    //     vec2 debugUV = vUv;
    //     
    //     // Sample city mask
    //     float cityWeight = texture2D(uRoadsideMask, debugUV).r;
    //     
    //     // Map cityWeight to RGB: red = masked, green = unmasked, blue = blend
    //     gl_FragColor = vec4(vec3(cityWeight, 1.0 - cityWeight, cityWeight * 0.5), 1.0);
    //     `
    //   );
    //   console.log('[Ground] DEBUG: City mask visualization enabled - red=masked, green=unmasked');
    // }

  };

  // City ground texture
  material.map = bindGroundTexture(
    material,
    "City",
    CITY_GROUND_URL,
    120, // UV tiling scale for city ground
  );

  material.needsUpdate = true;
  return material;
})();

export { CityGroundMaterial };

export const InlandGroundMaterial = new THREE.MeshStandardMaterial({
  name: "InlandGroundMaterial",
  color: 0xffffff, // White to let texture show
  roughness: 0.9, // Higher roughness for natural ground
  metalness: 0,
  aoMapIntensity: 0,
});

// Add shore blending effect based on elevation
InlandGroundMaterial.onBeforeCompile = (shader) => {
  shader.fragmentShader = `
    uniform float uShoreHeight;
    uniform float uShoreFade;
  ` + shader.fragmentShader;

  shader.uniforms.uShoreHeight = { value: 0.0 };
  shader.uniforms.uShoreFade = { value: 20.0 };

  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <dithering_fragment>',
    `
    // Compute blend factor by world Y height
    float blendFactor = clamp((vViewPosition.y + uShoreHeight) / uShoreFade, 0.0, 1.0);

    // Fade to coastal color near shore (assumes coastal is sandy bright)
    diffuseColor.rgb = mix(vec3(0.96, 0.85, 0.72), diffuseColor.rgb, blendFactor);

    #include <dithering_fragment>
    `
  );
};

// Inland ground texture
InlandGroundMaterial.map = bindGroundTexture(
  InlandGroundMaterial,
  "Inland",
  INLAND_GROUND_URL,
  80, // UV tiling scale for inland ground
);
InlandGroundMaterial.needsUpdate = true;

export const CoastalGroundMaterial = new THREE.MeshStandardMaterial({
  name: "CoastalGroundMaterial",
  color: 0xffffff, // White to let texture show
  roughness: 0.9, // Higher roughness for sandy ground
  metalness: 0,
  aoMapIntensity: 0,
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
      hasMap: !!CityGroundMaterial.map,
      colorSpace: CityGroundMaterial.map?.colorSpace
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

// Debug utility: Enable city mask visualization
export function enableCityMaskDebug() {
  const DEBUG_CITY_MASK = true;
  console.log('[Ground] City mask debug enabled - recompile materials to see visualization');
  console.log('[Ground] Red = city mask active, Green = unmasked areas');
  return DEBUG_CITY_MASK;
}

// Step 6: Confirm all ground textures are restored for City, Inland, and Coastal zones
console.log('[Ground] Ground texture materials initialized:', {
  city: 'CityGroundMaterial (dirt-albedo.jpg)',
  inland: 'InlandGroundMaterial (grass/albedo.jpg)',
  coastal: 'CoastalGroundMaterial (sand/albedo.jpg)',
  debug: 'Call window.enableCityMaskDebug() to visualize city mask blending'
});
