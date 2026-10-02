// Real recorded sounds (web/sounds, CC0 recordings from Freesound): laughs, giggles, gasps, sobs,
// sighs, yawns for people, and real calls for animals. "Hehe!", "Ha ha ha", "हीही", "Hmm...",
// "(laughs)" become an actual laugh instead of the voice reading the letters out, and an
// emotional line can open with a matching sound (a gasp when surprised, a sniffle when sad…).
// Each sound is pitched to the character, and a character keeps reaching for the same laugh,
// so it feels like *their* laugh.

export const VOCAL_SOUNDS = {
  auto: 'Real laughs, gasps & sighs (also on emotional lines)',
  words: 'Only where written (Hehe, Ha ha, Hmm, (laughs)…)',
  off: 'Off (the voice reads the words)',
};

// ---------- who sounds like what ----------
const GROUP = { baby: 'baby', boy: 'kid', girl: 'kid', woman: 'woman', grandma: 'woman', man: 'man', grandpa: 'man', pandit: 'man', narrator: 'man' };
// When a group has no recording of a sound, borrow another group's, pitched toward this one.
const BORROW = { kid: [['woman', 1.12]], baby: [['kid', 1.12], ['woman', 1.25]], woman: [['kid', 0.9]], man: [] };
// Base pitch shift in semitones: boys a touch lower than girls, grandparents lower and slower.
const TYPE_SHIFT = { boy: -0.8, girl: 0.6, grandpa: -1.2, grandma: -1, baby: 0.5 };

// Talking animals laugh and gasp like the voice they speak with (a child, a woman, a man).
const ANIMALS = new Set(['bunny', 'bear', 'cat', 'puppy', 'fox', 'panda', 'mouse', 'lion', 'monkey', 'pig', 'elephant', 'koala']);
const CHILD_VOICE = /AnaNeural|MaisieNeural/;
const MALE_VOICE = /Guy|Christopher|Eric|Brian|Ryan|Andrew|William|Prabhat|Madhur|Bashkar|Manohar|Niranjan|Valluvar|Mohan|Gagan|Midhun|Salman|Jorge|Henri|Conrad|Diego|Antonio|Dmitry|Hamed|Ardi|Keita|InJoon|Yunxi/;
export function vocalGroup(cast) {
  if (GROUP[cast?.type]) return GROUP[cast.type];
  if (!ANIMALS.has(cast?.type)) return null;
  return CHILD_VOICE.test(cast.voice) ? 'kid' : MALE_VOICE.test(cast.voice) ? 'man' : 'woman';
}
/**
 * 'auto' | 'words' | null (null: no real vocal sounds for this character). Animals only turn
 * written laughs into real ones; their emotional lines open with their own call instead.
 */
export function vocalMode(cast) {
  if (!vocalGroup(cast)) return null;
  if (ANIMALS.has(cast.type)) return cast.animalSounds === 'off' ? null : 'words';
  return cast.vocalSounds === 'off' ? null : cast.vocalSounds === 'words' ? 'words' : 'auto';
}

// ---------- finding the sounds in a line ----------
// A laugh written out: "Hehe", "Hehehe", "Hee hee", "Ha ha ha", "Haha", "Ho ho ho", "हीही", "हा हा", "हेहे"…
const LAUGH_SYL = /^(?:h+[aeiou]+h*)+$|^(?:हा|ही|हे|हो|हि|हु)+$/u;
// Single words that are a sound, not speech. `only` = the voice groups where it's a sound.
const WORDS = [
  [/^h+m+$|^h+m+m+$|^m+h*m+$|^ह+म्+म*$|^हम्म+$|^उम्म+$|^hmmm*$/u, 'hmm'],
  [/^sniff+$|^snif+$|^sob+$|^सुबक$/u, 'sniff'],
  [/^a+w+$|^a+w+w+$/u, 'aww'],
  [/^y+a+y+$|^yippee+$|^wo+h+o+$|^woo+$/u, 'yay', ['kid', 'baby']],
  [/^w+a+a+h+$|^wa+h+$|^boo+hoo+$|^ऊँ+ऊँ+$|^उँ+हुँ+$/u, 'cry'],
  [/^a{3,}h*$|^a+h{3,}$|^आ{2,}$/u, 'scream'],
  [/^h+u+m+p+h+$|^h+m+p+h+$|^u+g+h+$|^h+m+p+f*$|^grr+$/u, 'angry'],
  [/^gasp$/u, 'gasp'],
  [/^o+o+h+$|^o{3,}h*$|^ऊ+ह+$/u, 'ooh', ['kid', 'woman', 'man']],
  [/^yawn+$|^ya+w+n+$/u, 'yawn'],
];
// Stage directions in brackets: "(laughs)", "(giggles)", "(sighs)"…
const STAGE = [
  [/^(laughs?|laughing|chuckles?|हँसता|हँसती|हंसते)$/u, 'laugh'], [/^(giggles?|giggling)$/u, 'giggle'],
  [/^(gasps?|gasping)$/u, 'gasp'], [/^(sighs?|sighing)$/u, 'sigh'], [/^(cries|crying|cry|sobs?|sobbing|रोता|रोती)$/u, 'cry'],
  [/^(sniffs?|sniffles?|sniffling)$/u, 'sniff'], [/^(screams?|screaming|shrieks?)$/u, 'scream'], [/^(yawns?|yawning)$/u, 'yawn'],
  [/^(hmm+|thinks|thinking)$/u, 'hmm'], [/^(grunts?|huffs?|hmph)$/u, 'angry'], [/^(cheers?|yay)$/u, 'yay'],
];

const clean = (w) => w.toLowerCase().replace(/[^\p{L}\p{M}]/gu, '');

/** The sound for one word or a run of words ("Ha ha ha", "Hehe", "Hmm"), or null for real speech. */
function wordSound(group, chunk) {
  const raw = chunk.trim();
  const stage = raw.match(/^[([](.+?)[)\]]$/);
  if (stage) {
    const w = clean(stage[1]);
    const hit = STAGE.find(([re]) => re.test(w));
    return hit ? { sound: hit[1], n: 3 } : null;
  }
  const words = raw.split(/[\s,-]+/).map(clean).filter(Boolean);
  if (!words.length) return null;
  // a laugh: every word made of ha/he/hi/ho syllables, and at least two syllables in all
  if (words.every((w) => LAUGH_SYL.test(w))) {
    const syl = words.reduce((n, w) => n + (w.match(/[aeiou]+|[ाीेोिु]/gu) || []).length, 0);
    if (syl >= 2) {
      const ho = words.every((w) => /^(h+o+)+$|^(हो)+$/u.test(w));
      return { sound: ho ? 'hoho' : syl >= 3 ? 'laugh' : 'giggle', n: syl };
    }
    return null;
  }
  let found = null;
  for (const w of words) {
    const hit = WORDS.find(([re, , only]) => re.test(w) && (!only || only.includes(group)));
    if (!hit || (found && found !== hit[1])) return null;
    found = hit[1];
  }
  return found ? { sound: found, n: words.length } : null;
}

/**
 * Split a phrase into sounds and speech at commas and sentence breaks:
 * "Ha ha! Okay... just one dance!" → laugh, then "Okay... just one dance!".
 * Returns [{ vocal } | { text }], or null when the phrase has no sounds in it.
 */
export function splitVocals(cast, text) {
  const group = vocalGroup(cast);
  if (!group) return null;
  // pieces: bracketed stage directions, or runs of words ending at , ! ? . … ।
  const pieces = String(text).match(/[([][^)\]]*[)\]]|[^,!?.…।([]+[,!?.…।]*/gu) || [];
  const parts = [];
  for (const piece of pieces) {
    if (!piece.trim()) continue;
    const v = wordSound(group, piece.replace(/[,!?.…।]+$/u, ''));
    const last = parts.at(-1);
    if (v && last?.vocal?.sound === v.sound) Object.assign(last, { vocal: { ...v, n: last.vocal.n + v.n }, tail: `${last.tail} ${piece.trim()}` });
    else if (v) parts.push({ vocal: v, tail: piece.trim() });
    else if (last && last.text !== undefined) last.text += piece;
    else parts.push({ text: piece });
  }
  if (!parts.some((p) => p.vocal)) return null;
  return parts.map((p) => (p.text !== undefined ? { text: p.text.trim() } : p)).filter((p) => p.vocal || /[\p{L}\p{N}]/u.test(p.text));
}

// The sound an emotional line opens with (auto mode). Some only now and then, so it doesn't get samey.
const INTRO = {
  laugh: { sound: 'giggle', every: 1 }, surprised: { sound: 'gasp', every: 1 }, scared: { sound: 'gasp', every: 1 },
  sad: { sound: 'sadIntro', every: 2 }, angry: { sound: 'angry', every: 2 }, thinking: { sound: 'hmm', every: 2 },
};
/** The sound that opens a line of this emotion, or null. `seed` decides the "now and then" ones. */
export function introVocal(cast, emotion, text, seed) {
  if (vocalMode(cast) !== 'auto') return null;
  const I = INTRO[emotion];
  if (!I || seed % I.every) return null;
  const group = vocalGroup(cast);
  // already starts with a sound word of its own ("Hmm...", "Oh!"): leave it
  if (/^\s*[([]|^\s*(oh+|o+h|wow|hmm+|ah+|uh+|ugh|hey|whoa|ओह|अरे|हम्म|आह|वाह|उफ़?|हाय)(?=[\s,!?.…।-]|$)/iu.test(text)) return null;
  const sound = I.sound === 'sadIntro' ? (group === 'kid' || group === 'baby' ? 'sniff' : 'sigh') : I.sound;
  return { sound, n: 1 };
}

// ---------- the recordings ----------
// Which recorded categories can play each sound, per group, in order of preference.
const CATS = {
  laugh: { baby: ['baby_laugh'], kid: ['kid_laugh'], woman: ['woman_laugh'], man: ['man_laugh'] },
  giggle: { baby: ['baby_laugh'], kid: ['kid_giggle', 'kid_laugh'], woman: ['woman_giggle'], man: ['man_chuckle', 'man_laugh'] },
  hoho: { baby: ['baby_laugh'], kid: ['kid_laugh'], woman: ['woman_laugh'], man: ['man_hoho', 'man_laugh'] },
  gasp: { baby: ['baby_coo'], kid: ['kid_gasp'], woman: ['woman_gasp'], man: ['man_gasp'] },
  scream: { baby: ['baby_cry'], kid: ['kid_scream'], woman: ['woman_scream'], man: ['man_scream'] },
  cry: { baby: ['baby_cry'], kid: ['kid_cry'], woman: ['woman_cry'], man: ['man_cry'] },
  sniff: { baby: ['baby_cry'], kid: ['kid_sniff'], woman: ['kid_sniff'], man: ['kid_sniff'] },
  sigh: { kid: ['kid_sigh'], woman: ['woman_sigh'], man: ['man_sigh'] },
  hmm: { kid: [], woman: ['woman_hmm'], man: ['man_hmm'] },
  aww: { kid: ['kid_aww'], woman: ['woman_aww'], man: [] },
  yay: { baby: ['baby_laugh'], kid: ['kid_yay'] },
  angry: { kid: ['kid_angry'], woman: ['woman_angry'], man: ['man_angry'] },
  ooh: { kid: [], woman: ['woman_ooh'], man: ['man_ooh'] },
  yawn: { kid: ['kid_yawn'], woman: ['woman_yawn'], man: ['man_yawn'] },
};
// How each sound shows on the face while it plays.
export const VOCAL_FACE = {
  laugh: 'laugh', giggle: 'laugh', hoho: 'laugh', gasp: 'surprised', ooh: 'surprised', scream: 'scared',
  cry: 'sad', sniff: 'sad', sigh: 'sad', hmm: 'thinking', aww: 'happy', yay: 'excited', angry: 'angry', yawn: 'calm',
};

let manifestP = null;
export function soundManifest() {
  manifestP ??= fetch('/sounds/manifest.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
  return manifestP;
}

let decodeCtx = null;
const decoder = () => (decodeCtx ??= new OfflineAudioContext(1, 1, 48000));
const files = new Map();
function sample(path) {
  if (!files.has(path)) {
    const p = fetch(`/sounds/${path}`).then((r) => { if (!r.ok) throw new Error(`missing ${path}`); return r.arrayBuffer(); })
      .then((b) => decoder().decodeAudioData(b));
    p.catch(() => files.delete(path));
    files.set(path, p);
  }
  return files.get(path);
}

const hash = (s) => [...String(s)].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);

/** The recording for a sound in this character's voice group: { path, rate } or null. */
async function chooseFile(group, sound, who, variant) {
  const manifest = await soundManifest();
  const tries = [[group, 1], ...(BORROW[group] || [])];
  for (const [g, rate] of tries) {
    for (const cat of CATS[sound]?.[g] || []) {
      const list = manifest[cat];
      if (!list?.length) continue;
      // each character has a favourite take (their laugh), and now and then uses the next one
      const i = (hash(`${who}|${cat}`) + variant) % list.length;
      return { path: `${cat}/${list[i]}`, rate };
    }
  }
  return null;
}

/** Copy a recording at a new speed/pitch (rate 1.1 = 10% faster and higher), levelled to sit with speech. */
async function resample(buffer, rate, level = 0.1) {
  const len = Math.ceil(buffer.length / rate) + 64;
  const ctx = new OfflineAudioContext(1, len, 48000);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.playbackRate.value = rate;
  src.connect(ctx.destination);
  src.start();
  const out = await ctx.startRendering();
  const d = out.getChannelData(0);
  let peak = 0, sum = 0, n = 0;
  for (const x of d) { const a = Math.abs(x); peak = Math.max(peak, a); if (a > 0.01) { sum += x * x; n++; } }
  const rms = n ? Math.sqrt(sum / n) : 0;
  const gain = rms ? Math.min(level / rms, 0.9 / peak) : 1;
  for (let i = 0; i < d.length; i++) d[i] *= gain;
  return out;
}

const cache = new Map();
/**
 * A person's sound (laugh, gasp, sigh…) as a mono 48 kHz AudioBuffer, pitched to the character.
 * Resolves to null when there's no recording for it (the words are spoken instead).
 */
export function renderVocal(cast, vocal, variant = 0) {
  const group = vocalGroup(cast);
  const key = JSON.stringify([cast.id, cast.type, cast.pitch, vocal.sound, vocal.n, variant]);
  if (!cache.has(key)) {
    const p = (async () => {
      const pick = await chooseFile(group, vocal.sound, cast.id || cast.name, variant);
      if (!pick) return null;
      const buffer = await sample(pick.path);
      // pitch: the type's base, a nudge from the voice pitch slider, and a little per-character colour
      const semis = (TYPE_SHIFT[cast.type] || 0) + Math.max(-1.5, Math.min(1.5, (cast.pitch || 0) / 25)) + ((hash(cast.id || cast.name) % 7) - 3) * 0.15;
      const rate = pick.rate * 2 ** (semis / 12);
      // a short written laugh ("Hehe") gets a shorter take
      const keep = vocal.sound === 'giggle' && vocal.n <= 2 ? 1.1 : vocal.sound === 'laugh' && vocal.n <= 4 ? 1.9 : Infinity;
      const loud = { scream: 0.13, laugh: 0.1, hoho: 0.11, gasp: 0.09, sigh: 0.075, sniff: 0.07, hmm: 0.085 }[vocal.sound] || 0.09;
      const out = await resample(buffer, rate, loud);
      return keep < out.duration ? fadeTo(out, keep) : out;
    })();
    p.catch(() => cache.delete(key));
    cache.set(key, p);
  }
  return cache.get(key);
}

/** Shorten a buffer to `seconds`, fading the end out. */
function fadeTo(buffer, seconds) {
  const n = Math.floor(seconds * buffer.sampleRate), fade = Math.floor(0.18 * buffer.sampleRate);
  const out = decoder().createBuffer(1, n, buffer.sampleRate);
  const src = buffer.getChannelData(0), d = out.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = src[i] * Math.min(1, (n - i) / fade);
  return out;
}

// ---------- animals ----------
// Real calls per species. Calls from animals.js (meow, bark…) map to recorded categories here;
// species without a recording (koala's bellow, a howl) keep the synthesized call.
const ANIMAL_CATS = {
  meow: 'cat_meow', purr: 'cat_purr', hiss: 'cat_hiss', bark: 'dog_bark', yip: 'fox_yip', growl: 'dog_growl', roar: 'lion_roar',
  oink: 'pig_oink', squeak: 'mouse_squeak', squee: 'bunny_squeak', sniff: 'bunny_sniff', trumpet: 'elephant_trumpet', bleat: 'panda_bleat',
  monkeyOo: 'monkey_call', monkeyAa: 'monkey_call',
};
// Species-specific versions of a call, and what each species sounds like when sad / angry / thrilled.
const SPECIES_CATS = {
  puppy: { growl: 'dog_growl', sad: 'dog_whine', scared: 'dog_whine', excited: 'dog_happy', laugh: 'dog_happy' },
  cat: { sad: 'cat_sad', angry: 'cat_hiss', calm: 'cat_purr' },
  bear: { growl: 'bear_growl', roar: 'bear_growl', bark: 'bear_growl' },
  panda: { growl: 'bear_growl', roar: 'bear_growl', angry: 'bear_growl' },
  lion: { growl: 'lion_roar' },
  fox: { bark: 'fox_yip', growl: 'dog_growl' },
  pig: { scared: 'pig_squeal', excited: 'pig_squeal', squeak: 'pig_squeal' },
  bunny: { squeak: 'bunny_squeak', sad: 'bunny_sniff' },
  mouse: { squee: 'mouse_squeak' },
};
// Calls that are one long sound: "Roar roar" or "Ooh ooh aah aah" plays one recording, not four.
const LONG = new Set(['lion_roar', 'bear_growl', 'elephant_trumpet', 'monkey_call', 'cat_purr', 'dog_growl', 'dog_whine', 'dog_happy', 'pig_squeal']);
// How long a recorded call may run, and how an emotion bends its pitch.
const ANIMAL_KEEP = { lion_roar: 2.2, bear_growl: 1.8, elephant_trumpet: 1.8, monkey_call: 1.8, cat_purr: 1.6, dog_growl: 1.4, dog_whine: 1.4, dog_happy: 1.4 };
const EMO_RATE = { excited: 1.06, laugh: 1.05, surprised: 1.08, scared: 1.1, sad: 0.92, angry: 0.96 };

/** The recorded category for a call made by this species with this emotion, or null. */
function animalCat(type, call, emotion, intro) {
  const S = SPECIES_CATS[type] || {};
  if (intro && S[emotion]) return S[emotion];
  return S[call] || ANIMAL_CATS[call] || null;
}

/**
 * Real recordings for a run of animal calls (from animals.js), as one buffer; null when any call
 * has no recording, so the caller can fall back to the synthesized calls.
 */
export async function renderAnimal(cast, calls, emotion = 'neutral', intro = false) {
  const manifest = await soundManifest();
  const plan = [];
  for (const { call } of calls) {
    const cat = animalCat(cast.type, call, emotion, intro);
    if (!cat || !manifest[cat]?.length) return null;
    if (LONG.has(cat) && plan.at(-1)?.cat === cat) continue;
    plan.push({ cat });
  }
  const who = cast.id || cast.name;
  const rate = (EMO_RATE[emotion] || 1) * 2 ** (Math.max(-2, Math.min(2, (cast.pitch || 0) / 15)) / 12);
  const parts = await Promise.all(plan.map(async ({ cat }, i) => {
    const list = manifest[cat];
    const buf = await sample(`${cat}/${list[(hash(`${who}|${cat}`) + i) % list.length]}`);
    let out = await resample(buf, rate * (i % 2 ? 0.97 : 1), 0.11);
    const keep = ANIMAL_KEEP[cat] * (intro && emotion !== 'angry' ? 0.7 : 1);
    if (keep < out.duration) out = fadeTo(out, keep);
    return out;
  }));
  const gap = Math.floor(0.08 * 48000);
  const total = parts.reduce((n, b) => n + b.length + gap, 0);
  const out = decoder().createBuffer(1, Math.max(1, total), 48000);
  const d = out.getChannelData(0);
  let o = 0;
  for (const b of parts) { d.set(b.getChannelData(0), o); o += b.length + gap; }
  return out;
}
