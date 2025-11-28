
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  test.setTimeout(120000); // Increase test timeout to 2 minutes
  await page.goto('http://localhost:5173/athens-game-starter/');

  const duskButton = page.getByRole('button', { name: 'Dusk' });
  await duskButton.waitFor({ state: 'visible', timeout: 90000 });

  // Click the "Dusk" button to improve lighting
  await duskButton.click();
  await page.waitForTimeout(2000);

  // Adjust the exposure
  const exposureSlider = page.locator('input[type="range"]').first();
  await exposureSlider.waitFor({ state: 'visible' });
  await exposureSlider.fill('1.5');
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'verification/verification.png' });
});
