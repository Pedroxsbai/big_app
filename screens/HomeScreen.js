import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome5, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PrayerTimesService from '../services/prayerTimesService';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [location, setLocation] = useState('جاري التحميل...');
  const [loadingPrayerTimes, setLoadingPrayerTimes] = useState(true);
  const [todayStats, setTodayStats] = useState({
    prayersCompleted: 0,
    totalPrayers: 5,
    dhikrCount: 0,
    quranPages: 0,
  });
  const [dailyGoals, setDailyGoals] = useState([
    { name: 'القرآن', completed: 0, total: 5, icon: 'book-open-variant' },
    { name: 'الصلاة', completed: 0, total: 5, icon: 'mosque' },
    { name: 'الأذكار', completed: 0, total: 10, icon: 'heart' },
    { name: 'الصدقة', completed: 0, total: 1, icon: 'hand-coin' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Load saved data
    loadSavedData();
    
    // Load prayer times (only once)
    loadPrayerTimes();
    
    return () => clearInterval(timer);
  }, []);

  // Separate useEffect for greeting based on time
  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) {
      setGreeting('صباح الخير');
    } else if (hour < 17) {
      setGreeting('مساء الخير');
    } else {
      setGreeting('مساء الخير');
    }
  }, [currentTime]);

  // Load prayer times
  const loadPrayerTimes = async () => {
    try {
      setLoadingPrayerTimes(true);
      
      // Clear any cached data to ensure fresh API call
      await PrayerTimesService.clearCachedPrayerTimes();
      
      // Always fetch fresh prayer times from API (same as CalendarScreen and SalatScreen)
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

  // Load saved data from AsyncStorage
  const loadSavedData = async () => {
    try {
      const today = new Date().toDateString();
      
      // Load streak
      const savedStreak = await AsyncStorage.getItem('currentStreak');
      if (savedStreak) {
        setCurrentStreak(parseInt(savedStreak));
      }

      // Load today's data
      const savedData = await AsyncStorage.getItem(`dailyData_${today}`);
      if (savedData) {
        const data = JSON.parse(savedData);
        setTodayStats(data.stats);
        setDailyGoals(data.goals);
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  // Save data to AsyncStorage
  const saveData = async () => {
    try {
      const today = new Date().toDateString();
      const dataToSave = {
        stats: todayStats,
        goals: dailyGoals,
      };
      await AsyncStorage.setItem(`dailyData_${today}`, JSON.stringify(dataToSave));
      await AsyncStorage.setItem('currentStreak', currentStreak.toString());
    } catch (error) {
      console.log('Error saving data:', error);
    }
  };

  // Update prayer completion
  const updatePrayerCompletion = (prayerIndex) => {
    const newStats = { ...todayStats };
    const newGoals = [...dailyGoals];
    
    if (newStats.prayersCompleted < newStats.totalPrayers) {
      newStats.prayersCompleted += 1;
      newGoals[1].completed = newStats.prayersCompleted; // الصلاة
      
      setTodayStats(newStats);
      setDailyGoals(newGoals);
      saveData();
      
      // Check if all prayers completed for streak
      if (newStats.prayersCompleted === newStats.totalPrayers) {
        updateStreak();
      }
    }
  };

  // Update dhikr count
  const updateDhikrCount = () => {
    const newStats = { ...todayStats };
    const newGoals = [...dailyGoals];
    
    newStats.dhikrCount += 1;
    if (newGoals[2].completed < newGoals[2].total) {
      newGoals[2].completed += 1; // الأذكار
    }
    
    setTodayStats(newStats);
    setDailyGoals(newGoals);
    saveData();
  };

  // Update Quran pages
  const updateQuranPages = () => {
    const newStats = { ...todayStats };
    const newGoals = [...dailyGoals];
    
    if (newGoals[0].completed < newGoals[0].total) {
      newStats.quranPages += 1;
      newGoals[0].completed += 1; // القرآن
      
      setTodayStats(newStats);
      setDailyGoals(newGoals);
      saveData();
    }
  };

  // Update streak
  const updateStreak = () => {
    setCurrentStreak(prev => {
      const newStreak = prev + 1;
      saveData();
      return newStreak;
    });
  };

  // Quick action handlers
  const handleQuickAction = (actionName) => {
    switch (actionName) {
      case 'التذكير':
        Alert.alert('التذكير', 'تم تفعيل التذكير للصلوات');
        break;
      case 'الحفظ':
        navigation.navigate('Quran');
        break;
      case 'الرقية':
        Alert.alert('الرقية', 'فتح صفحة الرقية الشرعية');
        break;
      case 'الدعاء':
        navigation.navigate('Azkar');
        break;
      case 'الكتب':
        Alert.alert('الكتب', 'فتح المكتبة الإسلامية');
        break;
      case 'تبرع':
        Alert.alert('تبرع', 'فتح صفحة التبرعات');
        break;
      case 'التقويم':
        navigation.navigate('Salat', { screen: 'Calendar' });
        break;
      case 'القبلة':
        navigation.navigate('Salat', { screen: 'Qibla' });
        break;
      case 'المنبه':
        navigation.navigate('Salat', { screen: 'Alarm' });
        break;
      case 'ثلث الليل':
        navigation.navigate('Salat', { screen: 'LastThird' });
        break;
      case 'المحفظة':
        navigation.navigate('Quran');
        break;
    }
  };

  const quickActions = [
    { name: 'التذكير', icon: 'notifications', color: '#8B5CF6' },
    { name: 'الحفظ', icon: 'book', color: '#FBBF24' },
    { name: 'الرقية', icon: 'medical', color: '#10B981' },
    { name: 'الدعاء', icon: 'chatbubbles', color: '#3B82F6' },
    { name: 'الكتب', icon: 'library', color: '#22D3EE' },
    { name: 'تبرع', icon: 'gift', color: '#EF4444' },
    { name: 'التقويم', icon: 'calendar', color: '#F59E0B' },
    { name: 'القبلة', icon: 'compass', color: '#8B5CF6' },
    { name: 'المنبه', icon: 'alarm', color: '#F59E0B' },
    { name: 'ثلث الليل', icon: 'moon', color: '#F472B6' },
    { name: 'المحفظة', icon: 'wallet', color: '#10B981' },
  ];


  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Header */}
      <LinearGradient
        colors={["#FDE68A", "#F59E0B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={styles.greeting}>{greeting}</Text>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={16} color="#FFFFFF" />
            <Text style={styles.streakText}>{currentStreak}</Text>
          </View>
        </View>
        <Text style={styles.appName}>BS_Team</Text>
        <Text style={styles.time}>{currentTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</Text>
        <Text style={styles.location}>{location}</Text>
        {nextPrayer && (
          <Text style={styles.remaining}>الصلاة القادمة: {nextPrayer.name} في {nextPrayer.remaining}</Text>
        )}
      </LinearGradient>

      {/* Today's Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>إحصائيات اليوم</Text>
        <View style={styles.statsGrid}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => updatePrayerCompletion()}
          >
            <MaterialCommunityIcons name="mosque" size={24} color="#059669" />
            <Text style={styles.statNumber}>{todayStats.prayersCompleted}/{todayStats.totalPrayers}</Text>
            <Text style={styles.statLabel}>صلاة</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => updateDhikrCount()}
          >
            <Ionicons name="heart" size={24} color="#EF4444" />
            <Text style={styles.statNumber}>{todayStats.dhikrCount}</Text>
            <Text style={styles.statLabel}>ذكر</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => updateQuranPages()}
          >
            <MaterialCommunityIcons name="book-open-variant" size={24} color="#3B82F6" />
            <Text style={styles.statNumber}>{todayStats.quranPages}</Text>
            <Text style={styles.statLabel}>صفحة</Text>
          </TouchableOpacity>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#F59E0B" />
            <Text style={styles.statNumber}>
              {Math.round(((dailyGoals.reduce((acc, goal) => acc + goal.completed, 0) / dailyGoals.reduce((acc, goal) => acc + goal.total, 0)) * 100) || 0)}%
            </Text>
            <Text style={styles.statLabel}>إنجاز</Text>
          </View>
        </View>
      </View>

      {/* Daily Goals */}
      <View style={styles.goalsContainer}>
        <Text style={styles.goalsTitle}>الأهداف اليومية</Text>
        {dailyGoals.map((goal, index) => (
          <View key={index} style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <MaterialCommunityIcons name={goal.icon} size={20} color="#78350F" />
              <Text style={styles.goalName}>{goal.name}</Text>
            </View>
            <View style={styles.goalProgress}>
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill, 
                  { width: `${(goal.completed / goal.total) * 100}%` }
                ]} />
              </View>
              <Text style={styles.goalText}>{goal.completed}/{goal.total}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickContainer}>
        {quickActions.map((action, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.quickItem}
            onPress={() => handleQuickAction(action.name)}
          >
            <Ionicons name={action.icon} size={28} color={action.color} />
            <Text style={styles.quickText}>{action.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Prayer Times */}
      <View style={styles.prayerContainer}>
        <Text style={styles.prayerTitle}>أوقات الصلاة</Text>
        {loadingPrayerTimes ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#78350F" />
            <Text style={styles.loadingText}>جاري تحميل أوقات الصلاة...</Text>
          </View>
        ) : prayerTimes ? (
          <View style={styles.prayerRow}>
            {[
              { name: 'العشاء', time: prayerTimes.Isha, icon: 'moon' },
              { name: 'المغرب', time: prayerTimes.Maghrib, icon: 'moon-outline' },
              { name: 'العصر', time: prayerTimes.Asr, icon: 'partly-sunny' },
              { name: 'الظهر', time: prayerTimes.Dhuhr, icon: 'sunny' },
              { name: 'الشروق', time: prayerTimes.Sunrise, icon: 'sunny-outline' },
              { name: 'الفجر', time: prayerTimes.Fajr, icon: 'partly-sunny-outline' },
            ].map((prayer, index) => (
              <View key={index} style={[
                styles.prayerCard, 
                nextPrayer && nextPrayer.name === prayer.name && styles.currentPrayer
              ]}>
                <Ionicons name={prayer.icon} size={20} color="#F59E0B" />
                <Text style={styles.prayerName}>{prayer.name}</Text>
                <Text style={styles.prayerTime}>{prayer.time}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>خطأ في تحميل أوقات الصلاة</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadPrayerTimes}>
              <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Motivational Quote */}
      <View style={styles.quoteContainer}>
        <MaterialCommunityIcons name="format-quote-open" size={24} color="#78350F" />
        <Text style={styles.quoteText}>
          "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا"
        </Text>
        <Text style={styles.quoteSource}>- سورة الطلاق</Text>
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
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
    color: "#78350F",
  },
  streakBadge: {
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 4,
    fontSize: 14,
  },
  appName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#78350F",
    fontFamily: "sans-serif-medium",
  },
  time: {
    fontSize: 48,
    color: "#78350F",
    fontWeight: "bold",
    marginVertical: 4,
  },
  location: {
    color: "#78350F",
    fontSize: 16,
    marginBottom: 4,
  },
  remaining: {
    color: "#92400E",
    fontSize: 14,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#78350F",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "#FFFBEB",
    width: "48%",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 12,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#78350F",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#92400E",
    marginTop: 4,
  },
  goalsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  goalsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#78350F",
    marginBottom: 16,
  },
  goalItem: {
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  goalInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  goalName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#78350F",
    marginLeft: 12,
  },
  goalProgress: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    backgroundColor: "#FEF3C7",
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    backgroundColor: "#F59E0B",
    height: 8,
    borderRadius: 4,
  },
  goalText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
    minWidth: 40,
    textAlign: "center",
  },
  quickContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingVertical: 20,
  },
  quickItem: {
    width: "28%",
    backgroundColor: "#FFF7ED",
    marginVertical: 10,
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 12,
    elevation: 2,
  },
  quickText: {
    marginTop: 8,
    color: "#78350F",
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
  },
  prayerContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  prayerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#78350F",
    marginBottom: 16,
  },
  prayerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  prayerCard: {
    backgroundColor: "#FFFBEB",
    width: "15%",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    elevation: 2,
    marginBottom: 8,
  },
  currentPrayer: {
    backgroundColor: "#FEF3C7",
    borderWidth: 2,
    borderColor: "#F59E0B",
  },
  prayerName: {
    color: "#92400E",
    fontWeight: "bold",
    marginTop: 4,
    fontSize: 10,
    textAlign: "center",
  },
  prayerTime: {
    color: "#78350F",
    fontSize: 10,
    textAlign: "center",
  },
  quoteContainer: {
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    alignItems: "center",
    elevation: 2,
  },
  quoteText: {
    fontSize: 16,
    color: "#78350F",
    textAlign: "center",
    fontStyle: "italic",
    marginVertical: 8,
    lineHeight: 24,
  },
  quoteSource: {
    fontSize: 14,
    color: "#92400E",
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#78350F",
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
    backgroundColor: "#F59E0B",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
