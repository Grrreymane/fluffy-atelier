// shoulder close-ups for every sleeved item: node test/shsheet.js <slot> -> out/sh_<slot>.html
const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
const slot = process.argv[2] || 'top';
const p = C.SPECIES.fox.pals[0];
let n = 0;
const base = { top: { id: 'tee' }, bottom: { id: 'jeans' } };
const cells = (C.ITEMS[slot] || []).filter(it => it.sleeve || slot === 'dress' || slot === 'top').map(it => {
  const wear = slot === 'outer' ? Object.assign({}, base, { outer: { id: it.id } }) : slot === 'dress' ? { dress: { id: it.id } } : { top: { id: it.id }, bottom: { id: 'jeans' } };
  const body = n % 2 ? 'boy' : 'girl';
  const st = { species: 'fox', fur: Object.assign({}, p), body, pose: 'stand', expr: 'smile', eyes: { style: body === 'boy' ? 'boy' : 'sparkle', color: p.eye }, hair: { id: 'none' }, wear };
  return `<div>${C.renderCharacter(st, { id: 'h' + (++n), noAnim: true, viewBox: '96 282 208 150' })}<b>${it.name}</b></div>`;
}).join('');
fs.writeFileSync(`${__dirname}/../out/sh_${slot}.html`, `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#f4efe6;font:13px sans-serif}.g{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;padding:6px;width:1400px}.g div{background:#fff;border-radius:8px;text-align:center}svg{width:100%;height:auto;display:block}</style><div class=g>${cells}</div>`);
console.log(slot, n);
