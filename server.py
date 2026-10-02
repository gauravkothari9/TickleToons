"""Tickle Toons Studio server.

- Serves the web app in ./web
- Makes character voices (edge-tts neural voices, with Windows SAPI as offline fallback)
- Receives rendered frames + audio from the browser and encodes the MP4 with FFmpeg
- Stores finished videos in ./videos

Run:  start.bat   (or: .venv\\Scripts\\python server.py)   then open http://127.0.0.1:8000
"""
import asyncio
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import threading
import time
import uuid
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs, quote

try:
    import edge_tts
except ImportError:  # server still runs; voices fall back to Windows SAPI
    edge_tts = None

import youtube

ROOT = Path(__file__).resolve().parent
WEB = ROOT / "web"
VIDEOS = ROOT / "videos"
DATA = ROOT / "data"
TTS_CACHE = ROOT / "cache" / "tts"
VIDEOS.mkdir(exist_ok=True)
DATA.mkdir(exist_ok=True)
TTS_CACHE.mkdir(parents=True, exist_ok=True)
SERIES_FILE = DATA / "series.json"
series_lock = threading.Lock()

PORT = int(os.environ.get("PORT", "8000"))
MAX_BODY = 200 * 1024 * 1024
MEDIA_FILES = {"video.mp4": "video/mp4", "thumb.jpg": "image/jpeg"}
VIDEO_URL = re.compile(r"^/api/videos/([a-f0-9]{32})$")
RENDER_URL = re.compile(r"^/api/renders/([a-f0-9]{32})/(frames|audio|finish)$")
MEDIA_URL = re.compile(r"^/media/([a-f0-9]{32})/([a-z0-9.]+)$")
TTS_URL = re.compile(r"^/tts/([a-f0-9]{40})\.(mp3|wav)$")

VOICES = [
    # Mixed / any language (Hindi + English in one line)
    {"id": "en-US-AvaMultilingualNeural", "label": "Ava (woman, speaks any language)", "group": "Mixed / any language (Hindi + English in one line)"},
    {"id": "en-US-EmmaMultilingualNeural", "label": "Emma (woman, speaks any language)", "group": "Mixed / any language (Hindi + English in one line)"},
    {"id": "en-US-AndrewMultilingualNeural", "label": "Andrew (man, speaks any language)", "group": "Mixed / any language (Hindi + English in one line)"},
    {"id": "en-US-BrianMultilingualNeural", "label": "Brian (man, speaks any language)", "group": "Mixed / any language (Hindi + English in one line)"},
    {"id": "en-AU-WilliamMultilingualNeural", "label": "William (man, speaks any language)", "group": "Mixed / any language (Hindi + English in one line)"},
    {"id": "fr-FR-VivienneMultilingualNeural", "label": "Vivienne (woman, speaks any language)", "group": "Mixed / any language (Hindi + English in one line)"},
    {"id": "de-DE-SeraphinaMultilingualNeural", "label": "Seraphina (woman, speaks any language)", "group": "Mixed / any language (Hindi + English in one line)"},
    # English
    {"id": "en-US-AnaNeural", "label": "Ana (US child, girl)", "group": "English"},
    {"id": "en-GB-MaisieNeural", "label": "Maisie (UK child, girl)", "group": "English"},
    {"id": "en-US-JennyNeural", "label": "Jenny (US woman)", "group": "English"},
    {"id": "en-US-AriaNeural", "label": "Aria (US woman, lively)", "group": "English"},
    {"id": "en-US-EmmaNeural", "label": "Emma (US woman, warm)", "group": "English"},
    {"id": "en-US-GuyNeural", "label": "Guy (US man)", "group": "English"},
    {"id": "en-US-ChristopherNeural", "label": "Christopher (US man, deep)", "group": "English"},
    {"id": "en-US-EricNeural", "label": "Eric (US man, friendly)", "group": "English"},
    {"id": "en-US-BrianNeural", "label": "Brian (US man, casual)", "group": "English"},
    {"id": "en-GB-SoniaNeural", "label": "Sonia (UK woman)", "group": "English"},
    {"id": "en-GB-RyanNeural", "label": "Ryan (UK man)", "group": "English"},
    {"id": "en-AU-NatashaNeural", "label": "Natasha (Australian woman)", "group": "English"},
    {"id": "en-IN-NeerjaNeural", "label": "Neerja (Indian English woman)", "group": "English"},
    {"id": "en-IN-PrabhatNeural", "label": "Prabhat (Indian English man)", "group": "English"},
    # Hindi
    {"id": "hi-IN-SwaraNeural", "label": "Swara (Hindi woman)", "group": "Hindi"},
    {"id": "hi-IN-MadhurNeural", "label": "Madhur (Hindi man)", "group": "Hindi"},
    # Indian languages
    {"id": "bn-IN-TanishaaNeural", "label": "Tanishaa (Bengali woman)", "group": "Indian languages"},
    {"id": "bn-IN-BashkarNeural", "label": "Bashkar (Bengali man)", "group": "Indian languages"},
    {"id": "mr-IN-AarohiNeural", "label": "Aarohi (Marathi woman)", "group": "Indian languages"},
    {"id": "mr-IN-ManoharNeural", "label": "Manohar (Marathi man)", "group": "Indian languages"},
    {"id": "gu-IN-DhwaniNeural", "label": "Dhwani (Gujarati woman)", "group": "Indian languages"},
    {"id": "gu-IN-NiranjanNeural", "label": "Niranjan (Gujarati man)", "group": "Indian languages"},
    {"id": "ta-IN-PallaviNeural", "label": "Pallavi (Tamil woman)", "group": "Indian languages"},
    {"id": "ta-IN-ValluvarNeural", "label": "Valluvar (Tamil man)", "group": "Indian languages"},
    {"id": "te-IN-ShrutiNeural", "label": "Shruti (Telugu woman)", "group": "Indian languages"},
    {"id": "te-IN-MohanNeural", "label": "Mohan (Telugu man)", "group": "Indian languages"},
    {"id": "kn-IN-SapnaNeural", "label": "Sapna (Kannada woman)", "group": "Indian languages"},
    {"id": "kn-IN-GaganNeural", "label": "Gagan (Kannada man)", "group": "Indian languages"},
    {"id": "ml-IN-SobhanaNeural", "label": "Sobhana (Malayalam woman)", "group": "Indian languages"},
    {"id": "ml-IN-MidhunNeural", "label": "Midhun (Malayalam man)", "group": "Indian languages"},
    {"id": "ur-IN-GulNeural", "label": "Gul (Urdu woman)", "group": "Indian languages"},
    {"id": "ur-IN-SalmanNeural", "label": "Salman (Urdu man)", "group": "Indian languages"},
    # Other languages
    {"id": "es-ES-ElviraNeural", "label": "Elvira (Spanish woman)", "group": "Other languages"},
    {"id": "es-MX-JorgeNeural", "label": "Jorge (Spanish man)", "group": "Other languages"},
    {"id": "fr-FR-DeniseNeural", "label": "Denise (French woman)", "group": "Other languages"},
    {"id": "fr-FR-HenriNeural", "label": "Henri (French man)", "group": "Other languages"},
    {"id": "de-DE-KatjaNeural", "label": "Katja (German woman)", "group": "Other languages"},
    {"id": "de-DE-ConradNeural", "label": "Conrad (German man)", "group": "Other languages"},
    {"id": "it-IT-ElsaNeural", "label": "Elsa (Italian woman)", "group": "Other languages"},
    {"id": "it-IT-DiegoNeural", "label": "Diego (Italian man)", "group": "Other languages"},
    {"id": "pt-BR-FranciscaNeural", "label": "Francisca (Portuguese woman)", "group": "Other languages"},
    {"id": "pt-BR-AntonioNeural", "label": "Antonio (Portuguese man)", "group": "Other languages"},
    {"id": "ru-RU-SvetlanaNeural", "label": "Svetlana (Russian woman)", "group": "Other languages"},
    {"id": "ru-RU-DmitryNeural", "label": "Dmitry (Russian man)", "group": "Other languages"},
    {"id": "ar-SA-ZariyahNeural", "label": "Zariyah (Arabic woman)", "group": "Other languages"},
    {"id": "ar-SA-HamedNeural", "label": "Hamed (Arabic man)", "group": "Other languages"},
    {"id": "id-ID-GadisNeural", "label": "Gadis (Indonesian woman)", "group": "Other languages"},
    {"id": "id-ID-ArdiNeural", "label": "Ardi (Indonesian man)", "group": "Other languages"},
    {"id": "ja-JP-NanamiNeural", "label": "Nanami (Japanese woman)", "group": "Other languages"},
    {"id": "ja-JP-KeitaNeural", "label": "Keita (Japanese man)", "group": "Other languages"},
    {"id": "ko-KR-SunHiNeural", "label": "SunHi (Korean woman)", "group": "Other languages"},
    {"id": "ko-KR-InJoonNeural", "label": "InJoon (Korean man)", "group": "Other languages"},
    {"id": "zh-CN-XiaoxiaoNeural", "label": "Xiaoxiao (Chinese woman)", "group": "Other languages"},
    {"id": "zh-CN-YunxiNeural", "label": "Yunxi (Chinese man)", "group": "Other languages"},
]
VOICE_IDS = {v["id"] for v in VOICES}

meta_lock = threading.Lock()
renders = {}  # video id -> {"proc": Popen, "lock": Lock}


def find_ffmpeg():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    winget = Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft" / "WinGet" / "Packages"
    if winget.is_dir():
        for candidate in winget.glob("*FFmpeg*/**/bin/ffmpeg.exe"):
            return str(candidate)
    return None


FFMPEG = find_ffmpeg()


# ---------------- metadata ----------------
def read_meta(vid):
    try:
        return json.loads((VIDEOS / vid / "meta.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def write_meta(vid, meta):
    path = VIDEOS / vid / "meta.json"
    if not path.parent.is_dir():
        return
    tmp = path.with_suffix(".tmp")
    with meta_lock:
        tmp.write_text(json.dumps(meta, indent=2), encoding="utf-8")
        tmp.replace(path)


def all_videos():
    items = []
    for folder in VIDEOS.iterdir():
        if folder.is_dir() and (meta := read_meta(folder.name)):
            items.append({k: v for k, v in meta.items() if k != "story"})
    items.sort(key=lambda m: m.get("created", 0), reverse=True)
    return items


# ---------------- voices ----------------
def signed(value, unit, lo, hi):
    value = max(lo, min(hi, int(value or 0)))
    return f"{value:+d}{unit}"


def make_voice(text, voice, pitch, rate):
    """Return (cache path, error). Cached by content hash so each line is generated once."""
    pitch_s, rate_s = signed(pitch, "Hz", -50, 50), signed(rate, "%", -50, 50)
    key = hashlib.sha1(f"{voice}|{pitch_s}|{rate_s}|{text}".encode("utf-8")).hexdigest()
    for ext in ("mp3", "wav"):
        path = TTS_CACHE / f"{key}.{ext}"
        if path.exists() and path.stat().st_size > 0:
            return path, None

    errors = []
    if edge_tts:
        path = TTS_CACHE / f"{key}.mp3"
        try:
            asyncio.run(edge_tts.Communicate(text, voice, pitch=pitch_s, rate=rate_s).save(str(path)))
            if path.stat().st_size > 0:
                return path, None
        except Exception as exc:  # network problems etc.
            errors.append(f"edge-tts: {exc}")
        path.unlink(missing_ok=True)

    if sys.platform == "win32":  # offline fallback: built-in Windows voices
        path = TTS_CACHE / f"{key}.wav"
        female = any(n in voice for n in ("Ana", "Maisie", "Jenny", "Aria", "Emma", "Sonia", "Natasha", "Neerja", "Swara"))
        script = (
            "Add-Type -AssemblyName System.Speech;"
            "$s = New-Object System.Speech.Synthesis.SpeechSynthesizer;"
            f"try {{ $s.SelectVoiceByHints([System.Speech.Synthesis.VoiceGender]::{'Female' if female else 'Male'}) }} catch {{}};"
            f"$s.Rate = {max(-10, min(10, int(rate or 0) // 10))};"
            f"$s.SetOutputToWaveFile('{path}');"
            "$s.Speak([Console]::In.ReadToEnd()); $s.Dispose()"
        )
        try:
            subprocess.run(["powershell", "-NoProfile", "-Command", script], input=text.encode("utf-8"),
                           capture_output=True, timeout=60, check=True)
            if path.exists() and path.stat().st_size > 100:
                return path, None
        except (subprocess.SubprocessError, OSError) as exc:
            errors.append(f"SAPI: {exc}")
        path.unlink(missing_ok=True)
    return None, "; ".join(errors) or "No voice engine available"


# ---------------- rendering ----------------
def start_render(vid, fps):
    folder = VIDEOS / vid
    log = open(folder / "ffmpeg.log", "wb")
    proc = subprocess.Popen(
        [FFMPEG, "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(fps), "-c:v", "mjpeg",
         "-i", "pipe:0", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
         "-movflags", "+faststart", str(folder / "picture.mp4")],
        stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=log,
    )
    renders[vid] = {"proc": proc, "lock": threading.Lock(), "log": log}


def finish_render(vid):
    job = renders.get(vid)
    folder = VIDEOS / vid
    meta = read_meta(vid)
    if not job or meta is None:
        return
    try:
        job["proc"].stdin.close()
        code = job["proc"].wait(timeout=1800)
        job["log"].close()
        if code != 0:
            raise RuntimeError((folder / "ffmpeg.log").read_text(errors="ignore")[-400:] or f"ffmpeg exit {code}")
        picture, audio, final = folder / "picture.mp4", folder / "audio.wav", folder / "video.mp4"
        if audio.exists():
            subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", str(picture), "-i", str(audio),
                            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest",
                            "-movflags", "+faststart", str(final)], check=True, capture_output=True, timeout=600)
            picture.unlink()
            audio.unlink()
        else:
            picture.replace(final)
        subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-ss", str(min(3, (meta.get("duration") or 2) / 2)),
                        "-i", str(final), "-frames:v", "1", "-vf", "scale=640:-2", str(folder / "thumb.jpg")],
                       capture_output=True, timeout=120)
        meta.update(status="ready", file="video.mp4", thumb=(folder / "thumb.jpg").exists())
        (folder / "ffmpeg.log").unlink(missing_ok=True)
    except Exception as exc:
        print(f"[render] {vid} failed: {exc}", file=sys.stderr, flush=True)
        meta.update(status="failed", note=str(exc)[:300])
    finally:
        renders.pop(vid, None)
    write_meta(vid, meta)


def cancel_render(vid):
    job = renders.pop(vid, None)
    if job:
        job["proc"].kill()
        job["proc"].wait()
        job["log"].close()


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, ".js": "text/javascript",
                      ".mjs": "text/javascript", ".glb": "model/gltf-binary"}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB), **kwargs)

    # Pages and scripts are always revalidated (a cheap 304 when unchanged), so after an update the
    # browser never keeps running old JavaScript from its cache.
    def send_header(self, keyword, value):
        if keyword.lower() == "cache-control":
            self._cache_set = True
        super().send_header(keyword, value)

    def end_headers(self):
        if not getattr(self, "_cache_set", False):
            super().send_header("Cache-Control", "no-cache")
        self._cache_set = False
        super().end_headers()

    # ---------- helpers ----------
    def send_json(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def read_body(self):
        length = int(self.headers.get("Content-Length") or 0)
        if not 0 < length <= MAX_BODY:
            return None
        chunks, remaining = [], length
        while remaining > 0:
            chunk = self.rfile.read(min(1 << 20, remaining))
            if not chunk:
                return None
            chunks.append(chunk)
            remaining -= len(chunk)
        return b"".join(chunks)

    def read_json(self):
        body = self.read_body()
        try:
            return json.loads(body) if body else None
        except ValueError:
            return None

    def send_media(self, path, ctype):
        """Stream a file with HTTP Range support so players can seek."""
        if not path.is_file():
            return self.send_error(404)
        size = path.stat().st_size
        start, end, status = 0, size - 1, 200
        match = re.match(r"bytes=(\d*)-(\d*)$", (self.headers.get("Range") or "").strip())
        if match and (match[1] or match[2]):
            if match[1]:
                start = int(match[1])
                end = min(int(match[2]), size - 1) if match[2] else size - 1
            else:
                start = max(0, size - int(match[2]))
            if start > end:
                self.send_response(416)
                self.send_header("Content-Range", f"bytes */{size}")
                self.end_headers()
                return
            status = 206
        length = end - start + 1
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(length))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Cache-Control", "no-cache")
        if status == 206:
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.end_headers()
        if self.command == "HEAD":
            return
        with open(path, "rb") as fh:
            fh.seek(start)
            remaining = length
            while remaining > 0:
                chunk = fh.read(min(256 * 1024, remaining))
                if not chunk:
                    break
                try:
                    self.wfile.write(chunk)
                except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
                    return
                remaining -= len(chunk)

    def media_route(self, path):
        if (m := MEDIA_URL.match(path)) and m[2] in MEDIA_FILES:
            return VIDEOS / m[1] / m[2], MEDIA_FILES[m[2]]
        if m := TTS_URL.match(path):
            return TTS_CACHE / f"{m[1]}.{m[2]}", "audio/mpeg" if m[2] == "mp3" else "audio/wav"
        return None

    def redirect_uri(self):
        return f"http://127.0.0.1:{PORT}/api/youtube/callback"

    def redirect(self, location):
        self.send_response(302)
        self.send_header("Location", location)
        self.end_headers()

    # ---------- routes ----------
    def do_GET(self):
        url = urlparse(self.path)
        path = url.path
        if path == "/api/series":
            try:
                return self.send_json(json.loads(SERIES_FILE.read_text(encoding="utf-8")))
            except (OSError, ValueError):
                return self.send_json({})
        if path == "/api/youtube/status":
            return self.send_json({**YT.status(), "redirectUri": self.redirect_uri()})
        if path == "/api/youtube/uploads":
            return self.send_json(YT.uploads())
        if path == "/api/youtube/connect":
            try:
                return self.redirect(YT.auth_url(self.redirect_uri()))
            except ValueError as exc:
                return self.redirect(f"/series.html?yt_error={quote(str(exc))}")
        if path == "/api/youtube/callback":
            q = parse_qs(url.query)
            if q.get("error"):
                return self.redirect(f"/series.html?yt_error={quote(q['error'][0])}")
            try:
                YT.finish_auth(q.get("code", [""])[0], q.get("state", [""])[0], self.redirect_uri())
                return self.redirect("/series.html?yt=connected")
            except Exception as exc:
                return self.redirect(f"/series.html?yt_error={quote(str(exc)[:200])}")
        if path == "/api/status":
            return self.send_json({"ffmpeg": bool(FFMPEG), "neuralVoices": bool(edge_tts)})
        if path == "/api/voices":
            return self.send_json(VOICES)
        if path == "/api/videos":
            return self.send_json(all_videos())
        if match := VIDEO_URL.match(path):
            meta = read_meta(match[1])
            return self.send_json(meta) if meta else self.send_json({"error": "Not found"}, 404)
        if route := self.media_route(path):
            return self.send_media(*route)
        if path.startswith("/api/"):
            return self.send_json({"error": "Not found"}, 404)
        return super().do_GET()

    def do_HEAD(self):
        if route := self.media_route(urlparse(self.path).path):
            return self.send_media(*route)
        return super().do_HEAD()

    def do_POST(self):
        path = urlparse(self.path).path

        if path == "/api/tts":
            data = self.read_json() or {}
            text = str(data.get("text", "")).strip()[:600]
            voice = data.get("voice") if data.get("voice") in VOICE_IDS else VOICES[0]["id"]
            if not text:
                return self.send_json({"error": "No text"}, 400)
            file, err = make_voice(text, voice, data.get("pitch", 0), data.get("rate", 0))
            if not file:
                return self.send_json({"error": err}, 502)
            return self.send_json({"url": f"/tts/{file.name}"})

        if path == "/api/series":
            data = self.read_json()
            if not isinstance(data, dict):
                return self.send_json({"error": "Bad series data"}, 400)
            with series_lock:
                # saves can arrive out of order; never let an older one overwrite a newer one
                try:
                    old_rev = json.loads(SERIES_FILE.read_text(encoding="utf-8")).get("rev", 0)
                except (OSError, ValueError, AttributeError):
                    old_rev = 0
                rev = data.get("rev", 0)
                if isinstance(rev, (int, float)) and isinstance(old_rev, (int, float)) and rev < old_rev:
                    return self.send_json({"ok": True, "stale": True})
                tmp = SERIES_FILE.with_suffix(".tmp")
                tmp.write_text(json.dumps(data), encoding="utf-8")
                tmp.replace(SERIES_FILE)
            return self.send_json({"ok": True})

        if path == "/api/youtube/client":
            data = self.read_json() or {}
            try:
                YT.set_client(data.get("clientId"), data.get("clientSecret"))
            except ValueError as exc:
                return self.send_json({"error": str(exc)}, 400)
            return self.send_json({"ok": True})

        if path == "/api/youtube/disconnect":
            YT.disconnect()
            return self.send_json({"ok": True})

        if path == "/api/youtube/upload":
            try:
                return self.send_json(YT.enqueue(self.read_json() or {}), 201)
            except ValueError as exc:
                return self.send_json({"error": str(exc)}, 400)

        if path == "/api/youtube/retry":
            YT.retry((self.read_json() or {}).get("id", ""))
            return self.send_json({"ok": True})

        if path == "/api/renders":
            if not FFMPEG:
                return self.send_json({"error": "FFmpeg is not installed, so videos can't be encoded."}, 500)
            data = self.read_json() or {}
            story = data.get("story") or {}
            vid = uuid.uuid4().hex
            (VIDEOS / vid).mkdir()
            meta = {
                "id": vid,
                "title": str(story.get("title") or "Untitled Toon")[:80],
                "created": time.time(),
                "duration": data.get("duration"),
                "aspect": story.get("aspect", "16:9"),
                "status": "rendering",
                "file": "video.mp4",
                "thumb": False,
                "story": story,
            }
            write_meta(vid, meta)
            start_render(vid, max(12, min(60, int(data.get("fps") or 30))))
            return self.send_json({"id": vid}, 201)

        if match := RENDER_URL.match(path):
            vid, action = match[1], match[2]
            job = renders.get(vid)
            if not job:
                return self.send_json({"error": "No active render"}, 404)
            if action == "frames":
                body = self.read_body()
                if not body:
                    return self.send_json({"error": "Empty frame batch"}, 400)
                try:
                    with job["lock"]:
                        job["proc"].stdin.write(body)
                except (BrokenPipeError, OSError):
                    return self.send_json({"error": "Encoder stopped unexpectedly"}, 500)
                return self.send_json({"ok": True})
            if action == "audio":
                body = self.read_body()
                if body:
                    (VIDEOS / vid / "audio.wav").write_bytes(body)
                return self.send_json({"ok": True})
            if action == "finish":
                meta = read_meta(vid) or {}
                meta["status"] = "processing"
                write_meta(vid, meta)
                threading.Thread(target=finish_render, args=(vid,), daemon=True).start()
                return self.send_json({"ok": True}, 202)

        return self.send_json({"error": "Not found"}, 404)

    def do_DELETE(self):
        match = VIDEO_URL.match(urlparse(self.path).path)
        if not match or not (VIDEOS / match[1]).is_dir():
            return self.send_json({"error": "Not found"}, 404)
        cancel_render(match[1])
        shutil.rmtree(VIDEOS / match[1], ignore_errors=True)
        self.send_json({"deleted": match[1]})

    def log_message(self, fmt, *args):
        if not self.path.startswith(("/media/", "/vendor/", "/tts/", "/models/", "/api/renders/")):
            super().log_message(fmt, *args)


YT = youtube.YouTube(DATA, VIDEOS, read_meta, write_meta)


def main():
    # renders cut off by a previous shutdown can't be resumed
    for meta in all_videos():
        if meta.get("status") in ("rendering", "processing"):
            full = read_meta(meta["id"])
            full.update(status="failed", note="Server stopped during render.")
            write_meta(meta["id"], full)

    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    url = f"http://127.0.0.1:{PORT}"
    print(f"Tickle Toons Studio running at {url}")
    print(f"FFmpeg: {FFMPEG or 'NOT FOUND - install it to export videos'}")
    print(f"Voices: {'neural (edge-tts)' if edge_tts else 'Windows built-in (run setup to get better voices)'}")
    print("Press Ctrl+C to stop.", flush=True)
    if "--no-browser" not in sys.argv:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nBye!")


if __name__ == "__main__":
    main()
