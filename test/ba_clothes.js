// before/after sheet for clothes: node test/ba_clothes.js <oldcore.js> -> out/ba_clothes.html
const fs = require('fs');
const NEW = require('../dist/core.js');
const OLD = require(require('path').resolve(process.argv[2]));
const looks = JSON.parse(fs.readFileSync(__dirname + '/looks3.json', 'utf8'));
const p = NEW.SPECIES.fox.pals[0];
const st = (body, wear, es, extra = {}) => Object.assign({ species: 'fox', fur: Object.assign({}, p), body, pose: 'stand', expr: 'smile', eyes: { style: es, color: p.eye }, hair: { id: 'none' }, wear }, extra);
let n = 0;
const cell = (C, s, vb) => C.renderCharacter(s, { id: 'c' + (++n), noAnim: true, viewBox: vb });
const W = 'width:100%;height:auto;display:block;background:#faf7f2;border-radius:10px';
const grid = (cols, rows) => `<div class=g style="grid-template-columns:34px repeat(${cols},1fr)">${rows.join('')}</div>`;
const row = (lab, cells) => `<i>${lab}</i>` + cells.map(c => `<div class=c>${c}</div>`).join('');
const vb = '96 272 208 210';
const sec1 = grid(4, [row('参考', looks.map((l, i) => `<img src="ref_torso_${i}.png" style="${W}">`)), row('之前', looks.map(([b, w, e]) => cell(OLD, st(b, w, e), vb))), row('现在', looks.map(([b, w, e]) => cell(NEW, st(b, w, e), vb)))]);
const more = [
  ['法兰绒衬衫领', st('boy', { top: { id: 'flannel' }, bottom: { id: 'jeans' } }, 'boy'), '130 272 140 90'],
  ['Polo 衫领', st('girl', { top: { id: 'polo' }, bottom: { id: 'chinos' } }, 'sparkle'), '130 272 140 90'],
  ['手肘褶（叉腰）', st('girl', { top: { id: 'ocbd' }, bottom: { id: 'chinos' } }, 'sparkle', { pose: 'hip' }), '78 342 90 90'],
  ['膝盖褶', st('girl', { top: { id: 'tee' }, bottom: { id: 'jeans' } }, 'sparkle'), '128 548 144 72'],
];
const sec2 = grid(4, [row('', more.map(([t]) => `<b>${t}</b>`)), row('之前', more.map(([, s, v]) => cell(OLD, s, v))), row('现在', more.map(([, s, v]) => cell(NEW, s, v)))]);
fs.writeFileSync(`${__dirname}/../out/ba_clothes.html`, `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#fff;font:16px "Noto Sans CJK SC",sans-serif;color:#3b2a2e;width:900px}h2{font-size:19px;margin:14px 12px 4px}.g{display:grid;gap:8px;padding:6px 12px;align-items:center}i{font-style:normal;font-weight:700;writing-mode:vertical-rl;text-align:center;letter-spacing:4px}.c{text-align:center}.c svg{${W}}b{font-weight:600;font-size:14px;display:block;text-align:center}</style><h2>衣服：和参考图对照</h2>${sec1}<h2>领子和褶皱</h2>${sec2}`);
console.log('ok', n);
