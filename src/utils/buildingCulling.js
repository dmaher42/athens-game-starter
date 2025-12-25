import * as THREE from "three";

/**
 * Building visibility culling and LOD system for performance
 * Culls buildings beyond 400m or below horizon, adds LOD for dense areas
 */

const CULL_DISTANCE = 400; // meters
const LOD_DISTANCE_NEAR = 120; // Full detail
const LOD_DISTANCE_MID = 220;  // Reduced detail
const LOD_DISTANCE_FAR = 320;  // Minimal detail
const HORIZON_CHECK_ENABLED = true;
const FADE_DISTANCE = 120; // distance at which buildings fade/hide

/**
 * Enable frustum culling on all building meshes
 */
export function enableFrustumCulling(scene) {
  let count = 0;
  scene.traverse((obj) => {
    if (obj.isMesh) {
      obj.frustumCulled = true;
      count++;
    }
  });
  console.log(`[BuildingCulling] Enabled frustum culling on ${count} meshes`);
  return count;
}

/**
 * Check if object is below horizon line relative to camera
 */
function isBelowHorizon(objectPos, cameraPos, cameraDir) {
  if (!HORIZON_CHECK_ENABLED) return false;
  
  // Vector from camera to object
  const toObject = new THREE.Vector3().subVectors(objectPos, cameraPos);
  
  // If object is behind camera, consider it below horizon
  if (toObject.dot(cameraDir) < 0) return true;
  
  // Check if object is significantly below camera and far away
  const distance = toObject.length();
  const heightDiff = objectPos.y - cameraPos.y;
  
  // Object is below horizon if it's far and significantly lower
  return distance > 200 && heightDiff < -20;
}

/**
 * Calculate LOD level based on distance
 */
function calculateLODLevel(distance) {
  if (distance < LOD_DISTANCE_NEAR) return 0; // Full detail
  if (distance < LOD_DISTANCE_MID) return 1;  // Medium detail
  if (distance < LOD_DISTANCE_FAR) return 2;  // Low detail
  return 3; // Minimal or culled
}

/**
 * Update building visibility based on distance and horizon
 */
export function updateBuildingCulling(scene, camera, options = {}) {
  const cullDistance = options.cullDistance || CULL_DISTANCE;
  const enableHorizon = options.enableHorizon !== false;
  
  const cameraPos = camera.getWorldPosition(new THREE.Vector3());
  const cameraDir = new THREE.Vector3();
  camera.getWorldDirection(cameraDir);
  
  let culledCount = 0;
  let visibleCount = 0;
  
  // Find building groups
  const buildingGroups = [];
  scene.traverse((obj) => {
    if (obj.isGroup && (
      obj.name.includes('Building') || 
      obj.name.includes('City') ||
      obj.name.includes('District')
    )) {
      buildingGroups.push(obj);
    }
  });
  
  buildingGroups.forEach((group) => {
    group.traverse((obj) => {
      if (!obj.isMesh) return;
      if (obj.userData.noCull) return; // Skip protected meshes
      
      const worldPos = obj.getWorldPosition(new THREE.Vector3());
      const distance = worldPos.distanceTo(cameraPos);
      // Quick fade/hide for near-far balance: hide building meshes beyond FADE_DISTANCE
      // Apply only to regular building objects (marked via userData.isBuilding)
      if (obj.userData?.isBuilding && distance > FADE_DISTANCE) {
        obj.visible = false;
        culledCount++;
        return;
      }
      
      // Distance culling
      if (distance > cullDistance) {
        obj.visible = false;
        culledCount++;
        return;
      }
      
      // Horizon culling
      if (enableHorizon && isBelowHorizon(worldPos, cameraPos, cameraDir)) {
        obj.visible = false;
        culledCount++;
        return;
      }
      
      // LOD handling (store level for potential future use)
      const lodLevel = calculateLODLevel(distance);
      obj.userData.lodLevel = lodLevel;
      
      // For now, just make very distant buildings less detailed via opacity/visibility
      if (lodLevel === 3) {
        obj.visible = false;
        culledCount++;
      } else {
        obj.visible = true;
        visibleCount++;
      }
    });
  });
  
  return { culled: culledCount, visible: visibleCount };
}

/**
 * Create simplified LOD versions of buildings for dense areas
 */
export function createBuildingLOD(originalMesh, lodLevel = 1) {
  if (!originalMesh || !originalMesh.geometry) return null;
  
  // Clone geometry for LOD
  const lodGeometry = originalMesh.geometry.clone();
  
  // Simplification based on LOD level
  if (lodLevel === 1) {
    // Medium detail - reduce by ~30%
    // (In production, use mesh simplification library)
    lodGeometry.scale(1.0, 1.0, 1.0); // Placeholder
  } else if (lodLevel === 2) {
    // Low detail - reduce by ~60%
    lodGeometry.scale(1.0, 1.0, 1.0); // Placeholder
  }
  
  // Create LOD mesh with same material
  const lodMesh = new THREE.Mesh(lodGeometry, originalMesh.material);
  lodMesh.castShadow = false; // Disable shadows for LOD
  lodMesh.receiveShadow = originalMesh.receiveShadow;
  lodMesh.frustumCulled = true;
  
  return lodMesh;
}

/**
 * Setup LOD system for a building group
 */
export function setupBuildingLODs(buildingGroup) {
  const buildings = [];
  
  buildingGroup.traverse((obj) => {
    if (obj.isMesh && obj.name.includes('Building')) {
      buildings.push(obj);
    }
  });
  
  console.log(`[BuildingCulling] Setting up LODs for ${buildings.length} buildings`);
  
  buildings.forEach((building) => {
    // Create LOD object
    const lod = new THREE.LOD();
    lod.position.copy(building.position);
    lod.rotation.copy(building.rotation);
    lod.scale.copy(building.scale);
    
    // Add detail levels
    lod.addLevel(building, 0); // Full detail at distance 0
    
    // Create medium detail version
    const mediumLOD = createBuildingLOD(building, 1);
    if (mediumLOD) {
      lod.addLevel(mediumLOD, LOD_DISTANCE_NEAR);
    }
    
    // Create low detail version
    const lowLOD = createBuildingLOD(building, 2);
    if (lowLOD) {
      lod.addLevel(lowLOD, LOD_DISTANCE_MID);
    }
    
    // Replace building with LOD in parent
    if (building.parent) {
      building.parent.add(lod);
      building.parent.remove(building);
    }
  });
}

/**
 * Initialize building culling system
 */
export function initBuildingCulling(scene, camera, options = {}) {
  console.log('[BuildingCulling] Initializing building culling system...');
  
  // Enable frustum culling on all meshes
  enableFrustumCulling(scene);
  
  // Setup LODs if requested
  if (options.enableLOD) {
    const cityGroups = [];
    scene.traverse((obj) => {
      if (obj.isGroup && obj.name.includes('City')) {
        cityGroups.push(obj);
      }
    });
    
    cityGroups.forEach(group => setupBuildingLODs(group));
    console.log(`[BuildingCulling] LOD setup complete for ${cityGroups.length} city groups`);
  }
  
  // Run initial culling pass
  const result = updateBuildingCulling(scene, camera, options);
  
  console.log(`[BuildingCulling] Initial culling: ${result.culled} culled, ${result.visible} visible`);
  
  return result;
}

/**
 * Mark important buildings that should never be culled
 */
export function protectLandmarks(scene) {
  const landmarks = [
    'Parthenon',
    'Temple',
    'Monument',
    'Athena',
    'Zeus',
    'Theater',
    'Acropolis'
  ];
  
  let protectedCount = 0;
  scene.traverse((obj) => {
    if (obj.isMesh) {
      const name = obj.name || '';
      if (landmarks.some(landmark => name.includes(landmark))) {
        obj.userData.noCull = true;
        protectedCount++;
      }
    }
  });
  
  console.log(`[BuildingCulling] Protected ${protectedCount} landmark meshes from culling`);
  return protectedCount;
}
