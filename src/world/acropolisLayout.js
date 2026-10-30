import {AGORA_LAYOUT,agoraXZ} from './cityCivicLayout.js';
import {CatmullRomCurve3,Vector3} from 'three';
// Canonical design coordinates for this game's compressed, Athens-inspired hill.
// Existing terrain/city/landmark owners consume this; it creates no scene/state.
export const ACROPOLIS={
  "id": "sacred-temple",
  "x": -45,
  "z": -65,
  "heightAboveSea": 13.5,
  "bounds": {
    "west": -160,
    "east": 0,
    "south": -105,
    "north": -15
  },
  "temple": {
    "width": 20,
    "depth": 45,
    "columnHeight": 10.2,
    "rotation": 1.5707963267948966,
    "colX": 8,
    "colZ": 17
  },
  "gate": {
    "x": -160,
    "z": -25,
    "width": 9
  },
  "period": "Hellenistic-inspired, approximately 150–140 BC",
  "northCourt": {
    "west": -160,
    "east": -122,
    "south": -3,
    "north": 3
  },
  "nikeBastion": {
    "west": -170,
    "east": -160,
    "south": -46,
    "north": -34
  },
  "sites": {
    "erechtheion": {
      "x": -125,
      "z": -6,
      "width": 16,
      "depth": 9
    },
    "nike": {
      "x": -166,
      "z": -40,
      "width": 6,
      "depth": 8
    },
    "dedication": {
      "x": -143,
      "z": -8
    }
  },
  "precinctOutline": [[-160,-105],[-140,-109],[-115,-112],[-89,-109],[-62,-112],[-35,-106],[-15,-102],[-4,-91],[1,-77],[-2,-58],[-6,-39],[-6,-22],[-12,-15],[-113,-15],[-113,3],[-160,3],[-160,-34],[-170,-34],[-170,-46],[-160,-46]],
  "gatewayAsset": {
    "path": "models/landmarks/acropolis/propylaia-v1.glb",
    "collisionPath": "models/landmarks/acropolis/propylaia-collision-v1.glb",
    "originX": -171.4,
    "originZ": -25,
    "scale": 0.65,
    "exitRise": 1.56,
    "entryAxis": "world +X",
    "rotationY": 0
  },
  "visit": [
    -29,
    -50.8
  ],
  "ramp": [[AGORA_LAYOUT.x,AGORA_LAYOUT.z,2.5],[-127,36,2.5],[-142,36,2.5],[-152,8,3.8],[-166,8,4.8],[-173,-6,7],[-181,-12,9],[-181,-25,10],[-178,-25,10],[-173.35,-25,11.94],[-162.625,-25,13.5],[-157.1,-25,13.5]],
  "sacredWay": [agoraXZ(),[-127,36],[-142,36],
    [
      -152,
      8
    ],
    [
      -166,
      8
    ],
    [
      -173,
      -6
    ],
    [
      -181,
      -12
    ],
    [
      -181,
      -25
    ],
    [
      -178,
      -25
    ],
    [
      -173.35,
      -25
    ],
    [
      -162.625,
      -25
    ],
    [
      -157.1,
      -25
    ],
    [
      -156.4,
      -25
    ],
    [
      -156.4,
      -21.5
    ],
    [
      -156.4,
      -17.2
    ],
    [
      -130,
      -16.8
    ],
    [
      -95,
      -16.8
    ],
    [
      -65,
      -24
    ],
    [
      -15,
      -40
    ],
    [
      -15,
      -65
    ]
  ],
  "residentialBypass": [agoraXZ(),[-127,36],[-143,36],
    [
      -170,
      8
    ],
    [
      -184,
      -8
    ],
    [
      -184,
      -55
    ],
    [
      -180,
      -78
    ]
  ],
  "sign": [
    -173,
    -5
  ],
  "enlargementVersion": 1,
  "sanctuaryOffsetX": -90
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
// Cache the same curved approach rather than grading straight chord shortcuts.
const rampCurve=new CatmullRomCurve3(ACROPOLIS.ramp.map(([x,z,h])=>new Vector3(x,h,z)),false,'catmullrom',.2);
const rampSamples=rampCurve.getPoints(96).map(p=>[p.x,p.z,p.y]);
export function nearestAcropolisRamp(x,z){
 let best={distance:Infinity,height:0};
 for(let i=1;i<rampSamples.length;i++){
  const a=rampSamples[i-1],b=rampSamples[i],dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);
  const distance=Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);
  if(distance<best.distance)best={distance,height:a[2]+(b[2]-a[2])*t};
 }return best;
}
// Signed distance to the existing sanctuary perimeter; positive is inside.
export function acropolisBoundaryDistance(x,z){
 const points=ACROPOLIS.precinctOutline;let inside=false,distance=Infinity;
 for(let i=0,j=points.length-1;i<points.length;j=i++){
  const a=points[j],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);
  distance=Math.min(distance,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));
  if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }
 return inside?distance:-distance;
}
export function shapeAcropolisGround(x,z,baseHeight,seaLevel){
 const b=ACROPOLIS.bounds;
 const edge=acropolisBoundaryDistance(x,z);
 // Preserve the separate, already-supported northern sanctuary terrace.
 const main=(1-smooth(b.north-1,b.north+6,z));
 const weight=smooth(-6,1,edge)*main;
 let height=baseHeight+(seaLevel+ACROPOLIS.heightAboveSea-baseHeight)*weight;
 // Low bedrock irregularity on the same mesh, fading out before any plateau floor.
 const rock=(1-smooth(-1,2,edge))*smooth(-14,-5,edge)*main;
 height+=rock*(.45*Math.sin(x*.43+z*.21)+.22*Math.sin(z*.77-x*.18));
 // Local retained lobes share the existing height field. A tight north falloff
 // finishes before the Agora court; do not raise the whole city-facing slope.
 for(const site of[ACROPOLIS.northCourt,ACROPOLIS.nikeBastion]){
  const northern=site===ACROPOLIS.northCourt;
  const w=smooth(site.west-3,site.west,x)*(1-smooth(northern?site.east-1:site.east,northern?site.east:site.east+3,x))*smooth(northern?site.south+1:site.south-3,northern?site.south+3:site.south,z)*(1-smooth(site.north,site.north+2,z));
  if(w>0)height=Math.max(height,height+(seaLevel+ACROPOLIS.heightAboveSea-height)*w);
 }
 const r=nearestAcropolisRamp(x,z),rampWeight=(1-smooth(10,22,r.distance))*(1-smooth(-155,-125,x));
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
 if(x<ACROPOLIS.bounds.west+5&&z<25&&z>-120){for(let i=1;i<ACROPOLIS.residentialBypass.length;i++){const a=ACROPOLIS.residentialBypass[i-1],c=ACROPOLIS.residentialBypass[i],dx=c[0]-a[0],dz=c[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);if(Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)<3+padding)bypass=true;}}
 const annex=[ACROPOLIS.northCourt,ACROPOLIS.nikeBastion].some(r=>x>r.west-padding&&x<r.east+padding&&z>r.south-padding&&z<r.north+padding);
 const buildingCourt=x>-160-padding&&x<-113+padding&&z>-15-padding&&z<3+padding;
 const gatewayReserve=x>-182-padding&&x<-155+padding&&z>-42-padding&&z<-9+padding;
 // Keep anonymous infill out of the cultural slope between ridge and cavea.
 const southernCulturalSlope=x>-164-padding&&x<10+padding&&z>-134-padding&&z<-102+padding;
 return southernCulturalSlope||acropolisBoundaryDistance(x,z)>-padding||gatewayReserve||buildingCourt||annex||(x>b.west-padding&&x<b.east+padding&&z>b.south-padding&&z<b.north+padding)||nearestAcropolisRamp(x,z).distance<6+padding||bypass;
}

