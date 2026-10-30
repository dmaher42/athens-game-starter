import * as THREE from 'three';
import {COUNTRYSIDE} from './countrysideLayout.js';
import {createOliveTree} from './foliage.js';
import {createLabelSprite} from './demoTour.js';

export function createCountrysideEdge({sample,origin}){
 const root=new THREE.Group();root.name='NorthernCountryside';
 const stone=new THREE.MeshStandardMaterial({color:0x928c78,roughness:1}),wood=new THREE.MeshStandardMaterial({color:0x786048,roughness:1});
 const cube=new THREE.BoxGeometry(1,1,1);
 const place=(o,x,y,z)=>{o.position.set(x-origin.x,sample(x,z)-origin.y+y,z-origin.z);root.add(o);return o;};
 let wallSegments=0;
 for(const[a,b]of COUNTRYSIDE.walls){const length=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(length/1.8);for(let i=0;i<n;i++){const t=(i+.5)/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,h=.48+(i%3)*.035;const o=place(new THREE.Mesh(cube,stone),x,h/2,z);o.scale.set(length/n+.025,h,.46);o.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);o.name='CountrysideFieldWall';o.receiveShadow=true;wallSegments++;}}
 const tree=createOliveTree({scale:.9});tree.traverse(o=>{if(o.isMesh&&o.geometry.type==='CylinderGeometry')o.userData.noCull=true;}); // Keep this small grove's trunks with its visible crowns.
 for(const[x,z]of COUNTRYSIDE.olives){const o=tree.clone(true);o.name='CountrysideOlive';place(o,x,0,z);}
 // Sparse clumps suggest a cultivated cereal plot, not a harvest simulator.
 // Two shared instanced meshes, no individual plant updates or lights.
 const points=[];for(const z of COUNTRYSIDE.cropRows)for(let i=0;i<25;i++)for(let j=0;j<3;j++)points.push([-58+i*1.2+(j-1)*.15,z+(j%2)*.17]);
 const stem=new THREE.InstancedMesh(new THREE.CylinderGeometry(.025,.035,.9,4),new THREE.MeshStandardMaterial({color:0x858453,roughness:1}),points.length);
 const ears=new THREE.InstancedMesh(new THREE.ConeGeometry(.095,.32,4),new THREE.MeshStandardMaterial({color:0xab9b65,roughness:1}),points.length);
 const matrix=new THREE.Matrix4();for(let i=0;i<points.length;i++){const[x,z]=points[i],y=sample(x,z)-origin.y;matrix.makeTranslation(x-origin.x,y+.45,z-origin.z);stem.setMatrixAt(i,matrix);matrix.makeTranslation(x-origin.x,y+1.06,z-origin.z);ears.setMatrixAt(i,matrix);}
 for(const o of[stem,ears]){o.name='CountrysideCereal';o.userData.noCollision=true;o.receiveShadow=true;o.computeBoundingSphere();root.add(o);}
 const cue=new THREE.Group();cue.name='CountrysideFieldCue';cue.userData.noCollision=true;cue.userData.interactable=true;cue.userData.interactionRange=3.2;
 cue.userData.onUse=()=>{let scene=root;while(scene.parent)scene=scene.parent;scene.userData.interactor?.showDialogue('Beyond the garden, the city gives way to working land. These small cereal rows and olive trees suggest households tending plots near town. Much grain still comes through the harbour. This is an imagined rural edge, not a measured reconstruction. The open gap leads back to the garden and Olive Court.');};
 const post=new THREE.Mesh(new THREE.BoxGeometry(.1,.85,.1),wood);post.position.y=.425;cue.add(post);const label=createLabelSprite('GARDEN AND FIELD WALK',0xbcb399,{x:2.8,y:.5});label.position.y=1.25;cue.add(label);place(cue,...[COUNTRYSIDE.cue[0],0,COUNTRYSIDE.cue[1]]);
 root.userData.budget={oliveTrees:COUNTRYSIDE.olives.length,wallSegments,cerealInstances:points.length*2,cerealDrawMeshes:2,updates:0};
 return{root,cue};
}


