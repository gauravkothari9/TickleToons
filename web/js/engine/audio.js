// Audio: generated film-style music, character voices (from the Python server),
// lip-sync envelopes, live playback and the offline mixdown used for final renders.
import { rng } from './util.js';
import { api } from '../api.js';
import { animalMode, splitCalls, signatureCalls, renderCalls } from './animals.js';
import { vocalMode, splitVocals, introVocal, renderVocal, renderAnimal, VOCAL_FACE } from './vocals.js';

export const MUSIC = {
  none: 'No music',
  happy: 'Happy & bouncy',
  adventure: 'Adventure',
  calm: 'Calm & warm',
  silly: 'Silly & playful',
  lullaby: 'Sleepy lullaby',
  sad: 'Sad & tender',
  tense: 'Suspense & mystery',
  festive: 'Festive dhol (celebrations)',
};
/** Per-shot choice: follow the story (and the scene's mood), or force a style for this shot. */
export const SHOT_MUSIC = { auto: 'Same as story (fits the mood)', ...MUSIC };

// Background music sits *under* the story: soft piano / marimba / flute leads, light percussion,
// and fewer notes than a song would have.
const STYLES = {
  happy:     { bpm: 108, key: 60, prog: [0, 7, 9, 5], lead: 'keys', drums: 'soft', density: 0.5, octave: 12 },
  adventure: { bpm: 100, key: 57, prog: [0, 8, 3, 10], minor: true, lead: 'flute', drums: 'soft', density: 0.45, octave: 12 },
  calm:      { bpm: 76, key: 62, prog: [0, 5, 9, 7], lead: 'keys', drums: false, density: 0.3, octave: 12 },
  silly:     { bpm: 120, key: 65, prog: [0, 5, 7, 5], lead: 'pluck', drums: 'soft', density: 0.55, octave: 12, staccato: true },
  lullaby:   { bpm: 64, key: 65, prog: [0, 9, 5, 7], lead: 'keys', drums: false, density: 0.25, octave: 24, bell: true },
  sad:       { bpm: 62, key: 57, prog: [0, 5, 8, 7], minor: true, lead: 'keys', drums: false, density: 0.25, octave: 12 },
  tense:     { bpm: 88, key: 50, prog: [0, 8, 0, 7], minor: true, lead: 'pluck', drums: 'heartbeat', density: 0.2, octave: 12, staccato: true },
  festive:   { bpm: 120, key: 62, prog: [0, 5, 7, 5], scale: [0, 2, 4, 5, 7, 9, 10], lead: 'flute', drums: 'dhol', density: 0.55, octave: 12 },
};

// ---------- which music fits each scene ----------
const CELEBRATION = new Set(['wedding', 'reception']);
/** The music style for one shot: the story's style, unless the scene's mood clearly asks for another. */
function sceneMood(shot, base) {
  const w = {};
  let total = 0;
  const add = (e, n) => { w[e] = (w[e] || 0) + n; total += n; };
  for (const l of shot.lines) add(l.emotion, 1);
  for (const a of shot.actors) add(a.mood, 0.5);
  const f = (...es) => es.reduce((s, e) => s + (w[e] || 0), 0) / (total || 1);
  const actions = new Set(shot.actors.map((a) => a.action));
  const gloomy = f('sad', 'scared', 'angry');
  if ((CELEBRATION.has(shot.world) || actions.has('dance')) && gloomy < 0.3) return 'festive';
  if (actions.has('sleep') || (['night', 'bedroom'].includes(shot.world) && f('calm', 'sad', 'thinking', 'neutral') >= 0.5 && f('excited', 'laugh', 'scared', 'angry') < 0.2)) return 'lullaby';
  if (f('sad') >= 0.35) return 'sad';
  if (f('scared', 'angry') >= 0.35) return 'tense';
  if (f('thinking') >= 0.4) return base === 'adventure' ? 'tense' : 'calm';
  if (shot.world === 'birthday' && ['calm', 'lullaby', 'sad', 'tense'].includes(base)) return 'happy';
  // the place sets the feel when the story's style doesn't suit it
  if (shot.world === 'hospital' && base !== 'sad') return 'calm';
  if (shot.world === 'space' && ['happy', 'silly', 'calm'].includes(base)) return 'adventure';
  if (shot.world === 'night' && ['happy', 'silly'].includes(base)) return 'calm';
  if (['market', 'mall', 'playground', 'beach'].includes(shot.world) && ['calm', 'lullaby'].includes(base) && f('sad', 'thinking') < 0.3) return 'happy';
  if (f('excited', 'laugh') >= 0.5 && ['calm', 'lullaby', 'sad'].includes(base)) return 'happy';
  return base;
}

/** Music cues for the whole story: [{ style, start, end }], one per run of shots sharing a style. */
export function musicPlan(story, timeline) {
  if (!story.music || story.music === 'none') return [];
  const shots = timeline.shots;
  const styles = shots.map(({ shot }) => (shot.music && shot.music !== 'auto' ? shot.music : story.musicMood === false ? story.music : sceneMood(shot, story.music)));
  // a quick shot (under 3 s) keeps the music that's already playing instead of jumping away and back
  for (let i = 1; i < shots.length; i++) {
    const own = shots[i].shot.music && shots[i].shot.music !== 'auto';
    if (!own && shots[i].duration < 3) styles[i] = styles[i - 1];
  }
  const cues = [];
  shots.forEach(({ start, end }, i) => {
    const last = cues.at(-1);
    if (last && last.style === styles[i]) last.end = end;
    else cues.push({ style: styles[i], start, end });
  });
  return cues.filter((c) => STYLES[c.style]);
}

const freq = (m) => 440 * 2 ** ((m - 69) / 12);
function chordTones(root, minor, degreeOffset) {
  // triad on a scale degree (offset in semitones from key); quality from the major/minor scale
  const majorQual = { 0: 'M', 2: 'm', 4: 'm', 5: 'M', 7: 'M', 9: 'm', 11: 'd' };
  const minorQual = { 0: 'm', 2: 'd', 3: 'M', 5: 'm', 7: 'm', 8: 'M', 10: 'M' };
  const q = (minor ? minorQual : majorQual)[degreeOffset] || 'M';
  const r = root + degreeOffset;
  return q === 'M' ? [r, r + 4, r + 7] : q === 'm' ? [r, r + 3, r + 7] : [r, r + 3, r + 6];
}

function reverb(ctx, seconds = 2.2) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  const r = rng(99);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  const conv = ctx.createConvolver();
  conv.buffer = buf;
  return conv;
}

let noiseBuf = null;
function noise(ctx) {
  if (noiseBuf && noiseBuf.sampleRate === ctx.sampleRate) return noiseBuf;
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0), r = rng(3);
  for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1;
  return noiseBuf;
}

function note(ctx, out, when, midi, len, type, vol, { attack = 0.01, filter } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq(midi);
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + attack);
  g.gain.exponentialRampToValueAtTime(0.0008, when + len);
  let node = o;
  if (filter) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = filter;
    node = o.connect(f);
  }
  node.connect(g).connect(out);
  o.start(when);
  o.stop(when + len + 0.05);
}

/** Soft melodic voices: 'keys' (electric piano), 'pluck' (marimba / kalimba), 'flute' (breathy, bansuri-like). */
// Kept to two oscillators and no filter per note so long offline renders stay quick.
function softNote(ctx, out, when, midi, len, kind, vol) {
  const f = freq(midi), g = ctx.createGain();
  const body = ctx.createOscillator(), over = ctx.createOscillator(), og = ctx.createGain();
  body.type = kind === 'flute' ? 'triangle' : 'sine';
  over.type = 'sine';
  over.frequency.value = f * (kind === 'pluck' ? 4 : 2);
  body.frequency.value = f;
  og.gain.value = kind === 'pluck' ? 0.15 : kind === 'flute' ? 0.1 : 0.28;
  body.connect(g); over.connect(og).connect(g);
  g.connect(out);
  let stop;
  if (kind === 'flute') {
    stop = len + 0.15;
    body.detune.setValueAtTime(-12, when); // breathy scoop up into the note
    body.detune.linearRampToValueAtTime(0, when + 0.08);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol, when + 0.07);
    g.gain.setValueAtTime(vol * 0.85, when + Math.max(0.08, len * 0.7));
    g.gain.exponentialRampToValueAtTime(0.0008, when + stop);
  } else {
    stop = kind === 'pluck' ? Math.min(len + 0.1, 0.4) : Math.max(0.5, len * 1.2);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol, when + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0008, when + stop);
  }
  body.start(when); over.start(when);
  body.stop(when + stop + 0.05); over.stop(when + stop + 0.05);
}

function kick(ctx, out, when, vol = 0.55) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.setValueAtTime(130, when);
  o.frequency.exponentialRampToValueAtTime(42, when + 0.14);
  g.gain.setValueAtTime(vol, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.18);
  o.connect(g).connect(out);
  o.start(when); o.stop(when + 0.2);
}

function hat(ctx, out, when, vol = 0.06) {
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noise(ctx);
  f.type = 'highpass'; f.frequency.value = 7000;
  g.gain.setValueAtTime(vol, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.05);
  s.connect(f).connect(g).connect(out);
  s.start(when); s.stop(when + 0.06);
}

// a pitched drum: dhol "dha" (low) and "tak" (high)
function tom(ctx, out, when, f0, f1, len, vol) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.setValueAtTime(f0, when);
  o.frequency.exponentialRampToValueAtTime(f1, when + len * 0.8);
  g.gain.setValueAtTime(vol, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + len);
  o.connect(g).connect(out);
  o.start(when); o.stop(when + len + 0.02);
}

/** Schedule music for song-time `from`..`to` (seconds into this cue); song-time 0 is ctx time `zero`. */
function scheduleMusic(ctx, bus, style, from, to, zero) {
  const S = STYLES[style];
  if (!S) return;

  const beat = 60 / S.bpm, eighth = beat / 2, bar = beat * 4;
  const r = rng(7 + style.length);
  const melodyPlan = []; // deterministic melody, generated once for the whole song
  const bars = Math.ceil(to / bar) + 1;
  let last = 4;
  for (let b = 0; b < bars; b++) {
    const phrase = b % 4 === 3;
    for (let e = 0; e < 8; e++) {
      const play = e === 0 || r() < S.density * (phrase && e > 4 ? 0.3 : 1);
      if (!play) { melodyPlan.push(null); continue; }
      last = Math.max(0, Math.min(8, last + Math.round((r() - 0.5) * 3.2)));
      melodyPlan.push({ step: last, len: r() < 0.3 ? 2 : 1 });
    }
  }
  const scale = S.scale || (S.minor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11]);
  const scaleNote = (step) => S.key + S.octave + scale[step % 7] + 12 * Math.floor(step / 7);

  const firstEighth = Math.max(0, Math.ceil(from / eighth - 1e-9)); // windows meet without playing a note twice
  for (let i = firstEighth; i * eighth < to; i++) {
    const songT = i * eighth, when = zero + songT;
    if (when < ctx.currentTime) continue;
    const b = Math.floor(i / 8), e = i % 8;
    const chord = chordTones(S.key - 12, S.minor, S.prog[b % S.prog.length]);
    if (e === 0) {
      // a soft pad, plus the chord rolled gently on the keys
      for (const n of chord) note(ctx, bus, when, n + 12, bar * 1.05, 'triangle', 0.03, { attack: 0.4, filter: 1100 });
      chord.forEach((n, k) => softNote(ctx, bus, when + k * eighth * 0.5, n + 12, beat, 'keys', 0.035));
      note(ctx, bus, when, chord[0] - 12, beat * 1.8, 'sine', 0.22);
    }
    if (e === 4) note(ctx, bus, when, chord[S.minor ? 0 : 2] - 12, beat * 1.8, 'sine', 0.18);
    const m = melodyPlan[i];
    if (m && songT >= 0) {
      // snap melody to chord tones on strong beats so it always sounds "right"
      let midi = scaleNote(m.step);
      if (e % 4 === 0) midi = chord.map((c) => c + 24).reduce((best, c) => (Math.abs(c - midi) < Math.abs(best - midi) ? c : best), chord[0] + 24);
      const len = eighth * m.len * (S.staccato ? 0.6 : 1.4);
      if (['keys', 'pluck', 'flute'].includes(S.lead)) softNote(ctx, bus, when, midi, len, S.lead, S.lead === 'flute' ? 0.07 : 0.09);
      else note(ctx, bus, when, midi, len, S.lead, S.lead === 'sawtooth' || S.lead === 'square' ? 0.04 : 0.1, { filter: S.lead === 'sine' ? null : 2200 });
      if (S.bell) note(ctx, bus, when, midi + 12, len * 2, 'sine', 0.025);
    }
    if (S.drums === 'dhol') {
      if (e === 0 || e === 3 || e === 6) tom(ctx, bus, when, 110, 58, 0.32, 0.38);
      if (e === 2 || e === 4 || e === 7) { tom(ctx, bus, when, 460, 330, 0.09, 0.14); hat(ctx, bus, when, 0.035); }
    } else if (S.drums === 'heartbeat') {
      if (e % 8 === 0) kick(ctx, bus, when, 0.22);
      if (e % 8 === 1) kick(ctx, bus, when, 0.13);
    } else if (S.drums === 'soft') {
      // light: a soft kick on beats 1 and 3, a quiet shaker on the off-beats
      if (e === 0 || e === 4) kick(ctx, bus, when, 0.18);
      if (e % 2 === 1) hat(ctx, bus, when, 0.022);
    } else if (S.drums) {
      if (e % 4 === 0) kick(ctx, bus, when);
      if (e % 2 === 1) hat(ctx, bus, when);
    }
  }
}

// ---------- ambience: the quiet sound of the place ----------
// Every place has a soft bed of sound under the music so a scene feels like somewhere real:
// birds and a breeze outside, waves at the beach, crickets at night, chatter in the market.
const AMBIENCE_OF = {
  meadow: 'birds', pond: 'birds', house: 'birds', forest: 'forest', playground: 'park', school: 'park',
  beach: 'waves', night: 'crickets', space: 'drone', bedroom: 'room', police: 'room', kitchen: 'kitchen',
  classroom: 'class', hospital: 'hospital', mall: 'crowd', market: 'crowd', street: 'street',
  birthday: 'party', wedding: 'party', reception: 'party',
};

/** Ambience cues: [{ kind, start, end }], one per run of shots in the same kind of place. */
export function ambiencePlan(timeline) {
  const cues = [];
  for (const { shot, start, end } of timeline.shots) {
    const kind = AMBIENCE_OF[shot.world];
    const last = cues.at(-1);
    if (last && last.kind === kind && Math.abs(last.end - start) < 0.05) last.end = end;
    else if (kind) cues.push({ kind, start, end });
  }
  return cues;
}

let ambBuf = null;
function ambNoise(ctx) {
  if (ambBuf && ambBuf.sampleRate === ctx.sampleRate) return ambBuf;
  ambBuf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
  const d = ambBuf.getChannelData(0), r = rng(41);
  let pink = 0;
  for (let i = 0; i < d.length; i++) { pink = pink * 0.97 + (r() * 2 - 1) * 0.03; d[i] = (r() * 2 - 1) * 0.5 + pink * 6; }
  return ambBuf;
}

/** A filtered, looping noise bed (wind, waves, crowd murmur, room tone), optionally swelling slowly. */
function bed(ctx, out, t0, t1, { type, f, q = 0.7, vol, swell = 0, rate = 0.1 }) {
  const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = ambNoise(ctx); s.loop = true;
  fl.type = type; fl.frequency.value = f; fl.Q.value = q;
  g.gain.value = vol;
  s.connect(fl).connect(g).connect(out);
  if (swell) {
    const l = ctx.createOscillator(), lg = ctx.createGain();
    l.frequency.value = rate; lg.gain.value = vol * swell;
    l.connect(lg).connect(g.gain);
    l.start(t0); l.stop(t1);
  }
  s.start(t0, (t0 * 1.37) % 4); s.stop(t1);
}

function blip(ctx, out, when, f0, f1, len, vol, type = 'sine') {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, when);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, when + len);
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0008, when + len);
  o.connect(g).connect(out);
  o.start(when); o.stop(when + len + 0.02);
}

const SOUNDS = {
  bird(ctx, out, t, r) { // a little song of 2-5 quick chirps
    const n = 2 + Math.floor(r() * 4), base = 2600 + r() * 2400;
    for (let i = 0; i < n; i++) {
      const w = t + i * (0.08 + r() * 0.06);
      blip(ctx, out, w, base * (1 + r() * 0.15), base * (0.7 + r() * 0.6), 0.07, 0.03);
    }
  },
  cricket(ctx, out, t, r) {
    const f = 4300 + r() * 600;
    for (let i = 0; i < 3; i++) blip(ctx, out, t + i * 0.045, f, f, 0.03, 0.012);
  },
  beep(ctx, out, t) { blip(ctx, out, t, 1000, 1000, 0.11, 0.012); },
  clink(ctx, out, t, r) { // a spoon on a steel plate
    const f = 2600 + r() * 900;
    blip(ctx, out, t, f, f, 0.35, 0.012); blip(ctx, out, t, f * 1.48, f * 1.48, 0.22, 0.008);
  },
  horn(ctx, out, t, r) { // a far-off scooter horn
    const f = 360 + r() * 120, g = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1300; g.gain.value = 1;
    lp.connect(g).connect(out);
    blip(ctx, lp, t, f, f, 0.16, 0.025, 'square');
    if (r() < 0.6) blip(ctx, lp, t + 0.22, f, f, 0.2, 0.025, 'square');
  },
};

/** Schedule one place's ambience between ctx times t0..t1 into `out`. later(t, fn) creates short sounds when they're near. */
function scheduleAmbience(ctx, out, kind, t0, t1, seed, later) {
  const r = rng(seed);
  const every = (sound, min, max, chance = 1) => {
    let k = 0;
    for (let t = t0 + r() * min; t < t1 - 0.3; t += min + r() * (max - min)) {
      const at = t, s = seed * 977 + k++;
      if (r() < chance) later(at, () => SOUNDS[sound](ctx, out, at, rng(s)));
    }
  };
  const wind = (vol) => bed(ctx, out, t0, t1, { type: 'lowpass', f: 420, vol, swell: 0.6, rate: 0.07 });
  const murmur = (vol, f = 650) => bed(ctx, out, t0, t1, { type: 'bandpass', f, q: 0.9, vol, swell: 0.35, rate: 0.23 });
  const room = (vol) => bed(ctx, out, t0, t1, { type: 'lowpass', f: 240, vol });
  switch (kind) {
    case 'birds': wind(0.03); every('bird', 1.4, 4); break;
    case 'forest': wind(0.035); every('bird', 0.8, 2.6); break;
    case 'park': wind(0.025); murmur(0.012, 900); every('bird', 2, 5.5); break;
    case 'waves': bed(ctx, out, t0, t1, { type: 'lowpass', f: 650, vol: 0.035, swell: 0.9, rate: 0.11 }); wind(0.015); break;
    case 'crickets': wind(0.025); every('cricket', 0.35, 1.1); break;
    case 'drone': bed(ctx, out, t0, t1, { type: 'lowpass', f: 140, vol: 0.06, swell: 0.4, rate: 0.05 }); break;
    case 'room': room(0.03); break;
    case 'kitchen': room(0.03); bed(ctx, out, t0, t1, { type: 'highpass', f: 3500, vol: 0.006, swell: 0.5, rate: 0.4 }); every('clink', 3.5, 9, 0.8); break;
    case 'class': room(0.02); murmur(0.018, 700); break;
    case 'hospital': room(0.025); every('beep', 1.5, 1.5); break;
    case 'crowd': murmur(0.035); murmur(0.015, 1400); break;
    case 'street': murmur(0.02); bed(ctx, out, t0, t1, { type: 'lowpass', f: 220, vol: 0.05, swell: 0.4, rate: 0.13 }); every('horn', 5, 14, 0.7); break;
    case 'party': murmur(0.03); murmur(0.012, 1500); break;
  }
}

// ---------- voices ----------
let decodeCtx = null;
const decoder = () => (decodeCtx ??= new OfflineAudioContext(1, 1, 48000));

export const voiceKey = (cast, text, emotion = 'neutral') => JSON.stringify([cast.voice, Math.round(cast.pitch || 0), Math.round(cast.rate || 0), emotion, text.trim(),
  ...(animalMode(cast) ? [cast.type, animalMode(cast)] : []), ...(vocalMode(cast) ? ['vocal', cast.id, cast.type, vocalMode(cast)] : [])]);

// ---------- delivery: how a line is performed ----------
// The emotion nudges the voice: pitch (Hz for an average woman's voice, scaled per voice),
// rate %, loudness, how long natural pauses last (pace), and the intonation shape across
// the phrases of the line (contour: [pitch Hz, rate %] added at the start and at the end).
const EMOTION_VOICE = {
  neutral: { pitch: 0, rate: 0, gain: 1, pace: 1, contour: [[0, 0], [-1, 0]] },
  happy: { pitch: 3, rate: 3, gain: 1.05, pace: 0.95, contour: [[2, 1], [-1, 0]] },
  excited: { pitch: 9, rate: 9, gain: 1.15, pace: 0.75, contour: [[4, 3], [0, 0]] },
  laugh: { pitch: 7, rate: 5, gain: 1.1, pace: 0.85, contour: [[3, 2], [-1, 0]] },
  sad: { pitch: -7, rate: -16, gain: 0.8, pace: 1.4, contour: [[0, 0], [-5, -6]] },
  angry: { pitch: -3, rate: 6, gain: 1.2, pace: 0.8, contour: [[-1, 0], [2, 4]] },
  surprised: { pitch: 11, rate: 3, gain: 1.12, pace: 0.9, contour: [[7, 4], [-2, 0]] },
  scared: { pitch: 6, rate: 10, gain: 0.9, pace: 0.85, contour: [[3, 4], [5, 6]] },
  thinking: { pitch: -3, rate: -14, gain: 0.92, pace: 1.35, contour: [[-1, -6], [1, 2]] },
  calm: { pitch: -3, rate: -9, gain: 0.9, pace: 1.25, contour: [[0, 0], [-3, -3]] },
};

// How far each voice can be pushed. Emotion pitch is in Hz, so deep voices get smaller
// shifts and children bigger ones. Indian-language neural voices crack when pushed hard,
// so their swings are gentler and their sentences get a touch more air.
const CHILD = /AnaNeural|MaisieNeural/;
const MALE = /Guy|Christopher|Eric|Brian|Ryan|Andrew|William|Prabhat|Madhur|Bashkar|Manohar|Niranjan|Valluvar|Mohan|Gagan|Midhun|Salman|Jorge|Henri|Conrad|Diego|Antonio|Dmitry|Hamed|Ardi|Keita|InJoon|Yunxi/;
const INDIC = /^(hi|bn|mr|gu|ta|te|kn|ml|ur|pa|or|as)-IN/;
export function voiceProfile(voice = '') {
  const indic = INDIC.test(voice);
  const pitchK = (CHILD.test(voice) ? 1.3 : MALE.test(voice) ? 0.6 : 1) * (indic ? 0.8 : 1);
  return { pitchK, rateK: indic ? 0.65 : 1, gainK: 1, pauseK: indic ? 1.12 : 1 };
}

// Markup inside a line:  |  short beat,  [0.8]  pause of 0.8 s,  *words*  stressed (slower, a bit higher).
const TOKEN = /(\[\d*\.?\d+\]|\||\*[^*]+\*)/;
const SENTENCE_END = /(?<!\b(?:Mr|Mrs|Ms|Dr|Sr|Jr|St)\.)(?<=(?:\.\.\.|[.!?।…]))\s+(?=\S)/u;

/** The words to show in subtitles (markup removed). */
export const displayText = (text) => String(text || '').replace(/\[\d*\.?\d+\]/g, ' ').replace(/[|*]/g, ' ').replace(/\s+/g, ' ').replace(/\s+([,.!?…।])/g, '$1').trim();

/**
 * Split a line into phrases, each with the pause that follows it. Markup pauses are exact;
 * natural pauses at sentence ends (. ! ? । …) are marked auto so the emotion can pace them.
 */
export function parseDelivery(text) {
  const segs = [];
  for (const tok of String(text || '').split(TOKEN)) {
    if (!tok || !tok.trim()) continue;
    const pause = tok.match(/^\[(\d*\.?\d+)\]$/);
    if (pause || tok === '|') {
      if (segs.length) Object.assign(segs[segs.length - 1], { pause: pause ? Number(pause[1]) : 0.35, auto: false });
      continue;
    }
    const emph = tok.startsWith('*') && tok.endsWith('*');
    const words = (emph ? tok.slice(1, -1) : tok).trim();
    if (!/[\p{L}\p{N}]/u.test(words)) { if (segs.length) segs[segs.length - 1].text += words; continue; }
    // each sentence is its own phrase so it gets its own intonation and breath
    for (const sentence of emph ? [words] : words.split(SENTENCE_END)) {
      if (/[\p{L}\p{N}]/u.test(sentence)) segs.push({ text: sentence.trim(), emph, pause: null, auto: true });
      else if (segs.length) segs[segs.length - 1].text += sentence.trim();
    }
  }
  // a phrase that trails off ("Hmm...") gets a thinking pause
  for (const s of segs) if (s.pause === null) s.pause = /(\.\.\.|…)$/.test(s.text) ? 0.5 : /[.!?।]$/u.test(s.text) ? 0.28 : 0.1;
  return segs;
}

/** Pitch (Hz) and rate (%) for phrase i of n, for this voice and emotion. */
export function phraseProsody(cast, emotion, seg, i, n) {
  const E = EMOTION_VOICE[emotion] || EMOTION_VOICE.neutral, V = voiceProfile(cast.voice);
  const k = n > 1 ? i / (n - 1) : 0; // where in the line we are: 0 start … 1 end
  const [[p0, r0], [p1, r1]] = E.contour;
  const pitch = (E.pitch + p0 + (p1 - p0) * k + (seg.emph ? 5 : 0)) * V.pitchK;
  const rate = (E.rate + r0 + (r1 - r0) * k + (seg.emph ? -14 : 0)) * V.rateK;
  const clamp50 = (v) => Math.max(-50, Math.min(50, Math.round(v)));
  return { pitch: clamp50((cast.pitch || 0) + pitch), rate: clamp50((cast.rate || 0) + rate) };
}

/** Cut the dead air TTS puts before and after speech, keeping a short natural edge. */
function trimSilence(buffer) {
  const d = buffer.getChannelData(0), rate = buffer.sampleRate, thr = 0.012;
  let a = 0, b = d.length - 1;
  while (a < d.length && Math.abs(d[a]) < thr) a++;
  while (b > a && Math.abs(d[b]) < thr) b--;
  return [Math.max(0, a - Math.floor(rate * 0.03)), Math.min(d.length, b + Math.floor(rate * 0.08))];
}

function envelope(buffer) {
  const data = buffer.getChannelData(0), rate = buffer.sampleRate;
  const hop = Math.floor(rate / 100); // 100 values per second
  const n = Math.ceil(data.length / hop), env = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    const end = Math.min(data.length, (i + 1) * hop);
    for (let j = i * hop; j < end; j++) s += data[j] * data[j];
    env[i] = Math.sqrt(s / hop);
  }
  const sorted = Array.from(env).sort((a, b) => a - b);
  const ref = sorted[Math.floor(sorted.length * 0.95)] || 1;
  let v = 0;
  for (let i = 0; i < n; i++) {
    const target = Math.min(1, env[i] / ref);
    v += (target - v) * (target > v ? 0.6 : 0.25); // fast open, softer close
    env[i] = v < 0.08 ? 0 : v;
  }
  return env;
}

// A few voice requests at a time: firing every line of a story at once overloaded the server.
const TTS_AT_ONCE = 6;
let ttsBusy = 0;
const ttsWaiting = [];
async function ttsSlot(fn) {
  if (ttsBusy >= TTS_AT_ONCE) await new Promise((r) => ttsWaiting.push(r));
  ttsBusy++;
  try { return await fn(); } finally { ttsBusy--; ttsWaiting.shift()?.(); }
}

/** Lines that should be spoken: [{ shot, line, cast }] (shot = index in story.shots). */
function spokenLines(story) {
  const castById = Object.fromEntries(story.cast.map((c) => [c.id, c]));
  const out = [];
  story.shots.forEach((sh, shot) => {
    for (const line of sh.lines) {
      const cast = castById[line.castId];
      if (cast && line.text.trim()) out.push({ shot, line, cast });
    }
  });
  return out;
}

export class VoiceLibrary {
  constructor() { this.items = new Map(); this.pending = new Map(); this.clips = new Map(); }

  get(key) { return this.items.get(key); }

  /** One phrase from the server, decoded (cached per voice settings + words). */
  clip(voice, pitch, rate, text) {
    const key = JSON.stringify([voice, pitch, rate, text]);
    if (!this.clips.has(key)) {
      const p = (async () => {
        // leftovers like "!" or "" (after a laugh or a bark was cut out) have nothing to say
        if (!/[\p{L}\p{N}]/u.test(text)) return decoder().createBuffer(1, 480, 48000);
        for (let attempt = 0; ; attempt++) {
          try {
            const bytes = await ttsSlot(async () => {
              const res = await api('/api/tts', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voice, pitch, rate }),
              });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) throw new Error(data.error || `voice failed (${res.status})`);
              const file = await api(data.url);
              if (!file.ok) throw new Error('voice download failed');
              return file.arrayBuffer();
            });
            return await decoder().decodeAudioData(bytes);
          } catch (err) {
            if (attempt >= 3 || /log in/i.test(err.message)) throw err;
            await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt)); // 1, 2, 4 s
          }
        }
      })();
      p.catch(() => this.clips.delete(key));
      this.clips.set(key, p);
    }
    return this.clips.get(key);
  }

  /** Perform a line: emotion-shaped voice, phrase by phrase, joined with exact pauses. */
  async load(cast, text, emotion = 'neutral') {
    const key = voiceKey(cast, text, emotion);
    if (this.items.has(key)) return this.items.get(key);
    if (!this.pending.has(key)) {
      this.pending.set(key, (async () => {
        const E = EMOTION_VOICE[emotion] || EMOTION_VOICE.neutral, V = voiceProfile(cast.voice);
        // animals: sound words ("Woof woof!", "Meow, I'm hungry") become real calls; the rest is spoken
        const animal = animalMode(cast), vocal = vocalMode(cast);
        let segs = !animal ? parseDelivery(text) : parseDelivery(text).flatMap((s) => {
          const pieces = splitCalls(cast.type, s.text);
          if (!pieces) return [s];
          return pieces.map((p, j) => ({ ...s, text: p.text ?? '', calls: p.calls, ...(j < pieces.length - 1 ? { pause: 0.14, auto: false } : {}) }));
        });
        // people: written laughs, gasps, sighs ("Hehe!", "Ha ha ha", "Hmm...", "(laughs)") become real recordings
        if (vocal) segs = segs.flatMap((s) => {
          if (s.calls) return [s];
          const word = s.text.trim();
          const pieces = splitVocals(cast, s.emph && !/\s/.test(word) ? `(${word})` : s.text);
          if (!pieces) return [s];
          return pieces.map((p, j) => ({ ...s, text: p.text ?? '', vocal: p.vocal, tail: p.tail, ...(j < pieces.length - 1 ? { pause: 0.1, auto: false } : {}) }));
        });
        const take = [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
        const silence = () => decoder().createBuffer(1, 480, 48000);
        const parts = await Promise.all(segs.map(async (s, i) => {
          if (s.calls) return (await renderAnimal(cast, s.calls, emotion)) || renderCalls(cast.type, s.calls, emotion);
          if (s.vocal) {
            const b = await renderVocal(cast, s.vocal, (take + i) % 2).catch(() => null);
            if (b) return b;
            // no recording for it: say the words after all (a stage direction stays silent)
            Object.assign(s, { vocal: null, text: /^[([]/.test(s.tail) ? '' : s.tail });
            if (!s.text) return silence();
          }
          const { pitch, rate } = phraseProsody(cast, emotion, s, i, segs.length);
          return this.clip(cast.voice, pitch, rate, s.text);
        }));
        // an emotional line opens with a sound: an animal's call (a meow, a bark, a roar…),
        // or a person's gasp, giggle, sniffle or sigh
        const intro = animal === 'auto' && !segs.some((s) => s.calls) && signatureCalls(cast.type, emotion);
        if (intro) {
          parts.unshift((await renderAnimal(cast, intro, emotion, true)) || (await renderCalls(cast.type, intro, emotion)));
          segs.unshift({ text: '', calls: intro, pause: 0.16, auto: false });
        } else if (!animal && !segs.some((s) => s.vocal)) {
          const v = introVocal(cast, emotion, text, take);
          const b = v && (await renderVocal(cast, v, 0).catch(() => null));
          if (b) {
            parts.unshift(b);
            segs.unshift({ text: '', vocal: v, pause: v.sound === 'gasp' ? 0.08 : 0.18, auto: false });
          }
        }
        const rate = parts[0].sampleRate;
        const ranges = parts.map(trimSilence);
        // markup pauses are exact; natural ones follow the emotion's pace and the voice
        const gaps = segs.map((s, i) => (i < segs.length - 1 ? Math.round(s.pause * (s.auto ? E.pace * V.pauseK : 1) * rate) : 0));
        const total = ranges.reduce((n, [a, b], i) => n + (b - a) + gaps[i], 0);
        const buffer = decoder().createBuffer(1, Math.max(1, total), rate);
        const out = buffer.getChannelData(0);
        let o = 0;
        const marks = []; // when a laugh / gasp / sob plays, so the face and body can show it
        parts.forEach((p, i) => {
          const [a, b] = ranges[i], src = p.getChannelData(0), g = segs[i].emph && !segs[i].vocal ? 1.08 : 1;
          if (segs[i].vocal) marks.push({ start: o / rate, end: (o + b - a) / rate, sound: segs[i].vocal.sound, face: VOCAL_FACE[segs[i].vocal.sound] });
          for (let j = a; j < b; j++) out[o++] = src[j] * g;
          o += gaps[i];
        });
        // match loudness across voices (speech RMS to a common level), then apply the emotion's loudness
        let sum = 0, cnt = 0;
        for (let j = 0; j < out.length; j++) if (Math.abs(out[j]) > 0.02) { sum += out[j] * out[j]; cnt++; }
        const level = cnt ? Math.sqrt(sum / cnt) : 0.1;
        const gain = Math.max(0.5, Math.min(2.5, 0.11 / level)) * E.gain * V.gainK;
        for (let j = 0; j < out.length; j++) {
          const x = out[j] * gain, a = Math.abs(x); // soft knee above 0.85 instead of hard clipping
          out[j] = a > 0.85 ? Math.sign(x) * (0.85 + 0.15 * Math.tanh((a - 0.85) / 0.15)) : x;
        }
        const item = { buffer, env: envelope(buffer), duration: buffer.duration, marks };
        this.items.set(key, item);
        return item;
      })().finally(() => this.pending.delete(key)));
    }
    return this.pending.get(key);
  }

  /** Lines of the story that have no voice yet: [{ shot, line, cast }]. */
  missing(story) {
    return spokenLines(story).filter(({ line, cast }) => !this.items.has(voiceKey(cast, line.text, line.emotion)));
  }

  /**
   * Load every line in the story; returns how many still have no voice. Missing voices don't block,
   * they fall back to timed text. `retries` extra rounds try only the missing lines again, waiting
   * a little longer each time (5 s, 15 s, 30 s, 60 s…) so a hiccup in the voice service passes.
   */
  async prepare(story, onProgress, { retries = 0 } = {}) {
    for (let round = 0; ; round++) {
      const todo = this.missing(story);
      let done = 0, failed = 0;
      onProgress?.(0, todo.length, 0, round);
      await Promise.all(todo.map(async ({ cast, line }) => {
        try { await this.load(cast, line.text, line.emotion); } catch { failed++; }
        onProgress?.(++done, todo.length, failed, round);
      }));
      if (!failed || round >= retries) return failed;
      await new Promise((r) => setTimeout(r, [5, 15, 30, 60][Math.min(round, 3)] * 1000));
    }
  }
}

export function talkAt(item, t) {
  if (!item || t < 0 || t > item.duration) return 0;
  const i = t * 100, a = Math.floor(i), k = i - a;
  const e = item.env;
  return (e[a] || 0) * (1 - k) + (e[a + 1] || 0) * k;
}

// ---------- mixing ----------
// Thousands of notes all created up front make every moment of the render slower (each waiting
// node still costs time), so music and sound effects are created in CHUNK-second batches, just
// before they play: offline by pausing the render at each batch, live with timers.
const CHUNK = 4;
function offlineScheduler(ctx) {
  const buckets = new Map(), end = ctx.length / ctx.sampleRate;
  return (t, fn) => {
    const k = Math.floor(t / CHUNK) * CHUNK;
    if (k <= 0 || k >= end) return fn();
    if (!buckets.has(k)) {
      buckets.set(k, []);
      ctx.suspend(k).then(() => { for (const f of buckets.get(k)) f(); ctx.resume(); });
    }
    buckets.get(k).push(fn);
  };
}
function liveScheduler(ctx, timers) {
  return (t, fn) => {
    const wait = t - ctx.currentTime - 1.5; // build each batch 1.5 s ahead
    if (wait <= 0) fn();
    else timers.push(setTimeout(fn, wait * 1000));
  };
}

function buildMix(ctx, out, timeline, story, voices, from, at, later) {
  const master = ctx.createGain();
  master.gain.value = 1;
  // gentle limiter: loud excited lines get caught instead of clipping
  const limit = ctx.createDynamicsCompressor();
  limit.threshold.value = -3; limit.knee.value = 4; limit.ratio.value = 12; limit.attack.value = 0.002; limit.release.value = 0.12;
  master.connect(limit).connect(out);

  // the place's own sounds (birds, waves, chatter…), quiet, and a little quieter still under dialogue
  const ambience = story.ambience ?? 0.5;
  if (ambience > 0) {
    const amb = ctx.createGain(), level = ambience * 1.6, g = amb.gain;
    amb.connect(master);
    g.setValueAtTime(level, Math.max(ctx.currentTime, at - from));
    for (const line of timeline.lines) {
      const s = at + line.start - from, e = at + line.end - from;
      if (e < ctx.currentTime) continue;
      g.setTargetAtTime(level * 0.6, Math.max(ctx.currentTime, s - 0.2), 0.1);
      g.setTargetAtTime(level, Math.max(ctx.currentTime, e + 0.2), 0.4);
    }
    g.setTargetAtTime(0, Math.max(ctx.currentTime, at + timeline.total - from - 1.2), 0.4);
    const now = ctx.currentTime;
    ambiencePlan(timeline).forEach((cue, i) => {
      if (cue.end + 0.4 <= from) return;
      const t0 = Math.max(now, at + cue.start - from), t1 = at + cue.end - from + 0.4;
      const cg = ctx.createGain();
      cg.connect(amb);
      cg.gain.setValueAtTime(0, t0);
      cg.gain.linearRampToValueAtTime(1, t0 + (i === 0 || from > cue.start ? 0.05 : 0.4));
      cg.gain.setValueAtTime(1, Math.max(t0 + 0.4, t1 - 0.4));
      cg.gain.linearRampToValueAtTime(0, Math.max(t0 + 0.5, t1));
      scheduleAmbience(ctx, cg, cue.kind, t0, t1, 17 + i * 31, later);
    });
  }

  if (story.music !== 'none') {
    const music = ctx.createGain();
    const base = (story.musicVolume ?? 0.6) * 0.4; // background music: present, but never on top of the story
    music.connect(master);
    const g = music.gain;
    g.setValueAtTime(base, Math.max(ctx.currentTime, at - from));
    // duck under dialogue
    for (const line of timeline.lines) {
      const s = at + line.start - from, e = at + line.end - from;
      if (e < ctx.currentTime) continue;
      g.setTargetAtTime(base * 0.3, Math.max(ctx.currentTime, s - 0.2), 0.08);
      g.setTargetAtTime(base, Math.max(ctx.currentTime, e + 0.15), 0.3);
    }
    const endAt = at + timeline.total - from;
    g.setTargetAtTime(0, Math.max(ctx.currentTime, endAt - 1.5), 0.4);
    // one shared reverb; each cue fades in on its first shot and crossfades out into the next
    const dry = ctx.createGain(), wet = ctx.createGain(), bus = ctx.createGain();
    dry.gain.value = 0.8; wet.gain.value = 0.35;
    dry.connect(music);
    wet.connect(reverb(ctx)).connect(music);
    bus.connect(dry); bus.connect(wet);
    const cues = musicPlan(story, timeline);
    const now = ctx.currentTime, FADE = 0.9;
    cues.forEach((cue, i) => {
      const last = i === cues.length - 1;
      const tail = last ? 0.5 : FADE + 0.2; // keep playing a moment past the cut for the crossfade
      if (cue.end + tail <= from) return;
      const zero = at + cue.start - from, endT = at + cue.end - from;
      const cg = ctx.createGain();
      cg.connect(bus);
      if (i === 0 || from > cue.start) cg.gain.setValueAtTime(1, now);
      else { cg.gain.setValueAtTime(0, zero); cg.gain.linearRampToValueAtTime(1, zero + 0.35); }
      if (!last) { cg.gain.setValueAtTime(1, Math.max(now, endT)); cg.gain.linearRampToValueAtTime(0, Math.max(now, endT) + FADE); }
      // in short windows, each created just before it plays (see later)
      const songTo = cue.end - cue.start + tail;
      for (let w = Math.max(0, from - cue.start); w < songTo; w += CHUNK) {
        const a = w, b = Math.min(songTo, w + CHUNK);
        later(zero + a, () => scheduleMusic(ctx, cg, cue.style, a, b, zero));
      }
    });
  }

  for (const line of timeline.lines) {
    const item = voices.get(line.voiceKey);
    if (!item || line.end < from) continue;
    const src = ctx.createBufferSource();
    src.buffer = item.buffer;
    const g = ctx.createGain();
    g.gain.value = 1.15;
    src.connect(g).connect(master);
    const offset = Math.max(0, from - line.start);
    src.start(at + Math.max(0, line.start - from), offset);
  }
  return master;
}

/** Live playback starting at story time `from`. Returns stop(). */
export function playStory(ctx, timeline, story, voices, from) {
  const at = ctx.currentTime + 0.06;
  const timers = [];
  const master = buildMix(ctx, ctx.destination, timeline, story, voices, from, at, liveScheduler(ctx, timers));
  return () => {
    timers.forEach(clearTimeout);
    try { master.disconnect(); } catch { /* already stopped */ }
  };
}

/** Render the full soundtrack offline and return a WAV Blob. */
export async function renderSoundtrack(timeline, story, voices) {
  const rate = 48000;
  const ctx = new OfflineAudioContext(2, Math.ceil(rate * (timeline.total + 0.5)), rate);
  buildMix(ctx, ctx.destination, timeline, story, voices, 0, 0, offlineScheduler(ctx));
  const buffer = await ctx.startRendering();
  return encodeWav(buffer);
}

function encodeWav(buffer) {
  const ch = buffer.numberOfChannels, len = buffer.length, rate = buffer.sampleRate;
  const out = new DataView(new ArrayBuffer(44 + len * ch * 2));
  const str = (o, s) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF'); out.setUint32(4, 36 + len * ch * 2, true); str(8, 'WAVE');
  str(12, 'fmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true);
  out.setUint32(24, rate, true); out.setUint32(28, rate * ch * 2, true); out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true);
  str(36, 'data'); out.setUint32(40, len * ch * 2, true);
  const chans = Array.from({ length: ch }, (_, i) => buffer.getChannelData(i));
  let o = 44;
  for (let i = 0; i < len; i++) for (let c = 0; c < ch; c++) {
    const v = Math.max(-1, Math.min(1, chans[c][i]));
    out.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true);
    o += 2;
  }
  return new Blob([out], { type: 'audio/wav' });
}
