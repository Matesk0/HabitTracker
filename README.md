# Habit & Day Tracker

A minimalist iOS-widget-styled mobile habit tracker and year progress app inspired by `image.png`.

## 📱 Features

- **Tab 1: Habits**
  - **Quick Check-In**: One-tap toggle button for today's status with streak tracking.
  - **30-Day Tracker**: Clean matrix of circular dots (no numbers) that toggle when tapped.
  - **Habit Switcher**: Add and manage custom habits with dark-themed modal dialogs.
- **Tab 2: Year Progress**
  - **Year Summary Widget**: Day of year and remaining days.
  - **19-Column Dot Grid**: All passed days glow solid white (`#ffffff`), live day pulses, future days are muted.

---

## 📲 Option 1: Install on Phone via PWA (Instant & Free Auto-Updates)

1. **Enable GitHub Pages on your repository**:
   - On GitHub: Go to your repo **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
2. **Open the site on your phone**:
   - Navigate to `https://<your-username>.github.io/HabitTracker/`
3. **Install as App**:
   - **iPhone (Safari)**: Tap the **Share** button (`⎋`) → Scroll down and tap **Add to Home Screen**.
   - **Android (Chrome)**: Tap the three dots (`⋮`) → Tap **Install App** or **Add to Home Screen**.
4. **Auto-Updates**:
   - Every time you push a commit to `main`, GitHub Actions automatically redeploys.
   - When you open the app on your phone, it seamlessly loads the latest version!

---

## 🚀 Option 2: Run / Update with Expo Go

### Local Testing:
```bash
npm install
npx expo start
```
Scan the QR code with **Expo Go** on your phone.

### Native Over-the-Air (OTA) Updates with EAS:
To publish updates directly to Expo without rebuilding:
```bash
npm install -g eas-cli
eas login
eas update --branch production --auto
```
