// The series bible: one family and their friends. Every episode builds its cast from here,
// so looks, clothes, voices and ways of speaking stay the same across the whole series.
// Everything here is a default: the Series page lets you rename and restyle anyone, and those
// edits are saved and merged on top (see mergeBible).

export const LANGUAGES = {
  en: { label: 'English', youtube: 'en' },
  hi: { label: 'Hindi (हिंदी)', youtube: 'hi' },
};

export const DEFAULT_BIBLE = {
  familyName: { en: 'Sharma', hi: 'शर्मा' },
  seriesName: { en: 'The Sharma Family', hi: 'शर्मा परिवार' },
  characters: {
    dadaji: {
      role: 'Grandfather', type: 'grandpa', family: true,
      name: { en: 'Dadaji', hi: 'दादाजी' },
      color: '#d6a07a', hair: '#e6e6e6', eyes: '#3b2415',
      looks: { home: { outfit: 'kurtapajama', accent: '#f2efe6' }, party: { outfit: 'sherwani', accent: '#c9a227' }, wedding: { outfit: 'sherwani', accent: '#c9a227' }, night: { outfit: 'pajamas', accent: '#9fa8da' } },
      voices: { en: { voice: 'en-IN-PrabhatNeural', pitch: -14, rate: -8 }, hi: { voice: 'hi-IN-MadhurNeural', pitch: -12, rate: -10 } },
      traits: 'Wise, warm storyteller. Loves gardening, riddles and old stories. Speaks slowly, with a smile.',
    },
    dadi: {
      role: 'Grandmother', type: 'grandma', family: true,
      name: { en: 'Dadi', hi: 'दादी' },
      color: '#e0ad88', hair: '#dcdcdc', eyes: '#3b2415',
      looks: { home: { outfit: 'saree', accent: '#8e5bd0' }, party: { outfit: 'saree', accent: '#c62848' }, wedding: { outfit: 'saree', accent: '#c62848' } },
      voices: { en: { voice: 'en-IN-NeerjaNeural', pitch: -16, rate: -8 }, hi: { voice: 'hi-IN-SwaraNeural', pitch: -16, rate: -10 } },
      traits: 'Loving and a little worried. Feeds everyone, makes the best laddoos, gasps "Hai Ram!"',
    },
    papa: {
      role: 'Father', type: 'man', family: true,
      name: { en: 'Papa', hi: 'पापा' },
      color: '#d9a47c', hair: '#2a1a12', eyes: '#3b2415',
      looks: { home: { outfit: 'shirtpants', accent: '#2f6fdf' }, party: { outfit: 'office', accent: '#26324a' }, wedding: { outfit: 'nehru', accent: '#6a1b9a' }, night: { outfit: 'pajamas', accent: '#2f6fdf' }, rain: { outfit: 'raincoat', accent: '#2f6fdf' } },
      voices: { en: { voice: 'en-IN-PrabhatNeural', pitch: 2, rate: 6 }, hi: { voice: 'hi-IN-MadhurNeural', pitch: 4, rate: 4 } },
      traits: 'Fun-loving and cricket crazy. Tells terrible jokes and laughs at them himself. A bit forgetful.',
    },
    mumma: {
      role: 'Mother', type: 'woman', family: true,
      name: { en: 'Mumma', hi: 'मम्मा' },
      color: '#e2ae88', hair: '#1e130c', eyes: '#3b2415',
      looks: { home: { outfit: 'salwar', accent: '#e0457b' }, party: { outfit: 'saree', accent: '#e0457b' }, wedding: { outfit: 'saree', accent: '#d81b60' }, night: { outfit: 'pajamas', accent: '#f48fb1' }, rain: { outfit: 'raincoat', accent: '#e0457b' } },
      voices: { en: { voice: 'en-IN-NeerjaNeural', pitch: 2, rate: 4 }, hi: { voice: 'hi-IN-SwaraNeural', pitch: 2, rate: 2 } },
      traits: 'Calm, clever and organised. Counts "one... two..." when the kids are naughty. Always asks what we learned.',
    },
    anaya: {
      role: 'Daughter, 10', type: 'girl', family: true,
      name: { en: 'Anaya', hi: 'अनाया' }, nick: { en: 'Didi', hi: 'दीदी' },
      color: '#e2ae88', hair: '#1e130c', eyes: '#3b2415',
      looks: { home: { outfit: 'jeanstop', accent: '#7c4dff' }, school: { outfit: 'schoolgirl', accent: '#1e3a8a' }, party: { outfit: 'lehenga', accent: '#7c4dff' }, wedding: { outfit: 'lehenga', accent: '#7c4dff' }, night: { outfit: 'pajamas', accent: '#b39ddb' }, rain: { outfit: 'raincoat', accent: '#7c4dff' } },
      voices: { en: { voice: 'en-US-AnaNeural', pitch: 2, rate: 2 }, hi: { voice: 'hi-IN-SwaraNeural', pitch: 22, rate: 4 } },
      traits: 'Ambivert: quiet with a book, chatty with family. Intelligent, plans step by step, brave when it matters.',
    },
    golu: {
      role: 'Son, 7', type: 'boy', family: true,
      name: { en: 'Golu', hi: 'गोलू' },
      color: '#e8b48c', hair: '#2a1a12', eyes: '#4a2c17',
      looks: { home: { outfit: 'tshirt', accent: '#ff7a1a' }, school: { outfit: 'schoolboy', accent: '#1e3a8a' }, party: { outfit: 'suit', accent: '#ff7a1a' }, wedding: { outfit: 'nehru', accent: '#ff7a1a' }, night: { outfit: 'pajamas', accent: '#ffb74d' }, rain: { outfit: 'raincoat', accent: '#ffd23f' } },
      voices: { en: { voice: 'en-US-AnaNeural', pitch: -22, rate: 12 }, hi: { voice: 'hi-IN-SwaraNeural', pitch: 30, rate: 12 } },
      traits: 'Naughty, super curious and a bit clumsy. Always asks "what does this do?" and says "Oopsie!" Big heart.',
    },
    pari: {
      role: 'Baby sister, 1', type: 'baby', family: true,
      name: { en: 'Pari', hi: 'परी' },
      color: '#f6cfae', hair: '#6b4a2b', eyes: '#5a3a1a',
      looks: { home: { outfit: 'onesie', accent: '#ff8fc8' }, party: { outfit: 'onesie', accent: '#ffd23f' }, wedding: { outfit: 'onesie', accent: '#ffd23f' }, night: { outfit: 'onesie', accent: '#b3e5fc' } },
      voices: { en: { voice: 'en-US-AnaNeural', pitch: 26, rate: -6 }, hi: { voice: 'hi-IN-SwaraNeural', pitch: 45, rate: -8 } },
      traits: 'Cute, smart and the most social baby ever. Waves at everyone. Speaks in happy baby words.',
    },

    // ---- friends and neighbours ----
    kabir: {
      role: 'Golu\'s best friend', type: 'boy',
      name: { en: 'Kabir', hi: 'कबीर' },
      color: '#c98f62', hair: '#1a110b', eyes: '#3b2415',
      looks: { home: { outfit: 'jersey', accent: '#2e7d32' }, school: { outfit: 'schoolboy', accent: '#1e3a8a' }, party: { outfit: 'kurtapajama', accent: '#2e7d32' }, wedding: { outfit: 'nehru', accent: '#2e7d32' } },
      voices: { en: { voice: 'en-US-AnaNeural', pitch: -30, rate: 10 }, hi: { voice: 'hi-IN-SwaraNeural', pitch: 26, rate: 14 } },
      traits: 'Loud, sporty, loves dinosaurs.',
    },
    meera: {
      role: 'Anaya\'s best friend', type: 'girl',
      name: { en: 'Meera', hi: 'मीरा' },
      color: '#c98f62', hair: '#1a110b', eyes: '#3b2415',
      looks: { home: { outfit: 'frock', accent: '#00897b' }, school: { outfit: 'schoolgirl', accent: '#1e3a8a' }, party: { outfit: 'salwar', accent: '#00897b' }, wedding: { outfit: 'anarkali', accent: '#00897b' } },
      voices: { en: { voice: 'en-GB-MaisieNeural', pitch: 0, rate: 4 }, hi: { voice: 'en-US-AvaMultilingualNeural', pitch: 18, rate: 4 } },
      traits: 'Giggly, loves drawing and dancing.',
    },
    teacher: {
      role: 'Class teacher', type: 'woman',
      name: { en: 'Ms. Mehta', hi: 'मेहता मैडम' },
      color: '#d9a47c', hair: '#2a1a12', eyes: '#3b2415',
      looks: { home: { outfit: 'salwar', accent: '#00897b' } },
      voices: { en: { voice: 'en-US-EmmaNeural', pitch: 2, rate: 4 }, hi: { voice: 'en-US-EmmaMultilingualNeural', pitch: 0, rate: 0 } },
      traits: 'Kind, cheerful teacher.',
    },
    doctor: {
      role: 'Family doctor', type: 'man',
      name: { en: 'Dr. Anand', hi: 'डॉक्टर आनंद' },
      color: '#c98f62', hair: '#3a2416', eyes: '#3b2415',
      looks: { home: { outfit: 'doctor', accent: '#4a7bd0' } },
      voices: { en: { voice: 'en-US-EricNeural', pitch: -2, rate: 2 }, hi: { voice: 'en-US-AndrewMultilingualNeural', pitch: -2, rate: 0 } },
      traits: 'Gentle doctor who makes kids laugh.',
    },
    inspector: {
      role: 'Police officer', type: 'man',
      name: { en: 'Inspector Singh', hi: 'इंस्पेक्टर सिंह' },
      color: '#c98f62', hair: '#1a110b', eyes: '#3b2415',
      looks: { home: { outfit: 'police', accent: '#4a7bd0' } },
      voices: { en: { voice: 'en-US-ChristopherNeural', pitch: -4, rate: 2 }, hi: { voice: 'en-US-BrianMultilingualNeural', pitch: -6, rate: 0 } },
      traits: 'Strict voice, soft heart. Salutes everyone.',
    },
    kapoor: {
      role: 'Neighbour', type: 'woman',
      name: { en: 'Mrs. Kapoor', hi: 'कपूर आंटी' },
      color: '#f1c7a0', hair: '#3a2416', eyes: '#3b2415',
      looks: { home: { outfit: 'saree', accent: '#ff7043' } },
      voices: { en: { voice: 'en-US-AriaNeural', pitch: 0, rate: 6 }, hi: { voice: 'en-US-AvaMultilingualNeural', pitch: 0, rate: 4 } },
      traits: 'Chatty neighbour who owns Mishti the cat.',
    },
    lalaji: {
      role: 'Shopkeeper', type: 'man',
      name: { en: 'Lala-ji', hi: 'लाला जी' },
      color: '#c98f62', hair: '#2a1a12', eyes: '#3b2415',
      looks: { home: { outfit: 'kurtapajama', accent: '#ffd23f' } },
      voices: { en: { voice: 'en-IN-PrabhatNeural', pitch: -6, rate: 8 }, hi: { voice: 'hi-IN-MadhurNeural', pitch: -8, rate: 8 } },
      traits: 'Cheerful market shopkeeper.',
    },
    panditji: {
      role: 'Family priest', type: 'pandit',
      name: { en: 'Pandit-ji', hi: 'पंडित जी' },
      color: '#c98b62', hair: '#2a221c', eyes: '#3b2415',
      looks: { home: { outfit: 'kurta', accent: '#ff9800' } },
      voices: { en: { voice: 'en-IN-PrabhatNeural', pitch: -8, rate: -10 }, hi: { voice: 'hi-IN-MadhurNeural', pitch: -8, rate: -12 } },
      traits: 'Calm, kind family priest. Knows every auspicious time ("shubh muhurat!"), chants slowly, secretly loves laddoos.',
    },
    chachu: {
      role: "Papa's younger brother (the groom)", type: 'man',
      name: { en: 'Chachu', hi: 'चाचू' },
      color: '#d9a47c', hair: '#1e130c', eyes: '#3b2415',
      looks: { home: { outfit: 'jeanstop', accent: '#26a69a' }, wedding: { outfit: 'groom', accent: '#f3e2c0' }, party: { outfit: 'office', accent: '#1a237e' } },
      voices: { en: { voice: 'en-US-GuyNeural', pitch: 0, rate: 6 }, hi: { voice: 'en-US-AndrewMultilingualNeural', pitch: 0, rate: 4 } },
      traits: "Fun uncle, the kids' favourite. Nervous groom.",
    },
    chachi: {
      role: "Chachu's bride", type: 'woman',
      name: { en: 'Neha Chachi', hi: 'नेहा चाची' },
      color: '#efc09a', hair: '#1e130c', eyes: '#3b2415',
      looks: { home: { outfit: 'salwar', accent: '#ab47bc' }, wedding: { outfit: 'bride', accent: '#c62828' }, party: { outfit: 'anarkali', accent: '#ab47bc' } },
      voices: { en: { voice: 'en-US-JennyNeural', pitch: 2, rate: 4 }, hi: { voice: 'en-US-EmmaMultilingualNeural', pitch: 4, rate: 2 } },
      traits: "Kind and funny. Instantly becomes Pari's best friend.",
    },
    bruno: {
      role: 'Family puppy', type: 'puppy',
      name: { en: 'Bruno', hi: 'ब्रूनो' },
      color: '#e9c9a0', accent: '#ff5c5c', eyes: '#3b2415', looks: { home: {} },
      voices: { en: { voice: 'en-US-AnaNeural', pitch: 12, rate: 20 }, hi: { voice: 'en-US-AnaNeural', pitch: 12, rate: 20 } },
      traits: 'Bouncy puppy. Says "Woof!" and steals socks.',
    },
    mishti: {
      role: 'Neighbour\'s cat', type: 'cat',
      name: { en: 'Mishti', hi: 'मिष्टी' },
      color: '#f4a24a', accent: '#7ad3ff', eyes: '#3f9a3a', looks: { home: {} },
      voices: { en: { voice: 'en-GB-MaisieNeural', pitch: 20, rate: 0 }, hi: { voice: 'en-GB-MaisieNeural', pitch: 20, rate: 0 } },
      traits: 'Fluffy, curious cat.',
    },
  },
};

export const FAMILY = ['dadaji', 'dadi', 'papa', 'mumma', 'anaya', 'golu', 'pari'];
export const LOOKS = { home: 'At home', school: 'School', party: 'Party', wedding: 'Wedding', night: 'Night', rain: 'Rainy day' };

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
function deepMerge(base, over) {
  if (!isObj(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = isObj(v) && isObj(base?.[k]) ? deepMerge(base[k], v) : v;
  return out;
}

/** Defaults with your saved edits on top (types stay fixed so stories keep making sense). */
export function mergeBible(overrides) {
  const b = deepMerge(DEFAULT_BIBLE, overrides || {});
  for (const id of Object.keys(DEFAULT_BIBLE.characters)) b.characters[id].type = DEFAULT_BIBLE.characters[id].type;
  return b;
}

/** A character's name in a language (falls back to English). */
export const nameOf = (bible, id, lang) => {
  const n = bible.characters[id]?.name || {};
  return n[lang] || n.en || id;
};

/** Cast entry for a story, dressed for the episode's look and voiced for its language. */
export function castMember(bible, id, look = 'home', lang = 'en') {
  const c = bible.characters[id];
  const l = c.looks[look] || c.looks.home || {};
  const v = c.voices[lang] || c.voices.en;
  return {
    id, name: nameOf(bible, id, lang), type: c.type, color: c.color, accent: l.accent || c.accent || '#3f8cff', hair: c.hair || '#5a3620', eyes: c.eyes,
    ...(l.outfit ? { outfit: l.outfit } : {}), voice: v.voice, pitch: v.pitch, rate: v.rate,
  };
}
