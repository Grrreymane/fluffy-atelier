// make a list of states from compact specs: node test/mk.js > file
const base = {
  fox: { species: 'fox', fur: { main: '#f08a3a', sub: '#fff6ec', acc: '#3b2833', inner: '#fff1e2', nose: '#3b2833' }, eyes: { style: 'sparkle', color: '#3a9cf5' }, hair: { id: 'tuft', color: '#f6a24e' } },
  wolf: { species: 'wolf', fur: { main: '#8e98a9', sub: '#eef1f6', acc: '#4b5263', inner: '#e6e9f0', nose: '#2c2f3a' }, eyes: { style: 'boy', color: '#f2b632' }, hair: { id: 'messy', color: '#aab3c2' } },
  bear: { species: 'bear', fur: { main: '#a46f4b', sub: '#f1dcc3', acc: '#6b4630', inner: '#d9ab88', nose: '#3a2620' }, eyes: { style: 'round', color: '#3a2620' }, hair: { id: 'none', color: '#b88560' } },
  bunny: { species: 'bunny', fur: { main: '#fbf7f3', sub: '#ffffff', acc: '#ffb3c6', inner: '#ffc4d6', nose: '#ff8fab' }, eyes: { style: 'sparkle', color: '#e2577f' }, hair: { id: 'long', color: '#fff0e4' } },
  cat: { species: 'cat', fur: { main: '#3c3746', sub: '#57505f', acc: '#25212c', inner: '#ff9fb6', nose: '#2a2530' }, eyes: { style: 'cat', color: '#ffcf3a' }, hair: { id: 'bob', color: '#4a4456' } },
  tiger: { species: 'tiger', fur: { main: '#f39a38', sub: '#fff6ea', acc: '#2c2230', inner: '#fff6ea', nose: '#e8798f' }, eyes: { style: 'boy', color: '#8fcb40' }, hair: { id: 'pomp', color: '#3a2a26' } },
  deer: { species: 'deer', fur: { main: '#c98b55', sub: '#fff4e4', acc: '#5a3a29', inner: '#f2c9a6', nose: '#2e211c', antler: '#f0dcc0', spots: true }, eyes: { style: 'sparkle', color: '#6b3e26' }, hair: { id: 'braid', color: '#8a5a3a' } },
  rp: { species: 'redpanda', fur: { main: '#c9572b', sub: '#fff6ee', acc: '#3a2420', inner: '#6b2f1e', nose: '#2a1a17' }, eyes: { style: 'round', color: '#3a2420' }, hair: { id: 'curly', color: '#d9703f' } },
};
const specs = JSON.parse(process.argv[2]);
const out = specs.map(([b, body, pose, expr, wear, label, opts]) => Object.assign({ body, pose, expr, wear, _label: label || '', _opts: opts }, JSON.parse(JSON.stringify(base[b]))));
console.log(JSON.stringify(out));
