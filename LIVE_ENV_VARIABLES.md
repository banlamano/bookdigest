# 🔐 LIVE ENVIRONMENT VARIABLES - COPY & PASTE

**IMPORTANT:** Use these exact values to update your environment variables.

---

## 🖥️ BACKEND (Render.com)

Go to: https://dashboard.render.com → Your backend service → Environment tab

**UPDATE these 6 variables:**

```
STRIPE_SECRET_KEY
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

STRIPE_PUBLISHABLE_KEY
pk_live_51SqfZeBHqnKKSgz4wToLZdfypuRFeKxtpFOCWrHhD4ZyXf9ljMSmDfoe8yLDtsVqch9I3d8RKtolWNa9vv8e5SSn00sZHztgcj

STRIPE_WEBHOOK_SECRET
whsec_UOVHf6J9SoJTR2cw6xXrGsGEje363Vwb

STRIPE_PRICE_MONTHLY
price_1SyIKMBHqnKKSgz47mTueP7x

STRIPE_PRICE_YEARLY
price_1SyILMBHqnKKSgz4MFu0Wfm4

STRIPE_PRICE_TEAM
price_1SyIN3BHqnKKSgz4eQO2vaI8
```

**After updating:** Click "Save Changes" → Backend will redeploy (2-3 min)

---

## 🌐 FRONTEND (Vercel)

Go to: https://vercel.com/dashboard → Your project → Settings → Environment Variables

**UPDATE this 1 variable:**

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
pk_live_51SqfZeBHqnKKSgz4wToLZdfypuRFeKxtpFOCWrHhD4ZyXf9ljMSmDfoe8yLDtsVqch9I3d8RKtolWNa9vv8e5SSn00sZHztgcj
```

**After updating:** 
1. Click "Save"
2. Go to Deployments tab
3. Click latest deployment → Click "⋯" → Click "Redeploy"

---

## ✅ CHECKLIST

- [ ] Backend: All 6 variables updated on Render.com
- [ ] Backend: Clicked "Save Changes"
- [ ] Backend: Deployment in progress (wait for "Live" status)
- [ ] Frontend: 1 variable updated on Vercel
- [ ] Frontend: Clicked "Save"
- [ ] Frontend: Triggered redeploy
- [ ] Frontend: Deployment in progress (wait for "Ready" status)

---

**After both deployments complete:** You're LIVE! 🚀💰
