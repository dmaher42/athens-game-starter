import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { NEIGHBOURHOODS, NEIGHBOURHOOD_STREETS, CITY_CORE_STREETS, neighbourhoodFrontages } from '../src/world/neighbourhoodLayout.js';
import { HARBOR_SETBACKS } from '../src/world/locations.js';
import { Prefabs } from '../src/world/buildingSpawner.js';
import { PlayerController } from '../src/controls/PlayerController.js';
import { EnvironmentCollider } from '../src/env/EnvironmentCollider.js';

test('every neighbourhood connects to the city and has another way out', () => {
  const graph = new Map();
  const key = (p) => p.join(',');
  for (const street of NEIGHBOURHOOD_STREETS) {
    const a = key(street.points[0]), b = key(street.points.at(-1));
    if (!graph.has(a)) graph.set(a, new Set());
    if (!graph.has(b)) graph.set(b, new Set());
    graph.get(a).add(b); graph.get(b).add(a);
  }
  const visited = new Set(CITY_CORE_STREETS.flatMap(s=>s.points.map(key)));
  const queue = [...visited];
  while (queue.length) for (const next of graph.get(queue.shift()) ?? []) {
    if (!visited.has(next)) { visited.add(next); queue.push(next); }
  }
  for (const place of NEIGHBOURHOODS) {
    assert.ok(visited.has(key([place.x, place.z])), `${place.label} is disconnected.`);
    assert.ok(graph.get(key([place.x, place.z])).size >= 2, `${place.label} is a dead end.`);
    assert.ok(neighbourhoodFrontages(place).length >= 2, `${place.label} lacks an enclosing street frontage.`);
    for (const rect of HARBOR_SETBACKS) assert.equal(place.x >= Math.min(rect.west, rect.east) && place.x <= Math.max(rect.west, rect.east) && place.z >= Math.min(rect.south, rect.north) && place.z <= Math.max(rect.south, rect.north), false);
  }
});

test('houses have roofs above their walls and courtyards admit a walking player', (t) => {
  const originalLoad = THREE.TextureLoader.prototype.load;
  THREE.TextureLoader.prototype.load = () => new THREE.Texture();
  const previousDocument = globalThis.document;
  globalThis.document = { createElement: () => ({ getContext: () => ({ createRadialGradient: () => ({ addColorStop() {} }), fillRect() {} }) }) };
  t.after(() => { THREE.TextureLoader.prototype.load = originalLoad; globalThis.document = previousDocument; });
  const house = Prefabs.house({ w: 9, d: 8, h: 4, rng: () => 0.4 });
  const roof = house.children.at(-1);
  house.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(roof);
  assert.ok(bounds.min.y >= 3.99 && bounds.max.y > 5, 'Roof depth must not hang down through the house.');
  assert.ok(Math.abs(bounds.min.z + 4.1) < 0.01 && Math.abs(bounds.max.z - 4.1) < 0.01);
  const courtyard = Prefabs.courtyard({ w: 8, d: 8 });
  const scene = new THREE.Group(); scene.add(courtyard);
  const floor = new THREE.Mesh(new THREE.BoxGeometry(40, 1, 40)); floor.position.y = -0.5; scene.add(floor);
  const environment = new EnvironmentCollider(); environment.fromStaticScene(scene);
  const camera = new THREE.PerspectiveCamera(); camera.position.set(0, 4, 10); camera.lookAt(0, 1, 0); camera.updateMatrixWorld();
  const player = new PlayerController({ forward: true, consumeLookDelta: () => ({ yaw: 0, pitch: 0 }) }, environment, { camera });
  player.cameraControlledExternally = true; player.position.set(0, 0.9, 8); player.syncCapsuleToObject();
  for (let i = 0; i < 120; i++) player.update(1 / 60);
  assert.ok(player.position.z < 1, 'The courtyard entrance must admit the normal player capsule.');
});
