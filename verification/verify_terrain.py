from playwright.sync_api import sync_playwright

def verify_terrain(page):
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.goto("http://localhost:8000")
    page.wait_for_selector("#athens-loading-screen", state="hidden", timeout=60000)
    page.wait_for_timeout(15000)
    page.screenshot(path="verification/terrain_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--enable-unsafe-swiftshader"])
        page = browser.new_page()
        try:
            verify_terrain(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
