import React from 'react';
import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import {
  getDateKey,
  getYearMetrics,
  getPast30Days,
} from '../utils/habitUtils';
import { HabitCheckInWidget } from './HabitCheckInWidget';
import { Habit30DayWidget } from './Habit30DayWidget';
import { YearProgressWidget } from './YearProgressWidget';

export function syncActiveWidgets(hobbies = [], selectedHobbyId, widgetHabitMap = {}) {
  if (Platform.OS !== 'android') return;

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

  try {
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
    console.warn('Widget sync error:', e);
  }
}
