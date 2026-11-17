# ink overlay for ref3 figure: red = reference, blue = ours; also a side-by-side
import sys, json
from PIL import Image
import numpy as np
fig = int(sys.argv[1]); J = json.load(open('/tmp/ov3.json'))
ref = Image.open('ref/ref3.png').convert('RGB').crop((J['X0'], 0, J['X1'], 887))
b = Image.open('/tmp/ov3.png').convert('RGBA'); bg = Image.new('RGBA', b.size, (255, 255, 255, 255)); bg.alpha_composite(b); mine = bg.convert('RGB')
a = np.asarray(ref).astype(int); m = np.asarray(mine).astype(int)
da = a.sum(2) < 200; dm = m.sum(2) < 200
out = np.full(a.shape, 255, np.uint8); out[da] = (230, 70, 70); out[dm] = (40, 90, 230); out[da & dm] = (60, 20, 60)
W = ref.width
im = Image.new('RGB', (W * 3 + 20, 887), 'white')
im.paste(ref, (0, 0)); im.paste(mine, (W + 10, 0)); im.paste(Image.fromarray(out), (2 * W + 20, 0))
im.save(sys.argv[2] if len(sys.argv) > 2 else '/tmp/ov3cmp.png')
