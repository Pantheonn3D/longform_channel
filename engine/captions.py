"""Write captions (.srt) and YouTube chapter timestamps from build/timeline.json.

    python engine/captions.py videos/001-antikythera
"""
import json
import re
import sys
from pathlib import Path


def stamp(t, srt=True):
    h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
    if srt:
        return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s % 1) * 1000)) % 1000:03d}"
    return f"{h}:{m:02d}:{int(s):02d}" if h else f"{m}:{int(s):02d}"


def cues(beat, max_chars=84):
    """Split a beat into caption cues at sentence/clause breaks, timed from the word estimates."""
    words = beat["words"]
    out, cur = [], []
    for i, (w, t) in enumerate(words):
        cur.append((w, t))
        text = " ".join(x for x, _ in cur)
        nxt = words[i + 1][0] if i + 1 < len(words) else ""
        full_stop = re.search(r"[.!?]$", w)
        too_long = len(text) + len(nxt) + 1 > max_chars
        clause = re.search(r"[,;:]$", w) and len(text) > max_chars * .45
        if full_stop or too_long or clause or not nxt:
            out.append([cur[0][1], text])
            cur = []
    res = []
    for k, (t0, text) in enumerate(out):
        t1 = out[k + 1][0] if k + 1 < len(out) else beat["end"] - beat["start"]
        res.append((beat["start"] + t0, beat["start"] + t1, text))
    return res


def main(video):
    video = Path(video)
    tl = json.loads((video / "build" / "timeline.json").read_text())
    lines, n = [], 0
    for b in tl["beats"]:
        if not b["text"]:
            continue
        for t0, t1, text in cues(b):
            n += 1
            lines += [str(n), f"{stamp(t0)} --> {stamp(max(t0 + .5, t1 - .05))}", text, ""]
    (video / "captions.en.srt").write_text("\n".join(lines))

    chapters, seen = [], None
    for b in tl["beats"]:
        if b["chapter"] != seen and b["text"]:
            seen = b["chapter"]
            chapters.append((0 if not chapters else b["start"] - 1.0, seen))
    (video / "build" / "chapters.txt").write_text("\n".join(f"{stamp(t, False)} {name}" for t, name in chapters) + "\n")
    print((video / "build" / "chapters.txt").read_text())
    print(f"{n} caption cues")


if __name__ == "__main__":
    main(sys.argv[1])
