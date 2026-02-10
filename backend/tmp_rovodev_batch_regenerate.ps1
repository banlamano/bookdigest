# Batch Regeneration Script - Process books in manageable chunks
# This avoids timeouts and allows progress monitoring

param(
    [int]$BatchSize = 50,
    [int]$StartFrom = 0
)

Write-Host "`n🔄 BATCH REGENERATION - Reliable Method`n" -ForegroundColor Green
Write-Host "==============================================================================="
Write-Host "Batch Size: $BatchSize books" -ForegroundColor Cyan
Write-Host "Starting from: Book #$StartFrom" -ForegroundColor Cyan
Write-Host "Estimated time: 5-10 minutes per batch`n" -ForegroundColor Yellow

$adminToken = Read-Host "Enter your admin token (from Render environment ADMIN_TOKEN)"

$url = "https://bookdigest-lypx.onrender.com/api/admin/regenerate-summaries"
$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

$body = @{
    limit = $BatchSize
    offset = $StartFrom
    force = $true
} | ConvertTo-Json

Write-Host "🚀 Calling regeneration API..." -ForegroundColor Cyan
Write-Host "URL: $url" -ForegroundColor Gray
Write-Host "Batch: $StartFrom to $($StartFrom + $BatchSize)`n" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body -TimeoutSec 900
    
    Write-Host "`n✅ BATCH COMPLETE!`n" -ForegroundColor Green
    Write-Host "Processed: $($response.processed) books" -ForegroundColor Cyan
    Write-Host "Successful: $($response.successful)" -ForegroundColor Green
    Write-Host "Failed: $($response.failed)" -ForegroundColor $(if($response.failed -gt 0){"Red"}else{"Gray"})
    Write-Host "Skipped: $($response.skipped)" -ForegroundColor Yellow
    
    $nextBatch = $StartFrom + $BatchSize
    Write-Host "`n📊 PROGRESS: $([math]::Round(($nextBatch/454)*100))% complete" -ForegroundColor Cyan
    
    if ($nextBatch -lt 454) {
        Write-Host "`n⏭️  NEXT STEP:" -ForegroundColor Yellow
        Write-Host "Run: .\tmp_rovodev_batch_regenerate.ps1 -StartFrom $nextBatch`n" -ForegroundColor White
    } else {
        Write-Host "`n🎉 ALL BOOKS PROCESSED!`n" -ForegroundColor Green
    }
    
} catch {
    Write-Host "`n❌ ERROR: $($_.Exception.Message)`n" -ForegroundColor Red
    Write-Host "You can retry this batch or try a smaller batch size.`n" -ForegroundColor Yellow
}

Write-Host "===============================================================================`n"
