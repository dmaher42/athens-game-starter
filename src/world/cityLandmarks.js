import {ACROPOLIS} from './acropolisLayout.js';
import {createAcropolisPrecinct} from './acropolisPrecinct.js';
import {getSeaLevelY} from './locations.js';
import * as THREE from 'three';
import {CITY_LANDMARKS} from './neighbourhoodLayout.js';
import {Prefabs} from './buildingSpawner.js';
import {buildTemple} from '../features/temples.js';
import {placeHarborOnLand} from './harborPlacement.js';
import {queueSceneInteractable} from './interactions.js';
import {createLabelSprite} from './demoTour.js';

// Render the existing major sites once. Layout and purpose stay in the same
// manifest as streets/districts; this adds no global state or update manager.
export async function createCityLandmarks(parent,{terrain}){
 const scene=(()=>{let o=parent;while(o.parent)o=o.parent;return o;})();
 const sample=(x,z)=>terrain.userData.getHeightAt(x,z),made=[];
 for(const def of CITY_LANDMARKS){
  let building;
  if(def.kind==='hall')building=Prefabs.stoa({w:def.width,d:def.depth,h:def.height,openFront:true,counters:false,columnCount:6,rng:()=>.45});
  else if(def.kind==='warehouse')building=Prefabs.warehouse({w:def.width,d:def.depth,h:def.height,rng:()=>.45});
  else building=await buildTemple({width:def.width,depth:def.depth,columnHeight:def.height,colX:def.id==='sacred-temple'?8:def.kind==='shrine'?4:6,colZ:def.id==='sacred-temple'?17:def.kind==='shrine'?2:11,parthenon:def.id==='sacred-temple',pedimentHeight:def.id==='sacred-temple'?2.5:undefined,roofHeight:def.id==='sacred-temple'?2.5:def.kind==='shrine'?1.1:2.7,materialPreset:def.kind==='shrine'?'plaster':'marble'});
  building.name='CityLandmark_'+def.id;building.userData.cityLandmark=def.id;building.userData.purpose=def.text;
  building.position.set(def.x,sample(def.x,def.z)+.05,def.z);building.rotation.y=def.rotation;
  if(def.x>0&&def.x<130&&Math.abs(def.z-10)<150)placeHarborOnLand(building,{x:def.x,z:def.z},sample,{building:true,parentOrigin:parent.getWorldPosition(new THREE.Vector3())});
  // Temple kit uses marble even for its plaster preset. Tone only these site's
  // shared bright surfaces; do not modify global materials or city lighting.
  const tinted=new Map();if(def.id!=='sacred-temple')building.traverse(o=>{if(!o.isMesh)return;const tint=m=>{if(!m?.color||Math.min(m.color.r,m.color.g,m.color.b)<.65)return m;if(!tinted.has(m)){const c=m.clone();c.color.set(def.kind==='temple'?0xc9c6bb:0xb9b4a5);c.roughness=.94;if('clearcoat'in c)c.clearcoat=0;tinted.set(m,c);}return tinted.get(m);};o.material=Array.isArray(o.material)?o.material.map(tint):tint(o.material);});
  parent.add(building);made.push(building);
  if(def.id==='sacred-temple'){
   // Fit the one temple entrance to the rendered grid, preserving the locked
   // coastal slope rather than lifting the harbour to meet the monument.
   building.updateMatrixWorld(true);
   const apron=building.getObjectByName('ParthenonEntranceApron');
   if(apron){const positions=apron.geometry.attributes.position;for(const i of[0,1]){const world=building.localToWorld(new THREE.Vector3(positions.getX(i),positions.getY(i),positions.getZ(i)));positions.setY(i,sample(world.x,world.z)-building.position.y+.02);}const baseY=Math.min(positions.getY(0),positions.getY(1),0)-.15;for(const i of[4,5,6,7])positions.setY(i,baseY);positions.needsUpdate=true;apron.geometry.computeVertexNormals();apron.geometry.computeBoundingBox();apron.geometry.computeBoundingSphere();}
   const firstStone=building.getObjectByName('TempleColonnade')?.material;
   const foundation=new THREE.Mesh(new THREE.BoxGeometry(def.width+4.4,.92,def.depth+5.6),firstStone);foundation.name='ParthenonRockFoundation';foundation.position.y=-.44;foundation.receiveShadow=true;building.add(foundation);
   await createAcropolisPrecinct(parent,{terrain,seaLevel:getSeaLevelY()});
   const statue=building.getObjectByName('ParthenonAthena');
   if(statue){statue.userData.interactable=true;statue.userData.interactionRange=4.5;statue.userData.placeId='parthenon-athena';statue.userData.onUse=()=>scene.userData.interactor?.showDialogue('Athena watches over the city with shield, spear and a small figure of Victory. This original, simplified figure evokes the lost gold-and-ivory statue. Outside, the Agora supplies the city and the theatre gathers its voices.');queueSceneInteractable(scene,statue,{includeChildren:false});}
  }
  if(def.kind==='hall')for(const z of[-4,4]){const bench=Prefabs.stoneBench({w:3});bench.position.set(-1,0,z);bench.rotation.y=Math.PI/2;building.add(bench);}
  if(def.kind==='warehouse'){
   const cargo=new THREE.Group();cargo.name='StorehouseSortedCargo';cargo.userData.noCollision=true;building.add(cargo);
   const material=new THREE.MeshStandardMaterial({color:0x84684b,roughness:1});
   for(const[x,z]of[[-4.5,5.8],[-4.5,6.8]]){const crate=new THREE.Mesh(new THREE.BoxGeometry(.85,.8,.85),material);crate.position.set(x,.4,z);crate.receiveShadow=true;crate.userData.noCull=true;cargo.add(crate);}
  }
  const marker=new THREE.Group();marker.name='CityPlaceCue_'+def.id;marker.position.set(def.sign[0],sample(...def.sign)+.05,def.sign[1]);marker.userData.noCollision=true;marker.userData.interactable=true;marker.userData.interactionRange=4;marker.userData.placeId=def.id;marker.userData.onUse=()=>scene.userData.interactor?.showDialogue(def.text);
  const post=new THREE.Mesh(new THREE.BoxGeometry(.1,1.35,.1),new THREE.MeshStandardMaterial({color:0x70583f,roughness:1}));post.position.y=.675;post.userData.noCull=true;marker.add(post);const label=createLabelSprite(def.label,0xc2aa7c,{x:4.2,y:1});label.position.y=1.8;marker.add(label);parent.add(marker);queueSceneInteractable(scene,marker);
 }
 return made;
}
