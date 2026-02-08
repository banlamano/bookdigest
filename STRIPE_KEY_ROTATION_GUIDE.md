# 🔐 STRIPE KEY ROTATION - STEP BY STEP GUIDE

## 🚨 CRITICAL: Your Stripe key was exposed and deactivated

Follow these steps **IN ORDER** to restore payment functionality.

---

## ⏱️ ESTIMATED TIME: 15-30 minutes

---

## STEP 1: Generate New Stripe API Keys (5 min)

### A. Login to Stripe Dashboard
1. Go to: https://dashboard.stripe.com/login
2. Enter your credentials
3. Go to: **Developers** → **API keys**

### B. Delete/Rotate Exposed Key
1. Find the key ending in `***5yemV`
2. Click the **"..."** menu
3. Click **"Roll secret key"** or **"Delete"**
4. Confirm deletion

### C. Get New Live API Keys
You'll see two keys:

**Publishable key (Safe to share):**
```
pk_live_51SqfZeBHqnKKSgz4... (starts with pk_live_)
```
📋 Copy this - you'll need it for frontend

**Secret key (NEVER share publicly):**
```
sk_live_51SqfZeBHqnKKSgz4... (starts with sk_live_)
```
⚠️ Click **"Reveal live key"** to see it  
📋 Copy this - you'll need it for backend

### D. Get Webhook Secret (Important!)
1. Go to: **Developers** → **Webhooks**
2. Find your webhook endpoint (should be `https://bookdigest-lypx.onrender.com/api/payments/webhook`)
3. Click on it
4. Click **"Reveal"** next to **Signing secret**
5. Copy the value (starts with `whsec_`)

---

## STEP 2: Update Render Environment Variables (5 min)

### A. Access Render Dashboard
1. Go to: https://dashboard.render.com
2. Click on your backend service (bookdigest)
3. Go to **Environment** tab

### B. Update These Variables
Find and update each one by clicking **"Edit"**:

```
STRIPE_SECRET_KEY
<paste your new sk_live_... key here>

STRIPE_PUBLISHABLE_KEY
<paste your new pk_live_... key here>

STRIPE_WEBHOOK_SECRET
<paste your new whsec_... secret here>
```

### C. Verify Price IDs (Usually don't change)
These should still be the same:
```
STRIPE_PRICE_MONTHLY=price_1SyIKMBHqnKKSgz47mTueP7x
STRIPE_PRICE_YEARLY=price_1SyILMBHqnKKSgz4MFu0Wfm4
STRIPE_PRICE_TEAM=price_1SyIN3BHqnKKSgz4eQO2vaI8
```

### D. Save and Deploy
1. Click **"Save Changes"** at the bottom
2. Render will automatically redeploy (takes 2-3 minutes)
3. Wait for "Deploy succeeded" notification

---

## STEP 3: Update Vercel Environment Variables (3 min)

### A. Access Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Click on your project (bookdigest)
3. Go to **Settings** → **Environment Variables**

### B. Update Frontend Key
Find this variable:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

Click **"Edit"** and update to your new `pk_live_...` key

### C. Redeploy Frontend
1. Click **"Save"**
2. Go to **Deployments** tab
3. Click **"..."** on latest deployment
4. Click **"Redeploy"**
5. Wait for deployment to complete (1-2 minutes)

---

## STEP 4: Verify Payment Processing Works (5 min)

### A. Test Checkout Flow
1. Visit: https://bookdigest-iota.vercel.app
2. Go to pricing page: /pricing
3. Click **"Upgrade to Premium"**
4. Should redirect to Stripe checkout
5. ✅ If checkout page loads = Keys working!

### B. Test Mode (Recommended First)
Use Stripe test card:
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

### C. Verify Webhook
After test payment:
1. Go to: https://dashboard.stripe.com/webhooks
2. Click on your webhook
3. Click **"Events"** tab
4. Should see recent events
5. Status should be **"Success"** ✅

---

## STEP 5: Review Stripe Logs (10 min)

### CRITICAL: Check for Unauthorized Activity

1. Go to: https://dashboard.stripe.com/logs
2. Set date range: **February 7-8, 2026**
3. Look for:

**🚨 RED FLAGS:**
- Unexpected API calls
- Payment attempts you don't recognize
- Customer data exports
- Bulk refunds
- Changes to products/prices
- Calls from unknown IP addresses

**✅ NORMAL ACTIVITY:**
- Regular payment attempts
- Webhook deliveries
- Customer lookups from your app

### If You Find Suspicious Activity:
1. Document everything (screenshot)
2. Contact Stripe support immediately: https://support.stripe.com
3. Consider reporting to authorities if fraud confirmed

---

## STEP 6: Clean Git History (CRITICAL - 10 min)

The exposed key is still in your git history! You MUST remove it.

### Option A: BFG Repo-Cleaner (Easiest)

**Download BFG:**
- Windows: https://rtyley.github.io/bfg-repo-cleaner/
- Direct: https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

**Steps:**
```bash
# 1. Create a secrets.txt file with the exposed key
echo "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" > secrets.txt

# 2. Clone mirror
git clone --mirror https://github.com/banlamano/bookdigest.git

# 3. Run BFG
java -jar bfg.jar --replace-text secrets.txt bookdigest.git

# 4. Clean up
cd bookdigest.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push (DANGEROUS - see warning below)
git push --force
```

### Option B: Git Filter-Branch
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch LIVE_ENV_VARIABLES.md" \
  --prune-empty --tag-name-filter cat -- --all

git push --force --all
```

### ⚠️ CRITICAL WARNING
Force pushing rewrites git history. This will:
- Break existing clones
- Require all team members to re-clone
- Cannot be undone

**Before force pushing:**
1. Backup your repo
2. Notify all team members
3. Consider if you're the only developer

**Alternative:** Make repo private instead of rewriting history

---

## STEP 7: Make Repository Private (IMMEDIATE)

### If Repository is Public:
1. Go to: https://github.com/banlamano/bookdigest
2. Click **Settings**
3. Scroll to **Danger Zone**
4. Click **"Change visibility"**
5. Select **"Make private"**
6. Type repository name to confirm
7. Click **"I understand, change repository visibility"**

**This prevents future exposure while you clean history**

---

## STEP 8: Add Security Measures (5 min)

### A. Update .gitignore
Already done! We've added:
```
*LIVE_ENV*
*PRODUCTION_ENV*
*SECRET*
*CREDENTIALS*
```

### B. Install Git-Secrets (Recommended)
```bash
# Install git-secrets
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
sudo make install

# Set up in your repo
cd /path/to/bookdigest
git secrets --install
git secrets --register-aws
```

### C. Enable GitHub Secret Scanning
1. Go to: https://github.com/banlamano/bookdigest/settings/security_analysis
2. Enable **"Secret scanning"**
3. Enable **"Push protection"**

---

## ✅ VERIFICATION CHECKLIST

Complete each item:

- [ ] New Stripe keys generated
- [ ] Old key deleted in Stripe dashboard
- [ ] Render environment variables updated
- [ ] Render deployed successfully
- [ ] Vercel environment variables updated
- [ ] Vercel deployed successfully
- [ ] Test payment completed successfully
- [ ] Webhook receiving events
- [ ] Stripe logs reviewed for unauthorized activity
- [ ] Git history cleaned (or repo made private)
- [ ] .gitignore updated
- [ ] Security measures implemented
- [ ] No exposed keys in current codebase
- [ ] Team notified (if applicable)

---

## 📊 SUCCESS CRITERIA

You're done when:
1. ✅ Payment checkout page loads
2. ✅ Test payment succeeds
3. ✅ Webhook shows "Success" in Stripe dashboard
4. ✅ No unauthorized activity in Stripe logs
5. ✅ No keys in git history (or repo is private)
6. ✅ .gitignore protects future files

---

## 🆘 TROUBLESHOOTING

### Problem: Checkout page won't load
**Solution:** 
- Check browser console for errors
- Verify NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in Vercel
- Make sure key starts with `pk_live_`

### Problem: "No such customer" error
**Solution:**
- Verify STRIPE_SECRET_KEY in Render
- Make sure it's the NEW key, not old one

### Problem: Webhook failing
**Solution:**
- Check STRIPE_WEBHOOK_SECRET in Render
- Verify webhook endpoint URL is correct
- Check Render logs for errors

### Problem: Still seeing old key in git
**Solution:**
- You need to clean git history (Step 6)
- Or make repository private

---

## 📞 NEED HELP?

**Stripe Support:**
- https://support.stripe.com/contact
- Email: support@stripe.com

**Emergency:**
- If you suspect fraud: support@stripe.com (mark as urgent)
- If unauthorized charges: Dispute in Stripe dashboard

---

## 📝 AFTER COMPLETION

Document in your team records:
- Date of incident
- Keys that were rotated
- Any suspicious activity found
- Actions taken to prevent recurrence

Set calendar reminder:
- Review API keys monthly
- Audit security quarterly
- Rotate keys annually

---

**Status:** Ready to start key rotation

**Priority:** CRITICAL

**Time Required:** 15-30 minutes

**Let's get your payments working again!** 🚀
