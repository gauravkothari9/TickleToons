// Golu's Vlogs: comedy episodes where Golu talks straight to the viewers with his pretend
// cardboard "vlog camera" (no real gadgets). Long vlogs are a fixed opening + closing with
// segments dropped into 'vlog' slots until the chosen length; Shorts are one quick segment.
import { FACTS } from './stories-short.js';

const CAM = 'golu:idle:boxcam';
const solo = { camera: 'closeup', minDuration: 3 };

export const VLOG_SEGMENTS = [
  {
    id: 'v-brush', where: ['vlog'],
    build(ep, { T }) {
      ep.scene('bedroom', ['golu:brush'], [
        ['golu', 'excited', T('Morning routine, step one: | brushing! | Two whole minutes. | Watch the master!', 'सुबह का रूटीन, पहला कदम: | ब्रश! | पूरे दो मिनट। | उस्ताद को देखो!')],
        ['golu', 'laugh', T('Brush, brush, brush... | [0.4] okay, done! | That was two minutes, right?', 'ब्रश, ब्रश, ब्रश... | [0.4] हो गया! | दो मिनट हो गए ना?'), 0.6],
      ], solo);
      ep.scene('bedroom', ['mumma:idle::walk-left', 'golu:brush'], [
        ['mumma', 'calm', T('That was *four seconds*, Golu. | One... | two...', 'वो *चार सेकंड* थे, गोलू। | एक... | दो...')],
        ['golu', 'surprised', T('Brushing again! | Brushing again! | Hehe.', 'फिर से ब्रश! | फिर से ब्रश! | हीही।')],
      ]);
    },
  },
  {
    id: 'v-breakfast', where: ['vlog'],
    build(ep, { T }) {
      ep.scene('kitchen', ['golu:eat:roti', 'dadi:idle:rotiplate'], [
        ['golu', 'happy', T('Food review time! | Today\'s dish: | Dadi\'s aloo paratha.', 'फ़ूड रिव्यू का टाइम! | आज की डिश: | दादी का आलू पराठा।')],
        ['golu', 'thinking', T('Hmm... | crispy outside... | soft inside... | [0.5] a little bit of love...', 'हम्म... | बाहर से कुरकुरा... | अंदर से नरम... | [0.5] और थोड़ा सा प्यार...'), 0.5],
        ['golu', 'excited', T('Ten out of ten! | No... | *one hundred* out of ten!', 'दस में से दस! | नहीं... | दस में से *सौ*!')],
        ['dadi', 'laugh', T('Hai, my little food critic!', 'हाय, मेरा छोटा फ़ूड क्रिटिक!')],
      ], solo);
    },
  },
  {
    id: 'v-tour', where: ['vlog'],
    build(ep, { T }) {
      ep.scene('bedroom', [CAM], [
        ['golu', 'excited', T('House tour! | This is my room. | My bed, | my books, | and my secret laddoo hiding place! | Oops. | Do not tell Dadi.', 'घर का टूर! | ये मेरा कमरा है। | मेरा बिस्तर, | मेरी किताबें, | और मेरे लड्डू छुपाने की गुप्त जगह! | उफ़्फ़। | दादी को मत बताना।')],
      ], solo);
      ep.scene('bedroom', ['golu:idle:boxcam', 'anaya:read'], [
        ['golu', 'happy', T('And this is Didi\'s corner... | where she reads *all day*.', 'और ये दीदी का कोना है... | जहाँ वो *पूरे दिन* पढ़ती है।')],
        ['anaya', 'angry', T('Golu! | Out of my corner! | And no filming!', 'गोलू! | मेरे कोने से बाहर! | और कोई फ़िल्मिंग नहीं!'), 0.3],
        ['golu', 'laugh', T('Moving on! | Moving on! | Hehe!', 'आगे चलो! | आगे चलो! | हीही!')],
      ]);
    },
  },
  {
    id: 'v-quiet', where: ['vlog'],
    build(ep, { T }) {
      ep.scene('house', [CAM], [
        ['golu', 'excited', T('Challenge time! | Can Golu stay *quiet*... | for one whole minute? | Starting... | now!', 'चैलेंज टाइम! | क्या गोलू *चुप* रह सकता है... | पूरे एक मिनट? | शुरू... | अब!')],
        ['golu', 'calm', T('Mmm... [1.2] mm-hmm... [0.8] mmm...', 'म्म्म... [1.2] हम्म-हम्म... [0.8] म्म्म...'), 0.2],
        ['golu', 'excited', T('Is it done? | Is it one minute? | [0.4] Oh no, I talked! | Hehe! | Challenge failed!', 'हो गया? | एक मिनट हुआ? | [0.4] अरे नहीं, मैं बोल पड़ा! | हीही! | चैलेंज फ़ेल!'), 0.6],
      ], { ...solo, minDuration: 6 });
    },
  },
  {
    id: 'v-dadaji', where: ['vlog'],
    build(ep, { T }) {
      ep.scene('house', ['golu:idle:boxcam', 'dadaji:idle'], [
        ['golu', 'happy', T('Today, a very special interview... | with the oldest person I know! | Dadaji!', 'आज एक बहुत ख़ास इंटरव्यू... | मेरी जान-पहचान के सबसे बुज़ुर्ग इंसान के साथ! | दादाजी!')],
        ['golu', 'thinking', T('Dadaji, | when you were young... | were there *dinosaurs*?', 'दादाजी, | जब आप छोटे थे... | क्या तब *डायनासोर* थे?'), 0.4],
        ['dadaji', 'laugh', T('Ha ha ha! | No, beta. | But there was no Golu either... | so it was very *peaceful*!', 'हा हा हा! | नहीं बेटा। | पर तब गोलू भी नहीं था... | तो बहुत *शांति* थी!'), 0.6],
        ['golu', 'surprised', T('Hey! | Rude!', 'अरे! | ये तो बुरी बात है!')],
      ]);
    },
  },
  {
    id: 'v-magic', where: ['vlog'],
    build(ep, { T }) {
      ep.scene('bedroom', ['golu:idle:wand', 'pari:sitfloor'], [
        ['golu', 'excited', T('Golu\'s magic show! | With my magic wand... | I will make Pari... | *disappear*!', 'गोलू का जादू शो! | अपनी जादुई छड़ी से... | मैं परी को... | *ग़ायब* कर दूँगा!')],
        ['golu', 'excited', T('Abracadabra! | [0.6] Hmm. | Abracada-*bra*!', 'अबरा-का-डबरा! | [0.6] हम्म। | अबरा-का-*डबरा*!'), 0.4],
        ['pari', 'laugh', T('Hehehe! | Pari here! | Pari here!', 'हीहीही! | परी यहीं है! | परी यहीं है!'), 0.5],
        ['golu', 'sad', T('Okay... | the magic needs *batteries*.', 'अच्छा... | जादू की *बैटरी* ख़त्म हो गई।')],
      ], solo);
    },
  },
  {
    id: 'v-bruno', where: ['vlog'],
    build(ep, { T }) {
      ep.scene('house', ['golu:idle:boxcam', 'bruno:jump'], [
        ['golu', 'happy', T('Pet corner! | Today I teach Bruno a trick. | Bruno... | *sit*!', 'पेट कॉर्नर! | आज मैं ब्रूनो को एक करतब सिखाऊँगा। | ब्रूनो... | *बैठो*!')],
        ['bruno', 'excited', T('Woof!', 'भौं!'), 0.5],
        ['golu', 'surprised', T('Not jump! | *Sit*! | [0.4] Not run! | Bruno! | Come back with my sock!', 'कूदो मत! | *बैठो*! | [0.4] भागो मत! | ब्रूनो! | मेरा मोज़ा वापस करो!')],
      ], solo);
      ep.scene('house', ['bruno:run:sock', 'golu:run'], [
        ['golu', 'laugh', T('I think... | Bruno is teaching *me* a trick! | Hehe!', 'मुझे लगता है... | ब्रूनो *मुझे* करतब सिखा रहा है! | हीही!')],
      ], { minDuration: 4 });
    },
  },
  {
    id: 'v-workout', where: ['vlog'],
    build(ep, { T }) {
      ep.scene('playground', ['golu:jumpingjacks', 'papa:jumpingjacks'], [
        ['golu', 'excited', T('Workout vlog with my Papa! | Jumping jacks! | One, two, three, four!', 'पापा के साथ वर्कआउट व्लॉग! | जंपिंग जैक्स! | एक, दो, तीन, चार!')],
        ['papa', 'scared', T('Five... | six... | Golu... | [0.4] I need... | a little rest...', 'पाँच... | छह... | गोलू... | [0.4] मुझे... | थोड़ा आराम चाहिए...'), 0.3],
      ], { minDuration: 5 });
      ep.scene('playground', ['papa:sitfloor', CAM], [
        ['golu', 'laugh', T('Papa lasted six jumps! | New world record! | Hehe!', 'पापा छह जंप तक टिके! | नया वर्ल्ड रिकॉर्ड! | हीही!')],
        ['papa', 'laugh', T('Ha ha! | Do not put that in the vlog!', 'हा हा! | ये व्लॉग में मत डालना!')],
      ]);
    },
  },
  {
    id: 'v-pari', where: ['vlog'],
    build(ep, { T }) {
      ep.scene('bedroom', ['golu:idle:boxcam', 'pari:sitfloor'], [
        ['golu', 'happy', T('Special guest! | My baby sister, Pari! | Pari, | tell everyone... | what is your favourite food?', 'ख़ास मेहमान! | मेरी छोटी बहन, परी! | परी, | सबको बताओ... | तुम्हारा फ़ेवरेट खाना क्या है?')],
        ['pari', 'excited', T('Ba-ba!', 'बा-बा!'), 0.6],
        ['golu', 'thinking', T('Ba-ba? | Banana? | Bread? | Buttons?', 'बा-बा? | बनाना? | ब्रेड? | बटन?')],
        ['pari', 'laugh', T('Golu! | Hehehe!', 'गोलू! | हीहीही!'), 0.5],
        ['golu', 'excited', T('She said my name! | Best interview *ever*!', 'उसने मेरा नाम लिया! | अब तक का *सबसे अच्छा* इंटरव्यू!')],
      ], solo);
    },
  },
  {
    id: 'v-science', where: ['vlog'],
    build(ep, { T, pick }) {
      const [en, hi, ren, rhi, act] = pick(FACTS);
      ep.scene('bedroom', ['golu:idle:boxcam', 'anaya:read'], [
        ['golu', 'excited', T('Golu\'s science minute! | Didi, | tell them a fact!', 'गोलू का साइंस मिनट! | दीदी, | इन्हें एक बात बताओ!')],
        ['anaya', 'calm', T(en, hi), 0.4],
        ['golu', ['cheer', 'jump', 'no', 'shrug', 'think'].includes(act) ? `surprised:${act}` : 'surprised', T(ren, rhi), 0.4], // acts it out, camera in hand
      ]);
    },
  },
  {
    id: 'v-market', where: ['vlog'],
    build(ep, { T }) {
      ep.scene('market', ['golu:idle:boxcam', 'lalaji:wave:banana'], [
        ['golu', 'excited', T('Market vlog! | This is Lala-ji, | the banana king!', 'मार्केट व्लॉग! | ये हैं लाला जी, | केलों के राजा!')],
        ['lalaji', 'laugh', T('Fresh, fresh, fresh! | Ha ha! | Say hello to the camera?', 'ताज़ा, ताज़ा, ताज़ा! | हा हा! | कैमरे को हैलो बोलूँ?')],
        ['golu', 'happy', T('Lala-ji, | can I have a free banana... | for my viewers?', 'लाला जी, | क्या मुझे एक केला मुफ़्त मिलेगा... | मेरे व्यूअर्स के लिए?')],
        ['lalaji', 'laugh', T('Your viewers can come and buy it! | Ha ha!', 'तुम्हारे व्यूअर्स आकर ख़रीद लें! | हा हा!'), 0.4],
      ]);
    },
  },
  {
    id: 'v-cook', where: ['vlog'],
    build(ep, { T }) {
      ep.scene('kitchen', ['golu:idle:sandwich', 'mumma:idle'], [
        ['golu', 'excited', T('Cooking with Golu! | Today\'s recipe: | the world\'s best... | *sandwich*!', 'गोलू के साथ कुकिंग! | आज की रेसिपी: | दुनिया का सबसे अच्छा... | *सैंडविच*!')],
        ['golu', 'thinking', T('Bread... | jam... | chips... | and a little bit of... | ketchup! | Hmm. | Maybe more ketchup.', 'ब्रेड... | जैम... | चिप्स... | और थोड़ा सा... | केचप! | हम्म। | शायद और केचप।'), 0.4],
        ['mumma', 'surprised', T('Golu! | Jam *and* ketchup?', 'गोलू! | जैम *और* केचप?')],
        ['golu', 'laugh', T('It is called... | *creativity*, Mumma!', 'इसे कहते हैं... | *क्रिएटिविटी*, मम्मा!')],
      ], solo);
    },
  },
  {
    id: 'v-rain', where: ['vlog'],
    build(ep, { T }) {
      ep.scene('street', ['golu:idle:umbrella'], [
        ['golu', 'excited', T('Rainy day vlog! | The best part of rain... | is *puddles*!', 'बारिश का व्लॉग! | बारिश की सबसे अच्छी बात... | है *पानी के गड्ढे*!')],
        ['golu', 'laugh:jump', T('Three... two... one... | jump! | [0.4] Splash! | Hehe! | My shoes are now... | swimming pools!', 'तीन... दो... एक... | कूदो! | [0.4] छपाक! | हीही! | मेरे जूते अब... | स्विमिंग पूल बन गए!'), 0.4],
      ], solo);
    },
  },
  {
    id: 'v-dance', where: ['vlog'],
    build(ep, { T }) {
      ep.scene('house', ['golu:hiphop', 'anaya:idle'], [
        ['golu', 'excited', T('Dance tutorial! | Step one: | wiggle like a noodle! | Step two: | spin like a fan!', 'डांस ट्यूटोरियल! | पहला स्टेप: | नूडल की तरह हिलो! | दूसरा स्टेप: | पंखे की तरह घूमो!')],
        ['anaya', 'laugh', T('Golu... | that is not a dance. | That is a *washing machine*!', 'गोलू... | ये डांस नहीं है। | ये तो *वॉशिंग मशीन* है!'), 0.4],
      ], { minDuration: 5 });
      ep.scene('house', ['golu:dance', 'anaya:dance', 'pari:clap'], [
        ['golu', 'laugh', T('See? | Now Didi is dancing too! | It works!', 'देखा? | अब दीदी भी नाच रही है! | काम कर गया!')],
      ], { minDuration: 4, camera: 'orbit' });
    },
  },
];

const OPEN = (T) => T('Hello, hello, hello, | my Golu Gang! | Welcome back to my *vlog*!', 'हैलो, हैलो, हैलो, | मेरी गोलू गैंग! | मेरे *व्लॉग* में आपका स्वागत है!');
const CAMERA_JOKE = (T) => T('And yes... | my camera is a *box*. | But it is a very *professional* box!', 'और हाँ... | मेरा कैमरा एक *डिब्बा* है। | पर बहुत *प्रोफ़ेशनल* डिब्बा है!');

export const VLOG_TEMPLATES = [
  {
    id: 'vlog-day', theme: 'vlog', moral: false, vlog: true, look: 'home',
    build(ep, { T, pick }) {
      ep.title = pick([T('Golu\'s Vlog: A Day in My Life! 😂', 'गोलू का व्लॉग: मेरी ज़िंदगी का एक दिन! 😂'), T('Golu\'s Vlog: My Crazy Sunday! 🤪', 'गोलू का व्लॉग: मेरा पागल संडे! 🤪')]);
      ep.summary = T('Golu grabs his cardboard camera and shows you his whole day. What could go wrong? Everything!', 'गोलू अपना गत्ते का कैमरा उठाकर आपको अपना पूरा दिन दिखाता है। क्या गड़बड़ होगी? सब कुछ!');
      ep.music = 'silly';
      ep.scene('bedroom', [CAM], [['golu', 'excited', OPEN(T)], ['golu', 'laugh', CAMERA_JOKE(T), 0.4]], solo);
      ep.scene('bedroom', [CAM], [['golu', 'happy', T('Today I will show you... | my *whole* day! | Let us go!', 'आज मैं आपको दिखाऊँगा... | अपना *पूरा* दिन! | चलो चलते हैं!')]], solo);
      ep.slot('vlog'); ep.slot('vlog'); ep.slot('vlog'); ep.slot('vlog'); ep.slot('vlog'); ep.slot('vlog');
      ep.scene('bedroom', ['golu:yawn:boxcam'], [
        ['golu', 'calm', T('And that... | was my day. | [0.5] I am *so* tired...', 'और ये था... | मेरा दिन। | [0.5] मैं *बहुत* थक गया...')],
        ['golu', 'excited:wave', T('If you liked it... | do the Golu dance! | See you in the next vlog! | Golu out!', 'अगर अच्छा लगा हो... | गोलू डांस करो! | अगले व्लॉग में मिलते हैं! | गोलू आउट!'), 0.5],
      ], solo);
    },
  },
  {
    id: 'vlog-review', theme: 'vlog', moral: false, vlog: true, look: 'home',
    build(ep, { T }) {
      ep.title = T('Golu Reviews EVERYTHING! ⭐⭐⭐⭐⭐', 'गोलू ने सब कुछ रिव्यू किया! ⭐⭐⭐⭐⭐');
      ep.summary = T('Food, family, the dog... Golu gives star ratings to everything in the house!', 'खाना, परिवार, कुत्ता... गोलू घर की हर चीज़ को स्टार देता है!');
      ep.music = 'silly';
      ep.scene('kitchen', [CAM], [['golu', 'excited', OPEN(T)], ['golu', 'happy', T('Today is *review day*! | I give stars to everything in my house!', 'आज है *रिव्यू डे*! | मैं अपने घर की हर चीज़ को स्टार दूँगा!'), 0.3]], solo);
      ep.slot('vlog'); ep.slot('vlog'); ep.slot('vlog'); ep.slot('vlog'); ep.slot('vlog'); ep.slot('vlog');
      ep.scene('house', ['golu:idle:boxcam', 'anaya:idle', 'papa:idle', 'mumma:idle', 'pari:idle'], [
        ['golu', 'happy', T('And my family... | gets... | [0.6] five stars! | No... | *five hundred* stars!', 'और मेरे परिवार को... | मिलते हैं... | [0.6] पाँच स्टार! | नहीं... | *पाँच सौ* स्टार!')],
        ['anaya', 'laugh', T('Aww, Golu! | Okay... | you get five stars too.', 'आह्ह, गोलू! | अच्छा... | तुम्हें भी पाँच स्टार।'), 0.4],
        ['golu', 'excited', T('Golu out! | Byeee!', 'गोलू आउट! | बाय्य!')],
      ]);
    },
  },
  {
    id: 'vlog-challenge', theme: 'vlog', moral: false, vlog: true, look: 'home',
    build(ep, { T }) {
      ep.title = T('Golu\'s Crazy Challenge Day! 🏆', 'गोलू का पागल चैलेंज डे! 🏆');
      ep.summary = T('Golu takes on the hardest challenges in the world. Like staying quiet. He is not good at it.', 'गोलू दुनिया के सबसे मुश्किल चैलेंज लेता है। जैसे चुप रहना। वो इसमें अच्छा नहीं है।');
      ep.music = 'happy';
      ep.scene('house', [CAM], [['golu', 'excited', OPEN(T)], ['golu', 'excited', T('Today is *challenge day*! | Golu versus... | everything!', 'आज है *चैलेंज डे*! | गोलू बनाम... | सब कुछ!'), 0.3]], solo);
      ep.slot('vlog'); ep.slot('vlog'); ep.slot('vlog'); ep.slot('vlog'); ep.slot('vlog'); ep.slot('vlog');
      ep.scene('house', ['golu:cheer:boxcam', 'pari:clap'], [
        ['golu', 'excited', T('Challenges won: | zero. | Fun had: | one *million*! | That is a win! | Golu out!', 'जीते चैलेंज: | ज़ीरो। | मज़ा आया: | दस *लाख*! | ये तो जीत है! | गोलू आउट!')],
        ['pari', 'laugh', T('Yaaay!', 'येएए!'), 0.3],
      ], solo);
    },
  },
];

export const VLOG_SHORT_TEMPLATES = [
  {
    id: 'short-vlog', theme: 'vlog', moral: false, vlog: true, look: 'home',
    build(ep, c) {
      const { T, pick } = c;
      const seg = pick(VLOG_SEGMENTS);
      const titles = {
        'v-brush': ['Golu\'s 4-Second Brushing Routine 🪥😂', 'गोलू का 4 सेकंड वाला ब्रश 🪥😂'],
        'v-breakfast': ['Golu Reviews Dadi\'s Paratha 🤤', 'गोलू ने दादी के पराठे का रिव्यू किया 🤤'],
        'v-tour': ['Golu\'s Secret Room Tour 🤫', 'गोलू के कमरे का गुप्त टूर 🤫'],
        'v-quiet': ['Can Golu Stay Quiet for 1 Minute? 🤐', 'क्या गोलू 1 मिनट चुप रह पाएगा? 🤐'],
        'v-dadaji': ['Were Dinosaurs Alive When Dadaji Was Young? 🦖', 'क्या दादाजी के ज़माने में डायनासोर थे? 🦖'],
        'v-magic': ['Golu\'s Magic Trick FAIL 🪄😂', 'गोलू का जादू फ़ेल 🪄😂'],
        'v-bruno': ['Golu Teaches Bruno a Trick 🐶', 'गोलू ने ब्रूनो को करतब सिखाया 🐶'],
        'v-workout': ['Papa\'s 6-Jump Workout 💪😂', 'पापा का 6 जंप वाला वर्कआउट 💪😂'],
        'v-pari': ['Interviewing Baby Pari 🎤👶', 'बेबी परी का इंटरव्यू 🎤👶'],
        'v-science': ['Golu\'s Science Minute 🔬', 'गोलू का साइंस मिनट 🔬'],
        'v-market': ['Golu Asks for a FREE Banana 🍌', 'गोलू ने मुफ़्त केला माँगा 🍌'],
        'v-cook': ['Golu\'s Jam + Ketchup Sandwich 🥪🤢', 'गोलू का जैम-केचप सैंडविच 🥪🤢'],
        'v-rain': ['Golu vs Puddles 🌧️', 'गोलू बनाम पानी के गड्ढे 🌧️'],
        'v-dance': ['Golu\'s Washing Machine Dance 💃😂', 'गोलू का वॉशिंग मशीन डांस 💃😂'],
      }[seg.id] || ['Golu\'s Vlog 😂', 'गोलू का व्लॉग 😂'];
      ep.title = T(titles[0], titles[1]);
      ep.summary = T('A quick, silly moment from Golu\'s vlog!', 'गोलू के व्लॉग का एक मज़ेदार पल!');
      ep.music = 'silly';
      ep.scene('house', [CAM], [['golu', 'excited', T('Hello, Golu Gang! | Quick vlog!', 'हैलो, गोलू गैंग! | छोटा सा व्लॉग!')]], { ...solo, minDuration: 2 });
      seg.build(ep, c);
      ep.slot('short');
    },
  },
];
