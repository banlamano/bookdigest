# How to Get Supabase Service Role Key

## Step-by-Step Instructions

### 1. Go to Supabase Dashboard
Open in your browser:
```
https://supabase.com/dashboard/project/ogrrtkutykmoobtcycfu/settings/api
```

Or manually:
1. Go to: https://supabase.com/dashboard
2. Click on your "bookdigest" project
3. Click "Settings" (gear icon in left sidebar)
4. Click "API" in the settings menu

### 2. Find the Service Role Key

On the API settings page, you'll see:

**Project API keys**

There are two keys:

1. **anon / public** 
   - This is safe to use in frontend code
   - ❌ Don't use this one

2. **service_role** ⭐
   - Says: "secret" with asterisks `**** **** ****`
   - Has a "Reveal" button
   - ✅ This is what you need

### 3. Reveal and Copy

1. Click the **"Reveal"** button next to `service_role`
2. The key will appear (starts with `eyJ...`)
3. Click the **copy icon** to copy it
4. It will look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...` (very long)

### 4. Paste into .env.supabase

Open: `backend/.env.supabase`

Replace:
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

With:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```
(paste your actual key)

Save the file.

---

## Security Warning from Supabase

You'll see this warning:
> "This key has the ability to bypass Row Level Security. Never share it publicly."

**That's normal!** We need this key to upload covers to Supabase Storage.

**We're keeping it safe by:**
- ✅ Storing it in `.env.supabase` (not committed to git)
- ✅ Only using it in a local script (not in frontend code)
- ✅ Added `.env.supabase` to `.gitignore`

---

## After You Have the Key

1. Paste it into `backend/.env.supabase`
2. Save the file
3. Tell me "done"
4. I'll run the script to migrate all covers

---

**Having trouble?** Tell me what you see on the Supabase API settings page.
