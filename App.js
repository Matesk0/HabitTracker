import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
  Dimensions,
  Platform,
  AppState,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  loadHabitState,
  saveHabitState,
  getDateKey,
  getYearMetrics,
  calculateStreak,
  getPast30Days,
  DEFAULT_HOBBIES,
} from './src/utils/habitUtils';
import { syncActiveWidgets } from './src/widgets/widgetSync';

export default function App() {
  const [activeTab, setActiveTab] = useState('habits'); // 'habits' | 'widgets' | 'year'
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'wide' | 'circles'
  const [hobbies, setHobbies] = useState(DEFAULT_HOBBIES);
  const [selectedHobbyId, setSelectedHobbyId] = useState('reading');
  const [widgetHabitMap, setWidgetHabitMap] = useState({});
  const [viewFilter, setViewFilter] = useState('all');

  // Modals
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [newHobbyName, setNewHobbyName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => getDateKey(today), [today]);
  const yearMetrics = useMemo(() => getYearMetrics(today), [today]);

  const loadData = useCallback(async () => {
    try {
      const state = await loadHabitState();
      setHobbies(state.hobbies);
      setSelectedHobbyId(state.selectedHobbyId);
      setWidgetHabitMap(state.widgetHabitMap || {});
    } catch (e) {
      console.warn('Failed to load state', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        loadData();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [loadData]);

  const saveState = async (updatedHobbies, updatedSelectedId, updatedMap) => {
    setHobbies(updatedHobbies);
    const activeId = updatedSelectedId || selectedHobbyId;
    if (updatedSelectedId) setSelectedHobbyId(updatedSelectedId);
    const activeMap = updatedMap !== undefined ? updatedMap : widgetHabitMap;
    if (updatedMap !== undefined) setWidgetHabitMap(activeMap);

    await saveHabitState(updatedHobbies, activeId, activeMap);
    syncActiveWidgets(updatedHobbies, activeId, activeMap);
  };

  const toggleHabitToday = (habitId) => {
    const updatedHobbies = hobbies.map((h) => {
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
    saveState(updatedHobbies);
  };

  const toggleHabitDate = (habitId, dateKey) => {
    const updatedHobbies = hobbies.map((h) => {
      if (h.id === habitId) {
        const updatedHistory = { ...h.history };
        if (updatedHistory[dateKey]) {
          delete updatedHistory[dateKey];
        } else {
          updatedHistory[dateKey] = true;
        }
        return { ...h, history: updatedHistory };
      }
      return h;
    });
    saveState(updatedHobbies);
  };

  const setAsWidgetHabit = (habitId) => {
    saveState(hobbies, habitId);
  };

  const handleAddHobby = () => {
    const trimmed = newHobbyName.trim();
    if (!trimmed) return;
    const newId = trimmed.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36);
    const updated = [...hobbies, { id: newId, name: trimmed, history: {} }];
    saveState(updated, newId);
    setNewHobbyName('');
    setAddModalVisible(false);
  };

  const requestDeleteHobby = (habit) => {
    if (hobbies.length <= 1) {
      setErrorMessage('You must have at least one habit.');
      setErrorModalVisible(true);
      return;
    }
    setDeleteTarget(habit);
  };

  const confirmDeleteHobby = () => {
    if (!deleteTarget) return;
    const filtered = hobbies.filter((h) => h.id !== deleteTarget.id);
    const newSelected = selectedHobbyId === deleteTarget.id ? filtered[0].id : selectedHobbyId;
    if (viewFilter === deleteTarget.id) setViewFilter('all');
    saveState(filtered, newSelected);
    setDeleteTarget(null);
  };

  const displayedHobbies = useMemo(() => {
    if (viewFilter === 'all') return hobbies;
    return hobbies.filter((h) => h.id === viewFilter);
  }, [hobbies, viewFilter]);

  const activeWidgetHabit = useMemo(() => {
    return hobbies.find((h) => h.id === selectedHobbyId) || hobbies[0];
  }, [hobbies, selectedHobbyId]);

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

      {/* Top Navigation Tabs */}
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
          style={[styles.tabBtn, activeTab === 'widgets' && styles.tabBtnActive]}
          onPress={() => setActiveTab('widgets')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabBtnText, activeTab === 'widgets' && styles.tabBtnTextActive]}>
            Widgets
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'year' && styles.tabBtnActive]}
          onPress={() => setActiveTab('year')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabBtnText, activeTab === 'year' && styles.tabBtnTextActive]}>
            Year
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'habits' ? (
          <>
            {/* View Mode Selector: 30D Cards / Wide Pill / Small Circle */}
            <View style={styles.viewModeRow}>
              <TouchableOpacity
                style={[styles.modeBtn, viewMode === 'cards' && styles.modeBtnActive]}
                onPress={() => setViewMode('cards')}
                activeOpacity={0.7}
              >
                <Text style={[styles.modeBtnText, viewMode === 'cards' && styles.modeBtnTextActive]}>
                  30-Day Cards
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, viewMode === 'wide' && styles.modeBtnActive]}
                onPress={() => setViewMode('wide')}
                activeOpacity={0.7}
              >
                <Text style={[styles.modeBtnText, viewMode === 'wide' && styles.modeBtnTextActive]}>
                  Wide Pills
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeBtn, viewMode === 'circles' && styles.modeBtnActive]}
                onPress={() => setViewMode('circles')}
                activeOpacity={0.7}
              >
                <Text style={[styles.modeBtnText, viewMode === 'circles' && styles.modeBtnTextActive]}>
                  Circles
                </Text>
              </TouchableOpacity>
            </View>

            {/* Filter Pills */}
            <View style={styles.pillsRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillContainer}
              >
                <TouchableOpacity
                  style={[styles.pill, viewFilter === 'all' && styles.pillSelected]}
                  onPress={() => setViewFilter('all')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, viewFilter === 'all' && styles.pillTextSelected]}>
                    All ({hobbies.length})
                  </Text>
                </TouchableOpacity>

                {hobbies.map((h) => {
                  const isSelected = viewFilter === h.id;
                  return (
                    <TouchableOpacity
                      key={h.id}
                      style={[styles.pill, isSelected && styles.pillSelected]}
                      onPress={() => setViewFilter(h.id)}
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
                onPress={() => setAddModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.addBtnSmallText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* MODE 1: 30-Day Cards */}
            {viewMode === 'cards' &&
              displayedHobbies.map((habit) => {
                const streak = calculateStreak(habit.history, todayKey);
                const past30 = getPast30Days(habit.history, today);
                const past30DoneCount = past30.filter((d) => d.isDone).length;
                const past30Percentage = Math.round((past30DoneCount / 30) * 100);
                const isTodayDone = !!(habit.history && habit.history[todayKey]);
                const isWidgetActive = selectedHobbyId === habit.id;

                return (
                  <View key={habit.id} style={styles.widgetCard}>
                    {/* Header */}
                    <View style={styles.widgetHeader}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.widgetBigTitle} numberOfLines={1}>
                          {habit.name}
                        </Text>
                        <View style={styles.badgeRow}>
                          <TouchableOpacity
                            style={[styles.widgetBadge, isWidgetActive && styles.widgetBadgeActive]}
                            onPress={() => setAsWidgetHabit(habit.id)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.widgetBadgeText,
                                isWidgetActive && styles.widgetBadgeTextActive,
                              ]}
                            >
                              {isWidgetActive ? '● Active Widget' : '○ Set for Widget'}
                            </Text>
                          </TouchableOpacity>
                          <Text style={styles.streakLabel}>{streak}d streak</Text>
                        </View>
                      </View>

                      <View style={styles.widgetHeaderRight}>
                        <Text style={styles.widgetStatNumber}>{past30Percentage}%</Text>
                        <Text style={styles.widgetStatLabel}>{past30DoneCount}/30</Text>
                      </View>
                    </View>

                    {/* Today Quick Toggle Button (Pill Aesthetic) */}
                    <TouchableOpacity
                      style={[styles.toggleButton, isTodayDone && styles.toggleButtonDone]}
                      onPress={() => toggleHabitToday(habit.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.toggleInnerRow}>
                        <View
                          style={[
                            styles.toggleCircleIcon,
                            isTodayDone && styles.toggleCircleIconDone,
                          ]}
                        >
                          {isTodayDone && <View style={styles.toggleCircleInnerDot} />}
                        </View>
                        <Text
                          style={[
                            styles.toggleButtonText,
                            isTodayDone && styles.toggleButtonTextDone,
                          ]}
                        >
                          {isTodayDone ? 'Completed Today' : 'Mark as Done'}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* 30 Balls Grid */}
                    <View style={styles.grid30Balls}>
                      {past30.map((d) => (
                        <TouchableOpacity
                          key={d.key}
                          onPress={() => toggleHabitDate(habit.id, d.key)}
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
                      {hobbies.length > 1 && (
                        <TouchableOpacity
                          onPress={() => requestDeleteHobby(habit)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}

            {/* MODE 2: Wide Pills (Matching wide-habit.png) */}
            {viewMode === 'wide' && (
              <View style={styles.wideListContainer}>
                {displayedHobbies.map((habit) => {
                  const streak = calculateStreak(habit.history, todayKey);
                  const isTodayDone = !!(habit.history && habit.history[todayKey]);

                  return (
                    <TouchableOpacity
                      key={habit.id}
                      style={[styles.widePillCard, isTodayDone && styles.widePillCardDone]}
                      onPress={() => toggleHabitToday(habit.id)}
                      activeOpacity={0.8}
                    >
                      {/* Left Circular Checkbox (Concentric on done) */}
                      <View
                        style={[
                          styles.wideCircleToggle,
                          isTodayDone && styles.wideCircleToggleDone,
                        ]}
                      >
                        {isTodayDone && <View style={styles.wideCircleInnerDot} />}
                      </View>

                      {/* Habit Name */}
                      <Text style={styles.widePillTitle} numberOfLines={1}>
                        {habit.name}
                      </Text>

                      {/* Right Streak / Delete */}
                      <View style={styles.widePillRight}>
                        {streak > 0 && (
                          <View style={styles.streakBadgeSmall}>
                            <Text style={styles.streakBadgeSmallText}>{streak}d</Text>
                          </View>
                        )}
                        {hobbies.length > 1 && (
                          <TouchableOpacity
                            onPress={() => requestDeleteHobby(habit)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={{ marginLeft: 8 }}
                          >
                            <Text style={styles.deleteTextSmall}>✕</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* MODE 3: Small Circles (Matching small-habit.png) */}
            {viewMode === 'circles' && (
              <View style={styles.circlesGridContainer}>
                {displayedHobbies.map((habit) => {
                  const streak = calculateStreak(habit.history, todayKey);
                  const isTodayDone = !!(habit.history && habit.history[todayKey]);

                  return (
                    <TouchableOpacity
                      key={habit.id}
                      style={[styles.circleCard, isTodayDone && styles.circleCardDone]}
                      onPress={() => toggleHabitToday(habit.id)}
                      activeOpacity={0.8}
                    >
                      {/* Concentric Circle Target (small-habit.png) */}
                      <View
                        style={[
                          styles.concentricOuter,
                          isTodayDone && styles.concentricOuterDone,
                        ]}
                      >
                        {isTodayDone ? (
                          <View style={styles.concentricInnerDone} />
                        ) : (
                          <View style={styles.concentricInnerEmpty} />
                        )}
                      </View>

                      <Text style={styles.circleCardTitle} numberOfLines={1}>
                        {habit.name}
                      </Text>
                      <Text style={styles.circleCardSubtitle}>
                        {isTodayDone ? 'Done' : `${streak}d streak`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        ) : activeTab === 'widgets' ? (
          /* ========================================================= */
          /* TAB 2: WIDGETS GALLERY & LIVE PREVIEWS                    */
          /* ========================================================= */
          <View style={styles.widgetsGalleryContainer}>
            <View style={styles.galleryHeader}>
              <Text style={styles.galleryTitle}>Home Screen Widgets</Text>
              <Text style={styles.gallerySubtitle}>
                Add these interactive widgets to your Android home screen.
              </Text>
            </View>

            {/* Active Habit Picker for Widgets */}
            <View style={styles.widgetSelectorCard}>
              <Text style={styles.widgetSelectorLabel}>Linked Habit for Widgets:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillContainer}
              >
                {hobbies.map((h) => {
                  const isSelected = selectedHobbyId === h.id;
                  return (
                    <TouchableOpacity
                      key={h.id}
                      style={[styles.pill, isSelected && styles.pillSelected]}
                      onPress={() => setAsWidgetHabit(h.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                        {h.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 1. Small Habit Circle Widget (small-habit.png) */}
            <View style={styles.previewSection}>
              <View style={styles.previewHeaderRow}>
                <Text style={styles.previewTitle}>1. Small Habit (Circle)</Text>
                <Text style={styles.previewTag}>1x1 Widget</Text>
              </View>
              <View style={styles.previewCardCentered}>
                <TouchableOpacity
                  style={[
                    styles.circleWidgetBox,
                    habitDone(activeWidgetHabit, todayKey) && styles.circleWidgetBoxDone,
                  ]}
                  onPress={() => toggleHabitToday(activeWidgetHabit.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.widgetPreviewName} numberOfLines={1}>
                    {activeWidgetHabit.name}
                  </Text>
                  <View
                    style={[
                      styles.concentricOuter,
                      habitDone(activeWidgetHabit, todayKey) && styles.concentricOuterDone,
                    ]}
                  >
                    {habitDone(activeWidgetHabit, todayKey) ? (
                      <View style={styles.concentricInnerDone} />
                    ) : (
                      <View style={styles.concentricInnerEmpty} />
                    )}
                  </View>
                  <Text style={styles.widgetPreviewStatus}>
                    {habitDone(activeWidgetHabit, todayKey) ? 'Done' : 'Tap'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. Wide Habit Pill Widget (wide-habit.png) */}
            <View style={styles.previewSection}>
              <View style={styles.previewHeaderRow}>
                <Text style={styles.previewTitle}>2. Wide Habit (Pill)</Text>
                <Text style={styles.previewTag}>3x1 Widget</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.widePillCard,
                  habitDone(activeWidgetHabit, todayKey) && styles.widePillCardDone,
                ]}
                onPress={() => toggleHabitToday(activeWidgetHabit.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.wideCircleToggle,
                    habitDone(activeWidgetHabit, todayKey) && styles.wideCircleToggleDone,
                  ]}
                >
                  {habitDone(activeWidgetHabit, todayKey) && (
                    <View style={styles.wideCircleInnerDot} />
                  )}
                </View>
                <Text style={styles.widePillTitle} numberOfLines={1}>
                  {activeWidgetHabit.name}
                </Text>
                <View style={styles.streakBadgeSmall}>
                  <Text style={styles.streakBadgeSmallText}>
                    {calculateStreak(activeWidgetHabit.history, todayKey)}d
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* 3. Habit 30-Day Dot Matrix */}
            <View style={styles.previewSection}>
              <View style={styles.previewHeaderRow}>
                <Text style={styles.previewTitle}>3. Habit 30-Day Matrix</Text>
                <Text style={styles.previewTag}>3x2 Widget</Text>
              </View>
              <TouchableOpacity
                style={styles.widgetCard}
                onPress={() => toggleHabitToday(activeWidgetHabit.id)}
                activeOpacity={0.8}
              >
                <View style={styles.widgetHeader}>
                  <Text style={styles.widgetBigTitle}>{activeWidgetHabit.name}</Text>
                  <Text style={styles.widgetStatNumber}>
                    {Math.round(
                      (getPast30Days(activeWidgetHabit.history, today).filter((d) => d.isDone)
                        .length /
                        30) *
                        100
                    )}
                    %
                  </Text>
                </View>
                <View style={styles.grid30Balls}>
                  {getPast30Days(activeWidgetHabit.history, today).map((d) => (
                    <View
                      key={d.key}
                      style={[
                        styles.ball30,
                        d.isDone && styles.ball30Done,
                        d.isToday && styles.ball30Today,
                      ]}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ========================================================= */
          /* TAB 3: YEAR PROGRESS (Dot Matrix)                         */
          /* ========================================================= */
          <View style={styles.widgetCard}>
            {/* Header: Date top left, % top right */}
            <View style={styles.widgetHeader}>
              <View>
                <Text style={styles.widgetBigTitle}>{yearMetrics.dateString}</Text>
                <Text style={styles.widgetSubtitle}>{yearMetrics.currentYear}</Text>
              </View>
              <View style={styles.widgetHeaderRight}>
                <Text style={styles.widgetStatNumber}>{yearMetrics.yearPercentage}%</Text>
                <Text style={styles.widgetStatLabel}>
                  {yearMetrics.currentDayOfYear}/{yearMetrics.totalDaysInYear}
                </Text>
              </View>
            </View>

            {/* Small balls filling up the year */}
            <View style={styles.yearGridWrapper}>
              {Array.from({ length: yearMetrics.totalDaysInYear }, (_, index) => {
                const dayNum = index + 1;
                const isPassedOrToday = dayNum <= yearMetrics.currentDayOfYear;
                const isCurrent = dayNum === yearMetrics.currentDayOfYear;
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
                Day {yearMetrics.currentDayOfYear}
              </Text>
              <Text style={styles.footerText}>Dec 31</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add Habit Modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
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
                  setAddModalVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnSave}
                onPress={handleAddHobby}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnSaveText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Habit Modal */}
      <Modal
        visible={!!deleteTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete Habit</Text>
            <Text style={styles.modalDescription}>
              Are you sure you want to delete "{deleteTarget?.name}"?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setDeleteTarget(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnDelete}
                onPress={confirmDeleteHobby}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Error / Notice Modal */}
      <Modal
        visible={errorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Notice</Text>
            <Text style={styles.modalDescription}>{errorMessage}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalBtnSave}
                onPress={() => setErrorModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnSaveText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function habitDone(habit, todayKey) {
  return !!(habit && habit.history && habit.history[todayKey]);
}

const windowWidth = Dimensions.get('window').width;
const cardWidth = Math.min(windowWidth - 32, 380);
const dotCols = 19;
const dotGap = 4;
const dotSize = Math.floor((cardWidth - 44 - (dotCols - 1) * dotGap) / dotCols);

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
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabBtn: {
    paddingHorizontal: 18,
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

  /* View Mode Row */
  viewModeRow: {
    width: '100%',
    maxWidth: 380,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 2,
    marginBottom: 10,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 12,
  },
  modeBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  modeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8e8e93',
  },
  modeBtnTextActive: {
    color: '#ffffff',
  },

  /* Habit Filter Pills */
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
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.4,
  },
  widgetSubtitle: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  widgetBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  widgetBadgeActive: {
    backgroundColor: 'rgba(10, 132, 255, 0.18)',
    borderColor: '#0a84ff',
  },
  widgetBadgeText: {
    fontSize: 11,
    color: '#8e8e93',
    fontWeight: '600',
  },
  widgetBadgeTextActive: {
    color: '#5ac8fa',
  },
  streakLabel: {
    fontSize: 12,
    color: '#8e8e93',
  },
  widgetHeaderRight: {
    alignItems: 'flex-end',
  },
  widgetStatNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 24,
  },
  widgetStatLabel: {
    fontSize: 11,
    color: '#8e8e93',
  },

  /* Toggle Button */
  toggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 12,
  },
  toggleButtonDone: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  toggleInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleCircleIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCircleIconDone: {
    borderColor: '#000000',
  },
  toggleCircleInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
  },
  toggleButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  toggleButtonTextDone: {
    color: '#000000',
  },

  /* 30 Balls Grid */
  grid30Balls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    paddingVertical: 8,
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

  /* Wide Pill Mode (wide-habit.png) */
  wideListContainer: {
    width: '100%',
    maxWidth: 380,
    gap: 10,
  },
  widePillCard: {
    width: '100%',
    backgroundColor: '#1c1c1e',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  widePillCardDone: {
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  wideCircleToggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  wideCircleToggleDone: {
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  wideCircleInnerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffffff',
  },
  widePillTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  widePillRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  streakBadgeSmallText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  deleteTextSmall: {
    color: '#ff453a',
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 6,
  },

  /* Small Circles Mode (small-habit.png) */
  circlesGridContainer: {
    width: '100%',
    maxWidth: 380,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  circleCard: {
    width: '48%',
    backgroundColor: '#1c1c1e',
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  circleCardDone: {
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  concentricOuter: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  concentricOuterDone: {
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  concentricInnerDone: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
  },
  concentricInnerEmpty: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  circleCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 4,
    textAlign: 'center',
  },
  circleCardSubtitle: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 2,
  },

  /* Widgets Gallery */
  widgetsGalleryContainer: {
    width: '100%',
    maxWidth: 380,
    gap: 16,
  },
  galleryHeader: {
    marginBottom: 4,
  },
  galleryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  gallerySubtitle: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 2,
  },
  widgetSelectorCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  widgetSelectorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8e8e93',
    marginBottom: 8,
  },
  previewSection: {
    gap: 8,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  previewTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5ac8fa',
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  previewCardCentered: {
    alignItems: 'center',
  },
  circleWidgetBox: {
    width: 110,
    height: 110,
    backgroundColor: '#1c1c1e',
    borderRadius: 22,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  circleWidgetBoxDone: {
    borderColor: '#ffffff',
  },
  widgetPreviewName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  widgetPreviewStatus: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8e8e93',
  },

  /* Full Year Dot Grid */
  yearGridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: dotGap,
    justifyContent: 'flex-start',
    alignSelf: 'center',
    width: (dotSize + dotGap) * dotCols,
    paddingVertical: 8,
  },
  yearBall: {
    width: dotSize,
    height: dotSize,
    borderRadius: dotSize / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  yearBallPassed: {
    backgroundColor: '#ffffff',
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

  /* Footer */
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
    fontWeight: '500',
  },

  /* Modals */
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
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#8e8e93',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#ffffff',
    fontSize: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtnCancel: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalBtnCancelText: {
    color: '#8e8e93',
    fontSize: 13,
    fontWeight: '600',
  },
  modalBtnSave: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  modalBtnSaveText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  modalBtnDelete: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#ff453a',
  },
  modalBtnDeleteText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
