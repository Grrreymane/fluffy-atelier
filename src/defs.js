/* ===== defs.js — render context, paint helper, fabric patterns ===== */
function makeCtx(id) {
  const defs = new Map();
  let uid = 0;
  const ctx = {
    id,
    def(key, markup) { if (!defs.has(key)) defs.set(key, markup.replace(/__ID__/g, `${id}-${key}`)); return `${id}-${key}`; },
    url(key) { return `url(#${id}-${key})`; },
    next(p = 'u') { return `${id}-${p}${++uid}`; },
    defsMarkup() { return [...defs.values()].join(''); },
    /* register a path in defs and return its id, so it can be reused by <use> */
    shape(d) { const k = ctx.next('s'); defs.set(k, `<path id="${k}" d="${d}"/>`); return k; },
    clip(d) { const k = ctx.next('c'); defs.set(k, `<clipPath id="${k}"><path d="${d}"/></clipPath>`); return `url(#${k})`; },
    /* union of several paths as one clip region */
    clipAll(ds) { const k = ctx.next('c'); defs.set(k, `<clipPath id="${k}">${ds.map(d => `<path d="${d}"/>`).join('')}</clipPath>`); return `url(#${k})`; },
    clipUse(shapeId) { const k = ctx.next('c'); defs.set(k, `<clipPath id="${k}"><use href="#${shapeId}"/></clipPath>`); return `url(#${k})`; },
    shade(kind = 'lr') {
      const G = {
        lr: `<linearGradient id="__ID__" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${SHADOW_TINT}" stop-opacity="0"/><stop offset=".78" stop-color="${SHADOW_TINT}" stop-opacity="0"/><stop offset=".78" stop-color="${SHADOW_TINT}" stop-opacity="${shadowAt(.12)}"/><stop offset="1" stop-color="${SHADOW_TINT}" stop-opacity="${shadowAt(.12)}"/></linearGradient>`,
        tb: `<linearGradient id="__ID__" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${SHADOW_TINT}" stop-opacity="0"/><stop offset=".74" stop-color="${SHADOW_TINT}" stop-opacity="0"/><stop offset=".74" stop-color="${SHADOW_TINT}" stop-opacity="${shadowAt(.14)}"/><stop offset="1" stop-color="${SHADOW_TINT}" stop-opacity="${shadowAt(.14)}"/></linearGradient>`,
        rad: `<radialGradient id="__ID__" cx=".4" cy=".34" r=".78"><stop offset="0" stop-color="${SHADOW_TINT}" stop-opacity="0"/><stop offset=".86" stop-color="${SHADOW_TINT}" stop-opacity="0"/><stop offset=".86" stop-color="${SHADOW_TINT}" stop-opacity="${shadowAt(.12)}"/><stop offset="1" stop-color="${SHADOW_TINT}" stop-opacity="${shadowAt(.12)}"/></radialGradient>`,
        skirt: `<linearGradient id="__ID__" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${SHADOW_TINT}" stop-opacity="0"/><stop offset=".72" stop-color="${SHADOW_TINT}" stop-opacity="0"/><stop offset=".72" stop-color="${SHADOW_TINT}" stop-opacity="${shadowAt(.15)}"/><stop offset="1" stop-color="${SHADOW_TINT}" stop-opacity="${shadowAt(.15)}"/></linearGradient>`,
        gloss: `<linearGradient id="__ID__" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>`,
      };
      ctx.def('g-' + kind, G[kind]);
      return ctx.url('g-' + kind);
    },
    pattern(type, col, base) {
      if (!type || type === 'none') return null;
      const key = `p-${type}-${col.replace('#', '')}-${(base || '').replace('#', '')}`;
      ctx.def(key, patternMarkup(type, col, base));
      return ctx.url(key);
    },
  };
  return ctx;
}
const use = (sid, o = {}) => `<use href="#${sid}" ${attrs(o)}/>`;

/* paint a garment shape: fill + optional pattern + shading + outline */
/* set by renderCharacter while a sleeved garment draws itself (see armholeMasks) */
let PAINT_MASK = null;
function paint(ctx, d, fill, o = {}) {
  const sid = ctx.shape(d);
  const lc = o.line || lineOf(fill);
  const sw = o.sw ?? 2.8;
  let s = use(sid, { fill });
  if (o.pat) s += use(sid, { fill: o.pat });
  if (o.extra) s = g(s + o.extra, { 'clip-path': ctx.clipUse(sid) });
  if (o.shade !== false) {
    const k = o.shade || 'lr';
    s += k === 'lr' || k === 'skirt' ? rimShade(ctx, d) : use(sid, { fill: ctx.shade(k), style: MULTIPLY });
  }
  if (PAINT_MASK && !o.noMask) {
    s += use(sid, { fill: 'none', stroke: lc, 'stroke-width': sw, 'stroke-linejoin': 'round', mask: PAINT_MASK.hide });
    if (PAINT_MASK.seam) s += use(sid, { fill: 'none', stroke: lc, 'stroke-width': 1.5, 'stroke-linejoin': 'round', opacity: .7, mask: PAINT_MASK.seam });
  } else s += use(sid, { fill: 'none', stroke: lc, 'stroke-width': sw, 'stroke-linejoin': 'round' });
  return s;
}
/* fill only + outline (no shading) */
const flat = (d, fill, line, sw = 2.6, o = {}) => path(d, { fill, stroke: line || lineOf(fill), 'stroke-width': sw, 'stroke-linejoin': 'round', ...o });

/* ---------- fabric patterns ---------- */
const PATTERNS = [
  { id: 'none', name: '纯色' },
  { id: 'stripe', name: '海魂条' },
  { id: 'pin', name: '细条纹' },
  { id: 'dot', name: '波点' },
  { id: 'gingham', name: '格子' },
  { id: 'plaid', name: '格纹' },
  { id: 'tartan', name: '大格纹' },
  { id: 'houndstooth', name: '千鸟格' },
  { id: 'argyle', name: '菱格' },
  { id: 'herring', name: '人字纹' },
  { id: 'repp', name: '斜条' },
  { id: 'heart', name: '爱心' },
  { id: 'star', name: '星星' },
  { id: 'flower', name: '小花' },
  { id: 'cord', name: '灯芯绒' },
];
function patternMarkup(type, c, base) {
  const P = (w, h, inner, extra = '') => `<pattern id="__ID__" width="${w}" height="${h}" patternUnits="userSpaceOnUse" ${extra}>${inner}</pattern>`;
  const heart = (x, y, s) => `<path d="M${x},${y + s * .9}C${x - s * 1.6},${y - s * .2} ${x - s * .7},${y - s * 1.3} ${x},${y - s * .35}C${x + s * .7},${y - s * 1.3} ${x + s * 1.6},${y - s * .2} ${x},${y + s * .9}Z" fill="${c}"/>`;
  const star = (x, y, r) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; d += (i ? 'L' : 'M') + r1(x + Math.cos(a) * rr) + ',' + r1(y + Math.sin(a) * rr); } return `<path d="${d}Z" fill="${c}"/>`; };
  switch (type) {
    case 'stripe': return P(14, 14, `<rect width="14" height="5.5" fill="${c}"/>`);
    case 'pin': return P(9, 9, `<rect width="2" height="9" fill="${c}"/>`);
    case 'dot': return P(16, 16, `<circle cx="4" cy="4" r="2.7" fill="${c}"/><circle cx="12" cy="12" r="2.7" fill="${c}"/>`);
    case 'gingham': return P(14, 14, `<rect width="7" height="14" fill="${c}" opacity=".42"/><rect width="14" height="7" fill="${c}" opacity=".42"/>`);
    case 'plaid': return P(28, 28, `<rect width="10" height="28" fill="${c}" opacity=".38"/><rect width="28" height="10" fill="${c}" opacity=".38"/><rect x="16" width="2" height="28" fill="${c}" opacity=".75"/><rect y="16" width="28" height="2" fill="${c}" opacity=".75"/><rect x="22" width="1" height="28" fill="${base ? lighten(base, .6) : '#fff'}" opacity=".5"/><rect y="22" width="28" height="1" fill="${base ? lighten(base, .6) : '#fff'}" opacity=".5"/>`);
    case 'tartan': return P(50, 50, `<rect width="22" height="50" fill="${c}" opacity=".78"/><rect width="50" height="22" fill="${c}" opacity=".6"/><rect x="35" width="2.2" height="50" fill="#170c14" opacity=".45"/><rect y="35" width="50" height="2.2" fill="#170c14" opacity=".45"/><rect x="10.5" width="1.3" height="50" fill="${base ? lighten(base, .5) : '#fff'}" opacity=".4"/><rect y="10.5" width="50" height="1.3" fill="${base ? lighten(base, .5) : '#fff'}" opacity=".4"/>`);
    case 'houndstooth': return P(12, 12, `<path d="M0,0H6V6H0ZM6,0H9L12,3V6ZM0,6H3L6,9V12Z" fill="${c}"/>`);
    case 'argyle': return P(22, 30, `<path d="M11,0L22,15L11,30L0,15Z" fill="${c}" opacity=".55"/><path d="M0,0L22,30M22,0L0,30" stroke="${base ? lighten(base, .55) : '#fff'}" stroke-width="1" stroke-dasharray="2.5 2" opacity=".8"/>`);
    case 'herring': return P(12, 12, `<path d="M0,3L6,-3M0,9L6,3M0,15L6,9M6,-3L12,3M6,3L12,9M6,9L12,15" stroke="${c}" stroke-width="1.7" opacity=".7"/>`);
    case 'repp': return P(16, 16, `<rect width="16" height="5" fill="${c}"/><rect y="7.5" width="16" height="1.6" fill="${c}" opacity=".7"/>`, 'patternTransform="rotate(-38)"');
    case 'heart': return P(20, 20, heart(5, 5, 3.2) + heart(15, 15, 3.2));
    case 'star': return P(22, 22, star(5.5, 5.5, 4) + star(16.5, 16.5, 4));
    case 'flower': {
      const f = (x, y) => { let s = ''; for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5 - Math.PI / 2; s += `<circle cx="${r1(x + Math.cos(a) * 2.6)}" cy="${r1(y + Math.sin(a) * 2.6)}" r="2.1" fill="${c}"/>`; } return s + `<circle cx="${x}" cy="${y}" r="1.5" fill="#fff6c9"/>`; };
      return P(22, 22, f(5.5, 5.5) + f(16.5, 16.5));
    }
    case 'cord': return P(7, 7, `<rect width="2.6" height="7" fill="${c}" opacity=".45"/>`);
  }
  return P(10, 10, '');
}

/* ---------- shadows ----------
   Shadows are painted the way illustrators paint them: one light lilac multiplied over whatever is underneath
   (正片叠底 / Multiply). That darkens a colour but keeps its hue and saturation; a dark colour laid over it with
   normal blending greys it and looks dirty. depth is on the scale the art was tuned with (.07 a faint crease, .22
   a deep shadow) and SHADOW_GAIN turns it into the lilac's opacity: from about .14 up a shadow is the full lilac.
   A multiplied shape only darkens what was drawn before it in the same group, and a group that is clipped, masked
   or faded is drawn on its own first: inside such a group, the fill a shadow falls on must be in the group too. */
const SHADOW_TINT = '#d9c8e0', SHADOW_GAIN = 7.3, MULTIPLY = 'mix-blend-mode:multiply';
const shadowAt = depth => +Math.min(1, depth * SHADOW_GAIN).toFixed(3);
const shadowFill = (depth, o = {}) => Object.assign({ fill: SHADOW_TINT, opacity: shadowAt(depth), style: MULTIPLY }, o);

/* side shadow that follows a piece's own outline (light from the upper left): the shape minus itself nudged
   up-left leaves a strip along its right and lower edges; narrow pieces get a narrower strip */
function rimShade(ctx, d, depth = .15, o = {}) {
  const xs = (d.match(/-?\d+(\.\d+)?/g) || []).map(Number).filter((v, i) => i % 2 === 0);
  const w = xs.length ? Math.max(...xs) - Math.min(...xs) : 40;
  const dx = clamp(w * .16, 2, o.dx ?? 9), dy = o.dy ?? r1(Math.min(3, dx * .3));
  // an absolute path is shifted by hand: the shape and its shifted copy filled even-odd, clipped to the shape, is the
  // strip (a clip is much cheaper to draw than a mask); a path with relative commands falls back to a mask
  if (!/[a-df-z]/.test(d.replace(/e-?\d/g, ''))) {
    let i = 0;
    const moved = d.replace(/-?\d+(\.\d+)?/g, v => r1(+v + (i++ % 2 ? -dy : -dx)));
    return path(d + moved, shadowFill(depth, { 'fill-rule': 'evenodd', 'clip-path': o.clip || ctx.clip(d) }));
  }
  return path(d, shadowFill(depth, Object.assign({ mask: shiftMask(ctx, d, -dx, -dy) }, o.clip ? { 'clip-path': o.clip } : {})));
}
/* the shadow a shape casts on whatever it lies on: the shape nudged down-right, multiplied in under it, kept inside
   clip (the fabric known to be underneath, so it never falls on the background) */
const dropShadow = (d, clip, depth = .14, dx = 1.6, dy = 2.6) =>
  g(path(d, { fill: SHADOW_TINT, opacity: shadowAt(depth), transform: `translate(${dx},${dy})` }), { 'clip-path': clip, style: MULTIPLY });
/* the same for a whole drawn part (any markup): its silhouette through a filter. Costlier: small parts only */
function castShadow(ctx, markup, clip, depth = .14, dx = 1.6, dy = 2.6) {
  const k = `cast-${dx}-${dy}-${shadowAt(depth)}`;
  ctx.def(k, `<filter id="__ID__" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB"><feOffset in="SourceAlpha" dx="${dx}" dy="${dy}" result="o"/><feFlood flood-color="${SHADOW_TINT}" flood-opacity="${shadowAt(depth)}"/><feComposite in2="o" operator="in"/></filter>`);
  return g(g(markup, { filter: ctx.url(k) }), { 'clip-path': clip, style: MULTIPLY });
}

/* cel light inside a shape: shadow where the shape nudged up-left no longer covers it (the lower-right rim),
   and a lighter tone where the shape nudged down-right no longer covers it (the upper-left rim) */
function shiftMask(ctx, d, dx, dy) {
  const k = ctx.next('hm');
  ctx.def(k, `<mask id="__ID__" maskUnits="userSpaceOnUse" x="-300" y="-300" width="1000" height="1000"><rect x="-300" y="-300" width="1000" height="1000" fill="#fff"/><path d="${d}" fill="#000" transform="translate(${dx},${dy})"/></mask>`);
  return ctx.url(k);
}
const celShade = (ctx, d, dx = 9, dy = 6, op = .16) => path(d, shadowFill(op, { mask: shiftMask(ctx, d, -dx, -dy) }));
const celLit = (ctx, d, dx = 8, dy = 8, op = .16) => path(d, { fill: '#fff', opacity: op, mask: shiftMask(ctx, d, dx, dy) });

