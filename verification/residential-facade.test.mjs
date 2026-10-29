import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire}from'node:module';import{pathToFileURL,fileURLToPath}from'node:url';
const repo=fileURLToPath(new URL('../',import.meta.url)).replaceAll('\\','/').replace(/\/$/,''),require=createRequire(repo+'/package.json'),THREE=require('three');
globalThis.document={createElement:()=>({getContext:()=>null})};
const {getResidentialPalette,residentialStyle,addResidentialFacade}=await import(pathToFileURL(repo+'/src/world/residentialFacades.js'));
assert.equal(getResidentialPalette(),getResidentialPalette());assert.deepEqual([0,.4,.9].map(residentialStyle),[0,1,2]);
const results=[];
for(const variant of[0,1,2]){const root=new THREE.Group(),detail=addResidentialFacade(root,{w:8,d:7,h:3.6,variant});let meshes=0,triangles=0;detail.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;assert.equal(o.userData.noCollision,true);assert.equal(o.castShadow,false);assert.ok(o.position.toArray().every(Number.isFinite));}});assert.ok(meshes<=20);assert.ok(triangles<450);assert.equal(root.userData.residentialFacade.enterable,false);assert.ok(root.getObjectByName('HouseStreetDoor'));assert.ok(!detail.getObjectsByProperty('isLight',true).length);results.push({variant,meshes,triangles,doorX:root.userData.residentialFacade.doorX});}
assert.equal(new Set(results.map(p=>p.doorX)).size,3);console.log(results);
