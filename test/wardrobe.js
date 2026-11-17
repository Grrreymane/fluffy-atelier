// every wearable item on the fox (stand pose), one sheet per slot group -> out/wd_<slot>.html
const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
const p = C.SPECIES.fox.pals[0];
const base = { species: 'fox', fur: Object.assign({}, p), body: 'girl', pose: 'stand', expr: 'smile', eyes: { style: 'sparkle', color: p.eye }, hair: { id: 'none', color: p.hair } };
const ctxWear = { top: { top: null }, bottom: {}, dress: {}, outer: { top: { id: 'tee' }, bottom: { id: 'chinos' } }, socks: { bottom: { id: 'denimshorts' } },
  shoes: { bottom: { id: 'denimshorts' }, socks: null }, hat: { top: { id: 'tee' } }, glasses: { top: { id: 'tee' } }, neck: { top: { id: 'ocbd' } }, acc: { top: { id: 'tee' }, bottom: { id: 'jeans' } },
  held: { top: { id: 'tee' }, bottom: { id: 'jeans' } }, back: { top: { id: 'tee' }, bottom: { id: 'jeans' } }, face: { top: { id: 'tee' } } };
let n = 0, bad = [];
for (const slot of Object.keys(ctxWear)) {
  const items = C.ITEMS[slot] || [];
  const cells = items.map(it => {
    const wear = {};
    for (const [k, v] of Object.entries(ctxWear[slot])) if (v) wear[k] = v;
    wear[slot] = { id: it.id };
    const body = n % 3 === 1 ? 'boy' : 'girl';
    const st = Object.assign({}, base, { wear, body, eyes: { style: body === 'boy' ? 'boy' : 'sparkle', color: p.eye } });
    let svg = '';
    try { svg = C.renderCharacter(st, { id: 'w' + (++n), noAnim: true, viewBox: '0 0 400 720' }); if (/NaN|undefined/.test(svg)) bad.push(slot + ':' + it.id); }
    catch (e) { bad.push(slot + ':' + it.id + ' ' + e.message); }
    return `<div class=c>${svg}<b>${it.name}</b></div>`;
  }).join('');
  fs.writeFileSync(`${__dirname}/../out/wd_${slot}.html`, `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#f4efe6;font:13px sans-serif}.g{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;padding:6px;width:1400px}.c{background:#fff;border-radius:10px;text-align:center}.c svg{width:100%;height:auto;display:block}b{font-weight:500}</style><div class=g>${cells}</div>`);
}
console.log('rendered', n, 'problems', bad.length ? bad : 'none');
