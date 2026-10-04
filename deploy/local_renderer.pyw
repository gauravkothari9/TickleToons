"""This PC as the renderer for the AWS server: render_worker.py with the PC's graphics card, no window.

Started at logon by the "Tickle Toons renderer" task (deploy/local-renderer.ps1). Log: data/renderer.log.
"""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
os.environ.setdefault("SITE_URL", "https://tickletoons.vercel.app")
os.environ.setdefault("WORKER_KEY_FILE", str(ROOT / "data" / "aws-worker.key"))
os.environ.setdefault("LOG_FILE", str(ROOT / "data" / "renderer.log"))
log = Path(os.environ["LOG_FILE"])
if log.is_file() and log.stat().st_size > 2_000_000:
    log.replace(log.with_suffix(".old.log"))
sys.path.insert(0,str(Path(__file__).resolve().parent))

import render_worker  # noqa: E402  (needs the settings above first)

render_worker.main()
