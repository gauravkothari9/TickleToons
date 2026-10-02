# Tickle Toons online: pages on Vercel, server on AWS

| | |
|---|---|
| Pages (open this) | https://tickle-toons.vercel.app: Vercel project `tickle-toons`, deploys the `web/` folder from GitHub on every push to `main` |
| Server | https://tickletoons.13-205-130-104.sslip.io: voices, video encoding (FFmpeg), video storage, YouTube uploads |
| Instance | `i-089a1bafd1b12cddc`: t3.small, Ubuntu 24.04, **ap-south-1 (Mumbai)**, tag `app=tickletoons`, 30 GB disk |
| Fixed IP | `13.205.130.104` (Elastic IP). `sslip.io` names resolve to the IP they contain, so no DNS account is needed. |
| HTTPS | Caddy (Let's Encrypt) proxies to `server.py` on 127.0.0.1:8000 |
| SSH | `ssh -i "$env:USERPROFILE\.ssh\tickletoons.pem" ubuntu@13.205.130.104` |
| Firewall | `tickletoons-sg`: SSH from the admin PC's IP only; 80/443 open |
| Push server changes | `powershell -ExecutionPolicy Bypass -File deploy\update.ps1` |
| Push page changes | `git push` (Vercel deploys `web/` by itself) |
| SSH times out after your IP changes | `node deploy\aws-provision.mjs` (adds your new IP; reuses everything else) |

The pages call the server directly (its address is `SERVER` in `web/js/api.js`). Big uploads (video frames,
the soundtrack) go straight to AWS, not through Vercel.

## Login

The server asks for a login (`REQUIRE_LOGIN=1`). The **first** time you open the site, the login page asks you to
choose a password; from then on it asks for that password. A login lasts 30 days per browser.
Only a salted hash is stored, in `~/tickletoons/data/auth.json` on the server.

Forgot the password? Delete that file on the server (`rm ~/tickletoons/data/auth.json`) and open the site:
it asks you to choose a new one. Doing this also signs out every browser.

On this PC (`start.bat`) there is no login, as before.

## YouTube on the server

In Google Cloud Console → APIs & Services → Credentials → your OAuth client, add
`https://tickletoons.13-205-130-104.sslip.io/api/youtube/callback` as an *Authorized redirect URI*.
Then open the site → 📺 Series → YouTube and connect again. After signing in, Google returns you to the Vercel pages.

Don't run uploads from the PC and the server for the same channel at the same time.

## Useful commands (on the server)

| What | Command |
|---|---|
| Live logs | `sudo journalctl -u tickletoons -f` |
| Restart | `sudo systemctl restart tickletoons` |
| HTTPS / Caddy logs | `sudo journalctl -u caddy -n 50` |

Cost: a t3.small with 30 GB costs roughly $17–20/month on demand. Stop the instance in the EC2 console when you don't need it
(the Elastic IP is billed while the instance is stopped).
