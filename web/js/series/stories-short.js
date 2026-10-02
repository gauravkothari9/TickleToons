// YouTube Shorts (9:16, under a minute): a hook in the first line, one quick twist, a punchline.

// [fact, Hindi, Golu's reply, Hindi, what Golu does while he replies (shrug if not given)]
export const FACTS = [
  ['An octopus has *three* hearts!', 'ऑक्टोपस के *तीन* दिल होते हैं!', 'Three hearts? | Then it can love *three* times more! Hehe!', 'तीन दिल? | तब तो वो *तीन गुना* प्यार कर सकता है! हीही!', 'cheer'],
  ['Honey never goes bad. | Even honey that is *three thousand* years old!', 'शहद कभी ख़राब नहीं होता। | *तीन हज़ार* साल पुराना शहद भी!', 'Three thousand years? | Dadaji, was that *your* honey?', 'तीन हज़ार साल? | दादाजी, क्या वो *आपका* शहद था?', 'laugh'],
  ['A snail can sleep for *three years*!', 'घोंघा *तीन साल* तक सो सकता है!', 'Three years? | Then I am a snail on Sunday mornings!', 'तीन साल? | तब तो मैं संडे सुबह घोंघा हूँ!', 'yawn'],
  ['Elephants are the only animals... | that cannot *jump*!', 'हाथी ऐसा जानवर है... | जो *कूद* नहीं सकता!', 'Not even a tiny jump? | I will teach them!', 'छोटी सी छलाँग भी नहीं? | मैं सिखा दूँगा!', 'jump'],
  ['Butterflies taste with their *feet*!', 'तितलियाँ अपने *पैरों* से स्वाद लेती हैं!', 'Eww! | Then I am never letting a butterfly near my laddoo!', 'छी! | अब कोई तितली मेरे लड्डू के पास नहीं आएगी!', 'no'],
  ['The sun is so big... | one *million* Earths could fit inside it!', 'सूरज इतना बड़ा है... | कि उसमें दस *लाख* धरती समा जाएँ!', 'One million? | That is even bigger than Papa\'s tummy!', 'दस लाख? | ये तो पापा के पेट से भी बड़ा है!', 'laugh'],
  ['A group of flamingos is called a *flamboyance*!', 'राजहंसों के झुंड को *फ़्लैम्बॉयंस* कहते हैं!', 'Flam-boy-what? | I will just call them pink birds!', 'फ़्लैम-बॉय-क्या? | मैं तो इन्हें गुलाबी चिड़िया ही बोलूँगा!', 'shrug'],
  ['Cows have *best friends*, | and they feel sad when they are apart!', 'गायों के भी *पक्के दोस्त* होते हैं, | और अलग होकर वो उदास होती हैं!', 'Just like me and Kabir! | Moooo!', 'बिल्कुल मेरी और कबीर की तरह! | म्मूऊ!', 'laugh'],
  ['Bananas are *berries*, | but strawberries are not!', 'केला एक *बेरी* है, | पर स्ट्रॉबेरी नहीं!', 'What? | Then who named the strawberry?', 'क्या? | तो स्ट्रॉबेरी का नाम किसने रखा?', 'shrug'],
  ['Your nose can remember *fifty thousand* smells!', 'तुम्हारी नाक *पचास हज़ार* ख़ुशबुएँ याद रख सकती है!', 'And my favourite is... | Dadi\'s laddoos!', 'और मेरी फ़ेवरेट है... | दादी के लड्डू!', 'think'],
];

export const RIDDLES = [
  ['What has hands, | but cannot clap?', 'किसके हाथ होते हैं, | पर वो ताली नहीं बजा सकता?', 'A clock!', 'घड़ी!', 'A sleepy monkey?', 'सोया हुआ बंदर?'],
  ['What has a head and a tail, | but no body?', 'किसका सिर और पूँछ होती है, | पर शरीर नहीं?', 'A coin!', 'सिक्का!', 'Bruno, when he hides under the bed!', 'ब्रूनो, जब वो पलंग के नीचे छुपता है!'],
  ['What gets wetter... | the more it dries?', 'क्या चीज़ जितना सुखाओ... | उतनी गीली होती है?', 'A towel!', 'तौलिया!', 'My hair after a bath?', 'नहाने के बाद मेरे बाल?'],
  ['What has keys, | but cannot open any door?', 'किसके पास चाबियाँ हैं, | पर कोई दरवाज़ा नहीं खुलता?', 'A piano!', 'पियानो!', 'Papa! | He always loses his keys!', 'पापा! | वो हमेशा चाबी खो देते हैं!'],
  ['What goes up, | but never comes down?', 'क्या चीज़ ऊपर जाती है, | पर कभी नीचे नहीं आती?', 'Your age!', 'तुम्हारी उम्र!', 'My kite?', 'मेरी पतंग?'],
  ['I have lots of teeth, | but I never bite. | What am I?', 'मेरे बहुत दाँत हैं, | पर मैं काटती नहीं। | मैं कौन हूँ?', 'A comb!', 'कंघी!', 'Dadaji\'s smile?', 'दादाजी की मुस्कान?'],
];

export const SHORT_TEMPLATES = [
  {
    id: 'short-fact', theme: 'facts', moral: false,
    build(ep, { T, rand, target, estimate }) {
      ep.title = T('Did You Know? 🤯', 'क्या आप जानते हो? 🤯');
      ep.summary = T('Anaya shares amazing facts... and Golu has funny replies!', 'अनाया कमाल की बातें बताती है... और गोलू के मज़ेदार जवाब!');
      ep.music = 'silly';
      // as many facts as fit the chosen length (each one different)
      const order = FACTS.map((f, i) => [rand(), i]).sort((a, b) => a[0] - b[0]).map(([, i]) => FACTS[i]);
      order.forEach(([en, hi, ren, rhi, act], k) => {
        if (k > 0 && estimate() > target - 14) return;
        ep.scene('bedroom', ['anaya:read', 'golu:idle'], [
          ['anaya', 'excited', k === 0 ? T('Golu! | Did you know...?', 'गोलू! | क्या तुम्हें पता है...?') : T('And did you know...?', 'और क्या तुम्हें पता है...?')],
          ['anaya', 'surprised', T(en, hi), 0.3],
        ], { camera: 'closeup', minDuration: 2 });
        ep.scene('bedroom', [`golu:${act || 'shrug'}`, 'anaya:laugh', 'pari:idle'], [
          ['golu', 'surprised', T(ren, rhi)],
          ...(k === 0 ? [['pari', 'laugh', T('Hehehe!', 'हीहीही!')]] : []),
        ], { minDuration: 2 });
      });
    },
  },
  {
    id: 'short-riddle', theme: 'facts', moral: false,
    build(ep, { T, rand, target, estimate }) {
      ep.title = T('Can You Solve Dadaji\'s Riddles? 🤔', 'क्या आप दादाजी की पहेलियाँ बूझ सकते हो? 🤔');
      ep.summary = T('Dadaji asks riddles. Can you guess them before Anaya?', 'दादाजी पहेलियाँ पूछते हैं। क्या आप अनाया से पहले बूझ सकते हो?');
      ep.music = 'calm';
      const order = RIDDLES.map((r, i) => [rand(), i]).sort((a, b) => a[0] - b[0]).map(([, i]) => RIDDLES[i]);
      order.forEach(([q, qh, a, ah, wrong, wrongh], k) => {
        if (k > 0 && estimate() > target - 16) return;
        ep.scene('house', ['dadaji:idle', 'golu:idle', 'anaya:think'], [
          ['dadaji', 'happy', k === 0 ? T('Riddle time! | Listen carefully...', 'पहेली का समय! | ध्यान से सुनो...') : T('Next one!', 'अगली पहेली!')],
          ['dadaji', 'thinking', T(q, qh), 0.3],
          ['golu', 'excited', T(wrong, wrongh), 1.0],
        ], { camera: 'auto', minDuration: 2 });
        ep.scene('house', ['anaya:idle', 'dadaji:laugh', 'golu:shrug'], [
          ['anaya', 'excited', T(`I know! | It is... [0.5] ${a}`, `मुझे पता है! | वो है... [0.5] ${ah}`), 0.6],
          ['dadaji', 'laugh', T('Arre wah! | Correct! | Did *you* get it?', 'अरे वाह! | सही जवाब! | क्या *आपने* बूझा?')],
        ], { minDuration: 2 });
      });
    },
  },
  // ---- every Short below is one complete little story: setup, build-up, twist, punchline ----
  {
    id: 'short-prank', theme: 'home', moral: false,
    build(ep, { T }) {
      ep.title = T('Golu Tries to Scare Papa 😱', 'गोलू ने पापा को डराने की कोशिश की 😱');
      ep.summary = T('Golu has the perfect plan to scare Papa. Papa has a better one.', 'गोलू के पास पापा को डराने का परफ़ेक्ट प्लान है। पापा के पास उससे भी अच्छा।');
      ep.music = 'silly';
      ep.act('bedroom', ['golu:lookaround', 'anaya:read'], [
        ['golu', 'laugh', "Shh! | Papa's coming home. | I'll hide behind the door and shout BOO!", 'श्श! | पापा घर आ रहे हैं। | मैं दरवाज़े के पीछे छुपकर बोलूँगा भौ!'],
        ['anaya', 'calm', 'He will hear you giggling, Golu.', 'वो तुम्हारी हँसी सुन लेंगे, गोलू।'],
        ['golu', 'happy', 'I never giggle. | [0.4] Hehe.', 'मैं कभी नहीं हँसता। | [0.4] हीही।'],
      ], { minDuration: 3 });
      ep.act('bedroom', ['golu:idle'], [
        ['golu', 'thinking', "Footsteps... | he's coming... | three... two... one...", 'कदमों की आवाज़... | वो आ रहे हैं... | तीन... दो... एक...'],
        ['golu', 'excited', 'BOO!', 'भौ!', 0.4],
      ], { camera: 'closeup', minDuration: 3 });
      ep.act('bedroom', ['golu:lookaround'], [
        ['golu', 'surprised', '[0.4] Nobody? | Papa? | Where did Papa go?', '[0.4] कोई नहीं? | पापा? | पापा कहाँ गए?'],
      ], { minDuration: 2.5 });
      ep.act('bedroom', ['papa:jump::walk-right', 'golu:jump'], [
        ['papa', 'excited', 'BOOOO!', 'भौउउउ!'],
        ['golu', 'scared', "Aaaah! | No fair! | I was supposed to scare *you*!", 'आआह! | ये ग़लत है! | मुझे *आपको* डराना था!'],
      ], { minDuration: 3 });
      ep.act('bedroom', ['papa:laugh', 'golu:idle', 'anaya:laugh'], [
        ['papa', 'laugh', 'I heard you giggling from the gate, champ!', 'मैंने गेट से ही तुम्हारी हँसी सुन ली थी, चैंप!'],
        ['anaya', 'laugh', 'Told you!', 'बोला था ना!'],
      ], { minDuration: 2.5 });
    },
  },
  {
    id: 'short-glasses', theme: 'home', moral: false,
    build(ep, { T }) {
      ep.title = T("Where Are Dadi's Glasses? 👓", 'दादी का चश्मा कहाँ है? 👓');
      ep.summary = T('Dadi has looked everywhere for her glasses. Only one person in the house knows where they are... and she is one year old.', 'दादी ने अपना चश्मा हर जगह ढूँढ लिया। घर में सिर्फ़ एक को पता है कि वो कहाँ है... और वो एक साल की है।');
      ep.music = 'silly';
      ep.act('bedroom', ['dadi:lookaround', 'golu:idle'], [
        ['dadi', 'thinking', "Where are my glasses? | I can't read anything without them.", 'मेरा चश्मा कहाँ है? | उसके बिना कुछ पढ़ नहीं पाती।'],
        ['golu', 'thinking', "I'll help, Dadi! | Under the bed? | In the fridge? | In Bruno's bowl?", 'मैं मदद करता हूँ, दादी! | पलंग के नीचे? | फ़्रिज में? | ब्रूनो के कटोरे में?'],
      ], { minDuration: 3 });
      ep.act('kitchen', ['dadi:lookaround', 'anaya:idle'], [
        ['anaya', 'thinking', 'Dadi, when did you last wear them?', 'दादी, आख़िरी बार कब पहना था?'],
        ['dadi', 'thinking', 'I was reading the newspaper... | then I made tea... | then... | I don\'t remember.', 'मैं अख़बार पढ़ रही थी... | फिर चाय बनाई... | फिर... | याद नहीं।'],
      ], { minDuration: 3 });
      ep.act('bedroom', ['pari:point', 'dadi:idle', 'golu:idle', 'anaya:idle'], [
        ['pari', 'excited', 'Dadi! | Dadi!', 'दादी! | दादी!'],
        ['golu', 'calm', 'Not now, Pari. | We\'re looking for Dadi\'s glasses.', 'अभी नहीं, परी। | हम दादी का चश्मा ढूँढ रहे हैं।'],
        ['pari', 'excited', 'Head!', 'सिर!', 0.4],
      ], { minDuration: 3 });
      ep.act('bedroom', ['dadi:laugh', 'golu:laugh', 'anaya:laugh', 'pari:clap'], [
        ['anaya', 'laugh', "They're on your head, Dadi!", 'वो तो आपके सिर पर है, दादी!'],
        ['dadi', 'laugh', 'Hai Ram! | My little detective found them!', 'हाय राम! | मेरी छोटी जासूस ने ढूँढ लिया!'],
      ], { minDuration: 2.5 });
    },
  },
  {
    id: 'short-pari', theme: 'home', moral: false,
    build(ep, { T }) {
      ep.title = T("Pari's First Word! 🥹", 'परी का पहला शब्द! 🥹');
      ep.summary = T('Mumma wants Pari to say Mumma. Papa wants her to say Papa. Pari has other plans.', 'मम्मा चाहती हैं परी मम्मा बोले। पापा चाहते हैं पापा बोले। परी का प्लान कुछ और है।');
      ep.music = 'happy';
      ep.act('bedroom', ['mumma:idle', 'pari:sitfloor'], [
        ['mumma', 'happy', 'Pari, say Mumma. | Mum-ma. | Come on!', 'परी, बोलो मम्मा। | मम-मा। | बोलो!'],
      ], { minDuration: 3 });
      ep.act('bedroom', ['papa:idle', 'mumma:idle', 'pari:sitfloor'], [
        ['papa', 'excited', 'No, no! | Papa first! | Pa-pa!', 'नहीं, नहीं! | पहले पापा! | पा-पा!'],
        ['mumma', 'laugh', 'She will say Mumma first. | Everybody knows that.', 'ये पहले मम्मा ही बोलेगी। | सबको पता है।'],
      ], { minDuration: 3 });
      ep.act('bedroom', ['golu:eat:laddoo:walk-left', 'pari:sitfloor', 'mumma:idle', 'papa:idle'], [
        ['golu', 'happy', 'Mmm. | Dadi made fresh laddoos.', 'म्म्म। | दादी ने ताज़े लड्डू बनाए हैं।'],
        ['pari', 'excited', 'Laddoo!', 'लड्डू!', 0.6],
      ], { minDuration: 3 });
      ep.act('bedroom', ['mumma:laugh', 'papa:laugh', 'golu:jump', 'pari:clap'], [
        ['mumma', 'surprised', 'Her first word... | is laddoo?', 'इसका पहला शब्द... | लड्डू?'],
        ['papa', 'laugh', 'Ha ha! | Just like her brother!', 'हा हा! | बिल्कुल अपने भाई पर गई है!'],
        ['golu', 'excited', "That's my sister!", 'ये है मेरी बहन!'],
      ], { minDuration: 3 });
    },
  },
  {
    id: 'short-balloon', theme: 'experiment', moral: false,
    build(ep, { T }) {
      ep.title = T('Golu vs The Balloon 🎈', 'गोलू बनाम गुब्बारा 🎈');
      ep.summary = T('Golu wants the biggest balloon at the party. The balloon has a limit.', 'गोलू को पार्टी का सबसे बड़ा गुब्बारा चाहिए। गुब्बारे की भी एक हद है।');
      ep.music = 'silly';
      ep.act('birthday', ['golu:idle:balloon', 'anaya:idle'], [
        ['golu', 'excited', "This balloon is too small. | I'm going to make it the biggest balloon at the party!", 'ये गुब्बारा बहुत छोटा है। | मैं इसे पार्टी का सबसे बड़ा गुब्बारा बनाऊँगा!'],
        ['anaya', 'scared', "Golu, that's big enough...", 'गोलू, इतना काफ़ी है...'],
      ], { minDuration: 3, set: [{ kind: 'balloonbunch', x: -2.2, z: -1.2 }] });
      ep.act('birthday', ['golu:idle:balloon', 'pari:sitfloor'], [
        ['golu', 'happy', 'Bigger... | [0.5] and bigger... | [0.5] and BIGGER!', 'और बड़ा... | [0.5] और बड़ा... | [0.5] और बड़ाआ!'],
        ['pari', 'scared', 'Uh-oh!', 'ओह-ओह!'],
      ], { camera: 'closeup', minDuration: 3 });
      ep.act('birthday', ['golu:shrug', 'anaya:idle', 'pari:sitfloor'], [
        ['golu', 'surprised', '*POP*! | [0.6] ...', '*फट*! | [0.6] ...'],
        ['golu', 'sad', "Now it's the smallest balloon at the party.", 'अब ये पार्टी का सबसे छोटा गुब्बारा है।', 0.5],
      ], { minDuration: 3, props: [{ kind: 'balloonbits', x: 0.4, z: 0.7 }] });
      ep.act('birthday', ['pari:clap', 'anaya:laugh', 'golu:laugh'], [
        ['pari', 'laugh', 'Again! | Again!', 'फिर से! | फिर से!'],
        ['anaya', 'laugh', 'Pari liked it more than you did!', 'परी को तुमसे ज़्यादा मज़ा आया!'],
      ], { minDuration: 2.5 });
    },
  },
  {
    id: 'short-rotis', theme: 'experiment', moral: false,
    build(ep, { T }) {
      ep.title = T('Golu Makes Rotis 🫓', 'गोलू ने रोटी बनाई 🫓');
      ep.summary = T("Dadi is teaching Golu to make rotis. How hard can it be?", 'दादी गोलू को रोटी बनाना सिखा रही हैं। भला कितना मुश्किल होगा?');
      ep.music = 'silly';
      ep.act('kitchen', ['golu:idle:flourbowl', 'dadi:idle:rotiplate'], [
        ['golu', 'excited', "Dadi, today *I* will make the rotis! | A little flour... | a little *more* flour...", 'दादी, आज रोटियाँ *मैं* बनाऊँगा! | थोड़ा आटा... | थोड़ा *और* आटा...'],
        ['dadi', 'scared', 'Golu... | gently...', 'गोलू... | धीरे से...'],
      ], { minDuration: 3 });
      ep.act('kitchen', ['golu:shrug:flourbowl'], [
        ['golu', 'surprised', 'Aaa... | aaa... | aaachoo!', 'आ... | आ... | आआछीं!'],
      ], { camera: 'closeup', minDuration: 2.5 });
      ep.act('kitchen', ['golu:idle:rollingpin', 'dadi:laugh', 'anaya:laugh'], [
        ['anaya', 'laugh', "Golu, you're all white! | You look like a ghost!", 'गोलू, तुम पूरे सफ़ेद हो गए! | भूत लग रहे हो!'],
        ['golu', 'laugh', "I'm the Roti Ghost! | Oooh!", 'मैं रोटी वाला भूत हूँ! | ऊऊह!'],
      ], { minDuration: 3 });
      ep.act('kitchen', ['golu:idle:roti', 'dadi:idle:rotiplate'], [
        ['golu', 'happy', "Done! | My first roti!", 'हो गई! | मेरी पहली रोटी!'],
        ['dadi', 'laugh', "It looks like a map of India! | But I'm sure it tastes perfect.", 'ये तो भारत के नक़्शे जैसी है! | पर स्वाद एकदम परफ़ेक्ट होगा।'],
      ], { minDuration: 3 });
    },
  },
  {
    id: 'short-magicword', theme: 'home', moral: true,
    build(ep, { T }) {
      ep.title = T('The Magic Word 🪄', 'जादुई शब्द 🪄');
      ep.moral = T('Please and thank you are magic words!', 'प्लीज़ और थैंक यू जादुई शब्द हैं!');
      ep.summary = T('Dadi only gives laddoos for the magic word. Can Golu guess it?', 'दादी लड्डू सिर्फ़ जादुई शब्द पर देती हैं। क्या गोलू बूझ पाएगा?');
      ep.music = 'happy';
      ep.act('kitchen', ['dadi:idle:laddooplate', 'golu:idle'], [
        ['golu', 'excited', 'Dadi! | Give me a laddoo!', 'दादी! | लड्डू दो!'],
        ['dadi', 'thinking', 'Hmm. | I only give laddoos for the *magic word*.', 'हम्म। | लड्डू तो मैं बस *जादुई शब्द* पर देती हूँ।'],
      ], { minDuration: 3 });
      ep.act('kitchen', ['golu:idle', 'dadi:idle:laddooplate'], [
        ['golu', 'excited', 'Abracadabra!', 'अबरा-का-डबरा!'],
        ['dadi', 'calm', 'No.', 'नहीं।', 0.4],
        ['golu', 'thinking', 'Open sesame? | [0.4] Hocus pocus?', 'खुल जा सिम-सिम? | [0.4] छू-मंतर?'],
      ], { minDuration: 3 });
      ep.act('kitchen', ['anaya:idle::walk-left', 'golu:idle'], [
        ['anaya', 'calm', "Golu, it's a word you should say every time you ask for something.", 'गोलू, ये वो शब्द है जो हर बार कुछ माँगते वक़्त बोलना चाहिए।'],
        ['golu', 'thinking', '[0.5] Oh! | *Please*, Dadi? | Can I have a laddoo, please?', '[0.5] अरे! | *प्लीज़*, दादी? | क्या मुझे एक लड्डू मिलेगा, प्लीज़?'],
      ], { minDuration: 3 });
      ep.act('kitchen', ['golu:idle:laddoo', 'dadi:idle:laddooplate'], [
        ['dadi', 'happy', "There it is! | One laddoo for my polite boy.", 'ये हुई ना बात! | मेरे तमीज़दार बच्चे के लिए एक लड्डू।'],
        ['golu', 'happy', 'Thank you, Dadi!', 'थैंक यू, दादी!'],
        ['dadi', 'laugh', "Ooh, that's the *second* magic word!", 'ओह, ये तो *दूसरा* जादुई शब्द है!'],
      ], { minDuration: 3 });
    },
  },
  {
    id: 'short-sorry', theme: 'home', moral: true,
    build(ep, { T }) {
      ep.title = T('Sorry Is a Superpower 💪', 'सॉरी बोलना सुपरपावर है 💪');
      ep.moral = T('Saying sorry makes things right again.', 'सॉरी बोलने से सब फिर से ठीक हो जाता है।');
      ep.summary = T("Didi's favourite pencil is broken. Golu says it wasn't him. Then he thinks again.", 'दीदी की फ़ेवरेट पेंसिल टूट गई। गोलू कहता है उसने नहीं तोड़ी। फिर वो दोबारा सोचता है।');
      ep.music = 'happy';
      ep.act('bedroom', ['anaya:idle:pencil', 'golu:idle'], [
        ['anaya', 'angry', 'Golu! | Did you break my new pencil?', 'गोलू! | तुमने मेरी नई पेंसिल तोड़ी?'],
        ['golu', 'scared', 'Me? | No! | It was... | Bruno!', 'मैंने? | नहीं! | वो... | ब्रूनो ने!'],
      ], { minDuration: 3 });
      ep.act('bedroom', ['bruno:idle', 'anaya:idle:pencil', 'golu:idle'], [
        ['bruno', 'sad', 'Woof?', 'भौं?'],
        ['anaya', 'thinking', "Bruno can't use a sharpener, Golu.", 'ब्रूनो को शार्पनर चलाना नहीं आता, गोलू।'],
      ], { minDuration: 3 });
      ep.act('bedroom', ['golu:sad'], [
        ['golu', 'sad', "[0.4] Okay. | It was me. | I pressed too hard. | Sorry, Didi.", '[0.4] अच्छा। | मैंने तोड़ी। | मैंने ज़्यादा ज़ोर से दबाया। | सॉरी, दीदी।'],
      ], { camera: 'closeup', minDuration: 3 });
      ep.act('bedroom', ['golu:idle:pencil', 'anaya:idle'], [
        ['golu', 'happy', 'You can have my best pencil. | The one with the rocket on it.', 'तुम मेरी सबसे अच्छी पेंसिल ले लो। | रॉकेट वाली।'],
        ['anaya', 'happy', 'Thank you for telling the truth, Golu. | Keep your rocket. | We can share.', 'सच बताने के लिए थैंक यू, गोलू। | अपना रॉकेट रखो। | हम मिलकर इस्तेमाल करेंगे।'],
      ], { minDuration: 3 });
    },
  },
  {
    id: 'short-dance', theme: 'celebrate', moral: false,
    build(ep, { T }) {
      ep.title = T('Family Dance Challenge! 🕺', 'फ़ैमिली डांस चैलेंज! 🕺');
      ep.summary = T('Who has the best move in the family? Try them all at home!', 'परिवार में सबसे अच्छा स्टेप किसका? घर पर सब करके देखो!');
      ep.music = 'happy';
      ep.act('house', ['golu:hiphop', 'anaya:idle'], [
        ['golu', 'excited', 'Dance challenge! | Everybody does their best move. | Mine is... the hip-hop bounce!', 'डांस चैलेंज! | सब अपना सबसे अच्छा स्टेप करेंगे। | मेरा है... हिप-हॉप बाउंस!'],
      ], { minDuration: 3 });
      ep.act('house', ['anaya:twirl', 'golu:idle'], [
        ['anaya', 'happy', 'My turn. | The twirl!', 'मेरी बारी। | घूमर!'],
        ['golu', 'laugh', "Didi, you're spinning like a fan!", 'दीदी, आप तो पंखे की तरह घूम रही हो!'],
      ], { minDuration: 3 });
      ep.act('house', ['papa:robot', 'mumma:laugh'], [
        ['papa', 'excited', 'Watch this. | The robot. | Beep... boop...', 'ये देखो। | रोबोट। | बीप... बूप...'],
        ['mumma', 'laugh', "That's a robot with a bad back!", 'ये तो कमर दर्द वाला रोबोट है!'],
      ], { minDuration: 3 });
      ep.act('house', ['dadaji:bhangra', 'dadi:clap', 'pari:clap'], [
        ['dadaji', 'laugh', 'Now watch the master! | Balle balle!', 'अब उस्ताद को देखो! | बल्ले बल्ले!'],
      ], { minDuration: 3 });
      ep.act('house', ['golu:dance', 'anaya:dance', 'papa:dance', 'mumma:dance', 'dadaji:dance', 'dadi:clap', 'pari:clap'], [
        ['anaya', 'excited', 'Who was the best? | Now *you* try the moves!', 'सबसे अच्छा कौन था? | अब *आप* भी ये स्टेप करो!'],
      ], { camera: 'orbit', minDuration: 3 });
    },
  },
  {
    id: 'short-bruno', theme: 'animals', moral: false,
    build(ep, { T }) {
      ep.title = T("Who Stole Golu's Sock? 🐶", 'गोलू का मोज़ा किसने चुराया? 🐶');
      ep.summary = T('A sock thief is on the loose in the house! Detective Anaya is on the case.', 'घर में एक मोज़ा चोर घूम रहा है! जासूस अनाया केस पर है।');
      ep.music = 'silly';
      ep.act('bedroom', ['golu:lookaround', 'anaya:idle'], [
        ['golu', 'thinking', 'My sock is missing! | The red one. | Somebody stole it!', 'मेरा मोज़ा ग़ायब है! | लाल वाला। | किसी ने चुरा लिया!'],
        ['anaya', 'thinking', 'Hmm. | Detective Anaya is on the case.', 'हम्म। | जासूस अनाया केस पर है।'],
      ], { minDuration: 3 });
      ep.act('bedroom', ['anaya:idle:magnifier', 'golu:idle'], [
        ['anaya', 'thinking', 'Clue one: | a wet spot on the floor. | Clue two: | a little brown hair.', 'पहला सुराग: | फ़र्श पर गीला निशान। | दूसरा सुराग: | एक छोटा सा भूरा बाल।'],
        ['golu', 'thinking', 'Somebody small... | fluffy... | who loves socks...', 'कोई छोटा... | रोएँदार... | जिसे मोज़े बहुत पसंद हैं...'],
      ], { minDuration: 3 });
      ep.act('bedroom', ['bruno:run:sock', 'golu:run', 'pari:laugh'], [
        ['bruno', 'excited', 'Woof woof!', 'भौं भौं!'],
        ['golu', 'laugh', 'Bruno! | Come back with my sock!', 'ब्रूनो! | मेरा मोज़ा वापस करो!'],
      ], { minDuration: 3 });
      ep.act('bedroom', ['anaya:point', 'golu:idle', 'papa:idle::walk-left'], [
        ['anaya', 'surprised', "Look in Bruno's bed! | Ten socks!", 'ब्रूनो के बिस्तर में देखो! | दस मोज़े!'],
        ['papa', 'surprised', "My office socks! | I've been looking for those for a week!", 'मेरे ऑफ़िस वाले मोज़े! | मैं एक हफ़्ते से इन्हें ढूँढ रहा था!'],
      ], { minDuration: 3, props: [{ kind: 'sock', x: 1.4, z: 0.6 }, { kind: 'sock', x: 1.6, z: 0.4 }] });
    },
  },
  {
    id: 'short-wedding', theme: 'celebrate', moral: false, look: 'wedding',
    build(ep, { T }) {
      ep.title = T('Golu Asks Pandit-ji: When Are the Laddoos? 😂', 'गोलू ने पंडित जी से पूछा: लड्डू कब मिलेंगे? 😂');
      ep.summary = T('A wedding, a very patient Pandit-ji, and one very hungry Golu.', 'एक शादी, बहुत धैर्य वाले पंडित जी, और एक बहुत भूखा गोलू।');
      ep.music = 'happy';
      ep.act('wedding', ['panditji:namaste', 'golu:idle'], [
        ['panditji', 'calm', 'Om shanti, shanti... | first, we pray for the happy couple.', 'ॐ शांति, शांति... | पहले हम नए जोड़े के लिए प्रार्थना करेंगे।'],
        ['golu', 'thinking', 'Pandit-ji... | psst... | when are the laddoos?', 'पंडित जी... | श्श्श... | लड्डू कब मिलेंगे?', 0.5],
      ], { minDuration: 3 });
      ep.act('wedding', ['panditji:laugh', 'golu:idle', 'dadi:idle'], [
        ['panditji', 'laugh', 'First blessings, | then laddoos!', 'पहले आशीर्वाद, | फिर लड्डू!'],
        ['golu', 'excited', 'Then... | bless *fast*, please!', 'तो... | आशीर्वाद *जल्दी* दीजिए, प्लीज़!', 0.4],
        ['dadi', 'surprised', 'Golu!', 'गोलू!'],
      ], { minDuration: 3 });
      ep.act('wedding', ['golu:sitfloor', 'panditji:namaste'], [
        ['panditji', 'calm', 'Om... | [0.8] shanti...', 'ॐ... | [0.8] शांति...'],
        ['golu', 'sad', "[0.4] He's going slower now. | I think it's because of me.", '[0.4] अब तो वो और धीरे बोल रहे हैं। | शायद मेरी वजह से।'],
      ], { minDuration: 3 });
      ep.act('wedding', ['panditji:idle:laddooplate', 'golu:cheer:laddoo'], [
        ['panditji', 'happy', 'Here, beta. | The first laddoo... | for the most patient boy. | [0.4] Almost.', 'ये लो बेटा। | पहला लड्डू... | सबसे धैर्य वाले बच्चे के लिए। | [0.4] लगभग।'],
        ['golu', 'laugh', 'Thank you, Pandit-ji!', 'थैंक यू, पंडित जी!'],
      ], { minDuration: 3 });
    },
  },
  {
    id: 'short-theryet', theme: 'trip', moral: false,
    build(ep, { T }) {
      ep.title = T('Are We There Yet? 🚗', 'अभी पहुँचे क्या? 🚗');
      ep.summary = T('Every family trip has this one question. Asked one hundred times.', 'हर फ़ैमिली ट्रिप में ये एक सवाल होता है। सौ बार पूछा जाता है।');
      ep.music = 'silly';
      ep.act('street', ['papa:idle:keys', 'golu:idle', 'anaya:idle'], [
        ['papa', 'excited', 'Seat belts on! | Next stop, the beach!', 'सीट बेल्ट लगाओ! | अगला स्टॉप, समंदर!'],
        ['golu', 'excited', 'Yay! | [0.6] Papa, are we there yet?', 'येए! | [0.6] पापा, अभी पहुँचे क्या?'],
        ['papa', 'calm', "Golu, we haven't even left the street.", 'गोलू, अभी तो गली से भी नहीं निकले।'],
      ], { minDuration: 3 });
      ep.act('street', ['golu:idle', 'papa:idle'], [
        ['golu', 'thinking', 'Are we there yet?', 'अभी पहुँचे क्या?'],
        ['papa', 'calm', 'No.', 'नहीं।', 0.3],
        ['golu', 'thinking', '[0.6] Now?', '[0.6] अब?'],
        ['papa', 'calm', 'No.', 'नहीं।', 0.3],
      ], { camera: 'closeup', minDuration: 3 });
      ep.act('street', ['anaya:idle', 'golu:idle', 'mumma:idle'], [
        ['anaya', 'calm', "Golu, let's play a game. | Count every red car you see.", 'गोलू, एक खेल खेलते हैं। | जितनी लाल गाड़ियाँ दिखें, गिनो।'],
        ['golu', 'happy', 'One... | two... | three... | oh, that one is red too!', 'एक... | दो... | तीन... | अरे, वो भी लाल है!'],
      ], { minDuration: 3 });
      ep.act('beach', ['golu:jump', 'papa:idle', 'anaya:idle', 'mumma:idle'], [
        ['papa', 'excited', "We're here! | The beach!", 'पहुँच गए! | समंदर!'],
        ['golu', 'surprised', "Already? | But I was at forty-seven red cars!", 'इतनी जल्दी? | पर मेरी सैंतालीस लाल गाड़ियाँ हुई थीं!'],
        ['mumma', 'laugh', 'Best trick ever!', 'सबसे अच्छी तरकीब!'],
      ], { minDuration: 3 });
    },
  },
  {
    id: 'short-icecream', theme: 'trip', moral: false,
    build(ep, { T }) {
      ep.title = T("Golu Saves His Ice Cream for Later 🍦", 'गोलू ने आइसक्रीम बाद के लिए बचाई 🍦');
      ep.summary = T('A hot day at the beach. Golu has a very smart plan for his ice cream.', 'समंदर किनारे गर्मी का दिन। गोलू के पास अपनी आइसक्रीम के लिए बहुत होशियार प्लान है।');
      ep.music = 'silly';
      ep.act('beach', ['golu:idle:icecream', 'anaya:eat:icecream'], [
        ['golu', 'happy', "I'm not eating mine now. | I'll save it for later, | when I'm *really* hungry.", 'मैं अपनी अभी नहीं खाऊँगा। | बाद के लिए बचाऊँगा, | जब *बहुत* भूख लगेगी।'],
        ['anaya', 'thinking', 'Golu, it is *very* hot today.', 'गोलू, आज *बहुत* गर्मी है।'],
      ], { minDuration: 3 });
      ep.act('beach', ['golu:runjump:sandbucket'], [
        ['golu', 'excited', 'First, a sandcastle! | Then a swim! | Then my ice cream!', 'पहले रेत का महल! | फिर तैराकी! | फिर मेरी आइसक्रीम!'],
      ], { minDuration: 3 });
      ep.act('beach', ['golu:lookaround', 'anaya:idle'], [
        ['golu', 'happy', "Okay, I'm really hungry now. | Ice cream time!", 'अब सच में भूख लगी है। | आइसक्रीम टाइम!'],
        ['golu', 'surprised', "[0.6] Why is it... | a puddle? | Where did my ice cream go?", '[0.6] ये... | पानी क्यों बन गई? | मेरी आइसक्रीम कहाँ गई?'],
      ], { camera: 'closeup', minDuration: 3 });
      ep.act('beach', ['anaya:laugh', 'golu:sad', 'papa:idle:icecream'], [
        ['anaya', 'laugh', 'The sun ate it first!', 'उसे सूरज ने पहले खा लिया!'],
        ['papa', 'laugh', 'Here, champ. | A new one. | Eat it *now*!', 'ये लो, चैंप। | नई वाली। | *अभी* खाओ!'],
      ], { minDuration: 3 });
    },
  },
  {
    id: 'short-mishti', theme: 'animals', moral: false,
    build(ep, { T }) {
      ep.title = T("Mishti Takes Bruno's Bed 🐱🐶", 'मिष्टी ने ब्रूनो का बिस्तर ले लिया 🐱🐶');
      ep.summary = T("Mrs. Kapoor's cat comes to visit. She finds the perfect place for a nap.", 'कपूर आंटी की बिल्ली मिलने आती है। उसे सोने की एकदम सही जगह मिल जाती है।');
      ep.music = 'silly';
      ep.act('house', ['mishti:idle', 'golu:idle', 'bruno:idle'], [
        ['golu', 'happy', 'Mishti came to visit! | Bruno, be nice to her.', 'मिष्टी मिलने आई है! | ब्रूनो, इसके साथ अच्छे से रहना।'],
        ['mishti', 'happy', 'Meow.', 'म्याऊँ।'],
      ], { minDuration: 3 });
      ep.act('house', ['mishti:sleep', 'bruno:sad', 'golu:idle'], [
        ['golu', 'surprised', "Oh no. | She's sleeping in Bruno's bed!", 'अरे नहीं। | ये तो ब्रूनो के बिस्तर में सो रही है!'],
        ['bruno', 'sad', 'Woof...', 'भौं...'],
      ], { minDuration: 3 });
      ep.act('house', ['bruno:idle', 'golu:sitfloor', 'mishti:sleep'], [
        ['golu', 'calm', 'Bruno, | she is our guest. | Can she have it for one nap?', 'ब्रूनो, | ये हमारी मेहमान है। | क्या ये एक झपकी के लिए ले सकती है?'],
        ['bruno', 'sad', '[0.6] Woof.', '[0.6] भौं।'],
      ], { minDuration: 3 });
      ep.act('house', ['bruno:sleep', 'golu:laugh', 'anaya:laugh'], [
        ['anaya', 'laugh', "Golu, look. | Bruno found a new bed.", 'गोलू, देखो। | ब्रूनो को नया बिस्तर मिल गया।'],
        ['golu', 'surprised', "That's *my* pillow! | Bruno!", 'वो तो *मेरा* तकिया है! | ब्रूनो!'],
      ], { minDuration: 3, props: [{ kind: 'pillow', x: 1.2, z: 0.5 }] });
    },
  },
  {
    id: 'short-icecube', theme: 'experiment', moral: false,
    build(ep, { T }) {
      ep.title = T('Golu Keeps an Ice Cube in His Pocket 🧊', 'गोलू ने जेब में बर्फ़ रखी 🧊');
      ep.summary = T("Golu wants to show his ice cube to Kabir after school. Science has other ideas.", 'गोलू स्कूल के बाद कबीर को अपना बर्फ़ का टुकड़ा दिखाना चाहता है। पर साइंस का प्लान कुछ और है।');
      ep.music = 'silly';
      ep.act('kitchen', ['golu:idle:icecube', 'anaya:idle:schoolbag'], [
        ['golu', 'excited', "Look, Didi! | The biggest ice cube in the freezer. | I'm taking it to show Kabir!", 'देखो, दीदी! | फ़्रीज़र का सबसे बड़ा बर्फ़ का टुकड़ा। | मैं इसे कबीर को दिखाने ले जा रहा हूँ!'],
        ['anaya', 'thinking', 'In your pocket? | All the way to school?', 'जेब में? | स्कूल तक?'],
      ], { minDuration: 3 });
      ep.act('school', ['golu:idle:schoolbag', 'kabir:idle:schoolbag'], [
        ['golu', 'excited', 'Kabir! | I brought you something amazing!', 'कबीर! | मैं तुम्हारे लिए कुछ कमाल लाया हूँ!'],
        ['kabir', 'excited', 'What is it? | Show me!', 'क्या है? | दिखाओ!'],
      ], { minDuration: 3 });
      ep.act('school', ['golu:lookaround', 'kabir:idle'], [
        ['golu', 'surprised', "It was right here... | [0.6] why is my pocket wet?", 'यहीं तो था... | [0.6] मेरी जेब गीली क्यों है?'],
        ['kabir', 'laugh', 'You brought me... | water?', 'तुम मेरे लिए... | पानी लाए हो?'],
      ], { minDuration: 3 });
      ep.act('school', ['anaya:idle:schoolbag', 'golu:sad', 'kabir:laugh'], [
        ['anaya', 'laugh', 'Ice melts when it gets warm, Golu. | Your pocket is very warm.', 'बर्फ़ गरम होने पर पिघल जाती है, गोलू। | तुम्हारी जेब बहुत गरम है।'],
        ['golu', 'sad', 'Next time... | I am bringing the whole freezer.', 'अगली बार... | मैं पूरा फ़्रीज़र लेकर आऊँगा।'],
      ], { minDuration: 3 });
    },
  },
];
