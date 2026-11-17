// Promo video director for record_game_video (1GP MCP). root = pub/ (copy of dist/game.html).
// The game is DOM + SVG, so each shot is re-drawn on a 1080x1920 canvas from the game's own
// renderScene / renderCharacter / itemThumb / headThumb / evaluate. Player saves are never touched
// (S is swapped in memory only, save() is never called).
// Shots: A dress up item by item -> B swap species -> C quick outfit cuts -> D theme challenge score -> E title.
(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  while (typeof renderCharacter !== 'function' || typeof S === 'undefined') { if (REC.advance) REC.advance(16); await sleep(10); }
  const FPS = 30, SECONDS = /quick/.test(REC.arg || '') ? 4 : 15.5;
  const W = REC.width || 1080, H = REC.height || 1920, K = W / 1080;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d');

  // fixed seed: same video every take
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  Math.random = rnd;

  const FONT = '"ZCOOL KuaiLe","PingFang SC","Microsoft YaHei",sans-serif';
  try { await document.fonts.load('100px "ZCOOL KuaiLe"', '一件穿上身'); } catch (e) { /* fallback font */ }

  const toImg = svg => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.includes('xmlns=') ? svg : svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')); });
  const sizeSvg = (svg, w, h) => svg.replace('<svg ', `<svg width="${w}" height="${h}" `);
  const bgCache = {};
  const bgImg = async id => bgCache[id] || (bgCache[id] = await toImg(sizeSvg(renderScene(id, 'bg' + id, { noAnim: true }), W, H)));
  let cid = 0;
  const charImg = st => toImg(sizeSvg(renderCharacter(st, { id: 'rc' + (++cid), noAnim: true }), 800, 1440));
  const thumbImg = svg => toImg(sizeSvg(svg, 400, 400));

  const base = clone(S);
  const mk = (sp, pal, body, wear, extra = {}) => {
    const fur = palOf(sp, pal);
    return Object.assign(clone(base), { species: sp, palIdx: pal, fur, body, pose: 'stand', expr: 'smile', eyes: { style: body === 'boy' ? 'boy' : 'round', color: fur.eye }, hair: { id: 'none', color: fur.hair || fur.main }, backHair: { id: 'none' }, wear: clone(wear), mem: {} }, extra);
  };

  /* ---- A: dress up item by item ---- */
  const ivy = PRESETS[0].wear;
  const A0 = { top: ivy.top, bottom: ivy.bottom, socks: ivy.socks, shoes: ivy.shoes };
  const addSeq = [['outer', 'blazer'], ['neck', 'tie'], ['held', 'books'], ['glasses', 'round']];
  const Astates = [mk('fox', 0, 'boy', A0)];
  for (const [slot, id] of addSeq) { const s = clone(Astates[Astates.length - 1]); s.wear[slot] = { id }; Astates.push(s); }
  Astates[4].expr = 'grin';
  const Achars = []; for (const s of Astates) Achars.push(await charImg(s));
  S = clone(Astates[4]);
  const Atiles = [];
  for (const [slot, id] of addSeq) Atiles.push({ img: await thumbImg(itemThumb(slot, id)), name: ITEM_INDEX[slot][id].name });

  /* ---- B: swap species ---- */
  const full = Astates[4].wear;
  const Bspec = [['bunny', 1, 'girl', 'shy'], ['cat', 2, 'girl', 'smile'], ['wolf', 0, 'boy', 'fang'], ['bear', 1, 'chub', 'grin'], ['deer', 0, 'girl', 'wow'], ['tiger', 0, 'boy', 'cool'], ['fox', 3, 'girl', 'tongue']];
  const Bstates = Bspec.map(([sp, p, b, e]) => mk(sp, p, b, full, { expr: e }));
  const Bchars = []; for (const s of Bstates) Bchars.push(await charImg(s));
  const Bheads = []; for (const s of Bstates) Bheads.push(await toImg(sizeSvg(headThumb(s), 300, 348)));

  /* ---- C: quick outfit cuts (real presets, with their scenes and poses) ---- */
  const Cpick = [[1, 'bear', 0, 'chub', 'grin'], [6, 'cat', 1, 'girl', 'smile'], [3, 'wolf', 2, 'boy', 'cool'], [11, 'deer', 1, 'girl', 'smile'], [9, 'tiger', 1, 'boy', 'grin'], [4, 'fox', 2, 'boy', 'smile']];
  const Cshots = [];
  for (const [pi, sp, p, b, e] of Cpick) { const pr = PRESETS[pi]; const st = mk(sp, p, b, pr.wear, { expr: e, pose: pr.pose }); Cshots.push({ img: await charImg(st), bg: await bgImg(pr.bg) }); }

  /* ---- D: theme challenge, real score from the game's evaluate() ---- */
  const theme = THEMES.find(t => t.name === '魔法舞会');
  const pr = PRESETS.find(p => p.name === '魔法少女');
  const Dst = mk('bunny', 0, 'girl', pr.wear, { pose: pr.pose, expr: 'wow', eyes: { style: 'sparkle', color: '#b07cff' }, hair: { id: 'cloud', color: '#fbf7f3' }, backHair: { id: 'wavy' }, bg: 'starry' });
  S = clone(Dst);
  const R = evaluate(theme);
  const Dscores = JUDGES.map(j => clamp(Math.round(j.score(R) * 100) / 10, 2, 10));
  const Dgrade = R.total >= 90 ? 'S · 时尚教主' : R.total >= 80 ? 'A · 潮流达人' : R.total >= 65 ? 'B · 搭配新星' : 'C · 继续加油';
  const Dstars = R.total >= 90 ? 5 : R.total >= 80 ? 4 : R.total >= 65 ? 3 : 2;
  REC.log(`challenge total ${R.total}, judges ${Dscores.join(' / ')}`);
  const Dchar = await charImg(Dst);
  const Djudges = []; for (let i = 0; i < JUDGES.length; i++) Djudges.push(await toImg(sizeSvg(judgeAvatar(JUDGES[i], i), 300, 300)));
  const bgs = { campus: await bgImg('campus'), city: await bgImg('city'), starry: await bgImg('starry'), sakura: await bgImg('sakura'), dreamy: await bgImg('dreamy') };
  S = clone(base);

  /* ---------- drawing helpers ---------- */
  const ease = k => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);
  const pop = k => { k = Math.min(1, Math.max(0, k)); return k < .6 ? ease(k / .6) * 1.15 : 1.15 - .15 * ease((k - .6) / .4); };
  const rr = (x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
  function cover(img) { c.drawImage(img, 0, 0, W, H); }
  // character: cx = center x, by = feet y, h = height; squash bounce for 0.25s after a change
  function drawChar(img, cx, by, h, since = 9) {
    const b = since < .28 ? Math.sin(since / .28 * Math.PI) : 0;
    const sx = 1 + .05 * b, sy = 1 - .06 * b, w = h * 400 / 720;
    c.save(); c.translate(cx, by);
    c.fillStyle = 'rgba(43,20,60,.22)'; c.beginPath(); c.ellipse(0, -h * .015, w * .36, h * .035, 0, 0, 7); c.fill();
    c.scale(sx, sy); c.drawImage(img, -w / 2, -h * .98, w, h); c.restore();
  }
  const sparks = [];
  function burst(x, y, n = 12) { const cols = ['#ffd56b', '#ff8fab', '#ffffff', '#9fe3ff', '#c4b0f0']; for (let i = 0; i < n; i++) { const a = rnd() * 6.283, d = (120 + rnd() * 160) * K; sparks.push({ x, y, dx: Math.cos(a) * d, dy: Math.sin(a) * d, t0: T, col: cols[i % 5], s: (18 + rnd() * 18) * K }); } }
  function star(x, y, s) { c.beginPath(); c.moveTo(x, y - s); c.quadraticCurveTo(x + s * .12, y - s * .12, x + s, y); c.quadraticCurveTo(x + s * .12, y + s * .12, x, y + s); c.quadraticCurveTo(x - s * .12, y + s * .12, x - s, y); c.quadraticCurveTo(x - s * .12, y - s * .12, x, y - s); c.fill(); }
  function drawSparks() {
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i], k = (T - p.t0) / .7; if (k >= 1) { sparks.splice(i, 1); continue; }
      const e = ease(k); c.globalAlpha = 1 - k; c.fillStyle = p.col; star(p.x + p.dx * e, p.y + p.dy * e, p.s * (1 - k * .5));
    }
    c.globalAlpha = 1;
  }
  const confs = [];
  function confetti(n) { const cols = ['#ee4a72', '#ffd56b', '#7cc37a', '#9fe3ff', '#c4b0f0', '#ff9a5c']; for (let i = 0; i < n; i++) confs.push({ x: rnd() * W, y: -40 - rnd() * 500 * K, vx: (rnd() - .5) * 120 * K, vy: (500 + rnd() * 500) * K, r: rnd() * 6, vr: (rnd() - .5) * 12, col: cols[i % 6], round: rnd() < .4 }); }
  function drawConfetti(dt) {
    for (const p of confs) { p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.col; if (p.round) { c.beginPath(); c.arc(0, 0, 11 * K, 0, 7); c.fill(); } else c.fillRect(-10 * K, -15 * K, 20 * K, 30 * K); c.restore(); }
  }
  // caption: small lead line, then the punch line pops 0.17s later
  function caption(small, big, t0, y = 230) {
    const k = T - t0; if (k < 0) return;
    c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round';
    const a1 = Math.min(1, k / .15);
    c.globalAlpha = a1; c.font = `${64 * K}px ${FONT}`; c.lineWidth = 14 * K; c.strokeStyle = '#3b2150'; c.fillStyle = '#fff';
    c.strokeText(small, W / 2, y * K - 10 * K * (1 - a1)); c.fillText(small, W / 2, y * K - 10 * K * (1 - a1));
    c.globalAlpha = 1;
    const k2 = k - .17; if (k2 < 0) return;
    const s = pop(k2 / .3);
    c.save(); c.translate(W / 2, (y + 140) * K); c.scale(s, s);
    c.font = `${132 * K}px ${FONT}`; c.lineWidth = 26 * K; c.strokeStyle = '#3b2150'; c.strokeText(big, 0, 0);
    c.fillStyle = '#ffd56b'; c.fillText(big, 0, 0); c.restore();
  }
  function panel(y0) {
    c.fillStyle = 'rgba(43,20,60,.18)'; rr(0, y0 - 8 * K, W, H, 56 * K); c.fill();
    c.fillStyle = '#e9f6ef'; rr(0, y0, W, H, 56 * K); c.fill();
    c.fillStyle = '#c9b8d6'; rr(W / 2 - 50 * K, y0 + 22 * K, 100 * K, 10 * K, 5 * K); c.fill();
  }
  function tile(x, y, w, h, img, label, on, press) {
    const s = 1 - .06 * press;
    c.save(); c.translate(x + w / 2, y + h / 2); c.scale(s, s); c.translate(-w / 2, -h / 2);
    c.fillStyle = 'rgba(59,33,80,.16)'; rr(0, 8 * K, w, h, 30 * K); c.fill();
    c.fillStyle = '#fffaf3'; rr(0, 0, w, h, 30 * K); c.fill();
    if (on) { c.lineWidth = 9 * K; c.strokeStyle = '#ee4a72'; rr(0, 0, w, h, 30 * K); c.stroke(); }
    const iw = w * .86, ih = label ? h * .7 : h * .86; const m = Math.min(iw, ih);
    c.drawImage(img, (w - m) / 2, label ? 18 * K : (h - m) / 2, m, m);
    if (label) { c.fillStyle = on ? '#ee4a72' : '#3b2150'; c.font = `${38 * K}px ${FONT}`; c.textAlign = 'center'; c.fillText(label.length > 5 ? label.slice(0, 5) : label, w / 2, h - 30 * K); }
    c.restore();
  }
  function ripple(x, y, k) {
    if (k < 0 || k > 1) return;
    c.globalAlpha = (1 - k) * .9; c.lineWidth = 10 * K; c.strokeStyle = '#ffffff';
    c.beginPath(); c.arc(x, y, (40 + 90 * ease(k)) * K, 0, 7); c.stroke();
    c.globalAlpha = (1 - k) * .55; c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x, y, 42 * K, 0, 7); c.fill(); c.globalAlpha = 1;
  }

  /* ---------- timeline ---------- */
  const TA = 0, TB = 3.5, TC = 7.4, TD = 10.3, TE = 13.6;
  const tapsA = [.45, 1.1, 1.75, 2.4];
  const swapB = Bstates.map((_, i) => TB + .35 + i * .45);
  const cutC = Cshots.map((_, i) => TC + i * .48);
  const fired = new Set();
  const once = (key, fn) => { if (!fired.has(key)) { fired.add(key); fn(); } };
  let T = 0, lastT = 0;

  function shotA() {
    cover(bgs.campus);
    let n = 0; tapsA.forEach(t => { if (T >= TA + t + .12) n++; });
    const since = n ? T - (TA + tapsA[n - 1] + .12) : 9;
    drawChar(Achars[n], W / 2, 1415 * K, 1040 * K, since);
    panel(1430 * K);
    const tw = 228 * K, th = 300 * K, gap = (W - 4 * tw) / 5;
    tapsA.forEach((t, i) => {
      const x = gap + i * (tw + gap), y = 1530 * K, k = T - (TA + t);
      tile(x, y, tw, th, Atiles[i].img, Atiles[i].name, i < n, k >= 0 && k < .18 ? Math.sin(k / .18 * Math.PI) : 0);
      ripple(x + tw / 2, y + th / 2, k / .45);
      if (k >= .12) once('a' + i, () => { play('pop'); burst(W / 2, [740, 820, 980, 560][i] * K, 12); });
    });
    caption('一件一件', '穿上身', TA + .1);
  }
  function shotB() {
    cover(bgs.sakura);
    let n = -1; swapB.forEach(t => { if (T >= t + .12) n++; });
    const since = n >= 0 ? T - (swapB[n] + .12) : 9;
    drawChar(n >= 0 ? Bchars[n] : Achars[4], W / 2, 1415 * K, 1040 * K, since);
    panel(1430 * K);
    const cols = 7, tw = 140 * K, th = 164 * K, gap = (W - cols * tw) / (cols + 1);
    Bheads.forEach((img, i) => {
      const x = gap + i * (tw + gap), y = 1560 * K, k = T - swapB[i];
      tile(x, y, tw, th, img, '', i === n, k >= 0 && k < .18 ? Math.sin(k / .18 * Math.PI) : 0);
      ripple(x + tw / 2, y + th / 2, k / .4);
      if (k >= .12) once('b' + i, () => { play('tap'); play('swish'); burst(W / 2, 600 * K, 10); });
    });
    c.fillStyle = '#3b2150'; c.font = `${46 * K}px ${FONT}`; c.textAlign = 'center';
    c.fillText('兔子 · 猫 · 狼 · 熊 · 鹿 · 老虎 · 狐狸', W / 2, 1830 * K);
    caption('七种毛茸茸', '随便换', TB + .05);
  }
  function shotC() {
    let n = 0; cutC.forEach((t, i) => { if (T >= t) n = i; });
    const sh = Cshots[n]; cover(sh.bg);
    drawChar(sh.img, W / 2, 1840 * K, 1360 * K, T - cutC[n]);
    once('c' + n, () => { play('dice'); burst(W / 2, 700 * K, 10); });
    caption('148 件单品', '怎么搭都行', TC + .05);
  }
  function shotD() {
    cover(bgs.starry);
    drawChar(Dchar, W / 2, 1330 * K, 1060 * K, T - TD);
    once('d0', () => { play('ding'); burst(W / 2, 520 * K, 14); });
    // theme chip
    const k0 = T - TD;
    c.globalAlpha = Math.min(1, k0 / .2);
    c.fillStyle = '#fffaf3'; rr(W / 2 - 280 * K, 110 * K, 560 * K, 120 * K, 60 * K); c.fill();
    c.fillStyle = '#ee4a72'; c.font = `${40 * K}px ${FONT}`; c.textAlign = 'center'; c.fillText('主题挑战', W / 2, 160 * K);
    c.fillStyle = '#3b2150'; c.font = `${56 * K}px ${FONT}`; c.fillText(theme.name, W / 2, 216 * K);
    c.globalAlpha = 1;
    // score card slides up
    const ks = ease((T - TD - .5) / .35); if (ks <= 0) return;
    once('d1', () => { play('fanfare'); if (R.total >= 65) confetti(R.total >= 90 ? 90 : 50); });
    const y0 = H - (H - 1240 * K) * ks;
    c.fillStyle = 'rgba(43,20,60,.25)'; rr(40 * K, y0 + 10 * K, W - 80 * K, 700 * K, 50 * K); c.fill();
    c.fillStyle = '#fffaf3'; rr(40 * K, y0, W - 80 * K, 700 * K, 50 * K); c.fill();
    const kk = T - TD - .8;
    JUDGES.forEach((j, i) => {
      const cx = W / 2 + (i - 1) * 320 * K;
      c.drawImage(Djudges[i], cx - 95 * K, y0 + 30 * K, 190 * K, 190 * K);
      c.fillStyle = '#8a7399'; c.font = `${36 * K}px ${FONT}`; c.textAlign = 'center'; c.fillText(j.name, cx, y0 + 262 * K);
      const v = Dscores[i] * ease(Math.max(0, kk - i * .12) / .7);
      c.fillStyle = '#ee4a72'; c.font = `${76 * K}px ${FONT}`; c.fillText(v.toFixed(1), cx, y0 + 345 * K);
    });
    const tot = Math.round(R.total * ease(Math.max(0, kk) / 1.1));
    c.fillStyle = '#3b2150'; c.font = `${150 * K}px ${FONT}`; c.textAlign = 'right'; c.fillText(String(tot), W / 2 + 40 * K, y0 + 520 * K);
    c.font = `${54 * K}px ${FONT}`; c.textAlign = 'left'; c.fillStyle = '#8a7399'; c.fillText('/ 100', W / 2 + 60 * K, y0 + 520 * K);
    const kg = kk - 1.1;
    if (kg > 0) {
      once('d2', () => play('ding'));
      const s = pop(kg / .3); c.save(); c.translate(W / 2, y0 + 625 * K); c.scale(s, s);
      c.fillStyle = '#ee4a72'; rr(-230 * K, -52 * K, 460 * K, 84 * K, 42 * K); c.fill();
      c.fillStyle = '#fff'; c.font = `${50 * K}px ${FONT}`; c.textAlign = 'center'; c.fillText(Dgrade, 0, 14 * K);
      c.restore();
      c.fillStyle = '#ffc23a'; for (let i = 0; i < Dstars; i++) { const sk = pop((kg - .1 - i * .1) / .25); if (sk > 0) star(W / 2 + (i - 2) * 92 * K, y0 - 40 * K + 0 * sk, 38 * K * sk); }
    }
  }
  function shotE() {
    cover(bgs.dreamy);
    const k = T - TE;
    once('e0', () => play('shutter'));
    // polaroid of the last look
    const s = .9 + .1 * ease(k / .4), pw = 760 * K, ph = 900 * K;
    c.save(); c.translate(W / 2, 1050 * K); c.rotate(-.04); c.scale(s, s);
    c.fillStyle = 'rgba(43,20,60,.25)'; c.fillRect(-pw / 2 + 14 * K, -ph / 2 + 18 * K, pw, ph); c.fillStyle = '#fffdf8'; c.fillRect(-pw / 2, -ph / 2, pw, ph);
    c.save(); c.beginPath(); c.rect(-pw / 2 + 40 * K, -ph / 2 + 40 * K, pw - 80 * K, 660 * K); c.clip();
    c.drawImage(bgs.starry, -pw / 2 + 40 * K - 200 * K, -ph / 2 + 40 * K - 300 * K, W, H);
    c.drawImage(Dchar, -235 * K, -ph / 2 + 50 * K, 470 * K, 846 * K); c.restore();
    c.fillStyle = '#3b2150'; c.font = `${72 * K}px ${FONT}`; c.textAlign = 'center'; c.fillText('绒绒时装屋', 0, ph / 2 - 80 * K);
    c.restore();
    // white flash fades out (single flash)
    if (k < .35) { c.fillStyle = `rgba(255,255,255,${.85 * (1 - k / .35)})`; c.fillRect(0, 0, W, H); }
    caption('今天的你', '想穿什么？', TE + .35, 200);
  }

  REC.run({
    fps: FPS, seconds: SECONDS, canvas: cv, audio: true,
    async setup(a) { AC = a; ac = () => AC; UI.sound = true; },
    step(i, t) {
      T = t; const dt = t - lastT; lastT = t;
      c.clearRect(0, 0, W, H);
      if (T < TB) shotA(); else if (T < TC) shotB(); else if (T < TD) shotC(); else if (T < TE) shotD(); else shotE();
      drawSparks(); drawConfetti(dt);
      if (/shots/.test(REC.arg || '') && i % 15 === 0) REC.shot('f' + String(i).padStart(3, '0'), cv);
      // fade in from black at start, fade at the very end
      if (T < .12) { c.fillStyle = `rgba(43,26,58,${1 - T / .12})`; c.fillRect(0, 0, W, H); }
    },
  });
})();
