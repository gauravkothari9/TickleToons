"""Build the real-sound library in web/sounds from Freesound's CC0 (public domain) recordings.

  python tools/sounds.py search            list candidates for every category (writes tools/candidates.json)
  python tools/sounds.py fetch             download the picks in tools/sound_picks.json, trim + level them,
                                           and write web/sounds/manifest.json

Your own recordings work too: drop .mp3/.wav/.ogg files into web/sounds/<category>/ and run
`python tools/sounds.py index` to add them to the manifest.
"""
import html
import json
import math
import re
import shutil
import subprocess
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "web" / "sounds"
PICKS = Path(__file__).with_name("sound_picks.json")
CANDIDATES = Path(__file__).with_name("candidates.json")
UA = {"User-Agent": "TickleToonsStudio/1.0 (sound library builder)"}

# category: (search queries, min seconds, max seconds, longest we keep)
CATEGORIES = {
    # ---- people ----
    "kid_laugh": (["child laughing", "kid laugh", "girl giggle", "boy laughing"], 0.8, 8, 3.2),
    "kid_giggle": (["child giggle", "little girl giggle", "kid giggle short"], 0.4, 4, 1.6),
    "kid_gasp": (["child gasp", "kid gasp surprise", "girl gasp"], 0.2, 3, 1.0),
    "kid_scream": (["child scream short", "kid scared scream", "girl scream"], 0.3, 4, 1.4),
    "kid_cry": (["girl crying", "toddler crying", "kid whimpering", "child sobbing", "boy crying"], 1, 10, 2.6),
    "kid_sniff": (["sniffle", "sniff crying", "child sniffle"], 0.3, 4, 1.2),
    "kid_sigh": (["child sigh", "girl sigh", "sigh"], 0.4, 3, 1.4),
    "kid_yay": (["child yay", "kid cheer yay", "girl yay"], 0.3, 3, 1.2),
    "kid_aww": (["child aww", "kids aww", "aww cute"], 0.3, 3, 1.3),
    "kid_hmm": (["child hmm thinking", "girl hmm", "hmm thinking"], 0.3, 3, 1.3),
    "kid_yawn": (["child yawn", "kid yawning", "girl yawn", "boy yawn"], 0.8, 5, 2.5),
    "kid_angry": (["hmph", "annoyed grunt", "humph"], 0.2, 3, 1.0),
    "kid_ooh": (["child ooh wow", "kid wow", "girl ooh"], 0.3, 3, 1.2),
    "woman_laugh": (["woman laughing", "female laugh", "woman laugh short"], 0.8, 8, 3.0),
    "woman_giggle": (["woman giggle", "female giggle", "girl chuckle"], 0.4, 4, 1.5),
    "woman_gasp": (["woman gasp", "female gasp", "female surprised gasp"], 0.2, 3, 1.0),
    "woman_scream": (["woman scream short", "female scream", "woman scared"], 0.3, 4, 1.4),
    "woman_cry": (["woman crying", "female sobbing", "woman sob"], 1, 10, 2.6),
    "woman_sigh": (["woman sigh", "female sigh"], 0.4, 3, 1.4),
    "woman_hmm": (["woman hmm", "female hmm thinking", "female mmm"], 0.3, 3, 1.3),
    "woman_aww": (["aww", "awww", "female aww"], 0.3, 3, 1.3),
    "woman_yawn": (["woman yawn", "female yawn"], 0.8, 5, 2.5),
    "woman_angry": (["female hmph", "female annoyed", "woman grunt", "female grunt"], 0.2, 3, 1.0),
    "woman_ooh": (["woman ooh", "female wow", "female ooh"], 0.3, 3, 1.2),
    "man_laugh": (["man laughing", "male laugh", "man laugh short"], 0.8, 8, 3.0),
    "man_chuckle": (["man chuckle", "male chuckle", "old man laugh"], 0.4, 4, 1.6),
    "man_hoho": (["ho ho ho", "santa laugh", "jolly laugh"], 0.6, 5, 2.2),
    "man_gasp": (["man gasp", "male gasp", "male surprised gasp"], 0.2, 3, 1.0),
    "man_scream": (["man scream short", "male scream", "man scared yell"], 0.3, 4, 1.4),
    "man_cry": (["man crying", "male sobbing", "man sob"], 1, 10, 2.6),
    "man_sigh": (["man sigh", "male sigh"], 0.4, 3, 1.4),
    "man_hmm": (["man hmm", "male hmm thinking", "male hmmm"], 0.3, 3, 1.3),
    "man_yawn": (["man yawn", "male yawn"], 0.8, 5, 2.5),
    "man_angry": (["male grunt", "male annoyed", "man hmph", "angry grunt"], 0.2, 3, 1.0),
    "man_ooh": (["man ooh", "male wow", "male ooh"], 0.3, 3, 1.2),
    "baby_laugh": (["baby laugh", "baby giggle", "infant laughing"], 0.6, 8, 2.6),
    "baby_cry": (["baby cry", "infant crying", "baby crying short"], 0.8, 10, 2.6),
    "baby_coo": (["baby coo", "baby babble", "infant cooing"], 0.4, 6, 1.8),
    # ---- animals ----
    "cat_meow": (["cat meow", "kitten meow", "cat meowing"], 0.3, 4, 1.3),
    "cat_purr": (["cat purr", "cat purring"], 1, 12, 2.0),
    "cat_hiss": (["cat hiss", "cat hissing"], 0.3, 4, 1.2),
    "cat_sad": (["cat crying meow", "sad cat meow", "kitten crying"], 0.3, 4, 1.4),
    "dog_bark": (["small dog bark", "puppy bark", "dog bark single"], 0.1, 4, 1.0),
    "dog_whine": (["dog whine", "puppy whimper", "dog whimper"], 0.3, 5, 1.6),
    "dog_growl": (["dog growl", "small dog growl"], 0.5, 5, 1.6),
    "dog_happy": (["puppy yip", "puppy excited bark", "dog playful bark"], 0.2, 4, 1.2),
    "lion_roar": (["lion roar", "lion roaring"], 1, 8, 2.6),
    "bear_growl": (["bear growl", "bear roar"], 0.6, 6, 2.0),
    "fox_yip": (["fox bark", "fox scream", "fox call"], 0.2, 5, 1.2),
    "panda_bleat": (["panda bleat", "panda sound", "goat bleat", "lamb bleat"], 0.3, 5, 1.4),
    "mouse_squeak": (["mouse squeak", "rat squeak", "mouse squeaking"], 0.1, 3, 0.8),
    "monkey_call": (["monkey", "chimpanzee", "monkey ooh ooh"], 0.4, 6, 1.8),
    "pig_oink": (["pig oink", "pig grunt", "piglet"], 0.2, 4, 1.2),
    "pig_squeal": (["pig squeal", "piglet squeal"], 0.3, 4, 1.2),
    "elephant_trumpet": (["elephant trumpet", "elephant"], 0.6, 6, 2.0),
    "koala_bellow": (["koala", "koala bellow"], 0.5, 8, 2.0),
    "bunny_squeak": (["rabbit squeak", "guinea pig squeak", "bunny sound"], 0.1, 3, 0.9),
    "bunny_sniff": (["rabbit sniffing", "animal sniffing", "sniffing"], 0.3, 4, 1.0),
}

EXCLUDE = re.compile(r"loop|ambien|crowd|audience|group|multiple|kids playing|children playing|playground|music|song|"
                     r"remix|synth|vocoder|processed|distort|zombie|monster|demon|horror|creepy|evil|toy|cartoon|"
                     r"pack|compilation|various|collection|radio|tv|movie|film|game|8.?bit|robot|alien", re.I)


def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def search(query, lo, hi):
    """One page of CC0 results for a query, best rated first."""
    params = {
        "q": query,
        "f": f'license:"Creative Commons 0" duration:[{lo} TO {hi}]',
        "s": "Rating desc",
        "advanced": "1",
    }
    page = get("https://freesound.org/search/?" + urllib.parse.urlencode(params)).decode("utf-8", "ignore")
    results = []
    for block in page.split('class="bw-player"')[1:]:
        attrs = dict(re.findall(r'data-([a-z0-9-]+)="([^"]*)"', block[:3000]))
        rating = re.search(r'aria-label="Average rating of ([\d.]+)"', block[:20000])
        nrat = re.search(r"\((\d+)\)", block[:20000])
        if "sound-id" not in attrs or "mp3" not in attrs:
            continue
        results.append({
            "id": int(attrs["sound-id"]),
            "user": attrs.get("username", ""),
            "title": html.unescape(attrs.get("title", "")),
            "dur": round(float(attrs.get("duration") or 0), 2),
            "downloads": int(attrs.get("num-downloads") or 0),
            "rating": float(rating[1]) if rating else 0.0,
            "mp3": attrs["mp3"].replace("-lq.mp3", "-hq.mp3"),
            "query": query,
        })
    return results


def cmd_search(only=None):
    found = json.loads(CANDIDATES.read_text(encoding="utf-8")) if CANDIDATES.exists() else {}
    for cat, (queries, lo, hi, _) in CATEGORIES.items():
        if only and cat not in only:
            continue
        seen, items = set(), []
        for q in queries:
            try:
                res = search(q, lo, hi)
            except Exception as exc:  # keep going; one failed query shouldn't stop the rest
                print(f"  ! {cat} '{q}': {exc}", file=sys.stderr)
                continue
            for r in res:
                if r["id"] in seen or EXCLUDE.search(r["title"]):
                    continue
                seen.add(r["id"])
                r["score"] = round(r["rating"] * math.log10(10 + r["downloads"]), 2)
                items.append(r)
        items.sort(key=lambda r: -r["score"])
        found[cat] = items[:14]
        CANDIDATES.write_text(json.dumps(found, indent=1), encoding="utf-8")
        print(f"\n== {cat}")
        for i, r in enumerate(found[cat]):
            print(f"  {i:2d} {r['id']:>7} {r['dur']:5.1f}s  r{r['rating']:.1f} d{r['downloads']:<6} {r['title'][:60]}")
    CANDIDATES.write_text(json.dumps(found, indent=1), encoding="utf-8")


def ffmpeg():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    for c in (Path.home() / "AppData/Local/Microsoft/WinGet/Packages").glob("*FFmpeg*/**/bin/ffmpeg.exe"):
        return str(c)
    sys.exit("FFmpeg not found")


def process(src, dst, keep):
    """Mono 48 kHz, trimmed silence at both ends, at most `keep` seconds with a soft tail, levelled."""
    # trim relative to the file's own peak, so quiet sighs and sobs aren't cut away as "silence"
    probe = subprocess.run([ffmpeg(), "-v", "info", "-i", str(src), "-af", "volumedetect", "-f", "null", "-"],
                           capture_output=True, text=True, errors="ignore").stderr
    peak = float(m[1]) if (m := re.search(r"max_volume: (-?[\d.]+) dB", probe)) else 0.0
    af = (
        f"volume={-1 - peak:.1f}dB,"
        "silenceremove=start_periods=1:start_threshold=-36dB:start_silence=0.02,"
        "areverse,silenceremove=start_periods=1:start_threshold=-40dB:start_silence=0.05,areverse,"
        f"atrim=0:{keep},afade=t=out:st={max(0.05, keep - 0.25)}:d=0.25,"
        "highpass=f=70,loudnorm=I=-18:TP=-2:LRA=11"
    )
    subprocess.run([ffmpeg(), "-v", "error", "-y", "-i", str(src), "-af", af, "-ac", "1", "-ar", "48000",
                    "-c:a", "libmp3lame", "-q:a", "3", str(dst)], check=True)


def cmd_fetch():
    picks = json.loads(PICKS.read_text(encoding="utf-8"))
    cands = json.loads(CANDIDATES.read_text(encoding="utf-8"))
    tmp = ROOT / "cache" / "sound_src"
    tmp.mkdir(parents=True, exist_ok=True)
    credits = {}
    for cat, ids in picks.items():
        keep = CATEGORIES[cat][3]
        folder = OUT / cat
        folder.mkdir(parents=True, exist_ok=True)
        by_id = {c["id"]: c for items in cands.values() for c in items}
        for sid in ids:
            info = by_id.get(sid)
            if not info:
                print(f"  ! {cat}: {sid} not in candidates", file=sys.stderr)
                continue
            src = tmp / f"{sid}.mp3"
            if not src.exists():
                src.write_bytes(get(info["mp3"]))
            dst = folder / f"fs{sid}.mp3"
            process(src, dst, keep)
            credits[f"{cat}/{dst.name}"] = {"title": info["title"], "by": info["user"],
                                            "url": f"https://freesound.org/people/{info['user']}/sounds/{sid}/",
                                            "license": "CC0"}
            print(f"  {cat}/{dst.name}  {info['title'][:50]}")
    (OUT / "credits.json").write_text(json.dumps(credits, indent=1), encoding="utf-8")
    cmd_index()


def cmd_index():
    """manifest.json: every category folder and the sound files in it."""
    manifest = {}
    for folder in sorted(p for p in OUT.iterdir() if p.is_dir()):
        files = sorted(f.name for f in folder.iterdir() if f.suffix.lower() in (".mp3", ".wav", ".ogg"))
        if files:
            manifest[folder.name] = files
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=1), encoding="utf-8")
    print(f"manifest: {sum(map(len, manifest.values()))} sounds in {len(manifest)} categories")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    OUT.mkdir(parents=True, exist_ok=True)
    cmd = sys.argv[1] if len(sys.argv) > 1 else "search"
    if cmd == "search":
        cmd_search(set(sys.argv[2:]) or None)
    elif cmd == "fetch":
        cmd_fetch()
    elif cmd == "index":
        cmd_index()
    else:
        sys.exit(__doc__)
