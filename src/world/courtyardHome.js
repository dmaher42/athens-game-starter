import * as THREE from'three';

// One replacement for an existing residential frontage, not a second district.
export function createCourtyardHome({frontage,sample,origin}){
 const root=new THREE.Group();root.name='CourtyardHome';root.rotation.y=frontage.rotation;
 const toWorld=(x,z)=>({x:frontage.x+Math.cos(frontage.rotation)*x+Math.sin(frontage.rotation)*z,z:frontage.z-Math.sin(frontage.rotation)*x+Math.cos(frontage.rotation)*z});
 let base=-Infinity;for(const[x,z]of[[-5.5,-3],[5.5,-3],[-5.5,3],[5.5,3],[0,0]]){const p=toWorld(x,z);base=Math.max(base,sample(p.x,p.z));}base+=.045;
 root.position.set(frontage.x-origin.x,base-origin.y,frontage.z-origin.z);
 const mats={wall:new THREE.MeshStandardMaterial({color:0xc2b7a2,roughness:1}),stone:new THREE.MeshStandardMaterial({color:0xa6a18e,roughness:1}),wood:new THREE.MeshStandardMaterial({color:0x795b40,roughness:1}),tile:new THREE.MeshStandardMaterial({color:0x995f44,roughness:1}),cloth:new THREE.MeshStandardMaterial({color:0xc8b995,roughness:1,side:THREE.DoubleSide}),pot:new THREE.MeshStandardMaterial({color:0xb68058,roughness:1}),water:new THREE.MeshStandardMaterial({color:0x4e7e80,roughness:.45})};
 const box=(name,kind,x,y,z,w,h,d,parent=root,solid=true)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mats[kind]);o.name=name;o.position.set(x,y,z);o.receiveShadow=true;o.castShadow=false;o.userData.noCull=true;if(!solid)o.userData.noCollision=true;parent.add(o);return o;};
 box('HomeFloor','stone',0,-.1,0,11,.2,6);
 box('HomeWestWall','wall',-5.4,1.45,0,.2,2.9,6);box('HomeEastWall','wall',5.4,1.45,0,.2,2.9,6);box('HomeRearWall','wall',0,1.45,-2.9,11,2.9,.2);
 // Gate is centred at x=-2.3, with 2.2m clear width and no threshold lip.
 box('HomeGateLeft','wall',-4.45,1.2,2.9,2.1,2.4,.2);box('HomeGateRight','wall',2.15,1.2,2.9,6.7,2.4,.2);
 box('HomeRoomWallLeft','wall',-3.3,1.35,-.45,4.2,2.7,.18);box('HomeRoomWallRight','wall',3.3,1.35,-.45,4.2,2.7,.18);
 // Covered rear room and open courtyard; no roof over the circulation route.
 const roof=box('HomeWorkroomRoof','tile',0,2.95,-1.7,11.3,.22,2.8,root,false);roof.userData.dynamicVisibility=true;
 const window=box('HomeRoomWindow','wood',-2,1.8,-2.77,1.35,1,.08,root,false);box('HomeWindowLight','cloth',-2,1.8,-2.71,1.1,.75,.025,root,false);
 box('HomeRoomLintel','wood',0,2.65,-.45,2.4,.18,.3,root,false);
 for(const x of[-4.7,-.3])box('HomeShadePost','wood',x,1.25,1,.1,2.5,.1);
 box('HomeShadeBeam','wood',-2.5,2.5,1,4.6,.14,.14,root,false);box('HomeShadeCanopy','cloth',-2.5,2.57,1,4.6,.035,2.5,root,false);
 box('HomeCourtyardTable','wood',-3.5,.74,1.1,1.65,.12,.8);for(const x of[-4.1,-2.9])box('HomeTableLeg','wood',x,.34,1.1,.1,.68,.1);
 box('HomeCourtyardBench','wood',-3.5,.4,2,1.8,.16,.4);box('HomeWorkroomTable','wood',-3.8,.72,-1.7,1.8,.12,.7);for(const x of[-4.4,-3.2])box('HomeRoomTableLeg','wood',x,.33,-1.7,.1,.66,.1);
 box('HomeSleepingBench','wood',3.9,.3,-1.8,2.2,.4,.85);box('HomeSleepingMat','cloth',3.9,.53,-1.8,2.1,.06,.8,root,false);
 box('HomeJarShelf','wood',1.8,.75,-2.65,1.4,.12,.35);
 // A few purpose-built household details, not an inventory or physics system.
 for(const x of[1.4,2.1]){const pot=new THREE.Mesh(new THREE.CylinderGeometry(.14,.2,.4,12),mats.pot);pot.position.set(x,1,-2.6);pot.userData.noCollision=true;pot.userData.noCull=true;root.add(pot);}
 const spindle=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.65,8),mats.wood);spindle.rotation.z=.7;spindle.position.set(-3.6,.87,-1.7);spindle.userData.noCollision=true;root.add(spindle);
 const outcome=new THREE.Group();outcome.name='HomeWaterArrangement';outcome.userData.noCollision=true;outcome.userData.interactable=true;outcome.userData.interactionRange=3;root.add(outcome);
 const arrangements={};for(const key of['courtyard','room']){const g=new THREE.Group();g.name='HomeWater_'+key;g.position.set(...(key==='courtyard'?[-3.5,.82,1.1]:[-3.8,.8,-1.7]));const profile=[[0,0],[.16,0],[.24,.15],[.22,.4],[.1,.55],[.1,.65],[.13,.68]].map(([r,y])=>new THREE.Vector2(r,y));const jug=new THREE.Mesh(new THREE.LatheGeometry(profile,14),mats.pot);jug.userData.noCull=true;g.add(jug);for(const x of[.48,.8]){const cup=new THREE.Mesh(new THREE.CylinderGeometry(.12,.09,.16,10),mats.pot);cup.position.set(x,.08,0);cup.userData.noCull=true;g.add(cup);const water=new THREE.Mesh(new THREE.CircleGeometry(.1,10),mats.water);water.rotation.x=-Math.PI/2;water.position.set(x,.162,0);water.userData.noCull=true;g.add(water);}g.visible=false;outcome.add(g);arrangements[key]=g;}
 const gate=-2.3,vertices=[];const p=(x,z)=>{const w=toWorld(x,z);return new THREE.Vector3(x,z<=3.15?0:sample(w.x,w.z)+.035-base,z);};const a=p(gate-1.2,3.05),b=p(gate+1.2,3.05),c=p(gate+1.2,5.8),d=p(gate-1.2,5.8);for(const v of[a,c,b,a,d,c])vertices.push(v.x,v.y,v.z);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();const ramp=new THREE.Mesh(geo,mats.stone);ramp.name='HomeEntranceApron';ramp.receiveShadow=true;ramp.userData.noCull=true;root.add(ramp);
 const world=(x,y,z)=>{const p=toWorld(x,z);return new THREE.Vector3(p.x,base+y,p.z);};
 return{root,base,frontage,outcome,arrangements,roof,points:{gate:world(gate,0,2.5),approach:world(gate,0,5.5),host:world(2,.05,1),porter:world(2.7,.05,-.9),jar:world(1.6,.8,-2.3),roomDoor:world(0,0,-.4),courtyard:world(0,0,1)},world,actorTerrain:{userData:{getHeightAt:()=>base}}};
}
