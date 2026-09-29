import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEY = '@habit_tracker_state_v3';
export const WIDGET_MAP_KEY = '@habit_widget_map_v1';

export const DEFAULT_HOBBIES = [
  { id: 'reading', name: 'Reading', history: {} },
  { id: 'workout', name: 'Workout', history: {} },
  { id: 'coding', name: 'Coding', history: {} },
];

export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatDateShort(date = new Date()) {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

export function getYearMetrics(date = new Date()) {
  const currentYear = date.getFullYear();
  const totalDaysInYear = isLeapYear(currentYear) ? 366 : 365;
  const currentDayOfYear = getDayOfYear(date);
  const daysLeftInYear = totalDaysInYear - currentDayOfYear;
  const yearPercentage = Math.round((currentDayOfYear / totalDaysInYear) * 100);
  const dateString = formatDateShort(date);

  return {
    currentYear,
    totalDaysInYear,
    currentDayOfYear,
    daysLeftInYear,
    yearPercentage,
    dateString,
  };
}

export function calculateStreak(history, todayKey = getDateKey()) {
  if (!history) return 0;
  let count = 0;
  const checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  if (!history[todayKey]) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const key = getDateKey(checkDate);
    if (history[key]) {
      count++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return count;
}

export function getPast30Days(history, today = new Date()) {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = getDateKey(d);
    days.push({
      key,
      isToday: i === 0,
      isDone: !!(history && history[key]),
    });
  }
  return days;
}

export async function loadHabitState() {
  try {
    const [storedState, storedMap] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(WIDGET_MAP_KEY),
    ]);

    let hobbies = DEFAULT_HOBBIES;
    let selectedHobbyId = DEFAULT_HOBBIES[0].id;
    let widgetHabitMap = {};

    if (storedState) {
      const parsed = JSON.parse(storedState);
      if (parsed.hobbies && parsed.hobbies.length > 0) {
        hobbies = parsed.hobbies;
        selectedHobbyId = parsed.selectedHobbyId || parsed.hobbies[0].id;
      }
    }

    if (storedMap) {
      widgetHabitMap = JSON.parse(storedMap) || {};
    }

    const selectedHobby =
      hobbies.find((h) => h.id === selectedHobbyId) || hobbies[0];

    return {
      hobbies,
      selectedHobbyId,
      selectedHobby,
      widgetHabitMap,
    };
  } catch (e) {
    console.warn('Failed to load habit state', e);
    return {
      hobbies: DEFAULT_HOBBIES,
      selectedHobbyId: DEFAULT_HOBBIES[0].id,
      selectedHobby: DEFAULT_HOBBIES[0],
      widgetHabitMap: {},
    };
  }
}

export async function saveHabitState(hobbies, selectedHobbyId, widgetHabitMap) {
  try {
    const promises = [
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          hobbies,
          selectedHobbyId,
        })
      ),
    ];
    if (widgetHabitMap !== undefined) {
      promises.push(
        AsyncStorage.setItem(WIDGET_MAP_KEY, JSON.stringify(widgetHabitMap))
      );
    }
    await Promise.all(promises);
  } catch (e) {
    console.warn('Failed to save habit state', e);
  }
}

export async function toggleTodayHabit(targetHobbyId) {
  const state = await loadHabitState();
  const habitId = targetHobbyId || state.selectedHobbyId;
  const todayKey = getDateKey(new Date());

  const updatedHobbies = state.hobbies.map((h) => {
    if (h.id === habitId) {
      const updatedHistory = { ...h.history };
      if (updatedHistory[todayKey]) {
        delete updatedHistory[todayKey];
      } else {
        updatedHistory[todayKey] = true;
      }
      return { ...h, history: updatedHistory };
    }
    return h;
  });

  await saveHabitState(updatedHobbies, state.selectedHobbyId, state.widgetHabitMap);
  const updatedSelectedHobby =
    updatedHobbies.find((h) => h.id === state.selectedHobbyId) || updatedHobbies[0];

  return {
    hobbies: updatedHobbies,
    selectedHobbyId: state.selectedHobbyId,
    selectedHobby: updatedSelectedHobby,
    widgetHabitMap: state.widgetHabitMap,
  };
}
