import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const SCREENS = {
  GENERAL: 'Configurações Gerais',
  PRIVACY: 'Prvacidade e Segurança',
  LANGUAGE: 'LanguageSelection',
  ROUTES: 'RoutesSettings'
};

export default function ConfigScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate(SCREENS.GENERAL)}
      >
        <Text style={styles.menuText}>Geral</Text>
        <Icon name="chevron-forward-outline" size={20} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate(SCREENS.PRIVACY)}
      >
        <Text style={styles.menuText}>Privacidade e Segurança</Text>
        <Icon name="chevron-forward-outline" size={20} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate(SCREENS.LANGUAGE)}
      >
        <Text style={styles.menuText}>Idioma do Aplicativo</Text>
        <View style={styles.languageContainer}>
          <Text style={styles.currentLanguage}>Português</Text>
          <Icon name="chevron-forward-outline" size={20} color="#666" />
        </View>
      </TouchableOpacity>

      {/* Configurações de Rotas Button */}
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate(SCREENS.ROUTES)}
      >
        <Text style={styles.menuText}>Configurações de Rotas</Text>
        <Icon name="chevron-forward-outline" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  menuText: {
    fontSize: 16,
    color: '#000',
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentLanguage: {
    marginRight: 10,
    color: '#666',
    fontSize: 14,
  },
});