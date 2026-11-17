// pose bugs before/after: the user's two cases plus the same fix on other outfits and bodies -> out/ba_pose.html
// usage: node test/ba_pose.js <oldcore.js>
const fs = require('fs');
const NEW = require('../dist/core.js');
const OLD = require(require('path').resolve(process.argv[2]));
const mk = (sp, body, pose, wear, o = {}) => { const p = NEW.SPECIES[sp].pals[0]; return Object.assign({ species: sp, fur: Object.assign({}, p), body, pose, expr: 'smile', eyes: { style: 'sparkle', color: p.eye }, hair: { id: 'none' }, wear }, o); };
let n = 0;
const cell = (C, st, vb) => C.renderCharacter(st, { id: 'b' + (++n), noAnim: true, viewBox: vb });
const W = 'width:100%;height:auto;display:block;background:#faf7f2;border-radius:10px';
const row = (lab, cells) => `<i>${lab}</i>` + cells.map(c => `<div class=c>${c}</div>`).join('');
const grid = (cases) => `<div class=g style="grid-template-columns:34px repeat(${cases.length},1fr)">${row('', cases.map(c => `<b>${c[0]}</b>`))}${row('之前', cases.map(c => cell(OLD, c[1], c[2])))}${row('现在', cases.map(c => cell(NEW, c[1], c[2])))}</div>`;
// the tan bunny from the user's screenshot
const tp = NEW.SPECIES.bunny.pals[1];
const TAN = { fur: Object.assign({}, tp), expr: 'fang', eyes: { style: 'sleepy', color: '#e0312f' } };
const user = [
  ['捧手 · 魔法少女裙', mk('bunny', 'girl', 'hold', { dress: { id: 'magical', c1: '#ff9ccb', c2: '#7ea6cf' }, socks: { id: 'loose' }, shoes: { id: 'boat' } }, TAN), '122 314 156 156'],
  ['拿奶茶 · 面包羽绒服', mk('bunny', 'girl', 'stand', { top: { id: 'hoodie' }, bottom: { id: 'jeans' }, outer: { id: 'puffer', c1: '#f4a6c0' }, acc: { id: 'crossbody' }, held: { id: 'boba' } }, TAN), '196 318 88 88'],
];
const more = [
  ['捧花 · T恤（圆滚滚）', mk('bear', 'chub', 'stand', { top: { id: 'tee' }, bottom: { id: 'jeans' }, held: { id: 'bouquet' } }), '120 300 160 160'],
  ['捧手 · 西装', mk('fox', 'boy', 'hold', { top: { id: 'ocbd' }, bottom: { id: 'chinos' }, outer: { id: 'blazer' } }), '120 300 160 160'],
  ['拿咖啡 · 衬衫（少年）', mk('cat', 'boy', 'stand', { top: { id: 'ocbd' }, bottom: { id: 'chinos' }, held: { id: 'coffee' } }), '196 318 88 88'],
  ['拿相机 · 羽绒服（圆滚滚）', mk('deer', 'chub', 'stand', { top: { id: 'hoodie' }, bottom: { id: 'jeans' }, outer: { id: 'puffer' }, held: { id: 'camera' } }), '196 318 100 100'],
];
fs.writeFileSync(`${__dirname}/../out/ba_pose.html`, `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#fff;font:16px "Noto Sans CJK SC",sans-serif;color:#3b2a2e;width:900px}h2{font-size:19px;margin:14px 12px 4px}.g{display:grid;gap:8px;padding:6px 12px;align-items:center}i{font-style:normal;font-weight:700;writing-mode:vertical-rl;text-align:center;letter-spacing:4px}.c svg{${W}}b{font-weight:600;font-size:14px;display:block;text-align:center}</style><h2>你截图里的两个 bug</h2>${grid(user)}<h2>同样的姿势，换衣服和体型</h2>${grid(more)}`);
console.log('ok', n);
