import { api, serverUrl, requireLogin } from './api.js';
requireLogin();
const grid = document.getElementById('grid');
const count = document.getElementById('count');
const player = document.getElementById('player');
const video = document.getElementById('player-video');
let videos = [];
let current = null;
let pollTimer = null;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mediaUrl = (v, file = v.file, dl) => serverUrl(`/media/${v.id}/${file}${dl ? `?dl=${encodeURIComponent(dl)}` : ''}`);
const fmtDate = (s) => new Date(s * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const fmtDur = (d) => (d ? `${Math.round(d)}s` : '');

async function load() {
  try {
    const res = await api('/api/videos');
    videos = await res.json();
  } catch {
    count.textContent = 'Could not reach the server. Is server.py running?';
    return;
  }
  render();
  clearTimeout(pollTimer);
  if (videos.some((v) => v.status === 'processing' || v.status === 'rendering')) pollTimer = setTimeout(load, 2500);

  const wanted = new URLSearchParams(location.search).get('v');
  if (wanted && !current) {
    const v = videos.find((x) => x.id === wanted);
    if (v && v.status === 'ready') open(v);
  }
}

function render() {
  count.textContent = videos.length === 1 ? '1 video' : `${videos.length} videos`;
  if (!videos.length) {
    grid.style.display = 'block';
    grid.innerHTML = `
      <div class="empty">
        <div class="big">🐰</div>
        <h2>No toons yet</h2>
        <p>Pick characters, a world and some moves, then hit record.</p>
        <a class="btn primary" href="studio.html">Make your first video</a>
      </div>`;
    return;
  }
  grid.style.display = '';
  grid.innerHTML = videos.map((v) => {
    const busy = v.status === 'processing' || v.status === 'rendering';
    const failed = v.status === 'failed';
    const preview = v.thumb ? `<img src="${mediaUrl(v, 'thumb.jpg')}" alt="" loading="lazy">` : '';
    return `
      <article class="card" data-id="${v.id}" tabindex="0">
        <div class="thumb">
          ${preview}
          <span class="badge ${busy ? 'processing' : failed ? 'failed' : ''}">${busy ? 'Rendering…' : failed ? 'Failed' : esc(v.aspect || '')}</span>
          ${v.status === 'ready' ? '<span class="play">▶</span>' : ''}
        </div>
        <div class="card-body">
          <h3>${esc(v.title)}</h3>
          <small>${fmtDate(v.created)} ${v.duration ? '· ' + fmtDur(v.duration) : ''}</small>
        </div>
      </article>`;
  }).join('');
}

function open(v) {
  current = v;
  video.src = mediaUrl(v);
  document.getElementById('player-title').textContent = v.title;
  document.getElementById('player-meta').textContent =
    `${fmtDate(v.created)} · ${v.aspect || ''} ${v.duration ? '· ' + fmtDur(v.duration) : ''}${v.note ? ' · ' + v.note : ''}`;
  const dl = document.getElementById('btn-download');
  dl.download = `${v.title.replace(/[^\w\- ]+/g, '').trim() || 'toon'}.${v.file.split('.').pop()}`;
  dl.href = mediaUrl(v, v.file, dl.download); // the server names the file (download= is ignored across sites)
  document.getElementById('btn-remix').href = `studio.html?remix=${v.id}`;
  player.classList.add('open');
  history.replaceState(null, '', `?v=${v.id}`);
  video.play().catch(() => {});
}

function close() {
  player.classList.remove('open');
  video.pause();
  video.removeAttribute('src');
  video.load();
  current = null;
  history.replaceState(null, '', '/');
}

grid.addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (!card) return;
  const v = videos.find((x) => x.id === card.dataset.id);
  if (v && v.status === 'ready') open(v);
  else if (v && v.status === 'failed' && confirm(`"${v.title}" failed to render${v.note ? ` (${v.note})` : ''}. Delete it?`)) {
    api(`/api/videos/${v.id}`, { method: 'DELETE' }).then(load);
  }
});
grid.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.classList.contains('card')) e.target.click();
});
document.getElementById('btn-close').addEventListener('click', close);
player.addEventListener('click', (e) => { if (e.target === player) close(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && current) close(); });

document.getElementById('btn-delete').addEventListener('click', async () => {
  if (!current || !confirm(`Delete "${current.title}"? This can't be undone.`)) return;
  await api(`/api/videos/${current.id}`, { method: 'DELETE' });
  close();
  load();
});

load();
