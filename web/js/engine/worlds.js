// Stylized, softly lit story locations. Each world is built once and reused by every shot.
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { Water } from 'three/addons/objects/Water.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mats, mesh, sphere, capsule, geo, blob, rng, fbm, noise2, smoothstep, canvasTexture, clamp } from './util.js';
import { loadModel, buildSwing, buildSlide } from './characters.js';
import { PLACES, PLACE_BUILDERS } from './places.js';

export const WORLDS = {
  meadow: 'Sunny meadow',
  forest: 'Enchanted forest',
  beach: 'Beach',
  night: 'Night garden',
  bedroom: 'Cozy bedroom',
  space: 'Outer space',
  pond: 'Near a pond',
  house: 'Outside a house',
  playground: 'Playground',
  ...PLACES,
};

export const dirFrom = (azimuthDeg, elevationDeg) => {
  const az = THREE.MathUtils.degToRad(azimuthDeg), el = THREE.MathUtils.degToRad(elevationDeg);
  return new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
};

// ---------- building blocks ----------
export function makeSky(sunDir, { turbidity = 4, rayleigh = 1.2, mie = 0.004, mieG = 0.8 } = {}) {
  const sky = new Sky();
  sky.scale.setScalar(4000);
  const u = sky.material.uniforms;
  u.turbidity.value = turbidity;
  u.rayleigh.value = rayleigh;
  u.mieCoefficient.value = mie;
  u.mieDirectionalG.value = mieG;
  u.sunPosition.value.copy(sunDir).multiplyScalar(1000);
  return sky;
}

export function terrain({ size = 260, seg = 180, flat = 14, hill = 7, color = (h, n) => new THREE.Color('#6fbf4f'), height }) {
  const g = new THREE.PlaneGeometry(size, size, seg, seg);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  const colors = [];
  const hf = height || ((x, z) => {
    const r = Math.hypot(x, z);
    return smoothstep(flat, flat + 35, r) * (fbm(x * 0.025, z * 0.025, 4) * hill + hill * 0.8) + smoothstep(5, 9, r) * fbm(x * 0.2, z * 0.2, 2) * 0.12;
  });
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    const h = hf(x, z);
    p.setY(i, h);
    const c = color(h, fbm(x * 0.08 + 7, z * 0.08, 3), x, z);
    colors.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  const m = mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }), 0, 0, 0, { cast: false });
  m.userData.height = hf;
  return m;
}

export function grass(heightFn, { count = 26000, radius = 26, minR = 0, palette = ['#4f9e35', '#6cbc3f', '#88cf52'], tall = 0.13, rand, uniforms, skip }) {
  const blade = new THREE.PlaneGeometry(0.03, 1, 1, 4);
  blade.translate(0, 0.5, 0);
  const bp = blade.attributes.position;
  const col = [];
  for (let i = 0; i < bp.count; i++) {
    const y = bp.getY(i);
    bp.setX(i, bp.getX(i) * (1 - y * 0.9));
    const k = 0.45 + y * 0.55;
    col.push(k, k, k);
  }
  blade.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const n = blade.attributes.normal;
  for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0.2);

  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.85 });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      vec4 wp = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      float h = position.y;
      float w = sin(uTime * 1.7 + wp.x * 0.3 + wp.z * 0.2) * 0.6 + sin(uTime * 3.3 + wp.x * 1.3 + wp.z) * 0.25;
      transformed.x += w * h * h * 0.22;
      transformed.z += w * h * h * 0.1;`);
  };
  const inst = new THREE.InstancedMesh(blade, mat, count);
  inst.receiveShadow = true;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), pos = new THREE.Vector3(), c = new THREE.Color();
  const pal = palette.map((x) => new THREE.Color(x));
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt(minR * minR + rand() * (radius * radius - minR * minR));
    const a = rand() * Math.PI * 2;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    pos.set(x, heightFn(x, z) - 0.02, z);
    q.setFromEuler(new THREE.Euler((rand() - 0.5) * 0.3, rand() * Math.PI, (rand() - 0.5) * 0.3));
    const h = tall * (0.6 + rand() * 0.8) * (0.8 + (fbm(x * 0.3, z * 0.3, 2) + 0.5) * 0.5) * (1 + smoothstep(8, 22, r) * 1.5);
    s.set(1 + rand(), h, 1);
    if (skip?.(x, z)) s.set(0, 0, 0);
    inst.setMatrixAt(i, m4.compose(pos, q, s));
    inst.setColorAt(i, c.copy(pal[Math.floor(rand() * pal.length)]).offsetHSL(0, 0, (rand() - 0.5) * 0.06));
  }
  return inst;
}

export function roundTree(rand, leafColors = ['#4caf50', '#5cbf55', '#3e9e4a']) {
  const g = new THREE.Group();
  const trunk = new THREE.CylinderGeometry(0.16, 0.28, 2.4, 10, 4);
  trunk.translate(0, 1.2, 0);
  g.add(mesh(trunk, mats.matte('#7a5234', 0.95)));
  const parts = [];
  const n = 5 + Math.floor(rand() * 3);
  for (let i = 0; i < n; i++) {
    const r = 0.8 + rand() * 0.6;
    const b = blob(r, rand() * 50, 0.2, 3);
    b.translate((rand() - 0.5) * 1.6, 2.6 + rand() * 1.4, (rand() - 0.5) * 1.6);
    parts.push(b);
  }
  const leaf = mats.fur(leafColors[Math.floor(rand() * leafColors.length)]);
  g.add(mesh(mergeGeometries(parts), leaf));
  return g;
}

export function pineTree(rand, color = '#2f7d4f') {
  const g = new THREE.Group();
  const trunk = new THREE.CylinderGeometry(0.12, 0.2, 1.2, 8);
  trunk.translate(0, 0.6, 0);
  g.add(mesh(trunk, mats.matte('#6b4428')));
  const parts = [];
  for (let i = 0; i < 4; i++) {
    const c = new THREE.ConeGeometry(1.4 - i * 0.28, 1.5, 12, 1);
    c.translate(0, 1.4 + i * 0.85, 0);
    parts.push(c);
  }
  g.add(mesh(mergeGeometries(parts), mats.fur(color)));
  g.scale.setScalar(0.9 + rand() * 0.8);
  return g;
}

function cloud(rand) {
  const parts = [];
  const n = 4 + Math.floor(rand() * 4);
  for (let i = 0; i < n; i++) {
    const r = 3 + rand() * 4;
    const b = blob(r, rand() * 40, 0.12, 2);
    b.translate(i * 4.5 - n * 2.2, rand() * 2.5, rand() * 3);
    parts.push(b);
  }
  const m = mesh(mergeGeometries(parts), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, emissive: '#dfe9ff', emissiveIntensity: 0.35, fog: false }), 0, 0, 0, { cast: false, receive: false });
  m.scale.y = 0.6;
  return m;
}

export function addClouds(group, rand, movers, count = 12, tint) {
  for (let i = 0; i < count; i++) {
    const c = cloud(rand);
    if (tint) c.material.emissive.set(tint);
    const a = -Math.PI * 0.9 + rand() * Math.PI * 0.8; // mostly behind the stage
    const d = 180 + rand() * 180;
    c.position.set(Math.cos(a) * d, 45 + rand() * 50, Math.sin(a) * d);
    c.lookAt(0, c.position.y, 0);
    group.add(c);
    const speed = 0.4 + rand() * 0.5, x0 = c.position.x;
    movers.push((t) => { c.position.x = x0 + t * speed; });
  }
}

export function flowers(heightFn, rand, count, radius, colors, skip) {
  const g = new THREE.Group();
  const head = new THREE.SphereGeometry(0.05, 10, 8);
  head.scale(1, 0.55, 1);
  const stem = new THREE.CylinderGeometry(0.006, 0.006, 0.22, 4);
  stem.translate(0, 0.11, 0);
  const stems = new THREE.InstancedMesh(stem, mats.fur('#3f9a3a'), count);
  const heads = new THREE.InstancedMesh(head, new THREE.MeshPhysicalMaterial({ roughness: 0.6, sheen: 1 }), count);
  const m4 = new THREE.Matrix4(), c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const r = 3 + rand() * radius, a = rand() * Math.PI * 2;
    const x = Math.cos(a) * r, z = Math.sin(a) * r, y = heightFn(x, z);
    const s = skip?.(x, z) ? 0 : 0.8 + rand() * 0.8;
    m4.makeScale(s, s, s).setPosition(x, y, z);
    stems.setMatrixAt(i, m4);
    m4.makeScale(s, s, s).setPosition(x, y + 0.22 * s, z);
    heads.setMatrixAt(i, m4);
    heads.setColorAt(i, c.set(colors[Math.floor(rand() * colors.length)]));
  }
  heads.castShadow = true;
  g.add(stems, heads);
  return g;
}

export function rock(rand, color = '#8d8f96') {
  const m = mesh(blob(0.5 + rand() * 0.6, rand() * 30, 0.3, 2), mats.matte(color, 0.9));
  m.scale.y = 0.6;
  return m;
}

function cottage(glowWindows = false) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(4, 2.6, 3.4), mats.matte('#fff1d6'), 0, 1.3, 0));
  const roofShape = new THREE.Shape([new THREE.Vector2(-2.4, 0), new THREE.Vector2(2.4, 0), new THREE.Vector2(0, 1.8)]);
  const roof = mesh(new THREE.ExtrudeGeometry(roofShape, { depth: 3.9, bevelEnabled: false }), mats.matte('#d9534f', 0.7), 0, 2.6, -1.95);
  g.add(roof);
  g.add(mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), mats.matte('#a0522d'), 1.1, 3.8, -0.4));
  g.add(mesh(new THREE.BoxGeometry(0.8, 1.5, 0.08), mats.matte('#8b5a2b'), 0, 0.75, 1.72));
  const win = glowWindows ? mats.glow('#ffcc66', 2.5) : mats.glossy('#9fd3ff', 0.05);
  for (const x of [-1.3, 1.3]) g.add(mesh(new THREE.BoxGeometry(0.7, 0.7, 0.06), win, x, 1.5, 1.72, { cast: false }));
  return g;
}

export function fence(from, to, count) {
  const g = new THREE.Group();
  const wood = mats.matte('#b98b5e');
  for (let i = 0; i <= count; i++) {
    const k = i / count;
    g.add(mesh(new THREE.BoxGeometry(0.12, 1, 0.12), wood, THREE.MathUtils.lerp(from.x, to.x, k), 0.5, THREE.MathUtils.lerp(from.z, to.z, k)));
  }
  const len = from.distanceTo(to);
  for (const y of [0.35, 0.75]) {
    const rail = mesh(new THREE.BoxGeometry(len, 0.08, 0.06), wood, (from.x + to.x) / 2, y, (from.z + to.z) / 2);
    rail.rotation.y = -Math.atan2(to.z - from.z, to.x - from.x);
    g.add(rail);
  }
  return g;
}

export async function birds(group, movers, kind = 'Parrot', count = 3, rand) {
  let gltf;
  try { gltf = await loadModel(`/models/${kind}.glb`); } catch { return; }
  const { clone } = await import('three/addons/utils/SkeletonUtils.js');
  for (let i = 0; i < count; i++) {
    const bird = clone(gltf.scene);
    bird.scale.setScalar(0.02);
    bird.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.geometry.userData.shared = true; } });
    const mixer = new THREE.AnimationMixer(bird);
    const action = mixer.clipAction(gltf.animations[0]);
    action.play();
    const holder = new THREE.Group();
    holder.add(bird);
    group.add(holder);
    const radius = 14 + rand() * 12, height = 7 + rand() * 6, speed = 0.18 + rand() * 0.1, phase = rand() * 6;
    const clip = gltf.animations[0].duration;
    movers.push((t) => {
      const a = phase + t * speed;
      holder.position.set(Math.cos(a) * radius, height + Math.sin(t * 0.7 + phase) * 1.2, Math.sin(a) * radius - 10);
      holder.rotation.y = -a; // face along the circle
      action.time = (t * 1.1 + phase) % clip;
      mixer.update(0);
    });
  }
}

function stars(count, radius, rand, size = 1.6) {
  const pos = [];
  for (let i = 0; i < count; i++) {
    const u = rand() * 2 - 1, th = rand() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    pos.push(Math.cos(th) * r * radius, Math.abs(u) * radius * 0.9 + 20, Math.sin(th) * r * radius);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color: '#ffffff', size, sizeAttenuation: false, transparent: true, opacity: 0.9, fog: false }));
}

// default rolling hills: flat stage in the middle
export const hills = (x, z) => {
  const r = Math.hypot(x, z);
  return smoothstep(14, 49, r) * (fbm(x * 0.025, z * 0.025, 4) * 7 + 5.6) + smoothstep(5, 9, r) * fbm(x * 0.2, z * 0.2, 2) * 0.12;
};
export const lawn = (h, n) => new THREE.Color('#5fae3e').lerp(new THREE.Color('#9ccf57'), clamp(n + 0.5, 0, 1)).lerp(new THREE.Color('#4e8f3c'), clamp(h / 12, 0, 0.5));

export function scatterTrees(group, rand, H, count, keepOut, colors) {
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2, r = 15 + rand() * 32;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if ((z > 8 && Math.abs(x) < 20) || keepOut?.(x, z)) continue;
    const tr = roundTree(rand, colors);
    tr.position.set(x, H(x, z) - 0.1, z);
    tr.scale.setScalar(0.9 + rand() * 0.7);
    group.add(tr);
  }
}

export function bush(rand, color = '#4a9f45') {
  return mesh(blob(0.55 + rand() * 0.35, rand() * 20, 0.25, 2), mats.fur(color));
}

export function picketFence(from, to, color = '#ffffff') {
  const g = new THREE.Group();
  const paint = mats.matte(color, 0.7);
  const len = from.distanceTo(to), n = Math.max(2, Math.round(len / 0.32));
  const picket = geo('picket', () => {
    const board = new THREE.BoxGeometry(0.16, 0.9, 0.04).translate(0, 0.45, 0);
    const tip = new THREE.ConeGeometry(0.113, 0.16, 4).rotateY(Math.PI / 4).scale(1, 1, 0.35).translate(0, 0.98, 0);
    return mergeGeometries([board.toNonIndexed(), tip.toNonIndexed()]);
  });
  for (let i = 0; i <= n; i++) {
    const m = mesh(picket, paint);
    m.position.lerpVectors(from, to, i / n);
    m.rotation.y = -Math.atan2(to.z - from.z, to.x - from.x);
    g.add(m);
  }
  for (const y of [0.3, 0.7]) {
    const rail = mesh(new THREE.BoxGeometry(len, 0.07, 0.04), paint, (from.x + to.x) / 2, y, (from.z + to.z) / 2 - 0.03);
    rail.rotation.y = -Math.atan2(to.z - from.z, to.x - from.x);
    g.add(rail);
  }
  return g;
}

function duck(rand) {
  const g = new THREE.Group();
  const white = mats.fur(rand() > 0.5 ? '#ffffff' : '#ffe066');
  const body = mesh(sphere(0.22), white, 0, 0.1, 0);
  body.scale.set(0.85, 0.7, 1.2);
  g.add(body);
  const tailTip = mesh(sphere(0.08), white, 0, 0.2, -0.24);
  tailTip.scale.set(0.7, 0.6, 1);
  g.add(tailTip);
  g.add(mesh(sphere(0.13), white, 0, 0.34, 0.18));
  const beak = mesh(sphere(0.06), mats.glossy('#ff9f1c', 0.3), 0, 0.31, 0.31);
  beak.scale.set(1.2, 0.5, 1.3);
  g.add(beak);
  for (const s of [-1, 1]) g.add(mesh(sphere(0.022, 10, 8), mats.glossy('#111111', 0.1), s * 0.07, 0.38, 0.27, { cast: false }));
  return g;
}

export function bench() {
  const g = new THREE.Group();
  const wood = mats.matte('#b07a45', 0.8), iron = mats.metal('#333333', 0.5);
  for (const [y, z, rx] of [[0.45, 0, 0], [0.45, 0.14, 0], [0.45, -0.14, 0], [0.75, -0.24, -0.25], [0.95, -0.28, -0.25]]) {
    const plank = mesh(new THREE.BoxGeometry(1.6, 0.05, 0.12), wood, 0, y, z);
    plank.rotation.x = rx;
    g.add(plank);
  }
  for (const x of [-0.7, 0.7]) {
    g.add(mesh(new THREE.BoxGeometry(0.05, 0.45, 0.4), iron, x, 0.22, 0));
    g.add(mesh(new THREE.BoxGeometry(0.05, 0.6, 0.05), iron, x, 0.7, -0.24));
  }
  return g;
}

export function sunnyWorld(group, sky, sunDir, movers, uniforms, extra = {}) {
  return {
    group, sky, sunDir, movers, uniforms, env: 'sky',
    sun: { color: '#fff1d9', intensity: 2.6 }, hemi: { sky: '#bfe3ff', ground: '#6a8f4a', intensity: 0.45 },
    fog: { color: '#cfe6ff', near: 60, far: 260 }, exposure: 0.78, ...extra,
  };
}

// ---------- worlds ----------
const builders = {
  async meadow() {
    const rand = rng(11), group = new THREE.Group(), movers = [], uniforms = { uTime: { value: 0 } };
    const sunDir = dirFrom(-35, 38);
    const sky = makeSky(dirFrom(-35, 38));
    group.add(sky);
    const ground = terrain({ color: (h, n) => new THREE.Color('#5fae3e').lerp(new THREE.Color('#9ccf57'), clamp(n + 0.5, 0, 1)).lerp(new THREE.Color('#4e8f3c'), clamp(h / 12, 0, 0.5)) });
    const H = ground.userData.height;
    group.add(ground);
    group.add(grass(H, { rand, uniforms }));
    group.add(flowers(H, rand, 500, 24, ['#ff6fae', '#ffd23f', '#ffffff', '#b28dff', '#ff8a4c']));
    for (let i = 0; i < 26; i++) {
      const a = rand() * Math.PI * 2, r = 17 + rand() * 30;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (z > 8 && Math.abs(x) < 20) continue; // keep the camera side open
      const tr = roundTree(rand);
      tr.position.set(x, H(x, z) - 0.1, z);
      tr.scale.setScalar(0.9 + rand() * 0.7);
      group.add(tr);
    }
    for (let i = 0; i < 10; i++) {
      const a = rand() * Math.PI * 2, r = 9 + rand() * 12;
      const b = mesh(blob(0.6 + rand() * 0.4, rand() * 20, 0.25, 2), mats.fur('#4a9f45'));
      b.position.set(Math.cos(a) * r, H(Math.cos(a) * r, Math.sin(a) * r) + 0.2, Math.sin(a) * r);
      if (b.position.z < 5) group.add(b);
    }
    for (let i = 0; i < 8; i++) {
      const r = rock(rand), a = rand() * Math.PI * 2, d = 8 + rand() * 14;
      r.position.set(Math.cos(a) * d, H(Math.cos(a) * d, Math.sin(a) * d), Math.sin(a) * d);
      group.add(r);
    }
    const house = cottage();
    house.position.set(-13, H(-13, -19), -19);
    house.rotation.y = 0.5;
    group.add(house);
    group.add(fence(new THREE.Vector3(-9, 0, -11), new THREE.Vector3(-2, 0, -12.5), 8));
    addClouds(group, rand, movers);
    await birds(group, movers, 'Parrot', 3, rand);
    return {
      group, sky, sunDir, movers, uniforms, env: 'sky',
      sun: { color: '#fff1d9', intensity: 2.6 }, hemi: { sky: '#bfe3ff', ground: '#6a8f4a', intensity: 0.45 },
      fog: { color: '#cfe6ff', near: 60, far: 260 }, exposure: 0.78,
    };
  },

  async forest() {
    const rand = rng(23), group = new THREE.Group(), movers = [], uniforms = { uTime: { value: 0 } };
    const sunDir = dirFrom(-60, 28);
    const sky = makeSky(sunDir, { turbidity: 6, rayleigh: 1.6 });
    group.add(sky);
    const ground = terrain({ flat: 10, hill: 5, color: (h, n) => new THREE.Color('#3d7a34').lerp(new THREE.Color('#6b8f3a'), clamp(n + 0.5, 0, 1)) });
    const H = ground.userData.height;
    group.add(ground);
    group.add(grass(H, { rand, uniforms, count: 18000, radius: 22, palette: ['#3f7f2f', '#4d9135', '#5a8f2e'], tall: 0.18 }));
    for (let i = 0; i < 90; i++) {
      const a = rand() * Math.PI * 2, r = 7.5 + rand() * 45;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (z > 5 && Math.abs(x) < 7) continue;
      const tr = rand() > 0.45 ? pineTree(rand, rand() > 0.5 ? '#2f6f45' : '#3a7d4a') : roundTree(rand, ['#3f8f3f', '#5a9f3a', '#2f7f45']);
      tr.position.set(x, H(x, z) - 0.1, z);
      tr.scale.multiplyScalar(1.1 + rand() * 0.9);
      group.add(tr);
    }
    const capMat = mats.glossy('#e53935', 0.35), dotMat = mats.matte('#ffffff');
    for (let i = 0; i < 16; i++) {
      const m = new THREE.Group();
      const s = 0.5 + rand() * 1.1;
      m.add(mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.35, 12), mats.matte('#fff5e1'), 0, 0.17, 0));
      m.add(mesh(new THREE.SphereGeometry(0.25, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), capMat, 0, 0.3, 0));
      for (let k = 0; k < 5; k++) {
        const d = mesh(sphere(0.03, 8, 6), dotMat);
        const a = rand() * 6.28, el = 0.3 + rand() * 0.8;
        d.position.set(Math.cos(a) * Math.cos(el) * 0.25, 0.3 + Math.sin(el) * 0.25, Math.sin(a) * Math.cos(el) * 0.25);
        m.add(d);
      }
      const a = rand() * Math.PI * 2, r = 3.5 + rand() * 8;
      m.position.set(Math.cos(a) * r, H(Math.cos(a) * r, Math.sin(a) * r), Math.sin(a) * r);
      m.scale.setScalar(s);
      if (m.position.z < 4) group.add(m);
    }
    const log = mesh(new THREE.CylinderGeometry(0.35, 0.35, 3, 16), mats.matte('#7a5234'), 4.5, 0.35, -4);
    log.rotation.set(0, 0.4, Math.PI / 2);
    group.add(log);
    for (let i = 0; i < 10; i++) {
      const r = rock(rand, '#7d8a7a'), a = rand() * 6.28, d = 6 + rand() * 12;
      r.position.set(Math.cos(a) * d, H(Math.cos(a) * d, Math.sin(a) * d), Math.sin(a) * d);
      group.add(r);
    }
    // floating pollen sparkles in the light
    const motes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.018, 6, 4), mats.glow('#fff3b0', 2), 120);
    const seeds = Array.from({ length: 120 }, () => [rand() * 16 - 8, rand() * 3 + 0.4, rand() * 10 - 7, rand() * 6]);
    const m4 = new THREE.Matrix4();
    movers.push((t) => {
      seeds.forEach(([x, y, z, p], i) => {
        m4.makeTranslation(x + Math.sin(t * 0.3 + p) * 0.6, y + Math.sin(t * 0.5 + p * 2) * 0.3, z + Math.cos(t * 0.25 + p) * 0.6);
        motes.setMatrixAt(i, m4);
      });
      motes.instanceMatrix.needsUpdate = true;
    });
    group.add(motes);
    await birds(group, movers, 'Stork', 2, rand);
    return {
      group, sky, sunDir, movers, uniforms, env: 'sky',
      envColors: ['#7fb0a8', '#d3e6c8', '#3f5a30', 0.8],
      sun: { color: '#ffe0b0', intensity: 2.6 }, hemi: { sky: '#cfe8d0', ground: '#3d5a2c', intensity: 0.4 },
      fog: { color: '#a9c9b0', near: 14, far: 75 }, exposure: 0.85,
    };
  },

  async beach() {
    const rand = rng(37), group = new THREE.Group(), movers = [];
    const sunDir = dirFrom(-25, 42);
    const sky = makeSky(sunDir, { turbidity: 3, rayleigh: 1 });
    group.add(sky);
    const H = (x, z) => {
      const shore = -smoothstep(-5, -16, z) * 1.6;
      const dunes = smoothstep(10, 40, Math.hypot(x, z)) * (fbm(x * 0.04, z * 0.04, 3) * 3 + 2) * smoothstep(-5, 8, z);
      return shore + dunes + smoothstep(4, 8, Math.hypot(x, z)) * fbm(x * 0.3, z * 0.3, 2) * 0.05;
    };
    group.add(terrain({ height: H, color: (h, n) => new THREE.Color('#f3dcaa').lerp(new THREE.Color('#e6c88c'), clamp(n + 0.5, 0, 1)).lerp(new THREE.Color('#c9a66b'), clamp(-h, 0, 1)) }));
    const normals = new THREE.TextureLoader().load('/vendor/waternormals.jpg', (t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; });
    const water = new Water(new THREE.PlaneGeometry(600, 300), {
      textureWidth: 512, textureHeight: 512, waterNormals: normals, sunDirection: sunDir.clone(), sunColor: 0xffffff,
      waterColor: 0x0f8fb0, distortionScale: 2.2, alpha: 0.95,
    });
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.55, -158);
    group.add(water);
    movers.push((t) => { water.material.uniforms.time.value = t * 0.5; });
    // palms
    for (const [x, z, lean] of [[-7, -3, 0.35], [-9.5, 2, 0.2], [8, -4, -0.3], [11, 1, -0.2], [-15, -8, 0.3], [16, -6, -0.35]]) {
      const palm = new THREE.Group();
      let y = 0;
      for (let i = 0; i < 9; i++) {
        const seg = mesh(new THREE.CylinderGeometry(0.17 - i * 0.008, 0.2 - i * 0.008, 0.5, 10), mats.matte(i % 2 ? '#a57a4f' : '#94693f'), lean * i * i * 0.04, y + 0.25, 0);
        palm.add(seg);
        y += 0.47;
      }
      const top = new THREE.Vector3(lean * 81 * 0.04, y, 0);
      for (let i = 0; i < 8; i++) {
        const leaf = new THREE.Group();
        leaf.position.copy(top);
        leaf.rotation.y = (i / 8) * Math.PI * 2;
        const blade = new THREE.PlaneGeometry(0.7, 2.4, 1, 6);
        const bp = blade.attributes.position;
        for (let k = 0; k < bp.count; k++) {
          const v = (bp.getY(k) + 1.2) / 2.4;
          bp.setX(k, bp.getX(k) * Math.sin(v * Math.PI) * 1.2);
          bp.setZ(k, -v * v * 1.1);
          bp.setY(k, v * 2.2);
        }
        blade.computeVertexNormals();
        const b = mesh(blade, new THREE.MeshPhysicalMaterial({ color: '#3e9e3a', side: THREE.DoubleSide, roughness: 0.7, sheen: 0.5 }));
        b.rotation.x = -1.0;
        leaf.add(b);
        palm.add(leaf);
      }
      for (let i = 0; i < 3; i++) palm.add(mesh(sphere(0.14), mats.matte('#6b4a2b'), top.x + Math.cos(i * 2) * 0.2, top.y - 0.15, Math.sin(i * 2) * 0.2));
      palm.position.set(x, H(x, z), z);
      group.add(palm);
    }
    // umbrella, towel, sandcastle, shells
    const umb = new THREE.Group();
    umb.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6), mats.matte('#ffffff'), 0, 1.3, 0));
    const canopy = new THREE.ConeGeometry(1.6, 0.6, 16, 1, true);
    const cc = [];
    for (let i = 0; i < canopy.attributes.position.count; i++) {
      const a = Math.atan2(canopy.attributes.position.getZ(i), canopy.attributes.position.getX(i));
      const c = new THREE.Color(Math.floor(((a + Math.PI) / (Math.PI * 2)) * 16) % 2 ? '#ff5c5c' : '#ffffff');
      cc.push(c.r, c.g, c.b);
    }
    canopy.setAttribute('color', new THREE.Float32BufferAttribute(cc, 3));
    umb.add(mesh(canopy, new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.7, flatShading: true }), 0, 2.5, 0));
    umb.position.set(5.5, 0, -2.5);
    umb.rotation.z = -0.12;
    group.add(umb);
    group.add(mesh(new THREE.BoxGeometry(1, 0.02, 2), mats.cloth('#3fa7ff'), 5.2, 0.02, -1.5));
    const castle = new THREE.Group();
    const sand = mats.matte('#e8c98f');
    castle.add(mesh(new THREE.BoxGeometry(1.1, 0.45, 1.1), sand, 0, 0.22, 0));
    for (const [x, z] of [[-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55]]) {
      castle.add(mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.7, 12), sand, x, 0.35, z));
      castle.add(mesh(new THREE.ConeGeometry(0.24, 0.35, 12), sand, x, 0.87, z));
    }
    castle.add(mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.5), mats.matte('#555'), 0.55, 1.2, 0.55));
    castle.add(mesh(new THREE.BoxGeometry(0.25, 0.15, 0.01), mats.cloth('#ff5c5c'), 0.68, 1.35, 0.55));
    castle.position.set(-3.5, 0, -3.2);
    group.add(castle);
    for (let i = 0; i < 18; i++) {
      const shell = mesh(new THREE.SphereGeometry(0.06, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), mats.glossy(['#ffd1dc', '#fff3e0', '#ffe0b2'][i % 3], 0.3));
      const x = rand() * 16 - 8, z = rand() * 8 - 6;
      shell.position.set(x, H(x, z), z);
      group.add(shell);
    }
    addClouds(group, rand, movers, 8);
    await birds(group, movers, 'Flamingo', 2, rand);
    return {
      group, sky, sunDir, movers, env: 'sky',
      envColors: ['#58a8ff', '#e8f4ff', '#e8d2a0', 0.95],
      sun: { color: '#fff4e0', intensity: 2.8 }, hemi: { sky: '#bfe8ff', ground: '#e8cf9f', intensity: 0.5 },
      fog: { color: '#d8efff', near: 80, far: 380 }, exposure: 0.75,
    };
  },

  async night() {
    const rand = rng(51), group = new THREE.Group(), movers = [], uniforms = { uTime: { value: 0 } };
    const sunDir = dirFrom(30, 40);
    const skyGeo = new THREE.SphereGeometry(3000, 32, 16);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { top: { value: new THREE.Color('#050a24') }, bottom: { value: new THREE.Color('#2a3d78') } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ gl_FragColor = vec4(mix(bottom, top, smoothstep(-0.05, 0.5, vP.y)), 1.0); }',
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    group.add(sky);
    group.add(stars(2500, 2500, rand, 1.8));
    const moon = mesh(sphere(40, 48, 32), mats.glow('#fff6d8', 1.4), 0, 0, 0, { cast: false, receive: false });
    moon.position.set(-420, 520, -1600);
    group.add(moon);
    const ground = terrain({ color: (h, n) => new THREE.Color('#2e5a3a').lerp(new THREE.Color('#3f6f45'), clamp(n + 0.5, 0, 1)) });
    const H = ground.userData.height;
    group.add(ground);
    group.add(grass(H, { rand, uniforms, count: 20000, palette: ['#2f5f3a', '#3b7045', '#2a5a45'] }));
    group.add(flowers(H, rand, 200, 20, ['#b3c7ff', '#ffffff', '#d9b3ff']));
    for (let i = 0; i < 22; i++) {
      const a = rand() * Math.PI * 2, r = 16 + rand() * 30;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (z > 8 && Math.abs(x) < 20) continue;
      const tr = roundTree(rand, ['#2f5a3f', '#355f45']);
      tr.position.set(x, H(x, z) - 0.1, z);
      group.add(tr);
    }
    const house = cottage(true);
    house.position.set(-12, H(-12, -17), -17);
    house.rotation.y = 0.5;
    group.add(house);
    // lanterns with warm light
    for (const [x, z] of [[-4.2, -2.5], [4.5, -3]]) {
      const post = new THREE.Group();
      post.add(mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.8), mats.metal('#333333', 0.5), 0, 0.9, 0));
      post.add(mesh(sphere(0.18), mats.glow('#ffb347', 3), 0, 1.95, 0, { cast: false }));
      const light = new THREE.PointLight('#ffb347', 6, 9, 1.6);
      light.position.y = 1.95;
      post.add(light);
      post.position.set(x, H(x, z), z);
      group.add(post);
    }
    // fireflies
    const flies = new THREE.InstancedMesh(new THREE.SphereGeometry(0.03, 8, 6), mats.glow('#d8ff6a', 4), 90);
    const seeds = Array.from({ length: 90 }, () => [rand() * 20 - 10, rand() * 2 + 0.3, rand() * 14 - 10, rand() * 9]);
    const m4 = new THREE.Matrix4();
    movers.push((t) => {
      seeds.forEach(([x, y, z, p], i) => {
        const blink = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2 + p * 3));
        m4.makeScale(blink, blink, blink).setPosition(x + Math.sin(t * 0.4 + p) * 1.2, y + Math.sin(t * 0.7 + p * 2) * 0.4, z + Math.cos(t * 0.35 + p) * 1.2);
        flies.setMatrixAt(i, m4);
      });
      flies.instanceMatrix.needsUpdate = true;
    });
    group.add(flies);
    return {
      group, sky, sunDir, movers, uniforms, env: 'night',
      sun: { color: '#9fb8ff', intensity: 1.3 }, hemi: { sky: '#34508f', ground: '#1a2a24', intensity: 0.6 },
      fog: { color: '#1a2748', near: 25, far: 140 }, exposure: 1.15, bloom: 0.5,
    };
  },

  async bedroom() {
    const rand = rng(63), group = new THREE.Group(), movers = [];
    const W = 11, D = 9, HGT = 3.8;
    const planks = canvasTexture(1024, 1024, (c, w, h) => {
      const colors = ['#c98f5a', '#b97f4d', '#d39b64', '#bf8551'];
      for (let i = 0; i < 16; i++) {
        c.fillStyle = colors[i % 4];
        c.fillRect(0, (i * h) / 16, w, h / 16);
        c.fillStyle = 'rgba(80,45,20,0.35)';
        c.fillRect(0, (i * h) / 16, w, 3);
        c.fillRect(((i * 397) % 7) * (w / 7), (i * h) / 16, 3, h / 16);
      }
    }, { repeat: 3 });
    planks.repeat.set(3, (3 * (D + 14)) / D); // floor runs on past the open front for tall shots
    const floor = mesh(new THREE.PlaneGeometry(W, D + 14), new THREE.MeshStandardMaterial({ map: planks, roughness: 0.55 }), 0, 0, 7, { cast: false });
    floor.rotation.x = -Math.PI / 2;
    group.add(floor);
    const paper = canvasTexture(512, 512, (c, w, h) => {
      c.fillStyle = '#bfe3f2'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#d4eef8';
      for (let i = 0; i < 8; i++) c.fillRect(i * 64, 0, 32, h);
      c.fillStyle = '#ffffff';
      for (let i = 0; i < 24; i++) { c.beginPath(); c.arc((i * 131) % w, (i * 197) % h, 6, 0, 7); c.fill(); }
    }, { repeat: 1 });
    paper.repeat.set(4, 1.5);
    const wallMat = new THREE.MeshStandardMaterial({ map: paper, roughness: 0.9 });
    const back = mesh(new THREE.PlaneGeometry(W, HGT), wallMat, 0, HGT / 2, -D / 2, { cast: false });
    group.add(back);
    for (const s of [-1, 1]) {
      const side = mesh(new THREE.PlaneGeometry(D, HGT), wallMat, s * W / 2, HGT / 2, 0, { cast: false });
      side.rotation.y = -s * Math.PI / 2;
      group.add(side);
    }
    const ceiling = mesh(new THREE.PlaneGeometry(W, D), mats.matte('#fff8ee'), 0, HGT, 0, { cast: false });
    ceiling.rotation.x = Math.PI / 2;
    group.add(ceiling);
    // skirting
    group.add(mesh(new THREE.BoxGeometry(W, 0.15, 0.05), mats.matte('#ffffff'), 0, 0.075, -D / 2 + 0.03));
    // window with a bright sky view
    const view = canvasTexture(512, 512, (c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#6ec3ff'); g.addColorStop(1, '#e7f6ff');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.fillStyle = '#ffffff';
      for (const [x, y, r] of [[120, 150, 50], [170, 140, 60], [220, 160, 45], [360, 250, 40], [400, 240, 55]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
      c.fillStyle = '#7cc36a'; c.fillRect(0, h * 0.8, w, h * 0.2);
    });
    group.add(mesh(new THREE.PlaneGeometry(2.4, 1.8), new THREE.MeshBasicMaterial({ map: view }), -1.8, 2.1, -D / 2 + 0.02, { cast: false }));
    const frame = mats.matte('#ffffff');
    for (const [w, h, x, y] of [[2.6, 0.12, -1.8, 3.0], [2.6, 0.12, -1.8, 1.2], [0.12, 1.9, -3.05, 2.1], [0.12, 1.9, -0.55, 2.1], [0.08, 1.8, -1.8, 2.1], [2.4, 0.08, -1.8, 2.1]]) {
      group.add(mesh(new THREE.BoxGeometry(w, h, 0.1), frame, x, y, -D / 2 + 0.05));
    }
    for (const x of [-3.35, -0.25]) {
      const curtain = mesh(new THREE.CylinderGeometry(0.28, 0.35, 2.6, 16, 1, false, 0, Math.PI), mats.cloth('#ff8fb1'), x, 2.0, -D / 2 + 0.2);
      curtain.rotation.y = Math.PI;
      curtain.scale.z = 0.4;
      group.add(curtain);
    }
    // bed
    const bed = new THREE.Group();
    bed.add(mesh(new THREE.BoxGeometry(2.2, 0.35, 3.2), mats.matte('#e6b07a', 0.6), 0, 0.3, 0));
    bed.add(mesh(new THREE.BoxGeometry(2.2, 1.3, 0.15), mats.matte('#e6b07a', 0.6), 0, 0.65, -1.6));
    const mattress = mesh(new THREE.CapsuleGeometry(0.2, 1.8, 6, 16), mats.cloth('#ffffff'), 0, 0.65, 0);
    mattress.rotation.z = Math.PI / 2;
    mattress.scale.set(1, 1, 7.2);
    bed.add(mattress);
    bed.add(mesh(new THREE.BoxGeometry(2.26, 0.12, 2.0), mats.cloth('#7c9cff'), 0, 0.78, 0.55));
    const pillow = mesh(blob(0.45, 3, 0.05), mats.cloth('#fff4d6'), 0, 0.85, -1.15);
    pillow.scale.set(1.5, 0.35, 0.7);
    bed.add(pillow);
    bed.position.set(3.4, 0, -2.6);
    group.add(bed);
    // rug
    const rug = canvasTexture(512, 512, (c, w, h) => {
      ['#ffd23f', '#ff8fb1', '#7ad3ff', '#b28dff', '#ffffff'].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - i * 45, 0, 7); c.fill(); });
    });
    const rugMesh = mesh(new THREE.CircleGeometry(2.3, 64), new THREE.MeshStandardMaterial({ map: rug, roughness: 1, transparent: true, alphaTest: 0.5 }), 0, 0.01, 0.2, { cast: false });
    rugMesh.rotation.x = -Math.PI / 2;
    group.add(rugMesh);
    // bookshelf
    const shelf = new THREE.Group();
    shelf.add(mesh(new THREE.BoxGeometry(1.6, 2.2, 0.45), mats.matte('#f3e3c7', 0.7), 0, 1.1, 0));
    const bookColors = ['#e53935', '#3f8cff', '#ffd23f', '#43a047', '#8e24aa', '#ff7043'];
    for (let r = 0; r < 3; r++) {
      let x = -0.7;
      while (x < 0.65) {
        const w = 0.07 + rand() * 0.07, h = 0.4 + rand() * 0.18;
        shelf.add(mesh(new THREE.BoxGeometry(w, h, 0.32), mats.cloth(bookColors[Math.floor(rand() * 6)]), x + w / 2, 0.25 + r * 0.68 + h / 2, 0.08));
        x += w + 0.01;
      }
    }
    shelf.position.set(-4.4, 0, -3.9);
    group.add(shelf);
    // toys
    const blockColors = ['#ff5c5c', '#ffd23f', '#3fa7ff', '#43a047'];
    [[-2.6, 1.8], [-2.2, 2.3], [-2.45, 2.0, 0.34]].forEach(([x, z, y = 0.17], i) => {
      const b = mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), mats.glossy(blockColors[i], 0.45), x, y, z);
      b.rotation.y = i * 0.5;
      group.add(b);
    });
    const ball = mesh(sphere(0.25), mats.glossy('#ff5c9a', 0.3), 2.2, 0.25, 2.4);
    group.add(ball);
    // lamp
    const lamp = new THREE.Group();
    lamp.add(mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.06, 20), mats.metal('#dddddd'), 0, 0.03, 0));
    lamp.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.7), mats.metal('#dddddd'), 0, 0.85, 0));
    lamp.add(mesh(new THREE.CylinderGeometry(0.25, 0.4, 0.45, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#fff2c4', emissive: '#ffcf70', emissiveIntensity: 1.2, side: THREE.DoubleSide }), 0, 1.85, 0, { cast: false }));
    const bulb = new THREE.PointLight('#ffcf8a', 8, 12, 1.5);
    bulb.position.y = 1.7;
    bulb.castShadow = false;
    lamp.add(bulb);
    lamp.position.set(-3.2, 0, -3.6);
    group.add(lamp);
    // star mobile / picture frames
    for (const [x, col] of [[1.2, '#ffd23f'], [2.0, '#7ad3ff']]) {
      group.add(mesh(new THREE.BoxGeometry(0.6, 0.5, 0.04), mats.matte('#ffffff'), x, 2.5, -D / 2 + 0.03));
      group.add(mesh(new THREE.PlaneGeometry(0.5, 0.4), mats.matte(col), x, 2.5, -D / 2 + 0.06, { cast: false }));
    }
    return {
      group, sky: null, background: '#2b2233', sunDir: new THREE.Vector3(0.35, 0.75, 0.55).normalize(), movers, env: 'room',
      sun: { color: '#fff1dc', intensity: 1.6 }, hemi: { sky: '#fff5e6', ground: '#b98a60', intensity: 0.8 },
      fog: null, exposure: 1.0, bounds: { minX: -W / 2 + 0.4, maxX: W / 2 - 0.4, maxZ: 12, maxY: HGT - 0.3 },
    };
  },

  async space() {
    const rand = rng(77), group = new THREE.Group(), movers = [];
    const sunDir = dirFrom(-50, 35);
    group.add(stars(4000, 2500, rand, 1.5));
    const H = (x, z) => {
      let h = smoothstep(12, 50, Math.hypot(x, z)) * (fbm(x * 0.03, z * 0.03, 4) * 6 + 3);
      for (const [cx, cz, r] of [[-7, -9, 3], [9, -12, 4], [-15, -3, 5], [6, -5, 1.6], [-3, -18, 6]]) {
        const d = Math.hypot(x - cx, z - cz) / r;
        if (d < 1.3) h += d < 1 ? -(1 - d * d) * r * 0.25 : Math.sin((d - 1) / 0.3 * Math.PI) * r * 0.06;
      }
      return h + smoothstep(4, 8, Math.hypot(x, z)) * fbm(x * 0.4, z * 0.4, 2) * 0.06;
    };
    group.add(terrain({ height: H, color: (h, n) => new THREE.Color('#9a97a3').lerp(new THREE.Color('#c9c5cf'), clamp(n + 0.5, 0, 1)).lerp(new THREE.Color('#6d6a78'), clamp(-h, 0, 1)) }));
    const earthTex = canvasTexture(1024, 512, (c, w, h) => {
      c.fillStyle = '#1e6fd9'; c.fillRect(0, 0, w, h);
      const r = rng(5);
      c.fillStyle = '#3fae4f';
      for (let i = 0; i < 14; i++) { c.beginPath(); c.ellipse(r() * w, h * 0.2 + r() * h * 0.6, 40 + r() * 90, 25 + r() * 60, r() * 3, 0, 7); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,0.8)';
      for (let i = 0; i < 30; i++) { c.beginPath(); c.ellipse(r() * w, r() * h, 30 + r() * 80, 6 + r() * 12, 0, 0, 7); c.fill(); }
    });
    const earth = mesh(new THREE.SphereGeometry(60, 64, 48), new THREE.MeshStandardMaterial({ map: earthTex, roughness: 0.7, emissive: '#0a2a55', emissiveIntensity: 0.4 }), 260, 170, -700, { cast: false, receive: false });
    group.add(earth);
    movers.push((t) => { earth.rotation.y = t * 0.02; });
    const planet = new THREE.Group();
    planet.add(mesh(new THREE.SphereGeometry(90, 64, 48), mats.matte('#ff9d6c', 0.8), 0, 0, 0, { cast: false, receive: false }));
    const ring = mesh(new THREE.RingGeometry(120, 180, 96), new THREE.MeshStandardMaterial({ color: '#ffe0a3', side: THREE.DoubleSide, transparent: true, opacity: 0.8 }), 0, 0, 0, { cast: false, receive: false });
    ring.rotation.x = 1.25;
    planet.add(ring);
    planet.position.set(-420, 260, -1200);
    group.add(planet);
    // rocket
    const rocket = new THREE.Group();
    rocket.add(mesh(new THREE.CylinderGeometry(0.7, 0.8, 3.2, 32), mats.glossy('#f5f5f5', 0.3), 0, 2.2, 0));
    rocket.add(mesh(new THREE.ConeGeometry(0.7, 1.4, 32), mats.glossy('#e53935', 0.3), 0, 4.5, 0));
    rocket.add(mesh(sphere(0.32), mats.glossy('#7ad3ff', 0.05), 0, 2.9, 0.62));
    for (let i = 0; i < 3; i++) {
      const fin = mesh(new THREE.BoxGeometry(0.1, 1.2, 0.9), mats.glossy('#e53935', 0.3), 0, 0.9, 0);
      fin.rotation.y = (i / 3) * Math.PI * 2;
      fin.translateZ(0.85);
      rocket.add(fin);
    }
    rocket.position.set(-5, H(-5, -6), -6);
    rocket.rotation.z = 0.05;
    group.add(rocket);
    return {
      group, sky: null, background: '#03020a', sunDir, movers, env: 'space',
      sun: { color: '#ffffff', intensity: 3.6 }, hemi: { sky: '#6a78b8', ground: '#2a2833', intensity: 0.45 },
      fog: null, exposure: 1.0, bloom: 0.35,
    };
  },
};

builders.pond = async function pond() {
  const rand = rng(91), group = new THREE.Group(), movers = [], uniforms = { uTime: { value: 0 } };
  const sunDir = dirFrom(-30, 40);
  const sky = makeSky(sunDir);
  group.add(sky);
  const P = { x: 0, z: -7.5, rx: 6.5, rz: 3.6 };
  const pd = (x, z) => Math.hypot((x - P.x) / P.rx, (z - P.z) / P.rz);
  const H = (x, z) => hills(x, z) - (1 - smoothstep(0.75, 1.15, pd(x, z))) * 0.7;
  const inPond = (x, z) => pd(x, z) < 1.12;
  group.add(terrain({
    height: H,
    color: (h, n, x, z) => lawn(h, n).lerp(new THREE.Color('#b59a63'), 1 - smoothstep(0.95, 1.25, pd(x, z))),
  }));
  group.add(grass(H, { rand, uniforms, skip: inPond }));
  group.add(flowers(H, rand, 350, 22, ['#ff6fae', '#ffd23f', '#ffffff', '#b28dff'], inPond));
  // water: glossy surface with drifting ripples
  const normals = new THREE.TextureLoader().load('/vendor/waternormals.jpg', (t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); });
  const water = mesh(new THREE.CircleGeometry(1, 96), new THREE.MeshPhysicalMaterial({
    color: '#3f9fc4', roughness: 0.06, metalness: 0.05, normalMap: normals, normalScale: new THREE.Vector2(0.25, 0.25),
    transparent: true, opacity: 0.92, clearcoat: 1,
  }), P.x, -0.28, P.z, { cast: false });
  water.rotation.x = -Math.PI / 2;
  water.scale.set(P.rx * 1.02, P.rz * 1.02, 1);
  group.add(water);
  movers.push((t) => { normals.offset.set(t * 0.012, t * 0.008); });
  // lily pads with flowers, and a frog
  const pad = mats.fur('#4caf50');
  const pads = [];
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2, r = 0.2 + rand() * 0.7;
    const x = P.x + Math.cos(a) * r * P.rx, z = P.z + Math.sin(a) * r * P.rz;
    const m = mesh(new THREE.CircleGeometry(0.28 + rand() * 0.2, 24, 0.3, Math.PI * 1.8), pad, x, -0.26, z, { cast: false });
    m.rotation.set(-Math.PI / 2, 0, rand() * 6.28);
    group.add(m);
    pads.push([x, z]);
    if (i % 3 === 0) group.add(mesh(sphere(0.07, 12, 8), mats.fur(i % 2 ? '#ff8fc8' : '#ffffff'), x + 0.05, -0.2, z));
  }
  const frog = new THREE.Group();
  const green = mats.glossy('#58b83f', 0.4);
  const fb = mesh(sphere(0.14), green, 0, 0.1, 0);
  fb.scale.set(1.1, 0.75, 1);
  frog.add(fb);
  for (const s of [-1, 1]) {
    frog.add(mesh(sphere(0.05), green, s * 0.07, 0.2, 0.06));
    frog.add(mesh(sphere(0.028, 10, 8), mats.glossy('#111111', 0.1), s * 0.07, 0.22, 0.1, { cast: false }));
  }
  frog.position.set(pads[0][0], -0.27, pads[0][1]);
  group.add(frog);
  movers.push((t) => { const k = (t % 4) / 4; frog.position.y = -0.27 + (k > 0.85 ? Math.sin((k - 0.85) / 0.15 * Math.PI) * 0.25 : 0); });
  // reeds / cattails at the sides of the pond
  const reed = mats.fur('#5f8f3a'), cat = mats.matte('#6b4226');
  for (let i = 0; i < 70; i++) {
    const side = rand() > 0.5 ? 1 : -1, a = (side > 0 ? 0 : Math.PI) + (rand() - 0.5) * 1.6;
    const x = P.x + Math.cos(a) * P.rx * (0.95 + rand() * 0.15), z = P.z + Math.sin(a) * P.rz * (0.95 + rand() * 0.15);
    const h = 0.6 + rand() * 0.7;
    const stem = mesh(new THREE.CylinderGeometry(0.012, 0.018, h, 5), reed, x, H(x, z) + h / 2, z);
    stem.rotation.set((rand() - 0.5) * 0.2, 0, (rand() - 0.5) * 0.2);
    group.add(stem);
    if (i % 3 === 0) group.add(mesh(capsule(0.03, 0.12, 8), cat, x, H(x, z) + h + 0.02, z));
  }
  for (let i = 0; i < 12; i++) {
    const a = rand() * Math.PI * 2, r = rock(rand, '#9a9aa0');
    const x = P.x + Math.cos(a) * P.rx * 1.1, z = P.z + Math.sin(a) * P.rz * 1.12;
    if (z > -4.2 && Math.abs(x) < 3) continue;
    r.scale.multiplyScalar(0.5);
    r.position.set(x, H(x, z), z);
    group.add(r);
  }
  // ducks paddling around
  for (let i = 0; i < 3; i++) {
    const d = duck(rand), ph = rand() * 6, sp = 0.12 + rand() * 0.08, rr = 0.35 + i * 0.18;
    group.add(d);
    movers.push((t) => {
      const a = ph + t * sp;
      d.position.set(P.x + Math.cos(a) * P.rx * rr, -0.3 + Math.sin(t * 2 + ph) * 0.01, P.z + Math.sin(a) * P.rz * rr);
      d.rotation.y = -a;
    });
  }
  const b = bench();
  b.position.set(-8.5, H(-8.5, -3), -3);
  b.rotation.y = 0.9;
  group.add(b);
  scatterTrees(group, rand, H, 26, (x, z) => pd(x, z) < 1.6);
  addClouds(group, rand, movers);
  await birds(group, movers, 'Stork', 2, rand);
  return sunnyWorld(group, sky, sunDir, movers, uniforms);
};

builders.house = async function house() {
  const rand = rng(103), group = new THREE.Group(), movers = [], uniforms = { uTime: { value: 0 } };
  const sunDir = dirFrom(-40, 42);
  const sky = makeSky(sunDir);
  group.add(sky);
  const flat = hills;
  const onPath = (x, z) => Math.abs(x) < 0.9 && z < -2 && z > -9;
  group.add(terrain({ height: flat, color: (h, n, x, z) => lawn(h, n) }));
  group.add(grass(flat, { rand, uniforms, skip: (x, z) => onPath(x, z) || (Math.abs(x) < 3.4 && z < -7.5) }));
  // the house
  const home = cottage();
  home.scale.setScalar(1.6);
  home.position.set(0, 0, -11);
  group.add(home);
  // porch step, door knob and a round window
  group.add(mesh(new THREE.BoxGeometry(2, 0.18, 0.8), mats.matte('#c9b8a0'), 0, 0.09, -7.9));
  group.add(mesh(sphere(0.07), mats.metal('#ffd23f', 0.3), 0.4, 1.2, -8.1));
  // stepping-stone path to the stage
  for (let z = -7.3, i = 0; z < -1.8; z += 0.75, i++) {
    const st = mesh(new THREE.CylinderGeometry(0.42, 0.45, 0.06, 20), mats.matte('#bdb6a8', 0.9), (i % 2 ? 0.15 : -0.15), 0.02, z);
    st.scale.z = 0.75;
    group.add(st);
  }
  // white picket fence with a gate gap, flower beds along it
  const V = (x, z) => new THREE.Vector3(x, 0, z);
  group.add(picketFence(V(-9, -5.2), V(-1.4, -5.2)), picketFence(V(1.4, -5.2), V(9, -5.2)));
  group.add(picketFence(V(-9, -5.2), V(-9, -14)), picketFence(V(9, -5.2), V(9, -14)));
  group.add(flowers(flat, rand, 300, 12, ['#ff5c9a', '#ffd23f', '#ffffff', '#ff8a4c', '#b28dff'], (x, z) => !(z < -5.5 && z > -7 && Math.abs(x) > 1.5 && Math.abs(x) < 8.5)));
  for (const x of [-7.5, -4.5, 4.5, 7.5]) { const b = bush(rand); b.position.set(x, 0.25, -9.4); group.add(b); }
  // mailbox by the gate
  const mail = new THREE.Group();
  mail.add(mesh(new THREE.BoxGeometry(0.08, 1.1, 0.08), mats.matte('#8b5a2b'), 0, 0.55, 0));
  const box = mesh(new THREE.CapsuleGeometry(0.16, 0.3, 6, 16), mats.glossy('#3f8cff', 0.3), 0, 1.2, 0);
  box.rotation.x = Math.PI / 2;
  mail.add(box);
  mail.add(mesh(new THREE.BoxGeometry(0.03, 0.2, 0.12), mats.glossy('#e53935', 0.3), 0.17, 1.3, -0.05));
  mail.position.set(2.1, 0, -4.7);
  group.add(mail);
  // doghouse and a ball on the lawn
  const dog = new THREE.Group();
  dog.add(mesh(new THREE.BoxGeometry(1.1, 0.8, 1.1), mats.matte('#e6b07a'), 0, 0.4, 0));
  const roofShape = new THREE.Shape([new THREE.Vector2(-0.7, 0), new THREE.Vector2(0.7, 0), new THREE.Vector2(0, 0.55)]);
  dog.add(mesh(new THREE.ExtrudeGeometry(roofShape, { depth: 1.3, bevelEnabled: false }), mats.matte('#3f8cff', 0.7), 0, 0.8, -0.65));
  dog.add(mesh(new THREE.CircleGeometry(0.25, 24, 0, Math.PI), mats.matte('#2b1a10'), 0, 0.2, 0.56, { cast: false }));
  dog.position.set(6.5, 0, -3.2);
  dog.rotation.y = -0.5;
  group.add(dog);
  // a big tree on the side
  const tree = roundTree(rand);
  tree.scale.setScalar(1.5);
  tree.position.set(-6.5, 0, -3.5);
  group.add(tree);
  scatterTrees(group, rand, flat, 26, (x, z) => Math.abs(x) < 10 && z < -4);
  addClouds(group, rand, movers);
  await birds(group, movers, 'Parrot', 2, rand);
  return sunnyWorld(group, sky, sunDir, movers, uniforms);
};

builders.playground = async function playground() {
  const rand = rng(117), group = new THREE.Group(), movers = [], uniforms = { uTime: { value: 0 } };
  const sunDir = dirFrom(-30, 45);
  const sky = makeSky(sunDir);
  group.add(sky);
  const inPlay = (x, z) => Math.hypot(x / 11, (z + 3) / 7.5) < 1;
  group.add(terrain({ height: hills, color: (h, n, x, z) => (inPlay(x, z) ? new THREE.Color('#e9cf98').lerp(new THREE.Color('#dcbd82'), clamp(n + 0.5, 0, 1)) : lawn(h, n)) }));
  group.add(grass(hills, { rand, uniforms, skip: (x, z) => Math.hypot(x / 11.5, (z + 3) / 8) < 1 }));
  // swings (two sets) swaying on their own
  for (const [x, z, ph] of [[-5.5, -6, 0], [-2.2, -7.5, 1.7]]) {
    const sw = buildSwing();
    sw.scale.setScalar(1.25);
    sw.position.set(x, 0, z);
    group.add(sw);
    movers.push((t) => { sw.userData.pivot.rotation.x = Math.sin(t * 1.4 + ph) * 0.25; });
  }
  const sl = buildSlide();
  sl.scale.setScalar(1.3);
  sl.position.set(6, 0, -5.5);
  sl.rotation.y = -0.5;
  group.add(sl);
  // seesaw
  const see = new THREE.Group();
  see.add(mesh(new THREE.ConeGeometry(0.25, 0.5, 4), mats.metal('#ffd23f', 0.4), 0, 0.25, 0));
  const plank = new THREE.Group();
  plank.position.y = 0.5;
  plank.add(mesh(new THREE.BoxGeometry(3.2, 0.08, 0.3), mats.glossy('#43a047', 0.4)));
  for (const sx of [-1.4, 1.4]) plank.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4), mats.metal('#e53935'), sx, 0.15, 0).rotateX(Math.PI / 2));
  see.add(plank);
  see.position.set(7.8, 0, -0.5);
  see.rotation.y = 1.2;
  group.add(see);
  movers.push((t) => { plank.rotation.z = Math.sin(t * 1.1) * 0.18; });
  // merry-go-round
  const mgr = new THREE.Group();
  mgr.add(mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.12, 40), mats.glossy('#ff5c9a', 0.35), 0, 0.3, 0));
  mgr.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1), mats.metal('#ffffff', 0.3), 0, 0.85, 0));
  for (let i = 0; i < 4; i++) {
    const bar = mesh(new THREE.TorusGeometry(0.5, 0.03, 8, 24, Math.PI), mats.metal('#ffd23f', 0.3), 0, 0.36, 0);
    bar.rotation.y = (i / 4) * Math.PI * 2;
    bar.translateZ(0.7);
    mgr.add(bar);
  }
  mgr.position.set(1.8, 0, -9.5);
  group.add(mgr);
  movers.push((t) => { mgr.rotation.y = t * 0.4; });
  // sandbox with a bucket
  const sb = new THREE.Group();
  const wood = mats.matte('#b98b5e');
  for (const [w, d, x, z] of [[2.4, 0.12, 0, -1.1], [2.4, 0.12, 0, 1.1], [0.12, 2.3, -1.15, 0], [0.12, 2.3, 1.15, 0]]) sb.add(mesh(new THREE.BoxGeometry(w, 0.25, d), wood, x, 0.12, z));
  sb.add(mesh(new THREE.BoxGeometry(2.2, 0.1, 2.1), mats.matte('#f0d9a4'), 0, 0.05, 0));
  sb.add(mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.25, 16), mats.glossy('#3fa7ff', 0.3), 0.4, 0.22, 0.2));
  sb.position.set(-8.5, 0, -1.5);
  group.add(sb);
  for (const [x, z, r] of [[-10.5, -8, 0.6], [10.5, -8, -0.6]]) { const b = bench(); b.position.set(x, hills(x, z), z); b.rotation.y = r; group.add(b); }
  group.add(fence(new THREE.Vector3(-13, 0, -12), new THREE.Vector3(13, 0, -12), 24));
  scatterTrees(group, rand, hills, 30, (x, z) => Math.hypot(x / 13, (z + 3) / 10) < 1);
  addClouds(group, rand, movers);
  await birds(group, movers, 'Parrot', 3, rand);
  return sunnyWorld(group, sky, sunDir, movers, uniforms);
};

Object.assign(builders, PLACE_BUILDERS);

const worldCache = new Map();
export function loadWorld(name) {
  const key = builders[name] ? name : 'meadow';
  if (!worldCache.has(key)) worldCache.set(key, builders[key]().then((w) => {
    w.name = key;
    w.update = (t) => { if (w.uniforms) w.uniforms.uTime.value = t; for (const m of w.movers) m(t); };
    return w;
  }));
  return worldCache.get(key);
}
