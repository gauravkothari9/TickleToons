#!/usr/bin/env bash
# Tickle Toons server setup for its own fresh Ubuntu 24.04 server (AWS EC2).
#
#   sudo bash deploy/setup.sh <hostname> [site-url]
#   e.g. sudo bash deploy/setup.sh tickletoons.1-2-3-4.sslip.io
#
# Installs Python + edge-tts (voices), FFmpeg (video export) and Caddy (automatic HTTPS), and runs
# server.py (the pages and the API) as a systemd service on 127.0.0.1:8000 behind Caddy. site-url is only
# needed if the pages are hosted somewhere else; by default they come from this server. The server asks for a login (REQUIRE_LOGIN=1):
# the first visit to the login page sets the password.
# A second service, tickletoons-renderer, runs a headless Chromium that opens worker.html (straight from
# server.py, not through the internet)
# and renders the planned episodes, so videos are made and uploaded while your laptop is off.
# Safe to run again after updates.
set -euo pipefail

HOST="${1:?Usage: sudo bash deploy/setup.sh <hostname, e.g. tickletoons.1-2-3-4.sslip.io> [site-url]}"
SITE_URL="${2:-https://$HOST}"   # where people open the pages; YouTube sign-in returns there
SITE_URL="${SITE_URL%/}"
[[ $EUID -eq 0 ]] || { echo "Run with sudo"; exit 1; }
APP_USER="${SUDO_USER:-ubuntu}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> System packages"
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y curl ca-certificates gnupg debian-keyring debian-archive-keyring \
  apt-transport-https python3 python3-venv ffmpeg

echo "==> Swap (rendering and encoding need headroom on 2 GB instances)"
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
# story-writing tools are not needed on the server
rm -rf "$APP_DIR/tools" "$APP_DIR/stories" "$APP_DIR/README.md" "$APP_DIR/deploy/login.txt"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
sudo -u "$APP_USER" -H bash -c "cd '$APP_DIR' && { [[ -x .venv/bin/python ]] || python3 -m venv .venv; } && .venv/bin/pip install -q -r requirements.txt playwright"

echo "==> Headless Chromium for the renderer"
"$APP_DIR/.venv/bin/playwright" install-deps chromium >/dev/null
sudo -u "$APP_USER" -H bash -c "'$APP_DIR/.venv/bin/playwright' install chromium" | tail -n 2

echo "==> systemd services"
cat > /etc/systemd/system/tickletoons.service <<UNIT
[Unit]
Description=Tickle Toons Studio server
After=network-online.target
Wants=network-online.target

[Service]
User=$APP_USER
WorkingDirectory=$APP_DIR
Environment=PORT=8000
Environment=PUBLIC_URL=https://$HOST
Environment=FRONTEND_URL=$SITE_URL
Environment=REQUIRE_LOGIN=1
Environment=PYTHONUNBUFFERED=1
ExecStart=$APP_DIR/.venv/bin/python server.py --no-browser
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

cat > /etc/systemd/system/tickletoons-renderer.service <<UNIT
[Unit]
Description=Tickle Toons renderer (headless browser that makes the planned episodes)
After=tickletoons.service
Wants=tickletoons.service

[Service]
User=$APP_USER
WorkingDirectory=$APP_DIR
Environment=SITE_URL=http://127.0.0.1:8000
Environment=PYTHONUNBUFFERED=1
ExecStart=$APP_DIR/.venv/bin/python deploy/render_worker.py
Restart=always
RestartSec=30
# rendering takes all the CPU it can get; the server stays quick to answer
Nice=10
CPUWeight=50

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable tickletoons tickletoons-renderer >/dev/null
systemctl restart tickletoons
systemctl restart tickletoons-renderer

echo "==> Caddy site for https://$HOST"
mkdir -p /etc/caddy/sites
cat > /etc/caddy/sites/tickletoons.caddy <<SITE
$HOST {
	encode gzip
	request_body {
		max_size 250MB
	}
	reverse_proxy 127.0.0.1:8000
}
SITE
touch /etc/caddy/Caddyfile
# A fresh Caddy install ships a placeholder :80 site; this box only serves the sites directory.
grep -q '/usr/share/caddy' /etc/caddy/Caddyfile && : > /etc/caddy/Caddyfile
grep -q '^import sites/\*.caddy' /etc/caddy/Caddyfile || printf '\nimport sites/*.caddy\n' >> /etc/caddy/Caddyfile
caddy validate --adapter caddyfile --config /etc/caddy/Caddyfile >/dev/null
systemctl reload caddy 2>/dev/null || systemctl restart caddy

sleep 3
if systemctl is-active --quiet tickletoons; then
  echo
  echo "Tickle Toons server is running: https://$HOST (pages: $SITE_URL)"
  echo "Logs:    sudo journalctl -u tickletoons -f      Renderer: sudo journalctl -u tickletoons-renderer -f"
  echo "Restart: sudo systemctl restart tickletoons"
else
  echo "The service did not start. See: sudo journalctl -u tickletoons -n 50"
  exit 1
fi
