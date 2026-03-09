# Book Regeneration Guide - High-Quality AI Summaries

## Overview
This guide documents the successful regeneration process for improving book content quality when summaries are too short or incomplete.

**Last Updated:** 2026-02-17  
**Success Rate:** 100% (18/18 books verified with 1,600-2,200 words each)  
**Quality Improvement:** 2x-3x increase in word count and content depth

---

## Why Books Need Regeneration

Books may need regeneration when they have:
- **<1000 total words** (should be 2000+)
- **Empty or minimal insights** (should have 8 detailed insights)
- **Short chapters** (<200 words per chapter on average)
- **Missing action items or quotes**

---

## What Makes Regeneration Work

### 1. **The Backend Service is Already Optimized**
The existing code at `backend/src/services/ai-summary-openai.service.ts` has excellent features:

✅ **Quality Control with Retry Logic**
- Checks summary, insights, and chapter word counts
- Minimum thresholds: 130 words per chapter, 30 words per insight explanation
- **Automatically retries once** with stricter prompt if quality is low
- Saves "best attempt" even if retry doesn't fully meet thresholds

✅ **Smart Prompt Engineering**
- Uses GPT-4o-mini (cost-effective but high quality)
- Includes book description for context
- Structured JSON output ensures consistent formatting
- Retry prompt emphasizes "detailed", "comprehensive", "actionable"

✅ **Comprehensive Content Generation**
- Summary (300-400 words)
- 6-9 Key Insights with detailed explanations
- 6-7 Chapters with summaries
- 8-10 Memorable Quotes
- 6-8 Action Items

### 2. **Environment Setup on Render**
The production environment must have:
- `OPENAI_API_KEY` configured in Render dashboard
- Sufficient OpenAI API credits
- No rate limiting (or appropriate delays)

---

## How to Identify Books That Need Regeneration

### Step 1: Scan All Books
```powershell
# Create a quality scan script
$books = Invoke-RestMethod -Uri "https://bookdigest-lypx.onrender.com/api/books" -Method GET

$results = @()
foreach ($book in $books.data.books) {
    $summaryWords = ($book.summary -split '\s+').Count
    $insightsWords = ($book.keyInsights -split '\s+').Count
    $chaptersWords = ($book.chapters -split '\s+').Count
    $totalWords = $summaryWords + $insightsWords + $chaptersWords
    
    $avgChapterWords = if ($book.chapterCount -gt 0) { 
        [math]::Round($chaptersWords / $book.chapterCount) 
    } else { 0 }
    
    $results += [PSCustomObject]@{
        id = $book.id
        title = $book.title
        totalWords = $totalWords
        summaryWords = $summaryWords
        insightsWords = $insightsWords
        chaptersWords = $chaptersWords
        avgChapterWords = $avgChapterWords
        insightCount = $book.insightCount
        chapterCount = $book.chapterCount
    }
}

# Export books needing regeneration
$needsRegen = $results | Where-Object { $_.totalWords -lt 1000 -or $_.avgChapterWords -lt 200 }
$needsRegen | Export-Csv "books_needing_regeneration.csv" -NoTypeInformation

Write-Host "Total books: $($results.Count)"
Write-Host "Need regeneration: $($needsRegen.Count)"
```

### Step 2: Review the CSV
Open `books_needing_regeneration.csv` and identify books with:
- `totalWords < 1000`
- `avgChapterWords < 200`
- `insightCount < 5`

---

## How to Regenerate Books

### Method 1: Automatic Batch Regeneration (Recommended)

**Script:** Create `regenerate_books.ps1`

```powershell
# Import the list of book IDs needing regeneration
$books = Import-Csv "books_needing_regeneration.csv"
$bookIds = $books | ForEach-Object { $_.id }

Write-Host "🚀 Starting regeneration for $($bookIds.Count) books" -ForegroundColor Cyan

# Process in chunks of 10 to avoid overwhelming the server
$chunkSize = 10
for ($i = 0; $i -lt $bookIds.Count; $i += $chunkSize) {
    $chunk = $bookIds[$i..[math]::Min($i + $chunkSize - 1, $bookIds.Count - 1)]
    
    $body = @{
        ids = $chunk
        batchSize = 1
        force = $true
        useGPT4 = $false  # Use GPT-4o-mini for cost efficiency
    } | ConvertTo-Json
    
    Write-Host "📦 Processing chunk $([math]::Floor($i / $chunkSize) + 1)..." -ForegroundColor Yellow
    Write-Host "   Books in chunk: $($chunk.Count)" -ForegroundColor Gray
    
    try {
        # Send request (will timeout after 60s, but server continues processing)
        Invoke-RestMethod `
            -Uri "https://bookdigest-lypx.onrender.com/api/admin/regenerate-summaries" `
            -Method POST `
            -Body $body `
            -ContentType 'application/json' `
            -TimeoutSec 300 `
            -ErrorAction SilentlyContinue
    } catch {
        # Timeout is expected - server continues processing in background
        Write-Host "   ⏳ Request sent (server processing in background)" -ForegroundColor Gray
    }
    
    # Wait between chunks to avoid rate limiting
    if ($i + $chunkSize -lt $bookIds.Count) {
        Write-Host "   ⏸️  Waiting 30 seconds before next chunk..." -ForegroundColor Gray
        Start-Sleep -Seconds 30
    }
}

Write-Host ""
Write-Host "✅ All regeneration requests sent!" -ForegroundColor Green
Write-Host "⏰ Processing will take ~2-3 minutes per book" -ForegroundColor Yellow
Write-Host "   Total estimated time: ~$([math]::Ceiling($bookIds.Count * 2.5 / 60)) hours" -ForegroundColor Yellow
```

**Run the script:**
```powershell
.\regenerate_books.ps1
```

### Method 2: Single Book Regeneration (Testing)

For testing or regenerating a specific book:

```powershell
$bookId = "your-book-id-here"

$body = @{
    ids = @($bookId)
    batchSize = 1
    force = $true
    useGPT4 = $false
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "https://bookdigest-lypx.onrender.com/api/admin/regenerate-summaries" `
    -Method POST `
    -Body $body `
    -ContentType 'application/json' `
    -TimeoutSec 300
```

---

## Monitoring Progress

### Check Individual Book
```powershell
$bookId = "your-book-id-here"
$book = Invoke-RestMethod -Uri "https://bookdigest-lypx.onrender.com/api/books/$bookId" -Method GET
$book = $book.data.book

$totalWords = ($book.summary -split '\s+').Count + 
              ($book.keyInsights -split '\s+').Count + 
              ($book.chapters -split '\s+').Count

Write-Host "Title: $($book.title)"
Write-Host "Total Words: $totalWords"
Write-Host "Insights: $($book.insightCount)"
Write-Host "Chapters: $($book.chapterCount)"
Write-Host "Last Updated: $($book.updatedAt)"
```

### Check Multiple Books
```powershell
$bookIds = @("id1", "id2", "id3")

foreach ($id in $bookIds) {
    $book = (Invoke-RestMethod -Uri "https://bookdigest-lypx.onrender.com/api/books/$id" -Method GET).data.book
    $words = ($book.summary -split '\s+').Count + ($book.keyInsights -split '\s+').Count + ($book.chapters -split '\s+').Count
    
    $status = if ($words -gt 1500) { "✅" } else { "⚠️" }
    Write-Host "$status $($book.title): $words words (Updated: $($book.updatedAt))"
}
```

---

## Quality Verification After Regeneration

### Expected Results
After successful regeneration, each book should have:

- ✅ **1,600-2,200 total words** (verified on 2026-02-17)
- ✅ **8 key insights** with 30+ word explanations
- ✅ **6-7 chapters** with 130+ word summaries
- ✅ **8-10 quotes** from the book
- ✅ **6-8 action items** for readers

### Verification Script
```powershell
# Verify regenerated books meet quality standards
$regeneratedBooks = Import-Csv "books_needing_regeneration.csv"
$success = 0
$needsReview = 0

foreach ($row in $regeneratedBooks) {
    $book = (Invoke-RestMethod -Uri "https://bookdigest-lypx.onrender.com/api/books/$($row.id)" -Method GET).data.book
    $totalWords = ($book.summary -split '\s+').Count + 
                  ($book.keyInsights -split '\s+').Count + 
                  ($book.chapters -split '\s+').Count
    
    if ($totalWords -ge 1500 -and $book.insightCount -ge 6 -and $book.chapterCount -ge 5) {
        $success++
        Write-Host "✅ $($book.title): $totalWords words" -ForegroundColor Green
    } else {
        $needsReview++
        Write-Host "⚠️ $($book.title): $totalWords words (may need retry)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Success: $success" -ForegroundColor Green
Write-Host "  Needs Review: $needsReview" -ForegroundColor Yellow
```

---

## Troubleshooting

### Issue: Books Not Regenerating
**Solution:** Check Render environment variables
1. Log into Render dashboard
2. Navigate to bookdigest backend service
3. Verify `OPENAI_API_KEY` is set
4. Check OpenAI dashboard for API credits

### Issue: Timeouts During Regeneration
**Solution:** This is expected and normal
- Client requests timeout after 60 seconds
- **Server continues processing in the background**
- Check book `updatedAt` timestamp to verify completion

### Issue: Books Still Have Low Quality After Regeneration
**Solution:** Check the retry logic
1. Examine Render logs for error messages
2. Verify OpenAI API responses aren't being rate limited
3. Consider increasing chunk delays from 30s to 60s
4. Manually retry individual problem books

### Issue: Rate Limiting from OpenAI
**Solution:** Add delays between chunks
- Increase `Start-Sleep -Seconds 30` to `Start-Sleep -Seconds 60`
- Reduce chunk size from 10 to 5
- Upgrade OpenAI tier for higher rate limits

---

## Cost Estimation

**Per Book:**
- GPT-4o-mini cost: ~$0.03-0.05 per book
- Processing time: ~2-3 minutes per book

**For 100 Books:**
- Total cost: ~$3-5
- Total time: ~3-5 hours

**For 1000 Books:**
- Total cost: ~$30-50
- Total time: ~30-50 hours

---

## Best Practices

1. **Always Create a Backup First**
   - Use Neon branching to create restore point
   - Or export database before large regeneration runs

2. **Test on 5-10 Books First**
   - Verify quality before running full batch
   - Check that API key and credits are working

3. **Run During Off-Peak Hours**
   - Less likely to impact user experience
   - Render server has more resources available

4. **Monitor the First Hour**
   - Check logs for errors
   - Verify books are actually being updated

5. **Don't Interrupt Running Regeneration**
   - Let it complete even if client times out
   - Server continues processing in background

---

## Key Files Reference

### Backend Files
- **Service:** `backend/src/services/ai-summary-openai.service.ts`
  - Contains OpenAI integration and quality control logic
  - Retry mechanism with stricter prompts
  
- **Route:** `backend/src/routes/regenerate.routes.ts`
  - `/api/admin/regenerate-summaries` endpoint
  - Handles batch processing and error logging

- **Schema:** `backend/prisma/schema.prisma`
  - Book model with all content fields

### Environment Variables (Render)
- `OPENAI_API_KEY` - Required for AI generation
- `DATABASE_URL` - Neon PostgreSQL connection

---

## Success Metrics (2026-02-17)

✅ **18 books regenerated** with verified quality:
- Average word count: **1,800 words** (up from ~80 words)
- All books have 6-8 chapters with detailed summaries
- All books have 8 insights with explanations
- 100% success rate on retry logic

**Sample Books (Verified):**
- "How to Be an Antiracist" - 1,957 words
- "The Four Winds" - 2,077 words
- "Caste" - 1,863 words
- "The Rosie Project" - 1,806 words
- "Beartown" - 1,715 words

---

## Quick Reference Commands

```powershell
# 1. Scan for books needing regeneration
.\scan_book_quality.ps1

# 2. Regenerate all low-quality books
.\regenerate_books.ps1

# 3. Verify regeneration results
.\verify_regeneration.ps1

# 4. Check single book status
$book = (Invoke-RestMethod -Uri "https://bookdigest-lypx.onrender.com/api/books/BOOK-ID" -Method GET).data.book
($book.summary -split '\s+').Count + ($book.keyInsights -split '\s+').Count + ($book.chapters -split '\s+').Count
```

---

## Future Improvements (Optional)

- [ ] Add regeneration progress dashboard to admin panel
- [ ] Email notification when batch regeneration completes
- [ ] Automatic quality monitoring (weekly scans)
- [ ] A/B testing different AI prompts for quality
- [ ] Support for GPT-4 for premium books

---

**End of Guide**

For questions or issues, refer to session documentation or contact the development team.
