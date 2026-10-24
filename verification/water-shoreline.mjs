import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

// An isolated server tests the actual source shader without changing the game.
const server = process.argv[2] ? null : await createServer({ server: { host: '127.0.0.1', port: 0 }, logLevel: 'error' });
await server?.listen();
const origin = process.argv[2] || `http://127.0.0.1:${server.httpServer.address().port}`;
const browser = await chromium.launch();
const errors = [];
try {
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  // Keep WebDriver enabled: automated previews must use the same real Water.
  await page.goto(`${origin}/athens-game-starter/verification/water-shoreline.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.ready, null, { timeout: 60000 });
  const report = await page.evaluate(() => window.runShorelineCheck());
  assert.equal(report.normalWater, true);
  assert.equal(report.waterTime, 1.5, 'The normal Water material must receive frame updates.');
  assert.ok(report.sunLengthSq > 0.99, 'A zero lighting update must not invalidate the Water shader.');
  assert.equal(report.shorelineCompiled, true, 'The actual compiled Water shader must contain the shoreline mask.');
  for (const view of report.results) {
    assert.ok(view.checked > 100 && view.wet > 20 && view.dry > 20, 'Probe both water and land.');
    assert.equal(view.mismatches, 0, `Water/ground ownership differed from the rendered terrain at ${view.position}.`);
    assert.equal(view.coloredWet, view.wet, 'Visible water must have finite, non-black shader output.');
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify(report));
} finally { await browser.close(); await server?.close(); }
