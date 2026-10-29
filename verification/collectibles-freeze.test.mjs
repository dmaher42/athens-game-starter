import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {CollectiblesManager} from '../src/world/collectibles.js';
function liveLights(scene){const result=[];scene.traverseVisible(o=>{if(o.isPointLight)result.push(o);});return result;}
test('proximity pickup removes its appearance without changing the renderer light layout',()=>{
 const scene=new THREE.Scene(),manager=new CollectiblesManager(scene);manager.spawnAt(0,0,0);manager.spawnAt(10,0,0);
 const item=manager.items[0],other=manager.items[1],before=liveLights(scene),otherIntensity=before[1].intensity;let calls=0;manager.onScoreChange=()=>calls++;
 manager.update(1/60,new THREE.Vector3(0,1.2,0));
 assert.equal(item.userData.collected,true);assert.equal(manager.score,1);assert.equal(calls,1);
 assert.deepEqual(liveLights(scene),before,'Removing a visible point light recompiles every lit material. Keep light slots stable.');
 assert.equal(before[0].intensity,0);assert.equal(before[1].intensity,otherIntensity);assert.equal(other.visible,true);
 let visibleMeshes=0;item.traverseVisible(o=>{if(o.isMesh)visibleMeshes++;});assert.equal(visibleMeshes,0);
 for(let n=0;n<10;n++){manager.update(1/60,new THREE.Vector3(4,1.2,0));manager.update(1/60,new THREE.Vector3(0,1.2,0));}
 assert.equal(manager.score,1);assert.equal(calls,1);assert.deepEqual(liveLights(scene),before);
});
test('collect is idempotent when repeated use/proximity events target the same item',()=>{
 const manager=new CollectiblesManager(new THREE.Scene());manager.spawnAt(0,0,0);let calls=0;manager.onScoreChange=()=>calls++;manager.collect(manager.items[0]);manager.collect(manager.items[0]);assert.equal(manager.score,1);assert.equal(manager.typeScores.gold,1);assert.equal(calls,1);
});
