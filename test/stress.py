from playwright.sync_api import sync_playwright
groups = {'char':['species','fur','body','eyes','expr','hair','backHair','pose'],'wear':['top','bottom','dress','outer','socks','shoes'],'acc':['hat','glasses','neck','acc','held','back','face'],'scene':['bg']}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': 1280, 'height': 900})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_TUNNEL' not in m.text else None)
    pg.goto('file://' + __import__('os').path.abspath(__file__ + '/../../dist/game.html'))
    pg.wait_for_timeout(500)
    nan = []
    count = 0
    for body in ['girl', 'boy', 'chub']:
        pg.click('[data-g=char]'); pg.click('[data-c=body]'); pg.wait_for_timeout(100)
        pg.click(f'[data-id={body}]'); pg.wait_for_timeout(100)
        for g, cats in groups.items():
            pg.click(f'[data-g={g}]')
            for c in cats:
                pg.click(f'[data-c={c}]')
                ids = pg.eval_on_selector_all('#items [data-id]', 'els => els.map(e => e.dataset.id)')
                for i in ids:
                    pg.click(f'#items [data-id="{i}"]', force=True)
                    count += 1
                    bad = pg.evaluate("() => { const h = document.querySelector('#charWrap').innerHTML; return /NaN|undefined|Infinity/.test(h) ? h.match(/.{60}(NaN|undefined|Infinity).{30}/)?.[0] : null; }")
                    if bad: nan.append((body, c, i, bad))
                # scroll the item list to render lazy thumbs and check them too
                pg.evaluate("() => { const el = document.querySelector('#items'); el.scrollTop = 1e5; el.scrollLeft = 1e5; }")
                pg.wait_for_timeout(60)
                badt = pg.evaluate("() => { const h = document.querySelector('#items').innerHTML; return /NaN|undefined|Infinity/.test(h) ? h.match(/.{60}(NaN|undefined|Infinity).{30}/)?.[0] : null; }")
                if badt: nan.append((body, c, 'thumbs', badt))
    print('clicked', count)
    for n in nan[:20]: print('NAN', n)
    for e in errs[:20]: print('ERR', e)
    b.close()
