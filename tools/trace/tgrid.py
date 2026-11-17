import os
HT = os.environ.get('HAIRTRACE', '/tmp/hairtrace'); HR = os.environ.get('HAIRREF', '/tmp/hairref')
import os
# top-hat line image of a reference crop with a labelled grid in OUR head coordinates (after the face fit)
# usage: tgrid.py <name> x0 y0 x1 y1 [scale] [KX KY] -> /tmp/hairref/<name>_tg.png
import sys, json, cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, os.environ.get('HAIRTRACE', '/tmp/hairtrace'))
from fit import fit
name = sys.argv[1]; x0, y0, x1, y1 = map(float, sys.argv[2:6])
Z = float(sys.argv[6]) if len(sys.argv) > 6 else 3
_, img_of, _ = fit(name)
im = cv2.imread(f'{HR}/{name}.png')
lum = (0.114 * im[:, :, 0] + 0.587 * im[:, :, 1] + 0.299 * im[:, :, 2]).astype(np.uint8)
th = cv2.morphologyEx(lum, cv2.MORPH_BLACKHAT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))
base = 255 - np.clip(th.astype(int) * 4, 0, 255).astype(np.uint8)
col = cv2.cvtColor(base, cv2.COLOR_GRAY2BGR)
# tint by the original so regions are recognisable
col = cv2.addWeighted(col, .75, im, .25, 0)
# our head coords -> image px (inverse of the face fit)
img = img_of
ax, ay = img(x0, y0); bx, by = img(x1, y1)
crop = col[int(ay):int(by), int(ax):int(bx)]
big = cv2.resize(crop, (int(crop.shape[1] * Z), int(crop.shape[0] * Z)), interpolation=cv2.INTER_CUBIC)
P = Image.fromarray(cv2.cvtColor(big, cv2.COLOR_BGR2RGB)); d = ImageDraw.Draw(P, 'RGBA')
f = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', 13)
def px(X, Y): u, v = img(X, Y); return ((u - int(ax)) * Z, (v - int(ay)) * Z)
for X in range(int(x0 // 10) * 10, int(x1) + 1, 10):
    u, _ = px(X, y0); d.line([(u, 0), (u, P.height)], fill=(0, 110, 255, 150 if X % 50 == 0 else 55), width=1)
for Y in range(int(y0 // 10) * 10, int(y1) + 1, 10):
    _, v = px(x0, Y); d.line([(0, v), (P.width, v)], fill=(255, 0, 110, 150 if Y % 50 == 0 else 55), width=1)
for X in range(int(x0 // 20) * 20, int(x1) + 1, 20):
    for Y in range(int(y0 // 20) * 20, int(y1) + 1, 40):
        u, v = px(X, Y); d.text((u + 2, v + 1), f'{X},{Y}', fill=(20, 60, 160, 210), font=f)
P.save(f'{HR}/{name}_tg.png'); print(P.size)
