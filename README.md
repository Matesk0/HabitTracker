# Habit & Day Tracker

A minimalist iOS/Android-widget-styled mobile habit tracker and year progress app built with React Native and Expo.

## 📲 Instant Mobile Download / Web App (PWA)

Scan the QR code in the app or open the link below directly on your mobile browser (Safari on iOS or Chrome on Android) and tap **"Add to Home Screen"**:

👉 **[https://matesk0.github.io/HabitTracker/](https://matesk0.github.io/HabitTracker/)**

---

## 📱 Features

- **Habit Tracker**:
  - **Simultaneous Multi-Habit Overview**: View all your habits at once or filter by pill selection.
  - **Quick Daily Toggle**: Tap the status dot to mark today as complete.
  - **30-Day Matrix**: Minimalist circular dot matrix showing the last 30 days of consistency.
  - **Home Screen Widget Selector**: Choose which habit links to your Android home screen widgets.
  - **Custom Habit Management**: Add and delete custom habits.
- **Year Progress**:
  - **Full Year Dot Matrix**: Dynamic dot grid filling up as the year progresses.
  - Minimalist header with current date and year completion percentage.

---

## 📱 Home Screen Widgets (Android)

1. Build or download the native APK:
   ```bash
   eas build -p android --profile preview
   ```
2. Long-press on your home screen and select **Widgets** → **HabitTracker**:
   - **Habit 30-Day Matrix**: Interactive 30-day dot matrix with background tap-to-complete (no app launch required).
   - **Habit Checkmark Dot**: Ultra-compact dot widget with background tap-to-complete.
   - **Year Progress Matrix**: Date, year completion percentage, and 365-day dot grid.

---

## 🔄 Automatic Updates via EAS & GitHub Pages

- Pushing to `main` automatically deploys the web PWA to GitHub Pages and triggers over-the-air EAS updates for installed native builds.
