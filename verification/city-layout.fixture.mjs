import * as THREE from 'three';
import fs from 'node:fs/promises';
export async function createLayoutFixture(){
 const previous={document:globalThis.document,fetch:globalThis.fetch,load:THREE.TextureLoader.prototype.load};
 const context=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),measureText:text=>({width:String(text).length*8})},{get:(target,key)=>key in target?target[key]:()=>{}});
 globalThis.document={createElement:()=>({width:256,height:256,getContext:()=>context})};
 const rules=JSON.parse(await fs.readFile(new URL('../public/config/districts.json',import.meta.url),'utf8'));
 globalThis.fetch=async()=>({ok:true,json:async()=>rules});
 THREE.TextureLoader.prototype.load=function(url,onLoad){const texture=new THREE.Texture();queueMicrotask(()=>onLoad?.(texture));return texture;};
 try{
  const {createCivicDistrict}=await import('../src/world/cityPlan.js');
  const scene=new THREE.Scene(),sampler=()=>4;
  const city=await createCivicDistrict(scene,{heightSampler:sampler});
  await new Promise(resolve=>setTimeout(resolve,150));
  let triangles=0,meshes=0,lights=0;city.group.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}if(o.isLight)lights++;});
  return {scene,city,sampler,stats:{triangles,meshes,lights,buildingLots:city.group.userData.plan.grid.filter(c=>c.type==='building'&&c.buildable).length,streetFrontages:city.group.userData.plan.neighbourhoodStreetFrontages}};
 }finally{globalThis.document=previous.document;globalThis.fetch=previous.fetch;THREE.TextureLoader.prototype.load=previous.load;}
}
