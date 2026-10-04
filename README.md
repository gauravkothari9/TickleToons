# Tickle Toons Studio

Make Pixar-style 3D cartoon story videos for YouTube, right in your browser.

- **Studio** (`/studio.html`): build a cast, then tell the story shot by shot: place, camera, who's there,
  what they do, what they say (with emotions). Characters speak with neural voices and their mouths lip-sync.
- **Animal voices**: animals make real calls (meow, woof, roar, oink, squeak, elephant trumpet, monkey ooh-aah…).
  Lines like "Woof woof!" or "म्याऊँ!" become the actual sound, "Woof, I found it!" barks then talks, and emotional
  lines (excited, sad, scared, angry…) open with the animal's call. Change it per character under **Animal sounds**.
- **Real laughs & emotion sounds**: write *Hehe!*, *Ha ha ha!*, *हीही*, *Hmm...*, *Aww*, *sniff* or a stage direction like
  *(laughs)*, *(gasps)*, *(sighs)*, *(cries)*, *(yawns)* and the character makes a real recorded sound (pitched to their voice)
  instead of reading the letters. Surprised lines open with a gasp, laughing lines with a giggle, sad ones with a sniffle or sigh,
  and the face and body act it out. Per character under **Laughs & emotion sounds**. Animals use real recorded calls.
  The recordings are CC0 (public domain) from Freesound, in `web/sounds/` (credits in `web/sounds/credits.json`);
  drop your own files into a category folder and run `python tools/sounds.py index` to use them.
- **Gestures that match the words**: while a character speaks, the body acts out what they say: *Bye!* waves, *Yes!* nods,
  *No!* shakes the head, *Look!* points, *Yay!* cheers, *Hmm...* thinks, *I don't know* shrugs, *Thank you* folds hands, *Sorry* bows
  (English and Hindi), on top of the shot's action, then goes back to it. Pick or turn off a line's gesture under **Gesture** in the Shot tab;
  in story templates write the emotion as `'excited:wave'` (or `'calm:none'`).
- **Music that fits the scene**: pick the story's music, and each shot switches to suit its mood (sad, suspense,
  festive dhol for weddings and dancing, lullaby for bedtime) with smooth crossfades. Override any shot's music in the Shot tab.
  The music is soft background (piano, marimba, flute) that dips under dialogue, and the place matters too (calm in a hospital, adventure in space).
- **Background sounds**: every place has its own quiet sound: birds and a breeze outside, waves at the beach, crickets at night,
  chatter in the market and classroom, clinks in the kitchen, a monitor beep in the hospital, distant horns on the street.
  Set the level with **Background sounds** in the Story tab (0 turns them off).
- **Make video**: renders every frame at 1080p, mixes voices + music, and saves an MP4 with subtitles.
- **Gallery** (`/`): watch, download, remix or delete your videos.

## Series (automatic episodes for YouTube)

Open **📺 Series** (`/series.html`):

- **Family**: the family of 7 plus friends, teachers and pets. Rename anyone (per language), change colours, outfits
  for home / school / party / night / rain, and each person's voice per language. Every episode uses these.
- **Settings**: how many long episodes and Shorts, their length, languages (English, Hindi), kinds of stories,
  how often there's a moral, how many are **Golu's vlogs** (comedy, Golu talks to the viewers with his cardboard
  "camera"; default 10%), title format and tags. The "idea number" makes the same set again; change it for new ones.
- **Schedule**: posting days and times for long episodes and for Shorts.
- **Episodes**: *Generate episodes*, check any in the studio (✎), then *Render all*. Keep the tab open while it renders.
- **YouTube**: one-time Google setup (steps on the page), then uploads are automatic and scheduled.
- **Automatic rendering**: run `deploy\local-renderer.ps1` once on a PC with a graphics card; it renders each episode
  shortly before its publish time (Schedule tab) and the server uploads it, scheduled. See `deploy/DEPLOY.md`.

Stories come from hand-written templates in `web/js/series/` (no AI): `stories-long.js` and `stories-long-2.js`
(one complete story each, one genre, with its own optional scenes that are cut when an episode would run long; nothing
unrelated is ever padded in, so a story shorter than the chosen length stays shorter), `stories-short.js`,
`stories-vlog.js` and `stories-everyday.js` (everyday family life: phones at dinner, a hidden test paper,
a power cut, the TV remote fight, a wobbly tooth, feeling left out, vaccine day). English lines are spoken with natural
contractions ("Let us" becomes "Let's", "I am" becomes "I'm") automatically, so write them either way.

The same thing is always the same prop (Dadi's laddoos are always the laddoo plate, lunch is always the tiffin; the list is
at the top of `stories-long.js`), and props must fit the action: nobody claps or dances while holding something, and `eat`
only takes food (the generator puts a prop down for that scene). Props follow the story: a scene can say
`carry: { golu: 'balloon' }` and Golu keeps holding the balloon in every later scene until `carry: { golu: null }`; `set: [{ kind: 'tv', x: 0, z: -2.2 }]` dresses
that place for the scenes after it. Story props (rotis, rolling pin, TV remote, test paper, torch, sandcastle, lemonade
stand, ludo board, volcano…) live in `web/js/engine/props-story.js`. Weddings: Pandit-ji, bride/groom outfits, mandap and reception venues, varmala, kalash, diya, dhol and more.
Every line is written in English and Hindi; to add a language, add its text to each line and a voice per character.

## Online

Everything (pages and server) can run on one AWS server, with a password login set on the first visit. It keeps rendering and uploading the planned episodes while your PC is off. See `deploy/DEPLOY.md`.

## Run

Double-click **`start.bat`**. The first run creates `.venv` and installs `edge-tts` (for voices).
Then open http://127.0.0.1:8000 (it opens automatically). Use Chrome or Edge.

Needs: Python 3.10+, FFmpeg (for MP4 export), internet (for the neural voices; offline falls back to Windows voices).

## How it works

| Part | Job |
|---|---|
| `web/js/engine/characters.js` | Procedural Pixar-style characters: eyes with lids, brows, lip-synced mouth, emotions, actions. Robo is a rigged glTF model. |
| `web/js/engine/outfits.js` | Clothes for the human characters (school uniforms, kurta, saree, lehenga, doctor, police…) |
| `web/js/engine/props.js` | Hand props, plus the furniture actions bring along (desk, bed, bicycle, skipping rope, cart…) |
| `web/js/engine/worlds.js` | Meadow, forest, beach, night garden, bedroom, space: physical sky, swaying grass, water |
| `web/js/engine/places.js` | Everyday places: school, classroom, hospital, police station, mall, market, kitchen, street, birthday party |
| `web/js/engine/stage.js` | Shot playback, auto film camera (cuts to whoever talks), lighting, depth of field, ambient occlusion, bloom, subtitles |
| `web/js/engine/audio.js` | Generated music (per-scene mood cues), voice loading, lip-sync envelopes, ducking, offline mixdown to WAV |
| `web/js/engine/animals.js` | Animal sound-word detection (English + Hindi), synthesized calls as a fallback |
| `web/js/engine/gestures.js` | Finds the gesture in a line (wave, nod, point, cheer, shrug...) and when to play it |
| `web/js/engine/vocals.js` | Real recorded laughs, gasps, sighs, sobs and animal calls: finds them in lines, pitches them per character |
| `tools/sounds.py` | Builds the `web/sounds` library from Freesound CC0 recordings |
| `web/js/story.js` | Story format, validation, timing, the example story |
| `web/js/studio.js` | Editor UI, live preview, frame-by-frame render upload |
| `server.py` | Python: voices (edge-tts), receives frames and pipes them into FFmpeg, stores videos |
| `youtube.py` | YouTube channel connection (OAuth), upload queue and scheduled publishing |
| `web/js/series/` | Series bible (family), story templates, episode generator and schedule |

Stories autosave in the browser. Use **Story → Save story to a file** to keep a copy.
Each video also stores its story, so **Remix** in the gallery reopens it in the studio.

## Credits

- 3D engine: [three.js](https://threejs.org) (MIT). Robo and bird models from the three.js examples
  (RobotExpressive by Tomás Laulhé, CC0; Parrot/Flamingo/Stork from mirada.com's "ro.me" project).
- Voices: Microsoft Edge neural voices via [edge-tts](https://github.com/rany2/edge-tts).
  Check Microsoft's terms before commercial use of generated speech.
