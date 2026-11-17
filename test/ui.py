import sys, json
from playwright.sync_api import sync_playwright
src = sys.argv[1]; out = sys.argv[2]
w = int(sys.argv[3]); h = int(sys.argv[4])
actions = json.loads(sys.argv[5]) if len(sys.argv) > 5 else []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2 if w < 600 else 1, has_touch=w < 600)
    pg = ctx.new_page()
    errs = []
    pg.on('console', lambda m: errs.append('console:' + m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errs.append('pageerror:' + str(e)))
    pg.goto('file://' + src)
    pg.wait_for_timeout(800)
    for a in actions:
        if a[0] == 'click': pg.click(a[1])
        elif a[0] == 'wait': pg.wait_for_timeout(a[1])
        elif a[0] == 'eval': print('EVAL', pg.evaluate(a[1]))
        elif a[0] == 'shot': pg.screenshot(path=a[1])
    pg.screenshot(path=out)
    for e in errs: print('ERR', e)
    b.close()
