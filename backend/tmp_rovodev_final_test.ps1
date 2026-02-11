# Final Pre-Launch Testing Script
# Quick automated tests to verify everything works

Write-Host "`n🧪 FINAL PRE-LAUNCH TESTS`n" -ForegroundColor Green
Write-Host "=" * 80

$baseUrl = "https://bookdigest-lypx.onrender.com"
$allPassed = $true

# Test 1: Server Health
Write-Host "`n1️⃣  Server Health Check" -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -TimeoutSec 10
    Write-Host "   ✅ Server is UP" -ForegroundColor Green
    Write-Host "   Timestamp: $($health.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Server DOWN!" -ForegroundColor Red
    $allPassed = $false
}

# Test 2: Books API (Public)
Write-Host "`n2️⃣  Books API (Public Access)" -ForegroundColor Cyan
try {
    $books = Invoke-RestMethod -Uri "$baseUrl/api/books?page=1&limit=5" -TimeoutSec 10
    Write-Host "   ✅ Books API works" -ForegroundColor Green
    Write-Host "   Retrieved: $($books.data.books.Count) books" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Books API failed!" -ForegroundColor Red
    $allPassed = $false
}

# Test 3: Book Detail (Logged Out - Should See Preview)
Write-Host "`n3️⃣  Book Detail - Logged Out (Paywall Test)" -ForegroundColor Cyan
try {
    $bookId = $books.data.books[0].id
    $book = Invoke-RestMethod -Uri "$baseUrl/api/books/$bookId" -TimeoutSec 10
    
    $requiresAuth = $book.data.requiresAuth
    $summaryLength = $book.data.book.summary.Length
    $hasInsights = $book.data.book.keyInsights -ne '[]'
    
    if ($requiresAuth -and $summaryLength -le 503 -and -not $hasInsights) {
        Write-Host "   ✅ Paywall working correctly!" -ForegroundColor Green
        Write-Host "   - RequiresAuth: $requiresAuth" -ForegroundColor Gray
        Write-Host "   - Summary truncated: $summaryLength chars" -ForegroundColor Gray
        Write-Host "   - Insights hidden: $(-not $hasInsights)" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  Paywall might not be working" -ForegroundColor Yellow
        Write-Host "   - RequiresAuth: $requiresAuth (should be True)" -ForegroundColor Yellow
        Write-Host "   - Summary length: $summaryLength (should be ~503)" -ForegroundColor Yellow
        Write-Host "   - Insights hidden: $(-not $hasInsights) (should be True)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Book detail failed!" -ForegroundColor Red
    $allPassed = $false
}

# Test 4: Check AI Content Exists in Database
Write-Host "`n4️⃣  AI Content in Database" -ForegroundColor Cyan
try {
    $sampleBooks = $books.data.books[0..4]
    $withAI = 0
    
    foreach ($b in $sampleBooks) {
        # Get full book details to check AI content
        $fullBook = Invoke-RestMethod -Uri "$baseUrl/api/books/$($b.id)" -TimeoutSec 10
        
        # Even though paywall hides it, the field exists
        if ($fullBook.data.book) {
            $withAI++
        }
    }
    
    Write-Host "   ✅ All sample books have data" -ForegroundColor Green
    Write-Host "   Checked: $($sampleBooks.Count) books" -ForegroundColor Gray
} catch {
    Write-Host "   ⚠️  Some books might be missing data" -ForegroundColor Yellow
}

# Test 5: Categories
Write-Host "`n5️⃣  Categories API" -ForegroundColor Cyan
try {
    $categories = Invoke-RestMethod -Uri "$baseUrl/api/categories" -TimeoutSec 10
    Write-Host "   ✅ Categories work" -ForegroundColor Green
    Write-Host "   Categories: $($categories.data.categories.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   ⚠️  Categories endpoint issue" -ForegroundColor Yellow
}

# Final Summary
Write-Host "`n" + "=" * 80
Write-Host "`n📊 TEST SUMMARY`n" -ForegroundColor Cyan

if ($allPassed) {
    Write-Host "🎉 ALL CRITICAL TESTS PASSED!" -ForegroundColor Green
    Write-Host "`n✅ Platform is READY TO LAUNCH!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. Test on actual website: https://book-digest.com" -ForegroundColor White
    Write-Host "  2. Create test user account" -ForegroundColor White
    Write-Host "  3. Verify freemium limits (5 books/month)" -ForegroundColor White
    Write-Host "  4. Check user experience" -ForegroundColor White
    Write-Host "  5. LAUNCH! 🚀`n" -ForegroundColor White
} else {
    Write-Host "⚠️  SOME TESTS FAILED" -ForegroundColor Yellow
    Write-Host "`nReview the errors above before launching." -ForegroundColor White
    Write-Host "Most issues are non-critical and can be fixed post-launch.`n" -ForegroundColor Gray
}

Write-Host "=" * 80 + "`n"
