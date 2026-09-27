"""Render a video from its script timeline and scenes.

    python engine/render.py videos/001-antikythera --stills 12 60 300   # PNG stills at those seconds
    python engine/render.py videos/001-antikythera --beats              # one still per narration beat
    python engine/render.py videos/001-antikythera                      # full 1080p30 render + narration mix

Requires build/timeline.json and build/narration.wav from tts.py.
"""
import argparse
import base64
import json
import subprocess
import sys
from multiprocessing import Process
from pathlib import Path

from playwright.sync_api import sync_playwright

ENGINE = Path(__file__).parent
sys.path.insert(0, str(ENGINE))
from snap import launch  # noqa: E402


def open_player(p, video):
    browser = launch(p)
    page = browser.new_page(viewport={"width": 1920, "height": 1080})
    page.on("console", lambda m: print("  [page]", m.text) if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: print("  [page error]", e))
    page.goto((ENGINE / "player.html").resolve().as_uri())
    assets = {f.stem: json.loads(f.read_text()) for f in (video / "assets").glob("*.json")} if (video / "assets").exists() else {}
    timeline = json.loads((video / "build" / "timeline.json").read_text())
    page.evaluate("([t, a]) => { window.TIMELINE = t; window.ASSETS = a; }", [timeline, assets])
    page.evaluate("src => loadScenes(src)", (video / "scenes.js").resolve().as_uri())
    page.evaluate("document.fonts.load('600 40px Fraunces').then(() => document.fonts.load('500 30px Inter')).then(() => document.fonts.ready)")
    info = page.evaluate("setup()")
    cdp = page.context.new_cdp_session(page)
    return browser, page, cdp, info


def grab(page, cdp, t, fmt="jpeg"):
    page.evaluate("t => frame(t)", t)
    opts = {"format": fmt, "optimizeForSpeed": True, "captureBeyondViewport": False}
    if fmt == "jpeg":
        opts["quality"] = 94
    return base64.b64decode(cdp.send("Page.captureScreenshot", opts)["data"])


def stills(video, times, out_dir):
    out_dir.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser, page, cdp, info = open_player(p, video)
        for t in times:
            path = out_dir / f"t{t:07.2f}.png"
            path.write_bytes(grab(page, cdp, t, "png"))
            print(path)
        browser.close()


def shot_times(video):
    """Mid-point of every beat, labelled; handy for reviewing each shot."""
    tl = json.loads((video / "build" / "timeline.json").read_text())
    return [round((b["start"] + b["end"]) / 2, 2) for b in tl["beats"]]


def worker(video, start, end, fps, out):
    with sync_playwright() as p:
        browser, page, cdp, info = open_player(p, video)
        enc = subprocess.Popen(
            ["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(fps), "-c:v", "mjpeg", "-i", "-",
             "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", "-g", str(fps * 2), str(out)],
            stdin=subprocess.PIPE)
        for f in range(start, end):
            enc.stdin.write(grab(page, cdp, f / fps))
            if (f - start) % 600 == 0:
                print(f"  {out.name}: frame {f - start}/{end - start}", flush=True)
        enc.stdin.close()
        enc.wait()
        browser.close()


def full(video, fps=30, workers=4, limit=None):
    build = video / "build"
    tl = json.loads((build / "timeline.json").read_text())
    total = int((limit or tl["duration"]) * fps)
    parts, procs = [], []
    for i in range(workers):
        a, b = total * i // workers, total * (i + 1) // workers
        out = build / f"part{i}.mp4"
        parts.append(out)
        procs.append(Process(target=worker, args=(video, a, b, fps, out)))
    for pr in procs:
        pr.start()
    for pr in procs:
        pr.join()
        if pr.exitcode:
            raise SystemExit(f"worker failed: {pr.exitcode}")
    (build / "parts.txt").write_text("".join(f"file '{p.name}'\n" for p in parts))
    out = video / "out" / f"{video.name}.mp4"
    out.parent.mkdir(exist_ok=True)
    music = video / "build" / "music.wav"
    audio_in = ["-i", str(build / "narration.wav")] + (["-i", str(music)] if music.exists() else [])
    mix = "[1:a][2:a]amix=inputs=2:duration=first:normalize=0," if music.exists() else "[1:a]"
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(build / "parts.txt"), *audio_in,
         "-filter_complex", f"{mix}loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]",
         "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(out)],
        check=True)
    print(out)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("video", type=Path)
    ap.add_argument("--stills", type=float, nargs="*")
    ap.add_argument("--beats", action="store_true", help="one still per narration beat")
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--limit", type=float, help="render only the first N seconds")
    a = ap.parse_args()
    if a.stills is not None or a.beats:
        stills(a.video, a.stills or shot_times(a.video), a.video / "build" / "stills")
    else:
        full(a.video, workers=a.workers, limit=a.limit)
