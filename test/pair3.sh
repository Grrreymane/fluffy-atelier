#!/bin/bash
# usage: test/pair3.sh i  -> /tmp/pair_i.png (ref3 left, ours right, both 920x1720)
cd "$(dirname "$0")/.."
node test/pair3.js $1 && rsvg-convert -b white -w 920 -h 1720 /tmp/pair.svg -o /tmp/pair_r.png && python3 -c "
from PIL import Image
i=$1; cx=[259,688,1116,1546][i]
r=Image.open('ref/ref3.png').convert('RGB').crop((cx-230,15,cx+230,875)).resize((920,1720),Image.LANCZOS)
m=Image.open('/tmp/pair_r.png').convert('RGB')
im=Image.new('RGB',(1850,1720),'white'); im.paste(r,(0,0)); im.paste(m,(930,0)); im.resize((925,860),Image.LANCZOS).save('/tmp/pair_%d.png'%i)
"
