import * as THREE from 'three';
import {createShipPresentationHull} from './harborShips.js';

// One layout contract for the on-demand visit, its geometry and navigation tests.
// Dimensions evoke Olympias, not a surveyed ancient hull reconstruction.
export const TRIREME_VISIT_LAYOUT=Object.freeze({length:36.9,beam:5.5,deck:2.4,lowerDeck:.65,entry:[0,3.35,-14.4],
 upperRoute:[[0,-14.4],[-2.15,-12],[-2.15,0],[-2.15,11.5],[0,13.5],[2.15,11.5],[2.15,0],[2.15,-12],[0,-14.4]],
 lowerRoutes:[[[0,-13.3],[0,-9.4],[0,-2]],[[0,13.3],[0,9.4],[0,2.5]]],mastBypass:[[0,-9.4],[0,-2.7],[.78,-1.5],[.78,2.5],[0,3.7],[0,9.4]],rowerCounts:[27,27,31]});

export function createExplorableTrireme(){
 const root=new THREE.Group();root.name='OlympiasInspiredTrireme';
 const visual=new THREE.Group();visual.name='TriremeVisual';visual.userData.noCollision=true;root.add(visual);
 const physics=new THREE.Group();physics.name='TriremeWalkableStructure';root.add(physics);
 const wood=new THREE.MeshStandardMaterial({color:0x805c3e,roughness:.96}),deck=new THREE.MeshStandardMaterial({color:0x9d7852,roughness:1}),dark=new THREE.MeshStandardMaterial({color:0x4d392b,roughness:1}),trim=new THREE.MeshStandardMaterial({color:0x3e5555,roughness:1}),bronze=new THREE.MeshStandardMaterial({color:0x78623c,roughness:.65,metalness:.35}),sail=new THREE.MeshStandardMaterial({color:0xd7c9ac,roughness:1,side:THREE.DoubleSide}),hidden=new THREE.MeshBasicMaterial({visible:false});

 // One small deterministic timber map, shared by hull, deck and equipment.
 // Grain and broad plank tones provide close detail without extra plank meshes.
 const pixels=new Uint8Array(256*128*4);for(let y=0;y<128;y++)for(let x=0;x<256;x++){
  const row=Math.floor(y/16),seam=y%16===0,grain=Math.sin(x*.17+Math.sin(y*.53)*2)*2+Math.sin(x*.043+y*1.7)*3;
  const tone=(row%3-1)*7+grain-(seam?19:0),offset=(y*256+x)*4;
  pixels[offset]=Math.max(0,Math.min(255,154+tone));pixels[offset+1]=Math.max(0,Math.min(255,137+tone));pixels[offset+2]=Math.max(0,Math.min(255,112+tone));pixels[offset+3]=255;
 }
 const timberMap=new THREE.DataTexture(pixels,256,128,THREE.RGBAFormat);timberMap.name='WeatheredTimberGrain';timberMap.colorSpace=THREE.SRGBColorSpace;timberMap.wrapS=timberMap.wrapT=THREE.RepeatWrapping;timberMap.repeat.set(5,1);timberMap.magFilter=THREE.LinearFilter;timberMap.minFilter=THREE.LinearMipmapLinearFilter;timberMap.generateMipmaps=true;timberMap.needsUpdate=true;
 for(const material of [wood,deck,dark]){material.map=timberMap;material.needsUpdate=true;}

 const cube=new THREE.BoxGeometry(1,1,1),pole=new THREE.CylinderGeometry(1,1,1,8);
 const add=(name,g,m,pos=[0,0,0])=>{const o=new THREE.Mesh(g,m);o.name=name;o.position.set(...pos);o.receiveShadow=true;visual.add(o);return o;};
 function solid(mesh){const proxy=new THREE.Mesh(mesh.geometry,hidden);proxy.position.copy(mesh.position);proxy.quaternion.copy(mesh.quaternion);proxy.scale.copy(mesh.scale);proxy.name=mesh.name+'Support';physics.add(proxy);return mesh;}
 function box(name,size,pos,material=wood,collide=false){const o=add(name,cube,material,pos);o.scale.set(...size);if(collide)solid(o);return o;}
 function spar(name,a,b,r,material=wood){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),v=end.clone().sub(start),o=add(name,pole,material,start.clone().add(end).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());o.scale.set(r,v.length(),r);return o;}
 // The existing shell has outward-facing triangles; expose its timber interior too.
 const hullMaterial=wood.clone();hullMaterial.side=THREE.DoubleSide;hullMaterial.color.setHex(0x79644f);deck.color.setHex(0xd3be99);trim.color.setHex(0xae9971);
 const hull=add('LongNarrowHull',createShipPresentationHull(34.9,3.65,true).clone(),hullMaterial,[0,0,-1]);hull.rotation.y=-Math.PI/2;hull.scale.y=1.3;
 for(const side of [-1,1]){
  box('OutriggerGallery',[.18,.18,23],[side*2.65,2.15,0],trim);
  box('UpperWalkway',[.85,.16,22.8],[side*2.15,2.32,0],deck,true);
  for(const x of [side*1.7,side*2.67]){box('LightDeckRail',[.065,.065,22],[x,3.03,0],dark,true);for(const z of [-11,-7,-3,1,5,9,11])box('RailUpright',[.065,.65,.065],[x,2.71,z],dark,true);}
  // Flare the existing rails around the mast working bay, keeping a real barrier.
  const edge=[[-9.35,.61],[-2.7,.61],[-1.5,1.3],[2.5,1.3],[3.7,.61],[9.35,.61]];
  for(let i=1;i<edge.length;i++)solid(spar('CrewAisleRail',[side*edge[i-1][1],1.45,edge[i-1][0]],[side*edge[i][1],1.45,edge[i][0]],.03,dark));
 }
 function platform(name,points){const shape=new THREE.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();const g=new THREE.ExtrudeGeometry(shape,{depth:.16,bevelEnabled:false});g.rotateX(-Math.PI/2);const o=add(name,g,deck,[0,2.24,0]);solid(o);}
 platform('SternWorkingDeck',[[-1.05,-16.8],[1.05,-16.8],[2.575,-11.4],[.65,-11.4],[.65,-13.3],[-.65,-13.3],[-.65,-11.4],[-2.575,-11.4]]);
 platform('BowWorkingDeck',[[-2.575,11.4],[-.65,11.4],[-.65,13.3],[.65,13.3],[.65,11.4],[2.575,11.4],[.8,15.7],[-.8,15.7]]);
 // One continuous supporting surface; the local bay is part of the existing aisle.
 const aisleShape=new THREE.Shape(),aisleEdge=[[-9.4,.48],[-2.7,.48],[-1.5,1.4],[2.5,1.4],[3.7,.48],[9.4,.48]];
 const aislePoints=[...aisleEdge.map(([z,x])=>[-x,z]),...aisleEdge.slice().reverse().map(([z,x])=>[x,z])];
 aislePoints.forEach(([x,z],i)=>i?aisleShape.lineTo(x,-z):aisleShape.moveTo(x,-z));aisleShape.closePath();
 const aisleGeometry=new THREE.ExtrudeGeometry(aisleShape,{depth:.16,bevelEnabled:false});aisleGeometry.rotateX(-Math.PI/2);
 solid(add('CrewAccessFloorWithMastBay',aisleGeometry,deck,[0,.49,0]));
 function stair(a,b){
  const w=.525,thickness=.16,vertices=[-w,a[1],a[0],w,a[1],a[0],-w,b[1],b[0],w,b[1],b[0],-w,a[1]-thickness,a[0],w,a[1]-thickness,a[0],-w,b[1]-thickness,b[0],w,b[1]-thickness,b[0]];
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex([0,2,1,1,2,3,4,5,6,5,7,6,0,1,4,1,5,4,2,6,3,3,6,7,0,4,2,2,4,6,1,3,5,3,7,5]);geometry.computeVertexNormals();solid(add('CrewAccessStair',geometry,deck));
  const from=new THREE.Vector3(0,a[1],a[0]),to=new THREE.Vector3(0,b[1],b[0]);for(let i=1;i<12;i++)box('StairTread',[1.05,.035,.13],from.clone().lerp(to,i/12).toArray(),dark);
 }
 box('SternStairLanding',[1.05,.16,.6],[0,2.32,-13.0],deck,true);box('BowStairLanding',[1.05,.16,.6],[0,2.32,13.0],deck,true);
 stair([-12.7,2.4],[-9.4,.65]);stair([9.4,.65],[12.7,2.4]);
 const seat=new THREE.BoxGeometry(.48,.075,.26),brace=new THREE.BoxGeometry(.40,.065,.09);
 const seats=new THREE.InstancedMesh(seat,deck,170),footrests=new THREE.InstancedMesh(brace,dark,170),oars=new THREE.InstancedMesh(pole,wood,170),blades=new THREE.InstancedMesh(cube,wood,170),dummy=new THREE.Object3D();let n=0;
 seats.name='170StaggeredRowingSeats';footrests.name='170FootBraces';oars.name='ThreeTiers170Oars';blades.name='170OarBlades';
 for(let tier=0;tier<3;tier++)for(const side of [-1,1])for(let i=0;i<TRIREME_VISIT_LAYOUT.rowerCounts[tier];i++){
  const count=TRIREME_VISIT_LAYOUT.rowerCounts[tier],z=(i-(count-1)/2)*.83+tier*.13;
  // The nearest bank yields to the mast bay; keep all 170 staggered places.
  const mastBay=tier===0&&z> -2.7&&z<3.7,x=side*(mastBay?1.67:.87+tier*.50),y=.90+tier*.48;
  dummy.position.set(x,y,z);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();seats.setMatrixAt(n,dummy.matrix);
  dummy.position.set(x,y-.31,z+.43);dummy.updateMatrix();footrests.setMatrixAt(n,dummy.matrix);
  const a=new THREE.Vector3(x,y+.13,z),b=new THREE.Vector3(side*(5.1+tier*.2),.12,z-1.2),d=b.clone().sub(a);
  dummy.position.copy(a).add(b).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());dummy.scale.set(.027,d.length(),.027);dummy.updateMatrix();oars.setMatrixAt(n,dummy.matrix);
  dummy.position.copy(b);dummy.scale.set(.14,.7,.045);dummy.updateMatrix();blades.setMatrixAt(n,dummy.matrix);n++;
 }
 for(const mesh of [seats,footrests,oars,blades]){mesh.computeBoundingSphere();visual.add(mesh);}
 solid(spar('MainMast',[0,.2,.5],[0,12,.5],.16));spar('MainYard',[-4.3,10.8,.5],[4.3,10.8,.5],.105);
 solid(spar('Foremast',[0,2.4,14.5],[0,7.8,15.8],.10));spar('ForeYard',[-2.05,7.4,15.6],[2.05,7.4,15.6],.075);
 const clothSeams=[];function canvas(name,width,height,y,z){
  const point=(x,v)=>[x*(.97+.06*v),y+v*height-.15*Math.cos(x/width*Math.PI)*Math.max(0,-v*2),z+Math.cos(x/width*Math.PI)*Math.cos(v*Math.PI)*.38];
  const g=new THREE.PlaneGeometry(width,height,12,8),p=g.attributes.position;for(let i=0;i<p.count;i++){const q=point(p.getX(i),p.getY(i)/height);p.setXYZ(i,q[0],q[1]-y,q[2]-z);}g.computeVertexNormals();add(name,g,sail,[0,y,z]);
  for(const face of [-1,1]){for(let seam=0;seam<=8;seam++)for(let row=0;row<8;row++){for(const v of [row/8-.5,(row+1)/8-.5]){const q=point((seam/8-.5)*width,v);q[2]+=face*.012;clothSeams.push(...q);}}for(const v of [-.5,0,.5])for(let col=0;col<12;col++)for(const x of [(col/12-.5)*width,((col+1)/12-.5)*width]){const q=point(x,v);q[2]+=face*.012;clothSeams.push(...q);}}
 }
 canvas('CreamSquareMainsail',8.3,5.2,8.0,.6);canvas('SmallForeSail',3.7,2.3,6.1,15.7);
 const sailSeams=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(clothSeams,3)),new THREE.LineBasicMaterial({color:0x9c927d}));sailSeams.name='LinenPanelSeamsAndHems';visual.add(sailSeams);
 const lines=[];function rope(a,b){lines.push(...a,...b);}
 for(const side of [-1,1])for(const z of [-10,9])rope([0,11.7,.5],[side*2.5,2.5,z]);
 for(const side of [-1,1]){rope([side*4.15,10.8,.5],[side*2.4,2.5,-8]);rope([side*4.15,5.4,.6],[side*2.4,2.5,8]);for(let i=0;i<5;i++)rope([side*(.4+i*.75),10.65,.55],[side*(.4+i*.75),5.4,.55]);}
 const rig=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(lines,3)),new THREE.LineBasicMaterial({color:0x5c4a37}));rig.name='StandingRiggingAndReefingLines';visual.add(rig);
 const ramShape=new THREE.Shape();ramShape.moveTo(-.40,-15.9);ramShape.lineTo(-.24,-18.45);ramShape.lineTo(.24,-18.45);ramShape.lineTo(.40,-15.9);ramShape.closePath();
 const ramGeometry=new THREE.ExtrudeGeometry(ramShape,{depth:.32,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:1});ramGeometry.rotateX(-Math.PI/2);add('BronzeWaterlineRam',ramGeometry,bronze,[0,-.1,0]);
 for(const y of [-.12,.06,.24]){const finGeometry=new THREE.ExtrudeGeometry(ramShape,{depth:.035,bevelEnabled:false});finGeometry.rotateX(-Math.PI/2);add('RamCutwaterFin',finGeometry,bronze,[0,y,0]);}for(const side of [-1,1]){spar('QuarterSteeringOar',[side*.9,3,-15.6],[side*1.95,-.1,-18.1],.07);box('QuarterSteeringBlade',[.35,.12,1.2],[side*1.95,-.15,-17.9],wood);}
 spar('RaisedSternPost',[0,2.8,-18.0],[0,4.8,-18.4],.09,trim);
 box('MastStep',[.62,.32,.7],[0,2.35,.5],dark);box('SmallDeckLocker',[.75,.45,.7],[.95,2.62,-14.9],dark,true);
 const seams=[];for(const side of [-1,1])for(const x of [side*1.88,side*2.15,side*2.42])seams.push(x,2.407,-11.25,x,2.407,11.25);
 visual.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(seams,3)),new THREE.LineBasicMaterial({color:0x68503c})));

 // Exposed framing follows the existing shell; all detail remains visual only.
 const ribs=[];for(let z=-10.5;z<=10.5;z+=1.75)for(const side of [-1,1]){
  const points=[[side*.47,-.7,z],[side*1.0,-.32,z],[side*1.61,.6,z],[side*1.78,2.20,z]];
  for(let i=1;i<points.length;i++)ribs.push([points[i-1],points[i]]);
 }
 const frameMesh=new THREE.InstancedMesh(pole,dark,ribs.length);frameMesh.name='InternalHullRibs';let ri=0;
 for(const[a,b]of ribs){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);dummy.position.copy(start).add(end).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());dummy.scale.set(.045,delta.length(),.045);dummy.updateMatrix();frameMesh.setMatrixAt(ri++,dummy.matrix);}frameMesh.computeBoundingSphere();visual.add(frameMesh);
 const joins=[];for(const side of [-1,1])for(let row=0;row<3;row++)for(let z=-10.4+row*.85;z<11;z+=3.4){const a=side*(1.74+row*.27),b=side*(2.00+row*.27);joins.push(a,2.408,z,b,2.408,z);}
 const joinLines=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(joins,3)),new THREE.LineBasicMaterial({color:0x5b4837}));joinLines.name='StaggeredDeckBoardEnds';visual.add(joinLines);
 // A restrained working quarterdeck: water, spare line and a furled canvas bundle.
 const clay=new THREE.MeshStandardMaterial({color:0x95664b,roughness:1}),ropeMaterial=new THREE.MeshStandardMaterial({color:0x9a8867,roughness:1});
 const jarProfile=[[0,.0],[.12,.02],[.20,.16],[.21,.37],[.13,.52],[.08,.56],[.08,.66],[.11,.68]].map(([r,y])=>new THREE.Vector2(r,y));
 add('CrewWaterJar',new THREE.LatheGeometry(jarProfile,12),clay,[-.85,2.4,-15.1]);
 for(let i=0;i<4;i++){const coil=add('CoiledMooringLine',new THREE.TorusGeometry(.20+i*.026,.018,5,24),ropeMaterial,[.85,2.44,-15.7]);coil.rotation.x=Math.PI/2;}
 const roll=add('FurledSpareCanvas',new THREE.CylinderGeometry(.16,.16,1.15,10),sail,[-1.15,2.58,-14.4]);roll.rotation.z=Math.PI/2;
 for(const x of [-1.48,-.85]){const tie=add('CanvasBinding',new THREE.TorusGeometry(.164,.014,4,12),ropeMaterial,[x,2.58,-14.4]);tie.rotation.y=Math.PI/2;}
 const blocks=new THREE.InstancedMesh(cube,dark,8);blocks.name='ShroudLashingBlocks';let bi=0;for(const side of [-1,1])for(const z of [-10,9])for(const y of [2.55,2.77]){dummy.position.set(side*2.62,y,z);dummy.rotation.set(0,0,0);dummy.scale.set(.13,.17,.12);dummy.updateMatrix();blocks.setMatrixAt(bi++,dummy.matrix);}blocks.computeBoundingSphere();visual.add(blocks);
 for(const side of [-1,1])for(const z of [-10,9])rope([side*2.62,2.55,z],[side*2.50,3.25,z]);
 rig.geometry.dispose();rig.geometry=new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(lines,3));


 // Reuse the harbour ship's continuously swept shell instead of a faceted box.
 // Its private clone may be disposed without touching the original harbour geometry.
 const shellPoints=hull.geometry.attributes.position,section=11,stations=shellPoints.count/section;
 for(const side of [-1,1]){
  for(const ratio of [1,.66]){const points=[];for(let i=0;i<stations;i++){const p=new THREE.Vector3().fromBufferAttribute(shellPoints,i*section+(side<0?10:0));p.applyMatrix4(hull.matrix.clone().compose(hull.position,hull.quaternion,hull.scale));p.y*=ratio;p.x*=ratio===1?1:1.01;points.push(p);}const curve=new THREE.CatmullRomCurve3(points);add(ratio===1?'SweptVisitGunwale':'ContinuousHullWale',new THREE.TubeGeometry(curve,48,ratio===1?.075:.045,6,false),ratio===1?trim:dark);}
 }
 const brackets=new THREE.InstancedMesh(cube,wood,26);brackets.name='WorkingRowingGalleryCrossbeams';for(let i=0;i<13;i++)for(const side of [-1,1]){dummy.position.set(side*2.13,2.12,-10.5+i*1.75);dummy.rotation.set(0,0,0);dummy.scale.set(1.08,.12,.12);dummy.updateMatrix();brackets.setMatrixAt(i*2+(side>0?1:0),dummy.matrix);}brackets.computeBoundingSphere();visual.add(brackets);
 const sternCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,4.3,-18.4),new THREE.Vector3(0,5.5,-18.5),new THREE.Vector3(0,6.0,-17.9),new THREE.Vector3(0,6.05,-17.1)]);add('SweptAphlastonStern',new THREE.TubeGeometry(sternCurve,18,.105,6,false),trim);
 for(const side of [-1,1]){
  const z=13.6,t=(z+1)/17.45,beam=Math.sqrt(1-Math.pow(t,4)),x=side*(3.65*.5*beam+.025),eye=add('PaintedWatchfulBowEye',new THREE.CircleGeometry(.32,20),sail,[x,2.0,z]);eye.rotation.y=side*Math.PI/2;eye.scale.y=.52;
  const pupil=add('BowEyePupil',new THREE.CircleGeometry(.105,14),dark,[x+side*.012,2.0,z]);pupil.rotation.copy(eye.rotation);pupil.scale.y=.75;
 }

 root.userData.dimensions={length:36.9,beam:5.5,hullBeam:3.65,extendedOarSpan:11.2};root.userData.rowers=170;
 return{root,physics,layout:TRIREME_VISIT_LAYOUT};
}
