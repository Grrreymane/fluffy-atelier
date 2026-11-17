// shoe highlights: reference crops, before, now -> out/ba_shine.html. usage: node test/ba_shine.js <oldcore.js>
const fs = require('fs');
const NEW = require('../dist/core.js');
const OLD = require(require('path').resolve(process.argv[2]));
const p = NEW.SPECIES.fox.pals[0];
const st = (shoes, socks, body = 'girl') => ({ species: 'fox', fur: Object.assign({}, p), body, pose: 'stand', expr: 'smile', eyes: { style: 'sparkle', color: p.eye }, hair: { id: 'none' },
  wear: Object.assign({ top: { id: 'tee' }, bottom: { id: 'denimshorts' }, shoes: { id: shoes } }, socks ? { socks: { id: socks } } : {}) });
let n = 0;
const vb = '132 648 136 66';
const cell = (C, s) => C.renderCharacter(s, { id: 's' + (++n), noAnim: true, viewBox: vb, only: ['legs', 'socks', 'shoes'] });
const W = 'width:100%;height:auto;display:block;background:#faf7f2;border-radius:10px';
const row = (lab, cells) => `<i>${lab}</i>` + cells.map(c => `<div class=c>${c}</div>`).join('');
const NAMES = Object.fromEntries(NEW.ITEMS.shoes.map(h => [h.id, h.name]));
const A = [['loafer', 'argyle', 0], ['maryjane', 'knee', 1], ['mocboot', null, 2], ['canvas', null, 3]];
const B = [['heels', null], ['brogue', 'crew'], ['chelsea', null], ['boat', null], ['ballet', null], ['sneaker', 'ankle'], ['embroidered', null]];
const sec1 = `<div class=g style="grid-template-columns:34px repeat(4,1fr)">${row('', A.map(([id]) => `<b>${NAMES[id]}</b>`))}${row('参考', A.map(([, , i]) => `<img src="ref_shoe_${i}.png" style="${W}">`))}${row('之前', A.map(([id, so]) => cell(OLD, st(id, so))))}${row('现在', A.map(([id, so]) => cell(NEW, st(id, so))))}</div>`;
const pad = a => a.concat(Array(4 - a.length).fill(''));
const grp = G => row('', pad(G.map(([id]) => `<b>${NAMES[id]}</b>`))) + row('之前', pad(G.map(([id, so]) => cell(OLD, st(id, so))))) + row('现在', pad(G.map(([id, so]) => cell(NEW, st(id, so)))));
const sec2 = `<div class=g style="grid-template-columns:34px repeat(4,1fr)">${grp(B.slice(0, 4))}${grp(B.slice(4))}</div>`;
fs.writeFileSync(`${__dirname}/../out/ba_shine.html`, `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#fff;font:16px "Noto Sans CJK SC",sans-serif;color:#3b2a2e;width:900px}h2{font-size:19px;margin:14px 12px 4px}.g{display:grid;gap:8px;padding:6px 12px;align-items:center}i{font-style:normal;font-weight:700;writing-mode:vertical-rl;text-align:center;letter-spacing:4px}.c svg{${W}}b{font-weight:600;font-size:14px;display:block;text-align:center}</style><h2>鞋子高光：和参考图对照</h2>${sec1}<h2>其他鞋子</h2>${sec2}`);
console.log('ok', n);
