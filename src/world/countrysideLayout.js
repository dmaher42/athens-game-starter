// Authored northern transition. Pure data consumed by terrain appearance,
// existing city placement and cartography; no extra ground or simulation.
export const COUNTRYSIDE_TRAILS=[{id:'garden-field-walk',type:'path',width:1.8,points:[[-85,210],[-83,234],[-65,249],[-43,250]]}];
export const COUNTRYSIDE={
 field:[[-66,238],[-24,241],[-20,273],[-62,270]],
 walls:[[[-66,238],[-24,241]],[[-24,241],[-20,273]],[[-20,273],[-62,270]],[[-62,270],[-64,254]],[[-65,245],[-66,238]]],
 olives:[[-120,222],[-118,237],[-104,246],[-98,258],[-113,264],[-127,252]],
 cropRows:[241,242,243,244,260,261,262,263,264,265,266,267],
 cue:[-65,249],
};
export function isCountrysideReserved(x,z){return x>-134&&x<-14&&z>232&&z<282||x>-134&&x<-101&&z>218&&z<282;}
export function cultivatedWeight(x,z){const p=COUNTRYSIDE.field;let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const[a,b]=p[i],[c,d]=p[j];if((b>z)!==(d>z)&&x<(c-a)*(z-b)/(d-b)+a)inside=!inside;}return inside?Math.min(1,Math.max(0,Math.min(x+66,-20-x,z-238,273-z)/4)):0;}

