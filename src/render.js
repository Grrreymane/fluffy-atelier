/* ===== render.js — compose the character SVG from layers ===== */
const SLOTS = ['top', 'bottom', 'dress', 'outer', 'socks', 'shoes', 'hat', 'glasses', 'neck', 'acc', 'held', 'back', 'face'];
const ITEMS = {}; SLOTS.forEach(s => ITEMS[s] = []);
const ITEM_INDEX = {};
function indexItems() { for (const k of SLOTS) { ITEM_INDEX[k] = {}; for (const it of ITEMS[k]) { it.slot = k; ITEM_INDEX[k][it.id] = it; } } ITEM_INDEX.base = {}; for (const it of BASE_ITEMS) ITEM_INDEX.base[it.id] = it; }
const BASE_ITEMS = [];

const LAYERS = ['bgBack', 'tail', 'hairBack', 'hood', 'armsBack', 'legs', 'socks', 'shoes', 'torso', 'under', 'beltLow', 'over1', 'bib', 'dress', 'accMid',
  'outer', 'accTop', 'neck', 'armsFront', 'ears', 'head', 'face', 'faceDeco', 'brows', 'hairFront', 'glasses', 'hat', 'top'];
/* the whole head (with hats/glasses) is drawn a little larger, pivoting on the chin */
const HEAD_SCALE = 0.94, HEAD_Y = 283, HEAD_TF = `translate(200,${HEAD_Y}) scale(${HEAD_SCALE}) translate(-200,-290)`;
const GLOVE_AT = .55;     // where the dark fur glove starts along the arm (0 = shoulder)
const HEAD_LAYERS = new Set(['ears', 'head', 'face', 'faceDeco', 'hairFront', 'brows', 'glasses', 'hat']);

/* resolve an equipped item into a full "it" object with colors */
function itemOf(slot, w) {
  if (!w) return null;
  const def = (ITEM_INDEX[slot] || {})[w.id] || (ITEM_INDEX.base || {})[w.id];
  if (!def) return null;
  return { def, id: w.id, c1: w.c1 || def.c1, c2: w.c2 || def.c2 || def.c1, pat: w.pat ?? def.pat ?? 'none', pc: w.pc || def.pc || '#ffffff', tuck: w.tuck ?? def.tuck ?? false };
}

function renderCharacter(st, opts = {}) {
  const ctx = makeCtx(opts.id || 'm');
  const K = buildGeom(st);
  const F = furColors(st);
  const L = {};
  const add = (k, s) => { if (s) (L[k] = L[k] || []).push(s); };
  const W = st.wear || {};
  const I = {}; for (const s of SLOTS) I[s] = itemOf(s, W[s]);
  const dress = I.dress;
  const top = I.top && (!dress || dress.def.overTop) ? I.top : null;
  const bottom = I.bottom && !dress ? I.bottom : null;
  const effTop = top || (!dress ? itemOf('base', { id: 'basetank' }) : null);
  const effBottom = bottom || (!dress ? itemOf('base', { id: 'baseshorts' }) : null);
  const env = { ctx, K, F, st, coverArms: !!(I.outer && I.outer.def.coversArms) };
  const sleeveList = [effTop, dress, I.outer].filter(it => it && it.def.sleeve);
  env.sleeveSets = new Map([K.armL, K.armR].map(arm => [arm, visibleSleeves(arm, K, sleeveList)]));
  const masks = new Map();
  for (const it of sleeveList) masks.set(it, armholeMasks(ctx, K, it, [K.armL, K.armR].map(arm => {
    const v = env.sleeveSets.get(arm).find(x => x && x.it === it);
    return v ? v.G : null;
  })));

  // run item draws
  const put = (it, defLayer) => {
    if (!it) return;
    it.pc = it.pc || '#fff';
    it.patUrl = it.pat && it.pat !== 'none' ? ctx.pattern(it.pat, it.pc, it.c1) : null;
    PAINT_MASK = masks.get(it) || null;
    let r = it.def.draw(env, it) || '';
    PAINT_MASK = null;
    if (typeof r === 'string') r = { [defLayer]: r };
    if (it.def.slot === 'neck') for (const k of ['main', defLayer]) if (r[k]) r[k] = castShadow(ctx, r[k], ctx.clip(chest)) + r[k];
    for (const k in r) add(k === 'main' ? defLayer : k, r[k]);
  };
  /* where a garment's cast shadow may fall: only on fabric known to be under it, never on the background.
     An untucked top and a jacket shade the hips of the trousers / skirt under their hem (garment(), jacket());
     a jacket also shades the shirt in its opening, and neckwear the shirt it lies on. */
  const hips = `M${CX - K.hi - 2},440H${CX + K.hi + 2}V500H${CX - K.hi - 2}Z`;
  const chest = S(topRight(K, { neck: 'crew', ease: 4, hem: 470 }));
  env.castOnHips = ctx.clip(hips);
  env.castOnTop = ctx.clipAll([chest, hips]);
  const tucked = effTop && effBottom && !effBottom.def.noTuck && (effTop.tuck || effBottom.def.forceTuck);
  K.tucked = !!tucked;
  if (effBottom) put(effBottom, tucked ? 'over1' : 'under');
  if (effTop) put(effTop, tucked ? 'under' : 'over1');
  put(dress, 'dress');
  put(I.outer, 'outer');
  put(I.socks, 'socks');
  put(I.shoes, 'shoes');
  put(I.hat, 'hat');
  put(I.glasses, 'glasses');
  put(I.neck, I.neck && I.neck.def.underJacket && I.outer && I.outer.def.closed ? 'accMid' : 'neck');
  if (I.acc) put(I.acc, I.acc.def.layer === 'belt' ? (tucked || !effTop ? 'bib' : 'beltLow') : (I.acc.def.layer || 'accMid'));
  put(I.back, 'bgBack');
  put(I.face, 'faceDeco');

  // body
  add('tail', drawTail(ctx, st, F, K));
  const barePaws = !I.shoes;
  add('legs', drawLegs(ctx, st, F, K, barePaws) + (barePaws ? '' : drawFeet(ctx, K, F.foot)));
  // where a bare arm meets the body the two share one outline: hide the torso outline over the shoulder caps
  const zx = K.sh - 16, box = 'x="-60" y="-60" width="520" height="840"';
  const zone = ctx.def(`azone-${zx}`, `<clipPath id="__ID__" clipPathUnits="userSpaceOnUse"><path d="M-60,-60H${CX - zx}V351H-60ZM${CX + zx},-60H460V351H${CX + zx}Z"/></clipPath>`);
  const caps = [K.armL, K.armR].map(a => `<path d="${armShape(a, K).d}" fill="#000"/>`).join('');
  const tmask = ctx.def('tmask-' + ctx.next('t'), `<mask id="__ID__" maskUnits="userSpaceOnUse" ${box}><rect ${box} fill="#fff"/><g clip-path="url(#${zone})">${caps}</g></mask>`);
  add('torso', drawTorso(ctx, st, F, K, `url(#${tmask})`));
  // arms
  const sleeves = [];
  for (const it of [effTop, dress, I.outer]) if (it && it.def.sleeve) sleeves.push(it);
  const heldIt = I.held;
  if (heldIt && heldIt.def.grip === 'front') add('armsFront', drawHeld(env, heldIt, K.armR));
  for (const arm of [K.armL, K.armR]) drawArm(env, arm, sleeves, heldIt, add);
  // head
  add('ears', drawEars(ctx, st, F));
  add('head', drawHead(ctx, st, F));
  add('face', drawEyes(ctx, st, F) + drawNose(st, F) + drawMouth(st, F) + drawBlush(ctx, st));
  add('brows', drawBrows(st, F));
  drawHair(env, add);

  // assemble
  const only = opts.only ? new Set(opts.only) : null;
  let body = '', head = '';
  for (const k of LAYERS) {
    if (only && !only.has(k)) continue;
    const s = (L[k] || []).join('');
    if (!s) continue;
    if (HEAD_LAYERS.has(k)) head += `<g data-l="${k}">${s}</g>`;
    else body += `<g data-l="${k}">${s}</g>`;
  }
  // split: everything before 'ears' is body; head group goes after armsFront
  const vb = opts.viewBox || '0 0 400 720';
  const cls = opts.noAnim ? '' : ' class="char"';
  const extra = opts.wh ? ` width="${opts.wh[0]}" height="${opts.wh[1]}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${cls}${extra} preserveAspectRatio="xMidYMid meet"><defs>${ctx.defsMarkup()}</defs>${body}<g class="headgrp"><g transform="${HEAD_TF}">${head}</g></g></svg>`;
}

/* ---------- set-in sleeves ---------- */
const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function sleeveParts(arm, K, sl) {
  const fur = armFurWidth(K);
  const sp = sl.def.sleeve, len = Math.min(arm.len - 2, arm.len * sp.len);
  const ease = sp.ease ?? 3;
  const col = sp.color === 'c2' ? sl.c2 : sl.c1;
  const sw = t => fur(t) + ease + (sp.taper ? (1 - t) * sp.taper : 0);
  return { sp, len, col, sw, ease };
}
/* Every sleeved garment shares these armhole anchors (right side; mirrored for the left):
   SH_IN sits just under the shoulder line, SH_PT just outside the shoulder point, ARMPIT just inside the side seam. */
function armhole(K, side, outer) {
  const X = dx => CX + side * dx;
  // the same shoulder line as the garment outline (topRight / jacketPanel), so the sleeve continues it exactly
  return outer
    ? { shIn: { x: X(K.sh - 11), y: 301 }, shPt: { x: X(K.sh + 2), y: 309.5 }, pit: { x: X(K.ch + 3), y: 351 }, pitIn: { x: X(K.ch - 6), y: 346 } }
    : { shIn: { x: X(K.sh - 12), y: 303.5 }, shPt: { x: X(K.sh + 1), y: 311 }, pit: { x: X(K.ch + 2), y: 351 }, pitIn: { x: X(K.ch - 6), y: 346 } };
}
/* Outline of a set-in sleeve. Its top edge carries on from the garment's shoulder line, its under edge starts at
   the armpit, and the root lies inside the garment (which is painted over it). wMax: width of a sleeve worn over this one. */
/* bend at the elbow: u1/u2 = upper arm / forearm directions, theta = inside angle (PI = straight),
   n = unit vector into the crook of the elbow */
function armBend(arm) {
  const unit = (x, y) => { const l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l }; };
  const { S, E, W } = arm;
  const u1 = unit(E.x - S.x, E.y - S.y), u2 = unit(W.x - E.x, W.y - E.y);
  const theta = Math.PI - Math.acos(clamp(u1.x * u2.x + u1.y * u2.y, -1, 1));
  let n = { x: u2.x - u1.x, y: u2.y - u1.y };
  if (Math.hypot(n.x, n.y) < .08) n = { x: CX - E.x, y: 0 };
  const u = unit(u1.x + u2.x, u1.y + u2.y), dt = n.x * u.x + n.y * u.y;
  return { u1, u2, u, n: unit(n.x - u.x * dt, n.y - u.y * dt), theta };
}
/* widest the inside of a bent sleeve may be: its two inner edges must meet before the sleeve ends,
   or the inner outline folds over itself (a spike). Infinity when the bend is gentle or the sleeve is short. */
function bendCap(arm, K, P) {
  const Lf = P.len - K.L1, B = armBend(arm);
  if (Lf < 6 || B.theta > 2.6) return Infinity;
  return Math.max(6, .8 * Lf * Math.tan(B.theta / 2));
}
function sleeveGeom(arm, K, P, wMax, outer) {
  const side = arm.side;
  const sp = samplePolyline(cutPolyline(arm.pts, P.len), 3, 12);
  const N = normals(sp), n = sp.length, L = sp[n - 1].s || 1;
  const flare = P.sp.flare || 0, puff = !!P.sp.puff;
  const O = [], I = [];
  // inside of a sharp elbow: squeeze that side near the bend (fabric bunches in the crook)
  const cap = bendCap(arm, K, P);
  let capI = false, reachUp = 0;
  if (cap < Infinity) {
    const B = armBend(arm), ie = Math.min(n - 1, Math.max(0, sp.findIndex(q => q.s >= K.L1)));
    capI = side * N[ie].x * B.n.x + side * N[ie].y * B.n.y > 0;   // the I edge lies inside the bend
    reachUp = cap / Math.tan(B.theta / 2) + 6;                     // how far up the upper arm the squeeze runs
  }
  const squeeze = (s, w) => cap === Infinity ? w : Math.min(w, cap + Math.max(0, K.L1 - reachUp - s) * .45);
  for (let i = 0; i < n; i++) {
    const s = sp[i].s, u = s / L;
    let w = P.sw(s / arm.len);
    if (wMax) w = Math.min(w, wMax(s / arm.len));
    let wo = w, wi = w;
    if (puff) {   // balloon that rises from the shoulder and is gathered into the cuff
      const b = Math.sin(Math.PI * Math.min(1, (u + .14) / .94));
      wo += 12 * b; wi += 5 * b;
    } else {
      const fl = flare * Math.pow(Math.max(0, (u - .4) / .6), 1.4);
      wo += fl; wi += fl * .6;
    }
    if (cap < Infinity) { if (capI) wi = squeeze(s, wi); else wo = squeeze(s, wo); }
    const ux = -side * N[i].x, uy = -side * N[i].y;   // towards the shoulder side of the arm
    O.push({ x: sp[i].x + ux * wo, y: sp[i].y + uy * wo });
    I.push({ x: sp[i].x - ux * wi, y: sp[i].y - uy * wi });
  }
  // armhole anchors join in only where they lie behind the shoulder joint (arm hanging down); on a raised arm
  // the upper edge instead grows straight out of the shoulder line at the shoulder seam
  const H = armhole(K, side, outer), S0 = sp[0], t0 = { x: N[0].tx, y: N[0].ty };
  const behind = q => (q.x - S0.x) * t0.x + (q.y - S0.y) * t0.y < 0;
  let top = [H.shIn, H.shPt].filter(behind);
  const raised = !top.length;
  if (raised) top = [H.shIn];
  const shIn = Object.assign({}, H.shIn, { c: true });   // the garment's shoulder line runs straight into the sleeve here
  let rounded = false;
  if (!raised && !puff) {
    // hanging arm: the shoulder line curves down into the sleeve's outer edge (one quadratic, tangent to both)
    let j = 0; while (j < n - 2 && sp[j].s < 14) j++;
    const Q = O[j], m = (H.shPt.y - H.shIn.y) / (H.shPt.x - H.shIn.x);
    // control point = where the shoulder line meets the sleeve edge extended upwards, so both ends are tangent
    const R2 = O[Math.min(n - 1, j + 3)], dx = Q.x - R2.x, dy = Q.y - R2.y;
    let C = { x: Q.x, y: H.shIn.y + (Q.x - H.shIn.x) * m };
    const den = dy - m * dx;
    if (Math.abs(den) > 1e-6) {
      const u = (H.shIn.y + (Q.x - H.shIn.x) * m - Q.y) / den;   // Q + u*(dx,dy) lies on the shoulder line
      if (u > 0 && u < 40) C = { x: Q.x + u * dx, y: Q.y + u * dy };
    }
    const curve = [];
    for (let k = 1; k < 7; k++) { const t = k / 7, a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t; curve.push({ x: a * H.shIn.x + b * C.x + c * Q.x, y: a * H.shIn.y + b * C.y + c * Q.y }); }
    O.splice(0, j, ...curve);
    top = [];
    rounded = true;
  }
  if (puff) {
    // the outside of a puff is one round curve from the shoulder point to the cuff, fullest just above the cuff
    const Pt = top.length ? top[top.length - 1] : O[0], Q = O[n - 1];
    const e = n - 1, ux = -side * N[e].x, uy = -side * N[e].y;
    const C = { x: Q.x + ux * 22 - N[e].tx * 18, y: Q.y + uy * 22 - N[e].ty * 18 };
    for (let i = 0; i < n; i++) {
      const t = (i + 1) / n, a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t;
      O[i] = { x: a * Pt.x + b * C.x + c * Q.x, y: a * Pt.y + b * C.y + c * Q.y };
    }
  }
  let Oc = deloop(O), Ic = deloop(I);   // the inside of a bent elbow folds into a crease instead of a loop
  if (raised && !puff) {
    const a = H.shIn, b = H.shPt, slope = (b.y - a.y) / (b.x - a.x);
    const under = q => q.y > a.y + (q.x - a.x) * slope - 1;
    let k = 0; while (k < Oc.length - 3 && under(Oc[k])) k++;
    Oc = Oc.slice(k);
  }
  Oc[Oc.length - 1].c = true; Ic[Ic.length - 1].c = true;
  const head = rounded ? [shIn] : [shIn, ...top.slice(1)];
  const pts = [...head, ...Oc, ...Ic.slice().reverse(), H.pit, H.pitIn];
  // the part of the sleeve below arc length s0 as a plain tube, for the front pass of an arm that crosses the body
  // (there the armhole closure above can fold back into view). It starts well above s0, where the front-pass clip
  // cuts it off, and its outline is left open at that end, so neither the closing edge nor its ink can show.
  const at = q => { let b = 0, bd = Infinity; for (let i = 0; i < n; i++) { const d2 = (sp[i].x - q.x) ** 2 + (sp[i].y - q.y) ** 2; if (d2 < bd) { bd = d2; b = i; } } return sp[b].s; };
  const cut = s0 => {
    const o = Oc.filter(q => at(q) >= s0 - 10), i2 = Ic.filter(q => at(q) >= s0 - 10);
    if (o.length < 2 || i2.length < 2) return null;
    const P2 = [Object.assign({}, o[0], { c: true }), ...o.slice(1), ...i2.slice().reverse()];
    P2[P2.length - 1] = Object.assign({}, P2[P2.length - 1], { c: true });
    const pts2 = P2.map(q => [q.x, q.y, q.c ? 1 : 0]);
    return { d: smooth(pts2), open: smooth(pts2, false) };
  };
  return { d: smooth(pts.map(q => [q.x, q.y, q.c ? 1 : 0])), sp, O: Oc, I: Ic, L, cut };
}
/* Mask pair used while painting a sleeved garment: 'hide' removes the garment outline where its own sleeves
   cover the armhole, 'seam' draws a thin armhole seam there instead. Only above the armpit and away from the collar. */
function armholeMasks(ctx, K, it, geoms) {
  const ds = geoms.filter(Boolean).map(G => G.d);
  if (!ds.length) return null;
  const zx = K.sh - 16, zy = 351;
  const zone = ctx.def(`azone-${zx}`, `<clipPath id="__ID__" clipPathUnits="userSpaceOnUse"><path d="M-60,-60H${CX - zx}V${zy}H-60ZM${CX + zx},-60H460V${zy}H${CX + zx}Z"/></clipPath>`);
  const box = 'x="-60" y="-60" width="520" height="840"';
  const shapes = c => `<g clip-path="url(#${zone})">${ds.map(d => `<path d="${d}" fill="${c}"/>`).join('')}</g>`;
  const hide = ctx.def('ahide-' + ctx.next('h'), `<mask id="__ID__" maskUnits="userSpaceOnUse" ${box}><rect ${box} fill="#fff"/>${shapes('#000')}</mask>`);
  const seam = ctx.def('aseam-' + ctx.next('h'), `<mask id="__ID__" maskUnits="userSpaceOnUse" ${box}>${shapes('#fff')}</mask>`);
  return { hide: `url(#${hide})`, seam: it.def.noSeam ? null : `url(#${seam})` };
}
/* which sleeves actually show on an arm: a sleeve is hidden by a longer one worn over it, and never pokes out
   around a shorter one worn over it (it is clamped to that sleeve's width) */
function visibleSleeves(arm, K, sleeves) {
  const Ps = sleeves.map(it => sleeveParts(arm, K, it));
  return sleeves.map((it, i) => {
    const P = Ps[i];
    if (P.len < 6) return null;
    const over = Ps.slice(i + 1).filter(q => q.len >= 6);
    if (over.some(q => q.len >= P.len - 2)) return null;
    const wMax = over.length ? t => Math.min(...over.map(q => q.sw(t))) - .5 : null;
    return { it, P, G: sleeveGeom(arm, K, P, wMax, ITEM_INDEX.outer[it.def.id] === it.def) };
  });
}

/* draw one arm: fur, sleeves (top/dress/outer), held item, paw. Splits into back/front passes.
   The arm (shoulder to paw) is ONE silhouette; the front pass is a clipped copy of the same drawing,
   so there is no seam at the elbow and no separate hand blob. */
function drawArm(env, arm, sleeves, heldIt, add) {
  const { ctx, K, F, st } = env;
  const spc = SPECIES[st.species];
  const isItemArm = heldIt && K.itemArm === arm;
  const ff = arm.frontFrom;
  const front = ff > 0;
  const splitS = frontSplit(arm, K);
  const A = armShape(arm, K);
  const aid = ctx.shape(A.d);
  const glove = !!spc.paws;
  // a gloved arm is filled dark and the fur-coloured upper arm is laid on top (one edge only: the zigzag)
  const pawCol = glove ? F.acc : F.hand;
  const pawInk = pawCol !== F.limb ? lineOf(pawCol) : F.limbLine;
  let mark = '';
  if (glove) mark = path(armUpperD(arm, K, arm.len * GLOVE_AT, A.wf), { fill: F.limb });
  else if (F.hand !== F.limb) mark = path(A.pawFill, { fill: F.hand });
  const furFill = use(aid, { fill: glove ? F.acc : F.limb });
  let fur = mark ? g(furFill + mark, { 'clip-path': ctx.clipUse(aid) }) : furFill;
  if (spc.stripes) fur += armStripes(ctx, arm, K, F, A.d);
  fur += use(aid, { fill: 'none', stroke: F.limbLine, 'stroke-width': 2.7, 'stroke-linejoin': 'round' });
  const pawDeco = A.creases ? ln(A.creases, pawInk, 2)
    : A.pads ? path(A.pads.palm, { fill: F.pad }) + A.pads.toes.map(p => circ(p.x, p.y, A.pads.r, { fill: F.pad })).join('') : '';
  fur += pawDeco;
  let sl = '';
  const vis = (env.sleeveSets.get(arm) || []).filter(Boolean);
  for (const v of vis) sl += sleevePaint(ctx, v.G.d, null, v.it, v.P, arm, K, v.G);
  if (vis.length) {
    const hem = Math.max(...vis.map(v => v.P.len)) - 4;
    if (hem < arm.len - 8) fur = g(fur, { 'clip-path': ctx.clipAll([armTube(arm, K, hem, arm.len, t => A.wf(t) + 14, 'flat', 'round').d, A.pawClip]) });
    else fur = g(fur, { 'clip-path': ctx.clip(A.pawClip) });
  }
  let pawOver = path(A.pawFill, { fill: pawCol }) + path(A.pawLine, { fill: 'none', stroke: pawInk, 'stroke-width': 2.7, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }) + pawDeco;
  if (vis.length) {
    const k = ctx.next('pm');
    ctx.def(k, `<mask id="__ID__" maskUnits="userSpaceOnUse" x="-300" y="-300" width="1000" height="1400"><rect x="-300" y="-300" width="1000" height="1400" fill="#fff"/>${vis.map(v => `<path d="${v.G.d}" fill="#000" stroke="#000" stroke-width="2.6"/>`).join('')}</mask>`);
    pawOver = g(pawOver, { mask: ctx.url(k) });
  }
  const watch = st.wear && st.wear.acc && st.wear.acc.id === 'watch' && arm.side < 0 ? drawWatch(env, arm) : '';
  let back = fur + sl;
  if (!front) {
    if (isItemArm && heldIt.def.grip !== 'front') back += drawHeld(env, heldIt, arm) + pawOver;
    if (arm.hand === 'open') add('top', pawOver);
    add('armsBack', back + watch);
    return;
  }
  add('armsBack', back);
  // front pass: the same drawing, clipped to the forearm and paw
  // the clip must be wider than the widest sleeve, or the sleeve edge gets cut off where it meets the torso
  const reach = Math.max(9, ...sleeves.map(it => { const P = sleeveParts(arm, K, it); return (P.sp.ease ?? 3) + (P.sp.flare || 0) + (P.sp.puff ? 14 : 0) + 5; }));
  const foreClip = ctx.clipAll([armTube(arm, K, splitS, arm.len, t => A.wf(t) + reach, 'flat', 'round').d, A.pawClip]);
  // an arm that crosses the body from the armpit (拿杯子) is cut just under it: there the sleeves are redrawn as plain tubes
  const crossing = arm.cfg === 'cup';
  const slF = crossing ? vis.map(v => { const c = v.G.cut(splitS); return c ? sleevePaint(ctx, c.d, c.open, v.it, v.P, arm, K, v.G) : ''; }).join('') : sl;
  let fr = g(g(fur + slF, { opacity: .999 }), { 'clip-path': foreClip });
  if (isItemArm && heldIt.def.grip !== 'front') fr += drawHeld(env, heldIt, arm) + pawOver;
  add('armsFront', fr + watch);
}
/* where the front pass of an arm starts (arc length from the shoulder). Hands held together in front ('front' 捧手 /
   捧花): the upper arm hangs clear of the body, so the arm comes in front of the clothes just above the elbow.
   An arm raised across the chest ('cup' 拿杯子) is in front of the clothes from the armpit down; otherwise a straight
   cut shows wherever the bodice hides the inside of the upper arm. The cut (square to the upper arm) passes just
   under the armpit point, so the sleeve's whole inner edge is in front while its armhole corner stays behind. */
function frontSplit(arm, K) {
  if (arm.cfg === 'front') return Math.hypot(arm.E.x - arm.S.x, arm.E.y - arm.S.y) - 2;
  if (arm.cfg !== 'cup') return arm.len * arm.frontFrom;
  const { S, E } = arm, l = Math.hypot(E.x - S.x, E.y - S.y) || 1;
  const pit = { x: CX + arm.side * (K.ch + 3), y: 351 };
  const s = ((pit.x - S.x) * (E.x - S.x) + (pit.y - S.y) * (E.y - S.y)) / l - 1;
  return clamp(s, 16, arm.len * arm.frontFrom);
}
function sleevePaint(ctx, d, open, sl, P, arm, K, G) {
  const col = P.col, lc = lineOf(col);
  const sid = ctx.shape(d);
  let s = use(sid, { fill: col });
  if (sl.patUrl && P.sp.color !== 'c2') s += use(sid, { fill: sl.patUrl });
  let extra = '';
  if (P.sp.puff && G) {   // gathers running into the cuff + a soft shadow on the underside
    const at = (u, k) => {
      const o = G.O[Math.round(u * (G.O.length - 1))], q = G.I[Math.round(u * (G.I.length - 1))];
      return { x: lerp(q.x, o.x, k), y: lerp(q.y, o.y, k) };
    };
    let gd = '';
    for (const k of [.3, .55, .8]) {
      const a = at(.16, k), m = at(.45, k + (k - .55) * .3), b = at(.8, .5 + (k - .55) * .5);
      gd += `M${r1(a.x)},${r1(a.y)}Q${r1(m.x)},${r1(m.y)} ${r1(b.x)},${r1(b.y)}`;
    }
    extra += ln(gd, lc, 1.4, { opacity: .45 });
    const sh = [at(.1, 0), at(.4, .14), at(.78, .1), at(.78, 0)];
    extra += path(`M${r1(sh[0].x)},${r1(sh[0].y)}Q${r1(sh[1].x)},${r1(sh[1].y)} ${r1(sh[2].x)},${r1(sh[2].y)}L${r1(sh[3].x)},${r1(sh[3].y)}Z`, shadowFill(.1));
  }
  // cuff band near the end
  if (P.sp.cuff && (P.len > arm.len * 0.55 || P.sp.puff)) {
    const cc = P.sp.cuff === 'c2' ? sl.c2 : P.sp.cuff === 'rib' ? shadeOf(col, .1) : P.sp.cuff === 'band' ? col : P.sp.cuff;
    const cuffT = armTube(arm, K, Math.max(0, P.len - 9), P.len, t => P.sw(t) + 0.5, 'flat', 'flat');
    extra += path(cuffT.d, { fill: cc });
    if (P.sp.cuff === 'rib') extra += ribLines(cuffT.sp, P.sw, lineOf(cc));
    if (P.sp.cuff === 'band') extra += ln(cuffT.open.split('M').filter(Boolean).length ? `M${r1(cuffT.sp[0].x + normals(cuffT.sp)[0].x * 30)},${r1(cuffT.sp[0].y + normals(cuffT.sp)[0].y * 30)}L${r1(cuffT.sp[0].x - normals(cuffT.sp)[0].x * 30)},${r1(cuffT.sp[0].y - normals(cuffT.sp)[0].y * 30)}` : '', lineOf(col), 1.6, { opacity: .8 });
  }
  if (P.sp.fold) {   // folded hem line just above the sleeve end
    const fT = armTube(arm, K, Math.max(0, P.len - P.sp.fold), P.len, t => P.sw(t) + 2, 'flat', 'flat');
    extra += ln(`M${r1(fT.sp[0].x + normals(fT.sp)[0].x * 40)},${r1(fT.sp[0].y + normals(fT.sp)[0].y * 40)}L${r1(fT.sp[0].x - normals(fT.sp)[0].x * 40)},${r1(fT.sp[0].y - normals(fT.sp)[0].y * 40)}`, lc, 1.6, { opacity: .75 });
  }
  // long sleeves bunch into creases on the inside of the elbow
  if (!P.sp.puff && P.len > K.L1 + 14) extra += elbowCrease(arm, K, P, lc);
  if (P.sp.roll) {   // rolled-up sleeve band
    const rT = armTube(arm, K, Math.max(0, P.len - 11), P.len, t => P.sw(t) + 1.5, 'flat', 'flat');
    extra += path(rT.d, { fill: shadeOf(col, .08) }) + ln(rT.open, lc, 1.4, { opacity: .5 });
  }
  s = g(s + extra + stripesAlong(ctx, sl, P, arm, K) + rimShade(ctx, d, .12), { 'clip-path': ctx.clipUse(sid) });
  if (open) s += path(open, { fill: 'none', stroke: lc, 'stroke-width': 2.6, 'stroke-linejoin': 'round' });
  else s += use(sid, { fill: 'none', stroke: lc, 'stroke-width': 2.6, 'stroke-linejoin': 'round' });
  return s;
}
function elbowCrease(arm, K, P, lc) {
  const { E } = arm, { u, n, theta } = armBend(arm);
  const w = Math.min(P.sw(K.L1 / arm.len), bendCap(arm, K, P));
  // the crook corner: where the two inner edges meet (on a straight arm, simply the inner edge)
  const dc = Math.min(w / Math.max(Math.sin(theta / 2), .3), w * 2.4);
  const at = (a, b) => ({ x: r1(E.x + n.x * a + u.x * b), y: r1(E.y + n.y * a + u.y * b) });
  const sharp = dc > w * 1.3, k1 = sharp ? .42 : .06, k2 = sharp ? .52 : .16;   // a deep crook gets shorter creases
  const a1 = at(dc + 1, -7), m1 = at(lerp(dc, dc * k1, .55), -3), e1 = at(dc * k1, 0), a2 = at(dc + 1, 5.5), m2 = at(lerp(dc, dc * k2, .55), 3.4), e2 = at(dc * k2, 1.8);
  return path(`M${a1.x},${a1.y}Q${m1.x},${m1.y} ${e1.x},${e1.y}Q${m2.x},${m2.y} ${a2.x},${a2.y}Z`, shadowFill(.07))
    + ln(`M${a1.x},${a1.y}Q${m1.x},${m1.y} ${e1.x},${e1.y}M${a2.x},${a2.y}Q${m2.x},${m2.y} ${e2.x},${e2.y}`, lc, 1.2, { opacity: .36 });
}
function stripesAlong(ctx, sl, P, arm, K) { return sl.def.sleeveDeco ? sl.def.sleeveDeco(ctx, sl, P, arm, K) : ''; }
function ribLines(sp, wf, col) {
  let s = '';
  const N = normals(sp);
  for (let i = 0; i < sp.length; i += 1) {
    const w = wf(i / (sp.length - 1)) + 1;
    s += `M${r1(sp[i].x + N[i].x * w)},${r1(sp[i].y + N[i].y * w)}L${r1(sp[i].x - N[i].x * w)},${r1(sp[i].y - N[i].y * w)}`;
  }
  return ln(s, col, 1, { opacity: .45 });
}
function armStripes(ctx, arm, K, F, d, from = 0) {
  const clip = ctx.clip(d);
  let s = '';
  for (const f of [.35, .5, .66, .8]) {
    const sAt = arm.len * f; if (sAt < from) continue;
    const p = cutPolyline(arm.pts, sAt), q = p[p.length - 1], q0 = p[p.length - 2];
    const dx = q.x - q0.x, dy = q.y - q0.y, l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l, ny = dx / l, w = K.arm + 2;
    const tip = { x: q.x + nx * w * .1 * arm.side, y: q.y + ny * w * .1 };
    s += path(`M${r1(q.x + nx * w * arm.side - dx / l * 4)},${r1(q.y + ny * w - dy / l * 4)}L${r1(tip.x)},${r1(tip.y)}L${r1(q.x + nx * w * arm.side + dx / l * 4)},${r1(q.y + ny * w + dy / l * 4)}Z`, { fill: F.acc });
  }
  return g(s, { 'clip-path': clip });
}
function drawHeld(env, it, arm) {
  const { K } = env;
  let at = gripPoint(arm, K);
  if (it.def.grip === 'front') {
    const o = gripPoint(K.armL, K), p = gripPoint(K.armR, K);
    at = { x: (o.x + p.x) / 2, y: (o.y + p.y) / 2 };
  }
  return it.def.draw(env, it, at, arm) || '';
}
function drawWatch(env, arm) {
  const { ctx, K, st } = env;
  const it = itemOf('acc', st.wear.acc);
  const p = cutPolyline(arm.pts, arm.len - 9);
  const q = p[p.length - 1], q0 = p[p.length - 2];
  const ang = Math.atan2(q.y - q0.y, q.x - q0.x) * 180 / Math.PI;
  const w = K.arm - 1;
  return g(`<rect x="-6" y="${-w - 1.5}" width="12" height="${2 * w + 3}" rx="3" fill="${it.c2}" stroke="${lineOf(it.c2)}" stroke-width="1.6"/>`
    + circ(0, 0, 6.6, { fill: it.c1, stroke: lineOf(it.c1), 'stroke-width': 1.8 }) + circ(0, 0, 4.6, { fill: '#fffaf0' }) + ln('M0,0L0,-3M0,0L2.4,0', '#3a2a3a', 1.1),
    { transform: `translate(${r1(q.x)},${r1(q.y)}) rotate(${r1(ang)})` });
}
