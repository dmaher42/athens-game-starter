import * as THREE from 'three';

// Facade details for the existing house/rowhouse prefabs. Their original solid
// box remains the collision owner. No extra building shell, rooms or update loop.
let palette;
const boxGeometry=new THREE.BoxGeometry(1,1,1);
const potGeometry=new THREE.LatheGeometry([[0,0],[.14,.02],[.23,.16],[.24,.34],[.13,.48],[.12,.55]].map(p=>new THREE.Vector2(...p)),10);

function plasterGrain(){
 if(typeof document==='undefined')return null;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
 const ctx=canvas.getContext('2d');if(!ctx)return null;
 ctx.fillStyle='#e4e2d8';ctx.fillRect(0,0,128,128);
 for(let i=0;i<950;i++){
  const x=(i*47)%128,y=(i*71+Math.floor(i/128)*19)%128;
  ctx.fillStyle=i%2?'rgba(100,94,78,.035)':'rgba(255,255,248,.045)';
  ctx.fillRect(x,y,1+(i%3===0?1:0),1);
 }
 const map=new THREE.CanvasTexture(canvas);map.name='Quiet residential lime plaster';map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;return map;
}

function material(color,type,map=null){
 const m=new THREE.MeshStandardMaterial({color,map,roughness:1,metalness:0,envMapIntensity:.15});m.userData.materialType=type;return m;
}

export function getResidentialPalette(){
 if(!palette){
  const grain=plasterGrain();
  palette={plaster:[0xc7bca8,0xbcb49f,0xc4bdae].map((c,i)=>material(c,'residential-plaster-'+i,grain)),stone:material(0x9e9787,'residential-stone'),wood:[material(0x71543d,'residential-timber'),material(0x61503e,'residential-dark-timber')],recess:material(0x444437,'residential-recess'),repair:material(0xb9b19e,'residential-repair',grain),clay:material(0xa77554,'residential-clay')};
 }
 return palette;
}

export function residentialStyle(sample=0){
 const n=Math.max(0,Math.min(.999999,Number.isFinite(sample)?sample:0));
 return Math.floor(n*3);
}

export function residentialDoorX(w,v){return v===0?-w*.14:v===1?w*.16:0;}

export function addResidentialFacade(root,{w,d,h,variant=0,rowhouse=false}){
 const p=getResidentialPalette(),v=variant%3;
 const detail=new THREE.Group();detail.name='ResidentialFacadeDetails';detail.userData.noCollision=true;root.add(detail);
 const front=d/2,wood=p.wood[v%2];
 const box=(name,mat,x,y,z,width,height,depth)=>{
  const o=new THREE.Mesh(boxGeometry,mat);o.name=name;o.position.set(x,y,z);o.scale.set(width,height,depth);o.castShadow=false;o.receiveShadow=true;o.userData.noCollision=true;o.userData.noCull=true;detail.add(o);return o;
 };
 const doorWidth=Math.min(rowhouse?1.05:1.15,w*.29),doorHeight=Math.min(2.12,h-.45);
 const doorX=residentialDoorX(w,v);
 const jamb=v===1?wood:p.stone;
 box('ResidentialStoneSocle',p.stone,0,.19,0,w+.018,.38,d+.018);
 box(rowhouse?'RowhouseStreetDoor':'HouseStreetDoor',wood,doorX,doorHeight/2,front+.055,doorWidth,doorHeight,.075);
 // Two quiet plank seams and a bracing bar read at walking distance.
 for(const dx of[-.2,.2])box('DoorPlankSeam',p.recess,doorX+dx*doorWidth,doorHeight/2,front+.097,.018,doorHeight-.1,.012);
 if(v!==0)box('DoorBrace',p.wood[0],doorX,doorHeight*.33,front+.11,doorWidth-.12,.08,.04);
 for(const side of[-1,1])box('DoorJamb',jamb,doorX+side*(doorWidth/2+.075),doorHeight/2,front+.07,.13,doorHeight+.12,.16);
 box('DoorLintel',jamb,doorX,doorHeight+.12,front+.09,doorWidth+.42,.18,.21);
 box('WornDoorThreshold',p.stone,doorX,.045,front+.1,doorWidth+.3,.09,.3);
 const windowY=Math.min(h-.65,2.52),windowXs=v===2?[-w*.31,w*.31]:[v===0?w*.27:-w*.28];
 for(const [i,x]of windowXs.entries()){
  const width=v===2?.55:.72,height=v===2?.5:.72;
  box('HighWindowRecess',p.recess,x,windowY,front+.025,width+.12,height+.12,.025);
  box('TimberWindowShutter',wood,x+(v===1?.1:0),windowY,front+.065,width,height,.07);
  box('ShutterJoin',p.wood[1],x,windowY,front+.108,.035,height-.06,.025);
 }
 // One bounded repair patch or household vessel varies the frontage without
 // a per-house prop pile or another material layer over the whole building.
 if(v===1){
  const shape=new THREE.Shape();shape.moveTo(-.55,0);shape.lineTo(.5,0);shape.lineTo(.58,.38);shape.lineTo(.28,.73);shape.lineTo(-.38,.65);shape.closePath();
  const patch=new THREE.Mesh(new THREE.ShapeGeometry(shape),p.repair);patch.name='SmallLimeRepair';patch.position.set(-doorX,.38,front+.012);patch.userData.noCollision=true;patch.userData.noCull=true;patch.receiveShadow=true;detail.add(patch);
 }else if(v===0){
  const pot=new THREE.Mesh(potGeometry,p.clay);pot.name='HouseholdStoragePot';pot.position.set(doorX+doorWidth/2+.48,.02,front+.19);pot.userData.noCollision=true;pot.userData.noCull=true;pot.receiveShadow=true;detail.add(pot);
 }
 root.userData.residentialFacade={version:1,variant:v,doorX,enterable:false};
 return detail;
}

