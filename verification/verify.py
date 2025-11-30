from playwright.sync_api import sync_playwright, expect
import time

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Define a handler for console messages
        def log_console_message(msg):
            print(f"BROWSER LOG: {msg.text}")

        page.on('console', log_console_message)

        try:
            # Navigate to the local development server
            page.goto("http://localhost:8000/athens-game-starter/", timeout=60000)

            # Wait for 60 seconds to ensure the application is fully loaded.
            time.sleep(60)

            # Click the "High Noon" button to change the lighting
            high_noon_button = page.get_by_role("button", name="High Noon")
            expect(high_noon_button).to_be_visible(timeout=10000)
            high_noon_button.click()

            # Wait a few seconds for the lighting to change
            time.sleep(5)

            # Take a screenshot
            page.screenshot(path="verification.png")
            print("Screenshot taken.")

        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
