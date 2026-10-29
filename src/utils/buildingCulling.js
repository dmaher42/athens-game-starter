import * as THREE from 'three';

const cameraWorldPosition = new THREE.Vector3();
const worldBounds = new THREE.Sphere();
const buildingMeshCache = new WeakMap();

export function isBuildingMesh(object) {
  if (!object?.isMesh) return false;
  const name = (object.name || '').toLowerCase();
  return object.userData?.isCityBatch === true ||
    name.startsWith('mergedbatch_') || name.includes('building') ||
    name.includes('house') || name.includes('structure');
}

function getBuildingMeshes(scene) {
  const revision = scene.userData?.cityBatchRevision || 0;
  const cached = buildingMeshCache.get(scene);
  if (cached?.revision === revision) return cached.meshes;
  const meshes = [];
  scene.traverse(child => { if (isBuildingMesh(child)) meshes.push(child); });
  buildingMeshCache.set(scene, { revision, meshes });
  return meshes;
}

export function cullDistantBuildings(scene, camera, maxDistance = 300) {
  if (!scene || !camera) return;
  camera.getWorldPosition(cameraWorldPosition);
  for (const child of getBuildingMeshes(scene)) {
    if (!child.parent || !child.geometry) continue;
    if (!child.geometry.boundingSphere) child.geometry.computeBoundingSphere();
    if (!child.geometry.boundingSphere) continue;
    child.updateWorldMatrix(true, false);
    worldBounds.copy(child.geometry.boundingSphere).applyMatrix4(child.matrixWorld);
    // Hide only if the entire bound lies beyond the distance limit. In
    // particular, a merged city mesh's origin need not be near its geometry.
    // City-wide batches can contain skyline landmarks. Keep their original
    // camera far-plane range rather than applying the short individual-house
    // distance cutoff to the whole city. Spatial subdivision needs profiling.
    const isBatch = child.userData?.isCityBatch === true ||
      child.name.toLowerCase().startsWith('mergedbatch_');
    const distanceLimit = isBatch ? Math.max(maxDistance, camera.far || maxDistance) : maxDistance;
    child.visible = worldBounds.distanceToPoint(cameraWorldPosition) <= distanceLimit;
    // Leave per-camera frustum visibility to THREE's render-time culling.
  }
}
