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

const STORAGE_KEY = '@habit_tracker_state_v3';

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
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('habits'); // 'habits' | 'year'
  const [hobbies, setHobbies] = useState(DEFAULT_HOBBIES);
  const [selectedHobbyId, setSelectedHobbyId] = useState('reading');
  const [modalVisible, setModalVisible] = useState(false);
  const [newHobbyName, setNewHobbyName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => getDateKey(today), [today]);
  const currentYear = today.getFullYear();
  const totalDaysInYear = isLeapYear(currentYear) ? 366 : 365;
  const currentDayOfYear = getDayOfYear(today);
  const daysLeftInYear = totalDaysInYear - currentDayOfYear;
  const yearPercentage = Math.round((currentDayOfYear / totalDaysInYear) * 100);

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

  // Last 30 Days (Balls only)
  const past30Days = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = getDateKey(d);
      days.push({
        key,
        isToday: i === 0,
        isDone: !!(selectedHobby?.history && selectedHobby.history[key]),
      });
    }
    return days;
  }, [selectedHobby, today]);

  const past30DoneCount = past30Days.filter((d) => d.isDone).length;
  const past30Percentage = Math.round((past30DoneCount / 30) * 100);

  const handleAddHobby = () => {
    const trimmed = newHobbyName.trim();
    if (!trimmed) return;
    const newId = trimmed.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36);
    const updated = [...hobbies, { id: newId, name: trimmed, history: {} }];
    saveState(updated, newId);
    setNewHobbyName('');
    setModalVisible(false);
  };

  const handleDeleteHobby = (id) => {
    if (hobbies.length <= 1) {
      Alert.alert('Cannot delete', 'You need at least one habit in your list.');
      return;
    }
    Alert.alert('Delete Habit', `Delete "${selectedHobby.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const filtered = hobbies.filter((h) => h.id !== id);
          saveState(filtered, filtered[0].id);
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

      {/* Top Main Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'habits' && styles.tabBtnActive]}
          onPress={() => setActiveTab('habits')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabBtnText, activeTab === 'habits' && styles.tabBtnTextActive]}>
            Habits
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'year' && styles.tabBtnActive]}
          onPress={() => setActiveTab('year')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabBtnText, activeTab === 'year' && styles.tabBtnTextActive]}>
            Year Progress
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'habits' ? (
          <>
            {/* Habit Picker Pills */}
            <View style={styles.pillsRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
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
              <TouchableOpacity
                style={styles.addBtnSmall}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.addBtnSmallText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* WIDGET 1: Small Button Only (Done / Not Done) */}
            <View style={styles.widgetCard}>
              <View style={styles.widgetHeader}>
                <View>
                  <Text style={styles.widgetBigTitle} numberOfLines={1}>
                    {selectedHobby.name}
                  </Text>
                  <Text style={styles.widgetSubtitle}>
                    {isTodayDone ? 'Completed today' : 'Not done yet'}
                  </Text>
                </View>
                <View style={styles.widgetHeaderRight}>
                  <Text style={styles.widgetStatNumber}>{streak}</Text>
                  <Text style={styles.widgetStatLabel}>streak</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.toggleButton, isTodayDone && styles.toggleButtonDone]}
                onPress={toggleToday}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleButtonText, isTodayDone && styles.toggleButtonTextDone]}>
                  {isTodayDone ? '✓  Done' : '○  Mark as Done'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* WIDGET 2: 30-Day Tracker (Balls Only, No Numbers) */}
            <View style={styles.widgetCard}>
              <View style={styles.widgetHeader}>
                <View>
                  <Text style={styles.widgetBigTitle} numberOfLines={1}>
                    {selectedHobby.name}
                  </Text>
                  <Text style={styles.widgetSubtitle}>Last 30 Days • {past30Percentage}%</Text>
                </View>
                <View style={styles.widgetHeaderRight}>
                  <Text style={styles.widgetStatNumber}>{past30DoneCount}</Text>
                  <Text style={styles.widgetStatLabel}>of 30 done</Text>
                </View>
              </View>

              {/* 30 Balls Grid: 10 columns x 3 rows (clean, small balls, no numbers) */}
              <View style={styles.grid30Balls}>
                {past30Days.map((d) => (
                  <TouchableOpacity
                    key={d.key}
                    onPress={() => toggleDate(d.key)}
                    activeOpacity={0.6}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <View
                      style={[
                        styles.ball30,
                        d.isDone && styles.ball30Done,
                        d.isToday && styles.ball30Today,
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.widgetFooter}>
                <Text style={styles.footerText}>Tap any ball to toggle</Text>
                <TouchableOpacity onPress={() => handleDeleteHobby(selectedHobby.id)}>
                  <Text style={styles.deleteText}>Delete habit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          /* ========================================================= */
          /* TAB 2: YEAR PROGRESS (Replica of Image.png)                */
          /* ========================================================= */
          <>
            {/* Small Top Year Widget (Matches top card in image.png) */}
            <View style={styles.widgetCard}>
              <View style={styles.widgetHeader}>
                <View>
                  <Text style={styles.widgetBigTitle}>{currentYear}</Text>
                  <Text style={styles.widgetSubtitle}>
                    Day {currentDayOfYear} of {totalDaysInYear}
                  </Text>
                </View>
                <View style={styles.widgetHeaderRight}>
                  <Text style={styles.widgetStatNumber}>{daysLeftInYear}</Text>
                  <Text style={styles.widgetStatLabel}>days left</Text>
                </View>
              </View>
              <Text style={styles.cardCaption}>Dale</Text>
            </View>

            {/* Main Year Progress Dot Matrix Widget (Matches bottom card in image.png) */}
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

              {/* 19-Column Dot Grid: All passed days are WHITE balls */}
              <View style={styles.yearGridWrapper}>
                {Array.from({ length: totalDaysInYear }, (_, index) => {
                  const dayNum = index + 1;
                  const isPassedOrToday = dayNum <= currentDayOfYear;
                  const isCurrent = dayNum === currentDayOfYear;
                  return (
                    <View
                      key={dayNum}
                      style={[
                        styles.yearBall,
                        isPassedOrToday && styles.yearBallPassed,
                        isCurrent && styles.yearBallCurrent,
                      ]}
                    />
                  );
                })}
              </View>

              <View style={styles.widgetFooter}>
                <Text style={styles.footerText}>Jan 1</Text>
                <Text style={[styles.footerText, { color: '#ffffff', fontWeight: '600' }]}>
                  Day {currentDayOfYear}
                </Text>
                <Text style={styles.footerText}>Dec 31</Text>
              </View>
              <Text style={styles.cardCaption}>Dale</Text>
            </View>
          </>
        )}
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
            <Text style={styles.modalTitle}>New Habit</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Reading, Gym, Meditation"
              placeholderTextColor="#666"
              value={newHobbyName}
              onChangeText={setNewHobbyName}
              autoFocus
              maxLength={24}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => {
                  setNewHobbyName('');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSave} onPress={handleAddHobby}>
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
const cardWidth = Math.min(windowWidth - 32, 380);
// Smaller dots matching image.png exactly
const dotGap = 4;
const dotSize = Math.floor((cardWidth - 44 - 18 * dotGap) / 19);

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
    fontSize: 14,
  },

  /* Top Tab Bar */
  tabBar: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 20,
    padding: 3,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabBtn: {
    paddingHorizontal: 22,
    paddingVertical: 7,
    borderRadius: 17,
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e8e93',
  },
  tabBtnTextActive: {
    color: '#000000',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },

  /* Habit Pills Row */
  pillsRow: {
    width: '100%',
    maxWidth: 380,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  pillContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  pill: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 18,
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
  addBtnSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnSmallText: {
    color: '#ffffff',
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '600',
  },

  /* Widget Card */
  widgetCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1c1c1e',
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
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
    lineHeight: 26,
  },
  widgetStatLabel: {
    fontSize: 12,
    color: '#8e8e93',
  },

  /* Widget 1: Toggle Button */
  toggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  toggleButtonDone: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  toggleButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  toggleButtonTextDone: {
    color: '#000000',
  },

  /* Widget 2: 30 Balls Grid (No numbers) */
  grid30Balls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  ball30: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  ball30Done: {
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  ball30Today: {
    borderWidth: 2,
    borderColor: '#0a84ff',
  },

  /* Widget 3: Full Year Dot Grid (Smaller balls, passed days are solid white) */
  yearGridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: dotGap,
    justifyContent: 'flex-start',
    alignSelf: 'center',
    width: (dotSize + dotGap) * 19,
    paddingVertical: 8,
  },
  yearBall: {
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  yearBallPassed: {
    backgroundColor: '#ffffff', // Solid white for passed days
  },
  yearBallCurrent: {
    backgroundColor: '#ffffff',
    transform: [{ scale: 1.3 }],
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },

  /* Footer & Caption */
  widgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  footerText: {
    fontSize: 11,
    color: '#8e8e93',
  },
  deleteText: {
    fontSize: 11,
    color: '#ff453a',
  },
  cardCaption: {
    fontSize: 11,
    color: '#8e8e93',
    textAlign: 'center',
    marginTop: 12,
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
    maxWidth: 320,
    backgroundColor: '#1c1c1e',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalBtnCancel: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalBtnCancelText: {
    color: '#8e8e93',
    fontSize: 13,
    fontWeight: '600',
  },
  modalBtnSave: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  modalBtnSaveText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
});
