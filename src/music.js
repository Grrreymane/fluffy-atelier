/* ===== music.js — background music: a bossa nova loop synthesized live with Web Audio (no audio files) =====
   16 bars at 126 bpm (~30 s): electric piano comping the classic bossa rhythm, a plucked melody that varies from
   one pass to the next, bass on root and fifth, shaker, rim clicks on the bossa clave and a soft kick.
   BGM.start(ac) begins (or resumes) playback on a shared AudioContext; BGM.stop() fades out; BGM.duck() dips the
   music for a moment (photo, results). The scheduler looks ahead ~0.25 s on a timer, so tabs in the background
   keep time; when the page is hidden the music fades out and picks up again when it is shown. */
const BGM = (() => {
  const BPM = 126, BEAT = 60 / BPM, BAR = BEAT * 4, BARS = 16, VOL = .5;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  // chords as MIDI notes: bass root, then a close voicing for the piano (F major, a ii-V tour)
  const CH = {   // rootless voicings (the bass has the root), so chords ring soft instead of muddy
    Fmaj7: [41, [64, 67, 69, 72]], G7: [43, [65, 69, 71, 76]], Gm7: [43, [65, 69, 70, 74]], C7: [48, [64, 67, 70, 74]],
    Am7: [45, [64, 67, 69, 72]], D7: [50, [66, 69, 72, 76]], Bbmaj7: [46, [65, 69, 72, 74]], Bbm6: [46, [65, 67, 70, 73]],
    Em7b5: [40, [62, 64, 67, 70]], A7: [45, [61, 64, 67, 71]], Dm7: [50, [65, 69, 72, 76]],
  };
  // two chords per bar where a bar is split
  const PROG = [['Fmaj7'], ['Fmaj7'], ['G7'], ['G7'], ['Gm7'], ['C7'], ['Fmaj7'], ['Em7b5', 'A7'],
    ['Dm7'], ['D7'], ['Gm7'], ['C7'], ['Bbmaj7'], ['Bbm6'], ['Am7', 'D7'], ['Gm7', 'C7']];
  const SCALE = [0, 2, 4, 5, 7, 9, 11].map(x => x + 65);   // F major from F4
  // bossa comping (in beats): pushes on the "and"s, as on a nylon guitar
  const COMP = [[0, .45], [1.5, .4], [2.5, .4], [3.5, .45]];
  const CLAVE = [[0, 0], [0, 1.5], [0, 3], [1, 1], [1, 2.5]];        // 3-2 clave over two bars: [bar parity, beat]

  let ac = null, out = null, bus = null, on = false, timer = null, next = 0, step = 0, pass = 0, noiseBuf = null;

  function graph() {
    out = ac.createGain(); out.gain.value = 0;
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    const warm = ac.createBiquadFilter(); warm.type = 'lowpass'; warm.frequency.value = 5200;
    bus = ac.createGain(); bus.gain.value = 1;
    bus.connect(warm).connect(comp).connect(out).connect(ac.destination);
    // a small room: two short feedback delays, low in the mix
    for (const [t, fb] of [[.113, .28], [.171, .22]]) {
      const d = ac.createDelay(1), g = ac.createGain(), w = ac.createGain(), lp = ac.createBiquadFilter();
      d.delayTime.value = t; g.gain.value = fb; w.gain.value = .14; lp.type = 'lowpass'; lp.frequency.value = 2400;
      bus.connect(d); d.connect(lp).connect(g).connect(d); lp.connect(w).connect(warm);
    }
    noiseBuf = ac.createBuffer(1, ac.sampleRate * .25, ac.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  }
  function env(g, t, a, peak, dec, sus = 0) {
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(Math.max(.0001, sus || .0001), t + a + dec);
  }
  // electric piano: sine carrier with a decaying FM bark, a touch of tremolo-free warmth
  function epiano(m, t, dur, vel) {
    const f = mtof(m), c = ac.createOscillator(), mo = ac.createOscillator(), mg = ac.createGain(), g = ac.createGain();
    c.frequency.value = f; mo.frequency.value = f * 2;
    mg.gain.setValueAtTime(f * 1.4, t); mg.gain.exponentialRampToValueAtTime(f * .08, t + .35);
    mo.connect(mg).connect(c.frequency); c.connect(g).connect(bus);
    env(g, t, .006, .055 * vel, dur, 0);
    c.start(t); mo.start(t); c.stop(t + dur + .1); mo.stop(t + dur + .1);
  }
  // plucked melody: triangle through a closing lowpass
  function pluck(m, t, dur, vel) {
    const o = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'triangle'; o.frequency.value = mtof(m);
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(4200, t); lp.frequency.exponentialRampToValueAtTime(700, t + dur);
    o.connect(lp).connect(g).connect(bus);
    env(g, t, .004, .09 * vel, dur, 0);
    o.start(t); o.stop(t + dur + .05);
  }
  function bass(m, t, dur) {
    const o = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'triangle'; o.frequency.value = mtof(m);
    lp.type = 'lowpass'; lp.frequency.value = 420;
    o.connect(lp).connect(g).connect(bus);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.22, t + .01); g.gain.setTargetAtTime(.0001, t + dur * .7, .08);
    o.start(t); o.stop(t + dur + .4);
  }
  function hit(t, freq, q, vol, dur) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    s.connect(f).connect(g).connect(bus);
    env(g, t, .002, vol, dur);
    s.start(t); s.stop(t + dur + .02);
  }
  function kick(t) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(48, t + .12);
    o.connect(g).connect(bus); env(g, t, .003, .2, .22);
    o.start(t); o.stop(t + .26);
  }
  // a seeded melody for one bar: chord tones on strong beats, scale steps between, with rests
  function melodyBar(bar, chord, rnd) {
    const tones = chord[1].map(m => m + 12 * (m < 67 ? 1 : 0));
    const rhythms = [[0, 1, 1.5, 2.5, 3], [0, .5, 1.5, 2, 3.5], [.5, 1.5, 2.5], [0, 1.5, 3], [0, 1, 2, 2.5, 3.5]];
    const r = rhythms[Math.floor(rnd() * rhythms.length)];
    let cur = tones[Math.floor(rnd() * tones.length)];
    const notes = [];
    for (let i = 0; i < r.length; i++) {
      const strong = r[i] % 1 === 0;
      if (strong) cur = tones.reduce((a, b) => Math.abs(b - cur) < Math.abs(a - cur) ? b : a);
      else { const k = SCALE.findIndex(s => (s % 12) === (cur % 12)); const dir = rnd() < .5 ? -1 : 1; const s2 = SCALE[(k + dir + 7) % 7]; cur = s2 + 12 * Math.round((cur - s2) / 12); }
      const len = (i + 1 < r.length ? r[i + 1] : 4) - r[i];
      notes.push([r[i], cur, Math.min(len, 1.2)]);
    }
    return notes;
  }
  const seeded = s => () => (s = (s * 16807) % 2147483647) / 2147483647;

  function scheduleBar(t, bar) {
    const parts = PROG[bar], half = parts.length > 1;
    const chordAt = beat => CH[parts[half && beat >= 2 ? 1 : 0]];
    // piano comping
    for (const [b, len] of COMP) { const ch = chordAt(b); for (const m of ch[1]) epiano(m, t + b * BEAT, len * BEAT + .25, .8 + (b === 0 ? .2 : 0)); }
    // bass: root (dotted quarter), fifth, fifth, root pickup
    for (const [b, d, iv] of [[0, 1.5, 0], [1.5, .5, 7], [2, 1.5, 7], [3.5, .5, 0]]) { const ch = chordAt(b); bass(ch[0] + (half && b >= 2 ? 0 : iv) - (iv && ch[0] + iv > 52 ? 12 : 0), t + b * BEAT, d * BEAT); }
    // shaker on every eighth (accents on the "and"s), clave, kick on 1 and 3
    for (let e = 0; e < 8; e++) hit(t + e * BEAT / 2, 7000, 1.2, e % 2 ? .05 : .028, .06);
    for (const [p, b] of CLAVE) if (bar % 2 === p) hit(t + b * BEAT, 1800, 8, .09, .05);
    kick(t); kick(t + 2 * BEAT);
    // melody: first pass full, second pass a variation, third pass sparse (room for the piano), then again
    const mode = pass % 3;
    if (mode === 2 && bar % 2) return;
    const rnd = seeded(1 + bar * 97 + (mode === 1 ? 5003 : 0) + Math.floor(pass / 3) * 131);
    for (const [b, m, len] of melodyBar(bar, chordAt(0), rnd)) pluck(m, t + b * BEAT + (rnd() - .5) * .012, len * BEAT, .8 + rnd() * .3);
  }
  function tick() {
    while (next < ac.currentTime + .3) {
      scheduleBar(next, step);
      next += BAR; step++;
      if (step >= BARS) { step = 0; pass++; }
    }
  }
  function fade(to, sec) {
    if (!out) return;
    const t = ac.currentTime;
    out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(out.gain.value, t); out.gain.linearRampToValueAtTime(to, t + sec);
  }
  function start(a) {
    if (!a) return;
    if (!ac) { ac = a; graph(); ac.addEventListener && ac.addEventListener('statechange', () => { if (on && ac.state === 'running') { next = Math.max(next, ac.currentTime + .05); fade(VOL, .8); } }); }
    if (on) return;
    on = true;
    next = Math.max(next, ac.currentTime + .1);
    if (!timer) timer = setInterval(tick, 90);
    tick(); fade(VOL, 1.2);
  }
  function stop() {
    if (!on) return;
    on = false; fade(0, .5);
    setTimeout(() => { if (!on && timer) { clearInterval(timer); timer = null; } }, 600);
  }
  // dip the music for a moment (photo, results), then bring it back
  function duck(sec = 2.2) {
    if (!on || !out) return;
    const t = ac.currentTime;
    out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(out.gain.value, t);
    out.gain.linearRampToValueAtTime(VOL * .3, t + .15); out.gain.setValueAtTime(VOL * .3, t + sec); out.gain.linearRampToValueAtTime(VOL, t + sec + .8);
  }
  // render whole passes into an OfflineAudioContext (tests, exporting a clip)
  function renderTo(offline, sec) {
    ac = offline; graph(); out.gain.value = VOL; next = .05; step = 0; pass = 0;
    while (next < sec) { scheduleBar(next, step); next += BAR; step++; if (step >= BARS) { step = 0; pass++; } }
    return offline.startRendering();
  }
  return { start, stop, duck, renderTo, get playing() { return on; }, get context() { return ac; } };
})();
