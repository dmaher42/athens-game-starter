import {installPropylaea} from './propylaeaIntegration.js';
import {createHellenisticSanctuary} from './hellenisticSanctuary.js';
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {ACROPOLIS} from './acropolisLayout.js';
import {getParthenonStone,makeParthenonColumnGeometry} from '../features/parthenonArchitecture.js';
import {createLabelSprite} from './demoTour.js';

// UV-only projection: positions, indices and structural support stay unchanged.
function masonryUV(geometry,offset={x:0,y:0,z:0}){
 const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+offset.x,y=p.getY(i)+offset.y,z=p.getZ(i)+offset.z;
  const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));
  uv.setXY(i,(ny>nx&&ny>nz?x:nx>nz?z:x)/6.4,(ny>nx&&ny>nz?z:y)/2.4);
 }uv.needsUpdate=true;return geometry;
}
function masonryMaterial(){
 let map=null;
 if(typeof document!=='undefined'){
  const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#99968b';ctx.fillRect(0,0,512,256);
  for(let row=0;row<4;row++)for(let col=-1;col<5;col++){const v=Math.round(184+Math.sin(row*31+col*7)*5);ctx.fillStyle=`rgb(${v+3},${v+1},${v-7})`;const x=col*128+(row%2?64:0);ctx.fillRect(x+1,row*64+1,126,62);ctx.fillStyle='rgba(255,255,240,.10)';ctx.fillRect(x+2,row*64+2,124,1);}
  // Low contrast grain, not deep mortar or projecting decorative blocks.
  const data=ctx.getImageData(0,0,512,256);for(let i=0;i<data.data.length;i+=4){const grain=((i*13>>>2)%7)-3;for(let k=0;k<3;k++)data.data[i+k]+=grain;}ctx.putImageData(data,0,0);
  map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.name='Acropolis masonry courses';
 }
 return new THREE.MeshStandardMaterial({name:'Acropolis retaining masonry',color:0xd3d0c5,map,roughness:1,metalness:0,envMapIntensity:.06});
}
export async function createAcropolisPrecinct(parent,{terrain,seaLevel}){
 const root=new THREE.Group();root.name='AcropolisPrecinct';root.userData.acropolis=true;parent.add(root);
 const sample=(x,z)=>terrain.userData.getHeightAt(x,z),b=ACROPOLIS.bounds,top=seaLevel+ACROPOLIS.heightAboveSea+.7,pieces=[],caps=[];
 function wall(x0,z0,x1,z1,ox,oz){
  const length=Math.hypot(x1-x0,z1-z0),count=Math.ceil(length/3),angle=Math.atan2(x1-x0,z1-z0);
  for(let i=0;i<count;i++){
   const t=(i+.5)/count,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t;
   const bottom=Math.min(sample(x,z)-1,sample(x+ox*4,z+oz*4)-1),height=Math.max(1.4,top-bottom);
   const g=new THREE.BoxGeometry(1.2,height,length/count+.04);g.rotateY(angle);g.translate(x,bottom+height/2,z);pieces.push(g);
   const cap=new THREE.BoxGeometry(1.42,.2,length/count+.08);cap.rotateY(angle);cap.translate(x,top+.1,z);caps.push(cap);
  }
 }
 const outline=ACROPOLIS.precinctOutline;
 for(let i=0;i<outline.length;i++){
  const a=outline[i],c=outline[(i+1)%outline.length],dx=c[0]-a[0],dz=c[1]-a[1],length=Math.hypot(dx,dz),ox=dz/length,oz=-dx/length;
  if(a[0]===b.west&&c[0]===b.west&&Math.max(a[1],c[1])>ACROPOLIS.gate.z+5.5&&Math.min(a[1],c[1])<ACROPOLIS.gate.z-5.5){
   wall(b.west,Math.max(a[1],c[1]),b.west,ACROPOLIS.gate.z+5.5,ox,oz);
   wall(b.west,ACROPOLIS.gate.z-5.5,b.west,Math.min(a[1],c[1]),ox,oz);
  }else wall(...a,...c,ox,oz);
 }
 const retaining=new THREE.Mesh(masonryUV(mergeGeometries(pieces)),masonryMaterial());retaining.name='AcropolisRetainingWalls';retaining.castShadow=true;retaining.receiveShadow=true;root.add(retaining);
 const coping=new THREE.Mesh(mergeGeometries(caps),getParthenonStone());coping.name='AcropolisWallCoping';coping.receiveShadow=true;root.add(coping);
 // The coarse terrain cell beside the old promenade remains unchanged. This
 // solid retained sanctuary terrace is architectural support, not a second
 // terrain mesh or a competing height sampler.
 const terraceBottom=Math.min(sample(-159,-13),sample(-114,-13),sample(-159,2),sample(-114,2))-1;
 const terraceTop=seaLevel+ACROPOLIS.heightAboveSea;
 const terrace=new THREE.Mesh(new THREE.BoxGeometry(47,terraceTop-terraceBottom,17),retaining.material);
 masonryUV(terrace.geometry,{x:-136.5,y:(terraceTop+terraceBottom)/2,z:-5.5});
 terrace.name='NorthSanctuaryTerrace';terrace.position.set(-136.5,(terraceTop+terraceBottom)/2,-5.5);terrace.receiveShadow=true;terrace.userData.groundSurface='building';root.add(terrace);
 const gate=new THREE.Group();gate.name='AcropolisWestGateway';gate.userData.assetSlot={...ACROPOLIS.gatewayAsset};gate.position.set(ACROPOLIS.gate.x,sample(ACROPOLIS.gate.x,ACROPOLIS.gate.z),ACROPOLIS.gate.z);root.add(gate);
 const columnGeometry=makeParthenonColumnGeometry(5.8),columns=new THREE.InstancedMesh(columnGeometry,getParthenonStone(),4),dummy=new THREE.Object3D(),footings=[];let index=0;
 for(const x of[-2,2])for(const z of[-5.5,5.5]){dummy.position.set(x,0,z);dummy.updateMatrix();columns.setMatrixAt(index++,dummy.matrix);const drop=gate.position.y-sample(gate.position.x+x,gate.position.z+z);if(drop>.03){const g=new THREE.BoxGeometry(1.8,drop+.15,1.8);g.translate(x,-(drop+.15)/2+.05,z);footings.push(g);}}columns.instanceMatrix.needsUpdate=true;columns.castShadow=true;columns.receiveShadow=true;columns.name='GatewayDoricColumns';gate.add(columns);
 if(footings.length){const feet=new THREE.Mesh(mergeGeometries(footings),getParthenonStone());feet.name='GatewayRockFootings';feet.receiveShadow=true;gate.add(feet);}
 const beam=new THREE.Mesh(new THREE.BoxGeometry(5.4,.65,13.2),getParthenonStone());beam.position.y=6.1;beam.castShadow=true;beam.receiveShadow=true;gate.add(beam);
 const triangle=new THREE.Shape();triangle.moveTo(-6.8,0);triangle.lineTo(0,1.35);triangle.lineTo(6.8,0);triangle.closePath();
 const roofGeometry=new THREE.ExtrudeGeometry(triangle,{depth:5.6,bevelEnabled:false,steps:1});roofGeometry.translate(0,0,-2.8);roofGeometry.rotateY(Math.PI/2);
 const roof=new THREE.Mesh(roofGeometry,getParthenonStone());roof.name='AcropolisGatewayPediment';roof.position.y=6.43;roof.castShadow=true;roof.receiveShadow=true;gate.add(roof);
 const cue=new THREE.Group();cue.name='AgoraAcropolisDirection';cue.position.set(-120,sample(-120,18),18);cue.userData.noCollision=true;
 const post=new THREE.Mesh(new THREE.BoxGeometry(.13,1.8,.13),new THREE.MeshStandardMaterial({color:0x625546,roughness:1}));post.position.y=.9;cue.add(post);
 const label=createLabelSprite('ACROPOLIS  /  PARTHENON',0xb7b0a0,{x:5.6,y:1});label.position.y=2;cue.add(label);cue.traverse(o=>{o.userData.noCollision=true;o.userData.noCull=true;});root.add(cue);
 const gatewayFallback=new THREE.Group();gatewayFallback.name='GatewayProceduralFallback';for(const child of [...gate.children])gatewayFallback.add(child);gate.add(gatewayFallback);
 createHellenisticSanctuary(root,{terrain,seaLevel});
 root.userData.period=ACROPOLIS.period;
 await installPropylaea(gate,{terrain,seaLevel,foundationMaterial:retaining.material});
 root.userData.layoutOwner='acropolisLayout.js';root.userData.gateClearWidth=9.5;
 return root;
}
