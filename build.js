// Build: concatenate sources into dist/core.js (node-testable) and dist/game.html (single file)
const fs = require('fs');
const CORE = ['util', 'defs', 'body', 'species', 'toon', 'face', 'hair_data', 'hair', 'render', 'wear_base', 'wear_tops', 'wear_bottoms', 'wear_outer', 'wear_feet', 'wear_head', 'wear_acc', 'scenes'];
const exist = f => fs.existsSync(`src/${f}.js`);
const core = CORE.filter(exist).map(f => `/* ---- ${f}.js ---- */\n` + fs.readFileSync(`src/${f}.js`, 'utf8')).join('\n') + '\nindexItems();\n';
fs.writeFileSync('dist/core.js', core + '\nif (typeof module !== "undefined") module.exports = { renderCharacter, ITEMS, ITEM_INDEX, HAIRS, BACK_HAIRS, SPECIES, SPECIES_ORDER, EYE_STYLES, EXPRESSIONS, POSES, BODIES, PATTERNS, SCENES, renderScene, makeCtx };\n');
if (fs.existsSync('src/template.html')) {
  let html = fs.readFileSync('src/template.html', 'utf8');
  const css = fs.readFileSync('src/style.css', 'utf8');
  const ui = fs.existsSync('src/ui.js') ? fs.readFileSync('src/ui.js', 'utf8') : '';
  html = html.replace('/*__CSS__*/', () => css).replace('/*__JS__*/', () => core + '\n' + ui);
  fs.writeFileSync('dist/game.html', html);
  console.log('game.html', (html.length / 1024).toFixed(1) + 'KB');
}
console.log('core.js', (core.length / 1024).toFixed(1) + 'KB');
