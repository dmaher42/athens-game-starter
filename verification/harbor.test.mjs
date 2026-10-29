import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { harborShoreX, harborCoastBlend, harborCoastHeight } from '../src/world/harborCoast.js';
import { placeHarborOnLand } from '../src/world/harborPlacement.js';
import { HARBOR_CENTER_3D, HARBOR_WATER_CENTER, HARBOR_GROUND_HEIGHT, getSeaLevelY, setSeaLevelY } from '../src/world/locations.js';

test('sea-level synchronization keeps the harbour on the quay and water at sea height', () => {
  const previous = getSeaLevelY();
  try {
    setSeaLevelY(previous - 0.2);
    assert.equal(HARBOR_CENTER_3D.y, getSeaLevelY() + HARBOR_GROUND_HEIGHT);
    assert.equal(HARBOR_WATER_CENTER.y, getSeaLevelY());
  } finally { setSeaLevelY(previous); }
});

test('harbour is a rounded inlet widening into open sea, with a bounded terrain edit', () => {
  const sea = getSeaLevelY();
  assert.equal(harborShoreX(10), 20);
  assert.ok(harborShoreX(75) > harborShoreX(40));
  assert.ok(harborShoreX(-55) > harborShoreX(-20));
  assert.ok(harborShoreX(150) > 128);
  for(const z of [-100,-40,10,70,120]) {
    assert.ok(harborCoastHeight(harborShoreX(z)-15,z,sea)>sea+2);
    assert.ok(harborCoastHeight(140,z,sea)<sea-2);
  }
  assert.equal(harborCoastBlend(-1,10),0);
  assert.equal(harborCoastBlend(140,10),0);
  assert.equal(harborCoastBlend(50,170),0);
});

test('a rotated harbour warehouse relocates onto dry land using its full footprint', () => {
  const model = new THREE.Group(); model.name = 'WarehouseFixture';
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(18,6,12),new THREE.MeshBasicMaterial());
  mesh.position.y=3; model.add(mesh); model.rotation.y=0.5;
  const sea = getSeaLevelY(), sample=(x,z)=>harborCoastHeight(x,z,sea);
  placeHarborOnLand(model,{x:120,z:30},sample,{building:true});
  const root=new THREE.Group(); root.position.copy(HARBOR_CENTER_3D); root.add(model); root.updateMatrixWorld(true);
  const f=model.userData.groundFootprint;
  assert.ok(f.x<120, 'Move the complete structure out of the water.');
  for(const dx of [-f.width/2,0,f.width/2])for(const dz of [-f.depth/2,0,f.depth/2])assert.ok(sample(f.x+dx,f.z+dz)>=sea+1);
  assert.ok(new THREE.Box3().setFromObject(model).min.y>sea+0.9);
});
