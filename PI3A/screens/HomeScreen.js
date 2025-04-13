import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <TextInput placeholder="Pesquise aqui..." style={styles.input} />
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -23.55052,
          longitude: -46.633308,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    position: 'absolute',
    zIndex: 1,
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    elevation: 3,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
