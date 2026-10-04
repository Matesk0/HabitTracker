# Habit & Day Tracker (Expo Mobile App & Widgets)

A minimalist iOS/Android-widget-styled mobile habit tracker and year progress application built with React Native and Expo.

---

## 📲 Instant Mobile Download & Install (Scan from PC)

Scan this QR code directly from your computer screen with your iPhone or Android camera to instantly open and install the app on your phone:

<div align="center">
  <img src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=https%3A%2F%2Fmatesk0.github.io%2FHabitTracker%2F" width="240" height="240" alt="HabitTracker Mobile Install QR Code" />
  <br/>
  <sub>👉 Or open directly on mobile: <b><a href="https://matesk0.github.io/HabitTracker/">https://matesk0.github.io/HabitTracker/</a></b></sub>
</div>

### 📥 Mobile Installation Steps:
- **iPhone (iOS)**: Scan with Camera → Open in Safari → Tap the **Share** button (box with arrow) → Tap **"Add to Home Screen"**.
- **Android**: Scan with Camera → Open in Chrome → Tap **"Install App"** (or 3 dots menu → **"Add to Home Screen"**).
- **Expo Go (Dev/Test)**: Run `npx expo start` in your terminal and scan the terminal QR code using Expo Go (Android) or Camera (iOS).

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
