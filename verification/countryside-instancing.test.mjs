import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {poolMaterialsAndMerge} from '../src/world/buildingSpawner.js';
test('city batching preserves crop instances, transforms and bounds while merging ordinary walls',()=>{
 const group=new THREE.Group();group.position.set(-105,1.5,36);
 const material=new THREE.MeshStandardMaterial({color:0x858453,roughness:1});
 const crops=new THREE.InstancedMesh(new THREE.CylinderGeometry(.025,.035,.65,4),material,234);
 for(let i=0;i<crops.count;i++)crops.setMatrixAt(i,new THREE.Matrix4().makeTranslation(i%13,4,Math.floor(i/13)));
 crops.position.set(40,0,200);crops.userData.noCollision=true;crops.computeBoundingSphere();group.add(crops);
 const wall=new THREE.Mesh(new THREE.BoxGeometry(1.8,.5,.46),new THREE.MeshStandardMaterial({color:0x928c78,roughness:1}));wall.position.set(40,4,201);wall.receiveShadow=true;group.add(wall);
 group.updateMatrixWorld(true);const prior=crops.matrixWorld.clone(),instance=new THREE.Matrix4();crops.getMatrixAt(233,instance);const sphere=crops.boundingSphere.clone();
 poolMaterialsAndMerge(group);group.updateMatrixWorld(true);
 assert.equal(crops.parent,group);assert.equal(crops.count,234);assert.deepEqual(crops.matrixWorld.elements,prior.elements);const after=new THREE.Matrix4();crops.getMatrixAt(233,after);assert.deepEqual(after.elements,instance.elements);assert.ok(crops.boundingSphere.equals(sphere));
 assert.equal(wall.parent,null);const batches=group.children.filter(o=>o.userData.isCityBatch);assert.equal(batches.length,1);assert.equal(batches[0].receiveShadow,true);assert.equal(crops.userData.noCollision,true);
});

