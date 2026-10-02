// Small story props. Each builder returns a Group whose origin is the hand-grip point.
// userData flags: upright (stays level in the hand), onBody (rests against the body),
// mount: 'back' (worn on the back), float (balloon).
import * as THREE from 'three';
import { mats, mesh, sphere, capsule, geo, lathe, tube, canvasTexture } from './util.js';
import { STORY_PROPS, storyBuilders } from './props-story.js';

export const PROPS = {
  none: 'Nothing',
  ball: 'Toys: Ball',
  balloon: 'Toys: Balloon',
  teddy: 'Toys: Teddy bear',
  doll: 'Toys: Doll',
  toycar: 'Toys: Toy car',
  rattle: 'Toys: Baby rattle',
  boxcam: 'Toys: Cardboard "vlog camera"',
  wand: 'Toys: Star wand',
  bat: 'Toys: Cricket bat',
  gift: 'Toys: Gift box',
  apple: 'Food: Apple',
  banana: 'Food: Banana',
  carrot: 'Food: Carrot',
  icecream: 'Food: Ice cream',
  laddoo: 'Food: Laddoo (sweet)',
  cake: 'Food: Birthday cake',
  bowl: 'Food: Bowl of food',
  spoon: 'Food: Spoon',
  cup: 'Food: Cup of milk',
  milkbottle: 'Food: Baby milk bottle',
  waterbottle: 'Food: Water bottle',
  lunchbox: 'Food: Lunch box (tiffin)',
  book: 'School: Book',
  openbook: 'School: Open book',
  pencil: 'School: Pencil',
  schoolbag: 'School: School bag (on back)',
  paintbrush: 'School: Paintbrush',
  palette: 'School: Paint palette',
  trophy: 'School: Trophy',
  flag: 'School: Indian flag',
  toothbrush: 'Home: Toothbrush',
  phone: 'Home: Phone',
  broom: 'Home: Broom',
  ladle: 'Home: Cooking ladle',
  umbrella: 'Home: Umbrella',
  shoppingbag: 'Home: Shopping bag',
  purse: 'Home: Purse',
  magnifier: 'Home: Magnifying glass',
  varmala: 'Wedding: Flower garland (varmala)',
  pujathali: 'Wedding: Puja thali with diya',
  diya: 'Wedding: Diya (oil lamp)',
  kalash: 'Wedding: Kalash',
  coconut: 'Wedding: Coconut',
  dhol: 'Wedding: Dhol (drum)',
  shagun: 'Wedding: Shagun envelope',
  mic: 'Fun: Microphone',
  flower: 'Fun: Flower',
  sitar: 'Fun: Sitar',
  ...STORY_PROPS,
};

const builders = {
  // Rests against the body; origin is the centre of the bowl, neck along +y.
  sitar() {
    const g = new THREE.Group();
    const wood = mats.glossy('#7a3b16', 0.35), light = mats.glossy('#d9a15b', 0.3), ivory = mats.matte('#f3ead6', 0.6);
    const bowl = mesh(sphere(0.13, 40, 28), wood, 0, 0, -0.02);
    bowl.scale.set(1, 1, 0.75);
    g.add(bowl);
    const face = mesh(new THREE.CircleGeometry(0.115, 40), light, 0, 0, 0.078);
    g.add(face);
    g.add(mesh(new THREE.BoxGeometry(0.06, 0.012, 0.02), ivory, 0, -0.03, 0.09)); // bridge
    g.add(mesh(new THREE.BoxGeometry(0.055, 0.78, 0.035), wood, 0, 0.5, 0.05)); // neck
    g.add(mesh(new THREE.BoxGeometry(0.05, 0.78, 0.004), light, 0, 0.5, 0.069)); // fingerboard
    for (let i = 0; i < 16; i++) g.add(mesh(new THREE.BoxGeometry(0.058, 0.004, 0.012), mats.metal('#d9d9d9', 0.3), 0, 0.16 + i * 0.042, 0.075, { cast: false }));
    for (const x of [-0.012, 0, 0.012]) g.add(mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.9, 4), mats.metal('#eeeeee', 0.2), x, 0.43, 0.08, { cast: false }));
    const top = mesh(sphere(0.055, 24, 16), wood, 0, 0.82, -0.02); // small gourd at the top
    top.scale.set(1, 1, 0.8);
    g.add(top);
    g.add(mesh(new THREE.BoxGeometry(0.05, 0.12, 0.03), wood, 0, 0.93, 0.04)); // peg box
    for (let i = 0; i < 4; i++) {
      const peg = mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.07, 8), ivory, (i % 2 ? 1 : -1) * 0.045, 0.89 + i * 0.025, 0.04);
      peg.rotation.z = Math.PI / 2;
      g.add(peg);
    }
    g.userData.onBody = true;
    return g;
  },
  carrot() {
    const g = new THREE.Group();
    const body = mesh(new THREE.ConeGeometry(0.045, 0.24, 20), mats.glossy('#ff7a1a', 0.5), 0, -0.07, 0);
    body.rotation.x = Math.PI;
    g.add(body);
    for (let i = 0; i < 3; i++) {
      const leaf = mesh(new THREE.ConeGeometry(0.018, 0.12, 8), mats.fur('#3faa3a'), 0, 0.09, 0);
      leaf.rotation.z = (i - 1) * 0.35;
      g.add(leaf);
    }
    return g;
  },
  balloon(color = '#ff4d6d') {
    const g = new THREE.Group();
    const string = mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.9, 4), mats.matte('#eeeeee'), 0, 0.45, 0, { cast: false });
    g.add(string);
    const b = mesh(sphere(0.2), mats.glossy(color, 0.12), 0, 1.08, 0);
    b.scale.set(1, 1.18, 1);
    g.add(b);
    g.add(mesh(new THREE.ConeGeometry(0.03, 0.05, 12), mats.glossy(color, 0.12), 0, 0.87, 0));
    g.userData.float = true;
    return g;
  },
  ball() {
    const g = new THREE.Group();
    const tex = document.createElement('canvas');
    tex.width = 256; tex.height = 128;
    const c = tex.getContext('2d');
    ['#ff4d4d', '#ffd23f', '#3fa7ff', '#ffffff'].forEach((col, i) => { c.fillStyle = col; c.fillRect(i * 64, 0, 64, 128); });
    const map = new THREE.CanvasTexture(tex);
    map.colorSpace = THREE.SRGBColorSpace;
    g.add(mesh(new THREE.SphereGeometry(0.12, 32, 24), new THREE.MeshPhysicalMaterial({ map, roughness: 0.3, clearcoat: 1 }), 0, 0.04, 0.06));
    return g;
  },
  gift() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(0.22, 0.2, 0.22), mats.glossy('#7c4dff', 0.4), 0, 0.02, 0.1));
    g.add(mesh(new THREE.BoxGeometry(0.235, 0.21, 0.04), mats.glossy('#ffd23f', 0.3), 0, 0.02, 0.1));
    g.add(mesh(new THREE.BoxGeometry(0.04, 0.21, 0.235), mats.glossy('#ffd23f', 0.3), 0, 0.02, 0.1));
    for (const s of [-1, 1]) {
      const bow = mesh(new THREE.TorusGeometry(0.04, 0.012, 8, 16), mats.glossy('#ffd23f', 0.3), s * 0.035, 0.14, 0.1);
      bow.rotation.y = Math.PI / 2;
      g.add(bow);
    }
    return g;
  },
  book() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(0.16, 0.22, 0.04), mats.cloth('#2f6fdf'), 0, 0.04, 0.03));
    g.add(mesh(new THREE.BoxGeometry(0.15, 0.21, 0.035), mats.matte('#fffaf0'), 0.006, 0.04, 0.03));
    return g;
  },
  flower() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.28, 6), mats.fur('#3faa3a'), 0, 0.1, 0));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const p = mesh(sphere(0.03, 12, 8), mats.fur('#ff6fae'), Math.cos(a) * 0.04, 0.25, Math.sin(a) * 0.04);
      p.scale.set(1, 0.5, 1);
      g.add(p);
    }
    g.add(mesh(sphere(0.022, 12, 8), mats.fur('#ffd23f'), 0, 0.255, 0));
    return g;
  },
  icecream() {
    const g = new THREE.Group();
    const cone = mesh(new THREE.ConeGeometry(0.045, 0.16, 16), mats.matte('#d9a066', 0.7), 0, 0, 0);
    cone.rotation.x = Math.PI;
    g.add(cone);
    g.add(mesh(sphere(0.055), mats.glossy('#ffb3c7', 0.4), 0, 0.1, 0));
    g.add(mesh(sphere(0.045), mats.glossy('#fff1d6', 0.4), 0, 0.17, 0));
    g.add(mesh(sphere(0.015), mats.glossy('#e0102f', 0.1), 0, 0.225, 0));
    return g;
  },
  apple() {
    const g = new THREE.Group();
    const a = mesh(sphere(0.07), mats.glossy('#e3262f', 0.25), 0, 0.02, 0.05);
    a.scale.set(1, 0.92, 1);
    g.add(a);
    g.add(mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.04), mats.matte('#6b4226'), 0, 0.1, 0.05));
    return g;
  },
  wand() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.34, 8), mats.glossy('#ffffff', 0.2), 0, 0.1, 0));
    const shape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 0.035 : 0.08, a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      i ? shape.lineTo(Math.cos(a) * r, Math.sin(a) * r) : shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const star = mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008 }),
      mats.glow('#ffd23f', 1.6), 0, 0.3, -0.01);
    g.add(star);
    return g;
  },
  teddy() {
    const g = new THREE.Group();
    const fur = mats.fur('#b07845');
    g.add(mesh(sphere(0.07), fur, 0, 0.0, 0.06));
    g.add(mesh(sphere(0.055), fur, 0, 0.11, 0.06));
    for (const s of [-1, 1]) g.add(mesh(sphere(0.02), fur, s * 0.04, 0.16, 0.06));
    for (const s of [-1, 1]) g.add(mesh(sphere(0.01), mats.glossy('#111'), s * 0.02, 0.12, 0.11));
    return g;
  },

  // ---------- food & drink ----------
  spoon() {
    const g = upright();
    const steel = mats.metal('#d8dde3', 0.2);
    g.add(mesh(geo('spoonHandle', () => new THREE.CylinderGeometry(0.006, 0.008, 0.15, 8)), steel, 0, 0.03, 0.02));
    put(g, mesh(sphere(0.026, 16, 10), steel, 0, 0.12, 0.022)).scale.set(1, 0.3, 1.35);
    return g;
  },
  bowl() {
    const g = upright();
    g.add(mesh(lathe('bowl', [[0.001, 0.0], [0.05, 0.002], [0.085, 0.03], [0.096, 0.07], [0.088, 0.072], [0.078, 0.036], [0.046, 0.013], [0.001, 0.013]]), doubleSide('#ff8a3d', 0.3), 0, 0, 0.05));
    const food = mesh(sphere(0.082, 24, 12), mats.matte('#fff1c0', 0.7), 0, 0.055, 0.05);
    food.scale.set(1, 0.28, 1);
    g.add(food);
    return g;
  },
  cup() {
    const g = upright();
    g.add(mesh(geo('cupBody', () => new THREE.CylinderGeometry(0.042, 0.036, 0.1, 24)), mats.glossy('#3fa7ff', 0.25), 0, 0.04, 0.05));
    g.add(mesh(geo('cupMilk', () => new THREE.CircleGeometry(0.037, 24).rotateX(-Math.PI / 2)), mats.matte('#fffdf6', 0.5), 0, 0.085, 0.05, { cast: false }));
    g.add(mesh(geo('cupHandle', () => new THREE.TorusGeometry(0.024, 0.007, 8, 16)), mats.glossy('#3fa7ff', 0.25), 0.045, 0.045, 0.05));
    return g;
  },
  milkbottle() {
    const g = upright();
    g.add(mesh(geo('mbBody', () => new THREE.CylinderGeometry(0.034, 0.034, 0.12, 20)), mats.glossy('#fffaf0', 0.15), 0, 0.02, 0.04));
    g.add(mesh(geo('mbRing', () => new THREE.CylinderGeometry(0.037, 0.037, 0.022, 20)), mats.glossy('#ff9ec4', 0.3), 0, 0.09, 0.04));
    put(g, mesh(sphere(0.021, 14, 10), mats.glossy('#ffcf9a', 0.3), 0, 0.115, 0.04)).scale.set(1, 1.5, 1);
    return g;
  },
  waterbottle() {
    const g = upright();
    g.add(mesh(geo('wbBody', () => new THREE.CylinderGeometry(0.034, 0.034, 0.2, 20)), mats.glossy('#2ec4b6', 0.25), 0, 0.05, 0.04));
    g.add(mesh(geo('wbCap', () => new THREE.CylinderGeometry(0.024, 0.026, 0.035, 16)), mats.glossy('#ffffff', 0.3), 0, 0.165, 0.04));
    return g;
  },
  lunchbox() {
    const g = upright();
    const steel = mats.metal('#cfd6dd', 0.18);
    for (let i = 0; i < 3; i++) g.add(mesh(geo('tiffinTier', () => new THREE.CylinderGeometry(0.06, 0.06, 0.045, 24)), steel, 0, -0.17 + i * 0.05, 0.03));
    g.add(mesh(geo('tiffinHandle', () => new THREE.TorusGeometry(0.045, 0.006, 6, 20, Math.PI)), steel, 0, -0.04, 0.03));
    return g;
  },
  banana() {
    const g = upright();
    const b = mesh(geo('banana', () => new THREE.TorusGeometry(0.07, 0.019, 10, 20, 1.7)), mats.glossy('#ffd84a', 0.4), -0.05, 0.02, 0.04);
    b.rotation.z = -0.2;
    g.add(b);
    g.add(mesh(sphere(0.008, 6, 6), mats.matte('#5a4020'), 0.05, 0.025, 0.04));
    return g;
  },
  laddoo() {
    const g = upright();
    g.add(mesh(sphere(0.045, 20, 14), mats.fur('#ffa733'), 0, 0.03, 0.05));
    return g;
  },
  cake() {
    const g = upright();
    g.add(mesh(geo('cakePlate', () => new THREE.CylinderGeometry(0.14, 0.14, 0.012, 32)), mats.glossy('#ffffff', 0.2), 0, 0.0, 0.07));
    g.add(mesh(geo('cakeBody', () => new THREE.CylinderGeometry(0.11, 0.11, 0.09, 32)), mats.matte('#fff1d6', 0.6), 0, 0.05, 0.07));
    g.add(mesh(geo('cakeIcing', () => new THREE.CylinderGeometry(0.115, 0.115, 0.022, 32)), mats.glossy('#ff8fb1', 0.3), 0, 0.1, 0.07));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.add(mesh(sphere(0.012, 8, 6), mats.glossy('#ff3d6e', 0.2), Math.cos(a) * 0.085, 0.115, 0.07 + Math.sin(a) * 0.085, { cast: false }));
    }
    for (const x of [-0.04, 0, 0.04]) {
      g.add(mesh(geo('candle', () => new THREE.CylinderGeometry(0.006, 0.006, 0.05, 8)), mats.glossy(x ? '#7ad3ff' : '#ffd23f', 0.3), x, 0.135, 0.07));
      put(g, mesh(sphere(0.009, 8, 6), mats.glow('#ffb347', 3), x, 0.168, 0.07, { cast: false })).scale.set(1, 1.6, 1);
    }
    return g;
  },

  // ---------- toys ----------
  rattle() {
    const g = new THREE.Group();
    g.add(mesh(capsule(0.012, 0.09), mats.glossy('#7ad3ff', 0.3), 0, 0.02, 0.02));
    g.add(mesh(sphere(0.045, 20, 14), mats.glossy('#ffd23f', 0.25), 0, 0.12, 0.02));
    const ring = mesh(geo('rattleRing', () => new THREE.TorusGeometry(0.047, 0.008, 8, 24)), mats.glossy('#ff5c9a', 0.3), 0, 0.12, 0.02);
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
    return g;
  },
  toycar() {
    const g = upright();
    const red = mats.glossy('#e53935', 0.25);
    g.add(mesh(new THREE.BoxGeometry(0.17, 0.05, 0.09), red, 0, 0.045, 0.05));
    g.add(mesh(new THREE.BoxGeometry(0.09, 0.045, 0.08), red, -0.01, 0.09, 0.05));
    g.add(mesh(new THREE.BoxGeometry(0.092, 0.03, 0.082), mats.glossy('#9fd8ff', 0.05), -0.01, 0.092, 0.05, { cast: false }));
    for (const x of [-0.055, 0.055]) for (const z of [0.005, 0.095]) {
      const w = mesh(geo('toyWheel', () => new THREE.CylinderGeometry(0.022, 0.022, 0.016, 14).rotateX(Math.PI / 2)), mats.matte('#222'), x, 0.022, z);
      g.add(w);
    }
    return g;
  },
  doll() {
    const g = upright();
    g.add(mesh(new THREE.ConeGeometry(0.06, 0.13, 20), mats.cloth('#ff8fb1'), 0, 0.03, 0.05));
    g.add(mesh(sphere(0.045, 20, 14), mats.skin('#f2c9a5'), 0, 0.13, 0.05));
    const hair = mesh(geo('dollHair', () => new THREE.SphereGeometry(0.048, 20, 12, 0, Math.PI * 2, 0, 1.6)), mats.fur('#7a4a22'), 0, 0.135, 0.045);
    hair.rotation.x = -0.4;
    g.add(hair);
    for (const s of [-1, 1]) g.add(mesh(sphere(0.007, 6, 6), mats.glossy('#111'), s * 0.016, 0.135, 0.092, { cast: false }));
    return g;
  },
  bat() {
    const g = new THREE.Group();
    g.add(mesh(geo('batGrip', () => new THREE.CylinderGeometry(0.014, 0.014, 0.17, 10)), mats.matte('#2c3e50', 0.8), 0, 0.03, 0.02));
    g.add(mesh(geo('batBlade', () => new THREE.BoxGeometry(0.085, 0.42, 0.028)), mats.matte('#ecd09a', 0.6), 0, 0.32, 0.02));
    g.add(mesh(geo('batSplice', () => new THREE.ConeGeometry(0.03, 0.06, 4)), mats.matte('#ecd09a', 0.6), 0, 0.11, 0.02));
    return g;
  },

  // ---------- school ----------
  openbook() {
    const g = upright();
    for (const s of [-1, 1]) {
      const leaf = new THREE.Group();
      leaf.position.set(0, 0.1, 0.07);
      leaf.rotation.y = s * 0.32;
      const cover = mesh(geo('bookCover', () => new THREE.BoxGeometry(0.13, 0.18, 0.008).translate(0.065, 0, 0.005)), mats.cloth('#e53935'));
      cover.scale.x = s;
      leaf.add(cover);
      const page = mesh(geo('bookPage', () => new THREE.PlaneGeometry(0.12, 0.17).rotateY(Math.PI).translate(0.064, 0, -0.001)), pageMat(), 0, 0, 0, { cast: false });
      page.scale.x = s;
      leaf.add(page);
      g.add(leaf);
    }
    return g;
  },
  pencil() {
    const g = upright();
    g.add(mesh(geo('pencilBody', () => new THREE.CylinderGeometry(0.008, 0.008, 0.15, 6)), mats.glossy('#ffd23f', 0.35), 0, 0.0, 0.03));
    const tip = mesh(geo('pencilTip', () => new THREE.ConeGeometry(0.008, 0.03, 6)), mats.matte('#f1c99a'), 0, -0.09, 0.03);
    tip.rotation.x = Math.PI;
    g.add(tip);
    g.add(mesh(geo('pencilEraser', () => new THREE.CylinderGeometry(0.008, 0.008, 0.018, 8)), mats.matte('#ff8fb1'), 0, 0.084, 0.03));
    return g;
  },
  schoolbag() {
    const g = new THREE.Group();
    const blue = mats.cloth('#3f6fdf'), dark = mats.cloth('#24418f');
    g.add(mesh(geo('bagBody', () => new THREE.CapsuleGeometry(0.1, 0.12, 6, 16).scale(1.25, 1, 0.55)), blue, 0, 0.19, -0.23));
    g.add(mesh(geo('bagPocket', () => new THREE.CapsuleGeometry(0.06, 0.05, 6, 12).scale(1.4, 1, 0.5)), dark, 0, 0.13, -0.285));
    g.add(mesh(geo('bagFlap', () => new THREE.BoxGeometry(0.2, 0.012, 0.11)), mats.glossy('#ffd23f', 0.4), 0, 0.33, -0.23));
    for (const s of [-1, 1]) {
      g.add(mesh(geo(`strap${s}`, () => tube([[s * 0.075, 0.31, -0.19], [s * 0.1, 0.365, -0.06], [s * 0.11, 0.35, 0.06], [s * 0.105, 0.25, 0.155], [s * 0.095, 0.12, 0.17]], 0.012, 24)), dark));
    }
    g.userData.mount = 'back';
    return g;
  },
  paintbrush() {
    const g = upright();
    g.add(mesh(geo('pbHandle', () => new THREE.CylinderGeometry(0.006, 0.008, 0.17, 8)), mats.glossy('#c0392b', 0.3), 0, 0.02, 0.025));
    g.add(mesh(geo('pbFerrule', () => new THREE.CylinderGeometry(0.008, 0.007, 0.025, 8)), mats.metal('#cccccc'), 0, 0.115, 0.025));
    g.add(mesh(geo('pbTip', () => new THREE.ConeGeometry(0.009, 0.04, 8)), mats.glossy('#3fa7ff', 0.3), 0, 0.145, 0.025));
    return g;
  },
  palette() {
    const g = upright();
    const board = mesh(geo('palette', () => new THREE.CylinderGeometry(0.1, 0.1, 0.01, 28).scale(1.25, 1, 1)), mats.matte('#e3b778', 0.6), 0.03, 0.0, 0.06);
    g.add(board);
    ['#e53935', '#ffd23f', '#3fa7ff', '#43a047', '#ffffff'].forEach((c, i) => {
      const a = (i / 5) * Math.PI * 1.4 + 0.3;
      put(g, mesh(sphere(0.016, 10, 8), mats.glossy(c, 0.3), 0.03 + Math.cos(a) * 0.075, 0.008, 0.06 + Math.sin(a) * 0.06, { cast: false })).scale.set(1, 0.4, 1);
    });
    return g;
  },
  trophy() {
    const g = upright();
    const gold = mats.metal('#ffcc33', 0.2);
    g.add(mesh(new THREE.BoxGeometry(0.09, 0.03, 0.09), mats.glossy('#5d4037', 0.3), 0, -0.01, 0.05));
    g.add(mesh(lathe('trophyCup', [[0.001, 0.0], [0.03, 0.0], [0.012, 0.03], [0.012, 0.06], [0.05, 0.09], [0.065, 0.16], [0.06, 0.16], [0.001, 0.12]]), gold, 0, 0.0, 0.05));
    for (const s of [-1, 1]) {
      const h = mesh(geo('trophyHandle', () => new THREE.TorusGeometry(0.025, 0.006, 6, 16)), gold, s * 0.065, 0.125, 0.05);
      g.add(h);
    }
    return g;
  },
  flag() {
    const g = upright();
    g.add(mesh(geo('flagStick', () => new THREE.CylinderGeometry(0.006, 0.006, 0.5, 8)), mats.matte('#8b5a2b'), 0, 0.17, 0.02));
    const cloth = mesh(geo('flagCloth', () => new THREE.PlaneGeometry(0.24, 0.16).translate(0.12, 0, 0)), flagMat(), 0.006, 0.34, 0.02);
    g.add(cloth);
    return g;
  },

  // ---------- home ----------
  toothbrush() {
    const g = new THREE.Group();
    g.add(mesh(geo('tbHandle', () => new THREE.BoxGeometry(0.016, 0.16, 0.012)), mats.glossy('#3fa7ff', 0.3), 0, 0.04, 0.02));
    g.add(mesh(geo('tbBristles', () => new THREE.BoxGeometry(0.016, 0.034, 0.018)), mats.matte('#ffffff', 0.6), 0, 0.105, 0.035));
    return g;
  },
  phone() {
    const g = upright();
    g.add(mesh(geo('phoneBody', () => new THREE.BoxGeometry(0.06, 0.115, 0.012)), mats.glossy('#20232a', 0.15), 0, 0.04, 0.03));
    g.add(mesh(geo('phoneScreen', () => new THREE.PlaneGeometry(0.05, 0.095)), mats.glow('#7ad3ff', 0.9), 0, 0.04, 0.037, { cast: false }));
    return g;
  },
  broom() {
    const g = new THREE.Group();
    g.add(mesh(geo('broomStick', () => new THREE.CylinderGeometry(0.012, 0.012, 0.75, 8)), mats.matte('#b07a45'), 0, -0.05, 0.03));
    g.add(mesh(geo('broomTie', () => new THREE.CylinderGeometry(0.022, 0.022, 0.05, 10)), mats.cloth('#e53935'), 0, -0.42, 0.03));
    g.add(mesh(geo('broomHead', () => new THREE.ConeGeometry(0.09, 0.2, 14, 1, true)), doubleSide('#d9b36a', 0.9), 0, -0.53, 0.03));
    return g;
  },
  ladle() {
    const g = upright();
    const steel = mats.metal('#d0d6dc', 0.2);
    g.add(mesh(geo('ladleStick', () => new THREE.CylinderGeometry(0.007, 0.007, 0.3, 8)), steel, 0, -0.08, 0.03));
    g.add(mesh(geo('ladleBowl', () => new THREE.SphereGeometry(0.035, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2)), doubleSide('#d0d6dc', 0.2, true), 0, -0.23, 0.03));
    return g;
  },
  umbrella() {
    const g = upright();
    g.add(mesh(geo('umbShaft', () => new THREE.CylinderGeometry(0.008, 0.008, 0.85, 8)), mats.metal('#555555', 0.4), 0, 0.38, 0.03));
    const hook = mesh(geo('umbHook', () => new THREE.TorusGeometry(0.03, 0.008, 6, 14, Math.PI)), mats.glossy('#222', 0.3), 0.03, -0.04, 0.03);
    hook.rotation.z = Math.PI;
    g.add(hook);
    g.add(mesh(geo('umbCanopy', () => stripedCone(0.55, 0.22, ['#ff5c9a', '#ffd23f'])), new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.6, flatShading: true }), 0, 0.88, 0.03));
    g.add(mesh(sphere(0.015, 8, 6), mats.glossy('#222'), 0, 1.0, 0.03));
    return g;
  },
  shoppingbag() {
    const g = upright();
    g.add(mesh(geo('shopBag', () => new THREE.BoxGeometry(0.2, 0.22, 0.08)), mats.matte('#ff5c9a', 0.7), 0, -0.15, 0.04));
    g.add(mesh(geo('shopBagBand', () => new THREE.BoxGeometry(0.202, 0.04, 0.082)), mats.matte('#ffffff', 0.7), 0, -0.12, 0.04));
    const handle = mesh(geo('shopHandle', () => new THREE.TorusGeometry(0.045, 0.006, 6, 16, Math.PI)), mats.matte('#ffffff'), 0, -0.04, 0.04);
    g.add(handle);
    return g;
  },
  // A cardboard box with a lens drawn on it: Golu's pretend vlog camera (no real gadgets).
  boxcam() {
    const g = upright();
    const card = mats.matte('#c8955c', 0.95);
    g.add(mesh(geo('boxcamBody', () => new THREE.BoxGeometry(0.16, 0.11, 0.1)), card, 0, 0.06, 0.06));
    g.add(mesh(geo('boxcamLens', () => new THREE.CylinderGeometry(0.035, 0.035, 0.03, 20).rotateX(Math.PI / 2)), mats.matte('#a8743f', 0.95), 0.02, 0.06, 0.125));
    g.add(mesh(geo('boxcamGlass', () => new THREE.CircleGeometry(0.026, 20)), mats.glossy('#2b2b3a', 0.1), 0.02, 0.06, 0.141, { cast: false }));
    g.add(mesh(sphere(0.012, 8, 6), mats.glossy('#e53935', 0.3), -0.055, 0.1, 0.112, { cast: false }));
    g.add(mesh(geo('boxcamTape', () => new THREE.BoxGeometry(0.17, 0.02, 0.102)), mats.matte('#d9d2b8', 0.8), 0, 0.09, 0.06));
    return g;
  },
  // ---------- wedding ----------
  varmala() {
    // a long loop of marigolds and roses, held at the top so it hangs down
    const g = upright();
    const flowersOn = (n, colors, r) => {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const x = Math.sin(a) * 0.13, y = -0.24 + Math.cos(a) * 0.24;
        g.add(mesh(sphere(r, 10, 8), mats.fur(colors[i % colors.length]), x, y, 0.06 + Math.cos(a * 2) * 0.01, { cast: i % 2 === 0 }));
      }
    };
    flowersOn(46, ['#ff9408', '#ff9408', '#e53935', '#fffdf2'], 0.024);
    g.add(mesh(sphere(0.04, 14, 10), mats.fur('#e53935'), 0, -0.49, 0.06));
    return g;
  },
  pujathali() {
    const g = upright();
    g.add(mesh(geo('thaliPlate', () => new THREE.CylinderGeometry(0.14, 0.13, 0.015, 32)), mats.metal('#d9b44a', 0.25), 0, 0.0, 0.08));
    g.add(mesh(lathe('thaliDiya', [[0.001, 0], [0.03, 0.004], [0.04, 0.02], [0.034, 0.024], [0.02, 0.012], [0.001, 0.012]]), mats.matte('#b5562a', 0.7), 0.05, 0.008, 0.06));
    put(g, mesh(sphere(0.012, 8, 6), mats.glow('#ffb347', 3), 0.05, 0.045, 0.06, { cast: false })).scale.set(1, 1.8, 1);
    for (const [x, z, c] of [[-0.06, 0.04, '#d50000'], [-0.04, 0.12, '#ffc107'], [0.03, 0.14, '#fffdf2']]) g.add(mesh(sphere(0.022, 12, 8), mats.matte(c), x, 0.015, z));
    for (let i = 0; i < 6; i++) { const a = i * 1.05; g.add(mesh(sphere(0.016, 8, 6), mats.fur('#ff9408'), Math.cos(a) * 0.1, 0.02, 0.08 + Math.sin(a) * 0.1)); }
    return g;
  },
  diya() {
    const g = upright();
    g.add(mesh(lathe('diya', [[0.001, 0], [0.035, 0.004], [0.05, 0.025], [0.044, 0.03], [0.026, 0.014], [0.001, 0.014]]), mats.matte('#b5562a', 0.7), 0, 0.0, 0.05));
    const flame = put(g, mesh(sphere(0.014, 10, 8), mats.glow('#ffb347', 3.5), 0.03, 0.04, 0.05, { cast: false }));
    flame.scale.set(1, 2, 1);
    return g;
  },
  kalash() {
    const g = upright();
    g.add(mesh(lathe('kalash', [[0.001, 0], [0.05, 0], [0.09, 0.05], [0.095, 0.09], [0.06, 0.14], [0.045, 0.15], [0.055, 0.17], [0.001, 0.17]]), mats.metal('#d9a93a', 0.2), 0, 0, 0.06));
    for (let i = 0; i < 5; i++) {
      const leaf = mesh(geo('mangoLeaf', () => new THREE.SphereGeometry(0.03, 10, 6).scale(0.6, 0.25, 2)), mats.fur('#2e7d32'), 0, 0.17, 0.06);
      leaf.rotation.set(0.5, (i / 5) * Math.PI * 2, 0);
      leaf.translateZ(0.05);
      g.add(leaf);
    }
    g.add(mesh(sphere(0.05, 16, 12), mats.fur('#8d5a2b'), 0, 0.21, 0.06));
    g.add(mesh(geo('kalashThread', () => new THREE.TorusGeometry(0.082, 0.006, 6, 30).rotateX(Math.PI / 2)), mats.matte('#d50000'), 0, 0.09, 0.06));
    return g;
  },
  coconut() {
    const g = upright();
    const c = mesh(sphere(0.06, 16, 12), mats.fur('#8d5a2b'), 0, 0.03, 0.06);
    c.scale.set(1, 1.15, 1);
    g.add(c);
    g.add(mesh(sphere(0.02, 8, 6), mats.matte('#d50000'), 0, 0.1, 0.06));
    return g;
  },
  dhol() {
    // barrel drum carried across the body
    const g = new THREE.Group();
    const drum = new THREE.Group();
    drum.position.set(0.12, 0.0, 0.08);
    drum.rotation.z = Math.PI / 2;
    drum.add(mesh(lathe('dholBody', [[0.001, -0.17], [0.11, -0.17], [0.13, 0], [0.11, 0.17], [0.001, 0.17]]), mats.glossy('#c62828', 0.35)));
    for (const s of [-1, 1]) drum.add(mesh(geo('dholSkin', () => new THREE.CylinderGeometry(0.112, 0.112, 0.01, 28)), mats.matte('#f3e3c7', 0.8), 0, s * 0.172, 0));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      drum.add(rod([Math.cos(a) * 0.11, -0.17, Math.sin(a) * 0.11], [Math.cos(a + 0.4) * 0.11, 0.17, Math.sin(a + 0.4) * 0.11], 0.004, mats.matte('#ffd23f')));
    }
    g.add(drum);
    g.add(mesh(geo('dholStick', () => new THREE.CylinderGeometry(0.006, 0.006, 0.2, 6)), mats.matte('#8b5a2b'), 0, 0.06, 0.03));
    return g;
  },
  shagun() {
    const g = upright();
    g.add(mesh(new THREE.BoxGeometry(0.16, 0.09, 0.008), mats.glossy('#d50000', 0.4), 0, 0.05, 0.05));
    g.add(mesh(new THREE.BoxGeometry(0.03, 0.03, 0.01), mats.metal('#ffcc33', 0.25), 0, 0.05, 0.056));
    return g;
  },
  purse() {
    const g = upright();
    g.add(mesh(geo('purseBody', () => new THREE.CapsuleGeometry(0.06, 0.1, 6, 16).rotateZ(Math.PI / 2).scale(1, 1, 0.45)), mats.glossy('#d81b60', 0.35), 0, -0.1, 0.04));
    g.add(mesh(geo('purseClasp', () => new THREE.BoxGeometry(0.03, 0.02, 0.012)), mats.metal('#ffd23f', 0.25), 0, -0.05, 0.068));
    g.add(mesh(geo('purseHandle', () => new THREE.TorusGeometry(0.05, 0.007, 6, 16, Math.PI)), mats.glossy('#ad1457', 0.4), 0, -0.05, 0.04));
    return g;
  },
  magnifier() {
    const g = upright();
    g.add(mesh(geo('magHandle', () => new THREE.CylinderGeometry(0.011, 0.013, 0.1, 10)), mats.glossy('#4a2c17', 0.3), 0, 0.0, 0.03));
    g.add(mesh(geo('magRing', () => new THREE.TorusGeometry(0.048, 0.009, 8, 28)), mats.metal('#d9b44a', 0.25), 0, 0.1, 0.03));
    g.add(mesh(geo('magGlass', () => new THREE.CircleGeometry(0.046, 28)), new THREE.MeshPhysicalMaterial({ color: '#cfefff', roughness: 0.02, transmission: 0.6, transparent: true, opacity: 0.35 }), 0, 0.1, 0.03, { cast: false }));
    return g;
  },
  mic() {
    const g = new THREE.Group();
    g.add(mesh(geo('micHandle', () => new THREE.CylinderGeometry(0.016, 0.011, 0.13, 12)), mats.glossy('#222', 0.3), 0, 0.0, 0.025));
    g.add(mesh(sphere(0.032, 16, 12), mats.metal('#b9c0c8', 0.45), 0, 0.085, 0.025));
    return g;
  },
};

function upright() {
  const g = new THREE.Group();
  g.userData.upright = true;
  return g;
}
const put = (g, m) => { g.add(m); return m; };

// Materials shared by every copy of a prop (never disposed with a character).
const shared = new Map();
function sharedMat(key, make) {
  if (!shared.has(key)) { const m = make(); m.userData.shared = true; shared.set(key, m); }
  return shared.get(key);
}
const doubleSide = (color, rough = 0.5, metal = false) => sharedMat(`ds${color}${rough}${metal}`,
  () => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal ? 0.85 : 0, side: THREE.DoubleSide }));

const pageMat = () => sharedMat('bookPage', () => new THREE.MeshStandardMaterial({ roughness: 0.9, map: canvasTexture(128, 180, (c, w, h) => {
  c.fillStyle = '#fffaf0'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#9aa3b5';
  for (let y = 22; y < h - 15; y += 12) c.fillRect(14, y, w - 28 - ((y * 7) % 30), 4);
}) }));
const flagMat = () => sharedMat('indiaFlag', () => new THREE.MeshStandardMaterial({ map: indiaFlag(), side: THREE.DoubleSide, roughness: 0.8 }));

let flagTex = null;
export function indiaFlag() {
  flagTex ??= canvasTexture(240, 160, (c, w, h) => {
    [['#ff9933', 0], ['#ffffff', 1], ['#138808', 2]].forEach(([col, i]) => { c.fillStyle = col; c.fillRect(0, (i * h) / 3, w, h / 3 + 1); });
    c.strokeStyle = '#000080'; c.lineWidth = 3;
    c.beginPath(); c.arc(w / 2, h / 2, h / 7, 0, 7); c.stroke();
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      c.beginPath(); c.moveTo(w / 2, h / 2); c.lineTo(w / 2 + Math.cos(a) * h / 7, h / 2 + Math.sin(a) * h / 7); c.lineWidth = 1; c.stroke();
    }
  });
  flagTex.wrapS = flagTex.wrapT = THREE.ClampToEdgeWrapping;
  return flagTex;
}

/** Open cone with alternating coloured panels (umbrellas, canopies). */
export function stripedCone(r, h, colors, panels = 16) {
  const g = new THREE.ConeGeometry(r, h, panels, 1, true).toNonIndexed();
  const p = g.attributes.position, cc = [];
  for (let i = 0; i < p.count; i += 3) {
    const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
    const k = Math.floor(((Math.atan2(cz, cx) + Math.PI) / (Math.PI * 2)) * panels) % colors.length;
    const c = new THREE.Color(colors[k]);
    for (let j = 0; j < 3; j++) cc.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cc, 3));
  g.computeVertexNormals();
  return g;
}

Object.assign(builders, storyBuilders);

export function buildProp(kind) {
  return builders[kind] ? builders[kind]() : null;
}

// Place a prop so it rests on the ground (y = 0).
export function groundProp(kind) {
  const g = buildProp(kind);
  if (!g) return null;
  const holder = new THREE.Group();
  holder.add(g);
  const box = new THREE.Box3().setFromObject(g);
  g.position.y = -box.min.y + (g.userData.float ? 0.4 : 0);
  holder.scale.setScalar(1.6); // props on the floor read better slightly larger
  return holder;
}

// ---------- gear: furniture and moving bits that come with an action ----------
// Sizes are in the character's own units (a child is 1.15 tall); the character scales them.
export const BED = { top: 0.22, rest: 0.39, feet: 0.52 };

function rod(from, to, r, mat) {
  const a = new THREE.Vector3(...from), d = new THREE.Vector3(...to).sub(a);
  const m = mesh(new THREE.CylinderGeometry(r, r, d.length(), 10), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
}

function kidChair(color) {
  const g = new THREE.Group();
  const seat = mats.glossy(color, 0.35), leg = mats.metal('#9aa3ad', 0.35);
  g.add(mesh(new THREE.BoxGeometry(0.42, 0.04, 0.36), seat, 0, 0.2, -0.04));
  for (const x of [-0.18, 0.18]) for (const z of [-0.19, 0.11]) g.add(rod([x, 0, z], [x, 0.2, z], 0.016, leg));
  for (const x of [-0.18, 0.18]) g.add(rod([x, 0.2, -0.21], [x, 0.62, -0.23], 0.016, leg));
  g.add(mesh(new THREE.BoxGeometry(0.42, 0.18, 0.03), seat, 0, 0.52, -0.225));
  return g;
}

const paintingMat = () => sharedMat('painting', () => new THREE.MeshStandardMaterial({ roughness: 0.8, map: canvasTexture(256, 200, (c, w, h) => {
  const sky = c.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#7ec8ff'); sky.addColorStop(1, '#d9f1ff');
  c.fillStyle = sky; c.fillRect(0, 0, w, h);
  c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(200, 45, 26, 0, 7); c.fill();
  c.fillStyle = '#6cc04a'; c.beginPath(); c.ellipse(80, 200, 170, 70, 0, 0, 7); c.fill();
  c.fillStyle = '#ff7043'; c.fillRect(60, 105, 60, 45);
  c.fillStyle = '#c62828'; c.beginPath(); c.moveTo(52, 108); c.lineTo(90, 75); c.lineTo(128, 108); c.fill();
  c.fillStyle = '#6d4c41'; c.fillRect(82, 125, 16, 25);
  for (const [x, col] of [[160, '#ff5c9a'], [185, '#b28dff'], [215, '#ffffff']]) { c.fillStyle = col; c.beginPath(); c.arc(x, 165, 8, 0, 7); c.fill(); }
}) }));

const gridMat = () => sharedMat('cartGrid', () => new THREE.MeshStandardMaterial({
  color: '#c9d1da', metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide, alphaTest: 0.5,
  map: canvasTexture(64, 64, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#ffffff'; for (let i = 0; i < 4; i++) { c.fillRect(i * 16, 0, 4, h); c.fillRect(0, i * 16, w, 4); } }, { repeat: 3 }),
}));

const GEAR_BUILDERS = {
  chair: () => kidChair('#3fa7ff'),

  desk() {
    const g = kidChair('#ff6b5c');
    const wood = mats.matte('#d9a066', 0.6);
    g.add(mesh(new THREE.BoxGeometry(0.85, 0.04, 0.42), wood, 0, 0.44, 0.43));
    for (const x of [-0.38, 0.38]) for (const z of [0.26, 0.6]) g.add(rod([x, 0, z], [x, 0.43, z], 0.02, mats.metal('#8a939c', 0.4)));
    g.add(mesh(new THREE.BoxGeometry(0.2, 0.008, 0.26), mats.matte('#fffaf0', 0.8), 0.15, 0.464, 0.42));
    for (let i = 0; i < 6; i++) g.add(mesh(new THREE.BoxGeometry(0.17, 0.002, 0.004), mats.matte('#8fb4e8'), 0.15, 0.469, 0.33 + i * 0.035, { cast: false }));
    for (const s of [-1, 1]) {
      const page = mesh(new THREE.BoxGeometry(0.13, 0.008, 0.18), mats.matte('#fffdf5', 0.8), -0.18 + s * 0.066, 0.468, 0.43);
      page.rotation.z = -s * 0.08;
      g.add(page);
    }
    g.add(mesh(new THREE.BoxGeometry(0.28, 0.01, 0.19), mats.cloth('#43a047'), -0.18, 0.461, 0.43));
    return g;
  },

  bed() {
    const g = new THREE.Group();
    const wood = mats.matte('#c98f5a', 0.6);
    g.add(mesh(new THREE.BoxGeometry(0.82, 0.12, 1.45), wood, 0, 0.06, -0.08));
    g.add(mesh(new THREE.BoxGeometry(0.76, 0.1, 1.4), mats.cloth('#ffffff'), 0, 0.17, -0.08));
    g.add(mesh(new THREE.BoxGeometry(0.82, 0.55, 0.06), wood, 0, 0.3, -0.81));
    g.add(mesh(sphere(0.1, 16, 12), mats.glossy('#ffd23f', 0.4), 0, 0.6, -0.81));
    const pillow = mesh(sphere(0.2, 24, 16), mats.cloth('#fff4d6'), 0, 0.26, -0.55);
    pillow.scale.set(1.25, 0.32, 0.7);
    g.add(pillow);
    g.add(mesh(new THREE.BoxGeometry(0.8, 0.28, 0.55), mats.cloth('#7c9cff'), 0, 0.36, 0.35));
    for (let i = 0; i < 3; i++) g.add(mesh(new THREE.BoxGeometry(0.805, 0.03, 0.04), mats.cloth('#ffffff'), 0, 0.36 + (i - 1) * 0.08, 0.623, { cast: false }));
    // floating "Z z z"
    const zTex = sharedMat('zzz', () => new THREE.SpriteMaterial({ map: canvasTexture(64, 64, (c, w, h) => {
      c.font = '700 54px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.lineWidth = 8; c.strokeStyle = '#3b1d5e'; c.strokeText('Z', w / 2, h / 2); c.fillStyle = '#ffffff'; c.fillText('Z', w / 2, h / 2);
    }) })).map;
    g.userData.zs = [0, 1, 2].map(() => put(g, new THREE.Sprite(new THREE.SpriteMaterial({ map: zTex, transparent: true, alphaTest: 0.05, depthWrite: false }))));
    return g;
  },

  easel() {
    const wrap = new THREE.Group(), g = new THREE.Group();
    g.position.set(0.5, 0, 0.32);
    g.rotation.y = -0.8;
    const wood = mats.matte('#a0683a', 0.7);
    for (const x of [-0.2, 0.2]) g.add(rod([x, 0, 0.1], [0, 1.05, -0.02], 0.016, wood));
    g.add(rod([0, 0, -0.3], [0, 1.0, -0.04], 0.016, wood));
    g.add(mesh(new THREE.BoxGeometry(0.56, 0.03, 0.07), wood, 0, 0.5, 0.06));
    const board = new THREE.Group();
    board.position.set(0, 0.73, 0.05);
    board.rotation.x = -0.1;
    board.add(mesh(new THREE.BoxGeometry(0.54, 0.42, 0.02), mats.matte('#ffffff', 0.8)));
    board.add(mesh(new THREE.PlaneGeometry(0.5, 0.38), paintingMat(), 0, 0, 0.011, { cast: false }));
    g.add(board);
    wrap.add(g);
    return wrap;
  },

  bike() {
    const g = new THREE.Group();
    const frame = mats.glossy('#e53935', 0.3), black = mats.matte('#222222', 0.6), steel = mats.metal('#c8ced6', 0.3);
    const wheel = (z, r) => {
      const w = new THREE.Group();
      w.position.set(0, r, z);
      const tyre = mesh(geo(`tyre${r}`, () => new THREE.TorusGeometry(r, r * 0.13, 10, 36)), black);
      tyre.rotation.y = Math.PI / 2;
      w.add(tyre);
      for (let i = 0; i < 6; i++) {
        const sp = mesh(geo(`spoke${r}`, () => new THREE.CylinderGeometry(0.004, 0.004, r * 1.9, 4)), steel, 0, 0, 0, { cast: false });
        sp.rotation.x = (i / 6) * Math.PI;
        w.add(sp);
      }
      w.add(mesh(geo('hub', () => new THREE.CylinderGeometry(0.025, 0.025, 0.05, 12).rotateZ(Math.PI / 2)), steel));
      g.add(w);
      return w;
    };
    g.userData.wheels = [wheel(-0.36, 0.2), wheel(0.36, 0.2)];
    for (const s of [-1, 1]) {
      const tw = wheel(-0.36, 0.08);
      tw.position.x = s * 0.2;
      g.userData.wheels.push(tw);
      g.add(rod([s * 0.2, 0.08, -0.36], [0, 0.2, -0.33], 0.008, steel));
    }
    const P = { rear: [0, 0.2, -0.36], crank: [0, 0.2, 0], seat: [0, 0.48, -0.08], head: [0, 0.56, 0.27], headLow: [0, 0.44, 0.3], front: [0, 0.2, 0.36] };
    for (const [a, b] of [['crank', 'seat'], ['seat', 'head'], ['crank', 'headLow'], ['rear', 'crank'], ['rear', 'seat'], ['headLow', 'front'], ['head', 'headLow']]) g.add(rod(P[a], P[b], 0.018, frame));
    g.add(rod([0, 0.56, 0.27], [0, 0.68, 0.29], 0.014, steel));
    g.add(rod([-0.18, 0.68, 0.29], [0.18, 0.68, 0.29], 0.012, steel));
    for (const s of [-1, 1]) put(g, mesh(capsule(0.018, 0.05), mats.glossy('#ffd23f', 0.4), s * 0.19, 0.68, 0.29)).rotation.z = Math.PI / 2;
    g.add(mesh(geo('saddle', () => new THREE.CapsuleGeometry(0.045, 0.12, 6, 12).rotateX(Math.PI / 2).scale(1, 0.4, 1)), black, 0, 0.51, -0.08));
    g.add(mesh(sphere(0.03, 12, 10), mats.glow('#fff4c2', 1.5), 0, 0.6, 0.31, { cast: false }));
    const crank = new THREE.Group();
    crank.position.set(0, 0.2, 0);
    for (const s of [-1, 1]) {
      crank.add(rod([s * 0.05, 0, 0], [s * 0.05, s * 0.09, 0], 0.01, steel));
      crank.add(mesh(new THREE.BoxGeometry(0.07, 0.015, 0.035), black, s * 0.08, s * 0.09, 0));
    }
    g.add(crank);
    g.userData.crank = crank;
    return g;
  },

  rope() {
    const g = new THREE.Group();
    const rope = mesh(new THREE.BufferGeometry(), mats.glossy('#ff5c9a', 0.4));
    g.add(rope);
    const handles = [-1, 1].map((s) => put(g, mesh(capsule(0.018, 0.06), mats.glossy('#ffd23f', 0.4), s * 0.28, 0.3, 0.1)));
    g.userData.update = (phi, lift) => {
      const pts = [], R = 0.33 + 0.62 * (1 + Math.cos(phi)) / 2, cy = 0.3 + lift;
      for (let i = 0; i <= 20; i++) {
        const u = i / 20, b = Math.sin(Math.PI * u) * R;
        pts.push(new THREE.Vector3(-0.28 + 0.56 * u, cy + Math.cos(phi) * b, 0.1 + Math.sin(phi) * b));
      }
      rope.geometry.dispose();
      rope.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.009, 6, false);
      for (const h of handles) h.position.y = cy;
    };
    return g;
  },

  cart() {
    const g = new THREE.Group();
    const steel = mats.metal('#b8c1cb', 0.3), grid = gridMat();
    const W = 0.46, D = 0.5, H = 0.3, z0 = 0.42, y0 = 0.34;
    const panel = (w, h, x, y, z, ry = 0, rx = 0) => { const m = mesh(new THREE.PlaneGeometry(w, h), grid, x, y, z, { cast: false }); m.rotation.set(rx, ry, 0); g.add(m); };
    panel(W, D, 0, y0, z0 + D / 2, 0, -Math.PI / 2);
    panel(W, H, 0, y0 + H / 2, z0, 0);
    panel(W, H, 0, y0 + H / 2, z0 + D, 0);
    for (const s of [-1, 1]) panel(D, H, s * W / 2, y0 + H / 2, z0 + D / 2, Math.PI / 2);
    for (const [a, b] of [[[-W / 2, y0 + H, z0], [W / 2, y0 + H, z0]], [[-W / 2, y0 + H, z0 + D], [W / 2, y0 + H, z0 + D]],
      [[-W / 2, y0 + H, z0], [-W / 2, y0 + H, z0 + D]], [[W / 2, y0 + H, z0], [W / 2, y0 + H, z0 + D]]]) g.add(rod(a, b, 0.01, steel));
    for (const s of [-1, 1]) {
      g.add(rod([s * 0.2, 0.62, 0.32], [s * 0.2, y0 + H, z0], 0.012, steel));
      g.add(rod([s * 0.2, 0.06, 0.4], [s * 0.2, y0, z0 + 0.02], 0.012, steel));
      g.add(rod([s * 0.2, 0.06, 0.95], [s * 0.2, y0, z0 + D - 0.02], 0.012, steel));
      g.add(rod([s * 0.2, 0.06, 0.4], [s * 0.2, 0.06, 0.95], 0.012, steel));
      for (const z of [0.4, 0.95]) g.add(mesh(geo('caster', () => new THREE.CylinderGeometry(0.04, 0.04, 0.03, 14).rotateZ(Math.PI / 2)), mats.matte('#333333'), s * 0.2, 0.04, z));
    }
    g.add(rod([-0.24, 0.62, 0.32], [0.24, 0.62, 0.32], 0.018, mats.glossy('#e53935', 0.35)));
    // the shopping inside
    for (const [c, r, x, z] of [['#ff5c5c', 0.06, -0.1, 0.55], ['#ffd23f', 0.05, 0.06, 0.6], ['#43a047', 0.055, -0.02, 0.75], ['#ff9f1c', 0.05, 0.12, 0.8]]) {
      g.add(mesh(sphere(r, 16, 12), mats.glossy(c, 0.35), x, y0 + r + 0.01, z));
    }
    g.add(mesh(new THREE.BoxGeometry(0.14, 0.2, 0.08), mats.matte('#7c4dff', 0.6), 0.1, y0 + 0.1, 0.55));
    g.add(mesh(new THREE.BoxGeometry(0.12, 0.14, 0.12), mats.matte('#3fa7ff', 0.6), -0.12, y0 + 0.07, 0.82));
    return g;
  },

  kickball() {
    const g = new THREE.Group();
    const ball = builders.ball();
    ball.children[0].position.set(0, 0, 0);
    ball.scale.setScalar(0.75);
    g.add(ball);
    g.userData.ball = ball;
    return g;
  },

  stove() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(0.85, 0.44, 0.42), mats.matte('#f3e3c7', 0.6), 0, 0.22, 0.56));
    g.add(mesh(new THREE.BoxGeometry(0.9, 0.035, 0.46), mats.glossy('#5d6d7e', 0.3), 0, 0.455, 0.56));
    for (const x of [-0.2, 0.2]) g.add(mesh(new THREE.BoxGeometry(0.3, 0.3, 0.005), mats.matte('#e6cfa8', 0.6), x, 0.22, 0.348, { cast: false }));
    g.add(mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 24), mats.matte('#222'), 0.02, 0.48, 0.56));
    g.add(mesh(lathe('pot', [[0.001, 0.0], [0.12, 0.0], [0.13, 0.02], [0.13, 0.15], [0.12, 0.15], [0.12, 0.02], [0.001, 0.02]]), doubleSide('#c8ced6', 0.2, true), 0.02, 0.49, 0.56));
    g.add(mesh(new THREE.CircleGeometry(0.118, 24).rotateX(-Math.PI / 2), mats.glossy('#e8892b', 0.4), 0.02, 0.6, 0.56, { cast: false }));
    for (const s of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(0.06, 0.02, 0.03), mats.matte('#222'), 0.02 + s * 0.16, 0.62, 0.56));
    g.userData.steam = [0, 1, 2].map(() => put(g, mesh(sphere(0.05, 12, 10),
      new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.5, depthWrite: false }), 0, 0.7, 0.56, { cast: false, receive: false })));
    return g;
  },

  sink() {
    const g = new THREE.Group();
    const white = mats.glossy('#f7fbff', 0.15), steel = mats.metal('#d0d6dc', 0.2);
    g.add(mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.38, 20), white, 0, 0.19, 0.48));
    g.add(mesh(lathe('basin', [[0.001, 0.36], [0.12, 0.36], [0.2, 0.41], [0.23, 0.46], [0.21, 0.46], [0.18, 0.42], [0.11, 0.39], [0.001, 0.39]]), white, 0, 0, 0.48));
    g.add(mesh(geo('tap', () => tube([[0, 0.46, 0.7], [0, 0.6, 0.69], [0, 0.63, 0.61], [0, 0.6, 0.54]], 0.016, 16)), steel));
    g.add(mesh(new THREE.CylinderGeometry(0.01, 0.014, 0.18, 8), new THREE.MeshPhysicalMaterial({ color: '#9fdcff', transparent: true, opacity: 0.6, roughness: 0.05 }), 0, 0.5, 0.54, { cast: false }));
    g.add(mesh(new THREE.BoxGeometry(0.07, 0.03, 0.045), mats.glossy('#ff9ec4', 0.3), 0.16, 0.47, 0.6));
    return g;
  },

  notes() {
    const g = new THREE.Group();
    g.userData.notes = ['#7c4dff', '#ff4081', '#00b0ff'].map((c) => {
      const n = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, transparent: true });
      const head = mesh(sphere(0.035, 14, 10), mat, 0, 0, 0, { cast: false });
      head.scale.set(1.25, 0.9, 0.6);
      n.add(head, mesh(new THREE.BoxGeometry(0.01, 0.12, 0.01), mat, 0.036, 0.06, 0, { cast: false }), mesh(new THREE.BoxGeometry(0.045, 0.012, 0.01), mat, 0.055, 0.115, 0, { cast: false }));
      n.userData.mat = mat;
      g.add(n);
      return n;
    });
    return g;
  },

  tears() {
    const g = new THREE.Group();
    const mat = sharedMat('tear', () => new THREE.MeshPhysicalMaterial({ color: '#8fd8ff', roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.85 }));
    g.userData.drops = Array.from({ length: 6 }, () => put(g, mesh(sphere(0.016, 10, 8), mat, 0, 0, 0, { cast: false, receive: false })));
    return g;
  },
};

export function buildGear(kind) {
  return GEAR_BUILDERS[kind] ? GEAR_BUILDERS[kind]() : null;
}
