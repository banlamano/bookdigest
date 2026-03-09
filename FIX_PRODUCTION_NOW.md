# Fix Production Website - book-digest.com

**Status:** 
- ✅ Frontend (Vercel): Working
- ❌ Backend (Render.com): DOWN - Database connection error
- ❌ Book covers: Not loading (backend needed for API)

---

## 🔴 **The Problem**

Your production backend on Render.com is failing because:

```
Error: P1001: Can't reach database server at ep-gentle-frost-agzu0oxg-pooler.c-2.eu-central-1.aws.neon.tech:5432
```

**This means:** The Neon PostgreSQL database credentials are invalid or the database doesn't exist.

---

## ✅ **Solution: Fix Render.com Environment Variables**

You need to set the correct database credentials on Render.com.

### Option 1: Use Neon Database (PostgreSQL) - Recommended

**Step 1: Get Neon Database Credentials**

1. Go to: https://neon.tech/ (or https://console.neon.tech/)
2. Sign in to your account
3. Find your "bookdigest" project
4. Copy the connection string (looks like):
   ```
   postgresql://user:password@ep-xxxxx.neon.tech/neondb?sslmode=require
   ```

**Step 2: Update Render.com Environment Variables**

1. Go to: https://dashboard.render.com/
2. Find your "bookdigest-backend" service
3. Click on it → Go to "Environment" tab
4. Set these variables:

```
DATABASE_URL=postgresql://[YOUR_NEON_CONNECTION_STRING]
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GEMINI_API_KEY=AIzaSyBHz9_UrFxS89_5BknKc60FWXEAuzFILGY
ADMIN_SECRET_KEY=bookdigest-secure-admin-2026-key
CORS_ORIGIN=https://book-digest.com
```

**Step 3: Update Schema to PostgreSQL**

Make sure the backend is using PostgreSQL schema for production:

```bash
# In your backend directory
cp prisma/schema-postgresql.prisma prisma/schema.prisma
git add .
git commit -m "Switch to PostgreSQL for production"
git push
```

**Step 4: Deploy to Render**

Render will automatically redeploy when you push to git.

---

### Option 2: Use Railway PostgreSQL Instead

If you don't have Neon, use Railway:

1. Go to: https://railway.app/
2. Create a new PostgreSQL database
3. Copy the connection string
4. Set it as DATABASE_URL on Render.com

---

### Option 3: Quick Fix - Use Render's Built-in PostgreSQL

**Easiest solution:**

1. Go to Render.com dashboard
2. Create a new PostgreSQL database (free tier available)
3. Link it to your backend service
4. Render will automatically set DATABASE_URL

**Steps:**

1. Dashboard → "New +" → "PostgreSQL"
2. Name: "bookdigest-db"
3. Region: Same as your backend
4. Plan: Free tier
5. Create Database
6. Go to your backend service → Environment
7. Add connection: Select the database you just created
8. Render auto-fills DATABASE_URL
9. Save and redeploy

---

## 🚀 **Quick Test: Is Production Backend Alive?**

Try visiting:
```
https://bookdigest-lypx.onrender.com/api/books?limit=1
```

**What you should see:**
- ✅ JSON response with books data
- ⏳ "Service starting..." (wait 60 seconds, try again)
- ❌ Error 500 (database connection issue - follow steps above)

---

## 📝 **After Database is Fixed**

Once the backend can connect to the database:

**1. Initialize Database with Books**

The database will be empty. You need to seed it:

```bash
# Option A: Export from localhost and import to production
cd backend
node export-to-production.js

# Option B: Run seed script on production
# SSH to Render.com console and run:
npx prisma db push
npx prisma db seed
```

**2. Test Production API**

```
https://bookdigest-lypx.onrender.com/api/books
```

Should return 454 books.

**3. Check Frontend**

Visit: https://book-digest.com

Covers should now load!

---

## 🔍 **Checking Render.com Status**

### Current Status Dashboard:

1. Go to: https://dashboard.render.com/
2. Find "bookdigest" (or whatever your service is named)
3. Check:
   - **Status:** Should be "Live" (green)
   - **Latest Deploy:** Should show recent date
   - **Logs:** Click "Logs" to see errors

### Common Log Errors:

**"Can't reach database server"**
→ DATABASE_URL is wrong or database doesn't exist

**"prisma.book.findMany() Error"**
→ Database exists but tables not created (run `prisma db push`)

**"Module not found"**
→ Dependencies not installed (check package.json)

---

## ⚡ **Fastest Path to Fix**

**Do this RIGHT NOW:**

1. **Go to Render.com dashboard:** https://dashboard.render.com/
2. **Find your backend service**
3. **Click "Manual Deploy" → "Deploy latest commit"**
4. **Watch the logs** - it will show the exact error
5. **Take a screenshot** and show me

This will tell us EXACTLY what's broken.

---

## 📸 **What I Need From You**

Please:

1. Go to https://dashboard.render.com/
2. Find your backend service
3. Click on "Logs" tab
4. Copy the last 20 lines of logs
5. Paste them here

OR

1. Try to manually deploy
2. Tell me what error you see

This will tell me exactly how to fix it.

---

## 🎯 **Expected Result**

Once fixed:

- ✅ https://bookdigest-lypx.onrender.com/api/books returns JSON
- ✅ https://book-digest.com shows books with covers
- ✅ Production matches localhost functionality
- ✅ All 454 books visible

---

**Next step: Can you access Render.com dashboard and paste the latest logs here?**

Or tell me if you want me to guide you through creating a new database on Render.com.
