# Investigation Script: Check for duplicate German books and English books with German summaries
$baseUrl = 'https://bookdigest-lypx.onrender.com/api/books'

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  TRANSLATION INVESTIGATION REPORT" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# --- PART 1: Fetch all German books and check for duplicates ---
Write-Host "--- PART 1: Checking for DUPLICATE German books ---`n" -ForegroundColor Yellow

$allDeBooks = @()
$page = 1
$totalPages = 1

Write-Host "Fetching all German books..." -ForegroundColor Gray
while ($page -le $totalPages) {
    $url = "$baseUrl`?language=de&limit=50&page=$page"
    $response = Invoke-RestMethod -Uri $url
    $allDeBooks += $response.data.books
    $totalPages = $response.data.pagination.pages
    if ($page -eq 1) {
        Write-Host "  Total German books to fetch: $($response.data.pagination.total) across $totalPages pages" -ForegroundColor Gray
    }
    Write-Host "  Fetched page $page/$totalPages ($($allDeBooks.Count) books so far)" -ForegroundColor DarkGray
    $page++
    Start-Sleep -Milliseconds 200
}

Write-Host "`nTotal German books fetched: $($allDeBooks.Count)" -ForegroundColor Green

# Group by title to find duplicates
$titleGroups = $allDeBooks | Group-Object -Property title | Where-Object { $_.Count -gt 1 }

if ($titleGroups.Count -eq 0) {
    Write-Host "No duplicate German book titles found." -ForegroundColor Green
} else {
    Write-Host "`nFound $($titleGroups.Count) titles with DUPLICATES:" -ForegroundColor Red
    $totalDuplicates = 0
    foreach ($group in $titleGroups | Sort-Object -Property Count -Descending) {
        $dupeCount = $group.Count - 1
        $totalDuplicates += $dupeCount
        Write-Host "  [$($group.Count)x] $($group.Name)" -ForegroundColor Yellow
    }
    Write-Host "`nTotal extra duplicate entries: $totalDuplicates" -ForegroundColor Red
    Write-Host "Unique German titles: $($allDeBooks.Count - $totalDuplicates)" -ForegroundColor Cyan
}

# --- PART 2: Check English books with German summaries ---
Write-Host "`n`n--- PART 2: Checking English books with GERMAN summaries ---`n" -ForegroundColor Yellow

$allEnBooks = @()
$page = 1
$totalPages = 1

Write-Host "Fetching all English books..." -ForegroundColor Gray
while ($page -le $totalPages) {
    $url = "$baseUrl`?language=en&limit=50&page=$page"
    $response = Invoke-RestMethod -Uri $url
    $allEnBooks += $response.data.books
    $totalPages = $response.data.pagination.pages
    if ($page -eq 1) {
        Write-Host "  Total English books to fetch: $($response.data.pagination.total) across $totalPages pages" -ForegroundColor Gray
    }
    Write-Host "  Fetched page $page/$totalPages ($($allEnBooks.Count) books so far)" -ForegroundColor DarkGray
    $page++
    Start-Sleep -Milliseconds 200
}

Write-Host "`nTotal English books fetched: $($allEnBooks.Count)" -ForegroundColor Green

# Common German words/phrases to detect German text in summaries
$germanIndicators = @(
    'dieses Buch', 'ein transformatives', 'und umsetzbare',
    'Einblicke', 'destilliert', 'Handbuch', 'herausfordert',
    'Enthusiasten', 'bietet', 'konventionelles Denken',
    'verbessern', 'bedeutungsvolle Ergebnisse', 'erzielen',
    'praktische Weisheit', 'sofort angewendet',
    ' und ', ' ist ', ' das ', ' die ', ' der ', ' von ', ' den ',
    'transformatives Handbuch', 'komplexe Konzepte',
    'Leser', 'Kapitel', 'Zusammenfassung',
    ' f' + [char]0x00FC + 'r ',
    ' ' + [char]0x00FC + 'ber '
)

$germanEnBooks = @()
$englishEnBooks = @()

foreach ($book in $allEnBooks) {
    $summary = $book.summary
    if (-not $summary) { continue }
    
    $germanHits = 0
    foreach ($indicator in $germanIndicators) {
        if ($summary -match [regex]::Escape($indicator)) {
            $germanHits++
        }
    }
    
    # If 3+ German indicators found, likely German text
    if ($germanHits -ge 3) {
        $germanEnBooks += [PSCustomObject]@{
            Title = $book.title
            Author = $book.author
            Id = $book.id
            GermanHits = $germanHits
            SummaryPreview = if ($summary.Length -gt 80) { $summary.Substring(0, 80) + '...' } else { $summary }
        }
    } else {
        $englishEnBooks += $book
    }
}

if ($germanEnBooks.Count -eq 0) {
    Write-Host "All English books have English summaries." -ForegroundColor Green
} else {
    Write-Host "`nFound $($germanEnBooks.Count) English books with GERMAN summaries:" -ForegroundColor Red
    Write-Host ""
    $count = 0
    foreach ($book in $germanEnBooks | Sort-Object -Property GermanHits -Descending) {
        $count++
        Write-Host "  $count. `"$($book.Title)`" by $($book.Author)" -ForegroundColor Yellow
        Write-Host "     ID: $($book.Id)" -ForegroundColor DarkGray
        Write-Host "     Preview: $($book.SummaryPreview)" -ForegroundColor DarkGray
        if ($count -ge 30) {
            Write-Host "`n  ... and $($germanEnBooks.Count - 30) more" -ForegroundColor DarkGray
            break
        }
    }
}

# --- SUMMARY ---
Write-Host "`n`n============================================" -ForegroundColor Cyan
Write-Host "  SUMMARY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  English books total:              $($allEnBooks.Count)" -ForegroundColor White
Write-Host "  English books w/ English summary:  $($englishEnBooks.Count)" -ForegroundColor Green
Write-Host "  English books w/ German summary:   $($germanEnBooks.Count)" -ForegroundColor $(if ($germanEnBooks.Count -gt 0) { 'Red' } else { 'Green' })
Write-Host "  German books total:               $($allDeBooks.Count)" -ForegroundColor White
$dupeTotal = if ($titleGroups) { ($titleGroups | ForEach-Object { $_.Count - 1 } | Measure-Object -Sum).Sum } else { 0 }
Write-Host "  Duplicate German titles:          $dupeTotal" -ForegroundColor $(if ($dupeTotal -gt 0) { 'Red' } else { 'Green' })
Write-Host "  Unique German titles:             $($allDeBooks.Count - $dupeTotal)" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan
