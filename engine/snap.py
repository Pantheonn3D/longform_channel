"""Render an HTML file to a PNG/JPEG at an exact pixel size.

    python engine/snap.py brand/src/logo.html brand/out/logo-800.png 800 800
"""
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright


def launch(p):
    # Use a preinstalled Chromium when the bundled Playwright build isn't downloaded.
    exe = os.environ.get("CHROMIUM") or ("/opt/pw-browsers/chromium" if Path("/opt/pw-browsers/chromium").exists() else None)
    return p.chromium.launch(executable_path=exe, args=["--font-render-hinting=none"])


def snap(src, out, width, height):
    out = Path(out)
    out.parent.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = launch(p)
        page = browser.new_page(viewport={"width": width, "height": height})
        page.goto(Path(src).resolve().as_uri())
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(150)
        kind = "jpeg" if out.suffix.lower() in (".jpg", ".jpeg") else "png"
        opts = {"quality": 92} if kind == "jpeg" else {}
        page.screenshot(path=str(out), type=kind, **opts)
        browser.close()


if __name__ == "__main__":
    snap(sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]))
