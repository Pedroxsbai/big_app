import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import PrayerTimesService from '../services/prayerTimesService';

export default function SalatScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [location, setLocation] = useState('جاري التحميل...');
  const [loadingPrayerTimes, setLoadingPrayerTimes] = useState(true);
  const [prayerCompleted, setPrayerCompleted] = useState({
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  });
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    loadPrayerTimes();
    return () => clearInterval(timer);
  }, []);

  // Load prayer times
  const loadPrayerTimes = async () => {
    try {
      setLoadingPrayerTimes(true);
      
      // Clear any cached data to ensure fresh API call
      await PrayerTimesService.clearCachedPrayerTimes();
      
      // Always fetch fresh prayer times from API (same as CalendarScreen)
      const prayerData = await PrayerTimesService.getTodayPrayerTimes();
      setPrayerTimes(prayerData);
      setLocation(prayerData.location);
      setNextPrayer(PrayerTimesService.getNextPrayer());
    } catch (error) {
      console.log('Error loading prayer times:', error);
      setLocation('خطأ في التحميل');
    } finally {
      setLoadingPrayerTimes(false);
    }
  };

  const getFormattedPrayerTimes = () => {
    if (!prayerTimes) return [];
    
    return [
      { 
        name: 'الفجر', 
        time: prayerTimes.Fajr, 
        icon: 'weather-sunset-up',
        completed: prayerCompleted.fajr,
        key: 'fajr'
      },
      { 
        name: 'الشروق', 
        time: prayerTimes.Sunrise, 
        icon: 'weather-sunny',
        completed: false,
        key: 'sunrise'
      },
      { 
        name: 'الظهر', 
        time: prayerTimes.Dhuhr, 
        icon: 'white-balance-sunny',
        completed: prayerCompleted.dhuhr,
        key: 'dhuhr'
      },
      { 
        name: 'العصر', 
        time: prayerTimes.Asr, 
        icon: 'weather-sunset-down',
        completed: prayerCompleted.asr,
        key: 'asr'
      },
      { 
        name: 'المغرب', 
        time: prayerTimes.Maghrib, 
        icon: 'weather-night',
        completed: prayerCompleted.maghrib,
        key: 'maghrib'
      },
      { 
        name: 'العشاء', 
        time: prayerTimes.Isha, 
        icon: 'moon-waning-gibbous',
        completed: prayerCompleted.isha,
        key: 'isha'
      },
    ];
  };
  const todayStats = {
    completed: Object.values(prayerCompleted).filter(Boolean).length,
    total: 5,
    streak: 7
  };

  const togglePrayer = (prayerKey) => {
    if (prayerKey === 'sunrise') return; // Sunrise is not a prayer
    setPrayerCompleted(prev => ({
      ...prev,
      [prayerKey]: !prev[prayerKey]
    }));
  };

  const quickActions = [
    { name: 'القبلة', icon: 'compass', color: '#3B82F6' },
    { name: 'التقويم', icon: 'calendar', color: '#10B981' },
    { name: 'المنبه', icon: 'alarm', color: '#F59E0B' },
    { name: 'الإعدادات', icon: 'settings', color: '#8B5CF6' },
    { name: 'ثلث الليل', icon: 'moon', color: '#F472B6' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Header */}
      <LinearGradient
        colors={["#3B82F6", "#2563EB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.appName}>أوقات الصلاة</Text>
        <Text style={styles.time}>{currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</Text>
        <Text style={styles.location}>{location}</Text>
        {nextPrayer && (
          <Text style={styles.remaining}>الصلاة القادمة: {nextPrayer.name} في {nextPrayer.remaining}</Text>
        )}
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickContainer}>
        {quickActions.map((action, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.quickItem}
            onPress={() => {
              if (action.name === 'القبلة') {
                navigation.navigate('Qibla');
              } else if (action.name === 'التقويم') {
                navigation.navigate('Calendar');
              } else if (action.name === 'المنبه') {
                navigation.navigate('Alarm');
              } else if (action.name === 'ثلث الليل') {
                navigation.navigate('LastThird');
              }
            }}
          >
            <Ionicons name={action.icon} size={28} color={action.color} />
            <Text style={styles.quickText}>{action.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Today's Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>إحصائيات اليوم</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{todayStats.completed}</Text>
            <Text style={styles.statLabel}>صلاة مكتملة</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{todayStats.streak}</Text>
            <Text style={styles.statLabel}>أيام متتالية</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{Math.round((todayStats.completed / todayStats.total) * 100)}%</Text>
            <Text style={styles.statLabel}>نسبة الإنجاز</Text>
          </View>
        </View>
      </View>

      {/* Next Prayer */}
      {nextPrayer && (
        <View style={styles.nextPrayerCard}>
          <MaterialCommunityIcons name="mosque" size={40} color="#2563EB" />
          <View style={styles.nextPrayerInfo}>
            <Text style={styles.nextPrayerLabel}>الصلاة القادمة</Text>
            <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
          </View>
          <Text style={styles.nextPrayerTime}>{nextPrayer.time}</Text>
        </View>
      )}

      {/* Prayer Times List */}
      <View style={styles.prayerTimesContainer}>
        <Text style={styles.prayerTimesTitle}>جميع الأوقات</Text>
        {loadingPrayerTimes ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>جاري تحميل أوقات الصلاة...</Text>
          </View>
        ) : prayerTimes ? (
          getFormattedPrayerTimes().map((prayer, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.prayerTimeItem,
                prayer.completed && styles.prayerTimeItemCompleted
              ]}
              onPress={() => togglePrayer(prayer.key)}
            >
              <MaterialCommunityIcons 
                name={prayer.completed ? 'check-circle' : prayer.icon} 
                size={24} 
                color={prayer.completed ? '#10B981' : '#2563EB'} 
              />
              <Text style={[
                styles.prayerNameText,
                prayer.completed && styles.prayerNameTextCompleted
              ]}>
                {prayer.name}
              </Text>
              <Text style={[
                styles.prayerTimeText,
                prayer.completed && styles.prayerTimeTextCompleted
              ]}>
                {prayer.time}
              </Text>
              {prayer.completed && (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>خطأ في تحميل أوقات الصلاة</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadPrayerTimes}>
              <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Motivational Message */}
      <View style={styles.motivationContainer}>
        <MaterialCommunityIcons name="heart" size={24} color="#EF4444" />
        <Text style={styles.motivationText}>
          "الصلاة عماد الدين، من أقامها فقد أقام الدين"
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF7",
  },
  header: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  appName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "sans-serif-medium",
  },
  time: {
    fontSize: 48,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginVertical: 4,
  },
  location: {
    color: "#DBEAFE",
    fontSize: 16,
    marginBottom: 4,
  },
  remaining: {
    color: "#BFDBFE",
    fontSize: 14,
  },
  quickContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingVertical: 20,
  },
  quickItem: {
    width: "28%",
    backgroundColor: "#EFF6FF",
    marginVertical: 10,
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 12,
    elevation: 2,
  },
  quickText: {
    marginTop: 8,
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563EB",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E40AF",
  },
  statLabel: {
    fontSize: 12,
    color: "#3B82F6",
    marginTop: 4,
    textAlign: "center",
  },
  nextPrayerCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    margin: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nextPrayerInfo: {
    flex: 1,
  },
  nextPrayerLabel: {
    fontSize: 16,
    color: "#1E3A8A",
    marginBottom: 4,
  },
  nextPrayerName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E40AF",
  },
  nextPrayerTime: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E40AF",
  },
  prayerTimesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  prayerTimesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2563EB",
    marginBottom: 16,
  },
  prayerTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
  },
  prayerTimeItemCompleted: {
    backgroundColor: "#ECFDF5",
  },
  prayerNameText: {
    fontSize: 16,
    color: "#1E40AF",
    fontWeight: "600",
    flex: 1,
    marginLeft: 12,
  },
  prayerNameTextCompleted: {
    color: "#059669",
    textDecorationLine: "line-through",
  },
  prayerTimeText: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "500",
    marginLeft: 12,
  },
  prayerTimeTextCompleted: {
    color: "#10B981",
  },
  completedBadge: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  completedBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  motivationContainer: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    alignItems: "center",
    elevation: 2,
  },
  motivationText: {
    fontSize: 16,
    color: "#991B1B",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#2563EB",
    marginTop: 16,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});