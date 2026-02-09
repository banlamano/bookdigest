# Run this to find the actual book IDs in production database

Write-Output ""
Write-Output "🔍 Searching for books in production database..."
Write-Output ""

try {
    $response = Invoke-WebRequest -Uri "https://bookdigest-lypx.onrender.com/api/admin-simple/find-books" -UseBasicParsing
    
    Write-Output "✅ SUCCESS!"
    Write-Output ""
    Write-Output "Found books in production:"
    Write-Output ""
    
    $data = $response.Content | ConvertFrom-Json
    $data | ConvertTo-Json -Depth 5
    
    Write-Output ""
    Write-Output ""
    Write-Output "ℹ️  Save this output - we'll use these IDs to update covers!"
}
catch {
    Write-Output "❌ Error: $($_.Exception.Message)"
    Write-Output ""
    
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode.Value__ -eq 404) {
        Write-Output "⚠️  Endpoint not found yet"
        Write-Output "Wait for Render to deploy and try again."
        Write-Output ""
    }
}
