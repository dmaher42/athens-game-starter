import assert from 'node:assert/strict';
import {COURT_STREET_LIFE,CITY_STREETS,NEIGHBOURHOODS} from '../src/world/neighbourhoodLayout.js';
globalThis.document={createElement:()=>({getContext:()=>null})};
const {createCourtStreetLife}=await import('../src/world/courtStreetLife.js');
let meshes=0,triangles=0,solid=0;
for(const kind of ['household','packing']){const {root,cue,text}=createCourtStreetLife(kind,{groundAt:(x,z)=>x*.01+z*.02});assert.equal(cue.userData.interactable,true);assert.equal(cue.userData.noCollision,true);assert.ok(text.length>80);let used='';root.userData.interactor={showDialogue:s=>used=s};cue.userData.onUse();assert.equal(used,text);root.traverse(o=>{assert.ok(!o.isLight);if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;if(!o.userData.noCollision)solid++;assert.equal(o.castShadow,false);assert.ok(o.position.toArray().every(Number.isFinite));}});}
assert.ok(meshes<80);assert.ok(triangles<6000);assert.ok(solid>0&&solid<35);assert.equal(Object.keys(COURT_STREET_LIFE).length,2);assert.equal(CITY_STREETS.length,19);assert.equal(NEIGHBOURHOODS.length,5);console.log({pass:true,meshes,triangles,solid,lights:0,newNPCs:0,newUpdateLoops:0});
