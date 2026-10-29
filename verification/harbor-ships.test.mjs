import {createHash} from 'node:crypto';
import {batchStaticMeshes} from '../src/utils/staticRenderBatches.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createMerchantShip, createTriremeShip, createFishingSkiff } from '../src/world/harborShips.js';
import { EnvironmentCollider } from '../src/env/EnvironmentCollider.js';

test('merchant and trireme have distinct readable features with bounded shared geometry',()=>{
 const merchant=createMerchantShip(),trireme=createTriremeShip(),second=createMerchantShip();
 assert.equal(merchant.userData.shipType,'merchant');assert.equal(trireme.userData.shipType,'trireme');
 assert.ok(merchant.userData.shipDimensions.width>trireme.userData.shipDimensions.width);
 assert.equal(trireme.getObjectByName('ThreeOarBanks').count,72);assert.equal(trireme.userData.oarBanks,3);
 assert.ok(trireme.getObjectByName('BronzeRam'));assert.ok(merchant.getObjectByName('SquareSail'));assert.ok(merchant.getObjectByName('SteeringOar'));
 assert.equal(merchant.getObjectByName('MerchantGrainSacks').count,6);assert.equal(merchant.getObjectByName('MerchantAmphoraCargo').count,6);
 assert.equal(merchant.getObjectByName('CurvedShipHull').material,second.getObjectByName('CurvedShipHull').material);
 for(const ship of [merchant,trireme,createFishingSkiff()]){
  const hull=ship.getObjectByName('CurvedShipHull');hull.geometry.computeBoundingBox();assert.ok(hull.geometry.boundingBox.min.y<0 && hull.geometry.boundingBox.max.y>1);
  let triangles=0;ship.traverse(o=>{if(o.isMesh)triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1)});assert.ok(triangles<10000,`Ship triangle budget exceeded: ${triangles}`);
 }
});

test('ship decks are solid at sea-relative height while cargo and oars stay nonblocking',()=>{
 for(const ship of [createMerchantShip(),createTriremeShip()]){
  const scene=new THREE.Scene();ship.position.set(30,4,20);scene.add(ship);const collider=new EnvironmentCollider();collider.fromStaticScene(scene);
  for(const x of [-6,6]){const ray=new THREE.Raycaster(new THREE.Vector3(30+x,12,20),new THREE.Vector3(0,-1,0));ray.firstHitOnly=true;const hit=ray.intersectObject(collider.mesh)[0];assert.ok(hit);assert.ok(Math.abs(hit.point.y-5.7)<1e-4,`Unexpected ship floor ${hit?.point.y}`);}
  for(const name of ['MerchantGrainSacks','MerchantAmphoraCargo','ThreeOarBanks','OarBlades']){const object=ship.getObjectByName(name);if(object)assert.equal(object.userData.noCollision,true);}
 }
});
test('boarding ramp top corners meet the two support heights exactly',async()=>{
 const {createHarborBoardingRamp}=await import('../src/world/harborPlacement.js');
 const start=new THREE.Vector3(4,2.2,-3),end=new THREE.Vector3(4.3,1.7,-.7),ramp=createHarborBoardingRamp(start,end,2,new THREE.MeshBasicMaterial());
 ramp.updateMatrixWorld(true);const length=start.distanceTo(end);
 const a=new THREE.Vector3(0,.08,-length/2).applyMatrix4(ramp.matrixWorld),b=new THREE.Vector3(0,.08,length/2).applyMatrix4(ramp.matrixWorld);
 assert.ok(a.distanceTo(start)<1e-6);assert.ok(b.distanceTo(end)<1e-6);assert.equal(ramp.receiveShadow,true);
 assert.throws(()=>createHarborBoardingRamp(start,start,2,new THREE.MeshBasicMaterial()),/distinct/);
});

test('ship presentation retains byte-identical pre-upgrade collision surfaces and boarding contracts',()=>{
 const expected={merchant:'2411614a29950ff6ea8b48510add563982884218700e0d6b793ebf12250820a4',trireme:'d429e65bd92671983d177d0148874bcbae355908cab2997abff3b80971f820ec'};
 for(const factory of [createMerchantShip,createTriremeShip]){
  const ship=factory(),scene=new THREE.Scene();scene.add(ship);const collider=new EnvironmentCollider();collider.fromStaticScene(scene);
  const a=collider.mesh.geometry.attributes.position.array,hash=createHash('sha256').update(Buffer.from(a.buffer,a.byteOffset,a.byteLength)).digest('hex');
  assert.equal(hash,expected[ship.userData.shipType]);assert.equal(ship.userData.deckHeight,1.7);assert.equal(ship.userData.boardingGap.width,2.8);assert.equal(ship.userData.boardingGap.side,-1);
  assert.equal(ship.getObjectByName('ShipVisualDetails').userData.noCollision,true);
  assert.equal(ship.getObjectByName('ShipHullCollision').layers.mask,0);assert.equal(ship.getObjectByName('ShipHullCollision').visible,true);
  assert.notEqual(ship.getObjectByName('CurvedShipHull').layers.mask,0);
 }
});
// The distinct deck material adds two exact-policy batches (casting deck and
// receive-only end platforms); triangle and collision budgets stay unchanged.
test('richer ships share hull geometry and remain within bounded batched draw and shadow budgets',()=>{
 for(const [factory,maxDraw,maxTriangles,maxShadow]of [[createMerchantShip,12,4000,3],[createTriremeShip,16,7000,4]]){
  const ship=factory(),other=factory();assert.equal(ship.getObjectByName('CurvedShipHull').geometry,other.getObjectByName('CurvedShipHull').geometry);
  batchStaticMeshes(ship);let draws=0,triangles=0,shadows=0;ship.traverse(o=>{if(!o.visible||!o.layers.test(new THREE.Layers()))return;if(o.isMesh||o.isLine)draws++;if(o.isMesh){triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3*(o.count??1);if(o.castShadow)shadows++;}});
  assert.ok(draws<=maxDraw,`Draw budget ${draws}>${maxDraw}`);assert.ok(triangles<=maxTriangles,`Triangle budget ${triangles}>${maxTriangles}`);assert.ok(shadows<=maxShadow,`Shadow draw budget ${shadows}>${maxShadow}`);
 }
});


test('naval gallery opening remains visually clear across the existing boarding gap',()=>{
 const ship=createTriremeShip(),gap=ship.userData.boardingGap;ship.updateMatrixWorld(true);
 let portRails=0;ship.traverse(o=>{if(o.name!=='RowingGalleryWale'||o.position.z>=0)return;portRails++;const bounds=new THREE.Box3().setFromObject(o);assert.ok(bounds.max.x<=gap.x-gap.width/2+1e-5||bounds.min.x>=gap.x+gap.width/2-1e-5,'Gallery rail crosses the boarding aperture');});assert.equal(portRails,2);
 const supports=ship.getObjectByName('RowingGallerySupports'),matrix=new THREE.Matrix4(),position=new THREE.Vector3();for(let i=0;i<supports.count;i++){supports.getMatrixAt(i,matrix);position.setFromMatrixPosition(matrix);assert.ok(position.z>=0||Math.abs(position.x-gap.x)>=gap.width/2,'Gallery support obstructs the boarding aperture');}
});

test('ship decking shares one small warm texture without replacing support geometry or jetty wood',()=>{
 const jettyWood=new THREE.MeshStandardMaterial({color:0xccccbb}),merchant=createMerchantShip({woodMaterial:jettyWood}),naval=createTriremeShip({woodMaterial:jettyWood}),deck=merchant.getObjectByName('ShipDeck'),material=deck.material;
 assert.equal(material,naval.getObjectByName('ShipDeck').material);assert.notEqual(material,jettyWood);assert.equal(merchant.getObjectByName('Mast').material,jettyWood);assert.equal(jettyWood.color.getHex(),0xccccbb);assert.equal(jettyWood.map,null);
 assert.equal(material.map.image.width,256);assert.equal(material.map.image.height,256);assert.equal(material.map.image.data.byteLength,256*256*4);assert.equal(material.map.colorSpace,THREE.SRGBColorSpace);assert.equal(material.bumpMap,null);
 const pixel=(10*256+64)*4,data=material.map.image.data;assert.ok(data[pixel]>data[pixel+1]&&data[pixel+1]>data[pixel+2],'Deck timber should have a warm palette');
 for(const ship of [merchant,naval]){const support=ship.getObjectByName('ShipDeck');assert.equal(support.position.y,1.6);assert.equal(support.scale.y,.2);assert.equal(support.geometry,ship.getObjectByName('EndPlatform').geometry);let supports=0;ship.traverse(o=>{if(o.name==='ShipDeck')supports++;if(o.name==='EndPlatform')assert.equal(o.material,material);});assert.equal(supports,1);}
});
