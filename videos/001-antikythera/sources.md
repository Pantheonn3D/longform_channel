# Sources and fact check: #001 The Antikythera Mechanism

I checked these claims with web searches in September 2026. Most publisher pages were blocked from this environment, so for a few claims I'm relying on the search-result summaries and my own knowledge rather than the full papers. Those are marked **(summary)** below. If you have time, read the Freeth 2006 and 2021 papers directly.

## Claim → source

| Claim in the script | Source |
|---|---|
| Sponge divers from Symi sheltered from a storm at Antikythera in spring 1900; diver Elias Stadiatis thought the statues were bodies | WHOI, *Antikythera shipwreck*; National Geographic, *The 'Dial of Destiny' is real* (summary) |
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
| Front: zodiac ring and a movable 365-day Egyptian calendar ring; Sun and Moon pointers; half-pale, half-dark Moon phase ball driven by a differential | Wikipedia; Wright's reconstructions (summary) |
| Numbers 462 (Venus) and 442 (Saturn) in the Front Cover Inscription; UCL's 2021 proposed planetary display | Freeth et al. 2021, *Scientific Reports* 11:5821 |
| Cicero describes Archimedes' sphere and one by Posidonius | Wikipedia (summary); Cicero, *De re publica* I and *De natura deorum* II |
| The eclipse dial's cycle starts in 205 BC (epoch, not build date) | Carman & Evans 2014; Freeth 2014 |
| Nothing of comparable gearing survives until the 14th-century astronomical clocks | Scientific American; widely stated in the literature |
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
- Map data: Natural Earth (public domain) via the `world-atlas` npm package.
