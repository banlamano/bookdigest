# 🚀 BookDigest Production Deployment Guide

## Prerequisites

Before deploying, make sure you have:
- ✅ GitHub account (for code hosting)
- ✅ Railway account (for backend) - Sign up at https://railway.app
- ✅ Vercel account (for frontend) - Sign up at https://vercel.com
- ✅ Domain name (optional but recommended)

---

## 📦 STEP 1: Push Code to GitHub

### 1.1 Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `bookdigest`
3. Make it **Private** (recommended for now)
4. Don't initialize with README (we have code already)

### 1.2 Push Your Code

Open your terminal in the project root and run:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Production ready"

# Add remote (replace with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/bookdigest.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**✅ CHECKPOINT:** Your code is now on GitHub!

---

## 🚂 STEP 2: Deploy Backend to Railway

### 2.1 Sign Up for Railway

1. Go to https://railway.app
2. Sign up with GitHub (recommended)
3. Verify your email

### 2.2 Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Connect your GitHub account if not connected
4. Select your `bookdigest` repository
5. Railway will detect it as a monorepo

### 2.3 Configure Backend Service

1. Click **"Add Service"**
2. Select **"GitHub Repo"**
3. Choose the `backend` directory
4. Railway will auto-detect Node.js

### 2.4 Add PostgreSQL Database

1. In your Railway project, click **"New"**
2. Select **"Database"**
3. Choose **"PostgreSQL"**
4. Database will be created automatically

### 2.5 Configure Environment Variables

1. Click on your backend service
2. Go to **"Variables"** tab
3. Add these variables:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-super-secret-jwt-key-CHANGE-THIS
CORS_ORIGIN=https://your-domain.vercel.app
```

**Generate JWT Secret:**
```bash
# Run this in your terminal to generate a secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.6 Configure Build Settings

1. Go to **"Settings"** tab
2. Set **Root Directory** to `/backend`
3. Set **Build Command**: `npm install && npx prisma generate && npm run build`
4. Set **Start Command**: `npm run start`

### 2.7 Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Railway will provide a URL like `https://backend-production-xxxx.up.railway.app`

### 2.8 Run Database Migrations

1. In Railway, go to your backend service
2. Click **"Settings"** → **"Deploy"** → **"Run a Command"**
3. Run: `npx prisma migrate deploy`
4. Run: `npm run prisma:seed:500` (to add books)
5. Run: `npm run generate:summaries` (to add summaries)

**✅ CHECKPOINT:** Your backend is live! Copy the Railway URL.

---

## ▲ STEP 3: Deploy Frontend to Vercel

### 3.1 Sign Up for Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Verify your email

### 3.2 Import Project

1. Click **"Add New"** → **"Project"**
2. Import your `bookdigest` GitHub repository
3. Vercel will detect Next.js automatically

### 3.3 Configure Project Settings

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)

### 3.4 Add Environment Variables

Click **"Environment Variables"** and add:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

**Replace** `your-backend-url.railway.app` with your Railway backend URL!

### 3.5 Deploy

1. Click **"Deploy"**
2. Wait for build (2-3 minutes)
3. Vercel will provide a URL like `https://bookdigest.vercel.app`

**✅ CHECKPOINT:** Your frontend is live!

---

## 🔗 STEP 4: Connect Frontend & Backend

### 4.1 Update Backend CORS

1. Go back to Railway → Backend service
2. Update `CORS_ORIGIN` variable to your Vercel URL:
   ```
   CORS_ORIGIN=https://your-project.vercel.app
   ```
3. Backend will auto-redeploy

### 4.2 Test the Connection

1. Visit your Vercel URL
2. Try logging in with demo account:
   - Email: demo@bookdigest.com
   - Password: demo123
3. Browse books, test audio player

**✅ CHECKPOINT:** Everything connected and working!

---

## 🎉 You're Live!

Congratulations! Your BookDigest platform is now live in production!

**Deployment Date:** [Add date when deployed]  
**Backend URL:** [Add Railway URL]  
**Frontend URL:** [Add Vercel URL]  
**Custom Domain:** [Add if you have one]
