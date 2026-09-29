// Vertical scenes (1080×1920) for the #002 short. Loaded after ../scenes.js, whose helpers it reuses
// (tallShip, sea, clockFace, sunDisc, globe, orthoPt, watch, balanceWheel, h1Frame). Keep y ≈ 1150–1500 clear for captions.
const CX = W / 2, CY = 760;

function push(g, s, amt = .07) {
  const z = 1 + amt * ease(clamp(s.t / s.dur));
  g.translate(CX, CY); g.scale(z, z); g.translate(-CX, -CY);
}

function headline(g, str, y, a, col = C.brass, size = 108) {
  text(g, str, CX, y, { size, kind: "serif", weight: 640, align: "center", color: col, alpha: a });
}

function fadeBottom(g, y0, y1) {
  const f = g.createLinearGradient(0, y0, 0, y1);
  f.addColorStop(0, "rgba(13,17,23,0)"); f.addColorStop(1, "rgba(13,17,23,1)");
  g.fillStyle = f; g.fillRect(0, y0, W, y1 - y0); g.fillStyle = C.ink; g.fillRect(0, y1, W, H - y1);
}

SCENES.v_compass = (g, s) => {
  const t = s.t, T = s.T;
  bg(g);
  push(g, s);
  // compass rose: north–south solid and certain, east–west shaky
  g.strokeStyle = C.line; g.lineWidth = 3; g.beginPath(); g.arc(CX, CY, 330, 0, TAU); g.stroke();
  const nk = prog(t, s.w(0, "north") - .3, .4, easeOut), ek = prog(t, s.w(0, "east") - .3, .4, easeOut);
  g.save(); g.globalAlpha = nk; g.fillStyle = C.brass;
  g.beginPath(); g.moveTo(CX, CY - 320); g.lineTo(CX + 40, CY); g.lineTo(CX, CY + 320); g.lineTo(CX - 40, CY); g.fill(); g.restore();
  text(g, "N", CX, CY - 350, { size: 60, kind: "serif", weight: 640, align: "center", color: C.brass, alpha: nk });
  text(g, "S", CX, CY + 400, { size: 60, kind: "serif", weight: 640, align: "center", color: C.brass, alpha: nk });
  const wob = .25 * Math.sin(T * 7) * ek;
  g.save(); g.globalAlpha = ek; g.translate(CX, CY); g.rotate(wob); g.fillStyle = C.signal;
  g.beginPath(); g.moveTo(-320, 0); g.lineTo(0, 30); g.lineTo(320, 0); g.lineTo(0, -30); g.fill(); g.restore();
  text(g, "W ?", CX - 400, CY + 22, { size: 60, kind: "serif", weight: 640, align: "center", color: C.signal, alpha: ek });
  text(g, "E ?", CX + 400, CY + 22, { size: 60, kind: "serif", weight: 640, align: "center", color: C.signal, alpha: ek });
  headline(g, "1700", 250, prog(t, .1, .4, easeOut), C.bone);
};

SCENES.v_wreck = (g, s) => {
  const t = s.t, T = s.T;
  const sky = g.createLinearGradient(0, 0, 0, 900);
  sky.addColorStop(0, "#06080c"); sky.addColorStop(1, "#1a2331");
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  push(g, s, .1);
  sea(g, T, 900, 3, L => `rgb(${12 + L * 3},${19 + L * 4},${28 + L * 5})`);
  const list = prog(t, .6, 3);
  tallShip(g, 440, 930 + list * 40, 1.15, .05 * Math.sin(T * 1.2) + .35 * list, "#030405", 1 - list);
  g.fillStyle = "#030405";
  [[700, 170, 180], [930, 110, 140]].forEach(([rx, h, w]) => { g.beginPath(); g.moveTo(rx - w, 1150); g.lineTo(rx - w * .2, 980 - h); g.lineTo(rx + w * .3, 1000 - h * .6); g.lineTo(rx + w, 1150); g.fill(); });
  fadeBottom(g, 1000, 1300);
  headline(g, "1707", 250, prog(t, s.w(0, "1707") - .3, .4, easeOut), C.bone);
  text(g, "4 warships", CX, 380, { size: 64, weight: 800, align: "center", color: C.bone, alpha: prog(t, s.w(0, "four") - .2, .3) });
  text(g, "1,400+ dead", CX, 470, { size: 64, weight: 800, align: "center", color: C.signal, alpha: prog(t, s.w(0, "1,400") - .2, .3) });
};

SCENES.v_prize = (g, s) => {
  const t = s.t;
  bg(g, "#1b1810", "#0b0907");
  push(g, s, .12);
  const k = prog(t, s.w(0, "£20,000") - .3, .4, easeOut);
  text(g, "£20,000", CX, CY + 40, { size: 220, kind: "serif", weight: 700, align: "center", color: C.brass, alpha: k });
  text(g, "for longitude at sea", CX, CY + 150, { size: 54, align: "center", color: C.bone, alpha: prog(t, s.w(0, "longitude") - .2, .3) });
  headline(g, "1714", 290, prog(t, .1, .4, easeOut), C.bone);
};

SCENES.v_globe = (g, s) => {
  const t = s.t, T = s.T, noon = s.p.stage === "noon";
  bg(g, "#101824");
  stars(g, 5, 200, .6);
  push(g, s, .05);
  const R = 400;
  if (!noon) {
    const h = Math.min(6, Math.floor(prog(t, s.w(0, "15") - .6, 2.4, x => x) * 6));
    const mer = [];
    for (let i = 0; i <= h; i++) mer.push([-i * 15, i === h ? C.brass : "rgba(224,169,67,.35)", i === h ? 5 : 2]);
    globe(g, CX, CY, R, -h * 15 + 30 - T * 2, 20, { meridians: mer });
    headline(g, "time", 250, prog(t, s.w(0, "time") - .2, .3, easeOut), C.bone);
    text(g, "15° every hour", CX, 1150, { size: 66, weight: 800, align: "center", color: C.brass, alpha: prog(t, s.w(0, "15") - .2, .3) });
    return;
  }
  globe(g, CX, CY + 40, 360, -22, 22, { sunLon: -45, meridians: [[0, "rgba(238,233,223,.85)", 3], [-45, C.brass, 5]] });
  const ck = prog(t, s.w(0, "clock") - .2, .3), nk = prog(t, s.w(0, "noon") - .2, .3);
  g.save(); g.globalAlpha = ck; clockFace(g, 260, 300, 120, lerp(12, 15, prog(t, s.w(0, "gap") - .5, .8))); g.restore();
  text(g, "home", 260, 470, { size: 44, weight: 700, align: "center", color: C.bone, alpha: ck });
  g.save(); g.globalAlpha = nk; clockFace(g, 820, 300, 120, 12); g.restore();
  text(g, "local noon", 820, 470, { size: 44, weight: 700, align: "center", color: C.brass, alpha: nk });
  text(g, "3 h = 45° west", CX, 1180, { size: 66, weight: 800, align: "center", color: C.brass, alpha: prog(t, s.w(0, "west") - .3, .3) });
};

SCENES.v_tight = (g, s) => {
  const t = s.t, T = s.T;
  bg(g);
  const roll = .2 * Math.sin(T * 1.6);
  const k = prog(t, s.w(0, "3") - .3, .4, easeOut);
  text(g, "< 3 s", CX, 520, { size: 230, kind: "serif", weight: 700, align: "center", color: C.brass, alpha: k });
  text(g, "per day", CX, 620, { size: 64, weight: 800, align: "center", color: C.bone, alpha: k });
  const sk = prog(t, s.w(0, "rolling") - .4, .4);
  g.save(); g.globalAlpha = sk;
  sea(g, T, 1000, 2, L => `rgba(${22 + L * 4},${34 + L * 5},${48 + L * 6},1)`);
  tallShip(g, CX, 1000, .9, roll, "#05070a");
  g.restore();
  fadeBottom(g, 1040, 1300);
};

SCENES.v_harrison = (g, s) => {
  const t = s.t, T = s.T;
  bg(g);
  // montage: H1's linked balances, H3's heavy balances, then the watch
  const d = s.dur, a1 = prog(t, 0, .3) * (1 - prog(t, d * .38, .3)), a3 = prog(t, d * .38, .3) * (1 - prog(t, d * .7, .3)), a4 = prog(t, d * .7, .3);
  h1Frame(g, CX, CY + 40, 1.3, .45 * Math.sin(T * 2.4), a1);
  if (a3 > 0) { g.save(); g.globalAlpha = a3; [[CX - 200, 1], [CX + 200, -1]].forEach(([x, dd]) => balanceWheel(g, x, CY, 170, .5 * Math.sin(T * 1.5) * dd, C.brass, 7)); g.restore(); }
  if (a4 > 0) watch(g, CX, CY + 20, 300, 10.13 + T / 3600, a4);
  const yr = Math.round(lerp(1730, 1759, prog(t, .3, d - .8, x => x)));
  headline(g, String(yr), 250, 1, C.bone);
  text(g, ["H1", "H3", "H4"][a4 > .5 ? 2 : a3 > .5 ? 1 : 0], CX, 1160, { size: 80, kind: "serif", weight: 700, align: "center", color: C.brass });
};

SCENES.v_watch = (g, s) => {
  const t = s.t, T = s.T;
  bg(g, "#151c27");
  push(g, s, .12);
  const glowG = g.createRadialGradient(CX, CY, 0, CX, CY, 600);
  glowG.addColorStop(0, "rgba(224,169,67,.22)"); glowG.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = glowG; g.fillRect(0, 0, W, H);
  watch(g, CX, CY + 40, 330, 10.13 + T / 3600);
  const k = prog(t, s.w(0, "5") - .3, .4, easeOut);
  text(g, "5 seconds", CX, 300, { size: 130, kind: "serif", weight: 700, align: "center", color: C.brass, alpha: k });
  text(g, "after the voyage to Jamaica", CX, 1180, { size: 50, weight: 700, align: "center", color: C.bone, alpha: prog(t, s.w(0, "Jamaica") - .3, .3) });
};

SCENES.v_phone = (g, s) => {
  const t = s.t, T = s.T;
  bg(g, "#0b1220", "#05080d");
  stars(g, 30, 200, .7);
  const R = 330, lon0 = -T * 5 - 20, lat0 = 25;
  globe(g, CX, CY, R, lon0, lat0, {});
  const ph = orthoPt(-5, 45, lon0, lat0), px = CX + ph[0] * R, py = CY - ph[1] * R;
  [[0, 1], [2.1, .8], [4.0, 1.1], [5.2, .95]].forEach(([p0, sp], i) => {
    const a = p0 + T * .25 * sp, ox = CX + 470 * Math.cos(a), oy = CY + 470 * Math.sin(a) * .5;
    g.fillStyle = C.bone; g.fillRect(ox - 14, oy - 9, 28, 18);
    g.fillStyle = C.verd; g.fillRect(ox - 46, oy - 6, 28, 12); g.fillRect(ox + 18, oy - 6, 28, 12);
    g.save(); g.strokeStyle = C.brass; g.setLineDash([6, 10]); g.lineDashOffset = -T * 40; g.lineWidth = 3; g.globalAlpha = .8;
    g.beginPath(); g.moveTo(ox, oy); g.lineTo(px, py); g.stroke(); g.restore();
    clockFace(g, ox, oy - 48, 22, 3 + i + T / 60, { rim: C.brass });
  });
  g.fillStyle = C.brass; g.beginPath(); g.arc(px, py, 10, 0, TAU); g.fill();
  headline(g, "still clocks", 250, prog(t, s.w(0, "clocks") - .5, .4, easeOut));
};
