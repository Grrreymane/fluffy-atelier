// back-hair samples next to the user's long-hair references -> out/back_samples.html
const fs = require('fs');
const C = require('../dist/core.js');
const A = JSON.parse(fs.readFileSync((process.env.HAIRREF || '/tmp/hairref') + '/anchors.json', 'utf8'));
const CFG = JSON.parse(fs.readFileSync(__dirname + '/../tools/trace/cfg.json', 'utf8'));
const mk = (sp, front, back) => { const p = C.SPECIES[sp].pals[0]; return { species: sp, fur: Object.assign({}, p), body: 'girl', pose: 'stand', expr: 'smile', eyes: { style: 'sparkle', color: p.eye }, hair: { id: front }, backHair: { id: back }, wear: { top: { id: 'tee' }, bottom: { id: 'denimshorts' } } }; };
let n = 0;
const R = (st, vb) => C.renderCharacter(st, { id: 'bs' + (++n), noAnim: true, viewBox: vb });
// view box matching a reference crop (same eyes), in body coordinates
function vbOf(ref, W, H) {
  const a = A[ref], c = CFG[ref], KX = c.KX, KYU = c.KYU;
  const x0 = 200 + (0 - a.cx) * a.s * KX, y0 = 224 + (0 - a.cy) * a.s * KYU, w = W * a.s * KX, h = H * a.s * KX;
  return `${(200 + (x0 - 200) * .94).toFixed(1)} ${(283 + (y0 - 290) * .94).toFixed(1)} ${(w * .94).toFixed(1)} ${(h * .94).toFixed(1)}`;
}
const NAMES = Object.fromEntries(C.BACK_HAIRS.map(h => [h.id, h.name]));
const FN = Object.fromEntries(C.HAIRS.map(h => [h.id, h.name]));
const rows = [['straight', 0, 'curtain', 'sweep'], ['wavy', 1, 'cloud', 'swirl'], ['wolf', 2, 'shag', 'swept']].map(([id, i, f1, f2]) => {
  const vb = vbOf('long_' + i, 443, 762);
  const cells = [[`<img src="ref_back_${i}.png">`, '你的图'], [R(mk('fox', f1, id), vb), '狐狸 · ' + FN[f1]], [R(mk('fox', f2, id), vb), '狐狸 · ' + FN[f2]],
    [R(mk('bunny', f1, id), vb), '兔兔 · ' + FN[f1]], [R(mk('bear', f2, id), vb), '小熊 · ' + FN[f2]]];
  return `<h2>后发：${NAMES[id]}</h2><div class=r>${cells.map(([c, t]) => `<div class=c>${c}<i>${t}</i></div>`).join('')}</div>`;
}).join('');
fs.writeFileSync(`${__dirname}/../out/back_samples.html`, `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#fff;font:16px "Noto Sans CJK SC",sans-serif;color:#3b2a2e;width:1100px}h2{font-size:19px;margin:12px 14px 2px}.r{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:4px 14px 10px;align-items:end}.c{text-align:center}.c img,.c svg{width:100%;height:auto;display:block;background:#fbf8f3;border-radius:10px}i{font-style:normal;font-size:13px;color:#7a6468}</style>${rows}`);
console.log('ok', n);
