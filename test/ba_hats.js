// before/after sheet for hats: node test/ba_hats.js <oldcore.js> -> out/ba_hats.html
const fs = require('fs');
const NEW = require('../dist/core.js');
const OLD = require(require('path').resolve(process.argv[2]));
const head = (sp, hat, extra = {}) => { const p = NEW.SPECIES[sp].pals[0]; return { species: sp, fur: Object.assign({}, p), body: 'girl', pose: 'stand', expr: 'smile', eyes: { style: 'sparkle', color: p.eye }, hair: { id: 'none' }, wear: Object.assign({ top: { id: 'tee' }, hat: { id: hat } }, extra) }; };
const hb = (hx, hy) => [200 + (hx - 200) * .94, 283 + (hy - 290) * .94];
const [x0, y0] = hb(56, 0), [x1, y1] = hb(344, 236);
const vb = `${r(x0)} ${r(y0)} ${r(x1 - x0)} ${r(y1 - y0)}`;
function r(v) { return Math.round(v * 10) / 10; }
let n = 0;
const cell = (C, st) => C.renderCharacter(st, { id: 'h' + (++n), noAnim: true, viewBox: vb, only: ['ears', 'head', 'face', 'faceDeco', 'hairFront', 'brows', 'glasses', 'hat', 'top'] });
const W = 'width:100%;height:auto;display:block;background:#faf7f2;border-radius:10px';
const grid = (cols, rows) => `<div class=g style="grid-template-columns:34px repeat(${cols},1fr)">${rows.join('')}</div>`;
const row = (lab, cells) => `<i>${lab}</i>` + cells.map(c => `<div class=c>${c}</div>`).join('');
const NAMES = Object.fromEntries(NEW.ITEMS.hat.map(h => [h.id, h.name]));
const names = ids => row('', ids.map(id => `<b>${NAMES[id]}</b>`));
const A = ['beanie', 'beret'];
const sec1 = grid(2, [names(A), row('参考', A.map(id => `<img src="ref_hat_${id}.png" style="${W}">`)), row('之前', A.map(id => cell(OLD, head('fox', id, id === 'beret' ? { glasses: { id: 'round' } } : {})))), row('现在', A.map(id => cell(NEW, head('fox', id, id === 'beret' ? { glasses: { id: 'round' } } : {}))))]);
const B1 = ['cap', 'newsboy', 'railroad', 'fedora'], B2 = ['boater', 'sunhat', 'witch', 'bandana'];
const sec2 = grid(4, [names(B1), row('之前', B1.map(id => cell(OLD, head('fox', id)))), row('现在', B1.map(id => cell(NEW, head('fox', id)))),
  names(B2), row('之前', B2.map(id => cell(OLD, head('fox', id)))), row('现在', B2.map(id => cell(NEW, head('fox', id))))]);
const SP = [['bunny', 'fedora'], ['bear', 'cap'], ['deer', 'beanie'], ['tiger', 'sunhat']];
const sec3 = grid(4, [row('', SP.map(([s, h]) => `<b>${NEW.SPECIES[s].name || s} · ${NAMES[h]}</b>`)), row('之前', SP.map(([s, h]) => cell(OLD, head(s, h)))), row('现在', SP.map(([s, h]) => cell(NEW, head(s, h))))]);
fs.writeFileSync(`${__dirname}/../out/ba_hats.html`, `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#fff;font:16px "Noto Sans CJK SC",sans-serif;color:#3b2a2e;width:900px}h2{font-size:19px;margin:14px 12px 4px}.g{display:grid;gap:8px;padding:6px 12px;align-items:center}i{font-style:normal;font-weight:700;writing-mode:vertical-rl;text-align:center;letter-spacing:4px}.c{text-align:center}.c svg{${W}}b{font-weight:600;font-size:14px;display:block;text-align:center}</style><h2>帽子：和参考图对照</h2>${sec1}<h2>其他帽子</h2>${sec2}<h2>按每个物种的头型贴合</h2>${sec3}`);
console.log('ok', n);
