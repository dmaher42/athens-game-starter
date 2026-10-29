import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { isSmallProp } from './propCulling.js';
import { isBuildingMesh } from './buildingCulling.js';

const states = new WeakMap();

/** Batch an immutable, fully placed static subtree without changing its authoring
 * meshes. Original nodes remain visible to geometry/collision audits, but have
 * no render layers. The render-only copies share the exact materials and shadow
 * policy and are excluded from physical collision extraction. Moving individual
 * source meshes requires restoring/rebuilding the batches first. */
export function batchStaticMeshes(root) {
  if (!root) return null;
  if (states.has(root)) return states.get(root);
  root.updateWorldMatrix(true, true);
  const inverse = root.matrixWorld.clone().invert();
  const groups = new Map();
  root.traverse(mesh => {
    if (!mesh.isMesh || mesh.isInstancedMesh || mesh.isSkinnedMesh || !mesh.geometry) return;
    // Preserve the existing per-object cullers as the sole visibility owners.
    if (isSmallProp(mesh) || isBuildingMesh(mesh)) return;
    const material = mesh.material, geometry = mesh.geometry;
    if (!material || Array.isArray(material) || material.transparent || !material.visible) return;
    if (mesh.layers.mask !== 1 || mesh.frustumCulled === false || mesh.customDepthMaterial || mesh.customDistanceMaterial) return;
    if (mesh.onBeforeRender !== THREE.Object3D.prototype.onBeforeRender || mesh.onAfterRender !== THREE.Object3D.prototype.onAfterRender) return;
    if (mesh.onBeforeShadow !== THREE.Object3D.prototype.onBeforeShadow || mesh.onAfterShadow !== THREE.Object3D.prototype.onAfterShadow) return;
    if (Object.keys(geometry.morphAttributes).length || mesh.matrixWorld.determinant() <= 0) return;
    if (geometry.drawRange.start !== 0 || geometry.drawRange.count < (geometry.index?.count ?? geometry.attributes.position?.count ?? 0)) return;
    const attributes = Object.keys(geometry.attributes).sort();
    if (!attributes.includes('position') || attributes.some(a => geometry.attributes[a].isInterleavedBufferAttribute)) return;
    for (let parent = mesh; parent; parent = parent.parent) if (!parent.visible || parent.userData?.interactable) return;
    const format = attributes.map(a => {
      const value = geometry.attributes[a];
      return `${a}:${value.array.constructor.name}:${value.itemSize}:${value.normalized}`;
    }).join(',');
    const key = `${material.uuid}|${mesh.castShadow}|${mesh.receiveShadow}|${mesh.renderOrder}|${format}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(mesh);
  });
  const renderRoot = new THREE.Group();
  renderRoot.name = 'StaticHarborRenderBatches';
  renderRoot.userData.noCollision = true;
  const sources = [], batches = [];
  for (const meshes of groups.values()) {
    if (meshes.length < 2) continue;
    const geometries = meshes.map(mesh => {
      const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
      return geometry.applyMatrix4(inverse.clone().multiply(mesh.matrixWorld));
    });
    let merged;
    try { merged = mergeGeometries(geometries, false); }
    catch (error) { console.warn('[StaticRenderBatches] Keeping an unbatched material group.', error); continue; }
    finally { geometries.forEach(geometry => geometry.dispose()); }
    if (!merged) continue;
    merged.computeBoundingSphere();
    const first = meshes[0], batch = new THREE.Mesh(merged, first.material);
    batch.name = 'StaticHarborRenderBatch';
    batch.userData.noCull = true;
    batch.castShadow = first.castShadow; batch.receiveShadow = first.receiveShadow;
    batch.renderOrder = first.renderOrder;
    renderRoot.add(batch); batches.push(batch);
    for (const mesh of meshes) { sources.push({mesh, layers:mesh.layers.mask}); mesh.layers.mask = 0; }
  }
  if (batches.length) root.add(renderRoot);
  const state = {
    sources: sources.length, batches: batches.length,
    restore() {
      if (states.get(root) !== state) return;
      for (const {mesh,layers} of sources) mesh.layers.mask = layers;
      root.remove(renderRoot);
      for (const batch of batches) batch.geometry.dispose();
      states.delete(root);
    },
  };
  states.set(root, state);
  return state;
}