/* ===== wear_tops.js — tops ===== */
function crewRib(K, col, depth = 306) {
  const w = K.neck + 3;
  return ln(`M${CX - w},297Q${CX},${depth + 8} ${CX + w},297`, shadeOf(col, .12), 5) + ln(`M${CX - w - 1},299Q${CX},${depth + 12} ${CX + w + 1},299`, lineOf(col), 1.4, { opacity: .6 });
}
function ribBand(K, y0, y1, col, half = 120) {
  let s = path(`M${CX - half},${y0}H${CX + half}V${y1}H${CX - half}Z`, { fill: shadeOf(col, .1) });
  let d = '';
  for (let x = CX - half; x <= CX + half; x += 5) d += `M${x},${y0 + 1}V${y1 - 1}`;
  return s + ln(d, lineOf(col), 1, { opacity: .35 }) + ln(`M${CX - half},${y0}H${CX + half}`, lineOf(col), 1.6, { opacity: .7 });
}
function placket(K, y0, y1, col, n = 4, x = CX, o = {}) {
  const lc = lineOf(col), bc = o.button || lighten(col, .55);
  let s = ln(`M${x - 4},${y0}V${y1}M${x + 4},${y0}V${y1}`, lc, 1.3, { opacity: .55 });
  for (let i = 0; i < n; i++) s += circ(x, y0 + 10 + i * (y1 - y0 - 14) / Math.max(1, n - 1), o.r || 2.3, { fill: bc, stroke: o.button ? lineOf(bc) : lc, 'stroke-width': 1.1 });
  return s;
}

ITEMS.top.push(
  { id: 'tee', name: '基础T恤', c1: '#f8f1e6', pat: 'none', pc: '#ff6f91', tags: ['casual', 'street', 'summer', 'sporty'],
    sleeve: { len: .3, ease: 6.5, flare: 3, fold: 5 },
    draw: (env, it) => {
      const { K } = env;
      const folds = path(`M${CX + 17},363Q${CX - 2},376 ${CX - 27},399Q${CX - 4},385 ${CX + 17},363Z`, shadowFill(.09))
        + path(`M${CX - 25},424Q${CX + 4},420 ${CX + 31},405Q${CX + 6},428 ${CX - 25},424Z`, shadowFill(.08));
      return garment(env, it, topRight(K, { neck: 'crew', hem: 446, ease: 5, boxy: true, flare: 2 }), { extra: crewRib(K, it.c1) + folds });
    } },

  { id: 'ocbd', name: '牛津纺衬衫', c1: '#fbf8f1', pat: 'none', pc: '#a9c8ec', tuck: true, tags: ['preppy', 'classic', 'vintage', 'office'],
    sleeve: { len: .97, ease: 3.5, cuff: 'band' },
    draw: (env, it) => {
      const { K, ctx } = env;
      const lc = lineOf(it.c1);
      return garment(env, it, topRight(K, { neck: 'collar', hem: 466 }), {
        extra: placket(K, 312, 470, it.c1, 5) + pocket(CX + 12, 338, 22, 25, it.c1) + sideFolds(K, 466)
          + ln(`M${CX - K.sh + 6},372Q${CX - 20},380 ${CX - 8},404M${CX + K.sh - 6},372Q${CX + 20},382 ${CX + 10},408`, lc, 1.3, { opacity: .3 }) })
        + shirtCollar(ctx, K, it.c1, { buttonDown: true, point: true, pat: it.patUrl });
    } },

  { id: 'flannel', name: '法兰绒格子衬衫', c1: '#b8322a', pat: 'plaid', pc: '#26222e', tags: ['workwear', 'vintage', 'casual', 'autumn'],
    sleeve: { len: .96, ease: 4.5, cuff: 'rib' },
    draw: (env, it) => {
      const { K, ctx } = env;
      return garment(env, it, topRight(K, { neck: 'collar', hem: 476, ease: 4.5 }), {
        extra: placket(K, 312, 478, it.c1, 5) + pocket(CX - 36, 336, 22, 24, it.c1, { flap: true, flapFill: it.c1 }) + pocket(CX + 14, 336, 22, 24, it.c1, { flap: true, flapFill: it.c1 }) + sideFolds(K, 476) })
        + shirtCollar(ctx, K, it.c1, { wide: true, pat: it.patUrl });
    } },

  { id: 'chambray', name: '丹宁工装衬衫', c1: '#7fa3c9', pat: 'none', pc: '#ffffff', tags: ['workwear', 'vintage', 'casual', 'summer'],
    sleeve: { len: .38, ease: 5.5, roll: true },
    draw: (env, it) => {
      const { K, ctx } = env;
      const st = '#e2b45c';
      return garment(env, it, topRight(K, { neck: 'collar', hem: 474, ease: 6 }), {
        extra: placket(K, 312, 476, it.c1, 5, CX, { button: '#efe6d2', r: 2.9 })
          + pocket(CX - 41, 336, 28, 30, it.c1, { flap: true, stitch: st, pleat: true, flapButton: '#efe6d2' }) + pocket(CX + 13, 336, 28, 30, it.c1, { flap: true, stitch: st, pleat: true, flapButton: '#efe6d2' })
          + stitch(`M${CX - K.sh + 4},322Q${CX},334 ${CX + K.sh - 4},322`, st, 1.2) + sideFolds(K, 474) })
        + shirtCollar(ctx, K, it.c1, { pat: it.patUrl, stitch: st });
    } },

  { id: 'henley', name: '亨利衫', c1: '#efe5d2', pat: 'none', pc: '#bfae8f', tags: ['workwear', 'casual', 'vintage', 'autumn'],
    sleeve: { len: .96, ease: 3.5, cuff: 'rib' },
    draw: (env, it) => garment(env, it, topRight(env.K, { neck: 'crew', hem: 468 }), {
      extra: crewRib(env.K, it.c1) + placket(env.K, 304, 350, it.c1, 3) + ribBand(env.K, 456, 468, it.c1) }) },

  { id: 'polo', name: '网球Polo衫', c1: '#2f6f4e', c2: '#ffffff', pat: 'none', pc: '#ffffff', tuck: false, tags: ['preppy', 'sporty', 'summer', 'classic'],
    sleeve: { len: .29, ease: 3.5, cuff: 'rib' },
    draw: (env, it) => {
      const { K, ctx } = env;
      return garment(env, it, topRight(K, { neck: 'collar', hem: 462 }), {
        extra: placket(K, 306, 344, it.c1, 2) + path(heartD(CX - 26, 344, 4.2), { fill: it.c2, stroke: lineOf(it.c2), 'stroke-width': .8 }) + sideFolds(K, 462, .8) })
        + shirtCollar(ctx, K, it.c1, {}) + ln(collarEdge(K), it.c2, 1.6, { opacity: .9 });
    } },

  { id: 'cricket', name: '板球毛衣', c1: '#f4eedf', c2: '#23396b', pat: 'none', pc: '#c9bfa6', tags: ['preppy', 'classic', 'vintage', 'winter'],
    sleeve: { len: .96, ease: 4.5, cuff: 'rib' },
    draw: (env, it) => {
      const { K } = env;
      const v = 350;
      const lc = lineOf(it.c1);
      let cable = '';
      for (const x of [CX - 30, CX + 30]) { let d = `M${x},${v - 6}`; for (let y = v - 6; y < 470; y += 12) d += `q6,6 0,12`; cable += ln(d, lc, 1.6, { opacity: .45 }) + ln(d.replace(/q6,6/g, 'q-6,6'), lc, 1.6, { opacity: .45 }); }
      for (const x of [CX - 12, CX + 12, CX - 48, CX + 48]) cable += ln(`M${x},${v - 10}V470`, lc, 1, { opacity: .3 });
      const vBand = (off, c, w) => ln(`M${CX - K.neck - 5 - off},${297 + off * .3}L${CX},${v + off}L${CX + K.neck + 5 + off},${297 + off * .3}`, c, w);
      return garment(env, it, topRight(K, { neck: 'v', vDepth: v, hem: 470, ease: 4.5 }), {
        extra: cable + ribBand(K, 456, 470, it.c1) + ln(`M${CX - 120},460H${CX + 120}`, it.c2, 2.6) + ln(`M${CX - 120},465H${CX + 120}`, '#a23b4a', 2.2) })
        + vBand(3, shadeOf(it.c1, .06), 7) + vBand(1.5, it.c2, 2.4) + vBand(5.2, '#a23b4a', 2);
    },
    sleeveDeco: (ctx, sl, P, arm, K) => '' },

  { id: 'turtle', name: '高领毛衣', c1: '#2e2b36', pat: 'none', pc: '#55505f', tags: ['classic', 'cool', 'winter', 'elegant'],
    sleeve: { len: .96, ease: 4, cuff: 'rib' },
    draw: (env, it) => {
      const { K } = env;
      const w = K.neck + 5;
      let rib = '';
      for (let x = CX - 60; x <= CX + 60; x += 7) rib += `M${x},300V462`;
      const lc = lineOf(it.c1);
      return garment(env, it, topRight(K, { neck: 'turtle', hem: 466, ease: 4 }), { extra: ln(rib, lc, 1.2, { opacity: .35 }) + ribBand(K, 454, 466, it.c1) })
        + flat(`M${CX - w},270Q${CX},276 ${CX + w},270L${CX + w + 2},300Q${CX},310 ${CX - w - 2},300Z`, shadeOf(it.c1, .05), lc, 2.6)
        + ln(`M${CX - w + 4},274V300M${CX - w + 11},275V303M${CX - 3},276V305M${CX + 4},276V305M${CX + w - 11},275V303M${CX + w - 4},274V300`, lc, 1.1, { opacity: .45 });
    } },

  { id: 'hoodie', name: '连帽卫衣', c1: '#f4a6c0', c2: '#fff4f8', pat: 'none', pc: '#ffffff', tags: ['street', 'casual', 'sporty', 'cute'],
    sleeve: { len: .96, ease: 5.5, cuff: 'rib' },
    draw: (env, it) => {
      const { K, ctx } = env;
      const lc = lineOf(it.c1);
      const hood = hoodBack(ctx, K, shadeOf(it.c1, .06));
      const rimD = `M${CX - K.neck - 14},292C${CX - 34},318 ${CX - 12},330 ${CX},334C${CX + 12},330 ${CX + 34},318 ${CX + K.neck + 14},292C${CX + 22},308 ${CX + 10},314 ${CX},316C${CX - 10},314 ${CX - 22},308 ${CX - K.neck - 14},292Z`;
      const rim = path(rimD, shadowFill(.14, { transform: 'translate(1.2,2.4)' })) + flat(rimD, it.c1, lc, 2.4);
      const strings = ln(`M${CX - 8},322L${CX - 10},372M${CX + 8},322L${CX + 11},366`, it.c2, 2.6) + circ(CX - 10, 374, 2.6, { fill: lc }) + circ(CX + 11, 368, 2.6, { fill: lc });
      const pocketD = `M${CX - 40},${474 - 62}L${CX + 40},${474 - 62}L${CX + 50},${474 - 14}L${CX - 50},${474 - 14}Z`;
      return {
        hood,
        main: garment(env, it, topRight(K, { neck: 'crew', hem: 478, ease: 5.5 }), {
          extra: ribBand(K, 464, 478, it.c1) + path(pocketD, { fill: 'none', stroke: lc, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }) + ln(`M${CX - 44},${474 - 40}Q${CX - 40},${474 - 30} ${CX - 47},${474 - 18}M${CX + 44},${474 - 40}Q${CX + 40},${474 - 30} ${CX + 47},${474 - 18}`, lc, 1.4, { opacity: .5 }) })
          + rim + strings,
      };
    } },

  { id: 'sailor', name: '水手服', c1: '#ffffff', c2: '#22345e', pat: 'none', pc: '#9fb7e8', tags: ['cute', 'preppy', 'summer', 'sweet'],
    sleeve: { len: .3, ease: 4, cuff: 'c2' },
    draw: (env, it) => {
      const { K, ctx } = env;
      return garment(env, it, topRight(K, { neck: 'v', vDepth: 356, hem: 460, ease: 4 }), { extra: sideFolds(K, 460, .7) }) + sailorCollar(K, it.c2);
    } },
  { id: 'blouse', name: '泡泡袖衬衫', c1: '#fbf8f2', c2: '#c8303f', pat: 'none', pc: '#ffd1dc', tuck: true, tags: ['sweet', 'cute', 'elegant', 'vintage'],
    sleeve: { len: .27, ease: 3, puff: true, cuff: 'band' },
    draw: (env, it) => {
      const { K, ctx } = env;
      const lc = lineOf(it.c1);
      const pp = (s) => { const X = x => CX + s * x, d = `M${X(1)},299C${X(14)},292 ${X(K.neck + 14)},289 ${X(K.neck + 21)},300C${X(K.neck + 24)},316 ${X(20)},327 ${X(2)},318Z`;
        return path(d, shadowFill(.12, { transform: 'translate(1.5,2)' })) + flat(d, it.c1, lc, 2.2) + stitch(`M${X(6)},301C${X(15)},296 ${X(K.neck + 12)},294 ${X(K.neck + 17)},302C${X(K.neck + 19)},313 ${X(19)},321 ${X(6)},315`, lighten(lc, .5), .8, { opacity: .5 }); };
      const bc = it.c2, blc = lineOf(bc);
      const tails = flat(smooth([[CX - 3, 316], [CX - 13, 328], [CX - 20, 338, 1], [CX - 12, 337], [CX - 7, 342, 1], [CX - 1, 324], [CX + 1, 324], [CX + 7, 342, 1], [CX + 12, 337], [CX + 20, 338, 1], [CX + 13, 328], [CX + 3, 316]]), shadeOf(bc, .08), blc, 2.2);
      const loops = flat(smooth([[CX - 3, 312], [CX - 19, 300], [CX - 27, 304], [CX - 26, 320], [CX - 18, 326], [CX - 3, 318], [CX + 3, 318], [CX + 18, 326], [CX + 26, 320], [CX + 27, 304], [CX + 19, 300], [CX + 3, 312]]), bc, blc, 2.3)
        + ln(`M${CX - 7},313Q${CX - 15},310 ${CX - 20},315M${CX + 7},313Q${CX + 15},310 ${CX + 20},315`, blc, 1.4, { opacity: .6 });
      const bow = g(tails + loops + flat(`M${CX - 5},308L${CX + 5},308L${CX + 6},322L${CX - 6},322Z`, shadeOf(bc, .06), blc, 2.1), { transform: `translate(${CX},318) scale(1.22) translate(${-CX},-312)` });
      return garment(env, it, topRight(K, { neck: 'crew', hem: 466, ease: 3.5 }), { extra: placket(K, 322, 470, it.c1, 4) + sideFolds(K, 466, .8) }) + pp(-1) + pp(1) + bow;
    } },

  { id: 'cami', name: '吊带背心', c1: '#ffd3e2', pat: 'none', pc: '#ffffff', tags: ['summer', 'sweet', 'elegant', 'party'],
    draw: (env, it) => {
      const { K } = env;
      const lc = lineOf(it.c1);
      let lace = '';
      for (let x = CX - K.ch + 4; x < CX + K.ch - 4; x += 8) lace += `M${x},${336}a4,4 0 0,0 8,0`;
      return garment(env, it, topRight(K, { neck: 'square', sleeveless: true, hem: 456, strap: 3 }), { extra: ln(lace, '#fff', 2.2, { opacity: .9 }) })
        + ln(`M${CX + 23},306L${CX + 30},318M${CX - 23},306L${CX - 30},318`, lc, .1);
    } },

  { id: 'raglan', name: '棒球T恤', c1: '#fdfbf6', c2: '#23396b', pat: 'none', pc: '#ffffff', tags: ['sporty', 'casual', 'street', 'vintage'],
    noSeam: true, sleeve: { len: .62, ease: 3.5, color: 'c2', cuff: 'rib' },
    draw: (env, it) => {
      const { K, ctx } = env;
      const c2 = it.c2;
      // raglan panels: everything above the diagonal seam from the neck to the armpit (clipped to the body by garment())
      const rag = s => { const X = x => CX + s * x; return path(`M${X(K.neck + 3)},290L${X(K.sh + 30)},290L${X(K.sh + 30)},349L${X(K.ch + 4)},349Z`, { fill: c2 })
        + ln(`M${X(K.neck + 3)},297L${X(K.ch + 4)},349`, lineOf(c2), 2.2); };
      return garment(env, it, topRight(K, { neck: 'crew', hem: 466 }), { extra: rag(-1) + rag(1) + crewRib(K, c2) });
    } },
  { id: 'aloha', name: '夏威夷衬衫', c1: '#2f8f8a', pat: 'flower', pc: '#fff1c2', tags: ['summer', 'casual', 'vintage', 'street'],
    sleeve: { len: .3, ease: 6.5, flare: 2, fold: 4 },
    draw: (env, it) => {
      const { K } = env;
      const lc = lineOf(it.c1);
      // camp collar: open at the neck, the two wings fold back and lie flat on the chest
      const wing = s => { const X = x => r1(CX + s * x);
        return smooth([[X(1), 344, 1], [X(K.neck + 1), 289, 1], [X(K.neck + 12), 291], [X(K.neck + 24), 299, 1], [X(22), 334], [X(8), 346, 1]]); };
      const collar = [1, -1].map(s => path(wing(s), shadowFill(.14, { transform: 'translate(1.4,2.4)' })) + flat(wing(s), it.c1, lc, 2.3)
        + (it.patUrl ? path(wing(s), { fill: it.patUrl }) : '') + path(wing(s), { fill: 'none', stroke: lc, 'stroke-width': 2.3, 'stroke-linejoin': 'round' })).join('');
      return garment(env, it, topRight(K, { neck: 'v', vDepth: 348, hem: 464, ease: 6.5, boxy: true, flare: 3 }), {
        extra: placket(K, 346, 466, it.c1, 3, CX, { button: '#f4ead0', r: 2.6 }) + sideFolds(K, 464, .8) }) + collar;
    } },

  { id: 'breton', name: '法式海魂衫', c1: '#fbf8f1', pat: 'stripe', pc: '#23396b', tags: ['classic', 'casual', 'vintage', 'summer'],
    sleeve: { len: .88, ease: 3.5 },
    draw: (env, it) => {
      const { K } = env;
      const lc = lineOf(it.c1), w = K.neck + 14;
      // boat neck: the stripes stop under a plain facing band
      const band = path(`M${CX - w - 2},302Q${CX},322 ${CX + w + 2},302L${CX + w + 2},311Q${CX},331 ${CX - w - 2},311Z`, { fill: it.c1 })
        + ln(`M${CX - w - 2},311Q${CX},331 ${CX + w + 2},311`, lc, 1.3, { opacity: .55 });
      return garment(env, it, topRight(K, { neck: 'wide', hem: 464, ease: 4 }), { extra: band + sideFolds(K, 464, .7) });
    } },

  { id: 'fisherman', name: '渔夫麻花毛衣', c1: '#eee4cf', pat: 'none', pc: '#c9bfa6', tags: ['winter', 'vintage', 'classic', 'workwear'],
    sleeve: { len: .96, ease: 6, cuff: 'rib' },
    draw: (env, it) => {
      const { K } = env;
      const lc = lineOf(it.c1), top = 318, bot = 458;
      // aran knit: a diamond lattice down the middle, rope cables either side, moss stitch in between
      let lattice = '';
      for (let y = top; y < bot; y += 16) lattice += `M${CX},${y}L${CX + 11},${y + 8}L${CX},${y + 16}L${CX - 11},${y + 8}Z`;
      let rope = '';
      for (const x of [CX - 27, CX + 27, CX - 50, CX + 50]) { let d = `M${x - 4},${top}`; for (let y = top; y < bot; y += 10) d += `q8,5 0,10`; rope += ln(d, lc, 1.5, { opacity: .5 }) + ln(d.replace(/M(\d+(\.\d+)?)/, (m, v) => 'M' + (+v + 8)).replace(/q8,5/g, 'q-8,5'), lc, 1.5, { opacity: .5 }); }
      let moss = '';
      const r = rng(5);
      for (let i = 0; i < 70; i++) { const s = r() < .5 ? -1 : 1, x = CX + s * (14 + r() * 8), y = top + r() * (bot - top); moss += `M${r1(x)},${r1(y)}h1.6`; }
      return garment(env, it, topRight(K, { neck: 'crew', hem: 472, ease: 6 }), {
        extra: path(lattice, { fill: 'none', stroke: lc, 'stroke-width': 1.5, opacity: .45 }) + rope + ln(moss, lc, 1.4, { opacity: .4 })
          + ln(`M${CX - 39},${top}V${bot}M${CX + 39},${top}V${bot}`, lc, 1, { opacity: .3 }) + ribBand(K, 458, 472, it.c1) + crewRib(K, it.c1, 310) });
    } },

  { id: 'sweat', name: '学院圆领卫衣', c1: '#b9bdc6', c2: '#23396b', pat: 'none', pc: '#ffffff', tags: ['preppy', 'sporty', 'casual', 'vintage'],
    sleeve: { len: .96, ease: 5.5, cuff: 'rib' },
    draw: (env, it) => {
      const { K } = env;
      const lc = lineOf(it.c1);
      // the V-shaped rib insert under the neckband, a classic of old gym sweatshirts
      const gusset = path(`M${CX - 8},302L${CX},318L${CX + 8},302Z`, { fill: shadeOf(it.c1, .1), stroke: lc, 'stroke-width': 1.4, 'stroke-linejoin': 'round' })
        + ln(`M${CX - 4},304L${CX},312M${CX + 4},304L${CX},312`, lc, 1, { opacity: .45 });
      const arc = ln(`M${CX - 30},350Q${CX},338 ${CX + 30},350`, it.c2, 5) + ln(`M${CX - 30},350Q${CX},338 ${CX + 30},350`, lighten(it.c2, .55), 1.2, { 'stroke-dasharray': '4 4' });
      return garment(env, it, topRight(K, { neck: 'crew', hem: 474, ease: 5.5, boxy: true, flare: 1 }), {
        extra: crewRib(K, it.c1, 308) + gusset + arc + ribBand(K, 460, 474, it.c1) + sideFolds(K, 474, .7) });
    } },
);
/* sailor collar (square back flap seen from the front as two navy wings with white tape) and the red scarf knot */
function sailorCollar(K, c2) {
  const l2 = lineOf(c2);
  const collar = S([[CX, 352, 1], [CX + 14, 330], [CX + K.neck + 6, 296, 1], [CX + K.sh - 4, 312], [CX + K.sh + 6, 332, 1], [CX + 30, 348], [CX + 6, 362, 1], [CX, 364, 1]]);
  const stripesL = ln(`M${CX + K.neck + 9},302L${CX + K.sh + 1},330M${CX - K.neck - 9},302L${CX - K.sh - 1},330`, '#fff', 2) + ln(`M${CX + K.sh - 2},336L${CX + 10},356M${CX - K.sh + 2},336L${CX - 10},356`, '#fff', 2);
  const scarf = flat(smooth([[CX - 4, 350], [CX - 20, 344], [CX - 24, 358, 1], [CX - 8, 358], [CX - 16, 388, 1], [CX, 368], [CX + 16, 388, 1], [CX + 8, 358], [CX + 24, 358, 1], [CX + 20, 344], [CX + 4, 350]]), '#e8485f', lineOf('#e8485f'), 2.2) + circ(CX, 354, 5, { fill: '#e8485f', stroke: lineOf('#e8485f'), 'stroke-width': 2 });
  return path(collar, shadowFill(.14, { transform: 'translate(1.4,2.4)' })) + flat(collar, c2, l2, 2.4) + stripesL + scarf;
}
/* tipping stripe along the outer edge of each collar wing (polo) */
function collarEdge(K) {
  const R = collarWing(K), a = R[2], b = R[3];
  const one = s => { const X = x => CX + s * (x - CX); return `M${r1(X(a[0] - 2.5))},${r1(a[1] + 2.6)}L${r1(X(b[0] - 3.8))},${r1(b[1] - 2.4)}`; };
  return one(1) + one(-1);
}
