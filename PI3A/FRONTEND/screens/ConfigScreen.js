import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCREENS = {
  GENERAL: 'Configurações Gerais',
  PRIVACY: 'Privacidade e Segurança',
  LANGUAGE: 'LanguageSelection',
  ROUTES: 'RoutesSettings'
};

export default function ConfigScreen({ navigation }) {

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userToken');
            navigation.reset({
              index: 0,
              routes: [{ name: 'SignIn' }]
            });
          }
        },
      ]
    );
  };

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

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Sair da Conta</Text>
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
  logoutButton: {
    marginTop: 40,
    marginHorizontal: 15,
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});