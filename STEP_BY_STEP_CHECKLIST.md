# ✅ STRIPE KEY ROTATION - INTERACTIVE CHECKLIST

**Start Time:** _________  
**Expected Completion:** 15 minutes

---

## 🔐 STEP 1: GENERATE NEW STRIPE KEYS (5 minutes)

### A. Access Stripe Dashboard
- [ ] Open browser
- [ ] Go to: https://dashboard.stripe.com/login
- [ ] Login with your credentials
- [ ] Click "Developers" in left menu
- [ ] Click "API keys"

### B. Delete/Roll the Exposed Key
- [ ] Find the key with description showing `***5yemV`
- [ ] Click the "..." (three dots) menu on that key
- [ ] Click "Roll secret key" (or "Delete")
- [ ] Confirm the action

### C. Get Your NEW Secret Key
- [ ] In the "Secret key" section, click "Reveal live key"
- [ ] Copy the ENTIRE key (starts with `sk_live_51...`)
- [ ] Paste it here temporarily (we'll use it in next steps):
  ```
  NEW_SECRET_KEY: sk_live_________________________________
  ```

### D. Get Your NEW Publishable Key
- [ ] Look for "Publishable key" section
- [ ] Copy the key (starts with `pk_live_51...`)
- [ ] Paste it here:
  ```
  NEW_PUBLISHABLE_KEY: pk_live_________________________________
  ```

### E. Get Webhook Secret (Important!)
- [ ] Click "Webhooks" in left menu
- [ ] Find webhook endpoint: `https://bookdigest-lypx.onrender.com/api/payments/webhook`
- [ ] Click on it
- [ ] Click "Reveal" next to "Signing secret"
- [ ] Copy the secret (starts with `whsec_`)
- [ ] Paste it here:
  ```
  WEBHOOK_SECRET: whsec_________________________________
  ```

✅ **Step 1 Complete!** You now have 3 values to update.

---

## 🖥️ STEP 2: UPDATE RENDER (Backend) (3 minutes)

### A. Access Render Dashboard
- [ ] Open new tab
- [ ] Go to: https://dashboard.render.com
- [ ] Login if needed
- [ ] Click on your backend service (should be named "bookdigest" or similar)

### B. Navigate to Environment Variables
- [ ] Click "Environment" tab on the left
- [ ] You should see a list of environment variables

### C. Update STRIPE_SECRET_KEY
- [ ] Find variable: `STRIPE_SECRET_KEY`
- [ ] Click "Edit" (pencil icon)
- [ ] Delete old value
- [ ] Paste your NEW_SECRET_KEY from Step 1C
- [ ] Don't save yet - update all keys first

### D. Update STRIPE_PUBLISHABLE_KEY
- [ ] Find variable: `STRIPE_PUBLISHABLE_KEY`
- [ ] Click "Edit"
- [ ] Delete old value
- [ ] Paste your NEW_PUBLISHABLE_KEY from Step 1D

### E. Update STRIPE_WEBHOOK_SECRET
- [ ] Find variable: `STRIPE_WEBHOOK_SECRET`
- [ ] Click "Edit"
- [ ] Delete old value
- [ ] Paste your WEBHOOK_SECRET from Step 1E

### F. Verify Price IDs (Should NOT change)
- [ ] Confirm these are still present (don't edit):
  - `STRIPE_PRICE_MONTHLY=price_1SyIKMBHqnKKSgz47mTueP7x`
  - `STRIPE_PRICE_YEARLY=price_1SyILMBHqnKKSgz4MFu0Wfm4`
  - `STRIPE_PRICE_TEAM=price_1SyIN3BHqnKKSgz4eQO2vaI8`

### G. Save and Deploy
- [ ] Click "Save Changes" button at bottom
- [ ] Wait for "Deploy in progress" notification
- [ ] Wait for "Deploy succeeded" (takes 2-3 minutes)
- [ ] ✅ Checkmark appears when deployment complete

✅ **Step 2 Complete!** Backend is updated and deployed.

---

## 🌐 STEP 3: UPDATE VERCEL (Frontend) (2 minutes)

### A. Access Vercel Dashboard
- [ ] Open new tab
- [ ] Go to: https://vercel.com/dashboard
- [ ] Login if needed
- [ ] Click on your project (should be "bookdigest" or similar)

### B. Navigate to Environment Variables
- [ ] Click "Settings" tab
- [ ] Click "Environment Variables" in left menu
- [ ] You should see a list of variables

### C. Update Stripe Publishable Key
- [ ] Find variable: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Click "Edit" (three dots → Edit)
- [ ] Delete old value
- [ ] Paste your NEW_PUBLISHABLE_KEY from Step 1D
- [ ] Select environments: Production, Preview, Development (all checked)
- [ ] Click "Save"

### D. Redeploy Frontend
- [ ] Click "Deployments" tab at top
- [ ] Find the latest deployment
- [ ] Click "..." (three dots) on the right
- [ ] Click "Redeploy"
- [ ] Click "Redeploy" to confirm
- [ ] Wait for deployment (1-2 minutes)
- [ ] ✅ Wait for "Ready" status

✅ **Step 3 Complete!** Frontend is updated and deployed.

---

## 🧪 STEP 4: TEST PAYMENT PROCESSING (3 minutes)

### A. Test Checkout Page Loads
- [ ] Go to: https://bookdigest-iota.vercel.app/pricing
- [ ] Click "Upgrade to Premium" (Monthly or Yearly)
- [ ] Should redirect to Stripe checkout page
- [ ] ✅ If you see Stripe checkout = Keys are working!

### B. Test with Stripe Test Card (Optional but Recommended)
- [ ] Use test card number: `4242 4242 4242 4242`
- [ ] Expiry: Any future date (e.g., `12/34`)
- [ ] CVC: Any 3 digits (e.g., `123`)
- [ ] ZIP: Any 5 digits (e.g., `12345`)
- [ ] Email: Your test email
- [ ] Click "Subscribe"
- [ ] Should see success message
- [ ] ✅ Payment processed successfully

### C. Verify in Stripe Dashboard
- [ ] Go to: https://dashboard.stripe.com/payments
- [ ] Should see your test payment at the top
- [ ] Status should be "Succeeded"
- [ ] ✅ Payment appears in dashboard

✅ **Step 4 Complete!** Payments are working again!

---

## 🔍 STEP 5: REVIEW STRIPE LOGS FOR FRAUD (5 minutes)

### A. Access Stripe Logs
- [ ] Go to: https://dashboard.stripe.com/logs
- [ ] You should see API request logs

### B. Filter by Date
- [ ] Click date filter
- [ ] Select range: February 7-8, 2026
- [ ] Click "Apply"

### C. Review Activity for Suspicious Patterns
Look for these RED FLAGS:
- [ ] Check: Unusual number of API calls
- [ ] Check: Calls from unknown IP addresses
- [ ] Check: Failed payment attempts (many in a row)
- [ ] Check: Customer data exports
- [ ] Check: Bulk refunds or payouts
- [ ] Check: Changes to products/prices
- [ ] Check: Subscription modifications you didn't make

### D. Check Payments
- [ ] Go to: https://dashboard.stripe.com/payments
- [ ] Filter: Feb 7-8, 2026
- [ ] Review all transactions
- [ ] ✅ All transactions look legitimate
- [ ] ❌ If suspicious: Document and contact Stripe support

### E. Document Findings
- [ ] No suspicious activity found → Proceed to Step 6
- [ ] Suspicious activity found → **STOP and contact Stripe support immediately**

✅ **Step 5 Complete!** No fraud detected (hopefully!)

---

## 🔒 STEP 6: SECURE YOUR REPOSITORY (3 minutes)

### Option A: Make Repository Private (RECOMMENDED - EASIEST)

- [ ] Go to: https://github.com/banlamano/bookdigest
- [ ] Click "Settings" tab
- [ ] Scroll down to "Danger Zone" section
- [ ] Click "Change repository visibility"
- [ ] Select "Make private"
- [ ] Type repository name: `banlamano/bookdigest`
- [ ] Click "I understand, change repository visibility"
- [ ] ✅ Repository is now private

**Benefits:**
- ✅ Immediate - takes 30 seconds
- ✅ No risk of breaking things
- ✅ Stops any further exposure
- ✅ Easy to undo if needed

**Drawback:**
- Old key still in git history (but only you can access it)

### Option B: Clean Git History (ADVANCED - OPTIONAL)

⚠️ **WARNING:** This rewrites git history. Only do this if you understand the risks.

**If you choose this option:**
- [ ] Read STRIPE_KEY_ROTATION_GUIDE.md Step 6
- [ ] Make a backup of your repository
- [ ] Follow BFG Repo-Cleaner instructions
- [ ] Or use git filter-branch method
- [ ] Force push to remote
- [ ] Verify key is removed from history

**We recommend Option A for now. You can clean history later if needed.**

✅ **Step 6 Complete!** Repository is secured.

---

## 🎉 FINAL VERIFICATION

### Payment System Health Check
- [ ] ✅ New Stripe keys generated
- [ ] ✅ Old key deleted in Stripe dashboard
- [ ] ✅ Render environment variables updated
- [ ] ✅ Render deployed successfully
- [ ] ✅ Vercel environment variables updated
- [ ] ✅ Vercel deployed successfully
- [ ] ✅ Checkout page loads correctly
- [ ] ✅ Test payment succeeded (if tested)
- [ ] ✅ No suspicious activity in Stripe logs
- [ ] ✅ Repository secured (private or history cleaned)

### Security Improvements
- [ ] ✅ .gitignore updated (prevents future exposure)
- [ ] ✅ Documentation created
- [ ] ✅ Team aware of incident (if applicable)

---

## 📊 INCIDENT SUMMARY

**Total Time Spent:** _________ minutes

**Outcome:**
- [ ] ✅ SUCCESS - All payments working, no fraud detected
- [ ] ⚠️ PARTIAL - Payments working but suspicious activity found
- [ ] ❌ ISSUES - Need additional help

**Next Steps:**
- [ ] Monitor Stripe logs for next 24-48 hours
- [ ] Consider enabling GitHub secret scanning
- [ ] Set calendar reminder to rotate keys in 6-12 months
- [ ] Review team security practices

---

## 🆘 IF YOU ENCOUNTER ISSUES

### Checkout Page Won't Load
**Problem:** Blank page or error when clicking upgrade  
**Solution:**
- Check browser console (F12) for errors
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel
- Make sure it starts with `pk_live_`
- Hard refresh browser (Ctrl + F5)

### "No Such Customer" Error
**Problem:** Error when processing payment  
**Solution:**
- Verify `STRIPE_SECRET_KEY` in Render
- Make sure it's the NEW key, not old one
- Check Render logs for detailed error

### Webhook Not Working
**Problem:** Payment succeeds but subscription not activated  
**Solution:**
- Verify `STRIPE_WEBHOOK_SECRET` in Render
- Check webhook endpoint in Stripe dashboard
- Review webhook events in Stripe for errors

### Found Suspicious Activity
**Action:** Contact Stripe immediately  
**Link:** https://support.stripe.com/contact  
**Mark as:** URGENT - Potential fraud  
**Provide:** Screenshots, timestamps, transaction IDs

---

## ✅ COMPLETION CERTIFICATE

**Date Completed:** _________________  
**Time Taken:** _________ minutes  
**Result:** ☐ Success ☐ Issues encountered  
**Notes:** _______________________________________________

---

**Congratulations!** 🎉 You've successfully recovered from a security incident and secured your payment system!

**Remember:**
- ✅ Never commit API keys to git
- ✅ Always use environment variables
- ✅ Use .gitignore for sensitive files
- ✅ Regularly review access logs

**You're back in business!** 🚀
