
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const viteLogPath = path.resolve(__dirname, '..', 'vite.log');

  let serverReady = false;
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds max wait
  while (!serverReady && attempts < maxAttempts) {
    try {
      const logContent = await fs.readFile(viteLogPath, 'utf8');
      if (logContent.includes('Local:') && logContent.includes('http://localhost:5173')) {
        serverReady = true;
        console.log('Vite server is ready.');
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {
      // Log file might not exist yet
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    attempts++;
  }

  if (!serverReady) {
    console.error('Timeout: Vite server did not start within 30 seconds.');
    process.exit(1);
  }

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const errorText = msg.text();
      // Ignore benign errors if any, for now logging all
      console.error(`Browser console error: ${errorText}`);
      consoleErrors.push(errorText);
    }
  });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    // Increased wait time to ensure all scripts have loaded and executed
    await page.waitForTimeout(10000);
  } catch (error) {
    console.error('Failed to load the page:', error);
    await browser.close();
    process.exit(1);
  }

  await browser.close();

  if (consoleErrors.length > 0) {
    console.error('Test failed: Console errors were detected.');
    process.exit(1);
  } else {
    console.log('Test passed: No console errors detected.');
    process.exit(0);
  }
})();
