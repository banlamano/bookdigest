# 🔐 Stripe Payment Setup Guide - BookDigest

## 📋 Overview
This guide will help you set up Stripe payments for your BookDigest platform in **under 30 minutes**.

---

## 🎯 Step 1: Create Stripe Account (5 minutes)

### 1.1 Sign Up
1. Go to [https://stripe.com](https://stripe.com)
2. Click **"Start now"** or **"Sign up"**
3. Enter your email and create a password
4. Verify your email address

### 1.2 Complete Business Profile
1. Navigate to **Settings** → **Business settings**
2. Fill in:
   - Business name: **BookDigest** (or your business name)
   - Country: Your country
   - Business type: Individual or Company
   - Industry: SaaS / Digital Products
3. Add your business website: `https://bookdigest-iota.vercel.app`

### 1.3 Activate Your Account
1. Go to **Settings** → **Account**
2. Click **"Activate account"**
3. Provide required information (takes 5-10 minutes)

---

## 🔑 Step 2: Get Your API Keys (2 minutes)

### 2.1 Get Test Keys (for development)
1. Make sure you're in **Test mode** (toggle in top right)
2. Go to **Developers** → **API keys**
3. Copy these keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Click "Reveal test key"

### 2.2 Get Live Keys (for production)
1. Switch to **Live mode** (toggle in top right)
2. Go to **Developers** → **API keys**
3. Copy these keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`) - Click "Reveal live key"

---

## 💰 Step 3: Create Products & Prices (10 minutes)

### 3.1 Create Premium Monthly Product
1. Go to **Products** → **Add product**
2. Fill in:
   - **Name**: Premium Monthly
   - **Description**: Unlimited access to all book summaries
   - **Pricing model**: Standard pricing
   - **Price**: €9.99 EUR
   - **Billing period**: Monthly
   - **Currency**: EUR
3. Click **"Add product"**
4. **COPY THE PRICE ID** (starts with `price_`) - You'll need this!

### 3.2 Create Premium Yearly Product
1. Click **"Add product"** again
2. Fill in:
   - **Name**: Premium Yearly
   - **Description**: Unlimited access - Best value!
   - **Pricing model**: Standard pricing
   - **Price**: €79.99 EUR
   - **Billing period**: Yearly
   - **Currency**: EUR
3. Click **"Add product"**
4. **COPY THE PRICE ID** (starts with `price_`) - You'll need this!

### 3.3 Create Team Plan Product
1. Click **"Add product"** again
2. Fill in:
   - **Name**: Team Plan
   - **Description**: For teams of 5+ users
   - **Pricing model**: Standard pricing
   - **Price**: €49.99 EUR
   - **Billing period**: Monthly
   - **Currency**: EUR
3. Click **"Add product"**
4. **COPY THE PRICE ID** (starts with `price_`) - You'll need this!

---

## 🔔 Step 4: Set Up Webhooks (5 minutes)

### 4.1 Create Webhook Endpoint
1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter endpoint URL:
   - **Production**: `https://bookdigest-lypx.onrender.com/api/payments/webhook`
4. Select events to listen to:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Click **"Add endpoint"**
6. **COPY THE WEBHOOK SIGNING SECRET** (starts with `whsec_`) - You'll need this!

### 4.2 Test Webhook (Optional but Recommended)
1. Click **"Send test webhook"**
2. Select `checkout.session.completed`
3. Verify it receives successfully

---

## 🔐 Step 5: Configure Environment Variables (5 minutes)

### 5.1 Update Backend Production Environment

You need to update your Render.com environment variables:

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Select your **bookdigest backend** service
3. Go to **Environment** tab
4. Add/Update these variables:

```
STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET_HERE
STRIPE_PRICE_MONTHLY=price_YOUR_MONTHLY_PRICE_ID
STRIPE_PRICE_YEARLY=price_YOUR_YEARLY_PRICE_ID
STRIPE_PRICE_TEAM=price_YOUR_TEAM_PRICE_ID
```

5. Click **"Save Changes"**
6. Your backend will automatically redeploy

### 5.2 Update Frontend Production Environment

You need to update your Vercel environment variables:

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your **bookdigest frontend** project
3. Go to **Settings** → **Environment Variables**
4. Add this variable:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_KEY_HERE
```

5. Click **"Save"**
6. **Redeploy** your frontend (go to Deployments → click ⋯ → Redeploy)

---

## ✅ Step 6: Test Payment Flow (5 minutes)

### 6.1 Test Mode Testing (Before going live)
1. Switch Stripe to **Test mode**
2. Use test environment variables
3. Go to your pricing page: `https://bookdigest-iota.vercel.app/pricing`
4. Click **"Start Free Trial"** on Premium Monthly
5. Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
6. Complete payment
7. Verify:
   - ✅ Redirected to success page
   - ✅ Webhook received (check Stripe Dashboard → Webhooks)
   - ✅ User upgraded in database
   - ✅ Premium content unlocked

### 6.2 Live Mode Testing (Real money!)
1. Switch Stripe to **Live mode**
2. Update environment variables with live keys
3. Test with a REAL card (you'll be charged!)
4. Or use a friend/test account
5. Cancel subscription after test

---

## 📊 Step 7: Monitor & Track (Ongoing)

### Dashboard to Monitor Daily:
1. **Stripe Dashboard**: https://dashboard.stripe.com
   - Revenue
   - Active subscriptions
   - Failed payments
   - Churn rate

2. **Webhooks**: Check for any failures
   - Go to Developers → Webhooks
   - View webhook attempts
   - Fix any failing webhooks immediately

---

## 🚨 Common Issues & Solutions

### Issue 1: "Webhook signature verification failed"
**Solution**: 
- Make sure your webhook secret is correct
- Check that you're using the raw body in the webhook endpoint
- Verify the endpoint URL is correct

### Issue 2: "Price not found"
**Solution**:
- Verify the price IDs are correct in your environment variables
- Make sure you're using the correct mode (test vs. live)
- Check that prices are active in Stripe dashboard

### Issue 3: "Customer not found"
**Solution**:
- Make sure user emails are valid
- Check that customer creation is working
- Verify database connection

### Issue 4: Payment succeeds but user not upgraded
**Solution**:
- Check webhook logs in Stripe
- Verify webhook endpoint is receiving events
- Check database logs for errors
- Ensure webhook secret is correct

---

## 💡 Pro Tips

### 1. Start with Test Mode
- Always test thoroughly in test mode first
- Don't go live until everything works perfectly

### 2. Set Up Email Receipts
- Go to Settings → Emails → Customer emails
- Enable automatic receipts
- Customize email template

### 3. Enable Customer Portal
- Go to Settings → Billing → Customer portal
- Enable portal
- Customers can manage subscriptions themselves

### 4. Set Up Tax Collection (If Required)
- Go to Settings → Tax
- Enable Stripe Tax if you need to collect VAT/GST
- Configure tax rates for your regions

### 5. Monitor Failed Payments
- Set up email alerts for failed payments
- Enable Smart Retries in Stripe
- Send dunning emails to customers

---

## 📈 Revenue Tracking

### Key Metrics to Track:
1. **MRR** (Monthly Recurring Revenue)
2. **Churn Rate** (% of cancellations)
3. **LTV** (Lifetime Value per customer)
4. **Conversion Rate** (Free → Paid)
5. **ARPU** (Average Revenue Per User)

Stripe provides all these metrics in the Dashboard!

---

## 🎉 Next Steps After Setup

Once Stripe is configured:

1. ✅ Test the payment flow thoroughly
2. ✅ Add trial period (7 days free)
3. ✅ Create cancellation flow
4. ✅ Add subscription management page
5. ✅ Set up email notifications
6. ✅ Create customer success page
7. ✅ Monitor first payments closely

---

## 🆘 Need Help?

- **Stripe Support**: https://support.stripe.com
- **Stripe Documentation**: https://stripe.com/docs
- **Test Cards**: https://stripe.com/docs/testing

---

## 📝 Checklist

Before going live, ensure:

- [ ] Stripe account activated
- [ ] Live API keys obtained
- [ ] Products created (Monthly, Yearly, Team)
- [ ] Webhook endpoint configured
- [ ] Environment variables set in Render.com
- [ ] Environment variables set in Vercel
- [ ] Test payment completed successfully
- [ ] Webhook events received and processed
- [ ] User upgraded correctly in database
- [ ] Premium content unlocked
- [ ] Email receipts enabled
- [ ] Customer portal enabled
- [ ] Monitoring dashboard set up

---

**Estimated Time**: 30-45 minutes total
**Difficulty**: Easy to Moderate
**Result**: Fully functional payment system ready to accept real money! 💰

---

*Last updated: February 7, 2026*
