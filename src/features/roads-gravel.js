// Apply shared, metre-scaled textures to the authored street/court surfaces.
import * as THREE from "three";
import {getStreetSurfaceTexture} from "../materials/streetSurfaceTextures.js";
import {resolveBaseUrl,joinPath} from "../utils/baseUrl.js";
let earthTexturePromise;
function getEarthTexture(){earthTexturePromise??=new THREE.TextureLoader().loadAsync(joinPath(resolveBaseUrl(),"textures/ground/dirt-albedo.jpg")).then(map=>{map.wrapS=map.wrapT=THREE.RepeatWrapping;map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;return map;}).catch(()=>getStreetSurfaceTexture(false));return earthTexturePromise;}

// Walkable architecture also has groundSurface metadata for collision support.
// Only authored road ribbons and court overlays belong to this material pass.
export function isRoadSurface(mesh) {
  return mesh?.userData?.groundSurface === 'street' || mesh?.userData?.groundSurface === 'court';
}

export async function applyGravelToRoads({ scene } = {}) {
  if (!scene) return;
  const surfaces = [];
  scene.traverse(o => {
    if (o.isMesh && isRoadSurface(o) && !o.material?.userData?.__isGravel) surfaces.push(o);
  });
  if (!surfaces.length) return;
  const stone=getStreetSurfaceTexture(true),dirt=await getEarthTexture();
  const materials = new Map();
  for (const mesh of surfaces) {
    const paved = mesh.userData.roadType === 'artery' || mesh.name === 'NeighbourhoodCourt-traders';
    const color = paved ? 0xe7e1d4 : 0xd6d0c2;
    const key = `${paved}:${color}`;
    if (!materials.has(key)) {
      const material = new THREE.MeshStandardMaterial({
        name: paved ? 'WornStonePaving' : 'PackedEarthLane',
        color, map: paved ? stone : dirt, roughness: 0.96, metalness: 0,
        vertexColors: true, transparent: true, depthWrite: false,
        polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
      });
      if(!paved){material.onBeforeCompile=(shader,renderer)=>{THREE.MeshStandardMaterial.prototype.onBeforeCompile.call(material,shader,renderer);shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
 float soilValue=dot(diffuseColor.rgb,vec3(.299,.587,.114));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(soilValue)*vec3(1.05,1.015,.93),.78);`);};material.customProgramCacheKey=()=>THREE.MeshStandardMaterial.prototype.customProgramCacheKey.call(material)+'|quiet-packed-earth-v1';}
      material.userData.__isGravel = true;
      materials.set(key, material);
    }
    mesh.material = materials.get(key);
    // Source materials may still be shared by architecture or other surfaces.
    mesh.receiveShadow = true;
  }
  console.info('[roads] Shared stone paving and packed-earth lane textures applied.');
}
