# Habit & Day Tracker

A minimalist iOS-widget-styled mobile habit tracker and year progress app built with React Native and Expo, inspired by `image.png`.

## 📱 Features

- **Tab 1: Habits**
  - **Quick Check-In Widget**: One-tap toggle button with streak tracking.
  - **30-Day Matrix Widget**: Minimalist circular dots (no numbers) that toggle when clicked.
  - **Custom Habit Switcher & Modals**: Add and delete habits using unified dark card modals.
- **Tab 2: Year Progress**
  - **Year Summary Widget**: Shows current day of year and days remaining.
  - **Full 19-Column Year Matrix**: All passed days are solid white dots (`#ffffff`), live day pulses, future days are muted gray dots.

---

## 🚀 Over-The-Air (OTA) Updates Setup with EAS

Every time you push code to `main`, GitHub Actions automatically publishes the new JavaScript bundle via **EAS Update**. Your installed app will download the update seamlessly without needing to reinstall.

### Step 1: Install EAS CLI & Log In
```bash
npm install -g eas-cli
eas login
```

### Step 2: Link Your Expo Project
Run inside this project directory:
```bash
eas init
```
*(This links the project to your Expo account and adds the `projectId` to `app.json`).*

### Step 3: Add `EXPO_TOKEN` to GitHub Secrets
1. Go to [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens) and create an Access Token.
2. In your GitHub repository:
   - Go to **Settings** → **Secrets and variables** → **Actions**.
   - Click **New repository secret**.
   - Name: `EXPO_TOKEN`
   - Value: paste your Expo access token.

### Step 4: Install the App on Your Phone Once

#### For Android (Direct APK):
```bash
eas build -p android --profile preview
```
Download the `.apk` directly to your phone and install it.

#### For iOS:
- Use internal distribution / ad-hoc profile with `eas build -p ios --profile preview` or install via Expo Go.

---

### 🔄 Automatic Updates
From now on, whenever you push any changes to `main`:
1. The GitHub Action in `.github/workflows/eas-update.yml` triggers.
2. EAS publishes the new update.
3. Next time you open the app on your phone, it automatically downloads and runs the latest version!
