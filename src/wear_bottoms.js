/* ===== wear_bottoms.js — bottoms & one-pieces ===== */
function waistband(K, col, o = {}) {
  const e = o.ease ?? 3, y = o.y ?? 410, h = o.h ?? 12;
  const w = Math.max(K.wa, torsoHalfAt(K, y + h * .5)) + e;
  const band = `M${CX - w},${y}L${CX + w},${y}L${CX + w + .8},${y + h}L${CX - w - .8},${y + h}Z`;
  let s = (o.cast === false ? '' : path(band, shadowFill(.12, { transform: 'translate(.8,2.4)' }))) + flat(band, shadeOf(col, .06), lineOf(col), 2.2);
  if (o.loops) for (const x of [-w + 8, -20, 20, w - 8]) s += path(`M${CX + x - 2},${y - 1}h4v${h + 3}h-4z`, { fill: shadeOf(col, .1), stroke: lineOf(col), 'stroke-width': 1 });
  if (o.button) s += circ(CX, y + h / 2, 3, { fill: o.button, stroke: lineOf(o.button), 'stroke-width': 1.2 });
  return s;
}
function pantsDetails(K, it, o = {}) {
  const lc = lineOf(it.c1), e = o.ease ?? 3;
  let s = '';
  if (o.fly !== false) s += ln(`M${CX + 7},${424}V${470}Q${CX + 6},${480} ${CX},${484}`, lc, 1.5, { opacity: .6 });
  if (o.pockets !== false) {
    // the pocket mouth: a slim shadow just inside the curve, then the curve itself
    for (const s2 of [-1, 1]) { const X = d => r1(CX + s2 * d);
      s += path(`M${X(K.wa - 5)},423Q${X(K.wa + 2)},440 ${X(K.hi + e - 1)},452L${X(K.hi + e - 1)},446Q${X(K.wa + 4)},436 ${X(K.wa - 1)},423Z`, shadowFill(.1)); }
    s += ln(`M${CX - K.wa + 5},423Q${CX - K.wa - 2},440 ${CX - K.hi - e + 1},452M${CX + K.wa - 5},423Q${CX + K.wa + 2},440 ${CX + K.hi + e - 1},452`, lc, 1.6, { opacity: .7 });
  }
  // V folds pulling out from the crotch, as in the reference
  if (o.crotch !== false) { const cy = o.crotchY ?? Y.crotch + 6;
    s += path(`M${CX - 2},${cy - 4}Q${CX - 12},${cy - 18} ${CX - 26},${cy - 26}Q${CX - 12},${cy - 14} ${CX - 3},${cy + 2}Z`, shadowFill(.06))
      + path(`M${CX + 2},${cy - 4}Q${CX + 14},${cy - 16} ${CX + 30},${cy - 22}Q${CX + 14},${cy - 10} ${CX + 3},${cy + 2}Z`, shadowFill(.1)); }
  if (o.crease) for (const s2 of [-1, 1]) { const a = legEdgeAt(K, 470), b = legEdgeAt(K, o.hem - 4); s += ln(`M${CX + s2 * (a.o + a.i) / 2},470L${CX + s2 * ((b.o + b.i) / 2)},${o.hem - 4}`, lc, 1.3, { opacity: .45 }); }
  // soft folds where the cloth bends over the knee (clipped away on shorts)
  if (o.knee !== false) for (const s2 of [-1, 1]) {
    const a = legEdgeAt(K, 582), X = d => r1(CX + s2 * d), m = (a.o + a.i) / 2;
    s += path(`M${X(a.i - e * .5 + 1)},572Q${X(m - 3)},575 ${X(m + 3)},581Q${X(m - 4)},579 ${X(a.i - e * .5 + 1)},576Z`, shadowFill(s2 > 0 ? .08 : .05))
      + ln(`M${X(a.i - e * .5 + 1)},572Q${X(m - 3)},575 ${X(m + 3)},581M${X(a.o + e - 1)},590Q${X(m + 6)},587 ${X(m + 1)},585`, lc, 1.2, { opacity: .32 });
  }
  if (o.stitch) s += stitch(`M${CX + 11},424V468Q${CX + 10},482 ${CX + 2},486`, o.stitch, 1.2) + stitch(`M${CX - K.wa - e + 3},460L${CX - K.wa - e + 3},470M${CX + K.wa + e - 3},460L${CX + K.wa + e - 3},470`, o.stitch, 1.2);
  return s;
}
/* band across one pant leg between y0..y1 (for cuffs) */
function pantCuff(K, y0, y1, e, fl, hem, s, col, o = {}) {
  const fAt = y => fl * clamp((y - 480) / (hem - 480), 0, 1);
  const X = d => CX + s * d;
  const a = legEdgeAt(K, y0), b = legEdgeAt(K, y1);
  const pts = [[X(a.o + e + fAt(y0) + 1.5), y0, 1], [X(b.o + e + fAt(y1) + 1.5), y1, 1], [X(b.i - e * .6 - fAt(y1) * .5 - 1.5), y1, 1], [X(a.i - e * .6 - fAt(y0) * .5 - 1.5), y0, 1]];
  const fold = [[X(a.o + e + fAt(y0) + 1.5), y0], [X(a.i - e * .6 - fAt(y0) * .5 - 1.5), y0], [X(a.i - e * .6 - fAt(y0) * .5 - 1.5), y0 + 3.5], [X(a.o + e + fAt(y0) + 1.5), y0 + 3.5]];
  return path(poly(pts) + 'Z', shadowFill(.12, { transform: 'translate(.6,2.2)' })) + flat(poly(pts) + 'Z', col, lineOf(col), 2.2)
    + path(poly(fold) + 'Z', shadowFill(.08)) + (o.inner || '');
}
/* soft folds on a flared skirt: a fold line from each x0 at the waist out to the hem, with its shadow beside it */
function skirtFolds(K, y0, hem, xs, spread, lc) {
  let s = '';
  for (const x of xs) { const s2 = Math.sign(x), x1 = x + s2 * spread * .4, x2 = x + s2 * spread * .75;
    s += path(`M${CX + x},${y0}Q${CX + x1},${(y0 + hem) / 2} ${CX + x2},${hem}L${CX + x2 + 9},${hem}Q${CX + x1 + 4},${(y0 + hem) / 2} ${CX + x + 1},${y0}Z`, shadowFill(s2 > 0 ? .08 : .05))
      + ln(`M${CX + x},${y0}Q${CX + x1},${(y0 + hem) / 2} ${CX + x2},${hem}`, lc, 1.4, { opacity: .4 }); }
  return s;
}
/* knife-pleated skirt: pleat lines fanning out from the waistband, every other pleat in shadow, zigzag hem */
function pleatSkirt(ctx, K, col, patUrl, o) {
  const { hem, fl, wY } = o;
  let folds = '', shade = '';
  const hx = Math.max(K.hi, K.wa) + 3 + fl, tw = Math.max(K.wa, torsoHalfAt(K, wY)) + 3, fy = wY + 13;
  for (let i = 1; i < 10; i++) {
    const t = i / 10, x0 = lerp(CX - tw, CX + tw, t), x1 = lerp(CX - hx, CX + hx, t);
    folds += `M${r1(x0)},${fy}L${r1(x1)},${hem + (i % 2 ? 5 : 0)}`;
    if (i % 2) shade += `M${r1(x0)},${fy}L${r1(x1)},${hem + 6}L${r1(lerp(CX - hx, CX + hx, t + .1))},${hem + 6}L${r1(lerp(CX - tw, CX + tw, t + .1))},${fy}Z`;
  }
  return paint(ctx, skirtPath(K, { hem, flare: fl, zig: 10, waist: wY }), col, { pat: patUrl, shade: 'skirt', extra: path(shade, shadowFill(.07)) + ln(folds, lineOf(col), 1.4, { opacity: .38 }) });
}
/* skirt with optional zigzag pleated hem */
function skirtPath(K, o) {
  const R = skirtRight(K, o);
  if (!o.zig) return S(R);
  const right = R.slice(0, -1);
  const hx = right[right.length - 1][0], hem = o.hem;
  const pts = [...right];
  const n = o.zig;
  for (let i = 1; i < n; i++) { const x = lerp(hx, mirX(hx), i / n); pts.push([x, hem + (i % 2 ? 5 : 0), 1]); }
  pts.push([mirX(hx), hem, 1], ...mirAll(right.slice(0, -1).reverse()));
  return smooth(pts);
}

ITEMS.bottom.push(
  { id: 'pleated', name: '百褶短裙', c1: '#b9233b', pat: 'tartan', pc: '#20294f', tags: ['preppy', 'cute', 'sweet'],
    draw: (env, it) => {
      const { K, ctx } = env;
      const wY = 398;
      const band = it.pc && it.pat !== 'none' ? it.pc : shadeOf(it.c1, .12);
      return pleatSkirt(ctx, K, it.c1, it.patUrl, { hem: 530, fl: 30, wY }) + waistband(K, band, { h: 13, y: wY });
    } },
  { id: 'aline', name: 'A字半身裙', c1: '#c9a27c', pat: 'none', pc: '#ffffff', tags: ['elegant', 'vintage', 'office', 'classic'],
    draw: (env, it) => {
      const { K, ctx } = env;
      const lc = lineOf(it.c1);
      return paint(ctx, skirtPath(K, { hem: 572, flare: 30 }), it.c1, { pat: it.patUrl, shade: 'skirt', extra: skirtFolds(K, 424, 572, [-18, 18], 30, lc) })
        + waistband(K, it.c1, { button: lighten(it.c1, .5) }) + buttons([CX], [440, 462, 484], lighten(it.c1, .5), 2.4);
    } },
  { id: 'tutu', name: '蓬蓬纱裙', c1: '#ffc2dc', pat: 'none', pc: '#ffffff', tags: ['cute', 'fantasy', 'sweet', 'party'],
    draw: (env, it) => {
      const { K, ctx } = env;
      let s = '';
      const layer = (hem, fl, col, op, seed) => {
        const R = skirtRight(K, { hem, flare: fl, ease: 3 });
        const hx = R[R.length - 2][0];
        const pts = R.slice(0, -1);
        for (let i = 1; i < 12; i++) { const x = lerp(hx, mirX(hx), i / 12); pts.push([x, hem + (i % 2 ? 7 : -1), i % 2 === 0]); }
        pts.push([mirX(hx), hem, 1], ...mirAll(R.slice(1, -2).reverse()));
        return path(smooth(pts), { fill: col, opacity: op, stroke: lineOf(col), 'stroke-width': 2, 'stroke-linejoin': 'round' });
      };
      s += layer(524, 54, lighten(it.c1, .2), .95) + layer(512, 46, it.c1, .9) + layer(498, 36, lighten(it.c1, .35), .85);
      const r = rng(7); let sp = '';
      for (let i = 0; i < 16; i++) sp += circ(CX - 70 + r() * 140, 440 + r() * 76, .9 + r() * 1.3, { fill: '#fff', opacity: .9 });
      return s + sp + waistband(K, darken(it.c1, .05), { h: 10 });
    } },
  { id: 'denimshorts', name: '牛仔短裤', c1: '#77a1d6', pat: 'none', pc: '#ffffff', tags: ['casual', 'summer', 'street'],
    draw: (env, it) => {
      const { K } = env;
      const hem = 507, e = 6, wY = 426, cuffH = 15;
      const lc = lineOf(it.c1), cuffC = lighten(it.c1, .22);
      const body = garment(env, it, pantsRight(K, { waist: wY, hem, ease: e, flare: 5, notch: 7, crotch: 488 }),
        { extra: pantsDetails(K, it, { ease: e, fly: false, pockets: false })
          + ln(`M${CX - K.wa + 4},${wY + 12}Q${CX - K.wa - 3},${wY + 30} ${CX - K.hi - e + 1},${wY + 36}M${CX + K.wa - 4},${wY + 12}Q${CX + K.wa + 3},${wY + 30} ${CX + K.hi + e - 1},${wY + 36}`, lc, 1.8)
          + ln(`M${CX + 8},${wY + 12}V${wY + 44}Q${CX + 8},${wY + 54} ${CX + 1},${wY + 58}`, lc, 1.6, { opacity: .7 })
          + stitch(`M${CX + 12},${wY + 13}V${wY + 44}Q${CX + 12},${wY + 58} ${CX + 2},${wY + 62}`, '#e8c26a', 1.1)
          + path(`M${CX + K.wa - 14},${wY + 16}h9v8h-9z`, { fill: 'none', stroke: lc, 'stroke-width': 1.3, opacity: .6 })
          + path(`M${CX - K.hi - 20},${hem - 30}L${CX - 8},${hem - 42}L${CX - 4},${hem - 30}Z`, shadowFill(.08)) });
      let cuffs = '';
      for (const s2 of [-1, 1]) cuffs += pantCuff(K, hem - cuffH, hem + 1, e + 1.5, 5, hem, s2, cuffC, { inner: '' }) + ln(`M${CX + s2 * (legEdgeAt(K, hem - 7).i + 1)},${hem - 7}L${CX + s2 * (legEdgeAt(K, hem - 7).o + e + 6)},${hem - 7}`, lineOf(cuffC), 1.3, { opacity: .55 });
      return body + cuffs + waistband(K, it.c1, { y: wY, ease: e, loops: true, button: '#d9b45c' });
    } },
  { id: 'chinos', name: '卡其裤', c1: '#d2bb8e', pat: 'none', pc: '#ffffff', tags: ['preppy', 'classic', 'casual', 'office'],
    draw: (env, it) => {
      const { K } = env;
      const hem = 628, e = 6, fl = 5, cuffH = 18;
      const cuffC = darken(it.c1, .04);   // turn-ups are the same cloth, only a touch darker
      let cuffs = '';
      for (const s2 of [-1, 1]) {
        cuffs += pantCuff(K, hem - cuffH, hem + 1, e + 1.2, fl, hem, s2, cuffC);
        const a = legEdgeAt(K, hem - 9);
        cuffs += ln(`M${CX + s2 * (a.i - e * .6 - fl * .5 - 1)},${hem - 9}L${CX + s2 * (a.o + e + fl + 2)},${hem - 9}`, lineOf(cuffC), 1.2, { opacity: .45 });
      }
      return garment(env, it, pantsRight(K, { hem, ease: e, flare: fl, notch: 7 }), { extra: pantsDetails(K, it, { ease: e, crease: true, hem }) })
        + cuffs + waistband(K, it.c1, { ease: e, loops: true, button: '#5a4632' });
    } },
  { id: 'jeans', name: '复古赤耳牛仔裤', c1: '#2f4a7a', pat: 'none', pc: '#ffffff', tags: ['workwear', 'vintage', 'casual', 'street'],
    draw: (env, it) => {
      const { K } = env;
      const hem = 632, e = 6, fl = 5, st = '#e2a94a', cuffH = 18;
      let cuffs = '';
      for (const s2 of [-1, 1]) {
        cuffs += pantCuff(K, hem - cuffH, hem + 1, e + 1.2, fl, hem, s2, lighten(it.c1, .2));
        const a = legEdgeAt(K, hem - cuffH);
        const xo = CX + s2 * (a.o + e + fl + 1.5), xi = CX + s2 * (a.i - e * .6 - fl * .5 - 1);
        cuffs += ln(`M${xo},${hem - cuffH + 1}L${xo + s2 * .5},${hem}`, '#f6f2ea', 3.2) + ln(`M${xo - s2 * 1.8},${hem - cuffH + 1}L${xo - s2 * 1.3},${hem}`, '#d63b45', 1.2);
        cuffs += stitch(`M${xo - s2 * 3},${hem - 5}L${xi},${hem - 5}`, st, 1);
      }
      return garment(env, it, pantsRight(K, { hem, ease: e, flare: fl, notch: 7 }), { extra: pantsDetails(K, it, { ease: e, stitch: st }) + pocket(CX + K.wa - 20, 426, 11, 11, it.c1) + circ(CX - K.wa + 4, 426, 1.6, { fill: '#c98f3a' }) + circ(CX + K.wa - 4, 426, 1.6, { fill: '#c98f3a' }) })
        + cuffs + waistband(K, it.c1, { ease: e, loops: true, button: '#c98f3a' }) + stitch(`M${CX - K.wa - e},417H${CX + K.wa + e}`, st, 1.1);
    } },
  { id: 'overalls', name: '背带工装裤', c1: '#2c3b5e', pat: 'pin', pc: '#eeebe2', forceTuck: true, tags: ['workwear', 'vintage', 'casual', 'cute'],
    draw: (env, it) => {
      const { K, ctx } = env;
      const hem = 652, e = 6;
      const lc = lineOf(it.c1);
      const bibW = Math.min(K.ch - 8, 34);
      const bib = paint(ctx, `M${CX - bibW},344L${CX + bibW},344L${CX + bibW + 2},416L${CX - bibW - 2},416Z`, it.c1, { pat: it.patUrl })
        + pocket(CX - 13, 356, 26, 24, it.c1, { stitch: '#e2b45c' });
      const strap = s2 => { const X = d => CX + s2 * d; return paint(ctx, `M${X(bibW - 10)},346L${X(bibW)},346L${X(K.sh - 10)},306L${X(K.sh - 21)},303Z`, it.c1, { pat: it.patUrl, shade: false, sw: 2.2 }) + circ(X(bibW - 5), 350, 4.5, { fill: '#d9c37a', stroke: '#8a7230', 'stroke-width': 1.6 }) + circ(X(bibW - 5), 350, 1.6, { fill: '#8a7230' }); };
      let cuffs = '';
      for (const s2 of [-1, 1]) cuffs += pantCuff(K, hem - 12, hem, e, 3, hem, s2, it.c1, { inner: '' });
      return {
        main: garment(env, it, pantsRight(K, { hem, ease: e, flare: 3, waist: 404 }), { extra: pantsDetails(K, it, { ease: e, pockets: true }) + ln(`M${CX - K.wa - e},404L${CX + K.wa + e},404`, lc, 2) }) + cuffs,
        bib: bib + strap(-1) + strap(1) + buttons([CX - K.wa - e + 4, CX + K.wa + e - 4], [414], '#d9c37a', 3),
      };
    } },
  { id: 'trousers', name: '西装裤', c1: '#565b6b', pat: 'none', pc: '#8a8fa0', tags: ['classic', 'office', 'elegant', 'vintage'],
    draw: (env, it) => {
      const { K } = env;
      const hem = 672, e = 4;
      const lc = lineOf(it.c1);
      return garment(env, it, pantsRight(K, { hem, ease: e, flare: 2 }), { extra: pantsDetails(K, it, { ease: e, crease: true, hem }) + ln(`M${CX - 16},423L${CX - 18},446M${CX + 16},423L${CX + 18},446`, lc, 1.4, { opacity: .55 }) })
        + waistband(K, it.c1, { ease: e, button: '#3a3a44' });
    } },
  { id: 'cord', name: '灯芯绒裤', c1: '#8a5a3c', pat: 'cord', pc: '#5c3a26', tags: ['vintage', 'casual', 'autumn', 'preppy'],
    draw: (env, it) => {
      const { K } = env;
      const hem = 664, e = 5.5;
      return garment(env, it, pantsRight(K, { hem, ease: e, flare: 6 }), { extra: pantsDetails(K, it, { ease: e }) }) + waistband(K, it.c1, { ease: e, loops: true, button: '#d9b45c' });
    } },
  { id: 'bermuda', name: '百慕大短裤', c1: '#f2c14e', pat: 'plaid', pc: '#3567b0', tags: ['preppy', 'summer', 'casual', 'vintage'],
    draw: (env, it) => {
      const { K } = env;
      const hem = 556, e = 6;
      let cuffs = '';
      for (const s2 of [-1, 1]) cuffs += pantCuff(K, hem - 10, hem, e, 4, hem, s2, it.c1, { inner: '' });
      return garment(env, it, pantsRight(K, { hem, ease: e, flare: 4 }), { extra: pantsDetails(K, it, { ease: e }) }) + cuffs + waistband(K, it.c1, { ease: e, loops: true, button: '#fff' });
    } },
  { id: 'wide', name: '高腰阔腿裤', c1: '#f3ece0', pat: 'none', pc: '#c9bfa6', tags: ['elegant', 'vintage', 'office', 'classic'],
    draw: (env, it) => {
      const { K } = env;
      const hem = 674, e = 6;
      return garment(env, it, pantsRight(K, { hem, ease: e, flare: 24, waist: 398 }), { extra: pantsDetails(K, it, { ease: e, crease: true, hem, pockets: false }) })
        + waistband(K, it.c1, { ease: e, y: 398, h: 16, button: '#3a3a44' }) + buttons([CX + 10], [404, 410], '#3a3a44', 2);
    } },
  { id: 'cargo', name: '军绿工装裤', c1: '#6b7448', pat: 'none', pc: '#ffffff', tags: ['workwear', 'street', 'cool', 'casual'],
    draw: (env, it) => {
      const { K } = env;
      const hem = 660, e = 7;
      const lc = lineOf(it.c1);
      let pk = '';
      for (const s2 of [-1, 1]) { const a = legEdgeAt(K, 520); const x = CX + s2 * (a.o + e - 4) - (s2 > 0 ? 24 : 0); pk += pocket(x, 522, 24, 34, it.c1, { flap: true, flapFill: shadeOf(it.c1, .05) }); }
      return garment(env, it, pantsRight(K, { hem, ease: e, flare: 3 }), { extra: pantsDetails(K, it, { ease: e }) + pk })
        + waistband(K, it.c1, { ease: e, loops: true, button: '#3a3a30' });
    } },
  { id: 'denimskirt', name: '牛仔半身裙', c1: '#5b82b8', pat: 'none', pc: '#ffffff', tags: ['casual', 'street', 'vintage', 'summer'],
    draw: (env, it) => {
      const { K, ctx } = env;
      const lc = lineOf(it.c1), st = '#e2a94a', hem = 522, wY = 414;
      const R = skirtRight(K, { hem, flare: 18, waist: wY });
      const front = stitch(`M${CX + 5},${wY + 12}V${hem - 2}`, st, 1.1) + ln(`M${CX},${wY + 12}V${hem}`, lc, 1.6, { opacity: .7 });
      const pk = [-1, 1].map(s2 => { const X = d => r1(CX + s2 * d);
        return path(`M${X(K.wa - 6)},${wY + 12}Q${X(K.wa + 2)},${wY + 30} ${X(K.hi + 8)},${wY + 38}L${X(K.hi + 8)},${wY + 32}Q${X(K.wa + 4)},${wY + 26} ${X(K.wa - 2)},${wY + 12}Z`, shadowFill(.1))
          + ln(`M${X(K.wa - 6)},${wY + 12}Q${X(K.wa + 2)},${wY + 30} ${X(K.hi + 8)},${wY + 38}`, lc, 1.7)
          + stitch(`M${X(K.wa - 10)},${wY + 12}Q${X(K.wa - 2)},${wY + 32} ${X(K.hi + 8)},${wY + 42}`, st, 1); }).join('');
      const rivets = circ(CX - K.wa + 4, wY + 14, 1.7, { fill: '#c98f3a' }) + circ(CX + K.wa - 4, wY + 14, 1.7, { fill: '#c98f3a' });
      return paint(ctx, S(R), it.c1, { pat: it.patUrl, shade: 'skirt', extra: front + pk + rivets + stitch(`M${CX - 80},${hem - 6}H${CX + 80}`, st, 1.1) + skirtFolds(K, wY + 44, hem, [-26, 26], 16, lc) })
        + waistband(K, it.c1, { y: wY, h: 12, loops: true, button: '#c98f3a' }) + stitch(`M${CX - K.wa - 3},${wY + 3}H${CX + K.wa + 3}`, st, 1);
    } },
  { id: 'maxipleat', name: '百褶长裙', c1: '#c6a982', pat: 'none', pc: '#ffffff', tags: ['elegant', 'vintage', 'classic', 'autumn'],
    draw: (env, it) => {
      const { K, ctx } = env;
      const wY = 402;
      return pleatSkirt(ctx, K, it.c1, it.patUrl, { hem: 650, fl: 44, wY }) + waistband(K, shadeOf(it.c1, .08), { h: 13, y: wY });
    } },
  { id: 'cargoshorts', name: '工装短裤', c1: '#a8976b', pat: 'none', pc: '#ffffff', tags: ['workwear', 'casual', 'summer', 'street'],
    draw: (env, it) => {
      const { K } = env;
      const hem = 548, e = 7;
      let pk = '';
      for (const s2 of [-1, 1]) { const a = legEdgeAt(K, 500); const x = CX + s2 * (a.o + e - 3) - (s2 > 0 ? 22 : 0); pk += pocket(x, 502, 22, 30, it.c1, { flap: true, flapFill: shadeOf(it.c1, .04), stitch: lighten(it.c1, .35) }); }
      let cuffs = '';
      for (const s2 of [-1, 1]) cuffs += pantCuff(K, hem - 10, hem, e, 4, hem, s2, it.c1, { inner: '' });
      return garment(env, it, pantsRight(K, { hem, ease: e, flare: 4 }), { extra: pantsDetails(K, it, { ease: e, knee: false }) + pk }) + cuffs
        + waistband(K, it.c1, { ease: e, loops: true, button: '#3a3a30' });
    } },
  { id: 'shortalls', name: '背带短裤', c1: '#6f93c4', pat: 'none', pc: '#ffffff', forceTuck: true, tags: ['cute', 'casual', 'summer', 'workwear'],
    draw: (env, it) => {
      const { K, ctx } = env;
      const hem = 514, e = 6, st = '#e2b45c';
      const lc = lineOf(it.c1);
      const bibW = Math.min(K.ch - 8, 32);
      const bib = paint(ctx, `M${CX - bibW},346L${CX + bibW},346L${CX + bibW + 2},416L${CX - bibW - 2},416Z`, it.c1, { pat: it.patUrl, extra: stitch(`M${CX - bibW + 3},349H${CX + bibW - 3}`, st, 1) })
        + pocket(CX - 12, 358, 24, 22, it.c1, { stitch: st });
      const strap = s2 => { const X = d => CX + s2 * d; return paint(ctx, `M${X(bibW - 10)},348L${X(bibW)},348L${X(K.sh - 10)},306L${X(K.sh - 20)},303Z`, it.c1, { pat: it.patUrl, shade: false, sw: 2.2 })
        + circ(X(bibW - 5), 352, 4.2, { fill: '#d9c37a', stroke: lineOf('#d9c37a'), 'stroke-width': 1.3 }); };
      let cuffs = '';
      for (const s2 of [-1, 1]) cuffs += pantCuff(K, hem - 13, hem + 1, e + 1.5, 4, hem, s2, lighten(it.c1, .18), { inner: '' });
      return {
        main: garment(env, it, pantsRight(K, { hem, ease: e, flare: 4, waist: 404, notch: 7 }), { extra: pantsDetails(K, it, { ease: e, fly: false, knee: false }) + ln(`M${CX - K.wa - e},404L${CX + K.wa + e},404`, lc, 2) }) + cuffs,
        bib: bib + strap(-1) + strap(1) + buttons([CX - K.wa - e + 4, CX + K.wa + e - 4], [414], '#d9c37a', 3),
      };
    } },
);

/* ---------- one-pieces ---------- */
function bodice(env, it, o = {}) {
  return garment(env, it, topRight(env.K, Object.assign({ hem: 430, ease: 3, fit: 'fitted' }, o)), o);
}
ITEMS.dress.push(
  { id: 'ballgown', name: '公主蓬蓬裙', c1: '#ffb3cf', c2: '#fff0f6', pat: 'none', pc: '#ffffff', tags: ['fantasy', 'party', 'elegant', 'cute'],
    sleeve: { len: .22, ease: 3, puff: true },
    draw: (env, it) => {
      const { K, ctx } = env;
      const hem = 694, fl = 92;
      const R = skirtRight(K, { hem, flare: fl, waist: 418 });
      const hx = R[R.length - 2][0];
      const pts = R.slice(0, -1);
      for (let i = 1; i < 9; i++) { const x = lerp(hx, mirX(hx), i / 9); pts.push([x, hem + (i % 2 ? 6 : -2)]); }
      pts.push([mirX(hx), hem, 1], ...mirAll(R.slice(1, -2).reverse()));
      let folds = '';
      for (let i = 1; i < 8; i++) { const t = i / 8; folds += `M${r1(lerp(CX - K.wa, CX + K.wa, t))},432Q${r1(lerp(CX - hx, CX + hx, t))},560 ${r1(lerp(CX - hx, CX + hx, t))},${hem}`; }
      let ruff = '';
      for (let x = CX - hx + 8; x < CX + hx - 8; x += 18) ruff += `M${x},${hem - 22}q9,12 18,0`;
      const r = rng(11); let sp = '';
      for (let i = 0; i < 22; i++) sp += path(starD(CX - hx * .8 + r() * hx * 1.6, 470 + r() * 200, 1.8 + r() * 2.4, .4, 4), { fill: '#fff', opacity: .85 });
      const skirt = paint(ctx, smooth(pts), it.c1, { pat: it.patUrl, shade: 'skirt', extra: ln(folds, lineOf(it.c1), 1.5, { opacity: .4 }) + ln(ruff, it.c2, 3, { opacity: .9 }) + sp });
      const body = bodice(env, it, { neck: 'scoop', sleeveless: false, hem: 432 });
      const bow = flat(smooth([[CX, 428], [CX - 22, 416], [CX - 26, 438, 1], [CX - 6, 432], [CX - 14, 458, 1], [CX, 438], [CX + 14, 458, 1], [CX + 6, 432], [CX + 26, 438, 1], [CX + 22, 416]]), it.c2, lineOf(it.c2), 2.2) + circ(CX, 430, 5, { fill: it.c2, stroke: lineOf(it.c2), 'stroke-width': 2 });
      return skirt + body + bow;
    } },
  { id: 'lolita', name: '洛丽塔', c1: '#f9c9d9', c2: '#ffffff', pat: 'none', pc: '#ffffff', tags: ['sweet', 'cute', 'fantasy', 'vintage'],
    sleeve: { len: .27, ease: 3, puff: true },
    draw: (env, it) => {
      const { K, ctx } = env;
      const hem = 566;
      const tier = (h, fl, col) => {
        const R = skirtRight(K, { hem: h, flare: fl, waist: 420 });
        const hx = R[R.length - 2][0];
        const pts = R.slice(0, -1);
        const n = 12;
        for (let i = 1; i < n; i++) { const x = lerp(hx, mirX(hx), i / n); pts.push([x, h + (i % 2 ? 6 : 0), i % 2 === 0]); }
        pts.push([mirX(hx), h, 1], ...mirAll(R.slice(1, -2).reverse()));
        return paint(ctx, smooth(pts), col, { pat: col === it.c1 ? it.patUrl : null, shade: 'skirt' });
      };
      let lace = '';
      const hxL = Math.max(K.hi, K.wa) + 3 + 50;
      for (let x = CX - hxL + 2; x < CX + hxL - 2; x += 9) lace += `M${x},${hem + 2}a4.5,4.5 0 0,0 9,0`;
      const s = tier(hem + 6, 54, it.c2) + tier(hem, 50, it.c1) + ln(lace, '#fff', 2.4) + tier(520, 40, lighten(it.c1, .2));
      const lc = lineOf(it.c1);
      const body = bodice(env, it, { neck: 'square', hem: 432 }) + ln(`M${CX - 22},326H${CX + 22}`, '#fff', 3) + ln(`M${CX},330V420`, lc, 1.2, { opacity: .5 });
      const bow = (y, sc) => flat(smooth([[CX, y], [CX - 16 * sc, y - 9 * sc], [CX - 18 * sc, y + 8 * sc, 1], [CX - 4, y + 3], [CX - 10 * sc, y + 22 * sc, 1], [CX, y + 6], [CX + 10 * sc, y + 22 * sc, 1], [CX + 4, y + 3], [CX + 18 * sc, y + 8 * sc, 1], [CX + 16 * sc, y - 9 * sc]]), it.c2, lineOf(it.c2), 2) + circ(CX, y + 1, 3.6 * sc, { fill: it.c2, stroke: lineOf(it.c2), 'stroke-width': 1.6 });
      return s + body + bow(334, 1) + bow(372, .8) + bow(404, .7);
    } },
  { id: 'slip', name: '吊带长裙', c1: '#c4b0f0', pat: 'none', pc: '#ffffff', tags: ['elegant', 'party', 'summer'],
    draw: (env, it) => {
      const { K, ctx } = env;
      const R = topRight(K, { neck: 'v', vDepth: 336, sleeveless: true, strap: 3, hem: 452, ease: 3 }).slice(0, -2);
      const hx = Math.max(K.hi, K.wa) + 3;
      const pts = [...R, [CX + K.wa + 3, 412], [CX + hx + 2, 456], [CX + hx + 18, 600], [CX + hx + 24, 684, 1], [CX, 688]];
      const lc = lineOf(it.c1);
      return paint(ctx, S(pts), it.c1, { pat: it.patUrl, shade: 'skirt', extra: ln(`M${CX - 20},470Q${CX - 26},580 ${CX - 34},684M${CX + 14},470Q${CX + 18},580 ${CX + 22},684M${CX + 36},500Q${CX + 46},600 ${CX + 52},684`, lc, 1.3, { opacity: .35 }) + path(`M${CX - 60},300L${CX - 20},300L${CX - 46},688L${CX - 70},688Z`, { fill: '#fff', opacity: .14 }) });
    } },
  { id: 'pinafore', name: '背带裙', c1: '#3a5a8c', pat: 'plaid', pc: '#e8c547', overTop: true, tags: ['preppy', 'cute', 'vintage', 'sweet'],
    draw: (env, it) => {
      const { K, ctx } = env;
      const bibW = Math.min(K.ch - 10, 30);
      const skirt = paint(ctx, skirtPath(K, { hem: 548, flare: 30, waist: 412 }), it.c1, { pat: it.patUrl, shade: 'skirt' });
      const bib = paint(ctx, `M${CX - bibW},350L${CX + bibW},350L${CX + bibW + 3},418L${CX - bibW - 3},418Z`, it.c1, { pat: it.patUrl });
      const strap = s2 => { const X = d => CX + s2 * d; return paint(ctx, `M${X(bibW - 9)},352L${X(bibW)},352L${X(K.sh - 11)},307L${X(K.sh - 20)},304Z`, it.c1, { pat: it.patUrl, shade: false, sw: 2.2 }) + circ(X(bibW - 5), 356, 3.6, { fill: '#fff6dc', stroke: '#9a8a5a', 'stroke-width': 1.4 }); };
      return skirt + bib + strap(-1) + strap(1) + waistband(K, it.c1, { y: 410, h: 10 });
    } },
  { id: 'qipao', name: '旗袍', c1: '#c8102e', pat: 'none', pc: '#f2c75c', tags: ['chinese', 'elegant', 'party', 'vintage'],
    sleeve: { len: .17, ease: 3 },
    draw: (env, it) => {
      const { K, ctx } = env;
      const gold = '#f2c75c';
      const hx = Math.max(K.hi, K.wa) + 3;
      const R = topRight(K, { neck: 'turtle', hem: 452, ease: 3 }).slice(0, -2);
      const pts = [...R, [CX + K.wa + 3, 412], [CX + hx + 1, 456], [CX + hx - 2, 540], [CX + hx - 6, 596, 1], [CX, 598]];
      const lc = lineOf(it.c1);
      const w = K.neck + 4;
      const collar = flat(`M${CX - w},272Q${CX},278 ${CX + w},272L${CX + w + 1},292Q${CX},300 ${CX - w - 1},292Z`, it.c1, lc, 2.4) + ln(`M${CX - w},292Q${CX},300 ${CX + w},292`, gold, 2);
      const opening = ln(`M${CX},298C${CX + 14},310 ${CX + 30},314 ${CX + K.sh - 4},334`, gold, 2.4);
      const frogs = [[CX + 10, 306], [CX + 26, 316], [CX + K.sh - 10, 330]].map(([x, y]) => ln(`M${x - 5},${y - 2}h10M${x - 3},${y - 4}a2.5,2.5 0 1,0 0,4`, gold, 2)).join('');
      const slit = ln(`M${CX + hx - 4},560L${CX + hx - 6},596`, lc, 1.8);
      const flower = (x, y) => { let s = ''; for (let i = 0; i < 5; i++) { const a = i * 1.2566; s += ell(x + Math.cos(a) * 6, y + Math.sin(a) * 6, 5, 3.4, { fill: gold, opacity: .9, transform: `rotate(${r1(a * 57.3)} ${r1(x + Math.cos(a) * 6)} ${r1(y + Math.sin(a) * 6)})` }); } return s + circ(x, y, 3, { fill: '#fff3c4' }); };
      return paint(ctx, S(pts), it.c1, { pat: it.patUrl, extra: flower(CX - 24, 470) + flower(CX + 30, 540) + ln(`M${CX - 24},470q10,30 -4,60M${CX + 30},540q-10,20 6,40`, gold, 1.4, { opacity: .7 }) })
        + collar + opening + frogs + slit;
    } },
  { id: 'magical', name: '魔法少女裙', c1: '#ff9ecf', c2: '#ffffff', pat: 'none', pc: '#ffe066', tags: ['fantasy', 'cute', 'party', 'sweet'],
    sleeve: { len: .22, ease: 3, puff: true },
    draw: (env, it) => {
      const { K, ctx } = env;
      const layer = (hem, fl, col) => {
        const R = skirtRight(K, { hem, flare: fl, waist: 420 });
        const hx = R[R.length - 2][0];
        const pts = R.slice(0, -1);
        for (let i = 1; i < 8; i++) { const x = lerp(hx, mirX(hx), i / 8); pts.push([x, hem - (i % 2 ? 0 : 8), i % 2 === 1]); }
        pts.push([mirX(hx), hem, 1], ...mirAll(R.slice(1, -2).reverse()));
        return paint(ctx, smooth(pts), col, { shade: 'skirt' });
      };
      const sk = layer(540, 62, it.c2) + layer(526, 54, it.c1) + layer(498, 40, lighten(it.c1, .3));
      const collar = flat(S([[CX, 346, 1], [CX + 16, 326], [CX + K.neck + 6, 298, 1], [CX + K.sh, 318], [CX + K.sh + 4, 336, 1], [CX + 20, 348]]), it.c2, lineOf(it.c2), 2.2);
      const brooch = path(heartD(CX, 352, 10), { fill: '#ff4f8b', stroke: lineOf('#ff4f8b'), 'stroke-width': 2 }) + path(starD(CX - 3, 348, 3, .4, 4), { fill: '#fff' });
      const bowBack = flat(smooth([[CX, 420], [CX - 34, 404], [CX - 40, 432, 1], [CX - 8, 426], [CX - 22, 470, 1], [CX, 432], [CX + 22, 470, 1], [CX + 8, 426], [CX + 40, 432, 1], [CX + 34, 404]]), it.pc, lineOf(it.pc), 2.2);
      return sk + bodice(env, it, { neck: 'v', vDepth: 350, hem: 432 }) + collar + bowBack + brooch;
    } },
  { id: 'boiler', name: '连体工装服', c1: '#3e4f6e', pat: 'none', pc: '#ffffff', tags: ['workwear', 'vintage', 'cool', 'street'],
    sleeve: { len: .62, ease: 5, roll: true },
    draw: (env, it) => {
      const { K, ctx } = env;
      const e = 6, hem = 652;
      const lc = lineOf(it.c1), st = '#e2b45c';
      const pants = garment(env, it, pantsRight(K, { hem, ease: e, flare: 3, waist: 404 }), { extra: pantsDetails(K, it, { ease: e, fly: false }) });
      const top = garment(env, it, topRight(K, { neck: 'collar', hem: 430, ease: e }), {
        extra: ln(`M${CX},300V430`, lc, 1.8) + stitch(`M${CX - 4},304V430M${CX + 4},304V430`, st, 1)
          + pocket(CX - 40, 336, 24, 26, it.c1, { flap: true, stitch: st }) + pocket(CX + 16, 336, 24, 26, it.c1, { flap: true, stitch: st }) });
      const belt = flat(`M${CX - K.wa - e - 1},410H${CX + K.wa + e + 1}V424H${CX - K.wa - e - 1}Z`, it.c1, lc, 2.2) + path(`M${CX - 8},409h16v16h-16z`, { fill: 'none', stroke: '#c9b26a', 'stroke-width': 2.4 });
      let cuffs = '';
      for (const s2 of [-1, 1]) cuffs += pantCuff(K, hem - 12, hem, e, 3, hem, s2, it.c1);
      return pants + cuffs + top + belt + shirtCollar(ctx, K, it.c1, { wide: true });
    } },
  { id: 'shirtdress', name: '衬衫连衣裙', c1: '#9cc3e6', pat: 'gingham', pc: '#ffffff', tags: ['vintage', 'casual', 'preppy', 'summer'],
    sleeve: { len: .5, ease: 3.5, roll: true },
    draw: (env, it) => {
      const { K, ctx } = env;
      const skirt = paint(ctx, skirtPath(K, { hem: 566, flare: 24, waist: 414 }), it.c1, { pat: it.patUrl, shade: 'skirt', extra: placket(K, 420, 566, it.c1, 4) });
      const top = bodice(env, it, { neck: 'collar', hem: 432, extra: placket(K, 312, 432, it.c1, 3) });
      const belt = flat(`M${CX - K.wa - 4},412H${CX + K.wa + 4}V424H${CX - K.wa - 4}Z`, '#7a5134', lineOf('#7a5134'), 2) + path(`M${CX - 7},410h14v16h-14z`, { fill: 'none', stroke: '#e0c070', 'stroke-width': 2.2 });
      return skirt + top + belt + shirtCollar(ctx, K, it.c1, {});
    } },
  { id: 'teadress', name: '碎花茶歇裙', c1: '#fbe6cf', pat: 'flower', pc: '#e4596b', tags: ['vintage', 'sweet', 'summer', 'elegant'],
    sleeve: { len: .25, ease: 3, puff: true },
    draw: (env, it) => {
      const { K, ctx } = env;
      const lc = lineOf(it.c1), hem = 604;
      const folds = ln(`M${CX - 18},440Q${CX - 26},520 ${CX - 38},${hem}M${CX + 12},440Q${CX + 16},520 ${CX + 22},${hem}M${CX + 34},450Q${CX + 46},530 ${CX + 56},${hem}`, lc, 1.3, { opacity: .35 });
      const skirt = paint(ctx, skirtPath(K, { hem, flare: 36, waist: 420 }), it.c1, { pat: it.patUrl, shade: 'skirt', extra: folds });
      const body = bodice(env, it, { neck: 'v', vDepth: 346, hem: 432, extra: placket(K, 350, 430, it.c1, 3, CX, { button: '#fff8ec' }) });
      const sash = flat(`M${CX - K.wa - 4},418H${CX + K.wa + 4}V428H${CX - K.wa - 4}Z`, it.pc, lineOf(it.pc), 2);
      const tie = flat(smooth([[CX - 24, 424], [CX - 36, 416], [CX - 40, 430, 1], [CX - 28, 428], [CX - 34, 452, 1], [CX - 24, 430]]), it.pc, lineOf(it.pc), 1.8);
      return skirt + body + sash + tie;
    } },
  { id: 'sundress', name: '格子吊带裙', c1: '#d94a5c', pat: 'gingham', pc: '#ffffff', tags: ['summer', 'cute', 'sweet', 'casual'],
    draw: (env, it) => {
      const { K, ctx } = env;
      const lc = lineOf(it.c1), hem = 548;
      const skirt = paint(ctx, skirtPath(K, { hem, flare: 34, waist: 422 }), it.c1, { pat: it.patUrl, shade: 'skirt',
        extra: ln(`M${CX - 14},440L${CX - 26},${hem}M${CX + 14},440L${CX + 26},${hem}`, lc, 1.2, { opacity: .3 }) });
      const body = bodice(env, it, { neck: 'square', sleeveless: true, strap: 4, hem: 434 });
      const bow = flat(smooth([[CX, 326], [CX - 10, 320], [CX - 11, 332, 1], [CX - 2, 328], [CX + 2, 328], [CX + 11, 332, 1], [CX + 10, 320]]), '#fff6f0', lineOf('#fff6f0'), 1.6);
      return skirt + body + ln(`M${CX - K.wa - 3},${424}H${CX + K.wa + 3}`, lc, 1.6, { opacity: .6 }) + bow;
    } },
  { id: 'sweaterdress', name: '毛衣连衣裙', c1: '#c79a72', pat: 'none', pc: '#ffffff', tags: ['winter', 'elegant', 'casual', 'classic'],
    sleeve: { len: .96, ease: 4.5, cuff: 'rib' },
    draw: (env, it) => {
      const { K, ctx } = env;
      const hx = Math.max(K.hi, K.wa) + 4, hem = 560, lc = lineOf(it.c1), w = K.neck + 5;
      const R = topRight(K, { neck: 'turtle', hem: 452, ease: 4.5 }).slice(0, -2);
      const pts = [...R, [CX + K.wa + 5, 412], [CX + hx + 2, 456], [CX + hx + 5, hem, 1], [CX, hem + 2]];
      let rib = '';
      for (let x = CX - 60; x <= CX + 60; x += 7) rib += `M${x},300V${hem - 12}`;
      const body = paint(ctx, S(pts), it.c1, { pat: it.patUrl, extra: ln(rib, lc, 1.2, { opacity: .3 }) + ribBand(K, hem - 12, hem + 2, it.c1) + sideFolds(K, 470, .8) });
      const collar = flat(`M${CX - w},270Q${CX},276 ${CX + w},270L${CX + w + 2},300Q${CX},310 ${CX - w - 2},300Z`, shadeOf(it.c1, .05), lc, 2.6)
        + ln(`M${CX - w + 4},274V300M${CX - w + 11},275V303M${CX - 3},276V305M${CX + 4},276V305M${CX + w - 11},275V303M${CX + w - 4},274V300`, lc, 1.1, { opacity: .45 });
      return body + collar;
    } },
  { id: 'sailordress', name: '水手领连衣裙', c1: '#ffffff', c2: '#22345e', pat: 'none', pc: '#9fb7e8', tags: ['cute', 'preppy', 'sweet', 'summer'],
    sleeve: { len: .3, ease: 4, cuff: 'c2' },
    draw: (env, it) => {
      const { K, ctx } = env;
      const skirt = pleatSkirt(ctx, K, it.c2, null, { hem: 546, fl: 30, wY: 420 });
      const body = bodice(env, it, { neck: 'v', vDepth: 356, hem: 432 });
      return skirt + body + waistband(K, it.c2, { h: 10, y: 420 }) + sailorCollar(K, it.c2);
    } },
);
