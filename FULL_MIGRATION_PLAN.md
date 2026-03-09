# Full Database Migration to Supabase - Step by Step

**Goal:** Migrate everything from localhost SQLite to Supabase PostgreSQL properly

---

## Phase 1: Schema Setup ✓

1. Switch to PostgreSQL schema
2. Push schema to Supabase (creates all tables with correct columns)
3. Verify schema is correct

---

## Phase 2: Data Export

Export from localhost SQLite:
- ✅ 454 Books (with Supabase cover URLs)
- ✅ 6 Users (with passwords, isPremium, etc.)
- ✅ 10 Categories
- ✅ Any reading progress/bookmarks

---

## Phase 3: Data Import

Import to Supabase PostgreSQL:
- Books → including new Supabase cover URLs
- Users → with all authentication data
- Categories
- Progress

---

## Phase 4: Production Update

1. Update Render DATABASE_URL → Supabase connection string
2. Redeploy backend
3. Test login
4. Test covers
5. Verify everything works

---

## Phase 5: Cleanup

- Switch localhost back to SQLite schema
- Test localhost still works
- Document the setup

---

**Current Step:** Phase 1 - Pushing schema to Supabase...
