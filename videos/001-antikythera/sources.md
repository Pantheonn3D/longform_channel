# Sources and fact check: #001 The Antikythera Mechanism

An independent review pass after the first draft found four overstatements, and all four were corrected in the script: the 205 BC century, the calendar ring, planetary gear survival, and "nothing comparable". Their rows below explain the current wording.

I checked these claims with web searches in September 2026. Most publisher pages were blocked from this environment, so for a few claims I'm relying on the search-result summaries and my own knowledge rather than the full papers. Those are marked **(summary)** below. If you have time, read the Freeth 2006 and 2021 papers directly.

## Claim → source

| Claim in the script | Source |
|---|---|
| Sponge divers from Symi sheltered from a storm at Antikythera in 1900 (most accounts say around Easter; some say October); diver Elias Stadiatis thought the statues were bodies | WHOI, *Antikythera shipwreck*; National Geographic, *The 'Dial of Destiny' is real* (summary) |
| Salvage ran with Greek Navy support through 1901; the wreck dates to c. 70–60 BC | WHOI; Wikipedia, *Antikythera wreck* (summary) |
| The lump split as it dried; Valerios Stais noticed a gear and inscriptions on 17 May 1902 | Scientific American 2021; Wikipedia, *Antikythera mechanism* (summary) |
| 82 fragments; about a third survives; 30 gears; 27 of them in Fragment A | Freeth et al. 2021; PLOS One 2018 CT paper (summary) |
| Price worked with Karakalos, who radiographed the fragments in 1971; they counted teeth | Antikythera Mechanism Research Project, *Charalambos Karakalos*; Price, *Gears from the Greeks* (1974) |
| 127 × 2 = 254; 254 sidereal months = 235 synodic months + 19 years | Astronomy.com, *Dissecting an ancient computer* (summary); arithmetic |
| 2005 microfocus X-ray CT (X-Tek BladeRunner, shipped from the UK to Athens) revealed hidden gears and text | PLOS One 2018 CT paper; Freeth et al. 2006 |
| Metonic cycle: 19 years ≈ 235 lunar months, error about 2 hours; 7 extra months | Arithmetic: 19 × 365.2422 = 6939.60 d vs 235 × 29.5306 = 6939.69 d |
| Moon train 64/38 × 48/24 × 127/32 = 254/19 | Freeth et al. 2006 (summary); arithmetic checked exactly with Python fractions |
| Pin and slot on two 50-tooth gears, axes offset ~1.1 mm, carried on e3 around once per ~8.85 years; matches Hipparchus' lunar theory | Freeth et al. 2006; Carman, Thorndike & Evans, *On the pin-and-slot device* (summary) |
| Upper back dial: 5-turn spiral, 235 cells; follower pointer; Corinthian month names; Games dial with a 4-year cycle incl. Olympics | Freeth et al. 2008, *Calendars with Olympiad display and eclipse prediction* |
| Lower back dial: 4-turn spiral, 223 cells (Saros); glyphs for eclipse predictions | Freeth et al. 2008; Wikipedia (summary) |
| Front: zodiac ring and a movable ring inscribed with Egyptian months (365-day calendar). **Disputed:** Woan & Bayley 2024 (Glasgow) estimate 354–355 holes under the ring, suggesting a lunar count. The script presents this as debated; Sun and Moon pointers; half-pale, half-dark Moon phase ball driven by a differential | Wikipedia; Wright's reconstructions (summary) |
| Numbers 462 (Venus) and 442 (Saturn) in the Front Cover Inscription; UCL's 2021 proposed planetary display. "Almost none" of the planetary gearing survives: Freeth 2021 assigns the 63-tooth gear in Fragment D to Venus; others (Voulgaris 2021) place it in the draconic train | Freeth et al. 2021, *Scientific Reports* 11:5821; arXiv 2104.06181 |
| Cicero describes Archimedes' sphere and one by Posidonius | Wikipedia (summary); Cicero, *De re publica* I and *De natura deorum* II |
| The eclipse dial's cycle starts in 205 BC (epoch, not build date; Freeth 2014 gives 204 BC, Iversen 2017 argues 178 BC). Estimates for the build mostly fall in the 2nd century BC. The script no longer claims the design used Hipparchus' methods, only that it's from his century | Carman & Evans 2014; Freeth 2014; Iversen 2017 |
| Nothing with gearing *this complex* survives until the 14th-century astronomical clocks. Simpler geared devices do exist in between: the Byzantine sundial-calendar (5th–6th c. AD, Science Museum London) and al-Biruni's geared calendar (c. AD 1000). So the claim is worded as "this complex" | Scientific American; Science Museum Group collection |
| The name "orrery" comes from a copy made for Charles Boyle, 4th Earl of Orrery (Graham & Tompion design, c. 1704; Rowley copy) | Linda Hall Library, *Charles Boyle, 4th Earl of Orrery* |

## What's illustrative, and labelled that way on screen

- Greek lettering in the "inscriptions" shots is written in the style of the inscriptions, not transcribed. It's labelled "lettering illustrative".
- Eclipse glyph positions on the Saros dial are spaced at 5–6 months but don't reproduce the real cell numbers. It's labelled "glyph positions illustrative".
- The planetary display is a hypothesis. It's labelled "planetary display is hypothetical".
- The pin-and-slot offset and the Moon orbit's eccentricity are exaggerated so they're visible. Both are labelled.
- The gear layout in "How gears do arithmetic" is exploded (pairs drawn side by side, shared axles shown as bars). The tooth counts and ratios are the real ones.

## Links

- Freeth et al. 2006, *Decoding the ancient Greek astronomical calculator known as the Antikythera Mechanism*, Nature 444: https://www.nature.com/articles/nature05357
- Freeth et al. 2008, *Calendars with Olympiad display and eclipse prediction on the Antikythera Mechanism*, Nature 454: https://pubmed.ncbi.nlm.nih.gov/18668103/
- Freeth et al. 2021, *A Model of the Cosmos in the ancient Greek Antikythera Mechanism*, Scientific Reports 11: https://www.nature.com/articles/s41598-021-84310-w
- Carman & Evans 2014, *On the epoch of the Antikythera mechanism and its eclipse predictor*: https://link.springer.com/article/10.1007/s00407-014-0145-5
- Improved CT reconstruction of Fragment A (PLOS One, 2018): https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0207430
- Price, *Gears from the Greeks* (American Philosophical Society): https://www.amphilsoc.org/news/gears-greeks-antikythera-mechanism-derek-de-solla-price
- Antikythera Mechanism Research Project, Charalambos Karakalos: http://www.antikythera-mechanism.gr/history/people/charalambos-karakalos
- WHOI, Antikythera shipwreck: https://www.whoi.edu/ocean-learning-hub/ocean-topics/ocean-human-lives/underwater-archaeology/antikythera-shipwreck/
- Scientific American, *An Ancient Greek Astronomical Calculation Machine Reveals New Secrets*: https://www.scientificamerican.com/article/an-ancient-greek-astronomical-calculation-machine-reveals-new-secrets/
- Linda Hall Library, Charles Boyle, 4th Earl of Orrery: https://www.lindahall.org/about/news/scientist-of-the-day/charles-boyle-4th-earl-of-orrery/
- Woan & Bayley 2024, calendar ring hole count: https://arxiv.org/abs/2403.00040
- Science Museum Group, Byzantine sundial-calendar: https://collection.sciencemuseumgroup.org.uk/objects/co1082/byzantine-sundial-calendar
- Map data: Natural Earth (public domain) via the `world-atlas` npm package.
