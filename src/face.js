/* ===== face.js — eyes, brow spots, nose, mouth, blush ===== */
const EYE_STYLES = [
  { id: 'sparkle', name: '圆圆眼' },
  { id: 'boy', name: '少年' },
  { id: 'round', name: '豆豆眼' },
  { id: 'cat', name: '猫瞳' },
  { id: 'star', name: '星星眼' },
  { id: 'heart', name: '爱心眼' },
  { id: 'sleepy', name: '慵懒' },
  { id: 'happy', name: '眯眯眼' },
];
const EYE_COLORS = ['#43a4e5', '#4fc3f7', '#23928a', '#62b83f', '#c9a227', '#e9a23b', '#8a5a2a', '#e2577f', '#b07cff', '#7b5cf0', '#ff5b5b', '#3a3346'];
const EXPRESSIONS = [
  { id: 'smile', name: '微笑', mouth: 'smile', brow: 'soft', blush: 0 },
  { id: 'grin', name: '开心', mouth: 'grin', brow: 'up', blush: 1 },
  { id: 'fang', name: '得意', mouth: 'fang', brow: 'soft', blush: 0 },
  { id: 'shy', name: '害羞', mouth: 'shy', brow: 'worry', blush: 2 },
  { id: 'cool', name: '酷', mouth: 'smirk', brow: 'sharp', blush: 0 },
  { id: 'wow', name: '惊讶', mouth: 'o', brow: 'high', blush: 0 },
  { id: 'tongue', name: '调皮', mouth: 'tongue', brow: 'up', blush: 1 },
  { id: 'pout', name: '嘟嘴', mouth: 'pout', brow: 'worry', blush: 1 },
];
const EYE_C = { L: [152.5, 224], R: [247.5, 224] };
const INK = '#2c1418';

function drawEyes(ctx, st, F) {
  const style = st.eyes.style, col = st.eyes.color;
  return eyeOne(ctx, style, col, -1, F) + eyeOne(ctx, style, col, 1, F);
}
/* Eye in the reference style: tall rounded opening, iris pushed toward the nose,
   heavy upper lid with a small outer flick, thin full outline, one big highlight.
   Local coords: +x = outward (away from the nose), +y = down. */
function eyeOne(ctx, style, col, side, F) {
  const [ex, ey] = side > 0 ? EYE_C.R : EYE_C.L;
  const X = x => r1(ex + x * side), Yy = y => r1(ey + y);
  const P = pts => pts.map(p => [ex + p[0] * side, ey + p[1], p[2]]);
  const ink = INK;
  let s = '';
  if (style === 'happy') {
    s += ln(`M${X(-19)},${Yy(6)}Q${X(0)},${Yy(-15)} ${X(20)},${Yy(5)}`, ink, 5.4);
    s += ln(`M${X(20)},${Yy(5)}L${X(26)},${Yy(1)}`, ink, 3.2);
    return g(s, { class: 'eye' });
  }
  if (style === 'round') {
    s += ell(ex - 2 * side, ey + 4, 12.5, 15, { fill: ink });
    s += ell(ex - 5 * side, ey - 2, 4.6, 5.6, { fill: '#fff' }) + circ(ex + 2 * side, ey + 10, 2.2, { fill: '#fff' });
    return g(s, { class: 'eye' });
  }
  const boy = style === 'boy';
  const k = boy ? .86 : 1;                          // boys: a bit shorter, flatter lid
  const sy = y => y < 0 ? y * k : y * (boy ? .9 : 1);
  const open = [[22.5, -19.5], [1.5, -24.5], [-20.5, -18], [-22.8, 1.5], [-15, 20.5], [0, 24.5], [15, 18], [22, -1]].map(p => [p[0], sy(p[1])]);
  const scId = ctx.shape(smooth(P(open)));
  const clip = ctx.clipUse(scId);
  const dark = darken(col, .55), mid = darken(col, .18), light = lighten(col, .35);
  const gid = ctx.def('iris2-' + col.slice(1), `<linearGradient id="__ID__" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${dark}"/><stop offset=".46" stop-color="${dark}"/><stop offset=".46" stop-color="${mid}"/><stop offset=".62" stop-color="${col}"/><stop offset="1" stop-color="${light}"/></linearGradient>`);
  const icx = ex - 7 * side, icy = ey + (boy ? 1.5 : 1);
  const irx = boy ? 13.8 : 15, iry = boy ? 19.5 : 23;
  let iris = ell(icx, icy, irx, iry, { fill: `url(#${gid})`, stroke: darken(col, .7), 'stroke-width': 1.3 });
  const pcx = ex - 9 * side, pcy = ey - 1;
  const pupil = darken(col, .74);
  if (style === 'cat') iris += path(`M${r1(pcx)},${r1(pcy - 15)}Q${r1(pcx + 4.6)},${r1(pcy)} ${r1(pcx)},${r1(pcy + 15)}Q${r1(pcx - 4.6)},${r1(pcy)} ${r1(pcx)},${r1(pcy - 15)}Z`, { fill: pupil });
  else if (style === 'heart') iris += path(heartD(pcx, pcy + 1, 8.5), { fill: '#fff', opacity: .95 });
  else if (style === 'star') iris += path(starD(pcx, pcy + 1, 11, .45), { fill: '#fff' });
  else iris += ell(pcx, pcy, boy ? 5.2 : 5.8, boy ? 10.5 : 12.5, { fill: pupil });
  // highlights sit toward the nose, like the reference
  if (style !== 'heart' && style !== 'star') iris += circ(ex - 12 * side, ey - (boy ? 8 : 10), boy ? 3.2 : 3.8, { fill: '#fff' });
  if (style === 'star') iris += path(starD(ex - 12 * side, ey - 11, 3.2, .4, 4), { fill: '#fff' });
  if (style === 'cat' || style === 'sparkle') iris += circ(ex - 3 * side, ey + 13, 1.5, { fill: '#fff', opacity: .85 });
  // lid shadow on the white of the eye
  let shade = path(smooth(P([[30, -40], [-30, -40], [-30, sy(-13)], [-12, sy(-19)], [6, sy(-19.5)], [30, sy(-12)]])), { fill: '#6b3a4a', opacity: .16 });
  if (style === 'sleepy') shade = path(`M${X(-32)},${Yy(-34)}L${X(32)},${Yy(-34)}L${X(32)},${Yy(-2)}Q${X(0)},${Yy(-7)} ${X(-32)},${Yy(-1)}Z`, { fill: F.main });
  s += use(scId, { fill: '#fffdfa' }) + g(iris + shade, { 'clip-path': clip });
  s += use(scId, { fill: 'none', stroke: ink, 'stroke-width': 1.7, 'stroke-linejoin': 'round' });
  // heavy upper lid (filled crescent) with the outer flick
  const ld = style === 'sleepy' ? 15 : 0;
  const lid = boy
    ? [[-22, -16.5], [-12, -21], [1.5, -23], [16, -20], [24.5, -17.5], [30.5, -16, 1], [24, -14.8], [16, -16.4], [1.5, -19], [-11, -17.5], [-21.5, -14.5, 1]]
    : [[-22, -18.5], [-11, -25.5], [1.5, -28], [16, -25], [25.5, -21.5], [32, -19.5, 1], [24.5, -17.5], [16, -20.5], [1.5, -23.5], [-10, -22], [-21, -16.5, 1]];
  s += path(smooth(P(lid.map(p => [p[0], p[1] + ld * (p[1] < -10 ? 1 : 0), p[2]]))), { fill: ink });
  // soft crease above the inner half of the lid
  if (!boy && style !== 'sleepy') s += ln(`M${X(-6)},${Yy(-32.5)}Q${X(-16)},${Yy(-31)} ${X(-21)},${Yy(-24)}`, ink, 1.5, { opacity: .55 });
  return g(g(s, { transform: `translate(${ex},${ey}) scale(1.15,1.12) translate(${-ex},${-ey})` }), { class: 'eye' });
}
function heartD(x, y, s) {
  return `M${r1(x)},${r1(y + s * .95)}C${r1(x - s * 1.7)},${r1(y - s * .15)} ${r1(x - s * .75)},${r1(y - s * 1.35)} ${r1(x)},${r1(y - s * .35)}C${r1(x + s * .75)},${r1(y - s * 1.35)} ${r1(x + s * 1.7)},${r1(y - s * .15)} ${r1(x)},${r1(y + s * .95)}Z`;
}
function starD(x, y, r, inner = .45, n = 5) {
  let d = '';
  for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * inner : r; d += (i ? 'L' : 'M') + r1(x + Math.cos(a) * rr) + ',' + r1(y + Math.sin(a) * rr); }
  return d + 'Z';
}

/* brows are soft fur spots (like the reference), tilted by expression */
function drawBrows(st, F) {
  const ex = EXPRESSIONS.find(e => e.id === st.expr) || EXPRESSIONS[0];
  const lumGap = Math.abs(toHsl(F.sub)[2] - toHsl(F.main)[2]);
  const c = lumGap > .08 ? F.sub : shadeOf(F.main, .16);
  let tilt = 12, dy = 0;
  if (ex.brow === 'up') { dy = -3; tilt = 14; }
  if (ex.brow === 'high') { dy = -7; tilt = 6; }
  if (ex.brow === 'sharp') { tilt = -14; dy = 3; }
  if (ex.brow === 'worry') { tilt = 26; dy = -1; }
  const one = side => {
    const [x0, y0] = side > 0 ? EYE_C.R : EYE_C.L;
    const cx = x0 - 6 * side, cy = y0 - 48 + dy;
    // leaf-like spot, fuller at the inner end
    const d = 'M-13,1.5C-11,-4.5 -2,-7 6,-6.2C12,-5.6 14.5,-1.5 13,2.4C11,6.6 2,7 -4,5.6C-9,4.6 -13.6,4.4 -13,1.5Z';
    return path(d, { fill: c, transform: `translate(${r1(cx)},${r1(cy)}) rotate(${tilt * side}) scale(${-side},1)` });
  };
  return one(-1) + one(1);
}

function noseInfo(st) {
  const sp = SPECIES[st.species];
  return sp.nose === 'big' ? { d: `M187,246Q200,240 213,246Q213,253 206,258Q200,262 194,258Q187,253 187,246Z`, my: 260, hx: 195, hy: 246 }
    : sp.nose === 'pink' ? { d: `M193,247Q200,244.5 207,247Q206.5,252 200,255Q193.5,252 193,247Z`, my: 255, hx: 197, hy: 247.5 }
      : { d: `M191.5,245Q200,242 208.5,245Q210,247.5 206.5,251.2Q202.4,255.6 200,255.6Q197.6,255.6 193.5,251.2Q190,247.5 191.5,245Z`, my: 255.5, hx: 196.4, hy: 246.2 };
}
function drawMouth(st, F) {
  const sp = SPECIES[st.species];
  const ex = EXPRESSIONS.find(e => e.id === st.expr) || EXPRESSIONS[0];
  const N = noseInfo(st), my = N.my;
  const lc = INK;
  let s = '';
  const c = my + 6;     // centre cusp of the ω
  const omega = `M183,${c - .5}Q186.5,${c + 7} 191.5,${c + 7}Q197,${c + 7} 200,${c}Q203,${c + 7} 208.5,${c + 7}Q213.5,${c + 7} 217,${c - .5}`;
  const MOUTH_IN = '#7d2b45';
  switch (ex.mouth) {
    case 'smile': s += ln(omega, lc, 2.4);
      if (sp.teeth) s += path(`M195.6,${c + 5.2}h4.2v4.6q0,2 -2.1,2q-2.1,0 -2.1,-2zM200.2,${c + 5.2}h4.2v4.6q0,2 -2.1,2q-2.1,0 -2.1,-2z`, { fill: '#fff', stroke: lc, 'stroke-width': 1.1, 'stroke-linejoin': 'round' });
      break;
    case 'grin':
      s += path(`M185,${c - 1}Q192,${c + 5} 200,${c}Q208,${c + 5} 215,${c - 1}Q213,${c + 16} 200,${c + 18}Q187,${c + 16} 185,${c - 1}Z`, { fill: MOUTH_IN, stroke: lc, 'stroke-width': 2.2, 'stroke-linejoin': 'round' });
      s += path(`M191,${c + 13}Q200,${c + 6.5} 209,${c + 13}Q205,${c + 17.4} 200,${c + 17.4}Q195,${c + 17.4} 191,${c + 13}Z`, { fill: '#ff8aa5' });
      if (sp.teeth) s += path(`M196,${c + 1.6}h3.8v4.2h-3.8zM200.2,${c + 1.6}h3.8v4.2h-3.8z`, { fill: '#fff' });
      break;
    case 'fang': s += ln(omega, lc, 2.4) + path(`M204.4,${c + 5.6}L209.4,${c + 6.2}L206.6,${c + 11.6}Z`, { fill: '#fff', stroke: lc, 'stroke-width': 1.1, 'stroke-linejoin': 'round' }); break;
    case 'shy': s += ln(`M189,${c + 3}Q191.6,${c} 194.4,${c + 3}Q197.2,${c + 6} 200,${c + 3}Q202.8,${c} 205.6,${c + 3}Q208.4,${c + 6} 211,${c + 3}`, lc, 2.2); break;
    case 'smirk': s += ln(`M186,${c + 3}Q193,${c + 7} 200,${c + 2}Q206,${c + 6} 214,${c - 3}`, lc, 2.4); break;
    case 'o': s += ell(200, c + 6, 5, 6.2, { fill: MOUTH_IN, stroke: lc, 'stroke-width': 2 }); break;
    case 'tongue': {
      // hangs from the right lobe of the ω: its top edge is that lobe (the mouth line covers it), only the hanging part is outlined
      const hang = `M213.1,${c + 5.1}Q213.6,${c + 15} 208.4,${c + 16}Q203.3,${c + 16} 203.6,${c + 5.25}`;
      s += path(`M203.6,${c + 5.25}Q205.75,${c + 7} 208.5,${c + 7}Q211,${c + 7} 213.1,${c + 5.1}` + hang.replace('M', 'L') + 'Z', { fill: '#ff8aa5' })
        + ln(hang, lc, 1.7) + ln(`M208.4,${c + 8.5}L208.6,${c + 12.5}`, '#e05a7d', 1.3) + ln(omega, lc, 2.4);
      break;
    }
    case 'pout': s += ln(`M197,${c}Q203.5,${c + 1} 200,${c + 4}Q203.5,${c + 7} 197,${c + 8}`, lc, 2.4); break;
  }
  return s;
}
function drawNose(st, F) {
  const N = noseInfo(st);
  const c = st.fur.nose || '#532521';
  return path(N.d, { fill: c, stroke: INK, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }) + ell(N.hx, N.hy + .6, 2.6, 1.3, { fill: '#fff', opacity: .55 });
}
function drawBlush(ctx, st) {
  const ex = EXPRESSIONS.find(e => e.id === st.expr) || EXPRESSIONS[0];
  if (!ex.blush) return '';
  const gid = ctx.def('blush', `<radialGradient id="__ID__"><stop offset="0" stop-color="#ff6f9a" stop-opacity=".5"/><stop offset="1" stop-color="#ff6f9a" stop-opacity="0"/></radialGradient>`);
  let s = ell(146, 256, 15, 8, { fill: `url(#${gid})` }) + ell(254, 256, 15, 8, { fill: `url(#${gid})` });
  if (ex.blush > 1) {
    s += ell(146, 256, 14, 7, { fill: `url(#${gid})` }) + ell(254, 256, 14, 7, { fill: `url(#${gid})` });
    for (const x of [138, 146, 154, 246, 254, 262]) s += ln(`M${x + 2},251L${x - 2},260`, '#f0507d', 1.6, { opacity: .8 });
  }
  return s;
}
