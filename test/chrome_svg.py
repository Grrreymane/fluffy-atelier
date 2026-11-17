# render /tmp/part.svg in headless Chrome at a given width -> out png
import sys, re
from playwright.sync_api import sync_playwright
src, out, w = sys.argv[1], sys.argv[2], int(sys.argv[3])
svg = open(src).read()
m = re.search(r'viewBox="([-\d. ]+)"', svg); vb = [float(v) for v in m.group(1).split()]
h = int(round(w * vb[3] / vb[2]))
svg = re.sub(r' width="\d+" height="\d+"', '', svg, count=1).replace('<svg ', f'<svg width="{w}" height="{h}" ', 1)
open('/tmp/_c.html', 'w').write('<!doctype html><body style="margin:0;background:#fff">' + svg + '</body>')
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=1)
    pg.goto('file:///tmp/_c.html'); pg.wait_for_timeout(200); pg.screenshot(path=out); b.close()
