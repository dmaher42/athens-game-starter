from playwright.sync_api import sync_playwright

def verify_app_loads():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the app (assuming default vite port 8000)
            page.goto("http://localhost:8000/athens-game-starter/")

            # Wait for the loading screen to disappear
            # The loading screen adds class "is-hidden" and then removes itself
            # We can wait for the element with id "athens-loading-screen" to be detached
            page.wait_for_selector("#athens-loading-screen", state="detached", timeout=120000)

            # Wait for "Press E to interact" hint or just some time
            page.wait_for_timeout(2000)

            # Take a screenshot of the actual scene
            page.screenshot(path="verification/screenshot_scene.png")
            print("Screenshot taken successfully")

        except Exception as e:
            print(f"Error: {e}")
            # Take a screenshot even on error to see state
            page.screenshot(path="verification/screenshot_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app_loads()
