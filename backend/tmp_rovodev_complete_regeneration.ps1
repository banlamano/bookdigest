# Complete the regeneration - optimized for reliability
# Processes all remaining books with error handling

$url = "https://bookdigest-lypx.onrender.com/api/admin/regenerate-summaries"
$headers = @{"Content-Type" = "application/json"}

$batchSize = 10
$totalBooks = 454
$startFrom = 150  # Start from book 150 (we've done 0-150)

Write-Host "`n🚀 COMPLETING REGENERATION`n" -ForegroundColor Green
Write-Host "Starting from book: $startFrom" -ForegroundColor Cyan
Write-Host "Remaining: $($totalBooks - $startFrom) books" -ForegroundColor Cyan
Write-Host "Batches remaining: $([math]::Ceiling(($totalBooks - $startFrom) / $batchSize))`n" -ForegroundColor Cyan

$totalProcessed = 0
$totalSuccess = 0
$totalFailed = 0
$failedBatches = @()

for ($offset = $startFrom; $offset -lt $totalBooks; $offset += $batchSize) {
    $batchNum = [math]::Floor($offset / $batchSize) + 1
    $totalBatches = [math]::Ceiling($totalBooks / $batchSize)
    
    Write-Host "📦 Batch $batchNum of $totalBatches (Books $offset-$($offset+$batchSize-1))" -ForegroundColor Cyan
    
    $body = @{
        limit = $batchSize
        offset = $offset
        force = $true
        batchSize = 3
    } | ConvertTo-Json
    
    $retries = 0
    $maxRetries = 2
    $success = $false
    
    while (-not $success -and $retries -le $maxRetries) {
        try {
            $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body -TimeoutSec 300
            
            $totalProcessed += $response.stats.processed
            $totalSuccess += $response.stats.success
            $totalFailed += $response.stats.failed
            
            Write-Host "  ✅ Success: $($response.stats.success) | Failed: $($response.stats.failed)" -ForegroundColor Green
            
            $progress = [math]::Round(($offset / $totalBooks) * 100)
            Write-Host "  📊 Progress: $progress%`n" -ForegroundColor Yellow
            
            $success = $true
            
            # Small delay between batches
            Start-Sleep -Seconds 2
            
        } catch {
            $retries++
            Write-Host "  ⚠️  Attempt $retries failed: $($_.Exception.Message)" -ForegroundColor Yellow
            
            if ($retries -gt $maxRetries) {
                Write-Host "  ❌ Batch failed after $maxRetries retries. Skipping...`n" -ForegroundColor Red
                $failedBatches += $offset
            } else {
                Write-Host "  🔄 Retrying in 5 seconds...`n" -ForegroundColor Yellow
                Start-Sleep -Seconds 5
            }
        }
    }
}

Write-Host "`n" + ("=" * 80)
Write-Host "`n🎉 REGENERATION BATCH COMPLETE!`n" -ForegroundColor Green
Write-Host "Total processed: $totalProcessed" -ForegroundColor Cyan
Write-Host "Successful: $totalSuccess" -ForegroundColor Green
Write-Host "Failed: $totalFailed" -ForegroundColor $(if($totalFailed -gt 0){"Red"}else{"Gray"})

if ($failedBatches.Count -gt 0) {
    Write-Host "`nFailed batches (can retry later):" -ForegroundColor Yellow
    $failedBatches | ForEach-Object { Write-Host "  - Offset: $_" -ForegroundColor Gray }
}

Write-Host "`n" + ("=" * 80) + "`n"
