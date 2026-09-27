"""Render the thumbnail variants: python videos/001-antikythera/thumbnail/make.py"""
import sys
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

here = Path(__file__).parent
sys.path.insert(0, str(here.parents[2] / "engine"))
from snap import launch  # noqa: E402

with sync_playwright() as p:
    browser = launch(p)
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    for v in "abc":
        page.goto((here / "thumb.html").resolve().as_uri() + "#" + v)
        page.reload()
        page.wait_for_function("window.done === true")
        page.wait_for_timeout(200)
        raw = here / f"thumb-{v}@2x.png"
        page.screenshot(path=str(raw))
        Image.open(raw).convert("RGB").resize((1280, 720), Image.LANCZOS).save(here / f"thumb-{v}.jpg", quality=92)
        raw.unlink()
        print(here / f"thumb-{v}.jpg")
    browser.close()
