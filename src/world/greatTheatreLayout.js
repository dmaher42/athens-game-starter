import {CatmullRomCurve3,Vector3} from 'three';
// This compressed landmark is Athens-inspired, not an excavated-site plan.
export const GREAT_THEATRE={x:-24,z:-150,innerRadius:7.5,rowDepth:.9,rowRise:.35,rows:14,gangwayWidth:1.3,outerRadius:23,stage:{z:-10.5,width:15,depth:4,height:.45},approach:[[-180,-78],[-180,-115],[-115,-130],[-54,-141],[-49,-151.7]]};
const approachSamples=new CatmullRomCurve3(GREAT_THEATRE.approach.map(([x,z])=>new Vector3(x,0,z)),false,'catmullrom',.2).getSpacedPoints(96);
export function theatreReserved(x,z){
 const dx=x-GREAT_THEATRE.x,dz=z-GREAT_THEATRE.z;
 if((dz>=-4&&Math.hypot(dx,dz)<GREAT_THEATRE.outerRadius+5)||(Math.abs(dx)<13&&dz>=-24&&dz< -4))return true;
 // Reserve every intervening segment, including room for adjacent lot footprints.
 for(let i=1;i<approachSamples.length;i++){const a=approachSamples[i-1],b=approachSamples[i],vx=b.x-a.x,vz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*vx+(z-a.z)*vz)/(vx*vx+vz*vz||1)));if(Math.hypot(x-a.x-t*vx,z-a.z-t*vz)<12)return true;}
 return false;
}

export function theatreHeightAtRadius(r){const d=GREAT_THEATRE,row7=d.innerRadius+7*d.rowDepth;if(r<=row7)return Math.max(0,(r-d.innerRadius)/d.rowDepth*d.rowRise);if(r<row7+d.gangwayWidth)return 7*d.rowRise;return Math.min(d.rows*d.rowRise,7*d.rowRise+(r-row7-d.gangwayWidth)/d.rowDepth*d.rowRise);}
