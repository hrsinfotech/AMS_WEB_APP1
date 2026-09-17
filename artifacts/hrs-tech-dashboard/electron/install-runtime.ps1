$ErrorActionPreference = 'Stop'

function Get-DockerExecutable {
  $candidates = @(
    (Join-Path ${env:ProgramFiles} 'Docker\Docker\resources\bin\docker.exe'),
    (Join-Path ${env:ProgramFiles} 'Docker\Docker\resources\cli-plugins\docker.exe'),
    (Join-Path ${env:USERPROFILE} '.docker\bin\docker.exe')
  )

  return $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
}

function Test-DockerAvailable {
  $docker = Get-DockerExecutable
  if (-not $docker) {
    return $false
  }

  try {
    & $docker version --format '{{.Server.Version}}' 2>$null | Out-Null
    return $LASTEXITCODE -eq 0
  } catch {
    return $false
  }
}

function Wait-ForDocker {
  param([int]$TimeoutSeconds = 120)

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-DockerAvailable) {
      return $true
    }
    Start-Sleep -Seconds 3
  }
  return $false
}

if (Test-DockerAvailable) {
  exit 0
}

$installer = Join-Path $env:TEMP 'Docker Desktop Installer.exe'
$downloadUrl = 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe'

Write-Host 'Docker Desktop was not found. Downloading the official installer.'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $downloadUrl -OutFile $installer
Start-Process -FilePath $installer -ArgumentList 'install', '--quiet', '--accept-license' -Wait
Remove-Item $installer -Force -ErrorAction SilentlyContinue

$dockerDesktopCandidates = @(
  (Join-Path ${env:ProgramFiles} 'Docker\Docker\Docker Desktop.exe'),
  (Join-Path ${env:ProgramFiles(x86)} 'Docker\Docker\Docker Desktop.exe')
)
$dockerDesktop = $dockerDesktopCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($dockerDesktop) {
  Start-Process -FilePath $dockerDesktop -WindowStyle Hidden
}

if (-not (Wait-ForDocker)) {
  Write-Warning 'Docker Desktop was installed, but its engine is not ready yet. Start Docker Desktop and reopen the application.'
}