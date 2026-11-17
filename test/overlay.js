// overlay the fox head on the reference at matching scale: node test/overlay.js [scale]
const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
const k = +(process.argv[2] || .47);
const p = C.SPECIES.fox.pals[0];
const st = { species: 'fox', fur: Object.assign({}, p), body: 'girl', pose: 'stand', expr: 'smile', eyes: { style: 'sparkle', color: p.eye }, hair: { id: 'none', color: p.hair }, wear: { top: { id: 'cami', c1: '#fef4e5' }, bottom: { id: 'bermuda', c1: '#c8bab1', pat: 'none' } } };
const x0 = 200 - 627 * k, y0 = 224 - 422 * k, w = 1254 * k;
const svg = C.renderCharacter(st, { id: 'o', noAnim: true, viewBox: `${x0} ${y0} ${w} ${w}`, wh: [1254, 1254] });
fs.writeFileSync('/tmp/ov.svg', svg);
