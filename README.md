# My Daily Hisab (আমার দৈনিক হিসাব)
Complete Production Android Studio Project built with Kotlin & Jetpack Compose.
Compatible with Android 10 (API 29) to Android 16 (API 36), including Redmi Note 14 Pro.

## Features Included:
- **Part 1**: Complete Gradle project with AGP 8.7.0, Kotlin 2.0.21, authentic Gradle Wrapper (8.9) and libs.versions.toml.
- **Part 2**: Minimal header "আমার দৈনিক হিসাব" with automatic network status dot (Green=Online, Red=Offline).
- **Part 3**: Google Sign-In via Android Credential Manager & Firebase Authentication.
- **Part 4**: Cloud Backup & Restore via Cloud Firestore. Room SQLite offline caching with automatic bidirectional sync.
- **Part 5**: Custom Profile page: upload picture, update name, view Google email, bio.
- **Part 6**: Permanent Light/Dark Mode (First launch = Light Mode, restored thereafter), Purple Quick Add FAB, Pink Savings, Orange Expenses. Strictly NO GREEN and NO GRADIENTS.

## How to Build in Android Studio:
1. Open Android Studio (Ladybug 2024.2+ or Koala).
2. Open this folder.
3. Gradle will sync with the included real gradle-wrapper.jar.
4. Run `./gradlew assembleDebug` for Debug APK or `./gradlew bundleRelease` for Release AAB!
