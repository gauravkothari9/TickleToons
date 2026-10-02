# Tickle Toons on AWS

Its own server, separate from the other apps (TurtleReels, Autoinks, incraftify.com).

| | |
|---|---|
| Site | https://tickletoons.13-205-130-104.sslip.io (password: `deploy/login.txt` on this PC, not in git) |
| Instance | `i-089a1bafd1b12cddc`: t3.small, Ubuntu 24.04, **ap-south-1 (Mumbai)**, tag `app=tickletoons`, 30 GB disk |
| Fixed IP | `13.205.130.104` (Elastic IP). `sslip.io` names resolve to the IP they contain, so no DNS account is needed. |
| HTTPS + login | Caddy (Let's Encrypt), basic auth from `deploy/login.txt`, proxies to `server.py` on 127.0.0.1:8000 |
| SSH | `ssh -i "$env:USERPROFILE\.ssh\tickletoons.pem" ubuntu@13.205.130.104` |
| Firewall | `tickletoons-sg`: SSH from the admin PC's IP only; 80/443 open |
| Push code changes | `powershell -ExecutionPolicy Bypass -File deploy\update.ps1` |
| SSH times out after your IP changes | `node deploy\aws-provision.mjs` (adds your new IP; reuses everything else) |

Rendering happens in your browser (it draws the frames and uploads them); the server makes the voices,
encodes the MP4 with FFmpeg, stores videos in `~/tickletoons/videos` and uploads to YouTube.
Videos and the series plan on your PC are not copied; the server starts empty.

## YouTube on the server

In Google Cloud Console → APIs & Services → Credentials → your OAuth client, add
`https://tickletoons.13-205-130-104.sslip.io/api/youtube/callback` as an *Authorized redirect URI*.
Then open the site → 📺 Series → YouTube and connect again.

Don't run uploads from the PC and the server for the same channel at the same time.

## Change the password

Edit `deploy/login.txt` (`user:password`) and run `deploy\update.ps1`.

## Useful commands (on the server)

| What | Command |
|---|---|
| Live logs | `sudo journalctl -u tickletoons -f` |
| Restart | `sudo systemctl restart tickletoons` |
| HTTPS / Caddy logs | `sudo journalctl -u caddy -n 50` |

Cost: a t3.small with 30 GB costs roughly $17–20/month on demand. Stop the instance in the EC2 console when you don't need it
(the Elastic IP is billed while the instance is stopped).
