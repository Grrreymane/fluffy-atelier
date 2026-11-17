import os
HT = os.environ.get('HAIRTRACE', '/tmp/hairtrace'); HR = os.environ.get('HAIRREF', '/tmp/hairref')
import os
# label the regions of a reference crop that are separated by the dark ink lines; writes <name>_labels.png
import sys, cv2, numpy as np
name = sys.argv[1]; thr = int(sys.argv[2]) if len(sys.argv) > 2 else 95
ek = int(sys.argv[3]) if len(sys.argv) > 3 else 1
im = cv2.imread(f'{HR}/{name}.png')
lum = (0.114 * im[:, :, 0] + 0.587 * im[:, :, 1] + 0.299 * im[:, :, 2])
light = cv2.erode((lum >= thr).astype(np.uint8), np.ones((ek, ek), np.uint8))
n, lab, stats, cents = cv2.connectedComponentsWithStats(light, connectivity=4)
rng = np.random.default_rng(3)
cols = rng.integers(60, 255, (n, 3)).astype(np.uint8); cols[0] = 0
vis = cols[lab]
vis[light == 0] = (20, 20, 20)
big = cv2.resize(vis, (vis.shape[1] * 2, vis.shape[0] * 2), interpolation=cv2.INTER_NEAREST)
for i in range(1, n):
    if stats[i, cv2.CC_STAT_AREA] < 60: continue
    x, y = cents[i]
    cv2.putText(big, str(i), (int(x * 2) - 10, int(y * 2) + 6), cv2.FONT_HERSHEY_SIMPLEX, .6, (0, 0, 0), 3)
    cv2.putText(big, str(i), (int(x * 2) - 10, int(y * 2) + 6), cv2.FONT_HERSHEY_SIMPLEX, .6, (255, 255, 255), 1)
cv2.imwrite(f'{HT}/{name}_labels.png', big)
np.save(f'{HT}/{name}_lab.npy', lab)
print(name, 'regions', n, 'big ones', int((stats[1:, cv2.CC_STAT_AREA] >= 60).sum()))
