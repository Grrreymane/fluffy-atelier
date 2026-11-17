/* ===== util.js — geometry, color and SVG helpers (pure, no DOM) ===== */
const CX = 200;
const r1 = n => Math.round(n * 10) / 10;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- color ---------- */
function hex2rgb(h) {
  h = String(h).replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgb2hex(r, g, b) {
  return '#' + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
}
function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}
function hsl2rgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
const toHsl = hex => rgb2hsl(...hex2rgb(hex));
const fromHsl = (h, s, l) => rgb2hex(...hsl2rgb(h, clamp(s, 0, 1), clamp(l, 0, 1)));
/* change lightness while keeping chroma (avoids pale colors turning neon when darkened) */
function withL(hex, l2, hueShift = 0, satMul = 1) {
  const [h, s, l] = toHsl(hex);
  const c = s * (1 - Math.abs(2 * l - 1)) * satMul;
  l2 = clamp(l2, 0, 1);
  const den = 1 - Math.abs(2 * l2 - 1);
  return fromHsl(h + hueShift, den > 0.001 ? clamp(c / den, 0, 1) : 0, l2);
}
function lighten(hex, a) { const l = toHsl(hex)[2]; return withL(hex, l + (1 - l) * a); }
function darken(hex, a) { const l = toHsl(hex)[2]; return withL(hex, l * (1 - a)); }
function mix(a, b, t) {
  const A = hex2rgb(a), B = hex2rgb(b);
  return rgb2hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
}
/* a colour multiplied by another (正片叠底) */
function multiplyHex(a, b) { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A[0] * B[0] / 255, A[1] * B[1] / 255, A[2] * B[2] / 255); }
function hueToward(h, target, k) { const dh = ((target - h + 540) % 360) - 180; return h + dh * k; }
/* cartoon outline: darker, slightly purple-shifted; pale colors get a soft muted line */
const INK_LINE = '#3b1a1f';
function lineOf(hex) {
  const [h, s, l] = toHsl(hex);
  const chroma = s * (1 - Math.abs(2 * l - 1));
  const l2 = l > 0.8 ? 0.58 - (l - 0.8) * 0.3 : l * 0.46;
  const s2 = clamp(chroma * 1.25 + 0.14, 0, 0.88);
  return mix(fromHsl(hueToward(h, 285, chroma < 0.15 ? 0.6 : 0.18), s2, Math.max(0.08, l2)), INK_LINE, .8);
}
/* soft shadow tone */
function shadeOf(hex, k = 0.18) {
  const [h, s, l] = toHsl(hex);
  return withL(hex, l * (1 - k), hueToward(h, 280, 0.1) - h, 1.08);
}
const isLight = hex => toHsl(hex)[2] > 0.62;

/* ---------- points & paths ---------- */
const pt = a => Array.isArray(a) ? { x: a[0], y: a[1], c: !!a[2] } : a;
const mirX = x => 2 * CX - x;
const mirPt = p => ({ x: mirX(p.x), y: p.y, c: p.c });
function same(a, b) { return Math.abs(a.x - b.x) < 0.05 && Math.abs(a.y - b.y) < 0.05; }

/* Mirror a right-half contour (top -> right side -> bottom) into a full loop */
function sym(right) {
  const R = right.map(pt);
  const L = R.slice().reverse().map(mirPt);
  const out = R.slice();
  for (const q of L) if (!same(q, out[out.length - 1])) out.push(q);
  if (out.length > 2 && same(out[0], out[out.length - 1])) out.pop();
  return out;
}
/* Catmull-Rom -> cubic Bezier. Points flagged c=true are sharp corners. */
function smooth(points, closed = true, t = 1) {
  const P = points.map(pt), n = P.length;
  if (n < 2) return '';
  const get = i => closed ? P[(i + n) % n] : P[clamp(i, 0, n - 1)];
  let d = `M${r1(P[0].x)},${r1(P[0].y)}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p1 = get(i), p2 = get(i + 1);
    const a = (p1.c || (!closed && i === 0)) ? p1 : get(i - 1);
    const b = (p2.c || (!closed && i + 1 === n - 1)) ? p2 : get(i + 2);
    const c1x = p1.x + (p2.x - a.x) / 6 * t, c1y = p1.y + (p2.y - a.y) / 6 * t;
    const c2x = p2.x - (b.x - p1.x) / 6 * t, c2y = p2.y - (b.y - p1.y) / 6 * t;
    d += `C${r1(c1x)},${r1(c1y)} ${r1(c2x)},${r1(c2y)} ${r1(p2.x)},${r1(p2.y)}`;
  }
  return closed ? d + 'Z' : d;
}
const S = (right, t) => smooth(sym(right), true, t);         // symmetric closed shape
const poly = pts => 'M' + pts.map(p => { p = pt(p); return r1(p.x) + ',' + r1(p.y); }).join('L');
/* mirror / rotate a list of points */
const mirAll = pts => pts.map(p => mirPt(pt(p)));
function rot(pts, ang, ox = 0, oy = 0) {
  const c = Math.cos(ang), s = Math.sin(ang);
  return pts.map(p => { p = pt(p); const x = p.x - ox, y = p.y - oy; return { x: ox + x * c - y * s, y: oy + x * s + y * c, c: p.c }; });
}

/* ---------- spine sampling (for limbs, tails, hair strands) ---------- */
function bez(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return { x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
           y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y };
}
/* sample a polyline with rounded joints into evenly spaced points */
function samplePolyline(pts, step = 7, round = 14) {
  const P = pts.map(pt);
  let path = [P[0]];
  for (let i = 1; i < P.length; i++) {
    const a = P[i - 1], b = P[i];
    if (i < P.length - 1) {
      const c = P[i + 1];
      const l1 = Math.hypot(b.x - a.x, b.y - a.y), l2 = Math.hypot(c.x - b.x, c.y - b.y);
      const r = Math.min(round, l1 / 3, l2 / 3);
      const pA = { x: b.x - (b.x - a.x) / l1 * r, y: b.y - (b.y - a.y) / l1 * r };
      const pB = { x: b.x + (c.x - b.x) / l2 * r, y: b.y + (c.y - b.y) / l2 * r };
      path.push(pA);
      for (let k = 1; k < 6; k++) {
        const t = k / 6, u = 1 - t;
        path.push({ x: u * u * pA.x + 2 * u * t * b.x + t * t * pB.x, y: u * u * pA.y + 2 * u * t * b.y + t * t * pB.y });
      }
      path.push(pB);
    } else path.push(b);
  }
  // resample by arc length
  const cum = [0];
  for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y));
  const L = cum[cum.length - 1];
  const n = Math.max(2, Math.ceil(L / step));
  const out = [];
  let j = 1;
  for (let k = 0; k <= n; k++) {
    const s = L * k / n;
    while (j < cum.length - 1 && cum[j] < s) j++;
    const t = (s - cum[j - 1]) / ((cum[j] - cum[j - 1]) || 1);
    out.push({ x: lerp(path[j - 1].x, path[j].x, t), y: lerp(path[j - 1].y, path[j].y, t), s });
  }
  out.L = L;
  return out;
}
function sampleBezier(p0, p1, p2, p3, n = 24) {
  const raw = [];
  for (let i = 0; i <= 80; i++) raw.push(bez(pt(p0), pt(p1), pt(p2), pt(p3), i / 80));
  return resample(raw, n);
}
function resample(raw, n) {
  const cum = [0];
  for (let i = 1; i < raw.length; i++) cum.push(cum[i - 1] + Math.hypot(raw[i].x - raw[i - 1].x, raw[i].y - raw[i - 1].y));
  const L = cum[cum.length - 1], out = [];
  let j = 1;
  for (let k = 0; k <= n; k++) {
    const s = L * k / n;
    while (j < cum.length - 1 && cum[j] < s) j++;
    const t = (s - cum[j - 1]) / ((cum[j] - cum[j - 1]) || 1);
    out.push({ x: lerp(raw[j - 1].x, raw[j].x, t), y: lerp(raw[j - 1].y, raw[j].y, t), s });
  }
  out.L = L;
  return out;
}
/* normals for a sampled spine */
function normals(sp) {
  return sp.map((p, i) => {
    const a = sp[Math.max(0, i - 1)], b = sp[Math.min(sp.length - 1, i + 1)];
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    return { x: -dy / l, y: dx / l, tx: dx / l, ty: dy / l };
  });
}
/* segment intersection (proper crossing only) */
function segX(a, b, c, d) {
  const rx = b.x - a.x, ry = b.y - a.y, sx = d.x - c.x, sy = d.y - c.y;
  const den = rx * sy - ry * sx;
  if (Math.abs(den) < 1e-9) return null;
  const t = ((c.x - a.x) * sy - (c.y - a.y) * sx) / den, u = ((c.x - a.x) * ry - (c.y - a.y) * rx) / den;
  return t > 1e-6 && t < 1 - 1e-6 && u > 1e-6 && u < 1 - 1e-6 ? { x: a.x + t * rx, y: a.y + t * ry } : null;
}
/* cut the little loops an offset curve makes on the inside of a tight bend; the crossing becomes a sharp crease */
function deloop(P, win = 40) {
  const out = P.slice();
  for (let i = 0; i < out.length - 3; i++) {
    for (let j = Math.min(out.length - 2, i + win); j > i + 1; j--) {
      const X = segX(out[i], out[i + 1], out[j], out[j + 1]);
      if (X) { out.splice(i + 1, j - i, { x: X.x, y: X.y, c: true }); break; }
    }
  }
  return out;
}
/* Thick tube around a sampled spine. width(t) gives half-width for t in [0,1].
   caps: 'round' | 'flat'. fuzz(i,t) -> [addLeft, addRight] makes fluffy spikes (marked as corners). */
function tubePts(sp, width, capStart = 'round', capEnd = 'round', fuzz = null) {
  const N = normals(sp), n = sp.length;
  const left = [], right = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const w = width(t);
    let fl = 0, fr = 0;
    if (fuzz) { const f = fuzz(i, t); fl = f[0]; fr = f[1]; }
    left.push({ x: sp[i].x + N[i].x * (w + fl), y: sp[i].y + N[i].y * (w + fl), c: fl > 0 });
    right.push({ x: sp[i].x - N[i].x * (w + fr), y: sp[i].y - N[i].y * (w + fr), c: fr > 0 });
  }
  const cap = (p, nn, w, dir) => {
    const out = [];
    for (let k = 1; k < 6; k++) {
      const a = Math.PI * k / 6, ca = Math.cos(a), sa = Math.sin(a);
      out.push({ x: p.x + nn.x * w * ca + nn.tx * dir * w * sa, y: p.y + nn.y * w * ca + nn.ty * dir * w * sa });
    }
    return out;
  };
  if (capStart === 'flat') { left[0].c = true; right[0].c = true; }
  if (capEnd === 'flat') { left[n - 1].c = true; right[n - 1].c = true; }
  const L2 = deloop(left), R2 = deloop(right);
  left.length = 0; left.push(...L2); right.length = 0; right.push(...R2);
  const endCap = capEnd === 'round' ? cap(sp[n - 1], N[n - 1], width(1), 1) : [];
  const nn = N[0];
  const startCap = capStart === 'round' ? cap(sp[0], { x: -nn.x, y: -nn.y, tx: nn.tx, ty: nn.ty }, width(0), -1) : [];
  return { body: [...left, ...endCap, ...right.slice().reverse()], start: startCap };
}
function tube(sp, width, capStart = 'round', capEnd = 'round', fuzz = null) {
  const t = tubePts(sp, width, capStart, capEnd, fuzz);
  return smooth([...t.body, ...t.start], true);
}
/* open outline of a tube (no line across the flat start) */
function tubeOpen(sp, width, capEnd = 'round') {
  return smooth(tubePts(sp, width, 'flat', capEnd).body, false);
}


/* 2-bone IK. bend: +1 / -1 picks elbow side. Returns elbow & (clamped) wrist */
function ik(S0, T, L1, L2, bend) {
  const dx = T.x - S0.x, dy = T.y - S0.y;
  let d = Math.hypot(dx, dy);
  d = clamp(d, Math.abs(L1 - L2) + 0.5, L1 + L2 - 0.5);
  const a = Math.atan2(dy, dx);
  const A = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const ang = a + bend * A;
  return { E: { x: S0.x + Math.cos(ang) * L1, y: S0.y + Math.sin(ang) * L1 }, W: { x: S0.x + Math.cos(a) * d, y: S0.y + Math.sin(a) * d } };
}
/* sub-polyline from start up to arc length s */
function cutPolyline(pts, s) {
  const out = [pts[0]];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], l = Math.hypot(b.x - a.x, b.y - a.y);
    if (acc + l >= s) { const t = (s - acc) / l; out.push({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }); return out; }
    acc += l; out.push(b);
  }
  return out;
}
const plen = pts => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return L; };

/* ---------- SVG snippets ---------- */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const attrs = o => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== false).map(([k, v]) => `${k}="${v}"`).join(' ');
const path = (d, o = {}) => `<path d="${d}" ${attrs(o)}/>`;
const circ = (x, y, r, o = {}) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" ${attrs(o)}/>`;
const ell = (x, y, rx, ry, o = {}) => `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(rx)}" ry="${r1(ry)}" ${attrs(o)}/>`;
const g = (inner, o = {}) => `<g ${attrs(o)}>${inner}</g>`;
/* line-art stroke */
const ln = (d, col, w = 2, o = {}) => path(d, { fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...o });
/* stitch line (dashed) */
const stitch = (d, col, w = 1.4, o = {}) => path(d, { fill: 'none', stroke: col, 'stroke-width': w, 'stroke-dasharray': '3.2 2.6', 'stroke-linecap': 'round', ...o });

/* deterministic pseudo random (for sparkles etc.) */
function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
