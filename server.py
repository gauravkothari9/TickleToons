"""Tickle Toons Studio server.

- Serves the web app in ./web
- Makes character voices (edge-tts neural voices, with Windows SAPI as offline fallback)
- Receives rendered frames + audio from the browser and encodes the MP4 with FFmpeg
- Stores finished videos in ./videos

Run:  start.bat   (or: .venv\\Scripts\\python server.py)   then open http://127.0.0.1:8000
"""
import asyncio
import hashlib
import hmac
import json
import os
import re
import secrets
import shutil
import subprocess
import sys
import threading
import time
import uuid
import webbrowser
from datetime import datetime
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
PUBLIC_URL = os.environ.get("PUBLIC_URL", "").rstrip("/")
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
renders = {}  # video id -> {"proc": Popen, "lock": Lock, "seen": last time the browser sent something}
RENDER_IDLE_MINUTES = 15  # a render that sends nothing for this long was cut off (PC asleep, tab closed)


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


TTS_SLOTS = threading.BoundedSemaphore(6)  # voice requests open at once


def make_voice(text, voice, pitch, rate):
    """Return (cache path, error). Cached by content hash so each line is generated once."""
    pitch_s, rate_s = signed(pitch, "Hz", -50, 50), signed(rate, "%", -50, 50)
    key = hashlib.sha1(f"{voice}|{pitch_s}|{rate_s}|{text}".encode("utf-8")).hexdigest()
    for ext in ("mp3", "wav"):
        path = TTS_CACHE / f"{key}.{ext}"
        if path.exists() and path.stat().st_size > 0:
            return path, None

    if not re.search(r"\w", text):  # only punctuation: the voice service sends back no audio
        return None, "Nothing to say"
    errors = []
    if edge_tts:
        path = TTS_CACHE / f"{key}.mp3"
        for attempt in range(3):  # the service drops the odd request, especially in a burst
            try:
                with TTS_SLOTS:
                    asyncio.run(edge_tts.Communicate(text, voice, pitch=pitch_s, rate=rate_s).save(str(path)))
                if path.stat().st_size > 0:
                    return path, None
            except Exception as exc:  # network problems etc.
                errors.append(f"edge-tts: {exc}")
            path.unlink(missing_ok=True)
            if attempt < 2:
                time.sleep(0.5 * (attempt + 1))

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
    renders[vid] = {"proc": proc, "lock": threading.Lock(), "log": log, "seen": time.time()}


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


def drop_abandoned_renders():
    """A browser that stops in the middle of a render never says so: its entry would stay "rendering"
    forever, and every retry of the episode added one more. Those are deleted once they go quiet."""
    while True:
        time.sleep(60)
        for vid, job in list(renders.items()):
            if job["proc"].poll() is None and time.time() - job["seen"] < RENDER_IDLE_MINUTES * 60:
                continue
            if (read_meta(vid) or {}).get("status") == "processing":
                continue  # finish_render has it
            print(f"[render] {vid}: nothing received for {RENDER_IDLE_MINUTES} minutes, deleted", file=sys.stderr, flush=True)
            cancel_render(vid)
            shutil.rmtree(VIDEOS / vid, ignore_errors=True)


# ---------- login ----------
# On a public server (REQUIRE_LOGIN=1) everything under /api, /media and /tts needs a login token.
# The first visit sets the password; after that the same password signs in. Only a salted hash is
# kept (data/auth.json). Tokens are signed with a secret that changes with the password, so a new
# password signs every device out. The web pages themselves are public (they hold no data).
REQUIRE_LOGIN = os.environ.get("REQUIRE_LOGIN") == "1"
FRONTEND_URL = os.environ.get("FRONTEND_URL", "").rstrip("/")  # where the pages live (Vercel), for redirects
AUTH_FILE = DATA / "auth.json"
TOKEN_DAYS = 30
auth_lock = threading.Lock()


def load_auth():
    try:
        return json.loads(AUTH_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def hash_password(password, salt):
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), 200_000).hex()


def make_token(secret):
    exp = int(time.time()) + TOKEN_DAYS * 86400
    return f"{exp}.{hmac.new(secret.encode(), str(exp).encode(), hashlib.sha256).hexdigest()}"


def token_ok(token):
    secret = load_auth().get("secret")
    exp, _, sig = (token or "").partition(".")
    if not secret or not exp.isdigit() or int(exp) < time.time():
        return False
    return hmac.compare_digest(sig, hmac.new(secret.encode(), exp.encode(), hashlib.sha256).hexdigest())


def set_first_password(password):
    """Only works once, while no password exists. Returns a token, or None if one is already set."""
    with auth_lock:
        if load_auth().get("hash"):
            return None
        salt, secret = secrets.token_hex(16), secrets.token_hex(32)
        tmp = AUTH_FILE.with_suffix(".tmp")
        tmp.write_text(json.dumps({"salt": salt, "hash": hash_password(password, salt), "secret": secret}), encoding="utf-8")
        tmp.replace(AUTH_FILE)
        return make_token(secret)


def check_password(password):
    auth = load_auth()
    if auth.get("hash") and hmac.compare_digest(hash_password(password, auth["salt"]), auth["hash"]):
        return make_token(auth["secret"])
    time.sleep(1)  # slows down guessing
    return None


# ---------- the server's own renderer (deploy/render_worker.py) ----------
# A headless browser on the server opens the pages' worker.html, which asks for the next planned
# episode (claim), renders it exactly like the Series page does, and reports back (done). So episodes
# get made and uploaded while every laptop is off. It signs in with data/worker.key.
WORKER_KEY_FILE = DATA / "worker.key"
CLAIM_HOURS = 3          # a render that hasn't reported back by then is tried again (a long one takes ~40 min)
MAX_SERVER_TRIES = 3
RENDER_AHEAD_HOURS = 24  # an episode is rendered this long before it goes live (Schedule tab can change it)
PLAN_KEEP_DAYS = 14      # the autopilot drops episodes from the list this long after their publish time


def worker_key():
    if not WORKER_KEY_FILE.exists():
        WORKER_KEY_FILE.write_text(secrets.token_urlsafe(32), encoding="utf-8")
    return WORKER_KEY_FILE.read_text(encoding="utf-8").strip()


def load_series():
    try:
        data = json.loads(SERIES_FILE.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (OSError, ValueError):
        return {}


def save_series(data):
    data["rev"] = max(int(time.time() * 1000), int(data.get("rev") or 0) + 1)
    tmp = SERIES_FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(data), encoding="utf-8")
    tmp.replace(SERIES_FILE)


def add_planned(items, used_stories, seed):
    """The autopilot's new episodes (worker.js tops the plan up to the next few days of slots).
    Each gets the plan's new planRev, so a Series page that loaded the plan before can't drop them on save."""
    with series_lock:
        data = load_series()
        plan = [i for i in data.get("plan") or [] if isinstance(i, dict)]
        cutoff = time.time() - PLAN_KEEP_DAYS * 86400
        plan = [i for i in plan if (published_at(i) or cutoff) >= cutoff]
        taken = {(i.get("kind"), i.get("lang"), i.get("publishAt")) for i in plan}
        rev = int(data.get("planRev") or 0) + 1
        added = []
        for it in items if isinstance(items, list) else []:
            if not isinstance(it, dict) or not it.get("story") or not it.get("key"):
                continue
            slot = (it.get("kind"), it.get("lang"), it.get("publishAt"))
            if slot in taken or any(i.get("key") == it["key"] for i in plan):
                continue  # two renderers topped up at once: first one wins
            taken.add(slot)
            added.append({**it, "status": "planned", "auto": True, "addedRev": rev})
        if not added and len(plan) == len(data.get("plan") or []):
            return 0
        data["plan"] = plan + added
        if added:
            data["planRev"] = rev
            if isinstance(used_stories, dict):
                data["usedStories"] = used_stories
            if isinstance(seed, int):
                data.setdefault("settings", {})["seed"] = seed
        save_series(data)
        return len(added)


def keep_auto_episodes(new, old, base_rev):
    """Episodes the autopilot added after this Series page loaded the plan stay, even though the page doesn't have them."""
    have = {i.get("key") for i in new.get("plan") or [] if isinstance(i, dict)}
    kept = [i for i in old.get("plan") or [] if isinstance(i, dict) and i.get("auto")
            and int(i.get("addedRev") or 0) > base_rev and i.get("key") not in have]
    new["plan"] = (new.get("plan") or []) + kept
    used = new.setdefault("usedStories", {"long": [], "short": []})
    for i in kept:
        kind = i.get("kind")
        if i.get("template") and isinstance(used.get(kind), list) and i["template"] not in used[kind]:
            used[kind].append(i["template"])
    return kept


def published_at(it):
    try:
        return datetime.fromisoformat(str(it["publishAt"]).replace("Z", "+00:00")).timestamp()
    except (KeyError, TypeError, ValueError):
        return None


def same_episode(a, b):
    return all(a.get(k) == b.get(k) for k in ("key", "seed", "template", "lang", "kind"))


def keep_server_progress(new, old):
    """A Series page that was opened before the server rendered something must not undo it on save."""
    olds = {i.get("key"): i for i in old.get("plan") or [] if isinstance(i, dict)}
    for it in new.get("plan") or []:
        o = olds.get(it.get("key")) if isinstance(it, dict) else None
        if not o or not same_episode(it, o) or it.get("videoId"):
            continue
        if o.get("videoId"):
            it.update(videoId=o["videoId"], status=o.get("status", "rendered"), error=None)
        elif o.get("serverClaim") and time.time() - o["serverClaim"] < CLAIM_HOURS * 3600:
            it.update(status="rendering", serverClaim=o["serverClaim"])
        for k in ("serverTries", "serverError"):
            if k in o:
                it[k] = o[k]


def due(it, now, ahead_hours):
    """Its turn to render: no publish time, or the publish time is less than ahead_hours away (or past)."""
    publish = published_at(it)
    return publish is None or publish - now <= ahead_hours * 3600


def free_episodes(data, now):
    """Planned episodes whose turn has come and that no renderer is working on."""
    ahead = (data.get("schedule") or {}).get("renderAhead")
    ahead = float(ahead) if isinstance(ahead, (int, float)) and ahead > 0 else RENDER_AHEAD_HOURS
    return [it for it in data.get("plan") or [] if isinstance(it, dict) and it.get("story") and not it.get("videoId")
            and it.get("serverTries", 0) < MAX_SERVER_TRIES and due(it, now, ahead)
            and not (it.get("status") == "rendering"  # pageClaim: a Series page is rendering it ("Render all")
                     and now - (it.get("serverClaim") or it.get("pageClaim") or now) < CLAIM_HOURS * 3600)]


def claim_episode():
    """Pick the next planned episode whose turn has come (soonest publish time first) and mark it as taken."""
    with series_lock:
        data = load_series()
        now = time.time()
        free = free_episodes(data, now)
        if not free:
            return None, data
        it = min(free, key=lambda i: (i.get("publishAt") or "9999", data["plan"].index(i)))
        it.update(status="rendering", serverClaim=now)
        save_series(data)
        return it, data


def finish_episode(key, seed, video_id=None, error=None):
    with series_lock:
        data = load_series()
        it = next((i for i in data.get("plan") or [] if i.get("key") == key and i.get("seed") == seed), None)
        if not it:
            return False
        it.pop("serverClaim", None)
        if video_id:
            it.update(videoId=video_id, status="rendered", error=None)
        else:
            it["serverTries"] = it.get("serverTries", 0) + 1
            it.update(status="failed" if it["serverTries"] >= MAX_SERVER_TRIES else "planned", error=str(error or "")[:300])
        save_series(data)
        return True


# ---------- the GPU renderer on AWS (deploy/aws-gpu-provision.mjs) ----------
# A g4dn instance tagged app=tickletoons-gpu that is stopped while there is nothing to do. When an
# episode's turn comes, this server starts it; its render_worker renders everything due and switches it off.
GPU_TAG = "tickletoons-gpu"
GPU_CHECK_SECONDS = 300
GPU_RESTART_MINUTES = 30  # never start it again sooner (a machine that keeps failing must not run up the bill)


def gpu_wake():
    try:
        import boto3
    except ImportError:
        return
    region = os.environ.get("AWS_REGION", "ap-south-1")
    last_start = 0.0
    while True:
        time.sleep(GPU_CHECK_SECONDS)
        try:
            with series_lock:
                waiting = free_episodes(load_series(), time.time())
            if not waiting or time.time() - last_start < GPU_RESTART_MINUTES * 60:
                continue
            ec2 = boto3.client("ec2", region_name=region)
            found = [i for r in ec2.describe_instances(Filters=[{"Name": "tag:app", "Values": [GPU_TAG]}])["Reservations"]
                     for i in r["Instances"] if i["State"]["Name"] != "terminated"]
            if not found:
                return  # no GPU renderer set up: nothing to do, ever
            if found[0]["State"]["Name"] == "stopped":
                ec2.start_instances(InstanceIds=[found[0]["InstanceId"]])
                last_start = time.time()
                print(f"[gpu] {len(waiting)} episode(s) due: started {found[0]['InstanceId']}", file=sys.stderr, flush=True)
        except Exception as exc:  # no AWS rights yet, no capacity right now, network: try again later
            print(f"[gpu] {str(exc)[:300]}", file=sys.stderr, flush=True)
            last_start = time.time()


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
        # the pages may be hosted elsewhere (Vercel) and call this server directly; the login token
        # travels in a header, not a cookie, so any origin may ask
        super().send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Methods", "GET, HEAD, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type, Range")
        self.send_header("Access-Control-Max-Age", "86400")
        self.end_headers()

    # ---------- login ----------
    def token(self):
        auth = self.headers.get("Authorization") or ""
        if auth.startswith("Bearer "):
            return auth[7:].strip()
        return parse_qs(urlparse(self.path).query).get("k", [""])[0]  # video players and links can't send headers

    def signed_in(self):
        token = self.token()
        return token_ok(token) or bool(token and hmac.compare_digest(token, worker_key()))

    def locked(self, path):
        """True (and answers 401) when this request needs a login it doesn't have."""
        if not REQUIRE_LOGIN or not path.startswith(("/api/", "/media/", "/tts/")) or path.startswith(("/api/auth", "/api/youtube/callback")):
            return False
        if self.signed_in():
            return False
        self.send_json({"error": "Please log in.", "login": True}, 401)
        return True

    def auth_routes(self, path):
        if path == "/api/auth" and self.command == "GET":
            return self.send_json({"required": REQUIRE_LOGIN, "passwordSet": bool(load_auth().get("hash")),
                                   "ok": not REQUIRE_LOGIN or self.signed_in()})
        password = str((self.read_json() or {}).get("password") or "")
        if path == "/api/auth/setup":
            if len(password) < 6:
                return self.send_json({"error": "Use at least 6 characters."}, 400)
            token = set_first_password(password)
            return self.send_json({"token": token}) if token else self.send_json({"error": "A password is already set. Log in with it."}, 409)
        if path == "/api/auth/login":
            token = check_password(password)
            return self.send_json({"token": token}) if token else self.send_json({"error": "Wrong password."}, 401)
        return self.send_json({"error": "Not found"}, 404)

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
        if dl := parse_qs(urlparse(self.path).query).get("dl", [""])[0]:  # "Download" button: save under this name
            self.send_header("Content-Disposition", f"attachment; filename*=UTF-8''{quote(dl[:120])}")
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
        # on a server, PUBLIC_URL is the https address people open (Google must know it as a redirect URI)
        return f"{PUBLIC_URL or f'http://127.0.0.1:{PORT}'}/api/youtube/callback"

    def redirect(self, location):
        self.send_response(302)
        self.send_header("Location", location)
        self.end_headers()

    # ---------- routes ----------
    def do_GET(self):
        url = urlparse(self.path)
        path = url.path
        if path == "/api/auth":
            return self.auth_routes(path)
        if self.locked(path):
            return
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
                return self.redirect(f"{FRONTEND_URL}/series.html?yt_error={quote(str(exc))}")
        if path == "/api/youtube/callback":
            q = parse_qs(url.query)
            if q.get("error"):
                return self.redirect(f"{FRONTEND_URL}/series.html?yt_error={quote(q['error'][0])}")
            try:
                YT.finish_auth(q.get("code", [""])[0], q.get("state", [""])[0], self.redirect_uri())
                return self.redirect(f"{FRONTEND_URL}/series.html?yt=connected")
            except Exception as exc:
                return self.redirect(f"{FRONTEND_URL}/series.html?yt_error={quote(str(exc)[:200])}")
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
        if not WEB.is_dir():  # server-only install: the pages are hosted elsewhere
            return self.redirect(FRONTEND_URL + path) if FRONTEND_URL else self.send_json({"error": "Not found"}, 404)
        return super().do_GET()

    def do_HEAD(self):
        if self.locked(urlparse(self.path).path):
            return
        if route := self.media_route(urlparse(self.path).path):
            return self.send_media(*route)
        return super().do_HEAD()

    def do_POST(self):
        path = urlparse(self.path).path
        if path.startswith("/api/auth"):
            return self.auth_routes(path)
        if self.locked(path):
            return

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
                old = load_series()
                old_rev = old.get("rev", 0)
                rev = data.get("rev", 0)
                if isinstance(rev, (int, float)) and isinstance(old_rev, (int, float)) and rev < old_rev:
                    return self.send_json({"ok": True, "stale": True})
                base = data.pop("baseRev", None)
                kept = keep_auto_episodes(data, old, int(base)) if isinstance(base, (int, float)) else []
                data["planRev"] = old.get("planRev", 0)
                keep_server_progress(data, old)
                tmp = SERIES_FILE.with_suffix(".tmp")
                tmp.write_text(json.dumps(data), encoding="utf-8")
                tmp.replace(SERIES_FILE)
            return self.send_json({"ok": True, "planRev": data["planRev"], "kept": kept, "usedStories": data.get("usedStories")})

        if path == "/api/worker/claim":
            it, data = claim_episode()
            return self.send_json({"item": it, "youtube": data.get("youtube") or {}, "connected": YT.status()["connected"]})

        if path == "/api/worker/plan":
            d = self.read_json() or {}
            return self.send_json({"added": add_planned(d.get("items"), d.get("usedStories"), d.get("seed"))})

        if path == "/api/worker/done":
            d = self.read_json() or {}
            ok = finish_episode(d.get("key"), d.get("seed"), d.get("videoId"), d.get("error"))
            return self.send_json({"ok": ok}, 200 if ok else 404)

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
            job["seen"] = time.time()
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
        if self.locked(urlparse(self.path).path):
            return
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


class Server(ThreadingHTTPServer):
    # The default backlog is 5: when a story asks for 100+ voices at once, the extra connections were
    # reset and those lines came back without a voice.
    request_queue_size = 256
    daemon_threads = True


def main():
    # renders cut off by a previous shutdown can't be resumed
    for meta in all_videos():
        if meta.get("status") in ("rendering", "processing"):
            full = read_meta(meta["id"])
            full.update(status="failed", note="Server stopped during render.")
            write_meta(meta["id"], full)

    threading.Thread(target=drop_abandoned_renders, daemon=True).start()
    threading.Thread(target=gpu_wake, daemon=True).start()
    worker_key()  # made once; deploy/render_worker.py signs in with it
    server = Server(("127.0.0.1", PORT), Handler)
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
