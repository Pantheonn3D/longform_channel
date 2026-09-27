// Scenes for Orrery #001, The Antikythera Mechanism.
// Each scene is (g, s) => draw, where s.t is time since the shot started, s.b(i)/s.be(i) are
// the start/end of narration beat i within the shot, and s.w(i, "word") is when that word is spoken.
const SCENES = {};

SCENES.missing = (g, s) => { bg(g); text(g, "missing scene", W / 2, H / 2, { align: "center", color: C.signal }); };

// ---------------------------------------------------------------- shared pieces

function project(lon, lat, box) {
  // equirectangular, scaled by cos(lat) of the box centre so shapes aren't stretched
  const [lon0, lat0, lon1, lat1, x, y, w] = box;
  const k = Math.cos((lat0 + lat1) / 2 * Math.PI / 180);
  const sx = w / ((lon1 - lon0) * k);
  return [x + (lon - lon0) * k * sx, y + (lat1 - lat) * sx];
}

function drawLand(g, box, fill, stroke, lw = 1.5) {
  g.save();
  g.fillStyle = fill; g.strokeStyle = stroke; g.lineWidth = lw; g.lineJoin = "round";
  g.beginPath();
  for (const ring of ASSETS.med) {
    ring.forEach(([lon, lat], i) => { const [x, y] = project(lon, lat, box); i ? g.lineTo(x, y) : g.moveTo(x, y); });
    g.closePath();
  }
  g.fill("evenodd");
  if (stroke) g.stroke();
  g.restore();
}

// Marble statuary: a limbless classical torso and a bust. Shaded so they read as stone, not people.
function marble(g, x0, y0, x1, y1, a) {
  const gr = g.createLinearGradient(x0, y0, x1, y1);
  gr.addColorStop(0, `rgba(232,228,216,${a})`); gr.addColorStop(1, `rgba(120,124,118,${a})`);
  return gr;
}
function torso(g, x, y, s, ang, a = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  g.fillStyle = marble(g, -60, -110, 60, 110, a);
  g.beginPath();
  g.moveTo(-26, -118); g.quadraticCurveTo(-70, -112, -78, -84);          // left shoulder
  g.lineTo(-66, -60); g.quadraticCurveTo(-52, 0, -46, 40);                // flank
  g.quadraticCurveTo(-58, 80, -48, 112); g.lineTo(-8, 122);               // hip, broken thigh
  g.lineTo(10, 110); g.lineTo(50, 118);
  g.quadraticCurveTo(60, 80, 46, 40); g.quadraticCurveTo(52, 0, 66, -60);
  g.lineTo(78, -84); g.quadraticCurveTo(70, -112, 26, -118);
  g.quadraticCurveTo(0, -128, -26, -118); g.closePath(); g.fill();
  g.strokeStyle = `rgba(80,84,80,${.35 * a})`; g.lineWidth = 2;               // modelling lines
  g.beginPath(); g.moveTo(-34, -70); g.quadraticCurveTo(0, -52, 34, -70); g.moveTo(0, -60); g.lineTo(0, 30); g.moveTo(-26, 40); g.quadraticCurveTo(0, 56, 26, 40); g.stroke();
  g.restore();
}
function bust(g, x, y, s, ang, a = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  g.fillStyle = marble(g, -60, -140, 60, 60, a);
  g.beginPath(); g.moveTo(-80, 60); g.quadraticCurveTo(-80, -10, -30, -22); g.lineTo(-18, -44); g.lineTo(18, -44); g.lineTo(30, -22); g.quadraticCurveTo(80, -10, 80, 60); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(0, -84, 34, 44, 0, 0, TAU); g.fill();
  g.fillStyle = `rgba(150,150,140,${a})`;                                      // curls
  for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(-27 + i * 9, -122 + Math.abs(i - 3) * 3, 9, 0, TAU); g.fill(); }
  g.restore();
}
function amphora(g, x, y, s, ang, color) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  g.strokeStyle = color; g.lineWidth = 3; g.fillStyle = "rgba(0,0,0,.25)";
  g.beginPath();
  g.moveTo(-8, -70); g.lineTo(-10, -50); g.bezierCurveTo(-40, -40, -38, 30, 0, 70);
  g.bezierCurveTo(38, 30, 40, -40, 10, -50); g.lineTo(8, -70); g.closePath();
  g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-10, -58); g.bezierCurveTo(-28, -62, -30, -40, -20, -36); g.stroke();
  g.beginPath(); g.moveTo(10, -58); g.bezierCurveTo(28, -62, 30, -40, 20, -36); g.stroke();
  g.restore();
}

// Fragment outline: an angular plate with ragged, broken edges.
function lumpPath(g, x, y, r, seed) {
  const R = rng(seed * 31 + 7), n = 9 + Math.floor(R() * 4), pts = [];
  for (let i = 0; i < n; i++) { const a = (i + R() * .5) / n * TAU; const rr = r * (.68 + R() * .34); pts.push([x + rr * Math.cos(a), y + rr * .82 * Math.sin(a)]); }
  g.beginPath();
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % n];
    if (!i) g.moveTo(p[0], p[1]);
    for (let k = 1; k <= 6; k++) {          // ragged edge between corners
      const f = k / 6, j = k < 6 ? (fbm(p[0] * .05 + k, p[1] * .05, 2) - .5) * r * .09 : 0;
      const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
      g.lineTo(p[0] + dx * f - dy / L * j, p[1] + dy * f + dx / L * j);
    }
  });
  g.closePath();
}

// The lump: a textured fragment. crack: 0..1 opens a fissure.
function lump(g, x, y, r, seed, crack = 0, alpha = 1) {
  const tex = corrosion("lump" + seed, 512, 512, seed, .018);
  g.save();
  g.globalAlpha *= alpha;
  g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 50; g.shadowOffsetY = 20;
  lumpPath(g, x, y, r, seed);
  g.fillStyle = "#3b3226"; g.fill();
  g.shadowColor = "transparent";
  g.clip();
  g.drawImage(tex, x - r * 1.3, y - r * 1.3, r * 2.6, r * 2.6);
  // top-left rim light
  const lg = g.createRadialGradient(x - r * .5, y - r * .6, r * .1, x, y, r * 1.2);
  lg.addColorStop(0, "rgba(255,230,190,.18)"); lg.addColorStop(1, "rgba(0,0,0,.45)");
  g.fillStyle = lg; g.fillRect(x - r * 1.5, y - r * 1.5, r * 3, r * 3);
  if (crack > 0) {
    g.strokeStyle = "#07090c"; g.lineWidth = 3 + 10 * crack; g.lineJoin = "round";
    g.beginPath();
    const r2 = rng(seed + 9);
    let px = x - r * 1.1, py = y - r * .25;
    g.moveTo(px, py);
    for (let i = 1; i <= 14; i++) { px = x - r * 1.1 + i * r * 2.2 / 14; py = y - r * .25 + i * r * .5 / 14 + (r2() - .5) * 26; if (i / 14 <= crack * 1.2) g.lineTo(px, py); }
    g.stroke();
  }
  g.restore();
}

function greekLine(g, x, y, str, size, alpha, color = C.bone) {
  text(g, str, x, y, { size, kind: "serif", weight: 400, color, alpha, tracking: size * .18 });
}

// Zodiac ring used by the sky and front-dial scenes.
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
function zodiacRing(g, cx, cy, r0, r1, alpha = 1, size = 22) {
  g.save(); g.globalAlpha *= alpha;
  g.fillStyle = "rgba(224,169,67,.05)";
  g.beginPath(); g.arc(cx, cy, r1, 0, TAU); g.arc(cx, cy, r0, 0, TAU, true); g.fill();
  g.strokeStyle = C.line; g.lineWidth = 2;
  g.beginPath(); g.arc(cx, cy, r0, 0, TAU); g.stroke();
  g.beginPath(); g.arc(cx, cy, r1, 0, TAU); g.stroke();
  for (let i = 0; i < 12; i++) {
    const a = -Math.PI / 2 + i * TAU / 12;
    g.beginPath(); g.moveTo(cx + r0 * Math.cos(a), cy + r0 * Math.sin(a)); g.lineTo(cx + r1 * Math.cos(a), cy + r1 * Math.sin(a)); g.stroke();
    const am = a + TAU / 24, rm = (r0 + r1) / 2;
    g.save(); g.translate(cx + rm * Math.cos(am), cy + rm * Math.sin(am)); g.rotate(am + Math.PI / 2);
    text(g, SIGNS[i].toUpperCase(), 0, size * .35, { size, align: "center", color: C.mist, weight: 550, tracking: 2 });
    g.restore();
  }
  g.restore();
}

function sunGear(g, x, y, r, rot = 0, alpha = 1) {
  g.save(); g.globalAlpha *= alpha;
  g.shadowColor = "rgba(224,169,67,.6)"; g.shadowBlur = r;
  gearPath(g, x, y, 16, r, rot, { triangular: false, toothH: r * .35 });
  g.fillStyle = C.brass; g.fill();
  g.restore();
}

// Archimedean spiral dial (back dials). Returns helpers for cell geometry.
function spiralDial(g, cx, cy, turns, cells, r0, pitch, o = {}) {
  const th = i => i / cells * turns * TAU;                     // angle of cell boundary i
  const rad = a => r0 + pitch * a / TAU;
  const pt = (a, dr = 0) => [cx + (rad(a) + dr) * Math.cos(a - Math.PI / 2), cy + (rad(a) + dr) * Math.sin(a - Math.PI / 2)];
  g.save(); g.globalAlpha *= o.alpha ?? 1;
  g.strokeStyle = C.line; g.lineWidth = 2;
  for (const dr of [-pitch / 2, pitch / 2]) {
    g.beginPath();
    for (let a = 0; a <= turns * TAU + .001; a += .03) { const [x, y] = pt(a, dr); a ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  }
  const lit = o.lit ?? -1;
  for (let i = 0; i <= cells; i++) {
    const a = th(i);
    const [x0, y0] = pt(a, -pitch / 2), [x1, y1] = pt(a, pitch / 2);
    g.strokeStyle = i <= lit ? C.brassDim : C.ink3; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  }
  // fill the cells already passed
  if (lit > 0) {
    g.fillStyle = "rgba(224,169,67,.10)";
    g.beginPath();
    const end = th(lit);
    for (let a = 0; a <= end; a += .03) { const [x, y] = pt(a, -pitch / 2); a ? g.lineTo(x, y) : g.moveTo(x, y); }
    for (let a = end; a >= 0; a -= .03) { const [x, y] = pt(a, pitch / 2); g.lineTo(x, y); }
    g.closePath(); g.fill();
  }
  g.restore();
  return { th, rad, pt };
}

// ---------------------------------------------------------------- cold open

SCENES.sea = (g, s) => {
  const t = s.t, T = s.T;
  if (s.p.mode === "storm") {
    const sky = g.createLinearGradient(0, 0, 0, 640);
    sky.addColorStop(0, "#07090d"); sky.addColorStop(1, "#1a2331");
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    // cloud bands drifting
    const clouds = cached("clouds", 1200, 360, (c, w, h) => {
      const img = c.createImageData(w, h), d = img.data;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const xx = Math.min(x, w - x); // tileable horizontally
        const n = fbm(xx * .006, y * .014, 5), a = clamp((n - .42) * 3) * (1 - y / h) * 200;
        const i = (y * w + x) * 4; d[i] = 24; d[i + 1] = 30; d[i + 2] = 40; d[i + 3] = a;
      }
      c.putImageData(img, 0, 0);
    });
    const off = (t * 22) % 1200;
    for (let k = -1; k < 2; k++) g.drawImage(clouds, k * 1200 - off, 0, 1200, 420);
    // lightning flashes
    const flash = Math.max(...[2.6, 2.85, 9.2].map(f => Math.max(0, 1 - Math.abs(t - f) * 7)));
    if (flash > 0) { g.fillStyle = `rgba(200,215,235,${.28 * flash})`; g.fillRect(0, 0, W, 640); }
    // island on the horizon
    g.fillStyle = "#06080b";
    g.beginPath(); g.moveTo(1080, 640);
    for (let x = 1080; x <= 1860; x += 10) { const e = Math.sin((x - 1080) / 780 * Math.PI); g.lineTo(x, 640 - e * (70 + 60 * fbm(x * .01, 3, 3))); }
    g.lineTo(1860, 640); g.fill();
    // waves: back to front
    for (let L = 0; L < 7; L++) {
      const base = 640 + L * L * 10 + L * 22, amp = 6 + L * 5, spd = .5 + L * .25;
      const col = `rgb(${14 + L * 3},${22 + L * 4},${32 + L * 5})`;
      g.fillStyle = col;
      g.beginPath(); g.moveTo(0, H);
      for (let x = 0; x <= W; x += 12) g.lineTo(x, base + amp * Math.sin(x * (.008 - L * .0006) + T * spd + L) + amp * .6 * Math.sin(x * .021 + T * spd * 1.7 + L * 2));
      g.lineTo(W, H); g.fill();
      g.strokeStyle = `rgba(238,233,223,${.04 + L * .012})`; g.lineWidth = 1.5; g.stroke();
      if (L === 3) {
        // the sponge boat rides this layer
        const bx = 620, by = base + amp * Math.sin(bx * (.008 - 3 * .0006) + T * spd + 3) + amp * .6 * Math.sin(bx * .021 + T * spd * 1.7 + 6);
        const roll = .08 * Math.sin(T * 1.3);
        g.save(); g.translate(bx, by - 6); g.rotate(roll);
        g.fillStyle = "#05070a";
        g.beginPath(); g.moveTo(-110, -18); g.lineTo(110, -24); g.lineTo(80, 14); g.lineTo(-86, 14); g.closePath(); g.fill();
        g.fillRect(-4, -150, 6, 132);
        g.beginPath(); g.moveTo(2, -140); g.lineTo(70, -40); g.lineTo(2, -34); g.closePath(); g.fill();
        g.restore();
      }
    }
    // rain
    const r = rng(11);
    g.strokeStyle = "rgba(200,210,225,.18)"; g.lineWidth = 1.4;
    g.beginPath();
    for (let i = 0; i < 420; i++) {
      const x0 = r() * (W + 400), sp = 900 + r() * 500, y0 = (r() * H + t * sp) % (H + 100) - 50, x = x0 - y0 * .35;
      g.moveTo(x, y0); g.lineTo(x - 9, y0 + 26);
    }
    g.stroke();
    // inset map: where Antikythera is
    const k = vis(t, s.w(0, "island") - .3, s.dur - 1.2, .6);
    if (k > 0) {
      g.save(); g.globalAlpha = k;
      const bx = 1330, by = 110, bw = 460, bh = 330;
      g.fillStyle = "rgba(13,17,23,.88)"; g.fillRect(bx, by, bw, bh);
      g.strokeStyle = C.line; g.lineWidth = 2; g.strokeRect(bx, by, bw, bh);
      g.save(); g.beginPath(); g.rect(bx, by, bw, bh); g.clip();
      const box = [20.6, 34.6, 27.2, 38.9, bx, by, bw];
      drawLand(g, box, "#222a35", "#4a5566", 1);
      const [ax, ay] = project(23.30, 35.86, box);
      const pulse = 1 + .3 * Math.sin(t * 4);
      g.strokeStyle = C.brass; g.lineWidth = 3; g.beginPath(); g.arc(ax, ay, 14 * pulse, 0, TAU); g.stroke();
      g.fillStyle = C.brass; g.beginPath(); g.arc(ax, ay, 5, 0, TAU); g.fill();
      text(g, "Antikythera", ax + 24, ay + 8, { size: 24, weight: 600, color: C.brass });
      const [cx, cy] = project(24.9, 35.25, box); text(g, "Crete", cx, cy, { size: 20, color: C.mist, align: "center" });
      const [gx, gy] = project(22.2, 37.6, box); text(g, "Greece", gx, gy, { size: 20, color: C.mist, align: "center" });
      g.restore(); g.restore();
    }
    caption(g, t, .6, s.dur - 1, ["1900", "Sponge divers from Symi, sheltering from a storm"]);
    return;
  }
  // dive: underwater, a helmet diver descends
  const wg = g.createLinearGradient(0, 0, 0, H);
  wg.addColorStop(0, "#1c4a52"); wg.addColorStop(.45, "#0d2229"); wg.addColorStop(1, "#04070a");
  g.fillStyle = wg; g.fillRect(0, 0, W, H);
  g.save(); g.globalCompositeOperation = "lighter";
  for (let i = 0; i < 7; i++) {
    const x = 200 + i * 260 + 60 * Math.sin(T * .3 + i), a = .035 + .025 * Math.sin(T * .7 + i * 2);
    const rg = g.createLinearGradient(0, 0, 0, H * .85);
    rg.addColorStop(0, `rgba(160,220,210,${a})`); rg.addColorStop(1, "rgba(160,220,210,0)");
    g.fillStyle = rg;
    g.beginPath(); g.moveTo(x - 40, 0); g.lineTo(x + 40, 0); g.lineTo(x + 220, H); g.lineTo(x + 20, H); g.fill();
  }
  g.restore();
  // marine snow
  const r = rng(5);
  g.fillStyle = "rgba(220,235,230,.35)";
  for (let i = 0; i < 160; i++) { const x = (r() * W + Math.sin(T * .5 + i) * 20), y = (r() * H - T * (8 + r() * 14) + H * 10) % H; g.fillRect(x, y, 2, 2); }
  // seabed with pale shapes that look like bodies
  const reveal = prog(t, s.w(0, "bodies") - 2.5, 3);
  g.fillStyle = "#0a1013";
  g.beginPath(); g.moveTo(0, H);
  for (let x = 0; x <= W; x += 20) g.lineTo(x, 900 + 30 * fbm(x * .004, 1, 3));
  g.lineTo(W, H); g.fill();
  g.save(); g.filter = "blur(5px)";
  [[1100, 930, .8, 1.45], [1420, 955, .7, -1.7], [860, 965, .6, 1.8]].forEach(([x, y, sc, a]) => torso(g, x, y, sc, a, .55 * reveal));
  bust(g, 1660, 950, .55, 1.6, .5 * reveal);
  g.restore();
  // diver: descends then hangs, air hose to the surface
  const dy = lerp(-160, 560, prog(t, .3, 6, easeOut)) + 8 * Math.sin(T * 1.1), dx = 760 + 18 * Math.sin(T * .6);
  g.strokeStyle = "rgba(10,14,16,.9)"; g.lineWidth = 4;
  g.beginPath(); g.moveTo(dx + 10, dy - 40); g.bezierCurveTo(dx + 40, dy - 200, dx - 30, dy - 400, dx + 20, -10); g.stroke();
  g.save(); g.translate(dx, dy); g.rotate(.12 * Math.sin(T * .6));
  g.fillStyle = "#070a0c";
  g.beginPath(); g.arc(0, -40, 36, 0, TAU); g.fill();                              // helmet
  g.fillStyle = "rgba(180,200,190,.35)"; g.beginPath(); g.arc(12, -42, 13, 0, TAU); g.fill(); // faceplate
  g.fillStyle = "#070a0c";
  g.beginPath(); g.roundRect(-32, -8, 64, 110, 18); g.fill();                      // body
  g.lineCap = "round"; g.strokeStyle = "#070a0c"; g.lineWidth = 20;
  g.beginPath(); g.moveTo(-14, 96); g.lineTo(-22, 170); g.moveTo(14, 96); g.lineTo(26, 168); g.stroke();
  g.beginPath(); g.moveTo(-28, 10); g.lineTo(-58, 70); g.moveTo(28, 10); g.lineTo(62, 50); g.stroke();
  g.restore();
  caption(g, t, 1, s.dur - 1, ["Elias Stadiatis", "diver"]);
};

SCENES.wreck = (g, s) => {
  const t = s.t, T = s.T;
  const wg = g.createLinearGradient(0, 0, 0, H);
  wg.addColorStop(0, "#10262c"); wg.addColorStop(1, "#05080a");
  g.fillStyle = wg; g.fillRect(0, 0, W, H);
  g.save();
  const zoom = 1 + .05 * t / s.dur;
  g.translate(W / 2, H / 2); g.scale(zoom, zoom); g.translate(-W / 2 - t * 10, -H / 2);
  // seabed
  g.fillStyle = "#0c1316";
  g.beginPath(); g.moveTo(-200, H + 100);
  for (let x = -200; x <= W + 400; x += 20) g.lineTo(x, 700 + 50 * fbm(x * .003, 2, 3));
  g.lineTo(W + 400, H + 100); g.fill();
  // hull ribs
  g.strokeStyle = "rgba(60,48,36,.9)"; g.lineWidth = 16; g.lineCap = "round";
  for (let i = 0; i < 9; i++) { const x = 300 + i * 150; g.beginPath(); g.moveTo(x, 900); g.quadraticCurveTo(x - 30, 780, x + 20, 690 + (i % 3) * 20); g.stroke(); }
  g.strokeStyle = "rgba(60,48,36,.7)"; g.lineWidth = 22; g.beginPath(); g.moveTo(230, 905); g.lineTo(1650, 880); g.stroke();
  // statues and cargo
  const show = i => prog(t, .3 + i * .5, 1.2);
  torso(g, 620, 830, 1.05, 1.42, .9 * show(0));
  bust(g, 1200, 860, .85, -1.35, .85 * show(1));
  torso(g, 1560, 820, .8, 1.9, .75 * show(2));
  // a bronze arm reaching out of the sand
  g.save(); g.globalAlpha = show(1);
  g.strokeStyle = "#5a4a30"; g.lineWidth = 18; g.lineCap = "round";
  g.beginPath(); g.moveTo(900, 840); g.lineTo(930, 740); g.lineTo(990, 700); g.stroke();
  g.lineWidth = 8; g.beginPath(); g.moveTo(990, 700); g.lineTo(1010, 680); g.moveTo(990, 700); g.lineTo(1018, 698); g.stroke();
  g.restore();
  [[420, 860, .8, 1.3], [760, 900, .7, -1.1], [1330, 890, .75, 1.9], [1450, 910, .6, -.5], [1750, 880, .8, 1.2]].forEach(([x, y, sc, a], i) => amphora(g, x, y, sc, a, `rgba(140,110,80,${.8 * show(i * .6 + 1)})`));
  g.restore();
  // caustics
  g.save(); g.globalCompositeOperation = "lighter";
  for (let i = 0; i < 26; i++) {
    const x = (i * 97 + Math.sin(T * .8 + i) * 40) % W, y = 640 + (i * 53) % 300;
    g.fillStyle = `rgba(140,210,200,${.03 + .02 * Math.sin(T * 2 + i)})`;
    g.beginPath(); g.ellipse(x, y, 90, 18, .2, 0, TAU); g.fill();
  }
  g.restore();
  caption(g, t, 1, s.dur - .8, ["The Antikythera wreck", "a cargo ship lost c. 70–60 BC"]);
};

SCENES.lump = (g, s) => {
  const t = s.t, T = s.T;
  bg(g, "#18202b");
  if (!s.p.reveal) {
    const k = prog(t, 0, 1.5, easeOut);
    // salvaged finds, named as they're mentioned
    const items = [["statues", 0, "statues", 330, 250], ["pottery", 0, "pottery", 1470, 260], ["glassware", 0, "glassware", 1500, 780], ["coins", 0, "coins", 360, 800]];
    items.forEach(([w, bi, label, x, y]) => {
      const a = vis(t, s.w(bi, w) - .2, s.w(0, "lump") - .2, .5);
      text(g, label, x, y, { size: 40, kind: "serif", weight: 500, color: C.mist, alpha: a * .9, align: "center" });
    });
    const sc = lerp(.85, 1, prog(t, s.w(0, "lump") - .5, 2));
    lump(g, W / 2, H / 2 + 20, 250 * sc, 3, 0, k);
    // shoebox bracket
    const bk = vis(t, s.w(0, "shoebox") - .2, 1e9, .5);
    if (bk > 0) {
      g.save(); g.globalAlpha = bk; g.strokeStyle = C.brass; g.lineWidth = 2;
      g.beginPath(); g.moveTo(W / 2 - 300, 860); g.lineTo(W / 2 - 300, 880); g.lineTo(W / 2 + 300, 880); g.lineTo(W / 2 + 300, 860); g.stroke();
      text(g, "about the size of a shoebox", W / 2, 930, { size: 30, align: "center", color: C.brass, weight: 550 });
      g.restore();
    }
    return;
  }
  // reveal: crack, gear glows through, then push in to the teeth
  const crack = prog(t, .2, 1.4);
  const zoom = lerp(1, 3.6, prog(t, s.w(0, "teeth") - .8, 2.6));
  g.save();
  g.translate(W / 2, H / 2); g.scale(zoom, zoom); g.translate(-W / 2, -H / 2 - 20 + (zoom - 1) * 45);
  lump(g, W / 2, H / 2 + 20, 250, 3, crack, 1);
  const gk = prog(t, 1.2, 1.6);
  g.save();
  lumpPath(g, W / 2, H / 2 + 20, 250, 3); g.clip();
  gear(g, { x: W / 2 + 20, y: H / 2 - 40, teeth: 64, r: 170, rot: .02 * T, fill: `rgba(224,169,67,${.12 * gk})`, stroke: C.brass, lw: 2.2 / zoom + 1, alpha: gk, glow: "rgba(224,169,67,.8)", hole: "rgba(0,0,0,0)" });
  gear(g, { x: W / 2 - 150, y: H / 2 + 120, teeth: 38, r: 100, rot: -.03 * T, stroke: C.brass, lw: 2, alpha: gk * .6, hole: "rgba(0,0,0,0)" });
  g.restore();
  g.restore();
  const sk = vis(t, s.w(0, "millimetre") - .3, 1e9, .5);
  if (sk > 0) {
    g.save(); g.globalAlpha = sk;
    g.fillStyle = "rgba(13,17,23,.85)"; g.fillRect(1440, 820, 360, 120);
    g.fillStyle = C.bone;
    g.fillRect(1560, 900, 120, 4); g.fillRect(1560, 890, 3, 24); g.fillRect(1677, 890, 3, 24);
    text(g, "teeth ≈ 1–2 mm", 1620, 870, { size: 28, align: "center", color: C.bone, weight: 550 });
    g.restore();
  }
  caption(g, t, s.w(0, "two") - .2, s.dur - .6, ["Cut by hand", "2nd century BC"]);
};

// Stylised mechanism: front dial with Sun, Moon and phase ball, gear train behind, crank at the side.
function mechanism(g, T, x, y, R, o = {}) {
  const day = T * (o.speed ?? 6);           // days elapsed
  const sunA = day / 365.25 * TAU, moonA = day / 27.32 * TAU;
  // gears behind the face
  g.save(); g.globalAlpha *= o.gearAlpha ?? .5;
  const w = sunA;
  gear(g, { x: x + R * .55, y: y - R * .2, teeth: 64, r: R * .48, rot: w, stroke: C.brassDim, lw: 2, hole: "rgba(0,0,0,0)" });
  gear(g, { x: x + R * 1.05, y: y + R * .38, teeth: 38, r: R * .285, rot: -w * 64 / 38 + .1, stroke: C.brassDim, lw: 2, hole: "rgba(0,0,0,0)" });
  gear(g, { x: x - R * .75, y: y + R * .55, teeth: 48, r: R * .36, rot: w * 2.1, stroke: C.line, lw: 2, hole: "rgba(0,0,0,0)" });
  gear(g, { x: x - R * .95, y: y - R * .5, teeth: 32, r: R * .24, rot: -w * 3.2, stroke: C.line, lw: 2, hole: "rgba(0,0,0,0)" });
  g.restore();
  // face
  g.save();
  g.fillStyle = "rgba(13,17,23,.9)"; g.beginPath(); g.arc(x, y, R * .98, 0, TAU); g.fill();
  zodiacRing(g, x, y, R * .74, R * .96, 1, R * .045);
  g.strokeStyle = C.line; g.lineWidth = 1.5;
  for (let i = 0; i < 360; i += 5) { const a = i * Math.PI / 180, r1 = R * (i % 30 ? .72 : .69); g.beginPath(); g.moveTo(x + r1 * Math.cos(a), y + r1 * Math.sin(a)); g.lineTo(x + R * .74 * Math.cos(a), y + R * .74 * Math.sin(a)); g.stroke(); }
  // sun pointer
  const sa = sunA - Math.PI / 2, ma = moonA - Math.PI / 2;
  g.strokeStyle = C.brass; g.lineWidth = 5; g.lineCap = "round";
  g.beginPath(); g.moveTo(x, y); g.lineTo(x + R * .66 * Math.cos(sa), y + R * .66 * Math.sin(sa)); g.stroke();
  sunGear(g, x + R * .6 * Math.cos(sa), y + R * .6 * Math.sin(sa), R * .05, T);
  // moon pointer with phase ball
  g.strokeStyle = C.bone; g.lineWidth = 3;
  g.beginPath(); g.moveTo(x, y); g.lineTo(x + R * .5 * Math.cos(ma), y + R * .5 * Math.sin(ma)); g.stroke();
  const phase = ((moonA - sunA) / TAU % 1 + 1) % 1;
  moonDisc(g, x + R * .44 * Math.cos(ma), y + R * .44 * Math.sin(ma), R * .055, phase);
  g.fillStyle = C.brass; g.beginPath(); g.arc(x, y, R * .03, 0, TAU); g.fill();
  g.restore();
  // crank
  if (o.crank !== false) {
    const cx = x + R * 1.08, cy = y, ca = T * 1.6;
    g.save(); g.strokeStyle = C.mist; g.lineWidth = 8; g.lineCap = "round";
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + 60 * Math.cos(ca), cy + 60 * Math.sin(ca)); g.stroke();
    g.fillStyle = C.bone; g.beginPath(); g.arc(cx + 60 * Math.cos(ca), cy + 60 * Math.sin(ca), 12, 0, TAU); g.fill();
    g.fillStyle = C.mist; g.beginPath(); g.arc(cx, cy, 10, 0, TAU); g.fill();
    g.restore();
  }
  return { sunA, moonA, phase };
}

SCENES.orrery = (g, s) => {
  const t = s.t, T = s.T;
  bg(g);
  stars(g, 21, 180, .6);
  if (s.p.mode === "cold") {
    const R = 360, x = 760, y = 540;
    mechanism(g, T, x, y, R, { speed: 5 });
    const labels = [["Sun", "the Sun's place in the zodiac"], ["Moon", "the Moon's place"], ["phase", "the Moon's phase"], ["eclipse", "eclipse months"]];
    labels.forEach(([w, l], i) => {
      const a = vis(t, s.w(0, w) - .1, s.be(1) + .3, .4);
      text(g, l, 1330, 360 + i * 76, { size: 38, kind: "serif", weight: 520, color: i ? C.bone : C.brass, alpha: a });
    });
    const k = vis(t, s.b(1), 1e9, .6);
    if (k > 0) {
      g.save(); g.globalAlpha = k; g.fillStyle = C.brass; g.fillRect(1330, 700, 50, 3);
      text(g, "Nothing this complex survives", 1330, 752, { size: 32, color: C.bone, weight: 550 });
      text(g, "for more than a thousand years", 1330, 796, { size: 32, color: C.mist });
      g.restore();
    }
    return;
  }
  // closing: the model idea, then a later orrery, then the channel name
  const phase2 = prog(t, s.b(2) - .5, 2);
  const R = lerp(360, 300, phase2), x = lerp(760, 560, phase2);
  mechanism(g, T, x, 540, R, { speed: 4, gearAlpha: .5 * (1 - phase2) + .2 });
  const L = (w, bi, str, row, col = C.bone) => text(g, str, 1250, 330 + row * 70, { size: 38, kind: "serif", weight: 520, color: col, alpha: vis(t, s.w(bi, w) - .1, s.b(2) - .6, .5) });
  L("input", 0, "input: a date", 0, C.brass);
  L("outputs", 0, "outputs: positions, phases, eclipses", 1);
  L("Babylonian", 1, "Babylonian cycles", 3, C.brass);
  L("geometry", 1, "Greek geometry", 4, C.brass);
  // an 18th-century heliocentric orrery on the right
  const ok = prog(t, s.w(2, "clockwork") - .4, 1.4);
  if (ok > 0) {
    const ox = 1360, oy = 520;
    g.save(); g.globalAlpha = ok;
    const orbits = [[70, 88, C.mist], [115, 225, C.brass], [165, 365, C.verd], [220, 687, "#c9745a"], [300, 4333, C.bone]];
    orbits.forEach(([r, per, col]) => {
      g.strokeStyle = C.ink3; g.lineWidth = 2; g.beginPath(); g.ellipse(ox, oy, r, r * .42, 0, 0, TAU); g.stroke();
      const a = T * 60 / per * TAU * .1;
      const px = ox + r * Math.cos(a), py = oy + r * .42 * Math.sin(a);
      g.strokeStyle = C.brassDim; g.lineWidth = 2; g.beginPath(); g.moveTo(ox, oy); g.lineTo(px, py - 30); g.lineTo(px, py); g.stroke();
      g.fillStyle = col; g.beginPath(); g.arc(px, py - 30, 9, 0, TAU); g.fill();
    });
    sunGear(g, ox, oy - 30, 26, T * .2);
    g.fillStyle = C.brassDim; g.fillRect(ox - 6, oy, 12, 170); g.fillRect(ox - 120, oy + 170, 240, 14);
    g.restore();
    text(g, "Orrery, early 1700s", 1360, 880, { size: 28, align: "center", color: C.mist, alpha: ok });
  }
  // channel name
  const nk = prog(t, s.w(2, "channel") - 1.2, 1.6);
  if (nk > 0) {
    g.save(); g.fillStyle = `rgba(13,17,23,${.85 * nk})`; g.fillRect(0, 0, W, H); g.restore();
    text(g, "Orrery", W / 2, 560, { size: 150, kind: "serif", weight: 640, align: "center", alpha: nk });
    text(g, "Working models of everything.", W / 2, 640, { size: 40, color: C.brass, weight: 600, align: "center", alpha: prog(t, s.w(2, "channel") - .4, 1) });
  }
};

SCENES.title = (g, s) => {
  const t = s.t, T = s.T;
  bg(g);
  g.save(); g.globalAlpha = .18;
  gear(g, { x: 1450, y: 700, teeth: 223, r: 520, rot: T * .03, stroke: C.brassDim, lw: 2, spokes: 4, hole: "rgba(0,0,0,0)" });
  gear(g, { x: 520, y: 250, teeth: 64, r: 200, rot: -T * .1, stroke: C.brassDim, lw: 2, hole: "rgba(0,0,0,0)" });
  g.restore();
  const k = prog(t, .2, 1.2, easeOut);
  g.fillStyle = C.brass; g.fillRect(W / 2 - 40 * k, 420, 80 * k, 4);
  text(g, s.p.title, W / 2, 540, { size: 108, kind: "serif", weight: 620, align: "center", alpha: k });
  text(g, s.p.sub, W / 2, 620, { size: 38, color: C.mist, weight: 500, align: "center", alpha: prog(t, .8, 1) });
};

// ---------------------------------------------------------------- the lump in the drawer

SCENES.museum = (g, s) => {
  const t = s.t, T = s.T;
  const wall = g.createLinearGradient(0, 0, 0, H);
  wall.addColorStop(0, "#10151c"); wall.addColorStop(.72, "#1a212b"); wall.addColorStop(.72, "#0b0e13"); wall.addColorStop(1, "#07090c");
  g.fillStyle = wall; g.fillRect(0, 0, W, H);
  const focus = s.p.focus ? prog(t, 0, 1.8) : 0;
  const zoom = lerp(1, 2.6, focus);
  g.save();
  g.translate(lerp(1500, W / 2, focus), lerp(690, H / 2, focus)); g.scale(zoom, zoom); g.translate(-1500, -690);
  // spotlit statues on plinths
  [[320, 1], [700, .9], [1060, 1.05]].forEach(([x, sc], i) => {
    const cone = g.createRadialGradient(x, 300, 20, x, 520, 420);
    cone.addColorStop(0, "rgba(238,233,223,.10)"); cone.addColorStop(1, "rgba(238,233,223,0)");
    g.fillStyle = cone; g.beginPath(); g.moveTo(x - 30, 0); g.lineTo(x + 30, 0); g.lineTo(x + 240, 780); g.lineTo(x - 240, 780); g.fill();
    g.fillStyle = "#2a313b"; g.fillRect(x - 90, 620, 180, 160);
    if (i === 1) torso(g, x, 500, .95, 0, 1); else bust(g, x, 560, 1.05 * sc, 0, 1);
  });
  // the tray in the shadows, with the lump splitting as it dries
  g.fillStyle = "#1b2027"; g.fillRect(1340, 740, 320, 26);
  const split = s.p.focus ? 1 : prog(t, s.w(0, "cracked") - .6, 1.4);
  lump(g, 1470 - split * 22, 690, 70, 5, 0, 1);
  lump(g, 1540 + split * 22, 700, 52, 8, 0, 1);
  if (s.p.focus) {
    const gk = prog(t, s.w(0, "gear") - .4, 1);
    g.save(); g.globalAlpha = gk;
    g.save(); lumpPath(g, 1470 - 22, 690, 70, 5); g.clip();
    gear(g, { x: 1470, y: 700, teeth: 48, r: 42, rot: .3, stroke: C.brass, lw: 1.2, glow: "rgba(224,169,67,.9)", hole: "rgba(0,0,0,0)" });
    g.restore();
    const lk = prog(t, s.w(0, "letters") - .4, 1);
    g.globalAlpha = lk;
    greekLine(g, 1515, 690, "ΗΛΙΟΥ", 11, .9, "#e9dcc2");
    greekLine(g, 1517, 704, "ΜΗΝΕΣ", 9, .75, "#e9dcc2");
    g.restore();
  }
  g.restore();
  if (!s.p.focus) caption(g, t, .5, s.dur - .6, ["National Archaeological Museum", "Athens"]);
  else caption(g, t, .8, s.dur - .6, ["17 May 1902", "Valerios Stais notices a gear wheel"]);
};

SCENES.fragments = (g, s) => {
  const t = s.t, T = s.T;
  bg(g, "#151c26");
  const r = rng(82);
  const frs = [];
  for (let i = 0; i < 82; i++) {
    const big = i === 0;
    const size = big ? 150 : 10 + Math.pow(r(), 2.4) * 60;
    frs.push({ i, size, x: 0, y: 0, seed: i + 10 });
  }
  // layout: big fragment left, the rest scattered on a loose grid to the right
  frs[0].x = 470; frs[0].y = 520;
  for (let i = 1; i < 82; i++) { const c = (i - 1) % 12, row = Math.floor((i - 1) / 12); frs[i].x = 800 + c * 88 + (r() - .5) * 30; frs[i].y = 250 + row * 96 + (r() - .5) * 30; }
  if (!s.p.stack) {
    const count = Math.floor(82 * prog(t, 0, Math.max(1, s.w(0, "fragments") + .4), x => x));
    frs.forEach(f => {
      if (f.i >= count) return;
      const hi = f.i === 0 ? prog(t, s.w(0, "largest") - .3, .8) : 0;
      lump(g, f.x, f.y, f.size * (f.i ? 1 : 1 + .1 * hi), f.seed, 0, f.i && hi ? 1 - .5 * prog(t, s.w(0, "largest"), .8) : 1);
    });
    text(g, String(count), 470, 250, { size: 110, kind: "serif", weight: 620, align: "center", color: C.bone });
    text(g, "fragments", 470, 300, { size: 32, align: "center", color: C.mist });
    // one third + 30 gears
    const k1 = vis(t, s.w(0, "third") - .2, 1e9, .5);
    if (k1 > 0) {
      g.save(); g.globalAlpha = k1;
      g.strokeStyle = C.line; g.setLineDash([8, 8]); g.lineWidth = 2; g.strokeRect(1720 - 130, 780, 170, 90); g.setLineDash([]);
      g.fillStyle = "rgba(224,169,67,.35)"; g.fillRect(1720 - 130, 780, 170 / 3, 90);
      text(g, "≈ ⅓ survives", 1675, 910, { size: 28, color: C.bone, align: "center", weight: 550 });
      g.restore();
    }
    const k2 = vis(t, s.w(0, "thirty") - .2, 1e9, .5);
    if (k2 > 0) {
      for (let i = 0; i < 30; i++) {
        gear(g, { x: 830 + (i % 15) * 56, y: 880 + Math.floor(i / 15) * 60, teeth: 12, r: 18, rot: T * .5, fill: C.brass, alpha: k2 * prog(t, s.w(0, "thirty") + i * .03, .3), spokes: 0 });
      }
      text(g, "30 gears", 830 + 15 * 56, 890, { size: 30, color: C.brass, weight: 600, alpha: k2 });
    }
    const k3 = vis(t, s.w(0, "largest") - .1, 1e9, .5);
    callout(g, k3, 470, 400, 470, 150, "Fragment A: 27 of the 30 gears", C.brass, 30);
    return;
  }
  // stack: close on fragment A; hints of wheels and letters, unconnected
  const z = lerp(1, 1.12, t / s.dur);
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2);
  lump(g, W / 2, H / 2, 380, 10, 0, 1);
  g.save(); lumpPath(g, W / 2, H / 2, 380, 10); g.clip();
  const hk = prog(t, s.w(0, "edge") - .4, 1);
  g.save(); g.beginPath(); g.rect(W / 2 - 330, H / 2 - 290, 260, 200); g.clip();
  gear(g, { x: W / 2 - 150, y: H / 2 - 120, teeth: 64, r: 190, stroke: C.brass, lw: 3, alpha: hk, glow: "rgba(224,169,67,.6)", hole: "rgba(0,0,0,0)" });
  g.restore();
  const lk = prog(t, s.w(0, "letters") - .4, 1);
  greekLine(g, W / 2 + 70, H / 2 + 140, "ΚΑΙ ΤΟΝ ΚΥ", 34, lk * .85, "#e8dcc4");
  greekLine(g, W / 2 + 90, H / 2 + 186, "ΣΤΗΡΙΓ", 28, lk * .6, "#e8dcc4");
  g.save(); g.beginPath(); g.rect(W / 2 + 120, H / 2 - 260, 200, 170); g.clip();
  gear(g, { x: W / 2 + 250, y: H / 2 - 150, teeth: 38, r: 110, stroke: C.brass, lw: 3, alpha: prog(t, s.w(0, "wheel") + .4, 1), hole: "rgba(0,0,0,0)" });
  g.restore();
  g.restore();
  const qk = prog(t, s.w(0, "connected") - .6, 1);
  if (qk > 0) {
    g.save(); g.globalAlpha = qk; g.strokeStyle = C.signal; g.setLineDash([10, 10]); g.lineWidth = 3;
    g.beginPath(); g.moveTo(W / 2 - 200, H / 2 - 180); g.bezierCurveTo(W / 2 - 60, H / 2 - 320, W / 2 + 120, H / 2 - 320, W / 2 + 200, H / 2 - 190); g.stroke();
    g.setLineDash([]);
    text(g, "?", W / 2, H / 2 - 300, { size: 64, kind: "serif", weight: 600, color: C.signal, align: "center" });
    g.restore();
  }
  g.restore();
};

// ---------------------------------------------------------------- seeing inside

function xrayField(g, T, seed = 3) {
  // inverted-film look: dark bluish grey with a luminous fragment silhouette full of gear shapes
  g.fillStyle = "#0b1015"; g.fillRect(0, 0, W, H);
  const tex = cached("xray" + seed, 960, 540, (c, w, h) => {
    c.fillStyle = "#0b1015"; c.fillRect(0, 0, w, h);
    c.save();
    blobPath(c, w / 2, h / 2, 230, seed, .3); c.clip();
    const img = c.getImageData(0, 0, w, h), d = img.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const n = fbm(x * .02, y * .02, 4), i = (y * w + x) * 4;
      const v = 60 + n * 70; d[i] = v * .85; d[i + 1] = v * .95; d[i + 2] = v * 1.05; d[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    blobPath(c, w / 2, h / 2, 230, seed, .3); c.clip();
    c.globalCompositeOperation = "lighter";
    [[w / 2 - 40, h / 2, 64, 150], [w / 2 + 150, h / 2 - 80, 38, 70], [w / 2 + 120, h / 2 + 110, 48, 80], [w / 2 - 180, h / 2 - 110, 32, 60]].forEach(([x, y, n, r]) => {
      gear(c, { x, y, teeth: n, r, stroke: "rgba(210,225,235,.55)", lw: 3, hole: "rgba(0,0,0,0)" });
    });
    c.restore();
  });
  g.drawImage(tex, 0, 0, W, H);
}

SCENES.xray = (g, s) => {
  const t = s.t, T = s.T;
  const st = s.p.stage;
  if (st === "price") {
    bg(g);
    g.save(); g.globalAlpha = prog(t, 0, 1.5) * .9; xrayField(g, T); g.restore();
    const card = (x, y, name, role, a) => {
      if (a <= 0) return;
      g.save(); g.globalAlpha = a;
      g.fillStyle = "rgba(13,17,23,.9)"; g.fillRect(x, y, 620, 130);
      g.fillStyle = C.brass; g.fillRect(x, y, 5, 130);
      text(g, name, x + 34, y + 58, { size: 40, kind: "serif", weight: 580 });
      text(g, role, x + 34, y + 100, { size: 27, color: C.mist });
      g.restore();
    };
    card(110, 150, "Derek de Solla Price", "physicist and historian of science", vis(t, s.w(0, "Derek") - .3, 1e9, .5));
    card(1190, 780, "Charalambos Karakalos", "radiographer, Greek Atomic Energy Commission", vis(t, s.w(0, "Charalambos") - .3, 1e9, .5));
    text(g, "1971", 1700, 180, { size: 80, kind: "serif", weight: 600, align: "right", color: C.brass, alpha: vis(t, s.w(0, "1971") - .2, 1e9, .5) });
    return;
  }
  if (st === "count") {
    g.fillStyle = "#0b1015"; g.fillRect(0, 0, W, H);
    const x = 760, y = 540, n = 38, r = 300;
    gear(g, { x, y, teeth: n, r, rot: -Math.PI / 2, stroke: "rgba(210,225,235,.6)", lw: 3, hole: "rgba(0,0,0,0)" });
    const c = Math.floor(n * prog(t, .5, Math.min(7, s.dur - 3), x => x));
    for (let i = 0; i < c; i++) {
      const a = -Math.PI / 2 + (i + .5) * TAU / n;
      g.fillStyle = C.brass; g.beginPath(); g.arc(x + (r + 30) * Math.cos(a), y + (r + 30) * Math.sin(a), 6, 0, TAU); g.fill();
    }
    text(g, String(c), x, y + 40, { size: 120, kind: "serif", weight: 620, align: "center", color: C.brass });
    text(g, "teeth", x, y + 100, { size: 30, align: "center", color: C.mist });
    const k = vis(t, s.w(0, "program") - .2, 1e9, .6);
    text(g, "tooth counts", 1260, 470, { size: 50, kind: "serif", weight: 560, alpha: k });
    text(g, "= gear ratios", 1260, 540, { size: 50, kind: "serif", weight: 560, alpha: k, color: C.brass });
    text(g, "= what it calculates", 1260, 610, { size: 50, kind: "serif", weight: 560, alpha: vis(t, s.w(0, "calculate") - .2, 1e9, .6) });
    return;
  }
  if (st === "ct") {
    g.fillStyle = "#0b1015"; g.fillRect(0, 0, W, H);
    // stack of slices sweeping through the fragment
    const n = 14, sweep = prog(t, s.w(0, "scanned") - 1, 5, x => x);
    for (let i = 0; i < n; i++) {
      const k = i / (n - 1), on = k <= sweep;
      const x = 640 + i * 42, y = 330 - i * 14;
      g.save();
      g.setTransform(1, -.28, 0, 1, x, y);
      g.fillStyle = on ? "rgba(79,179,162,.10)" : "rgba(58,68,84,.08)";
      g.strokeStyle = on ? "rgba(79,179,162,.7)" : "rgba(58,68,84,.6)"; g.lineWidth = 1.5;
      g.fillRect(0, 0, 440, 440); g.strokeRect(0, 0, 440, 440);
      if (on) {
        g.globalAlpha = .7;
        gear(g, { x: 220 + 30 * Math.sin(i), y: 220, teeth: 40 + (i % 4) * 8, r: 110 + (i % 3) * 30, stroke: "rgba(210,225,235,.7)", lw: 2, hole: "rgba(0,0,0,0)" });
      }
      g.restore();
    }
    const k = vis(t, s.b(0), 1e9, .5);
    text(g, "2005", 140, 200, { size: 90, kind: "serif", weight: 600, color: C.brass, alpha: k });
    text(g, "Microfocus X-ray CT", 140, 250, { size: 32, color: C.bone, alpha: k });
    text(g, "every fragment, in 3D", 140, 292, { size: 30, color: C.mist, alpha: k });
    return;
  }
  // letters: hidden text surfacing from noise
  g.fillStyle = "#0b1015"; g.fillRect(0, 0, W, H);
  const lines = ["ΚΑΙ ΤΟ ΠΡΟΕΧΟΝ ΑΥΤΟΥ ΓΝΩΜΟΝΙΟΝ", "ΦΕΡΕΙ ΣΦΑΙΡΙΟΝ ΤΟ ΤΗΣ ΣΕΛΗΝΗΣ", "ΕΝ ΤΩΙ ΚΥΚΛΩΙ ΤΩΝ ΖΩΙΔΙΩΝ", "ΗΛΙΟΥ ΑΚΤΙΣ ΤΑ ΔΕ ΜΕΡΗ", "ΤΩΝ ΠΛΑΝΗΤΩΝ ΚΑΙ ΤΟΝ ΚΥΚΛΟΝ"];
  // (illustrative lettering in the style of the inscriptions, not a transcription)
  const r = rng(4);
  lines.forEach((ln, i) => {
    const a = prog(t, .6 + i * 1.1, 1.8) * .85;
    const y = 290 + i * 110, x = 260 + (i % 2) * 90;
    g.save(); g.filter = `blur(${(1 - a) * 6}px)`;
    greekLine(g, x, y, ln, 52, a, "#dfe7ea");
    g.restore();
  });
  const k = vis(t, s.w(0, "thousands") - .2, 1e9, .5);
  text(g, "thousands of characters", 1660, 900, { size: 36, kind: "serif", weight: 560, align: "right", color: C.brass, alpha: k });
  text(g, "including a description of the displays", 1660, 950, { size: 28, align: "right", color: C.mist, alpha: vis(t, s.w(0, "manual") - .4, 1e9, .5) });
  text(g, "lettering illustrative", 60, 1040, { size: 18, color: C.mist, alpha: .6 });
};

SCENES.number = (g, s) => {
  const t = s.t;
  bg(g);
  if (s.p.n === "127") {
    const k1 = prog(t, s.w(0, "hundred") - .4, .8, easeOut);
    const k2 = prog(t, s.w(0, "twice") - .2, .8, easeOut);
    const k3 = prog(t, s.w(0, "fifty") - .5, .8, easeOut);
    const shift = lerp(0, -330, k2);
    text(g, "127", W / 2 + shift, 600, { size: 240, kind: "serif", weight: 620, align: "center", alpha: k1 });
    text(g, "× 2", W / 2 + shift + 250, 600, { size: 90, kind: "serif", weight: 500, color: C.mist, alpha: k2 });
    text(g, "= 254", W / 2 + 330, 600, { size: 240, kind: "serif", weight: 620, color: C.brass, align: "center", alpha: k3 });
    const k4 = vis(t, s.w(0, "astronomers") - .2, 1e9, .5);
    text(g, "a number astronomers already knew", W / 2, 760, { size: 38, color: C.mist, align: "center", alpha: k4 });
    return;
  }
  // 462 / 442
  const kA = prog(t, s.w(0, "sixty") - .6, .8, easeOut), kB = prog(t, s.w(0, "forty") - .6, .8, easeOut);
  text(g, "462", 620, 560, { size: 220, kind: "serif", weight: 620, align: "center", color: C.brass, alpha: kA });
  text(g, "Venus", 620, 650, { size: 44, align: "center", color: C.bone, alpha: kA });
  text(g, "years in the cycle", 620, 700, { size: 28, align: "center", color: C.mist, alpha: kA });
  text(g, "442", 1300, 560, { size: 220, kind: "serif", weight: 620, align: "center", color: C.verd, alpha: kB });
  text(g, "Saturn", 1300, 650, { size: 44, align: "center", color: C.bone, alpha: kB });
  text(g, "years in the cycle", 1300, 700, { size: 28, align: "center", color: C.mist, alpha: kB });
  caption(g, t, .4, s.dur - .5, ["Freeth et al., 2021", "University College London, Scientific Reports"], 120, 900);
};

// ---------------------------------------------------------------- the problem with the sky

SCENES.sky = (g, s) => {
  const t = s.t, T = s.T, st = s.p.stage;
  bg(g);
  stars(g, 7, 220, .5);
  const cx = 820, cy = 540, R0 = 330, R1 = 410;
  zodiacRing(g, cx, cy, R0, R1, 1, 20);
  // Earth
  g.fillStyle = C.verd; g.beginPath(); g.arc(cx, cy, 16, 0, TAU); g.fill();
  text(g, "Earth", cx, cy + 50, { size: 24, align: "center", color: C.mist });
  // time runs at different rates per stage
  const days = st === "sun" ? prog(t, 1, s.dur - 1.5, x => x) * 365.25 : st === "moon" ? t * 4 : t * 3;
  const sunA = days / 365.25 * TAU - Math.PI / 2 + (st === "sun" ? 0 : 1.2);
  const sr = (R0 + R1) / 2;
  sunGear(g, cx + sr * Math.cos(sunA), cy + sr * Math.sin(sunA), 24, T * .3);
  if (st === "sun") {
    // trail
    g.strokeStyle = "rgba(224,169,67,.5)"; g.lineWidth = 4;
    g.beginPath(); g.arc(cx, cy, sr - 50, -Math.PI / 2, sunA); g.stroke();
    text(g, "day " + Math.max(1, Math.round(days)), 1420, 470, { size: 64, kind: "serif", weight: 600, color: C.brass });
    text(g, "the Sun: one lap per year", 1420, 530, { size: 32, color: C.mist });
    return;
  }
  const moonA = days / 27.32 * TAU - Math.PI / 2;
  const mr = 250;
  g.strokeStyle = C.ink3; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, mr, 0, TAU); g.stroke();
  const phase = ((moonA - sunA) / TAU % 1 + 1) % 1;
  if (st === "moon") {
    moonDisc(g, cx + mr * Math.cos(moonA), cy + mr * Math.sin(moonA), 20, .5);
    text(g, "27.3 days", 1420, 470, { size: 64, kind: "serif", weight: 600, color: C.bone });
    text(g, "the Moon: one lap of the zodiac", 1420, 530, { size: 32, color: C.mist });
    text(g, "day " + Math.floor(days % 27.32 + 1), 1420, 600, { size: 30, color: C.mist });
    return;
  }
  // phases: Sun-Earth line, lit moon, and the synodic month
  g.setLineDash([6, 10]); g.strokeStyle = "rgba(224,169,67,.4)"; g.lineWidth = 2;
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + sr * Math.cos(sunA), cy + sr * Math.sin(sunA)); g.stroke(); g.setLineDash([]);
  moonDisc(g, cx + mr * Math.cos(moonA), cy + mr * Math.sin(moonA), 22, phase);
  // big phase readout
  moonDisc(g, 1540, 380, 80, phase);
  text(g, "new moon → new moon", 1540, 540, { size: 34, align: "center", color: C.bone, alpha: vis(t, s.w(0, "new") - .3, 1e9, .5) });
  text(g, "≈ 29.5 days", 1540, 610, { size: 64, kind: "serif", weight: 600, align: "center", color: C.brass, alpha: vis(t, s.w(0, "twenty") - .3, 1e9, .5) });
  text(g, "Greek calendars counted these months", 1540, 700, { size: 28, align: "center", color: C.mist, alpha: vis(t, s.w(0, "calendars") - .3, 1e9, .5) });
};

SCENES.cycles = (g, s) => {
  const t = s.t, st = s.p.stage;
  bg(g);
  const x0 = 180, span = 1560;
  if (st === "mismatch") {
    const pxd = span / 380;
    const yA = 380, yB = 520;
    const kA = prog(t, .3, 1.2);
    g.fillStyle = "rgba(224,169,67,.85)"; g.fillRect(x0, yA, 365.24 * pxd * kA, 70);
    text(g, "1 solar year · 365.24 days", x0, yA - 20, { size: 32, color: C.bone, alpha: kA });
    const kB = prog(t, s.w(0, "whole") - .8, 2.4, x => x);
    for (let i = 0; i < 12; i++) {
      const a = clamp(kB * 12 - i);
      if (a <= 0) continue;
      g.fillStyle = `rgba(79,179,162,${.35 + .4 * (i % 2)})`;
      g.fillRect(x0 + i * 29.53 * pxd, yB, 29.53 * pxd * a - 3, 70);
    }
    text(g, "12 lunar months · 354.4 days", x0, yB + 115, { size: 32, color: C.bone, alpha: kB });
    const kG = vis(t, s.w(0, "eleven") - .4, 1e9, .5);
    if (kG > 0) {
      g.save(); g.globalAlpha = kG;
      g.fillStyle = "rgba(239,91,63,.25)"; g.fillRect(x0 + 354.37 * pxd, yB, 10.87 * pxd, 70);
      g.strokeStyle = C.signal; g.lineWidth = 3; g.strokeRect(x0 + 354.37 * pxd, yB, 10.87 * pxd, 70);
      text(g, "11 days short, every year", x0 + 354 * pxd + 40, yB + 180, { size: 36, color: C.signal, weight: 600, align: "right" });
      g.restore();
    }
    const kT = vis(t, s.w(0, "twelve") - .2, 1e9, .5);
    text(g, "≈ 12.37 months per year", 1740, 300, { size: 40, kind: "serif", weight: 560, align: "right", color: C.brass, alpha: kT });
    return;
  }
  if (st === "metonic") {
    const yA = 380, yB = 520, pxy = span / 19;
    const kA = prog(t, .2, 2, x => x);
    for (let i = 0; i < 19; i++) {
      if (kA * 19 < i) break;
      g.fillStyle = i % 2 ? "rgba(224,169,67,.55)" : "rgba(224,169,67,.8)";
      g.fillRect(x0 + i * pxy, yA, pxy - 3, 70);
    }
    text(g, "19 years", x0, yA - 20, { size: 34, color: C.bone, alpha: prog(t, .2, 1) });
    const kB = prog(t, s.w(0, "thirty") - 1, 3, x => x);
    const pxm = span * (6939.60 / 6939.69) / 235;
    g.fillStyle = C.verd;
    for (let i = 0; i < 235; i++) { if (kB * 235 < i) break; g.fillRect(x0 + i * pxm, yB, 2.4, i % 12 === 0 ? 70 : 50); }
    text(g, "235 lunar months", x0, yB + 115, { size: 34, color: C.bone, alpha: kB });
    const kE = vis(t, s.w(0, "mismatch") - .3, 1e9, .5);
    if (kE > 0) {
      g.save(); g.globalAlpha = kE;
      g.strokeStyle = C.brass; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x0 + span, yA - 40); g.lineTo(x0 + span, yB + 90); g.stroke();
      text(g, "off by about 2 hours", x0 + span, yB + 180, { size: 36, align: "right", color: C.brass, weight: 600 });
      g.restore();
    }
    const kS = vis(t, s.w(0, "seven") - .3, 1e9, .5);
    text(g, "19 × 12 = 228  →  + 7 extra months = 235", W / 2, 860, { size: 40, kind: "serif", weight: 540, align: "center", color: C.bone, alpha: kS });
    text(g, "the Metonic cycle", x0, 250, { size: 44, kind: "serif", weight: 600, color: C.brass, alpha: vis(t, s.w(0, "Metonic") - .3, 1e9, .5) });
    return;
  }
  // sidereal: "254" first, then it slides right as 235 + 19 arrive
  const k0 = prog(t, .2, .8), k1 = prog(t, s.w(0, "thirty") - .8, .8), k2 = prog(t, s.w(0, "plus") - .3, .8);
  const y = 560, x254 = lerp(W / 2, 1440, k1);
  text(g, "235", 520, y, { size: 170, kind: "serif", weight: 620, align: "center", color: C.verd, alpha: k1 });
  text(g, "lunar months", 520, y + 70, { size: 30, align: "center", color: C.mist, alpha: k1 });
  text(g, "+", 780, y - 10, { size: 110, kind: "serif", align: "center", color: C.mist, alpha: k2 });
  text(g, "19", 980, y, { size: 170, kind: "serif", weight: 620, align: "center", color: C.brass, alpha: k2 });
  text(g, "laps of the Sun", 980, y + 70, { size: 30, align: "center", color: C.mist, alpha: k2 });
  text(g, "=", 1180, y - 10, { size: 110, kind: "serif", align: "center", color: C.mist, alpha: k2 });
  text(g, "254", x254, y, { size: 170, kind: "serif", weight: 620, align: "center", color: C.bone, alpha: k0 });
  text(g, "laps of the Moon around the zodiac", x254, y + 70, { size: 30, align: "center", color: C.mist, alpha: k1 });
  text(g, "in 19 years", W / 2, 300, { size: 40, kind: "serif", weight: 540, align: "center", color: C.bone, alpha: k1 });
};

// ---------------------------------------------------------------- gear arithmetic

// Place a chain of meshing gears. Returns gears with x, y, rot(t) so teeth stay meshed.
function meshChain(spec, T, omega) {
  // spec: [{teeth, r, x?, y?, ang?, with?: index (same axle) , mesh?: index (meshes with)}]
  const out = [];
  spec.forEach((sp, i) => {
    const gg = { ...sp };
    if (i === 0) { gg.w = omega; gg.rot0 = 0; }
    else if (sp.with !== undefined) { const p = out[sp.with]; gg.x = p.x; gg.y = p.y; gg.w = p.w; gg.rot0 = sp.rot0 ?? 0; }
    else {
      const p = out[sp.mesh];
      gg.x = p.x + (p.r + sp.r) * Math.cos(sp.ang); gg.y = p.y + (p.r + sp.r) * Math.sin(sp.ang);
      gg.w = -p.w * p.teeth / sp.teeth;
      // tooth phases at the contact line sum to one half: a tip of one gear always meets a gap of the other
      const pStep = TAU / p.teeth, sStep = TAU / sp.teeth;
      const phaseP = (((sp.ang - p.rot0) / pStep) % 1 + 1) % 1;
      gg.rot0 = sp.ang + Math.PI - sStep * (.5 - phaseP);
    }
    gg.rot = gg.rot0 + gg.w * T;
    out.push(gg);
  });
  return out;
}

SCENES.gears = (g, s) => {
  const t = s.t, T = s.T, st = s.p.stage;
  bg(g);
  if (st === "pair") {
    const m = 6.4;
    const w = .25 * prog(t, .5, 1.5, x => x);
    const gs = meshChain([{ teeth: 64, r: 64 * m / 2, x: 700, y: 560 }, { teeth: 32, r: 32 * m / 2, mesh: 0, ang: 0 }], T, w === 0 ? 0 : .25);
    const [a, b] = gs;
    const tt = Math.max(0, t - .5);
    a.rot = a.rot0 + .25 * tt; b.rot = b.rot0 - .5 * tt;
    gear(g, { ...a, stroke: C.brass, fill: "rgba(224,169,67,.08)", lw: 2.5 });
    gear(g, { ...b, stroke: C.verd, fill: "rgba(79,179,162,.08)", lw: 2.5 });
    // marker on each gear to make turns countable
    [[a, C.brass], [b, C.verd]].forEach(([q, col]) => { g.fillStyle = col; g.beginPath(); g.arc(q.x + q.r * .55 * Math.cos(q.rot), q.y + q.r * .55 * Math.sin(q.rot), 10, 0, TAU); g.fill(); });
    text(g, "64 teeth", a.x, a.y - a.r - 50, { size: 34, align: "center", color: C.brass, weight: 600 });
    text(g, "32 teeth", b.x, b.y - b.r - 50, { size: 34, align: "center", color: C.verd, weight: 600 });
    const turnsA = .25 * tt / TAU;
    text(g, turnsA.toFixed(2) + " turns", a.x, a.y + a.r + 70, { size: 30, align: "center", color: C.mist });
    text(g, (turnsA * 2).toFixed(2) + " turns", b.x, b.y + b.r + 70, { size: 30, align: "center", color: C.mist });
    const k = vis(t, s.w(0, "ratio") - .3, 1e9, .5);
    text(g, "64 ÷ 32 = 2", 1500, 560, { size: 64, kind: "serif", weight: 600, align: "center", color: C.bone, alpha: k });
    text(g, "the ratio is the tooth counts", 1500, 620, { size: 28, align: "center", color: C.mist, alpha: k });
    return;
  }
  // the lunar train, laid out as three meshing pairs joined by shared axles:
  // 64→38 ≡ 48→24 ≡ 127→32. The 64 sits on the year-wheel axle; the 32 carries the Moon pointer.
  const gs = lunarTrain();
  const drive = st === "result" ? prog(t, .8, s.dur - 2.5, x => x) * TAU : T * .12;   // year-wheel angle
  gs.forEach(q => q.rot = q.rot0 + q.ratio * drive);
  const reveal = i => st === "train" ? prog(t, .3 + i * .45, .7) : 1;
  const colors = [C.brass, C.verd, C.brass, C.verd, C.brass, C.verd];
  // shared axles
  const axles = [[1, 2], [3, 4]];
  axles.forEach(([i, j]) => {
    const A = gs[i], B = gs[j];
    g.save(); g.globalAlpha = Math.min(reveal(i), reveal(j));
    g.strokeStyle = C.mist; g.lineWidth = 10; g.lineCap = "round";
    g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.stroke();
    g.restore();
  });
  gs.forEach((q, i) => gear(g, { ...q, stroke: colors[i], lw: 2.5, fill: "rgba(13,17,23,.92)", alpha: reveal(i), hole: "rgba(0,0,0,0)", spokes: q.r > 150 ? 4 : 0 }));
  axles.forEach(([i, j]) => {
    const A = gs[i], B = gs[j], mx = (A.x + A.r + B.x - B.r) / 2;
    g.save(); g.globalAlpha = Math.min(reveal(i), reveal(j)) * (st === "train" ? vis(t, s.w(0, "Chain") + 1.5, 1e9, .5) : 1);
    g.strokeStyle = C.mist; g.lineWidth = 1.5; g.beginPath(); g.moveTo(mx, A.y + 8); g.lineTo(mx, 850); g.stroke();
    text(g, "same axle", mx, 880, { size: 22, align: "center", color: C.mist });
    g.restore();
  });
  // tooth counts in the hubs
  gs.forEach((q, i) => text(g, String(q.teeth), q.x, q.y + 12, { size: q.r > 60 ? 34 : 26, align: "center", color: colors[i], weight: 700, alpha: reveal(i) }));
  // crank on the year-wheel axle, pointer on the last gear
  const A = gs[0], E = gs[5];
  g.save(); g.globalAlpha = reveal(0); g.strokeStyle = C.bone; g.lineWidth = 8; g.lineCap = "round";
  const ca = A.rot;
  g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(A.x + 95 * Math.cos(ca), A.y + 95 * Math.sin(ca)); g.stroke();
  g.fillStyle = C.bone; g.beginPath(); g.arc(A.x + 95 * Math.cos(ca), A.y + 95 * Math.sin(ca), 12, 0, TAU); g.fill();
  g.restore();
  g.save(); g.globalAlpha = reveal(5); g.strokeStyle = C.bone; g.lineWidth = 5; g.lineCap = "round";
  g.beginPath(); g.moveTo(E.x, E.y); g.lineTo(E.x + 120 * Math.cos(E.rot), E.y + 120 * Math.sin(E.rot)); g.stroke();
  moonDisc(g, E.x + 120 * Math.cos(E.rot), E.y + 120 * Math.sin(E.rot), 18, .5);
  g.restore();
  if (st === "train") {
    text(g, "year-wheel axle", A.x, A.y + A.r + 70, { size: 28, align: "center", color: C.bone, weight: 600, alpha: vis(t, s.w(0, "main") - .3, 1e9, .5) });
    text(g, "1 turn per year, by hand", A.x, A.y + A.r + 108, { size: 24, align: "center", color: C.mist, alpha: vis(t, s.w(0, "handle") - .3, 1e9, .5) });
    text(g, "Moon pointer", E.x, E.y + E.r + 60, { size: 28, align: "center", color: C.bone, weight: 600, alpha: vis(t, s.w(0, "pointer") - .3, 1e9, .5) });
    return;
  }
  // fractions above each meshing pair
  const pairs = [[0, 1, "sixty"], [2, 3, "forty"], [4, 5, "hundred"]];
  const fy = 190;
  const frac = (x, n, d, col, a) => {
    text(g, n, x, fy - 8, { size: 54, kind: "serif", weight: 600, align: "center", color: col, alpha: a });
    g.save(); g.globalAlpha = a; g.fillStyle = C.mist; g.fillRect(x - 55, fy + 8, 110, 3); g.restore();
    text(g, d, x, fy + 64, { size: 54, kind: "serif", weight: 600, align: "center", color: col, alpha: a });
  };
  pairs.forEach(([i, j, w], k) => {
    const a = st === "math" ? vis(t, s.w(0, w) - .3, 1e9, .4) : 1;
    frac((gs[i].x + gs[j].x) / 2, String(gs[i].teeth), String(gs[j].teeth), C.bone, a);
    if (k) text(g, "×", (gs[i - 1].x + gs[i].x) / 2 + 10, fy + 28, { size: 48, align: "center", color: C.mist, alpha: a });
  });
  const ka = st === "math" ? vis(t, s.w(0, "exactly") - .3, 1e9, .4) : 1;
  text(g, "=", 1540, fy + 28, { size: 48, align: "center", color: C.mist, alpha: ka });
  frac(1660, "254", "19", C.brass, ka);
  if (st === "result") {
    const turns = drive / TAU;
    text(g, turns.toFixed(2), 1660, 470, { size: 72, kind: "serif", weight: 620, align: "center", color: C.bone });
    text(g, "turns of the year wheel", 1660, 510, { size: 24, align: "center", color: C.mist });
    text(g, (turns * 254 / 19).toFixed(2), 1660, 650, { size: 72, kind: "serif", weight: 620, align: "center", color: C.brass });
    text(g, "turns of the Moon pointer", 1660, 690, { size: 24, align: "center", color: C.mist });
    text(g, "The arithmetic is in the bronze.", W / 2, 990, { size: 40, kind: "serif", weight: 560, align: "center", color: C.bone, alpha: vis(t, s.w(0, "bronze") - 1.2, 1e9, .6) });
  }
};

// Moon train geometry: positions, ratios relative to the year wheel, and tooth phases that keep meshes clean.
function lunarTrain() {
  const m = 3.4, y = 600, gap = 60;
  const teeth = [64, 38, 48, 24, 127, 32];
  const gs = teeth.map(n => ({ teeth: n, r: n * m / 2, y }));
  gs[0].x = 250;
  gs[1].x = gs[0].x + gs[0].r + gs[1].r;             // mesh
  gs[2].x = gs[1].x + gs[1].r + gap + gs[2].r;       // same axle (exploded)
  gs[3].x = gs[2].x + gs[2].r + gs[3].r;             // mesh
  gs[4].x = gs[3].x + gs[3].r + gap + gs[4].r;       // same axle (exploded)
  gs[5].x = gs[4].x + gs[4].r + gs[5].r;             // mesh
  gs[0].ratio = 1; gs[0].rot0 = 0;
  for (let i = 1; i < 6; i++) {
    const p = gs[i - 1], q = gs[i];
    if (i % 2) {       // meshes with the previous gear, contact on the line joining them (angle 0)
      q.ratio = -p.ratio * p.teeth / q.teeth;
      const phaseP = (((0 - p.rot0) / (TAU / p.teeth)) % 1 + 1) % 1;
      q.rot0 = Math.PI - (TAU / q.teeth) * (.5 - phaseP);
    } else { q.ratio = p.ratio; q.rot0 = 0; }
  }
  return gs;
}

// ---------------------------------------------------------------- the Moon that speeds up

SCENES.pinslot = (g, s) => {
  const t = s.t, T = s.T, st = s.p.stage;
  bg(g);
  const anom = 27.55;
  if (st === "problem" || st === "graph") {
    // speed plot across one anomalistic month
    const x0 = 260, x1 = 1660, y0 = 640, amp = 150;
    g.strokeStyle = C.ink3; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.stroke();
    text(g, "average speed", x0, y0 - 14, { size: 24, color: C.mist });
    const k = prog(t, .6, Math.min(6, s.dur - 1), x => x);
    g.strokeStyle = C.bone; g.lineWidth = 4; g.beginPath();
    for (let i = 0; i <= 200 * k; i++) { const x = lerp(x0, x1, i / 200), y = y0 - amp * Math.cos(i / 200 * 2 * TAU); i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
    text(g, "faster", x0 + 10, y0 - amp - 30, { size: 32, color: C.brass, weight: 600, alpha: vis(t, s.w(0, "speeds") - .2, 1e9, .4) });
    text(g, "slower", x0 + (x1 - x0) * .25, y0 + amp + 50, { size: 32, color: C.verd, weight: 600, align: "center", alpha: vis(t, s.w(0, "slows") - .2, 1e9, .4) });
    text(g, "≈ 27.5 days", (x0 + x1) / 2, 900, { size: 32, align: "center", color: C.mist, alpha: vis(t, s.w(0, "twenty") - .2, 1e9, .4) });
    g.fillStyle = C.ink3; g.fillRect(x0, 860, x1 - x0, 2);
    text(g, s.p.stage === "graph" ? "Moon pointer speed" : "the Moon's speed across the sky", x0, 280, { size: 44, kind: "serif", weight: 560 });
    if (st === "graph") {
      // the dial pointer with its ghost
      const cx = 1560, cy = 300, a = T * .9, ecc = .25 * Math.sin(T * .9);
      g.strokeStyle = C.ink3; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, 110, 0, TAU); g.stroke();
      g.strokeStyle = "rgba(154,164,178,.5)"; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + 100 * Math.cos(a), cy + 100 * Math.sin(a)); g.stroke();
      g.strokeStyle = C.bone; g.lineWidth = 5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + 100 * Math.cos(a + ecc), cy + 100 * Math.sin(a + ecc)); g.stroke();
    }
    return;
  }
  if (st === "theory") {
    // ellipse orbit with Earth at a focus; Moon moves by Kepler's law (eccentricity exaggerated)
    const cx = 620, cy = 560, a = 380, e = .45, b = a * Math.sqrt(1 - e * e), fx = cx - a * e;
    g.strokeStyle = C.line; g.lineWidth = 2; g.beginPath(); g.ellipse(cx, cy, a, b, 0, 0, TAU); g.stroke();
    g.fillStyle = C.verd; g.beginPath(); g.arc(fx, cy, 18, 0, TAU); g.fill();
    text(g, "Earth", fx, cy + 52, { size: 24, align: "center", color: C.mist });
    const M = T * .8; let E = M; for (let i = 0; i < 8; i++) E = M + e * Math.sin(E);
    const mx = cx + a * Math.cos(E), my = cy + b * Math.sin(E);
    // trail of equal-time dots
    for (let j = 1; j < 14; j++) { let Ej = M - j * .25; const Mj = Ej; for (let i = 0; i < 8; i++) Ej = Mj + e * Math.sin(Ej); g.fillStyle = `rgba(238,233,223,${.5 - j * .035})`; g.beginPath(); g.arc(cx + a * Math.cos(Ej), cy + b * Math.sin(Ej), 5, 0, TAU); g.fill(); }
    moonDisc(g, mx, my, 20, .5);
    text(g, "closer: faster", fx - 60, cy - b - 40, { size: 30, color: C.brass, weight: 600, alpha: vis(t, s.w(0, "closer") - .2, 1e9, .5) });
    text(g, "eccentricity exaggerated", cx, cy + b + 70, { size: 22, color: C.mist, align: "center", alpha: .8 });
    // Hipparchus: epicycle model
    const hk = vis(t, s.w(0, "Hipparchus") - .3, 1e9, .6);
    if (hk > 0) {
      g.save(); g.globalAlpha = hk;
      const hx = 1440, hy = 560, R = 230, r = 60;
      g.strokeStyle = C.line; g.lineWidth = 2; g.beginPath(); g.arc(hx, hy, R, 0, TAU); g.stroke();
      g.fillStyle = C.verd; g.beginPath(); g.arc(hx, hy, 12, 0, TAU); g.fill();
      const A = T * .8, ex = hx + R * Math.cos(A), ey = hy + R * Math.sin(A);
      g.strokeStyle = C.brassDim; g.beginPath(); g.moveTo(hx, hy); g.lineTo(ex, ey); g.stroke();
      g.strokeStyle = C.brass; g.beginPath(); g.arc(ex, ey, r, 0, TAU); g.stroke();
      const B = -T * .8 * 1.03, px = ex + r * Math.cos(B), py = ey + r * Math.sin(B);
      moonDisc(g, px, py, 14, .5);
      text(g, "Hipparchus", hx, hy - R - 70, { size: 38, kind: "serif", weight: 580, align: "center" });
      text(g, "a circle riding on a circle", hx, hy - R - 30, { size: 26, color: C.mist, align: "center" });
      g.restore();
    }
    return;
  }
  // mechanism / carrier: two 50-tooth wheels on offset axes, pin-and-slot coupling
  const carrier = st === "carrier";
  const ck = carrier ? prog(t, 1, 2) : 0;
  const cx = lerp(820, 960, ck), cy = 540;
  const carA = carrier ? T * .15 : 0;
  const scale = lerp(1, .62, ck);
  if (carrier) {
    gear(g, { x: cx, y: cy, teeth: 223, r: 330, rot: carA, stroke: C.line, lw: 2, alpha: ck, hole: "rgba(0,0,0,0)", spokes: 0 });
    text(g, "the carrier: about 9 years per turn", cx, cy + 420, { size: 30, align: "center", color: C.mist, alpha: vis(t, s.w(0, "nine") - .3, 1e9, .5) });
  }
  g.save();
  g.translate(cx, cy); g.rotate(carA); g.scale(scale, scale);
  const off = 80;  // exaggerated axis offset (the real one is about 1.1 mm)
  const r1 = 230, pinR = 150;
  const A = T * .7;
  // k1 (driver) centred at (-off/2, 0); pin at pinR
  const k1x = -off / 2, k2x = off / 2;
  const px = k1x + pinR * Math.cos(A), py = pinR * Math.sin(A);
  const B = Math.atan2(py, px - k2x);  // k2 follows the pin through its slot
  gear(g, { x: k1x, y: 0, teeth: 50, r: r1, rot: A, stroke: C.brass, lw: 2.5, fill: "rgba(224,169,67,.05)", hole: "rgba(0,0,0,0)", spokes: 0 });
  g.save(); g.globalAlpha = .9;
  gear(g, { x: k2x, y: 0, teeth: 50, r: r1 - 44, rot: B, stroke: C.verd, lw: 2.5, fill: "rgba(13,17,23,.75)", hole: "rgba(0,0,0,0)", spokes: 0 });
  g.restore();
  // slot on k2
  g.save(); g.translate(k2x, 0); g.rotate(B);
  g.strokeStyle = C.verd; g.lineWidth = 3; g.strokeRect(pinR - 70, -12, 140, 24);
  g.restore();
  // pin on k1
  g.fillStyle = C.bone; g.beginPath(); g.arc(px, py, 11, 0, TAU); g.fill();
  // axes
  g.fillStyle = C.brass; g.beginPath(); g.arc(k1x, 0, 8, 0, TAU); g.fill();
  g.fillStyle = C.verd; g.beginPath(); g.arc(k2x, 0, 8, 0, TAU); g.fill();
  // ghost pointer (uniform) vs real pointer (k2)
  g.strokeStyle = "rgba(154,164,178,.5)"; g.lineWidth = 4; g.beginPath(); g.moveTo(k2x, 0); g.lineTo(k2x + 300 * Math.cos(A), 300 * Math.sin(A)); g.stroke();
  g.strokeStyle = C.bone; g.lineWidth = 5; g.beginPath(); g.moveTo(k2x, 0); g.lineTo(k2x + 300 * Math.cos(B), 300 * Math.sin(B)); g.stroke();
  g.restore();
  if (!carrier) {
    const lk = i => vis(t, i, 1e9, .5);
    callout(g, lk(s.w(0, "fifty") - .3), cx - off / 2 + 160, cy - 160, 1240, 300, "gear with a pin · 50 teeth", C.brass, 30);
    callout(g, lk(s.w(0, "slot") - .3), cx + off / 2 + 120, cy + 110, 1240, 760, "gear with a slot · 50 teeth", C.verd, 30);
    text(g, "axes offset by about 1 mm", 1252, 500, { size: 30, color: C.bone, alpha: lk(s.w(0, "offset") - .3) });
    text(g, "(exaggerated here)", 1252, 540, { size: 26, color: C.mist, alpha: lk(s.w(0, "offset") - .3) });
    text(g, "grey: steady rate    white: the Moon pointer", 820, 1000, { size: 26, color: C.mist, align: "center", alpha: lk(s.w(0, "ahead") - .5) });
  }
};

// ---------------------------------------------------------------- the back of the box

SCENES.spiral = (g, s) => {
  const t = s.t, T = s.T, st = s.p.stage;
  bg(g);
  const saros = st === "saros" || st === "glyphs";
  const turns = saros ? 4 : 5, cells = saros ? 223 : 235;
  const cx = 700, cy = 560, r0 = 150, pitch = saros ? 78 : 64;
  const follower = st === "follower";
  const z = follower ? lerp(1, 2.3, prog(t, .2, 2)) : 1;
  const pos = saros ? (st === "glyphs" ? 110 + 30 * prog(t, 1, s.dur - 2) : 223 * prog(t, 1, s.dur - 1.5, x => x))
    : follower ? 150 + 60 * prog(t, 0, s.dur, x => x) : 235 * prog(t, 1, s.dur - 1.5, x => x);
  g.save();
  const a = pos / cells * turns * TAU;
  const tipR = r0 + pitch * a / TAU;
  const tip = [cx + tipR * Math.cos(a - Math.PI / 2), cy + tipR * Math.sin(a - Math.PI / 2)];
  if (follower) { g.translate(tip[0], tip[1]); g.scale(z, z); g.translate(-tip[0] + (W / 2 - tip[0]) / z * prog(t, .2, 2), -tip[1] + (H / 2 - tip[1]) / z * prog(t, .2, 2)); }
  const sp = spiralDial(g, cx, cy, turns, cells, r0, pitch, { lit: Math.floor(pos) });
  // eclipse glyphs on the Saros dial (positions illustrative, at 5–6 month spacing)
  if (st === "glyphs") {
    const r = rng(9);
    let c = 1, i = 0;
    while (c < cells) {
      const mid = sp.th(c + .5), [gx, gy] = sp.pt(mid);
      const lunar = i % 2 === 0, gk = prog(t, .2 + i * .04, .5);
      g.save(); g.globalAlpha = gk;
      g.fillStyle = lunar ? "rgba(238,233,223,.9)" : "rgba(224,169,67,.95)";
      text(g, lunar ? "Σ" : "Η", gx, gy + 9, { size: 24, kind: "serif", weight: 600, align: "center", color: lunar ? C.bone : C.brass });
      g.restore();
      c += r() < .8 ? 6 : 5; i++;
    }
  }
  // pointer: from centre to the groove, with a follower pin at the tip
  g.strokeStyle = C.bone; g.lineWidth = 5; g.lineCap = "round";
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(tip[0], tip[1]); g.stroke();
  g.fillStyle = C.brass; g.beginPath(); g.arc(tip[0], tip[1], 10, 0, TAU); g.fill();
  g.fillStyle = C.bone; g.beginPath(); g.arc(cx, cy, 12, 0, TAU); g.fill();
  g.restore();
  if (follower) {
    text(g, "follower pin rides in the groove", W / 2 + 60, H / 2 - 150, { size: 32, color: C.brass, weight: 600, alpha: prog(t, 1.5, .6) });
    text(g, "so the pointer lengthens as it spirals out", W / 2 + 60, H / 2 - 105, { size: 28, color: C.mist, alpha: prog(t, 2.2, .6) });
    return;
  }
  const x = 1360;
  if (!saros) {
    text(g, "Upper back dial", x, 300, { size: 30, color: C.mist });
    text(g, "Calendar", x, 370, { size: 64, kind: "serif", weight: 600 });
    text(g, "5 turns · 235 months", x, 440, { size: 34, color: C.brass, weight: 600, alpha: vis(t, s.w(0, "five") - .3, 1e9, .5) });
    text(g, "= 19 years (Metonic)", x, 490, { size: 34, color: C.bone, alpha: vis(t, s.w(0, "Metonic") - .3, 1e9, .5) });
    text(g, "month " + Math.max(1, Math.ceil(pos)), x, 620, { size: 44, kind: "serif", weight: 560, color: C.mist });
  } else {
    text(g, "Lower back dial", x, 300, { size: 30, color: C.mist });
    text(g, "Eclipses", x, 370, { size: 64, kind: "serif", weight: 600 });
    text(g, "4 turns · 223 months", x, 440, { size: 34, color: C.brass, weight: 600, alpha: st === "glyphs" ? 1 : vis(t, s.w(0, "four") - .3, 1e9, .5) });
    text(g, "≈ 18 years (the Saros)", x, 490, { size: 34, color: C.bone, alpha: st === "glyphs" ? 1 : vis(t, s.w(0, "Saros") - .3, 1e9, .5) });
    if (st === "glyphs") {
      text(g, "Σ  lunar eclipse", x, 600, { size: 32, kind: "serif", color: C.bone });
      text(g, "Η  solar eclipse", x, 650, { size: 32, kind: "serif", color: C.brass });
      text(g, "glyph positions illustrative", x, 720, { size: 22, color: C.mist });
    } else {
      text(g, "month " + Math.max(1, Math.ceil(pos)), x, 620, { size: 44, kind: "serif", weight: 560, color: C.mist });
    }
  }
};

SCENES.games = (g, s) => {
  const t = s.t, T = s.T;
  bg(g);
  // month names ring
  const months = ["Phoinikaios", "Kraneios", "Lanotropios", "Machaneus", "Dodekateus", "Eukleios", "Artemisios", "Psydreus", "Gameilios", "Agrianios", "Panamos", "Apellaios"];
  const mk = prog(t, .3, 1.5);
  months.forEach((m, i) => {
    const a = prog(t, .3 + i * .12, .5);
    text(g, m, 180 + (i % 3) * 300, 300 + Math.floor(i / 3) * 70, { size: 36, kind: "serif", weight: 500, color: C.bone, alpha: a * mk });
  });
  text(g, "Month names on the calendar dial: Corinthian", 180, 210, { size: 30, color: C.brass, weight: 600, alpha: mk });
  // four-year games dial
  const gk = vis(t, s.w(0, "smaller") - .4, 1e9, .6);
  if (gk > 0) {
    const cx = 1440, cy = 560, R = 250;
    g.save(); g.globalAlpha = gk;
    for (let i = 0; i < 4; i++) {
      const a0 = -Math.PI / 2 + i * TAU / 4;
      g.strokeStyle = C.line; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + R * Math.cos(a0), cy + R * Math.sin(a0)); g.stroke();
      text(g, "year " + (i + 1), cx + R * .62 * Math.cos(a0 + TAU / 8), cy + R * .62 * Math.sin(a0 + TAU / 8) + 10, { size: 28, align: "center", color: C.mist });
    }
    g.strokeStyle = C.line; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.stroke();
    const pa = -Math.PI / 2 + prog(t, s.w(0, "four"), s.dur - s.w(0, "four") - .5, x => x) * TAU;
    g.strokeStyle = C.brass; g.lineWidth = 5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + R * .9 * Math.cos(pa), cy + R * .9 * Math.sin(pa)); g.stroke();
    text(g, "Games dial", cx, cy - R - 90, { size: 44, kind: "serif", weight: 600, align: "center" });
    text(g, "games named include Olympia, Nemea, Isthmia, Pythia, Naa", cx, cy + R + 70, { size: 28, align: "center", color: C.mist });
    text(g, "Olympic Games", cx, cy + R + 118, { size: 32, align: "center", color: C.brass, weight: 600, alpha: vis(t, s.w(0, "Olympics") - .3, 1e9, .5) });
    g.restore();
  }
};

// ---------------------------------------------------------------- the front dial

const EGYPT = ["Thoth", "Phaophi", "Athyr", "Choiak", "Tybi", "Mechir", "Phamenoth", "Pharmouthi", "Pachon", "Payni", "Epiphi", "Mesore"];

SCENES.front = (g, s) => {
  const t = s.t, T = s.T, st = s.p.stage;
  bg(g);
  const cx = st === "full" ? 960 : 780, cy = 540, R = 430;
  const shift = st === "rings" ? .08 * Math.sin(clamp((t - s.w(0, "turned")) / 2) * Math.PI) : 0;
  // Egyptian calendar ring (outer), movable
  g.save(); g.translate(cx, cy); g.rotate(shift);
  g.strokeStyle = C.line; g.lineWidth = 2;
  g.beginPath(); g.arc(0, 0, R, 0, TAU); g.stroke();
  g.beginPath(); g.arc(0, 0, R - 70, 0, TAU); g.stroke();
  const ek = st === "rings" ? prog(t, s.w(0, "outer") - .4, 1.2) : 1;
  for (let d = 0; d < 365; d++) {
    const a = -Math.PI / 2 + d / 365 * TAU;
    if (d / 365 > ek) break;
    const l = d % 30 === 0 ? 24 : 10;
    g.strokeStyle = d % 30 === 0 ? C.mist : C.ink3;
    g.beginPath(); g.moveTo((R - 70) * Math.cos(a), (R - 70) * Math.sin(a)); g.lineTo((R - 70 + l) * Math.cos(a), (R - 70 + l) * Math.sin(a)); g.stroke();
  }
  EGYPT.forEach((m, i) => {
    const a = -Math.PI / 2 + (i * 30 + 15) / 365 * TAU;
    if ((i * 30 + 15) / 365 > ek) return;
    g.save(); g.rotate(a + Math.PI / 2); text(g, m.toUpperCase(), 0, -(R - 26), { size: 17, align: "center", color: C.mist, tracking: 2, weight: 550 }); g.restore();
  });
  g.restore();
  // zodiac (inner)
  const zk = st === "rings" ? prog(t, s.w(0, "inner") - .4, 1) : 1;
  zodiacRing(g, cx, cy, R - 170, R - 80, zk, 18);
  if (st === "rings") {
    callout(g, vis(t, s.w(0, "inner") - .2, 1e9), cx + (R - 125) * Math.cos(-.3), cy + (R - 125) * Math.sin(-.3), 1500, 330, "zodiac", C.bone, 32);
    callout(g, vis(t, s.w(0, "outer") - .2, 1e9), cx + (R - 35) * Math.cos(.35), cy + (R - 35) * Math.sin(.35), 1500, 700, "Egyptian calendar months", C.bone, 32);
    text(g, "365 days, and movable", 1512, 750, { size: 26, color: C.mist, alpha: vis(t, s.w(0, "turned") - .3, 1e9, .5) });
    const dk = vis(t, s.w(0, "2024") - .3, 1e9, .5);
    text(g, "or a 354-day lunar count?", 1512, 800, { size: 26, color: C.signal, alpha: dk });
    text(g, "still debated", 1512, 836, { size: 26, color: C.signal, alpha: dk });
    return;
  }
  const day = T * 4;
  const sunA = day / 365.25 * TAU - Math.PI / 2, moonA = day / 27.32 * TAU - Math.PI / 2 + 1.1;
  // planets (reconstruction)
  if (st === "planets" || st === "full") {
    const pl = [["Mercury", 88, C.mist], ["Venus", 225, "#e8d6a8"], ["Mars", 687, C.signal], ["Jupiter", 4333, "#d9b38c"], ["Saturn", 10759, C.verd]];
    pl.forEach(([n, per, col], i) => {
      const k = st === "planets" ? prog(t, s.w(0, n) - .4, .6) : 1;
      if (k <= 0) return;
      // geocentric display: rough angle from a nominal period, just for motion
      const a = -Math.PI / 2 + (day / per * TAU) * (per < 365 ? .25 : 1) + i * 1.3;
      const r = 90 + i * 30;
      g.save(); g.globalAlpha = k * .9;
      g.strokeStyle = C.ink3; g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke();
      g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); g.stroke();
      g.fillStyle = col; g.beginPath(); g.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 9, 0, TAU); g.fill();
      g.restore();
      if (st === "planets") text(g, n, 1480, 330 + i * 64, { size: 38, kind: "serif", weight: 540, color: col, alpha: k });
    });
    if (st === "planets") {
      const nk = vis(t, s.w(0, "Almost") - .3, 1e9, .5);
      text(g, "almost none of the", 1480, 700, { size: 28, color: C.signal, weight: 550, alpha: nk });
      text(g, "planetary gearing survives", 1480, 738, { size: 28, color: C.signal, weight: 550, alpha: nk });
    }
  }
  // Sun and Moon pointers
  const sr = R - 180;
  g.strokeStyle = C.brass; g.lineWidth = 5; g.lineCap = "round";
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + sr * Math.cos(sunA), cy + sr * Math.sin(sunA)); g.stroke();
  sunGear(g, cx + sr * Math.cos(sunA), cy + sr * Math.sin(sunA), 22, T * .3);
  const mr = R - 230;
  g.strokeStyle = C.bone; g.lineWidth = 4;
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + mr * Math.cos(moonA), cy + mr * Math.sin(moonA)); g.stroke();
  const phase = ((moonA - sunA) / TAU % 1 + 1) % 1;
  moonDisc(g, cx + mr * Math.cos(moonA), cy + mr * Math.sin(moonA), 20, phase);
  g.fillStyle = C.brass; g.beginPath(); g.arc(cx, cy, 10, 0, TAU); g.fill();
  if (st === "pointers") {
    callout(g, vis(t, s.w(0, "Sun") - .2, 1e9), cx + sr * Math.cos(sunA), cy + sr * Math.sin(sunA), 1500, 330, "Sun pointer", C.brass, 32);
    callout(g, vis(t, s.w(0, "Moon") - .2, 1e9), cx + mr * Math.cos(moonA), cy + mr * Math.sin(moonA), 1500, 450, "Moon pointer", C.bone, 32);
    const bk = vis(t, s.w(0, "ball") - .3, 1e9, .5);
    if (bk > 0) {
      g.save(); g.globalAlpha = bk;
      moonDisc(g, 1620, 700, 80, phase);
      text(g, "phase ball: half pale, half dark", 1620, 830, { size: 26, align: "center", color: C.mist });
      g.restore();
    }
    text(g, "Moon − Sun = phase", 1620, 890, { size: 32, kind: "serif", align: "center", color: C.brass, alpha: vis(t, s.w(0, "difference") - .3, 1e9, .5) });
  }
  if (st === "full") caption(g, t, .5, s.dur - .6, ["Proposed reconstruction", "Freeth et al., 2021 · planetary display is hypothetical"], 90, 960);
};

// ---------------------------------------------------------------- who built it

SCENES.map = (g, s) => {
  const t = s.t, T = s.T;
  g.fillStyle = "#0b1016"; g.fillRect(0, 0, W, H);
  const z = lerp(1, 1.04, t / s.dur);
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2);
  const box = [10.2, 33.2, 30.8, 43.6, 60, 20, 1800];
  drawLand(g, box, "#1a212b", "#3a4454", 1.5);
  const place = (lon, lat, name, sub, a, col = C.brass) => {
    if (a <= 0) return;
    const [x, y] = project(lon, lat, box);
    g.save(); g.globalAlpha = a;
    g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 14 + 4 * Math.sin(T * 3), 0, TAU); g.stroke();
    g.fillStyle = col; g.beginPath(); g.arc(x, y, 5, 0, TAU); g.fill();
    text(g, name, x + 24, y - 4, { size: 30, weight: 600, color: col });
    if (sub) text(g, sub, x + 24, y + 30, { size: 24, color: C.mist });
    g.restore();
  };
  place(12.50, 41.90, "Rome", "Cicero", vis(t, s.w(0, "Cicero") - .3, 1e9, .5), C.bone);
  place(15.29, 37.07, "Syracuse", "Archimedes", vis(t, s.w(0, "Archimedes") - .3, 1e9, .5));
  place(28.22, 36.43, "Rhodes", "Posidonius", vis(t, s.w(0, "Posidonius") - .3, 1e9, .5));
  place(23.30, 35.86, "Antikythera", "the only survivor", vis(t, s.w(0, "only") - .6, 1e9, .5), C.verd);
  g.restore();
};

SCENES.timeline = (g, s) => {
  const t = s.t, st = s.p.stage;
  bg(g);
  const y0 = 560, x0 = 140, x1 = 1780;
  const d = st === "dates";
  const z = d ? 0 : prog(t, .3, 2.2);                        // 0: 250 BC–AD 1, 1: 300 BC–AD 1500
  const lo = lerp(-250, -300, z), hi = lerp(0, 1500, z);
  const yr = y => lerp(x0, x1, (y - lo) / (hi - lo));
  g.strokeStyle = C.line; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.stroke();
  const ticks = [[-250, 1 - z], [-200, 1 - z], [-150, 1 - z], [-100, 1 - z], [-50, 1 - z], [1, 1], [500, z], [1000, z], [1500, z]];
  ticks.forEach(([y, a]) => {
    const x = yr(y);
    if (x < x0 - 1 || x > x1 + 1 || a <= 0) return;
    g.save(); g.globalAlpha = a;
    g.fillStyle = C.line; g.fillRect(x - 1, y0 - 10, 2, 20);
    text(g, y < 0 ? `${-y} BC` : y === 1 ? "AD 1" : `AD ${y}`, x, y0 + 50, { size: 22, align: "center", color: C.mist });
    g.restore();
  });
  const ev = (y, label, sub, row, a, col = C.brass) => {
    if (a <= 0) return;
    const x = yr(y), ly = [y0 - 190, y0 + 150, y0 - 330][row], up = row !== 1;
    g.save(); g.globalAlpha = a;
    g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, up ? ly + 14 : ly - 40); g.stroke();
    g.fillStyle = col; g.beginPath(); g.arc(x, y0, 7, 0, TAU); g.fill();
    text(g, label, x, ly - (up ? 30 : 0), { size: 28, weight: 600, align: "center", color: col });
    if (sub) text(g, sub, x, ly + (up ? 4 : 34), { size: 22, align: "center", color: C.mist });
    g.restore();
  };
  const fadeDetail = 1 - z;
  ev(-205, "205 BC", "eclipse dial's cycle begins", 0, (d ? vis(t, s.w(0, "205") - .4, 1e9, .5) : 1) * fadeDetail);
  ev(-65, "c. 60s BC", "the ship sinks", 1, (d ? vis(t, s.w(0, "sank") - .5, 1e9, .5) : 1) * fadeDetail, C.verd);
  ev(-138, "Hipparchus", "active c. 150–127 BC", 2, (d ? vis(t, s.w(0, "Hipparchus") - .4, 1e9, .5) : 1) * fadeDetail, C.bone);
  if (!d) {
    ev(-130, "The mechanism", "2nd–1st century BC", 0, z, C.brass);
    ev(1350, "1300s", "astronomical clocks: Wallingford, de' Dondi", 0, vis(t, s.w(0, "fourteenth") - .5, 1e9, .5), C.bone);
    const gk = prog(t, Math.max(2.4, s.w(0, "cold") - .2), 2.2);
    if (gk > 0) {
      const xa = yr(-60), xb = lerp(xa, yr(1330), gk);
      g.fillStyle = "rgba(239,91,63,.12)"; g.fillRect(xa, y0 - 36, xb - xa, 72);
      g.strokeStyle = C.signal; g.lineWidth = 2; g.strokeRect(xa, y0 - 36, xb - xa, 72);
      text(g, "nothing this complex survives", (xa + yr(1330)) / 2, y0 + 110, { size: 30, align: "center", color: C.signal, weight: 600, alpha: prog(t, s.w(0, "complexity") - .3, .6) });
    }
  }
};

// ---------------------------------------------------------------- end screen

SCENES.endcard = (g, s) => {
  const t = s.t, T = s.T;
  bg(g);
  stars(g, 3, 160, .5);
  // right half is left clear for two YouTube end-screen video elements (see channel/setup.md)
  const k = prog(t, .2, 1);
  g.save(); g.globalAlpha = k;
  text(g, "Orrery", 150, 250, { size: 96, kind: "serif", weight: 640 });
  text(g, "Working models of everything.", 150, 314, { size: 34, color: C.brass, weight: 600 });
  text(g, "Watch next", 1120, 120, { size: 30, color: C.mist, weight: 550 });
  g.strokeStyle = C.ink3; g.lineWidth = 2;
  g.strokeRect(1120, 150, 680, 383); g.strokeRect(1120, 583, 680, 383);
  g.restore();
  mechanism(g, T, 470, 700, 240, { speed: 3, gearAlpha: .25, crank: false });
};
