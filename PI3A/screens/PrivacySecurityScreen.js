import React,{ useState }  from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function PrivacySecurityScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacidade e Segurança</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('ChangePassScreen')}
      >
        <Text style={styles.buttonText}>Alterar Senha</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5', 
    padding: 20 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 30,
    color: '#333'
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  buttonText: {
    color: '#000',
    fontSize: 16
  },
  optionItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee'
  }
});