# Го презема Maven првиот пат (во %USERPROFILE%\.m2\wrapper) и го стартува со дадените аргументи.
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$ver  = '3.9.9'
$base = Join-Path $env:USERPROFILE '.m2\wrapper'
$mvn  = Join-Path $base "apache-maven-$ver\bin\mvn.cmd"

if (-not $env:JAVA_HOME -and -not (Get-Command java -ErrorAction SilentlyContinue)) {
    Write-Host ''
    Write-Host 'Java не е пронајдена. Потребен е JDK 17 или понов.' -ForegroundColor Red
    Write-Host 'Инсталирај го со:  winget install Microsoft.OpenJDK.21' -ForegroundColor Yellow
    Write-Host 'Потоа затвори го и повторно отвори го PowerShell.' -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $mvn)) {
    Write-Host "Се презема Maven $ver (само првиот пат)..."
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    New-Item -ItemType Directory -Force -Path $base | Out-Null
    $zip = Join-Path $env:TEMP "apache-maven-$ver-bin.zip"
    Invoke-WebRequest -UseBasicParsing -OutFile $zip `
        -Uri "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/$ver/apache-maven-$ver-bin.zip"
    Expand-Archive -Path $zip -DestinationPath $base -Force
    Remove-Item $zip
    Write-Host "Maven е подготвен."
}

& $mvn @args
exit $LASTEXITCODE
