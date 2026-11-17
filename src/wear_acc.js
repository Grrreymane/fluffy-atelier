/* ===== wear_acc.js — neckwear, accessories, held items, back items ===== */
const bowShape = (x, y, w, h, col) => flat(smooth([[x, y], [x - w * .55, y - h * .5], [x - w, y - h * .45], [x - w * .95, y + h * .4], [x - w * .5, y + h * .45], [x, y + 1], [x + w * .5, y + h * .45], [x + w * .95, y + h * .4], [x + w, y - h * .45], [x + w * .55, y - h * .5]]), col, lineOf(col), 2)
  + flat(`M${x - 4.5},${y - h * .3}h9v${h * .6}h-9z`, shadeOf(col, .08), lineOf(col), 1.6);

ITEMS.neck.push(
  { id: 'ribbon', name: '缎带蝴蝶结', c1: '#e8485f', pat: 'none', pc: '#ffffff', tags: ['cute', 'sweet', 'preppy'],
    draw: (env, it) => bowShape(CX, 306, 26, 22, it.c1) + flat(`M${CX - 4},312L${CX - 14},344L${CX - 6},340L${CX - 1},346ZM${CX + 4},312L${CX + 14},344L${CX + 6},340L${CX + 1},346Z`, it.c1, lineOf(it.c1), 1.8) },
  { id: 'tie', name: '斜纹领带', c1: '#b8293e', pat: 'repp', pc: '#22305a', underJacket: true, tags: ['preppy', 'classic', 'office', 'vintage'],
    draw: (env, it) => {
      const knot = `M${CX - 8.5},297Q${CX},295.4 ${CX + 8.5},297L${CX + 5},311Q${CX},312.6 ${CX - 5},311Z`;
      const blade = smooth([[CX - 5, 310, 1], [CX + 5, 310, 1], [CX + 9.5, 338], [CX + 12.5, 380], [CX + 13.5, 404, 1], [CX, 417, 1], [CX - 13.5, 404, 1], [CX - 12.5, 380], [CX - 9.5, 338]]);
      const dimple = ln(`M${CX - 1},311.5Q${CX + .5},318 ${CX + 2.5},323`, lineOf(it.c1), 1.2, { opacity: .55 });
      return paint(env.ctx, blade, it.c1, { pat: it.patUrl, shade: 'lr', sw: 2.2, extra: dimple }) + path(knot, shadowFill(.2, { transform: 'translate(1.2,2)' }))
        + paint(env.ctx, knot, it.c1, { pat: it.patUrl, shade: 'lr', sw: 2.2 });
    } },
  { id: 'bowtie', name: '绅士领结', c1: '#c9374b', pat: 'dot', pc: '#ffffff', tags: ['classic', 'party', 'vintage', 'cute'],
    draw: (env, it) => { const d = `M${CX},304L${CX - 20},293L${CX - 22},317ZM${CX},304L${CX + 20},293L${CX + 22},317Z`; return paint(env.ctx, d, it.c1, { pat: it.patUrl, sw: 2 }) + circ(CX, 305, 5, { fill: shadeOf(it.c1, .1), stroke: lineOf(it.c1), 'stroke-width': 1.8 }); } },
  { id: 'scarf', name: '格纹围巾', c1: '#b8322a', pat: 'plaid', pc: '#e8d9a8', tags: ['winter', 'classic', 'preppy', 'cute'],
    draw: (env, it) => {
      const { K, ctx } = env;
      const wrap = `M${CX - K.neck - 14},282Q${CX},296 ${CX + K.neck + 14},282L${CX + K.neck + 18},306Q${CX},324 ${CX - K.neck - 18},306Z`;
      const tail = `M${CX + 8},300L${CX + 30},302L${CX + 34},418L${CX + 12},420Z`;
      const tail2 = `M${CX + 2},302L${CX + 20},304L${CX + 14},392L${CX - 4},388Z`;
      let fringe = '';
      for (let x = CX + 13; x < CX + 34; x += 4) fringe += `M${x},420v8`;
      return paint(ctx, tail2, shadeOf(it.c1, .08), { pat: it.patUrl, sw: 2.2 }) + paint(ctx, tail, it.c1, { pat: it.patUrl, sw: 2.2 }) + ln(fringe, it.c1, 2) + paint(ctx, wrap, it.c1, { pat: it.patUrl, sw: 2.4 });
    } },
  { id: 'pearls', name: '珍珠项链', c1: '#fbf6ee', pat: 'none', pc: '#ffffff', tags: ['elegant', 'classic', 'party', 'vintage'],
    draw: (env, it) => {
      const { K } = env;
      let s = '';
      const sp = sampleBezier({ x: CX - K.neck - 4, y: 296 }, { x: CX - K.neck, y: 330 }, { x: CX + K.neck, y: 330 }, { x: CX + K.neck + 4, y: 296 }, 13);
      for (const p of sp) s += circ(p.x, p.y, 3.6, { fill: it.c1, stroke: '#c9bfd6', 'stroke-width': 1.1 }) + circ(p.x - 1.1, p.y - 1.2, 1.1, { fill: '#fff' });
      return s;
    } },
  { id: 'bell', name: '铃铛项圈', c1: '#e8485f', c2: '#f2c75c', pat: 'none', pc: '#ffffff', tags: ['cute', 'sweet', 'fantasy'],
    draw: (env, it) => {
      const { K } = env;
      return flat(`M${CX - K.neck - 2},290Q${CX},300 ${CX + K.neck + 2},290L${CX + K.neck + 2},299Q${CX},309 ${CX - K.neck - 2},299Z`, it.c1, lineOf(it.c1), 2)
        + circ(CX, 312, 8, { fill: it.c2, stroke: lineOf(it.c2), 'stroke-width': 2 }) + ln(`M${CX - 7.5},311H${CX + 7.5}`, lineOf(it.c2), 1.4) + circ(CX, 315, 1.8, { fill: lineOf(it.c2) }) + circ(CX - 3, 308, 1.8, { fill: '#fff', opacity: .7 });
    } },
  { id: 'neckerchief', name: '牛仔方巾', c1: '#c8243c', pat: 'dot', pc: '#ffffff', tags: ['workwear', 'vintage', 'street', 'casual'],
    draw: (env, it) => {
      const { K, ctx } = env;
      const tri = `M${CX - K.neck - 10},290Q${CX},302 ${CX + K.neck + 10},290L${CX + 10},334L${CX},350L${CX - 10},334Z`;
      return paint(ctx, tri, it.c1, { pat: it.patUrl, sw: 2.2 }) + flat(`M${CX + K.neck + 4},292l12,-2l2,10l-10,2z`, shadeOf(it.c1, .1), lineOf(it.c1), 1.6);
    } },
  { id: 'pendant', name: '宝石吊坠', c1: '#d8b45a', c2: '#5bc0eb', pat: 'none', pc: '#ffffff', tags: ['elegant', 'party', 'fantasy'],
    draw: (env, it) => {
      const { K } = env;
      return ln(`M${CX - K.neck - 3},294Q${CX},346 ${CX + K.neck + 3},294`, it.c1, 1.4) + path(`M${CX},328l7,8l-7,10l-7,-10z`, { fill: it.c2, stroke: lineOf(it.c2), 'stroke-width': 1.6 }) + ln(`M${CX - 2},333l2,-2`, '#fff', 1.4);
    } },
);

ITEMS.acc.push(
  { id: 'suspenders', name: '复古背带', c1: '#7a2a32', pat: 'none', pc: '#ffffff', layer: 'accMid', tags: ['vintage', 'workwear', 'classic', 'preppy'],
    draw: (env, it) => {
      const { K } = env;
      const lc = lineOf(it.c1);
      const strap = s => { const X = d => CX + s * d; return flat(`M${X(18)},420L${X(28)},420L${X(K.sh - 12)},306L${X(K.sh - 21)},304Z`, it.c1, lc, 2) + path(`M${X(16)},414h${s * 14}v10h${-s * 14}z`, { fill: '#c9c4bd', stroke: '#6a6670', 'stroke-width': 1.2 }); };
      return strap(-1) + strap(1);
    } },
  { id: 'belt', name: '复古皮带', c1: '#6b3f26', c2: '#d8b45a', pat: 'none', pc: '#ffffff', layer: 'belt', tags: ['vintage', 'workwear', 'classic', 'casual'],
    draw: (env, it) => {
      const { K } = env;
      const w = K.wa + 5;
      return flat(`M${CX - w},410H${CX + w}V421H${CX - w}Z`, it.c1, lineOf(it.c1), 2) + path(`M${CX - 9},407h18v17h-18z`, { fill: 'none', stroke: it.c2, 'stroke-width': 2.6 }) + ln(`M${CX},409V422`, it.c2, 2) + stitch(`M${CX - w + 2},413H${CX - 12}M${CX + 12},413H${CX + w - 2}`, lighten(it.c1, .4), 1);
    } },
  { id: 'watch', name: '复古腕表', c1: '#d8b45a', c2: '#5a3a28', pat: 'none', pc: '#ffffff', layer: 'accMid', tags: ['classic', 'vintage', 'office', 'preppy'], draw: () => '' },
  { id: 'crossbody', name: '帆布斜挎包', c1: '#c08a4a', c2: '#5a3a28', pat: 'none', pc: '#ffffff', layer: 'accTop', tags: ['workwear', 'casual', 'vintage', 'street'],
    draw: (env, it) => {
      const { K, ctx } = env;
      const strap = ln(`M${CX + K.sh - 16},306L${CX - K.hi - 4},452`, it.c2, 7) + ln(`M${CX + K.sh - 16},306L${CX - K.hi - 4},452`, lighten(it.c2, .3), 1.2, { 'stroke-dasharray': '3 3' });
      const bx = CX - K.hi - 30, by = 440;
      const bag = paint(ctx, `M${bx},${by}h48q4,0 4,4v34q0,6 -6,6h-40q-6,0 -6,-6v-34q0,-4 4,-4z`, it.c1, { pat: it.patUrl })
        + flat(`M${bx - 1},${by}h50v18q-25,6 -50,0z`, shadeOf(it.c1, .08), lineOf(it.c1), 2) + path(`M${bx + 20},${by + 12}h10v10h-10z`, { fill: it.c2 });
      return strap + bag;
    } },
  { id: 'pins', name: '徽章别针', c1: '#ff6f91', pat: 'none', pc: '#ffffff', layer: 'accTop', tags: ['cute', 'street', 'casual'],
    draw: (env, it) => {
      const { K } = env;
      const x = CX + K.ch - 14;
      return circ(x, 352, 8, { fill: '#ffd166', stroke: lineOf('#ffd166'), 'stroke-width': 1.6 }) + path(`M${x - 3},350h.1M${x + 3},350h.1`, { stroke: '#3a2a26', 'stroke-width': 2.4, 'stroke-linecap': 'round' }) + ln(`M${x - 4},354Q${x},358 ${x + 4},354`, '#3a2a26', 1.4)
        + path(heartD(x - 14, 372, 6), { fill: it.c1, stroke: lineOf(it.c1), 'stroke-width': 1.4 }) + path(starD(x + 4, 380, 7, .45), { fill: '#7ec4ff', stroke: lineOf('#7ec4ff'), 'stroke-width': 1.4, 'stroke-linejoin': 'round' });
    } },
);

/* ---------- held items: draw(env, it, at, arm) — at = paw center ---------- */
ITEMS.held.push(
  { id: 'icecream', name: '双球冰淇淋', c1: '#ffb3c8', c2: '#bfe8d6', grip: 'cup', pat: 'none', pc: '#ffffff', tags: ['cute', 'summer', 'sweet'],
    draw: (env, it, at) => {
      const { x, y } = at;
      let wafer = '';
      for (let i = -2; i <= 2; i++) wafer += `M${x + i * 5 - 4},${y - 14}L${x + i * 3 + 4},${y + 16}`;
      return flat(`M${x - 11},${y - 16}L${x + 11},${y - 16}L${x},${y + 20}Z`, '#e9b56d', '#9a6a32', 2) + ln(wafer, '#b07a3a', 1, { opacity: .7 })
        + circ(x, y - 22, 12, { fill: it.c2, stroke: lineOf(it.c2), 'stroke-width': 2 }) + circ(x + 1, y - 40, 11, { fill: it.c1, stroke: lineOf(it.c1), 'stroke-width': 2 })
        + circ(x + 3, y - 54, 4.5, { fill: '#e63946', stroke: '#9a1f2a', 'stroke-width': 1.4 }) + ln(`M${x + 4},${y - 58}q2,-6 6,-6`, '#3a7a3a', 1.4) + circ(x - 4, y - 44, 2.6, { fill: '#fff', opacity: .7 });
    } },
  { id: 'boba', name: '珍珠奶茶', c1: '#e8c9a8', c2: '#ff8fab', grip: 'cup', pat: 'none', pc: '#ffffff', tags: ['cute', 'casual', 'sweet', 'street'],
    draw: (env, it, at) => {
      const { x, y } = at;
      let pearls = '';
      for (let i = 0; i < 6; i++) pearls += circ(x - 8 + (i % 3) * 8, y + 10 - Math.floor(i / 3) * 6, 3, { fill: '#3a2a26' });
      return flat(`M${x - 13},${y - 22}L${x + 13},${y - 22}L${x + 10},${y + 18}Q${x},${y + 21} ${x - 10},${y + 18}Z`, it.c1, '#9a7a5a', 2) + pearls
        + flat(`M${x - 15},${y - 22}Q${x},${y - 36} ${x + 15},${y - 22}Z`, '#fffaf2', '#b8aecb', 1.8) + ln(`M${x + 3},${y - 30}L${x + 8},${y - 52}`, it.c2, 5) + ln(`M${x - 12},${y - 10}H${x + 12}`, '#fff', 3, { opacity: .5 });
    } },
  { id: 'coffee', name: '外带咖啡', c1: '#fffaf2', c2: '#8a5a3c', grip: 'cup', pat: 'none', pc: '#ffffff', tags: ['casual', 'office', 'classic', 'autumn'],
    draw: (env, it, at) => {
      const { x, y } = at;
      return flat(`M${x - 12},${y - 20}L${x + 12},${y - 20}L${x + 9},${y + 18}H${x - 9}Z`, it.c1, '#b8aecb', 2) + flat(`M${x - 12},${y - 6}H${x + 12}L${x + 11},${y + 6}H${x - 11}Z`, it.c2, lineOf(it.c2), 1.6)
        + flat(`M${x - 14},${y - 20}H${x + 14}V${y - 26}Q${x},${y - 32} ${x - 14},${y - 26}Z`, '#f4efe6', '#b8aecb', 1.8) + ln(`M${x - 2},${y - 36}q4,-5 0,-10M${x + 5},${y - 38}q4,-5 0,-10`, '#c9bfd6', 1.6, { opacity: .8 });
    } },
  { id: 'camera', name: '复古相机', c1: '#2b2a30', c2: '#d9d2c4', grip: 'cup', pat: 'none', pc: '#ffffff', tags: ['vintage', 'casual', 'street'],
    draw: (env, it, at) => {
      const x = at.x - 14, y = at.y - 6;
      return flat(`M${x - 24},${y - 18}h48v30h-48z`, it.c2, lineOf(it.c2), 2) + flat(`M${x - 24},${y - 6}h48v18h-48z`, it.c1, lineOf(it.c1), 2)
        + circ(x + 2, y - 2, 11, { fill: '#3a3a44', stroke: '#16151a', 'stroke-width': 2 }) + circ(x + 2, y - 2, 6, { fill: '#5b6c8a' }) + circ(x - 1, y - 5, 2, { fill: '#fff', opacity: .7 })
        + path(`M${x - 18},${y - 24}h10v6h-10z`, { fill: it.c1 }) + circ(x + 16, y - 12, 3, { fill: '#fffbe0', stroke: '#9a9480', 'stroke-width': 1 });
    } },
  { id: 'balloon', name: '爱心气球', c1: '#ff4f8b', grip: 'down', pat: 'none', pc: '#ffffff', tags: ['cute', 'party', 'sweet'],
    draw: (env, it, at) => {
      const { x, y } = at;
      const bx = Math.min(x + 34, 370), by = 120;
      return ln(`M${x},${y}C${x + 20},${y - 80} ${bx - 20},${by + 160} ${bx},${by + 36}`, '#8a7f99', 1.4)
        + path(heartD(bx, by, 32), { fill: it.c1, stroke: lineOf(it.c1), 'stroke-width': 2.4 }) + ell(bx - 12, by - 10, 6, 9, { fill: '#fff', opacity: .45, transform: `rotate(-30 ${bx - 12} ${by - 10})` })
        + path(`M${bx - 3},${by + 30}l3,6l3,-6z`, { fill: it.c1 });
    } },
  { id: 'bouquet', name: '花束', c1: '#ff8fab', c2: '#fff6e6', grip: 'front', pat: 'none', pc: '#ffffff', tags: ['sweet', 'elegant', 'nature', 'party'],
    draw: (env, it, at) => {
      const { x, y } = at;
      let fl = ln(`M${x - 4},${y + 16}L${x - 12},${y - 34}M${x},${y + 16}L${x},${y - 44}M${x + 4},${y + 16}L${x + 14},${y - 32}`, '#5f9e5a', 2.6);
      const flower = (fx, fy, c, r) => { let s = ''; for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; s += circ(fx + Math.cos(a) * r * .55, fy + Math.sin(a) * r * .55, r * .5, { fill: c, stroke: lineOf(c), 'stroke-width': 1 }); } return s + circ(fx, fy, r * .35, { fill: '#ffe066' }); };
      fl += ell(x - 22, y - 34, 9, 4, { fill: '#7cc37a', stroke: '#4a7e46', 'stroke-width': 1, transform: `rotate(-30 ${x - 22} ${y - 34})` }) + ell(x + 22, y - 30, 9, 4, { fill: '#7cc37a', stroke: '#4a7e46', 'stroke-width': 1, transform: `rotate(30 ${x + 22} ${y - 30})` });
      fl += flower(x - 13, y - 38, it.c1, 15) + flower(x + 14, y - 36, lighten(it.c1, .35), 14) + flower(x, y - 50, '#ffffff', 15) + flower(x - 2, y - 28, darken(it.c1, .1), 12);
      const paper = flat(`M${x - 26},${y - 24}L${x + 26},${y - 24}L${x + 6},${y + 26}H${x - 6}Z`, it.c2, lineOf(it.c2), 2) + flat(`M${x - 8},${y + 4}h16v6h-16z`, '#ff6f91', lineOf('#ff6f91'), 1.4);
      return paper + fl + bowShape(x, y + 6, 12, 10, '#ff6f91');
    } },
  { id: 'wand', name: '星星魔法棒', c1: '#ffd166', c2: '#ff8fc8', grip: 'cup', pat: 'none', pc: '#ffffff', tags: ['fantasy', 'cute', 'party'],
    draw: (env, it, at) => {
      const { x, y } = at;
      return ln(`M${x},${y + 14}L${x + 8},${y - 54}`, '#fff', 5) + ln(`M${x},${y + 14}L${x + 8},${y - 54}`, it.c2, 3) + path(starD(x + 9, y - 64, 15, .45), { fill: it.c1, stroke: lineOf(it.c1), 'stroke-width': 2.2, 'stroke-linejoin': 'round' })
        + ln(`M${x + 8},${y - 52}q-16,8 -20,24M${x + 8},${y - 52}q14,10 12,26`, it.c2, 1.8) + path(starD(x - 14, y - 76, 3.4, .4, 4), { fill: '#fff' }) + path(starD(x + 30, y - 70, 2.6, .4, 4), { fill: '#fff' });
    } },
  { id: 'briefcase', name: '复古公文包', c1: '#7a4428', pat: 'none', pc: '#ffffff', grip: 'down', tags: ['classic', 'office', 'vintage', 'preppy'],
    draw: (env, it, at) => {
      const { x, y } = at;
      const lc = lineOf(it.c1);
      return path(`M${x - 9},${y + 6}V${y - 4}Q${x - 9},${y - 9} ${x - 4},${y - 9}H${x + 4}Q${x + 9},${y - 9} ${x + 9},${y - 4}V${y + 6}`, { fill: 'none', stroke: darken(it.c1, .2), 'stroke-width': 4.5 })
        + paint(env.ctx, `M${x - 34},${y + 6}h68q4,0 4,4v46q0,4 -4,4h-68q-4,0 -4,-4v-46q0,-4 4,-4z`, it.c1, { shade: 'tb' }) + ln(`M${x - 38},${y + 22}H${x + 38}`, lc, 1.6)
        + path(`M${x - 6},${y + 18}h12v9h-12z`, { fill: '#d8b45a', stroke: '#8a7230', 'stroke-width': 1.2 }) + stitch(`M${x - 34},${y + 10}h68`, lighten(it.c1, .35), 1);
    } },
  { id: 'books', name: '皮带书本', c1: '#2f4e8a', c2: '#a23b4a', grip: 'down', pat: 'none', pc: '#ffffff', tags: ['preppy', 'vintage', 'classic', 'cute'],
    draw: (env, it, at) => {
      const { x, y } = at;
      const book = (yy, w, c) => flat(`M${x - w},${yy}h${w * 2}v12h${-w * 2}z`, c, lineOf(c), 1.8) + path(`M${x + w - 6},${yy + 2}h4v8h-4z`, { fill: '#f6f0e1' });
      return ln(`M${x},${y - 4}V${y + 64}`, '#6b3f26', 5) + book(y + 16, 26, it.c1) + book(y + 28, 23, it.c2) + book(y + 40, 27, '#3f6b4a') + ln(`M${x - 8},${y + 4}Q${x},${y - 6} ${x + 8},${y + 4}`, '#6b3f26', 4) + path(`M${x - 5},${y + 50}h10v8h-10z`, { fill: 'none', stroke: '#d8b45a', 'stroke-width': 2 });
    } },
  { id: 'racket', name: '木网球拍', c1: '#c9955a', c2: '#f6f0e1', grip: 'down', pat: 'none', pc: '#ffffff', tags: ['preppy', 'sporty', 'vintage', 'summer'],
    draw: (env, it, at) => {
      const { x, y } = at;
      const hx = x + 10, hy = y + 74;
      let strings = '';
      for (let i = -3; i <= 3; i++) strings += `M${hx + i * 5},${hy - 30}V${hy + 30}M${hx - 20},${hy + i * 8}H${hx + 20}`;
      return ln(`M${x - 1},${y - 10}L${hx},${hy - 34}`, '#7a5032', 6) + g(ln(strings, '#e8e2d2', 1, { opacity: .9 }), { 'clip-path': env.ctx.clip(`M${hx - 22},${hy}a22,34 0 1,0 44,0a22,34 0 1,0 -44,0Z`) })
        + ell(hx, hy, 22, 34, { fill: 'none', stroke: it.c1, 'stroke-width': 5 }) + ell(hx, hy, 22, 34, { fill: 'none', stroke: lineOf(it.c1), 'stroke-width': 1, opacity: .6 });
    } },
  { id: 'umbrella', name: '绅士长柄伞', c1: '#2a2733', pat: 'none', pc: '#ffffff', grip: 'down', tags: ['classic', 'office', 'vintage', 'elegant'],
    draw: (env, it, at) => {
      const { x, y } = at;
      const lc = lineOf(it.c1);
      return path(`M${x + 6},${y + 4}C${x + 6},${y - 14} ${x - 14},${y - 14} ${x - 14},${y - 2}`, { fill: 'none', stroke: '#7a4a2a', 'stroke-width': 5, 'stroke-linecap': 'round' })
        + ln(`M${x + 6},${y + 4}L${x + 8},${y + 30}`, '#b9b2c4', 3) + flat(`M${x + 2},${y + 30}L${x + 14},${y + 30}L${x + 18},${y + 150}L${x + 10},${710 - 10 > y + 150 ? 690 : y + 160}L${x + 2},${y + 150}Z`, it.c1, lc, 2) + ln(`M${x + 10},${y + 34}L${x + 10},${y + 150}`, lc, 1.2, { opacity: .6 });
    } },
  { id: 'fan', name: '团扇', c1: '#fff6ec', c2: '#ff6f91', grip: 'cup', pat: 'none', pc: '#ffffff', tags: ['chinese', 'elegant', 'summer', 'vintage'],
    draw: (env, it, at) => {
      const { x, y } = at;
      const cx = x + 4, cy = y - 52;
      let bloss = '';
      for (const [bx, by, r] of [[cx - 6, cy - 6, 4.4], [cx + 8, cy + 2, 3.6], [cx - 2, cy + 10, 3]]) { for (let k = 0; k < 5; k++) { const a = k * 1.2566; bloss += circ(bx + Math.cos(a) * r * .7, by + Math.sin(a) * r * .7, r * .55, { fill: it.c2 }); } bloss += circ(bx, by, r * .3, { fill: '#ffe066' }); }
      return ln(`M${x},${y + 14}L${cx},${cy + 26}`, '#8a5a3a', 3.4) + circ(cx, cy, 27, { fill: it.c1, stroke: '#8a5a3a', 'stroke-width': 3 })
        + ln(`M${cx - 18},${cy + 14}Q${cx - 4},${cy + 4} ${cx + 4},${cy - 10}M${cx - 6},${cy + 6}Q${cx + 4},${cy + 6} ${cx + 12},${cy + 2}`, '#6b4a3a', 1.6) + bloss
        + ln(`M${x},${y + 16}q-3,10 0,18M${x},${y + 16}q3,10 0,18`, it.c2, 1.6);
    } },
  { id: 'lantern', name: '红灯笼', c1: '#e0242f', c2: '#f2c75c', grip: 'down', pat: 'none', pc: '#ffffff', tags: ['chinese', 'party', 'fantasy'],
    draw: (env, it, at) => {
      const { x, y } = at;
      const cy = y + 46;
      return ln(`M${x},${y}V${cy - 28}`, it.c2, 2) + flat(`M${x - 12},${cy - 30}h24v6h-24z`, it.c2, lineOf(it.c2), 1.4) + ell(x, cy, 28, 24, { fill: it.c1, stroke: lineOf(it.c1), 'stroke-width': 2.2 })
        + ln(`M${x - 14},${cy - 21}Q${x - 22},${cy} ${x - 14},${cy + 21}M${x},${cy - 24}V${cy + 24}M${x + 14},${cy - 21}Q${x + 22},${cy} ${x + 14},${cy + 21}`, darken(it.c1, .3), 1.4, { opacity: .7 })
        + flat(`M${x - 12},${cy + 22}h24v6h-24z`, it.c2, lineOf(it.c2), 1.4) + ln(`M${x - 6},${cy + 28}v14M${x},${cy + 28}v16M${x + 6},${cy + 28}v14`, it.c2, 1.6) + ell(x - 10, cy - 8, 5, 9, { fill: '#fff', opacity: .25 });
    } },
  { id: 'handbag', name: '小方包', c1: '#ffd1dc', c2: '#ff6f91', grip: 'down', pat: 'none', pc: '#ffffff', tags: ['sweet', 'elegant', 'party', 'cute'],
    draw: (env, it, at) => {
      const { x, y } = at;
      return path(`M${x - 12},${y + 14}Q${x - 12},${y - 8} ${x},${y - 8}Q${x + 12},${y - 8} ${x + 12},${y + 14}`, { fill: 'none', stroke: it.c2, 'stroke-width': 3.4 })
        + paint(env.ctx, `M${x - 22},${y + 12}h44l-3,34q0,4 -4,4h-30q-4,0 -4,-4z`, it.c1, { pat: it.patUrl, shade: 'tb' }) + bowShape(x, y + 22, 10, 8, it.c2);
    } },
);

/* ---------- back items ---------- */
function wing(s, kind, col) {
  const X = x => s > 0 ? x : mirX(x);
  if (kind === 'angel') {
    let out = '';
    const lc = mix(lineOf(col), '#b9a6d9', .5);
    const feather = (ax, ay, ang, L, w, c) => {
      const d = `M0,${-w / 2}Q${L * .62},${-w * .72} ${L},0Q${L * .62},${w * .72} 0,${w / 2}Z`;
      return path(d, { fill: c, stroke: lc, 'stroke-width': 1.6, 'stroke-linejoin': 'round', transform: `translate(${r1(X(ax))},${ay}) rotate(${s > 0 ? ang : 180 - ang})` });
    };
    const rows = [[-52, 34, 8, 132, 30, '#efe8fb'], [-44, 26, 7, 96, 32, '#f8f4ff'], [-36, 16, 6, 60, 34, '#ffffff']];
    rows.forEach(([a0, a1, n, L, w, c], ri) => {
      for (let i = 0; i < n; i++) { const t = i / (n - 1); out += feather(236 + ri * 6, 312 + ri * 4 + t * 26, lerp(a0, a1, t), L * (1 - .22 * t), w, mix(c, col, .5)); }
    });
    return out;
  }
  if (kind === 'devil') {
    const pts = [[X(236), 310], [X(300), 250, 1], [X(372), 232, 1], [X(356), 286, 1], [X(338), 272], [X(330), 322, 1], [X(310), 306], [X(296), 352, 1], [X(278), 334], [X(250), 370]];
    return flat(smooth(pts), col, lineOf(col), 2.4) + ln(`M${X(300)},252L${X(338)},272M${X(300)},252L${X(310)},306M${X(300)},252L${X(278)},334`, lighten(col, .3), 1.6, { opacity: .7 });
  }
  if (kind === 'fairy') {
    const up = [[X(232), 320], [X(276), 236], [X(340), 214], [X(368), 250], [X(340), 300], [X(268), 330]];
    const lo = [[X(232), 336], [X(300), 352], [X(330), 396], [X(300), 424], [X(262), 398]];
    const fill = `url(#fairy-${s > 0 ? 'r' : 'l'})`;
    return flat(smooth(up), col, lineOf(col), 2, { 'fill-opacity': .62 }) + flat(smooth(lo), lighten(col, .2), lineOf(col), 2, { 'fill-opacity': .62 })
      + ln(`M${X(240)},322Q${X(300)},270 ${X(344)},234M${X(240)},330Q${X(300)},300 ${X(352)},284M${X(240)},340Q${X(290)},370 ${X(312)},404`, '#fff', 1.4, { opacity: .7 })
      + circ(X(330), 250, 5, { fill: '#fff', opacity: .6 }) + circ(X(306), 390, 4, { fill: '#fff', opacity: .6 });
  }
  return '';
}
ITEMS.back.push(
  { id: 'angel', name: '天使翅膀', c1: '#ffffff', pat: 'none', pc: '#ffffff', tags: ['fantasy', 'sweet', 'party', 'elegant'],
    draw: (env, it) => ({ bgBack: wing(-1, 'angel', it.c1) + wing(1, 'angel', it.c1) }) },
  { id: 'devil', name: '小恶魔翅膀', c1: '#4a2a5e', pat: 'none', pc: '#ffffff', tags: ['fantasy', 'cool', 'party'],
    draw: (env, it) => ({ bgBack: wing(-1, 'devil', it.c1) + wing(1, 'devil', it.c1) }) },
  { id: 'fairy', name: '精灵翅膀', c1: '#9fe3ff', pat: 'none', pc: '#ffffff', tags: ['fantasy', 'nature', 'sweet', 'cute'],
    draw: (env, it) => ({ bgBack: wing(-1, 'fairy', it.c1) + wing(1, 'fairy', it.c1) }) },
  { id: 'rucksack', name: '帆布双肩包', c1: '#6b7448', c2: '#6b3f26', pat: 'none', pc: '#ffffff', tags: ['workwear', 'casual', 'vintage', 'nature'],
    draw: (env, it) => {
      const { K, ctx } = env;
      const w = Math.max(K.ch, K.sh) + 14;
      const body = paint(ctx, `M${CX - w},316Q${CX - w},300 ${CX - w + 16},298H${CX + w - 16}Q${CX + w},300 ${CX + w},316V440Q${CX + w},452 ${CX + w - 12},452H${CX - w + 12}Q${CX - w},452 ${CX - w},440Z`, it.c1, { shade: 'lr' });
      const strap = s => { const X = d => CX + s * d; return flat(`M${X(K.sh - 22)},302L${X(K.sh - 10)},304L${X(K.ch + 2)},400L${X(K.ch - 8)},402Z`, it.c2, lineOf(it.c2), 1.8) + path(`M${X(K.ch - 6)},356h${s * 12}v8h${-s * 12}z`, { fill: 'none', stroke: '#c9b26a', 'stroke-width': 1.8 }); };
      return { bgBack: body, accTop: strap(-1) + strap(1) };
    } },
  { id: 'guitar', name: '木吉他', c1: '#d9a05a', c2: '#5a3a28', pat: 'none', pc: '#ffffff', tags: ['vintage', 'casual', 'street', 'party'],
    draw: (env, it) => {
      const { K } = env;
      const body = g(flat('M0,-58C24,-58 30,-36 22,-18C40,-6 42,30 24,48C10,62 -10,62 -24,48C-42,30 -40,-6 -22,-18C-30,-36 -24,-58 0,-58Z', it.c1, lineOf(it.c1), 2.4)
        + circ(0, 0, 11, { fill: '#2a1a14' }) + circ(0, 0, 14, { fill: 'none', stroke: lighten(it.c1, .3), 'stroke-width': 1.6 }) + path('M-12,24h24v6h-24z', { fill: it.c2 })
        + flat('M-5,-56L-6,-236L6,-236L5,-56Z', it.c2, lineOf(it.c2), 1.8) + ln('M0,-60V-232', '#e8e0cc', .8, { opacity: .8 }) + flat('M-8,-236h16v-30h-16z', it.c2, lineOf(it.c2), 1.8) + [-262, -252, -242].map(y => circ(-10, y, 2, { fill: '#e8e0cc' }) + circ(10, y, 2, { fill: '#e8e0cc' })).join(''), { transform: `translate(${CX - 80},468) rotate(46)` });
      const strap = ln(`M${CX - K.sh + 12},306L${CX + K.hi},440`, '#3a2a26', 6) + ln(`M${CX - K.sh + 12},306L${CX + K.hi},440`, '#c9374b', 2);
      return { bgBack: body, accTop: strap };
    } },
  { id: 'cape', name: '骑士斗篷', c1: '#8a1f3d', c2: '#f2c75c', pat: 'none', pc: '#ffffff', tags: ['fantasy', 'elegant', 'cool', 'party'],
    draw: (env, it) => {
      const { K, ctx } = env;
      const back = paint(ctx, S([[CX, 290], [CX + K.sh + 8, 304], [CX + K.sh + 30, 380], [CX + K.sh + 46, 560], [CX + K.sh + 50, 664, 1], [CX, 676]]), it.c1, { shade: 'skirt' });
      const front = flat(`M${CX - K.neck - 8},290Q${CX},304 ${CX + K.neck + 8},290L${CX + K.neck + 6},300Q${CX},314 ${CX - K.neck - 6},300Z`, it.c1, lineOf(it.c1), 2) + circ(CX - K.neck - 4, 300, 5, { fill: it.c2, stroke: lineOf(it.c2), 'stroke-width': 1.6 }) + circ(CX + K.neck + 4, 300, 5, { fill: it.c2, stroke: lineOf(it.c2), 'stroke-width': 1.6 }) + ln(`M${CX - K.neck - 4},300Q${CX},310 ${CX + K.neck + 4},300`, it.c2, 1.6);
      return { bgBack: back, accTop: front };
    } },
  { id: 'backbow', name: '后腰大蝴蝶结', c1: '#ff8fab', pat: 'none', pc: '#ffffff', tags: ['sweet', 'cute', 'elegant', 'party'],
    draw: (env, it) => {
      const { K } = env;
      const w = K.hi + 52;
      const d = smooth([[CX, 420], [CX - w * .6, 386], [CX - w, 396], [CX - w * .95, 446], [CX - w * .55, 444], [CX - 20, 432], [CX - 50, 520, 1], [CX - 30, 512], [CX - 18, 524, 1], [CX, 436], [CX + 18, 524, 1], [CX + 30, 512], [CX + 50, 520, 1], [CX + 20, 432], [CX + w * .55, 444], [CX + w * .95, 446], [CX + w, 396], [CX + w * .6, 386]]);
      return { bgBack: paint(env.ctx, d, it.c1, { shade: 'rad' }) };
    } },
);
