# Verification Script - Check all 83 regenerated books
# Run this after regeneration completes

$token = Read-Host "Enter your admin token"
$headers = @{ 'Authorization' = "Bearer $token" }

$bookIds = Get-Content "books_to_regenerate.txt" | ForEach-Object { $_.ToString().Trim() }

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Regeneration Verification Report" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Checking $($bookIds.Count) books..." -ForegroundColor Yellow
Write-Host ""

$results = @()
$success = 0
$failed = 0
$excellent = 0

foreach ($id in $bookIds) {
    try {
        $book = Invoke-RestMethod -Uri "https://bookdigest-lypx.onrender.com/api/books/$id" -Headers $headers -Method GET
        
        # Calculate word counts
        $summaryWords = ($book.data.book.summary -split '\s+').Count
        $insightsCount = if ($book.data.book.keyInsights -and $book.data.book.keyInsights -ne '[]') {
            ($book.data.book.keyInsights | ConvertFrom-Json).Count
        } else { 0 }
        $chaptersCount = if ($book.data.book.chapters -and $book.data.book.chapters -ne '[]') {
            ($book.data.book.chapters | ConvertFrom-Json).Count
        } else { 0 }
        
        # Estimate chapter words (rough calculation)
        $chapterWords = 0
        if ($book.data.book.chapters -and $book.data.book.chapters -ne '[]') {
            $chaptersJson = $book.data.book.chapters | ConvertFrom-Json
            foreach ($chapter in $chaptersJson) {
                if ($chapter.content) {
                    $chapterWords += ($chapter.content -split '\s+').Count
                }
            }
        }
        
        $totalWords = $summaryWords + $chapterWords
        
        # Check if updated recently (last 30 minutes)
        $updated = [DateTime]$book.data.book.updatedAt
        $isRecent = $updated -gt (Get-Date).AddMinutes(-30)
        
        # Determine quality
        $quality = "❌ Failed"
        $color = "Red"
        
        if ($totalWords -ge 2000 -and $insightsCount -ge 6 -and $chaptersCount -ge 5) {
            $quality = "✅ Excellent"
            $color = "Green"
            $excellent++
            $success++
        } elseif ($totalWords -ge 1500 -and $insightsCount -ge 5 -and $chaptersCount -ge 5) {
            $quality = "✅ Good"
            $color = "Green"
            $success++
        } elseif ($totalWords -ge 1000) {
            $quality = "⚠️  Acceptable"
            $color = "Yellow"
            $success++
        } else {
            $failed++
        }
        
        $results += [PSCustomObject]@{
            Title = $book.data.book.title
            TotalWords = $totalWords
            Summary = $summaryWords
            Insights = $insightsCount
            Chapters = $chaptersCount
            ChapterWords = $chapterWords
            Quality = $quality
            Updated = $updated.ToString("yyyy-MM-dd HH:mm")
            Recent = if($isRecent){"✅"}else{""}
        }
        
        Write-Host "$quality | $($book.data.book.title) ($totalWords words)" -ForegroundColor $color
        
    } catch {
        $failed++
        Write-Host "❌ Error | $id : $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 200
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total checked: $($bookIds.Count)" -ForegroundColor White
Write-Host "✅ Excellent (2,000+ words): $excellent" -ForegroundColor Green
Write-Host "✅ Success (1,000+ words): $success" -ForegroundColor Green
Write-Host "❌ Failed (<1,000 words): $failed" -ForegroundColor Red
Write-Host ""

if ($success -gt 0) {
    $successRate = [math]::Round(($success / $bookIds.Count) * 100, 1)
    Write-Host "Success rate: $successRate%" -ForegroundColor $(if($successRate -ge 90){"Green"}elseif($successRate -ge 70){"Yellow"}else{"Red"})
    Write-Host ""
}

# Save detailed results to CSV
$results | Export-Csv "regeneration_results.csv" -NoTypeInformation
Write-Host "📊 Detailed results saved to: regeneration_results.csv" -ForegroundColor Cyan
Write-Host ""

# Show top 10 best results
Write-Host "Top 10 Best Results:" -ForegroundColor Green
$results | Sort-Object TotalWords -Descending | Select-Object -First 10 | Format-Table Title, TotalWords, Insights, Chapters, Quality -AutoSize

# Show any failures
if ($failed -gt 0) {
    Write-Host ""
    Write-Host "Books that need attention:" -ForegroundColor Yellow
    $results | Where-Object { $_.TotalWords -lt 1000 } | Format-Table Title, TotalWords, Insights, Chapters -AutoSize
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Verification Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
