// ConfigStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ConfigScreen from '../screens/ConfigScreen';
import GeneralSettingsScreen from '../screens/GeneralSettingsScreen';
import PrivacySecurityScreen from '../screens/PrivacySecurityScreen';

const Stack = createStackNavigator();

export default function ConfigStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ConfigScreen" component={ConfigScreen} options={{  headerShown: false }} />
      <Stack.Screen name="GeneralSettings" component={GeneralSettingsScreen} />
      <Stack.Screen name="PrivacySecurityScreen" component={PrivacySecurityScreen} />
    </Stack.Navigator>
  );
}
