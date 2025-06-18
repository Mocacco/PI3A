import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../API_URL';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function LocationSearchInput({ onSelectLocation, currentCoords }) {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const sessionTokenRef = useRef(generateUUID());

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchText.length > 1) {
        let params = `input=${encodeURIComponent(searchText)}`;
        if (currentCoords) {
          const proxValue = `${currentCoords.longitude},${currentCoords.latitude}`;
          params += `&proximity=${proxValue}`;
        }

        try {
          const res = await fetch(`${API_URL}:3000/api/autocomplete-places?${params}`);
          const data = await res.json();
          setSuggestions(data);
        } catch (err) {
          console.error('Erro ao buscar sugestões:', err);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const handleSelect = (item) => {
    setSearchText('');
    setSuggestions([]);
    Keyboard.dismiss();
    sessionTokenRef.current = generateUUID();
    onSelectLocation(item);
  };

  return (
    <View>
      <TextInput
        placeholder="Buscar local..."
        style={styles.input}
        value={searchText}
        onChangeText={setSearchText}
      />
      <FlatList
        data={suggestions}
        keyExtractor={item => item.place_id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
            <Text>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  }
});