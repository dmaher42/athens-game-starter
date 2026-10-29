import * as THREE from 'three';

// Static craft dressing for the existing neighbourhood courts. No extra ground,
// lights, crowd updater or collision surface: the court retains its clear routes.
const materials={
 wood:new THREE.MeshStandardMaterial({color:0x876242,roughness:1}),
 pale:new THREE.MeshStandardMaterial({color:0xc19a65,roughness:1}),
 clay:new THREE.MeshStandardMaterial({color:0xad6243,roughness:1}),
 raw:new THREE.MeshStandardMaterial({color:0x99775c,roughness:1}),
 stone:new THREE.MeshStandardMaterial({color:0x917d69,roughness:1}),
 dark:new THREE.MeshStandardMaterial({color:0x39302a,roughness:1}),
};
const box=new THREE.BoxGeometry(1,1,1),disc=new THREE.CylinderGeometry(1,1,1,12),
 bowl=new THREE.LatheGeometry([[0,0],[.12,.03],[.26,.16],[.3,.25]].map(p=>new THREE.Vector2(...p)),10),
 vessel=new THREE.LatheGeometry([[0,0],[.12,.03],[.24,.2],[.25,.45],[.14,.62],[.1,.69],[.13,.72]].map(p=>new THREE.Vector2(...p)),10);
function mesh(root,geo,mat,x,y,z,sx=1,sy=sx,sz=sx){const o=new THREE.Mesh(geo,materials[mat]);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.receiveShadow=true;o.castShadow=false;o.userData.noCull=true;o.userData.noCollision=true;root.add(o);return o;}
function timber(root,x,y,z,w,h,d){const o=mesh(root,box,'wood',x,y,z,w,h,d);o.userData.noCollision=false;return o;}
function bench(root,x,z){timber(root,x,.92,z,2.5,.15,.9);for(const a of [-1,1])for(const b of [-1,1])timber(root,x+a,.43,z+b*.3,.12,.86,.12);timber(root,x,.3,z,2.15,.1,.12);}

export const WORKSHOP_LIFE={
 potters:{label:'Clay worker',dialogue:'This grey bowl is still damp. The pale ones have dried; the red ones have survived the kiln. Touch a fresh rim too soon and a morning of work folds in your hands.'},
 weavers:{label:'Frame maker',dialogue:'A loom begins at this bench: dry timber, straight joints, then pegs. The loose pieces are a frame in waiting. I fit them here before the weavers stretch their threads.'},
};

export function createWorkshopLife(kind){
 const root=new THREE.Group();root.name='WorkshopLife_'+kind;
 if(kind==='potters'){
  bench(root,0,0);
  mesh(root,bowl,'raw',-.65,1.0,0,1.05);mesh(root,bowl,'pale',.1,1.0,0,.9);mesh(root,vessel,'clay',.8,1.0,0,.7);
  // Low hand-turned wheel and an unfinished clay body, without a per-frame motor.
  mesh(root,disc,'stone',-1.5,.25,1.2,.22,.5,.22);mesh(root,disc,'wood',-1.5,.53,1.2,.55,.09,.55);mesh(root,vessel,'raw',-1.5,.58,1.2,.65);
  // Drying rack: open supports and two shelves, visible work in progress.
  for(const x of [-1,1])timber(root,x,1, -1.3,.1,2,.1);
  for(const y of [.5,1.4]){timber(root,0,y,-1.3,2.3,.08,.5);for(let j=0;j<4;j++)mesh(root,bowl,'pale',-.8+j*.53,y+.05,-1.3,.7);}
  // Cold firing kiln: recessed dark mouth and arch frame; no glowing light/smoke.
  mesh(root,new THREE.SphereGeometry(1,12,6,0,Math.PI*2,0,Math.PI/2),'clay',2.5,.55,-.5,1.05,1.1,1.05).userData.noCollision=false;
  mesh(root,disc,'clay',2.5,.28,-.5,1.05,.55,1.05).userData.noCollision=false;
  mesh(root,box,'dark',2.5,.43,.52,.52,.62,.025);
  for(const x of [2.16,2.84])mesh(root,box,'stone',x,.42,.57,.16,.8,.12);
  mesh(root,box,'stone',2.5,.83,.57,.84,.18,.12);
  mesh(root,disc,'dark',2.5,1.65,-.5,.12,.015,.12);
  for(let i=0;i<4;i++)timber(root,3.8+i*.13,.1,-.5,.1,.14,1.1);
 }else{
  bench(root,0,0);
  for(let i=0;i<3;i++){const p=mesh(root,box,'pale',-.6+i*.48,1.04,0,.32,.08,.85);p.rotation.y=.12-i*.1;}
  // Wooden mallet, measuring cord and pegs laid out on the existing craft edge.
  timber(root,.7,1.08,.15,.07,.07,.65);mesh(root,box,'pale',.7,1.14,-.1,.35,.18,.2);
  for(let i=0;i<4;i++)mesh(root,disc,'pale',-.85+i*.16,1.06,.27,.035,.14,.035).rotation.x=Math.PI/2;
  for(const x of [-1,1]){for(const z of [.95,1.55])timber(root,x,.35,z,.15,.7,.12);timber(root,x,.74,1.25,.22,.12,1.0);}
  for(let i=0;i<3;i++)mesh(root,box,'pale',0,.87+i*.08,1.25,2.8,.07,.24);
  // Pegged loom-frame blank against the wallward side: explains this court's trade.
  for(const x of [-1,1])timber(root,x,1.2,-1.2,.18,2.4,.18);
  for(const y of [.35,2.1])timber(root,0,y,-1.2,2.2,.18,.18);
  for(const x of [-1,1])for(const y of [.35,2.1])mesh(root,disc,'pale',x,y,-1.08,.045,.08,.045).rotation.x=Math.PI/2;
  for(let i=0;i<5;i++){const shaving=mesh(root,box,'pale',-.65+i*.28,.025,.7,.2,.025,.07);shaving.rotation.y=i*1.8;}
 }
 return root;
}
