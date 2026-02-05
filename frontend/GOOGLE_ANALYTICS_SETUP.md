# Google Analytics Setup - Quick Guide

## Step 1: Get Your Measurement ID

1. Go to https://analytics.google.com
2. Create account (if needed)
3. Create a GA4 property:
   - Property name: BookDigest
   - Select your timezone and currency
4. Create a Web data stream:
   - Website URL: https://bookdigest-iota.vercel.app
   - Stream name: BookDigest Web
5. Copy the MEASUREMENT ID (looks like: G-XXXXXXXXXX)

## Step 2: Add to Vercel

1. Go to https://vercel.com/dashboard
2. Select your bookdigest project
3. Go to Settings > Environment Variables
4. Add new variable:
   - Name: NEXT_PUBLIC_GA_MEASUREMENT_ID
   - Value: G-XXXXXXXXXX (your ID)
   - Environment: Production, Preview, Development
5. Click Save

## Step 3: Redeploy

Vercel will automatically redeploy with the new environment variable.

## Step 4: Verify (5 minutes after deploy)

1. Visit your site: https://bookdigest-iota.vercel.app
2. Go to GA4 Real-time reports
3. You should see yourself as an active user!

## What Gets Tracked:

✅ Page views (automatic)
✅ Book views (which books users read)
✅ Search queries (what they search for)
✅ User sessions
✅ Traffic sources
✅ User demographics

## View Reports:

- Real-time: See live users
- Engagement: Popular content
- Acquisition: Where users come from
- Events: Custom tracking data

All set! 🎉
