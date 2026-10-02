// Live 3D turntable of one character for the Characters tab: drag to spin, try actions and
// faces, and it lip-syncs while "Hear voice" plays.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createCharacter, faceParams } from './engine/characters.js';
import { talkAt } from './engine/audio.js';
import { disposeTree } from './engine/util.js';

export class CharacterPreview {
  constructor(canvas) {
    this.canvas = canvas;
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }));
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.setPixelRatio(Math.min(devicePixelRatio, 2));

    this.scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(r);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(r), 0.04).texture;
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);

    const key = new THREE.DirectionalLight('#fff4e6', 2.2);
    key.position.set(2, 4, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -1.5, right: 1.5, top: 2, bottom: -1, near: 0.5, far: 12 });
    key.shadow.bias = -0.0005;
    const rim = new THREE.DirectionalLight('#bcd8ff', 1.2);
    rim.position.set(-3, 2.5, -3);
    this.scene.add(key, rim, new THREE.HemisphereLight('#ffffff', '#b9a58f', 0.6));

    const floor = new THREE.Mesh(new THREE.CircleGeometry(0.9, 48), new THREE.ShadowMaterial({ opacity: 0.25 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    this.turn = new THREE.Group();
    this.scene.add(this.turn);
    this.yaw = 0.35;
    this.spin = 0; // drag momentum
    this.zoom = 1;
    this.action = 'idle';
    this.mood = 'happy';
    this.char = null;
    this.sig = '';
    this.token = 0;
    this.t0 = performance.now();
    this.voice = null; // { item, start }
    this.bindInput();
    requestAnimationFrame(() => this.frame());
  }

  bindInput() {
    const c = this.canvas;
    let lastX = null;
    c.addEventListener('pointerdown', (e) => { lastX = e.clientX; this.spin = 0; c.setPointerCapture(e.pointerId); });
    c.addEventListener('pointermove', (e) => {
      if (lastX === null) return;
      const dx = (e.clientX - lastX) * 0.012;
      this.yaw += dx;
      this.spin = dx;
      lastX = e.clientX;
    });
    const end = () => { lastX = null; };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoom = Math.min(1.6, Math.max(0.45, this.zoom * (e.deltaY > 0 ? 1.08 : 0.93)));
    }, { passive: false });
    c.addEventListener('dblclick', () => { this.yaw = 0.35; this.spin = 0; this.zoom = 1; });
  }

  /** Show this cast member; rebuilds the model only when its look changed. */
  async show(cast) {
    if (!cast) return;
    const sig = JSON.stringify([cast.id, cast.type, cast.color, cast.accent, cast.hair, cast.eyes, cast.outfit]);
    if (sig === this.sig) return;
    this.sig = sig;
    const token = ++this.token;
    const sameCast = this.char?.cast.id === cast.id;
    const char = await createCharacter(structuredClone(cast));
    if (token !== this.token) { disposeTree(char.root); return; }
    if (this.char) { this.turn.remove(this.char.root); disposeTree(this.char.root); }
    char.equip(this.action, cast.type === 'narrator' ? 'sitar' : 'none');
    char.root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    this.char = char;
    this.turn.add(char.root);
    if (!sameCast) { this.voice = null; this.restart(); }
  }

  setAction(action) {
    this.action = action;
    this.char?.equip(action, this.char.cast.type === 'narrator' ? 'sitar' : 'none');
    this.restart();
  }
  setMood(mood) { this.mood = mood; }
  restart() { this.t0 = performance.now(); }

  /** Lip-sync to a loaded voice item that just started playing. */
  speak(item) { this.voice = { item, start: performance.now() }; }

  resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return false;
    const c = this.renderer.domElement;
    const pr = this.renderer.getPixelRatio();
    if (c.width !== Math.round(w * pr) || c.height !== Math.round(h * pr)) {
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    return true;
  }

  frame() {
    requestAnimationFrame(() => this.frame());
    // skip work while the Characters tab is hidden
    if (this.paused || !this.char || !this.canvas.offsetParent || !this.resize()) return;
    const now = performance.now();
    const t = (now - this.t0) / 1000;

    this.yaw += this.spin;
    this.spin *= 0.92;
    this.turn.rotation.y = this.yaw;

    const hgt = this.char.height;
    const dist = (hgt * 2.7 + 0.6) * this.zoom;
    const lookY = hgt * (this.zoom < 0.8 ? 0.72 : 0.5);
    this.camera.position.set(0, lookY + 0.25, dist);
    this.camera.lookAt(0, lookY, 0);

    let talk = 0, speaking = false;
    if (this.voice) {
      const vt = (now - this.voice.start) / 1000;
      if (vt > this.voice.item.duration) this.voice = null;
      else { talk = talkAt(this.voice.item, vt); speaking = true; }
    }
    const face = faceParams(this.mood, this.mood, 1);
    const lookAt = this.camera.position.clone();
    this.char.update({ t, action: this.action, actionStart: 0, walking: null, lookAt, face, talk, speaking });
    this.renderer.render(this.scene, this.camera);
  }
}
