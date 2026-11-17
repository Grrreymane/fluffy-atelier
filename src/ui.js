/* ===== ui.js — the game: state, wardrobe UI, challenge, photo ===== */
(() => {
'use strict';
const $ = s => document.querySelector(s);
const clone = o => JSON.parse(JSON.stringify(o));
const pick = a => a[Math.floor(Math.random() * a.length)];
const chance = p => Math.random() < p;

/* ---------- icons ---------- */
const sv = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}${extra}</svg>`;
const ICO = {
  undo: sv('<path d="M8 5L4 9l4 4"/><path d="M4 9h10a6 6 0 0 1 0 12H9"/>'),
  dice: sv('<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.3" fill="currentColor"/>'),
  soundOn: sv('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'),
  musicOn: sv('<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>'),
  musicOff: sv('<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/><path d="M3 3l18 18"/>'),
  soundOff: sv('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>'),
  camera: sv('<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.6"/>'),
  sparkle: sv('<path d="M12 3c.8 4.6 2.4 6.2 7 7-4.6.8-6.2 2.4-7 7-.8-4.6-2.4-6.2-7-7 4.6-.8 6.2-2.4 7-7z" fill="currentColor" stroke="none"/><path d="M19 15.5c.3 1.6.9 2.2 2.5 2.5-1.6.3-2.2.9-2.5 2.5-.3-1.6-.9-2.2-2.5-2.5 1.6-.3 2.2-.9 2.5-2.5z" fill="currentColor" stroke="none"/>'),
  trophy: sv('<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v3M8 20h8M9 17h6"/>'),
  paw: sv('<ellipse cx="12" cy="16" rx="4.6" ry="3.8" fill="currentColor" stroke="none"/><circle cx="6" cy="10.5" r="2" fill="currentColor" stroke="none"/><circle cx="9.5" cy="6.5" r="2" fill="currentColor" stroke="none"/><circle cx="14.5" cy="6.5" r="2" fill="currentColor" stroke="none"/><circle cx="18" cy="10.5" r="2" fill="currentColor" stroke="none"/>'),
  drop: sv('<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5"/>'),
  body: sv('<circle cx="12" cy="5" r="2.6"/><path d="M8 21l1-7-3-1 2-5h8l2 5-3 1 1 7"/>'),
  eye: sv('<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="3" fill="currentColor"/>'),
  smile: sv('<circle cx="12" cy="12" r="9"/><path d="M8 14.5a4.5 4.5 0 0 0 8 0"/><circle cx="9" cy="9.5" r=".9" fill="currentColor"/><circle cx="15" cy="9.5" r=".9" fill="currentColor"/>'),
  hair: sv('<path d="M5 15c0-7 3-11 7-11s7 4 7 11"/><path d="M5 15c2-1 3-4 3.5-7M19 15c-2-1-3-4-3.5-7M12 4c-1 3-3 5-6 6"/>'),
  backhair: sv('<path d="M6 21V11a6 6 0 0 1 12 0v10"/><path d="M6 21l2-2 2 2M14 21l2-2 2 2"/><path d="M9 12.5a3 3 0 0 0 6 0"/>'),
  pose: sv('<circle cx="12" cy="4.5" r="2.2"/><path d="M4 8l8 2 8-2M12 10v5M12 15l-4 6M12 15l4 6"/>'),
  tee: sv('<path d="M8 3l-5 3 2 4 3-1v12h8V9l3 1 2-4-5-3a4 4 0 0 1-8 0z"/>'),
  pants: sv('<path d="M6 3h12l1 18h-5l-2-11-2 11H5z"/><path d="M6 6h12"/>'),
  dress: sv('<path d="M9 3h6l-1 5 5 13H5l5-13z"/><path d="M8.5 9h7"/>'),
  jacket: sv('<path d="M8 3L3 6v15h6V9l3 4 3-4v12h6V6l-5-3-4 5z"/>'),
  sock: sv('<path d="M8 3h7v9l3 4a3 3 0 0 1-2 5h-3a3 3 0 0 1-2-1l-3-4z"/><path d="M8 7h7"/>'),
  shoe: sv('<path d="M3 17V9h5l2 3 5 1c3 .6 6 1.6 6 4v1H3z"/><path d="M3 18h18"/>'),
  hat: sv('<path d="M2 17c4 2 16 2 20 0"/><path d="M6 16.5V10a6 6 0 0 1 12 0v6.5"/><path d="M6 13h12"/>'),
  glasses: sv('<circle cx="6.5" cy="13" r="3.8"/><circle cx="17.5" cy="13" r="3.8"/><path d="M10.3 12.5c1.2-1 2.2-1 3.4 0M2.7 12L2 9M21.3 12l.7-3"/>'),
  bow: sv('<path d="M12 12L4 7v10zM12 12l8-5v10z"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/>'),
  watch: sv('<circle cx="12" cy="12" r="5"/><path d="M9 7.5L10 3h4l1 4.5M9 16.5l1 4.5h4l1-4.5M12 10v2l1.5 1"/>'),
  balloon: sv('<path d="M12 3a6 6 0 0 1 6 6c0 4-3.5 7-6 7s-6-3-6-7a6 6 0 0 1 6-6z"/><path d="M12 16l-1 2h2zM12 18c0 2-2 2-1 4"/>'),
  wings: sv('<path d="M12 9C9 5 4 4 2 5c0 5 3 9 9 10M12 9c3-4 8-5 10-4 0 5-3 9-9 10"/><path d="M12 9v9"/>'),
  sticker: sv('<path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.5 6.8 19.2l1-5.9L3.5 9.2l5.9-.8z"/>'),
  scene: sv('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 16l5-5 4 4 3-3 6 6"/><circle cx="16" cy="8.5" r="1.6" fill="currentColor"/>'),
  close: sv('<path d="M6 6l12 12M18 6L6 18"/>'),
  download: sv('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.3l-5.9 3.2 1.2-6.5L2.5 9.4l6.6-.9z" fill="currentColor"/></svg>',
};

/* ---------- categories ---------- */
const GROUPS = [
  { id: 'char', name: '角色', cats: ['species', 'fur', 'body', 'eyes', 'expr', 'hair', 'backHair', 'pose'] },
  { id: 'wear', name: '服装', cats: ['top', 'bottom', 'dress', 'outer', 'socks', 'shoes'] },
  { id: 'acc', name: '配饰', cats: ['hat', 'glasses', 'neck', 'acc', 'held', 'back', 'face'] },
  { id: 'scene', name: '场景', cats: ['bg'] },
];
const BODY_ONLY = LAYERS.filter(l => !HEAD_LAYERS.has(l) && !['hairBack', 'tail', 'bgBack', 'top'].includes(l));
const HEAD_ONLY = ['hairBack', 'ears', 'head', 'face', 'faceDeco', 'hairFront', 'brows', 'glasses', 'hat'];
const CAT = {
  species: { name: '物种', ico: 'paw' }, fur: { name: '毛色', ico: 'drop' }, body: { name: '体型', ico: 'body' },
  eyes: { name: '眼睛', ico: 'eye' }, expr: { name: '表情', ico: 'smile' }, hair: { name: '前发', ico: 'hair' }, backHair: { name: '后发', ico: 'backhair' }, pose: { name: '姿势', ico: 'pose' },
  top: { name: '上衣', ico: 'tee', slot: 'top', box: '100 264 200 236', only: BODY_ONLY, pattern: true, tuck: true },
  bottom: { name: '下装', ico: 'pants', slot: 'bottom', box: '86 390 228 300', only: BODY_ONLY, pattern: true },
  dress: { name: '连身', ico: 'dress', slot: 'dress', box: '36 262 328 452', only: BODY_ONLY, pattern: true },
  outer: { name: '外套', ico: 'jacket', slot: 'outer', box: '78 262 244 300', only: BODY_ONLY, pattern: true, ctx: ['top'] },
  socks: { name: '袜子', ico: 'sock', slot: 'socks', box: '120 500 160 220', only: ['legs', 'socks'], pattern: true },
  shoes: { name: '鞋子', ico: 'shoe', slot: 'shoes', box: '128 600 144 118', only: ['legs', 'socks', 'shoes'] },
  hat: { name: '帽饰', ico: 'hat', slot: 'hat', box: '62 -22 276 250', only: HEAD_ONLY, pattern: true, optional: true },
  glasses: { name: '眼镜', ico: 'glasses', slot: 'glasses', box: '104 160 192 110', only: ['head', 'face', 'glasses'], optional: true },
  neck: { name: '颈饰', ico: 'bow', slot: 'neck', box: '120 268 160 170', only: BODY_ONLY, pattern: true, optional: true, ctx: ['top'] },
  acc: { name: '配件', ico: 'watch', slot: 'acc', box: '90 280 220 220', only: BODY_ONLY, optional: true, ctx: ['top', 'bottom'] },
  held: { name: '手持', ico: 'balloon', slot: 'held', box: '160 280 180 240', only: BODY_ONLY, optional: true },
  back: { name: '背饰', ico: 'wings', slot: 'back', box: '0 160 400 520', only: ['bgBack', 'tail', 'armsBack', 'legs', 'torso', 'under', 'over1', 'accTop', 'armsFront'], optional: true, ctx: ['top', 'bottom'] },
  face: { name: '脸饰', ico: 'sticker', slot: 'face', box: '104 168 192 110', only: ['head', 'face', 'faceDeco'], optional: true },
  bg: { name: '背景', ico: 'scene' },
};
CAT.socks.optional = CAT.shoes.optional = CAT.outer.optional = CAT.dress.optional = true;
CAT.top.optional = CAT.bottom.optional = true;
const ITEM_BOX = {
  pleated: '86 390 228 190', tutu: '76 390 248 180', denimshorts: '96 390 208 150', bermuda: '96 390 208 190', aline: '86 390 228 200',
  trench: '66 262 268 360', duffle: '66 262 268 320', vest: '104 270 192 220', waistcoat: '104 270 192 220', capelet: '60 266 280 150',
  suspenders: '104 280 192 170', belt: '120 382 160 60', watch: '96 420 112 90', crossbody: '50 290 270 230', pins: '170 318 110 100',
  ballgown: '0 262 400 452', sunhat: '44 -22 312 250',
};
/* held items: thumbnail box relative to the paw's grip point [dx, dy, w, h] */
const HELD_BOX = {
  icecream: [-48, -74, 96, 104], boba: [-46, -62, 92, 92], coffee: [-46, -56, 92, 86], camera: [-46, -46, 92, 78], wand: [-46, -96, 100, 126],
  balloon: [-70, -390, 190, 430], bouquet: [-58, -80, 116, 116], briefcase: [-52, -26, 104, 96], books: [-46, -22, 92, 92], racket: [-48, -22, 96, 146],
  umbrella: [-46, -26, 92, 236], lantern: [-44, -22, 88, 112], handbag: [-44, -22, 88, 84], fan: [-48, -90, 100, 120],
};

/* ---------- swatches ---------- */
const SWATCHES = ['#ffffff', '#f6f0e1', '#e8d9b8', '#cdb68a', '#c08a4a', '#8a5a3c', '#6e2f22', '#3a2420',
  '#ffd1dc', '#ffb3cf', '#ff8fab', '#ee4a72', '#c8243c', '#b8322a', '#ff9a5c', '#ffd56b',
  '#f2c75c', '#d9e86a', '#bfe8d6', '#7cc37a', '#2f6f4e', '#6b7448', '#9fe3ff', '#7fa3c9',
  '#5677a8', '#2f4a7a', '#23396b', '#1f2a46', '#e7ddff', '#c4b0f0', '#7b5cd6', '#3a2a62',
  '#d9d4cc', '#a8afbd', '#565b6b', '#2e2b36', '#1e1a22'];
const FUR_SWATCHES = ['#f08a3a', '#f5b065', '#f1d09d', '#e7ae62', '#c98b55', '#a46f4b', '#8d6248', '#c9572b', '#fbf7f3', '#f2f4fa',
  '#d4cfe3', '#b8b3c6', '#8e98a9', '#5d6474', '#3c3746', '#2b2a33', '#ff9fc8', '#ffc4dd', '#cbb8ff', '#8a7ad8', '#5d6fd8', '#6aa8e8', '#a6e3cc', '#45b596', '#ff8a8a', '#ffe08a'];
const PALS = {
  ivy: ['#1f2a46', '#a9c8ec', '#cdb68a', '#6e2f22', '#f4eedf', '#2f6f4e', '#c9374b', '#23396b', '#ffffff'],
  work: ['#2f4a7a', '#c08a4a', '#b8322a', '#efe5d2', '#6b7448', '#a2652f', '#3e4f6e', '#7fa3c9', '#5a3a28'],
  sweet: ['#ffb3cf', '#fff0f6', '#ffd3e2', '#c4b0f0', '#ff7a9c', '#bfe8d6', '#fff7f2', '#ffd56b'],
  street: ['#23396b', '#f4a6c0', '#6b7448', '#fbfbfd', '#2a2f45', '#ffd36e', '#7ec4ff', '#1e1a22'],
  fantasy: ['#6f52c9', '#ff9ecf', '#ffd166', '#9fe3ff', '#3a2a62', '#ffffff', '#c4b0f0'],
  classic: ['#2e2b36', '#565b6b', '#cfb47f', '#f3ece0', '#4c433b', '#1f2a46', '#ffffff', '#6e2f22'],
  summer: ['#ffffff', '#9fe3ff', '#ffd56b', '#ff8fab', '#7cc37a', '#f2c14e', '#3567b0'],
};
const STYLES = [
  { tag: 'preppy', pal: 'ivy' }, { tag: 'workwear', pal: 'work' }, { tag: 'sweet', pal: 'sweet' }, { tag: 'street', pal: 'street' },
  { tag: 'fantasy', pal: 'fantasy' }, { tag: 'classic', pal: 'classic' }, { tag: 'summer', pal: 'summer' }, { tag: 'vintage', pal: 'work' }, { tag: 'cute', pal: 'sweet' },
];

/* ---------- presets & themes ---------- */
const PRESETS = [
  { name: '常春藤学院', sub: 'Ivy 经典', bg: 'campus', pose: 'stand', wear: { top: { id: 'ocbd' }, bottom: { id: 'chinos' }, outer: { id: 'blazer' }, neck: { id: 'tie' }, socks: { id: 'argyle' }, shoes: { id: 'loafer' }, held: { id: 'books' } } },
  { name: '美式工装', sub: '丹宁 + 帆布', bg: 'workshop', pose: 'stand', wear: { top: { id: 'chambray' }, bottom: { id: 'jeans' }, outer: { id: 'chore' }, socks: { id: 'crew' }, shoes: { id: 'mocboot' }, hat: { id: 'beanie' }, neck: { id: 'neckerchief' }, held: { id: 'coffee' } } },
  { name: '铁路工人', sub: '山核桃条纹', bg: 'workshop', pose: 'hips', wear: { top: { id: 'henley' }, bottom: { id: 'overalls' }, hat: { id: 'railroad' }, socks: { id: 'crew' }, shoes: { id: 'mocboot' }, neck: { id: 'neckerchief', c1: '#2c3b5e' } } },
  { name: '复古飞行员', sub: 'A-2 皮夹克', bg: 'city', pose: 'hips', wear: { top: { id: 'tee' }, bottom: { id: 'jeans' }, outer: { id: 'a2' }, shoes: { id: 'mocboot', c1: '#5a3a28', c2: '#3a2a22' }, glasses: { id: 'aviator' }, neck: { id: 'neckerchief', c1: '#f6f0e1', pat: 'none' } } },
  { name: '绅士下午茶', sub: '马甲 + 领结', bg: 'room', pose: 'wave', wear: { top: { id: 'ocbd', c1: '#ffffff' }, bottom: { id: 'trousers', c1: '#d9d4cc', pat: 'houndstooth', pc: '#2e2b36' }, outer: { id: 'waistcoat' }, neck: { id: 'bowtie' }, hat: { id: 'fedora' }, shoes: { id: 'brogue' }, held: { id: 'umbrella' }, glasses: { id: 'monocle' }, face: { id: 'mustache' } } },
  { name: '学院甜心', sub: '板球毛衣', bg: 'campus', pose: 'stand', wear: { top: { id: 'cricket' }, bottom: { id: 'pleated' }, socks: { id: 'knee' }, shoes: { id: 'loafer' }, hat: { id: 'beret', c1: '#23396b' }, held: { id: 'books' } } },
  { name: '甜美洛丽塔', sub: '蝴蝶结满满', bg: 'candy', pose: 'hold', wear: { top: { id: 'blouse' }, dress: { id: 'lolita' }, socks: { id: 'thigh' }, shoes: { id: 'maryjane' }, hat: { id: 'bigbow' }, held: { id: 'bouquet' } } },
  { name: '魔法少女', sub: '星光变身', bg: 'starry', pose: 'cheer', wear: { dress: { id: 'magical' }, shoes: { id: 'ballet' }, hat: { id: 'crown' }, back: { id: 'fairy' }, held: { id: 'wand' }, face: { id: 'glitter' } } },
  { name: '街头潮人', sub: '卫衣 + 棒球服', bg: 'city', pose: 'stand', wear: { top: { id: 'hoodie' }, bottom: { id: 'cargo' }, outer: { id: 'varsity' }, socks: { id: 'tube' }, shoes: { id: 'canvas' }, hat: { id: 'cap' }, glasses: { id: 'sunnies' } } },
  { name: '海边度假', sub: '常春藤之夏', bg: 'beach', pose: 'stand', wear: { top: { id: 'polo', c1: '#ffffff', c2: '#23396b' }, bottom: { id: 'bermuda' }, shoes: { id: 'boat' }, hat: { id: 'boater' }, glasses: { id: 'sunnies' }, held: { id: 'icecream' } } },
  { name: '冬日暖暖', sub: '牛角扣大衣', bg: 'snow', pose: 'stand', wear: { top: { id: 'turtle', c1: '#f4eedf' }, bottom: { id: 'cord' }, outer: { id: 'duffle' }, neck: { id: 'scarf' }, hat: { id: 'beanie', c1: '#23396b' }, shoes: { id: 'chelsea' }, held: { id: 'coffee' } } },
  { name: '新春庙会', sub: '旗袍 + 灯笼', bg: 'newyear', pose: 'stand', wear: { dress: { id: 'qipao' }, outer: { id: 'tang', c1: '#f6efe2', c2: '#c8243c' }, shoes: { id: 'embroidered' }, hat: { id: 'hairpin' }, held: { id: 'lantern' } } },
];
const THEMES = [
  { name: '常春藤开学日', desc: '牛津纺、藏青西装、乐福鞋——拿出学院派的体面。', want: { preppy: 3, classic: 2, vintage: 1, office: 1 }, avoid: ['fantasy', 'party'], bgs: ['campus'] },
  { name: '美式复古工装', desc: '丹宁、帆布、工装靴，要耐穿也要有型。', want: { workwear: 3, vintage: 2, casual: 1 }, avoid: ['elegant', 'fantasy', 'party'], bgs: ['workshop'] },
  { name: '绅士下午茶', desc: '领结与软呢帽，优雅地举起茶杯。', want: { classic: 3, elegant: 2, vintage: 1, office: 1 }, avoid: ['sporty', 'street'], bgs: ['room', 'runway'] },
  { name: '海边度假', desc: '阳光、海风、冰淇淋，清爽最重要。', want: { summer: 3, casual: 2, cute: 1 }, avoid: ['winter'], bgs: ['beach'] },
  { name: '冬日约会', desc: '暖乎乎又不失可爱，雪地里也要好看。', want: { winter: 3, cute: 1, classic: 1, elegant: 1 }, avoid: ['summer'], bgs: ['snow'] },
  { name: '魔法舞会', desc: '今晚的星光属于你，越华丽越好！', want: { fantasy: 3, party: 2, elegant: 2 }, avoid: ['workwear', 'sporty', 'office'], bgs: ['starry', 'dreamy'] },
  { name: '街头潮人', desc: '帽子、卫衣、运动鞋，酷就完事了。', want: { street: 3, sporty: 2, cool: 2 }, avoid: ['elegant', 'sweet'], bgs: ['city'] },
  { name: '森林野餐', desc: '和小动物们一起，自然又舒服。', want: { nature: 3, casual: 2, cute: 1 }, avoid: ['office', 'party'], bgs: ['forest', 'sakura'] },
  { name: '甜心派对', desc: '粉嫩、蝴蝶结、甜品，可爱度拉满。', want: { sweet: 3, cute: 3, party: 1 }, avoid: ['workwear', 'cool'], bgs: ['candy', 'dreamy'] },
  { name: '新春庙会', desc: '红红火火过新年，喜气洋洋！', want: { chinese: 4, party: 2, winter: 1 }, avoid: ['summer'], bgs: ['newyear'] },
  { name: '时装周压轴', desc: '聚光灯下的最后一套，气场全开。', want: { elegant: 3, cool: 2, party: 1, classic: 1 }, avoid: ['casual', 'sporty'], bgs: ['runway'] },
  { name: '复古飞行员', desc: '皮夹克、墨镜、工装靴，像从老电影里走出来。', want: { vintage: 3, cool: 2, workwear: 1 }, avoid: ['sweet', 'fantasy'], bgs: ['city', 'workshop'] },
];
const TAG_NAME = { preppy: '学院', classic: '经典', vintage: '复古', office: '通勤', workwear: '工装', casual: '休闲', elegant: '优雅', summer: '夏日', winter: '冬日', cute: '可爱', fantasy: '奇幻', party: '派对', street: '街头', sporty: '运动', cool: '酷', nature: '自然', sweet: '甜美', chinese: '中国风', autumn: '秋日' };

/* ---------- state ---------- */
const STORE = 'fluffy-atelier-v1';
function palOf(sp, i) { const p = SPECIES[sp].pals[i] || SPECIES[sp].pals[0]; return clone(p); }
function defaultState() {
  const pal = palOf('fox', 0);
  return {
    v: 1, species: 'fox', palIdx: 0, fur: pal, body: 'boy', pose: 'stand', expr: 'smile', name: DEFAULT_NAMES.fox,
    eyes: { style: 'boy', color: pal.eye }, hair: { id: 'none', color: pal.hair }, backHair: { id: 'none' },
    wear: clone(PRESETS[0].wear), bg: 'campus', mem: {},
  };
}
/* hairstyles of earlier versions -> the closest front hair (and back hair for the long ones) */
const OLD_HAIRS = { messy: 'shag', ivy: 'sweep', pomp: 'swept', bob: 'cloud', long: 'curtain', twintails: 'none', wavy: 'cloud',
  ahoge: 'none', twin: 'none', spiky: 'shag', flame: 'swept', curly: 'cloud', side: 'sweep', fringe: 'cloud', straight: 'curtain' };
const OLD_BACK = { long: 'straight', wavy: 'wavy', straight: 'straight' };
function load() {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !s.fur || !s.wear) return null;
    if (!SPECIES[s.species]) { s.species = 'fox'; s.palIdx = 0; s.fur = palOf('fox', 0); if (s.name === '团团') s.name = DEFAULT_NAMES.fox; }
    const hex = v => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v);
    const base = palOf(s.species, s.palIdx || 0);
    for (const k of ['main', 'sub', 'acc', 'inner', 'nose', 'hair', 'eye', 'antler']) if (!hex(s.fur[k]) && base[k]) s.fur[k] = base[k];
    for (const k of Object.keys(s.wear)) { const w = s.wear[k]; if (w) for (const c of ['c1', 'c2', 'pc']) if (c in w && !hex(w[c])) delete w[c]; }
    for (const k of Object.keys(s.wear)) if (!s.wear[k] || !ITEM_INDEX[k] || !ITEM_INDEX[k][s.wear[k].id]) delete s.wear[k];
    if (s.hair && !HAIR_INDEX[s.hair.id]) { const old = s.hair.id; s.hair.id = OLD_HAIRS[old] || 'none'; if (OLD_BACK[old] && !s.backHair) s.backHair = { id: OLD_BACK[old] }; }
    if (!s.hair || !HAIR_INDEX[s.hair.id]) s.hair = { id: 'none', color: s.fur.hair || s.fur.main };
    if (!s.backHair || !BACK_INDEX[s.backHair.id] || s.hair.id === 'none') s.backHair = { id: 'none' };
    if (!hex(s.hair.color)) s.hair.color = s.fur.hair || s.fur.main;
    if (!SCENES.find(x => x.id === s.bg)) s.bg = 'dreamy';
    if (!BODIES[s.body]) s.body = 'girl';
    if (!POSES.find(p => p.id === s.pose)) s.pose = 'stand';
    if (!s.eyes || !EYE_STYLES.find(e => e.id === s.eyes.style)) s.eyes = { style: 'sparkle', color: s.fur.eye || '#3a9cf5' };
    if (!hex(s.eyes.color)) s.eyes.color = s.fur.eye || '#3a9cf5';
    if (typeof s.name !== 'string') s.name = DEFAULT_NAMES[s.species];
    if (!EXPRESSIONS.find(e => e.id === s.expr)) s.expr = 'smile';
    s.mem = s.mem || {};
    return s;
  } catch (e) { return null; }
}
let saveT = 0;
function save() { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(STORE, JSON.stringify(S)); localStorage.setItem(STORE + '-ui', JSON.stringify({ sound: UI.sound, music: UI.music })); } catch (e) { /* storage unavailable: play on without saving */ } }, 250); }

let S = load() || defaultState();
const UI = { group: 'wear', cat: 'top', target: 'c1', fur: 'main', challenge: null, sound: true, music: true, collapsed: false };
try { const u = JSON.parse(localStorage.getItem(STORE + '-ui') || '{}'); if (typeof u.sound === 'boolean') UI.sound = u.sound; if (typeof u.music === 'boolean') UI.music = u.music; } catch (e) { /* ignore */ }
const undoStack = [];

function commit(fn, o = {}) {
  undoStack.push(clone(S));
  if (undoStack.length > 60) undoStack.shift();
  fn(S);
  refresh(o);
}
function refresh(o = {}) {
  renderStage(o);
  renderCats();
  renderItems();
  renderEditor();
  $('#btnUndo').disabled = !undoStack.length;
  save();
}

/* ---------- sound ---------- */
let AC = null;
function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
function tone(freq, t0, dur, type = 'sine', vol = .15, slide = 0) {
  const a = ac(); if (!a) return;
  const o = a.createOscillator(), gn = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, a.currentTime + t0);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), a.currentTime + t0 + dur);
  gn.gain.setValueAtTime(0, a.currentTime + t0);
  gn.gain.linearRampToValueAtTime(vol, a.currentTime + t0 + .01);
  gn.gain.exponentialRampToValueAtTime(.0005, a.currentTime + t0 + dur);
  o.connect(gn).connect(a.destination); o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + dur + .02);
}
function noise(t0, dur, vol = .12) {
  const a = ac(); if (!a) return;
  const b = a.createBuffer(1, a.sampleRate * dur, a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = a.createBufferSource(), gn = a.createGain(); src.buffer = b; gn.gain.value = vol;
  src.connect(gn).connect(a.destination); src.start(a.currentTime + t0);
}
const SFX = {
  tap: () => tone(880, 0, .05, 'triangle', .06),
  pop: () => { tone(520, 0, .12, 'sine', .16, 420); tone(1560, .05, .08, 'triangle', .05); tone(2090, .09, .1, 'triangle', .04); },
  swish: () => { noise(0, .18, .05); tone(300, 0, .2, 'sine', .06, 500); },
  undo: () => tone(700, 0, .12, 'sine', .12, -300),
  dice: () => { for (let i = 0; i < 4; i++) tone(500 + Math.random() * 600, i * .05, .05, 'square', .04); tone(1046, .24, .25, 'triangle', .1); tone(1318, .3, .3, 'triangle', .08); },
  shutter: () => { noise(0, .08, .25); tone(2400, .02, .04, 'square', .05); noise(.1, .05, .12); },
  fanfare: () => [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, i * .11, i === 5 ? .5 : .14, 'triangle', .12)),
  ding: () => { tone(1318, 0, .35, 'sine', .12); tone(1976, .02, .3, 'sine', .05); },
};
function play(n) { if (UI.sound) try { SFX[n](); } catch (e) { /* audio blocked */ } }
/* background music (music.js): browsers only allow sound after a tap, so it starts on the first one */
function music(on) { try { if (on) BGM.start(ac()); else BGM.stop(); } catch (e) { /* audio blocked */ } }
function buzz() { if (navigator.vibrate) try { navigator.vibrate(8); } catch (e) { /* ignore */ } }

/* ---------- stage ---------- */
let lastBg = '', charSeq = 0;
const FX_AT = { hat: [200, 90], glasses: [200, 214], face: [200, 236], hair: [200, 130], backHair: [200, 300], species: [200, 170], fur: [200, 300], eyes: [200, 214], expr: [200, 250],
  neck: [200, 312], top: [200, 370], outer: [200, 380], acc: [200, 420], bottom: [200, 480], dress: [200, 470], socks: [200, 620], shoes: [200, 690], held: [280, 420], back: [200, 330], body: [200, 420], pose: [200, 380] };
function renderStage(o = {}) {
  if (S.bg !== lastBg) { $('#sceneWrap').innerHTML = renderScene(S.bg, 'stg'); lastBg = S.bg; }
  const cw = $('#charWrap');
  cw.innerHTML = renderCharacter(S, { id: 'm' + (++charSeq % 2) });
  if (o.fx) {
    cw.classList.remove('bounce'); void cw.offsetWidth; cw.classList.add('bounce');
    sparkleAt(FX_AT[o.fx] || [200, 360]);
  }
}
function sparkleAt([vx, vy], n = 9) {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cw = $('#charWrap').getBoundingClientRect(), st = $('#stage').getBoundingClientRect();
  const x = cw.left - st.left + vx / 400 * cw.width, y = cw.top - st.top + vy / 720 * cw.height;
  const fx = $('#fx');
  const cols = ['#ffd56b', '#ff8fab', '#ffffff', '#9fe3ff', '#c4b0f0'];
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'spark';
    const a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 45;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    el.style.setProperty('--dx', Math.cos(a) * d + 'px'); el.style.setProperty('--dy', Math.sin(a) * d + 'px');
    el.style.animationDelay = (Math.random() * .08) + 's';
    el.innerHTML = `<svg viewBox="0 0 20 20"><path d="M10 0C11 7 13 9 20 10 13 11 11 13 10 20 9 13 7 11 0 10 7 9 9 7 10 0Z" fill="${pick(cols)}"/></svg>`;
    fx.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
}

/* ---------- tabs ---------- */
function renderGroups() {
  $('#groups').innerHTML = GROUPS.map(gp => `<button class="group" role="tab" data-g="${gp.id}" aria-selected="${UI.group === gp.id}">${gp.name}</button>`).join('');
}
function renderCats() {
  const gp = GROUPS.find(x => x.id === UI.group);
  const html = gp.cats.map(c => {
    const C = CAT[c];
    const on = C.slot && S.wear[C.slot] ? '<i class="dot"></i>' : '';
    return `<button class="cat" role="tab" data-c="${c}" aria-selected="${UI.cat === c}">${ICO[C.ico]}${C.name}${on}</button>`;
  }).join('');
  const el = $('#cats');
  if (el.dataset.k !== html) { el.innerHTML = html; el.dataset.k = html; }
}

/* ---------- thumbnails ---------- */
let thumbN = 0;
function thumbState(base, over) { const st = clone(base); st.pose = 'stand'; Object.assign(st, over); return st; }
function itemThumb(cat, id) {
  const C = CAT[cat], slot = C.slot;
  const st = thumbState(S, { wear: {} });
  for (const k of (C.ctx || [])) if (S.wear[k]) st.wear[k] = clone(S.wear[k]);
  if (cat === 'outer' && !st.wear.top) st.wear.top = { id: 'tee' };
  const def = ITEM_INDEX[slot][id];
  if (cat === 'dress' && def.overTop) st.wear.top = S.wear.top ? clone(S.wear.top) : { id: 'blouse' };
  st.wear[slot] = currentItemState(slot, id);
  if (cat === 'held' || cat === 'back') st.wear.top = st.wear.top || clone(S.wear.top || { id: 'tee' });
  let box = ITEM_BOX[id] || C.box;
  if (cat === 'held' && HELD_BOX[id]) {
    const K = buildGeom(st);
    let gp = gripPoint(K.armR, K);
    if (def.grip === 'front') { const a = gripPoint(K.armL, K); gp = { x: (a.x + gp.x) / 2, y: (a.y + gp.y) / 2 }; }
    const [dx, dy, w, h] = HELD_BOX[id];
    box = `${Math.round(gp.x + dx)} ${Math.round(gp.y + dy)} ${w} ${h}`;
  }
  return renderCharacter(st, { id: 't' + (++thumbN), viewBox: box, noAnim: true, only: C.only });
}
function currentItemState(slot, id) {
  if (S.wear[slot] && S.wear[slot].id === id) return clone(S.wear[slot]);
  const m = S.mem[slot] && S.mem[slot][id];
  return m ? Object.assign({ id }, clone(m)) : { id };
}
function headThumb(st, box = '58 -24 284 330') { return renderCharacter(st, { id: 't' + (++thumbN), viewBox: box, noAnim: true, only: HEAD_ONLY }); }

/* tiles for the current category: [{id, name, key, svg(), sel}] */
function tilesFor(cat) {
  const C = CAT[cat];
  const furKey = S.species + '|' + JSON.stringify(S.fur) + '|' + S.body;
  if (C.slot) {
    const slot = C.slot;
    const list = ITEMS[slot].map(it => {
      const cur = currentItemState(slot, it.id);
      const ctxk = (C.ctx || []).map(k => JSON.stringify(S.wear[k] || '')).join('|');
      return { id: it.id, name: it.name, sel: !!(S.wear[slot] && S.wear[slot].id === it.id) && !hiddenByDress(slot), key: furKey + JSON.stringify(cur) + ctxk + (slot === 'hat' || slot === 'glasses' || slot === 'face' ? JSON.stringify(S.hair) + JSON.stringify(S.eyes) + S.expr : ''), svg: () => itemThumb(cat, it.id) };
    });
    if (C.optional) list.unshift({ id: '', name: '不穿戴', none: true, sel: !S.wear[slot] || hiddenByDress(slot), key: 'none' });
    return list;
  }
  switch (cat) {
    case 'species': return SPECIES_ORDER.map(sp => {
      const pal = SPECIES[sp].pals[0];
      return { id: sp, name: SPECIES[sp].name, sel: S.species === sp, key: sp + S.eyes.style + S.expr, svg: () => headThumb(thumbState(S, { species: sp, fur: clone(pal), hair: { id: 'none', color: pal.hair }, eyes: { style: S.eyes.style, color: pal.eye }, wear: {} })) };
    });
    case 'fur': return SPECIES[S.species].pals.map((p, i) => ({ id: String(i), name: p.n, sel: S.palIdx === i && sameFur(p), key: furKey + i + JSON.stringify(S.hair) + S.eyes.style + S.expr, svg: () => headThumb(thumbState(S, { fur: clone(p), hair: { id: S.hair.id, color: p.hair }, wear: {} })) }));
    case 'body': return Object.keys(BODIES).map(b => ({ id: b, name: BODIES[b].name, sel: S.body === b, key: furKey + b + JSON.stringify(S.wear) + JSON.stringify(S.hair), svg: () => renderCharacter(thumbState(S, { body: b }), { id: 't' + (++thumbN), viewBox: '50 20 300 700', noAnim: true }) }));
    case 'eyes': return EYE_STYLES.map(e => ({ id: e.id, name: e.name, sel: S.eyes.style === e.id, key: furKey + e.id + S.eyes.color, svg: () => renderCharacter(thumbState(S, { eyes: { style: e.id, color: S.eyes.color }, wear: {} }), { id: 't' + (++thumbN), viewBox: '124 178 152 76', noAnim: true, only: ['head', 'face'] }) }));
    case 'expr': return EXPRESSIONS.map(e => ({ id: e.id, name: e.name, sel: S.expr === e.id, key: furKey + e.id + JSON.stringify(S.eyes), svg: () => renderCharacter(thumbState(S, { expr: e.id, wear: {} }), { id: 't' + (++thumbN), viewBox: '108 150 184 150', noAnim: true, only: ['head', 'face', 'brows'] }) }));
    case 'hair': return HAIRS.map(h => ({ id: h.id, name: h.name, sel: S.hair.id === h.id, key: furKey + h.id + S.hair.color + JSON.stringify(S.eyes) + S.backHair.id, svg: () => renderCharacter(thumbState(S, { hair: { id: h.id, color: S.hair.color }, wear: {} }), { id: 't' + (++thumbN), viewBox: '86 36 228 210', noAnim: true, only: ['hairBack', 'ears', 'head', 'face', 'hairFront', 'brows'] }) }));
    case 'backHair': {
      const noFront = S.hair.id === 'none';
      return BACK_HAIRS.map(h => h.id === 'none'
        ? { id: 'none', name: h.name, none: true, sel: S.backHair.id === 'none', key: 'none' }
        : { id: h.id, name: h.name, off: noFront, sel: !noFront && S.backHair.id === h.id, key: furKey + h.id + S.hair.id + JSON.stringify(S.eyes) + (noFront ? 'off' : ''),
            svg: () => renderCharacter(thumbState(S, { hair: { id: noFront ? 'curtain' : S.hair.id, color: S.hair.color }, backHair: { id: h.id }, wear: { top: { id: 'tee', c1: '#f6efe3' } } }), { id: 't' + (++thumbN), viewBox: '20 20 360 500', noAnim: true }) });
    }
    case 'pose': return POSES.map(p => ({ id: p.id, name: p.name, sel: S.pose === p.id, key: furKey + p.id + JSON.stringify(S.wear) + JSON.stringify(S.hair), svg: () => renderCharacter(Object.assign(clone(S), { pose: p.id }), { id: 't' + (++thumbN), viewBox: '20 0 360 720', noAnim: true }) }));
    case 'bg': return SCENES.map(sc => ({ id: sc.id, name: sc.name, sel: S.bg === sc.id, key: sc.id, svg: () => renderScene(sc.id, 'tb' + (++thumbN), { noAnim: true }) }));
  }
  return [];
}
function hiddenByDress(slot, s = S) {
  if (!s.wear.dress || !ITEM_INDEX.dress[s.wear.dress.id]) return false;
  return slot === 'bottom' || (slot === 'top' && !ITEM_INDEX.dress[s.wear.dress.id].overTop);
}
function sameFur(p) { return ['main', 'sub', 'acc', 'nose'].every(k => (S.fur[k] || '').toLowerCase() === (p[k] || '').toLowerCase()); }

const thumbFns = new WeakMap();
let thumbIO = null;
function paintTile(n) { const f = thumbFns.get(n); if (!f) return; thumbFns.delete(n); n.firstElementChild.innerHTML = f(); }
function renderItems() {
  const el = $('#items');
  if (!thumbIO && 'IntersectionObserver' in window) thumbIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) paintTile(e.target); }), { root: el, rootMargin: '160px' });
  const tiles = tilesFor(UI.cat);
  const sig = UI.cat + ':' + tiles.map(t => t.id).join(',');
  if (el.dataset.sig !== sig) {
    el.dataset.sig = sig;
    el.innerHTML = tiles.map(t => `<button class="tag${t.none ? ' none' : ''}" role="option" data-id="${t.id}"><div class="th"></div><div class="nm">${esc(t.name)}</div></button>`).join('');
    el.scrollLeft = 0; el.scrollTop = 0;
  }
  const nodes = el.children;
  tiles.forEach((t, i) => {
    const n = nodes[i];
    n.setAttribute('aria-selected', t.sel);
    n.classList.toggle('off', !!t.off);
    if (t.off) n.setAttribute('aria-disabled', 'true'); else n.removeAttribute('aria-disabled');
    if (n.dataset.k !== t.key) {
      n.dataset.k = t.key;
      if (t.none) { n.firstElementChild.innerHTML = '<span>无</span>'; return; }
      thumbFns.set(n, t.svg);
      if (thumbIO) { thumbIO.unobserve(n); thumbIO.observe(n); } else paintTile(n);
    }
  });
}

/* ---------- editor ---------- */
function spool(col, on, i) {
  return `<button class="spool" data-col="${col}" aria-pressed="${on}" aria-label="颜色 ${col}" style="--c:${col}"><svg viewBox="0 0 26 38"><rect x="1" y="1" width="24" height="5.5" rx="2.2" fill="#e8c79a" stroke="#a9824f" stroke-width="1.2"/><rect x="4" y="6.5" width="18" height="25" fill="${col}"/><path d="M4 10.5h18M4 14.5h18M4 18.5h18M4 22.5h18M4 26.5h18" stroke="${lineOf(col)}" stroke-opacity=".25" stroke-width="1"/><rect x="6" y="6.5" width="3" height="25" fill="#fff" opacity=".28"/><rect x="4" y="6.5" width="18" height="25" fill="none" stroke="${lineOf(col)}" stroke-opacity=".5" stroke-width="1"/><rect x="1" y="31.5" width="24" height="5.5" rx="2.2" fill="#e8c79a" stroke="#a9824f" stroke-width="1.2"/></svg></button>`;
}
function customSpool(cur) {
  return `<label class="spool custom" aria-label="自定义颜色"><svg viewBox="0 0 26 38"><defs><linearGradient id="rbw" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ff6f91"/><stop offset=".3" stop-color="#ffd56b"/><stop offset=".6" stop-color="#7cc37a"/><stop offset="1" stop-color="#7b5cd6"/></linearGradient></defs><rect x="1" y="1" width="24" height="5.5" rx="2.2" fill="#e8c79a" stroke="#a9824f" stroke-width="1.2"/><rect x="4" y="6.5" width="18" height="25" fill="url(#rbw)"/><path d="M13 13v12M7 19h12" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><rect x="1" y="31.5" width="24" height="5.5" rx="2.2" fill="#e8c79a" stroke="#a9824f" stroke-width="1.2"/></svg><input type="color" value="${cur}" data-custom="1"></label>`;
}
function pinked(id, fill, patType, pc) {
  const pts = [];
  const n = 7, a = 2, b = 38;
  for (let i = 0; i <= n; i++) pts.push([a + (b - a) * i / n, i % 2 ? 4.5 : 1.5]);
  for (let i = 1; i <= n; i++) pts.push([i % 2 ? 35.5 : 38.5, a + (b - a) * i / n]);
  for (let i = n - 1; i >= 0; i--) pts.push([a + (b - a) * i / n, i % 2 ? 35.5 : 38.5]);
  for (let i = n - 1; i >= 1; i--) pts.push([i % 2 ? 4.5 : 1.5, a + (b - a) * i / n]);
  const d = 'M' + pts.map(p => p.join(',')).join('L') + 'Z';
  const pat = patType && patType !== 'none' ? patternMarkup(patType, pc, fill).replace('__ID__', id) : '';
  return `<svg viewBox="0 0 40 40"><defs>${pat}</defs><path d="${d}" fill="${fill}" stroke="${lineOf(fill)}" stroke-width="1"/>${pat ? `<path d="${d}" fill="url(#${id})"/>` : ''}</svg>`;
}
function renderEditor() {
  const el = $('#editor');
  const C = CAT[UI.cat];
  let html = '';
  const spools = (list, cur) => `<div class="spools">${list.map(c => spool(c, cur && c.toLowerCase() === cur.toLowerCase())).join('')}${customSpool(cur || '#ffffff')}</div>`;
  if (C.slot && S.wear[C.slot] && !hiddenByDress(C.slot)) {
    const it = itemOf(C.slot, S.wear[C.slot]);
    const def = it.def;
    const targets = [['c1', '主色']];
    if (def.c2) targets.push(['c2', '配色']);
    if (C.pattern) targets.push(['pat', '图案']);
    if (C.pattern && it.pat !== 'none') targets.push(['pc', '图案色']);
    if (!targets.find(t => t[0] === UI.target)) UI.target = 'c1';
    html += `<div class="ed-row"><div class="seg" role="group">${targets.map(([k, n]) => `<button data-t="${k}" aria-pressed="${UI.target === k}">${n}</button>`).join('')}</div>`;
    if (C.tuck && !S.wear.dress) html += `<button class="toggle" data-tuck="1" aria-pressed="${!!it.tuck}"><i></i>塞进下装</button>`;
    html += `</div>`;
    if (UI.target === 'pat') html += `<div class="ed-row"><div class="fabrics">${PATTERNS.map(p => `<button class="fabric" data-pat="${p.id}" aria-pressed="${it.pat === p.id}" title="${p.name}" aria-label="${p.name}">${pinked('pk-' + p.id, it.c1, p.id, it.pc)}</button>`).join('')}</div></div>`;
    else html += `<div class="ed-row">${spools(SWATCHES, it[UI.target])}</div>`;
  } else if (UI.cat === 'fur' || UI.cat === 'species') {
    const targets = [['main', '主色'], ['sub', '副色'], ['acc', '点缀']];
    html += `<div class="ed-row"><div class="seg" role="group">${targets.map(([k, n]) => `<button data-f="${k}" aria-pressed="${UI.fur === k}">${n}</button>`).join('')}</div></div>`;
    html += `<div class="ed-row">${spools(FUR_SWATCHES, S.fur[UI.fur])}</div>`;
  } else if (UI.cat === 'eyes') {
    html += `<div class="ed-row"><span class="ed-label">瞳色</span>${spools(EYE_COLORS, S.eyes.color)}</div>`;
  } else if (UI.cat === 'backHair' && S.hair.id === 'none') {
    html += `<div class="ed-row"><span class="ed-hint">后发要搭配前发才能选</span><button class="pill" data-go="hair">去选前发</button></div>`;
  }
  if (el.dataset.k !== html) { el.innerHTML = html; el.dataset.k = html; }
}

/* ---------- actions ---------- */
function selectTile(id) {
  const C = CAT[UI.cat];
  if (C.slot) {
    const slot = C.slot;
    if (!id) { if (!S.wear[slot]) return; commit(s => { delete s.wear[slot]; }, { fx: slot }); play('swish'); return; }
    if (S.wear[slot] && S.wear[slot].id === id && !hiddenByDress(slot)) { play('tap'); return; }
    commit(s => {
      if (s.wear[slot] && s.wear[slot].id !== id) remember(s, slot);
      s.wear[slot] = s.wear[slot] && s.wear[slot].id === id ? s.wear[slot] : currentItemState(slot, id);
      if ((slot === 'top' || slot === 'bottom') && s.wear.dress && !(slot === 'top' && ITEM_INDEX.dress[s.wear.dress.id].overTop)) delete s.wear.dress;
      if (slot === 'dress' && ITEM_INDEX.dress[id].overTop && !s.wear.top) s.wear.top = { id: 'blouse' };
    }, { fx: slot });
    UI.target = 'c1';
    play('pop'); buzz();
    return;
  }
  switch (UI.cat) {
    case 'species': if (S.species === id) return; commit(s => { const p = palOf(id, 0); renameFor(s, id); s.species = id; s.palIdx = 0; s.fur = p; s.hair.color = p.hair; s.eyes.color = p.eye; }, { fx: 'species' }); break;
    case 'fur': commit(s => { const p = palOf(s.species, +id); s.palIdx = +id; s.fur = p; s.hair.color = p.hair; s.eyes.color = p.eye; }, { fx: 'fur' }); break;
    case 'body': if (S.body === id) return; commit(s => { s.body = id; if (id === 'boy' && s.eyes.style === 'sparkle') s.eyes.style = 'boy'; if (id === 'girl' && s.eyes.style === 'boy') s.eyes.style = 'sparkle'; }, { fx: 'body' }); break;
    case 'eyes': commit(s => { s.eyes.style = id; }, { fx: 'eyes' }); break;
    case 'expr': commit(s => { s.expr = id; }, { fx: 'expr' }); break;
    case 'hair': commit(s => { s.hair.id = id; if (id === 'none') s.backHair = { id: 'none' }; }, { fx: 'hair' }); break;
    case 'backHair':
      if (id !== 'none' && S.hair.id === 'none') { toast('先选一款前发，才能搭配后发'); play('tap'); return; }
      if (S.backHair.id === id) { play('tap'); return; }
      commit(s => { s.backHair = { id }; }, { fx: 'backHair' }); break;
    case 'pose': commit(s => { s.pose = id; }, { fx: 'pose' }); break;
    case 'bg': commit(s => { s.bg = id; }); break;
  }
  play('pop'); buzz();
}
function renameFor(s, sp) { if (!s.name || Object.values(DEFAULT_NAMES).includes(s.name)) s.name = DEFAULT_NAMES[sp]; }
function remember(s, slot) { const w = s.wear[slot]; if (!w) return; s.mem[slot] = s.mem[slot] || {}; const { id, ...rest } = w; if (Object.keys(rest).length) s.mem[slot][id] = rest; }
function setColor(col) {
  const C = CAT[UI.cat];
  if (C.slot && S.wear[C.slot]) commit(s => { s.wear[C.slot][UI.target] = col; remember(s, C.slot); });
  else if (UI.cat === 'fur' || UI.cat === 'species') commit(s => { s.fur[UI.fur] = col; if (UI.fur === 'sub') s.fur.inner = col; });
  else if (UI.cat === 'eyes') commit(s => { s.eyes.color = col; });
  play('tap');
}
function setPattern(p) {
  const C = CAT[UI.cat];
  if (!(C.slot && S.wear[C.slot])) return;
  commit(s => { const w = s.wear[C.slot]; w.pat = p; if (p !== 'none' && !w.pc) { const it = itemOf(C.slot, w); w.pc = isLight(it.c1) ? '#2f4a7a' : '#ffffff'; } remember(s, C.slot); });
  play('tap');
}
function undo() {
  if (!undoStack.length) return;
  S = undoStack.pop();
  refresh({ fx: null });
  play('undo');
}

/* ---------- randomize ---------- */
function randomize() {
  commit(s => {
    const style = pick(STYLES), pal = PALS[style.pal];
    if (chance(.45)) { const sp = pick(SPECIES_ORDER); renameFor(s, sp); s.species = sp; s.palIdx = Math.floor(Math.random() * SPECIES[sp].pals.length); s.fur = palOf(sp, s.palIdx); }
    if (chance(.35)) s.body = pick(Object.keys(BODIES));
    s.eyes = { style: s.body === 'boy' ? pick(['boy', 'boy', 'round', 'sleepy', 'cat']) : pick(EYE_STYLES).id, color: chance(.5) ? s.fur.eye : pick(EYE_COLORS) };
    s.expr = pick(EXPRESSIONS).id;
    const hairs = HAIRS.filter(h => h.id !== 'none' && (h.tags.includes(style.tag) || chance(.2)));
    s.hair = { id: chance(.45) || !hairs.length ? 'none' : pick(hairs).id, color: s.fur.hair || s.fur.main };
    const backs = BACK_HAIRS.filter(h => h.id !== 'none' && (h.tags.includes(style.tag) || chance(.25)));
    s.backHair = { id: s.hair.id !== 'none' && backs.length && chance(.4) ? pick(backs).id : 'none' };
    s.pose = pick(POSES).id;
    const pickItem = (slot, p) => {
      if (!chance(p)) return null;
      const pool = ITEMS[slot].filter(it => it.tags.includes(style.tag));
      const it = pick(pool.length && chance(.85) ? pool : ITEMS[slot]);
      const w = { id: it.id };
      if (chance(.55)) w.c1 = pick(pal);
      if (it.c2 && chance(.4)) w.c2 = pick(pal.filter(c => c !== w.c1));
      return w;
    };
    const wear = {};
    if (chance(.25)) { wear.dress = pickItem('dress', 1); if (ITEM_INDEX.dress[wear.dress.id].overTop) wear.top = pickItem('top', 1); }
    else { wear.top = pickItem('top', 1); wear.bottom = pickItem('bottom', 1); }
    for (const [slot, p] of [['outer', .5], ['socks', .6], ['shoes', .95], ['hat', .55], ['glasses', .3], ['neck', .45], ['acc', .25], ['held', .45], ['back', .2], ['face', .2]]) { const w = pickItem(slot, p); if (w) wear[slot] = w; }
    s.wear = wear;
    const scenes = SCENES.filter(sc => sc.tags.includes(style.tag));
    s.bg = (pick(scenes.length ? scenes : SCENES)).id;
  }, { fx: 'top' });
  play('dice'); buzz();
  sparkleAt([200, 200], 8); sparkleAt([200, 520], 8);
}

/* ---------- modal helpers ---------- */
function openModal(html, onReady) {
  const m = $('#modal'), c = $('#modalCard');
  c.innerHTML = `<button class="m-close" data-close="1" aria-label="关闭">×</button>` + html;
  m.hidden = false;
  if (onReady) onReady(c);
  const f = c.querySelector('[data-focus]') || c.querySelector('button:not(.m-close)');
  if (f) setTimeout(() => f.focus({ preventScroll: true }), 50);
}
function closeModal() { $('#modal').hidden = true; $('#modalCard').innerHTML = ''; }
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 1800); }

/* ---------- presets ---------- */
function openPresets() {
  const cards = PRESETS.map((p, i) => {
    const st = Object.assign(clone(S), { wear: clone(p.wear), pose: p.pose });
    return `<button class="preset" data-preset="${i}"><div class="pv">${renderScene(p.bg, 'pp' + i, { noAnim: true })}${renderCharacter(st, { id: 'pc' + i, noAnim: true })}</div><b>${p.name}</b><small>${p.sub}</small></button>`;
  }).join('');
  openModal(`<h2 class="m-title">穿搭灵感</h2><p class="m-sub">点一套直接换上，保留你现在的角色和毛色</p><div class="preset-grid">${cards}</div>`);
  play('swish');
}
function applyPreset(i) {
  const p = PRESETS[i];
  commit(s => { s.wear = clone(p.wear); s.bg = p.bg; s.pose = p.pose; }, { fx: 'top' });
  closeModal(); play('ding'); toast(`换上了「${p.name}」`);
  sparkleAt([200, 300], 10); sparkleAt([200, 560], 8);
}

/* ---------- challenge ---------- */
function openChallenge() {
  const t = pick(THEMES.filter(x => !UI.challenge || x.name !== UI.challenge.name));
  UI.pending = t;
  const tags = Object.entries(t.want).sort((a, b) => b[1] - a[1]).map(([k]) => `<span class="chip">${TAG_NAME[k] || k}</span>`).join('');
  const sc = t.bgs.map(b => `<span class="chip scene">${SCENES.find(x => x.id === b).name}</span>`).join('');
  openModal(`<h2 class="m-title">主题挑战</h2><p class="m-sub">按主题搭一套，三位评委会给你打分</p>
    <div class="theme-card"><div class="tt">${t.name}</div><p>${t.desc}</p><div class="chips">${tags}</div><div class="chips">${sc}</div></div>
    <div class="m-actions"><button class="pill" data-reroll="1">换个主题</button><button class="pill cherry" data-start="1" data-focus="1">开始搭配</button></div>`);
  play('swish');
}
function setChallengeUI() {
  const on = !!UI.challenge;
  $('#quest').hidden = !on; $('#brandTitle').hidden = on;
  if (on) $('#questTitle').textContent = UI.challenge.name;
  $('#chLabel').textContent = on ? '提交评分' : '主题挑战';
  $('#btnChallenge').classList.toggle('go', on);
}
function startChallenge() {
  UI.challenge = UI.pending;
  setChallengeUI();
  closeModal(); play('ding'); toast('搭好了就点右下角「提交评分」');
}
function quitChallenge() { UI.challenge = null; setChallengeUI(); }

function chroma(hex) { const [h, s, l] = toHsl(hex); return { h, c: s * (1 - Math.abs(2 * l - 1)) }; }
function harmony(cols) {
  const hues = cols.map(chroma).filter(x => x.c > .16).map(x => x.h);
  if (hues.length <= 1) return .92;
  const clusters = [];
  for (const h of hues) { if (!clusters.some(c => Math.min(Math.abs(c - h), 360 - Math.abs(c - h)) < 32)) clusters.push(h); }
  const base = [1, .95, .9, .78, .6, .48][Math.min(5, clusters.length)];
  return clamp(base, 0, 1);
}
function visibleWear() {
  const out = [];
  for (const slot of SLOTS) {
    const w = S.wear[slot]; if (!w) continue;
    const def = ITEM_INDEX[slot][w.id]; if (!def) continue;
    if (slot === 'top' && S.wear.dress && !ITEM_INDEX.dress[S.wear.dress.id].overTop) continue;
    if (slot === 'bottom' && S.wear.dress) continue;
    out.push({ slot, def, w, it: itemOf(slot, w) });
  }
  return out;
}
function evaluate(t) {
  const items = visibleWear();
  let fit = 0;
  const good = [], bad = [];
  for (const x of items) {
    let s = 0;
    for (const tg of x.def.tags) s += t.want[tg] || 0;
    if (x.def.tags.some(tg => t.avoid.includes(tg))) s -= 3;
    x.s = s;
    if (s >= 3) good.push(x); else if (s < 0) bad.push(x);
    fit += clamp(s, -3, 6);
  }
  const hair = HAIR_INDEX[S.hair.id];
  if (hair && hair.tags.some(tg => t.want[tg])) fit += 2;
  const back = S.hair.id !== 'none' && BACK_INDEX[S.backHair.id];
  if (back && back.tags.some(tg => t.want[tg])) fit += 1;
  const fitN = clamp(fit / 24, 0, 1);
  const hasOutfit = !!(S.wear.dress || (S.wear.top && S.wear.bottom));
  const accN = ['hat', 'glasses', 'neck', 'acc', 'held', 'back', 'face'].filter(k => S.wear[k]).length;
  const complete = clamp((hasOutfit ? .45 : .12) + (S.wear.shoes ? .25 : 0) + Math.min(accN, 3) * .1, 0, 1);
  const harm = harmony(items.map(x => x.it.c1));
  const scene = SCENES.find(x => x.id === S.bg);
  const sceneOk = t.bgs.includes(S.bg) ? 1 : scene.tags.some(tg => t.want[tg]) ? .6 : .2;
  const flair = clamp((accN + (S.wear.outer ? 1 : 0)) / 5, 0, 1);
  const total = Math.round(100 * (.5 * fitN + .17 * harm + .18 * complete + .15 * sceneOk));
  return { total, fitN, harm, complete, sceneOk, flair, good, bad, items, accN, hasOutfit };
}
const JUDGES = [
  { name: '狐狸主编', st: { species: 'fox', palIdx: 2, body: 'girl', expr: 'smile', eyes: { style: 'sparkle', color: '#ffc23a' }, hair: { id: 'cloud', color: '#e9ebf2' }, backHair: { id: 'wavy' }, wear: { glasses: { id: 'round' }, hat: { id: 'beret', c1: '#c8243c' } } }, score: r => .75 * r.fitN + .25 * r.sceneOk },
  { name: '熊熊裁缝', st: { species: 'bear', palIdx: 1, body: 'chub', expr: 'grin', eyes: { style: 'round', color: '#5a3a20' }, hair: { id: 'none', color: '#f0c27e' }, wear: { glasses: { id: 'browline' }, hat: { id: 'newsboy' } } }, score: r => .45 * r.complete + .4 * r.harm + .15 * r.fitN },
  { name: '猫咪超模', st: { species: 'cat', palIdx: 1, body: 'girl', expr: 'cool', eyes: { style: 'cat', color: '#ffcf3a' }, hair: { id: 'sweep', color: '#c9955a' }, backHair: { id: 'straight' }, wear: { glasses: { id: 'sunnies' } } }, score: r => .5 * r.fitN + .5 * r.flair },
];
function judgeAvatar(j, i) {
  const st = Object.assign({ pose: 'stand' }, clone(j.st));
  st.fur = palOf(st.species, st.palIdx);
  return renderCharacter(st, { id: 'jd' + i, viewBox: '64 30 272 272', noAnim: true, only: HEAD_ONLY });
}
function submitChallenge() {
  const t = UI.challenge; if (!t) return;
  const r = evaluate(t);
  const scores = JUDGES.map(j => clamp(Math.round((j.score(r) * 10 + (Math.random() - .5) * .6) * 10) / 10, 2, 10));
  const grade = r.total >= 90 ? 'S · 时尚教主' : r.total >= 80 ? 'A · 潮流达人' : r.total >= 65 ? 'B · 搭配新星' : r.total >= 50 ? 'C · 继续加油' : 'D · 再试一次';
  const stars = r.total >= 90 ? 5 : r.total >= 80 ? 4 : r.total >= 65 ? 3 : r.total >= 50 ? 2 : 1;
  const c1 = scores[0] >= 7 ? (r.good.length ? `「${r.good[0].def.name}」完美切题！` : '主题抓得很准！') : (r.good.length ? `「${r.good[0].def.name}」不错，其他单品再贴题一点。` : '主题感还可以再强一点。');
  const c1b = r.bad.length ? `「${r.bad[0].def.name}」有点跑题。` : '';
  const c2 = !r.hasOutfit ? '整套衣服还没穿齐哦。' : !S.wear.shoes ? '鞋子别忘了！' : r.harm > .85 ? '配色很和谐，针脚都对齐了。' : '颜色有点多，试试统一色调？';
  const c3 = scores[2] >= 7 ? '镜头感十足，可以直接上杂志！' : r.flair > .6 ? '配饰很出彩，可惜和主题不太搭。' : r.accN === 0 ? '空空的，加点配饰吧～' : '再加一两件配饰会更出彩。';
  const tips = [];
  if (r.sceneOk < 1) tips.push(`换成「${SCENES.find(x => x.id === t.bgs[0]).name}」背景会更有氛围。`);
  const sug = [];
  for (const slot of ['dress', 'top', 'bottom', 'outer', 'shoes', 'hat', 'neck', 'held']) {
    const best = ITEMS[slot].map(it => ({ it, s: it.tags.reduce((a, tg) => a + (t.want[tg] || 0), 0) - (it.tags.some(tg => t.avoid.includes(tg)) ? 9 : 0) })).sort((a, b) => b.s - a.s)[0];
    if (best && best.s >= 4 && !(S.wear[slot] && S.wear[slot].id === best.it.id)) sug.push(best.it.name);
  }
  if (sug.length) tips.push(`可以试试：${sug.slice(0, 3).join('、')}。`);
  const tick = [0, 20, 40, 60, 80, 100].map(n => `<span>${n}</span>`).join('');
  openModal(`<h2 class="m-title">${esc(t.name)} · 评分</h2>
    <div class="judges">${JUDGES.map((j, i) => `<div class="judge"><div class="av">${judgeAvatar(j, i)}</div><b>${j.name}</b><div class="sc" data-score="${scores[i]}">0.0</div><q>${[c1 + c1b, c2, c3][i]}</q></div>`).join('')}</div>
    <div class="score-big"><span id="totalN">0</span><small> / 100</small></div>
    <div class="tape" aria-hidden="true"><div class="fill" id="tapeFill"></div><div class="pin" id="tapePin"></div><div class="nums">${tick}</div></div>
    <div style="text-align:center"><span class="grade">${grade}</span></div>
    <div class="stars">${[0, 1, 2, 3, 4].map(i => `<span style="color:${i < stars ? '#ffc23a' : '#e5dcec'}" class="${i < stars ? 'on' : ''}">${ICO.star}</span>`).join('')}</div>
    ${tips.length ? `<div class="tips">${tips.join('<br>')}</div>` : ''}
    <div class="m-actions"><button class="pill" data-close="1">继续调整</button><button class="pill" data-photo="1">拍照留念</button><button class="pill cherry" data-next="1" data-focus="1">下一题</button></div>`, c => {
    requestAnimationFrame(() => {
      c.querySelector('#tapeFill').style.width = r.total + '%';
      c.querySelector('#tapePin').style.left = `calc(${r.total}% - 2px)`;
      countUp(c.querySelector('#totalN'), r.total, 0, 1300);
      c.querySelectorAll('.sc').forEach((el, i) => countUp(el, +el.dataset.score, 1, 900 + i * 200));
      c.querySelectorAll('.stars .on').forEach((el, i) => el.style.animationDelay = (1.1 + i * .15) + 's');
    });
  });
  play('fanfare'); BGM.duck(3);
  if (r.total >= 65) confetti(r.total >= 90 ? 90 : 50);
}
function countUp(el, to, dec, ms) {
  const t0 = performance.now();
  const step = now => { const k = Math.min(1, (now - t0) / ms); const e = 1 - Math.pow(1 - k, 3); el.textContent = (to * e).toFixed(dec); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function confetti(n) {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cols = ['#ee4a72', '#ffd56b', '#7cc37a', '#9fe3ff', '#c4b0f0', '#ff9a5c'];
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = pick(cols);
    el.style.borderRadius = chance(.4) ? '50%' : '2px';
    el.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
    el.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
    el.style.animationDelay = Math.random() * .6 + 's';
    el.style.animationDuration = 1.8 + Math.random() * 1.4 + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

/* ---------- photo ---------- */
function composeSVG(W, H) {
  const bg = renderScene(S.bg, 'xp', { noAnim: true }).replace('<svg ', `<svg x="0" y="0" width="${W}" height="${H}" `);
  const ch = H * .94, cw = ch * 400 / 720;
  const chr = renderCharacter(S, { id: 'xp', noAnim: true }).replace('<svg ', `<svg x="${(W - cw) / 2}" y="${H - ch - H * .01}" width="${cw}" height="${ch}" `);
  const shadow = `<ellipse cx="${W / 2}" cy="${H * .985}" rx="${W * .2}" ry="${H * .028}" fill="#2b143c" opacity=".22"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${bg}${shadow}${chr}</svg>`;
}
function loadImg(src) { return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; }); }
async function makePhoto(name) {
  const PW = 900, PH = 1080, M = 54, CAP = 190;
  const cv = document.createElement('canvas');
  cv.width = PW + M * 2; cv.height = PH + M + CAP;
  const c = cv.getContext('2d');
  c.fillStyle = '#fffdf8'; c.fillRect(0, 0, cv.width, cv.height);
  const img = await loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(composeSVG(PW, PH)));
  c.drawImage(img, M, M, PW, PH);
  c.strokeStyle = 'rgba(59,33,80,.12)'; c.lineWidth = 2; c.strokeRect(M, M, PW, PH);
  try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) { /* ignore */ }
  c.fillStyle = '#3b2150'; c.textAlign = 'center';
  c.font = '64px "ZCOOL KuaiLe","PingFang SC","Microsoft YaHei",sans-serif';
  c.fillText(name || '绒绒', cv.width / 2, PH + M + 92);
  const d = new Date();
  c.font = '30px "ZCOOL KuaiLe","PingFang SC","Microsoft YaHei",sans-serif';
  c.fillStyle = '#8a7399';
  const sub = (UI.challenge ? UI.challenge.name + '  ·  ' : '') + `绒绒时装屋  ${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  c.fillText(sub, cv.width / 2, PH + M + 144);
  return cv.toDataURL('image/png');
}
async function openPhoto() {
  play('shutter'); BGM.duck(2);
  const flash = document.createElement('div');
  flash.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:80;opacity:.9;transition:opacity .45s;pointer-events:none';
  document.body.appendChild(flash);
  requestAnimationFrame(() => requestAnimationFrame(() => { flash.style.opacity = 0; }));
  setTimeout(() => flash.remove(), 600);
  openModal(`<h2 class="m-title">拍立得</h2><div class="name-in"><label for="nm">名字</label><input id="nm" maxlength="12" value="${esc(S.name || '')}"></div><div class="photo-wrap" id="pw"><p class="m-sub">冲洗中…</p></div>
    <div class="m-actions"><button class="pill cherry" data-dl="1">${ICO.download.replace('<svg', '<svg width="18" height="18"')}保存图片</button></div><p class="hint">手机上也可以长按照片保存</p>`);
  await refreshPhoto();
}
let photoURL = '';
async function refreshPhoto() {
  const pw = $('#pw'); if (!pw) return;
  try {
    photoURL = await makePhoto(S.name);
    pw.innerHTML = `<img alt="角色照片" src="${photoURL}">`;
  } catch (e) {
    pw.innerHTML = '<p class="m-sub">照片生成失败，换个浏览器再试试。</p>';
  }
}
function downloadPhoto() {
  if (!photoURL) return;
  const a = document.createElement('a');
  a.href = photoURL; a.download = `绒绒时装屋-${S.name || 'photo'}.png`;
  document.body.appendChild(a); a.click(); a.remove();
  toast('照片已保存');
}

/* ---------- events ---------- */
function bind() {
  $('#btnUndo').innerHTML = ICO.undo;
  $('#btnRandom').innerHTML = ICO.dice;
  $('#btnPhoto').innerHTML = ICO.camera;
  const setSound = () => { $('#btnSound').innerHTML = UI.sound ? ICO.soundOn : ICO.soundOff; $('#btnSound').setAttribute('aria-pressed', UI.sound); };
  setSound();
  document.querySelectorAll('[data-ico]').forEach(el => el.innerHTML = ICO[el.dataset.ico]);
  $('#btnUndo').onclick = undo;
  $('#btnRandom').onclick = randomize;
  $('#btnSound').onclick = () => { UI.sound = !UI.sound; setSound(); save(); if (UI.sound) play('ding'); };
  const setMusic = () => { $('#btnMusic').innerHTML = UI.music ? ICO.musicOn : ICO.musicOff; $('#btnMusic').setAttribute('aria-pressed', UI.music); };
  setMusic();
  $('#btnMusic').onclick = () => { UI.music = !UI.music; setMusic(); save(); music(UI.music); };
  // only once audio has been unlocked: a context made here, with no gesture, would start suspended
  document.addEventListener('visibilitychange', () => { if (UI.music && BGM.context) music(!document.hidden); });
  $('#btnPhoto').onclick = openPhoto;
  $('#btnPresets').onclick = openPresets;
  $('#btnChallenge').onclick = () => UI.challenge ? submitChallenge() : openChallenge();
  $('#btnQuit').onclick = () => { quitChallenge(); play('tap'); };
  $('#handle').onclick = () => { UI.collapsed = !UI.collapsed; $('#drawer').classList.toggle('collapsed', UI.collapsed); play('tap'); };
  $('#groups').onclick = e => {
    const b = e.target.closest('[data-g]'); if (!b) return;
    UI.group = b.dataset.g;
    const gp = GROUPS.find(x => x.id === UI.group);
    if (!gp.cats.includes(UI.cat)) UI.cat = gp.cats[0];
    renderGroups(); renderCats(); renderItems(); renderEditor(); play('tap');
    if (UI.collapsed) { UI.collapsed = false; $('#drawer').classList.remove('collapsed'); }
  };
  $('#cats').onclick = e => {
    const b = e.target.closest('[data-c]'); if (!b) return;
    UI.cat = b.dataset.c; UI.target = 'c1';
    renderCats(); renderItems(); renderEditor(); play('tap');
    b.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    if (UI.collapsed) { UI.collapsed = false; $('#drawer').classList.remove('collapsed'); }
  };
  $('#items').onclick = e => { const b = e.target.closest('[data-id]'); if (b) selectTile(b.dataset.id); };
  const ed = $('#editor');
  ed.onclick = e => {
    const sp = e.target.closest('[data-col]'); if (sp) { setColor(sp.dataset.col); return; }
    const t = e.target.closest('[data-t]'); if (t) { UI.target = t.dataset.t; renderEditor(); play('tap'); return; }
    const f = e.target.closest('[data-f]'); if (f) { UI.fur = f.dataset.f; renderEditor(); play('tap'); return; }
    const p = e.target.closest('[data-pat]'); if (p) { setPattern(p.dataset.pat); return; }
    const go = e.target.closest('[data-go]'); if (go) { UI.cat = go.dataset.go; renderCats(); renderItems(); renderEditor(); play('tap'); return; }
    const tk = e.target.closest('[data-tuck]'); if (tk) { commit(s => { s.wear.top.tuck = !itemOf('top', s.wear.top).tuck; remember(s, 'top'); }, { fx: 'top' }); play('pop'); }
  };
  let colorT = 0;
  ed.addEventListener('input', e => { if (e.target.dataset.custom) { const v = e.target.value; clearTimeout(colorT); colorT = setTimeout(() => setColor(v), 60); } });
  $('#modal').onclick = e => {
    if (e.target.id === 'modal' || e.target.closest('[data-close]')) { closeModal(); return; }
    const pr = e.target.closest('[data-preset]'); if (pr) { applyPreset(+pr.dataset.preset); return; }
    if (e.target.closest('[data-reroll]')) { openChallenge(); return; }
    if (e.target.closest('[data-start]')) { startChallenge(); return; }
    if (e.target.closest('[data-next]')) { closeModal(); openChallenge(); return; }
    if (e.target.closest('[data-photo]')) { closeModal(); openPhoto(); return; }
    if (e.target.closest('[data-dl]')) { downloadPhoto(); return; }
  };
  let nameT = 0;
  $('#modal').addEventListener('input', e => { if (e.target.id === 'nm') { S.name = e.target.value.slice(0, 12); save(); clearTimeout(nameT); nameT = setTimeout(refreshPhoto, 350); } });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#modal').hidden) closeModal();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && $('#modal').hidden) { e.preventDefault(); undo(); }
  });
  /* unlock audio on the first real gesture. Browsers differ in which events count (Safari ignores pointerdown,
     a key press counts too), and a context created on an event that doesn't count stays suspended: so keep
     listening on all of them until the context is actually running, and start the music then */
  const UNLOCK = ['pointerdown', 'pointerup', 'click', 'touchend', 'keydown'];
  const unlock = () => {
    const a = ac(); if (!a) return;
    if (UI.music) music(true);
    const done = () => { if (a.state === 'running') UNLOCK.forEach(ev => document.removeEventListener(ev, unlock, true)); };
    done(); if (a.resume) a.resume().then(done, () => {});
  };
  UNLOCK.forEach(ev => document.addEventListener(ev, unlock, true));
}

/* ---------- boot ---------- */
bind();
renderGroups();
refresh({});
/*TRAILER_HOOK*/
(() => {
  const c = $('#curtain');
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { c.classList.add('gone'); return; }
  setTimeout(() => { c.classList.add('open'); sparkleAt([200, 300], 12); }, 350);
  setTimeout(() => c.classList.add('gone'), 1700);
})();
})();
