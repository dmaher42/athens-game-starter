import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ACROPOLIS,isAcropolisReserved} from '../src/world/acropolisLayout.js';
import {CITY_STREETS,NEIGHBOURHOOD_STREETS,AGORA_FRONTAGES,AGORA_LIFE_POCKETS} from '../src/world/neighbourhoodLayout.js';
import {EnvironmentCollider} from '../src/env/EnvironmentCollider.js';
import {PlayerController} from '../src/controls/PlayerController.js';

test('sanctuary layout preserves identities and one shared food frontage',()=>{
 assert.equal(CITY_STREETS.length,19);assert.equal(new Set(CITY_STREETS.map(s=>s.id)).size,19);assert.equal(NEIGHBOURHOOD_STREETS.length,7);
 assert.equal(ACROPOLIS.id,'sacred-temple');assert.deepEqual(ACROPOLIS.visit,[-24,-16.8]);
 assert.deepEqual(ACROPOLIS.temple,{width:20,depth:45,columnHeight:10.2,rotation:Math.PI/2,colX:8,colZ:17});
 assert.equal(AGORA_LIFE_POCKETS.find(p=>p.kind==='food').frontage,4);assert.deepEqual([AGORA_FRONTAGES[4].x,AGORA_FRONTAGES[4].z],[-11,3]);
 for(const[x,z]of[[-35,-6],[-76,-40],[-81.4,-25],[-94,-25]])assert.ok(isAcropolisReserved(x,z));
});

test('supplied Blender files retain their checked source hashes',()=>{
 for(const[path,hash]of[['propylaia-v1.glb','055d145dce58771b7bd0c37a04b1ba384f5be7df6c82c899821516ff87709859'],['propylaia-collision-v1.glb','8a40266ffecac970640a549d94e4700636178e83dcb3dade725a54beb45efa5d']]){
  const bytes=fs.readFileSync(new URL('../public/models/landmarks/acropolis/'+path,import.meta.url));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),hash);
 }
});

test('gateway collision proxy supports the actual controller in both directions',async()=>{
 const bytes=fs.readFileSync(new URL('../public/models/landmarks/acropolis/propylaia-collision-v1.glb',import.meta.url));
 const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const scene=new THREE.Scene();gltf.scene.scale.setScalar(ACROPOLIS.gatewayAsset.scale);scene.add(gltf.scene);
 for(const[x,y,w]of[[-4.5,-.1,6],[15.5,1.46,4.5]]){const floor=new THREE.Mesh(new THREE.BoxGeometry(w,.2,3),new THREE.MeshBasicMaterial());floor.position.set(x,y,0);scene.add(floor);}
 scene.updateMatrixWorld(true);const collider=new EnvironmentCollider();collider.fromStaticScene(scene);
 const camera=new THREE.PerspectiveCamera(),input={forward:false,consumeLookDelta:()=>({yaw:0,pitch:0})},player=new PlayerController(input,collider,{camera,terrainHeightSampler:()=>-1000});
 player.cameraControlledExternally=true;player.position.set(-5,.91,0);player.syncCapsuleToObject();for(let i=0;i<40;i++)player.update(1/60);
 for(const x of[-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,14,12,10,8,6,4,2,0,-2,-4,-5]){
  input.forward=true;let frames=0;while(Math.abs(player.position.x-x)>.25){camera.position.copy(player.position).add(new THREE.Vector3(0,2,0));camera.lookAt(x,camera.position.y,0);camera.updateMatrixWorld();player.update(1/60);assert.ok(++frames<300,'Gateway route blocked at '+player.position.toArray());}
  input.forward=false;for(let i=0;i<14;i++)player.update(1/60);assert.equal(player.grounded,true,'Lost gateway support at '+x);
 }
});
