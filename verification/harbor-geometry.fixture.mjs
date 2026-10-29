import * as THREE from 'three';
import {createHarbor} from '../src/world/harbor.js';
import {EnvironmentCollider} from '../src/env/EnvironmentCollider.js';
import {getSeaLevelY,setSeaLevelY} from '../src/world/locations.js';

export function createHarborGeometryFixture(seed=123456) {
  const previous={document:globalThis.document,load:THREE.TextureLoader.prototype.load,random:Math.random,sea:getSeaLevelY()};
  const context=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),measureText:text=>({width:String(text).length*8})},{get:(target,key)=>key in target?target[key]:()=>{}});
  globalThis.document={createElement:()=>({width:256,height:256,getContext:()=>context})};
  THREE.TextureLoader.prototype.load=function(url,onLoad){const texture=new THREE.Texture();queueMicrotask(()=>onLoad?.(texture));return texture;};
  let value=seed;Math.random=()=>((value=(value*1664525+1013904223)>>>0)/4294967296);setSeaLevelY(-1);
  try{
    const scene=new THREE.Scene(),harbor=createHarbor(scene),collider=new EnvironmentCollider();collider.fromStaticScene(scene);
    const ray=new THREE.Raycaster();ray.firstHitOnly=true;
    const markerAt=(x,z)=>{ray.set(new THREE.Vector3(x,25,z),new THREE.Vector3(0,-1,0));const hit=ray.intersectObject(collider.mesh)[0];if(!hit)throw Error('Missing marker support');return new THREE.Vector3(x,hit.point.y,z);};
    const merchant=harbor.getObjectByName('HarborHeroShip'),trireme=harbor.getObjectByName('HarborTrireme');
    const cargo=merchant.localToWorld(new THREE.Vector3(-5,0,-5.2)),naval=trireme.localToWorld(new THREE.Vector3(-4,0,-6));
    return {scene,harbor,collider,markerAt,markers:{board:markerAt(12,12.5),merchant:markerAt(cargo.x,cargo.z),trireme:markerAt(naval.x,naval.z)}};
  }finally{globalThis.document=previous.document;THREE.TextureLoader.prototype.load=previous.load;Math.random=previous.random;setSeaLevelY(previous.sea);}
}
