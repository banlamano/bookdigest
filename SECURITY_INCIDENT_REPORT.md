# 🚨 SECURITY INCIDENT REPORT - Stripe API Key Exposure

**Date:** February 8, 2026  
**Severity:** CRITICAL  
**Status:** IN PROGRESS

---

## 📋 INCIDENT SUMMARY

**What Happened:**
- Stripe detected live API key `sk_live_***5yemV` publicly available online
- Key was automatically deactivated by Stripe for security
- All payment processing is currently BLOCKED

**Key Exposed:**
```
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
```

**How It Was Exposed:**
- Found in git commit history from Feb 7, 2026 (commit: 7b2b8da6)
- File: `LIVE_ENV_VARIABLES.md` (now deleted but in git history)
- The file was committed and pushed to GitHub PUBLIC repository

---

## ✅ IMMEDIATE ACTIONS COMPLETED

1. ✅ Located source of leak - `LIVE_ENV_VARIABLES.md` in git history
2. ✅ Confirmed file is deleted from current codebase
3. ✅ Verified exposed key is no longer in active files

---

## 🚨 URGENT ACTIONS REQUIRED

### 1. Generate New Stripe API Keys
**You must do this NOW:**

1. Go to: https://dashboard.stripe.com/apikeys
2. Click on the exposed key: `sk_live_***5yemV`
3. Click "Delete" or "Roll secret key"
4. Generate new live API keys:
   - New Secret Key (sk_live_...)
   - Note: Publishable key (pk_live_...) may also need rotation

### 2. Update Environment Variables

**Render (Backend):**
1. Go to: https://dashboard.render.com
2. Select your backend service
3. Go to "Environment" tab
4. Update these variables with NEW keys:
   ```
   STRIPE_SECRET_KEY=<your_new_sk_live_key>
   STRIPE_PUBLISHABLE_KEY=<your_new_pk_live_key>
   ```
5. Click "Save Changes"
6. Backend will auto-redeploy

**Vercel (Frontend):**
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Update:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your_new_pk_live_key>
   ```
5. Redeploy frontend

### 3. Review Stripe Logs
**CRITICAL - Check for unauthorized activity:**

1. Go to: https://dashboard.stripe.com/logs
2. Filter by date: February 7-8, 2026
3. Look for:
   - Unusual API calls
   - Failed payment attempts
   - Customer data access
   - Subscription modifications
   - Refunds or payouts

### 4. Clean Git History (CRITICAL)

The key is still in git history! We need to remove it:

**Option A: Use BFG Repo-Cleaner (Recommended)**
```bash
# Download BFG
# https://rtyley.github.io/bfg-repo-cleaner/

# Clone a fresh copy
git clone --mirror https://github.com/banlamano/bookdigest.git
cd bookdigest.git

# Remove the exposed key
bfg --replace-text secrets.txt  # Create secrets.txt with the key
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (WARNING: Rewrites history)
git push --force
```

**Option B: Filter-Branch (Alternative)**
```bash
git filter-branch --tree-filter 'rm -f LIVE_ENV_VARIABLES.md' --prune-empty HEAD
git push --force
```

⚠️ **WARNING:** Both options rewrite git history. Coordinate with team members!

### 5. Rotate ALL API Keys

Don't stop at just the exposed key. Rotate:
- ✅ Stripe Secret Key (sk_live_)
- ✅ Stripe Publishable Key (pk_live_)
- ✅ Stripe Webhook Secret (whsec_)
- ✅ All Price IDs (verify they still work)

### 6. Update Webhook Endpoint

After rotating webhook secret:
1. Go to: https://dashboard.stripe.com/webhooks
2. Find your webhook endpoint
3. Click "..." → "Update details"
4. Copy new signing secret
5. Update `STRIPE_WEBHOOK_SECRET` in Render

---

## 📊 IMPACT ASSESSMENT

**Current Impact:**
- ❌ Payment processing BLOCKED
- ❌ New subscriptions CANNOT be created
- ❌ Existing subscriptions may fail to renew
- ✅ Website still accessible
- ✅ Non-payment features working

**User Impact:**
- Existing users: Can still browse/read (if already premium)
- New users: CANNOT upgrade to premium
- Renewals: Will fail until keys are updated

**Financial Impact:**
- Lost revenue during downtime
- Potential unauthorized charges (CHECK LOGS!)

---

## 🔒 PREVENTIVE MEASURES (Implement After Fix)

### 1. Add to .gitignore Immediately
```bash
# Add to .gitignore
*LIVE_ENV*
*PRODUCTION_ENV*
*SECRETS*
*.pem
*.key
```

### 2. Use Environment Variables Only
- ❌ NEVER commit credentials to git
- ✅ Use .env files (gitignored)
- ✅ Use platform environment variables (Render/Vercel)

### 3. Pre-commit Hooks
Install git-secrets or similar:
```bash
npm install --save-dev @commitlint/cli husky
# Configure to block commits with secrets
```

### 4. GitHub Secret Scanning
- Enable GitHub secret scanning (if not already)
- Set up notifications for detected secrets

### 5. Regular Security Audits
- Review git history monthly
- Audit all API keys quarterly
- Monitor Stripe logs weekly

---

## 📝 TIMELINE

| Time | Event |
|------|-------|
| Feb 7, 2026 22:57 | Key committed to git in LIVE_ENV_VARIABLES.md |
| Feb 7-8, 2026 | Key detected by Stripe scanners |
| Feb 8, 2026 | Stripe deactivates key and sends notification |
| Feb 8, 2026 | Investigation started |
| Feb 8, 2026 | CURRENT - Awaiting key rotation |

---

## ✅ CHECKLIST - Complete in Order

- [x] 1. Identify source of leak
- [ ] 2. Generate new Stripe API keys
- [ ] 3. Update Render environment variables
- [ ] 4. Update Vercel environment variables
- [ ] 5. Test payment processing works
- [ ] 6. Review Stripe logs for unauthorized activity
- [ ] 7. Update webhook secret
- [ ] 8. Test webhook endpoints
- [ ] 9. Clean git history (BFG or filter-branch)
- [ ] 10. Add security measures to prevent recurrence
- [ ] 11. Document incident in team records
- [ ] 12. Monitor for 48 hours

---

## 🆘 IMMEDIATE NEXT STEPS

**DO THIS NOW (in order):**

1. **Generate new Stripe keys** → https://dashboard.stripe.com/apikeys
2. **Update Render env vars** → https://dashboard.render.com
3. **Update Vercel env vars** → https://vercel.com/dashboard
4. **Check Stripe logs** → https://dashboard.stripe.com/logs
5. **Test payment flow** → Try creating a test subscription

**Estimated Recovery Time:** 15-30 minutes

---

**Status:** 🚨 AWAITING ACTION - Payment processing blocked until keys are rotated

**Priority:** CRITICAL - Revenue impact

**Assignee:** YOU - Do this immediately!
