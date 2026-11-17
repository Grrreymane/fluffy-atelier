// all poses x a few sleeve types (short tee, long blazer, puff blouse, coat) on girl/boy/chub
const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
const p = C.SPECIES.fox.pals[0];
let n = 0;
const outfits = [
  { top: { id: 'tee' }, bottom: { id: 'denimshorts' }, shoes: { id: 'canvas' } },
  { top: { id: 'ocbd' }, bottom: { id: 'chinos' }, outer: { id: 'blazer' }, neck: { id: 'tie' }, shoes: { id: 'loafer' } },
  { top: { id: 'blouse' }, bottom: { id: 'pleated' }, socks: { id: 'knee' }, shoes: { id: 'maryjane' } },
  { top: { id: 'hoodie' }, bottom: { id: 'jeans' }, outer: { id: 'trench' }, shoes: { id: 'mocboot' } },
];
const bodies = ['girl', 'boy', 'chub'];
let cells = '';
outfits.forEach((w, oi) => {
  for (const ps of C.POSES) {
    const body = bodies[(oi + n) % 3];
    const st = { species: 'fox', fur: Object.assign({}, p), body, pose: ps.id, expr: 'smile', eyes: { style: body === 'boy' ? 'boy' : 'sparkle', color: p.eye }, hair: { id: 'none' }, wear: w };
    const svg = C.renderCharacter(st, { id: 'q' + (++n), noAnim: true, viewBox: '0 0 400 720' });
    if (/NaN|undefined/.test(svg)) console.log('BAD', oi, ps.id);
    cells += `<div>${svg}<span>${ps.name}/${body}</span></div>`;
  }
});
fs.writeFileSync(__dirname + '/../out/poses2.html', `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#f4efe6;font:12px sans-serif}.g{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;padding:6px;width:1200px}.g div{background:#fff;border-radius:8px;text-align:center}svg{width:100%;height:auto;display:block}</style><div class=g>${cells}</div>`);
console.log('cells', n);
