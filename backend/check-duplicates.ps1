# Fetch a sample of duplicate German books for side-by-side comparison
$baseUrl = 'https://bookdigest-lypx.onrender.com/api/books'

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  DUPLICATE GERMAN BOOKS - SIDE BY SIDE CHECK" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Fetch all German books
$allDeBooks = @()
$page = 1
$totalPages = 1

Write-Host "Fetching all German books..." -ForegroundColor Gray
while ($page -le $totalPages) {
    if ($page % 5 -eq 0 -or $page -eq 1) {
        Write-Host "  Fetching page $page... ($($allDeBooks.Count) books fetched)" -ForegroundColor DarkGray
    }
    $url = "$baseUrl`?language=de&limit=50&page=$page"
    $response = Invoke-RestMethod -Uri $url
    $allDeBooks += $response.data.books
    $totalPages = $response.data.pagination.pages
    $page++
    Start-Sleep -Milliseconds 200
}
Write-Host "Fetched $($allDeBooks.Count) German books.`n" -ForegroundColor Green

# Find duplicates and pick 5 sample pairs
$titleGroups = $allDeBooks | Group-Object -Property title | Where-Object { $_.Count -gt 1 }
$samples = $titleGroups | Select-Object -First 5

$sampleNum = 0
foreach ($group in $samples) {
    $sampleNum++
    $copies = $group.Group | Sort-Object -Property createdAt

    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    Write-Host "  SAMPLE $($sampleNum): `"$($group.Name)`" ($($group.Count) copies)" -ForegroundColor Magenta
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Magenta

    $copyNum = 0
    foreach ($book in $copies) {
        $copyNum++
        $label = if ($copyNum -eq 1) { "COPY A (older)" } else { "COPY B (newer)" }
        $color = if ($copyNum -eq 1) { "Yellow" } else { "Green" }

        Write-Host "  --- $label ---" -ForegroundColor $color
        Write-Host "  ID:         $($book.id)" -ForegroundColor White
        Write-Host "  Created:    $($book.createdAt)" -ForegroundColor White
        Write-Host "  Updated:    $($book.updatedAt)" -ForegroundColor White
        Write-Host "  Category:   $($book.categoryId)" -ForegroundColor White
        Write-Host "  Rating:     $($book.rating)" -ForegroundColor White
        Write-Host "  Ratings#:   $($book.ratingsCount)" -ForegroundColor White
        Write-Host "  Cover:      $($book.coverImage)" -ForegroundColor White

        # Summary comparison
        $summaryLen = if ($null -ne $book.summary) { $book.summary.Length } else { 0 }
        $summaryPreview = if ($summaryLen -gt 150) { $book.summary.Substring(0, 150) + '...' } elseif ($summaryLen -gt 0) { $book.summary } else { '(empty)' }
        Write-Host "  Summary:    $summaryLen chars" -ForegroundColor White
        Write-Host "              $summaryPreview" -ForegroundColor DarkGray

        # Key insights check
        $insightsLen = if ($null -ne $book.keyInsights) { $book.keyInsights.Length } else { 0 }
        Write-Host "  KeyInsights: $insightsLen chars" -ForegroundColor White

        # Chapters check
        $chaptersLen = if ($null -ne $book.chapters) { $book.chapters.Length } else { 0 }
        Write-Host "  Chapters:   $chaptersLen chars" -ForegroundColor White

        # Quotes check
        $quotesLen = if ($null -ne $book.quotes) { $book.quotes.Length } else { 0 }
        Write-Host "  Quotes:     $quotesLen chars" -ForegroundColor White

        # Action items check
        $actionLen = if ($null -ne $book.actionItems) { $book.actionItems.Length } else { 0 }
        Write-Host "  ActionItems: $actionLen chars" -ForegroundColor White

        Write-Host ""
    }

    # Comparison verdict
    $a = $copies[0]
    $b = $copies[1]
    
    $aSummaryLen = if ($null -ne $a.summary) { $a.summary.Length } else { 0 }
    $bSummaryLen = if ($null -ne $b.summary) { $b.summary.Length } else { 0 }
    $aInsightsLen = if ($null -ne $a.keyInsights) { $a.keyInsights.Length } else { 0 }
    $bInsightsLen = if ($null -ne $b.keyInsights) { $b.keyInsights.Length } else { 0 }
    $aChaptersLen = if ($null -ne $a.chapters) { $a.chapters.Length } else { 0 }
    $bChaptersLen = if ($null -ne $b.chapters) { $b.chapters.Length } else { 0 }
    $aQuotesLen = if ($null -ne $a.quotes) { $a.quotes.Length } else { 0 }
    $bQuotesLen = if ($null -ne $b.quotes) { $b.quotes.Length } else { 0 }
    $aActionLen = if ($null -ne $a.actionItems) { $a.actionItems.Length } else { 0 }
    $bActionLen = if ($null -ne $b.actionItems) { $b.actionItems.Length } else { 0 }

    $aTotal = $aSummaryLen + $aInsightsLen + $aChaptersLen + $aQuotesLen + $aActionLen
    $bTotal = $bSummaryLen + $bInsightsLen + $bChaptersLen + $bQuotesLen + $bActionLen

    Write-Host "  COMPARISON:" -ForegroundColor Cyan
    Write-Host "  Copy A total content: $aTotal chars | Copy B total content: $bTotal chars" -ForegroundColor Cyan
    if ($aTotal -gt $bTotal) {
        Write-Host "  >> Copy A has MORE content (You probably want to keep A and delete B)" -ForegroundColor Yellow
    } elseif ($bTotal -gt $aTotal) {
        Write-Host "  >> Copy B has MORE content (You probably want to keep B and delete A)" -ForegroundColor Green
    } else {
        Write-Host "  >> Both copies have EXACTLY EQUAL content length" -ForegroundColor White
    }
    Write-Host ""
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Total duplicate titles found: $($titleGroups.Count)" -ForegroundColor Cyan
Write-Host "  Samples shown above. Check properties to decide which to keep." -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan
