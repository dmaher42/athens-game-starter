import * as THREE from 'three';
import {mountTriremePreparation} from './triremePreparation.js';
import {EnvironmentCollider} from '../env/EnvironmentCollider.js';
import {createInteractor} from './interactions.js';
import {createExplorableTrireme} from './triremeModel.js';

export function createTriremeScene({renderer,camera,player,onReturn,quests}){
 const scene=new THREE.Scene();scene.name='TriremeVisitScene';scene.background=new THREE.Color(0x96b5c6);scene.fog=new THREE.Fog(0x96b5c6,90,210);
 const hemi=new THREE.HemisphereLight(0xd4e1ea,0x655644,2.0),sun=new THREE.DirectionalLight(0xffefcf,2.0);sun.position.set(-20,30,-15);scene.add(hemi,sun);
 const model=createExplorableTrireme();scene.add(model.root);
 // Cut only the hull's actual waterline from this scene's one sea surface.
 // Intersections derive from the existing hull triangles, not another mask map.
 const hull=model.root.getObjectByName('LongNarrowHull');hull.updateWorldMatrix(true,false);const geometry=hull.geometry,position=geometry.attributes.position,index=geometry.index,points=new Map(),vertices=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()],waterY=-.04;
 for(let i=0;i<(index?.count??position.count);i+=3){for(let j=0;j<3;j++)vertices[j].fromBufferAttribute(position,index?index.getX(i+j):i+j).applyMatrix4(hull.matrixWorld);for(let j=0;j<3;j++){const a=vertices[j],b=vertices[(j+1)%3];if((a.y-waterY)*(b.y-waterY)<0){const p=a.clone().lerp(b,(waterY-a.y)/(b.y-a.y));points.set(p.x.toFixed(6)+':'+p.z.toFixed(6),new THREE.Vector2(p.x,-p.z));}}}
 const waterline=[...points.values()];waterline.sort((a,b)=>Math.atan2(a.y+1,a.x)-Math.atan2(b.y+1,b.x));
 const surface=new THREE.Shape([new THREE.Vector2(-250,-250),new THREE.Vector2(250,-250),new THREE.Vector2(250,250),new THREE.Vector2(-250,250)]);surface.holes.push(new THREE.Path(waterline));
 const ocean=new THREE.Mesh(new THREE.ShapeGeometry(surface),new THREE.MeshStandardMaterial({color:0x2c697a,roughness:.48,metalness:.08}));ocean.rotation.x=-Math.PI/2;ocean.position.y=waterY;ocean.name='ShipVisitSea';ocean.userData.noCollision=true;scene.add(ocean);
 const collider=new EnvironmentCollider();collider.fromStaticScene(model.physics);scene.add(collider.mesh);
 const interactor=createInteractor(renderer,camera,scene,{getPlayerPosition:()=>player.position});
 const markers=[];function cue(id,position,text,fn){const marker=new THREE.Mesh(new THREE.BoxGeometry(.35,.2,.08),new THREE.MeshStandardMaterial({color:0x41585b,roughness:1}));marker.name='TriremeCue_'+id;marker.position.set(...position);marker.userData={noCollision:true,interactable:true,interactionRange:2.7,onUse:fn??(()=>interactor.showDialogue(text))};scene.add(marker);interactor.registerInteractable(marker);markers.push(marker);}
 cue('return',[0,3.1,-15.5],'',onReturn);
 cue('rowing',[0,1.5,-4.5],'Three staggered levels hold 170 rowing places: 27 lower and 27 middle rowers per side, plus 31 on the upper level. These narrow access bays reveal the spaces; the mast and seating prevent a free walk through every station. This is an Olympias-inspired interpretation, not an exact ancient plan.');
 cue('sail',[-2.15,3.05,1],'The square sail and smaller foresail are static in this first visit. Shrouds, stays and sheets lead back to the timber hull. There is no sailing or destination system yet.');
 cue('bow',[.8,3.0,13.1],'A long, narrow warship, with a bronze-sheathed ram at the waterline. The overall model is about 36.9 metres long and 5.5 metres across the rowing gallery; extended oars reach farther. There are no spacious cabins.');
 const preparation=mountTriremePreparation({scene,model,interactor,player,camera,canvas:renderer.domElement,quests});
 return{scene,collider,interactor,layout:model.layout,markers,preparation,update:dt=>preparation.update(dt),dispose(){preparation.dispose();interactor.dispose();const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});for(const g of geometries)g.dispose();const textures=new Set();for(const m of materials){for(const value of Object.values(m))if(value?.isTexture)textures.add(value);m.dispose();}for(const texture of textures)texture.dispose();scene.clear();}};
}
