// sample sheet: natural head fur for 8 species + 6 redrawn hairstyles
const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
const SP = C.SPECIES;
let n = 0;
const R = (st, vb) => C.renderCharacter(st, { id: 's' + (++n), noAnim: true, viewBox: vb });
const base = (sp, pi = 0, body = 'girl') => { const p = SP[sp].pals[pi]; return { species: sp, fur: Object.assign({}, p), body, pose: 'stand', expr: 'smile', eyes: { style: body === 'boy' ? 'boy' : 'sparkle', color: p.eye }, hair: { id: 'none', color: p.hair }, wear: { top: { id: 'tee' } } }; };
let furCells = '';
for (const sp of C.SPECIES_ORDER) furCells += `<div class=f>${R(base(sp), '62 -6 276 312')}<span>${SP[sp].name}</span></div>`;
const looks = [
  ['messy', 'fox', 0, 'boy', '#f6a24e', { top: { id: 'hoodie' } }],
  ['ivy', 'wolf', 0, 'boy', '#5a3a2e', { top: { id: 'ocbd' }, outer: { id: 'blazer' }, neck: { id: 'tie' } }],
  ['pomp', 'tiger', 0, 'boy', '#3a2a26', { top: { id: 'tee' }, outer: { id: 'a2' } }],
  ['bob', 'cat', 0, 'girl', '#2b2530', { top: { id: 'sailor' } }],
  ['long', 'bunny', 4, 'girl', '#e6dbff', { top: { id: 'blouse' } }],
  ['twintails', 'fox', 4, 'girl', '#ffcfe5', { top: { id: 'cami' } }],
];
let hairCells = '';
for (const [h, sp, pi, body, col, wear] of looks) {
  const st = base(sp, pi, body); st.hair = { id: h, color: col }; st.wear = wear;
  hairCells += `<div class=h>${R(st, '34 -12 332 420')}<span>${C.HAIRS.find(x => x.id === h).name}</span></div>`;
}
fs.writeFileSync('out/sample.html', `<!doctype html><meta charset=utf-8><style>
body{margin:0;background:#f4eefb;font-family:"Noto Sans CJK SC","PingFang SC",sans-serif;color:#3b2150}
.wrap{width:1080px;padding:22px}
h1{font-size:30px;margin:0 0 4px}h2{font-size:21px;margin:18px 0 8px}.lead{margin:0 0 6px;color:#6d5285;font-size:16px}
.furs{display:grid;grid-template-columns:repeat(8,1fr);gap:8px}
.f,.h{background:#fff;border-radius:16px;text-align:center;padding:4px 4px 8px;box-shadow:0 3px 0 rgba(59,33,80,.08)}
.f svg,.h svg{width:100%;height:auto;display:block}
.f span,.h span{font-size:15px;font-weight:600}
.hairs{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
</style><div class=wrap><h1>头毛 + 发型样图</h1><p class=lead>脸保持原样。不选发型时显示天然头毛，不会再是光头；发型改成一缕一缕分层画</p>
<h2>天然头毛（不选发型时）</h2><div class=furs>${furCells}</div>
<h2>重画的 6 款发型</h2><div class=hairs>${hairCells}</div></div>`);
