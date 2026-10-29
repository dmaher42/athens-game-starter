import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {CITY_STREETS,CITY_QUARTERS,AGORA_FRONTAGES,cityQuarterRecipe} from '../src/world/neighbourhoodLayout.js';
import {generateCityGrid} from '../src/world/cityPlan.js';
import {createLayoutFixture} from './city-layout.fixture.mjs';
import {PlayerController} from '../src/controls/PlayerController.js';
import {EnvironmentCollider} from '../src/env/EnvironmentCollider.js';
const baseline=JSON.parse(await fs.readFile(new URL('./city-structure-baseline.json',import.meta.url),'utf8'));
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const cellsData=cells=>cells.map(c=>({x:c.position.x,z:c.position.z,type:c.type,district:c.district,buildable:c.buildable,gridX:c.gridX,gridZ:c.gridZ}));
test('one authored street network retains all existing centre lines and clear building reservations',()=>{
 const {cells,roadNetwork}=generateCityGrid(()=>4);
 assert.equal(roadNetwork.length,19);assert.equal(new Set(CITY_STREETS.map(s=>s.id)).size,19);
 assert.equal(hash(roadNetwork.map(r=>({width:r.width,type:r.type,points:r.points.map(p=>[p.x,p.z])}))),baseline.streetHash);
 assert.equal(hash(cellsData(cells)),baseline.gridHash,'No extra building slots or lost protected reservations in this bounded pass.');
 assert.equal(AGORA_FRONTAGES.length,5);assert.equal(CITY_QUARTERS.length,5);
 const triangles=roadNetwork.reduce((sum,road)=>{for(const t of [0,.25,.5,.75,1])assert.ok(road.getWidthAt(t)>=3&&road.getWidthAt(t)<=road.width);const mesh=road.renderRibbon(new THREE.Vector3(0,4,0),()=>4);assert.equal(mesh.userData.streetId,road.id);assert.equal(mesh.userData.groundSurface,'street');return sum+mesh.geometry.index.count/3;},0);
 assert.equal(triangles,baseline.roadTriangles,'Taper the existing ribbons without adding another ground mesh.');
});
test('workshop and residential recipes blend deterministically without new landmark/harbour owners',()=>{
 const typesAt=(x,z)=>Array.from({length:1000},(_,i)=>cityQuarterRecipe(x,z,(i+.5)/1000)?.type);
 assert.ok(typesAt(-105,10).filter(t=>t==='workshop').length>=600);
 assert.ok(typesAt(-65,115).filter(t=>t==='house').length>=700);
 const a=cityQuarterRecipe(-90,70,.2),b=cityQuarterRecipe(-89.9,70,.2);assert.ok(a&&b);assert.ok(Math.abs(a.workshopWeight-b.workshopWeight)<.01);
 assert.deepEqual(cityQuarterRecipe(-90,70,.2),a);for(const [x,z]of [[-30,20],[-32,-28],[68,10],[500,500]])assert.equal(cityQuarterRecipe(x,z),null);
});
test('existing city prefabs stay within geometry/light budgets and the main district routes admit a walking capsule',async()=>{
 const {scene,city,stats}=await createLayoutFixture();
 assert.equal(stats.buildingLots,baseline.city.buildingLots);assert.equal(stats.streetFrontages,baseline.city.streetFrontages);assert.equal(stats.lights,baseline.city.lights);
 assert.ok(stats.triangles<=baseline.city.triangles*1.05,`Triangle budget exceeded: ${stats.triangles} versus ${baseline.city.triangles}.`);
 assert.ok(stats.meshes<=baseline.city.meshes*1.05,`Mesh budget exceeded: ${stats.meshes} versus ${baseline.city.meshes}.`);
 const floor=new THREE.Mesh(new THREE.BoxGeometry(800,1,800),new THREE.MeshBasicMaterial());floor.position.y=3.5;scene.add(floor);scene.updateMatrixWorld(true);
 const environment=new EnvironmentCollider();environment.fromStaticScene(scene);let walkedFrames=0;
 for(const id of ['harbour-agora','sacred-way','potters-approach','north-residential-collector','west-residential-loop']){
  const street=CITY_STREETS.find(s=>s.id===id),curve=new THREE.CatmullRomCurve3(street.points.map(([x,z])=>new THREE.Vector3(x,4,z)),false,'catmullrom',.2),points=curve.getSpacedPoints(Math.ceil(curve.getLength()/2));
  const camera=new THREE.PerspectiveCamera(),input={forward:false,consumeLookDelta:()=>({yaw:0,pitch:0})},player=new PlayerController(input,environment,{camera});player.cameraControlledExternally=true;player.position.copy(points[0]).add(new THREE.Vector3(0,.95,0));player.syncCapsuleToObject();for(let n=0;n<30;n++)player.update(1/60);
  for(const point of points.slice(1)){
   input.forward=true;let steps=0;while(Math.hypot(player.position.x-point.x,player.position.z-point.z)>.45){camera.position.copy(player.position).add(new THREE.Vector3(0,2,0));camera.lookAt(point.x,camera.position.y,point.z);camera.updateMatrixWorld();player.update(1/60);walkedFrames++;assert.ok(player.capsule.start.y-player.radius>=3.99,`${id}: fell below physical ground`);assert.ok(++steps<240,`${id}: obstruction at ${player.position.toArray()} heading to ${point.x},${point.z}`);}
  }
  input.forward=false;for(let n=0;n<10;n++)player.update(1/60);assert.equal(player.grounded,true);assert.equal(player.flying,false);
 }
 console.log(JSON.stringify({cityStructure:{...stats,walkedFrames,browserRendering:false}}));
});
