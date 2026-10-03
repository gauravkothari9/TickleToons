import { api, requireLogin } from './api.js';
import { Stage } from './engine/stage.js';
import { VoiceLibrary, playStory, displayText, musicPlan } from './engine/audio.js';
import { renderVideo } from './render.js';
import * as S from './story.js';
import { CharacterPreview } from './preview.js';
requireLogin(); // off to the login page if the server wants one

const $ = (id) => document.getElementById(id);
const DRAFT_KEY = 'tickle-toons-story-v2';
const QUALITY = { pretty: { scale: 0.5, effects: true }, fast: { scale: 0.4, effects: false } };

const voices = new VoiceLibrary();
const stage = new Stage($('output'));
const preview = new CharacterPreview($('char-preview'));
let story = S.starterStory();
let selected = 0;
let castSel = 0; // character shown in the 3D preview
let T = 0.8; // just past the opening fade, so the paused preview isn't black
let playing = false;
let playStart = 0;
let stopAudio = () => {};
let audioCtx = null;
let voiceList = [];
let renderJob = null;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const castName = (id) => story.cast.find((c) => c.id === id)?.name || '?';
const audio = () => { audioCtx ??= new AudioContext(); audioCtx.resume(); return audioCtx; };

// ---------- persistence ----------
function save() {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(story)); } catch { /* storage unavailable */ }
}
function loadDraft() {
  try { const s = JSON.parse(localStorage.getItem(DRAFT_KEY)); return s ? S.normalizeStory(s) : null; } catch { return null; }
}

// ---------- status ----------
function status(msg, kind = '') {
  $('status').textContent = msg;
  $('status').className = `status ${kind}`;
}

// ---------- rebuild pipeline ----------
let rebuildTimer = null, rebuildSeq = 0;
function changed({ ui = true, delay = 350 } = {}) {
  save();
  if (ui) renderPanels();
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(rebuild, delay);
}

/** Lines (by id) that have no voice: they're marked in the Shot tab and the shot strip, with a retry button. */
let noVoice = new Set();
function markNoVoice() {
  for (const el of document.querySelectorAll('[data-novoice]')) el.hidden = !noVoice.has(el.dataset.novoice);
}

async function rebuild() {
  clearTimeout(rebuildTimer);
  const seq = ++rebuildSeq;
  const wasPlaying = playing;
  if (playing) pause();
  const snapshot = structuredClone(story);
  await voices.prepare(snapshot, (done, total, _f, round) => {
    if (total && seq === rebuildSeq) status(`Making voices… ${done}/${total}${round ? ' (trying again)' : ''}`);
  }, { retries: 1 });
  if (seq !== rebuildSeq) return;
  const missing = voices.missing(snapshot);
  noVoice = new Set(missing.map((m) => m.line.id));
  markNoVoice();
  let ok;
  try { ok = await stage.load(snapshot, voices); } catch (err) { console.error(err); status(`Could not build scene: ${err.message}`, 'error'); return; }
  if (!ok || seq !== rebuildSeq) return;
  $('loading').hidden = true;
  $('scrub').max = stage.timeline.total;
  T = Math.min(T, stage.timeline.total);
  stage.render(T);
  updateTime();
  renderStrip();
  renderShotHeader();
  if (missing.length) {
    const shots = [...new Set(missing.map((m) => m.shot + 1))];
    status(`${missing.length} line(s) couldn't get a voice (in shot${shots.length > 1 ? 's' : ''} ${shots.join(', ')}). They show as subtitles for now.`, 'error');
    $('status').insertAdjacentHTML('beforeend', ' <button class="btn small" data-act="retry-voices">↻ Retry those lines</button>');
  } else status('');
  if (wasPlaying) play();
}

// ---------- small form helpers ----------
// Labels like "Baby: Crawl" go into an optgroup "Baby" showing "Crawl".
const opts = (dict, v) => {
  const groups = new Map();
  for (const [k, label] of Object.entries(dict)) {
    const text = String(label?.label ?? label), i = text.indexOf(': ');
    const g = i > 0 ? text.slice(0, i) : '';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(`<option value="${esc(k)}"${k === v ? ' selected' : ''}>${esc(i > 0 ? text.slice(i + 2) : text)}</option>`);
  }
  return [...groups].map(([g, o]) => (g ? `<optgroup label="${esc(g)}">${o.join('')}</optgroup>` : o.join(''))).join('');
};
const sel = (path, dict, v, extra = '') => `<select data-bind="${path}" ${extra}>${opts(dict, v)}</select>`;
const field = (label, control, cls = '') => `<label class="field ${cls}">${label}${control}</label>`;
const range = (path, min, max, step, v) => `<input type="range" data-bind="${path}" data-type="num" min="${min}" max="${max}" step="${step}" value="${v}">`;
const color = (path, v) => `<input type="color" data-bind="${path}" value="${v}">`;
const typeOf = (castId) => story.cast.find((c) => c.id === castId)?.type;
const castDict = () => Object.fromEntries(story.cast.map((c) => [c.id, `${c.name} (${S.SPECIES[c.type].label.split(' ')[0]})`]));

function getPath(path) { return path.split('.').reduce((o, k) => o?.[k], story); }
function setPath(path, value) {
  const keys = path.split('.');
  const obj = keys.slice(0, -1).reduce((o, k) => o[k], story);
  obj[keys.at(-1)] = value;
}

// ---------- panels ----------
function renderPanels() {
  selected = Math.min(selected, story.shots.length - 1);
  renderShotTab();
  renderCastTab();
  renderStoryTab();
  renderStrip();
  $('title').value = story.title;
}

function renderShotHeader() {
  const el = document.querySelector('#tab-shot .shot-len');
  const tl = stage.timeline?.shots[selected];
  if (el && tl) el.textContent = `${tl.duration.toFixed(1)}s`;
  // what the music is actually doing in this shot
  const m = document.querySelector('#tab-shot .shot-music');
  if (m && tl) {
    const cue = musicPlan(story, stage.timeline).find((c) => tl.start >= c.start - 0.01 && tl.start < c.end - 0.01);
    m.textContent = cue ? `(playing: ${S.MUSIC[cue.style]})` : '(silent)';
  }
}

function renderShotTab() {
  const sh = story.shots[selected];
  const p = `shots.${selected}`;
  const inShot = new Set(sh.actors.map((a) => a.castId));
  const addable = story.cast.filter((c) => !inShot.has(c.id));
  $('tab-shot').innerHTML = `
    <div class="section">
      <h3>Shot ${selected + 1} <span class="muted shot-len"></span></h3>
      <div class="row">
        ${field('Place', sel(`${p}.world`, S.WORLDS, sh.world))}
        ${field('Camera', sel(`${p}.camera`, S.CAMERAS, sh.camera))}
      </div>
      <div class="row">
        ${field('Then', sel(`${p}.transition`, S.TRANSITIONS, sh.transition))}
        ${field('Min length (sec)', `<input type="number" data-bind="${p}.minDuration" data-type="num" min="1" max="60" step="0.5" value="${sh.minDuration}">`)}
      </div>
      <div class="row">
        ${field('Time of day', sel(`${p}.time`, S.TIMES, sh.time || 'auto'))}
        ${field('Time card', `<input type="text" data-bind="${p}.card" value="${esc(sh.card || '')}" maxlength="40" placeholder="e.g. Day 2, Next morning">`)}
      </div>
      ${field('Music <span class="muted shot-music"></span>', sel(`${p}.music`, S.SHOT_MUSIC, sh.music))}
    </div>

    <div class="section">
      <h3>Who's in this shot</h3>
      ${sh.actors.map((a, i) => actorCard(a, `${p}.actors.${i}`, i)).join('') || '<p class="muted">Nobody yet.</p>'}
      ${addable.length ? `<div class="add-row"><select id="add-actor">${addable.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select><button class="btn small" data-act="add-actor">+ Add to shot</button></div>` : ''}
    </div>

    <div class="section">
      <h3>Dialogue</h3>
      ${sh.lines.map((l, i) => lineCard(l, `${p}.lines.${i}`, i, sh)).join('') || '<p class="muted">No lines. Characters will just act.</p>'}
      <button class="btn small" data-act="add-line" ${story.cast.length ? '' : 'disabled'}>+ Add line</button>
      <p class="muted small">Delivery tips: the emotion changes how the voice sounds. In the text, <b>|</b> adds a short beat,
        <b>[0.8]</b> a pause of 0.8 s, and <b>*words*</b> stresses them. Stretch words for feeling: "Yaaay!", "Ohhh nooo..."</p>
    </div>

    <div class="section">
      <h3>Props on the ground</h3>
      ${sh.props.map((pr, i) => `
        <div class="item compact">
          <div class="row3">
            ${sel(`${p}.props.${i}.kind`, Object.fromEntries(Object.entries(S.PROPS).filter(([k]) => k !== 'none')), pr.kind)}
            ${range(`${p}.props.${i}.x`, -5, 5, 0.1, pr.x)}
            <button class="remove" data-act="del-prop" data-i="${i}" title="Remove">✕</button>
          </div>
        </div>`).join('')}
      <button class="btn small" data-act="add-prop">+ Add prop</button>
    </div>`;
  renderShotHeader();
}

function actorCard(a, p, i) {
  const c = story.cast.find((x) => x.id === a.castId);
  return `
    <div class="item">
      <div class="item-head"><span><span class="dot" style="background:${c.color}"></span>${esc(c.name)}</span>
        <button class="remove" data-act="del-actor" data-i="${i}" title="Remove from shot">✕</button></div>
      <div class="row">
        ${field('Does', sel(`${p}.action`, S.ACTIONS, a.action))}
        ${field('Face (when quiet)', sel(`${p}.mood`, S.EMOTIONS, a.mood))}
      </div>
      <div class="row">
        ${field('Enters', sel(`${p}.enter`, S.ENTRANCES, a.enter))}
        ${field('Leaves', sel(`${p}.exit`, S.EXITS, a.exit))}
      </div>
      <div class="row">
        ${field('Holding', sel(`${p}.holds`, S.PROPS, a.holds))}
        <div></div>
      </div>
      <div class="row">
        ${field('Left ↔ Right', range(`${p}.x`, -4, 4, 0.1, a.x))}
        ${field('Back ↔ Front', range(`${p}.z`, -3, 2, 0.1, a.z))}
      </div>
    </div>`;
}

function lineCard(l, p, i, sh) {
  const c = story.cast.find((x) => x.id === l.castId);
  const warn = !sh.actors.some((a) => a.castId === l.castId) ? '<span class="warn" title="This character is not in the shot, so only their voice is heard">off-screen</span>' : '';
  return `
    <div class="item line" style="border-left-color:${c?.color || '#ccc'}">
      <div class="row3">
        ${sel(`${p}.castId`, castDict(), l.castId)}
        ${sel(`${p}.emotion`, S.EMOTIONS, l.emotion)}
        <span class="line-tools">
          <button class="icon-btn" data-act="play-line" data-i="${i}" title="Play from this line">▶</button>
          <button class="icon-btn" data-act="line-up" data-i="${i}" title="Move up" ${i ? '' : 'disabled'}>↑</button>
          <button class="icon-btn" data-act="line-down" data-i="${i}" title="Move down" ${i < sh.lines.length - 1 ? '' : 'disabled'}>↓</button>
          <button class="remove" data-act="del-line" data-i="${i}" title="Delete line">✕</button>
        </span>
      </div>
      <textarea data-bind="${p}.text" rows="2" maxlength="300" placeholder="What do they say?">${esc(l.text)}</textarea>
      <label class="field inline small">Pause before (sec)
        <input type="number" data-bind="${p}.pause" data-type="optnum" min="0" max="5" step="0.1" value="${l.pause ?? ''}" placeholder="auto"></label>
      <label class="field inline small" title="What the body does while saying it. Auto reads the words: Bye waves, Yes nods, No shakes the head, Look points, Hmm thinks, Thank you folds hands">Gesture
        ${sel(`${p}.gesture`, S.GESTURES, l.gesture || 'auto')}</label>
      ${(l.gesture || 'auto') === 'auto' ? `<span class="muted small" data-gesture-hint>${S.lineGestures(l).map((g) => S.GESTURES[g.action]).join(', ')}</span>` : ''}
      ${warn}
      <span class="warn no-voice" data-novoice="${l.id}" ${noVoice.has(l.id) ? '' : 'hidden'}>No voice yet (shows as subtitles)
        <button class="btn small" data-act="retry-line" data-i="${i}">↻ Make this line's voice again</button></span>
    </div>`;
}

/** Keep the line's 'auto gesture' hint in step with the words while typing. */
function gestureHint(card) {
  const hint = card?.querySelector('[data-gesture-hint]');
  if (!hint) return;
  const text = card.querySelector('textarea').value, emotion = card.querySelector('select[data-bind$=".emotion"]')?.value;
  hint.textContent = S.lineGestures({ text, emotion }).map((g) => S.GESTURES[g.action]).join(', ');
}

function renderCastTab() {
  castSel = Math.max(0, Math.min(castSel, story.cast.length - 1));
  $('cast-list').innerHTML = `
    ${story.cast.map((c, i) => {
      const p = `cast.${i}`;
      const human = S.SPECIES[c.type].kind === 'human';
      return `
      <div class="item${i === castSel ? ' selected' : ''}" data-cast="${i}">
        <div class="item-head"><input type="text" data-bind="${p}.name" value="${esc(c.name)}" maxlength="30" class="name-input">
          <button class="remove" data-act="del-cast" data-i="${i}" title="Delete character">✕</button></div>
        <div class="row">
          ${field('Type', sel(`${p}.type`, S.SPECIES, c.type))}
          ${field(human ? 'Skin' : 'Fur', color(`${p}.color`, c.color))}
        </div>
        ${human ? field('Outfit', sel(`${p}.outfit`, S.OUTFITS, c.outfit)) : ''}
        <div class="row">
          ${field(human ? 'Clothes colour' : 'Scarf', color(`${p}.accent`, c.accent))}
          ${human ? field('Hair', color(`${p}.hair`, c.hair)) : field('Eyes', color(`${p}.eyes`, c.eyes))}
        </div>
        ${human ? `<div class="row">${field('Eyes', color(`${p}.eyes`, c.eyes))}<div></div></div>` : ''}
        ${S.SPECIES[c.type].mane ? `<div class="row">${field('Mane', color(`${p}.hair`, c.hair))}<div></div></div>` : ''}
        ${field('Voice &amp; language', voiceSelect(`${p}.voice`, c.voice))}
        ${S.SPECIES[c.type].kind === 'animal' ? field('Animal sounds', sel(`${p}.animalSounds`, S.ANIMAL_SOUNDS, c.animalSounds || 'auto')) : ''}
        ${human ? field('Laughs &amp; emotion sounds', sel(`${p}.vocalSounds`, S.VOCAL_SOUNDS, c.vocalSounds || 'auto')) : ''}
        <div class="row">
          ${field(`Pitch <span class="muted">${c.pitch > 0 ? '+' : ''}${c.pitch}</span>`, range(`${p}.pitch`, -40, 40, 1, c.pitch))}
          ${field(`Speed <span class="muted">${c.rate > 0 ? '+' : ''}${c.rate}%</span>`, range(`${p}.rate`, -40, 40, 1, c.rate))}
        </div>
        <button class="btn small" data-act="test-voice" data-i="${i}">▶ Hear voice</button>
      </div>`;
    }).join('')}
    <div class="add-row">
      <select id="new-cast-type">${opts(S.SPECIES, 'bunny')}</select>
      <button class="btn small" data-act="add-cast">+ New character</button>
    </div>
    <p class="muted small">Tip: a higher pitch plus a child voice makes cute cartoon voices. For Hindi + English in the same line, pick a <b>speaks any language</b> voice and write Hindi in Devanagari (नमस्ते).</p>
    <p class="muted small">Real laughs: write <b>Hehe!</b>, <b>Ha ha ha!</b>, <b>हीही</b>, <b>Hmm...</b>, <b>Aww</b>, <b>sniff</b> or a stage direction like <b>(laughs)</b>, <b>(gasps)</b>, <b>(sighs)</b>, <b>(cries)</b>, <b>(yawns)</b> and the character makes the real sound instead of reading the letters.</p>`;
  showPreview();
}

// Voices grouped by language; a saved voice that's no longer listed still shows.
function voiceSelect(path, v) {
  const groups = new Map();
  for (const x of voiceList) {
    const g = x.group || 'Voices';
    if (!groups.has(g)) groups.set(g, {});
    groups.get(g)[x.id] = x.label;
  }
  const known = voiceList.some((x) => x.id === v);
  return `<select data-bind="${path}">${known ? '' : opts({ [v]: v }, v)}${[...groups].map(([g, d]) => `<optgroup label="${esc(g)}">${opts(d, v)}</optgroup>`).join('')}</select>`;
}

function showPreview() {
  const c = story.cast[castSel];
  $('preview-name').textContent = c ? c.name : 'No characters yet';
  if (c) preview.show(c);
}

function selectCast(i) {
  if (i === castSel) return;
  castSel = i;
  document.querySelectorAll('#cast-list .item[data-cast]').forEach((el) => el.classList.toggle('selected', Number(el.dataset.cast) === i));
  showPreview();
}

function renderStoryTab() {
  $('tab-story').innerHTML = `
    <div class="section">
      <h3>Video</h3>
      ${field('Format', sel('aspect', S.FORMAT_LABELS, story.aspect))}
      ${field('Music', sel('music', S.MUSIC, story.music))}
      ${field('Music volume', range('musicVolume', 0, 1, 0.05, story.musicVolume))}
      ${field('Background sounds <span class="muted">(birds, waves, market chatter…)</span>', range('ambience', 0, 1, 0.05, story.ambience))}
      <label class="check"><input type="checkbox" data-bind="musicMood" data-type="bool" ${story.musicMood ? 'checked' : ''}> Music changes with each scene's mood (sad, suspense, celebration…)</label>
      <label class="check"><input type="checkbox" data-bind="subtitles" data-type="bool" ${story.subtitles ? 'checked' : ''}> Show subtitles</label>
      <label class="check"><input type="checkbox" data-bind="titleCard" data-type="bool" ${story.titleCard ? 'checked' : ''}> Show title at the start</label>
    </div>
    <div class="section">
      <h3>Story file</h3>
      <div class="btn-col">
        <button class="btn small" data-act="new-story">Start a blank story</button>
        <button class="btn small" data-act="example-story">Load the example story</button>
        <button class="btn small" data-act="export">Save story to a file</button>
        <label class="btn small file-btn">Open story file<input type="file" id="import" accept=".json,application/json" hidden></label>
      </div>
    </div>
    <div class="section">
      <h3>How it works</h3>
      <ol class="muted small tips">
        <li><b>Characters</b> tab: create your cast and pick their voices.</li>
        <li><b>Shot</b> tab: choose a place, who is there, what they do and what they say.</li>
        <li>Add more shots below the preview to tell the story.</li>
        <li>Press <b>Make video</b> to render a 1080p MP4 for YouTube.</li>
      </ol>
    </div>`;
}

function renderStrip() {
  const tl = stage.timeline?.shots || [];
  const icons = { meadow: '🌼', forest: '🌲', beach: '🏖️', night: '🌙', bedroom: '🛏️', space: '🚀', pond: '🦆', house: '🏡', playground: '🛝',
    school: '🏫', classroom: '📚', hospital: '🏥', police: '🚓', mall: '🛍️', market: '🧺', kitchen: '🍳', street: '🏙️', birthday: '🎂', wedding: '💍', reception: '🎊' };
  $('strip').innerHTML = story.shots.map((sh, i) => `
    <div class="shot-card ${i === selected ? 'active' : ''}" data-shot="${i}">
      <div class="shot-top"><span>${icons[sh.world] || '🎬'} ${i + 1}${sh.lines.some((l) => noVoice.has(l.id)) ? ' <span title="Some lines in this shot have no voice">⚠️</span>' : ''}</span><span class="muted">${tl[i] ? tl[i].duration.toFixed(1) + 's' : ''}</span></div>
      <div class="shot-text">${esc(sh.lines[0] ? `${castName(sh.lines[0].castId)}: ${displayText(sh.lines[0].text)}` : S.WORLDS[sh.world])}</div>
      ${i === selected ? `<div class="shot-tools">
        <button class="icon-btn" data-act="shot-left" title="Move earlier" ${i ? '' : 'disabled'}>◀</button>
        <button class="icon-btn" data-act="shot-dup" title="Duplicate">⧉</button>
        <button class="icon-btn" data-act="shot-right" title="Move later" ${i < story.shots.length - 1 ? '' : 'disabled'}>▶</button>
        <button class="icon-btn danger" data-act="shot-del" title="Delete" ${story.shots.length > 1 ? '' : 'disabled'}>✕</button>
      </div>` : ''}
    </div>`).join('') + '<button class="shot-card add" data-act="shot-add">+ New shot</button>';
}

/** Make one line's voice again (the rest of the story is left as it is), then rebuild the scene. */
async function retryLine(line, btn) {
  const cast = story.cast.find((c) => c.id === line?.castId);
  if (!cast) return;
  btn.disabled = true;
  btn.textContent = 'Making voice…';
  try {
    await voices.load(cast, line.text, line.emotion);
  } catch (err) {
    btn.disabled = false;
    btn.textContent = '↻ Make this line\'s voice again';
    return status(`That line still has no voice: ${err.message}. Try again in a minute.`, 'error');
  }
  return rebuild();
}

// ---------- editing events ----------
function applyBind(el) {
  const path = el.dataset.bind;
  let v = el.type === 'checkbox' ? el.checked : el.value;
  if (el.dataset.type === 'num') v = Number(v);
  if (el.dataset.type === 'optnum') v = v === '' ? null : Number(v);
  setPath(path, v);
  if (path === 'aspect') stage.resize();
  // switching type resets colors to that species' defaults
  const m = path.match(/^cast\.(\d+)\.type$/);
  if (m) {
    const d = S.newCast(v);
    Object.assign(story.cast[m[1]], { color: d.color, accent: d.accent, hair: d.hair, eyes: d.eyes, outfit: d.outfit, voice: d.voice, pitch: d.pitch, rate: d.rate, animalSounds: d.animalSounds, vocalSounds: d.vocalSounds });
  }
}

document.addEventListener('input', (e) => {
  const el = e.target;
  if (!el.dataset?.bind || renderJob) return;
  applyBind(el);
  if (/^cast\./.test(el.dataset.bind)) showPreview();
  if (el.tagName === 'TEXTAREA') gestureHint(el.closest('.line'));
  if (el.tagName === 'TEXTAREA' || el.type === 'text' || el.type === 'number') { save(); return; }
  if (el.type === 'range') {
    const label = el.closest('.field')?.querySelector('.muted');
    if (label && /pitch|rate/.test(el.dataset.bind)) label.textContent = `${el.value > 0 ? '+' : ''}${el.value}${/rate/.test(el.dataset.bind) ? '%' : ''}`;
    changed({ ui: false, delay: 120 });
  }
});

document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.id === 'import') return importStory(el.files[0]);
  if (!el.dataset?.bind || renderJob) return;
  applyBind(el);
  const keepUi = el.tagName === 'TEXTAREA' || el.type === 'text' || el.type === 'range';
  changed({ ui: !keepUi });
});

document.addEventListener('focusin', (e) => {
  const card = e.target.closest?.('#cast-list .item[data-cast]');
  if (card) selectCast(Number(card.dataset.cast));
});

document.addEventListener('click', (e) => {
  const card = e.target.closest('#cast-list .item[data-cast]');
  if (card && !e.target.closest('[data-act="del-cast"]')) selectCast(Number(card.dataset.cast));
  const btn = e.target.closest('[data-act], .shot-card[data-shot]');
  if (!btn || btn.disabled || renderJob) return;
  const act = btn.dataset.act;
  const i = Number(btn.dataset.i);
  const sh = story.shots[selected];
  if (!act && btn.dataset.shot !== undefined) return selectShot(Number(btn.dataset.shot), true);

  switch (act) {
    case 'add-actor': {
      const castId = $('add-actor').value;
      const used = sh.actors.map((a) => a.x);
      const x = [0, -1.6, 1.6, -3, 3].find((v) => !used.some((u) => Math.abs(u - v) < 0.8)) ?? 0;
      const narrator = typeOf(castId) === 'narrator';
      sh.actors.push({ castId, x, z: 0, action: narrator ? 'sitcross' : S.defaultAction(typeOf(castId)), mood: narrator ? 'calm' : 'happy', holds: narrator ? 'sitar' : 'none', enter: 'none', exit: 'none' });
      return changed();
    }
    case 'del-actor': sh.actors.splice(i, 1); return changed();
    case 'add-line': {
      const last = sh.lines.at(-1);
      const speakers = sh.actors.map((a) => a.castId);
      const next = speakers.find((id) => id !== last?.castId) || speakers[0] || story.cast[0].id;
      sh.lines.push({ id: S.uid(), castId: next, emotion: 'happy', text: '' });
      changed();
      document.querySelector('#tab-shot .line:last-of-type textarea')?.focus();
      return;
    }
    case 'del-line': sh.lines.splice(i, 1); return changed();
    case 'line-up': [sh.lines[i - 1], sh.lines[i]] = [sh.lines[i], sh.lines[i - 1]]; return changed();
    case 'line-down': [sh.lines[i + 1], sh.lines[i]] = [sh.lines[i], sh.lines[i + 1]]; return changed();
    case 'play-line': {
      const line = stage.timeline?.shots[selected]?.lines.find((l) => l.id === sh.lines[i].id);
      if (line) { seek(Math.max(0, line.start - 0.3)); play(); }
      return;
    }
    case 'add-prop': sh.props.push({ kind: 'ball', x: 2.2, z: 0.5 }); return changed();
    case 'del-prop': sh.props.splice(i, 1); return changed();
    case 'add-cast': {
      const c = S.newCast($('new-cast-type').value);
      story.cast.push(c);
      castSel = story.cast.length - 1;
      changed();
      return;
    }
    case 'del-cast': {
      const c = story.cast[i];
      if (!confirm(`Delete ${c.name}? Their lines and appearances in every shot will be removed.`)) return;
      story.cast.splice(i, 1);
      for (const s of story.shots) {
        s.actors = s.actors.filter((a) => a.castId !== c.id);
        s.lines = s.lines.filter((l) => l.castId !== c.id);
      }
      return changed();
    }
    case 'test-voice': return testVoice(story.cast[i]);
    case 'retry-voices': btn.disabled = true; return rebuild(); // only the lines without a voice are made again
    case 'retry-line': return retryLine(sh.lines[i], btn);
    case 'shot-add': {
      const prev = story.shots[selected];
      const shot = S.newShot(prev.actors.map((a) => a.castId), prev.world, typeOf);
      story.shots.splice(selected + 1, 0, shot);
      selectShot(selected + 1, false);
      return changed();
    }
    case 'shot-dup': {
      const copy = structuredClone(sh);
      copy.id = S.uid();
      copy.lines.forEach((l) => { l.id = S.uid(); });
      story.shots.splice(selected + 1, 0, copy);
      selectShot(selected + 1, false);
      return changed();
    }
    case 'shot-del':
      if (!confirm(`Delete shot ${selected + 1}?`)) return;
      story.shots.splice(selected, 1);
      selected = Math.max(0, selected - 1);
      return changed();
    case 'shot-left': [story.shots[selected - 1], story.shots[selected]] = [sh, story.shots[selected - 1]]; selected--; return changed();
    case 'shot-right': [story.shots[selected + 1], story.shots[selected]] = [sh, story.shots[selected + 1]]; selected++; return changed();
    case 'new-story':
      if (!confirm('Start a blank story? Your current story will be replaced (save it to a file first if you want to keep it).')) return;
      story = S.normalizeStory({ title: 'My New Story', cast: [S.newCast('bunny'), S.newCast('girl')], shots: [] });
      story.shots = [S.newShot(story.cast.map((c) => c.id), 'meadow', typeOf)];
      selected = 0; T = 0;
      return changed();
    case 'example-story':
      if (!confirm('Load the example story? Your current story will be replaced.')) return;
      story = S.starterStory(); selected = 0; T = 0;
      return changed();
    case 'export': return exportStory();
  }
});

document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === tab));
  for (const name of ['shot', 'cast', 'story']) $(`tab-${name}`).hidden = name !== tab.dataset.tab;
}));

$('preview-action').innerHTML = opts(S.ACTIONS, 'idle');
$('preview-mood').innerHTML = opts(S.EMOTIONS, 'happy');
$('preview-action').addEventListener('change', (e) => preview.setAction(e.target.value));
$('preview-mood').addEventListener('change', (e) => preview.setMood(e.target.value));

$('title').addEventListener('input', (e) => { story.title = e.target.value; save(); });
$('title').addEventListener('change', () => changed({ ui: false }));

function selectShot(i, doSeek) {
  selected = i;
  renderShotTab();
  renderStrip();
  if (doSeek && stage.timeline?.shots[i]) { pause(); seek(stage.timeline.shots[i].start + 0.01); }
  document.querySelector('.tab[data-tab="shot"]').click();
}

async function testVoice(cast) {
  const text = `Hi! I'm ${cast.name}. Let's go on an adventure!`;
  status('Making voice…');
  try {
    // animals greet with their call first
    const item = await voices.load(cast, text, S.SPECIES[cast.type].kind === 'animal' ? 'excited' : 'neutral');
    selectCast(story.cast.indexOf(cast));
    const ctx = audio();
    const src = ctx.createBufferSource();
    src.buffer = item.buffer;
    src.connect(ctx.destination);
    src.start();
    preview.speak(item);
    status('');
  } catch (err) {
    status(`Voice failed: ${err.message}`, 'error');
  }
}

function exportStory() {
  const blob = new Blob([JSON.stringify(story, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${story.title.replace(/[^\w\- ]+/g, '').trim() || 'story'}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importStory(file) {
  if (!file) return;
  try {
    story = S.normalizeStory(JSON.parse(await file.text()));
    selected = 0; T = 0;
    changed();
    status(`Opened "${story.title}".`);
  } catch {
    status('That file is not a Tickle Toons story.', 'error');
  }
}

// ---------- playback ----------
function updateTime() {
  const total = stage.timeline?.total || 0;
  $('time').textContent = `${fmt(T)} / ${fmt(total)}`;
  $('scrub').value = T;
  const cur = stage.timeline?.shots.findIndex((s) => T >= s.start && T < s.end) ?? -1;
  document.querySelectorAll('.shot-card[data-shot]').forEach((el) => el.classList.toggle('playing', Number(el.dataset.shot) === cur));
}

function seek(t) {
  T = Math.max(0, Math.min(t, stage.timeline?.total || 0));
  stage.render(T);
  updateTime();
}

let slowFrames = 0;
function play() {
  if (!stage.timeline || renderJob) return;
  if (T >= stage.timeline.total - 0.05) T = 0;
  stopAudio();
  stopAudio = playStory(audio(), stage.timeline, stage.story, voices, T);
  playing = true;
  playStart = performance.now() - T * 1000;
  $('btn-play').textContent = '❚❚ Pause';
  slowFrames = 0;
  requestAnimationFrame(tick);
}

function pause() {
  playing = false;
  stopAudio();
  stopAudio = () => {};
  $('btn-play').textContent = '▶ Play';
}

function tick() {
  if (!playing) return;
  const t0 = performance.now();
  T = (t0 - playStart) / 1000;
  if (T >= stage.timeline.total) { T = stage.timeline.total; pause(); }
  stage.render(T);
  updateTime();
  // auto-switch to fast preview on slow computers
  if ($('quality').value === 'pretty' && performance.now() - t0 > 70 && ++slowFrames > 40) {
    $('quality').value = 'fast';
    stage.setQuality(QUALITY.fast);
    status('Switched to fast preview so playback stays smooth. The final video is always full quality.');
  }
  if (playing) requestAnimationFrame(tick);
}

$('btn-play').addEventListener('click', () => (playing ? pause() : play()));
$('scrub').addEventListener('input', (e) => { if (playing) pause(); seek(Number(e.target.value)); });
$('quality').addEventListener('change', (e) => { stage.setQuality(QUALITY[e.target.value]); seek(T); });
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !renderJob) {
    e.preventDefault();
    playing ? pause() : play();
  }
});

// ---------- final render ----------
async function makeVideo() {
  if (renderJob) return;
  pause();
  const modal = $('render-modal');
  const step = (msg, pct, eta = '') => { $('render-step').textContent = msg; $('render-bar').style.width = `${pct}%`; $('render-eta').textContent = eta; };
  const job = (renderJob = { cancelled: false });
  modal.hidden = false;
  try {
    const snapshot = structuredClone(story);
    step('Making voices…', 2);
    const failed = await voices.prepare(snapshot, (d, n, _f, round) => n && step(`Making voices… ${d}/${n}${round ? ` (retry ${round})` : ''}`, 2), { retries: 3 });
    if (failed) {
      const shots = [...new Set(voices.missing(snapshot).map((m) => m.shot + 1))].join(', ');
      if (!confirm(`${failed} line(s) still have no voice (shots ${shots}). Make the video anyway (they'll be subtitles only)?\n\nPress Cancel, then "Retry those lines" under the preview to try again.`)) throw new Error('cancelled');
    }
    const id = await renderVideo(stage, voices, snapshot, $('output'), { onStep: step, isCancelled: () => job.cancelled, voiceRetries: 0 });
    location.href = `/?v=${id}`;
  } catch (err) {
    if (err.message !== 'cancelled') status(`Video failed: ${err.message}`, 'error');
    modal.hidden = true;
    renderJob = null;
    stage.setQuality(QUALITY[$('quality').value]);
    if (err.message === 'cancelled') return rebuild(); // shows which lines still need a voice, with the retry button
    await stage.load(structuredClone(story), voices);
    seek(T);
  }
}

$('btn-render').addEventListener('click', makeVideo);
$('btn-cancel').addEventListener('click', () => { if (renderJob) renderJob.cancelled = true; });

// ---------- start ----------
async function init() {
  try { voiceList = await (await api('/api/voices')).json(); } catch { voiceList = []; }
  const remix = new URLSearchParams(location.search).get('remix');
  if (remix) {
    try {
      const meta = await (await api(`/api/videos/${remix}`)).json();
      story = S.normalizeStory(meta.story);
      story.title = `${meta.title} (remix)`;
      history.replaceState(null, '', 'studio.html');
    } catch { story = loadDraft() || S.starterStory(); }
  } else {
    story = loadDraft() || S.starterStory();
  }
  stage.setQuality(QUALITY.pretty);
  renderPanels();
  await document.fonts.load('700 40px Fredoka').catch(() => {});
  $('loading').textContent = 'Building your world…';
  changed({ ui: false, delay: 0 });
}

init();
