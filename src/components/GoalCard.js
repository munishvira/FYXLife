import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';

const GoalCard = ({ goal, onToggle, onSwap, showSwap }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle();
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.card, goal.completed && styles.completedCard]}
        onPress={handlePress}
        activeOpacity={0.8}>
        <View style={styles.cardContent}>
          {/* Left icon */}
          <Text style={styles.icon}>{goal.icon}</Text>

          {/* Main text */}
          <View style={styles.textContainer}>
            <Text
              style={[styles.title, goal.completed && styles.completedText]}>
              {goal.title}
            </Text>
            <Text
              style={[
                styles.description,
                goal.completed && styles.completedText,
              ]}>
              {goal.description}
            </Text>
            {goal.streak > 0 && (
              <Text style={styles.streak}>🔥 {goal.streak} day streak</Text>
            )}
          </View>

          {/* Status + Swap inside */}
          <View style={styles.rightActions}>
            <View
              style={[styles.checkbox, goal.completed && styles.checkedBox]}>
              {goal.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>

            {showSwap && (
              <TouchableOpacity style={styles.swapButton} onPress={onSwap}>
                <Text style={styles.swapText}>🔄</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 15,
  },
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#FF0000',
  },
  completedCard: {
    backgroundColor: '#f0f9ff',
    borderLeftColor: '#10b981',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#10b981',
  },
  streak: {
    fontSize: 12,
    color: '#ff6b35',
    fontWeight: '600',
  },
  rightActions: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  checkedBox: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  swapButton: {
    padding: 6,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  swapText: {
    fontSize: 14, // smaller
  },
});

export default GoalCard;
