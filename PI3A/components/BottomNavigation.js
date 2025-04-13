import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ConfigScreen from '../screens/ConfigScreen';
import LocationsListScreen from '../screens/LocationsListScreen';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export default function BottomNavigation() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Configurações" component={ConfigScreen} options={{ tabBarIcon: () => <Icon name="settings-outline" size={20} /> }} />
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: () => <Icon name="home-outline" size={20} /> }} />
      <Tab.Screen name="Locais" component={LocationsListScreen} options={{ tabBarIcon: () => <Icon name="list-outline" size={20} /> }} />

    </Tab.Navigator>
  );
}
