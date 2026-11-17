const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
const SP = C.SPECIES;
let n = 0;
const R = (st, vb) => C.renderCharacter(st, { id: 'h' + (++n), noAnim: true, viewBox: vb });
const base = (sp, pi = 0) => { const p = SP[sp].pals[pi]; return { species: sp, fur: Object.assign({}, p), body: 'girl', pose: 'stand', expr: 'smile', eyes: { style: 'sparkle', color: p.eye }, hair: { id: 'none', color: p.hair }, wear: { top: { id: 'tee' } } }; };
let cells = '';
for (const sp of C.SPECIES_ORDER) cells += `<div class=c><b>${SP[sp].name} · 天然毛发</b>${R(base(sp), '60 -10 280 320')}</div>`;
const styles = [['messy', 'fox', 'boy', '#f6a24e'], ['ivy', 'wolf', 'boy', '#5a3a2e'], ['pomp', 'tiger', 'boy', '#3a2a26'], ['bob', 'cat', 'girl', '#2b2530'], ['long', 'bunny', 'girl', '#fff0e4'], ['twintails', 'fox', 'girl', '#ff9fc8']];
for (const [h, sp, body, col] of styles) { const st = base(sp); st.body = body; st.hair = { id: h, color: col }; if (body === 'boy') st.eyes.style = 'boy'; cells += `<div class=c><b>${C.HAIRS.find(x => x.id === h).name}</b>${R(st, '40 -10 320 360')}</div>`; }
fs.writeFileSync('out/hairs2.html', `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#efe8f7;font:14px "Noto Sans CJK SC",sans-serif}.g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px;width:1160px}.c{background:#fff;border-radius:12px;padding:4px;position:relative}.c svg{width:100%;height:auto;display:block}.c b{position:absolute;left:8px;top:6px;font-weight:600;color:#3b2150}</style><div class=g>${cells}</div>`);
