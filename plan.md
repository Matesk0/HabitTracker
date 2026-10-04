# HabitTracker — Architectural Audit & Future Evolution Plan

## 1. Executive Summary & Design Philosophy
HabitTracker is designed around the principles of **frictionless minimalism, instant feedback, and widget-first interaction**. The core objective is helping users maintain daily consistency with zero cognitive overhead.

---

## 2. Implemented in Current Release

### A. New Minimalist Home Screen Widgets
- **Small Habit Circle Widget (`HabitCircleWidget`)** *(Inspired by `small-habit.png`)*:
  - Ultra-compact 1x1 / 2x2 home screen widget.
  - Concentric target ring architecture: hollow circle in unchecked state, bold concentric double circle / target in completed state.
  - Tap-to-toggle directly from the Android home screen without opening the app.
- **Wide Habit Pill Widget (`HabitWideWidget`)** *(Inspired by `wide-habit.png`)*:
  - Wide 3x1 / 4x1 horizontal capsule widget (`borderRadius: 999`).
  - Circular checkbox on the left, high-legibility habit title in the center, and streak indicator on the right.
  - One-tap completion directly from the home screen.
- **Full 5-Widget Ecosystem**:
  1. `HabitCircleWidget` (1x1 Circle)
  2. `HabitWideWidget` (3x1 Pill)
  3. `HabitCheckInWidget` (2x2 Card Checkmark)
  4. `Habit30DayWidget` (3x2 30-Day Dot Matrix)
  5. `YearProgressWidget` (3x2 365-Day Dot Matrix)

### B. In-App View Modes & Live Widget Gallery
- **3 Dynamic View Modes**:
  - **30-Day Cards**: Full analytical view with quick daily toggle, completion percentage, and interactive 30-day ball grid.
  - **Wide Pills**: Minimalist capsule rows matching `wide-habit.png` for rapid daily check-ins.
  - **Circles**: Grid of concentric circle cards matching `small-habit.png`.
- **Interactive Widgets Tab**: Live interactive preview and widget habit assignment for both web PWA and mobile devices.

### C. Codebase Simplification & Streamlining
- Clean separation of concerns between core utility logic (`src/utils/habitUtils.js`), background native task execution (`src/widgets/widgetTaskHandler.js`), and cross-platform widget synchronization (`src/widgets/widgetSync.js`).
- Removal of redundant wrappers, dead styles, and unneeded dependencies.

---

## 3. Recommended Future Updates & Enhancements

### Priority 1: Tactile & Auditory Feedback
- **Haptic Feedback**: Integrate `expo-haptics` so toggling a habit triggers a subtle sensory tick (`Haptics.impactAsync(ImpactFeedbackStyle.Light)`).
- **Sound Effects**: Optional toggleable click sound when marking a habit complete.

### Priority 2: Data Portability & Safety
- **JSON Backup & Restore**: Add simple one-click export and import of all habit history to local files or clipboard.
- **Archive System**: Soft-delete/archive habits without losing historical check-in data.
- **Weekly / Monthly CSV Export**: Export logs for spreadsheets or personal data analytics.

### Priority 3: Advanced Widget Features
- **Individual Widget Configuration**: Implement `registerWidgetConfigurationScreen` in `react-native-android-widget` to allow assigning a different habit to each home screen widget upon placement.
- **iOS WidgetKit Extension**: Add native Swift WidgetKit extensions for iOS Lock Screen & Home Screen widgets.
- **Multi-Habit Wide Widget**: A 4x2 widget displaying a list of 3-4 habit pills in a single widget container.

### Priority 4: Smart Reminders & Scheduling
- **Local Push Notifications (`expo-notifications`)**: Gentle, privacy-preserving local daily reminders at a user-customized time (e.g. 8:00 PM) for uncompleted habits.
- **Habit Frequency Schedules**: Support for non-daily habits (e.g., 3 days per week, weekdays only).

### Priority 5: Visual Customization
- **Custom Accent Colors**: Allow users to assign distinct accent colors or monochrome themes to individual habits.
- **Year Matrix Heatmap**: Color-coded density for the year matrix depending on total habits completed per day.

---

## 4. Technical Architecture Roadmap
1. **TypeScript Migration**: Convert `.js` files to `.ts`/`.tsx` with strict type definitions for `HabitState`, `DayMetric`, and `WidgetPayload`.
2. **Offline-First Sync**: Retain ultra-fast AsyncStorage as primary source with optional encrypted cloud backup (e.g., Supabase / iCloud / Google Drive).
3. **Automated End-to-End Tests**: Minimalist `assert`-based test suite for habit streak calculations and leap year edge cases.
