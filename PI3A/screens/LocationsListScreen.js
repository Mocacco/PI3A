import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function LocationsListScreen() {
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState('');

  const handleAddLocation = () => {
    if (newLocation.trim()) {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation('');
    }
  };

  const handleRemoveLocation = (index) => {
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
          onPress: () => {
            const updatedLocations = [...locations];
            updatedLocations.splice(index, 1);
            setLocations(updatedLocations);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={locations}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.itemContainer}>
            <TouchableOpacity 
              style={styles.item}
              onPress={() => console.log('Navegar para detalhes')}
            >
              <Text>{item}</Text>
              <Icon name="chevron-forward-outline" size={16} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleRemoveLocation(index)}
            >
              <Icon name="trash-outline" size={16} color="#ff4444" />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footerContainer}>
            <TextInput
              style={styles.search}
              placeholder="Adicionar novo local"
              value={newLocation}
              onChangeText={setNewLocation}
              onSubmitEditing={handleAddLocation}
            />
            <TouchableOpacity 
              style={styles.addTextButton} 
              onPress={handleAddLocation}
            >
              <Text style={styles.addTextButtonLabel}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        }
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
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    padding: 15, 
    backgroundColor: '#f0f0f0',
    borderRadius: 8
  },
  deleteButton: {
    padding: 15,
    marginLeft: 10,
  },
  footerContainer: {
    marginTop: 20
  },
  search: {
    borderWidth: 1, 
    padding: 10, 
    borderRadius: 8,
    borderColor: '#ccc',
    marginBottom: 10
  },
  addTextButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  addTextButtonLabel: {
    color: '#fff',
    fontWeight: 'bold'
  }
});