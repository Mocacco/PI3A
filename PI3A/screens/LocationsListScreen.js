import React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const locations = [];

export default function LocationsListScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={locations}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item}>
            <Text>{item}</Text>
            <Icon name="chevron-forward-outline" size={16} />
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TextInput style={styles.search} placeholder="Geocodificar" />
        }
      />
      <TouchableOpacity style={styles.addButton}>
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  item: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 15, backgroundColor: '#f0f0f0',
    marginBottom: 10, borderRadius: 8
  },
  search: {
    marginTop: 20, borderWidth: 1, padding: 10, borderRadius: 8,
    borderColor: '#ccc'
  },
  addButton: {
    position: 'absolute', bottom: 30, right: 30,
    backgroundColor: '#000', padding: 15, borderRadius: 30
  }
});
