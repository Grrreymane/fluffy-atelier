// shoulder close-ups for the 4 ref3 looks -> /tmp/sh_<i>.svg (units box x0 y0 w h passed as args)
const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
const p = C.SPECIES.fox.pals[0];
const looks = JSON.parse(fs.readFileSync(__dirname + '/looks3.json', 'utf8'));
const [x0, y0, w, h] = (process.argv[2] || '118 286 164 124').split(' ').map(Number);
looks.forEach(([body, wear, es], i) => {
  const st = { species: 'fox', fur: Object.assign({}, p), body, pose: 'stand', expr: 'smile', eyes: { style: es, color: p.eye }, hair: { id: 'none', color: p.hair }, wear };
  fs.writeFileSync(`/tmp/sh_${i}.svg`, C.renderCharacter(st, { id: 's' + i, noAnim: true, viewBox: `${x0} ${y0} ${w} ${h}`, wh: [w * 4, h * 4] }));
});
