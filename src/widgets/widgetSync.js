import React from 'react';
import { Platform } from 'react-native';
import {
  getDateKey,
  getYearMetrics,
  getPast30Days,
  calculateStreak,
} from '../utils/habitUtils';
import { HabitCircleWidget } from './HabitCircleWidget';
import { HabitWideWidget } from './HabitWideWidget';
import { HabitCheckInWidget } from './HabitCheckInWidget';
import { Habit30DayWidget } from './Habit30DayWidget';
import { YearProgressWidget } from './YearProgressWidget';

export function syncActiveWidgets(hobbies = [], selectedHobbyId, widgetHabitMap = {}) {
  if (Platform.OS !== 'android') return;

  try {
    const { requestWidgetUpdate } = require('react-native-android-widget');
    if (typeof requestWidgetUpdate !== 'function') return;

    const today = new Date();
    const todayKey = getDateKey(today);
    const yearMetrics = getYearMetrics(today);

    const resolveHabit = (widgetId) => {
      const habitId = widgetHabitMap[widgetId] || selectedHobbyId;
      return (
        hobbies.find((h) => h.id === habitId) ||
        hobbies[0] || { id: 'default', name: 'Habit', history: {} }
      );
    };

    // 1. Small Habit Circle Widget (small-habit.png)
    requestWidgetUpdate({
      widgetName: 'HabitCircleWidget',
      renderWidget: (widgetInfo) => {
        const habit = resolveHabit(widgetInfo?.widgetId);
        const isDone = !!(habit?.history && habit.history[todayKey]);
        return (
          <HabitCircleWidget
            habitId={habit.id}
            habitName={habit.name}
            isDone={isDone}
            width={widgetInfo?.width}
            height={widgetInfo?.height}
          />
        );
      },
    }).catch(() => {});

    // 2. Wide Habit Pill Widget (wide-habit.png)
    requestWidgetUpdate({
      widgetName: 'HabitWideWidget',
      renderWidget: (widgetInfo) => {
        const habit = resolveHabit(widgetInfo?.widgetId);
        const isDone = !!(habit?.history && habit.history[todayKey]);
        const streak = calculateStreak(habit?.history, todayKey);
        return (
          <HabitWideWidget
            habitId={habit.id}
            habitName={habit.name}
            isDone={isDone}
            streak={streak}
            width={widgetInfo?.width}
            height={widgetInfo?.height}
          />
        );
      },
    }).catch(() => {});

    // 3. Compact Habit Checkmark Widget
    requestWidgetUpdate({
      widgetName: 'HabitCheckInWidget',
      renderWidget: (widgetInfo) => {
        const habit = resolveHabit(widgetInfo?.widgetId);
        const isDone = !!(habit?.history && habit.history[todayKey]);
        return (
          <HabitCheckInWidget
            habitId={habit.id}
            habitName={habit.name}
            isDone={isDone}
            width={widgetInfo?.width}
            height={widgetInfo?.height}
          />
        );
      },
    }).catch(() => {});

    // 4. Habit 30-Day Matrix Widget
    requestWidgetUpdate({
      widgetName: 'Habit30DayWidget',
      renderWidget: (widgetInfo) => {
        const habit = resolveHabit(widgetInfo?.widgetId);
        const past30Days = getPast30Days(habit?.history, today);
        const doneCount = past30Days.filter((d) => d.isDone).length;
        const percentage = Math.round((doneCount / 30) * 100);
        return (
          <Habit30DayWidget
            habitId={habit.id}
            habitName={habit.name}
            past30Days={past30Days}
            percentage={percentage}
            width={widgetInfo?.width}
            height={widgetInfo?.height}
          />
        );
      },
    }).catch(() => {});

    // 5. Year Progress Dot Matrix Widget
    requestWidgetUpdate({
      widgetName: 'YearProgressWidget',
      renderWidget: (widgetInfo) => (
        <YearProgressWidget
          {...yearMetrics}
          width={widgetInfo?.width}
          height={widgetInfo?.height}
        />
      ),
    }).catch(() => {});
  } catch (e) {
    // Gracefully handle Expo Go where native widgets are not bundled
  }
}
