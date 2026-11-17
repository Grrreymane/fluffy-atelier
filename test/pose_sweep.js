// arms in every pose (and every held-item grip) x sleeve types -> out/pose_sweep.html
const fs = require('fs');
const C = require('../dist/core.js');
const body = process.argv[2] || 'girl';
const outfits = [
  ['泡泡袖连身', { dress: { id: 'magical' } }],
  ['短袖T恤', { top: { id: 'tee' }, bottom: { id: 'denimshorts' } }],
  ['长袖衬衫', { top: { id: 'ocbd' }, bottom: { id: 'chinos' } }],
  ['西装', { top: { id: 'ocbd' }, bottom: { id: 'chinos' }, outer: { id: 'blazer' } }],
  ['羽绒服', { top: { id: 'hoodie' }, bottom: { id: 'jeans' }, outer: { id: 'puffer', c1: '#f4a6c0' } }],
  ['泡泡袖衬衫', { top: { id: 'blouse' }, bottom: { id: 'pleated' } }],
];
const poses = [['站立', 'stand', null], ['挥手', 'wave', null], ['叉腰', 'hips', null], ['欢呼', 'cheer', null], ['捧手', 'hold', null], ['拿杯子', 'stand', 'boba'], ['捧花', 'stand', 'bouquet'], ['提包', 'stand', 'briefcase']];
let n = 0;
const p = C.SPECIES.bunny.pals[0];
const rows = outfits.map(([on, w]) => `<tr><th>${on}</th>` + poses.map(([pn, pose, held]) => {
  const wear = Object.assign({}, w); if (held) wear.held = { id: held };
  const st = { species: 'bunny', fur: Object.assign({}, p), body, pose, expr: 'smile', eyes: { style: 'sparkle', color: p.eye }, hair: { id: 'none' }, wear };
  return `<td>${C.renderCharacter(st, { id: 'ps' + (++n), noAnim: true, viewBox: '40 280 320 230' })}</td>`;
}).join('') + '</tr>').join('');
fs.writeFileSync(`${__dirname}/../out/pose_sweep.html`, `<!doctype html><meta charset=utf-8><style>body{margin:0;font:13px sans-serif;background:#fff}table{border-collapse:collapse}th{width:60px}td{padding:2px}svg{width:230px;height:auto;display:block;border:1px solid #eee}</style><table><tr><th></th>${poses.map(q => `<th>${q[0]}</th>`).join('')}</tr>${rows}</table>`);
console.log('ok', n);
