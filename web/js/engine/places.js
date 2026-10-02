// Everyday places in a child's life: school, classroom, hospital, police station, shopping mall,
// market, kitchen, city street and a birthday party. Same contract as the worlds in worlds.js.
import * as THREE from 'three';
import { mats, mesh, sphere, capsule, geo, lathe, tube, blob, rng, smoothstep, clamp, canvasTexture } from './util.js';
import { dirFrom, makeSky, terrain, grass, roundTree, addClouds, flowers, bench, bush, sunnyWorld, birds, lawn } from './worlds.js';
import { indiaFlag, stripedCone, buildGear } from './props.js';

export const PLACES = {
  school: 'School (outside)',
  classroom: 'Classroom',
  hospital: 'Hospital room',
  police: 'Police station',
  mall: 'Shopping mall',
  market: 'Market (bazaar)',
  kitchen: 'Kitchen & dining',
  street: 'City street',
  birthday: 'Birthday party',
  wedding: 'Wedding mandap (evening)',
  reception: 'Wedding reception stage',
};

const FONT = (px, w = 700) => `${w} ${px}px Fredoka, "Nirmala UI", system-ui, sans-serif`;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- small helpers ----------
function textTex(lines, { bg = '#ffffff', fg = '#222222', w = 512, h = 128, size = 70, stroke, radius = 0 } = {}) {
  return canvasTexture(w, h, (c) => {
    c.clearRect(0, 0, w, h);
    if (bg) {
      c.fillStyle = bg;
      c.beginPath(); c.roundRect(0, 0, w, h, radius); c.fill();
    }
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const ls = [].concat(lines);
    ls.forEach((t, i) => {
      const s = i === 0 ? size : size * 0.55;
      c.font = FONT(s);
      const y = h / 2 + (i - (ls.length - 1) / 2) * size * 0.85 + (i ? size * 0.12 : 0);
      if (stroke) { c.lineWidth = s * 0.14; c.strokeStyle = stroke; c.lineJoin = 'round'; c.strokeText(t, w / 2, y); }
      c.fillStyle = fg;
      c.fillText(t, w / 2, y);
    });
  }, { repeat: 1 });
}

function sign(lines, width, height, opts = {}) {
  const tex = textTex(lines, { w: 512, h: Math.round((512 * height) / width), ...opts });
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, transparent: !opts.bg && opts.bg !== undefined }), 0, 0, 0, { cast: false });
}

function tiles(a, b, n = 8, grout = 'rgba(0,0,0,0.08)') {
  return canvasTexture(512, 512, (c, w, h) => {
    const s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { c.fillStyle = (i + j) % 2 ? a : b; c.fillRect(i * s, j * s, s, s); }
    c.fillStyle = grout;
    for (let i = 0; i <= n; i++) { c.fillRect(i * s - 1, 0, 2, h); c.fillRect(0, i * s - 1, w, 2); }
  });
}

function planks(colors = ['#c98f5a', '#b97f4d', '#d39b64', '#bf8551']) {
  return canvasTexture(1024, 1024, (c, w, h) => {
    for (let i = 0; i < 16; i++) {
      c.fillStyle = colors[i % colors.length];
      c.fillRect(0, (i * h) / 16, w, h / 16);
      c.fillStyle = 'rgba(80,45,20,0.35)';
      c.fillRect(0, (i * h) / 16, w, 3);
      c.fillRect(((i * 397) % 7) * (w / 7), (i * h) / 16, 3, h / 16);
    }
  });
}

/** Wall paper: plain colour with an optional lower band (wainscot) and dots. */
function wallTex(color, { band, bandH = 0.32, dots } = {}) {
  return canvasTexture(256, 256, (c, w, h) => {
    c.fillStyle = color; c.fillRect(0, 0, w, h);
    if (dots) { c.fillStyle = dots; for (let i = 0; i < 18; i++) { c.beginPath(); c.arc((i * 71) % w, (i * 113) % (h * 0.65), 6, 0, 7); c.fill(); } }
    if (band) {
      c.fillStyle = band; c.fillRect(0, h * (1 - bandH), w, h * bandH);
      c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(0, h * (1 - bandH) - 6, w, 6);
    }
  });
}

/**
 * Floor, three walls and a ceiling; the front stays open for the camera. The floor runs on past
 * the open side so tall (9:16) shots, framed from further back, never see past its edge.
 */
const FLOOR_RUNOUT = 14;
function room({ W, D, H, floor, floorRepeat, wall, wallRepeat = 3 }) {
  const g = new THREE.Group();
  const [rx, ry] = floorRepeat || [W / 2, D / 2];
  floor.repeat.set(rx, (ry * (D + FLOOR_RUNOUT)) / D);
  const fl = mesh(new THREE.PlaneGeometry(W, D + FLOOR_RUNOUT), new THREE.MeshStandardMaterial({ map: floor, roughness: 0.45 }), 0, 0, FLOOR_RUNOUT / 2, { cast: false });
  fl.rotation.x = -Math.PI / 2;
  g.add(fl);
  const wallMat = (len) => {
    const t = wall.clone();
    t.needsUpdate = true;
    t.repeat.set(Math.max(1, Math.round(len / wallRepeat)), 1);
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 });
  };
  g.add(mesh(new THREE.PlaneGeometry(W, H), wallMat(W), 0, H / 2, -D / 2, { cast: false }));
  for (const s of [-1, 1]) {
    const side = mesh(new THREE.PlaneGeometry(D, H), wallMat(D), s * W / 2, H / 2, 0, { cast: false });
    side.rotation.y = -s * Math.PI / 2;
    g.add(side);
  }
  const ceil = mesh(new THREE.PlaneGeometry(W, D), mats.matte('#fffaf2'), 0, H, 0, { cast: false });
  ceil.rotation.x = Math.PI / 2;
  g.add(ceil);
  g.add(mesh(new THREE.BoxGeometry(W, 0.14, 0.05), mats.matte('#ffffff'), 0, 0.07, -D / 2 + 0.03, { cast: false }));
  return g;
}

function roomWorld(group, movers, { W, D, H, sun = 1.5, hemi = 0.85, exposure = 1.0, background = '#2b2233', sky = '#fff5e6', ground = '#b98a60' } = {}) {
  return {
    group, sky: null, background, sunDir: new THREE.Vector3(0.35, 0.75, 0.55).normalize(), movers, env: 'room',
    sun: { color: '#fff1dc', intensity: sun }, hemi: { sky, ground, intensity: hemi },
    fog: null, exposure, bounds: { minX: -W / 2 + 0.4, maxX: W / 2 - 0.4, maxZ: 12, maxY: H - 0.3 },
  };
}

let viewTex = null;
function skyWindow(w = 2.2, h = 1.6) {
  viewTex ??= canvasTexture(512, 512, (c, cw, ch) => {
    const g = c.createLinearGradient(0, 0, 0, ch);
    g.addColorStop(0, '#6ec3ff'); g.addColorStop(1, '#e7f6ff');
    c.fillStyle = g; c.fillRect(0, 0, cw, ch);
    c.fillStyle = '#ffffff';
    for (const [x, y, r] of [[120, 150, 50], [170, 140, 60], [220, 160, 45], [360, 250, 40], [400, 240, 55]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
    c.fillStyle = '#7cc36a'; c.fillRect(0, ch * 0.8, cw, ch * 0.2);
    c.fillStyle = '#4caf50'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(40 + i * 90, ch * 0.8, 40, 0, 7); c.fill(); }
  });
  const g = new THREE.Group();
  g.add(mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: viewTex }), 0, 0, 0.01, { cast: false }));
  const frame = mats.matte('#ffffff');
  for (const [fw, fh, x, y] of [[w + 0.2, 0.1, 0, h / 2], [w + 0.2, 0.1, 0, -h / 2], [0.1, h, -w / 2, 0], [0.1, h, w / 2, 0], [0.07, h, 0, 0]]) {
    g.add(mesh(new THREE.BoxGeometry(fw, fh, 0.1), frame, x, y, 0.05, { cast: false }));
  }
  g.add(mesh(new THREE.BoxGeometry(w + 0.3, 0.06, 0.22), frame, 0, -h / 2 - 0.05, 0.1, { cast: false }));
  return g;
}

function ceilingLights(group, H, spots) {
  for (const [x, z] of spots) group.add(mesh(new THREE.BoxGeometry(1.4, 0.05, 0.5), mats.glow('#fff8e6', 1.4), x, H - 0.03, z, { cast: false, receive: false }));
}

function wallClock() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 32).rotateX(Math.PI / 2), mats.glossy('#ff7043', 0.3)));
  g.add(mesh(new THREE.CircleGeometry(0.25, 32), mats.matte('#ffffff'), 0, 0, 0.032, { cast: false }));
  const hand = (len, a) => { const m = mesh(new THREE.BoxGeometry(0.02, len, 0.01), mats.matte('#222'), 0, 0, 0.04, { cast: false }); m.geometry.translate(0, len / 2, 0); m.rotation.z = a; g.add(m); };
  hand(0.16, -1.0); hand(0.21, 2.2);
  return g;
}

function plant(rand, size = 1) {
  const g = new THREE.Group();
  g.add(mesh(lathe('plantPot', [[0.001, 0], [0.22, 0], [0.28, 0.42], [0.3, 0.45], [0.001, 0.45]]), mats.glossy('#e07a4f', 0.5)));
  for (let i = 0; i < 5; i++) {
    const leaf = mesh(blob(0.22 + rand() * 0.1, rand() * 9, 0.25, 2), mats.fur(['#3e9e4a', '#4caf50', '#2f7d4f'][i % 3]), (rand() - 0.5) * 0.3, 0.6 + rand() * 0.45, (rand() - 0.5) * 0.3);
    g.add(leaf);
  }
  g.scale.setScalar(size);
  return g;
}

function table(w, d, h, top, legMat) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(w, 0.06, d), top, 0, h, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(0.07, h, 0.07), legMat || top, sx * (w / 2 - 0.08), h / 2, sz * (d / 2 - 0.08)));
  return g;
}

function chair(color) {
  const g = new THREE.Group();
  const m = mats.matte(color, 0.6);
  g.add(mesh(new THREE.BoxGeometry(0.5, 0.06, 0.5), m, 0, 0.48, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(0.05, 0.48, 0.05), m, sx * 0.21, 0.24, sz * 0.21));
  g.add(mesh(new THREE.BoxGeometry(0.5, 0.5, 0.05), m, 0, 0.75, -0.23));
  return g;
}

/** Building with a window grid painted on the front; optional sign and shop front. */
function building({ w, h, d = 5, color, win = '#9fd3ff', frame = '#ffffff', floors, cols, roof, shop }) {
  const g = new THREE.Group();
  const body = mats.matte(color, 0.85);
  g.add(mesh(new THREE.BoxGeometry(w, h, d), body, 0, h / 2, 0));
  const nf = floors || Math.max(1, Math.round(h / 3)), nc = cols || Math.max(1, Math.round(w / 2.4));
  const facade = canvasTexture(512, Math.round((512 * h) / w), (c, cw, ch) => {
    c.fillStyle = color; c.fillRect(0, 0, cw, ch);
    const fh = ch / nf, fw = cw / nc;
    for (let i = shop ? 1 : 0; i < nf; i++) for (let j = 0; j < nc; j++) {
      const x = j * fw + fw * 0.2, y = ch - (i + 1) * fh + fh * 0.22;
      c.fillStyle = frame; c.fillRect(x - 4, y - 4, fw * 0.6 + 8, fh * 0.55 + 8);
      c.fillStyle = win; c.fillRect(x, y, fw * 0.6, fh * 0.55);
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x + 4, y + 4, fw * 0.12, fh * 0.4);
    }
    if (shop) {
      c.fillStyle = '#3a3f4f'; c.fillRect(cw * 0.06, ch - fh * 0.85, cw * 0.88, fh * 0.85);
      c.fillStyle = '#bfe3ff'; c.fillRect(cw * 0.1, ch - fh * 0.75, cw * 0.5, fh * 0.75);
      c.fillStyle = '#7a4a2a'; c.fillRect(cw * 0.66, ch - fh * 0.75, cw * 0.22, fh * 0.75);
    }
  }, { repeat: 1 });
  facade.wrapS = facade.wrapT = THREE.ClampToEdgeWrapping;
  g.add(mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: facade, roughness: 0.8 }), 0, h / 2, d / 2 + 0.01, { cast: false }));
  g.add(mesh(new THREE.BoxGeometry(w + 0.3, 0.3, d + 0.3), mats.matte(roof || '#8d6e63', 0.8), 0, h + 0.15, 0));
  if (shop) {
    const s = sign(shop.text, w * 0.8, 0.7, { bg: shop.bg, fg: shop.fg || '#ffffff', size: 64, radius: 20 });
    s.position.set(0, (h / nf) + 0.05, d / 2 + 0.05);
    g.add(s);
    const awning = mesh(new THREE.BoxGeometry(w * 0.9, 0.08, 1.0), mats.cloth(shop.bg), 0, h / nf - 0.45, d / 2 + 0.5);
    awning.rotation.x = 0.25;
    g.add(awning);
  }
  return g;
}

/** Toy-like vehicles, front at +x. kind: car | taxi | police | ambulance | bus | rickshaw */
function vehicle(kind, color = '#e53935') {
  const g = new THREE.Group();
  const glass = mats.glossy('#2b3a4a', 0.05), black = mats.matte('#1d1d1f', 0.7), chrome = mats.metal('#d0d6dc', 0.25);
  const wheels = [];
  const wheel = (x, z, r) => {
    const w = new THREE.Group();
    w.position.set(x, r, z);
    w.add(mesh(geo(`wheel${r}`, () => new THREE.CylinderGeometry(r, r, r * 0.6, 22).rotateX(Math.PI / 2)), black));
    w.add(mesh(geo(`rim${r}`, () => new THREE.CylinderGeometry(r * 0.55, r * 0.55, r * 0.62, 16).rotateX(Math.PI / 2)), chrome));
    g.add(w);
    wheels.push(w);
  };
  const lights = (x, y, z, col) => g.add(mesh(sphere(0.11, 12, 10), mats.glow(col, 1.6), x, y, z, { cast: false }));
  if (kind === 'bus') {
    const paint = mats.glossy('#ffc107', 0.3);
    g.add(mesh(new THREE.BoxGeometry(7.5, 2.4, 2.4), paint, 0, 1.75, 0));
    for (const s of [-1, 1]) {
      g.add(mesh(new THREE.BoxGeometry(6.2, 0.75, 0.02), glass, -0.3, 2.35, s * 1.21, { cast: false }));
      const t = sign('SCHOOL BUS', 4.2, 0.45, { bg: null, fg: '#1d1d1f', size: 80 });
      t.position.set(-0.4, 1.45, s * 1.215);
      if (s < 0) t.rotation.y = Math.PI;
      g.add(t);
    }
    g.add(mesh(new THREE.BoxGeometry(0.02, 1.0, 2.1), glass, 3.76, 2.3, 0, { cast: false }));
    g.add(mesh(new THREE.BoxGeometry(0.2, 0.3, 2.45), black, 3.8, 0.75, 0));
    lights(3.77, 1.0, 0.85, '#fff4c2'); lights(3.77, 1.0, -0.85, '#fff4c2');
    for (const x of [-2.4, 2.3]) for (const z of [-1.05, 1.05]) wheel(x, z, 0.5);
  } else if (kind === 'rickshaw') {
    const green = mats.glossy('#2e9e4f', 0.3), yellow = mats.glossy('#ffd23f', 0.3);
    g.add(mesh(new THREE.BoxGeometry(2.2, 0.5, 1.3), green, 0, 0.6, 0));
    g.add(mesh(new THREE.BoxGeometry(0.5, 0.9, 0.9), green, 1.0, 1.05, 0));
    const roof = mesh(new THREE.CapsuleGeometry(0.65, 1.3, 6, 16).rotateZ(Math.PI / 2).scale(1, 0.9, 1), yellow, -0.15, 1.35, 0);
    roof.scale.set(1, 1, 1);
    g.add(roof);
    g.add(mesh(new THREE.BoxGeometry(0.6, 0.35, 1.1), black, -0.4, 1.0, 0));
    lights(1.27, 1.25, 0, '#fff4c2');
    wheel(1.0, 0, 0.3); wheel(-0.75, 0.62, 0.3); wheel(-0.75, -0.62, 0.3);
  } else {
    const van = kind === 'ambulance';
    const body = mats.glossy(kind === 'police' || van ? '#fbfbfb' : kind === 'taxi' ? '#ffcc00' : color, 0.25);
    if (van) {
      g.add(mesh(new THREE.BoxGeometry(4.4, 1.9, 1.9), body, -0.2, 1.3, 0));
      g.add(mesh(new THREE.BoxGeometry(0.02, 0.7, 1.6), glass, 2.01, 1.75, 0, { cast: false }));
    } else {
      g.add(mesh(new THREE.BoxGeometry(4.0, 0.75, 1.8), body, 0, 0.7, 0));
      const cab = mesh(new THREE.BoxGeometry(2.2, 0.75, 1.62), body, -0.25, 1.42, 0);
      g.add(cab);
      g.add(mesh(new THREE.BoxGeometry(2.0, 0.6, 1.64), glass, -0.25, 1.45, 0, { cast: false }));
      g.add(mesh(new THREE.BoxGeometry(2.24, 0.1, 1.66), body, -0.25, 1.82, 0));
    }
    for (const x of [-1.3, 1.3]) for (const z of [-0.85, 0.85]) wheel(x, z, 0.37);
    lights(2.0, 0.78, 0.6, '#fff4c2'); lights(2.0, 0.78, -0.6, '#fff4c2');
    lights(-2.0, 0.78, 0.6, '#ff3b3b'); lights(-2.0, 0.78, -0.6, '#ff3b3b');
    if (kind === 'police' || van) {
      const band = mats.glossy(van ? '#e53935' : '#1e4fbf', 0.3);
      for (const s of [-1, 1]) {
        g.add(mesh(new THREE.BoxGeometry(4.02, 0.22, 0.02), band, 0, van ? 1.0 : 0.72, s * (van ? 0.96 : 0.91), { cast: false }));
        const t = sign(van ? ['AMBULANCE'] : ['POLICE'], 2.0, 0.42, { bg: null, fg: van ? '#e53935' : '#1e4fbf', size: 84 });
        t.position.set(van ? -0.4 : -0.1, van ? 1.55 : 0.98, s * (van ? 0.965 : 0.915));
        if (s < 0) t.rotation.y = Math.PI;
        g.add(t);
      }
      const red = new THREE.MeshBasicMaterial({ color: '#ff2a2a' }), blue = new THREE.MeshBasicMaterial({ color: '#2a6bff' });
      const top = van ? 2.3 : 1.92;
      g.add(mesh(new THREE.BoxGeometry(0.3, 0.16, 0.5), red, 0, top, 0.27, { cast: false }), mesh(new THREE.BoxGeometry(0.3, 0.16, 0.5), van ? red : blue, 0, top, -0.27, { cast: false }));
      g.userData.siren = [red, van ? red : blue];
      if (van) for (const s of [-1, 1]) {
        const cross = sign('+', 0.7, 0.7, { bg: '#ffffff', fg: '#e53935', size: 150 });
        cross.position.set(-1.6, 1.55, s * 0.965);
        if (s < 0) cross.rotation.y = Math.PI;
        g.add(cross);
      }
    }
  }
  g.userData.wheels = wheels;
  return g;
}

function flagPole(height = 6) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.06, 0.08, height, 12), mats.metal('#e8e8e8', 0.3), 0, height / 2, 0));
  g.add(mesh(sphere(0.1, 12, 10), mats.metal('#ffd23f', 0.3), 0, height + 0.05, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.3, 24), mats.matte('#bdb6a8'), 0, 0.15, 0));
  const flag = mesh(new THREE.PlaneGeometry(1.5, 1.0, 12, 1).translate(0.75, 0, 0), new THREE.MeshStandardMaterial({ map: indiaFlag(), side: THREE.DoubleSide, roughness: 0.8 }), 0.07, height - 0.6, 0, { cast: false });
  g.add(flag);
  g.userData.flag = flag;
  return g;
}

/** Make a flag plane ripple; returns a mover. */
function waveFlag(flag) {
  const p = flag.geometry.attributes.position, base = p.array.slice();
  return (t) => {
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3];
      p.setZ(i, Math.sin(x * 4 - t * 5) * 0.08 * x);
    }
    p.needsUpdate = true;
  };
}

function lampPost(h = 3.6) {
  const g = new THREE.Group();
  const iron = mats.metal('#2f3640', 0.5);
  g.add(mesh(new THREE.CylinderGeometry(0.06, 0.09, h, 10), iron, 0, h / 2, 0));
  g.add(mesh(geo(`lampArm${h}`, () => tube([[0, h - 0.1, 0], [0, h + 0.2, 0.1], [0, h + 0.15, 0.45]], 0.04, 12)), iron));
  g.add(mesh(sphere(0.16, 16, 12), mats.glow('#fff1c4', 1.3), 0, h + 0.0, 0.48, { cast: false }));
  return g;
}

function cone() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(0.42, 0.04, 0.42), mats.matte('#e8592b'), 0, 0.02, 0));
  g.add(mesh(new THREE.ConeGeometry(0.16, 0.6, 16), mats.glossy('#ff6d2e', 0.4), 0, 0.33, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.095, 0.115, 0.1, 16), mats.matte('#ffffff'), 0, 0.33, 0));
  return g;
}

function barricade() {
  const g = new THREE.Group();
  const stripes = canvasTexture(256, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#e53935'; c.beginPath(); c.moveTo(i * 40 - 20, h); c.lineTo(i * 40 + 20, 0); c.lineTo(i * 40 + 60, 0); c.lineTo(i * 40 + 20, h); c.fill(); } }, { repeat: 1 });
  g.add(mesh(new THREE.BoxGeometry(2.0, 0.28, 0.06), new THREE.MeshStandardMaterial({ map: stripes, roughness: 0.6 }), 0, 0.85, 0));
  for (const x of [-0.85, 0.85]) {
    g.add(mesh(new THREE.BoxGeometry(0.06, 1.0, 0.06), mats.matte('#eeeeee'), x, 0.5, 0));
    g.add(mesh(new THREE.BoxGeometry(0.08, 0.06, 0.5), mats.matte('#333333'), x, 0.03, 0));
  }
  return g;
}

function balloon(color, h = 1.6) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.004, 0.004, h, 4), mats.matte('#ffffff'), 0, h / 2, 0, { cast: false }));
  const b = mesh(sphere(0.2, 24, 16), mats.glossy(color, 0.1), 0, h + 0.2, 0);
  b.scale.set(1, 1.18, 1);
  g.add(b);
  g.add(mesh(new THREE.ConeGeometry(0.03, 0.05, 10), mats.glossy(color, 0.1), 0, h - 0.02, 0));
  return g;
}

/** A string of little triangle flags (or letter pennants) hung between two points. */
function bunting(from, to, colors, { letters, size = 0.35, sag = 0.4 } = {}) {
  const g = new THREE.Group();
  const n = letters ? letters.length : Math.round(from.distanceTo(to) / (size * 1.1));
  const at = (k) => new THREE.Vector3().lerpVectors(from, to, k).add(V(0, -Math.sin(Math.PI * k) * sag, 0));
  const pts = Array.from({ length: 21 }, (_, i) => at(i / 20));
  g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.012, 6), mats.matte('#ffffff'), 0, 0, 0, { cast: false }));
  const dir = new THREE.Vector3().subVectors(to, from).normalize();
  for (let i = 0; i < n; i++) {
    const k = (i + 0.5) / n, p = at(k);
    const col = colors[i % colors.length];
    let mat;
    if (letters) {
      mat = new THREE.MeshStandardMaterial({ map: textTex(letters[i], { bg: col, fg: '#ffffff', w: 128, h: 128, size: 90, stroke: 'rgba(0,0,0,0.25)' }), side: THREE.DoubleSide, roughness: 0.7 });
    } else mat = mats.cloth(col);
    const tri = new THREE.Shape([new THREE.Vector2(-size / 2, 0), new THREE.Vector2(size / 2, 0), new THREE.Vector2(0, -size * 1.15)]);
    const shapeGeo = new THREE.ShapeGeometry(tri);
    if (letters) {
      // map the letter square onto the pennant
      const uv = shapeGeo.attributes.uv, pos = shapeGeo.attributes.position;
      for (let j = 0; j < uv.count; j++) uv.setXY(j, pos.getX(j) / size + 0.5, 1 + pos.getY(j) / (size * 1.15) * 0.9);
    }
    const flag = mesh(shapeGeo, letters ? mat : doubleCloth(col), p.x, p.y, p.z, { cast: false });
    flag.rotation.y = Math.atan2(-dir.z, dir.x);
    g.add(flag);
  }
  return g;
}
const dcCache = new Map();
function doubleCloth(c) {
  if (!dcCache.has(c)) { const m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, side: THREE.DoubleSide }); m.userData.shared = true; dcCache.set(c, m); }
  return dcCache.get(c);
}

// flat ground for towns: level stage, gentle hills far away
const town = (x, z) => smoothstep(38, 80, Math.hypot(x, z)) * 6;

// ---------- the places ----------
export const PLACE_BUILDERS = {
  async classroom() {
    const rand = rng(201), movers = [];
    const W = 14, D = 10, H = 4.2;
    const group = room({ W, D, H, floor: tiles('#efe6d2', '#e2d6bd', 8), floorRepeat: [3, 2], wall: wallTex('#fff3d6', { band: '#9fd3a8' }) });
    // chalkboard
    const boardTex = canvasTexture(1024, 320, (c, w, h) => {
      c.fillStyle = '#2f5d46'; c.fillRect(0, 0, w, h);
      c.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 40; i++) c.fillRect((i * 97) % w, (i * 53) % h, 60, 3);
      c.fillStyle = '#ffffff'; c.font = FONT(64); c.textAlign = 'left'; c.textBaseline = 'middle';
      c.fillText('A  B  C  D', 60, 80);
      c.fillText('1 + 2 = 3', 60, 190);
      c.fillStyle = '#ffe082'; c.fillText('Good Morning!', 520, 80);
      c.strokeStyle = '#ffffff'; c.lineWidth = 5;
      c.beginPath(); c.arc(870, 220, 45, 0, 7); c.stroke();
      for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.28; c.beginPath(); c.moveTo(870 + Math.cos(a) * 58, 220 + Math.sin(a) * 58); c.lineTo(870 + Math.cos(a) * 80, 220 + Math.sin(a) * 80); c.stroke(); }
      c.strokeStyle = '#ff9ec4'; c.strokeRect(560, 180, 110, 90); c.beginPath(); c.moveTo(550, 185); c.lineTo(615, 130); c.lineTo(680, 185); c.stroke();
    }, { repeat: 1 });
    group.add(mesh(new THREE.BoxGeometry(6.4, 2.2, 0.08), mats.matte('#a0683a', 0.7), 0, 2.15, -D / 2 + 0.04));
    group.add(mesh(new THREE.PlaneGeometry(6.1, 1.9), new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.95 }), 0, 2.15, -D / 2 + 0.09, { cast: false }));
    group.add(mesh(new THREE.BoxGeometry(6.2, 0.06, 0.16), mats.matte('#a0683a', 0.7), 0, 1.06, -D / 2 + 0.12));
    for (const [x, c] of [[-1.5, '#ffffff'], [-1.3, '#ffd23f'], [1.8, '#ff9ec4']]) group.add(mesh(new THREE.BoxGeometry(0.1, 0.025, 0.025), mats.matte(c), x, 1.1, -D / 2 + 0.13));
    // alphabet strip
    const abc = canvasTexture(2048, 64, (c, w, h) => {
      const cols = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa'];
      for (let i = 0; i < 26; i++) {
        c.fillStyle = cols[i % 6]; c.fillRect(i * (w / 26) + 4, 4, w / 26 - 8, h - 8);
        c.fillStyle = '#ffffff'; c.font = FONT(46); c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(String.fromCharCode(65 + i), i * (w / 26) + w / 52, h / 2 + 2);
      }
    }, { repeat: 1 });
    group.add(mesh(new THREE.PlaneGeometry(12.5, 0.38), new THREE.MeshStandardMaterial({ map: abc, roughness: 0.8 }), 0, 3.65, -D / 2 + 0.02, { cast: false }));
    // bulletin board with drawings
    group.add(mesh(new THREE.BoxGeometry(2.4, 1.5, 0.05), mats.matte('#c8955c', 0.95), 5.0, 2.0, -D / 2 + 0.03));
    for (let i = 0; i < 6; i++) {
      const p = mesh(new THREE.PlaneGeometry(0.55, 0.42), mats.matte(['#ffffff', '#fff59d', '#b3e5fc', '#f8bbd0'][i % 4]), 4.2 + (i % 3) * 0.78, 2.3 - Math.floor(i / 3) * 0.6, -D / 2 + 0.06, { cast: false });
      p.rotation.z = (rand() - 0.5) * 0.15;
      group.add(p);
      group.add(mesh(sphere(0.06, 10, 8), mats.glossy(['#e53935', '#43a047', '#1e88e5'][i % 3], 0.4), p.position.x, p.position.y - 0.02, -D / 2 + 0.07, { cast: false }));
    }
    const clk = wallClock();
    clk.position.set(-5.2, 2.8, -D / 2 + 0.05);
    group.add(clk);
    // teacher's desk with globe, books and an apple
    const tdesk = table(1.9, 0.9, 0.8, mats.matte('#b07a45', 0.6));
    tdesk.add(mesh(new THREE.BoxGeometry(1.8, 0.7, 0.05), mats.matte('#a0683a', 0.6), 0, 0.42, 0.4));
    tdesk.add(mesh(sphere(0.18, 24, 16), mats.glossy('#2f7de1', 0.3), -0.55, 1.18, 0));
    tdesk.add(mesh(new THREE.CylinderGeometry(0.02, 0.1, 0.25, 12), mats.metal('#c9a227', 0.3), -0.55, 0.95, 0));
    for (let i = 0; i < 3; i++) tdesk.add(mesh(new THREE.BoxGeometry(0.42, 0.07, 0.3), mats.cloth(['#e53935', '#43a047', '#fdd835'][i]), 0.35, 0.87 + i * 0.07, -0.05));
    tdesk.add(mesh(sphere(0.08, 16, 12), mats.glossy('#e3262f', 0.25), 0.0, 0.91, 0.15));
    tdesk.position.set(-4.6, 0, -3.3);
    tdesk.rotation.y = 0.35;
    group.add(tdesk);
    const tchair = chair('#6d4c41');
    tchair.position.set(-4.95, 0, -4.05);
    tchair.rotation.y = 0.35;
    group.add(tchair);
    // pupils' desks (facing the board)
    for (const [x, z] of [[-4.9, -0.6], [-4.9, 1.6], [4.9, -1.4], [4.9, 0.9]]) {
      const d = buildGear('desk');
      d.scale.setScalar(1.25);
      d.position.set(x, 0, z);
      d.rotation.y = Math.PI + (x < 0 ? -0.35 : 0.35);
      group.add(d);
    }
    // windows on the left wall, cubbies with school bags on the right
    for (const z of [-2.2, 1.6]) {
      const w = skyWindow(2.0, 1.5);
      w.position.set(-W / 2 + 0.02, 2.2, z);
      w.rotation.y = Math.PI / 2;
      group.add(w);
    }
    const cubby = new THREE.Group();
    cubby.add(mesh(new THREE.BoxGeometry(0.5, 1.2, 2.4), mats.matte('#f3e3c7', 0.7), 0, 0.6, 0));
    for (let i = 0; i < 6; i++) {
      const bag = mesh(new THREE.CapsuleGeometry(0.15, 0.12, 6, 12), mats.cloth(['#e53935', '#1e88e5', '#43a047', '#fb8c00', '#8e24aa', '#fdd835'][i]), -0.2, 0.32 + Math.floor(i / 3) * 0.55, -0.8 + (i % 3) * 0.8);
      bag.scale.set(0.8, 1, 1.1);
      cubby.add(bag);
    }
    cubby.position.set(W / 2 - 0.3, 0, -2.6);
    group.add(cubby);
    const planets = canvasTexture(512, 360, (c, w, h) => {
      c.fillStyle = '#1a2350'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#ffffff'; c.font = FONT(40); c.textAlign = 'center'; c.fillText('Our Solar System', w / 2, 46);
      [['#ffb300', 60, 60], ['#9e9e9e', 120, 14], ['#ffcc80', 170, 20], ['#42a5f5', 230, 22], ['#ef5350', 290, 17], ['#ffb74d', 360, 40], ['#ffe0b2', 445, 32]].forEach(([col, x, r]) => { c.fillStyle = col; c.beginPath(); c.arc(x, 210, r, 0, 7); c.fill(); });
    }, { repeat: 1 });
    const poster = mesh(new THREE.PlaneGeometry(2.0, 1.4), new THREE.MeshStandardMaterial({ map: planets, roughness: 0.8 }), W / 2 - 0.02, 2.3, 1.2, { cast: false });
    poster.rotation.y = -Math.PI / 2;
    group.add(poster);
    const p1 = plant(rand, 1.2);
    p1.position.set(6.2, 0, 3.0);
    group.add(p1);
    ceilingLights(group, H, [[-3, -2], [3, -2], [-3, 1.5], [3, 1.5]]);
    return roomWorld(group, movers, { W, D, H, sun: 1.5, hemi: 0.9, exposure: 1.0 });
  },

  async school() {
    const rand = rng(211), group = new THREE.Group(), movers = [], uniforms = { uTime: { value: 0 } };
    const sunDir = dirFrom(-35, 42);
    const sky = makeSky(sunDir);
    group.add(sky);
    const paved = (x, z) => Math.abs(x) < 17 && z > -13 && z < 5;
    group.add(terrain({ height: town, color: (h, n, x, z) => (paved(x, z) ? new THREE.Color('#ddd3c2').lerp(new THREE.Color('#cfc3ae'), clamp(n + 0.5, 0, 1)) : lawn(h, n)) }));
    group.add(grass(town, { rand, uniforms, count: 16000, radius: 34, skip: (x, z) => paved(x + Math.sign(x) * 0.5, z + 0.5) }));
    // the school: long two-storey block with a central tower
    const main = building({ w: 24, h: 7, d: 5, color: '#fff1d0', win: '#8fd0ff', floors: 2, cols: 9, roof: '#d9534f' });
    main.position.set(0, 0, -15);
    group.add(main);
    const tower = building({ w: 5, h: 9, d: 5.6, color: '#ffe0a3', win: '#8fd0ff', floors: 3, cols: 2, roof: '#d9534f' });
    tower.position.set(0, 0, -14.6);
    group.add(tower);
    const door = mesh(new THREE.BoxGeometry(2.0, 2.6, 0.1), mats.glossy('#2f6fdf', 0.3), 0, 1.3, -11.75);
    group.add(door);
    for (let i = 0; i < 3; i++) group.add(mesh(new THREE.BoxGeometry(4 - i * 0.6, 0.15, 0.6), mats.matte('#bdb6a8'), 0, 0.075 + i * 0.15, -11.2 - i * 0.3));
    const sch = sign(['SCHOOL', 'विद्यालय'], 4.6, 1.3, { bg: '#2f6fdf', fg: '#ffffff', size: 92, radius: 24 });
    sch.position.set(0, 3.5, -11.73);
    group.add(sch);
    const clk = wallClock();
    clk.scale.setScalar(1.7);
    clk.position.set(0, 7.9, -11.75);
    group.add(clk);
    // flag, bus, hopscotch, benches, trees
    const fp = flagPole(7);
    fp.position.set(-7, 0, -8);
    group.add(fp);
    movers.push(waveFlag(fp.userData.flag));
    const bus = vehicle('bus');
    bus.position.set(10.5, 0, -8.5);
    bus.rotation.y = 0.35;
    group.add(bus);
    const hop = canvasTexture(256, 512, (c, w, h) => {
      c.clearRect(0, 0, w, h); c.strokeStyle = '#ffffff'; c.lineWidth = 6; c.fillStyle = '#ffffff'; c.font = FONT(50); c.textAlign = 'center'; c.textBaseline = 'middle';
      const box = (x, y, n) => { c.strokeRect(x, y, 80, 80); c.fillText(String(n), x + 40, y + 42); };
      box(88, 420, 1); box(88, 340, 2); box(48, 260, 3); box(128, 260, 4); box(88, 180, 5); box(48, 100, 6); box(128, 100, 7); box(88, 20, 8);
    }, { repeat: 1 });
    const hs = mesh(new THREE.PlaneGeometry(1.2, 2.4), new THREE.MeshStandardMaterial({ map: hop, transparent: true, roughness: 1 }), 3.8, 0.012, -2.2, { cast: false });
    hs.rotation.set(-Math.PI / 2, 0, 0.3);
    group.add(hs);
    for (const [x, z, r] of [[-11, -4, 0.6], [12.5, -2, -0.9]]) { const b = bench(); b.position.set(x, 0, z); b.rotation.y = r; group.add(b); }
    for (const x of [-10, -6, 6, 10]) { const b = bush(rand); b.position.set(x, 0.3, -12.2); b.scale.set(1.6, 1, 1); group.add(b); }
    for (const [x, z] of [[-15, -6], [-17, 1], [16, -9], [18, 2], [-20, -12], [21, -13]]) {
      const tr = roundTree(rand);
      tr.position.set(x, 0, z);
      tr.scale.setScalar(1.2 + rand() * 0.4);
      group.add(tr);
    }
    group.add(flowers(town, rand, 140, 12, ['#ff6fae', '#ffd23f', '#ffffff'], (x, z) => !(z < -11.6 && z > -12.8 && Math.abs(x) > 3)));
    addClouds(group, rand, movers);
    await birds(group, movers, 'Parrot', 2, rand);
    return sunnyWorld(group, sky, sunDir, movers, uniforms);
  },

  async hospital() {
    const rand = rng(221), movers = [];
    const W = 12, D = 9, H = 3.8;
    const floorTex = tiles('#e4edf2', '#d6e2ea', 8, 'rgba(120,140,160,0.25)');
    const group = room({ W, D, H, floor: floorTex, floorRepeat: [3, 2], wall: wallTex('#f7fbfd', { band: '#bfe8dc', bandH: 0.3 }) });
    const white = mats.glossy('#f4f7fa', 0.25), steel = mats.metal('#c8ced6', 0.3);
    const hospitalBed = (x) => {
      const b = new THREE.Group();
      b.add(mesh(new THREE.BoxGeometry(1.1, 0.12, 2.1), steel, 0, 0.55, 0));
      for (const sx of [-0.48, 0.48]) for (const sz of [-0.95, 0.95]) {
        b.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5), steel, sx, 0.27, sz));
        b.add(mesh(sphere(0.05, 10, 8), mats.matte('#333'), sx, 0.05, sz));
      }
      b.add(mesh(new THREE.BoxGeometry(1.0, 0.16, 1.3), mats.cloth('#ffffff'), 0, 0.69, 0.35));
      const back = mesh(new THREE.BoxGeometry(1.0, 0.16, 0.8), mats.cloth('#ffffff'), 0, 0.85, -0.6);
      back.rotation.x = 0.45;
      b.add(back);
      const pillow = mesh(sphere(0.3, 20, 14), mats.cloth('#ffffff'), 0, 1.05, -0.78);
      pillow.scale.set(1.3, 0.35, 0.8);
      pillow.rotation.x = 0.45;
      b.add(pillow);
      b.add(mesh(new THREE.BoxGeometry(1.04, 0.12, 1.2), mats.cloth('#9fd8f5'), 0, 0.8, 0.4));
      b.add(mesh(new THREE.BoxGeometry(1.1, 0.75, 0.06), white, 0, 0.9, -1.07));
      b.add(mesh(new THREE.BoxGeometry(1.1, 0.45, 0.06), white, 0, 0.75, 1.07));
      for (const s of [-1, 1]) b.add(mesh(new THREE.BoxGeometry(0.03, 0.04, 1.0), steel, s * 0.55, 0.95, 0.1));
      b.position.set(x, 0, -D / 2 + 1.2);
      return b;
    };
    group.add(hospitalBed(-3.4), hospitalBed(1.0));
    // curtain between beds, IV stand, heart monitor, bedside table
    const curtain = mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.3, 24, 1, true, Math.PI * 0.85, Math.PI * 0.3), new THREE.MeshStandardMaterial({ color: '#a8dcc8', roughness: 0.9, side: THREE.DoubleSide }), -2.3, 1.5, -D / 2 + 2.3, { cast: false });
    curtain.scale.set(0.6, 1, 1.4);
    group.add(curtain);
    group.add(mesh(new THREE.CylinderGeometry(0.015, 0.015, 2.6), steel, -1.2, H - 0.25, -D / 2 + 1.5).rotateX(Math.PI / 2));
    const iv = new THREE.Group();
    iv.add(mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.9), steel, 0, 0.95, 0));
    iv.add(mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.04, 5), steel, 0, 0.05, 0));
    iv.add(mesh(new THREE.BoxGeometry(0.18, 0.28, 0.06), new THREE.MeshPhysicalMaterial({ color: '#e8f6ff', transparent: true, opacity: 0.7, roughness: 0.1 }), 0.12, 1.7, 0));
    iv.add(mesh(geo('ivTube', () => tube([[0.12, 1.55, 0], [0.2, 1.2, 0.05], [0.4, 0.95, 0.1]], 0.006, 12)), mats.matte('#ffffff')));
    iv.position.set(-4.4, 0, -D / 2 + 1.0);
    group.add(iv);
    const monTex = canvasTexture(256, 160, (c, w, h) => {
      c.fillStyle = '#071d14'; c.fillRect(0, 0, w, h); c.strokeStyle = '#39ff8a'; c.lineWidth = 4; c.beginPath();
      for (let x = 0; x < w; x += 4) { const k = x % 80; const y = h / 2 - (k > 30 && k < 36 ? 50 : k > 36 && k < 42 ? -30 : 0); x ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.stroke(); c.fillStyle = '#39ff8a'; c.font = FONT(30); c.fillText('♥ 82', 10, 34);
    }, { repeat: 1 });
    const monitor = new THREE.Group();
    monitor.add(mesh(new THREE.BoxGeometry(0.6, 0.42, 0.25), mats.glossy('#dfe5ea', 0.3), 0, 0, 0));
    monitor.add(mesh(new THREE.PlaneGeometry(0.5, 0.32), new THREE.MeshBasicMaterial({ map: monTex }), 0, 0, 0.126, { cast: false }));
    monitor.position.set(2.3, 1.8, -D / 2 + 0.25);
    group.add(monitor);
    const side = table(0.55, 0.45, 0.65, mats.matte('#e8eef2', 0.5));
    side.add(mesh(lathe('vase', [[0.001, 0], [0.08, 0], [0.1, 0.12], [0.06, 0.25], [0.07, 0.3], [0.001, 0.3]]), mats.glossy('#7ad3ff', 0.1), 0, 0.68, 0));
    for (let i = 0; i < 5; i++) side.add(mesh(sphere(0.05, 10, 8), mats.fur(['#ff6fae', '#ffd23f', '#ffffff'][i % 3]), (rand() - 0.5) * 0.15, 1.05 + rand() * 0.1, (rand() - 0.5) * 0.15));
    side.position.set(-0.4, 0, -D / 2 + 0.6);
    group.add(side);
    // red cross sign, get-well banner, window, medicine cabinet, poster, chair, wheelchair
    const cross = sign('+', 0.8, 0.8, { bg: '#ffffff', fg: '#e53935', size: 170, radius: 60 });
    cross.position.set(-1.2, 2.9, -D / 2 + 0.02);
    group.add(cross);
    const banner = sign('Get well soon!', 3.0, 0.5, { bg: '#ffecb3', fg: '#e65100', size: 64, radius: 20 });
    banner.position.set(2.0, 3.05, -D / 2 + 0.02);
    group.add(banner);
    const win = skyWindow(2.0, 1.4);
    win.position.set(4.3, 2.0, -D / 2 + 0.01);
    group.add(win);
    const cab = new THREE.Group();
    cab.add(mesh(new THREE.BoxGeometry(1.0, 1.2, 0.35), white, 0, 0, 0));
    const cabCross = sign('+', 0.35, 0.35, { bg: null, fg: '#e53935', size: 150 });
    cabCross.position.set(0, 0.2, 0.18);
    cab.add(cabCross);
    cab.position.set(W / 2 - 0.2, 2.0, -1.2);
    cab.rotation.y = -Math.PI / 2;
    group.add(cab);
    const wash = canvasTexture(320, 420, (c, w, h) => {
      c.fillStyle = '#e3f2fd'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#1565c0'; c.font = FONT(38); c.textAlign = 'center'; c.fillText('Wash your', w / 2, 60); c.fillText('hands!', w / 2, 105);
      c.fillStyle = '#ffcc80'; c.beginPath(); c.ellipse(w / 2 - 40, 260, 50, 80, -0.3, 0, 7); c.fill(); c.beginPath(); c.ellipse(w / 2 + 40, 260, 50, 80, 0.3, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(70 + (i * 53) % 180, 180 + (i * 37) % 160, 14, 0, 7); c.fill(); }
    }, { repeat: 1 });
    const poster = mesh(new THREE.PlaneGeometry(0.9, 1.2), new THREE.MeshStandardMaterial({ map: wash }), -W / 2 + 0.02, 1.9, -0.5, { cast: false });
    poster.rotation.y = Math.PI / 2;
    group.add(poster);
    const visit = chair('#4db6ac');
    visit.position.set(3.3, 0, -2.6);
    visit.rotation.y = -0.6;
    group.add(visit);
    const wc = new THREE.Group();
    for (const s of [-1, 1]) {
      const wh = mesh(new THREE.TorusGeometry(0.32, 0.03, 8, 28), mats.matte('#333'), s * 0.3, 0.34, 0);
      wh.rotation.y = Math.PI / 2;
      wc.add(wh);
    }
    wc.add(mesh(new THREE.BoxGeometry(0.5, 0.06, 0.45), mats.cloth('#1e4fbf'), 0, 0.5, 0));
    wc.add(mesh(new THREE.BoxGeometry(0.5, 0.5, 0.05), mats.cloth('#1e4fbf'), 0, 0.78, -0.22));
    for (const s of [-1, 1]) wc.add(mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.6), steel, s * 0.26, 0.75, -0.1));
    wc.position.set(-4.8, 0, 0.3);
    wc.rotation.y = 0.8;
    group.add(wc);
    const clk = wallClock();
    clk.position.set(4.3, 3.2, -D / 2 + 0.04);
    clk.scale.setScalar(0.8);
    group.add(clk);
    ceilingLights(group, H, [[-3, -2], [2, -2], [-3, 1.5], [2, 1.5]]);
    return roomWorld(group, movers, { W, D, H, sun: 1.4, hemi: 1.0, exposure: 1.05, sky: '#f4fbff', ground: '#b9c7cf' });
  },

  async police() {
    const rand = rng(231), group = new THREE.Group(), movers = [], uniforms = { uTime: { value: 0 } };
    const sunDir = dirFrom(-30, 40);
    const sky = makeSky(sunDir);
    group.add(sky);
    const lot = (x, z) => Math.abs(x) < 18 && z > -12 && z < -4.2;
    const plaza = (x, z) => Math.abs(x) < 18 && z >= -4.2 && z < 6;
    group.add(terrain({ height: town, color: (h, n, x, z) => (lot(x, z) ? new THREE.Color('#5d6168').lerp(new THREE.Color('#686c73'), clamp(n + 0.5, 0, 1))
      : plaza(x, z) ? new THREE.Color('#cfd2d6').lerp(new THREE.Color('#c2c6cb'), clamp(n + 0.5, 0, 1)) : lawn(h, n)) }));
    group.add(grass(town, { rand, uniforms, count: 14000, radius: 34, skip: (x, z) => Math.abs(x) < 18.5 && z > -12.5 && z < 6.5 }));
    // parking lines
    for (const x of [-12, -8, -4, 4, 8, 12]) group.add(mesh(new THREE.PlaneGeometry(0.12, 4).rotateX(-Math.PI / 2), mats.matte('#ffffff'), x, 0.02, -8, { cast: false }));
    group.add(mesh(new THREE.BoxGeometry(36, 0.15, 0.3), mats.matte('#e0e0e0'), 0, 0.075, -4.2));
    // the station
    const st = building({ w: 18, h: 6.5, d: 5, color: '#e8eef7', win: '#8fbfff', floors: 2, cols: 7, roof: '#1e3a8a' });
    st.position.set(0, 0, -15);
    group.add(st);
    group.add(mesh(new THREE.BoxGeometry(18.05, 0.5, 5.05), mats.matte('#1e4fbf'), 0, 3.25, -15));
    group.add(mesh(new THREE.BoxGeometry(3.2, 3.0, 0.15), mats.glossy('#9fd3ff', 0.05), 0, 1.5, -12.45));
    group.add(mesh(new THREE.BoxGeometry(3.6, 0.2, 1.6), mats.matte('#1e4fbf'), 0, 3.1, -11.8));
    for (const s of [-1, 1]) group.add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.0), mats.matte('#ffffff'), s * 1.6, 1.5, -11.1));
    const ps = sign(['POLICE STATION', 'पुलिस थाना'], 6.0, 1.3, { bg: '#1e3a8a', fg: '#ffffff', size: 78, radius: 20 });
    ps.position.set(0, 4.4, -12.45);
    group.add(ps);
    // roof beacon that flashes red / blue
    const red = new THREE.MeshBasicMaterial({ color: '#ff2a2a' }), blue = new THREE.MeshBasicMaterial({ color: '#2a6bff' });
    group.add(mesh(new THREE.BoxGeometry(0.4, 0.3, 0.4), red, -0.4, 6.95, -13), mesh(new THREE.BoxGeometry(0.4, 0.3, 0.4), blue, 0.4, 6.95, -13));
    const sirens = [[red, blue]];
    // cars
    for (const [x, z, r, kind] of [[-10, -8, Math.PI / 2 + 0.05, 'police'], [-6, -8, Math.PI / 2 - 0.04, 'police'], [9.5, -8.2, Math.PI / 2 + 0.1, 'car']]) {
      const car = vehicle(kind, '#4caf50');
      car.position.set(x, 0, z);
      car.rotation.y = r;
      group.add(car);
      if (car.userData.siren) sirens.push(car.userData.siren);
    }
    movers.push((t) => {
      sirens.forEach(([a, b], i) => {
        const on = Math.floor(t * 3 + i) % 2;
        a.color.set(on ? '#ff2a2a' : '#4a0a0a');
        b.color.set(on ? '#14214a' : '#2a6bff');
      });
    });
    for (const [x, z, r] of [[4.5, -3.2, 0.2], [-5.5, -3.0, -0.15]]) { const b = barricade(); b.position.set(x, 0, z); b.rotation.y = r; group.add(b); }
    for (const [x, z] of [[6.2, -2.4], [6.9, -2.2], [-7.4, -2.0], [2.6, -5.5]]) { const c = cone(); c.position.set(x, 0, z); group.add(c); }
    const fp = flagPole(7);
    fp.position.set(-12.5, 0, -11.5);
    group.add(fp);
    movers.push(waveFlag(fp.userData.flag));
    for (const x of [-9, 9]) { const l = lampPost(); l.position.set(x, 0, -3.8); l.rotation.y = Math.PI; group.add(l); }
    for (const x of [-6, -3.5, 3.5, 6]) { const b = bush(rand); b.position.set(x, 0.3, -12.3); group.add(b); }
    for (const [x, z] of [[-20, -6], [21, -4], [-19, 3], [20, 4], [-24, -14], [24, -15]]) {
      const tr = roundTree(rand);
      tr.position.set(x, 0, z);
      tr.scale.setScalar(1.3);
      group.add(tr);
    }
    addClouds(group, rand, movers);
    return sunnyWorld(group, sky, sunDir, movers, uniforms);
  },

  async mall() {
    const rand = rng(241), movers = [];
    const W = 24, D = 15, H = 8;
    const group = room({ W, D, H, floor: tiles('#f6f6f8', '#e3e4ea', 6, 'rgba(0,0,0,0.05)'), floorRepeat: [5, 3], wall: wallTex('#f3efe8'), wallRepeat: 6 });
    group.children[0].material.roughness = 0.12;
    group.children[0].material.metalness = 0.05;
    const back = -D / 2;
    const shopFront = (x, y, name, color, goods) => {
      const g = new THREE.Group();
      const w = 5.0;
      g.add(mesh(new THREE.BoxGeometry(w, 3.2, 0.3), mats.matte(color, 0.6), 0, 1.6, 0));
      g.add(mesh(new THREE.BoxGeometry(w - 0.6, 2.3, 0.05), new THREE.MeshPhysicalMaterial({ color: '#dff3ff', roughness: 0.05, transparent: true, opacity: 0.35 }), 0, 1.2, 0.2, { cast: false }));
      g.add(mesh(new THREE.BoxGeometry(w - 0.6, 2.3, 0.1), mats.matte('#fffaf0', 0.7), 0, 1.2, 0.12, { cast: false }));
      for (let i = 0; i < 6; i++) {
        const gx = -1.6 + (i % 3) * 1.6, gy = 0.6 + Math.floor(i / 3) * 1.0;
        g.add(goods(gx, gy));
      }
      const s = sign(name, 3.6, 0.6, { bg: color, fg: '#ffffff', size: 76, radius: 18 });
      s.position.set(0, 2.85, 0.17);
      g.add(s);
      g.add(mesh(new THREE.BoxGeometry(w, 0.12, 0.6), mats.glossy(color, 0.4), 0, 2.45, 0.4));
      g.position.set(x, y, back + 0.2);
      return g;
    };
    const box = (c) => (x, y) => mesh(new THREE.BoxGeometry(0.4, 0.5, 0.3), mats.glossy(c[Math.floor(rand() * c.length)], 0.4), x, y, 0.2);
    const ball = (x, y) => mesh(sphere(0.22, 16, 12), mats.glossy(['#ff5c5c', '#3fa7ff', '#ffd23f'][Math.floor(rand() * 3)], 0.3), x, y, 0.25);
    const shoe = (x, y) => { const s = mesh(sphere(0.2, 16, 12), mats.glossy(['#e53935', '#1e88e5', '#ffffff'][Math.floor(rand() * 3)], 0.4), x, y, 0.25); s.scale.set(1.6, 0.6, 0.8); return s; };
    const cone2 = (x, y) => { const g = new THREE.Group(); const c = mesh(new THREE.ConeGeometry(0.14, 0.35, 12), mats.matte('#d9a066'), x, y, 0.25); c.rotation.x = Math.PI; g.add(c, mesh(sphere(0.16, 14, 10), mats.glossy(['#ffb3c7', '#fff1d6', '#a5d6a7'][Math.floor(rand() * 3)], 0.4), x, y + 0.22, 0.25)); return g; };
    group.add(shopFront(-8.2, 0, 'TOYS', '#ff5c9a', ball), shopFront(-2.8, 0, 'SHOES', '#3f6fdf', shoe), shopFront(2.6, 0, 'ICE CREAM', '#ffa726', cone2), shopFront(8.0, 0, 'BOOKS', '#43a047', box(['#e53935', '#1e88e5', '#fdd835', '#8e24aa'])));
    // upper floor balcony with more shops
    group.add(mesh(new THREE.BoxGeometry(W, 0.35, 3.2), mats.matte('#ffffff', 0.5), 0, 3.7, back + 1.6));
    group.add(mesh(new THREE.BoxGeometry(W, 0.9, 0.04), new THREE.MeshPhysicalMaterial({ color: '#cfefff', roughness: 0.05, transparent: true, opacity: 0.3 }), 0, 4.35, back + 3.2, { cast: false }));
    group.add(mesh(new THREE.BoxGeometry(W, 0.06, 0.1), mats.metal('#c0c6cc', 0.25), 0, 4.82, back + 3.2));
    for (const [x, name, c] of [[-7, 'CLOTHES', '#8e24aa'], [0, 'FOOD COURT', '#e53935'], [7, 'GAMES', '#00897b']]) {
      const up = new THREE.Group();
      up.add(mesh(new THREE.BoxGeometry(6, 3.2, 0.2), mats.matte(c, 0.6), 0, 1.6, 0));
      up.add(mesh(new THREE.BoxGeometry(5.2, 2.0, 0.1), new THREE.MeshPhysicalMaterial({ color: '#e3f4ff', roughness: 0.05, transparent: true, opacity: 0.6 }), 0, 1.15, 0.1, { cast: false }));
      const s = sign(name, 4, 0.6, { bg: c, fg: '#ffffff', size: 76, radius: 18 });
      s.position.set(0, 2.75, 0.12);
      up.add(s);
      up.position.set(x, 3.9, back + 0.15);
      group.add(up);
    }
    // escalator up to the balcony
    const esc = new THREE.Group();
    const steps = canvasTexture(64, 256, (c, w, h) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#7d8790' : '#9aa4ad'; c.fillRect(0, i * 16, w, 16); } });
    const len = Math.hypot(3.7, 4.2);
    const ramp = mesh(new THREE.BoxGeometry(1.2, 0.3, len), new THREE.MeshStandardMaterial({ map: steps, metalness: 0.5, roughness: 0.4 }), 0, 1.85, 0);
    ramp.rotation.x = Math.atan2(3.7, 4.2);
    esc.add(ramp);
    for (const s of [-1, 1]) {
      const side = mesh(new THREE.BoxGeometry(0.08, 0.9, len), new THREE.MeshPhysicalMaterial({ color: '#dff3ff', transparent: true, opacity: 0.35, roughness: 0.05 }), s * 0.62, 2.35, 0, { cast: false });
      side.rotation.x = ramp.rotation.x;
      esc.add(side);
      const rail = mesh(new THREE.BoxGeometry(0.1, 0.08, len), mats.matte('#222'), s * 0.62, 2.82, 0);
      rail.rotation.x = ramp.rotation.x;
      esc.add(rail);
    }
    esc.position.set(10.5, 0, back + 5.2);
    esc.rotation.y = 0;
    group.add(esc);
    // pillars, plants, benches, hanging sale banners
    for (const x of [-11, -5.5, 5.5]) group.add(mesh(new THREE.CylinderGeometry(0.35, 0.35, H, 24), mats.matte('#ffffff', 0.4), x, H / 2, back + 3.4));
    for (const [x, z] of [[-9, 1.5], [-3.6, -2.0], [7.5, 1.0], [3.6, -2.0]]) { const p = plant(rand, 1.4); p.position.set(x, 0, z); group.add(p); }
    for (const [x, z, r] of [[-6.5, 0.5, 0.4], [6.5, 0.6, -0.4]]) { const b = bench(); b.position.set(x, 0, z); b.rotation.y = r; group.add(b); }
    for (const [x, c] of [[-4, '#e53935'], [4, '#ff9800']]) {
      const s = sign(['SALE!', '50% OFF'], 1.4, 1.8, { bg: c, fg: '#ffffff', size: 110, radius: 16 });
      s.position.set(x, 6.4, -1.5);
      group.add(s);
      group.add(mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.7), mats.matte('#888'), x, 7.65, -1.5));
    }
    const cart = buildGear('cart');
    cart.position.set(-10.5, 0, 2.0);
    cart.rotation.y = 0.9;
    cart.scale.setScalar(1.3);
    group.add(cart);
    // skylights
    for (const x of [-8, 0, 8]) group.add(mesh(new THREE.BoxGeometry(5, 0.05, 2.5), mats.glow('#eaf6ff', 1.3), x, H - 0.03, 0, { cast: false, receive: false }));
    return roomWorld(group, movers, { W, D, H, sun: 1.6, hemi: 1.0, exposure: 1.0, sky: '#fffaf2', ground: '#cfc7bd' });
  },

  async market() {
    const rand = rng(251), group = new THREE.Group(), movers = [], uniforms = { uTime: { value: 0 } };
    const sunDir = dirFrom(-25, 48);
    const sky = makeSky(sunDir, { turbidity: 5, rayleigh: 1.1 });
    group.add(sky);
    const bazaar = (x, z) => Math.abs(x) < 20 && z > -14 && z < 7;
    group.add(terrain({ height: town, color: (h, n, x, z) => (bazaar(x, z) ? new THREE.Color('#d9c193').lerp(new THREE.Color('#c9ad7c'), clamp(n + 0.5, 0, 1)) : lawn(h, n)) }));
    group.add(grass(town, { rand, uniforms, count: 12000, radius: 34, skip: (x, z) => Math.abs(x) < 20.5 && z > -14.5 && z < 7.5 }));
    const wood = mats.matte('#8b5a2b', 0.8);
    const goodsPile = (g, colors, r, y, shape = 'ball') => {
      for (let i = 0; i < 26; i++) {
        const x = (rand() - 0.5) * 2.1, z = (rand() - 0.5) * 0.8, lift = (1 - Math.abs(x) / 1.2) * 0.12 * rand();
        let m;
        if (shape === 'cone') { m = mesh(new THREE.ConeGeometry(r * 0.6, r * 3, 8), mats.matte(colors[i % colors.length]), x, y + r * 1.5 + lift, z); m.rotation.z = Math.PI / 2 + (rand() - 0.5); }
        else if (shape === 'banana') { m = mesh(geo('bananaM', () => new THREE.TorusGeometry(0.16, 0.04, 8, 14, 1.7)), mats.glossy('#ffd84a', 0.4), x, y + 0.05 + lift, z); m.rotation.set(Math.PI / 2, 0, rand() * 6); }
        else { m = mesh(sphere(r, 12, 10), mats.glossy(colors[i % colors.length], 0.4), x, y + r + lift, z); m.scale.y = shape === 'egg' ? 1.5 : 1; }
        g.add(m);
      }
    };
    const spiceMounds = (g, y) => {
      ['#e53935', '#fbc02d', '#ef6c00', '#6d4c41', '#7cb342', '#d81b60'].forEach((c, i) => {
        const bowl = mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.14, 20), mats.matte('#c9b48a'), -0.9 + (i % 3) * 0.9, y + 0.07, -0.25 + Math.floor(i / 3) * 0.5);
        g.add(bowl);
        g.add(mesh(new THREE.ConeGeometry(0.26, 0.3, 20), mats.matte(c, 0.95), bowl.position.x, y + 0.29, bowl.position.z));
      });
    };
    const stall = (x, z, ry, canopyA, canopyB, name, fill) => {
      const g = new THREE.Group();
      for (const sx of [-1.35, 1.35]) for (const sz of [-0.7, 0.7]) g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.5), wood, sx, 1.25, sz));
      g.add(mesh(new THREE.BoxGeometry(2.8, 0.1, 1.3), wood, 0, 0.9, 0));
      g.add(mesh(new THREE.BoxGeometry(2.82, 0.5, 0.02), mats.cloth(canopyB), 0, 0.62, 0.66));
      const stripes = canvasTexture(256, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? canopyA : canopyB; c.fillRect(i * 32, 0, 32, h); } }, { repeat: 1 });
      const canopy = mesh(new THREE.BoxGeometry(3.2, 0.06, 1.9), new THREE.MeshStandardMaterial({ map: stripes, roughness: 0.8 }), 0, 2.55, 0.1);
      canopy.rotation.x = 0.18;
      g.add(canopy);
      // scalloped front edge
      for (let i = 0; i < 8; i++) g.add(mesh(geo('scallop', () => new THREE.SphereGeometry(0.2, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2)), mats.cloth(i % 2 ? canopyA : canopyB), -1.4 + i * 0.4, 2.36, 1.05).rotateX(Math.PI));
      const s = sign(name, 1.8, 0.45, { bg: '#fff8e1', fg: '#bf360c', size: 66, radius: 14 });
      s.position.set(0, 2.15, 1.07);
      g.add(s);
      fill(g, 0.95);
      for (const cx of [-0.8, 0.6]) g.add(mesh(new THREE.BoxGeometry(0.6, 0.4, 0.45), mats.matte('#c8955c', 0.9), cx, 0.2, 1.0));
      g.position.set(x, 0, z);
      g.rotation.y = ry;
      return g;
    };
    group.add(stall(-8, -7.5, 0.15, '#ff7043', '#ffffff', 'FRUITS', (g, y) => goodsPile(g, ['#ff9800', '#e53935', '#ffb300', '#8bc34a'], 0.1, y)));
    group.add(stall(-3.9, -8.2, 0.05, '#43a047', '#ffffff', 'SABZI', (g, y) => goodsPile(g, ['#e53935', '#43a047', '#6a1b9a', '#7cb342'], 0.1, y, 'egg')));
    group.add(stall(0.2, -8.4, 0, '#fdd835', '#e53935', 'SPICES', spiceMounds));
    group.add(stall(4.3, -8.2, -0.05, '#ec407a', '#ffffff', 'FLOWERS', (g, y) => goodsPile(g, ['#ff9408', '#ffd23f', '#ffffff', '#ff6fae'], 0.09, y)));
    group.add(stall(8.4, -7.5, -0.15, '#1e88e5', '#ffffff', 'BANANAS', (g, y) => goodsPile(g, ['#ffd84a'], 0.1, y, 'banana')));
    group.add(stall(-11.5, -3.0, 0.9, '#8e24aa', '#ffffff', 'TOYS', (g, y) => goodsPile(g, ['#ff5c5c', '#3fa7ff', '#ffd23f', '#43a047'], 0.12, y)));
    group.add(stall(11.5, -3.0, -0.9, '#ff7043', '#fff3e0', 'CARROTS', (g, y) => goodsPile(g, ['#ff7a1a'], 0.06, y, 'cone')));
    // hand cart with fruit, sacks, baskets, bunting
    const cart = new THREE.Group();
    cart.add(mesh(new THREE.BoxGeometry(2.0, 0.12, 1.0), wood, 0, 0.85, 0));
    for (const s of [-1, 1]) {
      const w = mesh(new THREE.TorusGeometry(0.4, 0.05, 8, 24), mats.matte('#4e342e'), 0, 0.45, s * 0.55);
      cart.add(w);
      cart.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3), wood, 1.3, 0.75, s * 0.4).rotateZ(1.2));
    }
    goodsPile(cart, ['#ffb300', '#e53935', '#8bc34a'], 0.09, 0.9);
    cart.position.set(-5.6, 0, -3.3);
    cart.rotation.y = 0.5;
    group.add(cart);
    for (const [x, z] of [[2.8, -5.6], [3.5, -5.4], [-1.6, -5.8]]) {
      const sack = mesh(lathe('sack', [[0.001, 0], [0.32, 0.02], [0.36, 0.3], [0.3, 0.6], [0.2, 0.68], [0.24, 0.72], [0.001, 0.72]]), mats.matte('#c8a978', 0.95), x, 0, z);
      group.add(sack);
      group.add(mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.05, 16), mats.matte(['#fff8e1', '#ffcc80', '#a1887f'][Math.floor(rand() * 3)]), x, 0.7, z));
    }
    for (const [x, z] of [[6.2, -5.4], [-9.8, -5.5]]) {
      const basket = mesh(lathe('basket', [[0.001, 0], [0.3, 0], [0.42, 0.35], [0.38, 0.35], [0.27, 0.04], [0.001, 0.04]]), new THREE.MeshStandardMaterial({ color: '#b5835a', roughness: 0.9, side: THREE.DoubleSide }), x, 0, z);
      group.add(basket);
      goodsPile(basket, ['#ff9800'], 0.08, 0.15);
      basket.children.forEach((m) => { m.position.x *= 0.2; m.position.z *= 0.4; });
    }
    const colors = ['#e53935', '#fdd835', '#43a047', '#1e88e5', '#ff7043', '#8e24aa'];
    group.add(bunting(V(-10, 3.6, -6.2), V(10, 3.6, -6.2), colors, { sag: 0.5 }));
    group.add(bunting(V(-12, 3.4, -4.5), V(-6, 3.4, -8.5), colors, { sag: 0.3 }));
    group.add(bunting(V(6, 3.4, -8.5), V(12, 3.4, -4.5), colors, { sag: 0.3 }));
    // colourful houses behind
    [['#ffcc80', 5.5], ['#80deea', 7], ['#f48fb1', 6], ['#c5e1a5', 7.5], ['#fff59d', 5.5], ['#b39ddb', 6.5], ['#ffab91', 6]].forEach(([c, h], i) => {
      const b = building({ w: 5, h, d: 4, color: c, win: '#5d4037', frame: '#ffffff', floors: 2, cols: 2, roof: '#a1887f' });
      b.position.set(-15 + i * 5.1, 0, -17 - (i % 2) * 0.8);
      group.add(b);
    });
    for (const [x, z] of [[-17, -2], [17, -1], [-19, 5], [19, 5]]) { const tr = roundTree(rand); tr.position.set(x, 0, z); tr.scale.setScalar(1.3); group.add(tr); }
    addClouds(group, rand, movers, 8);
    await birds(group, movers, 'Parrot', 3, rand);
    return sunnyWorld(group, sky, sunDir, movers, uniforms, { sun: { color: '#fff0d4', intensity: 2.8 } });
  },

  async kitchen() {
    const rand = rng(261), movers = [];
    const W = 11, D = 8, H = 3.6;
    const wall = canvasTexture(256, 256, (c, w, h) => {
      c.fillStyle = '#fff4cc'; c.fillRect(0, 0, w, h);
      const top = h * 0.42, bot = h * 0.72;
      for (let y = top; y < bot; y += 16) for (let x = 0; x < w; x += 16) { c.fillStyle = ((x + y) / 16) % 2 ? '#ffffff' : '#d6ecff'; c.fillRect(x, y, 15, 15); }
    });
    const group = room({ W, D, H, floor: tiles('#f4efe6', '#d9cbb5', 8), floorRepeat: [3, 2], wall, wallRepeat: 2.5 });
    const back = -D / 2;
    // counter with cabinets along the back wall
    const counter = new THREE.Group();
    counter.add(mesh(new THREE.BoxGeometry(6.6, 0.88, 0.65), mats.matte('#7fb7d9', 0.6), 0, 0.44, 0));
    for (let i = 0; i < 6; i++) {
      counter.add(mesh(new THREE.BoxGeometry(1.0, 0.7, 0.02), mats.matte('#9cc9e6', 0.6), -2.75 + i * 1.1, 0.45, 0.335, { cast: false }));
      counter.add(mesh(new THREE.BoxGeometry(0.2, 0.03, 0.04), mats.metal('#d0d6dc'), -2.75 + i * 1.1, 0.7, 0.355));
    }
    counter.add(mesh(new THREE.BoxGeometry(6.7, 0.06, 0.72), mats.glossy('#4a4f57', 0.25), 0, 0.91, 0.02));
    // upper cabinets
    counter.add(mesh(new THREE.BoxGeometry(3.0, 0.8, 0.4), mats.matte('#7fb7d9', 0.6), -1.8, 2.55, -0.12));
    counter.add(mesh(new THREE.BoxGeometry(1.8, 0.8, 0.4), mats.matte('#7fb7d9', 0.6), 2.4, 2.55, -0.12));
    // stove with a pressure cooker and a pan
    counter.add(mesh(new THREE.BoxGeometry(1.1, 0.06, 0.5), mats.glossy('#1d1d1f', 0.2), 1.6, 0.97, 0));
    counter.add(mesh(lathe('cooker', [[0.001, 0], [0.2, 0], [0.22, 0.04], [0.22, 0.28], [0.18, 0.32], [0.001, 0.33]]), mats.metal('#d0d6dc', 0.2), 1.35, 1.0, 0));
    counter.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 10), mats.matte('#222'), 1.35, 1.38, 0));
    counter.add(mesh(new THREE.BoxGeometry(0.5, 0.04, 0.06), mats.matte('#222'), 1.05, 1.3, 0));
    counter.add(mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.08, 20), mats.metal('#555b63', 0.3), 1.9, 1.04, 0));
    // sink with tap and a window above
    counter.add(mesh(new THREE.BoxGeometry(0.9, 0.04, 0.45), mats.metal('#c8ced6', 0.2), -1.3, 0.94, 0));
    counter.add(mesh(geo('kTap', () => tube([[0, 0.94, -0.25], [0, 1.25, -0.24], [0, 1.3, -0.1], [0, 1.2, 0.0]], 0.025, 14)), mats.metal('#d0d6dc', 0.2), -1.3, 0, 0));
    // chopping board with veggies, spice jars on a shelf
    counter.add(mesh(new THREE.BoxGeometry(0.5, 0.03, 0.3), mats.matte('#d9a066'), -0.1, 0.95, 0.05));
    for (const [x, c] of [[-0.2, '#e53935'], [-0.05, '#43a047'], [0.1, '#ff7a1a']]) counter.add(mesh(sphere(0.06, 12, 10), mats.glossy(c, 0.4), x, 1.02, 0.05));
    counter.add(mesh(new THREE.BoxGeometry(1.6, 0.04, 0.22), mats.matte('#b07a45'), 0.5, 1.75, -0.2));
    ['#e53935', '#fbc02d', '#6d4c41', '#7cb342', '#ef6c00'].forEach((c, i) => {
      counter.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 12), mats.glossy('#ffffff', 0.05), -0.1 + i * 0.3, 1.86, -0.2));
      counter.add(mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.1, 12), mats.matte(c), -0.1 + i * 0.3, 1.83, -0.2));
    });
    counter.position.set(-1.6, 0, back + 0.35);
    group.add(counter);
    const win = skyWindow(1.4, 1.0);
    win.position.set(-2.9, 1.8, back + 0.01);
    win.scale.setScalar(0.9);
    group.add(win);
    // fridge
    const fridge = new THREE.Group();
    fridge.add(mesh(new THREE.BoxGeometry(1.0, 2.1, 0.8), mats.glossy('#ff8a80', 0.25), 0, 1.05, 0));
    fridge.add(mesh(new THREE.BoxGeometry(1.0, 0.02, 0.01), mats.matte('#d06a62'), 0, 1.45, 0.405, { cast: false }));
    for (const y of [1.0, 1.75]) fridge.add(mesh(new THREE.BoxGeometry(0.05, 0.35, 0.06), mats.metal('#e0e0e0'), 0.38, y, 0.42));
    for (const [x, y, c] of [[-0.2, 1.8, '#ffd23f'], [0.0, 1.65, '#3fa7ff'], [-0.25, 1.1, '#43a047']]) fridge.add(mesh(new THREE.BoxGeometry(0.12, 0.12, 0.02), mats.glossy(c, 0.3), x, y, 0.41));
    fridge.position.set(3.4, 0, back + 0.5);
    group.add(fridge);
    // dining table with plates and a fruit bowl, chairs, hanging lamp
    const dining = table(2.0, 1.2, 0.78, mats.matte('#b07a45', 0.5));
    dining.add(mesh(new THREE.BoxGeometry(2.05, 0.02, 1.25), mats.cloth('#fff3e0'), 0, 0.82, 0));
    for (const [x, z] of [[-0.6, -0.35], [0.6, -0.35], [-0.6, 0.35], [0.6, 0.35]]) {
      dining.add(mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.025, 24), mats.glossy('#ffffff', 0.2), x, 0.845, z));
      dining.add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16), mats.matte(['#ffd54f', '#ff8a65', '#aed581', '#fff59d'][Math.floor(rand() * 4)]), x, 0.865, z));
    }
    dining.add(mesh(lathe('fruitBowl', [[0.001, 0], [0.12, 0], [0.22, 0.12], [0.2, 0.13], [0.001, 0.03]]), new THREE.MeshStandardMaterial({ color: '#7e57c2', roughness: 0.4, side: THREE.DoubleSide }), 0, 0.84, 0));
    for (const [x, z, c] of [[0.05, 0, '#e53935'], [-0.07, 0.05, '#ff9800'], [0.02, -0.08, '#8bc34a']]) dining.add(mesh(sphere(0.07, 12, 10), mats.glossy(c, 0.35), x, 0.96, z));
    dining.position.set(3.0, 0, -0.6);
    group.add(dining);
    for (const [x, z, r] of [[2.3, -1.45, 0], [3.7, -1.45, 0], [2.3, 0.25, Math.PI], [4.35, -0.6, -Math.PI / 2]]) { const c = chair('#8d6e63'); c.position.set(x, 0, z); c.rotation.y = r; group.add(c); }
    group.add(mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.1), mats.matte('#333'), 3.0, H - 0.55, -0.6));
    group.add(mesh(new THREE.ConeGeometry(0.35, 0.3, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#ffcf70', emissive: '#ffb347', emissiveIntensity: 0.8, side: THREE.DoubleSide }), 3.0, H - 1.15, -0.6, { cast: false }));
    const bulb = new THREE.PointLight('#ffcf8a', 6, 8, 1.6);
    bulb.position.set(3.0, H - 1.3, -0.6);
    group.add(bulb);
    const clk = wallClock();
    clk.position.set(1.6, 3.0, back + 0.04);
    clk.scale.setScalar(0.8);
    group.add(clk);
    const p = plant(rand, 1.0);
    p.position.set(-4.8, 0, 1.0);
    group.add(p);
    return roomWorld(group, movers, { W, D, H, sun: 1.5, hemi: 0.9, exposure: 1.0 });
  },

  async street() {
    const rand = rng(271), group = new THREE.Group(), movers = [], uniforms = { uTime: { value: 0 } };
    const sunDir = dirFrom(-40, 45);
    const sky = makeSky(sunDir);
    group.add(sky);
    group.add(terrain({ height: town, color: (h, n) => lawn(h, n) }));
    const strip = (w, d, x, z, mat, y = 0.01) => { const m = mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), mat, x, y, z, { cast: false }); group.add(m); return m; };
    const pave = canvasTexture(256, 256, (c, w, h) => { c.fillStyle = '#cfcac2'; c.fillRect(0, 0, w, h); c.fillStyle = '#b9b3aa'; for (let i = 0; i <= 4; i++) { c.fillRect(i * 64 - 2, 0, 4, h); c.fillRect(0, i * 64 - 2, w, 4); } });
    pave.repeat.set(30, 4);
    strip(120, 9, 0, 1.3, new THREE.MeshStandardMaterial({ map: pave, roughness: 0.9 }), 0.03);
    strip(120, 7, 0, -6.7, mats.matte('#4a4d55', 0.95), 0.02);
    strip(120, 4, 0, -12.2, new THREE.MeshStandardMaterial({ map: pave, roughness: 0.9 }), 0.03);
    group.add(mesh(new THREE.BoxGeometry(120, 0.18, 0.25), mats.matte('#e0dcd4'), 0, 0.09, -3.2));
    group.add(mesh(new THREE.BoxGeometry(120, 0.18, 0.25), mats.matte('#e0dcd4'), 0, 0.09, -10.2));
    for (let x = -58; x < 58; x += 3) strip(1.6, 0.15, x, -6.7, mats.matte('#ffffff'), 0.025);
    for (let i = 0; i < 7; i++) strip(0.5, 6.4, 5 + i * 0.95, -6.7, mats.matte('#ffffff'), 0.026);
    // buildings across the road
    const shops = [['BAKERY', '#d84315'], ['PHARMACY', '#2e7d32'], ['BANK', '#1565c0'], ['CAFE', '#6d4c41'], ['TOY SHOP', '#c2185b'], ['SWEETS', '#ef6c00']];
    let x = -27;
    shops.forEach(([name, c], i) => {
      const w = 7 + (i % 2) * 2, h = 7 + ((i * 5) % 4) * 2.5;
      const b = building({ w, h, d: 5, color: ['#f5e6c8', '#cfe3f3', '#f3d1d1', '#e1f0d0', '#efe0f5', '#fff0c2'][i], floors: Math.round(h / 3), cols: Math.round(w / 2.2), roof: '#795548', shop: { text: name, bg: c } });
      b.position.set(x + w / 2, 0, -17);
      group.add(b);
      x += w + 0.4;
    });
    // traffic light
    const tl = new THREE.Group();
    tl.add(mesh(new THREE.CylinderGeometry(0.07, 0.09, 3.2, 10), mats.metal('#2f3640', 0.5), 0, 1.6, 0));
    tl.add(mesh(new THREE.BoxGeometry(0.42, 1.15, 0.35), mats.matte('#222222'), 0, 3.4, 0));
    const lamps = ['#ff2a2a', '#ffc107', '#28d75c'].map((c, i) => {
      const m = new THREE.MeshBasicMaterial({ color: c });
      tl.add(mesh(sphere(0.12, 14, 10), m, 0, 3.75 - i * 0.36, 0.17, { cast: false }));
      return [m, new THREE.Color(c)];
    });
    tl.position.set(3.4, 0, -3.5);
    group.add(tl);
    movers.push((t) => {
      const phase = Math.floor(t % 12 / 4); // red, green, amber
      const on = [0, 2, 1][phase];
      lamps.forEach(([m, c], i) => m.color.copy(c).multiplyScalar(i === on ? 1.4 : 0.15));
    });
    // traffic driving past
    const lanes = [[-5.1, 1, 9], [-8.3, -1, 7]];
    [['car', '#e53935', 0], ['rickshaw', null, 0], ['taxi', null, 1], ['bus', null, 1], ['car', '#1e88e5', 0], ['ambulance', null, 1]].forEach(([kind, col, lane], i) => {
      const v = vehicle(kind, col);
      const [z, dir, speed] = lanes[lane];
      v.rotation.y = dir > 0 ? 0 : Math.PI;
      group.add(v);
      const off = i * 22, span = 120;
      movers.push((t) => {
        const k = ((t * speed + off) % span) - span / 2;
        v.position.set(dir * k, 0, z);
        v.userData.wheels.forEach((w) => { w.rotation.z = -t * speed * 2.5; });
        if (v.userData.siren) { const on = Math.floor(t * 3) % 2; v.userData.siren[0].color.set(on ? '#ff2a2a' : '#4a0a0a'); }
      });
    });
    // bus stop, lamps, trees in planters, a bin
    const stop = new THREE.Group();
    stop.add(mesh(new THREE.BoxGeometry(3.2, 0.1, 1.4), mats.matte('#1e88e5'), 0, 2.5, 0));
    for (const sx of [-1.5, 1.5]) stop.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.5), mats.metal('#c8ced6'), sx, 1.25, -0.55));
    stop.add(mesh(new THREE.BoxGeometry(3.0, 1.8, 0.04), new THREE.MeshPhysicalMaterial({ color: '#dff3ff', transparent: true, opacity: 0.35, roughness: 0.05 }), 0, 1.4, -0.6, { cast: false }));
    const b = bench();
    b.position.set(0, 0, -0.25);
    b.scale.setScalar(1.3);
    stop.add(b);
    const bs = sign('BUS STOP', 1.8, 0.4, { bg: '#ffffff', fg: '#1565c0', size: 70, radius: 10 });
    bs.position.set(0, 2.25, 0.71);
    stop.add(bs);
    stop.position.set(-6.5, 0, -1.8);
    group.add(stop);
    for (const lx of [-12, 10]) { const l = lampPost(4); l.position.set(lx, 0, -3.6); l.rotation.y = Math.PI; group.add(l); }
    for (const tx of [-17, -1.5, 15]) {
      group.add(mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.5, 20), mats.matte('#a1887f'), tx, 0.25, -2.4));
      const tr = roundTree(rand);
      tr.position.set(tx, 0.4, -2.4);
      tr.scale.setScalar(0.9);
      group.add(tr);
    }
    const bin = mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.8, 16), mats.glossy('#43a047', 0.4), 7.2, 0.4, -2.6);
    group.add(bin);
    addClouds(group, rand, movers);
    await birds(group, movers, 'Parrot', 2, rand);
    return sunnyWorld(group, sky, sunDir, movers, uniforms);
  },

  async birthday() {
    const rand = rng(281), movers = [];
    const W = 12, D = 9, H = 3.8;
    const group = room({ W, D, H, floor: planks(), floorRepeat: [3, 3], wall: wallTex('#efe3ff', { dots: '#ffffff' }), wallRepeat: 3 });
    const back = -D / 2;
    group.add(bunting(V(-4.6, 3.3, back + 0.1), V(4.6, 3.3, back + 0.1), ['#ff5c9a', '#3fa7ff', '#ffd23f', '#43a047', '#ff7043', '#8e24aa'], { letters: [...'HAPPY BIRTHDAY'], size: 0.55, sag: 0.35 }));
    // fairy lights along the top of the back wall
    const fairy = [];
    for (let i = 0; i < 30; i++) {
      const m = new THREE.MeshBasicMaterial({ color: ['#ffe082', '#ff8a80', '#80d8ff', '#b9f6ca'][i % 4] });
      group.add(mesh(sphere(0.045, 8, 6), m, -5.6 + i * 0.39, 3.6 - Math.sin((i / 29) * Math.PI) * 0.15, back + 0.06, { cast: false }));
      fairy.push([m, m.color.clone()]);
    }
    movers.push((t) => fairy.forEach(([m, c], i) => m.color.copy(c).multiplyScalar(0.55 + 0.6 * Math.max(0, Math.sin(t * 3 + i)))));
    // party table with cake, cups and party hats
    const party = table(3.0, 1.1, 0.8, mats.matte('#b07a45', 0.5));
    party.add(mesh(new THREE.BoxGeometry(3.1, 0.35, 1.2), mats.cloth('#ffb3d1'), 0, 0.7, 0));
    party.add(mesh(new THREE.BoxGeometry(3.12, 0.04, 1.22), mats.cloth('#ffffff'), 0, 0.85, 0));
    const cake = new THREE.Group();
    cake.add(mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 32), mats.glossy('#ffffff', 0.2), 0, 0.02, 0));
    cake.add(mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.24, 32), mats.matte('#fff1d6', 0.6), 0, 0.16, 0));
    cake.add(mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.05, 32), mats.glossy('#ff8fb1', 0.3), 0, 0.29, 0));
    cake.add(mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.2, 32), mats.matte('#fff1d6', 0.6), 0, 0.41, 0));
    cake.add(mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 32), mats.glossy('#7ad3ff', 0.3), 0, 0.52, 0));
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; cake.add(mesh(sphere(0.035, 8, 6), mats.glossy('#ff3d6e', 0.2), Math.cos(a) * 0.3, 0.33, Math.sin(a) * 0.3, { cast: false })); }
    const flames = [];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2, x = Math.cos(a) * 0.14, z = Math.sin(a) * 0.14;
      cake.add(mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.14, 8), mats.glossy(['#ffd23f', '#7ad3ff', '#ff8fb1'][i % 3], 0.3), x, 0.61, z));
      const f = mesh(sphere(0.025, 8, 6), mats.glow('#ffb347', 3), x, 0.71, z, { cast: false });
      cake.add(f);
      flames.push(f);
    }
    movers.push((t) => flames.forEach((f, i) => { const k = 1 + Math.sin(t * 17 + i * 2) * 0.15; f.scale.set(1, 1.6 * k, 1); }));
    cake.position.set(0, 0.87, 0);
    party.add(cake);
    for (const [x, z, c] of [[-1.0, 0.25, '#3fa7ff'], [1.0, 0.25, '#ffd23f'], [-0.7, -0.3, '#43a047'], [0.8, -0.3, '#ff7043']]) {
      party.add(mesh(new THREE.CylinderGeometry(0.06, 0.045, 0.14, 14), mats.glossy(c, 0.3), x, 0.94, z));
    }
    for (const [x, z] of [[-1.3, -0.1], [1.35, -0.05]]) {
      party.add(mesh(geo('partyHat', () => stripedCone(0.12, 0.3, ['#ff5c9a', '#ffd23f'], 8)), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6 }), x, 1.02, z));
      party.add(mesh(sphere(0.03, 8, 6), mats.fur('#ffffff'), x, 1.18, z));
    }
    party.position.set(0, 0, back + 1.3);
    group.add(party);
    // presents
    for (const [x, z, s, c, r] of [[2.6, -3.3, 0.5, '#7c4dff', 0.2], [3.2, -3.0, 0.38, '#43a047', -0.3], [2.9, -2.5, 0.32, '#ff5c9a', 0.5], [3.5, -3.6, 0.42, '#ffa726', 0.1]]) {
      const gift = new THREE.Group();
      gift.add(mesh(new THREE.BoxGeometry(s, s, s), mats.glossy(c, 0.4), 0, s / 2, 0));
      gift.add(mesh(new THREE.BoxGeometry(s + 0.01, s + 0.01, 0.07), mats.glossy('#ffd23f', 0.3), 0, s / 2, 0));
      gift.add(mesh(new THREE.BoxGeometry(0.07, s + 0.01, s + 0.01), mats.glossy('#ffd23f', 0.3), 0, s / 2, 0));
      gift.position.set(x, 0, z);
      gift.rotation.y = r;
      group.add(gift);
    }
    // balloon bunches bobbing in the corners
    const bunch = (bx, bz, cols) => {
      const g = new THREE.Group();
      cols.forEach((c, i) => {
        const b = balloon(c, 1.5 + (i % 3) * 0.25);
        b.rotation.set((rand() - 0.5) * 0.35, 0, (rand() - 0.5) * 0.35);
        g.add(b);
        movers.push((t) => { b.rotation.z = Math.sin(t * 1.1 + i) * 0.08 + (i - cols.length / 2) * 0.08; });
      });
      g.add(mesh(new THREE.BoxGeometry(0.16, 0.12, 0.16), mats.glossy('#ffd23f', 0.3), 0, 0.06, 0));
      g.position.set(bx, 0, bz);
      group.add(g);
    };
    bunch(-4.8, -3.4, ['#ff5c9a', '#3fa7ff', '#ffd23f', '#43a047', '#ff7043']);
    bunch(4.9, -1.2, ['#8e24aa', '#ffd23f', '#ff5c9a', '#3fa7ff']);
    bunch(-5.2, 1.5, ['#43a047', '#ff7043', '#3fa7ff']);
    // ceiling balloons and streamers
    for (let i = 0; i < 10; i++) {
      const b = mesh(sphere(0.22, 18, 14), mats.glossy(['#ff5c9a', '#3fa7ff', '#ffd23f', '#43a047', '#8e24aa'][i % 5], 0.1), -4.5 + rand() * 9, H - 0.28, -3.8 + rand() * 4.5);
      b.scale.set(1, 1.15, 1);
      group.add(b);
    }
    for (const [a, b, c] of [[[-5.9, 3.7, -4.4], [0, 3.7, -1.5], '#ff5c9a'], [[5.9, 3.7, -4.4], [0, 3.7, -1.5], '#3fa7ff'], [[-5.9, 3.7, 0.5], [5.9, 3.7, 0.5], '#ffd23f']]) {
      const pts = [];
      for (let i = 0; i <= 16; i++) { const k = i / 16; pts.push([a[0] + (b[0] - a[0]) * k, a[1] - Math.sin(k * Math.PI) * 0.6 + Math.sin(k * 30) * 0.04, a[2] + (b[2] - a[2]) * k]); }
      group.add(mesh(tube(pts, 0.025, 64), mats.glossy(c, 0.4), 0, 0, 0, { cast: false }));
    }
    // confetti on the floor
    const conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.06, 0.04), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.7 }), 260);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    for (let i = 0; i < 260; i++) {
      q.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, rand() * 6.28));
      m4.compose(V((rand() - 0.5) * 10, 0.005, -4 + rand() * 7), q, V(1, 1, 1));
      conf.setMatrixAt(i, m4);
      conf.setColorAt(i, c.set(['#ff5c9a', '#3fa7ff', '#ffd23f', '#43a047', '#ff7043'][i % 5]));
    }
    group.add(conf);
    // sofa on the side
    const sofa = new THREE.Group();
    const fabric = mats.cloth('#4db6ac');
    sofa.add(mesh(new THREE.BoxGeometry(2.4, 0.45, 0.9), fabric, 0, 0.3, 0));
    sofa.add(mesh(new THREE.BoxGeometry(2.4, 0.7, 0.25), fabric, 0, 0.75, -0.35));
    for (const s of [-1, 1]) sofa.add(mesh(new THREE.BoxGeometry(0.25, 0.65, 0.9), fabric, s * 1.25, 0.45, 0));
    for (const s of [-1, 1]) sofa.add(mesh(new THREE.BoxGeometry(1.1, 0.12, 0.75), mats.cloth('#80cbc4'), s * 0.58, 0.58, 0.05));
    sofa.position.set(-W / 2 + 0.7, 0, -0.4);
    sofa.rotation.y = Math.PI / 2;
    group.add(sofa);
    const win = skyWindow(2.0, 1.4);
    win.position.set(W / 2 - 0.01, 2.0, -1.0);
    win.rotation.y = -Math.PI / 2;
    group.add(win);
    return roomWorld(group, movers, { W, D, H, sun: 1.5, hemi: 0.9, exposure: 1.02, sky: '#fff0f6', ground: '#c49a6c' });
  },

  async wedding() {
    const rand = rng(291), group = new THREE.Group(), movers = [], uniforms = { uTime: { value: 0 } };
    const sunDir = dirFrom(-55, 7); // low golden sun: evening wedding
    const sky = makeSky(sunDir, { turbidity: 8, rayleigh: 2.4, mie: 0.006 });
    group.add(sky);
    group.add(terrain({ height: town, color: (h, n) => lawn(h, n) }));
    group.add(grass(town, { rand, uniforms, count: 14000, radius: 30, skip: (x, z) => Math.abs(x) < 9 && z > -9 && z < 4 }));
    // red carpet aisle up to the mandap, rangoli at its start
    group.add(mesh(new THREE.PlaneGeometry(2.2, 9).rotateX(-Math.PI / 2), mats.cloth('#b71c1c'), 0, 0.02, -1.5, { cast: false }));
    const rangoli = canvasTexture(256, 256, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      [['#ff9408', 120], ['#e53935', 96], ['#ffd23f', 72], ['#43a047', 50], ['#7c4dff', 28]].forEach(([col, r], k) => {
        c.fillStyle = col;
        for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + k * 0.2; c.beginPath(); c.ellipse(w / 2 + Math.cos(a) * r * 0.5, h / 2 + Math.sin(a) * r * 0.5, r * 0.32, r * 0.16, a, 0, 7); c.fill(); }
      });
      c.fillStyle = '#ffffff'; c.beginPath(); c.arc(w / 2, h / 2, 14, 0, 7); c.fill();
    }, { repeat: 1 });
    const rg = mesh(new THREE.CircleGeometry(1.1, 48).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: rangoli, transparent: true, roughness: 1 }), 0, 0.025, 3.0, { cast: false });
    group.add(rg);
    // the mandap: four wrapped pillars, a canopy, hanging marigold strings
    const mandap = new THREE.Group();
    const red = mats.cloth('#c62828'), gold = mats.metal('#d9a93a', 0.25), marigold = mats.fur('#ff9408'), jasmine = mats.fur('#fffdf2');
    const S = 2.4;
    for (const [x, z] of [[-S, -S], [S, -S], [-S, S], [S, S]]) {
      mandap.add(mesh(new THREE.CylinderGeometry(0.12, 0.14, 3.2, 16), gold, x, 1.6, z));
      for (let y = 0.3; y < 3.1; y += 0.12) mandap.add(mesh(sphere(0.07, 8, 6), (Math.round(y / 0.12) % 3) ? marigold : jasmine, x + Math.cos(y * 9) * 0.13, y, z + Math.sin(y * 9) * 0.13, { cast: false }));
    }
    mandap.add(mesh(new THREE.BoxGeometry(S * 2 + 0.6, 0.2, S * 2 + 0.6), gold, 0, 3.25, 0));
    const dome = mesh(new THREE.ConeGeometry(S * 1.55, 1.3, 4, 1, true).rotateY(Math.PI / 4), new THREE.MeshStandardMaterial({ color: '#d32f2f', roughness: 0.8, side: THREE.DoubleSide }), 0, 4.0, 0);
    mandap.add(dome);
    mandap.add(mesh(sphere(0.18, 16, 12), gold, 0, 4.7, 0));
    for (const side of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      for (let k = 0; k < 9; k++) {
        const t = (k / 8 - 0.5) * 2 * S;
        const x = side[0] ? side[0] * S : t, z = side[1] ? side[1] * S : t;
        const len = 0.9 + 0.35 * Math.cos(t * 1.3);
        for (let y = 0; y < len; y += 0.1) mandap.add(mesh(sphere(0.045, 8, 6), (Math.round(y * 10) % 2) ? marigold : jasmine, x, 3.12 - y, z, { cast: false }));
      }
    }
    // havan kund with a living fire
    mandap.add(mesh(new THREE.BoxGeometry(0.8, 0.3, 0.8), mats.matte('#a1522d', 0.9), 0, 0.15, 0));
    mandap.add(mesh(new THREE.BoxGeometry(0.62, 0.05, 0.62), mats.matte('#3a2a20', 0.9), 0, 0.31, 0));
    const flames = [0, 1, 2, 3, 4].map((i) => {
      const f = mesh(new THREE.ConeGeometry(0.1, 0.4, 10), mats.glow(i % 2 ? '#ffb347' : '#ff7043', 2.5), (i - 2) * 0.09, 0.5, ((i * 37) % 5 - 2) * 0.06, { cast: false, receive: false });
      mandap.add(f);
      return f;
    });
    const fire = new THREE.PointLight('#ff9a4a', 5, 7, 1.6);
    fire.position.set(0, 0.8, 0);
    mandap.add(fire);
    movers.push((t) => {
      flames.forEach((f, i) => { const k = 0.8 + 0.35 * Math.abs(Math.sin(t * 7 + i * 1.7)); f.scale.set(1, k, 1); f.position.y = 0.33 + 0.2 * k; });
      fire.intensity = 4 + Math.sin(t * 11) * 0.8 + Math.sin(t * 7.3) * 0.5;
    });
    for (const x of [-0.9, 0.9]) mandap.add(mesh(new THREE.BoxGeometry(0.6, 0.12, 0.6), mats.cloth('#ffd23f'), x, 0.06, 0.9));
    for (const [x, z] of [[-S + 0.4, -S + 0.4], [S - 0.4, -S + 0.4]]) {
      mandap.add(mesh(lathe('mandapKalash', [[0.001, 0], [0.12, 0], [0.2, 0.12], [0.2, 0.22], [0.13, 0.32], [0.1, 0.36], [0.001, 0.36]]), gold, x, 0, z));
      mandap.add(mesh(sphere(0.11, 12, 10), mats.fur('#8d5a2b'), x, 0.45, z));
    }
    mandap.position.set(0, 0, -6.5);
    group.add(mandap);
    // flower backdrop behind the mandap
    const wall = canvasTexture(512, 256, (c, w, h) => {
      c.fillStyle = '#fff3e0'; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 400; i++) { c.fillStyle = ['#ff9408', '#e53935', '#ffffff', '#ff80ab', '#ffd23f'][i % 5]; c.beginPath(); c.arc((i * 97) % w, (i * 53) % h, 9 + (i % 4), 0, 7); c.fill(); }
    }, { repeat: 1 });
    group.add(mesh(new THREE.PlaneGeometry(9, 4.5), new THREE.MeshStandardMaterial({ map: wall, roughness: 0.9 }), 0, 2.25, -9.8, { cast: false }));
    // guest chairs, fairy lights, lanterns, trees
    for (const side of [-1, 1]) for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) {
      const ch = chair('#d9a93a');
      ch.position.set(side * (2.4 + k * 0.85), 0, -1.5 + r * 1.3);
      ch.rotation.y = Math.PI;
      group.add(ch);
      ch.children.forEach((m) => { if (m.geometry?.parameters?.height === 0.06) m.material = mats.cloth('#c62828'); });
    }
    const bulbs = [];
    for (const z of [-3, 0, 3]) {
      for (let i = 0; i <= 24; i++) {
        const k = i / 24, x = -8 + 16 * k, y = 4.4 - Math.sin(k * Math.PI) * 0.7;
        const m = new THREE.MeshBasicMaterial({ color: ['#ffe082', '#ffcc80', '#fff59d'][i % 3] });
        group.add(mesh(sphere(0.06, 8, 6), m, x, y, z, { cast: false, receive: false }));
        bulbs.push([m, m.color.clone()]);
      }
    }
    movers.push((t) => bulbs.forEach(([m, c], i) => m.color.copy(c).multiplyScalar(0.8 + 0.5 * Math.max(0, Math.sin(t * 2.5 + i * 0.7)))));
    for (const x of [-8.5, 8.5]) { const l = lampPost(3.4); l.position.set(x, 0, -2); l.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; group.add(l); }
    for (const [x, z] of [[-11, -7], [11, -6], [-13, 1], [13, 2], [-10, -12], [10, -12]]) { const tr = roundTree(rand); tr.position.set(x, 0, z); tr.scale.setScalar(1.3); group.add(tr); }
    return sunnyWorld(group, sky, sunDir, movers, uniforms, {
      sun: { color: '#ffb877', intensity: 1.9 }, hemi: { sky: '#ffcf9e', ground: '#5a4a3a', intensity: 0.7 },
      fog: { color: '#f2b48a', near: 50, far: 220 }, exposure: 0.95, bloom: 0.45,
    });
  },

  async reception() {
    const rand = rng(301), movers = [];
    const W = 18, D = 12, H = 6;
    const group = room({ W, D, H, floor: tiles('#f3e7d3', '#e8d6b8', 6, 'rgba(160,120,60,0.18)'), floorRepeat: [4, 3], wall: wallTex('#fff4e6', { band: '#f3d9b1', bandH: 0.25 }), wallRepeat: 4 });
    group.children[0].material.roughness = 0.2;
    const back = -D / 2;
    // stage with steps, a flower wall and two thrones for the couple
    const stage = new THREE.Group();
    stage.add(mesh(new THREE.BoxGeometry(9, 0.5, 3.4), mats.cloth('#8e1b3a'), 0, 0.25, 0));
    stage.add(mesh(new THREE.BoxGeometry(9.1, 0.06, 3.5), mats.metal('#d9a93a', 0.25), 0, 0.52, 0));
    for (let i = 0; i < 2; i++) stage.add(mesh(new THREE.BoxGeometry(2.4, 0.25 * (i + 1), 0.4), mats.cloth('#b71c1c'), 0, 0.125 * (i + 1), 1.9 - i * 0.4));
    const flowerWall = canvasTexture(1024, 512, (c, w, h) => {
      c.fillStyle = '#fde7ef'; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) { c.fillStyle = ['#ffffff', '#f8bbd0', '#ff80ab', '#fff3e0', '#e1bee7'][i % 5]; c.beginPath(); c.arc((i * 131) % w, (i * 71) % h, 10 + (i % 5) * 2, 0, 7); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.roundRect(w * 0.25, h * 0.08, w * 0.5, h * 0.24, 30); c.fill();
      c.fillStyle = '#b8860b'; c.font = FONT(64); c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('Shubh Vivah  •  शुभ विवाह', w / 2, h * 0.2);
    }, { repeat: 1 });
    stage.add(mesh(new THREE.PlaneGeometry(8.6, 4.3), new THREE.MeshStandardMaterial({ map: flowerWall, roughness: 0.9 }), 0, 2.6, -1.6, { cast: false }));
    for (const x of [-4.4, 4.4]) stage.add(mesh(new THREE.CylinderGeometry(0.16, 0.16, 4.6, 16), mats.metal('#d9a93a', 0.2), x, 2.3, -1.5));
    for (const x of [-0.75, 0.75]) {
      const throne = new THREE.Group();
      throne.add(mesh(new THREE.BoxGeometry(1.0, 0.55, 0.8), mats.cloth('#c62828'), 0, 0.28, 0));
      throne.add(mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 24, 1, false, 0, Math.PI).rotateX(Math.PI / 2).rotateZ(Math.PI / 2).scale(1, 1.6, 1), mats.metal('#d9a93a', 0.2), 0, 1.15, -0.38));
      throne.add(mesh(new THREE.BoxGeometry(0.9, 0.9, 0.12), mats.cloth('#c62828'), 0, 1.0, -0.33));
      for (const s of [-1, 1]) throne.add(mesh(new THREE.BoxGeometry(0.12, 0.35, 0.75), mats.metal('#d9a93a', 0.2), s * 0.5, 0.72, 0));
      throne.position.set(x, 0.55, -0.7);
      stage.add(throne);
    }
    for (const x of [-3.6, 3.6]) {
      const vase = new THREE.Group();
      vase.add(mesh(lathe('bigVase', [[0.001, 0], [0.2, 0], [0.3, 0.5], [0.18, 0.9], [0.22, 1.0], [0.001, 1.0]]), mats.metal('#d9a93a', 0.2)));
      for (let i = 0; i < 9; i++) vase.add(mesh(sphere(0.12, 10, 8), mats.fur(['#ffffff', '#ff80ab', '#f8bbd0'][i % 3]), (rand() - 0.5) * 0.5, 1.15 + rand() * 0.35, (rand() - 0.5) * 0.5));
      vase.position.set(x, 0.55, 0.6);
      stage.add(vase);
    }
    stage.position.set(0, 0, back + 2);
    group.add(stage);
    // red carpet and guest tables
    group.add(mesh(new THREE.PlaneGeometry(2.4, 8).rotateX(-Math.PI / 2), mats.cloth('#b71c1c'), 0, 0.012, 1.6, { cast: false }));
    for (const [x, z] of [[-5.5, 0.6], [5.5, 0.6], [-6.8, 3.6], [6.8, 3.6]]) {
      const tb = new THREE.Group();
      tb.add(mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.75, 28), mats.cloth('#ffffff'), 0, 0.38, 0));
      tb.add(mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.03, 28), mats.cloth('#f8bbd0'), 0, 0.76, 0));
      tb.add(mesh(lathe('centerVase', [[0.001, 0], [0.08, 0], [0.12, 0.2], [0.06, 0.32], [0.001, 0.32]]), mats.glossy('#d9a93a', 0.2), 0, 0.77, 0));
      for (let i = 0; i < 5; i++) tb.add(mesh(sphere(0.06, 8, 6), mats.fur(['#ff80ab', '#ffffff'][i % 2]), (rand() - 0.5) * 0.15, 1.12 + rand() * 0.1, (rand() - 0.5) * 0.15));
      for (let k = 0; k < 4; k++) { const ch = chair('#d9a93a'); const a = (k / 4) * Math.PI * 2 + 0.4; ch.position.set(Math.cos(a) * 1.15, 0, Math.sin(a) * 1.15); ch.rotation.y = -a - Math.PI / 2; tb.add(ch); }
      tb.position.set(x, 0, z);
      group.add(tb);
    }
    // chandeliers
    for (const x of [-5, 0, 5]) {
      const ch = new THREE.Group();
      ch.add(mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.2), mats.metal('#d9a93a'), 0, 0.6, 0));
      ch.add(mesh(new THREE.TorusGeometry(0.55, 0.03, 8, 32).rotateX(Math.PI / 2), mats.metal('#d9a93a', 0.2), 0, 0, 0));
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; ch.add(mesh(sphere(0.06, 8, 6), mats.glow('#fff1c4', 1.6), Math.cos(a) * 0.55, -0.08, Math.sin(a) * 0.55, { cast: false })); }
      ch.position.set(x, H - 1.3, -1);
      group.add(ch);
    }
    const warm = new THREE.PointLight('#ffd9a0', 10, 16, 1.4);
    warm.position.set(0, H - 1.5, -2);
    group.add(warm);
    return roomWorld(group, movers, { W, D, H, sun: 1.3, hemi: 0.95, exposure: 1.0, sky: '#fff1e0', ground: '#c49a6c' });
  },
};
