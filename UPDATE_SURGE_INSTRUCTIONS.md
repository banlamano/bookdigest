# 📝 UPDATE SURGE BOOK - STEP BY STEP

## ✅ CURRENT STATUS

**Book:** Surge by Mike Michalowicz  
**Book ID:** `cdd862b4-6956-4430-bf1f-f25df8bab67d`

**Current Amazon Link (BROKEN):**  
`https://www.amazon.com/s?k=Surge%20Mike%20Michalowicz%20ISBN%209781591847229&tag=bookdigest06-20`

**New Amazon Link (FIXED):**  
`https://www.amazon.com/Surge-Mike-Michalowicz/dp/1591847222?tag=bookdigest06-20`

---

## 🚀 HOW TO UPDATE IN RENDER DASHBOARD

### **Step 1: Login to Render**

1. Go to: https://dashboard.render.com/
2. Login with your account

### **Step 2: Find Your Database**

1. Click on your **PostgreSQL database** (usually named something like `bookdigest-db`)
2. Click on **"Shell"** tab or **"Connect"** section

### **Step 3: Run the SQL Update**

Copy and paste this EXACT command:

```sql
UPDATE "Book" 
SET "amazonLink" = 'https://www.amazon.com/Surge-Mike-Michalowicz/dp/1591847222?tag=bookdigest06-20'
WHERE "id" = 'cdd862b4-6956-4430-bf1f-f25df8bab67d';
```

### **Step 4: Verify**

After running the command, you should see:
```
UPDATE 1
```

This means 1 row was updated successfully! ✅

---

## 🔍 VERIFY THE FIX

After updating, check the book page:

1. Go to: https://bookdigest-iota.vercel.app/books/cdd862b4-6956-4430-bf1f-f25df8bab67d
2. Click the "Buy on Amazon" button
3. It should now go directly to the book product page (not search results)

---

## ❓ CAN'T ACCESS RENDER DASHBOARD?

**Alternative: I can help you create an authenticated API request**

If you prefer, you can:
1. Login to your site
2. Get your auth token
3. I'll create a script to update via API

Let me know if you need this option!

---

## ✅ AFTER THIS WORKS

Once we confirm this update works, we can:
1. Fix more books one by one using the same process
2. I'll analyze each book
3. You run the SQL update
4. We verify it works
5. Move to next book

**This is a proven, systematic approach!** 🚀

---

## 📋 QUICK REFERENCE

**SQL Template for future books:**

```sql
UPDATE "Book" 
SET "amazonLink" = 'NEW_AMAZON_LINK_HERE'
WHERE "id" = 'BOOK_ID_HERE';
```

Just replace:
- `NEW_AMAZON_LINK_HERE` with the correct Amazon link
- `BOOK_ID_HERE` with the book's UUID

---

**Ready to update? Let me know once you've run the SQL command and I'll help verify it worked!** ✅
