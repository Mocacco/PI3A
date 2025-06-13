import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, ActivityIndicator,
  Alert, Keyboard
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { v4 as uuidv4 } from 'uuid';
import SearchBar from '../components/SearchBar';

export default function HomeScreen() {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [isSettingOrigin, setIsSettingOrigin] = useState(true);
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

  const handleSuggestionPress = async (suggestion) => {
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
      <SearchBar
        isSettingOrigin={isSettingOrigin}
        setIsSettingOrigin={setIsSettingOrigin}
        handleSuggestionPress={handleSuggestionPress}
        location={location}
        sessionTokenRef={sessionTokenRef}
        BASE_URL={BASE_URL}
        loading={loading}
        handleGetDirections={handleGetDirections}
      />

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
  map: {
    ...StyleSheet.absoluteFillObject
  },
  loadingOverlay: {
    position: 'absolute', zIndex: 5, top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.7)'
  }
});
