$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverScript = Join-Path $root "preview-server.mjs"
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue

if ($nodeCommand) {
  $nodeExe = $nodeCommand.Source
} else {
  $nodeExe = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
}

if (-not (Test-Path -LiteralPath $nodeExe)) {
  Write-Host "Node.js was not found. Please open this project in Codex or install Node.js first."
  Read-Host "Press Enter to exit"
  exit 1
}

& $nodeExe $serverScript @args
