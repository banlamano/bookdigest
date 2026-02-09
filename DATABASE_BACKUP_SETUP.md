# 🔒 Database Backup Setup Guide

## 🎯 Goal
Set up automated daily backups of your PostgreSQL database to prevent data loss.

---

## 📋 Current Database Info

**Provider:** Neon (PostgreSQL)  
**Database URL:** `postgresql://neondb_owner:npg_p0UGL4bkOczZ@ep-gentle-frost-agzu0oxg-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require`

---

## ✅ **Option 1: Neon's Built-in Backups (EASIEST - Recommended)**

Neon provides automatic backups!

### Steps:
1. Go to: https://console.neon.tech/
2. Select your project
3. Click **"Settings"** → **"Storage"**
4. Look for **"Point-in-time restore"** or **"Backups"**

**Neon Free Tier:**
- ✅ Automatic backups (7 days retention)
- ✅ Point-in-time recovery
- ✅ No setup needed - it's automatic!

**Neon Paid Tier ($19/month):**
- ✅ 30 days retention
- ✅ Better performance

### Verify Backups Work:
1. In Neon console, check if "Branch" feature is available
2. Branches = backup snapshots
3. You can restore from any point in the last 7 days

---

## ✅ **Option 2: Manual Backup Script (FREE)**

If you want additional backups outside of Neon:

### Create Backup Script:

**File:** `backend/backup-database.js`

```javascript
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;
const BACKUP_DIR = path.join(__dirname, 'backups');

// Create backups directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);

console.log('🔄 Starting database backup...');

// Use pg_dump to create backup
exec(`pg_dump "${DATABASE_URL}" > "${backupFile}"`, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Backup failed:', error);
    return;
  }
  
  console.log(`✅ Backup completed: ${backupFile}`);
  
  // Clean up old backups (keep last 7 days)
  const files = fs.readdirSync(BACKUP_DIR);
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  files.forEach(file => {
    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);
    
    if (stats.mtimeMs < sevenDaysAgo) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Deleted old backup: ${file}`);
    }
  });
});
```

### Add to .gitignore:
```
backups/
*.sql
```

### Run Manually:
```bash
node backup-database.js
```

### Schedule Daily Backups (Render.com):
1. Go to Render Dashboard
2. Your backend service → **"Cron Jobs"**
3. Add new cron job:
   - **Command:** `node backup-database.js`
   - **Schedule:** `0 2 * * *` (2 AM daily)

---

## ✅ **Option 3: Backup to Cloud Storage (BEST)**

For production, back up to AWS S3 or Google Cloud Storage.

### Install AWS SDK:
```bash
npm install aws-sdk
```

### Backup to S3 Script:

**File:** `backend/backup-to-s3.js`

```javascript
const { exec } = require('child_process');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'eu-central-1'
});

const DATABASE_URL = process.env.DATABASE_URL;
const BUCKET_NAME = 'bookdigest-backups'; // Change this

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = `/tmp/backup-${timestamp}.sql`;
const s3Key = `database-backups/backup-${timestamp}.sql`;

console.log('🔄 Starting database backup to S3...');

// Create backup file
exec(`pg_dump "${DATABASE_URL}" > "${backupFile}"`, async (error) => {
  if (error) {
    console.error('❌ Backup failed:', error);
    return;
  }
  
  console.log('📦 Uploading to S3...');
  
  const fileContent = fs.readFileSync(backupFile);
  
  const params = {
    Bucket: BUCKET_NAME,
    Key: s3Key,
    Body: fileContent,
    ServerSideEncryption: 'AES256'
  };
  
  try {
    await s3.upload(params).promise();
    console.log(`✅ Backup uploaded to S3: ${s3Key}`);
    
    // Clean up local file
    fs.unlinkSync(backupFile);
  } catch (err) {
    console.error('❌ S3 upload failed:', err);
  }
});
```

---

## 🎯 **My Recommendation:**

**Use Neon's built-in backups (Option 1)** - It's:
- ✅ Already enabled (automatic)
- ✅ Free
- ✅ No setup needed
- ✅ Point-in-time recovery

**Plus:** Add Option 2 (manual script) for extra safety.

**Later:** Move to Option 3 (S3) when you scale.

---

## 📋 **Quick Checklist:**

- [ ] Verify Neon backups are enabled
- [ ] Test restore from Neon backup (create a branch)
- [ ] Create manual backup script (optional)
- [ ] Add backups/ to .gitignore
- [ ] Schedule daily backups (if using manual script)
- [ ] Test restore process once

---

## 🔥 **IMPORTANT: Test Your Backups!**

A backup you haven't tested is useless!

**Test Steps:**
1. In Neon console, create a new branch (this is a backup snapshot)
2. Connect to the branch
3. Verify data is there
4. Delete the test branch

---

**Status:** Ready to implement  
**Time:** 15 minutes  
**Next:** SEO Optimization
