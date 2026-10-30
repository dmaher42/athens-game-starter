import * as THREE from 'three';
import {createAthenaParthenos} from './athenaStatue.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

let stone,roofStone,timber,blue,ivory,gold;
function surfaceTexture(roof=false){
 if(typeof document==='undefined')return null;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');
 c.fillStyle=roof?'#c7c5bb':'#d6d3c9';c.fillRect(0,0,256,256);
 for(let row=0;row<8;row++)for(let col=0;col<4;col++){
  const variation=Math.sin(row*17.1+col*7.9)*3,v=(roof?193:211)+variation;
  c.fillStyle=`rgb(${v+4},${v+2},${v-5})`;c.fillRect(col*64+(row%2?32:0),row*32,63,31);
 }
 const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.name=roof?'Parthenon pale marble tiles':'Parthenon quiet stone';return t;
}
export function getParthenonStone(){
 stone??=new THREE.MeshStandardMaterial({name:'ParthenonPentelicStone',color:0xd8d5cb,map:surfaceTexture(),roughness:.91,metalness:0,envMapIntensity:.08});return stone;
}
function materials(){
 getParthenonStone();roofStone??=new THREE.MeshStandardMaterial({name:'ParthenonMarbleRoof',color:0xc9c8bf,map:surfaceTexture(true),roughness:.94,metalness:0,envMapIntensity:.06});
 timber??=new THREE.MeshStandardMaterial({color:0x605047,roughness:.95});blue??=new THREE.MeshStandardMaterial({color:0x4b5a65,roughness:.95});ivory??=new THREE.MeshStandardMaterial({color:0xd0cab5,roughness:.88});gold??=new THREE.MeshStandardMaterial({color:0xa9925e,roughness:.72,metalness:.25,envMapIntensity:.1});
}
export function makeParthenonColumnGeometry(height){
 const shaftH=height-.5,shaft=new THREE.CylinderGeometry(.62,.75,shaftH,80,6);shaft.translate(0,shaftH/2,0);
 const p=shaft.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=p.getY(i),a=Math.atan2(z,x),entasis=1+.02*Math.sin(Math.PI*y/shaftH),flute=1-.055*(.5+.5*Math.cos(a*20));p.setX(i,x*entasis*flute);p.setZ(i,z*entasis*flute);}
 shaft.computeVertexNormals();
 const echinus=new THREE.CylinderGeometry(.91,.65,.32,32);echinus.translate(0,height-.34,0);
 const abacus=new THREE.BoxGeometry(1.72,.18,1.72);abacus.translate(0,height-.09,0);
 const geometry=mergeGeometries([shaft,echinus,abacus]);geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}
function box(parent,name,w,h,d,x,y,z,material){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
export function getParthenonInteriorLayout({width,depth,columnHeight}){
 return {width:width*.60,depth:depth*.74,wallHeight:columnHeight-.25,doorWidth:5.2,doorHeight:6,ceilingHeight:columnHeight-.40,statueZ:-depth*.74*.20,statueHeight:9.15,plinthWidth:4.6,plinthDepth:3.3};
}
export function createParthenonCella({width,depth,columnHeight,base}){
 const group=new THREE.Group();group.name='ParthenonCella';const layout=getParthenonInteriorLayout({width,depth,columnHeight}),w=layout.width,d=layout.depth,h=layout.wallHeight,t=.55,m=getParthenonStone();group.userData.interiorLayout=layout;
 box(group,'CellaSideWallWest',t,h,d,-w/2,base+h/2,0,m);box(group,'CellaSideWallEast',t,h,d,w/2,base+h/2,0,m);
 box(group,'TreasuryRearWall',w,h,t,0,base+h/2,-d/2,m);
 const door=layout.doorWidth,side=(w-door)/2;
 for(const sign of [-1,1])box(group,'CellaDoorJamb',side,h,t,sign*(door/2+side/2),base+h/2,d/2,m);
 box(group,'CellaDoorLintel',door,h-6,t,0,base+6+(h-6)/2,d/2,m);
 // The rear room is visually distinct; the main cella remains openly enterable.
 box(group,'TreasuryPartition',w,h,t,0,base+h/2,-d*.32,m);
 // The documented two-tier interior colonnade gives the cella structure and
 // scale. The central entrance/statue route remains an unobstructed aisle.
 const stations=[];for(const x of[-4.25,4.25])for(const z of[-7,-3,1,5,9,13])stations.push([x,z]);for(const x of[-2.8,2.8])stations.push([x,-10]);
 const column=makeParthenonColumnGeometry(4.4),dummy=new THREE.Object3D();
 for(const[level,y,scale]of [['Lower',base,.52],['Upper',base+4.75,.44]]){
  const columns=new THREE.InstancedMesh(column,m,stations.length);columns.name='Cella'+level+'Colonnade';
  stations.forEach(([x,z],i)=>{dummy.position.set(x,y,z);dummy.scale.set(scale,1,scale);dummy.updateMatrix();columns.setMatrixAt(i,dummy.matrix);});columns.instanceMatrix.needsUpdate=true;columns.castShadow=true;columns.receiveShadow=true;group.add(columns);
 }
 for(const level of[4.4,9.15]){for(const x of[-4.25,4.25])box(group,'InteriorEntablature',.95,.35,24,x,base+level+.175,3,m);box(group,'RearInteriorEntablature',9.3,.35,.95,0,base+level+.175,-10,m);}
 const joists=[];for(let z=-9;z<=15;z+=4){const g=new THREE.BoxGeometry(w-.3,.24,.24);g.translate(0,base+layout.ceilingHeight-.20,z);joists.push(g);}
 box(group,'CellaCofferedCeiling',w,.18,d,0,base+layout.ceilingHeight,0,m);
 const roofFrame=new THREE.Mesh(mergeGeometries(joists),new THREE.MeshStandardMaterial({color:0x65584a,roughness:.98}));roofFrame.name='CellaTimberRoofFrame';roofFrame.receiveShadow=true;group.add(roofFrame);
 return group;
}
export function finishParthenonTemple(group,{width,depth,columnHeight,base,entablatureHeight,pedimentHeight,pedimentDepth}){
 materials();
 group.traverse(o=>{if(!o.isMesh)return;let node=o,roof=false;while(node&&node!==group){if(node.name==='TempleRoof')roof=true;node=node.parent;}o.material=roof?roofStone:stone;});
 const detail=new THREE.Group();detail.name='ParthenonOriginalSculpturalInterpretation';detail.userData.noCollision=true;group.add(detail);
 // Open timber doors are parked alongside the jambs, outside the clear opening.
 for(const sign of [-1,1]){const door=box(detail,'OpenCellaDoor',.14,5.8,2.4,sign*3.2,base+2.9,depth*.37-1.2,timber);door.userData.noCollision=true;}
 const archY=base+columnHeight+entablatureHeight*.52,bars=[];
 function bar(x,z,rotation){const g=new THREE.BoxGeometry(.36,entablatureHeight*.60,.09);g.rotateY(rotation);g.translate(x,archY,z);bars.push(g);}
 for(const sign of[-1,1]){
  for(let i=0;i<17;i++)bar(sign*(width/2+.9),-depth/2+i*depth/16,Math.PI/2);
  for(let i=0;i<8;i++)bar(-width/2+i*width/7,sign*(depth/2+.9),0);
 }
 const frieze=new THREE.Mesh(mergeGeometries(bars),blue);frieze.name='RestrainedDoricFrieze';frieze.userData.noCollision=true;detail.add(frieze);
 const pedimentY=base+columnHeight+entablatureHeight;
 for(const sign of[-1,1]){
  const sculptures=new THREE.Group();sculptures.name=sign>0?'BirthOfAthenaInterpretation':'AthenaAndPoseidonInterpretation';sculptures.position.set(0,pedimentY+.12,sign*(depth/2+pedimentDepth+.06));if(sign<0)sculptures.rotation.y=Math.PI;
  detail.add(sculptures);
  for(let i=-5;i<=5;i++){
   const x=i*1.65,h=Math.max(.22,pedimentHeight*(1-Math.abs(x)/(width*.5))*.70),figure=new THREE.Group();figure.position.x=x;sculptures.add(figure);
   const body=new THREE.Mesh(new THREE.CylinderGeometry(h*.12,h*.19,h*.67,7),ivory);body.position.y=h*.37;figure.add(body);
   const head=new THREE.Mesh(new THREE.SphereGeometry(h*.14,8,6),ivory);head.position.y=h*.88;figure.add(head);
  }
 }
 // One replacement sculpture, fitted to the existing chamber contract.
 const interior=getParthenonInteriorLayout({width,depth,columnHeight});
 const athena=createAthenaParthenos({stone});athena.position.set(0,base,interior.statueZ);group.add(athena);
 const cella=group.getObjectByName('ParthenonCella'),interiorStone=new THREE.MeshStandardMaterial({name:'CellaSubduedPentelicStone',color:0xaaa28e,map:stone.map,roughness:.97,metalness:0,envMapIntensity:.035});
 const ceilingTimber=new THREE.MeshStandardMaterial({name:'CellaCofferedTimber',color:0x49423a,roughness:1,envMapIntensity:.02});
 cella?.traverse(o=>{if(o.isMesh)o.material=o.name==='CellaCofferedCeiling'||o.name==='CellaTimberRoofFrame'?ceilingTimber:interiorStone;});
 // Shade the existing top stylobate's UVs inside the cella. No floor overlay,
 // changed support mesh or city-wide lighting adjustment is introduced.
 const topStep=group.getObjectByName('StylobateStep_2');if(topStep){
  const fw=topStep.geometry.parameters.width,fd=topStep.geometry.parameters.depth,tw=256,th=512,pixels=new Uint8Array(tw*th*4);
  for(let y=0;y<th;y++)for(let x=0;x<tw;x++){
   const px=(x/(tw-1)-.5)*fw,pz=(.5-y/(th-1))*fd,edge=Math.min(interior.width/2-Math.abs(px),interior.depth/2-Math.abs(pz)),shade=THREE.MathUtils.smoothstep(edge,-.12,.55),progress=THREE.MathUtils.clamp((interior.depth/2-pz)/interior.depth,0,1),grain=Math.sin(x*.34+y*.17)*1.5;
   const v=208*(1-shade)+(151-progress*35)*shade+grain,joint=(x%32===0||y%32===0)?3:0,i=(y*tw+x)*4;pixels[i]=v-joint;pixels[i+1]=v-5-joint;pixels[i+2]=v-15-joint;pixels[i+3]=255;
  }
  const map=new THREE.DataTexture(pixels,tw,th,THREE.RGBAFormat);map.name='ParthenonCellaFloorTone';map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;
  topStep.material=new THREE.MeshStandardMaterial({name:'CellaFloorStone',color:0xffffff,map,roughness:.98,metalness:0,envMapIntensity:.025});
 }

 detail.traverse(o=>{o.userData.noCollision=true;o.userData.noCull=true;if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});
 // A gentle entrance apron shares the temple's structural owner. It replaces
 // reliance on controller auto-stepping over the 0.38m stylobate risers.
 const z0=depth/2+7.5,z1=depth/2+1.5,p=new Float32Array([-2.5,0,z0,2.5,0,z0,-2.5,base+.015,z1,2.5,base+.015,z1,-2.5,-.2,z0,2.5,-.2,z0,-2.5,-.2,z1,2.5,-.2,z1]);
 const ramp=new THREE.BufferGeometry();ramp.setAttribute('position',new THREE.BufferAttribute(p,3));ramp.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,0,2,1,2,0,0,1,0,0,2,1,2],2));ramp.setIndex([0,1,2,1,3,2,0,2,4,2,6,4,1,5,3,3,5,7,0,4,1,1,4,5,2,3,6,3,7,6,4,6,5,5,6,7]);ramp.computeVertexNormals();
 const apron=new THREE.Mesh(ramp,stone);apron.name='ParthenonEntranceApron';apron.receiveShadow=true;apron.userData.groundSurface='building';group.add(apron);
 group.userData.parthenon={columnsAcross:8,columnsAlong:17,intact:true,interpretation:true,interior};return athena;
}
