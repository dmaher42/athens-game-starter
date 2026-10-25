import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
import * as THREE from 'three';
import { createTerrainGridSampler } from '../src/world/terrainHeight.js';
import { EnvironmentCollider } from '../src/env/EnvironmentCollider.js';
import { poolMaterialsAndMerge } from '../src/world/buildingSpawner.js';

// Compile the single canonical TS validator with the project's compiler. This
// also works on Node versions without native TypeScript import support.
const compile = (source) => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const config = moduleUrl(compile(await fs.readFile(new URL('../src/config/terrainShape.ts', import.meta.url), 'utf8')));
const validatorSource = compile(await fs.readFile(new URL('../src/world/terrainValidation.ts', import.meta.url), 'utf8'));
const { validateTerrain } = await import(moduleUrl(validatorSource.replace('"../config/terrainShape"', JSON.stringify(config))));

test('terrain height matches actual rendered triangles, including saddles, edges and world height', () => {
  const geometry = new THREE.PlaneGeometry(12, 8, 3, 2);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) positions.setZ(i, (i * 7 % 5) * 0.7);
  const terrain = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.set(17, 6, -11); terrain.updateMatrixWorld(true);
  const sample = createTerrainGridSampler(terrain);
  const raycaster = new THREE.Raycaster();
  // Ray intersections exactly on transformed outer edges can miss by floating
  // point rounding. Check interior rays and the actual corner heights separately.
  for (let x = -5.75; x <= 5.75; x += 0.5) for (let z = -3.75; z <= 3.75; z += 0.5) {
    raycaster.set(new THREE.Vector3(x + 17, 50, z - 11), new THREE.Vector3(0, -1, 0));
    const hit = raycaster.intersectObject(terrain)[0];
    assert.ok(hit, `Missing test triangle at ${x},${z}`);
    assert.ok(Math.abs(sample(x + 17, z - 11) - hit.point.y) < 1e-6, `Height mismatch at ${x},${z}`);
  }
  assert.ok(Math.abs(sample(23, -7) - (6 + positions.getZ(positions.count - 1))) < 1e-6);
  assert.equal(sample(100, 100), null);
  assert.equal(sample(NaN, 0), null);
  positions.setZ(0, 9);
  assert.ok(Math.abs(sample(11, -15) - 15) < 1e-6, 'Sample current geometry, not a stale copy.');
  const flat = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 2, 2));
  flat.rotation.x = -Math.PI / 2; flat.position.y = -1;
  const flatSample = createTerrainGridSampler(flat);
  for (const z of [-30, 30]) assert.equal(flatSample(0, z), -1, 'Keep sea-level comparisons stable after rotation.');
});

test('terrain validation rejects invalid input, underwater worlds, flat sea-level land and isolated islands', () => {
  const segments = 12, stride = segments + 1;
  const options = { segments, size: 120, seaLevel: 0, seaSide: 'east' };
  const grid = (height) => new Float32Array(stride * stride).fill(height);
  assert.equal(validateTerrain({ ...options, baseHeights: grid(-5) }).valid, false);
  assert.ok(validateTerrain({ ...options, baseHeights: grid(0) }).failures.includes('inland-at-waterline'));
  const invalid = grid(2); invalid[1] = NaN;
  assert.ok(validateTerrain({ ...options, baseHeights: invalid }).failures.includes('non-finite-heights'));
  assert.equal(validateTerrain({ ...options, segments: 0, baseHeights: grid(2) }).valid, false);
  const island = grid(-2); for (let z = 4; z <= 8; z++) for (let x = 4; x <= 8; x++) island[z * stride + x] = 2;
  assert.equal(validateTerrain({ ...options, baseHeights: island }).valid, false);
  const mainland = grid(2); for (let z = 0; z < stride; z++) for (let x = 10; x < stride; x++) mainland[z * stride + x] = -2;
  assert.equal(validateTerrain({ ...options, baseHeights: mainland }).valid, true);
});

test('collectible rewards do not leave invisible obstacles in static ground collision', async () => {
  const { CollectiblesManager } = await import('../src/world/collectibles.js');
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(10, 1, 10), new THREE.MeshBasicMaterial()));
  const rewards = new CollectiblesManager(scene);
  rewards.spawnAt(0, 0.5, 0);
  const environment = new EnvironmentCollider(); environment.fromStaticScene(scene);
  assert.equal(environment.mesh.geometry.boundingBox.max.y, 0.5, 'The uncollected reward must not be baked into the collider.');
  rewards.update(0, new THREE.Vector3(0, 1.5, 0));
  assert.equal(rewards.score, 1, 'Pass-through rewards must still be collectible.');
  assert.equal(environment.mesh.geometry.boundingBox.max.y, 0.5, 'Collecting must not leave a ghost obstacle.');
});

test('hidden ancestors and visual-only geometry stay out of collisions after batching', () => {
  const scene = new THREE.Group();
  const material = new THREE.MeshBasicMaterial();
  const solid = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2), material); scene.add(solid);
  const visual = solid.clone(); visual.position.x = 5; visual.userData.noCollision = true; scene.add(visual);
  const hidden = new THREE.Group(); hidden.visible = false; const invisibleRoad = solid.clone(); invisibleRoad.position.x = 10; hidden.add(invisibleRoad); scene.add(hidden);
  poolMaterialsAndMerge(scene);
  assert.equal(scene.children.filter((o) => o.isMesh).length, 2, 'Keep collision ownership when materials are shared.');
  assert.equal(scene.children.filter((o) => o.userData.noCollision).length, 1);
  const environment = new EnvironmentCollider(); environment.fromStaticScene(scene);
  assert.ok(environment.mesh.geometry.boundingBox.max.x < 2, 'Only the visible solid surface belongs to this collider.');
  assert.equal(environment.mesh.geometry.attributes.position.count, 36);
});
