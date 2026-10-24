import { chromium } from "playwright";
import assert from "node:assert/strict";
import { HARBOR_SETBACKS, HARBOR_WATER_BOUNDS } from "../src/world/locations.js";
import { spawn } from "node:child_process";
import http from "node:http";
import https from "node:https";
import { fileURLToPath } from "node:url";
import net from "node:net";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const APP_BASE_PATH = "/athens-game-starter/";
const PREVIEW_PORT_CANDIDATES = [4173, 4174, 4175, 4176];
const STARTUP_TIMEOUT_MS = 60_000;
const VITE_BIN = path.resolve(REPO_ROOT, "node_modules", "vite", "bin", "vite.js");
const ANSI_ESCAPE_PATTERN = /\u001B\[[0-9;]*m/g;

function stripAnsi(text) {
  return text.replace(ANSI_ESCAPE_PATTERN, "");
}

async function isPortAvailable(port) {
  return await new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

async function getPreviewPort() {
  for (const port of PREVIEW_PORT_CANDIDATES) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }

  throw new Error(
    `Unable to find a free preview port in ${PREVIEW_PORT_CANDIDATES.join(", ")}.`,
  );
}

function createPreviewServer(port) {
  const child = spawn(process.execPath, [VITE_BIN, "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
    cwd: REPO_ROOT,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  const appendOutput = (chunk) => {
    output += chunk.toString();
    if (output.length > 8_000) {
      output = output.slice(-8_000);
    }
  };

  child.stdout?.on("data", appendOutput);
  child.stderr?.on("data", appendOutput);

  return {
    child,
    getOutput: () => output,
  };
}

async function waitForPreview(url, server) {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  const parsedUrl = new URL(url);

  while (Date.now() < deadline) {
    if (server.child.exitCode !== null) {
      throw new Error(
        `Preview server exited early with code ${server.child.exitCode}.\n${server.getOutput()}`,
      );
    }

    if (stripAnsi(server.getOutput()).includes(`http://127.0.0.1:${parsedUrl.port}`)) {
      await sleep(1_000);
      return;
    }

    try {
      const response = await new Promise((resolve, reject) => {
        const client = parsedUrl.protocol === "https:" ? https : http;
        const request = client.request(parsedUrl, {
          method: "GET",
          timeout: 1_500,
          headers: {
            Accept: "text/html",
          },
        }, (res) => {
          res.resume();
          resolve(res);
        });

        request.once("timeout", () => {
          request.destroy(new Error("Preview probe timed out."));
        });
        request.once("error", reject);
        request.end();
      });

      if (response.statusCode && response.statusCode >= 200 && response.statusCode < 400) {
        return;
      }
    } catch {
      // Keep polling until the timeout expires.
    }

    await sleep(500);
  }

  throw new Error(
    `Timed out waiting for preview server at ${url}.\n${server.getOutput()}`,
  );
}

async function stopPreviewServer(server) {
  if (!server?.child || server.child.exitCode !== null) {
    return;
  }

  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const killer = spawn("taskkill", ["/pid", String(server.child.pid), "/t", "/f"], {
        stdio: "ignore",
      });
      killer.once("close", () => resolve());
      killer.once("error", () => resolve());
    });
    return;
  }

  server.child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => server.child.once("close", resolve)),
    sleep(2_000),
  ]);
}

function isIgnorableRequestFailure(request) {
  const errorText = request.failure()?.errorText || "";
  return request.method() === "HEAD" && errorText === "net::ERR_ABORTED";
}

async function runVerification() {
  assert.equal(HARBOR_SETBACKS[2].west, HARBOR_WATER_BOUNDS.east, "Preserve main's city exclusion boundary independently of water rendering.");
  const previewPort = await getPreviewPort();
  const appUrl = new URL(APP_BASE_PATH, `http://127.0.0.1:${previewPort}`).toString();
  const previewServer = createPreviewServer(previewPort);
  const consoleErrors = [];
  const requestFailures = [];

  try {
    await waitForPreview(appUrl, previewServer);

    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });
      page.on("pageerror", (error) => {
        consoleErrors.push(String(error));
      });
      page.on("requestfailed", (request) => {
        if (isIgnorableRequestFailure(request)) {
          return;
        }
        requestFailures.push(
          `${request.method()} ${request.url()} :: ${request.failure()?.errorText || "request failed"}`,
        );
      });

      // Keep readable headless lighting, but exercise the real reflective Water
      // shader in the production bundle instead of the simplified water mesh.
      await page.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
      await page.goto(`${appUrl}?automationPreview=1`, { waitUntil: "networkidle" });
      await page.waitForTimeout(10_000);

      const hasCanvas = (await page.locator("canvas").count()) > 0;
      if (!hasCanvas) {
        throw new Error("Verification failed: no canvas element was rendered.");
      }

      const bodyText = await page.locator("body").innerText();
      if (bodyText.includes("We couldn't finish loading Athens")) {
        throw new Error("Verification failed: loading screen reported a startup error.");
      }

      await page.waitForFunction(() => typeof window.render_game_to_text === "function");
      const harborLayout = await page.evaluate(() => {
        const scene = window.scene;
        const civic = scene.getObjectByName("CivicDistrict");
        const plan = civic?.userData.plan;
        const ocean = scene.getObjectByName("AegeanOcean");
        const terrain = scene.getObjectByName("Terrain");
        if (!plan || !ocean) throw new Error("Harbor layout or ocean is missing.");

        ocean.geometry.computeBoundingBox();
        const bounds = ocean.geometry.boundingBox.clone().applyMatrix4(ocean.matrixWorld);
        return {
          normalWater: !ocean.userData.isAutomationFallback && ocean.material.isShaderMaterial,
          court: plan.agoraCourt,
          frontages: plan.frontages?.length ?? 0,
          onFoot: !JSON.parse(window.render_game_to_text()).player.flying,
          upwardRoads: civic.children.filter((object) => object.userData.roadType).every((object) => {
            const normal = object.geometry.attributes.normal;
            for (let i = 0; i < normal.count; i++) if (normal.getY(i) < -0.001) return false;
            return true;
          }),
          templeColumns: (() => {
            const columns = [];
            scene.traverse((object) => {
              if (object.name !== 'TempleColonnade') return;
              object.geometry.computeBoundingBox();
              columns.push(object.geometry.boundingBox.max.y);
            });
            return columns;
          })(),
          waterWest: bounds.min.x,
          waterEast: bounds.max.x,
          seaLevel: ocean.userData.seaLevel,
          basinHeights: [-5, 40].map((z) => terrain.userData.getHeightAt(80, z)),
          cityHeights: [-144, 144].map((z) => terrain.userData.getHeightAt(80, z)),
          // Main now warps lots and intentionally thins outer neighborhoods.
          // Harbor-district lots avoid that thinning and isolate this regression.
          dryLots: plan.grid.filter((cell) =>
            cell.district === "harbor" &&
            cell.position.x > 2 && cell.position.x < 130 &&
            (cell.position.z > 116.8 || cell.position.z < -76.8)
          ).map((cell) => ({
            x: cell.position.x, z: cell.position.z, blocked: cell.blocked, type: cell.type,
          })),
          // Main renders continuous roads and batches building meshes, rather
          // than keeping one scene object at every old grid-cell position.
          roadMeshes: civic.children.filter((object) => object.userData.roadType && object.geometry?.attributes.position.count > 0).length,
          cityBatches: civic.children.filter((object) => object.name.startsWith("MergedBatch_") && object.geometry?.attributes.position.count > 0).length,
          basinBlocked: plan.grid.find((cell) => cell.gridX === 3 && cell.gridZ === 1)?.blocked,
          openSeaBlocked: plan.grid.find((cell) => cell.gridX === 6 && cell.gridZ === 6)?.blocked,
        };
      });
      assert.ok(Math.abs(harborLayout.waterWest - 2) < 0.01, "Water must still cover the full harbor basin.");
      assert.equal(harborLayout.normalWater, true, "Verify the production Water shader rather than simplified automation water.");
      assert.equal(harborLayout.onFoot, true, "Begin the exploration walk on foot.");
      assert.equal(harborLayout.frontages, 5, "Frame the Agora with the authored shopfronts.");
        assert.equal(harborLayout.upwardRoads, true, "Road surfaces must remain visible with the normal gravel material.");
      assert.deepEqual(harborLayout.court, { west: -52, east: -8, south: 6, north: 34 });
      assert.ok(harborLayout.templeColumns.length >= 4 && harborLayout.templeColumns.every((height) => height > 5), "Landmark roofs must have full-height columns.");
      assert.ok(harborLayout.waterEast >= 2467.99, "Open-ocean water coverage must be preserved.");
      assert.ok(harborLayout.basinHeights.every((height) => height < harborLayout.seaLevel - 0.5), "Carve both ends of the authored harbor basin below water.");
      assert.ok(harborLayout.cityHeights.every((height) => height >= harborLayout.seaLevel - 0.05), "Preserve dry city ground north and south of the harbor.");
      assert.ok(harborLayout.dryLots.some((cell) => cell.z > 116.8), "Check north-side city lots.");
      assert.ok(harborLayout.dryLots.some((cell) => cell.z < -76.8), "Check south-side city lots.");
      assert.deepEqual(harborLayout.dryLots.filter((cell) => cell.blocked), [], "Water rendering bounds must not block surrounding dry city lots.");
      assert.ok(harborLayout.roadMeshes > 0, "Preserve main's continuous streets.");
      assert.ok(harborLayout.cityBatches > 0, "Preserve main's batched city geometry.");
      assert.equal(harborLayout.basinBlocked, true, "Keep city buildings out of the harbor basin.");
      assert.equal(harborLayout.openSeaBlocked, true, "Keep city buildings out of the deep ocean.");
    } finally {
      await browser.close();
    }
  } finally {
    await stopPreviewServer(previewServer);
  }

  if (requestFailures.length > 0) {
    throw new Error(
      `Verification failed: network requests failed.\n${requestFailures.join("\n")}`,
    );
  }

  if (consoleErrors.length > 0) {
    throw new Error(
      `Verification failed: browser console errors were detected.\n${consoleErrors.join("\n")}`,
    );
  }

  console.log(`Verification passed: ${appUrl} loaded without console or network errors.`);
}

runVerification().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
