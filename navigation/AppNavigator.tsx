import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import OTPScreen from '../screens/OTPScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EmergencyScreen from '../screens/EmergencyScreen';

const Stack = createStackNavigator();

const linking = {
  prefixes: ['mediscan://'],
  config: {
    screens: {
      Emergency: 'emergency/:userId',
    },
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator 
        initialRouteName="Landing"
        screenOptions={{
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OTP" component={OTPScreen} options={{ title: 'Verify OTP' }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'MediScan Dashboard', headerLeft: () => null }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Medical Profile' }} />
        <Stack.Screen name="Emergency" component={EmergencyScreen} options={{ title: 'EMERGENCY ID', headerStyle: { backgroundColor: '#dc2626' } }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
