import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

export default function ConfigScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Button title="Geral" onPress={() => navigation.navigate('Geral')} />
      <Button title="Privacidade e Segurança" onPress={() => navigation.navigate('Privacidade')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});
