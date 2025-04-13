import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const languages = [
  'Padrão do sistema', 'English (US)', 'Português (BR)', 'Português (PT)',
  'Español (L. Latina)', 'Español (España)', 'Deutsch', '日本語'
];

export default function LanguageScreen() {
  return (
    <FlatList
      data={languages}
      keyExtractor={(item) => item}
      renderItem={({ item }) => <Text style={styles.item}>{item}</Text>}
    />
  );
}

const styles = StyleSheet.create({
  item: { padding: 20, borderBottomWidth: 1, borderColor: '#ccc' },
});
