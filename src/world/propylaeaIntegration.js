import * as THREE from 'three';
import {createGLTFLoader} from '../utils/glbSafeLoader.js';
import {joinPath,resolveBaseUrl} from '../utils/baseUrl.js';
import {ACROPOLIS} from './acropolisLayout.js';

let gatewayAssetsPromise;
export function preloadPropylaea(){
 if(!gatewayAssetsPromise){
  gatewayAssetsPromise=createGLTFLoader().then(loader=>Promise.all([
   loader.loadAsync(joinPath(resolveBaseUrl(),ACROPOLIS.gatewayAsset.path)),
   loader.loadAsync(joinPath(resolveBaseUrl(),ACROPOLIS.gatewayAsset.collisionPath)),
  ]));
  // A failed optional preload must not become an unhandled rejection. The
  // installer below retains the old visible/collidable gateway on failure.
  gatewayAssetsPromise.catch(()=>{});
 }
 return gatewayAssetsPromise;
}

// One imported visual and one invisible simplified physics proxy. The original
// gate remains available until both supplied GLBs have loaded and validated.
export async function installPropylaea(gate,{terrain,seaLevel,foundationMaterial}){
 const config=ACROPOLIS.gatewayAsset;
 const fallback=gate.getObjectByName('GatewayProceduralFallback');
 if(fallback&&!fallback.getObjectByName('FallbackProcessionalPath')){
  // If the visual file is unavailable, show a real walkable central ramp with
  // the old portal. Do not leave the model's excavated bedrock as a dead end.
  const route=new THREE.Group();route.name='FallbackProcessionalPath';route.position.set(-gate.position.x,-gate.position.y,-gate.position.z);fallback.add(route);
  const datum=seaLevel+ACROPOLIS.heightAboveSea-config.exitRise,top=seaLevel+ACROPOLIS.heightAboveSea;
  const start=config.originX-2.4*config.scale,end=config.originX+13.55*config.scale;
  const shape=new THREE.Shape();shape.moveTo(start,datum-.25);shape.lineTo(end,datum-.25);shape.lineTo(end,top);shape.lineTo(start,datum);shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:3.2,steps:1,bevelEnabled:false});geometry.translate(0,0,-26.6);
  const ramp=new THREE.Mesh(geometry,foundationMaterial);ramp.name='FallbackGatewayRamp';ramp.receiveShadow=true;ramp.userData.groundSurface='building';route.add(ramp);
  const landing=new THREE.Mesh(new THREE.BoxGeometry(ACROPOLIS.gate.x+2.2-end,.25,3.2),foundationMaterial);landing.name='FallbackGatewayLanding';landing.position.set((end+ACROPOLIS.gate.x+2.2)/2,top-.125,-25);landing.receiveShadow=true;landing.userData.groundSurface='building';route.add(landing);
 }
 let timer;
 try{
  const load=preloadPropylaea();
  const [visualAsset,collisionAsset]=await Promise.race([load,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Gateway asset load timed out')),5000);})]);
  const visual=visualAsset.scene.clone(true),collision=collisionAsset.scene.clone(true);
  if(!visual?.getObjectByName('EXIT_EAST')||!visual.getObjectByName('ENTRY_WEST')||!collision)throw new Error('Gateway asset contract missing');
  const assembly=new THREE.Group();assembly.name='PropylaeaBlenderAssembly';
  assembly.position.set(config.originX-gate.position.x,seaLevel+ACROPOLIS.heightAboveSea-config.exitRise-gate.position.y,config.originZ-gate.position.z);
  visual.name='PropylaeaBlenderVisual';visual.scale.setScalar(config.scale);visual.userData.noCollision=true;
  visual.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  collision.name='PropylaeaCollision';collision.scale.setScalar(config.scale);
  const hidden=new THREE.MeshBasicMaterial({visible:false});
  collision.traverse(o=>{if(o.isMesh){o.material=hidden;o.castShadow=false;o.receiveShadow=false;o.userData.physicsOnly=true;}});
  assembly.add(visual,collision);gate.add(assembly);gate.updateWorldMatrix(true,true);
  // Fit the imported building's real low crepis/wing footprints to the site's
  // slope. These are masonry foundations, not a duplicate gateway or terrain.
  const datum=seaLevel+ACROPOLIS.heightAboveSea-config.exitRise;
  for(const name of['01_Platform_and_processional_route','06_North_wing_Pinakotheke','07_South_wing_open_porch']){
   const part=visual.getObjectByName(name);if(!part)continue;const bounds=new THREE.Box3().setFromObject(part),top=name.startsWith('01_')?datum-.13:datum;
   const h=terrain.userData.getHeightAt,bottom=Math.min(h(bounds.min.x,bounds.min.z),h(bounds.max.x,bounds.min.z),h(bounds.min.x,bounds.max.z),h(bounds.max.x,bounds.max.z))-.2;
   if(bottom>=top)continue;
   const footing=new THREE.Mesh(new THREE.BoxGeometry(bounds.max.x-bounds.min.x,top-bottom,bounds.max.z-bounds.min.z),foundationMaterial);
   footing.name='PropylaeaFooting_'+name;footing.position.set((bounds.max.x+bounds.min.x)/2-config.originX,(top+bottom)/2-datum,(bounds.max.z+bounds.min.z)/2-config.originZ);footing.receiveShadow=true;footing.userData.groundSurface='building';assembly.add(footing);
  }
  // Disable both visible and collider collection of the old gate atomically.
  if(fallback)fallback.visible=false;
  gate.userData.assetStatus='loaded';gate.userData.assetSource='Original Blender Propylaea v01';gate.userData.assetScale=config.scale;
  gate.userData.assetLocators=Object.fromEntries(['ENTRY_WEST','GATE_THRESHOLD','EXIT_EAST'].map(name=>[name,visual.getObjectByName(name).getWorldPosition(new THREE.Vector3()).toArray()]));
  return true;
 }catch(error){
  if(fallback)fallback.visible=true;gate.userData.assetStatus='procedural-fallback';gate.userData.assetError=String(error);console.warn('[Acropolis] Using existing procedural gateway:',String(error));return false;
 }finally{clearTimeout(timer);}
}
