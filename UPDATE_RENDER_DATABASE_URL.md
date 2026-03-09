# Update Render Backend to Use Supabase Database

**Issue:** Covers not loading properly because backend might still be pointing to old database URL

**Solution:** Update DATABASE_URL on Render to use Supabase connection string

---

## 🔧 **Steps to Fix:**

### **1. Go to Render Dashboard**
https://dashboard.render.com/

### **2. Click on your backend service**
(Probably named "bookdigest-backend")

### **3. Go to Environment tab**

### **4. Find DATABASE_URL and update it to:**

```
postgresql://postgres.ogrrtkutykmoobtcycfu:23021983Lazare.@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
```

### **5. Save Changes**

Render will automatically redeploy

### **6. Wait for deployment to complete**

Check the logs to see:
```
✔ Generated Prisma Client
Database synchronized
Server running on port 5000
```

---

## ✅ **Then Test:**

Visit: https://bookdigest-lypx.onrender.com/api/books?limit=5

Should return your 454 books from Supabase!

---

**Have you already updated the DATABASE_URL on Render?**

If yes, and covers still not working, then it's the OpenLibrary issue.

If no, that's the problem - update it now and covers should work!
