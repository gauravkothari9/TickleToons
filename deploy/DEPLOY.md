# Tickle Toons on AWS (pages + server, one address)

| | |
|---|---|
| Site | https://tickletoons.13-205-130-104.sslip.io |
| Instance | `i-089a1bafd1b12cddc`: t3.small, Ubuntu 24.04, **ap-south-1 (Mumbai)**, tag `app=tickletoons`, 30 GB disk |
| Fixed IP | `13.205.130.104` (Elastic IP). `sslip.io` names resolve to the IP they contain, so no DNS account is needed. |
| HTTPS | Caddy (Let's Encrypt) proxies to `server.py` on 127.0.0.1:8000, which serves the pages and the API |
| SSH | `ssh -i "$env:USERPROFILE\.ssh\tickletoons.pem" ubuntu@13.205.130.104` |
| Firewall | `tickletoons-sg`: SSH from the admin PC's IP only; 80/443 open |
| Push changes | `powershell -ExecutionPolicy Bypass -File deploy\update.ps1` |
| SSH times out after your IP changes | `node deploy\aws-provision.mjs` (adds your new IP; reuses everything else) |

## Login

The **first** time you open the site, the login page asks you to choose a password; from then on it asks for that
password. A login lasts 30 days per browser. Only a salted hash is stored, in `~/tickletoons/data/auth.json`.
Forgot it? Delete that file on the server and open the site to choose a new one (this signs out every browser).
On this PC (`start.bat`) there is no login.

## Works while your laptop is off

- **Rendering happens in your browser** (Series → Render all), because it needs a graphics card. The frames go
  straight to this server, which makes the MP4. Render a batch ahead of time (e.g. a week of episodes), then the
  laptop can be off.
- The `tickletoons-renderer` service (a headless Chromium on the server that renders planned episodes by itself) is
  installed but **off**: this server has no graphics card, and a test took over 15 minutes for 3 seconds of video.
  It only makes sense on a GPU instance. Turn it on with `sudo systemctl enable --now tickletoons-renderer`.
- **Uploading:** with **auto-upload** on and YouTube connected, each rendered episode is queued and uploaded by the
  server. Scheduled episodes go up as private with a publish time, and YouTube makes them public at that time.
- An episode that fails 3 times is marked failed; fix it on the Series page and it is tried again.

## YouTube on the server

In Google Cloud Console → APIs & Services → Credentials → your OAuth client, add
`https://tickletoons.13-205-130-104.sslip.io/api/youtube/callback` as an *Authorized redirect URI*.
Then open the site → 📺 Series → YouTube and connect. Don't upload from the PC and the server to the same channel.

## Useful commands (on the server)

| What | Command |
|---|---|
| Server logs | `sudo journalctl -u tickletoons -f` |
| Renderer logs | `sudo journalctl -u tickletoons-renderer -f` |
| Restart | `sudo systemctl restart tickletoons tickletoons-renderer` |
| HTTPS / Caddy logs | `sudo journalctl -u caddy -n 50` |

Cost: a t3.small with 30 GB costs roughly $17–20/month on demand. Rendering keeps the CPU busy; t3 instances bill
extra CPU credits when they run above their baseline for long, so many renders a day add to the bill.
