# 🚀 GO LIVE CHECKLIST - Switch to Stripe Live Mode

**Date:** February 7, 2026  
**Status:** Ready to Launch! 🎉

---

## 📋 WHAT YOU NEED TO DO (15 minutes)

### **STEP 1: Switch Stripe to Live Mode** ⏱️ 2 minutes

1. **Go to Stripe Dashboard:** https://dashboard.stripe.com
2. **Toggle to LIVE MODE** (top right corner)
   - Should switch from "Test mode" to "Live mode"
3. **You're now in production!** 🎉

---

### **STEP 2: Get LIVE API Keys** ⏱️ 3 minutes

1. **In Stripe Dashboard** (make sure you're in LIVE mode!)
2. **Go to:** Developers → API keys
3. **Copy these LIVE keys:**

   **Publishable Key** (starts with `pk_live_`)
   - Click "Reveal live key"
   - Copy it
   
   **Secret Key** (starts with `sk_live_`)
   - Click "Reveal live key"  
   - Copy it

4. **Save both keys somewhere safe!**

---

### **STEP 3: Create LIVE Products** ⏱️ 5 minutes

You already created test products. Now create the SAME products in LIVE mode:

#### **Product 1: Premium Monthly**
1. Go to **Products** → **Add product**
2. Fill in:
   - Name: `Premium Monthly`
   - Description: `Unlimited access to all book summaries`
   - Price: `9.99 EUR`
   - Billing: `Monthly (recurring)`
3. Click "Add product"
4. **COPY THE LIVE PRICE ID** (starts with `price_live_`)

#### **Product 2: Premium Yearly**
1. Click **"Add product"** again
2. Fill in:
   - Name: `Premium Yearly`
   - Description: `Unlimited access - Best value!`
   - Price: `79.99 EUR`
   - Billing: `Yearly (recurring)`
3. Click "Add product"
4. **COPY THE LIVE PRICE ID**

#### **Product 3: Team Plan**
1. Click **"Add product"** again
2. Fill in:
   - Name: `Team Plan`
   - Description: `For teams of 5+ users`
   - Price: `49.99 EUR`
   - Billing: `Monthly (recurring)`
3. Click "Add product"
4. **COPY THE LIVE PRICE ID**

---

### **STEP 4: Create LIVE Webhook** ⏱️ 3 minutes

1. **Go to:** Developers → Webhooks
2. **Click "Add endpoint"** (or "Add destination")
3. **Select:** Webhook endpoint (Hosted endpoint)
4. **Enter URL:** `https://bookdigest-lypx.onrender.com/api/payments/webhook`
5. **Select these 5 events:**
   - ✅ checkout.session.completed
   - ✅ customer.subscription.updated
   - ✅ customer.subscription.deleted
   - ✅ invoice.payment_succeeded
   - ✅ invoice.payment_failed
6. **Click "Add endpoint"**
7. **COPY THE LIVE WEBHOOK SECRET** (starts with `whsec_`)

---

### **STEP 5: Update Environment Variables** ⏱️ 5 minutes

#### **Backend (Render.com):**

1. Go to https://dashboard.render.com
2. Click on your backend service
3. Go to **Environment** tab
4. **UPDATE these 6 variables with LIVE values:**

```
STRIPE_SECRET_KEY=[YOUR_LIVE_SECRET_KEY]
STRIPE_PUBLISHABLE_KEY=[YOUR_LIVE_PUBLISHABLE_KEY]
STRIPE_WEBHOOK_SECRET=[YOUR_LIVE_WEBHOOK_SECRET]
STRIPE_PRICE_MONTHLY=[YOUR_LIVE_MONTHLY_PRICE_ID]
STRIPE_PRICE_YEARLY=[YOUR_LIVE_YEARLY_PRICE_ID]
STRIPE_PRICE_TEAM=[YOUR_LIVE_TEAM_PRICE_ID]
```

5. Click "Save Changes"
6. Backend will redeploy (~2-3 minutes)

#### **Frontend (Vercel):**

1. Go to https://vercel.com/dashboard
2. Click on your frontend project
3. Go to **Settings** → **Environment Variables**
4. **UPDATE this variable with LIVE value:**

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[YOUR_LIVE_PUBLISHABLE_KEY]
```

5. Click "Save"
6. **Redeploy:** Go to Deployments → Click latest → Redeploy

---

### **STEP 6: Test with REAL Money!** ⏱️ 5 minutes

**⚠️ WARNING: This will charge your real card!**

1. **Open:** https://bookdigest-iota.vercel.app/pricing
2. **Login** with your test account (or create new one)
3. **Click "Get Started"** on Premium Monthly
4. **Use YOUR REAL CARD:**
   - Your actual credit/debit card
   - You'll be charged €9.99
5. **Complete payment**
6. **Verify:**
   - ✅ Redirected to success page
   - ✅ Webhook received (check Stripe Dashboard)
   - ✅ User upgraded in database
   - ✅ Premium content unlocked

7. **Cancel your test subscription** (if you don't want to keep it):
   - Go to Stripe Dashboard → Customers
   - Find your subscription
   - Cancel it

---

## ✅ PRE-LAUNCH CHECKLIST

Before you update environment variables:

- [ ] Stripe switched to LIVE mode
- [ ] Live API keys obtained (pk_live_ and sk_live_)
- [ ] 3 products created in LIVE mode
- [ ] 3 Price IDs copied
- [ ] Webhook endpoint created in LIVE mode
- [ ] Webhook secret copied
- [ ] All keys and IDs ready to paste

---

## 🎉 POST-LAUNCH CHECKLIST

After environment variables are updated:

- [ ] Backend redeployed successfully
- [ ] Frontend redeployed successfully  
- [ ] Test payment with real card completed
- [ ] Webhook received successfully
- [ ] User upgraded correctly
- [ ] Premium content accessible
- [ ] Email receipt received
- [ ] Payment appears in Stripe Dashboard

---

## 🚨 IMPORTANT REMINDERS

### **Security:**
- ⚠️ NEVER commit live API keys to GitHub
- ⚠️ Keep webhook secret safe
- ⚠️ Only use HTTPS (already configured)

### **Testing:**
- ✅ Use test mode first (already done!)
- ✅ Test with small amount on real card
- ✅ Cancel test subscription after verification

### **Monitoring:**
- 📊 Check Stripe Dashboard daily
- 📊 Monitor webhook success rate
- 📊 Watch for failed payments
- 📊 Track revenue metrics

---

## 💰 WHAT HAPPENS AFTER LAUNCH

### **Day 1:**
- Monitor first real payments
- Check webhook logs
- Respond to any issues immediately
- Celebrate first sale! 🎉

### **Week 1:**
- Monitor daily revenue
- Track conversion rates
- Fix any bugs quickly
- Start marketing efforts

### **Month 1:**
- Optimize based on data
- A/B test pricing page
- Improve conversion funnel
- Scale marketing

---

## 📈 SUCCESS METRICS TO TRACK

**In Stripe Dashboard:**
- Total revenue
- Active subscriptions
- MRR (Monthly Recurring Revenue)
- Churn rate
- Failed payments

**In Google Analytics:**
- Pricing page visits
- Conversion rate
- Traffic sources
- User behavior

---

## 🆘 IF SOMETHING GOES WRONG

### **Payment Fails:**
1. Check Stripe Dashboard logs
2. Verify webhook secret is correct
3. Check backend logs in Render.com
4. Ensure all environment variables are set

### **Webhook Not Firing:**
1. Go to Stripe → Developers → Webhooks
2. Click on your webhook
3. Check "Recent deliveries"
4. Look for errors
5. Verify endpoint URL is correct

### **User Not Upgraded:**
1. Check webhook logs
2. Verify database connection
3. Check backend logs for errors
4. Ensure subscriptionType is updating

---

## 🎯 YOU'RE READY!

Everything is in place:
- ✅ Code tested and working
- ✅ Payment flow verified
- ✅ Infrastructure solid
- ✅ All features complete

**Time to make money!** 💰💰💰

---

## 📞 SUPPORT RESOURCES

- **Stripe Dashboard:** https://dashboard.stripe.com
- **Stripe Support:** https://support.stripe.com
- **Webhook Logs:** Stripe Dashboard → Developers → Webhooks
- **Test Cards:** https://stripe.com/docs/testing

---

**Ready to switch to live mode?**

Follow the steps above and you'll be accepting real payments in 15 minutes! 🚀

Good luck! 💪🎉

---

*Created: February 7, 2026*  
*Status: Ready for Production Launch*
