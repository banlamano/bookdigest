# Permanent Cover Fix - Download to Supabase Storage

**Problem:** Covers are unreliable because they depend on external OpenLibrary URLs (slow/rate-limited/timeout).

**Solution:** Download all covers once, store in Supabase Storage, serve from your own CDN.

---

## Why This Fixes It Forever

### Current (Broken):
```
User → book-digest.com → tries to load image from openlibrary.org
                       → OpenLibrary is slow/rate-limits
                       → cover fails/hangs/loads randomly
```

### After Fix (Reliable):
```
User → book-digest.com → loads image from Supabase CDN
                       → always fast, always available
                       → no external dependency
```

---

## What You Need

### 1. Supabase Service Role Key

1. Go to: https://supabase.com/dashboard/project/ogrrtkutykmoobtcycfu/settings/api
2. Copy your **service_role** key (not anon key)
3. Keep it secret (don't commit to git)

### 2. Run the Script

```bash
cd backend

# Edit download-and-upload-covers-to-supabase.js
# Replace: const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';
# With your actual service role key

# Install Supabase client
npm install @supabase/supabase-js

# Run the script
node download-and-upload-covers-to-supabase.js
```

---

## What the Script Does

1. **Creates `book-covers` bucket** in Supabase Storage (public)
2. **Downloads each OpenLibrary cover** (with rate limiting)
3. **Uploads to Supabase Storage** as `covers/<isbn>.jpg`
4. **Updates database** `coverImage` to Supabase CDN URL
5. **Result:** All covers now load from `https://ogrrtkutykmoobtcycfu.supabase.co/storage/v1/object/public/book-covers/covers/<isbn>.jpg`

---

## Time & Cost

**Time:** ~10-15 minutes for 454 books (with rate limiting)

**Cost:** 
- Supabase free tier includes **1 GB storage**
- 454 book covers ≈ ~50-100 MB
- **Completely free** for your use case

---

## After Running

### Test One Cover

1. Pick a book that was failing
2. Check its `coverImage` in database
3. Should now be: `https://ogrrtkutykmoobtcycfu.supabase.co/storage/v1/object/public/book-covers/covers/<isbn>.jpg`
4. Open that URL in browser → should load instantly

### Deploy

No code changes needed! The database `coverImage` values are now Supabase URLs, so the frontend automatically loads from there.

Just hard refresh the site: `Ctrl+Shift+R`

---

## Benefits

✅ **Fast:** Supabase CDN is globally distributed  
✅ **Reliable:** No rate limiting, no timeouts  
✅ **Scalable:** Works for 3000+ books easily  
✅ **Free:** Fits in Supabase free tier  
✅ **Future-proof:** When you move to IONOS later, just run script again pointing to IONOS storage

---

## Fallback for Missing Covers

Some books might not have OpenLibrary covers (404). For those:

**Option A:** Leave as-is (they'll show placeholder)  
**Option B:** Generate AI covers for just those books (small script)  
**Option C:** Use a default "Book Digest" branded cover

---

## Next Steps

1. Get your Supabase service role key
2. Edit `download-and-upload-covers-to-supabase.js` with the key
3. Run: `node download-and-upload-covers-to-supabase.js`
4. Wait ~10 minutes
5. Hard refresh production site
6. **Covers will be perfect forever**

---

**Want me to guide you through getting the Supabase key and running the script?**
