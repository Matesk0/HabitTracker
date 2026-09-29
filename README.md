# Habit & Day Tracker (Expo Mobile App)

A minimalist iOS/Android-widget-styled mobile habit tracker and year progress app built with React Native and Expo.

## 🚀 Run & Install on Mobile via QR Code (Expo Go)

1. Make sure you have the **Expo Go** app installed on your phone ([Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) or [App Store](https://apps.apple.com/app/expo-go/id982107779)).
2. Start the Expo development server:
   ```bash
   npx expo start
   ```
3. **Scan the QR code** printed in your terminal:
   - **Android**: Scan with the Expo Go app.
   - **iOS**: Scan with the default Camera app.

The app will instantly open and run on your device!

---

## 📲 Instant Web App / PWA Install (No App Store Needed)

You can also open the live web version directly in your mobile browser and select **"Add to Home Screen"**:

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

## 📱 Android Home Screen Widgets

1. For native home screen widgets, build the preview APK:
   ```bash
   eas build -p android --profile preview
   ```
2. Long-press on your home screen and select **Widgets** → **HabitTracker**:
   - **Habit 30-Day Matrix**: Interactive 30-day dot matrix with background tap-to-complete.
   - **Habit Checkmark Dot**: Compact dot widget with background tap-to-complete.
   - **Year Progress Matrix**: Date, year percentage, and 365-day dot grid.

---

## 🔄 Automatic OTA Updates via EAS

Pushing changes to `main` automatically publishes JavaScript updates over-the-air via EAS Update and deploys the web PWA to GitHub Pages.
