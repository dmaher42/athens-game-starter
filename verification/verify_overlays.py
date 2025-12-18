from playwright.sync_api import sync_playwright

def verify_city_overlays():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Add args to use software rendering or disable GPU if needed,
        # but headless usually works fine for screenshots.
        # We might need to wait for the scene to load.
        page = browser.new_page()

        print("Navigating to local server...")
        # Assuming the dev server is running on port 8000 based on memory
        try:
            page.goto("http://localhost:8000", timeout=60000)
        except Exception as e:
            print(f"Failed to load page: {e}")
            browser.close()
            return

        print("Waiting for scene to load (approx 30s)...")
        # The memory says "Sculpting the Attic landscape..." takes about 30 seconds.
        # We can wait for a specific element or just time.
        # Let's wait 40 seconds to be safe.
        page.wait_for_timeout(40000)

        print("Taking screenshot...")
        # We want to see the city plan overlays. They are usually at the center.
        # The default camera might be looking at the character.
        # Ideally we would move the camera to see the city plan, but without
        # easy control interactions in headless, we might just take what we get.
        # Or we can try to inject JS to move the camera.

        # Inject script to move camera to look at the city center (Agora/Civic Core)
        # AGORA_CENTER_3D is roughly (0,0,0) or near it.
        page.evaluate("""
            if (window.camera && window.controls) {
                // Try to move camera
                window.camera.position.set(0, 100, 100);
                window.camera.lookAt(0, 0, 0);
                window.controls.update();
            }
        """)

        # Wait a bit for render
        page.wait_for_timeout(2000)

        page.screenshot(path="verification/city_overlays.png")
        print("Screenshot saved to verification/city_overlays.png")

        browser.close()

if __name__ == "__main__":
    verify_city_overlays()
