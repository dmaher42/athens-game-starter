import { test, expect } from "@playwright/test";

test("hotkey overlay renders keys as kbd elements", async ({ page }) => {
  // Go to app
  await page.goto("http://localhost:8000/");

  // Wait for the hotkey overlay to be present in DOM (it might be hidden initially)
  const overlay = page.locator(".hotkey-overlay");
  await expect(overlay).toBeAttached();

  // If hidden, we need to toggle it. "H" is default toggle.
  // Or click the button if visible.
  // The default state depends on localStorage, but initially it is hidden.
  // Let"s press "H".
  await page.keyboard.press("H");

  // Wait for panel to be visible
  const panel = page.locator(".hotkey-overlay__panel");
  await expect(panel).toBeVisible();

  // Check for kbd elements
  const kbd = page.locator(".hotkey-overlay__kbd").first();
  await expect(kbd).toBeVisible();

  // Take screenshot
  await page.screenshot({ path: "verification/hotkey-overlay.png" });
});
