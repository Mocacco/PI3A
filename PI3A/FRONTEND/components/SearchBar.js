import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import uuid from 'react-native-uuid';

const BASE_URL = 'http://10.0.2.2:3000'; // use IP local se for celular real

export default function SearchBar() {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [sessionToken, setSessionToken] = useState(uuid.v4());

  useEffect(() => {
    if (searchText.length === 0) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/autocomplete-places?input=${encodeURIComponent(searchText)}&sessionToken=${sessionToken}`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Erro ao buscar sugestões:', error.message);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(debounce);
  }, [searchText]);

  const handleSelect = (item) => {
    setRecentSearches((prev) => [item.description, ...prev.filter(i => i !== item.description)]);
    setSearchText(item.description);
    setSuggestions([]);
  };

  return (
    <View className="p-4">
      <View className="bg-gray-100 rounded-full flex-row items-center px-4 py-2">
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          placeholder="Pesquise aqui"
          value={searchText}
          onChangeText={setSearchText}
          className="flex-1 ml-2"
        />
        <Ionicons name="mic" size={20} color="#666" />
      </View>

      {searchText === '' && recentSearches.length > 0 && (
        <View className="mt-4">
          <Text className="font-bold mb-2 text-gray-700">Recente</Text>
          {recentSearches.map((item, index) => (
            <TouchableOpacity key={index} onPress={() => setSearchText(item)} className="mb-2">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={20} color="#666" className="mr-2" />
                <Text>{item}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelect(item)} className="p-2">
              <Text>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
