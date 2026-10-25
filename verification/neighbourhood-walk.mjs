import { chromium } from 'playwright';
import { createServer } from 'vite';
import assert from 'node:assert/strict';

// Source modules let this probe use the actual controller/collider without
// exposing test controls in the shipped game. The built app is checked separately.
const server = await createServer({ server: { host: '127.0.0.1', port: 0 }, logLevel: 'error' });
await server.listen();
const browser = await chromium.launch();
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 640, height: 400 } });
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.addInitScript(() => {
    let seed = 123456; Math.random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
    const request = window.requestAnimationFrame.bind(window);
    window.walkFrames = new Set(); window.walkRAF = request;
    window.requestAnimationFrame = (callback) => { let id = request((time) => { window.walkFrames.delete(id); callback(time); }); window.walkFrames.add(id); return id; };
  });
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/athens-game-starter/`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.render_game_to_text === 'function', null, { timeout: 120000 });
  const report = await page.evaluate(async () => {
    for (const id of window.walkFrames) cancelAnimationFrame(id);
    window.requestAnimationFrame = (callback) => callback.name === 'bound _loop' ? 0 : window.walkRAF(callback);
    const { PlayerController } = await import('/athens-game-starter/src/controls/PlayerController.js');
    const { EnvironmentCollider } = await import('/athens-game-starter/src/env/EnvironmentCollider.js');
    const THREE = window.THREE, scene = window.scene;
    const terrain = scene.getObjectByName('Terrain');
    const plan = scene.getObjectByName('CivicDistrict').userData.plan;
    const environment = new EnvironmentCollider(); environment.fromStaticScene(scene);
    const camera = new THREE.PerspectiveCamera();
    const input = { forward: false, consumeLookDelta: () => ({ yaw: 0, pitch: 0 }) };
    const player = new PlayerController(input, environment, { camera, terrainHeightSampler: terrain.userData.getHeightAt });
    player.cameraControlledExternally = true;
    player.position.set(-30, terrain.userData.getHeightAt(-30, 20) + 1, 20); player.syncCapsuleToObject();
    for (let i = 0; i < 30; i++) player.update(1 / 60);
    const paths = [];
    scene.traverse((o) => { if (o.userData.routePoints) paths.push(o.userData); });
    const visited = new Set(); const walks = []; let frames = 0;
    function walkTo(x, z) {
      input.forward = true;
      let steps = 0;
      while (Math.hypot(player.position.x - x, player.position.z - z) > 0.6) {
        camera.position.copy(player.position).add(new THREE.Vector3(0, 2, 0)); camera.lookAt(x, camera.position.y, z); camera.updateMatrixWorld();
        player.update(1 / 30); window.collectibles.update(1 / 30, player.position); frames++;
        if (++steps > 240) throw new Error(`Walking blocked on the way to (${x.toFixed(1)},${z.toFixed(1)}) at ${player.position.toArray().map(v => v.toFixed(2))}`);
        if (player.position.y < terrain.userData.getHeightAt(player.position.x, player.position.z) - 0.5) throw new Error('Player fell through city ground.');
      }
      input.forward = false;
    }
    function visit(place) {
      if (visited.has(place.id)) return;
      walkTo(place.reward.x, place.reward.z);
      const reward = window.collectibles.items.find((item) => Math.abs(item.position.x - place.reward.x) < 0.01 && Math.abs(item.position.z - place.reward.z) < 0.01);
      if (!reward?.userData.collected) throw new Error(`The reward at ${place.label} cannot be collected.`);
      walkTo(place.x, place.z); visited.add(place.id);
    }
    function follow(path, reverse = false) {
      const points = path.routePoints.map(([x, z]) => new THREE.Vector3(x, 0, z));
      if (reverse) points.reverse();
      const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2);
      for (const p of curve.getSpacedPoints(Math.ceil(curve.getLength() / 2))) walkTo(p.x, p.z);
      for (const place of plan.neighbourhoods) if (Math.hypot(player.position.x - place.x, player.position.z - place.z) < 2) visit(place);
      walks.push(path.streetId ?? 'city-connector');
    }
    const byId = (id) => { const path = paths.find((p) => p.streetId === id); if (!path) throw new Error(`Missing ${id}`); return path; };
    const nw = paths.find((p) => p.routePoints[0][0] === -30 && p.routePoints.at(-1)[0] === -108);
    const south = paths.find((p) => p.routePoints[0][0] === -30 && p.routePoints.at(-1)[0] === -45);
    const north = paths.find((p) => p.routePoints[0][0] === -31.5 && p.routePoints.at(-1)[0] === 20);
    follow(nw); follow(byId('potters-olive')); follow(byId('olive-garden')); follow(byId('garden-traders'));
    follow(byId('traders-city')); follow(north, true); walkTo(-30, 20);
    follow(south); follow(byId('weavers-city')); follow(byId('weavers-potters'));
    follow(byId('potters-olive')); follow(byId('olive-traders'));
    return { visited: [...visited], walks, frames, onFoot: !player.flying, finalPosition: player.position.toArray() };
  });
  assert.equal(report.visited.length, 5); assert.equal(report.onFoot, true); assert.deepEqual(errors, []);
  console.log(JSON.stringify({ neighbourhoodWalking: report }));
} finally { await browser.close(); await server.close(); }
