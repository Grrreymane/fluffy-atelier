// render one fox with a custom viewBox: node test/part.js "x y w h" out.png [jsonOverrides]
const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
const p = C.SPECIES.fox.pals[0];
const ov = process.argv[4] ? JSON.parse(process.argv[4]) : {};
const st = Object.assign({ species: 'fox', fur: Object.assign({}, p), body: 'girl', pose: 'stand', expr: 'smile', eyes: { style: 'sparkle', color: p.eye }, hair: { id: 'none', color: p.hair },
  wear: { top: { id: 'cami', c1: '#fef4e5' }, bottom: { id: 'bermuda', c1: '#c8bab1', pat: 'none' } } }, ov);
const vb = process.argv[2].split(' ').map(Number);
const W = 900, H = Math.round(W * vb[3] / vb[2]);
fs.writeFileSync('/tmp/part.svg', C.renderCharacter(st, { id: 'p', noAnim: true, viewBox: vb.join(' '), wh: [W, H] }));
