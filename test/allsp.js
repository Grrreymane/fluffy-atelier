// every species x every colourway, full body in the base outfit -> out/allsp.html
const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
let n = 0, rows = '';
for (const sp of C.SPECIES_ORDER) {
  let cells = '';
  C.SPECIES[sp].pals.forEach((pal, i) => {
    const body = ['girl', 'boy', 'chub'][i % 3];
    const st = { species: sp, fur: Object.assign({}, pal), body, pose: i === 4 ? 'wave' : 'stand', expr: ['smile', 'grin', 'shy', 'fang', 'tongue', 'cool'][i], eyes: { style: body === 'boy' ? 'boy' : 'sparkle', color: pal.eye }, hair: { id: 'none' }, wear: {} };
    cells += `<div>${C.renderCharacter(st, { id: 'a' + (++n), noAnim: true, viewBox: '10 20 380 700' })}<span>${pal.n}</span></div>`;
  });
  rows += `<div class=row><b>${C.SPECIES[sp].name}</b>${cells}</div>`;
}
fs.writeFileSync(__dirname + '/../out/allsp.html', `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#f6f1ea;font:14px "Noto Sans CJK SC",sans-serif}.row{display:flex;align-items:center;gap:6px;padding:4px 8px}.row b{width:40px}.row div{width:170px;background:#fff;border-radius:10px;text-align:center}svg{width:170px;height:auto;display:block}</style>${rows}`);
console.log(n);
