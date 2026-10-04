import React from 'react';
import {
  loadHabitState,
  saveHabitState,
  toggleTodayHabit,
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
import { syncActiveWidgets } from './widgetSync';

export async function widgetTaskHandler(props) {
  const { widgetInfo, widgetAction, clickAction, clickActionData, renderWidget } = props;
  const { widgetName, widgetId, width, height } = widgetInfo;
  const today = new Date();
  const todayKey = getDateKey(today);

  let state;
  if (widgetAction === 'WIDGET_CLICK' && clickAction === 'TOGGLE_TODAY') {
    const targetId = clickActionData?.habitId;
    state = await toggleTodayHabit(targetId);
  } else {
    state = await loadHabitState();
  }

  const { hobbies, selectedHobbyId, widgetHabitMap = {} } = state;

  // Auto-assign newly added widgets if not assigned
  if (widgetAction === 'WIDGET_ADDED' && !widgetHabitMap[widgetId]) {
    widgetHabitMap[widgetId] = selectedHobbyId;
    await saveHabitState(hobbies, selectedHobbyId, widgetHabitMap);
  }

  const assignedHabitId =
    clickActionData?.habitId ||
    widgetHabitMap[widgetId] ||
    selectedHobbyId;

  const habit =
    hobbies.find((h) => h.id === assignedHabitId) ||
    state.selectedHobby ||
    hobbies[0] || { id: 'default', name: 'Habit', history: {} };

  const isDone = !!(habit?.history && habit.history[todayKey]);

  switch (widgetName) {
    case 'HabitCircleWidget': {
      renderWidget(
        <HabitCircleWidget
          habitId={habit.id}
          habitName={habit.name}
          isDone={isDone}
          width={width}
          height={height}
        />
      );
      break;
    }

    case 'HabitWideWidget': {
      const streak = calculateStreak(habit?.history, todayKey);
      renderWidget(
        <HabitWideWidget
          habitId={habit.id}
          habitName={habit.name}
          isDone={isDone}
          streak={streak}
          width={width}
          height={height}
        />
      );
      break;
    }

    case 'HabitCheckInWidget': {
      renderWidget(
        <HabitCheckInWidget
          habitId={habit.id}
          habitName={habit.name}
          isDone={isDone}
          width={width}
          height={height}
        />
      );
      break;
    }

    case 'Habit30DayWidget': {
      const past30Days = getPast30Days(habit?.history, today);
      const doneCount = past30Days.filter((d) => d.isDone).length;
      const percentage = Math.round((doneCount / 30) * 100);

      renderWidget(
        <Habit30DayWidget
          habitId={habit.id}
          habitName={habit.name}
          past30Days={past30Days}
          percentage={percentage}
          width={width}
          height={height}
        />
      );
      break;
    }

    case 'YearProgressWidget': {
      const yearMetrics = getYearMetrics(today);
      renderWidget(
        <YearProgressWidget
          {...yearMetrics}
          width={width}
          height={height}
        />
      );
      break;
    }

    default:
      break;
  }

  // If this was a click toggle, keep other active widgets in sync too
  if (widgetAction === 'WIDGET_CLICK') {
    syncActiveWidgets(hobbies, selectedHobbyId, widgetHabitMap);
  }
}
