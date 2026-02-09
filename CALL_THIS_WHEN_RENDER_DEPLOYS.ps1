# Run this PowerShell script when Render finishes deploying
# It will update all 18 book covers in the database

Write-Output "`n🚀 Updating all 18 AI-generated book covers...`n"

try {
    $response = Invoke-WebRequest -Uri "https://bookdigest-lypx.onrender.com/api/admin-simple/update-covers" -Method POST -UseBasicParsing -TimeoutSec 60
    
    Write-Output "✅ SUCCESS! All covers updated!`n"
    Write-Output "Status: $($response.StatusCode)`n"
    Write-Output "Response:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
    
    Write-Output "`n`n🎨 Check your site now!"
    Write-Output "Visit: https://bookdigest-iota.vercel.app"
    Write-Output "Search for: Surge, Purple Cow, Clockwork"
    Write-Output "You should see beautiful AI-generated covers! 🎉`n"
    
} catch {
    Write-Output "❌ Error: $($_.Exception.Message)`n"
    
    if ($_.Exception.Response.StatusCode.Value__ -eq 404) {
        Write-Output "⚠️  Endpoint not found (404)"
        Write-Output "Render hasn't deployed yet. Please:"
        Write-Output "1. Check Render dashboard for deployment status"
        Write-Output "2. Wait for 'Deploy succeeded' message"
        Write-Output "3. Run this script again`n"
    } else {
        Write-Output "Status Code: $($_.Exception.Response.StatusCode.Value__)"
    }
}
