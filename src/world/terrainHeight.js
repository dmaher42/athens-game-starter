import * as THREE from 'three';

/**
 * Ensures terrain.userData.getHeightAt(x,z) exists.
 * Uses raycast from above if no native sampler is provided.
 */
export function attachHeightSampler(terrain, scene) {
  if (!terrain) return;

  // If a sampler already exists and returns a number, keep it
  const existing = terrain?.userData?.getHeightAt;
  if (existing && Number.isFinite(existing(0,0))) return;

  const raycaster = new THREE.Raycaster();
  raycaster.firstHitOnly = true;

  const targets = [terrain]; // you can add other ground meshes here if needed
  const UP = 200, DOWN = -400;

  function getHeightAt(x, z) {
    // Cast from high above downwards
    const origin = new THREE.Vector3(x, UP, z);
    const dir = new THREE.Vector3(0, -1, 0);
    raycaster.set(origin, dir);
    const hit = raycaster.intersectObjects(targets, true)[0];
    if (hit) return hit.point.y;
    // Fallback: try upwards (for cases when cast started below)
    const origin2 = new THREE.Vector3(x, DOWN, z);
    const dir2 = new THREE.Vector3(0, 1, 0);
    raycaster.set(origin2, dir2);
    const hit2 = raycaster.intersectObjects(targets, true)[0];
    return hit2 ? hit2.point.y : 0; // safe default
  }

  terrain.userData = terrain.userData || {};
  terrain.userData.getHeightAt = getHeightAt;
}
