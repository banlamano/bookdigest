# 🚀 DEPLOYMENT INSTRUCTIONS - Critical Fixes

## 📦 What's Being Deployed

### Critical Fixes:
1. ✅ **Auto-expire subscriptions** - Expired subscriptions automatically revert to FREE
2. ✅ **Fixed FreemiumStatus UI** - No longer shows for premium users
3. ✅ **Manual subscription sync** - New endpoint to verify with Stripe
4. ✅ **Book covers working** - Confirmed all covers are loading correctly

---

## 🔧 STEP 1: Deploy Backend to Render

### Option A: Automatic Deploy (Recommended)
```bash
git add .
git commit -m "Fix: Critical subscription auto-expiry and status sync issues"
git push origin main
```

Render will automatically detect the push and deploy.

### Option B: Manual Deploy via Render Dashboard
1. Go to https://dashboard.render.com
2. Find your backend service: `bookdigest`
3. Click "Manual Deploy" → "Deploy latest commit"

### Verify Backend Deployment
1. Wait for deploy to complete (~3-5 minutes)
2. Check: https://bookdigest-lypx.onrender.com/api/books
3. Should return books successfully ✅

---

## 🎨 STEP 2: Deploy Frontend to Vercel

### Option A: Automatic Deploy (Recommended)
Already done! Vercel auto-deploys on git push.

### Option B: Manual Deploy
1. Go to https://vercel.com/dashboard
2. Find your project: `bookdigest`
3. Click "Redeploy"

### Verify Frontend Deployment
1. Visit: https://bookdigest-iota.vercel.app
2. Check homepage loads ✅
3. Check book covers display ✅

---

## ✅ STEP 3: Test Critical Fixes in Production

### Test 1: Subscription Auto-Expiry
You'll need to test this after deployment with a real user account.

**Cannot test without database access**, but the logic is now in place:
- On login → checks expiry
- On auth → checks expiry
- On profile fetch → checks expiry

### Test 2: FreemiumStatus UI
1. Login as FREE user → Should see "3 books per month"
2. Login as PREMIUM user → Should NOT see FreemiumStatus card

### Test 3: Book Covers
1. Visit: https://bookdigest-iota.vercel.app
2. Browse books → All covers should load ✅
3. Click on any book → Cover should display ✅

### Test 4: Manual Subscription Sync (Optional)
**API Endpoint:** `POST https://bookdigest-lypx.onrender.com/api/users/verify-subscription`

Test with curl (requires auth token):
```bash
curl -X POST https://bookdigest-lypx.onrender.com/api/users/verify-subscription \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response:
```json
{
  "status": "success",
  "data": {
    "user": { ... },
    "synced": true/false,
    "message": "Subscription status message"
  }
}
```

---

## 🎯 STEP 4: Monitor Production

### What to Watch:
1. **User logins** - Check logs for "Subscription expired" messages
2. **Dashboard behavior** - Ensure correct plan shows
3. **Error rates** - Monitor for any auth errors

### Render Logs:
```bash
# View live logs
https://dashboard.render.com → Your Service → Logs
```

Look for log entries like:
```
Subscription expired for user: user@example.com, reverted to FREE
```

---

## 📊 EXPECTED BEHAVIOR AFTER DEPLOYMENT

### For FREE Users:
- ✅ See "Free Plan" in dashboard
- ✅ See "3 books per month" FreemiumStatus card
- ✅ Limited to 3 books/month
- ✅ Upgrade prompts visible

### For PREMIUM Users (Active):
- ✅ See "Premium Plan" in dashboard
- ✅ NO FreemiumStatus card shown
- ✅ Unlimited book access
- ✅ Shows renewal date
- ✅ Cancel subscription option

### For PREMIUM Users (Expired):
- ✅ Automatically reverted to FREE on login
- ✅ Shows as "Free Plan" in dashboard
- ✅ FreemiumStatus card appears
- ✅ Upgrade prompts visible

---

## 🔍 TROUBLESHOOTING

### Issue: User shows as FREE but should be PREMIUM
**Solution:** Have user call verify-subscription endpoint or re-login

### Issue: FreemiumStatus still showing for premium user
**Solution:** 
1. Check subscriptionEnd date in database
2. Ensure subscriptionEnd > current date
3. Clear browser cache
4. Hard refresh (Ctrl + F5)

### Issue: Covers not loading
**Solution:**
1. Check browser console for errors
2. Verify API is returning covers
3. Check Network tab for 404s

---

## 📝 ROLLBACK PLAN (If Needed)

If critical issues arise:

### Backend Rollback:
1. Go to Render Dashboard
2. Click on service → "Rollbacks"
3. Select previous deployment
4. Click "Rollback"

### Frontend Rollback:
1. Go to Vercel Dashboard
2. Click on deployment → "..."
3. Click "Promote to Production"
4. Select previous deployment

---

## ✨ POST-DEPLOYMENT CHECKLIST

- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Homepage loads without errors
- [ ] Book covers displaying correctly
- [ ] Login/Register working
- [ ] Dashboard loads for authenticated users
- [ ] FreemiumStatus shows correctly
- [ ] Subscription card displays correctly
- [ ] No console errors
- [ ] API responses are fast (<2s)

---

## 🎉 SUCCESS CRITERIA

All fixes are successful if:
1. ✅ Expired subscriptions auto-revert to FREE
2. ✅ Premium users don't see FreemiumStatus card
3. ✅ All book covers load correctly
4. ✅ No authentication errors
5. ✅ Dashboard shows correct subscription status

---

**Ready to Deploy!** 🚀

Just push to main and both services will auto-deploy.
