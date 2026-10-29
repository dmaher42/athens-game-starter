import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {ACROPOLIS} from './acropolisLayout.js';
import {getParthenonStone} from '../features/parthenonArchitecture.js';
import {queueSceneInteractable} from './interactions.js';
import {createLabelSprite} from './demoTour.js';

// Local architecture only. Terrain, state, input and asset loading keep their
// established owners. Blender replacements attach at these named site roots.
export function createHellenisticSanctuary(parent,{terrain,seaLevel}){
 const root=new THREE.Group();root.name='HellenisticSanctuary';root.position.x=ACROPOLIS.sanctuaryOffsetX??0;parent.add(root);
 const stone=getParthenonStone(),roofMaterial=stone.clone();roofMaterial.color.setHex(0xc5c5bb);
 const bronze=new THREE.MeshStandardMaterial({color:0x52635b,roughness:.8,metalness:.28,envMapIntensity:.12});
 const blue=new THREE.MeshStandardMaterial({color:0x455563,roughness:.95});
 const y=seaLevel+ACROPOLIS.heightAboveSea;
 let scene=parent;while(scene.parent)scene=scene.parent;
 const sample=(x,z)=>terrain.userData.getHeightAt(x+root.position.x,z);
 function box(p,name,w,h,d,x,py,z,material=stone,decorative=false){
  const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.name=name;o.position.set(x,py,z);o.castShadow=!decorative;o.receiveShadow=true;
  if(decorative)o.userData.noCollision=true;p.add(o);return o;
 }
 function site(name,x,z){const g=new THREE.Group();g.name=name;g.position.set(x-root.position.x,y+.03,z);g.userData.assetAttachment=true;root.add(g);return g;}
 // A narrow retained western ambulatory links gateway arrival and Nike. Its
 // support belongs to the same architectural/collision root as the sanctuary.
 const westBottom=Math.min(sample(-69.5,-25),sample(-69.5,-38),sample(-66.9,-38))-.3;
 const westWalk=box(root,'WesternSanctuaryWalk',3.2,y-westBottom,13.5,-66.2,(y+westBottom)/2,-31.25);westWalk.userData.groundSurface='building';
 const northEnd=sample(-66.4,-17.2)+.015,northBottom=Math.min(northEnd,y)-.3;
 const northShape=new THREE.Shape();northShape.moveTo(-24.5,northBottom);northShape.lineTo(-17.2,northBottom);northShape.lineTo(-17.2,northEnd);northShape.lineTo(-24.5,y);northShape.closePath();
 const northGeometry=new THREE.ExtrudeGeometry(northShape,{depth:3.2,bevelEnabled:false,steps:1});northGeometry.translate(0,0,-1.6);northGeometry.rotateY(-Math.PI/2);
 const northLink=new THREE.Mesh(northGeometry,stone);northLink.name='GatewayToNorthPromenade';northLink.position.x=-66.4;northLink.receiveShadow=true;northLink.userData.groundSurface='building';root.add(northLink);
 const nikeBottom=Math.min(sample(-72.5,-38),sample(-72.5,-34))-.3;
 const nikeCourt=box(root,'NikeArrivalCourt',5.6,y-nikeBottom,5,-69.7,(y+nikeBottom)/2,-35.5);nikeCourt.userData.groundSurface='building';
 const g=ACROPOLIS.gatewayAsset,startX=-88,endX=g.originX-root.position.x-2.4*g.scale,startHeight=sample(startX,-25)+.015,endHeight=y-g.exitRise;
 const bridgeBottom=Math.min(startHeight,endHeight,sample((startX+endX)/2,-25))-.3;
 const bridgeShape=new THREE.Shape();bridgeShape.moveTo(startX,bridgeBottom);bridgeShape.lineTo(endX,bridgeBottom);bridgeShape.lineTo(endX,endHeight);bridgeShape.lineTo(startX,startHeight);bridgeShape.closePath();
 const bridgeGeometry=new THREE.ExtrudeGeometry(bridgeShape,{depth:3.2,steps:1,bevelEnabled:false});bridgeGeometry.translate(0,0,-26.6);
 const bridge=new THREE.Mesh(bridgeGeometry,stone);bridge.name='PropylaeaWestApproach';bridge.receiveShadow=true;bridge.userData.groundSurface='building';root.add(bridge);
 function roof(p,w,d,height,base){
  const shape=new THREE.Shape();shape.moveTo(-d/2,0);shape.lineTo(0,height);shape.lineTo(d/2,0);shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:w,bevelEnabled:false,steps:1});geometry.translate(0,0,-w/2);geometry.rotateY(Math.PI/2);
  const r=new THREE.Mesh(geometry,roofMaterial);r.name='PitchedMarbleRoof';r.position.y=base;r.castShadow=true;r.receiveShadow=true;p.add(r);
 }
 function ionic(p,positions,height,radius=.24){
  const shapes=[],shaft=new THREE.CylinderGeometry(radius*.84,radius,height,16,1);shaft.translate(0,height/2,0);shapes.push(shaft);
  const base=new THREE.CylinderGeometry(radius*1.35,radius*1.45,.16,16);base.translate(0,.08,0);shapes.push(base);
  const abacus=new THREE.BoxGeometry(radius*3.8,.14,radius*2.6);abacus.translate(0,height+.08,0);shapes.push(abacus);
  for(const side of[-1,1]){const volute=new THREE.TorusGeometry(radius*.62,radius*.17,5,10);volute.translate(side*radius*1.05,height-.02,0);shapes.push(volute);}
  const mesh=new THREE.InstancedMesh(mergeGeometries(shapes),stone,positions.length),dummy=new THREE.Object3D();mesh.name='IonicInspiredColumns';
  positions.forEach(([x,py,z],i)=>{dummy.position.set(x,py,z);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=true;mesh.receiveShadow=true;p.add(mesh);
 }
 function cue(id,label,x,z,text,supportHeight=sample(x,z)){
  const g=new THREE.Group();g.name='HellenisticCue_'+id;g.position.set(x,supportHeight+.05,z);g.userData.noCollision=true;g.userData.interactable=true;g.userData.interactionRange=3.5;g.userData.placeId=id;
  g.userData.onUse=()=>scene.userData.interactor?.showDialogue(text);
  box(g,'SmallInterpretationPlaque',.7,.25,.06,0,.95,0,bronze,true);box(g,'PlaquePost',.08,.85,.08,0,.425,0,bronze,true);
  const labelSprite=createLabelSprite(label,0xbeb69e,{x:3.6,y:.8});labelSprite.position.y=1.5;g.add(labelSprite);root.add(g);queueSceneInteractable(scene,g,{includeChildren:true});
 }

 const e=ACROPOLIS.sites.erechtheion,erech=site('ErechtheionInspired',e.x,e.z);
 // This building meets a retained slope. Fit real masonry foundations and a
 // solid structural ramp; leave the existing promenade's terrain cells intact.
 function foundation(p,name,w,d,x,z,top){
  const corners=[[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2]];
  const bottom=Math.min(...corners.map(([dx,dz])=>sample(p.position.x+x+dx,p.position.z+z+dz)-p.position.y))-.15;
  box(p,name,w,top-bottom,d,x,(top+bottom)/2,z);
 }
 foundation(erech,'ErechtheionMasonryBase',16.6,9.6,0,0,-.21);
 foundation(erech,'CaryatidRetainingBase',8,3.5,-5,-6.75,0);
 foundation(erech,'EastPorchMasonryBase',3.3,9.5,9.5,0,-.17);
 const rampStartZ=-16.8,rampEndZ=-14,rampX=-25.5,rampStart=sample(rampX,rampStartZ)+.015,rampEnd=y+.015;
 const rampBottom=Math.min(sample(rampX-1.1,-12),sample(rampX+1.1,-12),rampStart)-.3;
 const rampShape=new THREE.Shape();rampShape.moveTo(rampStartZ,rampBottom);rampShape.lineTo(rampEndZ,rampBottom);rampShape.lineTo(rampEndZ,rampEnd);rampShape.lineTo(rampStartZ,rampStart);rampShape.closePath();
 const rampGeometry=new THREE.ExtrudeGeometry(rampShape,{depth:2.2,bevelEnabled:false,steps:1});rampGeometry.translate(0,0,-1.1);rampGeometry.rotateY(-Math.PI/2);
 const approach=new THREE.Mesh(rampGeometry,stone);approach.name='ErechtheionEastApproach';approach.position.x=rampX;approach.receiveShadow=true;approach.userData.groundSurface='building';root.add(approach);
 const courtStart=sample(-51,-16.8)+.015,courtEnd=y+.015,courtBottom=Math.min(courtStart,y)-.3;
 const courtShape=new THREE.Shape();courtShape.moveTo(-16.8,courtBottom);courtShape.lineTo(-14,courtBottom);courtShape.lineTo(-14,courtEnd);courtShape.lineTo(-16.8,courtStart);courtShape.closePath();
 const courtRampGeometry=new THREE.ExtrudeGeometry(courtShape,{depth:3,bevelEnabled:false,steps:1});courtRampGeometry.translate(0,0,-1.5);courtRampGeometry.rotateY(-Math.PI/2);
 const courtRamp=new THREE.Mesh(courtRampGeometry,stone);courtRamp.name='DedicationCourtApproach';courtRamp.position.x=-51;courtRamp.receiveShadow=true;courtRamp.userData.groundSurface='building';root.add(courtRamp);
 // One simple enterable chamber, with distinct porches. Interior room divisions
 // of the historic monument remain uncertain; do not imply an exact plan.
 box(erech,'SanctuaryFloor',16.6,.18,9.6,0,-.12,0);
 box(erech,'NorthCellaWall',7.4,4.81,.38,-4.3,2.375,4.5);box(erech,'NorthCellaWall',5.4,4.81,.38,5.3,2.375,4.5);box(erech,'NorthDoorLintel',3.2,1.2,.38,1,4.18,4.5);
 box(erech,'SouthCellaWall',16,4.81,.38,0,2.375,-4.5);
 box(erech,'WestCellaWall',.38,4.81,9,-8,2.375,0);
 for(const sign of[-1,1])box(erech,'EastDoorJamb',.38,4.81,2.9,8,2.375,sign*3.05);
 box(erech,'EastDoorLintel',.38,1.2,3.2,8,4.18,0);
 box(erech,'CellaCornice',17,.34,10,0,4.95,0);roof(erech,17.3,10.3,1.2,5.12);
 box(erech,'EastPorchStep',3.3,.14,9.5,9.5,-.10,0);
 ionic(erech,[-3.7,-2.22,-.74,.74,2.22,3.7].map(z=>[10.3,-.03,z]),4.42,.22);
 box(erech,'EastPorchEntablature',3.5,.3,9.6,9.4,4.6,0);const eastRoof=new THREE.Group();eastRoof.position.x=9.4;erech.add(eastRoof);roof(eastRoof,3.7,9.9,.85,4.75);
 box(erech,'NorthPorchStep',6.2,.16,3.5,1,-.11,6.0);
 ionic(erech,[[-1.4,-.03,7.3],[.2,-.03,7.3],[1.8,-.03,7.3],[3.4,-.03,7.3],[-1.4,-.03,5.5],[3.4,-.03,5.5]],4.39,.22);
 box(erech,'NorthPorchCanopy',6.5,.3,3.9,1,4.62,6.0);
 box(erech,'CaryatidPorchBase',8,.3,3.5,-5,.15,-6.75);
 // Original stylised draped supports, one shared mesh six times. A future
 // Blender sculpture can replace this named bank without changing the porch.
 const forms=[],robe=new THREE.CylinderGeometry(.26,.4,2.45,12,4);robe.translate(0,1.3,0);forms.push(robe);
 const shoulders=new THREE.SphereGeometry(.32,10,6);shoulders.scale(1.25,.65,.7);shoulders.translate(0,2.55,0);forms.push(shoulders);
 const head=new THREE.SphereGeometry(.25,10,8);head.translate(0,3.0,0);forms.push(head);
 const capital=new THREE.CylinderGeometry(.42,.31,.22,12);capital.translate(0,3.4,0);forms.push(capital);
 const maidens=new THREE.InstancedMesh(mergeGeometries(forms),stone,6),dummy=new THREE.Object3D();maidens.name='CaryatidSculptureBank';
 let i=0;for(const z of[-7.8,-5.7])for(const x of[-7.5,-5,-2.5]){dummy.position.set(x,.3,z);dummy.updateMatrix();maidens.setMatrixAt(i++,dummy.matrix);}maidens.instanceMatrix.needsUpdate=true;maidens.castShadow=true;maidens.receiveShadow=true;erech.add(maidens);
 box(erech,'CaryatidPorchRoof',8.3,.38,3.8,-5,3.96,-6.75);
 const trim=box(erech,'RestrainedPaintedPorchBand',8.32,.1,3.82,-5,3.98,-6.75,blue,true);trim.castShadow=false;
 erech.userData.assetSlot={path:'models/landmarks/acropolis/erechtheion-v1.glb',preserveCollision:true};

 const n=ACROPOLIS.sites.nike,nike=site('AthenaNikeInspired',n.x,n.z);
 // Small tetrastyle Ionic temple: four columns on each end, not another
 // peripteral copy of the Parthenon. The bastion is the shared terrain lobe.
 box(nike,'NikeLowerStep',6.9,.12,8.8,0,.06,0);box(nike,'NikeUpperStep',6.3,.12,8.2,0,.18,0);
 box(nike,'NikeCellaBack',3.2,3.1,.25,0,1.79,-1.9);
 for(const sign of[-1,1])box(nike,'NikeCellaSide',.25,3.1,3.8,sign*1.6,1.79,0);
 ionic(nike,[-1.8,-.6,.6,1.8].flatMap(x=>[[x,.24,-3.2],[x,.24,3.2]]),3.15,.18);
 box(nike,'NikeEntablature',6.2,.35,8.1,0,3.6,0);const nikeRoof=new THREE.Group();nikeRoof.rotation.y=Math.PI/2;nike.add(nikeRoof);roof(nikeRoof,8.5,6.5,.9,3.78);
 nike.userData.assetSlot={path:'models/landmarks/acropolis/athena-nike-v1.glb',preserveCollision:true};

 const d=ACROPOLIS.sites.dedication,court=site('HellenisticDedicationCourt',d.x,d.z);
 box(court,'DedicationPlinth',1.4,.65,1.4,0,.325,0);
 const dedication=new THREE.Group();dedication.name='OriginalBronzeOffering';dedication.userData.noCollision=true;court.add(dedication);
 const body=new THREE.Mesh(new THREE.CylinderGeometry(.26,.4,1.4,10),bronze);body.position.y=1.48;dedication.add(body);
 const face=new THREE.Mesh(new THREE.SphereGeometry(.24,12,8),bronze);face.position.y=2.43;dedication.add(face);
 box(dedication,'OfferingRaisedArm',.14,.85,.14,-.36,2.1,0,bronze,true);
 for(const x of[-3,3])box(court,'CourtBench',1.9,.45,.65,x,.225,1.2);
 // No independent floor, ambient update loop, extra lights or persistent state.
 cue('erechtheion','ERECHTHEION',-25.5,-13.5,'The Erechtheion honours older cults of Athena and Poseidon. Its porches meet different ground levels; six draped figures carry the southern roof. These are original stylised forms in our Hellenistic-inspired sanctuary, not an exact reconstruction of its uncertain interior.',y);
 cue('nike','ATHENA NIKE',-72,-36,'Athena Nike is Athena as the giver of victory. The small Ionic temple watches the western approach from its bastion. Its Classical architecture remained part of the sanctuary in Hellenistic times.');
 cue('dedications','OFFERINGS TO ATHENA',-55.6,-11,'In Hellenistic times the older temples remained in use while rulers and worshippers added offerings. This original bronze dedication gives the court a focus; it does not reproduce a securely identified ancient statue.',y);
 root.userData.period=ACROPOLIS.period;root.userData.layoutOwner='acropolisLayout.js';
 return root;
}
