from playwright.sync_api import sync_playwright

def verify_scene():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Wait for server to start
            page.goto("http://localhost:8000")

            # Wait for canvas to be present
            page.wait_for_selector("canvas")

            # Wait for loading screen to disappear (if any) or some time for scene to render
            # The loading screen might have id "loading-screen" or similar class
            # Just waiting a fixed amount of time is safest for 3D scene initialization in this context
            page.wait_for_timeout(30000) # Wait 30 seconds for heavy assets

            # Take screenshot
            page.screenshot(path="verification/scene_verification.png")
            print("Screenshot taken")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_scene()
