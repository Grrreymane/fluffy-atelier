import os
HT = os.environ.get('HAIRTRACE', '/tmp/hairtrace'); HR = os.environ.get('HAIRREF', '/tmp/hairref')
import os
# vectorize one hairstyle from a reference crop at 4x resolution, into our head coordinates.
# usage: trace4.py <name>   (settings in cfg.json; labels from label.py at the configured threshold)
# out: /tmp/hairtrace/<name>.json  { outer: [polys], shadows: [polys], strands: [polys], inks: [polys] } — all closed shapes
import sys, json, cv2, numpy as np
sys.path.insert(0, os.environ.get('HAIRTRACE', '/tmp/hairtrace'))
from fit import fit
name = sys.argv[1]
head, img_of, C = fit(name)
Z = 4
lab = np.load(f'{HT}/{name}_lab.npy')
im = cv2.imread(f'{HR}/{name}.png')
lum = (0.114 * im[:, :, 0] + 0.587 * im[:, :, 1] + 0.299 * im[:, :, 2])
im4 = cv2.resize(im, None, fx=Z, fy=Z, interpolation=cv2.INTER_CUBIC)
lum4 = (0.114 * im4[:, :, 0] + 0.587 * im4[:, :, 1] + 0.299 * im4[:, :, 2])
# --- the hair region at 1x (as in trace.py), grown to the middle of its ink line and filled
def labels(thr, ek):
    light = cv2.erode((lum >= thr).astype(np.uint8), np.ones((ek, ek), np.uint8))
    return cv2.connectedComponents(light, connectivity=4)[1]
if C.get('base'):
    # hair = the regions of a loose labelling that hold the seed points (head coords) ...
    B_ = C['base']; LB = labels(B_['thr'], B_.get('ek', 1))
    px = lambda q: tuple(int(round(v)) for v in img_of(*q))
    ids_ = [LB[px(q)[1], px(q)[0]] for q in B_['seeds']]
    if 0 in ids_: print('  warning: a seed lies on an ink line, ignored', [q for q, i in zip(B_['seeds'], ids_) if i == 0])
    hair = np.isin(LB, [i for i in ids_ if i != 0])
    # ... minus the regions of a stricter labelling that hold the face / ear seed points (grown back by the erosion)
    if C.get('minus'):
        M_ = C['minus']; LM = labels(M_['thr'], M_.get('ek', 1))
        cut = np.isin(LM, [LM[px(q)[1], px(q)[0]] for q in M_['seeds']]).astype(np.uint8)
        cut = cv2.dilate(cut, np.ones((M_.get('ek', 1) + 2, M_.get('ek', 1) + 2), np.uint8))
        hair &= ~cut.astype(bool)
    if C.get('hairline'):
        # hair whose lower edge melts into the forehead: everything of the region above a hand-drawn hairline
        hl = [img_of(*q) for q in C['hairline']]
        poly = np.array([[hl[0][0], -50]] + hl + [[hl[-1][0], -50]], np.int32)
        above = np.zeros(hair.shape, np.uint8); cv2.fillPoly(above, [poly], 1)
        hair &= above.astype(bool)
    hair = cv2.morphologyEx(hair.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)).astype(bool)
else:
    hair = np.isin(lab, C['ids'])
if C.get('drop'):
    L2 = cv2.connectedComponents((lum >= 115).astype(np.uint8), connectivity=4)[1]
    for (x, y) in C['drop']:
        hair &= ~cv2.dilate((L2 == L2[y, x]).astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
E = lambda r: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))
hair4 = cv2.resize(hair.astype(np.uint8), None, fx=Z, fy=Z, interpolation=cv2.INTER_NEAREST)
# silhouette: close the hair regions over the ink lines between them (closing may only add dark pixels, never
# background or face), then push the edge out to the middle of the outer ink line, fill holes, drop thin spurs
ink4 = (lum4 < C.get('silInk', 150)).astype(np.uint8)
m = cv2.morphologyEx(hair4, cv2.MORPH_CLOSE, E(C.get('closeR', 12))) & (hair4 | ink4)
m = m | (cv2.dilate(m, E(C.get('edgeR', 8))) & ink4)
filled = np.zeros_like(m)
cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
cv2.drawContours(filled, [c for c in cnts if cv2.contourArea(c) >= C.get('minArea', 40) * Z * Z], -1, 1, -1)
filled = cv2.morphologyEx(filled, cv2.MORPH_OPEN, E(C.get('spur', 5)))
sil4 = cv2.GaussianBlur(filled.astype(np.float32), (0, 0), Z * .7) > .5
def polys(mask, eps, min_area):
    cnts, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    out = []
    for c in cnts:
        if cv2.contourArea(c) < min_area: continue
        p = cv2.approxPolyDP(c, eps, True)[:, 0, :].astype(float)
        if len(p) < 3: continue
        out.append([head(x / Z, y / Z) for x, y in p])
    return out
def clean(mask, min_px):
    n, lb, st, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), connectivity=8)
    keep = np.zeros(n, bool); keep[1:] = st[1:, cv2.CC_STAT_AREA] >= min_px
    return keep[lb]
outer = polys(sil4, 2.6, 400)
inner = cv2.erode(sil4.astype(np.uint8), E(int(Z * C.get('inset', 3)))).astype(bool)
# --- inner ink lines (dark): kept as filled shapes so their thick-thin taper survives
ink = (lum4 < C.get('inkLum', 100)) & inner
ink = cv2.morphologyEx(ink.astype(np.uint8), cv2.MORPH_OPEN, E(1)).astype(bool)
# a dark area wider than an ink line (about 3.5 px at 1x) is shading (e.g. the inside of a curl), not a line
wide = cv2.morphologyEx(cv2.morphologyEx(ink.astype(np.uint8), cv2.MORPH_CLOSE, E(3)), cv2.MORPH_OPEN, E(C.get('inkWide', 8))).astype(bool)
wide = cv2.dilate(wide.astype(np.uint8), E(3)).astype(bool) & ink
ink = ink & ~wide
ink = clean(ink, C.get('inkMin', 260))
ink = cv2.GaussianBlur(ink.astype(np.float32), (0, 0), 1.2) > .5
# --- strand strokes (thin, mid-dark): black top-hat, away from the ink
L8 = np.clip(lum4, 0, 255).astype(np.uint8)
th = cv2.morphologyEx(L8, cv2.MORPH_BLACKHAT, E(10))
strand = (th > C.get('strandTH', 22)) & inner & ~cv2.dilate(ink.astype(np.uint8), E(3)).astype(bool) & (lum4 >= C.get('inkLum', 100))
strand = cv2.morphologyEx(strand.astype(np.uint8), cv2.MORPH_OPEN, E(1)).astype(bool)
strand = clean(strand, C.get('strandMin', 220))
strand = cv2.GaussianBlur(strand.astype(np.float32), (0, 0), 1.4) > .5
# --- shading: broad darker areas of the hair (not lines)
dark = ((lum4 < C.get('shadeLum', 135)) & sil4 & ~cv2.dilate((ink | strand).astype(np.uint8), E(2)).astype(bool)) | wide
dark = cv2.morphologyEx(dark.astype(np.uint8), cv2.MORPH_OPEN, E(9)).astype(bool)
dark = clean(dark, 900)
dark = cv2.GaussianBlur(dark.astype(np.float32), (0, 0), 6) > .5
res = {'outer': outer, 'shadows': polys(dark & sil4, 4.0, 900), 'strands': polys(strand, 2.0, 150), 'inks': polys(ink, 2.0, 150)}
if C.get('hideHairline'): res['open'] = [C['hairline']]
json.dump(res, open(f'{HT}/{name}.json', 'w'))
print(name, {k: len(v) for k, v in res.items()}, 'points', sum(len(p) for v in res.values() for p in v))
# debug overlay at 2x
dbg = cv2.addWeighted(im4, .35, np.full_like(im4, 255), .65, 0)
dbg[dark & sil4] = (120, 160, 235); dbg[strand] = (0, 150, 0); dbg[ink] = (170, 0, 140)
cv2.drawContours(dbg, cv2.findContours(sil4.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)[0], -1, (30, 30, 30), 2)
ys, xs = np.nonzero(sil4)
cv2.imwrite(f'{HT}/{name}_dbg4.png', cv2.resize(dbg[max(0, ys.min() - 20):ys.max() + 20, max(0, xs.min() - 20):xs.max() + 20], None, fx=.5, fy=.5, interpolation=cv2.INTER_AREA))
