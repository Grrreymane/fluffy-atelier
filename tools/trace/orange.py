import os
HT = os.environ.get('HAIRTRACE', '/tmp/hairtrace'); HR = os.environ.get('HAIRREF', '/tmp/hairref')
import os
# orange-colour components of a reference (hair, face, arm fur and ear bands are all orange; ink splits them)
import sys, cv2, numpy as np
name = sys.argv[1]
im = cv2.imread(f'{HR}/{name}.png').astype(int)
B, G, R = im[:, :, 0], im[:, :, 1], im[:, :, 2]
lum = .114 * B + .587 * G + .299 * R
orange = (R > 185) & (G > 70) & (G < 190) & (B < 130) & (lum > 92)
n, lab, st, cen = cv2.connectedComponentsWithStats(orange.astype(np.uint8), connectivity=4)
np.save(f'{HT}/{name}_olab.npy', lab)
rng = np.random.default_rng(5); cols = rng.integers(70, 255, (n, 3)).astype(np.uint8); cols[0] = 255
vis = cols[lab]; vis[~orange & (lum < 100)] = (30, 30, 30)
big = cv2.resize(vis, (vis.shape[1] * 2, vis.shape[0] * 2), interpolation=cv2.INTER_NEAREST)
for i in range(1, n):
    if st[i, cv2.CC_STAT_AREA] < 150: continue
    x, y = cen[i]
    cv2.putText(big, str(i), (int(x * 2) - 10, int(y * 2) + 6), cv2.FONT_HERSHEY_SIMPLEX, .55, (0, 0, 0), 3)
    cv2.putText(big, str(i), (int(x * 2) - 10, int(y * 2) + 6), cv2.FONT_HERSHEY_SIMPLEX, .55, (255, 255, 255), 1)
cv2.imwrite(f'{HT}/{name}_olabels.png', big)
print(name, 'components >150px:', int((st[1:, cv2.CC_STAT_AREA] >= 150).sum()))
