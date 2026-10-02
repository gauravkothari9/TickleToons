// Series Studio: the family bible editor, episode generator, batch renderer, schedule and YouTube.
import { api, serverUrl, requireLogin } from './api.js';
import { Stage } from './engine/stage.js';
import { VoiceLibrary, playStory } from './engine/audio.js';
import { CharacterPreview } from './preview.js';
import { renderVideo } from './render.js';
import { OUTFITS, ACTIONS } from './story.js';
import { LANGUAGES, LOOKS, FAMILY, mergeBible, castMember, nameOf, DEFAULT_BIBLE } from './series/bible.js';
import { THEMES, DEFAULT_SETTINGS, makePlan, generateEpisode, scheduleSlots } from './series/generator.js';
requireLogin(); // off to the login page if the server wants one

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDur = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CATEGORIES = { 1: 'Film & Animation', 27: 'Education', 24: 'Entertainment', 22: 'People & Blogs' };

const DEFAULT_STATE = {
  settings: DEFAULT_SETTINGS,
  schedule: { enabled: true, startDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), longDays: [3, 6], longTime: '17:00', shortDays: [0, 1, 2, 3, 4, 5, 6], shortTimes: ['12:00'] },
  youtube: { autoUpload: false, privacy: 'private', madeForKids: true, categoryId: '1' },
  bible: null, // your edits on top of the default family
  plan: [],
};
let state = structuredClone(DEFAULT_STATE);
let voiceList = [];
let yt = { configured: false, connected: false };
let uploads = [];
let job = null; // { cancelled }

const stage = new Stage($('output'));
const voices = new VoiceLibrary();
const preview = new CharacterPreview($('char-preview'));
let audioCtx = null;

// ---------- persistence ----------
// Saves go out one at a time, in order, so an older save can never land after a newer one.
let saveTimer = null, dirty = false, inFlight = 0, saving = Promise.resolve();
function save(now = false) {
  dirty = true;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, now ? 0 : 400);
}
function flushSave() {
  clearTimeout(saveTimer);
  if (!dirty) return saving;
  dirty = false;
  const body = JSON.stringify({ ...state, rev: Date.now() });
  inFlight++;
  saving = saving.then(async () => {
    try {
      const res = await api('/api/series', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `server said ${res.status}`);
    } catch (err) {
      dirty = true; // try again with the next change
      toast(`Couldn't save your changes: ${err.message}`, 'error');
    } finally { inFlight--; }
  });
  return saving;
}
const bible = () => mergeBible(state.bible);
function toast(msg, kind = '') {
  $('toast').textContent = msg;
  $('toast').className = `status floating ${kind}`;
  clearTimeout(toast.t);
  if (msg) toast.t = setTimeout(() => { $('toast').textContent = ''; $('toast').className = 'status'; }, 6000);
}

// ---------- small form helpers ----------
const opts = (dict, v) => {
  const groups = new Map();
  for (const [k, label] of Object.entries(dict)) {
    const text = String(label?.label ?? label), i = text.indexOf(': ');
    const g = i > 0 ? text.slice(0, i) : '';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(`<option value="${esc(k)}"${String(k) === String(v) ? ' selected' : ''}>${esc(i > 0 ? text.slice(i + 2) : text)}</option>`);
  }
  return [...groups].map(([g, o]) => (g ? `<optgroup label="${esc(g)}">${o.join('')}</optgroup>` : o.join(''))).join('');
};
const field = (label, control, cls = '') => `<label class="field ${cls}">${label}${control}</label>`;
const getPath = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);
function setPath(obj, path, value) {
  const keys = path.split('.');
  let o = obj;
  for (const k of keys.slice(0, -1)) o = o[k] ??= {};
  o[keys.at(-1)] = value;
}
const voiceSelect = (path, v) => {
  const groups = new Map();
  for (const x of voiceList) { const g = x.group || 'Voices'; if (!groups.has(g)) groups.set(g, {}); groups.get(g)[x.id] = x.label; }
  return `<select data-bind="${path}">${[...groups].map(([g, d]) => `<optgroup label="${esc(g)}">${opts(d, v)}</optgroup>`).join('')}</select>`;
};

// Inputs with data-bind="settings.long.count" write into state; data-type: num | bool | list | days
document.addEventListener('change', (e) => {
  const el = e.target;
  if (!el.dataset?.bind) return;
  let v = el.type === 'checkbox' ? el.checked : el.value;
  if (el.dataset.type === 'num') v = Number(v);
  if (el.dataset.type === 'list') v = String(v).split(',').map((s) => s.trim()).filter(Boolean);
  if (el.dataset.type === 'toggle') {
    // checkbox in a group of values (languages, themes, days)
    const list = new Set(getPath(state, el.dataset.bind) || []);
    const val = el.dataset.num ? Number(el.value) : el.value;
    el.checked ? list.add(val) : list.delete(val);
    v = [...list];
  }
  if (el.dataset.bind.startsWith('bible.')) ensureBible();
  setPath(state, el.dataset.bind, v);
  save();
  if (el.dataset.bind.startsWith('bible.')) { renderTitle(); showPreview(); }
  if (el.dataset.rerender) renderAll();
});

function ensureBible() { if (!state.bible) state.bible = structuredClone(DEFAULT_BIBLE); }

// ---------- tabs ----------
document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === tab));
  for (const name of ['plan', 'family', 'settings', 'schedule', 'youtube']) $(`tab-${name}`).hidden = name !== tab.dataset.tab;
}));

function renderTitle() {
  const b = bible();
  $('series-title').textContent = b.seriesName.en || 'Series Studio';
}
function renderAll() {
  renderTitle();
  renderPlan();
  renderFamily();
  renderSettings();
  renderSchedule();
  renderYouTube();
}

// ---------- Episodes tab ----------
function renderPlan() {
  const items = state.plan;
  const counts = { long: items.filter((i) => i.kind === 'long').length, short: items.filter((i) => i.kind === 'short').length };
  const done = items.filter((i) => i.videoId).length;
  $('tab-plan').innerHTML = `
    <div class="section">
      <h3>Episodes</h3>
      <p class="muted small">Stories are written from hand-made templates (no AI). Every press of <b>Generate episodes</b> makes new scripts and skips stories you've already had.</p>
      <div class="btn-row">
        <button class="btn primary small" data-act="generate">✨ Generate episodes</button>
        <button class="btn small" data-act="refresh" ${items.some((i) => !i.videoId) ? '' : 'disabled'} title="Rebuild unrendered stories with your latest family / settings changes">↻ Update unrendered stories</button>
        <button class="btn purple small" data-act="render-all" ${items.some((i) => !i.videoId) ? '' : 'disabled'}>${job ? '■ Stop rendering' : '🎬 Render all'}</button>
      </div>
      <p class="muted small">${counts.long} long · ${counts.short} Shorts · ${done} rendered · ${uploads.filter((u) => u.status === 'done').length} uploaded</p>
    </div>
    <div class="ep-list">
      ${items.map((it, i) => episodeRow(it, i)).join('') || '<p class="muted">No episodes yet. Pick your settings, then press <b>Generate episodes</b>.</p>'}
    </div>`;
}

function episodeRow(it, i) {
  const up = uploads.find((u) => u.planKey === it.key && u.videoId === it.videoId);
  const status = it.status === 'rendering' ? '<span class="badge processing">rendering…</span>'
    : up ? (up.status === 'done' ? `<a class="badge ok" href="${esc(up.url)}" target="_blank" rel="noopener">on YouTube ↗</a>` : up.status === 'failed' ? `<span class="badge failed" title="${esc(up.error)}">upload failed</span>` : `<span class="badge processing">${esc(up.status)} ${up.progress ? up.progress + '%' : ''}</span>`)
      : it.videoId ? '<span class="badge ok">rendered</span>' : it.status === 'failed' ? `<span class="badge failed" title="${esc(it.error)}">failed</span>` : '<span class="badge">planned</span>';
  const when = it.publishAt ? new Date(it.publishAt) : null;
  const local = when ? new Date(when.getTime() - when.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';
  return `
    <div class="item ep ${it.kind}">
      <div class="item-head">
        <span><span class="kind">${it.kind === 'short' ? 'SHORT' : 'LONG'}</span> <span class="lang">${esc(it.lang.toUpperCase())}</span> <b>${esc(it.title)}</b></span>
        ${status}
      </div>
      <div class="muted small">${it.vlog ? "📹 Golu's vlog" :esc(THEMES[it.theme] || it.theme)} · ${it.moral ? 'Moral: ' + esc(it.moral.replace(/[|*]|\[\d*\.?\d+\]/g, '').replace(/\s+/g, ' ')) : 'Just for fun'} · ~${fmtDur(it.estSeconds)}</div>
      <div class="row3 ep-tools">
        <label class="field inline small">Publish
          <input type="datetime-local" data-ep="${i}" data-field="publishAt" value="${local}"></label>
        <span class="line-tools">
          ${it.videoId ? `<a class="icon-btn" href="/?v=${it.videoId}" target="_blank" title="Watch the video">▶</a>` : `<button class="icon-btn" data-act="watch" data-i="${i}" title="Watch it here before rendering">▶</button>`}
          <button class="icon-btn" data-act="open" data-i="${i}" title="Open in the studio to tweak">✎</button>
          ${it.videoId ? '' : `<button class="icon-btn" data-act="render" data-i="${i}" title="Render this one">🎬</button>`}
          ${it.videoId && yt.connected && !up ? `<button class="icon-btn" data-act="upload" data-i="${i}" title="Upload to YouTube">⇪</button>` : ''}
          ${up?.status === 'failed' ? `<button class="icon-btn" data-act="retry" data-id="${up.id}" title="Retry upload">↻</button>` : ''}
          ${!it.videoId ? `<button class="icon-btn" data-act="reroll" data-i="${i}" title="Different story">🎲</button>` : ''}
          <button class="remove" data-act="remove" data-i="${i}" title="Remove from list">✕</button>
        </span>
      </div>
    </div>`;
}

document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset?.ep !== undefined && el.dataset.field === 'publishAt') {
    state.plan[el.dataset.ep].publishAt = el.value ? new Date(el.value).toISOString() : null;
    save();
  }
});

function generate() {
  const keep = state.plan.filter((i) => i.videoId); // never throw away rendered work
  if (state.plan.some((i) => !i.videoId) && !confirm('Replace the episodes that are not rendered yet with a fresh set?')) return;
  try {
    // a new idea number every time, and skip stories you've already had (current list + earlier batches)
    const old = state.settings.seed;
    do state.settings.seed = Math.floor(Math.random() * 99999) + 1; while (state.settings.seed === old);
    // story history, oldest first; using a story again moves it to the end
    const used = state.usedStories ||= { long: [], short: [] };
    const remember = (p) => { if (p.template) used[p.kind] = [...used[p.kind].filter((id) => id !== p.template), p.template]; };
    state.plan.forEach(remember);
    const done = new Set(keep.map((p) => p.key));
    const fresh = makePlan(state.settings, state.bible, state.schedule, used).map((p) => ({ ...p, key: `${state.settings.seed}-${p.key}` })).filter((p) => !done.has(p.key));
    fresh.forEach(remember);
    renderSettings();
    state.plan = [...keep, ...fresh];
    save(true);
    renderPlan();
    toast(`Made ${fresh.length} episodes. Open any of them in the studio to check, then press Render all.`);
  } catch (err) { toast(err.message, 'error'); }
}

function regenerate(it, seed = it.seed) {
  const ep = generateEpisode({ seed, kind: it.kind, lang: it.lang, settings: state.settings, bibleOverrides: state.bible, templateId: seed === it.seed ? it.template : undefined });
  return { ...it, ...ep.meta, story: ep.story, seed, template: ep.meta.template, status: 'planned', error: null };
}

document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-act]');
  if (!btn || btn.disabled) return;
  const i = Number(btn.dataset.i), it = state.plan[i];
  switch (btn.dataset.act) {
    case 'generate': return generate();
    case 'refresh':
      state.plan = state.plan.map((p) => (p.videoId ? p : regenerate(p)));
      save(true); renderPlan(); return toast('Unrendered stories updated with your latest family and settings.');
    case 'reroll': {
      const seed = it.seed + 7777 + Math.floor(Math.random() * 1000);
      // re-roll the same episode in every language together
      const base = it.key.replace(/-(\w+)$/, '');
      state.plan = state.plan.map((p) => (p.key.startsWith(base + '-') && !p.videoId ? regenerate(p, seed) : p));
      save(true); return renderPlan();
    }
    case 'remove': state.plan.splice(i, 1); save(true); return renderPlan();
    case 'open':
      localStorage.setItem('tickle-toons-story-v2', JSON.stringify(it.story));
      return window.open('studio.html', '_blank');
    case 'watch': return watchEpisode(it);
    case 'render': return renderQueue([it]);
    case 'render-all': return job ? (job.cancelled = true) : renderQueue(state.plan.filter((p) => !p.videoId));
    case 'upload': return queueUpload(it).then(refreshUploads);
    case 'retry': await api('/api/youtube/retry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: btn.dataset.id }) }); return refreshUploads();
    case 'yt-save': return saveClient();
    case 'yt-disconnect': await api('/api/youtube/disconnect', { method: 'POST' }); await refreshYouTube(); return renderYouTube();
    case 'forget-stories': state.usedStories = { long: [], short: [] }; save(true); return toast('Story history cleared. Any story can come up again.');
    case 'reset-char': {
      ensureBible();
      state.bible.characters[btn.dataset.id] = structuredClone(DEFAULT_BIBLE.characters[btn.dataset.id]);
      save(); renderFamily(); return showPreview();
    }
    case 'hear': return hearVoice(btn.dataset.id, btn.dataset.lang);
    case 'pick-char': pvWho = btn.dataset.id; $('pv-who').value = pvWho; return showPreview();
  }
});

// ---------- watch an episode before rendering ----------
const PLAY_QUALITY = { scale: 0.5, effects: false };
const player = { T: 0, playing: false, start: 0, stop: () => {}, seq: 0, ready: false };
const audio = () => { audioCtx ??= new AudioContext(); audioCtx.resume(); return audioCtx; };

function playerTime() {
  const total = stage.timeline?.total || 0;
  $('ep-time').textContent = `${fmtDur(Math.floor(player.T))} / ${fmtDur(Math.floor(total))}`;
  $('ep-scrub').value = player.T;
}
function playerEnable(on) {
  player.ready = on;
  $('ep-play').disabled = !on;
  $('ep-scrub').disabled = !on;
}
function playerPause() {
  player.playing = false;
  player.stop();
  player.stop = () => {};
  $('ep-play').textContent = '▶ Play';
}
function playerPlay() {
  if (!player.ready || job) return;
  if (player.T >= stage.timeline.total - 0.05) player.T = 0;
  player.stop();
  player.stop = playStory(audio(), stage.timeline, stage.story, voices, player.T);
  player.playing = true;
  player.start = performance.now() - player.T * 1000;
  $('ep-play').textContent = '❚❚ Pause';
  requestAnimationFrame(playerTick);
}
function playerTick() {
  if (!player.playing) return;
  player.T = (performance.now() - player.start) / 1000;
  if (player.T >= stage.timeline.total) { player.T = stage.timeline.total; playerPause(); }
  stage.render(player.T);
  playerTime();
  if (player.playing) requestAnimationFrame(playerTick);
}
async function watchEpisode(it) {
  if (job) return toast('Wait for rendering to finish (or stop it) to watch an episode.');
  const seq = ++player.seq;
  playerPause();
  playerEnable(false);
  audio(); // unlock sound while we still have the click
  $('player-title').textContent = `Watching: ${it.title}`;
  $('pv-note').hidden = false;
  $('pv-note').textContent = 'Making voices…';
  try {
    const story = structuredClone(it.story);
    const failed = await voices.prepare(story, (d, n) => { if (n && seq === player.seq) $('pv-note').textContent = `Making voices… ${d}/${n}`; });
    if (seq !== player.seq) return;
    $('pv-note').textContent = 'Building the scene…';
    await document.fonts.load('700 40px Fredoka').catch(() => {});
    stage.setQuality(PLAY_QUALITY);
    const ok = await stage.load(story, voices);
    if (!ok || seq !== player.seq) return;
    $('pv-note').hidden = true;
    $('ep-scrub').max = stage.timeline.total;
    player.T = 0;
    stage.render(0);
    playerTime();
    playerEnable(true);
    if (failed) toast(`${failed} line(s) couldn't get a voice (is the internet on?). They show as subtitles.`, 'error');
    playerPlay();
  } catch (err) {
    console.error(err);
    if (seq === player.seq) { $('pv-note').textContent = 'Could not play this episode.'; toast(`Preview failed: ${err.message}`, 'error'); }
  }
}
$('ep-play').addEventListener('click', () => (player.playing ? playerPause() : playerPlay()));
$('ep-scrub').addEventListener('input', (e) => {
  if (player.playing) playerPause();
  player.T = Number(e.target.value);
  stage.render(player.T);
  playerTime();
});

// ---------- batch rendering ----------
async function renderQueue(items) {
  if (job) return;
  ++player.seq; // cancel a preview that's still loading
  playerPause();
  playerEnable(false);
  $('pv-note').hidden = true;
  $('player-title').textContent = 'Rendering';
  job = { cancelled: false };
  preview.paused = true; // the live preview would compete with the renderer for the GPU
  renderPlan();
  const step = (msg, pct, eta = '') => { $('render-step').textContent = msg; $('render-bar').style.width = `${pct}%`; $('render-eta').textContent = eta; };
  let n = 0;
  for (const it of items) {
    if (job.cancelled) break;
    n++;
    it.status = 'rendering';
    renderPlan();
    try {
      const id = await renderVideo(stage, voices, structuredClone(it.story), $('output'), {
        onStep: (m, p, eta) => step(`[${n}/${items.length}] ${it.title}: ${m}`, p, eta), isCancelled: () => job.cancelled,
      });
      Object.assign(it, { videoId: id, status: 'rendered', error: null });
      save();
      if (state.youtube.autoUpload && yt.connected) await queueUpload(it);
    } catch (err) {
      Object.assign(it, { status: err.message === 'cancelled' ? 'planned' : 'failed', error: err.message });
      save();
      if (err.message === 'cancelled') break;
    }
    renderPlan();
  }
  step(job.cancelled ? 'Stopped.' : 'All done!', job.cancelled ? 0 : 100);
  job = null;
  preview.paused = false;
  stage.setQuality(PLAY_QUALITY);
  $('player-title').textContent = 'Watch before rendering';
  $('pv-note').textContent = 'Press ▶ on an episode to watch it here.';
  $('pv-note').hidden = false;
  await refreshUploads();
}

async function queueUpload(it) {
  const res = await api('/api/youtube/upload', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      videoId: it.videoId, title: it.title, description: it.description, tags: it.tags, language: LANGUAGES[it.lang]?.youtube || it.lang,
      privacy: state.youtube.privacy, publishAt: it.publishAt && new Date(it.publishAt) > new Date() ? it.publishAt : null,
      madeForKids: state.youtube.madeForKids, categoryId: state.youtube.categoryId, planKey: it.key,
    }),
  });
  const data = await res.json();
  if (!res.ok) toast(`Upload not queued: ${data.error}`, 'error');
}

async function refreshUploads() {
  try { uploads = await (await api('/api/youtube/uploads')).json(); } catch { /* server busy */ }
  renderPlan();
  if (!$('tab-youtube').hidden) renderYouTube();
}
setInterval(() => { if (uploads.some((u) => u.status === 'queued' || u.status === 'uploading')) refreshUploads(); }, 8000);

// ---------- Family tab ----------
let pvWho = 'golu';
function renderFamily() {
  const b = bible();
  const langs = Object.keys(LANGUAGES);
  const nameInputs = (label, path, val) => langs.map((l) => field(`${label} (${LANGUAGES[l].label})`, `<input type="text" data-bind="${path}.${l}" value="${esc(val?.[l] ?? '')}" maxlength="40">`)).join('');
  $('tab-family').innerHTML = `
    <div class="section">
      <h3>The family</h3>
      <div class="row">${nameInputs('Family name', 'bible.familyName', b.familyName)}</div>
      <div class="row">${nameInputs('Series / channel name', 'bible.seriesName', b.seriesName)}</div>
      <p class="muted small">Everyone keeps the same look, clothes and voice in every episode. Change anything below; stories already rendered stay as they are. Body type (boy, girl, baby…) is fixed so the stories keep making sense.</p>
    </div>
    ${Object.entries(b.characters).map(([id, c]) => charCard(id, c, langs)).join('')}`;
}

function charCard(id, c, langs) {
  const p = `bible.characters.${id}`;
  const looks = Object.entries(LOOKS).filter(([k]) => c.looks[k] || k === 'home');
  const animal = !['boy', 'girl', 'baby', 'man', 'woman', 'grandpa', 'grandma', 'narrator', 'pandit'].includes(c.type);
  return `
    <div class="item char ${pvWho === id ? 'selected' : ''}">
      <div class="item-head">
        <span><span class="dot" style="background:${esc(c.looks.home?.accent || c.accent || '#ccc')}"></span><b>${esc(c.name.en)}</b> <span class="muted small">${esc(c.role)}${c.family ? '' : ' · friend'}</span></span>
        <span class="line-tools"><button class="icon-btn" data-act="pick-char" data-id="${id}" title="Show in preview">👁</button><button class="icon-btn" data-act="reset-char" data-id="${id}" title="Back to default">↺</button></span>
      </div>
      <div class="row">${langs.map((l) => field(`Name (${LANGUAGES[l].label})`, `<input type="text" data-bind="${p}.name.${l}" value="${esc(c.name[l] ?? '')}" maxlength="30">`)).join('')}</div>
      ${c.nick ? `<div class="row">${langs.map((l) => field(`Little ones call her (${LANGUAGES[l].label})`, `<input type="text" data-bind="${p}.nick.${l}" value="${esc(c.nick[l] ?? '')}" maxlength="20">`)).join('')}</div>` : ''}
      <div class="row3">
        ${field(animal ? 'Fur' : 'Skin', `<input type="color" data-bind="${p}.color" value="${esc(c.color)}">`)}
        ${animal ? field('Scarf', `<input type="color" data-bind="${p}.accent" value="${esc(c.accent || '#ff5c5c')}">`) : field('Hair', `<input type="color" data-bind="${p}.hair" value="${esc(c.hair || '#2a1a12')}">`)}
        ${field('Eyes', `<input type="color" data-bind="${p}.eyes" value="${esc(c.eyes)}">`)}
      </div>
      ${animal ? '' : looks.map(([k, label]) => `<div class="row3">
        ${field(`${label} outfit`, `<select data-bind="${p}.looks.${k}.outfit">${opts(OUTFITS, c.looks[k]?.outfit || c.looks.home.outfit)}</select>`)}
        ${field('Colour', `<input type="color" data-bind="${p}.looks.${k}.accent" value="${esc(c.looks[k]?.accent || c.looks.home.accent)}">`)}
        <span></span></div>`).join('')}
      ${langs.map((l) => `<div class="row3 voice-row">
        ${field(`Voice (${LANGUAGES[l].label})`, voiceSelect(`${p}.voices.${l}.voice`, c.voices[l]?.voice))}
        ${field('Pitch / speed', `<span class="pair"><input type="number" data-bind="${p}.voices.${l}.pitch" data-type="num" min="-50" max="50" value="${c.voices[l]?.pitch ?? 0}"><input type="number" data-bind="${p}.voices.${l}.rate" data-type="num" min="-50" max="50" value="${c.voices[l]?.rate ?? 0}"></span>`)}
        <button class="btn small" data-act="hear" data-id="${id}" data-lang="${l}">▶</button></div>`).join('')}
      ${field('Personality (for your reference)', `<textarea data-bind="${p}.traits" rows="2">${esc(c.traits)}</textarea>`)}
    </div>`;
}

const HEAR = { en: 'Hello! I am {name}. Welcome to our family stories!', hi: 'नमस्ते! मैं {name} हूँ। हमारी पारिवारिक कहानियों में आपका स्वागत है!' };
async function hearVoice(id, lang) {
  const b = bible();
  const cast = castMember(b, id, 'home', lang);
  try {
    audioCtx ??= new AudioContext();
    await audioCtx.resume();
    const item = await voices.load(cast, HEAR[lang].replace('{name}', nameOf(b, id, lang)), 'happy');
    const src = audioCtx.createBufferSource();
    src.buffer = item.buffer;
    src.connect(audioCtx.destination);
    src.start();
    pvWho = id;
    $('pv-who').value = id;
    await showPreview();
    preview.speak(item);
  } catch (err) { toast(`Voice failed: ${err.message}`, 'error'); }
}

// ---------- preview ----------
function setupPreview() {
  const b = bible();
  $('pv-who').innerHTML = Object.keys(b.characters).map((id) => `<option value="${id}">${esc(nameOf(b, id, 'en'))}</option>`).join('');
  $('pv-who').value = pvWho;
  $('pv-look').innerHTML = opts(LOOKS, 'home');
  $('pv-action').innerHTML = opts(ACTIONS, 'idle');
  $('pv-who').onchange = (e) => { pvWho = e.target.value; showPreview(); renderFamily(); };
  $('pv-look').onchange = showPreview;
  $('pv-action').onchange = (e) => preview.setAction(e.target.value);
  $('pv-voice').onclick = () => hearVoice(pvWho, state.settings.languages[0] || 'en');
}
async function showPreview() {
  const b = bible();
  const cast = castMember(b, pvWho, $('pv-look').value || 'home', 'en');
  $('preview-title').textContent = `${nameOf(b, pvWho, 'en')} · ${b.characters[pvWho].role}`;
  await preview.show(cast);
}

// ---------- Settings tab ----------
function renderSettings() {
  const s = state.settings;
  const check = (path, val, label, num) => `<label class="check"><input type="checkbox" data-bind="${path}" data-type="toggle" ${num ? 'data-num="1"' : ''} value="${esc(val)}" ${(getPath(state, path) || []).includes(val) ? 'checked' : ''}> ${esc(label)}</label>`;
  $('tab-settings').innerHTML = `
    <div class="section">
      <h3>How many videos</h3>
      <div class="row">
        ${field('Long episodes', `<input type="number" data-bind="settings.long.count" data-type="num" min="0" max="60" value="${s.long.count}">`)}
        ${field('Length of each (minutes)', `<input type="number" data-bind="settings.long.minutes" data-type="num" min="3" max="8" step="0.5" value="${s.long.minutes}">`)}
      </div>
      <div class="row">
        ${field('YouTube Shorts', `<input type="number" data-bind="settings.shorts.count" data-type="num" min="0" max="100" value="${s.shorts.count}">`)}
        ${field('Length of each (seconds)', `<input type="number" data-bind="settings.shorts.seconds" data-type="num" min="20" max="59" value="${s.shorts.seconds}">`)}
      </div>
      <p class="muted small">Long episodes: 3–8 minutes (some stories top out around 6–7). Shorts: 20–59 seconds, made vertical (9:16).</p>
    </div>
    <div class="section">
      <h3>Languages</h3>
      <div class="checks">${Object.entries(LANGUAGES).map(([k, l]) => check('settings.languages', k, l.label)).join('')}</div>
      <p class="muted small">Each episode is made in every language you tick (same story, its own voices, title and description).</p>
    </div>
    <div class="section">
      <h3>Kinds of stories</h3>
      <div class="checks">${Object.entries(THEMES).map(([k, l]) => check('settings.themes', k, l)).join('')}</div>
      ${field(`Stories with a moral: <span class="muted">${s.moralPercent}%</span> (the rest are just for fun)`, `<input type="range" data-bind="settings.moralPercent" data-type="num" data-rerender="1" min="0" max="100" step="10" value="${s.moralPercent}">`)}
      ${field(`Golu's vlogs: <span class="muted">${s.vlogPercent ?? 10}%</span> of episodes and Shorts (comedy, Golu talks to the viewers)`, `<input type="range" data-bind="settings.vlogPercent" data-type="num" data-rerender="1" min="0" max="50" step="5" value="${s.vlogPercent ?? 10}">`)}
      <label class="check"><input type="checkbox" data-bind="settings.intro" ${s.intro ? 'checked' : ''}> Start long episodes with the family's "Namaste, friends!" intro</label>
    </div>
    <div class="section">
      <h3>Titles & tags</h3>
      ${field('Long video title', `<input type="text" data-bind="settings.titleFormat" value="${esc(s.titleFormat)}">`)}
      ${field('Short title', `<input type="text" data-bind="settings.shortTitleFormat" value="${esc(s.shortTitleFormat)}">`)}
      <p class="muted small">{title} is the episode name, {series} your series name.</p>
      ${field('Tags (comma separated)', `<input type="text" data-bind="settings.tags" value="${esc(s.tags)}">`)}
    </div>
    <div class="section">
      <h3>Fresh stories</h3>
      <p class="muted small">Every time you press <b>Generate episodes</b> you get new scripts, and stories you've already had are skipped until all of them have been used. (Last idea number: ${s.seed}.)</p>
      <button class="btn small" data-act="forget-stories">Forget story history</button>
    </div>`;
}

// ---------- Schedule tab ----------
function renderSchedule() {
  const s = state.schedule;
  const dayChecks = (path) => DAYS.map((d, i) => `<label class="check day"><input type="checkbox" data-bind="${path}" data-type="toggle" data-num="1" value="${i}" ${(getPath(state, path) || []).includes(i) ? 'checked' : ''}> ${d}</label>`).join('');
  const preview = [...scheduleSlots(s, 'long', 4), ...scheduleSlots(s, 'short', 4)].filter(Boolean).sort().slice(0, 6)
    .map((t) => new Date(t).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }));
  $('tab-schedule').innerHTML = `
    <div class="section">
      <h3>Posting schedule</h3>
      <label class="check"><input type="checkbox" data-bind="schedule.enabled" data-rerender="1" ${s.enabled ? 'checked' : ''}> Give every new episode a publish time</label>
      ${field('Start from', `<input type="date" data-bind="schedule.startDate" data-rerender="1" value="${esc(s.startDate)}">`)}
      <h3>Long episodes</h3>
      <div class="checks">${dayChecks('schedule.longDays')}</div>
      ${field('Time', `<input type="time" data-bind="schedule.longTime" data-rerender="1" value="${esc(s.longTime)}">`)}
      <h3>Shorts</h3>
      <div class="checks">${dayChecks('schedule.shortDays')}</div>
      ${field('Times (comma separated, e.g. 12:00, 19:00)', `<input type="text" data-bind="schedule.shortTimes" data-type="list" data-rerender="1" value="${esc(s.shortTimes.join(', '))}">`)}
      <p class="muted small">Times are your computer's time zone (${esc(Intl.DateTimeFormat().resolvedOptions().timeZone)}). The schedule applies when you press <b>Generate episodes</b>; you can change any single date in the Episodes list.</p>
      <p class="small"><b>Next slots:</b> ${preview.map(esc).join(' · ') || '<span class="muted">none</span>'}</p>
      <p class="muted small">YouTube publishes scheduled videos itself, so your computer doesn't need to be on at that time. Rendering and uploading do need this page open.</p>
    </div>`;
}

// ---------- YouTube tab ----------
async function refreshYouTube() {
  try { yt = await (await api('/api/youtube/status')).json(); } catch { yt = { configured: false, connected: false }; }
}
async function saveClient() {
  const res = await api('/api/youtube/client', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: $('yt-id').value, clientSecret: $('yt-secret').value }) });
  const data = await res.json();
  if (!res.ok) return toast(data.error, 'error');
  await refreshYouTube();
  renderYouTube();
  toast('Saved. Now press "Connect my channel".');
}
function renderYouTube() {
  const y = state.youtube;
  $('tab-youtube').innerHTML = `
    <div class="section">
      <h3>Your channel</h3>
      ${yt.connected ? `<p>✅ Connected: <b>${esc(yt.channel?.title || '')}</b></p><button class="btn small" data-act="yt-disconnect">Disconnect</button>`
        : yt.configured ? '<p>Google app saved. Now sign in with the Google account that owns your channel:</p><a class="btn primary small" href="${serverUrl('/api/youtube/connect')}">Connect my channel</a>'
          : '<p class="muted">Not connected yet. One-time setup below (about 10 minutes).</p>'}
    </div>
    <div class="section">
      <h3>Upload settings</h3>
      <label class="check"><input type="checkbox" data-bind="youtube.autoUpload" ${y.autoUpload ? 'checked' : ''}> Upload each episode automatically when it finishes rendering</label>
      <label class="check"><input type="checkbox" data-bind="youtube.madeForKids" ${y.madeForKids ? 'checked' : ''}> Made for kids (required by YouTube/COPPA for children's content)</label>
      <div class="row">
        ${field('If no publish time', `<select data-bind="youtube.privacy">${opts({ private: 'Private', unlisted: 'Unlisted', public: 'Public' }, y.privacy)}</select>`)}
        ${field('Category', `<select data-bind="youtube.categoryId">${opts(CATEGORIES, y.categoryId)}</select>`)}
      </div>
      <p class="muted small">Episodes with a publish time are uploaded as private and YouTube makes them public at that time.</p>
    </div>
    <div class="section">
      <h3>Uploads</h3>
      ${uploads.length ? uploads.slice().reverse().slice(0, 30).map((u) => `<div class="item compact"><div class="item-head"><span>${esc(u.title)}</span>
        ${u.status === 'done' ? `<a class="badge ok" href="${esc(u.url)}" target="_blank" rel="noopener">${u.publishAt ? 'scheduled' : 'uploaded'} ↗</a>` : u.status === 'failed' ? `<span><span class="badge failed">failed</span> <button class="icon-btn" data-act="retry" data-id="${u.id}">↻</button></span>` : `<span class="badge processing">${esc(u.status)} ${u.progress ? u.progress + '%' : ''}</span>`}</div>
        ${u.error ? `<p class="small warn-text">${esc(u.error)}</p>` : ''}${u.publishAt ? `<p class="muted small">Goes public ${esc(new Date(u.publishAt).toLocaleString())}</p>` : ''}</div>`).join('') : '<p class="muted small">Nothing uploaded yet.</p>'}
    </div>
    <div class="section">
      <h3>One-time setup</h3>
      <ol class="small tips">
        <li>Open <a href="https://console.cloud.google.com/" target="_blank" rel="noopener">Google Cloud Console</a> and create a project (any name).</li>
        <li>In <b>APIs &amp; Services → Library</b>, enable <b>YouTube Data API v3</b>.</li>
        <li>In <b>OAuth consent screen</b>, choose <b>External</b>, fill in the app name and your email, and add your own Google account under <b>Test users</b>.</li>
        <li>In <b>Credentials → Create credentials → OAuth client ID</b>, choose <b>Web application</b> and add this <b>Authorized redirect URI</b>:<br><code>${esc(yt.redirectUri || 'http://127.0.0.1:8000/api/youtube/callback')}</code></li>
        <li>Copy the <b>Client ID</b> and <b>Client secret</b> here and press Save, then Connect.</li>
      </ol>
      <div class="row">
        ${field('Client ID', '<input type="text" id="yt-id" placeholder="…apps.googleusercontent.com">')}
        ${field('Client secret', '<input type="password" id="yt-secret">')}
      </div>
      <button class="btn small" data-act="yt-save">Save</button>
      <p class="muted small">Stored only on this computer (in the <code>data</code> folder).</p>
      <p class="muted small"><b>Good to know:</b> YouTube keeps videos uploaded by a new, unverified Google app <b>private</b> until the app passes Google's API audit (request it in the Cloud Console). Until then, scheduled videos stay private; you can make them public by hand in YouTube Studio. YouTube also allows about <b>6 uploads per day</b> with the free API quota; extra uploads wait and can be retried the next day.</p>
    </div>`;
}

// ---------- start ----------
async function init() {
  try { voiceList = await (await api('/api/voices')).json(); } catch { voiceList = []; }
  try {
    const saved = await (await api('/api/series')).json();
    if (saved && saved.settings) state = { ...structuredClone(DEFAULT_STATE), ...saved, settings: { ...DEFAULT_SETTINGS, ...saved.settings }, schedule: { ...DEFAULT_STATE.schedule, ...saved.schedule }, youtube: { ...DEFAULT_STATE.youtube, ...saved.youtube } };
  } catch { /* first run */ }
  // a render cut off by closing the tab can be done again
  for (const it of state.plan) if (it.status === 'rendering') it.status = 'planned';
  await refreshYouTube();
  await refreshUploads();
  stage.setQuality({ scale: 0.4, effects: false });
  setupPreview();
  renderAll();
  showPreview();
  const q = new URLSearchParams(location.search);
  if (q.get('yt') === 'connected') { toast('YouTube connected!'); document.querySelector('.tab[data-tab="youtube"]').click(); }
  if (q.get('yt_error')) { toast(`YouTube: ${q.get('yt_error')}`, 'error'); document.querySelector('.tab[data-tab="youtube"]').click(); }
  if (q.size) history.replaceState(null, '', 'series.html');
}
window.addEventListener('beforeunload', (e) => {
  flushSave();
  // the browser asks "Leave site?"; by the time you answer, the save has finished
  if (job || inFlight) { e.preventDefault(); e.returnValue = ''; }
});
init();
