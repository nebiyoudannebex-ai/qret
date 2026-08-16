# Rebuilds the Qret Android app and copies the APK to public/app/qret.apk
# Usage: npm run apk  (or: powershell -File scripts/build-apk.ps1)
# NOTE: keep this file ASCII-only - PowerShell 5.1 misparses non-ASCII without a BOM

$ErrorActionPreference = "Stop"

$toolchain = Join-Path $env:USERPROFILE "android-toolchain"
$jdk = Get-ChildItem (Join-Path $toolchain "jdk-17*") -Directory | Select-Object -First 1
if (-not $jdk) {
    Write-Error "JDK not found in $toolchain - install it first (see the setup steps)"
}

$env:JAVA_HOME = $jdk.FullName
$env:ANDROID_HOME = Join-Path $toolchain "sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

$root = Split-Path -Parent $PSScriptRoot
Push-Location (Join-Path $root "android-app")
try {
    & .\gradlew.bat assembleDebug --no-daemon
    if ($LASTEXITCODE -ne 0) {
        throw "Gradle build failed"
    }
} finally {
    Pop-Location
}

$apk = Join-Path $root "android-app\app\build\outputs\apk\debug\app-debug.apk"
$outDir = Join-Path $root "public\app"
New-Item -ItemType Directory -Path $outDir -Force | Out-Null
Copy-Item $apk (Join-Path $outDir "qret.apk") -Force
Write-Host "APK copied to public/app/qret.apk ($([math]::Round((Get-Item $apk).Length / 1MB, 1)) MB)"
Write-Host "Next: rebuild the web app so it serves the new APK (npm run build)"