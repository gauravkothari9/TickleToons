"""The server's own renderer: makes the planned episodes while every laptop is off.

Opens the pages' worker.html (on Vercel, SITE_URL) in a headless Chromium on this server. The page
takes the next planned episode from the Series plan, renders it like "Render all" does, uploads the
frames to this server (which encodes the MP4) and queues the YouTube upload. One episode per browser,
then a fresh browser for the next one. Runs as the tickletoons-renderer service (deploy/setup.sh).

Graphics run on the CPU here (SwiftShader), so a render is much slower than on a laptop with a GPU.

On Windows it uses Edge with the PC's own graphics card instead, so a PC can be the renderer for the
AWS server (deploy/local-renderer.ps1 sets that up). The server hands out an episode only when its
publish time is close (Series > Schedule), and YouTube makes it public at that time.
"""
import ctypes
import json
import os
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SITE_URL = os.environ.get("SITE_URL", "").rstrip("/")
KEY_FILE = Path(os.environ.get("WORKER_KEY_FILE") or ROOT / "data" / "worker.key")
LOG_FILE = os.environ.get("LOG_FILE")
WINDOWS = sys.platform == "win32"
IDLE_WAIT = 300          # nothing to do: look again in 5 minutes
ONE_VIDEO_LIMIT = 12 * 3600 * 1000  # ms; a stuck render is given up after this


def log(msg):
    line = f"{time.strftime('%Y-%m-%d %H:%M:%S')} {msg}"
    if LOG_FILE:
        with open(LOG_FILE, "a", encoding="utf-8") as fh:
            fh.write(line + "\n")
    else:  # a console that can't show Hindi gets "?" instead of stopping the render
        print(line.encode(sys.stdout.encoding or "utf-8", "replace").decode(sys.stdout.encoding or "utf-8"), flush=True)


def keep_awake(on):
    """Windows: don't let the PC go to sleep in the middle of a render."""
    if WINDOWS:
        ctypes.windll.kernel32.SetThreadExecutionState(0x80000000 | (0x00000001 if on else 0))


def one_episode(p, key):
    graphics = ["--use-angle=d3d11"] if WINDOWS else ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
    browser = p.chromium.launch(channel="msedge" if WINDOWS else "chromium", headless=True, args=[
        *graphics, "--ignore-gpu-blocklist",
        "--autoplay-policy=no-user-gesture-required", "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows",
    ])
    try:
        page = browser.new_page(viewport={"width": 800, "height": 600})
        # the login token goes into the page's storage, not the address (addresses end up in logs)
        page.add_init_script(f"try {{ localStorage.setItem('tt-login', {json.dumps(key)}); }} catch (e) {{}}")
        page.on("console", lambda m: log(m.text) if "[worker]" in m.text or m.type == "error" else None)
        page.on("pageerror", lambda e: log(f"page error: {e}"))
        res = page.goto(f"{SITE_URL}/worker.html", wait_until="load", timeout=120_000)
        if not res or not res.ok:
            raise RuntimeError(f"{SITE_URL}/worker.html answered {res.status if res else 'nothing'} (are the pages deployed?)")
        # the script sets workerResult = null as soon as it runs; if it never does, it failed to load
        page.wait_for_function("'workerResult' in window", timeout=120_000)
        keep_awake(True)
        page.wait_for_function("window.workerResult", timeout=ONE_VIDEO_LIMIT, polling=5000)
        return page.evaluate("window.workerResult") or {}
    finally:
        keep_awake(False)
        browser.close()


def main():
    if not SITE_URL:
        sys.exit("SITE_URL is not set (the address of the pages, e.g. https://tickle-toons.vercel.app)")
    log(f"Renderer started, pages at {SITE_URL}")
    with sync_playwright() as p:
        while True:
            try:
                key = KEY_FILE.read_text(encoding="utf-8").strip()
                result = one_episode(p, key)
            except Exception as exc:  # site down, browser crash, timeout: wait and try again
                log(f"renderer problem: {str(exc)[:300]}")
                result = {"error": str(exc)}
            if result.get("rendered"):
                time.sleep(5)
            else:
                time.sleep(IDLE_WAIT if result.get("idle") else 120)


if __name__ == "__main__":
    main()
