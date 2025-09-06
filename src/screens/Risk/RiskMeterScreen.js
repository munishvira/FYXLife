import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StorageService from '../../services/StorageService';

const RiskMeterScreen = () => {
  const [userData, setUserData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('cardio');

  // Animations
  const titleAnim = useRef(new Animated.Value(0)).current;
  const categoryAnim = useRef(new Animated.Value(0)).current;
  const riskAnim = useRef(new Animated.Value(0)).current;
  const recommendationsAnim = useRef(new Animated.Value(0)).current;
  const disclaimerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserData();
    startAnimations();
  }, []);

  const startAnimations = () => {
    titleAnim.setValue(0);
    categoryAnim.setValue(0);
    riskAnim.setValue(0);
    recommendationsAnim.setValue(0);
    disclaimerAnim.setValue(0);

    Animated.sequence([
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(30),
      Animated.timing(categoryAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(30),
      Animated.timing(riskAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(30),
      Animated.timing(recommendationsAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(30),
      Animated.timing(disclaimerAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadUserData = async () => {
    try {
      const data = StorageService.getUserData();
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const calculateRiskLevel = (baseRisk, userData) => {
    if (!userData) return baseRisk;
    let adjustedRisk = baseRisk;
    const age = parseInt(userData.age) || 35;
    if (age > 40) adjustedRisk += 10;
    if (age > 50) adjustedRisk += 15;

    const activityMultiplier = {
      sedentary: 1.2,
      lightly_active: 1.0,
      moderately_active: 0.8,
      very_active: 0.6,
    };
    adjustedRisk *= activityMultiplier[userData.activityLevel] || 1.0;

    return Math.min(Math.max(adjustedRisk, 5), 85);
  };

  const getRiskColor = (risk) => {
    if (risk < 30) return '#10b981';
    if (risk < 60) return '#f59e0b';
    return '#ef4444';
  };

  const getRiskText = (risk) => {
    if (risk < 30) return 'Low Risk';
    if (risk < 60) return 'Moderate Risk';
    return 'High Risk';
  };

  const riskCategories = {
    cardio: {
      name: 'Cardio',
      icon: '❤️',
      risks: [
        { name: 'Heart Disease', baseRisk: 25 },
        { name: 'High Blood Pressure', baseRisk: 35 },
        { name: 'Stroke', baseRisk: 15 },
        { name: 'Atherosclerosis', baseRisk: 30 },
      ],
    },
    metabolic: {
      name: 'Metabolic',
      icon: '🔥',
      risks: [
        { name: 'Type 2 Diabetes', baseRisk: 20 },
        { name: 'Metabolic Syndrome', baseRisk: 28 },
        { name: 'Obesity', baseRisk: 32 },
        { name: 'High Cholesterol', baseRisk: 40 },
      ],
    },
    musculo: {
      name: 'Musculo',
      icon: '🦴',
      risks: [
        { name: 'Osteoporosis', baseRisk: 18 },
        { name: 'Osteoarthritis', baseRisk: 25 },
        { name: 'Back Pain', baseRisk: 45 },
        { name: 'Muscle Loss', baseRisk: 30 },
      ],
    },
    mental: {
      name: 'Mental',
      icon: '🧠',
      risks: [
        { name: 'Depression', baseRisk: 22 },
        { name: 'Anxiety', baseRisk: 28 },
        { name: 'Cognitive Decline', baseRisk: 15 },
        { name: 'Sleep Disorders', baseRisk: 35 },
      ],
    },
  };

  const RiskBar = ({ risk, name }) => {
    const barAnim = useRef(new Animated.Value(0)).current;
    const calculatedRisk = calculateRiskLevel(risk, userData);
    const riskColor = getRiskColor(calculatedRisk);

    useEffect(() => {
      Animated.timing(barAnim, {
        toValue: calculatedRisk,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }, [calculatedRisk]);

    return (
      <View style={styles.riskBarContainer}>
        <View style={styles.riskHeader}>
          <Text style={styles.riskName}>{name}</Text>
          <Text style={[styles.riskPercentage, { color: riskColor }]}>
            {Math.round(calculatedRisk)}%
          </Text>
        </View>
        <View style={styles.riskBarTrack}>
          <Animated.View
            style={[
              styles.riskBarFill,
              {
                backgroundColor: riskColor,
                width: barAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={[styles.riskLabel, { color: riskColor }]}>
          {getRiskText(calculatedRisk)}
        </Text>
      </View>
    );
  };

  const CategoryButton = ({ categoryKey, category, isSelected, onPress }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        isSelected && styles.selectedCategoryButton,
      ]}
      onPress={onPress}>
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <Text
        style={[
          styles.categoryButtonText,
          isSelected && styles.selectedCategoryText,
        ]}>
        {category.name.split(' ')[0]}
      </Text>
    </TouchableOpacity>
  );

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading risk assessment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedCategoryData = riskCategories[selectedCategory];
  const allRisks = Object.values(riskCategories).flatMap((cat) =>
    cat.risks.map((r) => calculateRiskLevel(r.baseRisk, userData))
  );
  const avgRisk = allRisks.reduce((a, b) => a + b, 0) / allRisks.length;
  const overallScore = Math.round(100 - avgRisk);

  // animations
  const titleSlideY = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });
  const categorySlideX = categoryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });
  const riskSlideY = riskAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });
  const riskScale = riskAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });
  const recommendationsSlideX = recommendationsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 0],
  });
  const disclaimerSlideY = disclaimerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [25, 0],
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title */}
          <Animated.View style={{ transform: [{ translateY: titleSlideY }] }}>
            <Text style={styles.title}>Risk-o-meter ⚠️</Text>
            <Text style={styles.subtitle}>
              Assessment for {userData.name}, {userData.age} years old
            </Text>
          </Animated.View>

          {/* Overall Health Score */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Overall Health Score</Text>
            <Text style={styles.scoreValue}>{overallScore}/100</Text>
          </View>

          {/* Category Selector */}
          <Animated.View
            style={{ transform: [{ translateX: categorySlideX }] }}>
            <View style={styles.fullWidthRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categorySelector}
                contentContainerStyle={styles.categorySelectorContent}>
                {Object.entries(riskCategories).map(([key, category]) => (
                  <CategoryButton
                    key={key}
                    categoryKey={key}
                    category={category}
                    isSelected={selectedCategory === key}
                    onPress={() => setSelectedCategory(key)}
                  />
                ))}
              </ScrollView>
            </View>
          </Animated.View>

          {/* Risk Assessment */}
          <Animated.View
            style={[
              styles.riskSection,
              { transform: [{ translateY: riskSlideY }, { scale: riskScale }] },
            ]}>
            <Text style={styles.sectionTitle}>
              {selectedCategoryData.icon} {selectedCategoryData.name}
            </Text>
            {selectedCategoryData.risks.map((risk, idx) => (
              <RiskBar key={idx} risk={risk.baseRisk} name={risk.name} />
            ))}
          </Animated.View>

          {/* Recommendations */}
          <Animated.View
            style={[
              styles.recommendationsCard,
              { transform: [{ translateX: recommendationsSlideX }] },
            ]}>
            <Text style={styles.recommendationsTitle}>💡 Recommendations</Text>
            <View style={styles.recommendationsList}>
              <Text style={styles.recommendation}>
                • Maintain regular physical activity (
                {userData.activityLevel.replace('_', ' ')})
              </Text>
              <Text style={styles.recommendation}>
                • Complete your daily wellness goals consistently
              </Text>
              <Text style={styles.recommendation}>
                • Schedule regular health check-ups with your doctor
              </Text>
              <Text style={styles.recommendation}>
                • Monitor your progress and adjust lifestyle habits accordingly
              </Text>
            </View>
          </Animated.View>

          {/* Disclaimer */}
          <Animated.View
            style={[
              styles.disclaimerCard,
              { transform: [{ translateY: disclaimerSlideY }] },
            ]}>
            <Text style={styles.disclaimerTitle}>⚠️ Important Note</Text>
            <Text style={styles.disclaimerText}>
              This risk assessment is for educational purposes only and should
              not replace professional medical advice. Please consult with
              healthcare providers for personalized health assessments.
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },

  scoreCard: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  scoreLabel: { fontSize: 16, fontWeight: '600', color: '#616161' },
  scoreValue: { fontSize: 28, fontWeight: '800', color: '#3f51b5' },

  fullWidthRow: {
    marginLeft: -20,
    marginRight: -20,
  },
  categorySelector: { marginBottom: 30 },
  categorySelectorContent: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  categoryButton: {
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedCategoryButton: { backgroundColor: '#007AFF' },
  categoryIcon: { fontSize: 22, marginBottom: 4 },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  selectedCategoryText: { color: 'white' },

  riskSection: { marginBottom: 30 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  riskBarContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  riskName: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1 },
  riskPercentage: { fontSize: 18, fontWeight: 'bold' },
  riskBarTrack: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  riskBarFill: { height: '100%', borderRadius: 4 },
  riskLabel: { fontSize: 12, fontWeight: '600', textAlign: 'right' },

  recommendationsCard: {
    backgroundColor: '#e6f7ff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#1890ff',
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0050b3',
    marginBottom: 15,
  },
  recommendationsList: { marginLeft: 10 },
  recommendation: {
    fontSize: 14,
    color: '#0050b3',
    marginBottom: 8,
    lineHeight: 20,
  },

  disclaimerCard: {
    backgroundColor: '#fff2f0',
    borderRadius: 15,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4d4f',
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#cf1322',
    marginBottom: 10,
  },
  disclaimerText: { fontSize: 14, color: '#cf1322', lineHeight: 20 },
});

export default RiskMeterScreen;
