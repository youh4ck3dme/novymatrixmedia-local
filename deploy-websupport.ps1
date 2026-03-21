param(
    [switch]$SkipDbImport,
    [switch]$RunBuild
)

$ErrorActionPreference = 'Stop'

function Get-EnvFileValues {
    param([string]$Path)

    $values = @{}
    foreach ($line in Get-Content -Path $Path -Encoding UTF8) {
        $trimmed = $line.Trim().Trim("`r", "`n")
        if (-not $trimmed -or $trimmed.StartsWith('#')) {
            continue
        }

        $separator = $trimmed.IndexOf('=')
        if ($separator -lt 1) {
            continue
        }

        $key = $trimmed.Substring(0, $separator).Trim().Trim("`r", "`n")
        $value = $trimmed.Substring($separator + 1).Trim().Trim("`r", "`n")

        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        $value = $value.Replace('$HOME', $HOME)
        $values[$key] = $value
    }

    return $values
}

function Invoke-External {
    param(
        [string]$FilePath,
        [string[]]$ArgumentList,
        [string]$FailureMessage
    )

    & $FilePath @ArgumentList
    if ($LASTEXITCODE -ne 0) {
        throw "$FailureMessage (exit code $LASTEXITCODE)"
    }
}

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $projectRoot '.env.production'
$wpConfigProduction = Join-Path $projectRoot 'wp-config-production.php'
$sqlDump = Join-Path $projectRoot 'novymatrixmedia_export.sql'

if (-not (Test-Path $envFile)) {
    throw '.env.production not found.'
}

if (-not (Test-Path $wpConfigProduction)) {
    throw 'wp-config-production.php not found.'
}

$envValues = Get-EnvFileValues -Path $envFile

$requiredKeys = @(
    'SSH_HOST', 'SSH_USER', 'SSH_PORT', 'SSH_REMOTE_PATH', 'SSH_KEY_PATH',
    'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS', 'WP_HOME', 'OLD_URL'
)

foreach ($key in $requiredKeys) {
    if (-not $envValues.ContainsKey($key) -or [string]::IsNullOrWhiteSpace($envValues[$key])) {
        throw "Missing required value in .env.production: $key"
    }
}

$sshHost = $envValues['SSH_HOST']
$sshUser = $envValues['SSH_USER']
$sshPort = $envValues['SSH_PORT']
$sshRemotePath = $envValues['SSH_REMOTE_PATH']
$sshKeyPath = $envValues['SSH_KEY_PATH']
$dbHost = $envValues['DB_HOST']
$dbName = $envValues['DB_NAME']
$dbUser = $envValues['DB_USER']
$dbPass = $envValues['DB_PASS']
$wpHome = $envValues['WP_HOME']
$oldUrl = $envValues['OLD_URL']

if (-not (Test-Path $sshKeyPath)) {
    throw "SSH key not found: $sshKeyPath"
}

$sshArgs = @('-i', $sshKeyPath, '-o', 'IdentitiesOnly=yes', '-p', $sshPort)
$scpArgs = @('-i', $sshKeyPath, '-o', 'IdentitiesOnly=yes', '-P', $sshPort)
$sshTarget = "$sshUser@$sshHost"

Write-Host "Deploy target: $wpHome"
Write-Host "Remote: $sshTarget`
Path:   $sshRemotePath"

$stagingRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("nmm-websupport-stage-" + [System.Guid]::NewGuid().ToString('N'))
$stagePath = Join-Path $stagingRoot 'payload'
$archivePath = Join-Path $stagingRoot 'payload.tar'
$remoteArchive = "$sshRemotePath/payload.tar"

New-Item -ItemType Directory -Path $stagePath -Force | Out-Null

$robocopyDirExcludes = @(
    '.git', '.vscode', 'docs', 'node_modules',
    'nmm-pwa\.next', 'nmm-pwa\node_modules'
)

$robocopyFileExcludes = @(
    '.env.production', '.env.local', '.env.example',
    'README.md', '*.code-workspace', '*.sql', '*.sql.gz', '*.gz', '*.tar',
    'wp-config.php', 'wp-config-production.php',
    'deploy-websupport.sh', 'deploy-websupport.ps1',
    'setup-ssh-key.sh', 'setup_vps.sh', 'ssh-tunnel.sh', 'ws_setup_ssh.py'
)

try {
    Write-Host '[1/6] Preparing staging payload...'
    $robocopyArgs = @(
        $projectRoot,
        $stagePath,
        '/E', '/R:1', '/W:1', '/NFL', '/NDL', '/NJH', '/NJS', '/NP', '/XD'
    ) + $robocopyDirExcludes + @('/XF') + $robocopyFileExcludes

    & robocopy @robocopyArgs | Out-Null
    if ($LASTEXITCODE -gt 7) {
        throw "robocopy staging failed with exit code $LASTEXITCODE"
    }

    Write-Host '[2/6] Creating archive...'
    Push-Location $stagePath
    try {
        Invoke-External -FilePath 'tar.exe' -ArgumentList @('-cf', $archivePath, '.') -FailureMessage 'Failed to create deployment archive'
    }
    finally {
        Pop-Location
    }

    Write-Host '[3/6] Uploading application files...'
    Invoke-External -FilePath 'ssh.exe' -ArgumentList ($sshArgs + @($sshTarget, "mkdir -p '$sshRemotePath'")) -FailureMessage 'Failed to ensure remote path exists'
    Invoke-External -FilePath 'scp.exe' -ArgumentList ($scpArgs + @($archivePath, "$sshTarget`:$remoteArchive")) -FailureMessage 'Failed to upload application archive'
    Invoke-External -FilePath 'ssh.exe' -ArgumentList ($sshArgs + @($sshTarget, "tar -xf '$remoteArchive' -C '$sshRemotePath' && rm -f '$remoteArchive'")) -FailureMessage 'Failed to extract application archive on remote host'

    Write-Host '[4/6] Uploading production WordPress config...'
    Invoke-External -FilePath 'scp.exe' -ArgumentList ($scpArgs + @($wpConfigProduction, "$sshTarget`:$sshRemotePath/wp-config.php")) -FailureMessage 'Failed to upload wp-config.php'

    if (-not $SkipDbImport -and (Test-Path $sqlDump)) {
        Write-Host '[5/6] Uploading and importing SQL dump...'
        Invoke-External -FilePath 'scp.exe' -ArgumentList ($scpArgs + @($sqlDump, "$sshTarget`:$sshRemotePath/novymatrixmedia_export.sql")) -FailureMessage 'Failed to upload SQL dump'

        $dbImportScript = @"
cd '$sshRemotePath'
if command -v wp >/dev/null 2>&1; then
  wp db import novymatrixmedia_export.sql
else
  mysql -h '$dbHost' -u '$dbUser' -p'$dbPass' '$dbName' < novymatrixmedia_export.sql
fi
rm -f novymatrixmedia_export.sql
wp search-replace '$oldUrl' '$wpHome' --all-tables --skip-columns=guid || true
wp search-replace 'http://novymatrixmedia.sk' 'https://novymatrixmedia.sk' --all-tables --skip-columns=guid || true
wp rewrite flush || true
wp cache flush || true
wp transient delete --all || true
"@

        Invoke-External -FilePath 'ssh.exe' -ArgumentList ($sshArgs + @($sshTarget, $dbImportScript)) -FailureMessage 'Failed during SQL import or URL migration'
    }
    else {
        Write-Host '[5/6] SQL import skipped.'
    }

    if ($RunBuild) {
        Write-Host '[6/6] Building Next.js app on remote host...'
        $buildScript = @"
if [ -d '$sshRemotePath/nmm-pwa' ]; then
  cd '$sshRemotePath/nmm-pwa'
  if command -v npm >/dev/null 2>&1; then
    npm install --legacy-peer-deps || npm install
    npm run build
  else
    echo 'npm not available, build skipped.'
  fi
else
  echo 'nmm-pwa directory not found, build skipped.'
fi
"@

        Invoke-External -FilePath 'ssh.exe' -ArgumentList ($sshArgs + @($sshTarget, $buildScript)) -FailureMessage 'Failed during remote Next.js build'
    }
    else {
        Write-Host '[6/6] Remote build skipped. Use -RunBuild to enable it.'
    }

    Write-Host ''
    Write-Host 'Deploy completed successfully.'
    Write-Host $wpHome
}
finally {
    if (Test-Path $stagingRoot) {
        Remove-Item -Path $stagingRoot -Recurse -Force
    }
}