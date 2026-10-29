import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { poolMaterialsAndMerge } from '../src/world/buildingSpawner.js';
import { updateHarborLighting } from '../src/world/harbor.js';
import { cullDistantBuildings } from '../src/utils/buildingCulling.js';
import { EnvironmentCollider } from '../src/env/EnvironmentCollider.js';

test('city batching preserves shadow policy, world geometry and collision exclusions', () => {
  const scene = new THREE.Scene(), city = new THREE.Group();
  city.position.set(30, 4, -20); scene.add(city);
  const material = new THREE.MeshStandardMaterial();
  const expected = [];
  for (const [i, flags] of [[false,false], [false,true], [true,true], [true,false]].entries()) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(2,2,2), material);
    mesh.position.set(i*8, 2, 0); [mesh.castShadow,mesh.receiveShadow] = flags;
    mesh.userData.noCollision = i === 3; city.add(mesh);
    expected.push({ center:mesh.getWorldPosition(new THREE.Vector3()), flags, noCollision:i===3 });
  }
  const collider = new EnvironmentCollider(); collider.fromStaticScene(scene);
  const beforeVertices = collider.mesh.geometry.attributes.position.count;
  poolMaterialsAndMerge(city);
  assert.equal(city.children.length,4,'Different shadow/collision policies cannot share a batch.');
  const center = new THREE.Vector3();
  for(const mesh of city.children) {
    mesh.geometry.computeBoundingBox(); mesh.updateWorldMatrix(true,false);
    mesh.geometry.boundingBox.getCenter(center).applyMatrix4(mesh.matrixWorld);
    const original = expected.find(e=>e.center.distanceTo(center)<1e-6);
    assert.ok(original,'Batch must keep the source geometry in the same world position.');
    assert.deepEqual([mesh.castShadow,mesh.receiveShadow],original.flags);
    assert.equal(mesh.userData.noCollision,original.noCollision);
    assert.equal(mesh.userData.isCityBatch,true);
  }
  collider.fromStaticScene(scene);
  assert.equal(collider.mesh.geometry.attributes.position.count,beforeVertices);
});

test('bounds culling keeps near edges of transformed batches and survives camera turns/rebatching', () => {
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(75,1,0.1,1200);
  const city = new THREE.Group(); scene.add(city);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(120,8,8),new THREE.MeshBasicMaterial());
  mesh.name='Building'; mesh.position.set(160,0,0); city.add(mesh);
  camera.position.set(50,0,0);
  cullDistantBuildings(scene,camera,60);
  assert.equal(mesh.visible,true,'The nearest edge is in range even when the pivot is not.');
  poolMaterialsAndMerge(city);
  const batch=city.children[0];
  cullDistantBuildings(scene,camera,60);
  assert.equal(batch.visible,true,'Deferred replacement must refresh the culling list.');
  camera.rotation.y=Math.PI; camera.updateMatrixWorld();
  cullDistantBuildings(scene,camera,60);
  assert.equal(batch.visible,true,'Render-time frustum culling must handle camera turns/reflections.');
  city.position.set(500,0,0); city.scale.setScalar(2);
  cullDistantBuildings(scene,camera,60);
  assert.equal(batch.visible,true,'City skyline keeps the camera far-plane range, not the house cutoff.');
  city.position.set(3000,0,0);
  cullDistantBuildings(scene,camera,60);
  assert.equal(batch.visible,false,'A wholly distant transformed batch can be omitted.');
  camera.position.set(3300,0,0);
  cullDistantBuildings(scene,camera,60);
  assert.equal(batch.visible,true,'The same batch must reappear when approached.');
});

test('harbor lighting caches shared materials, preserves day/night output and bounds deferred colour change', () => {
  const harbor=new THREE.Group(), material=new THREE.MeshStandardMaterial({color:'#aa9977',roughness:0.8,envMapIntensity:0.7});
  const base=material.color.clone();
  for(let i=0;i<50;i++) harbor.add(new THREE.Mesh(new THREE.BoxGeometry(),material));
  const originalTraverse=harbor.traverse.bind(harbor); let traversals=0;
  harbor.traverse=(fn)=>{traversals++; originalTraverse(fn);};
  const expected=n=>base.clone().lerp(new THREE.Color('#d2d9e4'),n*0.2).lerp(new THREE.Color('#e3b07a'),(1-n)*0.18);
  for(const night of [0,0.25,0.5,1,0]) {
    updateHarborLighting(harbor,night);
    assert.ok(material.color.distanceTo ? material.color.distanceTo(expected(night))<1e-10 :
      ['r','g','b'].every(k=>Math.abs(material.color[k]-expected(night)[k])<1e-10));
    assert.ok(Math.abs(material.envMapIntensity-THREE.MathUtils.lerp(0.7*1.25,0.7*0.32,night))<1e-10);
    assert.ok(Math.abs(material.roughness-THREE.MathUtils.lerp(Math.max(0.02,0.8-0.08*(1-night)),Math.min(1,0.8+0.1*night),night))<1e-10);
  }
  let clones=0; const clone=material.userData.baseColor.clone;
  material.userData.baseColor.clone=function(){clones++; return clone.call(this);};
  for(let i=0;i<600;i++) {
    const n=i/12000; updateHarborLighting(harbor,n);
    const target=expected(n);
    assert.ok(['r','g','b'].every(k=>Math.abs(material.color[k]-target[k])<0.001));
  }
  assert.equal(traversals,1,'Shared materials should be collected once, not once each frame.');
  assert.equal(clones,0,'A live lighting update must not allocate per-mesh colours.');
});

test('standard camera raycasts use the current collision BVH, including after refresh', () => {
  const scene = new THREE.Scene();
  const floor = new THREE.Mesh(new THREE.BoxGeometry(20, 1, 20), new THREE.MeshBasicMaterial());
  scene.add(floor);
  const collider = new EnvironmentCollider(); collider.fromStaticScene(scene);
  const ray = new THREE.Raycaster(new THREE.Vector3(0,10,0), new THREE.Vector3(0,-1,0));
  ray.firstHitOnly = true;
  const expected = ray.intersectObject(floor)[0].distance;
  const check = () => {
    let queries = 0;
    const tree = collider.boundsTree, original = tree.raycastFirst;
    tree.raycastFirst = function (...args) { queries++; return original.apply(this,args); };
    assert.ok(Math.abs(ray.intersectObject(collider.mesh)[0].distance - expected) < 1e-6);
    assert.ok(queries > 0, 'Mesh.raycast must actually query the BVH rather than all triangles.');
    tree.raycastFirst = original;
  };
  check(); const first = collider.boundsTree;
  collider.refresh(); assert.notEqual(collider.boundsTree, first); check();
  scene.remove(floor); collider.refresh();
  assert.equal(collider.boundsTree, null);
  assert.equal(ray.intersectObject(collider.mesh).length, 0);
});

test('interaction picking ignores the world when empty and retains registered targets and citizens', async () => {
  const { createInteractor, queueSceneInteractable } = await import('../src/world/interactions.js');
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(75,1,0.1,100);
  const world = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
  world.position.z=-2;
  world.raycast=()=>{throw new Error('Unregistered world geometry must never be picked');};
  scene.add(world); scene.updateMatrixWorld(true); camera.updateMatrixWorld(true);
  const interactor=createInteractor({domElement:{clientWidth:100,clientHeight:100}},camera,scene);
  assert.equal(interactor.pickCenter(),null);
  assert.equal(interactor.pickObject(50,50),null);
  const target=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial());
  target.userData.interactable=true; target.position.z=-4; scene.add(target); scene.updateMatrixWorld(true);
  queueSceneInteractable(scene,target);
  assert.equal(interactor.pickCenter()?.object,target,'Late registration must be pickable.');
  scene.remove(target);
  assert.equal(interactor.pickCenter(),null,'Removal must invalidate the cached targets.');
  const citizens=new THREE.InstancedMesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial(),1);
  citizens.name='Citizens'; citizens.setMatrixAt(0,new THREE.Matrix4().makeTranslation(0,0,-5));
  scene.add(citizens); scene.updateMatrixWorld(true); interactor.rescanInteractables();
  const hit=interactor.pickCenter(); assert.equal(hit.object,citizens); assert.equal(hit.instanceId,0);
});
test('static render batches preserve authoring geometry, physical collisions, materials and shadows', async () => {
  const {batchStaticMeshes}=await import('../src/utils/staticRenderBatches.js');
  const scene=new THREE.Scene(), root=new THREE.Group(); root.position.set(12,3,-8);root.rotation.y=0.3;scene.add(root);
  const material=new THREE.MeshStandardMaterial({color:0xb78350,roughness:0.7});
  const sources=[];
  for(let i=0;i<4;i++){
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(2,2,2),material);mesh.name=`AuthoredPier${i}`;
    mesh.position.set(i*4,1,0);mesh.castShadow=true;mesh.receiveShadow=i<2;root.add(mesh);sources.push(mesh);
  }
  const individuallyCulled=[];
  for(let i=0;i<2;i++){
    const prop=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.3,0.3),material);prop.castShadow=true;prop.receiveShadow=true;prop.position.x=20+i;root.add(prop);individuallyCulled.push(prop);
    const building=new THREE.Mesh(new THREE.BoxGeometry(2,2,2),material);building.name='BuildingFixture';building.castShadow=true;building.receiveShadow=true;building.position.x=30+i*3;root.add(building);individuallyCulled.push(building);
  }
  const excluded=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial({transparent:true,opacity:0.5}));root.add(excluded);
  const hidden=new THREE.Mesh(new THREE.BoxGeometry(),material);hidden.visible=false;root.add(hidden);
  const collider=new EnvironmentCollider();collider.fromStaticScene(scene);
  const before=Array.from(collider.mesh.geometry.attributes.position.array).sort((a,b)=>a-b);
  const geometry=sources.map(o=>o.geometry), state=batchStaticMeshes(root);
  assert.equal(state.sources,4);assert.equal(state.batches,2);
  const batches=root.getObjectByName('StaticHarborRenderBatches');
  assert.equal(batches.userData.noCollision,true);
  assert.deepEqual(batches.children.map(o=>[o.castShadow,o.receiveShadow]),[[true,true],[true,false]]);
  for(const batch of batches.children){assert.equal(batch.material,material);assert.ok(batch.geometry.boundingSphere);}
  sources.forEach((o,i)=>{assert.equal(o.visible,true);assert.equal(o.geometry,geometry[i]);assert.equal(o.parent,root);assert.equal(o.layers.mask,0);});
  individuallyCulled.forEach(o=>assert.equal(o.layers.mask,1,'Existing per-object cullers must keep control of their meshes.'));
  assert.equal(excluded.layers.mask,1);assert.equal(hidden.visible,false);
  collider.refresh();assert.deepEqual(Array.from(collider.mesh.geometry.attributes.position.array).sort((a,b)=>a-b),before,'Render batches must neither remove nor duplicate collision surfaces.');
  assert.equal(batchStaticMeshes(root),state,'Batch creation must be idempotent.');
  material.color.setHex(0x333355);assert.equal(batches.children[0].material.color.getHex(),0x333355);
  const expectedBounds=new THREE.Box3();sources.forEach(o=>expectedBounds.union(new THREE.Box3().setFromObject(o)));
  const batchBounds=new THREE.Box3().setFromObject(batches);
  assert.ok(expectedBounds.min.distanceTo(batchBounds.min)<1e-5 && expectedBounds.max.distanceTo(batchBounds.max)<1e-5,'Batch bounds must match the transformed source geometry.');
  state.restore();sources.forEach(o=>assert.equal(o.layers.mask,1));assert.equal(root.getObjectByName('StaticHarborRenderBatches'),undefined);
  const rebuilt=batchStaticMeshes(root);state.restore();
  assert.equal(batchStaticMeshes(root),rebuilt,'A stale restore handle must not invalidate a rebuilt batch.');
  sources.forEach(o=>assert.equal(o.layers.mask,0));rebuilt.restore();
  collider.refresh();assert.deepEqual(Array.from(collider.mesh.geometry.attributes.position.array).sort((a,b)=>a-b),before);
});
