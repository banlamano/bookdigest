# Make a user admin + premium via API
$email = "banlam@ok.de"
$secret = "your-admin-secret-123"  # You can change this

$body = @{
    email = $email
    secret = $secret
} | ConvertTo-Json

Write-Host "Making $email admin + premium..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod `
        -Uri "https://bookdigest-lypx.onrender.com/api/admin/make-premium" `
        -Method POST `
        -Body $body `
        -ContentType 'application/json'
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Email: $($response.data.email)" -ForegroundColor White
    Write-Host "Role: $($response.data.role)" -ForegroundColor White
    Write-Host "Subscription: $($response.data.subscriptionStatus)" -ForegroundColor White
    Write-Host ""
    Write-Host "Now logout and login again with $email" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "This means the endpoint isn't deployed yet." -ForegroundColor Yellow
    Write-Host "You need to push the code changes to Render." -ForegroundColor Yellow
}
