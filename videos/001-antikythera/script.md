<!--
Orrery #001 — The Antikythera Mechanism
Format: "# " starts a chapter. "@shot <scene> {json}" starts a new visual shot.
Every paragraph is one narration beat (one TTS request). Lines starting with "//" are notes, not narrated.
Facts and sources: see sources.md in this folder.
-->

# A wreck off Antikythera

@shot sea {"mode": "storm"}
In the spring of 1900, a boat full of sponge divers was running for cover. A storm had pushed them off course, and they sheltered behind a small rocky island between Crete and mainland Greece. Its name was Antikythera.

@shot sea {"mode": "dive"}
While they waited for the weather to turn, one of the divers went down to look for sponges. He came back up badly shaken, saying the seabed was covered in bodies.

@shot wreck {}
They weren't bodies. They were bronze and marble statues, lying on the wreck of a cargo ship that had gone down about two thousand years earlier.

@shot lump {"reveal": false}
Over the next year, divers hauled up statues, pottery, glassware and coins. And among all of it, a lump of corroded bronze, roughly the size of a shoebox, that nobody paid much attention to.

@shot lump {"reveal": true}
Inside that lump were gears. Dozens of them, some with teeth barely more than a millimetre long, cut by hand more than two thousand years ago.

@shot orrery {"mode": "cold"}
It is a machine for calculating the sky. Turn a handle, and it shows you where the Sun and Moon will be on any day you choose, what phase the Moon will be in, and which months will bring an eclipse.

Nothing with this kind of gearing survives from anywhere in the world for more than a thousand years afterwards. This is how it worked, one gear at a time.

@shot title {"title": "The Antikythera Mechanism", "sub": "A working model of the heavens"}
// title card: no narration, music sting only
[pause 3.5]

# The lump in the drawer

@shot museum {}
The finds went to the National Archaeological Museum in Athens, where the statues got the attention. The bronze lump dried out on its own, and as it dried, it cracked apart.

@shot museum {"focus": true}
On the seventeenth of May, 1902, the archaeologist Valerios Stais looked closely at one of the pieces and saw a gear wheel embedded in it, along with tiny Greek letters.

@shot fragments {}
Today the mechanism exists as eighty two fragments. Perhaps a third of the original machine survives, including thirty bronze gears, and the largest fragment holds most of them.

@shot fragments {"stack": true}
The problem was that almost everything important was locked inside the corrosion. You could see the edge of a wheel here, a few letters there, but not how anything connected.

# Seeing inside

@shot xray {"stage": "price"}
The first person to make real progress was a British physicist and historian of science, Derek de Solla Price. In 1971 he worked with the Greek radiographer Charalambos Karakalos, who X-rayed the fragments, and together they began counting the teeth on the gears they could see.

@shot xray {"stage": "count"}
Counting teeth sounds like a small thing, but in a geared machine, the tooth counts are the program. They tell you exactly what ratio each wheel turns at, and so what the machine was built to calculate.

@shot number {"n": "127", "then": "254", "op": "× 2"}
One gear had about a hundred and twenty seven teeth, which is an odd number to choose. Price realised that twice a hundred and twenty seven is two hundred and fifty four, and two hundred and fifty four is a number astronomers already knew. We'll see why in a moment.

@shot xray {"stage": "ct"}
The breakthrough came in 2005. A team shipped a specialised X-ray scanner from England to the museum in Athens and scanned every fragment in three dimensions. For the first time, researchers could look through the corrosion layer by layer.

@shot xray {"stage": "letters"}
The scans revealed gears hidden deep inside the largest fragment, and thousands of characters of text that had been invisible for two thousand years. Much of that text turned out to be something like a user's manual, describing what the machine displayed.

# The problem with the sky

@shot sky {"stage": "sun"}
To understand what the mechanism calculates, you need the problem it was solving. Seen from Earth, the Sun drifts around a band of constellations, the zodiac, once a year.

@shot sky {"stage": "moon"}
The Moon travels the same band much faster, going all the way around in a little over twenty seven days.

@shot sky {"stage": "phases"}
But the cycle people actually lived by was the Moon's phases, new moon to new moon. That takes about twenty nine and a half days. Ancient Greek calendars ran on these lunar months, and festivals were set by them.

@shot cycles {"stage": "mismatch"}
Here's the trouble. A year doesn't hold a whole number of lunar months. It holds about twelve and a third. So a calendar of twelve lunar months drifts away from the seasons by about eleven days every year.

@shot cycles {"stage": "metonic"}
Astronomers found a way out, known to the Greeks as the Metonic cycle. Nineteen years contain almost exactly two hundred and thirty five lunar months. The mismatch is about two hours in nineteen years. So if you add seven extra months spread across those nineteen years, the calendar stays in step with the seasons.

@shot cycles {"stage": "sidereal"}
And now two hundred and fifty four makes sense. In those same nineteen years, the Moon goes around the zodiac two hundred and thirty five times plus nineteen, once for every lap the Sun makes. Two hundred and fifty four.

# How gears do arithmetic

@shot gears {"stage": "pair"}
A pair of meshing gears multiplies. If a gear with sixty four teeth drives a gear with thirty two, the small one turns twice for every turn of the big one. The ratio is just the tooth counts, divided.

@shot gears {"stage": "train"}
Chain several pairs together, and the ratios multiply. In the mechanism, the main wheel turns once per year, driven by the handle. From it, a train of gears runs to the Moon's pointer.

@shot gears {"stage": "math"}
Sixty four over thirty eight. Forty eight over twenty four. A hundred and twenty seven over thirty two. Multiply them out, and you get exactly two hundred and fifty four over nineteen.

@shot gears {"stage": "result"}
One turn of the year wheel moves the Moon pointer through two hundred and fifty four nineteenths of a turn. The Moon laps the zodiac at the right rate, forever, with no arithmetic done by the person turning the handle. The arithmetic is in the bronze.

# The Moon that speeds up

@shot pinslot {"stage": "problem"}
The Moon has one more complication. Its speed across the sky isn't constant. Over about twenty seven and a half days, it speeds up, then slows down, then speeds up again.

@shot pinslot {"stage": "theory"}
We now know why. The Moon's orbit is an ellipse, and it moves faster when it's closer to Earth. The Greeks didn't have that explanation, but the astronomer Hipparchus, in the second century BC, built a geometric model that reproduced the effect.

@shot pinslot {"stage": "mechanism"}
The mechanism builds that model in metal. Two gears of fifty teeth each sit on axes offset by about a millimetre. A pin on one gear rides in a slot on the other. As they turn, the pin slides in and out along the slot, and the second gear runs slightly ahead, then slightly behind.

@shot pinslot {"stage": "graph"}
The result is a Moon pointer that speeds up and slows down, the way the real Moon does.

@shot pinslot {"stage": "carrier"}
And the high and low points of the Moon's speed don't stay in one place in the sky. They creep around the zodiac about once every nine years. So the whole pin and slot assembly is mounted on a larger gear that slowly carries it around, once in about nine years. It is a moving mechanism riding on another moving mechanism, made more than two thousand years ago.

# The back of the box

@shot spiral {"stage": "metonic"}
Turn the box around, and the back has two large dials, each laid out as a spiral. The upper one is a calendar. Its pointer travels five turns of a spiral divided into two hundred and thirty five cells, one cell per lunar month. The Metonic cycle again.

@shot spiral {"stage": "follower"}
A pin at the pointer's tip rides in the spiral's groove, so the pointer lengthens as it works its way outward. When it reaches the end, you lift it back to the start.

@shot games {}
The inscribed month names are Corinthian, which hints at where the machine was made or meant to be used. A smaller dial inside the spiral tracks a four year cycle of athletic games, including the Olympics.

@shot spiral {"stage": "saros"}
The lower spiral is the most remarkable. It has four turns and two hundred and twenty three cells. Two hundred and twenty three lunar months, about eighteen years, is the Saros cycle, which Babylonian astronomers had discovered: after one Saros, eclipses tend to repeat.

@shot spiral {"stage": "glyphs"}
Some cells carry small inscriptions, glyphs marking an expected eclipse of the Sun or the Moon, and even the hour of the day. Point to this month, and the machine tells you whether to expect an eclipse.

# The face of the cosmos

@shot front {"stage": "rings"}
The front of the mechanism had one large dial with two rings. The inner ring is the zodiac. The outer ring is the Egyptian calendar of three hundred and sixty five days. That calendar ignored leap days, so its ring could be turned by hand to stay aligned with the Sun.

@shot front {"stage": "pointers"}
Pointers showed the positions of the Sun and the Moon against the zodiac. And a small ball, half pale and half dark, turned to show the Moon's phase. Its rotation came from a gear arrangement that takes the difference between the Moon's motion and the Sun's.

@shot front {"stage": "planets"}
The inscriptions also name the five planets known in antiquity: Mercury, Venus, Mars, Jupiter and Saturn. None of the planetary gears survive, so what came next is reconstruction.

@shot number {"n": "462", "then": "442", "label": "Venus", "label2": "Saturn"}
In 2021, a team at University College London published a proposed design for the whole front of the machine. Their starting point was two numbers found in the inscriptions: four hundred and sixty two, associated with Venus, and four hundred and forty two, with Saturn. Both are long, accurate cycles for those planets.

@shot front {"stage": "full"}
From those cycles they designed gear trains that fit in the space available, using methods the Greeks could have used. It shows how the whole known cosmos might have fitted into one box, although the planetary display itself remains a hypothesis.

# Who built it

@shot map {}
We don't know who made it. The Roman orator Cicero describes a bronze sphere built by Archimedes that showed the motions of the Sun, Moon and planets, and he mentions a similar device made by the philosopher Posidonius on Rhodes. Neither has survived. The Antikythera mechanism is the only machine of its kind we have.

@shot timeline {"stage": "dates"}
The ship sank around sixty BC. Studies of the eclipse dial suggest its cycle starts in 205 BC. That's when the calendar begins, which is not necessarily when the machine was built, but it places the design in the second century BC, around the time of Hipparchus.

@shot timeline {"stage": "gap"}
And then the trail goes cold. Gearing of this complexity doesn't appear again in the surviving record until the astronomical clocks of medieval Europe, in the fourteenth century.

# A working model

@shot orrery {"mode": "close"}
It's tempting to call it a computer, and in one sense it is. It takes an input, a date, and computes outputs, the positions and phases and eclipses, using nothing but ratios of teeth.

But it's also something simpler. It's a model. Somebody took everything their civilisation knew about the sky, the cycles found by Babylonian astronomers and the geometry of Greek ones, and made it into a thing you can hold, and turn, and watch.

In the early 1700s, English instrument makers built a clockwork model of the solar system, and a copy made for Charles Boyle, the Earl of Orrery, gave every machine like it a name. Orreries: working models of the heavens. The one from Antikythera is the oldest we know of. That idea, building a model so you can see how a thing actually works, is what this channel is about.

@shot endcard {}
[pause 12]
