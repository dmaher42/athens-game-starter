import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {PlayerController} from '../src/controls/PlayerController.js';
import {EnvironmentCollider} from '../src/env/EnvironmentCollider.js';
import {createHarborBoardingRamp} from '../src/world/harborPlacement.js';
function setup(ramp=false){
 const scene=new THREE.Scene(),material=new THREE.MeshBasicMaterial();
 const floor=new THREE.Mesh(new THREE.BoxGeometry(ramp?2:20,.2,ramp?2:20),material);floor.position.set(0,-.1,ramp?-1:0);scene.add(floor);
 if(ramp)scene.add(createHarborBoardingRamp(new THREE.Vector3(0,0,0),new THREE.Vector3(0,-2,8),2,material));
 const environment=new EnvironmentCollider();environment.fromStaticScene(scene);const camera=new THREE.PerspectiveCamera(),input={forward:false,jump:false,consumeLookDelta:()=>({yaw:0,pitch:0})},player=new PlayerController(input,environment,{camera});player.cameraControlledExternally=true;
 player.position.set(0,.91,ramp?-1:0);player.syncCapsuleToObject();
 function frame(){camera.position.copy(player.position).add(new THREE.Vector3(0,2,0));camera.lookAt(0,camera.position.y,20);camera.updateMatrixWorld();player.update(1/60);}
 for(let i=0;i<30;i++)frame();return {player,input,environment,frame};
}
test('walking down a supported ramp does not hover and flicker between grounded and airborne',()=>{
 const {player,input,environment,frame}=setup(true);assert.equal(player.grounded,true);input.forward=true;let sampled=0,airborne=0;
 for(let i=0;i<100;i++){if(i===70)input.forward=false;frame();if(player.position.z>.5&&player.position.z<6){sampled++;if(!player.grounded)airborne++;}}
 assert.ok(sampled>20);assert.equal(airborne,0,'Walkable-ramp support should remain grounded between frames.');
 const ray=new THREE.Ray(player.position.clone(),new THREE.Vector3(0,-1,0)),hit=environment.boundsTree.raycastFirst(ray),gap=player.capsule.start.y-player.radius-hit.point.y;
 assert.ok(gap<.005,`Feet should contact the support instead of hovering ${gap}m above it.`);
});
test('nearby ground must not re-ground an ascending jump',()=>{
 const {player,input,frame}=setup();assert.equal(player.grounded,true);input.jump=true;frame();assert.ok(player.velocity.y>0);assert.equal(player.grounded,false);input.jump=false;frame();assert.ok(player.velocity.y>0);assert.equal(player.grounded,false);
});
test('support probing preserves the existing steep-slope limit',()=>{
 const scene=new THREE.Scene();scene.add(createHarborBoardingRamp(new THREE.Vector3(0,0,0),new THREE.Vector3(0,-6,2),2,new THREE.MeshBasicMaterial()));const environment=new EnvironmentCollider();environment.fromStaticScene(scene);
 const player=new PlayerController({consumeLookDelta:()=>({yaw:0,pitch:0})},environment,{});player.position.set(0,-2.09,1);player.syncCapsuleToObject();player.update(1/60);assert.equal(player.slopeLimit,50);assert.equal(player.grounded,false);assert.equal(player.flying,false);
});
test('contact stays grounded when collision response imparts a small uphill velocity',()=>{
 const {player,input,frame}=setup(true);input.forward=true;for(let i=0;i<65;i++)frame();input.forward=false;input.back=true;let sampled=0,airborne=0;
 for(let i=0;i<55;i++){frame();if(player.position.z>1&&player.position.z<5){sampled++;if(!player.grounded)airborne++;}}
 assert.ok(sampled>15);assert.equal(airborne,0,'A supported uphill walk must retain contact despite slope-projected velocity.');
});
