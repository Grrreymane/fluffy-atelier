// regression scan: every item on every species/body/pose, plus random full outfits; flags NaN/undefined/exceptions
const C = require(__dirname + '/../dist/core.js');
const sps = C.SPECIES_ORDER, bodies = Object.keys(C.BODIES), poses = C.POSES.map(p => p.id || p);
const slots = Object.keys(C.ITEMS);
let n = 0; const bad = []; const t0 = Date.now();
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = a => a[Math.floor(rnd() * a.length)];
const mk = (s, b, pose, wear, hair = 'none', back = 'none') => { const p = C.SPECIES[s].pals[0]; return { species: s, fur: Object.assign({}, p), body: b, pose, expr: 'smile', eyes: { style: 'sparkle', color: p.eye }, hair: { id: hair }, backHair: { id: back }, wear }; };
const check = (st, tag) => { try { const svg = C.renderCharacter(st, { id: 'r' + n, noAnim: true }); if (/NaN|undefined|Infinity/.test(svg)) bad.push(tag); } catch (e) { bad.push(tag + ' ! ' + e.message); } n++; };
for (const s of sps) for (const b of bodies) for (const pose of poses) for (const slot of slots) for (const it of C.ITEMS[slot]) {
  const wear = { top: { id: 'tee' }, bottom: { id: 'jeans' } }; if (slot === 'dress') { delete wear.top; delete wear.bottom; } wear[slot] = { id: it.id };
  check(mk(s, b, pose, wear), [s, b, pose, slot, it.id].join('/'));
}
const hairs = C.HAIRS.map(h => h.id), backs = C.BACK_HAIRS.map(h => h.id);
for (let i = 0; i < 3000; i++) {
  const wear = {};
  for (const slot of slots) if (rnd() < (slot === 'dress' ? .15 : .6)) wear[slot] = { id: pick(C.ITEMS[slot]).id, pat: rnd() < .3 ? pick(C.PATTERNS).id : undefined };
  if (wear.dress) { delete wear.top; delete wear.bottom; }
  check(mk(pick(sps), pick(bodies), pick(poses), wear, pick(hairs), pick(backs)), 'rand' + i);
}
// every front x back hair on every species, body and pose, with and without a covering hat
for (const s of sps) for (const b of bodies) for (const pose of poses) for (const h of hairs) for (const bk of backs) {
  const wear = { top: { id: 'tee' }, bottom: { id: 'jeans' } }; if ((h + bk).length % 3 === 0) wear.hat = { id: 'beanie' };
  check(mk(s, b, pose, wear, h, bk), [s, b, pose, h, bk].join('/'));
}
console.log('renders', n, 'bad', bad.length, bad.slice(0, 10), 'avg ms', ((Date.now() - t0) / n).toFixed(2));
