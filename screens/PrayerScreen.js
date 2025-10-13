import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PrayerScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>شاشة الصلاة</Text>
      <Text style={styles.subtitle}>هنا ستجد أوقات الصلاة</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});

export default PrayerScreen; 