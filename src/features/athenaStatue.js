import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// Original sculptural interpretation, fitted to this game's compressed cella.
// The lost original is known through ancient descriptions and later copies.
export function createAthenaParthenos({stone}){
 const root=new THREE.Group();root.name='ParthenonAthena';root.userData={interpretation:true,sculptureHeight:9.15,noCollision:false};
 const gold=new THREE.MeshStandardMaterial({name:'AthenaWorkedGold',color:0xc9a353,metalness:.62,roughness:.43,envMapIntensity:.22,emissive:0x63451a,emissiveIntensity:.18});
 const recess=new THREE.MeshStandardMaterial({name:'AthenaRecessedGold',color:0x80612e,metalness:.48,roughness:.56,envMapIntensity:.14});
 const ivory=new THREE.MeshStandardMaterial({name:'AthenaCarvedIvory',color:0xe0d4b7,roughness:.67,metalness:0,envMapIntensity:.08});
 const hair=new THREE.MeshStandardMaterial({name:'AthenaHairAndCrest',color:0x342c25,roughness:.88,metalness:.02});
 const eye=new THREE.MeshStandardMaterial({name:'AthenaInlaidEyes',color:0x4c5046,roughness:.46});

 // Small material-local reflection of a warm chamber and its bright doorway.
 // No new light, animation or city-wide exposure/environment change.
 const reflectionPixels=new Uint8Array(64*32*4);for(let y=0;y<32;y++)for(let x=0;x<64;x++){const door=(x>27&&x<38&&y>8&&y<25),upper=y<15,v=door?228:upper?126:61,i=(y*64+x)*4;reflectionPixels[i]=v;reflectionPixels[i+1]=Math.round(v*.95);reflectionPixels[i+2]=Math.round(v*.83);reflectionPixels[i+3]=255;}
 const reflection=new THREE.DataTexture(reflectionPixels,64,32,THREE.RGBAFormat);reflection.name='AthenaChamberReflection';reflection.mapping=THREE.EquirectangularReflectionMapping;reflection.colorSpace=THREE.SRGBColorSpace;reflection.needsUpdate=true;
 for(const material of [gold,recess]){material.envMap=reflection;material.envMapIntensity=.65;}
 const batches=new Map();
 function part(geometry,material,position=[0,0,0],scale=[1,1,1],rotation=[0,0,0]){
  const transform=new THREE.Matrix4().compose(new THREE.Vector3(...position),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),new THREE.Vector3(...scale));geometry.applyMatrix4(transform);
  // Non-indexed geometry gives a common attribute contract across primitive types.
  const g=geometry.index?geometry.toNonIndexed():geometry;g.deleteAttribute('uv');if(g!==geometry)geometry.dispose();if(!batches.has(material))batches.set(material,[]);batches.get(material).push(g);
 }
 function sphere(material,pos,size){part(new THREE.SphereGeometry(1,20,14),material,pos,size);}
 function limb(a,b,r1,r2,material){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),direction=end.clone().sub(start),g=new THREE.CylinderGeometry(r2,r1,direction.length(),14,3);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize()));part(g,material,start.add(end).multiplyScalar(.5).toArray());}
 function curved(points,radius,material,segments=30){part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),segments,radius,7,false),material);}
 const plinth=new THREE.Mesh(new THREE.BoxGeometry(4.6,.72,3.3),stone);plinth.name='AthenaPlinth';plinth.position.y=.36;plinth.userData.noCollision=false;plinth.receiveShadow=true;root.add(plinth);
 part(new THREE.BoxGeometry(4.8,.12,3.5),recess,[0,.78,0]);
 // Sandalled feet and weighted, irregular peplos folds, rather than a scaled cone.
 for(const side of [-1,1]){sphere(ivory,[side*.43,.98,.28],[.25,.17,.55]);part(new THREE.BoxGeometry(.51,.10,1.02),gold,[side*.43,.85,.16]);for(const dz of [.12,.38])curved([[side*.43-.23,1.01,dz],[side*.43,1.13,dz],[side*.43+.23,1.01,dz]],.025,gold,10);}
 const profile=[[1.07,.94],[1.15,1.2],[1.12,1.6],[1.02,2.2],[.94,2.9],[.84,3.7],[.77,4.5],[.86,4.85]].map(([r,y])=>new THREE.Vector2(r,y));
 const robe=new THREE.LatheGeometry(profile,96),positions=robe.attributes.position;
 for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getZ(i),y=positions.getY(i),angle=Math.atan2(z,x),fold=(.045+.024*Math.cos(angle*3+y*.3))*Math.cos(angle*24+y*.13);positions.setX(i,x*(1+fold));positions.setZ(i,z*(.82+fold));}robe.computeVertexNormals();part(robe,gold);
 sphere(gold,[0,5.45,0],[.90,1.04,.54]);sphere(gold,[0,6.16,-.02],[1.05,.42,.58]);
 part(new THREE.TorusGeometry(.77,.075,8,48),recess,[0,4.72,0],[1,1,.74],[Math.PI/2,0,0]);
 // Aegis with a Gorgoneion boss and a restrained serpent border.
 sphere(recess,[0,5.84,.46],[.77,.68,.17]);sphere(gold,[0,5.79,.63],[.24,.27,.09]);
 for(const side of [-1,1])for(let i=0;i<5;i++){const x=side*(.15+i*.14),y=5.31+Math.abs(x)*.28;curved([[x,y,.55],[x+side*.06,y-.13,.60],[x+side*.12,y-.04,.62]],.022,gold,8);}
 // Ivory neck and a deliberately modelled face, framed by curls and cheek guards.
 limb([0,6.27,0],[0,6.75,0],.26,.25,ivory);sphere(ivory,[0,7.18,.015],[.47,.63,.42]);
 sphere(ivory,[0,6.91,.18],[.29,.16,.13]);sphere(ivory,[0,7.17,.40],[.085,.19,.12]);
 sphere(ivory,[0,7.06,.47],[.12,.07,.08]);
 for(const side of [-1,1]){sphere(ivory,[side*.20,7.30,.37],[.15,.068,.07]);sphere(eye,[side*.20,7.30,.429],[.036,.021,.017]);curved([[side*.08,7.42,.39],[side*.21,7.45,.39],[side*.34,7.40,.34]],.025,recess,10);sphere(ivory,[side*.47,7.13,0],[.07,.15,.11]);}
 curved([[-.14,6.90,.453],[0,6.885,.48],[.14,6.90,.453]],.020,recess,12);
 for(const side of [-1,1])for(let i=0;i<5;i++)sphere(hair,[side*(.38+.035*Math.sin(i)),7.31-i*.16,-.12],[.11,.14,.18]);
 // Helmet dome, raised rim, cheek guards and three horsehair crest ridges.
 part(new THREE.SphereGeometry(.54,28,12,0,Math.PI*2,0,Math.PI*.58),gold,[0,7.49,-.015],[1,1,.92]);
 part(new THREE.TorusGeometry(.51,.055,8,44),recess,[0,7.43,-.015],[1,1,.92],[Math.PI/2,0,0]);
 for(const side of [-1,1]){part(new THREE.BoxGeometry(.10,.55,.35),gold,[side*.455,7.12,-.05],[1,1,1],[0,0,side*.15]);}
 for(const x of [-.28,0,.28]){curved([[x,7.87,.26],[x,8.51,.08],[x,8.91,-.42],[x,8.62,-.95]],x===0?.11:.075,recess,26);curved([[x,7.99,.26],[x,8.67,.05],[x,9.02,-.42],[x,8.70,-1.0]],x===0?.095:.06,hair,26);}
 // Her right arm (viewer left) supports Victory; the left rests by the shield.
 limb([-.88,6.12,0],[-1.25,5.68,.28],.23,.20,ivory);sphere(ivory,[-1.25,5.68,.28],[.21,.21,.22]);limb([-1.25,5.68,.28],[-2.08,5.98,.56],.18,.13,ivory);
 sphere(ivory,[-2.14,6.01,.62],[.26,.10,.25]);
 limb([.88,6.10,0],[1.21,5.15,.32],.23,.18,ivory);limb([1.21,5.15,.32],[1.56,4.22,.65],.17,.12,ivory);sphere(ivory,[1.57,4.18,.69],[.15,.20,.16]);
 // Concave-looking shield: broad face, rim, centre boss and abstract relief figures.
 part(new THREE.CylinderGeometry(1.50,1.50,.18,64),gold,[1.40,2.55,.82],[1,1,1],[Math.PI/2,0,0]);
 part(new THREE.TorusGeometry(1.44,.09,8,64),recess,[1.40,2.55,.94]);sphere(recess,[1.40,2.55,.95],[.27,.27,.12]);
 for(let i=0;i<12;i++){const angle=i*Math.PI/6,x=1.40+Math.cos(angle)*1.02,y=2.55+Math.sin(angle)*1.02;sphere(recess,[x,y,.93],[.06,.06,.025]);}
 for(const dx of [-.62,.62]){sphere(recess,[1.40+dx,2.85,.94],[.10,.12,.035]);limb([1.40+dx,2.70,.94],[1.40+dx*.65,2.26,.94],.055,.07,recess);}
 limb([2.18,.90,-.22],[2.18,8.20,-.22],.038,.035,recess);part(new THREE.ConeGeometry(.13,.44,10),gold,[2.18,8.42,-.22]);
 // Small winged Nike, facing into the visitor's sightline, on the outstretched palm.
 const nx=-2.15,nz=.64;part(new THREE.CylinderGeometry(.11,.22,.68,18),gold,[nx,6.47,nz]);sphere(ivory,[nx,6.99,nz],[.13,.17,.12]);
 limb([nx-.10,6.76,nz],[nx-.37,6.91,nz+.03],.035,.025,ivory);limb([nx+.10,6.76,nz],[nx+.36,6.91,nz+.03],.035,.025,ivory);
 for(const side of [-1,1]){const shape=new THREE.Shape();shape.moveTo(0,0);shape.quadraticCurveTo(side*.58,.52,side*.60,.06);shape.lineTo(side*.19,-.21);shape.closePath();const g=new THREE.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:false});part(g,gold,[nx+side*.08,6.70,nz-.09]);}
 // Merge by material to keep this authored sculpture static and inexpensive.
 for(const[material,parts]of batches){const geometry=mergeGeometries(parts,false);for(const part of parts)part.dispose();geometry.computeBoundingSphere();const mesh=new THREE.Mesh(geometry,material);mesh.name=material.name;mesh.receiveShadow=true;mesh.castShadow=false;mesh.userData={noCollision:true,noCull:true};root.add(mesh);}
 root.userData.sculptureHeight=new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3()).y;
 return root;
}
