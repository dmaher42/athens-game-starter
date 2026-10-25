import * as THREE from "three";
import { getSeaLevelY } from "./locations.js";

/** Ensure terrain.userData.getHeightAt(x,z) exists. */
let activeHeightSampler = null;

/** Sample the same two triangles rendered by an unmodified PlaneGeometry grid.
 * Heights come from the geometry itself, including later vertex edits.
 * @param {THREE.Mesh} terrain
 */
export function createTerrainGridSampler(terrain) {
  const geometry = terrain?.geometry;
  const { width, height, widthSegments, heightSegments } = geometry?.parameters ?? {};
  const positions = geometry?.getAttribute('position');
  if (!positions || !(width > 0 && height > 0 && widthSegments > 0 && heightSegments > 0)) return null;
  const point = new THREE.Vector3();
  const stride = widthSegments + 1;
  return (worldX, worldZ) => {
    if (!Number.isFinite(worldX) || !Number.isFinite(worldZ)) return null;
    point.set(worldX, 0, worldZ);
    terrain.worldToLocal(point);
    const gx = (point.x / width + 0.5) * widthSegments;
    const gz = (0.5 - point.y / height) * heightSegments;
    const epsilon = 1e-7;
    if (gx < -epsilon || gx > widthSegments + epsilon || gz < -epsilon || gz > heightSegments + epsilon) return null;
    const x = THREE.MathUtils.clamp(gx, 0, widthSegments);
    const z = THREE.MathUtils.clamp(gz, 0, heightSegments);
    const ix = Math.min(Math.floor(x), widthSegments - 1);
    const iz = Math.min(Math.floor(z), heightSegments - 1);
    const fx = x - ix, fz = z - iz;
    const a = positions.getZ(iz * stride + ix);
    const b = positions.getZ(iz * stride + ix + 1);
    const c = positions.getZ((iz + 1) * stride + ix);
    const d = positions.getZ((iz + 1) * stride + ix + 1);
    const localHeight = fx + fz <= 1
      ? a + (b - a) * fx + (c - a) * fz
      : d + (c - d) * (1 - fx) + (b - d) * (1 - fz);
    if (!Number.isFinite(localHeight)) return null;
    point.z = localHeight;
    const worldHeight = point.applyMatrix4(terrain.matrixWorld).y;
    // cos(PI/2) is not exactly zero. Discard sub-nanometre transform noise so
    // flat sea-level land does not unexpectedly pass above-water prop rules.
    return Math.round(worldHeight * 1e9) / 1e9;
  };
}

export function attachHeightSampler(terrain) {
  if (!terrain) return;
  const existing = terrain?.userData?.getHeightAt;
  if (typeof existing === "function") {
    const test = existing(0, 0);
    if (Number.isFinite(test)) {
      activeHeightSampler = existing;
      return;
    }
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
  activeHeightSampler = terrain.userData.getHeightAt;
}

export function probeAt(x, z) {
  const sampler = activeHeightSampler;
  const yTerrain = typeof sampler === "function" ? sampler(x, z) : NaN;
  const ySea = getSeaLevelY();
  return {
    yTerrain,
    ySea,
    isSubmerged: yTerrain < ySea,
  };
}
