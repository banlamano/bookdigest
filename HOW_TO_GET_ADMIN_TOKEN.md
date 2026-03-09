# How to Get Your Admin Token

## Step-by-Step Guide (With Screenshots Instructions)

### Step 1: Login to Your Site
1. Go to: **https://book-digest.com/login**
2. Enter your admin email and password
3. Click "Login"
4. You should be redirected to the homepage or dashboard

### Step 2: Open Browser Developer Tools
**Choose your browser:**

#### Google Chrome / Edge:
- Press **F12** on your keyboard
- OR Right-click anywhere → Select "Inspect"
- OR Menu (⋮) → More Tools → Developer Tools

#### Firefox:
- Press **F12** on your keyboard
- OR Right-click anywhere → Select "Inspect Element"
- OR Menu (≡) → More Tools → Web Developer Tools

#### Safari:
- First enable Developer menu: Safari → Preferences → Advanced → Check "Show Develop menu"
- Then: Develop → Show Web Inspector
- OR Press **Cmd + Option + I**

### Step 3: Go to Console Tab
1. In the Developer Tools panel (usually at bottom or right side)
2. Look for tabs like: Elements, Console, Network, etc.
3. Click on **"Console"** tab
4. You'll see a command prompt with `>`

### Step 4: Get the Token
1. In the Console, type (or copy-paste):
   ```javascript
   localStorage.getItem('token')
   ```
2. Press **Enter**
3. You'll see something like:
   ```
   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MDk1ODQwMDB9.abcdefghijklmnopqrstuvwxyz1234567890"
   ```

### Step 5: Copy the Token
1. The token is the long string **between the quotes**
2. **DON'T include the quotes!**
3. Right-click on the token → Copy
4. OR select all the text (without quotes) and Ctrl+C

**Example:**
- ✅ Correct: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOi...`
- ❌ Wrong: `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOi..."`

---

## Troubleshooting

### Problem: Console shows `null`
**Cause:** You're not logged in, or the token wasn't saved

**Solution:**
1. Make sure you're logged in (refresh the page)
2. Try logging out and back in
3. Check if you see your username/profile in the navbar
4. Try this command instead:
   ```javascript
   document.cookie
   ```
   Look for a token in the cookies

### Problem: Console shows error or nothing
**Cause:** You might be on the wrong page or not logged in

**Solution:**
1. Make sure you're on **book-digest.com** (not localhost)
2. Make sure you're logged in as admin
3. Refresh the page and try again

### Problem: Token is too short or looks weird
**Cause:** You might have copied it incorrectly

**A valid token should:**
- Be very long (100+ characters)
- Have three parts separated by dots (.)
- Look like: `xxxxx.yyyyy.zzzzz`
- Start with something like `eyJ`

---

## Alternative Method: Check Application Storage

If the Console method doesn't work:

### Step 1: Open Developer Tools (F12)

### Step 2: Go to "Application" Tab (Chrome/Edge)
- OR "Storage" tab (Firefox)

### Step 3: Find Local Storage
1. In left sidebar, expand "Local Storage"
2. Click on "https://book-digest.com"
3. Look for key: `token`
4. Copy the value (without quotes)

---

## Visual Guide

```
┌─────────────────────────────────────────────┐
│  Book Digest - Home                    🧑   │  ← You should be logged in
├─────────────────────────────────────────────┤
│                                             │
│  [Your website content]                     │
│                                             │
├─────────────────────────────────────────────┤
│  Developer Tools                            │  ← Press F12 to open this
├─────────────────────────────────────────────┤
│  Elements  Console  Network  Application   │
│           ^^^^^^^^                          │  ← Click Console tab
├─────────────────────────────────────────────┤
│  > localStorage.getItem('token')           │  ← Type this
│  "eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp..."      │  ← Copy this (no quotes)
│  >_                                         │
└─────────────────────────────────────────────┘
```

---

## Still Can't Find It?

### Option 1: Check if you're logged in
1. Look at the top-right corner of https://book-digest.com
2. Do you see your name/email or a "Profile" link?
3. If you see "Login" or "Sign Up", you're NOT logged in

### Option 2: Verify you're an admin
1. After logging in, try to access: https://book-digest.com/admin/dashboard
2. If you can see the admin panel, you're an admin
3. If you get "Access Denied", your account isn't admin

### Option 3: Contact me
If none of this works, let me know:
- What browser you're using
- What you see in the Console when you run the command
- Any error messages you get

---

## Quick Test

Before running the enable-audio script, test if your token works:

```powershell
$token = "PASTE_YOUR_TOKEN_HERE"
$headers = @{"Authorization" = "Bearer $token"}
$response = Invoke-RestMethod -Uri "https://bookdigest-lypx.onrender.com/api/user/me" -Headers $headers
Write-Host "Logged in as: $($response.data.user.email)"
```

If this works, you have the correct token!
