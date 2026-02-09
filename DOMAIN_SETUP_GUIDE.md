# 🌐 book-digest.com Setup Guide

## 🎯 Goals
1. Connect domain to Vercel (so website works on book-digest.com)
2. Verify domain with Resend (so emails work)
3. Update app configuration

---

## Part 1: Connect Domain to Vercel (10 min)

### Step 1: Add Domain to Vercel

1. **Go to:** https://vercel.com/dashboard
2. **Click** your project: `bookdigest`
3. **Click** "Settings" tab
4. **Click** "Domains" in left sidebar
5. **Click** "Add" button
6. **Enter:** `book-digest.com`
7. **Click** "Add"

Vercel will show you DNS records to add.

---

### Step 2: Add DNS Records to IONOS

1. **Go to:** https://www.ionos.com/
2. **Login** to your account
3. **Go to:** Domains → book-digest.com → DNS Settings
4. **Add these records from Vercel:**

**Record 1 (A Record for root domain):**
- Type: `A`
- Name: `@` (or leave blank)
- Value: `76.76.21.21` (Vercel's IP)
- TTL: `3600`

**Record 2 (CNAME for www):**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`
- TTL: `3600`

5. **Save changes**
6. **Wait:** 10-30 minutes for DNS propagation

---

### Step 3: Verify on Vercel

After 10-30 minutes:
1. Go back to Vercel → Domains
2. You should see ✅ next to `book-digest.com`
3. Test: Visit https://book-digest.com (should show your site!)

---

## Part 2: Verify Domain with Resend (10 min)

### Step 1: Add Domain to Resend

1. **Go to:** https://resend.com/domains
2. **Click:** "Add Domain"
3. **Enter:** `book-digest.com`
4. **Click:** "Add Domain"

Resend will show you 3 DNS records.

---

### Step 2: Add Email DNS Records to IONOS

Go back to IONOS DNS Settings and add these 3 records:

**Record 1 (SPF - Sender Policy Framework):**
- Type: `TXT`
- Name: `@` (or `book-digest.com`)
- Value: `v=spf1 include:_spf.resend.com ~all`
- TTL: `3600`

**Record 2 (DKIM - DomainKeys Identified Mail):**
- Type: `TXT`
- Name: `resend._domainkey`
- Value: (Copy the long key from Resend - starts with `p=...`)
- TTL: `3600`

**Record 3 (DMARC - Domain-based Message Authentication):**
- Type: `TXT`
- Name: `_dmarc`
- Value: `v=DMARC1; p=none; rua=mailto:dmarc@book-digest.com`
- TTL: `3600`

**Save all changes!**

---

### Step 3: Wait for Verification

1. **Wait:** 10-30 minutes
2. **Go to:** Resend → Domains
3. **Check:** Status should change to ✅ "Verified"
4. **If not verified:** Click "Refresh" or "Check DNS"

---

## Part 3: Update Your App (5 min)

### Step 1: Update Environment Variables on Render

1. **Go to:** https://dashboard.render.com/
2. **Click** your backend service
3. **Click** "Environment"
4. **Find** `FROM_EMAIL` variable
5. **Update value to:** `BookDigest <hello@book-digest.com>`
6. **Click** "Save Changes" (will redeploy)

---

### Step 2: Update Frontend URL (Optional)

If you want the frontend on book-digest.com too:

1. **Vercel:** Add `book-digest.com` to frontend project
2. **Update** `NEXT_PUBLIC_API_URL` if needed

---

## Part 4: Test Everything (5 min)

### Test 1: Website

1. Visit: https://book-digest.com
2. Should show your BookDigest website ✅

### Test 2: Email

1. Register a new user on book-digest.com
2. Check email inbox for welcome email
3. Should receive email from `hello@book-digest.com` ✅

### Test 3: Email Script

Run locally:
```bash
cd backend
node test-email.js
```

Should work and send to any email! ✅

---

## 🎯 Final Checklist

- [ ] Domain added to Vercel
- [ ] DNS A record added to IONOS
- [ ] DNS CNAME record added to IONOS
- [ ] book-digest.com shows website
- [ ] Domain added to Resend
- [ ] SPF record added to IONOS
- [ ] DKIM record added to IONOS
- [ ] DMARC record added to IONOS
- [ ] Resend shows domain as verified
- [ ] FROM_EMAIL updated on Render
- [ ] Backend redeployed
- [ ] Test email sent successfully
- [ ] Welcome email works for new users

---

## ⏱️ Timeline

- **Now:** Add domain to Vercel & Resend (5 min)
- **Now:** Add all DNS records to IONOS (10 min)
- **Wait:** 10-30 min for DNS propagation
- **Then:** Update FROM_EMAIL and test (5 min)
- **Total:** ~30-45 minutes

---

## 🆘 Troubleshooting

**Domain not showing on Vercel?**
- Wait longer (DNS can take up to 48 hours, usually 30 min)
- Check DNS records are correct
- Use https://dnschecker.org to verify propagation

**Resend not verified?**
- Wait longer (usually 10-30 min)
- Click "Refresh" in Resend dashboard
- Verify DNS records in IONOS match exactly
- Check for typos in record values

**Emails not sending?**
- Make sure Resend shows ✅ Verified
- Check FROM_EMAIL uses new domain
- Backend redeployed after change
- Check Render logs for errors

---

**Status:** Ready to start!  
**Next:** Add domain to Vercel, then add DNS records to IONOS
