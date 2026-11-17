import os
HT = os.environ.get('HAIRTRACE', '/tmp/hairtrace'); HR = os.environ.get('HAIRREF', '/tmp/hairref')
import os
# trace one hairstyle from a reference crop into our head coordinates.
# usage: trace.py <name> <hairIds,...> [KX KY] [--split y]
# out: /tmp/hairtrace/<name>.json  { outer: [poly...], shadows: [poly...], strands: [line...], inks: [line...] }
# mapping: eye-based head coords (anchors.json), then scaled about the eye centre (200,224) so the reference face
# matches ours: x and y above the eyes by KX, y below the eyes by KY.
import sys, json, cv2, numpy as np
from skimage.morphology import skeletonize
sys.path.insert(0, os.environ.get('HAIRTRACE', '/tmp/hairtrace'))
from fit import fit
name = sys.argv[1]
head, img_of, C = fit(name)
ids = C['ids']
A = json.load(open(os.path.join(os.environ.get('HAIRREF', '/tmp/hairref'), 'anchors.json')))[name]
lab = np.load(f'{HT}/{name}_lab.npy')
im = cv2.imread(f'{HR}/{name}.png')
lum = (0.114 * im[:, :, 0] + 0.587 * im[:, :, 1] + 0.299 * im[:, :, 2])
def tag_corners(pts, closed=True, lim=0.15):
    out = []; n = len(pts)
    for i in range(n):
        if not closed and (i == 0 or i == n - 1): out.append(pts[i]); continue
        a, b, c = np.array(pts[i - 1]), np.array(pts[i]), np.array(pts[(i + 1) % n])
        u, v = b - a, c - b
        cosang = float(np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v) + 1e-9))
        out.append(pts[i] + ([1] if cosang < lim else []))
    return out
def polys(mask, eps, min_area, corners=True):
    cnts, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    res = []
    for c in cnts:
        if cv2.contourArea(c) < min_area: continue
        p = cv2.approxPolyDP(c, eps, True)[:, 0, :]
        q = [head(x, y) for x, y in p]
        res.append(tag_corners(q) if corners else q)
    return res
def soft(mask, r):
    b = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), r)
    return b > .5
def lines_of(mask, min_len, eps):
    sk = skeletonize(mask > 0); H, W = sk.shape
    seen = np.zeros_like(sk, bool)
    nb = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
    def deg(y, x): return sum(1 for dy, dx in nb if 0 <= y + dy < H and 0 <= x + dx < W and sk[y + dy, x + dx])
    pts = list(zip(*np.nonzero(sk)))
    order = [p for p in pts if deg(*p) == 1] + pts
    out = []
    for st in order:
        if seen[st]: continue
        path = [st]; seen[st] = True; cur = st
        while True:
            nxt = None
            for dy, dx in nb:
                q = (cur[0] + dy, cur[1] + dx)
                if 0 <= q[0] < H and 0 <= q[1] < W and sk[q] and not seen[q]: nxt = q; break
            if not nxt: break
            seen[nxt] = True; path.append(nxt); cur = nxt
        if len(path) >= min_len:
            c = np.array([[x, y] for y, x in path], np.int32).reshape(-1, 1, 2)
            p = cv2.approxPolyDP(c, eps, False)[:, 0, :]
            out.append([head(x, y) for x, y in p])
    return out
hair = np.isin(lab, ids)
if C.get('open'):
    # cut thin bridges into neighbouring regions (an ear band leaking in through a gap), keep the biggest piece
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (C['open'], C['open']))
    op = cv2.morphologyEx(hair.astype(np.uint8), cv2.MORPH_OPEN, k)
    n_, lb, st_, _ = cv2.connectedComponentsWithStats(op, connectivity=4)
    big_ = 1 + int(np.argmax(st_[1:, cv2.CC_STAT_AREA]))
    hair = hair & cv2.dilate((lb == big_).astype(np.uint8), np.ones((11, 11), np.uint8)).astype(bool)
if C.get('drop'):
    # remove regions that leak in through gaps in the ink: each seed picks a region of a stricter labelling
    L2 = cv2.connectedComponents((lum >= 115).astype(np.uint8), connectivity=4)[1]
    for (x, y) in C['drop']:
        hair &= ~cv2.dilate((L2 == L2[y, x]).astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
if C.get('cut'):
    # drop everything below a head-space y (the part that continues as separately drawn locks)
    yy = np.arange(hair.shape[0])
    ycut = img_of(200, C['cut'])[1]
    hair[yy > ycut, :] = False
# the silhouette: region grown to the middle of its ink line, holes filled
G = C.get('grow', 5)
grown = cv2.dilate(hair.astype(np.uint8), np.ones((G, G), np.uint8))
filled = np.zeros_like(grown)
cnts, _ = cv2.findContours(grown, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
cv2.drawContours(filled, cnts, -1, 1, -1)
outer = polys(filled, 1.1, 40)
# ink lines inside the silhouette (lock edges, the cowlick) — not the outline itself
inner = cv2.erode(filled, np.ones((7, 7), np.uint8)).astype(bool)
inkm = ((lum < 92) & inner).astype(np.uint8)
inkm = cv2.morphologyEx(inkm, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
# shading: wide darker areas; strands: thin darker strokes
dark = (lum < 132) & hair
blob = cv2.morphologyEx(dark.astype(np.uint8), cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))) > 0
thin = dark & ~cv2.dilate(blob.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
shadows = polys(soft(cv2.dilate(blob.astype(np.uint8), np.ones((3, 3), np.uint8)), 2.4), 2.0, 30, corners=False)
# thin dark strokes = black top-hat of the luminance (dark lines narrower than the kernel), away from the ink lines
L8 = np.clip(lum, 0, 255).astype(np.uint8)
th = cv2.morphologyEx(L8, cv2.MORPH_BLACKHAT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))
th = cv2.GaussianBlur(th, (0, 0), 1.0)
TH = C.get('th', 18)
inside = cv2.erode(filled, np.ones((7, 7), np.uint8)).astype(bool)
thin = (th > TH) & inside & ~cv2.dilate(inkm, np.ones((3, 3), np.uint8)).astype(bool) & ~cv2.erode(blob.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
thin = cv2.morphologyEx(thin.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
# strokes and inner ink lines: centre lines, simplified hard; they are drawn back as clean tapered strokes
def link(lines, gap=7.0, cosmin=.55):
    L = [list(map(list, l)) for l in lines]
    changed = True
    while changed:
        changed = False
        for i in range(len(L)):
            for j in range(len(L)):
                if i == j or not L[i] or not L[j]: continue
                for a in (L[i], L[i][::-1]):
                    for b in (L[j], L[j][::-1]):
                        p, q = np.array(a[-1][:2]), np.array(b[0][:2])
                        if np.linalg.norm(p - q) > gap: continue
                        da = p - np.array(a[-2][:2]) if len(a) > 1 else None
                        db = np.array(b[1][:2]) - q if len(b) > 1 else None
                        if da is not None and db is not None:
                            c = np.dot(da, db) / (np.linalg.norm(da) * np.linalg.norm(db) + 1e-9)
                            if c < cosmin: continue
                        L[i] = a + b[1:] if np.linalg.norm(p - q) < .5 else a + b; L[j] = []; changed = True; break
                    if changed: break
                if changed: break
            if changed: break
    return [l for l in L if l]
def plen(l): return sum(np.hypot(l[k + 1][0] - l[k][0], l[k + 1][1] - l[k][1]) for k in range(len(l) - 1))
def bez(l, n=10):
    # least-squares cubic Bezier through a polyline (ends fixed), sampled back to n points: a clean, smooth stroke
    P = np.array([q[:2] for q in l], float)
    d = np.r_[0, np.cumsum(np.hypot(*np.diff(P, axis=0).T))]
    if d[-1] < 1e-6: return l
    t = d / d[-1]
    p0, p3 = P[0], P[-1]
    b1, b2 = 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t ** 2
    rhs = P - np.outer((1 - t) ** 3, p0) - np.outer(t ** 3, p3)
    M = np.c_[b1, b2]
    sol, *_ = np.linalg.lstsq(M, rhs, rcond=None)
    p1, p2 = sol
    u = np.linspace(0, 1, n)
    B = np.outer((1 - u) ** 3, p0) + np.outer(3 * (1 - u) ** 2 * u, p1) + np.outer(3 * (1 - u) * u ** 2, p2) + np.outer(u ** 3, p3)
    return [[round(float(x), 1), round(float(y), 1)] for x, y in B]
strands = [bez(l) for l in link(lines_of(thin, 6, 1.5)) if plen(l) >= 10]
inks = [bez(l) for l in link(lines_of(cv2.morphologyEx(inkm, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8)), 6, 1.5)) if plen(l) >= 8]
json.dump({'outer': outer, 'shadows': shadows, 'strands': strands, 'inks': inks}, open(f'{HT}/{name}.json', 'w'))
print(name, 'outer', [len(o) for o in outer], 'shadows', len(shadows), 'strands', len(strands), 'inks', len(inks))

# debug: extracted pieces drawn over the faded reference
dbg = cv2.addWeighted(im, .35, np.full_like(im, 255), .65, 0)
def P(q):
    u, v = img_of(q[0], q[1]); return (int(round(u)), int(round(v)))
for poly_ in outer: cv2.polylines(dbg, [np.array([P(q) for q in poly_], np.int32)], True, (40, 40, 40), 1)
for poly_ in shadows: cv2.fillPoly(dbg, [np.array([P(q) for q in poly_], np.int32)], (90, 140, 230))
Z = 3
dbg = cv2.resize(dbg, (dbg.shape[1] * Z, dbg.shape[0] * Z), interpolation=cv2.INTER_LINEAR)
def PZ(q): u, v = P(q); return (u * Z, v * Z)
for i, l in enumerate(strands):
    pts_ = np.array([PZ(q) for q in l], np.int32)
    cv2.polylines(dbg, [pts_], False, (0, 140, 0), 2)
    m = pts_[len(pts_) // 2]; cv2.putText(dbg, f's{i}', (int(m[0]) + 3, int(m[1]) - 3), cv2.FONT_HERSHEY_SIMPLEX, .45, (0, 90, 0), 1)
for i, l in enumerate(inks):
    pts_ = np.array([PZ(q) for q in l], np.int32)
    cv2.polylines(dbg, [pts_], False, (200, 0, 160), 2)
    m = pts_[len(pts_) // 2]; cv2.putText(dbg, f'k{i}', (int(m[0]) + 3, int(m[1]) + 12), cv2.FONT_HERSHEY_SIMPLEX, .45, (150, 0, 120), 1)
ys, xs = np.nonzero(filled)
y0_, y1_, x0_, x1_ = max(0, ys.min() - 8) * Z, (ys.max() + 8) * Z, max(0, xs.min() - 8) * Z, (xs.max() + 8) * Z
cv2.imwrite(f'{HT}/{name}_dbg.png', dbg[y0_:y1_, x0_:x1_])
