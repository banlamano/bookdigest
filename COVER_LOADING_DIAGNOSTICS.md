# Book Cover Loading Diagnostics
**Date:** March 1, 2026  
**Issue:** Covers not loading properly on localhost/production

---

## How to Test Covers on Localhost

### Step 1: Check if Localhost is Running
Open your browser and go to:
- **Homepage:** http://localhost:3000
- **Cover Test Page:** http://localhost:3000/cover-test.html

### Step 2: What to Look For

**On the Homepage:**
- You should see a grid of books
- Each book should have a cover image
- If you see gray boxes or "Cover unavailable", there's an issue

**On the Cover Test Page:**
You should see 3 sections:
1. **OpenLibrary Covers** - External images (may be slow)
2. **AI Covers** - Local SVG files (fast)
3. **Placeholder** - Fallback SVG (always works)

Each should show "✅ Loaded" underneath if working correctly.

---

## Cover Loading System (How It Works)

### The Fallback Chain:

```
1. OpenLibrary URL (external)
   ↓ (if fails)
2. Retry with cache bypass
   ↓ (if fails)
3. Local AI Cover (/ai-covers/{bookId}.svg)
   ↓ (if fails)
4. Placeholder (/placeholder-book.svg)
```

### Current Cover Sources:

**Books in Database:**
- Most use OpenLibrary: `https://covers.openlibrary.org/b/isbn/{ISBN}-L.jpg`
- Some use Google Books: `https://books.google.com/...`

**Local AI Covers Available:**
- Location: `frontend/public/ai-covers/`
- Count: 18 SVG files
- Named by book ID (e.g., `006d6f26-2829-4f8c-aaa0-e66ad69de651.svg`)

**Placeholder:**
- Location: `frontend/public/placeholder-book.svg`
- Always available as final fallback

---

## Common Issues & Solutions

### Issue 1: All Covers Show Placeholder
**Symptom:** Every book shows "Cover unavailable"  
**Cause:** OpenLibrary is blocked or CORS issue  
**Solution:** 
1. Check browser console (F12) for errors
2. If CORS error, covers need to be downloaded locally
3. Use AI covers instead of external URLs

### Issue 2: Covers Load Slowly
**Symptom:** Gray boxes for 5-10 seconds, then covers appear  
**Cause:** OpenLibrary server is slow or rate-limiting  
**Solution:**
1. Pre-download covers to local storage
2. Use AI-generated covers instead
3. Implement better caching

### Issue 3: Some Covers Load, Others Don't
**Symptom:** Mixed results - some books have covers, others don't  
**Cause:** Some ISBNs don't exist in OpenLibrary database  
**Solution:**
1. Check which books have AI covers available
2. Update database to use AI covers for those books
3. Generate AI covers for remaining books

### Issue 4: Covers Work on Localhost, Not Production
**Symptom:** Local dev works, production doesn't  
**Cause:** Production backend not responding or CORS issue  
**Solution:**
1. Check production backend status (Render.com dashboard)
2. Wake up backend if sleeping (free tier cold start)
3. Verify NEXT_PUBLIC_API_URL in production env

---

## Testing Commands

### Test OpenLibrary Directly
Open in browser:
```
https://covers.openlibrary.org/b/isbn/9780399562488-L.jpg
```
Should show a book cover image.

### Test Local AI Cover
Open in browser (while localhost running):
```
http://localhost:3000/ai-covers/006d6f26-2829-4f8c-aaa0-e66ad69de651.svg
```
Should show an AI-generated book cover.

### Test Placeholder
Open in browser (while localhost running):
```
http://localhost:3000/placeholder-book.svg
```
Should show a generic book placeholder.

---

## Browser Console Debugging

### Open Browser Console (F12)
Look for errors like:

**CORS Error:**
```
Access to image at 'https://covers.openlibrary.org/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```
**Solution:** OpenLibrary should allow CORS, but if not, switch to local covers

**404 Not Found:**
```
GET http://localhost:3000/ai-covers/some-id.svg 404 (Not Found)
```
**Solution:** That book doesn't have an AI cover, will fallback to placeholder

**Network Timeout:**
```
GET https://covers.openlibrary.org/... net::ERR_TIMED_OUT
```
**Solution:** OpenLibrary is slow or down, use local covers

---

## Production Issues

### Production Backend Status

**Backend URL:** https://bookdigest-lypx.onrender.com  
**Status:** May be sleeping (Render.com free tier)

### How to Wake Up Production Backend

1. Visit: https://bookdigest-lypx.onrender.com/api/books
2. Wait 30-60 seconds for cold start
3. Page should load with book data

### If Backend Won't Wake Up

1. Go to https://dashboard.render.com/
2. Find "bookdigest" service
3. Check logs for errors
4. Restart service if needed

---

## Quick Fixes

### Option 1: Use AI Covers for All Books
**Best for:** Consistent look, fast loading, no external dependencies

**Steps:**
1. Generate AI covers for all 454 books
2. Update database coverImage to point to `/ai-covers/{id}.svg`
3. No more external API calls

### Option 2: Download OpenLibrary Covers
**Best for:** Real book covers, works offline

**Steps:**
1. Download all covers from OpenLibrary
2. Save to `frontend/public/covers/`
3. Update database coverImage to `/covers/{isbn}.jpg`

### Option 3: Keep Current System, Add Monitoring
**Best for:** If external covers are working fine

**Steps:**
1. Add error tracking to OptimizedBookCover component
2. Monitor which covers fail most often
3. Generate AI covers for those specific books

---

## Files to Check

### Frontend Cover Component
```
frontend/src/components/books/OptimizedBookCover.tsx
```
- Handles fallback logic
- Retries on failure
- Switches to AI cover or placeholder

### AI Covers Directory
```
frontend/public/ai-covers/
```
- 18 SVG files currently
- Named by book ID
- Can add more as needed

### Cover Test Page
```
frontend/public/cover-test.html
```
- Tests all 3 cover types
- Shows which are loading
- Diagnostic tool

---

## Next Steps

1. **Check localhost in browser** - Are covers showing?
2. **Open cover-test.html** - Which types work?
3. **Check browser console** - Any errors?
4. **Report back** - Tell me what you see

Then we can fix the specific issue.

---

## Expected Behavior

**Localhost should show:**
- ✅ Homepage loads in < 2 seconds
- ✅ Book grid with covers visible
- ✅ Covers load within 5 seconds
- ✅ No CORS errors in console
- ✅ Fallback to placeholder if cover unavailable

**Production should show:**
- ✅ Same as localhost
- ✅ Backend responds (after cold start)
- ✅ All pages functional
- ✅ Covers load from CDN or local

---

**Current Status:**
- Localhost: ✅ Running on ports 3000 (frontend) and 5000 (backend)
- Production: ⚠️ Backend may be sleeping, needs testing
- Covers: ⚠️ Need user confirmation of what they see in browser
