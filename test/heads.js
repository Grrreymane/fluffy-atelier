// head lineup: every species x every palette (heads only) -> out/heads.html
const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
let n = 0, rows = '';
const only = process.argv[2] ? process.argv[2].split(',') : null;
for (const sp of C.SPECIES_ORDER) {
  if (only && !only.includes(sp)) continue;
  let cells = '';
  C.SPECIES[sp].pals.forEach((pal, i) => {
    const st = { species: sp, fur: Object.assign({}, pal), body: 'girl', pose: 'stand', expr: i % 3 === 1 ? 'grin' : 'smile', eyes: { style: 'sparkle', color: pal.eye }, hair: { id: 'none' }, wear: {} };
    cells += `<div>${C.renderCharacter(st, { id: 'h' + (++n), noAnim: true, viewBox: '40 -10 320 320', only: ['hairBack', 'ears', 'head', 'face', 'hairFront', 'brows'] })}<span>${pal.n}</span></div>`;
  });
  rows += `<div class=row><b>${C.SPECIES[sp].name}</b>${cells}</div>`;
}
fs.writeFileSync(__dirname + '/../out/heads.html', `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#f6f1ea;font:13px "Noto Sans CJK SC",sans-serif}.row{display:flex;align-items:center;gap:6px;padding:4px 8px}.row b{width:44px}.row div{width:180px;background:#fff;border-radius:10px;text-align:center}svg{width:180px;height:180px;display:block}</style>${rows}`);
console.log(n);
