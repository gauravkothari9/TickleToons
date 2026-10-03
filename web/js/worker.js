// The server's own renderer. deploy/render_worker.py opens this page in a headless browser on the
// server (?k=<worker key>). It takes the next planned episode from the Series plan, renders it just like
// "Render all" on the Series page, and queues the YouTube upload when auto-upload is on. One episode per
// visit: the result goes to window.workerResult and the script opens a fresh browser for the next one.
import { api, setToken } from './api.js';
import { Stage } from './engine/stage.js';
import { VoiceLibrary } from './engine/audio.js';
import { renderVideo } from './render.js';
import { LANGUAGES } from './series/bible.js';

const key = new URLSearchParams(location.search).get('k');
if (key) setToken(key);
const status = (msg) => { document.getElementById('status').textContent = msg; console.log(`[worker] ${msg}`); };

async function queueUpload(it, youtube) {
  const res = await api('/api/youtube/upload', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      videoId: it.videoId, title: it.title, description: it.description, tags: it.tags, language: LANGUAGES[it.lang]?.youtube || it.lang,
      privacy: youtube.privacy || 'private', publishAt: it.publishAt && new Date(it.publishAt) > new Date() ? it.publishAt : null,
      madeForKids: youtube.madeForKids !== false, categoryId: youtube.categoryId || '1', planKey: it.key,
    }),
  });
  if (!res.ok) throw new Error(`upload not queued: ${(await res.json().catch(() => ({}))).error || res.status}`);
}

async function run() {
  const claim = await (await api('/api/worker/claim', { method: 'POST' })).json();
  const it = claim.item;
  if (!it) { status('Nothing to render.'); return { idle: true }; }
  status(`Rendering ${it.key}: ${it.title}`);
  const stage = new Stage(document.getElementById('output'));
  const voices = new VoiceLibrary();
  let last = 0;
  try {
    const id = await renderVideo(stage, voices, it.story, document.getElementById('output'), {
      onStep: (msg, pct, eta) => { if (pct - last >= 5 || pct >= 90) { last = pct; status(`${it.key}: ${msg} ${eta || ''}`); } },
      allowMissingVoices: false, // never upload an episode with silent lines; it goes back in the queue instead
    });
    it.videoId = id;
    await api('/api/worker/done', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: it.key, seed: it.seed, videoId: id }) });
    if (claim.youtube?.autoUpload && claim.connected) { await queueUpload(it, claim.youtube); status(`${it.key}: rendered and queued for YouTube.`); }
    else status(`${it.key}: rendered (auto-upload is off or YouTube isn't connected).`);
    return { rendered: id };
  } catch (err) {
    status(`${it.key}: failed: ${err.message}`);
    await api('/api/worker/done', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: it.key, seed: it.seed, error: err.message }) }).catch(() => {});
    return { error: err.message };
  }
}

window.workerResult = null;
run().then((r) => { window.workerResult = r; }, (err) => { status(`error: ${err.message}`); window.workerResult = { error: err.message }; });
