from playwright.sync_api import sync_playwright

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Collect console logs
        logs = []
        page.on("console", lambda msg: logs.append(msg.text))

        try:
            # Increased timeout to 60 seconds and corrected the port
            page.goto("http://localhost:8000/athens-game-starter/", timeout=60000)

            # Wait for the loading screen to disappear
            page.wait_for_selector("#athens-loading-screen", state="hidden", timeout=30000)

            # Wait an additional 5 seconds for the scene to render
            page.wait_for_timeout(5000)

            page.screenshot(path="verification/harbor_verification.png")
            print("Screenshot captured successfully.")

        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="verification/error_screenshot.png")

        finally:
            # Print all captured console logs
            print("\n--- Browser Console Logs ---")
            for log in logs:
                print(log)
            print("--------------------------\n")

            browser.close()

if __name__ == "__main__":
    run_verification()
