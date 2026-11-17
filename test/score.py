from playwright.sync_api import sync_playwright
cases = [(0, 0, 'Ivy theme + Ivy preset'), (1, 1, 'Workwear theme + workwear preset'), (2, 4, 'Gentleman + gentleman preset'), (3, 9, 'Beach + beach preset'),
         (4, 10, 'Winter + winter preset'), (5, 7, 'Ball + magical preset'), (6, 8, 'Street + street preset'), (8, 6, 'Sweet + lolita preset'),
         (9, 11, 'CNY + newyear preset'), (11, 3, 'Aviator + aviator preset'), (0, 6, 'Ivy theme + lolita (bad)'), (3, 10, 'Beach + winter (bad)')]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': 1280, 'height': 900})
    pg.goto('file://' + __import__('os').path.abspath(__file__ + '/../../dist/game.html'))
    pg.wait_for_timeout(1800)
    for theme, preset, label in cases:
        pg.evaluate(f"Math.random = () => {theme}/12 + 0.001")
        pg.click('#btnChallenge'); pg.wait_for_timeout(150)
        pg.click('[data-start]'); pg.wait_for_timeout(150)
        pg.click('#btnPresets'); pg.wait_for_timeout(250)
        pg.click(f'[data-preset="{preset}"]'); pg.wait_for_timeout(150)
        pg.click('#btnChallenge'); pg.wait_for_timeout(1700)
        total = pg.inner_text('#totalN'); title = pg.inner_text('.m-title'); scores = pg.eval_on_selector_all('.judge .sc', 'e => e.map(x => x.dataset.score)')
        print(f'{label:34s} {title:16s} total={total} judges={scores}')
        pg.click('[data-close]'); pg.wait_for_timeout(100)
        pg.click('#btnQuit'); pg.wait_for_timeout(100)
    b.close()
