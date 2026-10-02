#!/usr/bin/env bash
# Tickle Toons setup for its own fresh Ubuntu 24.04 server (AWS EC2).
#
#   sudo bash deploy/setup.sh <hostname>
#   e.g. sudo bash deploy/setup.sh tickletoons.1-2-3-4.sslip.io
#
# Installs Python + edge-tts (voices), FFmpeg (video export) and Caddy (automatic HTTPS + password),
# and runs server.py as a systemd service on 127.0.0.1:8000 behind Caddy.
# The login is read from deploy/login.txt ("user:password", one line), which update.ps1 copies over.
# Safe to run again after updates.
set -euo pipefail

HOST="${1:?Usage: sudo bash deploy/setup.sh <hostname, e.g. tickletoons.1-2-3-4.sslip.io>}"
[[ $EUID -eq 0 ]] || { echo "Run with sudo"; exit 1; }
APP_USER="${SUDO_USER:-ubuntu}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOGIN_FILE="$APP_DIR/deploy/login.txt"
[[ -f "$LOGIN_FILE" ]] || { echo "Missing $LOGIN_FILE (user:password)"; exit 1; }
LOGIN_USER="$(cut -d: -f1 "$LOGIN_FILE")"
LOGIN_PASS="$(cut -d: -f2- "$LOGIN_FILE" | tr -d '\r\n')"

echo "==> System packages"
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y curl ca-certificates gnupg debian-keyring debian-archive-keyring \
  apt-transport-https python3 python3-venv ffmpeg

echo "==> Swap (video encoding needs headroom on 2 GB instances)"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Caddy (HTTPS)"
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y && apt-get install -y caddy
fi

echo "==> Python environment"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
chmod 600 "$LOGIN_FILE"
sudo -u "$APP_USER" -H bash -c "cd '$APP_DIR' && { [[ -x .venv/bin/python ]] || python3 -m venv .venv; } && .venv/bin/pip install -q -r requirements.txt"

echo "==> systemd service"
cat > /etc/systemd/system/tickletoons.service <<EOF
[Unit]
Description=Tickle Toons Studio
After=network-online.target
Wants=network-online.target

[Service]
User=$APP_USER
WorkingDirectory=$APP_DIR
Environment=PORT=8000
Environment=PUBLIC_URL=https://$HOST
Environment=PYTHONUNBUFFERED=1
ExecStart=$APP_DIR/.venv/bin/python server.py --no-browser
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable tickletoons >/dev/null
systemctl restart tickletoons

echo "==> Caddy site for https://$HOST (password protected)"
HASH="$(caddy hash-password --plaintext "$LOGIN_PASS")"
mkdir -p /etc/caddy/sites
cat > /etc/caddy/sites/tickletoons.caddy <<EOF
$HOST {
	encode gzip
	request_body {
		max_size 250MB
	}
	basic_auth {
		$LOGIN_USER $HASH
	}
	reverse_proxy 127.0.0.1:8000
}
EOF
chmod 640 /etc/caddy/sites/tickletoons.caddy && chgrp caddy /etc/caddy/sites/tickletoons.caddy
touch /etc/caddy/Caddyfile
# A fresh Caddy install ships a placeholder :80 site; this box only serves the sites directory.
grep -q '/usr/share/caddy' /etc/caddy/Caddyfile && : > /etc/caddy/Caddyfile
grep -q '^import sites/\*.caddy' /etc/caddy/Caddyfile || printf '\nimport sites/*.caddy\n' >> /etc/caddy/Caddyfile
caddy validate --adapter caddyfile --config /etc/caddy/Caddyfile >/dev/null
systemctl reload caddy 2>/dev/null || systemctl restart caddy

sleep 3
if systemctl is-active --quiet tickletoons; then
  echo
  echo "Tickle Toons is running: https://$HOST (user: $LOGIN_USER)"
  echo "Logs:    sudo journalctl -u tickletoons -f"
  echo "Restart: sudo systemctl restart tickletoons"
else
  echo "The service did not start. See: sudo journalctl -u tickletoons -n 50"
  exit 1
fi
