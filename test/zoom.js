// zoomed sheets per slot: node test/zoom.js <slot> "<x y w h>" [body] [cols] -> out/z_<slot>.html
const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
const [slot, box, bodyArg, colsArg] = process.argv.slice(2);
const body = bodyArg || 'girl', cols = +(colsArg || 6);
const p = C.SPECIES.fox.pals[0];
const ctxWear = { top: { bottom: { id: 'jeans' } }, bottom: { top: { id: 'tee' } }, dress: {}, outer: { top: { id: 'tee' }, bottom: { id: 'chinos' } },
  socks: { bottom: { id: 'denimshorts' }, shoes: { id: 'canvas' } }, shoes: { bottom: { id: 'denimshorts' } }, hat: {}, glasses: {}, neck: { top: { id: 'ocbd' } },
  acc: { top: { id: 'tee' }, bottom: { id: 'jeans' } }, held: { top: { id: 'tee' }, bottom: { id: 'jeans' } }, back: { top: { id: 'tee' }, bottom: { id: 'jeans' } }, face: {} };
let n = 0;
const cells = C.ITEMS[slot].map(it => {
  const wear = Object.assign({}, ctxWear[slot]); wear[slot] = { id: it.id };
  if (slot === 'socks') delete wear.shoes;
  const st = { species: 'fox', fur: Object.assign({}, p), body, pose: 'stand', expr: 'smile', eyes: { style: body === 'boy' ? 'boy' : 'sparkle', color: p.eye }, hair: { id: 'none' }, wear };
  return `<div><svg-wrap>${C.renderCharacter(st, { id: 'z' + (++n), noAnim: true, viewBox: box })}</svg-wrap><b>${it.id} ${it.name}</b></div>`;
}).join('');
fs.writeFileSync(`${__dirname}/../out/z_${slot}.html`, `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#f4efe6;font:13px "Noto Sans CJK SC",sans-serif}.g{display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;padding:6px;width:1500px}.g div{background:#fff;border-radius:8px;text-align:center}svg{width:100%;height:auto;display:block}</style><div class=g>${cells}</div>`);
console.log(slot, n);
