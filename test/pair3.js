// pair image: ref3 figure i (left) and our render (right) at the same scale -> /tmp/pair_i.png via rsvg
const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
const i = +process.argv[2];
const p = C.SPECIES.fox.pals[0];
const looks = JSON.parse(fs.readFileSync(__dirname + '/looks3.json', 'utf8'));
const [body, wear, es] = looks[i];
const st = { species: 'fox', fur: Object.assign({}, p), body, pose: 'stand', expr: 'smile', eyes: { style: es, color: p.eye }, hair: { id: 'none', color: p.hair }, wear };
const s = 1.266, cx = [259, 688, 1116, 1546][i], sole = 860;
// crop window in ref px: cx-230..cx+230, 15..875  -> units
const x0 = 200 + (cx - 230 - cx) / s, y0 = 710 - (sole - 15) / s;
fs.writeFileSync('/tmp/pair.svg', C.renderCharacter(st, { id: 'p', noAnim: true, viewBox: `${x0} ${y0} ${460 / s} ${860 / s}`, wh: [920, 1720] }));
