import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PrivacySecurityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacidade e Segurança</Text>
      {/* Aqui você pode adicionar switches ou listas futuramente */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eee', padding: 15 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 }
});
