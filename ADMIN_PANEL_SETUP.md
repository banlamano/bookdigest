# 🔐 Admin Panel Setup Guide

## ✅ What's Built

**Professional WordPress-style admin panel** with:
- Dashboard with statistics
- Books management (CRUD operations)
- Search and filter
- Bulk operations
- Secure authentication

---

## 🚀 How to Access

### 1. Set Admin Key in Environment

Add to your `.env` file (backend):
```
ADMIN_SECRET_KEY=your-secure-admin-key-here
```

**Generate a secure key:**
```bash
# Use a strong random string like:
admin_2024_SecureKey_RandomString123!
```

### 2. Deploy Backend

The admin panel routes are deployed when you push to GitHub.

Render will pick up the new routes automatically.

### 3. Access the Admin Panel

**URL:** https://bookdigest-iota.vercel.app/admin/dashboard

**Login:**
- You'll be prompted for an admin key
- Enter the same key you set in `ADMIN_SECRET_KEY`
- Click "Access Dashboard"

---

## 📊 Features

### Dashboard (`/admin/dashboard`)
- Total books, users, premium/free breakdown
- Books by category
- Quick actions (Add book, Manage covers, Fix summaries)

### Books Management (`/admin/books`)
- View all books with pagination (20 per page)
- Search by title/author
- Filter by category
- Edit book details (title, author, category, cover, premium status)
- Delete single books
- Bulk select and delete multiple books
- See summary status (✓ has summary, ✗ missing)

---

## 🔑 Admin Key Setup

### For Development (Local):

1. Create `backend/.env` (if not exists)
2. Add:
   ```
   ADMIN_SECRET_KEY=dev_admin_key_123
   ```

### For Production (Render):

1. Go to Render Dashboard
2. Find your backend service
3. Go to "Environment"
4. Add environment variable:
   - Key: `ADMIN_SECRET_KEY`
   - Value: `your-secure-production-key`
5. Save

---

## 📝 API Endpoints

All endpoints require `X-Admin-Key` header:

### Dashboard
```
GET /api/admin-panel/dashboard/stats
Headers: X-Admin-Key: your-admin-key
```

### Books
```
GET    /api/admin-panel/books?page=1&limit=20&search=query&category=Business
GET    /api/admin-panel/books/:id
POST   /api/admin-panel/books
PUT    /api/admin-panel/books/:id
DELETE /api/admin-panel/books/:id
```

### Bulk Operations
```
POST /api/admin-panel/books/bulk/delete
Body: { "bookIds": ["id1", "id2", "id3"] }

POST /api/admin-panel/books/bulk/update
Body: { "bookIds": ["id1", "id2"], "updates": { "isPremium": true } }
```

### Users
```
GET /api/admin-panel/users?page=1&limit=20
```

---

## 🎨 How to Use

### Login
1. Visit: `/admin/dashboard`
2. Enter admin key
3. Key is saved in localStorage
4. Auto-login on next visit

### Manage Books
1. Click "Books" in navigation
2. Search or filter books
3. Select books with checkboxes
4. Edit, delete, or bulk delete

### Edit Book
1. Click "Edit" on any book
2. Modal opens with book details
3. Modify title, author, category, cover URL, premium status
4. Click "Save Changes"

### Delete Books
1. **Single:** Click "Delete" button
2. **Bulk:** Select multiple books → "Delete Selected"

---

## 🔒 Security

**Current:**
- Simple admin key authentication
- Key stored in localStorage
- Sent via X-Admin-Key header

**Future Enhancements (TODO):**
- JWT token-based auth
- User roles (admin, editor, viewer)
- Session management
- Activity logging
- IP whitelisting

---

## ⚡ Next Steps

### Phase 2 (Not yet built):
- [ ] Cover management page
- [ ] Summary regeneration tools
- [ ] User management (edit, delete users)
- [ ] Analytics and reports
- [ ] Batch upload books
- [ ] Export data

### Currently Available:
- ✅ Dashboard with stats
- ✅ Books CRUD operations
- ✅ Search and filter
- ✅ Bulk delete
- ✅ Secure authentication

---

## 🧪 Testing Locally

1. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Visit:**
   http://localhost:3000/admin/dashboard

4. **Enter admin key:**
   Whatever you set in `ADMIN_SECRET_KEY`

---

## 🚀 Deployment

**Backend:**
- Set `ADMIN_SECRET_KEY` in Render environment variables
- Push to GitHub
- Render auto-deploys

**Frontend:**
- Push to GitHub
- Vercel auto-deploys
- Admin pages will be live at `/admin/*`

---

## 📱 Screenshots (What You'll See)

**Login Page:**
- Clean, centered login form
- Enter admin key
- "Access Dashboard" button

**Dashboard:**
- 4 stat cards (Total Books, Users, Premium, Free)
- Quick action buttons
- Books by category list

**Books Page:**
- Search bar and category filter
- Table with all books
- Checkboxes for bulk selection
- Edit and Delete buttons
- Pagination at bottom

---

## ✅ Ready to Use!

Once deployed:
1. Set ADMIN_SECRET_KEY in Render
2. Visit `/admin/dashboard`
3. Enter your admin key
4. Start managing your books!

---

*Professional admin panel with WordPress-style UI and full book management!* 🎉
