// P13A/FRONTEND/components/SearchBar.js
import React from 'react'; // Não precisa mais de useState/useEffect
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchBar = ({
    searchText,
    setSearchText,
    isSettingOrigin,
    setIsSettingOrigin,
    autocompleteLoading, // Recebe o loader do autocomplete do HomeScreen
    loading, // Recebe o loader da rota do HomeScreen
    handleGetDirections,
    onUseCurrentLocation,
    origin,
    destination,
}) => {
    return (
        <View style={styles.container}>
            {/* Toggle Origem/Destino */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity
                    style={[styles.toggleButton, isSettingOrigin && styles.activeButton]}
                    onPress={() => { setIsSettingOrigin(true); setSearchText(origin?.name || ''); }}
                >
                    <Text style={[styles.toggleText, isSettingOrigin && styles.activeText]}>Origem</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, !isSettingOrigin && styles.activeButton]}
                    onPress={() => { setIsSettingOrigin(false); setSearchText(destination?.name || ''); }}
                >
                    <Text style={[styles.toggleText, !isSettingOrigin && styles.activeText]}>Destino</Text>
                </TouchableOpacity>
            </View>

            {/* Campo de Input de Pesquisa */}
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder={isSettingOrigin ? 'Buscar origem...' : 'Buscar destino...'}
                    editable={!loading} // Desabilita input se a rota principal estiver carregando
                />
                {autocompleteLoading && ( // Usa o loader do autocomplete recebido por prop
                    <ActivityIndicator size="small" color="#000" style={styles.autocompleteLoader} />
                )}
            </View>

            {/* Botões de Ação */}
            <View style={styles.actionButtonsContainer}>
                <Pressable
                    style={({ pressed }) => [
                        styles.actionButton,
                        { opacity: pressed ? 0.6 : 1 },
                        (loading || !origin || !destination) && styles.disabledButton
                    ]}
                    onPress={handleGetDirections}
                    disabled={loading || !origin || !destination}
                >
                    <Ionicons name="navigate" size={24} color={(loading || !origin || !destination) ? "#ccc" : "#fff"} />
                    <Text style={[styles.actionButtonText, (loading || !origin || !destination) && styles.disabledText]}>Traçar Rota</Text>
                </Pressable>
                <Pressable
                    style={({ pressed }) => [
                        styles.actionButton,
                        { opacity: pressed ? 0.6 : 1 },
                        loading && styles.disabledButton
                    ]}
                    onPress={onUseCurrentLocation}
                    disabled={loading}
                >
                    <Ionicons name="locate" size={24} color={loading ? "#ccc" : "#fff"} />
                    <Text style={[styles.actionButtonText, loading && styles.disabledText]}>Minha Localização</Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.95)',
        padding: 10,
        zIndex: 10, // Garante que a SearchBar fique acima do mapa
        marginHorizontal: 10,
        borderRadius: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    toggleContainer: {
        flexDirection: 'row',
        marginBottom: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        overflow: 'hidden',
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
    },
    activeButton: {
        backgroundColor: '#1E90FF',
    },
    toggleText: {
        color: '#333',
        fontWeight: 'bold',
    },
    activeText: {
        color: '#fff',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 5,
        marginBottom: 5,
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 16,
    },
    autocompleteLoader: {
        position: 'absolute',
        right: 10,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E90FF',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    disabledButton: {
        backgroundColor: '#a0c7ff',
    },
    disabledText: {
        color: '#ccc',
    },
    // NENHUM ESTILO DE FLATLIST AQUI, POIS ELA NÃO É RENDERIZADA AQUI
});

export default SearchBar;