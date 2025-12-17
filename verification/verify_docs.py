from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # We need to serve the docs folder to test it.
        # Since we can't easily start a static server for docs/ in this script without dependencies,
        # we will assume the dev server is running and check the 'build' artifacts if possible.
        # BUT, the user wants us to verify the BUILD output.
        # We can use python http.server to serve the docs folder in the background.

        # However, to keep it simple, let's try to verify the dev server first to ensure the app works.
        # But the specific issue was about the BUILD output.

        # Let's rely on the previous verification/verify.py output or just create a new one that
        # waits a bit longer and takes a screenshot.

        page = browser.new_page()
        try:
            # We will use the dev server which I started on port 8000
            # Note: The dev server serves from root.
            # To test the docs folder specifically, I should serve it.
            pass
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
