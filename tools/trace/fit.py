import os
HT = os.environ.get('HAIRTRACE', '/tmp/hairtrace'); HR = os.environ.get('HAIRREF', '/tmp/hairref')
import os
# shared mapping from a reference crop to our head coordinates.
# per-reference fit: eye-based coords (anchors.json), then about the eye centre (200,224): x by KX, y above the eyes
# by KYU, y below by KYD.
import json
CFG = json.load(open(os.path.join(HT, 'cfg.json')))
A_ALL = json.load(open(os.path.join(os.environ.get('HAIRREF', '/tmp/hairref'), 'anchors.json')))
def fit(name):
    A, c = A_ALL[name], CFG[name]
    KX, KYU, KYD = c.get('KX', .86), c.get('KYU', .86), c.get('KYD', .835)
    def head(x, y):
        X = 200 + (x - A['cx']) * A['s']; Y = 224 + (y - A['cy']) * A['s']
        return [round(float(200 + (X - 200) * KX), 1), round(float(224 + (Y - 224) * (KYU if Y < 224 else KYD)), 1)]
    def img(X, Y):
        Xr = 200 + (X - 200) / KX; Yr = 224 + (Y - 224) / (KYU if Y < 224 else KYD)
        return A['cx'] + (Xr - 200) / A['s'], A['cy'] + (Yr - 224) / A['s']
    return head, img, c
