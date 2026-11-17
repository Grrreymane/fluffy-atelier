// Cover director for record_game_video (size 1600x900): a lineup of five looks from the game's presets.
// Saves cover-base (no text) and cover (with title) via REC.shot.
(async () => {
  const W = REC.width || 1600, H = REC.height || 900;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  const FONT = '"ZCOOL KuaiLe","PingFang SC","Microsoft YaHei",sans-serif';
  try { await document.fonts.load('100px "ZCOOL KuaiLe"', '绒绒时装屋'); } catch (e) { /* fallback */ }
  const toImg = (svg, w, h) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; svg = svg.replace('<svg ', `<svg width="${w}" height="${h}" `); if (!svg.includes('xmlns=')) svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); });
  const base = clone(S);
  const mk = (pi, sp, pal, body, expr, extra = {}) => {
    const fur = palOf(sp, pal), pr = PRESETS[pi];
    return Object.assign(clone(base), { species: sp, palIdx: pal, fur, body, pose: pr.pose, expr, eyes: { style: body === 'boy' ? 'boy' : 'round', color: fur.eye }, hair: { id: 'none', color: fur.hair || fur.main }, backHair: { id: 'none' }, wear: clone(pr.wear) }, extra);
  };
  const looks = [
    [mk(1, 'bear', 0, 'chub', 'grin'), -2.05, .80],
    [mk(6, 'cat', 1, 'girl', 'smile'), -1.05, .90],
    [mk(0, 'fox', 0, 'boy', 'grin', { pose: 'wave' }), 0, 1],
    [mk(7, 'bunny', 0, 'girl', 'wow', { eyes: { style: 'sparkle', color: '#b07cff' }, hair: { id: 'cloud', color: '#fbf7f3' }, backHair: { id: 'wavy' } }), 1.05, .90],
    [mk(3, 'wolf', 2, 'boy', 'cool'), 2.05, .80],
  ];
  const bg = await toImg(renderScene('dreamy', 'cbg', { noAnim: true }), W, H);
  const imgs = []; for (const [st] of looks) imgs.push(await toImg(renderCharacter(st, { id: 'cv' + imgs.length, noAnim: true }), 800, 1440));
  REC.run({
    fps: 1, seconds: 3, canvas: cv,
    step(i) {
      c.drawImage(bg, 0, 0, W, H);
      const order = [0, 4, 1, 3, 2]; // back to front
      for (const i of order) {
        const [, slot, s] = looks[i], h = 1020 * s, w = h * 400 / 720, cx = W / 2 + slot * 300, by = H + 120 + (1 - s) * -60;
        c.fillStyle = 'rgba(43,20,60,.18)'; c.beginPath(); c.ellipse(cx, by - h * .02, w * .34, h * .03, 0, 0, 7); c.fill();
        c.drawImage(imgs[i], cx - w / 2, by - h * .98, w, h);
      }
      if (i === 0) REC.shot('coverbase', cv);
      // title band
      c.textAlign = 'center'; c.lineJoin = 'round';
      c.font = `150px ${FONT}`; c.lineWidth = 30; c.strokeStyle = '#3b2150'; c.strokeText('绒绒时装屋', W / 2, 190);
      c.fillStyle = '#ffd56b'; c.fillText('绒绒时装屋', W / 2, 190);
      if (i === 0) REC.shot('cover', cv);
    },
  });
})();
