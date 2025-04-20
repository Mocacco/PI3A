// routes.js ou BottomNavigation.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import LocationsListScreen from '../screens/LocationsListScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import ConfigStack from '../screens/ConfigStack'; // <-- novo import

const Tab = createBottomTabNavigator();

export default function BottomNavigation() {
  return (
  <Tab.Navigator
    initialRouteName="Home"
     >
    <Tab.Screen
      name="Configurações"
      component={ConfigStack}
      options={{ tabBarIcon: () => <Icon name="settings-outline" size={20} /> }}
    />
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ tabBarIcon: () => <Icon name="home-outline" size={20} /> }}
    />
    <Tab.Screen
      name="Lista"
      component={LocationsListScreen}
      options={{ tabBarIcon: () => <Icon name="list-outline" size={20} /> }}
    />
  </Tab.Navigator>
  
  );
}
