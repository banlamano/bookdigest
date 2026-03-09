# Get Admin Token - Edge & Firefox Guide

## Microsoft Edge Instructions

### Step 1: Login
1. Open Edge browser
2. Go to: **https://book-digest.com/login**
3. Enter your admin email and password
4. Click "Login"

### Step 2: Open Developer Tools
- Press **F12** on your keyboard
- OR Right-click anywhere → Click "Inspect"

Developer Tools will appear at the bottom or right side of the window.

### Step 3: Open Console
1. Look at the tabs at the top of Developer Tools
2. You'll see: Elements, Console, Sources, Network, etc.
3. Click on **"Console"**

### Step 4: Get the Token
1. You'll see a prompt that looks like: `>`
2. Click after the `>` symbol
3. Type (or paste):
   ```javascript
   localStorage.getItem('token')
   ```
4. Press **Enter**

### Step 5: Copy the Token
You'll see output like:
```
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhYmMxMjMiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzA5NTg0MDAwfQ.xyz789..."
```

**How to copy:**
1. Click on the long string (it will highlight)
2. Right-click → "Copy"
3. OR press **Ctrl + C**

**IMPORTANT:** 
- ❌ Don't copy the quotes: `"token here"`
- ✅ Only copy the token itself: `token here`

---

## Mozilla Firefox Instructions

### Step 1: Login
1. Open Firefox browser
2. Go to: **https://book-digest.com/login**
3. Enter your admin email and password
4. Click "Login"

### Step 2: Open Developer Tools
- Press **F12** on your keyboard
- OR Right-click anywhere → Click "Inspect Element"
- OR Press **Ctrl + Shift + I**

Developer Tools will appear at the bottom or right side.

### Step 3: Open Console
1. Look at the tabs: Inspector, Console, Debugger, etc.
2. Click on **"Console"**

### Step 4: Get the Token
1. You'll see a prompt that looks like: `>>`
2. Click after the `>>` symbol
3. Type (or paste):
   ```javascript
   localStorage.getItem('token')
   ```
4. Press **Enter**

### Step 5: Copy the Token
Firefox will show the result in **blue text**.

You'll see something like:
```
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**How to copy:**
1. Click on the blue text (it will be selected)
2. Right-click → "Copy"
3. OR press **Ctrl + C**

**IMPORTANT:** 
- Remove the quotes from both ends
- The token starts with `eyJ`
- It should be 100+ characters long

---

## What If You See `null`?

If the console shows `null` instead of a token, it means:
- You're not logged in
- OR the login didn't save the token properly

**Solution:**
1. Make sure you see your name/profile in the top-right corner
2. Try logging out and back in
3. Immediately after login, open Console and get the token

---

## Alternative Method: Application/Storage Tab

### For Edge:
1. Open Developer Tools (F12)
2. Click "Application" tab
3. In left sidebar, expand "Local Storage"
4. Click on "https://book-digest.com"
5. Find the row with Key: `token`
6. Double-click the Value column
7. Press Ctrl+A to select all, then Ctrl+C to copy

### For Firefox:
1. Open Developer Tools (F12)
2. Click "Storage" tab
3. In left sidebar, expand "Local Storage"
4. Click on "https://book-digest.com"
5. Find the row with Name: `token`
6. Right-click the Value → "Copy"

---

## Verify Your Token

After copying, paste it into Notepad and check:
- ✅ Should start with: `eyJ`
- ✅ Should have 2 dots (.) creating 3 parts
- ✅ Should be 100+ characters long
- ✅ Should NOT have quotes at start/end

Example of a CORRECT token:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhYmMxMjMiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzA5NTg0MDAwfQ.xyz789abcdefghijklmnopqrstuvwxyz
```

---

## Test Your Token

Paste this into PowerShell to verify it works:

```powershell
$token = "PASTE_YOUR_TOKEN_HERE"
$headers = @{"Authorization" = "Bearer $token"}
try {
    $response = Invoke-RestMethod -Uri "https://bookdigest-lypx.onrender.com/api/user/me" -Headers $headers
    Write-Host "✅ Token works! Logged in as: $($response.data.user.email)" -ForegroundColor Green
} catch {
    Write-Host "❌ Token doesn't work. Check if you copied it correctly." -ForegroundColor Red
}
```

If you see "✅ Token works!", you're ready to run the enable-audio script!

---

## Still Having Issues?

Take a screenshot of what you see and tell me:
1. Which browser you're using
2. What the Console shows when you type the command
3. Do you see your username in the top-right of book-digest.com?

I can help troubleshoot!
