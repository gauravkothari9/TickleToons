// Turn a story into an MP4 on the server: voices, every frame at full quality, the soundtrack,
// then FFmpeg. Used by the studio's "Make video" and by the Series page's automatic renders.
import { renderSoundtrack } from './engine/audio.js';
import { api } from './api.js';

const FPS = 30;
const post = (url, body, type) => api(url, { method: 'POST', headers: type ? { 'Content-Type': type } : {}, body });
const toJpeg = (canvas) => new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.93));
// MessageChannel isn't throttled like setTimeout when the tab is in the background
const channel = new MessageChannel();
const yieldToPage = () => new Promise((r) => { channel.port1.onmessage = () => r(); channel.port2.postMessage(0); });
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/**
 * Render `story` with an existing Stage + VoiceLibrary. Returns the new video id.
 * opts: onStep(message, percent, eta), isCancelled(), allowMissingVoices (default true),
 *       voiceRetries (extra rounds for lines whose voice failed, default 4), extraMeta
 */
export async function renderVideo(stage, voices, story, canvas, opts = {}) {
  const step = opts.onStep || (() => {});
  const cancelled = opts.isCancelled || (() => false);
  let id = null;
  try {
    step('Making voices…', 2);
    const failed = await voices.prepare(story, (d, n, _f, round) => n && step(`Making voices… ${d}/${n}${round ? ` (retry ${round})` : ''}`, 2),
      { retries: opts.voiceRetries ?? 4 });
    if (failed && opts.allowMissingVoices === false) throw new Error(`${failed} line(s) have no voice`);
    await document.fonts.load('700 40px Fredoka').catch(() => {});
    await document.fonts.load('600 40px Fredoka').catch(() => {});
    stage.setQuality({ scale: 1, effects: true });
    await stage.load(story, voices);
    const total = stage.timeline.total;
    const frames = Math.ceil(total * FPS);

    const res = await post('/api/renders', JSON.stringify({ story, fps: FPS, duration: total, meta: opts.extraMeta }), 'application/json');
    const info = await res.json();
    if (!res.ok) throw new Error(info.error || 'server refused');
    id = info.id;

    const started = performance.now();
    let batch = [];
    for (let f = 0; f < frames; f++) {
      if (cancelled()) throw new Error('cancelled');
      stage.render(f / FPS);
      batch.push(await toJpeg(canvas));
      if (batch.length === 8 || f === frames - 1) {
        const r = await post(`/api/renders/${id}/frames`, new Blob(batch), 'application/octet-stream');
        if (!r.ok) throw new Error((await r.json()).error || 'frame upload failed');
        batch = [];
      }
      if (f % 4 === 0) {
        const per = (performance.now() - started) / (f + 1);
        step(`Rendering frame ${f + 1} of ${frames}`, 3 + (f / frames) * 85, `About ${fmt(((frames - f) * per) / 1000)} left`);
        await yieldToPage();
      }
    }
    step('Mixing voices and music…', 90);
    const wav = await renderSoundtrack(stage.timeline, stage.story, voices);
    await post(`/api/renders/${id}/audio`, wav, 'audio/wav');
    await post(`/api/renders/${id}/finish`, '', 'application/json');
    step('Encoding MP4…', 95);
    for (;;) {
      await new Promise((r) => setTimeout(r, 1000));
      const meta = await (await api(`/api/videos/${id}`)).json();
      if (meta.status === 'ready') break;
      if (meta.status === 'failed') throw new Error(meta.note || 'encoding failed');
    }
    step('Done!', 100);
    return id;
  } catch (err) {
    if (id) api(`/api/videos/${id}`, { method: 'DELETE' }).catch(() => {});
    throw err;
  }
}
