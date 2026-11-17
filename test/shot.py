import sys
from playwright.sync_api import sync_playwright
src, out = sys.argv[1], sys.argv[2]
w = int(sys.argv[3]) if len(sys.argv) > 3 else 1240
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': w, 'height': 800}, device_scale_factor=1)
    errs = []
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + src)
    pg.wait_for_timeout(300)
    pg.screenshot(path=out, full_page=True)
    for e in errs: print('ERR', e)
    b.close()
