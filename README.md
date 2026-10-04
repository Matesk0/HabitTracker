# Habit & Day Tracker (Expo Mobile App & Widgets)

A minimalist iOS/Android-widget-styled mobile habit tracker and year progress application built with React Native and Expo.

---

## 📱 Features

- **5 Native Android Home Screen Widgets**:
  - 🔘 **Small Habit (Circle)**: Minimalist 1x1 concentric circle widget with background tap-to-complete.
  - 💊 **Wide Habit (Pill)**: Sleek 3x1 capsule widget with checkbox, habit title, and streak counter.
  - 🔲 **Habit Checkmark Card**: Compact 2x2 card widget with status toggle.
  - 📊 **Habit 30-Day Matrix**: Interactive 3x2 dot matrix showing past 30 days consistency.
  - 📅 **Year Progress Matrix**: 3x2 dot matrix displaying year completion percentage and 365-day grid.
- **3 Dynamic In-App Views**:
  - **30-Day Cards**: Comprehensive view with 30-day dot grid and today toggle.
  - **Wide Pills**: Minimalist capsule list for rapid daily check-ins.
  - **Circles**: Grid of concentric circle cards.
- **Interactive Widgets Tab**: In-app live preview and widget habit assignment.
- **Year Progress Tab**: Dynamic dot matrix tracking the current day and annual progress.
- **Custom Habit Management**: Add, delete, and filter habits with persistent offline storage.

---

## 🚀 Run & Install on Mobile via QR Code (Expo Go)

1. Install **Expo Go** on your device ([Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) or [App Store](https://apps.apple.com/app/expo-go/id982107779)).
2. Start the development server:
   ```bash
   npx expo start
   ```
3. **Scan the QR code**:
   - **Android**: Scan with the Expo Go app.
   - **iOS**: Scan with the Camera app.

---

## 📲 Instant Web App / PWA Install

Open the live web version directly on your device and tap **"Add to Home Screen"**:

👉 **[https://matesk0.github.io/HabitTracker/](https://matesk0.github.io/HabitTracker/)**

---

## 📱 Android Home Screen Widgets Setup

1. Build the standalone preview APK with widget support:
   ```bash
   eas build -p android --profile preview
   ```
2. On your Android home screen:
   - Long-press the home screen → Tap **Widgets** → Select **HabitTracker**.
   - Choose your preferred widget style: **Small Habit (Circle)**, **Wide Habit (Pill)**, **Habit 30-Day Matrix**, **Habit Checkmark**, or **Year Progress**.
   - Tapping the widgets toggles habits directly on your home screen without opening the app!

---

## 🔄 Automatic OTA Updates via EAS

Pushing changes to `main` automatically publishes JavaScript updates over-the-air via EAS Update and deploys the web PWA to GitHub Pages.
