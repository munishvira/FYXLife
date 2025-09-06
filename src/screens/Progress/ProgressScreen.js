import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import StorageService from '../../services/StorageService';
import Svg, {
  G,
  Circle,
  Path,
  Text as SvgText,
  Rect,
  Line,
} from 'react-native-svg';

const { width } = Dimensions.get('window');

const ProgressScreen = () => {
  const [progress, setProgress] = useState(null);
  const [goals, setGoals] = useState([]);
  const [chartView, setChartView] = useState('overview'); // 'overview', 'category', 'trends'
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Animation values for different sections
  const titleAnim = React.useRef(new Animated.Value(0)).current;
  const overviewAnim = React.useRef(new Animated.Value(0)).current;
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const categoryAnim = React.useRef(new Animated.Value(0)).current;
  const insightsAnim = React.useRef(new Animated.Value(0)).current;
  const chartAnim = React.useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    startAnimations();
  }, []);

  useEffect(() => {
    // Animate chart when view changes
    chartAnim.setValue(0);
    Animated.timing(chartAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [chartView, selectedCategory]);

  const startAnimations = () => {
    // Reset animations
    titleAnim.setValue(0);
    overviewAnim.setValue(0);
    progressAnim.setValue(0);
    categoryAnim.setValue(0);
    insightsAnim.setValue(0);
    chartAnim.setValue(0);

    // Fast sequence animations
    Animated.sequence([
      // Title slides down
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),

      // Overview cards scale in
      Animated.delay(30),
      Animated.timing(overviewAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),

      // Progress bars slide up
      Animated.delay(30),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),

      // Chart appears
      Animated.delay(30),
      Animated.timing(chartAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      // Category cards appear
      Animated.delay(30),
      Animated.timing(categoryAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),

      // Insights card slides in
      Animated.delay(30),
      Animated.timing(insightsAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadData = async () => {
    try {
      const [progressData, goalsData] = [
        StorageService.getProgressData(),
        StorageService.getGoalsData(),
      ];
      setProgress(progressData);
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const getProgressPercentage = (completed, total) => {
    return total > 0 ? (completed / total) * 100 : 0;
  };

  // Chart View Selector
  const ChartViewSelector = () => {
    const views = [
      { key: 'overview', label: 'Overview' },
      { key: 'trends', label: 'Trends' },
    ];

    return (
      <View style={styles.viewSelector}>
        {views.map((view) => (
          <TouchableOpacity
            key={view.key}
            style={[
              styles.viewButton,
              chartView === view.key && styles.viewButtonActive,
            ]}
            onPress={() => setChartView(view.key)}>
            <Text
              style={[
                styles.viewButtonText,
                chartView === view.key && styles.viewButtonTextActive,
              ]}>
              {view.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Bar Chart Component
  const BarChart = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map((d) => d.value));
    const barWidth = (width - 80) / data.length - 10;
    const chartHeight = height - 40;

    return (
      <Svg width={width - 40} height={height}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * chartHeight;
          const x = 20 + index * (barWidth + 10);
          const y = height - barHeight - 20;

          return (
            <G key={index}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#3b82f6"
                rx={4}
              />
              <SvgText
                x={x + barWidth / 2}
                y={height - 5}
                textAnchor="middle"
                fontSize="12"
                fill="#666">
                {item.label}
              </SvgText>
              <SvgText
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill="#333">
                {item.value}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    );
  };

  // Line Chart Component
  const LineChart = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map((d) => d.value));
    const stepX = (width - 80) / (data.length - 1);
    const chartHeight = height - 40;

    const points = data
      .map((item, index) => {
        const x = 40 + index * stepX;
        const y = 20 + (chartHeight - (item.value / maxValue) * chartHeight);
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((percentage, index) => {
          const y = 20 + (chartHeight * (100 - percentage)) / 100;
          return (
            <Line
              key={index}
              x1={40}
              y1={y}
              x2={width - 40}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          );
        })}

        {/* Line */}
        <Path
          d={`M${points}`}
          stroke="#10b981"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {data.map((item, index) => {
          const x = 40 + index * stepX;
          const y = 20 + (chartHeight - (item.value / maxValue) * chartHeight);
          return (
            <Circle
              key={index}
              cx={x}
              cy={y}
              r={4}
              fill="#10b981"
              stroke="#fff"
              strokeWidth="2"
            />
          );
        })}

        {/* Labels */}
        {data.map((item, index) => {
          const x = 40 + index * stepX;
          return (
            <SvgText
              key={index}
              x={x}
              y={height - 5}
              textAnchor="middle"
              fontSize="12"
              fill="#666">
              {item.label}
            </SvgText>
          );
        })}
      </Svg>
    );
  };

  // Chart Content Renderer
  const renderChart = () => {
    if (!progress || !goals.length) return null;

    const chartScale = chartAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    const chartOpacity = chartAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    switch (chartView) {
      case 'overview':
        const overviewData = [
          { label: 'Today', value: progress.today || 0 },
          { label: 'Week', value: progress.week || 0 },
          { label: 'Month', value: progress.month || 0 },
        ];
        return (
          <Animated.View
            style={[
              styles.chartContainer,
              {
                opacity: chartOpacity,
                transform: [{ scale: chartScale }],
              },
            ]}>
            <Text style={styles.chartTitle}>Progress Overview</Text>
            <View style={styles.chartWrapper}>
              <BarChart data={overviewData} />
            </View>
          </Animated.View>
        );

      case 'trends':
        // Mock weekly trend data - you can replace with actual data from StorageService
        const trendData = [
          { label: 'Mon', value: 80 },
          { label: 'Tue', value: 90 },
          { label: 'Wed', value: 75 },
          { label: 'Thu', value: 95 },
          { label: 'Fri', value: 85 },
          { label: 'Sat', value: 70 },
          { label: 'Sun', value: 60 },
        ];

        return (
          <Animated.View
            style={[
              styles.chartContainer,
              {
                opacity: chartOpacity,
                transform: [{ scale: chartScale }],
              },
            ]}>
            <Text style={styles.chartTitle}>7-Day Completion Trend</Text>
            <View style={styles.chartWrapper}>
              <LineChart data={trendData} height={220} />
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  const ProgressBar = ({ label, completed, total, color }) => {
    const barAnim = React.useRef(new Animated.Value(0)).current;
    const percentage = getProgressPercentage(completed, total);

    React.useEffect(() => {
      Animated.timing(barAnim, {
        toValue: percentage,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }, [percentage]);

    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={styles.progressValue}>
            {completed}/{total} ({Math.round(percentage)}%)
          </Text>
        </View>
        <View style={styles.progressBarTrack}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: color,
                width: barAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>
    );
  };

  const CategoryProgress = ({ category, goals }) => {
    const categoryGoals = goals.filter((goal) => goal.category === category);
    const completedGoals = categoryGoals.filter(
      (goal) => goal.completed
    ).length;
    const totalStreak = categoryGoals.reduce(
      (sum, goal) => sum + goal.streak,
      0
    );

    return (
      <View style={styles.categoryCard}>
        <Text style={styles.categoryTitle}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Text>
        <View style={styles.categoryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedGoals}</Text>
            <Text style={styles.statLabel}>Completed Today</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalStreak}</Text>
            <Text style={styles.statLabel}>Total Streak</Text>
          </View>
        </View>
      </View>
    );
  };

  if (!progress) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalPossibleToday = goals.length;
  const totalPossibleWeek = goals.length * 7;
  const totalPossibleMonth = goals.length * 30;

  // Animation interpolations
  const titleSlideY = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  const overviewScale = overviewAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const overviewSlideY = overviewAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const progressSlideY = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [25, 0],
  });

  const categorySlideY = categoryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [25, 0],
  });

  const insightsSlideX = insightsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title */}
          <Animated.View
            style={{
              transform: [{ translateY: titleSlideY }],
            }}>
            <Text style={styles.title}>Your Progress 📊</Text>
          </Animated.View>

          {/* Overview Cards */}
          <Animated.View
            style={[
              styles.overviewContainer,
              {
                transform: [
                  { scale: overviewScale },
                  { translateY: overviewSlideY },
                ],
              },
            ]}>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewTitle}>Today</Text>
              <Text style={styles.overviewValue}>
                {progress.today}/{totalPossibleToday}
              </Text>
              <Text style={styles.overviewSubtitle}>goals completed</Text>
            </View>

            <View style={styles.overviewCard}>
              <Text style={styles.overviewTitle}>This Week</Text>
              <Text style={styles.overviewValue}>
                {progress.week}/{totalPossibleWeek}
              </Text>
              <Text style={styles.overviewSubtitle}>goals completed</Text>
            </View>
          </Animated.View>

          {/* Progress Bars */}
          <Animated.View
            style={[
              styles.progressSection,
              {
                transform: [{ translateY: progressSlideY }],
              },
            ]}>
            <Text style={styles.sectionTitle}>Progress Overview</Text>

            <ProgressBar
              label="Today's Goals"
              completed={progress.today}
              total={totalPossibleToday}
              color="#10b981"
            />

            <ProgressBar
              label="Weekly Goals"
              completed={progress.week}
              total={totalPossibleWeek}
              color="#3b82f6"
            />

            <ProgressBar
              label="Monthly Goals"
              completed={progress.month}
              total={totalPossibleMonth}
              color="#8b5cf6"
            />
          </Animated.View>

          {/* Chart View Selector */}
          <ChartViewSelector />

          {/* Interactive Charts */}
          {renderChart()}

          {/* Category Breakdown */}
          <Animated.View
            style={[
              styles.categorySection,
              {
                transform: [{ translateY: categorySlideY }],
              },
            ]}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            <CategoryProgress category="movement" goals={goals} />
            <CategoryProgress category="nutrition" goals={goals} />
            <CategoryProgress category="mindfulness" goals={goals} />
          </Animated.View>

          {/* Insights */}
          <Animated.View
            style={[
              styles.insightsCard,
              {
                transform: [{ translateX: insightsSlideX }],
              },
            ]}>
            <Text style={styles.insightsTitle}>💡 Insights</Text>
            <Text style={styles.insightsText}>
              {progress.today === totalPossibleToday
                ? "Amazing! You've completed all your goals today. Keep up the great work!"
                : progress.today > totalPossibleToday / 2
                ? "Great progress today! You're more than halfway to your daily goals."
                : "You're off to a good start! Complete more goals to build momentum."}
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  overviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  overviewCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    flex: 0.48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  overviewTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  overviewValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  overviewSubtitle: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressValue: {
    fontSize: 16,
    color: '#666',
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  // Chart Styles
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonActive: {
    backgroundColor: '#3b82f6',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  viewButtonTextActive: {
    color: 'white',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  legendContainer: {
    alignItems: 'flex-start',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryCard: {
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
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  insightsCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 15,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  insightsText: {
    fontSize: 16,
    color: '#856404',
    lineHeight: 22,
  },
});

export default ProgressScreen;
