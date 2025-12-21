import { test, expect } from '@playwright/test';

test('verify grass rendering', async ({ page }) => {
  await page.goto('http://localhost:4173/');
  // Wait for canvas to be present
  await page.waitForSelector('canvas');
  // Wait for some time for things to load (grass takes time?)
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'verification/grass_verification.png' });
});
