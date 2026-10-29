import * as THREE from 'three';
import { harborShoreX } from './harborCoast.js';
import { HARBOR_CENTER_3D, getSeaLevelY } from './locations.js';

// Ground the complete footprint, including rotated roofs/awnings, rather than
// trusting a centre point or the harbour group's fixed elevation.
export function placeHarborOnLand(object, target, sample, { building = false, parentOrigin = HARBOR_CENTER_3D } = {}) {
  object.position.set(0, 0, 0); object.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(object);
  const center = bounds.getCenter(new THREE.Vector3());
  const width = bounds.max.x - bounds.min.x, depth = bounds.max.z - bounds.min.z;
  let x = target.x, heights = [], found = false;
  for (let attempt = 0; attempt < 100; attempt++, x -= 2) {
    heights = [];
    for (const dx of [-width/2, 0, width/2]) for (const dz of [-depth/2, 0, depth/2]) heights.push(sample(x+dx, target.z+dz));
    if (heights.every(h => Number.isFinite(h) && h >= getSeaLevelY() + 1)) { found = true; break; }
  }
  if (!found) throw new Error(`No dry footprint for ${object.name}`);
  const ground = Math.max(...heights);
  object.position.set(x - center.x - parentOrigin.x, ground + 0.03 - parentOrigin.y, target.z - center.z - parentOrigin.z);
  object.userData.harborGrounded = true;
  object.userData.harborLandBuilding = building;
  object.userData.groundFootprint = { x, z: target.z, width, depth };
  if (building && Math.max(...heights) - Math.min(...heights) > 0.1) {
    const height = ground - Math.min(...heights) + 0.2;
    const foundation = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), new THREE.MeshStandardMaterial({color:0xa9987d, roughness:1}));
    foundation.name = 'HarborBuildingFoundation';
    foundation.quaternion.copy(object.quaternion).invert();
    foundation.position.set(center.x, -height/2, center.z).applyQuaternion(foundation.quaternion);
    object.add(foundation);
  }
  return object;
}

export function createCurvedHarborQuays({ stoneMaterial } = {}) {
  const group = new THREE.Group(); group.name = 'HarborQuayEdge';
  const masonryJoints = [];
  const stone = stoneMaterial || new THREE.MeshStandardMaterial({ color:0x918b7c, roughness:0.95 });
  const coping = new THREE.MeshStandardMaterial({ color:0xa1a39c, roughness:0.96 });
  coping.name='WeatheredQuayCoping';coping.userData.harborWarmth=.035;
  for (const [start, end] of [[-110,130]]) for (let z=start; z<end; z+=7) {
    const next = Math.min(end,z+7), x1=harborShoreX(z)-5, x2=harborShoreX(next)-5;
    const length=Math.hypot(x2-x1,next-z), angle=Math.atan2(x2-x1,next-z);
    const wall=new THREE.Mesh(new THREE.BoxGeometry(10,4.2,length+0.12),stone);
    wall.position.set((x1+x2)/2-HARBOR_CENTER_3D.x, -2.1, (z+next)/2-HARBOR_CENTER_3D.z); wall.rotation.y=angle;
    const cap=new THREE.Mesh(new THREE.BoxGeometry(10.6,0.25,length+0.2),coping);
    cap.position.copy(wall.position); cap.position.y=0.025; cap.rotation.y=angle;
    wall.receiveShadow=true; cap.receiveShadow=true; group.add(wall,cap);
    wall.updateMatrix();
    const addJoint=(y1,z1,y2,z2)=>{for(const point of [new THREE.Vector3(5.008,y1,z1),new THREE.Vector3(5.008,y2,z2)]){point.applyMatrix4(wall.matrix);masonryJoints.push(point.x,point.y,point.z);}};
    let course=0;
    for(let y=-1.4;y<2.05;y+=0.7,course++){
      addJoint(y,-length/2,y,length/2);
      for(let joint=-length/2+(course%2?1.2:2.4);joint<length/2;joint+=2.4)addJoint(y,joint,Math.min(y+0.7,2.09),joint);
    }
  }
  const joints=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(masonryJoints,3)),new THREE.LineBasicMaterial({color:0x514b40,transparent:true,opacity:0.5,depthWrite:false}));
  joints.name='HarborMasonryJoints';joints.userData.noCollision=true;group.add(joints);
  return group;
}

// The top face must meet both supporting surfaces exactly. Hand-set box
// rotations/heights leave a lip or drop at the pier edge.
export function createHarborBoardingRamp(start, end, width, material) {
  const thickness = 0.16, direction = end.clone().sub(start), length = direction.length();
  if (length < 0.1) throw new Error('Boarding ramp needs distinct supports');
  const z = direction.normalize(), x = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0), z);
  if (x.lengthSq() < 1e-8) throw new Error('Boarding ramp needs a horizontal span');
  x.normalize(); const y = new THREE.Vector3().crossVectors(z,x).normalize();
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(width,thickness,length),material);
  ramp.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));
  ramp.position.copy(start).add(end).multiplyScalar(0.5).addScaledVector(y,-thickness/2);
  ramp.receiveShadow = true;
  ramp.userData.boarding = {start:start.toArray(),end:end.toArray(),width};
  return ramp;
}