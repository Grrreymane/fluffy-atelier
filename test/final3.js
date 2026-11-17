// final comparison sheet for the user: ref3 (top) vs ours (bottom) + a strip of extra states
const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
const p = C.SPECIES.fox.pals[0];
const looks = JSON.parse(fs.readFileSync(__dirname + '/looks3.json', 'utf8'));
let n = 0;
const mk = o => Object.assign({ species: 'fox', fur: Object.assign({}, p), body: 'girl', pose: 'stand', expr: 'smile', eyes: { style: 'sparkle', color: p.eye }, hair: { id: 'none' }, wear: {} }, o);
// same framing as the pair images: soles at y=710 <-> ref px 860, 1.266 px per unit
const s = 1.266, vb = `${200 - 230 / s} ${710 - 845 / s} ${460 / s} ${860 / s}`;
const ours = looks.map(([body, wear, es]) => `<div class=fig>${C.renderCharacter(mk({ body, wear, eyes: { style: es, color: p.eye } }), { id: 'o' + (++n), noAnim: true, viewBox: vb })}</div>`).join('');
const extra = [
  [mk({}), '打底 · 少女'], [mk({ body: 'boy', eyes: { style: 'boy', color: p.eye } }), '打底 · 少年'], [mk({ body: 'chub', expr: 'grin' }), '打底 · 圆滚滚'],
  [mk({ pose: 'wave', body: 'boy', eyes: { style: 'boy', color: p.eye }, wear: looks[0][1] }), '挥手'],
  [mk({ pose: 'cheer', wear: looks[1][1], expr: 'grin' }), '欢呼'], [mk({ pose: 'hips', body: 'boy', eyes: { style: 'boy', color: p.eye }, wear: looks[2][1], expr: 'fang' }), '叉腰'],
].map(([st, l]) => `<div class=x>${C.renderCharacter(st, { id: 'x' + (++n), noAnim: true, viewBox: '0 0 400 720' })}<span>${l}</span></div>`).join('');
const ref = 'file://' + __dirname + '/../ref/ref3.png';
const html = `<!doctype html><meta charset=utf-8><style>
body{margin:0;background:#f6f1ea;font-family:"Noto Sans CJK SC","PingFang SC",sans-serif;color:#3b2120}
.w{width:1840px;padding:28px 30px}
h1{font-size:34px;margin:0 0 6px}.lead{margin:0 0 18px;color:#7a5a52;font-size:20px}
.lbl{font-size:20px;font-weight:600;margin:14px 0 8px}
.card{background:#fff;border-radius:22px;padding:12px}
.ref{display:block;width:1776px;height:auto;margin:0 auto}
.row{display:grid;grid-template-columns:repeat(4,1fr);gap:0}
.fig svg{width:100%;height:auto;display:block}
.xs{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
.x{background:#fff;border-radius:18px;text-align:center;padding-bottom:8px;font-size:18px}.x svg{width:100%;height:auto;display:block}
</style><div class=w><h1>狐狸迭代 · 对照你的服装参考图</h1><p class=lead>上：你给的参考图　下：游戏里实际渲染的狐狸（同样 4 套衣服，同一比例）</p>
<div class=lbl>参考图</div><div class=card><img class=ref src="${ref}"></div>
<div class=lbl>游戏里的狐狸</div><div class=card><div class=row>${ours}</div></div>
<div class=lbl>打底和其他姿势</div><div class=xs>${extra}</div></div>`;
fs.writeFileSync(__dirname + '/../out/fox_ref3.html', html);
