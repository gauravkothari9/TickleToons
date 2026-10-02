// Everyday stories: the small, real things that happen in every family. Phones at the dinner
// table, a test paper hidden under the mattress, a power cut on a hot night, a wobbly tooth,
// three people and one TV remote, feeling left out when a baby gets all the attention.
// Written the way people really talk: half-sentences, interruptions, grown-ups who admit they
// got it wrong too. Same format as stories-long.js: [who, emotion, text, pauseBefore?].

export const EVERYDAY_TEMPLATES = [
  // ======================= SCREEN TIME =======================
  {
    id: 'screentime', theme: 'home', moral: true, look: 'home',
    build(ep, { T, N }) {
      ep.title = T('Just Five More Minutes!', 'बस पाँच मिनट और!');
      ep.summary = T('Golu can\'t put Papa\'s phone down. But when Mumma counts how much time *everyone* spends on screens... Papa gets a surprise too!', 'गोलू पापा का फ़ोन छोड़ ही नहीं पाता। पर जब मम्मा *सबका* स्क्रीन टाइम गिनती हैं... तो पापा भी फँस जाते हैं!');
      ep.moral = T('Phones can wait. | The people sitting next to you can\'t.', 'फ़ोन इंतज़ार कर सकता है। | पास बैठे अपने लोग नहीं।');
      ep.lesson = T('We were all in the same room... [0.3] but nobody was really *together*.', 'हम सब एक ही कमरे में थे... [0.3] पर असल में कोई *साथ* नहीं था।');
      ep.hook = T('Papa gave me his phone for *five* minutes! | [0.3] That was an hour ago. | Shh!', 'पापा ने *पाँच* मिनट के लिए फ़ोन दिया था! | [0.3] वो एक घंटा पहले की बात है। | श्श!');
      ep.music = 'happy';
      ep.scene('bedroom', ['golu:phone', 'dadi:idle:rotiplate:walk-left'], [
        ['dadi', 'happy', T('Golu, beta! | Food is on the table.', 'गोलू, बेटा! | खाना लग गया है।')],
        ['golu', 'neutral', T('Hmm. | Coming.', 'हम्म। | आया।')],
        ['dadi', 'calm', T('Golu...', 'गोलू...'), 1.2],
        ['golu', 'neutral', T('Yes, yes, coming! | One more video. | It\'s almost finished.', 'हाँ, हाँ, आ रहा हूँ! | बस एक वीडियो और। | ख़त्म होने वाला है।')],
      ], { time: 'evening', transition: 'fade', set: [{ kind: 'tv', x: 0, z: -2.2 }] });
      ep.scene('kitchen', ['mumma:idle', 'anaya:eat', 'papa:phone', 'dadaji:eat', 'golu:phone::walk-left'], [
        ['mumma', 'thinking', T('Golu... [0.4] phone. | On the table. | *Now*.', 'गोलू... [0.4] फ़ोन। | टेबल पर। | *अभी*।')],
        ['golu', 'angry', T('But Papa is on *his* phone!', 'पर पापा भी तो फ़ोन चला रहे हैं!')],
        ['papa', 'surprised', T('Me? | No, no, this is... | office work. | [0.5] It\'s a cricket score. | It\'s *important* office work.', 'मैं? | नहीं, नहीं, ये तो... | ऑफ़िस का काम है। | [0.5] क्रिकेट स्कोर है। | ऑफ़िस का *ज़रूरी* काम।'), 0.4],
        ['anaya', 'laugh', T('Ha! | Caught you, Papa!', 'हा! | पकड़े गए, पापा!')],
      ]);
      ep.act('bedroom', ['mumma:idle:phone', 'papa:idle', 'golu:idle', 'anaya:idle'], [
        ['mumma', 'thinking', "Let's see. | This phone tells you how long everyone used it today.", 'चलो, देखते हैं। | ये फ़ोन बताता है कि आज किसने कितनी देर चलाया।'],
        ['mumma', 'surprised', 'Golu: two hours. | [0.4] And Papa... | *four* hours?', 'गोलू: दो घंटे। | [0.4] और पापा... | *चार* घंटे?', 0.4],
        ['papa', 'sad', '[0.4] The match had a rain delay. | I had to watch the rain too.', '[0.4] मैच में बारिश की वजह से देरी थी। | मुझे बारिश भी देखनी पड़ी।'],
        ['golu', 'laugh', "Papa, you're worse than me!", 'पापा, आप तो मुझसे भी बुरे हो!'],
      ], { minDuration: 5 });
      ep.scene('bedroom', ['golu:sad', 'anaya:read', 'mumma:idle'], [
        ['golu', 'sad', T('Mumma, | my eyes are burning. | And my head hurts...', 'मम्मा, | मेरी आँखें जल रही हैं। | और सिर भी दुख रहा है...')],
        ['mumma', 'calm', T('That\'s what happens when you stare at a tiny screen for two hours, beta. | Your eyes get tired too.', 'दो घंटे छोटी सी स्क्रीन देखोगे तो यही होगा, बेटा। | आँखें भी थक जाती हैं।')],
        ['golu', 'angry', T('It wasn\'t two hours! | [0.5] Was it?', 'दो घंटे नहीं हुए थे! | [0.5] हुए थे क्या?'), 0.3],
      ]);
      ep.scene('kitchen', ['mumma:idle:basket', 'papa:idle:phone', 'golu:idle', 'anaya:idle', 'dadaji:idle'], [
        ['mumma', 'happy', T('Okay. | New family rule. | At dinner, every phone goes in *this* basket. | Every phone.', 'ठीक है। | परिवार का नया नियम। | खाने के समय हर फ़ोन *इस* टोकरी में। | हर फ़ोन।')],
        ['golu', 'thinking', T('Even Papa\'s?', 'पापा का भी?'), 0.4],
        ['mumma', 'calm', T('*Especially* Papa\'s.', 'ख़ासकर पापा का।'), 0.5],
        ['papa', 'sad', T('[0.3] Fine. | But if India wins and I miss it... | I\'m blaming all of you.', '[0.3] ठीक है। | पर अगर इंडिया जीत गई और मैंने मिस कर दिया... | तो ग़लती तुम सबकी।')],
      ]);
      ep.act('kitchen', ['dadaji:eat', 'anaya:eat', 'golu:eat', 'papa:eat', 'mumma:idle:rotiplate', 'dadi:eat'], [
        ['golu', 'thinking', 'Dinner with no phones. | [0.5] So... | what do we do?', 'बिना फ़ोन के खाना। | [0.5] तो... | अब हम क्या करें?'],
        ['dadi', 'laugh', 'We talk, beta! | Like people used to.', 'बातें करते हैं, बेटा! | जैसे लोग पहले करते थे।'],
        ['anaya', 'happy', 'Today in class, Meera laughed so hard that milk came out of her nose!', 'आज क्लास में मीरा इतना हँसी कि उसकी नाक से दूध निकल गया!'],
        ['papa', 'laugh', "Ha ha! | Okay, that's better than the cricket score.", 'हा हा! | अच्छा, ये तो क्रिकेट स्कोर से भी अच्छा है।'],
      ], { minDuration: 5, optional: 2 });
      ep.act('kitchen', ['papa:phone', 'golu:point'], [
        ['golu', 'angry', "Papa! | What's that in your hand?", 'पापा! | आपके हाथ में क्या है?'],
        ['papa', 'scared', "It's... | a very flat roti.", 'ये... | बहुत चपटी रोटी है।'],
        ['golu', 'laugh', 'Basket. | *Now*.', 'टोकरी में। | *अभी*।'],
      ], { optional: 1 });
      ep.scene('bedroom', ['golu:sitcross', 'papa:sitfloor', 'anaya:sitfloor', 'dadaji:sitchair', 'pari:sitfloor'], [
        ['dadaji', 'happy', T('Who wants to play ludo? | I warn you... | I was the ludo champion of my whole village.', 'लूडो कौन खेलेगा? | पहले बता दूँ... | मैं अपने पूरे गाँव का लूडो चैंपियन था।')],
        ['golu', 'excited', T('Six! | I got a six! | Move, Papa, | I\'m cutting your piece!', 'छक्का! | मेरा छक्का आया! | हटो पापा, | मैं आपकी गोटी काट रहा हूँ!')],
        ['papa', 'laugh', T('Hey! | That\'s cheating! | Ha ha ha!', 'अरे! | ये चीटिंग है! | हा हा हा!')],
        ['anaya', 'laugh', T('Papa, you\'re *losing* to Golu! | Hehe!', 'पापा, आप गोलू से *हार* रहे हो! | हीही!')],
      ], { minDuration: 6, props: [{ kind: 'ludo', x: 0, z: 0.9 }] });
      ep.scene('bedroom', ['golu:yawn', 'papa:idle', 'mumma:idle'], [
        ['golu', 'happy', T('Papa... [0.4] that was more fun than the phone.', 'पापा... [0.4] ये तो फ़ोन से भी ज़्यादा मज़ेदार था।')],
        ['papa', 'calm', T('I know, champ. | [0.4] I forgot that too.', 'पता है, चैंप। | [0.4] मैं भी ये भूल गया था।')],
      ], { optional: true });
    },
  },

  // ======================= THE HIDDEN TEST PAPER =======================
  {
    id: 'testpaper', theme: 'school', moral: true, look: 'home',
    build(ep, { T, N }) {
      ep.title = T('The Test Paper Under the Mattress', 'गद्दे के नीचे छुपी टेस्ट कॉपी');
      ep.summary = T('Golu got three out of ten in his maths test... so he hid it. But a secret is heavy, and Papa has one of his own!', 'गोलू के मैथ्स टेस्ट में दस में से तीन आए... तो उसने कॉपी छुपा दी। पर राज़ छुपाना भारी पड़ता है, और पापा का भी एक पुराना राज़ है!');
      ep.moral = T('Hiding a mistake makes it bigger. | Tell someone, | and let them help you.', 'ग़लती छुपाने से वो और बड़ी हो जाती है। | किसी को बताओ, | और उन्हें मदद करने दो।');
      ep.lesson = T('I was so scared they\'d be angry... [0.3] but they just wanted to help.', 'मुझे लगा सब ग़ुस्सा करेंगे... [0.3] पर सब तो बस मदद करना चाहते थे।');
      ep.hook = T('Today I have a *secret*. | And you can\'t tell Mumma. | Promise?', 'आज मेरे पास एक *राज़* है। | और आप मम्मा को नहीं बताओगे। | पक्का?');
      ep.music = 'calm';
      ep.scene('classroom', ['teacher:idle:paper', 'golu:idle:testpaper', 'kabir:cheer:paper'], [
        ['teacher', 'calm', T('Your maths test papers, children. | Take them home and get them signed by your parents.', 'बच्चों, ये रहीं तुम्हारी मैथ्स टेस्ट की कॉपियाँ। | घर ले जाकर मम्मी-पापा से साइन करवा लाना।')],
        ['kabir', 'excited', T('Eight out of ten! | Yes! | Golu, what did you get?', 'दस में से आठ! | येस! | गोलू, तुम्हारे कितने आए?')],
        ['golu', 'sad', T('Me? | Umm... [0.4] good. | I got good.', 'मेरे? | उम्म... [0.4] अच्छे। | अच्छे आए।'), 0.6],
      ], { transition: 'fade' });
      ep.scene('bedroom', ['golu:lookaround:testpaper'], [
        ['golu', 'scared', T('Three out of ten... | [0.5] Mumma will be *so* angry. | Under the mattress. | Nobody looks under the mattress.', 'दस में से तीन... | [0.5] मम्मा *बहुत* ग़ुस्सा होंगी। | गद्दे के नीचे। | गद्दे के नीचे कोई नहीं देखता।')],
      ], { time: 'evening', minDuration: 5 });
      ep.act('bedroom', ['golu:sleep'], [
        ['golu', 'sad', "I can't sleep. | The mattress feels lumpy. | [0.5] It's like the paper is saying: tell Mumma, tell Mumma.", 'नींद नहीं आ रही। | गद्दा ऊबड़-खाबड़ लग रहा है। | [0.5] जैसे वो कॉपी कह रही हो: मम्मा को बताओ, मम्मा को बताओ।'],
      ], { camera: 'closeup', minDuration: 5, optional: 2 });
      ep.scene('kitchen', ['mumma:idle', 'golu:eat', 'anaya:eat'], [
        ['mumma', 'happy', T('Golu, | didn\'t you have a maths test last week? | Did you get it back?', 'गोलू, | पिछले हफ़्ते तुम्हारा मैथ्स टेस्ट था ना? | कॉपी मिली?')],
        ['golu', 'scared', T('No! | I mean... | Ma\'am didn\'t give them yet. | She was... | sick. | Very sick.', 'नहीं! | मतलब... | मैडम ने अभी दी नहीं। | वो... | बीमार थीं। | बहुत बीमार।'), 0.3],
        ['anaya', 'thinking', T('Hmm. | That\'s funny. | Kabir showed me *his* paper today.', 'हम्म। | अजीब बात है। | कबीर ने तो आज अपनी कॉपी मुझे दिखाई।'), 0.6],
      ]);
      ep.scene('bedroom', ['golu:sad', 'mumma:idle:testpaper'], [
        ['mumma', 'calm', T('I was changing the bedsheet... | and look what I found.', 'मैं चादर बदल रही थी... | और देखो मुझे क्या मिला।'), 0.5],
        ['golu', 'sad', T('I\'m sorry, Mumma. | I thought you\'d shout at me. | [0.5] I\'m just bad at maths. | I\'m bad at *everything*.', 'सॉरी मम्मा। | मुझे लगा आप डाँटोगी। | [0.5] मैं मैथ्स में ही बेकार हूँ। | मैं *सब* में बेकार हूँ।'), 0.4],
        ['mumma', 'sad', T('Hey... | come here. | [0.4] I\'m not upset about the three. | I\'m upset that you were scared to tell me.', 'अरे... | इधर आओ। | [0.4] मुझे तीन नंबर का दुख नहीं है। | दुख इस बात का है कि तुम मुझे बताने से डर गए।')],
      ], { card: ["Next day", "अगले दिन"], time: 'afternoon', minDuration: 5 });
      ep.act('classroom', ['teacher:idle', 'golu:idle:schoolbag', 'kabir:idle'], [
        ['teacher', 'calm', 'Golu, did your parents sign your test paper?', 'गोलू, क्या तुम्हारे मम्मी-पापा ने टेस्ट कॉपी पर साइन किया?'],
        ['golu', 'sad', "Not yet, Ma'am. | But my Mumma knows now. | And Papa is going to help me practise.", 'अभी नहीं, मैडम। | पर अब मम्मा को पता है। | और पापा मुझे प्रैक्टिस कराएँगे।'],
        ['teacher', 'happy', "That's the best thing you could do, Golu.", 'ये तुमने सबसे अच्छा किया, गोलू।'],
      ], { optional: 1 });
      ep.scene('house', ['papa:idle', 'golu:sad', 'dadi:idle'], [
        ['papa', 'calm', T('Can I tell you a secret, Golu? | In fourth class, | I got *two* out of ten in maths.', 'एक राज़ की बात बताऊँ, गोलू? | चौथी क्लास में | मेरे मैथ्स में दस में से *दो* आए थे।')],
        ['golu', 'surprised', T('*Two*? | You? | What did you do?', '*दो*? | आपके? | फिर आपने क्या किया?')],
        ['papa', 'laugh', T('I hid it in Dadi\'s rice tin.', 'मैंने दादी के चावल के डिब्बे में छुपा दी।')],
        ['dadi', 'laugh', T('And I found it the very next day! | I still have it, you know. | Ha ha!', 'और मुझे अगले ही दिन मिल गई! | आज भी रखी है मेरे पास। | हा हा!'), 0.3],
      ]);
      ep.scene('bedroom', ['papa:sitchair:laddooplate', 'golu:study', 'anaya:idle'], [
        ['papa', 'happy', T('Okay. | If I have four laddoos... | and Dadi gives me three more...', 'चलो। | अगर मेरे पास चार लड्डू हैं... | और दादी तीन और दे दें...')],
        ['golu', 'thinking', T('Seven! | [0.4] And then you\'ll eat them all and Dadi will say *Hai Ram*.', 'सात! | [0.4] और फिर आप सब खा जाओगे और दादी कहेंगी *हाय राम*।')],
        ['anaya', 'laugh', T('See? | You\'re not bad at maths. | You\'re bad at *hiding things*. | Hehe.', 'देखा? | तुम मैथ्स में बेकार नहीं हो। | तुम *चीज़ें छुपाने* में बेकार हो। | हीही।')],
      ], { minDuration: 5 });
      ep.scene('classroom', ['teacher:idle', 'golu:cheer:paper', 'kabir:clap'], [
        ['teacher', 'happy', T('Golu... | seven out of ten! | Well done!', 'गोलू... | दस में से सात! | शाबाश!')],
        ['golu', 'excited', T('Seven! | And I\'m showing this one to *everyone*!', 'सात! | और ये वाली तो मैं *सबको* दिखाऊँगा!')],
      ], { card: ["One week later", "एक हफ़्ते बाद"], time: 'morning', optional: true });
    },
  },

  // ======================= POWER CUT =======================
  {
    id: 'powercut', theme: 'home', moral: undefined, look: 'night',
    build(ep, { T, N }, { moral }) {
      ep.title = T('The Night the Lights Went Out', 'जिस रात बत्ती चली गई');
      ep.summary = T('A hot summer night, a power cut, and no fan. Everyone is grumpy... until Dadaji takes the family up under the stars.', 'गर्मी की रात, बत्ती गुल, और पंखा बंद। सब चिड़चिड़े हैं... जब तक दादाजी सबको तारों के नीचे नहीं ले जाते।');
      if (moral !== false) {
        ep.moral = T('The best times don\'t need a plug. | Just each other.', 'सबसे अच्छे पल किसी प्लग से नहीं चलते। | बस एक-दूसरे से।');
        ep.lesson = T('The lights went out... [0.3] and we finally talked to each other.', 'बत्ती चली गई... [0.3] और आख़िरकार हमने एक-दूसरे से बात की।');
      }
      ep.hook = T('It\'s *so* hot tonight. | At least we have the fan... | [0.5] right?', 'आज रात *कितनी* गर्मी है। | कम से कम पंखा तो है... | [0.5] है ना?');
      ep.music = 'calm';
      ep.scene('bedroom', ['golu:idle', 'anaya:read', 'pari:sitfloor', 'mumma:idle'], [
        ['golu', 'happy', T('Fan on full speed! | Ahh, this is life.', 'पंखा फ़ुल स्पीड पर! | आह, यही तो ज़िंदगी है।')],
        ['anaya', 'surprised', T('[0.6] Hey! | Who switched off the lights?', '[0.6] अरे! | बत्ती किसने बुझाई?'), 0.8],
        ['golu', 'scared', T('Not me! | It\'s a power cut! | Mumma! | Mummaaa!', 'मैंने नहीं! | बत्ती चली गई! | मम्मा! | मम्मााा!')],
        ['pari', 'sad', T('Waaah...', 'ऊँ ऊँ...')],
      ], { time: 'night', transition: 'fade' });
      ep.scene('bedroom', ['papa:lookaround', 'mumma:idle:phone', 'golu:sad', 'anaya:idle'], [
        ['papa', 'thinking', T('Where\'s the torch? | It was right here in the drawer... | [0.4] Ouch! | That was my toe.', 'टॉर्च कहाँ है? | यहीं दराज़ में थी... | [0.4] आउच! | मेरा अंगूठा।')],
        ['mumma', 'calm', T('And the inverter? | [0.4] Someone forgot to charge it.', 'और इन्वर्टर? | [0.4] कोई उसे चार्ज करना भूल गया।'), 0.3],
        ['papa', 'sad', T('Someone... | yes. | [0.3] Someone very handsome.', 'किसी ने... | हाँ। | [0.3] किसी बहुत हैंडसम आदमी ने।')],
        ['golu', 'angry', T('It\'s *so* hot! | And so boring! | And I can\'t see anything!', 'कितनी *गर्मी* है! | और कितना बोरिंग! | और कुछ दिख भी नहीं रहा!')],
      ]);
      ep.act('bedroom', ['golu:sitfloor', 'anaya:sitfloor', 'pari:sitfloor'], [
        ['golu', 'scared', "Didi... | it's so dark. | What if there's something under the bed?", 'दीदी... | कितना अँधेरा है। | अगर पलंग के नीचे कुछ हुआ तो?'],
        ['anaya', 'calm', "There's nothing under the bed, Golu. | Just your lost socks. | Here, hold my hand.", 'पलंग के नीचे कुछ नहीं है, गोलू। | बस तुम्हारे खोए हुए मोज़े। | लो, मेरा हाथ पकड़ो।'],
        ['golu', 'calm', '[0.4] Okay. | But only because *you* look scared.', '[0.4] ठीक है। | पर सिर्फ़ इसलिए क्योंकि *आप* डरी हुई लग रही हो।'],
      ], { minDuration: 5, optional: 2 });
      ep.scene('bedroom', ['dadaji:idle:torch:walk-left', 'golu:idle:pillow', 'anaya:idle'], [
        ['dadaji', 'calm', T('Arre, why is everyone sitting in the dark like sad owls? | Come. | Everybody upstairs. | Bring the mats.', 'अरे, सब उल्लुओं की तरह अँधेरे में मुँह लटकाए क्यों बैठे हो? | चलो। | सब छत पर। | दरियाँ ले आओ।')],
        ['golu', 'thinking', T('Upstairs? | What\'s upstairs?', 'छत पर? | छत पर क्या है?')],
        ['dadaji', 'happy', T('The best ceiling in the world.', 'दुनिया की सबसे अच्छी छत।'), 0.5],
      ]);
      ep.scene('night', ['dadaji:sitcross', 'golu:sitfloor', 'anaya:sitfloor', 'papa:sitfloor', 'mumma:sitfloor', 'pari:sitfloor', 'dadi:idle'], [
        ['golu', 'surprised', T('Whoaaa... | [0.5] there are *so* many stars! | I never see them from my room.', 'वाह्ह्ह... | [0.5] कितने *सारे* तारे हैं! | मेरे कमरे से तो कभी नहीं दिखते।')],
        ['anaya', 'calm', T('And there\'s a breeze up here. | It\'s actually... nice.', 'और यहाँ हवा भी चल रही है। | ये तो सच में... अच्छा है।')],
        ['dadaji', 'calm', T('When I was a boy, | there was no electricity in our village at all. | Every night, | we slept on the roof... | and counted shooting stars.', 'जब मैं छोटा था, | हमारे गाँव में बिजली थी ही नहीं। | हर रात | हम छत पर सोते थे... | और टूटते तारे गिनते थे।'), 0.5],
      ], { camera: 'wide', minDuration: 6, set: [{ kind: 'picnicmat', x: 0, z: 0.4 }] });
      ep.act('night', ['dadi:idle:cup', 'golu:sitfloor', 'anaya:sitfloor', 'dadaji:sitcross'], [
        ['dadi', 'happy', 'Cold buttermilk for everyone. | From the clay pot. | No fridge needed.', 'सबके लिए ठंडी छाछ। | मटके वाली। | फ़्रिज की ज़रूरत नहीं।'],
        ['golu', 'happy', "Mmm. | Dadi, it's colder than the fridge!", 'म्म्म। | दादी, ये तो फ़्रिज से भी ठंडी है!'],
        ['dadaji', 'calm', "Look up there, Golu. | Those three bright stars in a line. | We called them the hunter's belt.", 'वहाँ ऊपर देखो, गोलू। | वो तीन चमकते तारे एक लाइन में। | हम उन्हें शिकारी की बेल्ट कहते थे।'],
      ], { camera: 'wide', minDuration: 5, optional: 1 });
      ep.scene('night', ['papa:point:torch', 'golu:laugh', 'anaya:laugh', 'pari:clap'], [
        ['papa', 'excited', T('Okay, torch on the wall. | Watch! | [0.4] A dog. | Woof woof!', 'चलो, दीवार पर टॉर्च। | देखो! | [0.4] कुत्ता। | भौं भौं!')],
        ['golu', 'laugh', T('Papa, that\'s a duck! | Ha ha ha!', 'पापा, वो तो बतख है! | हा हा हा!')],
        ['pari', 'laugh', T('Hehehe! | Again!', 'हीहीही! | फिर से!')],
      ], { minDuration: 5 });
      ep.scene('night', ['golu:sad', 'anaya:point', 'dadaji:idle', 'mumma:idle'], [
        ['anaya', 'surprised', T('Look! | The lights are back on downstairs!', 'देखो! | नीचे बत्ती आ गई!')],
        ['golu', 'sad', T('Already? | [0.4] Can someone switch them off again? | Just for ten more minutes?', 'इतनी जल्दी? | [0.4] कोई फिर से बंद कर दो ना? | बस दस मिनट और?'), 0.4],
        ['dadaji', 'laugh', T('Ha ha! | Now you know the secret, beta.', 'हा हा! | अब तुम्हें राज़ पता चल गया, बेटा।')],
      ]);
    },
  },

  // ======================= THE REMOTE CONTROL WAR =======================
  {
    id: 'remote', theme: 'home', moral: true, look: 'home',
    build(ep, { T, N }) {
      ep.title = T('Three People, One Remote!', 'तीन लोग, एक रिमोट!');
      ep.summary = T('Anaya wants her quiz show, Golu wants cartoons, and Papa wants the cricket match. There is only one TV... and one very sneaky baby.', 'अनाया को क्विज़ शो देखना है, गोलू को कार्टून, और पापा को क्रिकेट मैच। टीवी एक है... और एक बहुत चालाक बच्ची भी।');
      ep.moral = T('When everyone wants something different, | shouting doesn\'t work. | Taking turns does.', 'जब सबको अलग-अलग चीज़ चाहिए, | तो चिल्लाने से कुछ नहीं होता। | बारी-बारी से होता है।');
      ep.lesson = T('We were fighting so much... [0.3] that nobody watched anything!', 'हम इतना लड़ रहे थे... [0.3] कि किसी ने कुछ देखा ही नहीं!');
      ep.hook = T('Today... | there is going to be a *war*. | [0.4] Over the TV remote.', 'आज... | एक *युद्ध* होने वाला है। | [0.4] टीवी के रिमोट के लिए।');
      ep.music = 'silly';
      ep.scene('bedroom', ['golu:sitfloor:remote', 'anaya:idle::walk-left'], [
        ['golu', 'happy', T('Cartoon time! | Finally!', 'कार्टून टाइम! | आख़िरकार!')],
        ['anaya', 'angry', T('Golu, | my quiz show starts at five. | You *know* that.', 'गोलू, | मेरा क्विज़ शो पाँच बजे शुरू होता है। | तुम्हें *पता* है।')],
        ['golu', 'angry', T('I was here *first*! | First come, first serve!', 'मैं *पहले* आया था! | जो पहले आए, वो पहले पाए!')],
      ], { time: 'afternoon', transition: 'fade', set: [{ kind: 'tv', x: 0, z: -2.2 }] });
      ep.scene('bedroom', ['papa:point::walk-left', 'golu:stomp:remote', 'anaya:stomp'], [
        ['papa', 'excited', T('Sorry, kids! | India versus Australia. | Last five overs. | Remote, please!', 'सॉरी बच्चों! | इंडिया बनाम ऑस्ट्रेलिया। | आख़िरी पाँच ओवर। | रिमोट दो!')],
        ['anaya', 'angry', T('Papa! | That\'s not fair! | You watched cricket *all* morning!', 'पापा! | ये ग़लत है! | आपने *पूरी* सुबह क्रिकेट देखा!')],
        ['golu', 'angry', T('Mine! | Mine! | *Mine*!', 'मेरा! | मेरा! | *मेरा*!'), 0.2],
      ]);
      ep.act('bedroom', ['dadaji:idle::walk-left', 'golu:idle:remote', 'anaya:idle', 'papa:idle'], [
        ['dadaji', 'calm', "What's all this shouting? | I only wanted to watch the news.", 'ये सब शोर क्या है? | मैं तो बस ख़बरें देखना चाहता था।'],
        ['golu', 'angry', 'Dadaji, get in line! | There are already three people!', 'दादाजी, लाइन में लगो! | पहले से तीन लोग हैं!'],
        ['dadaji', 'laugh', 'In my day, we had one channel. | And nobody fought.', 'हमारे ज़माने में एक ही चैनल था। | और कोई नहीं लड़ता था।'],
      ], { optional: 2 });
      ep.scene('bedroom', ['mumma:idle::walk-left', 'papa:shrug', 'golu:sad', 'anaya:sad'], [
        ['mumma', 'angry', T('Enough! | I can hear you three from the *kitchen*. | TV off.', 'बस! | तुम तीनों की आवाज़ *रसोई* तक आ रही है। | टीवी बंद।')],
        ['papa', 'sad', T('But the match—', 'पर मैच—')],
        ['mumma', 'calm', T('*Off*.', '*बंद*।'), 0.2],
      ]);
      ep.scene('bedroom', ['golu:lookaround', 'anaya:lookaround', 'papa:lookaround', 'pari:sitfloor:remote'], [
        ['golu', 'surprised', T('Wait. | Where\'s the remote?', 'रुको। | रिमोट कहाँ गया?'), 0.8],
        ['papa', 'thinking', T('It was right here! | Under the cushion? | Behind the sofa?', 'यहीं तो था! | कुशन के नीचे? | सोफ़े के पीछे?')],
        ['pari', 'laugh', T('Hehehe! | Pari phone! | Hello? | Hello?', 'हीहीही! | परी का फ़ोन! | हैलो? | हैलो?'), 0.6],
        ['anaya', 'laugh:point', T('She\'s talking into the remote! | Ha ha!', 'ये तो रिमोट में बात कर रही है! | हा हा!')],
      ], { minDuration: 5 });
      ep.act('bedroom', ['pari:sitfloor:remote', 'golu:sitfloor', 'anaya:sitfloor', 'papa:sitfloor'], [
        ['golu', 'calm', 'Pari, can I have the remote? | Please?', 'परी, क्या मुझे रिमोट मिलेगा? | प्लीज़?'],
        ['pari', 'happy', 'Mine!', 'मेरा!'],
        ['papa', 'laugh', 'Ha ha! | Guess where she learned *that* word.', 'हा हा! | सोचो, ये शब्द इसने किससे सीखा।'],
        ['anaya', 'thinking', 'Maybe we should stop fighting... | before she learns anything else from us.', 'शायद हमें लड़ना बंद कर देना चाहिए... | इससे पहले कि ये हमसे और कुछ सीखे।'],
      ], { optional: 1 });
      ep.scene('bedroom', ['anaya:idle:paper', 'golu:idle', 'papa:idle', 'mumma:idle:remote'], [
        ['anaya', 'thinking', T('Okay, | I made a timetable. | Golu: cartoons till five. | Me: quiz show five to five-thirty...', 'चलो, | मैंने टाइम-टेबल बनाया है। | गोलू: पाँच बजे तक कार्टून। | मैं: पाँच से साढ़े पाँच क्विज़ शो...')],
        ['papa', 'thinking', T('And me?', 'और मैं?'), 0.3],
        ['anaya', 'happy', T('You, Papa... | get the highlights at dinner.', 'आप, पापा... | खाने के समय हाइलाइट्स देखना।')],
        ['papa', 'sad', T('Highlights. | [0.4] Okay. | Fair. | Painful... but fair.', 'हाइलाइट्स। | [0.4] ठीक है। | सही है। | दुख है... पर सही है।')],
      ]);
      ep.scene('bedroom', ['golu:cheer', 'anaya:cheer', 'papa:jump', 'mumma:clap', 'dadaji:cheer'], [
        ['papa', 'excited', T('Four! | Four! | India wins!', 'चौका! | चौका! | इंडिया जीत गई!')],
        ['golu', 'excited', T('Yaaay! | [0.3] Wait, why am I cheering? | I don\'t even like cricket! | Hehe!', 'येएए! | [0.3] रुको, मैं क्यों ख़ुश हो रहा हूँ? | मुझे तो क्रिकेट पसंद भी नहीं! | हीही!')],
        ['mumma', 'laugh', T('Because it\'s more fun when we watch *together*. | Ha ha!', 'क्योंकि *साथ* देखने में ज़्यादा मज़ा आता है। | हा हा!')],
      ], { minDuration: 5 });
    },
  },

  // ======================= THE WOBBLY TOOTH =======================
  {
    id: 'tooth', theme: 'health', moral: undefined, look: 'home',
    build(ep, { T, N }, { moral }) {
      ep.title = T('Golu\'s Wobbly Tooth!', 'गोलू का हिलता दाँत!');
      ep.summary = T('Golu\'s front tooth is wobbling and he is *sure* something terrible is happening. Nobody is allowed to touch it. Nobody!', 'गोलू का आगे का दाँत हिल रहा है और उसे *पक्का* लगता है कि कुछ बहुत बुरा हो रहा है। कोई हाथ नहीं लगाएगा। कोई नहीं!');
      if (moral !== false) {
        ep.moral = T('Growing up can feel scary. | But it\'s nothing to be afraid of. | And brush that new tooth!', 'बड़ा होना कभी-कभी डरावना लगता है। | पर इसमें डरने की कोई बात नहीं। | और नए दाँत को ब्रश करना!');
        ep.lesson = T('Losing a tooth means a new, bigger one is coming... [0.3] it means you\'re growing up!', 'दाँत गिरने का मतलब है नया, बड़ा दाँत आ रहा है... [0.3] मतलब तुम बड़े हो रहे हो!');
      }
      ep.hook = T('Something is *wrong* with my mouth. | [0.4] Don\'t laugh!', 'मेरे मुँह में कुछ *गड़बड़* है। | [0.4] हँसना मत!');
      ep.music = 'silly';
      ep.scene('kitchen', ['golu:eat', 'anaya:eat', 'dadi:idle'], [
        ['golu', 'scared', T('Didi... | Didi! | My tooth is *moving*! | [0.4] Look! | It goes this way... | and that way!', 'दीदी... | दीदी! | मेरा दाँत *हिल* रहा है! | [0.4] देखो! | इधर जाता है... | और उधर!')],
        ['anaya', 'laugh', T('That\'s a milk tooth, silly. | It\'s going to fall out.', 'वो दूध का दाँत है, बुद्धू। | वो गिरने वाला है।')],
        ['golu', 'scared', T('*Fall out*? | Of my *face*?', '*गिरने* वाला है? | मेरे *मुँह* से?'), 0.3],
      ], { time: 'morning', transition: 'fade' });
      ep.scene('bedroom', ['golu:no', 'papa:idle:torch', 'mumma:idle'], [
        ['papa', 'happy', T('Come here, champ. | Let me just have a look...', 'इधर आओ, चैंप। | ज़रा देखने दो...')],
        ['golu', 'angry', T('No! | Nobody touches it! | Nobody looks at it! | Nobody even *thinks* about it!', 'नहीं! | कोई हाथ नहीं लगाएगा! | कोई देखेगा भी नहीं! | कोई इसके बारे में *सोचेगा* भी नहीं!')],
        ['mumma', 'laugh', T('Okay, okay. | Nobody\'s thinking about your tooth. | [0.5] Mostly.', 'अच्छा, अच्छा। | कोई तुम्हारे दाँत के बारे में नहीं सोच रहा। | [0.5] ज़्यादातर।')],
      ]);
      ep.act('kitchen', ['golu:eat', 'dadi:idle:rotiplate', 'papa:idle'], [
        ['dadi', 'happy', 'Golu, hot paratha?', 'गोलू, गरम पराठा?'],
        ['golu', 'scared', "No, Dadi. | Only soup. | Soup can't pull out teeth.", 'नहीं, दादी। | सिर्फ़ सूप। | सूप दाँत नहीं निकालता।'],
        ['papa', 'laugh', 'When I was small, Dadaji tied my tooth to the door with a thread. | Then he slammed the door!', 'जब मैं छोटा था, दादाजी ने मेरा दाँत धागे से दरवाज़े पर बाँध दिया। | फिर ज़ोर से दरवाज़ा बंद कर दिया!'],
        ['golu', 'scared', "[0.4] I'm going to my room. | Nobody follow me with a thread!", '[0.4] मैं अपने कमरे में जा रहा हूँ। | कोई धागा लेकर मेरे पीछे मत आना!'],
      ], { optional: 2 });
      ep.scene('school', ['kabir:idle', 'golu:idle:schoolbag', 'meera:idle'], [
        ['kabir', 'excited', T('I lost *two* teeth already! | Look! | [0.3] I can whistle through the gap!', 'मेरे तो *दो* दाँत गिर चुके! | देखो! | [0.3] मैं बीच में से सीटी बजा सकता हूँ!')],
        ['meera', 'happy', T('When mine fell out, | my Nani said throw it on the roof... | and a sparrow will bring you a strong new one!', 'जब मेरा गिरा था, | मेरी नानी ने कहा छत पर फेंक दो... | चिड़िया नया मज़बूत दाँत लाएगी!')],
        ['golu', 'thinking', T('A sparrow? | [0.4] Does it hurt? | Be honest.', 'चिड़िया? | [0.4] दर्द होता है? | सच बताना।'), 0.4],
        ['kabir', 'happy', T('Nah. | It\'s like... | *pop*! | That\'s it.', 'नहीं यार। | बस... | *पॉप*! | हो गया।')],
      ], { card: ["Next day", "अगले दिन"], time: 'morning' });
      ep.scene('kitchen', ['dadaji:idle:apple', 'golu:eat:apple', 'anaya:idle'], [
        ['dadaji', 'happy', T('Fresh apple, beta? | Nice and crunchy.', 'ताज़ा सेब, बेटा? | एकदम कुरकुरा।')],
        ['golu', 'happy', T('Thank you, Dadaji. | [0.4] Mmm... | crunch... | [0.6] crunch... | huh?', 'थैंक यू दादाजी। | [0.4] म्म्म... | कुड़ुम... | [0.6] कुड़ुम... | हैं?')],
        ['golu', 'surprised', T('My tooth! | It\'s in the *apple*! | It came out! | And I didn\'t even feel it!', 'मेरा दाँत! | ये तो *सेब* में है! | निकल गया! | और मुझे पता भी नहीं चला!'), 0.6],
      ], { time: 'evening', minDuration: 5 });
      ep.act('bedroom', ['golu:idle', 'anaya:idle', 'mumma:idle'], [
        ['golu', 'thinking', 'Mumma, will a new one really grow? | What if I have a hole forever?', 'मम्मा, क्या सच में नया उगेगा? | अगर हमेशा के लिए छेद रह गया तो?'],
        ['mumma', 'calm', "It's already waiting under your gum, beta. | A big, strong one. | The milk tooth was just keeping its place.", 'वो तो पहले से तुम्हारे मसूड़े के नीचे इंतज़ार कर रहा है, बेटा। | बड़ा, मज़बूत वाला। | दूध का दाँत तो बस उसकी जगह सँभाल रहा था।'],
        ['anaya', 'happy', 'Mine came in two weeks. | Look!', 'मेरा दो हफ़्ते में आ गया था। | देखो!'],
      ], { optional: 1 });
      ep.scene('house', ['golu:jump', 'anaya:laugh', 'dadi:idle', 'pari:clap'], [
        ['golu', 'excited', T('Dadi, look! | I have a *window* in my mouth now! | Fffff... | I can\'t say "s" properly! | Thithter!', 'दादी, देखो! | अब मेरे मुँह में *खिड़की* है! | फ़्फ़्फ़... | मुझसे "स" ठीक से नहीं बोला जा रहा! | थीथी!')],
        ['dadi', 'laugh', T('Hai Ram! | My little Golu is growing up! | Ha ha!', 'हाय राम! | मेरा छोटा गोलू बड़ा हो रहा है! | हा हा!')],
        ['anaya', 'calm', T('Now throw it up on the roof... | and brush the new one *properly* when it comes!', 'अब इसे छत पर फेंको... | और जब नया आए, तो उसे *अच्छे से* ब्रश करना!')],
      ]);
    },
  },

  // ======================= FEELING LEFT OUT =======================
  {
    id: 'leftout', theme: 'home', moral: true, look: 'home',
    build(ep, { T, N }) {
      ep.title = T('Does Anyone Even Notice Me?', 'क्या किसी को मैं दिखता भी हूँ?');
      ep.summary = T('Pari learned a new word and everyone is clapping. Again. Golu drew a whole rocket and nobody looked. Again. So Golu decides to get noticed... the wrong way.', 'परी ने नया शब्द सीखा और सब ताली बजा रहे हैं। फिर से। गोलू ने पूरा रॉकेट बनाया और किसी ने देखा भी नहीं। फिर से। तो गोलू ध्यान खींचने का तरीका ढूँढता है... ग़लत तरीका।');
      ep.moral = T('When you feel left out, | say it in words. | The people who love you will always listen.', 'जब लगे कि कोई ध्यान नहीं दे रहा, | तो बोलकर बताओ। | जो तुमसे प्यार करते हैं, वो हमेशा सुनेंगे।');
      ep.lesson = T('Golu was sad, | but nobody knew... | because he didn\'t *say* it.', 'गोलू उदास था, | पर किसी को पता नहीं था... | क्योंकि उसने *बताया* ही नहीं।');
      ep.hook = T('I made the *best* drawing ever. | [0.4] Let\'s see if anyone notices.', 'मैंने *सबसे अच्छी* ड्रॉइंग बनाई है। | [0.4] देखते हैं किसी का ध्यान जाता है या नहीं।');
      ep.music = 'calm';
      ep.scene('bedroom', ['pari:sitfloor:ball', 'mumma:clap', 'papa:clap', 'dadi:idle', 'golu:idle:drawing:walk-left'], [
        ['pari', 'excited', T('Ball! | Ball!', 'बॉल! | बॉल!')],
        ['mumma', 'excited', T('She said *ball*! | Did you hear that? | Say it again, baby!', 'इसने *बॉल* बोला! | सुना तुमने? | फिर से बोलो, बेटा!')],
        ['golu', 'happy', T('Mumma, look! | I drew a rocket. | With *three* engines and a—', 'मम्मा, देखो! | मैंने रॉकेट बनाया। | *तीन* इंजन वाला और एक—'), 0.4],
        ['papa', 'excited', T('Shh, shh, Golu! | Pari\'s talking! | Pari, say *Papa*!', 'श्श, श्श, गोलू! | परी बोल रही है! | परी, बोलो *पापा*!')],
      ], { transition: 'fade' });
      ep.scene('bedroom', ['golu:sad:drawing'], [
        ['golu', 'sad', T('[0.5] Nobody even looked.', '[0.5] किसी ने देखा तक नहीं।'), 0.6],
      ], { camera: 'closeup', minDuration: 4 });
      ep.act('bedroom', ['golu:jump', 'papa:idle', 'mumma:idle', 'pari:clap'], [
        ['golu', 'excited', 'Everybody, look! | I can jump twenty times! | Without stopping!', 'सब लोग, देखो! | मैं बीस बार कूद सकता हूँ! | बिना रुके!'],
        ['pari', 'happy', 'Clap!', 'ताली!'],
        ['mumma', 'excited', 'Pari said clap! | Did you hear that? | Another new word!', 'परी ने ताली बोला! | सुना? | एक और नया शब्द!'],
        ['golu', 'sad', '[0.6] Seven... | eight... | never mind.', '[0.6] सात... | आठ... | रहने दो।', 0.4],
      ], { optional: 2 });
      ep.scene('kitchen', ['golu:idle:cup', 'anaya:idle:book', 'dadi:idle'], [
        ['anaya', 'surprised', T('Golu! | Why did you pour water on my homework?', 'गोलू! | तुमने मेरे होमवर्क पर पानी क्यों डाला?')],
        ['golu', 'angry', T('Because! | [0.4] I don\'t care!', 'क्योंकि! | [0.4] मुझे कोई फ़र्क़ नहीं पड़ता!')],
        ['dadi', 'surprised', T('Hai Ram! | What has gotten into this boy today?', 'हाय राम! | आज इस लड़के को हो क्या गया है?')],
      ]);
      ep.scene('house', ['mumma:sitfloor', 'golu:sitfloor:drawing'], [
        ['mumma', 'calm', T('You\'ve been angry all day. | That\'s not like you. | [0.4] Want to tell me what\'s going on?', 'तुम पूरे दिन से ग़ुस्से में हो। | ये तुम्हारे जैसा नहीं है। | [0.4] बताओगे क्या हुआ?'), 0.5],
        ['golu', 'sad', T('[0.6] Everybody only loves Pari now. | She says *ball* and everyone claps. | I drew a whole rocket... | and nobody even looked.', '[0.6] अब सब बस परी से प्यार करते हैं। | वो *बॉल* बोलती है और सब ताली बजाते हैं। | मैंने पूरा रॉकेट बनाया... | और किसी ने देखा तक नहीं।')],
        ['mumma', 'sad', T('Oh, Golu... | [0.5] you\'re right. | We didn\'t look. | I\'m sorry, beta.', 'ओह, गोलू... | [0.5] तुम सही हो। | हमने नहीं देखा। | सॉरी, बेटा।'), 0.4],
      ], { camera: 'closeup', minDuration: 6 });
      ep.act('house', ['papa:idle::walk-left', 'golu:sitfloor:drawing', 'mumma:sitfloor'], [
        ['papa', 'calm', 'Golu, can I see your rocket now? | Properly this time.', 'गोलू, क्या अब मैं तुम्हारा रॉकेट देख सकता हूँ? | इस बार अच्छे से।'],
        ['golu', 'happy', 'It has three engines. | And a window for the astronaut. | And a room for Bruno.', 'इसमें तीन इंजन हैं। | और अंतरिक्ष यात्री के लिए खिड़की। | और ब्रूनो के लिए एक कमरा।'],
        ['papa', 'excited', "A room for Bruno? | That's real engineering. | This goes on the fridge!", 'ब्रूनो के लिए कमरा? | ये असली इंजीनियरिंग है। | ये तो फ़्रिज पर लगेगा!'],
      ], { optional: 1 });
      ep.scene('house', ['mumma:idle', 'golu:idle', 'anaya:idle'], [
        ['mumma', 'happy', T('You know, when you were a baby, | you said your first word too. | Do you know what it was?', 'पता है, जब तुम छोटे थे, | तुमने भी पहला शब्द बोला था। | जानते हो क्या था?')],
        ['golu', 'thinking', T('Mumma?', 'मम्मा?'), 0.4],
        ['mumma', 'laugh', T('*Laddoo*. | And Dadi clapped so much, | she dropped the whole plate! | Ha ha!', '*लड्डू*। | और दादी ने इतनी ताली बजाई | कि पूरी थाली गिरा दी! | हा हा!')],
        ['golu', 'laugh', T('Hehe! | Really?', 'हीही! | सच में?')],
      ]);
      ep.scene('bedroom', ['golu:sitfloor:drawing', 'pari:sitfloor', 'anaya:idle:book', 'papa:idle'], [
        ['golu', 'happy', T('Pari, look. | Rocket. | Say *rock-et*.', 'परी, देखो। | रॉकेट। | बोलो *रॉ-केट*।')],
        ['pari', 'excited', T('Go-lu!', 'गो-लू!'), 0.6],
        ['golu', 'surprised', T('She said my name! | Everybody! | She said *my* name!', 'इसने मेरा नाम लिया! | सब लोग! | इसने *मेरा* नाम लिया!')],
        ['anaya', 'thinking', T('Ahem. [0.3] And *my* homework, Golu?', 'अहम्। [0.3] और *मेरे* होमवर्क का क्या, गोलू?'), 0.4],
        ['golu', 'happy', T('Sorry, Didi. | I\'ll help you write it again. | Neatly. | Promise.', 'सॉरी दीदी। | मैं फिर से लिखने में मदद करूँगा। | सफ़ाई से। | पक्का।')],
      ], { minDuration: 5 });
    },
  },

  // ======================= THE INJECTION =======================
  {
    id: 'injection', theme: 'health', moral: true, look: 'home',
    build(ep, { T, N }) {
      ep.title = T('Golu vs. The Injection', 'गोलू बनाम इंजेक्शन');
      ep.summary = T('Today is vaccine day. Golu has a plan: hide under the bed until it\'s tomorrow. Anaya has a better plan.', 'आज टीके का दिन है। गोलू का प्लान: पलंग के नीचे छुप जाओ, जब तक कल ना हो जाए। अनाया के पास इससे अच्छा प्लान है।');
      ep.moral = T('Being brave doesn\'t mean you\'re not scared. | It means you do it anyway.', 'बहादुर होने का मतलब ये नहीं कि डर नहीं लगता। | मतलब है, डर के बावजूद करना।');
      ep.lesson = T('Thinking about it was *so* much scarier... [0.3] than the actual injection!', 'उसके बारे में सोचना... [0.3] असली इंजेक्शन से *कहीं* ज़्यादा डरावना था!');
      ep.hook = T('Today is the *worst* day of my life. | [0.4] Today is... | vaccine day.', 'आज मेरी ज़िंदगी का *सबसे बुरा* दिन है। | [0.4] आज है... | टीके का दिन।');
      ep.music = 'calm';
      ep.scene('bedroom', ['mumma:lookaround', 'anaya:idle', 'golu:sitfloor'], [
        ['mumma', 'calm', T('Golu? | Shoes on, we\'re leaving for Dr. Anand\'s. | [0.4] Golu?', 'गोलू? | जूते पहनो, डॉक्टर आनंद के पास चलना है। | [0.4] गोलू?')],
        ['golu', 'scared', T('Golu isn\'t here. | Golu went to... | Australia.', 'गोलू यहाँ नहीं है। | गोलू गया... | ऑस्ट्रेलिया।'), 0.5],
        ['anaya', 'laugh', T('He\'s under the bed, Mumma. | I can see his socks.', 'मम्मा, वो पलंग के नीचे है। | मुझे उसके मोज़े दिख रहे हैं।')],
      ], { time: 'morning', transition: 'fade' });
      ep.scene('bedroom', ['anaya:sitfloor', 'golu:sad'], [
        ['golu', 'scared', T('Didi, | it\'s going to hurt *so* much. | Kabir said the needle is *this* big!', 'दीदी, | *बहुत* दर्द होगा। | कबीर ने कहा सुई *इतनी* बड़ी होती है!')],
        ['anaya', 'calm', T('Kabir also said dinosaurs live in his building. | [0.4] I was scared too, last year. | Want to know my trick?', 'कबीर ने ये भी कहा था कि उसकी बिल्डिंग में डायनासोर रहते हैं। | [0.4] पिछले साल मुझे भी डर लगा था। | मेरी तरकीब जानना है?'), 0.4],
        ['golu', 'thinking', T('[0.4] What trick?', '[0.4] कैसी तरकीब?')],
        ['anaya', 'happy', T('You squeeze my hand as hard as you can... | and you count to five. | By the time you get to five... | it\'s over.', 'तुम मेरा हाथ ज़ोर से दबाओ... | और पाँच तक गिनो। | पाँच तक पहुँचते-पहुँचते... | ख़त्म।')],
      ], { minDuration: 6 });
      ep.act('hospital', ['golu:sitchair', 'mumma:idle', 'anaya:idle'], [
        ['golu', 'scared', 'Mumma, | that boy came out crying. | It must be *so* bad.', 'मम्मा, | वो लड़का रोते हुए बाहर आया। | ज़रूर *बहुत* बुरा होगा।'],
        ['mumma', 'calm', "He cried for ten seconds, beta. | Now look at him. | He's laughing with his papa.", 'वो दस सेकंड रोया, बेटा। | अब उसे देखो। | अपने पापा के साथ हँस रहा है।'],
        ['golu', 'thinking', '[0.5] Only ten seconds?', '[0.5] बस दस सेकंड?'],
      ], { optional: 2 });
      ep.scene('hospital', ['doctor:idle:syringe', 'golu:sitchair', 'anaya:idle', 'mumma:idle'], [
        ['doctor', 'happy', T('Ah, Golu! | My favourite patient. | Did you know vaccines are like a training camp for your body? | They teach it how to fight germs.', 'अरे, गोलू! | मेरा फ़ेवरेट मरीज़। | पता है, टीका शरीर के लिए ट्रेनिंग कैंप जैसा है? | ये उसे कीटाणुओं से लड़ना सिखाता है।')],
        ['golu', 'scared', T('Can my body do online training instead?', 'क्या मेरा शरीर ऑनलाइन ट्रेनिंग नहीं कर सकता?'), 0.4],
        ['doctor', 'laugh', T('Ha ha! | Not yet, I\'m afraid.', 'हा हा! | अभी तक तो नहीं।')],
      ]);
      ep.scene('hospital', ['golu:sitchair', 'anaya:idle', 'doctor:idle:syringe'], [
        ['anaya', 'calm', T('Squeeze my hand. | Ready? | One...', 'मेरा हाथ दबाओ। | तैयार? | एक...')],
        ['golu', 'scared', T('Two... | three... | ow! | four...', 'दो... | तीन... | आउ! | चार...'), 0.3],
        ['doctor', 'happy', T('All done!', 'हो गया!'), 0.3],
        ['golu', 'surprised', T('Five...? | [0.5] Wait. | That\'s *it*? | That\'s the whole thing?', 'पाँच...? | [0.5] रुको। | *बस*? | इतना ही था?')],
      ], { camera: 'closeup', minDuration: 5 });
      ep.act('hospital', ['doctor:idle', 'golu:cheer', 'anaya:clap'], [
        ['doctor', 'happy', 'For the bravest patient today. | A gold star sticker!', 'आज के सबसे बहादुर मरीज़ के लिए। | सुनहरा स्टार स्टिकर!'],
        ['golu', 'excited', "A gold star! | Didi, I'm wearing it to school tomorrow!", 'गोल्ड स्टार! | दीदी, मैं कल इसे स्कूल पहनकर जाऊँगा!'],
      ], { optional: 1 });
      ep.scene('street', ['golu:idle:icecream:walk-left', 'anaya:idle:icecream:walk-left', 'mumma:idle:purse:walk-left'], [
        ['golu', 'happy', T('Honestly, | it was nothing. | I wasn\'t even scared.', 'सच बताऊँ, | कुछ भी नहीं था। | मुझे तो डर भी नहीं लगा।')],
        ['anaya', 'laugh', T('You went to *Australia*, Golu. | Under the bed.', 'तुम *ऑस्ट्रेलिया* गए थे, गोलू। | पलंग के नीचे।')],
        ['mumma', 'happy', T('Ha ha! | Ice cream for my brave boy... | and my brave girl.', 'हा हा! | मेरे बहादुर बेटे के लिए आइसक्रीम... | और मेरी बहादुर बेटी के लिए भी।')],
      ]);
    },
  },
];

// Short, relatable moments for Shorts: one everyday situation each, start to punchline.
const RELATABLE = [
  {
    title: ['"Ready in Five Minutes" 🕐', '"बस पाँच मिनट में तैयार" 🕐'], world: 'house',
    scenes: [
      [['papa:idle:keys', 'golu:idle'], [
        ['papa', 'thinking', "Mumma said she'll be ready in five minutes.", 'मम्मा ने कहा था पाँच मिनट में तैयार हो जाएँगी।'],
        ['golu', 'sad', 'Papa, | that was *forty* minutes ago.', 'पापा, | वो *चालीस* मिनट पहले की बात है।'],
      ]],
      [['papa:sitfloor:keys', 'golu:sitfloor', 'anaya:sitfloor'], [
        ['anaya', 'calm', "I've finished my whole homework while waiting.", 'मैंने इंतज़ार करते-करते पूरा होमवर्क कर लिया।'],
        ['golu', 'sad', 'I think I grew taller.', 'मुझे लगता है मैं लंबा भी हो गया।'],
      ]],
      [['mumma:idle:purse:walk-left', 'papa:idle:keys', 'golu:idle'], [
        ['mumma', 'happy', "Okay, I'm ready! | [0.4] Wait... | where are my earrings?", 'चलो, मैं तैयार! | [0.4] रुको... | मेरे झुमके कहाँ हैं?'],
        ['papa', 'laugh', 'Another five minutes, then. | Ha ha!', 'तो पाँच मिनट और। | हा हा!'],
      ]],
    ],
  },
  {
    title: ['Sunday Night Homework 😱', 'संडे रात का होमवर्क 😱'], world: 'bedroom',
    scenes: [
      [['golu:idle:book', 'mumma:idle'], [
        ['golu', 'happy', 'Mumma, | I need chart paper for tomorrow. | And glitter. | And a model of the solar system.', 'मम्मा, | कल के लिए चार्ट पेपर चाहिए। | और ग्लिटर। | और सौरमंडल का मॉडल।'],
        ['mumma', 'surprised', "*Tomorrow*? | Golu, it's nine o'clock on *Sunday* night!", '*कल*? | गोलू, *संडे* की रात के नौ बज रहे हैं!'],
      ]],
      [['golu:idle:book', 'mumma:idle', 'papa:idle'], [
        ['golu', 'thinking', "Ma'am told us last week. | [0.4] I forgot.", 'मैडम ने पिछले हफ़्ते बताया था। | [0.4] मैं भूल गया।'],
        ['papa', 'calm', 'Okay. | No shouting. | Everybody, get the scissors.', 'ठीक है। | कोई चिल्लाएगा नहीं। | सब लोग, कैंची लाओ।'],
      ]],
      [['papa:idle:chartpaper', 'golu:idle:planetmodel', 'mumma:idle', 'anaya:idle'], [
        ['anaya', 'laugh', "Papa, that's not Saturn. | That's an orange with a bangle on it.", 'पापा, वो शनि नहीं है। | वो तो चूड़ी पहना हुआ संतरा है।'],
        ['papa', 'laugh', 'Every family, | every Sunday. | Ha ha!', 'हर परिवार, | हर संडे। | हा हा!'],
      ]],
    ],
  },
  {
    title: ['Who Finished the Milk? 🥛', 'दूध किसने ख़त्म किया? 🥛'], world: 'kitchen',
    scenes: [
      [['dadi:idle:milkpacket', 'golu:idle:cup', 'anaya:idle'], [
        ['dadi', 'thinking', 'I bought a full packet of milk this morning. | Now it is empty. | Who drank it?', 'आज सुबह मैं दूध का पूरा पैकेट लाई थी। | अब ख़ाली है। | किसने पिया?'],
        ['golu', 'surprised', 'Not me!', 'मैंने नहीं!'],
      ]],
      [['anaya:point', 'golu:idle:cup', 'dadi:idle:milkpacket'], [
        ['anaya', 'laugh', 'Golu... | you have a milk moustache.', 'गोलू... | तुम्हारी दूध वाली मूँछें बनी हैं।'],
        ['golu', 'laugh', "[0.3] It's a *disguise*.", '[0.3] ये *भेस* है।'],
        ['dadi', 'laugh', 'Hai Ram. | My little milk thief!', 'हाय राम। | मेरा छोटा दूध चोर!'],
      ]],
    ],
  },
  {
    title: ["Where Are Papa's Keys? 🔑", 'पापा की चाबी कहाँ है? 🔑'], world: 'house',
    scenes: [
      [['papa:lookaround:keys', 'mumma:idle', 'golu:idle'], [
        ['papa', 'scared', "Has anyone seen my keys? | I'm *so* late for office!", 'किसी ने मेरी चाबी देखी? | ऑफ़िस के लिए *बहुत* देर हो रही है!'],
        ['golu', 'thinking', 'In the fridge? | In your shoe?', 'फ़्रिज में? | आपके जूते में?'],
      ]],
      [['papa:lookaround:keys', 'mumma:idle', 'golu:idle'], [
        ['papa', 'scared', 'I put them right here... | I always put them right here!', 'यहीं तो रखी थी... | मैं हमेशा यहीं रखता हूँ!'],
        ['mumma', 'calm', "[0.4] They're in your hand.", '[0.4] आपके हाथ में ही है।'],
        ['golu', 'laugh', 'Ha ha! | Every single morning!', 'हा हा! | रोज़ सुबह यही होता है!'],
      ]],
    ],
  },
  {
    title: ['The Last Samosa 🥟', 'आख़िरी समोसा 🥟'], world: 'kitchen',
    scenes: [
      [['golu:point', 'anaya:point'], [
        ['golu', 'excited', 'The last samosa! | I saw it first!', 'आख़िरी समोसा! | मैंने पहले देखा!'],
        ['anaya', 'angry', 'No way! | You already had *three*!', 'बिल्कुल नहीं! | तुम *तीन* खा चुके हो!'],
      ]],
      [['golu:idle', 'anaya:idle'], [
        ['golu', 'thinking', "Okay. | We'll cut it in half. | Exactly in half.", 'ठीक है। | आधा-आधा करेंगे। | एकदम बराबर।'],
        ['anaya', 'calm', 'Deal. | Where is it?', 'पक्का। | कहाँ है?'],
      ]],
      [['dadaji:eat:samosa', 'golu:idle', 'anaya:idle'], [
        ['dadaji', 'laugh', 'Mmm. | [0.4] What samosa? | Ha ha!', 'म्म्म। | [0.4] कौन सा समोसा? | हा हा!'],
        ['golu', 'surprised', 'Dadaji!', 'दादाजी!'],
      ]],
    ],
  },
  {
    title: ['"Two Minutes" on the Phone 📞', 'फ़ोन पर "बस दो मिनट" 📞'], world: 'bedroom',
    scenes: [
      [['mumma:phone', 'golu:sitfloor', 'anaya:read'], [
        ['mumma', 'happy', "Haan, Didi... | haan... | really? | Okay, I'll call you back in two minutes.", 'हाँ दीदी... | हाँ... | सच में? | ठीक है, मैं दो मिनट में वापस करती हूँ।'],
        ['golu', 'thinking', 'Didi, | how long is two minutes when Mumma is talking to Mausi?', 'दीदी, | जब मम्मा मौसी से बात करती हैं, तो दो मिनट कितने का होता है?'],
        ['anaya', 'laugh', 'About an hour.', 'लगभग एक घंटा।'],
      ]],
      [['mumma:phone', 'golu:sleep', 'anaya:yawn'], [
        ['mumma', 'laugh', '...and then she said... | ha ha ha!', '...और फिर उसने कहा... | हा हा हा!'],
        ['anaya', 'calm', 'Told you.', 'बोला था ना।'],
      ]],
    ],
  },
];

export const EVERYDAY_SHORTS = [
  {
    id: 'short-relatable', theme: 'home', moral: false,
    build(ep, { T, pick }) {
      const v = pick(RELATABLE);
      ep.title = T(v.title[0], v.title[1]);
      ep.summary = T('Tell us in the comments if this happens in *your* house too!', 'कमेंट में बताओ, क्या *आपके* घर में भी ऐसा होता है!');
      ep.music = 'silly';
      for (const [actors, lines] of v.scenes) ep.act(v.world, actors, lines, { minDuration: 3 });
    },
  },
];
