# old saves (red panda, removed hairstyles, broken values) must load without errors
import json
from playwright.sync_api import sync_playwright
STORE = 'fluffy-atelier-v1'
cases = {
  'redpanda+ivy': {'v': 1, 'species': 'redpanda', 'palIdx': 2, 'fur': {'main': '#c9572b'}, 'body': 'boy', 'pose': 'stand', 'expr': 'smile', 'name': '团团',
                   'eyes': {'style': 'boy', 'color': '#3a2420'}, 'hair': {'id': 'ivy', 'color': '#d9703f'}, 'wear': {'top': {'id': 'ocbd'}}, 'bg': 'campus'},
  'fox+twintails': {'v': 1, 'species': 'fox', 'palIdx': 0, 'fur': {'main': '#f08a3a'}, 'body': 'girl', 'pose': 'wave', 'expr': 'grin', 'name': '小橘',
                    'eyes': {'style': 'sparkle', 'color': '#3a9cf5'}, 'hair': {'id': 'twintails', 'color': '#ff9fc8'}, 'wear': {'dress': {'id': 'qipao'}, 'hat': {'id': 'nope'}}, 'bg': 'x'},
  'garbage': {'species': 5, 'fur': 'x', 'wear': None},
  'old long hair': {'v': 1, 'species': 'cat', 'palIdx': 1, 'fur': {'main': '#f5b065'}, 'body': 'girl', 'pose': 'stand', 'expr': 'smile', 'name': '咪咪',
                    'eyes': {'style': 'cat', 'color': '#ffcf3a'}, 'hair': {'id': 'long', 'color': '#f5b065'}, 'wear': {'top': {'id': 'tee'}}, 'bg': 'campus'},
  'tuft fringe': {'v': 1, 'species': 'fox', 'palIdx': 0, 'fur': {'main': '#f08a3a'}, 'body': 'boy', 'pose': 'stand', 'expr': 'smile', 'name': '橘子',
                  'eyes': {'style': 'boy', 'color': '#43a4e5'}, 'hair': {'id': 'fringe', 'color': '#f08a3a'}, 'wear': {'top': {'id': 'tee'}}, 'bg': 'campus'},
  'back w/o front': {'v': 1, 'species': 'bear', 'palIdx': 0, 'fur': {'main': '#a46f4b'}, 'body': 'chub', 'pose': 'stand', 'expr': 'smile', 'name': '熊熊',
                     'eyes': {'style': 'round', 'color': '#5a3a20'}, 'hair': {'id': 'none', 'color': '#a46f4b'}, 'backHair': {'id': 'wavy'}, 'wear': {'top': {'id': 'tee'}}, 'bg': 'campus'},
  'removed pony': {'v': 1, 'species': 'deer', 'palIdx': 0, 'fur': {'main': '#c98b55'}, 'body': 'girl', 'pose': 'stand', 'expr': 'smile', 'name': '鹿鹿',
                   'eyes': {'style': 'sparkle', 'color': '#5a3a20'}, 'hair': {'id': 'sweep', 'color': '#c98b55'}, 'backHair': {'id': 'pony'}, 'wear': {'top': {'id': 'tee'}}, 'bg': 'campus'},
}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    for name, save in cases.items():
        ctx = b.new_context(viewport={'width': 1280, 'height': 900})
        pg = ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + __import__('os').path.abspath(__file__ + '/../../dist/game.html'))
        pg.evaluate(f"localStorage.setItem('{STORE}', {json.dumps(json.dumps(save))})")
        pg.reload(); pg.wait_for_timeout(900)
        st = pg.evaluate("JSON.parse(localStorage.getItem('%s') || 'null')" % STORE)
        name_shown = pg.evaluate("(document.querySelector('#charName')||{}).value || (document.querySelector('#charName')||{}).textContent || ''")
        print(f"{name:15s} errors={len(errs)} -> species={st and st.get('species')} hair={st and st['hair']['id']} back={st and (st.get('backHair') or {}).get('id')} name={st and st.get('name')!r} wear={st and list(st['wear'].keys())}")
        for e in errs: print('   ERR', e)
        ctx.close()
    b.close()
