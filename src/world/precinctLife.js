import * as THREE from 'three';
import {createOliveTree} from './foliage.js';
import {queueSceneInteractable} from './interactions.js';
import {PRECINCT_LIFE as P} from './precinctLifeLayout.js';
// Static local architecture and existing registered E dialogue, no new update/save owner.
export function createPrecinctLife(parent,{scene,terrain}){
 const root=new THREE.Group();root.name='AcropolisPrecinctLife';parent.add(root);
 const stone=new THREE.MeshStandardMaterial({color:0xb5b09f,roughness:1}),bronze=new THREE.MeshStandardMaterial({color:0x687269,roughness:.82,metalness:.35,envMapIntensity:.18}),clay=new THREE.MeshStandardMaterial({color:0x997052,roughness:1});
 const cube=new THREE.BoxGeometry(1,1,1),bowl=new THREE.CylinderGeometry(.35,.22,.22,12);
 const y=(x,z)=>terrain.userData.getHeightAt(x,z);
 function box(name,x,z,w,h,d,material=stone,solid=true){const m=new THREE.Mesh(cube,material);m.name=name;m.scale.set(w,h,d);m.position.set(x,y(x,z)+h/2+.025,z);m.receiveShadow=true;m.castShadow=false;m.userData.noCollision=!solid;root.add(m);return m;}
 function cue(id,x,z,text){const g=new THREE.Group();g.name='PrecinctLifeCue_'+id;g.position.set(x,y(x,z)+.03,z);g.userData={interactable:true,noCollision:true,interactionRange:3.5,precinctLife:id,onUse:()=>scene.userData.interactor?.showDialogue(text)};const post=new THREE.Mesh(new THREE.BoxGeometry(.12,.85,.12),bronze);post.position.y=.425;g.add(post);const plaque=new THREE.Mesh(new THREE.BoxGeometry(.65,.25,.07),bronze);plaque.position.y=.95;g.add(plaque);root.add(g);queueSceneInteractable(scene,g,{includeChildren:true});}
 const template=scene.getObjectByName('ParthenonAthena');if(template){const statue=template.clone(true);statue.name='PrecinctBronzeAthena';statue.position.set(P.bronze.x,y(P.bronze.x,P.bronze.z)+.025,P.bronze.z);statue.scale.setScalar(1.05);statue.rotation.y=-Math.PI/2;statue.userData={};statue.traverse(o=>{o.userData={noCollision:o.isMesh&&o.name!=='AthenaPlinth',noCull:true};if(o.isMesh){if(o.name!=='AthenaPlinth')o.material=bronze;else o.material=stone;o.castShadow=o.name==='AthenaPlinth';o.receiveShadow=true;}});root.add(statue);}
 const olive=createOliveTree({scale:1.7});olive.name='PrecinctSacredOlive';olive.position.set(P.olive.x,y(P.olive.x,P.olive.z),P.olive.z);olive.userData.noCollision=true;olive.traverse(o=>{if(o.isMesh)o.castShadow=false;});root.add(olive);
 for(const[x,z]of[[-148,-76],[-142,-84]])box('OliveRestBench',x,z,3,.48,.65);
 box('CeremonialAltarBase',P.altar.x,P.altar.z,5,.65,2.7);box('CeremonialAltarTable',P.altar.x,P.altar.z,4.7,.85,2.4);
 for(const[x,z,h]of[[-98,-66,.75],[-94,-69,1],[-90,-66,.65]]){const base=box('VotivePedestal',x,z,1.1,h,1.1);const offering=new THREE.Mesh(bowl,clay);offering.position.set(x,base.position.y+h/2+.14,z);offering.castShadow=false;offering.userData.noCollision=true;root.add(offering);}
 cue('bronze',...P.bronze.cue,'Bronze dedications gave the sanctuary memorable meeting points. This original Athena figure evokes that tradition; its pose and scale are interpretive, not a surviving reconstruction. The open ground around it leaves room for people to gather and pass.');
 cue('olive',...P.olive.cue,'The olive recalls Athena and the traditions of the city. A sanctuary was also a place to pause, exchange news and remember older stories. This planted rest place is an interpretation, rather than an excavated garden plan.');
 cue('altar',...P.altar.cue,'Worship happened outside as well as inside temples. Altars and offerings made open courts purposeful. This modest ceremonial setting suggests preparation and dedication without recreating a specific ancient ritual.');
 let meshes=0,triangles=0;root.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});root.userData.assetBudget={meshes,triangles,newLights:0,newNPCs:0,newUpdates:0};root.userData.staticOnly=true;return root;
}
