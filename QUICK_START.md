# ⚡ Quick Start Guide - BookDigest Platform

Get your BookDigest platform running locally in under 30 minutes!

## 🎯 Prerequisites

Make sure you have these installed:
- **Node.js 18+** → [Download](https://nodejs.org/)
- **PostgreSQL 14+** → [Download](https://www.postgresql.org/download/)
- **Git** → [Download](https://git-scm.com/)

Optional (for mobile apps):
- **Android Studio** → [Download](https://developer.android.com/studio)
- **Xcode** (macOS only) → [Mac App Store](https://apps.apple.com/app/xcode/id497799835)

---

## 🚀 Setup in 5 Steps

### Step 1: Set Up Database

```bash
# Start PostgreSQL (if not running)
# macOS: brew services start postgresql
# Windows: Use pgAdmin or service manager

# Create database
psql -U postgres
CREATE DATABASE bookdigest;
\q
```

### Step 2: Configure Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env  # or use any text editor
```

**Minimum required in .env**:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/bookdigest"
JWT_SECRET="your-secret-key-change-this"
```

```bash
# Generate database tables
npx prisma migrate dev

# Optional: Seed with sample data
npx prisma db seed
```

### Step 3: Start Backend

```bash
npm run dev

# Backend running at: http://localhost:5000
# Test: curl http://localhost:5000/health
```

### Step 4: Configure & Start Frontend

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local
nano .env.local
```

**Required in .env.local**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
# Start frontend
npm run dev

# Frontend running at: http://localhost:3000
```

### Step 5: Open & Test

1. Open browser: **http://localhost:3000**
2. Click "Start Free Trial"
3. Create an account
4. Explore the platform! 🎉

---

## 📱 Mobile Apps (Optional)

### Android App

```bash
cd android-app

# Open in Android Studio
# File → Open → Select android-app folder

# Update API URL in app/build.gradle:
buildConfigField "String", "API_BASE_URL", "\"http://10.0.2.2:5000\""

# Click Run (green play button)
# Or: ./gradlew installDebug
```

### iOS App

```bash
cd ios-app/BookDigest

# Open in Xcode
open BookDigest.xcodeproj

# Update API URL in Config.swift
let apiBaseURL = "http://localhost:5000"

# Select simulator and click Run (▶️ button)
```

---

## 🎨 Add Sample Content

To test the platform with real data, add some sample books:

### Option 1: Using Prisma Studio (GUI)

```bash
cd backend
npx prisma studio

# Opens at: http://localhost:5555
# Click on tables to add data manually
```

### Option 2: Create Seed Script

Create `backend/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a category
  const category = await prisma.category.create({
    data: {
      name: 'Business',
      slug: 'business',
      color: '#0ea5e9',
      icon: 'briefcase',
      order: 1,
    },
  });

  // Create a sample book
  await prisma.book.create({
    data: {
      title: 'Atomic Habits',
      author: 'James Clear',
      coverImage: 'https://images-na.ssl-images-amazon.com/images/I/51Eqf-URhoL.jpg',
      summary: 'Atomic Habits is a comprehensive guide to breaking bad habits and adopting good ones...',
      keyInsights: [
        'Make it obvious: Design your environment to make good habits easier',
        'Make it attractive: Bundle habits you need to do with habits you want to do',
        'Make it easy: Reduce friction for good habits',
        'Make it satisfying: Use reinforcement to lock in habits',
      ],
      quotes: [
        'You do not rise to the level of your goals. You fall to the level of your systems.',
        'Every action you take is a vote for the type of person you wish to become.',
      ],
      readingTime: 15,
      rating: 4.8,
      ratingsCount: 1250,
      isPremium: false,
      isFeatured: true,
      isPublished: true,
      categoryId: category.id,
      tags: ['productivity', 'self-improvement', 'habits'],
      amazonLink: 'https://amzn.to/atomichabits',
      chapters: [
        {
          title: 'The Fundamentals',
          content: 'Why tiny changes make a big difference...',
        },
      ],
      actionItems: [
        'Start with a habit that takes less than 2 minutes',
        'Use habit stacking to build new routines',
        'Track your habits daily',
      ],
    },
  });

  console.log('✅ Sample data created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```bash
npx tsx prisma/seed.ts
```

---

## 🧪 Test Accounts

Create test accounts to try different features:

1. **Free User**:
   - Register with any email
   - Can access 3 books per month
   - Test the paywall

2. **Premium User**:
   - Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - Access all features

---

## ✅ Verify Everything Works

### Backend Health Check
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Test API Endpoints
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get books
curl http://localhost:5000/api/books
```

### Frontend Check
- Open http://localhost:3000
- Should see homepage with hero section
- Click around to test navigation

---

## 🐛 Troubleshooting

### "Database connection failed"
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify DATABASE_URL in .env
echo $DATABASE_URL
```

### "Port already in use"
```bash
# Backend (port 5000)
lsof -ti:5000 | xargs kill -9

# Frontend (port 3000)
lsof -ti:3000 | xargs kill -9
```

### "Module not found"
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Prisma client errors"
```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

---

## 🎓 Next Steps

Now that you're running locally:

1. **Explore the code**:
   - `frontend/src/app/` - Next.js pages
   - `backend/src/` - Express API
   - `backend/prisma/schema.prisma` - Database schema

2. **Customize**:
   - Update branding colors in `frontend/tailwind.config.js`
   - Modify features to fit your needs
   - Add more book categories

3. **Add content**:
   - Create book summaries
   - Record audio narrations
   - Build your library

4. **Deploy**:
   - See `DEPLOYMENT_GUIDE.md` for production setup
   - Follow `BUSINESS_STRATEGY.md` for monetization

---

## 📚 Documentation

- **Full README**: See root `README.md`
- **API Docs**: Check `backend/src/routes/` for endpoints
- **Database Schema**: See `backend/prisma/schema.prisma`
- **Business Strategy**: Read `BUSINESS_STRATEGY.md`
- **Deployment**: Check `DEPLOYMENT_GUIDE.md`

---

## 💡 Tips

- **Development Speed**: Use Prisma Studio for quick database edits
- **API Testing**: Use Postman or Thunder Client (VS Code extension)
- **Hot Reload**: Both frontend and backend support hot reload - just save and see changes!
- **Debugging**: Check terminal logs for errors
- **Git**: Commit your changes frequently

---

## 🎉 You're Ready!

You now have a fully functional book summary platform running locally! 

**Questions or issues?** Check the troubleshooting section or refer to the detailed documentation files.

**Ready to launch?** Head to `DEPLOYMENT_GUIDE.md` next!

Happy building! 🚀
