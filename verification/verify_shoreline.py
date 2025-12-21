from playwright.sync_api import sync_playwright

def verify_shoreline():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a larger viewport to see more of the ocean
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        # Navigate to the app
        print("Navigating...")
        page.goto("http://localhost:8000/athens-game-starter/")

        # Wait for loading screen to disappear
        print("Waiting for loading screen...")
        try:
            # Wait for the loading screen to be hidden (class changes to 'is-hidden' then removed)
            # Or just wait for canvas to be stable.
            # Memory says "The application performs intensive world generation... requiring a wait time of approximately 30 seconds"
            page.wait_for_timeout(35000)
        except Exception as e:
            print(f"Wait failed or timeout: {e}")

        # Take a screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification/shoreline_check.png")

        browser.close()

if __name__ == "__main__":
    verify_shoreline()
