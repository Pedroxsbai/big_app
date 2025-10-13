import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SunanScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>السنن</Text>
        <Text style={styles.headerSubtitle}>هذه صفحة السنن</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.text}>سنن الوضوء، الصلاة، الأذكار... قريبا</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },
  header: { backgroundColor: '#166534', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 22, color: '#FFFFFF', fontWeight: 'bold' },
  headerSubtitle: { fontSize: 13, color: '#D1FAE5', marginTop: 4 },
  card: {
    backgroundColor: '#FEF9EF', margin: 16, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#F1E7C6'
  },
  text: { fontSize: 16, color: '#166534' },
});

export default SunanScreen;
