
from playwright.sync_api import sync_playwright
import time

def verify_mainland(page):
    print("Navigating...")
    page.goto("http://localhost:8000")

    # Wait for loading screen to disappear
    print("Waiting for loading...")
    try:
        # Wait up to 60s for loading
        page.wait_for_selector("#athens-loading-screen.is-hidden", timeout=60000)
    except Exception as e:
        print("Loading screen might not have hidden via class, or timed out. Checking if removed.")
        # It might be removed from DOM

    # Wait a bit more for rendering to settle
    time.sleep(5)

    # We need to move the camera to see the mountains.
    # We can inject JS to move the player or camera.

    print("Moving camera to high vantage point...")

    # Move player up and look East
    page.evaluate("""
        const player = window.application?.scene?.userData?.player; // Maybe accessible?
        // Actually Application instance is not global window.application.
        // But we can try to access scene via Three.js hook if possible?
        // Or just key presses.
    """)

    # Let's use keys. Toggle Fly mode (G)
    page.keyboard.press("KeyG")
    time.sleep(0.5)

    # Fly Up (Space)
    print("Flying up...")
    for _ in range(50):
        page.keyboard.press("Space")
        time.sleep(0.05)

    # Look East (ArrowRight/ArrowLeft turn YAW)
    # Default yaw is likely 0 (North? or South?).
    # InputMap: ArrowLeft -> turn left. ArrowRight -> turn right.
    # We want to look East (+X).
    # If we start facing North (-Z), East is Right.

    print("Turning to look East...")
    for _ in range(20):
        page.keyboard.press("ArrowRight")
        time.sleep(0.05)

    time.sleep(2)
    page.screenshot(path="verification/view_east_mountains.png")
    print("Taken screenshot looking East.")

    # Look West (Open Sea)
    print("Turning to look West...")
    for _ in range(40):
        page.keyboard.press("ArrowRight")
        time.sleep(0.05)

    time.sleep(2)
    page.screenshot(path="verification/view_west_sea.png")
    print("Taken screenshot looking West.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_mainland(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
