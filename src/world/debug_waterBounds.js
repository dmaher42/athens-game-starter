import * as THREE from 'three';
import { isDebugRenderEnabled } from "../config/debugFlags.js";

export function mountWaterBoundsDebug(scene, center, size){
  if (!isDebugRenderEnabled()) return;
  const box = new THREE.Box3(
    new THREE.Vector3(center.x - size.x/2, center.y, center.z - size.y/2),
    new THREE.Vector3(center.x + size.x/2, center.y, center.z + size.y/2)
  );
  const helper = new THREE.Box3Helper(box, 0x00ff99);
  helper.name = 'WaterBoundsDebug';
  scene.add(helper);
  return helper;
}
