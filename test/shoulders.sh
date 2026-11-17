#!/bin/bash
# shoulder comparison sheet: reference crops (top) vs ours (bottom) -> $2 (default /tmp/shoulders.png)
cd "$(dirname "$0")/.."
BOX="${1:-118 286 164 124}"
node test/shoulders.js "$BOX" >/dev/null
for i in 0 1 2 3; do python3 test/chrome_svg.py /tmp/sh_$i.svg /tmp/sh_$i.png 492; done
python3 - "$BOX" "${2:-/tmp/shoulders.png}" <<'PY'
import sys
from PIL import Image
x0, y0, w, h = map(float, sys.argv[1].split())
ref = Image.open('ref/ref3.png').convert('RGB')
cells = []
for i, cx in enumerate([259, 688, 1116, 1546]):
    px0 = cx + (x0 - 200) * 1.266; py0 = 860 - (710 - y0) * 1.266
    r = ref.crop((int(px0), int(py0), int(px0 + w * 1.266), int(py0 + h * 1.266))).resize((492, int(492 * h / w)), Image.LANCZOS)
    m = Image.open('/tmp/sh_%d.png' % i).convert('RGB').resize((492, int(492 * h / w)), Image.LANCZOS)
    cells.append((r, m))
H = cells[0][0].height
im = Image.new('RGB', (492 * 4 + 30, H * 2 + 10), 'white')
for i, (r, m) in enumerate(cells):
    im.paste(r, (i * 502, 0)); im.paste(m, (i * 502, H + 10))
im.save(sys.argv[2])
PY
