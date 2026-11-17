/* ===== body.js — parametric body, poses (IK arms), limbs, paws ===== */
const BODIES = {
  girl: { name: '少女', fx: 3, sh: 49, ch: 39, wa: 32, hi: 47, neck: 17, arm: 13, L1: 66, L2: 62, gap: 1.5,
          kc: 24.5, kw: 17, cc: 25.5, cw: 17.6, ac: 28, aw: 14.1 },
  boy:  { name: '少年', fx: 3, sh: 58, ch: 46, wa: 42, hi: 45, neck: 18.5, arm: 14, L1: 64, L2: 60, gap: 2,
          kc: 25, kw: 17.6, cc: 26, cw: 18, ac: 28.5, aw: 14.5 },
  chub: { name: '圆滚滚', fx: 3, sh: 61, ch: 63, wa: 63, hi: 61, neck: 20, arm: 16, L1: 66, L2: 62, gap: 1.5,
          kc: 30.5, kw: 21, cc: 31.5, cw: 21.6, ac: 33.5, aw: 16.5 },
};
const Y = { neck: 292, sh: 324, chest: 368, waist: 412, hip: 452, crotch: 488, knee: 582, calf: 618, ankle: 668, sole: 704 };

const POSES = [
  { id: 'stand', name: '站立', L: 'down', R: 'down' },
  { id: 'wave', name: '挥手', L: 'wave', R: 'down' },
  { id: 'hips', name: '叉腰', L: 'hip', R: 'hip' },
  { id: 'cheer', name: '欢呼', L: 'up', R: 'up' },
  { id: 'hold', name: '捧手', L: 'front', R: 'front' },
];

/* compute geometry for the current state */
function buildGeom(st) {
  const p = BODIES[st.body] || BODIES.girl;
  const K = Object.assign({}, p);
  const pose = POSES.find(q => q.id === st.pose) || POSES[0];
  let cfgL = pose.L, cfgR = pose.R;
  const held = st.wear && st.wear.held ? ITEM_INDEX.held[st.wear.held.id] : null;
  if (held) {
    if (held.grip === 'front') { cfgL = 'front'; cfgR = 'front'; }
    else { cfgR = held.grip; if (cfgL === 'front') cfgL = 'down'; }
  }
  K.bulk = armBulk(st);
  K.armR = armGeom(K, cfgR, 1);
  K.armL = armGeom(K, cfgL, -1);
  K.itemArm = held ? K.armR : null;
  return K;
}

/* how far an arm held in front ('front': 捧手 / 捧花) must stand off the side of the body at the elbow, beyond the
   fur: the garment body's ease (more for a coat) plus the ease of any sleeve long enough to reach the elbow */
function armBulk(st) {
  const W = st.wear || {};
  let body = 2.5, sleeve = 0;
  for (const s of ['top', 'dress', 'outer']) {
    const def = W[s] && ITEM_INDEX[s] && ITEM_INDEX[s][W[s].id];
    if (!def) continue;
    if (s === 'outer') body = Math.max(body, (def.sleeve ? def.sleeve.ease : 4) + 2);
    if (def.sleeve && def.sleeve.len > .45) sleeve = Math.max(sleeve, def.sleeve.ease + (def.sleeve.flare || 0));
  }
  return body + sleeve + 2;
}
function armGeom(K, cfg, side) {
  const Sx = CX + K.sh - 3, Sy = 327;
  const S0 = { x: Sx, y: Sy };
  let T, bend = -1, L2 = K.L2, hand = 'fist', frontFrom = 0.56;
  switch (cfg) {
    case 'down': {   // nearly straight arm hanging slightly outward (reference pose)
      const tx = CX + Math.max(K.hi, K.ch) + K.arm + 24 - Sx, ty = K.L1 + K.L2 - 6, dl = Math.hypot(tx, ty), reach = K.L1 + K.L2 - 2.5;
      T = { x: Sx + tx / dl * reach, y: Sy + ty / dl * reach }; break;
    }
    case 'hip': T = { x: CX + K.wa + 9, y: 419 }; break;
    case 'wave': T = { x: Math.max(Sx + 92, CX + 148), y: Sy - 58 }; bend = 1; hand = 'open'; frontFrom = 0; break;
    case 'up': T = { x: Math.max(Sx + 74, CX + 134), y: Sy - 104 }; bend = 1; hand = 'open'; frontFrom = 0; break;
    case 'cup': T = { x: CX + 30, y: Sy + 50 }; L2 = K.L2 * 0.7; hand = 'grip'; frontFrom = 0.5; break;
    case 'front': T = { x: CX + 13, y: 440 }; hand = 'grip'; frontFrom = 0.5; break;
    default: T = { x: Sx + 19, y: Sy + 140 };
  }
  let r;
  if (cfg === 'front') {
    /* hands together in front: the upper arm hangs down the side of the body like a hanging arm, its elbow just
       clear of the body and the clothes, so the shoulder and armpit are drawn exactly as when standing; only the
       forearm comes round in front. A forearm that can't reach the middle points at it (a round body in a thick
       coat rests its paws on the tummy). */
    const w = K.arm - .9, need = y => CX + torsoHalfAt(K, y) + w + K.bulk;
    let E = null;
    for (let k = 0; k <= 70; k++) {
      const th = k * .01;
      E = { x: Sx + Math.sin(th) * K.L1, y: Sy + Math.cos(th) * K.L1 };
      if (E.x >= need(E.y)) break;
    }
    const d = Math.hypot(T.x - E.x, T.y - E.y);
    r = { E, W: d > L2 ? { x: E.x + (T.x - E.x) / d * L2, y: E.y + (T.y - E.y) / d * L2 } : T };
  } else r = ik(S0, T, K.L1, L2, bend);
  let pts = [S0, r.E, r.W];
  if (side < 0) pts = pts.map(q => ({ x: mirX(q.x), y: q.y }));
  const [S, E, W] = pts;
  const dir = { x: W.x - E.x, y: W.y - E.y }; const dl = Math.hypot(dir.x, dir.y); dir.x /= dl; dir.y /= dl;
  return { cfg, side, S, E, W, pts, len: plen(pts), dir, hand, frontFrom };
}

/* ---------- torso ---------- */
function torsoRight(K) {
  return [[CX, 256], [CX + K.neck, 256], [CX + K.neck, 288], [CX + K.neck + 7, 298], [CX + K.sh - 12, 304],
    [CX + K.sh - 1, 313], [CX + K.sh - 4, 328], [CX + K.ch + 1, 350], [CX + K.ch, 371], [CX + K.wa, 412], [CX + K.hi, 452],
    [CX + K.hi - 5, 478], [CX + K.hi * 0.5, 492], [CX, 494]];
}
function torsoHalfAt(K, y) {
  const P = torsoRight(K);
  for (let i = 1; i < P.length; i++) if (P[i][1] >= y && P[i - 1][1] <= y) {
    const t = (y - P[i - 1][1]) / Math.max(1e-6, P[i][1] - P[i - 1][1]);
    return lerp(P[i - 1][0], P[i][0], t) - CX;
  }
  return K.wa;
}
/* one leg outline (s = -1 viewer-left, +1 viewer-right). add: extra half-widths for garments */
function legPts(K, s, add = {}, hemY = null) {
  const X = dx => CX + s * dx;
  const a = Object.assign({ top: 0, thigh: 0, knee: 0, calf: 0, ankle: 0, inner: 0 }, add);
  const outer = [
    [X(K.hi + a.top - 0.5), 446], [X(lerp(K.hi, K.kc + K.kw, 0.5) + 1 + a.thigh), 526],
    [X(K.kc + K.kw + a.knee), Y.knee], [X(K.cc + K.cw + a.calf), Y.calf], [X(K.ac + K.aw + a.ankle), Y.ankle]];
  const inner = [
    [X(K.ac - K.aw - a.ankle * 0.5 - a.inner), Y.ankle], [X(K.cc - K.cw + 1 - a.calf * 0.5 - a.inner), Y.calf + 2],
    [X(K.kc - K.kw - a.knee * 0.5 - a.inner), Y.knee], [X(K.gap + 1 + (K.kc - K.kw - K.gap) * 0.32 - a.thigh * 0.3 - a.inner), 526],
    [X(Math.max(0, K.gap - a.inner)), Y.crotch]];
  return { outer, inner };
}
/* x of the outer leg edge at height y (rough, for hems) */
function legEdgeAt(K, y, add = 0) {
  const ys = [446, 526, Y.knee, Y.calf, Y.ankle], xo = [K.hi, lerp(K.hi, K.kc + K.kw, .5) + 1, K.kc + K.kw, K.cc + K.cw, K.ac + K.aw];
  const xi = [K.gap, K.gap + 1 + (K.kc - K.kw - K.gap) * .32, K.kc - K.kw, K.cc - K.cw + 1, K.ac - K.aw];
  for (let i = 1; i < ys.length; i++) if (y <= ys[i]) { const t = (y - ys[i - 1]) / (ys[i] - ys[i - 1]); return { o: lerp(xo[i - 1], xo[i], t) + add, i: lerp(xi[i - 1], xi[i], t) - add * .5 }; }
  return { o: xo[4] + add, i: xi[4] - add * .5 };
}
function legPath(K, s, add, cut = 682) {
  const { outer, inner } = legPts(K, s, add);
  const X = dx => CX + s * dx;
  const pts = [[X(K.gap), 444, 1], ...outer, [outer[4][0], cut, 1], [inner[0][0], cut, 1], ...inner, [X(K.gap), Y.crotch, 1]];
  return smooth(pts);
}
/* region of one leg between y0 and y1 (used for socks); add = looseness */
function legBand(K, s, y0, y1, add = 1.2, topRound = 0) {
  const X = dx => CX + s * dx;
  const ys = [];
  for (let y = y0; y < y1; y += 14) ys.push(y);
  ys.push(y1);
  const out = ys.map(y => { const e = legEdgeAt(K, y, add); return [X(e.o), y]; });
  const inn = ys.slice().reverse().map(y => { const e = legEdgeAt(K, y, add); return [X(e.i), y]; });
  out[0][2] = 1; inn[inn.length - 1][2] = 1; out[out.length - 1][2] = 1; inn[0][2] = 1;
  if (topRound) { out[0][1] += topRound * 0.2; }
  return smooth([...out, ...inn]);
}

/* ---------- paws ---------- */
function footPts(K, s) {
  const X = dx => CX + s * dx;
  return [[X(K.ac - K.aw), 660], [X(K.ac + K.aw), 660], [X(K.ac + K.aw + 6), 678], [X(K.ac + K.aw + 9), 693], [X(K.ac + K.aw + 4), 704],
    [X(K.ac + 1), 707], [X(K.ac - K.aw - 5), 704], [X(K.ac - K.aw - 7), 692], [X(K.ac - K.aw - 4), 676]];
}
/* big round bare paw (reference style); returns outline + toe creases for one side */
function toonFoot(K, sd) {
  const X = dx => CX + sd * dx;
  const a = K.ac, w = K.aw;
  const d = smooth([[X(a - w + 1), 646], [X(a - w - 4), 666], [X(a - w - 9), 684], [X(a - w - 8), 700], [X(a - w - 2), 708], [X(a + 1), 710.5], [X(a + w + 4), 708],
    [X(a + w + 10), 699], [X(a + w + 11), 682], [X(a + w + 5), 664], [X(a + w - 1), 646]]);
  const toes = `M${X(a - 6)},709Q${X(a - 6.5)},701 ${X(a - 5.5)},693M${X(a + 7)},709Q${X(a + 7.5)},701 ${X(a + 6.5)},693`;
  return { d, toes };
}
function drawFeet(ctx, K, col) {
  const lc = lineOf(col);
  let s = '';
  for (const sd of [-1, 1]) {
    const X = dx => CX + sd * dx;
    s += flat(smooth(footPts(K, sd)), col, lc, 2.6);
    s += ln(`M${X(K.ac - 4)},706Q${X(K.ac - 4)},700 ${X(K.ac - 3)},696M${X(K.ac + 5)},706Q${X(K.ac + 6)},700 ${X(K.ac + 6)},696`, lc, 1.8, { opacity: .7 });
  }
  return s;
}
/* point where a held item attaches (center of the paw) */
function gripPoint(arm, K) {
  const r = K.arm + 1.6;
  return { x: arm.W.x + arm.dir.x * r * 1.05, y: arm.W.y + arm.dir.y * r * 1.05 };
}

/* ---------- one-piece arm: shoulder, upper arm, elbow, forearm, wrist and paw share a single outline ---------- */
/* fur half-width along the arm: starts slim (hidden in the shoulder), upper arm, slimmer elbow, forearm, wrist */
function armFurWidth(K) {
  const a = K.arm;
  return t => t < .5 ? lerp(a + .8, a - .9, t / .5)
      : t < .72 ? lerp(a - .9, a - .2, Math.sin((t - .5) / .22 * Math.PI / 2))
        : lerp(a - .2, a - 2.4, (t - .72) / .28);
}
/* paw outlines in the wrist frame for a right arm (x < 0 = thumb side for a fist), from the left
   wrist edge to the right one. u/v are in paw units; the first/last points are replaced by the wrist. */
const PAW_FIST = [[-1, 0], [-1, .2, 'w'], [-.98, .52], [-1.17, 1.0], [-1.06, 1.46], [-.8, 1.72, 1], [-.6, 1.96], [-.37, 2.1], [-.13, 2.1, 1], [.13, 2.18], [.4, 2.1, 1],
  [.66, 2.03], [.97, 1.72], [1.09, 1.2], [.98, .6], [1, .2, 'w'], [1, 0]];
const PAW_OPEN = [[-1, 0], [-1, .25, 'w'], [-1.15, 1.0], [-1.05, 1.75, 1], [-.62, 2.05], [-.3, 2.2, 1], [0, 2.28], [.3, 2.2, 1], [.62, 2.05], [1.05, 1.75, 1], [1.25, 1.1],
  [1.65, .55], [1.1, .25], [1, .1, 'w'], [1, 0]];
function armShape(arm, K) {
  if (arm._shape) return arm._shape;
  const sp = samplePolyline(arm.pts, 5, 12);
  const N = normals(sp), n = sp.length;
  const wf = armFurWidth(K);
  let L = [], Rt = [];
  for (let i = 0; i < n; i++) {
    const w = wf(i / (n - 1));
    L.push({ x: sp[i].x + N[i].x * w, y: sp[i].y + N[i].y * w });
    Rt.push({ x: sp[i].x - N[i].x * w, y: sp[i].y - N[i].y * w });
  }
  L = deloop(L); Rt = deloop(Rt);
  // wrist frame: x across (left edge = -ww), y along the forearm
  const W = sp[n - 1], d = { x: N[n - 1].tx, y: N[n - 1].ty }, ww = wf(1);
  const toS = (x, y) => ({ x: W.x + x * d.y + y * d.x, y: W.y - x * d.x + y * d.y });
  const open = arm.hand === 'open';
  const U = (K.arm + 1.6) * (open ? 1.18 : 1.2);
  const mir = arm.side < 0;
  const local = (pts) => {
    let q = pts.map(([u, v, c]) => {
      let x = c === 'w' ? Math.sign(u) * (ww + U * .07) : u * U;
      if (Math.abs(u) === 1 && v === 0 && c === undefined) x = Math.sign(u) * ww;
      return [x, v * U, c === 1];
    });
    if (mir) q = q.map(([x, y, c]) => [-x, y, c]).reverse();
    return q;
  };
  const paw = local(open ? PAW_OPEN : PAW_FIST).slice(1, -1).map(([x, y, c]) => Object.assign(toS(x, y), { c }));
  // shoulder: small round cap tucked inside the torso
  const w0 = wf(0), n0 = N[0], cap = [];
  for (let k = 1; k < 6; k++) { const a = Math.PI * k / 6; cap.push({ x: sp[0].x - n0.x * w0 * Math.cos(a) - n0.tx * w0 * Math.sin(a), y: sp[0].y - n0.y * w0 * Math.cos(a) - n0.ty * w0 * Math.sin(a) }); }
  const d0 = smooth([...L, ...paw, ...Rt.slice().reverse(), ...cap], true);
  // paw on its own (drawn again on top of held items / in front of the head): fill closes a little way up the forearm,
  // the outline only follows the paw contour
  const m = L.length - 1, mr = Rt.length - 1, back = Math.min(3, m, mr);
  const contour = [L[m], ...paw, Rt[mr]];
  // the closing points up the forearm are corners: smoothed, the fill bulged out past the forearm's outline at the wrist
  const corner = q => Object.assign({}, q, { c: true });
  const pawFill = smooth([corner(L[m - back]), corner(L[m]), ...paw, corner(Rt[mr]), corner(Rt[mr - back])], true);
  const pawLine = smooth(contour, false);
  const cx = contour.reduce((a, p) => a + p.x, 0) / contour.length, cy = contour.reduce((a, p) => a + p.y, 0) / contour.length;
  const grow = q => { const dx = q.x - cx, dy = q.y - cy, l = Math.hypot(dx, dy) || 1; return [q.x + dx / l * 5, q.y + dy / l * 5]; };
  const pawClip = poly([[L[m - back].x, L[m - back].y], ...contour.map(grow), [Rt[mr - back].x, Rt[mr - back].y]]) + 'Z';
  // paw details in screen space
  const P = (u, v) => { const x = (mir ? -u : u) * U; const p = toS(x, v * U); return `${r1(p.x)},${r1(p.y)}`; };
  let creases = '', pads = '';
  if (open) {
    const palm = [[-.45, .78], [0, .62], [.45, .78], [.32, 1.18], [0, 1.28], [-.32, 1.18]].map(([u, v]) => toS((mir ? -u : u) * U, v * U));
    pads = smooth(palm);
    pads = { palm: pads, toes: [[-.6, 1.62], [-.2, 1.8], [.2, 1.8], [.6, 1.62]].map(([u, v]) => toS((mir ? -u : u) * U, v * U)), r: U * .19 };
  } else {
    const cr = (a, b) => `M${P(a[0], a[1])}Q${P((a[0] + b[0]) / 2 + .05, (a[1] + b[1]) / 2)} ${P(b[0], b[1])}`;
    creases = cr([-.8, 1.72], [-.66, 1.22]) + cr([-.13, 2.1], [-.1, 1.56]) + cr([.4, 2.1], [.38, 1.58]);
  }
  return (arm._shape = { d: d0, sp, wf, U, creases, pads, pawFill, pawLine, pawClip });
}

/* ---------- arm & sleeve tubes ---------- */
function armWidth(K) { return t => lerp(K.arm + 0.6, K.arm - 2.3, t); }
/* tube along arm polyline from arc-length a to b. returns {d, open} (open = outline without the start edge) */
function armTube(arm, K, a, b, wf, capA = 'round', capB = 'round', flare = 0) {
  let pts = cutPolyline(arm.pts, Math.min(b, arm.len));
  if (a > 0.5) pts = cutPolyline(pts.slice().reverse(), plen(pts) - a).reverse();
  const sp = samplePolyline(pts, 6, 12);
  const width = t => {
    const tt = (a + t * sp.L) / arm.len;
    return wf(tt) + (flare && t > 0.55 ? flare * Math.pow((t - 0.55) / 0.45, 1.6) : 0);
  };
  return { d: tube(sp, width, capA, capB), open: tubeOpen(sp, width, capB), sp, width };
}
