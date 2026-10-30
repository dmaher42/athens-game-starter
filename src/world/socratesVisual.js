import * as THREE from 'three';
import {createGLTFLoader} from '../utils/glbSafeLoader.js';
import {joinPath,resolveBaseUrl} from '../utils/baseUrl.js';

// Swap only the named NPC's visual. The caller retains dialogue, identity,
// placement, interaction registration and the existing activity save record.
export function installSocratesVisual(actor,{renderer}={}){
 const fallback=new THREE.Group();fallback.name='SocratesProceduralFallback';
 for(const child of [...actor.children])fallback.add(child);
 actor.add(fallback);actor.userData.assetStatus='loading';
 let disposed=false,mixer=null,visual=null;
 const disposeModel=root=>root?.traverse(o=>{if(o.isMesh){o.geometry?.dispose();for(const material of Array.isArray(o.material)?o.material:[o.material])material?.dispose();}});
 const timer=setTimeout(()=>{if(!disposed){actor.userData.assetStatus='procedural-fallback';actor.userData.assetLoadTimedOut=true;}},15000);
 createGLTFLoader(renderer).then(loader=>loader.loadAsync(joinPath(resolveBaseUrl(),'models/character/socrates-v01.glb'))).then(gltf=>{
  const root=gltf.scene;if(disposed){disposeModel(root);return;}
  if(!root)throw new Error('Socrates GLB has no scene');
  root.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(root),height=bounds.max.y-bounds.min.y;
  if(!Number.isFinite(height)||height<.5||height>4)throw new Error('Invalid Socrates asset bounds');
  // Existing NPC root is scaled by .88. Match its previous 1.8m world height.
  root.scale.multiplyScalar(1.8/(actor.scale.y*height));root.updateMatrixWorld(true);
  const fitted=new THREE.Box3().setFromObject(root);root.position.y-=fitted.min.y;
  root.name='SocratesBlenderVisual';root.userData.noCollision=true;
  root.traverse(o=>{o.userData.noCollision=true;if(o.isMesh){o.castShadow=false;o.receiveShadow=true;o.frustumCulled=false;}});
  const clip=gltf.animations.find(a=>a.name==='Socrates_Listen_Idle');
  if(clip){mixer=new THREE.AnimationMixer(root);mixer.clipAction(clip).play();}
  visual=root;actor.add(root);fallback.visible=false;actor.userData.assetStatus='loaded';actor.userData.assetLoadTimedOut=false;
  actor.userData.assetSource='Socrates_v01_game.glb';actor.userData.assetBudget={meshes:13,triangles:42308,materials:10,textureCount:0};
 }).catch(error=>{if(!disposed){actor.userData.assetStatus='procedural-fallback';actor.userData.assetError=String(error);}}).finally(()=>clearTimeout(timer));
 return{update(delta,nearby){if(mixer&&nearby&&Number.isFinite(delta))mixer.update(Math.min(.05,Math.max(0,delta)));},dispose(){disposed=true;clearTimeout(timer);if(mixer){mixer.stopAllAction();mixer.uncacheRoot(visual);}disposeModel(visual);}};
}
