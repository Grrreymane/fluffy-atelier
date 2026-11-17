// fox in every pose + some held items (sanity sheet)
const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
const p = C.SPECIES.fox.pals[0];
let n = 0;
const st = (o) => Object.assign({ species: 'fox', fur: Object.assign({}, p), body: 'girl', pose: 'stand', expr: 'smile', eyes: { style: 'sparkle', color: p.eye }, hair: { id: 'none', color: p.hair },
  wear: { top: { id: 'tee' }, bottom: { id: 'denimshorts' } } }, o);
const cells = [];
for (const ps of C.POSES) cells.push([st({ pose: ps.id }), ps.name]);
for (const h of ['icecream', 'boba', 'camera', 'books', 'umbrella', 'lantern', 'bouquet', 'briefcase', 'guitar', 'balloon']) cells.push([st({ wear: { top: { id: 'tee' }, bottom: { id: 'denimshorts' }, held: { id: h } } }), h]);
for (const b of ['boy', 'chub']) cells.push([st({ body: b, eyes: { style: 'boy', color: p.eye } }), b]);
cells.push([st({ wear: { top: { id: 'tee' }, bottom: { id: 'denimshorts' }, back: { id: 'rucksack' }, acc: { id: 'watch' } } }), 'watch']);
const html = `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#f6f1ea;font:14px sans-serif}.g{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;padding:8px;width:1240px}
.g div{background:#fff;border-radius:10px;text-align:center}.g svg{width:100%;height:auto;display:block}</style><div class=g>${cells.map(([s, l]) => `<div>${C.renderCharacter(s, { id: 'q' + (++n), noAnim: true, viewBox: '0 20 400 700' })}${l}</div>`).join('')}</div>`;
fs.writeFileSync(__dirname + '/../out/poses.html', html);
