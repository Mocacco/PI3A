// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomNavigation from './components/BottomNavigation';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';

export default function App() {
  return (
     <NavigationContainer>
       <BottomNavigation />
     </NavigationContainer>
  );
}

