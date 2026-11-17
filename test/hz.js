const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
const SP = C.SPECIES;
let n = 0;
const R = (st, vb) => C.renderCharacter(st, { id: 'z' + (++n), noAnim: true, viewBox: vb });
const base = (sp, pi = 0) => { const p = SP[sp].pals[pi]; return { species: sp, fur: Object.assign({}, p), body: 'girl', pose: 'stand', expr: 'smile', eyes: { style: 'sparkle', color: p.eye }, hair: { id: 'none', color: p.hair }, wear: { top: { id: 'tee' } } }; };
const list = JSON.parse(process.argv[2]);
let cells = '';
for (const [h, sp, body, col, vb] of list) { const st = base(sp); st.body = body; st.hair = { id: h, color: col }; if (body === 'boy') st.eyes.style = 'boy'; cells += `<div class=c><b>${h}</b>${R(st, vb || '60 20 280 300')}</div>`; }
fs.writeFileSync('out/hz.html', `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#efe8f7;font:14px sans-serif}.g{display:grid;grid-template-columns:repeat(${+process.argv[3] || 3},1fr);gap:8px;padding:8px;width:1160px}.c{background:#fff;border-radius:12px;position:relative}.c svg{width:100%;height:auto;display:block}.c b{position:absolute;left:8px;top:6px;color:#3b2150}</style><div class=g>${cells}</div>`);
