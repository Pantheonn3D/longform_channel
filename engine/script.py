"""Parse a video's script.md into chapters, shots and narration beats."""
import json
import re
from pathlib import Path


def parse(path):
    text = Path(path).read_text()
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    beats, chapter, shot = [], None, None
    shot_id = -1
    para = []

    def flush():
        if para:
            beats.append({"chapter": chapter, "shot": shot_id, "scene": shot[0], "params": shot[1], "text": " ".join(para)})
            para.clear()

    for line in text.splitlines():
        s = line.strip()
        if not s:
            flush()
        elif s.startswith("//"):
            continue
        elif s.startswith("# "):
            flush()
            chapter = s[2:].strip()
        elif s.startswith("@shot"):
            flush()
            m = re.match(r"@shot\s+(\w+)\s*(\{.*\})?\s*$", s)
            if not m:
                raise ValueError(f"bad shot line: {s}")
            shot = (m.group(1), json.loads(m.group(2) or "{}"))
            shot_id += 1
        elif m := re.fullmatch(r"\[pause ([\d.]+)\]", s):
            flush()
            beats.append({"chapter": chapter, "shot": shot_id, "scene": shot[0], "params": shot[1], "text": "", "pause": float(m.group(1))})
        else:
            if shot is None:
                raise ValueError("narration before first @shot")
            para.append(s)
    flush()
    return beats


if __name__ == "__main__":
    import sys
    for b in parse(sys.argv[1]):
        print(b["shot"], b["scene"], (b["text"] or f"[pause {b.get('pause')}]")[:70])
