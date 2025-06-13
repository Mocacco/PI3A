import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Keyboard,
  StyleSheet,
  TouchableOpacity, // Adicionado manualmente
  Pressable // Alternativa moderna
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar';

// Implementação manual de UUID (substitui react-native-uuid)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const HomeScreen = () => {
  const [origin, setOrigin] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [destination, setDestination] = useState(null);
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [isSettingOrigin, setIsSettingOrigin] = useState(true);
  const [routeInfo, setRouteInfo] = useState(null);
  const sessionTokenRef = useRef(generateUUID()); // Usando nossa função
  const mapRef = useRef(null);
  const BASE_URL = 'http://10.0.2.2:3000';

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required for this app.');
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (error) {
        Alert.alert('Error', 'Could not get current location');
      }
    })();
  }, []);

  const handleSuggestionPress = async (suggestion) => {
    Keyboard.dismiss();

    try {
      const res = await fetch(`${BASE_URL}/api/place-details?place_id=${suggestion.place_id}&sessionToken=${sessionTokenRef.current}`);
      
      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }
      
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
      } else {
        setDestination(selectedLocation);
      }

      mapRef.current?.animateToRegion({
        latitude: data.latitude,
        longitude: data.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      sessionTokenRef.current = generateUUID(); // Atualizado para nossa função
    } catch (err) {
      console.error('Error fetching place details:', err);
      Alert.alert('Error', 'Could not get place details. Please try again.');
    }
  };

  const handleGetDirections = async () => {
    if (!origin || !destination) {
      Alert.alert('Error', 'Please set both origin and destination.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/directions?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}`
      );
      
      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }
      
      const data = await res.json();
      setDirections(data);
      
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        setRouteInfo({
          distance: route.distance,
          duration: route.duration
        });
      }

      if (data.bounds) {
        mapRef.current?.fitToCoordinates(data.polyline, {
          edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    } catch (err) {
      console.error('Error fetching directions:', err);
      Alert.alert('Error', 'Could not get directions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      const locationData = {
        id: 'current',
        name: 'My Location',
        address: 'Current Location',
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };
      
      if (isSettingOrigin) {
        setOrigin(locationData);
      } else {
        setDestination(locationData);
      }
      
      mapRef.current?.animateToRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not get current location');
    }
  };

  const clearRoute = () => {
    setDirections(null);
    setRouteInfo(null);
    if (location) {
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  return (
    <View style={styles.container}>
      <SearchBar
searchText={searchText}             // Corrigido de isearchText para searchText
  setSearchText={setSearchText}
  isSettingOrigin={isSettingOrigin}
  setIsSettingOrigin={setIsSettingOrigin}
  handleSuggestionPress={handleSuggestionPress}
  sessionTokenRef={sessionTokenRef}
  BASE_URL={BASE_URL}
  loading={loading}
  handleGetDirections={handleGetDirections}
  onUseCurrentLocation={handleUseCurrentLocation}
  origin={origin}
  destination={destination}    
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Calculating route...</Text>
        </View>
      )}

      {routeInfo && (
        <View style={styles.routeInfoContainer}>
          <Text style={styles.routeInfoText}>
            Distance: {routeInfo.distance} • Duration: {routeInfo.duration}
          </Text>
          <Pressable onPress={clearRoute} style={styles.clearButton}>
            <Ionicons name="close" size={20} color="#fff" />
          </Pressable>
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
        showsUserLocation={true}
        showsMyLocationButton={false}
        accessibilityLabel="Map view"
      >
        {origin && (
          <Marker
            coordinate={{ latitude: origin.latitude, longitude: origin.longitude }}
            title="Origin"
            description={origin.address}
            pinColor="green"
            identifier="origin"
          />
        )}
        {destination && (
          <Marker
            coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
            title="Destination"
            description={destination.address}
            pinColor="red"
            identifier="destination"
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

      <Pressable
        style={styles.myLocationButton}
        onPress={() => {
          if (location) {
            mapRef.current?.animateToRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        }}
      >
        <Ionicons name="locate" size={20} color="#000" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  loadingOverlay: {
    position: 'absolute',
    zIndex: 5,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)'
  },
  loadingText: {
    marginTop: 8
  },
  routeInfoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#1E90FF',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  routeInfoText: {
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
  },
  clearButton: {
    marginLeft: 10,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 30,
    elevation: 3,
    zIndex: 2,
  },
});

export default HomeScreen;