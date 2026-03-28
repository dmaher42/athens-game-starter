import { chromium } from "playwright";
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

      await page.goto(appUrl, { waitUntil: "networkidle" });
      await page.waitForTimeout(10_000);

      const hasCanvas = (await page.locator("canvas").count()) > 0;
      if (!hasCanvas) {
        throw new Error("Verification failed: no canvas element was rendered.");
      }

      const bodyText = await page.locator("body").innerText();
      if (bodyText.includes("We couldn't finish loading Athens")) {
        throw new Error("Verification failed: loading screen reported a startup error.");
      }
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
