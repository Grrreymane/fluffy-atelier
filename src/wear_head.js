/* ===== wear_head.js — hats, glasses, face stickers ===== */
const hp = (env, it, d, o = {}) => paint(env.ctx, d, o.col || it.c1, { pat: o.noPat ? null : it.patUrl, shade: o.shade || 'rad', extra: o.extra, sw: o.sw ?? 2.6 });

/* ---------- fitting hats to the head ----------
   Every species has its own cranium (TOON_HEADS), so hats are built from that outline instead of fixed numbers.
   Light comes from the upper left like everywhere else: cel shadow on the right and under edges, a lighter tone
   (never white) on matte tops, white specular only on shiny bits such as a metal buckle. */
function hatFit(st) {
  const kind = headKindOf(st);
  return { kind, T: TOON_HEADS[kind].right[0][1] - .8, W: y => craniumX(kind, y) - 200, arc: (y0, t) => craniumArc(kind, y0, t), headD: toonHeadPath(kind, '_hat', []) };
}
/* closed shape from an arc (left end -> right end) and the points of its lower edge (right -> left) */
const arcShape = (arc, lower = []) => smooth([[...arc[0], 1], ...arc.slice(1, -1), [...arc[arc.length - 1], 1], ...lower]);
/* meridian (a seam or knit rib) over a dome: the right half of its arc squeezed towards the centre line */
function meridian(arc, u) {
  const half = arc.slice((arc.length - 1) / 2);
  return smooth(half.map(([x, y]) => [r1(200 + (x - 200) * u), y]), false);
}
const hatShade = celShade, hatLit = celLit;
/* one hat part: fill (+ pattern), details and light clipped inside, then the ink line */
function hatPart(ctx, d, col, o = {}) {
  const sid = ctx.shape(d);
  let s = use(sid, { fill: col });
  if (o.pat) s += use(sid, { fill: o.pat });
  let inner = o.extra || '';
  if (o.lit) inner += hatLit(ctx, d, ...o.lit);
  if (o.shade !== false) inner += hatShade(ctx, d, ...(o.shade || []));
  if (o.after) inner += o.after;
  if (inner) s = g(s + inner, { 'clip-path': ctx.clipUse(sid) });
  return s + use(sid, { fill: 'none', stroke: o.line || lineOf(col), 'stroke-width': o.sw ?? 2.6, 'stroke-linejoin': 'round' });
}
/* soft shadow the hat casts on the face, just under its front edge (edge points left -> right), kept inside the head */
function browShadow(ctx, H, edge, depth = 7, op = .13) {
  const lo = edge.slice().reverse().map(([x, y]) => [x + 2, y + depth]);
  const d = smooth([[...edge[0], 1], ...edge.slice(1, -1), [...edge[edge.length - 1], 1], [...lo[0], 1], ...lo.slice(1, -1), [...lo[lo.length - 1], 1]]);
  return path(d, shadowFill(op, { 'clip-path': ctx.clip(H.headD) }));
}
/* an edge that bows by `bow` at the centre between x0 and x1 (bow < 0: the centre is higher) */
const bowEdge = (x0, x1, y, bow, n = 6) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, x = lerp(x0, x1, u), v = (u - .5) * 2; return [r1(x), r1(y + bow * (1 - v * v))]; });
/* flat brim seen slightly from above: back edge, rounded ends, front edge dipping by `dip` */
function brimPts(cx, y, w, back, front, endDrop = 2) {
  return [[cx - w, y + endDrop], [cx - w * .72, y - back * .72], [cx, y - back], [cx + w * .72, y - back * .72], [cx + w, y + endDrop],
    [cx + w * .74, y + front * .62], [cx, y + front], [cx - w * .74, y + front * .62]];
}

ITEMS.hat.push(
  { id: 'beret', covers: true, name: '贝雷帽', c1: '#c4223f', pat: 'none', pc: '#ffffff', tags: ['cute', 'vintage', 'elegant', 'preppy'],
    draw: (env, it) => {
      const { ctx } = env, H = hatFit(env.st), c = it.c1, lc = lineOf(c), w = H.W(166), T = H.T;
      // a soft disc worn tilted to the right: wider than the head, its rim arching over the forehead
      const L = 200 - w - 19, Rr = 200 + w + 25;
      const rim = [[L, 173], [200 - w * .5, 166], [200, 163.5], [200 + w * .5, 166], [Rr, 178]];
      const body = [[L, 173, 1], [L - 4.5, 161], [L + 4, 139], [200 - w * .66, T - 6], [200 - w * .32, T - 19], [202, T - 23], [200 + w * .4, T - 20], [200 + w * .77, T - 6], [Rr - 1, T + 18], [Rr + 3.5, 164], [Rr, 178, 1],
        [200 + w * .5, 166], [200, 163.5], [200 - w * .5, 166]];
      const d = smooth(body);
      const sx = 200 + w * .3, sy = T - 19;
      const stem = flat(`M${r1(sx - 6)},${r1(sy + 5)}C${r1(sx - 8)},${r1(sy - 10)} ${r1(sx)},${r1(sy - 21)} ${r1(sx + 12)},${r1(sy - 20)}C${r1(sx + 19)},${r1(sy - 19)} ${r1(sx + 18)},${r1(sy - 9)} ${r1(sx + 10)},${r1(sy - 8)}C${r1(sx + 5)},${r1(sy - 7)} ${r1(sx + 5)},${r1(sy)} ${r1(sx + 6)},${r1(sy + 5)}Z`, c, lc, 2.4)
        + ln(`M${r1(sx - 2)},${r1(sy - 6)}Q${r1(sx + 1)},${r1(sy - 12)} ${r1(sx + 7)},${r1(sy - 13)}`, '#fff', 1.6, { opacity: .16 });
      // darker rim band (the underside rolling in), and the fold where the top drapes over to the right
      const band = ln(smooth(rim, false), darken(c, .2), 17);
      const fold = ln(`M${r1(200 + w * .5)},${r1(T - 5)}Q${r1(Rr - 8)},${r1(T + 12)} ${r1(Rr - 8)},${r1(167)}`, darken(c, .28), 1.8, { opacity: .55 });
      return browShadow(ctx, H, bowEdge(L + 4, Rr - 4, 167.5, -4).map(([x, y], i, a) => [x, y + (i / (a.length - 1)) * 6]), 6, .09) + stem
        + hatPart(ctx, d, c, { pat: it.patUrl, extra: band, lit: [17, 15, .15], shade: [10, 4, .14], after: fold, sw: 2.8 });
    } },
  { id: 'cap', covers: true, name: '棒球帽', c1: '#23396b', c2: '#f3ead6', pat: 'none', pc: '#ffffff', tags: ['sporty', 'street', 'casual', 'preppy'],
    draw: (env, it) => {
      const { ctx } = env, H = hatFit(env.st), c = it.c1, lc = lineOf(c), w = H.W(164);
      // six-panel crown hugging the head, button on top, seams down to the band
      const arc = H.arc(168, k => 8 + 9 * k);
      const crown = arcShape(arc);
      const seams = ln(meridian(arc, 0) + meridian(arc, .62) + meridian(arc, -.62), lc, 1.3, { opacity: .45 });
      const top = arc[(arc.length - 1) / 2];
      const eyelets = [-1, 1].map(s => circ(r1(200 + s * w * .4), r1(top[1] + 16), 1.6, { fill: darken(c, .3) })).join('');
      // visor: attached along an arch at the crown's front, its rim swinging down towards the viewer
      const vw = w + 6;
      const visor = smooth([[200 - vw, 168, 1], [200 - vw * .55, 160.5], [200, 158.5], [200 + vw * .55, 160.5], [200 + vw, 168, 1], [200 + vw * .52, 178.5], [200, 181.5], [200 - vw * .52, 178.5]]);
      const vStitch = stitch(smooth([[200 - vw + 6, 169], [200, 177.5], [200 + vw - 6, 169]], false), lighten(c, .35), 1) + stitch(smooth([[200 - vw + 11, 167.5], [200, 174], [200 + vw - 11, 167.5]], false), lighten(c, .35), 1);
      const rimEdge = bowEdge(200 - vw + 2, 200 + vw - 2, 170, 11.5);
      return browShadow(ctx, H, rimEdge, 9, .16)
        + hatPart(ctx, crown, c, { pat: it.patUrl, lit: [7, 8, .1], shade: [10, 3, .15], after: seams + eyelets })
        + circ(200, r1(top[1] + 1.5), 4.6, { fill: c, stroke: lc, 'stroke-width': 1.8 })
        + path(starD(200, r1(top[1] + 27), 10, .45), { fill: it.c2, stroke: lineOf(it.c2), 'stroke-width': 1.2 })
        + hatPart(ctx, visor, shadeOf(c, .04), { lit: [4, 6, .1], shade: [7, 3.2, .2], after: vStitch });
    } },
  { id: 'newsboy', covers: true, name: '报童帽', c1: '#7a6a55', pat: 'herring', pc: '#4e4233', tags: ['vintage', 'workwear', 'classic', 'autumn'],
    draw: (env, it) => {
      const { ctx } = env, H = hatFit(env.st), c = it.c1, lc = lineOf(c), w = H.W(162);
      // eight soft panels puffing out over a short brim; the front panel overhangs it
      const arc = H.arc(162, k => 15 + 10 * k);
      const crown = arcShape(arc, [[200 + w * .55, 164], [200, 165.5], [200 - w * .55, 164]]);
      const seams = ln([0, .4, -.4, .78, -.78].map(u => meridian(arc, u)).join(''), lc, 1.2, { opacity: .45 });
      const top = arc[(arc.length - 1) / 2];
      const bw = w * .78;
      const brim = smooth([[200 - bw, 162, 1], [200, 159], [200 + bw, 162, 1], [200 + bw * .55, 175.5], [200, 179], [200 - bw * .55, 175.5]]);
      const brimStitch = stitch(smooth([[200 - bw + 7, 166], [200, 175], [200 + bw - 7, 166]], false), lighten(c, .3), 1);
      return browShadow(ctx, H, bowEdge(200 - bw + 4, 200 + bw - 4, 172, 6.5), 8, .15)
        + hatPart(ctx, brim, shadeOf(c, .06), { pat: it.patUrl, shade: [5, -4, .2], after: brimStitch })
        + hatPart(ctx, crown, c, { pat: it.patUrl, lit: [8, 9, .13], shade: [10, 5, .15], after: seams })
        + circ(200, r1(top[1] + 1), 4.6, { fill: c, stroke: lc, 'stroke-width': 1.8 });
    } },
  { id: 'railroad', covers: true, name: '铁路工帽', c1: '#2c3b5e', pat: 'pin', pc: '#eeebe2', tags: ['workwear', 'vintage', 'cute'],
    draw: (env, it) => {
      const { ctx } = env, H = hatFit(env.st), c = it.c1, lc = lineOf(c), w = H.W(160);
      // engineer cap: a puffed, pleated crown gathered into a stitched band, short stiff visor
      const arc = H.arc(158, k => 9 + 20 * k * k);
      const crown = arcShape(arc);
      const pleats = ln([.25, -.25, .55, -.55, .82, -.82].map(u => meridian(arc, u)).join(''), lc, 1.2, { opacity: .35 });
      const bw = w + 8;
      const band = smooth([[200 - bw, 156, 1], [200, 145], [200 + bw, 156, 1], [200 + bw, 167, 1], [200, 158], [200 - bw, 167, 1]]);
      const bandStitch = stitch(smooth([[200 - bw + 3, 158], [200, 148], [200 + bw - 3, 158]], false), lighten(c, .4), 1) + stitch(smooth([[200 - bw + 3, 164], [200, 155], [200 + bw - 3, 164]], false), lighten(c, .4), 1);
      const vw = w * .82;
      const visor = smooth([[200 - vw, 163, 1], [200, 157], [200 + vw, 163, 1], [200 + vw * .55, 172], [200, 175.5], [200 - vw * .55, 172]]);
      return browShadow(ctx, H, bowEdge(200 - vw + 3, 200 + vw - 3, 170, 5.5), 8, .15)
        + hatPart(ctx, crown, c, { pat: it.patUrl, lit: [8, 9, .12], shade: [10, 5, .15], after: pleats })
        + hatPart(ctx, band, c, { pat: it.patUrl, shade: [6, 3, .14], after: bandStitch })
        + hatPart(ctx, visor, darken(c, .12), { shade: [6, 3, .2], lit: [4, 5, .08] });
    } },
  { id: 'beanie', covers: true, name: '针织毛线帽', c1: '#c8433a', pat: 'none', pc: '#ffffff', tags: ['workwear', 'street', 'winter', 'casual'],
    draw: (env, it) => {
      const { ctx } = env, H = hatFit(env.st), c = it.c1, lc = lineOf(c), w = H.W(166);
      // ribbed dome, fuller than the head, sitting in a wide folded cuff that covers the ear roots
      const wc = w + 20, yT = 136, yB = 173, drop = 15;
      const a = wc - 6, cy = yT + 15, b = cy - (H.T - 30);
      const arc = Array.from({ length: 13 }, (_, i) => { const t = Math.PI * (1 + i / 12); return [r1(200 + Math.cos(t) * a), r1(cy + Math.sin(t) * b)]; });
      const dome = arcShape(arc);
      const ribs = ln(Array.from({ length: 15 }, (_, i) => meridian(arc, -.91 + i * .13)).join(''), lc, 1.1, { opacity: .3 });
      const top = bowEdge(200 - wc + 2, 200 + wc - 2, yT + drop, -drop), bot = bowEdge(200 + wc - 2, 200 - wc + 2, yB + drop, -drop);
      const cuff = smooth([...top, [200 + wc + 1.5, (yT + yB) / 2 + drop], ...bot, [200 - wc - 1.5, (yT + yB) / 2 + drop]]);
      let cr = ''; for (let x = 200 - wc; x <= 200 + wc; x += 6.5) cr += `M${r1(x)},${yT - 4}V${yB + drop + 4}`;
      const lx = 200 + wc * .56, ly = yT + drop * (1 - .56 * .56) * -1 + drop + 6;
      const label = g(path(`M${r1(lx - 13)},${r1(ly)}h26v15h-26z`, { fill: '#f4ecd8', stroke: '#a89b80', 'stroke-width': 1.3 }) + ln(`M${r1(lx - 10)},${r1(ly + 3)}h20`, '#c9bda2', .9, { 'stroke-dasharray': '2 1.6' }), { transform: `rotate(6 ${r1(lx)} ${r1(ly + 7)})` });
      return browShadow(ctx, H, bot.slice().reverse(), 6, .09)
        + hatPart(ctx, dome, c, { pat: it.patUrl, shade: [12, 5, .15], after: ribs })
        + hatPart(ctx, cuff, shadeOf(c, .03), { pat: it.patUrl, shade: [7, 5, .16], after: ln(cr, lc, 1.1, { opacity: .34 }), sw: 2.8 }) + label;
    } },
  { id: 'fedora', covers: true, name: '软呢帽', c1: '#4c433b', c2: '#2a2420', pat: 'none', pc: '#ffffff', tags: ['classic', 'vintage', 'elegant', 'cool'],
    draw: (env, it) => {
      const { ctx } = env, H = hatFit(env.st), c = it.c1, lc = lineOf(c), w = H.W(160), yb = 153;
      const Wb = w + 40, cw = w * .9, ch = 58;
      const brim = smooth(brimPts(200, yb, Wb, 12, 15));
      // teardrop crown: a soft dip in the middle of the top, two front pinches, ribbon band with a side bow
      const crown = smooth([[200 - cw, yb + 2, 1], [200 - cw * .96, yb - ch * .45], [200 - cw * .84, yb - ch * .8], [200 - cw * .56, yb - ch], [200 - cw * .2, yb - ch * .98], [200, yb - ch * .86],
        [200 + cw * .2, yb - ch * .98], [200 + cw * .56, yb - ch], [200 + cw * .84, yb - ch * .8], [200 + cw * .96, yb - ch * .45], [200 + cw, yb + 2, 1], [200 + cw * .5, yb + 6], [200, yb + 7], [200 - cw * .5, yb + 6]]);
      const pinch = ln(`M${r1(200 - cw * .44)},${r1(yb - ch * .9)}Q${r1(200 - cw * .24)},${r1(yb - ch * .66)} ${r1(200 - cw * .3)},${r1(yb - ch * .36)}M${r1(200 + cw * .44)},${r1(yb - ch * .9)}Q${r1(200 + cw * .24)},${r1(yb - ch * .66)} ${r1(200 + cw * .3)},${r1(yb - ch * .36)}M200,${r1(yb - ch * .86)}V${r1(yb - ch * .66)}`, darken(c, .3), 1.6, { opacity: .6 });
      const band = smooth([[200 - cw, yb - 9, 1], [200, yb - 4], [200 + cw, yb - 9, 1], [200 + cw, yb + 2, 1], [200 + cw * .5, yb + 6], [200, yb + 7], [200 - cw * .5, yb + 6], [200 - cw, yb + 2, 1]]);
      const bx = 200 - cw + 10;
      const bow = flat(`M${bx - 2},${yb - 6}l-7,-3l-1,8z`, it.c2, lineOf(it.c2), 1.4) + flat(`M${bx - 2},${yb - 6}l-5,6l3,6l4,-5z`, it.c2, lineOf(it.c2), 1.4) + circ(bx - 2, yb - 4, 2.4, { fill: it.c2, stroke: lineOf(it.c2), 'stroke-width': 1.2 });
      return browShadow(ctx, H, [[200 - Wb + 8, yb + 6], [200 - Wb * .6, yb + 11], [200, yb + 15], [200 + Wb * .6, yb + 11], [200 + Wb - 8, yb + 6]], 8, .15)
        + hatPart(ctx, brim, c, { pat: it.patUrl, lit: [10, 6, .1], shade: [10, 3, .17] })
        + hatPart(ctx, crown, c, { pat: it.patUrl, lit: [8, 9, .12], shade: [10, 4, .16], after: pinch })
        + hatPart(ctx, band, it.c2, { shade: [6, 2, .2], sw: 2 }) + bow;
    } },
  { id: 'boater', covers: true, name: '硬草帽', c1: '#efd38a', c2: '#23396b', pat: 'none', pc: '#ffffff', tags: ['preppy', 'vintage', 'summer', 'classic'],
    draw: (env, it) => {
      const { ctx } = env, H = hatFit(env.st), c = it.c1, lc = lineOf(c), w = H.W(158), yb = 152;
      const Wb = w + 35, cw = w * .86, ch = 38;
      const bp = brimPts(200, yb, Wb, 9, 13, 1);
      const brim = smooth(bp);
      let weave = '';
      for (const k of [.92, .8, .68]) weave += smooth(brimPts(200, yb, Wb * k, 9 * k, 13 * k, 1), true).replace('Z', '');
      // flat-topped straw cylinder, striped ribbon round the base
      const crown = smooth([[200 - cw, yb + 2, 1], [200 - cw, yb - ch, 1], [200 - cw * .5, yb - ch + 4], [200, yb - ch + 5], [200 + cw * .5, yb - ch + 4], [200 + cw, yb - ch, 1], [200 + cw, yb + 2, 1],
        [200 + cw * .5, yb + 5.5], [200, yb + 6.5], [200 - cw * .5, yb + 5.5]]);
      let rows = ''; for (let y = yb - ch + 9; y < yb - 10; y += 4.2) rows += smooth([[200 - cw, y], [200, y + 5], [200 + cw, y]], false);
      const topD = `M${r1(200 - cw)},${yb - ch}a${r1(cw)},5.5 0 1,0 ${r1(2 * cw)},0a${r1(cw)},5.5 0 1,0 ${r1(-2 * cw)},0Z`;
      const band = smooth([[200 - cw, yb - 12, 1], [200, yb - 6.5], [200 + cw, yb - 12, 1], [200 + cw, yb + 2, 1], [200 + cw * .5, yb + 5.5], [200, yb + 6.5], [200 - cw * .5, yb + 5.5], [200 - cw, yb + 2, 1]]);
      const stripe = path(smooth([[200 - cw - 2, yb - 7.5], [200, yb - 2], [200 + cw + 2, yb - 7.5], [200 + cw + 2, yb - 3.5], [200, yb + 2], [200 - cw - 2, yb - 3.5]]), { fill: '#c9374b' });
      return browShadow(ctx, H, [[200 - Wb + 8, yb + 5], [200 - Wb * .6, yb + 9.5], [200, yb + 13], [200 + Wb * .6, yb + 9.5], [200 + Wb - 8, yb + 5]], 8, .14)
        + hatPart(ctx, brim, c, { pat: it.patUrl, extra: ln(weave, lc, .9, { opacity: .3 }), lit: [10, 5, .14], shade: [10, 3, .16] })
        + hatPart(ctx, crown, c, { pat: it.patUrl, extra: ln(rows, lc, .9, { opacity: .3 }), shade: [10, 0, .16] })
        + hatPart(ctx, topD, lighten(c, .16), { shade: [8, 2, .1], sw: 2.2 })
        + hatPart(ctx, band, it.c2, { extra: stripe, shade: [6, 0, .18], sw: 2 });
    } },
  { id: 'sunhat', covers: true, name: '遮阳大草帽', c1: '#f4ddb0', c2: '#ff8fab', pat: 'none', pc: '#ffffff', tags: ['summer', 'sweet', 'nature', 'elegant'],
    draw: (env, it) => {
      const { ctx } = env, H = hatFit(env.st), c = it.c1, lc = lineOf(c), w = H.W(156), yb = 151;
      const Wb = w + 64, cw = w * .88;
      // wide floppy brim: scalloped edge, the sides and front drooping
      const rim = k => { const pts = []; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, s = Math.sin(a), co = Math.cos(a);
        pts.push([r1(200 + co * Wb * k * (1 + .022 * Math.cos(a * 9))), r1(yb + (s > 0 ? s * 24 : s * 15) * k + 7 * co * co * k)]); } return pts; };
      const brim = smooth(rim(1));
      let weave = ''; for (const k of [.88, .74]) weave += smooth(rim(k), true);
      const crown = smooth([[200 - cw, yb + 3, 1], [200 - cw * .98, yb - 21], [200 - cw * .8, yb - 38], [200 - cw * .45, yb - 47], [200, yb - 49], [200 + cw * .45, yb - 47],
        [200 + cw * .8, yb - 38], [200 + cw * .98, yb - 21], [200 + cw, yb + 3, 1], [200 + cw * .5, yb + 7], [200, yb + 8], [200 - cw * .5, yb + 7]]);
      let rows = ''; for (let y = yb - 38; y < yb - 10; y += 5) rows += smooth([[200 - cw, y + 2], [200, y + 6], [200 + cw, y + 2]], false);
      const band = smooth([[200 - cw, yb - 9, 1], [200, yb - 3], [200 + cw, yb - 9, 1], [200 + cw, yb + 3, 1], [200 + cw * .5, yb + 7], [200, yb + 8], [200 - cw * .5, yb + 7], [200 - cw, yb + 3, 1]]);
      const bx = 200 + cw - 6, by = yb - 3, pc = it.c2, pl = lineOf(pc);
      const bow = flat(`M${bx},${by + 2}Q${bx + 8},${by + 16} ${bx + 3},${by + 30}L${bx + 10},${by + 27}Q${bx + 13},${by + 14} ${bx + 3},${by + 1}Z`, pc, pl, 1.6)
        + flat(smooth([[bx, by], [bx - 12, by - 9], [bx - 14, by + 5, 1], [bx - 3, by + 2], [bx + 3, by + 2], [bx + 14, by + 5, 1], [bx + 12, by - 9]]), pc, pl, 1.8) + circ(bx, by + 1, 3.2, { fill: pc, stroke: pl, 'stroke-width': 1.4 });
      return browShadow(ctx, H, [[200 - Wb * .5, yb + 18], [200, yb + 24], [200 + Wb * .5, yb + 18]], 10, .14)
        + hatPart(ctx, brim, c, { pat: it.patUrl, extra: ln(weave, lc, .9, { opacity: .28 }), lit: [12, 6, .12], shade: [12, 4, .15] })
        + hatPart(ctx, crown, c, { pat: it.patUrl, extra: ln(rows, lc, .9, { opacity: .28 }), lit: [8, 8, .12], shade: [10, 4, .15] })
        + hatPart(ctx, band, pc, { shade: [6, 0, .16], sw: 1.8 }) + bow;
    } },
  { id: 'witch', covers: true, name: '巫师帽', c1: '#3a2a62', c2: '#ffd166', pat: 'none', pc: '#ffffff', tags: ['fantasy', 'party', 'cool'],
    draw: (env, it) => {
      const { ctx } = env, H = hatFit(env.st), c = it.c1, lc = lineOf(c), w = H.W(158), yb = 152;
      const Wb = w + 46, cw = w * .84;
      const bp = brimPts(200, yb, Wb, 12, 18, -1);
      const brim = smooth(bp);
      // tall cone whose tip flops over to the right
      const cone = smooth([[200 - cw, yb + 2, 1], [200 - cw * .74, yb - 30], [200 - cw * .4, yb - 62], [200 - 5, yb - 90], [200 + 20, yb - 110], [200 + 50, yb - 118, 1], [200 + 33, yb - 101],
        [200 + 25, yb - 82], [200 + cw * .45, yb - 52], [200 + cw * .78, yb - 22], [200 + cw, yb + 2, 1], [200 + cw * .5, yb + 6], [200, yb + 7], [200 - cw * .5, yb + 6]]);
      const band = smooth([[200 - cw * .98, yb - 11, 1], [200, yb - 5], [200 + cw * .98, yb - 11, 1], [200 + cw, yb + 2, 1], [200 + cw * .5, yb + 6], [200, yb + 7], [200 - cw * .5, yb + 6], [200 - cw, yb + 2, 1]]);
      const buckle = path(`M191,${yb - 8}h18v13h-18z`, { fill: 'none', stroke: '#5a4520', 'stroke-width': 4.4 }) + path(`M191,${yb - 8}h18v13h-18z`, { fill: 'none', stroke: '#ffe9a8', 'stroke-width': 2.4 })
        + ln(`M192.5,${yb - 6.5}h6`, '#fff', 1.4, { opacity: .9 });
      const stars = path(starD(214, yb - 62, 7, .45), { fill: it.c2 }) + path(starD(194, yb - 36, 4.4, .45), { fill: it.c2 }) + path(starD(226, yb - 26, 3.4, .45), { fill: it.c2 });
      return browShadow(ctx, H, [[200 - Wb + 10, yb + 6], [200 - Wb * .6, yb + 13], [200, yb + 18], [200 + Wb * .6, yb + 13], [200 + Wb - 10, yb + 6]], 8, .16)
        + hatPart(ctx, brim, c, { pat: it.patUrl, lit: [10, 6, .1], shade: [10, 3, .18] })
        + hatPart(ctx, cone, c, { pat: it.patUrl, extra: stars, lit: [7, 8, .1], shade: [9, 4, .18] })
        + hatPart(ctx, band, it.c2, { shade: [6, 0, .16], sw: 2 }) + buckle;
    } },
  { id: 'bandana', covers: true, name: '复古头巾', c1: '#c8243c', pat: 'dot', pc: '#ffffff', tags: ['workwear', 'vintage', 'street', 'summer'],
    draw: (env, it) => {
      const { ctx } = env, H = hatFit(env.st), c = it.c1, lc = lineOf(c), w = H.W(168);
      // kerchief tied snug over the head: folded hem across the forehead, knot and tails on the right
      const arc = H.arc(172, k => 3.5 + 5 * k);
      const hem = bowEdge(arc[arc.length - 1][0], arc[0][0], 172, -10);
      const d = arcShape(arc, hem.slice(1, -1));
      const hemLine = ln(smooth(bowEdge(arc[0][0] + 2, arc[arc.length - 1][0] - 2, 165, -9), false), lc, 1.4, { opacity: .5 });
      const kx = 200 + w + 4, ky = 160;
      const folds = ln(`M${kx - 8},${ky - 4}Q${200 + w * .45},${H.T + 18} ${200 - w * .1},${H.T + 10}M${kx - 6},${ky + 3}Q${200 + w * .35},${ky - 18} ${200 - w * .25},${ky - 22}`, darken(c, .3), 1.4, { opacity: .45 });
      const tails = hatPart(ctx, `M${kx - 2},${ky - 2}L${kx + 22},${ky - 12}L${kx + 18},${ky + 2}L${kx + 2},${ky + 4}Z`, c, { pat: it.patUrl, shade: [5, 3, .2], sw: 2.2 })
        + hatPart(ctx, `M${kx},${ky + 2}L${kx + 16},${ky + 22}L${kx + 4},${ky + 24}L${kx - 4},${ky + 6}Z`, c, { pat: it.patUrl, shade: [5, 3, .2], sw: 2.2 });
      const knot = hatPart(ctx, `M${kx - 7},${ky - 5}Q${kx},${ky - 11} ${kx + 6},${ky - 4}Q${kx + 8},${ky + 3} ${kx + 1},${ky + 7}Q${kx - 7},${ky + 6} ${kx - 7},${ky - 5}Z`, shadeOf(c, .05), { pat: it.patUrl, shade: [4, 3, .22], sw: 2.2 });
      return browShadow(ctx, H, bowEdge(arc[0][0] + 4, arc[arc.length - 1][0] - 4, 172, -10), 6, .12) + tails
        + hatPart(ctx, d, c, { pat: it.patUrl, lit: [7, 8, .12], shade: [10, 4, .15], after: folds + hemLine }) + knot;
    } },
  { id: 'crown', name: '小皇冠', c1: '#f2c75c', c2: '#ff4f8b', pat: 'none', pc: '#ffffff', tags: ['fantasy', 'party', 'elegant'],
    draw: (env, it) => {
      const d = 'M156,112L150,70L172,90L186,58L200,84L214,58L228,90L250,70L244,112Q200,104 156,112Z';
      return hp(env, it, d, { shade: 'tb' }) + ln('M156,104Q200,96 244,104', lighten(it.c1, .5), 2) + circ(200, 98, 5, { fill: it.c2, stroke: lineOf(it.c2), 'stroke-width': 1.4 })
        + circ(176, 100, 3.5, { fill: '#5bc0eb' }) + circ(224, 100, 3.5, { fill: '#5bc0eb' }) + circ(150, 68, 4, { fill: it.c1, stroke: lineOf(it.c1), 'stroke-width': 1.4 }) + circ(186, 56, 4, { fill: it.c1, stroke: lineOf(it.c1), 'stroke-width': 1.4 }) + circ(214, 56, 4, { fill: it.c1, stroke: lineOf(it.c1), 'stroke-width': 1.4 }) + circ(250, 68, 4, { fill: it.c1, stroke: lineOf(it.c1), 'stroke-width': 1.4 });
    } },
  { id: 'flowercrown', name: '花环', c1: '#ffb3c8', c2: '#fff3a8', pat: 'none', pc: '#ffffff', tags: ['nature', 'sweet', 'fantasy', 'summer'],
    draw: (env, it) => {
      let s = '';
      const pts = [[122, 140], [140, 122], [162, 112], [186, 106], [212, 106], [238, 110], [260, 120], [278, 136]];
      s += ln(smooth(pts, false), '#5f9e5a', 4);
      pts.forEach(([x, y], i) => {
        s += ell(x + 9, y + 6, 7, 3.4, { fill: '#7cc37a', stroke: '#4a7e46', 'stroke-width': 1, transform: `rotate(${30 + i * 10} ${x + 9} ${y + 6})` });
      });
      pts.forEach(([x, y], i) => {
        const c = i % 3 === 1 ? '#ffffff' : i % 3 === 2 ? lighten(it.c1, .3) : it.c1;
        for (let k = 0; k < 5; k++) { const a = k * 1.2566 + i; s += circ(x + Math.cos(a) * 6, y + Math.sin(a) * 6, 5.4, { fill: c, stroke: lineOf(c), 'stroke-width': 1.2 }); }
        s += circ(x, y, 3.8, { fill: it.c2, stroke: lineOf(it.c2), 'stroke-width': 1 });
      });
      return s;
    } },
  { id: 'bigbow', name: '大蝴蝶结', c1: '#ff6f91', pat: 'none', pc: '#ffffff', tags: ['cute', 'sweet', 'party'],
    draw: (env, it) => {
      const d = smooth([[236, 104], [256, 78], [282, 74], [292, 96], [280, 116], [252, 114, 1], [264, 140], [254, 152, 1], [244, 120], [234, 118], [224, 150, 1], [212, 140], [222, 114, 1], [194, 116], [182, 96], [192, 74], [218, 78]]);
      return hp(env, it, d) + ln('M246,104Q266,96 276,98M226,104Q206,96 196,98', lineOf(it.c1), 1.4, { opacity: .5 }) + flat('M228,100Q236,96 244,100L242,118Q236,120 230,118Z', shadeOf(it.c1, .08), lineOf(it.c1), 2);
    } },
  { id: 'halo', name: '天使光环', c1: '#ffe27a', pat: 'none', pc: '#ffffff', tags: ['fantasy', 'cute', 'sweet'],
    draw: (env, it) => ell(200, 64, 54, 13, { fill: 'none', stroke: it.c1, 'stroke-width': 14, opacity: .25 }) + ell(200, 64, 54, 13, { fill: 'none', stroke: lineOf(it.c1), 'stroke-width': 8 }) + ell(200, 64, 54, 13, { fill: 'none', stroke: it.c1, 'stroke-width': 5.4 }) + ell(184, 56, 14, 2.4, { fill: '#fff', opacity: .7 }) },
  { id: 'horns', name: '小恶魔角', c1: '#7a2a4a', pat: 'none', pc: '#ffffff', tags: ['fantasy', 'cool', 'party'],
    draw: (env, it) => {
      const h = s => { const X = x => s > 0 ? x : mirX(x); return smooth([[X(214), 118], [X(222), 92], [X(240), 70], [X(252), 64, 1], [X(246), 82], [X(236), 104], [X(232), 120]]); };
      return hp(env, it, h(-1), { shade: 'lr' }) + hp(env, it, h(1), { shade: 'lr' });
    } },
  { id: 'hairpin', name: '流苏发簪', c1: '#f2c75c', c2: '#e0242f', pat: 'none', pc: '#ffffff', tags: ['chinese', 'elegant', 'party'],
    draw: (env, it) => {
      const lc = lineOf(it.c1);
      let tas = '';
      for (const [dx, len] of [[-5, 34], [0, 42], [5, 34]]) tas += ln(`M${262 + dx},126L${264 + dx * 1.4},${126 + len}`, it.c1, 1.4) + circ(264 + dx * 1.4, 126 + len + 3, 3, { fill: it.c2, stroke: lineOf(it.c2), 'stroke-width': 1 });
      let fl = '';
      for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; fl += ell(262 + Math.cos(a) * 7, 114 + Math.sin(a) * 7, 6, 4, { fill: it.c2, stroke: lineOf(it.c2), 'stroke-width': 1.2, transform: `rotate(${r1(a * 57.3)} ${r1(262 + Math.cos(a) * 7)} ${r1(114 + Math.sin(a) * 7)})` }); }
      return ln('M226,96L288,140', lc, 5) + ln('M226,96L288,140', it.c1, 3) + tas + fl + circ(262, 114, 4.6, { fill: it.c1, stroke: lc, 'stroke-width': 1.4 });
    } },
  { id: 'tophat', name: '迷你礼帽', c1: '#2a2733', c2: '#c9374b', pat: 'none', pc: '#ffffff', tags: ['classic', 'party', 'vintage', 'elegant'],
    draw: (env, it) => {
      const g1 = `rotate(-12 236 100)`;
      return g(hp(env, it, 'M188,106a48,10 0 1,0 96,0a48,10 0 1,0 -96,0Z', { shade: 'tb' }) + hp(env, it, 'M204,106V56Q204,50 210,50H262Q268,50 268,56V106Q236,114 204,106Z', { shade: 'lr' })
        + path('M204,92H268V104Q236,110 204,104Z', { fill: it.c2 }) + ell(236, 50, 32, 5, { fill: lighten(it.c1, .15), stroke: lineOf(it.c1), 'stroke-width': 2 }), { transform: g1 });
    } },
);

/* head-top accessories (crown, bows, halo…) were drawn on the old, taller fox cranium: move them onto the wearer's
   head, and up onto the hair when a front style makes the head taller */
for (const id of ['crown', 'flowercrown', 'bigbow', 'halo', 'horns', 'hairpin', 'tophat']) {
  const it = ITEMS.hat.find(h => h.id === id), draw = it.draw;
  it.draw = (env, x) => {
    const hair = env.st.hair && HAIR_STYLES[env.st.hair.id], lift = hair ? hair.lift : 0;
    return g(draw(env, x), { transform: `translate(0,${r1(18 + hatFit(env.st).T - hatFit({ species: 'fox' }).T - lift)})` });
  };
}

/* ---------- glasses ---------- */
const EYE_L = [152.5, 222], EYE_R = [247.5, 222];
function lensPair(fn) { return fn(EYE_L[0], EYE_L[1], -1) + fn(EYE_R[0], EYE_R[1], 1); }
ITEMS.glasses.push(
  { id: 'round', name: '复古圆框', c1: '#3e2622', pat: 'none', pc: '#ffffff', tags: ['vintage', 'preppy', 'classic', 'cute'],
    draw: (env, it) => lensPair((x, y, s) => circ(x, y + 2, 29.5, { fill: '#dff1ff', 'fill-opacity': .14, stroke: it.c1, 'stroke-width': 2.8 }) + ln(`M${x - 15},${y - 13}l6,-4`, '#fff', 2.4, { opacity: .6 }) + ln(`M${x + s * 29.5},${y}L${x + s * 56},${y - 7}`, it.c1, 2.6))
      + ln(`M${EYE_L[0] + 29.5},${EYE_L[1] + 1}Q200,${EYE_L[1] - 8} ${EYE_R[0] - 29.5},${EYE_R[1] + 1}`, it.c1, 2.6) },
  { id: 'horn', name: '学院粗框', c1: '#3a2620', pat: 'none', pc: '#ffffff', tags: ['preppy', 'classic', 'vintage', 'office'],
    draw: (env, it) => lensPair((x, y, s) => path(`M${x - 28},${y - 18}h56q4,0 4,6v22q0,16 -16,16h-32q-16,0 -16,-16v-22q0,-6 4,-6z`, { fill: '#dff1ff', 'fill-opacity': .16, stroke: it.c1, 'stroke-width': 4.6 }) + ln(`M${x + s * 32},${y - 14}L${x + s * 54},${y - 18}`, it.c1, 4))
      + ln(`M${EYE_L[0] + 31},206Q200,199 ${EYE_R[0] - 31},206`, it.c1, 4) },
  { id: 'browline', name: '眉线眼镜', c1: '#2b2228', c2: '#c9a24a', pat: 'none', pc: '#ffffff', tags: ['vintage', 'classic', 'office', 'cool'],
    draw: (env, it) => lensPair((x, y, s) => path(`M${x - 27},${y - 10}Q${x},${y - 16} ${x + 27},${y - 10}Q${x + 26},${y + 22} ${x},${y + 25}Q${x - 26},${y + 22} ${x - 27},${y - 10}Z`, { fill: '#dff1ff', 'fill-opacity': .16, stroke: it.c2, 'stroke-width': 2 })
      + path(`M${x - 29},${y - 6}Q${x - 28},${y - 18} ${x},${y - 19}Q${x + 28},${y - 18} ${x + 29},${y - 6}L${x + 27},${y - 2}Q${x},${y - 10} ${x - 27},${y - 2}Z`, { fill: it.c1, stroke: lineOf(it.c1), 'stroke-width': 1.4 }) + ln(`M${x + s * 29},${y - 10}L${x + s * 54},${y - 16}`, it.c1, 3.4))
      + ln(`M${EYE_L[0] + 28},209Q200,203 ${EYE_R[0] - 28},209`, it.c2, 2.2) },
  { id: 'aviator', name: '飞行员墨镜', c1: '#5a4632', c2: '#d8b45a', pat: 'none', pc: '#ffffff', tags: ['cool', 'vintage', 'summer', 'street'],
    draw: (env, it) => {
      const gid = env.ctx.def('avi-' + it.c1.slice(1), `<linearGradient id="__ID__" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${it.c1}" stop-opacity=".95"/><stop offset="1" stop-color="${it.c1}" stop-opacity=".45"/></linearGradient>`);
      return lensPair((x, y, s) => path(`M${x - 28 * s},${y - 14}Q${x},${y - 18} ${x + 26 * s},${y - 12}Q${x + 30 * s},${y + 6} ${x + 14 * s},${y + 22}Q${x},${y + 30} ${x - 18 * s},${y + 18}Q${x - 30 * s},${y + 4} ${x - 28 * s},${y - 14}Z`, { fill: `url(#${gid})`, stroke: it.c2, 'stroke-width': 2.2 })
        + ln(`M${x - 16},${y - 7}l8,-3`, '#fff', 2.6, { opacity: .55 }) + ln(`M${x + 27 * s},${y - 12}L${x + 52 * s},${y - 16}`, it.c2, 2.2))
        + ln(`M${EYE_L[0] + 27},208Q200,199 ${EYE_R[0] - 27},208M${EYE_L[0] + 29},216H${EYE_R[0] - 29}`, it.c2, 2);
    } },
  { id: 'sunnies', name: '方框墨镜', c1: '#1e1a22', pat: 'none', pc: '#ffffff', tags: ['cool', 'street', 'summer', 'vintage'],
    draw: (env, it) => lensPair((x, y, s) => path(`M${x - 30},${y - 16}H${x + 30}L${x + 26},${y + 14}Q${x + 22},${y + 22} ${x + 10},${y + 22}H${x - 12}Q${x - 24},${y + 22} ${x - 28},${y + 12}Z`, { fill: '#2a2430', stroke: it.c1, 'stroke-width': 4.4, 'stroke-linejoin': 'round' })
      + path(`M${x - 18},${y - 10}l14,0l-16,22l-6,0z`, { fill: '#fff', opacity: .22 }) + ln(`M${x + s * 30},${y - 14}L${x + s * 54},${y - 18}`, it.c1, 4))
      + ln(`M${EYE_L[0] + 29},207H${EYE_R[0] - 29}`, it.c1, 4) },
  { id: 'heart', name: '爱心墨镜', c1: '#ff4f8b', pat: 'none', pc: '#ffffff', tags: ['cute', 'party', 'summer', 'sweet'],
    draw: (env, it) => lensPair((x, y, s) => path(heartD(x, y + 2, 21), { fill: lighten(it.c1, .2), 'fill-opacity': .78, stroke: it.c1, 'stroke-width': 3.4 }) + ln(`M${x - 12},${y - 8}l6,-4`, '#fff', 2.6, { opacity: .7 }) + ln(`M${x + s * 30},${y - 6}L${x + s * 54},${y - 12}`, it.c1, 3))
      + ln(`M${EYE_L[0] + 25},211Q200,203 ${EYE_R[0] - 25},211`, it.c1, 3) },
  { id: 'star', name: '星星派对镜', c1: '#ffcf3a', pat: 'none', pc: '#ffffff', tags: ['party', 'fantasy', 'cute'],
    draw: (env, it) => lensPair((x, y, s) => path(starD(x, y + 2, 32, .62), { fill: '#fff6c9', 'fill-opacity': .3, stroke: it.c1, 'stroke-width': 3.4, 'stroke-linejoin': 'round' }) + ln(`M${x + s * 30},${y - 4}L${x + s * 54},${y - 12}`, it.c1, 3))
      + ln(`M${EYE_L[0] + 28},210Q200,203 ${EYE_R[0] - 28},210`, it.c1, 3) },
  { id: 'monocle', name: '绅士单片镜', c1: '#c9a24a', pat: 'none', pc: '#ffffff', tags: ['classic', 'vintage', 'elegant'],
    draw: (env, it) => circ(EYE_R[0], EYE_R[1] + 2, 26, { fill: '#dff1ff', 'fill-opacity': .2, stroke: it.c1, 'stroke-width': 3.4 }) + ln(`M${EYE_R[0] - 12},${EYE_R[1] - 10}l6,-4`, '#fff', 2.4, { opacity: .7 })
      + ln(`M${EYE_R[0] + 18},${EYE_R[1] + 22}Q${EYE_R[0] + 30},${EYE_R[1] + 70} ${EYE_R[0] + 14},${EYE_R[1] + 110}`, it.c1, 1.6, { 'stroke-dasharray': '3 2' }) },
);

/* ---------- face stickers ---------- */
ITEMS.face.push(
  { id: 'freckles', name: '小雀斑', c1: '#b5653a', pat: 'none', pc: '#ffffff', tags: ['cute', 'nature', 'casual'],
    draw: (env, it) => [[128, 262], [137, 268], [146, 261], [136, 256], [272, 262], [263, 268], [254, 261], [264, 256]].map(([x, y]) => circ(x, y, 1.9, { fill: it.c1, opacity: .75 })).join('') },
  { id: 'bandaid', name: '创可贴', c1: '#f3c9a6', pat: 'none', pc: '#ffffff', tags: ['cute', 'street', 'sporty'],
    draw: (env, it) => g(`<rect x="-15" y="-6" width="30" height="12" rx="6" fill="${it.c1}" stroke="${lineOf(it.c1)}" stroke-width="1.6"/><rect x="-5" y="-4.5" width="10" height="9" rx="2" fill="${lighten(it.c1, .4)}"/>` + [[-3, -2], [2, -2], [-3, 2], [2, 2]].map(([x, y]) => circ(x, y, .8, { fill: lineOf(it.c1) })).join(''), { transform: 'translate(266,268) rotate(-24)' }) },
  { id: 'starsticker', name: '星星贴纸', c1: '#ffcf3a', pat: 'none', pc: '#ffffff', tags: ['cute', 'party', 'fantasy'],
    draw: (env, it) => path(starD(136, 268, 8, .45), { fill: it.c1, stroke: lineOf(it.c1), 'stroke-width': 1.6, 'stroke-linejoin': 'round' }) + path(starD(121, 256, 4, .45), { fill: it.c1 }) },
  { id: 'heartsticker', name: '爱心贴纸', c1: '#ff4f8b', pat: 'none', pc: '#ffffff', tags: ['cute', 'sweet', 'party'],
    draw: (env, it) => path(heartD(266, 268, 7), { fill: it.c1, stroke: lineOf(it.c1), 'stroke-width': 1.6 }) },
  { id: 'mustache', name: '绅士小胡子', c1: '#3a2a26', pat: 'none', pc: '#ffffff', tags: ['classic', 'vintage', 'party'],
    draw: (env, it) => g(flat('M200,253C192,246 178,246 172,254C168,260 160,260 157,253C160,266 176,268 186,260C192,256 196,256 200,258C204,256 208,256 214,260C224,268 240,266 243,253C240,260 232,260 228,254C222,246 208,246 200,253Z', it.c1, lineOf(it.c1), 1.4), { transform: 'translate(0,5)' }) },
  { id: 'mole', name: '泪痣', c1: '#4a3036', pat: 'none', pc: '#ffffff', tags: ['elegant', 'cool'],
    draw: (env, it) => circ(268, 258, 2.2, { fill: it.c1 }) },
  { id: 'glitter', name: '闪闪眼妆', c1: '#ffffff', pat: 'none', pc: '#ffffff', tags: ['party', 'fantasy', 'elegant'],
    draw: (env, it) => [[118, 204, 5], [282, 204, 5], [114, 224, 3], [286, 224, 3], [128, 188, 2.4], [272, 188, 2.4]].map(([x, y, r]) => path(starD(x, y, r, .38, 4), { fill: it.c1, stroke: '#ffc6e0', 'stroke-width': .8 })).join('') },
);
