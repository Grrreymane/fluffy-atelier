# edge overlay: reference ink in red, our render ink in blue
import sys
from PIL import Image
import numpy as np
a = np.asarray(Image.open('ref/ref2.png').convert('RGB')).astype(int)
b = Image.open('/tmp/ov.png').convert('RGBA'); bg = Image.new('RGBA', b.size, (255, 255, 255, 255)); bg.alpha_composite(b)
b = np.asarray(bg.convert('RGB')).astype(int)
da = a.sum(2) < 260; db = b.sum(2) < 260
out = np.full(a.shape, 255, np.uint8)
out[da] = (230, 60, 60)
out[db] = (40, 90, 230)
out[da & db] = (60, 20, 60)
box = [int(v) for v in sys.argv[1:5]] if len(sys.argv) > 4 else [300, 20, 960, 620]
Image.fromarray(out).crop(box).save(sys.argv[5] if len(sys.argv) > 5 else '/tmp/ovl.png')
