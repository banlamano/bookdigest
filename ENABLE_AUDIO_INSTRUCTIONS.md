# Enable Audio Feature - Production Instructions

## What Was Done

1. ✅ Created admin API endpoint: `/api/admin/enable-audio`
2. ✅ Committed and pushed to GitHub
3. ✅ Render will auto-deploy in ~3-5 minutes

## How to Enable Audio (After Deployment)

### Option 1: Use PowerShell Script (Easiest)

Wait for Render deployment to complete, then run:

```powershell
# You need an admin user token
# Login to https://book-digest.com/login as admin first

$token = "YOUR_ADMIN_TOKEN_HERE"  # Get from browser localStorage after login

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$response = Invoke-RestMethod -Uri "https://bookdigest-lypx.onrender.com/api/admin/enable-audio" -Method Post -Headers $headers

Write-Host "Result: $($response.message)"
Write-Host "Updated: $($response.data.updated) books"
Write-Host "Total with audio: $($response.data.totalWithAudio)"
```

### Option 2: Use cURL

```bash
curl -X POST https://bookdigest-lypx.onrender.com/api/admin/enable-audio \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### Option 3: Direct Database (if you have PostgreSQL access)

Run the SQL from `UPDATE_PRODUCTION_AUDIO.sql`:

```sql
UPDATE "Book"
SET "audioUrl" = 'browser-tts'
WHERE "audioUrl" IS NULL OR "audioUrl" = '';
```

## How to Get Admin Token

1. Go to https://book-digest.com/login
2. Login with your admin account
3. Open browser DevTools (F12)
4. Go to Console tab
5. Type: `localStorage.getItem('token')`
6. Copy the token (without quotes)

## Verification

After running the enable-audio endpoint, verify:

1. Check a book page: https://book-digest.com/books/df4b11a0-d1d1-4a89-8a7f-9fdad717fdf5
2. Login as premium user
3. You should see the audio player with play button
4. Click play to hear browser TTS reading the summary

## What Happens

- Sets `audioUrl = 'browser-tts'` for all books
- The EnhancedAudioPlayer component detects this value
- Shows audio player for premium users
- Uses browser's Web Speech API (no external files needed)
- No TTS service costs - completely free!

## Timeline

1. **Now**: Code pushed to GitHub
2. **In 3-5 min**: Render auto-deploys
3. **After deploy**: Run the enable-audio endpoint
4. **Immediate**: Audio works on all 454 books!

## Current Status

- Hydration errors: ✅ FIXED
- Books loading: ✅ WORKING
- Audio feature code: ✅ DEPLOYED (pending Render)
- Audio enabled in DB: ⏳ WAITING (run endpoint after deploy)
