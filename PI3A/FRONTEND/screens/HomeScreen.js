import React, { useState, useEffect, useRef } from 'react';
import {
  View, TextInput, StyleSheet, ActivityIndicator,
  Alert, FlatList, Text, TouchableOpacity, Keyboard
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { v4 as uuidv4 } from 'uuid';

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [isSettingOrigin, setIsSettingOrigin] = useState(true); // Alternador origem/destino
  const sessionTokenRef = useRef(uuidv4());
  const mapRef = useRef(null);
  const BASE_URL = 'http://10.0.2.2:3000';

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'É necessário permitir o acesso à localização.');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchText.trim()) {
        setAutocompleteSuggestions([]);
        return;
      }

      try {
        const loc = location
          ? `${location.coords.latitude},${location.coords.longitude}`
          : '';
        const res = await fetch(`${BASE_URL}/api/autocomplete-places?input=${encodeURIComponent(searchText)}&sessionToken=${sessionTokenRef.current}&location=${loc}`);
        const data = await res.json();
        setAutocompleteSuggestions(data);
      } catch (err) {
        console.error('Erro no autocomplete:', err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchText, location]);

  const handleSuggestionPress = async (suggestion) => {
    setSearchText(suggestion.description);
    setAutocompleteSuggestions([]);
    Keyboard.dismiss();

    try {
      const res = await fetch(`${BASE_URL}/api/place-details?place_id=${suggestion.place_id}&sessionToken=${sessionTokenRef.current}`);
      const data = await res.json();

      const selectedLocation = {
        id: suggestion.place_id,
        name: suggestion.description,
        address: data.address || suggestion.description,
        latitude: data.latitude,
        longitude: data.longitude,
      };

      if (isSettingOrigin) {
        setOrigin(selectedLocation);
        mapRef.current?.animateToRegion({
          latitude: data.latitude,
          longitude: data.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else {
        setDestination(selectedLocation);
        mapRef.current?.animateToRegion({
          latitude: data.latitude,
          longitude: data.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }

      sessionTokenRef.current = uuidv4();
    } catch (err) {
      console.error('Erro ao buscar detalhes do local:', err);
      Alert.alert('Erro', 'Não foi possível obter detalhes.');
    }
  };

  const handleGetDirections = async () => {
    if (!origin || !destination) {
      Alert.alert('Erro', 'Defina origem e destino.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/directions?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}`);
      const data = await res.json();
      setDirections(data);
    } catch (err) {
      console.error('Erro ao buscar direções:', err);
      Alert.alert('Erro', 'Não foi possível obter a rota.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder={`Pesquise ${isSettingOrigin ? 'a origem' : 'o destino'}...`}
        style={styles.input}
        value={searchText}
        onChangeText={setSearchText}
        editable={!loading}
      />

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, isSettingOrigin && styles.activeButton]}
          onPress={() => setIsSettingOrigin(true)}
        >
          <Text style={styles.toggleText}>Origem</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, !isSettingOrigin && styles.activeButton]}
          onPress={() => setIsSettingOrigin(false)}
        >
          <Text style={styles.toggleText}>Destino</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.routeButton}
          onPress={handleGetDirections}
        >
          <Text style={styles.routeText}>Traçar Rota</Text>
        </TouchableOpacity>
      </View>

      {autocompleteSuggestions.length > 0 && (
        <FlatList
          data={autocompleteSuggestions}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(item)}
            >
              <Text style={styles.suggestionText}>{item.description}</Text>
            </TouchableOpacity>
          )}
          style={styles.autocompleteList}
        />
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        } : {
          latitude: -15.7975,
          longitude: -47.8919,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {origin && (
          <Marker
            coordinate={{ latitude: origin.latitude, longitude: origin.longitude }}
            title="Origem"
            pinColor="green"
          />
        )}
        {destination && (
          <Marker
            coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
            title="Destino"
            pinColor="red"
          />
        )}
        {directions?.polyline && (
          <Polyline
            coordinates={directions.polyline}
            strokeColor="#1E90FF"
            strokeWidth={4}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  input: {
    position: 'absolute', zIndex: 2, top: 40, left: 20, right: 20,
    backgroundColor: 'white', padding: 10, borderRadius: 8, elevation: 3
  },
  toggleContainer: {
    flexDirection: 'row', position: 'absolute', zIndex: 3, top: 100, left: 20, right: 20,
    justifyContent: 'space-between', alignItems: 'center'
  },
  toggleButton: {
    flex: 1, backgroundColor: '#eee', padding: 10, borderRadius: 6, marginHorizontal: 5
  },
  activeButton: {
    backgroundColor: '#4CAF50'
  },
  toggleText: {
    textAlign: 'center', fontWeight: 'bold', color: '#fff'
  },
  routeButton: {
    backgroundColor: '#2196F3', padding: 10, borderRadius: 6
  },
  routeText: {
    color: 'white', fontWeight: 'bold'
  },
  autocompleteList: {
    position: 'absolute', zIndex: 2, top: 90, left: 20, right: 20,
    backgroundColor: 'white', borderRadius: 8, elevation: 3, maxHeight: 200
  },
  suggestionItem: {
    padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  suggestionText: {
    fontSize: 16
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  loadingOverlay: {
    position: 'absolute', zIndex: 5, top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.7)'
  }
});
