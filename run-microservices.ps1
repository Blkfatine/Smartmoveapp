# SmartMove Microservices & Frontend Startup Script
param(
    [switch]$WithFrontend = $true,
    [switch]$WithInfra = $false
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "    SmartMove Microservices Launcher     " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }

# Ensure Java 17 is available
if (-not $env:JAVA_HOME -or -not (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    $fallbackJdk = "C:\Users\lnv\.jdks\ms-17.0.17-1"
    if (Test-Path "$fallbackJdk\bin\java.exe") {
        $env:JAVA_HOME = $fallbackJdk
        $env:Path = "$env:JAVA_HOME\bin;$env:Path"
        Write-Host "Configured JAVA_HOME -> $fallbackJdk" -ForegroundColor Gray
    } else {
        Write-Warning "JAVA_HOME is not set and fallback JDK not found. Please ensure Java 17 is on PATH."
    }
}

$javaHomePath = $env:JAVA_HOME

# Optional: Start Docker infra if requested
if ($WithInfra) {
    Write-Host "Starting Docker Infrastructure (MySQL & Kafka)..." -ForegroundColor Yellow
    docker compose up -d
    Start-Sleep -Seconds 5
}

function Start-ServiceWindow($name, $cmd) {
    $setupCommand = "`$env:JAVA_HOME = '$javaHomePath'; `$env:Path = `"`$env:JAVA_HOME\bin;`$env:Path`"; Set-Location '$scriptDir'; Write-Host 'Starting $name...' -ForegroundColor Green; $cmd"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $setupCommand -WindowStyle Normal
}

# 1. Start Eureka (Discovery Service)
Write-Host "`n[1/8] Starting Discovery Service (Eureka) on port 8761..." -ForegroundColor Yellow
Start-ServiceWindow "Discovery Service (Eureka :8761)" ".\mvnw.cmd spring-boot:run -pl discovery-service"
Write-Host "Waiting 18 seconds for Eureka to register..." -ForegroundColor Gray
Start-Sleep -Seconds 18

# 2. Start Gateway Service
Write-Host "`n[2/8] Starting Gateway Service on port 8888..." -ForegroundColor Yellow
Start-ServiceWindow "Gateway Service (:8888)" ".\mvnw.cmd spring-boot:run -pl gateway-service"
Write-Host "Waiting 12 seconds for Gateway to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 12

# 3. Start Core Microservices
$services = @(
    @{ Name = "user-service"; Port = 8089 },
    @{ Name = "traffic-service"; Port = 8083 },
    @{ Name = "incident-service"; Port = 8084 },
    @{ Name = "meteo-service"; Port = 8087 },
    @{ Name = "prediction-service"; Port = 8086 },
    @{ Name = "notification-service"; Port = 8085 }
)

$i = 3
foreach ($s in $services) {
    $sName = $s.Name
    $sPort = $s.Port
    Write-Host "`n[$i/8] Starting $sName on port $sPort..." -ForegroundColor Yellow
    Start-ServiceWindow "$sName (:$sPort)" ".\mvnw.cmd spring-boot:run -pl $sName"
    Start-Sleep -Seconds 6
    $i++
}

# 4. Optional Frontend
if ($WithFrontend) {
    Write-Host "`nStarting Frontend (Angular Standalone) on port 4200..." -ForegroundColor Cyan
    $frontCmd = "Set-Location '$scriptDir\frontend'; npm start"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontCmd -WindowStyle Normal
}

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host " All services have been launched!        " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Eureka Dashboard : http://localhost:8761" -ForegroundColor Yellow
Write-Host "API Gateway      : http://localhost:8888" -ForegroundColor Yellow
Write-Host "Frontend UI      : http://localhost:4200" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Green
