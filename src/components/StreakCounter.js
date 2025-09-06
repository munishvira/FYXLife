import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const StreakCounter = ({ streak }) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  if (streak === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noStreakText}>Start your streak today! 💪</Text>
      </View>
    );
  }

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
      <View style={styles.streakCard}>
        <Text style={styles.fireEmoji}>🔥</Text>
        <View>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakText}>day streak</Text>
        </View>
        <Text style={styles.celebration}>🎉</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  streakCard: {
    backgroundColor: '#ff6b35',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fireEmoji: {
    fontSize: 30,
    marginRight: 15,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  streakText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  celebration: {
    fontSize: 30,
    marginLeft: 15,
  },
  noStreakText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default StreakCounter;
