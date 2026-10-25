import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { spawnCitizenCrowd } from '../src/world/npcs.js';
import { EnvironmentCollider } from '../src/env/EnvironmentCollider.js';

test('hero clothing update preserves the original geometry, skeleton and animation buffer', async () => {
  const bytes = await readFile(new URL('../public/models/character/hero.glb', import.meta.url));
  assert.equal(bytes.readUInt32LE(8), bytes.length);
  const end = 20 + bytes.readUInt32LE(12);
  assert.equal(createHash('sha256').update(bytes.subarray(end)).digest('hex'), '2943884df682a92c1fc0c2425b35416eda3aa38adc90de55e3b8afbd8034fa7b');
  const document = JSON.parse(bytes.subarray(20, end));
  for (const action of ['Idle', 'Walk', 'Run']) assert.ok(document.animations.some(a => a.name === `CharacterArmature|${action}`));
  assert.ok(document.materials.some(m => m.name === 'Hero_Linen'));
  assert.ok(document.materials.some(m => m.name === 'Hero_Indigo'));
  assert.ok(document.skins.length > 0);
});

test('updated citizens stay animated, switch distant detail and never obstruct walking', () => {
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera();
  const path = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(6, 0, 0), new THREE.Vector3(6, 0, 6)], true);
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(20, 1, 20), new THREE.MeshBasicMaterial()));
  const crowd = spawnCitizenCrowd(scene, path, { count: 7, camera, terrain: { userData: { getHeightAt: () => 0.5 } }, instancedAccessories: false });
  const initial = crowd.citizens.map(c => c.position.clone());
  for (const update of crowd.updaters) update(1 / 30);
  for (const [i, citizen] of crowd.citizens.entries()) {
    assert.ok(citizen.position.distanceTo(initial[i]) > 0);
    assert.equal(citizen.position.y, 0.55);
    assert.ok(citizen.getObjectByName('CitizenFaceFeatures'));
    const height = new THREE.Box3().setFromObject(citizen).getSize(new THREE.Vector3()).y;
    assert.ok(height >= 1.5 && height < 2.3);
    const head = citizen.getObjectByName('CitizenHead');
    assert.equal(head.parent.visible, true);
    camera.position.set(1000, 0, 1000);
    crowd.updaters[i](1 / 30);
    assert.equal(head.parent.visible, false, 'Detailed faces must disappear at distance.');
    camera.position.copy(citizen.position);
    crowd.updaters[i](1 / 30);
    assert.equal(head.parent.visible, true, 'Detailed faces must return nearby.');
    camera.position.set(0, 0, 0);
  }
  const collider = new EnvironmentCollider(); collider.fromStaticScene(scene);
  assert.equal(collider.mesh.geometry.attributes.position.count, 36, 'Only the floor belongs to the solid collider.');
});
