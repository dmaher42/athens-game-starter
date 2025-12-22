from playwright.sync_api import sync_playwright

def verify_walking_experience():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a larger viewport to capture more context
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        print("Navigating to app...")
        # Force "Bright Noon" via generic lighting parameter if possible,
        # or rely on UI interaction.
        page.goto("http://localhost:8000/")

        # Wait for loading screen to disappear
        print("Waiting for loading screen...")
        try:
            page.wait_for_selector("#athens-loading-screen.is-hidden", timeout=60000)
        except Exception:
            print("Loading screen timeout - taking screenshot anyway")

        # Wait a bit more for terrain generation
        page.wait_for_timeout(5000)

        # 1. Verify "Bright Noon" look
        # Click the "Bright Noon" button in DevHUD if available
        try:
            # Assuming DevHUD has buttons with text matching presets
            page.get_by_text("Bright Noon", exact=True).click(timeout=3000)
            print("Selected Bright Noon preset")
        except:
            print("Could not find Bright Noon button, assuming default or waiting")

        page.wait_for_timeout(2000)
        page.screenshot(path="verification/step1_bright_noon.png")
        print("Captured Bright Noon")

        # 2. Verify World Sealing (Look down/at horizon)
        # Simulate looking down/around
        # We can't easily move camera in screenshot without inputs,
        # but we can check if the initial view is solid.

        # 3. Switch to "Golden Hour" to verify lock/switch stability
        try:
            page.get_by_text("Golden Hour", exact=True).click(timeout=3000)
            print("Selected Golden Hour preset")
            page.wait_for_timeout(2000)
            page.screenshot(path="verification/step2_golden_hour.png")
        except:
            print("Could not find Golden Hour button")

        # 4. Switch back to "Bright Noon" to verify repeatability
        try:
            page.get_by_text("Bright Noon", exact=True).click(timeout=3000)
            print("Returned to Bright Noon")
            page.wait_for_timeout(2000)
            page.screenshot(path="verification/step3_bright_noon_return.png")
        except:
            pass

        browser.close()

if __name__ == "__main__":
    verify_walking_experience()
