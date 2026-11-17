import os
HT = os.environ.get('HAIRTRACE', '/tmp/hairtrace'); HR = os.environ.get('HAIRREF', '/tmp/hairref')
import os
# vectorize the long hair of a reference (back hair / ponytail) into our head coordinates.
# usage: trace_long.py <name>   settings in cfg.json[name]['parts'] = { partName: {ids, yTop, yMid, rowfill} }
# hair pieces are orange components (orange.py) separated by ink; arms, face, neck and ears are left out by id.
import sys, json, cv2, numpy as np
sys.path.insert(0, os.environ.get('HAIRTRACE', '/tmp/hairtrace'))
from fit import fit
name = sys.argv[1]
head, img_of, C = fit(name)
Z = 4
lab = np.load(f'{HT}/{name}_olab.npy')
im = cv2.imread(f'{HR}/{name}.png')
lum = (0.114 * im[:, :, 0] + 0.587 * im[:, :, 1] + 0.299 * im[:, :, 2])
im4 = cv2.resize(im, None, fx=Z, fy=Z, interpolation=cv2.INTER_CUBIC)
lum4 = (0.114 * im4[:, :, 0] + 0.587 * im4[:, :, 1] + 0.299 * im4[:, :, 2])
E = lambda r: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))
def polys(mask, eps, min_area):
    cnts, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    out = []
    for c in cnts:
        if cv2.contourArea(c) < min_area: continue
        p = cv2.approxPolyDP(c, eps, True)[:, 0, :].astype(float)
        if len(p) >= 3: out.append([head(x / Z, y / Z) for x, y in p])
    return out
def clean(mask, min_px):
    n, lb, st, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), connectivity=8)
    keep = np.zeros(n, bool); keep[1:] = st[1:, cv2.CC_STAT_AREA] >= min_px
    return keep[lb]
res = {}
dbg = cv2.addWeighted(im4, .35, np.full_like(im4, 255), .65, 0)
# the reference face — nothing inside it belongs to the hair. After the fit the reference face matches our fox head,
# so our head outline (mapped into the reference) marks it, grown a little to take in the face's own outline
head_pts = json.load(open('/tmp/hairtrace/foxhead.json'))
face = np.zeros(lum.shape, np.uint8)
cv2.fillPoly(face, [np.array([img_of(x, y) for x, y in head_pts], np.int32)], 1)
face4 = cv2.resize(cv2.dilate(face, np.ones((C.get('faceGrow', 7), C.get('faceGrow', 7)), np.uint8)), None, fx=Z, fy=Z, interpolation=cv2.INTER_NEAREST).astype(bool)
for part, P in C['parts'].items():
    hair = np.isin(lab, P['ids']).astype(np.uint8)
    hair4 = cv2.resize(hair, None, fx=Z, fy=Z, interpolation=cv2.INTER_NEAREST)
    ink4 = (lum4 < 150).astype(np.uint8)
    m = cv2.morphologyEx(hair4, cv2.MORPH_CLOSE, E(P.get('closeR', 14))) & (hair4 | ink4)
    m = m | (cv2.dilate(m, E(8)) & ink4)
    # rows above yTop belong to the head (drawn as a cap at render time)
    yTop = img_of(200, P.get('yTop', -999))[1] * Z
    m[:max(0, int(yTop))] = 0
    if P.get('rowfill'):
        # behind the body: fill each row between the outermost hair pixels, from yTop down to yMid; the bottom of
        # the fill is cut into points (hair ends), so no straight edge shows between the arms and the body
        yMid = img_of(200, P['yMid'])[1] * Z
        per = 34 / (A_s := (img_of(234, 0)[0] - img_of(200, 0)[0])) if False else None
        xs0 = img_of(200, 0)[0] * Z; unit = (img_of(201, 0)[0] - img_of(200, 0)[0]) * Z
        yFill = img_of(200, P.get('fillTop', 250))[1] * Z      # above this (beside the face) the hair is left as traced
        for y in range(max(0, int(yFill)), min(m.shape[0], int(yMid))):
            xs = np.nonzero(m[y])[0]
            if len(xs) < 2: continue
            xa, xb = xs.min(), xs.max()
            depth = (yMid - y) / (unit * 26)                       # 0 at the very bottom .. 1 at 26 head units up
            for x in range(xa, xb + 1):
                u = ((x - xs0) / (unit * 34)) % 1                  # tips every 34 head units
                if depth >= 1 or abs(u - .5) * 2 <= depth: m[y, x] = 1
    # thin horizontal slivers (a stray hair end pulled along a row by the fill) go; hanging strands stay
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (1, P.get('vopen', 22))))
    filled = np.zeros_like(m)
    cnts, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    cv2.drawContours(filled, [c for c in cnts if cv2.contourArea(c) >= 300 * Z * Z], -1, 1, -1)
    filled = cv2.morphologyEx(filled, cv2.MORPH_OPEN, E(4))
    sil4 = cv2.GaussianBlur(filled.astype(np.float32), (0, 0), Z * .8) > .5
    inner = cv2.erode(sil4.astype(np.uint8), E(12)).astype(bool)
    ink = (lum4 < 100) & inner & cv2.dilate(hair4, E(10)).astype(bool) & ~face4
    ink = cv2.morphologyEx(ink.astype(np.uint8), cv2.MORPH_OPEN, E(1)).astype(bool)
    wide = cv2.morphologyEx(cv2.morphologyEx(ink.astype(np.uint8), cv2.MORPH_CLOSE, E(3)), cv2.MORPH_OPEN, E(13)).astype(bool)
    wide = cv2.dilate(wide.astype(np.uint8), E(3)).astype(bool) & ink
    ink = clean(ink & ~wide, 260)
    # arms crossing the hair are not hair lines: drop ink inside the excluded arm boxes
    for (x0, y0, x1, y1) in P.get('noInk', []):
        a = img_of(x0, y0); b = img_of(x1, y1)
        ink[int(a[1] * Z):int(b[1] * Z), int(a[0] * Z):int(b[0] * Z)] = False
    ink = cv2.GaussianBlur(ink.astype(np.float32), (0, 0), 1.2) > .5
    L8 = np.clip(lum4, 0, 255).astype(np.uint8)
    th = cv2.GaussianBlur(cv2.morphologyEx(L8, cv2.MORPH_BLACKHAT, E(10)), (0, 0), 1.0)
    strand = (th > 22) & inner & ~cv2.dilate(ink.astype(np.uint8), E(3)).astype(bool) & (lum4 >= 100) & (hair4 > 0) & ~face4
    strand = clean(cv2.morphologyEx(strand.astype(np.uint8), cv2.MORPH_OPEN, E(1)).astype(bool), 260)
    strand = cv2.GaussianBlur(strand.astype(np.float32), (0, 0), 1.4) > .5
    dark = (((lum4 < 135) & sil4 & (hair4 > 0) & ~cv2.dilate((ink | strand).astype(np.uint8), E(2)).astype(bool)) | (wide & sil4)) & ~face4
    dark = clean(cv2.morphologyEx(dark.astype(np.uint8), cv2.MORPH_OPEN, E(9)).astype(bool), 900)
    dark = cv2.GaussianBlur(dark.astype(np.float32), (0, 0), 6) > .5
    # drop stray bits: keep pieces at least a tenth the size of the biggest
    n_, lb_, st_, _ = cv2.connectedComponentsWithStats(sil4.astype(np.uint8), connectivity=8)
    if n_ > 2:
        big_ = st_[1:, cv2.CC_STAT_AREA].max()
        keep_ = np.zeros(n_, bool); keep_[1:] = st_[1:, cv2.CC_STAT_AREA] >= big_ * .1
        sil4 = keep_[lb_]
    res[part] = {'outer': polys(sil4, 4.0, 400), 'shadows': polys(dark & sil4, 6.0, 1600), 'strands': polys(strand, 2.4, 300), 'inks': polys(ink, 2.4, 300)}
    col = (60, 60, 200) if part == 'drape' else (40, 40, 40)
    dbg[dark & sil4] = (120, 160, 235); dbg[strand] = (0, 150, 0); dbg[ink] = (170, 0, 140)
    dbg[face4 & (np.indices(face4.shape).sum(0) % 9 == 0)] = (0, 0, 255)
    cv2.drawContours(dbg, cv2.findContours(sil4.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)[0], -1, col, 3)
    print(name, part, {k: len(v) for k, v in res[part].items()}, 'points', sum(len(p) for v in res[part].values() for p in v))
json.dump(res, open(f'{HT}/{name}_back.json', 'w'))
cv2.imwrite(f'{HT}/{name}_back_dbg.png', cv2.resize(dbg, None, fx=.25, fy=.25, interpolation=cv2.INTER_AREA))
