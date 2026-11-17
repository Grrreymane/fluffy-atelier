// side-by-side: user's reference image 2 vs the redrawn fox
const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
const p = C.SPECIES.fox.pals[0];
let n = 0;
const fox = (o = {}) => Object.assign({ species: 'fox', fur: Object.assign({}, p), body: 'girl', pose: 'stand', expr: 'smile',
  eyes: { style: 'sparkle', color: p.eye }, hair: { id: 'none', color: p.hair },
  wear: { top: { id: 'cami', c1: '#fef4e5' }, bottom: { id: 'bermuda', c1: '#c8bab1', pat: 'none' } } }, o);
const R = (st, vb) => C.renderCharacter(st, { id: 'r' + (++n), noAnim: true, viewBox: vb });
const ref = 'file://' + __dirname + '/../ref/ref2.png';
const exprs = [['smile', '微笑'], ['grin', '开心'], ['shy', '害羞'], ['cool', '酷'], ['wow', '惊讶']];
const looks = [
  ['boy', { top: { id: 'ocbd' }, bottom: { id: 'chinos' }, outer: { id: 'blazer' }, neck: { id: 'tie' }, socks: { id: 'argyle' }, shoes: { id: 'loafer' } }, 'boy'],
  ['girl', { top: { id: 'blouse' }, bottom: { id: 'pleated' }, socks: { id: 'knee' }, shoes: { id: 'maryjane' } }, 'sparkle'],
  ['boy', { top: { id: 'chambray' }, bottom: { id: 'jeans' }, shoes: { id: 'mocboot' }, hat: { id: 'beanie' } }, 'boy'],
  ['girl', { top: { id: 'tee' }, bottom: { id: 'denimshorts' }, shoes: { id: 'canvas' }, hat: { id: 'beret' }, glasses: { id: 'round' } }, 'sparkle'],
];
const html = `<!doctype html><meta charset=utf-8><style>
body{margin:0;background:#f6f1ea;font-family:"Noto Sans CJK SC","PingFang SC",sans-serif;color:#3b2120}
.wrap{width:1200px;padding:20px 24px}
h1{font-size:28px;margin:0 0 4px}.lead{margin:0 0 14px;color:#7a5a52;font-size:16px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.card{background:#fff;border-radius:18px;padding:10px;box-shadow:0 3px 0 rgba(59,33,32,.08);text-align:center}
.card b{display:block;font-size:17px;margin:2px 0 6px}
.full{height:640px;display:flex;align-items:center;justify-content:center}
.full img{height:640px;width:640px;object-fit:contain}.full svg{height:640px;width:auto}
.heads{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}
.hd{height:330px;display:flex;align-items:center;justify-content:center;overflow:hidden}
.hd img{height:330px;width:auto}.hd svg{height:330px}
.ex{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:16px}
.ex div{background:#fff;border-radius:14px;padding:4px;font-size:14px;text-align:center}.ex svg{width:100%;height:auto;display:block}
.lk{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px}.lk div{background:#fff;border-radius:14px}.lk svg{width:100%;height:auto;display:block}
</style><div class=wrap><h1>狐狸样图 · 按你的图 2 重画</h1><p class=lead>左：你给的参考图　右：游戏里的新狐狸（身体比例和衣服沿用现有的）</p>
<div class=row><div class=card><b>参考图 2</b><div class=full><img src="${ref}"></div></div>
<div class=card><b>游戏里的新狐狸</b><div class=full>${R(fox(), '20 20 360 700')}</div></div></div>
<div class=heads><div class=card><b>参考 · 头部</b><div class=hd><img src="${'file://' + __dirname + '/../ref/head.png'}"></div></div>
<div class=card><b>新狐狸 · 头部</b><div class=hd>${R(fox(), '52 4 296 290')}</div></div></div>
<div class=ex>${exprs.map(([e, l]) => `<div>${R(fox({ expr: e }), '52 4 296 296')}${l}</div>`).join('')}</div>
<div class=lk>${looks.map(([b, w, es]) => `<div>${R(fox({ body: b, wear: w, eyes: { style: es, color: p.eye } }), '40 20 320 700')}</div>`).join('')}</div>
</div>`;
fs.writeFileSync(__dirname + '/../out/ref2cmp.html', html);
console.log('ok');
