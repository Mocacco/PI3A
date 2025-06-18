import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

export default function GeneralSettingsScreen() {
  const [autoLock, setAutoLock] = useState(false);
  const [keepOnTop, setKeepOnTop] = useState(false);
  const [lockscreenNav, setLockscreenNav] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distância</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Unidade de Distância</Text>
          <View style={styles.switchGroup}>
            <Text style={styles.option}>Mi</Text>
            <Switch value={true} disabled />
            <Text style={styles.option}>Km</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gerais</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Impedir autobloqueio</Text>
          <Switch value={autoLock} onValueChange={setAutoLock} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Manter no topo</Text>
          <Switch value={keepOnTop} onValueChange={setKeepOnTop} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Navegação na tela de bloqueio</Text>
          <Switch value={lockscreenNav} onValueChange={setLockscreenNav} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eee', padding: 15 },
  section: { marginBottom: 20, backgroundColor: '#fff', borderRadius: 8, padding: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 15
  },
  label: { fontSize: 14, color: '#333' },
  switchGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  option: { fontSize: 14, marginHorizontal: 4 }
});
