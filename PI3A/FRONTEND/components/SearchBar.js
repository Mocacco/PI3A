import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const RECENT_SEARCHES_KEY = 'recentSearches';

const SearchBar = ({
  searchText,
  setSearchText,
  isSettingOrigin,
  setIsSettingOrigin,
  handleSuggestionPress,
  sessionTokenRef,
  BASE_URL,
  loading,
  handleGetDirections,
  onUseCurrentLocation,
  origin,
  destination
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Fallback para desenvolvimento
  const DevFallback = () => {
    useEffect(() => {
      if (__DEV__ && searchText && suggestions.length === 0) {
        setSuggestions([{
          description: `Exemplo: ${searchText} Street, City`,
          place_id: 'dev_' + Math.random()
        }]);
      }
    }, [searchText]);
    return null;
  };

  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        const savedSearches = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
        setRecentSearches(savedSearches ? JSON.parse(savedSearches) : []);
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    };
    loadRecentSearches();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    if (!searchText?.trim()) {
      setSuggestions([]);
      setApiError(null);
      return;
    }

    const fetchSuggestions = async () => {
      setIsFetching(true);
      setApiError(null);
      
      try {
        const url = new URL(`${BASE_URL}/api/autocomplete-places`);
        url.searchParams.append('input', encodeURIComponent(searchText));
        url.searchParams.append('sessionToken', sessionTokenRef.current);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        const results = Array.isArray(data) ? data : data?.predictions || [];
        const validSuggestions = results.filter(item => 
          item?.description && item?.place_id
        );
        
        setSuggestions(validSuggestions);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Fetch error:', error);
          setApiError('Failed to load suggestions');
          if (!__DEV__) {
            Alert.alert('Error', 'Could not fetch suggestions. Please try again.');
          }
        }
      } finally {
        setIsFetching(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchText]);

  // ... (manter o restante das funções handleSelect, clearSearch)

  return (
    <View style={styles.container}>
      <DevFallback />
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          placeholder={isSettingOrigin ? "Search origin" : "Search destination"}
          value={searchText || ''}
          onChangeText={text => setSearchText(text || '')}
          style={styles.input}
        />
        {/* ... (restante do JSX) */}
      </View>

      {isFetching && <ActivityIndicator size="small" color="#0000ff" />}
      {apiError && <Text style={styles.errorText}>{apiError}</Text>}
      
      {/* ... (restante do componente) */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    zIndex: 1
  },
  searchContainer: {
    backgroundColor: '#eee',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    marginLeft: 8
  },
  locationIcon: {
    marginLeft: 8
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8
  },
  statusText: {
    marginLeft: 8,
    color: '#666'
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffeeee',
    borderRadius: 5,
    marginTop: 5
  },
  errorText: {
    color: 'red',
    marginLeft: 5
  },
  noResults: {
    padding: 16,
    textAlign: 'center',
    color: '#666'
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 200,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  separator: {
    height: 1,
    backgroundColor: '#eee'
  },
  searchContainer: {
    backgroundColor: '#eee',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    marginLeft: 8
  },
  locationIcon: {
    marginLeft: 8
  },
  loadingIndicator: {
    marginTop: 8
  },
  recentSearchesContainer: {
    marginTop: 16
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555'
  },
  recentSearchItem: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  timeIcon: {
    marginRight: 8
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 200,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  separator: {
    height: 1,
    backgroundColor: '#eee'
  },
  originDestinationToggle: {
    flexDirection: 'row',
    marginTop: 12
  },
  toggleButton: {
    flex: 1,
    backgroundColor: '#eee',
    padding: 12,
    alignItems: 'center'
  },
  activeToggleButton: {
    backgroundColor: '#1E90FF'
  },
  toggleText: {
    color: '#000'
  },
  activeToggleText: {
    color: '#fff'
  },
  directionsButton: {
    marginTop: 12,
    backgroundColor: '#1E90FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  directionsButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default SearchBar;
