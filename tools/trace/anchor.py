import os
HT = os.environ.get('HAIRTRACE', '/tmp/hairtrace'); HR = os.environ.get('HAIRREF', '/tmp/hairref')
import os
# find the two blue irises in each reference crop and map the crop into our head coordinates
# (eye centres at (152.5,224) and (247.5,224) in head space). Writes a gridded 2x zoom per style.
import sys, json
from PIL import Image, ImageDraw, ImageFont
def eyes(im):
    W, H = im.size; px = im.load()
    pts = [(x, y) for y in range(0, H, 2) for x in range(0, W, 2) if (lambda p: p[2] > 140 and p[0] < 90 and p[2] - p[0] > 90)(px[x, y])]
    xs = sorted(p[0] for p in pts); mid = (xs[0] + xs[-1]) / 2
    L = [p for p in pts if p[0] < mid]; R = [p for p in pts if p[0] >= mid]
    c = lambda P: (sum(p[0] for p in P) / len(P), sum(p[1] for p in P) / len(P))
    return c(L), c(R)
out = {}
font = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', 18) if True else None
for name in sys.argv[1:]:
    im = Image.open(f'{HR}/{name}.png').convert('RGB')
    (lx, ly), (rx, ry) = eyes(im)
    s = 95 / (rx - lx); cx = (lx + rx) / 2; cy = (ly + ry) / 2
    to_head = lambda x, y: (200 + (x - cx) * s, 224 + (y - cy) * s)
    to_img = lambda X, Y: (cx + (X - 200) / s, cy + (Y - 224) / s)
    out[name] = dict(s=s, cx=cx, cy=cy)
    Z = 2
    big = im.resize((im.width * Z, im.height * Z), Image.LANCZOS)
    d = ImageDraw.Draw(big, 'RGBA')
    x0, y0 = to_head(0, 0); x1, y1 = to_head(im.width, im.height)
    for X in range(int(x0 // 10) * 10, int(x1) + 10, 10):
        px_, _ = to_img(X, 0)
        d.line([(px_ * Z, 0), (px_ * Z, big.height)], fill=(0, 120, 255, 120 if X % 50 == 0 else 40), width=2 if X % 50 == 0 else 1)
        if X % 50 == 0: d.text((px_ * Z + 3, 4), str(X), fill=(0, 80, 200, 255), font=font)
    for Y in range(int(y0 // 10) * 10, int(y1) + 10, 10):
        _, py_ = to_img(0, Y)
        d.line([(0, py_ * Z), (big.width, py_ * Z)], fill=(255, 0, 120, 120 if Y % 50 == 0 else 40), width=2 if Y % 50 == 0 else 1)
        if Y % 50 == 0: d.text((4, py_ * Z + 2), str(Y), fill=(200, 0, 90, 255), font=font)
    big.save(f'{HR}/{name}_grid.png')
    print(name, 'scale', round(s, 3), 'eyes', (round(lx), round(ly)), (round(rx), round(ry)), 'head box', [round(v) for v in (x0, y0, x1, y1)])
json.dump(out, open(os.path.join(os.environ.get('HAIRREF', '/tmp/hairref'), 'anchors.json'), 'w'))
