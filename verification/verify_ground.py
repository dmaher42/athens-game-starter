from playwright.sync_api import sync_playwright
import time

def verify_ground(page):
    print("Navigating to app...")
    # The log shows the base URL is /athens-game-starter/
    page.goto("http://localhost:8000/athens-game-starter/")

    # Wait for the "Sculpting the Attic landscape..." or similar loading to finish
    # We can wait for the loading screen to be hidden.
    print("Waiting for loading screen to hide...")
    try:
        page.wait_for_selector("#athens-loading-screen.is-hidden", timeout=90000)
    except Exception as e:
        print(f"Wait failed: {e}")
        # Take a screenshot anyway to debug
        page.screenshot(path="verification/timeout_debug.png")
        return

    # Wait a bit more for full rendering/textures
    print("Wait for rendering...")
    time.sleep(10)

    print("Taking screenshot...")
    page.screenshot(path="verification/ground_readability.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_ground(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
