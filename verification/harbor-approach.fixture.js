// Test-only approach planning. Authored pier sections own the route; the existing
// collider and PlayerController prove that each complete approach can be walked.
import * as THREE from 'three';
import {Capsule} from 'three/examples/jsm/math/Capsule.js';
import {PlayerController} from '../src/controls/PlayerController.js';

function pierRoutes(harbor) {
  harbor.updateWorldMatrix(true,true);
  const routes=[];
  harbor.traverse(pier=>{
    if(pier.name!=='HarborPier')return;
    const sections=pier.children.filter(o=>o.name==='HarborDockSection');
    if(sections.length<2)return;
    const inner=sections.at(-1),outer=sections[0];
    const deck=inner.getObjectByName('HarborPierDeck');
    if(!deck)return;
    routes.push({line:new THREE.Line3(inner.getWorldPosition(new THREE.Vector3()),outer.getWorldPosition(new THREE.Vector3())),deckY:new THREE.Box3().setFromObject(deck,true).max.y});
  });
  return routes;
}

function standingPose(point,{collider,marker,height,radius,deckY}) {
  const ray=new THREE.Raycaster(new THREE.Vector3(point.x,marker.y+8,point.z),new THREE.Vector3(0,-1,0),0,16);
  ray.firstHitOnly=true;
  const hit=ray.intersectObject(collider.mesh)[0];
  if(!hit||hit.face.normal.y<Math.cos(THREE.MathUtils.degToRad(50)))return null;
  // Keep anchors on the existing walking surface, never on top of cargo/roofs.
  if(Math.abs(hit.point.y-deckY)>.5)return null;
  const floor=hit.point.y;
  for(const [dx,dz]of [[radius,0],[-radius,0],[0,radius],[0,-radius]]){
    ray.ray.origin.set(point.x+dx,marker.y+8,point.z+dz);
    const support=ray.intersectObject(collider.mesh)[0];
    if(!support||Math.abs(support.point.y-floor)>.1)return null;
  }
  const expanded=radius+.04,foot=floor+.03;
  const capsule=new Capsule(new THREE.Vector3(point.x,foot+expanded,point.z),new THREE.Vector3(point.x,foot+height-expanded,point.z),expanded);
  if(collider.capsuleIntersect(capsule))return null;
  return [point.x,floor+height/2+.03,point.z];
}

export function walkHarborSegment(player,target,{step=dt=>player.update(dt),setForward=value=>{player.input.forward=value;},minFootY=-Infinity}={}) {
  const goal=new THREE.Vector3(...target),camera=player.camera;
  if(!camera)throw Error('Approach requires the normal camera-relative movement path');
  const initialDistance=Math.hypot(player.position.x-goal.x,player.position.z-goal.z);
  const limit=Math.min(6000,Math.ceil(initialDistance/player.moveSpeed*60)+240);
  let frames=0,minFoot=Infinity,best=initialDistance,stalled=0;
  const check=()=>{
    const foot=player.capsule.start.y-player.radius;minFoot=Math.min(minFoot,foot);
    if(player.flying||foot<minFootY)throw Error('Approach left its supported on-foot route at '+player.position.toArray()+'; foot='+foot+'; minimum='+minFootY);
  };
  setForward(true);
  try{
    while(Math.hypot(player.position.x-goal.x,player.position.z-goal.z)>.22){
      camera.position.copy(player.position).add(new THREE.Vector3(0,2,0));camera.lookAt(goal.x,camera.position.y,goal.z);camera.updateMatrixWorld();
      step(1/60);frames++;check();
      const distance=Math.hypot(player.position.x-goal.x,player.position.z-goal.z);
      if(distance<best-.08){best=distance;stalled=0;}else stalled++;
      if(frames>limit||stalled>90)throw Error('Approach is blocked at '+player.position.toArray()+' toward '+goal.toArray()+'; no teleport around the obstruction');
    }
  }finally{setForward(false);}
  for(let n=0;n<16;n++){step(1/60);check();}
  if(!player.grounded||player.flying)throw Error('Approach did not settle grounded/on foot');
  if(Math.hypot(player.position.x-goal.x,player.position.z-goal.z)>.65)throw Error('Approach did not reach its standing point');
  return {frames,minFootY:minFoot,position:player.position.toArray()};
}

export function executeHarborApproach(player,plan,driver={}) {
  if(player.flying)throw Error('Fixture must not override flight to pass an approach');
  player.input.resetKeys?.();player.velocity.set(0,0,0);player.grounded=false;
  player.position.fromArray(plan.start);player.syncCapsuleToObject();
  if(player.env.capsuleIntersect(player.capsule))throw Error('Verified approach anchor became obstructed');
  const step=driver.step??(dt=>player.update(dt));
  driver.setForward?.(false);
  for(let n=0;n<10;n++)step(1/60);
  if(!player.grounded)throw Error('Approach anchor is unsupported');
  const result=walkHarborSegment(player,plan.target,{...driver,minFootY:plan.deckY-.1});
  const marker=new THREE.Vector3(...plan.marker);
  if(player.position.distanceTo(marker)>plan.range)throw Error('Approach is outside the actual interaction range');
  if(!(player.position.y>marker.y+.75&&player.position.y<marker.y+1.4))throw Error('Approach does not share the marker support height');
  return {...result,distance:player.position.distanceTo(marker)};
}

export function planHarborApproach({harbor,marker,collider,height=1.8,radius=.35,terrainHeightSampler=null,interactionRange=4}) {
  if(!harbor||!collider?.boundsTree)throw Error('Approach needs the actual authored harbour and ready collision BVH');
  const point=marker.isVector3?marker.clone():new THREE.Vector3(...marker);
  const routes=pierRoutes(harbor).map(route=>({...route,projection:route.line.closestPointToPoint(point,true,new THREE.Vector3())}));
  routes.sort((a,b)=>a.projection.distanceToSquared(point)-b.projection.distanceToSquared(point));
  const rejected=[];
  for(const route of routes){
    const axis=route.line.delta(new THREE.Vector3()),length=axis.length();axis.normalize();
    // One fixed inshore anchor per authored pier. Never spawn beyond a blocker.
    const start=standingPose(route.line.start,{collider,marker:point,height,radius,deckY:route.deckY});
    if(!start){rejected.push('inshore anchor obstructed/unsupported');continue;}
    for(const offset of [0,.6,-.6,1.2,-1.2]){
      const t=THREE.MathUtils.clamp(route.projection.clone().sub(route.line.start).dot(axis)+offset,0,length);
      const candidate=route.line.start.clone().addScaledVector(axis,t);
      const target=standingPose(candidate,{collider,marker:point,height,radius,deckY:route.deckY});
      if(!target){rejected.push('standing point obstructed/unsupported');continue;}
      if(new THREE.Vector3(...target).distanceTo(point)>interactionRange-.1)continue;
      const plan={start,target,marker:point.toArray(),range:interactionRange,deckY:route.deckY,route:[route.line.start.toArray(),route.line.end.toArray()]};
      const input={forward:false,consumeLookDelta:()=>({yaw:0,pitch:0})},camera=new THREE.PerspectiveCamera();
      const probe=new PlayerController(input,collider,{height,radius,camera,terrainHeightSampler});probe.cameraControlledExternally=true;
      try{plan.proof=executeHarborApproach(probe,plan);return plan;}catch(error){rejected.push(error.message);}
    }
  }
  throw Error('No physically reachable supported approach within interaction range: '+[...new Set(rejected)].join('; '));
}
