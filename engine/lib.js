// Orrery drawing library: deterministic canvas helpers shared by every video's scenes.
// Everything is a pure function of time, so any frame can be rendered in any order.
const W = 1920, H = 1080;
const C = {
  ink: "#0d1117", ink2: "#161c25", ink3: "#232b37", line: "#3a4454",
  brass: "#e0a943", brassDim: "#9c7631", verd: "#4fb3a2", signal: "#ef5b3f",
  bone: "#eee9df", mist: "#9aa4b2",
};
const TAU = Math.PI * 2;

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;   // cubic in-out
const easeOut = k => 1 - Math.pow(1 - k, 3);
// eased 0..1 progress of t through [a, a+d]
const prog = (t, a, d = 1, f = ease) => f(clamp((t - a) / d));
// fade in at a, fade out at b (both over d seconds)
const vis = (t, a, b = 1e9, d = .5) => Math.min(prog(t, a, d, easeOut), 1 - prog(t, b, d, easeOut));

function rng(seed) {
  let s = (seed * 2654435761) % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

// value noise + fbm, for corrosion, terrain and water
function hash2(x, y) { let h = x * 374761393 + y * 668265263; h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0) / 4294967295; }
function noise2(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return lerp(lerp(hash2(xi, yi), hash2(xi + 1, yi), u), lerp(hash2(xi, yi + 1), hash2(xi + 1, yi + 1), u), v);
}
function fbm(x, y, oct = 4) { let a = 0, amp = .5, f = 1; for (let i = 0; i < oct; i++) { a += amp * noise2(x * f, y * f); f *= 2; amp *= .5; } return a; }

function font(size, kind = "sans", weight = 500) {
  return kind === "serif" ? `${weight} ${size}px Fraunces` : `${weight} ${size}px Inter`;
}

function text(ctx, str, x, y, o = {}) {
  ctx.save();
  ctx.globalAlpha *= o.alpha ?? 1;
  ctx.font = font(o.size ?? 32, o.kind ?? "sans", o.weight ?? 500);
  ctx.fillStyle = o.color ?? C.bone;
  ctx.textAlign = o.align ?? "left";
  ctx.textBaseline = o.baseline ?? "alphabetic";
  if (o.tracking) ctx.letterSpacing = o.tracking + "px";
  ctx.fillText(str, x, y);
  const w = ctx.measureText(str).width;
  ctx.restore();
  return w;
}

// Label with a short brass rule above it: the standard on-screen caption.
function caption(ctx, t, a, b, lines, x = 120, y = 930) {
  const k = vis(t, a, b, .6);
  if (k <= 0) return;
  ctx.save();
  ctx.globalAlpha = k;
  ctx.fillStyle = C.brass;
  ctx.fillRect(x, y - 52, 56 * easeOut(k), 4);
  lines.forEach((l, i) => text(ctx, l, x, y + i * 44, { size: i ? 30 : 36, weight: i ? 450 : 600, color: i ? C.mist : C.bone }));
  ctx.restore();
}

// Callout: dot at (x,y), leader line to label.
function callout(ctx, k, x, y, lx, ly, label, color = C.bone, size = 30) {
  if (k <= 0) return;
  ctx.save();
  ctx.globalAlpha *= k;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fill();
  const mx = lerp(x, lx, easeOut(clamp(k * 1.5))), my = lerp(y, ly, easeOut(clamp(k * 1.5)));
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(mx, my); ctx.stroke();
  text(ctx, label, lx + (lx >= x ? 12 : -12), ly + size * .35, { size, color, align: lx >= x ? "left" : "right", alpha: clamp(k * 2 - 1) });
  ctx.restore();
}

// Gear outline. The Antikythera gears have triangular teeth, so that's the default profile.
function gearPath(ctx, cx, cy, teeth, r, rot = 0, o = {}) {
  const h = o.toothH ?? Math.max(4, Math.min(22, (TAU * r / teeth) * .9));
  const step = TAU / teeth;
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a = rot + i * step;
    if (o.triangular === false) {
      const pts = [[0, r - h / 2], [.18, r - h / 2], [.34, r + h / 2], [.66, r + h / 2], [.82, r - h / 2]];
      pts.forEach(([f, rr], j) => { const aa = a + f * step; (i || j ? ctx.lineTo : ctx.moveTo).call(ctx, cx + rr * Math.cos(aa), cy + rr * Math.sin(aa)); });
    } else {
      const r0 = r - h / 2, r1 = r + h / 2;
      if (!i) ctx.moveTo(cx + r0 * Math.cos(a), cy + r0 * Math.sin(a));
      ctx.lineTo(cx + r1 * Math.cos(a + step / 2), cy + r1 * Math.sin(a + step / 2));
      ctx.lineTo(cx + r0 * Math.cos(a + step), cy + r0 * Math.sin(a + step));
    }
  }
  ctx.closePath();
}

function gear(ctx, g) {
  // g: {x, y, teeth, r, rot, fill, stroke, lw, spokes, hub, alpha, glow}
  ctx.save();
  ctx.globalAlpha *= g.alpha ?? 1;
  if (g.glow) { ctx.shadowColor = g.glow; ctx.shadowBlur = 30; }
  gearPath(ctx, g.x, g.y, g.teeth, g.r, g.rot ?? 0, g);
  if (g.fill) { ctx.fillStyle = g.fill; ctx.fill(); }
  ctx.shadowBlur = 0;
  if (g.stroke) { ctx.strokeStyle = g.stroke; ctx.lineWidth = g.lw ?? 2; ctx.stroke(); }
  // cut-outs: spokes leave four windows, like the real wheels
  const inner = g.r * .72;
  if (g.spokes !== 0 && g.r > 40) {
    const n = g.spokes ?? 4, sw = .16 + 8 / g.r;
    ctx.fillStyle = g.hole ?? C.ink;
    for (let i = 0; i < n; i++) {
      const a0 = (g.rot ?? 0) + i * TAU / n + sw, a1 = (g.rot ?? 0) + (i + 1) * TAU / n - sw;
      ctx.beginPath();
      ctx.arc(g.x, g.y, inner, a0, a1);
      ctx.arc(g.x, g.y, g.r * .26, a1 - .05, a0 + .05, true);
      ctx.closePath(); ctx.fill();
      if (g.stroke) { ctx.stroke(); }
    }
  }
  ctx.fillStyle = g.hole ?? C.ink;
  ctx.beginPath(); ctx.arc(g.x, g.y, Math.max(3, g.r * .07), 0, TAU); ctx.fill();
  ctx.restore();
}

function stars(ctx, seed, n, alpha = 1, drift = 0) {
  const r = rng(seed);
  ctx.save();
  ctx.fillStyle = C.bone;
  for (let i = 0; i < n; i++) {
    const x = (r() * W + drift * (r() * .5 + .5)) % W, y = r() * H, s = r() < .92 ? 1.3 : 2.4, a = (.15 + r() * .6) * alpha;
    ctx.globalAlpha = a; ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

function bg(ctx, c1 = "#141b25", c2 = C.ink) {
  const g = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1200);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// Moon disc with a phase: phase 0 = new, .5 = full.
function moonDisc(ctx, x, y, r, phase, lit = C.bone, dark = "#2a313c") {
  ctx.save();
  ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  const p = ((phase % 1) + 1) % 1;
  const waxing = p < .5, k = Math.cos(p * TAU); // 1 at new, -1 at full
  ctx.fillStyle = lit;
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2, !waxing);
  ctx.ellipse(x, y, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, (k > 0) === waxing ? true : false);
  ctx.fill();
  ctx.restore();
}

function arrowHead(ctx, x, y, ang, s = 14) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - s * Math.cos(ang - .45), y - s * Math.sin(ang - .45));
  ctx.lineTo(x - s * Math.cos(ang + .45), y - s * Math.sin(ang + .45));
  ctx.closePath(); ctx.fill();
}

// Cached offscreen canvases (textures computed once per page).
const _cache = {};
function cached(key, w, h, draw) {
  if (!_cache[key]) {
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h); _cache[key] = c;
  }
  return _cache[key];
}

// Corroded-bronze texture: mottled brown crust, verdigris blooms, dark pits and faint layering.
function corrosion(key, w, h, seed = 1, scale = .012) {
  return cached(key, w, h, (g) => {
    const img = g.createImageData(w, h), d = img.data, r = rng(seed + 100);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const n = fbm(x * scale + seed * 17, y * scale + seed * 5, 5);
      const m = fbm(x * scale * 2.2 + 40, y * scale * 2.2 + seed, 4);
      const strata = .5 + .5 * Math.sin((y + 18 * fbm(x * .01, y * .01 + seed, 2)) * .09);
      const v = clamp((n - .28) * 2.6) * .8 + strata * .12 + (r() - .5) * .12;
      const gp = clamp((m - .44) * 3.5);
      const br = [44 + 110 * v, 36 + 80 * v, 26 + 48 * v], vg = [58 + 60 * v, 118 + 70 * v, 100 + 55 * v];
      const i = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) d[i + c] = lerp(br[c], vg[c], gp * .85);
      d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    for (let k = 0; k < 140; k++) {        // pits
      const x = r() * w, y = r() * h, rr = 1 + r() * r() * 7;
      g.fillStyle = `rgba(12,10,8,${.35 + r() * .4})`; g.beginPath(); g.ellipse(x, y, rr, rr * (.6 + r() * .6), r() * 3, 0, TAU); g.fill();
    }
  });
}

// Irregular blob outline (for fragments, rocks, islands).
function blobPath(ctx, cx, cy, r, seed, rough = .25, n = 72) {
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = i / n * TAU;
    const rr = r * (1 - rough / 2 + rough * fbm(Math.cos(a) * 1.3 + seed * 7, Math.sin(a) * 1.3 + seed * 3, 3));
    (i ? ctx.lineTo : ctx.moveTo).call(ctx, cx + rr * Math.cos(a), cy + rr * Math.sin(a));
  }
  ctx.closePath();
}

// Film grain + vignette over the whole frame.
function finish(ctx) {
  const v = cached("vignette", W, H, (g) => {
    const gr = g.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.05);
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,.55)");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  });
  ctx.drawImage(v, 0, 0);
  // static grain: dithers dark gradients without costing bitrate on every frame
  const tile = cached("grain", 480, 270, (g, w, h) => {
    const img = g.createImageData(w, h), d = img.data, r = rng(3);
    for (let j = 0; j < d.length; j += 4) { const n = r() * 255; d[j] = d[j + 1] = d[j + 2] = n; d[j + 3] = 10; }
    g.putImageData(img, 0, 0);
  });
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.drawImage(tile, 0, 0, W, H);
  ctx.restore();
}
