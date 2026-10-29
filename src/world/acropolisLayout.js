// Canonical design coordinates for this game's compressed, Athens-inspired hill.
// Existing terrain/city/landmark owners consume this; it creates no scene/state.
export const ACROPOLIS={
 id:'sacred-temple',x:-40,z:-31,heightAboveSea:13.5,
 bounds:{west:-70,east:0,south:-49,north:-15},
 temple:{width:20,depth:45,columnHeight:10.2,rotation:Math.PI/2,colX:8,colZ:17},
 gate:{x:-70,z:-25,width:9},
 period:'Hellenistic-inspired, approximately 150–140 BC',
 northCourt:{west:-70,east:-32,south:-3,north:3},
 nikeBastion:{west:-80,east:-70,south:-46,north:-34},
 sites:{erechtheion:{x:-35,z:-6,width:16,depth:9},nike:{x:-76,z:-40,width:6,depth:8},dedication:{x:-53,z:-8}},
 precinctOutline:[[-70,-49],[0,-49],[0,-15],[-23,-15],[-23,3],[-70,3],[-70,-34],[-80,-34],[-80,-46],[-70,-46]],
 gatewayAsset:{path:'models/landmarks/acropolis/propylaia-v1.glb',collisionPath:'models/landmarks/acropolis/propylaia-collision-v1.glb',originX:-81.4,originZ:-25,scale:.65,exitRise:1.56,entryAxis:'world +X',rotationY:0},
 visit:[-24,-16.8],
 ramp:[[-76,8,4.8],[-83,-6,7],[-91,-12,9],[-91,-25,10],[-88,-25,10],[-83.35,-25,11.94],[-67.1,-25,13.5]],
 sacredWay:[[-30,20],[-51,20],[-66,18],[-76,8],[-83,-6],[-91,-12],[-91,-25],[-88,-25],[-83.35,-25],[-72.625,-25],[-67.1,-25],[-66.4,-25],[-66.4,-21.5],[-66.4,-17.2],[-62,-16.8],[-45,-16.8],[-24,-16.8],[-12.4,-17],[-11.6,-22.5],[-10,-31]],
 residentialBypass:[[-30,20],[-72,20],[-87,2],[-94,-8],[-94,-36],[-84,-59],[-68,-64],[-55,-60]],
 sign:[-83,-5],
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
export function nearestAcropolisRamp(x,z){
 let best={distance:Infinity,height:0};
 for(let i=1;i<ACROPOLIS.ramp.length;i++){
  const a=ACROPOLIS.ramp[i-1],b=ACROPOLIS.ramp[i],dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);
  const distance=Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);
  if(distance<best.distance)best={distance,height:a[2]+(b[2]-a[2])*t};
 }return best;
}
export function shapeAcropolisGround(x,z,baseHeight,seaLevel){
 const b=ACROPOLIS.bounds;
 const side=smooth(b.west-8,b.west+1,x)*(1-smooth(b.east-1,b.east+8,x));
 // Keep the existing theatre ground below -55 and Agora frontages above -9.
 const length=smooth(b.south-6,b.south+1,z)*(1-smooth(b.north-1,b.north+6,z));
 const weight=side*length;
 let height=baseHeight+(seaLevel+ACROPOLIS.heightAboveSea-baseHeight)*weight;
 // Local retained lobes share the existing height field. A tight north falloff
 // finishes before the Agora court; do not raise the whole city-facing slope.
 for(const site of[ACROPOLIS.northCourt,ACROPOLIS.nikeBastion]){
  const northern=site===ACROPOLIS.northCourt;
  const w=smooth(site.west-3,site.west,x)*(1-smooth(northern?site.east-1:site.east,northern?site.east:site.east+3,x))*smooth(northern?site.south+1:site.south-3,northern?site.south+3:site.south,z)*(1-smooth(site.north,site.north+2,z));
  if(w>0)height=Math.max(height,height+(seaLevel+ACROPOLIS.heightAboveSea-height)*w);
 }
 const r=nearestAcropolisRamp(x,z),rampWeight=1-smooth(3.2,9,r.distance);
 // The ramp is an operation on the same height field, not another floor mesh.
 if(rampWeight>0)height+=(seaLevel+r.height-height)*rampWeight;
 // Keep the supplied gateway's central walking ramp above its bedrock. The
 // imported collision proxy remains the only architectural support surface.
 const g=ACROPOLIS.gatewayAsset;
 if(x>g.originX-2.6*g.scale&&x<g.originX+22*g.scale&&z>-32&&z<-18){
  const localX=(x-g.originX)/g.scale;
  const floor=seaLevel+ACROPOLIS.heightAboveSea-g.exitRise+clamp((localX+2.4)/15.95,0,1)*g.exitRise;
  height=Math.min(height,floor-.12);
 }
 return height;
}
export function isAcropolisReserved(x,z,padding=0){
 const b=ACROPOLIS.bounds;
 let bypass=false;
 if(x<-70&&z<5&&z>-72){for(let i=1;i<ACROPOLIS.residentialBypass.length;i++){const a=ACROPOLIS.residentialBypass[i-1],c=ACROPOLIS.residentialBypass[i],dx=c[0]-a[0],dz=c[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);if(Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<3+padding)bypass=true;}}
 const annex=[ACROPOLIS.northCourt,ACROPOLIS.nikeBastion].some(r=>x>r.west-padding&&x<r.east+padding&&z>r.south-padding&&z<r.north+padding);
 const buildingCourt=x>-70-padding&&x<-23+padding&&z>-15-padding&&z<3+padding;
 const gatewayReserve=x>-92-padding&&x<-65+padding&&z>-42-padding&&z<-9+padding;
 return gatewayReserve||buildingCourt||annex||(x>b.west-padding&&x<b.east+padding&&z>b.south-padding&&z<b.north+padding)||nearestAcropolisRamp(x,z).distance<6+padding||bypass;
}
