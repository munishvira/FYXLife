import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StorageService from '../../services/StorageService';

const ConfirmationScreen = ({ route, setIsOnboarded }) => {
  const { userData } = route.params;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  const profileAnim = React.useRef(new Animated.Value(0)).current;
  const buttonAnim = React.useRef(new Animated.Value(0)).current;
  const emojiRotateAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    saveUserData();
    startAnimations();
  }, []);

  const saveUserData = async () => {
    try {
      StorageService.saveUserData(userData);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const startAnimations = () => {
    // Sequence animations for better flow
    Animated.sequence([
      // First: Celebration section appears
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 120,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Small delay
      Animated.delay(200),
      // Second: Profile summary slides in from bottom
      Animated.spring(profileAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      // Third: Button appears with bounce
      Animated.delay(150),
      Animated.spring(buttonAnim, {
        toValue: 1,
        tension: 120,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous emoji rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(emojiRotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(emojiRotateAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleContinue = () => {
    setIsOnboarded(true);
  };

  const emojiRotate = emojiRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  const profileSlideY = profileAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const profileScale = profileAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const buttonScale = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const buttonSlideY = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.celebrationContainer,
            {
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}>
          <Animated.Text
            style={[
              styles.celebrationEmoji,
              { transform: [{ rotate: emojiRotate }] },
            ]}>
            🎉
          </Animated.Text>
          <Text style={styles.title}>
            Hi {userData.name}, your profile is ready ✨
          </Text>
          <Text style={styles.subtitle}>
            You're all set to start your wellness journey!
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.profileSummary,
            {
              opacity: profileAnim,
              transform: [
                { translateY: profileSlideY },
                { scale: profileScale },
              ],
            },
          ]}>
          <Text style={styles.summaryTitle}>Profile Summary</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Age:</Text>
            <Text style={styles.summaryValue}>{userData.age} years</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Activity Level:</Text>
            <Text style={styles.summaryValue}>
              {userData.activityLevel
                .replace('_', ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </Text>
          </View>
          {userData.height && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Height:</Text>
              <Text style={styles.summaryValue}>{userData.height} cm</Text>
            </View>
          )}
          {userData.weight && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Weight:</Text>
              <Text style={styles.summaryValue}>{userData.weight} kg</Text>
            </View>
          )}
        </Animated.View>

        <Animated.View
          style={{
            width: '100%',
            opacity: buttonAnim,
            transform: [{ scale: buttonScale }, { translateY: buttonSlideY }],
          }}>
          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Start Your Journey</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  celebrationEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  profileSummary: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 40,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ConfirmationScreen;
