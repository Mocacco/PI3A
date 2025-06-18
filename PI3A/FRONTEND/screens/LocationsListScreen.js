import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import API_URL from '../API_URL';
import * as location from 'expo-location';
import LocationSearchInput from '../components/LocationSearchInput';
import { useNavigation } from '@react-navigation/native';

export default function LocationsListScreen() {
  const [locations, setLocations] = useState([]);
  const [userCoords, setUserCoords] = useState('');
  const navigation = useNavigation();

  //carrega localização do usuário
  useEffect(() => {
    (async () => {
      const loc = await Location.getCurrentPositionAsync({});
      setUserCoords(loc.coords);
    })()
  }, []);

  // Carrega os locais salvos
  useEffect(() => {
    const fetchLocations = async () => {
      const token = await AsyncStorage.getItem('userToken');

      const response = await fetch(`${API_URL}:3001/locations/lista`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.locations) {
        setLocations(data.locations);
      }
    };

    fetchLocations();
  }, []);

  // Adiciona locais
  const handleAddLocation = async (item) => {
    const token = await AsyncStorage.getItem('userToken');

    const location = {
      name: item.description,
      latitude: item.latitude,
      longitude: item.longitude
    };

    try {
      const response = await fetch(`${API_URL}:3001/locations/salvar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ location })
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Erro ao adicionar local:", text);
        Alert.alert("Erro", "Não foi possível adicionar o local");
        return;
      }

      const data = await response.json();
      console.log('Resposta do backend (add):', data);

      if (response.ok) {
        const novoLocal = { id: data.id, ...location };
        setLocations(prev => [...prev, novoLocal]);
        console.log('Lista atualizada:', [...locations, novoLocal]);
      } else {
        Alert.alert('Erro', data.message || 'Não foi possível salvar o local.');
      }
    } catch (err) {
      console.error('Erro ao adicionar local:', err);
      Alert.alert('Erro', 'Erro inesperado ao salvar local');
    }
  };

  // Remove local
  const handleRemoveLocation = async (id) => {
    const token = await AsyncStorage.getItem('userToken');
    console.log('Removendo local ID:', id);

    try {
      const response = await fetch(`${API_URL}:3001/locations/remove/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setLocations(prev => prev.filter(loc => loc.id !== id));
        Alert.alert("Sucesso", "Local removido com sucesso.");
      } else {
        Alert.alert('Erro', 'Não foi possível remover o local.');
      }
    } catch (err) {
      console.error('Erro ao remover local:', err);
      Alert.alert('Erro', 'Erro inesperado ao remover local.');
    }
  };

  // Confirm remoção com alerta
  const confirmRemove = (id) => {  
    Alert.alert(
      "Remover Local",
      "Tem certeza que deseja remover este local?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Remover", 
          style: 'destructive',
          onPress: () => {
            handleRemoveLocation(id)
          }
        }
      ]
    );
  };

  const goToMapWithPin = (location) => {
    navigation.navigate('Home', {
      destination: {
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude
      }
    });
  };

  return (
    <View style={styles.container}>
      <LocationSearchInput
        currentCoords={userCoords}
        onSelectLocation={handleAddLocation}
      />

      <FlatList
        data={locations}
        keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.item}>
              <Text>{item.name}</Text>
            </View>
            <TouchableOpacity 
              style={styles.pinButton}
              onPress={() => goToMapWithPin(item)}
            >
              <Icon name="location-sharp" size={20} color='#000' />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => confirmRemove(item.id)}
            >
              <Icon name="trash-outline" size={16} color="#ff4444" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20 
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  item: {
    flex: 1,
    justifyContent: 'center',
    padding: 15, 
    backgroundColor: '#f0f0f0',
    borderRadius: 8
  },
  pinButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 100,
    marginLeft: 10,
    elevation: 2
  },
  deleteButton: {
    padding: 15,
    marginLeft: 10,
  },
});