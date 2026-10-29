import * as THREE from 'three';
import {createLabelSprite} from './demoTour.js';

// Static details only. Existing city placement, collisions and interactor own
// their lifecycle; no daily simulation, extra ground or save state.
const materials={stone:new THREE.MeshStandardMaterial({color:0xa49b87,roughness:1}),wood:new THREE.MeshStandardMaterial({color:0x795c42,roughness:1}),clay:new THREE.MeshStandardMaterial({color:0xae7351,roughness:1}),cloth:new THREE.MeshStandardMaterial({color:0xc9bda2,roughness:1,side:THREE.DoubleSide}),rope:new THREE.MeshStandardMaterial({color:0x9e8964,roughness:1}),water:new THREE.MeshStandardMaterial({color:0x658b87,roughness:.5})};
const cube=new THREE.BoxGeometry(1,1,1),pole=new THREE.CylinderGeometry(1,1,1,8),jar=new THREE.LatheGeometry([[0,0],[.12,.02],[.29,.21],[.35,.51],[.25,.79],[.11,.93],[.12,1]].map(p=>new THREE.Vector2(...p)),12),basin=new THREE.LatheGeometry([[0,0],[.25,0],[.48,.15],[.54,.38],[.48,.39],[.42,.17],[0,.08]].map(p=>new THREE.Vector2(...p)),14),ring=new THREE.TorusGeometry(.33,.035,5,14),disc=new THREE.CircleGeometry(.42,16);

// Shared quiet limestone for this working court only; other prefab defaults stay intact.
export const COURT_STREET_MASONRY=materials.stone;
COURT_STREET_MASONRY.name='TradingCourtLimestone';
COURT_STREET_MASONRY.userData.materialType='courtStone';

export function createCourtStreetLife(kind,{groundAt=()=>0}={}){
 const root=new THREE.Group();root.name='CourtStreetLife_'+kind;
 const mesh=(geo,mat,x,y,z,sx=1,sy=sx,sz=sx,solid=false)=>{const o=new THREE.Mesh(geo,materials[mat]);o.position.set(x,y+groundAt(x,z),z);o.scale.set(sx,sy,sz);o.receiveShadow=true;o.castShadow=false;o.userData.noCollision=!solid;o.userData.noCull=true;root.add(o);return o;};
 const box=(mat,x,y,z,w,h,d,solid=false)=>mesh(cube,mat,x,y,z,w,h,d,solid);
 const bench=(x,z,w=2.6)=>{box('wood',x,.82,z,w,.12,.85,true);for(const dx of[-w*.4,w*.4])for(const dz of[-.28,.28])box('wood',x+dx,.4,z+dz,.12,.8,.12,true);};
 let label,text,cue;
 if(kind==='household'){
  for(const x of[-1.25,1.25])box('stone',x,.4,-.75,1.8,.8,.25,true);
  box('stone',-1,.18,.2,1.3,.36,1.15,true);mesh(basin,'clay',-1,.37,.2);
  const water=mesh(disc,'water',-1,.64,.2);water.rotation.x=-Math.PI/2;
  bench(.95,.1,1.45);
  for(let i=0;i<3;i++)box('cloth',.95,.92+i*.075,.1,1.05,.07,.58);
  for(const x of[-1.9,1.9])box('wood',x,1.25,-.38,.08,2.5,.08,true);
  const line=mesh(pole,'rope',0,2.32,-.38,.018,3.8,.018);line.rotation.z=Math.PI/2;
  // Static cloth folds, no physics rope or animation loop.
  for(const x of[-.95,.5]){const cloth=box('cloth',x,1.78,-.35,.95,1.08,.035);cloth.rotation.x=.08;for(const dx of[-.28,.28])box('wood',x+dx,2.32,-.35,.055,.1,.065);}
  mesh(jar,'clay',1.9,0,.55,.55);
  label='HOUSEHOLD WORK YARD';text='Fresh cloth dries beside a shared basin. The homes around Olive Court use the fountain in the square. Along the north side, an open gate leads to a household preparing for evening visitors.';cue=[.5,.9,.72];
 }else if(kind==='packing'){
  bench(0,0,2.7);
  for(const x of[-.85,.05,.85]){mesh(jar,'clay',x,.9,-.05,.5);box('cloth',x,1.405,-.05,.11,.055,.11);}
  for(const x of[-.55,.55])box('wood',x,.12,-1.25,.16,.24,1.35,true);
  box('wood',0,.29,-1.25,1.5,.1,1.3,true);
  for(const z of[-1.62,-.88])box('wood',0,.5,z,1.4,.36,.12,true);
  for(const x of[-.35,.35])mesh(jar,'clay',x,.35,-1.25,.62);
  for(const x of[-.7,.7]){const tie=mesh(pole,'rope',x,.7,-1.25,.025,.9,.025);tie.rotation.x=Math.PI/2;}
  for(let i=0;i<3;i++){const coil=mesh(ring,'rope',1.85,.055+i*.045,-.6,.8);coil.rotation.x=Math.PI/2;}
  for(const x of[-.35,.35])box('wood',x,.94,.28,.22,.06,.4);
  box('wood',-.1,1.13,.27,.045,.4,.045);box('wood',-.1,1.34,.27,.7,.04,.04);
  label='PORTERS - PACKING BENCH';text='These sealed oil jars are waiting for a porter. The southward road leads to the quays and storehouse; the western lane leads towards Olive Court and the Agora. Trading Court is where the loads change hands.';cue=[-1.7,.85,.2];
 }else throw new Error('Unknown court street-life pocket: '+kind);
 const sign=new THREE.Group();sign.name='CourtStreetCue_'+kind;sign.position.set(cue[0],groundAt(cue[0],cue[2])+cue[1],cue[2]);sign.userData.noCollision=true;sign.userData.interactable=true;sign.userData.interactionRange=3.2;sign.userData.streetLifeKind=kind;sign.userData.onUse=()=>{let scene=root;while(scene.parent)scene=scene.parent;scene.userData.interactor?.showDialogue(text);};
 const plaque=new THREE.Mesh(new THREE.BoxGeometry(.6,.32,.06),materials.wood);plaque.userData.noCollision=true;plaque.userData.noCull=true;sign.add(plaque);
 const title=createLabelSprite(label,0xbeb49a,{x:2.8,y:.52});title.position.y=1.3;sign.add(title);root.add(sign);
 return{root,cue:sign,text};
}
