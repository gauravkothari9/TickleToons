# Makes this PC the renderer for the AWS server: whenever you're logged in, it quietly renders each planned
# episode when its publish time comes close (Series > Schedule) with this PC's graphics card; the server
# makes the MP4 and uploads it to YouTube, scheduled. Run once:
#   powershell -ExecutionPolicy Bypass -File deploy\local-renderer.ps1
# Turn it off:  ... -File deploy\local-renderer.ps1 -Remove        Log: data\renderer.log
param([switch]$Remove)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$task = 'Tickle Toons renderer'

if ($Remove) {
  Stop-ScheduledTask -TaskName $task -ErrorAction SilentlyContinue
  Unregister-ScheduledTask -TaskName $task -Confirm:$false -ErrorAction SilentlyContinue
  Write-Host 'Renderer removed.'
  exit
}

$py = Join-Path $root '.venv\Scripts\python.exe'
if (-not (Test-Path $py)) { throw 'Run start.bat once first (it sets up .venv).' }
Write-Host '==> Playwright (drives Edge in the background)'
& $py -m pip install -q playwright
if ($LASTEXITCODE) { throw 'pip install playwright failed' }

Write-Host '==> Worker key from the AWS server'
$keyFile = Join-Path $root 'data\aws-worker.key'
$pem = Join-Path $env:USERPROFILE '.ssh\tickletoons.pem'
$key = (& ssh -o ConnectTimeout=15 -i $pem ubuntu@13.205.130.104 'cat ~/tickletoons/data/worker.key').Trim()
if (-not $key) { throw 'Could not read the worker key over SSH (if your IP changed: node deploy\aws-provision.mjs)' }
New-Item -ItemType Directory -Force (Split-Path $keyFile) | Out-Null
[IO.File]::WriteAllText($keyFile, $key)

Write-Host "==> Task '$task' (starts at logon, restarts if it stops)"
$action = New-ScheduledTaskAction -Execute (Join-Path $root '.venv\Scripts\pythonw.exe') `
  -Argument "`"$(Join-Path $root 'deploy\local_renderer.pyw')`"" -WorkingDirectory $root
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable `
  -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 5) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName $task -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
Start-ScheduledTask -TaskName $task
Write-Host "Done. Rendering runs whenever you're logged in. Log: $(Join-Path $root 'data\renderer.log')"
