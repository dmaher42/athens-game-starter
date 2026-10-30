import fs from'node:fs';import{pathToFileURL,fileURLToPath}from'node:url';import assert from'node:assert/strict';
const r=fileURLToPath(new URL('../',import.meta.url)).replace(/[\\/]$/,'');
const THREE=await import(pathToFileURL(r+'/node_modules/three/build/three.module.js')),{createExplorableTrireme,TRIREME_VISIT_LAYOUT:L}=await import(pathToFileURL(r+'/src/world/triremeModel.js')),{EnvironmentCollider}=await import(pathToFileURL(r+'/src/env/EnvironmentCollider.js')),{PlayerController}=await import(pathToFileURL(r+'/src/controls/PlayerController.js'));
const model=createExplorableTrireme(),env=new EnvironmentCollider();env.fromStaticScene(model.physics);
const camera=new THREE.PerspectiveCamera(),input={forward:false,consumeLookDelta:()=>({yaw:0,pitch:0}),consumeFlyToggle:()=>false},player=new PlayerController(input,env,{camera});player.cameraControlledExternally=true;
const results=[];
function walk(name,points,height=2.4){player.position.set(points[0][0],height+.95,points[0][1]);player.velocity.set(0,0,0);player.syncCapsuleToObject();for(let i=0;i<45;i++)player.update(1/60);let frames=0;for(const[x,z]of points.slice(1)){input.forward=true;let n=0;while(Math.hypot(player.position.x-x,player.position.z-z)>.18){camera.position.copy(player.position).add(new THREE.Vector3(0,2,0));camera.lookAt(x,camera.position.y,z);camera.updateMatrixWorld();player.update(1/60);frames++;if(++n>1100)throw Error(name+' blocked at '+player.position.toArray()+' toward '+[x,z]);}input.forward=false;for(let i=0;i<20;i++)player.update(1/60);assert.ok(player.grounded,name+' lost support at '+player.position.toArray());}results.push({name,frames,grounded:player.grounded,position:player.position.toArray()});}
try{assert.equal(model.root.getObjectByName('170StaggeredRowingSeats').count,170);assert.equal(model.root.getObjectByName('ThreeTiers170Oars').count,170);assert.equal(L.length,36.9);assert.equal(L.beam,5.5);
walk('upper-deck-circuit',L.upperRoute);for(const [i,route]of L.lowerRoutes.entries()){walk('rowing-bay-'+i,route);walk('rowing-bay-return-'+i,[...route].reverse(),.65);}
for(const side of [-1,1]){const route=L.mastBypass.map(([x,z])=>[side*x,z]);walk('mast-bypass-'+side,route,.65);walk('mast-bypass-return-'+side,[...route].reverse(),.65);}
// A real mast obstructs the central aisle; do not assert a fictional through-corridor.
player.position.set(0,1.60,-1);player.velocity.set(0,0,0);player.syncCapsuleToObject();input.forward=true;for(let i=0;i<180;i++){camera.position.copy(player.position).add(new THREE.Vector3(0,2,0));camera.lookAt(0,camera.position.y,3);camera.updateMatrixWorld();player.update(1/60);}assert.ok(player.position.z<.1,'Player walked through the mast');
console.log(JSON.stringify({pass:true,results}));
}catch(error){throw error;}
