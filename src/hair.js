/* ===== hair.js — 前发 / 后发 (front hair and back hair) =====
   前发 (front hair): '天然' keeps the species' own little tuft; the six short styles are traced from the hairstyle
   reference sheet (hair_data.js) on the fox head and moved onto the wearer's skull (TOON_HEADS), so one drawing fits
   all seven species. They are drawn over the face and brows (layer hairFront).
   后发 (back hair): long hair hanging behind the head, body and arms (layer hairBack, in head coordinates and bobbing
   with the head). Only its outline is traced from the long-hair references; it is shaded with one top-to-bottom
   gradient. A back style can only be worn together with a front style.
   Look: one ink line, flat fill in the fur colour, darker strands and cel shadow inside, no white shine. */
const HAIRS = [];
const HAIR_INDEX = {};
const HAIR_STYLES = {};
function hairDef(id, name, tags, o = {}) {
  const h = { id, name, tags, lift: o.lift || 0 };
  HAIRS.push(h); HAIR_INDEX[id] = h;
  if (o.draw) HAIR_STYLES[id] = Object.assign(h, { draw: o.draw });
}
const BACK_HAIRS = [];
const BACK_INDEX = {};
function backDef(id, name, tags, draw) { const h = { id, name, tags, draw }; BACK_HAIRS.push(h); BACK_INDEX[id] = h; }
/* under a hat that covers the head, hair above this line (head coordinates) is tucked inside the hat */
const HAIR_CUT = 150;

/* the wearer's head, for hair: skull top T, and conversions from body coordinates (for long hair) */
function hairFit(st, K) {
  const kind = headKindOf(st);
  return { kind, K, T: TOON_HEADS[kind].right[0][1] };
}
const hairInk = F => mix(F.main, F.line, .62);

/* move a point traced on the fox head onto the wearer's skull: offsets inside the skull scale with its width,
   hair beyond the skull keeps its overhang, and the crown follows the skull top */
function warpTo(H) {
  if (H.kind === 'fox') return p => p;
  const Tf = TOON_HEADS.fox.right[0][1], dT = H.T - Tf;
  return ([x, y, c]) => {
    const yy = clamp(y, Tf, 290), sf = skullX('fox', yy) - 200, sk = skullX(H.kind, yy) - 200;
    const d = x - 200, ad = Math.abs(d);
    const nd = ad <= sf ? ad * sk / sf : sk + (ad - sf);
    const ny = y < 224 ? y + dT * clamp((224 - y) / (224 - Tf), 0, 1.3) : y;
    return [r1(200 + Math.sign(d) * nd), r1(ny), c];
  };
}
/* a hand-inked stroke along a polyline: widest in the middle, tapering to points at both ends */
function taperD(pts, w) {
  const sp = samplePolyline(smoothPts(pts), 2.5, 4), n = sp.length;
  if (n < 3) return '';
  const N = normals(sp), L = [], R = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), ww = w * Math.pow(Math.sin(Math.PI * t), .6);
    L.push([sp[i].x + N[i].x * ww, sp[i].y + N[i].y * ww]); R.push([sp[i].x - N[i].x * ww, sp[i].y - N[i].y * ww]);
  }
  return smooth([[sp[0].x, sp[0].y, 1], ...L.slice(1, -1), [sp[n - 1].x, sp[n - 1].y, 1], ...R.slice(1, -1).reverse()]);
}
/* Catmull-Rom points of an open polyline (so a simplified trace bends smoothly) */
function smoothPts(pts) {
  if (pts.length < 3) return pts;
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < 4; k++) {
      const t = k / 4, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
/* x of the left- or rightmost crossing of the polygons at height y (null if none) */
function polyEdgeX(polys, y, side) {
  let best = null;
  for (const P of polys) for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length];
    if ((a[1] - y) * (b[1] - y) > 0 || a[1] === b[1]) continue;
    const x = a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]);
    if (best === null || (side < 0 ? x < best : x > best)) best = x;
  }
  return best;
}
/* fur filling the gap between the hair and the side of the skull, on both sides, down to the temples */
function gapFill(H, polys, F) {
  const T = TOON_HEADS[H.kind].right[0][1] + 6;
  let d = '';
  for (const side of [-1, 1]) {
    const outer = [], inner = [];
    for (let y = T; y <= 208; y += 3) {
      const hx = polyEdgeX(polys, y, side), sk = 200 + side * (skullX(H.kind, y) - 200);
      // a tuft flaring far out from the head leaves a gap open to the background: filling it drew a flat patch of fur
      // with no outline, so only narrow gaps (hair lying close along the skull) are filled
      const gap = hx === null ? 0 : side * (hx - sk);
      if (gap <= 1.5 || gap > 12) { if (outer.length) break; continue; }
      outer.push([r1(hx - side * 1.6), y]); inner.push([r1(sk - side * 3), y]);
    }
    if (outer.length > 2) d += smooth([...outer, ...inner.reverse()].map(([x, y], i, a) => [x, y, i === 0 || i === a.length - 1 || i === outer.length - 1 || i === outer.length ? 1 : 0]));
  }
  return d ? path(d, { fill: F.main }) : '';
}

/* ---------- 前发 ---------- */
/* a traced front style: the traced silhouette with the traced shading, strand strokes and inner ink lines inside it
   (all closed shapes, so the hand-drawn taper of each stroke survives), plus optional hand-placed lines L
   (L.s strands, L.k ink lines). D.open lists edges that melt into the forehead: no outline is drawn along them. */
function tracedHair(ctx, F, H, D, L = {}, o = {}) {
  const w = warpTo(H), P = pts => pts.map(w), shapes = list => list.map(s => smooth(P(s))).join('');
  let inner = '';
  if (D.shadows) inner += path(shapes(D.shadows), shadowFill(o.shadow ?? .22));
  if (D.strands) inner += path(shapes(D.strands), { fill: hairInk(F) });
  if (D.inks) inner += path(shapes(D.inks), { fill: F.line });
  if (L.s) inner += path(L.s.map(l => taperD(P(l), o.strandW ?? 2)).join(''), { fill: hairInk(F) });
  if (L.k) inner += path(L.k.map(l => taperD(P(l), o.inkW ?? 2.1)).join(''), { fill: F.line });
  let lineMask = null;
  if (D.open) {
    const k = ctx.next('ho');
    ctx.def(k, `<mask id="__ID__" maskUnits="userSpaceOnUse" x="-100" y="-100" width="600" height="600"><rect x="-100" y="-100" width="600" height="600" fill="#fff"/>${D.open.map(l => `<path d="${smooth(P(l), false)}" fill="none" stroke="#000" stroke-width="9" stroke-linecap="round"/>`).join('')}</mask>`);
    lineMask = ctx.url(k);
  }
  // where the hair stands off the side of the skull (the reference heads are rounder than ours), fill the gap
  // underneath with fur so the hair sits on the head instead of floating over the ears
  const fillUnder = o.fillGap === false ? '' : gapFill(H, D.outer.map(P), F);
  return fillUnder + D.outer.map(pts => {
    const sid = ctx.shape(smooth(P(pts)));
    return g(use(sid, { fill: F.main }) + inner, { 'clip-path': ctx.clipUse(sid) })
      + use(sid, Object.assign({ fill: 'none', stroke: F.line, 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, lineMask ? { mask: lineMask } : {}));
  }).join('');
}

hairDef('none', '天然', []);
/* 慵懒中分: curtain fringe parted in the middle; each side sweeps out and flicks up past the cheek.
   Its strand and ink lines were placed by hand on the tracing. */
const CURTAIN_LINES = {
  s: [[[154.4, 130.8], [165.4, 119.3], [179, 112.5], [199.3, 108.8]], [[148, 140.7], [140, 151.2], [129.8, 161.4], [118, 171.5]],
    [[151.9, 176.6], [143.4, 186.8], [134.1, 196.1]], [[220.3, 125.8], [228.8, 117.6], [242.4, 115.3], [254.2, 120.7], [260.2, 126.6]],
    [[278.8, 152.9], [286.4, 163.9], [296.6, 174.9], [305.1, 182.5]], [[261.9, 186.8], [266.1, 195.3]]],
  k: [[[96.8, 196.6], [104.4, 198.6], [118, 200.7], [131.5, 200.3]], [[215.3, 125.8], [214.8, 138], [213.4, 149.5]]],
};
const frontStyle = (key, lines, o) => (ctx, st, F, H) => ({ front: tracedHair(ctx, F, H, HAIR_TRACE[key], lines, o) });
hairDef('curtain', '慵懒中分', ['casual', 'vintage', 'street', 'cool'], { lift: 10, draw: frontStyle('curtain', CURTAIN_LINES, { fillGap: false }) });
hairDef('swirl', '奶油旋卷', ['vintage', 'classic', 'elegant', 'preppy'], { lift: 16, draw: frontStyle('swirl') });
hairDef('sweep', '轻盈侧扫', ['preppy', 'casual', 'office', 'sweet'], { lift: 8, draw: frontStyle('sweep') });
hairDef('shag', '层叠短绒', ['street', 'casual', 'cool', 'sporty'], { lift: 10, draw: frontStyle('shag') });
hairDef('swept', '疾风后掠', ['cool', 'street', 'sporty', 'party'], { lift: 22, draw: frontStyle('swept') });
hairDef('cloud', '云朵刘海', ['cute', 'sweet', 'fantasy', 'casual'], { lift: 10, draw: frontStyle('cloud') });

/* ---------- 后发 ---------- */
/* traced (fox, girl) coordinates -> the wearer: around the head follow the skull, below the neck follow the body width */
function warpBack(H) {
  const sk = warpTo(H), K = H.K;
  const kBody = (Math.max(K.hi, K.ch) + K.arm + 24) / 84;           // how far out the hanging arms are, vs the girl body
  return ([x, y, c]) => {
    const a = sk([x, y, c]), wHead = clamp((250 - y) / 40, 0, 1);
    const f = lerp(1, kBody, clamp((y - 240) / 80, 0, 1));
    return [r1(lerp(200 + (x - 200) * f, a[0], wHead)), r1(lerp(y, a[1], wHead)), c];
  };
}
/* the skull cap of the back hair: a dome behind the head that meets the traced sheet where the sheet's (cut-off)
   top begins, exactly as wide as the sheet there, its sides running down into the sheet */
const BACK_TOP = 205, BACK_JOIN = 212;
function backCap(H, polys) {
  const T = TOON_HEADS[H.kind].right[0][1] - 7;
  let half = 0;
  for (const y of [BACK_TOP + 1, (BACK_TOP + BACK_JOIN) / 2, BACK_JOIN]) for (const sd of [-1, 1]) { const x = polyEdgeX(polys, y, sd); if (x !== null) half = Math.max(half, Math.abs(x - 200)); }
  half = Math.max(half, skullX(H.kind, BACK_JOIN) - 200 + 8);
  // the sheet flares out below the head: if the dome stayed as narrow as the sheet's top, the hair's outer edge
  // curved in to the cheek with a notch under the front hair. So the dome is as wide as the sheet gets just below
  // (per side), and each side runs straight down until it meets the sheet
  const side = sd => { let w = half, yMeet = BACK_JOIN + 12;
    for (let y = BACK_JOIN; y <= 262; y += 3) { const x = polyEdgeX(polys, y, sd); if (x === null) continue; const ww = Math.abs(x - 200);
      if (ww > w) { w = ww; yMeet = y + 4; } }
    return { w, yMeet }; };
  const L = side(-1), R = side(1);
  const b = BACK_JOIN - T, pts = [];
  for (let i = 0; i <= 16; i++) { const a = Math.PI * i / 16, w = i < 8 ? L.w : i > 8 ? R.w : (L.w + R.w) / 2; pts.push([r1(200 - Math.cos(a) * w), r1(BACK_JOIN - Math.sin(a) * b)]); }
  return smooth([[r1(200 - L.w), L.yMeet, 1], ...pts, [r1(200 + R.w), R.yMeet, 1], [r1(200 + R.w - 14), R.yMeet + 10, 1], [r1(200 - L.w + 14), L.yMeet + 10, 1]]);
}

/* the back hair: the traced sheet (its flat cut-off top hidden under the skull cap) and the cap, filled as one shape
   (outlines under the fills, so no seam shows). It is behind the head and body, so all of it is in shadow: the
   colour multiplied by the shadow lilac once (worked out here, as the hair is one flat colour); towards the
   middle, behind the body, it deepens to a second multiply:
   darkest in the middle, lighter towards the outer edges */
function tracedBack(ctx, F, H, D) {
  const w = warpBack(H);
  const polys = D.outer.map(p => p.map(w));
  const sheet = polys.map(p => smooth(p)), cap = backCap(H, polys);
  const half = r1(Math.max(...polys.flat().map(p => Math.abs(p[0] - 200))));
  const s1 = multiplyHex(F.main, SHADOW_TINT), s2 = multiplyHex(s1, SHADOW_TINT);
  const gid = ctx.def(`bhg-${half}-${s1.slice(1)}`, `<linearGradient id="__ID__" gradientUnits="userSpaceOnUse" x1="${200 - half}" y1="0" x2="${200 + half}" y2="0"><stop offset="0" stop-color="${s1}"/><stop offset=".5" stop-color="${s2}"/><stop offset="1" stop-color="${s1}"/></linearGradient>`);
  const ink = d => path(d, { fill: 'none', stroke: F.line, 'stroke-width': 5.2, 'stroke-linejoin': 'round' });
  const fill = d => path(d, { fill: `url(#${gid})` });
  const below = ctx.clip(`M-300,${BACK_TOP}H700V1400H-300Z`);
  return ink(cap) + g(sheet.map(ink).join(''), { 'clip-path': below }) + fill(cap) + g(sheet.map(fill).join(''), { 'clip-path': below });
}
const backStyle = key => (ctx, st, F, H) => tracedBack(ctx, F, H, HAIR_BACK_TRACE[key]);
backDef('none', '无', []);
backDef('straight', '柔顺长直', ['elegant', 'sweet', 'classic', 'preppy'], backStyle('straight'));
backDef('wavy', '蓬松长卷', ['sweet', 'elegant', 'vintage', 'party'], backStyle('wavy'));
backDef('wolf', '层次狼尾', ['cool', 'street', 'casual', 'sporty'], backStyle('wolf'));

/* ---------- drawing ---------- */
/* is a back style worn? (only together with a front style) */
const wearsBackHair = st => !!(st.hair && HAIR_STYLES[st.hair.id] && st.backHair && BACK_INDEX[st.backHair.id] && BACK_INDEX[st.backHair.id].draw);
function drawHair(env, add) {
  const { ctx, st, F, K } = env;
  const S = st.hair && HAIR_STYLES[st.hair.id];
  if (!S) return;
  const H = hairFit(st, K);
  const front = S.draw(ctx, st, F, H).front;
  const back = wearsBackHair(st) ? BACK_INDEX[st.backHair.id].draw(ctx, st, F, H) : '';
  const hat = st.wear && st.wear.hat && ITEM_INDEX.hat[st.wear.hat.id];
  // under a hat that covers the head the top of the hair is tucked inside it. The cut runs level across the skull
  // under the hat, then slopes down and out past the skull's sides, so the side tufts tuck up under the hat's edge
  // instead of poking out beside it with a flat top; where the cut crosses the hair it gets the hair's ink line
  let cut = null, cutInk = '';
  if (hat && hat.covers) {
    const y0 = HAIR_CUT + 14, w = skullX(H.kind, y0) - 200 + 1;
    const edge = `M${r1(200 - w - 70)},${y0 + 70}L${r1(200 - w)},${y0}L${r1(200 + w)},${y0}L${r1(200 + w + 70)},${y0 + 70}`;
    cut = ctx.clip(edge + 'L700,1400L-300,1400Z');
    const D = HAIR_TRACE[st.hair.id];
    if (D) { const wp = warpTo(H); cutInk = g(ln(edge, F.line, 5.2), { 'clip-path': ctx.clipAll(D.outer.map(q => smooth(q.map(wp)))) }); }
  }
  const keep = (s, ink = '') => cut ? g(s + ink, { 'clip-path': cut }) : s;
  if (back) add('hairBack', `<g class="headgrp"><g transform="${HEAD_TF}">${keep(back)}</g></g>`);
  let f = front;
  // round bear ears and the deer's side ears would vanish into the hair: they grow out through it, so draw them
  // again over the hair, except where the skull covers them
  if (['bear', 'deer'].includes(headKindOf(st))) {
    const k = ctx.next('em');
    ctx.def(k, `<mask id="__ID__" maskUnits="userSpaceOnUse" x="-100" y="-100" width="600" height="600"><rect x="-100" y="-100" width="600" height="600" fill="#fff"/><path d="${toonHeadPath(headKindOf(st), '_hat', [])}" fill="#000"/></mask>`);
    f += g(drawEars(ctx, st, F), { mask: ctx.url(k) });
  }
  add('hairFront', keep(f, cutInk));
}
