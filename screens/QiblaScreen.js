import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QiblaCompass from '../components/QiblaCompass';

const QiblaScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Header */}
      <LinearGradient
        colors={["#059669", "#047857"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <MaterialCommunityIcons name="compass" size={40} color="#FFFFFF" />
        <Text style={styles.headerTitle}>اتجاه القبلة</Text>
        <Text style={styles.headerSubtitle}>وجّه هاتفك نحو السهم الأحمر للعثور على القبلة</Text>
      </LinearGradient>

      {/* Compass Section */}
      <View style={styles.compassSection}>
        <QiblaCompass />
      </View>

      {/* Instructions */}
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>كيفية الاستخدام:</Text>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>1</Text>
          <Text style={styles.instructionText}>امسك الهاتف بشكل أفقي</Text>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>2</Text>
          <Text style={styles.instructionText}>وجّه أعلى الهاتف نحو السهم الأحمر</Text>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>3</Text>
          <Text style={styles.instructionText}>اتبع اتجاه السهم للوصول إلى القبلة</Text>
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <MaterialCommunityIcons name="information" size={24} color="#059669" />
        <Text style={styles.infoText}>
          يتم حساب اتجاه القبلة بناءً على موقعك الحالي ومكة المكرمة
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  header: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    fontFamily: 'sans-serif-medium',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#D1FAE5',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  compassSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#059669',
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 12,
    lineHeight: 24,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  infoCard: {
    backgroundColor: '#ECFDF5',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#047857',
    marginLeft: 12,
    lineHeight: 20,
  },
});

export default QiblaScreen;
