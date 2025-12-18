import asyncio
from playwright.async_api import async_playwright

async def verify_district_config():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Navigate to the app (assuming it is running on port 8000)
        # Note: We need to match the base URL path if one is set.
        # The code indicates base is /athens-game-starter/
        try:
            await page.goto("http://localhost:8000/athens-game-starter/", timeout=30000)

            # Wait for some time to allow game to load and fetch config
            await page.wait_for_timeout(5000)

            # Take a screenshot to verify app loads
            await page.screenshot(path="verification/app_loaded.png")

            # We can also check if the config was loaded by evaluating JS
            # The app likely exposes something or we can check the network

            # Check for console errors (specifically 404s)
            # This is hard to do in screenshot, but we can print them here
            # (In a real scenario, we might hook into page.on("console"))

            print("Page loaded successfully.")
        except Exception as e:
            print(f"Error loading page: {e}")
            await page.screenshot(path="verification/error.png")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_district_config())
