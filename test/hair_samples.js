// hairstyle samples next to the user's reference -> out/hair_samples.html
// usage: node test/hair_samples.js id:refPng:vbHead:vbBody[,...]
const fs = require('fs');
const C = require('../dist/core.js');
const A = JSON.parse(fs.readFileSync((process.env.HAIRREF || '/tmp/hairref') + '/anchors.json', 'utf8'));
const CFG = JSON.parse(fs.readFileSync(__dirname + '/../tools/trace/cfg.json', 'utf8'));
const mk = (sp, hair, o = {}) => { const p = C.SPECIES[sp].pals[0]; return Object.assign({ species: sp, fur: Object.assign({}, p), body: 'girl', pose: 'stand', expr: 'smile', eyes: { style: 'sparkle', color: p.eye }, hair: { id: hair }, wear: { top: { id: 'tee' }, bottom: { id: 'denimshorts' } } }, o); };
let n = 0;
const R = (st, vb) => C.renderCharacter(st, { id: 'hs' + (++n), noAnim: true, viewBox: vb });
const NAMES = Object.fromEntries(C.HAIRS.map(h => [h.id, h.name]));
// our view box matching a reference crop (same eye positions), in body coordinates
function vbOf(ref, W, H) {
  const a = A[ref], c = CFG[ref], KX = c.KX, KYU = c.KYU;
  // reference px -> head: X = 200 + (x - cx) * s * KX ; Y = 224 + (y - cy) * s * KYU (above the eyes)
  const x0 = 200 + (0 - a.cx) * a.s * KX, y0 = 224 + (0 - a.cy) * a.s * KYU, w = W * a.s * KX, h = H * a.s * KX;
  const bx = 200 + (x0 - 200) * .94, by = 283 + (y0 - 290) * .94;
  return `${bx.toFixed(1)} ${by.toFixed(1)} ${(w * .94).toFixed(1)} ${(h * .94).toFixed(1)}`;
}
const rows = process.argv.slice(2).join(',').split(',').map(spec => {
  const [id, ref, W, H, extra] = spec.split(':');
  const vb = vbOf(ref, +W, +H);
  const cells = [`<img src="ref_hair_${id}.png">`, R(mk('fox', id), vb)];
  for (const sp of ['bunny', 'bear', 'deer']) cells.push(R(mk(sp, id), vb));
  return `<h2>${NAMES[id]}</h2><div class=r>${cells.map((c, i) => `<div class=c>${c}<i>${['你的图', '狐狸', '兔兔', '小熊', '小鹿'][i]}</i></div>`).join('')}</div>`;
}).join('');
fs.writeFileSync(`${__dirname}/../out/hair_samples.html`, `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#fff;font:16px "Noto Sans CJK SC",sans-serif;color:#3b2a2e;width:1100px}h2{font-size:19px;margin:12px 14px 2px}.r{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:4px 14px 10px;align-items:end}.c{text-align:center}.c img,.c svg{width:100%;height:auto;display:block;background:#fbf8f3;border-radius:10px}i{font-style:normal;font-size:13px;color:#7a6468}</style>${rows}`);
console.log('ok', n);
