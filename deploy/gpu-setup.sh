#!/usr/bin/env bash
# The GPU renderer (g4dn instance from deploy/aws-gpu-provision.mjs, NVIDIA driver already in the image).
#
#   sudo bash deploy/gpu-setup.sh <site-url>
#
# Runs deploy/render_worker.py at every boot with the graphics card. It renders the episodes that are due
# and then switches the machine off; the main server starts it again when the next one is due.
# A machine that somehow keeps running is switched off after MAX_HOURS anyway. Safe to run again.
set -euo pipefail

SITE_URL="${1:?Usage: sudo bash deploy/gpu-setup.sh <site-url, e.g. https://tickletoons.vercel.app>}"
SITE_URL="${SITE_URL%/}"
MAX_HOURS=4
[[ $EUID -eq 0 ]] || { echo "Run with sudo"; exit 1; }
APP_USER="${SUDO_USER:-ubuntu}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[[ -s "$APP_DIR/data/worker.key" ]] || { echo "Missing $APP_DIR/data/worker.key (the main server's data/worker.key)"; exit 1; }

echo "==> System packages"
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y python3 python3-venv libvulkan1 vulkan-tools

echo "==> Python and Chromium"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
sudo -u "$APP_USER" -H bash -c "cd '$APP_DIR' && { [[ -x .venv/bin/python ]] || python3 -m venv .venv; } && .venv/bin/pip install -q playwright"
"$APP_DIR/.venv/bin/playwright" install-deps chromium >/dev/null
sudo -u "$APP_USER" -H bash -c "'$APP_DIR/.venv/bin/playwright' install chromium" | tail -n 2

echo "==> Renderer service"
cat > /etc/systemd/system/tickletoons-gpu-renderer.service <<UNIT
[Unit]
Description=Tickle Toons GPU renderer (renders what is due, then switches the machine off)
After=network-online.target
Wants=network-online.target

[Service]
User=$APP_USER
WorkingDirectory=$APP_DIR
Environment=SITE_URL=$SITE_URL
Environment=GPU=1
Environment=EXIT_WHEN_IDLE=1
Environment=PYTHONUNBUFFERED=1
ExecStartPre=+/sbin/shutdown -h +$((MAX_HOURS * 60)) "Tickle Toons: ${MAX_HOURS}-hour limit"
ExecStart=$APP_DIR/.venv/bin/python deploy/render_worker.py
Restart=on-failure
RestartSec=60

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable tickletoons-gpu-renderer >/dev/null
echo
echo "Installed. It starts at every boot. Logs: sudo journalctl -u tickletoons-gpu-renderer -f"
nvidia-smi --query-gpu=name,driver_version --format=csv,noheader || echo "WARNING: nvidia-smi failed (no driver?)"
