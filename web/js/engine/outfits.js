// Clothes for the human characters. Each outfit is a small recipe (shape of the top, what's on
// the legs, sleeves, shoes, extras like a tie or a dupatta); dressBody/dressHead build it.
// Colours: 'main' is the character's "Clothes" colour, 'light'/'dark' are shades of it.
import * as THREE from 'three';
import { mats, mesh, sphere, capsule, geo, lathe, tube, lerp } from './util.js';

export const OUTFITS = {
  tshirt: { label: 'Boy: T-shirt & shorts', top: 'shirt', bottom: 'shorts', bottomColor: '#34405e', shoes: '#ffffff' },
  schoolboy: { label: 'Boy: School uniform', top: 'shirt', topColor: '#f4f6fb', bottom: 'pants', bottomColor: 'main', shoes: '#1d1d22',
    extras: { collar: '#f4f6fb', tie: 'main', belt: '#2a2a2a', pocket: '#e2e7f2' } },
  kurtapajama: { label: 'Boy: Kurta pajama', top: 'tunic', sleeves: 'long', bottom: 'pants', bottomColor: '#fbf8f0', shoes: '#8b5a2b',
    extras: { placket: '#ffd23f', buttons: '#ffd23f' } },
  hoodie: { label: 'Boy: Jeans & hoodie', top: 'hoodie', sleeves: 'long', bottom: 'pants', bottomColor: '#3b5b8f', shoes: '#ffffff',
    extras: { hood: 'main', pouch: 'dark' } },
  jersey: { label: 'Boy: Sports jersey & shorts', top: 'shirt', bottom: 'shorts', bottomColor: '#ffffff', shoes: '#e53935',
    extras: { stripe: '#ffffff', collar: '#ffffff' } },
  suit: { label: 'Boy: Party suit & bow tie', top: 'shirt', sleeves: 'long', bottom: 'pants', bottomColor: '#2b2b35', shoes: '#1d1d22',
    extras: { shirtfront: '#ffffff', bowtie: '#e53935', buttons: '#1d1d22' } },
  sherwani: { label: 'Boy: Sherwani (wedding)', top: 'coat', sleeves: 'long', bottom: 'pants', bottomColor: '#fbf3df', shoes: '#c9a227',
    extras: { placket: '#ffd23f', buttons: '#ffd23f', stole: '#c62848' } },

  dress: { label: 'Girl: Dress', top: 'dress', shoes: '#d23f6e' },
  frock: { label: 'Girl: Party frock', top: 'frock', puff: true, shoes: '#ffffff', extras: { sash: '#ffffff', collar: '#ffffff' } },
  schoolgirl: { label: 'Girl: School uniform', top: 'shirt', topColor: '#f4f6fb', bottom: 'skirt', bottomColor: 'main', shoes: '#1d1d22',
    extras: { collar: '#f4f6fb', tie: 'main' } },
  salwar: { label: 'Girl: Salwar kameez & dupatta', top: 'tunic', sleeves: 'long', bottom: 'pants', bottomColor: 'light', shoes: '#c9a227',
    extras: { neckline: '#ffd23f', dupatta: '#ffd23f' } },
  lehenga: { label: 'Girl: Lehenga choli', top: 'crop', topColor: 'dark', bottom: 'long', bottomColor: 'main', shoes: '#c9a227',
    extras: { border: '#ffd23f', dupatta: '#ffd23f' } },
  jeanstop: { label: 'Girl: Jeans & top', top: 'shirt', puff: true, bottom: 'pants', bottomColor: '#3b5b8f', shoes: '#ffffff',
    extras: { neckline: 'light', belt: '#ffffff' } },
  gown: { label: 'Girl: Princess gown & tiara', top: 'crop', bottom: 'long', bottomColor: 'light', puff: true, shoes: 'main',
    extras: { border: '#ffffff', sash: '#ffffff', tiara: '#ffd23f' } },

  saree: { label: 'Woman: Saree', top: 'crop', topColor: 'dark', bottom: 'long', bottomColor: 'main', shoes: '#c9a227',
    extras: { border: '#ffd23f', pallu: 'main' } },
  shirtpants: { label: 'Grown-up: Shirt & trousers', top: 'shirt', bottom: 'pants', bottomColor: '#3a3f4f', shoes: '#5a3a22',
    extras: { collar: 'main', buttons: '#ffffff', belt: '#3a2a1a', pocket: 'dark' } },
  office: { label: 'Grown-up: Office suit & tie', top: 'shirt', sleeves: 'long', bottom: 'pants', bottomColor: 'main', shoes: '#1d1d22',
    extras: { shirtfront: '#ffffff', tie: '#c62848', buttons: '#1d1d22' } },

  pajamas: { label: 'Anyone: Night pajamas', top: 'shirt', sleeves: 'long', bottom: 'pants', bottomColor: 'main', shoes: 'skin',
    extras: { collar: 'light', buttons: '#ffffff', pocket: 'light' } },
  raincoat: { label: 'Anyone: Raincoat & boots', top: 'coat', topColor: '#ffd23f', sleeves: 'long', bottom: 'pants', bottomColor: '#3b5b8f', shoes: '#ffd23f',
    extras: { hoodup: '#ffd23f', buttons: '#1d1d22' } },
  winter: { label: 'Anyone: Sweater, scarf & woolly cap', top: 'hoodie', sleeves: 'long', bottom: 'pants', bottomColor: '#3b5b8f', shoes: '#6b4226',
    extras: { stripe: '#ffffff', scarf: '#e53935', beanie: '#e53935' } },
  superhero: { label: 'Anyone: Superhero with cape', top: 'shirt', sleeves: 'long', bottom: 'pants', bottomColor: 'main', shoes: '#e53935',
    extras: { cape: '#e53935', belt: '#ffd23f', emblem: '#ffd23f' } },

  onesie: { label: 'Baby: Onesie', top: 'onesie', sleeves: 'long', bottom: 'pants', bottomColor: 'main', shoes: 'main',
    extras: { bib: '#ffffff', buttons: '#ffffff' } },
  diaper: { label: 'Baby: Vest & nappy', top: 'vest', bottom: 'diaper', bottomColor: '#ffffff', shoes: 'skin' },

  doctor: { label: 'Job: Doctor', top: 'coat', topColor: '#fbfbfb', sleeves: 'long', bottom: 'pants', bottomColor: '#3a3f4f', shoes: '#1d1d22',
    extras: { shirtfront: 'main', stethoscope: '#2a2a33', pocket: '#ffffff', buttons: '#cfd8dc' } },
  nurse: { label: 'Job: Nurse (scrubs)', top: 'shirt', topColor: '#36b3a8', bottom: 'pants', bottomColor: '#36b3a8', shoes: '#ffffff',
    extras: { pocket: '#2a9d93', nursecap: '#ffffff' } },
  police: { label: 'Job: Police', top: 'shirt', topColor: '#c8a96a', bottom: 'pants', bottomColor: '#c8a96a', shoes: '#1d1d22',
    extras: { collar: '#c8a96a', pocket: '#b89a5c', belt: '#5a3a22', badge: '#ffd23f', policecap: '#c8a96a' } },
  chef: { label: 'Job: Chef', top: 'shirt', topColor: '#ffffff', sleeves: 'long', bottom: 'pants', bottomColor: '#2b2b35', shoes: '#1d1d22',
    extras: { scarf: 'main', apron: '#ffffff', chefhat: '#ffffff' } },
  bride: { label: 'Wedding: Bridal lehenga', top: 'crop', topColor: '#9b1030', sleeves: 'short', bottom: 'long', bottomColor: '#c62828', shoes: '#c9a227',
    extras: { border: '#ffd23f', veil: '#d32f2f', jewelry: '#ffcc33' } },
  groom: { label: 'Wedding: Groom sherwani & safa', top: 'coat', topColor: '#f3e2c0', sleeves: 'long', bottom: 'pants', bottomColor: '#fbf3df', shoes: '#c9a227',
    extras: { placket: '#d4a73c', buttons: '#d4a73c', stole: '#c62848', safa: '#e53935' } },
  nehru: { label: 'Wedding: Kurta & Nehru jacket', top: 'tunic', topColor: '#fff8e7', sleeves: 'long', bottom: 'pants', bottomColor: '#fff8e7', shoes: '#8b5a2b',
    extras: { nehru: 'main', buttons: '#d4a73c' } },
  anarkali: { label: 'Wedding: Anarkali suit', top: 'shirt', sleeves: 'long', bottom: 'long', bottomColor: 'main', shoes: '#c9a227',
    extras: { border: '#ffd23f', dupatta: 'light', jewelry: '#ffcc33' } },
  kurta: { label: 'Saint: Kurta & dhoti', special: true },
};

// Profiles in body space: [radius, y]. The hips are at y = 0, the neck at y = 0.36.
const TOPS = {
  shirt: [[0.001, 0.04], [0.155, 0.05], [0.168, 0.14], [0.16, 0.24], [0.14, 0.31], [0.09, 0.36], [0.001, 0.37]],
  vest: [[0.001, 0.03], [0.158, 0.03], [0.166, 0.14], [0.158, 0.24], [0.138, 0.31], [0.088, 0.36], [0.001, 0.37]],
  crop: [[0.001, 0.12], [0.162, 0.12], [0.166, 0.16], [0.16, 0.24], [0.14, 0.31], [0.09, 0.36], [0.001, 0.37]],
  tunic: [[0.001, -0.16], [0.2, -0.16], [0.182, -0.02], [0.17, 0.12], [0.16, 0.24], [0.14, 0.31], [0.09, 0.36], [0.001, 0.37]],
  coat: [[0.001, -0.2], [0.215, -0.2], [0.19, -0.04], [0.177, 0.12], [0.167, 0.24], [0.146, 0.31], [0.095, 0.36], [0.001, 0.37]],
  dress: [[0.001, -0.1], [0.21, -0.1], [0.18, 0.04], [0.15, 0.16], [0.16, 0.24], [0.14, 0.31], [0.09, 0.36], [0.001, 0.37]],
  frock: [[0.001, -0.08], [0.26, -0.09], [0.255, -0.05], [0.2, 0.04], [0.15, 0.14], [0.16, 0.24], [0.14, 0.31], [0.09, 0.36], [0.001, 0.37]],
  hoodie: [[0.001, 0.0], [0.172, 0.0], [0.179, 0.12], [0.169, 0.24], [0.148, 0.31], [0.095, 0.36], [0.001, 0.37]],
  onesie: [[0.001, -0.07], [0.15, -0.07], [0.17, 0.05], [0.172, 0.14], [0.16, 0.24], [0.14, 0.31], [0.09, 0.36], [0.001, 0.37]],
};
const BOTTOMS = {
  shorts: [[0.001, -0.07], [0.135, -0.07], [0.158, 0.0], [0.158, 0.07], [0.001, 0.07]],
  diaper: [[0.001, -0.1], [0.15, -0.09], [0.178, 0.0], [0.166, 0.07], [0.001, 0.07]],
  skirt: [[0.001, -0.12], [0.215, -0.13], [0.2, -0.06], [0.165, 0.06], [0.001, 0.07]],
};
BOTTOMS.pants = BOTTOMS.shorts;
// Ankle-length skirt (lehenga, saree, gown), origin at the waist so it can squash when sitting.
const WAIST = 0.12;
const LONG = [[0.001, -0.285], [0.275, -0.285], [0.24, -0.15], [0.195, -0.02], [0.163, 0.08], [0.158, 0.13], [0.001, 0.13]].map(([r, y]) => [r, y - WAIST]);

/** Turn an outfit id into materials for each body part. */
export function resolveOutfit(id, cast, sp, skin) {
  const key = OUTFITS[id] ? id : sp.outfit;
  const o = OUTFITS[key] || OUTFITS.tshirt;
  const main = cast.accent || sp.accent;
  const color = (c) => {
    if (!c || c === 'main') return main;
    if (c === 'light') return '#' + new THREE.Color(main).lerp(new THREE.Color('#ffffff'), 0.55).getHexString();
    if (c === 'dark') return '#' + new THREE.Color(main).multiplyScalar(0.62).getHexString();
    return c;
  };
  const cloth = (c) => (c === 'skin' ? skin : mats.cloth(color(c)));
  const top = cloth(o.topColor);
  const pants = o.bottom === 'pants';
  return {
    id: key, spec: o, color, cloth, top,
    upperArm: top,
    lowerArm: o.sleeves === 'long' ? top : skin,
    leg: pants ? cloth(o.bottomColor) : skin,
    shoe: o.shoes === 'skin' ? skin : mats.glossy(color(o.shoes || '#ffffff'), 0.4),
    puff: !!o.puff,
  };
}

const radiusAt = (prof, y) => {
  for (let i = 1; i < prof.length; i++) {
    const [r1, y1] = prof[i - 1], [r2, y2] = prof[i];
    if ((y >= y1 && y <= y2) || (y <= y1 && y >= y2)) return lerp(r1, r2, (y - y1) / (y2 - y1 || 1));
  }
  return 0.15;
};

/** Build the clothes on the body group. Returns { skirt, cape } handles for animation. */
export function dressBody(body, o, skin) {
  const s = o.spec, out = {};
  const prof = TOPS[s.top] || TOPS.shirt;
  body.add(mesh(lathe(`top-${s.top}`, prof), o.top));
  if (s.top === 'crop') body.add(mesh(geo('midriff', () => new THREE.CylinderGeometry(0.158, 0.16, 0.1, 32)), skin, 0, 0.09, 0));
  if (BOTTOMS[s.bottom]) body.add(mesh(lathe(`bottom-${s.bottom}`, BOTTOMS[s.bottom]), o.cloth(s.bottomColor)));
  if (s.bottom === 'long') {
    const skirt = new THREE.Group();
    skirt.position.y = WAIST;
    skirt.add(mesh(lathe('longSkirt', LONG, 56), o.cloth(s.bottomColor)));
    body.add(skirt);
    out.skirt = skirt;
  }
  const r = (y) => (y >= prof[1][1] ? radiusAt(prof, y) : 0.165); // below the top: hips / pants
  // put a flat piece on the chest surface, tilted to follow it
  const chest = (m, y, x = 0, lift = 0.004) => {
    const R = r(y), z = Math.sqrt(Math.max(R * R - x * x, 0.0001)) + lift;
    const slope = (r(y + 0.02) - r(y - 0.02)) / 0.04;
    m.position.set(x, y, z);
    m.rotation.set(Math.atan(slope), Math.asin(Math.min(1, x / R)), 0);
    body.add(m);
    return m;
  };
  for (const [name, c] of Object.entries(s.extras || {})) {
    const mat = name === 'stethoscope' || name === 'badge' || name === 'emblem' ? mats.glossy(o.color(c), 0.3) : o.cloth(c);
    switch (name) {
      case 'collar': {
        const ring = mesh(geo('collar', () => new THREE.TorusGeometry(0.088, 0.02, 10, 36)), mat, 0, 0.352, 0);
        ring.rotation.x = Math.PI / 2 + 0.25;
        body.add(ring);
        for (const side of [-1, 1]) {
          const tip = chest(mesh(sphere(0.03, 14, 10), mat), 0.322, side * 0.035, 0.0);
          tip.scale.set(1, 0.65, 0.35);
          tip.rotation.z = side * 0.6;
        }
        break;
      }
      case 'neckline': {
        const ring = mesh(geo('neckline', () => new THREE.TorusGeometry(0.094, 0.012, 8, 36)), mat, 0, 0.345, 0.004);
        ring.rotation.x = Math.PI / 2 + 0.3;
        body.add(ring);
        break;
      }
      case 'tie': {
        chest(mesh(sphere(0.022, 14, 10), mat), 0.322, 0, 0.006).scale.set(1, 0.85, 0.6);
        chest(mesh(geo('tieBlade', () => new THREE.BoxGeometry(0.038, 0.15, 0.012)), mat), 0.23, 0, 0.008);
        chest(mesh(geo('tieTip', () => new THREE.BoxGeometry(0.027, 0.027, 0.012)), mat), 0.157, 0, 0.008).rotation.z = Math.PI / 4;
        break;
      }
      case 'bowtie': {
        for (const side of [-1, 1]) {
          const w = chest(mesh(geo('bowWing', () => new THREE.ConeGeometry(0.024, 0.045, 4)), mat), 0.322, side * 0.026, 0.008);
          w.rotation.z = -side * Math.PI / 2;
        }
        chest(mesh(sphere(0.012, 10, 8), mat), 0.322, 0, 0.012);
        break;
      }
      case 'shirtfront': {
        const tri = new THREE.Shape([new THREE.Vector2(-0.05, 0.06), new THREE.Vector2(0.05, 0.06), new THREE.Vector2(0, -0.08)]);
        chest(mesh(geo('shirtFront', () => new THREE.ShapeGeometry(tri)), mat, 0, 0, 0, { cast: false }), 0.28, 0, 0.003);
        break;
      }
      case 'buttons':
        for (const y of [0.3, 0.23, 0.16, 0.09, 0.02, -0.06, -0.14]) {
          if (y < prof[1][1] + 0.02) continue;
          chest(mesh(sphere(0.011, 10, 8), mats.glossy(o.color(c), 0.3), 0, 0, 0, { cast: false }), y, 0, 0.004);
        }
        break;
      case 'placket': chest(mesh(geo('placket', () => new THREE.BoxGeometry(0.03, 0.16, 0.006)), mat), 0.26, 0, 0.002); break;
      case 'pocket': chest(mesh(geo('pocket', () => new THREE.BoxGeometry(0.055, 0.055, 0.008)), mat), 0.235, 0.075, 0.002); break;
      case 'badge': chest(mesh(geo('badgeStar', () => starGeo(0.028, 0.012, 0.006)), mat, 0, 0, 0, { cast: false }), 0.255, -0.075, 0.004); break;
      case 'emblem': chest(mesh(geo('emblemStar', () => starGeo(0.06, 0.026, 0.01)), mat, 0, 0, 0, { cast: false }), 0.22, 0, 0.004); break;
      case 'belt': {
        const y = s.bottom === 'pants' || s.bottom === 'shorts' ? 0.062 : 0.08;
        const band = mesh(geo(`belt${y}`, () => new THREE.TorusGeometry(0.163, 0.017, 8, 48)), mat, 0, y, 0);
        band.rotation.x = Math.PI / 2;
        band.scale.set(1, 1, 1.15);
        body.add(band);
        body.add(mesh(geo('buckle', () => new THREE.BoxGeometry(0.045, 0.034, 0.012)), mats.metal('#d9b44a', 0.3), 0, y, 0.175));
        break;
      }
      case 'stripe': {
        const band = mesh(geo('stripe', () => new THREE.TorusGeometry(r(0.2) + 0.002, 0.02, 8, 48)), mat, 0, 0.2, 0);
        band.rotation.x = Math.PI / 2;
        body.add(band);
        break;
      }
      case 'sash': {
        const y = s.top === 'crop' ? 0.135 : 0.1;
        const band = mesh(geo(`sash${y}`, () => new THREE.TorusGeometry(r(y) + 0.004, 0.02, 8, 48)), mat, 0, y, 0);
        band.rotation.x = Math.PI / 2;
        body.add(band);
        for (const side of [-1, 1]) {
          const loop = mesh(sphere(0.04, 16, 12), mat, side * 0.045, y + 0.01, -r(y) - 0.02);
          loop.scale.set(1, 0.7, 0.45);
          body.add(loop);
        }
        break;
      }
      case 'hood': {
        const h = mesh(geo('hoodDown', () => new THREE.TorusGeometry(0.1, 0.045, 12, 32)), mat, 0, 0.33, -0.1);
        h.rotation.x = Math.PI / 2 - 0.7;
        body.add(h);
        break;
      }
      case 'pouch': chest(mesh(geo('pouch', () => new THREE.BoxGeometry(0.15, 0.07, 0.01)), mat), 0.08, 0, 0.002); break;
      case 'bib': chest(mesh(sphere(0.075, 24, 16), mat), 0.28, 0, -0.006).scale.set(1, 0.8, 0.22); break;
      case 'apron': {
        const a = mesh(geo('apron', () => new THREE.BoxGeometry(0.27, 0.42, 0.012)), mat, 0, 0.1, 0.178);
        a.rotation.x = -0.06;
        body.add(a);
        break;
      }
      case 'scarf': {
        const ring = mesh(geo('scarfH', () => new THREE.TorusGeometry(0.11, 0.04, 12, 36)), mat, 0, 0.345, 0);
        ring.rotation.x = Math.PI / 2;
        body.add(ring);
        const end = mesh(capsule(0.032, 0.12), mat, -0.06, 0.25, 0.14);
        end.rotation.set(0.3, 0, 0.15);
        body.add(end);
        break;
      }
      case 'dupatta': case 'stole':
        body.add(mesh(geo(`drape${name}`, () => tube([[-0.13, -0.08, 0.17], [-0.125, 0.12, 0.155], [-0.115, 0.27, 0.105], [-0.145, 0.335, 0.0],
          [-0.07, 0.345, -0.125], [0.07, 0.345, -0.125], [0.145, 0.335, 0.0], [0.115, 0.27, 0.105], [0.125, 0.12, 0.155], [0.13, -0.08, 0.17]], name === 'stole' ? 0.022 : 0.027, 60)), mat));
        break;
      case 'pallu':
        body.add(mesh(geo('pallu', () => tube([[-0.19, 0.05, 0.06], [-0.1, 0.15, 0.16], [0.04, 0.25, 0.155], [0.12, 0.315, 0.075], [0.155, 0.335, -0.03],
          [0.135, 0.25, -0.15], [0.13, 0.05, -0.2], [0.13, -0.18, -0.22]], 0.034, 60)), mat));
        break;
      case 'border':
        if (out.skirt) {
          const ring = mesh(geo('skirtBorder', () => new THREE.TorusGeometry(0.272, 0.016, 8, 64)), mat, 0, -0.27 - WAIST, 0);
          ring.rotation.x = Math.PI / 2;
          out.skirt.add(ring);
        }
        break;
      case 'stethoscope': {
        const ring = mesh(geo('stethRing', () => new THREE.TorusGeometry(0.105, 0.009, 8, 40)), mat, 0, 0.33, 0.01);
        ring.rotation.x = Math.PI / 2 + 0.35;
        body.add(ring);
        body.add(mesh(geo('stethTube', () => tube([[-0.07, 0.31, 0.1], [-0.06, 0.22, 0.16], [-0.04, 0.15, 0.18]], 0.008, 16)), mat));
        const disc = mesh(geo('stethDisc', () => new THREE.CylinderGeometry(0.022, 0.022, 0.012, 20)), mats.metal('#d0d6dc', 0.25), -0.04, 0.14, 0.182);
        disc.rotation.x = Math.PI / 2;
        body.add(disc);
        break;
      }
      case 'cape': {
        const pivot = new THREE.Group();
        pivot.position.set(0, 0.335, -0.12);
        const cloak = mesh(geo('cape', () => {
          const g = new THREE.CylinderGeometry(0.16, 0.26, 0.62, 24, 4, true, Math.PI * 0.62, Math.PI * 0.76);
          g.translate(0, -0.31, 0.08);
          return g;
        }), capeMat(o.color(c)));
        pivot.add(cloak);
        body.add(pivot);
        out.cape = pivot;
        break;
      }
      case 'nehru': {
        // sleeveless jacket over the kurta, open at the bottom
        const vest = [[0.001, 0.0], [0.19, 0.0], [0.186, 0.12], [0.174, 0.24], [0.152, 0.31], [0.1, 0.355], [0.001, 0.36]];
        body.add(mesh(lathe('nehruVest', vest), mat));
        const band = mesh(geo('nehruCollar', () => new THREE.CylinderGeometry(0.092, 0.098, 0.04, 28, 1, true)), mat, 0, 0.36, 0);
        body.add(band);
        break;
      }
      case 'jewelry': {
        const gold = mats.metal(o.color(c), 0.22);
        const neck = mesh(geo('necklace', () => new THREE.TorusGeometry(0.11, 0.012, 8, 40)), gold, 0, 0.33, 0.02);
        neck.rotation.x = Math.PI / 2 + 0.55;
        body.add(neck);
        chest(mesh(sphere(0.024, 14, 10), mats.glossy('#d50000', 0.1), 0, 0, 0, { cast: false }), 0.27, 0, 0.012);
        break;
      }
      default: break; // head-wear is added by dressHead
    }
  }
  return out;
}

/** Hats and hoods that sit on the head. */
export function dressHead(head, R, o) {
  const ex = o.spec.extras || {};
  if (ex.hoodup) {
    const hood = new THREE.Group();
    hood.rotation.x = -0.6;
    hood.add(mesh(geo('hoodUp', () => new THREE.SphereGeometry(R * 1.14, 48, 24, 0, Math.PI * 2, 0, 1.62)), capeMat(o.color(ex.hoodup))));
    const rim = mesh(geo('hoodRim', () => new THREE.TorusGeometry(R * 1.14 * Math.sin(1.62), 0.02, 8, 48)), mats.cloth(o.color(ex.hoodup)), 0, R * 1.14 * Math.cos(1.62), 0);
    rim.rotation.x = Math.PI / 2;
    hood.add(rim);
    head.add(hood);
  }
  if (ex.beanie) {
    const mat = mats.cloth(o.color(ex.beanie));
    const cap = new THREE.Group();
    cap.rotation.x = -0.22;
    cap.add(mesh(geo('beanie', () => new THREE.SphereGeometry(R * 1.1, 48, 20, 0, Math.PI * 2, 0, 1.2)), mat));
    const fold = mesh(geo('beanieFold', () => new THREE.TorusGeometry(R * 1.1 * Math.sin(1.2), 0.032, 10, 48)), mats.cloth('#ffffff'), 0, R * 1.1 * Math.cos(1.2), 0);
    fold.rotation.x = Math.PI / 2;
    cap.add(fold);
    cap.add(mesh(sphere(0.05, 16, 12), mats.fur('#ffffff'), 0, R * 1.18, 0));
    head.add(cap);
  }
  if (ex.policecap) {
    const mat = mats.cloth(o.color(ex.policecap));
    const cap = new THREE.Group();
    cap.position.y = 0.17;
    cap.rotation.x = -0.12;
    cap.add(mesh(geo('pcBand', () => new THREE.CylinderGeometry(0.236, 0.232, 0.08, 40)), mats.cloth('#2a2f45'), 0, 0, 0));
    cap.add(mesh(geo('pcTop', () => new THREE.CylinderGeometry(0.285, 0.238, 0.08, 40)), mat, 0, 0.075, 0));
    const visor = mesh(geo('pcVisor', () => new THREE.CylinderGeometry(0.17, 0.17, 0.012, 32, 1, false, -Math.PI / 2, Math.PI)), mats.glossy('#141418', 0.2), 0, -0.035, 0.17);
    visor.rotation.set(0.3, Math.PI / 2, 0);
    visor.rotation.order = 'YXZ';
    cap.add(visor);
    cap.add(mesh(sphere(0.026, 14, 10), mats.glossy('#ffd23f', 0.3), 0, 0.02, 0.236));
    head.add(cap);
  }
  if (ex.chefhat) {
    const mat = mats.cloth(o.color(ex.chefhat));
    head.add(mesh(geo('chefBand', () => new THREE.CylinderGeometry(0.215, 0.205, 0.1, 36)), mat, 0, 0.2, -0.01));
    const puff = mesh(sphere(0.21, 32, 20), mat, 0, 0.36, -0.01);
    puff.scale.set(1.1, 0.75, 1.1);
    head.add(puff);
  }
  if (ex.nursecap) {
    const cap = mesh(geo('nurseCap', () => new THREE.BoxGeometry(0.2, 0.07, 0.12)), mats.cloth(o.color(ex.nursecap)), 0, 0.26, 0.04);
    cap.rotation.x = -0.35;
    head.add(cap);
    for (const [w, h] of [[0.045, 0.014], [0.014, 0.045]]) {
      const bar = mesh(new THREE.PlaneGeometry(w, h), mats.matte('#e53935'), 0, 0.272, 0.103, { cast: false });
      bar.rotation.x = -0.35;
      head.add(bar);
    }
  }
  if (ex.veil) {
    // bridal dupatta draped over the back of the head, gold edge framing the face
    const veil = new THREE.Group();
    veil.rotation.x = -0.95;
    const m = capeMat(o.color(ex.veil));
    m.transparent = true;
    m.opacity = 0.92;
    veil.add(mesh(geo('veil', () => new THREE.SphereGeometry(R * 1.16, 48, 24, 0, Math.PI * 2, 0, 1.75)), m));
    const edge = mesh(geo('veilEdge', () => new THREE.TorusGeometry(R * 1.16 * Math.sin(1.75), 0.014, 8, 48)), mats.metal('#ffcc33', 0.25), 0, R * 1.16 * Math.cos(1.75), 0);
    edge.rotation.x = Math.PI / 2;
    veil.add(edge);
    head.add(veil);
  }
  if (ex.jewelry) {
    // maang tikka: a chain along the parting with a pendant on the forehead
    const gold = mats.metal(o.color(ex.jewelry), 0.22);
    const chain = mesh(geo('tikkaChain', () => new THREE.CylinderGeometry(0.004, 0.004, 0.12, 6)), gold, 0, R * 0.78, R * 0.6);
    chain.rotation.x = 0.85;
    head.add(chain);
    head.add(mesh(sphere(0.02, 12, 10), gold, 0, R * 0.52, R * 0.87));
    head.add(mesh(sphere(0.011, 10, 8), mats.glossy('#d50000', 0.1), 0, R * 0.52, R * 0.87 + 0.016));
  }
  if (ex.safa) {
    // groom's turban: wrapped dome, layered bands, a gold brooch (kalgi) with a feather
    const cloth = mats.cloth(o.color(ex.safa));
    const dome = mesh(geo('safaDomeG', () => new THREE.SphereGeometry(R * 1.1, 48, 24, 0, Math.PI * 2, 0, 1.15)), cloth, 0, 0.04, -0.01);
    dome.rotation.x = -0.18;
    head.add(dome);
    for (let i = 0; i < 3; i++) {
      const band = mesh(geo(`safaBandG${i}`, () => new THREE.TorusGeometry(R * (1.02 - i * 0.04), 0.045, 12, 48)), cloth, 0, 0.12 + i * 0.055, -0.02 - i * 0.012);
      band.rotation.x = Math.PI / 2 + 0.16;
      band.rotation.z = (i - 1) * 0.1;
      head.add(band);
    }
    head.add(mesh(sphere(0.035, 16, 12), mats.metal('#ffcc33', 0.2), 0, 0.2, 0.24));
    head.add(mesh(sphere(0.014, 10, 8), mats.glossy('#2e7d32', 0.1), 0, 0.2, 0.272));
    const feather = mesh(geo('kalgi', () => new THREE.ConeGeometry(0.02, 0.16, 10)), mats.fur('#fff8e1'), 0.02, 0.3, 0.2);
    feather.rotation.z = -0.35;
    head.add(feather);
    const tail = mesh(new THREE.BoxGeometry(0.12, 0.26, 0.02), cloth, 0.03, 0.0, -0.27);
    tail.rotation.set(0.2, 0, 0.08);
    head.add(tail);
  }
  if (ex.tiara) {
    const gold = mats.metal(o.color(ex.tiara), 0.25);
    const t = new THREE.Group();
    t.position.set(0, 0.2, 0.01);
    t.rotation.x = -0.25;
    const band = mesh(geo('tiaraBand', () => new THREE.TorusGeometry(0.185, 0.012, 8, 40, Math.PI)), gold);
    band.rotation.x = Math.PI / 2;
    t.add(band);
    for (const a of [0.35, Math.PI / 2, Math.PI - 0.35]) {
      const spike = mesh(geo('tiaraSpike', () => new THREE.ConeGeometry(0.022, a === Math.PI / 2 ? 0.09 : 0.06, 8)), gold, Math.cos(a) * 0.185, 0.04, Math.sin(a) * 0.185);
      t.add(spike);
    }
    t.add(mesh(sphere(0.018, 12, 10), mats.glossy('#ff4fa3', 0.05), 0, 0.03, 0.195));
    head.add(t);
  }
}

function capeMat(color) {
  // double-sided so the inside shows; one per character (freed with it)
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.75, sheen: 0.7, sheenRoughness: 0.6, side: THREE.DoubleSide });
}

export function starGeo(outer, inner, depth) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer, a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    i ? shape.lineTo(Math.cos(a) * r, Math.sin(a) * r) : shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
}
