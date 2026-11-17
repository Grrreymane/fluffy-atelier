# background music: render 2 passes (~61 s) offline in Chrome and check it is audible, never clips, has no silent
# gaps and has no denormal / NaN output. Writes test/out/music.wav to listen to.
# usage: python3 test/music.py
import os, wave, struct, math
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR, SEC = 44100, 61
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required'])
    pg = b.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + os.path.join(ROOT, 'dist/game.html')); pg.wait_for_timeout(800)
    data = pg.evaluate(f"""async () => {{
      const off = new OfflineAudioContext(2, {SR * SEC}, {SR});
      const buf = await BGM.renderTo(off, {SEC - 1});
      const L = buf.getChannelData(0), out = new Array(Math.ceil(L.length / 441));
      // per 10 ms block: peak and rms
      for (let i = 0; i < out.length; i++) {{ let pk = 0, ss = 0, n = 0; for (let j = i * 441; j < Math.min(L.length, (i + 1) * 441); j++) {{ const v = L[j]; if (!isFinite(v)) return 'nan'; pk = Math.max(pk, Math.abs(v)); ss += v * v; n++; }} out[i] = [pk, Math.sqrt(ss / n)]; }}
      const pcm = Array.from(L.filter((_, i) => i % 2 === 0), v => Math.round(Math.max(-1, Math.min(1, v)) * 32767));
      return {{ blocks: out, pcm }};
    }}""")
    b.close()
assert data != 'nan', 'NaN in the output'
blocks = data['blocks']
peak = max(p for p, r in blocks); rms = math.sqrt(sum(r * r for p, r in blocks) / len(blocks))
body = blocks[100:-100]
run = longest = 0
for p_, r in body:
    run = run + 1 if r < .003 else 0; longest = max(longest, run)
os.makedirs(os.path.join(ROOT, 'test', 'out'), exist_ok=True)
w = wave.open(os.path.join(ROOT, 'test', 'out', 'music.wav'), 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR // 2)
w.writeframes(struct.pack('<%dh' % len(data['pcm']), *[int(v) for v in data['pcm']])); w.close()
print(f'peak {peak:.3f}  rms {rms:.3f}  longest near-silence {longest * 10} ms  page errors {errs}')
ok = .2 < peak < .98 and .03 < rms < .3 and longest < 400 and not errs
print('OK' if ok else 'PROBLEM'); raise SystemExit(0 if ok else 1)
