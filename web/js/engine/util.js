// Shared helpers: deterministic randomness, noise, easing, and the material library.
import * as THREE from 'three';

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const smoothstep = (a, b, x) => { const k = clamp((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
export const easeInOut = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

function hash2(x, y) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

export function noise2(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return lerp(lerp(a, b, u), lerp(c, d, u), v) * 2 - 1;
}

export function fbm(x, y, octaves = 4) {
  let sum = 0, amp = 0.5, f = 1;
  for (let i = 0; i < octaves; i++) { sum += noise2(x * f, y * f) * amp; f *= 2; amp *= 0.5; }
  return sum;
}

// Smooth 1D noise for lively-but-repeatable motion (idle sway, gestures).
export const wobble = (t, seed = 0) => noise2(t, seed * 17.3);

// ---------- materials ----------
const cache = new Map();
function cached(key, make) {
  if (!cache.has(key)) { const m = make(); m.userData.shared = true; cache.set(key, m); }
  return cache.get(key);
}

export const mats = {
  skin: (c) => cached(`skin${c}`, () => new THREE.MeshPhysicalMaterial({
    color: c, roughness: 0.55, sheen: 0.4, sheenRoughness: 0.5, sheenColor: new THREE.Color('#ff9a7a'),
    emissive: new THREE.Color(c).multiplyScalar(0.03), // soft "light through skin" warmth
  })),
  fur: (c) => cached(`fur${c}`, () => new THREE.MeshPhysicalMaterial({
    color: c, roughness: 0.85, sheen: 1, sheenRoughness: 0.35,
    sheenColor: new THREE.Color(c).lerp(new THREE.Color('#ffffff'), 0.6),
    emissive: new THREE.Color(c).multiplyScalar(0.04),
  })),
  cloth: (c) => cached(`cloth${c}`, () => new THREE.MeshPhysicalMaterial({
    color: c, roughness: 0.8, sheen: 0.7, sheenRoughness: 0.6, sheenColor: new THREE.Color(c).lerp(new THREE.Color('#fff'), 0.4),
  })),
  glossy: (c, rough = 0.15) => cached(`glossy${c}${rough}`, () => new THREE.MeshPhysicalMaterial({
    color: c, roughness: rough, clearcoat: 1, clearcoatRoughness: 0.05,
  })),
  matte: (c, rough = 0.9) => cached(`matte${c}${rough}`, () => new THREE.MeshStandardMaterial({ color: c, roughness: rough })),
  metal: (c, rough = 0.3) => cached(`metal${c}${rough}`, () => new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: 0.85 })),
  glow: (c, strength = 3) => cached(`glow${c}${strength}`, () => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(strength), toneMapped: true })),
  blush: () => cached('blush', () => new THREE.MeshBasicMaterial({ color: '#ff6f8f', transparent: true, opacity: 0.28, depthWrite: false })),
};

// ---------- geometry cache (characters share geometry) ----------
const geoCache = new Map();
export function geo(key, make) {
  if (!geoCache.has(key)) { const g = make(); g.userData.shared = true; geoCache.set(key, g); }
  return geoCache.get(key);
}

export const sphere = (r, w = 32, h = 24) => geo(`s${r}${w}${h}`, () => new THREE.SphereGeometry(r, w, h));
export const capsule = (r, len, seg = 16) => geo(`c${r}${len}${seg}`, () => new THREE.CapsuleGeometry(r, len, 8, seg));
// Round shape spun from [radius, y] points (clothes, bottles, bowls).
export const lathe = (key, pts, seg = 48) => geo(key, () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg));
// Bent tube along a list of [x, y, z] points (dupatta, straps, cords).
export const tube = (pts, r, seg = 40) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), seg, r, 8, false);

export function mesh(geometry, material, x = 0, y = 0, z = 0, { cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  m.castShadow = cast;
  m.receiveShadow = receive;
  return m;
}

// Lumpy sphere (clouds, bushes, tree canopies) - unique geometry, so not cached.
export function blob(radius, seed, lumpiness = 0.18, detail = 3) {
  const g = new THREE.IcosahedronGeometry(radius, detail);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = v.clone().normalize();
    const k = 1 + fbm(n.x * 2.3 + seed, n.y * 2.3 + n.z * 1.7 - seed, 3) * lumpiness;
    v.copy(n).multiplyScalar(radius * k);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

export function canvasTexture(w, h, draw, { repeat = 1, srgb = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 8;
  return tex;
}

export function disposeTree(root) {
  root.traverse((o) => {
    if (o.geometry && !o.geometry.userData.shared) o.geometry.dispose();
    for (const m of [].concat(o.material || [])) {
      if (m.userData.shared) continue;
      for (const k of ['map', 'normalMap', 'roughnessMap', 'alphaMap']) m[k]?.dispose?.();
      m.dispose();
    }
  });
}
