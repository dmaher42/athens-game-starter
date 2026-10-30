import * as THREE from 'three';

// Static schematic Classical ships. Placements and water level remain owned by
// harbor.js; no animation, physics-rope loop or second asset loader lives here.
const palettes = new Map();
const fallbackWood = new THREE.MeshStandardMaterial({color:0x8b6848,roughness:0.92});
const sailMaterial = new THREE.MeshStandardMaterial({color:0xe6d7b4,roughness:0.95,side:THREE.DoubleSide});
const ropeMaterial = new THREE.LineBasicMaterial({color:0x69513a});
const bronzeMaterial = new THREE.MeshStandardMaterial({color:0x886135,metalness:0.65,roughness:0.55});
const grainMaterial = new THREE.MeshStandardMaterial({color:0xbda575,roughness:1});
const clayMaterial = new THREE.MeshStandardMaterial({color:0xa95e3b,roughness:0.9});
const poleGeometry = new THREE.CylinderGeometry(1,1,1,8);
const boxGeometry = new THREE.BoxGeometry(1,1,1);
const sackGeometry = new THREE.SphereGeometry(1,8,5);
const amphoraGeometry = new THREE.LatheGeometry([[0,0],[.15,.05],[.34,.25],[.38,.65],[.29,.88],[.13,1],[.12,1.19],[.19,1.24]].map(p=>new THREE.Vector2(...p)),10);
function palette(wood,hull,accent) {
 const base=wood||fallbackWood,key=base.uuid+':'+hull+':'+accent;
 if(!palettes.has(key)){
  const body=base.clone();body.color.set(hull);body.side=THREE.DoubleSide;
  const trim=new THREE.MeshStandardMaterial({color:accent,roughness:0.88});
  palettes.set(key,{wood:base,body,trim});
 }
 return palettes.get(key);
}
function box(group,name,size,position,material,cast=true){const mesh=new THREE.Mesh(boxGeometry,material);mesh.name=name;mesh.scale.set(...size);mesh.position.set(...position);mesh.castShadow=cast;mesh.receiveShadow=true;group.add(mesh);return mesh;}
function spar(group,name,start,end,radius,material){const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end),direction=b.clone().sub(a),mesh=new THREE.Mesh(poleGeometry,material);mesh.name=name;mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize());mesh.scale.set(radius,direction.length(),radius);mesh.castShadow=radius>.12;mesh.receiveShadow=true;group.add(mesh);return mesh;}
export function createShipHull(length,width,{slender=false}={}){
 const positions=[],indices=[],uv=[];
 const stations=[[-.5,.03,.9],[-.43,.53,.35],[-.28,.9,0],[0,1,0],[.27,.88,.1],[.43,.5,.55],[.5,.025,1.1]];
 const section=[[1,1.7],[.94,.35],[.55,-.55],[0,-.8],[-.55,-.55],[-.94,.35],[-1,1.7]];
 for(const [x,beam,rise] of stations)for(const [z,y] of section){positions.push(x*length,y+(Math.max(y,0)/1.7)*rise,z*width*.5*beam);uv.push(x+.5,(z+1)*.5);}
 for(let i=0;i<stations.length-1;i++)for(let j=0;j<section.length-1;j++){const a=i*section.length+j,b=a+section.length;indices.push(a,a+1,b+1,a,b+1,b);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingSphere();
 return geometry;
}
function rig(group,length,width,mastX,material,{furled=false}={}){
 spar(group,'Mast',[mastX,1.6,0],[mastX,10.2,0],.15,material);
 spar(group,'Yard',[mastX,8.7,-width*.72],[mastX,8.7,width*.72],.1,material);
 if(furled){box(group,'FurledSail',[.42,.45,width*1.3],[mastX,8.55,0],sailMaterial,false);}
 else {
  const geometry=new THREE.PlaneGeometry(width*1.35,5,6,4),position=geometry.attributes.position;
  for(let i=0;i<position.count;i++){const z=position.getX(i),y=position.getY(i);position.setXYZ(i,mastX+.4*Math.cos(z/(width*.675)*Math.PI*.5)*Math.cos(y/2.5*Math.PI*.5),y+6.05,z);}
  geometry.computeVertexNormals();const sail=new THREE.Mesh(geometry,sailMaterial);sail.name='SquareSail';sail.userData.noCollision=true;group.add(sail);
 }
 const points=[];
 for(const side of [-1,1])for(const x of [-length*.4,length*.4])points.push(mastX,9.8,0,x,1.8,side*width*.42);
 const ropes=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(points,3)),ropeMaterial);ropes.name='StaticStandingRigging';ropes.userData.noCollision=true;group.add(ropes);
}
function steeringOar(group,length,width,wood){
 const start=[-length*.34,2.3,width*.38],end=[-length*.53,-.2,width*.78];
 spar(group,'SteeringOar',start,end,.08,wood);
 const blade=box(group,'SteeringOarBlade',[.7,.12,1.6],end,wood,false);blade.rotation.y=-.55;blade.userData.noCollision=true;
}
function hullAndDeck(group,length,width,materials,boardingX=null){
 const hull=new THREE.Mesh(createShipHull(length,width),materials.body);hull.name='CurvedShipHull';hull.castShadow=true;hull.receiveShadow=true;group.add(hull);
 box(group,'ShipDeck',[length*.78,.2,width*.76],[0,1.6,0],materials.wood);
 for(const side of [-1,1]){
  const start=-length*.37,end=length*.37;
  const spans=side===-1&&boardingX!==null?[[start,boardingX-1.4],[boardingX+1.4,end]]:[[start,end]];
  for(const [a,b] of spans)if(b>a)box(group,'Gunwale',[b-a,.14,.13],[(a+b)/2,1.87,side*width*.39],materials.trim,false);
 }
 group.userData.deckHeight=1.7;
 if(boardingX!==null)group.userData.boardingGap={x:boardingX,side:-1,width:2.8};
 group.userData.shipDimensions={length,width,waterline:0};
}
export function createMerchantShip({woodMaterial,hull=0x355969,accent=0xb98c57}={}){
 const ship=new THREE.Group();ship.name='HarborHeroShip';ship.userData.shipType='merchant';ship.userData.historicalInterpretation='Schematic merchant vessel, not a reconstruction of a single excavated ship';
 const p=palette(woodMaterial,hull,accent);hullAndDeck(ship,22,6.8,p,0);rig(ship,22,6.8,-1,p.wood);steeringOar(ship,22,6.8,p.wood);
 const hold=box(ship,'MerchantCargoHold',[7,.12,2.8],[1,1.76,0],darkTimber,false);hold.userData.noCollision=true;
 for(const z of [-1.5,1.5])box(ship,'CargoHatchCoaming',[7.4,.28,.14],[1,1.83,z],p.trim,false);
 const sacks=new THREE.InstancedMesh(sackGeometry,grainMaterial,6),amphoras=new THREE.InstancedMesh(amphoraGeometry,clayMaterial,6),dummy=new THREE.Object3D();
 sacks.name='MerchantGrainSacks';amphoras.name='MerchantAmphoraCargo';sacks.userData.noCollision=true;amphoras.userData.noCollision=true;sacks.receiveShadow=true;amphoras.receiveShadow=true;
 for(let i=0;i<6;i++){dummy.position.set(-1+(i%3)*1.4,2.12,(i<3?-.8:.8));dummy.scale.set(.65,.48,.5);dummy.rotation.set(0,i*.2,0);dummy.updateMatrix();sacks.setMatrixAt(i,dummy.matrix);dummy.position.set(-6+(i%3)*1.15,1.7,(i<3?-1.25:1.25));dummy.scale.setScalar(.78);dummy.rotation.set(0,0,0);dummy.updateMatrix();amphoras.setMatrixAt(i,dummy.matrix);}
 sacks.computeBoundingSphere();amphoras.computeBoundingSphere();ship.add(sacks,amphoras);
 upgradeShipPresentation(ship,false,p); return ship;
}
export function createTriremeShip({woodMaterial,hull=0x314a55,accent=0xb9935c}={}){
 const ship=new THREE.Group();ship.name='HarborTrireme';ship.userData.shipType='trireme';ship.userData.oarBanks=3;
 const p=palette(woodMaterial,hull,accent);hullAndDeck(ship,28,4.4,p,-4);rig(ship,28,4.4,0,p.wood,{furled:true});steeringOar(ship,28,4.4,p.wood);
 const ram=box(ship,'BronzeRam',[3.5,.55,1.05],[14.25,.05,0],bronzeMaterial);ram.rotation.z=.04;
 const oars=new THREE.InstancedMesh(poleGeometry,p.wood,72),blades=new THREE.InstancedMesh(boxGeometry,p.wood,72),dummy=new THREE.Object3D(),direction=new THREE.Vector3();let index=0;
 oars.name='ThreeOarBanks';blades.name='OarBlades';oars.userData.noCollision=true;blades.userData.noCollision=true;
 for(let bank=0;bank<3;bank++)for(let i=0;i<12;i++)for(const side of [-1,1]){
  const start=new THREE.Vector3(-9+i*1.6+bank*.18,.9+bank*.42,side*(2.1+bank*.12)),end=new THREE.Vector3(start.x-1.65,.05,side*(4.9+bank*.6));direction.subVectors(end,start);dummy.position.copy(start).add(end).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize());dummy.scale.set(.045,direction.length(),.045);dummy.updateMatrix();oars.setMatrixAt(index,dummy.matrix);
  dummy.position.copy(end);dummy.scale.set(.2,.8,.07);dummy.updateMatrix();blades.setMatrixAt(index,dummy.matrix);index++;
 }
 oars.computeBoundingSphere();blades.computeBoundingSphere();ship.add(oars,blades);upgradeShipPresentation(ship,true,p);return ship;
}
export function createFishingSkiff({length=10,width=3.4,woodMaterial,hull=0x426b79,accent=0xb39b71}={}){
 const boat=new THREE.Group();boat.name='HarborBoat';boat.userData.shipType='fishing';const p=palette(woodMaterial,hull,accent);hullAndDeck(boat,length,width,p);steeringOar(boat,length,width,p.wood);return boat;
}
// Render-only refinements live in the existing ship factory. The original
// collision meshes keep their exact geometry/transforms and layer mask zero.
// No new boat loop, loader, textures, lights or dynamic rigging.
const presentationGeometry = new Map();
const darkTimber = new THREE.MeshStandardMaterial({color:0x493828,roughness:1});
function shipSheer(t, naval) {
 return 1.7 + (t < 0 ? (naval ? 1.7 : 1.35) : (naval ? 1.05 : .8))*Math.pow(Math.abs(t),4);
}
function shipBeam(t, naval) {
 const fullness=Math.sqrt(Math.max(0,1-Math.pow(Math.abs(t),4)));
 return Math.max(naval?.025:(t<0?.12:.025),fullness);
}
export function createShipPresentationHull(length,width,naval) {
 const key=`${length}:${width}:${naval}`;if(presentationGeometry.has(key))return presentationGeometry.get(key);
 const positions=[],uv=[],indices=[],section=[[1,1.7],[.995,1.1],[.98,.5],[.82,-.25],[.4,-.85],[0,-1.08],[-.4,-.85],[-.82,-.25],[-.98,.5],[-.995,1.1],[-1,1.7]];
 for(let i=0;i<=24;i++){const t=i/12-1,beam=shipBeam(t,naval),rise=shipSheer(t,naval)-1.7;for(const[z,y]of section){positions.push(t*length/2,y+(Math.max(0,y)/1.7)*rise,z*width*.5*beam);uv.push(i/24,(z+1)/2);}}
 for(let i=0;i<24;i++)for(let j=0;j<section.length-1;j++){const a=i*section.length+j,b=a+section.length;indices.push(a,a+1,b+1,a,b+1,b);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingSphere();presentationGeometry.set(key,geometry);return geometry;
}
function curveTimber(group,name,points,radius,material,cast=false) {
 const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,24,radius,5,false),material);mesh.name=name;mesh.castShadow=cast;mesh.receiveShadow=true;group.add(mesh);return mesh;
}
function addShipLines(ship,segments) {
 const rigging=ship.getObjectByName('StaticStandingRigging');const original=rigging.geometry.attributes.position.array;
 const geometry=new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute([...original,...segments],3));geometry.computeBoundingSphere();rigging.geometry.dispose();rigging.geometry=geometry;
}
function upgradeShipPresentation(ship,naval,p) {
 const deckMaterial=getShipDeckMaterial();ship.getObjectByName('ShipDeck').material=deckMaterial;
 const {length,width}=ship.userData.shipDimensions,details=new THREE.Group();details.name='ShipVisualDetails';details.userData.noCollision=true;ship.add(details);
 const physicalHull=ship.getObjectByName('CurvedShipHull');physicalHull.name='ShipHullCollision';physicalHull.layers.mask=0;physicalHull.userData.noCull=true;
 const hull=new THREE.Mesh(createShipPresentationHull(length,width,naval),p.body);hull.name='CurvedShipHull';hull.castShadow=true;hull.receiveShadow=true;details.add(hull);
 for(const child of ship.children)if(child.name==='Gunwale'){child.layers.mask=0;child.userData.noCull=true;}
 const lines=[],gap=ship.userData.boardingGap,mastX=naval?0:-1;
 for(const side of [-1,1]){
  const spans=side===gap.side?[[-1,(gap.x-gap.width/2)/(length/2)],[(gap.x+gap.width/2)/(length/2),1]]:[[-1,1]];
  for(const[a,b]of spans){const points=[];for(let i=0;i<=24;i++){const t=a+(b-a)*i/24;points.push([t*length/2,shipSheer(t,naval)+.08,side*width*.5*shipBeam(t,naval)]);}curveTimber(details,'SweptGunwale',points,.085,p.trim);}
  for(const h of [.55,1.2]){for(let i=0;i<24;i++){for(const t of [i/12-1,(i+1)/12-1])lines.push(t*length/2,h+(shipSheer(t,naval)-1.7)*h/1.7,side*width*.5*shipBeam(t,naval)*(h<1?.982:1.002));}}
  // Fine deck seams and edge framing are in the shared deck texture.
 }
 const stern=[[-length*.46,shipSheer(-.92,naval),0],[-length*.53,3.6,0],[-length*.51,naval?5.2:4.8,0],[-length*.43,naval?5.8:5.3,0]];
 curveTimber(details,'SweptSternpost',stern,.17,p.trim,false);
 curveTimber(details,'RaisedStem',[[length*.43,2.1,0],[length*.49,2.65,0],[length*.52,naval?3.8:3.4,0]],.15,p.trim,false);
 // Short raised end platforms sit beyond the unchanged boarding/deck aisles.
 for(const end of [-1,1])box(details,'EndPlatform',[length*.11,.16,width*.48],[end*length*.38,2.08,0],deckMaterial,false);
 // Cleats and bitts are shared low-poly instances, never physics clutter.
 const bitts=new THREE.InstancedMesh(poleGeometry,p.wood,8),dummy=new THREE.Object3D();bitts.name='MooringBitts';let n=0;
 for(const x of [-length*.31,length*.31])for(const side of [-1,1])for(const dx of [-.16,.16]){dummy.position.set(x+dx,2.02,side*width*.31);dummy.scale.set(.085,.6,.085);dummy.updateMatrix();bitts.setMatrixAt(n++,dummy.matrix);}bitts.computeBoundingSphere();details.add(bitts);
 if(naval)upgradeNavalPresentation(ship,details,p,lines);else upgradeMerchantPresentation(ship,details,p,lines);
 // Extra stays, braces, halyard and sheets share the existing single line draw.
 lines.push(mastX,9.9,0,-length*.43,3.5,0,mastX,9.9,0,length*.43,2.5,0);
 for(const side of [-1,1])lines.push(mastX,8.7,side*width*.72,-length*.25,1.9,side*width*.35);
 details.traverse(object=>{if(object.isMesh){object.userData.noCull=true;object.receiveShadow=true;}}); addShipLines(ship,lines);ship.userData.presentationVersion=2;
}
function upgradeMerchantPresentation(ship,details,p,lines) {
 const width=ship.userData.shipDimensions.width,mastX=-1,columns=14,rows=8,positions=[],uv=[],indices=[];
 const clothPoint=(u,v)=>{const z=(u-.5)*width*1.4*(.9+.1*v),y=3.6+v*5.05+.18*Math.sin(u*Math.PI)*(1-v),x=mastX+.85*Math.sin(u*Math.PI)*Math.sin(v*Math.PI);return[x,y,z];};
 for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++){positions.push(...clothPoint(x/columns,y/rows));uv.push(x/columns,y/rows);}
 for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){const a=y*(columns+1)+x,b=a+columns+1;indices.push(a,a+1,b+1,a,b+1,b);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingSphere();const sail=ship.getObjectByName('SquareSail');sail.receiveShadow=true;sail.geometry.dispose();sail.geometry=geometry;
 for(let seam=0;seam<=6;seam++)for(let row=0;row<rows;row++)for(const point of [clothPoint(seam/6,row/rows),clothPoint(seam/6,(row+1)/rows)])lines.push(point[0]+.012,point[1],point[2]);
 for(const side of [-1,1])lines.push(...clothPoint(side<0?0:1,0),5,1.9,side*2.35);
 // A low stern awning and working windlass distinguish a laden trading vessel.
 const canopy=new THREE.Mesh(new THREE.CylinderGeometry(2,2,2.8,10,1,true,0,Math.PI),sailMaterial);canopy.name='MerchantSternAwning';canopy.rotation.z=Math.PI/2;canopy.scale.set(.45,1,1);canopy.position.set(-6.8,3.2,0);details.add(canopy);
 for(const x of [-8.2,-5.4])for(const z of [-1.8,1.8])spar(details,'AwningPost',[x,1.72,z],[x,3.2,z],.055,p.wood);
 spar(details,'CargoWindlass',[5.4,2.25,-1.1],[5.4,2.25,1.1],.18,p.wood);
 for(const z of [-.8,.8])spar(details,'WindlassHandspike',[5,1.9,z],[5.8,2.6,z],.045,p.trim);
 for(const z of [-1.4,1.4])box(details,'WindlassMount',[.4,.6,.28],[5.4,1.97,z],p.trim,false);
 // Cargo lashings and hatch crosspieces leave the port boarding aisle open.
 for(const z of [-1.45,1.45])for(const x of [-2,1,4])lines.push(x,1.92,z,x,2.55,0,x,2.55,0,x,1.92,-z);
}
function upgradeNavalPresentation(ship,details,p,lines) {
 const oldRam=ship.getObjectByName('BronzeRam');oldRam.name='RamCollision';oldRam.layers.mask=0;oldRam.userData.noCull=true;
 const shape=new THREE.Shape();shape.moveTo(12.6,-.34);shape.lineTo(15.95,-.14);shape.lineTo(15.95,.14);shape.lineTo(12.6,.34);shape.closePath();const geometry=new THREE.ExtrudeGeometry(shape,{depth:.7,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.08,bevelThickness:.06});geometry.rotateX(Math.PI/2);geometry.translate(0,.42,0);
 const ram=new THREE.Mesh(geometry,bronzeMaterial);ram.name='BronzeRam';details.add(ram);
 for(const y of [-.12,.1,.32])box(details,'RamFin',[2.1,.05,.84],[14.6,y,0],bronzeMaterial,false);
 for(const side of [-1,1]){
  const spans=side===-1?[[-9.8,-5.4],[-2.6,10.3]]:[[-9.8,10.3]];
  for(const[a,b]of spans)spar(details,'RowingGalleryWale',[a,2.04,side*2.46],[b,2.04,side*2.46],.11,p.trim);
  for(const x of [10.6]){const eye=new THREE.Mesh(new THREE.CircleGeometry(.42,16),sailMaterial);eye.name='PaintedShipEye';eye.scale.y=.48;eye.position.set(x,1.7,side*(2.2*shipBeam(x/14,true)+.045));eye.rotation.y=side>0?0:Math.PI;details.add(eye);const pupil=new THREE.Mesh(new THREE.CircleGeometry(.15,12),darkTimber);pupil.position.copy(eye.position);pupil.position.z+=side*.012;pupil.rotation.copy(eye.rotation);pupil.scale.y=.8;details.add(pupil);}
 }
 const supports=new THREE.InstancedMesh(boxGeometry,p.wood,24),ports=new THREE.InstancedMesh(boxGeometry,darkTimber,72),dummy=new THREE.Object3D();supports.name='RowingGallerySupports';ports.name='ThreeBankOarPorts';let i=0,j=0;
 for(let row=0;row<12;row++)for(const side of [-1,1]){dummy.position.set(-9+row*1.6,1.6,side*2.18);dummy.scale.set(.12,.83,.6);dummy.updateMatrix();if(!(side===-1&&Math.abs(-9+row*1.6+4)<1.4))supports.setMatrixAt(i++,dummy.matrix);for(let bank=0;bank<3;bank++){dummy.position.set(-9+row*1.6+bank*.18,.9+bank*.42,side*(2.2*shipBeam((-9+row*1.6+bank*.18)/14,true)+.04+bank*.07));dummy.scale.set(.26,.14,.035);dummy.updateMatrix();ports.setMatrixAt(j++,dummy.matrix);}}
 supports.count=i;supports.computeBoundingSphere();ports.computeBoundingSphere();details.add(supports,ports);
 const oldSail=ship.getObjectByName('FurledSail');oldSail.layers.mask=0;oldSail.userData.noCull=true;
 spar(details,'RolledLinenSail',[0,8.5,-3],[0,8.5,3],.22,sailMaterial);
 for(let z=-2.6;z<=2.7;z+=.65)lines.push(-.23,8.35,z,-.23,8.72,z,.23,8.72,z,.23,8.35,z);
}





// One small shared sRGB deck texture. It replaces the material on the existing
// support mesh: no overlaid plane, extra plank meshes or changed collision UVs.
let sharedShipDeckMaterial;
function getShipDeckMaterial() {
 if(sharedShipDeckMaterial)return sharedShipDeckMaterial;
 const size=256,pixels=new Uint8Array(size*size*4),rows=12,rowHeight=size/rows;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const row=Math.floor(y/rowHeight),across=y-row*rowHeight,offset=(row*73)%128;
  const board=Math.floor((x+offset)/128),tone=((row*17+board*11)%19)-9;
  const grain=2.3*Math.sin(y*2.2+Math.sin(x*.025)*.7)+1.1*Math.sin(y*.65+x*.017);
  const seam=across<1.25||((x+offset)%128<1&&across>2&&across<rowHeight-2);
  const frame=x<2||x>253||y<2||y>253;
  const wear=3*Math.exp(-Math.pow((y-size*.5)/(size*.24),2));
  const scale=frame?.67:seam?.52:1,index=(y*size+x)*4;
  pixels[index]=Math.round((158+tone+grain+wear)*scale);
  pixels[index+1]=Math.round((101+tone*.7+grain*.8+wear)*scale);
  pixels[index+2]=Math.round((53+tone*.45+grain*.5+wear)*scale);pixels[index+3]=255;
 }
 const map=new THREE.DataTexture(pixels,size,size,THREE.RGBAFormat);map.name='SharedShipDeckPlanks';map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearMipmapLinearFilter;map.generateMipmaps=true;map.anisotropy=4;map.needsUpdate=true;
 sharedShipDeckMaterial=new THREE.MeshStandardMaterial({map,roughness:.87,metalness:0,envMapIntensity:.45});sharedShipDeckMaterial.name='WarmLongitudinalShipDeck';return sharedShipDeckMaterial;
}


// Reuse the authored trireme hull/ram/oar banks for one larger offshore galley.
// It is a schematic static sea landmark, not another boardable ship system.
export function createOffshoreGalley({woodMaterial}={}){
 const ship=createTriremeShip({woodMaterial,hull:0x30434a,accent:0x97836a});
 ship.name='OffshoreGalley';ship.userData.shipType='offshore-galley';ship.userData.noCollision=true;ship.userData.boardable=false;ship.userData.category='offshore-scenery';ship.userData.historicalInterpretation='Large schematic Greek galley inspired by oared warships, not an exact reconstruction';delete ship.userData.boardingGap;
 ship.getObjectByName('RolledLinenSail')?.removeFromParent();
 const yard=ship.getObjectByName('Yard');yard.scale.y*=1.45;
 const geometry=new THREE.PlaneGeometry(9,5.3,8,6),p=geometry.attributes.position;
 for(let i=0;i<p.count;i++){const z=p.getX(i),v=p.getY(i);p.setXYZ(i,.65*Math.cos(z/4.5*Math.PI*.5)*Math.cos(v/2.65*Math.PI*.5),v+6.05,z);}
 geometry.computeVertexNormals();geometry.computeBoundingSphere();const sail=new THREE.Mesh(geometry,sailMaterial);sail.name='GalleySquareSail';ship.add(sail);
 ship.scale.set(1.7,1.12,1.45);ship.userData.displayLength=47.6;
 ship.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;o.userData.noCull=true;}});return ship;
}
