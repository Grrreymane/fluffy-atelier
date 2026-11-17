/* ===== wear_base.js — garment shape helpers + base underlayers ===== */
/* torso garment (right half points). o: neck ('crew'|'v'|'scoop'|'square'|'turtle'|'wide'|'collar'), hem, ease, sleeveless, flare, vDepth */
function topRight(K, o = {}) {
  const e = o.ease ?? 3, hem = o.hem ?? 462, fl = o.flare ?? 0;
  const pts = [];
  switch (o.neck || 'crew') {
    case 'crew': pts.push([CX, 302], [CX + K.neck + 3, 297]); break;
    case 'v': pts.push([CX, o.vDepth || 340, 1], [CX + K.neck + 5, 296, 1]); break;
    case 'scoop': pts.push([CX, 320], [CX + K.neck + 10, 301, 1]); break;
    case 'square': pts.push([CX, 326, 1], [CX + 22, 326, 1], [CX + 24, 304, 1]); break;
    case 'turtle': pts.push([CX, 296], [CX + K.neck + 4, 292]); break;
    case 'wide': pts.push([CX, 312], [CX + K.neck + 14, 304, 1]); break;
    case 'collar': pts.push([CX, 296, 1], [CX + K.neck + 3, 292]); break;
  }
  if (o.sleeveless) {
    const strap = o.strap ?? 10;
    const sx = Math.min(CX + K.sh - 14, pts[pts.length - 1][0] + strap);
    pts.push([sx, 302, 1], [CX + K.sh - 7, 306, 1], [CX + K.sh - 10, 330], [CX + K.ch + e - 1, 362]);
  } else {
    // shoulder line runs out to the shoulder point; the armhole below it is covered by the set-in sleeve
    pts.push([CX + K.sh - 12, 303.5], [CX + K.sh + 1, 311], [CX + K.sh - 1, 328], [CX + K.ch + e + 1, 349], [CX + K.ch + e, 370]);
  }
  // an untucked top hangs over the trousers, so it is never narrower than the waistband / hips under it;
  // a tucked top or a dress bodice may follow the waist
  const fitted = o.fit === 'fitted' || K.tucked;
  const cover = y => fitted || y < 400 ? 0 : Math.max(torsoHalfAt(K, Math.min(y, 452)), y >= 452 ? K.hi : 0) + 7.5;
  const at = (y, x) => [CX + Math.max(x, cover(y)), y];
  if (o.boxy) {
    pts.push(at(410, K.ch + e + fl * .5), [...at(hem, K.ch + e + fl + 1), 1]);
    pts.push([CX, hem + 1.5]);
    return pts;
  }
  const waist = fitted ? lerp(K.wa, K.ch, .35) : lerp(K.wa, K.ch, .85);
  pts.push(at(412, waist + e + fl * .3), at(452, Math.max(K.hi, waist) + e + fl * .7));
  if (hem > 452) pts.push([...at(hem, Math.max(K.hi, waist) + e + fl + 1), 1]); else pts[pts.length - 1][2] = 1;
  pts.push([CX, hem + 1.5]);
  return pts;
}
/* bottoms: pants/shorts outline. o: waist(y), hem(y), ease, flare(extra half width at hem), cuff */
function pantsRight(K, o = {}) {
  const e = o.ease ?? 3, wY = o.waist ?? 410, hem = o.hem ?? 668, fl = o.flare ?? 0;
  const pts = [[CX, wY], [CX + K.wa + e, wY, 1], [CX + lerp(K.wa, K.hi, .5) + e, 432], [CX + K.hi + e, 452]];
  const ys = [490, 530, 570, 610, 650].filter(y => y < hem - 8);
  const fAt = y => fl * clamp((y - 480) / (hem - 480), 0, 1);
  for (const y of ys) pts.push([CX + legEdgeAt(K, y).o + e + fAt(y), y]);
  const eh = legEdgeAt(K, hem);
  const cy = o.crotch ?? Y.crotch + 6;
  // the two legs part below the crotch: inner edge never closer to the centre than this V
  const nIn = o.notch ?? 4;
  const minIn = y => lerp(1.2, nIn, clamp((y - cy) / Math.max(1, hem - cy), 0, 1));
  pts.push([CX + eh.o + e + fl, hem, 1], [CX + Math.max(minIn(hem), eh.i - e * .6 - fl * .5), hem + 1, 1]);
  for (const y of ys.slice().reverse()) if (y > cy + 6) pts.push([CX + Math.max(minIn(y), legEdgeAt(K, y).i - e * .6 - fAt(y) * .5), y]);
  pts.push([CX + 1.2, cy, 1], [CX, cy]);
  return pts;
}
/* skirt outline. o: waist, hem, ease, flare (hem half width beyond hip) */
function skirtRight(K, o = {}) {
  const e = o.ease ?? 3, wY = o.waist ?? 410, hem = o.hem ?? 530, fl = o.flare ?? 20;
  const hipW = Math.max(K.hi, K.wa) + e;
  const wW = Math.max(K.wa, torsoHalfAt(K, wY));
  return [[CX, wY], [CX + wW + e, wY, 1], [CX + lerp(K.wa, hipW, .7) + e * .3, 436], [CX + hipW + fl * .35, 466], [CX + hipW + fl, hem, 1], [CX, hem + 4]];
}
/* paint a symmetric garment */
function garment(env, it, right, o = {}) {
  const d = S(right);
  // an untucked top shades the trousers / skirt just under its hem
  const cast = it.def.slot === 'top' && !env.K.tucked && env.castOnHips ? dropShadow(d, env.castOnHips) : '';
  return cast + paint(env.ctx, d, o.col || it.c1, { pat: o.noPat ? null : it.patUrl, shade: o.shade, extra: o.extra, sw: o.sw });
}
/* shirt collar, as in the reference: a stand (band) round the neck that closes on the top button, and two wings
   folded over it that lie flat and spread out over the collarbones. Right wing; the left one is its mirror.
   o.wide: wider spread, o.point: narrow point collar (shows inside a jacket's lapels), o.long: longer points */
function collarWing(K, o = {}) {
  const w = K.neck, d = (w - 17) * .6;
  if (o.point) return [[CX + 2.5, 303, 1], [CX + w + 1.5, 288], [CX + w + 4, 296], [CX + 15.5 + d, o.long ? 328 : 323, 1], [CX + 4.5, 309.5, 1]];
  const sp = (o.wide ? 36 : 31.5) + d, py = o.long ? 331 : 325;
  return [[CX + 2.5, 303, 1], [CX + w + 1.5, 288], [CX + sp, 298], [CX + sp, py, 1], [CX + 4.5, 309.5, 1]];
}
/* o.pat: fabric pattern, o.buttonDown: little buttons under the points, o.stitch: topstitch colour */
function shirtCollar(ctx, K, col, o = {}) {
  const w = K.neck, lc = lineOf(col), R = collarWing(K, o);
  const band = smooth([[CX - w - 2, 283.5, 1], [CX - w * .45, 292.5], [CX, 297], [CX + w * .45, 292.5], [CX + w + 2, 283.5, 1], [CX + w + 3.5, 291, 1], [CX + w * .5, 300], [CX, 305],
    [CX - w * .5, 300], [CX - w - 3.5, 291, 1]]);
  // topstitch: the wing outline pulled in towards its middle
  const inset = pts => { const mx = pts.reduce((a, p) => a + p[0], 0) / pts.length, my = pts.reduce((a, p) => a + p[1], 0) / pts.length; return smooth(pts.map(([x, y, c]) => [r1(mx + (x - mx) * .84), r1(my + (y - my) * .84), c])); };
  const tone = o.stitch || lighten(col, .3);
  let s = paint(ctx, band, shadeOf(col, .05), { pat: o.pat, shade: false, sw: 2.2 }) + circ(CX, 300.5, 2.2, { fill: lighten(col, .5), stroke: lc, 'stroke-width': 1.1 });
  const L = R.map(([x, y, c]) => [mirX(x), y, c]);
  for (const pts of [R, L]) {
    const d = smooth(pts);
    // the wing lies on the shirt: a thin cast shadow down-right of it (light from the upper left)
    s += path(d, shadowFill(.14, { transform: 'translate(1.6,2.2)' })) + paint(ctx, d, col, { pat: o.pat, shade: false, sw: 2.3, extra: stitch(inset(pts), tone, .9) });
  }
  if (o.buttonDown) for (const p of [R[3], L[3]]) s += circ(r1(lerp(p[0], CX, .13)), p[1] - 4.5, 1.8, { fill: lighten(col, .5), stroke: lc, 'stroke-width': 1 });
  return s;
}
function hoodBack(ctx, K, col) {
  const d = S([[CX, 262], [CX + 26, 263], [CX + 44, 270], [CX + K.neck + 36, 284], [CX + K.neck + 40, 300], [CX + K.neck + 30, 314], [CX, 316]]);
  const fold = S([[CX, 280], [CX + K.neck + 10, 280], [CX + K.neck + 24, 288], [CX + K.neck + 26, 300], [CX, 300]]);
  return paint(ctx, d, col, { shade: false, extra: path(fold, { fill: shadeOf(col, .14) }) + ln(`M${CX + K.neck + 30},286Q${CX + K.neck + 34},296 ${CX + K.neck + 31},306M${CX - K.neck - 30},286Q${CX - K.neck - 34},296 ${CX - K.neck - 31},306`, lineOf(col), 1.3, { opacity: .5 }) });
}
/* soft fold shadows on a woven top, as in the reference: crescents running from under the arms down towards the
   waist, deeper on the right (away from the light); multiplied on like every shadow (pass inside the garment's extra) */
function sideFolds(K, hem = 466, k = 1) {
  const one = (s, depth) => {
    const X = x => r1(CX + s * x), a = K.ch - 1, b = K.ch + 2;
    return path(`M${X(a)},356Q${X(a - 13)},384 ${X(a - 20)},${416}Q${X(a - 9)},388 ${X(a)},356Z`, shadowFill(depth * k))
      + path(`M${X(b)},402Q${X(b - 16)},${(402 + hem) / 2 + 4} ${X(b - 30)},${hem - 6}Q${X(b - 12)},${(402 + hem) / 2 - 2} ${X(b)},402Z`, shadowFill(depth * .9 * k));
  };
  return one(1, .1) + one(-1, .06);
}
function buttons(xs, ys, col, r = 2.6) {
  let s = '';
  for (const y of ys) for (const x of xs) s += circ(x, y, r, { fill: col, stroke: lineOf(col), 'stroke-width': 1.2 });
  return s;
}
function pocket(x, y, w, h, col, o = {}) {
  const lc = lineOf(col);
  let s = path(`M${x},${y}h${w}v${h - 4}q0,4 -4,4h${-(w - 8)}q-4,0 -4,-4z`, { fill: o.fill || 'none', stroke: lc, 'stroke-width': 1.8, 'stroke-linejoin': 'round' });
  if (o.pleat) s += ln(`M${x + w / 2 - 3},${y + 6}V${y + h - 1}M${x + w / 2 + 3},${y + 6}V${y + h - 1}`, lc, 1.1, { opacity: .45 });
  // the flap lies on the pocket: a thin cast shadow under it
  if (o.flap) s += path(`M${x - 1},${y - 1}h${w + 2}v7q-${(w + 2) / 2},5 -${w + 2},0z`, shadowFill(.14, { transform: 'translate(1,2.2)' }))
    + path(`M${x - 1},${y - 1}h${w + 2}v7q-${(w + 2) / 2},5 -${w + 2},0z`, { fill: o.flapFill || col, stroke: lc, 'stroke-width': 1.8, 'stroke-linejoin': 'round' })
    + (o.flapButton ? circ(x + w / 2, y + 6.5, 2.8, { fill: o.flapButton, stroke: lineOf(o.flapButton), 'stroke-width': 1.1 }) : circ(x + w / 2, y + 6, 1.6, { fill: lc }));
  if (o.stitch) s += stitch(`M${x + 2.5},${y + 2.5}v${h - 6}M${x + w - 2.5},${y + 2.5}v${h - 6}`, o.stitch, 1.1);
  return s;
}

/* ---- base layers, used when slots are empty ---- */
BASE_ITEMS.push(
  { id: 'basetank', name: '打底背心', c1: '#fdf5e9', tags: [], draw: (env, it) => garment(env, it, topRight(env.K, { neck: 'scoop', sleeveless: true, hem: 458, strap: 9 })) },
  { id: 'baseshorts', name: '打底短裤', c1: '#cbbfb5', tags: [], draw: (env, it) => garment(env, it, pantsRight(env.K, { hem: 500, ease: 2.5 })) },
);
