"""YouTube for Tickle Toons: connect a channel (OAuth 2.0), upload finished videos and schedule them.

Uses only the Python standard library. Your Google OAuth client and tokens stay on this computer
in ./data (never sent anywhere except Google's own sign-in and YouTube servers).

Scheduling works by uploading as private with a publishAt time: YouTube itself makes the video
public at that moment, so this computer doesn't need to be on at publish time.
"""
import calendar
import http.client
import json
import secrets
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

SCOPES = "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly"
AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"
CHUNK = 8 * 1024 * 1024


class YouTube:
    def __init__(self, data_dir, videos_dir, read_meta, write_meta):
        self.data = Path(data_dir)
        self.data.mkdir(exist_ok=True)
        self.videos = Path(videos_dir)
        self.read_meta, self.write_meta = read_meta, write_meta
        self.client_file = self.data / "youtube_client.json"
        self.token_file = self.data / "youtube_token.json"
        self.queue_file = self.data / "uploads.json"
        self.lock = threading.Lock()
        self.wake = threading.Event()
        self.pending_state = None
        self.channel_cache = None
        # uploads cut off by a shutdown go back in the queue
        with self.lock:
            q = self._load(self.queue_file, [])
            for item in q:
                if item.get("status") == "uploading":
                    item["status"] = "queued"
            self._save(self.queue_file, q)
        threading.Thread(target=self._worker, daemon=True).start()

    # ---------- small helpers ----------
    @staticmethod
    def _load(path, default):
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return default

    @staticmethod
    def _save(path, data):
        tmp = path.with_suffix(".tmp")
        tmp.write_text(json.dumps(data, indent=2), encoding="utf-8")
        tmp.replace(path)

    @staticmethod
    def _post_form(url, fields):
        body = urllib.parse.urlencode(fields).encode()
        req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/x-www-form-urlencoded"})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            raise RuntimeError(f"Google sign-in error: {e.read().decode(errors='ignore')[:300]}") from None

    # ---------- connection ----------
    def status(self):
        client = self._load(self.client_file, {})
        token = self._load(self.token_file, {})
        out = {"configured": bool(client.get("id") and client.get("secret")), "connected": bool(token.get("refresh_token"))}
        if out["connected"]:
            out["channel"] = self.channel()
        return out

    def set_client(self, client_id, client_secret):
        client_id, client_secret = (client_id or "").strip(), (client_secret or "").strip()
        if not client_id.endswith(".apps.googleusercontent.com") or not client_secret:
            raise ValueError("That doesn't look like a Google OAuth client ID and secret.")
        self._save(self.client_file, {"id": client_id, "secret": client_secret})

    def auth_url(self, redirect_uri):
        client = self._load(self.client_file, {})
        if not client.get("id"):
            raise ValueError("Add your Google OAuth client ID and secret first.")
        self.pending_state = secrets.token_urlsafe(24)
        return AUTH_URL + "?" + urllib.parse.urlencode({
            "client_id": client["id"], "redirect_uri": redirect_uri, "response_type": "code", "scope": SCOPES,
            "access_type": "offline", "prompt": "consent", "include_granted_scopes": "true", "state": self.pending_state,
        })

    def finish_auth(self, code, state, redirect_uri):
        if not state or state != self.pending_state:
            raise ValueError("Sign-in expired or didn't match. Please try connecting again.")
        self.pending_state = None
        client = self._load(self.client_file, {})
        tok = self._post_form(TOKEN_URL, {"code": code, "client_id": client["id"], "client_secret": client["secret"],
                                          "redirect_uri": redirect_uri, "grant_type": "authorization_code"})
        if not tok.get("refresh_token"):
            raise RuntimeError("Google didn't return a refresh token. Remove the app's access in your Google account and connect again.")
        tok["expires_at"] = time.time() + int(tok.get("expires_in", 3600)) - 60
        self._save(self.token_file, tok)
        self.channel_cache = None
        self.wake.set()

    def disconnect(self):
        tok = self._load(self.token_file, {})
        if tok.get("refresh_token"):
            try:
                urllib.request.urlopen(urllib.request.Request("https://oauth2.googleapis.com/revoke?" + urllib.parse.urlencode({"token": tok["refresh_token"]}), method="POST"), timeout=15)
            except OSError:
                pass  # revoking is best effort; the local token is removed either way
        self.token_file.unlink(missing_ok=True)
        self.channel_cache = None

    def access_token(self):
        tok = self._load(self.token_file, {})
        if not tok.get("refresh_token"):
            raise RuntimeError("YouTube is not connected.")
        if tok.get("access_token") and tok.get("expires_at", 0) > time.time():
            return tok["access_token"]
        client = self._load(self.client_file, {})
        new = self._post_form(TOKEN_URL, {"client_id": client["id"], "client_secret": client["secret"],
                                          "refresh_token": tok["refresh_token"], "grant_type": "refresh_token"})
        tok.update(access_token=new["access_token"], expires_at=time.time() + int(new.get("expires_in", 3600)) - 60)
        self._save(self.token_file, tok)
        return tok["access_token"]

    def channel(self):
        if self.channel_cache:
            return self.channel_cache
        try:
            req = urllib.request.Request("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
                                         headers={"Authorization": f"Bearer {self.access_token()}"})
            with urllib.request.urlopen(req, timeout=20) as r:
                items = json.loads(r.read()).get("items") or []
            self.channel_cache = {"id": items[0]["id"], "title": items[0]["snippet"]["title"]} if items else {"title": "(no channel on this account)"}
        except Exception as exc:  # network or permission problem: show it, don't crash
            return {"title": f"(couldn't read channel: {str(exc)[:120]})"}
        return self.channel_cache

    # ---------- upload queue ----------
    def enqueue(self, item):
        vid = item.get("videoId", "")
        if not (self.videos / vid / "video.mp4").is_file():
            raise ValueError("That video isn't rendered yet.")
        entry = {
            "id": uuid.uuid4().hex[:12], "videoId": vid, "status": "queued", "created": time.time(),
            "title": str(item.get("title") or "Untitled")[:100], "description": str(item.get("description") or "")[:4900],
            "tags": [str(t)[:60] for t in (item.get("tags") or [])][:30], "categoryId": str(item.get("categoryId") or "1"),
            "privacy": item.get("privacy") if item.get("privacy") in ("private", "unlisted", "public") else "private",
            "publishAt": item.get("publishAt") or None, "madeForKids": bool(item.get("madeForKids", True)),
            "language": str(item.get("language") or "en")[:8], "planKey": item.get("planKey"),
        }
        with self.lock:
            q = self._load(self.queue_file, [])
            q.append(entry)
            self._save(self.queue_file, q)
        self.wake.set()
        return entry

    def uploads(self):
        return self._load(self.queue_file, [])

    def retry(self, entry_id):
        with self.lock:
            q = self._load(self.queue_file, [])
            for e in q:
                if e["id"] == entry_id and e["status"] == "failed":
                    e.update(status="queued", error=None)
            self._save(self.queue_file, q)
        self.wake.set()

    def _update(self, entry_id, **fields):
        with self.lock:
            q = self._load(self.queue_file, [])
            for e in q:
                if e["id"] == entry_id:
                    e.update(fields)
            self._save(self.queue_file, q)

    def _worker(self):
        while True:
            self.wake.wait(timeout=60)
            self.wake.clear()
            if not self._load(self.token_file, {}).get("refresh_token"):
                continue
            while True:
                nxt = next((e for e in self.uploads() if e["status"] == "queued"), None)
                if not nxt:
                    break
                self._update(nxt["id"], status="uploading", progress=0)
                try:
                    yt_id = self._upload(nxt)
                    self._update(nxt["id"], status="done", youtubeId=yt_id, url=f"https://youtu.be/{yt_id}", progress=100)
                    meta = self.read_meta(nxt["videoId"])
                    if meta is not None:
                        meta["youtube"] = {"id": yt_id, "publishAt": nxt.get("publishAt"), "privacy": nxt["privacy"]}
                        self.write_meta(nxt["videoId"], meta)
                except Exception as exc:
                    msg = str(exc)[:400]
                    self._update(nxt["id"], status="failed", error=msg)
                    if "quota" in msg.lower():
                        break  # daily quota used up: stop until tomorrow / a retry

    def _upload(self, e):
        path = self.videos / e["videoId"] / "video.mp4"
        size = path.stat().st_size
        status = {"privacyStatus": e["privacy"], "selfDeclaredMadeForKids": e["madeForKids"], "embeddable": True}
        publish_at = e.get("publishAt")
        if publish_at:
            # YouTube needs private + publishAt in the future; it flips to public by itself at that time
            if calendar.timegm(time.strptime(publish_at[:19], "%Y-%m-%dT%H:%M:%S")) > time.time() + 120:
                status.update(privacyStatus="private", publishAt=publish_at)
        body = json.dumps({
            "snippet": {"title": e["title"], "description": e["description"], "tags": e["tags"], "categoryId": e["categoryId"],
                        "defaultLanguage": e["language"], "defaultAudioLanguage": e["language"]},
            "status": status,
        }).encode()
        req = urllib.request.Request(
            "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", data=body, method="POST",
            headers={"Authorization": f"Bearer {self.access_token()}", "Content-Type": "application/json; charset=UTF-8",
                     "X-Upload-Content-Type": "video/mp4", "X-Upload-Content-Length": str(size)})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                session = r.headers["Location"]
        except urllib.error.HTTPError as err:
            raise RuntimeError(self._explain(err.read().decode(errors="ignore"))) from None

        target = urllib.parse.urlparse(session)
        sent = 0
        with open(path, "rb") as fh:
            while sent < size:
                fh.seek(sent)
                chunk = fh.read(CHUNK)
                end = sent + len(chunk) - 1
                conn = http.client.HTTPSConnection(target.netloc, timeout=300)
                conn.request("PUT", target.path + "?" + target.query, body=chunk, headers={
                    "Authorization": f"Bearer {self.access_token()}", "Content-Length": str(len(chunk)),
                    "Content-Range": f"bytes {sent}-{end}/{size}"})
                resp = conn.getresponse()
                data = resp.read()
                conn.close()
                if resp.status in (200, 201):
                    yt_id = json.loads(data)["id"]
                    self._thumbnail(yt_id, e["videoId"])
                    return yt_id
                if resp.status == 308:
                    rng = resp.getheader("Range")
                    sent = int(rng.split("-")[1]) + 1 if rng else 0
                    self._update(e["id"], progress=round(sent * 100 / size))
                    continue
                raise RuntimeError(self._explain(data.decode(errors="ignore")))
        raise RuntimeError("Upload ended without a video id.")

    def _thumbnail(self, yt_id, vid):
        thumb = self.videos / vid / "thumb.jpg"
        if not thumb.is_file():
            return
        try:
            req = urllib.request.Request(f"https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId={yt_id}",
                                         data=thumb.read_bytes(), method="POST",
                                         headers={"Authorization": f"Bearer {self.access_token()}", "Content-Type": "image/jpeg"})
            urllib.request.urlopen(req, timeout=60).close()
        except Exception:
            pass  # custom thumbnails need a verified channel; the video is fine without

    @staticmethod
    def _explain(text):
        if "quotaExceeded" in text or "uploadLimitExceeded" in text:
            return "YouTube daily quota/upload limit reached. It resets daily; press Retry tomorrow."
        if "youtubeSignupRequired" in text:
            return "This Google account has no YouTube channel yet. Create one on youtube.com first."
        return f"YouTube error: {text[:300]}"
