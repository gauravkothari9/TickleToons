// Stage: turns a story + timeline into frames. render(T) is deterministic for any time T.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { createCharacter, faceParams } from './characters.js';
import { loadWorld } from './worlds.js';
import { groundProp } from './props.js';
import { talkAt, displayText } from './audio.js';
import { gestureWindows } from './gestures.js';
import { clamp, lerp, smoothstep, easeInOut, wobble, disposeTree } from './util.js';
import { computeTimeline, travelTime, offstageX, WALK_SPEED, RUN_SPEED, FORMATS } from '../story.js';

const ACTION_MOOD = {
  laugh: 'laugh', sad: 'sad', think: 'thinking', cheer: 'excited', sitar: 'calm', cry: 'sad', sick: 'sad', stomp: 'angry',
  sleep: 'calm', namaste: 'calm', study: 'thinking', sing: 'happy', jumprope: 'excited', firststeps: 'excited', bicycle: 'excited',
};
const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3();

// Film look per kind of place: S-curve contrast, saturation, warm-highlight / cool-shadow split
// tone and vignette. Rooms get more contrast so bright pastel interiors don't look washed out.
const GRADES = {
  sky: { contrast: 0.22, saturation: 1.12, tone: 1, vignette: 0.24 },
  room: { contrast: 0.34, saturation: 1.16, tone: 1, vignette: 0.3 },
  night: { contrast: 0.18, saturation: 1.08, tone: 0.6, vignette: 0.38 },
  space: { contrast: 0.2, saturation: 1.1, tone: 0.5, vignette: 0.32 },
};
// Rim (back) light that outlines the characters, and how strong it is per kind of place.
const RIMS = { sky: ['#fff1d6', 1.7], room: ['#ffe6c4', 1.5], night: ['#9fc2ff', 2.4], space: ['#cfd8ff', 2.0] };

// Time of day on top of the place's own light: sun colour and strength, sky fill, exposure and a
// colour wash in the grade. 'auto' leaves the place as it is. Indoors the change is gentler (lamps are on).
const TIME_LOOKS = {
  morning: { sun: '#ffe2b8', sunK: 0.9, hemiK: 0.95, exposure: 1.0, tint: [1.0, 0.93, 0.78], tintK: 0.12 },
  afternoon: { sun: '#fff4e0', sunK: 1.1, hemiK: 1.0, exposure: 1.03, tint: [1.0, 0.97, 0.88], tintK: 0.03 },
  evening: { sun: '#ff7a30', sunK: 0.8, hemiK: 0.6, exposure: 0.85, tint: [1.0, 0.55, 0.28], tintK: 0.45 },
  night: { sun: '#7f98ff', sunK: 0.3, hemiK: 0.3, exposure: 0.55, tint: [0.3, 0.42, 1.0], tintK: 0.55 },
};

// how much of the time-of-day change shows indoors: lamps keep a room bright, but night still has to read as night
const ROOM_SOFT = { morning: 0.5, afternoon: 0.5, evening: 0.65, night: 0.85 };

const GradeShader = {
  uniforms: { tDiffuse: { value: null }, contrast: { value: 0.25 }, saturation: { value: 1.1 }, tone: { value: 1 }, vignette: { value: 0.25 }, aspect: { value: 16 / 9 },
    tint: { value: new THREE.Vector3(1, 1, 1) }, tintK: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float contrast, saturation, tone, vignette, aspect, tintK; uniform vec3 tint; varying vec2 vUv;
    void main(){
      vec3 c = texture2D(tDiffuse, vUv).rgb;
      c = mix(c, c * c * (3.0 - 2.0 * c), contrast);                       // filmic S-curve
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(vec3(l), c, saturation);
      c += tone * (vec3(0.035, 0.012, -0.03) * smoothstep(0.5, 1.0, l)     // warm highlights
                 + vec3(-0.02, 0.0, 0.03) * (1.0 - smoothstep(0.0, 0.4, l))); // cool shadows
      c = mix(c, c * tint * 1.15, tintK);                                  // time-of-day colour wash
      vec2 d = (vUv - 0.5) * vec2(aspect > 1.0 ? aspect : 1.0, aspect > 1.0 ? 1.0 : 1.0 / aspect);
      c *= 1.0 - vignette * smoothstep(0.45, 1.15, length(d) * 1.25);
      gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
    }`,
};

export class Stage {
  constructor(outCanvas) {
    this.out = outCanvas;
    this.ctx2d = outCanvas.getContext('2d');
    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }));
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.05, 6000);
    this.sun = new THREE.DirectionalLight('#ffffff', 3);
    this.sun.castShadow = true;
    Object.assign(this.sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 80 });
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.02;
    this.hemi = new THREE.HemisphereLight('#ffffff', '#666666', 1);
    // Pixar-style key / fill / rim: the rim sits behind the characters (opposite the camera) and
    // traces their outline; the soft fill comes from beside the camera and puts a sparkle in the eyes.
    this.rim = new THREE.DirectionalLight('#fff1d6', 1.6);
    this.fill = new THREE.DirectionalLight('#dce8ff', 0.35);
    this.scene.add(this.sun, this.sun.target, this.hemi, this.rim, this.rim.target, this.fill, this.fill.target);
    this.pmrem = new THREE.PMREMGenerator(r);
    this.envCache = new Map();
    this.characters = new Map();
    this.quality = { scale: 0.5, effects: true };
    this.size = [0, 0];
    this.token = 0;
  }

  setQuality(q) {
    const shadow = q.scale >= 0.99 ? 4096 : 2048;
    if (this.sun.shadow.mapSize.x !== shadow) {
      this.sun.shadow.mapSize.set(shadow, shadow);
      this.sun.shadow.map?.dispose();
      this.sun.shadow.map = null;
    }
    this.quality = { ...this.quality, ...q };
    this.resize();
  }

  resize() {
    const [W, H] = FORMATS[this.story?.aspect || '16:9'];
    const w = Math.round(W * this.quality.scale), h = Math.round(H * this.quality.scale);
    if (w === this.size[0] && h === this.size[1]) return;
    this.size = [w, h];
    this.out.width = w;
    this.out.height = h;
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.buildComposer();
  }

  buildComposer() {
    const [w, h] = this.size;
    if (this.composer) {
      this.composer.passes.forEach((p) => p.dispose?.());
      this.composer.dispose();
    }
    const c = (this.composer = new EffectComposer(this.renderer));
    c.setPixelRatio(1);
    c.setSize(w, h);
    c.addPass(new RenderPass(this.scene, this.camera));
    this.gtao = new GTAOPass(this.scene, this.camera, w, h);
    this.gtao.blendIntensity = 0.85;
    this.gtao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.5, thickness: 1, scale: 1 });
    c.addPass(this.gtao);
    this.bokeh = new BokehPass(this.scene, this.camera, { focus: 6, aperture: 0.0002, maxblur: 0.008 });
    c.addPass(this.bokeh);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.2, 0.55, 0.9);
    c.addPass(this.bloom);
    c.addPass(new OutputPass());
    this.grade = new ShaderPass(GradeShader);
    this.grade.uniforms.aspect.value = w / h;
    c.addPass(this.grade);
    this.applyGrade();
  }

  /** Build characters/worlds for a story. Returns false if a newer load replaced this one. */
  async load(story, voices) {
    const token = ++this.token;
    this.story = story;
    this.voices = voices;
    const needed = new Set(story.shots.flatMap((s) => s.actors.map((a) => a.castId)));
    const next = new Map();
    for (const cast of story.cast) {
      if (!needed.has(cast.id)) continue;
      const sig = JSON.stringify([cast.type, cast.color, cast.accent, cast.hair, cast.eyes, cast.outfit]);
      const old = this.characters.get(cast.id);
      if (old && old.sig === sig) { old.char.cast = cast; next.set(cast.id, old); continue; }
      next.set(cast.id, { char: await createCharacter(cast), sig });
    }
    const worlds = {};
    for (const name of new Set(story.shots.map((s) => s.world))) worlds[name] = await loadWorld(name);
    if (token !== this.token) return false;

    for (const [id, c] of this.characters) {
      if (next.get(id) !== c) { this.scene.remove(c.char.root); disposeTree(c.char.root); }
    }
    for (const c of next.values()) { c.char.root.visible = false; this.scene.add(c.char.root); }
    this.characters = next;
    this.worlds = worlds;
    this.shotsRt?.forEach((s) => { this.scene.remove(s.props); disposeTree(s.props); });
    this.timeline = computeTimeline(story, voices);
    this.shotsRt = this.timeline.shots.map((ts) => this.buildShot(ts));
    this.activeShot = null;
    this.resize();
    return true;
  }

  buildShot(ts) {
    const actors = ts.shot.actors.map((a) => {
      const others = ts.shot.actors.filter((o) => o !== a);
      let yaw = 0;
      if (others.length) {
        const dx = others.reduce((s, o) => s + o.x, 0) / others.length - a.x;
        const dz = others.reduce((s, o) => s + o.z, 0) / others.length - a.z;
        const len = Math.hypot(dx, dz) || 1;
        yaw = Math.atan2((dx / len) * 0.75, (dz / len) * 0.75 + 0.9);
      }
      const base = ACTION_MOOD[a.action] || a.mood;
      const events = [{ t: -1, e: base }];
      for (const l of ts.lines) if (l.castId === a.castId) events.push({ t: l.localStart - 0.1, e: l.emotion }, { t: l.localEnd + 0.25, e: base });
      events.sort((p, q) => p.t - q.t);
      // what the words ask the body to do (a wave on "bye", a nod on "yes"), only while they are said
      const gestures = ts.lines.filter((l) => l.castId === a.castId).flatMap((l) => gestureWindows(l, l.localStart, l.localEnd));
      return {
        a, yaw, events, gestures, char: this.characters.get(a.castId).char,
        enterDur: travelTime(a, 'enter'), exitDur: travelTime(a, 'exit'),
        seed: [...a.castId].reduce((s, ch) => s + ch.charCodeAt(0), 0),
      };
    });
    const props = new THREE.Group();
    for (const p of ts.shot.props) {
      const g = groundProp(p.kind);
      if (g) { g.position.set(p.x, 0, p.z); props.add(g); }
    }
    const xs = ts.shot.actors.map((a) => a.x), zs = ts.shot.actors.map((a) => a.z);
    const center = new THREE.Vector3(xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : 0, 0, zs.length ? zs.reduce((s, z) => s + z, 0) / zs.length : 0);
    const span = xs.length ? Math.max(...xs) - Math.min(...xs) : 0;
    return { ...ts, actors, props, center, span, cuts: this.planCuts(ts) };
  }

  planCuts(ts) {
    const cuts = [{ t: 0, mode: 'wide' }];
    if (!ts.lines.length) return cuts;
    const solo = ts.shot.actors.length < 2;
    const establish = ts.index === 0 && this.story.titleCard ? 3.6 : 1.8;
    const onMark = (id) => {
      const a = ts.shot.actors.find((x) => x.castId === id);
      return a ? [travelTime(a, 'enter'), ts.duration - travelTime(a, 'exit')] : [0, ts.duration];
    };
    let prev = null;
    for (const l of ts.lines) {
      if (l.castId === prev) continue;
      const [arrive, leave] = onMark(l.castId);
      if (l.localEnd < arrive + 0.5 || l.localStart > leave - 0.5) continue; // stays on the wide shot
      const t = Math.max(l.localStart - 0.15, arrive + 0.3, cuts.length === 1 ? establish : 0);
      if (t - cuts[cuts.length - 1].t < 0.9) cuts[cuts.length - 1] = { t: cuts[cuts.length - 1].t, mode: solo ? 'medium' : 'close', target: l.castId };
      else cuts.push({ t, mode: solo ? 'medium' : 'close', target: l.castId });
      prev = l.castId;
    }
    const last = ts.lines[ts.lines.length - 1];
    if (ts.duration - (last.localEnd + 0.4) > 1.0) cuts.push({ t: last.localEnd + 0.4, mode: 'wide' });
    return cuts;
  }

  envFor(world) {
    if (this.envCache.has(world.name)) return this.envCache.get(world.name);
    // soft gradient "studio sky" for image-based light: controlled brightness, no washed-out look
    const presets = {
      sky: ['#5f9fe8', '#d8ecff', '#6d8f55', 0.9],
      night: ['#1d2c66', '#3a4a80', '#101a18', 0.8],
      space: ['#1a2040', '#2a2a44', '#141418', 0.7],
      // indoors: a soft warm bounce, dimmer than the old studio box so the key light can model the forms
      room: ['#fff4e6', '#f3dcc4', '#a07850', 0.75],
    };
    const [top, horizon, ground, k] = world.envColors || presets[world.env] || presets.sky;
    const s = new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: { top: { value: new THREE.Color(top) }, horizon: { value: new THREE.Color(horizon) }, ground: { value: new THREE.Color(ground) }, k: { value: k } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform vec3 top; uniform vec3 horizon; uniform vec3 ground; uniform float k; varying vec3 vP;
        void main(){ float y = vP.y; vec3 c = y > 0.0 ? mix(horizon, top, pow(y, 0.6)) : mix(horizon, ground, pow(-y, 0.35)); gl_FragColor = vec4(c * k, 1.0); }`,
    })));
    const tex = this.pmrem.fromScene(s, 0.02).texture;
    this.envCache.set(world.name, tex);
    return tex;
  }

  activate(rt) {
    const world = this.worlds[rt.shot.world];
    const time = rt.shot.time || 'auto';
    if (world !== this.worldActive || time !== this.timeActive) {
      if (this.worldActive) this.scene.remove(this.worldActive.group);
      this.scene.add(world.group);
      // indoors: stronger key, much less flat ambient, a touch less exposure; otherwise rooms wash out
      const room = world.env === 'room';
      // time of day on top; indoors the lamps are on, so it changes less (except at night)
      const look = TIME_LOOKS[time], soft = room ? ROOM_SOFT[time] ?? 0.5 : 1, by = (k) => (look ? 1 + (k - 1) * soft : 1);
      this.sun.color.set(world.sun.color);
      if (look) this.sun.color.lerp(new THREE.Color(look.sun), 0.75 * soft);
      this.sun.intensity = world.sun.intensity * (room ? 1.4 : 1) * by(look?.sunK);
      this.hemi.color.set(world.hemi.sky);
      this.hemi.groundColor.set(world.hemi.ground);
      this.hemi.intensity = world.hemi.intensity * (room ? 0.45 : 1) * by(look?.hemiK);
      this.scene.fog = world.fog ? new THREE.Fog(world.fog.color, world.fog.near, world.fog.far) : null;
      this.scene.background = world.background ? new THREE.Color(world.background) : null;
      this.scene.environment = this.envFor(world);
      this.renderer.toneMappingExposure = (world.exposure ?? 1) * (room ? 0.82 : 1) * by(look?.exposure);
      // only real highlights glow (lamps, sparkles, stars at night), not every bright wall
      if (this.bloom) this.bloom.threshold = world.bloomThreshold ?? (['night', 'space'].includes(world.env) ? 0.9 : 1.5);
      const [rimColor, rimK] = world.rim || RIMS[world.env] || RIMS.sky;
      this.rim.color.set(rimColor);
      this.rim.intensity = rimK;
      this.worldActive = world;
      this.timeActive = time;
      this.applyGrade();
    }
    for (const c of this.characters.values()) c.char.root.visible = false;
    for (const ra of rt.actors) { ra.char.root.visible = true; ra.char.equip(ra.a.action, ra.a.holds); }
    if (this.activeShot) this.scene.remove(this.activeShot.props);
    this.scene.add(rt.props);
    this.activeShot = rt;
  }

  applyGrade() {
    if (!this.grade) return;
    const world = this.worldActive;
    const g = { ...(GRADES[world?.env] || GRADES.sky), ...(world?.grade || {}) };
    for (const k of ['contrast', 'saturation', 'tone', 'vignette']) this.grade.uniforms[k].value = g[k];
    const look = TIME_LOOKS[this.timeActive];
    this.grade.uniforms.tint.value.set(...(look ? look.tint : [1, 1, 1]));
    this.grade.uniforms.tintK.value = look ? look.tintK * (world?.env === 'room' ? ROOM_SOFT[this.timeActive] + 0.1 : 1) : 0;
  }

  shotAt(T) {
    const shots = this.shotsRt || [];
    return shots.find((s) => T >= s.start && T < s.end) || shots[shots.length - 1];
  }

  render(T) {
    if (!this.shotsRt?.length) return;
    const total = this.timeline.total;
    T = clamp(T, 0, total - 1e-4);
    const rt = this.shotAt(T);
    if (rt !== this.activeShot) this.activate(rt);
    const lt = T - rt.start;
    this.worldActive.update(T);
    const line = rt.lines.find((l) => lt >= l.localStart && lt <= l.localEnd) || null;

    // 1) place everyone, 2) camera (eye lines need it), 3) animate
    for (const ra of rt.actors) this.placeActor(ra, rt, lt);
    const shotCam = this.placeCamera(rt, lt, line);
    const focus = shotCam.focus, aperture = shotCam.aperture;
    for (const ra of rt.actors) this.animateActor(ra, rt, lt, line);
    this.sun.position.copy(rt.center).addScaledVector(this.worldActive.sunDir, 30);
    this.sun.target.position.copy(rt.center);
    // rim from behind the subject, a little to the side and above; fill from just left of camera
    const aim = shotCam.target || rt.center;
    v3.subVectors(aim, this.camera.position).setY(0).normalize();
    this.rim.position.set(aim.x + v3.x * 8 - v3.z * 3, 6, aim.z + v3.z * 8 + v3.x * 3);
    this.rim.target.position.copy(aim);
    this.fill.position.copy(this.camera.position).add(v1.set(-v3.z * 2, 1.5, v3.x * 2));
    this.fill.target.position.copy(aim);

    if (this.quality.effects) {
      this.bokeh.uniforms.focus.value = focus;
      this.bokeh.uniforms.aperture.value = aperture;
      this.bloom.strength = this.worldActive.bloom ?? 0.18;
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
    const [w, h] = this.size;
    this.ctx2d.drawImage(this.renderer.domElement, 0, 0, w, h);
    this.drawOverlays(T, rt, lt, line);
  }

  placeActor(ra, rt, lt) {
    const { a, char } = ra;
    let x = a.x, yaw = ra.yaw, walking = null;
    const walkState = (mode, from, to, k) => {
      const speed = mode.startsWith('run') ? RUN_SPEED : WALK_SPEED;
      const px = lerp(from, to, k);
      return { px, walking: { phase: (Math.abs(px - from) / (speed > 2 ? 0.9 : 0.42)) * Math.PI, speed }, yaw: Math.sign(to - from || 1) * 1.25 };
    };
    const exitStart = rt.duration - ra.exitDur;
    if (ra.enterDur && lt < ra.enterDur) {
      const from = offstageX(a, a.enter);
      const s = walkState(a.enter, from, a.x, lt / ra.enterDur);
      ({ px: x, walking, yaw } = s);
    } else if (ra.exitDur && lt > exitStart) {
      const to = offstageX(a, a.exit);
      const s = walkState(a.exit, a.x, to, (lt - exitStart) / ra.exitDur);
      ({ px: x, walking, yaw } = s);
    } else if (ra.enterDur && lt < ra.enterDur + 0.45) {
      const from = offstageX(a, a.enter);
      yaw = lerp(Math.sign(a.x - from || 1) * 1.25, ra.yaw, smoothstep(ra.enterDur, ra.enterDur + 0.45, lt));
    }
    char.root.position.set(x, 0, a.z);
    char.root.rotation.y = yaw;
    ra.walking = walking;
  }

  headPos(ra, out) {
    // follow the figure itself, which moves around during run / slide / dance steps
    if (ra.char.focus) return ra.char.focus(out);
    return (ra.char.rig || ra.char.root).getWorldPosition(out).setY(ra.char.height * 0.82);
  }

  animateActor(ra, rt, lt, line) {
    const { a, char } = ra;
    const others = rt.actors.filter((o) => o !== ra);
    const nearest = others.reduce((best, o) => (!best || o.char.root.position.distanceTo(char.root.position) < best.char.root.position.distanceTo(char.root.position) ? o : best), null);
    let lookAt;
    const speaking = line && line.castId === a.castId;
    const partner = line && !speaking ? rt.actors.find((o) => o.a.castId === line.castId) : nearest;
    const arrived = partner && !partner.walking;
    if (arrived && (line || wobble(lt * 0.3, ra.seed) < 0.4)) {
      // film "cheat": look at the partner but open the face toward camera
      lookAt = this.headPos(partner, v1).lerp(this.camera.position, speaking ? 0.45 : 0.25);
    } else {
      lookAt = v1.copy(this.camera.position);
    }
    if (ra.walking) lookAt = null;

    // emotion with smooth transitions
    let i = 0;
    while (i + 1 < ra.events.length && ra.events[i + 1].t <= lt) i++;
    const cur = ra.events[i], prev = ra.events[Math.max(0, i - 1)];
    let face = faceParams(prev.e, cur.e, smoothstep(0, 0.3, lt - cur.t));

    let talk = 0, vocal = null;
    if (speaking) {
      const item = this.voices?.get(line.voiceKey);
      const lt2 = lt - line.localStart;
      talk = item ? talkAt(item, lt2) : Math.abs(Math.sin(lt2 * 11)) * (0.5 + 0.5 * Math.max(0, wobble(lt2 * 4, 3)));
      // a laugh, gasp or sob in the line: the face and body play it while it sounds
      const m = item?.marks?.find((k) => lt2 >= k.start - 0.12 && lt2 <= k.end + 0.3);
      if (m) {
        const k = smoothstep(m.start - 0.12, m.start + 0.06, lt2) * (1 - smoothstep(m.end, m.end + 0.3, lt2));
        face = faceParams(cur.e, m.face, k);
        vocal = { sound: m.sound, k, t: lt2 - m.start };
      }
    }
    // a gesture fades in and out over a third of a second, on top of the shot's action
    let gesture = null;
    if (!ra.walking) for (const g of ra.gestures) {
      if (lt < g.start || lt > g.end + 0.35) continue;
      const k = smoothstep(g.start, g.start + 0.3, lt) * (1 - smoothstep(g.end, g.end + 0.35, lt));
      if (k > (gesture?.k || 0)) gesture = { action: g.action, k, t: lt - g.start };
    }
    char.update({
      t: lt, action: ra.walking ? 'idle' : a.action, actionStart: ra.enterDur,
      walking: ra.walking, lookAt, face, talk, speaking: !!speaking, vocal, gesture,
    });
  }

  placeCamera(rt, lt, line) {
    const cam = this.camera, aspect = cam.aspect;
    const vfov = THREE.MathUtils.degToRad(cam.fov), hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    const span = Math.max(rt.span + 1.6, 2.4);
    const wide = Math.max(span / 2 / Math.tan(hfov / 2), 1.0 / Math.tan(vfov / 2)) + 0.8;
    const c = rt.center;
    let mode = rt.shot.camera, target = null;
    if (mode === 'auto') {
      let cut = rt.cuts[0];
      for (const k of rt.cuts) if (lt >= k.t) cut = k;
      mode = cut.mode;
      target = cut.target;
    } else if (mode === 'closeup') {
      target = line?.castId || rt.actors[0]?.a.castId;
      mode = rt.actors.length > 1 ? 'close' : 'medium';
    }

    const pos = v1, look = v2;
    let aperture = 0.00012;
    const orbit = (dist, yaw, height, lookY = 0.72) => {
      pos.set(c.x + Math.sin(yaw) * dist, height, c.z + Math.cos(yaw) * dist);
      look.set(c.x, lookY, c.z);
    };
    const drift = wobble(lt * 0.15, rt.index) * 0.06;
    switch (mode) {
      case 'orbit': orbit(wide, Math.sin(lt * 0.12) * 0.55, 1.35); break;
      case 'push': orbit(lerp(wide * 1.15, wide * 0.55, easeInOut(clamp(lt / rt.duration, 0, 1))), drift, 1.2); break;
      case 'pan': {
        const k = easeInOut(clamp(lt / rt.duration, 0, 1));
        orbit(wide * 0.9, 0, 1.25);
        pos.x += lerp(-1.6, 1.6, k); look.x += lerp(-1.6, 1.6, k) * 0.8;
        break;
      }
      case 'low': orbit(wide * 0.8, drift, 0.42, 0.95); break;
      case 'close':
      case 'medium': {
        const ra = rt.actors.find((r) => r.a.castId === target) || rt.actors[0];
        if (!ra) { orbit(wide, drift, 1.35); break; }
        const head = this.headPos(ra, new THREE.Vector3());
        const others = rt.actors.filter((r) => r !== ra);
        const side = others.length ? Math.sign(others.reduce((s, o) => s + o.char.root.position.x, 0) / others.length - head.x) || 1 : 0;
        // tall frames (Shorts) are narrow, so step back until the head and shoulders fit across
        const dist = (mode === 'close' ? 1.55 : 2.5) * Math.max(1, 1.25 / Math.sqrt(aspect));
        // try the listener's side first, then the other side, then straight on
        const blocked = (yaw) => others.some((o) => {
          const px = o.char.root.position.x - head.x, pz = o.char.root.position.z - head.z;
          const dx = Math.sin(yaw), dz = Math.cos(yaw);
          const along = px * dx + pz * dz;
          return along > 0.1 && along < dist && Math.abs(px * dz - pz * dx) < 0.5;
        });
        const yaw = [side * 0.42, -side * 0.42, 0, side * 0.9].find((y) => !blocked(y)) ?? 0;
        pos.set(head.x + Math.sin(yaw + drift) * dist, head.y - 0.02, head.z + Math.cos(yaw + drift) * dist);
        look.set(head.x, head.y - (mode === 'close' ? 0.1 : 0.35), head.z);
        aperture = mode === 'close' ? 0.0003 : 0.0002;
        break;
      }
      default: orbit(wide, drift, 1.35);
    }
    const b = this.worldActive.bounds;
    if (b) { pos.x = clamp(pos.x, b.minX, b.maxX); pos.z = Math.min(pos.z, b.maxZ); pos.y = Math.min(pos.y, b.maxY); }
    cam.position.copy(pos);
    cam.lookAt(look);
    return { focus: pos.distanceTo(look), aperture, target: (this.camTarget ??= new THREE.Vector3()).copy(look) };
  }

  /**
   * Time card ("Day 2", "That evening", "One week later"): big in the middle while the shot opens
   * (nobody talks yet, see CARD_TIME), then it shrinks into a chip in the top corner for the rest of
   * the shot, so anyone who looks up later still sees which day it is.
   */
  drawCard(g, rt, lt, w, h, unit) {
    const text = rt.shot.card, kind = TIME_LOOKS[rt.shot.time] ? rt.shot.time : 'afternoon';
    const low = kind === 'morning' || kind === 'evening';
    g.save();
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    const big = smoothstep(0.2, 0.55, lt) * (1 - smoothstep(1.5, 1.9, lt));
    if (big > 0.01) {
      const pop = 0.85 + 0.15 * easeInOut(clamp((lt - 0.2) / 0.35, 0, 1));
      g.globalAlpha = big;
      g.fillStyle = 'rgba(12,6,32,0.28)';
      g.fillRect(0, 0, w, h);
      const size = unit * 0.1 * pop;
      g.font = `700 ${size}px Fredoka, system-ui, sans-serif`;
      const bw = g.measureText(text).width + size * 2.4, bh = size * 1.7, bx = w / 2 - bw / 2, by = h * 0.42 - bh / 2;
      g.shadowColor = 'rgba(0,0,0,0.35)';
      g.shadowBlur = size * 0.4;
      g.fillStyle = 'rgba(255,255,255,0.95)';
      roundRect(g, bx, by, bw, bh, bh / 2);
      g.fill();
      g.shadowBlur = 0;
      timeIcon(g, kind, bx + size * 0.95, by + bh / 2 + (low ? size * 0.12 : 0), size * 0.4);
      g.fillStyle = '#3b1d5e';
      g.fillText(text, bx + size * 1.75, by + bh / 2 + size * 0.04);
    }
    const chip = smoothstep(1.6, 2.0, lt) * (1 - smoothstep(rt.duration - 0.3, rt.duration, lt));
    if (chip > 0.01) {
      g.globalAlpha = chip;
      const size = unit * 0.042;
      g.font = `700 ${size}px Fredoka, system-ui, sans-serif`;
      const bh = size * 1.8, bw = g.measureText(text).width + size * 3.0, bx = unit * 0.035, by = unit * 0.035;
      g.fillStyle = 'rgba(255,255,255,0.88)';
      roundRect(g, bx, by, bw, bh, bh / 2);
      g.fill();
      timeIcon(g, kind, bx + size * 1.1, by + bh / 2 + (low ? size * 0.15 : 0), size * 0.42);
      g.fillStyle = '#3b1d5e';
      g.fillText(text, bx + size * 2.0, by + bh / 2 + size * 0.03);
    }
    g.restore();
  }

  drawOverlays(T, rt, lt, line) {
    const g = this.ctx2d, [w, h] = this.size, story = this.story, total = this.timeline.total;
    let black = 0;
    if (T < 0.6) black = 1 - T / 0.6;
    if (T > total - 1) black = Math.max(black, (T - (total - 1)) / 1);
    const last = rt.index === this.shotsRt.length - 1;
    if (!last && rt.shot.transition === 'fade' && lt > rt.duration - 0.4) black = Math.max(black, (lt - (rt.duration - 0.4)) / 0.4);
    const prev = this.shotsRt[rt.index - 1];
    if (prev && prev.shot.transition === 'fade' && lt < 0.4) black = Math.max(black, 1 - lt / 0.4);

    const unit = Math.min(w, h);
    if (story.titleCard && T < 3.6) {
      const a = smoothstep(0.4, 1.0, T) * (1 - smoothstep(2.8, 3.6, T));
      if (a > 0) {
        g.save();
        g.globalAlpha = a;
        const grad = g.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, 'rgba(10,5,30,0.45)'); grad.addColorStop(0.5, 'rgba(10,5,30,0.15)'); grad.addColorStop(1, 'rgba(10,5,30,0.45)');
        g.fillStyle = grad;
        g.fillRect(0, 0, w, h);
        const size = unit * 0.11;
        g.font = `700 ${size}px Fredoka, system-ui, sans-serif`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.shadowColor = 'rgba(0,0,0,0.5)';
        g.shadowBlur = size * 0.3;
        g.lineJoin = 'round';
        g.lineWidth = size * 0.16;
        g.strokeStyle = '#3b1d5e';
        const lines = wrap(g, story.title, w * 0.86);
        lines.forEach((ln, i) => {
          const y = h / 2 + (i - (lines.length - 1) / 2) * size * 1.1;
          g.strokeText(ln, w / 2, y);
          g.fillStyle = '#ffffff';
          g.fillText(ln, w / 2, y);
        });
        g.restore();
      }
    }

    if (rt.shot.card) this.drawCard(g, rt, lt, w, h, unit);

    if (story.subtitles && line) {
      const size = unit * 0.05;
      g.save();
      g.font = `600 ${size}px Fredoka, system-ui, sans-serif`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const lines = wrap(g, displayText(line.text), w * 0.82).slice(0, 3);
      const lh = size * 1.25;
      const blockH = lines.length * lh + size * 0.6;
      const bottom = h * (w < h ? 0.78 : 0.92);
      const maxW = Math.max(...lines.map((l) => g.measureText(l).width)) + size * 1.2;
      const k = smoothstep(0, 0.15, lt - line.localStart) * (1 - smoothstep(0, 0.15, lt - line.localEnd));
      g.globalAlpha = k;
      g.fillStyle = 'rgba(15,8,30,0.55)';
      roundRect(g, w / 2 - maxW / 2, bottom - blockH, maxW, blockH, size * 0.4);
      g.fill();
      g.fillStyle = '#ffffff';
      lines.forEach((ln, i) => g.fillText(ln, w / 2, bottom - blockH + size * 0.3 + lh * (i + 0.5)));
      g.restore();
    }

    if (black > 0) {
      g.fillStyle = `rgba(0,0,0,${clamp(black, 0, 1)})`;
      g.fillRect(0, 0, w, h);
    }
  }
}

/** A little sun, setting sun or moon drawn on the 2D canvas, so it looks the same everywhere, video included. */
function timeIcon(g, kind, x, y, r) {
  g.save();
  if (kind === 'night') {
    g.fillStyle = '#ffd84d';
    g.beginPath();
    g.arc(x, y, r, 0.35 * Math.PI, 1.65 * Math.PI, false); // crescent: outer arc...
    g.arc(x + r * 0.55, y - r * 0.1, r * 0.8, 1.55 * Math.PI, 0.45 * Math.PI, true); // ...minus a bite
    g.closePath();
    g.fill();
    for (const [dx, dy, s] of [[1.15, -0.75, 0.16], [1.45, 0.35, 0.11]]) { g.beginPath(); g.arc(x + r * dx, y + r * dy, r * s, 0, Math.PI * 2); g.fill(); }
  } else {
    const low = kind === 'morning' || kind === 'evening';
    const col = kind === 'evening' ? '#ff7a2f' : '#ffb800';
    g.strokeStyle = col;
    g.lineWidth = r * 0.2;
    g.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      if (low && Math.sin(a) > 0.05) continue; // a rising or setting sun only shows its top rays
      g.beginPath();
      g.moveTo(x + Math.cos(a) * r * 1.35, y + Math.sin(a) * r * 1.35);
      g.lineTo(x + Math.cos(a) * r * 1.7, y + Math.sin(a) * r * 1.7);
      g.stroke();
    }
    g.fillStyle = col;
    g.beginPath();
    if (low) g.arc(x, y, r, Math.PI, 0); else g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
    if (low) { g.fillStyle = col; g.fillRect(x - r * 1.8, y + r * 0.12, r * 3.6, r * 0.16); } // the horizon
  }
  g.restore();
}

function wrap(g, text, maxW) {
  const words = String(text).split(/\s+/), lines = [];
  let cur = '';
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word;
    if (g.measureText(test).width > maxW && cur) { lines.push(cur); cur = word; } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}
