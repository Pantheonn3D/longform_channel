# Channel identity

## Name: Orrery

An orrery is a clockwork model of the solar system: turn the handle and the planets move. The channel does the same thing for any subject. Each video builds a working model on screen, one piece at a time, until the mechanism makes sense.

Why this name:

- **It sets the format without limiting the topic.** Ancient machines, physics, infrastructure, biology and economics can all be explained as systems of moving parts.
- **It's distinctive.** Common candidates (Deep Field, The Long Answer, Parallax, Fathom, Understory, Longwave) are already used by active YouTube channels. A web search found no documentary channel called Orrery, only single videos about orreries and a UK orrery maker ("Staines & Son Orrery Makers").
- **The first video explains it.** The Antikythera mechanism is the oldest known machine of this kind, and the video ends on the name.
- **It works as a logo.** An orbit that doubles as the letter O, with a sun that is also a gear.

Risk: some viewers won't know the word. The tagline covers that, and the first video defines it.

## Handle

I couldn't check handle availability from here (youtube.com is blocked in this environment). Try them in this order:

1. `@orrery`
2. `@orrerydocs`
3. `@orreryfilms`
4. `@theorrery`
5. `@watchorrery`

## Tagline

**Working models of everything.**

## Channel description

Paste this into Studio → Customization → Profile → Description:

```
Orrery makes animated documentaries about how things actually work: ancient machines, the physics behind everyday things, the systems that keep the modern world running, and the history of how people figured them out.

An orrery is a clockwork model of the solar system. Turn the handle and you can watch the planets move. Each video here tries to do the same for its subject: build a working model on screen, one piece at a time, until the mechanism makes sense.

Every video is researched from published papers and primary sources, listed in its description. If we get something wrong, tell us in the comments and we'll pin the correction.
```

## Channel keywords

Paste into Studio → Settings → Channel → Basic info → Keywords:

```
documentary "animated documentary" explainer "how it works" "history of science" engineering "ancient technology" astronomy "science explained" orrery
```

## Brand

| Asset | File | Spec |
|---|---|---|
| Profile picture | `brand/out/logo-800.png` | 800×800. YouTube crops it to a circle; the mark is built for that crop and stays legible at 32 px. |
| Banner | `brand/out/banner-2560x1440.png` | 2560×1440. Text sits inside the 1546×423 safe area that every device shows. |
| Video watermark | `brand/out/watermark-150.png` | 150×150 transparent PNG, under 1 MB (a 300 px version is also there). |

Sources for all three are HTML/SVG in `brand/src/` and render with `engine/snap.py`.

**Colours**

| Token | Hex | Use |
|---|---|---|
| Ink | `#0d1117` | Background everywhere |
| Brass | `#e0a943` | Main accent: the sun, key numbers, highlights |
| Verdigris | `#4fb3a2` | Second accent: corroded bronze, second data series |
| Bone | `#eee9df` | Main text on dark backgrounds |
| Mist | `#9aa4b2` | Secondary text |
| Signal | `#ef5b3f` | Rarely: errors, gaps, thumbnail arrows |

**Type:** Fraunces for titles, numbers and the wordmark; Inter for labels and body text. Both are SIL Open Font License, and copies with their licences are in `engine/fonts/`.

**Visual rules:** dark backgrounds, flat vector drawing, triangular-toothed gears, one idea per frame, and on-screen text that labels what the narration is saying at that moment. Captions sit bottom left under a short brass rule.
