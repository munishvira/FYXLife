import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import WelcomeScreen from './src/screens/Onboarding/WelcomeScreen';
import UserInfoScreen from './src/screens/Onboarding/UserInfoScreen';
import ConfirmationScreen from './src/screens/Onboarding/ConfirmationScreen';
import DashboardScreen from './src/screens/Dashboard/DashboardScreen';
import ProgressScreen from './src/screens/Progress/ProgressScreen';
import RiskMeterScreen from './src/screens/Risk/RiskMeterScreen';

// Services
import StorageService from './src/services/StorageService';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator({setIsOnboarded}) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Risk-o-meter') {
            iconName = focused ? 'warning' : 'warning-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          paddingBottom: 5,
          height: 60,
        },
      })}>
      <Tab.Screen name="Dashboard">
        {(props) => (
          <DashboardScreen {...props} setIsOnboarded={setIsOnboarded} />
        )}
      </Tab.Screen>
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Risk-o-meter" component={RiskMeterScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboarded = StorageService.isOnboardingCompleted();
      setIsOnboarded(onboarded);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Fyxlife...</Text>
        <Text style={styles.loadingEmoji}>🏃‍♂️</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isOnboarded ? (
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="UserInfo" component={UserInfoScreen} />
              <Stack.Screen name="Confirmation">
                {(props) => (
                  <ConfirmationScreen {...props} setIsOnboarded={setIsOnboarded} />
                )}
              </Stack.Screen>
            </>
          ) : (
            <Stack.Screen name="Main">
              {(props) => (
                <TabNavigator {...props} setIsOnboarded={setIsOnboarded} />
              )}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
  },
  loadingEmoji: {
    fontSize: 50,
  },
});
