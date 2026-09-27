# Orrery

*Working models of everything.* An animated documentary channel. Every frame is drawn by code in this repo: no stock footage, no editing software.

| Where | What |
|---|---|
| `channel/identity.md` | Name, handle, description, keywords, brand colours and type |
| `channel/setup.md` | Step-by-step YouTube Studio setup checklist |
| `channel/strategy.md` | Format, monetization reality (incl. the Feb 2027 YPP change), topic backlog, packaging rules |
| `brand/out/` | Profile picture, banner, watermark, ready to upload |
| `videos/001-antikythera/` | First video: script, sources, scenes, thumbnails, captions, upload package |

## How a video is made

```
script.md ──tts.py──▶ narration.wav + timeline.json ──render.py──▶ out/<video>.mp4
   │                        (beat timings)                 ▲
   └── @shot lines pick a scene ─────────── scenes.js ─────┘ (canvas animation, pure function of time)
```

1. **Script** (`videos/<id>/script.md`): `#` starts a chapter, `@shot <scene> {params}` starts a visual shot, and each paragraph is one narration beat.
2. **Narration** (`engine/tts.py`): synthesizes each beat, trims silence, lays the beats out with pauses, and writes `build/timeline.json`, which holds every beat's start and end plus estimated word times. Scenes key their animations to these (`s.w(0, "eclipse")` = when "eclipse" is spoken), so a new voice re-times the whole video automatically.
3. **Scenes** (`videos/<id>/scenes.js`): one draw function per scene type, using the helpers in `engine/lib.js` (gears with triangular teeth, dials, captions, corrosion textures…).
4. **Render** (`engine/render.py`): headless Chromium draws each frame, 4 workers encode segments with x264, then the segments are joined and the narration is mixed at −14 LUFS.

## Commands

```bash
pip install -r requirements.txt
engine/get_models.sh                                        # Kokoro scratch voice (~350 MB)
python engine/tts.py videos/001-antikythera                 # narration + timeline
python engine/render.py videos/001-antikythera --beats      # one still per beat, for review
python engine/render.py videos/001-antikythera              # full render (~50 min on 4 cores)
python engine/captions.py videos/001-antikythera            # captions.en.srt + chapter timestamps
python videos/001-antikythera/thumbnail/make.py             # thumbnails
python engine/snap.py brand/src/banner.html brand/out/banner-2560x1440.png 2560 1440
```

Playwright uses the Chromium at `/opt/pw-browsers/chromium` if it exists; otherwise set `CHROMIUM=/path/to/chrome` or run `playwright install chromium`. The system needs `ffmpeg` and `espeak-ng`.

## Switching to ElevenLabs

```bash
export TTS=elevenlabs ELEVENLABS_API_KEY=... ELEVENLABS_VOICE_ID=...
python engine/tts.py videos/001-antikythera && python engine/render.py videos/001-antikythera
```

The ElevenLabs adapter (`with-timestamps` endpoint, `eleven_multilingual_v2` by default; override with `ELEVENLABS_MODEL`) is written but **untested**: the cloud environment this was built in blocks `api.elevenlabs.io`. Allow that domain in the environment's network settings, or run this step locally. The character alignment it returns is saved next to each beat (`*.align.json`) but isn't used yet. Word times are still estimated from character position; switching to the real alignment is the next improvement.

Pronunciation fixes go in `videos/<id>/pronounce.json`: `text` holds regex respellings (used by both voices) and `ipa` holds phoneme overrides (Kokoro only).

## Licences

Fonts: Fraunces and Inter, SIL OFL 1.1 (`engine/fonts/`). Kokoro model: Apache-2.0. Map data: Natural Earth (public domain) via `world-atlas`.
