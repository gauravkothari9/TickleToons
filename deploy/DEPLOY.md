# Tickle Toons online: pages on Vercel, server on AWS

| | |
|---|---|
| Site (open this) | https://tickletoons.vercel.app: Vercel project `tickletoons` (preset **Other**, root directory `web`), redeploys on every push to `main` |
| Server | https://tickletoons.13-205-130-104.sslip.io: voices, MP4 encoding, video storage, YouTube uploads. Opening it in a browser sends you to the site. |
| Instance | `i-089a1bafd1b12cddc`: t3.small, Ubuntu 24.04, **ap-south-1 (Mumbai)**, tag `app=tickletoons`, 30 GB disk |
| Fixed IP | `13.205.130.104` (Elastic IP). `sslip.io` names resolve to the IP they contain, so no DNS account is needed. |
| HTTPS | Caddy (Let's Encrypt) proxies to `server.py` on 127.0.0.1:8000 (API only; the pages call it directly, address in `web/js/api.js`) |
| SSH | `ssh -i "$env:USERPROFILE\.ssh\tickletoons.pem" ubuntu@13.205.130.104` |
| Firewall | `tickletoons-sg`: SSH from the admin PC's IP only; 80/443 open |
| Push page changes | `git push` (Vercel deploys `web/`) |
| Push server changes | `powershell -ExecutionPolicy Bypass -File deploy\update.ps1` |
| SSH times out after your IP changes | `node deploy\aws-provision.mjs` (adds your new IP; reuses everything else) |

Frames and the soundtrack upload from the browser straight to AWS, not through Vercel (Vercel's request size limit is too small).

## Login

The **first** time you open the site, the login page asks you to choose a password; from then on it asks for that
password. A login lasts 30 days per browser. Only a salted hash is stored, in `~/tickletoons/data/auth.json`.
Forgot it? Delete that file on the server and open the site to choose a new one (this signs out every browser).
On this PC (`start.bat`) there is no login.

## Works while your laptop is off

- **Rendering needs a graphics card**, so it happens on a PC, not on AWS. The frames go straight to the server,
  which makes the MP4. Two ways:
  - **Automatic, on schedule:** run `powershell -ExecutionPolicy Bypass -File deploy\local-renderer.ps1` once on
    the PC. A hidden task (*Tickle Toons renderer*, starts at logon) renders each planned episode when its publish
    time is less than *N* hours away (Series → Schedule → Automatic rendering, default 24), using headless Edge
    and the PC's GPU, and keeps the PC from sleeping mid-render. Overdue episodes go first when the PC comes back.
    Log: `data\renderer.log`. Remove with `... local-renderer.ps1 -Remove`.
    Before each render it also tops up the plan (Series → Schedule → Autopilot): every schedule slot in the next
    2 days without an episode gets a new story, in this PC's time zone. Stories already made are not made again.
  - **By hand:** Series → Render all renders everything now, in the open tab.
- **Uploading:** with **auto-upload** on and YouTube connected, each rendered episode is queued and uploaded by the
  server. Scheduled episodes go up as private with a publish time, and YouTube makes them public at that time.
- The `tickletoons-renderer` service (a headless Chromium on the server that renders planned episodes by itself) is
  installed but **off**: this server has no graphics card, and a test took over 15 minutes for 3 seconds of video.
  It only makes sense on a GPU instance. Turn it on with `sudo systemctl enable --now tickletoons-renderer`.

## GPU renderer (no PC needed)

`tickletoons-gpu`: a g4dn.xlarge (NVIDIA T4) that is **stopped** except while it renders. Every 5 minutes the
main server checks for episodes that are due (Series → Schedule → Automatic rendering); if there are any, it starts
the GPU instance (at most once every 30 minutes). That instance runs `deploy/render_worker.py` at boot with the
graphics card, renders everything due, and switches itself off. It is switched off after 4 hours whatever happens.
The PC renderer can keep running too: both take episodes from the same queue.

- **Set up / update:** `node deploy\aws-gpu-provision.mjs` (creates the instance and the `tickletoons-server` role
  that lets the main server start it, installs the renderer, starts it once). Then `deploy\update.ps1` so the server
  has boto3. Needs `@aws-sdk/client-ec2` and `@aws-sdk/client-iam` (`AWS_SDK_FROM`).
- **First:** a new AWS account may run 0 GPU instances. In Service Quotas → EC2 (ap-south-1), request
  *Running On-Demand G and VT instances* = **4**.
- **Cost:** about $0.58/hour on demand, so roughly $20–25/month at about an hour a day, plus about $5/month for its
  disk. Spot is about $0.22/hour (`GPU_SPOT=1` when creating it). It needs the EC2 Spot service-linked role, which an
  admin creates once.
- **Logs:** `sudo journalctl -u tickletoons-gpu-renderer` on the GPU instance; `[gpu]` lines in the server log.

## YouTube on the server

In Google Cloud Console → APIs & Services → Credentials → your OAuth client, add
`https://tickletoons.13-205-130-104.sslip.io/api/youtube/callback` as an *Authorized redirect URI*.
Then open the site → 📺 Series → YouTube and connect. Google sends you back to the Vercel site afterwards.
Don't upload from the PC and the server to the same channel.

## Useful commands (on the server)

| What | Command |
|---|---|
| Server logs | `sudo journalctl -u tickletoons -f` |
| Restart | `sudo systemctl restart tickletoons` |
| HTTPS / Caddy logs | `sudo journalctl -u caddy -n 50` |

Cost: a t3.small with 30 GB costs roughly $17–20/month on demand.
