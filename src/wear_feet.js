/* ===== wear_feet.js — socks & shoes =====
   Front view, light from the upper left (same as the cel shadows on clothes): every shoe gets its shadow on the
   right and its highlight on the upper left of the toe — the same side on both feet, never mirrored. */

/* ---------- socks ---------- */
/* scale an absolute path (as smooth() writes it) about a point; patterns stay in register with the leg */
function scalePath(d, cx, cy, k) {
  return d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (m, x, y) => `${r1(cx + (x - cx) * k)},${r1(cy + (y - cy) * k)}`);
}
/* the foot of a sock is the paw itself, a little bigger, so the bare paw never peeks out around it */
function sockFoot(K, sd) {
  const f = toonFoot(K, sd), cx = CX + sd * (K.ac + 1);
  return { d: scalePath(f.d, cx, 680, 1.05), toes: scalePath(f.toes, cx, 680, 1.05) };
}
/* x where the cel shadow on the right of a sock starts — one line shared by the leg part and the foot */
function sockShadeX(K, sd, y0, y1, add) {
  let lo = Infinity, hi = -Infinity;
  for (let y = y0; y <= y1; y += 4) { const e = legEdgeAt(K, y, add); for (const x of [CX + sd * e.i, CX + sd * e.o]) { lo = Math.min(lo, x); hi = Math.max(hi, x); } }
  return lo + (hi - lo) * .74;
}
const isShod = st => !!(st.wear && st.wear.shoes);
function sockShape(env, it, y0, o = {}) {
  const { K, ctx, st } = env;
  const shod = isShod(st), col = it.c1, lc = lineOf(col), add = o.add ?? 1.4, ribH = o.ribH || 9;
  let s = '';
  for (const sd of [-1, 1]) {
    const X = dx => CX + sd * dx;
    const y1 = shod ? 680 : 672;
    const bd = legBand(K, sd, y0, y1, add), sid = ctx.shape(bd);
    const F = shod ? null : sockFoot(K, sd), fid = F ? ctx.shape(F.d) : null;
    const xs = r1(sockShadeX(K, sd, y0, y1, add));
    let ex = '';
    if (o.rib !== false) ex += path(`M${CX - 120},${y0}H${CX + 120}V${y0 + ribH}H${CX - 120}Z`, { fill: shadeOf(col, .08) }) + ln(Array.from({ length: 50 }, (_, i) => `M${CX - 120 + i * 5},${y0 + 1}v${ribH - 2}`).join(''), lc, .8, { opacity: .4 });
    if (o.stripes) for (const [dy, c] of o.stripes) ex += path(`M${CX - 120},${y0 + dy}H${CX + 120}V${y0 + dy + 4}H${CX - 120}Z`, { fill: c });
    if (o.inner) ex += o.inner(sd);
    ex += path(`M${xs},${y0 - 4}H${r1(xs + 90)}V720H${xs}Z`, shadowFill(.12));
    const fill = id => use(id, { fill: col }) + (it.patUrl ? use(id, { fill: it.patUrl }) : '');
    if (F) {
      // over a bare paw the sock is one silhouette: both outlines under both fills, the cuff part in front of the foot
      const e0 = legEdgeAt(K, y0, add);
      s += use(sid, { fill: 'none', stroke: lc, 'stroke-width': 4.4, 'stroke-linejoin': 'round' }) + use(fid, { fill: 'none', stroke: lc, 'stroke-width': 4.4, 'stroke-linejoin': 'round' })
        + g(fill(fid) + fill(sid) + ex, { 'clip-path': ctx.clipAll([bd, F.d]) })
        + ln(F.toes, lc, 1.5, { opacity: .45 }) + ln(`M${X(e0.i - 1)},${y0 - 1.1}L${X(e0.o + 1)},${y0 - 1.1}`, lc, 2.2);
    } else {
      s += g(fill(sid) + ex, { 'clip-path': ctx.clipUse(sid) }) + use(sid, { fill: 'none', stroke: lc, 'stroke-width': 2.2, 'stroke-linejoin': 'round' });
    }
  }
  return s;
}
ITEMS.socks.push(
  { id: 'ankle', name: '短袜', c1: '#ffffff', pat: 'none', pc: '#ff8fab', tags: ['casual', 'sporty', 'cute', 'summer'], draw: (env, it) => sockShape(env, it, 640, { ribH: 7 }) },
  { id: 'crew', name: '中筒袜', c1: '#f4efe6', pat: 'none', pc: '#ffffff', tags: ['casual', 'preppy', 'workwear'], draw: (env, it) => sockShape(env, it, 616) },
  { id: 'argyle', name: '菱格袜', c1: '#2f3d66', pat: 'argyle', pc: '#c9374b', tags: ['preppy', 'classic', 'vintage'], draw: (env, it) => sockShape(env, it, 610) },
  { id: 'tube', name: '运动长筒袜', c1: '#ffffff', c2: '#c9374b', pat: 'none', pc: '#ffffff', tags: ['sporty', 'vintage', 'street'],
    draw: (env, it) => sockShape(env, it, 566, { ribH: 26, stripes: [[6, it.c2], [14, '#23396b']] }) },
  { id: 'knee', name: '及膝袜', c1: '#2b2733', pat: 'none', pc: '#ffffff', tags: ['preppy', 'cute', 'sweet', 'classic'], draw: (env, it) => sockShape(env, it, 566) },
  { id: 'thigh', name: '过膝袜', c1: '#f7f2fb', pat: 'none', pc: '#ff8fab', tags: ['cute', 'sweet', 'fantasy'],
    draw: (env, it) => {
      const s = sockShape(env, it, 512, { ribH: 7 });
      const bow = sd => { const x = CX + sd * (env.K.kc + 8); return flat(smooth([[x, 516], [x - 9, 510], [x - 10, 521, 1], [x - 2, 518], [x + 2, 518], [x + 10, 521, 1], [x + 9, 510]]), '#ff7a9c', lineOf('#ff7a9c'), 1.6); };
      return s + bow(-1) + bow(1);
    } },
  { id: 'tights', name: '连裤袜', c1: '#2b2733', pat: 'none', pc: '#ffffff', tags: ['elegant', 'classic', 'winter', 'office'],
    draw: (env, it) => {
      const { K } = env;
      let s = '';
      const shod = isShod(env.st), lc = lineOf(it.c1);
      for (const sd of [-1, 1]) {
        // leg and foot are painted opaque and then made sheer together, so their overlap doesn't double up
        const parts = [legPath(K, sd, { top: .6, thigh: .6, knee: .6, calf: .6, ankle: .6 }, shod ? 684 : 676)];
        if (!shod) parts.push(sockFoot(K, sd).d);
        s += g(parts.map(d => path(d, { fill: 'none', stroke: lc, 'stroke-width': 4.4, 'stroke-linejoin': 'round' })).join('') + parts.map(d => path(d, { fill: it.c1 })).join(''), { opacity: .86 });
      }
      // sheer sheen down the shin, on the lit (left) side of each leg
      for (const sd of [-1, 1]) { const e = legEdgeAt(K, 590); const x = CX + sd * (sd < 0 ? e.o - 5 : e.i + 5); s += ln(`M${x},540Q${x - 1},590 ${x + sd * 2},650`, '#fff', 2.6, { opacity: .16 }); }
      return s;
    } },
  { id: 'loose', name: '泡泡袜', c1: '#ffffff', pat: 'none', pc: '#ffd1dc', tags: ['cute', 'street', 'vintage'],
    draw: (env, it) => {
      const { K } = env;
      // slouched folds wrap round the leg: drawn inside the sock and cut off by its outline
      const folds = sd => { const e = legEdgeAt(K, 620), x0 = CX + sd * (e.i - 6), x1 = CX + sd * (e.o + 8), m = (x0 + x1) / 2;
        return ln(`M${x0},614Q${m},607 ${x1},615M${x0},629Q${m},622 ${x1},631M${x0},645Q${m},638 ${x1},646`, lineOf(it.c1), 1.6, { opacity: .55 }); };
      return sockShape(env, it, 604, { add: 4, rib: false, inner: folds });
    } },
);

/* ---------- shoes ---------- */
/* Frame of one shoe: centred on the paw, wide enough to hold it, but always leaving a gap between the two shoes.
   o(d): x of an offset d from the centre line on this side (mirrors with the foot) — for construction lines.
   L(u): screen x relative to the shoe centre (does NOT mirror) — for light: highlights and shadows. */
function shoeFrame(K, sd) {
  const a = K.ac, c = a + 1;
  const hw = Math.min(c - 2, K.aw + 13);
  const cx = CX + sd * c;
  return { sd, K, a, c, hw, aw: K.aw, cx, o: d => CX + sd * d, L: u => cx + u };
}
/* upper outline: the opening at `top`, down the inner side, round the domed toe, up the outer side.
   Boots follow the leg up to the shaft top (flare: how far the shaft stands off the leg; straight: no pinch at the ankle).
   dip: how far the throat (opening) dips in the middle. */
function upperD(F, o) {
  const { K, a, c, hw, aw } = F, X = F.o;
  const top = o.top, pointy = o.pointy;
  let inT, outT;
  if (top < 656) { const e = legEdgeAt(K, top), fl = o.flare ?? 2.5; inT = e.i - fl; outT = e.o + fl; }
  else { inT = a - aw - (o.ankle ?? 2.5); outT = a + aw + (o.ankle ?? 2.5); }
  const w = pointy ? hw - 2.5 : hw;
  const pts = [[X(inT), top, 1]];
  if (top < 656) pts.push([X(o.straight ? inT : a - aw - 2.5), 664]);
  pts.push([X(c - w + 3), 680], [X(c - w), 692], [X(c - w + 1.5), 701], [X(c - w + 4.5), 706, pointy ? 0 : 1]);
  if (pointy) pts.push([X(c + 1.5), 712, 1]);
  pts.push([X(c + w - 4.5), 706, pointy ? 0 : 1], [X(c + w - 1), 701], [X(c + w + .5), 692], [X(c + w - 2.5), 680]);
  if (top < 656) pts.push([X(o.straight ? outT : a + aw + 2.5), 664]);
  pts.push([X(outT), top, 1]);
  if (o.dip) { const m = (inT + outT) / 2; pts.push([X(lerp(m, outT, .55)), top + o.dip * .72], [X(m), top + o.dip], [X(lerp(m, inT, .55)), top + o.dip * .72]); }
  return { d: smooth(pts), inT, outT, top };
}
/* sole: a band under the upper, a little wider, with a darker underside */
function soleD(F, h, wide = .5) {
  const X = F.o, c = F.c, hw = F.hw + wide, y0 = 711 - h;
  return `M${X(c - hw)},${y0}L${X(c + hw)},${y0}Q${X(c + hw + 1)},${r1(y0 + h * .5)} ${X(c + hw - 1.2)},711L${X(c - hw + 1.2)},711Q${X(c - hw - 1)},${r1(y0 + h * .5)} ${X(c - hw)},${y0}Z`;
}
/* light: cel shadow on the right of the shoe + a darker band just above the sole */
function shoeShade(F) {
  const x = F.L(F.hw * .3);
  return path(`M${x},600L${F.cx + 60},600L${F.cx + 60},720L${x + 4},720Z`, shadowFill(.16))
    + path(`M${F.cx - 60},701H${F.cx + 60}V720H${F.cx - 60}Z`, shadowFill(.1));
}
/* specular highlight, drawn like the reference: one small horizontal lens on the toe dome, left of centre on BOTH
   shoes (light from the upper left, never mirrored). patent: almost white with a tiny glint beside it; polished: a
   pale tint of the leather; leather: a lighter shade of it; satin: a wide, faint sheen; canvas and cloth: none. */
function shoeShine(F, kind, col, y = 691) {
  const x = F.L(-F.hw * .36), w = F.hw * .28;
  const lens = (cx, cy, hw, hh) => `M${r1(cx - hw)},${r1(cy + hh * .25)}Q${r1(cx - hw * .2)},${r1(cy - hh * 1.25)} ${r1(cx + hw)},${r1(cy - hh * .35)}Q${r1(cx + hw * .1)},${r1(cy + hh * 1.15)} ${r1(cx - hw)},${r1(cy + hh * .25)}Z`;
  switch (kind) {
    case 'patent': { const c = mix(col, '#ffffff', .8); return path(lens(x, y, w, 3.2), { fill: c }) + circ(r1(x + w + 3.2), r1(y - .7), 1.1, { fill: c, opacity: .85 }); }
    case 'polished': return path(lens(x, y, w * 1.05, 3.2), { fill: mix(col, '#ffffff', .72) });
    case 'leather': return path(lens(x, y, w * .95, 3), { fill: lighten(col, .3), opacity: .9 });
    case 'satin': return path(lens(x + 1, y, w * 1.35, 3.2), { fill: '#ffffff', opacity: .3 });
    default: return '';
  }
}
/* lace-up front: tongue, eyelets and an X lacing between y0 (top) and y1 */
function lacing(F, y0, y1, rows, laceCol, o = {}) {
  const ew = o.ew ?? 6.5, cx = F.cx;
  const gap = (y1 - y0) / rows;
  let tongue = o.tongue ? flat(`M${cx - ew - 3},${y0 - 6}Q${cx},${y0 - 10} ${cx + ew + 3},${y0 - 6}L${cx + ew + 2},${y1}L${cx - ew - 2},${y1}Z`, o.tongue, lineOf(o.tongue), 1.8) : '';
  let lace = '', eye = '';
  for (let k = 0; k < rows; k++) {
    const y = y0 + k * gap;
    lace += `M${cx - ew},${r1(y)}L${cx + ew},${r1(y + gap)}M${cx + ew},${r1(y)}L${cx - ew},${r1(y + gap)}`;
    eye += circ(cx - ew, r1(y), 1.7, { fill: o.eyelet || '#d9d2c4', stroke: '#3b2a24', 'stroke-width': .9 }) + circ(cx + ew, r1(y), 1.7, { fill: o.eyelet || '#d9d2c4', stroke: '#3b2a24', 'stroke-width': .9 });
  }
  const w = o.w ?? 2.6;
  return tongue + ln(lace, lineOf(laceCol), w + 1.8) + ln(lace, laceCol, w) + eye;
}
/* one pair: floor shadows first, then each shoe (drawn by fn), clipped detail stays inside its upper */
function shoePair(env, it, fn) {
  const { K } = env;
  let s = '';
  for (const sd of [-1, 1]) { const F = shoeFrame(K, sd); s += ell(F.cx, 711.5, F.hw + 3, 3.2, { fill: '#3b1a1f', opacity: .16 }); }
  for (const sd of [-1, 1]) s += fn(shoeFrame(K, sd));
  return s;
}
/* upper with pattern, inner details, light and outline */
function upperPaint(ctx, U, col, o = {}) {
  const sid = ctx.shape(U.d);
  let s = use(sid, { fill: col });
  if (o.pat) s += use(sid, { fill: o.pat });
  s = g(s + (o.extra || '') + (o.shade === false ? '' : shoeShade(o.F)), { 'clip-path': ctx.clipUse(sid) });
  s += use(sid, { fill: 'none', stroke: o.line || lineOf(col), 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
  return s + (o.over || '');
}
/* what shows inside a low-cut shoe's opening: the sock if one is worn, otherwise the paw */
function instep(env, F, U, depth = 9) {
  const { st, K } = env;
  const sk = st.wear && st.wear.socks ? itemOf('socks', st.wear.socks) : null;
  const col = sk ? sk.c1 : furColors(st).foot;
  const X = F.o, m = (U.inT + U.outT) / 2;
  const d = `M${X(U.inT + 1)},${U.top - 2}Q${X(m)},${U.top - 6} ${X(U.outT - 1)},${U.top - 2}L${X(U.outT - 3)},${U.top + depth + 6}Q${X(m)},${U.top + depth + 10} ${X(U.inT + 3)},${U.top + depth + 6}Z`;
  return path(d, { fill: col }) + path(d, shadowFill(.22));
}

ITEMS.shoes.push(
  { id: 'maryjane', name: '玛丽珍鞋', c1: '#231e26', pat: 'none', pc: '#ffffff', tags: ['cute', 'preppy', 'sweet', 'classic'],
    draw: (env, it) => shoePair(env, it, F => {
      const { ctx } = env, X = F.o;
      const U = upperD(F, { top: 667, dip: 9 });
      const lc = lineOf(it.c1);
      // strap crosses the instep above the dipped throat (sock shows between them); buckle on its outer end, on the shoe
      const sIn = U.inT - .5, sOut = U.outT + .5, m = (sIn + sOut) / 2, sy = U.top - 1.5;
      const strap = `M${X(sIn)},${sy}Q${X(m)},${sy - 4} ${X(sOut)},${sy}L${X(sOut)},${sy + 5.5}Q${X(m)},${sy + 1.5} ${X(sIn)},${sy + 5.5}Z`;
      const bx = X(sOut - 4.5), metal = '#dfe3ea';
      const buckle = path(`M${bx - 3.4},${sy - 1.6}h6.8v8.6h-6.8z`, { fill: 'none', stroke: '#4a4650', 'stroke-width': 3.2 }) + path(`M${bx - 3.4},${sy - 1.6}h6.8v8.6h-6.8z`, { fill: 'none', stroke: metal, 'stroke-width': 1.7 }) + ln(`M${bx},${sy}v5.4`, metal, 1.3);
      return instep(env, F, U, 9) + flat(soleD(F, 5), darken(it.c1, .35), lc, 2) + upperPaint(ctx, U, it.c1, { pat: it.patUrl, F, extra: shoeShine(F, 'patent', it.c1) })
        + flat(strap, it.c1, lc, 2) + ln(`M${r1(Math.min(X(sIn), X(sOut)) + 3)},${sy + 1.5}Q${r1(Math.min(X(sIn), X(sOut)) + 7)},${sy - 1.2} ${X(m)},${sy - 1.8}`, mix(it.c1, '#ffffff', .82), 1.3, { opacity: .55 }) + buckle;
    }) },
  { id: 'canvas', name: '高帮帆布鞋', c1: '#2a252c', c2: '#fbf5ea', pat: 'none', pc: '#ffffff', tags: ['street', 'casual', 'vintage', 'sporty'],
    draw: (env, it) => shoePair(env, it, F => {
      const { ctx } = env, X = F.o, c = F.c, hw = F.hw;
      const U = upperD(F, { top: 630, flare: 3, straight: true });
      const lc = lineOf(it.c1), rub = it.c2, rl = lineOf(rub);
      // rubber toe cap (a half dome) and the tall rubber foxing band with a thin pin stripe
      const cap = smooth([[X(c - hw + 1), 706, 1], [X(c - hw + 2), 696], [X(c - hw * .55), 687], [X(c), 684.5], [X(c + hw * .55), 687], [X(c + hw - 1.5), 696], [X(c + hw), 706, 1]]);
      const collar = ln(`M${X(U.inT + 1)},${U.top + 4}Q${X((U.inT + U.outT) / 2)},${U.top + 1} ${X(U.outT - 1)},${U.top + 4}`, lc, 1.4, { opacity: .6 });
      const seam = stitch(`M${X(c - hw + 3)},683Q${X(c)},676 ${X(c + hw - 3)},683`, lighten(it.c1, .35), 1);
      return flat(soleD(F, 9), rub, rl, 2.2) + ln(`M${X(c - hw - .5)},706.2H${X(c + hw + .5)}`, '#2a2530', 1.3, { opacity: .7 })
        + upperPaint(ctx, U, it.c1, { pat: it.patUrl, F, extra: seam + collar })
        + flat(cap, rub, rl, 2.2) + ln(`M${X(c - hw * .7)},702Q${X(c)},698 ${X(c + hw * .7)},702`, rl, 1, { opacity: .35 })
        + lacing(F, U.top + 7, 682, 4, '#fbf5ea', { tongue: shadeOf(it.c1, .08), eyelet: '#d9d2c4' });
    }) },
  { id: 'loafer', name: '便士乐福鞋', c1: '#7c2027', pat: 'none', pc: '#ffffff', tags: ['preppy', 'classic', 'office', 'vintage'],
    draw: (env, it) => shoePair(env, it, F => {
      const { ctx } = env, X = F.o, c = F.c, hw = F.hw;
      const U = upperD(F, { top: 662, dip: 5 });
      const lc = lineOf(it.c1);
      // moccasin apron: raised U seam over the toe, with stitching
      const apron = `M${X(c - hw + 5)},676Q${X(c - hw + 4)},694 ${X(c)},695Q${X(c + hw - 4)},694 ${X(c + hw - 5)},676`;
      // penny strap across the vamp with its diamond slot
      const strap = `M${X(c - hw + 3)},676Q${X(c)},671 ${X(c + hw - 3)},676L${X(c + hw - 3.5)},683Q${X(c)},678 ${X(c - hw + 3.5)},683Z`;
      const slot = `M${X(c) - 4.5},678.6L${X(c)},676.2L${X(c) + 4.5},678.6L${X(c)},681Z`;
      return instep(env, F, U, 5) + flat(soleD(F, 6), '#3a1a1a', lineOf('#3a1a1a'), 2) + ln(`M${X(c - hw)},706.4H${X(c + hw)}`, '#c89a7a', 1, { opacity: .7 })
        + upperPaint(ctx, U, it.c1, { pat: it.patUrl, F, extra: ln(apron, lc, 1.8) + stitch(apron.replace(/,(6\d\d)/g, (m, y) => ',' + (+y - 2.5)), lighten(it.c1, .38), 1) + shoeShine(F, 'polished', it.c1, 692) })
        + flat(strap, shadeOf(it.c1, .06), lc, 1.8) + path(slot, { fill: '#2a0e10' }) + ln(`M${r1(F.L(-hw + 6))},675.5Q${r1(F.L(-hw * .6))},672.6 ${r1(F.L(-hw * .2))},672.6`, mix(it.c1, '#ffffff', .6), 1.2, { opacity: .8 });
    }) },
  { id: 'mocboot', name: '复古工装靴', c1: '#c8863c', c2: '#f4e6c8', pat: 'none', pc: '#ffffff', tags: ['workwear', 'vintage', 'street', 'autumn'],
    draw: (env, it) => shoePair(env, it, F => {
      const { ctx } = env, X = F.o, c = F.c, hw = F.hw;
      const U = upperD(F, { top: 624, flare: 5, straight: true });
      const lc = lineOf(it.c1), dk = darken(it.c1, .3);
      // moc toe: U seam + stitch, a padded collar line, and the heel counter showing behind the shaft
      const moc = `M${X(c - hw + 6)},694Q${X(c - hw + 5)},681 ${X(c)},680Q${X(c + hw - 5)},681 ${X(c + hw - 6)},694`;
      const collar = ln(`M${X(U.inT + 1)},${U.top + 5}Q${X((U.inT + U.outT) / 2)},${U.top + 2} ${X(U.outT - 1)},${U.top + 5}`, dk, 1.6, { opacity: .7 });
      return flat(soleD(F, 9), it.c2, lineOf(it.c2), 2.2) + ln(`M${X(c - hw - .5)},706.5H${X(c + hw + .5)}`, lineOf(it.c2), 1.1, { opacity: .5 })
        + ln(`M${X(c - hw + 2)},709H${X(c + hw - 2)}`, darken(it.c2, .25), 1, { 'stroke-dasharray': '2 2.4' })
        + upperPaint(ctx, U, it.c1, { pat: it.patUrl, F, extra: ln(moc, dk, 1.7) + stitch(moc.replace(/,(6\d\d)/g, (m, y) => ',' + (+y + 2.6)), dk, 1) + collar + shoeShine(F, 'leather', it.c1, 696) })
        + lacing(F, U.top + 8, 676, 4, '#fbf3e2', { tongue: mix(it.c1, '#4a2e1c', .3), eyelet: '#b8892f' });
    }) },
  { id: 'brogue', name: '布洛克牛津鞋', c1: '#8a5230', pat: 'none', pc: '#ffffff', tags: ['classic', 'office', 'preppy', 'vintage'],
    draw: (env, it) => shoePair(env, it, F => {
      const { ctx } = env, X = F.o, c = F.c, hw = F.hw;
      const U = upperD(F, { top: 662 });
      const lc = lineOf(it.c1), pin = lighten(it.c1, .45);
      // wingtip: the W seam with a row of punched holes, and a medallion on the toe cap
      const wing = `M${X(c - hw + 1.5)},698Q${X(c - hw * .45)},683 ${X(c)},690Q${X(c + hw * .45)},683 ${X(c + hw - 1.5)},698`;
      const dots = path(wing, { fill: 'none', stroke: pin, 'stroke-width': 1.5, 'stroke-dasharray': '.1 3', 'stroke-linecap': 'round', transform: 'translate(0,-3)' });
      let med = '';
      for (const [dx, dy] of [[0, 0], [-3, 2], [3, 2], [0, 4], [-1.6, 6], [1.6, 6]]) med += circ(X(c) + dx, 693 + dy, .9, { fill: pin });
      // closed lacing: three short bars between the facings
      const facing = `M${X(c - 6)},667L${X(c - 5)},679M${X(c + 6)},667L${X(c + 5)},679`;
      const bars = ln(`M${X(c - 5.5)},670H${X(c + 5.5)}M${X(c - 5.2)},674H${X(c + 5.2)}M${X(c - 5)},678H${X(c + 5)}`, '#2a1a14', 1.6);
      return flat(soleD(F, 5), '#3a2420', lineOf('#3a2420'), 2) + stitch(`M${X(c - hw)},707.5H${X(c + hw)}`, '#a07858', .9)
        + upperPaint(ctx, U, it.c1, { pat: it.patUrl, F, extra: ln(wing, lc, 1.7) + dots + med + ln(facing, lc, 1.3) + shoeShine(F, 'leather', it.c1, 700) })
        + bars;
    }) },
  { id: 'chelsea', name: '切尔西靴', c1: '#3e2c26', pat: 'none', pc: '#ffffff', tags: ['classic', 'cool', 'street', 'winter'],
    draw: (env, it) => shoePair(env, it, F => {
      const { ctx, K } = env, X = F.o, c = F.c;
      const U = upperD(F, { top: 622, flare: 3.5 });
      const lc = lineOf(it.c1);
      // elastic gussets on both sides of the shaft (darker, ribbed) and a pull tab at the top
      const gus = s2 => {
        const e = legEdgeAt(K, 626), xa = s2 > 0 ? e.o + 2.5 : e.i - 2.5, xb = s2 > 0 ? K.ac + K.aw - 2 : K.ac - K.aw + 2;
        const d = `M${X(xa)},622L${X(xa - s2 * 8)},622Q${X(xb - s2 * 2)},652 ${X(xb)},668Q${X(xa)},650 ${X(xa)},622Z`;
        let rib = ''; for (let k = 1; k < 5; k++) rib += `M${X(xa - s2 * 2 * k)},624Q${X(lerp(xa, xb, .5) - s2 * 2 * k)},648 ${X(xb - s2 * (k * .6))},664`;
        return path(d, { fill: darken(it.c1, .38) }) + ln(rib, darken(it.c1, .55), .9, { opacity: .8 });
      };
      const tab = flat(`M${X(c - 4)},612h8v12h-8z`, shadeOf(it.c1, .08), lc, 1.4);
      return flat(soleD(F, 6), '#1f1612', lineOf('#1f1612'), 2) + tab
        + upperPaint(ctx, U, it.c1, { pat: it.patUrl, F, extra: gus(-1) + gus(1) + shoeShine(F, 'leather', it.c1, 694) });
    }) },
  { id: 'heels', name: '尖头高跟鞋', c1: '#e8456b', pat: 'none', pc: '#ffffff', tags: ['elegant', 'party', 'office'],
    draw: (env, it) => shoePair(env, it, F => {
      const { ctx } = env, X = F.o, c = F.c, hw = F.hw;
      const U = upperD(F, { top: 674, dip: 9, pointy: true, ankle: 1.5 });
      const lc = lineOf(it.c1);
      // slim heel showing behind the outer side, a lining edge along the low-cut throat
      const heel = flat(`M${X(c + hw - 5)},686L${X(c + hw - 1)},686L${X(c + hw - 2.5)},711L${X(c + hw - 4.5)},711Z`, darken(it.c1, .25), lc, 1.6);
      return heel + instep(env, F, U, 9) + upperPaint(ctx, U, it.c1, { pat: it.patUrl, F, extra: shoeShine(F, 'patent', it.c1, 693) })
        + ln(`M${X(U.inT + 2)},${U.top + 1.5}Q${X((U.inT + U.outT) / 2)},${U.top + 11} ${X(U.outT - 2)},${U.top + 1.5}`, lighten(it.c1, .3), 1.1, { opacity: .7 });
    }) },
  { id: 'sneaker', name: '老爹运动鞋', c1: '#fbfbfd', c2: '#7ec4ff', pat: 'none', pc: '#ffffff', tags: ['sporty', 'street', 'casual'],
    draw: (env, it) => shoePair(env, it, F => {
      const { ctx } = env, X = F.o, c = F.c, hw = F.hw;
      const U = upperD(F, { top: 660, ankle: 3.5 });
      const lc = lineOf(it.c1), ac = it.c2;
      // overlay panels: toe bumper and a side panel in the accent colour, mesh tongue, chunky wavy midsole
      const panel = `M${X(c - hw + 1)},700Q${X(c - hw + 3)},686 ${X(c - hw * .35)},684Q${X(c - hw * .1)},694 ${X(c + hw * .2)},696Q${X(c + hw * .7)},690 ${X(c + hw - .5)},698L${X(c + hw)},706L${X(c - hw)},706Z`;
      const mid = soleD(F, 11, 1);
      const wave = `M${X(c - hw)},705Q${X(c - hw * .5)},702 ${X(c)},705Q${X(c + hw * .5)},708 ${X(c + hw)},704`;
      return flat(mid, '#ffffff', '#9a93b0', 2.2) + ln(wave, ac, 2.2) + ln(`M${X(c - hw + 1)},709.5H${X(c + hw - 1)}`, '#9a93b0', 1, { opacity: .5 })
        + upperPaint(ctx, U, it.c1, { pat: it.patUrl, F, extra: path(panel, { fill: lighten(ac, .25), stroke: lineOf(ac), 'stroke-width': 1.4 }) })
        + lacing(F, U.top + 5, 682, 3, '#f2f0f8', { tongue: '#e8e6f0', eyelet: '#ffffff', w: 2.2 });
    }) },
  { id: 'ballet', name: '芭蕾绑带鞋', c1: '#ffc2d4', pat: 'none', pc: '#ffffff', tags: ['sweet', 'elegant', 'cute', 'fantasy'],
    draw: (env, it) => {
      const { K, ctx } = env;
      // ribbons criss-cross up each ankle (drawn under the shoes)
      let rib = '';
      for (const sd of [-1, 1]) {
        const X = d => CX + sd * d;
        for (let y = 600; y < 664; y += 16) { const a = legEdgeAt(K, y), b = legEdgeAt(K, y + 16); rib += `M${X(a.i - 1)},${y}L${X(b.o + 1)},${y + 16}M${X(a.o + 1)},${y}L${X(b.i - 1)},${y + 16}`; }
      }
      return ln(rib, darken(it.c1, .15), 3.4) + ln(rib, it.c1, 2) + shoePair(env, it, F => {
        const X = F.o, c = F.c;
        const U = upperD(F, { top: 674, dip: 8, ankle: 1.5 });
        const bow = flat(smooth([[X(c), 681], [X(c - 6), 677], [X(c - 7), 685, 1], [X(c - 1), 683], [X(c + 1), 683], [X(c + 7), 685, 1], [X(c + 6), 677]]), shadeOf(it.c1, .1), lineOf(it.c1), 1.4);
        return instep(env, F, U, 8) + flat(soleD(F, 4, .5), shadeOf(it.c1, .25), lineOf(it.c1), 1.8)
          + upperPaint(ctx, U, it.c1, { pat: it.patUrl, F, extra: shoeShine(F, 'satin', it.c1, 692) }) + bow;
      });
    } },
  { id: 'embroidered', name: '绣花布鞋', c1: '#2b2530', c2: '#ff6f91', pat: 'none', pc: '#ffffff', tags: ['chinese', 'vintage', 'cute'],
    draw: (env, it) => shoePair(env, it, F => {
      const { ctx } = env, X = F.o, c = F.c, hw = F.hw;
      const U = upperD(F, { top: 667, dip: 6 });
      const fx = X(c), fy = 692;
      let fl = '';
      for (let k = 0; k < 5; k++) { const a = k * 1.2566 - 1.57; fl += circ(r1(fx + Math.cos(a) * 3.4), r1(fy + Math.sin(a) * 3.4), 2.4, { fill: it.c2 }); }
      fl += circ(fx, fy, 1.6, { fill: '#ffe066' }) + ln(`M${fx - 9},${fy + 2}q-4,-4 -8,-2M${fx + 9},${fy + 2}q4,-4 8,-2`, '#7cc37a', 1.6);
      // layered white cloth sole with stitch rows
      const sl = soleD(F, 7);
      return instep(env, F, U, 6) + flat(sl, '#f6f1e6', '#8a8070', 2) + ln(`M${X(c - hw)},707.3H${X(c + hw)}`, '#c8bea8', 1) + stitch(`M${X(c - hw + 2)},709.4H${X(c + hw - 2)}`, '#a89c84', .8)
        + upperPaint(ctx, U, it.c1, { pat: it.patUrl, F, extra: ln(`M${X(U.inT + 1)},${U.top + 2}Q${X((U.inT + U.outT) / 2)},${U.top + 8} ${X(U.outT - 1)},${U.top + 2}`, lighten(it.c1, .3), 1.6, { opacity: .8 }) + fl });
    }) },
  { id: 'boat', name: '复古船鞋', c1: '#9c6a3c', pat: 'none', pc: '#ffffff', tags: ['preppy', 'summer', 'casual', 'vintage'],
    draw: (env, it) => shoePair(env, it, F => {
      const { ctx } = env, X = F.o, c = F.c, hw = F.hw;
      const U = upperD(F, { top: 663, dip: 3 });
      const lc = lineOf(it.c1), raw = '#e8d2a8';
      // moc vamp stitch, a rawhide lace running round the collar and tied on the outer side, white sole with siping
      const vamp = `M${X(c - hw + 5)},680Q${X(c - hw + 4)},696 ${X(c)},697Q${X(c + hw - 4)},696 ${X(c + hw - 5)},680`;
      const lace = `M${X(U.inT + 1)},${U.top + 3}Q${X((U.inT + U.outT) / 2)},${U.top + 6} ${X(U.outT - 1)},${U.top + 3}`;
      const tie = ln(`M${X(U.outT - 1)},${U.top + 3}l${F.sd * 5},7M${X(U.outT - 1)},${U.top + 3}l${F.sd * 1.5},9`, raw, 1.8) + circ(X(U.outT - 1), U.top + 3, 1.8, { fill: raw, stroke: '#7a5a3a', 'stroke-width': .8 });
      return instep(env, F, U, 3) + flat(soleD(F, 6), '#f6f1e6', '#8a8070', 2) + ln(`M${X(c - hw + 1)},708.6H${X(c + hw - 1)}`, '#3a2a20', 1, { opacity: .8 })
        + upperPaint(ctx, U, it.c1, { pat: it.patUrl, F, extra: ln(vamp, lc, 1.6) + stitch(vamp.replace(/,(6\d\d)/g, (m, y) => ',' + (+y - 2.4)), raw, 1.1) + shoeShine(F, 'leather', it.c1, 692) })
        + ln(lace, raw, 2) + tie;
    }) },
);
