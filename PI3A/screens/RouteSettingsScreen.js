import React from 'react';
import { View, Switch, Text, StyleSheet } from 'react-native';

export default function RouteSettingsScreen() {
  const [settings, setSettings] = React.useState({
    avoidHighways: false,
    avoidTolls: true,
    optimizeRoute: true
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({...prev, [key]: !prev[key]}));
  };

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
});