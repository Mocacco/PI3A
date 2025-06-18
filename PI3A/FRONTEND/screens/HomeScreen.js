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
    FlatList, // Importado para renderizar a lista de sugestões aqui
    TouchableOpacity, // Importado para os itens da lista de sugestões
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar'; // Seu componente SearchBar
import API_URL from '../API_URL';
import { useRoute } from '@react-navigation/native';

// Implementação manual de UUIDv4 (MOVIDA PARA CIMA, FORA DO COMPONENTE)
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const HomeScreen = () => {
    // ESTADOS GERAIS DO MAPA E ROTA
    const [origin, setOrigin] = useState(null);
    const [destination, setDestination] = useState(null);
    const [directions, setDirections] = useState(null);
    const [loading, setLoading] = useState(false); // Loader para buscar rota (da API de directions)
    const [location, setLocation] = useState(null); // Localização atual do usuário
    const [isSettingOrigin, setIsSettingOrigin] = useState(true); // Controla qual campo está ativo (origem/destino)
    const [routeInfo, setRouteInfo] = useState(null);

    const mapRef = useRef(null);

    // ESTADOS E LÓGICA DO AUTOCOMPLETE (MOVIDOS PARA HOMESCREEN)
    const [searchText, setSearchText] = useState(''); // Texto digitado no input de busca
    const [suggestions, setSuggestions] = useState([]); // Sugestões retornadas pelo autocomplete
    const [autocompleteLoading, setAutocompleteLoading] = useState(false); // Loader para o autocomplete
    const sessionTokenRef = useRef(generateUUID()); // Token de sessão para autocomplete

    // Ajuste a URL base do seu backend conforme seu ambiente
    // Ex: 'http://10.0.2.2:3000' para emulador Android
    // Ex: 'http://192.168.1.6:3000' para dispositivo físico (se 192.168.1.6 for o IP do seu PC)
    const BASE_URL = `${API_URL}:3000`; // <--- VERIFIQUE E AJUSTE ESTE IP

    // Efeito para obter permissão e a localização atual do usuário
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
                console.error('Erro ao obter localização:', error);
            }
        })();
    }, []);

    // EFEITO: Lida com a busca de sugestões de autocomplete
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchText.length > 1) {
                setAutocompleteLoading(true);
                let params = `input=${encodeURIComponent(searchText)}`;
                if (location && location.coords) {
                    const proxValue = `${location.coords.longitude},${location.coords.latitude}`;
                    params += `&proximity=${proxValue}`;
                }
                try {
                    const res = await fetch(`${BASE_URL}/api/autocomplete-places?${params}`);
                    if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.error || `Erro HTTP! Status: ${res.status}`);
                    }
                    const data = await res.json();
                    setSuggestions(data);
                } catch (err) {
                    console.error('Erro ao buscar sugestões:', err);
                    setSuggestions([]);
                } finally {
                    setAutocompleteLoading(false);
                }
            } else {
                setSuggestions([]);
            }
        }, 300); // Debounce
        return () => clearTimeout(timeoutId);
    }, [searchText, location, BASE_URL]); // Dependências

    // Função para lidar com a seleção de uma sugestão de autocomplete
    const handleSuggestionPress = async (suggestion) => {
        Keyboard.dismiss(); // Fecha o teclado
        setSearchText(''); // Limpa o texto do input após seleção
        setSuggestions([]); // Esconde a lista de sugestões após seleção

        // Como OpenCage já retorna lat/lon na sugestão, não precisamos de Place Details API
        const selectedLocation = {
            id: suggestion.place_id,
            name: suggestion.description,
            address: suggestion.description, // OpenCage já formata bem o endereço
            latitude: suggestion.latitude,
            longitude: suggestion.longitude,
        };

        if (isSettingOrigin) {
            setOrigin(selectedLocation);
        } else {
            setDestination(selectedLocation);
        }

        mapRef.current?.animateToRegion({
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            latitudeDelta: 0.01, // Zoom mais próximo
            longitudeDelta: 0.01,
        });

        sessionTokenRef.current = generateUUID(); // Reinicia o sessionToken para próxima busca
    };

    // Função para buscar direções entre origem e destino
    const handleGetDirections = async () => {
        if (!origin || !destination) {
            Alert.alert('Erro', 'Por favor, defina a origem e o destino.');
            return;
        }

        setLoading(true); // Ativa o loader
        try {
            const res = await fetch(
                `${BASE_URL}/api/directions?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}`
            );

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Falha na requisição da API com status ${res.status}`);
            }

            const data = await res.json();
            setDirections(data); // Define os dados da rota

            if (data.distance && data.duration) {
                setRouteInfo({
                    distance: data.distance,
                    duration: data.duration
                });
            }

            // Ajusta o mapa para mostrar a rota completa
            if (data.polyline && mapRef.current) {
                mapRef.current.fitToCoordinates(data.polyline, {
                    edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
                    animated: true,
                });
            }

        } catch (err) {
            console.error('Erro ao buscar direções:', err);
            Alert.alert('Erro', 'Não foi possível obter as direções. Verifique sua conexão ou tente novamente.');
        } finally {
            setLoading(false); // Desativa o loader
        }

        console.log("Frontend - Buscando direções com:");
        console.log("  Origem:", origin.latitude, origin.longitude);  
        console.log("  Destino:", destination.latitude, destination.longitude);
    };

    // Função para usar a localização atual como origem/destino
    const handleUseCurrentLocation = async () => {
        if (!location) {
            Alert.alert('Erro', 'Não foi possível obter a localização atual. Verifique as permissões.');
            return;
        }

        const locationData = {
            id: 'current',
            name: 'Minha Localização',
            address: 'Localização Atual',
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };

        if (isSettingOrigin) {
            setOrigin(locationData);
            Alert.alert('Localização Definida', 'Sua localização atual foi definida como Origem.');
        } else {
            setDestination(locationData);
            Alert.alert('Localização Definida', 'Sua localização atual foi definida como Destino.');
        }

        mapRef.current?.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
    };

    // Limpa a rota e volta o mapa para a localização atual
    const clearRoute = () => {
        setDirections(null);
        setRouteInfo(null);
        setOrigin(null); // Limpa origem
        setDestination(null); // Limpa destino
        setSearchText(''); // Limpa a barra de busca
        setSuggestions([]); // Limpa as sugestões
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
                autocompleteLoading={autocompleteLoading} // Passa o loader do autocomplete (para o input)
                loading={loading} // Passa o loader da rota (para os botões de ação)
                handleGetDirections={handleGetDirections}
                onUseCurrentLocation={handleUseCurrentLocation}
                origin={origin} // Passa para exibir o nome do local selecionado
                destination={destination} // Passa para exibir o nome do local selecionado
            />

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
                    <Text style={styles.routeInfoText}>
                        Distância: {routeInfo.distance} • Duração: {routeInfo.duration}
                    </Text>
                    <Pressable onPress={clearRoute} style={styles.clearButton}>
                        <Ionicons name="close" size={20} color="#fff" />
                    </Pressable>
                </View>
            )}

            {/* MapView */}
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={location ? {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                } : {
                    latitude: -15.7975, // Coordenadas padrão (Brasília)
                    longitude: -47.8919,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
                accessibilityLabel="Visualização do mapa"
            >
                {origin && (
                    <Marker
                        coordinate={{ latitude: origin.latitude, longitude: origin.longitude }}
                        title="Origem"
                        description={origin.address}
                        pinColor="green"
                        identifier="origin"
                    />
                )}
                {destination && (
                    <Marker
                        coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
                        title="Destino"
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
                    if (location && mapRef.current) {
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
    map: {
        ...StyleSheet.absoluteFillObject
    },
    loadingOverlay: {
        position: 'absolute',
        zIndex: 100, // Acima de tudo para o loader global
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
        // Calcular 'top' com base na altura da SearchBar
        // A SearchBar tem 'top: 40' e sua própria altura.
        // A altura da SearchBar (do container, sem margens externas) é aproximadamente:
        //  - toggleContainer: 40px (padding 10*2 + text height) + 8px (marginBottom) = 48px
        //  - inputWrapper: 40px (padding 12*2 + text height) + 5px (marginBottom) = 45px
        //  - actionButtonsContainer: 44px (padding 10*2 + icon height) + 10px (marginTop) = 54px
        // Total aproximado da altura interna da SearchBar: 48 + 45 + 54 = 147px
        // O padding do container da SearchBar é 10px (top) + 10px (bottom).
        // A altura total da SearchBar na tela é ~147 + 20 = 167px.
        // O 'top' da SearchBar é 40px.
        // Então o 'top' da lista de sugestões deve ser 40px (top SearchBar) + 167px (altura SearchBar) = 207px.
        // Vamos arredondar para 210px ou 215px para ter uma margem.
        top: 215, // <--- AJUSTE ESTE VALOR TESTANDO NO SEU EMULADOR/DISPOSITIVO!
        left: 20, // Alinha com as margens da SearchBar (10px padding + 10px marginHorizontal)
        right: 20, // Alinha com as margens da SearchBar
        backgroundColor: 'white',
        borderRadius: 8,
        maxHeight: 250, // Garante que a lista seja rolável
        elevation: 15, // Sombra
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,
        borderWidth: 1,
        borderColor: '#ddd',
        zIndex: 99, // ZIndex BEM ALTO para garantir que fique acima de tudo
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