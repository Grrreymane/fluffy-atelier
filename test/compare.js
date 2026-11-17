// builds the side-by-side art direction sheet
const fs = require('fs');
require('../build.js');
const C = require('../dist/core.js');
const fox = { species: 'fox', fur: { main: '#f08a3a', sub: '#fff6ec', acc: '#3b2833', inner: '#fff1e2', nose: '#3b2833' } };
const ivy = { top: { id: 'ocbd' }, bottom: { id: 'chinos' }, outer: { id: 'blazer' }, neck: { id: 'tie' }, socks: { id: 'argyle' }, shoes: { id: 'loafer' }, held: { id: 'books' } };
const girl = { top: { id: 'blouse' }, bottom: { id: 'pleated' }, socks: { id: 'knee' }, shoes: { id: 'maryjane' } };
let n = 0;
const ch = (art, body, eyes, hair, wear, expr, vb) => C.renderCharacter(Object.assign(JSON.parse(JSON.stringify(fox)), { art, body, pose: 'stand', expr, eyes, hair, wear }), { id: 'k' + (++n), noAnim: true, viewBox: vb });
const boyE = { style: 'boy', color: '#3a9cf5' }, girlE = { style: 'sparkle', color: '#3a9cf5' };
const cols = [[undefined, '现在'], ['cute', 'A · 萌系兽人'], ['real', 'B · 偏写实兽人']];
const subs = { undefined: '人脸 + 动物耳朵', cute: '短吻部 · 杏仁眼 · 毛簇头毛', real: '长吻部 · 竖瞳 · 更多毛发细节' };
let html = `<!doctype html><meta charset=utf-8><style>
body{margin:0;background:#f4eefb;font-family:"PingFang SC","Noto Sans CJK SC","Microsoft YaHei",sans-serif;color:#3b2150}
.wrap{width:1080px;padding:22px 22px 10px}
h1{font-size:30px;margin:0 0 4px}.lead{margin:0 0 16px;color:#6d5285;font-size:17px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.col{background:#fff;border-radius:20px;padding:12px 10px 8px;box-shadow:0 4px 0 rgba(59,33,80,.1)}
.col.now{background:#f7f3f8;opacity:.92}
.col h2{margin:0;font-size:22px;text-align:center}.col p{margin:2px 0 6px;text-align:center;font-size:14px;color:#8a7399}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:2px;height:400px}.pair svg{width:100%;height:100%}
.heads{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:6px}
.heads div{background:#faf6fd;border-radius:12px;text-align:center;font-size:13px;color:#8a7399;padding-bottom:4px}
.heads svg{width:100%;height:auto;display:block}
.big{height:310px;margin-top:4px}.big svg{width:100%;height:100%}
</style><div class=wrap><h1>狐狸画风对比</h1><p class=lead>同一只狐狸：上面是全身（少年 Ivy 穿搭 / 少女长毛发），下面是头部特写和表情</p><div class=grid>`;
for (const [art, name] of cols) {
  html += `<div class="col${art ? '' : ' now'}"><h2>${name}</h2><p>${subs[art]}</p>`;
  html += `<div class=pair>${ch(art, 'boy', boyE, { id: 'ivy', color: '#f6a24e' }, ivy, 'smile', '40 0 320 720')}${ch(art, 'girl', girlE, { id: 'long', color: '#ffb36b' }, girl, 'smile', '40 0 320 720')}</div>`;
  html += `<div class=big>${ch(art, 'boy', boyE, { id: 'ivy', color: '#f6a24e' }, ivy, 'smile', '78 20 244 290')}</div>`;
  const exprs = art ? [['grin', '开心'], ['shy', '害羞'], ['cool', '酷']] : [['grin', '开心'], ['shy', '害羞'], ['cool', '酷']];
  html += `<div class=heads>${exprs.map(([e, l]) => `<div>${ch(art, 'boy', boyE, { id: 'ivy', color: '#f6a24e' }, ivy, e, '78 20 244 290')}${l}</div>`).join('')}</div></div>`;
}
html += `</div></div>`;
fs.writeFileSync('out/compare.html', html);
