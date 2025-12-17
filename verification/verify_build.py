from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to http://localhost:8000/athens-game-starter/")
            page.goto("http://localhost:8000/athens-game-starter/")

            # Wait for the app to load
            # We expect #app to eventually contain canvas or some content.
            # The starter probably renders a canvas.
            page.wait_for_selector("canvas", timeout=10000)

            print("Canvas found. Taking screenshot.")
            page.screenshot(path="verification/build_verification.png")
            print("Screenshot saved to verification/build_verification.png")

        except Exception as e:
            print(f"Error: {e}")
            # Take screenshot of failure
            page.screenshot(path="verification/build_failure.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
