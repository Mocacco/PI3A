import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomNavigation from './components/BottomNavigation';

export default function App() {
  return (
    <NavigationContainer>
      <BottomNavigation />
    </NavigationContainer>
  );
}

