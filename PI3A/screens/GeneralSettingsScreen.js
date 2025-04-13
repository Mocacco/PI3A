import React from 'react';
import { View, Switch, Text, StyleSheet } from 'react-native';

export default function GeneralSettingsScreen() {
  return (
    <View style={styles.container}>
      <Text>Idioma: Português (BR)</Text>
      <Text>Unidades de Distância</Text>
      {/* Adicione Switches conforme mostrado no layout */}
      <Text>Percurso</Text>
      <View style={styles.switchRow}>
        <Text>Impedir autobloqueio</Text>
        <Switch />
      </View>
      <View style={styles.switchRow}>
        <Text>Manter no topo</Text>
        <Switch />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
});
