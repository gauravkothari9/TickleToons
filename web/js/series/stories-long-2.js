// Long-episode stories, part 2: nature, home, town, health and celebrations.
// Same rules as stories-long.js (read the notes at the top of that file): one story, one problem,
// clear dialogue, the same prop for the same thing, and optional scenes that belong to the story.

export const LONG_TEMPLATES_2 = [
  // ======================= THE MESSY PARK =======================
  {
    id: 'messypark', theme: 'environment', moral: true, look: 'home',
    build(ep, { T }) {
      ep.title = T('The Messy Park Mystery!', 'गंदे पार्क का रहस्य!');
      ep.summary = T("Golu throws his chips packet on the grass. It's just one, he says. But the next day, the whole park is a mess, and the swings are closed.", 'गोलू अपना चिप्स का पैकेट घास पर फेंक देता है। बस एक ही तो है, वो कहता है। पर अगले दिन पूरा पार्क गंदा है, और झूले बंद हैं।');
      ep.hook = T('Somebody made our park *so* dirty! | Who could it be?', 'किसी ने हमारा पार्क *इतना* गंदा कर दिया! | कौन हो सकता है?');
      ep.music = 'calm';
      ep.callback = T("Now I'm the dustbin captain. | Even Papa can't escape me.", 'अब मैं डस्टबिन कैप्टन हूँ। | पापा भी मुझसे नहीं बच सकते।');
      ep.moral = T('Keep your surroundings clean. | Always use the dustbin.', 'अपने आस-पास सफ़ाई रखो। | हमेशा कूड़ेदान का इस्तेमाल करो।');
      ep.lesson = T("One wrapper looks small. | But when everyone throws just one, it becomes a big mess.", 'एक रैपर छोटा लगता है। | पर जब हर कोई बस एक फेंकता है, तो बहुत बड़ी गंदगी बन जाती है।');

      ep.act('playground', ['golu:eat:chips', 'kabir:idle', 'anaya:idle'], [
        ['golu', 'happy', 'Mmm, done. | Last chip.', 'म्म्म, ख़त्म। | आख़िरी चिप्स।'],
        ['anaya', 'calm', 'Golu, the dustbin is over there. | By the gate.', 'गोलू, कूड़ेदान वहाँ है। | गेट के पास।'],
        ['golu', 'thinking', "That's so far, Didi. | It's just one small packet. | The wind will take it away.", 'वो तो बहुत दूर है, दीदी। | बस एक छोटा सा पैकेट है। | हवा उड़ा ले जाएगी।'],
        ['kabir', 'happy', 'Yeah, mine too. | Just one.', 'हाँ, मेरा भी। | बस एक।'],
      ], { card: ["Saturday", "शनिवार"], time: 'evening', transition: 'fade' });
      ep.act('playground', ['golu:idle', 'kabir:idle', 'meera:sad'], [
        ['golu', 'surprised', "Eww! | What happened to our park?", 'छी! | हमारे पार्क को क्या हुआ?'],
        ['meera', 'sad', "Wrappers, bottles, paper everywhere. | And it smells bad.", 'हर जगह रैपर, बोतलें, काग़ज़। | और बदबू भी आ रही है।'],
        ['kabir', 'angry', 'Who would do this?', 'ऐसा कौन करेगा?'],
      ], { card: ["Next morning", "अगली सुबह"], time: 'morning', props: [{ kind: 'litter', x: 1.6, z: 0.6 }, { kind: 'litter', x: -1.8, z: 0.4 }, { kind: 'chips', x: 0.4, z: 1.0 }] });
      ep.act('playground', ['inspector:idle', 'golu:idle', 'kabir:idle', 'meera:idle'], [
        ['inspector', 'calm', "Sorry, children. | The swings are closed today. | There's broken glass near the slide. | Someone could get hurt.", 'सॉरी बच्चों। | आज झूले बंद हैं। | फिसलपट्टी के पास काँच टूटा पड़ा है। | किसी को चोट लग सकती है।'],
        ['kabir', 'sad', 'No swings? | But it\'s Sunday!', 'झूले नहीं? | पर आज तो संडे है!'],
      ], { props: [{ kind: 'litter', x: 1.6, z: 0.6 }, { kind: 'chips', x: 0.4, z: 1.0 }], optional: 2 });
      ep.act('playground', ['golu:think', 'kabir:idle'], [
        ['golu', 'thinking', "Kabir... | that orange packet. | [0.5] That's my chips packet. | From yesterday.", 'कबीर... | वो नारंगी पैकेट। | [0.5] वो मेरा चिप्स का पैकेट है। | कल वाला।'],
        ['kabir', 'sad', 'And that blue bottle is mine.', 'और वो नीली बोतल मेरी है।'],
        ['golu', 'sad', 'We said just one. | But if everybody throws just one...', 'हमने कहा था बस एक। | पर अगर हर कोई बस एक फेंके...', 0.5],
      ], { camera: 'closeup', minDuration: 5, props: [{ kind: 'chips', x: 0.4, z: 1.0 }] });
      ep.act('playground', ['golu:idle', 'kabir:idle', 'meera:idle', 'anaya:idle::walk-left'], [
        ['anaya', 'surprised', 'Wow. | This is really bad.', 'अरे। | ये तो सच में बहुत बुरा है।'],
        ['golu', 'sad', "Didi, part of it is my fault. | I threw my packet here yesterday.", 'दीदी, इसमें मेरी भी ग़लती है। | कल मैंने अपना पैकेट यहीं फेंका था।'],
        ['anaya', 'thinking', 'Then let\'s fix it. | All of us. | A clean-up party!', 'तो चलो इसे ठीक करते हैं। | सब मिलकर। | सफ़ाई पार्टी!'],
        ['meera', 'excited', "A party? | I'll make the posters!", 'पार्टी? | मैं पोस्टर बनाऊँगी!'],
      ]);
      ep.act('bedroom', ['meera:paint', 'golu:idle:paper', 'kabir:idle'], [
        ['meera', 'happy', 'Clean-up party! | Sunday, ten o\'clock. | Bring gloves and a big bag.', 'सफ़ाई पार्टी! | संडे, दस बजे। | दस्ताने और बड़ा थैला लेकर आओ।'],
        ['golu', 'excited', 'And free laddoos for everyone who comes! | [0.4] I have to ask Dadi about that part.', 'और आने वाले सबको मुफ़्त लड्डू! | [0.4] ये वाली बात मुझे दादी से पूछनी पड़ेगी।'],
      ], { optional: 2 });
      ep.act('kitchen', ['golu:idle', 'dadi:idle:laddooplate', 'papa:idle'], [
        ['golu', 'happy', 'Dadi, can you make laddoos for the clean-up party?', 'दादी, क्या आप सफ़ाई पार्टी के लिए लड्डू बना दोगी?'],
        ['dadi', 'laugh', 'For cleaning the park? | I will make two plates!', 'पार्क साफ़ करने के लिए? | मैं दो थालियाँ बनाऊँगी!'],
        ['papa', 'excited', 'And I will bring the garbage bags. | Big, strong ones.', 'और मैं कूड़े के थैले लाऊँगा। | बड़े, मज़बूत वाले।'],
      ]);
      ep.act('playground', ['anaya:idle:garbagebag', 'golu:idle:garbagebag', 'papa:idle:garbagebag', 'kabir:idle', 'meera:idle'], [
        ['papa', 'calm', 'Rule number one: | gloves on. | Rule number two: | if you see glass, don\'t touch it. | Call me.', 'पहला नियम: | दस्ताने पहनो। | दूसरा नियम: | काँच दिखे तो छूना नहीं। | मुझे बुलाना।'],
        ['anaya', 'happy', 'Golu and Kabir, you take the swings. | Meera and I take the grass.', 'गोलू और कबीर, तुम झूलों की तरफ़। | मीरा और मैं घास की तरफ़।'],
      ], { card: ["Sunday, 10 o'clock", "संडे, सुबह दस बजे"], time: 'morning', set: [{ kind: 'litter', x: 1.6, z: 0.6 }, { kind: 'litter', x: -1.8, z: 0.4 }] });
      ep.act('playground', ['golu:sweep', 'kabir:sweep', 'meera:idle:garbagebag'], [
        ['golu', 'excited', 'Wrapper! | Bottle! | Another wrapper!', 'रैपर! | बोतल! | एक और रैपर!'],
        ['kabir', 'excited', "I've got eleven! | How many do you have?", 'मेरे ग्यारह हो गए! | तुम्हारे कितने?'],
        ['meera', 'laugh', "It's not a race, you two!", 'ये रेस नहीं है, तुम दोनों!'],
        ['golu', 'laugh', 'Everything is a race, Meera.', 'हर चीज़ रेस है, मीरा।'],
      ], { minDuration: 6, set: [{ kind: 'litter', x: 1.6, z: 0.6 }] });
      ep.act('playground', ['kapoor:idle::walk-left', 'lalaji:idle::walk-left', 'anaya:idle:garbagebag', 'golu:idle'], [
        ['kapoor', 'happy', 'I saw your poster, children. | Can we help too?', 'मैंने तुम्हारा पोस्टर देखा, बच्चों। | क्या हम भी मदद कर सकते हैं?'],
        ['lalaji', 'happy', 'And I brought a brand new dustbin from my shop. | For the park!', 'और मैं अपनी दुकान से एक नया कूड़ेदान लाया हूँ। | पार्क के लिए!'],
        ['golu', 'excited', 'Now there are *two* dustbins! | No more far walking!', 'अब *दो* कूड़ेदान हैं! | अब दूर नहीं चलना पड़ेगा!'],
      ], { optional: 1, set: [{ kind: 'dustbin', x: 2.2, z: -0.4 }] });
      ep.act('playground', ['golu:cheer', 'kabir:cheer', 'meera:cheer', 'anaya:clap', 'papa:clap'], [
        ['anaya', 'excited', 'Look at our park now! | Clean grass, clean swings!', 'अब हमारा पार्क देखो! | साफ़ घास, साफ़ झूले!'],
        ['meera', 'happy', 'It even smells like flowers again.', 'अब तो फिर से फूलों की ख़ुशबू आ रही है।'],
        ['kabir', 'excited', 'And the swings are open!', 'और झूले खुल गए!'],
      ], { camera: 'orbit', minDuration: 6, set: [{ kind: 'dustbin', x: 2.2, z: -0.4 }] });
      ep.act('playground', ['golu:idle', 'dadi:idle:laddooplate', 'kabir:eat:laddoo', 'meera:eat:laddoo'], [
        ['dadi', 'happy', 'Laddoos for my little cleaners!', 'मेरे छोटे सफ़ाई वालों के लिए लड्डू!'],
        ['golu', 'calm', 'Wait. | Everybody... | the wrapper goes in the dustbin. | Okay?', 'रुको। | सब लोग... | रैपर कूड़ेदान में जाएगा। | ठीक है?'],
        ['dadi', 'laugh', 'Hai, listen to him! | Our Golu is the boss now.', 'अरे, इसकी सुनो! | अब तो हमारा गोलू बॉस है।'],
      ]);
      ep.act('street', ['papa:idle:banana', 'golu:point'], [
        ['papa', 'happy', 'Mmm, nice banana. | And the peel goes right... | here.', 'म्म्म, बढ़िया केला। | और छिलका जाएगा... | यहाँ।'],
        ['golu', 'angry', 'Papa! | Stop right there! | Dustbin. | *Now*.', 'पापा! | वहीं रुको! | कूड़ेदान। | *अभी*।', 0.3],
        ['papa', 'laugh', 'Yes, Captain! | Sorry, Captain!', 'जी, कैप्टन! | सॉरी, कैप्टन!'],
      ], { transition: 'fade' });
    },
  },

  // ======================= TREE PLANTING DAY =======================
  {
    id: 'trees', theme: 'environment', moral: true, look: 'home',
    build(ep, { T }) {
      ep.title = T("Dadaji's Tree Planting Day!", 'दादाजी का पेड़ लगाओ दिन!');
      ep.summary = T("It's the hottest day of the summer and there's no shade anywhere. Dadaji remembers a time when this place was full of trees. So the family decides to bring them back.", 'गर्मी का सबसे गरम दिन है और कहीं छाँव नहीं। दादाजी को याद है जब ये जगह पेड़ों से भरी थी। तो परिवार उन्हें वापस लाने का फ़ैसला करता है।');
      ep.hook = T("It's *so* hot today! | But Dadaji has a plan.", 'आज *कितनी* गर्मी है! | पर दादाजी के पास एक प्लान है।');
      ep.music = 'calm';
      ep.callback = T('My tree is called Golu Junior. | When he grows up, he\'ll give shade to everybody.', 'मेरे पेड़ का नाम है गोलू जूनियर। | जब वो बड़ा होगा, सबको छाँव देगा।');
      ep.moral = T('Plant trees and take care of them. | They give us shade, fresh air and fruit.', 'पेड़ लगाओ और उनका ध्यान रखो। | वो हमें छाँव, ताज़ी हवा और फल देते हैं।');
      ep.lesson = T("A tree takes years to grow. | So the best time to plant one is today.", 'पेड़ को बड़ा होने में सालों लगते हैं। | इसलिए पेड़ लगाने का सबसे अच्छा दिन आज है।');

      ep.act('meadow', ['golu:sad', 'anaya:idle', 'dadaji:idle::walk-left'], [
        ['golu', 'sad', "It's so hot, my head is cooking like an egg.", 'इतनी गर्मी है, मेरा सिर अंडे की तरह पक रहा है।'],
        ['anaya', 'thinking', "There's not a single tree here. | No shade anywhere.", 'यहाँ एक भी पेड़ नहीं है। | कहीं छाँव नहीं।'],
        ['dadaji', 'calm', 'When I was your age, | this whole place was full of big mango trees. | We played under them all summer.', 'जब मैं तुम्हारी उम्र का था, | ये पूरी जगह आम के बड़े पेड़ों से भरी थी। | हम पूरी गर्मी उनके नीचे खेलते थे।'],
      ], { time: 'afternoon', transition: 'fade' });
      ep.act('meadow', ['golu:idle', 'anaya:idle', 'dadaji:idle'], [
        ['golu', 'surprised', "Here? | Where did they go?", 'यहाँ? | वो कहाँ चले गए?'],
        ['dadaji', 'sad', 'They were cut down, one by one, | to make roads and buildings. | And nobody planted new ones.', 'उन्हें एक-एक करके काट दिया गया, | सड़कें और इमारतें बनाने के लिए। | और किसी ने नए नहीं लगाए।'],
        ['anaya', 'thinking', 'Then we can plant new ones! | Right, Dadaji?', 'तो हम नए लगा सकते हैं! | है ना, दादाजी?', 0.5],
      ], { camera: 'closeup', minDuration: 5 });
      ep.act('meadow', ['dadaji:idle', 'golu:jump', 'anaya:idle'], [
        ['dadaji', 'happy', 'Yes, we can. | How about one tree for every person in our family?', 'हाँ, बिल्कुल। | परिवार के हर सदस्य के लिए एक पेड़ कैसा रहेगा?'],
        ['golu', 'excited', 'Seven trees! | Can mine be the biggest?', 'सात पेड़! | क्या मेरा सबसे बड़ा होगा?'],
        ['dadaji', 'laugh', "That depends on how well you take care of it.", 'ये इस पर है कि तुम उसका कितना ध्यान रखते हो।'],
      ]);
      ep.act('market', ['lalaji:idle:sprout', 'dadaji:idle', 'golu:idle', 'anaya:idle'], [
        ['lalaji', 'happy', 'Seven baby trees? | Mango, neem, guava... | take your pick!', 'सात छोटे पेड़? | आम, नीम, अमरूद... | जो चाहो चुनो!'],
        ['golu', 'excited', 'A mango tree for me! | So one day I can eat mangoes from my own tree.', 'मेरे लिए आम का पेड़! | ताकि एक दिन मैं अपने पेड़ के आम खा सकूँ।'],
        ['anaya', 'happy', 'A neem tree for me. | Dadi says neem keeps the air clean.', 'मेरे लिए नीम का पेड़। | दादी कहती हैं नीम हवा साफ़ रखता है।'],
      ], { optional: 2 });
      ep.act('meadow', ['papa:idle:shovel', 'golu:idle:shovel', 'anaya:idle:sprout', 'dadaji:idle', 'mumma:idle:sprout'], [
        ['dadaji', 'calm', 'Dig a hole as deep as your arm. | Put the baby tree in, gently. | Then soil, and press it down.', 'अपने हाथ जितना गहरा गड्ढा खोदो। | छोटा पेड़ धीरे से अंदर रखो। | फिर मिट्टी डालो, और दबा दो।'],
        ['papa', 'laugh', "Dig, dig, dig. | Golu, you're throwing more soil on me than out of the hole!", 'खोदो, खोदो, खोदो। | गोलू, तुम गड्ढे से ज़्यादा मिट्टी तो मुझ पर डाल रहे हो!'],
        ['golu', 'laugh', 'Sorry, Papa! | Digging is harder than it looks.', 'सॉरी, पापा! | खोदना जितना दिखता है उससे मुश्किल है।'],
      ], { minDuration: 6, set: [{ kind: 'sapling', x: 2.0, z: -0.5 }] });
      ep.act('meadow', ['golu:idle:wateringcan', 'anaya:idle', 'pari:sitfloor', 'mumma:idle'], [
        ['anaya', 'happy', "Mumma's tree, Papa's tree, Dadi's tree, Dadaji's tree...", 'मम्मा का पेड़, पापा का पेड़, दादी का पेड़, दादाजी का पेड़...'],
        ['mumma', 'happy', 'And the smallest one for the smallest person. | Pari\'s tree.', 'और सबसे छोटा, सबसे छोटी के लिए। | परी का पेड़।'],
        ['pari', 'excited', 'Tree!', 'पेड़!'],
        ['golu', 'happy', 'And mine. | I\'ll call him Golu Junior.', 'और मेरा। | मैं इसका नाम रखूँगा गोलू जूनियर।'],
      ], { minDuration: 5, set: [{ kind: 'sapling', x: 2.0, z: -0.5 }, { kind: 'sapling', x: -2.0, z: -0.6 }, { kind: 'sapling', x: 2.8, z: -1.4 }, { kind: 'sapling', x: -2.9, z: -1.5 }] });
      ep.act('meadow', ['golu:sitfloor', 'dadaji:sitchair'], [
        ['golu', 'thinking', 'Dadaji, | when will Golu Junior be big enough to sit under?', 'दादाजी, | गोलू जूनियर इतना बड़ा कब होगा कि उसके नीचे बैठ सकें?'],
        ['dadaji', 'calm', 'Maybe in five years. | Maybe ten.', 'शायद पाँच साल में। | शायद दस।'],
        ['golu', 'surprised', "Ten years? | I'll be seventeen! | [0.5] Then why did the old people plant your mango trees?", 'दस साल? | तब तो मैं सत्रह का हो जाऊँगा! | [0.5] तो फिर पुराने लोगों ने आपके आम के पेड़ क्यों लगाए थे?'],
        ['dadaji', 'calm', 'So that children like me could play under them. | Now it\'s our turn to plant for the children after us.', 'ताकि मेरे जैसे बच्चे उनके नीचे खेल सकें। | अब हमारी बारी है, हमारे बाद वाले बच्चों के लिए लगाने की।', 0.5],
      ], { camera: 'closeup', minDuration: 7 });
      ep.act('meadow', ['golu:idle:wateringcan', 'kabir:idle::run-right'], [
        ['kabir', 'surprised', 'Golu, what are you doing out here in the heat?', 'गोलू, इतनी गर्मी में बाहर क्या कर रहे हो?'],
        ['golu', 'happy', "Watering my tree. | Every evening. | Want to plant one too?", 'अपने पेड़ को पानी दे रहा हूँ। | हर शाम। | तुम भी एक लगाओगे?'],
        ['kabir', 'excited', 'Can mine be next to yours? | Then they can be best friends too!', 'क्या मेरा तुम्हारे बग़ल में लग सकता है? | फिर वो भी पक्के दोस्त बन जाएँगे!'],
      ], { card: ["One week later", "एक हफ़्ते बाद"], time: 'evening', optional: 1, transition: 'fade' });
      ep.act('meadow', ['golu:sad', 'anaya:idle'], [
        ['golu', 'sad', 'Didi, look. | Golu Junior\'s leaves are going brown. | Is he dying?', 'दीदी, देखो। | गोलू जूनियर की पत्तियाँ भूरी हो रही हैं। | क्या ये मर रहा है?'],
        ['anaya', 'thinking', "Did you water him yesterday?", 'कल पानी दिया था?'],
        ['golu', 'sad', '[0.4] No. | It was raining a tiny bit, so I thought... | the sky would do it.', '[0.4] नहीं। | थोड़ी सी बारिश हो रही थी, तो मुझे लगा... | आसमान दे देगा।'],
      ], { card: ["Next day", "अगले दिन"], time: 'afternoon', set: [{ kind: 'sapling', x: 2.0, z: -0.5 }] });
      ep.act('meadow', ['dadaji:idle', 'golu:idle:wateringcan', 'anaya:idle'], [
        ['dadaji', 'calm', 'A few drops of rain are not enough for a baby tree. | Give him water now. | He will be okay.', 'छोटे पेड़ के लिए बारिश की दो बूँदें काफ़ी नहीं। | अभी पानी दो। | ये ठीक हो जाएगा।'],
        ['golu', 'calm', "Sorry, Golu Junior. | Here's a big drink. | I won't forget again.", 'सॉरी, गोलू जूनियर। | ये लो, ख़ूब सारा पानी। | अब नहीं भूलूँगा।'],
      ]);
      ep.act('meadow', ['golu:point', 'anaya:idle', 'dadaji:idle', 'mumma:idle', 'pari:sitfloor'], [
        ['golu', 'excited', 'Look! | A brand new leaf! | Bright green!', 'देखो! | एक नई पत्ती! | एकदम हरी!'],
        ['dadaji', 'happy', 'He\'s growing, beta. | Because you took care of him.', 'ये बढ़ रहा है, बेटा। | क्योंकि तुमने इसका ध्यान रखा।'],
        ['mumma', 'happy', 'Seven trees, all green and growing.', 'सातों पेड़, सब हरे और बढ़ते हुए।'],
      ], { card: ["Two weeks later", "दो हफ़्ते बाद"], time: 'morning', transition: 'fade', set: [{ kind: 'sapling', x: 2.0, z: -0.5 }, { kind: 'sapling', x: -2.0, z: -0.6 }, { kind: 'sapling', x: 2.8, z: -1.4 }, { kind: 'sapling', x: -2.9, z: -1.5 }, { kind: 'sapling', x: 0, z: -2.0 }] });
      ep.act('meadow', ['golu:sitfloor', 'dadaji:sitfloor', 'anaya:sitfloor', 'pari:sitfloor'], [
        ['golu', 'happy', 'Dadaji, | when Golu Junior is big, | will you sit under him with me?', 'दादाजी, | जब गोलू जूनियर बड़ा हो जाएगा, | क्या आप उसके नीचे मेरे साथ बैठोगे?'],
        ['dadaji', 'laugh', "I'll be very, very old then. | But yes. | I'll bring the mangoes.", 'तब तक तो मैं बहुत, बहुत बूढ़ा हो जाऊँगा। | पर हाँ। | आम मैं लाऊँगा।'],
      ], { optional: 1, camera: 'wide' });
    },
  },

  // ======================= PAPA COOKS =======================
  {
    id: 'papacooks', theme: 'home', moral: undefined, look: 'home',
    build(ep, { T }, { moral }) {
      ep.title = T("Papa's Sunday Cooking Disaster!", 'पापा का संडे खाना - गड़बड़झाला!');
      ep.summary = T("It's Mumma's birthday, and Papa wants to cook her lunch. All by himself. No help needed. Absolutely none. What could go wrong?", 'आज मम्मा का जन्मदिन है, और पापा उनके लिए खाना बनाना चाहते हैं। अकेले। किसी की मदद नहीं चाहिए। बिल्कुल नहीं। भला क्या गड़बड़ होगी?');
      ep.hook = T("Papa is cooking lunch today. | [0.4] Should we be worried? | Yes.", 'आज खाना पापा बना रहे हैं। | [0.4] क्या हमें डरना चाहिए? | हाँ।');
      ep.music = 'silly';
      ep.callback = T("Papa's dal was the best I ever had. | [0.4] Because all of us made it.", 'पापा की दाल अब तक की सबसे अच्छी दाल थी। | [0.4] क्योंकि वो हम सबने मिलकर बनाई थी।');
      if (moral !== false) {
        ep.moral = T('Many hands make work light. | And asking for help is nothing to be shy about.', 'मिलकर काम करो तो काम हल्का लगता है। | और मदद माँगने में शर्म कैसी।');
        ep.lesson = T("Papa wanted to do it all alone. | But it was so much more fun together.", 'पापा सब कुछ अकेले करना चाहते थे। | पर साथ मिलकर करने में कहीं ज़्यादा मज़ा आया।');
      }

      ep.act('bedroom', ['papa:idle', 'golu:idle', 'anaya:idle'], [
        ['papa', 'excited', "Shh! | It's Mumma's birthday today. | And I, Papa, will cook her a special lunch.", 'श्श! | आज मम्मा का जन्मदिन है। | और मैं, पापा, उनके लिए ख़ास खाना बनाऊँगा।'],
        ['anaya', 'thinking', 'Papa, you made tea last week. | The whole house smelled like burnt milk.', 'पापा, पिछले हफ़्ते आपने चाय बनाई थी। | पूरे घर में जले दूध की बदबू थी।'],
        ['papa', 'laugh', "That was a *practice* tea. | Today is the real match.", 'वो *प्रैक्टिस* वाली चाय थी। | आज असली मैच है।'],
      ], { time: 'morning', transition: 'fade' });
      ep.act('kitchen', ['papa:idle', 'mumma:idle::walk-right', 'golu:idle'], [
        ['mumma', 'surprised', 'Why is everyone in my kitchen?', 'सब मेरी रसोई में क्यों हैं?'],
        ['papa', 'happy', "Happy birthday! | Today, you rest. | Go and sit. | Chef Papa is in charge.", 'जन्मदिन मुबारक हो! | आज तुम आराम करो। | जाओ, बैठो। | आज शेफ़ पापा की ड्यूटी है।'],
        ['mumma', 'laugh', "Okay... | but if I smell smoke, I'm coming back.", 'ठीक है... | पर धुएँ की गंध आई, तो मैं वापस आ जाऊँगी।'],
      ]);
      ep.act('kitchen', ['papa:cook', 'golu:idle', 'anaya:idle'], [
        ['papa', 'excited', 'The menu: | dal, rice, rotis, | and kheer for dessert!', 'मेन्यू: | दाल, चावल, रोटियाँ, | और मीठे में खीर!'],
        ['golu', 'happy', 'Can I help, Papa? | I can wash the rice!', 'मैं मदद करूँ, पापा? | मैं चावल धो सकता हूँ!'],
        ['papa', 'calm', "No, no, no. | A real chef works alone. | You two, go and play.", 'नहीं, नहीं, नहीं। | असली शेफ़ अकेले काम करता है। | तुम दोनों, जाओ खेलो।'],
      ]);
      ep.act('kitchen', ['papa:cook'], [
        ['papa', 'happy', 'Dal is cooking. | Rice is cooking. | Now the rotis...', 'दाल पक रही है। | चावल पक रहे हैं। | अब रोटियाँ...'],
        ['papa', 'thinking', 'How much water goes in the flour? | [0.5] A little? | A lot? | I\'ll just add... | a lot.', 'आटे में कितना पानी जाता है? | [0.5] थोड़ा? | बहुत सारा? | मैं डाल देता हूँ... | बहुत सारा।', 0.4],
      ], { camera: 'closeup', minDuration: 5 });
      ep.act('kitchen', ['papa:idle:flourbowl', 'golu:idle::walk-left', 'anaya:idle::walk-left'], [
        ['golu', 'surprised', 'Papa, why is your roti dough... | dripping?', 'पापा, आपका रोटी का आटा... | टपक क्यों रहा है?'],
        ['papa', 'scared', "It's... | soup dough. | It's a new recipe.", 'ये... | सूप वाला आटा है। | नई रेसिपी है।'],
        ['anaya', 'thinking', "Papa, I smell something burning.", 'पापा, कुछ जलने की गंध आ रही है।', 0.4],
      ]);
      ep.act('kitchen', ['papa:cook', 'anaya:point', 'golu:idle'], [
        ['papa', 'scared', 'The dal! | It stuck to the bottom! | And the rice is still hard!', 'दाल! | नीचे चिपक गई! | और चावल अभी भी कड़क हैं!'],
        ['golu', 'laugh', 'Papa, it\'s like your practice tea!', 'पापा, ये तो आपकी प्रैक्टिस वाली चाय जैसा है!'],
        ['papa', 'sad', "Not helping, Golu.", 'मदद नहीं कर रहे हो, गोलू।'],
      ]);
      ep.act('kitchen', ['papa:sad', 'anaya:idle', 'golu:idle'], [
        ['papa', 'sad', "I wanted to make one perfect lunch for Mumma. | Just once. | And look at it.", 'मैं मम्मा के लिए बस एक बार परफ़ेक्ट खाना बनाना चाहता था। | बस एक बार। | और ये देखो।'],
        ['anaya', 'calm', "Papa, a real chef has a team. | Even on TV, they have helpers.", 'पापा, असली शेफ़ की एक टीम होती है। | टीवी पर भी उनके हेल्पर होते हैं।'],
        ['golu', 'happy', 'And you have the best team, | right here!', 'और आपकी सबसे अच्छी टीम, | यहीं खड़ी है!'],
        ['papa', 'laugh', 'Okay. | Team, I need help!', 'ठीक है। | टीम, मुझे मदद चाहिए!', 0.5],
      ], { camera: 'closeup', minDuration: 6 });
      ep.act('kitchen', ['dadi:idle::walk-right', 'papa:idle', 'anaya:idle', 'golu:idle'], [
        ['dadi', 'surprised', 'Who called for help? | [0.4] Hai Ram! | What happened to this dough?', 'मदद किसने बुलाई? | [0.4] हाय राम! | इस आटे को क्या हुआ?'],
        ['papa', 'sad', 'Too much water, Amma.', 'बहुत पानी, अम्मा।'],
        ['dadi', 'calm', 'No problem. | We just add more flour, little by little. | Dough is very forgiving.', 'कोई बात नहीं। | थोड़ा-थोड़ा करके और आटा डालेंगे। | आटा बहुत माफ़ करने वाला होता है।'],
      ], { optional: 2 });
      ep.act('kitchen', ['anaya:read', 'golu:idle:carrot', 'papa:cook', 'dadi:idle:rollingpin'], [
        ['anaya', 'calm', "I'm reading the recipe. | Dal: one cup dal, three cups water, | stir every few minutes.", 'मैं रेसिपी पढ़ रही हूँ। | दाल: एक कप दाल, तीन कप पानी, | हर थोड़ी देर में चलाओ।'],
        ['golu', 'happy', 'I\'m washing the carrots for the salad!', 'मैं सलाद के लिए गाजर धो रहा हूँ!'],
        ['papa', 'happy', 'And I am... | stirring. | Every few minutes. | Like a professional.', 'और मैं... | चला रहा हूँ। | हर थोड़ी देर में। | प्रोफ़ेशनल की तरह।'],
      ], { minDuration: 6 });
      ep.act('kitchen', ['dadi:idle:rollingpin', 'golu:idle:flourbowl', 'papa:idle'], [
        ['dadi', 'happy', 'Golu, roll it round, like the moon.', 'गोलू, इसे गोल बेलो, चाँद जैसा।'],
        ['golu', 'laugh', "Mine looks like a map of India.", 'मेरी तो भारत के नक़्शे जैसी बनी है।'],
        ['papa', 'laugh', 'Mine looks like a potato.', 'मेरी आलू जैसी बनी है।'],
        ['dadi', 'laugh', "Round or not, they all taste the same!", 'गोल हो या न हो, स्वाद सबका एक जैसा है!'],
      ], { optional: 1, minDuration: 5 });
      ep.act('kitchen', ['dadaji:idle::walk-right', 'papa:cook', 'golu:idle'], [
        ['dadaji', 'thinking', 'Something smells good in here. | Is that... kheer?', 'यहाँ कुछ अच्छी ख़ुशबू आ रही है। | क्या ये... खीर है?'],
        ['papa', 'happy', 'My one success today, Babuji.', 'आज की मेरी इकलौती कामयाबी, बाबूजी।'],
        ['golu', 'laugh', 'He only burned it a little bit.', 'बस थोड़ी सी जली है।'],
      ], { optional: 2 });
      ep.act('kitchen', ['mumma:idle::walk-right', 'papa:idle:rotiplate', 'anaya:idle', 'golu:idle', 'dadi:idle'], [
        ['papa', 'excited', 'Lunch is served! | Dal, rice, rotis, | salad by Golu, | and kheer!', 'खाना तैयार है! | दाल, चावल, रोटियाँ, | गोलू का सलाद, | और खीर!'],
        ['mumma', 'surprised', "You made all this? | Alone?", 'ये सब तुमने बनाया? | अकेले?'],
        ['papa', 'laugh', '[0.4] Well... | not exactly alone.', '[0.4] वैसे... | बिल्कुल अकेले तो नहीं।'],
        ['anaya', 'laugh', 'He had a team!', 'उनकी टीम थी!'],
      ], { card: ["1 o'clock", "दोपहर एक बजे"], time: 'afternoon', minDuration: 5 });
      ep.act('kitchen', ['mumma:eat:roti', 'papa:idle', 'golu:eat:roti', 'anaya:eat', 'dadi:eat', 'dadaji:eat', 'pari:sitfloor'], [
        ['mumma', 'happy', "Mmm. | This is the best birthday lunch I've ever had. | Because my whole family made it.", 'म्म्म। | ये मेरे जन्मदिन का अब तक का सबसे अच्छा खाना है। | क्योंकि इसे मेरे पूरे परिवार ने बनाया।'],
        ['golu', 'laugh', 'Even the roti that looks like India?', 'भारत के नक़्शे वाली रोटी भी?'],
        ['mumma', 'laugh', 'Especially that one!', 'ख़ासकर वही!'],
      ], { camera: 'orbit', minDuration: 6 });
      ep.act('kitchen', ['papa:cook', 'mumma:idle'], [
        ['papa', 'happy', 'Next Sunday, I\'m making biryani.', 'अगले संडे, मैं बिरयानी बनाऊँगा।'],
        ['mumma', 'calm', 'With the team?', 'टीम के साथ?'],
        ['papa', 'laugh', 'With the team.', 'टीम के साथ।'],
      ], { optional: 1 });
    },
  },

  // ======================= PARI'S FIRST STEPS =======================
  {
    id: 'firststeps', theme: 'home', moral: undefined, look: 'home',
    build(ep, { T }, { moral }) {
      ep.title = T("Pari's First Steps!", 'परी के पहले कदम!');
      ep.summary = T("Baby Pari wants to walk, but she keeps falling down. Golu laughs at first... until he remembers how many times he fell off his bicycle.", 'बेबी परी चलना चाहती है, पर बार-बार गिर जाती है। गोलू पहले हँसता है... फिर उसे याद आता है कि वो ख़ुद साइकिल से कितनी बार गिरा था।');
      ep.hook = T("Our Pari is trying to *walk*! | Will she do it today?", 'हमारी परी *चलने* की कोशिश कर रही है! | क्या आज चल पाएगी?');
      ep.music = 'calm';
      ep.callback = T("I taught Pari to walk. | [0.4] Well, Pari taught Pari. | I just held the teddy.", 'मैंने परी को चलना सिखाया। | [0.4] मतलब, परी ने ख़ुद सीखा। | मैंने बस टेडी पकड़ा।');
      if (moral !== false) {
        ep.moral = T('Every fall is just practice for standing up again. | Never laugh when someone is learning.', 'हर बार गिरना, फिर से खड़े होने की प्रैक्टिस है। | जब कोई सीख रहा हो, तो उस पर कभी हँसो मत।');
        ep.lesson = T("Pari fell so many times. | But she never stopped trying.", 'परी कितनी बार गिरी। | पर उसने कोशिश करना नहीं छोड़ा।');
      }

      ep.act('bedroom', ['pari:crawl', 'anaya:idle', 'mumma:idle'], [
        ['anaya', 'excited', 'Mumma, look! | Pari is holding the sofa... | and standing up!', 'मम्मा, देखो! | परी सोफ़ा पकड़कर... | खड़ी हो रही है!'],
        ['mumma', 'excited', 'Oh my goodness! | She wants to walk!', 'अरे वाह! | ये चलना चाहती है!'],
      ], { transition: 'fade' });
      ep.act('bedroom', ['pari:firststeps', 'golu:idle', 'anaya:idle'], [
        ['pari', 'happy', 'Teddy!', 'टेडी!'],
        ['anaya', 'calm', 'She wants her teddy. | Come on, Pari, one step!', 'इसे अपना टेडी चाहिए। | चलो परी, एक कदम!'],
        ['pari', 'surprised', 'Uh-oh!', 'ओह-ओह!', 0.6],
        ['golu', 'laugh', 'Ha ha ha! | Plop! | She fell on her bottom like a sack of potatoes!', 'हा हा हा! | धप्प! | ये तो आलू की बोरी की तरह गिरी!'],
      ], { props: [{ kind: 'teddy', x: 1.8, z: 0.6 }] });
      ep.act('bedroom', ['pari:cry', 'golu:idle', 'anaya:idle'], [
        ['pari', 'sad', 'Waaah...', 'ऊँ ऊँ...'],
        ['anaya', 'angry', "Golu! | Don't laugh at her. | She's trying her best.", 'गोलू! | उस पर हँसो मत। | वो पूरी कोशिश कर रही है।'],
        ['golu', 'sad', "Sorry. | It was just a little bit funny.", 'सॉरी। | बस थोड़ा सा मज़ेदार था।'],
      ]);
      ep.act('bedroom', ['pari:firststeps', 'papa:idle', 'mumma:idle'], [
        ['papa', 'excited', 'Come to Papa, Pari! | One, two...', 'पापा के पास आओ, परी! | एक, दो...'],
        ['pari', 'surprised', 'Uh-oh!', 'ओह-ओह!'],
        ['mumma', 'calm', 'She fell again. | That\'s five times today.', 'फिर गिर गई। | आज पाँचवीं बार।'],
      ], { optional: 2 });
      ep.act('bedroom', ['pari:sad', 'golu:sitfloor'], [
        ['golu', 'thinking', 'Pari, why do you keep trying? | You fall every time.', 'परी, तुम बार-बार कोशिश क्यों करती हो? | तुम हर बार गिर जाती हो।'],
        ['pari', 'sad', 'Teddy...', 'टेडी...'],
        ['golu', 'thinking', "You really want that teddy, huh? | [0.6] Hmm. | That reminds me of something.", 'तुम्हें सच में वो टेडी चाहिए, है ना? | [0.6] हम्म। | इससे मुझे कुछ याद आया।', 0.5],
      ], { camera: 'closeup', minDuration: 5 });
      ep.act('playground', ['golu:bicycle', 'papa:idle'], [
        ['golu', 'scared', 'Papa, don\'t let go! | Don\'t let go!', 'पापा, छोड़ना मत! | छोड़ना मत!'],
        ['papa', 'calm', "I've got you. | Keep pedalling!", 'मैंने पकड़ा है। | पैडल चलाते रहो!'],
        ['golu', 'sad', '[0.5] Ouch! | I fell again! | I\'m never riding this bicycle again!', '[0.5] आउच! | मैं फिर गिर गया! | मैं ये साइकिल अब कभी नहीं चलाऊँगा!', 0.5],
      ], { card: ["Last year", "पिछले साल"], time: 'afternoon', transition: 'fade', minDuration: 5 });
      ep.act('playground', ['golu:sitfloor', 'papa:sitfloor'], [
        ['papa', 'calm', "Everybody falls when they learn, champ. | I fell off my bicycle twenty times. | Then one day... I didn't.", 'सीखते वक़्त सब गिरते हैं, चैंप। | मैं अपनी साइकिल से बीस बार गिरा था। | फिर एक दिन... नहीं गिरा।'],
        ['golu', 'thinking', 'Twenty times? | And nobody laughed at you?', 'बीस बार? | और किसी ने आप पर हँसा नहीं?'],
        ['papa', 'laugh', 'Your Chachu laughed every single time. | It didn\'t help.', 'तुम्हारे चाचू हर बार हँसते थे। | उससे कोई मदद नहीं मिली।'],
      ], { time: 'afternoon', minDuration: 5, optional: 1 });
      ep.act('bedroom', ['golu:sitfloor', 'pari:sitfloor', 'anaya:idle'], [
        ['golu', 'calm', "Didi, when I learned to ride my bicycle, I fell lots and lots of times. | And it felt bad when people laughed.", 'दीदी, जब मैं साइकिल सीख रहा था, तो बहुत, बहुत बार गिरा। | और जब लोग हँसते थे, तो बुरा लगता था।'],
        ['anaya', 'calm', "So now you know how Pari feels.", 'तो अब तुम्हें पता है परी को कैसा लग रहा है।'],
        ['golu', 'happy', "Yes. | And I know what helped me. | Papa didn't laugh. | He waited for me, with his arms open.", 'हाँ। | और मुझे पता है मेरी मदद किससे हुई। | पापा हँसे नहीं। | वो बाँहें फैलाकर मेरा इंतज़ार करते रहे।'],
      ], { card: ["Today", "आज"], time: 'afternoon', minDuration: 6 });
      ep.act('bedroom', ['golu:idle:teddy', 'pari:sitfloor', 'anaya:idle'], [
        ['golu', 'happy', 'Pari, I have an idea. | I\'ll hold your teddy. | Right here, not too far.', 'परी, मेरे पास एक आइडिया है। | मैं तुम्हारा टेडी पकड़ूँगा। | यहीं, ज़्यादा दूर नहीं।'],
        ['anaya', 'happy', 'And I\'ll hold her hands until she\'s ready.', 'और जब तक वो तैयार न हो, मैं उसके हाथ पकड़ूँगी।'],
        ['pari', 'excited', 'Teddy!', 'टेडी!'],
      ]);
      ep.act('bedroom', ['pari:firststeps', 'golu:idle:teddy', 'anaya:idle'], [
        ['golu', 'calm', 'Come on, Pari. | You can do it. | One step.', 'चलो, परी। | तुम कर सकती हो। | एक कदम।'],
        ['pari', 'surprised', 'Uh-oh!', 'ओह-ओह!', 0.6],
        ['golu', 'calm', "That's okay! | Falling is part of it. | Up again!", 'कोई बात नहीं! | गिरना भी सीखने का हिस्सा है। | फिर से उठो!'],
      ], { minDuration: 5 });
      ep.act('bedroom', ['pari:firststeps', 'golu:idle:teddy', 'anaya:idle', 'mumma:idle', 'papa:idle', 'dadi:idle'], [
        ['golu', 'excited', 'One step... | two steps... | three steps...', 'एक कदम... | दो कदम... | तीन कदम...'],
        ['anaya', 'excited', "She's letting go! | She's walking by herself!", 'इसने हाथ छोड़ दिया! | ये ख़ुद चल रही है!'],
        ['mumma', 'excited', 'Everybody, come quick!', 'सब लोग, जल्दी आओ!'],
      ], { minDuration: 6 });
      ep.act('bedroom', ['pari:cheer:teddy', 'golu:cheer', 'anaya:clap', 'mumma:clap', 'papa:clap', 'dadi:clap', 'dadaji:clap'], [
        ['golu', 'excited', 'She did it! | Pari walked to me!', 'इसने कर दिखाया! | परी चलकर मेरे पास आई!'],
        ['dadi', 'happy', 'Our little Pari is walking!', 'हमारी छोटी परी चलने लगी!'],
        ['pari', 'excited', 'Go-lu!', 'गो-लू!'],
      ], { camera: 'orbit', minDuration: 6 });
      ep.act('bedroom', ['pari:firststeps', 'golu:run', 'papa:idle'], [
        ['papa', 'laugh', "Uh-oh. | Now that she can walk, | she can reach *everything*.", 'उफ़्फ़। | अब ये चल सकती है, | तो *हर चीज़* तक पहुँच सकती है।'],
        ['golu', 'scared', 'Pari, not my drawings! | Pari! | Come back!', 'परी, मेरी ड्रॉइंग नहीं! | परी! | वापस आओ!'],
      ], { optional: 1 });
    },
  },

  // ======================= THE RAINY DAY FORT =======================
  {
    id: 'raindayfort', theme: 'home', moral: undefined, look: 'home',
    build(ep, { T }, { moral }) {
      ep.title = T('The Rainy Day Fort!', 'बारिश के दिन का क़िला!');
      ep.summary = T("It's raining, there's no cricket, and Golu says there is nothing to do. Then Papa remembers what he used to build when he was a boy.", 'बारिश हो रही है, क्रिकेट नहीं हो सकता, और गोलू कहता है कि करने को कुछ भी नहीं। तभी पापा को याद आता है कि वो बचपन में क्या बनाते थे।');
      ep.hook = T('Rain, rain, go away! | [0.4] I wanted to play cricket today.', 'बारिश, बारिश, जाओ ना! | [0.4] आज मुझे क्रिकेट खेलना था।');
      ep.music = 'calm';
      ep.callback = T("Rainy days are the best days. | You just need pillows... | and a Papa who knows how to build.", 'बारिश के दिन सबसे अच्छे दिन हैं। | बस तकिये चाहिए... | और एक पापा जिसे बनाना आता हो।');
      if (moral !== false) {
        ep.moral = T("You don't need a screen to have fun. | Just a little imagination.", 'मज़े के लिए स्क्रीन की ज़रूरत नहीं। | बस थोड़ी सी कल्पना चाहिए।');
        ep.lesson = T("We thought the rain ruined our day. | It gave us the best day instead.", 'हमें लगा बारिश ने हमारा दिन बिगाड़ दिया। | पर उसने तो सबसे अच्छा दिन दे दिया।');
      }

      ep.act('bedroom', ['golu:sad:bat', 'anaya:read'], [
        ['golu', 'sad', 'Rain, rain, rain. | Kabir and I were going to play cricket today.', 'बारिश, बारिश, बारिश। | आज कबीर और मैं क्रिकेट खेलने वाले थे।'],
        ['anaya', 'calm', 'Read a book with me.', 'मेरे साथ कोई किताब पढ़ लो।'],
        ['golu', 'angry', "Books are for school days. | This is a Sunday. | There's *nothing* to do!", 'किताबें स्कूल वाले दिन के लिए हैं। | आज संडे है। | करने को *कुछ भी* नहीं है!'],
      ], { time: 'morning', transition: 'fade' });
      ep.act('bedroom', ['golu:sitfloor', 'mumma:idle', 'papa:idle'], [
        ['golu', 'sad', 'Mumma, can I watch TV? | Just one hour?', 'मम्मा, क्या मैं टीवी देख लूँ? | बस एक घंटा?'],
        ['mumma', 'calm', "You watched two hours yesterday, beta. | Not today.", 'कल तुमने दो घंटे देखा था, बेटा। | आज नहीं।'],
        ['golu', 'sad', 'Then I am going to be bored. | All day. | Forever.', 'तो मैं बोर होता रहूँगा। | पूरा दिन। | हमेशा के लिए।'],
      ]);
      ep.act('bedroom', ['papa:idle', 'golu:sitfloor', 'anaya:idle'], [
        ['papa', 'thinking', 'Nothing to do? | Hmm. | When I was a boy, on rainy days... | we built *forts*.', 'करने को कुछ नहीं? | हम्म। | जब मैं छोटा था, बारिश के दिन... | हम *क़िले* बनाते थे।'],
        ['golu', 'surprised', 'Forts? | Inside the house?', 'क़िले? | घर के अंदर?'],
        ['papa', 'excited', 'With blankets, pillows and chairs. | The best fort in the whole street was mine.', 'चादरों, तकियों और कुर्सियों से। | पूरी गली का सबसे अच्छा क़िला मेरा था।'],
      ]);
      ep.act('bedroom', ['golu:idle:pillow', 'anaya:idle:pillow', 'papa:idle'], [
        ['papa', 'calm', 'Step one: | two chairs, far apart. | Those are the walls.', 'पहला स्टेप: | दो कुर्सियाँ, दूर-दूर। | ये दीवारें हैं।'],
        ['anaya', 'happy', "Step two: | a big blanket on top for the roof. | I'll ask Dadi for her big shawl.", 'दूसरा स्टेप: | छत के लिए ऊपर एक बड़ी चादर। | मैं दादी से उनकी बड़ी शॉल माँगती हूँ।'],
        ['golu', 'excited', 'And step three: | pillows on the floor! | Soft fort!', 'और तीसरा स्टेप: | फ़र्श पर तकिये! | मुलायम क़िला!'],
      ]);
      ep.act('bedroom', ['dadi:idle::walk-right', 'anaya:idle', 'golu:idle:pillow'], [
        ['anaya', 'happy', 'Dadi, can we borrow your big shawl? | For the roof of our fort.', 'दादी, क्या हम आपकी बड़ी शॉल ले लें? | अपने क़िले की छत के लिए।'],
        ['dadi', 'laugh', 'A fort? | Take it, take it. | But no muddy feet inside!', 'क़िला? | ले लो, ले लो। | पर अंदर कीचड़ वाले पैर नहीं!'],
      ], { optional: 2 });
      ep.act('bedroom', ['papa:idle', 'golu:jump', 'anaya:idle'], [
        ['papa', 'scared', 'Careful, the roof is sliding...', 'ध्यान से, छत खिसक रही है...'],
        ['golu', 'surprised', 'It fell down! | The whole roof!', 'गिर गई! | पूरी छत!'],
        ['anaya', 'thinking', "We need something heavy on the corners. | Books! | My big books will hold it.", 'कोनों पर कुछ भारी रखना होगा। | किताबें! | मेरी मोटी किताबें इसे पकड़ कर रखेंगी।', 0.5],
        ['golu', 'laugh', "See, Didi? | Books *are* for Sundays!", 'देखा दीदी? | किताबें संडे के लिए *भी* हैं!'],
      ], { minDuration: 5 });
      ep.act('bedroom', ['papa:cheer', 'golu:cheer', 'anaya:cheer'], [
        ['papa', 'excited', 'And... | it\'s standing!', 'और... | ये खड़ा हो गया!'],
        ['golu', 'excited', 'Our fort! | The Golu Fort!', 'हमारा क़िला! | गोलू क़िला!'],
        ['anaya', 'laugh', 'The *Sharma* Fort, Golu.', '*शर्मा* क़िला, गोलू।'],
      ], { set: [{ kind: 'blanketfort', x: 1.4, z: -0.6 }] });
      ep.act('bedroom', ['golu:sitfloor:torch', 'anaya:sitfloor', 'pari:sitfloor'], [
        ['golu', 'happy', "It's dark inside. | I need a torch. | [0.4] There! | Now it's a secret cave.", 'अंदर अँधेरा है। | टॉर्च चाहिए। | [0.4] ये लो! | अब ये एक गुप्त गुफ़ा है।'],
        ['anaya', 'calm', 'Listen. | You can hear the rain on the window. | Tap, tap, tap.', 'सुनो। | खिड़की पर बारिश की आवाज़ आ रही है। | टप, टप, टप।'],
        ['pari', 'happy', 'Tap!', 'टप!'],
      ], { minDuration: 5 });
      ep.act('bedroom', ['golu:sitfloor:torch', 'anaya:sitfloor', 'pari:sitfloor', 'papa:sitfloor'], [
        ['golu', 'excited', 'Papa, tell us a story. | A fort story!', 'पापा, कहानी सुनाओ। | क़िले वाली कहानी!'],
        ['papa', 'calm', "Once upon a time, | there were two brave guards in a blanket fort... | guarding it from a giant monster.", 'एक बार की बात है, | चादर के एक क़िले में दो बहादुर पहरेदार थे... | जो एक बड़े राक्षस से क़िले की रक्षा कर रहे थे।'],
        ['anaya', 'thinking', 'What monster?', 'कौन सा राक्षस?'],
        ['papa', 'laugh', 'The Tickle Monster! | And he is... | coming... | right now!', 'गुदगुदी राक्षस! | और वो... | आ रहा है... | अभी!'],
      ], { minDuration: 6 });
      ep.act('bedroom', ['golu:laugh', 'anaya:laugh', 'pari:laugh', 'papa:laugh'], [
        ['golu', 'laugh', 'Ha ha ha! | Stop! | Stop, Papa!', 'हा हा हा! | रुको! | रुको, पापा!'],
        ['anaya', 'laugh', 'Guards, defend the fort! | Pillow attack!', 'पहरेदारों, क़िले को बचाओ! | तकिया हमला!'],
        ['pari', 'laugh', 'Hehehe!', 'हीहीही!'],
      ], { minDuration: 5 });
      ep.act('bedroom', ['dadaji:idle::walk-right', 'golu:sitfloor:torch'], [
        ['dadaji', 'thinking', "What is all this noise? | [0.4] A fort? | Is there room for an old guard?", 'ये कैसा शोर है? | [0.4] क़िला? | क्या एक बूढ़े पहरेदार के लिए जगह है?'],
        ['golu', 'happy', 'Only if you tell us a ghost story, Dadaji. | A not-too-scary one.', 'तभी, अगर आप भूत की कहानी सुनाओ, दादाजी। | ज़्यादा डरावनी नहीं।'],
      ], { optional: 1 });
      ep.act('bedroom', ['mumma:idle', 'golu:sitfloor', 'anaya:sitfloor'], [
        ['mumma', 'happy', 'Good news! | The rain has stopped. | You can go and play cricket now.', 'अच्छी ख़बर! | बारिश रुक गई। | अब तुम क्रिकेट खेलने जा सकते हो।'],
        ['golu', 'thinking', "[0.5] Cricket? | Hmm... | can we play tomorrow? | We're still guarding the fort.", '[0.5] क्रिकेट? | हम्म... | कल खेल लें? | हम अभी क़िले की रक्षा कर रहे हैं।'],
        ['mumma', 'laugh', 'This morning there was *nothing* to do!', 'आज सुबह तो करने को *कुछ भी* नहीं था!'],
      ], { minDuration: 5 });
      ep.act('bedroom', ['golu:sleep', 'anaya:sleep', 'papa:idle', 'mumma:idle'], [
        ['papa', 'calm', 'Shh. | Both guards fell asleep on duty.', 'श्श। | दोनों पहरेदार ड्यूटी पर ही सो गए।'],
        ['mumma', 'laugh', "Leave the fort up tonight. | I think they'll want it tomorrow.", 'आज रात क़िला ऐसे ही रहने दो। | मुझे लगता है कल भी चाहिए होगा।'],
      ], { card: ["That night", "उस रात"], time: 'night', optional: 1, transition: 'fade' });
    },
  },

  // ======================= LOST IN THE MARKET =======================
  {
    id: 'lostmarket', theme: 'town', moral: true, look: 'home',
    build(ep, { T }) {
      ep.title = T('Lost in the Big Market!', 'बड़े बाज़ार में खो गया!');
      ep.summary = T("The market is full of colours, sounds and balloons. Golu follows the balloon man... and suddenly he can't see Dadi anywhere.", 'बाज़ार रंगों, आवाज़ों और गुब्बारों से भरा है। गोलू गुब्बारे वाले के पीछे चल पड़ता है... और अचानक उसे दादी कहीं नहीं दिखतीं।');
      ep.hook = T("We're going to the big market with Dadi! | It's *so* busy there.", 'हम दादी के साथ बड़े बाज़ार जा रहे हैं! | वहाँ *बहुत* भीड़ होती है।');
      ep.music = 'adventure';
      ep.callback = T("Green gate, yellow house, near the big park. | I'll never forget it now.", 'हरा गेट, पीला घर, बड़े पार्क के पास। | अब ये मैं कभी नहीं भूलूँगा।');
      ep.moral = T("In crowded places, stay close to your family. | And always remember your address.", 'भीड़ वाली जगहों पर परिवार के पास रहो। | और अपना पता हमेशा याद रखो।');
      ep.lesson = T("Golu got lost. | But he knew his address, and he asked the right person for help.", 'गोलू खो गया था। | पर उसे अपना पता याद था, और उसने सही इंसान से मदद माँगी।');

      ep.act('house', ['mumma:idle', 'golu:idle', 'dadi:idle:shoppingbag'], [
        ['mumma', 'calm', "Golu, before you go. | What's our address?", 'गोलू, जाने से पहले। | हमारा पता क्या है?'],
        ['golu', 'thinking', 'Umm... | the house with... | the door?', 'उम्म... | वो घर जिसमें... | दरवाज़ा है?'],
        ['mumma', 'laugh', "Every house has a door! | Say it with me: | Green gate, yellow house, near the big park.", 'हर घर में दरवाज़ा होता है! | मेरे साथ बोलो: | हरा गेट, पीला घर, बड़े पार्क के पास।'],
        ['golu', 'happy', 'Green gate, yellow house, near the big park. | Easy!', 'हरा गेट, पीला घर, बड़े पार्क के पास। | आसान!'],
      ], { time: 'morning', transition: 'fade' });
      ep.act('house', ['mumma:idle', 'golu:idle', 'anaya:idle'], [
        ['mumma', 'calm', "And if you ever get lost, | don't go with strangers. | Find a police uncle, or a shopkeeper, | and tell them your address.", 'और अगर कभी खो जाओ, | तो अनजान लोगों के साथ मत जाना। | किसी पुलिस अंकल या दुकानदार को ढूँढो, | और उन्हें अपना पता बताओ।'],
        ['golu', 'laugh', "I won't get lost, Mumma. | I'm seven!", 'मैं नहीं खोऊँगा, मम्मा। | मैं सात साल का हूँ!'],
      ], { optional: 2 });
      ep.act('market', ['dadi:cart', 'golu:idle::walk-left', 'anaya:idle::walk-left'], [
        ['dadi', 'happy', 'Vegetables, fruits, spices... | Children, hold my sari and stay close.', 'सब्ज़ियाँ, फल, मसाले... | बच्चों, मेरी साड़ी पकड़ो और पास रहो।'],
        ['golu', 'excited', "Whoa! | So many colours! | Red tomatoes, yellow bananas, green chillies!", 'वाह! | कितने सारे रंग! | लाल टमाटर, पीले केले, हरी मिर्च!'],
      ]);
      ep.act('market', ['lalaji:wave:banana', 'dadi:idle:shoppingbag', 'golu:idle', 'anaya:idle'], [
        ['lalaji', 'happy', 'Namaste, Dadi-ji! | The sweetest bananas, just for you!', 'नमस्ते दादी जी! | सबसे मीठे केले, बस आपके लिए!'],
        ['dadi', 'happy', 'Namaste, Lala-ji. | One dozen, please. | And not the soft ones like last time.', 'नमस्ते लाला जी। | एक दर्जन दीजिए। | और पिछली बार जैसे गले हुए नहीं।'],
        ['lalaji', 'laugh', 'Never, Dadi-ji! | Only the best for you.', 'कभी नहीं, दादी जी! | आपके लिए सिर्फ़ सबसे अच्छे।'],
      ]);
      ep.act('market', ['golu:lookaround', 'lalaji:idle'], [
        ['golu', 'excited', "Ooh! | A balloon man! | Red balloons, blue balloons... | a *dinosaur* balloon!", 'ओह! | गुब्बारे वाला! | लाल गुब्बारे, नीले गुब्बारे... | *डायनासोर* वाला गुब्बारा!'],
        ['golu', 'happy', "He's walking away. | I'll just go and look. | Only for one minute.", 'वो जा रहा है। | मैं बस देखकर आता हूँ। | बस एक मिनट।', 0.4],
      ], { props: [{ kind: 'balloonbunch', x: 2.4, z: -1.2 }] });
      ep.act('market', ['golu:walkaround'], [
        ['golu', 'happy', 'Balloon man, wait! | How much is the dinosaur one?', 'गुब्बारे वाले, रुको! | डायनासोर वाला कितने का है?'],
        ['golu', 'surprised', "[0.6] Where did he go? | There are so many people...", '[0.6] वो कहाँ गया? | कितने सारे लोग हैं...', 0.6],
      ], { minDuration: 5 });
      ep.act('market', ['golu:lookaround'], [
        ['golu', 'scared', 'Dadi? | Didi? | [0.5] Dadi!', 'दादी? | दीदी? | [0.5] दादी!'],
        ['golu', 'scared', "Every shop looks the same. | Which way did I come from? | I'm lost...", 'हर दुकान एक जैसी लग रही है। | मैं किस तरफ़ से आया था? | मैं खो गया...', 0.8],
      ], { camera: 'closeup', minDuration: 5 });
      ep.act('market', ['dadi:lookaround:shoppingbag', 'anaya:lookaround', 'lalaji:idle'], [
        ['dadi', 'scared', "Golu? | He was right here! | Golu!", 'गोलू? | वो अभी तो यहीं था! | गोलू!'],
        ['anaya', 'thinking', "Dadi, he was looking at the balloon man. | He must have followed him!", 'दादी, वो गुब्बारे वाले को देख रहा था। | ज़रूर उसके पीछे गया होगा!'],
        ['lalaji', 'calm', "Don't worry, Dadi-ji. | I'll call the police station right away.", 'चिंता मत कीजिए, दादी जी। | मैं अभी पुलिस स्टेशन फ़ोन करता हूँ।'],
      ]);
      ep.act('market', ['golu:cry'], [
        ['golu', 'sad', "I want to cry. | [0.6] No. | Wait. | What did Mumma say?", 'मुझे रोना आ रहा है। | [0.6] नहीं। | रुको। | मम्मा ने क्या कहा था?'],
        ['golu', 'thinking', "Don't go with strangers. | Find a police uncle. | [0.4] Tell him my address.", 'अनजान लोगों के साथ मत जाना। | पुलिस अंकल को ढूँढो। | [0.4] उन्हें अपना पता बताओ।', 0.8],
      ], { camera: 'closeup', minDuration: 6 });
      ep.act('market', ['inspector:idle', 'golu:idle::walk-left'], [
        ['golu', 'sad', 'Police uncle? | I lost my Dadi.', 'पुलिस अंकल? | मेरी दादी खो गईं।'],
        ['inspector', 'calm', "You did the right thing, coming to me. | What's your name, little champion?", 'तुमने बिल्कुल सही किया, जो मेरे पास आए। | तुम्हारा नाम क्या है, छोटे चैंपियन?'],
        ['golu', 'calm', 'Golu Sharma. | I am seven.', 'गोलू शर्मा। | मैं सात साल का हूँ।'],
      ]);
      ep.act('police', ['inspector:idle', 'golu:sitchair'], [
        ['inspector', 'calm', 'Golu, do you know where you live?', 'गोलू, तुम्हें पता है तुम कहाँ रहते हो?'],
        ['golu', 'happy', 'Yes, sir! | Green gate, yellow house, near the big park!', 'हाँ, सर! | हरा गेट, पीला घर, बड़े पार्क के पास!'],
        ['inspector', 'excited', "Very good! | That's all I need. | And Lala-ji just called. | Your Dadi is on her way here.", 'बहुत अच्छे! | बस इतना ही चाहिए था। | और अभी लाला जी का फ़ोन आया। | तुम्हारी दादी यहीं आ रही हैं।'],
      ], { transition: 'fade' });
      ep.act('police', ['inspector:idle', 'golu:sitchair'], [
        ['golu', 'thinking', 'Uncle, | do you get lots of lost children?', 'अंकल, | क्या आपके पास बहुत सारे खोए हुए बच्चे आते हैं?'],
        ['inspector', 'laugh', 'Every week. | But not many know their address as well as you.', 'हर हफ़्ते। | पर तुम्हारी तरह अपना पता बहुत कम बच्चों को याद होता है।'],
        ['golu', 'happy', 'My Mumma made me say it this morning.', 'मेरी मम्मा ने आज सुबह ही मुझसे बुलवाया था।'],
      ], { optional: 1 });
      ep.act('police', ['dadi:cry::run-right', 'anaya:idle::run-right', 'golu:idle', 'inspector:idle'], [
        ['dadi', 'sad', 'Golu! | My heart stopped! | Come here, come here!', 'गोलू! | मेरा तो दिल ही बैठ गया! | इधर आओ, इधर आओ!'],
        ['golu', 'sad', "Sorry, Dadi. | I followed the balloon man. | I didn't hold your sari.", 'सॉरी, दादी। | मैं गुब्बारे वाले के पीछे चला गया। | मैंने आपकी साड़ी नहीं पकड़ी।'],
        ['anaya', 'happy', "We were so scared, Golu. | But you were so smart!", 'हम बहुत डर गए थे, गोलू। | पर तुमने बहुत समझदारी दिखाई!'],
      ]);
      ep.act('police', ['inspector:salute', 'golu:salute', 'dadi:idle', 'anaya:idle'], [
        ['inspector', 'happy', "Golu didn't cry and run. | He found help, and he knew his address. | That's a very brave boy.", 'गोलू रोते हुए भागा नहीं। | उसने मदद ढूँढी, और उसे अपना पता याद था। | ये बहुत बहादुर बच्चा है।'],
        ['golu', 'excited', 'Thank you, sir!', 'थैंक यू, सर!'],
      ]);
      ep.act('house', ['dadi:idle:shoppingbag:walk-left', 'golu:idle:balloon:walk-left', 'anaya:idle::walk-left', 'mumma:idle'], [
        ['mumma', 'surprised', 'A balloon? | How was the market?', 'गुब्बारा? | बाज़ार कैसा रहा?'],
        ['golu', 'laugh', "It was... | an adventure. | Dadi will tell you. | I'm going to my room!", 'वो... | एक एडवेंचर था। | दादी बताएँगी। | मैं अपने कमरे में जा रहा हूँ!'],
        ['dadi', 'calm', "Sit down. | This is going to take a while.", 'बैठ जाओ। | ये लंबी कहानी है।'],
      ], { transition: 'fade' });
    },
  },

  // ======================= THE EXTRA COIN =======================
  {
    id: 'extracoin', theme: 'town', moral: true, look: 'home',
    build(ep, { T }) {
      ep.title = T('Golu and the Extra Coin!', 'गोलू और एक ज़्यादा सिक्का!');
      ep.summary = T("Mumma sends Golu to buy milk all by himself for the first time. Lala-ji gives him one coin too many. Nobody would ever know...", 'मम्मा पहली बार गोलू को अकेले दूध लेने भेजती हैं। लाला जी उसे एक सिक्का ज़्यादा दे देते हैं। किसी को कभी पता नहीं चलेगा...');
      ep.hook = T("Today I'm going to the shop... | all by *myself*!", 'आज मैं दुकान जा रहा हूँ... | बिल्कुल *अकेले*!');
      ep.music = 'calm';
      ep.callback = T("One coin is very small. | But being honest made me feel *very* big.", 'एक सिक्का बहुत छोटा होता है। | पर ईमानदारी से मैं ख़ुद को *बहुत* बड़ा महसूस कर रहा था।');
      ep.moral = T('Honesty is the best policy, | even with a small coin.', 'ईमानदारी सबसे अच्छी नीति है, | एक छोटे सिक्के के साथ भी।');
      ep.lesson = T("It was just one coin. | But honesty is never small.", 'बस एक सिक्का था। | पर ईमानदारी कभी छोटी नहीं होती।');

      ep.act('kitchen', ['mumma:idle:purse', 'golu:jump'], [
        ['mumma', 'calm', "Golu, can you go to Lala-ji's shop and buy one packet of milk? | All by yourself?", 'गोलू, क्या तुम लाला जी की दुकान से एक पैकेट दूध ले आओगे? | अकेले?'],
        ['golu', 'excited', 'By myself? | Like a grown-up? | Yes!', 'अकेले? | बड़ों की तरह? | हाँ!'],
        ['mumma', 'happy', "Here's fifty rupees. | The milk costs thirty. | So you bring back twenty. | Count it carefully.", 'ये लो पचास रुपये। | दूध तीस का है। | तो बीस वापस लाने हैं। | ध्यान से गिनना।'],
      ], { time: 'afternoon', transition: 'fade' });
      ep.act('street', ['golu:idle:purse:walk-left', 'kapoor:wave'], [
        ['kapoor', 'happy', 'Golu! | Going somewhere?', 'गोलू! | कहीं जा रहे हो?'],
        ['golu', 'excited', "To the shop, Mrs. Kapoor. | Alone! | I'm basically a grown-up now.", 'दुकान, कपूर आंटी। | अकेले! | मैं अब लगभग बड़ा हो गया हूँ।'],
        ['kapoor', 'laugh', 'Of course you are!', 'बिल्कुल हो गए हो!'],
      ], { optional: 2 });
      ep.act('market', ['lalaji:idle:milkpacket', 'golu:idle:purse', 'kabir:idle'], [
        ['golu', 'happy', 'Lala-ji, one packet of milk, please. | Here is fifty rupees.', 'लाला जी, एक पैकेट दूध दीजिए। | ये रहे पचास रुपये।'],
        ['lalaji', 'happy', 'One packet for the little sir! | And your change... | here you go.', 'छोटे साहब के लिए एक पैकेट! | और ये रहे तुम्हारे बाक़ी पैसे... | लो।'],
      ]);
      ep.act('market', ['golu:idle:coin', 'kabir:idle'], [
        ['golu', 'thinking', 'Ten, twenty... | and... | thirty?', 'दस, बीस... | और... | तीस?'],
        ['golu', 'surprised', "Lala-ji gave me thirty. | It should be twenty. | That's ten rupees extra!", 'लाला जी ने तीस दिए। | बीस होने चाहिए थे। | ये तो दस रुपये ज़्यादा हैं!', 0.5],
        ['kabir', 'excited', "Ten rupees? | That's two lollipops! | Golu, he didn't even notice.", 'दस रुपये? | ये तो दो लॉलीपॉप! | गोलू, उन्हें तो पता भी नहीं चला।'],
      ], { minDuration: 5 });
      ep.act('market', ['golu:think:coin', 'kabir:idle'], [
        ['kabir', 'happy', 'Mumma said bring back twenty. | You bring back twenty. | The other ten is a lollipop for you and one for me!', 'मम्मा ने बीस लाने को कहा। | तुम बीस ले जाओ। | बाक़ी दस में एक लॉलीपॉप तुम्हारी और एक मेरी!'],
        ['golu', 'thinking', "Hmm... | nobody would know...", 'हम्म... | किसी को पता नहीं चलेगा...', 0.6],
      ]);
      ep.act('market', ['golu:think:coin'], [
        ['golu', 'thinking', 'Mumma wouldn\'t know. | Lala-ji wouldn\'t know.', 'मम्मा को पता नहीं चलेगा। | लाला जी को पता नहीं चलेगा।'],
        ['golu', 'sad', "[0.7] But *I* would know. | Every time I eat that lollipop... | I'll know.", '[0.7] पर *मुझे* तो पता होगा। | जब भी वो लॉलीपॉप खाऊँगा... | मुझे पता होगा।', 0.6],
      ], { camera: 'closeup', minDuration: 6 });
      ep.act('market', ['golu:think:coin', 'kabir:idle'], [
        ['golu', 'thinking', "Kabir, | Lala-ji works all day in this hot shop. | If ten rupees go missing from his box every day... | that's a lot.", 'कबीर, | लाला जी इस गरम दुकान में पूरा दिन काम करते हैं। | अगर रोज़ उनके डिब्बे से दस रुपये कम हों... | तो बहुत सारे हो जाएँगे।'],
        ['kabir', 'sad', "[0.5] Yeah. | I didn't think about that.", '[0.5] हाँ। | मैंने ऐसे नहीं सोचा था।'],
      ], { optional: 1 });
      ep.act('market', ['golu:idle:coin', 'lalaji:idle', 'kabir:idle'], [
        ['golu', 'calm', "Lala-ji, | you gave me ten rupees too many. | Here, this is yours.", 'लाला जी, | आपने मुझे दस रुपये ज़्यादा दे दिए। | ये लीजिए, ये आपके हैं।'],
        ['lalaji', 'surprised', '[0.5] Arre! | You counted it? | And you came back to give it?', '[0.5] अरे! | तुमने गिने? | और वापस देने आए?', 0.4],
        ['golu', 'happy', 'Mumma said count it carefully.', 'मम्मा ने कहा था ध्यान से गिनना।'],
      ]);
      ep.act('market', ['lalaji:idle:banana', 'golu:idle', 'kabir:idle'], [
        ['lalaji', 'happy', "Today the whole market was so busy, | I made many mistakes. | But nobody came back. | Only you.", 'आज पूरे बाज़ार में इतनी भीड़ थी, | मुझसे कई ग़लतियाँ हुईं। | पर कोई वापस नहीं आया। | सिर्फ़ तुम।'],
        ['lalaji', 'happy', "For such an honest boy, | one banana, free. | And one for your honest friend too.", 'इतने ईमानदार बच्चे के लिए, | एक केला, मुफ़्त। | और एक तुम्हारे दोस्त के लिए भी।', 0.4],
        ['kabir', 'surprised', "For me too? | I wasn't even the honest one!", 'मेरे लिए भी? | ईमानदार तो मैं था भी नहीं!'],
      ]);
      ep.act('street', ['golu:eat:banana', 'kabir:eat:banana'], [
        ['kabir', 'laugh', 'Golu, this banana tastes better than a lollipop.', 'गोलू, ये केला तो लॉलीपॉप से भी अच्छा लग रहा है।'],
        ['golu', 'happy', "That's because nobody has to feel bad eating it.", 'क्योंकि इसे खाकर किसी को बुरा नहीं लगेगा।'],
      ], { optional: 2 });
      ep.act('kitchen', ['mumma:idle', 'golu:idle:milkpacket:walk-left', 'dadi:idle'], [
        ['golu', 'happy', "Mumma, here's the milk. | And twenty rupees. | I counted it three times.", 'मम्मा, ये रहा दूध। | और बीस रुपये। | मैंने तीन बार गिने।'],
        ['mumma', 'happy', 'Very good! | My grown-up boy.', 'बहुत बढ़िया! | मेरा बड़ा बेटा।'],
        ['golu', 'thinking', "Mumma... | Lala-ji gave me ten extra. | I gave it back.", 'मम्मा... | लाला जी ने दस ज़्यादा दिए थे। | मैंने वापस कर दिए।'],
      ]);
      ep.act('kitchen', ['mumma:idle', 'golu:idle', 'dadi:idle:laddooplate'], [
        ['mumma', 'happy', "You gave it back? | Even though nobody would have known?", 'वापस कर दिए? | जबकि किसी को पता भी नहीं चलता?'],
        ['golu', 'calm', 'I would have known.', 'मुझे तो पता होता।'],
        ['dadi', 'happy', "Arre wah! | For that, my honest Golu gets a laddoo. | A *big* one.", 'अरे वाह! | इसके लिए मेरे ईमानदार गोलू को एक लड्डू। | *बड़ा* वाला।'],
      ]);
    },
  },

  // ======================= TOO MANY LADDOOS =======================
  {
    id: 'laddoos', theme: 'health', moral: true, look: 'home',
    build(ep, { T }) {
      ep.title = T('Too Many Laddoos!', 'बहुत सारे लड्डू!');
      ep.summary = T("Dadi makes a whole plate of laddoos for the Diwali puja tomorrow. Nobody is allowed to touch them. Golu eats just one. Then two. Then...", 'दादी कल की दिवाली पूजा के लिए लड्डुओं की पूरी थाली बनाती हैं। कोई हाथ नहीं लगाएगा। गोलू बस एक खाता है। फिर दो। फिर...');
      ep.hook = T('Dadi made *laddoos*! | Mmmm!', 'दादी ने *लड्डू* बनाए! | म्म्म!');
      ep.music = 'silly';
      ep.callback = T("One laddoo is a treat. | Ten laddoos is a doctor.", 'एक लड्डू मतलब मज़ा। | दस लड्डू मतलब डॉक्टर।');
      ep.moral = T('Sweets are yummy, | but too much is never good. | Eat healthy, and brush your teeth!', 'मिठाई स्वादिष्ट है, | पर ज़्यादा कभी अच्छी नहीं। | पौष्टिक खाओ, और दाँत साफ़ करो!');
      ep.lesson = T("One sweet is a treat. | A whole plate is a tummy ache.", 'एक मिठाई इनाम है। | पूरी थाली पेट दर्द है।');

      ep.act('kitchen', ['dadi:idle:laddooplate', 'golu:idle::run-right', 'anaya:idle'], [
        ['dadi', 'happy', "These laddoos are for the Diwali puja tomorrow. | Nobody touches them until then.", 'ये लड्डू कल की दिवाली पूजा के लिए हैं। | तब तक कोई हाथ नहीं लगाएगा।'],
        ['golu', 'happy', "Of course, Dadi! | I won't even look at them.", 'बिल्कुल, दादी! | मैं इनकी तरफ़ देखूँगा भी नहीं।'],
        ['anaya', 'thinking', "He's already looking at them, Dadi.", 'वो अभी से देख रहा है, दादी।'],
      ], { time: 'afternoon', transition: 'fade' });
      ep.act('kitchen', ['golu:lookaround'], [
        ['golu', 'thinking', 'Dadi is sleeping. | The kitchen is empty. | Just *one*. | Nobody counts laddoos.', 'दादी सो रही हैं। | रसोई ख़ाली है। | बस *एक*। | लड्डू कोई नहीं गिनता।'],
      ], { card: ["That night", "उस रात"], time: 'night', camera: 'closeup', minDuration: 4, props: [{ kind: 'laddooplate', x: 0.8, z: 0.4 }] });
      ep.act('kitchen', ['golu:eat:laddoo'], [
        ['golu', 'happy', 'Mmm! | Soft and sweet. | Okay, one more. | For the other side of my mouth.', 'म्म्म! | मुलायम और मीठा। | अच्छा, एक और। | मुँह की दूसरी तरफ़ के लिए।'],
        ['golu', 'thinking', "Three... | four... | five... | [0.5] the plate looks a bit empty now. | I'll push them to the middle.", 'तीन... | चार... | पाँच... | [0.5] थाली थोड़ी ख़ाली लग रही है। | बीच में खिसका देता हूँ।', 0.5],
      ], { minDuration: 6 });
      ep.act('kitchen', ['golu:eat:laddoo', 'pari:sitfloor'], [
        ['golu', 'thinking', '...nine... | ten. | [0.6] Did I really eat ten?', '...नौ... | दस। | [0.6] क्या मैंने सच में दस खा लिए?'],
        ['pari', 'surprised', 'Uh-oh!', 'ओह-ओह!'],
      ], { optional: 2 });
      ep.act('bedroom', ['golu:sick', 'anaya:idle'], [
        ['golu', 'sad', 'Didi... | my tummy is making noises. | Grrr... | and it hurts.', 'दीदी... | मेरे पेट से आवाज़ें आ रही हैं। | गुड़-गुड़... | और दर्द हो रहा है।'],
        ['anaya', 'thinking', "Golu, | there's sugar on your shirt. | [0.4] Did you eat the puja laddoos?", 'गोलू, | तुम्हारी शर्ट पर चीनी लगी है। | [0.4] तुमने पूजा के लड्डू खाए?'],
        ['golu', 'sad', "[0.5] Only ten.", '[0.5] बस दस।', 0.4],
      ]);
      ep.act('bedroom', ['golu:sick', 'mumma:idle::walk-left', 'anaya:idle'], [
        ['mumma', 'surprised', "Ten laddoos? | Golu! | No wonder your tummy hurts.", 'दस लड्डू? | गोलू! | तभी तो पेट दुख रहा है।'],
        ['golu', 'sad', "I'm sorry, Mumma. | I only wanted one. | But then my hand kept going back.", 'सॉरी, मम्मा। | मैं बस एक खाना चाहता था। | पर मेरा हाथ बार-बार वापस चला जाता था।'],
        ['mumma', 'calm', "Let's go see Dr. Anand. | Just to be safe.", 'चलो डॉक्टर आनंद को दिखा आते हैं। | बस एहतियात के लिए।'],
      ]);
      ep.act('hospital', ['doctor:idle', 'golu:sitchair', 'mumma:idle'], [
        ['doctor', 'happy', 'Hello, Golu! | Open your mouth and say aaah.', 'हैलो, गोलू! | मुँह खोलो और बोलो आआ।'],
        ['golu', 'sad', 'Aaah...', 'आआ...'],
        ['doctor', 'laugh', 'Hmm. | I can see... | laddoo. | Lots of laddoo.', 'हम्म। | मुझे दिख रहा है... | लड्डू। | ढेर सारे लड्डू।'],
      ], { card: ["Next morning", "अगली सुबह"], time: 'morning', transition: 'fade' });
      ep.act('hospital', ['doctor:idle', 'golu:sitchair', 'mumma:idle'], [
        ['doctor', 'calm', "Too much sugar at once is hard work for your tummy. | And it stays on your teeth, | and makes little holes in them.", 'एक साथ बहुत ज़्यादा चीनी पेट के लिए बहुत मुश्किल है। | और ये दाँतों पर चिपक जाती है, | और उनमें छोटे-छोटे छेद कर देती है।'],
        ['doctor', 'calm', "So: | warm water, rest, | no sweets for three days, | and brush your teeth tonight. | Properly.", 'तो: | गुनगुना पानी, आराम, | तीन दिन कोई मिठाई नहीं, | और आज रात दाँत ब्रश करना। | अच्छे से।', 0.4],
        ['golu', 'surprised', 'No sweets for *three days*? | But tomorrow is Diwali!', 'तीन दिन कोई *मिठाई नहीं*? | पर कल तो दिवाली है!'],
      ]);
      ep.act('bedroom', ['golu:brush', 'anaya:idle'], [
        ['anaya', 'happy', 'Up and down, | round and round, | the back teeth too. | Two whole minutes.', 'ऊपर-नीचे, | गोल-गोल, | पीछे वाले दाँत भी। | पूरे दो मिनट।'],
        ['golu', 'thinking', 'Did I get all the laddoo out?', 'क्या सारा लड्डू निकल गया?'],
        ['anaya', 'laugh', 'Keep going. | There were ten.', 'करते रहो। | दस थे।'],
      ], { time: 'night', minDuration: 5 });
      ep.act('kitchen', ['dadi:sad:laddooplate', 'golu:sad', 'anaya:idle'], [
        ['dadi', 'sad', 'My puja plate... | half empty. | Hai Ram, what will I offer tomorrow?', 'मेरी पूजा की थाली... | आधी ख़ाली। | हाय राम, कल क्या चढ़ाऊँगी?'],
        ['golu', 'sad', "Dadi, it was me. | I ate them. | I'm really sorry. | I spoiled your puja.", 'दादी, मैंने खाए। | सारे मैंने ही खाए। | बहुत सॉरी। | मैंने आपकी पूजा बिगाड़ दी।'],
        ['dadi', 'calm', '[0.5] Thank you for telling me the truth, beta.', '[0.5] सच बताने के लिए शुक्रिया, बेटा।', 0.5],
      ], { card: ["Diwali morning", "दिवाली की सुबह"], time: 'morning', minDuration: 5 });
      ep.act('kitchen', ['dadi:idle:flourbowl', 'golu:idle', 'anaya:idle', 'pari:sitfloor'], [
        ['dadi', 'happy', "Now come. | We'll make new laddoos together. | You roll them. | And you count them.", 'अब आओ। | हम साथ में नए लड्डू बनाएँगे। | तुम उन्हें गोल करोगे। | और तुम उन्हें गिनोगे।'],
        ['golu', 'happy', 'One... | two... | three... | [0.5] I\'m not eating any. | I\'m just counting.', 'एक... | दो... | तीन... | [0.5] मैं एक भी नहीं खा रहा। | बस गिन रहा हूँ।'],
        ['anaya', 'laugh', 'The doctor said three days, Golu!', 'डॉक्टर ने तीन दिन बोला है, गोलू!'],
      ], { minDuration: 6 });
      ep.act('bedroom', ['golu:idle:diya', 'dadi:idle:pujathali', 'dadaji:namaste', 'mumma:idle', 'papa:idle', 'pari:sitfloor'], [
        ['dadi', 'calm', 'The puja plate is full again. | Thanks to our little helper.', 'पूजा की थाली फिर से भर गई। | हमारे छोटे हेल्पर की वजह से।'],
        ['golu', 'happy', "Happy Diwali, everyone! | [0.4] And I didn't eat even one.", 'सबको हैप्पी दिवाली! | [0.4] और मैंने एक भी नहीं खाया।'],
      ], { card: ["Diwali evening", "दिवाली की शाम"], time: 'evening', transition: 'fade' });
      ep.act('kitchen', ['dadi:idle:laddooplate', 'golu:idle:laddoo', 'anaya:idle', 'pari:sitfloor'], [
        ['dadi', 'happy', 'Three days are over. | One laddoo for Golu. | *One*.', 'तीन दिन पूरे। | गोलू के लिए एक लड्डू। | *एक*।'],
        ['golu', 'happy', "Just one. | And I'm going to eat it *very* slowly.", 'बस एक। | और मैं इसे *बहुत* धीरे-धीरे खाऊँगा।'],
        ['pari', 'excited', 'Pari one!', 'परी एक!'],
      ], { card: ["Three days later", "तीन दिन बाद"], time: 'afternoon', optional: 1 });
    },
  },

  // ======================= DADI'S SURPRISE BIRTHDAY =======================
  {
    id: 'dadibirthday', theme: 'celebrate', moral: undefined, look: 'party',
    build(ep, { T }, { moral }) {
      ep.title = T("Dadi's Secret Birthday Surprise!", 'दादी का सीक्रेट बर्थडे सरप्राइज़!');
      ep.summary = T("The family is planning a secret birthday party for Dadi. There's just one problem: Golu is very, very bad at keeping secrets.", 'परिवार दादी के लिए एक सीक्रेट बर्थडे पार्टी प्लान कर रहा है। बस एक दिक़्क़त है: गोलू को राज़ रखना बिल्कुल नहीं आता।');
      ep.hook = T("Shh! | Can you keep a *secret*? | [0.4] Because I can't.", 'श्श! | क्या आप एक *राज़* रख सकते हो? | [0.4] क्योंकि मैं नहीं रख सकता।');
      ep.music = 'happy';
      ep.callback = T("I kept the secret! | [0.4] Mostly. | Okay, a little bit.", 'मैंने राज़ रखा! | [0.4] ज़्यादातर। | अच्छा, थोड़ा सा।');
      if (moral !== false) {
        ep.moral = T('The best gift is love, | and time spent with family.', 'सबसे अच्छा तोहफ़ा है प्यार, | और परिवार के साथ बिताया समय।');
        ep.lesson = T("Dadi didn't need a big party. | She was happy just because we were all together.", 'दादी को बड़ी पार्टी नहीं चाहिए थी। | वो बस इसलिए ख़ुश थीं क्योंकि हम सब साथ थे।');
      }

      ep.act('bedroom', ['anaya:idle:paper', 'golu:jump', 'papa:idle', 'mumma:idle', 'pari:idle'], [
        ['anaya', 'calm', "Shh! | Tomorrow is Dadi's seventieth birthday. | Let's plan a *secret* surprise party.", 'श्श! | कल दादी का सत्तरवाँ जन्मदिन है। | चलो एक *सीक्रेट* सरप्राइज़ पार्टी करते हैं।'],
        ['golu', 'excited', 'A surprise party! | Yes! | I love surprises!', 'सरप्राइज़ पार्टी! | हाँ! | मुझे सरप्राइज़ बहुत पसंद हैं!'],
        ['mumma', 'calm', "Golu, a surprise only works if Dadi doesn't find out. | Can you keep it a secret?", 'गोलू, सरप्राइज़ तभी काम करता है जब दादी को पता न चले। | क्या तुम ये राज़ रख सकते हो?'],
        ['golu', 'happy', 'My lips are zipped. | Mmm-mmm!', 'मेरे होंठ बंद। | म्म-म्म!'],
      ], { time: 'night', transition: 'fade' });
      ep.act('bedroom', ['anaya:idle:paper', 'papa:idle', 'mumma:idle', 'golu:idle'], [
        ['anaya', 'thinking', 'Here is the plan. | Mumma bakes the cake. | Papa gets balloons. | I make a card.', 'प्लान ये है। | मम्मा केक बनाएँगी। | पापा गुब्बारे लाएँगे। | मैं कार्ड बनाऊँगी।'],
        ['golu', 'excited', 'And me? | What\'s my job?', 'और मैं? | मेरा काम क्या है?'],
        ['papa', 'laugh', "Your job is the most important one, Golu. | Keep Dadi busy... | and don't say a word.", 'तुम्हारा काम सबसे ज़रूरी है, गोलू। | दादी को व्यस्त रखो... | और एक शब्द मत बोलना।'],
      ]);
      ep.act('kitchen', ['dadi:idle', 'golu:idle::walk-left'], [
        ['dadi', 'thinking', 'Golu, why is everybody whispering today?', 'गोलू, आज सब फुसफुसा क्यों रहे हैं?'],
        ['golu', 'scared', "Whispering? | Nobody is whispering. | We are *not* planning a party. | [0.5] Oops.", 'फुसफुसा? | कोई नहीं फुसफुसा रहा। | हम कोई *पार्टी* प्लान नहीं कर रहे। | [0.5] उफ़्फ़।', 0.4],
        ['dadi', 'thinking', 'A party?', 'पार्टी?'],
        ['golu', 'scared', "No! | A... | a *potty*. | Pari needs a new potty. | Bye!", 'नहीं! | एक... | एक *पॉटी*। | परी को नई पॉटी चाहिए। | बाय!'],
      ], { card: ["Dadi's birthday", "दादी का जन्मदिन"], time: 'morning' });
      ep.act('bedroom', ['golu:sad', 'anaya:idle'], [
        ['anaya', 'surprised', "Golu! | You almost told her!", 'गोलू! | तुमने तो लगभग बता ही दिया!'],
        ['golu', 'sad', "It just jumps out of my mouth, Didi! | Secrets are so heavy.", 'ये अपने आप मुँह से निकल जाता है, दीदी! | राज़ बहुत भारी होते हैं।'],
        ['anaya', 'thinking', 'New rule. | If Dadi asks anything, you just say... | I love you, Dadi. | Nothing else.', 'नया नियम। | अगर दादी कुछ भी पूछें, तो तुम बस बोलना... | आई लव यू, दादी। | और कुछ नहीं।'],
      ], { minDuration: 5 });
      ep.act('kitchen', ['dadi:idle:rotiplate', 'golu:idle'], [
        ['dadi', 'happy', 'Golu, do you want a paratha?', 'गोलू, पराठा खाओगे?'],
        ['golu', 'happy', 'I love you, Dadi.', 'आई लव यू, दादी।'],
        ['dadi', 'thinking', '[0.5] Okay... | do you know where Papa went?', '[0.5] अच्छा... | तुम्हें पता है पापा कहाँ गए?'],
        ['golu', 'happy', 'I love you, Dadi.', 'आई लव यू, दादी।'],
        ['dadi', 'laugh', 'Hai Ram. | What has happened to this boy?', 'हाय राम। | इस लड़के को क्या हो गया है?'],
      ], { minDuration: 5 });
      ep.act('market', ['papa:idle:balloon', 'lalaji:idle'], [
        ['papa', 'happy', 'Lala-ji, seventy balloons, please. | It\'s my mother\'s seventieth birthday.', 'लाला जी, सत्तर गुब्बारे दीजिए। | मेरी माँ का सत्तरवाँ जन्मदिन है।'],
        ['lalaji', 'laugh', "Seventy? | You'll fly away!", 'सत्तर? | आप तो उड़ जाओगे!'],
        ['papa', 'laugh', 'Okay... | twenty.', 'अच्छा... | बीस।'],
      ], { optional: 2 });
      ep.act('kitchen', ['mumma:cook', 'anaya:idle:paper', 'golu:idle'], [
        ['mumma', 'calm', "The cake is in the oven. | Golu, take Dadi for a walk. | For one hour.", 'केक ओवन में है। | गोलू, दादी को सैर पर ले जाओ। | एक घंटे के लिए।'],
        ['golu', 'happy', "One hour. | No talking. | I can do it.", 'एक घंटा। | कोई बात नहीं। | मैं कर सकता हूँ।'],
      ], { time: 'afternoon' });
      ep.act('street', ['dadi:walkaround', 'golu:walkaround'], [
        ['dadi', 'happy', "What a lovely evening. | It's nice to walk with my Golu.", 'कितनी प्यारी शाम है। | अपने गोलू के साथ घूमना अच्छा लगता है।'],
        ['golu', 'happy', 'Dadi, | what\'s your favourite cake? | [0.5] I\'m just asking. | For no reason.', 'दादी, | आपका फ़ेवरेट केक कौन सा है? | [0.5] बस ऐसे ही पूछ रहा हूँ। | बिना किसी वजह के।'],
        ['dadi', 'laugh', 'Pineapple. | For no reason.', 'पाइनएप्पल। | बिना किसी वजह के।'],
      ], { time: 'evening', minDuration: 5 });
      ep.act('street', ['dadi:idle', 'golu:idle', 'kapoor:wave'], [
        ['kapoor', 'excited', "Dadi-ji! | See you at the party tonight!", 'दादी जी! | आज रात पार्टी में मिलते हैं!'],
        ['golu', 'scared', 'Mrs. Kapoor means... | the party... | at *her* house. | It\'s her cat\'s birthday!', 'कपूर आंटी का मतलब है... | पार्टी... | *उनके* घर पर। | उनकी बिल्ली का जन्मदिन है!'],
        ['dadi', 'laugh', 'Of course it is.', 'बिल्कुल, बिल्कुल।'],
      ], { optional: 1 });
      ep.act('birthday', ['anaya:idle:gift', 'papa:idle', 'mumma:idle:cake', 'dadaji:idle', 'pari:idle'], [
        ['mumma', 'calm', "Balloons, done. | Cake, done. | Card, done.", 'गुब्बारे, हो गए। | केक, हो गया। | कार्ड, हो गया।'],
        ['anaya', 'excited', "They're coming! | Everybody hide! | Lights off!", 'वो आ रहे हैं! | सब छुप जाओ! | लाइट बंद!'],
      ], { time: 'night', transition: 'fade', set: [{ kind: 'balloonbunch', x: -2.2, z: -1.0 }] });
      ep.act('birthday', ['dadi:idle::walk-left', 'golu:idle::walk-left', 'anaya:jump', 'papa:jump', 'mumma:idle:cake', 'dadaji:idle', 'pari:clap', 'kapoor:clap'], [
        ['anaya', 'excited', 'Surprise! | Happy birthday, Dadi!', 'सरप्राइज़! | जन्मदिन मुबारक हो, दादी!'],
        ['dadi', 'surprised', 'Hai Ram! | All this... | for me?', 'हाय राम! | ये सब... | मेरे लिए?'],
        ['golu', 'excited', "It's a pineapple cake! | [0.4] For no reason!", 'ये पाइनएप्पल केक है! | [0.4] बिना किसी वजह के!'],
      ], { camera: 'orbit', minDuration: 6 });
      ep.act('birthday', ['dadi:idle', 'golu:idle', 'anaya:idle'], [
        ['golu', 'sad', "Dadi, | did I ruin the surprise? | I said party. | And Mrs. Kapoor said party.", 'दादी, | क्या मैंने सरप्राइज़ ख़राब कर दिया? | मैंने पार्टी बोल दिया था। | और कपूर आंटी ने भी।'],
        ['dadi', 'laugh', "Beta, I knew since this morning. | [0.4] But I've never been happier to be surprised.", 'बेटा, मुझे तो सुबह से पता था। | [0.4] पर सरप्राइज़ होकर इतनी ख़ुशी कभी नहीं हुई।'],
        ['anaya', 'laugh', 'Since this morning?', 'सुबह से?'],
      ]);
      ep.act('birthday', ['dadi:idle:cake', 'dadaji:idle', 'golu:idle', 'anaya:idle', 'papa:idle', 'mumma:idle', 'pari:clap'], [
        ['dadaji', 'calm', "Seventy years. | And she still makes the best laddoos in the world.", 'सत्तर साल। | और आज भी दुनिया के सबसे अच्छे लड्डू यही बनाती हैं।'],
        ['dadi', 'happy', "I don't need gifts. | Look around me. | My whole family, in one room, all laughing. | That's my gift.", 'मुझे तोहफ़े नहीं चाहिए। | मेरे चारों तरफ़ देखो। | मेरा पूरा परिवार, एक कमरे में, सब हँसते हुए। | यही मेरा तोहफ़ा है।', 0.4],
      ], { minDuration: 6 });
      ep.act('birthday', ['golu:dance', 'anaya:twirl', 'papa:dance', 'dadi:clap', 'dadaji:bhangra', 'pari:clap'], [
        ['papa', 'excited', 'And now, | the birthday dance!', 'और अब, | बर्थडे डांस!'],
        ['dadi', 'laugh', 'Careful with your knees, old man!', 'घुटनों का ध्यान रखो, बुड्ढे!'],
        ['dadaji', 'laugh', "Seventy is young, my dear!", 'सत्तर तो जवानी है, जी!'],
      ], { camera: 'orbit', minDuration: 6, optional: 1 });
    },
  },

  // ======================= CHACHU'S WEDDING =======================
  {
    id: 'wedding', theme: 'celebrate', moral: undefined, look: 'wedding',
    build(ep, { T }, { moral }) {
      ep.title = T('The Missing Varmala!', 'ग़ायब वरमाला का रहस्य!');
      ep.summary = T("Chachu is getting married, and Golu has one very important job: keep the varmala safe until the ceremony. What could possibly go wrong?", 'चाचू की शादी है, और गोलू को एक बहुत ज़रूरी काम मिला है: रस्म तक वरमाला सँभालकर रखना। भला क्या गड़बड़ हो सकती है?');
      ep.hook = T("Today is Chachu's *wedding*! | And I have the most important job.", 'आज चाचू की *शादी* है! | और मेरे पास सबसे ज़रूरी काम है।');
      ep.music = 'happy';
      ep.callback = T("Next wedding, I'm holding the varmala with *both* hands. | And Bruno stays home.", 'अगली शादी में, मैं वरमाला *दोनों* हाथों से पकड़ूँगा। | और ब्रूनो घर पर रहेगा।');
      if (moral !== false) {
        ep.moral = T("When someone trusts you with a job, take good care of it. | And if something goes wrong, tell the truth.", 'जब कोई भरोसा करके काम दे, तो उसे अच्छे से निभाओ। | और अगर कुछ गड़बड़ हो जाए, तो सच बताओ।');
        ep.lesson = T("Golu almost lost the varmala. | But he told the truth, and we found it together.", 'गोलू से वरमाला लगभग खो गई थी। | पर उसने सच बताया, और हमने मिलकर ढूँढ ली।');
      }

      ep.act('house', ['papa:idle', 'chachu:idle', 'dadi:idle', 'golu:bhangra', 'anaya:idle', 'pari:idle'], [
        ['papa', 'excited', 'Big news, everyone! | Chachu is getting married on Sunday!', 'बड़ी ख़बर, सब लोग! | संडे को चाचू की शादी है!'],
        ['dadi', 'surprised', 'Sunday? | So much to do! | Sweets, flowers, clothes!', 'संडे? | कितना काम है! | मिठाई, फूल, कपड़े!', 0.3],
        ['golu', 'excited', "I'm going to be the best dancer at the wedding!", 'मैं शादी में सबसे अच्छा नाचूँगा!'],
        ['chachu', 'laugh', "Golu, | I have an even *bigger* job for you.", 'गोलू, | तुम्हारे लिए एक और भी *बड़ा* काम है।'],
      ], { time: 'afternoon', transition: 'fade' });
      ep.act('house', ['chachu:idle:varmala', 'golu:idle'], [
        ['chachu', 'calm', "This is the varmala. | The flower garland. | At the wedding, I put it on the bride, and she puts one on me.", 'ये वरमाला है। | फूलों की माला। | शादी में मैं इसे दुल्हन को पहनाऊँगा, और वो मुझे।'],
        ['chachu', 'happy', "Your job is to keep it safe until then. | Can you do that?", 'तुम्हारा काम है तब तक इसे सँभालकर रखना। | कर पाओगे?', 0.4],
        ['golu', 'excited', 'Yes, Chachu! | Golu is on duty. | Nothing will happen to it!', 'हाँ, चाचू! | गोलू ड्यूटी पर है। | इसे कुछ नहीं होगा!'],
      ]);
      ep.act('house', ['golu:idle:varmala', 'anaya:idle', 'bruno:idle'], [
        ['anaya', 'thinking', "Golu, maybe give it to Mumma. | It's a big job.", 'गोलू, शायद इसे मम्मा को दे दो। | ये बड़ा काम है।'],
        ['golu', 'angry', "No! | Chachu gave it to *me*. | I'm big enough.", 'नहीं! | चाचू ने *मुझे* दी है। | मैं काफ़ी बड़ा हूँ।'],
        ['bruno', 'excited', 'Woof!', 'भौं!'],
        ['golu', 'calm', "And no, Bruno. | This is not a toy.", 'और नहीं, ब्रूनो। | ये खिलौना नहीं है।'],
      ], { optional: 2 });
      ep.act('street', ['papa:idle:dhol', 'golu:idle:varmala', 'chachu:wave', 'kabir:bhangra', 'anaya:dance', 'mumma:clap'], [
        ['papa', 'excited', 'The dhol is here! | The baraat is starting!', 'ढोल आ गया! | बारात शुरू हो रही है!'],
        ['kabir', 'excited', 'Golu, come and dance! | Balle balle!', 'गोलू, आओ नाचो! | बल्ले बल्ले!'],
        ['golu', 'thinking', "I can't dance with the varmala in my hands...", 'हाथ में वरमाला लेकर नाच नहीं सकता...'],
      ], { card: ["Sunday: The wedding", "संडे: शादी का दिन"], time: 'evening', camera: 'orbit', minDuration: 5 });
      ep.act('street', ['golu:idle', 'kabir:bhangra'], [
        ['golu', 'thinking', "I'll just put it on this chair. | For one minute. | One dance.", 'मैं इसे बस इस कुर्सी पर रख देता हूँ। | एक मिनट के लिए। | एक डांस।'],
        ['golu', 'excited', 'Balle balle!', 'बल्ले बल्ले!', 0.4],
      ], { props: [{ kind: 'varmala', x: 2.0, z: 0.4 }] });
      ep.act('street', ['golu:bhangra', 'kabir:bhangra', 'chachu:dance', 'anaya:dance', 'papa:idle:dhol'], [
        ['papa', 'excited', 'Dhum, dhum, dhum!', 'ढम, ढम, ढम!'],
        ['golu', 'excited', 'Look at my moves, Kabir!', 'मेरे स्टेप देखो, कबीर!'],
        ['kabir', 'laugh', "Mine are better!", 'मेरे वाले ज़्यादा अच्छे हैं!'],
      ], { camera: 'orbit', minDuration: 6 });
      ep.act('wedding', ['panditji:namaste', 'chachu:idle', 'chachi:idle::walk-left', 'dadaji:idle', 'dadi:idle'], [
        ['panditji', 'calm', 'Om shanti, shanti, shanti. | The lucky moment is here.', 'ॐ शांति, शांति, शांति। | शुभ मुहूर्त आ गया है।'],
        ['panditji', 'happy', 'Now the bride and groom will exchange the varmala. | Who has it?', 'अब वर और वधू वरमाला पहनाएँगे। | वरमाला किसके पास है?', 0.5],
        ['chachu', 'happy', 'Golu has it. | Golu?', 'गोलू के पास है। | गोलू?'],
      ], { time: 'night', transition: 'fade' });
      ep.act('wedding', ['golu:lookaround', 'anaya:idle'], [
        ['golu', 'surprised', "It's right here... | [0.6] um. | Didi. | I left it on the chair. | At the baraat.", 'यहीं तो है... | [0.6] उम्म। | दीदी। | मैंने उसे कुर्सी पर छोड़ दिया। | बारात में।', 0.4],
        ['anaya', 'thinking', "Okay. | Don't panic. | Let's go and look. | Quickly.", 'ठीक है। | घबराओ मत। | चलो जाकर देखते हैं। | जल्दी।'],
      ], { camera: 'closeup', minDuration: 5 });
      ep.act('street', ['golu:lookaround', 'anaya:lookaround'], [
        ['golu', 'scared', "The chair is empty! | It's gone!", 'कुर्सी ख़ाली है! | वो ग़ायब है!'],
        ['anaya', 'thinking', "Look, Golu. | Marigold petals on the ground. | A trail of them. | Going that way.", 'देखो, गोलू। | ज़मीन पर गेंदे की पंखुड़ियाँ। | एक लाइन में। | उस तरफ़ जा रही हैं।', 0.4],
      ], { minDuration: 5 });
      ep.act('wedding', ['golu:sad', 'anaya:idle'], [
        ['golu', 'sad', "Didi, | maybe I should just say I never had it. | Nobody saw me put it down.", 'दीदी, | शायद मैं बोल दूँ कि वो मेरे पास थी ही नहीं। | किसी ने मुझे रखते नहीं देखा।'],
        ['anaya', 'calm', "Then Chachu would think someone else lost it. | Is that fair?", 'तो चाचू सोचेंगे किसी और ने खोई। | क्या ये सही होगा?'],
        ['golu', 'sad', '[0.6] No. | I have to tell him.', '[0.6] नहीं। | मुझे उन्हें बताना होगा।', 0.4],
      ], { camera: 'closeup', minDuration: 5, optional: 1 });
      ep.act('wedding', ['pari:point', 'golu:idle', 'anaya:idle'], [
        ['pari', 'excited', 'Bruno! | Flowers!', 'ब्रूनो! | फूल!', 0.4],
        ['anaya', 'surprised', 'Pari is right! | The petals go straight to... | Bruno!', 'परी सही है! | पंखुड़ियाँ सीधे जा रही हैं... | ब्रूनो की तरफ़!'],
      ]);
      ep.act('wedding', ['bruno:run:varmala', 'golu:run', 'anaya:run'], [
        ['bruno', 'excited', 'Woof! | Woof woof!', 'भौं! | भौं भौं!'],
        ['golu', 'laugh', "Bruno! | That's not your necklace! | Come back!", 'ब्रूनो! | वो तुम्हारा हार नहीं है! | वापस आओ!'],
      ], { minDuration: 5 });
      ep.act('wedding', ['golu:idle:varmala', 'chachu:idle', 'panditji:idle'], [
        ['golu', 'sad', "Chachu, | I'm sorry. | I put it down to dance, | and Bruno took it. | Some of the flowers fell off.", 'चाचू, | सॉरी। | मैंने नाचने के लिए उसे नीचे रख दिया, | और ब्रूनो ले गया। | कुछ फूल गिर गए।', 0.5],
        ['chachu', 'laugh', "You told me the truth *and* you found it. | That's my champion. | A few petals less is fine.", 'तुमने सच भी बताया *और* ढूँढ भी लाए। | ये है मेरा चैंपियन। | थोड़ी पंखुड़ियाँ कम हैं, चलेगा।'],
        ['panditji', 'happy', 'And the lucky moment is still here. | Perfect timing!', 'और शुभ मुहूर्त अभी बाक़ी है। | एकदम सही समय!'],
      ]);
      ep.act('wedding', ['chachu:idle:varmala', 'chachi:idle', 'panditji:namaste', 'dadi:clap', 'dadaji:clap', 'golu:cheer', 'pari:clap'], [
        ['chachi', 'happy', "Golu, | you're going to be my favourite nephew.", 'गोलू, | तुम मेरे सबसे प्यारे भतीजे बनोगे।'],
        ['dadaji', 'calm', 'Bless you both. | Live happily, | and always laugh together.', 'तुम दोनों को आशीर्वाद। | ख़ुश रहो, | और हमेशा साथ मिलकर हँसो।', 0.6],
        ['golu', 'excited', 'Yaaay! | Now... | is it time for laddoos?', 'येएए! | अब... | लड्डू का टाइम हुआ?'],
      ], { camera: 'orbit', minDuration: 7 });
      ep.act('reception', ['chachu:dance', 'chachi:twirl', 'golu:bhangra', 'anaya:dance', 'papa:dance', 'mumma:dance', 'pari:clap'], [
        ['papa', 'excited', 'And now... | everybody on the dance floor!', 'और अब... | सब डांस फ़्लोर पर!'],
        ['golu', 'excited', 'And this time, | I have nothing in my hands!', 'और इस बार, | मेरे हाथ में कुछ नहीं है!'],
      ], { camera: 'orbit', minDuration: 7, transition: 'fade', optional: 1 });
    },
  },
];
