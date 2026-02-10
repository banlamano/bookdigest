# 🔧 Vercel Environment Variables Setup

**Issue:** Analytics page shows 404 because environment variable is missing  
**Solution:** Add `NEXT_PUBLIC_ADMIN_SECRET_KEY` to Vercel

---

## 🚀 Quick Fix (5 minutes)

### Step 1: Go to Vercel Dashboard

1. **Visit:** https://vercel.com/dashboard
2. **Sign in** with your account
3. Find your **book-digest** project
4. Click on it

### Step 2: Add Environment Variable

1. Click **"Settings"** tab (top navigation)
2. Click **"Environment Variables"** in the left sidebar
3. Click **"Add New"** button

**Add this variable:**
- **Key:** `NEXT_PUBLIC_ADMIN_SECRET_KEY`
- **Value:** `bookdigest-secure-admin-2026-key`
- **Environments:** Select all (Production, Preview, Development)

4. Click **"Save"**

### Step 3: Redeploy

After adding the environment variable:

1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click the **three dots menu** (•••)
4. Click **"Redeploy"**
5. Confirm **"Redeploy"**

**Wait 2-3 minutes** for the new deployment to complete.

---

## ✅ After Redeployment

**Try accessing again:**
- https://book-digest.com/admin/analytics

**You should now see:**
✅ Analytics dashboard loads  
✅ Metrics display  
✅ Charts render  
✅ No 404 error  

---

## 🔧 Alternative: Test Locally First

If you want to test before deploying to production:

1. **Start local servers:**
   ```bash
   cd backend
   npm run dev
   ```
   
   ```bash
   cd frontend
   npm run dev
   ```

2. **Visit:** http://localhost:3000/admin/analytics

3. **Expected:** Dashboard works locally ✅

---

## 📝 All Environment Variables Needed

For complete functionality, add these to Vercel:

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_API_URL` | `https://bookdigest-lypx.onrender.com` | Backend API |
| `NEXT_PUBLIC_APP_URL` | `https://book-digest.com` | Your domain |
| `NEXT_PUBLIC_ADMIN_SECRET_KEY` | `bookdigest-secure-admin-2026-key` | Admin access |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | (Optional) Your GA4 ID | Google Analytics |

---

## 🐛 Troubleshooting

### Still getting 404 after redeploy?
- Clear browser cache (Ctrl+Shift+R)
- Wait another 2 minutes
- Check Vercel deployment logs for errors

### Environment variable not working?
- Make sure you selected all environments
- Verify spelling is exact
- Redeploy after adding variables

### Other errors?
- Check browser console (F12)
- Look for specific error messages
- Let me know what you see!

---

**Once you add the environment variable and redeploy, the analytics page will work! 🚀**
