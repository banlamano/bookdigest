# Regenerate All Book Summaries

## Current Situation

- **Some books have full content** (keyInsights, chapters, quotes, actionItems)
- **Some books are missing content** (empty arrays, short summaries)
- You mentioned content "disappeared" - this suggests it was there before

## The Problem

Your **Gemini API key was leaked and revoked**, so regeneration is failing.

## The Solution

### Step 1: Get New Gemini API Key (REQUIRED)

1. Go to: https://aistudio.google.com/apikey
2. Delete the old leaked key (if visible)
3. Create a NEW API key
4. **Copy it immediately**

### Step 2: Add to Backend Environment

**For Production (Render):**
1. Go to: https://dashboard.render.com
2. Click on your backend service
3. Go to "Environment" tab
4. Find `GEMINI_API_KEY` or add new:
   - Key: `GEMINI_API_KEY`
   - Value: `your_new_key_here`
5. Click "Save"
6. Render will auto-redeploy (~3-5 min)

**For Local Testing:**
1. Edit `backend/.env.dev`
2. Update: `GEMINI_API_KEY=your_new_key_here`
3. Make sure `.env.dev` is in `.gitignore`!

### Step 3: Run Regeneration

**Option A: Via Backend Script (Local)**
```powershell
cd backend
npm run regenerate:summaries -- --force --batch-size=10
```

**Option B: Via Render Shell (Production)**
1. Go to Render dashboard → Backend service
2. Click "Shell" tab
3. Run:
```bash
npx tsx src/scripts/regenerate-summaries.ts --force --batch-size=10
```

**Option C: Call API Endpoint**
```powershell
$token = "YOUR_ADMIN_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = @{
    batchSize = 10
    force = $true
    limit = 454  # All books
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://bookdigest-lypx.onrender.com/api/admin/regenerate-summaries" -Method Post -Headers $headers -Body $body -ContentType "application/json"
```

## What This Will Do

For each book, it will generate:
- ✅ Big Idea & Why It Matters (summary)
- ✅ 8-12 Key Insights with explanations
- ✅ 8-12 Chapter Summaries
- ✅ 5-8 Memorable Quotes
- ✅ 7-10 Action Items

## Time & Cost

- **Time**: ~2-3 seconds per book
- **454 books**: ~20-30 minutes total
- **Cost**: FREE (Gemini has generous free tier)
- **Rate limit**: 60 requests/minute (script respects this)

## Monitoring Progress

You'll see output like:
```
Starting summary regeneration...
Processing batch 1/46...
Processing: Emotional Intelligence
✅ Success: Emotional Intelligence
Processing: Atomic Habits
✅ Success: Atomic Habits
...
Summary regeneration completed
Total: 454
Processed: 454
Success: 454
Failed: 0
```

## After Regeneration

All books will have:
- Full detailed summaries
- Rich insights
- Chapter breakdowns
- Memorable quotes
- Actionable takeaways

## If Regeneration Fails

Check:
1. Is the Gemini API key valid?
2. Is it added to Render environment?
3. Did Render redeploy after adding the key?
4. Check Render logs for errors

## Alternative: Database Restore

If you had a backup with full content, you could:
1. Find the backup file (e.g., `dev.db.backup`)
2. Restore from it
3. Export to production

But regeneration is probably easier and gives you fresh content.

---

## Quick Start (TL;DR)

1. **Get new API key**: https://aistudio.google.com/apikey
2. **Add to Render**: Dashboard → Backend → Environment → Add `GEMINI_API_KEY`
3. **Wait for redeploy** (~5 min)
4. **Run regeneration**: Use Option C (API endpoint) above
5. **Wait ~30 min** for all 454 books
6. **Done!** All books will have full content

---

**Once you have the new API key, let me know and I'll help you run the regeneration!**
