# Shadows are multiplied on (mix-blend-mode: multiply). A shadow inside a clipped / masked / faded group that does
# not also hold the fill under it multiplies with nothing and shows as a flat lilac patch. This test renders ~190
# characters twice from the built core, with the shadow colour swapped for white (multiplying by white must change
# nothing) and with the shadows switched off, in Chrome, and reports any cell where the two differ. It also checks
# the live game with its idle animations frozen at three moments.
# usage: python3 test/shadow_iso.py
import json, os, subprocess, io, tempfile
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TMP = tempfile.mkdtemp(prefix='shadow_iso_')
core = open(os.path.join(ROOT, 'dist/core.js'), encoding='utf8').read()
game = open(os.path.join(ROOT, 'dist/game.html'), encoding='utf8').read()
TINT = "const SHADOW_TINT = '#d9c8e0', SHADOW_GAIN = 7.3,"
assert core.count(TINT) == 1 and game.count(TINT) == 1, 'shadow constants not found'
# white: shadows multiply white (no visible change if they blend with what is under them); none: no shadows.
# Both use a white tint so the back hair (multiplied by hand) is the same in both.
VARIANTS = {'white': "const SHADOW_TINT = '#ffffff', SHADOW_GAIN = 7.3,", 'none': "const SHADOW_TINT = '#ffffff', SHADOW_GAIN = 0,"}
for k, v in VARIANTS.items():
    open(f'{TMP}/core_{k}.js', 'w', encoding='utf8').write(core.replace(TINT, v))
    open(f'{TMP}/game_{k}.html', 'w', encoding='utf8').write(game.replace(TINT, v))

GEN = r"""
const fs = require('fs');
const [, , coreFile, out] = process.argv;
const C = require(coreFile);
const states = [];
const base = { top: { id: 'tee' }, bottom: { id: 'jeans' } };
const mk = (sp, body, pose, wear, hair = 'none', back = 'none', pal = 0) => { const p = C.SPECIES[sp].pals[pal % C.SPECIES[sp].pals.length]; return { species: sp, fur: Object.assign({}, p), body, pose, expr: 'smile', eyes: { style: 'sparkle', color: p.eye }, hair: { id: hair }, backHair: { id: back }, wear }; };
let k = 0;
for (const slot of Object.keys(C.ITEMS)) for (const it of C.ITEMS[slot]) {
  const w = Object.assign({}, base); if (slot === 'dress') { delete w.top; delete w.bottom; } w[slot] = { id: it.id };
  k++;
  states.push([slot + ':' + it.id, mk(C.SPECIES_ORDER[k % 7], ['girl', 'boy', 'chub'][k % 3], slot === 'held' ? 'stand' : C.POSES[k % C.POSES.length].id, w)]);
}
for (const sp of C.SPECIES_ORDER) for (const body of ['girl', 'boy', 'chub']) states.push([sp + '/' + body, mk(sp, body, 'stand', {}, 'none', 'none', 1)]);
for (const pose of C.POSES.map(p => p.id)) for (const body of ['girl', 'boy', 'chub']) states.push(['pose ' + pose + '/' + body, mk('tiger', body, pose, { top: { id: 'ocbd', pat: 'gingham' }, bottom: { id: 'pleated', pat: 'tartan' }, outer: { id: 'tweed' } })]);
for (const h of C.HAIRS.map(x => x.id)) states.push(['hair ' + h, mk('bunny', 'girl', 'stand', base, h, h === 'none' ? 'none' : 'wavy', 1)]);
for (const pat of C.PATTERNS.map(p => p.id)) states.push(['pattern ' + pat, mk('cat', 'boy', 'stand', { top: { id: 'flannel', pat }, bottom: { id: 'cord', pat }, outer: { id: 'chore', pat } })]);
let n = 0;
fs.writeFileSync(out + '.html', `<!doctype html><meta charset=utf-8><style>body{margin:0;background:#fff;width:1500px;display:grid;grid-template-columns:repeat(10,150px)}svg{width:150px;height:270px;display:block}</style>${states.map(([t, s]) => C.renderCharacter(s, { id: 'q' + (++n), noAnim: true })).join('')}`);
fs.writeFileSync(out + '.json', JSON.stringify(states.map(s => s[0])));
"""
open(f'{TMP}/gen.js', 'w').write(GEN)
for k in VARIANTS: subprocess.run(['node', f'{TMP}/gen.js', f'{TMP}/core_{k}.js', f'{TMP}/sheet_{k}'], check=True)
labels = json.load(open(f'{TMP}/sheet_white.json'))

def blobs(a, b):
    # differences that survive a 1px erosion (anti-aliasing slivers along clip edges do not count)
    return ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v > 10 else 0).filter(ImageFilter.MinFilter(3))

LIVE = {"species": "fox", "body": "girl", "pose": "wave", "hair": {"id": "curtain"}, "backHair": {"id": "straight"},
        "wear": {"top": {"id": "blouse"}, "bottom": {"id": "pleated", "pat": "tartan"}, "outer": {"id": "cardigan"}, "hat": {"id": "beret"},
                 "socks": {"id": "knee"}, "shoes": {"id": "maryjane"}, "held": {"id": "boba"}}}
shots, live = {}, {}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': 1500, 'height': 900})
    for k in VARIANTS:
        pg.goto(f'file://{TMP}/sheet_{k}.html'); pg.wait_for_timeout(1200)
        shots[k] = Image.open(io.BytesIO(pg.screenshot(full_page=True))).convert('RGB')
    for k in VARIANTS:
        ctx = b.new_context(viewport={'width': 1280, 'height': 800}); g = ctx.new_page()
        g.goto(f'file://{TMP}/game_{k}.html'); g.wait_for_timeout(1000)
        g.evaluate("(patch) => { const s = JSON.parse(localStorage.getItem('fluffy-atelier-v1')); Object.assign(s, patch); localStorage.setItem('fluffy-atelier-v1', JSON.stringify(s)); }", LIVE)
        g.reload(); g.wait_for_timeout(1500)
        for t in (300, 900, 1700):
            g.evaluate(f"document.getAnimations().forEach(a => {{ a.pause(); a.currentTime = {t}; }})"); g.wait_for_timeout(120)
            live[(k, t)] = Image.open(io.BytesIO(g.screenshot(clip={'x': 0, 'y': 50, 'width': 768, 'height': 750}))).convert('RGB')
        ctx.close()
    b.close()

d = blobs(shots['white'], shots['none'])
bad = []
for i, lab in enumerate(labels):
    x, y = (i % 10) * 150, (i // 10) * 270
    cell = d.crop((x, y, x + 150, y + 270))
    if cell.getbbox(): bad.append((lab, sum(cell.histogram()[255:]), cell.getbbox()))
live_bad = [t for t in (300, 900, 1700) if blobs(live[('white', t)], live[('none', t)]).getbbox()]
print(f'{len(labels)} characters checked, {len(bad)} with shadows cut off from their fill', bad[:10])
print(f'live game (3 animation moments): {len(live_bad)} with problems', live_bad)
raise SystemExit(1 if bad or live_bad else 0)
