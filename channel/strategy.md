# Content strategy

## What a video is

A 10–16 minute animated documentary about one mechanism, told as a story: a cold open with a concrete scene, the question, then the model built piece by piece, then what it means. Every claim can be traced to a source listed in the description. No stock footage, no borrowed clips; everything on screen is drawn by the engine in this repo.

Length: 10+ minutes gives room for mid-roll ads (YouTube allows them from 8 minutes) without padding.

## Monetization: what is realistic

Checked in September 2026:

- **YouTube Partner Program today:** 1,000 subscribers plus 4,000 public watch hours in the last 12 months (or 10M Shorts views in 90 days). A lower "fan funding" tier opens at 500 subscribers, 3 uploads in 90 days and 3,000 hours.
- **From 1 February 2027, new applicants need 8,000 watch hours** (or 20M Shorts views). Channels already in the programme keep the old terms. Hitting 1,000 subscribers and 4,000 hours from zero in the four months before that date would take an unusually fast start, so **plan for the 8,000-hour bar**. At ~6 minutes average view duration, 8,000 hours is about 80,000 views of long-form video across the year.
- **Inauthentic content policy** (renamed from "repetitious content" in July 2025): channels get demonetized for templated, mass-produced videos with no real authorship. In January 2026 YouTube removed several large AI channels with synthetic narration, templated thumbnails and stock loops from the programme. This channel's protection is what it already is: original research with cited sources, bespoke animation per video, a consistent point of view, and a pace set by quality, **not volume**. Don't raise the cadence past what can be checked properly.
- **AI disclosure:** a synthetic narrator voice that doesn't clone a real person, over clearly animated visuals, does not need the "altered or synthetic content" label, according to YouTube's own guidance. Mark it "No".

## Cadence

One long-form video every two weeks, plus 2–3 Shorts cut from each video. The render engine can output vertical formats with scene tweaks; that isn't built yet. Consistency matters more than frequency.

## Choosing topics

A topic qualifies if:

1. **It has a mechanism.** Something that can be drawn as moving parts, flows or quantities. "How X works" beats "The history of X".
2. **People already search for it or click on it.** Proven, evergreen topics with existing high-view videos, where this channel can be clearer or more visual.
3. **It's advertiser-friendly.** No graphic violence, tragedy-as-entertainment, medical claims or politics. War tech is fine as engineering (Enigma), not as combat footage.
4. **It can be sourced.** Published papers, museum pages, primary documents.

## Backlog

In rough order. The first run clusters around "machines that calculate" so viewers of #001 have somewhere to go next (end screens, playlists), then widens.

| # | Working title | Mechanism to animate |
|---|---|---|
| 002 | How a Clockmaker Solved Longitude (Harrison's H4) | Why longitude is a time problem; grasshopper escapement; temperature compensation |
| 003 | How the Enigma Machine Worked, and How It Was Broken | Rotor stepping, plugboard, the no-self-encryption flaw, bombe logic |
| 004 | Why Your Phone Needs Einstein to Find You (GPS) | Trilateration, clock bias as a 4th unknown, relativistic drift of ~38 µs/day |
| 005 | Babbage's Difference Engine: Calculating Without Multiplying | Method of finite differences, carry mechanism |
| 006 | How a Mechanical Watch Keeps Time | Mainspring, gear train, lever escapement, balance wheel |
| 007 | How Tides Actually Work | Differential gravity, two bulges, spring/neap, resonance in basins |
| 008 | The Jacquard Loom: the Machine That Taught Computers to Read | Punched cards, hooks and needles, the line to Babbage and IBM |
| 009 | How the Power Grid Keeps Time at 50/60 Hz | Inertia, frequency as a balance meter, reserves |
| 010 | How Roman Aqueducts Moved Water With Gravity Alone | Gradients of centimetres per kilometre, inverted siphons |
| 011 | Why the Night Sky Is Dark | Olbers' paradox, finite age, expansion |
| 012 | How Noise-Cancelling Headphones Work | Superposition, feed-forward vs feedback, latency limits |

## Packaging rules

- **Title:** the searchable name first when there is one ("The Antikythera Mechanism: …"), then the promise. Under ~70 characters where possible. No fake claims or questions the video doesn't answer.
- **Thumbnail:** one object, at most three words, readable at 168×94. Brass on ink so it's recognisable in a feed. The thumbnail and title should say different things. Upload the three variants to Test & Compare when it's available.
- **Description:** the first two lines restate the hook in plain language (that's what shows in search), then chapters, then sources.
- **Pinned comment:** a real extra fact the video didn't have room for, plus one specific question. Corrections get pinned above everything.

## After each upload

Check at 48 hours and at 7 days:

- **Click-through rate** from browse vs search. A new channel under ~4% on browse means the thumbnail/title needs work.
- **Audience retention** at 0:30 and the average. A cliff in the first 30 seconds means the cold open is too slow.
- **Retention dips** mark the exact scenes to tighten. The engine can re-render only what changed.

Write findings into `videos/<id>/notes.md` so the next video starts from them.
