import test from 'node:test';
import assert from 'node:assert/strict';
import { Texture, TextureLoader } from 'three';
import { makeMarbleMaterialSet, makeColumn } from '../src/features/buildingKit.js';

test('shared building maps load once, keep independent tiling, and recover after failure', async (t) => {
  const original = TextureLoader.prototype.loadAsync;
  const originalWarn = console.warn;
  const warnings = [];
  const calls = new Map();
  console.warn = (...args) => warnings.push(args[0]);
  t.after(() => { TextureLoader.prototype.loadAsync = original; console.warn = originalWarn; });
  TextureLoader.prototype.loadAsync = async function (url) {
    calls.set(url, (calls.get(url) || 0) + 1);
    await new Promise(resolve => setImmediate(resolve));
    if (url.endsWith('/retry.jpg') && calls.get(url) === 1) throw new Error('Expected transient load failure');
    return new Texture();
  };
  const options = { baseUrl: 'https://example.test/shared/' };
  const sets = await Promise.all(Array.from({ length: 32 }, () => makeMarbleMaterialSet(options)));
  assert.equal(calls.size, 4);
  assert.ok([...calls.values()].every(count => count === 1), 'Deduplicate concurrent image processing.');
  for (const set of sets) for (const key of ['map', 'normalMap', 'roughnessMap', 'aoMap']) {
    assert.equal(set[key], sets[0][key]);
  }

  const [a, b] = await Promise.all([makeColumn({ materialOptions: options }), makeColumn({ materialOptions: options })]);
  const mapA = a.material.map, mapB = b.material.map;
  assert.ok(a.isMesh && a.geometry.attributes.position.count > 100, 'Columns provide real instanced geometry.');
  a.geometry.computeBoundingBox();
  assert.ok(a.geometry.boundingBox.max.y > 7, 'The capital must sit above the full-height shaft.');
  assert.notEqual(mapA, mapB, 'Building materials retain separate texture transforms.');
  mapA.repeat.set(9, 7);
  assert.equal(mapB.repeat.x, 1);
  assert.equal(sets[0].map.repeat.x, 1);
  assert.ok([...calls.values()].every(count => count === 1));

  const alternate = await makeMarbleMaterialSet({ baseUrl: 'https://example.test/other/' });
  assert.notEqual(alternate.map, sets[0].map, 'Different asset roots remain distinct.');
  const mixed = await makeMarbleMaterialSet({ ...options, map: 'textures/marble_normal-dx.jpg' });
  assert.notEqual(mixed.map, mixed.normalMap, 'Color and normal maps need separate color-space settings.');

  await makeMarbleMaterialSet({ ...options, map: 'retry.jpg' });
  const recovered = await makeMarbleMaterialSet({ ...options, map: 'retry.jpg' });
  assert.equal(calls.get('https://example.test/shared/retry.jpg'), 2);
  assert.ok(recovered.map instanceof Texture);
  assert.equal(warnings.length, 1, 'Report the simulated failure once and retry it successfully.');
});
