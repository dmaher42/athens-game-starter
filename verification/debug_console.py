from playwright.sync_api import sync_playwright

def run():
    print("Starting debug...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Log all console messages
        page.on("console", lambda msg: print(f"CONSOLE [{msg.type}]: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

        print("Navigating...")
        try:
            page.goto("http://localhost:8000/athens-game-starter/")
            print("Navigated.")
        except Exception as e:
            print(f"Navigation failed: {e}")
            return

        print("Waiting for load (40s)...")
        page.wait_for_timeout(40000)
        print("Done waiting.")

        browser.close()

if __name__ == "__main__":
    run()
