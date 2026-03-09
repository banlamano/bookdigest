# Scan all 454 books and categorize by word count
$apiBase = "https://bookdigest-lypx.onrender.com/api"

Write-Host "Fetching all books..." -ForegroundColor Cyan

# Get all books
$response = Invoke-RestMethod -Uri "$apiBase/books?limit=500" -Method GET
$allBooks = $response.data.books

Write-Host "Total books found: $($allBooks.Count)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Scanning each book for detailed content..." -ForegroundColor Cyan
Write-Host ""

$results = @()
$count = 0

foreach ($book in $allBooks) {
    $count++
    
    # Progress indicator
    if ($count % 50 -eq 0) {
        Write-Host "Progress: $count / $($allBooks.Count)" -ForegroundColor Gray
    }
    
    try {
        # Get full book details
        $bookDetail = Invoke-RestMethod -Uri "$apiBase/books/$($book.id)" -Method GET
        $bookData = $bookDetail.data.book
        
        # Parse JSON fields
        $insights = if ($bookData.keyInsights -and $bookData.keyInsights -ne '[]') {
            try { ($bookData.keyInsights | ConvertFrom-Json).Count } catch { 0 }
        } else { 0 }
        
        $chapters = if ($bookData.chapters -and $bookData.chapters -ne '[]') {
            try { ($bookData.chapters | ConvertFrom-Json).Count } catch { 0 }
        } else { 0 }
        
        # Calculate total words
        $summaryWords = ($bookData.summary -split '\s+').Count
        $insightsWords = if ($bookData.keyInsights -and $bookData.keyInsights -ne '[]') {
            ($bookData.keyInsights -split '\s+').Count
        } else { 0 }
        $chaptersWords = if ($bookData.chapters -and $bookData.chapters -ne '[]') {
            ($bookData.chapters -split '\s+').Count
        } else { 0 }
        
        $totalWords = $summaryWords + $insightsWords + $chaptersWords
        
        $results += [PSCustomObject]@{
            Id = $bookData.id
            Title = $bookData.title
            TotalWords = $totalWords
            SummaryWords = $summaryWords
            Insights = $insights
            Chapters = $chapters
            UpdatedAt = $bookData.updatedAt
        }
        
        # Rate limiting
        Start-Sleep -Milliseconds 200
        
    } catch {
        Write-Host "Error scanning $($book.title): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Scan complete!" -ForegroundColor Green
Write-Host ""

# Categorize results
$under100 = $results | Where-Object { $_.TotalWords -lt 100 }
$under2000 = $results | Where-Object { $_.TotalWords -ge 100 -and $_.TotalWords -lt 2000 }
$over2000 = $results | Where-Object { $_.TotalWords -ge 2000 }

# Display summary
Write-Host "=== RESULTS SUMMARY ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Total books scanned: $($results.Count)" -ForegroundColor White
Write-Host ""
Write-Host "❌ Under 100 words: $($under100.Count) books" -ForegroundColor Red
Write-Host "⚠️  100-1,999 words: $($under2000.Count) books" -ForegroundColor Yellow
Write-Host "✅ 2,000+ words: $($over2000.Count) books" -ForegroundColor Green
Write-Host ""

# Export to CSV
$results | Export-Csv -Path "tmp_rovodev_all_books_scan.csv" -NoTypeInformation
Write-Host "✅ Full results saved to: tmp_rovodev_all_books_scan.csv" -ForegroundColor Green

if ($under100.Count -gt 0) {
    $under100 | Export-Csv -Path "tmp_rovodev_books_under_100_words.csv" -NoTypeInformation
    Write-Host "❌ Books under 100 words saved to: tmp_rovodev_books_under_100_words.csv" -ForegroundColor Red
}

if ($under2000.Count -gt 0) {
    $under2000 | Export-Csv -Path "tmp_rovodev_books_under_2000_words.csv" -NoTypeInformation
    Write-Host "⚠️  Books under 2000 words saved to: tmp_rovodev_books_under_2000_words.csv" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Sample of books under 100 words:" -ForegroundColor Red
$under100 | Select-Object -First 10 | Format-Table -AutoSize Title, TotalWords, Insights, Chapters

Write-Host ""
Write-Host "Sample of books under 2000 words:" -ForegroundColor Yellow
$under2000 | Select-Object -First 10 | Format-Table -AutoSize Title, TotalWords, Insights, Chapters
