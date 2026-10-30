import {agoraXZ} from './cityCivicLayout.js';
import * as THREE from 'three';
import {RESIDENTIAL_STREET_POCKETS,residentialPocketPoint} from './neighbourhoodLayout.js';
import {CITY_STREETS} from './neighbourhoodLayout.js';

// These itineraries use the existing waypoint citizen updater. They are local
// authored work rounds, not a second crowd/economy/save system.
function sampled(points){return new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z)),false,'catmullrom',.2).getSpacedPoints(Math.max(2,Math.ceil(new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z)),false,'catmullrom',.2).getLength()/2.5))).map(p=>[p.x,p.z]);}
function round(id,points,{start,end,speed=.85,startWait=10,endWait=9}){
 const stops=points.map(([x,z],i)=>({id:i===0?start:i===points.length-1?end:'on-the-way',x,z,wait:i===0?startWait:i===points.length-1?endWait:0,action:i===0?'tend':i===points.length-1?'check':'walk'}));
 stops.push(...points.slice(1,-1).reverse().map(([x,z])=>({id:'returning',x,z,wait:0,action:'walk'})));return{id,speed,stops};
}
export function cityDailyJourneys(){
 const pottery=sampled(CITY_STREETS.find(s=>s.id==='potters-approach').points).reverse();
 return[
  {id:'water-round',label:'Water carrier',role:'merchant',cargo:'water',routine:round('water-round',sampled([agoraXZ(-9,-8),agoraXZ(-9,0),agoraXZ(-1.5,10),agoraXZ(-1.5,27)]),{start:'fountain',end:'households',speed:.78,startWait:9,endWait:12})},
  {id:'pottery-delivery',label:'Pottery courier',role:'merchant',cargo:'pottery',routine:round('pottery-delivery',pottery,{start:'workshop',end:'market',speed:.98,startWait:8,endWait:14})},
  {id:'storehouse-round',label:'Storehouse porter',role:'dockworker',routine:round('storehouse-round',sampled([[27,72],[18,72],[10,50],[10,20]]),{start:'storehouse',end:'junction',speed:.85,startWait:11,endWait:10})},
  {id:'quay-watch',label:'Quay watch',role:'guard',routine:round('quay-watch',sampled([[10,-30],[10,-8],[10,4]]),{start:'southern-quay',end:'city-gate',speed:.72,startWait:7,endWait:7})},
 ];
}
export function dailyJourneyLine(journey,state){
 const moving=state?.moving;
 if(journey.id==='water-round')return moving?'Water for the homes beyond the northern porch. The fountain is close, but a full jar makes every step count. I can wait while you pass.':'A cool jar before the street grows busy. I carry water between this fountain and the households beyond the northern porch; the people of Olive Court have their own shared basin.';
 if(journey.id==='pottery-delivery')return moving?'Cups from Potters\' Court for the market table. Follow my lane west and you will hear the workshop before you reach it.':'The potter has wrapped these cups for the market. I make the same round, check the order, then bring the empty basket back. A broken rim costs more than a slower walk.';
 if(journey.id==='storehouse-round')return moving?'One basket inland, one empty journey back. The storehouse is north along this lane; the Agora lies west at the junction.':'Seals checked, load counted. These goods pass between the storehouse and the city junction. Down at the harbour you can visit the trireme; here we keep the road clear.';
 return moving?'I walk the quay road and watch the entrances. The sea is to the east; the Agora is west of the city junction.':'A pause at the turn, then back along the quay. Porters need room to work, and visitors need a clear road into town.';
}
let jarGeometry,jarMaterial;
export function addJourneyCargo(citizen,kind){
 if(!kind)return;jarGeometry??=new THREE.LatheGeometry([[0,0],[.10,.01],[.15,.16],[.14,.29],[.07,.37],[.065,.44]].map(([x,y])=>new THREE.Vector2(x,y)),10);jarMaterial??=new THREE.MeshStandardMaterial({color:0xa97b54,roughness:1});
 const jar=new THREE.Mesh(jarGeometry,jarMaterial);jar.name=kind==='water'?'CarriedWaterJar':'WrappedDeliveryPot';jar.position.set(.34,.87,.12);jar.scale.setScalar(kind==='water'?1:.78);jar.userData.noCollision=true;jar.castShadow=false;citizen.add(jar);
}

// The existing garden keeper now checks a household drying yard, not a new NPC.
export function gardenHouseholdRoutine(){
 const f=RESIDENTIAL_STREET_POCKETS.find(p=>p.kind==='herbs'),point=(x,z)=>{const p=residentialPocketPoint(f,x,z);return[p.x,p.z];};
 const lane=sampled(CITY_STREETS.find(s=>s.id==='olive-garden').points).reverse().filter(p=>p[1]>=182);
 const entry=[lane.at(-1),point(f.doorX,9),point(f.doorX,5.9),point(f.doorX,4.7),point(-1.8,4.7)],approach=[];
 // Keep the small gate turns explicit rather than smoothing across the walls.
 for(let i=1;i<entry.length;i++){const a=entry[i-1],b=entry[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/1.4);for(let j=1;j<=n;j++)approach.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n]);}
 return round('garden-household-round',[...lane,...approach],{start:'garden',end:'drying-rack',speed:.68,startWait:18,endWait:18});
}
export function gardenHouseholdLine(state){return state?.stopId==='drying-rack'?'These cuttings need air, not another drenching. I check the small bundles here, then return to the garden. The open gate is for neighbours; the home behind it is private.':state?.stopId==='garden'?'The basin and beds come first. Then I take the northern residential lane to check a household drying rack. Beyond this garden, the field walk leads towards the olive trees.':'A short round from the garden to the herb-drying yard. I will wait while we talk, and keep the gate clear. The lane continues south to Olive Court and the Agora.';}

