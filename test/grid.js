// usage: node test/grid.js states.json out.html [cols] [cellW]
const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
const states = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const cols = +process.argv[4] || 4, w = +process.argv[5] || 300;
let cells = '';
states.forEach((st, i) => {
  const opts = Object.assign({ id: 'c' + i, noAnim: true }, st._opts || {});
  let svg;
  try { svg = C.renderCharacter(st, opts); } catch (e) { svg = `<pre style="color:red;font-size:10px;white-space:pre-wrap">${e.stack}</pre>`; }
  cells += `<div class="c"><div class="l">${st._label || i}</div>${svg}</div>`;
});
fs.writeFileSync(process.argv[3], `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#e9e3f2;font:12px sans-serif}.g{display:grid;grid-template-columns:repeat(${cols},${w}px);gap:6px;padding:6px}.c{background:linear-gradient(#fdf6ff,#f0e8fa);border-radius:8px;position:relative}.c svg{width:100%;height:auto;display:block}.l{position:absolute;left:6px;top:4px;color:#634}</style></head><body><div class="g">${cells}</div></body></html>`);
