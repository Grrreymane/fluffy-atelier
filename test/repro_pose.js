// reproduces the two pose bugs the user reported -> out/repro_pose.html
//  A: 捧手 pose + short puff sleeves (magical dress): the forearm is cut by a straight line where it comes in front of the bodice
//  B: holding a cup + a wide sleeve (puffer): the sleeve end is chopped off around the paw
const fs = require('fs');
const C = require('../dist/core.js');
const mk = (sp, pose, wear, pal = 0) => { const p = C.SPECIES[sp].pals[pal]; return { species: sp, fur: Object.assign({}, p), body: 'girl', pose, expr: 'fang', eyes: { style: 'sleepy', color: p.eye }, hair: { id: 'none' }, wear }; };
const cases = [
  ['A 捧手+魔法少女裙', mk('bunny', 'hold', { dress: { id: 'magical' }, socks: { id: 'loose' }, shoes: { id: 'boat' } }), '110 290 180 200'],
  ['B 珍珠奶茶+面包羽绒服', mk('bunny', 'stand', { top: { id: 'hoodie' }, bottom: { id: 'jeans' }, outer: { id: 'puffer', c1: '#f4a6c0' }, acc: { id: 'crossbody' }, held: { id: 'boba' } }), '150 300 140 140'],
];
let n = 0;
const html = cases.map(([t, st, vb]) => `<div><b>${t}</b>${C.renderCharacter(st, { id: 'rp' + (++n), noAnim: true, viewBox: vb })}</div>`).join('');
fs.writeFileSync(`${__dirname}/../out/repro_pose.html`, `<!doctype html><meta charset=utf-8><style>body{margin:0;display:flex;gap:10px;font:14px sans-serif;background:#fff}div{width:480px}svg{width:480px;height:auto;display:block;border:1px solid #eee}</style>${html}`);
console.log('ok');
