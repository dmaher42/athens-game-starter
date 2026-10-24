import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PlayerController } from '../src/controls/PlayerController.js';
import { EnvironmentCollider } from '../src/env/EnvironmentCollider.js';

test('walking follows the visible camera in every direction', () => {
  const camera = new THREE.PerspectiveCamera();
  const input = { forward: true };
  const player = new PlayerController(input, null, { camera });
  for (const yaw of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    camera.position.set(Math.sin(yaw) * 10, 5, -Math.cos(yaw) * 10);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    const expected = camera.getWorldDirection(new THREE.Vector3()).setY(0).normalize();
    player.computeDesiredVelocity(4);
    assert.ok(player.desired.clone().normalize().dot(expected) > 0.9999);
    input.forward = false; input.right = true;
    player.computeDesiredVelocity(4);
    assert.ok(player.desired.clone().normalize().dot(expected.clone().cross(new THREE.Vector3(0, 1, 0))) > 0.9999);
    input.forward = true; input.right = false;
  }
  player.cameraControlledExternally = true;
  const before = camera.position.clone();
  player.updateCamera(1 / 60);
  assert.deepEqual(camera.position, before, 'The fallback camera must not overwrite the orbit camera.');
});

test('walking survives a long rendering stall without tunnelling through the floor', () => {
  const floor = new THREE.Mesh(new THREE.BoxGeometry(100, 1, 100));
  floor.position.y = -0.5;
  const environment = new EnvironmentCollider();
  environment.fromStaticScene(floor);
  const player = new PlayerController({ consumeLookDelta: () => ({ yaw: 0, pitch: 0 }) }, environment);
  player.object.position.set(0, 2, 0);
  player.syncCapsuleToObject();
  player.update(12);
  for (let i = 0; i < 120; i++) player.update(1 / 60);
  assert.ok(player.object.position.y >= 0.89);
  assert.equal(player.grounded, true);
  assert.equal(player.flying, false);
});
