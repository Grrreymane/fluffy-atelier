// overview sheet for the user: 7 species dressed, all colourways, fur-tuft styles -> out/overview.html
const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
let n = 0;
const R = (st, vb, only) => C.renderCharacter(st, { id: 'o' + (++n), noAnim: true, viewBox: vb, only });
const mk = (sp, i, o = {}) => { const pal = C.SPECIES[sp].pals[i]; return Object.assign({ species: sp, fur: Object.assign({}, pal), body: 'girl', pose: 'stand', expr: 'smile', eyes: { style: 'sparkle', color: pal.eye }, hair: { id: 'none' }, wear: {} }, o); };
const HEAD = ['ears', 'head', 'face', 'brows'];
const looks = [
  ['fox', 'girl', { top: { id: 'tee' }, bottom: { id: 'denimshorts' }, shoes: { id: 'canvas' }, hat: { id: 'beret' }, glasses: { id: 'round' } }, 'stand', 'smile'],
  ['bunny', 'girl', { top: { id: 'blouse' }, bottom: { id: 'pleated' }, socks: { id: 'knee' }, shoes: { id: 'maryjane' } }, 'wave', 'grin'],
  ['cat', 'boy', { top: { id: 'ocbd' }, bottom: { id: 'chinos' }, outer: { id: 'blazer' }, neck: { id: 'tie' }, socks: { id: 'argyle' }, shoes: { id: 'loafer' } }, 'stand', 'smile'],
  ['wolf', 'boy', { top: { id: 'chambray' }, bottom: { id: 'jeans' }, shoes: { id: 'mocboot' }, hat: { id: 'beanie' } }, 'hips', 'fang'],
  ['bear', 'chub', { top: { id: 'flannel' }, bottom: { id: 'overalls' }, shoes: { id: 'mocboot' } }, 'stand', 'grin'],
  ['deer', 'girl', { dress: { id: 'pinafore' }, top: { id: 'blouse' }, socks: { id: 'knee' }, shoes: { id: 'maryjane' }, held: { id: 'books' } }, 'stand', 'shy'],
  ['tiger', 'boy', { top: { id: 'tee' }, bottom: { id: 'cargo' }, outer: { id: 'varsity' }, shoes: { id: 'canvas' } }, 'cheer', 'grin'],
];
const have = (slot, id) => !!C.ITEM_INDEX[slot][id];
const dressed = looks.map(([sp, body, wear, pose, expr]) => {
  for (const k of Object.keys(wear)) if (!have(k, wear[k].id)) delete wear[k];
  const st = mk(sp, 0, { body, wear, pose, expr, eyes: { style: body === 'boy' ? 'boy' : 'sparkle', color: C.SPECIES[sp].pals[0].eye } });
  return `<div class=fig>${R(st, '0 0 400 720')}<span>${C.SPECIES[sp].name}</span></div>`;
}).join('');
const heads = C.SPECIES_ORDER.map(sp => C.SPECIES[sp].pals.map((p, i) => `<div class=hd>${R(mk(sp, i, { expr: i % 2 ? 'grin' : 'smile' }), '50 -14 300 300', HEAD)}<span>${p.n}</span></div>`).join('')).join('');
const demo = [['fox', 0], ['cat', 0], ['wolf', 0], ['tiger', 0], ['bear', 1], ['bunny', 3], ['deer', 0], ['fox', 2]];
const tufts = C.HAIRS.map((h, i) => { const [sp, pi] = demo[i % demo.length]; return `<div class=hd>${R(mk(sp, pi, { hair: { id: h.id } }), '78 30 244 210', HEAD)}<span>${h.name}</span></div>`; }).join('');
const html = `<!doctype html><meta charset=utf-8><style>
body{margin:0;background:#f6f1ea;font-family:"Noto Sans CJK SC",sans-serif;color:#3b2120}
.w{width:1760px;padding:28px 32px}
h1{font-size:36px;margin:0 0 6px}.lead{margin:0 0 18px;color:#7a5a52;font-size:20px}
h2{font-size:22px;margin:22px 0 10px;color:#5a3a32}
.figs{display:grid;grid-template-columns:repeat(7,1fr);gap:10px}
.fig{background:#fff;border-radius:18px;text-align:center;padding-bottom:10px;font-size:20px}.fig svg{width:100%;height:auto;display:block}
.heads{display:grid;grid-template-columns:repeat(10,1fr);gap:8px}
.hd{background:#fff;border-radius:14px;text-align:center;font-size:15px;padding-bottom:6px}.hd svg{width:100%;height:auto;display:block}
.tufts{display:grid;grid-template-columns:repeat(8,1fr);gap:8px}
</style><div class=w><h1>7 种动物 · 统一成新画法</h1><p class=lead>小熊猫已删除；“发型”改成“头毛造型”，所有衣服、帽子、眼镜都能直接穿戴</p>
<h2>7 种动物</h2><div class=figs>${dressed}</div>
<h2>全部 40 种毛色</h2><div class=heads>${heads}</div>
<h2>头毛造型（8 种，可配任意动物）</h2><div class=tufts>${tufts}</div></div>`;
fs.writeFileSync(__dirname + '/../out/overview.html', html);
console.log(n);
