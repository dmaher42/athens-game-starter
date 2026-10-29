import * as THREE from 'three';
import {Prefabs} from './buildingSpawner.js';
const clay=new THREE.MeshStandardMaterial({color:0xb86f49,roughness:1}),cream=new THREE.MeshStandardMaterial({color:0xd2ab6e,roughness:1}),olive=new THREE.MeshStandardMaterial({color:0x596338,roughness:1}),wicker=new THREE.MeshStandardMaterial({color:0x96744a,roughness:1});
const pot=new THREE.LatheGeometry([[0,0],[.12,.04],[.24,.2],[.26,.5],[.16,.68],[.08,.72],[.09,.88],[.13,.92]].map(p=>new THREE.Vector2(...p)),10);
const bowl=new THREE.LatheGeometry([[0,0],[.12,.02],[.22,.13],[.25,.2]].map(p=>new THREE.Vector2(...p)),10);
const handle=new THREE.TorusGeometry(.12,.025,3,8),bread=new THREE.SphereGeometry(1,8,4),fruit=new THREE.SphereGeometry(.055,6,3),basket=new THREE.CylinderGeometry(.32,.25,.18,10,1,true),rim=new THREE.TorusGeometry(.32,.025,3,10);
function put(root,geometry,material,position,scale=1){const mesh=new THREE.Mesh(geometry,material);mesh.position.set(...position);mesh.scale.setScalar(scale);mesh.castShadow=false;mesh.receiveShadow=true;mesh.userData.noCull=true;root.add(mesh);return mesh;}
export function decorateAgoraPocket(frontage,kind){
 const root=new THREE.Group();root.name='AgoraLife_'+kind;frontage.add(root);
 const goods=new THREE.Group();goods.name='AgoraGoods';goods.userData.noCollision=true;root.add(goods);
 const timber=new THREE.MeshStandardMaterial({color:0x886344,roughness:1});
 const counters=frontage.children.filter(o=>o.name==='StoaCounter');
 if(kind==='shade'){
   for(const x of [-3,0]){const bench=Prefabs.stoneBench({w:2.2,rng:()=>.45});bench.position.set(x,0,.9);bench.traverse(o=>{if(o.isMesh)o.castShadow=false;});root.add(bench);}
   const b=put(goods,basket,wicker,[3,.12,.5]);put(goods,rim,wicker,[3,.21,.5]).rotation.x=Math.PI/2;
   put(goods,pot,clay,[3.5,0,.5],.6);
   return {root,station:new THREE.Vector3(-1.6,0,1.9)};
 }
 for(const [index,counter]of counters.slice(1,3).entries()){
   const x=counter.position.x,z=counter.position.z,top=.895;
   put(goods,new THREE.BoxGeometry(2.4,.045,.68),timber,[x,.8725,z]);
   if(kind==='pottery'){
     for(let j=0;j<2;j++){const px=x-.55+j*.85;put(goods,pot,clay,[px,top,z-.07],.65+j*.12);for(const side of [-1,1]){const h=put(goods,handle,clay,[px+side*.16,top+.4,z-.07],.7);h.rotation.y=Math.PI/2;}}
     for(let j=0;j<2;j++)put(goods,bowl,clay,[x-.45+j*.8,top,z+.22],.8);
   }else{
     if(index===0){for(let j=0;j<8;j++){const loaf=put(goods,bread,cream,[x-.75+(j%4)*.48,top+.09,z-.17+Math.floor(j/4)*.3]);loaf.scale.set(.22,.09,.13);}}
     else{put(goods,basket,wicker,[x,top+.09,z]);put(goods,rim,wicker,[x,top+.18,z]).rotation.x=Math.PI/2;for(let j=0;j<12;j++){const a=j*2.4,r=.05+(j%3)*.07;put(goods,fruit,olive,[x+Math.cos(a)*r,top+.16+(j%2)*.03,z+Math.sin(a)*r]);}put(goods,bowl,cream,[x-.7,top,z],.8);}
   }
 }
 for(const x of [-6,5.5])put(goods,pot,clay,[x,0,1.1],1.1);
 return {root,station:new THREE.Vector3(counters[1].position.x,0,counters[1].position.z-.9)};
}



// A delivery changes these small shared-resource groups, never the court floor
// or its walking surfaces. The activity owns visibility and reward state.
export function createAgoraGathering(choice){
 const root=new THREE.Group();root.name='Gathering_'+choice;root.userData.noCollision=true;
 if(choice==='meal'){
   for(let j=0;j<5;j++){const loaf=put(root,bread,cream,[-3.65+j*.32,.64,.9]);loaf.scale.set(.19,.09,.12);}
   put(root,bowl,clay,[-2.55,.55,.9],1.0);
   for(let j=0;j<8;j++)put(root,fruit,olive,[-2.55+Math.cos(j*2.4)*.13,.72,.9+Math.sin(j*2.4)*.13]);
 }else{
   put(root,pot,clay,[-3.4,.55,.9],.8);
   for(let j=0;j<4;j++)put(root,bowl,cream,[-2.9+j*.3,.55,.9],.55);
 }
 return root;
}
