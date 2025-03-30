import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import MapView from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={{
        latitude: -15.7942,
        longitude: -47.8822,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }} />

      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Pesquise aqui" />
        <Icon name="search" size={20} color="#000" style={styles.searchIcon} />
      </View>

      <View style={styles.bottomMenu}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="cog" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="home" size={24} color="#0a0" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="bars" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    paddingHorizontal: 10,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  searchIcon: {
    padding: 5,
  },
  bottomMenu: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  iconButton: {
    padding: 10,
  },
});

export default HomeScreen;
