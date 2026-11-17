// final before/after: reference, the start of this round, now — full figures. node test/ba_final.js <oldcore.js>
const fs = require('fs');
const NEW = require('../dist/core.js');
const OLD = require(require('path').resolve(process.argv[2]));
const looks = JSON.parse(fs.readFileSync(__dirname + '/looks3.json', 'utf8'));
const p = NEW.SPECIES.fox.pals[0];
const s = 1.266, cxs = [259, 688, 1116, 1546];
let n = 0;
const cell = (C, i) => { const [body, wear, es] = looks[i], cx = cxs[i];
  const st = { species: 'fox', fur: Object.assign({}, p), body, pose: 'stand', expr: 'smile', eyes: { style: es, color: p.eye }, hair: { id: 'none' }, wear };
  return C.renderCharacter(st, { id: 'f' + (++n), noAnim: true, viewBox: `${200 - 230 / s} ${710 - 845 / s} ${460 / s} ${860 / s}` }); };
const W = 'width:100%;height:auto;display:block;background:#fff;border-radius:10px';
const row = (lab, cells) => `<i>${lab}</i>` + cells.map(c => `<div class=c>${c}</div>`).join('');
const idx = [0, 1, 2, 3];
const html = `<div class=g>${row('参考', idx.map(i => `<img src="ref_full_${i}.png" style="${W}">`))}${row('之前', idx.map(i => cell(OLD, i)))}${row('现在', idx.map(i => cell(NEW, i)))}</div>`;
fs.writeFileSync(`${__dirname}/../out/ba_final.html`, `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#f6f1e8;font:16px "Noto Sans CJK SC",sans-serif;color:#3b2a2e;width:900px}h2{font-size:19px;margin:14px 12px 4px}.g{display:grid;grid-template-columns:34px repeat(4,1fr);gap:8px;padding:6px 12px 12px;align-items:center}i{font-style:normal;font-weight:700;writing-mode:vertical-rl;text-align:center;letter-spacing:4px}.c svg{${W}}</style><h2>整体对照：参考图 / 本轮开始前 / 现在</h2>${html}`);
console.log('ok', n);
