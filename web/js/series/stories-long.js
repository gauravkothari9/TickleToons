// Long-episode stories, part 1: experiments, family trips, pets, school and friends.
// (Part 2 is stories-long-2.js; everyday family life is stories-everyday.js.)
//
// HOW THESE ARE WRITTEN
// - One story, one problem. Each episode is a single plot: a want, a mistake or problem, it gets
//   worse, someone helps, it gets fixed, a small funny button at the end. No random jokes, riddles,
//   dance breaks or fun facts dropped in the middle.
// - Long enough on its own. Scenes marked optional are this story's own side moments; the generator
//   cuts them (optional 3 first, then 2, then 1) when the episode would run too long. Cutting one
//   never breaks the plot.
// - Clear dialogue. Short, complete sentences a 6-year-old can follow. People say what they want and
//   what they feel, so the story is clear even with the sound only. Few "Hehe" and "Hai Ram":
//   at most once a scene, only when it fits.
// - Same characters every time: Golu (7) is curious, impatient, funny and kind. Anaya (10) plans
//   step by step and is sometimes bossy. Pari (1) says single baby words. Papa jokes and loves
//   cricket. Mumma is calm and counts "one... two...". Dadi feeds everyone. Dadaji tells old stories.
//   Kabir is sporty and loud, Meera giggles and draws. Bruno steals socks.
//
// PROPS: the same thing is always the same prop, and the prop matches the action.
//   Dadi's laddoos: Dadi holds 'laddooplate', whoever eats one holds 'laddoo'.
//   Rotis/parathas: 'rotiplate' to serve, 'roti' to eat.   Lunch at school: 'lunchbox'.
//   Going to school: 'schoolbag'.  Papa's phone: 'phone'.  Papa's keys: 'keys'.  Mumma going out: 'purse'.
//   Shopping: 'shoppingbag'.  Anaya reading: the 'read' action; carrying a book: 'book'.
//   Cricket: the 'cricket' action (brings the bat) and 'ball'.  Bruno's food: 'petbowl'; he steals a 'sock'.
//   Garden: 'plantpot' (seed), 'sprout', 'shovel', 'wateringcan'.  Cleaning: 'garbagebag', 'sweep' (broom).
//   Lemonade: 'jug', 'sugarjar' (blue lid), 'saltjar' (white lid), 'cup' to drink.  Volcano: 'vinegar'.
//   Hands must fit the action: nobody claps, dances or swings while holding something (the generator
//   puts the prop down for that scene), 'eat' only with food, 'drink' only with a cup or bottle.
//
// FORMAT: ep.act(world, actors, lines, opts). Actor: 'id:action:holds:enter:exit'.
// Line: [who, emotion, english, hindi, pauseBefore?]. Markup: | short beat, [0.6] pause, *word* stress.

export const LONG_TEMPLATES = [
  // ======================= THE VOLCANO =======================
  {
    id: 'volcano', theme: 'experiment', moral: undefined, look: 'home',
    build(ep, { T }, { moral }) {
      ep.title = T("Golu's Volcano Disaster!", 'गोलू का ज्वालामुखी धमाका!');
      ep.summary = T("Didi is making a volcano for tomorrow's science fair. The recipe says ten drops of vinegar. Golu thinks a whole bottle will be ten times better...", 'दीदी कल के साइंस फ़ेयर के लिए ज्वालामुखी बना रही है। तरीक़े में लिखा है दस बूँद सिरका। गोलू को लगता है पूरी बोतल डालो तो दस गुना मज़ा आएगा...');
      ep.hook = T('Didi is making a *real* volcano! | And I am her helper!', 'दीदी एक *असली* ज्वालामुखी बना रही है! | और मैं उनका हेल्पर हूँ!');
      ep.music = 'silly';
      ep.callback = T('Next time, I read *all* the steps first. | Then I count to ten.', 'अगली बार मैं पहले *सारे* स्टेप पढ़ूँगा। | फिर दस तक गिनूँगा।');
      if (moral !== false) {
        ep.moral = T('Follow the steps carefully. | And if you make a mistake, help to fix it.', 'स्टेप ध्यान से मानो। | और अगर ग़लती हो जाए, तो उसे ठीक करने में मदद करो।');
        ep.lesson = T('Ten drops worked better than a whole bottle. | Doing it right was the fastest way.', 'पूरी बोतल से अच्छा दस बूँदों ने काम किया। | सही तरीक़ा ही सबसे जल्दी वाला तरीक़ा था।');
      }

      ep.act('bedroom', ['anaya:study', 'golu:idle::run-right'], [
        ['anaya', 'happy', "The science fair is tomorrow. | I'm making a volcano that really erupts!", 'साइंस फ़ेयर कल है। | मैं एक ऐसा ज्वालामुखी बना रही हूँ जो सच में फटता है!'],
        ['golu', 'excited', 'A real volcano? | Can I help? | Please, Didi, please!', 'असली ज्वालामुखी? | मैं मदद करूँ? | प्लीज़ दीदी, प्लीज़!'],
        ['anaya', 'thinking', "Okay. | But you do *exactly* what I say. | Deal?", 'ठीक है। | पर तुम *बिल्कुल* वैसा ही करोगे जैसा मैं बोलूँ। | पक्का?'],
        ['golu', 'happy', 'Deal! | I am the best helper in the world.', 'पक्का! | मैं दुनिया का सबसे अच्छा हेल्पर हूँ।'],
      ], { time: 'afternoon', transition: 'fade' });
      ep.act('kitchen', ['anaya:read', 'golu:idle:vinegar'], [
        ['anaya', 'calm', 'Step one: one spoon of baking soda goes inside. | Done.', 'पहला स्टेप: एक चम्मच बेकिंग सोडा अंदर। | हो गया।'],
        ['anaya', 'calm', 'Step two: ten drops of vinegar. | One drop at a time.', 'दूसरा स्टेप: दस बूँद सिरका। | एक-एक बूँद करके।'],
        ['golu', 'thinking', 'Only ten drops? | That is so little!', 'बस दस बूँद? | ये तो बहुत कम है!', 0.4],
        ['anaya', 'calm', "Ten drops, Golu. | I'm getting my paints from upstairs. | Don't touch *anything* till I'm back.", 'दस बूँद, गोलू। | मैं ऊपर से अपने पेंट लेकर आती हूँ। | मेरे आने तक *कुछ भी* मत छूना।'],
      ], { set: [{ kind: 'volcano', x: 1.6, z: 0.4 }] });
      ep.act('kitchen', ['golu:lookaround:vinegar'], [
        ['golu', 'thinking', 'Ten drops make a small eruption...', 'दस बूँद से छोटा सा धमाका होगा...'],
        ['golu', 'excited', 'So the *whole bottle* will make a *giant* eruption! | Didi will be so happy!', 'तो *पूरी बोतल* से *बहुत बड़ा* धमाका होगा! | दीदी कितनी ख़ुश होंगी!', 0.6],
      ], { camera: 'closeup', minDuration: 4 });
      ep.act('kitchen', ['golu:idle:vinegar', 'pari:sitfloor'], [
        ['golu', 'excited:cheer', "It's working! | It's bubbling!", 'चल गया! | झाग बन रहा है!'],
        ['golu', 'scared:no', "It's growing... | it's growing too much! | Stop, volcano, stop!", 'ये बढ़ रहा है... | बहुत ज़्यादा बढ़ रहा है! | रुक जा ज्वालामुखी, रुक जा!', 0.4],
        ['pari', 'surprised', 'Uh-oh!', 'ओह-ओह!'],
      ], { set: [{ kind: 'volcanofoam', x: 1.6, z: 0.4 }] });
      ep.act('kitchen', ['dadi:idle::walk-right', 'anaya:idle:palette:walk-left', 'golu:sad:vinegar'], [
        ['dadi', 'surprised', 'Hai Ram! | Why is my kitchen full of foam?', 'हाय राम! | मेरी रसोई में झाग ही झाग क्यों है?'],
        ['anaya', 'angry', 'My volcano! | Golu, did you pour the *whole bottle*?', 'मेरा ज्वालामुखी! | गोलू, तुमने *पूरी बोतल* डाल दी?'],
        ['golu', 'sad', 'I just wanted a bigger eruption...', 'मैं बस बड़ा धमाका चाहता था...', 0.5],
      ]);
      ep.act('kitchen', ['anaya:sad', 'golu:sad'], [
        ['anaya', 'sad', 'The science fair is *tomorrow*. | Now I have nothing to show.', 'साइंस फ़ेयर *कल* है। | अब मेरे पास दिखाने को कुछ नहीं है।'],
        ['golu', 'sad', "I'm sorry, Didi. | You told me ten drops. | I didn't listen.", 'सॉरी दीदी। | आपने दस बूँद बोला था। | मैंने नहीं सुना।', 0.6],
      ], { camera: 'closeup', minDuration: 4 });
      ep.act('bedroom', ['golu:sitfloor', 'dadi:idle'], [
        ['dadi', 'calm', 'Saying sorry is a good start, beta. | But what can you *do* to fix it?', 'सॉरी बोलना अच्छी शुरुआत है, बेटा। | पर इसे ठीक करने के लिए तुम क्या *कर* सकते हो?'],
        ['golu', 'thinking', 'I could help make a new one. | But Didi is so angry with me.', 'मैं नया बनाने में मदद कर सकता हूँ। | पर दीदी मुझसे बहुत ग़ुस्सा हैं।'],
        ['dadi', 'happy', "Angry people still like help. | Go and ask her.", 'ग़ुस्से में भी मदद अच्छी लगती है। | जाओ, पूछ के तो देखो।'],
      ], { optional: 2 });
      ep.act('bedroom', ['anaya:sitchair', 'golu:idle::walk-left'], [
        ['golu', 'sad', 'Didi... | can we make a new volcano together? | I will do *exactly* what you say.', 'दीदी... | क्या हम साथ में नया ज्वालामुखी बना सकते हैं? | मैं *बिल्कुल* वही करूँगा जो आप बोलोगी।'],
        ['anaya', 'thinking', 'Exactly? | Even the ten drops?', 'बिल्कुल वही? | दस बूँद भी?', 0.5],
        ['golu', 'happy', 'Ten drops. | I will count out loud.', 'दस बूँद। | मैं ज़ोर से गिनूँगा।'],
        ['anaya', 'calm', 'Okay. | But we need clay, paint, and one whole evening.', 'ठीक है। | पर हमें मिट्टी, पेंट, और पूरी शाम चाहिए।'],
      ]);
      ep.act('kitchen', ['papa:idle::walk-left', 'anaya:idle', 'golu:idle'], [
        ['papa', 'excited', 'Did somebody say clay and paint? | Papa reporting for volcano duty!', 'किसी ने मिट्टी और पेंट बोला? | पापा ज्वालामुखी ड्यूटी पर हाज़िर!'],
        ['anaya', 'thinking', 'Papa, it has to dry before tomorrow morning.', 'पापा, इसे कल सुबह से पहले सूखना है।'],
        ['papa', 'happy', "Then let's start right now. | Golu, you're in charge of the newspaper.", 'तो अभी शुरू करते हैं। | गोलू, अख़बार बिछाना तुम्हारी ज़िम्मेदारी।'],
      ], { time: 'evening' });
      ep.act('kitchen', ['papa:idle:paintbrush', 'anaya:idle:paintbrush', 'golu:idle:palette'], [
        ['papa', 'calm', 'Brown at the bottom, | orange at the top, | like hot lava.', 'नीचे भूरा, | ऊपर नारंगी, | गरम लावा जैसा।'],
        ['golu', 'happy', "Can I paint the lava? | I'll go slowly.", 'क्या मैं लावा पेंट करूँ? | मैं धीरे-धीरे करूँगा।'],
        ['anaya', 'happy', 'Small strokes. | Like this. | [0.4] Hey, that looks really good, Golu!', 'छोटे-छोटे स्ट्रोक। | ऐसे। | [0.4] अरे, ये तो सच में अच्छा लग रहा है, गोलू!'],
      ], { optional: 1, minDuration: 5, set: [{ kind: 'volcano', x: 1.6, z: 0.4 }] });
      ep.act('bedroom', ['golu:yawn', 'anaya:read'], [
        ['golu', 'thinking', 'Didi, | is it dry yet?', 'दीदी, | सूख गया क्या?'],
        ['anaya', 'laugh', "Golu, that's the ninth time you've asked.", 'गोलू, ये तुमने नौवीं बार पूछा है।'],
        ['golu', 'happy', 'Nine questions, ten drops. | I am very good at counting today.', 'नौ सवाल, दस बूँद। | आज मैं गिनती में बहुत अच्छा हूँ।'],
      ], { card: ["That night", "उस रात"], time: 'night', optional: 2 });
      ep.act('classroom', ['teacher:idle', 'anaya:idle', 'golu:idle:vinegar', 'meera:idle', 'kabir:idle'], [
        ['teacher', 'happy', 'Next is Anaya, with her helper Golu. | What have you made?', 'अब अनाया, अपने हेल्पर गोलू के साथ। | तुमने क्या बनाया है?'],
        ['anaya', 'calm', 'A volcano. | Baking soda and vinegar make bubbles of gas. | The bubbles push the foam out, like lava.', 'एक ज्वालामुखी। | बेकिंग सोडा और सिरका मिलकर गैस के बुलबुले बनाते हैं। | बुलबुले झाग को बाहर धकेलते हैं, लावा की तरह।'],
        ['teacher', 'excited', "Wonderful. | Let's see it!", 'बहुत बढ़िया। | चलो देखते हैं!'],
      ], { card: ["Next day: Science fair", "अगले दिन: साइंस फ़ेयर"], time: 'morning', transition: 'fade', set: [{ kind: 'volcano', x: 0.9, z: 0.6 }] });
      ep.act('classroom', ['golu:idle:vinegar', 'anaya:idle'], [
        ['golu', 'calm', 'One. [0.3] Two. [0.3] Three. [0.3] Four. [0.3] Five...', 'एक। [0.3] दो। [0.3] तीन। [0.3] चार। [0.3] पाँच...'],
        ['anaya', 'calm', 'Six. [0.3] Seven. [0.3] Eight. [0.3] Nine. [0.3] Ten. | Stop!', 'छह। [0.3] सात। [0.3] आठ। [0.3] नौ। [0.3] दस। | बस!'],
      ], { camera: 'closeup', minDuration: 5 });
      ep.act('classroom', ['meera:cheer', 'kabir:cheer', 'teacher:clap', 'anaya:cheer', 'golu:cheer'], [
        ['meera', 'excited', "Whoa! | It's erupting!", 'वाह! | ये तो फट रहा है!'],
        ['kabir', 'excited', 'Do it again! | Do it again!', 'फिर से करो! | फिर से करो!'],
        ['teacher', 'happy', 'A perfect eruption. | Well done, both of you!', 'एकदम परफ़ेक्ट धमाका। | शाबाश, तुम दोनों को!'],
      ], { set: [{ kind: 'volcanofoam', x: 0.9, z: 0.6 }] });
      ep.act('street', ['anaya:idle:trophy:walk-left', 'golu:idle::walk-left'], [
        ['anaya', 'happy', "First prize! | I couldn't have done it without my helper.", 'पहला इनाम! | मेरे हेल्पर के बिना ये नहीं हो पाता।'],
        ['golu', 'thinking', 'Next year, can we make a bigger one? | With... twenty drops?', 'अगले साल बड़ा वाला बनाएँ? | ...बीस बूँद वाला?'],
        ['anaya', 'laugh', 'Only if you count them out loud!', 'तभी, जब तुम ज़ोर से गिनोगे!'],
      ], { optional: 1 });
    },
  },

  // ======================= THE LEMONADE STAND =======================
  {
    id: 'lemonade', theme: 'experiment', moral: undefined, look: 'home',
    build(ep, { T }, { moral }) {
      ep.title = T('The Salty Lemonade Stand!', 'नमकीन नींबू पानी की दुकान!');
      ep.summary = T("Golu and Anaya open a lemonade stand to buy a new cricket ball. Business is great... until the first customer takes a sip.", 'गोलू और अनाया नई क्रिकेट बॉल के लिए नींबू पानी की दुकान खोलते हैं। सब बढ़िया चल रहा है... जब तक पहला ग्राहक एक घूँट नहीं लेता।');
      ep.hook = T('Today we are opening our own *shop*! | Lemonade, one rupee!', 'आज हम अपनी *दुकान* खोल रहे हैं! | नींबू पानी, एक रुपया!');
      ep.music = 'silly';
      ep.callback = T('Blue lid is sugar. | White lid is salt. | I will never forget that. Ever.', 'नीला ढक्कन चीनी। | सफ़ेद ढक्कन नमक। | ये मैं कभी नहीं भूलूँगा। कभी नहीं।');
      if (moral !== false) {
        ep.moral = T('Always check before you serve. | And one mistake does not mean you give up.', 'परोसने से पहले हमेशा जाँच लो। | और एक ग़लती का मतलब हार मानना नहीं।');
        ep.lesson = T('We made one mistake... | but we checked, fixed it, and tried again.', 'हमसे एक ग़लती हुई... | पर हमने जाँचा, ठीक किया, और फिर से कोशिश की।');
      }

      ep.act('house', ['golu:sad', 'anaya:idle', 'kabir:idle'], [
        ['golu', 'sad', 'Our cricket ball went over the wall. | Again. | And this time the dog ate it.', 'हमारी क्रिकेट बॉल दीवार के पार चली गई। | फिर से। | और इस बार कुत्ता खा गया।'],
        ['kabir', 'sad', "A new ball costs twenty rupees. | I only have two.", 'नई बॉल बीस रुपये की है। | मेरे पास तो बस दो हैं।'],
        ['anaya', 'thinking', "It's so hot today. | Everyone wants something cold. | [0.4] Let's sell lemonade!", 'आज कितनी गर्मी है। | सबको कुछ ठंडा चाहिए। | [0.4] चलो नींबू पानी बेचते हैं!'],
        ['golu', 'excited', 'Our own shop! | Yes!', 'हमारी अपनी दुकान! | हाँ!'],
      ], { time: 'afternoon', transition: 'fade' });
      ep.act('kitchen', ['mumma:idle', 'anaya:idle', 'golu:idle:jug'], [
        ['mumma', 'calm', 'Lemon juice, cold water, | and two spoons of sugar in every jug.', 'नींबू का रस, ठंडा पानी, | और हर जग में दो चम्मच चीनी।'],
        ['mumma', 'calm', 'Sugar is the jar with the *blue* lid. | Remember, blue.', 'चीनी *नीले* ढक्कन वाले डिब्बे में है। | याद रखना, नीला।', 0.3],
        ['golu', 'happy', 'Blue. | Got it, Mumma!', 'नीला। | समझ गया, मम्मा!'],
        ['anaya', 'happy', "I'll make the sign. | You make the lemonade.", 'मैं बोर्ड बनाती हूँ। | तुम नींबू पानी बनाओ।'],
      ]);
      ep.act('kitchen', ['golu:idle:saltjar', 'pari:sitfloor'], [
        ['golu', 'happy', 'Lemon, done. | Water, done. | Now sugar...', 'नींबू, हो गया। | पानी, हो गया। | अब चीनी...'],
        ['golu', 'thinking', 'Blue lid... | white lid... | they both look the same inside.', 'नीला ढक्कन... | सफ़ेद ढक्कन... | अंदर से तो दोनों एक जैसे हैं।', 0.4],
        ['golu', 'happy', 'This one is closer. | Two big spoons. | In it goes!', 'ये वाला पास है। | दो बड़े चम्मच। | डाल दिया!'],
      ], { camera: 'closeup', minDuration: 4 });
      ep.act('house', ['anaya:idle:paper', 'golu:idle:jug', 'kabir:idle'], [
        ['anaya', 'excited', 'The sign is ready! | Cold lemonade, one rupee!', 'बोर्ड तैयार है! | ठंडा नींबू पानी, एक रुपया!'],
        ['kabir', 'happy', "I'll be the first customer. | Here's my rupee!", 'पहला ग्राहक मैं बनूँगा। | ये लो मेरा एक रुपया!'],
        ['golu', 'excited', 'One cold lemonade, coming up!', 'एक ठंडा नींबू पानी, अभी लाया!'],
      ], { set: [{ kind: 'lemonadestand', x: 1.8, z: -0.2 }] });
      ep.act('house', ['kabir:drink', 'golu:idle:jug', 'anaya:idle'], [
        ['kabir', 'happy', 'Mmm, cold... | [0.6] Bleh! | Yuck! | Why is it *salty*?', 'म्म्म, ठंडा... | [0.6] छी! | बेकार! | ये *नमकीन* क्यों है?'],
        ['golu', 'surprised', 'Salty? | Lemonade is not salty!', 'नमकीन? | नींबू पानी नमकीन नहीं होता!'],
        ['kabir', 'angry', 'This one is! | Taste it yourself!', 'ये वाला है! | ख़ुद चखकर देखो!'],
      ]);
      ep.act('house', ['kapoor:idle::walk-left', 'golu:idle:jug', 'anaya:idle'], [
        ['kapoor', 'happy', 'Lemonade on such a hot day? | How lovely! | One glass, please.', 'इतनी गर्मी में नींबू पानी? | वाह! | एक गिलास देना।'],
        ['anaya', 'scared', 'Wait, Mrs. Kapoor, maybe not—', 'रुकिए, कपूर आंटी, शायद नहीं—'],
        ['kapoor', 'surprised', '[0.5] Oh. | Oh my. | That is... very... *interesting*.', '[0.5] ओह। | अरे। | ये तो... बहुत... *अलग* है।', 0.3],
      ], { optional: 2 });
      ep.act('kitchen', ['anaya:idle:saltjar', 'golu:sad', 'mumma:idle'], [
        ['anaya', 'thinking', 'Golu, which jar did you use? | [0.4] The one with the *white* lid?', 'गोलू, तुमने कौन सा डिब्बा लिया? | [0.4] *सफ़ेद* ढक्कन वाला?'],
        ['golu', 'sad', 'It was closer. | And it looked like sugar.', 'वो पास में था। | और चीनी जैसा दिख रहा था।'],
        ['mumma', 'calm', "Salt and sugar look the same, beta. | That's why we taste before we serve.", 'नमक और चीनी एक जैसे दिखते हैं, बेटा। | इसीलिए परोसने से पहले चखते हैं।'],
      ]);
      ep.act('kitchen', ['golu:sad', 'anaya:idle'], [
        ['golu', 'sad', 'Our shop is ruined. | Nobody will buy from us now.', 'हमारी दुकान ख़त्म। | अब कोई हमसे नहीं ख़रीदेगा।'],
        ['anaya', 'thinking', "One bad jug doesn't close a shop. | We throw it away, make a new one... | and this time we check.", 'एक ख़राब जग से दुकान बंद नहीं होती। | इसे फेंको, नया बनाओ... | और इस बार जाँच करेंगे।', 0.5],
      ], { camera: 'closeup', minDuration: 4 });
      ep.act('kitchen', ['golu:idle:sugarjar', 'anaya:idle:jug', 'dadaji:idle'], [
        ['golu', 'happy', 'Blue lid. | Sugar. | I checked it twice.', 'नीला ढक्कन। | चीनी। | मैंने दो बार देखा।'],
        ['anaya', 'calm', 'And now the most important step. | The taste test. | Dadaji?', 'और अब सबसे ज़रूरी स्टेप। | चखने वाला टेस्ट। | दादाजी?'],
      ]);
      ep.act('kitchen', ['dadaji:drink', 'golu:idle', 'anaya:idle'], [
        ['dadaji', 'calm', 'Hmm. [0.6] Cold. [0.4] Sour. [0.4] Sweet.', 'हम्म। [0.6] ठंडा। [0.4] खट्टा। [0.4] मीठा।'],
        ['dadaji', 'laugh', "Just like the lemonade my mother made. | You may open your shop!", 'बिल्कुल वैसा जैसा मेरी माँ बनाती थीं। | अब तुम दुकान खोल सकते हो!', 0.5],
        ['golu', 'excited', 'Yes! | The shop is open again!', 'हाँ! | दुकान फिर से खुल गई!'],
      ]);
      ep.act('house', ['golu:idle:jug', 'anaya:idle', 'kabir:idle'], [
        ['golu', 'happy', 'Kabir, here. | A new glass, for free. | Sorry about the salty one.', 'कबीर, ये लो। | नया गिलास, मुफ़्त में। | नमकीन वाले के लिए सॉरी।'],
        ['kabir', 'surprised', 'Free? | [0.5] Mmm! | Now *this* is lemonade!', 'मुफ़्त? | [0.5] म्म्म! | अब *ये* हुआ नींबू पानी!'],
      ], { set: [{ kind: 'lemonadestand', x: 1.8, z: -0.2 }] });
      ep.act('house', ['kapoor:drink', 'lalaji:drink', 'papa:drink', 'golu:idle:jug', 'anaya:idle:coin'], [
        ['papa', 'happy', 'Two glasses for me. | It is *very* hot today.', 'मेरे लिए दो गिलास। | आज *बहुत* गर्मी है।'],
        ['kapoor', 'laugh', "Much better than the first one, Golu!", 'पहले वाले से बहुत अच्छा है, गोलू!'],
        ['anaya', 'excited', 'Seventeen... | eighteen... | nineteen... | twenty rupees!', 'सत्रह... | अठारह... | उन्नीस... | बीस रुपये!'],
      ], { minDuration: 5 });
      ep.act('playground', ['golu:idle:ball', 'kabir:cheer', 'anaya:clap'], [
        ['golu', 'excited', 'A brand new cricket ball! | Bought with our own money!', 'एकदम नई क्रिकेट बॉल! | अपने पैसों से ख़रीदी!'],
        ['kabir', 'excited', 'This time we keep it far from that wall.', 'इस बार हम इसे उस दीवार से दूर रखेंगे।'],
        ['anaya', 'laugh', 'And far from that dog!', 'और उस कुत्ते से भी!'],
      ], { card: ["Next day", "अगले दिन"], time: 'morning', optional: 1, transition: 'fade' });
    },
  },

  // ======================= THE SEED =======================
  {
    id: 'plant', theme: 'experiment', moral: undefined, look: 'home',
    build(ep, { T }, { moral }) {
      ep.title = T("Why Won't My Plant Grow?", 'मेरा पौधा क्यों नहीं उगता?');
      ep.summary = T("Dadaji gives Golu a sunflower seed. Golu wants a giant flower by tomorrow, so he digs it up every day to check. Guess what happens.", 'दादाजी गोलू को सूरजमुखी का बीज देते हैं। गोलू को कल तक बड़ा फूल चाहिए, इसलिए वो रोज़ उसे खोदकर देखता है। सोचो फिर क्या होता है।');
      ep.hook = T('Dadaji gave me a *magic* seed! | Well... | a sunflower seed.', 'दादाजी ने मुझे एक *जादुई* बीज दिया! | मतलब... | सूरजमुखी का बीज।');
      ep.music = 'calm';
      ep.callback = T("I'm going to plant one more seed... | and this time I won't dig it up. | Not even once.", 'मैं एक और बीज लगाऊँगा... | और इस बार खोदूँगा नहीं। | एक बार भी नहीं।');
      if (moral !== false) {
        ep.moral = T('Good things take time. | Be patient, and keep taking care.', 'अच्छी चीज़ों में समय लगता है। | सब्र रखो, और ध्यान रखते रहो।');
        ep.lesson = T('The seed was growing all along, under the soil. | We just could not see it yet.', 'बीज तो मिट्टी के नीचे उग ही रहा था। | बस हमें अभी दिख नहीं रहा था।');
      }

      // the pot stands in the garden in every scene, so the plant's progress is something you can see
      const pot = [{ kind: 'plantpot', x: 1.3, z: 0.7 }];
      const day = (n, hi) => [`Day ${n}`, hi];

      ep.act('house', ['dadaji:idle:plantpot', 'golu:idle::run-left'], [
        ['dadaji', 'calm', 'Golu, this is a sunflower seed. | One day it will grow taller than you.', 'गोलू, ये सूरजमुखी का बीज है। | एक दिन ये तुमसे भी लंबा हो जाएगा।'],
        ['golu', 'excited', 'Taller than me? | By tomorrow?', 'मुझसे लंबा? | कल तक?'],
        ['dadaji', 'laugh', 'Not tomorrow, beta. | It needs water, sunshine... | and lots of patience.', 'कल नहीं, बेटा। | इसे पानी चाहिए, धूप चाहिए... | और ढेर सारा सब्र।'],
      ], { transition: 'fade', time: 'afternoon' });
      ep.act('house', ['golu:idle:shovel', 'dadaji:idle'], [
        ['dadaji', 'calm', 'Make a small hole in the pot. | Put the seed in, cover it with soil, | and give it a little water.', 'गमले में एक छोटा सा गड्ढा बनाओ। | बीज डालो, मिट्टी से ढको, | और थोड़ा पानी दो।'],
        ['golu', 'happy', 'Done! | Now grow, seed. | Grow, grow, grow!', 'हो गया! | अब उगो, बीज। | उगो, उगो, उगो!'],
      ], { card: day(1, 'पहला दिन'), time: 'morning', set: pot });
      ep.act('house', ['golu:lookaround', 'anaya:idle:book'], [
        ['golu', 'sad', "One whole day. | Nothing. | Not even a tiny leaf.", 'पूरा एक दिन हो गया। | कुछ नहीं। | एक छोटी सी पत्ती भी नहीं।'],
        ['anaya', 'calm', 'Golu, you planted it *yesterday*.', 'गोलू, तुमने इसे *कल* ही तो लगाया था।'],
        ['golu', 'thinking', "Maybe it's stuck down there. | I'll just dig it out and check. | Just once.", 'शायद ये नीचे अटक गया है। | मैं बस खोदकर देख लेता हूँ। | बस एक बार।', 0.5],
      ], { card: day(2, 'दूसरा दिन'), time: 'morning' });
      ep.act('house', ['golu:idle:shovel'], [
        ['golu', 'thinking', 'Let me check... | still a seed. | I\'ll put it back.', 'देखूँ ज़रा... | अभी भी बीज है। | वापस डाल देता हूँ।'],
      ], { card: day(3, 'तीसरा दिन'), time: 'morning', camera: 'closeup', minDuration: 3 });
      ep.act('house', ['golu:sad:shovel'], [
        ['golu', 'sad', "Check again... | still a seed! | Why isn't it growing?", 'फिर देखूँ... | अभी भी बीज! | ये उग क्यों नहीं रहा?'],
      ], { card: day(4, 'चौथा दिन'), time: 'morning', camera: 'closeup', minDuration: 3 });
      ep.act('house', ['kabir:idle::run-right', 'golu:sad:shovel'], [
        ['kabir', 'excited', "Golu! | Our class bean plant has *two* leaves now!", 'गोलू! | क्लास वाले सेम के पौधे में अब *दो* पत्तियाँ आ गईं!'],
        ['golu', 'angry', "Two leaves? | Mine has *zero*. | My seed is broken.", 'दो पत्तियाँ? | मेरे में *ज़ीरो*। | मेरा बीज ख़राब है।'],
      ], { optional: 2, time: 'afternoon' });
      ep.act('house', ['dadaji:idle::walk-left', 'golu:sad:shovel'], [
        ['dadaji', 'surprised', 'Golu, why is the soil all dug up?', 'गोलू, मिट्टी पूरी खुदी हुई क्यों है?'],
        ['golu', 'sad', "I check it every day, Dadaji. | It's not growing at all.", 'मैं रोज़ इसे देखता हूँ, दादाजी। | ये बिल्कुल नहीं उग रहा।'],
        ['dadaji', 'calm', "Ah. | Every day you dig it out? | Then I know why.", 'अच्छा। | रोज़ खोदकर निकालते हो? | तब तो मुझे पता है क्यों।', 0.5],
      ], { time: 'evening' });
      ep.act('house', ['dadaji:sitchair', 'golu:sitfloor'], [
        ['dadaji', 'calm', 'Under the soil, the seed grows tiny roots first. | Thin, like hair.', 'मिट्टी के नीचे, बीज पहले छोटी-छोटी जड़ें बनाता है। | बाल जैसी पतली।'],
        ['dadaji', 'calm', 'Every time you pull it out, | those little roots break. | And it has to start again.', 'हर बार जब तुम इसे निकालते हो, | वो छोटी जड़ें टूट जाती हैं। | और इसे फिर से शुरू करना पड़ता है।', 0.4],
        ['golu', 'sad', 'So... | I was stopping it from growing?', 'तो... | मैं ही इसे उगने नहीं दे रहा था?', 0.5],
      ], { camera: 'closeup', minDuration: 6, time: 'evening' });
      ep.act('house', ['dadaji:idle:plantpot', 'golu:idle'], [
        ['dadaji', 'happy', "Here is a new seed. | Let's start again from day one. | Two rules: | water every morning... | and *no digging*.", 'ये लो नया बीज। | फिर से पहले दिन से शुरू करते हैं। | दो नियम: | रोज़ सुबह पानी... | और *खोदना बिल्कुल नहीं*।'],
        ['golu', 'happy', 'No digging. | Promise, Dadaji.', 'खोदना नहीं। | पक्का, दादाजी।'],
      ], { card: ['New seed, Day 1', 'नया बीज, पहला दिन'], time: 'morning', transition: 'fade' });
      ep.act('bedroom', ['golu:idle:paper', 'anaya:idle'], [
        ['golu', 'happy', "I made a calendar. | Every day I water it, I put a star.", 'मैंने कैलेंडर बनाया है। | जिस दिन पानी दूँगा, एक स्टार लगाऊँगा।'],
        ['anaya', 'happy', "That's a great idea, Golu. | And no peeking under the soil?", 'बहुत अच्छा आइडिया है, गोलू। | और मिट्टी के नीचे झाँकना नहीं?'],
        ['golu', 'laugh', 'No peeking. | I put a sign on it. | It says: Golu, go away.', 'झाँकना नहीं। | मैंने उस पर बोर्ड लगा दिया है। | उस पर लिखा है: गोलू, दूर रहो।'],
      ], { optional: 1, time: 'night' });
      ep.act('house', ['golu:idle:wateringcan'], [
        ['golu', 'happy', 'Good morning, seed. | Here is your water. | Star number two!', 'गुड मॉर्निंग, बीज। | ये लो पानी। | दूसरा स्टार!'],
      ], { card: day(2, 'दूसरा दिन'), time: 'morning', minDuration: 3, set: pot });
      ep.act('house', ['golu:idle:wateringcan'], [
        ['golu', 'calm', 'Water. | Star. | [0.5] My hands really want to dig... | but I won\'t.', 'पानी। | स्टार। | [0.5] मेरे हाथ खोदना चाहते हैं... | पर मैं नहीं खोदूँगा।'],
      ], { card: day(4, 'चौथा दिन'), time: 'morning', camera: 'closeup', minDuration: 3 });
      ep.act('house', ['golu:idle:wateringcan', 'pari:sitfloor', 'bruno:idle'], [
        ['golu', 'laugh', 'Pari, you water it too. | Just a little. | [0.5] Pari, that is Bruno, not the plant!', 'परी, तुम भी पानी दो। | बस थोड़ा सा। | [0.5] परी, वो ब्रूनो है, पौधा नहीं!'],
        ['bruno', 'surprised', 'Woof!', 'भौं!'],
      ], { card: day(5, 'पाँचवाँ दिन'), time: 'morning', optional: 2 });
      ep.act('house', ['golu:sitfloor'], [
        ['golu', 'sad', 'Still nothing. | [0.5] But Dadaji said the roots are growing first. | Under the soil. | Where I can\'t see.', 'अभी भी कुछ नहीं। | [0.5] पर दादाजी ने कहा जड़ें पहले बढ़ती हैं। | मिट्टी के नीचे। | जहाँ मुझे दिखता नहीं।'],
      ], { card: day(6, 'छठा दिन'), time: 'evening', camera: 'closeup', minDuration: 4 });
      ep.act('house', ['golu:point', 'anaya:idle::run-left'], [
        ['golu', 'surprised', 'Didi! | Didi, come quick!', 'दीदी! | दीदी, जल्दी आओ!'],
        ['anaya', 'surprised', 'What happened? | Did you dig it up again?', 'क्या हुआ? | फिर से खोद दिया?'],
        ['golu', 'excited', "No! | Look! | A tiny green leaf! | It's growing!", 'नहीं! | देखो! | एक छोटी सी हरी पत्ती! | ये उग रहा है!'],
      ], { card: day(7, 'सातवाँ दिन'), time: 'morning', set: [{ kind: 'sprout', x: 1.3, z: 0.7 }] });
      ep.act('house', ['golu:cheer', 'dadaji:clap', 'anaya:clap', 'mumma:clap', 'pari:sitfloor'], [
        ['dadaji', 'happy', "You waited, and you took care of it. | That's what made it grow.", 'तुमने इंतज़ार किया, और ध्यान रखा। | इसीलिए ये उगा।'],
        ['golu', 'excited', 'Hello, little sunflower! | One day you will be taller than me!', 'हैलो, छोटे सूरजमुखी! | एक दिन तुम मुझसे लंबे हो जाओगे!'],
        ['mumma', 'laugh', 'Just not by tomorrow!', 'बस कल तक नहीं!'],
      ], { time: 'morning' });
    },
  },

  // ======================= THE BEACH =======================
  {
    id: 'beach', theme: 'trip', moral: undefined, look: 'home',
    build(ep, { T }, { moral }) {
      ep.title = T('The Sandcastle and the Big Wave!', 'रेत का महल और बड़ी लहर!');
      ep.summary = T("The family goes to the beach and Golu builds the best sandcastle ever... right next to the water. Then the big wave comes.", 'परिवार समंदर किनारे जाता है और गोलू अब तक का सबसे अच्छा रेत का महल बनाता है... पानी के बिल्कुल पास। फिर आती है बड़ी लहर।');
      ep.hook = T("We're going to the *beach*! | I'm going to build a castle!", 'हम *समंदर* किनारे जा रहे हैं! | मैं एक महल बनाऊँगा!');
      ep.music = 'adventure';
      ep.callback = T('Next time I build my castle far from the water. | Waves are not invited.', 'अगली बार मैं अपना महल पानी से दूर बनाऊँगा। | लहरों को बुलाया नहीं है।');
      if (moral !== false) {
        ep.moral = T("When something you made gets broken, | don't give up. | Build it again, and build it smarter.", 'जब तुम्हारी बनाई चीज़ टूट जाए, | तो हार मत मानो। | फिर से बनाओ, और समझदारी से बनाओ।');
        ep.lesson = T('The wave broke our castle... | but the second one was even better.', 'लहर ने हमारा महल तोड़ दिया... | पर दूसरा वाला और भी अच्छा बना।');
      }

      ep.act('house', ['papa:idle:keys', 'mumma:idle:basket', 'anaya:jump', 'golu:jump', 'dadaji:idle', 'dadi:idle'], [
        ['papa', 'excited', 'Everybody in the car! | We are going to the beach!', 'सब गाड़ी में बैठो! | हम समंदर किनारे जा रहे हैं!'],
        ['golu', 'excited', "I'm taking my bucket! | I'm going to build the biggest sandcastle in the world!", 'मैं अपनी बाल्टी ले जा रहा हूँ! | मैं दुनिया का सबसे बड़ा रेत का महल बनाऊँगा!'],
        ['dadi', 'happy', 'And I packed laddoos for everyone.', 'और मैंने सबके लिए लड्डू पैक किए हैं।'],
      ], { time: 'morning', transition: 'fade' });
      ep.act('beach', ['golu:runjump:sandbucket', 'anaya:idle::walk-left', 'papa:idle::walk-left', 'mumma:idle:basket:walk-left', 'pari:idle'], [
        ['golu', 'excited', 'The sea! | It goes on forever!', 'समंदर! | ये तो कभी ख़त्म ही नहीं होता!'],
        ['mumma', 'calm', 'Stay where we can see you, Golu. | And not too close to the big waves.', 'वहीं रहना जहाँ हम तुम्हें देख सकें, गोलू। | और बड़ी लहरों के पास नहीं।'],
      ], { time: 'morning', set: [{ kind: 'picnicmat', x: -2.2, z: 0.4 }] });
      ep.act('beach', ['golu:idle:sandbucket', 'anaya:idle'], [
        ['golu', 'thinking', 'Here, right next to the water. | The sand is wet, so it sticks together better.', 'यहाँ, पानी के बिल्कुल पास। | रेत गीली है, तो अच्छे से चिपकेगी।'],
        ['anaya', 'happy', "That's smart. | I'll make the towers, you make the walls.", 'ये तो समझदारी है। | मैं मीनारें बनाती हूँ, तुम दीवारें बनाओ।'],
      ]);
      ep.act('beach', ['golu:idle:sandbucket', 'anaya:idle', 'pari:sitfloor'], [
        ['golu', 'excited', 'Tower one... | tower two... | and a door for the king!', 'पहली मीनार... | दूसरी मीनार... | और राजा के लिए एक दरवाज़ा!'],
        ['anaya', 'laugh', 'And who is the king?', 'और राजा कौन है?'],
        ['golu', 'happy', 'King Golu, of course! | And Pari is the princess.', 'राजा गोलू, और कौन! | और परी राजकुमारी है।'],
        ['pari', 'excited', 'Pari!', 'परी!'],
      ], { minDuration: 5, set: [{ kind: 'sandcastle', x: 1.3, z: 0.6 }] });
      ep.act('beach', ['dadaji:idle::walk-left', 'golu:idle', 'anaya:idle'], [
        ['dadaji', 'calm', "What a fine castle! | But Golu, the tide is coming in. | The water comes higher in the evening.", 'कितना बढ़िया महल है! | पर गोलू, ज्वार आ रहा है। | शाम को पानी ऊपर तक आता है।'],
        ['golu', 'happy', "Don't worry, Dadaji. | My walls are very strong.", 'चिंता मत करो, दादाजी। | मेरी दीवारें बहुत मज़बूत हैं।'],
      ], { optional: 2 });
      ep.act('beach', ['golu:idle', 'anaya:idle'], [
        ['anaya', 'calm', 'One more flag on top... | and it\'s finished.', 'ऊपर एक और झंडा... | और ये पूरा हो गया।'],
        ['golu', 'scared', '[0.4] Didi... | why is the water so loud? | Wave! | Big wave!', '[0.4] दीदी... | पानी इतना शोर क्यों कर रहा है? | लहर! | बड़ी लहर!', 0.6],
      ], { card: ["That evening", "उस शाम"], time: 'evening', minDuration: 4 });
      ep.act('beach', ['golu:cry', 'anaya:sad'], [
        ['golu', 'sad', "It's gone. | The whole castle. | The towers, the door... | everything.", 'चला गया। | पूरा महल। | मीनारें, दरवाज़ा... | सब कुछ।'],
        ['anaya', 'sad', 'We worked on it for so long...', 'हमने इतनी देर इस पर मेहनत की थी...'],
      ], { set: [], camera: 'closeup', minDuration: 5 });
      ep.act('beach', ['golu:stomp', 'papa:idle::walk-left', 'anaya:sad'], [
        ['golu', 'angry', "Stupid wave! | I'm never building a castle again!", 'बेकार लहर! | मैं अब कभी महल नहीं बनाऊँगा!'],
        ['papa', 'calm', 'Hey, hey. | The wave didn\'t do it to make you sad, champ. | That\'s just what the sea does.', 'अरे, अरे। | लहर ने तुम्हें दुखी करने के लिए ऐसा नहीं किया, चैंप। | समंदर तो ऐसा ही करता है।'],
      ]);
      ep.act('beach', ['papa:sitfloor', 'golu:sitfloor', 'anaya:sitfloor'], [
        ['papa', 'calm', 'Tell me something. | What did you learn from the first castle?', 'एक बात बताओ। | पहले महल से तुमने क्या सीखा?'],
        ['anaya', 'thinking', 'Wet sand is good for building...', 'गीली रेत बनाने के लिए अच्छी है...'],
        ['golu', 'thinking', "But building next to the water is not good. | [0.5] So... we build up there, where it's dry... | and carry the wet sand in buckets!", 'पर पानी के पास बनाना अच्छा नहीं। | [0.5] तो... हम ऊपर बनाएँ, जहाँ सूखा है... | और गीली रेत बाल्टी में भरकर लाएँ!', 0.5],
        ['papa', 'excited', "Now that's an engineer talking!", 'अब हुई ना इंजीनियर वाली बात!'],
      ], { minDuration: 6 });
      ep.act('beach', ['golu:run:sandbucket', 'anaya:run:sandbucket', 'papa:idle:sandbucket', 'mumma:idle'], [
        ['golu', 'excited', 'Bucket one! | Coming through!', 'पहली बाल्टी! | रास्ता दो!'],
        ['mumma', 'laugh', 'Papa, you\'re carrying more sand on your trousers than in the bucket!', 'सुनिए, आप बाल्टी से ज़्यादा रेत तो अपनी पैंट पर ला रहे हो!'],
        ['papa', 'laugh', "It's a special technique.", 'ये एक ख़ास तरीक़ा है।'],
      ], { optional: 2, minDuration: 5 });
      ep.act('beach', ['golu:idle', 'anaya:idle', 'papa:idle', 'dadaji:idle', 'pari:sitfloor'], [
        ['dadaji', 'happy', "Up here, the water can't reach it. | Now *that* is a castle that will last.", 'यहाँ ऊपर पानी नहीं पहुँच सकता। | अब *ये* महल टिकेगा।'],
        ['anaya', 'excited', 'And with everyone helping, it\'s twice as big!', 'और सबकी मदद से ये दोगुना बड़ा बना है!'],
      ], { set: [{ kind: 'sandcastle', x: 0.6, z: -0.6 }, { kind: 'sandbucket', x: 1.4, z: 0.2 }], minDuration: 5 });
      ep.act('beach', ['golu:cheer', 'anaya:cheer', 'pari:clap', 'papa:clap', 'mumma:clap', 'dadi:idle', 'dadaji:idle'], [
        ['golu', 'excited', 'The best castle in the whole world! | And this time, no wave can get it!', 'दुनिया का सबसे अच्छा महल! | और इस बार कोई लहर इसे नहीं छू सकती!'],
        ['dadi', 'happy', 'Then the king and his family can have their laddoos now.', 'तो अब राजा और उसका परिवार लड्डू खा सकते हैं।'],
      ], { camera: 'orbit', minDuration: 6 });
      ep.act('beach', ['golu:eat:laddoo', 'anaya:eat:laddoo', 'dadi:idle:laddooplate'], [
        ['golu', 'happy', 'Bye-bye, castle. | We will come back next Sunday.', 'बाय-बाय, महल। | अगले संडे फिर आएँगे।'],
        ['anaya', 'laugh', 'And next time, we start up here!', 'और अगली बार, शुरू से यहीं बनाएँगे!'],
      ], { optional: 1 });
    },
  },

  // ======================= HIDE AND SEEK IN THE FOREST =======================
  {
    id: 'forest', theme: 'trip', moral: undefined, look: 'home',
    build(ep, { T }, { moral }) {
      ep.title = T('The Best Hiding Spot Ever!', 'छुपने की सबसे अच्छी जगह!');
      ep.summary = T("A family picnic in the forest and a game of hide and seek. Golu finds the perfect hiding spot... so perfect that nobody can find him. Not even Golu.", 'जंगल में फ़ैमिली पिकनिक और छुपन-छुपाई का खेल। गोलू को छुपने की एकदम परफ़ेक्ट जगह मिलती है... इतनी परफ़ेक्ट कि कोई उसे ढूँढ ही नहीं पाता।');
      ep.hook = T("We're having a picnic in the forest! | And I'm the hide and seek champion.", 'हम जंगल में पिकनिक मना रहे हैं! | और छुपन-छुपाई का चैंपियन मैं हूँ।');
      ep.music = 'adventure';
      ep.callback = T("I'm still the hide and seek champion. | But next time, I hide where you can hear me.", 'छुपन-छुपाई का चैंपियन मैं ही हूँ। | पर अगली बार ऐसी जगह छुपूँगा जहाँ आवाज़ पहुँचे।');
      if (moral !== false) {
        ep.moral = T("In a new place, stay where grown-ups can hear you. | And if you can't find them, stay still and call out.", 'नई जगह पर वहीं रहो जहाँ बड़े तुम्हें सुन सकें। | और अगर वो न दिखें, तो वहीं रुको और ज़ोर से आवाज़ दो।');
        ep.lesson = T('Golu was scared, but he remembered the rule. | Stay still, and shout.', 'गोलू डर गया था, पर उसे नियम याद रहा। | वहीं रुको, और आवाज़ दो।');
      }

      ep.act('forest', ['papa:idle::walk-left', 'mumma:idle:basket:walk-left', 'golu:runjump', 'anaya:idle::walk-left', 'dadi:idle', 'pari:idle'], [
        ['golu', 'excited', 'Look at these trees! | They touch the sky!', 'ये पेड़ तो देखो! | आसमान को छू रहे हैं!'],
        ['mumma', 'happy', "This is our picnic spot. | Mat down, food out, and everyone stays close.", 'यहीं हमारी पिकनिक होगी। | दरी बिछाओ, खाना निकालो, और सब पास रहना।'],
      ], { time: 'afternoon', transition: 'fade', set: [{ kind: 'picnicmat', x: -1.6, z: 0.6 }, { kind: 'basket', x: -1.0, z: 0.4 }] });
      ep.act('forest', ['papa:idle', 'golu:jump', 'anaya:idle', 'kabir:idle'], [
        ['golu', 'excited', 'Hide and seek! | Papa, you count!', 'छुपन-छुपाई! | पापा, आप गिनो!'],
        ['papa', 'calm', "Okay. But first, the forest rule. | If you can't see us, don't walk around looking. | Stay where you are, and shout loudly. We will come to you.", 'ठीक है। पर पहले, जंगल का नियम। | अगर हम न दिखें, तो इधर-उधर मत भटकना। | जहाँ हो वहीं रुको, और ज़ोर से आवाज़ दो। हम तुम्हारे पास आएँगे।'],
        ['golu', 'happy', 'Stay and shout. | Got it! | Now count!', 'रुको और आवाज़ दो। | समझ गया! | अब गिनो!'],
      ]);
      ep.act('forest', ['papa:idle', 'anaya:run', 'golu:run'], [
        ['papa', 'calm', 'One... | two... | three... | four...', 'एक... | दो... | तीन... | चार...'],
        ['anaya', 'happy', "I'm hiding behind the big rock!", 'मैं बड़े पत्थर के पीछे छुपती हूँ!'],
        ['golu', 'thinking', "Too easy, Didi. | I'm going somewhere *nobody* will find me.", 'ये तो बहुत आसान है, दीदी। | मैं ऐसी जगह जाऊँगा जहाँ *कोई* नहीं ढूँढ पाएगा।'],
      ], { minDuration: 4 });
      ep.act('forest', ['golu:walkaround'], [
        ['golu', 'happy', 'Past the big tree... | past the mushrooms... | this hollow log! | Perfect.', 'बड़े पेड़ के आगे... | मशरूम के आगे... | ये खोखला लट्ठा! | परफ़ेक्ट।'],
        ['golu', 'calm', 'Nice and dark. | Nice and quiet. | [0.6] Very... quiet...', 'अच्छा अँधेरा। | अच्छी शांति। | [0.6] बहुत... शांति...', 0.5],
      ], { camera: 'closeup', minDuration: 5 });
      ep.act('forest', ['papa:lookaround', 'anaya:idle'], [
        ['papa', 'excited', 'Found you, Anaya! | Behind the rock, as always.', 'मिल गई, अनाया! | हमेशा की तरह पत्थर के पीछे।'],
        ['anaya', 'laugh', "Now find Golu. | He said nobody can find him.", 'अब गोलू को ढूँढो। | उसने कहा था कोई नहीं ढूँढ पाएगा।'],
        ['papa', 'thinking', 'Golu? | [0.5] Golu, I give up! | You can come out now!', 'गोलू? | [0.5] गोलू, मैं हार गया! | अब बाहर आ जाओ!', 0.4],
      ]);
      ep.act('forest', ['golu:sleep'], [
        ['golu', 'calm', 'Zzz... | [0.5] mmm... laddoos...', 'ख़र्र... | [0.5] म्म्म... लड्डू...'],
      ], { camera: 'closeup', minDuration: 4, optional: 2 });
      ep.act('forest', ['papa:lookaround', 'mumma:lookaround', 'anaya:lookaround', 'dadi:idle'], [
        ['mumma', 'scared', 'Golu! | Golu, where are you?', 'गोलू! | गोलू, कहाँ हो?'],
        ['dadi', 'scared', 'Hai Ram, where did that boy go?', 'हाय राम, ये लड़का कहाँ चला गया?'],
        ['anaya', 'thinking', "He went past the big tree. | Let's spread out, but stay where we can see each other.", 'वो बड़े पेड़ की तरफ़ गया था। | चलो फैल कर ढूँढते हैं, पर एक-दूसरे को दिखते रहें।', 0.4],
      ]);
      ep.act('forest', ['golu:yawn'], [
        ['golu', 'surprised', 'Huh? | Did I fall asleep? | [0.6] Where is everybody?', 'हैं? | मैं सो गया था? | [0.6] सब कहाँ गए?'],
        ['golu', 'scared', "Papa? | Mumma? | [0.5] Every tree looks the same. | Which way was the picnic?", 'पापा? | मम्मा? | [0.5] हर पेड़ एक जैसा लग रहा है। | पिकनिक किस तरफ़ थी?', 0.5],
      ], { card: ["One hour later", "एक घंटे बाद"], time: 'evening', camera: 'closeup', minDuration: 5 });
      ep.act('forest', ['golu:think'], [
        ['golu', 'scared', "I'll run that way and find them...", 'मैं उस तरफ़ भाग कर ढूँढता हूँ...'],
        ['golu', 'thinking', "No. Wait. | Papa's rule. | Don't walk around. | Stay where you are, and shout.", 'नहीं। रुको। | पापा का नियम। | इधर-उधर मत भटको। | जहाँ हो वहीं रुको, और आवाज़ दो।', 0.8],
        ['golu', 'excited:wave', 'Papa! | Papaaa! | I am here! | Near the hollow log!', 'पापा! | पापााा! | मैं यहाँ हूँ! | खोखले लट्ठे के पास!', 0.4],
      ], { camera: 'closeup', minDuration: 5 });
      ep.act('forest', ['bruno:run::run-right', 'golu:idle'], [
        ['bruno', 'excited', 'Woof! | Woof woof!', 'भौं! | भौं भौं!'],
        ['golu', 'happy', 'Bruno! | You heard me!', 'ब्रूनो! | तुमने मेरी आवाज़ सुन ली!'],
      ], { optional: 1 });
      ep.act('forest', ['papa:idle::run-right', 'mumma:idle::run-right', 'golu:idle', 'anaya:idle::run-right'], [
        ['papa', 'excited', 'Golu! | There you are!', 'गोलू! | तुम यहाँ हो!'],
        ['mumma', 'sad', 'You scared us so much, beta. | Come here.', 'तुमने हमें बहुत डरा दिया, बेटा। | इधर आओ।'],
        ['golu', 'sad', "I fell asleep in the log. | Then I couldn't find you. | But I didn't walk away. | I stayed and shouted.", 'मैं लट्ठे में सो गया था। | फिर आप लोग नहीं दिखे। | पर मैं कहीं नहीं गया। | मैं रुका और आवाज़ दी।'],
        ['papa', 'happy', "That's exactly why we found you so fast. | You remembered the rule.", 'इसीलिए तो हमने तुम्हें इतनी जल्दी ढूँढ लिया। | तुम्हें नियम याद रहा।'],
      ]);
      ep.act('forest', ['golu:sitfloor', 'anaya:sitfloor', 'dadi:idle:laddooplate', 'pari:sitfloor', 'papa:sitfloor', 'mumma:sitfloor'], [
        ['dadi', 'happy', 'All that hiding must make a boy hungry. | Laddoo?', 'इतना छुपने के बाद भूख तो लगी होगी। | लड्डू?'],
        ['golu', 'happy', 'I was dreaming about your laddoos, Dadi!', 'मैं सपने में आपके ही लड्डू देख रहा था, दादी!'],
        ['anaya', 'laugh', 'Next game, you count, Golu. | And you stay right here!', 'अगले खेल में तुम गिनोगे, गोलू। | और यहीं रहोगे!'],
      ], { minDuration: 5 });
    },
  },

  // ======================= DUCKS AT THE POND =======================
  {
    id: 'pond', theme: 'trip', moral: true, look: 'home',
    build(ep, { T }) {
      ep.title = T('Golu Feeds the Ducks!', 'गोलू ने बतखों को खिलाया!');
      ep.summary = T("Golu wants to share his chips with the ducks at the pond. Dadaji has a surprise: ducks have their own favourite food.", 'गोलू तालाब की बतखों को अपने चिप्स खिलाना चाहता है। दादाजी के पास एक सरप्राइज़ है: बतखों का अपना फ़ेवरेट खाना होता है।');
      ep.hook = T("We're going to see the *ducks*! | Quack, quack!", 'हम *बतखें* देखने जा रहे हैं! | क्वैक, क्वैक!');
      ep.music = 'calm';
      ep.callback = T('Chips for me, | peas for the ducks. | Everybody is happy.', 'चिप्स मेरे लिए, | मटर बतखों के लिए। | सब ख़ुश।');
      ep.moral = T("Be kind to animals. | Give them the right food, | and keep their home clean.", 'जानवरों से प्यार करो। | उन्हें सही खाना दो, | और उनका घर साफ़ रखो।');
      ep.lesson = T('Our food is not always good for animals. | Being kind means learning what *they* need.', 'हमारा खाना हमेशा जानवरों के लिए अच्छा नहीं होता। | दया का मतलब है समझना कि *उन्हें* क्या चाहिए।');

      ep.act('house', ['dadaji:idle', 'golu:idle:chips', 'anaya:idle'], [
        ['dadaji', 'happy', "Who wants to come to the pond with me? | The ducks have new babies.", 'मेरे साथ तालाब कौन चलेगा? | बतखों के छोटे बच्चे हुए हैं।'],
        ['golu', 'excited', 'Baby ducks? | Me! | And I will bring them a treat. | My chips!', 'बतख के बच्चे? | मैं! | और मैं उनके लिए कुछ लाऊँगा। | मेरे चिप्स!'],
        ['dadaji', 'calm', 'Hmm. | Bring your chips. | I will bring something too.', 'हम्म। | अपने चिप्स ले आओ। | मैं भी कुछ लाऊँगा।'],
      ], { time: 'morning', transition: 'fade' });
      ep.act('pond', ['golu:runjump:chips', 'anaya:idle::walk-left', 'dadaji:idle:bowl:walk-left', 'pari:idle'], [
        ['golu', 'excited', 'Look! | One big duck... | and one, two, three, four little ones!', 'देखो! | एक बड़ी बतख... | और एक, दो, तीन, चार छोटी!'],
        ['anaya', 'happy', 'They swim in a line behind their mother. | So cute!', 'ये अपनी माँ के पीछे लाइन में तैर रहे हैं। | कितने प्यारे!'],
      ]);
      ep.act('pond', ['golu:idle:chips', 'anaya:idle'], [
        ['golu', 'happy', 'Here, ducky ducky! | Have some chips!', 'आओ बतख, आओ! | चिप्स खाओ!'],
        ['anaya', 'surprised', "Golu, wait! | I don't think ducks should eat chips.", 'गोलू, रुको! | मुझे नहीं लगता बतखों को चिप्स खाने चाहिए।'],
        ['golu', 'thinking', "Why not? | I love chips. | Everybody loves chips.", 'क्यों नहीं? | मुझे तो चिप्स बहुत पसंद हैं। | सबको पसंद हैं।'],
      ]);
      ep.act('pond', ['dadaji:idle:bowl', 'golu:idle:chips', 'anaya:idle'], [
        ['dadaji', 'calm', 'Chips have lots of salt and oil, beta. | A duck is very small. | Its tummy can get very sick.', 'चिप्स में बहुत नमक और तेल होता है, बेटा। | बतख तो बहुत छोटी है। | उसका पेट बहुत ख़राब हो सकता है।'],
        ['golu', 'sad', "Oh. | I didn't know that. | I just wanted to share.", 'ओह। | मुझे पता नहीं था। | मैं तो बस बाँटना चाहता था।'],
        ['dadaji', 'happy', "Sharing is good. | We just share the *right* food. | Look in my bowl.", 'बाँटना अच्छी बात है। | बस *सही* खाना बाँटते हैं। | मेरी कटोरी में देखो।'],
      ]);
      ep.act('pond', ['golu:idle:bowl', 'dadaji:idle', 'anaya:idle'], [
        ['golu', 'surprised', 'Green peas? | And little pieces of lettuce?', 'हरी मटर? | और सलाद के छोटे टुकड़े?'],
        ['dadaji', 'calm', 'Ducks eat plants and seeds in the pond. | Peas are just like that. | Throw them gently on the water.', 'बतखें तालाब में पौधे और बीज खाती हैं। | मटर भी वैसी ही है। | पानी पर धीरे से डालो।'],
      ]);
      ep.act('pond', ['golu:idle:bowl', 'anaya:clap', 'pari:clap'], [
        ['golu', 'excited', "They're eating it! | They're coming closer!", 'ये खा रही हैं! | पास आ रही हैं!'],
        ['anaya', 'laugh', 'The little ones are fighting over one pea!', 'छोटे वाले एक मटर के लिए लड़ रहे हैं!'],
        ['pari', 'excited', 'Duck!', 'बतख!'],
      ], { minDuration: 5 });
      ep.act('pond', ['golu:idle', 'anaya:point'], [
        ['anaya', 'surprised', 'Oh no. | Golu, your chips packet!', 'अरे नहीं। | गोलू, तुम्हारा चिप्स का पैकेट!'],
        ['golu', 'scared', 'The wind blew it into the water! | And the baby duck is going to it!', 'हवा उसे पानी में उड़ा ले गई! | और छोटी बतख उसकी तरफ़ जा रही है!'],
      ], { props: [{ kind: 'chips', x: 1.8, z: 0.9 }] });
      ep.act('pond', ['dadaji:idle', 'golu:idle', 'anaya:idle'], [
        ['dadaji', 'calm', "Don't go in the water. | Here, this long stick. | Pull it to the edge, slowly.", 'पानी में मत जाना। | ये लो, लंबी लकड़ी। | धीरे-धीरे किनारे तक खींचो।'],
        ['golu', 'thinking', 'Slowly... | slowly... | got it!', 'धीरे... | धीरे... | मिल गया!', 0.4],
        ['anaya', 'happy', 'You saved the baby duck, Golu!', 'तुमने छोटी बतख को बचा लिया, गोलू!'],
      ], { minDuration: 5, props: [{ kind: 'chips', x: 0.9, z: 0.8 }] });
      ep.act('pond', ['golu:idle:chips', 'dadaji:idle'], [
        ['golu', 'thinking', 'Dadaji, | if the duck ate this plastic... | what would happen?', 'दादाजी, | अगर बतख ये प्लास्टिक खा लेती... | तो क्या होता?'],
        ['dadaji', 'sad', 'It could get very sick. | Plastic never goes away by itself. | That\'s why we never leave it near water.', 'वो बहुत बीमार हो सकती थी। | प्लास्टिक अपने आप कभी ख़त्म नहीं होता। | इसीलिए हम उसे पानी के पास कभी नहीं छोड़ते।'],
      ], { camera: 'closeup', optional: 2 });
      ep.act('pond', ['golu:idle:garbagebag', 'anaya:idle:garbagebag', 'dadaji:idle'], [
        ['golu', 'happy', "Didi, let's look for more plastic around the pond. | For the baby ducks.", 'दीदी, चलो तालाब के आस-पास और प्लास्टिक ढूँढते हैं। | छोटी बतखों के लिए।'],
        ['anaya', 'happy', 'One bottle... | two wrappers... | the pond looks better already!', 'एक बोतल... | दो रैपर... | तालाब तो अभी से अच्छा लग रहा है!'],
      ], { optional: 1, minDuration: 5 });
      ep.act('pond', ['golu:eat:chips', 'anaya:idle', 'dadaji:idle', 'pari:clap'], [
        ['golu', 'happy', 'Now I eat *my* chips... | and the ducks eat *their* peas.', 'अब मैं *अपने* चिप्स खाऊँगा... | और बतखें *अपनी* मटर।'],
        ['dadaji', 'laugh', 'Everybody gets the right lunch!', 'सबको अपना सही खाना!'],
        ['pari', 'happy', 'Quack!', 'क्वैक!'],
      ], { minDuration: 4 });
    },
  },

  // ======================= BRUNO COMES HOME =======================
  {
    id: 'bruno-home', theme: 'animals', moral: true, look: 'home',
    build(ep, { T }) {
      ep.title = T('Bruno Comes Home!', 'ब्रूनो घर आया!');
      ep.summary = T("Golu and Anaya find a wet little puppy on a rainy evening. Papa says a puppy is a lot of work. The kids say they can do it. Can they?", 'बारिश की एक शाम गोलू और अनाया को भीगा हुआ छोटा सा पिल्ला मिलता है। पापा कहते हैं पिल्ला पालना बहुत मेहनत का काम है। बच्चे कहते हैं वो कर लेंगे। क्या सच में?');
      ep.hook = T('This is the story of how we met... | our puppy Bruno!', 'ये कहानी है कि हम कैसे मिले... | अपने पिल्ले ब्रूनो से!');
      ep.music = 'calm';
      ep.callback = T('A puppy is a lot of work. | [0.4] But Bruno is worth it. | Even when he steals my socks.', 'पिल्ला पालना बहुत काम है। | [0.4] पर ब्रूनो के लिए सब मंज़ूर है। | तब भी, जब वो मेरे मोज़े चुराता है।');
      ep.moral = T('A pet is not a toy. | Pets are family, | and they need our love and care every day.', 'पालतू जानवर खिलौना नहीं है। | वो भी परिवार है, | और उसे रोज़ हमारा प्यार और देखभाल चाहिए।');
      ep.lesson = T("Taking care of Bruno is a big job... | and it's the best job in the world.", 'ब्रूनो का ध्यान रखना बड़ी ज़िम्मेदारी है... | और दुनिया का सबसे अच्छा काम भी।');

      ep.act('street', ['anaya:idle:umbrella:walk-left', 'golu:idle::walk-left'], [
        ['golu', 'happy', 'I love the rain! | Splash, splash!', 'मुझे बारिश बहुत पसंद है! | छपाक, छपाक!'],
        ['anaya', 'surprised', 'Shh, Golu. | Do you hear that? | Under the bench.', 'श्श, गोलू। | कुछ सुना? | बेंच के नीचे।', 0.5],
      ], { time: 'evening', transition: 'fade' });
      ep.act('street', ['bruno:sad', 'anaya:idle:umbrella', 'golu:idle'], [
        ['bruno', 'sad', 'Woof... | [0.5] woof...', 'भौं... | [0.5] भौं...'],
        ['golu', 'sad', "A puppy! | He's all wet and shivering.", 'एक पिल्ला! | ये पूरा भीगा हुआ है और काँप रहा है।'],
        ['anaya', 'thinking', "There's no mother dog anywhere. | He's all alone. | We can't leave him in the rain.", 'आस-पास कोई माँ कुत्ता भी नहीं है। | ये बिल्कुल अकेला है। | हम इसे बारिश में नहीं छोड़ सकते।', 0.4],
      ], { minDuration: 5 });
      ep.act('bedroom', ['papa:idle', 'mumma:idle', 'anaya:idle', 'golu:idle', 'bruno:idle'], [
        ['mumma', 'surprised', 'A puppy? | In the house? | And he\'s dripping on my floor!', 'पिल्ला? | घर में? | और ये तो मेरे फ़र्श पर पानी टपका रहा है!'],
        ['golu', 'sad', 'He was alone in the rain, Mumma. | Can we keep him? | Please?', 'वो बारिश में अकेला था, मम्मा। | क्या हम इसे रख लें? | प्लीज़?'],
        ['papa', 'calm', 'Tonight he stays, of course. | But keeping a puppy is a big decision.', 'आज रात तो ये रुकेगा ही। | पर पिल्ला रखना बड़ा फ़ैसला है।'],
      ]);
      ep.act('bedroom', ['papa:sitchair', 'golu:sitfloor', 'anaya:sitfloor', 'bruno:idle'], [
        ['papa', 'calm', 'A puppy needs food two times a day. | A walk every morning and every evening. | Even when it rains. Even on Sundays.', 'पिल्ले को दिन में दो बार खाना चाहिए। | हर सुबह और हर शाम सैर। | बारिश में भी। संडे को भी।'],
        ['anaya', 'thinking', 'We can do it, Papa. | I will feed him.', 'हम कर लेंगे, पापा। | मैं उसे खाना दूँगी।'],
        ['golu', 'excited', 'And I will walk him. | Every morning. | I promise!', 'और मैं उसे घुमाऊँगा। | हर सुबह। | पक्का वादा!'],
        ['papa', 'thinking', 'Hmm. | Let\'s try for one week. | If you take care of him every day... | he can stay.', 'हम्म। | एक हफ़्ता करके देखते हैं। | अगर तुम रोज़ उसका ध्यान रखोगे... | तो वो रह सकता है।', 0.5],
      ], { minDuration: 6 });
      ep.act('bedroom', ['anaya:idle:paper', 'golu:idle', 'bruno:jump'], [
        ['anaya', 'happy', 'I made a chart. | Food, walk, water, play. | We tick each one every day.', 'मैंने चार्ट बनाया है। | खाना, सैर, पानी, खेल। | हर रोज़ हर एक पर टिक लगाएँगे।'],
        ['golu', 'laugh', "He needs a name too. | Fluffy? | Tiger? | Mister Wet?", 'इसका नाम भी तो चाहिए। | फ़्लफ़ी? | टाइगर? | मिस्टर गीला?'],
        ['bruno', 'excited', 'Woof!', 'भौं!'],
      ], { time: 'night', optional: 2 });
      ep.act('kitchen', ['anaya:idle:petbowl', 'bruno:idle', 'dadi:idle'], [
        ['anaya', 'happy', 'Day one. | Breakfast for the puppy. | Tick!', 'पहला दिन। | पिल्ले का नाश्ता। | टिक!'],
        ['dadi', 'laugh', 'I said no dogs in my kitchen... | but look at that little face.', 'मैंने कहा था रसोई में कोई कुत्ता नहीं... | पर ये छोटा सा मुँह तो देखो।'],
      ], { card: ["Day 1", "पहला दिन"], time: 'morning' });
      ep.act('street', ['golu:walkaround', 'bruno:run'], [
        ['golu', 'excited', 'Day two! | Morning walk! | Come on, puppy, this way!', 'दूसरा दिन! | सुबह की सैर! | चलो पिल्ले, इधर!'],
        ['golu', 'laugh', 'No, not that way! | That\'s a cat! | Puppy, come back!', 'नहीं, उधर नहीं! | वो बिल्ली है! | पिल्ले, वापस आओ!', 0.5],
      ], { card: ["Day 2", "दूसरा दिन"], time: 'morning', minDuration: 5 });
      ep.act('playground', ['golu:cricket', 'kabir:idle:ball'], [
        ['kabir', 'excited', 'Golu, one more over! | You can\'t stop now, you\'re winning!', 'गोलू, एक ओवर और! | अभी नहीं रुक सकते, तुम जीत रहे हो!'],
        ['golu', 'happy', 'Okay, okay! | One more over! | Just one!', 'ठीक है, ठीक है! | एक ओवर और! | बस एक!'],
      ], { card: ["Day 4", "चौथा दिन"], time: 'evening', transition: 'fade' });
      ep.act('house', ['bruno:sad', 'mumma:idle', 'anaya:idle'], [
        ['bruno', 'sad', 'Woof... | woof woof...', 'भौं... | भौं भौं...'],
        ['anaya', 'thinking', "Day four, evening. | The puppy has been waiting by the door for an hour. | Where is Golu?", 'चौथा दिन, शाम। | पिल्ला एक घंटे से दरवाज़े के पास इंतज़ार कर रहा है। | गोलू कहाँ है?'],
        ['mumma', 'calm', 'Playing cricket. | He forgot.', 'क्रिकेट खेल रहा है। | भूल गया।'],
      ]);
      ep.act('house', ['golu:idle::run-right', 'bruno:sad', 'mumma:idle'], [
        ['golu', 'happy', 'I scored twenty runs! | [0.5] Why is the puppy so sad?', 'मैंने बीस रन बनाए! | [0.5] पिल्ला इतना उदास क्यों है?'],
        ['mumma', 'calm', 'He waited for his walk, beta. | He doesn\'t know about cricket. | He only knows you didn\'t come.', 'वो अपनी सैर का इंतज़ार कर रहा था, बेटा। | उसे क्रिकेट का नहीं पता। | उसे बस इतना पता है कि तुम नहीं आए।'],
        ['golu', 'sad', 'I promised. | And I forgot.', 'मैंने वादा किया था। | और मैं भूल गया।', 0.6],
      ], { camera: 'closeup', minDuration: 5 });
      ep.act('house', ['golu:sitfloor', 'bruno:idle'], [
        ['golu', 'sad', "I'm sorry, puppy. | You can't play cricket. | You just wait for me.", 'सॉरी, पिल्ले। | तुम क्रिकेट नहीं खेल सकते। | तुम बस मेरा इंतज़ार करते हो।'],
        ['golu', 'calm', "From now on, walk first, cricket after. | Every day.", 'अब से पहले सैर, फिर क्रिकेट। | हर रोज़।', 0.5],
        ['bruno', 'happy', 'Woof!', 'भौं!'],
      ], { camera: 'closeup', minDuration: 5 });
      ep.act('street', ['golu:walkaround', 'bruno:run', 'kabir:idle:ball'], [
        ['kabir', 'surprised', 'Golu, cricket? | We\'re waiting!', 'गोलू, क्रिकेट? | हम इंतज़ार कर रहे हैं!'],
        ['golu', 'happy', 'Walk first, Kabir. | Then cricket. | He can watch us play!', 'पहले सैर, कबीर। | फिर क्रिकेट। | ये हमें खेलते हुए देख सकता है!'],
      ], { card: ["Day 5", "पाँचवाँ दिन"], time: 'morning', optional: 1 });
      ep.act('bedroom', ['papa:idle', 'mumma:idle', 'anaya:idle:paper', 'golu:idle', 'bruno:idle'], [
        ['papa', 'calm', 'So. | One week is over. | Let me see the chart.', 'तो। | एक हफ़्ता पूरा हुआ। | ज़रा चार्ट दिखाओ।'],
        ['anaya', 'calm', 'Every tick is there... | except one evening walk.', 'हर टिक लगा है... | बस एक शाम की सैर छूटी।'],
        ['golu', 'sad', 'That was me. | But I never missed it again. | Not once.', 'वो मेरी ग़लती थी। | पर उसके बाद कभी नहीं छूटी। | एक बार भी नहीं।'],
        ['papa', 'happy', "Then I think this puppy has found his family.", 'तो मुझे लगता है इस पिल्ले को उसका परिवार मिल गया।', 0.6],
      ], { card: ["One week later", "एक हफ़्ते बाद"], time: 'evening' });
      ep.act('bedroom', ['golu:cheer', 'anaya:cheer', 'pari:clap', 'bruno:jump', 'papa:clap', 'mumma:clap'], [
        ['golu', 'excited', 'He can stay! | And his name is... | Bruno!', 'ये रह सकता है! | और इसका नाम है... | ब्रूनो!'],
        ['bruno', 'excited', 'Woof woof!', 'भौं भौं!'],
        ['pari', 'excited', 'Bruno!', 'ब्रूनो!'],
      ], { camera: 'orbit', minDuration: 5 });
      ep.act('bedroom', ['bruno:run:sock', 'golu:run'], [
        ['golu', 'laugh', 'Bruno! | That\'s my sock! | You\'ve been here one week and you\'re already a thief!', 'ब्रूनो! | वो मेरा मोज़ा है! | एक हफ़्ता हुआ है और तुम अभी से चोर बन गए!'],
      ], { optional: 1, minDuration: 4 });
    },
  },

  // ======================= THE LOST KITTEN =======================
  {
    id: 'mishti', theme: 'animals', moral: true, look: 'home',
    build(ep, { T }) {
      ep.title = T('Where Is Mishti?', 'मिष्टी कहाँ है?');
      ep.summary = T("Golu finds a little lost cat in the garden and wants to keep her forever. But somewhere, somebody is crying for her.", 'गोलू को बग़ीचे में एक खोई हुई बिल्ली मिलती है और वो उसे हमेशा के लिए रखना चाहता है। पर कहीं कोई उसके लिए रो रहा है।');
      ep.hook = T('Today we found a *cat*. | A real one!', 'आज हमें एक *बिल्ली* मिली। | सच्ची वाली!');
      ep.music = 'calm';
      ep.callback = T("I wanted to keep Mishti. | But Mrs. Kapoor needed her more. | And now I can visit her every day!", 'मैं मिष्टी को रखना चाहता था। | पर कपूर आंटी को उसकी ज़्यादा ज़रूरत थी। | और अब मैं रोज़ उससे मिलने जा सकता हूँ!');
      ep.moral = T("When you find something that belongs to someone else, | help it get back home.", 'जब तुम्हें किसी और की चीज़ मिले, | तो उसे घर पहुँचाने में मदद करो।');
      ep.lesson = T("We loved Mishti too. | But the kind thing was to take her home.", 'हमें भी मिष्टी से प्यार हो गया था। | पर सही बात थी उसे घर पहुँचाना।');

      ep.act('house', ['golu:idle:ball', 'anaya:idle', 'mishti:sad'], [
        ['golu', 'thinking', 'Didi, | do you hear that? | Behind the bushes.', 'दीदी, | कुछ सुना? | झाड़ियों के पीछे।'],
        ['mishti', 'sad', 'Meow... | meeow...', 'म्याऊँ... | म्याऊँऊँ...'],
      ], { time: 'afternoon', transition: 'fade' });
      ep.act('house', ['mishti:sad', 'golu:idle', 'anaya:idle'], [
        ['golu', 'surprised', 'A kitten! | A fluffy white kitten!', 'बिल्ली का बच्चा! | सफ़ेद, रुई जैसा!'],
        ['anaya', 'calm', "Slowly, Golu. | She's scared. | Let her come to you.", 'धीरे, गोलू। | ये डरी हुई है। | इसे ख़ुद पास आने दो।'],
        ['golu', 'happy', 'Hello, little one. | I won\'t hurt you.', 'हैलो, छोटी। | मैं तुम्हें कुछ नहीं करूँगा।', 0.5],
      ], { minDuration: 5 });
      ep.act('house', ['mishti:idle', 'golu:sitfloor', 'anaya:idle'], [
        ['golu', 'excited', "She likes me! | Didi, can we keep her? | I'll call her... Snowball!", 'मैं इसे अच्छा लगा! | दीदी, क्या हम इसे रख लें? | मैं इसका नाम रखूँगा... बर्फ़ी!'],
        ['anaya', 'thinking', 'Wait. | Look at her neck. | She has a pink collar with a bell.', 'रुको। | इसके गले में देखो। | घंटी वाला गुलाबी पट्टा है।'],
        ['golu', 'sad', 'So... | she already has a family?', 'तो... | इसका पहले से परिवार है?', 0.5],
      ]);
      ep.act('kitchen', ['mishti:idle', 'dadi:idle:petbowl', 'golu:idle', 'anaya:idle'], [
        ['dadi', 'calm', 'Poor thing must be thirsty. | A little water for her.', 'बेचारी प्यासी होगी। | इसे थोड़ा पानी दो।'],
        ['golu', 'happy', "Look, she's drinking! | Dadi, she has a tiny pink tongue!", 'देखो, ये पी रही है! | दादी, इसकी छोटी सी गुलाबी जीभ है!'],
        ['anaya', 'thinking', 'Dadi, have you seen this collar before?', 'दादी, आपने ये पट्टा पहले कहीं देखा है?'],
        ['dadi', 'thinking', 'Hmm... | pink collar, white fur... | I think it\'s Mrs. Kapoor\'s cat. | Mishti!', 'हम्म... | गुलाबी पट्टा, सफ़ेद बाल... | मुझे लगता है ये कपूर आंटी की बिल्ली है। | मिष्टी!', 0.4],
      ]);
      ep.act('house', ['anaya:idle', 'golu:idle', 'mishti:idle'], [
        ['anaya', 'calm', "Let's take her to Mrs. Kapoor's house.", 'चलो इसे कपूर आंटी के घर ले चलते हैं।'],
        ['golu', 'happy', '[0.4] The door is locked. | Nobody is home.', '[0.4] दरवाज़े पर ताला है। | घर पर कोई नहीं।'],
        ['anaya', 'thinking', 'Then we take care of her until Mrs. Kapoor comes back.', 'तो जब तक कपूर आंटी वापस नहीं आतीं, हम इसका ध्यान रखेंगे।'],
      ]);
      ep.act('bedroom', ['golu:sitfloor:ball', 'mishti:idle', 'bruno:idle'], [
        ['golu', 'laugh', 'Mishti, catch the ball! | [0.4] Oh, you just look at it. | Cats are funny.', 'मिष्टी, बॉल पकड़ो! | [0.4] अरे, तुम तो बस देख रही हो। | बिल्लियाँ भी अजीब हैं।'],
        ['bruno', 'excited', 'Woof?', 'भौं?'],
        ['golu', 'calm', 'Gently, Bruno. | She\'s our guest.', 'आराम से, ब्रूनो। | ये हमारी मेहमान है।'],
      ], { optional: 2, minDuration: 5 });
      ep.act('bedroom', ['golu:sitfloor', 'anaya:idle:paper', 'mishti:idle'], [
        ['golu', 'sad', "Didi, | what if Mrs. Kapoor doesn't come back? | Then can we keep her?", 'दीदी, | अगर कपूर आंटी वापस नहीं आईं तो? | तब तो हम इसे रख सकते हैं?'],
        ['anaya', 'calm', "Golu, think about it. | If Bruno was lost, how would you feel?", 'गोलू, सोचो ज़रा। | अगर ब्रूनो खो जाता, तो तुम्हें कैसा लगता?'],
        ['golu', 'sad', "[0.6] I would cry all night. | I would look everywhere.", '[0.6] मैं पूरी रात रोता। | मैं हर जगह ढूँढता।', 0.4],
        ['anaya', 'calm', 'Somebody is feeling like that right now.', 'अभी कोई ठीक वैसा ही महसूस कर रहा है।'],
      ], { time: 'night', camera: 'closeup', minDuration: 6 });
      ep.act('bedroom', ['golu:idle:paper', 'anaya:idle'], [
        ['golu', 'thinking', "Let's make a poster. | Found: one white cat, pink collar. | Very fluffy. | Doesn't like balls.", 'चलो एक पोस्टर बनाते हैं। | मिली: एक सफ़ेद बिल्ली, गुलाबी पट्टा। | बहुत रुई जैसी। | बॉल पसंद नहीं।'],
        ['anaya', 'laugh', 'Maybe not the last part. | And our house number at the bottom.', 'आख़िरी वाली बात शायद नहीं। | और नीचे हमारे घर का नंबर।'],
      ]);
      ep.act('street', ['golu:idle:paper', 'anaya:idle', 'lalaji:idle'], [
        ['golu', 'happy', 'Lala-ji, can we stick this poster on your shop? | We found a lost cat.', 'लाला जी, क्या हम ये पोस्टर आपकी दुकान पर लगा दें? | हमें एक खोई बिल्ली मिली है।'],
        ['lalaji', 'happy', 'Of course! | Right here, where everybody can see it.', 'हाँ, बिल्कुल! | यहीं लगाओ, जहाँ सबको दिखे।'],
      ], { card: ["Next morning", "अगली सुबह"], time: 'morning', optional: 1 });
      ep.act('house', ['kapoor:cry::run-right', 'golu:idle', 'anaya:idle', 'mishti:idle'], [
        ['kapoor', 'sad', 'Children! | Lala-ji told me about your poster! | Is it... is it my Mishti?', 'बच्चों! | लाला जी ने तुम्हारे पोस्टर के बारे में बताया! | क्या... क्या ये मेरी मिष्टी है?'],
        ['anaya', 'happy', 'She was hiding in our garden, Mrs. Kapoor.', 'वो हमारे बग़ीचे में छुपी थी, कपूर आंटी।'],
        ['mishti', 'happy', 'Meow!', 'म्याऊँ!'],
        ['kapoor', 'excited', 'Mishti! | My sweet Mishti! | I looked for you everywhere!', 'मिष्टी! | मेरी प्यारी मिष्टी! | मैंने तुम्हें हर जगह ढूँढा!'],
      ], { time: 'afternoon', minDuration: 6 });
      ep.act('house', ['kapoor:idle', 'golu:sad', 'anaya:idle', 'mishti:idle'], [
        ['kapoor', 'happy', 'Thank you, children. | I was so worried. | I could not eat a single thing all day.', 'थैंक यू बच्चों। | मैं बहुत परेशान थी। | पूरे दिन एक निवाला भी नहीं खाया।'],
        ['golu', 'sad', "I'm happy she's home. | [0.5] But I'll miss her.", 'मुझे ख़ुशी है कि वो घर पहुँच गई। | [0.5] पर मुझे उसकी याद आएगी।'],
        ['kapoor', 'happy', "Then come and visit her every day, Golu. | She'll be waiting for you.", 'तो रोज़ उससे मिलने आना, गोलू। | वो तुम्हारा इंतज़ार करेगी।'],
        ['golu', 'excited', 'Every day? | Really?', 'रोज़? | सच में?'],
      ]);
      ep.act('house', ['golu:sitfloor', 'mishti:idle', 'kapoor:idle'], [
        ['golu', 'happy', 'Hello, Mishti. | I came to visit. | I still have the ball. | You still don\'t like it?', 'हैलो, मिष्टी। | मैं मिलने आया। | बॉल अभी भी मेरे पास है। | तुम्हें अभी भी पसंद नहीं?'],
        ['mishti', 'happy', 'Meow.', 'म्याऊँ।'],
        ['golu', 'laugh', "That's a no.", 'मतलब नहीं।'],
      ], { card: ["A week later", "एक हफ़्ते बाद"], optional: 1, transition: 'fade' });
    },
  },

  // ======================= SPORTS DAY =======================
  {
    id: 'sportsday', theme: 'school', moral: true, look: 'school',
    build(ep, { T }) {
      ep.title = T('The Big Sports Day Race!', 'स्पोर्ट्स डे की बड़ी रेस!');
      ep.summary = T("Golu has practised all week to win the hundred metre race. He is ahead, the finish line is right there... and then his best friend falls.", 'गोलू ने सौ मीटर की रेस जीतने के लिए पूरे हफ़्ते प्रैक्टिस की है। वो सबसे आगे है, फ़िनिश लाइन बिल्कुल पास है... और तभी उसका पक्का दोस्त गिर जाता है।');
      ep.hook = T('Today is *sports day*! | And I am going to win!', 'आज है *स्पोर्ट्स डे*! | और मैं जीतने वाला हूँ!');
      ep.music = 'happy';
      ep.callback = T("I didn't win a medal. | But Kabir says I'm the fastest friend. | That's better.", 'मुझे मेडल नहीं मिला। | पर कबीर कहता है मैं सबसे तेज़ दोस्त हूँ। | वो ज़्यादा अच्छा है।');
      ep.moral = T('Helping a friend is bigger than winning a race.', 'किसी दोस्त की मदद करना रेस जीतने से भी बड़ा है।');
      ep.lesson = T("Golu lost the race... | but everybody will remember what he did.", 'गोलू रेस हार गया... | पर उसने जो किया, वो सबको याद रहेगा।');

      ep.act('playground', ['golu:run', 'kabir:run'], [
        ['golu', 'excited', 'Sports day is on Friday. | Kabir, race me to the tree!', 'स्पोर्ट्स डे शुक्रवार को है। | कबीर, पेड़ तक रेस लगाओ!'],
        ['kabir', 'excited', 'Ready, steady... | go!', 'रेडी, स्टेडी... | गो!'],
      ], { card: ["Monday", "सोमवार"], time: 'evening', transition: 'fade', minDuration: 4 });
      ep.act('playground', ['golu:cheer', 'kabir:idle'], [
        ['golu', 'excited', "I won! | Again! | I'm the fastest boy in the whole school!", 'मैं जीता! | फिर से! | मैं पूरे स्कूल में सबसे तेज़ हूँ!'],
        ['kabir', 'laugh', 'You won *today*. | On Friday, I\'m going to beat you.', 'आज जीते हो। | शुक्रवार को मैं तुम्हें हराऊँगा।'],
        ['golu', 'laugh', 'We\'ll see about that!', 'देखते हैं!'],
      ]);
      ep.act('house', ['golu:jumpingjacks', 'papa:idle', 'dadi:idle:laddooplate'], [
        ['golu', 'excited', 'Training! | Jumping jacks! | Fifty, fifty-one...', 'ट्रेनिंग! | जंपिंग जैक्स! | पचास, इक्यावन...'],
        ['dadi', 'happy', 'Golu, a champion needs food. | One laddoo?', 'गोलू, चैंपियन को खाना चाहिए। | एक लड्डू?'],
        ['golu', 'thinking', 'Champions eat fruits, Dadi. | [0.5] But... one laddoo is okay.', 'चैंपियन फल खाते हैं, दादी। | [0.5] पर... एक लड्डू चलेगा।'],
      ], { optional: 2 });
      ep.act('street', ['mumma:wave', 'golu:idle:schoolbag:walk-left', 'anaya:idle:schoolbag:walk-left', 'papa:idle'], [
        ['mumma', 'happy', 'Best of luck, Golu! | Run fast, and have fun.', 'बेस्ट ऑफ़ लक, गोलू! | तेज़ दौड़ना, और मज़े करना।'],
        ['papa', 'excited', "We'll be there to cheer for you!", 'हम तुम्हारे लिए ताली बजाने आएँगे!'],
      ], { card: ["Friday: Sports Day", "शुक्रवार: स्पोर्ट्स डे"], time: 'morning', transition: 'fade' });
      ep.act('playground', ['teacher:idle:whistle', 'golu:idle', 'kabir:idle', 'meera:idle', 'anaya:idle'], [
        ['teacher', 'happy', 'Children, the hundred metre race is next! | Runners, to the starting line.', 'बच्चों, अब सौ मीटर की रेस है! | सारे धावक, स्टार्ट लाइन पर।'],
        ['kabir', 'excited', 'Good luck, Golu. | May the fastest boy win.', 'गुड लक, गोलू। | जो सबसे तेज़ है, वो जीते।'],
        ['golu', 'happy', 'Good luck, Kabir. | See you at the finish line!', 'गुड लक, कबीर। | फ़िनिश लाइन पर मिलते हैं!'],
      ]);
      ep.act('playground', ['papa:cheer', 'mumma:cheer', 'pari:clap', 'anaya:cheer'], [
        ['papa', 'excited', 'Go, Golu, go!', 'चलो गोलू, चलो!'],
        ['anaya', 'excited', 'Run, Golu! | Run!', 'दौड़ो, गोलू! | दौड़ो!'],
      ], { minDuration: 3, optional: 1 });
      ep.act('playground', ['teacher:idle:whistle', 'golu:runjump', 'kabir:runjump'], [
        ['teacher', 'excited', 'On your marks... | get set... | go!', 'अपनी जगह पर... | तैयार... | जाओ!'],
        ['golu', 'excited', "I'm in front! | I'm winning!", 'मैं सबसे आगे हूँ! | मैं जीत रहा हूँ!', 0.6],
      ], { minDuration: 4 });
      ep.act('playground', ['kabir:sad', 'golu:idle'], [
        ['kabir', 'sad', 'Ouch! | My knee! | [0.4] I fell...', 'आउच! | मेरा घुटना! | [0.4] मैं गिर गया...'],
      ], { camera: 'closeup', minDuration: 3 });
      ep.act('playground', ['golu:think'], [
        ['golu', 'thinking', 'The finish line is right there. | Ten more steps and I win...', 'फ़िनिश लाइन बिल्कुल सामने है। | दस कदम और, और मैं जीत जाऊँगा...'],
        ['golu', 'sad', '[0.6] But Kabir is hurt. | And he\'s all alone back there.', '[0.6] पर कबीर को चोट लगी है। | और वो पीछे अकेला है।', 0.5],
      ], { camera: 'closeup', minDuration: 5 });
      ep.act('playground', ['golu:idle::run-right', 'kabir:sad'], [
        ['golu', 'calm', 'Kabir, are you okay? | Here, hold my hand.', 'कबीर, तुम ठीक हो? | लो, मेरा हाथ पकड़ो।'],
        ['kabir', 'surprised', "Golu, what are you doing? | You were winning!", 'गोलू, ये क्या कर रहे हो? | तुम तो जीत रहे थे!'],
        ['golu', 'happy', "I'd rather finish *with* my friend. | Come on. | We'll walk together.", 'मैं अपने दोस्त के *साथ* पूरी करूँगा। | चलो। | साथ में चलेंगे।'],
      ]);
      ep.act('playground', ['golu:walkaround', 'kabir:walkaround', 'teacher:clap', 'meera:clap', 'anaya:clap'], [
        ['meera', 'surprised', 'Look! | Golu came back for Kabir!', 'देखो! | गोलू कबीर के लिए वापस आया!'],
        ['anaya', 'excited', 'Everybody, clap for them!', 'सब लोग, इनके लिए ताली बजाओ!'],
      ], { camera: 'wide', minDuration: 5 });
      ep.act('playground', ['teacher:idle', 'golu:idle', 'kabir:idle', 'papa:idle', 'mumma:idle'], [
        ['teacher', 'happy', "Golu didn't win the race today. | But he did something much harder. | He stopped to help a friend.", 'गोलू आज रेस नहीं जीता। | पर उसने उससे भी मुश्किल काम किया। | वो एक दोस्त की मदद के लिए रुक गया।'],
        ['teacher', 'excited', 'So this special badge is for Golu. | The Kindness Champion!', 'इसलिए ये ख़ास बैज है गोलू के लिए। | दया का चैंपियन!', 0.5],
        ['papa', 'excited', "That's my boy!", 'ये है मेरा बेटा!'],
      ]);
      ep.act('playground', ['kabir:idle', 'golu:idle'], [
        ['kabir', 'happy', "Thank you, Golu. | You're the best friend ever.", 'थैंक यू, गोलू। | तुम सबसे अच्छे दोस्त हो।'],
        ['golu', 'laugh', 'And next year, | when your knee is better... | I\'ll still beat you!', 'और अगले साल, | जब तुम्हारा घुटना ठीक होगा... | मैं तब भी तुम्हें हराऊँगा!'],
        ['kabir', 'laugh', 'We\'ll see about that!', 'देखते हैं!'],
      ]);
      ep.act('house', ['dadaji:idle', 'dadi:idle', 'golu:idle:schoolbag:walk-left'], [
        ['dadi', 'happy', 'There he is! | Our champion!', 'आ गया! | हमारा चैंपियन!'],
        ['dadaji', 'calm', 'Any child can run fast, beta. | Not every child stops to help. | I am very proud.', 'तेज़ तो कोई भी बच्चा दौड़ सकता है, बेटा। | मदद के लिए हर बच्चा नहीं रुकता। | मुझे बहुत गर्व है।'],
      ], { transition: 'fade', optional: 1 });
    },
  },

  // ======================= THE FORGOTTEN LUNCH BOX =======================
  {
    id: 'lunchbox', theme: 'school', moral: true, look: 'school',
    build(ep, { T }) {
      ep.title = T('The Forgotten Lunch Box!', 'भूला हुआ टिफ़िन!');
      ep.summary = T("On Monday, Golu would not share his laddoo with Kabir. On Tuesday, Golu forgets his lunch box at home. Now who will share with him?", 'सोमवार को गोलू ने कबीर के साथ अपना लड्डू नहीं बाँटा। मंगलवार को गोलू अपना टिफ़िन घर भूल गया। अब उसके साथ कौन बाँटेगा?');
      ep.hook = T('Dadi packs the *best* lunch in the whole school!', 'दादी पूरे स्कूल का *सबसे अच्छा* टिफ़िन बनाती हैं!');
      ep.music = 'happy';
      ep.callback = T('When you share a laddoo, | you get a friend. | And sometimes... | another laddoo!', 'जब तुम लड्डू बाँटते हो, | तो दोस्त मिलता है। | और कभी-कभी... | एक और लड्डू!');
      ep.moral = T('When we share, | there is always enough for everyone.', 'जब हम बाँटते हैं, | तो सबके लिए काफ़ी होता है।');
      ep.lesson = T("Golu didn't share, but Kabir did. | Being kind to someone teaches them to be kind too.", 'गोलू ने नहीं बाँटा, पर कबीर ने बाँटा। | किसी के साथ अच्छा करने से वो भी अच्छा करना सीखता है।');

      ep.act('kitchen', ['dadi:idle:lunchbox', 'golu:idle:schoolbag'], [
        ['dadi', 'happy', 'Aloo paratha, and one special laddoo. | All for my Golu.', 'आलू पराठा, और एक ख़ास लड्डू। | सब मेरे गोलू के लिए।'],
        ['golu', 'excited', 'Thank you, Dadi! | Your laddoos are the best!', 'थैंक यू, दादी! | आपके लड्डू सबसे अच्छे हैं!'],
      ], { card: ["Monday", "सोमवार"], time: 'morning', transition: 'fade' });
      ep.act('classroom', ['golu:eat:laddoo', 'kabir:eat', 'meera:eat'], [
        ['kabir', 'happy', 'Golu, is that Dadi\'s laddoo? | Can I have a little piece?', 'गोलू, ये दादी का लड्डू है? | मुझे थोड़ा सा मिलेगा?'],
        ['golu', 'angry', "No! | Dadi made it for *me*. | Only one. | Mine.", 'नहीं! | दादी ने *मेरे* लिए बनाया है। | बस एक है। | मेरा।'],
        ['kabir', 'sad', 'Okay. | Never mind.', 'अच्छा। | कोई बात नहीं।', 0.5],
      ]);
      ep.act('classroom', ['meera:idle', 'kabir:sad', 'golu:eat:laddoo'], [
        ['meera', 'thinking', "Golu, Kabir always shares his chips with you.", 'गोलू, कबीर तो हमेशा तुम्हारे साथ अपने चिप्स बाँटता है।'],
        ['golu', 'thinking', "That's... different. | Chips are not laddoos.", 'वो... अलग है। | चिप्स लड्डू नहीं होते।'],
      ], { optional: 2 });
      ep.act('kitchen', ['golu:run:schoolbag', 'anaya:idle:schoolbag', 'mumma:idle'], [
        ['mumma', 'calm', "Tuesday! | Hurry, the school van is outside!", 'मंगलवार! | जल्दी करो, स्कूल वैन बाहर खड़ी है!'],
        ['golu', 'excited', 'Shoes, bag, water bottle... | coming, coming!', 'जूते, बैग, पानी की बोतल... | आया, आया!'],
      ], { card: ["Tuesday", "मंगलवार"], time: 'morning', transition: 'fade' });
      ep.act('kitchen', ['dadi:idle:lunchbox::walk-right'], [
        ['dadi', 'surprised', 'Golu? | Your lunch box! | [0.6] Hai Ram, the van has gone.', 'गोलू? | तुम्हारा टिफ़िन! | [0.6] हाय राम, वैन तो चली गई।'],
      ], { camera: 'closeup', minDuration: 3 });
      ep.act('classroom', ['teacher:idle', 'golu:lookaround:schoolbag', 'kabir:idle:lunchbox', 'meera:idle:lunchbox'], [
        ['teacher', 'happy', 'Lunch time, children! | Open your lunch boxes.', 'लंच टाइम, बच्चों! | अपने टिफ़िन खोलो।'],
        ['golu', 'surprised', 'My lunch box... | it\'s not in my bag. | [0.5] I forgot it at home!', 'मेरा टिफ़िन... | बैग में नहीं है। | [0.5] मैं घर भूल गया!', 0.5],
      ]);
      ep.act('classroom', ['golu:sad'], [
        ['golu', 'sad', "My tummy is so empty. | And I can't ask Kabir. | Yesterday I didn't share with him.", 'मेरा पेट बिल्कुल ख़ाली है। | और मैं कबीर से माँग भी नहीं सकता। | कल मैंने उसके साथ नहीं बाँटा।'],
      ], { camera: 'closeup', minDuration: 4 });
      ep.act('classroom', ['kabir:idle:lunchbox', 'golu:sad'], [
        ['kabir', 'thinking', 'Golu, where is your lunch?', 'गोलू, तुम्हारा लंच कहाँ है?'],
        ['golu', 'sad', 'I forgot it. | It\'s okay. | I\'m not hungry.', 'भूल गया। | कोई बात नहीं। | मुझे भूख नहीं है।'],
        ['kabir', 'laugh', 'Your tummy just growled like a tiger.', 'तुम्हारा पेट तो अभी शेर की तरह गुर्राया।', 0.5],
      ]);
      ep.act('classroom', ['kabir:idle:roti', 'golu:sad'], [
        ['kabir', 'happy', 'Here. | I have two rotis. | One for you, one for me.', 'ये लो। | मेरे पास दो रोटियाँ हैं। | एक तुम्हारी, एक मेरी।'],
        ['golu', 'sad', "But Kabir... | yesterday I didn't give you even a little piece of my laddoo.", 'पर कबीर... | कल मैंने तुम्हें अपने लड्डू का छोटा सा टुकड़ा भी नहीं दिया।'],
        ['kabir', 'calm', "I know. | But you're still my friend. | And friends don't stay hungry.", 'पता है। | पर तुम फिर भी मेरे दोस्त हो। | और दोस्त भूखे नहीं रहते।', 0.5],
      ], { camera: 'closeup', minDuration: 5 });
      ep.act('classroom', ['golu:eat:roti', 'kabir:eat:roti', 'meera:idle:apple'], [
        ['meera', 'happy', 'And here, half my apple. | Now it\'s a party!', 'और ये लो, मेरा आधा सेब। | अब तो पार्टी है!'],
        ['golu', 'happy', 'Thank you, Kabir. | Thank you, Meera. | [0.4] And sorry about yesterday.', 'थैंक यू, कबीर। | थैंक यू, मीरा। | [0.4] और कल के लिए सॉरी।'],
      ]);
      ep.act('kitchen', ['golu:idle:schoolbag:walk-left', 'dadi:idle'], [
        ['golu', 'thinking', 'Dadi, | can I take *two* laddoos tomorrow?', 'दादी, | क्या मैं कल *दो* लड्डू ले जाऊँ?'],
        ['dadi', 'laugh', 'Two? | Has my Golu become extra hungry?', 'दो? | मेरे गोलू को ज़्यादा भूख लगने लगी?'],
        ['golu', 'happy', "No. | One is for me... | and one is for my friend.", 'नहीं। | एक मेरे लिए... | और एक मेरे दोस्त के लिए।'],
      ], { time: 'evening', transition: 'fade' });
      ep.act('classroom', ['golu:idle:laddoo', 'kabir:eat:laddoo', 'meera:idle'], [
        ['golu', 'happy', 'Kabir, this is for you. | Dadi\'s special laddoo.', 'कबीर, ये तुम्हारे लिए। | दादी का ख़ास लड्डू।'],
        ['kabir', 'excited', 'Mmm! | Now I know why you didn\'t want to share!', 'म्म्म! | अब समझ आया तुम क्यों नहीं बाँटना चाहते थे!'],
        ['meera', 'laugh', 'Next time, ask Dadi for three!', 'अगली बार, दादी से तीन माँगना!'],
      ], { card: ["Wednesday", "बुधवार"], time: 'morning' });
    },
  },

  // ======================= THE SWING =======================
  {
    id: 'swing', theme: 'friends', moral: true, look: 'home',
    build(ep, { T }) {
      ep.title = T('My Turn on the Swing!', 'झूले पर मेरी बारी!');
      ep.summary = T("There is only one swing in the park, and Golu will not get off it. Soon he has the swing all to himself... and nobody to play with.", 'पार्क में एक ही झूला है, और गोलू उससे उतर ही नहीं रहा। जल्दी ही झूला सिर्फ़ उसका रह जाता है... और खेलने को कोई नहीं।');
      ep.hook = T('The new swing in our park is *so* high! | I want to swing all day!', 'हमारे पार्क का नया झूला *इतना* ऊँचा जाता है! | मैं पूरे दिन झूलूँगा!');
      ep.music = 'happy';
      ep.callback = T('Ten swings for me, ten for Meera. | And pushing her is fun too!', 'दस झूले मेरे, दस मीरा के। | और उसे झुलाने में भी मज़ा आता है!');
      ep.moral = T('When we take turns, | everybody gets to play.', 'जब हम बारी-बारी खेलते हैं, | तो सबको खेलने मिलता है।');
      ep.lesson = T('Golu had the swing all to himself... | and it was the least fun ever.', 'गोलू के पास पूरा झूला था... | और सबसे कम मज़ा भी उसी में आया।');

      ep.act('playground', ['golu:idle::run-right', 'kabir:idle::run-right', 'meera:idle', 'anaya:idle'], [
        ['golu', 'excited', "The new swing! | I'm first!", 'नया झूला! | पहले मैं!'],
        ['meera', 'happy', 'Okay, then me after you!', 'ठीक है, फिर तुम्हारे बाद मैं!'],
      ], { time: 'afternoon', transition: 'fade' });
      ep.act('playground', ['golu:swing', 'meera:idle', 'kabir:idle'], [
        ['golu', 'excited', 'Whee! | Higher! | I can touch the leaves!', 'वीईई! | और ऊँचा! | मैं पत्तियाँ छू सकता हूँ!'],
        ['meera', 'happy', "Golu, it's been a long time. | Can I have a turn now?", 'गोलू, बहुत देर हो गई। | अब मेरी बारी?'],
        ['golu', 'happy', 'Just five more minutes!', 'बस पाँच मिनट और!'],
      ], { minDuration: 5 });
      ep.act('playground', ['golu:swing', 'meera:sad', 'kabir:idle'], [
        ['meera', 'sad', "Golu, that was fifteen minutes. | Please, it's my turn.", 'गोलू, पंद्रह मिनट हो गए। | प्लीज़, अब मेरी बारी है।'],
        ['golu', 'angry', 'No! | I was here first. | The swing is mine!', 'नहीं! | मैं पहले आया था। | झूला मेरा है!'],
        ['kabir', 'surprised', "Golu, it's not *your* swing. | It's the park's swing.", 'गोलू, ये *तुम्हारा* झूला नहीं है। | ये पार्क का झूला है।'],
      ]);
      ep.act('playground', ['meera:sad', 'kabir:idle'], [
        ['meera', 'sad', "Come on, Kabir. | Let's go play somewhere else.", 'चलो कबीर। | कहीं और चलकर खेलते हैं।'],
        ['kabir', 'calm', 'Yeah. | Bye, Golu.', 'हाँ। | बाय, गोलू।'],
      ]);
      ep.act('playground', ['golu:swing'], [
        ['golu', 'happy', 'Yes! | The whole swing, all for me!', 'हाँ! | पूरा झूला, सिर्फ़ मेरे लिए!'],
        ['golu', 'calm', 'Whee... | [0.8] whee... | [0.8] hmm.', 'वीई... | [0.8] वीई... | [0.8] हम्म।', 0.6],
      ], { minDuration: 5 });
      ep.act('playground', ['golu:sad'], [
        ['golu', 'sad', "This is boring. | There's nobody to race, | nobody to laugh with. | Nobody even wants to play with me now.", 'ये तो बोरिंग है। | न कोई रेस लगाने वाला, | न कोई साथ हँसने वाला। | अब तो कोई मेरे साथ खेलना भी नहीं चाहता।'],
      ], { camera: 'closeup', minDuration: 5 });
      ep.act('playground', ['anaya:idle:book:walk-left', 'golu:sad'], [
        ['anaya', 'calm', 'Golu, why are you sitting all alone? | Where is everyone?', 'गोलू, तुम अकेले क्यों बैठे हो? | सब कहाँ गए?'],
        ['golu', 'sad', "I didn't give Meera a turn. | So they left.", 'मैंने मीरा को बारी नहीं दी। | तो वो चले गए।'],
        ['anaya', 'calm', 'Hmm. | How did it feel, having the swing all to yourself?', 'हम्म। | पूरा झूला अपने पास रखकर कैसा लगा?'],
        ['golu', 'sad', 'Fun for two minutes. | Then very, very boring.', 'दो मिनट मज़ा आया। | फिर बहुत, बहुत बोरिंग।', 0.5],
      ]);
      ep.act('playground', ['anaya:sitfloor', 'golu:sitfloor'], [
        ['anaya', 'thinking', 'What if you take turns? | Ten swings each. | And while one swings, the other one pushes and counts.', 'अगर तुम बारी-बारी करो तो? | दस-दस झूले। | और जब एक झूले, तो दूसरा धक्का दे और गिने।'],
        ['golu', 'thinking', "Ten each... | that's fair. | [0.4] But first I have to say sorry to Meera.", 'दस-दस... | ये तो सही है। | [0.4] पर पहले मुझे मीरा को सॉरी बोलना होगा।', 0.5],
      ], { minDuration: 5 });
      ep.act('playground', ['golu:idle::walk-left', 'meera:idle', 'kabir:idle:ball'], [
        ['golu', 'sad', "Meera, I'm sorry. | I was mean. | Do you want a turn on the swing?", 'मीरा, सॉरी। | मैंने बुरा किया। | क्या तुम्हें झूले पर बारी चाहिए?'],
        ['meera', 'surprised', 'Really? | Now?', 'सच में? | अभी?'],
        ['golu', 'happy', "Ten swings for you, and I'll push. | Then ten for Kabir. | Then me.", 'तुम्हारे दस झूले, और मैं धक्का दूँगा। | फिर दस कबीर के। | फिर मेरे।'],
      ]);
      ep.act('playground', ['meera:swing', 'golu:idle', 'kabir:idle'], [
        ['golu', 'happy', 'One... | two... | three... | push!', 'एक... | दो... | तीन... | धक्का!'],
        ['meera', 'laugh', 'Higher, Golu! | Whee!', 'और ऊँचा, गोलू! | वीईई!'],
        ['kabir', 'happy', '...nine... | ten! | My turn!', '...नौ... | दस! | मेरी बारी!'],
      ], { minDuration: 6 });
      ep.act('playground', ['kabir:swing', 'golu:idle', 'meera:idle'], [
        ['kabir', 'excited', 'Whee! | This is even better than cricket!', 'वीईई! | ये तो क्रिकेट से भी अच्छा है!'],
        ['meera', 'laugh', 'Hold on tight, Kabir!', 'कसकर पकड़ो, कबीर!'],
      ], { optional: 2, minDuration: 4 });
      ep.act('playground', ['golu:swing', 'meera:clap', 'kabir:clap', 'anaya:clap'], [
        ['golu', 'excited', 'My turn! | And this time everybody is counting for me!', 'मेरी बारी! | और इस बार सब मेरे लिए गिन रहे हैं!'],
        ['meera', 'happy', 'One... | two... | three...', 'एक... | दो... | तीन...'],
        ['golu', 'laugh', 'This is *so* much more fun than swinging alone!', 'ये अकेले झूलने से *कहीं* ज़्यादा मज़ेदार है!'],
      ], { minDuration: 6 });
      ep.act('playground', ['pari:idle', 'golu:idle', 'mumma:idle::walk-left'], [
        ['mumma', 'happy', 'There\'s one more person who wants a turn.', 'एक और है जिसे बारी चाहिए।'],
        ['golu', 'laugh', 'Pari! | Okay. | Ten *very slow* swings for Pari.', 'परी! | ठीक है। | परी के लिए दस *बहुत धीरे* वाले झूले।'],
        ['pari', 'excited', 'Swing!', 'झूला!'],
      ], { optional: 1 });
    },
  },

  // ======================= THE BROKEN FLOWER POT =======================
  {
    id: 'flowerpot', theme: 'friends', moral: true, look: 'home',
    build(ep, { T }) {
      ep.title = T('Who Broke the Flower Pot?', 'गमला किसने तोड़ा?');
      ep.summary = T("Golu hits a big six and breaks Mrs. Kapoor's favourite flower pot. Nobody saw him. And then poor Bruno gets the blame...", 'गोलू एक बड़ा छक्का मारता है और कपूर आंटी का फ़ेवरेट गमला तोड़ देता है। किसी ने नहीं देखा। और फिर बेचारे ब्रूनो पर इल्ज़ाम आ जाता है...');
      ep.hook = T("Watch me hit the *biggest* six in cricket history!", 'देखो, मैं क्रिकेट के इतिहास का *सबसे बड़ा* छक्का मारूँगा!');
      ep.music = 'happy';
      ep.callback = T("Telling the truth was scary for one minute. | Hiding it was scary all day.", 'सच बोलना बस एक मिनट डरावना था। | छुपाना पूरे दिन डरावना था।');
      ep.moral = T('Always tell the truth, | even when it is hard.', 'हमेशा सच बोलो, | चाहे मुश्किल हो।');
      ep.lesson = T("Golu thought the truth would get him in trouble. | Instead, it fixed everything.", 'गोलू को लगा सच बोलने से वो मुसीबत में पड़ेगा। | पर सच ने सब ठीक कर दिया।');

      ep.act('house', ['golu:cricket', 'kabir:idle:ball'], [
        ['kabir', 'excited', 'Last ball! | Six runs to win!', 'आख़िरी बॉल! | जीतने के लिए छह रन!'],
        ['golu', 'excited', 'Watch this. | The biggest six ever!', 'ये देखो। | अब तक का सबसे बड़ा छक्का!'],
      ], { time: 'afternoon', transition: 'fade' });
      ep.act('house', ['golu:cricket', 'kabir:idle'], [
        ['golu', 'excited', 'Yes! | It\'s going... | going... | over the wall!', 'हाँ! | जा रही है... | जा रही है... | दीवार के पार!'],
        ['kabir', 'scared', '[0.5] Golu... | did you hear that crash?', '[0.5] गोलू... | तुमने धड़ाम की आवाज़ सुनी?', 0.6],
      ], { minDuration: 4 });
      ep.act('house', ['golu:lookaround:bat', 'kabir:idle'], [
        ['golu', 'scared', "Oh no. | That's Mrs. Kapoor's garden. | Her big blue flower pot... | it's broken!", 'अरे नहीं। | ये तो कपूर आंटी का बग़ीचा है। | उनका बड़ा नीला गमला... | टूट गया!'],
        ['kabir', 'scared', 'She loves that pot. | Golu, run! | Nobody saw us!', 'उन्हें वो गमला बहुत पसंद है। | गोलू, भागो! | किसी ने नहीं देखा!'],
      ], { set: [{ kind: 'brokenpot', x: 2.0, z: -0.6 }] });
      ep.act('bedroom', ['golu:sitfloor', 'kabir:sitfloor'], [
        ['golu', 'scared', "I hid the bat under the bed. | If anyone asks, we were reading books all afternoon.", 'मैंने बैट पलंग के नीचे छुपा दिया। | कोई पूछे तो, हम पूरी दोपहर किताबें पढ़ रहे थे।'],
        ['kabir', 'thinking', 'You never read books all afternoon.', 'तुम पूरी दोपहर कभी किताब नहीं पढ़ते।'],
        ['golu', 'sad', "Today I did.", 'आज पढ़ी।'],
      ]);
      ep.act('house', ['kapoor:idle::walk-right', 'mumma:idle', 'golu:idle', 'bruno:idle'], [
        ['kapoor', 'sad', "Someone broke my blue flower pot. | My mother gave it to me.", 'किसी ने मेरा नीला गमला तोड़ दिया। | वो मुझे मेरी माँ ने दिया था।'],
        ['mumma', 'surprised', "Oh no, I'm so sorry, Mrs. Kapoor. | Golu, did you see anything?", 'अरे नहीं, बहुत अफ़सोस हुआ, कपूर आंटी। | गोलू, तुमने कुछ देखा?'],
        ['golu', 'scared', 'Me? | No. | I was... reading.', 'मैं? | नहीं। | मैं तो... पढ़ रहा था।', 0.5],
      ]);
      ep.act('house', ['kapoor:idle', 'bruno:idle', 'golu:idle', 'mumma:idle'], [
        ['kapoor', 'thinking', "Maybe it was that puppy. | I saw him in my garden yesterday, digging.", 'शायद वो पिल्ला था। | मैंने कल उसे अपने बग़ीचे में खोदते देखा था।'],
        ['mumma', 'sad', 'Bruno? | Oh dear. | Then Bruno will have to stay tied up in the yard for a few days.', 'ब्रूनो? | ओह। | तब तो ब्रूनो को कुछ दिन आँगन में बँधकर रहना पड़ेगा।'],
        ['bruno', 'sad', 'Woof...', 'भौं...'],
      ]);
      ep.act('house', ['golu:sad', 'bruno:sad'], [
        ['golu', 'sad', "Bruno didn't do it. | I did. | And now he's getting punished for me.", 'ब्रूनो ने नहीं किया। | मैंने किया। | और अब उसे मेरी वजह से सज़ा मिल रही है।'],
        ['golu', 'sad', "[0.6] He's just looking at me. | Like he knows.", '[0.6] वो बस मुझे देख रहा है। | जैसे उसे सब पता है।', 0.5],
      ], { camera: 'closeup', minDuration: 5 });
      ep.act('bedroom', ['golu:sad', 'anaya:read'], [
        ['anaya', 'calm', "Golu, you haven't eaten anything. | What's wrong?", 'गोलू, तुमने कुछ खाया नहीं। | क्या हुआ?'],
        ['golu', 'sad', "Didi, | if you did something wrong, | and someone else got blamed... | what would you do?", 'दीदी, | अगर आपने कुछ ग़लत किया हो, | और किसी और को डाँट पड़ जाए... | तो आप क्या करोगी?'],
        ['anaya', 'calm', "I'd tell the truth. | It's scary for one minute. | But keeping a secret is scary *every* minute.", 'मैं सच बता दूँगी। | एक मिनट के लिए डर लगता है। | पर राज़ छुपाने में *हर* मिनट डर लगता है।', 0.5],
      ], { time: 'night', minDuration: 6 });
      ep.act('house', ['golu:idle:bat', 'kabir:idle', 'kapoor:idle', 'mumma:idle'], [
        ['golu', 'sad', "Mrs. Kapoor, | Bruno didn't break your pot. | I did. | With my cricket ball.", 'कपूर आंटी, | आपका गमला ब्रूनो ने नहीं तोड़ा। | मैंने तोड़ा। | अपनी क्रिकेट बॉल से।'],
        ['kabir', 'sad', 'I was there too. | We ran away. | We are very sorry.', 'मैं भी वहाँ था। | हम भाग गए थे। | हमें बहुत अफ़सोस है।'],
        ['kapoor', 'surprised', 'You came to tell me yourselves?', 'तुम ख़ुद बताने आए?', 0.6],
      ], { card: ["Next morning", "अगली सुबह"], time: 'morning' });
      ep.act('house', ['kapoor:idle', 'golu:idle', 'kabir:idle', 'mumma:idle', 'bruno:jump'], [
        ['kapoor', 'calm', "I'm sad about my pot. | But I'm happy you told me the truth. | That takes a brave heart.", 'मुझे गमले का दुख है। | पर ख़ुशी है कि तुमने सच बताया। | इसके लिए हिम्मत चाहिए।'],
        ['mumma', 'calm', 'And I owe someone an apology too. | Bruno, come here, you\'re free!', 'और मुझे भी किसी से माफ़ी माँगनी है। | ब्रूनो, इधर आओ, तुम आज़ाद हो!'],
        ['bruno', 'excited', 'Woof woof!', 'भौं भौं!'],
      ]);
      ep.act('house', ['golu:idle:coin', 'kabir:idle:coin', 'kapoor:idle'], [
        ['golu', 'calm', "We want to buy you a new pot. | We have twenty rupees from our piggy banks.", 'हम आपके लिए नया गमला ख़रीदना चाहते हैं। | हमारी गुल्लक में बीस रुपये हैं।'],
        ['kapoor', 'happy', 'Keep your money. | Instead, help me plant new flowers. | Every Sunday, for one month.', 'अपने पैसे रखो। | उसके बदले, मेरे साथ नए फूल लगाओ। | हर संडे, एक महीने तक।'],
        ['kabir', 'happy', 'Deal!', 'पक्का!'],
      ], { optional: 2 });
      ep.act('house', ['kapoor:idle:flower', 'golu:idle:plantpot', 'kabir:idle:shovel'], [
        ['golu', 'happy', 'A new pot, and red flowers. | This one is even prettier.', 'नया गमला, और लाल फूल। | ये वाला तो और भी सुंदर है।'],
        ['kapoor', 'laugh', 'And I\'ll put it far, far away from the cricket.', 'और मैं इसे क्रिकेट से बहुत, बहुत दूर रखूँगी।'],
      ], { card: ["Sunday", "संडे"], transition: 'fade' });
      ep.act('playground', ['golu:cricket', 'kabir:idle:ball', 'papa:idle'], [
        ['papa', 'laugh', 'New rule: | big sixes only in the park! | Where the only thing you can break is a record.', 'नया नियम: | बड़े छक्के सिर्फ़ पार्क में! | जहाँ तुम सिर्फ़ रिकॉर्ड तोड़ सकते हो।'],
        ['golu', 'excited', 'Then watch me break one!', 'तो देखो, मैं एक तोड़ता हूँ!'],
      ], { optional: 1 });
    },
  },
];
