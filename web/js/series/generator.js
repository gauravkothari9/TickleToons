// Episode generator (no AI): hand-written story templates are filled from variation pools by a
// seeded random number generator, then fitted to the requested length with optional scenes.
// The same seed makes the same story in every language.
import { rng } from '../engine/util.js';
import { displayText } from '../engine/audio.js';
import { mergeBible, castMember, nameOf, FAMILY, DEFAULT_BIBLE } from './bible.js';
import { LONG_TEMPLATES, SHORT_TEMPLATES, VLOG_TEMPLATES, VLOG_SHORT_TEMPLATES, VLOG_SEGMENTS } from './templates.js';
const ALL_TEMPLATES = () => [...LONG_TEMPLATES, ...SHORT_TEMPLATES, ...VLOG_TEMPLATES, ...VLOG_SHORT_TEMPLATES];

export const THEMES = {
  experiment: 'Experiments & mishaps',
  school: 'School & school trips',
  trip: 'Family trips',
  friends: 'Playing with friends',
  animals: 'Animals & pets',
  environment: 'Nature & environment',
  home: 'Everyday at home',
  town: 'Market & town',
  health: 'Health & good habits',
  celebrate: 'Dance & celebrations',
  facts: 'Fun facts & riddles (Shorts)',
};

export const DEFAULT_SETTINGS = {
  languages: ['en'],
  long: { count: 4, minutes: 5 },
  shorts: { count: 6, seconds: 50 },
  themes: Object.keys(THEMES),
  moralPercent: 70,
  vlogPercent: 10,
  intro: true,
  seed: 1,
  titleFormat: '{title} | {series} | Kids Stories',
  shortTitleFormat: '{title} #shorts',
  tags: 'kids stories, moral stories, cartoon, family, animation',
};

// ---------- building an episode ----------
const EMOTIONS = new Set(['neutral', 'happy', 'excited', 'laugh', 'sad', 'angry', 'surprised', 'scared', 'thinking', 'calm']);
const ACTION_MOOD = { sad: 'sad', cry: 'sad', think: 'thinking', laugh: 'laugh', cheer: 'excited', sick: 'sad', stomp: 'angry', sleep: 'calm' };

class Episode {
  constructor({ bible, lang, kind, rand, look }) {
    Object.assign(this, { bible, lang, kind, rand, look: look || 'home' });
    this.scenes = [];
    this.title = '';
    this.moral = null;
    this.lesson = null;
    this.hook = null;
    this.music = 'happy';
    this.summary = '';
  }

  /**
   * Add a scene. actors: 'golu' | 'golu:eat' | 'golu:eat:purse' | 'golu:idle::walk-left' or {id, action, holds, enter, exit, x, z}.
   * lines: [castId, emotion, text, pauseBefore?]; emotion can name a gesture too ('happy:wave', 'calm:none'). opts: camera, transition, minDuration, props, optional.
   */
  scene(world, actors, lines, opts = {}) {
    if (Array.isArray(opts.card)) opts = { ...opts, card: this.T(...opts.card) }; // [english, hindi]
    const sc = { world, actors: actors.map(parseActor), lines: lines.filter(Boolean), ...opts };
    this.scenes.push(sc);
    return sc;
  }

  /**
   * Same as scene(), but each line carries both languages: [castId, emotion, english, hindi, pauseBefore?].
   * opts.optional: this scene can be cut when the episode runs long. 3 goes first, then 2, then 1 (or true).
   */
  act(world, actors, lines, opts = {}) {
    if (Array.isArray(opts.card)) opts = { ...opts, card: this.T(...opts.card) };
    return this.scene(world, actors, lines.filter(Boolean).map(([who, emo, en, hi, pause]) => [who, emo, this.T(en, hi), pause]), opts);
  }

  /** A spot where an optional extra scene can go (only Golu's vlogs use these now). */
  slot(where = 'home') { this.scenes.push({ slot: where }); }

  /**
   * Props follow the story from scene to scene. A scene's `carry: { golu: 'balloon' }` puts the
   * balloon in Golu's hand from then on (also in any extra scenes slotted in between) until a later
   * `carry: { golu: null }`. A scene's `set: [{ kind, x, z }]` dresses that place (a TV in the
   * bedroom, the ludo board) for every later scene there until another `set` replaces it.
   * Intro and ending scenes (noCarry) are left alone.
   */
  toStory(settings) {
    // time of day carries on like props do: 'evening' stays evening until a scene says otherwise
    const carried = {}, sets = {};
    let time = 'auto';
    const shots = this.scenes.filter((s) => !s.slot).map((s, i) => {
      if (s.carry) Object.assign(carried, s.carry);
      if (s.set) sets[s.world] = s.set;
      if (s.time) time = s.time;
      return this.toShot({ ...s, time: s.noCarry ? 'auto' : time }, i, s.noCarry ? {} : carried, s.noCarry ? [] : sets[s.world] || []);
    });
    const ids = [...new Set(shots.flatMap((s) => [...s.actors.map((a) => a.castId), ...s.lines.map((l) => l.castId)]))];
    return {
      title: this.title, aspect: this.kind === 'short' ? '9:16' : '16:9', music: this.music, musicVolume: 0.45, ambience: 0.5,
      subtitles: true, titleCard: this.kind !== 'short',
      cast: ids.map((id) => castMember(this.bible, id, this.lookFor(id), this.lang)),
      shots,
    };
  }

  lookFor() { return this.look; }

  toShot(s, i, carried = {}, set = []) {
    const n = s.actors.length, short = this.kind === 'short';
    const spacing = short ? 0.95 : n > 4 ? 1.25 : 1.5;
    const actors = s.actors.map((a, k) => {
      const x = a.x ?? (k - (n - 1) / 2) * spacing;
      const z = a.z ?? (a.id === 'pari' ? 0.45 : (k % 2) * 0.35);
      const speaker = s.lines.find((l) => l[0] === a.id);
      const mood = a.mood || ACTION_MOOD[a.action] || (speaker && EMOTIONS.has(String(speaker[1]).split(':')[0]) ? String(speaker[1]).split(':')[0] : 'happy');
      const action = a.action || 'idle';
      const holds = fitHands(action, a.holds && a.holds !== 'none' ? a.holds : carried[a.id] || 'none');
      return { castId: a.id, x, z, action, mood, holds, enter: a.enter || 'none', exit: a.exit || 'none' };
    });
    return {
      id: `s${i}`, world: s.world, camera: s.camera || 'auto', transition: s.transition || 'cut', time: s.time || 'auto', card: s.card || '',
      minDuration: s.minDuration ?? (short ? 2.5 : 4), props: [...set, ...(s.props || [])].slice(0, 10), actors,
      lines: s.lines.map(([castId, mood, text, pause], j) => {
        const [emotion, gesture] = String(mood).split(':'); // 'happy:wave' picks the gesture; 'sad:none' keeps still
        return { id: `s${i}l${j}`, castId, emotion: EMOTIONS.has(emotion) ? emotion : 'happy', text, ...(pause !== undefined ? { pause } : {}), ...(gesture ? { gesture } : {}) };
      }),
    };
  }
}

// What's in the hands has to make sense with what the body is doing: nobody claps or dances while
// holding a teddy, eats a shovel, or drinks from a lunch box. The prop is only put down for that
// scene; a carried prop comes back in the next scene where the hands are free.
const HANDS_BUSY = new Set(['clap', 'namaste', 'salute', 'bow', 'bhangra', 'disco', 'twist', 'hiphop', 'robot', 'twirl', 'sidestep', 'dance',
  'jumpingjacks', 'swing', 'slide', 'kick', 'firststeps', 'crawl', 'raisehand', 'phone']);
const ON_BACK = new Set(['schoolbag']);
const FOOD = new Set(['roti', 'laddoo', 'apple', 'banana', 'carrot', 'samosa', 'sandwich', 'icecream', 'chips', 'cake']);
const DRINKS = new Set(['cup', 'milkbottle', 'waterbottle']);
export function fitHands(action, holds) {
  if (!holds || holds === 'none' || ON_BACK.has(holds)) return holds || 'none';
  if (HANDS_BUSY.has(action)) return 'none';
  if (action === 'eat') return FOOD.has(holds) ? holds : 'none';
  if (action === 'drink') return DRINKS.has(holds) ? holds : 'none';
  return holds;
}

function parseActor(a) {
  if (typeof a !== 'string') return a;
  const [id, action, holds, enter, exit] = a.split(':');
  return { id, action: action || 'idle', holds: holds || 'none', enter: enter || 'none', exit: exit || 'none' };
}

// ---------- length ----------
/** Rough running time of a scene list, close to what the studio's timeline will measure. */
export function estimateSeconds(scenes) {
  let t = 0;
  for (const s of scenes) {
    if (s.slot) continue;
    let talk = 0.5 + (s.card ? 1.6 : 0);
    for (const [, mood, text, pause] of s.lines) {
      const emotion = String(mood).split(':')[0];
      const words = displayText(text).split(/\s+/).filter(Boolean).length;
      const marks = [...String(text).matchAll(/\[(\d*\.?\d+)\]/g)].reduce((a, m) => a + Number(m[1]), 0) + (String(text).match(/\|/g) || []).length * 0.35;
      const speed = emotion === 'sad' || emotion === 'thinking' || emotion === 'calm' ? 2.2 : emotion === 'excited' ? 2.9 : 2.6;
      talk += words / speed + marks + (pause ?? 0.42);
    }
    const enter = s.actors.some((a) => (typeof a === 'string' ? a.split(':')[3] : a.enter) && (typeof a === 'string' ? a.split(':')[3] : a.enter) !== 'none') ? 4.7 : 0;
    t += Math.max(s.minDuration ?? 4, talk + 0.9, enter);
  }
  return t;
}

// ---------- the generator ----------
/**
 * Stories are written with the default names; any you have changed are swapped in here,
 * whole words only (works for Devanagari too).
 */
function renamer(bible, lang) {
  const swaps = [];
  const add = (from, to) => { if (from && to && from !== to) swaps.push([new RegExp(`(?<![\\p{L}\\p{M}])${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{M}])`, 'gu'), to]); };
  for (const [id, def] of Object.entries(DEFAULT_BIBLE.characters)) {
    add(def.name[lang] || def.name.en, nameOf(bible, id, lang));
    if (lang !== 'en') add(def.name.en, nameOf(bible, id, lang)); // English names inside Hindi lines
    if (def.nick) add(def.nick[lang] || def.nick.en, bible.characters[id].nick?.[lang] || bible.characters[id].nick?.en);
  }
  add(DEFAULT_BIBLE.familyName[lang] || DEFAULT_BIBLE.familyName.en, bible.familyName?.[lang] || bible.familyName?.en);
  swaps.sort((a, b) => b[0].source.length - a[0].source.length); // longest first ("Dadaji" before "Dadi")
  return (s) => swaps.reduce((t, [re, to]) => t.replace(re, to), s);
}

// People talk in contractions: "Let us go, I am hungry, do not touch it" sounds like a robot reading;
// "Let's go, I'm hungry, don't touch it" sounds like a family. Only when another word follows
// ("There you are!" stays) and never on a stressed word (*is*), so the meaning and emphasis survive.
const CONTRACTIONS = [
  [/\b([Ll])et us\b/g, "$1et's"], [/\b([Dd])o not\b/g, "$1on't"], [/\b([Dd])oes not\b/g, "$1oesn't"], [/\b([Dd])id not\b/g, "$1idn't"],
  [/\b([Cc])annot\b/g, "$1an't"], [/\b([Ii])s not\b/g, "$1sn't"], [/\b([Aa])re not\b/g, "$1ren't"], [/\b([Ww])as not\b/g, "$1asn't"],
  [/\b([Ww])ill not\b/g, "$1on't"], [/\b([Hh])ave not\b/g, "$1aven't"], [/\b([Cc])ould not\b/g, "$1ouldn't"], [/\b([Ss])hould not\b/g, "$1houldn't"],
  [/\bI am(?= [a-z*])/g, "I'm"], [/\bI will(?= [a-z*])/g, "I'll"], [/\bI would(?= [a-z*])/g, "I'd"],
  [/\b([Yy]ou|[Ww]e|[Tt]hey) are(?= [a-z*])/g, "$1're"], [/\b([Yy]ou|[Ww]e|[Tt]hey|[Ss]he|[Hh]e|[Ii]t) will(?= [a-z*])/g, "$1'll"],
  [/\b([Ii]t|[Tt]hat|[Ww]hat|[Ww]here|[Tt]here|[Hh]e|[Ss]he|[Ww]ho|[Hh]ow|[Hh]ere) is(?= [a-z*])/g, "$1's"],
];
const naturalEnglish = (s) => CONTRACTIONS.reduce((t, [re, to]) => t.replace(re, to), s);

function context(ep) {
  const { rand, lang, bible } = ep;
  const rename = renamer(bible, lang);
  const T = (en, hi) => rename(lang === 'hi' && hi ? hi : naturalEnglish(en));
  const N = {};
  for (const id of Object.keys(bible.characters)) N[id] = nameOf(bible, id, lang);
  N.didi = bible.characters.anaya?.nick?.[lang] || bible.characters.anaya?.nick?.en || N.anaya;
  N.family = bible.familyName?.[lang] || bible.familyName?.en || '';
  N.series = bible.seriesName?.[lang] || bible.seriesName?.en || '';
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  ep.T = T;
  return { T, N, pick, rand, lang, kind: ep.kind };
}

// The intro and ending are in every episode, so they come in several versions and sound like a
// real family talking over each other, not a host reading a script.
function introScene(ep, c) {
  const { T, N, pick } = c;
  const hook = ep.hook ? ['golu', 'excited', ep.hook] : ['golu', 'excited', T('Today is going to be *so* much fun!', 'आज तो *बहुत* मज़ा आने वाला है!')];
  const lines = pick([
    [
      ['anaya', 'happy', T(`Hi, friends! | Welcome to the ${N.family} family!`, `हाय दोस्तों! | ${N.family} परिवार में आपका स्वागत है!`)],
      hook,
      ['anaya', 'laugh', T('Golu, | let me finish first! | Hehe.', 'गोलू, | पहले मुझे तो बोलने दो! | हीही।')],
    ],
    [
      ['golu', 'excited', T(`Namaste, friends! | I'm Golu... | and this is our family!`, `नमस्ते दोस्तों! | मैं गोलू... | और ये है हमारा परिवार!`)],
      ['anaya', 'calm', T(`*Our* family, Golu. | Not just yours. | [0.3] Hi, everyone!`, `*हमारा* परिवार, गोलू। | सिर्फ़ तुम्हारा नहीं। | [0.3] हाय सबको!`)],
      hook,
    ],
    [
      ['anaya', 'excited', T(`Hello, hello! | You're just in time!`, `हैलो, हैलो! | आप बिल्कुल सही टाइम पर आए हो!`)],
      hook,
      ['pari', 'laugh', T('Hehe! | Hi-hi!', 'हीही! | हाय-हाय!')],
    ],
  ]);
  ep.scenes.unshift({
    world: 'house', actors: ['anaya:wave', 'golu:wave', 'pari:wave'].map(parseActor), transition: 'cut', camera: 'wide', minDuration: 3, noCarry: true,
    lines,
  });
}

function endingScene(ep, c) {
  const { T, N, pick } = c;
  if (ep.moral) {
    // the family talks it over at dinner, the way it happens at home. Golu's line comes from the
    // story itself (ep.callback), so the ending is about *this* episode, not a random joke.
    ep.scene('kitchen', ['dadaji:eat', 'anaya:eat', 'golu:eat', 'pari:sitfloor', 'mumma:idle:rotiplate', 'papa:eat'], [
      ['mumma', 'calm', T('What a day! | So, what did we learn today?', 'क्या दिन था! | तो, आज हमने क्या सीखा?'), 0.8],
      ['anaya', 'thinking', ep.lesson || ep.moral],
      ep.callback && ['golu', 'happy', ep.callback],
      ep.callback && ['papa', 'laugh', T('Ha ha! | Well said, Golu.', 'हा हा! | बहुत अच्छा बोला, गोलू।')],
      ['dadaji', 'calm', ep.moral, 0.6],
    ], { transition: 'fade', noCarry: true });
  }
  ep.scene('house', ['anaya:wave', 'golu:wave', 'pari:wave', 'papa:wave', 'mumma:wave'], [
    ['anaya', 'happy', pick([
      T('That\'s all for today, friends. | See you next time!', 'आज के लिए बस इतना ही, दोस्तों। | अगली बार मिलते हैं!'),
      T('Thanks for spending the day with us! | Bye, friends!', 'हमारे साथ दिन बिताने के लिए थैंक यू! | बाय दोस्तों!'),
    ])],
    ['golu', 'excited', pick([T('Byeee! | Don\'t forget us!', 'बाय्य! | हमें भूलना मत!'), T('Bye! | Be good... | like me! Hehe!', 'बाय! | अच्छे बच्चे बनना... | मेरी तरह! हीही!'),
      T('Wait, wait! | Tell us in the comments... | what would *you* have done?', 'रुको, रुको! | कमेंट में बताओ... | *आप* क्या करते?')])],
  ], { camera: 'wide', minDuration: 4, transition: ep.moral ? 'cut' : 'fade', noCarry: true });
}

/**
 * Make one episode. kind: 'long' | 'short'. Returns { story, meta } or throws if no template fits.
 */
export function generateEpisode({ seed, kind = 'long', lang = 'en', settings = DEFAULT_SETTINGS, bibleOverrides, templateId, replay, vlog = false } = {}) {
  // Every length decision is made on the English text; other languages replay those decisions,
  // so all language versions of an episode are the same story, scene for scene.
  if (lang !== 'en' && !replay) {
    const en = generateEpisode({ seed, kind, lang: 'en', settings, bibleOverrides, templateId, vlog });
    return generateEpisode({ seed, kind, lang, settings, bibleOverrides, templateId: templateId || en.meta.template, replay: en.meta.lengthLog, vlog });
  }
  const bible = mergeBible(bibleOverrides);
  const rand = rng(seed * 7919 + (kind === 'short' ? 13 : 0));
  const pool = poolFor(kind, vlog, settings);
  if (!pool.length) throw new Error('No story themes selected.');
  const wantMoral = rand() * 100 < settings.moralPercent;
  // Every story can be told without the moral at the end (it is still in the story itself), so
  // "no moral" only drops the dinner-table lesson; it never rules a story out.
  const fitting = pool.filter((t) => (wantMoral ? t.moral !== false : true));
  const choices = fitting.length ? fitting : pool;
  const picked = choices[Math.floor(rand() * choices.length)]; // always draw, so every language follows the same random path
  const template = (templateId && ALL_TEMPLATES().find((t) => t.id === templateId)) || picked;

  const ep = new Episode({ bible, lang, kind, rand, look: template.look });
  ep.vlog = !!template.vlog;
  const c = context(ep);
  c.target = kind === 'short' ? (settings.shorts?.seconds || 50) - 5 : (settings.long?.minutes || 5) * 60 - 34;
  const lengthLog = [];
  c.estimate = () => { const v = replay ? (replay[lengthLog.length] ?? Infinity) : estimateSeconds(ep.scenes); lengthLog.push(v); return v; };
  template.build(ep, c, { moral: wantMoral });
  if (!wantMoral) { ep.moral = null; ep.lesson = null; }
  if (kind === 'long') {
    fitLength(ep, c, (settings.long?.minutes || 5) * 60);
    if (!template.vlog) {
      if (settings.intro) introScene(ep, c);
      endingScene(ep, c);
    }
  } else {
    fitLength(ep, c, settings.shorts?.seconds || 50);
    shortOutro(ep, c);
  }
  const story = ep.toStory(settings);
  const meta = youtubeText(ep, c, settings, template, kind);
  return { story, meta: { ...meta, vlog: !!template.vlog, template: template.id, theme: template.theme, kind, lang, seed, moral: ep.moral, estSeconds: Math.round(estimateSeconds(ep.scenes)), lengthLog } };
}

/**
 * Fit the episode to the chosen length.
 * Stories are never padded with scenes from somewhere else (a riddle, a joke, a dance break in the
 * middle of a lost-cat story is what made episodes feel like every genre at once). Every story is
 * written at full length with its own optional scenes, and those are cut when the episode is too long:
 * optional 3 first, then 2, then 1, later scenes before earlier ones. If a story is shorter than
 * the chosen length it simply stays shorter. Only Golu's vlogs, which are a string of segments by
 * design, are filled from their own vlog segments.
 */
function fitLength(ep, c, target) {
  const short = ep.kind === 'short';
  const endPad = short ? 5 : ep.vlog ? 0 : 34; // sign-off (shorts) / intro + ending (long) are added afterwards
  if (ep.vlog && !short) fillVlog(ep, c, target);
  const level = (s) => (s.optional === true ? 1 : Number(s.optional) || 0);
  for (const cut of [3, 2, 1]) {
    for (let i = ep.scenes.length - 1; i >= 0; i--) {
      if (level(ep.scenes[i]) !== cut) continue;
      if (!(c.estimate() + endPad > target + (short ? 8 : 25))) break;
      ep.scenes.splice(i, 1);
    }
  }
  ep.scenes = ep.scenes.filter((s) => !s.slot);
}

/** Golu's vlogs: drop vlog segments into the 'vlog' slots until the vlog is long enough. */
function fillVlog(ep, c, target) {
  const pool = [...VLOG_SEGMENTS].sort(() => c.rand() - 0.5);
  const uses = new Map(); // each segment at most twice (it picks a new variation the second time)
  let guard = 0, turn = 0;
  while (c.estimate() < target - 12 && guard++ < 60) {
    const slots = ep.scenes.map((s, i) => (s.slot ? i : -1)).filter((i) => i >= 0);
    if (!slots.length) break;
    const at = slots[turn++ % slots.length];
    const where = ep.scenes[at].slot;
    const world = [...ep.scenes.slice(0, at)].reverse().find((s) => s.world)?.world || 'house';
    const extra = pool.find((x) => (uses.get(x.id) || 0) < 2 && x.where.includes(where) && !(uses.get(x.id) && pool.some((y) => !uses.get(y.id) && y.where.includes(where))));
    if (!extra) { ep.scenes.splice(at, 1); continue; }
    uses.set(extra.id, (uses.get(extra.id) || 0) + 1);
    const tail = ep.scenes.splice(at + 1);
    extra.build(ep, c, where, world);
    ep.scenes.push(...tail);
  }
}

/** Shorts end on a quick, friendly sign-off. */
function shortOutro(ep, c) {
  const { T, pick } = c;
  const world = [...ep.scenes].reverse().find((s) => s.world)?.world || 'house';
  ep.scene(world, ['anaya:wave', 'golu:wave', 'pari:wave'], [
    ['golu', 'excited', pick([T('More fun stories on our channel! | Byeee!', 'और मज़ेदार कहानियाँ हमारे चैनल पर! | बाय्य!'), T('See you in the next one! | Bye bye!', 'अगली वीडियो में मिलते हैं! | बाय बाय!')])],
  ], { minDuration: 2, noCarry: true });
}

function youtubeText(ep, c, settings, template, kind) {
  const { T, N } = c;
  const fill = (fmt) => fmt.replace('{title}', ep.title).replace('{series}', N.series).replace(/\s+\|\s+$/, '');
  const title = fill(kind === 'short' ? settings.shortTitleFormat : settings.titleFormat).slice(0, 100);
  const cast = FAMILY.map((id) => N[id]).join(', ');
  const description = [
    ep.summary,
    ep.moral ? T(`Moral of the story: ${displayText(ep.moral)}`, `कहानी की सीख: ${displayText(ep.moral)}`) : T('A fun story just for laughs!', 'बस मस्ती और हँसी की एक कहानी!'),
    '',
    T(`Meet the ${N.family} family: ${cast}.`, `मिलिए ${N.family} परिवार से: ${cast}।`),
    T('New family stories every week. Subscribe for more!', 'हर हफ़्ते नई पारिवारिक कहानियाँ। और कहानियों के लिए सब्सक्राइब करें!'),
    '',
    kind === 'short' ? '#shorts #kids #cartoon' : '#kidsstories #moralstories #cartoon',
  ].join('\n');
  const tags = [...settings.tags.split(',').map((t) => t.trim()).filter(Boolean), N.series, template.theme];
  return { title, description, tags: [...new Set(tags)].slice(0, 15) };
}

// ---------- the plan: many episodes, with publish times ----------
const DAY = 24 * 3600 * 1000;

/** '17:00', '5:30 pm', '23:30pm', '11 am' -> [hours, minutes]. */
export function parseTime(hm) {
  const t = String(hm || '17:00').trim().toLowerCase().match(/^(\d{1,2})(?:[:.](\d{1,2}))?\s*(am|pm)?/);
  if (!t) return [17, 0];
  let h = Number(t[1]) % 24;
  if (t[3] === 'pm' && h < 12) h += 12;
  if (t[3] === 'am' && h === 12) h = 0;
  return [h, Math.min(Number(t[2]) || 0, 59)];
}

/** Publish slots from the schedule settings, starting from startDate (local time). */
export function scheduleSlots(schedule, kind, count, now = Date.now()) {
  const out = [];
  if (!schedule?.enabled) return Array(count).fill(null);
  const start = new Date(`${schedule.startDate || new Date().toISOString().slice(0, 10)}T00:00:00`);
  const days = kind === 'short' ? schedule.shortDays : schedule.longDays;
  const times = kind === 'short' ? schedule.shortTimes : [schedule.longTime];
  for (let d = 0; out.length < count && d < 730; d++) {
    const day = new Date(start.getTime() + d * DAY);
    if (!days?.includes(day.getDay())) continue;
    for (const hm of times || []) {
      const [h, m] = parseTime(hm);
      const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
      if (at.getTime() > now + 20 * 60 * 1000 && out.length < count) out.push(at.toISOString());
    }
  }
  while (out.length < count) out.push(null);
  return out;
}

/** Templates an episode of this kind can use with these settings. */
function poolFor(kind, vlog, settings) {
  return vlog ? (kind === 'short' ? VLOG_SHORT_TEMPLATES : VLOG_TEMPLATES)
    : (kind === 'short' ? SHORT_TEMPLATES : LONG_TEMPLATES).filter((t) => settings.themes.includes(t.theme));
}

/** The pools an episode can draw from: the one asked for first, then the other (vlogs only when you have any). */
function poolsFor(kind, vlog, settings) {
  const regular = poolFor(kind, false, settings);
  if (!regular.length) throw new Error('No story themes selected.');
  const vlogs = (settings.vlogPercent ?? 10) > 0 ? poolFor(kind, true, settings) : [];
  return vlog && vlogs.length ? [[vlogs, true], [regular, false]] : [[regular, false], [vlogs, true]];
}

/**
 * The story for a new episode: one that isn't in `used` (template ids, oldest first). A story is one
 * video: the same story again is the same video again, so a used one is never picked while another is
 * left. When all are used: the one used longest ago (repeat: true), or null when repeats are off.
 */
export function nextStory(kind, vlog, settings, used, seed, repeats = true) {
  const pools = poolsFor(kind, vlog, settings);
  for (const [pool, isVlog] of pools) {
    const fresh = pool.filter((t) => !used.includes(t.id));
    if (fresh.length) return { template: fresh[Math.floor(rng(seed * 31 + 7)() * fresh.length)].id, vlog: isVlog, repeat: false };
  }
  if (!repeats) return null;
  const [pool, isVlog] = pools[0];
  return { template: [...pool].sort((a, b) => used.indexOf(a.id) - used.indexOf(b.id))[0].id, vlog: isVlog, repeat: true };
}

/** How many stories haven't been made yet: { long, short }. */
export function storiesLeft(settings, used = {}) {
  const left = (kind) => poolsFor(kind, false, settings).flatMap(([pool]) => pool).filter((t) => !(used[kind] || []).includes(t.id)).length;
  try { return { long: left('long'), short: left('short') }; } catch { return { long: 0, short: 0 }; }
}

/**
 * Plan every video: N long + M shorts, each in every chosen language, with publish times.
 * avoid: { long: [templateIds], short: [templateIds] } used in earlier batches, oldest first. Those
 * stories are skipped. When every story has been used, the oldest come round again (marked repeat),
 * or with repeats = false the episode is left out.
 */
export function makePlan(settings, bibleOverrides, schedule, avoid = {}, given = null, repeats = true) {
  const items = [];
  const langs = settings.languages?.length ? settings.languages : ['en'];
  for (const kind of ['long', 'short']) {
    const count = given ? Math.ceil(given[kind].length / langs.length) : kind === 'long' ? settings.long.count : settings.shorts.count;
    const slots = given ? given[kind] : scheduleSlots(schedule, kind, count * langs.length);
    let used = [...(avoid[kind] || [])];
    for (let i = 0; i < count; i++) {
      const seed = (settings.seed || 1) * 1000 + i + (kind === 'short' ? 500 : 0);
      const pct = (settings.vlogPercent ?? 10) / 100;
      // a big batch spreads its vlogs evenly; the autopilot's small daily batches draw them at random
      const next = nextStory(kind, given ? Math.random() < pct : Math.floor((i + 1) * pct) > Math.floor(i * pct), settings, used, seed, repeats);
      if (!next) continue; // every story has been made and repeats are off: no episode
      const { template, vlog } = next;
      used = [...used.filter((id) => id !== template), template];
      langs.forEach((lang, k) => {
        const ep = generateEpisode({ seed, kind, lang, settings, bibleOverrides, templateId: template, vlog });
        items.push({ key: `${kind}-${i}-${lang}`, kind, lang, seed, template, ...ep.meta, story: ep.story,
          publishAt: slots[i * langs.length + k], status: 'planned', ...(next.repeat ? { repeat: true } : {}) });
      });
    }
  }
  return items;
}

/**
 * Autopilot: new episodes for every schedule slot in the next `days` days that has none yet, so the
 * renderer always has something to make. Returns { items, usedStories, seed, outOf } (items empty when
 * the plan is already full; outOf: the kinds that ran out of new stories), or null when the autopilot
 * is off. A kind set to 0 videos in Settings gets none. A story that has been made is not made again
 * unless the Schedule tab allows repeats.
 */
export function topUpPlan(state, now = Date.now()) {
  const schedule = state.schedule || {};
  if (!schedule.enabled || schedule.autoPlan === false) return null;
  const days = Math.min(Math.max(Number(schedule.planDays) || 2, 1), 14);
  const settings = { ...DEFAULT_SETTINGS, ...state.settings };
  const langs = settings.languages?.length ? settings.languages : ['en'];
  const plan = state.plan || [];
  // a slot is filled when an episode of that kind and language goes up within the hour (a single episode moved a bit still counts)
  const filled = (kind, lang, t) => plan.some((p) => p.kind === kind && p.lang === lang && p.publishAt && Math.abs(new Date(p.publishAt) - new Date(t)) < 3600e3);
  const given = {};
  for (const kind of ['long', 'short']) {
    given[kind] = [];
    if ((kind === 'long' ? settings.long?.count : settings.shorts?.count) === 0) continue;
    // every slot gets one episode per language (all languages go up at the same time)
    const slots = scheduleSlots(schedule, kind, 60 * days, now).filter((t) => t && new Date(t).getTime() <= now + days * DAY)
      .filter((t) => langs.some((lang) => !filled(kind, lang, t)));
    given[kind] = slots.slice(0, 20).flatMap((t) => langs.map(() => t));
  }
  const usedStories = structuredClone(state.usedStories || { long: [], short: [] });
  if (!given.long.length && !given.short.length) return { items: [], usedStories, seed: settings.seed, outOf: [] };
  let seed;
  do seed = Math.floor(Math.random() * 99999) + 1; while (seed === settings.seed);
  const remember = (p) => { if (p.template) usedStories[p.kind] = [...(usedStories[p.kind] || []).filter((id) => id !== p.template), p.template]; };
  plan.forEach(remember);
  const made = makePlan({ ...settings, seed }, state.bible, schedule, usedStories, given, schedule.repeatStories === true);
  const outOf = ['long', 'short'].filter((kind) => made.filter((p) => p.kind === kind).length < given[kind].length);
  const items = made.map((p) => ({ ...p, key: `${seed}-${p.key}`, auto: true })).filter((p) => !filled(p.kind, p.lang, p.publishAt));
  items.forEach(remember);
  return { items, usedStories, seed, outOf };
}
