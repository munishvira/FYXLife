import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  RefreshControl,
  Easing,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import StorageService from '../../services/StorageService';
import GoalCard from '../../components/GoalCard';
import StreakCounter from '../../components/StreakCounter';
import { useNavigation } from '@react-navigation/native';

const DashboardScreen = ({ setIsOnboarded }) => {
  const [userData, setUserData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [progress, setProgress] = useState(null);
  const [globalStreak, setGlobalStreak] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [goalAlternatives, setGoalAlternatives] = useState([]);
  const navigation = useNavigation();

  // Animation values for different sections
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const headerSlideAnim = React.useRef(new Animated.Value(-30)).current;
  const summaryScaleAnim = React.useRef(new Animated.Value(0.85)).current;
  const streakAnim = React.useRef(new Animated.Value(0)).current;
  const goalsAnim = React.useRef(new Animated.Value(0)).current;
  const motivationAnim = React.useRef(new Animated.Value(0)).current;
  const statsAnim = React.useRef(new Animated.Value(0)).current;
  const modalAnim = React.useRef(new Animated.Value(0)).current;

  const summaryScale = summaryScaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Reset all animations
    fadeAnim.setValue(0);
    headerSlideAnim.setValue(-30);
    summaryScaleAnim.setValue(0.85);
    streakAnim.setValue(0);
    goalsAnim.setValue(0);
    motivationAnim.setValue(0);
    statsAnim.setValue(0);

    // Animate header + summary first
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(headerSlideAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(summaryScaleAnim, {
        toValue: 1,
        speed: 18,
        bounciness: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Stagger the rest
    Animated.stagger(120, [
      Animated.spring(streakAnim, {
        toValue: 1,
        speed: 16,
        bounciness: 5,
        useNativeDriver: true,
      }),
      Animated.spring(goalsAnim, {
        toValue: 1,
        speed: 16,
        bounciness: 5,
        useNativeDriver: true,
      }),
      Animated.spring(motivationAnim, {
        toValue: 1,
        speed: 16,
        bounciness: 4,
        useNativeDriver: true,
      }),
      Animated.spring(statsAnim, {
        toValue: 1,
        speed: 18,
        bounciness: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadData = async () => {
    try {
      const user = StorageService.getUserData();
      const goalsData = StorageService.getGoalsData();
      const progressData = StorageService.getProgressData();
      const streakData = StorageService.getStreakData();

      setUserData(user);
      setGoals(goalsData);
      setProgress(progressData);
      setGlobalStreak(streakData.currentStreak || 0);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    startAnimations();
    setRefreshing(false);
  };

  const isDateToday = (dateString) => {
    const today = new Date().toDateString();
    return dateString === today;
  };
  
  const isCategoryCompletedToday = (category, goalIdToExclude = null) => {
    return goals.some(
      (goal) =>
        goal.category === category &&
        goal.completed &&
        goal.id !== goalIdToExclude &&
        isDateToday(goal.lastCompletedDate || '')
    );
  };

  const updateGlobalStreak = (updatedGoals) => {
    try {
      const today = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      const streakData = StorageService.getStreakData();

      const categories = [...new Set(updatedGoals.map((g) => g.category))];

      // Check if all categories have a completed goal today
      const allCategoriesCompletedToday = categories.every((category) =>
        updatedGoals.some(
          (goal) =>
            goal.category === category &&
            goal.completed &&
            isDateToday(goal.lastCompletedDate || '')
        )
      );

      let newStreak = streakData.currentStreak || 0;

      if (allCategoriesCompletedToday) {
        // All categories completed today
        if (streakData.lastCompletedDate === yesterdayStr) {
          // Continuing streak from yesterday
          newStreak += 1;
        } else if (streakData.lastCompletedDate === today) {
          // Already counted today, keep same
          newStreak = streakData.currentStreak || 0;
        } else {
          // Starting new streak
          newStreak = 1;
        }

        StorageService.saveStreakData({
          currentStreak: newStreak,
          lastCompletedDate: today,
          highestStreak: Math.max(newStreak, streakData.highestStreak || 0),
        });
      } else {
        // Not all categories completed today
        if (streakData.lastCompletedDate === today) {
          // Today was counted before, now unchecked -> decrement streak
          newStreak = Math.max(0, (streakData.currentStreak || 1) - 1);

          StorageService.saveStreakData({
            ...streakData,
            currentStreak: newStreak,
            lastCompletedDate: yesterdayStr, // rollback lastCompletedDate
          });
        } else {
          // No change, keep streak as is
          StorageService.saveStreakData(streakData);
        }
      }

      setGlobalStreak(newStreak);
      return newStreak;
    } catch (error) {
      console.error('Error updating global streak:', error);
      return 0;
    }
  };

  const toggleGoal = async (goalId) => {
    try {
      const goalToUpdate = goals.find((goal) => goal.id === goalId);

      if (!goalToUpdate) return;

      // Check if another goal in the same category is already completed today
      if (
        !goalToUpdate.completed &&
        isCategoryCompletedToday(goalToUpdate.category, goalId)
      ) {
        Alert.alert(
          'Category Limit Reached',
          `You can only complete one ${goalToUpdate.category} goal per day. Complete tomorrow or change your current goal.`
        );
        return;
      }

      const today = new Date().toDateString();
      const wasCompletedToday =
        goalToUpdate.completed &&
        isDateToday(goalToUpdate.lastCompletedDate || '');

      const updatedGoals = goals.map((goal) => {
        if (goal.id === goalId) {
          const newCompleted = !goal.completed;

          return {
            ...goal,
            completed: newCompleted,
            lastCompletedDate: newCompleted ? today : goal.lastCompletedDate,
          };
        }
        return goal;
      });

      // Calculate completed goals today (one per category max)
      const categoriesCompletedToday = new Set();
      updatedGoals.forEach((goal) => {
        if (goal.completed && isDateToday(goal.lastCompletedDate || '')) {
          categoriesCompletedToday.add(goal.category);
        }
      });
      const completedToday = categoriesCompletedToday.size;

      const updatedProgress = {
        ...progress,
        today: completedToday,
        lastUpdated: today,
      };

      StorageService.saveGoalsData(updatedGoals);
      StorageService.saveProgressData(updatedProgress);

      // Update global streak
      const newStreak = updateGlobalStreak(updatedGoals);

      setGoals(updatedGoals);
      setProgress(updatedProgress);
      console.log(newStreak)
      // Check if all categories are completed
      const totalCategories = new Set(goals.map((goal) => goal.category)).size;
      if (completedToday === totalCategories) {
        Alert.alert(
          '🎉 Congratulations!',
          `You've completed all your daily goals! Your streak is now ${newStreak} day${
            newStreak !== 1 ? 's' : ''
          }!`
        );
      }
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const getGoalAlternatives = (category) => {
    const alternatives = {
      movement: [
        { description: '10 min stretch', icon: '🤸‍♀️' },
        { description: '15 min yoga', icon: '🧘‍♀️' },
        { description: '20 min dance', icon: '💃' },
        { description: '5000 steps walk', icon: '👣' },
        { description: '10 push-ups', icon: '💪' },
        { description: '30 min bike ride', icon: '🚴‍♂️' },
        { description: '15 min run', icon: '🏃‍♀️' },
        { description: 'Climb stairs 5 floors', icon: '🪜' },
      ],
      nutrition: [
        { description: '2L water intake', icon: '💧' },
        { description: 'Healthy breakfast', icon: '🥣' },
        { description: 'No processed food', icon: '🚫🍟' },
        { description: 'Eat nuts/seeds', icon: '🥜' },
        { description: 'Green smoothie', icon: '🥤' },
        { description: '5 servings fruits/vegetables', icon: '🥗' },
        { description: 'No sugary drinks', icon: '🚫🥤' },
        { description: 'Healthy snacks only', icon: '🍎' },
      ],
      mindfulness: [
        { description: '5 deep breaths', icon: '😮‍💨' },
        { description: '10 min reading', icon: '📖' },
        { description: 'Gratitude journal', icon: '📝' },
        { description: 'Listen to music', icon: '🎵' },
        { description: 'Call a friend', icon: '📞' },
        { description: '10 min meditation', icon: '🧘‍♀️' },
        { description: 'Digital detox hour', icon: '📱🚫' },
        { description: 'Nature observation', icon: '🌿' },
      ],
    };

    return alternatives[category] || [];
  };

  const openGoalModal = (goalId) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    // Don't allow changing completed goals
    if (goal.completed && isDateToday(goal.lastCompletedDate || '')) {
      Alert.alert(
        'Goal Already Completed',
        'You cannot change a goal that has been completed today.'
      );
      return;
    }

    const alternatives = getGoalAlternatives(goal.category);
    setSelectedGoalId(goalId);
    setGoalAlternatives(alternatives);
    setShowGoalModal(true);

    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const closeGoalModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setShowGoalModal(false);
      setSelectedGoalId(null);
      setGoalAlternatives([]);
    });
  };

  const selectGoalAlternative = async (alternative) => {
    try {
      const updatedGoals = goals.map((goal) => {
        if (goal.id === selectedGoalId) {
          return {
            ...goal,
            description: alternative.description,
            icon: alternative.icon,
            completed: false,
          };
        }
        return goal;
      });

      StorageService.saveGoalsData(updatedGoals);
      setGoals(updatedGoals);
      closeGoalModal();

      Alert.alert('Goal Updated! 🔄', `New goal: ${alternative.description}`);
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Calculate stats based on categories completed today
  const categoriesCompletedToday = new Set();
  goals.forEach((goal) => {
    if (goal.completed && isDateToday(goal.lastCompletedDate || '')) {
      categoriesCompletedToday.add(goal.category);
    }
  });
  const completedGoals = categoriesCompletedToday.size;

  // Animation interpolations
  const summarySlideY = summaryScaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const streakSlideY = streakAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  const goalsSlideY = goalsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const motivationSlideY = motivationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [25, 0],
  });

  const statsSlideY = statsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [35, 0],
  });

  const statsScale = statsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const modalSlideY = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const modalOpacity = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const totalCategories = new Set(goals.map((goal) => goal.category)).size;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor={'#007AFF'}
          />
        }>
        <View style={styles.content}>
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: headerSlideAnim }],
              },
            ]}>
            <Text style={styles.greeting}>
              {getGreeting()}, {userData?.name || 'Friend'}! 👋
            </Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </Animated.View>

          {/* Progress Summary */}
          <Animated.View
            style={[
              styles.summaryContainer,
              {
                transform: [
                  { scale: summaryScale },
                  { translateY: summarySlideY },
                ],
              },
            ]}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Today's Progress</Text>
              <Text style={styles.summaryValue}>
                {completedGoals}/{totalCategories}
              </Text>
              <Text style={styles.summarySubtitle}>categories completed</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${(completedGoals / totalCategories) * 100}%` },
                  ]}
                />
              </View>
            </View>
          </Animated.View>

          {/* Streak Counter - Now shows global streak */}
          <Animated.View
            style={{
              opacity: streakAnim,
              transform: [{ translateY: streakSlideY }],
            }}>
            <StreakCounter streak={globalStreak} />
          </Animated.View>

          {/* Goals Section */}
          <Animated.View
            style={[
              styles.goalsSection,
              {
                opacity: goalsAnim,
                transform: [{ translateY: goalsSlideY }],
              },
            ]}>
            <Text style={styles.sectionTitle}>Your Wellness Goals</Text>
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={{
                  ...goal,
                  streak: 0, // Individual goal streaks not shown anymore
                }}
                onToggle={() => toggleGoal(goal.id)}
                onSwap={() => openGoalModal(goal.id)}
                disabled={
                  goal.completed && isDateToday(goal.lastCompletedDate || '')
                }
                showSwap={
                  !(goal.completed && isDateToday(goal.lastCompletedDate || ''))
                }
              />
            ))}
          </Animated.View>

          {/* Motivational Message */}
          <Animated.View
            style={[
              styles.motivationCard,
              {
                opacity: motivationAnim,
                transform: [{ translateY: motivationSlideY }],
              },
            ]}>
            <Text style={styles.motivationText}>
              {completedGoals === totalCategories
                ? `Amazing work! You've completed all your daily goals! 🌟 Keep your ${globalStreak} day streak going!`
                : `You're doing great! ${
                    totalCategories - completedGoals
                  } more categor${
                    totalCategories - completedGoals === 1 ? 'y' : 'ies'
                  } to go! 💪`}
            </Text>
          </Animated.View>

          {/* Quick Stats */}
          <Animated.View
            style={[
              styles.quickStatsContainer,
              {
                opacity: statsAnim,
                transform: [{ translateY: statsSlideY }, { scale: statsScale }],
              },
            ]}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{globalStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{progress?.week || 0}</Text>
              <Text style={styles.statLabel}>Week Progress</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{progress?.month || 0}</Text>
              <Text style={styles.statLabel}>Month Progress</Text>
            </View>
          </Animated.View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                StorageService.clearAllData();
                setUserData(null);
                setGoals([]);
                setProgress(null);
                setGlobalStreak(0);
                Alert.alert('Logged Out', 'All your data has been cleared.');
                setIsOnboarded(false);
              }}>
              <Text style={styles.logoutText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Goal Change Modal */}
      <Modal
        visible={showGoalModal}
        transparent
        animationType="none"
        onRequestClose={closeGoalModal}>
        <Pressable style={styles.modalOverlay} onPress={closeGoalModal}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: modalOpacity,
                transform: [{ translateY: modalSlideY }],
              },
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose a New Goal</Text>
              <TouchableOpacity
                onPress={closeGoalModal}
                style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.alternativesList}
              showsVerticalScrollIndicator={false}>
              {goalAlternatives.map((alternative, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.alternativeItem}
                  onPress={() => selectGoalAlternative(alternative)}>
                  <Text style={styles.alternativeIcon}>{alternative.icon}</Text>
                  <Text style={styles.alternativeText}>
                    {alternative.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 30 },
  header: { marginBottom: 20 },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  date: { fontSize: 16, color: '#666' },
  summaryContainer: { marginBottom: 20 },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  summaryTitle: { fontSize: 16, color: '#666', marginBottom: 10 },
  summaryValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  summarySubtitle: { fontSize: 14, color: '#999', marginBottom: 15 },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  goalsSection: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  motivationCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  motivationText: {
    fontSize: 16,
    color: '#0369a1',
    textAlign: 'center',
    lineHeight: 22,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    flex: 0.3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: { fontSize: 12, color: '#666', textAlign: 'center' },
  logoutContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  logoutText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  alternativesList: {
    paddingHorizontal: 20,
  },
  alternativeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginVertical: 5,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  alternativeIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  alternativeText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
});

export default DashboardScreen;
