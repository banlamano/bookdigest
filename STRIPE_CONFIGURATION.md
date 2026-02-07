# Stripe Configuration - BookDigest

**Date:** February 7, 2026  
**Status:** Configuration in Progress

---

## 🔑 API Keys (Test Mode)

**Note:** Keep these secret and never commit to GitHub!

```
Publishable Key: pk_test_51Sqf... (stored in environment variables)
Secret Key: sk_test_51Sqf... (stored in environment variables)
```

**Security Note:** API keys are configured in Render.com and Vercel environment variables only.

---

## 💰 Products & Price IDs

### Product 1: Premium Monthly
- **Price:** €9.99/month
- **Price ID:** `price_1SyGGmBHqnKKSgz4NV0OMvZJ`
- **Description:** Unlimited access to all book summaries with audio narration

### Product 2: Premium Yearly
- **Price:** €79.99/year (Save 33%)
- **Price ID:** `price_1SyGJyBHqnKKSgz4OYBmYOwJ`
- **Description:** Unlimited access - Best value! Save 33% compared to monthly

### Product 3: Team Plan
- **Price:** €49.99/month
- **Price ID:** `price_1SyGLtBHqnKKSgz4uebCFVcM`
- **Description:** For teams of 5+ users. Includes team analytics and priority support

---

## 🔔 Webhook Configuration

**Webhook URL:** `https://bookdigest-lypx.onrender.com/api/payments/webhook`

**Events to Listen:**
- checkout.session.completed
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed

**Webhook Secret:** `whsec_...` (stored in environment variables)

---

## 📋 Environment Variables

### Backend (Render.com)
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_1SyGGmBHqnKKSgz4NV0OMvZJ
STRIPE_PRICE_YEARLY=price_1SyGJyBHqnKKSgz4OYBmYOwJ
STRIPE_PRICE_TEAM=price_1SyGLtBHqnKKSgz4uebCFVcM
```

### Frontend (Vercel)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## ✅ Setup Progress

- [x] Stripe account created
- [x] Test mode enabled
- [x] API keys obtained
- [x] Premium Monthly product created
- [x] Premium Yearly product created
- [x] Team Plan product created
- [ ] Webhook endpoint configured
- [ ] Environment variables updated (Backend)
- [ ] Environment variables updated (Frontend)
- [ ] Payment flow tested

---

*Configuration by: AI Assistant*  
*Last updated: February 7, 2026*
