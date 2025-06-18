import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import API_URL from '../API_URL';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChangePassScreen({ navigation }) {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem('userToken');

    if (!currentPass || !newPass || !confirmPass) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios');
      return;
    }

    if (newPass !== confirmPass) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    try {
      const response = await fetch(`${API_URL}:3001/auth/change-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          currentPassword: currentPass,
          newPassword: newPass
        })
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Senha alterada com sucesso');
        navigation.goBack();
      } else {
        Alert.alert('Erro', 'Erro ao alterar a senha');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão com o servidor');
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.label}>Senha Atual</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={currentPass}
        onChangeText={setCurrentPass}
        placeholder="Digite sua senha atual"
      />

      <Text style={styles.label}>Nova Senha</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={newPass}
        onChangeText={setNewPass}
        placeholder="Digite a nova senha"
      />

      <Text style={styles.label}>Confirmar Nova Senha</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={confirmPass}
        onChangeText={setConfirmPass}
        placeholder="Confirme a nova senha"
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>Salvar Alterações</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333'
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#555'
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  button: {
    backgroundColor: '#4d4d4d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});