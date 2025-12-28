# Start Cloud SQL Proxy for production database connection
$proxyPath = Join-Path $env:USERPROFILE ".cloud-sql-proxy\cloud-sql-proxy.exe"

if (-not (Test-Path $proxyPath)) {
    Write-Error "Cloud SQL Proxy not found at: $proxyPath"
    Write-Host "Please download it from: https://github.com/GoogleCloudPlatform/cloud-sql-proxy/releases"
    exit 1
}

Write-Host "Starting Cloud SQL Proxy..."
Write-Host "Instance: erudite-descent-460013-b7:europe-west1:coredb"
Write-Host "Port: 5432"
Write-Host ""

& $proxyPath erudite-descent-460013-b7:europe-west1:coredb --port 5432

