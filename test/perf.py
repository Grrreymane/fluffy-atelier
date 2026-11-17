from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': 390, 'height': 844})
    pg.goto('file://' + __import__('os').path.abspath(__file__ + '/../../dist/game.html'))
    pg.wait_for_timeout(600)
    r = pg.evaluate("""async () => {
      const out = {};
      const t = async (name, fn) => { const t0 = performance.now(); fn(); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); out[name] = Math.round(performance.now() - t0); };
      await t('cat_outer', () => document.querySelector('[data-c=outer]').click());
      await t('sel_tweed', () => document.querySelector('[data-id=tweed]').click());
      await t('color', () => document.querySelector('[data-col="#2f4a7a"]').click());
      document.querySelector('[data-g=char]').click();
      await t('cat_species', () => document.querySelector('[data-c=species]').click());
      await t('sel_wolf', () => document.querySelector('[data-id=wolf]').click());
      await t('cat_pose', () => document.querySelector('[data-c=pose]').click());
      await t('random', () => document.querySelector('#btnRandom').click());
      await t('presets', () => document.querySelector('#btnPresets').click());
      const t0 = performance.now(); for (let i = 0; i < 20; i++) renderCharacter(JSON.parse(localStorage.getItem('fluffy-atelier-v1') || 'null') || {}, {id:'pp'+i}); out.render20 = Math.round(performance.now() - t0);
      return out;
    }""")
    print(r)
    b.close()
