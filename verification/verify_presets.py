from playwright.sync_api import sync_playwright, expect

def verify_hud_presets():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a larger viewport to ensure the HUD is visible
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        try:
            # Navigate to the app
            page.goto("http://localhost:8000")

            # Wait for the HUD to load.
            # The HUD seems to be injected into the DOM.
            # We look for the "Lighting Presets" heading or the buttons.
            # It might take some time for the app to initialize.
            page.wait_for_selector(".hud-lighting-presets", timeout=30000)

            # Check for the presence/absence of buttons
            # We expect "Blue Hour", "Golden Hour", "Bright Noon", "Deep Night" to be present
            # We expect "Dawn", "High Noon", "Dusk", "Night" to be ABSENT

            # Using get_by_role for buttons
            expect(page.get_by_role("button", name="Blue Hour")).to_be_visible()
            expect(page.get_by_role("button", name="Golden Hour")).to_be_visible()
            expect(page.get_by_role("button", name="Bright Noon")).to_be_visible()
            expect(page.get_by_role("button", name="Deep Night")).to_be_visible()

            # Check for absence
            expect(page.get_by_role("button", name="Dawn")).not_to_be_visible()
            expect(page.get_by_role("button", name="High Noon")).not_to_be_visible()
            expect(page.get_by_role("button", name="Dusk")).not_to_be_visible()
            expect(page.get_by_role("button", name="Night", exact=True)).not_to_be_visible() # Exact=True to avoid confusion if "Deep Night" matches "Night"

            print("Verification Successful: Correct presets are visible.")

            # Take a screenshot
            page.screenshot(path="verification/hud_presets.png")

        except Exception as e:
            print(f"Verification Failed: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_hud_presets()
