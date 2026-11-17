// overlay helper for ref3: node test/ov3.js <fig 1-4> -> /tmp/ov3.svg rendered at the reference scale
const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
const fig = +(process.argv[2] || 4);
const p = C.SPECIES.fox.pals[0];
const looks = {
  1: { body: 'boy', eyes: 'boy', wear: { top: { id: 'ocbd' }, bottom: { id: 'chinos' }, outer: { id: 'blazer' }, neck: { id: 'tie' }, socks: { id: 'argyle' }, shoes: { id: 'loafer' } } },
  2: { body: 'girl', eyes: 'sparkle', wear: { top: { id: 'blouse' }, bottom: { id: 'pleated' }, socks: { id: 'knee' }, shoes: { id: 'maryjane' } } },
  3: { body: 'boy', eyes: 'boy', wear: { top: { id: 'chambray' }, bottom: { id: 'jeans' }, shoes: { id: 'mocboot' }, hat: { id: 'beanie' } } },
  4: { body: 'girl', eyes: 'sparkle', wear: { top: { id: 'tee' }, bottom: { id: 'denimshorts' }, shoes: { id: 'canvas' }, hat: { id: 'beret' }, glasses: { id: 'round' } } },
};
const L = looks[fig];
const st = { species: 'fox', fur: Object.assign({}, p), body: L.body, pose: 'stand', expr: 'smile', eyes: { style: L.eyes, color: p.eye }, hair: { id: 'none', color: p.hair }, wear: L.wear };
const X0 = [54, 477, 904, 1335][fig - 1] - 14, X1 = [409, 836, 1263, 1696][fig - 1] + 14;
const refCx = [261, 687.5, 1115.5, 1545.5][fig - 1], refY = 251;
const k = +(process.argv[3] || 1.0677), myY = +(process.argv[4] || 229.8);
const x0 = 200 + (X0 - refCx) / k, w = (X1 - X0) / k, y0 = myY - refY / k, h = 887 / k;
fs.writeFileSync('/tmp/ov3.svg', C.renderCharacter(st, { id: 'o', noAnim: true, viewBox: `${x0} ${y0} ${w} ${h}`, wh: [X1 - X0, 887] }));
fs.writeFileSync('/tmp/ov3.json', JSON.stringify({ X0, X1 }));
