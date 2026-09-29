"""Narration: synthesize every beat of a script, then lay the beats out on a timeline.

    python engine/tts.py videos/001-antikythera            # local Kokoro scratch voice
    TTS=elevenlabs python engine/tts.py videos/001-antikythera

Beats are cached by (provider, voice, text), so editing one paragraph only re-synthesizes that paragraph.
Outputs in <video>/build/: beats/*.wav, narration.wav (48 kHz mono), timeline.json.
"""
import base64
import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).parent))
from script import parse  # noqa: E402

SR = 48000
LEAD_IN = 0.8
GAP_BEAT, GAP_SHOT, GAP_CHAPTER = 0.45, 0.75, 1.3
MODELS = Path(os.environ.get("KOKORO_DIR", Path(__file__).parent / "models"))


def spoken(text, pronounce):
    for pat, rep in pronounce.get("text", {}).items():
        text = re.sub(pat, rep, text)
    return text


class Kokoro:
    name = "kokoro"

    def __init__(self, speed=None):
        from kokoro_onnx import Kokoro as K
        self.voice = os.environ.get("KOKORO_VOICE", "af_heart")
        self.speed = speed or float(os.environ.get("KOKORO_SPEED", "0.88"))
        self.k = K(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin"))

    def synth(self, text, out, ipa=None, **_):
        # Words in the ipa map are spliced in as phonemes; espeak's guesses for Greek names are poor.
        if ipa:
            parts = re.split(r"\b(" + "|".join(map(re.escape, ipa)) + r")\b", text)
            text = " ".join(ipa[p] if p in ipa else self.k.tokenizer.phonemize(p, "en-us") for p in parts if p.strip())
        samples, sr = self.k.create(text, voice=self.voice, speed=self.speed, lang="en-us", is_phonemes=bool(ipa))
        sf.write(out, samples, sr)


class ElevenLabs:
    """Untested from this environment: api.elevenlabs.io is blocked by its network policy."""
    name = "elevenlabs"

    def __init__(self, speed=None):
        self.key = os.environ["ELEVENLABS_API_KEY"]
        self.voice = os.environ["ELEVENLABS_VOICE_ID"]
        self.model = os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2")

    def synth(self, text, out, prev="", nxt="", **_):
        import urllib.request
        body = {"text": text, "model_id": self.model, "previous_text": prev, "next_text": nxt,
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "style": 0.15}}
        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{self.voice}/with-timestamps?output_format=mp3_44100_128",
            data=json.dumps(body).encode(), headers={"xi-api-key": self.key, "Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=120) as r:
            data = json.load(r)
        mp3 = Path(out).with_suffix(".mp3")
        mp3.write_bytes(base64.b64decode(data["audio_base64"]))
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(mp3), str(out)], check=True)
        Path(out).with_suffix(".align.json").write_text(json.dumps(data.get("alignment")))


def load48k(path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def trim(x, thresh=0.01):
    idx = np.where(np.abs(x) > thresh)[0]
    if not len(idx):
        return x[:0]
    pad = int(0.03 * SR)
    return x[max(0, idx[0] - pad): idx[-1] + pad]


def word_times(text, dur):
    """Estimate word onsets by character share; punctuation counts as extra time for the pause it causes."""
    words = text.split()
    weights = [len(w) + 1 + (5 if w[-1] in ".!?" else 2 if w[-1] in ",;:" else 0) for w in words]
    total, t, out = sum(weights), 0.0, []
    for w, k in zip(words, weights):
        out.append([w, round(t / total * dur, 3)])
        t += k
    return out


def build(video):
    video = Path(video)
    beats = parse(video / "script.md")
    pron_file = video / "pronounce.json"
    pronounce = json.loads(pron_file.read_text()) if pron_file.exists() else {}
    # Optional per-video config.json: {"speed": 1.0, "gaps": [lead_in, beat, shot, chapter]} (shorts run faster and tighter)
    cfg_file = video / "config.json"
    cfg = json.loads(cfg_file.read_text()) if cfg_file.exists() else {}
    lead_in, gap_beat, gap_shot, gap_chapter = cfg.get("gaps", [LEAD_IN, GAP_BEAT, GAP_SHOT, GAP_CHAPTER])
    tts = (ElevenLabs if os.environ.get("TTS") == "elevenlabs" else Kokoro)(cfg.get("speed"))
    cache = video / "build" / "beats"
    cache.mkdir(parents=True, exist_ok=True)

    spoken_texts = [spoken(b["text"], pronounce) for b in beats]
    t = lead_in
    chunks = [np.zeros(int(lead_in * SR), np.float32)]
    for i, b in enumerate(beats):
        if i > 0:
            gap = gap_chapter if b["chapter"] != beats[i - 1]["chapter"] else gap_shot if b["shot"] != beats[i - 1]["shot"] else gap_beat
            chunks.append(np.zeros(int(gap * SR), np.float32))
            t += gap
        if b["text"]:
            ipa = {w: p for w, p in pronounce.get("ipa", {}).items() if re.search(rf"\b{re.escape(w)}\b", spoken_texts[i])}
            key = hashlib.sha1(f"{tts.name}|{getattr(tts, 'voice', '')}|{getattr(tts, 'speed', '')}|{spoken_texts[i]}|{ipa}".encode()).hexdigest()[:12]
            wav = cache / f"{i:03d}-{key}.wav"
            if not wav.exists():
                print(f"tts {i:03d}: {b['text'][:60]}")
                tts.synth(spoken_texts[i], wav, ipa=ipa, prev=spoken_texts[i - 1] if i else "",
                          nxt=spoken_texts[i + 1] if i + 1 < len(beats) else "")
            audio = trim(load48k(wav))
        else:
            audio = np.zeros(int(b["pause"] * SR), np.float32)
        dur = len(audio) / SR
        b.update(start=round(t, 3), end=round(t + dur, 3))
        if b["text"]:
            b["words"] = word_times(b["text"], dur)
        chunks.append(audio)
        t += dur
    chunks.append(np.zeros(int(1.0 * SR), np.float32))
    narration = np.concatenate(chunks)
    sf.write(video / "build" / "narration.wav", narration, SR)
    (video / "build" / "timeline.json").write_text(json.dumps({"duration": round(len(narration) / SR, 3), "beats": beats}, indent=1))
    print(f"narration: {len(narration) / SR:.1f}s over {len(beats)} beats")


if __name__ == "__main__":
    build(sys.argv[1])
