# BookDigest - Android App

Native Android application for the BookDigest platform built with Jetpack Compose and modern Android development practices.

## 🛠️ Tech Stack

- **Kotlin** - Primary programming language
- **Jetpack Compose** - Modern UI toolkit
- **Hilt** - Dependency injection
- **Retrofit** - REST API client
- **Room** - Local database
- **ExoPlayer** - Audio playback
- **Coroutines & Flow** - Asynchronous programming
- **Material 3** - Design system
- **Coil** - Image loading
- **DataStore** - Data persistence

## 🏗️ Architecture

The app follows **MVVM (Model-View-ViewModel)** architecture with Clean Architecture principles:

```
app/
├── data/
│   ├── local/        # Room database, DataStore
│   ├── remote/       # Retrofit API services
│   ├── repository/   # Repository implementations
│   └── model/        # Data models
├── domain/
│   ├── model/        # Domain models
│   ├── repository/   # Repository interfaces
│   └── usecase/      # Business logic
├── ui/
│   ├── screens/      # Compose screens
│   ├── components/   # Reusable UI components
│   ├── navigation/   # Navigation setup
│   └── theme/        # Theme & styling
├── di/               # Dependency injection modules
└── service/          # Background services
```

## 📋 Prerequisites

- Android Studio Hedgehog (2023.1.1) or later
- JDK 17
- Android SDK 34
- Minimum Android version: 7.0 (API 24)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bookdigest/android-app
```

### 2. Configure API Endpoint

Update the API base URL in `app/build.gradle`:

```gradle
buildConfigField "String", "API_BASE_URL", "\"https://api.bookdigest.com\""
```

For local development:
```gradle
buildConfigField "String", "API_BASE_URL", "\"http://10.0.2.2:5000\""
```

### 3. Add Required API Keys

Create `local.properties` in the root directory:

```properties
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
GOOGLE_BOOKS_API_KEY=your_google_books_api_key
```

### 4. Build & Run

Open the project in Android Studio and click **Run** or use:

```bash
./gradlew assembleDebug
./gradlew installDebug
```

## 📦 Key Features Implemented

### ✅ Core Features
- User authentication (register, login, profile)
- Browse book library with filters
- Search functionality
- Book details with summary, insights, and quotes
- Audio playback with controls
- Reading progress tracking
- Favorites/bookmarks
- User dashboard with stats
- Dark/Light theme support

### ✅ Premium Features
- Subscription management (Stripe integration)
- Offline access (Room database)
- Audio downloads
- Ad-free experience

### ✅ Additional Features
- Material 3 design
- Smooth animations
- Pull-to-refresh
- Error handling & retry mechanisms
- Network connectivity monitoring
- Background audio playback

## 🎨 UI Components

### Screens
- **Splash Screen** - App initialization
- **Onboarding** - First-time user experience
- **Auth Screens** - Login & Registration
- **Home** - Featured books and recommendations
- **Library** - Browse all books with filters
- **Book Detail** - Complete book information
- **Audio Player** - Full-featured audio controls
- **Dashboard** - User stats and progress
- **Profile** - Account settings
- **Subscription** - Premium plans

### Reusable Components
- `BookCard` - Book display card
- `AudioPlayerBar` - Mini audio player
- `SearchBar` - Custom search input
- `FilterChips` - Category filters
- `StatCard` - Statistics display
- `RatingBar` - Star ratings

## 🔐 Security

- Secure token storage using DataStore
- HTTPS only in production
- Certificate pinning for API calls
- ProGuard/R8 for code obfuscation
- No sensitive data in logs (production)

## 🧪 Testing

Run unit tests:
```bash
./gradlew test
```

Run instrumented tests:
```bash
./gradlew connectedAndroidTest
```

## 📱 Building for Release

### Generate Signed APK

1. Create keystore:
```bash
keytool -genkey -v -keystore bookdigest.keystore -alias bookdigest -keyalg RSA -keysize 2048 -validity 10000
```

2. Add to `gradle.properties`:
```properties
KEYSTORE_FILE=../bookdigest.keystore
KEYSTORE_PASSWORD=your_password
KEY_ALIAS=bookdigest
KEY_PASSWORD=your_password
```

3. Build release:
```bash
./gradlew assembleRelease
```

### Publish to Google Play

1. Create app bundle:
```bash
./gradlew bundleRelease
```

2. Upload `app/build/outputs/bundle/release/app-release.aab` to Play Console

## 📄 Required Files for Play Store

- App icon (512x512 PNG)
- Feature graphic (1024x500 PNG)
- Screenshots (phone & tablet)
- Privacy policy URL
- App description & keywords
- Content rating questionnaire

## 🐛 Troubleshooting

### Common Issues

**API Connection Failed**
- Check if backend server is running
- Verify API_BASE_URL in build.gradle
- For emulator, use `10.0.2.2` instead of `localhost`

**Build Errors**
- Clean project: `./gradlew clean`
- Invalidate caches in Android Studio
- Check Gradle JDK version (should be 17)

**Audio Playback Issues**
- Verify INTERNET permission in manifest
- Check audio URL accessibility
- Clear app data and retry

## 📚 Documentation

- [Jetpack Compose](https://developer.android.com/jetpack/compose)
- [Hilt Documentation](https://dagger.dev/hilt/)
- [ExoPlayer Guide](https://exoplayer.dev/)
- [Material 3 Guidelines](https://m3.material.io/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit your changes
4. Push to the branch
5. Create Pull Request

## 📄 License

Proprietary - All rights reserved
