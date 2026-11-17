/* ===== scenes.js — backgrounds (viewBox 0 0 400 500) ===== */
const SCENES = [];
function sceneDef(id, name, tags, draw) { SCENES.push({ id, name, tags, draw }); }
const lg = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
const rg = (id, stops, cx = .5, cy = .5, r = .5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`;
function renderScene(id, P = 'bg', o = {}) {
  const sc = SCENES.find(s => s.id === id) || SCENES[0];
  const vb = o.viewBox || '0 0 400 500';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="xMidYMid slice"${o.wh ? ` width="${o.wh[0]}" height="${o.wh[1]}"` : ''}${o.noAnim ? '' : ' class="scene"'}>${sc.draw(P + '-' + sc.id)}</svg>`;
}
function sparkles(n, seed, area, col = '#fff', cls = 'tw') {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const x = area[0] + r() * area[2], y = area[1] + r() * area[3], sz = 1.5 + r() * 3.5;
    s += path(starD(x, y, sz, .35, 4), { fill: col, class: cls, style: `animation-delay:${(r() * 3).toFixed(2)}s` });
  }
  return s;
}
function falling(n, seed, shape, cls = 'fall') {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const x = r() * 400, y = r() * 480, d = (6 + r() * 7).toFixed(1), dl = (-r() * 12).toFixed(1);
    s += `<g class="${cls}" style="animation-duration:${d}s;animation-delay:${dl}s"><g transform="translate(${r1(x)},${r1(y)}) rotate(${Math.round(r() * 360)})">${shape(r)}</g></g>`;
  }
  return s;
}
const ground = (y, col, line) => path(`M0,${y}Q200,${y - 14} 400,${y}V500H0Z`, { fill: col }) + (line ? ln(`M0,${y}Q200,${y - 14} 400,${y}`, line, 2, { opacity: .5 }) : '');
const floorGlow = P => `<defs>${rg(P + 'fg', [[0, '#fff', .55], [1, '#fff', 0]])}</defs>` + ell(200, 452, 110, 22, { fill: `url(#${P}fg)` });

sceneDef('dreamy', '梦幻粉', ['cute', 'sweet', 'party', 'fantasy'], P => {
  let s = `<defs>${lg(P + 'g', [[0, '#cbb6ff'], [.55, '#ffc6e0'], [1, '#ffe8d6']])}</defs><rect width="400" height="500" fill="url(#${P}g)"/>`;
  const r = rng(3);
  for (let i = 0; i < 14; i++) s += circ(r() * 400, r() * 380, 16 + r() * 46, { fill: '#fff', opacity: (.08 + r() * .18).toFixed(2), class: 'flt', style: `animation-delay:${(r() * 5).toFixed(1)}s` });
  s += path('M60,500V250Q60,140 200,140Q340,140 340,250V500', { fill: '#fff', opacity: .22 }) + path('M80,500V256Q80,160 200,160Q320,160 320,256V500', { fill: 'none', stroke: '#fff', 'stroke-width': 3, opacity: .5 });
  return s + sparkles(26, 9, [0, 0, 400, 420]) + floorGlow(P);
});
sceneDef('sakura', '樱花公园', ['nature', 'sweet', 'cute', 'casual', 'summer'], P => {
  let s = `<defs>${lg(P + 'sky', [[0, '#9fd8ff'], [.7, '#ffe1ee'], [1, '#fff3e8']])}</defs><rect width="400" height="500" fill="url(#${P}sky)"/>`;
  s += path('M0,360Q90,300 180,350Q280,290 400,340V500H0Z', { fill: '#bfe3c0' }) + path('M0,390Q120,350 240,385Q330,360 400,380V500H0Z', { fill: '#a6d6a6' });
  const tree = (x, y, sc) => { let t = path(`M${x - 6 * sc},${y}L${x - 3 * sc},${y - 70 * sc}Q${x - 20 * sc},${y - 100 * sc} ${x - 34 * sc},${y - 110 * sc}M${x},${y - 60 * sc}Q${x + 16 * sc},${y - 90 * sc} ${x + 30 * sc},${y - 104 * sc}`, { fill: 'none', stroke: '#8a5a4a', 'stroke-width': 7 * sc, 'stroke-linecap': 'round' }) + path(`M${x - 7 * sc},${y}L${x - 4 * sc},${y - 70 * sc}L${x + 4 * sc},${y - 70 * sc}L${x + 7 * sc},${y}Z`, { fill: '#8a5a4a' }); const r = rng(Math.round(x)); for (let i = 0; i < 9; i++) t += circ(x + (r() - .5) * 110 * sc, y - 110 * sc + (r() - .5) * 60 * sc, (22 + r() * 18) * sc, { fill: i % 3 ? '#ffb7cf' : '#ffd1e1' }); return t; };
  s += tree(40, 380, 1.1) + tree(370, 370, 1.2) + tree(300, 350, .7);
  s += ground(440, '#95cf95', '#6aa86a');
  return s + falling(22, 21, () => path('M0,0q4,-6 8,0q-4,6 -8,0z', { fill: '#ffb7cf' })) + floorGlow(P);
});
sceneDef('starry', '星空之夜', ['fantasy', 'cool', 'elegant', 'party', 'winter'], P => {
  let s = `<defs>${lg(P + 'n', [[0, '#141a46'], [.6, '#3a2f7a'], [1, '#7a4f9e']])}${rg(P + 'm', [[0, '#fff7d6'], [1, '#fff7d6', 0]])}</defs><rect width="400" height="500" fill="url(#${P}n)"/>`;
  const r = rng(5);
  for (let i = 0; i < 70; i++) s += circ(r() * 400, r() * 380, .6 + r() * 1.4, { fill: '#fff', class: 'tw', style: `animation-delay:${(r() * 4).toFixed(1)}s` });
  s += circ(318, 92, 60, { fill: `url(#${P}m)`, opacity: .6 }) + circ(318, 92, 30, { fill: '#fff4c4' }) + circ(330, 84, 26, { fill: '#2a2a66' });
  s += path('M0,400Q80,340 170,380Q250,330 400,370V500H0Z', { fill: '#2a2457' }) + ground(440, '#1d1a40');
  return s + sparkles(10, 3, [0, 0, 400, 300], '#fff6c9') + floorGlow(P);
});
sceneDef('beach', '夏日海滩', ['summer', 'casual', 'sporty', 'nature'], P => {
  let s = `<defs>${lg(P + 's', [[0, '#5cc8f2'], [.6, '#bdeeff'], [1, '#fff4d6']])}</defs><rect width="400" height="500" fill="url(#${P}s)"/>`;
  s += circ(80, 90, 34, { fill: '#fff3a8' }) + circ(80, 90, 50, { fill: '#fff3a8', opacity: .3 });
  s += path('M0,300H400V400H0Z', { fill: '#3bb3d6' }) + path('M0,300H400V312H0Z', { fill: '#7fd6ee' });
  for (let y = 322; y < 390; y += 16) s += ln(`M${(y * 7) % 40},${y}q12,-6 24,0t24,0M${(y * 7) % 40 + 140},${y}q12,-6 24,0t24,0M${(y * 7) % 40 + 280},${y}q12,-6 24,0t24,0`, '#fff', 2, { opacity: .6 });
  s += path('M0,392Q200,370 400,392V500H0Z', { fill: '#f6dfa8' }) + path('M0,392Q100,384 200,390Q300,382 400,392', { fill: 'none', stroke: '#fff', 'stroke-width': 4, opacity: .8 });
  const palm = `M352,420Q346,340 360,280`;
  s += ln(palm, '#8a5a3a', 9) + [[-60, 20], [-20, -30], [30, -26], [60, 16], [0, 36]].map(([dx, dy]) => path(`M360,280Q${360 + dx / 2},${280 + dy / 2 - 20} ${360 + dx},${280 + dy}Q${360 + dx / 2},${280 + dy / 2} 360,282Z`, { fill: '#3fa34d', stroke: '#2a7a35', 'stroke-width': 2 })).join('');
  s += path('M40,412L44,380L90,372L86,404Z', { fill: '#ff6f91', opacity: .9 }) + ln('M60,390L64,440', '#fff', 3);
  return s + floorGlow(P);
});
sceneDef('room', '温馨卧室', ['cute', 'casual', 'sweet', 'winter'], P => {
  let s = `<defs>${lg(P + 'w', [[0, '#ffe9e1'], [1, '#ffd9cf']])}</defs><rect width="400" height="500" fill="url(#${P}w)"/>`;
  for (let x = 0; x < 400; x += 28) s += path(`M${x},0h12v380h-12z`, { fill: '#fff', opacity: .35 });
  s += path('M240,70h120v150h-120z', { fill: '#b8e4ff', stroke: '#fff', 'stroke-width': 8 }) + ln('M300,70V220M240,145H360', '#fff', 5) + circ(330, 110, 12, { fill: '#fff', opacity: .8 });
  s += path('M226,60Q244,140 230,236L252,236Q246,140 256,60Z', { fill: '#ff9fb6' }) + path('M374,60Q356,140 370,236L348,236Q354,140 344,60Z', { fill: '#ff9fb6' }) + ln('M220,60H380', '#c97a8a', 4);
  s += path('M40,90h70v56h-70z', { fill: '#fff', stroke: '#e8a7b4', 'stroke-width': 5 }) + circ(75, 118, 14, { fill: '#ffd166' }) + path('M52,138l16,-16l14,10l12,-14l12,20z', { fill: '#7cc37a' });
  s += path('M0,380H400V500H0Z', { fill: '#d9a77c' }); for (let x = -20; x < 400; x += 46) s += ln(`M${x},380L${x - 30},500`, '#c08a5c', 2);
  s += ell(200, 455, 150, 30, { fill: '#c7b8ff' }) + ell(200, 455, 130, 22, { fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-dasharray': '6 5' });
  s += path('M24,380V300q0,-12 14,-12h20q14,0 14,12v80z', { fill: '#8bd17c', stroke: '#5a9a50', 'stroke-width': 2 }) + path('M30,380h36l-4,-34h-28z', { fill: '#e8a07a' });
  return s + sparkles(8, 4, [0, 0, 400, 300], '#fff');
});
sceneDef('city', '霓虹都市', ['street', 'cool', 'party', 'sporty'], P => {
  let s = `<defs>${lg(P + 'd', [[0, '#2b1a5a'], [.55, '#8a3fa0'], [1, '#ff9a76']])}</defs><rect width="400" height="500" fill="url(#${P}d)"/>`;
  const r = rng(8);
  const bld = (x, w, h, c) => { let b = path(`M${x},${400 - h}h${w}V400h${-w}z`, { fill: c }); for (let yy = 400 - h + 12; yy < 390; yy += 16) for (let xx = x + 6; xx < x + w - 8; xx += 12) if (r() > .45) b += path(`M${xx},${yy}h6v8h-6z`, { fill: r() > .5 ? '#ffe28a' : '#8af3ff', opacity: .85 }); return b; };
  s += bld(-10, 70, 230, '#2a1f4f') + bld(66, 60, 290, '#33275e') + bld(130, 70, 200, '#271d4a') + bld(206, 54, 260, '#33275e') + bld(266, 80, 210, '#2a1f4f') + bld(350, 60, 300, '#33275e');
  s += path('M80,170h40v18h-40z', { fill: 'none', stroke: '#ff5fa2', 'stroke-width': 3 }) + circ(230, 190, 12, { fill: 'none', stroke: '#5ff3ff', 'stroke-width': 3 }) + path('M290,230l10,-16l10,16z', { fill: 'none', stroke: '#ffe85f', 'stroke-width': 3 });
  s += path('M0,400H400V500H0Z', { fill: '#1f1838' }) + ln('M0,450H400', '#ff5fa2', 2, { opacity: .4 }) + ln('M0,470H400', '#5ff3ff', 2, { opacity: .3 });
  return s + floorGlow(P);
});
sceneDef('forest', '魔法森林', ['nature', 'fantasy', 'cute', 'autumn'], P => {
  let s = `<defs>${lg(P + 'f', [[0, '#2f6f6a'], [.6, '#5fa88a'], [1, '#c8e8b0']])}${rg(P + 'ff', [[0, '#fffbb0'], [1, '#fffbb0', 0]])}</defs><rect width="400" height="500" fill="url(#${P}f)"/>`;
  const tree = (x, h, w, c) => path(`M${x - 5},400V${400 - h * .4}h10V400z`, { fill: '#5a3e2e' }) + path(`M${x},${400 - h}L${x + w},${400 - h * .35}H${x - w}Z`, { fill: c }) + path(`M${x},${400 - h * .8}L${x + w * 1.2},${400 - h * .15}H${x - w * 1.2}Z`, { fill: c });
  s += tree(30, 300, 40, '#2a5a4e') + tree(120, 240, 34, '#336b58') + tree(300, 280, 38, '#2a5a4e') + tree(380, 250, 36, '#336b58');
  s += ground(420, '#7cbf6a', '#4f9a4a');
  const shroom = (x, y, sc, c) => path(`M${x - 4 * sc},${y}v${-12 * sc}h${8 * sc}v${12 * sc}z`, { fill: '#fff4e0' }) + path(`M${x - 14 * sc},${y - 10 * sc}Q${x},${y - 30 * sc} ${x + 14 * sc},${y - 10 * sc}Z`, { fill: c }) + circ(x - 5 * sc, y - 16 * sc, 2 * sc, { fill: '#fff' }) + circ(x + 5 * sc, y - 18 * sc, 1.6 * sc, { fill: '#fff' });
  s += shroom(60, 440, 1.4, '#e8485f') + shroom(84, 446, 1, '#ff8fab') + shroom(340, 444, 1.3, '#9b6ff0');
  const r = rng(12);
  for (let i = 0; i < 16; i++) { const x = r() * 400, y = 120 + r() * 300; s += circ(x, y, 9, { fill: `url(#${P}ff)`, class: 'flt', style: `animation-delay:${(r() * 4).toFixed(1)}s` }) + circ(x, y, 2, { fill: '#fffbb0', class: 'tw', style: `animation-delay:${(r() * 3).toFixed(1)}s` }); }
  return s + floorGlow(P);
});
sceneDef('runway', '时装T台', ['elegant', 'party', 'cool', 'classic'], P => {
  let s = `<defs>${lg(P + 'c', [[0, '#5a0f2a'], [1, '#2a0716']])}${lg(P + 'sp', [[0, '#fff6d6', .55], [1, '#fff6d6', 0]])}</defs><rect width="400" height="500" fill="url(#${P}c)"/>`;
  for (let x = 0; x < 400; x += 26) s += path(`M${x},0Q${x + 13},200 ${x},420`, { fill: 'none', stroke: '#7a1a3c', 'stroke-width': 10, opacity: .6 });
  s += path('M0,0H400V40Q200,70 0,40Z', { fill: '#8a1f3d' }) + ln('M0,40Q200,70 400,40', '#f2c75c', 3);
  s += path('M130,0L60,440H340L270,0Z', { fill: `url(#${P}sp)`, opacity: .8 });
  s += path('M0,400H400V500H0Z', { fill: '#1a0610' }) + path('M120,400H280L340,500H60Z', { fill: '#2e2a33' }) + ln('M120,400L60,500M280,400L340,500', '#f2c75c', 2);
  for (let i = 0; i < 6; i++) { s += circ(120 - i * 11, 410 + i * 18, 2.4, { fill: '#fff6c9', class: 'tw', style: `animation-delay:${i * .3}s` }) + circ(280 + i * 11, 410 + i * 18, 2.4, { fill: '#fff6c9', class: 'tw', style: `animation-delay:${i * .3 + .15}s` }); }
  return s + sparkles(14, 7, [0, 60, 400, 300], '#ffe9a8');
});
sceneDef('snow', '冬日雪景', ['winter', 'cute', 'nature', 'classic'], P => {
  let s = `<defs>${lg(P + 'w', [[0, '#a9c9f0'], [.7, '#e6f0ff'], [1, '#ffffff']])}</defs><rect width="400" height="500" fill="url(#${P}w)"/>`;
  const pine = (x, y, sc) => path(`M${x},${y - 120 * sc}L${x + 34 * sc},${y - 60 * sc}H${x + 18 * sc}L${x + 46 * sc},${y}H${x - 46 * sc}L${x - 18 * sc},${y - 60 * sc}H${x - 34 * sc}Z`, { fill: '#3f7a6a' }) + path(`M${x},${y - 120 * sc}L${x + 16 * sc},${y - 92 * sc}Q${x},${y - 84 * sc} ${x - 16 * sc},${y - 92 * sc}Z`, { fill: '#fff' }) + path(`M${x - 4 * sc},${y}h${8 * sc}v${14 * sc}h${-8 * sc}z`, { fill: '#6b4a3a' });
  s += path('M0,330Q100,290 220,320Q320,290 400,310V500H0Z', { fill: '#dbe8f8' });
  s += pine(46, 380, 1.3) + pine(110, 360, .8) + pine(330, 370, 1.1) + pine(386, 386, .9);
  s += ground(420, '#ffffff', '#c6d6ee');
  return s + falling(40, 31, r => circ(0, 0, 1.4 + r() * 2.6, { fill: '#fff' }), 'fall snowf') + floorGlow(P);
});
sceneDef('candy', '糖果乐园', ['cute', 'sweet', 'fantasy', 'party'], P => {
  let s = `<defs>${lg(P + 'c', [[0, '#bfefff'], [.6, '#ffe0f4'], [1, '#fff3c9']])}</defs><rect width="400" height="500" fill="url(#${P}c)"/>`;
  const rb = ['#ff9aa2', '#ffcf8a', '#fff2a0', '#b5ead7', '#a0c4ff', '#cdb4ff'];
  rb.forEach((c, i) => s += path(`M${-20 + i * 9},380A${220 - i * 9},${220 - i * 9} 0 0,1 ${420 - i * 9},380`, { fill: 'none', stroke: c, 'stroke-width': 9, opacity: .7 }));
  const cloud = (x, y, sc) => g(circ(0, 0, 22) + circ(24, -8, 26) + circ(50, 0, 20) + path('M-22,0h72v16h-72z'), { fill: '#fff', transform: `translate(${x},${y}) scale(${sc})`, class: 'drift' });
  s += cloud(40, 90, 1) + cloud(270, 60, .8);
  const lolly = (x, y, c) => ln(`M${x},${y}V${y + 120}`, '#fff', 5) + circ(x, y, 26, { fill: c, stroke: '#fff', 'stroke-width': 4 }) + path(`M${x},${y}m-18,0a18,18 0 0,1 18,-18a12,12 0 0,1 12,12a8,8 0 0,1 -8,8`, { fill: 'none', stroke: '#fff', 'stroke-width': 4 });
  s += lolly(54, 300, '#ff8fab') + lolly(350, 290, '#7ec4ff') + lolly(310, 340, '#ffd166');
  s += ground(420, '#ffd1e6', '#ff9fc8');
  return s + sparkles(16, 6, [0, 0, 400, 380], '#fff') + floorGlow(P);
});
sceneDef('campus', '常春藤校园', ['preppy', 'classic', 'vintage', 'autumn', 'office'], P => {
  let s = `<defs>${lg(P + 's', [[0, '#a8d4f2'], [1, '#f6efe0']])}</defs><rect width="400" height="500" fill="url(#${P}s)"/>`;
  s += path('M0,120H400V400H0Z', { fill: '#a8513a' });
  let bricks = '';
  for (let y = 124; y < 400; y += 10) for (let x = (y / 10) % 2 ? 0 : -12; x < 400; x += 24) bricks += `M${x},${y}h22`;
  s += ln(bricks, '#8a3f2c', 1, { opacity: .45 }) + path('M0,110H400V124H0Z', { fill: '#e8dcc6' });
  const win = x => path(`M${x},${300}V200Q${x + 30},170 ${x + 60},200V300Z`, { fill: '#e8f2ff', stroke: '#f3ead6', 'stroke-width': 6 }) + ln(`M${x + 30},180V300M${x},250H${x + 60}`, '#f3ead6', 4);
  s += win(30) + win(310);
  const r = rng(14); let ivy = '';
  for (let i = 0; i < 90; i++) { const side = i % 2 ? 0 : 1; const x = side ? 280 + r() * 120 : r() * 130, y = 110 + r() * 290 * (side ? 1 : .8); ivy += ell(x, y, 6, 4, { fill: r() > .5 ? '#3f7a3a' : '#5a9a48', transform: `rotate(${Math.round(r() * 180)} ${r1(x)} ${r1(y)})` }); }
  s += ivy + path('M0,400H400V500H0Z', { fill: '#8cc56f' }) + path('M150,400H250L280,500H120Z', { fill: '#d9c9a8' });
  s += falling(10, 41, () => path('M0,0q5,-7 10,0q-5,7 -10,0z', { fill: '#e8892c' }));
  return s + floorGlow(P);
});
sceneDef('workshop', '复古工坊', ['workwear', 'vintage', 'casual', 'cool'], P => {
  let s = `<defs>${lg(P + 'w', [[0, '#7a5232'], [1, '#5a3a24']])}${rg(P + 'l', [[0, '#ffe9b0', .7], [1, '#ffe9b0', 0]])}</defs><rect width="400" height="500" fill="url(#${P}w)"/>`;
  for (let x = 0; x < 400; x += 40) s += ln(`M${x},0V380`, '#4a2e1c', 2, { opacity: .6 });
  s += path('M40,60h130v100h-130z', { fill: '#c9a87a', stroke: '#4a2e1c', 'stroke-width': 3 });
  let peg = ''; for (let x = 50; x < 170; x += 14) for (let y = 70; y < 160; y += 14) peg += circ(x, y, 1.4, { fill: '#7a5a3a' }); s += peg;
  s += ln('M70,80V140M66,80h8', '#8a8f99', 4) + path('M100,78h12v40h-12z', { fill: '#c8433a' }) + ln('M140,76l10,60', '#8a8f99', 4) + circ(150, 140, 7, { fill: 'none', stroke: '#8a8f99', 'stroke-width': 3 });
  s += path('M240,60h120v70h-120z', { fill: '#2f4e8a', stroke: '#e8d9b8', 'stroke-width': 4 }) + path('M256,84h88M256,100h60', { stroke: '#e8d9b8', 'stroke-width': 5 }) + circ(330, 104, 10, { fill: '#c8433a', stroke: '#e8d9b8', 'stroke-width': 3 });
  s += circ(200, 30, 90, { fill: `url(#${P}l)` }) + ln('M200,0V24', '#2a1a10', 2) + path('M188,24h24l6,14h-36z', { fill: '#3a4a3a' }) + circ(200, 42, 6, { fill: '#fff3c4' });
  s += path('M0,380H400V500H0Z', { fill: '#6b5a48' }) + path('M260,300h130v80h-130z', { fill: '#a8774a', stroke: '#4a2e1c', 'stroke-width': 3 }) + path('M250,292h150v12h-150z', { fill: '#c08a5a', stroke: '#4a2e1c', 'stroke-width': 3 });
  s += path('M20,320h60v60h-60z', { fill: '#c8433a', stroke: '#4a2e1c', 'stroke-width': 3 }) + path('M30,306h40v14h-40z', { fill: '#a33', stroke: '#4a2e1c', 'stroke-width': 3 });
  return s + floorGlow(P);
});
sceneDef('newyear', '新春庙会', ['chinese', 'party', 'winter', 'fantasy'], P => {
  let s = `<defs>${lg(P + 'r', [[0, '#7a0e1c'], [.6, '#c41f30'], [1, '#ff8a5c']])}</defs><rect width="400" height="500" fill="url(#${P}r)"/>`;
  const fw = (x, y, c) => { let f = ''; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; f += ln(`M${x + Math.cos(a) * 8},${y + Math.sin(a) * 8}L${x + Math.cos(a) * 30},${y + Math.sin(a) * 30}`, c, 2.4); } return g(f, { class: 'tw' }); };
  s += fw(80, 90, '#ffd166') + fw(320, 70, '#ffb3c8') + fw(240, 150, '#fff3c4');
  s += path('M0,40Q200,90 400,40', { fill: 'none', stroke: '#3a1a10', 'stroke-width': 2 });
  for (const [x, y] of [[40, 58], [120, 72], [200, 78], [280, 72], [360, 58]]) s += ln(`M${x},${y - 6}V${y + 6}`, '#3a1a10', 2) + ell(x, y + 26, 20, 18, { fill: '#e0242f', stroke: '#8a1018', 'stroke-width': 2 }) + path(`M${x - 10},${y + 6}h20v4h-20zM${x - 10},${y + 42}h20v4h-20z`, { fill: '#f2c75c' }) + ln(`M${x},${y + 46}v12`, '#f2c75c', 2);
  s += path('M0,380H400V500H0Z', { fill: '#8a1a24' }) + path('M0,380H400V392H0Z', { fill: '#f2c75c', opacity: .8 });
  return s + sparkles(20, 17, [0, 0, 400, 360], '#ffe9a8') + floorGlow(P);
});
