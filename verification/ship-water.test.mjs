import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {createMerchantShip,createTriremeShip} from '../src/world/harborShips.js';
import {buildShipWaterExclusions,isInsideShipWaterExclusion,configureShipWaterExclusions,MAX_HULL_EDGES} from '../src/world/shipWaterExclusion.js';
function ships(){const merchant=createMerchantShip(),naval=createTriremeShip();merchant.position.set(122,-1,16);merchant.rotation.y=-.18;merchant.scale.setScalar(1.16);naval.position.set(99.3,-1,-32);naval.rotation.y=-.05;merchant.updateMatrixWorld(true);naval.updateMatrixWorld(true);return[merchant,naval];}
test('actual transformed waterlines exclude dry interior gaps and retain outside sea',()=>{
 const pair=ships(),data=buildShipWaterExclusions(pair,-1);assert.equal(data.count,2);for(const h of data.hulls)assert.ok(h.edgeCount>20&&h.edgeCount<=MAX_HULL_EDGES);
 for(const ship of pair){const width=ship.userData.shipDimensions.width;for(const z of [-width*.42,width*.42]){const point=ship.localToWorld(new T.Vector3(3,0,z));assert.equal(isInsideShipWaterExclusion(data,point.x,point.z),true,'Exposed interior strip should be dry');}for(const z of [-width*.5,width*.5]){const point=ship.localToWorld(new T.Vector3(3,0,z));assert.equal(isInsideShipWaterExclusion(data,point.x,point.z),false,'Outside sea must remain visible');}}
 assert.equal(isInsideShipWaterExclusion(data,0,0),false);assert.equal(buildShipWaterExclusions([],0).count,0);
});
test('excluded points remain above an actual submerged hull surface, not holes outside a bounding box',()=>{
 for(const ship of ships()){const data=buildShipWaterExclusions([ship],-1),hull=ship.getObjectByName('CurvedShipHull'),{length,width}=ship.userData.shipDimensions;let checked=0;
  for(let x=-length/2;x<=length/2;x+=.4)for(let z=-width/2;z<=width/2;z+=.2){const p=ship.localToWorld(new T.Vector3(x,0,z));if(!isInsideShipWaterExclusion(data,p.x,p.z))continue;const ray=new T.Raycaster(new T.Vector3(p.x,0,p.z),new T.Vector3(0,-1,0));assert.ok(ray.intersectObject(hull,false).some(h=>h.point.y<-1),`Excluded outside hull at ${x},${z}`);checked++;}assert.ok(checked>500);
 }
});
test('hull clipping composes with shoreline shader and refreshes without stacking hooks',()=>{
 const material=new T.ShaderMaterial({uniforms:{},fragmentShader:'varying vec4 worldPosition;\nvoid main() { gl_FragColor=vec4(1.0); }'}),water=new T.Mesh(new T.PlaneGeometry(10,10),material);water.position.y=-1;let priorCalls=0;material.onBeforeCompile=shader=>{priorCalls++;shader.fragmentShader='// shoreline kept\n'+shader.fragmentShader;};
 configureShipWaterExclusions(water,ships());const hook=material.onBeforeCompile,countUniform=material.uniforms.uWaterHullCount;configureShipWaterExclusions(water,[]);assert.equal(material.uniforms.uWaterHullCount,countUniform);assert.equal(material.onBeforeCompile,hook);const shader={uniforms:{},fragmentShader:material.fragmentShader};material.onBeforeCompile(shader);assert.equal(priorCalls,1);assert.ok(shader.fragmentShader.includes('// shoreline kept'));assert.ok(shader.fragmentShader.includes('if(insideHull&&!onBoundary) discard;'));assert.equal(shader.uniforms.uWaterHullCount.value,0);assert.equal((shader.fragmentShader.match(/uniform int uWaterHullCount/g)||[]).length,1);
});


test('waterline derivation handles nested nonuniform transforms without local-coordinate assumptions',()=>{
 const parent=new T.Group(),ship=createMerchantShip();parent.position.set(400,0,-200);parent.rotation.y=.7;parent.scale.set(1.2,1.5,.8);ship.position.set(3,-1/1.5,4);ship.rotation.set(-.02,.3,.025);parent.add(ship);parent.updateMatrixWorld(true);const data=buildShipWaterExclusions([ship],-1);assert.equal(data.count,1);
 const inside=ship.localToWorld(new T.Vector3(2,0,.5)),outside=ship.localToWorld(new T.Vector3(2,0,6));assert.equal(isInsideShipWaterExclusion(data,inside.x,inside.z),true);assert.equal(isInsideShipWaterExclusion(data,outside.x,outside.z),false);
});
