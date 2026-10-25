// Apply shared, metre-scaled textures to the authored street/court surfaces.
import * as THREE from "three";
import { MATERIALS } from "../materials/materialRegistry.js";
import { resolveBaseUrl, joinPath } from "../utils/baseUrl.js";

export async function applyGravelToRoads({ scene } = {}) {
  if (!scene) return;
  const surfaces = [];
  scene.traverse(o => {
    if (o.isMesh && o.userData.groundSurface && !o.material?.userData?.__isGravel) surfaces.push(o);
  });
  if (!surfaces.length) return;
  const loader = new THREE.TextureLoader();
  const load = async url => {
    try {
      const map = await loader.loadAsync(url);
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = 8;
      return map;
    } catch (error) {
      console.warn('[roads] Using untextured ground fallback:', url, error);
      return null;
    }
  };
  const [stone, dirt] = await Promise.all([
    load(joinPath(resolveBaseUrl(), 'textures/stone_rough.jpg')),
    load(MATERIALS.dirt.albedo),
  ]);
  const materials = new Map();
  for (const mesh of surfaces) {
    const paved = mesh.userData.groundSurface === 'court' || mesh.userData.roadType === 'artery';
    const color = mesh.userData.groundSurface === 'court' ? mesh.material.color.getHex() : paved ? 0xe0d4bd : 0xd2bd9d;
    const key = `${paved}:${color}`;
    if (!materials.has(key)) {
      const material = new THREE.MeshStandardMaterial({
        name: paved ? 'WornStonePaving' : 'PackedEarthLane',
        color, map: paved ? stone : dirt, roughness: 0.96, metalness: 0,
        vertexColors: true, transparent: true, depthWrite: false,
        polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
      });
      material.userData.__isGravel = true;
      materials.set(key, material);
    }
    const previous = mesh.material;
    mesh.material = materials.get(key);
    previous.dispose();
    mesh.receiveShadow = true;
  }
  console.info('[roads] Shared stone paving and packed-earth lane textures applied.');
}
