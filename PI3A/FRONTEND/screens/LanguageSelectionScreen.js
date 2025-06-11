import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const languages = [
  { code: 'pt', name: 'Português' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
];

export default function LanguageSelectionScreen() {
  const [selectedLanguage, setSelectedLanguage] = React.useState('pt');

  return (
    <View style={styles.container}>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.languageItem,
            selectedLanguage === lang.code && styles.selectedItem
          ]}
          onPress={() => setSelectedLanguage(lang.code)}
        >
          <Text style={styles.languageText}>{lang.name}</Text>
          {selectedLanguage === lang.code && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  languageItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectedItem: {
    backgroundColor: '#f5f5f5',
  },
  languageText: {
    fontSize: 16,
  },
  checkmark: {
    color: '#4d4d4d',
    fontWeight: 'bold',
  },
});