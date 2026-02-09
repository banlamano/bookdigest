# Test if AI covers are working on the site

Write-Output ""
Write-Output "🧪 Testing AI Covers..."
Write-Output ""

# Test 1: Check if cover file is accessible
Write-Output "Test 1: Checking if cover files are deployed..."
try {
    $response = Invoke-WebRequest -Uri "https://bookdigest-iota.vercel.app/ai-covers/cdd862b4-6956-4430-bf1f-f25df8bab67d.svg" -UseBasicParsing
    Write-Output "✅ PASS - Surge cover file is accessible!"
    Write-Output "   Status: $($response.StatusCode)"
    Write-Output ""
} catch {
    Write-Output "❌ FAIL - Cover file not accessible yet"
    Write-Output "   Vercel still deploying. Wait 1-2 minutes and try again."
    Write-Output ""
    exit
}

# Test 2: Check another cover
Write-Output "Test 2: Checking Purple Cow cover..."
try {
    $response = Invoke-WebRequest -Uri "https://bookdigest-iota.vercel.app/ai-covers/dd516700-ffc8-4724-aadc-db44b8b0c967.svg" -UseBasicParsing
    Write-Output "✅ PASS - Purple Cow cover accessible!"
    Write-Output ""
} catch {
    Write-Output "❌ FAIL - Purple Cow cover not found"
    Write-Output ""
}

Write-Output "=" * 60
Write-Output ""
Write-Output "🎨 READY TO TEST ON SITE!"
Write-Output ""
Write-Output "Visit: https://bookdigest-iota.vercel.app"
Write-Output ""
Write-Output "Search for these books to see AI covers:"
Write-Output "  - Surge (blue business gradient)"
Write-Output "  - Purple Cow (purple marketing gradient)"
Write-Output "  - Clockwork (blue business gradient)"
Write-Output "  - The Little Book of Hygge (purple self-help gradient)"
Write-Output ""
Write-Output "All 18 books should now show beautiful AI-generated covers!"
Write-Output ""
Write-Output "=" * 60
