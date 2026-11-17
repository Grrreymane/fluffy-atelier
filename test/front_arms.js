// 捧手 / 捧花 ('front' arms): the upper arm must hang down the side of the body like a hanging arm, and the arm may only
// come in front of the clothes from the elbow down. If the upper arm lies across the side of the body, the place where
// it switches from behind the clothes to in front of them shows as a stray cut line under the sleeve (the bug).
// usage: node test/front_arms.js [dist/core.js]
const fs = require('fs'), vm = require('vm');
const file = process.argv[2] || __dirname + '/../dist/core.js';
const sb = { module: {}, console };
vm.createContext(sb);
vm.runInContext(fs.readFileSync(file, 'utf8') + '\n;this.T = { buildGeom, frontSplit, torsoHalfAt, armShape, ITEM_INDEX, BODIES, CX };', sb);
const { buildGeom, frontSplit, torsoHalfAt, armShape, ITEM_INDEX, BODIES, CX } = sb.T;
// the paw outline as a polygon (the points of its path), and the gap between two of them (0 when they overlap)
const poly = d => { const v = d.match(/-?\d+(\.\d+)?/g).map(Number), out = []; for (let i = 0; i + 1 < v.length; i += 2) out.push([v[i], v[i + 1]]); return out; };
const inside = (P, [x, y]) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
const segDist = ([px, py], [ax, ay], [bx, by]) => { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l)); return Math.hypot(px - ax - t * dx, py - ay - t * dy); };
function pawGap(da, db) {
  const A = poly(da), B = poly(db);
  if (A.some(p => inside(B, p)) || B.some(p => inside(A, p))) return 0;
  let m = Infinity;
  for (const p of A) for (let i = 0; i < B.length; i++) m = Math.min(m, segDist(p, B[i], B[(i + 1) % B.length]));
  return m;
}

const outfits = {
  tee: { top: { id: 'tee' }, bottom: { id: 'jeans' } },
  magical: { dress: { id: 'magical' } },
  blouse: { top: { id: 'blouse' }, bottom: { id: 'aline' } },
  ocbd: { top: { id: 'ocbd' }, bottom: { id: 'chinos' } },
  cami: { top: { id: 'cami' }, bottom: { id: 'aline' } },
  blazer: { top: { id: 'ocbd' }, bottom: { id: 'chinos' }, outer: { id: 'blazer' } },
  puffer: { top: { id: 'hoodie' }, bottom: { id: 'jeans' }, outer: { id: 'puffer' } },
};
// the widest sleeve that reaches down to the elbow, and how far the garment body stands off the torso
function clothesAtElbow(w) {
  let body = 2.5, sleeve = 0;
  for (const s of ['top', 'dress', 'outer']) {
    const def = w[s] && ITEM_INDEX[s][w[s].id];
    if (!def) continue;
    if (s === 'outer') body = Math.max(body, (def.sleeve ? def.sleeve.ease : 4) + 2);
    if (def.sleeve && def.sleeve.len > .45) sleeve = Math.max(sleeve, def.sleeve.ease + (def.sleeve.flare || 0));
  }
  return { body, sleeve };
}
let fails = 0, checks = 0;
const fail = (tag, msg) => { fails++; if (fails <= 12) console.log('FAIL', tag, msg); };
for (const body of Object.keys(BODIES)) for (const [oid, wear] of Object.entries(outfits)) for (const held of [null, 'bouquet']) {
  const w = Object.assign({}, wear); if (held) w.held = { id: held };
  const st = { species: 'fox', body, pose: held ? 'stand' : 'hold', wear: w };
  const K = buildGeom(st), tag = [body, oid, held || 'hold'].join('/');
  const cl = clothesAtElbow(w);
  for (const arm of [K.armL, K.armR]) {
    checks++;
    if (arm.cfg !== 'front') { fail(tag, 'arm is ' + arm.cfg); continue; }
    const { S, E, side } = arm, L1 = Math.hypot(E.x - S.x, E.y - S.y);
    // 1. the elbow is clear of the torso and the clothes (fur half-width at the elbow is K.arm - .9)
    const inner = side * (E.x - CX) - (K.arm - .9) - cl.sleeve, need = torsoHalfAt(K, E.y) + cl.body;
    if (inner < need - .01) fail(tag, `elbow overlaps the body: inner edge ${inner.toFixed(1)} < ${need.toFixed(1)}`);
    // 2. the upper arm hangs down (does not swing in towards the middle)
    if (side * (E.x - S.x) < -.01) fail(tag, 'upper arm swings inwards');
    // 3. the front pass starts at the elbow, not under the armpit
    const s = frontSplit(arm, K);
    if (s < L1 - 4) fail(tag, `front pass starts ${(L1 - s).toFixed(0)} above the elbow`);
  }
  // 4. the paws meet in front (touch or overlap); a round body in a thick coat may rest them apart on its tummy
  checks++;
  const gap = pawGap(armShape(K.armL, K).pawFill, armShape(K.armR, K).pawFill);
  if (gap > (body === 'chub' && wear.outer ? 40 : 3)) fail(tag, `paws ${gap.toFixed(1)} apart`);
}
console.log(`${checks} arms and hand pairs checked, ${fails} problems`);
process.exitCode = fails ? 1 : 0;
