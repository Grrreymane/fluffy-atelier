// 调皮 (tongue out): the tongue hangs from under the mouth line, so no point of it may lie above the ω curve.
// (bug: its flat top edge sat above the right lobe of the ω and poked through the lip line)
// usage: node test/tongue.js [dist/core.js]
const fs = require('fs'), vm = require('vm');
const file = process.argv[2] || __dirname + '/../dist/core.js';
const sb = { module: {}, console };
vm.createContext(sb);
vm.runInContext(fs.readFileSync(file, 'utf8') + '\n;this.T = { drawMouth, noseInfo, furColors, SPECIES, SPECIES_ORDER };', sb);
const { drawMouth, noseInfo, furColors, SPECIES, SPECIES_ORDER } = sb.T;

// the ω as drawn by drawMouth: two quadratic lobes meeting at the cusp (200, c)
const omegaY = (c, x) => {
  const segs = [[[183, c - .5], [186.5, c + 7], [191.5, c + 7]], [[191.5, c + 7], [197, c + 7], [200, c]],
    [[200, c], [203, c + 7], [208.5, c + 7]], [[208.5, c + 7], [213.5, c + 7], [217, c - .5]]];
  let best = null;
  for (const [a, b, d] of segs) for (let i = 0; i <= 200; i++) {
    const t = i / 200, u = 1 - t, px = u * u * a[0] + 2 * u * t * b[0] + t * t * d[0], py = u * u * a[1] + 2 * u * t * b[1] + t * t * d[1];
    if (Math.abs(px - x) < .15 && (best === null || py > best)) best = py;
  }
  return best;
};
let fails = 0, checked = 0;
for (const sp of SPECIES_ORDER) {
  const st = { species: sp, fur: Object.assign({}, SPECIES[sp].pals[0]), expr: 'tongue' };
  const svg = drawMouth(st, furColors(st));
  const m = svg.match(/<path d="([^"]+)" fill="#ff8aa5"/);
  if (!m) { fails++; console.log('FAIL', sp, 'no tongue drawn'); continue; }
  const v = m[1].match(/-?\d+(\.\d+)?/g).map(Number);
  const c = noseInfo(st).my + 6;
  // sample the tongue outline densely (M / Q segments, absolute)
  const pts = [];
  const cmds = m[1].match(/[MQLZ][^MQLZ]*/g);
  let cur = null;
  for (const cmd of cmds) {
    const n = (cmd.slice(1).match(/-?\d+(\.\d+)?/g) || []).map(Number);
    if (cmd[0] === 'M' || cmd[0] === 'L') { cur = [n[0], n[1]]; pts.push(cur); }
    else if (cmd[0] === 'Q') for (let k = 0; k + 3 < n.length + 1; k += 4) {
      const b = [n[k], n[k + 1]], d = [n[k + 2], n[k + 3]];
      for (let i = 1; i <= 40; i++) { const t = i / 40, u = 1 - t; pts.push([u * u * cur[0] + 2 * u * t * b[0] + t * t * d[0], u * u * cur[1] + 2 * u * t * b[1] + t * t * d[1]]); }
      cur = d;
    }
  }
  let worst = 0;
  for (const [x, y] of pts) { const oy = omegaY(c, x); if (oy !== null) worst = Math.max(worst, oy - y); }
  checked++;
  if (worst > .4) { fails++; console.log('FAIL', sp, `tongue pokes ${worst.toFixed(1)} above the mouth line`); }
}
console.log(`${checked} species checked, ${fails} problems`);
process.exitCode = fails ? 1 : 0;
