// PI3A/FRONTEND/screens/HomeScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    Alert,
    Keyboard,
    StyleSheet,
    Pressable,
    FlatList, // Importado para renderizar a lista de sugestões aqui
    TouchableOpacity, //Importado para os itens da lista de sugestões
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar'; //Seu componente SearchBar
import API_URL from '../API_URL';
import { useRoute } from '@react-navigation/native';

// Implementação manual de UUIDv4 (MOVIDA PARA CIMA, FORA DO COMPONENTE)

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const HomeScreen = () => { //ESTADOS GERAIS DO MAPA E ROTA
    const [origin, setOrigin] = useState(null);
    const [destination, setDestination] = useState(null);
    const [directions, setDirections] = useState(null);
    const [loading, setLoading] = useState(false); // Loader para buscar rota (da API de directions)
    const [location, setLocation] = useState(null); // Localização atual do usuário
    const [isSettingOrigin, setIsSettingOrigin] = useState(true); // Controla qual campo está ativo (origem/destino)
    const [routeInfo, setRouteInfo] = useState(null);

    const route = useRoute();
    const mapRef = useRef(null);

    // ESTADOS E LÓGICA DO AUTOCOMPLETE (MOVIDOS PARA HOMESCREEN)
    const [searchText, setSearchText] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [autocompleteLoading, setAutocompleteLoading] = useState(false);
    const sessionTokenRef = useRef(generateUUID());

    // Ajuste a URL base do seu backend conforme seu ambiente
    // Ex: 'http://10.0.2.2:3000' para emulador Android
    // Ex: 'http://192.168.1.6:3000' para dispositivo físico (se 192.168.1.6 for o IP do seu PC)
    const BASE_URL = `${API_URL}:3000`;

    // Efeito para obter permissão e a localização atual do usuário
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão negada', 'O acesso à localização é necessário.');
                return;
            }
            const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            setLocation(currentLocation);
            mapRef.current?.animateToRegion({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
        })();
    }, []);

    useEffect(() => {
        if (route?.params?.destination) {
            const dest = route.params.destination;
            setDestination({
                id: dest.id || 'custom',
                name: dest.name,
                address: dest.name,
                latitude: dest.latitude,
                longitude: dest.longitude,
            });

            mapRef.current?.animateToRegion({
                latitude: dest.latitude,
                longitude: dest.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
        }
    }, [route?.params?.destination]);

    // EFEITO: Lida com a busca de sugestões de autocomplete
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchText.length > 1) {
                setAutocompleteLoading(true);
                let params = `input=${encodeURIComponent(searchText)}`;
                if (location?.coords) {
                    const prox = `${location.coords.longitude},${location.coords.latitude}`;
                    params += `&proximity=${prox}`;
                }
                try {
                    const res = await fetch(`${BASE_URL}/api/autocomplete-places?${params}`);
                    const data = await res.json();
                    setSuggestions(data);
                } catch (err) {
                    console.error(err);
                    setSuggestions([]);
                } finally {
                    setAutocompleteLoading(false);
                }
            } else {
                setSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchText, location]); // Dependências

    // Função para lidar com a seleção de uma sugestão de autocomplete
    const handleSuggestionPress = (suggestion) => {
        Keyboard.dismiss();// Fecha o teclado
        setSearchText('');// Limpa o texto do input após seleção
        setSuggestions([]);// Esconde a lista de sugestões após seleção

        // Como OpenCage já retorna lat/lon na sugestão, não precisamos de Place Details API
        const selected = {
            id: suggestion.place_id,
            name: suggestion.description,
            address: suggestion.description,// OpenCage já formata bem o endereço
            latitude: suggestion.latitude,
            longitude: suggestion.longitude,
        };
        if (isSettingOrigin) setOrigin(selected);
        else setDestination(selected);

        mapRef.current?.animateToRegion({
            latitude: selected.latitude,
            longitude: selected.longitude,
            latitudeDelta: 0.01,// Zoom mais próximo
            longitudeDelta: 0.01,
        });

        sessionTokenRef.current = generateUUID();// Reinicia o sessionToken para próxima busca
    };

    // Função para buscar direções entre origem e destino
    const handleGetDirections = async () => {
        if (!origin || !destination) return Alert.alert('Defina origem e destino.');

        setLoading(true);// Ativa o loader
        try {
            const res = await fetch(`${BASE_URL}/api/directions?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}`);
            const data = await res.json();

            setDirections(data);// Define os dados da rota
            if (data.distance && data.duration) {
                setRouteInfo({ distance: data.distance, duration: data.duration });
            }

            // Ajusta o mapa para mostrar a rota completa
            if (data.polyline && mapRef.current) {
                mapRef.current.fitToCoordinates(data.polyline, {
                    edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
                    animated: true,
                });
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Erro ao buscar rota');
        } finally {
            setLoading(false);// Desativa o loader
        }
    };

    // Limpa a rota e volta o mapa para a localização atual
    const clearRoute = () => {
        setDirections(null);
        setRouteInfo(null);
        setOrigin(null);// Limpa origem
        setDestination(null);// Limpa destino
        setSearchText('');// Limpa a barra de busca
        setSuggestions([]);// Limpa as sugestões
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
            {/* SearchBar Component - Contém os inputs e botões de ação */}
            <SearchBar
                searchText={searchText}
                setSearchText={setSearchText}
                isSettingOrigin={isSettingOrigin}
                setIsSettingOrigin={setIsSettingOrigin}
                autocompleteLoading={autocompleteLoading}// Passa o loader do autocomplete (para o input)
                loading={loading}// Passa o loader da rota (para os botões de ação)
                handleGetDirections={handleGetDirections}
                onUseCurrentLocation={() => {
                    if (location?.coords) {
                        const locData = {
                            id: 'current',
                            name: 'Minha Localização',
                            address: 'Localização Atual',
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        };
                        if (isSettingOrigin) setOrigin(locData);
                        else setDestination(locData);
                        mapRef.current?.animateToRegion({
                            latitude: locData.latitude,
                            longitude: locData.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        });
                    }
                }}
                origin={origin}// Passa para exibir o nome do local selecionado
                destination={destination}// Passa para exibir o nome do local selecionado
            />

            {destination && (
                <Pressable onPress={clearRoute} style={styles.cancelRouteButton}>
                    <Text style={{ fontWeight: 'bold', color: '#333' }}>Cancelar rota</Text>
                </Pressable>
            )}

            {/* FlatList de Sugestões (Renderizada aqui no HomeScreen) */}
            {suggestions.length > 0 && searchText.length > 1 && (
                <FlatList
                    data={suggestions}
                    keyExtractor={item => item.place_id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.suggestionItem}
                            onPress={() => handleSuggestionPress(item)}
                        >
                            <Text style={styles.suggestionText}>{item.description}</Text>
                        </TouchableOpacity>
                    )}
                    keyboardShouldPersistTaps="handled" // MUITO IMPORTANTE!
                    style={styles.suggestionsList} // Estilo para posicionamento e rolagem
                />
            )}
            
            {/* Overlay de carregamento para a rota principal */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Calculando rota...</Text>
                </View>
            )}

            {/* Exibe informações da rota e botão de limpar */}
            {routeInfo && (
                <View style={styles.routeInfoContainer}>
                    <Text style={styles.routeInfoText}>Distância: {routeInfo.distance} • Duração: {routeInfo.duration}</Text>
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
            >
                {origin && <Marker coordinate={origin} title="Origem" description={origin.address} pinColor="green" />}
                {destination && <Marker coordinate={destination} title="Destino" description={destination.address} pinColor="red" />}
                {directions?.polyline && <Polyline coordinates={directions.polyline} strokeColor="#1E90FF" strokeWidth={4} />}
            </MapView>

            <Pressable
                style={styles.myLocationButton}
                onPress={() => {
                    if (location?.coords && mapRef.current) {
                        mapRef.current.animateToRegion({
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
    map: { ...StyleSheet.absoluteFillObject },
    cancelRouteButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        zIndex: 999, // Acima de tudo para o loader global
        elevation: 4,
    },
    loadingOverlay: {
        position: 'absolute',
        zIndex: 100,
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.8)'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#000',
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
        zIndex: 5,
    },
    routeInfoText: {
        color: '#fff',
        fontWeight: 'bold',
        flex: 1,
        fontSize: 16,
    },
    clearButton: {
        marginLeft: 10,
        padding: 5,
    },
    myLocationButton: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 30,
        elevation: 3,
        zIndex: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    // ESTILOS PARA A FLATLIST DE SUGESTÕES (NO HOMESCREEN)
    suggestionsList: {
        position: 'absolute',
        top: 215,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 8,
        maxHeight: 250,
        elevation: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,
        borderWidth: 1,
        borderColor: '#ddd',
        zIndex: 99,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    suggestionText: {
        fontSize: 16,
    },
});

export default HomeScreen;