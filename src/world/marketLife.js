import {NEIGHBOURHOODS,COURT_STREET_LIFE} from './neighbourhoodLayout.js';

// Authored short work routes on the existing counter/court geometry. No new
// people or world state: Application supplies these to its existing residents.
export function foodSellerRoutine(place){
 const[x,,z]=place.station,yaw=place.facingYaw??0;
 return{id:'agora-food-seller',speed:.55,stops:[
  {id:'bread',x,z,wait:12,yaw,action:'tend'},
  {id:'olives',x:x+Math.cos(yaw)*4,z:z-Math.sin(yaw)*4,wait:10,yaw,action:'tend'},
 ]};
}

export function tradingPorterRoutine(){
 const court=NEIGHBOURHOODS.find(p=>p.id==='traders'),detail=COURT_STREET_LIFE.traders,x=court.x+detail.x,z=court.z+detail.z;
 return{id:'trading-court-porter',speed:.65,stops:[
  {id:'packing',x:x-1.1,z:z-.9,wait:11,yaw:Math.atan2(1.1,.9),action:'sort'},
  {id:'lane',x:x-4.3,z:z-4,wait:0},
  {id:'collection',x:court.x+4,z:court.z-7,wait:8,yaw:-Math.PI/2,action:'check'},
  {id:'lane',x:x-4.3,z:z-4,wait:0},
 ]};
}

export function porterWorkLine(state){
 if(state?.stopId==='packing'&&state.action==='sort')return 'I am checking the seals before the next load leaves this bench. Oil jars go down to the storehouse by the quays; smaller baskets change hands here. I can stop a moment if you need the way.';
 if(state?.stopId==='collection'&&state.action==='check')return 'This is the collection end of my round. The western lane joins Olive Court and the Agora; the road south returns to the quays. A porter learns a city by the weight of each journey.';
 return 'One more basket between the packing bench and the collection point. I will wait while we talk. For the harbour, follow the southern road; for the shared table, take the western lane towards the Agora.';
}
