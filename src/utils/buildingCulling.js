// src/utils/buildingCulling.js

import * as THREE from 'three';

/**
 * Main culling function
 * @param {THREE.Scene} scene
 * @param {THREE.Camera} camera
 * @param {number} maxDistance
 */
export function cullDistantBuildings(scene, camera, maxDistance = 300) {
  // Standard distance culling for generic buildings
  const frustum = new THREE.Frustum();
  const projScreenMatrix = new THREE.Matrix4();
  
  projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(projScreenMatrix);

  scene.traverse((child) => {
    if (!child.isMesh) return;

    // Check if it's a building
    const name = (child.name || "").toLowerCase();
    if (name.includes("building") || name.includes("house") || name.includes("structure")) {
      const dist = child.position.distanceTo(camera.position);
      if (dist > maxDistance) {
        child.visible = false;
      } else {
        // Only show if in frustum
        child.visible = frustum.intersectsObject(child);
      }
    }
  });
}
