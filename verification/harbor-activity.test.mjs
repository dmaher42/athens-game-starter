import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { QuestManager } from '../src/state/QuestManager.js';
import { HarborEvidenceActivity, HARBOR_ACTIVITY_ID } from '../src/state/HarborActivity.js';
import { createInteractor } from '../src/world/interactions.js';
import { batchStaticMeshes } from '../src/utils/staticRenderBatches.js';

test('evidence and a correct explanation are required; retries and replay preserve the old quest',()=>{
 const quests=new QuestManager();quests.startQuest('Existing walk','Reach the temple',3);quests.updateProgress(1);const previous={...quests.currentQuest};
 const activity=new HarborEvidenceActivity(quests);activity.start();
 assert.equal(activity.chooseShip('merchant'),false);assert.equal(activity.explain('food-supply'),false);
 activity.inspect('merchant');activity.inspect('merchant');assert.equal(activity.snapshot().observed.length,1);
 assert.equal(activity.chooseShip('merchant'),false);activity.inspect('trireme');
 assert.equal(activity.chooseShip('trireme'),false);assert.equal(activity.explain('food-supply'),false);assert.equal(activity.completed,false);
 assert.equal(activity.chooseShip('merchant'),true);assert.equal(activity.explain('only-war'),false);assert.match(activity.feedback,/food|grain/i);
 assert.equal(quests.currentQuest.status,'In Progress');assert.equal(activity.explain('food-supply'),true);assert.equal(quests.currentQuest.status,'Completed');
 activity.leave();assert.deepEqual(quests.currentQuest,previous);assert.equal(activity.completed,true);
 activity.reset();assert.equal(activity.seen.size,0);assert.equal(activity.completed,false);assert.equal(quests.currentQuest.status,'In Progress');
 activity.leave();assert.deepEqual(quests.currentQuest,previous);
});

test('only the activity owner may change its objective; delayed follow-up quests wait for release',()=>{
 const quests=new QuestManager();quests.startQuest('Old quest','Old objective',3);quests.updateProgress(2);
 quests.beginActivity(HARBOR_ACTIVITY_ID,'Evidence','Inspect both ships');
 quests.updateObjective('Tour overwrite');quests.updateProgress(999);quests.completeQuest();quests.clear();quests.setTarget(1);
 assert.equal(quests.currentQuest.objective,'Inspect both ships');assert.equal(quests.currentQuest.status,'In Progress');assert.equal(quests.currentQuest.target,0);
 assert.equal(quests.beginActivity('other','Other','Overwrite'),false);assert.equal(quests.endActivity('other'),false);
 quests.startQuest('Delayed follow-up','Collect cargo',5);assert.equal(quests.currentQuest.title,'Evidence');
 quests.updateObjective('Explain',HARBOR_ACTIVITY_ID);assert.equal(quests.currentQuest.objective,'Explain');
 quests.endActivity(HARBOR_ACTIVITY_ID);assert.equal(quests.currentQuest.title,'Delayed follow-up');assert.equal(quests.currentQuest.target,5);
});

test('registered evidence supports nearby third-person use and rejects distant or hidden targets',()=>{
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(70,1,.1,100),actor=new THREE.Vector3();camera.lookAt(10,0,0);camera.updateMatrixWorld(true);
 const target=new THREE.Group(),body=new THREE.Mesh(new THREE.BoxGeometry(2,2,2),new THREE.MeshBasicMaterial());target.add(body);target.position.z=-10;target.userData.interactable=true;target.userData.interactionRange=4;let used=0;target.userData.onUse=()=>used++;scene.add(target);scene.updateMatrixWorld(true);
 const interactor=createInteractor({domElement:{clientWidth:100,clientHeight:100}},camera,scene,{getPlayerPosition:()=>actor});
 interactor.useObject();assert.equal(used,0);actor.set(0,0,-7);interactor.updateHover(1);assert.equal(interactor.getCurrentHover(),target);
 interactor.useObject();assert.equal(used,1);actor.set(0,0,0);interactor.useObject();assert.equal(used,1);
 actor.set(0,0,-7);target.visible=false;interactor.updateHover(1);interactor.useObject();assert.equal(used,1);
 target.visible=true;interactor.unregisterInteractable(target);interactor.updateHover(1);interactor.useObject();assert.equal(used,1);
});

test('static batching never removes interactive descendants from the raycast layer',()=>{
 const root=new THREE.Group(),interactive=new THREE.Group();interactive.userData.interactable=true;root.add(interactive);const material=new THREE.MeshBasicMaterial(),geometry=new THREE.BoxGeometry(2,2,2),objects=[];
 for(let i=0;i<2;i++){const child=new THREE.Mesh(geometry,material);child.position.x=i*3;interactive.add(child);objects.push(child);const staticMesh=new THREE.Mesh(geometry,material);staticMesh.position.set(i*3,0,8);root.add(staticMesh);}
 const state=batchStaticMeshes(root);assert.equal(state.sources,2);objects.forEach(o=>assert.equal(o.layers.mask,1));state.restore();
});
test('collectibles picked up during an activity count toward suspended and queued quests',()=>{
 const quests=new QuestManager();quests.startQuest('Cargo','Collect cargo',5);quests.updateProgress(1);quests.beginActivity(HARBOR_ACTIVITY_ID,'Evidence','Inspect ships');
 assert.equal(quests.recordProgress('Cargo',4),false);assert.equal(quests.suspendedQuest.progress,4);assert.equal(quests.currentQuest.progress,0);
 assert.equal(quests.recordProgress('Wrong quest',999),false);assert.equal(quests.recordProgress('Cargo',5),true);assert.equal(quests.suspendedQuest.status,'Completed');
 quests.startQuest('Follow-up','Collect jars',3);assert.equal(quests.recordProgress('Follow-up',3),true);assert.equal(quests.currentQuest.title,'Evidence');
 quests.endActivity(HARBOR_ACTIVITY_ID);assert.equal(quests.currentQuest.title,'Follow-up');assert.equal(quests.currentQuest.progress,3);assert.equal(quests.currentQuest.status,'Completed');
});
import {EnvironmentCollider} from '../src/env/EnvironmentCollider.js';
import {Capsule} from 'three/examples/jsm/math/Capsule.js';
import {PlayerController} from '../src/controls/PlayerController.js';
import {createHarborGeometryFixture} from './harbor-geometry.fixture.mjs';
import {planHarborApproach,executeHarborApproach,walkHarborSegment} from './harbor-approach.fixture.js';

let approachFixture;
const controller=collider=>{const input={forward:false,consumeLookDelta:()=>({yaw:0,pitch:0})},p=new PlayerController(input,collider,{camera:new THREE.PerspectiveCamera()});p.cameraControlledExternally=true;return p;};

test('known dock-barrel layout rejects the old overlapping west teleport and walks a clear inshore approach',()=>{
  const fixture=approachFixture=createHarborGeometryFixture(123456),marker=fixture.markers.merchant;
  const old=new Capsule(new THREE.Vector3(marker.x-1.5,marker.y+1.02-.9+.35,marker.z),new THREE.Vector3(marker.x-1.5,marker.y+1.02+.9-.35,marker.z),.35);
  const overlap=fixture.collider.capsuleIntersect(old);assert.ok(overlap?.depth>.1,'The real seed123456 barrel-overlap regression must be reproduced.');
  const plan=planHarborApproach({harbor:fixture.harbor,marker,collider:fixture.collider});
  assert.ok(plan.start[0]<marker.x-50,'Start at the authored inshore end; never teleport beyond intervening obstacles.');
  const p=controller(fixture.collider),walk=executeHarborApproach(p,plan);
  assert.ok(walk.frames>1000,'The loading-pier route must actually be walked.');assert.equal(p.grounded,true);assert.equal(p.flying,false);
  assert.ok(p.position.y>marker.y+.75&&p.position.y<marker.y+1.4,'Keep the original supported-height requirement.');assert.ok(p.position.distanceTo(marker)<=4);
});

test('real marker sequence and both boarding/return routes stay grounded using authored pier and ramp geometry',()=>{
  const fixture=approachFixture,p=controller(fixture.collider);let frames=0;
  for(const id of ['board','merchant','trireme']){
    const marker=fixture.markers[id],plan=planHarborApproach({harbor:fixture.harbor,marker,collider:fixture.collider});
    frames+=executeHarborApproach(p,plan).frames;assert.equal(p.grounded,true);assert.equal(p.flying,false);assert.ok(p.position.distanceTo(marker)<=4);
    assert.ok(p.position.y>marker.y+.75&&p.position.y<marker.y+1.4);
    if(id==='board'){p.position.set(68,3.36,10);p.velocity.set(0,0,0);p.syncCapsuleToObject();for(let n=0;n<10;n++)p.update(1/60);}
  }
  for(const [id,shipName,rampName,inside]of [['merchant','HarborHeroShip','HarborMerchantBoarding',[3,-2.1]],['trireme','HarborTrireme','HarborNavalBoarding',[-4,0]]]){
    executeHarborApproach(p,planHarborApproach({harbor:fixture.harbor,marker:fixture.markers[id],collider:fixture.collider}));
    const ship=fixture.harbor.getObjectByName(shipName),ramp=fixture.harbor.getObjectByName(rampName),data=ramp.userData.boarding;
    const start=ramp.parent.localToWorld(new THREE.Vector3(...data.start)),end=ramp.parent.localToWorld(new THREE.Vector3(...data.end)),deck=ship.localToWorld(new THREE.Vector3(inside[0],ship.userData.deckHeight,inside[1]));
    const minFootY=Math.min(start.y,end.y,deck.y)-.15;
    for(const point of [start,end,deck,end,start]){frames+=walkHarborSegment(p,point.toArray(),{minFootY}).frames;assert.equal(p.grounded,true);assert.equal(p.flying,false);}
  }
  console.log(JSON.stringify({cpuHarborApproaches:{seed:123456,markers:3,boarded:['merchant','trireme'],returns:true,frames,browserRendering:false}}));
});

test('approach fixture refuses an intervening wall and out-of-range targets instead of bypassing them',()=>{
  const scene=new THREE.Scene(),harbor=new THREE.Group(),pier=new THREE.Group();scene.add(harbor);harbor.add(pier);pier.name='HarborPier';
  for(const x of [5,-5]){const section=new THREE.Group();section.name='HarborDockSection';section.position.x=x;section.userData.length=10;section.userData.width=5.8;const deck=new THREE.Mesh(new THREE.BoxGeometry(10,.45,5.8),new THREE.MeshBasicMaterial());deck.name='HarborPierDeck';deck.position.y=-.225;section.add(deck);pier.add(section);}
  const wall=new THREE.Mesh(new THREE.BoxGeometry(1,5,20),new THREE.MeshBasicMaterial());wall.position.y=2.5;harbor.add(wall);
  const collider=new EnvironmentCollider();collider.fromStaticScene(scene);
  assert.throws(()=>planHarborApproach({harbor,marker:new THREE.Vector3(5,0,0),collider}),/No physically reachable supported approach/);
  assert.throws(()=>planHarborApproach({harbor,marker:new THREE.Vector3(50,0,0),collider}),/No physically reachable supported approach/);
  assert.equal(wall.visible,true);assert.equal(wall.parent,harbor,'No removal/mutation of the blocking geometry.');
});


test('approach selection walks all actual evidence targets across additional deterministic dock layouts',()=>{
  let frames=0;
  for(const seed of [1,42,87654]){
    const fixture=createHarborGeometryFixture(seed),p=controller(fixture.collider);
    for(const marker of Object.values(fixture.markers)){
      const plan=planHarborApproach({harbor:fixture.harbor,marker,collider:fixture.collider});
      const result=executeHarborApproach(p,plan);frames+=result.frames;
      assert.equal(p.grounded,true);assert.equal(p.flying,false);assert.ok(p.position.distanceTo(marker)<=4);
      assert.ok(p.position.y>marker.y+.75&&p.position.y<marker.y+1.4);
    }
  }
  console.log(JSON.stringify({cpuHarborApproachLayouts:{seeds:[1,42,87654],targets:9,frames,browserRendering:false}}));
});
