import {CatmullRomCurve3,Vector3} from 'three';
// This compressed landmark is Athens-inspired, not an excavated-site plan.
export const GREAT_THEATRE={x:-70,z:-147,innerRadius:7.5,rowDepth:.9,rowRise:.35,rows:14,gangwayWidth:1.3,outerRadius:23,stage:{z:-10.5,width:15,depth:4,height:.45},approach:[[-180,-78],[-180,-115],[-150,-126],[-118,-137],[-95,-148.7]]};
// The northern bank joins the existing hill; entrances keep their old width.
export function theatreShoulderRadius(angle){return GREAT_THEATRE.outerRadius+3+9*Math.pow(Math.max(0,Math.sin(angle)),1.8);}
export const THEATRE_SANCTUARY={x:-62,z:-177,approach:[[-95,-148.7],[-96,-154],[-97,-160],[-88,-170],[-68,-173],[-65,-177]]};
const approachSamples=new CatmullRomCurve3(GREAT_THEATRE.approach.map(([x,z])=>new Vector3(x,0,z)),false,'catmullrom',.2).getSpacedPoints(96);
export function theatreReserved(x,z){
 const dx=x-GREAT_THEATRE.x,dz=z-GREAT_THEATRE.z;
 if(Math.hypot(x-THEATRE_SANCTUARY.x,z-THEATRE_SANCTUARY.z)<8)return true;
 for(let i=1;i<THEATRE_SANCTUARY.approach.length;i++){const a=THEATRE_SANCTUARY.approach[i-1],b=THEATRE_SANCTUARY.approach[i],vx=b[0]-a[0],vz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*vx+(z-a[1])*vz)/(vx*vx+vz*vz||1)));if(Math.hypot(x-a[0]-t*vx,z-a[1]-t*vz)<9)return true;}
 if((dz>=-4&&Math.hypot(dx,dz)<GREAT_THEATRE.outerRadius+5)||(Math.abs(dx)<13&&dz>=-24&&dz< -4))return true;
 // Reserve every intervening segment, including room for adjacent lot footprints.
 for(let i=1;i<approachSamples.length;i++){const a=approachSamples[i-1],b=approachSamples[i],vx=b.x-a.x,vz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*vx+(z-a.z)*vz)/(vx*vx+vz*vz||1)));if(Math.hypot(x-a.x-t*vx,z-a.z-t*vz)<12)return true;}
 return false;
}

export function theatreHeightAtRadius(r){const d=GREAT_THEATRE,row7=d.innerRadius+7*d.rowDepth;if(r<=row7)return Math.max(0,(r-d.innerRadius)/d.rowDepth*d.rowRise);if(r<row7+d.gangwayWidth)return 7*d.rowRise;return Math.min(d.rows*d.rowRise,7*d.rowRise+(r-row7-d.gangwayWidth)/d.rowDepth*d.rowRise);}

