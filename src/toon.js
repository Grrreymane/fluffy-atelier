/* ===== toon.js — reference-style anthro parts: head silhouette, face mask, big ears, plush tail,
   fur "gloves" and "socks". Everything is flat colour + one dark ink line + a few hard shadow blocks. ===== */

/* mirror a list of [x,y,flag] around the centre line */
const mirList = pts => pts.map(p => [mirX(p[0]), p[1], p[2]]);

/* ---------- head silhouettes (right half, top -> bottom) + the default tuft on top ---------- */
/* Every head shares the same eye line (y 224), brow line, nose and chin (~y 290) so faces, hats and glasses fit all. */
const TOON_HEADS = {
  /* fox: traced from the reference at 0.48 scale */
  fox: {
    right: [[212, 120.5], [223.5, 122.7], [242, 132], [259.5, 145.8], [272, 157.3], [280.6, 168.8], [286.9, 180.3], [295, 189.4], [301.4, 199.5], [302.2, 205],
      [298.8, 210.5], [297.4, 215], [300.2, 219.4], [305, 223.6], [316, 227.6], [324.3, 230.7, 1], [316.6, 236.6], [311.2, 242], [304.2, 247, 1], [311.6, 251],
      [316.6, 253.3, 1], [309.6, 257], [301.8, 262.4, 1], [292.4, 266], [288.6, 270.4], [288.8, 279.2, 1], [282.8, 275.6, 1], [266.2, 276.8], [256.6, 280.6], [236, 285.4],
      [215.8, 289.3], [200, 290.2]],
    tuft: [[176, 126.4], [183.4, 124.4], [194, 118], [206.8, 112.4, 1], [202.6, 119.8, 1]],
  },
  /* wolf: like the fox but squarer, with long swept cheek tufts */
  wolf: {
    right: [[212, 120], [225, 122.5], [244, 131], [262, 144.5], [275, 156.5], [284, 168.5], [291, 180.5], [299, 191], [305, 202], [306.5, 208],
      [303, 213], [305, 219], [319, 224], [336, 229, 1], [320, 236], [313, 243, 1], [326, 249], [333, 254, 1], [317, 258], [305, 264, 1], [312, 274, 1], [297, 273],
      [287, 279], [267, 283], [247, 287], [226, 290], [210, 291.5], [200, 292]],
    tuft: [[172, 127], [180, 120], [185, 108, 1], [192, 117, 1], [199, 104, 1], [203, 115, 1], [207, 118]],
  },
  /* tiger: big round head with a wide cheek ruff */
  tiger: {
    right: [[212, 117.5], [231, 120.5], [251, 129], [268, 141], [282, 155], [292, 171], [299, 189], [304, 207], [306, 215], [313, 221], [329, 227, 1], [317, 234],
      [325, 243, 1], [313, 249], [321, 259, 1], [305, 262], [308, 273, 1], [293, 272], [283, 280], [263, 285], [241, 289.5], [219, 291.5], [200, 292]],
    tuft: [[180, 121], [190, 116], [198, 108, 1], [203, 115, 1]],
  },
  /* cat: round face, two small cheek fluffs */
  cat: {
    right: [[212, 119], [228, 121.5], [247, 129.5], [264, 141], [278, 155], [288, 171], [295, 189], [299, 207], [301, 220], [308, 229], [319, 235, 1], [307, 241],
      [313, 250, 1], [299, 256], [291, 266], [278, 276], [258, 283.5], [237, 288.5], [217, 291], [200, 291.5]],
    tuft: [[181, 122], [190, 118], [196, 110, 1], [200, 117, 1], [205, 112, 1], [207, 119]],
  },
  /* bunny: soft round head and chubby cheeks */
  bunny: {
    right: [[212, 116.5], [230, 119.5], [250, 127.5], [268, 139.5], [282, 154.5], [291, 171.5], [297, 191], [300, 212], [300, 231], [299, 246], [305, 256, 1],
      [294, 262], [285, 272], [270, 282], [251, 288], [231, 291.5], [213, 293], [200, 293.5]],
    tuft: [[183, 120], [192, 114], [203, 110, 1], [201, 117]],
  },
  /* bear: wide round head, no spikes */
  bear: {
    right: [[212, 116], [232, 118.5], [254, 126], [272, 138], [286, 153], [296, 172], [302, 194], [305, 216], [304, 236], [300, 253], [290, 268], [276, 279],
      [256, 287], [233, 291.5], [214, 293.5], [200, 294]],
    tuft: [[186, 118], [196, 113], [205, 110, 1], [202, 116]],
  },
  /* deer: rounded head, one small cheek fluff */
  deer: {
    right: [[212, 118.5], [228, 121], [247, 129], [264, 141], [277, 155], [287, 171], [293, 189], [296, 207], [297, 222], [303, 232], [313, 239, 1], [301, 245],
      [296, 255], [288, 267], [274, 277], [255, 284], [235, 289], [216, 291.5], [200, 292]],
    tuft: [[184, 121], [194, 116], [204, 111, 1], [203, 118]],
  },
};
/* ---------- fitting things to each species' head (hats, hair) ---------- */
const headKindOf = st => TOON_HEADS[st.species] ? st.species : 'fox';
/* x of the right side of the cranium at height y */
function craniumX(kind, y) {
  const R = TOON_HEADS[kind].right;
  if (y <= R[0][1]) return R[0][0];
  for (let i = 0; i < R.length - 1; i++) {
    const a = R[i], b = R[i + 1];
    if (a[1] <= y && b[1] >= y && b[1] > a[1]) return a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]);
  }
  return R[R.length - 1][0];
}
/* cranium outline from the left side at y0, over the top, down to the right side at y0, pushed outwards by
   t (a number, or t(k) with k = 0 at y0 and 1 at the crown, so a hat can be fuller on top) */
function craniumArc(kind, y0, t) {
  const R = TOON_HEADS[kind].right, top = R[0][1] - .8;
  const right = [];
  for (const p of R) { if (p[1] >= y0) break; right.push({ x: p[0], y: p[1] }); }
  right.push({ x: craniumX(kind, y0), y: y0 });
  const P = [...right.map(p => ({ x: 400 - p.x, y: p.y })).reverse(), { x: 200, y: top }, ...right];
  const N = normals(P);
  return P.map((p, i) => {
    let nx = N[i].x, ny = N[i].y;
    if (nx * (p.x - 200) + ny * (p.y - y0 - 30) < 0) { nx = -nx; ny = -ny; }
    const k = clamp((y0 - p.y) / (y0 - top), 0, 1), d = typeof t === 'function' ? t(k) : t;
    return [r1(p.x + nx * d), r1(p.y + ny * d)];
  });
}
/* the skull without its cheek fluff: below the temples the head side is held at the temple width, then follows the jaw */
function skullX(kind, y) {
  const top = craniumX(kind, Math.min(y, 200));
  return y <= 200 ? top : Math.min(craniumX(kind, y), top + 4);
}

function toonHeadPts(kind, tuft) {
  const H = TOON_HEADS[kind] || TOON_HEADS.fox;
  const R = H.right;
  const left = mirList(R.slice(1, -1)).reverse();
  return [...(tuft || H.tuft), ...R, ...left];
}
const TOON_CACHE = {};
function toonHeadPath(kind, tuftId, tuft) {
  const k = kind + ':' + (tuftId || '');
  return TOON_CACHE[k] || (TOON_CACHE[k] = smooth(toonHeadPts(kind, tuft)));
}

/* face markings, drawn inside the head silhouette */
const foxMask = [[200, 251], [207.6, 246.4], [211.4, 241], [217, 236.6], [223.4, 234.2], [238, 230], [262, 233], [266.6, 242.4], [274.4, 240.2], [282, 232, 1],
  [287.6, 237.2], [298.6, 226.2], [303, 222.4], [340, 214], [340, 330], [200, 330]];
/* cat / bunny muzzle: a small bump under the nose and the two wide whisker pads below it, where the mouth sits */
const muzzlePuffs = (F, k = 1) => ell(200, 252, 15 * k, 11 * k, { fill: F.sub })
  + ell(200 - 13 * k, 267, 16 * k, 12.5 * k, { fill: F.sub }) + ell(200 + 13 * k, 267, 16 * k, 12.5 * k, { fill: F.sub });
const TOON_FACE = {
  fox: (ctx, st, F) => path(S(foxMask), { fill: F.sub }),
  wolf: (ctx, st, F) => path(S([[200, 252], [208, 246], [213, 239], [220, 235], [240, 232], [263, 235], [270, 243], [279, 240], [287, 233, 1], [293, 238], [303, 228], [340, 218],
    [340, 330], [200, 330]]), { fill: F.sub })
    + path(S([[200, 112], [214, 113], [222, 132], [214, 160], [206, 186], [200, 192]]), { fill: mix(F.main, F.acc, .45) }),
  tiger: (ctx, st, F) => {
    let m = path(S([[200, 250], [209, 244], [217, 237], [236, 233], [262, 236], [276, 246], [292, 236, 1], [304, 226], [340, 218], [340, 330], [200, 330]]), { fill: F.sub });
    const a = F.acc;
    m += path('M200,116L208,120L205,146L200,154L195,146L192,120Z', { fill: a });
    for (const s of [-1, 1]) {
      const X = x => CX + s * (x - CX);
      m += path(`M${X(180)},122L${X(191)},127L${X(184)},146Z`, { fill: a }) + path(`M${X(162)},131L${X(178)},140L${X(165)},150Z`, { fill: a });
      m += path(`M${X(306)},180L${X(276)},190L${X(304)},197Z`, { fill: a }) + path(`M${X(310)},202L${X(282)},208L${X(310)},214Z`, { fill: a });
      m += path(`M${X(330)},244L${X(296)},252L${X(326)},258Z`, { fill: a }) + path(`M${X(322)},264L${X(290)},266L${X(312)},274Z`, { fill: a });
    }
    return m;
  },
  cat: (ctx, st, F) => {
    const pal = st.fur, a = F.acc;
    let m = '';
    if (pal.points) m += ell(200, 252, 46, 36, { fill: a, opacity: .9 });
    m += muzzlePuffs(F, pal.points ? .85 : 1);
    if (pal.stripes) {
      m += path('M200,118L205,121L203,146L200,152L197,146L195,121Z', { fill: a, opacity: .9 });
      for (const s of [-1, 1]) {
        const X = x => CX + s * (x - CX);
        m += path(`M${X(184)},122L${X(191)},125L${X(189)},144L${X(185)},147Z`, { fill: a, opacity: .9 });
        m += path(`M${X(302)},196L${X(278)},202L${X(302)},208Z`, { fill: a, opacity: .9 }) + path(`M${X(314)},232L${X(292)},238L${X(314)},244Z`, { fill: a, opacity: .9 });
      }
    }
    return m;
  },
  bunny: (ctx, st, F) => muzzlePuffs(F, .92),
  bear: (ctx, st, F) => {
    const pal = st.fur;
    let m = '';
    if (pal.panda) for (const s of [-1, 1]) m += ell(CX + s * 47, 226, 31, 37, { fill: F.acc, transform: `rotate(${s * -24} ${CX + s * 47} 226)` });
    return m + ell(200, 262, 39, 29, { fill: F.sub });
  },
  deer: (ctx, st, F) => {
    const pal = st.fur;
    let m = ell(200, 263, 33, 27, { fill: F.sub });
    if (pal.spots) for (const [x, y, r] of [[160, 160, 4.4], [174, 146, 3.6], [146, 176, 3.4], [240, 160, 4.4], [226, 146, 3.6], [254, 176, 3.4]]) m += circ(x, y, r, { fill: lighten(F.sub, .3) });
    return m;
  },
};

function drawToonHead(ctx, st, F) {
  const sp = SPECIES[st.species];
  const kind = TOON_HEADS[st.species] ? st.species : 'fox';
  const tuft = toonTuft(st, kind);
  const d = toonHeadPath(kind, tuft.id, tuft.pts);
  const sid = ctx.shape(d);
  let m = TOON_FACE[kind] ? TOON_FACE[kind](ctx, st, F) : '';
  // hard shadow along the jaw
  m += path(S([[200, 276], [228, 274], [258, 270], [282, 260], [300, 254], [340, 262], [340, 330], [200, 330]]), shadowFill(.08));
  let s = g(use(sid, { fill: F.main }) + m, { 'clip-path': ctx.clipUse(sid) });
  s += use(sid, { fill: 'none', stroke: F.line, 'stroke-width': 2.7, 'stroke-linejoin': 'round' });
  // little fur flicks on spiky cheeks; whiskers
  if (['fox', 'wolf', 'tiger'].includes(kind)) s += ln('M276,248l14,3M124,248l-14,3', F.line, 1.6, { opacity: .5 });
  if (sp.whiskers) {
    const wc = isLight(F.sub) ? F.line : lighten(F.sub, .4);
    let w = '';
    for (const s2 of [-1, 1]) {
      const X = x => CX + s2 * (x - CX);
      w += `M${X(230)},257L${X(266)},250M${X(231)},263L${X(269)},264M${X(229)},269L${X(263)},278`;
    }
    s += ln(w, wc, 1.3, { opacity: .55 });
  }
  return s + (tuft.over ? tuft.over(ctx, st, F, sid) : '');
}
/* tuft on top of the head: the species default, or a fur-tuft style the player picked (see hair.js) */
function toonTuft(st, kind) {
  const hat = st.wear && st.wear.hat && ITEM_INDEX.hat[st.wear.hat.id];
  if (hat && hat.covers) return { id: '_hat', pts: [], over: null };   // no top tuft under a hat
  if (st.hair && HAIR_STYLES[st.hair.id]) return { id: '_hat', pts: [], over: null };   // the hairstyle covers the top of the head
  return { id: '', pts: null, over: null };
}

/* ---------- ears (drawn in head coordinates; left ear = mirror) ---------- */
const circlePts = (cx, cy, r, n = 16, a0 = 0) => Array.from({ length: n }, (_, i) => { const a = a0 + i / n * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
const TOON_EARS = {
  fox: {
    outline: [[281.6, 55.6], [285.9, 53.6, 1], [290.6, 56.4], [296.5, 65.1], [300.8, 76.6], [304.6, 88.2], [308, 99.7], [310.4, 111.2], [312.3, 122.7], [313.8, 134.2],
      [314.7, 145.8], [314.4, 157], [313.2, 167], [310.6, 178], [306, 194], [292, 206], [262, 196], [238, 160], [230.2, 117], [233.1, 111.2], [236.5, 105.4],
      [240.3, 99.7], [244.2, 94], [248.5, 88.2], [253.3, 82.4], [258.1, 76.6], [264.3, 70.9], [271, 65.1], [276.6, 59.6]],
    cap: [[214, 92], [242.8, 97], [264.6, 105.4], [280, 112], [296, 128], [303, 136], [312, 140], [340, 146], [340, 0], [214, 0]],
    inner: [[287.4, 75.4, 1], [291.6, 88], [295.8, 105.4], [299, 122], [300.6, 141.4], [300.5, 160], [299.4, 175], [296, 195], [270, 200], [252.3, 140], [254.2, 134.2],
      [257.6, 122.7], [262.4, 111.2], [268.2, 99.7], [275.4, 88.2], [284, 76.6]],
    fold: [[285.6, 76], [279.7, 82.4], [275.4, 88.2], [271.5, 94], [268.2, 99.7], [265.3, 105.4], [262.4, 111.2], [260, 117], [257.6, 122.7], [255.7, 128.5], [254.2, 134.2], [252.3, 140]],
    fluff: [[288.4, 100], [276.6, 109, 1], [280.2, 117.4, 1], [274.2, 125.8, 1], [283.8, 134.3, 1], [279.4, 146.2, 1], [289.8, 153.4, 1], [286.4, 165.4, 1], [294.6, 172.6]],
    pivot: [266, 160], scale: 1.06,
  },
  wolf: {
    outline: [[268, 60], [272.5, 57, 1], [277, 61], [287, 80], [296, 103], [303, 128], [307, 152], [305, 175], [292, 192], [264, 183], [244, 152], [240, 126], [247, 103], [257, 81]],
    cap: [[226, 90], [256, 94], [274, 102], [287, 113], [299, 132], [311, 142], [340, 148], [340, 0], [226, 0]],
    inner: [[272, 76, 1], [280, 96], [287, 119], [292, 143], [293, 166], [286, 184], [268, 182], [255, 151], [255, 124], [262, 99]],
    fold: [[271, 78], [264, 96], [258, 117], [255, 140]],
    fluff: [[284, 112], [274, 122, 1], [279, 131, 1], [272, 141, 1], [282, 150, 1], [277, 162, 1], [287, 170]],
    pivot: [270, 160], scale: 1.04,
  },
  tiger: {
    outline: [[248, 150], [252, 124], [261, 105], [276, 94], [293, 93], [306, 102], [313, 119], [312, 141], [303, 162], [282, 172], [260, 166]],
    cap: [[236, 128], [256, 100], [278, 86], [300, 88], [318, 104], [326, 132], [340, 140], [340, 0], [236, 0]],
    inner: [[262, 150], [266, 128], [275, 113], [288, 108], [299, 115], [302, 130], [299, 148], [287, 160], [271, 158]],
    fluff: [[296, 124], [286, 132, 1], [292, 139, 1], [282, 146, 1], [291, 153]],
    pivot: [276, 150], scale: 1,
  },
  cat: {
    outline: [[236, 152], [242, 125], [252, 101], [264, 81], [273, 66, 1], [282, 82], [291, 105], [298, 131], [302, 158], [295, 178], [268, 170], [247, 162]],
    inner: [[250, 150], [256, 125], [264, 105], [272, 88, 1], [279, 106], [286, 130], [290, 156], [281, 168], [261, 162]],
    fluff: [[256, 150], [266, 140, 1], [261, 131, 1], [271, 124, 1], [267, 115]],
    pivot: [268, 160], scale: 1,
  },
  bunny: {
    outline: [[222, 152], [219, 112], [220, 74], [226, 42], [236, 20], [249, 12], [261, 20], [268, 42], [271, 75], [269, 112], [263, 148], [246, 162]],
    inner: [[233, 148], [231, 112], [232, 78], [237, 49], [244, 31], [251, 29], [256, 46], [258, 78], [257, 112], [252, 146]],
    pivot: [244, 150], scale: 1,
  },
  bear: {
    outline: circlePts(278, 126, 27, 18), inner: circlePts(280, 130, 15.5, 14),
    pivot: [278, 140], scale: 1, round: true,
  },
  deer: {
    outline: [[286, 182], [299, 169], [317, 162], [335, 163], [350, 171, 1], [335, 187], [316, 196], [298, 198]],
    inner: [[297, 182], [311, 174], [327, 171], [341, 174, 1], [328, 183], [313, 189], [299, 189]],
    pivot: [296, 186], scale: 1,
  },
};
function drawToonEars(ctx, st, F) {
  const sp = SPECIES[st.species], pal = st.fur;
  const key = TOON_EARS[st.species] ? st.species : 'fox';
  const E = TOON_EARS[key];
  const sid = ctx.shape(smooth(E.outline));
  const lc = F.line;
  const earCol = pal.panda || pal.points ? F.acc : F.main;
  const innerCol = pal.panda ? lighten(F.acc, .14) : F.inner;
  let inner = E.cap ? path(poly(E.cap) + 'Z', { fill: F.acc }) : '';
  inner += path(smooth(E.inner), { fill: innerCol });
  if (E.fluff) inner += ln(smooth(E.fluff, false), isLight(innerCol) ? mix(innerCol, INK, .42) : lighten(innerCol, .35), 1.5, { opacity: .8 });
  if (E.fold) inner += ln(smooth(E.fold, false), lc, 2);
  const [px, py] = E.pivot, k = E.scale || 1;
  const one = g(use(sid, { fill: earCol }) + g(inner, { 'clip-path': ctx.clipUse(sid) }) + use(sid, { fill: 'none', stroke: lineOf(earCol), 'stroke-width': 2.7, 'stroke-linejoin': 'round' }),
    { transform: `translate(${px},${py}) scale(${k}) translate(${-px},${-py})` });
  let s = g(one, { class: 'ear earR', style: `transform-origin:${px}px ${py}px` })
    + g(g(one, { transform: `translate(${2 * CX},0) scale(-1,1)` }), { class: 'ear earL', style: `transform-origin:${mirX(px)}px ${py}px` });
  if (sp.antlers) s = toonAntlers(F) + s;
  return s;
}
/* small branched antlers that sit behind the head */
function toonAntlers(F) {
  const c = F.antler, lc = lineOf(c);
  const one = s2 => {
    const X = x => CX + s2 * (x - CX);
    const d = `M${X(230)},132C${X(234)},106 ${X(242)},86 ${X(250)},62M${X(240)},96C${X(252)},94 ${X(262)},86 ${X(270)},74M${X(246)},76C${X(240)},68 ${X(236)},60 ${X(233)},50`;
    return ln(d, lc, 11.5) + ln(d, c, 7) + ln(`M${X(233)},120C${X(237)},104 ${X(242)},90 ${X(247)},74`, lighten(c, .5), 1.6, { opacity: .8 });
  };
  return one(-1) + one(1);
}

/* ---------- plush tail with a layered cream tip (silhouette traced from the reference) ---------- */
const TOON_TAILS = {
  /* traced from the outfit reference (ref3): teardrop leaning right, tip up at elbow height */
  fox: {
    shape: [[-64.5, -73.2, 1], [-77.6, -60.1], [-92, -49], [-101.3, -41.7], [-106.6, -39.4, 1], [-108.2, -34.6, 1], [-116, -27], [-122.4, -15.3], [-127.7, 8.5], [-126.4, 32.2],
      [-117.1, 55.9], [-101.3, 74.2], [-88.6, 83, 1], [-84.2, 81.4, 1], [-72, 89.4], [-59.2, 92.7], [-32.9, 90], [-14.4, 84.8], [9, 58], [14, 8], [-6, -22],
      [-44, -26], [-51.3, -31.2], [-56.6, -39.1], [-60.4, -50], [-62.4, -62]],
    cream: [[-150, 30, 1], [-130.3, 26.8, 1], [-104.5, 12.6, 1], [-98.7, 40, 1], [-77.1, -5.2, 1], [-69.2, 21.6, 1], [-51.3, -10, 1], [-30, -14, 1], [-20, -120], [-150, -120]],
    tufts: [],
    shade: [[-150, 74], [-90.8, 69, 1], [-69.7, 53.2, 1], [-59.2, 69, 1], [-38.1, 48, 1], [-27.6, 59, 1], [20, 50], [20, 140], [-150, 140]],
  },
  /* wolf: bushy brush held low, curling out at the dark tip */
  wolf: {
    shape: [[12, -14], [-14, -18], [-40, -10], [-64, 8], [-82, 30], [-88, 38, 1], [-86, 44, 1], [-97, 62], [-104, 88], [-103, 104, 1], [-99, 110, 1], [-100, 128],
      [-95, 146], [-86, 163], [-76, 178, 1], [-70, 160], [-60, 138], [-56, 132, 1], [-50, 128, 1], [-42, 106], [-28, 80], [-12, 54], [2, 32], [16, 12]],
    tip: [[-140, 118, 1], [-104, 114, 1], [-97, 136, 1], [-86, 112, 1], [-77, 134, 1], [-67, 114, 1], [-58, 136, 1], [-30, 128, 1], [-30, 220], [-140, 220]],
    shade: [[0, 40], [-14, 62, 1], [-30, 80], [-30, 94, 1], [-44, 108], [-52, 124, 1], [-20, 140], [40, 140], [40, 20]],
  },
};
function drawToonTail(ctx, st, F, A) {
  const sp = SPECIES[st.species];
  const T = TOON_TAILS[sp.tail] || TOON_TAILS.fox;
  const sid = ctx.shape(smooth(T.shape));
  let m = path(poly(T.shade) + 'Z', shadowFill(.15));
  if (T.cream) m += path(poly(T.cream) + 'Z', { fill: F.sub });
  if (T.tip) m += path(poly(T.tip) + 'Z', { fill: mix(F.main, F.acc, .65) });
  for (const t of T.tufts || []) m += path(smooth(t), { fill: F.sub });
  let s = g(use(sid, { fill: F.main }) + m, { 'clip-path': ctx.clipUse(sid) });
  s += use(sid, { fill: 'none', stroke: F.line, 'stroke-width': 2.7, 'stroke-linejoin': 'round' });
  return g(g(s, { transform: `translate(${A.x},${A.y})` }), { class: 'tail', style: `transform-origin:${A.x}px ${A.y}px` });
}

/* ---------- long thin tails (cat, tiger): S-curve rising beside the body, rings drawn as chevron bands ---------- */
function drawToonLongTail(ctx, st, F, A) {
  const sp = SPECIES[st.species], pal = st.fur;
  const tiger = sp.tail === 'tiger';
  const w = tiger ? 11.5 : 10;
  const spn = sampleBezier({ x: 2, y: 4 }, { x: -78, y: 44 }, { x: -132, y: -12 }, { x: -112, y: -104 }, 40);
  const wf = t => t < .1 ? lerp(w * .8, w, t / .1) : t > .86 ? w * Math.sqrt(Math.max(0, 1 - Math.pow((t - .86) / .14, 2))) * .9 + w * .1 : w;
  const d = tube(spn, wf, 'round', 'round');
  const sid = ctx.shape(d);
  const N = normals(spn), n = spn.length - 1;
  // band across the tail from t0 to t1, its edges bent into a shallow chevron pointing at the root
  const band = (t0, t1) => {
    const i0 = Math.round(t0 * n), i1 = Math.min(n, Math.round(t1 * n));
    const edge = (i, k) => { const W = w + 6; return [[spn[i].x + N[i].x * W, spn[i].y + N[i].y * W], [spn[i].x - N[i].tx * k, spn[i].y - N[i].ty * k], [spn[i].x - N[i].x * W, spn[i].y - N[i].y * W]]; };
    const a = edge(i0, 4), b = i1 >= n ? [[spn[n].x + N[n].x * 30 + N[n].tx * 30, spn[n].y + N[n].y * 30 + N[n].ty * 30], [spn[n].x - N[n].x * 30 + N[n].tx * 30, spn[n].y - N[n].y * 30 + N[n].ty * 30]] : edge(i1, 4).reverse();
    return poly([...a, ...b]) + 'Z';
  };
  let m = '';
  // hard shadow on the inner side
  const sh = [];
  for (let i = 0; i <= n; i++) sh.push([spn[i].x - N[i].x * w * .35, spn[i].y - N[i].y * w * .35]);
  for (let i = n; i >= 0; i--) sh.push([spn[i].x - N[i].x * (w + 8), spn[i].y - N[i].y * (w + 8)]);
  m += path(poly(sh) + 'Z', shadowFill(.13));
  if (tiger) { for (const t of [.2, .34, .48, .62, .74]) m += path(band(t, t + .055), { fill: F.acc }); m += path(band(.86, 1), { fill: F.acc }); }
  else if (pal.points) m += path(band(.5, 1), { fill: F.acc });
  else if (pal.stripes) for (const t of [.3, .48, .66, .84]) m += path(band(t, t + .07), { fill: F.acc, opacity: .9 });
  let s = g(use(sid, { fill: F.main }) + m, { 'clip-path': ctx.clipUse(sid) }) + use(sid, { fill: 'none', stroke: F.line, 'stroke-width': 2.7, 'stroke-linejoin': 'round' });
  return g(g(s, { transform: `translate(${A.x},${A.y})` }), { class: 'tail', style: `transform-origin:${A.x}px ${A.y}px` });
}

/* ---------- fur gloves / socks with a zigzag edge ---------- */
function armUpperD(arm, K, a, wf) {
  const T = armTube(arm, K, 0, a, t => wf(t) + 4, 'round', 'flat');
  const sp = T.sp, N = normals(sp), n = sp.length;
  const left = [], right = [];
  for (let i = 0; i < n; i++) { const w = T.width(i / (n - 1)); left.push([sp[i].x + N[i].x * w, sp[i].y + N[i].y * w]); right.push([sp[i].x - N[i].x * w, sp[i].y - N[i].y * w]); }
  // fur teeth pointing down the arm: 3 full teeth spanning exactly the arm, plus overshoot past the outline
  const e = sp[n - 1], Ne = N[n - 1], we = T.width(1), wa = wf(a / arm.len), teeth = 4, depth = 7, zig = [];
  zig.push([e.x + Ne.x * we, e.y + Ne.y * we]);
  for (let k = 0; k <= teeth * 2; k++) {
    const off = lerp(wa, -wa, k / (teeth * 2)), fwd = k % 2 ? depth : 0;
    zig.push([e.x + Ne.x * off + Ne.tx * fwd, e.y + Ne.y * off + Ne.ty * fwd]);
  }
  zig.push([e.x - Ne.x * we, e.y - Ne.y * we]);
  const w0 = T.width(0), n0 = N[0], cap = [];
  for (let k = 1; k < 6; k++) { const q = Math.PI * k / 6; cap.push([sp[0].x - n0.x * w0 * Math.cos(q) - n0.tx * w0 * Math.sin(q), sp[0].y - n0.y * w0 * Math.cos(q) - n0.ty * w0 * Math.sin(q)]); }
  return poly([...left, ...zig, ...right.reverse(), ...cap]) + 'Z';
}
function sockD(K, s, y0) {
  const X = dx => CX + s * dx;
  const e = legEdgeAt(K, y0, 2);
  const pts = [];
  const teeth = 3, depth = 9;
  for (let k = 0; k <= teeth * 2; k++) {
    const f = k / (teeth * 2);
    pts.push([X(lerp(e.i - 2, e.o, f)), y0 - (k % 2 ? depth : 0)]);
  }
  return poly([...pts, [X(e.o + 30), y0], [X(e.o + 30), 760], [X(e.i - 30), 760], [X(e.i - 30), y0]]) + 'Z';
}
