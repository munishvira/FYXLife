import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

class StorageService {
  static USER_DATA_KEY = 'user_data';
  static GOALS_DATA_KEY = 'goals_data';
  static PROGRESS_DATA_KEY = 'progress_data';
  static ONBOARDING_KEY = 'onboarding_completed';
  static STREAK_DATA_KEY = 'streak_data';

  // ===== USER =====
  saveUserData(userData) {
    try {
      storage.set(StorageService.USER_DATA_KEY, JSON.stringify(userData));
      storage.set(StorageService.ONBOARDING_KEY, 'true');
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  getUserData() {
    try {
      const data = storage.getString(StorageService.USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  isOnboardingCompleted() {
    try {
      const completed = storage.getString(StorageService.ONBOARDING_KEY);
      return completed === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  // ===== GOALS =====
  saveGoalsData(goalsData) {
    try {
      storage.set(StorageService.GOALS_DATA_KEY, JSON.stringify(goalsData));
    } catch (error) {
      console.error('Error saving goals data:', error);
    }
  }

  getGoalsData() {
    try {
      const data = storage.getString(StorageService.GOALS_DATA_KEY);
      return data ? JSON.parse(data) : this.getDefaultGoals();
    } catch (error) {
      console.error('Error getting goals data:', error);
      return this.getDefaultGoals();
    }
  }

  getDefaultGoals() {
    return [
      { id: '1', title: 'Move', description: '30 min walk', icon: '🚶‍♂️', completed: false, streak: 0, category: 'movement' },
      { id: '2', title: 'Eat', description: '5 servings of fruits/vegetables', icon: '🥗', completed: false, streak: 0, category: 'nutrition' },
      { id: '3', title: 'Calm', description: '10 min meditation', icon: '🧘‍♀️', completed: false, streak: 0, category: 'mindfulness' },
    ];
  }

  // ===== PROGRESS =====
  saveProgressData(progressData) {
    try {
      storage.set(StorageService.PROGRESS_DATA_KEY, JSON.stringify(progressData));
    } catch (error) {
      console.error('Error saving progress data:', error);
    }
  }

  getProgressData() {
    try {
      const data = storage.getString(StorageService.PROGRESS_DATA_KEY);
      return data ? JSON.parse(data) : this.getDefaultProgress();
    } catch (error) {
      console.error('Error getting progress data:', error);
      return this.getDefaultProgress();
    }
  }

  getDefaultProgress() {
    return {
      today: 0,
      week: 0,
      month: 0,
      totalGoals: 3,
      lastUpdated: new Date().toDateString(),
    };
  }

  // ===== STREAK =====
  saveStreakData(streakData) {
    try {
      storage.set(StorageService.STREAK_DATA_KEY, JSON.stringify(streakData));
    } catch (error) {
      console.error('Error saving streak data:', error);
    }
  }

  getStreakData() {
    try {
      const data = storage.getString(StorageService.STREAK_DATA_KEY);
      return data ? JSON.parse(data) : this.getDefaultStreak();
    } catch (error) {
      console.error('Error getting streak data:', error);
      return this.getDefaultStreak();
    }
  }

  getDefaultStreak() {
    return {
      currentStreak: 0,
      highestStreak: 0,
      lastCompletedDate: null,
    };
  }

  // ===== CLEAR ALL =====
  clearAllData() {
    try {
      storage.clearAll();
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
}

export default new StorageService();