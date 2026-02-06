# 🆓 FREE TIER DEPLOYMENT GUIDE

## ⚠️ Shell Not Available on Free Tier

No problem! Here are **3 alternative ways** to run the cover update script on Render's free tier.

---

## ✅ OPTION 1: Auto-Run on Startup (RECOMMENDED - Easiest)

This will automatically update covers every time the server restarts.

### Implementation:

**1. Add startup hook to server.ts**

I'll create this file for you - it will run the cover update automatically when the server starts.

**Pros:**
- ✅ Completely automatic
- ✅ No manual work needed
- ✅ Works on free tier
- ✅ Runs on every deployment

**Cons:**
- ⏳ Only runs when server restarts
- Takes ~30 seconds on startup

---

## ✅ OPTION 2: Create an API Endpoint

Create a special admin endpoint you can call from your browser.

### How it works:

1. I'll create `/api/admin/update-covers` endpoint
2. You visit: `https://bookdigest-lypx.onrender.com/api/admin/update-covers`
3. Script runs automatically
4. You see the results in the browser

**Pros:**
- ✅ Run anytime you want
- ✅ See results immediately
- ✅ Can run multiple times
- ✅ Works on free tier

**Cons:**
- ⚠️ Needs to be secured (we'll add a secret key)

---

## ✅ OPTION 3: Use the SQL File Directly

Use the Render database console (available on free tier).

### Steps:

1. Go to Render dashboard
2. Click on your PostgreSQL database (not the service)
3. Click "Connect" → "External Connection"
4. Use any PostgreSQL client OR the web console
5. Run the SQL from: `backend/tmp_rovodev_direct_db_update.sql`

**Pros:**
- ✅ Direct database access
- ✅ Works on free tier
- ✅ Instant results

**Cons:**
- ⏳ Manual copy/paste needed
- 📝 Need to find database separately

---

## 🎯 MY RECOMMENDATION: Option 1 + Option 2

Let me implement **both**:

1. **Auto-run on startup** - Covers update automatically
2. **API endpoint** - You can trigger manually anytime

This gives you:
- ✅ Automatic updates on deployment
- ✅ Manual control when needed
- ✅ Works perfectly on free tier
- ✅ Best of both worlds!

---

## 🚀 SHALL I IMPLEMENT THIS?

I'll add:
1. Startup hook to automatically update covers on server start
2. Admin API endpoint: `/api/admin/update-covers?secret=YOUR_SECRET`
3. Both secured and safe

**This will take 5 minutes and solve the free tier issue completely!**

Ready to proceed? 👍
