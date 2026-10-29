// Optional local routine used inside the existing citizen updater. This owns
// no scene, timer, save data or animation loop.
export function createWaypointRoutine(definition){
 const first=definition.stops[0];
 return{x:first.x,z:first.z,index:0,remaining:first.wait??0,hold:0,yaw:first.yaw??0,moving:false,phase:'working',stopId:first.id,action:first.action??'idle'};
}

export function advanceWaypointRoutine(state,definition,dt,paused=false){
 let remaining=Math.max(0,Number.isFinite(dt)?dt:0);
 const held=Math.min(state.hold,remaining);state.hold-=held;remaining-=held;
 if(paused||(held>0&&remaining<=1e-8)){state.moving=false;state.phase='paused';return state;}
 // A bounded timestep consumes dwell and travel without overshoot or endpoint
 // teleportation. Normal NPC updates are far below this defensive upper cap.
 remaining=Math.min(remaining,2);
 for(let guard=0;remaining>1e-8&&guard<8;guard++){
  const stop=definition.stops[state.index];
  if(state.remaining>0){const t=Math.min(remaining,state.remaining);state.remaining-=t;remaining-=t;state.moving=false;state.phase='working';state.stopId=stop.id;state.action=stop.action??'idle';state.yaw=stop.yaw??state.yaw;if(state.remaining>1e-8)return state;state.remaining=0;state.index=(state.index+1)%definition.stops.length;continue;}
  const target=definition.stops[state.index],dx=target.x-state.x,dz=target.z-state.z,distance=Math.hypot(dx,dz);
  if(distance<1e-6){state.remaining=target.wait??0;state.stopId=target.id;state.action=target.action??'idle';state.yaw=target.yaw??state.yaw;if(!state.remaining)state.index=(state.index+1)%definition.stops.length;continue;}
  const travel=Math.min(distance,definition.speed*remaining);state.x+=dx/distance*travel;state.z+=dz/distance*travel;state.yaw=Math.atan2(dx,dz);state.moving=true;state.phase='moving';state.stopId=target.id;state.action='walk';remaining-=travel/definition.speed;
  if(travel>=distance-1e-6){state.remaining=target.wait??0;state.stopId=target.id;state.action=target.action??'idle';state.yaw=target.yaw??state.yaw;state.moving=false;state.phase='working';if(!state.remaining)state.index=(state.index+1)%definition.stops.length;}
 }
 return state;
}
