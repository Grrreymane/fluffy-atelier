// before/after sheet for shoes and socks: ref3 crops (row 1 is added by the python step), old build, new build
// usage: node test/ba_feet.js <oldcore.js> -> out/ba_feet.html
const fs = require('fs');
const NEW = require('../dist/core.js');
const OLD = require(require('path').resolve(process.argv[2]));
const p = NEW.SPECIES.fox.pals[0];
const base = { species: 'fox', fur: Object.assign({}, p), body: 'girl', pose: 'stand', expr: 'smile', eyes: { style: 'sparkle', color: p.eye }, hair: { id: 'none', color: p.hair } };
const looks = [
  ['便士乐福鞋 + 菱格袜', { top: { id: 'ocbd' }, bottom: { id: 'chinos' }, socks: { id: 'argyle' }, shoes: { id: 'loafer' } }],
  ['玛丽珍鞋 + 及膝袜', { top: { id: 'blouse' }, bottom: { id: 'pleated' }, socks: { id: 'knee' }, shoes: { id: 'maryjane' } }],
  ['复古工装靴', { top: { id: 'tee' }, bottom: { id: 'jeans' }, shoes: { id: 'mocboot' } }],
  ['高帮帆布鞋', { top: { id: 'tee' }, bottom: { id: 'denimshorts' }, shoes: { id: 'canvas' } }],
  ['尖头高跟鞋（光脚）', { top: { id: 'tee' }, bottom: { id: 'aline' }, shoes: { id: 'heels' } }],
  ['短袜（不穿鞋）', { top: { id: 'tee' }, bottom: { id: 'aline' }, socks: { id: 'ankle' } }],
  ['菱格袜（不穿鞋）', { top: { id: 'tee' }, bottom: { id: 'aline' }, socks: { id: 'argyle' } }],
  ['连裤袜（不穿鞋）', { top: { id: 'tee' }, bottom: { id: 'aline' }, socks: { id: 'tights' } }],
];
let n = 0;
const cell = (C, wear, vb) => C.renderCharacter(Object.assign({}, base, { wear }), { id: 'b' + (++n), noAnim: true, viewBox: vb });
const vb = '118 586 164 130';
const W = 'width:100%;height:auto;display:block;background:#faf7f2;border-radius:10px';
const grid = (cols, rows) => `<div class=g style="grid-template-columns:34px repeat(${cols},1fr)">${rows.join('')}</div>`;
const row = (lab, cells) => `<i>${lab}</i>` + cells.map(c => `<div class=c>${c}</div>`).join('');
const names = ls => row('', ls.map(([nm]) => `<b>${nm}</b>`));
const A = looks.slice(0, 4), B = looks.slice(4);
const sec1 = grid(4, [names(A), row('参考', A.map((x, i) => `<img src="ref_feet_${i}.png" style="${W}">`)), row('之前', A.map(([, w]) => cell(OLD, w, vb))), row('现在', A.map(([, w]) => cell(NEW, w, vb)))]);
const sec2 = grid(4, [names(B), row('之前', B.map(([, w]) => cell(OLD, w, vb))), row('现在', B.map(([, w]) => cell(NEW, w, vb)))]);
fs.writeFileSync(`${__dirname}/../out/ba_feet.html`, `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#fff;font:16px "Noto Sans CJK SC",sans-serif;color:#3b2a2e;width:900px}h2{font-size:19px;margin:14px 12px 4px}.g{display:grid;gap:8px;padding:6px 12px;align-items:center}i{font-style:normal;font-weight:700;writing-mode:vertical-rl;text-align:center;letter-spacing:4px}.c{text-align:center}.c svg{${W}}b{font-weight:600;font-size:14px}</style><h2>鞋子：和参考图对照</h2>${sec1}<h2>高跟鞋露出的脚背 · 袜子和爪子</h2>${sec2}`);
console.log('ok', n);
