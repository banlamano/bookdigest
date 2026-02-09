# 🚀 Admin Panel Production Deployment Guide

**Date:** February 9, 2026  
**Status:** Ready to Deploy

---

## 📋 Summary of Changes

We've fixed the admin panel users management locally. Here's what needs to be deployed to production:

### Backend Changes (Render):
1. ✅ Fixed duplicate `/users` route in `admin-panel.routes.ts`
2. ✅ Added missing `logger` import
3. ✅ Fixed field name mismatch: `subscriptionEndDate` → `subscriptionEnd`
4. ⚠️ **CRITICAL:** Need to add `ADMIN_SECRET_KEY` environment variable

### Frontend Changes (Vercel):
1. ✅ Fixed User interface to use `subscriptionEnd` instead of `subscriptionEndDate`

---

## 🔧 Step 1: Deploy Backend to Render

### 1.1 Commit and Push Changes

```powershell
# Add the fixed files
git add backend/src/routes/admin-panel.routes.ts
git commit -m "Fix admin panel users endpoint - remove duplicate route and fix field names"
git push origin main
```

### 1.2 Add Environment Variable on Render

1. Go to: https://dashboard.render.com
2. Select your backend service: **bookdigest-backend**
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - **Key:** `ADMIN_SECRET_KEY`
   - **Value:** `bookdigest-secure-admin-2026-key`
6. Click **Save Changes**

**Note:** Render will automatically redeploy when you push to GitHub and when you add env variables.

---

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Commit and Push Changes

```powershell
# Add the fixed files
git add frontend/src/app/admin/users/page.tsx
git commit -m "Fix admin panel users interface - update field name to subscriptionEnd"
git push origin main
```

**Note:** Vercel will automatically deploy when you push to GitHub.

---

## ✅ Step 3: Verify Production Deployment

### 3.1 Wait for Deployments

- **Render:** ~3-5 minutes
- **Vercel:** ~2-3 minutes

### 3.2 Test Backend API

```powershell
# Test admin users endpoint
Invoke-WebRequest -Uri "https://bookdigest-lypx.onrender.com/api/admin-panel/users" -Headers @{"x-admin-key"="bookdigest-secure-admin-2026-key"} | Select-Object StatusCode, Content
```

**Expected:** Status 200 with user data

### 3.3 Test Frontend Admin Panel

1. Go to: https://bookdigest-iota.vercel.app/login
2. Log in with demo account or create admin user (see below)
3. Navigate to: https://bookdigest-iota.vercel.app/admin/users
4. Verify users are displayed

---

## 👤 Step 4: Create Production Admin User

If you need to create an admin user in production, run this script:

```javascript
// run-on-render-shell.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@bookdigest.com' },
    update: {
      password: hashedPassword,
      role: 'ADMIN'
    },
    create: {
      email: 'admin@bookdigest.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      subscriptionType: 'FREE'
    }
  });
  
  console.log('✅ Admin user created:', user.email);
  await prisma.$disconnect();
}

createAdmin();
```

**Run on Render Shell:**
1. Go to Render Dashboard → Your Service
2. Click **Shell** tab
3. Paste the script above
4. Run: `node run-on-render-shell.js`

---

## 🔍 Production vs Local Differences

### Database:
- **Local:** SQLite (`backend/prisma/dev.db`)
- **Production:** PostgreSQL (Neon/Render)

### Schema Files:
- **Local:** Uses `schema.prisma` (SQLite version)
- **Production:** Uses `schema.prisma` but with PostgreSQL provider

**Important:** The schema is already set correctly for production. We created `schema-postgresql.prisma` as a backup, but production uses the main `schema.prisma` file which should be PostgreSQL.

### Current Schema Status:
⚠️ **ISSUE:** Current `schema.prisma` is set to SQLite (for local dev)

**FIX NEEDED:** Before deploying, restore PostgreSQL schema:

```powershell
cd backend/prisma
Copy-Item schema-postgresql.prisma schema.prisma -Force
cd ../..
git add backend/prisma/schema.prisma
git commit -m "Restore PostgreSQL schema for production"
git push origin main
```

---

## 📊 Deployment Checklist

### Pre-Deployment:
- [x] Fix admin-panel routes (duplicate removed)
- [x] Fix field name mismatch (subscriptionEnd)
- [x] Fix frontend interface
- [ ] Restore PostgreSQL schema
- [ ] Commit and push changes
- [ ] Add ADMIN_SECRET_KEY to Render

### Post-Deployment:
- [ ] Wait for Render deployment (~5 min)
- [ ] Wait for Vercel deployment (~3 min)
- [ ] Test backend API endpoint
- [ ] Test frontend admin panel
- [ ] Create admin user (if needed)
- [ ] Verify users are displayed

---

## 🎯 Expected Results

After successful deployment:

✅ Admin panel accessible at: https://bookdigest-iota.vercel.app/admin/users  
✅ Backend API working: https://bookdigest-lypx.onrender.com/api/admin-panel/users  
✅ Users displayed with correct fields  
✅ Filters working (search, role, subscription)  
✅ Actions working (make admin, delete)  

---

## 🚨 Important Notes

1. **Schema File:** Make sure to restore PostgreSQL schema before deploying
2. **Environment Variable:** ADMIN_SECRET_KEY must match between backend and any admin tools
3. **CORS:** Already configured to allow Vercel frontend
4. **Database:** Production uses PostgreSQL, not SQLite

---

## 📞 Troubleshooting

### "Unauthorized - Admin access required"
- Check ADMIN_SECRET_KEY is set on Render
- Verify the key matches in your requests

### "Field does not exist" errors
- Check schema.prisma is set to PostgreSQL
- Run `npx prisma generate` on Render (auto-runs on deploy)

### Users not showing
- Create an admin user using the script above
- Check database has users (use Render Shell with Prisma)

---

## 🎉 Success Criteria

Production deployment is successful when:
1. ✅ Backend API returns user data
2. ✅ Frontend admin panel displays users
3. ✅ No console errors
4. ✅ All filters work
5. ✅ Actions (make admin, delete) work

---

**Ready to deploy? Follow the steps above in order!**
