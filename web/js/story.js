// Story data model: cast + shots + dialogue, validation, starter story and timing.
import { SPECIES, ACTIONS, EMOTIONS, OUTFITS } from './engine/characters.js';
import { WORLDS } from './engine/worlds.js';
import { MUSIC, SHOT_MUSIC, voiceKey, displayText } from './engine/audio.js';
import { ANIMAL_SOUNDS } from './engine/animals.js';
import { VOCAL_SOUNDS } from './engine/vocals.js';
import { PROPS } from './engine/props.js';
import { GESTURES, lineGestures } from './engine/gestures.js';

export const CAMERAS = {
  auto: 'Auto (film cuts to whoever talks)',
  wide: 'Wide shot',
  closeup: 'Close-up',
  orbit: 'Slow orbit',
  push: 'Slow push-in',
  pan: 'Pan across',
  low: 'Low hero angle',
};
export const ENTRANCES = { none: 'Already there', 'walk-left': 'Walks in from left', 'walk-right': 'Walks in from right', 'run-left': 'Runs in from left', 'run-right': 'Runs in from right' };
export const EXITS = { none: 'Stays', 'walk-left': 'Walks out left', 'walk-right': 'Walks out right', 'run-left': 'Runs out left', 'run-right': 'Runs out right' };
export const TRANSITIONS = { cut: 'Cut', fade: 'Fade through black' };
// Time of day changes the light (warm morning, golden evening, blue night) so a jump in time shows on screen.
export const TIMES = { auto: 'As the place looks', morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Night' };
// A time card ("Day 2", "Next morning", "One week later") pops up at the start of the shot, then stays small in the corner.
export const CARD_TIME = 1.6; // seconds the big card holds the screen before anyone talks
export const FORMATS = { '16:9': [1920, 1080], '9:16': [1080, 1920], '1:1': [1080, 1080] };
export const FORMAT_LABELS = { '16:9': '16:9 YouTube', '9:16': '9:16 Shorts / Reels', '1:1': '1:1 Square' };
export { SPECIES, ACTIONS, EMOTIONS, WORLDS, MUSIC, SHOT_MUSIC, ANIMAL_SOUNDS, VOCAL_SOUNDS, PROPS, OUTFITS, GESTURES, lineGestures };

export const uid = () => Math.random().toString(36).slice(2, 9);
const pick = (dict, v, fallback) => (v in dict ? v : fallback);
const num = (v, lo, hi, d) => { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };
const hex = (v, d) => (/^#[0-9a-f]{6}$/i.test(v || '') ? v : d);

export function newCast(type = 'bunny', name) {
  const sp = SPECIES[type];
  const voices = { boy: ['en-US-AnaNeural', -18, 0], girl: ['en-US-AnaNeural', 6, 0], bunny: ['en-GB-MaisieNeural', 10, 5], bear: ['en-US-ChristopherNeural', -8, -8], cat: ['en-US-AriaNeural', 8, 0], puppy: ['en-US-EricNeural', 12, 8], robo: ['en-US-GuyNeural', -4, -5],
    narrator: ['hi-IN-MadhurNeural', -4, -12], fox: ['en-US-AriaNeural', 4, 5], panda: ['en-US-GuyNeural', 4, -6], mouse: ['en-GB-MaisieNeural', 25, 10], lion: ['en-US-ChristopherNeural', -12, -5],
    monkey: ['en-US-EricNeural', 15, 12], pig: ['en-US-AnaNeural', 12, 5], elephant: ['en-US-BrianNeural', -6, -10], koala: ['en-US-EmmaNeural', 6, -8],
    baby: ['en-US-AnaNeural', 25, -10], man: ['en-IN-PrabhatNeural', 0, 0], woman: ['en-IN-NeerjaNeural', 0, 0],
    grandpa: ['hi-IN-MadhurNeural', -8, -15], grandma: ['hi-IN-SwaraNeural', -6, -15], pandit: ['hi-IN-MadhurNeural', -6, -12] };
  const [voice, pitch, rate] = voices[type] || voices.bunny;
  return { id: uid(), name: name || sp.label.split(' ')[0], type, color: sp.color, accent: sp.accent, hair: sp.hair || '#5a3620', eyes: sp.eyes,
    outfit: sp.outfit && OUTFITS[sp.outfit] ? sp.outfit : '', voice, pitch, rate,
    ...(sp.kind === 'animal' ? { animalSounds: 'auto' } : {}), ...(sp.kind === 'human' ? { vocalSounds: 'auto' } : {}) };
}

export function newShot(castIds = [], world = 'meadow') {
  const n = castIds.length;
  return {
    id: uid(), world, camera: 'auto', transition: 'cut', minDuration: 4, music: 'auto', time: 'auto', card: '',
    actors: castIds.map((castId, i) => ({ castId, x: n === 1 ? 0 : -1.6 + (3.2 * i) / Math.max(1, n - 1), z: 0, action: 'idle', mood: 'happy', holds: 'none', enter: 'none', exit: 'none' })),
    props: [],
    lines: [],
  };
}

export function starterStory() {
  const bella = { ...newCast('bunny', 'Bella'), id: 'bella' };
  const leo = { ...newCast('boy', 'Leo'), id: 'leo' };
  const bruno = { ...newCast('bear', 'Grandpa Bruno'), id: 'bruno', accent: '#e8a33d' };
  return {
    title: 'The Missing Carrot',
    aspect: '16:9',
    music: 'happy',
    musicVolume: 0.6,
    musicMood: true,
    ambience: 0.5,
    subtitles: true,
    titleCard: true,
    cast: [bella, leo, bruno],
    shots: [
      {
        id: uid(), world: 'meadow', camera: 'auto', transition: 'fade', minDuration: 4,
        actors: [
          { castId: 'bella', x: -0.9, z: 0, action: 'sad', mood: 'sad', holds: 'none', enter: 'none', exit: 'none' },
          { castId: 'leo', x: 1.0, z: 0.2, action: 'idle', mood: 'happy', holds: 'none', enter: 'walk-right', exit: 'none' },
        ],
        props: [],
        lines: [
          { id: uid(), castId: 'bella', emotion: 'sad', text: 'Oh no... my carrot is gone!' },
          { id: uid(), castId: 'leo', emotion: 'surprised', text: "Gone? Don't worry, Bella." },
          { id: uid(), castId: 'leo', emotion: 'happy', text: "We'll find it together!" },
          { id: uid(), castId: 'bella', emotion: 'excited', text: 'Really? Thank you, Leo!' },
        ],
      },
      {
        id: uid(), world: 'forest', camera: 'auto', transition: 'fade', minDuration: 4,
        actors: [
          { castId: 'leo', x: -0.8, z: 0, action: 'think', mood: 'thinking', holds: 'none', enter: 'walk-left', exit: 'none' },
          { castId: 'bella', x: 0.9, z: 0.2, action: 'point', mood: 'surprised', holds: 'none', enter: 'walk-left', exit: 'none' },
        ],
        props: [],
        lines: [
          { id: uid(), castId: 'leo', emotion: 'thinking', text: 'Hmm... these little footprints go this way.' },
          { id: uid(), castId: 'bella', emotion: 'surprised', text: 'Look! Someone is coming!' },
        ],
      },
      {
        id: uid(), world: 'forest', camera: 'auto', transition: 'cut', minDuration: 5,
        actors: [
          { castId: 'bruno', x: 0, z: -0.6, action: 'laugh', mood: 'happy', holds: 'carrot', enter: 'none', exit: 'none' },
          { castId: 'bella', x: -1.6, z: 0.3, action: 'cheer', mood: 'excited', holds: 'none', enter: 'none', exit: 'none' },
          { castId: 'leo', x: 1.6, z: 0.3, action: 'clap', mood: 'happy', holds: 'none', enter: 'none', exit: 'none' },
        ],
        props: [],
        lines: [
          { id: uid(), castId: 'bruno', emotion: 'laugh', text: 'Ho ho ho! Is this what you are looking for?' },
          { id: uid(), castId: 'bella', emotion: 'excited', text: 'My carrot! Yay!' },
          { id: uid(), castId: 'leo', emotion: 'happy', text: 'Mystery solved!' },
        ],
      },
    ],
  };
}

export function normalizeStory(input) {
  const base = starterStory();
  const s = input && typeof input === 'object' ? input : base;
  const cast = (Array.isArray(s.cast) ? s.cast : base.cast).slice(0, 20).map((c) => {
    const type = pick(SPECIES, c.type, 'bunny');
    const d = newCast(type);
    return {
      id: String(c.id || uid()), name: String(c.name || d.name).slice(0, 30), type,
      color: hex(c.color, d.color), accent: hex(c.accent, d.accent), hair: hex(c.hair, d.hair), eyes: hex(c.eyes, d.eyes),
      outfit: d.outfit ? pick(OUTFITS, c.outfit, d.outfit) : '',
      voice: String(c.voice || d.voice), pitch: num(c.pitch, -50, 50, d.pitch), rate: num(c.rate, -50, 50, d.rate),
      ...(SPECIES[type].kind === 'animal' ? { animalSounds: pick(ANIMAL_SOUNDS, c.animalSounds, 'auto') } : {}),
      ...(SPECIES[type].kind === 'human' ? { vocalSounds: pick(VOCAL_SOUNDS, c.vocalSounds, 'auto') } : {}),
    };
  });
  const ids = new Set(cast.map((c) => c.id));
  const shots = (Array.isArray(s.shots) && s.shots.length ? s.shots : base.shots).slice(0, 60).map((sh) => ({
    id: String(sh.id || uid()),
    world: pick(WORLDS, sh.world, 'meadow'),
    camera: pick(CAMERAS, sh.camera, 'auto'),
    transition: pick(TRANSITIONS, sh.transition, 'cut'),
    minDuration: num(sh.minDuration, 1, 60, 4),
    music: pick(SHOT_MUSIC, sh.music, 'auto'),
    time: pick(TIMES, sh.time, 'auto'),
    card: String(sh.card || '').trim().slice(0, 40),
    actors: (sh.actors || []).filter((a) => ids.has(a.castId)).slice(0, 8).map((a) => ({
      castId: a.castId, x: num(a.x, -5, 5, 0), z: num(a.z, -4, 3, 0),
      action: pick(ACTIONS, a.action, 'idle'), mood: pick(EMOTIONS, a.mood, 'happy'), holds: pick(PROPS, a.holds, 'none'),
      enter: pick(ENTRANCES, a.enter, 'none'), exit: pick(EXITS, a.exit, 'none'),
    })),
    props: (sh.props || []).slice(0, 10).map((p) => ({ kind: pick(PROPS, p.kind, 'ball'), x: num(p.x, -5, 5, 0), z: num(p.z, -4, 3, 0) })).filter((p) => p.kind !== 'none'),
    lines: (sh.lines || []).filter((l) => ids.has(l.castId)).slice(0, 40).map((l) => ({
      id: String(l.id || uid()), castId: l.castId, emotion: pick(EMOTIONS, l.emotion, 'happy'), text: String(l.text || '').slice(0, 300),
      ...(l.pause !== undefined && l.pause !== null && l.pause !== '' ? { pause: num(l.pause, 0, 5, 0) } : {}),
      ...(l.gesture && l.gesture !== 'auto' ? { gesture: pick(GESTURES, l.gesture, 'auto') } : {}),
    })),
  }));
  return {
    title: String(s.title ?? base.title).slice(0, 80),
    aspect: pick(FORMATS, s.aspect, '16:9'),
    music: pick(MUSIC, s.music, 'happy'),
    musicVolume: num(s.musicVolume, 0, 1, 0.6),
    musicMood: s.musicMood !== false,
    ambience: num(s.ambience, 0, 1, 0.5),
    subtitles: s.subtitles !== false,
    titleCard: s.titleCard !== false,
    cast, shots,
  };
}

// ---------- timing ----------
export const WALK_SPEED = 1.3, RUN_SPEED = 3.4, OFFSTAGE = 4.2;
const LINE_LEAD = 0.5, SHOT_TAIL = 0.9;

/** Where an entering/leaving character starts or ends: just outside the frame on that side. */
export function offstageX(actor, mode) {
  return actor.x + (mode.endsWith('left') ? -OFFSTAGE : OFFSTAGE);
}

export function travelTime(actor, which) {
  const mode = which === 'enter' ? actor.enter : actor.exit;
  if (!mode || mode === 'none') return 0;
  const speed = mode.startsWith('run') ? RUN_SPEED : WALK_SPEED;
  return OFFSTAGE / speed;
}

/**
 * Silence before a line, like real conversation: a quick comeback after a question or an
 * excited line, a longer beat before sad or thoughtful replies. line.pause overrides it.
 */
function gapBefore(prev, line) {
  if (line.pause !== undefined && line.pause !== null) return line.pause;
  if (!prev) return 0;
  let g = prev.castId === line.castId ? 0.32 : 0.48;
  if (/\?\s*$/.test(displayText(prev.text))) g -= 0.12;
  if (['excited', 'surprised', 'angry', 'scared', 'laugh'].includes(line.emotion)) g -= 0.12;
  if (['sad', 'thinking', 'calm'].includes(line.emotion)) g += 0.3;
  if (['sad', 'thinking'].includes(prev.emotion)) g += 0.15;
  return Math.max(0.12, g);
}

/** Lay every shot and line on one clock. Voice durations come from the loaded audio. */
export function computeTimeline(story, voices) {
  const castById = Object.fromEntries(story.cast.map((c) => [c.id, c]));
  const shots = [], lines = [];
  let clock = 0;
  for (const [index, shot] of story.shots.entries()) {
    let t = LINE_LEAD + (shot.card ? CARD_TIME : 0), prev = null;
    const shotLines = [];
    for (const line of shot.lines) {
      const cast = castById[line.castId];
      if (!cast || !line.text.trim()) continue;
      t += gapBefore(prev, line);
      const key = voiceKey(cast, line.text, line.emotion);
      const item = voices?.get(key);
      const dur = item ? item.duration : Math.max(1.2, displayText(line.text).split(/\s+/).length / 2.6);
      const entry = { ...line, voiceKey: key, start: clock + t, end: clock + t + dur, localStart: t, localEnd: t + dur, shotIndex: index };
      shotLines.push(entry);
      lines.push(entry);
      t += dur;
      prev = line;
    }
    const enterMax = Math.max(0, ...shot.actors.map((a) => travelTime(a, 'enter')));
    const exitMax = Math.max(0, ...shot.actors.map((a) => travelTime(a, 'exit')));
    const talkEnd = shotLines.length ? t + SHOT_TAIL : 0;
    const duration = Math.max(shot.minDuration, talkEnd, enterMax + 1.5) + exitMax;
    shots.push({ index, shot, start: clock, end: clock + duration, duration, lines: shotLines });
    clock += duration;
  }
  return { shots, lines, total: Math.max(clock, 1) };
}
