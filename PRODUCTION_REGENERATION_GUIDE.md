# 🚀 Production AI Summary Regeneration Guide

## Current Status:
- ✅ Code deployed to GitHub
- ✅ Render is redeploying with new endpoint
- ✅ GEMINI_API_KEY added to Render
- ⏳ Waiting for Render to finish deployment (~2-3 minutes)

---

## How to Regenerate Production Summaries

### Option 1: PowerShell Script (EASIEST) ⭐

**Wait 2-3 minutes for Render to deploy, then run:**

```powershell
cd backend
.\call-production-regenerate.ps1
```

**What it does:**
- Calls the production API endpoint
- Processes all 454 books in batches of 10
- Shows real-time progress
- Handles errors gracefully

**Time:** 3-4 hours (runs on Render servers)

---

### Option 2: Manual API Call

**Using PowerShell:**

```powershell
$body = @{
    batchSize = 10
    force = $true
    limit = 454
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "https://bookdigest-lypx.onrender.com/api/admin/regenerate-summaries" `
    -Method Post `
    -Body $body `
    -ContentType "application/json" `
    -TimeoutSec 14400
```

**Using curl:**

```bash
curl -X POST https://bookdigest-lypx.onrender.com/api/admin/regenerate-summaries \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 10, "force": true, "limit": 454}'
```

---

### Option 3: Process in Smaller Batches

To avoid timeouts, process in chunks:

```powershell
# Process first 50 books
$body = @{batchSize = 10; force = $true; limit = 50} | ConvertTo-Json
Invoke-RestMethod -Uri "https://bookdigest-lypx.onrender.com/api/admin/regenerate-summaries" -Method Post -Body $body -ContentType "application/json"

# Check results, then process next 50
$body = @{batchSize = 10; force = $false; limit = 100} | ConvertTo-Json
Invoke-RestMethod -Uri "https://bookdigest-lypx.onrender.com/api/admin/regenerate-summaries" -Method Post -Body $body -ContentType "application/json"

# Repeat until all books done
```

---

## Parameters

### batchSize (default: 10)
- Number of books to process at once
- Lower = safer but slower
- Higher = faster but may hit rate limits
- **Recommended:** 10

### force (default: false)
- `true`: Regenerate all books
- `false`: Only books with poor summaries
- **For first run:** Use `true`

### limit (optional)
- Maximum number of books to process
- `undefined`: Process all
- **For full regeneration:** 454

---

## Monitoring Progress

### Check Render Logs:
1. Go to: https://dashboard.render.com
2. Click your backend service
3. Click "Logs" tab
4. Watch for:
   - "Processing: [Book Title]"
   - "✅ Success: [Book Title]"
   - Progress indicators

### Check Production Database:
Visit API to see updated summaries:
```
https://bookdigest-lypx.onrender.com/api/books/1
```

---

## Expected Output

```json
{
  "status": "success",
  "message": "Summary regeneration completed",
  "stats": {
    "total": 454,
    "processed": 454,
    "success": 430,
    "failed": 24
  }
}
```

---

## Troubleshooting

### Request Times Out:
- **Normal!** Long operations may timeout
- Check Render logs to see if it's still running
- Process will continue even if HTTP request times out

### "Server has closed the connection":
- Wait for Render to finish deploying
- Check GEMINI_API_KEY is set in Render
- Verify endpoint exists: `GET /health`

### High Failure Rate:
- Check Gemini API quota (1,500/day)
- If quota hit, wait 24 hours or get new key
- Fallback templates still provide good quality

### Endpoint Not Found (404):
- Render still deploying (wait 2-3 minutes)
- Clear cache: `Ctrl+Shift+R`
- Check deployment logs in Render

---

## After Regeneration

### Verify Results:

1. **Check a few books:**
   ```
   https://bookdigest-lypx.onrender.com/api/books?page=1&limit=5
   ```

2. **Visit frontend:**
   ```
   https://bookdigest-iota.vercel.app
   ```

3. **Test book detail pages:**
   - Click any book
   - Verify AI-generated summary
   - Check insights, quotes, actions

### Expected Quality:
- ✅ Summaries: 600-1,200 characters
- ✅ AI-generated: 75-80% of books
- ✅ Fallback templates: 20-25%
- ✅ All books updated: 100%

---

## Timeline

**Now:** 
- Code deployed
- Render redeploying (~2-3 minutes)

**In 3 minutes:**
- Run PowerShell script
- Start regeneration

**In 3-4 hours:**
- All 454 books updated
- Production has AI summaries
- Users see professional content!

---

## 🎯 RECOMMENDED STEPS

1. **Wait 3 minutes** for Render to redeploy
2. **Run:** `.\call-production-regenerate.ps1`
3. **Monitor** Render logs
4. **Verify** results after completion
5. **Celebrate!** 🎉

---

**Ready? Wait 2-3 minutes, then run the script!** 🚀
