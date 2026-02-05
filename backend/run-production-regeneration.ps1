# PowerShell script to regenerate AI summaries on production database
# Runs locally but updates production - most reliable method!

Write-Host "`n🚀 PRODUCTION AI SUMMARY REGENERATION`n" -ForegroundColor Green
Write-Host "=" -NoNewline
Write-Host ("=" * 79)
Write-Host "`n"

Write-Host "This will:" -ForegroundColor Cyan
Write-Host "  • Run on YOUR machine (no timeouts)" -ForegroundColor White
Write-Host "  • Connect to PRODUCTION database" -ForegroundColor White
Write-Host "  • Update all 454 books with AI summaries" -ForegroundColor White
Write-Host "  • Take approximately 3-4 hours" -ForegroundColor White
Write-Host "  • You can monitor in real-time" -ForegroundColor White
Write-Host "`n"

Write-Host "⚠️  IMPORTANT:" -ForegroundColor Yellow
Write-Host "  • Keep this window open" -ForegroundColor White
Write-Host "  • Don't close your computer" -ForegroundColor White
Write-Host "  • Can run overnight" -ForegroundColor White
Write-Host "  • Press Ctrl+C to stop anytime" -ForegroundColor White
Write-Host "`n"

$response = Read-Host "Ready to start? (yes/no)"

if ($response -ne "yes") {
    Write-Host "`nCancelled. Run this script again when ready.`n" -ForegroundColor Yellow
    exit
}

Write-Host "`n🔧 Setting up environment...`n" -ForegroundColor Cyan

# Set production database URL
$env:DATABASE_URL = "postgresql://bookdigest_db_user:ORU4MsmTBBtSUAuZiDY01iMoIL7qrxC2@dpg-cu6i3g1u0jms73dudcfg-a.frankfurt-postgres.render.com/bookdigest_db?sslmode=require"

# Set Gemini API key
$env:GEMINI_API_KEY = "AIzaSyBHz9_UrFxS89_5BknKc60FWXEAuzFILGY"

Write-Host "✅ Environment configured" -ForegroundColor Green
Write-Host "   Database: Production (PostgreSQL)" -ForegroundColor White
Write-Host "   API: Google Gemini 2.5 Flash" -ForegroundColor White
Write-Host "`n"

Write-Host "🚀 Starting regeneration...`n" -ForegroundColor Green
Write-Host "=" -NoNewline
Write-Host ("=" * 79)
Write-Host "`n"

# Run the regeneration script
npm run regenerate:summaries -- --force --batch-size=5 --delay=3000

Write-Host "`n"
Write-Host "=" -NoNewline
Write-Host ("=" * 79)
Write-Host "`n✅ Regeneration complete!`n" -ForegroundColor Green

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Check production: https://bookdigest-iota.vercel.app" -ForegroundColor White
Write-Host "  2. View a few books to see AI summaries" -ForegroundColor White
Write-Host "  3. Celebrate! 🎉" -ForegroundColor White
Write-Host "`n"

Read-Host "Press Enter to exit"
