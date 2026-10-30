import * as THREE from 'three';
import {getResidentialPalette} from './residentialFacades.js';
import {residentialPocketPoint} from './neighbourhoodLayout.js';
const cube=new THREE.BoxGeometry(1,1,1),stem=new THREE.CylinderGeometry(.016,.022,.38,4),leaf=new THREE.ConeGeometry(.10,.26,5);
const cloth=new THREE.MeshStandardMaterial({color:0xbeb49d,roughness:1,side:THREE.DoubleSide}),herbs=new THREE.MeshStandardMaterial({color:0x73774e,roughness:1});

export function addResidentialStreetPocket(building,{frontage:f,sample}){
 const root=new THREE.Group();root.name='ResidentialStreetPocket_'+f.kind;building.add(root);const p=getResidentialPalette(),base=sample(f.x,f.z);
 const ground=(x,z)=>{const w=residentialPocketPoint(f,x,z);return sample(w.x,w.z)-base;};
 const box=(name,mat,x,y,z,w,h,d,solid=false)=>{const o=new THREE.Mesh(cube,mat);o.name=name;o.position.set(x,ground(x,z)+y,z);o.scale.set(w,h,d);o.receiveShadow=true;o.castShadow=false;o.userData.noCollision=!solid;o.userData.noCull=true;root.add(o);return o;};
 // Sample short wall sections independently. The 2.1 m gate aligns with the
 // existing decorative doorway; the original solid house remains unenterable.
 for(const x of[-4.2,4.2])for(const z of[4.1,5.3])box('ResidentialYardSide',p.stone,x,.29,z,.34,.58,1.18,true);
 for(const[a,b]of[[-4.2,f.doorX-1.05],[f.doorX+1.05,4.2]])box('ResidentialYardFront',p.stone,(a+b)/2,.28,5.9,b-a,.56,.34,true);
 if(f.kind==='shade'){
  const canopy=new THREE.Mesh(new THREE.PlaneGeometry(2.35,1.55),cloth);canopy.name='HouseholdLinenShade';canopy.rotation.x=-Math.PI/2;canopy.position.set(f.doorX,ground(f.doorX,4.35)+2.4,4.35);canopy.userData.noCollision=true;canopy.receiveShadow=true;root.add(canopy);
  for(const x of[f.doorX-1.1,f.doorX+1.1])box('ShadeSupport',p.wood[0],x,1.19,5.05,.065,2.38,.065);
  box('HouseholdSeat',p.wood[1],-2.95,.48,4.3,1.25,.12,.48,true);for(const x of[-3.4,-2.5])box('SeatFoot',p.wood[1],x,.23,4.3,.13,.46,.4,true);
 }else{
  for(const x of[-3.7,-2.5])box('HerbRackPost',p.wood[0],x,.75,4.15,.07,1.5,.07);
  box('HerbDryingRail',p.wood[0],-3.1,1.5,4.15,1.4,.07,.07);
  for(let i=0;i<5;i++){const x=-3.57+i*.23;const stalk=new THREE.Mesh(stem,p.wood[0]);stalk.position.set(x,ground(x,4.15)+1.23,4.15);stalk.userData.noCollision=true;stalk.userData.noCull=true;root.add(stalk);for(const dx of[-.055,.055]){const sprig=new THREE.Mesh(leaf,herbs);sprig.rotation.z=Math.PI;sprig.position.set(x+dx,ground(x,4.15)+1.08,4.15);sprig.userData.noCollision=true;sprig.userData.noCull=true;root.add(sprig);}}
  box('FoldedLinen',cloth,-3.1,.1,4.5,.85,.14,.5);
 }
 const cue=new THREE.Group();cue.name='ResidentialPocketCue_'+f.kind;const noticeX=f.kind==='herbs'?-3.1:-2.95,noticeZ=f.kind==='herbs'?4.15:4.56;cue.position.set(noticeX,ground(noticeX,noticeZ)+(f.kind==='herbs'?1.35:.48),noticeZ);const notice=new THREE.Mesh(cube,p.wood[1]);notice.scale.set(.4,.2,.035);notice.userData.noCollision=true;notice.userData.noCull=true;cue.add(notice);cue.userData.noCollision=true;cue.userData.interactable=true;cue.userData.interactionRange=3;
 cue.userData.onUse=()=>{let scene=root;while(scene.parent)scene=scene.parent;scene.userData.interactor?.showDialogue(f.kind==='herbs'?'Cuttings hang in small bundles where the air can reach them. The garden keeper checks this household rack on the way back from North Garden. This small yard opens onto the lane; the house itself is private.':'A little shade and a bench make room for neighbours to stop before returning home. The low walls mark a forecourt, while the gate keeps the lane and doorway clear. This house is private; the household in Olive Court welcomes visitors.');};root.add(cue);
 return{root,cue,gate:residentialPocketPoint(f,f.doorX,5.9)};
}




