# SmartMove Microservices Startup Script

Write-Host "Starting SmartMove Microservices..." -ForegroundColor Cyan

# Start Eureka (Discovery Service)
Write-Host "Starting Discovery Service (Eureka) on port 8761..."
Start-Process powershell -ArgumentList "mvn spring-boot:run -pl discovery-service" -WindowStyle Normal
Start-Sleep -Seconds 20

# Start Gateway Service
Write-Host "Starting Gateway Service on port 8888..."
Start-Process powershell -ArgumentList "mvn spring-boot:run -pl gateway-service" -WindowStyle Normal
Start-Sleep -Seconds 15

# Start Backend Services
$services = @("user-service", "traffic-service", "incident-service", "meteo-service", "prediction-service", "notification-service")

foreach ($service in $services) {
    Write-Host "Starting $service..."
    Start-Process powershell -ArgumentList "mvn spring-boot:run -pl $service" -WindowStyle Normal
    Start-Sleep -Seconds 10
}

Write-Host "All backend services are starting. Check their windows for logs." -ForegroundColor Green
Write-Host "Access Eureka at: http://localhost:8761" -ForegroundColor Yellow
Write-Host "Access Gateway at: http://localhost:8888" -ForegroundColor Yellow
