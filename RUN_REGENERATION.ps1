# Regenerate All Book Summaries - Production
# Run this AFTER Render deployment completes

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🤖 REGENERATING ALL BOOK SUMMARIES" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmODVhZWUwZi04NjU0LTQyZDUtYjhmNC1hZDQzN2RiOWU3NWMiLCJlbWFpbCI6Im1iYW5sYUB3ZWIuZGUiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NzA3NDA5NzAsImV4cCI6MTc3MTM0NTc3MH0.-2huGO01iDl6NfHmgHtheBdAWFW12nV5PwCCnieE-dk"

Write-Host "Admin: mbanla@web.de" -ForegroundColor Cyan
Write-Host "Target: All 454 books" -ForegroundColor White
Write-Host "Expected time: ~20-30 minutes`n" -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    batchSize = 10
    force = $true
    limit = 454  # All books
} | ConvertTo-Json

Write-Host "Starting regeneration..." -ForegroundColor Yellow
Write-Host "This will generate for EACH book:" -ForegroundColor Cyan
Write-Host "  ✓ Full summary (Big Idea + Why It Matters)" -ForegroundColor White
Write-Host "  ✓ 8-12 Key Insights with explanations" -ForegroundColor White
Write-Host "  ✓ 8-12 Chapter Summaries" -ForegroundColor White
Write-Host "  ✓ 5-8 Memorable Quotes" -ForegroundColor White
Write-Host "  ✓ 7-10 Action Items`n" -ForegroundColor White

try {
    Write-Host "Calling API endpoint..." -ForegroundColor Yellow
    Write-Host "POST https://bookdigest-lypx.onrender.com/api/admin/regenerate-summaries`n" -ForegroundColor Gray
    
    $response = Invoke-RestMethod `
        -Uri "https://bookdigest-lypx.onrender.com/api/admin/regenerate-summaries" `
        -Method Post `
        -Headers $headers `
        -Body $body `
        -ContentType "application/json" `
        -TimeoutSec 3600 `
        -ErrorAction Stop

    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "✅ REGENERATION COMPLETE!" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    
    Write-Host "Results:" -ForegroundColor Cyan
    Write-Host "Total Books:    $($response.stats.total)" -ForegroundColor White
    Write-Host "Processed:      $($response.stats.processed)" -ForegroundColor White
    Write-Host "Success:        $($response.stats.success)" -ForegroundColor Green
    Write-Host "Failed:         $($response.stats.failed)" -ForegroundColor $(if ($response.stats.failed -gt 0) { 'Red' } else { 'Green' })
    
    if ($response.stats.success -gt 0) {
        $successRate = [math]::Round(($response.stats.success / $response.stats.processed) * 100, 1)
        Write-Host "Success Rate:   $successRate%" -ForegroundColor Green
    }
    
    Write-Host "`n🎉 All books now have full AI-generated content!" -ForegroundColor Magenta
    Write-Host "`nTest any book at:" -ForegroundColor Yellow
    Write-Host "https://book-digest.com/books/df4b11a0-d1d1-4a89-8a7f-9fdad717fdf5" -ForegroundColor White
    Write-Host "`nYou should now see:" -ForegroundColor Cyan
    Write-Host "  ✓ Full summaries" -ForegroundColor White
    Write-Host "  ✓ Key Insights section" -ForegroundColor White
    Write-Host "  ✓ Chapter Summaries section" -ForegroundColor White
    Write-Host "  ✓ Memorable Quotes section" -ForegroundColor White
    Write-Host "  ✓ Action Items checklist`n" -ForegroundColor White

} catch {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "❌ ERROR" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Red
    
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 401) {
        Write-Host "Authentication failed!" -ForegroundColor Red
        Write-Host "Your token may have expired. Get a new one by logging in.`n" -ForegroundColor Yellow
    } elseif ($statusCode -eq 403) {
        Write-Host "Permission denied!" -ForegroundColor Red
        Write-Host "Make sure you're logged in as ADMIN.`n" -ForegroundColor Yellow
    } elseif ($statusCode -eq 500) {
        Write-Host "Server error!" -ForegroundColor Red
        Write-Host "Possible causes:" -ForegroundColor Yellow
        Write-Host "- Gemini API key is invalid" -ForegroundColor White
        Write-Host "- Render didn't finish deploying" -ForegroundColor White
        Write-Host "- API rate limit exceeded`n" -ForegroundColor White
        Write-Host "Error details: $($_.Exception.Message)`n" -ForegroundColor Gray
    } else {
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)`n" -ForegroundColor Yellow
    }
    
    Write-Host "Check Render logs for more details:" -ForegroundColor Cyan
    Write-Host "https://dashboard.render.com`n" -ForegroundColor White
    
    exit 1
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
