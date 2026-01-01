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

// Simple preset system for ground materials; defaults to "default"
const GROUND_MATERIAL_PRESETS = {
  default: {
    city: {
      color: new THREE.Color(0xffffff), // Pure white for no tinting
      roughness: 0.65, // Reduced from 0.95 - allows texture detail to show
      metalness: 0.0,
      repeat: 60,
    },
    inland: {
      color: new THREE.Color(0xffffff), // Pure white for no tinting
      roughness: 0.7, // Reduced from 1.0
      metalness: 0.0,
      repeat: 40,
    },
    coastal: {
      color: new THREE.Color(0xffffff), // Pure white for no tinting
      roughness: 0.7, // Reduced from 1.0
      metalness: 0.0,
      repeat: 16,
    },
  },
};

let warnedTextureFailure = false;
let cityMap = null;
let inlandMap = null;
let coastalMap = null;

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
  
  // Create a temporary placeholder texture so material shader knows to expect a map
  const placeholderData = new Uint8Array(4).fill(192); // Gray
  const placeholderTex = new THREE.DataTexture(
    placeholderData,
    1,
    1,
    THREE.RGBAFormat,
    THREE.UnsignedByteType,
  );
  placeholderTex.needsUpdate = true;
  material.map = placeholderTex;
  material.needsUpdate = true;
  
  textureLoader.load(
    url,
    (loadedTex) => {
      const width = loadedTex.source.data.width;
      const height = loadedTex.source.data.height;
      
      console.log(`[Ground] ✅ ${label} texture loaded successfully`, {
        url,
        width,
        height,
        format: loadedTex.format,
        type: loadedTex.type,
        material: material.name
      });
      
      // Validate texture dimensions
      const MIN_TEXTURE_SIZE = 256;
      const MAX_TEXTURE_SIZE = 4096;
      
      if (width < MIN_TEXTURE_SIZE || height < MIN_TEXTURE_SIZE) {
        console.warn(`[Ground] ⚠️ ${label} texture is very small (${width}x${height}). Minimum: ${MIN_TEXTURE_SIZE}px.`);
      }
      
      if (width > MAX_TEXTURE_SIZE || height > MAX_TEXTURE_SIZE) {
        console.warn(`[Ground] ⚠️ ${label} texture is very large (${width}x${height}). Maximum recommended: ${MAX_TEXTURE_SIZE}px.`);
      }
      
      // Configure texture properly for display
      loadedTex.colorSpace = THREE.SRGBColorSpace;
      loadedTex.wrapS = THREE.RepeatWrapping;
      loadedTex.wrapT = THREE.RepeatWrapping;
      loadedTex.repeat.set(repeat, repeat);
      loadedTex.anisotropy = Math.min(16, material.renderer?.capabilities?.maxAnisotropy || 16);
      loadedTex.magFilter = THREE.LinearFilter;
      loadedTex.minFilter = THREE.LinearMipmapLinearFilter;
      loadedTex.needsUpdate = true;

      if (label === "City") {
        cityMap = loadedTex;
        cityMap.minFilter = THREE.LinearMipmapLinearFilter;
        cityMap.magFilter = THREE.LinearFilter;
      } else if (label === "Inland") {
        inlandMap = loadedTex;
        inlandMap.minFilter = THREE.LinearMipmapLinearFilter;
        inlandMap.magFilter = THREE.LinearFilter;
      } else if (label === "Coastal") {
        coastalMap = loadedTex;
        coastalMap.minFilter = THREE.LinearMipmapLinearFilter;
        coastalMap.magFilter = THREE.LinearFilter;
      }
      
      // Replace placeholder with actual texture
      material.map = loadedTex;
      material.needsUpdate = true;
      
      // Force terrain update
      triggerTerrainUpdate();
      
      console.log(`[Ground] ✅ ${label} texture applied successfully`, {
        hasMap: !!material.map,
        repeat: repeat,
        wrapS: 'RepeatWrapping',
        wrapT: 'RepeatWrapping'
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
      // Keep placeholder texture visible instead of null
      material.needsUpdate = true;
    },
  );
}

// ✅ STEP 2: Determine active preset and fetch configuration
const ACTIVE_PRESET = (() => {
  try {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const fromQuery = params.get("groundPreset");
      if (fromQuery && GROUND_MATERIAL_PRESETS[fromQuery]) return fromQuery;
    }
  } catch {}
  return "default";
})();

const preset = GROUND_MATERIAL_PRESETS[ACTIVE_PRESET] || GROUND_MATERIAL_PRESETS.default;

// ✅ STEP 3: Create CityGroundMaterial as singleton (cached instance)
const CityGroundMaterial = (() => {
  // Use MeshPhongMaterial instead of MeshStandardMaterial - simpler, more reliable for textures
  const material = new THREE.MeshPhongMaterial({
    name: "CityGroundMaterial",
    color: 0xffffff,
    map: null,
    shininess: 30,
    side: THREE.FrontSide,
  });
  
  console.log('[Ground] 🏗️ CityGroundMaterial created:', {
    name: material.name,
    color: material.color.getHexString(),
    type: material.constructor.name,
  });

  // Load texture
  bindGroundTexture(
    material,
    "City",
    CITY_GROUND_URL,
    preset.city.repeat,
  );

  material.needsUpdate = true;
  return material;
})();

export { CityGroundMaterial };

export const InlandGroundMaterial = new THREE.MeshPhongMaterial({
  name: "InlandGroundMaterial",
  color: 0xffffff,
  map: null,
  shininess: 20,
  side: THREE.FrontSide,
});

bindGroundTexture(
  InlandGroundMaterial,
  "Inland",
  INLAND_GROUND_URL,
  preset.inland.repeat,
);
InlandGroundMaterial.needsUpdate = true;

export const CoastalGroundMaterial = new THREE.MeshPhongMaterial({
  name: "CoastalGroundMaterial",
  color: 0xffffff,
  map: null,
  shininess: 20,
  side: THREE.FrontSide,
});

bindGroundTexture(
  CoastalGroundMaterial,
  "Coastal",
  COASTAL_GROUND_URL,
  preset.coastal.repeat,
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

// Diagnostic utility: Validate CityGroundMaterial usage in scene
export function validateCityGroundMaterials(scene) {
  if (!scene) {
    console.warn('[Ground] validateCityGroundMaterials: No scene provided');
    return;
  }

  let totalFound = 0;
  let missingUVs = 0;
  let missingMap = 0;
  const issues = [];

  scene.traverse((obj) => {
    if (obj.isMesh && obj.material) {
      // Handle both single material and material arrays
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      
      materials.forEach((mat, matIdx) => {
        if (mat && mat.name === 'CityGroundMaterial') {
          totalFound++;
          
          const meshName = obj.name || 'unnamed';
          const matLabel = materials.length > 1 ? `[${matIdx}]` : '';
          
          // Check for UVs
          if (!obj.geometry.attributes.uv) {
            missingUVs++;
            const issue = `Mesh "${meshName}"${matLabel} using CityGroundMaterial but missing UVs`;
            console.warn(`[Ground] ⚠️ ${issue}`, obj);
            issues.push({ type: 'missing-uv', mesh: meshName, object: obj });
          }
          
          // Check for texture map
          if (!mat.map) {
            missingMap++;
            const issue = `Mesh "${meshName}"${matLabel} has CityGroundMaterial with NO map`;
            console.warn(`[Ground] ⚠️ ${issue}`, obj);
            issues.push({ type: 'missing-map', mesh: meshName, object: obj });
          }
        }
      });
    }
  });

  const summary = {
    totalMeshes: totalFound,
    missingUVs,
    missingMap,
    allValid: missingUVs === 0 && missingMap === 0,
    issues
  };

  if (totalFound === 0) {
    console.info('[Ground] ℹ️ No meshes found using CityGroundMaterial');
  } else if (summary.allValid) {
    console.log(`[Ground] ✅ All ${totalFound} CityGroundMaterial meshes validated successfully`);
  } else {
    console.warn(`[Ground] ⚠️ Found ${missingUVs} UV issues and ${missingMap} map issues in ${totalFound} meshes`);
  }

  return summary;
}

// Step 6: Confirm all ground textures are restored for City, Inland, and Coastal zones
console.log('[Ground] Ground texture materials initialized:', {
  city: 'CityGroundMaterial (dirt-albedo.jpg)',
  inland: 'InlandGroundMaterial (grass/albedo.jpg)',
  coastal: 'CoastalGroundMaterial (sand/albedo.jpg)',
  debug: 'Call window.groundDiagnostics() to check texture loading'
});

// ============================================
// COMPREHENSIVE DIAGNOSTIC FUNCTION
// ============================================
export function groundDiagnostics() {
  console.log('\n========== GROUND TEXTURE DIAGNOSTICS ==========\n');
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    materials: {},
    urls: {
      city: CITY_GROUND_URL,
      inland: INLAND_GROUND_URL,
      coastal: COASTAL_GROUND_URL,
    },
    textureLoader: {
      type: textureLoader.constructor.name,
    }
  };

  // Check each material
  const materials = [
    { name: 'CityGroundMaterial', material: CityGroundMaterial },
    { name: 'InlandGroundMaterial', material: InlandGroundMaterial },
    { name: 'CoastalGroundMaterial', material: CoastalGroundMaterial },
  ];

  materials.forEach(({ name, material }) => {
    diagnostics.materials[name] = {
      exists: !!material,
      color: material?.color?.getHexString?.(),
      roughness: material?.roughness,
      metalness: material?.metalness,
      hasMap: !!material?.map,
      mapDetails: material?.map ? {
        type: material.map.constructor.name,
        source: material.map.source?.data ? 'DataTexture or ImageTexture' : 'unknown',
        width: material.map.source?.data?.width || material.map.image?.width,
        height: material.map.source?.data?.height || material.map.image?.height,
        wrapS: material.map.wrapS === THREE.RepeatWrapping ? 'RepeatWrapping' : material.map.wrapS,
        wrapT: material.map.wrapT === THREE.RepeatWrapping ? 'RepeatWrapping' : material.map.wrapT,
        repeat: { x: material.map.repeat?.x, y: material.map.repeat?.y },
        colorSpace: material.map.colorSpace,
        needsUpdate: material.map.needsUpdate,
      } : null,
      needsUpdate: material?.needsUpdate,
    };
  });

  console.log('Material State:', diagnostics.materials);
  console.log('Texture URLs:', diagnostics.urls);
  
  // Check texture file accessibility via fetch
  console.log('\nChecking texture file accessibility...');
  Promise.all([
    CITY_GROUND_URL,
    INLAND_GROUND_URL,
    COASTAL_GROUND_URL,
  ].map(url => 
    fetch(url, { method: 'HEAD' })
      .then(res => {
        console.log(`✅ ${url}: ${res.status} ${res.statusText}`);
        return { url, status: res.status };
      })
      .catch(err => {
        console.error(`❌ ${url}: ${err.message}`);
        return { url, error: err.message };
      })
  )).then(results => {
    console.log('\nFetch Results:', results);
  });

  // Check terrain reference
  console.log('\nTerrain Mesh Reference:', {
    exists: !!terrainMeshReference,
    hasGeometry: !!terrainMeshReference?.geometry,
    hasMaterial: !!terrainMeshReference?.material,
    isArray: Array.isArray(terrainMeshReference?.material),
    materialCount: Array.isArray(terrainMeshReference?.material) ? terrainMeshReference.material.length : 1,
  });

  // Check if geometry has UVs
  if (terrainMeshReference?.geometry?.attributes?.uv) {
    const uv = terrainMeshReference.geometry.attributes.uv;
    console.log('\nGeometry UVs:', {
      hasUV: true,
      itemSize: uv.itemSize,
      count: uv.count,
      array: uv.array.slice(0, 20), // First 20 values
    });
  } else {
    console.warn('\n⚠️ Geometry has NO UVs! This is the problem!');
  }

  console.log('\n========== END DIAGNOSTICS ==========\n');
  
  return diagnostics;
}

// Expose to window for easy access in browser console
if (typeof window !== 'undefined') {
  window.groundDiagnostics = groundDiagnostics;
  console.log('[Ground] Diagnostic function available: window.groundDiagnostics()');
}
