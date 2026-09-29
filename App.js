import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@habit_tracker_state_v2';

const DEFAULT_HOBBIES = [
  { id: 'reading', name: 'Reading', history: {} },
  { id: 'workout', name: 'Workout', history: {} },
  { id: 'coding', name: 'Coding', history: {} },
];

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function App() {
  const [hobbies, setHobbies] = useState(DEFAULT_HOBBIES);
  const [selectedHobbyId, setSelectedHobbyId] = useState('reading');
  const [hobbyViewMode, setHobbyViewMode] = useState('30days'); // '30days' | 'year'
  const [modalVisible, setModalVisible] = useState(false);
  const [newHobbyName, setNewHobbyName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Live date math
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => getDateKey(today), [today]);
  const currentYear = today.getFullYear();
  const totalDaysInYear = isLeapYear(currentYear) ? 366 : 365;
  const currentDayOfYear = getDayOfYear(today);
  const daysLeftInYear = totalDaysInYear - currentDayOfYear;
  const yearPercentage = Math.round((currentDayOfYear / totalDaysInYear) * 100);

  // Load saved state
  useEffect(() => {
    async function loadData() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.hobbies && parsed.hobbies.length > 0) {
            setHobbies(parsed.hobbies);
            setSelectedHobbyId(parsed.selectedHobbyId || parsed.hobbies[0].id);
          }
        }
      } catch (e) {
        console.warn('Failed to load state', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const saveState = async (updatedHobbies, updatedSelectedId) => {
    setHobbies(updatedHobbies);
    if (updatedSelectedId) setSelectedHobbyId(updatedSelectedId);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          hobbies: updatedHobbies,
          selectedHobbyId: updatedSelectedId || selectedHobbyId,
        })
      );
    } catch (e) {
      console.warn('Failed to save state', e);
    }
  };

  const selectedHobby = hobbies.find((h) => h.id === selectedHobbyId) || hobbies[0] || {
    id: 'default',
    name: 'Habit',
    history: {},
  };

  // Toggle today's status (Widget 1)
  const toggleToday = () => {
    const updatedHistory = { ...selectedHobby.history };
    if (updatedHistory[todayKey]) {
      delete updatedHistory[todayKey];
    } else {
      updatedHistory[todayKey] = true;
    }

    const updatedHobbies = hobbies.map((h) =>
      h.id === selectedHobby.id ? { ...h, history: updatedHistory } : h
    );
    saveState(updatedHobbies);
  };

  // Toggle any date in the dot matrix (Widget 2)
  const toggleDate = (dateKey) => {
    const updatedHistory = { ...selectedHobby.history };
    if (updatedHistory[dateKey]) {
      delete updatedHistory[dateKey];
    } else {
      updatedHistory[dateKey] = true;
    }

    const updatedHobbies = hobbies.map((h) =>
      h.id === selectedHobby.id ? { ...h, history: updatedHistory } : h
    );
    saveState(updatedHobbies);
  };

  // Streak calculation
  const streak = useMemo(() => {
    if (!selectedHobby || !selectedHobby.history) return 0;
    let count = 0;
    const checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    if (!selectedHobby.history[todayKey]) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const key = getDateKey(checkDate);
      if (selectedHobby.history[key]) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [selectedHobby, todayKey]);

  // 30 Days Dot Matrix Data
  const past30Days = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = getDateKey(d);
      days.push({
        date: d,
        key,
        dayNum: d.getDate(),
        isToday: i === 0,
        isDone: !!(selectedHobby?.history && selectedHobby.history[key]),
      });
    }
    return days;
  }, [selectedHobby, today]);

  const past30DoneCount = past30Days.filter((d) => d.isDone).length;
  const past30Percentage = Math.round((past30DoneCount / 30) * 100);

  // Full Year Habit Matrix Data
  const yearHabitDays = useMemo(() => {
    const days = [];
    for (let day = 1; day <= totalDaysInYear; day++) {
      const d = new Date(currentYear, 0, day);
      const key = getDateKey(d);
      const isPast = day < currentDayOfYear;
      const isToday = day === currentDayOfYear;
      const isDone = !!(selectedHobby?.history && selectedHobby.history[key]);
      days.push({
        dayNum: day,
        date: d,
        key,
        isPast,
        isToday,
        isDone,
      });
    }
    return days;
  }, [selectedHobby, currentYear, totalDaysInYear, currentDayOfYear]);

  const yearHabitDoneCount = yearHabitDays.filter((d) => d.isDone).length;
  const yearHabitPercentage = currentDayOfYear > 0 ? Math.round((yearHabitDoneCount / currentDayOfYear) * 100) : 0;

  // Add hobby handler
  const handleAddHobby = () => {
    const trimmed = newHobbyName.trim();
    if (!trimmed) return;
    const newId = trimmed.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36);
    const newHobby = { id: newId, name: trimmed, history: {} };
    const updated = [...hobbies, newHobby];
    saveState(updated, newId);
    setNewHobbyName('');
    setModalVisible(false);
  };

  // Delete hobby handler
  const handleDeleteHobby = (id) => {
    if (hobbies.length <= 1) {
      Alert.alert('Cannot delete', 'You need at least one habit in your list.');
      return;
    }
    Alert.alert('Delete Habit', `Delete habit "${selectedHobby.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const filtered = hobbies.filter((h) => h.id !== id);
          const nextSelected = filtered[0].id;
          saveState(filtered, nextSelected);
        },
      },
    ]);
  };

  const isTodayDone = !!(selectedHobby?.history && selectedHobby.history[todayKey]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Top Bar */}
        <View style={styles.appHeader}>
          <View>
            <Text style={styles.appTitle}>Habit Tracker</Text>
            <Text style={styles.appSubtitle}>
              {today.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addHobbyButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.addHobbyButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Habit Selector Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScrollView}
          contentContainerStyle={styles.pillContainer}
        >
          {hobbies.map((h) => {
            const isSelected = h.id === selectedHobby.id;
            return (
              <TouchableOpacity
                key={h.id}
                style={[styles.pill, isSelected && styles.pillSelected]}
                onPress={() => {
                  setSelectedHobbyId(h.id);
                  saveState(hobbies, h.id);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                  {h.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ========================================================= */}
        {/* WIDGET 1: Small Button Only (Done / Not Done)             */}
        {/* ========================================================= */}
        <View style={styles.smallWidgetCard}>
          <View style={styles.smallWidgetHeader}>
            <View>
              <Text style={styles.widgetBigTitle} numberOfLines={1}>
                {selectedHobby.name}
              </Text>
              <Text style={styles.widgetSubtitle}>
                Day {currentDayOfYear} of {totalDaysInYear}
              </Text>
            </View>
            <View style={styles.widgetHeaderRight}>
              <Text style={styles.widgetStatNumber}>{streak}</Text>
              <Text style={styles.widgetStatLabel}>day streak</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.smallWidgetButton, isTodayDone && styles.smallWidgetButtonDone]}
            onPress={toggleToday}
            activeOpacity={0.8}
          >
            <Text style={[styles.smallWidgetButtonIcon, isTodayDone && styles.smallWidgetButtonIconDone]}>
              {isTodayDone ? '✓' : '○'}
            </Text>
            <Text style={[styles.smallWidgetButtonText, isTodayDone && styles.smallWidgetButtonTextDone]}>
              {isTodayDone ? 'Completed today' : 'Tap to mark done'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.widgetCaption}>Dale</Text>
        </View>

        {/* ========================================================= */}
        {/* WIDGET 2: Hobby Progress Dot Matrix (Like Image.png)      */}
        {/* ========================================================= */}
        <View style={styles.widgetCard}>
          <View style={styles.widgetHeader}>
            <View>
              <Text style={styles.widgetBigTitle} numberOfLines={1}>
                {selectedHobby.name}
              </Text>
              <Text style={styles.widgetSubtitle}>
                {hobbyViewMode === '30days'
                  ? `Last 30 Days • ${past30Percentage}%`
                  : `Year ${currentYear} • ${yearHabitPercentage}%`}
              </Text>
            </View>
            <View style={styles.widgetHeaderRight}>
              <Text style={styles.widgetStatNumber}>
                {hobbyViewMode === '30days' ? past30DoneCount : yearHabitDoneCount}
              </Text>
              <Text style={styles.widgetStatLabel}>
                {hobbyViewMode === '30days' ? 'of 30 done' : 'days done'}
              </Text>
            </View>
          </View>

          {/* Toggle between 30 Days and Full Year Dot Matrix */}
          <View style={styles.modeToggleContainer}>
            <TouchableOpacity
              style={[styles.modeToggleBtn, hobbyViewMode === '30days' && styles.modeToggleBtnActive]}
              onPress={() => setHobbyViewMode('30days')}
              activeOpacity={0.7}
            >
              <Text style={[styles.modeToggleText, hobbyViewMode === '30days' && styles.modeToggleTextActive]}>
                30 Days
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeToggleBtn, hobbyViewMode === 'year' && styles.modeToggleBtnActive]}
              onPress={() => setHobbyViewMode('year')}
              activeOpacity={0.7}
            >
              <Text style={[styles.modeToggleText, hobbyViewMode === 'year' && styles.modeToggleTextActive]}>
                Full Year
              </Text>
            </TouchableOpacity>
          </View>

          {/* 30 Days Dot Matrix View (Matching Year Progress Dot Aesthetic) */}
          {hobbyViewMode === '30days' ? (
            <View style={styles.hobby30GridWrapper}>
              {past30Days.map((d) => (
                <TouchableOpacity
                  key={d.key}
                  style={styles.dotTouchable}
                  onPress={() => toggleDate(d.key)}
                  activeOpacity={0.6}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <View
                    style={[
                      styles.hobbyDot,
                      d.isDone && styles.hobbyDotDone,
                      d.isToday && styles.hobbyDotToday,
                    ]}
                  />
                  <Text style={[styles.dotDateLabel, d.isToday && styles.dotDateLabelToday]}>
                    {d.dayNum}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            /* Full Year Habit Dot Matrix View (19 Columns, Identical to Year Progress) */
            <View style={styles.yearGridWrapper}>
              {yearHabitDays.map((d) => (
                <TouchableOpacity
                  key={d.key}
                  onPress={() => toggleDate(d.key)}
                  activeOpacity={0.5}
                  hitSlop={{ top: 3, bottom: 3, left: 3, right: 3 }}
                >
                  <View
                    style={[
                      styles.yearDot,
                      d.isPast && styles.yearDotPast,
                      d.isDone && styles.hobbyYearDotDone,
                      d.isToday && styles.yearDotCurrent,
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.widgetFooter}>
            <Text style={styles.footerText}>Tap any dot to toggle</Text>
            <TouchableOpacity onPress={() => handleDeleteHobby(selectedHobby.id)}>
              <Text style={styles.deleteHobbyText}>Delete habit</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.widgetCaption}>Dale</Text>
        </View>

        {/* ========================================================= */}
        {/* WIDGET 3: Full Year Progress (Exact Image.png Replica)    */}
        {/* ========================================================= */}
        <View style={styles.widgetCard}>
          <View style={styles.widgetHeader}>
            <View>
              <Text style={styles.widgetBigTitle}>{currentYear}</Text>
              <Text style={styles.widgetSubtitle}>
                Day {currentDayOfYear} • {yearPercentage}%
              </Text>
            </View>
            <View style={styles.widgetHeaderRight}>
              <Text style={styles.widgetStatNumber}>{daysLeftInYear}</Text>
              <Text style={styles.widgetStatLabel}>days left</Text>
            </View>
          </View>

          {/* 19 columns dot matrix matching image.png */}
          <View style={styles.yearGridWrapper}>
            {Array.from({ length: totalDaysInYear }, (_, index) => {
              const dayNum = index + 1;
              const isPast = dayNum < currentDayOfYear;
              const isCurrent = dayNum === currentDayOfYear;
              return (
                <View
                  key={dayNum}
                  style={[
                    styles.yearDot,
                    isPast && styles.yearDotPast,
                    isCurrent && styles.yearDotCurrent,
                  ]}
                />
              );
            })}
          </View>

          <View style={styles.widgetFooter}>
            <Text style={styles.footerText}>Jan 1</Text>
            <Text style={[styles.footerText, { color: '#ffffff', fontWeight: '600' }]}>
              Today (Day {currentDayOfYear})
            </Text>
            <Text style={styles.footerText}>Dec 31</Text>
          </View>

          <Text style={styles.widgetCaption}>Dale</Text>
        </View>
      </ScrollView>

      {/* Add Habit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>New Habit / Hobby</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Guitar, Gym, Reading"
              placeholderTextColor="#666"
              value={newHobbyName}
              onChangeText={setNewHobbyName}
              autoFocus
              maxLength={24}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => {
                  setNewHobbyName('');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={handleAddHobby}
              >
                <Text style={styles.modalBtnSaveText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const windowWidth = Dimensions.get('window').width;
const cardWidth = Math.min(windowWidth - 32, 420);
// 19 columns dot grid calculation (matches image.png)
const dotSize = Math.floor((cardWidth - 44 - 18 * 4.5) / 19);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8e8e93',
    fontSize: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  appHeader: {
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 14,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 2,
  },
  addHobbyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  addHobbyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  pillScrollView: {
    width: '100%',
    maxWidth: 420,
    marginBottom: 16,
  },
  pillContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1c1c1e',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillSelected: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  pillText: {
    color: '#8e8e93',
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextSelected: {
    color: '#000000',
  },

  /* Small Widget Card (Matches top widget in image.png) */
  smallWidgetCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1c1c1e',
    borderRadius: 26,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  smallWidgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  smallWidgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 10,
    marginVertical: 4,
  },
  smallWidgetButtonDone: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  smallWidgetButtonIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#8e8e93',
  },
  smallWidgetButtonIconDone: {
    color: '#000000',
  },
  smallWidgetButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  smallWidgetButtonTextDone: {
    color: '#000000',
  },

  /* Standard Widget Card Base (Matches bottom widget in image.png) */
  widgetCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1c1c1e',
    borderRadius: 26,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  widgetBigTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.4,
  },
  widgetSubtitle: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 2,
  },
  widgetHeaderRight: {
    alignItems: 'flex-end',
  },
  widgetStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 28,
  },
  widgetStatLabel: {
    fontSize: 12,
    color: '#8e8e93',
  },

  /* Mode Switcher (30 Days / Full Year) */
  modeToggleContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    padding: 3,
    marginBottom: 14,
    gap: 4,
  },
  modeToggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 11,
  },
  modeToggleBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8e8e93',
  },
  modeToggleTextActive: {
    color: '#ffffff',
  },

  /* 30-Day Dot Matrix (Exact Year Progress Dot Aesthetic) */
  hobby30GridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  dotTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 48,
  },
  hobbyDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    marginBottom: 4,
  },
  hobbyDotDone: {
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  hobbyDotToday: {
    borderWidth: 2,
    borderColor: '#0a84ff',
  },
  dotDateLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  dotDateLabelToday: {
    color: '#0a84ff',
    fontWeight: '700',
  },

  /* Full Year Dot Matrix Grid (19 Columns, Replica of image.png) */
  yearGridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4.5,
    justifyContent: 'flex-start',
    alignSelf: 'center',
    width: (dotSize + 4.5) * 19,
    paddingVertical: 8,
  },
  yearDot: {
    width: Math.max(dotSize, 7),
    height: Math.max(dotSize, 7),
    borderRadius: Math.max(dotSize, 7) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  yearDotPast: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  yearDotCurrent: {
    backgroundColor: '#ffffff',
    transform: [{ scale: 1.25 }],
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  hobbyYearDotDone: {
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },

  /* Footers & Captions */
  widgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  footerText: {
    fontSize: 11,
    color: '#8e8e93',
  },
  deleteHobbyText: {
    fontSize: 11,
    color: '#ff453a',
  },
  widgetCaption: {
    fontSize: 11,
    color: '#8e8e93',
    textAlign: 'center',
    marginTop: 14,
    fontWeight: '500',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1c1c1e',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 15,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  modalBtnCancel: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalBtnCancelText: {
    color: '#8e8e93',
    fontWeight: '600',
    fontSize: 14,
  },
  modalBtnSave: {
    backgroundColor: '#ffffff',
  },
  modalBtnSaveText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 14,
  },
});
