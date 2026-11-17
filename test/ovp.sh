#!/bin/bash
# ink overlay for ref3 figure i (0-3) with the pair mapping: red = reference, blue = ours -> /tmp/ovp_i.png
cd "$(dirname "$0")/.."
node test/pair3.js $1 && rsvg-convert -b white -w 920 -h 1720 /tmp/pair.svg -o /tmp/pair_r.png && python3 -c "
from PIL import Image
import numpy as np
i=$1; cx=[259,688,1116,1546][i]
r=Image.open('ref/ref3.png').convert('RGB').crop((cx-230,15,cx+230,875)).resize((920,1720),Image.LANCZOS)
m=Image.open('/tmp/pair_r.png').convert('RGB')
a=np.asarray(r).astype(int); b=np.asarray(m).astype(int)
da=a.sum(2)<200; db=b.sum(2)<200
out=np.full(a.shape,255,np.uint8); out[da]=(235,80,80); out[db]=(40,90,230); out[da&db]=(60,20,60)
Image.fromarray(out).resize((460,860),Image.LANCZOS).save('/tmp/ovp_%d.png'%i)
"
