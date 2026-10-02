// Animal voices: synthesized calls (meow, woof, roar, oink, squeak, trumpet…) so animal characters
// sound like animals. A sentence made only of sound words ("Woof woof!", "म्याऊँ!") becomes the real
// call; in "auto" mode an emotional line from an animal also opens with its call before the words.
import { rng } from './util.js';

export const ANIMAL_SOUNDS = {
  auto: 'Animal calls + speech',
  words: 'Only sound words (Woof!, Meow!)',
  off: 'Off (speech only)',
};

// Each species: its signature call, how high it sounds, and what it does when angry or sad.
const SPECIES = {
  cat: { call: 'meow', p: 1, angry: 'hiss', calm: 'purr' },
  puppy: { call: 'bark', p: 1.12 },
  lion: { call: 'roar', p: 1 },
  bear: { call: 'growl', p: 1.1 },
  fox: { call: 'yip', p: 1 },
  panda: { call: 'bleat', p: 1 },
  mouse: { call: 'squeak', p: 1 },
  monkey: { call: 'monkey', p: 1 },
  pig: { call: 'oink', p: 1 },
  elephant: { call: 'trumpet', p: 1 },
  koala: { call: 'bellow', p: 1 },
  bunny: { call: 'squee', p: 1 },
};

export const isAnimal = (cast) => !!SPECIES[cast?.type];
/** 'auto' | 'words' | null (null: speak normally). */
export const animalMode = (cast) => (isAnimal(cast) && cast.animalSounds !== 'off' ? (cast.animalSounds === 'words' ? 'words' : 'auto') : null);

// Sound words in English and Hindi. `only` limits a word to species where it is clearly a call.
const WORDS = [
  [/^(w+o+o*f+|wo+f|a+r+f+|r+u+f+|bo+w+wo+w+|bark|yap|bho+w+|भौ[ंँ]*|भो[ंँ]*|वू+फ)$/u, 'bark'],
  [/^(m+e*o+w+|m+i+a+o+w+|m+e+w+|m+r+o+w+|म्या+ऊ+[ंँ]*|म्यां+ऊ+|मि+या+ऊ+[ंँ]*)$/u, 'meow'],
  [/^(p+u+r+|p+r+r+|घु+र्र+)$/u, 'purr'],
  [/^(h+i+s+s*|s+s+s+|हि+स्स+)$/u, 'hiss'],
  [/^(g+r+r+|g+r+o+w+l+|गु*र्र+)$/u, 'growl'],
  [/^(r+o+a+r+|r+a+w+r+|द+हा+ड़)$/u, 'roar'],
  [/^(o+i+n+k+|ओ+इं+क|ऑ+इं+क)$/u, 'oink'],
  [/^(s+q+u+e+a+k+|e+e+k+|c+h+u+|चू+[ंँ]*|ची+[ंँ]*)$/u, 'squeak'],
  [/^(o+o+h*|o+o+k+|ऊ+)$/u, 'monkeyOo', ['monkey']],
  [/^(a+a+h*|आ+)$/u, 'monkeyAa', ['monkey']],
  [/^(t+o+o+t+|p+a+w*o+o+|p+r+r+u+|ह+ू+ऊ+)$/u, 'trumpet'],
  [/^(b+a+a+|b+l+e+a+t+)$/u, 'bleat'],
  [/^(s+n+i+f+|सूं+घ)$/u, 'sniff'],
  [/^(a+w+o+o+|a+h*o+o+|ऑ+ऊ+|आ+ऊ+)$/u, 'howl'],
];

/** The calls for a phrase made only of sound words, or null if it has real words in it. */
export function soundWords(type, text) {
  const words = String(text).toLowerCase().split(/[\s,]+/).map((w) => w.replace(/[^\p{L}\p{M}]/gu, '')).filter(Boolean);
  if (!words.length) return null;
  const calls = [];
  for (const w of words) {
    const hit = WORDS.find(([re, , only]) => re.test(w) && (!only || only.includes(type)));
    if (!hit) return null;
    // stretched words ("Woooof", "Meeeow") make longer calls
    const extra = Math.max(0, w.length - w.replace(/(.)\1+/gu, '$1').length - 1);
    calls.push({ call: hit[1], len: Math.min(1.8, 1 + extra * 0.15) });
  }
  return calls;
}

/**
 * Split a spoken phrase into calls and words at commas: "Woof, I found it!" → bark, then "I found it!".
 * Returns [{ calls } | { text }], or null when there are no sound words in it.
 */
export function splitCalls(type, text) {
  const whole = soundWords(type, text);
  if (whole) return [{ calls: whole }];
  const parts = [];
  for (const chunk of String(text).split(/,\s*/)) {
    const calls = soundWords(type, chunk);
    const last = parts.at(-1);
    if (calls) parts.push({ calls });
    else if (last?.text !== undefined) last.text += `, ${chunk}`;
    else parts.push({ text: chunk });
  }
  return parts.some((p) => p.calls) ? parts : null;
}

const CALL_EMOTIONS = new Set(['excited', 'laugh', 'surprised', 'scared', 'sad', 'angry']);
/** The call an animal makes before an emotional line (auto mode), or null. */
export function signatureCalls(type, emotion) {
  const S = SPECIES[type];
  if (!S || !CALL_EMOTIONS.has(emotion)) return null;
  const call = (emotion === 'angry' && S.angry) || S.call;
  if (call === 'monkey') return emotion === 'excited' || emotion === 'laugh'
    ? ['monkeyOo', 'monkeyOo', 'monkeyAa', 'monkeyAa'].map((c) => ({ call: c, len: 1 }))
    : [{ call: 'monkeyOo', len: 1 }, { call: 'monkeyAa', len: 1 }];
  const twice = (emotion === 'excited' || emotion === 'laugh') && ['bark', 'oink', 'squeak', 'yip', 'squee'].includes(call);
  const len = call === 'roar' && emotion !== 'angry' ? 0.6 : 1;
  return Array.from({ length: twice ? 2 : 1 }, () => ({ call, len }));
}

// ---------- synthesis ----------
const RATE = 48000;
let noiseBuf = null;
function noise(ctx) {
  if (noiseBuf?.sampleRate === ctx.sampleRate) return noiseBuf;
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0), r = rng(11);
  for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1;
  return noiseBuf;
}

/** Points [[0..1, value]] spread over `dur` seconds from `at`. */
function curve(param, points, at, dur) {
  param.setValueAtTime(points[0][1], at);
  for (const [t, v] of points.slice(1)) param.exponentialRampToValueAtTime(Math.max(1, v), at + t * dur);
}

function lfo(ctx, at, dur, rate, depth, target, type = 'sine') {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = rate; g.gain.value = depth;
  o.connect(g).connect(target);
  o.start(at); o.stop(at + dur + 0.1);
}

// Vowel formants (F1, F2, F3) for shaping a call like a mouth would.
const V = { i: [330, 2300, 3000], e: [500, 1800, 2600], a: [800, 1300, 2700], o: [480, 820, 2500], u: [380, 900, 2400], n: [400, 1100, 2300] };

/**
 * A voiced call: a buzzing source with a pitch glide, shaped by moving formants (the "mouth"),
 * plus breath noise and optional roughness (growl / tremolo).
 */
function voiced(ctx, out, at, o) {
  const { dur, f0, vowels, wave = 'sawtooth', vol = 1, attack = 0.02, release = 0.08, breath = 0.1, rough = 0, roughRate = 35,
    vibrato = 0, vibratoRate = 6, q = 7 } = o;
  const src = ctx.createGain();
  const osc = ctx.createOscillator();
  osc.type = wave;
  curve(osc.frequency, f0, at, dur);
  if (vibrato) lfo(ctx, at, dur, vibratoRate, vibrato, osc.frequency);
  osc.connect(src);
  osc.start(at); osc.stop(at + dur + 0.05);
  if (breath) {
    const n = ctx.createBufferSource(), g = ctx.createGain();
    n.buffer = noise(ctx); g.gain.value = breath;
    n.connect(g).connect(src);
    n.start(at, (at * 7.31) % 1); n.stop(at + dur + 0.05);
  }
  const mouth = ctx.createGain();
  if (vowels) {
    [1, 0.55, 0.25].forEach((level, k) => {
      const bp = ctx.createBiquadFilter(), g = ctx.createGain();
      bp.type = 'bandpass'; bp.Q.value = q;
      curve(bp.frequency, vowels.map(([t, v]) => [t, v[k]]), at, dur);
      g.gain.value = level * 3;
      src.connect(bp).connect(g).connect(mouth);
    });
    const body = ctx.createBiquadFilter(), g = ctx.createGain(); // a little chest under the formants
    body.type = 'lowpass'; body.frequency.value = vowels[0][1][0];
    g.gain.value = 0.25;
    src.connect(body).connect(g).connect(mouth);
  } else src.connect(mouth);
  const am = ctx.createGain();
  am.gain.value = 1 - rough / 2;
  if (rough) lfo(ctx, at, dur, roughRate, rough / 2, am.gain);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(vol, at + attack);
  env.gain.setValueAtTime(vol, at + Math.max(attack, dur - release));
  env.gain.linearRampToValueAtTime(0, at + dur);
  mouth.connect(am).connect(env).connect(out);
}

/** Filtered noise: hisses, sniffs, snorts. */
function hush(ctx, out, at, { dur, type = 'highpass', freq = 3000, q = 1, vol = 0.5, attack = 0.04 }) {
  const n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), env = ctx.createGain();
  n.buffer = noise(ctx);
  f.type = type; f.frequency.value = freq; f.Q.value = q;
  env.gain.setValueAtTime(0, at);
  env.gain.linearRampToValueAtTime(vol, at + attack);
  env.gain.linearRampToValueAtTime(0, at + dur);
  n.connect(f).connect(env).connect(out);
  n.start(at, (at * 3.7) % 1); n.stop(at + dur + 0.05);
}

// How emotion bends a call: pitch, length, roughness.
const EMO = {
  neutral: { p: 1, d: 1 }, happy: { p: 1.05, d: 0.95 }, excited: { p: 1.14, d: 0.85 }, laugh: { p: 1.1, d: 0.9 },
  sad: { p: 0.86, d: 1.45, sad: true }, angry: { p: 0.9, d: 1.1, rough: 0.25 }, surprised: { p: 1.2, d: 0.9 },
  scared: { p: 1.25, d: 0.8, shake: true }, thinking: { p: 0.96, d: 1.15 }, calm: { p: 0.95, d: 1.15 },
};

// Each call: (k) => { dur, play(ctx, out, at) }. k = { p: pitch factor, d: length factor, sad, rough, shake }.
const CALLS = {
  meow: (k) => {
    const dur = 0.55 * k.d;
    return { dur, play: (c, o, at) => voiced(c, o, at, { dur, f0: [[0, 520 * k.p], [0.3, 760 * k.p], [1, (k.sad ? 380 : 560) * k.p]],
      vowels: [[0, V.i], [0.35, V.a], [1, V.u]], breath: 0.08, vibrato: k.shake ? 30 : 8, vibratoRate: k.shake ? 11 : 5, rough: k.rough || 0 }) };
  },
  bark: (k) => {
    if (k.sad) { // a whimper
      const dur = 0.5 * k.d;
      return { dur, play: (c, o, at) => voiced(c, o, at, { dur, wave: 'triangle', f0: [[0, 900 * k.p], [0.4, 1150 * k.p], [1, 650 * k.p]],
        vowels: [[0, V.i], [1, V.u]], breath: 0.15, attack: 0.05, release: 0.2, vibrato: 25, vibratoRate: 9, vol: 0.8 }) };
    }
    const dur = 0.19 * k.d;
    return { dur, play: (c, o, at) => {
      voiced(c, o, at, { dur, f0: [[0, 360 * k.p], [0.25, 500 * k.p], [1, 280 * k.p]], vowels: [[0, V.u], [0.3, V.a], [1, V.o]],
        attack: 0.006, release: 0.07, breath: 0.35, rough: 0.25 + (k.rough || 0), roughRate: 60, q: 5 });
      hush(c, o, at, { dur: 0.05, type: 'bandpass', freq: 1200, vol: 0.4, attack: 0.004 });
    } };
  },
  yip: (k) => {
    const dur = 0.16 * k.d;
    return { dur, play: (c, o, at) => voiced(c, o, at, { dur, f0: [[0, 700 * k.p], [0.3, 1050 * k.p], [1, 650 * k.p]],
      vowels: [[0, V.e], [0.4, V.a], [1, V.a]], attack: 0.005, release: 0.06, breath: 0.3, rough: 0.2, roughRate: 70, q: 5 }) };
  },
  howl: (k) => {
    const dur = 1.1 * k.d;
    return { dur, play: (c, o, at) => voiced(c, o, at, { dur, f0: [[0, 480 * k.p], [0.3, 820 * k.p], [0.8, 760 * k.p], [1, 560 * k.p]],
      vowels: [[0, V.a], [0.3, V.o], [1, V.u]], attack: 0.15, release: 0.3, breath: 0.12, vibrato: 10 }) };
  },
  growl: (k) => {
    const dur = 0.8 * k.d;
    return { dur, play: (c, o, at) => voiced(c, o, at, { dur, f0: [[0, 95 * k.p], [0.5, 115 * k.p], [1, 85 * k.p]],
      vowels: [[0, V.o], [1, V.u]], attack: 0.08, release: 0.2, breath: 0.45, rough: 0.8, roughRate: 28, q: 4 }) };
  },
  roar: (k) => {
    const dur = 1.3 * k.d;
    return { dur, play: (c, o, at) => {
      voiced(c, o, at, { dur, f0: [[0, 110 * k.p], [0.25, 200 * k.p], [0.6, 160 * k.p], [1, 80 * k.p]],
        vowels: [[0, V.o], [0.3, V.a], [1, V.o]], attack: 0.12, release: 0.4, breath: 0.6, rough: 0.7, roughRate: 38, q: 3.5 });
      hush(c, o, at, { dur, type: 'lowpass', freq: 500, vol: 0.5, attack: 0.15 });
    } };
  },
  purr: (k) => {
    const dur = 1.0 * k.d;
    return { dur, play: (c, o, at) => voiced(c, o, at, { dur, f0: [[0, 55], [1, 50]], vowels: [[0, V.u], [1, V.u]],
      attack: 0.15, release: 0.3, breath: 0.9, rough: 1, roughRate: 25, q: 2, vol: 0.9 }) };
  },
  hiss: (k) => {
    const dur = 0.7 * k.d;
    return { dur, play: (c, o, at) => hush(c, o, at, { dur, freq: 3500, vol: 0.7, attack: 0.03 }) };
  },
  oink: (k) => {
    const dur = 0.24 * k.d;
    return { dur, play: (c, o, at) => {
      voiced(c, o, at, { dur, f0: [[0, 180 * k.p], [0.3, 230 * k.p], [1, 140 * k.p]], vowels: [[0, V.n], [1, V.o]],
        attack: 0.01, release: 0.07, breath: 0.25, rough: 0.6, roughRate: 45, q: 5 });
      hush(c, o, at, { dur: dur * 0.8, type: 'bandpass', freq: 700, q: 2, vol: 0.35, attack: 0.01 });
    } };
  },
  squeak: (k) => {
    const dur = 0.12 * k.d;
    return { dur, play: (c, o, at) => voiced(c, o, at, { dur, wave: 'sine', f0: [[0, 2800 * k.p], [0.4, 3700 * k.p], [1, 3000 * k.p]],
      breath: 0, attack: 0.01, release: 0.04, vol: 0.6, vibrato: k.shake ? 200 : 0, vibratoRate: 25 }) };
  },
  squee: (k) => {
    const dur = 0.16 * k.d;
    return { dur, play: (c, o, at) => {
      hush(c, o, at, { dur: 0.06, type: 'bandpass', freq: 2600, q: 3, vol: 0.25, attack: 0.01 });
      voiced(c, o, at + 0.04, { dur, wave: 'triangle', f0: [[0, 1400 * k.p], [0.5, 1750 * k.p], [1, 1300 * k.p]], vowels: [[0, V.i], [1, V.e]],
        breath: 0.05, attack: 0.02, release: 0.06, vol: 0.8 });
    } };
  },
  sniff: (k) => ({ dur: 0.36, play: (c, o, at) => [0, 0.12, 0.24].forEach((t) => hush(c, o, at + t, { dur: 0.07, type: 'bandpass', freq: 2500, q: 2, vol: 0.5, attack: 0.02 })) }),
  monkeyOo: (k) => {
    const dur = 0.26 * k.d;
    return { dur, play: (c, o, at) => voiced(c, o, at, { dur, f0: [[0, 430 * k.p], [1, 720 * k.p]], vowels: [[0, V.u], [1, V.u]],
      attack: 0.02, release: 0.06, breath: 0.15, q: 6 }) };
  },
  monkeyAa: (k) => {
    const dur = 0.34 * k.d;
    return { dur, play: (c, o, at) => voiced(c, o, at, { dur, f0: [[0, 820 * k.p], [0.3, 980 * k.p], [1, 620 * k.p]], vowels: [[0, V.a], [1, V.a]],
      attack: 0.015, release: 0.1, breath: 0.2, rough: 0.15, roughRate: 50, q: 5 }) };
  },
  trumpet: (k) => {
    const dur = 0.95 * k.d;
    return { dur, play: (c, o, at) => voiced(c, o, at, { dur, f0: [[0, 400 * k.p], [0.15, 640 * k.p], [0.7, 610 * k.p], [1, 480 * k.p]],
      vowels: [[0, [700, 1600, 3200]], [1, [650, 1500, 3000]]], q: 3, attack: 0.05, release: 0.2, breath: 0.3, vibrato: 25, vibratoRate: 12, rough: 0.15, roughRate: 70 }) };
  },
  bleat: (k) => {
    const dur = 0.5 * k.d;
    return { dur, play: (c, o, at) => voiced(c, o, at, { dur, f0: [[0, 430 * k.p], [1, (k.sad ? 330 : 390) * k.p]], vowels: [[0, V.e], [1, V.a]],
      attack: 0.03, release: 0.12, breath: 0.15, rough: 0.6, roughRate: 9, q: 6 }) };
  },
  bellow: (k) => {
    const dur = 0.7 * k.d;
    return { dur, play: (c, o, at) => voiced(c, o, at, { dur, f0: [[0, 62 * k.p], [0.5, 78 * k.p], [1, 56 * k.p]], vowels: [[0, V.o], [1, V.u]],
      attack: 0.06, release: 0.2, breath: 0.5, rough: 0.9, roughRate: 20, q: 3 }) };
  },
};

const cache = new Map();

/** Render a run of calls (from soundWords / signatureCalls) as one mono AudioBuffer at 48 kHz. */
export function renderCalls(type, calls, emotion = 'neutral') {
  const key = JSON.stringify([type, calls, emotion]);
  if (!cache.has(key)) {
    const p = (async () => {
      const E = EMO[emotion] || EMO.neutral, sp = SPECIES[type]?.p || 1;
      const plan = calls.map(({ call, len }, i) => {
        // each repeat a touch different so "woof woof" doesn't sound copy-pasted
        const k = { ...E, p: E.p * sp * (i % 2 ? 0.94 : 1), d: E.d * len };
        return CALLS[call](k);
      });
      const gap = 0.09 * E.d;
      const total = plan.reduce((t, c) => t + c.dur + gap, 0.05);
      const ctx = new OfflineAudioContext(1, Math.ceil(RATE * (total + 0.1)), RATE);
      const out = ctx.createGain();
      out.connect(ctx.destination);
      let t = 0.02;
      for (const c of plan) { c.play(ctx, out, t); t += c.dur + gap; }
      const buffer = await ctx.startRendering();
      // bring to speech level so calls and words sit together
      const d = buffer.getChannelData(0);
      let peak = 0, sum = 0, n = 0;
      for (const x of d) { const a = Math.abs(x); peak = Math.max(peak, a); if (a > 0.005) { sum += x * x; n++; } }
      const rms = n ? Math.sqrt(sum / n) : 0;
      const gain = rms ? Math.min(0.12 / rms, 0.9 / peak) : 1;
      for (let i = 0; i < d.length; i++) d[i] *= gain;
      return buffer;
    })();
    p.catch(() => cache.delete(key));
    cache.set(key, p);
  }
  return cache.get(key);
}
