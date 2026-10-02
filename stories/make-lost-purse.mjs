// Builds "Aarav and the Lost Purse.json" (open it in the studio: Story > Open story file).
// Delivery markup in lines:  |  short beat,  [0.8]  pause in seconds,  *words*  stressed.
import { writeFileSync } from 'node:fs';

let n = 0;
const id = () => `l${++n}`;
const C = (cid, name, type, extra) => ({ id: cid, name, type, ...extra });
const cast = [
  C('aarav', 'Aarav', 'boy', { color: '#e8b48c', accent: '#1e4fbf', hair: '#2a1a12', eyes: '#4a2c17', outfit: 'schoolboy', voice: 'en-US-AnaNeural', pitch: -20, rate: 8 }),
  C('riya', 'Riya', 'girl', { color: '#e2ae88', accent: '#c62848', hair: '#1e130c', eyes: '#3b2415', outfit: 'schoolgirl', voice: 'en-US-AnaNeural', pitch: 8, rate: 8 }),
  C('kabir', 'Kabir', 'boy', { color: '#c98f62', accent: '#2e7d32', hair: '#1a110b', eyes: '#3b2415', outfit: 'schoolboy', voice: 'en-US-AnaNeural', pitch: -28, rate: 14 }),
  C('mom', 'Mumma', 'woman', { color: '#e2ae88', accent: '#e0457b', hair: '#1e130c', eyes: '#3b2415', outfit: 'saree', voice: 'en-IN-NeerjaNeural', pitch: 0, rate: 8 }),
  C('dadi', 'Dadi', 'grandma', { color: '#e0ad88', accent: '#8e5bd0', hair: '#dcdcdc', eyes: '#3b2415', outfit: 'saree', voice: 'en-IN-NeerjaNeural', pitch: -14, rate: -4 }),
  C('dadaji', 'Dadaji', 'grandpa', { color: '#d6a07a', accent: '#f2efe6', hair: '#e6e6e6', eyes: '#3b2415', outfit: 'kurtapajama', voice: 'en-IN-PrabhatNeural', pitch: -10, rate: 0 }),
  C('teacher', 'Ms. Mehta', 'woman', { color: '#d9a47c', accent: '#00897b', hair: '#2a1a12', eyes: '#3b2415', outfit: 'salwar', voice: 'en-US-EmmaNeural', pitch: 2, rate: 6 }),
  C('inspector', 'Inspector Singh', 'man', { color: '#c98f62', accent: '#4a7bd0', hair: '#1a110b', eyes: '#3b2415', outfit: 'police', voice: 'en-US-ChristopherNeural', pitch: -4, rate: 4 }),
  C('kapoor', 'Mrs. Kapoor', 'woman', { color: '#f1c7a0', accent: '#ff7043', hair: '#3a2416', eyes: '#3b2415', outfit: 'saree', voice: 'en-US-AriaNeural', pitch: 0, rate: 8 }),
  C('chintu', 'Chintu', 'boy', { color: '#f1c7a0', accent: '#7c4dff', hair: '#5a3620', eyes: '#6b4423', outfit: 'suit', voice: 'en-GB-MaisieNeural', pitch: -8, rate: 12 }),
];

// a(castId, x, z, action, mood, holds, enter, exit)
const a = (castId, x, z, action = 'idle', mood = 'happy', holds = 'none', enter = 'none', exit = 'none') => ({ castId, x, z, action, mood, holds, enter, exit });
// L(castId, emotion, text, pauseBefore?)  — pauseBefore overrides the automatic conversational gap
const L = (castId, emotion, text, pause) => ({ id: id(), castId, emotion, text, ...(pause !== undefined ? { pause } : {}) });
const shot = (world, actors, lines, { camera = 'auto', transition = 'cut', minDuration = 4, props = [] } = {}) => ({ id: id(), world, camera, transition, minDuration, actors, props, lines });

const shots = [
  // ---- morning at home ----
  shot('bedroom', [a('aarav', 0, -0.5, 'sleep', 'calm')], [
    L('dadaji', 'calm', 'Once upon a time, | there lived a little boy | named *Aarav*.'),
    L('dadaji', 'happy', 'And every morning, Aarav wanted just... [0.3] *five* more minutes of sleep!', 0.6),
  ], { camera: 'push', transition: 'fade', minDuration: 4 }),
  shot('bedroom', [a('aarav', 0.6, 0, 'yawn', 'calm'), a('mom', -1.2, 0.2, 'idle', 'happy', 'none', 'walk-left')], [
    L('mom', 'happy', 'Aaa-raaav! [0.3] Wake up, sleepyhead! The sun is already up!'),
    L('aarav', 'calm', 'Mmmm... [0.5] just five more minutes, Mumma...'),
    L('mom', 'laugh', 'Ha ha! | No more minutes, mister. School is waiting!'),
    L('aarav', 'excited', 'Okay, okay! [0.2] I am up! I am up!'),
  ]),
  shot('bedroom', [a('aarav', -1.2, 0, 'brush', 'happy'), a('riya', 1.2, 0.2, 'idle', 'excited', 'none', 'run-right')], [
    L('riya', 'excited', 'Bhaiya, hurry! | Today is the *big* drawing competition!'),
    L('aarav', 'surprised', 'Oh no! [0.25] I almost forgot! | I *really* want that golden trophy!'),
  ]),
  shot('kitchen', [a('aarav', -1.4, 0.4, 'eat', 'happy'), a('riya', 0, 0.6, 'drink', 'happy'), a('dadi', 1.5, 0.2, 'idle', 'happy', 'laddoo')], [
    L('dadi', 'happy', 'Eat up, my little champions!'),
    L('dadi', 'laugh', 'And... [0.3] one laddoo each, | for good luck!'),
    L('aarav', 'excited', 'Yaaay! Laddoos! | Thank you, Dadi!'),
  ], { transition: 'fade' }),

  // ---- off to school ----
  shot('street', [a('aarav', -0.8, 0.2, 'idle', 'happy', 'schoolbag', 'walk-left'), a('riya', 0.4, 0.3, 'idle', 'happy', 'schoolbag', 'walk-left'),
    a('mom', -2.2, 0, 'wave', 'happy', 'none', 'walk-left'), a('kabir', 1.9, 0, 'wave', 'excited', 'schoolbag', 'run-right')], [
    L('kabir', 'excited', 'Aarav! | Riya! | Wait for meee!', 0.3),
    L('aarav', 'happy', 'Good morning, Kabir! Ready for the competition?'),
    L('kabir', 'excited', 'Ready? | I am going to draw a *giant* dinosaur! [0.3] Roooar!'),
    L('mom', 'happy', 'Stay together, children. | And cross only at the zebra crossing!'),
    L('aarav', 'happy', 'Yes, Mumma! | Bye bye!'),
  ], { transition: 'fade' }),
  shot('school', [a('aarav', -1.4, 0, 'walkaround', 'happy', 'schoolbag'), a('riya', 0.2, 0.3, 'jumprope', 'excited'), a('kabir', 1.8, 0, 'kick', 'excited')], [
    L('dadaji', 'happy', 'At school, the children played and played... [0.4] until the bell rang!', 0.8),
  ], { minDuration: 6 }),

  // ---- the competition ----
  shot('classroom', [a('teacher', 0, -0.8, 'idle', 'happy', 'trophy'), a('aarav', -2.2, 0.6, 'idle', 'happy'), a('riya', 2.2, 0.6, 'idle', 'happy'), a('kabir', -0.9, 1.1, 'idle', 'excited')], [
    L('teacher', 'happy', 'Good morning, class! | Today is our drawing competition.'),
    L('teacher', 'excited', 'And the best picture wins... [0.5] this *golden* trophy!'),
    L('kabir', 'surprised', 'Whoaaa! It sparkles!'),
  ], { transition: 'fade' }),
  shot('classroom', [a('teacher', 0, -0.8, 'idle', 'happy', 'trophy'), a('aarav', -2.2, 0.6, 'raisehand', 'excited'), a('riya', 2.2, 0.6, 'idle', 'happy')], [
    L('aarav', 'excited', 'Ma\'am! Ma\'am! | What should we draw?'),
    L('teacher', 'happy', 'Draw what makes you *happy*. [0.3] Ready... | steady... | draw!'),
  ]),
  shot('classroom', [a('aarav', -1.6, 0, 'study', 'thinking'), a('riya', 1.4, 0.2, 'paint', 'happy')], [
    L('aarav', 'thinking', 'Hmmm... [0.6] I know! | I will draw my whole family, | holding hands.'),
    L('riya', 'happy', 'Awww, Bhaiya! | That is *so* beautiful!'),
  ], { minDuration: 5 }),
  shot('classroom', [a('teacher', 0, -0.8, 'clap', 'happy'), a('kabir', -1.8, 0.6, 'sad', 'sad'), a('aarav', 1.8, 0.6, 'idle', 'happy')], [
    L('teacher', 'happy', 'Wonderful work, everyone! | I will announce the winner... [0.3] tomorrow.'),
    L('kabir', 'sad', 'Tomorrow? [0.4] Ohhh... | I cannot wait that long!'),
  ]),

  // ---- the market ----
  shot('market', [a('dadi', -1.2, 0, 'cart', 'happy'), a('riya', 0.8, 0.3, 'idle', 'excited', 'none', 'walk-left'), a('aarav', 2.0, 0.2, 'idle', 'happy', 'none', 'walk-left')], [
    L('dadaji', 'happy', 'After school, Dadi took the children to the busy, | noisy market.', 0.8),
    L('dadi', 'happy', 'Stay close to me, children!'),
  ], { transition: 'fade' }),
  shot('market', [a('aarav', -0.9, 0, 'point', 'surprised'), a('kabir', 1.0, 0.2, 'idle', 'surprised', 'none', 'run-right')], [
    L('aarav', 'surprised', 'Hey! [0.3] What is this? | Somebody dropped a purse!', 0.8),
    L('kabir', 'excited', 'Ooh! I saw it too! | Open it, open it!'),
  ], { props: [{ kind: 'purse', x: 0, z: 0.9 }] }),
  shot('market', [a('aarav', -0.9, 0, 'idle', 'surprised', 'purse'), a('kabir', 1.0, 0.2, 'cheer', 'excited')], [
    L('kabir', 'excited', 'Whoa! [0.3] It is *full* of money! | We can buy *so* many toys!'),
    L('aarav', 'thinking', 'But Kabir... [0.6] this money is not *ours*.', 0.7),
    L('kabir', 'happy', 'Nobody saw us! | Finders keepers!'),
  ]),
  shot('market', [a('aarav', -0.9, 0, 'think', 'thinking', 'purse'), a('riya', 0.4, 0.4, 'sad', 'sad', 'none', 'walk-right'), a('kabir', 1.7, 0.2, 'shrug', 'thinking')], [
    L('aarav', 'thinking', 'Hmm... [0.5] what if someone is looking for it... | right now?'),
    L('riya', 'sad', 'Maybe they are *very* worried, Bhaiya.'),
    L('aarav', 'happy', 'Dadi always says... [0.4] if it is not ours, | we *give it back*.', 0.6),
    L('kabir', 'thinking', 'Hmm... [0.5] Okay. | You are right. Let us find the owner.'),
  ]),
  shot('market', [a('dadi', -1.6, 0, 'idle', 'happy', 'none', 'walk-left'), a('aarav', 0, 0.3, 'idle', 'happy', 'purse'), a('riya', 1.3, 0.3, 'idle', 'happy'), a('kabir', 2.5, 0.2, 'idle', 'happy')], [
    L('aarav', 'happy', 'Dadi! | We found this purse on the ground.'),
    L('dadi', 'excited', 'Arre wah! My *honest* children! [0.3] Come, | to the police station!'),
  ]),

  // ---- the police station ----
  shot('police', [a('inspector', 1.6, -0.4, 'salute', 'happy'), a('aarav', -0.6, 0.3, 'idle', 'happy', 'purse', 'walk-left'), a('riya', -1.8, 0.4, 'idle', 'happy', 'none', 'walk-left'),
    a('kabir', -3.0, 0.3, 'idle', 'happy', 'none', 'walk-left')], [
    L('inspector', 'happy', 'Hello, children! | How can I help you?'),
    L('aarav', 'happy', 'Sir, | we found this purse in the market. | It is not ours.'),
    L('inspector', 'surprised', 'You brought it *all* the way here? [0.3] That is *very* honest of you!'),
  ], { transition: 'fade' }),
  shot('police', [a('kapoor', 2.2, 0.2, 'cry', 'sad', 'none', 'run-right'), a('inspector', 0.6, -0.4, 'idle', 'happy'), a('aarav', -0.8, 0.3, 'idle', 'surprised', 'purse'), a('riya', -2.0, 0.4, 'idle', 'surprised')], [
    L('kapoor', 'scared', 'Inspector sir! | Inspector sir! [0.3] I lost my purse in the market!', 1.2),
    L('kapoor', 'sad', 'It had the money... [0.4] for my son\'s birthday party.'),
    L('inspector', 'happy', 'Madam, | is *this* your purse? | These children found it.'),
    L('kapoor', 'surprised', 'My purse! [0.4] Oh, thank you! | Thank you *so* much!'),
  ]),
  shot('police', [a('kapoor', 1.6, 0.2, 'namaste', 'happy', 'none'), a('aarav', -0.4, 0.3, 'idle', 'happy'), a('riya', -1.6, 0.4, 'cheer', 'excited'), a('inspector', 3.0, -0.4, 'salute', 'happy')], [
    L('kapoor', 'excited', 'Please, | come to my son Chintu\'s birthday party tomorrow!'),
    L('riya', 'excited', 'A birthday party? [0.2] Yaaay!'),
    L('inspector', 'happy', 'Honest children... [0.3] make our town a *better* place.', 0.6),
  ]),

  // ---- next day ----
  shot('classroom', [a('teacher', 0, -0.8, 'idle', 'happy', 'trophy'), a('aarav', -1.8, 0.6, 'idle', 'surprised'), a('kabir', 1.8, 0.6, 'clap', 'happy')], [
    L('teacher', 'excited', 'And the winner is... [0.9] *Aarav*! | For his lovely family picture!', 0.8),
    L('aarav', 'surprised', 'Me? [0.3] Really? | Thank you, Ma\'am!'),
  ], { transition: 'fade' }),
  shot('classroom', [a('aarav', -1.6, 0.4, 'cheer', 'excited', 'trophy'), a('teacher', 0, -0.8, 'idle', 'happy'), a('kabir', 1.6, 0.6, 'idle', 'happy')], [
    L('teacher', 'happy', 'I also heard how honest you were yesterday. | I am *so* proud of you.'),
    L('kabir', 'happy', 'Aarav taught me something... [0.4] being honest is *better* than any toy!', 0.6),
  ]),

  // ---- the party ----
  shot('birthday', [a('chintu', 0, 0, 'cheer', 'excited'), a('kapoor', 1.6, -0.3, 'clap', 'happy'), a('aarav', -1.4, 0.4, 'idle', 'happy', 'gift', 'walk-left'), a('riya', -2.6, 0.5, 'idle', 'happy', 'balloon', 'walk-left')], [
    L('chintu', 'excited', 'Welcome to my party! | Thank you for finding Mummy\'s purse!'),
    L('aarav', 'happy', 'Happy birthday, Chintu! | This gift is for you.'),
    L('kapoor', 'excited', 'Come on, everyone! | Let\'s cut the cake!'),
  ], { transition: 'fade' }),
  shot('birthday', [a('chintu', 0, 0, 'bhangra', 'excited'), a('aarav', -1.5, 0.3, 'dance', 'excited'), a('riya', 1.5, 0.3, 'twirl', 'excited'), a('kabir', -2.9, 0.4, 'hiphop', 'excited'), a('kapoor', 2.9, -0.2, 'clap', 'happy')], [
    L('dadaji', 'laugh', 'Everybody danced... | and laughed... | and it was the *best* party ever!', 0.8),
  ], { camera: 'orbit', minDuration: 6 }),

  // ---- the moral ----
  shot('house', [a('dadaji', 0, -0.4, 'idle', 'happy'), a('aarav', -1.5, 0.5, 'sitfloor', 'happy'), a('riya', 1.5, 0.5, 'sitcross', 'happy')], [
    L('dadaji', 'happy', 'So, children... [0.4] what did we learn from Aarav\'s story?'),
    L('riya', 'happy', 'If we find something that is not ours... [0.3] we *always* give it back!', 0.7),
    L('dadaji', 'excited', 'That\'s right! [0.4] Honesty | is the *best* policy.'),
    L('dadaji', 'calm', 'Be honest, | be kind... [0.4] and you will always shine, | like a golden trophy.', 0.6),
  ], { transition: 'fade', camera: 'auto' }),
  shot('house', [a('aarav', -1.0, 0.3, 'wave', 'excited'), a('riya', 1.0, 0.3, 'wave', 'excited'), a('dadaji', 0, -0.6, 'wave', 'happy')], [
    L('aarav', 'excited', 'Bye bye, friends! | Always be honest!'),
    L('riya', 'excited', 'See you next time!'),
  ], { camera: 'wide', minDuration: 5 }),
];

const story = { title: 'Aarav and the Lost Purse', aspect: '16:9', music: 'happy', musicVolume: 0.5, subtitles: true, titleCard: true, cast, shots };
writeFileSync(new URL('./Aarav and the Lost Purse.json', import.meta.url), JSON.stringify(story, null, 2));
console.log(`${shots.length} shots, ${shots.reduce((s, x) => s + x.lines.length, 0)} lines`);
