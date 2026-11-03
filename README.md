# My Daily Hisab (আমার দৈনিক হিসাব)

A complete, luxury daily expense & income tracker and room ledger application. Built with **React 19 + TypeScript + Vite + Tailwind CSS** for the Web, alongside a native **Android Studio Project (Kotlin + Jetpack Compose + Room + Firebase)**.

---

## 🌟 Key Features

1. **Daily Financial Management**:
   - Track Daily Income, Expenses, and Savings.
   - Categorize transactions with custom or preset categories.
   - Room Ledger & Split Bill tracking for shared accommodation expenses.
   - Comprehensive Reports & Analytics with category distribution and monthly trends.

2. **Luxury Minimal UI & Theme System**:
   - Obsidian Black & Velvet Purple luxury design.
   - Strictly **NO Green** and **NO Gradients** as per user design guidelines.
   - Accent colors: Velvet Purple (`#7C3AED`), Vivid Magenta (`#D946EF`), and Radiant Orange (`#F97316`).
   - Permanent Light/Dark Mode preference: Starts in clean Light Mode on first launch, remembers user choice thereafter.
   - Immersive full-screen support on Android (`BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE`).

3. **Cloud Sync & Offline-First Storage**:
   - Google Sign-In using Credential Manager & Firebase Authentication.
   - Cloud Firestore backup and sync with automatic offline conflict resolution.
   - SQLite Room database for local native Android caching.
   - Real-time connection status indicator (Online / Offline / Syncing).

4. **Multi-Language Support**:
   - Full bilingual support in Bengali (বাংলা) and English.

---

## 📁 Project Structure

```
├── android/                         # Complete Native Android Studio Project
│   ├── app/
│   │   ├── build.gradle.kts         # Target SDK 35 (Android 10 - 16 compatible)
│   │   ├── google-services.json     # Firebase Android Client configuration
│   │   └── src/main/
│   │       ├── AndroidManifest.xml  # Manifest with permissions & activities
│   │       ├── java/com/mydailyhisab/app/
│   │       │   ├── MainActivity.kt  # Immersive full-screen Jetpack Compose entry
│   │       │   ├── data/            # Room Database & Repository
│   │       │   ├── ui/              # Compose Screens, Navigation & Theme
│   │       │   └── viewmodel/       # Android Architecture ViewModels
│   │       └── res/                 # Vector drawables, strings (en & bn), colors
│   ├── gradle/wrapper/
│   │   ├── gradle-wrapper.jar       # Authentic binary Gradle 8.9 wrapper
│   │   └── gradle-wrapper.properties
│   ├── build.gradle.kts             # Top-level Gradle build configuration
│   ├── settings.gradle.kts          # Plugin management and repository config
│   ├── gradle.properties            # JVM arguments and AndroidX flags
│   ├── gradlew                      # Linux / macOS Gradle executable
│   └── gradlew.bat                  # Windows Gradle executable
│
├── src/                             # Full React + TypeScript Web Application
│   ├── components/                  # UI Components, Screens, and Modals
│   ├── data/                        # Preset Bengali & English categories
│   ├── services/                    # Firebase Auth & Firestore Sync service
│   ├── types/                       # TypeScript interfaces for financial models
│   ├── utils/                       # Translations, APK / ZIP generators
│   ├── App.tsx                      # Main Application Component
│   ├── index.css                    # Tailwind CSS 4 luxury styling
│   └── main.tsx                     # React DOM entry point
│
├── public/                          # Public static assets & downloadable ZIP
├── package.json                     # Web app dependencies & build scripts
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite build configuration
├── firestore.rules                  # Secure Firebase Firestore security rules
├── firebase-blueprint.json          # Firebase schema definition
└── metadata.json                    # AI Studio app metadata
```

---

## 🚀 How to Run & Build the Web Application

### Prerequisites
- Node.js 18+ or 20+
- npm, yarn, or pnpm

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```
The optimized production bundle will be output to the `dist/` directory.

### 4. Type Checking / Linting
```bash
npm run lint
```

---

## 📱 How to Open & Build the Native Android App

### Prerequisites
- Android Studio Ladybug (2024.2+) or Koala / Iguana
- JDK 17 (Java 17)
- Android SDK Platform 35

### 1. Open in Android Studio
1. Launch Android Studio.
2. Select **Open** and choose the `android` directory from this project.
3. Android Studio will automatically recognize Gradle and run the sync using the included `gradle/wrapper/gradle-wrapper.jar`.

### 2. Build Debug APK via Command Line
```bash
cd android
./gradlew assembleDebug
```
The APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

### 3. Build Release Bundle (AAB) for Google Play
```bash
cd android
./gradlew bundleRelease
```
The AAB will be generated at:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 🔒 Security & Firebase Configuration

- Firestore rules ensure that each user can only read and write their own financial records:
  ```
  match /users/{userId}/{document=**} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
  ```
- No financial or authentication credentials are leaked or stored in plain text.
- Google Sign-In is managed via standard OAuth 2.0 Credential Manager tokens.

---

## 📄 License
Apache License 2.0. Built for My Daily Hisab.
