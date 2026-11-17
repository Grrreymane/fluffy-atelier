// side by side: ref3 figures vs our render of the same 4 looks
const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
const p = C.SPECIES.fox.pals[0];
const looks = [
  ['boy', { top: { id: 'ocbd' }, bottom: { id: 'chinos' }, outer: { id: 'blazer' }, neck: { id: 'tie' }, socks: { id: 'argyle' }, shoes: { id: 'loafer' } }, 'boy'],
  ['girl', { top: { id: 'blouse' }, bottom: { id: 'pleated' }, socks: { id: 'knee' }, shoes: { id: 'maryjane' } }, 'sparkle'],
  ['boy', { top: { id: 'chambray' }, bottom: { id: 'jeans' }, shoes: { id: 'mocboot' }, hat: { id: 'beanie' } }, 'boy'],
  ['girl', { top: { id: 'tee' }, bottom: { id: 'denimshorts' }, shoes: { id: 'canvas' }, hat: { id: 'beret' }, glasses: { id: 'round' } }, 'sparkle'],
];
let n = 0;
const out = process.argv[2] || 'side3';
const cells = looks.map(([body, wear, es], i) => {
  const st = { species: 'fox', fur: Object.assign({}, p), body, pose: 'stand', expr: 'smile', eyes: { style: es, color: p.eye }, hair: { id: 'none', color: p.hair }, wear };
  return `<div class=c><img src="file://${__dirname}/../ref/ref3_${i}.png"><div class=s>${C.renderCharacter(st, { id: 'k' + (++n), noAnim: true, viewBox: '10 10 380 710' })}</div></div>`;
}).join('');
fs.writeFileSync(`${__dirname}/../out/${out}.html`, `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#fff}.w{display:grid;grid-template-columns:repeat(4,1fr);width:1600px}
.c{display:flex;align-items:flex-end;justify-content:center;gap:0;border-right:1px solid #eee}.c img{height:600px;width:auto}.s{height:600px}.s svg{height:600px;width:auto}</style><div class=w>${cells}</div>`);
