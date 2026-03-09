# Targeted Book Regeneration Script
# Target: 2,000+ words per book
# Books: 83 identified for improvement

$bookIds = Get-Content "books_to_regenerate.txt"
$apiUrl = "https://bookdigest-lypx.onrender.com/api/admin/regenerate-summaries"

Write-Host "=== Starting Regeneration ===" -ForegroundColor Cyan
Write-Host "Books to process: $($bookIds.Count)" -ForegroundColor Yellow
Write-Host "Target: 2,000+ words per book" -ForegroundColor Yellow
Write-Host ""

$batchSize = 10
$totalBatches = [math]::Ceiling($bookIds.Count / $batchSize)
$processed = 0
$success = 0
$failed = 0

for ($i = 0; $i -lt $bookIds.Count; $i += $batchSize) {
    $currentBatch = $i / $batchSize + 1
    $batch = $bookIds[$i..([math]::Min($i + $batchSize - 1, $bookIds.Count - 1))]
    
    Write-Host "[$currentBatch/$totalBatches] Processing batch of $($batch.Count) books..." -ForegroundColor Cyan
    
    $body = @{
        ids = @($batch)
        batchSize = 1
        force = $true
        useGPT4 = $false
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $body -ContentType 'application/json' -TimeoutSec 300
        
        if ($response.status -eq 'success') {
            $success += $batch.Count
            Write-Host "  ✅ Batch completed successfully" -ForegroundColor Green
        } else {
            $failed += $batch.Count
            Write-Host "  ⚠️ Batch completed with warnings" -ForegroundColor Yellow
        }
    } catch {
        $failed += $batch.Count
        Write-Host "  ❌ Batch failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    $processed += $batch.Count
    Write-Host "  Progress: $processed/$($bookIds.Count) books processed" -ForegroundColor Gray
    
    # Wait 30 seconds between batches (except for last batch)
    if ($i + $batchSize -lt $bookIds.Count) {
        Write-Host "  ⏳ Waiting 30 seconds before next batch..." -ForegroundColor Gray
        Start-Sleep -Seconds 30
    }
    
    Write-Host ""
}

Write-Host "=== Regeneration Complete ===" -ForegroundColor Green
Write-Host "Total processed: $processed" -ForegroundColor White
Write-Host "Successful: $success" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host ""
Write-Host "Next step: Verify books have 2,000+ words" -ForegroundColor Yellow
