// Scenes for Orrery #002, Longitude.
// Each scene is (g, s) => draw, where s.t is time since the shot started, s.b(i)/s.be(i) are
// the start/end of narration beat i within the shot, and s.w(i, "word") is when that word is spoken.
const SCENES = {};
const DEG = Math.PI / 180;

SCENES.missing = (g, s) => { bg(g); text(g, "missing scene", W / 2, H / 2, { align: "center", color: C.signal }); };

// ---------------------------------------------------------------- shared pieces

function proj(lon, lat, box) {
  // equirectangular, scaled by cos(latitude) at the box centre
  const [lon0, lat0, lon1, lat1, x, y, w] = box;
  const k = Math.cos((lat0 + lat1) / 2 * DEG), s = w / ((lon1 - lon0) * k);
  return [x + (lon - lon0) * k * s, y + (lat1 - lat) * s];
}

function land(g, rings, box, fill, stroke, lw = 1.5) {
  g.save();
  g.fillStyle = fill; g.strokeStyle = stroke; g.lineWidth = lw; g.lineJoin = "round";
  g.beginPath();
  for (const ring of rings) {
    let prev = null;
    ring.forEach(([lon, lat], i) => {
      const [x, y] = proj(lon, lat, box);
      if (!i || Math.abs(lon - prev) > 180) g.moveTo(x, y); else g.lineTo(x, y);
      prev = lon;
    });
  }
  g.fill("evenodd");
  if (stroke) g.stroke();
  g.restore();
}

function place(g, box, lon, lat, name, sub, a, col = C.brass, side = 1) {
  if (a <= 0) return;
  const [x, y] = proj(lon, lat, box);
  g.save(); g.globalAlpha *= a;
  g.fillStyle = col; g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill();
  g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 15, 0, TAU); g.stroke();
  text(g, name, x + 26 * side, y - 2, { size: 30, weight: 600, color: col, align: side > 0 ? "left" : "right" });
  if (sub) text(g, sub, x + 26 * side, y + 32, { size: 24, color: C.mist, align: side > 0 ? "left" : "right" });
  g.restore();
}

// A three-masted ship in silhouette. roll in radians.
function tallShip(g, x, y, s, roll, fill = "#05070a", lights = 0) {
  g.save(); g.translate(x, y); g.rotate(roll); g.scale(s, s);
  g.fillStyle = fill;
  g.beginPath(); g.moveTo(-150, -30); g.lineTo(170, -38); g.quadraticCurveTo(150, 10, 110, 22); g.lineTo(-120, 22); g.quadraticCurveTo(-150, 0, -150, -30); g.fill();
  g.fillRect(-160, -58, 50, 30);                                     // stern castle
  [[-70, 230], [20, 270], [100, 200]].forEach(([mx, mh]) => {
    g.fillRect(mx - 3, -30 - mh, 6, mh);
    for (let k = 0; k < 3; k++) {                                      // square sails
      const top = -30 - mh + 20 + k * mh * .3, h = mh * .24, w = 70 - k * 8;
      g.beginPath(); g.moveTo(mx - w / 2, top); g.lineTo(mx + w / 2, top); g.lineTo(mx + w / 2 + 6, top + h); g.lineTo(mx - w / 2 - 6, top + h); g.fill();
    }
  });
  g.beginPath(); g.moveTo(170, -38); g.lineTo(250, -80); g.lineTo(252, -76); g.lineTo(172, -30); g.fill(); // bowsprit
  if (lights) {
    g.fillStyle = `rgba(255,200,120,${lights})`; g.shadowColor = "rgba(255,190,110,.9)"; g.shadowBlur = 18;
    [[-135, -45], [-100, -8], [-40, -8], [30, -10]].forEach(([lx, ly]) => { g.beginPath(); g.arc(lx, ly, 4, 0, TAU); g.fill(); });
  }
  g.restore();
}

// Rolling sea: layered waves drawn back to front. Returns a function giving the surface height at x for layer L.
function sea(g, T, horizon, layers, cols) {
  const surf = (L, x) => {
    const base = horizon + L * L * 10 + L * 22, amp = 6 + L * 5, spd = .5 + L * .25;
    return base + amp * Math.sin(x * (.008 - L * .0006) + T * spd + L) + amp * .6 * Math.sin(x * .021 + T * spd * 1.7 + L * 2);
  };
  for (let L = 0; L < layers; L++) {
    g.fillStyle = cols(L);
    g.beginPath(); g.moveTo(0, H);
    for (let x = 0; x <= W; x += 12) g.lineTo(x, surf(L, x));
    g.lineTo(W, H); g.fill();
    g.strokeStyle = `rgba(238,233,223,${.035 + L * .01})`; g.lineWidth = 1.5; g.stroke();
  }
  return surf;
}

function fog(g, T, y, alpha) {
  const tex = cached("fog", 960, 300, (c, w, h) => {
    const img = c.createImageData(w, h), d = img.data;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const ii = Math.min(i, w - i);
      const n = fbm(ii * .007, j * .02, 5), a = clamp((n - .35) * 2.2) * Math.sin(j / h * Math.PI) * 255;
      const k = (j * w + i) * 4; d[k] = 150; d[k + 1] = 162; d[k + 2] = 176; d[k + 3] = a;
    }
    c.putImageData(img, 0, 0);
  });
  g.save(); g.globalAlpha = alpha;
  const off = (T * 18) % 1920;
  for (let k = -1; k < 2; k++) g.drawImage(tex, k * 1920 - off, y, 1920, 420);
  g.restore();
}

// Clock face with hour/minute hands. time in hours (e.g. 15.5).
function clockFace(g, x, y, r, hours, o = {}) {
  g.save();
  g.fillStyle = o.face ?? C.bone; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.strokeStyle = o.rim ?? C.brass; g.lineWidth = r * .08; g.stroke();
  g.strokeStyle = C.ink; g.lineWidth = Math.max(1.5, r * .02);
  for (let i = 0; i < 60; i++) {
    const a = i / 60 * TAU, l = i % 5 ? r * .05 : r * .12;
    g.beginPath(); g.moveTo(x + (r * .9 - l) * Math.sin(a), y - (r * .9 - l) * Math.cos(a)); g.lineTo(x + r * .9 * Math.sin(a), y - r * .9 * Math.cos(a)); g.stroke();
  }
  if (o.numerals) {
    const R = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
    R.forEach((n, i) => { const a = i / 12 * TAU; text(g, n, x + r * .68 * Math.sin(a), y - r * .68 * Math.cos(a) + r * .06, { size: r * .15, kind: "serif", weight: 600, color: C.ink, align: "center" }); });
  }
  const ha = (hours % 12) / 12 * TAU, ma = (hours % 1) * TAU;
  g.lineCap = "round"; g.strokeStyle = C.ink;
  g.lineWidth = r * .07; g.beginPath(); g.moveTo(x, y); g.lineTo(x + r * .5 * Math.sin(ha), y - r * .5 * Math.cos(ha)); g.stroke();
  g.lineWidth = r * .045; g.beginPath(); g.moveTo(x, y); g.lineTo(x + r * .78 * Math.sin(ma), y - r * .78 * Math.cos(ma)); g.stroke();
  g.fillStyle = C.ink; g.beginPath(); g.arc(x, y, r * .06, 0, TAU); g.fill();
  g.restore();
}

function sunDisc(g, x, y, r, a = 1) {
  g.save(); g.globalAlpha *= a;
  g.shadowColor = "rgba(224,169,67,.8)"; g.shadowBlur = r * 1.6;
  g.fillStyle = C.brass; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.restore();
}

// ---- globe: orthographic projection rendered per pixel from an equirectangular land texture
const globeTex = () => cached("globeTex", 1024, 512, (c, w, h) => {
  c.fillStyle = "#16324a"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#3a5a4c";
  c.beginPath();
  for (const ring of ASSETS.world) {
    let prev = null;
    ring.forEach(([lon, lat], i) => {
      const x = (lon + 180) / 360 * w, y = (90 - lat) / 180 * h;
      if (!i || (prev !== null && Math.abs(x - prev) > w / 2)) c.moveTo(x, y); else c.lineTo(x, y);
      prev = x;
    });
    c.closePath();
  }
  c.fill("evenodd");
});
let _globeData = null;
function globe(g, cx, cy, R, lon0, lat0, o = {}) {
  const tex = globeTex();
  if (!_globeData) _globeData = tex.getContext("2d").getImageData(0, 0, 1024, 512).data;
  const size = Math.ceil(R * 2);
  const buf = cached("globeBuf" + size, size, size, () => {});
  const bctx = buf.getContext("2d");
  const img = bctx.createImageData(size, size), d = img.data;
  const sp = Math.sin(lat0 * DEG), cp = Math.cos(lat0 * DEG), L0 = lon0 * DEG;
  const sun = o.sunLon !== undefined ? o.sunLon * DEG : null;
  for (let j = 0; j < size; j++) {
    const y = (R - j - .5) / R;
    for (let i = 0; i < size; i++) {
      const x = (i + .5 - R) / R, rr = x * x + y * y;
      const k = (j * size + i) * 4;
      if (rr > 1) { d[k + 3] = 0; continue; }
      const z = Math.sqrt(1 - rr);
      const lat = Math.asin(z * sp + y * cp), lon = L0 + Math.atan2(x, z * cp - y * sp);
      let u = ((lon / TAU + .5) % 1 + 1) % 1, v = .5 - lat / Math.PI;
      const ti = (Math.min(511, Math.floor(v * 512)) * 1024 + Math.floor(u * 1024)) * 4;
      let shade = .55 + .45 * z;                                             // limb darkening
      if (sun !== null) shade *= .25 + .75 * clamp(Math.cos(lat) * Math.cos(lon - sun) * 3 + .5);
      d[k] = _globeData[ti] * shade; d[k + 1] = _globeData[ti + 1] * shade; d[k + 2] = _globeData[ti + 2] * shade;
      d[k + 3] = rr > .985 ? 255 * (1 - rr) / .015 : 255;
    }
  }
  bctx.putImageData(img, 0, 0);
  g.drawImage(buf, cx - R, cy - R);
  // meridians
  const mer = o.meridians ?? [];
  mer.forEach(([m, col, lw]) => {
    g.save(); g.strokeStyle = col; g.lineWidth = lw ?? 2;
    g.beginPath(); let pen = false;
    for (let lat = -88; lat <= 88; lat += 2) {
      const p = orthoPt(m, lat, lon0, lat0);
      if (p[2] > 0) { const X = cx + p[0] * R, Y = cy - p[1] * R; pen ? g.lineTo(X, Y) : g.moveTo(X, Y); pen = true; } else pen = false;
    }
    g.stroke(); g.restore();
  });
}
function orthoPt(lon, lat, lon0, lat0) {
  const f = lat * DEG, l = (lon - lon0) * DEG, f0 = lat0 * DEG;
  return [Math.cos(f) * Math.sin(l), Math.cos(f0) * Math.sin(f) - Math.sin(f0) * Math.cos(f) * Math.cos(l), Math.sin(f0) * Math.sin(f) + Math.cos(f0) * Math.cos(f) * Math.cos(l)];
}

// Watch in the style of H4: silver case, white dial, Roman numerals.
function watch(g, x, y, r, hours, a = 1) {
  g.save(); g.globalAlpha *= a;
  g.fillStyle = "#b9bec6"; g.beginPath(); g.arc(x, y - r * 1.12, r * .12, 0, TAU); g.fill();        // pendant
  g.strokeStyle = "#b9bec6"; g.lineWidth = r * .05; g.beginPath(); g.arc(x, y - r * 1.28, r * .14, 0, TAU); g.stroke(); // bow
  const cg = g.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r * 1.08);
  cg.addColorStop(0, "#e6e9ee"); cg.addColorStop(1, "#6d737c");
  g.fillStyle = cg; g.beginPath(); g.arc(x, y, r * 1.06, 0, TAU); g.fill();
  clockFace(g, x, y, r * .92, hours, { face: "#f4f1ea", rim: "#9aa0a8", numerals: true });
  g.restore();
}

function balanceWheel(g, x, y, r, ang, col = C.brass, lw = 4) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.strokeStyle = col; g.lineWidth = lw;
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
  for (let i = 0; i < 3; i++) { const a = i * TAU / 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(r * Math.cos(a), r * Math.sin(a)); g.stroke(); }
  g.fillStyle = col; g.beginPath(); g.arc(0, 0, r * .1, 0, TAU); g.fill();
  g.restore();
  // hairspring
  g.save(); g.strokeStyle = "rgba(238,233,223,.6)"; g.lineWidth = 1.5; g.beginPath();
  for (let a = 0; a < 5 * TAU; a += .1) { const rr = r * .12 + a * r * .018; g.lineTo(x + rr * Math.cos(a + ang), y + rr * Math.sin(a + ang)); }
  g.stroke(); g.restore();
}

function woodTexture(key, w, h, dark = false) {
  return cached(key, w, h, (c) => {
    const img = c.createImageData(w, h), d = img.data;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const n = fbm(i * .004, j * .05, 3), ring = .5 + .5 * Math.sin((j + n * 60) * .35 + fbm(i * .01, j * .01, 2) * 8);
      const v = .55 + .3 * ring + .15 * n;
      const k = (j * w + i) * 4;
      d[k] = (dark ? 95 : 150) * v; d[k + 1] = (dark ? 62 : 102) * v; d[k + 2] = (dark ? 36 : 58) * v; d[k + 3] = 255;
    }
    c.putImageData(img, 0, 0);
  });
}

// ---------------------------------------------------------------- cold open

SCENES.fleet = (g, s) => {
  const t = s.t, T = s.T, mode = s.p.mode;
  if (mode === "map") {
    g.fillStyle = "#0b1016"; g.fillRect(0, 0, W, H);
    const z = lerp(1, 1.06, t / s.dur);
    g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2);
    const box = [-7.4, 49.45, -3.0, 50.95, 80, 60, 1760];
    land(g, ASSETS.scilly, box, "#1a212b", "#3a4454", 1.5);
    // the fleet's approach from the south-west (schematic)
    const k = prog(t, .5, 4);
    g.save(); g.strokeStyle = "rgba(238,233,223,.55)"; g.setLineDash([12, 12]); g.lineWidth = 3;
    const [ax, ay] = proj(-7.4, 49.55, box), [bx, by] = proj(-6.42, 49.87, box);
    g.beginPath(); g.moveTo(ax, ay); g.lineTo(lerp(ax, bx, k), lerp(ay, by, k)); g.stroke(); g.restore();
    place(g, box, -6.42, 49.87, "Isles of Scilly", "22 October 1707", prog(t, .3, .8), C.signal, 1);
    place(g, box, -5.20, 49.96, "Cornwall", null, prog(t, 1, .8), C.mist, 1);
    const kk = vis(t, s.w(0, "reckoning") - .3, 1e9, .5);
    text(g, "bad charts?  currents?  errors in reckoning?", 1500, 980, { size: 30, color: C.mist, align: "center", alpha: kk });
    g.restore();
    text(g, "fleet track schematic", 60, 1045, { size: 18, color: C.mist, alpha: .6 });
    return;
  }
  // night sea with fog, ships
  const sky = g.createLinearGradient(0, 0, 0, 640);
  sky.addColorStop(0, "#06080c"); sky.addColorStop(1, "#18212d");
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  const wreck = mode === "wreck";
  if (wreck) {
    // rocks on the horizon ahead
    g.fillStyle = "#040507";
    [[1250, 60, 90], [1420, 40, 70], [1560, 70, 110], [1700, 35, 60]].forEach(([x, h, w]) => {
      g.beginPath(); g.moveTo(x - w, 650); g.lineTo(x - w * .3, 650 - h); g.lineTo(x + w * .2, 650 - h * .8); g.lineTo(x + w, 650); g.fill();
    });
  }
  const surf = sea(g, T, 640, 3, L => `rgb(${12 + L * 3},${19 + L * 4},${28 + L * 5})`);
  // distant ships behind the fog
  if (!wreck) {
    [[380, 1, .35], [900, .8, .45], [1500, .6, .55]].forEach(([x0, sc, f], i) => {
      const x = x0 + t * 12 * sc;
      tallShip(g, x, surf(1, x) - 6, .55 * sc, .04 * Math.sin(T * .9 + i), "#0a0e13", .6);
    });
  }
  fog(g, T, 380, wreck ? .5 : .85);
  // the flagship in the foreground
  const lay = (L, x) => 640 + L * L * 10 + L * 22 + (6 + L * 5) * Math.sin(x * (.008 - L * .0006) + T * (.5 + L * .25) + L);
  if (wreck) {
    const hit = prog(t, 1.2, 1.2, easeOut), list = prog(t, 2.2, 6);
    const x = lerp(700, 980, prog(t, 0, 1.6)) , y = lay(4, x) - 10 + list * 40;
    tallShip(g, x, y, 1.1, .06 * Math.sin(T * 1.2) * (1 - hit) + .38 * list, "#030405", 1 - list);
    // spray at the moment of impact
    const sp = Math.max(0, 1 - Math.abs(t - 1.6) * 1.2);
    if (sp > 0) {
      const r = rng(8); g.fillStyle = `rgba(220,230,235,${.5 * sp})`;
      for (let i = 0; i < 80; i++) { const a = -Math.PI * r(), d = r() * 180 * (1.2 - sp); g.beginPath(); g.arc(x + 200 + d * Math.cos(a), y + d * Math.sin(a), 2 + r() * 3, 0, TAU); g.fill(); }
    }
    g.fillStyle = "#030405";
    [[1080, 120, 160], [1320, 80, 120]].forEach(([rx, h, w]) => { g.beginPath(); g.moveTo(rx - w, H); g.lineTo(rx - w * .2, 760 - h); g.lineTo(rx + w * .3, 780 - h * .6); g.lineTo(rx + w, H); g.fill(); });
  } else {
    const x = 760;
    tallShip(g, x, lay(4, x) - 8, 1, .06 * Math.sin(T * 1.1), "#050709", .9);
  }
  // foreground swell
  g.fillStyle = "rgba(8,12,17,.95)"; g.beginPath(); g.moveTo(0, H);
  for (let x = 0; x <= W; x += 12) g.lineTo(x, 930 + 18 * Math.sin(x * .006 + T * 1.3) + 10 * Math.sin(x * .017 + T * 2));
  g.lineTo(W, H); g.fill();
  if (!wreck) caption(g, t, .6, s.dur - .8, ["October 1707", "A British fleet returning from the Mediterranean"]);
  else {
    caption(g, t, 1.5, s.dur - .8, ["The Isles of Scilly", "Four ships lost; about 1,400–2,000 men"]);
    text(g, "Sir Cloudesley Shovell", 1800, 150, { size: 30, kind: "serif", weight: 560, align: "right", alpha: vis(t, s.w(0, "admiral") - .3, 1e9, .5) });
    text(g, "commanding the fleet · died in the wreck", 1800, 190, { size: 24, color: C.mist, align: "right", alpha: vis(t, s.w(0, "admiral") - .3, 1e9, .5) });
  }
};

SCENES.titlecard = (g, s) => {
  const t = s.t, T = s.T;
  bg(g, "#131b26");
  // slowly turning meridians behind the title
  globe(g, W / 2, H / 2 + 40, 420, -T * 6, 18, { meridians: Array.from({ length: 12 }, (_, i) => [i * 30, "rgba(224,169,67,.35)", 1.5]) });
  g.fillStyle = "rgba(13,17,23,.55)"; g.fillRect(0, 0, W, H);
  const k = prog(t, .2, 1.2, easeOut);
  g.fillStyle = C.brass; g.fillRect(W / 2 - 40 * k, 420, 80 * k, 4);
  text(g, s.p.title, W / 2, 545, { size: 130, kind: "serif", weight: 640, align: "center", alpha: k });
  text(g, s.p.sub, W / 2, 625, { size: 38, color: C.mist, weight: 500, align: "center", alpha: prog(t, .8, 1) });
};

// ---------------------------------------------------------------- two numbers

SCENES.latitude = (g, s) => {
  const t = s.t, T = s.T;
  const night = prog(t, s.w(0, "night") - .6, 1.2);
  const sky = g.createLinearGradient(0, 0, 0, 760);
  sky.addColorStop(0, `rgb(${lerp(28, 6, night)},${lerp(52, 9, night)},${lerp(78, 14, night)})`);
  sky.addColorStop(1, `rgb(${lerp(70, 18, night)},${lerp(92, 24, night)},${lerp(110, 34, night)})`);
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  if (night > 0) { g.save(); g.globalAlpha = night; stars(g, 12, 200, .8); g.restore(); }
  g.fillStyle = "#0f1a24"; g.fillRect(0, 760, W, H - 760);
  g.strokeStyle = "rgba(238,233,223,.4)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 760); g.lineTo(W, 760); g.stroke();
  const ox = 520, oy = 760;
  const sunAlt = 52, polAlt = 50;
  const alt = lerp(sunAlt, polAlt, night);
  const ang = -alt * DEG, L = 560;
  const tx = ox + L * Math.cos(ang), ty = oy + L * Math.sin(ang);
  sunDisc(g, tx, ty, 38, 1 - night);
  if (night > 0) {
    g.save(); g.globalAlpha = night; g.fillStyle = C.bone; g.shadowColor = C.bone; g.shadowBlur = 20;
    g.beginPath(); g.arc(tx, ty, 8, 0, TAU); g.fill(); g.restore();
    text(g, "Pole Star", tx + 24, ty - 16, { size: 28, color: C.bone, alpha: night });
  }
  const k = prog(t, s.w(0, "measure") - .3, 1.2);
  g.save(); g.globalAlpha = k;
  g.strokeStyle = C.brass; g.lineWidth = 3; g.setLineDash([10, 8]);
  g.beginPath(); g.moveTo(ox, oy); g.lineTo(lerp(ox, tx, k), lerp(oy, ty, k)); g.stroke(); g.setLineDash([]);
  g.beginPath(); g.arc(ox, oy, 160, 0, ang, true); g.stroke();
  text(g, `${Math.round(alt)}°`, ox + 200, oy - 60, { size: 48, kind: "serif", weight: 600, color: C.brass });
  g.restore();
  // observer
  g.fillStyle = "#05070a"; g.fillRect(ox - 8, oy - 60, 16, 60); g.beginPath(); g.arc(ox, oy - 72, 12, 0, TAU); g.fill();
  text(g, "Latitude", 1250, 330, { size: 64, kind: "serif", weight: 620 });
  text(g, "how far north or south", 1250, 385, { size: 32, color: C.mist });
  text(g, "height of the Sun at noon → latitude", 1250, 470, { size: 30, color: C.bone, alpha: vis(t, s.w(0, "table") - .3, 1e9, .5) });
  text(g, "height of the Pole Star ≈ latitude", 1250, 520, { size: 30, color: C.bone, alpha: vis(t, s.w(0, "Pole") - .3, 1e9, .5) });
};

SCENES.globe = (g, s) => {
  const t = s.t, T = s.T, st = s.p.stage;
  bg(g, "#101824");
  stars(g, 5, 240, .7);
  if (st === "spin") {
    const lon0 = -t * 12;
    globe(g, 760, 560, 380, lon0, 20, { meridians: [[0, "rgba(224,169,67,.9)", 3]] });
    text(g, "Longitude", 1300, 360, { size: 64, kind: "serif", weight: 620 });
    text(g, "how far east or west", 1300, 415, { size: 32, color: C.mist });
    text(g, "every meridian sees the same sky,", 1300, 520, { size: 32, color: C.bone, alpha: vis(t, s.w(0, "same") - .3, 1e9, .5) });
    text(g, "just at a different time", 1300, 564, { size: 32, color: C.brass, alpha: vis(t, s.w(0, "different") - .3, 1e9, .5) });
    return;
  }
  if (st === "hours") {
    const h = Math.min(24, Math.floor(prog(t, s.w(0, "fifteen") - 1.5, 6, x => x) * 24));
    const lon0 = -h * 15 + 20;
    const mer = [];
    for (let i = 0; i <= h; i++) mer.push([-i * 15, i === h ? C.brass : "rgba(224,169,67,.35)", i === h ? 4 : 2]);
    globe(g, 760, 560, 380, lon0 + 10 * Math.sin(T * .2), 20, { meridians: mer });
    text(g, "360° ÷ 24 h", 1300, 420, { size: 60, kind: "serif", weight: 600, alpha: vis(t, s.w(0, "three") - .3, 1e9, .5) });
    text(g, "= 15° per hour", 1300, 500, { size: 60, kind: "serif", weight: 600, color: C.brass, alpha: vis(t, s.w(0, "fifteen") - .3, 1e9, .5) });
    text(g, `${h} h  ·  ${h * 15}°`, 1300, 600, { size: 36, color: C.mist, alpha: vis(t, s.w(0, "fifteen") - .3, 1e9, .5) });
    return;
  }
  // noon: ship at 45°W sees the Sun highest while the home clock reads 15:00
  const k = prog(t, .2, 2.5);
  globe(g, 700, 560, 380, lerp(-10, -22, k), 22, { sunLon: -45, meridians: [[0, "rgba(238,233,223,.8)", 2.5], [-45, C.brass, 4]] });
  const pH = orthoPt(0, 51.5, lerp(-10, -22, k), 22), pS = orthoPt(-45, 40, lerp(-10, -22, k), 22);
  const hx = 700 + pH[0] * 380, hy = 560 - pH[1] * 380, sx = 700 + pS[0] * 380, sy = 560 - pS[1] * 380;
  g.fillStyle = C.bone; g.beginPath(); g.arc(hx, hy, 8, 0, TAU); g.fill();
  text(g, "home port", hx + 16, hy - 12, { size: 24, color: C.bone });
  g.fillStyle = C.brass; g.beginPath(); g.arc(sx, sy, 8, 0, TAU); g.fill();
  text(g, "ship", sx - 16, sy - 12, { size: 24, color: C.brass, align: "right" });
  // sunlight arrives from the left, square on to the ship's meridian
  sunDisc(g, 110, 470, 40, vis(t, s.w(0, "highest") - 1, 1e9, .6));
  const ck = vis(t, s.w(0, "clock") - .3, 1e9, .5), nk = vis(t, s.w(0, "noon") - .3, 1e9, .5);
  g.save(); g.globalAlpha = nk; clockFace(g, 1320, 380, 110, 12); g.restore();
  text(g, "Ship: local noon", 1320, 540, { size: 30, align: "center", color: C.brass, weight: 600, alpha: nk });
  g.save(); g.globalAlpha = ck; clockFace(g, 1640, 380, 110, lerp(12, 15, prog(t, s.w(0, "afternoon") - .8, 1.2))); g.restore();
  text(g, "Clock set to home", 1640, 540, { size: 30, align: "center", color: C.bone, weight: 600, alpha: ck });
  const rk = vis(t, s.w(0, "behind") - .3, 1e9, .5);
  text(g, "3 h × 15° = 45° west", 1480, 690, { size: 50, kind: "serif", weight: 600, align: "center", color: C.brass, alpha: rk });
};

SCENES.tolerance = (g, s) => {
  const t = s.t, T = s.T, st = s.p.stage;
  bg(g);
  if (st === "prize") {
    // the 1714 Act's three tiers
    g.save(); const k = prog(t, .2, 1);
    g.globalAlpha = k;
    g.fillStyle = "#e9e1cf"; g.fillRect(260, 170, 620, 760);
    g.fillStyle = "#2b2418";
    text(g, "Anno Regni", 570, 260, { size: 28, kind: "serif", align: "center", color: "#5a4a30" });
    text(g, "An ACT for Providing", 570, 330, { size: 40, kind: "serif", weight: 600, align: "center", color: "#2b2418" });
    text(g, "a Publick Reward", 570, 380, { size: 40, kind: "serif", weight: 600, align: "center", color: "#2b2418" });
    text(g, "for such Person or Persons", 570, 430, { size: 28, kind: "serif", align: "center", color: "#2b2418" });
    text(g, "as shall Discover the", 570, 468, { size: 28, kind: "serif", align: "center", color: "#2b2418" });
    text(g, "LONGITUDE at Sea", 570, 530, { size: 46, kind: "serif", weight: 700, align: "center", color: "#2b2418" });
    text(g, "1714", 570, 840, { size: 44, kind: "serif", weight: 600, align: "center", color: "#7a5a26" });
    g.restore();
    const tiers = [["£10,000", "within 1°"], ["£15,000", "within ⅔°"], ["£20,000", "within ½°"]];
    tiers.forEach(([m, d], i) => {
      const a = prog(t, s.w(0, "twenty") - .6 + i * .35, .6);
      text(g, m, 1080, 380 + i * 130, { size: 70, kind: "serif", weight: 620, color: i === 2 ? C.brass : C.bone, alpha: a * (i === 2 ? 1 : .6) });
      text(g, d, 1440, 380 + i * 130, { size: 40, color: i === 2 ? C.brass : C.mist, alpha: a * (i === 2 ? 1 : .6) });
    });
    text(g, "tested on a voyage to the West Indies", 1080, 790, { size: 32, color: C.bone, alpha: vis(t, s.w(0, "West") - .3, 1e9, .5) });
    return;
  }
  if (st === "math") {
    const rows = [
      ["½°", "of longitude", "half"],
      ["= 2 minutes", "of time", "two"],
      ["÷ 42 days", "about six weeks", "six"],
      ["< 3 s per day", "", "Less"],
    ];
    rows.forEach(([a, b, w], i) => {
      const k = vis(t, s.w(0, w) - .3, 1e9, .5);
      const y = 300 + i * 150;
      text(g, a, 820, y, { size: i === 3 ? 90 : 72, kind: "serif", weight: 620, align: "right", color: i === 3 ? C.brass : C.bone, alpha: k });
      text(g, b, 860, y - 8, { size: 32, color: C.mist, alpha: k });
    });
    // a rolling-ship icon, to keep the stakes visible
    const k2 = vis(t, s.w(0, "rolling") - .3, 1e9, .5);
    g.save(); g.globalAlpha = k2; tallShip(g, 1500, 820, .7, .14 * Math.sin(T * 1.4), C.mist); g.restore();
    return;
  }
  // rate: steady error is fine, wandering is not
  const x0 = 220, x1 = 1700, y0 = 640, days = 42;
  g.strokeStyle = C.line; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.moveTo(x0, 1000); g.lineTo(x0, 150); g.stroke();
  text(g, "days at sea", x1, y0 + 46, { size: 26, color: C.mist, align: "right" });
  text(g, "clock error", x0 - 10, 130, { size: 26, color: C.mist });
  text(g, "0", x0 - 20, y0 + 8, { size: 24, color: C.mist, align: "right" });
  const k = prog(t, .4, s.dur - 2, x => x);
  const sx = d => lerp(x0, x1, d / days), sy = e => y0 - e * 1.05;
  g.lineWidth = 5;
  g.strokeStyle = C.verd; g.beginPath();
  for (let d = 0; d <= days * k; d += .25) { const e = 10 * d; d ? g.lineTo(sx(d), sy(e)) : g.moveTo(sx(d), sy(e)); } g.stroke();
  g.strokeStyle = C.signal; g.beginPath();
  const r = rng(11); let e = 0, rate = 0;
  for (let d = 0; d <= days * k; d += .25) { rate += (r() - .5) * 14 - rate * .04; rate = clamp(rate, -35, 35); e += rate * .25; d ? g.lineTo(sx(d), sy(e)) : g.moveTo(sx(d), sy(0)); }
  g.stroke();
  text(g, "gains 10 s every day: predictable", 1100, 200, { size: 30, color: C.verd, weight: 600, alpha: vis(t, s.w(0, "ten") - .3, 1e9, .5) });
  text(g, "subtract 10 s × days", 1100, 240, { size: 26, color: C.mist, alpha: vis(t, s.w(0, "subtract") - .3, 1e9, .5) });
  text(g, "wanders: useless", 1100, 900, { size: 30, color: C.signal, weight: 600, alpha: vis(t, s.w(0, "wander") - .3, 1e9, .5) });
};

SCENES.pendulum = (g, s) => {
  const t = s.t, T = s.T;
  bg(g);
  // cabin interior tilting with the sea
  const roll = .16 * Math.sin(T * 1.1) + .05 * Math.sin(T * 2.3);
  g.save(); g.translate(760, 560); g.rotate(roll);
  const wood = woodTexture("cabin", 512, 512, true);
  g.globalAlpha = .35; g.drawImage(wood, -1400, -900, 2800, 1800); g.globalAlpha = 1;
  g.strokeStyle = "rgba(0,0,0,.4)"; g.lineWidth = 3;
  for (let i = -14; i <= 14; i++) { g.beginPath(); g.moveTo(i * 100, -900); g.lineTo(i * 100, 900); g.stroke(); }
  // longcase clock
  g.fillStyle = "#2a1c10"; g.fillRect(-110, -380, 220, 760);
  g.fillStyle = "#15100a"; g.fillRect(-80, -120, 160, 460);
  clockFace(g, 0, -260, 80, 10.2 + T / 3600);
  g.restore();
  // pendulum: hangs from the pivot; driven by a clean swing plus the ship's roll
  const pivot = [760 + 120 * Math.sin(roll), 560 - 120 * Math.cos(roll)];
  const temp = prog(t, s.w(0, "Heat") - .4, 2);
  const len = 330 * (1 + .12 * temp);
  const clean = .22 * Math.sin(T * 3.1);
  const kick = .3 * Math.sin(T * 1.1 + .6) * prog(t, s.w(0, "roll") - .5, 1.5) + .15 * Math.sin(T * 2.3 + 1.2) * prog(t, s.w(0, "roll") - .5, 1.5);
  const a = clean + kick;
  const bx = pivot[0] + len * Math.sin(a), by = pivot[1] + len * Math.cos(a);
  g.strokeStyle = "#b9a27a"; g.lineWidth = 5; g.beginPath(); g.moveTo(pivot[0], pivot[1]); g.lineTo(bx, by); g.stroke();
  g.fillStyle = C.brass; g.beginPath(); g.arc(bx, by, 34, 0, TAU); g.fill();
  text(g, "every roll adds its own push", 1300, 380, { size: 34, color: C.signal, weight: 600, alpha: vis(t, s.w(0, "roll") - .3, 1e9, .5) });
  text(g, "heat: longer pendulum → slower clock", 1300, 460, { size: 32, color: C.bone, alpha: vis(t, s.w(0, "Heat") - .3, 1e9, .5) });
  // thermometer
  const tk = vis(t, s.w(0, "Heat") - .3, 1e9, .5);
  if (tk > 0) {
    g.save(); g.globalAlpha = tk;
    g.strokeStyle = C.bone; g.lineWidth = 3; g.strokeRect(1310, 540, 30, 300);
    g.fillStyle = C.signal; const lvl = 80 + 180 * (.5 + .5 * Math.sin(t * .8));
    g.fillRect(1314, 836 - lvl, 22, lvl);
    g.beginPath(); g.arc(1325, 870, 30, 0, TAU); g.fill();
    text(g, "England → Caribbean", 1380, 700, { size: 28, color: C.mist });
    g.restore();
  }
};

SCENES.lunar = (g, s) => {
  const t = s.t, T = s.T;
  bg(g, "#0a111b", "#05080d");
  stars(g, 21, 260, .9);
  // named star and the Moon creeping against the stars
  const sx = 1180, sy = 330;
  g.fillStyle = C.bone; g.shadowColor = C.bone; g.shadowBlur = 16; g.beginPath(); g.arc(sx, sy, 7, 0, TAU); g.fill(); g.shadowBlur = 0;
  text(g, "a bright star", sx + 20, sy - 14, { size: 26, color: C.mist });
  const hours = Math.min(6, t * .45);
  const mx = 520 + hours * 58, my = 620 - hours * 22;
  for (let hh = 0; hh <= Math.floor(hours); hh++) {
    g.save(); g.globalAlpha = .18; moonDisc(g, 520 + hh * 58, 620 - hh * 22, 29, .45); g.restore();
    text(g, `${hh} h`, 520 + hh * 58, 690 - hh * 22, { size: 18, color: C.mist, align: "center", alpha: .7 });
  }
  moonDisc(g, mx, my, 29, .45);
  text(g, "≈ its own width per hour", 520, 770, { size: 30, color: C.brass, weight: 600, alpha: vis(t, s.w(0, "width") - .3, 1e9, .5) });
  // the measured angle
  const ak = vis(t, s.w(0, "angle") - .3, 1e9, .5);
  if (ak > 0) {
    g.save(); g.globalAlpha = ak; g.strokeStyle = C.brass; g.setLineDash([8, 8]); g.lineWidth = 3;
    g.beginPath(); g.moveTo(mx, my); g.lineTo(sx, sy); g.stroke(); g.setLineDash([]);
    const d = Math.hypot(sx - mx, sy - my) / 12;
    text(g, `${d.toFixed(1)}°`, (mx + sx) / 2 + 20, (my + sy) / 2 + 40, { size: 40, kind: "serif", weight: 600, color: C.brass });
    g.restore();
  }
  text(g, "tables → the time at home", 1180, 520, { size: 32, color: C.bone, alpha: vis(t, s.w(0, "tables") - .3, s.b(1) - .3, .5) });
  // second beat: the catch
  const bk = vis(t, s.b(1) - .2, 1e9, .5);
  if (bk > 0) {
    g.save(); g.globalAlpha = bk;
    g.fillStyle = "rgba(13,17,23,.85)"; g.fillRect(1080, 480, 720, 420);
    const r = rng(7);
    for (let i = 0; i < 9; i++) {
      let str = ""; for (let k = 0; k < 6; k++) str += `${Math.floor(r() * 90)}°${Math.floor(r() * 60)}′  `;
      text(g, str, 1110, 540 + i * 36, { size: 20, color: C.mist });
    }
    text(g, "good tables: not until the 1750s", 1110, 880, { size: 30, color: C.brass, weight: 600 });
    g.restore();
  }
};

// ---------------------------------------------------------------- the carpenter

function woodGear(g, x, y, teeth, r, rot, tex) {
  g.save();
  gearPath(g, x, y, teeth, r, rot, { triangular: false });
  g.save(); g.clip(); g.drawImage(tex, x - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4); g.restore();
  g.strokeStyle = "rgba(20,12,6,.8)"; g.lineWidth = 2; g.stroke();
  g.fillStyle = "#2a1a0c"; g.beginPath(); g.arc(x, y, r * .14, 0, TAU); g.fill();
  g.restore();
}

SCENES.wood = (g, s) => {
  const t = s.t, T = s.T, st = s.p.stage;
  bg(g, "#17130f", "#0b0907");
  const oak = woodTexture("oak", 512, 512, false), lv = woodTexture("lv", 256, 256, true);
  if (st === "wood" || st === "oil") {
    const w = T * .25;
    woodGear(g, 700, 540, 60, 260, w, oak);
    woodGear(g, 700 + 260 + 110, 540, 24, 104, -w * 60 / 24 + .06, oak);
    woodGear(g, 520, 240, 18, 80, -w * 60 / 18, oak);
    if (st === "wood") {
      caption(g, t, .6, s.dur - .6, ["John Harrison, 1693–1776", "carpenter, self-taught clockmaker"]);
      return;
    }
    // lignum vitae arbors and pinions highlighted
    const k = vis(t, s.w(0, "lignum") - .3, 1e9, .5);
    g.save(); g.globalAlpha = k;
    [[700, 540, 36], [1070, 540, 22], [520, 240, 18]].forEach(([x, y, r]) => {
      g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip(); g.drawImage(lv, x - r, y - r, r * 2, r * 2); g.restore();
      g.strokeStyle = C.verd; g.lineWidth = 3; g.beginPath(); g.arc(x, y, r + 6, 0, TAU); g.stroke();
    });
    g.restore();
    callout(g, k, 1070, 540, 1450, 360, "lignum vitae: self-lubricating", C.verd, 32);
    callout(g, vis(t, s.w(0, "oak") - .3, 1e9), 700, 400, 1450, 250, "oak wheels", C.bone, 32);
    const ok = vis(t, s.w(0, "oil") - .3, 1e9, .5);
    if (ok > 0) {
      g.save(); g.globalAlpha = ok;
      g.fillStyle = "#c8a63c"; g.beginPath(); g.moveTo(1520, 640); g.quadraticCurveTo(1470, 720, 1520, 750); g.quadraticCurveTo(1570, 720, 1520, 640); g.fill();
      g.strokeStyle = C.signal; g.lineWidth = 8; g.beginPath(); g.moveTo(1460, 630); g.lineTo(1580, 770); g.stroke();
      text(g, "no oil needed", 1610, 720, { size: 32, color: C.signal, weight: 600 });
      g.restore();
    }
    return;
  }
  // accuracy: a second a month
  clockFace(g, 560, 520, 230, 10 + T / 60);
  const k = prog(t, .5, 1);
  text(g, "± 1 second", 1000, 470, { size: 90, kind: "serif", weight: 620, color: C.brass, alpha: k });
  text(g, "per month", 1000, 550, { size: 50, kind: "serif", weight: 500, alpha: k });
  text(g, "mid-1720s, on land", 1000, 620, { size: 30, color: C.mist, alpha: k });
  text(g, "but still a pendulum", 1000, 760, { size: 34, color: C.signal, weight: 600, alpha: vis(t, s.w(0, "pendulums") - .6, 1e9, .5) });
};

SCENES.gridiron = (g, s) => {
  const t = s.t, T = s.T;
  bg(g);
  const temp = .5 + .5 * Math.sin(t * .9);               // 0 cold .. 1 hot
  const exp = temp * 70;                                  // exaggerated expansion in px
  const px = 620, py = 170;
  // plain steel pendulum for comparison (right)
  const qx = 1300;
  const plainLen = 520 + exp;
  const kc = vis(t, .3, 1e9, .5);
  g.save(); g.globalAlpha = kc;
  g.fillStyle = C.mist; g.fillRect(qx - 4, py, 8, plainLen);
  g.fillStyle = C.brass; g.beginPath(); g.arc(qx, py + plainLen + 40, 44, 0, TAU); g.fill();
  text(g, "plain rod", qx, 120, { size: 30, align: "center", color: C.mist });
  g.restore();
  // gridiron: steel rods hang down, brass rods push up, steel rods hang down again
  const kg = vis(t, s.w(0, "gridiron") - .4, 1e9, .5);
  g.save(); g.globalAlpha = kg;
  // brass rise = total steel drop, so the bob stays put
  const steelA = 520 + exp, steelB = 380 + exp * .73, brass = 380 + exp * 1.73;
  // frame 1: outer steel from pivot to lower bar
  g.fillStyle = "#8f98a3"; g.fillRect(px - 90, py, 10, steelA); g.fillRect(px + 80, py, 10, steelA);
  const lower1 = py + steelA;
  g.fillStyle = "#6d737c"; g.fillRect(px - 100, lower1, 200, 12);
  // brass rods rise from lower bar to upper bar
  const upper = lower1 - brass;
  g.fillStyle = C.brass; g.fillRect(px - 55, upper, 12, brass); g.fillRect(px + 43, upper, 12, brass);
  g.fillStyle = "#6d737c"; g.fillRect(px - 65, upper - 12, 130, 12);
  // inner steel rod hangs from the upper bar to the bob
  g.fillStyle = "#8f98a3"; g.fillRect(px - 5, upper, 10, steelB + 40);
  const bobY = upper + steelB + 80;
  g.fillStyle = C.brass; g.beginPath(); g.arc(px, bobY, 44, 0, TAU); g.fill();
  g.fillStyle = "#5c4a2a"; g.fillRect(px - 110, py - 16, 220, 16);
  text(g, "gridiron", px, 120, { size: 30, align: "center", color: C.bone });
  g.restore();
  // reference lines at each bob's cold position
  g.strokeStyle = "rgba(238,233,223,.35)"; g.setLineDash([8, 8]); g.lineWidth = 2;
  const coldGrid = py + 520 - 380 + 380 + 80, coldPlain = py + 520 + 40;
  g.beginPath(); g.moveTo(px - 160, coldGrid); g.lineTo(px + 160, coldGrid); g.moveTo(qx - 160, coldPlain); g.lineTo(qx + 160, coldPlain); g.stroke(); g.setLineDash([]);
  text(g, "stays put", px + 170, coldGrid + 8, { size: 26, color: C.verd, alpha: kg });
  text(g, "drops when warm", qx + 170, coldPlain + 8, { size: 26, color: C.signal, alpha: kc });
  // legend + thermometer
  text(g, temp > .5 ? "warm" : "cool", 1810, 420, { size: 40, kind: "serif", weight: 600, color: temp > .5 ? C.signal : C.verd, align: "center" });
  g.strokeStyle = C.bone; g.lineWidth = 3; g.strokeRect(1795, 470, 30, 280);
  g.fillStyle = temp > .5 ? C.signal : C.verd; g.fillRect(1799, 746 - 260 * temp, 22, 260 * temp);
  text(g, "steel down, brass up: they cancel", W / 2, 1010, { size: 34, align: "center", color: C.brass, weight: 600, alpha: vis(t, s.w(0, "cancel") - .3, 1e9, .5) });
  text(g, "expansion exaggerated", 60, 1045, { size: 18, color: C.mist, alpha: .6 });
};

// ---------------------------------------------------------------- four machines

function h1Frame(g, x, y, sc, a1, alpha = 1, blueprint = false) {
  g.save(); g.translate(x, y); g.scale(sc, sc); g.globalAlpha *= alpha;
  const main = blueprint ? "rgba(79,179,162,.7)" : C.brass, dim = blueprint ? "rgba(79,179,162,.45)" : C.brassDim;
  g.strokeStyle = dim; g.lineWidth = 6;
  g.strokeRect(-260, -240, 520, 440);
  [-150, 0, 150].forEach(dx => { g.strokeStyle = blueprint ? main : C.bone; g.lineWidth = 3; g.beginPath(); g.arc(dx, -160, 46, 0, TAU); g.stroke(); });
  // two dumbbell balances, side by side, swinging in opposite directions
  [[-125, 1], [125, -1]].forEach(([bx, dir]) => {
    g.save(); g.translate(bx, 60); g.rotate(a1 * dir);
    g.strokeStyle = main; g.lineWidth = 8;
    g.beginPath(); g.moveTo(-100, 0); g.lineTo(100, 0); g.stroke();
    g.fillStyle = main; g.beginPath(); g.arc(-100, 0, 24, 0, TAU); g.arc(100, 0, 24, 0, TAU); g.fill();
    g.fillStyle = C.ink; g.beginPath(); g.arc(0, 0, 9, 0, TAU); g.fill();
    g.restore();
  });
  // crossed wires linking the balances
  g.strokeStyle = "rgba(238,233,223,.6)"; g.lineWidth = 2;
  g.beginPath(); g.moveTo(-125, 20); g.lineTo(125, 100); g.moveTo(-125, 100); g.lineTo(125, 20); g.stroke();
  g.restore();
}

SCENES.h1 = (g, s) => {
  const t = s.t, T = s.T, st = s.p.stage;
  bg(g);
  if (st === "trial") {
    g.fillStyle = "#0b1016"; g.fillRect(0, 0, W, H);
    const box = [-7.1, 49.5, -2.9, 50.8, 80, 150, 1760];
    land(g, ASSETS.scilly, box, "#1a212b", "#3a4454", 1.5);
    const k = prog(t, .3, 4, easeOut);
    const [sx, sy] = proj(-5.0, 49.2, box), [ex, ey] = proj(-5.25, 49.85, box);
    const shipX = lerp(sx, ex, k), shipY = lerp(sy, ey, k);
    tallShip(g, shipX, shipY, .25, .05 * Math.sin(T), C.bone);
    place(g, box, -3.64, 50.22, "Start Point", "what the officers thought", vis(t, s.w(0, "Start") - .3, 1e9, .5), C.mist, -1);
    place(g, box, -5.20, 49.96, "The Lizard", "where they were", vis(t, s.w(0, "Lizard") - .3, 1e9, .5), C.brass, 1);
    const dk = vis(t, s.w(0, "sixty") - .3, 1e9, .5);
    if (dk > 0) {
      const [ax, ay] = proj(-3.64, 50.22, box), [bx, by] = proj(-5.20, 49.96, box);
      g.save(); g.globalAlpha = dk; g.strokeStyle = C.signal; g.lineWidth = 3; g.setLineDash([10, 8]);
      g.beginPath(); g.moveTo(ax, ay + 40); g.lineTo(bx, by + 40); g.stroke(); g.setLineDash([]);
      text(g, "≈ 60 miles", (ax + bx) / 2, (ay + by) / 2 + 90, { size: 34, weight: 600, color: C.signal, align: "center" });
      g.restore();
    }
    caption(g, t, .5, s.dur - .6, ["1736", "H1 returning from Lisbon"]);
    return;
  }
  const a1 = .45 * Math.sin(T * 2.2);
  if (st === "build") {
    const built = prog(t, s.w(0, "H1") - 1.2, 1.4);
    h1Frame(g, 760, 580, 1.1, a1 * built, prog(t, .4, 1.2) * (1 - built), true);
    h1Frame(g, 760, 580, 1.1, a1, built);
    caption(g, t, .4, s.w(0, "H1") - .8, ["1730", "Harrison takes his plan to London"]);
    text(g, "George Graham", 1320, 330, { size: 40, kind: "serif", weight: 560, alpha: vis(t, s.w(0, "Graham") - .3, 1e9, .5) });
    text(g, "London's leading clockmaker: a loan", 1320, 375, { size: 26, color: C.mist, alpha: vis(t, s.w(0, "lent") - .3, 1e9, .5) });
    text(g, "H1, 1735", 1320, 520, { size: 70, kind: "serif", weight: 620, color: C.brass, alpha: vis(t, s.w(0, "H1") - .3, 1e9, .5) });
    text(g, "no pendulum", 1320, 580, { size: 34, color: C.bone, alpha: vis(t, s.w(0, "pendulum") - .3, 1e9, .5) });
    return;
  }
  // balances: tilt the whole machine with the ship; the linked balances don't care
  const tilt = .2 * Math.sin(T * .9);
  g.save(); g.translate(760, 600); g.rotate(tilt); g.translate(-760, -600);
  h1Frame(g, 760, 600, 1, a1);
  g.restore();
  const k = vis(t, s.w(0, "lurches") - .3, 1e9, .5);
  if (k > 0) {
    g.save(); g.globalAlpha = k; g.fillStyle = C.signal; g.strokeStyle = C.signal; g.lineWidth = 5;
    g.beginPath(); g.moveTo(560, 330); g.lineTo(480, 330); g.stroke(); arrowHead(g, 470, 330, Math.PI, 22);
    g.beginPath(); g.moveTo(960, 330); g.lineTo(1040, 330); g.stroke(); arrowHead(g, 1050, 330, 0, 22);
    g.restore();
  }
  text(g, "linked: always opposite", 1320, 440, { size: 34, color: C.bone, weight: 600, alpha: vis(t, s.w(0, "opposite") - .3, 1e9, .5) });
  text(g, "the ship's push cancels", 1320, 500, { size: 34, color: C.brass, weight: 600, alpha: vis(t, s.w(0, "cancel") - .3, 1e9, .5) });
};

SCENES.h3 = (g, s) => {
  const t = s.t, T = s.T, st = s.p.stage;
  bg(g);
  if (st === "strip") {
    const temp = Math.sin(t * .9);
    const bend = temp * .9;
    const x0 = 460, y0 = 560, L = 700;
    for (const [off, col, lab] of [[-10, C.brass, "brass"], [10, "#8f98a3", "steel"]]) {
      g.strokeStyle = col; g.lineWidth = 20; g.lineCap = "butt"; g.beginPath();
      for (let i = 0; i <= 40; i++) { const u = i / 40, a = bend * u; const x = x0 + L * u, y = y0 + off - bend * 260 * u * u; i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
    }
    g.fillStyle = "#5c4a2a"; g.fillRect(x0 - 40, y0 - 40, 40, 80);
    text(g, "brass", x0 + 40, y0 - 40, { size: 26, color: C.brass });
    text(g, "steel", x0 + 40, y0 + 64, { size: 26, color: C.mist });
    text(g, temp > 0 ? "warmer: bends one way" : "cooler: bends the other", 1300, 360, { size: 34, color: temp > 0 ? C.signal : C.verd, weight: 600 });
    text(g, "bimetallic strip", 1300, 470, { size: 60, kind: "serif", weight: 620, color: C.brass });
    text(g, "still in thermostats today", 1300, 530, { size: 30, color: C.mist, alpha: vis(t, s.w(0, "thermostats") - .3, 1e9, .5) });
    return;
  }
  if (st === "bearing") {
    const cx = 760, cy = 560, R = 300, n = 12;
    const rot = T * .8;
    g.strokeStyle = C.mist; g.lineWidth = 16; g.beginPath(); g.arc(cx, cy, R + 50, 0, TAU); g.stroke();
    g.fillStyle = "#3a4454"; g.beginPath(); g.arc(cx, cy, R - 50, 0, TAU); g.fill();
    g.strokeStyle = C.brassDim; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.stroke();   // cage
    for (let i = 0; i < n; i++) {
      const a = rot * .5 + i * TAU / n, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      g.fillStyle = C.bone; g.beginPath(); g.arc(x, y, 34, 0, TAU); g.fill();
      g.strokeStyle = C.ink; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 30 * Math.cos(rot * -3 + i), y + 30 * Math.sin(rot * -3 + i)); g.stroke();
    }
    g.fillStyle = C.ink; g.beginPath(); g.arc(cx, cy, 40, 0, TAU); g.fill();
    text(g, "caged roller bearing", 1300, 470, { size: 56, kind: "serif", weight: 620, color: C.brass });
    text(g, "the cage keeps the rollers apart", 1300, 530, { size: 30, color: C.mist, alpha: vis(t, s.w(0, "cage") - .3, 1e9, .5) });
    return;
  }
  // fail: H3's two big balances, slow; nineteen years
  const a = .5 * Math.sin(T * 1.3);
  [[600, 1], [920, -1]].forEach(([x, d]) => balanceWheel(g, x, 560, 150, a * d, C.brassDim, 6));
  const years = Math.min(19, Math.floor(prog(t, .3, 4, x => x) * 19));
  text(g, `${years} years`, 1400, 480, { size: 90, kind: "serif", weight: 620, color: C.bone });
  text(g, "H3, 1740–1759", 1400, 540, { size: 32, color: C.mist });
  text(g, "not accurate enough", 1400, 650, { size: 38, color: C.signal, weight: 600, alpha: vis(t, s.w(0, "never") - .3, 1e9, .5) });
};

// ---------------------------------------------------------------- the watch

SCENES.h4 = (g, s) => {
  const t = s.t, T = s.T, st = s.p.stage;
  bg(g, "#151c27");
  if (st === "reveal") {
    const k = prog(t, .2, 1.4, easeOut);
    watch(g, 760, 560, 260 * lerp(.85, 1, k), 11.2 + T / 3600, k);
    const sk = vis(t, s.w(0, "thirteen") - .3, 1e9, .5);
    if (sk > 0) {
      g.save(); g.globalAlpha = sk; g.strokeStyle = C.bone; g.lineWidth = 2;
      g.beginPath(); g.moveTo(484, 880); g.lineTo(1036, 880); g.moveTo(484, 868); g.lineTo(484, 892); g.moveTo(1036, 868); g.lineTo(1036, 892); g.stroke();
      text(g, "≈ 13 cm", 760, 930, { size: 32, align: "center", color: C.bone });
      g.restore();
    }
    text(g, "H4", 1320, 480, { size: 110, kind: "serif", weight: 640, color: C.brass });
    text(g, "finished 1759", 1320, 540, { size: 34, color: C.mist });
    return;
  }
  if (st === "balance") {
    const fast = .9 * Math.sin(T * TAU * 2.5), slow = .6 * Math.sin(T * TAU * .5);
    balanceWheel(g, 560, 540, 130, fast, C.brass, 5);
    text(g, "H4: 5 swings a second", 560, 760, { size: 32, align: "center", color: C.brass, weight: 600 });
    g.save(); g.globalAlpha = vis(t, s.w(0, "slow") - .4, 1e9, .5);
    balanceWheel(g, 1260, 540, 230, slow, C.brassDim, 7);
    text(g, "sea clocks: slow and heavy", 1260, 830, { size: 30, align: "center", color: C.mist });
    g.restore();
    text(g, "small and fast: hard to knock off rhythm", W / 2, 990, { size: 34, align: "center", color: C.bone, alpha: vis(t, s.w(0, "rhythm") - .3, 1e9, .5) });
    return;
  }
  if (st === "pallets") {
    // stylised verge: crown-wheel teeth pass under two pallets on the balance staff
    const beat = T * 5, step = Math.floor(beat), f = beat - step;
    const sx = 760, sy = 560;
    const staff = (step % 2 ? 1 : -1) * (1 - 2 * ease(f)) * .45;
    g.save(); g.beginPath(); g.rect(260, 640, 1000, 170); g.clip();
    for (let i = -8; i < 10; i++) {
      const x = sx + (i + ((step * .5 + ease(f) * .5) % 1)) * 110 - 500;
      g.fillStyle = C.brassDim; g.beginPath(); g.moveTo(x, 800); g.lineTo(x + 80, 800); g.lineTo(x + 80, 690); g.closePath(); g.fill();
    }
    g.restore();
    g.fillStyle = "#6d737c"; g.fillRect(260, 800, 1000, 16);
    g.save(); g.translate(sx, sy); g.rotate(staff);
    g.fillStyle = "#8f98a3"; g.fillRect(-8, -300, 16, 380);
    [[-1, 0], [1, 0]].forEach(([side]) => {
      g.save(); g.translate(side * 60, 90); g.rotate(side * .5);
      g.fillStyle = "#cfe8f0"; g.shadowColor = "rgba(200,240,255,.9)"; g.shadowBlur = 16; g.fillRect(-14, -24, 28, 48);
      g.restore();
    });
    g.restore();
    balanceWheel(g, sx, sy - 330, 120, staff * 2, C.brass, 5);
    callout(g, vis(t, s.w(0, "diamond") - .3, 1e9), sx + 70, sy + 90, 1380, 420, "diamond pallets", "#cfe8f0", 34);
    text(g, "about 1 mm × 2 mm", 1392, 470, { size: 28, color: C.mist, alpha: vis(t, s.w(0, "millimetre") - .3, 1e9, .5) });
    text(g, "+ bimetallic strip on the balance spring", 1392, 600, { size: 28, color: C.bone, alpha: vis(t, s.w(0, "bimetallic") - .3, 1e9, .5) });
    text(g, "stylised verge escapement", 60, 1045, { size: 18, color: C.mist, alpha: .6 });
    return;
  }
  // fusee: spring barrel + cone; the chain walks from the narrow end to the wide end as the spring runs down
  const run = prog(t, s.w(0, "narrow") - .5, Math.max(3, s.dur - s.w(0, "narrow") - 2), x => x);
  const bx = 460, by = 520, fx = 1000, fy = 520;
  g.fillStyle = "#6d737c"; g.fillRect(bx - 90, by - 130, 180, 260);
  g.strokeStyle = C.bone; g.lineWidth = 2; g.beginPath();
  for (let a = 0; a < 5 * TAU * (1 - run * .7); a += .1) { const rr = 20 + a * 4; g.lineTo(bx + rr * Math.cos(a), by + rr * Math.sin(a)); }
  g.stroke();
  text(g, "mainspring", bx, by + 180, { size: 28, color: C.mist, align: "center" });
  // cone: narrow on the left, wide on the right
  const cL = fx - 160, cR = fx + 160, rN = 40, rW = 140;
  g.fillStyle = C.brassDim;
  g.beginPath(); g.moveTo(cL, fy - rN); g.lineTo(cR, fy - rW); g.lineTo(cR, fy + rW); g.lineTo(cL, fy + rN); g.closePath(); g.fill();
  g.strokeStyle = "rgba(0,0,0,.35)"; g.lineWidth = 2;
  for (let i = 0; i < 14; i++) { const u = i / 13, x = lerp(cL, cR, u), r = lerp(rN, rW, u); g.beginPath(); g.moveTo(x, fy - r); g.lineTo(x + 10, fy + r); g.stroke(); }
  const cx = lerp(cL + 10, cR - 10, run), cr = lerp(rN, rW, (cx - cL) / (cR - cL));
  g.strokeStyle = C.bone; g.lineWidth = 5; g.setLineDash([6, 5]);
  g.beginPath(); g.moveTo(bx + 90, by - 110); g.lineTo(cx, fy - cr); g.stroke(); g.setLineDash([]);
  text(g, "fusee", fx, fy + 190, { size: 28, color: C.mist, align: "center" });
  // force graph
  const gx = 1330, gy = 780, gw = 480, gh = 300;
  g.strokeStyle = C.line; g.lineWidth = 2; g.beginPath(); g.moveTo(gx, gy - gh); g.lineTo(gx, gy); g.lineTo(gx + gw, gy); g.stroke();
  text(g, "force on the train", gx, gy - gh - 20, { size: 24, color: C.mist });
  g.strokeStyle = C.signal; g.lineWidth = 4; g.setLineDash([10, 8]); g.beginPath(); g.moveTo(gx, gy - gh * .95); g.lineTo(gx + gw * run, gy - gh * lerp(.95, .35, run)); g.stroke(); g.setLineDash([]);
  g.strokeStyle = C.verd; g.beginPath(); g.moveTo(gx, gy - gh * .62); g.lineTo(gx + gw * run, gy - gh * .62); g.stroke();
  text(g, "spring alone", gx + gw, gy - gh * .3, { size: 22, color: C.signal, align: "right" });
  text(g, "through the fusee", gx + gw, gy - gh * .62 - 16, { size: 22, color: C.verd, align: "right", alpha: vis(t, s.w(0, "constant") - .5, 1e9, .5) });
};

// ---------------------------------------------------------------- the voyages

SCENES.voyage = (g, s) => {
  const t = s.t, T = s.T, leg = s.p.leg, st = s.p.stage;
  g.fillStyle = "#0b1016"; g.fillRect(0, 0, W, H);
  const box = [-92, 6, 8, 58, 80, 20, 1760];
  land(g, ASSETS.atl, box, "#1a212b", "#3a4454", 1.2);
  const ports = { ports: [-1.1, 50.8], jam: [-76.8, 17.95], bar: [-59.6, 13.1], mad: [-16.9, 32.65] };
  const dest = leg === "jamaica" ? ports.jam : ports.bar;
  const days = leg === "jamaica" ? 81 : 47;
  // route: Portsmouth → Madeira → destination, drawn as a smooth curve (illustrative)
  const P = [ports.ports, ports.mad, [lerp(ports.mad[0], dest[0], .5), lerp(ports.mad[1], dest[1], .5) - 4], dest].map(p => proj(p[0], p[1], box));
  const k = st === "result" ? 1 : prog(t, .5, s.dur - 2, x => x);
  const pts = [];
  for (let i = 0; i <= 120; i++) {
    const u = i / 120 * 3, seg = Math.min(2, Math.floor(u)), f = u - seg;
    const a = P[seg], b = P[seg + 1], c0 = P[Math.max(0, seg - 1)], d0 = P[Math.min(3, seg + 2)];
    const cm = (p0, p1, p2, p3, f) => .5 * (2 * p1 + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f);
    pts.push([cm(c0[0], a[0], b[0], d0[0], f), cm(c0[1], a[1], b[1], d0[1], f)]);
  }
  const n = Math.floor(k * 120);
  g.strokeStyle = C.brass; g.lineWidth = 4; g.setLineDash([14, 10]);
  g.beginPath(); pts.slice(0, n + 1).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); g.setLineDash([]);
  const [shx, shy] = pts[n];
  if (st !== "result" && k < .99) tallShip(g, shx, shy - 6, .16, .05 * Math.sin(T * 1.3), C.bone);
  place(g, box, ports.ports[0], ports.ports[1], "Portsmouth", null, 1, C.bone, -1);
  place(g, box, dest[0], dest[1], leg === "jamaica" ? "Jamaica" : "Barbados", null, prog(t, .2, .6), C.brass, 1);
  // readouts
  const panel = (lines) => {
    g.save(); g.fillStyle = "rgba(13,17,23,.9)"; g.fillRect(1180, 620, 660, 330); g.restore();
    lines.forEach(([str, size, col, y, a]) => text(g, str, 1220, y, { size, color: col, weight: size > 40 ? 620 : 500, kind: size > 40 ? "serif" : "sans", alpha: a }));
  };
  if (leg === "jamaica" && st !== "result") {
    panel([["HMS Deptford · 1761–62", 30, C.bone, 690, 1], [`day ${Math.max(1, Math.round(k * days))} of ${days}`, 64, C.brass, 780, 1], ["with William Harrison", 26, C.mist, 830, vis(t, s.w(0, "William") - .3, 1e9, .5)]]);
  } else if (leg === "jamaica") {
    const a1 = vis(t, s.w(0, "five") - .4, 1e9, .5), a2 = vis(t, s.w(0, "mile") - .5, 1e9, .5);
    panel([["error on arrival", 28, C.mist, 680, 1], ["5.1 seconds", 80, C.brass, 780, a1], ["≈ 1¼ nautical miles", 40, C.bone, 850, a2], ["after allowing for its known rate", 24, C.mist, 910, vis(t, s.w(0, "allowing") - .3, 1e9, .5)]]);
  } else {
    const done = k > .98;
    panel([["HMS Tartar · 1764", 30, C.bone, 680, 1], [done ? "39.2 seconds" : `day ${Math.max(1, Math.round(k * days))} of ${days}`, 70, C.brass, 770, 1], ["≈ 10 miles", 36, C.bone, 840, vis(t, s.w(0, "ten") - .3, 1e9, .5)], ["3× better than required", 32, C.verd, 900, vis(t, s.w(0, "Three") - .3, 1e9, .5)]]);
  }
  text(g, "route illustrative", 60, 1045, { size: 18, color: C.mist, alpha: .6 });
};

// ---------------------------------------------------------------- the prize

SCENES.board = (g, s) => {
  const t = s.t, T = s.T, st = s.p.stage;
  bg(g);
  if (st === "doubt") {
    // the two methods on a balance beam
    const tip = .12 * Math.sin(T * .7);
    g.save(); g.translate(760, 520); g.rotate(tip);
    g.fillStyle = C.brassDim; g.fillRect(-420, -6, 840, 12);
    g.restore();
    g.fillStyle = C.brassDim; g.beginPath(); g.moveTo(760, 520); g.lineTo(720, 760); g.lineTo(800, 760); g.fill();
    const lx = 760 - 400 * Math.cos(tip), ly = 520 - 400 * Math.sin(tip), rx = 760 + 400 * Math.cos(tip), ry = 520 + 400 * Math.sin(tip);
    moonDisc(g, lx, ly - 90, 60, .45);
    text(g, "lunar distances", lx, ly + 30, { size: 28, align: "center", color: C.bone });
    watch(g, rx, ry - 100, 64, 10.1);
    text(g, "the watch", rx, ry + 30, { size: 28, align: "center", color: C.bone });
    text(g, "Nevil Maskelyne", 1300, 300, { size: 44, kind: "serif", weight: 580, alpha: vis(t, s.w(0, "Maskelyne") - .3, 1e9, .5) });
    text(g, "Astronomer Royal from 1765", 1300, 345, { size: 28, color: C.mist, alpha: vis(t, s.w(0, "Maskelyne") - .3, 1e9, .5) });
    text(g, "one watch might be luck:", 1300, 800, { size: 34, kind: "serif", color: C.brass, alpha: vis(t, s.w(0, "luck") - .5, 1e9, .5) });
    text(g, "could anyone else make another?", 1300, 848, { size: 34, kind: "serif", color: C.brass, alpha: vis(t, s.w(0, "anyone") - .5, 1e9, .5) });
    return;
  }
  if (st === "disclosure") {
    // H4 taken apart: parts drift out of the case
    const k = prog(t, s.w(0, "apart") - .6, 2.5);
    watch(g, 700, 540, 220, 10.1, 1 - .6 * k);
    const r = rng(3);
    for (let i = 0; i < 14; i++) {
      const a = r() * TAU, d = 250 + r() * 200, x = 700 + Math.cos(a) * d * k, y = 540 + Math.sin(a) * d * k * .8;
      g.save(); g.globalAlpha = k;
      if (i % 3 === 0) gear(g, { x, y, teeth: 12 + (i * 5) % 30, r: 20 + (i * 7) % 40, rot: T * .2 + i, stroke: C.brass, lw: 2, hole: "rgba(0,0,0,0)", spokes: 0 });
      else if (i % 3 === 1) balanceWheel(g, x, y, 24 + (i * 3) % 20, T + i, C.brassDim, 3);
      else { g.fillStyle = "#8f98a3"; g.fillRect(x - 30, y - 4, 60, 8); }
      g.restore();
    }
    text(g, "1765", 1320, 330, { size: 60, kind: "serif", weight: 620, color: C.brass });
    text(g, "£10,000: half the prize", 1320, 400, { size: 38, alpha: vis(t, s.w(0, "ten") - .3, 1e9, .5) });
    text(g, "on condition of full disclosure", 1320, 450, { size: 28, color: C.mist, alpha: vis(t, s.w(0, "condition") - .3, 1e9, .5) });
    text(g, "copy by Larcum Kendall: K1", 1320, 620, { size: 32, color: C.bone, alpha: vis(t, s.w(0, "Kendall") - .3, 1e9, .5) });
    return;
  }
  if (st === "cook") {
    const box = [-180, -60, 180, 70, 60, 110, 1800];
    g.fillStyle = "#0b1016"; g.fillRect(0, 0, W, H);
    land(g, ASSETS.world, box, "#1a212b", "#3a4454", 1);
    // an illustrative loop: Plymouth, Cape Town, the Southern Ocean, New Zealand, Tahiti, Cape Horn, home
    const wp = [[-4.1, 50.4], [-17, 32.7], [18.4, -33.9], [60, -58], [120, -60], [174, -41], [190, -30], [210.5, -17.6], [250, -60], [292, -56], [330, -50], [378.4, -33.9], [343, 32.7], [355.9, 50.4]];
    const k = prog(t, .4, s.dur - 1.5, x => x), n = Math.floor(k * (wp.length - 1) * 20);
    g.strokeStyle = C.brass; g.lineWidth = 3; g.setLineDash([10, 8]); g.beginPath();
    let prevL = null;
    for (let i = 0; i <= n; i++) {
      const u = i / 20, j = Math.min(wp.length - 2, Math.floor(u)), f = u - j;
      const lon = lerp(wp[j][0], wp[j + 1][0], f), lat = lerp(wp[j][1], wp[j + 1][1], f);
      const L = ((lon + 180) % 360 + 360) % 360 - 180;
      const [x, y] = proj(L, lat, box);
      if (prevL === null || Math.abs(L - prevL) > 180) g.moveTo(x, y); else g.lineTo(x, y);
      prevL = L;
    }
    g.stroke(); g.setLineDash([]);
    g.save(); g.fillStyle = "rgba(13,17,23,.88)"; g.fillRect(1180, 640, 640, 300); g.restore();
    watch(g, 1300, 780, 80, 10.1);
    text(g, "K1 with Captain Cook", 1420, 730, { size: 30, weight: 600 });
    text(g, "second voyage, 1772–75", 1420, 770, { size: 24, color: C.mist });
    text(g, "“trusty friend”", 1420, 840, { size: 32, kind: "serif", color: C.brass, alpha: vis(t, s.w(0, "trusty") - .3, 1e9, .5) });
    text(g, "“never-failing guide”", 1420, 885, { size: 32, kind: "serif", color: C.brass, alpha: vis(t, s.w(0, "guide") - .5, 1e9, .5) });
    text(g, "route illustrative", 60, 1045, { size: 18, color: C.mist, alpha: .6 });
    return;
  }
  if (st === "king") {
    watch(g, 620, 540, 200, 10.1 + T / 3600);
    text(g, "H5", 620, 840, { size: 50, kind: "serif", weight: 620, color: C.brass, align: "center" });
    text(g, "Tested at the King's Observatory, Kew", 1100, 400, { size: 34, alpha: vis(t, s.w(0, "Kew") - .3, 1e9, .5) });
    text(g, "1772", 1100, 450, { size: 30, color: C.mist, alpha: vis(t, s.w(0, "Kew") - .3, 1e9, .5) });
    text(g, "£8,750", 1100, 620, { size: 90, kind: "serif", weight: 620, color: C.brass, alpha: vis(t, s.w(0, "eight") - .5, 1e9, .5) });
    text(g, "awarded by Parliament, 1773", 1100, 675, { size: 30, color: C.mist, alpha: vis(t, s.w(0, "eight") - .5, 1e9, .5) });
    return;
  }
  // ledger: received vs the prize
  const k = prog(t, .3, 2);
  const x0 = 360, w = 1200, y1 = 440, y2 = 620;
  g.fillStyle = C.brass; g.fillRect(x0, y1, w * (23065 / 25000) * k, 80);
  text(g, "received over the years: £23,065", x0, y1 - 20, { size: 32, color: C.bone, alpha: k });
  g.strokeStyle = C.bone; g.lineWidth = 3; g.setLineDash([12, 10]); g.strokeRect(x0, y2, w * (20000 / 25000), 80); g.setLineDash([]);
  text(g, "the prize: £20,000", x0, y2 - 20, { size: 32, color: C.mist });
  text(g, "never formally awarded", x0 + w * .8 + 30, y2 + 55, { size: 32, color: C.signal, weight: 600, alpha: vis(t, s.w(0, "never") - .3, 1e9, .5) });
  text(g, "John Harrison died in 1776", W / 2, 900, { size: 38, kind: "serif", weight: 540, align: "center", alpha: vis(t, s.w(0, "died") - .3, 1e9, .5) });
};

// ---------------------------------------------------------------- still keeping time

SCENES.outro = (g, s) => {
  const t = s.t, T = s.T;
  const sky = g.createLinearGradient(0, 0, 0, 640);
  sky.addColorStop(0, "#1b2b3d"); sky.addColorStop(1, "#3b4b5a");
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  const surf = sea(g, T, 640, 4, L => `rgb(${18 + L * 4},${32 + L * 5},${46 + L * 6})`);
  [[300, .5], [800, .75], [1350, .6]].forEach(([x0, sc], i) => { const x = x0 + t * 10; tallShip(g, x, surf(i + 1, x) - 6, sc, .05 * Math.sin(T + i), "#0a0e13"); });
  g.save(); g.fillStyle = "rgba(13,17,23,.85)"; g.fillRect(1180, 120, 640, 260); g.restore();
  watch(g, 1290, 250, 70, 10.1);
  text(g, "chronometer", 1290, 360, { size: 24, align: "center", color: C.mist });
  moonDisc(g, 1560, 250, 60, .45);
  text(g, "lunar distance", 1560, 360, { size: 24, align: "center", color: C.mist });
  text(g, "+", 1425, 265, { size: 50, align: "center", color: C.brass, alpha: vis(t, s.w(0, "both") - .3, 1e9, .5) });
};

SCENES.gps = (g, s) => {
  const t = s.t, T = s.T;
  bg(g, "#0b1220", "#05080d");
  stars(g, 30, 220, .7);
  const cx = 760, cy = 560, R = 300;
  globe(g, cx, cy, R, -T * 4 - 20, 25, {});
  const phone = orthoPt(-5, 45, -T * 4 - 20, 25);
  const px = cx + phone[0] * R, py = cy - phone[1] * R;
  const sats = [[0, 1.0, 0.35], [2.1, .8, -.4], [4.0, 1.1, .2], [5.2, .95, -.1]];
  sats.forEach(([ph, sp, tilt], i) => {
    const a = ph + T * .15 * sp;
    const ox = cx + 470 * Math.cos(a), oy = cy + 470 * Math.sin(a) * .45 + 120 * tilt * Math.cos(a);
    g.strokeStyle = "rgba(154,164,178,.25)"; g.lineWidth = 1.5; g.beginPath(); g.ellipse(cx, cy, 470, 470 * .45, tilt * .2, 0, TAU); g.stroke();
    const front = Math.sin(a) > -.3;
    if (!front) return;
    g.fillStyle = C.bone; g.fillRect(ox - 12, oy - 8, 24, 16);
    g.fillStyle = C.verd; g.fillRect(ox - 40, oy - 5, 24, 10); g.fillRect(ox + 16, oy - 5, 24, 10);
    // signal pulse to the phone
    const pk = vis(t, s.w(0, "timing") - .3, 1e9, .5);
    if (pk > 0) {
      g.save(); g.globalAlpha = pk * .7; g.strokeStyle = C.brass; g.setLineDash([6, 10]); g.lineDashOffset = -T * 40; g.lineWidth = 2;
      g.beginPath(); g.moveTo(ox, oy); g.lineTo(px, py); g.stroke(); g.restore();
    }
    g.save(); g.globalAlpha = vis(t, s.w(0, "atomic") - .3, 1e9, .5); clockFace(g, ox, oy - 42, 18, 3 + i + T / 60, { rim: C.brass }); g.restore();
  });
  g.fillStyle = C.brass; g.beginPath(); g.arc(px, py, 8, 0, TAU); g.fill();
  text(g, "Position", 1300, 440, { size: 64, kind: "serif", weight: 620, alpha: vis(t, s.w(0, "question") - .6, 1e9, .5) });
  text(g, "is still a question of time", 1300, 510, { size: 40, kind: "serif", color: C.brass, alpha: vis(t, s.w(0, "question") - .3, 1e9, .5) });
};

// ---------------------------------------------------------------- end screen

SCENES.endcard = (g, s) => {
  const t = s.t, T = s.T;
  bg(g);
  stars(g, 3, 160, .5);
  const k = prog(t, .2, 1);
  g.save(); g.globalAlpha = k;
  text(g, "Orrery", 150, 250, { size: 96, kind: "serif", weight: 640 });
  text(g, "Working models of everything.", 150, 314, { size: 34, color: C.brass, weight: 600 });
  text(g, "Watch next", 1120, 120, { size: 30, color: C.mist, weight: 550 });
  g.strokeStyle = C.ink3; g.lineWidth = 2;
  g.strokeRect(1120, 150, 680, 383); g.strokeRect(1120, 583, 680, 383);
  g.restore();
  watch(g, 470, 720, 190, 10.1 + T / 3600, k);
};
