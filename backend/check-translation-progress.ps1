# Check translation progress
Write-Host "`n--- TRANSLATION PROGRESS ---`n" -ForegroundColor Cyan

try {
    $enResponse = Invoke-RestMethod -Uri 'https://bookdigest-lypx.onrender.com/api/books?language=en&limit=1'
    $deResponse = Invoke-RestMethod -Uri 'https://bookdigest-lypx.onrender.com/api/books?language=de&limit=1'

    $enTotal = $enResponse.data.total
    $deTotal = $deResponse.data.total

    Write-Host "English books: $enTotal" -ForegroundColor Yellow
    Write-Host "German books:  $deTotal" -ForegroundColor Green

    if ($enTotal -gt 0) {
        $pct = [math]::Round(($deTotal / $enTotal) * 100, 1)
        Write-Host "`nTranslation Progress: $pct% ($deTotal / $enTotal)" -ForegroundColor Cyan

        $remaining = $enTotal - $deTotal
        if ($remaining -eq 0) {
            Write-Host "`n All books have been translated!" -ForegroundColor Green
        } else {
            Write-Host "`n$remaining books still need translation" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "Error querying API: $_" -ForegroundColor Red
}

Write-Host ""
