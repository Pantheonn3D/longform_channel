// Vertical scenes (1080×1920) for the #001 short. Loaded after ../scenes.js, whose helpers it reuses
// (lump, lumpPath, mechanism, zodiacRing, lunarTrain). Keep y ≈ 1150–1500 clear for burned-in captions.
const CX = W / 2, CY = 760;

// Slow push-in on every shot keeps a short moving; call first, and g.restore() is handled by the player.
function push(g, s, amt = .07) {
  const z = 1 + amt * ease(clamp(s.t / s.dur));
  g.translate(CX, CY); g.scale(z, z); g.translate(-CX, -CY);
}

function headline(g, str, y, a, col = C.brass, size = 108) {
  text(g, str, CX, y, { size, kind: "serif", weight: 640, align: "center", color: col, alpha: a });
}

SCENES.v_lump = (g, s) => {
  const t = s.t, T = s.T;
  bg(g, "#18202b");
  push(g, s, .05);
  const reveal = !!s.p.reveal;
  const zoom = s.p.end ? lerp(1.25, 1, prog(t, 0, 1.2)) : lerp(1, 1.08, t / s.dur);
  g.save(); g.translate(CX, CY); g.scale(zoom, zoom); g.translate(-CX, -CY);
  lump(g, CX, CY, 360, 3, reveal ? prog(t, 0, .8) : 0, 1);
  if (reveal) {
    const gk = s.p.end ? 1 : prog(t, .4, 1.2);
    g.save(); lumpPath(g, CX, CY, 360, 3); g.clip();
    gear(g, { x: CX + 30, y: CY - 50, teeth: 64, r: 240, rot: .05 * T, fill: `rgba(224,169,67,${.12 * gk})`, stroke: C.brass, lw: 3, alpha: gk, glow: "rgba(224,169,67,.85)", hole: "rgba(0,0,0,0)" });
    gear(g, { x: CX - 190, y: CY + 170, teeth: 38, r: 140, rot: -.08 * T, stroke: C.brass, lw: 3, alpha: gk * .8, hole: "rgba(0,0,0,0)" });
    g.restore();
  }
  g.restore();
  if (!reveal) {
    headline(g, "2,000 years old", 290, prog(t, s.w(0, "2,000") - .3, .5, easeOut));
  } else if (s.p.end) {
    headline(g, "one lump of bronze", 290, prog(t, .2, .6), C.bone, 80);
  } else {
    headline(g, "1901", 290, prog(t, s.w(0, "1901") - .3, .5, easeOut), C.bone);
    headline(g, "30 gears", 1120, prog(t, s.w(0, "30") - .3, .5, easeOut), C.brass, 96);
  }
};

SCENES.v_dial = (g, s) => {
  const t = s.t, T = s.T;
  bg(g);
  push(g, s);
  stars(g, 9, 160, .5);
  mechanism(g, T, CX, CY, 400, { speed: 6, crank: false, gearAlpha: .35 });
  const items = [["Sun", "Sun"], ["Moon", "Moon"], ["phase", "Moon phase"], ["eclipses", "eclipses"]];
  items.forEach(([w, label], i) => {
    const a = prog(t, s.w(0, w) - .2, .35, easeOut);
    text(g, label, 110 + (i % 2) * 460, 190 + Math.floor(i / 2) * 90, { size: 60, kind: "serif", weight: 600, color: i === 3 ? C.signal : C.brass, alpha: a });
  });
};

SCENES.v_train = (g, s) => {
  const t = s.t, T = s.T;
  bg(g);
  // the real Moon train, scaled to fit the width
  const gs = lunarTrain();
  gs.forEach(q => q.rot = q.rot0 + q.ratio * T * .25);
  const minX = Math.min(...gs.map(q => q.x - q.r)), maxX = Math.max(...gs.map(q => q.x + q.r));
  const sc = 1000 / (maxX - minX);
  g.save(); g.translate(40, 520); g.scale(sc, sc); g.translate(-minX, -600);
  const cols = [C.brass, C.verd, C.brass, C.verd, C.brass, C.verd];
  [[1, 2], [3, 4]].forEach(([i, j]) => { g.strokeStyle = C.mist; g.lineWidth = 10; g.beginPath(); g.moveTo(gs[i].x, gs[i].y); g.lineTo(gs[j].x, gs[j].y); g.stroke(); });
  gs.forEach((q, i) => gear(g, { ...q, stroke: cols[i], lw: 3, fill: "rgba(13,17,23,.92)", hole: "rgba(0,0,0,0)", spokes: q.r > 150 ? 4 : 0 }));
  g.restore();
  headline(g, "arithmetic in bronze", 250, prog(t, .1, .5, easeOut), C.bone, 76);
  // fractions appear as they're spoken
  const frac = (x, y, n, d, col, a, size = 88) => {
    if (a <= 0) return;
    text(g, n, x, y, { size, kind: "serif", weight: 640, align: "center", color: col, alpha: a });
    g.save(); g.globalAlpha = a; g.fillStyle = C.mist; g.fillRect(x - size * .75, y + size * .22, size * 1.5, 5); g.restore();
    text(g, d, x, y + size * 1.05, { size, kind: "serif", weight: 640, align: "center", color: col, alpha: a });
  };
  const y = 860;
  frac(210, y, "64", "38", C.bone, prog(t, s.w(1, "64") - .2, .3));
  text(g, "×", 375, y + 50, { size: 70, align: "center", color: C.mist, alpha: prog(t, s.w(1, "48") - .2, .3) });
  frac(540, y, "48", "24", C.bone, prog(t, s.w(1, "48") - .2, .3));
  text(g, "×", 705, y + 50, { size: 70, align: "center", color: C.mist, alpha: prog(t, s.w(1, "127") - .2, .3) });
  frac(870, y, "127", "32", C.bone, prog(t, s.w(1, "127") - .2, .3));
  // the result replaces the fractions' neighbourhood, above the caption band
  const rk = prog(t, s.w(2, "exactly") - .2, .4, easeOut);
  if (rk > 0) {
    g.save(); g.fillStyle = `rgba(13,17,23,${rk})`; g.fillRect(0, 790, W, 330); g.restore();
    text(g, "=", 330, 990, { size: 110, align: "center", color: C.mist, alpha: rk });
    frac(560, 910, "254", "19", C.brass, rk, 120);
  }
};

SCENES.v_moon = (g, s) => {
  const t = s.t, T = s.T;
  bg(g);
  push(g, s);
  stars(g, 4, 180, .6);
  const k = prog(t, .2, s.dur - .6, x => x);
  const laps = k * 254, years = k * 19;
  const my = 800;
  zodiacRing(g, CX, my, 320, 400, 1, 20);
  g.fillStyle = C.verd; g.beginPath(); g.arc(CX, my, 18, 0, TAU); g.fill();
  const a = laps * TAU - Math.PI / 2;
  moonDisc(g, CX + 250 * Math.cos(a), my + 250 * Math.sin(a), 28, .5);
  text(g, String(Math.floor(laps)), CX, 230, { size: 140, kind: "serif", weight: 660, align: "center", color: C.brass });
  text(g, "laps of the sky", CX, 300, { size: 42, align: "center", color: C.mist });
  text(g, `${years.toFixed(1)} years`, CX, my + 90, { size: 56, kind: "serif", weight: 600, align: "center", color: C.bone });
};

SCENES.v_pin = (g, s) => {
  const t = s.t, T = s.T;
  bg(g);
  push(g, s);
  const off = 70, r1 = 260, pinR = 170;
  const A = T * 1.1;
  const k1x = CX - off / 2, k2x = CX + off / 2, cy = CY;
  const px = k1x + pinR * Math.cos(A), py = cy + pinR * Math.sin(A);
  const B = Math.atan2(py - cy, px - k2x);
  gear(g, { x: k1x, y: cy, teeth: 50, r: r1, rot: A, stroke: C.brass, lw: 3, fill: "rgba(224,169,67,.05)", hole: "rgba(0,0,0,0)", spokes: 0 });
  gear(g, { x: k2x, y: cy, teeth: 50, r: r1 - 44, rot: B, stroke: C.verd, lw: 3, fill: "rgba(13,17,23,.8)", hole: "rgba(0,0,0,0)", spokes: 0 });
  g.save(); g.translate(k2x, cy); g.rotate(B); g.strokeStyle = C.verd; g.lineWidth = 4; g.strokeRect(pinR - 80, -14, 160, 28); g.restore();
  g.fillStyle = C.bone; g.beginPath(); g.arc(px, py, 14, 0, TAU); g.fill();
  g.strokeStyle = "rgba(154,164,178,.5)"; g.lineWidth = 5; g.beginPath(); g.moveTo(k2x, cy); g.lineTo(k2x + 330 * Math.cos(A), cy + 330 * Math.sin(A)); g.stroke();
  g.strokeStyle = C.bone; g.lineWidth = 7; g.beginPath(); g.moveTo(k2x, cy); g.lineTo(k2x + 330 * Math.cos(B), cy + 330 * Math.sin(B)); g.stroke();
  headline(g, "pin + slot", 230, prog(t, s.w(0, "pin") - .2, .4, easeOut));
  text(g, "white: faster, then slower", CX, 1120, { size: 40, align: "center", color: C.bone, alpha: prog(t, s.w(0, "speeds") - .2, .4) });
};

SCENES.v_gap = (g, s) => {
  const t = s.t;
  bg(g);
  // a vertical timeline: the mechanism at the top, the 1300s clocks at the bottom
  const top = 330, bot = 1060, x = 330;
  const yr = y => lerp(top, bot, (y + 150) / 1500);
  g.strokeStyle = C.line; g.lineWidth = 4; g.beginPath(); g.moveTo(x, top - 40); g.lineTo(x, bot + 40); g.stroke();
  const k = prog(t, .3, 1.8);
  g.fillStyle = "rgba(239,91,63,.18)"; g.fillRect(x - 30, yr(-60), 60, (yr(1330) - yr(-60)) * k);
  g.strokeStyle = C.signal; g.lineWidth = 3; g.strokeRect(x - 30, yr(-60), 60, (yr(1330) - yr(-60)) * k);
  g.fillStyle = C.brass; g.beginPath(); g.arc(x, yr(-120), 14, 0, TAU); g.fill();
  text(g, "the mechanism", x + 60, yr(-120) + 14, { size: 44, weight: 650, color: C.brass });
  text(g, "c. 2nd century BC", x + 60, yr(-120) + 64, { size: 32, color: C.mist });
  const ek = prog(t, 1.8, .5);
  g.fillStyle = C.bone; g.globalAlpha = ek; g.beginPath(); g.arc(x, yr(1350), 14, 0, TAU); g.fill(); g.globalAlpha = 1;
  text(g, "astronomical clocks", x + 60, yr(1350) + 14, { size: 44, weight: 650, color: C.bone, alpha: ek });
  text(g, "1300s", x + 60, yr(1350) + 64, { size: 32, color: C.mist, alpha: ek });
  text(g, "1,000+", x + 60, (yr(-60) + yr(1330)) / 2, { size: 130, kind: "serif", weight: 660, color: C.signal, alpha: prog(t, s.w(0, "thousand") - .3, .4, easeOut) });
  text(g, "years with nothing like it", x + 64, (yr(-60) + yr(1330)) / 2 + 70, { size: 36, color: C.mist, alpha: prog(t, s.w(0, "thousand") - .3, .4) });
};
