import * as THREE from "three";

/** Ensure terrain.userData.getHeightAt(x,z) exists. */
export function attachHeightSampler(terrain) {
  if (!terrain) return;
  const existing = terrain?.userData?.getHeightAt;
  if (typeof existing === "function") {
    const test = existing(0, 0);
    if (Number.isFinite(test)) return;
  }
  const raycaster = new THREE.Raycaster();
  raycaster.firstHitOnly = true;
  const targets = [terrain];
  const UP = 200;
  const DOWN = -400;

  function getHeightAt(x, z) {
    raycaster.set(new THREE.Vector3(x, UP, z), new THREE.Vector3(0, -1, 0));
    const hit = raycaster.intersectObjects(targets, true)[0];
    if (hit) return hit.point.y;
    raycaster.set(new THREE.Vector3(x, DOWN, z), new THREE.Vector3(0, 1, 0));
    const hit2 = raycaster.intersectObjects(targets, true)[0];
    return hit2 ? hit2.point.y : 0;
  }

  terrain.userData = terrain.userData || {};
  terrain.userData.getHeightAt = getHeightAt;
}
