# 🔧 Render Environment Variable Setup

**Issue:** Analytics API returns 401 Unauthorized  
**Cause:** Missing `ADMIN_SECRET_KEY` on Render backend  
**Solution:** Add environment variable to Render

---

## 🚀 Quick Fix (3 minutes)

### Step 1: Go to Render Dashboard

1. **Visit:** https://dashboard.render.com
2. **Sign in** with your account
3. Find your **bookdigest-backend** service (or similar name)
4. Click on it

### Step 2: Add Environment Variable

1. Click **"Environment"** in the left sidebar
2. Scroll to **"Environment Variables"** section
3. Click **"Add Environment Variable"**

**Add this variable:**
- **Key:** `ADMIN_SECRET_KEY`
- **Value:** `bookdigest-secure-admin-2026-key`

4. Click **"Save Changes"**

### Step 3: Wait for Redeploy

Render will automatically redeploy your backend when you add an environment variable.

**Wait:** 3-5 minutes for the backend to redeploy

---

## ✅ After Redeployment

**Test the analytics again:**
- Visit: https://book-digest.com/admin/analytics
- Should now load with data! ✅

---

## 📝 All Environment Variables on Render

Make sure these are all set:

| Variable | Value | Status |
|----------|-------|--------|
| `DATABASE_URL` | Your PostgreSQL URL | ✅ Should exist |
| `JWT_SECRET` | Your JWT secret | ✅ Should exist |
| `ADMIN_SECRET_KEY` | `bookdigest-secure-admin-2026-key` | ❌ Add this! |
| `GEMINI_API_KEY` | Your Gemini key | ✅ Should exist |

---

## 🐛 Verification

After adding the env var and redeployment:

1. **Test the API directly:**
   ```
   https://bookdigest-lypx.onrender.com/api/admin-panel/analytics?period=30
   ```
   With header: `x-admin-key: bookdigest-secure-admin-2026-key`

2. **Should return:** JSON with analytics data (not 401)

3. **Then test dashboard:** https://book-digest.com/admin/analytics

---

**Once you add the ADMIN_SECRET_KEY to Render, everything will work! 🚀**
