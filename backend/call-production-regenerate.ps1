# PowerShell script to trigger production summary regeneration

Write-Host "`n🚀 Starting Production AI Summary Regeneration`n" -ForegroundColor Green
Write-Host "This will regenerate summaries for all 454 books on production." -ForegroundColor Yellow
Write-Host "Estimated time: 3-4 hours`n" -ForegroundColor Yellow

$url = "https://bookdigest-lypx.onrender.com/api/admin/regenerate-summaries"

# Configuration
$body = @{
    batchSize = 10
    force = $true
    limit = 454  # Process all books
} | ConvertTo-Json

Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Batch Size: 10 books at a time"
Write-Host "  Force: Yes (regenerate all)"
Write-Host "  Total Books: 454`n"

Write-Host "Sending request to production API..." -ForegroundColor Cyan
Write-Host "URL: $url`n"

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json" -TimeoutSec 14400
    
    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "`nResults:" -ForegroundColor Cyan
    Write-Host "  Status: $($response.status)"
    Write-Host "  Message: $($response.message)"
    Write-Host "`nStatistics:" -ForegroundColor Cyan
    Write-Host "  Total: $($response.stats.total)"
    Write-Host "  Processed: $($response.stats.processed)"
    Write-Host "  Success: $($response.stats.success)" -ForegroundColor Green
    Write-Host "  Failed: $($response.stats.failed)" -ForegroundColor Red
    Write-Host "`n🎉 Production summaries have been regenerated!`n" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ ERROR!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
    
    Write-Host "`nPossible reasons:" -ForegroundColor Yellow
    Write-Host "  1. Render is still deploying (wait 2-3 minutes)"
    Write-Host "  2. Endpoint not available yet"
    Write-Host "  3. Request timeout (normal for long operations)"
    Write-Host "`nIf timeout, check Render logs to monitor progress.`n"
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
