# Push the code to the Tickle Toons server and restart it.
#   powershell -ExecutionPolicy Bypass -File deploy\update.ps1
# The server is created by `node deploy\aws-provision.mjs`; the app lives in ~/tickletoons.
# The server keeps its own videos, data and voice cache. The login (deploy\login.txt, not in git) is copied each time.
$ErrorActionPreference = 'Continue'  # ssh and scp print notes on stderr; failures are checked with $LASTEXITCODE
$Server = 'ubuntu@13.205.130.104'
$HostName = 'tickletoons.13-205-130-104.sslip.io'
$Key = "$env:USERPROFILE\.ssh\tickletoons.pem"
$opt = @('-i', $Key, '-o', 'ConnectTimeout=20', '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=accept-new')
$root = Split-Path $PSScriptRoot -Parent
Push-Location $root
try {
    if (-not (Test-Path 'deploy\login.txt')) { throw 'Missing deploy\login.txt (one line: user:password)' }
    $r = & ssh @opt $Server 'echo ok' 2>$null
    if ($r -ne 'ok') {
        $ip = (Invoke-WebRequest 'https://checkip.amazonaws.com' -UseBasicParsing -TimeoutSec 10).Content.Trim()
        throw "Cannot SSH to $Server. If your home IP changed (now $ip), re-run node deploy\aws-provision.mjs (it adds the new IP to the firewall)."
    }
    $out = 'tickletoons-update.tar.gz'
    tar -czf $out --exclude=__pycache__ server.py youtube.py requirements.txt README.md web tools stories deploy
    & ssh @opt $Server 'mkdir -p ~/tickletoons'
    & scp @opt $out "${Server}:~/"
    if ($LASTEXITCODE -ne 0) { throw 'Upload failed' }
    Remove-Item $out -Force
    & ssh @opt $Server "tar -xzf ~/$out -C ~/tickletoons && rm ~/$out && cd ~/tickletoons && sudo bash deploy/setup.sh $HostName"
    if ($LASTEXITCODE -ne 0) { throw 'Remote setup failed (see output above)' }
    Write-Host "`nTickle Toons updated: https://$HostName" -ForegroundColor Green
} finally {
    Pop-Location
}
