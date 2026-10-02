// Pixar-style characters built from code: big glossy eyes with lids, brows, a lip-synced
// mouth, soft fur/skin materials and a simple skeleton driven by procedural animation.
// Every pose is a pure function of time, so scrubbing and frame-by-frame rendering match.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { mats, mesh, sphere, capsule, geo, lathe, clamp, lerp, smoothstep, wobble, easeInOut, rng, canvasTexture } from './util.js';
import { buildProp, buildGear, BED } from './props.js';
import { OUTFITS, resolveOutfit, dressBody, dressHead } from './outfits.js';

export { OUTFITS };
export const SPECIES = {
  baby: { label: 'Baby', kind: 'human', color: '#f6cfae', accent: '#8fd3ff', hair: '#6b4a2b', eyes: '#5a3a1a', outfit: 'onesie', hairStyle: 'baby', baby: true },
  boy: { label: 'Boy', kind: 'human', color: '#f1c7a0', accent: '#3f8cff', hair: '#5a3620', eyes: '#6b4423', outfit: 'tshirt', hairStyle: 'short' },
  girl: { label: 'Girl', kind: 'human', color: '#e7b48d', accent: '#ff5c9a', hair: '#2e1c12', eyes: '#3d6fb5', outfit: 'dress', hairStyle: 'pigtails' },
  man: { label: 'Man (dad, teacher, doctor…)', kind: 'human', color: '#d9a47c', accent: '#4a7bd0', hair: '#2a1a12', eyes: '#3b2415', outfit: 'shirtpants', hairStyle: 'short', adult: true },
  woman: { label: 'Woman (mom, teacher, nurse…)', kind: 'human', color: '#e2ae88', accent: '#e0457b', hair: '#1e130c', eyes: '#3b2415', outfit: 'saree', hairStyle: 'long', adult: true, bindi: true },
  grandpa: { label: 'Grandpa', kind: 'human', color: '#d6a07a', accent: '#f2efe6', hair: '#e6e6e6', eyes: '#3b2415', outfit: 'kurtapajama', hairStyle: 'bald', adult: true, elder: true, glasses: true, mustache: true },
  grandma: { label: 'Grandma', kind: 'human', color: '#e0ad88', accent: '#8e5bd0', hair: '#dcdcdc', eyes: '#3b2415', outfit: 'saree', hairStyle: 'bun', adult: true, elder: true, glasses: true, bindi: true },
  pandit: { label: 'Pandit-ji (priest)', kind: 'human', color: '#c98b62', accent: '#ff9800', hair: '#2a221c', eyes: '#3b2415', outfit: 'kurta', hairStyle: 'shikha', adult: true, tilak: true, mala: true, mustache: true },
  narrator: { label: 'Spiritual narrator (man)', kind: 'human', color: '#c98b62', accent: '#fbf8f0', hair: '#3a302a', eyes: '#3b2415', outfit: 'kurta', adult: true, beard: true, turban: '#ff8c1a', tilak: true, garland: true },
  bunny: { label: 'Bunny', kind: 'animal', color: '#f7f1ea', accent: '#ff9ec4', eyes: '#4a2f1d', ears: 'bunny', nose: '#ff7fa8', tail: 'puff' },
  bear: { label: 'Bear', kind: 'animal', color: '#a8703f', accent: '#2fb67a', eyes: '#2a1a10', ears: 'round', nose: '#2a1a12', muzzle: true, tail: 'stub' },
  cat: { label: 'Cat', kind: 'animal', color: '#f4a24a', accent: '#7ad3ff', eyes: '#3f9a3a', ears: 'pointy', nose: '#ff8fb1', tail: 'long', whiskers: true },
  puppy: { label: 'Puppy', kind: 'animal', color: '#e9c9a0', accent: '#ff5c5c', eyes: '#3b2415', ears: 'floppy', nose: '#2a1a12', muzzle: true, tail: 'wag' },
  fox: { label: 'Fox', kind: 'animal', color: '#f07a2c', accent: '#4db6ff', eyes: '#3a2412', ears: 'pointy', nose: '#1d1410', muzzle: true, tail: 'bushy', whiskers: true },
  panda: { label: 'Panda', kind: 'animal', color: '#f7f5f0', accent: '#7ad36b', eyes: '#1a1a1a', ears: 'round', nose: '#1a1a1a', muzzle: true, tail: 'stub', dark: '#26262b' },
  mouse: { label: 'Mouse', kind: 'animal', color: '#b9b4c2', accent: '#ffd23f', eyes: '#1f1a24', ears: 'round', earSize: 1.75, earPos: [0.62, 0.95], nose: '#ff8fb1', tail: 'thin', whiskers: true },
  lion: { label: 'Lion', kind: 'animal', color: '#e9b35a', accent: '#e53935', hair: '#b5652a', eyes: '#5a3a12', ears: 'round', nose: '#5a3322', muzzle: true, tail: 'tuft', mane: true },
  monkey: { label: 'Monkey', kind: 'animal', color: '#8a5a36', accent: '#ffcf3f', eyes: '#2a1a10', ears: 'round', earSize: 1.1, earPos: [0.05, 1.5], nose: '#3a2418', muzzle: true, face: true, tail: 'long' },
  pig: { label: 'Piggy', kind: 'animal', color: '#ffb3c1', accent: '#6ec3ff', eyes: '#2a1a1a', ears: 'pointy', nose: '#ff8aa5', snout: true, tail: 'curly' },
  elephant: { label: 'Elephant', kind: 'animal', color: '#a9b0bd', accent: '#ff8fb1', eyes: '#2a2430', ears: 'elephant', nose: '#8a909c', trunk: true, tail: 'stub' },
  koala: { label: 'Koala', kind: 'animal', color: '#9ea3ab', accent: '#ff9e4a', eyes: '#1d1a1a', ears: 'round', earSize: 1.55, earPos: [0.6, 0.95], nose: '#2a2a2e', noseSize: 2.2, tail: 'none' },
  robo: { label: 'Robo (3D model)', kind: 'model', color: '#9aa7b8', accent: '#ffd23f', eyes: '#000000' },
};

// Labels like "Baby: Crawl" are shown grouped under "Baby" in the menus.
export const ACTIONS = {
  idle: 'Stand', wave: 'Wave', cheer: 'Cheer', jump: 'Jump', dance: 'Dance', laugh: 'Laugh', cry: 'Cry',
  sad: 'Feel sad', think: 'Think', point: 'Point', clap: 'Clap', shrug: 'Shrug', spin: 'Spin',
  yes: 'Nod yes', no: 'Shake head no', lookaround: 'Look around', stomp: 'Stomp (angry)',
  bow: 'Bow', namaste: 'Namaste (folded hands)', salute: 'Salute',
  crawl: 'Baby: Crawl', firststeps: 'Baby: First wobbly steps', rattle: 'Baby: Shake a rattle', bottle: 'Baby: Drink milk bottle',
  walkaround: 'Daily life: Walk around', sitfloor: 'Daily life: Sit on the floor', sitchair: 'Daily life: Sit on a chair',
  sitcross: 'Daily life: Sit cross-legged', sleep: 'Daily life: Sleep in bed', yawn: 'Daily life: Yawn & stretch',
  eat: 'Daily life: Eat with a spoon', drink: 'Daily life: Drink from a cup', brush: 'Daily life: Brush teeth',
  washhands: 'Daily life: Wash hands', phone: 'Daily life: Talk on the phone', sick: 'Daily life: Feel sick (tummy ache)',
  cook: 'Daily life: Cook (stir a pot)', sweep: 'Daily life: Sweep the floor', cart: 'Daily life: Push a shopping cart',
  study: 'School: Study at a desk', read: 'School: Read a book', raisehand: 'School: Raise hand',
  paint: 'School: Paint a picture', sing: 'School: Sing into a mic',
  run: 'Play: Run around', runjump: 'Play: Run and jump', swing: 'Play: On a swing', slide: 'Play: On a slide',
  kick: 'Play: Kick a ball (keepy-uppy)', cricket: 'Play: Bat (cricket)', jumprope: 'Play: Skipping rope',
  bicycle: 'Play: Ride a bicycle', jumpingjacks: 'Play: Jumping jacks',
  bhangra: 'Dance: Bhangra', disco: 'Dance: Disco', twist: 'Dance: Twist', hiphop: 'Dance: Hip-hop bounce',
  robot: 'Dance: Robot', twirl: 'Dance: Twirl', sidestep: 'Dance: Side steps',
  sitar: 'Music: Play sitar (sitting)',
};

// What an action puts in the hands. force: replaces whatever the actor was told to hold.
const ACTION_PROPS = {
  sitar: { right: 'sitar', force: true }, rattle: { right: 'rattle' }, bottle: { right: 'milkbottle' },
  eat: { right: 'spoon', left: 'bowl' }, drink: { right: 'cup' }, brush: { right: 'toothbrush', force: true },
  phone: { right: 'phone' }, study: { right: 'pencil', force: true }, read: { right: 'openbook', force: true },
  paint: { right: 'paintbrush', left: 'palette', force: true }, sing: { right: 'mic' }, cricket: { right: 'bat', force: true },
  sweep: { right: 'broom', force: true }, cook: { right: 'ladle', force: true },
  ...Object.fromEntries(['crawl', 'jumprope', 'bicycle', 'cart', 'washhands', 'namaste', 'sleep', 'jumpingjacks', 'sick', 'cry']
    .map((a) => [a, { right: null, force: true }])),
};
// Furniture / moving bits an action brings. parent: root (stays put) | rig (moves with the figure) | head.
const GEAR = {
  swing: { parent: 'root', build: () => buildSwing() }, slide: { parent: 'root', build: () => buildSlide() },
  chair: { parent: 'root', scaled: true }, desk: { parent: 'root', scaled: true }, bed: { parent: 'root', scaled: true },
  easel: { parent: 'root', scaled: true }, stove: { parent: 'root', scaled: true }, sink: { parent: 'root', scaled: true },
  bike: { parent: 'rig' }, rope: { parent: 'rig' }, cart: { parent: 'rig' }, kickball: { parent: 'rig' }, notes: { parent: 'rig' },
  tears: { parent: 'head' },
};
const ACTION_GEAR = {
  swing: 'swing', slide: 'slide', sitchair: 'chair', study: 'desk', sleep: 'bed', paint: 'easel', cook: 'stove', washhands: 'sink',
  bicycle: 'bike', jumprope: 'rope', cart: 'cart', kick: 'kickball', sing: 'notes', cry: 'tears',
};
// Spoken gestures (see gestures.js) are not played over these: the whole body is busy moving.
const GESTURE_SKIP = new Set(['jump', 'dance', 'spin', 'run', 'runjump', 'swing', 'slide', 'bicycle', 'jumprope', 'kick', 'cricket',
  'jumpingjacks', 'crawl', 'firststeps', 'walkaround', 'cart', 'sleep', 'bhangra', 'disco', 'twist', 'hiphop', 'robot', 'twirl', 'sidestep']);
const SEATED = new Set(['sitfloor', 'sitchair', 'sitcross', 'study', 'sitar', 'paint']);
// ...and with these the hands stay on what they are doing; only the head joins in.
const HANDS_ON_JOB = new Set(['eat', 'drink', 'read', 'study', 'cook', 'sweep', 'brush', 'washhands', 'phone', 'paint', 'sing', 'sitar',
  'rattle', 'bottle', 'cry', 'sick', 'clap', 'namaste', 'salute', 'raisehand']);
export const EMOTIONS = {
  neutral: 'Neutral', happy: 'Happy', excited: 'Excited', laugh: 'Laughing', sad: 'Sad',
  angry: 'Angry', surprised: 'Surprised', scared: 'Scared', thinking: 'Thinking', calm: 'Calm & peaceful',
};

// Face targets. Lids are elevation angles (radians) of the lid edge on the eyeball.
const FACES = {
  neutral:   { brow: 0.00, tilt: 0.00, upper: 0.66, lower: -0.75, smile: 0.35, open: 0.00 },
  happy:     { brow: 0.03, tilt: -0.05, upper: 0.62, lower: -0.42, smile: 1.00, open: 0.08 },
  excited:   { brow: 0.07, tilt: -0.12, upper: 0.90, lower: -0.60, smile: 1.00, open: 0.45 },
  laugh:     { brow: 0.05, tilt: -0.15, upper: -0.10, lower: -0.14, smile: 1.00, open: 0.60 },
  sad:       { brow: 0.02, tilt: -0.50, upper: 0.30, lower: -0.72, smile: -0.75, open: 0.00 },
  angry:     { brow: -0.035, tilt: 0.55, upper: 0.26, lower: -0.45, smile: -0.55, open: 0.05 },
  surprised: { brow: 0.10, tilt: -0.10, upper: 1.05, lower: -0.95, smile: 0.10, open: 0.55 },
  scared:    { brow: 0.07, tilt: -0.50, upper: 1.00, lower: -0.90, smile: -0.50, open: 0.30 },
  thinking:  { brow: 0.04, tilt: 0.20, upper: 0.45, lower: -0.60, smile: 0.10, open: 0.00 },
  calm:      { brow: 0.03, tilt: -0.3, upper: 0.18, lower: -0.55, smile: 0.55, open: 0.00 },
};
export function faceParams(a, b, k) {
  const A = FACES[a] || FACES.neutral, B = FACES[b] || FACES.neutral, out = {};
  for (const key in A) out[key] = lerp(A[key], B[key], k);
  return out;
}

const Z = new THREE.Vector3(0, 0, 1);
const tmpV = new THREE.Vector3();
const tmpQ = new THREE.Quaternion(), tmpQ2 = new THREE.Quaternion(), tmpQ3 = new THREE.Quaternion();
const tmpE = new THREE.Euler();

function surfaceNormal(lat, lon) {
  return new THREE.Vector3(Math.sin(lon) * Math.cos(lat), Math.sin(lat), Math.cos(lon) * Math.cos(lat));
}
function placeOn(obj, center, radius, lat, lon, out = 0) {
  const n = surfaceNormal(lat, lon);
  obj.position.copy(n).multiplyScalar(radius + out).add(center);
  obj.quaternion.setFromUnitVectors(Z, n);
  return n;
}
const cap = (r, angle, key) => geo(`cap${key}${r}${angle}`, () => {
  const g = new THREE.SphereGeometry(r, 36, 12, 0, Math.PI * 2, 0, angle);
  g.rotateX(Math.PI / 2); // cap now faces +z
  return g;
});

// ---------- lip-synced mouth drawn on a sphere surface ----------
class Mouth {
  constructor(parent, center, radius, lat, lon, width) {
    this.group = new THREE.Group();
    placeOn(this.group, center, radius, lat, lon);
    parent.add(this.group);
    this.R = radius;
    this.width = width;
    const mk = (color, order) => {
      const m = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshPhysicalMaterial({
        color, roughness: 0.45, clearcoat: 0.4, polygonOffset: true, polygonOffsetFactor: -order, polygonOffsetUnits: -order,
      }));
      m.renderOrder = order;
      this.group.add(m);
      return m;
    };
    this.cavity = mk('#3a0d17', 1);
    this.tongue = mk('#e05a6e', 2);
    this.teeth = mk('#fbf8f2', 3);
    this.key = '';
  }

  conform(shape, lift) {
    const g = new THREE.ShapeGeometry(shape, 10);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      tmpV.set(p.getX(i), p.getY(i), this.R).normalize().multiplyScalar(this.R + lift);
      p.setXYZ(i, tmpV.x, tmpV.y, tmpV.z - this.R);
    }
    g.computeVertexNormals();
    return g;
  }

  set(open, smile) {
    const key = `${open.toFixed(3)}|${smile.toFixed(3)}`;
    if (key === this.key) return;
    this.key = key;
    const w = this.width * (1 + smile * 0.12 - open * 0.22);
    const hw = w / 2;
    const cornerY = smile * 0.12 * w;
    const upY = -smile * 0.3 * w + open * 0.12 * w;
    const lowY = upY - 0.07 * w - open * 1.0 * w;
    const curve = (y0, yc) => (x) => { const k = x / hw; return y0 + (yc - y0) * (1 - k * k); };
    const up = curve(cornerY, upY), low = curve(cornerY, lowY);

    const band = (topFn, botFn) => {
      const s = new THREE.Shape();
      const N = 12;
      for (let i = 0; i <= N; i++) { const x = -hw + (2 * hw * i) / N; i ? s.lineTo(x, topFn(x)) : s.moveTo(x, topFn(x)); }
      for (let i = N; i >= 0; i--) { const x = -hw + (2 * hw * i) / N; s.lineTo(x, botFn(x)); }
      return s;
    };
    const swap = (m, shape, lift) => { m.geometry.dispose(); m.geometry = shape ? this.conform(shape, lift) : new THREE.BufferGeometry(); };

    swap(this.cavity, band(up, low), 0.002);
    const teethH = Math.min(open * 0.3 * w, 0.14 * w);
    swap(this.teeth, open > 0.06 ? band((x) => up(x) - 0.004 * w, (x) => up(x) - teethH * (1 - (x / hw) ** 4)) : null, 0.0035);
    const tongueH = open * 0.35 * w;
    swap(this.tongue, open > 0.15 ? band((x) => low(x) + tongueH * (1 - (x / hw) ** 2), (x) => low(x) + 0.004 * w) : null, 0.003);
  }
}

// ---------- the procedural character ----------
export class ToonCharacter {
  constructor(cast) {
    this.cast = cast;
    this.sp = SPECIES[cast.type] || SPECIES.bunny;
    this.human = this.sp.kind === 'human';
    this.root = new THREE.Group();
    this.rig = new THREE.Group(); // the whole figure; moves around for run / swing / slide
    this.root.add(this.rig);
    this.gear = {}; // swing set / slide / bed…, built on first use
    this.low = 0;
    this.lying = false;
    this.seed = [...(cast.id || cast.name || 'x')].reduce((a, c) => a + c.charCodeAt(0), 0) % 97;
    this.build();
  }

  build() {
    const { cast, sp, human } = this;
    const base = cast.color || sp.color;
    const accent = cast.accent || sp.accent;
    const skin = human ? mats.skin(base) : mats.fur(base);
    const light = '#' + new THREE.Color(base).lerp(new THREE.Color('#ffffff'), 0.55).getHexString();
    const lightMat = human ? skin : mats.fur(light);
    const cloth = mats.cloth(accent);
    this.skinMat = skin;
    const outfit = human ? resolveOutfit(cast.outfit, cast, sp, skin) : null;
    this.outfit = outfit;
    const kurta = outfit?.id === 'kurta';
    const dhoti = kurta ? mats.cloth('#fbf8f0') : null;
    const limb = sp.dark ? mats.fur(sp.dark) : kurta ? dhoti : skin;
    if (sp.adult) this.rig.scale.setScalar(1.3);
    if (sp.baby) this.rig.scale.setScalar(0.72);

    // hierarchy: root > body(hips) > torso, neck>head, shoulders>arms ; root > legs
    const body = new THREE.Group();
    body.position.y = 0.3;
    this.rig.add(body);
    this.body = body;

    if (human) {
      if (kurta) {
        body.add(mesh(lathe('kurta', KURTA), cloth));
        // saffron border at the hem and a neck placket
        const hem = mesh(geo('kurtaHem', () => new THREE.TorusGeometry(0.2, 0.01, 8, 48)), mats.cloth(sp.turban || '#ff8c1a'), 0, -0.19, 0);
        hem.rotation.x = Math.PI / 2;
        body.add(hem);
        body.add(mesh(new THREE.BoxGeometry(0.03, 0.1, 0.01), mats.cloth(sp.turban || '#ff8c1a'), 0, 0.29, 0.135));
        if (sp.garland) this.buildGarlands(body);
        if (sp.mala) {
          // rudraksha prayer beads
          for (let i = 0; i < 40; i++) {
            const a = (i / 40) * Math.PI * 2 - Math.PI;
            const w = Math.max(0, Math.cos(a)) ** 1.3, y = 0.34 - 0.2 * w;
            const r = 0.115 + 0.065 * w;
            body.add(mesh(sphere(0.012, 8, 6), mats.matte('#6d3b1f', 0.6), Math.sin(a) * r, y, Math.cos(a) * r * 1.12, { cast: false }));
          }
        }
      } else {
        Object.assign(this, dressBody(body, outfit, skin)); // sets this.skirt / this.cape when the outfit has them
      }
    } else {
      body.add(mesh(lathe('tummy', [[0.001, -0.08], [0.12, -0.07], [0.17, 0.03], [0.18, 0.15], [0.16, 0.26], [0.12, 0.33], [0.07, 0.37], [0.001, 0.38]]), skin));
      const belly = mesh(sphere(0.13), lightMat, 0, 0.12, 0.085);
      belly.scale.set(1, 1.25, 0.6);
      body.add(belly);
      const scarf = mesh(geo('scarf', () => new THREE.TorusGeometry(0.12, 0.045, 14, 40)), cloth, 0, 0.35, 0);
      scarf.rotation.x = Math.PI / 2;
      body.add(scarf);
      const knot = mesh(capsule(0.035, 0.08), cloth, 0.05, 0.28, 0.13);
      knot.rotation.set(0.35, 0, 0.25);
      body.add(knot);
    }

    // head
    const R = 0.25;
    this.R = R;
    const neck = new THREE.Group();
    neck.position.y = 0.36;
    body.add(neck);
    this.neck = neck;
    const head = new THREE.Group();
    head.position.y = 0.23;
    if (sp.baby) { head.scale.setScalar(1.18); head.position.y = 0.25; } // babies: big head
    neck.add(head);
    this.head = head;
    const skull = mesh(sphere(R, 64, 48), skin);
    skull.scale.set(1.04, 0.98, 1);
    head.add(skull);
    const C = new THREE.Vector3();

    // eyes
    this.eyeR = human ? 0.076 : 0.084;
    this.eyeLon = human ? 0.34 : 0.375;
    if (sp.face) {
      const face = mesh(sphere(0.2, 48, 32), lightMat, 0, -0.03, 0.075);
      face.scale.set(1.15, 1, 1);
      head.add(face);
    }
    if (sp.dark) {
      for (const s of [-1, 1]) {
        const patch = mesh(sphere(0.1, 32, 24), limb, 0, 0, 0, { cast: false });
        placeOn(patch, C, R, 0.04, s * this.eyeLon, -0.03);
        patch.scale.set(1, 1.25, 0.4);
        patch.rotateZ(s * 0.5);
        head.add(patch);
      }
    }
    this.eyes = [-1, 1].map((s) => this.buildEye(head, C, R, s, cast.eyes || sp.eyes, skin));

    // brows
    const browMat = human ? mats.fur(cast.hair || sp.hair) : mats.fur('#' + new THREE.Color(base).multiplyScalar(0.55).getHexString());
    this.brows = [-1, 1].map((s) => {
      const pivot = new THREE.Group();
      const m = mesh(capsule(0.013, 0.075), browMat, 0, 0, 0.004, { cast: false });
      m.rotation.z = Math.PI / 2;
      m.scale.set(1, 1, 0.7);
      pivot.add(m);
      head.add(pivot);
      return { pivot, s };
    });

    // nose, muzzle, mouth
    if (sp.muzzle) {
      const MC = new THREE.Vector3(0, -0.085, 0.165), MR = 0.105;
      head.add(mesh(sphere(MR), lightMat, MC.x, MC.y, MC.z));
      const nose = mesh(sphere(0.042), mats.glossy(sp.nose, 0.2));
      placeOn(nose, MC, MR, 0.35, 0, 0.01);
      nose.scale.set(1.35, 0.85, 0.9);
      head.add(nose);
      this.mouth = new Mouth(head, MC, MR, -0.3, 0, 0.11);
    } else if (sp.snout) {
      const snout = new THREE.Group();
      placeOn(snout, C, R, -0.08, 0, 0.0);
      snout.add(mesh(geo('snout', () => new THREE.CylinderGeometry(0.075, 0.08, 0.07, 32).rotateX(Math.PI / 2)), mats.fur(sp.nose), 0, 0, 0.02));
      for (const s of [-1, 1]) snout.add(mesh(sphere(0.016, 12, 8), mats.matte('#8a3b4e'), s * 0.028, 0, 0.056, { cast: false }));
      head.add(snout);
      this.mouth = new Mouth(head, C, R, -0.36, 0, 0.1);
    } else if (sp.trunk) {
      this.trunk = [];
      let parent = new THREE.Group();
      placeOn(parent, C, R, -0.02, 0, -0.02);
      parent.quaternion.identity();
      head.add(parent);
      for (let i = 0; i < 7; i++) {
        const seg = new THREE.Group();
        if (i) seg.position.y = -0.065;
        parent.add(seg);
        seg.add(mesh(capsule(0.058 - i * 0.004, 0.04), skin, 0, -0.035, 0));
        this.trunk.push(seg);
        parent = seg;
      }
      this.mouth = new Mouth(head, C, R, -0.42, 0, 0.09);
    } else {
      const ns = sp.noseSize || 1;
      const nose = mesh(sphere(human ? 0.034 : 0.026 * ns), human ? skin : mats.glossy(sp.nose, 0.25));
      placeOn(nose, C, R, -0.1, 0, human ? -0.006 : 0.004 + (ns - 1) * 0.012);
      nose.scale.set(1.15, 0.85 * (ns > 1 ? 1.4 : 1), 0.85);
      head.add(nose);
      this.mouth = new Mouth(head, C, R, ns > 1 ? -0.36 : -0.3, 0, 0.1);
    }
    for (const s of [-1, 1]) {
      const cheek = mesh(sphere(0.045, 16, 12), mats.blush(), 0, 0, 0, { cast: false, receive: false });
      placeOn(cheek, C, R, -0.14, s * 0.58, -0.012);
      cheek.scale.set(1, 0.7, 0.3);
      head.add(cheek);
    }
    if (sp.whiskers) {
      for (const s of [-1, 1]) for (const k of [-1, 1]) {
        const w = mesh(geo('whisker', () => new THREE.CylinderGeometry(0.002, 0.002, 0.2, 4)), mats.matte('#ffffff'), 0, 0, 0, { cast: false });
        placeOn(w, C, R, -0.17 + k * 0.03, s * 0.35, 0.01);
        w.rotateZ(Math.PI / 2 + s * k * 0.12);
        w.translateY(-s * 0.06);
        head.add(w);
      }
    }

    if (sp.mane) {
      const maneMat = mats.fur(cast.hair || sp.hair);
      const back = mesh(sphere(R * 1.08, 48, 32), maneMat, 0, 0.0, -0.06);
      back.scale.set(1.1, 1.1, 0.8);
      head.add(back);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const tuft = mesh(sphere(0.085, 20, 14), maneMat, Math.cos(a) * R * 1.02, Math.sin(a) * R * 1.0 - 0.01, -0.02);
        tuft.scale.set(1, 1, 0.7);
        head.add(tuft);
      }
    }
    this.buildEars(head, C, R, sp.dark ? limb : skin, lightMat);
    if (human && sp.turban) this.buildTurban(head, C, R, mats.cloth(sp.turban), mats.fur(cast.hair || sp.hair));
    else if (human) this.buildHair(head, C, R, mats.fur(cast.hair || sp.hair), cloth);
    if (outfit && !kurta) dressHead(head, R, outfit);
    if (sp.glasses) {
      const frame = mats.glossy('#3a2a20', 0.3);
      for (const s of [-1, 1]) {
        const ring = mesh(geo('glassRing', () => new THREE.TorusGeometry(this.eyeR * 1.3, 0.008, 8, 28)), frame, 0, 0, 0, { cast: false });
        placeOn(ring, C, R, 0.07, s * this.eyeLon, 0.035);
        head.add(ring);
        // temple arm from the outer edge of the lens back to the ear
        const arm = mesh(geo('glassArm', () => new THREE.BoxGeometry(0.007, 0.007, 0.25)), frame, s * 0.228, 0.03, 0.12, { cast: false });
        arm.rotation.y = Math.atan2(-s * 0.065, 0.24);
        head.add(arm);
      }
      const bridge = mesh(geo('glassBridge', () => new THREE.CylinderGeometry(0.006, 0.006, 0.06, 6)), frame, 0, 0, 0, { cast: false });
      placeOn(bridge, C, R, 0.1, 0, 0.03);
      bridge.rotateZ(Math.PI / 2);
      head.add(bridge);
    }
    if (sp.mustache) {
      for (const s of [-1, 1]) {
        const stache = mesh(capsule(0.018, 0.055, 8), mats.fur(cast.hair || sp.hair), s * 0.034, -0.05, 0.243, { cast: false });
        stache.rotation.z = s * 1.25;
        head.add(stache);
      }
    }
    if (sp.bindi) {
      const dot = mesh(sphere(0.013, 10, 8), mats.glossy('#d50000', 0.3), 0, 0, 0, { cast: false });
      placeOn(dot, C, R, 0.27, 0, 0.002);
      head.add(dot);
    }
    if (sp.beard) {
      const hairMat = mats.fur(cast.hair || sp.hair);
      // short beard following the jaw
      const beard = mesh(geo('beard', () => new THREE.SphereGeometry(R * 1.02, 48, 24, 0, Math.PI * 2, Math.PI * 0.66, Math.PI * 0.26)), hairMat, 0, 0.0, 0.005);
      beard.rotation.x = 0.3; // lower at the front so the mouth stays clear
      beard.scale.set(1.0, 1.05, 1.02);
      head.add(beard);
      const chin = mesh(sphere(0.06, 24, 16), hairMat, 0, -0.2, 0.17);
      chin.scale.set(1.3, 0.8, 0.7);
      head.add(chin);
      for (const s of [-1, 1]) {
        const stache = mesh(capsule(0.016, 0.05, 8), hairMat, s * 0.03, -0.047, 0.243, { cast: false });
        stache.rotation.z = s * 1.2;
        head.add(stache);
      }
    }
    if (sp.tilak) {
      const tilak = mesh(capsule(0.011, 0.05, 8), mats.glossy('#d50000', 0.3), 0, 0, 0, { cast: false });
      placeOn(tilak, C, R, 0.3, 0, 0.001);
      head.add(tilak);
      const dot = mesh(sphere(0.012, 10, 8), mats.glossy('#ffc107', 0.3), 0, 0, 0, { cast: false });
      placeOn(dot, C, R, 0.2, 0, 0.002);
      head.add(dot);
    }

    // arms: shoulder > elbow > hand
    this.arms = [-1, 1].map((s) => {
      const shoulder = new THREE.Group();
      shoulder.position.set(s * 0.15, 0.29, 0);
      body.add(shoulder);
      shoulder.add(mesh(capsule(kurta ? 0.05 : 0.046, 0.09), kurta ? cloth : human ? outfit.upperArm : limb, 0, -0.09, 0));
      if (outfit?.puff) shoulder.add(mesh(sphere(0.068, 20, 14), outfit.upperArm, 0, -0.03, 0));
      const elbow = new THREE.Group();
      elbow.position.y = -0.17;
      shoulder.add(elbow);
      const longSleeve = human && !kurta && outfit.lowerArm !== skin;
      elbow.add(mesh(capsule(kurta || longSleeve ? 0.047 : 0.042, 0.08), kurta ? cloth : human ? outfit.lowerArm : limb, 0, -0.08, 0));
      const hand = new THREE.Group();
      hand.position.y = -0.16;
      elbow.add(hand);
      const palmMat = human ? skin : sp.dark ? limb : lightMat;
      const palm = mesh(sphere(0.055, 24, 16), palmMat, 0, -0.035, 0.005);
      palm.scale.set(0.95, 1.05, 0.8);
      hand.add(palm);
      hand.add(mesh(sphere(0.022, 12, 8), palmMat, -s * 0.045, -0.02, 0.025));
      if (sp.garland) {
        for (let i = 0; i < 9; i++) {
          const a = (i / 9) * Math.PI * 2;
          hand.add(mesh(sphere(0.022, 10, 8), i % 3 ? MARIGOLD() : JASMINE(), Math.cos(a) * 0.046, 0.02, Math.sin(a) * 0.046, { cast: false }));
        }
      }
      const grip = new THREE.Group();
      grip.position.set(0, -0.05, 0.03);
      hand.add(grip);
      return { shoulder, elbow, hand, grip, s };
    });

    // legs
    this.legs = [-1, 1].map((s) => {
      const hip = new THREE.Group();
      hip.position.set(s * 0.075, 0.3, 0);
      this.rig.add(hip);
      hip.rotation.order = 'YXZ'; // legs swing forward first, then turn in (cross-legged)
      const pants = human && !kurta && outfit.leg !== skin;
      hip.add(mesh(capsule(kurta ? 0.07 : pants ? 0.062 : 0.056, 0.17), human && !kurta ? outfit.leg : limb, 0, -0.14, 0));
      const foot = kurta ? mesh(sphere(0.066), skin, 0, -0.265, 0.04) : human
        ? mesh(sphere(0.072), outfit.shoe, 0, -0.265, 0.04)
        : mesh(sphere(0.072), sp.dark ? limb : lightMat, 0, -0.265, 0.04);
      foot.scale.set(0.95, 0.55, 1.45);
      hip.add(foot);
      return { hip, s };
    });

    this.buildTail(body, skin, lightMat);
  }

  buildEye(head, C, R, s, irisColor, lidMat) {
    const e = this.eyeR;
    const socket = new THREE.Group();
    placeOn(socket, C, R, 0.07, s * this.eyeLon, -e * 0.5);
    head.add(socket);
    const ball = new THREE.Group();
    socket.add(ball);
    ball.add(mesh(sphere(e, 40, 28), mats.glossy('#fbfaf6', 0.22), 0, 0, 0, { cast: false }));
    ball.add(mesh(cap(e * 1.004, 0.62, 'iris'), irisMaterial(irisColor), 0, 0, 0, { cast: false }));
    ball.add(mesh(cap(e * 1.007, 0.28, 'pupil'), mats.glossy('#050505', 0.1), 0, 0, 0, { cast: false }));
    // two catchlights, a big soft one up top and a small one below: the "alive" sparkle
    const glint = new THREE.Group();
    const big = mesh(sphere(e * 0.16, 14, 10), mats.glow('#ffffff', 1.2), 0, 0, 0, { cast: false, receive: false });
    big.position.set(-0.3, 0.36, 0.88).normalize().multiplyScalar(e * 1.012);
    big.scale.set(1, 1.15, 0.4);
    const small = mesh(sphere(e * 0.07, 10, 8), mats.glow('#ffffff', 1.1), 0, 0, 0, { cast: false, receive: false });
    small.position.set(0.24, -0.2, 0.95).normalize().multiplyScalar(e * 1.012);
    small.scale.set(1, 1, 0.4);
    glint.add(big, small);
    socket.add(glint);
    const upper = mesh(geo(`lidU${e}`, () => new THREE.SphereGeometry(e * 1.04, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2)), lidMat, 0, 0, 0, { cast: false });
    const lower = mesh(geo(`lidL${e}`, () => new THREE.SphereGeometry(e * 1.035, 40, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2)), lidMat, 0, 0, 0, { cast: false });
    socket.add(upper, lower);
    return { socket, ball, upper, lower, s, glint };
  }

  buildEars(head, C, R, fur, light) {
    const { sp } = this;
    const pink = mats.fur('#ffb3c9');
    this.ears = [];
    for (const s of [-1, 1]) {
      const pivot = new THREE.Group();
      if (sp.ears === 'bunny') {
        placeOn(pivot, C, R, 1.05, s * 0.32, -0.02);
        pivot.rotation.set(-0.15, 0, -s * 0.18);
        const lower = mesh(capsule(0.06, 0.16), fur, 0, 0.13, 0);
        lower.scale.z = 0.5;
        pivot.add(lower);
        const inner = mesh(capsule(0.036, 0.13), pink, 0, 0.13, 0.022, { cast: false });
        inner.scale.z = 0.3;
        pivot.add(inner);
        const tip = new THREE.Group();
        tip.position.y = 0.24;
        pivot.add(tip);
        const upper = mesh(capsule(0.058, 0.13), fur, 0, 0.1, 0);
        upper.scale.z = 0.5;
        tip.add(upper);
        const inner2 = mesh(capsule(0.034, 0.1), pink, 0, 0.1, 0.022, { cast: false });
        inner2.scale.z = 0.3;
        tip.add(inner2);
        this.ears.push({ pivot, tip, s });
      } else if (sp.ears === 'round') {
        const [lat, lon] = sp.earPos || [0.72, 0.72];
        const k = sp.earSize || 1;
        placeOn(pivot, C, R, lat, s * lon, 0.03);
        pivot.quaternion.identity();
        pivot.rotation.z = -s * 0.25;
        const ear = mesh(sphere(0.09), fur);
        ear.scale.set(k, k, 0.5 * k);
        pivot.add(ear);
        const innerMat = sp.dark ? mats.fur('#4a4a52') : sp.tail === 'thin' ? pink : light;
        const inner = mesh(sphere(0.055), innerMat, 0, -0.005, 0.03 * k, { cast: false });
        inner.scale.set(k, k, 0.35 * k);
        pivot.add(inner);
        this.ears.push({ pivot, s });
      } else if (sp.ears === 'elephant') {
        placeOn(pivot, C, R, 0.15, s * 1.25, -0.02);
        pivot.quaternion.identity();
        const flap = new THREE.Group();
        pivot.add(flap);
        const ear = mesh(sphere(0.2, 40, 28), fur, s * 0.15, -0.02, -0.03);
        ear.scale.set(1, 1.15, 0.18);
        flap.add(ear);
        const inner = mesh(sphere(0.15, 32, 20), pink, s * 0.15, -0.03, 0.0, { cast: false });
        inner.scale.set(1, 1.15, 0.1);
        flap.add(inner);
        this.ears.push({ pivot, flap, s });
      } else if (sp.ears === 'pointy') {
        placeOn(pivot, C, R, 0.82, s * 0.5, -0.03);
        pivot.rotateX(Math.PI / 2 - 0.25);
        const ear = mesh(geo('catEar', () => new THREE.ConeGeometry(0.1, 0.19, 24)), fur, 0, 0.07, 0);
        ear.scale.z = 0.5;
        pivot.add(ear);
        const inner = mesh(geo('catEarIn', () => new THREE.ConeGeometry(0.06, 0.13, 20)), pink, 0, 0.06, 0.025, { cast: false });
        inner.scale.z = 0.3;
        pivot.add(inner);
        this.ears.push({ pivot, s });
      } else if (sp.ears === 'floppy') {
        placeOn(pivot, C, R, 0.6, s * 0.95, -0.02);
        pivot.quaternion.identity();
        const hang = new THREE.Group();
        pivot.add(hang);
        const ear = mesh(capsule(0.075, 0.14), light === fur ? fur : mats.fur('#' + new THREE.Color(this.cast.color || sp.color).multiplyScalar(0.7).getHexString()), 0, -0.12, 0);
        ear.scale.z = 0.35;
        hang.add(ear);
        this.ears.push({ pivot, hang, s });
      } else if (this.human) {
        placeOn(pivot, C, R, 0.0, s * 1.55, -0.012);
        const ear = mesh(sphere(0.05), this.skinMat);
        ear.scale.set(0.8, 1, 0.45);
        pivot.add(ear);
      }
      head.add(pivot);
    }
  }

  buildTurban(head, C, R, saffron, hairMat) {
    // a little hair showing at the sides, then the wrapped safa
    for (const s of [-1, 1]) {
      const side = mesh(sphere(0.06, 20, 14), hairMat, s * 0.2, 0.02, -0.06);
      side.scale.set(0.6, 1, 1);
      head.add(side);
    }
    // crown: a cap that stays above the forehead
    const dome = mesh(geo('safaDome', () => new THREE.SphereGeometry(R * 1.06, 48, 24, 0, Math.PI * 2, 0, 1.0)), saffron, 0, 0.06, -0.02);
    dome.rotation.x = -0.3;
    dome.scale.set(1.05, 1.05, 1.02);
    head.add(dome);
    // even wraps that cross a little, like cloth wound round
    for (let i = 0; i < 3; i++) {
      const band = mesh(geo(`safa${i}`, () => new THREE.TorusGeometry(R * (1.0 - i * 0.03), 0.045, 12, 48)), saffron, 0, 0.15 + i * 0.05, -0.03 - i * 0.01);
      band.rotation.x = Math.PI / 2 + 0.2;
      band.rotation.z = (i - 1) * 0.12;
      band.scale.set(1.03, 1, 1);
      head.add(band);
    }
    // pleated knot on the front
    const knot = mesh(sphere(0.06, 20, 14), saffron, 0, 0.2, 0.235);
    knot.scale.set(1.3, 0.8, 0.45);
    head.add(knot);
    const tail = mesh(new THREE.BoxGeometry(0.1, 0.22, 0.02), saffron, 0.05, 0.02, -0.26);
    tail.rotation.set(0.25, 0, 0.1);
    head.add(tail);
  }

  buildGarlands(body) {
    const bodyR = (y) => {
      for (let i = 1; i < KURTA.length; i++) {
        const [r1, y1] = KURTA[i - 1], [r2, y2] = KURTA[i];
        if (y >= y1 && y <= y2) return lerp(r1, r2, (y - y1) / (y2 - y1 || 1));
      }
      return 0.14;
    };
    for (const [drop, n, pattern] of [[0.24, 46, (i) => (i % 4 === 3 ? JASMINE() : MARIGOLD())], [0.15, 38, () => JASMINE()]]) {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 - Math.PI;
        const w = Math.max(0, Math.cos(a)) ** 1.4;
        const y = 0.34 - drop * w;
        const mat = pattern(i), small = mat === JASMINE();
        const r = Math.max(bodyR(y), 0.1) + (small ? 0.02 : 0.03);
        const bead = mesh(sphere(small ? 0.02 : 0.03, 12, 8), mat, Math.sin(a) * r, y, Math.cos(a) * r * 1.05, { cast: i % 2 === 0 });
        body.add(bead);
      }
    }
  }

  buildHair(head, C, R, hairMat, accentMat) {
    const style = this.sp.hairStyle || 'short';
    const girly = ['pigtails', 'long', 'bun'].includes(style);
    if (style === 'shikha') {
      // pandit: shaved head with the traditional tuft (shikha) at the back of the crown
      const knot = mesh(sphere(0.035, 14, 10), hairMat, 0, R * 0.98, -R * 0.32);
      head.add(knot);
      const tail = mesh(capsule(0.016, 0.07), hairMat, 0, R * 0.85, -R * 0.48);
      tail.rotation.x = 0.9;
      head.add(tail);
      return;
    }
    if (style === 'bald') {
      // grandpa: a fringe of hair round the back and sides only
      const ring = mesh(geo('baldRing', () => new THREE.TorusGeometry(R * 0.92, 0.06, 12, 40, Math.PI * 1.3)), hairMat, 0, 0.0, -0.01);
      ring.rotation.order = 'YXZ'; // lay it flat, then turn the arc to the back
      ring.rotation.set(-Math.PI / 2, -0.47, 0);
      head.add(ring);
      return;
    }
    const capMesh = mesh(geo(style === 'baby' ? 'hairCapBaby' : 'hairCap', () => new THREE.SphereGeometry(R * 1.055, 64, 32, 0, Math.PI * 2, 0, style === 'baby' ? 0.85 : 1.3)), hairMat);
    capMesh.rotation.x = -0.5;
    capMesh.scale.set(1.04, 1, 1.02);
    head.add(capMesh);
    if (style === 'baby') {
      const curl = mesh(geo('babyCurl', () => new THREE.TorusGeometry(0.04, 0.014, 8, 20, Math.PI * 1.5)), hairMat, 0, R * 1.04, 0.03);
      curl.rotation.y = Math.PI / 2;
      head.add(curl);
      return;
    }
    const tufts = girly
      ? [[0.72, -0.25, 0.09], [0.78, 0.2, 0.085], [0.7, 0.02, 0.07]]
      : [[0.75, -0.2, 0.08], [0.8, 0.12, 0.085], [0.68, 0.3, 0.07], [0.9, -0.05, 0.09]];
    for (const [lat, lon, r] of tufts) {
      const t = mesh(sphere(r, 24, 16), hairMat);
      placeOn(t, C, R, lat, lon, -r * 0.35);
      t.scale.set(1.2, 0.8, 0.9);
      head.add(t);
    }
    if (style === 'long') {
      const back = mesh(capsule(0.17, 0.2), hairMat, 0, -0.1, -0.15);
      back.scale.set(1.28, 1, 0.62);
      head.add(back);
      for (const s of [-1, 1]) {
        const side = mesh(capsule(0.06, 0.18), hairMat, s * 0.22, -0.08, -0.04);
        side.rotation.z = s * 0.08;
        head.add(side);
      }
    } else if (style === 'bun') {
      head.add(mesh(sphere(0.1, 24, 16), hairMat, 0, 0.1, -0.24));
    }
    if (style === 'pigtails') {
      for (const s of [-1, 1]) {
        const tail = new THREE.Group();
        placeOn(tail, C, R, 0.35, s * 1.75, 0.0);
        tail.quaternion.identity();
        tail.add(mesh(sphere(0.02), accentMat, 0, 0, 0));
        const bunch = mesh(sphere(0.085, 24, 16), hairMat, s * 0.06, -0.05, 0);
        bunch.scale.set(1, 1.3, 1);
        tail.add(bunch);
        head.add(tail);
      }
    }
  }

  buildTail(body, fur, light) {
    const { sp } = this;
    this.tail = null;
    if (sp.tail === 'puff') body.add(mesh(sphere(0.07), light, 0, 0.02, -0.16));
    else if (sp.tail === 'stub') body.add(mesh(sphere(0.045), fur, 0, 0.0, -0.17));
    else if (sp.tail === 'curly') {
      const curl = mesh(geo('curlTail', () => new THREE.TorusGeometry(0.035, 0.012, 10, 24, Math.PI * 1.6)), fur, 0, 0.04, -0.18);
      curl.rotation.y = Math.PI / 2;
      body.add(curl);
    } else if (sp.tail === 'bushy') {
      const segs = [];
      let parent = new THREE.Group();
      parent.position.set(0, 0.02, -0.15);
      body.add(parent);
      for (let i = 0; i < 4; i++) {
        const seg = new THREE.Group();
        if (i) seg.position.y = 0.08;
        parent.add(seg);
        const r = [0.045, 0.07, 0.08, 0.06][i];
        const m = mesh(sphere(r, 20, 14), i === 3 ? mats.fur('#fff7ee') : fur, 0, 0.05, 0);
        m.scale.y = 1.3;
        seg.add(m);
        segs.push(seg);
        parent = seg;
      }
      this.tail = segs;
    } else if (sp.tail === 'thin' || sp.tail === 'tuft') {
      const segs = [];
      let parent = new THREE.Group();
      parent.position.set(0, 0.02, -0.15);
      body.add(parent);
      const thinMat = sp.tail === 'thin' ? mats.fur(sp.nose) : fur;
      for (let i = 0; i < 7; i++) {
        const seg = new THREE.Group();
        if (i) seg.position.y = 0.055;
        parent.add(seg);
        seg.add(mesh(capsule(0.012, 0.04), thinMat, 0, 0.028, 0));
        segs.push(seg);
        parent = seg;
      }
      if (sp.tail === 'tuft') parent.add(mesh(sphere(0.04, 16, 12), mats.fur(this.cast.hair || sp.hair), 0, 0.07, 0));
      this.tail = segs;
    } else if (sp.tail === 'long' || sp.tail === 'wag') {
      const segs = [];
      let parent = new THREE.Group();
      parent.position.set(0, 0.02, -0.15);
      body.add(parent);
      const n = sp.tail === 'long' ? 6 : 3;
      for (let i = 0; i < n; i++) {
        const seg = new THREE.Group();
        if (i) seg.position.y = 0.06;
        parent.add(seg);
        seg.add(mesh(capsule(0.028 - i * 0.002, 0.04), fur, 0, 0.03, 0));
        segs.push(seg);
        parent = seg;
      }
      this.tail = segs;
    }
  }

  setProp(kind) {
    if (this.propKind === kind) return;
    this.propKind = kind;
    if (this.prop) this.prop.removeFromParent();
    this.prop = kind && kind !== 'none' ? buildProp(kind) : null;
    if (!this.prop) return;
    if (this.prop.userData.onBody) {
      // resting against the body: bowl on the right knee, neck over the left shoulder
      this.prop.position.set(-0.1, -0.02, 0.2);
      this.prop.rotation.set(0.2, 0, -0.85);
      this.body.add(this.prop);
    } else if (this.prop.userData.mount === 'back') {
      this.body.add(this.prop);
    } else {
      this.arms[0].grip.add(this.prop);
    }
  }

  /** Second hand (left): only actions put things there, e.g. the bowl while eating. */
  setProp2(kind) {
    if (this.prop2Kind === kind) return;
    this.prop2Kind = kind;
    if (this.prop2) this.prop2.removeFromParent();
    this.prop2 = kind ? buildProp(kind) : null;
    if (this.prop2) this.arms[1].grip.add(this.prop2);
  }

  /** Pick what's in the hands for this action: the action's own tools, or what the actor holds. */
  equip(action, holds) {
    const need = ACTION_PROPS[action];
    let right = holds && holds !== 'none' ? holds : null;
    if (need && (need.force || !right)) right = need.right;
    this.setProp(right);
    this.setProp2(need?.left && right === need.right ? need.left : null);
  }

  headWorld(target) {
    return this.head.getWorldPosition(target).add(tmpV.set(0, 0.02, 0));
  }

  /** Where the camera aims for close-ups: steady eye height, lower when sitting, the head when lying. */
  focus(out) {
    if (this.lying) return this.head.getWorldPosition(out);
    this.rig.getWorldPosition(out);
    out.y = this.root.position.y + this.height * 0.82 + this.low;
    return out;
  }

  get height() { return this.sp.adult ? 1.5 : this.sp.baby ? 0.92 : 1.15; }

  // ---------- animation ----------
  /**
   * ctx: { t, action, actionStart, walking: {phase, speed} | null, lookAt: Vector3 | null,
   *        face: {brow,tilt,upper,lower,smile,open}, talk: 0..1 amplitude, speaking: bool }
   */
  update(ctx) {
    const t = ctx.t;
    const sd = this.seed;
    const p = {
      bodyY: 0, lean: 0, twist: 0, roll: 0, squash: 1, rootY: 0, spin: 0,
      nod: 0, tilt: 0, turn: 0,
      arms: [
        { raise: 0.13, fwd: 0.05, elbowZ: 0.05, elbowX: -0.25 },
        { raise: 0.13, fwd: 0.05, elbowZ: 0.05, elbowX: -0.25 },
      ],
      legs: [0, 0], rigX: 0, rigY: 0, rigZ: 0, rigYaw: 0, rigPitch: 0, legCross: 0, legSpread: 0,
    };
    // idle life: breathing, weight shift, fidgets
    const breath = Math.sin(t * 2.1 + sd);
    p.bodyY = breath * 0.004;
    p.squash = 1 + breath * 0.012;
    p.roll = wobble(t * 0.35, sd) * 0.04;
    p.twist = wobble(t * 0.25, sd + 3) * 0.06;
    if (this.sp.elder) { p.lean = 0.08; p.nod = -0.06; } // a little stooped
    for (const [i, a] of p.arms.entries()) { a.raise += wobble(t * 0.5, sd + i * 5) * 0.05; a.fwd += wobble(t * 0.4, sd + i * 9) * 0.08; }

    const at = Math.max(0, t - (ctx.actionStart || 0));
    const blend = smoothstep(0, 0.35, at);
    this.showGear(ctx.walking ? null : ctx.action);
    const A = ctx.walking ? null : this.actionPose(ctx.action, at, ctx);
    if (A) mixPose(p, A, blend);
    this.A = A;
    this.lying = !!A?.lying && blend > 0.5;
    this.low = (A?.low || 0) * blend * this.rig.scale.y;
    this.faceMod = { mouth: (A?.mouth || 0) * blend, eyes: (A?.eyesClosed || 0) * blend };

    // hands busy with a prop: hold it up a bit
    if (this.prop?.userData.onBody && !['wave', 'cheer', 'jump', 'dance', 'spin', 'run', 'runjump', 'swing', 'slide', 'clap'].includes(ctx.action)) {
      // hold the sitar: left hand up on the neck, right hand at the strings (strumming while playing)
      const strum = ctx.action === 'sitar' ? Math.sin(t * 9) * 0.12 : 0;
      mixPose(p, { arms: [{ raise: 0.15, fwd: 0.75 + strum, elbowZ: -0.35, elbowX: -1.0 }, { raise: 0.55, fwd: 1.05, elbowZ: 0.3, elbowX: -1.35 }] }, 1);
    } else if (this.prop && !this.prop.userData.onBody && !this.prop.userData.mount && ['idle', 'sad', 'think', 'shrug'].includes(ctx.action)) {
      mixPose(p, { arms: [{ raise: 0.25, fwd: 0.65, elbowZ: 0.1, elbowX: -1.0 }, null] }, 1);
    }

    // talking gestures
    if (ctx.speaking && ['idle', 'think', 'point', 'sad', 'shrug'].includes(ctx.action)) {
      const g = ctx.talk;
      const arm = this.prop && !this.prop.userData.mount ? 1 : ((Math.floor(t / 2.3) + sd) % 2);
      mixPose(p, { arms: arm === 0 ? [{ raise: 0.3 + wobble(t * 1.2, sd) * 0.2, fwd: 0.6 + wobble(t * 1.5, sd + 1) * 0.35, elbowZ: 0.2, elbowX: -1.2 + g * 0.3 }, null]
        : [null, { raise: 0.3 + wobble(t * 1.2, sd) * 0.2, fwd: 0.6 + wobble(t * 1.5, sd + 1) * 0.35, elbowZ: 0.2, elbowX: -1.2 + g * 0.3 }] }, 0.8);
      p.nod += g * 0.06 + wobble(t * 3, sd) * 0.03;
    }

    // a gesture the words ask for ("Bye!" waves, "Yes!" nods), on top of the shot's action
    const G = ctx.gesture && !ctx.walking && !A?.lying && !A?.walk && this.gesturePose(ctx.gesture, ctx.action, ctx);
    if (G) mixPose(p, G, ctx.gesture.k);

    // body language for a laugh / gasp / sob / sigh while it sounds
    const V = ctx.vocal && !ctx.walking && !A?.lying && this.vocalPose(ctx.vocal, t, ctx.action);
    if (V) mixPose(p, V, ctx.vocal.k);

    // walking overrides legs/arms (also used by the run actions)
    const walk = ctx.walking || A?.walk;
    if (walk) {
      const { phase, speed } = walk;
      const amp = speed > 2 ? 0.8 : 0.55;
      const sw = Math.sin(phase);
      p.legs = [sw * amp, -sw * amp];
      if (!A?.keepArms) {
        p.arms[0].fwd = -sw * amp * 0.8; p.arms[0].raise = 0.15; p.arms[0].elbowX = speed > 2 ? -1.2 : -0.35;
        p.arms[1].fwd = sw * amp * 0.8; p.arms[1].raise = 0.15; p.arms[1].elbowX = speed > 2 ? -1.2 : -0.35;
      }
      p.bodyY = Math.abs(Math.cos(phase)) * (speed > 2 ? 0.05 : 0.025);
      p.lean = A?.lean ?? (speed > 2 ? 0.2 : 0.06);
      p.roll = sw * (A?.walkRoll ?? 0.04);
      p.spin = 0;
    }
    if (A?.air) {
      mixPose(p, { legs: [0.9, 0.35], arms: [0, 1].map(() => ({ raise: 2.3, fwd: 0.3, elbowZ: 0.2, elbowX: -0.2 })) }, A.air);
    }

    this.applyPose(p, ctx, t);
    this.applyFace(ctx.face, t, ctx);
    this.secondary(t, p, ctx);
  }

  actionPose(action, t, ctx) {
    const TAU = Math.PI * 2;
    switch (action) {
      case 'wave': return {
        tilt: 0.12, roll: -0.04,
        arms: [{ raise: 1.3, fwd: 0.25, elbowZ: 1.05 + Math.sin(t * 9) * 0.45, elbowX: -0.1 }, null],
      };
      case 'cheer': {
        const b = Math.abs(Math.sin(t * 5));
        return { rootY: b * 0.08, squash: 1 - b * 0.03, nod: -0.12,
          arms: [0, 1].map(() => ({ raise: 2.6 + Math.sin(t * 10) * 0.15, fwd: 0.2, elbowZ: 0.25, elbowX: -0.1 })) };
      }
      case 'jump': {
        const k = (t % 1.3) / 1.3;
        const air = k > 0.3 ? Math.sin(((k - 0.3) / 0.7) * Math.PI) : 0;
        const crouch = k <= 0.3 ? Math.sin((k / 0.3) * Math.PI) : 0;
        return { rootY: air * 0.5, squash: 1 - crouch * 0.12 + air * 0.06, lean: crouch * 0.2,
          legs: [crouch * -0.3 + air * 0.35, crouch * -0.3 + air * 0.2],
          arms: [0, 1].map(() => ({ raise: 0.3 + air * 2.2, fwd: crouch * -0.5, elbowZ: 0.2, elbowX: -0.2 })) };
      }
      case 'dance': {
        const beat = t * Math.PI * 2; // 1 beat/sec, doubled below
        return { bodyY: Math.abs(Math.sin(beat)) * 0.05, roll: Math.sin(beat) * 0.12, twist: Math.sin(beat / 2) * 0.35, nod: Math.abs(Math.sin(beat)) * 0.1,
          legs: [Math.max(0, Math.sin(beat)) * -0.4, Math.max(0, -Math.sin(beat)) * -0.4],
          arms: [
            { raise: 1.0 + Math.sin(beat) * 0.5, fwd: 0.4, elbowZ: 1.3, elbowX: -0.2 },
            { raise: 1.0 - Math.sin(beat) * 0.5, fwd: 0.4, elbowZ: 1.3, elbowX: -0.2 },
          ] };
      }
      case 'laugh': return {
        roll: Math.sin(t * 22) * 0.025, lean: -0.1 + Math.sin(t * 11) * 0.04, nod: -0.15 + Math.sin(t * 11) * 0.05,
        squash: 1 + Math.sin(t * 22) * 0.015,
        arms: [0, 1].map(() => ({ raise: 0.2, fwd: 0.95, elbowZ: -0.35, elbowX: -1.35 })),
      };
      case 'sad': return {
        lean: 0.14, nod: 0.3, bodyY: -0.01, squash: 0.97,
        arms: [0, 1].map(() => ({ raise: 0.05, fwd: 0.12, elbowZ: 0, elbowX: -0.1 })),
      };
      case 'think': return {
        tilt: 0.16, nod: -0.12, turn: 0.15,
        arms: [{ raise: 0.35, fwd: 1.05, elbowZ: -0.3, elbowX: -2.25 }, { raise: 0.12, fwd: 0.75, elbowZ: -0.5, elbowX: -1.5 }],
      };
      case 'point': return {
        lean: 0.05,
        arms: [{ raise: 0.35, fwd: 1.45, elbowZ: 0, elbowX: -0.08 }, null],
      };
      case 'clap': {
        const c = Math.sin(t * 13);
        return { bodyY: Math.abs(c) * 0.008,
          arms: [0, 1].map(() => ({ raise: 0.2, fwd: 1.05, elbowZ: -0.55 - c * 0.2, elbowX: -1.15 })) };
      }
      case 'shrug': {
        const k = Math.sin(clamp((t % 2.6) / 1.1, 0, 1) * Math.PI);
        return { tilt: k * 0.2, bodyY: k * 0.015,
          arms: [0, 1].map(() => ({ raise: 0.25 + k * 0.45, fwd: 0.3, elbowZ: 0.3 + k * 0.5, elbowX: -1.4 })) };
      }
      case 'spin': return {
        spin: t * 5, rootY: Math.abs(Math.sin(t * 5)) * 0.04,
        arms: [0, 1].map(() => ({ raise: 1.35, fwd: 0, elbowZ: 0.1, elbowX: 0 })),
      };
      case 'run': case 'runjump': {
        const w = (Math.PI * 2) / 3.4, c = Math.cos(t * w);
        const air = action === 'runjump' ? smoothstep(0.72, 1, Math.abs(c)) : 0;
        return {
          rigX: 1.3 * Math.sin(t * w), rigYaw: (Math.PI / 2) * clamp(c * 3, -1, 1),
          walk: { phase: t * 10, speed: 3.4 }, rootY: Math.sin(air * Math.PI / 2) * 0.5, air,
        };
      }
      case 'swing': {
        const phi = -0.55 * Math.sin((t * TAU) / 2.6);
        const g = this.gear.swing;
        if (g) g.userData.pivot.rotation.x = phi;
        const L = SWING.len;
        return {
          rigZ: -L * Math.sin(phi), rootY: SWING.top - L * Math.cos(phi) + 0.05 - 0.3,
          lean: phi - 0.12, nod: -phi * 0.3,
          legs: [1, 1].map(() => 1.25 - 0.35 * Math.cos((t * TAU) / 2.6)),
          arms: [0, 1].map(() => ({ raise: 0.12, fwd: 2.85, elbowZ: 0, elbowX: 0.15 })),
        };
      }
      case 'slide': return slidePose(t % 5);
      case 'sitcross': case 'sitar': {
        const sway = ctx.action === 'sitar' ? Math.sin(t * 1.3) * 0.04 : 0;
        return { rootY: -0.245, low: -0.245, bodyY: 0, squash: 1, lean: 0.02, roll: sway, nod: 0.05 + sway * 0.5, legs: [1.45, 1.45], legCross: 0.75,
          arms: [0, 1].map(() => ({ raise: 0.22, fwd: 0.55, elbowZ: -0.2, elbowX: -0.9 })) };
      }
      // ---------- dance steps ----------
      case 'bhangra': {
        const b = t * TAU * 1.1, hop = Math.abs(Math.sin(b));
        return { rootY: hop * 0.06, bodyY: Math.sin(b * 2) * 0.01, roll: Math.sin(b) * 0.06, nod: Math.sin(b * 2) * 0.08,
          legs: [Math.max(0, Math.sin(b)) * -0.7, Math.max(0, -Math.sin(b)) * -0.7],
          arms: [0, 1].map((i) => ({ raise: 2.5 + Math.sin(b * 2 + i * Math.PI) * 0.2, fwd: 0.2, elbowZ: 0.9 + Math.sin(b * 2) * 0.3, elbowX: -0.2 })) };
      }
      case 'disco': {
        const b = t * TAU * 0.9, up = Math.sin(b) > 0;
        return { roll: up ? -0.1 : 0.1, bodyY: Math.abs(Math.sin(b)) * 0.02, twist: up ? -0.2 : 0.2,
          legs: [up ? -0.2 : 0, up ? 0 : -0.2],
          arms: [up ? { raise: 2.8, fwd: 0.4, elbowZ: 0, elbowX: 0 } : { raise: 0.5, fwd: -0.2, elbowZ: 0, elbowX: 0 },
            { raise: 0.3, fwd: 0.2, elbowZ: 0.6, elbowX: -1.4 }] };
      }
      case 'twist': {
        const b = t * TAU * 1.3;
        return { twist: Math.sin(b) * 0.55, bodyY: -0.03 + Math.abs(Math.sin(b)) * 0.01, lean: 0.08,
          legs: [Math.sin(b) * 0.15, -Math.sin(b) * 0.15],
          arms: [0, 1].map((i) => ({ raise: 0.45, fwd: 0.6 + (i ? -1 : 1) * Math.sin(b) * 0.3, elbowZ: 0.4, elbowX: -1.4 })) };
      }
      case 'hiphop': {
        const b = t * TAU * 1.2, k = Math.abs(Math.sin(b));
        return { bodyY: -k * 0.04, squash: 1 - k * 0.04, nod: k * 0.2, lean: 0.06, roll: Math.sin(b / 2) * 0.08,
          rigX: Math.sin(b / 4) * 0.25,
          legs: [k * -0.3, k * -0.3],
          arms: [0, 1].map((i) => ({ raise: 0.6 + k * 0.4, fwd: 0.9 + (i ? 0.3 : -0.3) * Math.sin(b / 2), elbowZ: 0.8, elbowX: -1.2 })) };
      }
      case 'robot': {
        const step = Math.floor(t * 2.5) % 4;
        const poses = [
          [{ raise: 1.57, fwd: 0, elbowZ: 1.57, elbowX: 0 }, { raise: 0.1, fwd: 0, elbowZ: 0, elbowX: 0 }],
          [{ raise: 0.1, fwd: 1.57, elbowZ: 0, elbowX: -1.57 }, { raise: 0.1, fwd: 1.57, elbowZ: 0, elbowX: -1.57 }],
          [{ raise: 0.1, fwd: 0, elbowZ: 0, elbowX: 0 }, { raise: 1.57, fwd: 0, elbowZ: 1.57, elbowX: 0 }],
          [{ raise: 1.57, fwd: 0, elbowZ: 0, elbowX: 0 }, { raise: 1.57, fwd: 0, elbowZ: 0, elbowX: 0 }],
        ];
        return { turn: [0.4, 0, -0.4, 0][step], twist: [0.2, 0, -0.2, 0][step], arms: poses[step] };
      }
      case 'twirl': {
        const k = (t % 3) / 3, spinK = smoothstep(0.1, 0.6, k);
        return { rigYaw: spinK * TAU, rootY: Math.sin(spinK * Math.PI) * 0.06, bodyY: 0.02,
          legs: [0, -0.5 * Math.sin(spinK * Math.PI)],
          arms: [{ raise: 2.7, fwd: 0.3, elbowZ: 0.9, elbowX: 0 }, { raise: 1.4, fwd: 0.2, elbowZ: 0.6, elbowX: 0 }] };
      }
      case 'sidestep': {
        const b = t * TAU * 0.6, k = Math.sin(b);
        return { rigX: k * 0.45, roll: -Math.cos(b) * 0.1, bodyY: Math.abs(Math.cos(b)) * 0.02,
          legs: [Math.max(0, Math.cos(b)) * -0.35, Math.max(0, -Math.cos(b)) * -0.35],
          arms: [0, 1].map(() => ({ raise: 0.5, fwd: 0.4, elbowZ: 0.4 + Math.abs(Math.sin(b * 2)) * 0.5, elbowX: -1.2 })),
          nod: Math.abs(Math.sin(b * 2)) * 0.08 };
      }

      // ---------- everyday gestures ----------
      case 'cry': {
        const sob = Math.abs(Math.sin(t * 7));
        this.animateTears(t);
        return { nod: 0.22, lean: 0.06, bodyY: sob * 0.012, squash: 1 - sob * 0.02, roll: Math.sin(t * 3.5) * 0.03, mouth: 0.3 + sob * 0.25,
          arms: [{ raise: 0.35, fwd: 1.05, elbowZ: -0.2, elbowX: -2.45 + Math.sin(t * 6) * 0.1 }, { raise: 0.1, fwd: 0.15, elbowZ: 0, elbowX: -0.2 }] };
      }
      case 'yes': return { nod: 0.05 + Math.sin(t * 7) * 0.17 * (t % 2.4 < 1.5 ? 1 : 0.15) };
      case 'no': return { turn: Math.sin(t * 7) * 0.38 * (t % 2.4 < 1.5 ? 1 : 0.1), nod: 0.05 };
      case 'lookaround': return { turn: Math.sin(t * 1.3) * 0.75, twist: Math.sin(t * 1.3) * 0.18, nod: -0.06,
        arms: [{ raise: 0.55, fwd: 1.2, elbowZ: -0.15, elbowX: -2.4 }, null] };
      case 'stomp': {
        const b = t * TAU * 1.1;
        return { bodyY: -Math.abs(Math.sin(b)) * 0.02, roll: Math.sin(b) * 0.05, nod: 0.1,
          legs: [Math.max(0, Math.sin(b)) * 0.45, Math.max(0, -Math.sin(b)) * 0.45],
          arms: [0, 1].map((i) => ({ raise: 0.35, fwd: -0.05 + Math.sin(b * 2 + i) * 0.08, elbowZ: 0.1, elbowX: -0.6 })) };
      }
      case 'bow': {
        const k = Math.sin(clamp((t % 3) / 1.6, 0, 1) * Math.PI);
        return { lean: k * 0.45, nod: k * 0.3, arms: [0, 1].map(() => ({ raise: 0.08, fwd: 0.1 + k * 0.4, elbowZ: 0, elbowX: -0.1 })) };
      }
      case 'namaste': return { nod: 0.1 + Math.sin(t * 1.2) * 0.04, lean: 0.04,
        arms: [0, 1].map(() => ({ raise: 0.22, fwd: 0.95, elbowZ: -0.72, elbowX: -1.6 })) };
      case 'salute': return { lean: -0.03, nod: -0.04, legs: [0, 0],
        tilt: -0.08, arms: [{ raise: 1.55, fwd: 0.7, elbowZ: 2.3, elbowX: -0.2 }, { raise: 0.05, fwd: 0.0, elbowZ: 0, elbowX: 0 }] };
      case 'sick': return { lean: 0.18, nod: 0.25, roll: Math.sin(t * 1.5) * 0.05, bodyY: -0.01,
        arms: [0, 1].map(() => ({ raise: 0.12, fwd: 0.6, elbowZ: -0.75, elbowX: -1.2 })) };
      case 'yawn': {
        const k = Math.sin(clamp((t % 4.5) / 2.6, 0, 1) * Math.PI);
        return { lean: -0.12 * k, nod: -0.3 * k, mouth: 0.9 * k, eyesClosed: k, rootY: k * 0.02,
          arms: [0, 1].map(() => ({ raise: 0.3 + 2.4 * k, fwd: 0.25, elbowZ: 0.4 * k, elbowX: -0.5 * k })) };
      }

      // ---------- baby ----------
      case 'crawl': {
        const w = TAU / 10, s = Math.sin(t * 5);
        return { rigX: 0.7 * Math.sin(t * w), rigYaw: (Math.PI / 2) * clamp(Math.cos(t * w) * 3, -1, 1),
          lean: 1.22, rootY: -0.02, low: -0.35, bodyY: Math.abs(s) * 0.012, nod: -1.0, roll: s * 0.05, squash: 1,
          legs: [-0.2 + s * 0.25, -0.2 - s * 0.25],
          arms: [{ raise: 0.18, fwd: 1.22 - s * 0.3, elbowZ: 0, elbowX: -0.05 }, { raise: 0.18, fwd: 1.22 + s * 0.3, elbowZ: 0, elbowX: -0.05 }] };
      }
      case 'firststeps': {
        const w = TAU / 9, ph = t * 6;
        return { rigX: 0.6 * Math.sin(t * w), rigYaw: (Math.PI / 2) * clamp(Math.cos(t * w) * 3, -1, 1),
          walk: { phase: ph, speed: 0.8 }, walkRoll: 0.13, keepArms: true, lean: -0.02,
          arms: [0, 1].map((i) => ({ raise: 1.15 + Math.sin(ph + i * 2) * 0.2, fwd: 0.45, elbowZ: 0.3, elbowX: -0.35 })) };
      }
      case 'rattle': {
        const sh = Math.sin(t * 13);
        return { ...SIT_FLOOR, bodyY: Math.abs(Math.sin(t * 3)) * 0.012, roll: Math.sin(t * 3) * 0.05, propTilt: [sh * 0.35, 0, 0],
          arms: [{ raise: 0.45, fwd: 1.4 + sh * 0.22, elbowZ: 0.1, elbowX: -0.8 }, SIT_FLOOR.arms[1]] };
      }
      case 'bottle': return { ...SIT_FLOOR, nod: -0.22, mouth: 0.12 + Math.abs(Math.sin(t * 5)) * 0.08, propTilt: [-1.2, 0, 0],
        arms: [{ ...TO_MOUTH, fwd: 1.05, elbowX: -2.0 }, { raise: 0.32, fwd: 1.05, elbowZ: -0.45, elbowX: -1.9 }] };

      // ---------- daily life ----------
      case 'walkaround': {
        const w = TAU / 7;
        return { rigX: 1.1 * Math.sin(t * w), rigYaw: (Math.PI / 2) * clamp(Math.cos(t * w) * 3, -1, 1), walk: { phase: t * 7, speed: 1.3 } };
      }
      case 'cart': {
        const w = TAU / 9;
        return { rigX: 1.0 * Math.sin(t * w), rigYaw: (Math.PI / 2) * clamp(Math.cos(t * w) * 3, -1, 1), walk: { phase: t * 5.5, speed: 1.0 },
          keepArms: true, lean: 0.12, arms: [0, 1].map(() => ({ raise: 0.2, fwd: 1.42, elbowZ: -0.2, elbowX: -0.2 })) };
      }
      case 'sitfloor': return SIT_FLOOR;
      case 'sitchair': return { ...SIT_CHAIR, arms: [0, 1].map(() => ({ raise: 0.2, fwd: 0.75, elbowZ: -0.25, elbowX: -0.55 })) };
      case 'sleep': {
        const sc = this.rig.scale.x, g = this.gear.bed;
        if (g) g.rotation.y = Math.PI / 2; // bed sideways to the camera so we see the sleeper
        if (g) g.userData.zs.forEach((z, i) => {
          const k = (t * 0.35 + i / 3) % 1;
          z.position.set(0.15 + Math.sin(k * 5 + i) * 0.08, 0.75 + k * 0.7, -0.45 + k * 0.1);
          z.scale.setScalar(0.08 + k * 0.12);
          z.material.opacity = Math.sin(k * Math.PI);
        });
        return { rigPitch: -Math.PI / 2, rigYaw: Math.PI / 2, rigY: BED.rest * sc, rigX: BED.feet * sc, lying: true, noLook: true, eyesClosed: 1,
          squash: 1 + Math.sin(t * 1.6) * 0.025, bodyY: 0, roll: 0, twist: 0, nod: 0, legs: [0, 0], mouth: 0.04,
          arms: [0, 1].map(() => ({ raise: 0.1, fwd: 0.4, elbowZ: -0.55, elbowX: -1.45 })) };
      }
      case 'eat': {
        const u = (t % 2.4) / 2.4;
        const k = smoothstep(0.22, 0.48, u) * (1 - smoothstep(0.72, 0.95, u));
        const chew = u > 0.72 || u < 0.15 ? 0.1 + Math.abs(Math.sin(t * 9)) * 0.18 : 0;
        return { nod: lerp(0.3, 0.02, k), lean: 0.04, mouth: Math.max(chew, k > 0.8 ? 0.45 : 0), propTilt: [lerp(0.5, -1.45, k), 0, 0],
          arms: [mixArm({ raise: 0.25, fwd: 0.88, elbowZ: -0.5, elbowX: -0.95 }, TO_MOUTH, k), { raise: 0.2, fwd: 0.85, elbowZ: -0.6, elbowX: -0.9 }] };
      }
      case 'drink': {
        const u = (t % 3) / 3;
        const k = smoothstep(0.12, 0.38, u) * (1 - smoothstep(0.72, 0.95, u));
        return { nod: lerp(0.06, -0.28, k), propTilt: [lerp(0, -1.25, k), 0, 0],
          arms: [mixArm({ raise: 0.22, fwd: 0.7, elbowZ: -0.2, elbowX: -1.0 }, TO_MOUTH, k), null] };
      }
      case 'brush': {
        const sc = Math.sin(t * 16);
        return { nod: -0.05, mouth: 0.22, propTilt: [-0.85, 0, 0.5], arms: [{ ...TO_MOUTH, elbowZ: -0.3 + sc * 0.13 }, null] };
      }
      case 'washhands': {
        const r = Math.sin(t * 10);
        return { nod: 0.35, lean: 0.12, arms: [0, 1].map((i) => ({ raise: 0.15, fwd: 1.0, elbowZ: -0.62 + r * 0.12 * (i ? 1 : -1), elbowX: -0.55 })) };
      }
      case 'phone': return { tilt: -0.12, nod: 0.04, turn: Math.sin(t * 0.8) * 0.15,
        arms: [{ raise: 1.15, fwd: 0.55, elbowZ: 0.95, elbowX: -2.1 }, null] };
      case 'cook': {
        const a = t * 4;
        return { nod: 0.35, lean: 0.1, propTilt: [0.15 + Math.sin(a) * 0.12, 0, Math.cos(a) * 0.15],
          arms: [{ raise: 0.3, fwd: 1.1 + Math.sin(a) * 0.1, elbowZ: -0.35 + Math.cos(a) * 0.15, elbowX: -0.75 }, { raise: 0.5, fwd: 0.1, elbowZ: -0.9, elbowX: -1.5 }] };
      }
      case 'sweep': {
        const s = Math.sin(t * 3.2);
        return { twist: s * 0.3, lean: 0.18, nod: 0.35, propTilt: [0.55, 0, s * 0.35],
          arms: [{ raise: 0.25, fwd: 0.95, elbowZ: -0.45, elbowX: -0.8 }, { raise: 0.22, fwd: 0.7, elbowZ: -0.55, elbowX: -0.45 }] };
      }

      // ---------- school ----------
      case 'study': {
        const look = (t % 6) > 4.8 ? 0 : 1; // now and then looks up to think
        return { ...SIT_CHAIR, lean: 0.12, nod: 0.42 * look - 0.05, propTilt: [0.45, 0, 0.3],
          arms: [{ raise: 0.28, fwd: 0.95 + Math.sin(t * 7) * 0.04 * look, elbowZ: -0.45 + Math.sin(t * 11) * 0.05 * look, elbowX: -0.62 },
            { raise: 0.2, fwd: 1.0, elbowZ: -0.7, elbowX: -0.58 }] };
      }
      case 'read': return { nod: 0.32, propTilt: [0.45, 0, 0], tilt: Math.sin(t * 0.7) * 0.05,
        arms: [0, 1].map(() => ({ raise: 0.18, fwd: 0.88, elbowZ: -0.5, elbowX: -1.25 })) };
      case 'raisehand': return { bodyY: Math.abs(Math.sin(t * 5)) * 0.015, rootY: 0.015, tilt: 0.08,
        arms: [{ raise: 2.85, fwd: 0.25 + Math.sin(t * 6) * 0.08, elbowZ: 0.05, elbowX: -0.05 }, null] };
      case 'paint': return { twist: 0.45, nod: 0.05, propTilt: [1.1, 0.6, 0],
        arms: [{ raise: 0.45, fwd: 1.2 + Math.sin(t * 3) * 0.15, elbowZ: 0.25 + Math.sin(t * 4.3) * 0.2, elbowX: -0.5 },
          { raise: 0.25, fwd: 0.7, elbowZ: 0.2, elbowX: -1.2 }] };
      case 'sing': {
        const g = this.gear.notes;
        if (g) g.userData.notes.forEach((n, i) => {
          const k = (t * 0.45 + i / 3) % 1;
          n.position.set(0.3 + Math.sin(k * 6 + i * 2) * 0.08 - i * 0.05, 1.05 + k * 0.6, 0.05);
          n.rotation.z = Math.sin(k * 8 + i) * 0.3;
          n.userData.mat.opacity = Math.sin(k * Math.PI);
        });
        return { roll: Math.sin(t * 2) * 0.06, nod: -0.08, mouth: 0.25 + Math.abs(Math.sin(t * 4)) * 0.35, propTilt: [-1.0, 0, 0],
          arms: [{ raise: 0.35, fwd: 1.05, elbowZ: -0.3, elbowX: -1.95 }, { raise: 1.0 + Math.sin(t * 1.5) * 0.4, fwd: 0.7, elbowZ: 0.3, elbowX: -0.25 }] };
      }

      // ---------- play & sports ----------
      case 'kick': {
        const u = (t % 0.9) / 0.9, kickK = Math.max(0, Math.cos(u * TAU)) ** 3;
        const g = this.gear.kickball;
        if (g) {
          g.userData.ball.position.set(-0.075, 0.23 + 4 * u * (1 - u) * 0.55, 0.24);
          g.userData.ball.rotation.x = t * 6;
        }
        return { nod: 0.25 - (1 - kickK) * 0.1, lean: -0.04, legs: [0.15 + 0.55 * kickK, 0],
          arms: [0, 1].map(() => ({ raise: 0.6, fwd: 0.2, elbowZ: 0.3, elbowX: -0.5 })) };
      }
      case 'cricket': {
        const u = (t % 2.6) / 2.6, k = smoothstep(0.45, 0.6, u) * (1 - smoothstep(0.8, 1.0, u));
        return { twist: lerp(-0.45, 0.6, k), lean: 0.15, nod: 0.1, legSpread: 0.12, propTilt: [lerp(-0.5, 2.0, k), lerp(-0.5, 0.6, k), 0],
          arms: [mixArm({ raise: 0.5, fwd: 0.6, elbowZ: -0.3, elbowX: -1.6 }, { raise: 0.3, fwd: 1.3, elbowZ: -0.6, elbowX: -0.3 }, k),
            mixArm({ raise: 0.25, fwd: 0.9, elbowZ: -0.9, elbowX: -1.4 }, { raise: 0.3, fwd: 1.2, elbowZ: -0.8, elbowX: -0.3 }, k)] };
      }
      case 'jumprope': {
        const phi = (t * TAU) / 0.8, h = Math.max(0, -Math.cos(phi)) ** 2 * 0.15;
        this.gear.rope?.userData.update(phi, h);
        return { rootY: h, squash: 1 + h * 0.2, legs: [h * 1.5, h * 1.5], nod: 0.05,
          arms: [0, 1].map(() => ({ raise: 0.5, fwd: 0.35 + Math.sin(phi) * 0.12, elbowZ: 0.25, elbowX: -0.7 })) };
      }
      case 'bicycle': {
        const w = TAU / 8, c = Math.cos(t * w);
        const crank = t * 6;
        const g = this.gear.bike;
        if (g) {
          g.userData.crank.rotation.x = -crank;
          g.userData.wheels.forEach((wh, i) => { wh.rotation.x = -t * (i < 2 ? 5 : 12); });
        }
        return { rigX: 1.6 * Math.sin(t * w), rigYaw: (Math.PI / 2) * clamp(c * 3, -1, 1), rootY: 0.24, bodyY: 0, lean: 0.28, nod: -0.2,
          roll: Math.sin(t * w * 2) * 0.03, legs: [0.1 + 0.28 * Math.sin(crank), 0.1 - 0.28 * Math.sin(crank)],
          arms: [0, 1].map(() => ({ raise: 0.22, fwd: 1.15, elbowZ: -0.2, elbowX: -0.35 })) };
      }
      case 'jumpingjacks': {
        const u = (t * TAU) / 0.9, k = (1 - Math.cos(u)) / 2;
        return { rootY: Math.abs(Math.sin(u)) * 0.06, legSpread: 0.3 * k,
          arms: [0, 1].map(() => ({ raise: 0.15 + 2.6 * k, fwd: 0.1, elbowZ: 0.1, elbowX: -0.1 })) };
      }
      default: return null;
    }
  }

  /** How the body plays a sound in a line. vt: seconds since the sound started. */
  /**
   * The part of a gesture the body can do right now. Nobody stops dancing or swinging to wave;
   * sitting keeps the legs and seat where they are; hands busy with a spoon, a book or a broom
   * stay on the job, so only the head nods or shakes. Clapping and folded hands need empty hands.
   */
  gesturePose({ action: g, t }, action, ctx) {
    if (g === action || GESTURE_SKIP.has(action)) return null;
    const G = this.actionPose(g, t, ctx);
    if (!G) return null;
    const out = { nod: G.nod, turn: G.turn, tilt: G.tilt };
    if (!(this.low < -0.01 || SEATED.has(action))) {
      for (const k of ['lean', 'twist', 'roll', 'bodyY', 'rootY', 'squash', 'legs']) out[k] = G[k];
    }
    const holding = this.prop && !this.prop.userData.onBody && !this.prop.userData.mount;
    if (!HANDS_ON_JOB.has(action) && !(holding && ['clap', 'namaste'].includes(g))) out.arms = G.arms;
    return out;
  }

  vocalPose({ sound, t: vt }, t, action) {
    const busy = !!this.A && !['idle', 'think', 'point', 'shrug', 'sad', 'wave', 'yes', 'no'].includes(action);
    switch (sound) {
      case 'laugh': case 'giggle': case 'hoho': {
        // shoulders shake with each "ha", head thrown back a little, then forward
        const shake = Math.abs(Math.sin(t * 17));
        return { lean: -0.06 + Math.sin(vt * 2.2) * 0.05, nod: -0.16 + shake * 0.07, roll: Math.sin(t * 8.5) * 0.03, bodyY: shake * 0.012, squash: 1 + shake * 0.025,
          ...(busy ? {} : { arms: [0, 1].map((i) => ({ raise: 0.22 + shake * 0.06, fwd: 0.85, elbowZ: -0.4, elbowX: -1.3 - i * 0.1 })) }) };
      }
      case 'gasp': case 'ooh': case 'scream': {
        // a quick recoil: up and back, hands flying up
        const pop = smoothstep(0, 0.12, vt) * (1 - smoothstep(0.5, 1.2, vt) * 0.5);
        return { lean: -0.12 * pop, nod: -0.14 * pop, bodyY: 0.02 * pop, squash: 1 + 0.05 * pop,
          ...(busy ? {} : { arms: [0, 1].map(() => ({ raise: 0.55 * pop + 0.15, fwd: 1.0 * pop, elbowZ: 0.2, elbowX: -1.9 * pop })) }) };
      }
      case 'cry': case 'sniff': {
        const sob = Math.abs(Math.sin(t * 7));
        return { nod: 0.2, lean: 0.06, bodyY: sob * 0.012, squash: 1 - sob * 0.025 };
      }
      case 'sigh': {
        // breathe in (rise), then let it all out (sink)
        const k = Math.sin(clamp(vt / 1.2, 0, 1) * Math.PI);
        return { bodyY: vt < 0.4 ? k * 0.015 : -0.015, nod: vt < 0.4 ? -0.08 * k : 0.16, lean: 0.04, squash: vt < 0.4 ? 1 + k * 0.03 : 0.97 };
      }
      case 'hmm': return { tilt: 0.14, nod: -0.06, turn: 0.1 };
      case 'angry': return { nod: 0.08, lean: 0.05, squash: 1.03, bodyY: -0.01 };
      case 'yay': return { rootY: Math.abs(Math.sin(t * 9)) * 0.05, arms: busy ? undefined : [0, 1].map(() => ({ raise: 2.5, fwd: 0.2, elbowZ: 0.2, elbowX: -0.1 })) };
      case 'yawn': return { lean: -0.1, nod: -0.25, arms: busy ? undefined : [0, 1].map(() => ({ raise: 2.4, fwd: 0.25, elbowZ: 0.4, elbowX: -0.5 })) };
      default: return null;
    }
  }

  animateTears(t) {
    const g = this.gear.tears;
    if (!g) return;
    g.userData.drops.forEach((d, i) => {
      const side = i < 3 ? -1 : 1, k = (t * 0.8 + (i % 3) / 3) % 1;
      d.position.copy(surfaceNormal(-0.05 - k * 0.55, side * this.eyeLon * 1.08)).multiplyScalar(this.R + 0.012);
      d.scale.set(1, 1.5, 1).multiplyScalar(Math.min(1, k * 8) * (1 - smoothstep(0.85, 1, k)));
    });
  }

  /** Furniture and moving bits that come with an action (swing, bed, bicycle…), built on first use. */
  showGear(action) {
    const want = ACTION_GEAR[action];
    if (want && !this.gear[want]) {
      const spec = GEAR[want];
      const g = spec.build ? spec.build() : buildGear(want);
      if (spec.scaled) g.scale.setScalar(this.rig.scale.x);
      (spec.parent === 'rig' ? this.rig : spec.parent === 'head' ? this.head : this.root).add(g);
      this.gear[want] = g;
    }
    for (const [kind, g] of Object.entries(this.gear)) g.visible = kind === want;
  }

  applyPose(p, ctx) {
    const { body, neck, head } = this;
    this.rig.position.set(p.rigX, p.rigY, p.rigZ);
    this.rig.rotation.order = 'YXZ'; // tip over (lying) first, then turn
    this.rig.rotation.set(p.rigPitch, p.rigYaw, 0);
    body.position.y = 0.3 + p.bodyY + p.rootY;
    body.rotation.set(p.lean, p.twist + p.spin, p.roll);
    body.scale.set(2 - p.squash, p.squash, 2 - p.squash);
    for (const leg of this.legs) leg.hip.position.y = 0.3 + p.rootY;
    this.legs[0].hip.rotation.x = -p.legs[0];
    this.legs[1].hip.rotation.x = -p.legs[1];
    this.legs.forEach((l) => { l.hip.rotation.y = p.spin - l.s * p.legCross; l.hip.rotation.z = l.s * p.legSpread; });
    if (this.skirt) {
      // long skirts fold up when sitting so the legs don't poke through
      const sit = smoothstep(0.5, 1.3, (p.legs[0] + p.legs[1]) / 2);
      this.skirt.scale.set(1 + sit * 0.3, 1 - sit * 0.55, 1 + sit * 0.9);
      this.skirt.position.z = sit * 0.08;
    }

    for (const [i, arm] of this.arms.entries()) {
      const a = p.arms[i], s = arm.s;
      arm.shoulder.rotation.set(-a.fwd, 0, s * a.raise);
      arm.elbow.rotation.set(a.elbowX, 0, s * a.elbowZ);
    }

    // head: look toward target (yaw/pitch in body space), plus expression motion
    let yaw = 0, pitch = 0;
    if (ctx.lookAt && !this.A?.noLook) {
      neck.updateWorldMatrix(true, false);
      tmpV.copy(ctx.lookAt);
      neck.worldToLocal(tmpV);
      tmpV.y -= 0.23;
      yaw = Math.atan2(tmpV.x, tmpV.z);
      pitch = -Math.atan2(tmpV.y, Math.hypot(tmpV.x, tmpV.z));
      yaw = clamp(yaw, -1.1, 1.1);
      pitch = clamp(pitch, -0.45, 0.45);
    }
    head.rotation.set(pitch * 0.6 + p.nod, clamp(yaw * 0.6, -0.8, 0.8) + p.turn, p.tilt);
    this.gaze = { yaw: clamp(yaw * 0.3, -0.35, 0.35), pitch: clamp(pitch * 0.4, -0.3, 0.3) };
  }

  applyFace(f, t, ctx) {
    f = f || FACES.neutral;
    // blinks every ~3.5s (deterministic)
    const period = 3.3 + (this.seed % 7) * 0.13;
    const bk = (t + this.seed) % period;
    const fm = this.faceMod || { mouth: 0, eyes: 0 };
    const blink = Math.max(bk < 0.16 ? Math.sin((bk / 0.16) * Math.PI) : 0, fm.eyes);
    const lower = f.lower;
    const upper = lerp(f.upper, lower + 0.02, blink);
    // eye darts: every second or so the eyes flick to a new spot nearby (fast, then hold),
    // like a living face; smaller while talking, when they stay on the listener
    const every = 0.9 + (this.seed % 5) * 0.18, u = (t + this.seed * 0.37) / every, n = Math.floor(u);
    const amp = ctx.speaking ? 0.5 : 1;
    const dart = (i) => [wobble(i * 3.1, this.seed) * 0.13 * amp, wobble(i * 5.7, this.seed + 9) * 0.07 * amp];
    const [y0, p0] = dart(n - 1), [y1, p1] = dart(n), k = smoothstep(0, 0.07 / every, u - n);
    for (const eye of this.eyes) {
      eye.upper.rotation.x = -upper;
      eye.lower.rotation.x = -lower;
      eye.ball.rotation.set(this.gaze.pitch + lerp(p0, p1, k), this.gaze.yaw + lerp(y0, y1, k), 0);
      eye.glint.visible = upper - lower > 0.25;
    }
    for (const b of this.brows) {
      const lat = 0.43 + f.brow * 1.6 + (ctx.speaking ? ctx.talk * 0.03 : 0);
      placeOn(b.pivot, new THREE.Vector3(), this.R, lat, b.s * this.eyeLon, 0.004);
      tmpQ.setFromAxisAngle(Z, b.s * f.tilt);
      b.pivot.quaternion.multiply(tmpQ);
    }
    const talkOpen = ctx.speaking ? ctx.talk : 0;
    const open = clamp(Math.max(f.open, talkOpen * 0.85, fm.mouth), 0, 1);
    this.mouth.set(open, f.smile * (1 - talkOpen * 0.35));
  }

  secondary(t, p, ctx) {
    const bounce = p.bodyY * 6 + p.rootY * 2;
    const droop = ctx.face && ctx.face.smile < -0.3 ? 0.6 : 0;
    for (const ear of this.ears) {
      if (ear.tip) {
        ear.pivot.rotation.x = -0.15 - droop * 0.9 + Math.sin(t * 2.2 + ear.s) * 0.04;
        ear.tip.rotation.x = 0.25 + droop * 0.6 + bounce * 0.5 + Math.sin(t * 3 + ear.s) * 0.06;
      } else if (ear.flap) {
        ear.flap.rotation.y = ear.s * (0.25 + Math.sin(t * 2.4 + ear.s) * 0.12);
      } else if (ear.hang) {
        ear.hang.rotation.z = ear.s * (0.25 + Math.sin(t * 2 + ear.s) * 0.05) + p.roll;
        ear.hang.rotation.x = bounce * 0.4;
      }
    }
    if (this.trunk) {
      this.trunk.forEach((seg, i) => {
        const base = i === 0 ? -1.1 : i < 4 ? 0.3 : -0.35;
        seg.rotation.x = base + Math.sin(t * 1.7 - i * 0.5) * 0.08 - (ctx.speaking ? ctx.talk * 0.12 : 0);
        seg.rotation.z = Math.sin(t * 1.1 - i * 0.4) * 0.05;
      });
    }
    if (this.tail) {
      const wag = this.sp.tail === 'wag';
      const happy = ctx.face && ctx.face.smile > 0.6;
      this.tail.forEach((seg, i) => {
        seg.rotation.x = wag ? (i === 0 ? -0.9 : -0.2) : (i === 0 ? -1.1 : 0.28);
        seg.rotation.z = wag ? (i === 0 ? Math.sin(t * (happy ? 16 : 5)) * (happy ? 0.6 : 0.25) : 0) : Math.sin(t * 1.6 - i * 0.6) * 0.18;
      });
    }
    if (this.prop?.userData.float) {
      // balloons stay upright and bob
      const slot = this.prop.parent;
      slot.updateWorldMatrix(true, false);
      slot.getWorldQuaternion(tmpQ).invert();
      this.prop.quaternion.copy(tmpQ).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.sin(t * 1.3) * 0.08, 0, Math.sin(t) * 0.1)));
    } else {
      // cups, bowls, spoons…: keep them level with the figure, tilted the way the action says
      this.orientProp(this.prop, this.A?.propTilt);
      this.orientProp(this.prop2, this.A?.prop2Tilt);
    }
    if (this.cape) {
      const moving = ctx.walking || this.A?.walk ? 0.5 : 0;
      this.cape.rotation.x = 0.1 + moving + Math.abs(p.rootY) * 0.8 + Math.sin(t * 2.3) * 0.04;
    }
  }

  orientProp(prop, tilt) {
    if (!prop || prop.userData.onBody || prop.userData.mount) return;
    if (tilt === undefined && !prop.userData.upright) { prop.quaternion.identity(); return; }
    const slot = prop.parent;
    slot.updateWorldMatrix(true, false);
    slot.getWorldQuaternion(tmpQ).invert();
    this.rig.getWorldQuaternion(tmpQ2);
    const [x, y, z] = Array.isArray(tilt) ? tilt : [tilt || 0, 0, 0];
    tmpQ3.setFromEuler(tmpE.set(x, y, z));
    prop.quaternion.copy(tmpQ).multiply(tmpQ2).multiply(tmpQ3);
  }
}

// ---------- painted iris ----------
// The iris cap's texture runs from the pupil (top of the canvas) to the rim (bottom), all the
// way round (left to right): a lighter warm ring near the pupil, fibres, and a dark limbal ring.
const irisCache = new Map();
function irisMaterial(color) {
  if (!irisCache.has(color)) {
    const base = new THREE.Color(color);
    const css = (c) => `#${c.getHexString()}`;
    const inner = css(base.clone().lerp(new THREE.Color('#ffd98a'), 0.35).multiplyScalar(1.25));
    const mid = css(base);
    const outer = css(base.clone().multiplyScalar(0.55));
    const ring = css(base.clone().multiplyScalar(0.18));
    const map = canvasTexture(256, 128, (c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, inner); g.addColorStop(0.42, mid); g.addColorStop(0.78, outer); g.addColorStop(0.9, ring); g.addColorStop(1, ring);
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      const r = rng(base.getHex() % 997 + 3);
      for (let x = 0; x < w; x += 1.5) { // fibres from pupil to rim
        const light = r() < 0.5;
        c.strokeStyle = light ? `rgba(255,240,210,${0.06 + r() * 0.12})` : `rgba(0,0,0,${0.06 + r() * 0.14})`;
        c.lineWidth = 0.6 + r() * 1.2;
        c.beginPath(); c.moveTo(x, h * (0.08 + r() * 0.1)); c.lineTo(x + (r() - 0.5) * 3, h * (0.6 + r() * 0.25)); c.stroke();
      }
    });
    map.repeat.set(1, 1);
    const m = new THREE.MeshPhysicalMaterial({ map, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.04 });
    m.userData.shared = true;
    irisCache.set(color, m);
  }
  return irisCache.get(color);
}

// ---------- kurta shape and flowers ----------
const KURTA = [[0.001, -0.2], [0.205, -0.2], [0.19, -0.05], [0.172, 0.1], [0.165, 0.24], [0.14, 0.31], [0.09, 0.36], [0.001, 0.37]];
const MARIGOLD = () => mats.fur('#ff9408');
const JASMINE = () => mats.fur('#fffdf2');

// ---------- playground gear ----------
const SWING = { top: 1.9, len: 1.6 };
const SLIDE = { top: 1.2, chuteStart: -1.0, chuteEnd: 0.6, lip: 1.0, ladderZ: -1.6 };
const slideSurface = (z) => (z <= SLIDE.chuteStart ? SLIDE.top : z >= SLIDE.chuteEnd ? 0.25 : lerp(SLIDE.top, 0.25, (z - SLIDE.chuteStart) / (SLIDE.chuteEnd - SLIDE.chuteStart)));

function pole(from, to, r, mat) {
  const d = new THREE.Vector3().subVectors(to, from);
  const m = mesh(new THREE.CylinderGeometry(r, r, d.length(), 12), mat);
  m.position.copy(from).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
}

export function buildSwing() {
  const g = new THREE.Group();
  const frame = mats.metal('#e53935', 0.4), V = (x, y, z) => new THREE.Vector3(x, y, z);
  const { top, len } = SWING;
  g.add(pole(V(-0.8, top, 0), V(0.8, top, 0), 0.045, frame));
  for (const s of [-1, 1]) for (const k of [-1, 1]) g.add(pole(V(s * 0.8, top, 0), V(s * 0.95, 0, k * 0.75), 0.04, frame));
  const pivot = new THREE.Group();
  pivot.position.y = top;
  const rope = mats.matte('#6b4a2b');
  for (const s of [-1, 1]) pivot.add(pole(V(s * 0.2, 0, 0), V(s * 0.2, -len, 0), 0.01, rope));
  pivot.add(mesh(new THREE.BoxGeometry(0.5, 0.05, 0.22), mats.glossy('#ffd23f', 0.4), 0, -len, 0));
  g.add(pivot);
  g.userData.pivot = pivot;
  return g;
}

export function buildSlide() {
  const g = new THREE.Group();
  const frame = mats.metal('#3fa7ff', 0.35), V = (x, y, z) => new THREE.Vector3(x, y, z);
  const { top, chuteStart, chuteEnd, lip, ladderZ } = SLIDE;
  // ladder
  for (const s of [-1, 1]) g.add(pole(V(s * 0.24, 0, ladderZ), V(s * 0.24, top + 0.6, ladderZ + 0.1), 0.03, frame));
  for (let y = 0.25; y < top + 0.05; y += 0.24) g.add(pole(V(-0.24, y, ladderZ + y * 0.06), V(0.24, y, ladderZ + y * 0.06), 0.018, frame));
  // platform and back supports
  g.add(mesh(new THREE.BoxGeometry(0.62, 0.06, 0.55), mats.glossy('#e53935', 0.4), 0, top - 0.03, (ladderZ + chuteStart) / 2));
  for (const s of [-1, 1]) g.add(pole(V(s * 0.28, 0, chuteStart), V(s * 0.28, top, chuteStart), 0.03, frame));
  // chute with side rails, then a flat lip
  const a = V(0, top, chuteStart), b = V(0, 0.25, chuteEnd);
  const len = a.distanceTo(b);
  const chute = new THREE.Group();
  chute.position.copy(a).lerp(b, 0.5);
  chute.rotation.x = Math.atan2(top - 0.25, chuteEnd - chuteStart);
  const yellow = mats.glossy('#ffd23f', 0.25);
  chute.add(mesh(new THREE.BoxGeometry(0.5, 0.04, len), yellow, 0, -0.02, 0));
  for (const s of [-1, 1]) chute.add(mesh(new THREE.BoxGeometry(0.04, 0.14, len), yellow, s * 0.27, 0.05, 0));
  g.add(chute);
  g.add(mesh(new THREE.BoxGeometry(0.5, 0.04, lip - chuteEnd), yellow, 0, 0.23, (chuteEnd + lip) / 2));
  for (const s of [-1, 1]) g.add(pole(V(s * 0.2, 0, lip - 0.08), V(s * 0.2, 0.22, lip - 0.08), 0.025, frame));
  return g;
}

// Climb the ladder, sit, slide down, stand up, walk back round: a 5 second loop.
function slidePose(u) {
  const up = [0, 1].map((i) => ({ raise: 2.4, fwd: 0.4, elbowZ: 0.3, elbowX: -0.2 + i * 0 }));
  const sitLegs = [1.4, 1.4];
  if (u < 1.5) {
    const k = u / 1.5, c = Math.sin(k * Math.PI * 6);
    return { rigZ: lerp(SLIDE.ladderZ + 0.15, SLIDE.ladderZ + 0.25, k), rigYaw: Math.PI, rootY: SLIDE.top * k,
      legs: [0.3 + c * 0.5, 0.3 - c * 0.5],
      arms: [{ raise: 0.15, fwd: 2.4 + c * 0.4, elbowZ: 0, elbowX: -0.3 }, { raise: 0.15, fwd: 2.4 - c * 0.4, elbowZ: 0, elbowX: -0.3 }] };
  }
  if (u < 2.0) {
    const k = smoothstep(1.5, 2.0, u);
    const z = lerp(SLIDE.ladderZ + 0.25, SLIDE.chuteStart, k);
    return { rigZ: z, rigYaw: lerp(Math.PI, 0, k), rootY: lerp(SLIDE.top, slideSurface(SLIDE.chuteStart) + 0.05 - 0.3, k),
      legs: sitLegs.map((v) => v * k) };
  }
  if (u < 3.0) {
    const k = (u - 2.0) ** 2;
    const z = lerp(SLIDE.chuteStart, SLIDE.lip - 0.1, k);
    return { rigZ: z, rootY: slideSurface(z) + 0.05 - 0.3, lean: -0.3, legs: sitLegs, arms: up, nod: -0.15 };
  }
  if (u < 3.5) {
    const k = smoothstep(3.0, 3.5, u);
    return { rigZ: lerp(SLIDE.lip - 0.1, SLIDE.lip + 0.2, k), rootY: 0, legs: sitLegs.map((v) => v * (1 - k)), lean: lerp(-0.3, 0.1, k) };
  }
  const k = (u - 3.5) / 1.5;
  const z0 = SLIDE.lip + 0.2, z1 = SLIDE.ladderZ + 0.15;
  const x = 0.75 * Math.sin(Math.PI * k), dx = 0.75 * Math.PI * Math.cos(Math.PI * k), dz = z1 - z0;
  return { rigX: x, rigZ: lerp(z0, z1, k), rigYaw: Math.atan2(dx, dz), walk: { phase: k * 14, speed: 1.3 } };
}

// shared pose pieces
const TO_MOUTH = { raise: 0.35, fwd: 1.0, elbowZ: -0.3, elbowX: -2.2 }; // right hand at the mouth
const SIT_FLOOR = { rootY: -0.245, low: -0.245, legs: [1.5, 1.5], legCross: -0.12, lean: 0.04, squash: 1,
  arms: [0, 1].map(() => ({ raise: 0.2, fwd: 0.9, elbowZ: -0.1, elbowX: -0.3 })) };
const SIT_CHAIR = { legs: [1.38, 1.38], legCross: -0.06, lean: 0.03, squash: 1 }; // hips stay at seat height
const mixArm = (a, b, k) => ({ raise: lerp(a.raise, b.raise, k), fwd: lerp(a.fwd, b.fwd, k), elbowZ: lerp(a.elbowZ, b.elbowZ, k), elbowX: lerp(a.elbowX, b.elbowX, k) });

function mixPose(p, A, k) {
  for (const key of ['bodyY', 'lean', 'twist', 'roll', 'rootY', 'spin', 'nod', 'tilt', 'turn', 'rigX', 'rigY', 'rigZ', 'rigYaw', 'rigPitch', 'legCross', 'legSpread']) {
    if (A[key] !== undefined) p[key] = lerp(p[key], A[key], k);
  }
  if (A.squash !== undefined) p.squash = lerp(p.squash, A.squash, k);
  if (A.legs) p.legs = p.legs.map((v, i) => lerp(v, A.legs[i], k));
  if (A.arms) A.arms.forEach((a, i) => {
    if (!a) return;
    for (const key in a) p.arms[i][key] = lerp(p.arms[i][key], a[key], k);
  });
}

// ---------- Robo: a rigged glTF model with its own animation clips ----------
const loader = new GLTFLoader();
const gltfCache = new Map();
export function loadModel(url) {
  if (!gltfCache.has(url)) gltfCache.set(url, loader.loadAsync(url));
  return gltfCache.get(url);
}

const ROBO_CLIPS = {
  idle: 'Idle', wave: 'Wave', cheer: 'ThumbsUp', jump: 'Jump', dance: 'Dance', laugh: 'Yes',
  sad: 'Idle', think: 'Idle', point: 'Punch', clap: 'Yes', shrug: 'No', spin: 'Dance',
  run: 'Running', runjump: 'Jump', swing: 'Sitting', slide: 'Sitting', sitcross: 'Sitting', sitar: 'Sitting',
  bhangra: 'Dance', disco: 'Dance', twist: 'Dance', hiphop: 'Dance', robot: 'Dance', twirl: 'Dance', sidestep: 'Dance',
  yes: 'Yes', no: 'No', salute: 'ThumbsUp', walkaround: 'Walking', cart: 'Walking', firststeps: 'Walking', crawl: 'Walking',
  sitfloor: 'Sitting', sitchair: 'Sitting', study: 'Sitting', rattle: 'Sitting', bottle: 'Sitting', bicycle: 'Sitting',
  sleep: 'Death', jumprope: 'Jump', jumpingjacks: 'Jump', kick: 'Punch', cricket: 'Punch', raisehand: 'Wave',
};

export class RoboCharacter {
  static async create(cast) {
    const gltf = await loadModel('/models/RobotExpressive.glb');
    return new RoboCharacter(cast, gltf);
  }

  constructor(cast, gltf) {
    this.cast = cast;
    this.root = new THREE.Group();
    const model = SkeletonUtils.clone(gltf.scene);
    model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = o.receiveShadow = true;
        o.frustumCulled = false;
        o.material = o.material.clone();
        if (/Main/i.test(o.material.name) && cast.color) o.material.color.set(cast.color);
        o.material.roughness = 0.35;
        o.material.metalness = 0.4;
        o.userData.sharedGeometry = true;
        o.geometry.userData.shared = true;
      }
    });
    model.scale.setScalar(0.19);
    this.root.add(model);
    this.model = model;
    this.mixer = new THREE.AnimationMixer(model);
    this.actions = {};
    for (const clip of gltf.animations) {
      const a = this.mixer.clipAction(clip);
      a.play();
      a.setEffectiveWeight(0);
      this.actions[clip.name] = a;
    }
    this.face = null;
    model.traverse((o) => { if (o.morphTargetDictionary && 'Surprised' in o.morphTargetDictionary) this.face = o; });
    this.headBone = model.getObjectByName('Head');
    this.propKind = null;
  }

  get height() { return 1.3; }

  setProp() { /* Robo keeps its hands free */ }
  equip() {}

  headWorld(target) {
    return (this.headBone || this.root).getWorldPosition(target);
  }

  update(ctx) {
    const weights = {};
    const main = ctx.walking ? (ctx.walking.speed > 2 ? 'Running' : 'Walking') : (ROBO_CLIPS[ctx.action] || 'Idle');
    const at = Math.max(0, ctx.t - (ctx.actionStart || 0));
    const k = ctx.walking ? 1 : smoothstep(0, 0.35, at);
    weights[main] = k;
    if (k < 1) weights.Idle = (weights.Idle || 0) + (1 - k);
    // a spoken gesture ("Bye!", "Yes!") borrows the matching clip while the words are said
    const g = ctx.gesture && !ctx.walking && main === 'Idle' && ROBO_CLIPS[ctx.gesture.action];
    if (g && g !== main && g !== 'Punch') { // (Robo's "point" clip is a punch)
      for (const n in weights) weights[n] *= 1 - ctx.gesture.k;
      weights[g] = (weights[g] || 0) + ctx.gesture.k;
    }
    for (const [name, action] of Object.entries(this.actions)) {
      const w = weights[name] || 0;
      action.setEffectiveWeight(w);
      const d = action.getClip().duration;
      const once = ['Jump', 'Wave', 'Yes', 'No', 'ThumbsUp', 'Punch'].includes(name);
      action.time = ctx.walking ? (ctx.walking.phase / Math.PI) * d * 0.5 % d : name === 'Death' ? at : (once ? (name === g ? ctx.gesture.t : at) % (d + 0.8) : ctx.t % d);
      if (action.time > d) action.time = d;
    }
    this.mixer.update(0);

    if (this.face) {
      const inf = this.face.morphTargetInfluences, dict = this.face.morphTargetDictionary;
      const f = ctx.face || {};
      inf[dict.Surprised] = clamp((f.upper - 0.5) * 2 + (ctx.speaking ? ctx.talk * 0.5 : 0), 0, 1);
      inf[dict.Sad] = clamp(-f.smile, 0, 1);
      inf[dict.Angry] = clamp(f.tilt * 1.5, 0, 1);
    }
    if (this.headBone && ctx.lookAt) {
      this.headBone.updateWorldMatrix(true, false);
      tmpV.copy(ctx.lookAt);
      this.root.worldToLocal(tmpV);
      const yaw = clamp(Math.atan2(tmpV.x, tmpV.z), -0.8, 0.8);
      this.headBone.rotateY(yaw * 0.5);
    }
  }
}

export async function createCharacter(cast) {
  if (cast.type === 'robo') return RoboCharacter.create(cast);
  return new ToonCharacter(cast);
}
