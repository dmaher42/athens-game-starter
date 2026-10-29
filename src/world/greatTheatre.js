import * as THREE from 'three';
import{mergeGeometries}from'three/examples/jsm/utils/BufferGeometryUtils.js';
import{GREAT_THEATRE as PLAN,theatreHeightAtRadius}from'./greatTheatreLayout.js';

// Ring-sector masonry and ramps are structural walking surfaces, owned by this
// landmark. The existing terrain and its sampler remain untouched.
function sector(ri,ro,a,b,innerTop,outerTop,bottom){
 const p=[],uv=[];const v=(r,t,y)=>[Math.cos(t)*r,y,Math.sin(t)*r];
 const tri=(a,b,c)=>{p.push(...a,...b,...c);for(const q of[a,b,c])uv.push(q[0]*.2,q[2]*.2);};const quad=(a,b,c,d)=>{tri(a,b,c);tri(a,c,d);};
 const n=Math.max(1,Math.ceil((b-a)*20));for(let j=0;j<n;j++){const t=a+(b-a)*j/n,u=a+(b-a)*(j+1)/n,A=v(ri,t,innerTop),B=v(ri,u,innerTop),C=v(ro,u,outerTop),D=v(ro,t,outerTop),L=v(ri,t,bottom),M=v(ri,u,bottom),N=v(ro,u,bottom),O=v(ro,t,bottom);quad(A,B,C,D);quad(L,O,N,M);quad(A,L,M,B);quad(D,C,N,O);if(j===0)quad(A,D,O,L);if(j===n-1)quad(B,M,N,C);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
export function createGreatTheatre(parent,{terrain}={}){
 const root=new THREE.Group();root.name='GreatTheatre';root.position.set(PLAN.x,0,PLAN.z);parent.add(root);const sample=(x,z)=>terrain.userData.getHeightAt(x,z);
 let base=sample(PLAN.x,PLAN.z),minimum=base;for(let x=-9;x<=9;x+=1.5)for(let z=-12.5;z<=8;z+=1.5){if(x*x+z*z<64||Math.abs(x)<8&&z< -7){const y=sample(PLAN.x+x,PLAN.z+z);base=Math.max(base,y);minimum=Math.min(minimum,y);}}base+=.08;
 root.position.y=base;const bottom=minimum-base-.4;
 const mats={stone:new THREE.MeshStandardMaterial({color:0xa4a7a3,roughness:1}),warm:new THREE.MeshStandardMaterial({color:0x989b94,roughness:1}),edge:new THREE.MeshStandardMaterial({color:0x858c88,roughness:1}),earth:new THREE.MeshStandardMaterial({color:0x847c69,roughness:1}),sand:new THREE.MeshStandardMaterial({color:0xa49983,roughness:1}),plaster:new THREE.MeshStandardMaterial({color:0xb4b8b1,roughness:1}),wood:new THREE.MeshStandardMaterial({color:0x755238,roughness:1}),roof:new THREE.MeshStandardMaterial({color:0x8c5c48,roughness:1})};
 const parts=new Map(),architecture=[];
 // Theatre limestone variation stays in shared vertex colours: no texture,
 // shader patch, extra surface or change to structural/collision positions.
 const stoneFamilies=new Set(['stone','warm','edge','sand','plaster','earth']);
 function add(g,kind,name){
  if(stoneFamilies.has(kind)){
   const p=g.getAttribute('position'),n=g.getAttribute('normal'),colors=[];
   for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const weather=.965+.018*Math.sin(x*.73+z*.41)+.012*Math.sin(z*1.17-y*.83);
    const face=Math.abs(n.getY(i))<.35?.91:1;
    const tone=weather*face;colors.push(tone,tone,tone);
   }
   g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));mats[kind].vertexColors=true;
  }
  const m=new THREE.Mesh(g,mats[kind]);m.name=name;m.castShadow=false;m.receiveShadow=true;m.userData.noCull=true;root.add(m);architecture.push(m);if(!parts.has(kind))parts.set(kind,[]);parts.get(kind).push(m);return m;}
 function box(kind,name,x,y,z,w,h,d){const g=new THREE.BoxGeometry(w,h,d);g.translate(x,y,z);return add(g,kind,name);}
 // Circular orchestra, separated from the stage by an accessible apron.
 const orchestra=new THREE.CylinderGeometry(7.55,7.55,-bottom,64);orchestra.translate(0,bottom/2,0);add(orchestra,'sand','TheatreOrchestra');
 const bounds=[0,Math.PI/4,Math.PI/2,3*Math.PI/4,Math.PI];
 for(let i=0;i<PLAN.rows;i++){const ri=PLAN.innerRadius+i*PLAN.rowDepth+(i>=7?PLAN.gangwayWidth:0),ro=ri+PLAN.rowDepth,y=(i+1)*PLAN.rowRise;for(let wedge=0;wedge<4;wedge++){const a=bounds[wedge]+(wedge===0?.18:.09),b=bounds[wedge+1]-(wedge===3?.18:.09);add(sector(ri,ro,a,b,y,y,bottom),i%3===0?'warm':'stone','TheatreSeatingRow');}}
 const row7=PLAN.innerRadius+7*PLAN.rowDepth,outer=PLAN.innerRadius+PLAN.rows*PLAN.rowDepth+PLAN.gangwayWidth;
 add(sector(row7,row7+PLAN.gangwayWidth,0,Math.PI,7*PLAN.rowRise,7*PLAN.rowRise,bottom),'warm','TheatreMiddleGangway');
 add(sector(outer,PLAN.outerRadius,0,Math.PI,PLAN.rows*PLAN.rowRise,PLAN.rows*PLAN.rowRise,bottom),'warm','TheatreUpperGangway');
 const aisles=[[0,.18],[Math.PI/4-.09,Math.PI/4+.09],[Math.PI/2-.09,Math.PI/2+.09],[3*Math.PI/4-.09,3*Math.PI/4+.09],[Math.PI-.18,Math.PI]];
 for(const[a,b]of aisles)for(const[ri,ro]of[[PLAN.innerRadius,row7],[row7+PLAN.gangwayWidth,outer]])add(sector(ri,ro,a,b,theatreHeightAtRadius(ri),theatreHeightAtRadius(ro),bottom),'edge','TheatreGradedAisle');
 add(sector(PLAN.outerRadius-.3,PLAN.outerRadius,0,Math.PI,5.55,5.55,4.9),'stone','TheatreUpperParapet');
 for(const side of[-1,1])box('stone','TheatreGangwayEndGuard',side*(outer+.8),5.225,0,1.6,.65,.3);
 // Backfill skirt falls to the unchanged hillside around the outer masonry.
 const fill=[];for(let i=0;i<60;i++){const a=i*Math.PI/60,b=(i+1)*Math.PI/60;const p=(r,t,y)=>[Math.cos(t)*r,y,Math.sin(t)*r];const A=p(PLAN.outerRadius,a,4.9),B=p(PLAN.outerRadius,b,4.9),C=p(PLAN.outerRadius+2.5,b,sample(PLAN.x+Math.cos(b)*(PLAN.outerRadius+2.5),PLAN.z+Math.sin(b)*(PLAN.outerRadius+2.5))-base-.1),D=p(PLAN.outerRadius+2.5,a,sample(PLAN.x+Math.cos(a)*(PLAN.outerRadius+2.5),PLAN.z+Math.sin(a)*(PLAN.outerRadius+2.5))-base-.1);fill.push(...A,...B,...C,...A,...C,...D);}const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(fill,3));fg.computeVertexNormals();add(fg,'earth','TheatreBackfill');
 // Parodoi stay south of the seating ramps so entrances cannot hit their walls.
 box('warm','TheatreWestParodos',-15.5,bottom/2,-1.7,19,-bottom,3.0);box('warm','TheatreEastParodos',15,bottom/2,-1.7,18,-bottom,3.0);box('stone','TheatreEastRetainingGuard',24.1,.4,-1.7,.35,.8,3.0);
 box('stone','TheatreStage',0,(bottom+.45)/2,-10.5,15,.45-bottom,4);
 // Low pitched skene, open stage and painted timber door; no Roman colonnade.
 box('plaster','TheatreSkene',0,2.35,-13.6,15,3.8,2.2);box('wood','TheatreDoor',0,1.65,-12.47,1.7,2.4,.08);
 const roofProfile=new THREE.Shape();roofProfile.moveTo(-1.6,0);roofProfile.lineTo(0,1);roofProfile.lineTo(1.6,0);roofProfile.closePath();const roof=new THREE.ExtrudeGeometry(roofProfile,{depth:15.8,bevelEnabled:false});roof.translate(0,0,-7.9);roof.rotateY(Math.PI/2);roof.translate(0,4.25,-13.6);add(roof,'roof','TheatreSkeneRoof');
 // A single graded stage apron; collision uses the same visible geometry.
 const apron=new THREE.BufferGeometry();apron.setAttribute('position',new THREE.Float32BufferAttribute([-1.8,0,-7.2,1.8,0,-7.2,1.8,.45,-8.8,-1.8,0,-7.2,1.8,.45,-8.8,-1.8,.45,-8.8],3));apron.computeVertexNormals();add(apron,'warm','TheatreStageApron');
 box('wood','TheatrePropsTable',-5.5,1.28,-10,2.4,.13,.8);for(const x of[-6.4,-4.6])box('wood','TheatreTableLeg',x,.84,-10,.12,.78,.12);
 // One short structural entrance spur begins on the existing workshop lane;
 // it does not create a second city-wide street or terrain system.
 const points=PLAN.approach.map(([x,z])=>new THREE.Vector3(x,0,z)),curve=new THREE.CatmullRomCurve3(points,false,'catmullrom',.2),line=curve.getSpacedPoints(32),vertices=[];
 // Shared edge samples make each adjoining pair of quads meet exactly.
 // Keep the same centre curve, 3.2m width and terrain-to-parodos height blend.
 const approachHeight=p=>{const blend=1-THREE.MathUtils.smoothstep(p.distanceTo(line.at(-1)),0,10);return Math.max(sample(p.x,p.z)+.045,THREE.MathUtils.lerp(sample(p.x,p.z)+.045,base,blend));};
 const edges=line.map((point,i)=>{
  const tangent=curve.getTangentAt(i/(line.length-1)),side=new THREE.Vector3(-tangent.z,0,tangent.x).normalize().multiplyScalar(1.6);
  return[point.clone().add(side),point.clone().sub(side)].map(p=>new THREE.Vector3(p.x-PLAN.x,approachHeight(p)-base,p.z-PLAN.z));
 });
 for(let i=0;i<edges.length-1;i++){const[A,B]=edges[i],[D,C]=edges[i+1];for(const p of[A,D,C,A,C,B])vertices.push(p.x,p.y,p.z);}
 const pathGeometry=new THREE.BufferGeometry();pathGeometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));pathGeometry.computeVertexNormals();add(pathGeometry,'warm','TheatreApproach');
 // One immutable material batch per stone/timber family; source collision
 // triangles are kept separately as the authoring shapes, never re-sampled.
 for(const[k,meshes]of parts){if(meshes.length<2)continue;const geos=meshes.map(m=>m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone()),merged=mergeGeometries(geos.map(g=>{g.deleteAttribute('uv');return g;}),false);for(const g of geos)g.dispose();if(!merged)continue;const render=new THREE.Mesh(merged,mats[k]);render.name='TheatreRender_'+k;render.receiveShadow=true;render.userData.noCollision=true;render.userData.noCull=true;root.add(render);for(const m of meshes)m.layers.mask=0;}
 const props=new THREE.Group();props.name='TheatreRehearsalProps';props.userData.noCollision=true;props.visible=false;root.add(props);
 const cloth=new THREE.Mesh(new THREE.PlaneGeometry(5,1.6),new THREE.MeshStandardMaterial({color:0x8f5841,roughness:1,side:THREE.DoubleSide}));cloth.position.set(3,2.8,-12.43);props.add(cloth);
 const maskMat=new THREE.MeshStandardMaterial({color:0xc89266,roughness:1}),dark=new THREE.MeshStandardMaterial({color:0x352c24,roughness:1});for(let i=0;i<2;i++){const mask=new THREE.Mesh(new THREE.SphereGeometry(.25,12,8),maskMat);mask.scale.set(1,1.3,.3);mask.position.set(-6+i*.9,1.68,-9.9);props.add(mask);for(const side of[-1,1]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.045,6,4),dark);eye.scale.set(1,1,.3);eye.position.set(mask.position.x+side*.09,1.75,-9.82);props.add(eye);}}
 props.traverse(o=>{if(o.isMesh)o.userData.noCull=true;});
 root.updateWorldMatrix(true,true);
 const world=(x,y,z)=>new THREE.Vector3(PLAN.x+x,base+y,PLAN.z+z);
 return{root,base,props,approachCurve:curve,points:{entry:world(-21,0,-1.7),guide:world(-5,0,-5),props:world(-5.5,.45,-9),view:world(0,4.9,22)},orchestraY:base,layout:PLAN,heightAtRadius:r=>base+theatreHeightAtRadius(r)};
}
