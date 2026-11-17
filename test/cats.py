from playwright.sync_api import sync_playwright
groups = {'char':['species','fur','body','eyes','expr','hair','backHair','pose'],'wear':['top','bottom','dress','outer','socks','shoes'],'acc':['hat','glasses','neck','acc','held','back','face'],'scene':['bg']}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': 1280, 'height': 1000})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + __import__('os').path.abspath(__file__ + '/../../dist/game.html'))
    pg.wait_for_timeout(600)
    for g, cats in groups.items():
        pg.click(f'[data-g={g}]'); pg.wait_for_timeout(150)
        for c in cats:
            pg.click(f'[data-c={c}]'); pg.wait_for_timeout(250)
            # expand items area to show all tiles
            pg.evaluate("document.querySelector('#items').style.maxHeight='none'")
            el = pg.query_selector('#drawer')
            el.screenshot(path=f'out/cat_{c}.png')
    for e in errs: print('ERR', e)
    b.close()
