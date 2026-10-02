// Talking to the Tickle Toons server. The pages can be hosted on their own (Vercel) while the server
// runs on AWS: then every call goes to SERVER below. Opened from the server itself (or on this PC),
// calls stay on the same address. A login token, kept in this browser, rides along with each call.
export const SERVER = 'https://tickletoons.13-205-130-104.sslip.io';

const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) || location.origin === SERVER;
export const API = local ? '' : SERVER;
const KEY = 'tt-login';

export const getToken = () => { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } };
export const setToken = (t) => { try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch { /* private mode */ } };

/** Send the browser to the login page, and back here afterwards. */
export function toLogin() {
  if (/login\.html$/.test(location.pathname)) return;
  location.href = `login.html?next=${encodeURIComponent(location.pathname + location.search)}`;
}

/** fetch() for the server: adds the address and the login; a missing/expired login opens the login page. */
export async function api(path, opts = {}) {
  const token = getToken();
  const res = await fetch(API + path, { ...opts, headers: { ...(opts.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  if (res.status === 401 && !path.startsWith('/api/auth')) { setToken(''); toLogin(); throw new Error('Please log in.'); }
  return res;
}

/** A server file for <video src>, <img src> and download links (they can't send headers). */
export function serverUrl(path) {
  const token = getToken();
  return API + path + (token ? `${path.includes('?') ? '&' : '?'}k=${encodeURIComponent(token)}` : '');
}

/** Run once at the top of every page: off to the login page if this server wants a login we don't have. */
export async function requireLogin() {
  try {
    const s = await (await api('/api/auth')).json();
    if (s.required && !s.ok) { setToken(''); toLogin(); return false; }
  } catch { /* server unreachable: the page shows its own errors */ }
  return true;
}
