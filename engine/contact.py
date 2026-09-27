"""Tile rendered stills into contact sheets for quick review: python engine/contact.py <dir> <out-prefix>"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

src, prefix = Path(sys.argv[1]), sys.argv[2]
files = sorted(src.glob("*.png"))
per, cols, tw, th = 6, 2, 960, 540
for n in range(0, len(files), per):
    sheet = Image.new("RGB", (cols * tw, (per // cols) * th), "black")
    for i, f in enumerate(files[n:n + per]):
        im = Image.open(f).convert("RGB").resize((tw, th), Image.LANCZOS)
        ImageDraw.Draw(im).text((10, 10), f.stem, fill="red")
        sheet.paste(im, ((i % cols) * tw, (i // cols) * th))
    sheet.save(f"{prefix}{n // per:02d}.jpg", quality=88)
    print(f"{prefix}{n // per:02d}.jpg")
