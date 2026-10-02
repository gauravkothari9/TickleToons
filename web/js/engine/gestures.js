// Gestures that go with the words: a character who says "Bye!" waves, "Yes!" nods, "No!" shakes
// the head, "Look!" points, "Yay!" cheers, "Hmm..." thinks, "I don't know" shrugs, "Thank you"
// folds hands. The shot's action is what the body does for the whole shot; a gesture plays on top
// of it only while the matching words are spoken, then the body goes back to the shot's action.
// English and Hindi. A line can pick its own gesture (line.gesture) or turn it off ('none').
import { displayText } from './audio.js';

export const GESTURES = {
  auto: 'Auto (from the words)', none: 'None',
  wave: 'Wave', namaste: 'Namaste', yes: 'Nod yes', no: 'Shake head no', point: 'Point', cheer: 'Cheer',
  clap: 'Clap', think: 'Think', shrug: 'Shrug', lookaround: 'Look around', stomp: 'Stomp (angry)',
  bow: 'Bow', salute: 'Salute', sad: 'Hang head', jump: 'Jump for joy',
};

// Hindi has no \b: a "word" edge is anything that is not a letter or a vowel sign.
const W0 = '(?<![\\p{L}\\p{M}\'’])', W1 = '(?![\\p{L}\\p{M}\'’])'; // "won" is not "won't"
const words = (list) => new RegExp(`${W0}(?:${list.join('|')})${W1}`, 'iu');
const starts = (list) => new RegExp(`^[\\s"'“(.…-]*(?:${list.join('|')})${W1}`, 'iu');
// a one-word answer: "No!", "Yes, Mumma.", "हाँ।" but not "No one" or "Yes we can"
const answer = (list) => new RegExp(`^[\\s"'“(.…-]*(?:${list.join('|')})(?=\\s*[,.!?…।~-]|\\s*$)`, 'iu');

// Checked in this order for each part of a line; the first that fits wins.
const RULES = [
  { g: 'salute', re: words(['yes,? sir', "yes,? ma'?am", 'aye,? aye', 'जी सर', 'जी मैडम', 'यस सर', 'सलाम']) },
  { g: 'namaste', re: words(['namaste', 'namaskar', 'pranam', 'नमस्ते', 'नमस्कार', 'प्रणाम', 'thank you', 'thanks', 'थैंक यू', 'थैंक्यू', 'धन्यवाद', 'शुक्रिया']) },
  { g: 'wave', re: words(['hi+', 'hello+', 'bye+', 'bye-bye', 'bye bye', 'goodbye', 'good night', 'welcome',
    'see you(?= (?:soon|later|tomorrow|next|at|there|tonight|again|in)|\\s*[,.!?…]|\\s*$)',
    'हा+य', 'हैलो', 'हेलो', 'बा+य्?य?', 'अलविदा', 'गुड नाइट', 'मिलते हैं(?=\\s*[!।]|\\s*$)', 'फिर मिलेंगे', 'स्वागत']),
    // "Hey! That's mine!" and "हाय राम!" are not hellos
    not: (t) => /हाय\s*(राम|रे|दैया|मेरी|मेरा|हाय)/u.test(t) },
  { g: 'cheer', re: words(['yay+', 'yaay+', 'hooray', 'hurray', 'yippee+', 'woo+-?hoo+', 'we did it', 'i did it', 'we won', 'i won', 'we made it',
    'या+य', 'हुर्रे', 'हुर्रे+', 'जीत गए', 'जीत गई', 'जीत गया', 'कर दिखाया', 'हम जीत']) },
  { g: 'clap', re: words(['well done', 'bravo', 'good job', 'great job', 'well said', 'शाबाश', 'बहुत बढ़िया', 'बहुत अच्छे', 'बहुत अच्छा बोला']) },
  { g: 'shrug', re: starts(['who knows']) },
  { g: 'shrug', re: words(["i don'?t know", 'i do not know', 'no idea', "i don'?t remember", 'i forgot', 'how should i know',
    'पता नहीं(?=\\s*[,.!?…।]|\\s*$)', 'मुझे नहीं पता', 'क्या पता', 'कौन जाने', 'याद नहीं', 'भूल (?:गया|गई)(?: था| थी)?(?=\\s*[,.!?…।]|\\s*$)']) },
  { g: 'stomp', re: words(['no fair', 'not fair', "that'?s not fair", 'ये ग़लत है', 'ये गलत है', 'ना-इंसाफ़ी', 'नाइंसाफ़ी']) },
  { g: 'bow', re: words(["i'?m sorry", 'i am sorry', 'sorry', 'माफ़ कर दो', 'माफ़ कीजिए', 'माफ़ करना', 'सॉरी']) },
  { g: 'point', re: starts(['look', 'see', 'there it is', 'there he is', 'there she is', 'there they are', 'there you are', 'over there', 'that one', 'this one', 'देखो', 'वो देखो', 'ये देखो', 'वो रहा', 'वो रही', 'वहाँ', 'उधर']) },
  { g: 'point', re: words(['over there', 'right there', 'up there', 'down there', 'look at that', 'look at this', 'उधर देखो', 'वहाँ देखो', 'वो देखो']) },
  { g: 'think', re: starts(['hmm+', 'umm+', 'hm+', 'let me think', 'i wonder', 'maybe', 'what if', 'हम्म+', 'उम्म+', 'सोचने दो', 'शायद', 'मुझे लगता है', 'सोचो']) },
  { g: 'no', re: answer(['no+', 'no,? no+', 'nope', 'nah', 'never', 'not now', 'not me', 'no way', 'नहीं', 'ना', 'नहीं,? नहीं', 'बिल्कुल नहीं', 'कभी नहीं', 'अभी नहीं']) },
  { g: 'yes', re: answer(['yes+', 'yes,? yes+', 'yeah', 'yep', 'okay', 'ok', 'okay,? okay', 'sure', 'of course', 'correct', 'right', 'alright', 'all right', 'deal', 'promise', 'i promise', 'got it',
    'हाँ', 'हां', 'हाँ,? हाँ', 'जी', 'जी हाँ', 'ठीक है', 'सही', 'सही जवाब', 'बिल्कुल', 'पक्का', 'डन', 'ओके', 'प्रॉमिस', 'वादा', 'वादा रहा', 'समझ गया', 'समझ गई']) },
  { g: 'lookaround', re: /^[\s"'“(]*(?:where|where'?s|कहाँ|कहां)(?![\p{L}\p{M}]).*\?\s*$|(?:कहाँ|कहां)\s*(?:है|गए|गई|गया|हो)\s*\??\s*$/iu },
];

/** Pieces of a line, split where the voice pauses ("|", sentence ends), with where each piece sits (0..1). */
function parts(text) {
  const raw = String(text || '');
  const pieces = raw.split(/(\||(?<=[.!?।…])\s+)/).filter((p) => p && p !== '|' && p.trim());
  const shown = pieces.map((p) => displayText(p));
  const total = shown.reduce((a, s) => a + s.length, 0) || 1;
  let at = 0;
  return shown.map((s) => { const from = at / total; at += s.length; return { text: s, from, to: at / total }; }).filter((p) => p.text);
}

/**
 * The gestures a line asks for: [{ action, from, to }] with from/to as fractions of the line's
 * running time. At most two per line, never the same one twice in a row.
 */
export function lineGestures(line) {
  const forced = line.gesture && line.gesture !== 'auto' ? line.gesture : null;
  if (forced === 'none') return [];
  if (forced) return GESTURES[forced] ? [{ action: forced, from: 0, to: 1 }] : [];
  const out = [];
  for (const p of parts(line.text)) {
    let g = RULES.find((r) => r.re.test(p.text) && !(r.not && r.not(p.text, line.emotion)))?.g;
    if (!g) continue;
    // the feeling decides the flavour: a sad "sorry" hangs the head, a happy "yes!" can be a cheer
    if (g === 'bow' && ['sad', 'scared'].includes(line.emotion)) g = 'sad';
    if (g === 'yes' && line.emotion === 'excited' && /^\W*yes+\W*!+\W*$/i.test(p.text)) g = 'cheer';
    if (g === 'cheer' && ['sad', 'scared', 'angry', 'thinking', 'calm'].includes(line.emotion)) continue; // "if India wins..." is not a cheer
    if (g === 'no' && line.emotion === 'angry') g = 'stomp';
    if (out.length && out[out.length - 1].action === g) { out[out.length - 1].to = p.to; continue; }
    out.push({ action: g, from: p.from, to: p.to });
    if (out.length >= 2) break;
  }
  return out;
}

/**
 * Turn a line's gestures into time windows (shot-local seconds) for the stage.
 * Short words still get time for the gesture to read (at least 1.3 s).
 */
export function gestureWindows(line, start, end) {
  const dur = Math.max(0.1, end - start);
  return lineGestures(line).map(({ action, from, to }) => {
    const s = start + from * dur - 0.15;
    return { action, start: s, end: Math.max(s + 1.3, start + to * dur + 0.35) };
  });
}
