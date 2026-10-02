// Props the stories talk about: rotis and a rolling pin, the TV remote, a test paper with a
// red "3/10", a torch for the power cut, a sandcastle, the lemonade stand, a ludo board…
// Same conventions as props.js: in-hand props have their origin at the grip point and are in the
// character's units (a child is 1.15 tall); big set pieces are meant to stand on the ground.
import * as THREE from 'three';
import { mats, mesh, sphere, capsule, geo, lathe, blob, canvasTexture } from './util.js';

export const STORY_PROPS = {
  roti: 'Food: Roti / paratha',
  rotiplate: 'Food: Plate of rotis',
  laddooplate: 'Food: Plate of laddoos',
  samosa: 'Food: Samosa',
  sandwich: 'Food: Sandwich',
  chips: 'Food: Chips packet',
  milkpacket: 'Food: Milk packet',
  jug: 'Food: Jug of lemonade',
  sugarjar: 'Kitchen: Sugar jar (blue lid)',
  saltjar: 'Kitchen: Salt jar (white lid)',
  vinegar: 'Kitchen: Vinegar bottle',
  icecube: 'Kitchen: Ice cube',
  flourbowl: 'Kitchen: Bowl of flour (atta)',
  rollingpin: 'Kitchen: Rolling pin (belan)',
  remote: 'Home: TV remote',
  torch: 'Home: Torch (flashlight)',
  keys: 'Home: Keys',
  sock: 'Home: Sock',
  pillow: 'Home: Pillow',
  basket: 'Home: Basket',
  coin: 'Home: Coin',
  garbagebag: 'Home: Garbage bag',
  paper: 'School: Sheet of paper',
  testpaper: 'School: Test paper (3/10)',
  drawing: 'School: Drawing of a rocket',
  chartpaper: 'School: Rolled chart paper',
  paperplane: 'School: Paper plane',
  rocketmodel: 'School: Model rocket',
  planetmodel: 'School: Model planet (Saturn)',
  whistle: 'School: Whistle',
  syringe: 'Doctor: Vaccine (injection)',
  plantpot: 'Garden: Pot with a seed',
  sprout: 'Garden: Pot with a sprout',
  shovel: 'Garden: Little shovel',
  wateringcan: 'Garden: Watering can',
  sandbucket: 'Beach: Sand bucket',
  petbowl: 'Pets: Pet food bowl',
  // set pieces that stand on the ground
  tv: 'Set: TV on a stand',
  ludo: 'Set: Ludo board',
  picnicmat: 'Set: Picnic mat',
  blanketfort: 'Set: Blanket fort',
  lemonadestand: 'Set: Lemonade stand',
  volcano: 'Set: Science volcano',
  volcanofoam: 'Set: Volcano erupting foam',
  sandcastle: 'Set: Sandcastle',
  sapling: 'Set: Young tree (sapling)',
  dustbin: 'Set: Dustbin',
  litter: 'Set: Litter (wrappers & bottles)',
  bucket: 'Set: Bucket of water',
  brokenpot: 'Set: Broken flower pot',
  balloonbunch: 'Set: Bunch of balloons',
  balloonbits: 'Set: Popped balloon',
};

// ---------- helpers ----------
const shared = new Map();
const sharedMat = (key, make) => {
  if (!shared.has(key)) { const m = make(); m.userData.shared = true; shared.set(key, m); }
  return shared.get(key);
};
const upright = () => { const g = new THREE.Group(); g.userData.upright = true; return g; };
const put = (g, m) => { g.add(m); return m; };
const steel = () => mats.metal('#d4dae0', 0.2);
const side2 = (color, rough = 0.7) => sharedMat(`s2${color}${rough}`, () => new THREE.MeshStandardMaterial({ color, roughness: rough, side: THREE.DoubleSide }));
const texMat = (key, w, h, draw, rough = 0.85) => sharedMat(key, () => new THREE.MeshStandardMaterial({ roughness: rough, side: THREE.DoubleSide, map: canvasTexture(w, h, draw) }));

const rotiMat = () => texMat('roti', 128, 128, (c, w, h) => {
  c.fillStyle = '#ecc27e'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 26; i++) { // the brown spots from the tawa
    const x = (i * 37) % w, y = (i * 59) % h, r = 4 + (i * 7) % 7;
    c.fillStyle = i % 3 ? 'rgba(150,90,30,0.55)' : 'rgba(110,60,20,0.6)';
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  }
});
const rotiDisc = (r = 0.07) => geo(`rotiDisc${r}`, () => new THREE.CylinderGeometry(r, r, 0.006, 28));
const plate = (r = 0.1) => geo(`plate${r}`, () => new THREE.CylinderGeometry(r, r * 0.85, 0.012, 32));

function sheet(key, draw) {
  const g = upright();
  const m = mesh(geo('sheet', () => new THREE.PlaneGeometry(0.15, 0.2)), texMat(key, 150, 200, draw), 0, 0.08, 0.06, { cast: false });
  m.rotation.x = -0.25;
  g.add(m);
  return g;
}
const ruled = (c, w, h) => {
  c.fillStyle = '#fffdf6'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#9fb3d1';
  for (let y = 40; y < h - 10; y += 14) c.fillRect(10, y, w - 20, 2);
  c.fillStyle = '#e57373'; c.fillRect(22, 0, 2, h);
};

// a pillow-shaped packet (chips, milk)
function packet(color, band, w = 0.1, h = 0.14) {
  const g = upright();
  const b = mesh(sphere(0.5, 20, 14), mats.glossy(color, 0.35), 0, 0.05, 0.05);
  b.scale.set(w, h, 0.035);
  g.add(b);
  const s = mesh(sphere(0.5, 20, 14), mats.glossy(band, 0.35), 0, 0.05, 0.051);
  s.scale.set(w * 1.01, h * 0.35, 0.037);
  g.add(s);
  return g;
}

// a kitchen jar with a coloured lid and a printed label
function jar(lid, label) {
  const g = upright();
  g.add(mesh(geo('jarGlass', () => new THREE.CylinderGeometry(0.045, 0.045, 0.1, 20)),
    sharedMat('jarGlass', () => new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.1, transmission: 0.4, transparent: true, opacity: 0.6 })), 0, -0.02, 0.06));
  g.add(mesh(geo('jarFill', () => new THREE.CylinderGeometry(0.041, 0.041, 0.075, 20)), mats.matte('#fafafa', 0.95), 0, -0.032, 0.06));
  g.add(mesh(geo('jarLid', () => new THREE.CylinderGeometry(0.048, 0.048, 0.022, 20)), mats.glossy(lid, 0.3), 0, 0.04, 0.06));
  g.add(mesh(geo('jarLabel', () => new THREE.CylinderGeometry(0.0455, 0.0455, 0.035, 20, 1, true)), texMat(`jarLabel${label}`, 128, 40, (c, w, h) => {
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = label === 'SALT' ? '#616161' : lid;
    c.font = '700 22px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, w / 2, h / 2);
  }), 0, -0.02, 0.06));
  return g;
}

function balloonOn(g, color, x, y, z, len) {
  g.add(mesh(new THREE.CylinderGeometry(0.003, 0.003, len, 4), mats.matte('#eeeeee'), x * 0.5, len / 2, z * 0.5, { cast: false }));
  const b = mesh(sphere(0.12), mats.glossy(color, 0.12), x, y, z);
  b.scale.set(1, 1.18, 1);
  g.add(b);
}

export const storyBuilders = {
  // ---------- food ----------
  roti() {
    const g = upright();
    g.add(mesh(rotiDisc(), rotiMat(), 0, 0.03, 0.08));
    return g;
  },
  rotiplate() {
    const g = upright();
    g.add(mesh(plate(), steel(), 0, 0, 0.09));
    for (let i = 0; i < 4; i++) {
      const r = mesh(rotiDisc(0.075), rotiMat(), (i % 2) * 0.006, 0.01 + i * 0.007, 0.09);
      r.rotation.y = i;
      g.add(r);
    }
    return g;
  },
  laddooplate() {
    const g = upright();
    g.add(mesh(plate(), steel(), 0, 0, 0.09));
    const pile = [[0, 0], [0.045, 0], [-0.045, 0], [0, 0.045], [0, -0.045], [0.03, 0.03], [-0.03, -0.03]];
    pile.forEach(([x, z]) => g.add(mesh(sphere(0.026, 14, 10), mats.fur('#ffa733'), x, 0.03, 0.09 + z)));
    g.add(mesh(sphere(0.026, 14, 10), mats.fur('#ffa733'), 0, 0.07, 0.09));
    return g;
  },
  samosa() {
    const g = upright();
    const s = mesh(geo('samosa', () => new THREE.TetrahedronGeometry(0.055)), mats.matte('#d99a3e', 0.7), 0, 0.04, 0.06);
    s.rotation.set(0.6, 0.4, 0.2);
    g.add(s);
    return g;
  },
  sandwich() {
    const g = upright();
    const bread = mats.matte('#f3d9a4', 0.8);
    g.add(mesh(geo('bread', () => new THREE.BoxGeometry(0.11, 0.018, 0.11)), bread, 0, 0.02, 0.07));
    g.add(mesh(geo('jam', () => new THREE.BoxGeometry(0.105, 0.012, 0.105)), mats.glossy('#c62828', 0.3), 0, 0.034, 0.07));
    g.add(mesh(geo('bread', () => new THREE.BoxGeometry(0.11, 0.018, 0.11)), bread, 0, 0.048, 0.07));
    return g;
  },
  chips() { return packet('#ff8f00', '#e53935'); },
  milkpacket() { return packet('#f5f9ff', '#1e88e5', 0.09, 0.15); },
  jug() {
    const g = upright();
    g.add(mesh(lathe('jug', [[0.001, 0], [0.05, 0], [0.055, 0.03], [0.05, 0.12], [0.056, 0.15], [0.05, 0.15], [0.044, 0.12], [0.046, 0.03], [0.001, 0.008]]),
      sharedMat('jugGlass', () => new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.05, transmission: 0.6, transparent: true, opacity: 0.55, side: THREE.DoubleSide })), 0, -0.06, 0.07));
    g.add(mesh(geo('lemonade', () => new THREE.CylinderGeometry(0.044, 0.046, 0.1, 24)), mats.glossy('#ffe066', 0.2), 0, -0.005, 0.07));
    const h = mesh(geo('jugHandle', () => new THREE.TorusGeometry(0.035, 0.007, 8, 16, Math.PI)), mats.glossy('#ffffff', 0.2), 0.055, 0.02, 0.07);
    h.rotation.z = -Math.PI / 2;
    g.add(h);
    return g;
  },
  // the two jars that look alike: sugar has the blue lid, salt the white one
  sugarjar() { return jar('#1e88e5', 'SUGAR'); },
  saltjar() { return jar('#f5f5f5', 'SALT'); },
  icecube() {
    const g = upright();
    g.add(mesh(geo('iceCube', () => new THREE.BoxGeometry(0.06, 0.06, 0.06)),
      sharedMat('ice', () => new THREE.MeshPhysicalMaterial({ color: '#e3f6ff', roughness: 0.05, transmission: 0.7, transparent: true, opacity: 0.75, thickness: 0.05 })), 0, 0.03, 0.06));
    return g;
  },
  vinegar() {
    const g = upright();
    g.add(mesh(lathe('vinegarBottle', [[0.001, 0], [0.034, 0], [0.036, 0.13], [0.016, 0.17], [0.014, 0.2], [0.001, 0.2]]),
      sharedMat('vinegarGlass', () => new THREE.MeshPhysicalMaterial({ color: '#fff6d8', roughness: 0.08, transmission: 0.5, transparent: true, opacity: 0.7 })), 0, -0.04, 0.05));
    g.add(mesh(geo('vinegarCap', () => new THREE.CylinderGeometry(0.016, 0.016, 0.025, 14)), mats.glossy('#e53935', 0.3), 0, 0.17, 0.05));
    g.add(mesh(geo('vinegarLabel', () => new THREE.CylinderGeometry(0.0365, 0.0365, 0.05, 20, 1, true)), texMat('vinegarLabel', 128, 48, (c, w, h) => {
      c.fillStyle = '#fff8e1'; c.fillRect(0, 0, w, h); c.fillStyle = '#c62828';
      c.font = '700 20px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('VINEGAR', w / 2, h / 2);
    }), 0, 0.03, 0.05));
    return g;
  },
  flourbowl() {
    const g = upright();
    g.add(mesh(lathe('flourBowl', [[0.001, 0], [0.06, 0.002], [0.09, 0.03], [0.1, 0.065], [0.092, 0.067], [0.082, 0.032], [0.05, 0.012], [0.001, 0.012]]), steel(), 0, 0, 0.08));
    const heap = mesh(sphere(0.085, 24, 12), mats.matte('#fbf6ea', 0.95), 0, 0.06, 0.08);
    heap.scale.set(1, 0.45, 1);
    g.add(heap);
    return g;
  },
  rollingpin() {
    const g = upright();
    const wood = mats.matte('#d6a764', 0.6);
    const pin = mesh(geo('belan', () => new THREE.CylinderGeometry(0.02, 0.02, 0.2, 16).rotateZ(Math.PI / 2)), wood, 0.06, 0.02, 0.06);
    g.add(pin);
    for (const s of [-1, 1]) g.add(mesh(geo('belanEnd', () => new THREE.CylinderGeometry(0.01, 0.012, 0.06, 10).rotateZ(Math.PI / 2)), wood, 0.06 + s * 0.13, 0.02, 0.06));
    return g;
  },

  // ---------- home ----------
  remote() {
    const g = upright();
    g.add(mesh(geo('remoteBody', () => new THREE.BoxGeometry(0.04, 0.14, 0.016)), mats.glossy('#2b2f36', 0.3), 0, 0.05, 0.04));
    g.add(mesh(sphere(0.008, 8, 6), mats.glossy('#e53935', 0.2), 0, 0.105, 0.05));
    for (let i = 0; i < 6; i++) g.add(mesh(sphere(0.005, 6, 4), mats.glossy('#cfd8dc', 0.3), (i % 2 ? 0.009 : -0.009), 0.075 - Math.floor(i / 2) * 0.018, 0.049, { cast: false }));
    return g;
  },
  torch() {
    const g = upright();
    const body = mesh(geo('torchBody', () => new THREE.CylinderGeometry(0.02, 0.02, 0.14, 16).rotateX(Math.PI / 2)), mats.glossy('#ffd23f', 0.3), 0, 0.02, 0.07);
    g.add(body);
    g.add(mesh(geo('torchHead', () => new THREE.CylinderGeometry(0.034, 0.022, 0.05, 16).rotateX(Math.PI / 2)), mats.glossy('#ffd23f', 0.3), 0, 0.02, 0.16));
    g.add(mesh(geo('torchLens', () => new THREE.CircleGeometry(0.03, 16)), mats.glow('#fff6c8', 4), 0, 0.02, 0.186, { cast: false }));
    return g;
  },
  keys() {
    const g = new THREE.Group();
    g.add(mesh(geo('keyRing', () => new THREE.TorusGeometry(0.022, 0.004, 6, 16)), mats.metal('#c9a227', 0.3), 0, 0.02, 0.03));
    for (const [x, r] of [[-0.01, 0.3], [0.012, -0.25]]) {
      const k = mesh(geo('key', () => new THREE.BoxGeometry(0.012, 0.06, 0.004)), mats.metal('#cfd6dd', 0.25), x, -0.025, 0.03);
      k.rotation.z = r;
      g.add(k);
    }
    return g;
  },
  sock() {
    const g = new THREE.Group();
    const knit = mats.cloth('#ff7a1a');
    g.add(mesh(capsule(0.025, 0.08), knit, 0, -0.04, 0.03));
    const foot = mesh(capsule(0.024, 0.05), mats.cloth('#ffffff'), 0.03, -0.1, 0.03);
    foot.rotation.z = Math.PI / 2;
    g.add(foot);
    return g;
  },
  pillow() {
    const g = upright();
    const p = mesh(sphere(0.5, 20, 14), mats.cloth('#7c4dff'), 0, 0.02, 0.1);
    p.scale.set(0.24, 0.16, 0.08);
    g.add(p);
    return g;
  },
  basket() {
    const g = upright();
    g.add(mesh(lathe('basket', [[0.001, 0], [0.08, 0], [0.1, 0.08], [0.095, 0.08], [0.075, 0.006], [0.001, 0.006]]), side2('#b0793c', 0.95), 0, -0.1, 0.08));
    const h = mesh(geo('basketHandle', () => new THREE.TorusGeometry(0.09, 0.007, 6, 20, Math.PI)), mats.matte('#8d5a2b'), 0, -0.02, 0.08);
    g.add(h);
    return g;
  },
  coin() {
    const g = upright();
    const c = mesh(geo('coin', () => new THREE.CylinderGeometry(0.02, 0.02, 0.004, 20)), mats.metal('#e0b84a', 0.25), 0, 0.03, 0.05);
    c.rotation.x = Math.PI / 2;
    g.add(c);
    return g;
  },
  garbagebag() {
    const g = upright();
    g.add(mesh(blob(0.11, 3, 0.15, 2), mats.glossy('#2b2f36', 0.4), 0, -0.14, 0.05));
    g.add(mesh(geo('bagTie', () => new THREE.ConeGeometry(0.02, 0.06, 8)), mats.glossy('#2b2f36', 0.4), 0, -0.02, 0.05));
    return g;
  },

  // ---------- school ----------
  paper() { return sheet('paper', ruled); },
  testpaper() {
    return sheet('testpaper', (c, w, h) => {
      ruled(c, w, h);
      c.fillStyle = '#333'; c.font = '700 16px sans-serif'; c.fillText('MATHS TEST', 30, 28);
      c.strokeStyle = '#d32f2f'; c.lineWidth = 3;
      c.beginPath(); c.arc(112, 30, 22, 0, Math.PI * 2); c.stroke();
      c.fillStyle = '#d32f2f'; c.font = '700 20px sans-serif'; c.fillText('3/10', 92, 37);
      for (const y of [70, 110, 150]) { c.beginPath(); c.moveTo(110, y - 8); c.lineTo(124, y + 6); c.moveTo(124, y - 8); c.lineTo(110, y + 6); c.stroke(); }
    });
  },
  drawing() {
    return sheet('drawing', (c, w, h) => {
      c.fillStyle = '#fffdf6'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#1e88e5'; c.fillRect(0, 0, w, h * 0.7);
      c.fillStyle = '#ffffff'; for (let i = 0; i < 12; i++) c.fillRect((i * 43) % w, (i * 29) % (h * 0.6), 3, 3);
      c.fillStyle = '#eeeeee'; c.fillRect(62, 60, 26, 70); // the rocket
      c.fillStyle = '#e53935'; c.beginPath(); c.moveTo(60, 60); c.lineTo(75, 30); c.lineTo(90, 60); c.fill();
      c.fillStyle = '#ff9800'; for (const x of [62, 72, 82]) { c.beginPath(); c.moveTo(x, 130); c.lineTo(x + 3, 155); c.lineTo(x + 6, 130); c.fill(); }
      c.fillStyle = '#43a047'; c.fillRect(0, h * 0.85, w, h * 0.15);
    });
  },
  chartpaper() {
    const g = new THREE.Group();
    g.add(mesh(geo('chartRoll', () => new THREE.CylinderGeometry(0.03, 0.03, 0.4, 16)), mats.matte('#ffe0ef', 0.9), 0, 0.1, 0.03));
    g.add(mesh(geo('chartBand', () => new THREE.CylinderGeometry(0.032, 0.032, 0.02, 16)), mats.matte('#e53935'), 0, 0.12, 0.03));
    return g;
  },
  paperplane() {
    const g = upright();
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.12); shape.lineTo(0.06, -0.04); shape.lineTo(0, -0.01); shape.lineTo(-0.06, -0.04); shape.closePath();
    const plane = mesh(geo('paperPlane', () => new THREE.ShapeGeometry(shape)), side2('#fdfdfd', 0.8), 0, 0.05, 0.08);
    plane.rotation.x = -Math.PI / 2 + 0.2;
    g.add(plane);
    const keel = mesh(geo('planeKeel', () => new THREE.PlaneGeometry(0.012, 0.13)), side2('#e8e8e8', 0.8), 0, 0.043, 0.08);
    keel.rotation.set(-Math.PI / 2 + 0.2, Math.PI / 2, 0);
    g.add(keel);
    return g;
  },
  rocketmodel() {
    const g = upright();
    g.add(mesh(geo('rmBody', () => new THREE.CylinderGeometry(0.035, 0.04, 0.18, 20)), mats.glossy('#f5f5f5', 0.3), 0, 0.09, 0.06));
    g.add(mesh(geo('rmNose', () => new THREE.ConeGeometry(0.035, 0.07, 20)), mats.glossy('#e53935', 0.3), 0, 0.215, 0.06));
    g.add(mesh(sphere(0.014, 12, 8), mats.glossy('#7ad3ff', 0.05), 0, 0.13, 0.095));
    for (let i = 0; i < 3; i++) {
      const fin = mesh(geo('rmFin', () => new THREE.BoxGeometry(0.004, 0.05, 0.035)), mats.glossy('#e53935', 0.3), 0, 0.02, 0.06);
      fin.rotation.y = (i / 3) * Math.PI * 2;
      fin.translateZ(0.045);
      g.add(fin);
    }
    return g;
  },
  planetmodel() {
    const g = upright();
    g.add(mesh(geo('pmStick', () => new THREE.CylinderGeometry(0.005, 0.005, 0.16, 6)), mats.matte('#8b5a2b'), 0, 0.06, 0.04));
    g.add(mesh(sphere(0.055, 24, 16), mats.glossy('#f0b35a', 0.4), 0, 0.17, 0.04));
    const ring = mesh(geo('pmRing', () => new THREE.RingGeometry(0.07, 0.1, 32)), side2('#e8d3a0', 0.6), 0, 0.17, 0.04);
    ring.rotation.x = -Math.PI / 2 + 0.4;
    g.add(ring);
    return g;
  },
  whistle() {
    const g = upright();
    g.add(mesh(geo('whistle', () => new THREE.CylinderGeometry(0.018, 0.018, 0.05, 14).rotateZ(Math.PI / 2)), mats.metal('#cfd6dd', 0.2), 0.02, 0.02, 0.04));
    g.add(mesh(geo('whistleCord', () => new THREE.TorusGeometry(0.03, 0.003, 6, 16)), mats.matte('#e53935'), -0.02, 0.0, 0.04));
    return g;
  },

  // ---------- doctor ----------
  syringe() {
    const g = upright();
    g.add(mesh(geo('syrBarrel', () => new THREE.CylinderGeometry(0.011, 0.011, 0.08, 12)), sharedMat('syrGlass', () => new THREE.MeshPhysicalMaterial({ color: '#dff4ff', roughness: 0.1, transparent: true, opacity: 0.7 })), 0, 0.06, 0.04));
    g.add(mesh(geo('syrMed', () => new THREE.CylinderGeometry(0.009, 0.009, 0.04, 12)), mats.glossy('#7ad3ff', 0.2), 0, 0.07, 0.04));
    g.add(mesh(geo('syrPlunger', () => new THREE.CylinderGeometry(0.003, 0.003, 0.05, 6)), mats.glossy('#ffffff', 0.3), 0, 0.01, 0.04));
    g.add(mesh(geo('syrNeedle', () => new THREE.CylinderGeometry(0.001, 0.001, 0.03, 4)), mats.metal('#dddddd', 0.2), 0, 0.115, 0.04, { cast: false }));
    return g;
  },

  // ---------- garden & outdoors ----------
  plantpot() {
    const g = upright();
    g.add(mesh(lathe('pot', [[0.001, 0], [0.045, 0], [0.06, 0.08], [0.066, 0.09], [0.06, 0.09], [0.001, 0.075]]), mats.matte('#c8643b', 0.8), 0, -0.02, 0.07));
    g.add(mesh(geo('potSoil', () => new THREE.CircleGeometry(0.056, 20).rotateX(-Math.PI / 2)), mats.matte('#5a3a22'), 0, 0.06, 0.07, { cast: false }));
    return g;
  },
  sprout() {
    const g = storyBuilders.plantpot();
    g.add(mesh(geo('sproutStem', () => new THREE.CylinderGeometry(0.003, 0.003, 0.05, 6)), mats.fur('#5fbf3f'), 0, 0.085, 0.07));
    for (const s of [-1, 1]) {
      const leaf = mesh(sphere(0.018, 10, 8), mats.glossy('#5fbf3f', 0.4), s * 0.016, 0.11, 0.07);
      leaf.scale.set(1, 0.4, 0.6);
      leaf.rotation.z = s * 0.4;
      g.add(leaf);
    }
    return g;
  },
  shovel() {
    const g = new THREE.Group();
    g.add(mesh(geo('shovelStick', () => new THREE.CylinderGeometry(0.009, 0.009, 0.3, 8)), mats.matte('#b07a45'), 0, -0.05, 0.03));
    g.add(mesh(geo('shovelBlade', () => new THREE.BoxGeometry(0.06, 0.08, 0.008)), mats.metal('#9aa4ad', 0.3), 0, -0.24, 0.03));
    return g;
  },
  sandbucket() {
    const g = upright();
    g.add(mesh(lathe('sandBucket', [[0.001, 0], [0.045, 0], [0.06, 0.09], [0.055, 0.09], [0.04, 0.006], [0.001, 0.006]]), side2('#ff5c9a', 0.4), 0, -0.12, 0.06));
    g.add(mesh(geo('sandFill', () => new THREE.CircleGeometry(0.052, 20).rotateX(-Math.PI / 2)), mats.matte('#f3dcaa'), 0, -0.04, 0.06, { cast: false }));
    g.add(mesh(geo('sandHandle', () => new THREE.TorusGeometry(0.058, 0.004, 6, 20, Math.PI)), mats.glossy('#ffd23f', 0.3), 0, -0.03, 0.06));
    return g;
  },
  wateringcan() {
    const g = upright();
    const tin = mats.glossy('#43a047', 0.3);
    g.add(mesh(geo('canBody', () => new THREE.CylinderGeometry(0.055, 0.06, 0.11, 20)), tin, 0, -0.06, 0.07));
    const spout = mesh(geo('canSpout', () => new THREE.CylinderGeometry(0.007, 0.012, 0.14, 8)), tin, 0.085, -0.03, 0.07);
    spout.rotation.z = -0.9;
    g.add(spout);
    g.add(mesh(geo('canRose', () => new THREE.CylinderGeometry(0.018, 0.01, 0.02, 10)), tin, 0.14, 0.012, 0.07));
    g.add(mesh(geo('canHandle', () => new THREE.TorusGeometry(0.04, 0.007, 8, 16, Math.PI)), tin, 0, 0, 0.07));
    return g;
  },
  petbowl() {
    const g = upright();
    g.add(mesh(lathe('petBowl', [[0.001, 0], [0.07, 0], [0.085, 0.04], [0.075, 0.04], [0.06, 0.01], [0.001, 0.01]]), mats.glossy('#e53935', 0.3), 0, 0, 0.07));
    for (let i = 0; i < 9; i++) g.add(mesh(sphere(0.012, 8, 6), mats.matte('#8d5a2b'), ((i * 37) % 9 - 4) * 0.011, 0.03, 0.07 + ((i * 53) % 7 - 3) * 0.011, { cast: false }));
    return g;
  },

  // ---------- set pieces (stand on the ground) ----------
  tv() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(0.7, 0.25, 0.28), mats.matte('#8d5a2b', 0.6), 0, 0.125, 0));
    g.add(mesh(new THREE.BoxGeometry(0.62, 0.38, 0.04), mats.glossy('#1d1f24', 0.2), 0, 0.47, 0));
    const screen = mesh(new THREE.PlaneGeometry(0.58, 0.34), sharedMat('tvScreen', () => new THREE.MeshBasicMaterial({ map: canvasTexture(256, 150, (c, w, h) => {
      const sky = c.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#6ec6ff'); sky.addColorStop(1, '#b3e5fc');
      c.fillStyle = sky; c.fillRect(0, 0, w, h);
      c.fillStyle = '#66bb6a'; c.fillRect(0, h * 0.72, w, h);
      c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(w * 0.82, h * 0.25, 18, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ff7043'; c.beginPath(); c.arc(w * 0.4, h * 0.6, 22, 0, Math.PI * 2); c.fill(); // a cartoon character
      c.fillStyle = '#fff'; c.beginPath(); c.arc(w * 0.37, h * 0.55, 6, 0, Math.PI * 2); c.arc(w * 0.44, h * 0.55, 6, 0, Math.PI * 2); c.fill();
    }) })), 0, 0.47, 0.021, { cast: false });
    g.add(screen);
    return g;
  },
  ludo() {
    const g = new THREE.Group();
    const board = mesh(new THREE.BoxGeometry(0.45, 0.02, 0.45), sharedMat('ludoBoard', () => new THREE.MeshStandardMaterial({ roughness: 0.6, map: canvasTexture(256, 256, (c, w) => {
      c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, w);
      [['#e53935', 0, 0], ['#43a047', 1, 0], ['#fdd835', 1, 1], ['#1e88e5', 0, 1]].forEach(([col, x, y]) => { c.fillStyle = col; c.fillRect(x * w * 0.6, y * w * 0.6, w * 0.4, w * 0.4); });
      c.strokeStyle = '#999'; for (let i = 0; i <= 15; i++) { c.beginPath(); c.moveTo(i * w / 15, w * 0.4); c.lineTo(i * w / 15, w * 0.6); c.moveTo(w * 0.4, i * w / 15); c.lineTo(w * 0.6, i * w / 15); c.stroke(); }
    }) })), 0, 0.01, 0);
    g.add(board);
    [['#e53935', -0.12, -0.12], ['#43a047', 0.12, -0.12], ['#fdd835', 0.12, 0.12], ['#1e88e5', -0.12, 0.12], ['#e53935', 0.02, -0.03]].forEach(([col, x, z]) => {
      g.add(mesh(geo('ludoPawn', () => new THREE.ConeGeometry(0.015, 0.04, 12)), mats.glossy(col, 0.3), x, 0.04, z));
      g.add(mesh(sphere(0.011, 10, 8), mats.glossy(col, 0.3), x, 0.065, z));
    });
    const die = mesh(new THREE.BoxGeometry(0.03, 0.03, 0.03), mats.glossy('#ffffff', 0.3), 0.18, 0.035, 0.0);
    die.rotation.y = 0.5;
    g.add(die);
    return g;
  },
  picnicmat() {
    const m = mesh(new THREE.PlaneGeometry(1.1, 0.8), sharedMat('picnicMat', () => new THREE.MeshStandardMaterial({ roughness: 0.9, map: canvasTexture(64, 64, (c, w) => {
      c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, w);
      c.fillStyle = 'rgba(229,57,53,0.85)';
      for (let i = 0; i < 8; i += 2) { c.fillRect(i * 8, 0, 8, w); c.fillRect(0, i * 8, w, 8); }
    }, { repeat: 2 }) })), 0, 0.005, 0, { cast: false });
    m.rotation.x = -Math.PI / 2;
    const g = new THREE.Group();
    g.add(m);
    return g;
  },
  blanketfort() {
    const g = new THREE.Group();
    const tent = mesh(new THREE.ConeGeometry(0.55, 0.7, 4, 1, true), side2('#ffb74d', 0.9), 0, 0.35, 0);
    tent.rotation.y = Math.PI / 4;
    g.add(tent);
    g.add(mesh(new THREE.ConeGeometry(0.56, 0.3, 4, 1, true), side2('#7c4dff', 0.9), 0, 0.56, 0));
    for (const [x, z, c] of [[-0.45, 0.35, '#e53935'], [0.45, 0.3, '#43a047'], [0, 0.45, '#29b6f6']]) {
      const p = mesh(sphere(0.5, 16, 10), mats.cloth(c), x, 0.07, z);
      p.scale.set(0.3, 0.14, 0.2);
      g.add(p);
    }
    g.add(mesh(new THREE.CircleGeometry(0.18, 20), new THREE.MeshBasicMaterial({ color: '#2b1d10' }), 0, 0.17, 0.39, { cast: false }));
    return g;
  },
  lemonadestand() {
    const g = new THREE.Group();
    const wood = mats.matte('#d9a066', 0.7);
    g.add(mesh(new THREE.BoxGeometry(0.7, 0.04, 0.35), wood, 0, 0.45, 0));
    for (const x of [-0.32, 0.32]) for (const z of [-0.14, 0.14]) g.add(mesh(new THREE.BoxGeometry(0.04, 0.45, 0.04), wood, x, 0.225, z));
    g.add(mesh(new THREE.BoxGeometry(0.7, 0.2, 0.01), sharedMat('lemonSign', () => new THREE.MeshStandardMaterial({ roughness: 0.8, map: canvasTexture(256, 72, (c, w, h) => {
      c.fillStyle = '#fff59d'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#e65100'; c.font = '700 40px Fredoka, sans-serif'; c.textAlign = 'center'; c.fillText('LEMONADE', w / 2, 50);
    }) })), 0, 0.33, 0.18));
    const jug = storyBuilders.jug();
    jug.scale.setScalar(1.3);
    jug.position.set(-0.15, 0.55, -0.07);
    g.add(jug);
    for (const x of [0.1, 0.22]) g.add(mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.08, 16), mats.glossy('#fff59d', 0.2), x, 0.51, 0));
    return g;
  },
  volcano() { return volcanoModel(false); },
  volcanofoam() { return volcanoModel(true); },
  sandcastle() {
    const g = new THREE.Group();
    const sand = mats.matte('#e6c88c', 0.95);
    g.add(mesh(new THREE.BoxGeometry(0.5, 0.18, 0.4), sand, 0, 0.09, 0));
    for (const [x, z] of [[-0.22, -0.17], [0.22, -0.17], [-0.22, 0.17], [0.22, 0.17]]) {
      g.add(mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.3, 14), sand, x, 0.15, z));
      g.add(mesh(new THREE.ConeGeometry(0.08, 0.1, 14), sand, x, 0.35, z));
    }
    g.add(mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 16), sand, 0, 0.28, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.2, 6), mats.matte('#8b5a2b'), 0, 0.48, 0));
    g.add(mesh(new THREE.PlaneGeometry(0.1, 0.06).translate(0.05, 0, 0), side2('#e53935', 0.6), 0, 0.55, 0));
    return g;
  },
  sapling() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.03, 16), mats.matte('#5a3a22'), 0, 0.015, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.4, 8), mats.matte('#7a5230'), 0, 0.2, 0));
    g.add(mesh(blob(0.16, 5, 0.25, 2), mats.fur('#5fae3e'), 0, 0.45, 0));
    return g;
  },
  dustbin() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.45, 20), mats.glossy('#2e7d32', 0.4), 0, 0.225, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 20), mats.glossy('#388e3c', 0.4), 0, 0.47, 0));
    return g;
  },
  litter() {
    const g = new THREE.Group();
    const bits = [['#ff8f00', 0.0, 0.0], ['#e53935', 0.35, 0.2], ['#1e88e5', -0.3, 0.25], ['#fdd835', 0.2, -0.3], ['#ffffff', -0.25, -0.2], ['#ab47bc', 0.5, -0.05]];
    bits.forEach(([col, x, z], i) => {
      const b = mesh(sphere(0.5, 10, 8), mats.glossy(col, 0.5), x, 0.02, z);
      b.scale.set(0.08, 0.03, 0.06);
      b.rotation.y = i;
      g.add(b);
    });
    const bottle = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 12), mats.glossy('#2ec4b6', 0.2), -0.05, 0.03, 0.35);
    bottle.rotation.z = Math.PI / 2;
    g.add(bottle);
    return g;
  },
  bucket() {
    const g = new THREE.Group();
    g.add(mesh(lathe('bigBucket', [[0.001, 0], [0.13, 0], [0.17, 0.3], [0.16, 0.3], [0.12, 0.01], [0.001, 0.01]]), side2('#1e88e5', 0.4), 0, 0, 0));
    g.add(mesh(new THREE.CircleGeometry(0.155, 24).rotateX(-Math.PI / 2), mats.glossy('#81d4fa', 0.05), 0, 0.26, 0, { cast: false }));
    return g;
  },
  brokenpot() {
    const g = new THREE.Group();
    [[0, 0, 0], [0.12, 0.05, 1.2], [-0.1, 0.08, 2.4], [0.04, -0.12, 3.6]].forEach(([x, z, r]) => {
      const s = mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.08, 10, 1, true, 0, 1.4), side2('#c8643b', 0.8), x, 0.04, z);
      s.rotation.set(0.3, r, 0.4);
      g.add(s);
    });
    const soil = mesh(sphere(0.12, 16, 10), mats.matte('#5a3a22'), 0, 0, 0);
    soil.scale.set(1.3, 0.25, 1);
    g.add(soil);
    const stem = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.25, 6), mats.fur('#3faa3a'), 0.05, 0.03, 0.02);
    stem.rotation.z = Math.PI / 2.3;
    g.add(stem);
    g.add(mesh(sphere(0.035, 12, 8), mats.glossy('#ff4d6d', 0.3), 0.17, 0.06, 0.02));
    return g;
  },
  balloonbunch() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.3, 6), mats.matte('#8b5a2b'), 0, 0.15, 0)); // the balloon man's stick
    [['#ff4d6d', 0, 1.0, 0], ['#3fa7ff', 0.2, 0.92, 0.05], ['#ffd23f', -0.2, 0.95, 0.04], ['#7c4dff', 0.1, 1.15, -0.08], ['#43a047', -0.1, 1.12, -0.05]]
      .forEach(([c, x, y, z]) => balloonOn(g, c, x, y, z, y - 0.1));
    return g;
  },
  balloonbits() {
    const g = new THREE.Group();
    [[0, 0, 0], [0.12, 0.08, 1], [-0.1, 0.1, 2], [0.05, -0.12, 3]].forEach(([x, z, r]) => {
      const b = mesh(new THREE.CircleGeometry(0.05, 5), side2('#ff4d6d', 0.3), x, 0.004, z, { cast: false });
      b.rotation.set(-Math.PI / 2, 0, r);
      g.add(b);
    });
    return g;
  },
};

function volcanoModel(erupting) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(0.6, 0.03, 0.5), mats.matte('#a5d6a7', 0.8), 0, 0.015, 0)); // the cardboard base
  g.add(mesh(new THREE.CylinderGeometry(0.06, 0.22, 0.3, 20, 1, true), side2('#8d6e63', 0.9), 0, 0.18, 0));
  g.add(mesh(new THREE.CircleGeometry(0.06, 16).rotateX(-Math.PI / 2), mats.glossy(erupting ? '#ff7043' : '#4e342e', 0.4), 0, 0.33, 0, { cast: false }));
  if (erupting) {
    const foam = mats.glossy('#fff3e0', 0.5);
    for (let i = 0; i < 10; i++) {
      const a = i * 2.1, r = 0.04 + (i % 4) * 0.05;
      g.add(mesh(sphere(0.045 + (i % 3) * 0.015, 12, 10), foam, Math.cos(a) * r, 0.34 - (i % 4) * 0.08, Math.sin(a) * r));
    }
    for (let i = 0; i < 6; i++) g.add(mesh(sphere(0.06, 12, 10), foam, Math.cos(i) * 0.3, 0.04, Math.sin(i) * 0.25));
  }
  return g;
}
