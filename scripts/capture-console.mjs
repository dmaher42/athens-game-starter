import { chromium } from 'playwright';

const URL = 'http://localhost:5173/athens-game-starter/';

try {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', (msg) => console.log(`[page][${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => console.log(`[page][error] ${err}`));

  console.log('navigating to', URL);
  await page.goto(URL, { waitUntil: 'networkidle' });
  console.log('page loaded — capturing console for 8s');
  await page.waitForTimeout(8000);

  await browser.close();
  console.log('done');
} catch (err) {
  console.error('capture failed:', err);
  process.exit(1);
}
