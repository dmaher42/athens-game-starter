from playwright.sync_api import sync_playwright

def verify_terrain(page):
    # Enable console logging
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.on("pageerror", lambda exc: print(f"PageError: {exc}"))

    # Go to the app
    try:
        page.goto("http://localhost:8000")
    except Exception as e:
        print(f"Nav Error: {e}")

    # Wait for the loading screen to disappear
    try:
        page.wait_for_selector("#athens-loading-screen.is-hidden", state="attached", timeout=60000)
    except Exception as e:
        print(f"Timeout waiting for loading screen: {e}")

    # Wait a bit more for the scene to settle
    page.wait_for_timeout(5000)

    # Take a screenshot regardless of success
    page.screenshot(path="verification/terrain_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_terrain(page)
        except Exception as e:
            print(f"Script Error: {e}")
        finally:
            browser.close()
