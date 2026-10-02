// The login page. The very first time (no password on the server yet) it asks you to choose one;
// after that it asks for that password. The token it gets back is kept in this browser for 30 days.
import { api, setToken } from './api.js';

const $ = (id) => document.getElementById(id);
const next = (() => {
  const n = new URLSearchParams(location.search).get('next') || '/';
  return n.startsWith('/') && !n.startsWith('//') ? n : '/'; // only pages of this site
})();
let firstTime = false;

async function init() {
  let s;
  try { s = await (await api('/api/auth')).json(); } catch {
    $('hint').textContent = 'Can\'t reach the server. Check your internet and reload.';
    return;
  }
  if (!s.required || s.ok) { location.replace(next); return; }
  firstTime = !s.passwordSet;
  $('heading').textContent = firstTime ? 'Choose your password' : 'Log in';
  $('hint').textContent = firstTime
    ? 'First visit: pick a password (at least 6 characters). You\'ll use it every time from now on.'
    : 'Enter your password.';
  $('confirm').hidden = !firstTime;
  $('confirm').required = firstTime;
  $('password').autocomplete = firstTime ? 'new-password' : 'current-password';
  $('go').textContent = firstTime ? 'Set password' : 'Log in';
  $('password').disabled = $('go').disabled = false;
  $('password').focus();
}

$('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = $('password').value;
  $('error').textContent = '';
  if (firstTime && password !== $('confirm').value) { $('error').textContent = 'The two passwords don\'t match.'; return; }
  $('go').disabled = true;
  try {
    const res = await api(firstTime ? '/api/auth/setup' : '/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (res.status === 409) { $('error').textContent = data.error; return init(); } // someone set it meanwhile
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    setToken(data.token);
    location.replace(next);
  } catch (err) {
    $('error').textContent = err.message;
    $('password').select();
  } finally {
    $('go').disabled = false;
  }
});

init();
