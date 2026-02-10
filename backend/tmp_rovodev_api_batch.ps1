# API-based batch regeneration - most reliable for remote database
# This calls the Render API which runs ON the server (no connection issues)

param(
    [string]$AdminToken = "",
    [int]$BatchSize = 30,
    [int]$TotalBooks = 454
)

if ($AdminToken -eq "") {
    Write-Host "`n⚠️  Admin token required!`n" -ForegroundColor Yellow
    Write-Host "Option 1: Get it from Render dashboard → Environment → ADMIN_SECRET" -ForegroundColor Cyan
    Write-Host "Option 2: Login to admin panel and get token from browser localStorage`n" -ForegroundColor Cyan
    
    Write-Host "For now, trying with ADMIN_SECRET from .env.production..." -ForegroundColor Yellow
    $AdminToken = "bookdigest-admin-2026"
}

Write-Host "`n🚀 API BATCH REGENERATION`n" -ForegroundColor Green
Write-Host "==============================================================================="
Write-Host "Total books: $TotalBooks" -ForegroundColor Cyan
Write-Host "Batch size: $BatchSize books" -ForegroundColor Cyan
Write-Host "Total batches: $([math]::Ceiling($TotalBooks / $BatchSize))" -ForegroundColor Cyan
Write-Host "Estimated time: ~2-3 hours`n" -ForegroundColor Yellow

$url = "https://bookdigest-lypx.onrender.com/api/admin/regenerate-summaries"
$headers = @{
    "Authorization" = "Bearer $AdminToken"
    "Content-Type" = "application/json"
}

$totalProcessed = 0
$totalSuccess = 0
$totalFailed = 0

for ($offset = 0; $offset -lt $TotalBooks; $offset += $BatchSize) {
    $batchNum = [math]::Floor($offset / $BatchSize) + 1
    $totalBatches = [math]::Ceiling($TotalBooks / $BatchSize)
    
    Write-Host "`n📦 BATCH $batchNum of $totalBatches (Books $offset to $($offset + $BatchSize - 1))" -ForegroundColor Cyan
    Write-Host "=" * 80
    
    $body = @{
        limit = $BatchSize
        offset = $offset
        force = $true
        batchSize = 5
    } | ConvertTo-Json
    
    try {
        Write-Host "🔄 Calling API..." -ForegroundColor Yellow
        $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body -TimeoutSec 600
        
        Write-Host "✅ Batch complete!" -ForegroundColor Green
        Write-Host "   Processed: $($response.stats.processed)" -ForegroundColor White
        Write-Host "   Success: $($response.stats.success)" -ForegroundColor Green
        Write-Host "   Failed: $($response.stats.failed)" -ForegroundColor $(if($response.stats.failed -gt 0){"Red"}else{"Gray"})
        
        $totalProcessed += $response.stats.processed
        $totalSuccess += $response.stats.success
        $totalFailed += $response.stats.failed
        
        $progress = [math]::Round((($offset + $BatchSize) / $TotalBooks) * 100)
        Write-Host "`n📊 Overall Progress: $progress% ($($offset + $BatchSize)/$TotalBooks)" -ForegroundColor Cyan
        
        # Short delay between batches
        if ($offset + $BatchSize -lt $TotalBooks) {
            Write-Host "`n⏸️  Waiting 5 seconds before next batch..." -ForegroundColor Gray
            Start-Sleep -Seconds 5
        }
        
    } catch {
        Write-Host "❌ Batch failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Continuing to next batch..." -ForegroundColor Yellow
    }
}

Write-Host "`n`n" + "=" * 80
Write-Host "`n🎉 REGENERATION COMPLETE!`n" -ForegroundColor Green
Write-Host "Total processed: $totalProcessed" -ForegroundColor Cyan
Write-Host "Successful: $totalSuccess" -ForegroundColor Green
Write-Host "Failed: $totalFailed" -ForegroundColor $(if($totalFailed -gt 0){"Red"}else{"Gray"})
Write-Host "`n" + "=" * 80 + "`n"
