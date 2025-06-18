// P13A/FRONTEND/screens/HomeScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    Alert,
    Keyboard,
    StyleSheet,
    Pressable,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar';
import API_URL from '../API_URL';
import { useRoute } from '@react-navigation/native';

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const HomeScreen = () => {
    const [origin, setOrigin] = useState(null);
    const [destination, setDestination] = useState(null);
    const [directions, setDirections] = useState(null);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [isSettingOrigin, setIsSettingOrigin] = useState(true);
    const [routeInfo, setRouteInfo] = useState(null);
    const mapRef = useRef(null);

    const [searchText, setSearchText] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [autocompleteLoading, setAutocompleteLoading] = useState(false);
    const sessionTokenRef = useRef(generateUUID());
    const BASE_URL = `${API_URL}:3000`;
    const route = useRoute();

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão negada', 'O acesso à localização é necessário para este aplicativo.');
                return;
            }
            try {
                let currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });
                setLocation(currentLocation);
                if (mapRef.current) {
                    mapRef.current.animateToRegion({
                        latitude: currentLocation.coords.latitude,
                        longitude: currentLocation.coords.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    });
                }
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível obter a localização atual.');
            }
        })();
    }, []);

    useEffect(() => {
        const processPinnedLocation = async () => {
            if (route.params?.destination) {
                const { name, latitude, longitude } = route.params.destination;
                const pinLocation = {
                    id: 'pinned',
                    name,
                    address: name,
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude)
                };
                setDestination(pinLocation);

                if (location?.coords) {
                    const currentOrigin = {
                        id: 'current',
                        name: 'Minha Localização',
                        address: 'Localização Atual',
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude
                    };
                    setOrigin(currentOrigin);

                    mapRef.current?.fitToCoordinates([
                        {
                            latitude: currentOrigin.latitude,
                            longitude: currentOrigin.longitude
                        },
                        {
                            latitude: pinLocation.latitude,
                            longitude: pinLocation.longitude
                        }
                    ], {
                        edgePadding: { top: 80, bottom: 80, left: 50, right: 50 },
                        animated: true
                    });

                    try {
                        const res = await fetch(
                            `${BASE_URL}/api/directions?origin=${currentOrigin.latitude},${currentOrigin.longitude}&destination=${pinLocation.latitude},${pinLocation.longitude}`
                        );
                        if (!res.ok) {
                            const errorData = await res.json();
                            throw new Error(errorData.error || `Erro HTTP! Status: ${res.status}`);
                        }
                        const data = await res.json();
                        setDirections(data);
                        if (data.distance && data.duration) {
                            setRouteInfo({
                                distance: data.distance,
                                duration: data.duration
                            });
                        }
                    } catch (err) {
                        console.error('Erro ao gerar rota automática:', err);
                    }
                } else {
                    mapRef.current?.animateToRegion({
                        latitude: pinLocation.latitude,
                        longitude: pinLocation.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01
                    });
                }
            }
        };
        processPinnedLocation();
    }, [route.params, location]);

    return (
        <View style={{ flex: 1 }}>
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFillObject}
                showsUserLocation={true}
                showsMyLocationButton={true}
                initialRegion={{
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
};

export default HomeScreen;
