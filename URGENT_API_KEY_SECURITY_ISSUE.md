# 🚨 URGENT: API Key Security Issue

## What Happened

Your **Gemini API key was leaked** and has been revoked by Google for security reasons.

```
Error: [403 Forbidden] Your API key was reported as leaked. 
Please use another API key.
```

## How It Happened

The API key was likely:
1. Committed to GitHub in `.env` or `.env.dev` files
2. Pushed to a public repository
3. Detected by GitHub's secret scanning
4. Automatically reported to Google
5. Revoked by Google for security

## Immediate Actions Taken

✅ **Stopped the regeneration process** to prevent further API errors
✅ **Enabled audio feature** for all books (doesn't require Gemini API)
✅ **Created this security guide** for you

## What You Need to Do RIGHT NOW

### 1. Get a New Gemini API Key

1. Go to: https://aistudio.google.com/apikey
2. **Delete the old leaked key** (if still visible)
3. Create a **new API key**
4. **IMPORTANT**: Keep it secret this time!

### 2. Secure Your API Keys

**Add to `.gitignore`:**
```gitignore
.env
.env.dev
.env.local
.env.production
.env.*.local
```

**Check if already committed:**
```powershell
git log --all --full-history -- "**/env*"
```

**If found in history, you MUST:**
- Rotate ALL API keys (Gemini, Stripe, AWS, etc.)
- Use `git filter-branch` or BFG Repo-Cleaner to remove from history
- Or create a fresh repository

### 3. Update Environment Variables Safely

**For Development (Local):**
```powershell
cd backend
# Edit .env.dev (make sure it's in .gitignore)
notepad .env.dev
```

Add:
```env
GEMINI_API_KEY=your_new_secure_key_here
```

**For Production (Render):**
1. Go to Render dashboard
2. Navigate to your backend service
3. Environment → Add environment variable
4. Key: `GEMINI_API_KEY`
5. Value: `your_new_secure_key_here`
6. Save and redeploy

### 4. Verify `.gitignore`

```powershell
cd backend
cat .gitignore | Select-String "\.env"
```

Should show:
```
.env
.env.dev
.env.local
.env.production
```

If not, add them:
```powershell
cd backend
echo ".env" >> .gitignore
echo ".env.dev" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
git add .gitignore
git commit -m "Add .env files to gitignore"
git push
```

## Current Status

### ✅ Working Features:
- **Audio feature is NOW enabled** for all 454 books
- Uses browser Web Speech API (no external service needed)
- Premium users can listen immediately
- No API key required for audio

### ⏸️ On Hold (waiting for new API key):
- AI-powered summary regeneration (for enhanced insights/chapters)
- Currently 31 books have full AI summaries
- 423 books have basic summaries only

## After You Get New API Key

Once you have a secure new key:

1. **Update `.env.dev` locally:**
   ```env
   GEMINI_API_KEY=your_new_key_here
   ```

2. **Update Render production:**
   - Dashboard → Backend Service → Environment
   - Add/update `GEMINI_API_KEY`

3. **Run regeneration again:**
   ```powershell
   cd backend
   npm run regenerate:summaries -- --force --batch-size=10
   ```

## Security Best Practices Going Forward

### ✅ DO:
- Keep API keys in `.env` files that are gitignored
- Use environment variables for all secrets
- Use different keys for dev/staging/production
- Rotate keys regularly
- Use secret management tools (GitHub Secrets, Render Environment Variables)

### ❌ DON'T:
- Commit `.env` files to Git
- Share API keys in code or documentation
- Use the same key across multiple environments
- Hardcode secrets in source code
- Push secrets to public repositories

## Quick Reference: Your API Keys

You should have these keys configured:

| Service | Environment Variable | Where to Get |
|---------|---------------------|--------------|
| Gemini AI | `GEMINI_API_KEY` | https://aistudio.google.com/apikey |
| Stripe (Test) | `STRIPE_SECRET_KEY` | https://dashboard.stripe.com/test/apikeys |
| Stripe (Live) | `STRIPE_SECRET_KEY` | https://dashboard.stripe.com/apikeys |
| Resend Email | `RESEND_API_KEY` | https://resend.com/api-keys |
| Database | `DATABASE_URL` | Render PostgreSQL dashboard |

**⚠️ ALL of these should be rotated if they were in committed `.env` files!**

## Need Help?

If you're unsure about any of these steps or need help securing your repository, let me know!

---

## TL;DR - Quick Fix

1. **Get new Gemini API key**: https://aistudio.google.com/apikey
2. **Add to `.env.dev`** (make sure it's gitignored)
3. **Add to Render environment variables**
4. **Audio already works** - no action needed there!
