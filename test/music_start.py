# background music starts on the first gesture with Chrome's real autoplay policy (a tap, or a key press), and
# keeps playing (the audio clock advances). Reproduces "no music until toggled off and on again".
# usage: python3 test/music_start.py
import os
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
url = 'file://' + os.path.join(ROOT, 'dist/game.html')
fails = 0
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--autoplay-policy=user-gesture-required'])
    for how in ['click', 'touch', 'key']:
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, has_touch=how == 'touch')
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(url); pg.wait_for_timeout(1800)
        st = lambda: pg.evaluate("({ playing: BGM.playing, state: BGM.context ? BGM.context.state : 'none', t: BGM.context ? BGM.context.currentTime : 0 })")
        if how == 'click': pg.mouse.click(200, 300)
        elif how == 'touch': pg.touchscreen.tap(200, 300)
        else: pg.keyboard.press('Tab')
        pg.wait_for_timeout(700); a = st(); pg.wait_for_timeout(800); c = st()
        ok = a['playing'] and c['state'] == 'running' and c['t'] > a['t'] + .3 and not errs
        print(how, 'OK' if ok else 'FAIL', a, c, errs); fails += not ok
        ctx.close()
    b.close()
raise SystemExit(1 if fails else 0)
