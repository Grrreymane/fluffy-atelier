/* ===== wear_outer.js — outerwear (layered over tops) ===== */
/* right front panel of an open jacket. o: ease, hem, gapHem, gapMid, vEnd, closeAt, flare */
function jacketPanel(K, o = {}) {
  const e = o.ease ?? 7, hem = o.hem ?? 474, fl = o.flare ?? 0;
  const hw = Math.max(K.hi, K.wa, K.ch - 2) + e;
  const pts = [[CX + K.neck + 5, 293, 1], [CX + K.sh - 11, 301], [CX + K.sh + 2, 309.5], [CX + K.sh, 328], [CX + K.ch + e + 1, 350], [CX + K.ch + e, 372],
    [CX + Math.max(K.wa, K.ch - 6) + e + 1, 412], [CX + Math.max(K.hi, K.wa) + e + fl * .5, 456]];
  if (hem > 470) pts.push([CX + hw + fl * .8, (456 + hem) / 2]);
  pts.push([CX + hw + fl + 1, hem, 1]);
  if (o.cutaway) pts.push([CX + o.gapHem, hem + 1, 1], [CX + 3, o.closeAt + 14], [CX + 1, o.closeAt, 1]);
  else if (o.closeAt) pts.push([CX - (o.overlap ?? 6), hem + 1, 1], [CX - (o.overlap ?? 6), o.closeAt, 1]);
  else pts.push([CX + (o.gapHem ?? 18), hem + 1, 1]);
  pts.push([CX + (o.gapMid ?? 12), o.vEnd ?? 352, o.closeAt ? 1 : 0]);
  return pts;
}
function jacket(env, it, o = {}) {
  const { K, ctx } = env;
  const R = jacketPanel(K, o);
  const col = o.col || it.c1;
  const dR = smooth(R), dL = smooth(mirAll(R));
  const folds = o.folds === false ? '' : sideFolds(K, o.hem ?? 474, .8);
  const right = paint(ctx, dR, col, { pat: it.patUrl, extra: (o.extraR || '') + folds });
  const left = paint(ctx, dL, col, { pat: it.patUrl, extra: (o.extraL || '') + folds });
  // the panels shade the shirt in the opening and the hips under the hem
  const cast = env.castOnTop ? dropShadow(dR + dL, env.castOnTop, .14, 2, 2.8) : '';
  return cast + (o.leftOver ? right + left : left + right);
}
/* a closed coat painted panel by panel: the cast shadow of both panels on the shirt / trousers under it */
const panelsCast = (env, R) => env.castOnTop ? dropShadow(smooth(R) + smooth(mirAll(R)), env.castOnTop, .14, 2, 2.8) : '';
function lapels(K, col, o = {}) {
  const roll = o.roll ?? 398, notch = o.notch ?? 320, w = o.w ?? 38, lc = lineOf(col);
  const right = [[CX + K.neck + 4, 290, 1], [CX + K.neck + 15, 297], [CX + w - 5, notch - 7, 1], [CX + w - 10, notch + 1, 1], [CX + w + 1.5, notch + 2.5, 1], [CX + w - 2, notch + 22],
    [CX + 3, roll, 1], [CX + K.neck + 4, 305]];
  const gorge = s => { const X = x => CX + s * (x - CX); return ln(`M${r1(X(CX + w - 10))},${notch + 1}L${r1(X(CX + K.neck + 9))},${302}`, lc, 1.4, { opacity: .7 }); };
  const one = (pts, s, lit) => { const d = smooth(pts);
    return path(d, shadowFill(.2, { transform: 'translate(2,2.6)' })) + flat(d, lighten(col, .04), lc, 2.5) + gorge(s)
      + ln(smooth(pts.slice(4, 7), false), lighten(col, .3), 1.5, { opacity: lit, transform: `translate(${-s * 2.2},0)` }); };
  return one(right, 1, .3) + one(mirAll(right), -1, .65);
}
function flatCollar(K, col, o = {}) {
  const lc = lineOf(col), w = o.w ?? 30, d = o.depth ?? 330;
  const right = [[CX + K.neck + 2, 286], [CX + K.neck + 26, 296], [CX + K.sh - 2, 312], [CX + w + 4, d, 1], [CX + 13, d - 18], [CX + K.neck + 4, 300]];
  const one = d => path(d, shadowFill(.14, { transform: 'translate(1.4,2.4)' })) + flat(d, col, lc, 2.4);
  return one(smooth(right)) + one(smooth(mirAll(right)));
}
function elbowPatch(ctx, sl, P, arm, K) {
  const p = cutPolyline(arm.pts, K.L1 + 4), q = p[p.length - 1], q0 = p[p.length - 2];
  const ang = Math.atan2(q.y - q0.y, q.x - q0.x) * 180 / Math.PI;
  return ell(q.x, q.y, 14, K.arm * .85, { fill: '#6b4a34', stroke: '#3e2a1e', 'stroke-width': 1.6, transform: `rotate(${r1(ang)} ${r1(q.x)} ${r1(q.y)})` })
    + ell(q.x, q.y, 10.5, K.arm * .6, { fill: 'none', stroke: '#c9a27c', 'stroke-width': 1, 'stroke-dasharray': '2 2', transform: `rotate(${r1(ang)} ${r1(q.x)} ${r1(q.y)})` });
}
function letterF(x, y, s, col, edge) {
  const d = `M${x},${y}h${16 * s}v${6 * s}h${-10 * s}v${5 * s}h${8 * s}v${6 * s}h${-8 * s}v${10 * s}h${-6 * s}z`;
  return path(d, { fill: col, stroke: edge, 'stroke-width': 2.6 * s, 'stroke-linejoin': 'round', 'paint-order': 'stroke' });
}

ITEMS.outer.push(
  { id: 'blazer', name: '藏青西装外套', c1: '#1f2a4c', pat: 'none', pc: '#8d9bbd', closed: true, tags: ['preppy', 'classic', 'office', 'elegant'],
    sleeve: { len: .9, ease: 4.5 },
    draw: (env, it) => {
      const { K } = env;
      const gold = '#e2b84e', lc = lineOf(it.c1);
      const body = jacket(env, it, { ease: 5, hem: 462, cutaway: true, gapHem: 24, closeAt: 428, vEnd: 400, gapMid: -3, leftOver: true });
      // hip flap pockets, as big and as high as in the reference
      const flap = s2 => {
        const X = d => CX + s2 * d, x0 = K.wa - 21, x1 = K.wa + 5;
        return path(`M${X(x0)},421L${X(x1)},421L${X(x1 + .5)},433Q${X((x0 + x1) / 2)},435 ${X(x0)},433Z`, shadowFill(.18, { transform: 'translate(1.4,1.8)' }))
          + flat(`M${X(x0)},419L${X(x1)},419L${X(x1 + .5)},432Q${X((x0 + x1) / 2)},434 ${X(x0)},432Z`, it.c1, lc, 2);
      };
      const welt = flat(`M${CX + 20},354L${CX + 42},352L${CX + 42.5},357L${CX + 20.5},359Z`, it.c1, lc, 1.8);
      const square = flat(`M${CX + 23},355L${CX + 27},346L${CX + 31},351L${CX + 35},345L${CX + 39},354Z`, '#fbf8f1', lineOf('#fbf8f1'), 1.6);
      return body + lapels(K, it.c1, { roll: 400, notch: 318, w: 40 }) + flap(-1) + flap(1) + square + welt
        + buttons([CX + 1], [404, 429], gold, 5.4) + ell(CX - .6, 402.2, 1.8, 1.4, { fill: '#fff7d6', opacity: .9 }) + ell(CX - .6, 427.2, 1.8, 1.4, { fill: '#fff7d6', opacity: .9 });
    } },
  { id: 'tweed', name: '粗花呢夹克', c1: '#7f6e55', pat: 'herring', pc: '#4e4233', tags: ['preppy', 'classic', 'vintage', 'autumn'],
    sleeve: { len: .95, ease: 6 }, sleeveDeco: elbowPatch,
    draw: (env, it) => {
      const { K } = env;
      const body = jacket(env, it, { hem: 486, cutaway: true, gapHem: 26, closeAt: 402, vEnd: 380 });
      const flap = s => { const X = d => CX + s * d; return path(`M${X(K.wa - 18)},444h${s * 28}v9h${-s * 28}z`, { fill: it.c1, stroke: lineOf(it.c1), 'stroke-width': 1.6 }); };
      return body + lapels(K, it.c1) + flap(-1) + flap(1) + buttons([CX + 2], [402, 432], '#5a3e2b', 3.2);
    } },
  { id: 'varsity', name: '学院棒球夹克', c1: '#2f4e8a', c2: '#f3ead6', pat: 'none', pc: '#ffffff', tags: ['preppy', 'sporty', 'street', 'vintage'],
    sleeve: { len: .95, ease: 6.5, color: 'c2', cuff: 'rib' },
    draw: (env, it) => {
      const { K } = env;
      const rib = (y0, y1) => path(`M${CX - 150},${y0}H${CX + 150}V${y1}H${CX - 150}Z`, { fill: it.c1 }) + ln(`M${CX - 150},${y0 + 4}H${CX + 150}M${CX - 150},${y0 + 8}H${CX + 150}`, it.c2, 2);
      const hem = jacket(env, it, { hem: 470, gapHem: 10, gapMid: 8, vEnd: 330, col: it.c1, extraR: rib(458, 471), extraL: rib(458, 471) });
      const neckRib = ln(`M${CX - K.neck - 6},292Q${CX - 16},322 ${CX - 8},336M${CX + K.neck + 6},292Q${CX + 16},322 ${CX + 8},336`, it.c1, 9) + ln(`M${CX - K.neck - 6},292Q${CX - 16},322 ${CX - 8},336M${CX + K.neck + 6},292Q${CX + 16},322 ${CX + 8},336`, it.c2, 2);
      const snaps = buttons([CX - 12, CX + 12], [352, 382, 412, 442], '#e8e2d2', 2.4);
      return hem + neckRib + snaps + letterF(CX - K.ch + 6, 344, 1.25, it.c2, '#c9374b');
    } },
  { id: 'chore', name: '复古工装夹克', c1: '#c08a4a', c2: '#5a3a28', pat: 'none', pc: '#ffffff', tags: ['workwear', 'vintage', 'casual', 'autumn'],
    sleeve: { len: .95, ease: 7, cuff: 'rib' },
    draw: (env, it) => {
      const { K } = env;
      const st = darken(it.c1, .35);
      const body = jacket(env, it, { hem: 498, gapHem: 16, vEnd: 340 });
      const pk = (x, y, w, h) => pocket(x, y, w, h, it.c1, { stitch: st });
      return body + flatCollar(K, it.c2, { w: 32, depth: 334 }) + pk(CX - K.ch, 352, 24, 26) + pk(CX - K.hi - 2, 432, 30, 34) + pk(CX + K.hi - 28, 432, 30, 34)
        + buttons([CX + 14], [352, 386, 420, 454], '#3a3a40', 3);
    } },
  { id: 'denimjk', name: '牛仔夹克', c1: '#5677a8', pat: 'none', pc: '#ffffff', tags: ['workwear', 'street', 'casual', 'vintage'],
    sleeve: { len: .95, ease: 6.5, cuff: 'rib' },
    draw: (env, it) => {
      const { K } = env;
      const st = '#e2b45c';
      const pleat = s => stitch(`M${CX + s * 26},372L${CX + s * 28},456`, st, 1.2) + stitch(`M${CX + s * 31},372L${CX + s * 33},456`, st, 1.2);
      const yoke = stitch(`M${CX - K.ch - 4},360L${CX - 14},352M${CX + K.ch + 4},360L${CX + 14},352`, st, 1.2);
      const body = jacket(env, it, { hem: 466, gapHem: 18, vEnd: 342 });
      const band = s => { const X = d => CX + s * d; const hw = Math.max(K.hi, K.wa) + 7; return flat(`M${X(18)},452L${X(hw + 1)},452L${X(hw + 1)},466L${X(18)},466Z`, it.c1, lineOf(it.c1), 2); };
      return body + yoke + pleat(-1) + pleat(1) + pocket(CX - K.ch - 2, 362, 22, 20, it.c1, { flap: true, stitch: st }) + pocket(CX + K.ch - 20, 362, 22, 20, it.c1, { flap: true, stitch: st })
        + band(-1) + band(1) + flatCollar(K, it.c1) + buttons([CX - 14, CX + 14], [352, 392, 432, 459], '#c98f3a', 2.8);
    } },
  { id: 'a2', name: 'A-2飞行夹克', c1: '#6b4130', c2: '#3a2722', pat: 'none', pc: '#ffffff', tags: ['vintage', 'cool', 'workwear', 'classic'],
    sleeve: { len: .95, ease: 6.5, cuff: 'rib' },
    draw: (env, it) => {
      const { K, ctx } = env;
      const right = jacketPanel(K, { hem: 468, closeAt: 330, overlap: 0, vEnd: 300, ease: 7 });
      const lc = lineOf(it.c1);
      const body = panelsCast(env, right) + paint(ctx, smooth(right), it.c1, { shade: 'lr' }) + paint(ctx, smooth(mirAll(right)), it.c1, { shade: 'lr' });
      const hw = Math.max(K.hi, K.wa) + 8;
      const band = flat(`M${CX - hw},454H${CX + hw}V470H${CX - hw}Z`, it.c2, lineOf(it.c2), 2.2) + ln(Array.from({ length: Math.round(hw * 2 / 5) }, (_, i) => `M${CX - hw + 3 + i * 5},456V468`).join(''), lineOf(it.c2), 1, { opacity: .5 });
      const zip = ln(`M${CX},300V454`, '#c8b98a', 2.2) + ln(`M${CX},300V454`, '#6a5a3a', 1, { 'stroke-dasharray': '1.5 1.5' });
      const flapPk = s => { const X = d => CX + s * d; return flat(`M${X(18)},404L${X(K.wa + 2)},404L${X(K.wa + 4)},420L${X(18)},420Z`, it.c1, lc, 2) + circ(X(K.wa / 2 + 10), 414, 2.2, { fill: '#2a1a14' }); };
      const ep = s => { const X = d => CX + s * d; return flat(`M${X(K.neck + 8)},300L${X(K.sh - 4)},312L${X(K.sh - 6)},320L${X(K.neck + 7)},308Z`, it.c1, lc, 1.8) + circ(X(K.neck + 12), 304, 1.8, { fill: '#2a1a14' }); };
      const shine = path(`M${CX - K.ch + 6},350Q${CX - K.ch + 12},400 ${CX - K.ch + 8},444`, { fill: 'none', stroke: '#fff', 'stroke-width': 3, opacity: .2 });
      return body + band + zip + flapPk(-1) + flapPk(1) + ep(-1) + ep(1) + flatCollar(K, it.c1, { w: 30, depth: 326 }) + shine;
    } },
  { id: 'trench', name: '经典风衣', c1: '#cfb47f', pat: 'none', pc: '#ffffff', tags: ['classic', 'elegant', 'office', 'autumn'],
    sleeve: { len: .95, ease: 7, cuff: 'c2' },
    c2: '#bfa26a',
    draw: (env, it) => {
      const { K, ctx } = env;
      const lc = lineOf(it.c1);
      const R = jacketPanel(K, { hem: 604, closeAt: 330, overlap: 18, vEnd: 300, ease: 8, flare: 18 });
      const body = panelsCast(env, R) + paint(ctx, smooth(mirAll(R)), it.c1, { shade: 'lr' }) + paint(ctx, smooth(R), it.c1, { shade: 'lr' });
      const belt = flat(`M${CX - K.wa - 12},412H${CX + K.wa + 12}V424H${CX - K.wa - 12}Z`, it.c1, lc, 2.2) + path(`M${CX - 30},409h14v18h-14z`, { fill: 'none', stroke: '#6a5a3a', 'stroke-width': 2.4 }) + ln(`M${CX - 24},424q-4,24 4,40`, it.c1, 8) + ln(`M${CX - 24},424q-4,24 4,40`, lc, 1.2, { opacity: .5 });
      const btn = buttons([CX - 2, CX + 22], [348, 376, 400], '#4a3a2a', 3);
      const flap = flat(`M${CX + K.neck + 8},300L${CX + K.sh + 2},316L${CX + K.sh},350L${CX + K.neck + 14},338Z`, it.c1, lc, 1.8);
      return body + flap + lapels(K, it.c1, { roll: 330, notch: 318, w: 40 }) + btn + belt + ln(`M${CX - 18},430L${CX - 16},600`, lc, 1.4, { opacity: .5 });
    } },
  { id: 'cardigan', name: '学院开衫', c1: '#7b8f5c', pat: 'none', pc: '#ffffff', tags: ['preppy', 'casual', 'vintage', 'autumn'],
    sleeve: { len: .95, ease: 5.5, cuff: 'rib' },
    draw: (env, it) => {
      const { K } = env;
      const lc = lineOf(it.c1);
      const rib = ln(`M${CX - 150},467H${CX + 150}`, shadeOf(it.c1, .1), 14) + ln(Array.from({ length: 60 }, (_, i) => `M${CX - 150 + i * 5},461v12`).join(''), lc, .9, { opacity: .35 });
      const body = jacket(env, it, { hem: 476, gapHem: 6, gapMid: 4, vEnd: 372, ease: 5.5, extraR: rib, extraL: rib });
      const edge = ln(`M${CX - K.neck - 5},294L${CX - 4},372L${CX - 6},476M${CX + K.neck + 5},294L${CX + 4},372L${CX + 6},476`, shadeOf(it.c1, .1), 7);
      return body + edge + ln(`M${CX - K.neck - 5},294L${CX - 4},372L${CX - 6},476M${CX + K.neck + 5},294L${CX + 4},372L${CX + 6},476`, lc, 1, { opacity: .5 }) + buttons([CX + 5], [388, 414, 440, 464], '#f2e6c8', 2.6)
        + pocket(CX - K.hi + 4, 432, 24, 22, it.c1);
    } },
  { id: 'vest', name: '菱格毛衣背心', c1: '#efe6d2', pat: 'argyle', pc: '#355690', tags: ['preppy', 'classic', 'vintage', 'office'],
    draw: (env, it) => {
      const { K, ctx } = env;
      const R = topRight(K, { neck: 'v', vDepth: 372, sleeveless: true, strap: 22, hem: 466, ease: 4.5 });
      const lc = lineOf(it.c1);
      return paint(ctx, S(R), it.c1, { pat: it.patUrl, extra: ribBand(K, 454, 467, it.c1) })
        + ln(`M${CX - K.neck - 6},296L${CX},372L${CX + K.neck + 6},296`, shadeOf(it.c1, .1), 6) + ln(`M${CX - K.neck - 9},296L${CX},376L${CX + K.neck + 9},296`, lc, 1.2, { opacity: .5 });
    } },
  { id: 'waistcoat', name: '西装马甲', c1: '#5a5f70', pat: 'none', pc: '#8a8fa0', tags: ['classic', 'office', 'vintage', 'elegant'],
    draw: (env, it) => {
      const { K, ctx } = env;
      const hw = Math.max(K.wa, K.hi - 4) + 4;
      const R = [[CX, 360, 1], [CX + K.neck + 6, 296, 1], [CX + K.sh - 18, 308, 1], [CX + K.sh - 12, 336], [CX + K.ch + 3, 368], [CX + K.wa + 4, 412], [CX + hw, 448, 1], [CX + 12, 462, 1], [CX, 474, 1]];
      const lc = lineOf(it.c1);
      return paint(ctx, S(R), it.c1, { pat: it.patUrl, extra: ln(`M${CX - K.wa + 4},420h18M${CX + K.wa - 22},420h18`, lc, 2) })
        + buttons([CX], [372, 392, 412, 432, 452], '#2e2e36', 2.4) + ln(`M${CX + 12},400Q${CX + 24},404 ${CX + K.wa - 2},420`, '#d8b45a', 1.4);
    } },
  { id: 'duffle', name: '牛角扣大衣', c1: '#c79a5c', pat: 'none', pc: '#ffffff', tags: ['classic', 'preppy', 'winter', 'cute'],
    sleeve: { len: .95, ease: 7.5 },
    draw: (env, it) => {
      const { K, ctx } = env;
      const lc = lineOf(it.c1);
      const R = jacketPanel(K, { hem: 552, closeAt: 300, overlap: 4, vEnd: 296, ease: 8, flare: 14 });
      const body = panelsCast(env, R) + paint(ctx, smooth(mirAll(R)), it.c1, { shade: 'lr' }) + paint(ctx, smooth(R), it.c1, { shade: 'lr' });
      const hood = hoodBack(ctx, K, shadeOf(it.c1, .06));
      const yoke = flat(S([[CX, 292], [CX + K.neck + 8, 290], [CX + K.sh + 6, 318], [CX + K.sh + 4, 340, 1], [CX + 30, 346], [CX, 344]]), shadeOf(it.c1, .04), lc, 2.2);
      const toggle = y => ln(`M${CX - 16},${y}H${CX + 16}`, '#3a2a20', 1.6) + path(`M${CX - 9},${y - 3}h18a3,3 0 0,1 0,6h-18a3,3 0 0,1 0,-6z`, { fill: '#e8d9b8', stroke: '#8a7552', 'stroke-width': 1.4 });
      return { hood, main: body + yoke + toggle(372) + toggle(410) + toggle(448) + pocket(CX - K.hi - 8, 470, 32, 34, it.c1, { flap: true }) + pocket(CX + K.hi - 24, 470, 32, 34, it.c1, { flap: true }) };
    } },
  { id: 'tang', name: '盘扣唐装', c1: '#b8202e', c2: '#f2c75c', pat: 'none', pc: '#d9a63a', tags: ['chinese', 'classic', 'party', 'winter'],
    sleeve: { len: .95, ease: 6.5, cuff: 'c2' },
    draw: (env, it) => {
      const { K, ctx } = env;
      const lc = lineOf(it.c1), gold = it.c2;
      const R = jacketPanel(K, { hem: 482, closeAt: 300, overlap: 0, vEnd: 296, ease: 7 });
      const body = panelsCast(env, R) + paint(ctx, smooth(mirAll(R)), it.c1, { pat: it.patUrl }) + paint(ctx, smooth(R), it.c1, { pat: it.patUrl });
      const w = K.neck + 5;
      const collar = flat(`M${CX - w},274Q${CX},280 ${CX + w},274L${CX + w + 1},294Q${CX},302 ${CX - w - 1},294Z`, it.c1, lc, 2.4) + ln(`M${CX - w},294Q${CX},302 ${CX + w},294`, gold, 2);
      const frog = y => ln(`M${CX - 13},${y}h26`, gold, 2.2) + circ(CX - 13, y, 3, { fill: 'none', stroke: gold, 'stroke-width': 2 }) + circ(CX + 13, y, 3, { fill: 'none', stroke: gold, 'stroke-width': 2 }) + circ(CX, y, 2.4, { fill: gold });
      const medal = (x, y) => circ(x, y, 13, { fill: 'none', stroke: gold, 'stroke-width': 1.6, opacity: .8 }) + path(starD(x, y, 8, .5, 6), { fill: gold, opacity: .55 });
      return body + ln(`M${CX},300V482`, gold, 2) + collar + [324, 352, 380, 408, 436].map(frog).join('') + medal(CX - K.ch + 14, 420) + medal(CX + K.ch - 14, 420);
    } },
  { id: 'puffer', name: '面包羽绒服', c1: '#ffd36e', pat: 'none', pc: '#ffffff', tags: ['winter', 'street', 'cute', 'sporty'],
    sleeve: { len: .95, ease: 10, cuff: 'rib' },
    draw: (env, it) => {
      const { K, ctx } = env;
      const lc = lineOf(it.c1);
      const R = jacketPanel(K, { hem: 480, closeAt: 290, overlap: 0, vEnd: 290, ease: 12 });
      let q = '';
      for (const y of [336, 372, 408, 444]) q += `M${CX - 120},${y}Q${CX},${y + 6} ${CX + 120},${y}`;
      const extra = ln(q, lc, 1.8, { opacity: .55 }) + ln(q.replace(/,(\d+)Q/g, (m, y) => `,${+y - 16}Q`), '#fff', 3, { opacity: .22 });
      const collar = flat(`M${CX - K.neck - 14},300Q${CX},318 ${CX + K.neck + 14},300L${CX + K.neck + 16},272Q${CX},284 ${CX - K.neck - 16},272Z`, it.c1, lc, 2.4);
      return panelsCast(env, R) + paint(ctx, smooth(mirAll(R)), it.c1, { extra, shade: 'lr' }) + paint(ctx, smooth(R), it.c1, { extra, shade: 'lr' }) + collar + ln(`M${CX},300V478`, lc, 1.8);
    } },
  { id: 'capelet', coversArms: true, name: '魔法披肩', c1: '#6f52c9', c2: '#ffd166', pat: 'star', pc: '#ffe9a8', tags: ['fantasy', 'elegant', 'winter', 'party'],
    draw: (env, it) => {
      const { K, ctx } = env;
      const w = K.sh + 26;
      const R = [[CX, 300], [CX + K.neck + 6, 292], [CX + K.sh, 310], [CX + w - 6, 350], [CX + w, 394, 1], [CX + w * .5, 398], [CX + 8, 392, 1], [CX, 380]];
      const lc = lineOf(it.c1);
      return paint(ctx, S(R), it.c1, { pat: it.patUrl, shade: 'tb' })
        + ln(`M${CX - w + 2},392Q${CX - w * .5},400 ${CX - 8},390M${CX + w - 2},392Q${CX + w * .5},400 ${CX + 8},390`, it.c2, 2.4)
        + circ(CX, 304, 7, { fill: it.c2, stroke: lineOf(it.c2), 'stroke-width': 2 }) + path(starD(CX, 304, 4.5, .45), { fill: '#fff' });
    } },
  { id: 'waxed', name: '油蜡猎装夹克', c1: '#4f5a3c', c2: '#6b4a2e', pat: 'none', pc: '#ffffff', tags: ['workwear', 'vintage', 'classic', 'autumn'],
    sleeve: { len: .95, ease: 7, cuff: 'c2' },
    draw: (env, it) => {
      const { K, ctx } = env;
      const lc = lineOf(it.c1), hem = 496;
      const R = jacketPanel(K, { hem, closeAt: 300, overlap: 6, vEnd: 296, ease: 7.5 });
      const folds = sideFolds(K, hem, .8);
      // waxed cotton is a little shiny: a couple of soft streaks on the lit (left) side
      const sheen = ln(`M${CX - K.ch - 2},360Q${CX - K.ch + 4},392 ${CX - K.ch},430M${CX - 30},440Q${CX - 26},462 ${CX - 30},484`, '#fff', 2.4, { opacity: .16 });
      const body = panelsCast(env, R) + paint(ctx, smooth(mirAll(R)), it.c1, { extra: folds }) + paint(ctx, smooth(R), it.c1, { extra: folds });
      const placket = flat(`M${CX - 6},300L${CX + 8},300L${CX + 8},${hem}L${CX - 6},${hem}Z`, it.c1, lc, 2) + buttons([CX + 1], [330, 372, 414, 456], '#3a3226', 2.6);
      // bellows pockets with flaps at the hips, hand-warmer slits above them
      const pk = s => { const x = s < 0 ? CX - K.hi - 10 : CX + K.hi - 22; return pocket(x, 446, 32, 34, it.c1, { flap: true, flapFill: shadeOf(it.c1, .04) })
        + ln(`M${CX + s * (K.wa - 2)},404L${CX + s * (K.wa + 6)},436`, lc, 1.8); };
      return body + placket + pk(-1) + pk(1) + flatCollar(K, it.c2, { w: 28, depth: 322 }) + sheen;
    } },
  { id: 'harrington', name: '哈灵顿夹克', c1: '#d9c8a0', c2: '#b8233a', pat: 'none', pc: '#ffffff', tags: ['classic', 'preppy', 'vintage', 'casual'],
    sleeve: { len: .95, ease: 6, cuff: 'rib' },
    draw: (env, it) => {
      const { K, ctx } = env;
      const lc = lineOf(it.c1), hem = 466;
      const R = jacketPanel(K, { hem, closeAt: 306, overlap: 0, vEnd: 304, ease: 6.5 });
      const folds = sideFolds(K, hem, .8);
      const hw = Math.max(K.hi, K.wa) + 7;
      const band = flat(`M${CX - hw},452H${CX + hw}V467H${CX - hw}Z`, shadeOf(it.c1, .08), lc, 2.2) + ln(Array.from({ length: Math.round(hw * 2 / 5) }, (_, i) => `M${CX - hw + 3 + i * 5},454V465`).join(''), lc, 1, { opacity: .35 });
      const body = panelsCast(env, R) + paint(ctx, smooth(mirAll(R)), it.c1, { extra: folds }) + paint(ctx, smooth(R), it.c1, { extra: folds });
      const zip = ln(`M${CX},306V452`, '#c8b98a', 2) + ln(`M${CX},306V452`, '#6a5a3a', 1, { 'stroke-dasharray': '1.5 1.5' });
      // stand-up funnel collar with two buttons, tartan lining showing at the neck
      const w = K.neck + 6;
      const collar = flat(`M${CX - w},276Q${CX},282 ${CX + w},276L${CX + w + 2},300Q${CX},310 ${CX - w - 2},300Z`, it.c1, lc, 2.4)
        + path(`M${CX - w + 3},279Q${CX},284 ${CX + w - 3},279L${CX + w - 3},283Q${CX},288 ${CX - w + 3},283Z`, { fill: it.c2 }) + buttons([CX - 7, CX + 7], [292], '#3a3226', 2.2);
      const pk = s => { const X = d => CX + s * d; return path(`M${X(16)},402L${X(K.wa + 4)},418L${X(K.wa + 3)},426L${X(15)},410Z`, shadowFill(.12, { transform: 'translate(1,2)' }))
        + flat(`M${X(16)},400L${X(K.wa + 4)},416L${X(K.wa + 3)},424L${X(15)},408Z`, it.c1, lc, 1.8) + circ(X(K.wa / 2 + 10), 410, 1.8, { fill: '#3a3226' }); };
      return body + band + zip + pk(-1) + pk(1) + collar;
    } },
  { id: 'peacoat', name: '海军双排扣呢大衣', c1: '#1f2a44', pat: 'none', pc: '#ffffff', tags: ['classic', 'winter', 'preppy', 'cool'],
    sleeve: { len: .95, ease: 7 },
    draw: (env, it) => {
      const { K, ctx } = env;
      const lc = lineOf(it.c1), hem = 530;
      const R = jacketPanel(K, { hem, closeAt: 330, overlap: 22, vEnd: 316, ease: 8, flare: 8 });
      const folds = sideFolds(K, hem, .8);
      const body = panelsCast(env, R) + paint(ctx, smooth(mirAll(R)), it.c1, { extra: folds }) + paint(ctx, smooth(R), it.c1, { extra: folds });
      // big anchor buttons in two columns, vertical hand-warmer pockets
      const btn = buttons([CX - 14, CX + 16], [356, 392, 428], '#2b2b33', 4.4);
      const anchors = [356, 392, 428].map(y => [CX - 14, CX + 16].map(x => ln(`M${x},${y - 2}V${y + 2}M${x - 1.6},${y + 1}Q${x},${y + 3} ${x + 1.6},${y + 1}`, '#8a8f9e', .9)).join('')).join('');
      const slit = s => { const X = d => CX + s * d; return path(`M${X(K.wa + 2)},420L${X(K.wa + 8)},468L${X(K.wa + 4)},468L${X(K.wa - 2)},420Z`, shadowFill(.12)) + ln(`M${X(K.wa + 2)},420L${X(K.wa + 8)},468`, lc, 2); };
      return body + lapels(K, it.c1, { roll: 344, notch: 316, w: 48 }) + btn + anchors + slit(-1) + slit(1);
    } },
  { id: 'coach', name: '教练夹克', c1: '#2b2f3a', pat: 'none', pc: '#ffffff', tags: ['street', 'sporty', 'cool', 'casual'],
    sleeve: { len: .95, ease: 7, cuff: 'band' },
    draw: (env, it) => {
      const { K, ctx } = env;
      const lc = lineOf(it.c1), hem = 474;
      const R = jacketPanel(K, { hem, closeAt: 300, overlap: 4, vEnd: 296, ease: 7.5 });
      const folds = sideFolds(K, hem, .8);
      const body = panelsCast(env, R) + paint(ctx, smooth(mirAll(R)), it.c1, { extra: folds }) + paint(ctx, smooth(R), it.c1, { extra: folds });
      const snaps = buttons([CX + 1], [326, 360, 394, 428, 460], '#d8dce4', 2.4);
      // drawcord hem with toggles, a small print on the chest
      const hw = Math.max(K.hi, K.wa) + 8;
      const cord = ln(`M${CX - hw + 4},466H${CX + hw - 4}`, lighten(it.c1, .25), 1.2, { opacity: .7 })
        + ln(`M${CX - 30},468l-3,14M${CX + 30},468l3,14`, '#e8e8ee', 1.8) + circ(CX - 33, 483, 2.6, { fill: '#e8e8ee', stroke: lineOf('#e8e8ee'), 'stroke-width': 1 }) + circ(CX + 33, 483, 2.6, { fill: '#e8e8ee', stroke: lineOf('#e8e8ee'), 'stroke-width': 1 });
      const print = circ(CX - K.ch + 14, 352, 7, { fill: 'none', stroke: '#e8e8ee', 'stroke-width': 2 }) + path(starD(CX - K.ch + 14, 352, 3.6, .45), { fill: '#e8e8ee' });
      return body + snaps + cord + print + flatCollar(K, it.c1, { w: 26, depth: 322 });
    } },
);
