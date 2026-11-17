// full-body lineup: every species, palette 0, base outfit + one dressed look -> out/lineup.html
const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
let n = 0, cells = '';
const looks = [
  { top: { id: 'tee' }, bottom: { id: 'denimshorts' }, shoes: { id: 'canvas' } },
  { top: { id: 'ocbd' }, bottom: { id: 'chinos' }, outer: { id: 'blazer' }, neck: { id: 'tie' }, shoes: { id: 'loafer' } },
  { top: { id: 'blouse' }, bottom: { id: 'pleated' }, socks: { id: 'knee' }, shoes: { id: 'maryjane' } },
  { top: { id: 'chambray' }, bottom: { id: 'jeans' }, shoes: { id: 'mocboot' } },
];
const order = (process.argv[2] || C.SPECIES_ORDER.join(',')).split(',');
order.forEach((sp, k) => {
  const pal = C.SPECIES[sp].pals[0];
  for (const [i, wear] of [[0, {}], [1, looks[k % 4]]]) {
    const body = (k + i) % 2 ? 'boy' : 'girl';
    const st = { species: sp, fur: Object.assign({}, pal), body, pose: 'stand', expr: 'smile', eyes: { style: body === 'boy' ? 'boy' : 'sparkle', color: pal.eye }, hair: { id: 'none' }, wear };
    cells += `<div>${C.renderCharacter(st, { id: 'l' + (++n), noAnim: true, viewBox: '10 0 380 720' })}<span>${C.SPECIES[sp].name}</span></div>`;
  }
});
fs.writeFileSync(__dirname + '/../out/lineup.html', `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#f6f1ea;font:14px "Noto Sans CJK SC",sans-serif}.g{display:grid;grid-template-columns:repeat(8,1fr);gap:6px;padding:6px;width:1600px}.g div{background:#fff;border-radius:10px;text-align:center}svg{width:100%;height:auto;display:block}</style><div class=g>${cells}</div>`);
console.log(n);
