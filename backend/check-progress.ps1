# Quick progress checker for AI regeneration
param()

Write-Host "`n📊 AI REGENERATION PROGRESS CHECK`n" -ForegroundColor Cyan

$url = 'https://bookdigest-lypx.onrender.com/api/books?page=1&limit=10'
$response = Invoke-RestMethod -Uri $url
$books = $response.data.books

$aiGenerated = 0
$templates = 0

foreach ($book in $books) {
    $isAI = $book.summary.Length -gt 800 -and 
            $book.summary -notmatch "transformative guide" -and
            $book.summary -notmatch "This book distills"
    
    if ($isAI) { $aiGenerated++ } else { $templates++ }
}

Write-Host "Sample Size: 10 books" -ForegroundColor Yellow
Write-Host "AI-Generated: $aiGenerated" -ForegroundColor Green
Write-Host "Templates: $templates" -ForegroundColor Yellow

$percent = [math]::Round(($aiGenerated/10)*100)
Write-Host "`nEstimated Progress: $percent percent of sampled books" -ForegroundColor Cyan

if ($aiGenerated -eq 0) {
    Write-Host "`n⏳ Still processing... Check again in 15-30 minutes" -ForegroundColor Yellow
} elseif ($aiGenerated -lt 5) {
    $estimatedPercent = $aiGenerated * 10
    Write-Host "`n🔄 In progress... About $estimatedPercent percent complete" -ForegroundColor Yellow
} else {
    $estimatedPercent = $aiGenerated * 10
    Write-Host "`n✅ Good progress! About $estimatedPercent percent complete" -ForegroundColor Green
}

Write-Host ""
