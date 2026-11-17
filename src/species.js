/* ===== species.js — 7 anthro species: colourways, derived colours, tails, torso and legs (heads/ears live in toon.js) ===== */
const SPECIES = {
  fox: { name: '狐狸', ears: 'fox', tail: 'fox', nose: 'tri', paws: true, chest: true,
    pals: [
      { n: '赤狐', main: '#f7863a', sub: '#fee8cb', acc: '#7a3d30', inner: '#ffeacc', nose: '#4a211d', hair: '#f7863a', eye: '#43a4e5' },
      { n: '北极狐', main: '#f2f4fa', sub: '#ffffff', acc: '#9aa2c2', inner: '#ffffff', nose: '#4a4560', hair: '#e6eaf6', eye: '#4fc3f7' },
      { n: '银狐', main: '#8f98ad', sub: '#f2f3f8', acc: '#2f3142', inner: '#e9ebf2', nose: '#2f3142', hair: '#c3c9d8', eye: '#ffc23a' },
      { n: '耳廓狐', main: '#f1d09d', sub: '#fff9ef', acc: '#c48a52', inner: '#ffe9d6', nose: '#5a3a2e', hair: '#f6dcae', eye: '#8a5a2a' },
      { n: '樱花狐', main: '#ff9fc8', sub: '#fff2f8', acc: '#8b5cf6', inner: '#fff2f8', nose: '#6b3a73', hair: '#ffcfe5', eye: '#8b5cf6' },
      { n: '星夜狐', main: '#5d6fd8', sub: '#e9edff', acc: '#1e1b4b', inner: '#e9edff', nose: '#1e1b4b', hair: '#9fb1ff', eye: '#ffcf4a' },
    ] },
  bunny: { name: '兔兔', ears: 'bunny', tail: 'bunny', nose: 'pink', teeth: true, chest: false,
    pals: [
      { n: '雪团兔', main: '#fbf7f3', sub: '#ffffff', acc: '#ffb3c6', inner: '#ffc4d6', nose: '#ff8fab', hair: '#fff0e4', eye: '#e2577f' },
      { n: '奶茶兔', main: '#e8cdab', sub: '#fff7ec', acc: '#c9946a', inner: '#ffc9c0', nose: '#ff8f9f', hair: '#f3dcbf', eye: '#8a5a3a' },
      { n: '灰灰兔', main: '#b8b3c6', sub: '#f1eff6', acc: '#8e88a0', inner: '#ffc6d8', nose: '#ff8fab', hair: '#d9d5e3', eye: '#5a6acf' },
      { n: '可可兔', main: '#8d6248', sub: '#f2dcc8', acc: '#5e3f2d', inner: '#f9c0bd', nose: '#ff8f9f', hair: '#a77a5c', eye: '#e9a23b' },
      { n: '薰衣草兔', main: '#cbb8ff', sub: '#f7f2ff', acc: '#9a83e6', inner: '#ffc4e3', nose: '#ff6fb0', hair: '#e6dbff', eye: '#7b5cf0' },
      { n: '薄荷兔', main: '#a6e3cc', sub: '#f2fff9', acc: '#6cc2a3', inner: '#ffc9d6', nose: '#ff8fab', hair: '#d4f5e8', eye: '#23928a' },
    ] },
  cat: { name: '猫咪', ears: 'cat', tail: 'cat', nose: 'pink', whiskers: true, chest: true,
    pals: [
      { n: '橘猫', main: '#f5b065', sub: '#fff5e9', acc: '#d9772a', inner: '#ffbfcf', nose: '#ff8fa3', hair: '#f8c48a', eye: '#62b83f', stripes: true },
      { n: '黑猫', main: '#3c3746', sub: '#57505f', acc: '#25212c', inner: '#ff9fb6', nose: '#2a2530', hair: '#4a4456', eye: '#ffcf3a' },
      { n: '暹罗猫', main: '#f2e6d4', sub: '#fffaf2', acc: '#5e4639', inner: '#d9a7a0', nose: '#4a3630', hair: '#e9dccb', eye: '#3f92ec', points: true },
      { n: '灰虎斑', main: '#a8afbd', sub: '#f3f4f7', acc: '#636a7a', inner: '#ffb6c8', nose: '#ff8fa3', hair: '#c4cad4', eye: '#6fbe44', stripes: true },
      { n: '糖果猫', main: '#ffc4dd', sub: '#fff4fa', acc: '#ff86bb', inner: '#ff9fc8', nose: '#ff6fa8', hair: '#ffe0ee', eye: '#2bb5b5', stripes: true },
      { n: '雪绒猫', main: '#fdfdfd', sub: '#ffffff', acc: '#d4cfe3', inner: '#ffc0d0', nose: '#ff9fb3', hair: '#f0eef6', eye: '#3f9cf5' },
    ] },
  wolf: { name: '狼', ears: 'wolf', tail: 'wolf', nose: 'tri', chest: true,
    pals: [
      { n: '灰狼', main: '#8e98a9', sub: '#eef1f6', acc: '#4b5263', inner: '#e6e9f0', nose: '#2c2f3a', hair: '#aab3c2', eye: '#f2b632' },
      { n: '雪狼', main: '#eef2f8', sub: '#ffffff', acc: '#a9b3c8', inner: '#ffffff', nose: '#3a3f50', hair: '#ffffff', eye: '#4cb2ff' },
      { n: '黑狼', main: '#3d4150', sub: '#8f95a6', acc: '#22242e', inner: '#6b7080', nose: '#1d1f27', hair: '#555a6c', eye: '#ff6060' },
      { n: '赤狼', main: '#b9764c', sub: '#f3e2cf', acc: '#5e3a28', inner: '#f1dcc6', nose: '#2e211c', hair: '#cf9064', eye: '#94cf45' },
      { n: '星紫狼', main: '#8a7ad8', sub: '#eae6ff', acc: '#3b2f80', inner: '#eae6ff', nose: '#2a2160', hair: '#b8adf5', eye: '#6ff0dc' },
      { n: '冰蓝狼', main: '#6aa8e8', sub: '#eaf5ff', acc: '#24508a', inner: '#eaf5ff', nose: '#1d3557', hair: '#a8d0f5', eye: '#f6d743' },
    ] },
  bear: { name: '小熊', ears: 'bear', tail: 'bear', nose: 'big', chest: false,
    pals: [
      { n: '棕熊', main: '#a46f4b', sub: '#f1dcc3', acc: '#6b4630', inner: '#d9ab88', nose: '#3a2620', hair: '#b88560', eye: '#3a2620' },
      { n: '蜂蜜熊', main: '#e7ae62', sub: '#fff2dc', acc: '#b77a35', inner: '#f8d29e', nose: '#4a2f20', hair: '#f0c27e', eye: '#5a3a20' },
      { n: '北极熊', main: '#f7f6f2', sub: '#ffffff', acc: '#cfcabe', inner: '#ece6da', nose: '#2a2a33', hair: '#ffffff', eye: '#2a2a33' },
      { n: '熊猫', main: '#f8f7f5', sub: '#ffffff', acc: '#2b2a33', inner: '#4a4852', nose: '#2b2a33', hair: '#ffffff', eye: '#2b2a33', panda: true },
      { n: '草莓熊', main: '#ff9ab8', sub: '#fff0f5', acc: '#e05b8a', inner: '#ffc5d6', nose: '#8a2d52', hair: '#ffc2d5', eye: '#8a2d52' },
      { n: '月牙熊', main: '#3a3540', sub: '#f2ece4', acc: '#221f26', inner: '#5a5462', nose: '#1a181e', hair: '#4a4452', eye: '#c08a3e', moon: true },
    ] },
  deer: { name: '小鹿', ears: 'deer', tail: 'deer', nose: 'tri', antlers: true, chest: true,
    pals: [
      { n: '梅花鹿', main: '#c98b55', sub: '#fff4e4', acc: '#5a3a29', inner: '#f2c9a6', nose: '#2e211c', antler: '#f0dcc0', hair: '#d9a06d', eye: '#6b3e26', spots: true },
      { n: '驯鹿', main: '#9b7a63', sub: '#f2e6da', acc: '#4a3a30', inner: '#d9c0ae', nose: '#e63946', antler: '#e8d5b5', hair: '#b8977e', eye: '#4a3a30' },
      { n: '白鹿', main: '#f4efe7', sub: '#ffffff', acc: '#c9b79c', inner: '#f6dfd0', nose: '#6b5a4a', antler: '#f2c75c', hair: '#fffaf2', eye: '#b07cff' },
      { n: '樱花鹿', main: '#f7b8c8', sub: '#fff4f7', acc: '#b5577a', inner: '#ffd6e2', nose: '#8a3a5a', antler: '#fff0f5', hair: '#ffd9e4', eye: '#e2577f', spots: true },
      { n: '月光鹿', main: '#7d8fd9', sub: '#eef1ff', acc: '#2c3470', inner: '#c9d1ff', nose: '#2c3470', antler: '#dfe6ff', hair: '#b3c0f5', eye: '#ffcf4a', spots: true },
    ] },
  tiger: { name: '老虎', ears: 'tiger', tail: 'tiger', nose: 'pinktri', stripes: true, chest: true,
    pals: [
      { n: '孟加拉虎', main: '#f39a38', sub: '#fff6ea', acc: '#2c2230', inner: '#fff6ea', nose: '#e8798f', hair: '#f7ad55', eye: '#8fcb40' },
      { n: '白虎', main: '#f6f4f1', sub: '#ffffff', acc: '#3a3946', inner: '#ffffff', nose: '#f08ca0', hair: '#ffffff', eye: '#4cb2ff' },
      { n: '金虎', main: '#f2c66e', sub: '#fff8ea', acc: '#a8682e', inner: '#fff8ea', nose: '#d9776a', hair: '#f7d68f', eye: '#23928a' },
      { n: '暗夜虎', main: '#4a4560', sub: '#d8d3e8', acc: '#16141f', inner: '#d8d3e8', nose: '#ff6f91', hair: '#6a6485', eye: '#ff9f1c' },
      { n: '霓虹虎', main: '#ff8ad8', sub: '#fff0fb', acc: '#5b2a86', inner: '#fff0fb', nose: '#5b2a86', hair: '#ffc2ec', eye: '#30d5c8' },
    ] },
};
const SPECIES_ORDER = ['fox', 'bunny', 'cat', 'wolf', 'bear', 'deer', 'tiger'];
const DEFAULT_NAMES = { fox: '橘子', bunny: '团子', cat: '布丁', wolf: '阿灰', bear: '可可', deer: '小栗', tiger: '大福' };

/* derived fur colors used across the renderer */
function furColors(st) {
  const sp = SPECIES[st.species], f = st.fur;
  const limb = f.panda ? f.acc : f.main;
  return {
    main: f.main, sub: f.sub, acc: f.acc, inner: f.inner || f.sub, nose: f.nose, antler: f.antler || '#f0dcc0',
    line: lineOf(f.main), limb, limbLine: lineOf(limb),
    hand: (sp.paws || f.points || f.panda) ? f.acc : f.main,
    foot: (sp.paws || f.points || f.panda) ? f.acc : f.main,
    pad: isLight(f.main) ? '#ff9fb6' : '#ffb0c4',
  };
}

/* ---------- head & ears: reference-style parts in toon.js ---------- */
function drawEars(ctx, st, F) { return drawToonEars(ctx, st, F); }
function drawHead(ctx, st, F) { return drawToonHead(ctx, st, F); }

/* ---------- tails ---------- */
function tailAnchor(K) { return { x: CX - K.hi + 16, y: 462 }; }
function drawTail(ctx, st, F, K) {
  const sp = SPECIES[st.species];
  const A = tailAnchor(K);
  if (TOON_TAILS[sp.tail]) return drawToonTail(ctx, st, F, A);
  if (sp.tail === 'cat' || sp.tail === 'tiger') return drawToonLongTail(ctx, st, F, A);
  // short tails peek out beside the hip
  const lc = F.line;
  let s = '';
  switch (sp.tail) {
    case 'bunny': {
      const pts = []; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = i % 2 ? 15 : 19; pts.push([-12 + Math.cos(a) * r, -2 + Math.sin(a) * r, i % 2 === 0]); }
      s += flat(smooth(pts), F.sub, lineOf(F.sub), 2.6);
      break;
    }
    case 'deer':
      s += flat(smooth([[0, -8], [-14, -10], [-24, 2], [-20, 16, 1], [-8, 8], [2, 6]]), F.main, lc, 2.6) + path(smooth([[-6, 0], [-18, 4], [-18, 12, 1], [-8, 6]]), { fill: F.sub });
      break;
    case 'bear': s += circ(-8, 0, 12, { fill: st.fur.panda ? F.acc : F.main, stroke: lc, 'stroke-width': 2.6 }); break;
  }
  return g(g(s, { transform: `translate(${A.x},${A.y})` }), { class: 'tail', style: `transform-origin:${A.x}px ${A.y}px` });
}

/* ---------- torso fur + markings ---------- */
function drawTorso(ctx, st, F, K, lineMask) {
  const sp = SPECIES[st.species], pal = st.fur;
  const d = S(torsoRight(K));
  const sid = ctx.shape(d);
  let m = ell(200, 297, K.neck + 7, 8, shadowFill(.22));
  if (sp.chest || pal.moon) {
    const c = F.sub;
    if (pal.moon) m += path('M168,318Q200,346 232,318Q226,336 200,340Q174,336 168,318Z', { fill: c });
    else m += path(S([[200, 286], [214, 292], [224, 310, 1], [216, 316], [222, 332, 1], [212, 334], [208, 350, 1], [200, 344]]), { fill: c });
  }
  if (sp.tail === 'bear' && !pal.moon && !pal.panda) m += ell(200, 418, K.wa - 6, 50, { fill: F.sub, opacity: .9 });
  if (pal.panda) m += path(S([[200, 300], [CX + K.neck + 4, 300], [CX + K.sh + 10, 316], [CX + K.sh + 10, 360], [CX + K.ch - 6, 368], [200, 352]]), { fill: F.acc });
  let s = g(use(sid, { fill: F.main }) + m + rimShade(ctx, d), { 'clip-path': ctx.clipUse(sid) });
  s += use(sid, Object.assign({ fill: 'none', stroke: F.line, 'stroke-width': 2.8, 'stroke-linejoin': 'round' }, lineMask ? { mask: lineMask } : {}));
  return s;
}
function drawLegs(ctx, st, F, K, bare = false) {
  const sp = SPECIES[st.species];
  let s = '';
  for (const sd of [-1, 1]) {
    const d = legPath(K, sd, {});
    const sid = ctx.shape(d);
    const foot = bare ? toonFoot(K, sd) : null;
    let m = '';
    if (sp.stripes) for (const y of [540, 572, 604, 636]) { const e = legEdgeAt(K, y); const X = dx => CX + sd * dx; m += path(`M${X(e.o + 4)},${y - 6}L${X((e.o + e.i) / 2)},${y}L${X(e.o + 4)},${y + 6}Z`, { fill: F.acc }); }
    if (sp.paws) m += path(sockD(K, sd, 604), { fill: F.acc });
    if (foot) {
      const fid = ctx.shape(foot.d), fl = lineOf(F.foot);
      s += use(sid, { fill: 'none', stroke: F.limbLine, 'stroke-width': 5.4, 'stroke-linejoin': 'round' }) + use(fid, { fill: 'none', stroke: fl, 'stroke-width': 5.4, 'stroke-linejoin': 'round' })
        + g(use(sid, { fill: F.limb }) + m + rimShade(ctx, d), { 'clip-path': ctx.clipUse(sid) })
        + g(use(fid, { fill: F.foot }) + path(`M${CX + sd * K.ac + K.aw - 2},640L${CX + sd * K.ac + K.aw + 30},640L${CX + sd * K.ac + K.aw + 30},720L${CX + sd * K.ac + 3},720Z`, shadowFill(.12)), { 'clip-path': ctx.clipUse(fid) })
        + ln(foot.toes, fl, 2.1);
      continue;
    }
    s += g(use(sid, { fill: F.limb }) + m + rimShade(ctx, d), { 'clip-path': ctx.clipUse(sid) }) + use(sid, { fill: 'none', stroke: F.limbLine, 'stroke-width': 2.7, 'stroke-linejoin': 'round' });
  }
  return s;
}
